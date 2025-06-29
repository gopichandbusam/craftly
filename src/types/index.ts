export interface User {
  uid: string;
  email: string;
  name?: string;
  linkedProviders: string[];
  hasEmailProvider: boolean;
  hasGoogleProvider: boolean;
}

export interface ResumeData {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  experience: string[];
  skills: string[];
  education: string[];
  summary: string;
}

export interface JobApplication {
  company: string;
  position: string;
  jobDescription: string;
  coverLetter: string;
  customPrompt?: string; // Store custom prompt with the application
}

export interface CoverLetterRequest {
  resumeData: ResumeData;
  jobDescription: string;
  customPrompt?: string;
}