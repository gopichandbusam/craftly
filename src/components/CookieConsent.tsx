import React, { useState, useEffect } from 'react';
import { Cookie, X, Settings, Check } from 'lucide-react';

interface CookieConsentProps {
  onAccept: (preferences: CookiePreferences) => void;
}

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  performance: boolean;
  marketing: boolean;
}

const CookieConsent: React.FC<CookieConsentProps> = ({ onAccept }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    performance: false,
    marketing: false
  });

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      essential: true,
      analytics: true,
      performance: true,
      marketing: false // Keep marketing false for privacy
    };
    
    localStorage.setItem('cookie-consent', JSON.stringify(allAccepted));
    onAccept(allAccepted);
    setIsVisible(false);
  };

  const handleAcceptSelected = () => {
    localStorage.setItem('cookie-consent', JSON.stringify(preferences));
    onAccept(preferences);
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    const essentialOnly = {
      essential: true,
      analytics: false,
      performance: false,
      marketing: false
    };
    
    localStorage.setItem('cookie-consent', JSON.stringify(essentialOnly));
    onAccept(essentialOnly);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Cookie className="text-blue-500 mr-3" size={32} />
              <h2 className="text-2xl font-bold text-gray-800">Cookie Preferences</h2>
            </div>
            <button
              onClick={handleRejectAll}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Reject all cookies"
            >
              <X size={24} />
            </button>
          </div>

          <p className="text-gray-600 mb-6">
            We use cookies to enhance your experience, analyze site usage, and improve our services. 
            You can customize your cookie preferences below.
          </p>

          {!showDetails ? (
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">What we use cookies for:</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Essential functionality (login, security)</li>
                  <li>• Analytics to improve our service</li>
                  <li>• Performance optimization</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAcceptAll}
                  className="flex-1 bg-gradient-to-r from-blue-400 to-purple-400 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-500 hover:to-purple-500 transition-all duration-200 flex items-center justify-center"
                >
                  <Check size={20} className="mr-2" />
                  Accept All
                </button>
                
                <button
                  onClick={() => setShowDetails(true)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-300 transition-colors flex items-center justify-center"
                >
                  <Settings size={20} className="mr-2" />
                  Customize
                </button>
                
                <button
                  onClick={handleRejectAll}
                  className="flex-1 bg-white border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:border-gray-400 transition-colors"
                >
                  Essential Only
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-800">Essential Cookies</h3>
                    <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                      Required
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Necessary for the website to function properly. Cannot be disabled.
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-800">Analytics Cookies</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.analytics}
                        onChange={(e) => setPreferences(prev => ({ ...prev, analytics: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <p className="text-sm text-gray-600">
                    Help us understand how you use our website to improve the service.
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-800">Performance Cookies</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.performance}
                        onChange={(e) => setPreferences(prev => ({ ...prev, performance: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <p className="text-sm text-gray-600">
                    Allow us to monitor and optimize website performance.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAcceptSelected}
                  className="flex-1 bg-gradient-to-r from-blue-400 to-purple-400 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-500 hover:to-purple-500 transition-all duration-200"
                >
                  Save Preferences
                </button>
                
                <button
                  onClick={() => setShowDetails(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                >
                  Back
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 text-xs text-gray-500 text-center">
            By continuing to use our website, you agree to our{' '}
            <button className="text-blue-600 hover:underline">Privacy Policy</button>
            {' '}and{' '}
            <button className="text-blue-600 hover:underline">Terms of Service</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;