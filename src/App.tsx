import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { loadResumeFromFirebase } from './services/firebaseStorage';
import { trackPageView, trackError } from './services/analytics';
import { usePerformanceMonitoring } from './hooks/usePerformanceMonitoring';
import { initializeSecurity } from './services/securityHeaders';
import { registerServiceWorker, setupOfflineDetection } from './services/offlineSupport';
import AnimatedLogo from './components/AnimatedLogo';
import LoginForm from './components/LoginForm';
import ResumeUpload from './components/ResumeUpload';
import CoverLetterGenerator from './components/CoverLetterGenerator';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import ErrorBoundary from './components/ErrorBoundary';
import CookieConsent from './components/CookieConsent';
import { AccessibilityProvider } from './components/AccessibilityProvider';
import { ResumeData } from './types';
import { LogOut, AlertCircle, Upload, Shield, FileText, Users } from 'lucide-react';

type AppState = 'login' | 'upload' | 'generate' | 'no-data' | 'privacy' | 'terms';

function App() {
  const { user, login, signup, signInWithGoogle, logout, loading } = useAuth();
  const [currentState, setCurrentState] = useState<AppState>('login');
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [dataLoadError, setDataLoadError] = useState<string>('');
  const [cookiePreferences, setCookiePreferences] = useState<any>(null);

  // Initialize performance monitoring
  usePerformanceMonitoring();

  // Initialize app security and offline support
  useEffect(() => {
    initializeSecurity();
    registerServiceWorker();
    setupOfflineDetection();
  }, []);

  // Track page views when state changes
  useEffect(() => {
    trackPageView(currentState);
  }, [currentState]);

  useEffect(() => {
    const initializeApp = async () => {
      if (user) {
        console.log('🔄 User authenticated, loading resume data...');
        setDataLoadError('');
        
        try {
          const savedResume = await loadResumeFromFirebase();
          if (savedResume) {
            console.log('✅ Resume data loaded from Firebase:', savedResume);
            setResumeData(savedResume);
            setCurrentState('generate');
          } else {
            console.log('📁 No saved resume found, showing upload screen');
            setCurrentState('upload');
          }
        } catch (error) {
          console.error('❌ Error loading resume data:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          setDataLoadError(errorMessage);
          setCurrentState('no-data');
          
          // Track error
          trackError({
            error: errorMessage,
            errorType: 'data_load',
            location: 'App.tsx - initializeApp',
            userAction: 'loading_saved_data'
          });
        }
      } else {
        setCurrentState('login');
      }
    };

    initializeApp();
  }, [user]);

  const handleResumeProcessed = (data: ResumeData) => {
    console.log('📄 Resume processed, setting state:', data);
    setResumeData(data);
    setDataLoadError('');
    setCurrentState('generate');
  };

  const handleBackToUpload = () => {
    setCurrentState('upload');
    setResumeData(null);
    setDataLoadError('');
    localStorage.removeItem('craftly_resume');
    localStorage.removeItem('craftly_application');
    localStorage.removeItem('craftly_resume_id');
    localStorage.removeItem('craftly_application_id');
    localStorage.removeItem('craftly_custom_prompt');
  };

  const handleRetryDataLoad = async () => {
    if (user) {
      console.log('🔄 Retrying data load...');
      setDataLoadError('');
      
      try {
        const savedResume = await loadResumeFromFirebase();
        if (savedResume) {
          console.log('✅ Resume data loaded on retry:', savedResume);
          setResumeData(savedResume);
          setCurrentState('generate');
        } else {
          console.log('📁 Still no saved resume found, showing upload screen');
          setCurrentState('upload');
        }
      } catch (error) {
        console.error('❌ Retry failed:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        setDataLoadError(errorMessage);
        setCurrentState('upload');
        
        // Track retry failure
        trackError({
          error: errorMessage,
          errorType: 'data_load_retry',
          location: 'App.tsx - handleRetryDataLoad',
          userAction: 'retry_data_load'
        });
      }
    }
  };

  const handleCookieConsent = (preferences: any) => {
    setCookiePreferences(preferences);
    
    // Initialize analytics based on consent
    if (preferences.analytics) {
      // Analytics already initialized, this just confirms consent
      console.log('✅ Analytics consent granted');
    }
    
    if (preferences.performance) {
      // Initialize performance monitoring
      console.log('✅ Performance monitoring consent granted');
    }
  };

  if (loading) {
    return (
      <AccessibilityProvider>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-12 text-center border border-white/20">
            <div className="animate-spin w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Craftly AI</h3>
            <p className="text-gray-600">Initializing your workspace and loading saved data...</p>
          </div>
        </div>
      </AccessibilityProvider>
    );
  }

  // Privacy Policy page
  if (currentState === 'privacy') {
    return (
      <AccessibilityProvider>
        <ErrorBoundary>
          <PrivacyPolicy onBack={() => setCurrentState(user ? 'generate' : 'login')} />
        </ErrorBoundary>
      </AccessibilityProvider>
    );
  }

  // Terms of Service page
  if (currentState === 'terms') {
    return (
      <AccessibilityProvider>
        <ErrorBoundary>
          <TermsOfService onBack={() => setCurrentState(user ? 'generate' : 'login')} />
        </ErrorBoundary>
      </AccessibilityProvider>
    );
  }

  if (!user) {
    return (
      <AccessibilityProvider>
        <ErrorBoundary>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
            <div className="max-w-6xl mx-auto">
              {/* Header */}
              <div className="text-center py-8">
                <h1 className="text-5xl font-bold text-gray-800 mb-4">
                  Craft<span className="text-blue-500">ly</span>
                </h1>
                <p className="text-xl text-gray-600">AI-Powered Resume & Cover Letter Generator</p>
              </div>

              {/* Main Content */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[70vh]">
                {/* Left Column - Animation */}
                <div className="flex flex-col items-center justify-center space-y-8">
                  <AnimatedLogo />
                  <div className="text-center max-w-md">
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">
                      Create Perfect One-Page Cover Letters
                    </h2>
                    <p className="text-gray-600 text-lg">
                      Upload your resume and let AI generate personalized one-page cover letters 
                      tailored to any job description. Link multiple accounts for secure access.
                    </p>
                  </div>
                </div>

                {/* Right Column - Login Form */}
                <div className="flex justify-center">
                  <LoginForm onLogin={login} onSignup={signup} onGoogleSignIn={signInWithGoogle} />
                </div>
              </div>

              {/* Footer Links */}
              <div className="text-center mt-12">
                <div className="flex justify-center space-x-6 text-sm text-gray-500">
                  <button
                    onClick={() => setCurrentState('privacy')}
                    className="hover:text-gray-700 transition-colors flex items-center"
                  >
                    <Shield size={16} className="mr-1" />
                    Privacy Policy
                  </button>
                  <button
                    onClick={() => setCurrentState('terms')}
                    className="hover:text-gray-700 transition-colors flex items-center"
                  >
                    <FileText size={16} className="mr-1" />
                    Terms of Service
                  </button>
                </div>
              </div>
            </div>

            {/* Cookie Consent */}
            {!cookiePreferences && (
              <CookieConsent onAccept={handleCookieConsent} />
            )}
          </div>
        </ErrorBoundary>
      </AccessibilityProvider>
    );
  }

  // No Data Error State
  if (currentState === 'no-data') {
    return (
      <AccessibilityProvider>
        <ErrorBoundary>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-12 text-center max-w-md w-full border border-white/20">
              <div className="mb-6">
                <AlertCircle size={64} className="text-orange-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-4">No Resume Data Found</h3>
                <div className="space-y-3 text-gray-600">
                  <p>We couldn't find your resume data in our cloud storage or local backup.</p>
                  {dataLoadError && (
                    <div className="text-sm bg-red-50 border border-red-200 rounded-lg p-3 text-red-700">
                      <strong>Error:</strong> {dataLoadError}
                    </div>
                  )}
                  <p className="text-sm">To continue using Craftly AI, please upload your resume again.</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => setCurrentState('upload')}
                  className="w-full bg-gradient-to-r from-blue-400 to-purple-400 text-white py-4 rounded-2xl font-semibold hover:from-blue-500 hover:to-purple-500 transform hover:scale-[1.02] transition-all duration-200 shadow-lg flex items-center justify-center"
                >
                  <Upload size={20} className="mr-2" />
                  Upload Resume Again
                </button>
                
                <button
                  onClick={handleRetryDataLoad}
                  className="w-full bg-gray-200 text-gray-700 py-3 rounded-2xl font-medium hover:bg-gray-300 transition-all duration-200"
                >
                  Retry Loading Data
                </button>
              </div>
              
              <div className="mt-6 text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
                <p><strong>What happened?</strong></p>
                <p>Your data might have been cleared, or there was a connection issue. Re-uploading will restore your profile.</p>
              </div>
            </div>
          </div>
        </ErrorBoundary>
      </AccessibilityProvider>
    );
  }

  return (
    <AccessibilityProvider>
      <ErrorBoundary>
        <div className="relative">
          {/* User Info & Logout Button */}
          <div className="absolute top-6 right-6 z-10 flex items-center space-x-4">
            <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-white/20 flex items-center">
              <span className="text-sm text-gray-600 mr-2">Welcome, </span>
              <span className="text-sm font-semibold text-gray-800">{user.name}</span>
              {user.linkedProviders && user.linkedProviders.length > 1 && (
                <Users size={14} className="ml-2 text-green-500" title="Multiple accounts linked" />
              )}
            </div>
            <button
              onClick={logout}
              className="bg-white/80 backdrop-blur-sm text-gray-600 hover:text-gray-800 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 border border-white/20"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>

          {/* Main Content */}
          {currentState === 'upload' && (
            <ResumeUpload onResumeProcessed={handleResumeProcessed} />
          )}
          
          {currentState === 'generate' && resumeData && (
            <CoverLetterGenerator 
              resumeData={resumeData} 
              onBack={handleBackToUpload}
              onNoDataFound={() => setCurrentState('no-data')}
            />
          )}

          {/* Cookie Consent */}
          {!cookiePreferences && (
            <CookieConsent onAccept={handleCookieConsent} />
          )}
        </div>
      </ErrorBoundary>
    </AccessibilityProvider>
  );
}

export default App;