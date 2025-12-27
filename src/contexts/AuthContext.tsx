import { createContext, useContext, useState, ReactNode, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../utils/supabase/client';
import { User as SupabaseUser, Session, AuthChangeEvent } from '@supabase/supabase-js';

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
  canEditImages: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Ref for cleanup protection
  const mounted = useRef(true);

  const fetchUserProfile = useCallback(async (supabaseUser: SupabaseUser): Promise<User> => {
    console.log('fetchUserProfile: called for', supabaseUser.email);
    try {
      // 5 second timeout for profile fetch
      const profilePromise = supabase
        .rpc('get_my_profile')
        .maybeSingle();

      const timeoutPromise = new Promise<{ data: any; error: any }>((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000);
      });

      // Use a wrapper to catch the timeout error locally so we can fallback
      let data, error;
      try {
        const result = await Promise.race([profilePromise, timeoutPromise]);
        // result is from maybeSingle(), so it has { data, error } structure if it's the rpc call
        // IF it's the timeout, it throws.
        // Wait, supabase promise returns { data, error, count, status, statusText }
        // We need to be careful with types here.
        // Let's coerce the result.
        // Actually simplest way is just:
        const { data: profileData, error: profileError } = result as any;
        data = profileData;
        error = profileError;
      } catch (err) {
        console.error('fetchUserProfile: timeout or error', err);
        error = err;
      }

      console.log('fetchUserProfile: RPC result', { data, error });

      if (error || !data) {
        console.warn('fetchUserProfile: RPC failed or no profile, using default');
        return {
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          name: supabaseUser.user_metadata?.full_name || 'User',
          role: 'editor',
          avatar: supabaseUser.user_metadata?.avatar_url
        };
      }

      return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: data.full_name || supabaseUser.user_metadata?.full_name || 'User',
        role: data.role as UserRole,
        avatar: supabaseUser.user_metadata?.avatar_url
      };
    } catch (e) {
      console.error('fetchUserProfile: unexpected error', e);
      return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: 'User',
        role: 'editor',
        avatar: undefined
      };
    }
  }, []);

  const handleAuthChange = useCallback(async (event: AuthChangeEvent, session: Session | null) => {
    console.log('handleAuthChange:', event, session?.user?.email);

    if (session?.user) {
      // If we already have the user and it matches the session user, don't refetch
      // This prevents loops if onAuthStateChange fires repeatedly
      // However, we need to be careful. The user object in state might be stale or detailed.
      // Let's just fetch for now but ensure we handle loading state better.
      const userProfile = await fetchUserProfile(session.user);
      if (mounted.current) {
        setUser(userProfile);
        setIsLoading(false);
      }
    } else {
      if (mounted.current) {
        setUser(null);
        setIsLoading(false);
      }
    }
  }, [fetchUserProfile]);

  useEffect(() => {
    mounted.current = true;
    console.log('AuthProvider: Initializing...');

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('AuthProvider: Error getting session', error);
        if (mounted.current) setIsLoading(false);
        return;
      }

      console.log('AuthProvider: Initial session:', session?.user?.email);
      if (session?.user) {
        fetchUserProfile(session.user).then((userProfile) => {
          if (mounted.current) {
            setUser(userProfile);
            setIsLoading(false);
          }
        });
      } else {
        if (mounted.current) {
          setIsLoading(false);
        }
      }
    });

    // Subscribe to changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // onAuthStateChange is often called immediately with the current session
      // We need to avoid double-setting state if getSession is already running.
      // But typically relying on this solely is safer than mixing both without coordination.
      // However, getSession is better for the *initial* load to avoid a "flash" of logged out state.
      // The logic above handles getSession. handleAuthChange handles subsequent updates.
      // We might want to debounce or check if we are already loading.

      // Let's rely on handleAuthChange for *updates* but we need to match it with the initial load.
      // Actually, onAuthStateChange fires "INITIAL_SESSION" event now in newer libraries, 
      // but let's stick to the standard pattern:
      // 1. getSession() for initial state.
      // 2. onAuthStateChange() for updates.
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // handleAuthChange calls fetchUserProfile and sets loading false
        handleAuthChange(event, session);
      } else if (event === 'SIGNED_OUT') {
        handleAuthChange(event, null);
      }
      // IGNORE INITIAL_SESSION event if it exists to avoid race with getSession above, 
      // OR remove getSession block and rely solely on this? 
      // Reliability wise, keeping them separate is often tricky. 
      // But let's stick to the plan: if we are loading, we wait for the first valid result.
    });

    return () => {
      mounted.current = false;
      subscription.unsubscribe();
    };
  }, [handleAuthChange, fetchUserProfile]);

  const signOut = useCallback(async () => {
    console.log('signOut: called');
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('signOut error:', e);
    }
    if (mounted.current) {
      setUser(null);
    }
  }, []);

  const isAdmin = user?.role === 'administrator';
  const canEditImages = isAdmin;

  console.log('AuthProvider render: user=', user?.email, 'isLoading=', isLoading);

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
