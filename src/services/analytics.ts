import { getAnalytics, logEvent, setUserProperties, setUserId } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { ResumeData, JobApplication } from '../types';

// Initialize analytics
const analytics = getAnalytics();
const auth = getAuth();

// User Events
export const trackUserSignup = (method: 'email' | 'google', userData: { name?: string; email: string }) => {
  try {
    logEvent(analytics, 'sign_up', {
      method,
      user_name: userData.name || 'Unknown',
      user_email: userData.email,
      timestamp: new Date().toISOString()
    });
    
    // Set user properties
    setUserProperties(analytics, {
      signup_method: method,
      signup_date: new Date().toDateString()
    });
    
    console.log('📊 Analytics: User signup tracked', { method, email: userData.email });
  } catch (error) {
    console.warn('📊 Analytics tracking failed for signup:', error);
  }
};

export const trackUserLogin = (method: 'email' | 'google', userData: { name?: string; email: string }) => {
  try {
    logEvent(analytics, 'login', {
      method,
      user_name: userData.name || 'Unknown',
      user_email: userData.email,
      timestamp: new Date().toISOString()
    });
    
    // Set user ID for better tracking
    if (auth.currentUser) {
      setUserId(analytics, auth.currentUser.uid);
    }
    
    console.log('📊 Analytics: User login tracked', { method, email: userData.email });
  } catch (error) {
    console.warn('📊 Analytics tracking failed for login:', error);
  }
};

export const trackUserLogout = () => {
  try {
    logEvent(analytics, 'logout', {
      timestamp: new Date().toISOString()
    });
    
    console.log('📊 Analytics: User logout tracked');
  } catch (error) {
    console.warn('📊 Analytics tracking failed for logout:', error);
  }
};

// Resume Processing Events
export const trackResumeUploadStart = (fileInfo: { name: string; size: number; type: string }) => {
  try {
    logEvent(analytics, 'resume_upload_start', {
      file_name: fileInfo.name,
      file_size_mb: (fileInfo.size / (1024 * 1024)).toFixed(2),
      file_type: fileInfo.type,
      timestamp: new Date().toISOString()
    });
    
    console.log('📊 Analytics: Resume upload started', fileInfo);
  } catch (error) {
    console.warn('📊 Analytics tracking failed for resume upload start:', error);
  }
};

export const trackResumeProcessingSuccess = (data: {
  resumeData: ResumeData;
  processingTime: number;
  validationScore?: number;
  sourceType: string;
}) => {
  try {
    const isNameExtracted = data.resumeData.name !== 'Professional';
    const isEmailExtracted = data.resumeData.email !== 'contact@email.com';
    const skillsCount = data.resumeData.skills.length;
    const experienceCount = data.resumeData.experience.length;
    const educationCount = data.resumeData.education.length;
    
    logEvent(analytics, 'resume_processing_success', {
      processing_time_seconds: data.processingTime,
      validation_score: data.validationScore || 0,
      source_type: data.sourceType,
      name_extracted: isNameExtracted,
      email_extracted: isEmailExtracted,
      skills_count: skillsCount,
      experience_count: experienceCount,
      education_count: educationCount,
      total_data_points: (isNameExtracted ? 1 : 0) + (isEmailExtracted ? 1 : 0) + skillsCount + experienceCount + educationCount,
      timestamp: new Date().toISOString()
    });
    
    console.log('📊 Analytics: Resume processing success tracked', {
      processingTime: data.processingTime,
      score: data.validationScore,
      dataPoints: skillsCount + experienceCount + educationCount
    });
  } catch (error) {
    console.warn('📊 Analytics tracking failed for resume processing success:', error);
  }
};

export const trackResumeProcessingError = (data: {
  error: string;
  errorType: 'gemini_api' | 'pdf_parsing' | 'network' | 'validation' | 'unknown';
  processingTime: number;
  sourceType: string;
}) => {
  try {
    logEvent(analytics, 'resume_processing_error', {
      error_message: data.error,
      error_type: data.errorType,
      processing_time_seconds: data.processingTime,
      source_type: data.sourceType,
      timestamp: new Date().toISOString()
    });
    
    console.log('📊 Analytics: Resume processing error tracked', data);
  } catch (error) {
    console.warn('📊 Analytics tracking failed for resume processing error:', error);
  }
};

// Resume Editing Events
export const trackResumeEdit = (section: 'personal' | 'skills' | 'experience' | 'education', action: 'edit' | 'add' | 'remove') => {
  try {
    logEvent(analytics, 'resume_edit', {
      section,
      action,
      timestamp: new Date().toISOString()
    });
    
    console.log('📊 Analytics: Resume edit tracked', { section, action });
  } catch (error) {
    console.warn('📊 Analytics tracking failed for resume edit:', error);
  }
};

// Cover Letter Events
export const trackCoverLetterGenerationStart = (data: {
  jobDescriptionLength: number;
  company?: string;
  position?: string;
}) => {
  try {
    logEvent(analytics, 'cover_letter_generation_start', {
      job_description_length: data.jobDescriptionLength,
      company: data.company || 'Unknown',
      position: data.position || 'Unknown',
      timestamp: new Date().toISOString()
    });
    
    console.log('📊 Analytics: Cover letter generation started', data);
  } catch (error) {
    console.warn('📊 Analytics tracking failed for cover letter generation start:', error);
  }
};

export const trackCoverLetterGenerationSuccess = (data: {
  generationTime: number;
  coverLetterLength: number;
  company: string;
  position: string;
}) => {
  try {
    logEvent(analytics, 'cover_letter_generation_success', {
      generation_time_seconds: data.generationTime,
      cover_letter_length: data.coverLetterLength,
      cover_letter_word_count: data.coverLetterLength ? data.coverLetterLength.toString().split(' ').length : 0,
      company: data.company,
      position: data.position,
      timestamp: new Date().toISOString()
    });
    
    console.log('📊 Analytics: Cover letter generation success tracked', data);
  } catch (error) {
    console.warn('📊 Analytics tracking failed for cover letter generation success:', error);
  }
};

export const trackCoverLetterGenerationError = (data: {
  error: string;
  errorType: 'gemini_api' | 'network' | 'validation' | 'unknown';
  generationTime: number;
}) => {
  try {
    logEvent(analytics, 'cover_letter_generation_error', {
      error_message: data.error,
      error_type: data.errorType,
      generation_time_seconds: data.generationTime,
      timestamp: new Date().toISOString()
    });
    
    console.log('📊 Analytics: Cover letter generation error tracked', data);
  } catch (error) {
    console.warn('📊 Analytics tracking failed for cover letter generation error:', error);
  }
};

export const trackCoverLetterEdit = (data: {
  editType: 'manual_edit' | 'regenerate';
  coverLetterLength: number;
}) => {
  try {
    logEvent(analytics, 'cover_letter_edit', {
      edit_type: data.editType,
      cover_letter_length: data.coverLetterLength,
      timestamp: new Date().toISOString()
    });
    
    console.log('📊 Analytics: Cover letter edit tracked', data);
  } catch (error) {
    console.warn('📊 Analytics tracking failed for cover letter edit:', error);
  }
};

export const trackCoverLetterDownload = (data: {
  format: 'pdf';
  company: string;
  position: string;
}) => {
  try {
    logEvent(analytics, 'cover_letter_download', {
      format: data.format,
      company: data.company,
      position: data.position,
      timestamp: new Date().toISOString()
    });
    
    console.log('📊 Analytics: Cover letter download tracked', data);
  } catch (error) {
    console.warn('📊 Analytics tracking failed for cover letter download:', error);
  }
};

// User Flow Events
export const trackPageView = (page: 'login' | 'upload' | 'generate' | 'no_data') => {
  try {
    logEvent(analytics, 'page_view', {
      page_name: page,
      timestamp: new Date().toISOString()
    });
    
    console.log('📊 Analytics: Page view tracked', { page });
  } catch (error) {
    console.warn('📊 Analytics tracking failed for page view:', error);
  }
};

