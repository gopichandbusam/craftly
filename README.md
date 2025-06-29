# Craftly AI - Resume & Cover Letter Generator

## 🚀 Overview

Craftly AI is a modern web application that uses artificial intelligence to parse resumes and generate personalized cover letters. The application features a cost-effective architecture using Supabase for data storage and authentication.

## ✨ Features

- **AI-Powered Resume Parsing**: Upload PDF, DOC, DOCX, or TXT files and extract structured data using Google Gemini AI
- **Smart Cover Letter Generation**: Create personalized cover letters tailored to specific job descriptions
- **Cloud Data Storage**: Secure user data storage in Supabase
- **Real-time Editing**: Edit extracted resume data with immediate updates
- **Progressive Web App**: Full offline support with service worker caching
- **Security First**: Comprehensive security features including authentication, validation, and error handling
- **Cost-Optimized**: Only parsed data stored in cloud - files processed locally

## 🏗️ Architecture

### Cost-Effective Design
- **File Processing**: Local file processing (no storage costs)
- **Data Storage**: Only parsed resume data stored in Supabase
- **Authentication**: Supabase Auth for secure user management
- **AI Processing**: Google Gemini AI for intelligent text extraction
- **Deployment**: Netlify/Vercel for fast, reliable hosting

### Technology Stack
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Supabase (Auth + Database + Storage)
- **AI**: Google Gemini API
- **Build Tool**: Vite
- **Analytics**: Optimized local analytics
- **PWA**: Service Worker + Web App Manifest

## 🔧 Setup & Configuration

### Environment Variables Required

Create a `.env` file with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Gemini AI Configuration
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### Getting API Keys

#### 1. Supabase Setup
1. Go to [Supabase Console](https://supabase.com/)
2. Create a new project
3. Go to Settings → API
4. Copy your project URL and anon public key

#### 2. Google Gemini API
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the generated key

### Local Development

```bash
# Clone the repository
git clone https://github.com/gopichandbusam/craftly.git
cd craftly

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

### Demo Access
Use these credentials to test the application:
- **Email**: `demo@email.com`
- **Password**: `password`

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
- **Authentication**: Secure Supabase Auth
- **Data Isolation**: Users can only access their own data

## 🔒 Security Features

### Data Protection
- **Authentication**: Multi-provider Supabase Auth
- **Authorization**: User-based access controls
- **Data Validation**: Comprehensive input validation
- **Error Handling**: Graceful error boundaries
- **Security Headers**: Full CSP implementation

### Privacy Compliance
- **GDPR Ready**: User data deletion capabilities
- **Privacy Policy**: Comprehensive privacy documentation
- **Data Minimization**: Only necessary data collected

## 🎯 Performance Features

### Optimization
- **Bundle Splitting**: Vendor, Supabase, PDF, AI chunks
- **Code Minification**: Terser optimization
- **Service Worker**: Advanced caching strategies
- **Progressive Loading**: Lazy loading and code splitting
- **Image Optimization**: External CDN usage

### Monitoring
- **Performance Tracking**: Core Web Vitals monitoring
- **Error Tracking**: Comprehensive error reporting
- **Analytics**: User behavior and feature usage
- **Local Storage**: Optimized offline capabilities

## 📊 Cost Structure

### Free Tier Usage
- **Supabase**: Generous free tier for database and storage
- **Google Gemini AI**: Check current API pricing
- **Netlify**: Free tier for personal projects

### Cost Optimization
- **No File Storage**: Files processed locally, only data stored
- **Efficient Queries**: Optimized Supabase operations
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
- Contact: [Create an issue](https://github.com/gopichandbusam/craftly/issues)

## 🎉 Acknowledgments

- Google Gemini AI for intelligent text processing
- Supabase for reliable backend services
- React team for the excellent framework
- Tailwind CSS for beautiful styling
- All open source contributors

---

**Built with ❤️ by [Gopichand Busam](https://github.com/gopichandbusam)**