import React, { useState, useEffect } from 'react';
import { Bot, Plus, Key, Trash2, Edit3, Save, X, AlertCircle, CheckCircle } from 'lucide-react';
import { saveAPIKey, loadAPIKeys, deleteAPIKey, testAPIConnection } from '../services/apiKeyStorage';

interface AIModel {
  id: string;
  name: string;
  provider: string;
  apiKey: string;
  endpoint?: string;
  isActive: boolean;
  createdAt: Date;
}

const SUPPORTED_MODELS = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    provider: 'Google',
    description: 'Advanced language model from Google',
    requiresEndpoint: false,
    defaultEndpoint: 'https://generativelanguage.googleapis.com'
  },
  {
    id: 'openai',
    name: 'OpenAI GPT',
    provider: 'OpenAI',
    description: 'GPT models from OpenAI',
    requiresEndpoint: false,
    defaultEndpoint: 'https://api.openai.com/v1'
  },
  {
    id: 'anthropic',
    name: 'Claude',
    provider: 'Anthropic',
    description: 'Claude AI models from Anthropic',
    requiresEndpoint: false,
    defaultEndpoint: 'https://api.anthropic.com'
  },
  {
    id: 'custom',
    name: 'Custom API',
    provider: 'Custom',
    description: 'Any OpenAI-compatible API',
    requiresEndpoint: true,
    defaultEndpoint: ''
  }
];

