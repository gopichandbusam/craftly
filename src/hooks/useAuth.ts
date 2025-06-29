import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { initializeUserProfile } from '../services/supabaseStorage';
import { trackUserSignup, trackUserLogin, trackUserLogout, trackUserSessionStart, trackUserSessionEnd } from '../services/optimizedAnalytics';
import { User } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase: any = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✅ Supabase initialized');
} else {
  console.warn('⚠️ Supabase configuration missing. Authentication will use demo mode.');
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionStartTime] = useState<number>(Date.now());

  useEffect(() => {
    // Track session start
    trackUserSessionStart();

    const initializeAuth = async () => {
      if (supabase) {
        try {
          // Get initial session
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const userData: User = {
              uid: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
              linkedProviders: ['email'],
              hasEmailProvider: true,
              hasGoogleProvider: false
            };
            setUser(userData);
            console.log('✅ User authenticated from session:', userData);
            await initializeUserProfile(userData.email, userData.name);
          }

          // Listen for auth changes
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
            console.log('🔄 Auth state changed:', event, session?.user?.email);
            
            if (session?.user) {
              const userData: User = {
                uid: session.user.id,
                email: session.user.email || '',
                name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
                linkedProviders: ['email'],
                hasEmailProvider: true,
                hasGoogleProvider: false
              };
              setUser(userData);
              console.log('✅ User set from auth change:', userData);
              await initializeUserProfile(userData.email, userData.name);
            } else {
              if (user) {
                const sessionDuration = Math.floor((Date.now() - sessionStartTime) / 1000);
                trackUserSessionEnd(sessionDuration);
              }
              setUser(null);
              localStorage.removeItem('craftly_user');
              localStorage.removeItem('craftly_demo_user');
              console.log('📤 User logged out');
            }
          });

          setLoading(false);
          return () => subscription.unsubscribe();
        } catch (error) {
          console.error('❌ Supabase auth initialization failed:', error);
          setLoading(false);
        }
      } else {
        // Demo mode - check localStorage for demo user
        console.log('🔄 Checking for demo user in localStorage');
        const demoUser = localStorage.getItem('craftly_demo_user');
        if (demoUser) {
          try {
            const userData = JSON.parse(demoUser);
            setUser(userData);
            console.log('✅ Demo user loaded from localStorage:', userData);
          } catch (error) {
            console.warn('⚠️ Invalid demo user data in localStorage');
            localStorage.removeItem('craftly_demo_user');
          }
        }
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      if (user) {
        const sessionDuration = Math.floor((Date.now() - sessionStartTime) / 1000);
        trackUserSessionEnd(sessionDuration);
      }
    };
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('🔄 Login attempt for:', email);
      setLoading(true);

      // Demo login check
      if (email === 'gopichand@gmail.com' && password === 'gopigopi') {
        console.log('🎯 Demo login detected');
        const demoUser: User = {
          uid: 'demo-user-id',
          email: 'gopichand@gmail.com',
          name: 'Gopichand Busam',
          linkedProviders: ['demo'],
          hasEmailProvider: true,
          hasGoogleProvider: false
        };
        
        setUser(demoUser);
        localStorage.setItem('craftly_demo_user', JSON.stringify(demoUser));
        trackUserLogin('demo', demoUser);
        console.log('✅ Demo login successful, user set:', demoUser);
        setLoading(false);
        return { success: true };
      }

      if (!supabase) {
        setLoading(false);
        return { success: false, error: 'Supabase not configured. Use demo login: gopichand@gmail.com / gopigopi' };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setLoading(false);
        return { success: false, error: error.message };
      }

      const userData: User = {
        uid: data.user.id,
        email: data.user.email || '',
        name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
        linkedProviders: ['email'],
        hasEmailProvider: true,
        hasGoogleProvider: false
      };

      trackUserLogin('email', userData);
      await initializeUserProfile(userData.email, userData.name);
      
      console.log('✅ Supabase login successful');
      setLoading(false);
      return { success: true };
    } catch (error: any) {
      console.error('❌ Login error:', error);
      setLoading(false);
      return { success: false, error: error.message || 'Login failed. Please try again.' };
    }
  };

  const signup = async (email: string, password: string, name?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);

      if (!supabase) {
        setLoading(false);
        return { success: false, error: 'Supabase not configured. Use demo login: gopichand@gmail.com / gopigopi' };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || email.split('@')[0]
          }
        }
      });

      if (error) {
        setLoading(false);
        return { success: false, error: error.message };
      }

      const userData: User = {
        uid: data.user?.id || '',
        email: email,
        name: name || email.split('@')[0] || 'User',
        linkedProviders: ['email'],
        hasEmailProvider: true,
        hasGoogleProvider: false
      };

      trackUserSignup('email', userData);
      
      if (data.user) {
        await initializeUserProfile(userData.email, userData.name);
      }
      
      console.log('✅ Signup successful');
      setLoading(false);
      return { success: true };
    } catch (error: any) {
      console.error('❌ Signup error:', error);
      setLoading(false);
      return { success: false, error: error.message || 'Account creation failed. Please try again.' };
    }
  };

  const signInWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);

      if (!supabase) {
        setLoading(false);
        return { success: false, error: 'Supabase not configured. Use demo login: gopichand@gmail.com / gopigopi' };
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });

      if (error) {
        setLoading(false);
        return { success: false, error: error.message };
      }

      console.log('✅ Google sign-in initiated');
      setLoading(false);
      return { success: true };
    } catch (error: any) {
      console.error('❌ Google sign-in error:', error);
      setLoading(false);
      return { success: false, error: error.message || 'Google sign-in failed. Please try again.' };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      console.log('🔄 Logout initiated');
      // Track logout before clearing data
      trackUserLogout();
      
      if (supabase) {
        await supabase.auth.signOut();
      }
      
      // Clear all local storage
      localStorage.removeItem('craftly_user');
      localStorage.removeItem('craftly_demo_user');
      localStorage.removeItem('craftly_resume');
      localStorage.removeItem('craftly_application');
      localStorage.removeItem('craftly_custom_prompts');
      localStorage.removeItem('craftly_ai_models');
      
      setUser(null);
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  };

  return { 
    user, 
    login, 
    signup, 
    signInWithGoogle, 
    logout, 
    loading 
  };
};