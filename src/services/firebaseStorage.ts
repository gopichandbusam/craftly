import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { ResumeData, JobApplication } from '../types';
import { DeviceStorage, STORAGE_KEYS } from './deviceStorage';

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

export interface UserData {
  name: string;
  email: string;
  // Parsed resume data stored directly in Firestore
  resumeData: ResumeData | null;
  applications: JobApplication[];
  lastResumeUpdate: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Initialize or get user document - only update updatedAt when data actually changes
export const initializeUserDocument = async (name: string, email: string): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated - cannot initialize user document');
    }

    console.log('🔧 Checking user document for:', user.uid);
    
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      // Create new user document
      const userData: UserData = {
        name,
        email,
        resumeData: null, // Parsed resume data
        applications: [],
        lastResumeUpdate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await setDoc(userDocRef, userData);
      console.log('✅ User document created successfully');
    } else {
      // Check if name or email have actually changed
      const existingData = userDoc.data() as UserData;
      const hasChanges = existingData.name !== name || existingData.email !== email;
      
      if (hasChanges) {
        // Only update if there are actual changes
        await updateDoc(userDocRef, {
          name,
          email,
          updatedAt: new Date()
        });
        console.log('✅ User document updated with changes - name or email modified');
      } else {
        console.log('✅ User document exists and is up to date - no updatedAt change needed');
      }
    }
  } catch (error) {
    console.error('❌ Error initializing user document:', error);
    throw new Error(`Failed to initialize user data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Save resume data with 1-week device storage + Firestore
export const saveResumeToFirebase = async (resumeData: ResumeData): Promise<string> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated - cannot save resume to Firestore');
    }

    console.log('💾 Saving resume data to Firestore + device storage...');
    
    // Validate resume data before saving
    if (!resumeData.name || !resumeData.email) {
      throw new Error('Invalid resume data - missing required fields');
    }

    const userDocRef = doc(db, 'users', user.uid);
    
    // Check if user document exists
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
      throw new Error('User document does not exist - please refresh and try again');
    }

    // Save to Firestore
    await updateDoc(userDocRef, {
      resumeData: resumeData,
      lastResumeUpdate: new Date(),
      updatedAt: new Date()
    });
    
    console.log('✅ Resume data saved to Firestore successfully');
    
    // Store on device for 1 week
    DeviceStorage.store(STORAGE_KEYS.RESUME, resumeData);
    
    // Legacy localStorage for compatibility
    localStorage.setItem('craftly_resume', JSON.stringify(resumeData));
    
    // Show storage info
    const storageInfo = DeviceStorage.getStorageInfo(STORAGE_KEYS.RESUME);
    console.log('📱 Device storage info:', {
      expires: storageInfo.expirationDate?.toLocaleString(),
      size: `${(storageInfo.size / 1024).toFixed(2)} KB`,
      remaining: `${Math.ceil(storageInfo.remaining / (24 * 60 * 60 * 1000))} days`
    });
    
    return `firestore_${user.uid}_${Date.now()}`;
  } catch (error) {
    console.error('❌ Error saving resume data to Firestore:', error);
    
    // Fallback to device storage only
    DeviceStorage.store(STORAGE_KEYS.RESUME, resumeData);
    localStorage.setItem('craftly_resume', JSON.stringify(resumeData));
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown Firestore error';
    throw new Error(`Failed to save resume to Firestore: ${errorMessage}. Data saved locally for 1 week.`);
  }
};

// Load resume data with 1-week device storage priority
export const loadResumeFromFirebase = async (): Promise<ResumeData | null> => {
  try {
    // First try device storage (faster, includes 1-week storage)
    const deviceData = DeviceStorage.retrieve<ResumeData>(STORAGE_KEYS.RESUME);
    if (deviceData) {
      const storageInfo = DeviceStorage.getStorageInfo(STORAGE_KEYS.RESUME);
      console.log('📱 Resume loaded from device storage:', {
        age: `${Math.ceil(storageInfo.age / (24 * 60 * 60 * 1000))} days old`,
        remaining: `${Math.ceil(storageInfo.remaining / (24 * 60 * 60 * 1000))} days remaining`
      });
      return deviceData;
    }

    const user = auth.currentUser;
    if (!user) {
      console.log('⚠️ User not authenticated, checking legacy localStorage');
      const localResume = localStorage.getItem('craftly_resume');
      if (localResume) {
        const resumeData = JSON.parse(localResume);
        // Migrate to new device storage
        DeviceStorage.store(STORAGE_KEYS.RESUME, resumeData);
        console.log('📱 Resume migrated to device storage');
        return resumeData;
      }
      return null;
    }

    console.log('📄 Loading resume data from Firestore for user:', user.uid);
    
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      console.log('📄 No user document found in Firestore, checking legacy localStorage');
      const localResume = localStorage.getItem('craftly_resume');
      if (localResume) {
        const resumeData = JSON.parse(localResume);
        DeviceStorage.store(STORAGE_KEYS.RESUME, resumeData);
        console.log('📱 Resume migrated to device storage');
        return resumeData;
      }
      return null;
    }

    const userData = userDoc.data() as UserData;
    const resumeData = userData.resumeData;
    
    if (resumeData && resumeData.name && resumeData.email) {
      console.log('✅ Resume data loaded from Firestore:', resumeData);
      
      // Store on device for 1 week
      DeviceStorage.store(STORAGE_KEYS.RESUME, resumeData);
      
      // Update legacy localStorage for compatibility
      localStorage.setItem('craftly_resume', JSON.stringify(resumeData));
      
      return resumeData;
    } else {
      console.log('📄 No valid resume data in Firestore, checking legacy localStorage');
      const localResume = localStorage.getItem('craftly_resume');
      if (localResume) {
        const resumeData = JSON.parse(localResume);
        DeviceStorage.store(STORAGE_KEYS.RESUME, resumeData);
        console.log('📱 Resume migrated to device storage');
        return resumeData;
      }
      return null;
    }
  } catch (error) {
    console.error('❌ Error loading resume from Firestore:', error);
    // Fallback to device storage, then legacy localStorage
    const deviceData = DeviceStorage.retrieve<ResumeData>(STORAGE_KEYS.RESUME);
    if (deviceData) {
      console.log('📱 Fallback: Resume loaded from device storage');
      return deviceData;
    }
    
    const localResume = localStorage.getItem('craftly_resume');
    if (localResume) {
      const resumeData = JSON.parse(localResume);
      DeviceStorage.store(STORAGE_KEYS.RESUME, resumeData);
      console.log('📱 Fallback: Resume loaded from localStorage and migrated');
      return resumeData;
    }
    
    throw new Error(`Failed to load resume data: ${error instanceof Error ? error.message : 'Unknown error'}. Please upload your resume again.`);
  }
};

// Update existing resume data with device storage
export const updateResumeInFirebase = async (resumeData: ResumeData): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated - cannot update resume in Firestore');
    }

    console.log('🔄 Updating resume data in Firestore + device storage...');
    
    // Validate resume data before saving
    if (!resumeData.name || !resumeData.email) {
      throw new Error('Invalid resume data - missing required fields');
    }

    const userDocRef = doc(db, 'users', user.uid);
    
    // Check if user document exists
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
      throw new Error('User document does not exist - please refresh and try again');
    }
    
    await updateDoc(userDocRef, {
      resumeData: resumeData,
      lastResumeUpdate: new Date(),
      updatedAt: new Date()
    });
    
    console.log('✅ Resume data updated in Firestore');
    
    // Update device storage
    DeviceStorage.store(STORAGE_KEYS.RESUME, resumeData);
    
    // Update legacy localStorage for compatibility
    localStorage.setItem('craftly_resume', JSON.stringify(resumeData));
  } catch (error) {
    console.error('❌ Error updating resume in Firestore:', error);
    
    // Fallback to device storage only
    DeviceStorage.store(STORAGE_KEYS.RESUME, resumeData);
    localStorage.setItem('craftly_resume', JSON.stringify(resumeData));
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown Firestore error';
    throw new Error(`Failed to update resume in Firestore: ${errorMessage}. Data saved locally for 1 week.`);
  }
};

// Save application data with device storage
export const saveApplicationToFirebase = async (applicationData: JobApplication): Promise<string> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated - cannot save application to Firestore');
    }
    
    console.log('💾 Saving application to Firestore + device storage...');
    
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      throw new Error('User document does not exist - please refresh and try again');
    }
    
    const userData = userDoc.data() as UserData;
    const applications = userData.applications || [];
    
    // Add the new application with timestamp
    const applicationWithId = {
      ...applicationData,
      id: `app_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    applications.push(applicationWithId);
    
    await updateDoc(userDocRef, {
      applications,
      updatedAt: new Date()
    });
    
    console.log('✅ Application saved to Firestore');
    
    // Store on device for 1 week
    DeviceStorage.store(STORAGE_KEYS.APPLICATION, applicationData);
    
    // Legacy localStorage for compatibility
    localStorage.setItem('craftly_application', JSON.stringify(applicationData));
    localStorage.setItem('craftly_application_id', applicationWithId.id);
    
    return applicationWithId.id;
  } catch (error) {
    console.error('❌ Error saving application to Firestore:', error);
    
    // Fallback to device storage only
    DeviceStorage.store(STORAGE_KEYS.APPLICATION, applicationData);
    localStorage.setItem('craftly_application', JSON.stringify(applicationData));
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown Firestore error';
    throw new Error(`Failed to save application to Firestore: ${errorMessage}. Data saved locally for 1 week.`);
  }
};

