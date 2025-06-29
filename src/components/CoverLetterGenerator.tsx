import React, { useState, useRef, useEffect } from 'react';
import { Download, Edit3, Sparkles, Building, FileText, AlertCircle, CheckCircle, ArrowLeft, ExternalLink, Upload, WifiOff, Database, Settings, Wand2 } from 'lucide-react';
import { ResumeData, JobApplication } from '../types';
import { generateCoverLetter } from '../services/geminiService';
import { loadApplicationFromFirebase, saveApplicationToFirebase, updateApplicationInFirebase } from '../services/firebaseStorage';
import { 
  trackCoverLetterGenerationStart, 
  trackCoverLetterGenerationSuccess, 
  trackCoverLetterGenerationError,
  trackCoverLetterEdit,
  trackCoverLetterDownload,
  trackFirebaseOperation,
  trackError,
  trackPerformance,
  trackFeatureUsage
} from '../services/analytics';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import StorageDebugger from './StorageDebugger';
import CustomPromptEditor from './CustomPromptEditor';
import AccountLinking from './AccountLinking';

interface CoverLetterGeneratorProps {
  resumeData: ResumeData;
  onBack: () => void;
  onNoDataFound: () => void;
}

const CoverLetterGenerator: React.FC<CoverLetterGeneratorProps> = ({ resumeData, onBack, onNoDataFound }) => {
  const [jobDescription, setJobDescription] = useState('');
  const [application, setApplication] = useState<JobApplication | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string>('');
  const [generationProgress, setGenerationProgress] = useState(0);
  const [dataError, setDataError] = useState<string>('');
  const [isGeminiApiError, setIsGeminiApiError] = useState(false);
  const [showStorageDebugger, setShowStorageDebugger] = useState(false);
  const [showCustomPrompt, setShowCustomPrompt] = useState(false);
  const [showAccountLinking, setShowAccountLinking] = useState(false);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const previewRef = useRef<HTMLDivElement>(null);

  // Load saved application and custom prompt on component mount
  useEffect(() => {
    const loadSavedApplication = async () => {
      try {
        console.log('📋 Loading saved application...');
        const savedApplication = await loadApplicationFromFirebase();
        if (savedApplication) {
          console.log('✅ Loaded saved application from Firestore/device storage:', savedApplication);
          setApplication(savedApplication);
          setJobDescription(savedApplication.jobDescription || '');
          setDataError('');
          trackFirebaseOperation('load', 'application', true);
        } else {
          console.log('📋 No saved application found - this is normal for new users');
          setDataError('');
        }
      } catch (error) {
        console.error('❌ Error loading saved application:', error);
        setDataError('Failed to load previous applications from cloud storage');
        trackFirebaseOperation('load', 'application', false, error instanceof Error ? error.message : 'Unknown error');
        
        // Check if resume data is also missing
        if (!resumeData || (resumeData.name === 'Professional' && resumeData.email === 'contact@email.com')) {
          console.error('❌ Resume data appears to be invalid, redirecting to no-data state');
          onNoDataFound();
          return;
        }
      }
    };

    // Load custom prompt
    const savedPrompt = localStorage.getItem('craftly_custom_prompt');
    if (savedPrompt) {
      setCustomPrompt(savedPrompt);
      console.log('✅ Loaded custom prompt from localStorage');
    }

    // Validate resume data first
    if (!resumeData) {
      console.error('❌ No resume data provided to cover letter generator');
      onNoDataFound();
      return;
    }

    loadSavedApplication();
  }, [resumeData, onNoDataFound]);

  const handleGenerateCoverLetter = async () => {
    if (!jobDescription.trim()) {
      setError('Please enter a job description');
      return;
    }

    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      setError('Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env file.');
      return;
    }

    const startTime = Date.now();
    const company = extractCompanyName(jobDescription);
    const position = extractPositionTitle(jobDescription);

    // Track cover letter generation start
    trackCoverLetterGenerationStart({
      jobDescriptionLength: jobDescription.length,
      company,
      position,
      hasCustomPrompt: !!customPrompt
    });

    setIsGenerating(true);
    setError('');
    setDataError('');
    setIsGeminiApiError(false);
    setGenerationProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => Math.min(prev + 15, 85));
      }, 300);

      console.log('Generating cover letter with resume data:', resumeData);
      console.log('Job description:', jobDescription);
      console.log('Using custom prompt:', !!customPrompt);

      const coverLetter = await generateCoverLetter(resumeData, jobDescription, customPrompt);
      
      clearInterval(progressInterval);
      setGenerationProgress(100);

      // Create application without company data in Firebase - company data only used for generation
      const newApplication: JobApplication = {
        company, // This is for display purposes only, not stored in Firebase
        position, // This is for display purposes only, not stored in Firebase  
        jobDescription,
        coverLetter,
        customPrompt: customPrompt || undefined
      };

      setApplication(newApplication);
      
      const generationTime = (Date.now() - startTime) / 1000;

      // Track successful generation
      trackCoverLetterGenerationSuccess({
        generationTime,
        coverLetterLength: coverLetter.length,
        company,
        position,
        storage_type: 'firestore_with_device_cache',
        hasCustomPrompt: !!customPrompt
      });

      // Track performance
      trackPerformance({
        action: 'cover_letter_generation',
        duration: Date.now() - startTime,
        success: true,
        additionalData: {
          job_description_length: jobDescription.length,
          cover_letter_length: coverLetter.length,
          company,
          position,
          has_custom_prompt: !!customPrompt
        }
      });
      
      // Save to Firestore + device storage (company data for generation only, not stored)
      try {
        // Only save jobDescription and coverLetter to Firebase, not company data
        const applicationToStore = {
          jobDescription,
          coverLetter,
          customPrompt: customPrompt || undefined
        };
        await saveApplicationToFirebase(applicationToStore as JobApplication);
        console.log('✅ Application saved to Firestore + device storage successfully (no company data stored)');
        setDataError('');
        trackFirebaseOperation('save', 'application', true);
      } catch (firebaseError) {
        console.warn('⚠️ Firestore save failed, data saved to device storage:', firebaseError);
        setDataError('Application saved to device for 1 week - cloud sync will retry automatically');
        trackFirebaseOperation('save', 'application', false, firebaseError instanceof Error ? firebaseError.message : 'Unknown error');
      }
      
      setTimeout(() => {
        setIsGenerating(false);
        setGenerationProgress(0);
      }, 500);
    } catch (error) {
      console.error('Error generating cover letter:', error);
      
      const generationTime = (Date.now() - startTime) / 1000;
      let errorType: 'gemini_api' | 'network' | 'validation' | 'unknown' = 'unknown';
      
      // Check if it's a Gemini API error
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        if (errorMessage.includes('gemini api') || 
            errorMessage.includes('gopichand busam') ||
            errorMessage.includes('api key') ||
            errorMessage.includes('google generative ai')) {
          setIsGeminiApiError(true);
          errorType = 'gemini_api';
        } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
          errorType = 'network';
        } else if (errorMessage.includes('validation')) {
          errorType = 'validation';
        }
      }

      // Track generation error
      trackCoverLetterGenerationError({
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType,
        generationTime,
        hasCustomPrompt: !!customPrompt
      });

      // Track performance (failed)
      trackPerformance({
        action: 'cover_letter_generation',
        duration: Date.now() - startTime,
        success: false,
        additionalData: {
          job_description_length: jobDescription.length,
          error_type: errorType,
          has_custom_prompt: !!customPrompt
        }
      });
      
      setError(`Failed to generate cover letter: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const handleCoverLetterEdit = async (newCoverLetter: string) => {
    if (application) {
      const updatedApplication = { ...application, coverLetter: newCoverLetter };
      setApplication(updatedApplication);
      
      // Track cover letter edit
      trackCoverLetterEdit({
        editType: 'manual_edit',
        coverLetterLength: newCoverLetter.length
      });
      
      // Update in Firestore (only jobDescription and coverLetter, not company data)
      try {
        const applicationToStore = {
          jobDescription: updatedApplication.jobDescription,
          coverLetter: newCoverLetter,
          customPrompt: updatedApplication.customPrompt
        };
        await updateApplicationInFirebase(applicationToStore as JobApplication);
        console.log('✅ Application updated in Firestore + device storage successfully (no company data stored)');
        setDataError('');
        trackFirebaseOperation('update', 'application', true);
      } catch (error) {
        console.warn('⚠️ Firestore update failed, data saved to device storage:', error);
        setDataError('Changes saved to device for 1 week - cloud sync will retry automatically');
        trackFirebaseOperation('update', 'application', false, error instanceof Error ? error.message : 'Unknown error');
      }
    }
  };

  const extractCompanyName = (jobDesc: string): string => {
    // Enhanced company name extraction patterns
    const patterns = [
      /(?:at|@|for|with|join)\s+([A-Z][a-zA-Z\s&.,Inc]+?)(?:\s|,|\.|\n|$)/,
      /([A-Z][a-zA-Z\s&.,Inc]+?)\s+(?:is|seeks|looking|hiring|invites)/,
      /join\s+(?:our\s+team\s+at\s+)?([A-Z][a-zA-Z\s&.,Inc]+?)(?:\s|,|\.|\n)/i,
      /company:\s*([A-Z][a-zA-Z\s&.,Inc]+?)(?:\s|,|\.|\n|$)/i,
      /employer:\s*([A-Z][a-zA-Z\s&.,Inc]+?)(?:\s|,|\.|\n|$)/i,
      /([A-Z][a-zA-Z\s&.,Inc]+?)\s+(?:team|department|division)/i
    ];
    
    for (const pattern of patterns) {
      const match = jobDesc.match(pattern);
      if (match && match[1]) {
        let company = match[1].trim().replace(/[.,]$/, '');
        // Clean up common suffixes and prefixes
        company = company.replace(/\s+(Inc|LLC|Corp|Ltd|Co)\.?$/i, ' $1');
        company = company.replace(/^(The|A)\s+/i, '');
        if (company.length > 2 && company.length < 80) {
          return company;
        }
      }
    }
    
    return 'Target Company';
  };

  const extractPositionTitle = (jobDesc: string): string => {
    const lines = jobDesc.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Look for job title patterns in first few lines
    for (const line of lines.slice(0, 5)) {
      if (line.length > 5 && line.length < 100 && 
          !line.toLowerCase().includes('company') &&
          !line.toLowerCase().includes('location') &&
          !line.toLowerCase().includes('salary') &&
          !line.toLowerCase().includes('benefits') &&
          !line.includes('@') &&
          !line.toLowerCase().includes('posted') &&
          !line.toLowerCase().includes('apply')) {
        // Check if it looks like a job title
        if (line.match(/(?:engineer|developer|manager|analyst|designer|intern|specialist|coordinator|director|lead|senior|junior|associate)/i)) {
          return line;
        }
      }
    }
    
    // Look for common job title patterns
    const titlePatterns = [
      /(?:position|role|job|title):\s*([^\n]+)/i,
      /((?:senior|junior|lead|principal|staff)?\s*(?:software|web|mobile|full.?stack|front.?end|back.?end)?\s*(?:engineer|developer|designer|analyst|manager|intern))/i,
      /job\s+title:\s*([^\n]+)/i,
      /we're\s+(?:looking\s+for|hiring)\s+(?:a|an)?\s*([^\n]+?)(?:\s+to|\s+who|\s+with|\.)/i
    ];
    
    for (const pattern of titlePatterns) {
      const match = jobDesc.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    return 'Desired Position';
  };

  const downloadPDF = async () => {
    if (!application || !previewRef.current) return;

    // Track download
    trackCoverLetterDownload({
      format: 'pdf',
      company: application.company,
      position: application.position
    });

    try {
      // Create a clean version for PDF generation
      const element = previewRef.current;
      
      // Use html2canvas to capture the exact visual representation
      const canvas = await html2canvas(element, {
        scale: 2, // Higher resolution
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight
      });

      const imgData = canvas.toDataURL('image/png');
      
      // Create PDF with single page constraint
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate scaling to fit on one page
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / (imgWidth * 0.264583), pdfHeight / (imgHeight * 0.264583));
      
      const finalWidth = imgWidth * 0.264583 * ratio;
      const finalHeight = imgHeight * 0.264583 * ratio;
      
      // Center the content on the page
      const x = (pdfWidth - finalWidth) / 2;
      const y = (pdfHeight - finalHeight) / 2;
      
      pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);
      
      // Download the PDF
      const fileName = `${resumeData.name.replace(/\s+/g, '_')}_Cover_Letter_${application.company.replace(/\s+/g, '_')}.pdf`;
      pdf.save(fileName);
      
      console.log('✅ PDF downloaded successfully - exactly what you see');
    } catch (error) {
      console.error('❌ Error generating PDF:', error);
      
      // Fallback to text-based PDF
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.width;
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;

      // Header with styling
      pdf.setFillColor(245, 245, 245);
      pdf.rect(0, 0, pageWidth, 40, 'F');
      
      pdf.setFontSize(22);
      pdf.setFont('helvetica', 'bold');
      pdf.text(resumeData.name, margin, 25);

      // Contact info
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      let yPos = 50;
      pdf.text(`${resumeData.email} | ${resumeData.phone}`, margin, yPos);
      pdf.text(`LinkedIn: linkedin.com/in/${resumeData.linkedin} | ${resumeData.location}`, margin, yPos + 5);

      // Date and recipient
      yPos += 20;
      pdf.text(new Date().toLocaleDateString(), margin, yPos);
      
      yPos += 15;
      const recipientInfo = [
        'Hiring Manager',
        application.company,
        'Company Address',
        'City, State ZIP'
      ];
      
      recipientInfo.forEach(line => {
        pdf.text(line, margin, yPos);
        yPos += 5;
      });

      // Cover letter body - ensure it fits on one page
      yPos += 15;
      const lines = pdf.splitTextToSize(application.coverLetter, maxWidth);
      
      // Calculate available space and truncate if necessary for one page
      const availableHeight = pdf.internal.pageSize.height - yPos - 50; // Leave space for signature
      const maxLines = Math.floor(availableHeight / 5);
      
      const finalLines = lines.slice(0, maxLines);
      pdf.text(finalLines, margin, yPos);

      // Signature area
      const finalY = Math.min(yPos + finalLines.length * 5 + 20, pdf.internal.pageSize.height - 40);
      pdf.text('Sincerely,', margin, finalY);
      pdf.text(resumeData.name, margin, finalY + 15);

      pdf.save(`${resumeData.name.replace(/\s+/g, '_')}_Cover_Letter_${application.company.replace(/\s+/g, '_')}.pdf`);
    }
  };

  const handleCustomPromptSave = (newPrompt: string) => {
    setCustomPrompt(newPrompt);
    trackFeatureUsage('custom_prompt_saved', {
      prompt_length: newPrompt.length,
      is_custom: newPrompt !== ''
    });
  };

  // Check if resume data is valid
  const isResumeDataValid = resumeData && 
    (resumeData.name !== 'Professional' || 
     resumeData.email !== 'contact@email.com' || 
     resumeData.skills.length > 1 ||
     resumeData.experience.length > 1);

  if (!isResumeDataValid) {
    trackError({
      error: 'Invalid resume data in cover letter generator',
      errorType: 'data_validation',
      location: 'CoverLetterGenerator.tsx',
      userAction: 'loading_cover_letter_page'
    });

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-12 text-center max-w-md w-full border border-white/20">
          <AlertCircle size={64} className="text-red-400 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Invalid Resume Data</h3>
          <div className="space-y-3 text-gray-600 mb-6">
            <p>The resume data appears to be incomplete or corrupted.</p>
            <p className="text-sm">Please upload your resume again to continue.</p>
          </div>
          
          <button
            onClick={onBack}
            className="w-full bg-gradient-to-r from-blue-400 to-purple-400 text-white py-4 rounded-2xl font-semibold hover:from-blue-500 hover:to-purple-500 transform hover:scale-[1.02] transition-all duration-200 shadow-lg flex items-center justify-center"
          >
            <Upload size={20} className="mr-2" />
            Upload Resume Again
          </button>
        </div>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-12 text-center max-w-md w-full border border-white/20">
          <div className="animate-pulse mb-6">
            <Sparkles size={64} className="text-purple-400 mx-auto" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">AI is Crafting Your Cover Letter</h3>
          <p className="text-gray-600 mb-6">
            {customPrompt ? 'Using your custom prompt to create a personalized cover letter...' : 'Analyzing your resume and matching it with the job requirements...'}
          </p>
          
          <div className="space-y-3 text-sm text-gray-600 mb-6">
            <div className="flex items-center justify-center">
              <CheckCircle size={16} className="text-green-500 mr-2" />
              <span>Resume analysis complete</span>
            </div>
            <div className="flex items-center justify-center">
              <CheckCircle size={16} className="text-green-500 mr-2" />
              <span>Job requirements identified</span>
            </div>
            <div className="flex items-center justify-center">
              {generationProgress >= 50 ? (
                <CheckCircle size={16} className="text-green-500 mr-2" />
              ) : (
                <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-500 rounded-full animate-spin mr-2"></div>
              )}
              <span>{customPrompt ? 'Applying custom instructions' : 'Generating personalized content'}</span>
            </div>
          </div>

          <div className="bg-gray-200 rounded-full h-3 mb-2">
            <div 
              className="bg-gradient-to-r from-blue-400 to-purple-400 h-3 rounded-full transition-all duration-300"
              style={{ width: `${generationProgress}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500">{generationProgress}% complete</p>
          
          {customPrompt && (
            <div className="mt-4 text-xs text-purple-600 bg-purple-50 p-2 rounded-lg">
              🎨 Using custom AI prompt for personalized results
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      {/* Floating Custom Prompt Button */}
      <button
        onClick={() => {
          setShowCustomPrompt(true);
          trackFeatureUsage('open_custom_prompt');
        }}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 z-40"
        title="Customize AI Prompt"
      >
        <Wand2 size={24} />
      </button>

      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => {
                trackFeatureUsage('back_to_upload');
                onBack();
              }}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors bg-white/50 px-4 py-2 rounded-xl hover:bg-white/70"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to Resume Upload
            </button>
            
            <div className="flex space-x-2">
              <button
                onClick={() => setShowAccountLinking(true)}
                className="flex items-center text-gray-600 hover:text-blue-600 transition-colors bg-white/50 px-4 py-2 rounded-xl hover:bg-white/70"
                title="Account Linking"
              >
                <Settings size={20} className="mr-2" />
                Account
              </button>
              
              <button
                onClick={() => setShowStorageDebugger(true)}
                className="flex items-center text-gray-600 hover:text-blue-600 transition-colors bg-white/50 px-4 py-2 rounded-xl hover:bg-white/70"
                title="Storage Debugger"
              >
                <Database size={20} className="mr-2" />
                Storage
              </button>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-800 mb-2">AI Cover Letter Generator</h1>
          <p className="text-gray-600">Create tailored one-page cover letters using AI {customPrompt && '(Custom prompt active)'}</p>
        </div>

        {error && (
          <div className={`mb-6 p-4 border rounded-2xl flex items-center max-w-2xl ${
            isGeminiApiError 
              ? 'bg-orange-50 border-orange-200 text-orange-700' 
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            {isGeminiApiError ? (
              <WifiOff size={20} className="mr-3 flex-shrink-0" />
            ) : (
              <AlertCircle size={20} className="mr-3 flex-shrink-0" />
            )}
            <div className="flex-1">
              <p className="font-medium mb-1">
                {isGeminiApiError ? 'Gemini AI Service Issue' : 'Generation Error'}
              </p>
              <p className="text-sm">{error}</p>
              
              {isGeminiApiError && (
                <div className="mt-3 p-3 bg-orange-100 rounded-lg">
                  <p className="text-xs text-orange-800 font-medium">🤖 Service Status</p>
                  <p className="text-xs text-orange-700 mt-1">
                    The Gemini AI service is currently experiencing issues. 
                    Please wait for Gopichand Busam to resolve this, or try again later.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {dataError && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl flex items-center text-yellow-700 max-w-2xl">
            <Database size={20} className="mr-3 flex-shrink-0" />
            <div>
              <p className="font-medium">Device Storage Notice</p>
              <p className="text-sm">{dataError}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left side - Job Description Input */}
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/20">
              <div className="flex items-center mb-6">
                <Building className="text-blue-500 mr-3" size={24} />
                <h2 className="text-2xl font-bold text-gray-800">Job Details</h2>
              </div>
              
              <div className="space-y-4">
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the complete job description here... Include company name, position title, requirements, and responsibilities for the best results!"
                  className="w-full h-80 p-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-200 resize-none text-sm"
                />
                
                <button
                  onClick={handleGenerateCoverLetter}
                  disabled={!jobDescription.trim() || isGenerating}
                  className="w-full bg-gradient-to-r from-purple-400 to-blue-400 text-white py-4 rounded-2xl font-semibold hover:from-purple-500 hover:to-blue-500 transform hover:scale-[1.02] transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <Sparkles className="mr-2" size={20} />
                  Generate One-Page Cover Letter
                </button>
                
                {customPrompt && (
                  <div className="text-xs text-purple-600 bg-purple-50 p-2 rounded-lg flex items-center">
                    <Wand2 size={12} className="mr-1" />
                    Custom AI prompt active - click the floating button to edit
                  </div>
                )}
              </div>
            </div>

            {/* Resume Preview */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/20">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Your Resume Data</h3>
              <div className="space-y-3 text-sm">
                <p><strong>Name:</strong> {resumeData.name}</p>
                <p><strong>Email:</strong> 
                  <a href={`mailto:${resumeData.email}`} className="text-blue-500 hover:text-blue-600 ml-1">
                    {resumeData.email}
                  </a>
                </p>
                <p><strong>Phone:</strong> {resumeData.phone}</p>
                <p><strong>Location:</strong> {resumeData.location}</p>
                <p><strong>LinkedIn:</strong> 
                  <a 
                    href={`https://linkedin.com/in/${resumeData.linkedin}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600 ml-1 inline-flex items-center"
                  >
                    linkedin.com/in/{resumeData.linkedin}
                    <ExternalLink size={12} className="ml-1" />
                  </a>
                </p>
                <p><strong>Skills:</strong> {resumeData.skills.slice(0, 5).join(', ')}{resumeData.skills.length > 5 ? '...' : ''}</p>
                <p><strong>Experience:</strong> {resumeData.experience.length} entries</p>
                <p><strong>Education:</strong> {resumeData.education.length} entries</p>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-700 font-medium">📱 Data stored locally (1 week) + Firestore backup</p>
                  <p className="text-xs text-blue-600 mt-1">💡 Company data used for generation only, not stored in database</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Cover Letter Preview */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="text-green-500 mr-3" size={24} />
                <h2 className="text-2xl font-bold text-gray-800">One-Page Cover Letter</h2>
              </div>
              
              {application && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setIsEditing(!isEditing);
                      if (!isEditing) {
                        trackFeatureUsage('edit_cover_letter');
                      }
                    }}
                    className="p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100"
                    title="Edit cover letter"
                  >
                    <Edit3 size={20} />
                  </button>
                  <button
                    onClick={downloadPDF}
                    className="bg-gradient-to-r from-green-400 to-blue-400 text-white px-4 py-2 rounded-xl font-medium hover:from-green-500 hover:to-blue-500 transition-all duration-200 flex items-center"
                  >
                    <Download size={16} className="mr-2" />
                    Download PDF
                  </button>
                </div>
              )}
            </div>

            <div className="p-8 h-[600px] overflow-y-auto" ref={previewRef}>
              {application ? (
                <div className="space-y-4 max-h-[550px] overflow-hidden"> {/* Enforce one-page constraint */}
                  {/* Header */}
                  <div className="text-center border-b border-gray-200 pb-4 mb-6">
                    <h3 className="text-2xl font-bold text-gray-800">{resumeData.name}</h3>
                    <p className="text-gray-600">{resumeData.email} | {resumeData.phone}</p>
                    <p className="text-gray-600">LinkedIn: linkedin.com/in/{resumeData.linkedin}</p>
                    <p className="text-gray-600">{resumeData.location}</p>
                  </div>

                  {/* Date and Address */}
                  <div className="text-sm text-gray-600 mb-6">
                    <p>{new Date().toLocaleDateString()}</p>
                    <br />
                    <p>Hiring Manager</p>
                    <p>{application.company}</p>
                    <p>Company Address</p>
                    <p>City, State ZIP</p>
                  </div>

                  {/* Cover Letter Content */}
                  {isEditing ? (
                    <div className="space-y-4">
                      <textarea
                        value={application.coverLetter}
                        onChange={(e) => handleCoverLetterEdit(e.target.value)}
                        className="w-full h-48 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none text-sm"
                        placeholder="Edit your cover letter here..."
                      />
                      <button
                        onClick={() => setIsEditing(false)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 transition-colors"
                      >
                        Save Changes
                      </button>
                      <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded-lg">
                        Changes are automatically saved to device (1 week) + Firestore
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line overflow-hidden">
                      {application.coverLetter}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <FileText size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">Your one-page AI cover letter will appear here</p>
                    <p className="text-sm">Enter a job description and click generate to get started</p>
                    <p className="text-xs text-blue-600 mt-4 bg-blue-50 p-2 rounded-lg">
                      📱 PDF download captures exactly what you see • Company data used for generation only
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Prompt Editor Modal */}
      <CustomPromptEditor 
        isVisible={showCustomPrompt}
        onClose={() => setShowCustomPrompt(false)}
        onSave={handleCustomPromptSave}
        currentPrompt={customPrompt}
      />

      {/* Storage Debugger Modal */}
      <StorageDebugger 
        isVisible={showStorageDebugger}
        onClose={() => setShowStorageDebugger(false)}
      />

      {/* Account Linking Modal */}
      {showAccountLinking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <AccountLinking />
            <button
              onClick={() => setShowAccountLinking(false)}
              className="mt-4 w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoverLetterGenerator;