// Input validation and sanitization service

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedValue?: any;
}

// Email validation
export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = [];
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  if (!email || email.trim().length === 0) {
    errors.push('Email is required');
  } else if (email.length > 254) {
    errors.push('Email is too long');
  } else if (!emailRegex.test(email)) {
    errors.push('Invalid email format');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: email.trim().toLowerCase()
  };
};

// Password validation
export const validatePassword = (password: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!password || password.length === 0) {
    errors.push('Password is required');
  } else if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  } else if (password.length > 128) {
    errors.push('Password is too long');
  }
  
  // Check for common weak passwords
  const weakPasswords = ['123456', 'password', 'qwerty', '12345678', 'abc123'];
  if (weakPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too weak');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: password
  };
};

// Name validation
export const validateName = (name: string): ValidationResult => {
  const errors: string[] = [];
  const nameRegex = /^[a-zA-Z\s\-']{2,50}$/;
  
  if (!name || name.trim().length === 0) {
    errors.push('Name is required');
  } else if (name.length > 50) {
    errors.push('Name is too long');
  } else if (!nameRegex.test(name)) {
    errors.push('Name contains invalid characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: name.trim()
  };
};

// File validation
export const validateFile = (file: File): ValidationResult => {
  const errors: string[] = [];
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];
  
  if (!file) {
    errors.push('File is required');
  } else {
    if (file.size > maxSize) {
      errors.push('File size must be less than 10MB');
    }
    
    if (!allowedTypes.includes(file.type)) {
      errors.push('File type not supported. Please use PDF, DOC, DOCX, or TXT files');
    }
    
    // Check file name for malicious patterns
    const suspiciousPatterns = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com'];
    if (suspiciousPatterns.some(pattern => file.name.toLowerCase().includes(pattern))) {
      errors.push('File type not allowed for security reasons');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: file
  };
};

// Text content validation (for job descriptions)
export const validateTextContent = (text: string, maxLength: number = 10000): ValidationResult => {
  const errors: string[] = [];
  
  if (!text || text.trim().length === 0) {
    errors.push('Content is required');
  } else if (text.length > maxLength) {
    errors.push(`Content is too long. Maximum ${maxLength} characters allowed`);
  }
  
  // Check for suspicious patterns (basic XSS prevention)
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i
  ];
  
  if (suspiciousPatterns.some(pattern => pattern.test(text))) {
    errors.push('Content contains potentially harmful elements');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: text.trim()
  };
};

// Sanitize HTML content
export const sanitizeHtml = (html: string): string => {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
};

// Rate limiting helper
class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  
  public isAllowed(key: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside the window
    const validAttempts = attempts.filter(time => now - time < windowMs);
    
    if (validAttempts.length >= maxAttempts) {
      return false;
    }
    
    validAttempts.push(now);
    this.attempts.set(key, validAttempts);
    return true;
  }
  
  public reset(key: string): void {
    this.attempts.delete(key);
  }
}

export const rateLimiter = new RateLimiter();

// Validate environment variables
export const validateEnvironment = (): ValidationResult => {
  const errors: string[] = [];
  const requiredEnvVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_GEMINI_API_KEY'
  ];
  
  requiredEnvVars.forEach(envVar => {
    if (!import.meta.env[envVar]) {
      errors.push(`Missing required environment variable: ${envVar}`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// URL validation for security
export const validateUrl = (url: string): ValidationResult => {
  const errors: string[] = [];
  
  try {
    const urlObj = new URL(url);
    
    // Only allow HTTPS in production
    if (import.meta.env.PROD && urlObj.protocol !== 'https:') {
      errors.push('Only HTTPS URLs are allowed');
    }
    
    // Block local/private URLs
    const hostname = urlObj.hostname;
    if (hostname === 'localhost' || 
        hostname.startsWith('127.') || 
        hostname.startsWith('192.168.') || 
        hostname.startsWith('10.') ||
        hostname.startsWith('172.')) {
      errors.push('Local URLs are not allowed');
    }
    
  } catch (error) {
    errors.push('Invalid URL format');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: url
  };
};