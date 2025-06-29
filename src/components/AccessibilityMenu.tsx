import React, { useState } from 'react';
import { Settings, Moon, Sun, Type, Contrast, Zap } from 'lucide-react';
import { useAccessibility } from './AccessibilityProvider';

const AccessibilityMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    highContrast, 
    reducedMotion, 
    fontSize, 
    toggleHighContrast, 
    toggleReducedMotion, 
    setFontSize 
  } = useAccessibility();

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2"
        aria-label="Accessibility Settings"
        aria-expanded={isOpen}
      >
        <Settings size={20} />
      </button>

      {isOpen && (
        <div className="absolute bottom-16 left-0 bg-white rounded-2xl shadow-xl border border-gray-200 p-4 w-64 min-w-max">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Accessibility Settings</h3>
          
          <div className="space-y-4">
            {/* High Contrast Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Contrast size={16} className="mr-2 text-gray-600" />
                <span className="text-sm text-gray-700">High Contrast</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={highContrast}
                  onChange={toggleHighContrast}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Reduced Motion Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Zap size={16} className="mr-2 text-gray-600" />
                <span className="text-sm text-gray-700">Reduce Motion</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={reducedMotion}
                  onChange={toggleReducedMotion}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Font Size Controls */}
            <div>
              <div className="flex items-center mb-2">
                <Type size={16} className="mr-2 text-gray-600" />
                <span className="text-sm text-gray-700">Font Size</span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setFontSize('small')}
                  className={`px-3 py-1 text-xs rounded transition-colors ${
                    fontSize === 'small' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Small
                </button>
                <button
                  onClick={() => setFontSize('medium')}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    fontSize === 'medium' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Medium
                </button>
                <button
                  onClick={() => setFontSize('large')}
                  className={`px-3 py-1 text-base rounded transition-colors ${
                    fontSize === 'large' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Large
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              These settings are saved locally and will persist across sessions.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessibilityMenu;