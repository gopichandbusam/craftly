import { createClient } from '@supabase/supabase-js';
import { ResumeData, JobApplication } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Supabase configuration missing. Using localStorage fallback.');
}

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Cache to prevent duplicate operations
const operationCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30 * 1000; // 30 seconds

// Batch operations to reduce API calls
class SupabaseBatch {
  private static pendingOperations: Array<() => Promise<void>> = [];
  private static batchTimeout: NodeJS.Timeout | null = null;

  static addOperation(operation: () => Promise<void>) {
    this.pendingOperations.push(operation);
    
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }
    
    this.batchTimeout = setTimeout(() => {
      this.executeBatch();
    }, 1000); // Batch operations within 1 second
  }

  private static async executeBatch() {
    if (this.pendingOperations.length === 0) return;
    
    const operations = [...this.pendingOperations];
    this.pendingOperations = [];
    
    console.log(`📊 Executing ${operations.length} batched Supabase operations`);
    
    for (const operation of operations) {
      try {
        await operation();
      } catch (error) {
        console.warn('Batched operation failed:', error);
      }
    }
  }
}

// Get current user from auth
const getCurrentUser = async () => {
  if (!supabase) return null;
  
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Initialize user profile
export const initializeUserProfile = async (email: string, name: string): Promise<void> => {
  if (!supabase) return;
  
  const user = await getCurrentUser();
  if (!user) return;

  try {
    const { data: existingProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!existingProfile) {
      const { error } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email,
          name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      console.log('✅ User profile created');
    } else {
      // Update existing profile
      const { error } = await supabase
        .from('users')
        .update({
          email,
          name,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;
      console.log('✅ User profile updated');
    }
  } catch (error) {
    console.error('❌ Failed to initialize user profile:', error);
  }
};

// Save resume to Supabase storage and database
export const saveResumeToSupabase = async (resumeData: ResumeData, file?: File): Promise<string> => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Always save to localStorage immediately for fast access
    localStorage.setItem('craftly_resume', JSON.stringify(resumeData));
    
    if (!supabase) {
      console.warn('⚠️ Supabase not configured, using localStorage only');
      return `local_${user.id}_${Date.now()}`;
    }

    let fileUrl = null;
    
    // Upload file to Supabase storage if provided
    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/resume_${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.warn('⚠️ File upload failed, saving data only:', uploadError);
      } else {
        fileUrl = uploadData.path;
        console.log('✅ Resume file uploaded:', fileUrl);
      }
    }

    // Batch the database operation
    SupabaseBatch.addOperation(async () => {
      const { error } = await supabase
        .from('resumes')
        .upsert({
          user_id: user.id,
          data: resumeData,
          file_url: fileUrl,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    });
    
    console.log('✅ Resume queued for batch save');
    return fileUrl || `local_${user.id}_${Date.now()}`;
  } catch (error) {
    console.error('❌ Resume save failed:', error);
    localStorage.setItem('craftly_resume', JSON.stringify(resumeData));
    throw error;
  }
};

// Load resume with smart caching
export const loadResumeFromSupabase = async (): Promise<ResumeData | null> => {
  try {
    // Always try localStorage first
    const localResume = localStorage.getItem('craftly_resume');
    if (localResume) {
      try {
        const resumeData = JSON.parse(localResume);
        console.log('📱 Resume loaded from localStorage (fast)');
        return resumeData;
      } catch (error) {
        console.warn('Invalid localStorage data, trying Supabase');
      }
    }

    if (!supabase) {
      console.warn('⚠️ Supabase not configured');
      return null;
    }

    const user = await getCurrentUser();
    if (!user) return null;

    const cacheKey = `resume_${user.id}`;
    const cached = operationCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('📊 Resume loaded from cache');
      return cached.data;
    }

    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      throw error;
    }

    if (data) {
      const resumeData = data.data as ResumeData;
      
      // Cache and save to localStorage
      operationCache.set(cacheKey, { data: resumeData, timestamp: Date.now() });
      localStorage.setItem('craftly_resume', JSON.stringify(resumeData));
      console.log('✅ Resume loaded from Supabase');
      return resumeData;
    }
    
    return null;
  } catch (error) {
    console.error('❌ Resume load failed:', error);
    // Fallback to localStorage
    const localResume = localStorage.getItem('craftly_resume');
    if (localResume) {
      try {
        return JSON.parse(localResume);
      } catch {
        return null;
      }
    }
    return null;
  }
};

