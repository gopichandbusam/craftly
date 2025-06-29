# Supabase Setup for Resume File Storage

This application uses a hybrid cloud architecture:
- **Supabase**: For secure file storage (PDF, DOC, DOCX files)
- **Firebase**: For user authentication, metadata, and application data

## 🚀 Quick Setup

### 1. Create Supabase Project
1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `craftly-resume-storage`
   - Database password: Generate a strong password
   - Region: Choose closest to your users

### 2. Create Storage Bucket
1. In your Supabase project, go to **Storage** in the sidebar
2. Click **Create a new bucket**
3. Bucket details:
   - Name: `resume-files`
   - Public: `false` (keep private for security)
   - Click **Create bucket**

### 3. Set Storage Policies (Security)
1. In the Storage section, click on `resume-files` bucket
2. Click **Policies** tab
3. Create the following policies:

#### Upload Policy
```sql
CREATE POLICY "Users can upload their own resume files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'resume-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

#### Read Policy
```sql
CREATE POLICY "Users can read their own resume files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'resume-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

#### Delete Policy
```sql
CREATE POLICY "Users can delete their own resume files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'resume-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### 4. Get Environment Variables
1. Go to **Settings** → **API** in your Supabase project
2. Copy the following values:
   - **URL**: Your project URL (e.g., `https://abcdefghijk.supabase.co`)
   - **anon public key**: Your anonymous public key

### 5. Add to Environment Variables

#### For Netlify:
1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Select your site
3. Go to **Site settings** → **Environment variables**
4. Add these new variables:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

#### For Local Development:
Add to your `.env` file:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 6. Redeploy Your Application
1. After adding environment variables, redeploy your site
2. The application will now use Supabase for file storage

## 🔒 Security Features

### File Storage Security
- Files are stored in private buckets (not publicly accessible)
- Row Level Security (RLS) ensures users can only access their own files
- File size limits (10MB) enforced
- File type validation (PDF, DOC, DOCX, TXT only)

### Data Architecture
```
User uploads resume
        ↓
File → Supabase Storage (secure file storage)
        ↓
Metadata → Firebase Firestore (user data, parsed content)
        ↓
Application uses both for complete functionality
```

## 📊 Benefits of Hybrid Architecture

### Supabase Storage Advantages:
- ✅ Fast file uploads and downloads
- ✅ Built-in CDN for global performance
- ✅ Automatic file compression
- ✅ Strong security policies
- ✅ Cost-effective storage pricing

### Firebase Firestore Advantages:
- ✅ Real-time data synchronization
- ✅ Robust authentication system
- ✅ Complex queries and indexing
- ✅ Excellent mobile/web SDKs
- ✅ Proven reliability

## 🔍 Monitoring & Maintenance

### Supabase Dashboard
- Monitor storage usage and costs
- View file upload/download metrics
- Check security policy effectiveness
- Review error logs

### Firebase Console
- Monitor user authentication
- Track Firestore usage
- View analytics data
- Monitor performance

## 🚨 Important Notes

### Security
- Never expose your Supabase service role key
- Use RLS policies to protect user data
- Regularly audit storage policies
- Monitor for unusual access patterns

### Costs
- Supabase: Pay for storage used and bandwidth
- Firebase: Pay for reads/writes and storage
- Monitor usage in both dashboards
- Set up billing alerts

### Backup Strategy
- Supabase automatically backs up data
- Consider additional backup procedures for critical data
- Test restore procedures regularly

## 📞 Need Help?

### Common Issues:
1. **"Supabase URL not found"**: Check environment variables are set correctly
2. **"Access denied"**: Verify RLS policies are created properly
3. **"File upload failed"**: Check bucket name and permissions

### Support:
- Supabase Documentation: https://supabase.com/docs
- Firebase Documentation: https://firebase.google.com/docs
- Project-specific issues: Contact support

Your hybrid cloud architecture is now ready for production use!