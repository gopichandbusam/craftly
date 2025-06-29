import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { loadResumeFromFirebase } from './services/optimizedFirebaseStorage';
import { trackUserAction, trackError } from './services/optimizedAnalytics';
import { initializeSecurity } from './services/securityHeaders';
import LoginForm from './components/LoginForm';
import OptimizedResumeUpload from './components/OptimizedResumeUpload';
import OptimizedCoverLetterGenerator from './components/OptimizedCoverLetterGenerator';
import ErrorBoundary from './components/ErrorBoundary';
import { ResumeData } from './types';
import { LogOut, AlertCircle, Upload } from 'lucide-react';

type AppState = 'login' | 'upload' | 'generate' | 'no-data';

function App() {
  const { user, login, signup, signInWithGoogle, logout, loading } = useAuth();
  const [currentState, setCurrentState] = useState<AppState>('login');
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [dataLoadError, setDataLoadError] = useState<string>('');

  // Initialize security
  useEffect(() => {
    initializeSecurity();
  }, []);

  useEffect(() => {
    const initializeApp = async () => {
      if (user) {
        console.log('🔄 Loading resume data...');
        setDataLoadError('');
        
        try {
          const savedResume = await loadResumeFromFirebase();
          if (savedResume) {
            console.log('✅ Resume data loaded');
            setResumeData(savedResume);
            setCurrentState('generate');
          } else {
            console.log('📁 No saved resume found');
            setCurrentState('upload');
          }
        } catch (error) {
          console.error('❌ Error loading resume:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          setDataLoadError(errorMessage);
          setCurrentState('no-data');
          trackError(errorMessage, 'App initialization');
        }
      } else {
        setCurrentState('login');
      }
    };

    initializeApp();
  }, [user]);

  const handleResumeProcessed = (data: ResumeData) => {
    console.log('📄 Resume processed');
    setResumeData(data);
    setDataLoadError('');
    setCurrentState('generate');
    trackUserAction('resume_processed');
  };

  const handleBackToUpload = () => {
    setCurrentState('upload');
    setResumeData(null);
    setDataLoadError('');
    trackUserAction('back_to_upload');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-12 text-center">
          <div className="animate-spin w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Craftly AI</h3>
          <p className="text-gray-600">Initializing your workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center py-8">
              <h1 className="text-5xl font-bold text-gray-800 mb-4">
                Craft<span className="text-blue-500">ly</span>
              </h1>
              <p className="text-xl text-gray-600">AI-Powered Resume & Cover Letter Generator</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[70vh]">
              <div className="flex flex-col items-center justify-center space-y-8">
                <div className="text-center max-w-md">
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">
                    Create Perfect Cover Letters
                  </h2>
                  <p className="text-gray-600 text-lg">
                    Upload your resume and let AI generate personalized cover letters 
                    tailored to any job description in seconds.
                  </p>
                </div>
              </div>

              <div className="flex justify-center">
                <LoginForm onLogin={login} onSignup={signup} onGoogleSignIn={signInWithGoogle} />
              </div>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  // No Data Error State
  if (currentState === 'no-data') {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-12 text-center max-w-md w-full">
            <AlertCircle size={64} className="text-orange-400 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-800 mb-4">No Resume Data Found</h3>
            <div className="space-y-3 text-gray-600 mb-6">
              <p>We couldn't find your resume data.</p>
              {dataLoadError && (
                <div className="text-sm bg-red-50 border border-red-200 rounded-lg p-3 text-red-700">
                  <strong>Error:</strong> {dataLoadError}
                </div>
              )}
              <p className="text-sm">Please upload your resume to continue.</p>
            </div>
            
            <button
              onClick={() => setCurrentState('upload')}
              className="w-full bg-gradient-to-r from-blue-400 to-purple-400 text-white py-4 rounded-2xl font-semibold hover:from-blue-500 hover:to-purple-500 transform hover:scale-[1.02] transition-all duration-200 shadow-lg flex items-center justify-center"
            >
              <Upload size={20} className="mr-2" />
              Upload Resume
            </button>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="relative">
        {/* User Info & Logout */}
        <div className="absolute top-6 right-6 z-10 flex items-center space-x-4">
          <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
            <span className="text-sm text-gray-600">Welcome, </span>
            <span className="text-sm font-semibold text-gray-800">{user.name}</span>
          </div>
          <button
            onClick={() => {
              trackUserAction('logout');
              logout();
            }}
            className="bg-white/80 backdrop-blur-sm text-gray-600 hover:text-gray-800 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>

        {/* Main Content */}
        {currentState === 'upload' && (
          <OptimizedResumeUpload onResumeProcessed={handleResumeProcessed} />
        )}
        
        {currentState === 'generate' && resumeData && (
          <OptimizedCoverLetterGenerator 
            resumeData={resumeData} 
            onBack={handleBackToUpload}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;