import * as pdfjsLib from 'pdfjs-dist';
import { ResumeData } from '../types';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const parseResumeFromPDF = async (file: File): Promise<ResumeData> => {
  try {
    console.log('📄 Starting PDF parsing for file:', file.name);
    console.log('📄 File size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
    
    const arrayBuffer = await file.arrayBuffer();
    console.log('📄 ArrayBuffer created, size:', arrayBuffer.byteLength, 'bytes');
    
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    console.log('📄 PDF loaded successfully, pages:', pdf.numPages);
    
    let fullText = '';
    let pageTexts: string[] = [];
    
    // Extract text from all pages
    for (let i = 1; i <= pdf.numPages; i++) {
      console.log(`📄 Processing page ${i}/${pdf.numPages}`);
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      pageTexts.push(pageText);
      fullText += pageText + '\n';
      console.log(`📄 Page ${i} text length:`, pageText.length, 'characters');
    }
    
    console.log('📄 Total extracted text length:', fullText.length, 'characters');
    console.log('📄 Raw PDF text (first 500 chars):', fullText.substring(0, 500));
    
    if (fullText.trim().length === 0) {
      throw new Error('No text content found in PDF. The PDF might be image-based or corrupted.');
    }
    
    return await parseResumeWithAI(fullText, 'PDF');
  } catch (error) {
    console.error('❌ Error parsing PDF:', error);
    if (error instanceof Error) {
      throw new Error(`PDF parsing failed: ${error.message}`);
    }
    throw new Error('Failed to parse PDF. Please try uploading a text file or a different PDF.');
  }
};

export const parseResumeFromText = async (text: string): Promise<ResumeData> => {
  console.log('📝 Starting text parsing');
  console.log('📝 Raw text length:', text.length, 'characters');
  console.log('📝 Raw text (first 500 chars):', text.substring(0, 500));
  
  if (text.trim().length === 0) {
    throw new Error('The uploaded file appears to be empty or contains no readable text.');
  }
  
  return await parseResumeWithAI(text, 'TEXT');
};

const parseResumeWithAI = async (resumeText: string, sourceType: string): Promise<ResumeData> => {
  try {
    console.log(`🤖 Starting AI-powered resume parsing from ${sourceType}...`);
    console.log('🤖 Text length for AI processing:', resumeText.length, 'characters');
    console.log('🤖 Resume text preview (first 1000 chars):', resumeText.substring(0, 1000));
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are an expert resume parser with advanced text analysis capabilities. Extract and organize information from the resume text with high accuracy. Focus on finding real, specific information rather than using generic defaults.

RESUME TEXT TO ANALYZE:
${resumeText}

Extract the following information and return it in JSON format:

{
  "name": "Full name of the person",
  "email": "Email address",
  "phone": "Phone number (keep original format)",
  "location": "City, State or City, Country",
  "linkedin": "LinkedIn username only (not full URL)",
  "skills": ["Array of technical and professional skills"],
  "experience": ["Array of work experience entries with company, role, dates, and key responsibilities"],
  "education": ["Array of education entries with degree, institution, year, and relevant details"],
  "summary": "Professional summary or objective statement"
}

DETAILED EXTRACTION GUIDELINES:

1. **NAME EXTRACTION**:
   - Look for the person's full name, typically at the top of the resume
   - Avoid extracting company names, job titles, or section headers
   - If multiple names appear, choose the one that appears to be the person's name
   - Only use "Professional" if absolutely no name can be found

2. **CONTACT INFORMATION**:
   - Email: Extract complete, valid email addresses
   - Phone: Preserve original formatting (e.g., (555) 123-4567, +1-555-123-4567)
   - Location: Look for city, state/country combinations
   - LinkedIn: Extract username from URLs like linkedin.com/in/username

3. **SKILLS EXTRACTION**:
   - Look for dedicated skills sections
   - Extract technical skills, programming languages, frameworks, tools
   - Include soft skills if explicitly mentioned
   - Categorize and clean up skill names
   - Avoid duplicates and generic terms

4. **EXPERIENCE EXTRACTION**:
   - Extract job titles, company names, employment dates
   - Include key responsibilities and achievements
   - Preserve quantifiable accomplishments (numbers, percentages, etc.)
   - Format as: "Job Title at Company Name (Dates) - Key responsibilities and achievements"
   - Extract internships, freelance work, and contract positions

5. **EDUCATION EXTRACTION**:
   - Extract degree types, majors, institution names, graduation years
   - Include GPA if mentioned and significant
   - Include relevant coursework, honors, certifications
   - Format as: "Degree in Major from Institution (Year) - Additional details"

6. **PROFESSIONAL SUMMARY**:
   - Look for summary, objective, or about sections
   - Extract career highlights and key qualifications
   - Avoid generic statements, focus on specific achievements

QUALITY REQUIREMENTS:
- Only extract information that is explicitly present in the text
- Ensure all array items are meaningful and non-empty
- Maintain original formatting for contact information
- Use proper capitalization and formatting
- Remove any placeholder text or template content
- Validate that extracted data makes logical sense

DEFAULT VALUES (use only when information is truly not found):
- name: "Professional"
- email: "contact@email.com"
- phone: "+1 (555) 000-0000"
- location: "Location Not Specified"
- linkedin: "profile"

Return only the JSON object with no additional text, explanations, or formatting.
`;

    console.log('🤖 Sending comprehensive extraction request to Gemini AI...');
    console.log('🤖 Prompt length:', prompt.length, 'characters');
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiResponse = response.text();
    
    console.log('🤖 Raw AI response received (length):', aiResponse.length, 'characters');
    console.log('🤖 Raw AI response:', aiResponse);
    
    // Clean and extract JSON from response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('❌ No valid JSON found in AI response');
      console.log('🤖 Full AI response for debugging:', aiResponse);
      throw new Error('AI response did not contain valid JSON format');
    }
    
    const jsonString = jsonMatch[0];
    console.log('🤖 Extracted JSON string:', jsonString);
    
    let parsedData;
    try {
      parsedData = JSON.parse(jsonString);
      console.log('🤖 Successfully parsed JSON data:', parsedData);
    } catch (parseError) {
      console.error('❌ JSON parsing failed:', parseError);
      console.log('🤖 Problematic JSON string:', jsonString);
      throw new Error('Failed to parse AI response as valid JSON');
    }
    
    // Comprehensive data validation and logging
    console.log('📊 DETAILED EXTRACTION ANALYSIS:');
    console.log('👤 Name extraction:', parsedData.name);
    console.log('📧 Email extraction:', parsedData.email);
    console.log('📱 Phone extraction:', parsedData.phone);
    console.log('📍 Location extraction:', parsedData.location);
    console.log('💼 LinkedIn extraction:', parsedData.linkedin);
    
    // Skills analysis
    const skills = Array.isArray(parsedData.skills) ? parsedData.skills : [];
    console.log('🛠️ Skills extraction:');
    console.log('  - Total count:', skills.length);
    console.log('  - Valid skills:', skills.filter(s => typeof s === 'string' && s.trim().length > 0).length);
    console.log('  - Skills list:', skills);
    
    // Experience analysis
    const experience = Array.isArray(parsedData.experience) ? parsedData.experience : [];
    console.log('💼 Experience extraction:');
    console.log('  - Total count:', experience.length);
    console.log('  - Valid entries:', experience.filter(e => typeof e === 'string' && e.trim().length > 0).length);
    console.log('  - Experience entries:', experience);
    
    // Education analysis
    const education = Array.isArray(parsedData.education) ? parsedData.education : [];
    console.log('🎓 Education extraction:');
    console.log('  - Total count:', education.length);
    console.log('  - Valid entries:', education.filter(e => typeof e === 'string' && e.trim().length > 0).length);
    console.log('  - Education entries:', education);
    
    console.log('📝 Summary extraction:', parsedData.summary);
    
    // Create validated resume data with comprehensive error handling
    const resumeData: ResumeData = {
      name: (typeof parsedData.name === 'string' && parsedData.name.trim()) || 'Professional',
      email: (typeof parsedData.email === 'string' && parsedData.email.trim()) || 'contact@email.com',
      phone: (typeof parsedData.phone === 'string' && parsedData.phone.trim()) || '+1 (555) 000-0000',
      location: (typeof parsedData.location === 'string' && parsedData.location.trim()) || 'Location Not Specified',
      linkedin: (typeof parsedData.linkedin === 'string' && parsedData.linkedin.trim()) || 'profile',
      skills: skills.filter((skill: any) => typeof skill === 'string' && skill.trim().length > 0),
      experience: experience.filter((exp: any) => typeof exp === 'string' && exp.trim().length > 0),
      education: education.filter((edu: any) => typeof edu === 'string' && edu.trim().length > 0),
      summary: (typeof parsedData.summary === 'string' && parsedData.summary.trim()) || 'Experienced professional with a proven track record of success.'
    };
    
    // Final validation and quality assessment
    console.log('✅ FINAL VALIDATED RESUME DATA:');
    console.log('👤 Final Name:', resumeData.name, '(Default:', resumeData.name === 'Professional', ')');
    console.log('📧 Final Email:', resumeData.email, '(Default:', resumeData.email === 'contact@email.com', ')');
    console.log('📱 Final Phone:', resumeData.phone, '(Default:', resumeData.phone === '+1 (555) 000-0000', ')');
    console.log('📍 Final Location:', resumeData.location, '(Default:', resumeData.location === 'Location Not Specified', ')');
    console.log('💼 Final LinkedIn:', resumeData.linkedin, '(Default:', resumeData.linkedin === 'profile', ')');
    console.log('🛠️ Final Skills (', resumeData.skills.length, '):', resumeData.skills);
    console.log('💼 Final Experience (', resumeData.experience.length, '):', resumeData.experience);
    console.log('🎓 Final Education (', resumeData.education.length, '):', resumeData.education);
    console.log('📝 Final Summary:', resumeData.summary);
    
    // Data quality assessment
    const qualityScore = calculateDataQuality(resumeData);
    console.log('📊 Data Quality Score:', qualityScore, '/100');
    
    if (qualityScore < 30) {
      console.warn('⚠️ Low data quality detected. Consider manual review.');
    }
    
    console.log('✅ Resume parsing completed successfully with AI!');
    return resumeData;
    
  } catch (error) {
    console.error('❌ Error in AI parsing:', error);
    
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
        
        throw new Error('🤖 Gemini API is not working. Please wait until it is fixed by Gopichand Busam. Meanwhile, you can try uploading a different resume or contact support.');
      }
      
      // Check for network/connectivity issues
      if (errorMessage.includes('network') || 
          errorMessage.includes('fetch') ||
          errorMessage.includes('connection') ||
          errorMessage.includes('timeout')) {
        
        throw new Error('🌐 Network connection issue with Gemini API. Please check your internet connection and try again. If the problem persists, Gemini API might be temporarily down - wait until it is fixed by Gopichand Busam.');
      }
    }
    
    console.log('🔄 Attempting fallback parsing...');
    
    // Enhanced fallback parsing
    return await enhancedFallbackParsing(resumeText, sourceType);
  }
};

const calculateDataQuality = (data: ResumeData): number => {
  let score = 0;
  
  // Name quality (20 points)
  if (data.name !== 'Professional') score += 20;
  
  // Contact info quality (30 points)
  if (data.email !== 'contact@email.com') score += 10;
  if (data.phone !== '+1 (555) 000-0000') score += 10;
  if (data.location !== 'Location Not Specified') score += 10;
  
  // Content quality (50 points)
  if (data.skills.length > 1) score += 15;
  if (data.experience.length > 1) score += 20;
  if (data.education.length > 1) score += 15;
  
  return score;
};

const enhancedFallbackParsing = async (text: string, sourceType: string): Promise<ResumeData> => {
  console.log('🔄 Enhanced fallback parsing initiated for', sourceType);
  
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  console.log('🔄 Processing', lines.length, 'lines of text');
  
  // Enhanced email extraction
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emailMatches = text.match(emailRegex);
  const email = emailMatches?.[0] || 'contact@email.com';
  console.log('🔄 Email found:', email);
  
  // Enhanced phone extraction
  const phoneRegex = /(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g;
  const phoneMatches = text.match(phoneRegex);
  const phone = phoneMatches?.[0] || '+1 (555) 000-0000';
  console.log('🔄 Phone found:', phone);
  
  // Enhanced name extraction
  let name = 'Professional';
  const namePatterns = [
    /^[A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?$/,
    /^([A-Z][a-z]+(?:\s+[A-Z][a-z]*){1,3})$/
  ];
  
  for (const line of lines.slice(0, 15)) {
    if (line.length > 3 && line.length < 60 && 
        !line.includes('@') && 
        !line.match(/\d{3}/) && 
        !line.toLowerCase().includes('resume') &&
        !line.toLowerCase().includes('cv') &&
        namePatterns.some(pattern => pattern.test(line))) {
      name = line.trim();
      console.log('🔄 Name found:', name);
      break;
    }
  }
  
  // Enhanced location extraction
  const locationRegex = /([A-Z][a-z]+,\s*[A-Z]{2}(?:\s+\d{5})?)|([A-Z][a-z]+\s+[A-Z][a-z]+,\s*[A-Z]{2})/g;
  const locationMatches = text.match(locationRegex);
  const location = locationMatches?.[0] || 'Location Not Specified';
  console.log('🔄 Location found:', location);
  
  // Enhanced LinkedIn extraction
  const linkedinRegex = /linkedin\.com\/in\/([a-zA-Z0-9-]+)/i;
  const linkedinMatch = text.match(linkedinRegex);
  const linkedin = linkedinMatch?.[1] || 'profile';
  console.log('🔄 LinkedIn found:', linkedin);
  
  // Basic skills extraction
  const commonSkills = [
    'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'HTML', 'CSS',
    'TypeScript', 'Angular', 'Vue', 'PHP', 'C++', 'C#', 'Ruby', 'Go',
    'AWS', 'Azure', 'Docker', 'Kubernetes', 'Git', 'MongoDB', 'PostgreSQL'
  ];
  
  const foundSkills = commonSkills.filter(skill => 
    text.toLowerCase().includes(skill.toLowerCase())
  );
  
  console.log('🔄 Skills found:', foundSkills);
  
  const fallbackData: ResumeData = {
    name,
    email,
    phone,
    location,
    linkedin,
    skills: foundSkills.length > 0 ? foundSkills : ['Professional Skills'],
    experience: ['Professional Experience Available'],
    education: ['Educational Background Available'],
    summary: 'Experienced professional with a proven track record of success.'
  };
  
  console.log('🔄 Enhanced fallback parsing completed:', fallbackData);
  return fallbackData;
};