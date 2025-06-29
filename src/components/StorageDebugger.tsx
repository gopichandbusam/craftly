import React, { useState, useEffect } from 'react';
import { Database, Clock, HardDrive, Trash2, RefreshCw, Info } from 'lucide-react';
import { DeviceStorage, STORAGE_KEYS } from '../services/deviceStorage';
import { getStorageAnalytics } from '../services/firebaseStorage';

interface StorageDebuggerProps {
  isVisible: boolean;
  onClose: () => void;
}

const StorageDebugger: React.FC<StorageDebuggerProps> = ({ isVisible, onClose }) => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const refreshAnalytics = () => {
    setLoading(true);
    setTimeout(() => {
      const data = getStorageAnalytics();
      setAnalytics(data);
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    if (isVisible) {
      refreshAnalytics();
    }
  }, [isVisible]);

  const handleCleanup = () => {
    DeviceStorage.cleanupExpired();
    refreshAnalytics();
  };

  const handleClearAll = () => {
    if (confirm('Clear all Craftly data from device storage? This cannot be undone.')) {
      DeviceStorage.clearAllCraftlyData();
      refreshAnalytics();
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Database className="text-blue-500 mr-3" size={24} />
              <h2 className="text-2xl font-bold text-gray-800">Storage Debugger</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="animate-spin text-blue-500 mr-2" size={20} />
              <span>Loading storage analytics...</span>
            </div>
          ) : analytics ? (
            <div className="space-y-6">
              {/* Overall Storage Usage */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <HardDrive size={16} className="mr-2" />
                  Device Storage Overview
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Total Usage:</span>
                    <span className="ml-2 font-mono">{analytics.deviceStorage.totalUsage}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Craftly Items:</span>
                    <span className="ml-2 font-mono">{analytics.deviceStorage.craftlyItems}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">Craftly Size:</span>
                    <span className="ml-2 font-mono">{analytics.deviceStorage.craftlySize}</span>
                  </div>
                </div>
              </div>

              {/* Resume Storage */}
              <div className="bg-blue-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <Database size={16} className="mr-2 text-blue-600" />
                  Resume Data (1-week storage)
                </h3>
                {analytics.resume.stored ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="text-green-600 font-medium">✓ Stored</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Size:</span>
                      <span className="font-mono">{analytics.resume.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Age:</span>
                      <span className="font-mono">{analytics.resume.age}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expires in:</span>
                      <span className="font-mono text-orange-600">{analytics.resume.remaining}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expiration:</span>
                      <span className="font-mono text-xs">{analytics.resume.expires}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm">No resume data stored on device</div>
                )}
              </div>

              {/* Application Storage */}
              <div className="bg-green-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <Clock size={16} className="mr-2 text-green-600" />
                  Application Data (1-week storage)
                </h3>
                {analytics.application.stored ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="text-green-600 font-medium">✓ Stored</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Size:</span>
                      <span className="font-mono">{analytics.application.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Age:</span>
                      <span className="font-mono">{analytics.application.age}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expires in:</span>
                      <span className="font-mono text-orange-600">{analytics.application.remaining}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expiration:</span>
                      <span className="font-mono text-xs">{analytics.application.expires}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm">No application data stored on device</div>
                )}
              </div>

              {/* Information */}
              <div className="bg-yellow-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <Info size={16} className="mr-2 text-yellow-600" />
                  Storage Information
                </h3>
                <div className="text-sm text-gray-700 space-y-2">
                  <p>• Data is automatically stored on your device for 1 week</p>
                  <p>• This provides faster access and offline functionality</p>
                  <p>• Expired data is automatically cleaned up</p>
                  <p>• Firestore provides cloud backup and sync</p>
                  <p>• Right-click and developer tools are enabled for inspection</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <button
                  onClick={refreshAnalytics}
                  className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-600 transition-colors flex items-center justify-center"
                >
                  <RefreshCw size={16} className="mr-2" />
                  Refresh
                </button>
                <button
                  onClick={handleCleanup}
                  className="flex-1 bg-orange-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-orange-600 transition-colors flex items-center justify-center"
                >
                  <Trash2 size={16} className="mr-2" />
                  Cleanup Expired
                </button>
                <button
                  onClick={handleClearAll}
                  className="flex-1 bg-red-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-red-600 transition-colors flex items-center justify-center"
                >
                  <Trash2 size={16} className="mr-2" />
                  Clear All
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No storage data available
            </div>
          )}

          <div className="mt-6 text-xs text-gray-500 text-center">
            Right-click anywhere to inspect elements • F12 for developer tools
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorageDebugger;