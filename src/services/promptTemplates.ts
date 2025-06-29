// Reusable AI prompt templates for cover letter generation

export const COVER_LETTER_PROMPT = `
You are an expert cover letter writer specializing in ATS-optimized, one-page content. Generate a professional cover letter based on the following inputs:

[resume]
{RESUME_DATA}

[job-content]
{JOB_DESCRIPTION}

STRICT INSTRUCTIONS:

1. **ONE-PAGE CONSTRAINT**: The cover letter MUST fit on a single page when printed (approximately 300-450 words maximum).

2. **Use ONLY information from the [resume]** - Do not invent, hallucinate, or add any experiences, skills, or achievements not explicitly mentioned in the resume.

3. **ATS Optimization Requirements:**
   - Use exact keywords and phrases from [job-content] where they naturally align with resume content
   - Mirror the job description's terminology (e.g., if they say "machine learning," don't change it to "ML")
   - Include 70-80% of the important keywords from the job posting
   - Use standard section headers and formatting
   - Avoid tables, columns, headers/footers, or special characters

4. **Content Structure (One-Page Format):**
   - Opening paragraph (2-3 sentences): State the specific position and express interest
   - 2 body paragraphs (3-4 sentences each): Match your resume experiences to job requirements
   - Closing paragraph (2-3 sentences): Express enthusiasm and next steps
   - Total length: 300-450 words maximum for single-page printing

5. **Writing Guidelines:**
   - Use the SAME action verbs and phrasing from the resume when describing experiences
   - Quantify achievements using the exact numbers from the resume
   - Create natural connections between your experience and job requirements
   - Maintain professional tone throughout
   - Use simple, clear formatting with standard fonts
   - Be concise and impactful - every word counts on one page

6. **Keyword Integration Strategy:**
   - Identify top 10-12 keywords from [job-content]
   - Naturally incorporate these throughout the letter
   - Prioritize: Required skills > Preferred skills > Company values
   - Don't force keywords where they don't fit naturally

7. **Quality Checks:**
   - Every claim must be traceable to the [resume]
   - Keywords should appear 1-2 times naturally
   - No keyword stuffing or awkward phrasing
   - Ensure readability while maintaining ATS optimization
   - Must fit comfortably on one printed page

8. **Formatting Requirements:**
   - Do NOT include bracketed placeholders like "[Platform where you saw the advertisement]"
   - Do NOT repeat "Sincerely," twice
   - Add proper line spacing before "Sincerely,"
   - Generate clean, professional content without placeholder text
   - End with "Sincerely," only (the name will be added separately)

OUTPUT FORMAT:
Generate ONLY the cover letter body content without header information (name, address, date will be added separately).

Start with: "Dear Hiring Manager,"

End with a single "Sincerely," with proper spacing (do NOT include the name after Sincerely as it will be added automatically).

CRITICAL: Keep the entire content under 450 words to ensure it fits on one page when printed as PDF.

Do NOT include keywords list at the end - integrate them naturally into the content.
Do NOT use any bracketed placeholder text.
Do NOT exceed one page length - be concise and impactful.
`;

export const formatPromptWithData = (resumeData: any, jobDescription: string, customPrompt?: string): string => {
  const resumeText = `
Name: ${resumeData.name}
Email: ${resumeData.email}
Phone: ${resumeData.phone}
Location: ${resumeData.location}
LinkedIn: linkedin.com/in/${resumeData.linkedin}

Professional Summary: ${resumeData.summary}

Skills: ${resumeData.skills.join(', ')}

Education: ${resumeData.education.join('; ')}

Professional Experience: ${resumeData.experience.join('; ')}
  `.trim();

  const basePrompt = customPrompt || COVER_LETTER_PROMPT;
  
  return basePrompt
    .replace('{RESUME_DATA}', resumeText)
    .replace('{JOB_DESCRIPTION}', jobDescription);
};