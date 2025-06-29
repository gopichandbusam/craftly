import { ResumeData } from '../types';

export interface ValidationResult {
  isValid: boolean;
  score: number;
  issues: string[];
  suggestions: string[];
}

export interface FieldValidation {
  field: string;
  isValid: boolean;
  isDefault: boolean;
  confidence: number;
  issues: string[];
}

export const validateResumeData = (data: ResumeData): ValidationResult => {
  const issues: string[] = [];
  const suggestions: string[] = [];
  let score = 0;

  // Validate each field
  const fieldValidations = [
    validateName(data.name),
    validateEmail(data.email),
    validatePhone(data.phone),
    validateLocation(data.location),
    validateLinkedIn(data.linkedin),
    validateSkills(data.skills),
    validateExperience(data.experience),
    validateEducation(data.education)
  ];

  // Calculate overall score and collect issues
  fieldValidations.forEach(validation => {
    if (validation.isValid && !validation.isDefault) {
      score += validation.confidence;
    }
    issues.push(...validation.issues);
  });

  // Generate suggestions based on validation results
  if (fieldValidations[0].isDefault) {
    suggestions.push('Consider manually entering your name if it wasn\'t extracted correctly');
  }
  if (fieldValidations[1].isDefault) {
    suggestions.push('Ensure your email address is clearly visible in the resume');
  }
  if (data.skills.length < 5) {
    suggestions.push('Consider adding more skills to your resume for better matching');
  }
  if (data.experience.length < 2) {
    suggestions.push('Include more detailed work experience entries');
  }

  const finalScore = Math.min(100, Math.max(0, score));
  
  return {
    isValid: finalScore > 50,
    score: finalScore,
    issues: issues.filter(issue => issue.length > 0),
    suggestions
  };
};

export const validateName = (name: string): FieldValidation => {
  const isDefault = name === 'Professional';
  const issues: string[] = [];
  
  if (isDefault) {
    issues.push('Name not extracted - using default value');
  } else if (name.length < 2) {
    issues.push('Name appears to be too short');
  } else if (name.length > 50) {
    issues.push('Name appears to be too long - might be incorrect');
  }
  
  const confidence = isDefault ? 0 : (name.match(/^[A-Z][a-z]+\s+[A-Z][a-z]+/) ? 15 : 10);
  
  return {
    field: 'name',
    isValid: !isDefault && name.length >= 2 && name.length <= 50,
    isDefault,
    confidence,
    issues
  };
};

export const validateEmail = (email: string): FieldValidation => {
  const isDefault = email === 'contact@email.com';
  const issues: string[] = [];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (isDefault) {
    issues.push('Email not extracted - using default value');
  } else if (!emailRegex.test(email)) {
    issues.push('Email format appears invalid');
  }
  
  const confidence = isDefault ? 0 : (emailRegex.test(email) ? 15 : 5);
  
  return {
    field: 'email',
    isValid: !isDefault && emailRegex.test(email),
    isDefault,
    confidence,
    issues
  };
};

export const validatePhone = (phone: string): FieldValidation => {
  const isDefault = phone === '+1 (555) 000-0000';
  const issues: string[] = [];
  const phoneRegex = /[\d\s\-\(\)\+]{10,}/;
  
  if (isDefault) {
    issues.push('Phone number not extracted - using default value');
  } else if (!phoneRegex.test(phone)) {
    issues.push('Phone number format might be incomplete');
  }
  
  const confidence = isDefault ? 0 : (phoneRegex.test(phone) ? 10 : 5);
  
  return {
    field: 'phone',
    isValid: !isDefault && phoneRegex.test(phone),
    isDefault,
    confidence,
    issues
  };
};

export const validateLocation = (location: string): FieldValidation => {
  const isDefault = location === 'Location Not Specified';
  const issues: string[] = [];
  
  if (isDefault) {
    issues.push('Location not extracted - using default value');
  } else if (location.length < 3) {
    issues.push('Location appears incomplete');
  }
  
  const confidence = isDefault ? 0 : (location.includes(',') ? 10 : 7);
  
  return {
    field: 'location',
    isValid: !isDefault && location.length >= 3,
    isDefault,
    confidence,
    issues
  };
};

export const validateLinkedIn = (linkedin: string): FieldValidation => {
  const isDefault = linkedin === 'profile';
  const issues: string[] = [];
  
  if (isDefault) {
    issues.push('LinkedIn profile not extracted - using default value');
  } else if (linkedin.length < 3) {
    issues.push('LinkedIn username appears too short');
  }
  
  const confidence = isDefault ? 0 : 5;
  
  return {
    field: 'linkedin',
    isValid: !isDefault && linkedin.length >= 3,
    isDefault,
    confidence,
    issues
  };
};

export const validateSkills = (skills: string[]): FieldValidation => {
  const issues: string[] = [];
  const validSkills = skills.filter(skill => skill && skill.trim().length > 0);
  
  if (validSkills.length === 0) {
    issues.push('No skills extracted from resume');
  } else if (validSkills.length < 3) {
    issues.push('Very few skills extracted - consider adding more to your resume');
  } else if (validSkills.length > 20) {
    issues.push('Many skills extracted - some might be incorrectly categorized');
  }
  
  const confidence = Math.min(20, validSkills.length * 2);
  
  return {
    field: 'skills',
    isValid: validSkills.length >= 1,
    isDefault: validSkills.length === 1 && validSkills[0] === 'Professional Skills',
    confidence,
    issues
  };
};

export const validateExperience = (experience: string[]): FieldValidation => {
  const issues: string[] = [];
  const validExperience = experience.filter(exp => exp && exp.trim().length > 10);
  
  if (validExperience.length === 0) {
    issues.push('No work experience extracted from resume');
  } else if (validExperience.length < 2) {
    issues.push('Limited work experience extracted');
  }
  
  const confidence = Math.min(20, validExperience.length * 5);
  
  return {
    field: 'experience',
    isValid: validExperience.length >= 1,
    isDefault: validExperience.length === 1 && validExperience[0].includes('Professional Experience'),
    confidence,
    issues
  };
};

export const validateEducation = (education: string[]): FieldValidation => {
  const issues: string[] = [];
  const validEducation = education.filter(edu => edu && edu.trim().length > 5);
  
  if (validEducation.length === 0) {
    issues.push('No education information extracted from resume');
  }
  
  const confidence = Math.min(15, validEducation.length * 7);
  
  return {
    field: 'education',
    isValid: validEducation.length >= 1,
    isDefault: validEducation.length === 1 && validEducation[0].includes('Educational Background'),
    confidence,
    issues
  };
};