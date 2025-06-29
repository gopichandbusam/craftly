# Craftly AI - Resume & Cover Letter Generator

## 🚀 Overview

Craftly AI is a modern web application that uses artificial intelligence to parse resumes and generate personalized cover letters. The application features a cost-effective architecture using Firestore for data storage without expensive file storage costs.

## ✨ Features

- **AI-Powered Resume Parsing**: Upload PDF, DOC, DOCX, or TXT files and extract structured data using Google Gemini AI
- **Smart Cover Letter Generation**: Create personalized cover letters tailored to specific job descriptions
- **Cloud Data Storage**: Secure user data storage in Firebase Firestore
- **Real-time Editing**: Edit extracted resume data with immediate updates
- **Progressive Web App**: Full offline support with service worker caching
- **Security First**: Comprehensive security features including authentication, validation, and error handling
- **Cost-Optimized**: No file storage costs - only parsed data stored in Firestore

## 🏗️ Architecture

### Cost-Effective Design
- **File Processing**: Local file processing (no storage costs)
- **Data Storage**: Only parsed resume data stored in Firestore
- **Authentication**: Firebase Auth for secure user management
- **AI Processing**: Google Gemini AI for intelligent text extraction
- **Deployment**: Netlify for fast, reliable hosting

### Technology Stack
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Firebase (Auth + Firestore)
- **AI**: Google Gemini API
- **Build Tool**: Vite
- **Analytics**: Firebase Analytics
- **PWA**: Service Worker + Web App Manifest

## 🔧 Setup & Configuration

### Environment Variables Required

Create a `.env` file with the following variables:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Google Gemini AI Configuration
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### Getting API Keys

#### 1. Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication (Email/Password + Google)
4. Create Firestore database
5. Get configuration from Project Settings

#### 2. Google Gemini API
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the generated key

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🚀 Deployment

### Netlify Deployment

1. **Connect Repository**
   - Link your Git repository to Netlify

2. **Configure Environment Variables**
   - Go to Site settings → Environment variables
   - Add all the environment variables listed above

3. **Deploy Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 18

4. **Deploy**
   - Automatic deployment from main branch

### Security Configuration

The application includes comprehensive security measures:

- **Content Security Policy**: Prevents XSS attacks
- **Security Headers**: HSTS, X-Frame-Options, etc.
- **Input Validation**: File type/size validation
- **Authentication**: Secure Firebase Auth
- **Data Isolation**: Users can only access their own data

## 🔒 Security Features

### Data Protection
- **Authentication**: Multi-provider Firebase Auth
- **Authorization**: User-based access controls
- **Data Validation**: Comprehensive input validation
- **Error Handling**: Graceful error boundaries
- **Security Headers**: Full CSP implementation

### Privacy Compliance
- **GDPR Ready**: User data deletion capabilities
- **Privacy Policy**: Comprehensive privacy documentation
- **Cookie Consent**: Granular consent management
- **Data Minimization**: Only necessary data collected

## 🎯 Performance Features

### Optimization
- **Bundle Splitting**: Vendor, Firebase, PDF, AI chunks
- **Code Minification**: Terser optimization
- **Service Worker**: Advanced caching strategies
- **Progressive Loading**: Lazy loading and code splitting
- **Image Optimization**: External CDN usage

### Monitoring
- **Performance Tracking**: Core Web Vitals monitoring
- **Error Tracking**: Comprehensive error reporting
- **Analytics**: User behavior and feature usage
- **Real-time Monitoring**: Firebase Analytics integration

## 📊 Cost Structure

### Free Tier Usage
- **Firebase Firestore**: Generous free tier for document operations
- **Firebase Auth**: Free for most use cases
- **Google Gemini AI**: Check current API pricing
- **Netlify**: Free tier for personal projects

### Cost Optimization
- **No File Storage**: Files processed locally, only data stored
- **Efficient Queries**: Optimized Firestore operations
- **Caching**: Reduced API calls through smart caching
- **Bundle Optimization**: Minimized bandwidth usage

## 🛠️ Development Features

### Code Quality
- **TypeScript**: Full type safety
- **ESLint**: Code quality enforcement
- **Error Boundaries**: Crash prevention
- **Accessibility**: WCAG compliance features
- **PWA**: Full offline functionality

### Developer Experience
- **Hot Reload**: Fast development iteration
- **Source Maps**: Easy debugging
- **Environment Validation**: Configuration verification
- **Comprehensive Logging**: Detailed operation logs

## 📱 User Experience

### Accessibility
- **High Contrast Mode**: Visual accessibility support
- **Reduced Motion**: Motion sensitivity options
- **Font Size Controls**: Adjustable text sizing
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: ARIA labels and semantic HTML

### Responsive Design
- **Mobile-First**: Optimized for all screen sizes
- **Touch-Friendly**: Mobile interaction optimization
- **Progressive Enhancement**: Works on all devices
- **Offline Support**: Full functionality when offline

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
- Check the documentation
- Review the troubleshooting guide
- Create an issue on GitHub
- Contact: support@gopichand.me

## 🎉 Acknowledgments

- Google Gemini AI for intelligent text processing
- Firebase for reliable backend services
- React team for the excellent framework
- Tailwind CSS for beautiful styling
- All open source contributors

---

**Built with ❤️ by Gopichand Busam**