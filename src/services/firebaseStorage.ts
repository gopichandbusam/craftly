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

// Save resume data directly to Firestore (no file storage)
export const saveResumeToFirebase = async (resumeData: ResumeData): Promise<string> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated - cannot save resume to Firestore');
    }

    console.log('💾 Saving parsed resume data to Firestore...');
    
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
    
    console.log('✅ Resume data saved to Firestore successfully');
    
    // Also save to localStorage as backup
    localStorage.setItem('craftly_resume', JSON.stringify(resumeData));
    
    return `firestore_${user.uid}_${Date.now()}`;
  } catch (error) {
    console.error('❌ Error saving resume data to Firestore:', error);
    // Fallback to localStorage only
    localStorage.setItem('craftly_resume', JSON.stringify(resumeData));
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown Firestore error';
    throw new Error(`Failed to save resume to Firestore: ${errorMessage}. Data saved locally as backup.`);
  }
};

// Load resume data from Firestore
export const loadResumeFromFirebase = async (): Promise<ResumeData | null> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.log('⚠️ User not authenticated, checking localStorage backup');
      const localResume = localStorage.getItem('craftly_resume');
      if (localResume) {
        console.log('📄 Resume loaded from localStorage backup');
        return JSON.parse(localResume);
      }
      return null;
    }

    console.log('📄 Loading resume data from Firestore for user:', user.uid);
    
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      console.log('📄 No user document found in Firestore, checking localStorage backup');
      const localResume = localStorage.getItem('craftly_resume');
      if (localResume) {
        console.log('📄 Resume loaded from localStorage backup');
        return JSON.parse(localResume);
      }
      return null;
    }

    const userData = userDoc.data() as UserData;
    const resumeData = userData.resumeData;
    
    if (resumeData && resumeData.name && resumeData.email) {
      console.log('✅ Resume data loaded from Firestore:', resumeData);
      
      // Update localStorage as backup
      localStorage.setItem('craftly_resume', JSON.stringify(resumeData));
      
      return resumeData;
    } else {
      console.log('📄 No valid resume data in Firestore, checking localStorage backup');
      const localResume = localStorage.getItem('craftly_resume');
      if (localResume) {
        console.log('📄 Resume loaded from localStorage backup');
        return JSON.parse(localResume);
      }
      return null;
    }
  } catch (error) {
    console.error('❌ Error loading resume from Firestore:', error);
    // Fallback to localStorage
    const localResume = localStorage.getItem('craftly_resume');
    if (localResume) {
      console.log('📄 Fallback: Resume loaded from localStorage');
      return JSON.parse(localResume);
    }
    
    throw new Error(`Failed to load resume data: ${error instanceof Error ? error.message : 'Unknown error'}. Please upload your resume again.`);
  }
};

// Update existing resume data in Firestore
export const updateResumeInFirebase = async (resumeData: ResumeData): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated - cannot update resume in Firestore');
    }

    console.log('🔄 Updating resume data in Firestore...');
    
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
    
    // Update localStorage as backup
    localStorage.setItem('craftly_resume', JSON.stringify(resumeData));
  } catch (error) {
    console.error('❌ Error updating resume in Firestore:', error);
    // Fallback to localStorage only
    localStorage.setItem('craftly_resume', JSON.stringify(resumeData));
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown Firestore error';
    throw new Error(`Failed to update resume in Firestore: ${errorMessage}. Data saved locally as backup.`);
  }
};

// Save application data to Firestore
export const saveApplicationToFirebase = async (applicationData: JobApplication): Promise<string> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated - cannot save application to Firestore');
    }
    
    console.log('💾 Saving application to Firestore...');
    
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
    
    // Also save to localStorage as backup
    localStorage.setItem('craftly_application', JSON.stringify(applicationData));
    localStorage.setItem('craftly_application_id', applicationWithId.id);
    
    return applicationWithId.id;
  } catch (error) {
    console.error('❌ Error saving application to Firestore:', error);
    // Fallback to localStorage only
    localStorage.setItem('craftly_application', JSON.stringify(applicationData));
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown Firestore error';
    throw new Error(`Failed to save application to Firestore: ${errorMessage}. Data saved locally as backup.`);
  }
};

// Load application data from Firestore
export const loadApplicationFromFirebase = async (): Promise<JobApplication | null> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.log('⚠️ User not authenticated, checking localStorage backup');
      const localApplication = localStorage.getItem('craftly_application');
      if (localApplication) {
        console.log('📋 Application loaded from localStorage backup');
        return JSON.parse(localApplication);
      }
      return null;
    }

    console.log('📋 Loading application from Firestore...');
    
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      console.log('📋 No user document found in Firestore, checking localStorage backup');
      const localApplication = localStorage.getItem('craftly_application');
      if (localApplication) {
        console.log('📋 Application loaded from localStorage backup');
        return JSON.parse(localApplication);
      }
      return null;
    }

    const userData = userDoc.data() as UserData;
    const applications = userData.applications || [];
    
    if (applications.length === 0) {
      console.log('📋 No applications found in Firestore, checking localStorage backup');
      const localApplication = localStorage.getItem('craftly_application');
      if (localApplication) {
        console.log('📋 Application loaded from localStorage backup');
        return JSON.parse(localApplication);
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
    
    // Update localStorage as backup
    localStorage.setItem('craftly_application', JSON.stringify(mostRecentApplication));
    if (mostRecentApplication.id) {
      localStorage.setItem('craftly_application_id', mostRecentApplication.id);
    }
    
    return mostRecentApplication;
  } catch (error) {
    console.error('❌ Error loading application from Firestore:', error);
    // Fallback to localStorage
    const localApplication = localStorage.getItem('craftly_application');
    if (localApplication) {
      console.log('📋 Fallback: Application loaded from localStorage');
      return JSON.parse(localApplication);
    }
    
    // Don't throw an error for missing applications - this is normal for new users
    console.log('📋 No application data found - this is normal for new users');
    return null;
  }
};

// Update existing application data in Firestore
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

    console.log('🔄 Updating application in Firestore:', applicationId);
    
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
    
    // Update localStorage as backup
    localStorage.setItem('craftly_application', JSON.stringify(applicationData));
  } catch (error) {
    console.error('❌ Error updating application in Firestore:', error);
    // Fallback to localStorage only
    localStorage.setItem('craftly_application', JSON.stringify(applicationData));
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown Firestore error';
    throw new Error(`Failed to update application in Firestore: ${errorMessage}. Data saved locally as backup.`);
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