export interface User {
  email: string;
  name?: string;
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
}