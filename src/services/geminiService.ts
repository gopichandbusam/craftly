import { GoogleGenerativeAI } from '@google/generative-ai';
import { ResumeData } from '../types';
import { formatPromptWithData, COVER_LETTER_PROMPT } from './promptTemplates';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const generateCoverLetter = async (
  resumeData: ResumeData, 
  jobDescription: string, 
  customPrompt?: string
): Promise<string> => {
  try {
    console.log('📝 Starting cover letter generation...');
    console.log('📝 Resume data for cover letter:', resumeData);
    console.log('📝 Job description (first 500 chars):', jobDescription.substring(0, 500));
    console.log('📝 Using custom prompt:', !!customPrompt);
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Use custom prompt if provided, otherwise use default
    const basePrompt = customPrompt || COVER_LETTER_PROMPT;
    const prompt = formatPromptWithData(resumeData, jobDescription, basePrompt);
    
    console.log('📝 Generated prompt for AI (first 1000 chars):', prompt.substring(0, 1000));
    if (customPrompt) {
      console.log('🎨 Using custom prompt for personalized generation');
    }

    console.log('📝 Sending cover letter generation request to AI...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let coverLetter = response.text();
    
    console.log('📝 Raw AI cover letter response:', coverLetter);
    
    // Clean up the cover letter for one-page format
    coverLetter = coverLetter.trim();
    console.log('📝 After trim:', coverLetter.length, 'characters');
    
    // Remove any duplicate "Sincerely," at the end
    const beforeDuplicateRemoval = coverLetter;
    coverLetter = coverLetter.replace(/Sincerely,\s*Sincerely,/g, 'Sincerely,');
    if (beforeDuplicateRemoval !== coverLetter) {
      console.log('📝 Removed duplicate "Sincerely,"');
    }
    
    // Ensure proper spacing before "Sincerely," and add name after it
    if (coverLetter.includes('Sincerely,')) {
      const beforeSpacing = coverLetter;
      // Add proper spacing before "Sincerely," and include the name
      coverLetter = coverLetter.replace(/([^\n])\s*Sincerely,\s*$/g, `$1\n\nSincerely,\n${resumeData.name}`);
      coverLetter = coverLetter.replace(/([^\n])\s*Sincerely,([^,\n])/g, `$1\n\nSincerely,\n${resumeData.name}$2`);
      if (beforeSpacing !== coverLetter) {
        console.log('📝 Added proper spacing before "Sincerely," and included name');
      }
    } else {
      // If no "Sincerely," found, add it with the name
      coverLetter += `\n\nSincerely,\n${resumeData.name}`;
      console.log('📝 Added "Sincerely," with name at the end');
    }
    
    // Remove any bracketed placeholder text
    const beforeBracketRemoval = coverLetter;
    coverLetter = coverLetter.replace(/\[.*?\]/g, '');
    if (beforeBracketRemoval !== coverLetter) {
      console.log('📝 Removed bracketed placeholder text');
    }
    
    // Clean up extra whitespace
    const beforeWhitespaceCleanup = coverLetter;
    coverLetter = coverLetter.replace(/\n{3,}/g, '\n\n');
    if (beforeWhitespaceCleanup !== coverLetter) {
      console.log('📝 Cleaned up extra whitespace');
    }
    
    // Ensure one-page length (approximately 400-500 words max)
    const words = coverLetter.split(/\s+/).filter(word => word.length > 0);
    if (words.length > 500) {
      console.log('📝 Cover letter too long, truncating for one-page format');
      // Keep the opening, middle portion, and closing
      const openingWords = words.slice(0, 100);
      const middleWords = words.slice(100, 350);
      const closingWords = words.slice(-50);
      
      const truncatedWords = [...openingWords, ...middleWords, ...closingWords];
      coverLetter = truncatedWords.join(' ');
      
      // Re-add proper ending
      if (!coverLetter.includes('Sincerely,')) {
        coverLetter += `\n\nSincerely,\n${resumeData.name}`;
      }
    }
    
    console.log('📝 Final one-page cover letter:');
    console.log('📝 Length:', coverLetter.length, 'characters');
    console.log('📝 Word count:', coverLetter.split(/\s+/).length, 'words');
    console.log('📝 Final content:', coverLetter);
    console.log('📄 Optimized for single-page PDF generation');
    
    return coverLetter;
  } catch (error) {
    console.error('❌ Error generating cover letter:', error);
    
    // Check if it's a Gemini API specific error
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      
      // Check for specific Gemini API error patterns
      if (errorMessage.includes('api key') || 
          errorMessage.includes('api_key_invalid') ||
          errorMessage.includes('invalid api key') ||
          errorMessage.includes('authentication') ||
          errorMessage.includes('unauthorized') ||
          errorMessage.includes('forbidden') ||
          errorMessage.includes('quota') ||
          errorMessage.includes('limit') ||
          errorMessage.includes('generativelanguage.googleapis.com') ||
          errorMessage.includes('google generative ai')) {
        
        throw new Error('🤖 Gemini API is not working. Please wait until it is fixed by Gopichand Busam. You can try again later or contact support for assistance.');
      }
      
      // Check for network/connectivity issues
      if (errorMessage.includes('network') || 
          errorMessage.includes('fetch') ||
          errorMessage.includes('connection') ||
          errorMessage.includes('timeout')) {
        
        throw new Error('🌐 Network connection issue with Gemini API. Please check your internet connection and try again. If the problem persists, Gemini API might be temporarily down - wait until it is fixed by Gopichand Busam.');
      }
      
      // Check for rate limiting or quota issues
      if (errorMessage.includes('rate') || 
          errorMessage.includes('quota') ||
          errorMessage.includes('too many requests')) {
        
        throw new Error('⏰ Gemini API rate limit exceeded. Please wait a few minutes before trying again. If this continues, the API may need attention from Gopichand Busam.');
      }
    }
    
    throw new Error('Failed to generate cover letter. Please check your API key and try again. If the problem persists, Gemini API may be experiencing issues - wait until it is fixed by Gopichand Busam.');
  }
};