// Load application data with device storage priority
export const loadApplicationFromFirebase = async (): Promise<JobApplication | null> => {
  try {
    // First try device storage
    const deviceData = DeviceStorage.retrieve<JobApplication>(STORAGE_KEYS.APPLICATION);
    if (deviceData) {
      console.log('📱 Application loaded from device storage');
      return deviceData;
    }

    const user = auth.currentUser;
    if (!user) {
      console.log('⚠️ User not authenticated, checking legacy localStorage');
      const localApplication = localStorage.getItem('craftly_application');
      if (localApplication) {
        const appData = JSON.parse(localApplication);
        DeviceStorage.store(STORAGE_KEYS.APPLICATION, appData);
        console.log('📱 Application migrated to device storage');
        return appData;
      }
      return null;
    }

    console.log('📋 Loading application from Firestore...');
    
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      console.log('📋 No user document found in Firestore, checking legacy localStorage');
      const localApplication = localStorage.getItem('craftly_application');
      if (localApplication) {
        const appData = JSON.parse(localApplication);
        DeviceStorage.store(STORAGE_KEYS.APPLICATION, appData);
        console.log('📱 Application migrated to device storage');
        return appData;
      }
      return null;
    }

    const userData = userDoc.data() as UserData;
    const applications = userData.applications || [];
    
    if (applications.length === 0) {
      console.log('📋 No applications found in Firestore, checking legacy localStorage');
      const localApplication = localStorage.getItem('craftly_application');
      if (localApplication) {
        const appData = JSON.parse(localApplication);
        DeviceStorage.store(STORAGE_KEYS.APPLICATION, appData);
        console.log('📱 Application migrated to device storage');
        return appData;
      }
      return null;
    }

    // Get the most recent application
    const mostRecentApplication = applications.reduce((latest, current) => {
      const latestTime = latest.updatedAt ? new Date(latest.updatedAt).getTime() : 0;
      const currentTime = current.updatedAt ? new Date(current.updatedAt).getTime() : 0;
      return currentTime > latestTime ? current : latest;
    });

    console.log('✅ Application loaded from Firestore:', mostRecentApplication);
    
    // Store on device for 1 week
    DeviceStorage.store(STORAGE_KEYS.APPLICATION, mostRecentApplication);
    
    // Update legacy localStorage for compatibility
    localStorage.setItem('craftly_application', JSON.stringify(mostRecentApplication));
    if (mostRecentApplication.id) {
      localStorage.setItem('craftly_application_id', mostRecentApplication.id);
    }
    
    return mostRecentApplication;
  } catch (error) {
    console.error('❌ Error loading application from Firestore:', error);
    
    // Fallback to device storage, then legacy localStorage
    const deviceData = DeviceStorage.retrieve<JobApplication>(STORAGE_KEYS.APPLICATION);
    if (deviceData) {
      console.log('📱 Fallback: Application loaded from device storage');
      return deviceData;
    }
    
    const localApplication = localStorage.getItem('craftly_application');
    if (localApplication) {
      const appData = JSON.parse(localApplication);
      DeviceStorage.store(STORAGE_KEYS.APPLICATION, appData);
      console.log('📱 Fallback: Application loaded from localStorage and migrated');
      return appData;
    }
    
    // Don't throw an error for missing applications - this is normal for new users
    console.log('📋 No application data found - this is normal for new users');
    return null;
  }
};

