import { createClient } from '@supabase/supabase-js';
import { getAuth } from 'firebase/auth';

// Validate required environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  throw new Error('Supabase configuration error: Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface ResumeFileMetadata {
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
  supabaseUrl: string;
  bucketPath: string;
}

// Upload resume file to Supabase Storage
export const uploadResumeToSupabase = async (file: File): Promise<ResumeFileMetadata> => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('User not authenticated - cannot upload resume to Supabase');
    }

    console.log('📁 Uploading resume to Supabase Storage...');
    console.log('📁 File details:', {
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      type: file.type
    });

    // Validate file
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('File size exceeds 10MB limit');
    }

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      throw new Error('File type not supported. Please use PDF, DOC, DOCX, or TXT files');
    }

    // Create unique file path
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop() || 'unknown';
    const fileName = `${user.uid}_resume_${timestamp}.${fileExtension}`;
    const bucketPath = `resumes/${user.uid}/${fileName}`;

    console.log('📁 Uploading to path:', bucketPath);

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('resume-files')
      .upload(bucketPath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('❌ Supabase upload error:', error);
      throw new Error(`Supabase upload failed: ${error.message}`);
    }

    console.log('✅ File uploaded successfully to Supabase:', data);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('resume-files')
      .getPublicUrl(bucketPath);

    const metadata: ResumeFileMetadata = {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      uploadedAt: new Date().toISOString(),
      supabaseUrl: urlData.publicUrl,
      bucketPath: bucketPath
    };

    console.log('✅ Resume file metadata:', metadata);
    return metadata;

  } catch (error) {
    console.error('❌ Error uploading resume to Supabase:', error);
    throw new Error(`Failed to upload resume: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Download resume file from Supabase Storage
export const downloadResumeFromSupabase = async (bucketPath: string): Promise<Blob> => {
  try {
    console.log('📥 Downloading resume from Supabase:', bucketPath);

    const { data, error } = await supabase.storage
      .from('resume-files')
      .download(bucketPath);

    if (error) {
      console.error('❌ Supabase download error:', error);
      throw new Error(`Failed to download resume: ${error.message}`);
    }

    if (!data) {
      throw new Error('No file data received from Supabase');
    }

    console.log('✅ Resume downloaded successfully from Supabase');
    return data;

  } catch (error) {
    console.error('❌ Error downloading resume from Supabase:', error);
    throw new Error(`Failed to download resume: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Delete resume file from Supabase Storage
export const deleteResumeFromSupabase = async (bucketPath: string): Promise<void> => {
  try {
    console.log('🗑️ Deleting resume from Supabase:', bucketPath);

    const { error } = await supabase.storage
      .from('resume-files')
      .remove([bucketPath]);

    if (error) {
      console.error('❌ Supabase delete error:', error);
      throw new Error(`Failed to delete resume: ${error.message}`);
    }

    console.log('✅ Resume deleted successfully from Supabase');

  } catch (error) {
    console.error('❌ Error deleting resume from Supabase:', error);
    throw new Error(`Failed to delete resume: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Get signed URL for temporary access
export const getSignedResumeUrl = async (bucketPath: string, expiresIn: number = 3600): Promise<string> => {
  try {
    console.log('🔗 Getting signed URL for resume:', bucketPath);

    const { data, error } = await supabase.storage
      .from('resume-files')
      .createSignedUrl(bucketPath, expiresIn);

    if (error) {
      console.error('❌ Supabase signed URL error:', error);
      throw new Error(`Failed to get signed URL: ${error.message}`);
    }

    if (!data?.signedUrl) {
      throw new Error('No signed URL received from Supabase');
    }

    console.log('✅ Signed URL generated successfully');
    return data.signedUrl;

  } catch (error) {
    console.error('❌ Error getting signed URL from Supabase:', error);
    throw new Error(`Failed to get signed URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// List user's resume files
export const listUserResumes = async (): Promise<any[]> => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    console.log('📋 Listing user resumes from Supabase...');

    const { data, error } = await supabase.storage
      .from('resume-files')
      .list(`resumes/${user.uid}`, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      console.error('❌ Supabase list error:', error);
      throw new Error(`Failed to list resumes: ${error.message}`);
    }

    console.log('✅ User resumes listed successfully:', data?.length || 0, 'files');
    return data || [];

  } catch (error) {
    console.error('❌ Error listing user resumes from Supabase:', error);
    throw new Error(`Failed to list resumes: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export default supabase;