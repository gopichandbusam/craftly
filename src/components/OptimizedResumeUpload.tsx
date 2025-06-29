import React, { useCallback, useState, memo } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { ResumeData } from '../types';
import { parseResumeFromText, parseResumeFromPDF } from '../services/resumeParser';
import { saveResumeToFirebase } from '../services/optimizedFirebaseStorage';
import { trackResumeFlow, trackError } from '../services/optimizedAnalytics';

interface OptimizedResumeUploadProps {
  onResumeProcessed: (data: ResumeData) => void;
}

const OptimizedResumeUpload: React.FC<OptimizedResumeUploadProps> = memo(({ onResumeProcessed }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [processingStage, setProcessingStage] = useState<string>('');

  const processFile = async (file: File) => {
    const startTime = Date.now();
    
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      throw new Error('AI processing not configured');
    }

    setIsProcessing(true);
    setError('');
    setProcessingStage('Processing with AI...');

    try {
      trackResumeFlow('upload', { 
        size: file.size, 
        type: file.type 
      });

      let resumeData: ResumeData;
      
      if (file.type === 'application/pdf') {
        setProcessingStage('Extracting text from PDF...');
        resumeData = await parseResumeFromPDF(file);
      } else {
        setProcessingStage('Analyzing text content...');
        const text = await file.text();
        resumeData = await parseResumeFromText(text);
      }
      
      setProcessingStage('Saving data...');
      
      // Save to optimized storage
      await saveResumeToFirebase(resumeData);
      
      const processingTime = Date.now() - startTime;
      
      trackResumeFlow('process', {
        duration: processingTime,
        success: true
      });
      
      console.log('✅ Resume processing completed');
      onResumeProcessed(resumeData);
      
      setTimeout(() => {
        setIsProcessing(false);
        setProcessingStage('');
      }, 500);
    } catch (error) {
      console.error('❌ Processing failed:', error);
      trackError(error instanceof Error ? error.message : 'Unknown error', 'ResumeUpload');
      setError(`Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsProcessing(false);
      setProcessingStage('');
      throw error;
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploadedFile(file);

    try {
      await processFile(file);
    } catch (error) {
      setUploadedFile(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024
  });

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-12 text-center max-w-md w-full">
          <Loader className="animate-spin w-16 h-16 text-blue-500 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Processing Resume</h3>
          <p className="text-gray-600 mb-4">AI is analyzing your resume...</p>
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-sm text-blue-700">{processingStage}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-12 max-w-4xl w-full">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Upload Your Resume</h2>
          <p className="text-gray-600 text-lg">AI-powered analysis with optimized cloud storage</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            <AlertCircle size={20} className="inline mr-2" />
            {error}
          </div>
        )}

        <div
          {...getRootProps()}
          className={`border-3 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-300 ${
            isDragActive
              ? 'border-blue-400 bg-blue-50/50 scale-105'
              : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50/30'
          } ${uploadedFile ? 'border-green-400 bg-green-50/30' : ''}`}
        >
          <input {...getInputProps()} />
          
          <div className="space-y-4">
            <div className="flex justify-center">
              {uploadedFile ? (
                <CheckCircle size={64} className="text-green-400" />
              ) : (
                <Upload size={64} className="text-blue-400" />
              )}
            </div>
            
            {uploadedFile ? (
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">File Processed</h3>
                <p className="text-gray-600">{uploadedFile.name}</p>
                <p className="text-sm text-green-600 mt-2">✓ Ready for cover letter generation</p>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume'}
                </h3>
                <p className="text-gray-600 mb-2">or click to browse files</p>
                <p className="text-sm text-gray-500">PDF, DOC, DOCX, TXT (max 10MB)</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="bg-blue-50 rounded-xl p-4 inline-block">
            <h4 className="font-semibold text-gray-800 mb-2">Optimized Processing:</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• Fast local processing with AI analysis</p>
              <p>• Smart cloud storage with caching</p>
              <p>• Reduced server costs and faster access</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

OptimizedResumeUpload.displayName = 'OptimizedResumeUpload';

export default OptimizedResumeUpload;