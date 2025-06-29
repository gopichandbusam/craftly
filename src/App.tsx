import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { loadResumeFromFirebase } from './services/optimizedFirebaseStorage';
import { trackUserAction, trackError } from './services/optimizedAnalytics';
import { initializeSecurity } from './services/securityHeaders';
import LoginPage from './components/LoginPage';
import Sidebar from './components/Sidebar';
import HomePage from './components/HomePage';
import PromptsPage from './components/PromptsPage';
import AIModelsPage from './components/AIModelsPage';
import InstructionsPage from './components/InstructionsPage';
import EditResumeData from './components/EditResumeData';
import GenerateCoverLetter from './components/GenerateCoverLetter';
import ErrorBoundary from './components/ErrorBoundary';
import { ResumeData } from './types';

type AppPage = 'home' | 'prompts' | 'ai-models' | 'instructions' | 'edit-resume' | 'generate';

function App() {
  const { user, login, signup, signInWithGoogle, logout, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<AppPage>('home');
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Initialize security
  useEffect(() => {
    initializeSecurity();
  }, []);

  useEffect(() => {
    const initializeApp = async () => {
      if (user) {
        console.log('🔄 Loading resume data...');
        
        try {
          const savedResume = await loadResumeFromFirebase();
          if (savedResume) {
            console.log('✅ Resume data loaded');
            setResumeData(savedResume);
          } else {
            console.log('📁 No saved resume found');
          }
        } catch (error) {
          console.error('❌ Error loading resume:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          trackError(errorMessage, 'App initialization');
        }
      }
    };

    initializeApp();
  }, [user]);

  const handleResumeProcessed = (data: ResumeData) => {
    console.log('📄 Resume processed');
    setResumeData(data);
    trackUserAction('resume_processed');
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
        <LoginPage onLogin={login} onSignup={signup} onGoogleSignIn={signInWithGoogle} />
      </ErrorBoundary>
    );
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage resumeData={resumeData} onResumeProcessed={handleResumeProcessed} />;
      case 'prompts':
        return <PromptsPage />;
      case 'ai-models':
        return <AIModelsPage />;
      case 'instructions':
        return <InstructionsPage />;
      case 'edit-resume':
        return <EditResumeData resumeData={resumeData} onResumeUpdate={setResumeData} />;
      case 'generate':
        return <GenerateCoverLetter resumeData={resumeData} />;
      default:
        return <HomePage resumeData={resumeData} onResumeProcessed={handleResumeProcessed} />;
    }
  };

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Sidebar
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          user={user}
          onLogout={logout}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          hasResumeData={!!resumeData}
        />
        <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
          {renderCurrentPage()}
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;