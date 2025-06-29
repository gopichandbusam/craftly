import React, { useState, useEffect } from 'react';
import { Edit3, Save, RotateCcw, Sparkles, X } from 'lucide-react';
import { COVER_LETTER_PROMPT } from '../services/promptTemplates';

interface CustomPromptEditorProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (prompt: string) => void;
  currentPrompt?: string;
}

const CustomPromptEditor: React.FC<CustomPromptEditorProps> = ({ 
  isVisible, 
  onClose, 
  onSave, 
  currentPrompt 
}) => {
  const [prompt, setPrompt] = useState(currentPrompt || COVER_LETTER_PROMPT);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (currentPrompt) {
      setPrompt(currentPrompt);
    } else {
      setPrompt(COVER_LETTER_PROMPT);
    }
    setHasChanges(false);
  }, [currentPrompt, isVisible]);

  const handlePromptChange = (value: string) => {
    setPrompt(value);
    setHasChanges(value !== (currentPrompt || COVER_LETTER_PROMPT));
  };

  const handleSave = () => {
    onSave(prompt);
    localStorage.setItem('craftly_custom_prompt', prompt);
    setHasChanges(false);
    onClose();
  };

  const handleReset = () => {
    setPrompt(COVER_LETTER_PROMPT);
    setHasChanges(true);
  };

  const handleClose = () => {
    if (hasChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to close?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Sparkles className="text-purple-500 mr-3" size={24} />
              <h2 className="text-2xl font-bold text-gray-800">Custom AI Prompt Editor</h2>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          <p className="text-gray-600 mt-2">
            Customize the AI prompt to generate cover letters that match your style and preferences.
          </p>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                AI Prompt Template
              </label>
              <textarea
                value={prompt}
                onChange={(e) => handlePromptChange(e.target.value)}
                className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-300 focus:border-transparent resize-none font-mono text-sm"
                placeholder="Enter your custom AI prompt here..."
              />
            </div>

            <div className="bg-yellow-50 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">📝 Prompt Guidelines:</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Use <code>{'{RESUME_DATA}'}</code> placeholder for resume information</li>
                <li>• Use <code>{'{JOB_DESCRIPTION}'}</code> placeholder for job posting content</li>
                <li>• Include specific instructions for tone, length, and format</li>
                <li>• Specify what information to include/exclude</li>
                <li>• Add any industry-specific requirements</li>
              </ul>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">💡 Tips for Better Results:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Be specific about the desired writing style (professional, conversational, etc.)</li>
                <li>• Include word count limits if needed (e.g., "Keep under 300 words")</li>
                <li>• Specify how to handle company research and personalization</li>
                <li>• Add instructions for formatting (paragraphs, bullet points, etc.)</li>
                <li>• Include any specific industry terminology to use or avoid</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <button
              onClick={handleReset}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <RotateCcw size={16} className="mr-2" />
              Reset to Default
            </button>
            
            <div className="flex space-x-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <Save size={16} className="mr-2" />
                Save Custom Prompt
              </button>
            </div>
          </div>
          
          {hasChanges && (
            <div className="mt-2 text-sm text-orange-600 flex items-center">
              <Edit3 size={14} className="mr-1" />
              You have unsaved changes
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomPromptEditor;