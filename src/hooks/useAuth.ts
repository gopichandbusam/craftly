import { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth } from '../firebase';
import { initializeUserDocument } from '../services/firebaseStorage';
import { trackUserSignup, trackUserLogin, trackUserLogout, trackUserSessionStart, trackUserSessionEnd } from '../services/analytics';
import { User } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionStartTime] = useState<number>(Date.now());

  useEffect(() => {
    // Track session start
    trackUserSessionStart();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userData: User = {
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User'
        };
        
        // Initialize user document - this is a LOGIN EVENT, so update updatedAt
        try {
          await initializeUserDocument(userData.name, userData.email, true); // true = login event
        } catch (error) {
          console.warn('⚠️ Failed to initialize user document:', error);
        }
        
        setUser(userData);
        localStorage.setItem('craftly_user', JSON.stringify(userData));
      } else {
        // Track session end when user logs out
        if (user) {
          const sessionDuration = Math.floor((Date.now() - sessionStartTime) / 1000);
          trackUserSessionEnd(sessionDuration);
        }
        
        setUser(null);
        localStorage.removeItem('craftly_user');
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      
      // Track session end on component unmount
      if (user) {
        const sessionDuration = Math.floor((Date.now() - sessionStartTime) / 1000);
        trackUserSessionEnd(sessionDuration);
      }
    };
  }, [sessionStartTime, user]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      const userData: User = {
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User'
      };
      
      // Track successful login
      trackUserLogin('email', userData);
      
      // Initialize user document - this is a LOGIN EVENT, so update updatedAt
      try {
        await initializeUserDocument(userData.name, userData.email, true); // true = login event
        console.log('✅ Login: User document updated with login timestamp');
      } catch (error) {
        console.warn('⚠️ Failed to initialize user document during login:', error);
      }
      
      setUser(userData);
      localStorage.setItem('craftly_user', JSON.stringify(userData));
      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed. Please try again.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password. Please try again.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address format.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.';
          break;
        case 'auth/invalid-credential':
          errorMessage = 'Invalid email or password. Please check your credentials.';
          break;
        default:
          errorMessage = error.message || 'Login failed. Please try again.';
      }
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, name?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Update the user's display name if provided
      if (name) {
        await updateProfile(firebaseUser, { displayName: name });
      }
      
      const userData: User = {
        email: firebaseUser.email || '',
        name: name || firebaseUser.email?.split('@')[0] || 'User'
      };
      
      // Track successful signup
      trackUserSignup('email', userData);
      
      // Initialize user document - this is a SIGNUP EVENT, so update updatedAt
      try {
        await initializeUserDocument(userData.name, userData.email, true); // true = signup event
        console.log('✅ Signup: User document created with timestamps');
      } catch (error) {
        console.warn('⚠️ Failed to initialize user document during signup:', error);
      }
      
      setUser(userData);
      localStorage.setItem('craftly_user', JSON.stringify(userData));
      return { success: true };
    } catch (error: any) {
      console.error('Signup error:', error);
      let errorMessage = 'Account creation failed. Please try again.';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address format.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters long.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled.';
          break;
        default:
          errorMessage = error.message || 'Account creation failed. Please try again.';
      }
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      
      const userData: User = {
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User'
      };
      
      // Track successful Google sign-in
      trackUserLogin('google', userData);
      
      // Initialize user document - this is a LOGIN EVENT, so update updatedAt
      try {
        await initializeUserDocument(userData.name, userData.email, true); // true = login event
        console.log('✅ Google Login: User document updated with login timestamp');
      } catch (error) {
        console.warn('⚠️ Failed to initialize user document during Google login:', error);
      }
      
      setUser(userData);
      localStorage.setItem('craftly_user', JSON.stringify(userData));
      return { success: true };
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      let errorMessage = 'Google sign-in failed. Please try again.';
      
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          errorMessage = 'Sign-in was cancelled. Please try again.';
          break;
        case 'auth/popup-blocked':
          errorMessage = 'Pop-up was blocked. Please allow pop-ups and try again.';
          break;
        case 'auth/cancelled-popup-request':
          errorMessage = 'Sign-in was cancelled. Please try again.';
          break;
        case 'auth/account-exists-with-different-credential':
          errorMessage = 'An account already exists with this email using a different sign-in method.';
          break;
        default:
          errorMessage = error.message || 'Google sign-in failed. Please try again.';
      }
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Track logout before clearing data
      trackUserLogout();
      
      await signOut(auth);
      localStorage.removeItem('craftly_user');
      localStorage.removeItem('craftly_resume');
      localStorage.removeItem('craftly_application');
      localStorage.removeItem('craftly_resume_link');
      localStorage.removeItem('craftly_application_id');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return { user, login, signup, signInWithGoogle, logout, loading };
};