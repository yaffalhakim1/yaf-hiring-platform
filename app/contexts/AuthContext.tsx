import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import type { AuthChangeEvent } from '@supabase/supabase-js';
import { supabaseClient } from '~/lib/supabase.client';
import type {
  User,
  LoginCredentials,
  AuthContextType,
  UserRole,
} from '../types/auth';

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = supabaseClient;

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const role = session.user.user_metadata?.role || 'applicant';
        const name =
          session.user.user_metadata?.name ||
          session.user.email?.split('@')[0] ||
          'User';

        setUser({
          id: session.user.id,
          email: session.user.email!,
          name,
          role: role as UserRole,
        });
      }

      setIsLoading(false);
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session) => {
      if (session?.user) {
        const role = session.user.user_metadata?.role || 'applicant';
        const name =
          session.user.user_metadata?.name ||
          session.user.email?.split('@')[0] ||
          'User';

        setUser({
          id: session.user.id,
          email: session.user.email!,
          name,
          role: role as UserRole,
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<User> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Email atau password salah');
        }
        throw new Error(error.message);
      }

      if (data.user) {
        const role = data.user.user_metadata?.role || 'applicant';
        const name =
          data.user.user_metadata?.name ||
          data.user.email?.split('@')[0] ||
          'User';

        return {
          id: data.user.id,
          email: data.user.email!,
          name,
          role: role as UserRole,
        };
      }

      throw new Error('Login failed');
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  // Authorization wrapper function
  const withAuth = async function <T>(
    operation: () => Promise<T>,
    requiredRole?: UserRole
  ): Promise<T> {
    if (!user) {
      throw new Error('User not authenticated');
    }

    if (requiredRole && !hasRole(requiredRole)) {
      throw new Error(`Access denied. Required role: ${requiredRole}`);
    }

    try {
      return await operation();
    } catch (error) {
      console.error('Operation failed:', error);
      throw error;
    }
  };

  // Admin-specific authorization wrapper
  const withAdminAuth = async function <T>(
    operation: () => Promise<T>
  ): Promise<T> {
    return withAuth(operation, 'admin');
  };

  // Get current user ID
  const getCurrentUserId = (): string | null => {
    return user?.id || null;
  };

  // Get auth headers for API requests
  const getAuthHeaders = async (): Promise<Record<string, string>> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error('No active session found');
    }

    return {
      Authorization: `Bearer ${session.access_token}`,
      'X-User-Role': user.role,
    };
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user,
    hasRole,
    withAuth,
    withAdminAuth,
    getCurrentUserId,
    getAuthHeaders,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
