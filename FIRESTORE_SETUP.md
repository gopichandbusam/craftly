# Firestore-Only Setup Guide

This application uses a cost-effective architecture that stores only parsed resume data in Firestore, avoiding expensive file storage costs.

## 🏗️ Architecture Overview

### What We Store:
- ✅ **Parsed Resume Data**: Extracted text, skills, experience, education
- ✅ **User Information**: Name, email, authentication data  
- ✅ **Application Data**: Cover letters and job applications
- ❌ **No File Storage**: Files are processed locally and discarded

### Benefits:
- 💰 **Cost-Effective**: No file storage costs
- 🚀 **Fast Processing**: Local file processing
- 🔒 **Secure**: No files stored in cloud
- 📱 **Efficient**: Uses Firestore free tier optimally

## 🔧 Firebase Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `craftly-ai-resume`
4. Disable Google Analytics (optional)
5. Click "Create project"

### 2. Enable Authentication
1. In Firebase Console, go to **Authentication**
2. Click **Get started**
3. Go to **Sign-in method** tab
4. Enable these providers:
   - **Email/Password**: Enable
   - **Google**: Enable and configure

### 3. Create Firestore Database
1. Go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in production mode**
4. Select a location close to your users
5. Click **Done**

### 4. Configure Security Rules
Replace the default Firestore rules with these secure rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == userId
        && isValidUserData(request.resource.data);
    }
    
    // Helper function to validate user data
    function isValidUserData(data) {
      return data.keys().hasAll(['name', 'email', 'updatedAt'])
        && data.name is string
        && data.name.size() > 0
        && data.name.size() <= 100
        && data.email is string
        && data.email.matches('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')
        && data.updatedAt is timestamp;
    }
    
    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### 5. Get Configuration Keys
1. Go to **Project Settings** (gear icon)
2. Scroll to **Your apps** section
3. Click **Web app** (</> icon)
4. Register your app with name: `craftly-ai`
5. Copy the configuration object

## 🔑 Environment Variables

Add these to your `.env` file and Netlify environment variables:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

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

## 🚀 Netlify Deployment Setup

### 1. Connect Repository
1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Click **New site from Git**
3. Connect your GitHub/GitLab repository
4. Choose your repository

### 2. Configure Build Settings
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Environment variables**: Add all variables from above

### 3. Deploy
1. Click **Deploy site**
2. Wait for deployment to complete
3. Test the application

## 📊 Data Structure

### User Document Structure
```typescript
interface UserData {
  name: string;
  email: string;
  resumeData: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    skills: string[];
    experience: string[];
    education: string[];
    summary: string;
  } | null;
  applications: JobApplication[];
  lastResumeUpdate: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Application Data Structure
```typescript
interface JobApplication {
  id: string;
  company: string;
  position: string;
  jobDescription: string;
  coverLetter: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## 💰 Cost Estimation

### Firestore Pricing (Free Tier)
- **Document Reads**: 50,000/day free
- **Document Writes**: 20,000/day free  
- **Document Deletes**: 20,000/day free
- **Storage**: 1 GiB free

### Typical Usage Per User
- **Initial Setup**: ~3 writes
- **Resume Upload**: ~2 writes  
- **Cover Letter**: ~2 writes
- **Edits**: ~1 write each
- **Reads**: ~5-10 per session

### Estimated Costs
- **0-1000 users**: Free tier sufficient
- **1000+ users**: ~$0.01-0.10 per user per month

## 🔍 Monitoring & Maintenance

### Firebase Console Monitoring
1. **Authentication**: Monitor sign-ups and logins
2. **Firestore**: Track read/write usage
3. **Analytics**: User engagement metrics

### Performance Optimization
1. **Index Management**: Create composite indexes as needed
2. **Query Optimization**: Efficient data retrieval
3. **Caching**: Local storage for frequent data

## 🛡️ Security Best Practices

### Authentication Security
- Password requirements enforced
- Email verification enabled
- Secure session management
- Multi-provider support

### Data Security
- User data isolation
- Input validation
- XSS prevention
- CSRF protection via Firebase

### Privacy Compliance
- GDPR compliance features
- User data deletion
- Privacy policy implementation
- Cookie consent management

## 🔧 Troubleshooting

### Common Issues

#### "Firebase configuration error"
- Verify all environment variables are set
- Check Firebase project settings
- Ensure APIs are enabled

#### "Firestore permission denied"
- Verify security rules are updated
- Check user authentication status
- Confirm user document structure

#### "Gemini API error"
- Verify API key is correct
- Check API usage quotas
- Ensure billing is set up if needed

### Testing Checklist
- [ ] User can sign up/login
- [ ] Resume upload and parsing works
- [ ] Data saves to Firestore
- [ ] Cover letter generation works
- [ ] Data persists across sessions
- [ ] Offline functionality works

## 📞 Support

For setup issues:
1. Check this documentation
2. Verify environment variables
3. Test Firebase configuration
4. Review browser console for errors
5. Contact support if needed

Your cost-effective Firestore-only architecture is ready for production! 🎉