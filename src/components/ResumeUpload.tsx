import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle, AlertCircle, Loader, RefreshCw, WifiOff, Database } from 'lucide-react';
import { ResumeData } from '../types';
import { parseResumeFromText, parseResumeFromPDF } from '../services/resumeParser';
import { validateResumeData } from '../services/dataValidator';
import { uploadResumeToFirebase } from '../services/firebaseStorage';
import { saveResumeDataToFirebase, updateResumeInFirebase } from '../services/firebaseStorage';
import { 
  trackResumeUploadStart, 
  trackResumeProcessingSuccess, 
  trackResumeProcessingError,
  trackResumeEdit,
  trackFirebaseOperation,
  trackError,
  trackPerformance,
  trackFeatureUsage
} from '../services/analytics';
import ResumePreview from './ResumePreview';

interface ResumeUploadProps {
  onResumeProcessed: (data: ResumeData) => void;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ onResumeProcessed }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [previewData, setPreviewData] = useState<ResumeData | null>(null);
  const [processingStage, setProcessingStage] = useState<string>('');
  const [validationResult, setValidationResult] = useState<any>(null);
  const [isGeminiApiError, setIsGeminiApiError] = useState(false);
  const [isStorageError, setIsStorageError] = useState(false);

  const processFile = async (file: File) => {
    const startTime = Date.now();
    console.log('📁 Processing file:', file.name, 'Size:', (file.size / 1024 / 1024).toFixed(2), 'MB', 'Type:', file.type);

    // Track resume upload start
    trackResumeUploadStart({
      name: file.name,
      size: file.size,
      type: file.type
    });

    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      const error = 'Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env file.';
      trackResumeProcessingError({
        error,
        errorType: 'gemini_api',
        processingTime: (Date.now() - startTime) / 1000,
        sourceType: file.type
      });
      throw new Error(error);
    }

    if (!import.meta.env.VITE_FIREBASE_STORAGE_BUCKET) {
      const error = 'Firebase Storage is not configured. Please check your Firebase configuration.';
      setIsStorageError(true);
      trackResumeProcessingError({
        error,
        errorType: 'firebase_config',
        processingTime: (Date.now() - startTime) / 1000,
        sourceType: file.type
      });
      throw new Error(error);
    }

    setIsProcessing(true);
    setError('');
    setPreviewData(null);
    setValidationResult(null);
    setIsGeminiApiError(false);
    setIsStorageError(false);
    setProcessingStage('Uploading file to secure Firebase Storage...');

    try {
      console.log('🚀 Starting comprehensive resume processing with Firebase...');
      
      // Step 1: Upload file to Firebase Storage
      console.log('📁 Step 1: Uploading to Firebase Storage...');
      setProcessingStage('Uploading to Firebase cloud storage...');
      const fileMetadata = await uploadResumeToFirebase(file);
      console.log('✅ File uploaded to Firebase Storage successfully:', fileMetadata);

      // Step 2: Parse resume content with AI
      let resumeData: ResumeData;
      if (file.type === 'application/pdf') {
        console.log('📄 Step 2: Processing as PDF file with AI...');
        setProcessingStage('Extracting text from PDF with AI...');
        resumeData = await parseResumeFromPDF(file);
      } else {
        console.log('📝 Step 2: Processing as text file with AI...');
        setProcessingStage('Analyzing text content with AI...');
        const text = await file.text();
        resumeData = await parseResumeFromText(text);
      }
      
      setProcessingStage('Validating extracted data...');
      
      // Step 3: Validate the extracted data
      const validation = validateResumeData(resumeData);
      setValidationResult(validation);
      
      // Step 4: Save to Firebase with file reference
      setProcessingStage('Saving to Firebase with file reference...');
      
      try {
        await saveResumeDataToFirebase(resumeData, fileMetadata);
        console.log('✅ Resume data and file metadata saved to Firebase successfully');
        trackFirebaseOperation('save', 'resume', true);
      } catch (firebaseError) {
        console.warn('⚠️ Firebase save failed, continuing with localStorage:', firebaseError);
        setError(`Data saved locally - cloud sync will retry automatically: ${firebaseError instanceof Error ? firebaseError.message : 'Unknown error'}`);
        localStorage.setItem('craftly_resume', JSON.stringify(resumeData));
        localStorage.setItem('craftly_resume_file', JSON.stringify(fileMetadata));
        trackFirebaseOperation('save', 'resume', false, firebaseError instanceof Error ? firebaseError.message : 'Unknown error');
      }
      
      const processingTime = (Date.now() - startTime) / 1000;
      
      // Track successful processing
      trackResumeProcessingSuccess({
        resumeData,
        processingTime,
        validationScore: validation.score,
        sourceType: file.type
      });

      // Track performance
      trackPerformance({
        action: 'resume_processing_with_firebase',
        duration: Date.now() - startTime,
        success: true,
        additionalData: {
          file_type: file.type,
          file_size_mb: (file.size / 1024 / 1024).toFixed(2),
          validation_score: validation.score,
          firebase_storage: true
        }
      });
      
      console.log('✅ Complete resume processing pipeline completed successfully!');
      console.log('📊 FINAL RESUME DATA FOR UI:', resumeData);
      console.log('📁 FIREBASE FILE METADATA:', fileMetadata);
      console.log('📊 Validation results:', validation);
      
      setPreviewData(resumeData);
      
      // Final processing delay for better UX
      setTimeout(() => {
        setIsProcessing(false);
        setProcessingStage('');
        console.log('🎉 UI updated with processed and validated resume data + Firebase file storage');
      }, 1000);
    } catch (error) {
      console.error('❌ Error processing file:', error);
      
      const processingTime = (Date.now() - startTime) / 1000;
      let errorType: 'gemini_api' | 'firebase_storage' | 'firebase_config' | 'pdf_parsing' | 'network' | 'validation' | 'unknown' = 'unknown';
      
      // Check if it's a Firebase Storage error
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        if (errorMessage.includes('firebase storage') || 
            errorMessage.includes('storage bucket') ||
            errorMessage.includes('firebase configuration')) {
          setIsStorageError(true);
          errorType = 'firebase_storage';
        } else if (errorMessage.includes('vite_firebase') ||
            errorMessage.includes('firebase config')) {
          setIsStorageError(true);
          errorType = 'firebase_config';
        } else if (errorMessage.includes('gemini api') || 
            errorMessage.includes('gopichand busam') ||
            errorMessage.includes('api key') ||
            errorMessage.includes('google generative ai')) {
          setIsGeminiApiError(true);
          errorType = 'gemini_api';
        } else if (errorMessage.includes('pdf') || errorMessage.includes('parsing')) {
          errorType = 'pdf_parsing';
        } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
          errorType = 'network';
        } else if (errorMessage.includes('validation')) {
          errorType = 'validation';
        }
      }
      
      // Track processing error
      trackResumeProcessingError({
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType,
        processingTime,
        sourceType: file.type
      });

      // Track performance (failed)
      trackPerformance({
        action: 'resume_processing_with_firebase',
        duration: Date.now() - startTime,
        success: false,
        additionalData: {
          file_type: file.type,
          file_size_mb: (file.size / 1024 / 1024).toFixed(2),
          error_type: errorType
        }
      });
      
      throw error;
    }
  };

  const handleResumeUpdate = async (updatedData: ResumeData) => {
    console.log('🔄 Updating resume data:', updatedData);
    setPreviewData(updatedData);
    
    // Track resume edit
    trackResumeEdit('multiple', 'edit');
    
    // Save updated data to Firebase
    try {
      await updateResumeInFirebase(updatedData);
      console.log('✅ Resume data updated in Firebase successfully');
      trackFirebaseOperation('update', 'resume', true);
    } catch (error) {
      console.warn('⚠️ Firebase update failed, data saved locally:', error);
      trackFirebaseOperation('update', 'resume', false, error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploadedFile(file);

    // Track feature usage
    trackFeatureUsage('file_drop', {
      file_type: file.type,
      file_size_mb: (file.size / 1024 / 1024).toFixed(2)
    });

    try {
      await processFile(file);
    } catch (error) {
      console.error('❌ File processing failed:', error);
      setError(`Failed to process the resume: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your configuration and try again.`);
      setIsProcessing(false);
      setProcessingStage('');
      setUploadedFile(null);
      setPreviewData(null);
      setValidationResult(null);
      
      // Track error
      trackError({
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: 'file_processing',
        location: 'ResumeUpload.tsx - onDrop',
        userAction: 'file_upload'
      });
    }
  }, []);

  const handleContinue = () => {
    if (previewData) {
      console.log('➡️ Continuing to cover letter generator with validated data:', previewData);
      trackFeatureUsage('continue_to_cover_letter', {
        validation_score: validationResult?.score || 0,
        skills_count: previewData.skills.length,
        experience_count: previewData.experience.length,
        storage_backend: 'firebase'
      });
      onResumeProcessed(previewData);
    }
  };

  const handleRetry = async () => {
    if (uploadedFile) {
      console.log('🔄 Retrying file processing...');
      trackFeatureUsage('retry_processing', {
        file_type: uploadedFile.type,
        was_gemini_error: isGeminiApiError,
        was_storage_error: isStorageError
      });
      
      try {
        await processFile(uploadedFile);
      } catch (error) {
        console.error('❌ Retry failed:', error);
        setError(`Retry failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setIsProcessing(false);
        setProcessingStage('');
        
        trackError({
          error: error instanceof Error ? error.message : 'Unknown error',
          errorType: 'retry_failed',
          location: 'ResumeUpload.tsx - handleRetry',
          userAction: 'retry_processing'
        });
      }
    }
  };

  const handleReset = () => {
    setUploadedFile(null);
    setPreviewData(null);
    setError('');
    setProcessingStage('');
    setValidationResult(null);
    setIsGeminiApiError(false);
    setIsStorageError(false);
    
    trackFeatureUsage('reset_upload');
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024 // 10MB limit
  });

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-12 text-center max-w-md w-full border border-white/20">
          <div className="relative mb-6">
            <div className="animate-spin w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full mx-auto"></div>
            <Loader className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-500" size={24} />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">AI Processing Your Resume</h3>
          <p className="text-gray-600 mb-4">
            Uploading to Firebase cloud storage and analyzing with AI for comprehensive data extraction...
          </p>
          
          <div className="bg-blue-50 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-700 font-medium">{processingStage}</p>
          </div>
          
          <div className="text-sm text-gray-500 space-y-2">
            <div className="flex items-center justify-center">
              <CheckCircle size={16} className="text-green-500 mr-2" />
              <span>Document uploaded and validated</span>
            </div>
            <div className="flex items-center justify-center">
              <Database size={16} className="text-blue-500 mr-2" />
              <span>Secure file storage in Firebase</span>
            </div>
            <div className="flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-500 rounded-full animate-spin mr-2"></div>
              <span>AI analyzing and categorizing content</span>
            </div>
            <div className="flex items-center justify-center text-gray-400">
              <div className="w-4 h-4 border-2 border-gray-200 rounded-full mr-2"></div>
              <span>Saving metadata to Firestore</span>
            </div>
          </div>
          
          <div className="mt-6 text-xs text-blue-600 bg-blue-50 p-3 rounded-lg">
            <p className="font-medium mb-1">🔍 Firebase Cloud Architecture</p>
            <p>Files stored in Firebase Storage, metadata in Firestore for unified security and performance</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-12 max-w-7xl w-full border border-white/20">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Upload Your Resume</h2>
          <p className="text-gray-600 text-lg">
            Secure Firebase storage with AI-powered analysis and unified cloud architecture
          </p>
        </div>

        {error && (
          <div className={`mb-6 p-4 border rounded-2xl flex items-start ${
            isGeminiApiError 
              ? 'bg-orange-50 border-orange-200 text-orange-700' 
              : isStorageError
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            {isGeminiApiError ? (
              <WifiOff size={20} className="mr-3 flex-shrink-0 mt-0.5" />
            ) : isStorageError ? (
              <Database size={20} className="mr-3 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle size={20} className="mr-3 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className="font-medium mb-1">
                {isGeminiApiError ? 'Gemini AI Service Issue' : 
                 isStorageError ? 'Firebase Storage Issue' : 
                 'Processing Error'}
              </p>
              <p className="text-sm">{error}</p>
              <div className="mt-3 flex space-x-2">
                {uploadedFile && (
                  <button
                    onClick={handleRetry}
                    className={`text-sm px-3 py-1 rounded-lg transition-colors flex items-center ${
                      isGeminiApiError 
                        ? 'bg-orange-100 hover:bg-orange-200' 
                        : isStorageError
                        ? 'bg-red-100 hover:bg-red-200'
                        : 'bg-red-100 hover:bg-red-200'
                    }`}
                  >
                    <RefreshCw size={14} className="mr-1" />
                    {isGeminiApiError ? 'Retry When Fixed' : 
                     isStorageError ? 'Retry Upload' : 
                     'Retry Processing'}
                  </button>
                )}
                <button
                  onClick={handleReset}
                  className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-lg transition-colors"
                >
                  Upload Different File
                </button>
              </div>
              
              {isGeminiApiError && (
                <div className="mt-3 p-3 bg-orange-100 rounded-lg">
                  <p className="text-xs text-orange-800 font-medium">🤖 Service Status</p>
                  <p className="text-xs text-orange-700 mt-1">
                    The Gemini AI service is currently experiencing issues. 
                    Please wait for Gopichand Busam to resolve this, or try again later.
                  </p>
                </div>
              )}
              
              {isStorageError && (
                <div className="mt-3 p-3 bg-red-100 rounded-lg">
                  <p className="text-xs text-red-800 font-medium">🔥 Firebase Storage</p>
                  <p className="text-xs text-red-700 mt-1">
                    Firebase Storage is not properly configured. Files are being stored locally as backup.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {validationResult && validationResult.score < 70 && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl">
            <div className="flex items-start">
              <AlertCircle size={20} className="text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800 mb-1">Data Quality Notice</p>
                <p className="text-sm text-yellow-700 mb-2">
                  Some information may not have been extracted perfectly (Quality Score: {validationResult.score}/100)
                </p>
                {validationResult.suggestions.length > 0 && (
                  <ul className="text-xs text-yellow-600 space-y-1">
                    {validationResult.suggestions.map((suggestion: string, index: number) => (
                      <li key={index}>• {suggestion}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Area */}
          <div>
            <div
              {...getRootProps()}
              className={`border-3 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all duration-300 ${
                isDragActive
                  ? 'border-blue-400 bg-blue-50/50 scale-105'
                  : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50/30'
              } ${uploadedFile ? 'border-green-400 bg-green-50/30' : ''}`}
            >
              <input {...getInputProps()} />
              
              <div className="space-y-4">
                <div className="flex justify-center">
                  {uploadedFile ? (
                    <CheckCircle size={48} className="text-green-400" />
                  ) : (
                    <Upload size={48} className="text-blue-400" />
                  )}
                </div>
                
                {uploadedFile ? (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">File Ready for Processing</h3>
                    <p className="text-gray-600 font-medium">{uploadedFile.name}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Size: {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <p className="text-xs text-green-600 mt-2">✓ File validated and processed successfully</p>
                    {validationResult && (
                      <p className="text-xs text-blue-600 mt-1">
                        Quality Score: {validationResult.score}/100 | Stored in Firebase
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume'}
                    </h3>
                    <p className="text-gray-600 mb-2">
                      or click to browse files
                    </p>
                    <p className="text-sm text-gray-500">
                      Supports PDF, DOC, DOCX, and TXT files (max 10MB)
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <Database size={16} />
                <span>Unified Firebase cloud architecture with secure file storage</span>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Firebase Cloud Architecture:</h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                  <div>• Firebase Storage</div>
                  <div>• Firestore database</div>
                  <div>• Firebase Authentication</div>
                  <div>• Real-time validation</div>
                  <div>• Automatic backups</div>
                  <div>• Cross-platform sync</div>
                  <div>• Unified security</div>
                  <div>• Google Cloud reliability</div>
                </div>
              </div>
              
              <div className="text-center text-xs text-blue-600 bg-blue-50 p-3 rounded-lg">
                <p className="font-medium mb-1">🔒 Unified Firebase Security</p>
                <p>Files and metadata stored in Firebase ecosystem for maximum reliability and security</p>
              </div>
            </div>
          </div>

          {/* Preview Area */}
          {previewData ? (
            <ResumePreview 
              resumeData={previewData} 
              onResumeUpdate={handleResumeUpdate}
              onContinue={handleContinue}
              validationResult={validationResult}
            />
          ) : (
            <div className="bg-gray-50/50 rounded-2xl p-6 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <FileText size={64} className="mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">Firebase Cloud Resume Analysis</h3>
                <p className="text-lg mb-4">Upload a resume to see intelligent extraction with secure Firebase storage</p>
                <div className="space-y-2 text-sm">
                  <p>🤖 Advanced AI parsing technology</p>
                  <p>📊 Intelligent data categorization</p>
                  <p>✅ Real-time quality validation</p>
                  <p>🔄 Error recovery and fallback systems</p>
                  <p>📈 Data quality scoring</p>
                  <p>🔥 Firebase secure file storage</p>
                  <p>☁️ Firestore metadata synchronization</p>
                  <p>✏️ In-place content editing</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeUpload;