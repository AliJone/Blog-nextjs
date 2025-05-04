import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { createClient } from './supabase';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { useRouter } from 'next/router';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  isSessionExpired: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const router = useRouter();

  // Function to refresh the session
  const refreshSession = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        throw error;
      }
      
      if (data?.session) {
        setSession(data.session);
        setUser(data.session.user);
        setIsSessionExpired(false);
      } else {
        // No session found
        setSession(null);
        setUser(null);
        setIsSessionExpired(true);
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
      setIsSessionExpired(true);
    }
  }, []);

  // Check for session expiration periodically
  useEffect(() => {
    if (!session) return;
    
    // Calculate time until expiry (with 5 minute buffer)
    const expiresAt = session.expires_at! * 1000; // convert to milliseconds
    const timeUntilExpiry = expiresAt - Date.now() - 5 * 60 * 1000; // 5 minutes before expiry
    

    if (timeUntilExpiry <= 0) {
      // Session is already expired or about to expire, refresh immediately
      refreshSession();
      return;
    }
    
    // Set up a timer to refresh the session before it expires
    const refreshTimer = setTimeout(() => {
      refreshSession();
    }, timeUntilExpiry);
    
    return () => clearTimeout(refreshTimer);
  }, [session, refreshSession]);

  useEffect(() => {
    // Initial session fetch
    const getSession = async () => {
      setIsLoading(true);
      try {
        const supabase = createClient();
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (session) {
          setSession(session);
          setUser(session.user);
        } else {
          setSession(null);
          setUser(null);
        }
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getSession();

    // Listen for auth state changes
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setSession(newSession);
          setUser(newSession?.user ?? null);
          setIsSessionExpired(false);
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setIsSessionExpired(false);
        } else if (event === 'USER_UPDATED') {
          setUser(newSession?.user ?? null);
        }
        
        setIsLoading(false);
      }
    );

    // Cleanup function
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign out function
  const signOut = async () => {
    try {
      setIsLoading(true);
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      // Clear state on sign out
      setUser(null);
      setSession(null);
      setIsSessionExpired(false);
      
      // Redirect to login page
      router.push('/login');
    } catch (error) {
      if (error instanceof AuthError) {
        console.error('Error signing out:', error.message);
      } else {
        console.error('Unknown error signing out:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    session,
    isLoading,
    signOut,
    refreshSession,
    isSessionExpired,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}