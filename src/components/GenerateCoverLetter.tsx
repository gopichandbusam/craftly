import React, { useState, useRef, useEffect, memo, useCallback } from 'react';
import { Download, Edit3, Sparkles, Building, FileText, AlertCircle, Settings } from 'lucide-react';
import { ResumeData, JobApplication } from '../types';
import { generateCoverLetter } from '../services/geminiService';
import { loadApplicationFromFirebase, saveApplicationToFirebase, updateApplicationInFirebase } from '../services/optimizedFirebaseStorage';
import { loadCustomPrompts } from '../services/promptStorage';
import { trackCoverLetterFlow, trackError, trackFeatureUsage } from '../services/optimizedAnalytics';
import RichTextEditor from './RichTextEditor';
import jsPDF from 'jspdf';

interface GenerateCoverLetterProps {
  resumeData: ResumeData | null;
}

interface CustomPrompt {
  id: string;
  name: string;
  prompt: string;
  createdAt: Date;
}

const GenerateCoverLetter: React.FC<GenerateCoverLetterProps> = memo(({ resumeData }) => {
  const [jobDescription, setJobDescription] = useState('');
  const [application, setApplication] = useState<JobApplication | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string>('');
  const [customPrompts, setCustomPrompts] = useState<CustomPrompt[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<string>('');
  const previewRef = useRef<HTMLDivElement>(null);

  // Load saved application and custom prompts on mount
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const [savedApp, prompts] = await Promise.all([
          loadApplicationFromFirebase(),
          loadCustomPrompts()
        ]);
        
        if (savedApp) {
          setApplication(savedApp);
          setJobDescription(savedApp.jobDescription || '');
        }
        
        setCustomPrompts(prompts);
      } catch (error) {
        console.warn('Could not load saved data:', error);
      }
    };
    loadSavedData();
  }, []);

  const extractCompanyName = (jobDesc: string): string => {
    const patterns = [
      /(?:at|@|for|with|join)\s+([A-Z][a-zA-Z\s&.,Inc]+?)(?:\s|,|\.|\n|$)/,
      /([A-Z][a-zA-Z\s&.,Inc]+?)\s+(?:is|seeks|looking|hiring)/
    ];
    
    for (const pattern of patterns) {
      const match = jobDesc.match(pattern);
      if (match && match[1] && match[1].length > 2 && match[1].length < 50) {
        return match[1].trim().replace(/[.,]$/, '');
      }
    }
    return 'Target Company';
  };

  const handleGenerateCoverLetter = useCallback(async () => {
    if (!resumeData) {
      setError('Please upload a resume first');
      return;
    }

    if (!jobDescription.trim()) {
      setError('Please enter a job description');
      return;
    }

    const startTime = Date.now();
    const company = extractCompanyName(jobDescription);
    
    trackCoverLetterFlow('generate', { company });

    setIsGenerating(true);
    setError('');

    try {
      const customPrompt = selectedPrompt ? 
        customPrompts.find(p => p.id === selectedPrompt)?.prompt : 
        undefined;

      const coverLetter = await generateCoverLetter(resumeData, jobDescription, customPrompt);
      
      const newApplication: JobApplication = {
        company,
        position: 'Desired Position',
        jobDescription,
        coverLetter,
        customPrompt: selectedPrompt || undefined
      };

      setApplication(newApplication);
      
      // Save to optimized storage
      await saveApplicationToFirebase(newApplication);
      
      trackCoverLetterFlow('generate', {
        success: true,
        duration: Date.now() - startTime,
        usedCustomPrompt: !!selectedPrompt
      });
      
    } catch (error) {
      console.error('Generation failed:', error);
      trackError(error instanceof Error ? error.message : 'Unknown error', 'CoverLetterGenerator');
      setError(`Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  }, [jobDescription, resumeData, selectedPrompt, customPrompts]);

  const handleCoverLetterEdit = useCallback(async (newCoverLetter: string) => {
    if (application) {
      const updatedApplication = { ...application, coverLetter: newCoverLetter };
      setApplication(updatedApplication);
      
      trackCoverLetterFlow('edit');
      
      try {
        await updateApplicationInFirebase(updatedApplication);
      } catch (error) {
        console.warn('Failed to save edit:', error);
      }
    }
  }, [application]);

  const downloadPDF = useCallback(() => {
    if (!application || !resumeData) return;

    trackCoverLetterFlow('download', { format: 'pdf' });

    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;

    // Header
    pdf.setFontSize(22);
    pdf.setFont('helvetica', 'bold');
    pdf.text(resumeData.name, margin, 25);

    // Contact info
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${resumeData.email} | ${resumeData.phone}`, margin, 35);

    // Date and recipient
    let yPos = 55;
    pdf.text(new Date().toLocaleDateString(), margin, yPos);
    
    yPos += 15;
    pdf.text('Hiring Manager', margin, yPos);
    pdf.text(application.company, margin, yPos + 5);
    
    // Cover letter content - strip HTML tags
    yPos += 25;
    const plainText = application.coverLetter.replace(/<[^>]*>/g, '');
    const lines = pdf.splitTextToSize(plainText, maxWidth);
    pdf.text(lines, margin, yPos);

    // Signature
    const finalY = yPos + lines.length * 5 + 20;
    pdf.text('Sincerely,', margin, finalY);
    pdf.text(resumeData.name, margin, finalY + 15);

    pdf.save(`${resumeData.name.replace(/\s+/g, '_')}_Cover_Letter.pdf`);
  }, [application, resumeData]);

  if (!resumeData) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">No Resume Data</h1>
          <p className="text-gray-600 text-lg">Please upload a resume first to generate cover letters.</p>
        </div>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-12 text-center max-w-md w-full">
          <Sparkles className="animate-pulse w-16 h-16 text-purple-400 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Generating Cover Letter</h3>
          <p className="text-gray-600">AI is creating your personalized cover letter...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Generate Cover Letter</h1>
          <p className="text-gray-600 text-lg">Create personalized cover letters with AI</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 max-w-2xl">
            <AlertCircle size={20} className="inline mr-2" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Job Description Input */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8">
            <div className="flex items-center mb-6">
              <Building className="text-blue-500 mr-3" size={24} />
              <h2 className="text-2xl font-bold text-gray-800">Job Details</h2>
            </div>
            
            <div className="space-y-6">
              {/* Prompt Selection */}
              {customPrompts.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Settings size={16} className="inline mr-2" />
                    Prompt Template (Optional)
                  </label>
                  <select
                    value={selectedPrompt}
                    onChange={(e) => setSelectedPrompt(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    <option value="">Default Prompt</option>
                    {customPrompts.map((prompt) => (
                      <option key={prompt.id} value={prompt.id}>
                        {prompt.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-gray-600 mt-2">
                    Choose a custom prompt template or use the default one
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here..."
                  className="w-full h-80 p-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-200 resize-none text-sm"
                />
              </div>
              
              <button
                onClick={handleGenerateCoverLetter}
                disabled={!jobDescription.trim() || isGenerating}
                className="w-full bg-gradient-to-r from-purple-400 to-blue-400 text-white py-4 rounded-2xl font-semibold hover:from-purple-500 hover:to-blue-500 transform hover:scale-[1.02] transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <Sparkles className="mr-2" size={20} />
                Generate Cover Letter
              </button>
            </div>
          </div>

          {/* Cover Letter Preview */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="text-green-500 mr-3" size={24} />
                <h2 className="text-2xl font-bold text-gray-800">Cover Letter</h2>
              </div>
              
              {application && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100"
                    title={isEditing ? 'View mode' : 'Edit mode'}
                  >
                    <Edit3 size={20} />
                  </button>
                  <button
                    onClick={downloadPDF}
                    className="bg-gradient-to-r from-green-400 to-blue-400 text-white px-4 py-2 rounded-xl font-medium hover:from-green-500 hover:to-blue-500 transition-all duration-200 flex items-center"
                  >
                    <Download size={16} className="mr-2" />
                    PDF
                  </button>
                </div>
              )}
            </div>

            <div className="p-8 h-[600px] overflow-y-auto" ref={previewRef}>
              {application ? (
                <div className="space-y-4">
                  {/* Header */}
                  <div className="text-center border-b border-gray-200 pb-4 mb-6">
                    <h3 className="text-2xl font-bold text-gray-800">{resumeData.name}</h3>
                    <p className="text-gray-600">{resumeData.email} | {resumeData.phone}</p>
                    <p className="text-gray-600">{resumeData.location}</p>
                  </div>

                  {/* Date and Address */}
                  <div className="text-sm text-gray-600 mb-6">
                    <p>{new Date().toLocaleDateString()}</p>
                    <br />
                    <p>Hiring Manager</p>
                    <p>{application.company}</p>
                  </div>

                  {/* Content */}
                  {isEditing ? (
                    <RichTextEditor
                      content={application.coverLetter}
                      onChange={handleCoverLetterEdit}
                    />
                  ) : (
                    <div 
                      className="text-sm text-gray-700 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: application.coverLetter }}
                    />
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <FileText size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">Your cover letter will appear here</p>
                    <p className="text-sm">Enter a job description and click generate</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

GenerateCoverLetter.displayName = 'GenerateCoverLetter';

export default GenerateCoverLetter;