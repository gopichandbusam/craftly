// Environment validation for production
export const validateProductionEnvironment = () => {
  const required = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
    'VITE_GEMINI_API_KEY'
  ];
  
  const missing = required.filter(key => !import.meta.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing environment variables:', missing);
    return false;
  }
  
  console.log('✅ All required environment variables present');
  return true;
};

// Check if we're ready for production
export const productionReadinessCheck = () => {
  const checks = {
    environment: validateProductionEnvironment(),
    build: import.meta.env.PROD,
    features: {
      firebase: !!import.meta.env.VITE_FIREBASE_PROJECT_ID,
      gemini: !!import.meta.env.VITE_GEMINI_API_KEY,
      analytics: !!import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
    }
  };
  
  console.log('🔍 Production Readiness Check:', checks);
  return checks;
};