// Update existing application data with device storage
export const updateApplicationInFirebase = async (applicationData: JobApplication): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated - cannot update application in Firestore');
    }

    const applicationId = localStorage.getItem('craftly_application_id');
    if (!applicationId) {
      // Create new application if no existing ID
      await saveApplicationToFirebase(applicationData);
      return;
    }

    console.log('🔄 Updating application in Firestore + device storage:', applicationId);
    
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      throw new Error('User document does not exist - please refresh and try again');
    }
    
    const userData = userDoc.data() as UserData;
    const applications = userData.applications || [];
    
    // Find and update the specific application
    const updatedApplications = applications.map(app => {
      if (app.id === applicationId) {
        return {
          ...applicationData,
          id: applicationId,
          createdAt: app.createdAt || new Date(),
          updatedAt: new Date()
        };
      }
      return app;
    });
    
    await updateDoc(userDocRef, {
      applications: updatedApplications,
      updatedAt: new Date()
    });
    
    console.log('✅ Application updated in Firestore');
    
    // Update device storage
    DeviceStorage.store(STORAGE_KEYS.APPLICATION, applicationData);
    
    // Update legacy localStorage for compatibility
    localStorage.setItem('craftly_application', JSON.stringify(applicationData));
  } catch (error) {
    console.error('❌ Error updating application in Firestore:', error);
    
    // Fallback to device storage only
    DeviceStorage.store(STORAGE_KEYS.APPLICATION, applicationData);
    localStorage.setItem('craftly_application', JSON.stringify(applicationData));
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown Firestore error';
    throw new Error(`Failed to update application in Firestore: ${errorMessage}. Data saved locally for 1 week.`);
  }
};