const AIModelsPage: React.FC = () => {
  const [models, setModels] = useState<AIModel[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedModel, setSelectedModel] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [endpoint, setEndpoint] = useState('');
  const [customName, setCustomName] = useState('');
  const [isTestingConnection, setIsTestingConnection] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      const savedModels = await loadAPIKeys();
      setModels(savedModels);
    } catch (error) {
      console.error('Failed to load API keys:', error);
    }
  };

  const handleAddModel = async () => {
    if (!selectedModel || !apiKey.trim()) {
      alert('Please select a model and enter an API key');
      return;
    }

    const modelConfig = SUPPORTED_MODELS.find(m => m.id === selectedModel);
    if (!modelConfig) return;

    if (modelConfig.requiresEndpoint && !endpoint.trim()) {
      alert('Please enter an API endpoint');
      return;
    }

    if (selectedModel === 'custom' && !customName.trim()) {
      alert('Please enter a name for your custom model');
      return;
    }

    try {
      const name = selectedModel === 'custom' ? customName : modelConfig.name;
      await saveAPIKey(selectedModel, name, modelConfig.provider, apiKey, endpoint || modelConfig.defaultEndpoint);
      await loadModels();
      resetForm();
    } catch (error) {
      console.error('Failed to save API key:', error);
      alert('Failed to save API key. Please try again.');
    }
  };

  const handleDeleteModel = async (id: string) => {
    if (confirm('Are you sure you want to delete this API key?')) {
      try {
        await deleteAPIKey(id);
        await loadModels();
      } catch (error) {
        console.error('Failed to delete API key:', error);
        alert('Failed to delete API key. Please try again.');
      }
    }
  };

  const handleTestConnection = async (model: AIModel) => {
    setIsTestingConnection(model.id);
    try {
      const isWorking = await testAPIConnection(model.provider, model.apiKey, model.endpoint);
      setTestResults(prev => ({ ...prev, [model.id]: isWorking }));
    } catch (error) {
      console.error('Connection test failed:', error);
      setTestResults(prev => ({ ...prev, [model.id]: false }));
    } finally {
      setIsTestingConnection(null);
    }
  };

  const resetForm = () => {
    setIsAdding(false);
    setSelectedModel('');
    setApiKey('');
    setEndpoint('');
    setCustomName('');
  };

  const selectedModelConfig = SUPPORTED_MODELS.find(m => m.id === selectedModel);

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">AI Models & API Keys</h1>
          <p className="text-gray-600 text-lg">Configure AI models for cover letter generation</p>
        </div>

        {/* Security Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <div className="flex items-start">
            <AlertCircle className="text-blue-500 mr-3 mt-1" size={20} />
            <div>
              <h3 className="font-semibold text-blue-800 mb-2">Security & Privacy</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• API keys are encrypted and stored securely in your private database</li>
                <li>• Keys are never shared with third parties or our servers</li>
                <li>• You maintain full control over your AI usage and costs</li>
                <li>• This open-source app runs entirely on your infrastructure</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Add New Model */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Plus className="text-green-500 mr-3" size={24} />
              <h2 className="text-2xl font-bold text-gray-800">Add AI Model</h2>
            </div>
            {!isAdding && (
              <button
                onClick={() => setIsAdding(true)}
                className="bg-gradient-to-r from-green-400 to-blue-400 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-500 hover:to-blue-500 transition-all duration-200"
              >
                Add Model
              </button>
            )}
          </div>

          {isAdding && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select AI Model
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  <option value="">Choose a model...</option>
                  {SUPPORTED_MODELS.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name} - {model.description}
                    </option>
                  ))}
                </select>
              </div>

              {selectedModel === 'custom' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Model Name
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g., My Local Llama Model"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
              )}

              {selectedModelConfig && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      API Key
                    </label>
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Enter your API key..."
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                  </div>

                  {selectedModelConfig.requiresEndpoint && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        API Endpoint
                      </label>
                      <input
                        type="url"
                        value={endpoint}
                        onChange={(e) => setEndpoint(e.target.value)}
                        placeholder="https://api.example.com/v1"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300"
                      />
                    </div>
                  )}

                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-medium text-gray-800 mb-2">How to get your {selectedModelConfig.name} API key:</h4>
                    <div className="text-sm text-gray-600">
                      {selectedModel === 'gemini' && (
                        <ol className="list-decimal list-inside space-y-1">
                          <li>Go to <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google AI Studio</a></li>
                          <li>Click "Create API Key"</li>
                          <li>Copy the generated key</li>
                        </ol>
                      )}
                      {selectedModel === 'openai' && (
                        <ol className="list-decimal list-inside space-y-1">
                          <li>Go to <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenAI Platform</a></li>
                          <li>Click "Create new secret key"</li>
                          <li>Copy the generated key</li>
                        </ol>
                      )}
                      {selectedModel === 'anthropic' && (
                        <ol className="list-decimal list-inside space-y-1">
                          <li>Go to <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Anthropic Console</a></li>
                          <li>Navigate to API Keys</li>
                          <li>Create a new key</li>
                        </ol>
                      )}
                      {selectedModel === 'custom' && (
                        <p>Enter the API endpoint and key for your custom OpenAI-compatible API service.</p>
                      )}
                    </div>
                  </div>
                </>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={handleAddModel}
                  className="bg-green-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-600 transition-colors flex items-center"
                >
                  <Save size={16} className="mr-2" />
                  Save Model
                </button>
                <button
                  onClick={resetForm}
                  className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-300 transition-colors flex items-center"
                >
                  <X size={16} className="mr-2" />
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Configured Models */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8">
          <div className="flex items-center mb-6">
            <Bot className="text-purple-500 mr-3" size={24} />
            <h2 className="text-2xl font-bold text-gray-800">Configured Models</h2>
          </div>

          {models.length === 0 ? (
            <div className="text-center py-12">
              <Key size={48} className="text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No AI Models Configured</h3>
              <p className="text-gray-500 mb-6">Add your first AI model to start generating cover letters</p>
              <button
                onClick={() => setIsAdding(true)}
                className="bg-gradient-to-r from-purple-400 to-blue-400 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-500 hover:to-blue-500 transition-all duration-200"
              >
                Add Your First Model
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {models.map((model) => (
                <div key={model.id} className="bg-gray-50 rounded-2xl p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">{model.name}</h3>
                        {model.isActive && (
                          <span className="ml-2 bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Provider: {model.provider}</p>
                      <p className="text-sm text-gray-600 mb-4">
                        Added: {model.createdAt.toLocaleDateString()}
                      </p>
                      
                      {model.endpoint && (
                        <p className="text-sm text-gray-600 mb-4">
                          Endpoint: {model.endpoint}
                        </p>
                      )}

                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleTestConnection(model)}
                          disabled={isTestingConnection === model.id}
                          className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
                        >
                          {isTestingConnection === model.id ? 'Testing...' : 'Test Connection'}
                        </button>
                        
                        {testResults[model.id] !== undefined && (
                          <div className="flex items-center">
                            {testResults[model.id] ? (
                              <div className="flex items-center text-green-600">
                                <CheckCircle size={16} className="mr-1" />
                                <span className="text-sm">Working</span>
                              </div>
                            ) : (
                              <div className="flex items-center text-red-600">
                                <AlertCircle size={16} className="mr-1" />
                                <span className="text-sm">Failed</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDeleteModel(model.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete model"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIModelsPage;