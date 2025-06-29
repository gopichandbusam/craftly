import React from 'react';
import { FileText } from 'lucide-react';

const AnimatedLogo: React.FC = () => {
  return (
    <div className="relative w-80 h-80 mx-auto">
      {/* Morphing Squircle Background Container */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Main morphing squircle */}
        <div className="relative w-72 h-72">
          {/* Primary morphing squircle */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-cyan-400/20 animate-morph-squircle shadow-2xl"></div>
          
          {/* Secondary morphing squircle (offset timing) */}
          <div className="absolute inset-2 bg-gradient-to-tr from-cyan-400/15 via-blue-400/15 to-purple-400/15 animate-morph-squircle-delayed shadow-xl"></div>
          
          {/* Tertiary morphing squircle (different timing) */}
          <div className="absolute inset-4 bg-gradient-to-bl from-purple-400/10 via-pink-400/10 to-blue-400/10 animate-morph-squircle-slow shadow-lg"></div>
        </div>
      </div>
      
      {/* AI Processing Rings inside squircle */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 w-64 h-64 border-2 border-blue-300/30 animate-spin-slow animate-morph-ring"></div>
          <div className="absolute inset-4 w-56 h-56 border border-purple-300/20 animate-spin-slow animate-morph-ring-reverse"></div>
          <div className="absolute inset-8 w-48 h-48 border border-cyan-300/15 animate-spin-slow animate-morph-ring-slow"></div>
        </div>
      </div>
      
      {/* Central PDF Icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          {/* Icon glow effect */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-blue-400/20 rounded-lg blur-xl animate-breathe"></div>
          </div>
          
          {/* Main PDF icon */}
          <div className="relative animate-float z-10">
            <FileText size={120} className="text-blue-500 drop-shadow-2xl transition-all duration-300 hover:text-blue-600 hover:scale-110" />
          </div>
          
          {/* AI processing indicator inside icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-20 flex items-center justify-center">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Energy Particles Flowing Toward PDF */}
      {/* Top-left energy stream */}
      <div className="absolute top-4 left-4">
        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-energy-flow-1 shadow-lg shadow-cyan-400/50"></div>
        <div className="w-1 h-1 bg-blue-400 rounded-full animate-energy-flow-1-delayed shadow-lg shadow-blue-400/50"></div>
        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-energy-flow-1-delayed-2 shadow-lg shadow-purple-400/50"></div>
      </div>
      
      {/* Top-right energy stream */}
      <div className="absolute top-4 right-4">
        <div className="w-1 h-1 bg-green-400 rounded-full animate-energy-flow-2 shadow-lg shadow-green-400/50"></div>
        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-energy-flow-2-delayed shadow-lg shadow-cyan-400/50"></div>
        <div className="w-1 h-1 bg-blue-400 rounded-full animate-energy-flow-2-delayed-2 shadow-lg shadow-blue-400/50"></div>
      </div>
      
      {/* Bottom-left energy stream */}
      <div className="absolute bottom-4 left-4">
        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-energy-flow-3 shadow-lg shadow-purple-400/50"></div>
        <div className="w-1 h-1 bg-pink-400 rounded-full animate-energy-flow-3-delayed shadow-lg shadow-pink-400/50"></div>
        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-energy-flow-3-delayed-2 shadow-lg shadow-cyan-400/50"></div>
      </div>
      
      {/* Bottom-right energy stream */}
      <div className="absolute bottom-4 right-4">
        <div className="w-1 h-1 bg-yellow-400 rounded-full animate-energy-flow-4 shadow-lg shadow-yellow-400/50"></div>
        <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-energy-flow-4-delayed shadow-lg shadow-green-400/50"></div>
        <div className="w-1 h-1 bg-blue-400 rounded-full animate-energy-flow-4-delayed-2 shadow-lg shadow-blue-400/50"></div>
      </div>
      
      {/* Side energy streams */}
      <div className="absolute top-1/2 left-2 transform -translate-y-1/2">
        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-energy-flow-left shadow-lg shadow-indigo-400/50"></div>
        <div className="w-1 h-1 bg-purple-400 rounded-full animate-energy-flow-left-delayed shadow-lg shadow-purple-400/50"></div>
      </div>
      
      <div className="absolute top-1/2 right-2 transform -translate-y-1/2">
        <div className="w-1 h-1 bg-teal-400 rounded-full animate-energy-flow-right shadow-lg shadow-teal-400/50"></div>
        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-energy-flow-right-delayed shadow-lg shadow-cyan-400/50"></div>
      </div>
      
      <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
        <div className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-energy-flow-top shadow-lg shadow-rose-400/50"></div>
        <div className="w-1 h-1 bg-pink-400 rounded-full animate-energy-flow-top-delayed shadow-lg shadow-pink-400/50"></div>
      </div>
      
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
        <div className="w-1 h-1 bg-emerald-400 rounded-full animate-energy-flow-bottom shadow-lg shadow-emerald-400/50"></div>
        <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-energy-flow-bottom-delayed shadow-lg shadow-green-400/50"></div>
      </div>
      
      {/* AI Data Streams */}
      <div className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent animate-data-stream-1"></div>
      <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent animate-data-stream-2"></div>
      <div className="absolute top-2/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-400/40 to-transparent animate-data-stream-3"></div>
      
      {/* Vertical data streams */}
      <div className="absolute left-1/3 top-0 w-px h-full bg-gradient-to-b from-transparent via-cyan-400/30 to-transparent animate-data-stream-vertical-1"></div>
      <div className="absolute left-2/3 top-0 w-px h-full bg-gradient-to-b from-transparent via-purple-400/30 to-transparent animate-data-stream-vertical-2"></div>
      
      {/* AI Processing Indicators */}
      <div className="absolute top-8 left-8 w-2 h-2 bg-cyan-400 rounded-full animate-ai-pulse shadow-lg shadow-cyan-400/50"></div>
      <div className="absolute top-8 right-8 w-2 h-2 bg-blue-400 rounded-full animate-ai-pulse-delayed shadow-lg shadow-blue-400/50"></div>
      <div className="absolute bottom-8 left-8 w-2 h-2 bg-purple-400 rounded-full animate-ai-pulse-delayed-2 shadow-lg shadow-purple-400/50"></div>
      <div className="absolute bottom-8 right-8 w-2 h-2 bg-green-400 rounded-full animate-ai-pulse-delayed-3 shadow-lg shadow-green-400/50"></div>
      
      {/* Corner morphing indicators */}
      <div className="absolute top-6 left-6 w-3 h-3 bg-gradient-to-br from-cyan-400 to-blue-400 animate-morph-corner-1 shadow-lg"></div>
      <div className="absolute top-6 right-6 w-3 h-3 bg-gradient-to-bl from-purple-400 to-pink-400 animate-morph-corner-2 shadow-lg"></div>
      <div className="absolute bottom-6 left-6 w-3 h-3 bg-gradient-to-tr from-green-400 to-emerald-400 animate-morph-corner-3 shadow-lg"></div>
      <div className="absolute bottom-6 right-6 w-3 h-3 bg-gradient-to-tl from-yellow-400 to-orange-400 animate-morph-corner-4 shadow-lg"></div>
    </div>
  );
};

export default AnimatedLogo;