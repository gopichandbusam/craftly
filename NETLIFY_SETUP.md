# Netlify Environment Variables Setup

Your application is deployed but requires both Firebase and Supabase configuration. Follow these steps to set up the complete hybrid cloud architecture:

## 🔧 Required Environment Variables

You need to add the following environment variables in your Netlify dashboard:

### Firebase Configuration (Authentication & Metadata)
```
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### Supabase Configuration (File Storage)
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### Google Gemini AI Configuration
```
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

## 📋 Step-by-Step Setup

### 1. Get Firebase Configuration
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Go to Project Settings (gear icon)
4. Scroll down to "Your apps" section
5. Click on the web app or create one
6. Copy the configuration values

### 2. Set Up Supabase (NEW REQUIREMENT)
1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Create a new project:
   - Name: `craftly-resume-storage`
   - Choose a region close to your users
3. Create storage bucket:
   - Go to **Storage** → **Create bucket**
   - Name: `resume-files`
   - Set to **Private**
4. Get your keys:
   - Go to **Settings** → **API**
   - Copy **URL** and **anon public** key

### 3. Get Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the API key

### 4. Add All Variables to Netlify
1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Select your site (craftly-ai-resume)
3. Go to **Site settings** → **Environment variables**
4. Click **Add variable** for each one:

#### Firebase Variables:
   - `VITE_FIREBASE_API_KEY` → Your Firebase API key
   - `VITE_FIREBASE_AUTH_DOMAIN` → your-project.firebaseapp.com
   - `VITE_FIREBASE_PROJECT_ID` → your-project-id
   - `VITE_FIREBASE_STORAGE_BUCKET` → your-project.appspot.com
   - `VITE_FIREBASE_MESSAGING_SENDER_ID` → your-sender-id
   - `VITE_FIREBASE_APP_ID` → your-app-id
   - `VITE_FIREBASE_MEASUREMENT_ID` → your-measurement-id

#### Supabase Variables:
   - `VITE_SUPABASE_URL` → https://your-project.supabase.co
   - `VITE_SUPABASE_ANON_KEY` → your-supabase-anon-key

#### AI Variables:
   - `VITE_GEMINI_API_KEY` → your-gemini-api-key

### 5. Configure Supabase Security
Before deploying, set up these storage policies in Supabase:

1. Go to **Storage** → **resume-files** → **Policies**
2. Create these policies:

```sql
-- Upload policy
CREATE POLICY "Users can upload their own resume files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'resume-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Read policy  
CREATE POLICY "Users can read their own resume files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'resume-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Delete policy
CREATE POLICY "Users can delete their own resume files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'resume-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### 6. Redeploy Your Site
1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Deploy site**
3. Wait for deployment to complete

## 🏗️ New Architecture Benefits

### What Changed:
- **Before**: Files stored in browser/localStorage only
- **After**: Files stored in Supabase, metadata in Firebase

### Benefits:
- ✅ **Reliable Storage**: Files don't disappear on browser clear
- ✅ **Cross-Device Access**: Access your resumes from any device
- ✅ **Better Performance**: Faster file uploads and downloads
- ✅ **Scalability**: Handle larger files and more users
- ✅ **Security**: Professional-grade file storage with access controls

## 🔍 Verification Steps

After adding all environment variables and redeploying:

1. **Visit your site**: https://craftly.gopichand.me
2. **Test the flow**:
   - Sign up/Login should work (Firebase Auth)
   - Upload a resume file (Supabase Storage)
   - Generate a cover letter (Gemini AI)
   - Check that data persists across browser sessions

3. **Check for errors**: Open browser console and look for:
   - ✅ "Firebase initialized successfully"
   - ✅ "File uploaded to Supabase successfully" 
   - ✅ "Resume data saved to Firebase"

## 🚨 Troubleshooting

### Common Issues:

#### White Screen Still Showing:
- Verify all Firebase environment variables are correct
- Check Firebase project has Authentication enabled

#### "Supabase URL not found":
- Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set
- Check Supabase project is active

#### File Upload Fails:
- Verify storage bucket `resume-files` exists
- Check storage policies are created
- Ensure user is authenticated

### Support:
If you're still having issues:
1. Check browser console for specific error messages
2. Verify all services (Firebase, Supabase, Gemini) are properly configured
3. Ensure billing is set up for all services if needed

## 💰 Cost Estimates

### Free Tier Limits:
- **Firebase**: 1GB storage, 10GB/month bandwidth
- **Supabase**: 500MB storage, 1GB bandwidth
- **Gemini AI**: Check current limits

### Recommended for Production:
- Set up billing alerts on all services
- Monitor usage in respective dashboards
- Consider upgrading plans as you scale

Your hybrid cloud architecture is now ready for production with reliable file storage and metadata management!