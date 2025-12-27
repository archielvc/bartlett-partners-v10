import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

// Auth types
export type UserRole = 'administrator' | 'editor';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  signOut: () => Promise<void>;
  isLoading: boolean;
  /** True if current user can edit site images (administrator only) */
  canEditImages: boolean;
  /** True if current user is an administrator */
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // Safety timeout - never stay loading for more than 5 seconds
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        console.warn('Auth initialization timeout - forcing loading to false');
        setIsLoading(false);
      }
    }, 5000);

    // Check active sessions and sets the user
    const initializeAuth = async () => {
      console.log('AuthContext: Starting initialization...');
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('AuthContext: getSession result:', { hasSession: !!session, error });

        if (error) {
          console.error('Error getting session:', error);
          if (isMounted) setIsLoading(false);
          return;
        }

        if (session?.user) {
          console.log('AuthContext: Found session, fetching profile for:', session.user.email);
          await fetchUserProfile(session.user);
        } else {
          console.log('AuthContext: No session found');
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        console.log('AuthContext: Initialization complete, setting loading to false');
        if (isMounted) setIsLoading(false);
        clearTimeout(timeoutId);
      }
    };

    initializeAuth();

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;

      if (session?.user) {
        await fetchUserProfile(session.user);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (supabaseUser: SupabaseUser): Promise<void> => {
    try {
      // First, check if profile exists
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        // Still set a basic user so login works even if profile fetch fails
        setUser({
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          name: supabaseUser.user_metadata?.full_name || 'User',
          role: 'editor', // Default to editor if we can't fetch profile
          avatar: supabaseUser.user_metadata?.avatar_url
        });
        return;
      }

      // If no profile exists yet, create a basic user object
      if (!profile) {
        console.warn('Profile not found for user:', supabaseUser.id);
        setUser({
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          name: supabaseUser.user_metadata?.full_name || 'User',
          role: 'editor',
          avatar: supabaseUser.user_metadata?.avatar_url
        });
        return;
      }

      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: profile.full_name || supabaseUser.user_metadata?.full_name || 'User',
        role: profile.role as UserRole,
        avatar: supabaseUser.user_metadata?.avatar_url
      });
    } catch (error) {
      console.error('Unexpected error fetching profile:', error);
      // Set basic user even on unexpected errors
      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: 'User',
        role: 'editor',
        avatar: undefined
      });
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const isAdmin = user?.role === 'administrator';
  const canEditImages = isAdmin;

  return (
    <AuthContext.Provider value={{ user, signOut, isLoading, canEditImages, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    return {
      user: null,
      signOut: async () => { },
      isLoading: false,
      canEditImages: false,
      isAdmin: false,
    };
  }
  return context;
}

