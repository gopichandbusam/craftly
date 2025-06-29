import React, { useCallback, useState, memo } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle, AlertCircle, Loader, Sparkles } from 'lucide-react';
import { ResumeData } from '../types';
import { parseResumeFromText, parseResumeFromPDF } from '../services/resumeParser';
import { saveResumeToSupabase } from '../services/supabaseStorage';
import { trackResumeFlow, trackError } from '../services/optimizedAnalytics';

interface HomePageProps {
  resumeData: ResumeData | null;
  onResumeProcessed: (data: ResumeData) => void;
}

const HomePage: React.FC<HomePageProps> = memo(({ resumeData, onResumeProcessed }) => {
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
      
      setProcessingStage('Saving to Supabase...');
      
      // Save to Supabase storage with file
      await saveResumeToSupabase(resumeData, file);
      
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
      <div className="flex items-center justify-center min-h-screen p-6">
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
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome to Craftly AI</h1>
          <p className="text-gray-600 text-lg">Upload your resume to get started with AI-powered cover letter generation</p>
        </div>

        {resumeData ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8">
            <div className="flex items-center mb-6">
              <CheckCircle className="text-green-500 mr-3" size={32} />
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Resume Loaded</h2>
                <p className="text-gray-600">Stored securely in Supabase</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="font-semibold text-gray-800 mb-3">Personal Information</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Name:</span> {resumeData.name}</p>
                  <p><span className="font-medium">Email:</span> {resumeData.email}</p>
                  <p><span className="font-medium">Phone:</span> {resumeData.phone}</p>
                  <p><span className="font-medium">Location:</span> {resumeData.location}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="font-semibold text-gray-800 mb-3">Summary</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Skills:</span> {resumeData.skills.length} found</p>
                  <p><span className="font-medium">Experience:</span> {resumeData.experience.length} entries</p>
                  <p><span className="font-medium">Education:</span> {resumeData.education.length} entries</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex space-x-4">
              <button
                onClick={() => setUploadedFile(null)}
                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-300 transition-colors"
              >
                Upload New Resume
              </button>
            </div>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                <AlertCircle size={20} className="inline mr-2" />
                {error}
              </div>
            )}

            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8">
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
                        {isDragActive ? 'Drop your resume here' : 'Upload Your Resume'}
                      </h3>
                      <p className="text-gray-600 mb-2">Drag & drop or click to browse files</p>
                      <p className="text-sm text-gray-500">PDF, DOC, DOCX, TXT (max 10MB)</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 text-center">
                <div className="bg-blue-50 rounded-xl p-4 inline-block">
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center justify-center">
                    <Sparkles className="mr-2 text-blue-500" size={20} />
                    Powered by Supabase
                  </h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>• Secure file storage in Supabase Storage</p>
                    <p>• Fast AI processing with data persistence</p>
                    <p>• Your data, your control, your hosting</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
});

HomePage.displayName = 'HomePage';

export default HomePage;