export const trackUserSessionStart = () => {
  try {
    logEvent(analytics, 'session_start', {
      timestamp: new Date().toISOString()
    });
    
    console.log('📊 Analytics: Session start tracked');
  } catch (error) {
    console.warn('📊 Analytics tracking failed for session start:', error);
  }
};

export const trackUserSessionEnd = (sessionDuration: number) => {
  try {
    logEvent(analytics, 'session_end', {
      session_duration_seconds: sessionDuration,
      timestamp: new Date().toISOString()
    });
    
    console.log('📊 Analytics: Session end tracked', { duration: sessionDuration });
  } catch (error) {
    console.warn('📊 Analytics tracking failed for session end:', error);
  }
};

// Feature Usage Events
export const trackFeatureUsage = (feature: string, data?: Record<string, any>) => {
  try {
    logEvent(analytics, 'feature_usage', {
      feature_name: feature,
      timestamp: new Date().toISOString(),
      ...data
    });
    
    console.log('📊 Analytics: Feature usage tracked', { feature, data });
  } catch (error) {
    console.warn('📊 Analytics tracking failed for feature usage:', error);
  }
};

// Error Tracking
export const trackError = (data: {
  error: string;
  errorType: string;
  location: string;
  userAction?: string;
}) => {
  try {
    logEvent(analytics, 'app_error', {
      error_message: data.error,
      error_type: data.errorType,
      error_location: data.location,
      user_action: data.userAction || 'unknown',
      timestamp: new Date().toISOString()
    });
    
    console.log('📊 Analytics: Error tracked', data);
  } catch (error) {
    console.warn('📊 Analytics tracking failed for error:', error);
  }
};

// Performance Tracking
export const trackPerformance = (data: {
  action: string;
  duration: number;
  success: boolean;
  additionalData?: Record<string, any>;
}) => {
  try {
    logEvent(analytics, 'performance_metric', {
      action_name: data.action,
      duration_ms: data.duration,
      success: data.success,
      timestamp: new Date().toISOString(),
      ...data.additionalData
    });
    
    console.log('📊 Analytics: Performance tracked', data);
  } catch (error) {
    console.warn('📊 Analytics tracking failed for performance:', error);
  }
};

// Firebase Storage Events
export const trackFirebaseOperation = (operation: 'save' | 'load' | 'update', type: 'resume' | 'application', success: boolean, error?: string) => {
  try {
    logEvent(analytics, 'firebase_operation', {
      operation,
      data_type: type,
      success,
      error_message: error || '',
      timestamp: new Date().toISOString()
    });
    
    console.log('📊 Analytics: Firebase operation tracked', { operation, type, success });
  } catch (error) {
    console.warn('📊 Analytics tracking failed for Firebase operation:', error);
  }
};

// API Health Tracking
export const trackAPIHealth = (api: 'gemini' | 'firebase', status: 'healthy' | 'degraded' | 'down', responseTime?: number) => {
  try {
    logEvent(analytics, 'api_health', {
      api_name: api,
      status,
      response_time_ms: responseTime || 0,
      timestamp: new Date().toISOString()
    });
    
    console.log('📊 Analytics: API health tracked', { api, status, responseTime });
  } catch (error) {
    console.warn('📊 Analytics tracking failed for API health:', error);
  }
};

// User Engagement Metrics
export const trackEngagement = (action: string, value?: number, category?: string) => {
  try {
    logEvent(analytics, 'engagement', {
      action_name: action,
      value: value || 0,
      category: category || 'general',
      timestamp: new Date().toISOString()
    });
    
    console.log('📊 Analytics: Engagement tracked', { action, value, category });
  } catch (error) {
    console.warn('📊 Analytics tracking failed for engagement:', error);
  }
};

// Custom Business Metrics
export const trackBusinessMetric = (metric: string, value: number, unit?: string) => {
  try {
    logEvent(analytics, 'business_metric', {
      metric_name: metric,
      metric_value: value,
      metric_unit: unit || 'count',
      timestamp: new Date().toISOString()
    });
    
    console.log('📊 Analytics: Business metric tracked', { metric, value, unit });
  } catch (error) {
    console.warn('📊 Analytics tracking failed for business metric:', error);
  }
};