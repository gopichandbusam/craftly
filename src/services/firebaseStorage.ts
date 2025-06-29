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
  resumeLink: string; // URL or reference to resume document
  parsedData: ResumeData | null;
  applications: JobApplication[];
  createdAt: Date;
  updatedAt: Date;
}

// Initialize or get user document
export const initializeUserDocument = async (name: string, email: string): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated - cannot initialize user document');
    }

    console.log('🔧 Initializing user document for:', user.uid);
    
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      const userData: UserData = {
        name,
        email,
        resumeLink: '',
        parsedData: null,
        applications: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await setDoc(userDocRef, userData);
      console.log('✅ User document created successfully');
    } else {
      // Update name and email if they've changed
      await updateDoc(userDocRef, {
        name,
        email,
        updatedAt: new Date()
      });
      console.log('✅ User document updated with current info');
    }
  } catch (error) {
    console.error('❌ Error initializing user document:', error);
    throw new Error(`Failed to initialize user data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Save resume data to user document
export const saveResumeToFirebase = async (resumeData: ResumeData): Promise<string> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated - cannot save resume to cloud');
    }

    console.log('💾 Saving resume to Firebase for user:', user.uid);
    
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

    const resumeLink = `users/${user.uid}/resume_${Date.now()}`;
    
    await updateDoc(userDocRef, {
      resumeLink,
      parsedData: resumeData,
      updatedAt: new Date()
    });
    
    console.log('✅ Resume saved to Firebase user document');
    
    // Also save to localStorage as backup
    localStorage.setItem('craftly_resume', JSON.stringify(resumeData));
    localStorage.setItem('craftly_resume_link', resumeLink);
    
    return resumeLink;
  } catch (error) {
    console.error('❌ Error saving resume to Firebase:', error);
    // Fallback to localStorage only
    localStorage.setItem('craftly_resume', JSON.stringify(resumeData));
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown cloud storage error';
    throw new Error(`Failed to save resume to cloud storage: ${errorMessage}. Data saved locally as backup.`);
  }
};

// Load resume data from user document
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

    console.log('📄 Loading resume from Firebase for user:', user.uid);
    
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      console.log('📄 No user document found in Firebase, checking localStorage backup');
      const localResume = localStorage.getItem('craftly_resume');
      if (localResume) {
        console.log('📄 Resume loaded from localStorage backup');
        return JSON.parse(localResume);
      }
      return null;
    }

    const userData = userDoc.data() as UserData;
    const resumeData = userData.parsedData;
    
    if (resumeData && resumeData.name && resumeData.email) {
      console.log('✅ Resume loaded from Firebase user document:', resumeData);
      
      // Update localStorage as backup
      localStorage.setItem('craftly_resume', JSON.stringify(resumeData));
      if (userData.resumeLink) {
        localStorage.setItem('craftly_resume_link', userData.resumeLink);
      }
      
      return resumeData;
    } else {
      console.log('📄 No valid resume data in user document, checking localStorage backup');
      const localResume = localStorage.getItem('craftly_resume');
      if (localResume) {
        console.log('📄 Resume loaded from localStorage backup');
        return JSON.parse(localResume);
      }
      return null;
    }
  } catch (error) {
    console.error('❌ Error loading resume from Firebase:', error);
    // Fallback to localStorage
    const localResume = localStorage.getItem('craftly_resume');
    if (localResume) {
      console.log('📄 Fallback: Resume loaded from localStorage');
      return JSON.parse(localResume);
    }
    
    throw new Error(`Failed to load resume data: ${error instanceof Error ? error.message : 'Unknown error'}. Please upload your resume again.`);
  }
};

// Update existing resume data
export const updateResumeInFirebase = async (resumeData: ResumeData): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated - cannot update resume in cloud');
    }

    console.log('🔄 Updating resume in Firebase user document');
    
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
      parsedData: resumeData,
      updatedAt: new Date()
    });
    
    console.log('✅ Resume updated in Firebase user document');
    
    // Update localStorage as backup
    localStorage.setItem('craftly_resume', JSON.stringify(resumeData));
  } catch (error) {
    console.error('❌ Error updating resume in Firebase:', error);
    // Fallback to localStorage only
    localStorage.setItem('craftly_resume', JSON.stringify(resumeData));
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown cloud storage error';
    throw new Error(`Failed to update resume in cloud storage: ${errorMessage}. Data saved locally as backup.`);
  }
};

// Save application data to user document
export const saveApplicationToFirebase = async (applicationData: JobApplication): Promise<string> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated - cannot save application to cloud');
    }
    
    console.log('💾 Saving application to Firebase user document');
    
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
    
    console.log('✅ Application saved to Firebase user document');
    
    // Also save to localStorage as backup
    localStorage.setItem('craftly_application', JSON.stringify(applicationData));
    localStorage.setItem('craftly_application_id', applicationWithId.id);
    
    return applicationWithId.id;
  } catch (error) {
    console.error('❌ Error saving application to Firebase:', error);
    // Fallback to localStorage only
    localStorage.setItem('craftly_application', JSON.stringify(applicationData));
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown cloud storage error';
    throw new Error(`Failed to save application to cloud storage: ${errorMessage}. Data saved locally as backup.`);
  }
};

// Load application data from user document
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

    console.log('📋 Loading application from Firebase user document');
    
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      console.log('📋 No user document found in Firebase, checking localStorage backup');
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
      console.log('📋 No applications found in user document, checking localStorage backup');
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

    console.log('✅ Application loaded from Firebase user document:', mostRecentApplication);
    
    // Update localStorage as backup
    localStorage.setItem('craftly_application', JSON.stringify(mostRecentApplication));
    if (mostRecentApplication.id) {
      localStorage.setItem('craftly_application_id', mostRecentApplication.id);
    }
    
    return mostRecentApplication;
  } catch (error) {
    console.error('❌ Error loading application from Firebase:', error);
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

// Update existing application data
export const updateApplicationInFirebase = async (applicationData: JobApplication): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated - cannot update application in cloud');
    }

    const applicationId = localStorage.getItem('craftly_application_id');
    if (!applicationId) {
      // Create new application if no existing ID
      await saveApplicationToFirebase(applicationData);
      return;
    }

    console.log('🔄 Updating application in Firebase user document:', applicationId);
    
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
    
    console.log('✅ Application updated in Firebase user document');
    
    // Update localStorage as backup
    localStorage.setItem('craftly_application', JSON.stringify(applicationData));
  } catch (error) {
    console.error('❌ Error updating application in Firebase:', error);
    // Fallback to localStorage only
    localStorage.setItem('craftly_application', JSON.stringify(applicationData));
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown cloud storage error';
    throw new Error(`Failed to update application in cloud storage: ${errorMessage}. Data saved locally as backup.`);
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

    console.log('👤 Loading user data from Firebase:', user.uid);
    
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      console.log('👤 No user document found in Firebase');
      return null;
    }

    const userData = userDoc.data() as UserData;
    console.log('✅ User data loaded from Firebase:', userData);
    
    return userData;
  } catch (error) {
    console.error('❌ Error loading user data from Firebase:', error);
    throw new Error(`Failed to load user data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};