// Save application to Supabase
export const saveApplicationToSupabase = async (applicationData: JobApplication): Promise<string> => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Save to localStorage immediately
    localStorage.setItem('craftly_application', JSON.stringify(applicationData));
    
    if (!supabase) {
      console.warn('⚠️ Supabase not configured, using localStorage only');
      return `local_app_${Date.now()}`;
    }

    // Batch the operation
    SupabaseBatch.addOperation(async () => {
      const { error } = await supabase
        .from('applications')
        .upsert({
          user_id: user.id,
          company: applicationData.company,
          position: applicationData.position,
          job_description: applicationData.jobDescription,
          cover_letter: applicationData.coverLetter,
          custom_prompt: applicationData.customPrompt,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    });
    
    console.log('✅ Application queued for batch save');
    return `app_${Date.now()}`;
  } catch (error) {
    console.error('❌ Application save failed:', error);
    localStorage.setItem('craftly_application', JSON.stringify(applicationData));
    throw error;
  }
};

// Load latest application
export const loadApplicationFromSupabase = async (): Promise<JobApplication | null> => {
  try {
    // Try localStorage first
    const localApp = localStorage.getItem('craftly_application');
    if (localApp) {
      try {
        const appData = JSON.parse(localApp);
        console.log('📱 Application loaded from localStorage (fast)');
        return appData;
      } catch (error) {
        console.warn('Invalid localStorage application data');
      }
    }

    if (!supabase) {
      console.warn('⚠️ Supabase not configured');
      return null;
    }

    const user = await getCurrentUser();
    if (!user) return null;

    const cacheKey = `app_${user.id}`;
    const cached = operationCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('📊 Application loaded from cache');
      return cached.data;
    }

    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      throw error;
    }

    if (data) {
      const appData: JobApplication = {
        company: data.company,
        position: data.position,
        jobDescription: data.job_description,
        coverLetter: data.cover_letter,
        customPrompt: data.custom_prompt
      };
      
      // Cache and save to localStorage
      operationCache.set(cacheKey, { data: appData, timestamp: Date.now() });
      localStorage.setItem('craftly_application', JSON.stringify(appData));
      console.log('✅ Application loaded from Supabase');
      return appData;
    }
    
    return null;
  } catch (error) {
    console.error('❌ Application load failed:', error);
    return null;
  }
};

// Update resume with batching
export const updateResumeInSupabase = async (resumeData: ResumeData): Promise<void> => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Update localStorage immediately
    localStorage.setItem('craftly_resume', JSON.stringify(resumeData));
    
    // Invalidate cache
    operationCache.delete(`resume_${user.id}`);
    
    if (!supabase) {
      console.warn('⚠️ Supabase not configured, using localStorage only');
      return;
    }

    // Batch the operation
    SupabaseBatch.addOperation(async () => {
      const { error } = await supabase
        .from('resumes')
        .upsert({
          user_id: user.id,
          data: resumeData,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    });
    
    console.log('✅ Resume update queued for batch save');
  } catch (error) {
    console.error('❌ Resume update failed:', error);
    localStorage.setItem('craftly_resume', JSON.stringify(resumeData));
    throw error;
  }
};

// Update application with batching
export const updateApplicationInSupabase = async (applicationData: JobApplication): Promise<void> => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Update localStorage immediately
    localStorage.setItem('craftly_application', JSON.stringify(applicationData));
    
    // Invalidate cache
    operationCache.delete(`app_${user.id}`);
    
    if (!supabase) {
      console.warn('⚠️ Supabase not configured, using localStorage only');
      return;
    }

    // Batch the operation
    SupabaseBatch.addOperation(async () => {
      const { error } = await supabase
        .from('applications')
        .upsert({
          user_id: user.id,
          company: applicationData.company,
          position: applicationData.position,
          job_description: applicationData.jobDescription,
          cover_letter: applicationData.coverLetter,
          custom_prompt: applicationData.customPrompt,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    });
    
    console.log('✅ Application update queued for batch save');
  } catch (error) {
    console.error('❌ Application update failed:', error);
    localStorage.setItem('craftly_application', JSON.stringify(applicationData));
    throw error;
  }
};

// Cleanup function
export const clearCache = () => {
  operationCache.clear();
  console.log('📊 Cache cleared');
};

// Export supabase client for direct use
export { supabase };