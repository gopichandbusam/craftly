# Supabase-Only Setup Guide

This application uses a cost-effective architecture that stores only parsed resume data in Supabase, avoiding expensive file storage costs while maintaining full functionality.

## 🏗️ Architecture Overview

### What We Store:
- ✅ **Parsed Resume Data**: Extracted text, skills, experience, education
- ✅ **User Information**: Name, email, authentication data  
- ✅ **Application Data**: Cover letters and job applications
- ✅ **File Storage**: Resume files in Supabase Storage
- ❌ **No Firebase**: Completely Supabase-based

### Benefits:
- 💰 **Cost-Effective**: Supabase free tier is generous
- 🚀 **Fast Processing**: Local file processing + cloud storage
- 🔒 **Secure**: Comprehensive security with RLS
- 📱 **Efficient**: Optimized operations with smart caching

## 🔧 Supabase Setup

### 1. Create Supabase Project
1. Go to [Supabase Console](https://supabase.com)
2. Click "New project"
3. Enter project name: `craftly-ai-resume`
4. Choose your organization
5. Select a region close to your users
6. Set a strong database password
7. Click "Create new project"

### 2. Enable Authentication
1. In Supabase Dashboard, go to **Authentication**
2. Go to **Settings** tab
3. Configure these providers:
   - **Email**: Enable email confirmations (optional)
   - **Google**: Enable and configure OAuth (optional)

### 3. Create Database Tables
Go to **SQL Editor** and run these commands:

```sql
-- Users table
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can manage own data" ON users
  FOR ALL USING (auth.uid() = id);

-- Resumes table
CREATE TABLE resumes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  data JSONB NOT NULL,
  file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

-- Users can only access their own resumes
CREATE POLICY "Users can manage own resumes" ON resumes
  FOR ALL USING (auth.uid() = user_id);

-- Applications table
CREATE TABLE applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  job_description TEXT,
  cover_letter TEXT NOT NULL,
  custom_prompt TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Users can only access their own applications
CREATE POLICY "Users can manage own applications" ON applications
  FOR ALL USING (auth.uid() = user_id);

-- Custom prompts table
CREATE TABLE custom_prompts (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  prompt TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE custom_prompts ENABLE ROW LEVEL SECURITY;

-- Users can only access their own prompts
CREATE POLICY "Users can manage own prompts" ON custom_prompts
  FOR ALL USING (auth.uid() = user_id);

-- AI models table
CREATE TABLE ai_models (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  provider TEXT NOT NULL,
  api_key TEXT NOT NULL,
  endpoint TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE ai_models ENABLE ROW LEVEL SECURITY;

-- Users can only access their own AI models
CREATE POLICY "Users can manage own ai_models" ON ai_models
  FOR ALL USING (auth.uid() = user_id);
```

### 4. Configure Storage
1. Go to **Storage** in Supabase Dashboard
2. Create a new bucket called `resumes`
3. Set the bucket to **Private**
4. Configure RLS policies:

```sql
-- Storage policies for resumes bucket
CREATE POLICY "Users can upload own resumes" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'resumes' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own resumes" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'resumes' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own resumes" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'resumes' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own resumes" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'resumes' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

### 5. Get Configuration Keys
1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL**
   - **Project API keys** → **anon public**

## 🔑 Environment Variables

Add these to your `.env` file and deployment platform:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Google Gemini AI Configuration  
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

## 🤖 Google Gemini AI Setup

### 1. Get API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click **Create API Key**
3. Select your Google Cloud project (or create new)
4. Copy the generated API key

### 2. Configure Usage Limits (Optional)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the Generative Language API
3. Set up billing alerts and quotas if needed

## 🚀 Deployment Setup

### Repository Information
- **GitHub**: https://github.com/gopichandbusam/craftly
- **Clone**: `git clone https://github.com/gopichandbusam/craftly.git`

### Netlify Deployment
1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Click **New site from Git**
3. Connect your GitHub repository
4. Repository: `https://github.com/gopichandbusam/craftly`
5. Build settings: `npm run build`
6. Publish directory: `dist`
7. Add environment variables
8. Deploy!

### Environment Variables for Deployment
Make sure to add all environment variables to your deployment platform:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_GEMINI_API_KEY`

## 📊 Data Structure

### User Document Structure
```typescript
interface UserData {
  id: string;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
}
```

### Resume Data Structure
```typescript
interface ResumeRecord {
  id: string;
  user_id: string;
  data: ResumeData;
  file_url?: string;
  created_at: string;
  updated_at: string;
}
```

### Application Data Structure
```typescript
interface ApplicationRecord {
  id: string;
  user_id: string;
  company: string;
  position: string;
  job_description?: string;
  cover_letter: string;
  custom_prompt?: string;
  created_at: string;
  updated_at: string;
}
```

## 💰 Cost Estimation

### Supabase Pricing (Free Tier)
- **Database Size**: 500 MB free
- **Bandwidth**: 5 GB free
- **Storage**: 1 GB free
- **Auth Users**: 50,000 MAUs free

### Typical Usage Per User
- **Database**: ~10-50 KB per user
- **Storage**: ~500 KB per resume file
- **Bandwidth**: ~1-5 MB per month per active user

### Estimated Costs
- **0-1000 users**: Free tier sufficient
- **1000+ users**: ~$25/month for Pro plan

## 🔍 Monitoring & Maintenance

### Supabase Dashboard Monitoring
1. **Database**: Monitor table sizes and query performance
2. **Auth**: Track user signups and authentication
3. **Storage**: Monitor file uploads and bandwidth
4. **API**: Track API usage and rate limits

### Performance Optimization
1. **Indexing**: Database indexes for faster queries
2. **Caching**: Smart local caching with batching
3. **RLS**: Efficient Row Level Security policies

## 🛡️ Security Best Practices

### Authentication Security
- Email/password authentication
- Optional Google OAuth
- Secure session management
- Row Level Security (RLS)

### Data Security
- User data isolation via RLS
- Input validation and sanitization
- Encrypted API keys
- Secure file storage

### Privacy Compliance
- GDPR compliance features
- User data deletion capabilities
- Privacy policy implementation
- Consent management

## 🔧 Troubleshooting

### Common Issues

#### "Supabase configuration error"
- Verify environment variables are set correctly
- Check Supabase project URL and keys
- Ensure database tables are created

#### "RLS policy denied"
- Verify user is authenticated
- Check RLS policies are correctly configured
- Confirm user IDs match policy conditions

#### "Storage upload failed"
- Check storage bucket exists and is configured
- Verify storage RLS policies
- Ensure file size is within limits

### Testing Checklist
- [ ] User can sign up/login with demo@email.com/password
- [ ] Resume upload and parsing works
- [ ] Data saves to Supabase
- [ ] Cover letter generation works
- [ ] Data persists across sessions
- [ ] Offline functionality works
- [ ] File storage and retrieval works

## 📞 Support

For setup issues:
1. Check this documentation
2. Verify environment variables
3. Test Supabase configuration
4. Review browser console for errors
5. Create an issue on GitHub: https://github.com/gopichandbusam/craftly/issues

Your cost-effective Supabase-only architecture is ready for production! 🎉