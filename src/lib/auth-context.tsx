import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ClientAuthService, type AuthenticatedClient } from './client-auth-service';
import { supabase, supabaseServiceClient } from './supabase-real';

interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: string;
  tenant_id: string;
}

interface AuthContextType {
  user: AuthenticatedUser | AuthenticatedClient | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isClient: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthenticatedUser | AuthenticatedClient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    checkSession();

    // Check session periodically for development
    const interval = setInterval(checkSession, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const checkSession = async () => {
    try {
      setLoading(true);
      
      // Get current authenticated user from Supabase
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        console.log('⚠️ [AuthContext] No authenticated user found');
        setUser(null);
        return;
      }

      // Get user profile from database
      const { data: userProfile, error: userError } = await supabaseServiceClient
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (userError) {
        console.error('❌ [AuthContext] Error fetching user profile:', userError);
        setUser(null);
        return;
      }

      if (!userProfile) {
        console.warn('⚠️ [AuthContext] User profile not found');
        setUser(null);
        return;
      }

      // If user is SuperAdmin, create admin user object
      if (userProfile.role === 'SuperAdmin') {
        const adminUser: AuthenticatedUser = {
          id: userProfile.id,
          email: userProfile.email,
          name: userProfile.name || 'Admin',
          role: userProfile.role,
          tenant_id: userProfile.tenant_id
        };
        setUser(adminUser);
        console.log('✅ [AuthContext] Admin session verified:', adminUser.email);
      } else {
        // For client roles, use ClientAuthService
        const currentClient = await ClientAuthService.getCurrentClient();
        setUser(currentClient);
        
        if (currentClient) {
          console.log('✅ [AuthContext] Client session verified:', currentClient.email);
        } else {
          console.log('⚠️ [AuthContext] No active client session');
        }
      }
      
    } catch (error) {
      console.error('Error checking session:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 [AuthContext] Attempting client sign in:', email);
      
      // First authenticate with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError || !authData.user) {
        throw new Error(authError?.message || 'Authentication failed');
      }

      // Get user profile to determine role
      const { data: userProfile, error: userError } = await supabaseServiceClient
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .maybeSingle();

      if (userError) {
        throw new Error('Error fetching user profile');
      }

      if (!userProfile) {
        throw new Error('User profile not found');
      }

      // Handle based on role
      if (userProfile.role === 'SuperAdmin') {
        const adminUser: AuthenticatedUser = {
          id: userProfile.id,
          email: userProfile.email,
          name: userProfile.name || 'Admin',
          role: userProfile.role,
          tenant_id: userProfile.tenant_id
        };
        setUser(adminUser);
        console.log('✅ [AuthContext] Admin signed in successfully:', adminUser.email);
      } else {
        // For client roles, get full client context
        const authenticatedClient = await ClientAuthService.getCurrentClient();
        if (!authenticatedClient) {
          throw new Error('Failed to get client context');
        }
        setUser(authenticatedClient);
        console.log('✅ [AuthContext] Client signed in successfully:', authenticatedClient.email);
      }

    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      console.log('✅ [AuthContext] User signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const isClient = user?.role && ['Cliente', 'ClienteDemo', 'GestorDocumental', 'SupervisorObra', 'Proveedor', 'Lector'].includes(user.role);
  const isAdmin = user?.role === 'SuperAdmin';

  const value = {
    user,
    loading,
    signIn,
    signOut,
    isClient: !!isClient,
    isAdmin: !!isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};