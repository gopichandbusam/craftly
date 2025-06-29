import React, { useState } from 'react';
import { BookOpen, Download, Github, ExternalLink, Copy, CheckCircle, Server, Cloud, Settings, ArrowLeft } from 'lucide-react';

interface InstructionsPageProps {
  onBack?: () => void;
}

const InstructionsPage: React.FC<InstructionsPageProps> = ({ onBack }) => {
  const [copiedText, setCopiedText] = useState<string>('');

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const supabaseEnvTemplate = `# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-6xl mx-auto">
        {onBack && (
          <div className="mb-8">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors bg-white/50 px-4 py-2 rounded-xl hover:bg-white/70"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to Login
            </button>
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Setup Instructions</h1>
          <p className="text-gray-600 text-lg">Complete guide to deploy and customize Craftly AI</p>
        </div>

        {/* Quick Start */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 mb-8">
          <div className="flex items-center mb-6">
            <BookOpen className="text-blue-500 mr-3" size={24} />
            <h2 className="text-2xl font-bold text-gray-800">Quick Start</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-2xl p-6 text-center">
              <Github className="text-blue-600 mx-auto mb-4" size={48} />
              <h3 className="font-semibold text-gray-800 mb-2">1. Clone Repository</h3>
              <p className="text-sm text-gray-600">Get the source code from GitHub</p>
            </div>
            
            <div className="bg-purple-50 rounded-2xl p-6 text-center">
              <Settings className="text-purple-600 mx-auto mb-4" size={48} />
              <h3 className="font-semibold text-gray-800 mb-2">2. Configure Supabase</h3>
              <p className="text-sm text-gray-600">Set up Supabase database and storage</p>
            </div>
            
            <div className="bg-green-50 rounded-2xl p-6 text-center">
              <Cloud className="text-green-600 mx-auto mb-4" size={48} />
              <h3 className="font-semibold text-gray-800 mb-2">3. Deploy</h3>
              <p className="text-sm text-gray-600">Launch on your preferred platform</p>
            </div>
          </div>
        </div>

        {/* GitHub Repository */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 mb-8">
          <div className="flex items-center mb-6">
            <Github className="text-gray-800 mr-3" size={24} />
            <h2 className="text-2xl font-bold text-gray-800">Source Code</h2>
          </div>
          
          <div className="bg-gray-50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Craftly AI Repository</h3>
              <a
                href="https://github.com/craftly-ai/craftly"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-900 transition-colors flex items-center"
              >
                <ExternalLink size={16} className="mr-2" />
                View on GitHub
              </a>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-4 text-white font-mono text-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400"># Clone the repository</span>
                <button
                  onClick={() => copyToClipboard('git clone https://github.com/craftly-ai/craftly.git', 'clone')}
                  className="text-blue-400 hover:text-blue-300"
                >
                  {copiedText === 'clone' ? <CheckCircle size={16} /> : <Copy size={16} />}
                </button>
              </div>
              <div>git clone https://github.com/craftly-ai/craftly.git</div>
              <div className="mt-2">cd craftly</div>
              <div>npm install</div>
            </div>
          </div>
        </div>

        {/* Supabase Setup */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 mb-8">
          <div className="flex items-center mb-6">
            <Server className="text-green-500 mr-3" size={24} />
            <h2 className="text-2xl font-bold text-gray-800">Supabase Configuration</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Step 1: Create Supabase Project</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Supabase</a></li>
                <li>Click "Start your project" and sign in</li>
                <li>Create a new project with your preferred name</li>
                <li>Wait for the project to be ready (2-3 minutes)</li>
              </ol>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Step 2: Configure Database</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Go to Table Editor in your Supabase dashboard</li>
                <li>Create tables for users, resumes, and cover letters</li>
                <li>Set up Row Level Security (RLS) policies</li>
                <li>Configure authentication settings</li>
              </ol>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Step 3: Get API Keys</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Go to Settings → API in your Supabase dashboard</li>
                <li>Copy your project URL and anon public key</li>
                <li>Add these to your environment variables</li>
              </ol>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Step 4: Environment Variables</h3>
              <div className="bg-gray-800 rounded-xl p-4 text-white font-mono text-sm relative">
                <button
                  onClick={() => copyToClipboard(supabaseEnvTemplate, 'supabase-env')}
                  className="absolute top-4 right-4 text-blue-400 hover:text-blue-300"
                >
                  {copiedText === 'supabase-env' ? <CheckCircle size={16} /> : <Copy size={16} />}
                </button>
                <pre className="pr-8">{supabaseEnvTemplate}</pre>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Create a <code className="bg-gray-100 px-2 py-1 rounded">.env</code> file in your project root with these variables.
              </p>
            </div>
          </div>
        </div>

        {/* Deployment Options */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 mb-8">
          <div className="flex items-center mb-6">
            <Cloud className="text-blue-500 mr-3" size={24} />
            <h2 className="text-2xl font-bold text-gray-800">Deployment Options</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Netlify */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                <div className="w-8 h-8 bg-teal-500 rounded mr-3"></div>
                Netlify (Recommended)
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Push your code to GitHub/GitLab</li>
                <li>Connect repository to <a href="https://netlify.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Netlify</a></li>
                <li>Build settings: <code className="bg-gray-100 px-2 py-1 rounded text-sm">npm run build</code></li>
                <li>Publish directory: <code className="bg-gray-100 px-2 py-1 rounded text-sm">dist</code></li>
                <li>Add environment variables in Netlify dashboard</li>
                <li>Deploy!</li>
              </ol>
            </div>
            
            {/* Vercel */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                <div className="w-8 h-8 bg-black rounded mr-3"></div>
                Vercel
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Install Vercel CLI: <code className="bg-gray-100 px-2 py-1 rounded text-sm">npm i -g vercel</code></li>
                <li>Run <code className="bg-gray-100 px-2 py-1 rounded text-sm">vercel</code> in project directory</li>
                <li>Or connect via <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Vercel Dashboard</a></li>
                <li>Add environment variables</li>
                <li>Deploy automatically</li>
              </ol>
            </div>
            
            {/* Other Options */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                <Server className="text-gray-600 mr-3" size={24} />
                Self-Hosted
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Build: <code className="bg-gray-100 px-2 py-1 rounded text-sm">npm run build</code></li>
                <li>Serve <code className="bg-gray-100 px-2 py-1 rounded text-sm">dist</code> folder</li>
                <li>Configure environment variables</li>
                <li>Set up reverse proxy (nginx/Apache)</li>
              </ol>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                <div className="w-8 h-8 bg-purple-500 rounded mr-3"></div>
                Other Platforms
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li>• GitHub Pages</li>
                <li>• DigitalOcean App Platform</li>
                <li>• AWS Amplify</li>
                <li>• Google Cloud Platform</li>
                <li>• Any static hosting service</li>
              </ul>
            </div>
          </div>
        </div>

        {/* AI Models Setup */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 mb-8">
          <div className="flex items-center mb-6">
            <Settings className="text-purple-500 mr-3" size={24} />
            <h2 className="text-2xl font-bold text-gray-800">AI Models Configuration</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Supported AI Providers</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-xl p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Google Gemini</h4>
                  <p className="text-sm text-blue-700 mb-2">Get API key from Google AI Studio</p>
                  <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                    Get API Key →
                  </a>
                </div>
                
                <div className="bg-green-50 rounded-xl p-4">
                  <h4 className="font-semibold text-green-800 mb-2">OpenAI GPT</h4>
                  <p className="text-sm text-green-700 mb-2">Use GPT-3.5, GPT-4, or other models</p>
                  <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline text-sm">
                    Get API Key →
                  </a>
                </div>
                
                <div className="bg-purple-50 rounded-xl p-4">
                  <h4 className="font-semibold text-purple-800 mb-2">Anthropic Claude</h4>
                  <p className="text-sm text-purple-700 mb-2">Claude 3 and other models</p>
                  <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline text-sm">
                    Get API Key →
                  </a>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Custom API</h4>
                  <p className="text-sm text-gray-700 mb-2">Any OpenAI-compatible API</p>
                  <span className="text-gray-600 text-sm">Local models, other providers</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Setup Instructions</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>After deployment, visit your app and create an account</li>
                <li>Or use demo login: <strong>gopichand@gmail.com</strong> / <strong>gopigopi</strong></li>
                <li>Go to "AI Models" page in the sidebar</li>
                <li>Click "Add Model" and select your preferred AI provider</li>
                <li>Enter your API key and test the connection</li>
                <li>Start generating cover letters!</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Features Overview */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8">
          <div className="flex items-center mb-6">
            <Download className="text-green-500 mr-3" size={24} />
            <h2 className="text-2xl font-bold text-gray-800">Features & Customization</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Core Features</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• AI-powered resume parsing</li>
                <li>• Custom prompt templates</li>
                <li>• Multiple AI model support</li>
                <li>• Rich text cover letter editor</li>
                <li>• PDF export functionality</li>
                <li>• Supabase storage integration</li>
                <li>• File storage for resumes</li>
                <li>• Responsive design</li>
                <li>• Open source & self-hosted</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Customization</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Custom branding and colors</li>
                <li>• Add your own AI models</li>
                <li>• Modify prompt templates</li>
                <li>• Custom deployment domains</li>
                <li>• Theme customization</li>
                <li>• Feature additions via code</li>
                <li>• Integration with other tools</li>
                <li>• White-label deployment</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructionsPage;