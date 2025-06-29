import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Settings } from 'lucide-react';
import { trackError } from '../services/optimizedAnalytics';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isConfigError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    isConfigError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    const isConfigError = error.message.includes('auth/invalid-api-key') || 
                         error.message.includes('Firebase') ||
                         error.message.includes('invalid-api-key');
    
    return { 
      hasError: true, 
      error, 
      errorInfo: null,
      isConfigError
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('❌ Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Track error in analytics
    trackError({
      error: error.message,
      errorType: 'uncaught_exception',
      location: 'ErrorBoundary',
      userAction: 'component_render'
    });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Show configuration error screen
      if (this.state.isConfigError) {
        return (
          <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center p-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-12 text-center max-w-2xl w-full border border-white/20">
              <div className="mb-6">
                <Settings size={64} className="text-orange-400 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-gray-800 mb-4">Configuration Error</h1>
                <p className="text-gray-600 mb-6">
                  The application is not properly configured for production. Firebase environment variables are missing or invalid.
                </p>
                
                <div className="bg-orange-50 rounded-lg p-6 text-left mb-6">
                  <h3 className="font-semibold text-orange-800 mb-3">Required Environment Variables:</h3>
                  <div className="text-sm text-orange-700 space-y-2 font-mono">
                    <div>VITE_FIREBASE_API_KEY</div>
                    <div>VITE_FIREBASE_AUTH_DOMAIN</div>
                    <div>VITE_FIREBASE_PROJECT_ID</div>
                    <div>VITE_FIREBASE_STORAGE_BUCKET</div>
                    <div>VITE_FIREBASE_MESSAGING_SENDER_ID</div>
                    <div>VITE_FIREBASE_APP_ID</div>
                    <div>VITE_FIREBASE_MEASUREMENT_ID</div>
                    <div>VITE_GEMINI_API_KEY</div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-6 text-left">
                  <h3 className="font-semibold text-blue-800 mb-3">To fix this issue:</h3>
                  <ol className="text-sm text-blue-700 space-y-2 list-decimal list-inside">
                    <li>Go to your <a href="https://app.netlify.com" target="_blank" rel="noopener noreferrer" className="underline">Netlify Dashboard</a></li>
                    <li>Select your site (craftly-ai-resume)</li>
                    <li>Go to Site settings → Environment variables</li>
                    <li>Add all the required environment variables listed above</li>
                    <li>Redeploy your site</li>
                  </ol>
                </div>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={this.handleReload}
                  className="w-full bg-gradient-to-r from-orange-400 to-red-400 text-white py-4 rounded-2xl font-semibold hover:from-orange-500 hover:to-red-500 transform hover:scale-[1.02] transition-all duration-200 shadow-lg flex items-center justify-center"
                >
                  <RefreshCw size={20} className="mr-2" />
                  Retry After Configuration
                </button>
              </div>
              
              <div className="mt-6 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                <p><strong>Error Details:</strong></p>
                <p className="font-mono">{this.state.error?.message}</p>
              </div>
            </div>
          </div>
        );
      }

      // Show general error screen
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-12 text-center max-w-md w-full border border-white/20">
            <div className="mb-6">
              <AlertTriangle size={64} className="text-red-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-800 mb-4">Something Went Wrong</h1>
              <p className="text-gray-600 mb-4">
                We're sorry, but something unexpected happened. This has been reported to our team.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 p-4 bg-red-50 rounded-lg text-left">
                  <summary className="cursor-pointer text-red-700 font-medium mb-2">
                    Error Details (Development Only)
                  </summary>
                  <div className="text-xs text-red-600 font-mono">
                    <p className="mb-2"><strong>Error:</strong> {this.state.error.message}</p>
                    <p className="mb-2"><strong>Stack:</strong></p>
                    <pre className="whitespace-pre-wrap text-xs">
                      {this.state.error.stack}
                    </pre>
                    {this.state.errorInfo && (
                      <>
                        <p className="mb-2 mt-4"><strong>Component Stack:</strong></p>
                        <pre className="whitespace-pre-wrap text-xs">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </>
                    )}
                  </div>
                </details>
              )}
            </div>
            
            <div className="space-y-3">
              <button
                onClick={this.handleReload}
                className="w-full bg-gradient-to-r from-blue-400 to-purple-400 text-white py-4 rounded-2xl font-semibold hover:from-blue-500 hover:to-purple-500 transform hover:scale-[1.02] transition-all duration-200 shadow-lg flex items-center justify-center"
              >
                <RefreshCw size={20} className="mr-2" />
                Reload Page
              </button>
              
              <button
                onClick={this.handleHome}
                className="w-full bg-gray-200 text-gray-700 py-3 rounded-2xl font-medium hover:bg-gray-300 transition-all duration-200 flex items-center justify-center"
              >
                <Home size={20} className="mr-2" />
                Go to Homepage
              </button>
            </div>
            
            <div className="mt-6 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
              <p><strong>What happened?</strong></p>
              <p>An unexpected error occurred in the application. Our team has been notified and will investigate.</p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;