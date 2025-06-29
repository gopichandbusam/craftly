import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { ResumeData, JobApplication } from '../types';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Cache to prevent duplicate operations
const operationCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30 * 1000; // 30 seconds

// Batch operations to reduce Firestore calls
class FirestoreBatch {
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
    
    console.log(`🔥 Executing ${operations.length} batched Firestore operations`);
    
    for (const operation of operations) {
      try {
        await operation();
      } catch (error) {
        console.warn('Batched operation failed:', error);
      }
    }
  }
}

export interface OptimizedUserData {
  name: string;
  email: string;
  resumeData: ResumeData | null;
  lastApplication: JobApplication | null; // Store only the latest application
  lastResumeUpdate: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Initialize user document - minimize Firestore operations
export const initializeUserDocument = async (name: string, email: string, isLogin: boolean = true): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) return;

    const cacheKey = `user_init_${user.uid}`;
    const cached = operationCache.get(cacheKey);
    
    // Skip if recently initialized
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('🔥 Skipping user initialization - recently done');
      return;
    }

    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      const userData: OptimizedUserData = {
        name,
        email,
        resumeData: null,
        lastApplication: null,
        lastResumeUpdate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await setDoc(userDocRef, userData);
      console.log('✅ User document created');
    } else if (isLogin) {
      // Only update on actual login, not every auth state change
      const existingData = userDoc.data() as OptimizedUserData;
      const hasChanges = existingData.name !== name || existingData.email !== email;
      
      if (hasChanges) {
        await updateDoc(userDocRef, {
          name,
          email,
          updatedAt: new Date()
        });
        console.log('✅ User profile updated');
      }
    }
    
    // Cache the operation
    operationCache.set(cacheKey, { data: true, timestamp: Date.now() });
  } catch (error) {
    console.error('❌ User initialization failed:', error);
    throw error;
  }
};

// Optimized resume saving - batch with other operations
export const saveResumeToFirebase = async (resumeData: ResumeData): Promise<string> => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    // Always save to localStorage immediately for fast access
    localStorage.setItem('craftly_resume', JSON.stringify(resumeData));
    
    // Batch the Firestore operation
    FirestoreBatch.addOperation(async () => {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        resumeData: resumeData,
        lastResumeUpdate: new Date()
      });
    });
    
    console.log('✅ Resume queued for batch save');
    return `local_${user.uid}_${Date.now()}`;
  } catch (error) {
    console.error('❌ Resume save failed:', error);
    localStorage.setItem('craftly_resume', JSON.stringify(resumeData));
    throw error;
  }
};

// Load resume with smart caching
export const loadResumeFromFirebase = async (): Promise<ResumeData | null> => {
  try {
    // Always try localStorage first
    const localResume = localStorage.getItem('craftly_resume');
    if (localResume) {
      try {
        const resumeData = JSON.parse(localResume);
        console.log('📱 Resume loaded from localStorage (fast)');
        return resumeData;
      } catch (error) {
        console.warn('Invalid localStorage data, trying Firestore');
      }
    }

    const user = auth.currentUser;
    if (!user) return null;

    const cacheKey = `resume_${user.uid}`;
    const cached = operationCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('🔥 Resume loaded from cache');
      return cached.data;
    }

    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data() as OptimizedUserData;
      const resumeData = userData.resumeData;
      
      if (resumeData) {
        // Cache and save to localStorage
        operationCache.set(cacheKey, { data: resumeData, timestamp: Date.now() });
        localStorage.setItem('craftly_resume', JSON.stringify(resumeData));
        console.log('✅ Resume loaded from Firestore');
        return resumeData;
      }
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

// Simplified application storage - only store the latest one
export const saveApplicationToFirebase = async (applicationData: JobApplication): Promise<string> => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    // Save to localStorage immediately
    localStorage.setItem('craftly_application', JSON.stringify(applicationData));
    
    // Batch the Firestore operation
    FirestoreBatch.addOperation(async () => {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        lastApplication: {
          ...applicationData,
          id: `app_${Date.now()}`,
          updatedAt: new Date()
        }
      });
    });
    
    console.log('✅ Application queued for batch save');
    return `local_app_${Date.now()}`;
  } catch (error) {
    console.error('❌ Application save failed:', error);
    localStorage.setItem('craftly_application', JSON.stringify(applicationData));
    throw error;
  }
};

// Load latest application
export const loadApplicationFromFirebase = async (): Promise<JobApplication | null> => {
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

    const user = auth.currentUser;
    if (!user) return null;

    const cacheKey = `app_${user.uid}`;
    const cached = operationCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('🔥 Application loaded from cache');
      return cached.data;
    }

    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data() as OptimizedUserData;
      const appData = userData.lastApplication;
      
      if (appData) {
        // Cache and save to localStorage
        operationCache.set(cacheKey, { data: appData, timestamp: Date.now() });
        localStorage.setItem('craftly_application', JSON.stringify(appData));
        console.log('✅ Application loaded from Firestore');
        return appData;
      }
    }
    
    return null;
  } catch (error) {
    console.error('❌ Application load failed:', error);
    return null;
  }
};

// Update resume with batching
export const updateResumeInFirebase = async (resumeData: ResumeData): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    // Update localStorage immediately
    localStorage.setItem('craftly_resume', JSON.stringify(resumeData));
    
    // Invalidate cache
    operationCache.delete(`resume_${user.uid}`);
    
    // Batch the Firestore operation
    FirestoreBatch.addOperation(async () => {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        resumeData: resumeData,
        lastResumeUpdate: new Date()
      });
    });
    
    console.log('✅ Resume update queued for batch save');
  } catch (error) {
    console.error('❌ Resume update failed:', error);
    localStorage.setItem('craftly_resume', JSON.stringify(resumeData));
    throw error;
  }
};

// Update application with batching
export const updateApplicationInFirebase = async (applicationData: JobApplication): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    // Update localStorage immediately
    localStorage.setItem('craftly_application', JSON.stringify(applicationData));
    
    // Invalidate cache
    operationCache.delete(`app_${user.uid}`);
    
    // Batch the Firestore operation
    FirestoreBatch.addOperation(async () => {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        lastApplication: {
          ...applicationData,
          updatedAt: new Date()
        }
      });
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
  console.log('🔥 Cache cleared');
};