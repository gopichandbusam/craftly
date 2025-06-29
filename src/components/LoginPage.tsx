import React, { useState } from 'react';
import { Github, ExternalLink, Heart, Sparkles, FileText, Zap, Shield, Globe } from 'lucide-react';
import LoginForm from './LoginForm';

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  onSignup: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  onGoogleSignIn: () => Promise<{ success: boolean; error?: string }>;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onSignup, onGoogleSignIn }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Morphing Squircles */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-blue-400/20 to-purple-400/20 animate-morph-squircle"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-gradient-to-r from-purple-400/20 to-pink-400/20 animate-morph-squircle-delayed"></div>
        <div className="absolute bottom-32 left-40 w-40 h-40 bg-gradient-to-r from-green-400/20 to-blue-400/20 animate-morph-squircle-slow"></div>
        
        {/* Morphing Rings */}
        <div className="absolute top-60 right-20 w-48 h-48 border-4 border-blue-300/30 animate-morph-ring"></div>
        <div className="absolute bottom-20 right-60 w-36 h-36 border-3 border-purple-300/30 animate-morph-ring-reverse"></div>
        <div className="absolute top-32 left-1/2 w-56 h-56 border-2 border-pink-300/20 animate-morph-ring-slow"></div>
        
        {/* Corner Elements */}
        <div className="absolute top-10 right-10 w-16 h-16 bg-gradient-to-br from-yellow-400/30 to-orange-400/30 animate-morph-corner-1"></div>
        <div className="absolute bottom-10 left-10 w-20 h-20 bg-gradient-to-br from-cyan-400/30 to-blue-400/30 animate-morph-corner-2"></div>
        <div className="absolute top-1/2 left-10 w-12 h-12 bg-gradient-to-br from-rose-400/30 to-pink-400/30 animate-morph-corner-3"></div>
        <div className="absolute top-10 left-1/2 w-14 h-14 bg-gradient-to-br from-emerald-400/30 to-green-400/30 animate-morph-corner-4"></div>
        
        {/* Energy Flow Particles */}
        <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-blue-500/60 rounded-full animate-energy-flow-1"></div>
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-500/60 rounded-full animate-energy-flow-1-delayed"></div>
        <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-pink-500/40 rounded-full animate-energy-flow-1-delayed-2"></div>
        
        <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-green-500/60 rounded-full animate-energy-flow-2"></div>
        <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-cyan-500/60 rounded-full animate-energy-flow-2-delayed"></div>
        <div className="absolute top-1/3 right-1/4 w-4 h-4 bg-blue-500/40 rounded-full animate-energy-flow-2-delayed-2"></div>
        
        <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-yellow-500/60 rounded-full animate-energy-flow-3"></div>
        <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-orange-500/60 rounded-full animate-energy-flow-3-delayed"></div>
        <div className="absolute bottom-1/4 left-1/3 w-4 h-4 bg-red-500/40 rounded-full animate-energy-flow-3-delayed-2"></div>
        
        <div className="absolute bottom-1/3 right-1/3 w-3 h-3 bg-indigo-500/60 rounded-full animate-energy-flow-4"></div>
        <div className="absolute bottom-1/3 right-1/3 w-2 h-2 bg-violet-500/60 rounded-full animate-energy-flow-4-delayed"></div>
        <div className="absolute bottom-1/3 right-1/3 w-4 h-4 bg-purple-500/40 rounded-full animate-energy-flow-4-delayed-2"></div>
        
        {/* Side Energy Flows */}
        <div className="absolute top-1/2 left-0 w-2 h-20 bg-gradient-to-r from-transparent to-blue-400/50 animate-energy-flow-left"></div>
        <div className="absolute top-1/2 left-0 w-3 h-16 bg-gradient-to-r from-transparent to-purple-400/40 animate-energy-flow-left-delayed"></div>
        
        <div className="absolute top-1/2 right-0 w-2 h-20 bg-gradient-to-l from-transparent to-green-400/50 animate-energy-flow-right"></div>
        <div className="absolute top-1/2 right-0 w-3 h-16 bg-gradient-to-l from-transparent to-cyan-400/40 animate-energy-flow-right-delayed"></div>
        
        <div className="absolute top-0 left-1/2 w-20 h-2 bg-gradient-to-b from-transparent to-pink-400/50 animate-energy-flow-top"></div>
        <div className="absolute top-0 left-1/2 w-16 h-3 bg-gradient-to-b from-transparent to-rose-400/40 animate-energy-flow-top-delayed"></div>
        
        <div className="absolute bottom-0 left-1/2 w-20 h-2 bg-gradient-to-t from-transparent to-yellow-400/50 animate-energy-flow-bottom"></div>
        <div className="absolute bottom-0 left-1/2 w-16 h-3 bg-gradient-to-t from-transparent to-orange-400/40 animate-energy-flow-bottom-delayed"></div>
        
        {/* Data Streams */}
        <div className="absolute top-20 left-0 w-full h-1 bg-gradient-to-r from-blue-400/0 via-blue-400/60 to-blue-400/0 animate-data-stream-1"></div>
        <div className="absolute top-40 left-0 w-full h-1 bg-gradient-to-r from-purple-400/0 via-purple-400/60 to-purple-400/0 animate-data-stream-2"></div>
        <div className="absolute bottom-20 left-0 w-full h-1 bg-gradient-to-r from-green-400/0 via-green-400/60 to-green-400/0 animate-data-stream-3"></div>
        
        <div className="absolute top-0 left-20 w-1 h-full bg-gradient-to-b from-cyan-400/0 via-cyan-400/60 to-cyan-400/0 animate-data-stream-vertical-1"></div>
        <div className="absolute top-0 right-20 w-1 h-full bg-gradient-to-b from-pink-400/0 via-pink-400/60 to-pink-400/0 animate-data-stream-vertical-2"></div>
        
        {/* AI Processing Pulses */}
        <div className="absolute top-1/4 left-1/2 w-6 h-6 bg-blue-500/30 rounded-full animate-ai-pulse"></div>
        <div className="absolute top-1/3 left-1/3 w-4 h-4 bg-purple-500/30 rounded-full animate-ai-pulse-delayed"></div>
        <div className="absolute bottom-1/4 right-1/2 w-5 h-5 bg-green-500/30 rounded-full animate-ai-pulse-delayed-2"></div>
        <div className="absolute bottom-1/3 right-1/3 w-7 h-7 bg-pink-500/30 rounded-full animate-ai-pulse-delayed-3"></div>
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center py-8">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <FileText size={48} className="text-blue-500 animate-float" />
                <Sparkles size={24} className="absolute -top-2 -right-2 text-purple-400 animate-pulse-slow" />
              </div>
            </div>
            <h1 className="text-6xl font-bold text-gray-800 mb-4">
              Craft<span className="text-blue-500">ly</span>
            </h1>
            <p className="text-2xl text-gray-600 mb-4">AI-Powered Resume & Cover Letter Generator</p>
            
            {/* Open Source Badge */}
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg flex items-center space-x-2">
                <Github size={20} className="text-gray-700" />
                <span className="text-sm font-semibold text-gray-700">Open Source</span>
              </div>
              <a
                href="/instructions"
                className="bg-blue-500/20 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 hover:bg-blue-500/30 transition-all duration-200 text-blue-700 hover:text-blue-800"
              >
                <ExternalLink size={16} />
                <span className="text-sm font-semibold">Setup Guide</span>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[70vh]">
            {/* Benefits Section */}
            <div className="flex flex-col items-center justify-center space-y-8">
              <div className="text-center max-w-md">
                <h2 className="text-4xl font-bold text-gray-800 mb-6">
                  Why Choose Craftly?
                </h2>
                
                <div className="space-y-6">
                  <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <Zap className="text-blue-500" size={24} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800">Lightning Fast</h3>
                    </div>
                    <p className="text-gray-600">Generate personalized cover letters in seconds using advanced AI technology</p>
                  </div>
                  
                  <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                        <Shield className="text-purple-500" size={24} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800">Secure & Private</h3>
                    </div>
                    <p className="text-gray-600">Your data is encrypted and stored securely. You control your own AI API keys</p>
                  </div>
                  
                  <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                        <Globe className="text-green-500" size={24} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800">Open Source</h3>
                    </div>
                    <p className="text-gray-600">Self-hostable, customizable, and completely free. Add your own AI models</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Login Form */}
            <div className="flex justify-center">
              <LoginForm onLogin={onLogin} onSignup={onSignup} onGoogleSignIn={onGoogleSignIn} />
            </div>
          </div>

          {/* Footer */}
          <div className="text-center py-8 mt-12">
            <div className="bg-white/40 backdrop-blur-sm rounded-full px-6 py-3 inline-flex items-center space-x-2 shadow-lg">
              <span className="text-gray-600">Made with</span>
              <Heart size={16} className="text-red-500 animate-pulse" />
              <span className="text-gray-600">by</span>
              <a 
                href="https://github.com/gopichand-busam" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Gopichand Busam
              </a>
              <span className="text-gray-600">from Brooklyn, NY</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;