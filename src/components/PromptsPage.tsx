import React, { useState, useEffect } from 'react';
import { FileText, Plus, Edit3, Trash2, Save, X } from 'lucide-react';
import { saveCustomPrompt, loadCustomPrompts, deleteCustomPrompt } from '../services/promptStorage';

interface CustomPrompt {
  id: string;
  name: string;
  prompt: string;
  createdAt: Date;
}

const DEFAULT_PROMPT = `You are an expert cover letter writer. Create a professional, compelling cover letter based on the following resume data and job description.

Instructions:
- Write a cover letter that is exactly one page long (approximately 350-400 words)
- Make it professional, engaging, and tailored to the specific job
- Highlight relevant skills, experiences, and achievements from the resume
- Show enthusiasm for the role and company
- Use a formal business letter format
- End with "Sincerely," followed by the candidate's name
- Do not include any placeholder text in brackets like [Company Name] or [Your Name]
- Be specific and avoid generic language
- Focus on how the candidate's experience directly relates to the job requirements

Resume Data:
{resumeData}

Job Description:
{jobDescription}

Write a compelling cover letter that would make the candidate stand out:`;

const PromptsPage: React.FC = () => {
  const [customPrompts, setCustomPrompts] = useState<CustomPrompt[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editingPrompt, setEditingPrompt] = useState('');
  const [editingName, setEditingName] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = async () => {
    try {
      const prompts = await loadCustomPrompts();
      setCustomPrompts(prompts);
    } catch (error) {
      console.error('Failed to load custom prompts:', error);
    }
  };

  const handleSavePrompt = async () => {
    if (!editingName.trim() || !editingPrompt.trim()) {
      alert('Please enter both name and prompt');
      return;
    }

    try {
      if (isEditing === 'new') {
        await saveCustomPrompt(editingName, editingPrompt);
      } else if (isEditing) {
        await saveCustomPrompt(editingName, editingPrompt, isEditing);
      }
      
      await loadPrompts();
      setIsEditing(null);
      setIsCreatingNew(false);
      setEditingPrompt('');
      setEditingName('');
    } catch (error) {
      console.error('Failed to save prompt:', error);
      alert('Failed to save prompt. Please try again.');
    }
  };

  const handleEditPrompt = (prompt: CustomPrompt) => {
    setIsEditing(prompt.id);
    setEditingName(prompt.name);
    setEditingPrompt(prompt.prompt);
  };

  const handleDeletePrompt = async (id: string) => {
    if (confirm('Are you sure you want to delete this prompt?')) {
      try {
        await deleteCustomPrompt(id);
        await loadPrompts();
      } catch (error) {
        console.error('Failed to delete prompt:', error);
        alert('Failed to delete prompt. Please try again.');
      }
    }
  };

  const handleCreateNew = () => {
    setIsCreatingNew(true);
    setIsEditing('new');
    setEditingName('');
    setEditingPrompt(DEFAULT_PROMPT);
  };

  const handleCancel = () => {
    setIsEditing(null);
    setIsCreatingNew(false);
    setEditingPrompt('');
    setEditingName('');
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Prompt Templates</h1>
          <p className="text-gray-600 text-lg">Customize how AI generates your cover letters</p>
        </div>

        {/* Default Prompt */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 mb-8">
          <div className="flex items-center mb-6">
            <FileText className="text-blue-500 mr-3" size={24} />
            <h2 className="text-2xl font-bold text-gray-800">Default Prompt Template</h2>
          </div>
          
          <div className="bg-gray-50 rounded-2xl p-6">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono overflow-x-auto">
              {DEFAULT_PROMPT}
            </pre>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            <p><strong>Note:</strong> This is the default prompt used when no custom prompt is selected. 
            It includes placeholders for {`{resumeData}`} and {`{jobDescription}`} that will be automatically replaced.</p>
          </div>
        </div>

        {/* Custom Prompts */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Edit3 className="text-purple-500 mr-3" size={24} />
              <h2 className="text-2xl font-bold text-gray-800">Custom Prompts</h2>
            </div>
            <button
              onClick={handleCreateNew}
              className="bg-gradient-to-r from-purple-400 to-blue-400 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-500 hover:to-blue-500 transition-all duration-200 flex items-center"
            >
              <Plus size={20} className="mr-2" />
              Create New
            </button>
          </div>

          {/* Creating/Editing Form */}
          {(isCreatingNew || isEditing) && (
            <div className="bg-blue-50 rounded-2xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {isCreatingNew ? 'Create New Prompt' : 'Edit Prompt'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prompt Name
                  </label>
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    placeholder="e.g., Technical Role Focus, Creative Industry, etc."
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prompt Template
                  </label>
                  <textarea
                    value={editingPrompt}
                    onChange={(e) => setEditingPrompt(e.target.value)}
                    placeholder="Enter your custom prompt template..."
                    rows={12}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 font-mono text-sm"
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    Use {`{resumeData}`} and {`{jobDescription}`} as placeholders that will be replaced with actual data.
                  </p>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={handleSavePrompt}
                    className="bg-green-500 text-white px-6 py-2 rounded-xl font-medium hover:bg-green-600 transition-colors flex items-center"
                  >
                    <Save size={16} className="mr-2" />
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-xl font-medium hover:bg-gray-300 transition-colors flex items-center"
                  >
                    <X size={16} className="mr-2" />
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Custom Prompts List */}
          {customPrompts.length === 0 ? (
            <div className="text-center py-12">
              <FileText size={48} className="text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Custom Prompts Yet</h3>
              <p className="text-gray-500 mb-6">Create your first custom prompt to personalize cover letter generation</p>
              <button
                onClick={handleCreateNew}
                className="bg-gradient-to-r from-purple-400 to-blue-400 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-500 hover:to-blue-500 transition-all duration-200"
              >
                Create Your First Prompt
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {customPrompts.map((prompt) => (
                <div key={prompt.id} className="bg-gray-50 rounded-2xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{prompt.name}</h3>
                      <p className="text-sm text-gray-600">
                        Created: {prompt.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditPrompt(prompt)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Edit prompt"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeletePrompt(prompt.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete prompt"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl p-4 max-h-32 overflow-y-auto">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                      {prompt.prompt.substring(0, 200)}
                      {prompt.prompt.length > 200 && '...'}
                    </pre>
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

export default PromptsPage;