// Get user data (for dashboard/profile views)
export const getUserData = async (): Promise<UserData | null> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.log('⚠️ User not authenticated, cannot load user data');
      return null;
    }

    console.log('👤 Loading user data from Firestore:', user.uid);
    
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      console.log('👤 No user document found in Firestore');
      return null;
    }

    const userData = userDoc.data() as UserData;
    console.log('✅ User data loaded from Firestore:', userData);
    
    return userData;
  } catch (error) {
    console.error('❌ Error loading user data from Firestore:', error);
    throw new Error(`Failed to load user data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Get storage analytics for debugging
export const getStorageAnalytics = () => {
  const usage = DeviceStorage.getStorageUsage();
  const resumeInfo = DeviceStorage.getStorageInfo(STORAGE_KEYS.RESUME);
  const appInfo = DeviceStorage.getStorageInfo(STORAGE_KEYS.APPLICATION);
  
  return {
    deviceStorage: {
      totalUsage: `${(usage.totalSize / 1024).toFixed(2)} KB`,
      craftlyItems: usage.craftlyItems,
      craftlySize: `${(usage.craftlySize / 1024).toFixed(2)} KB`
    },
    resume: {
      stored: resumeInfo.exists,
      size: `${(resumeInfo.size / 1024).toFixed(2)} KB`,
      age: `${Math.ceil(resumeInfo.age / (24 * 60 * 60 * 1000))} days`,
      remaining: `${Math.ceil(resumeInfo.remaining / (24 * 60 * 60 * 1000))} days`,
      expires: resumeInfo.expirationDate?.toLocaleString()
    },
    application: {
      stored: appInfo.exists,
      size: `${(appInfo.size / 1024).toFixed(2)} KB`,
      age: `${Math.ceil(appInfo.age / (24 * 60 * 60 * 1000))} days`,
      remaining: `${Math.ceil(appInfo.remaining / (24 * 60 * 60 * 1000))} days`,
      expires: appInfo.expirationDate?.toLocaleString()
    }
  };
};