# Netlify Environment Variables Setup

Your application is deployed but missing required environment variables. Follow these steps to configure them:

## 🔧 Required Environment Variables

You need to add the following environment variables in your Netlify dashboard:

### Firebase Configuration
```
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
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

### 2. Get Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the API key

### 3. Add Variables to Netlify
1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Select your site (craftly-ai-resume)
3. Go to **Site settings** → **Environment variables**
4. Click **Add variable** for each one:
   - Variable name: `VITE_FIREBASE_API_KEY`
   - Value: Your Firebase API key
   - Repeat for all variables listed above

### 4. Redeploy Your Site
1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Deploy site**
3. Wait for deployment to complete

## 🔍 Verification

After adding the environment variables and redeploying:

1. Visit your site: https://craftly.gopichand.me
2. You should see the login page instead of the white screen
3. Check browser console for any remaining errors

## 🚨 Security Notes

- Never commit `.env` files to your repository
- Use different Firebase projects for development and production
- Enable Firebase security rules
- Monitor API usage and set billing alerts

## 📞 Need Help?

If you're still seeing issues after following these steps:

1. Check the browser console for specific error messages
2. Verify all environment variables are set correctly
3. Ensure Firebase project has Authentication and Firestore enabled
4. Check Firebase billing and quotas

Your site should work perfectly once the environment variables are configured!