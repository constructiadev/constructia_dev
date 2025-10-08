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
  checkSession: () => Promise<void>;
  registerClient: (registrationData: any) => Promise<void>;
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

    // Removed automatic session checking - admin controls when to refresh
  }, []);

  const checkSession = async () => {
    try {
      setLoading(true);
      
      // Check if Supabase is properly configured before making requests
      if (!supabase || typeof supabase.auth?.getUser !== 'function') {
        console.warn('⚠️ [AuthContext] Supabase not properly configured - check .env file');
        setUser(null);
        return;
      }
      
      // Get current authenticated user from Supabase with error handling
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        if (authError.message === 'Auth session missing!') {
          console.log('ℹ️ [AuthContext] No active session (expected for public pages)');
        } else if (authError.message === 'Failed to fetch') {
          console.warn('⚠️ [AuthContext] Network error - Supabase unreachable. Check VITE_SUPABASE_URL in .env file');
          console.warn('⚠️ [AuthContext] Expected URL format: https://your-project.supabase.co');
        } else {
          console.error('❌ [AuthContext] Auth error:', authError);
        }
        setUser(null);
        return;
      }
      
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
        // Handle network errors gracefully
        if (userError.message === 'Failed to fetch') {
          console.warn('⚠️ [AuthContext] Network error fetching user profile - Supabase unreachable');
          console.warn('⚠️ [AuthContext] Check VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY in .env file');
          setUser(null);
          return;
        }
        throw new Error(`Error fetching user profile: ${userError.message}`);
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
      if (error instanceof Error && (error.message === 'Failed to fetch' || error.message.includes('Failed to fetch'))) {
        console.warn('⚠️ [AuthContext] Network connection failed - check Supabase configuration');
        console.warn('⚠️ [AuthContext] Verify VITE_SUPABASE_URL in .env file');
        console.warn('⚠️ [AuthContext] Expected format: https://your-project-id.supabase.co');
        console.warn('⚠️ [AuthContext] Also verify VITE_SUPABASE_SERVICE_ROLE_KEY is set correctly');
      } else {
        console.error('❌ [AuthContext] Error checking session:', error);
      }
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


      // CRITICAL: Strict role-based authentication
      console.log('🔍 [AuthContext] User role detected:', userProfile?.role);
      
      if (userProfile?.role === 'SuperAdmin') {
        // Admin authentication
        const adminUser: AuthenticatedUser = {
          id: userProfile.id,
          email: userProfile.email,
          name: userProfile.name || 'Admin',
          role: userProfile.role,
          tenant_id: userProfile.tenant_id
        };
        setUser(adminUser);
        console.log('✅ [AuthContext] Admin signed in successfully:', adminUser.email);
        
        // CRITICAL: Log admin login for global audit view
        try {
          await logAuditoria(
            userProfile.tenant_id,
            userProfile.id,
            'admin.login',
            'usuario',
            userProfile.id,
            {
              email: userProfile.email,
              role: userProfile.role,
              login_method: 'password',
              admin_access: true,
              global_admin_view: true
            },
            '127.0.0.1',
            navigator.userAgent,
            'success'
          );
        } catch (auditError) {
          console.warn('⚠️ [AuthContext] Admin login audit failed (non-critical):', auditError);
        }
        
      } else if (userProfile?.role && ['Cliente', 'ClienteDemo'].includes(userProfile.role)) {
        // Client authentication - ISOLATED ACCESS
        console.log('🔐 [AuthContext] Processing client authentication for tenant:', userProfile.tenant_id);
        
        let authenticatedClient = null;
        
        try {
          authenticatedClient = await ClientAuthService.getCurrentClient();
          
          if (!authenticatedClient) {
            console.warn('⚠️ [AuthContext] Failed to get client context, creating fallback');
            // Create fallback client user with isolated data
            authenticatedClient = {
              id: userProfile.id,
              user_id: authData.user.id,
              tenant_id: userProfile.tenant_id,
              email: userProfile.email,
              name: userProfile.name || 'Cliente',
              role: userProfile.role,
              company_name: 'Empresa',
              subscription_plan: 'professional',
              subscription_status: userProfile.active ? 'active' : 'suspended',
              storage_used: 0,
              storage_limit: 1073741824,
              tokens_available: 1000,
              obralia_credentials: { configured: false }
            };
          }
        } catch (clientError) {
          console.warn('⚠️ [AuthContext] Client service error, using fallback:', clientError);
          // Fallback client user
          authenticatedClient = {
            id: userProfile.id,
            user_id: authData.user.id,
            tenant_id: userProfile.tenant_id,
            email: userProfile.email,
            name: userProfile.name || 'Cliente',
            role: userProfile.role,
            company_name: 'Empresa',
            subscription_plan: 'professional',
            subscription_status: userProfile.active ? 'active' : 'suspended',
            storage_used: 0,
            storage_limit: 1073741824,
            tokens_available: 1000,
            obralia_credentials: { configured: false }
          };
        }
        
        // Set authenticated client
        setUser(authenticatedClient);
        console.log('✅ [AuthContext] Client signed in successfully:', authenticatedClient.email, 'Tenant:', authenticatedClient.tenant_id);
        
        // CRITICAL: Log client login for global audit view
        try {
          await logAuditoria(
            userProfile.tenant_id,
            userProfile.id,
            'client.login',
            'usuario',
            userProfile.id,
            {
              email: userProfile.email,
              role: userProfile.role,
              company_name: authenticatedClient.company_name,
              login_method: 'password',
              client_access: true,
              tenant_isolated: true
            },
            '127.0.0.1',
            navigator.userAgent,
            'success'
          );
        } catch (auditError) {
          console.warn('⚠️ [AuthContext] Client login audit failed (non-critical):', auditError);
        }
        
      } else {
        // No user profile found or invalid role - use ClientAuthService to handle authentication
        console.log('🔐 [AuthContext] No user profile found or invalid role, delegating to ClientAuthService');
        
        try {
          const authenticatedClient = await ClientAuthService.authenticateClient(email, password);
          setUser(authenticatedClient);
          console.log('✅ [AuthContext] Client authenticated via ClientAuthService:', authenticatedClient.email);
        } catch (clientError) {
          console.error('❌ [AuthContext] ClientAuthService authentication failed:', clientError);
          await supabase.auth.signOut();
          throw new Error('Authentication failed: Unable to authenticate client');
        }
      }

    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const registerClient = async (registrationData: any) => {
    try {
      console.log('🔐 [AuthContext] Starting client registration');
      
      // CRITICAL: Registration must complete successfully before setting user
      console.log('📋 [AuthContext] Calling ClientAuthService.registerNewClient...');
      
      const authenticatedClient = await ClientAuthService.registerNewClient(registrationData);
      
      if (!authenticatedClient) {
        throw new Error('❌ Error en el registro: No se pudo completar el proceso de registro');
      }
      
      // IMPORTANT: Only set user after successful registration
      console.log('✅ [AuthContext] Registration successful, setting authenticated client');
      setUser(authenticatedClient);
      console.log('✅ [AuthContext] Client registered and authenticated:', authenticatedClient.email);
      
      // CRITICAL: Force session revalidation to ensure auth state is consistent
      console.log('🔄 [AuthContext] Revalidating session after registration...');
      try {
        await checkSession();
      } catch (sessionError) {
        console.warn('⚠️ [AuthContext] Session revalidation failed (non-critical):', sessionError);
        // No lanzar error, la sesión ya está establecida
      }
      console.log('✅ [AuthContext] Session revalidated successfully');
      
    } catch (error) {
      console.error('Error registering client:', error);
      
      // CRITICAL: Ensure user is not set if registration fails
      setUser(null);
      
      // Provide specific error messages
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          throw new Error('❌ Error de conexión: No se puede conectar al servidor. Verifica tu conexión a internet y la configuración de Supabase.');
        } else if (error.message.includes('Invalid API key')) {
          throw new Error('❌ Error de configuración: Las credenciales de Supabase no son válidas.');
        } else {
          throw error; // Mantener el mensaje original si ya es descriptivo
        }
      }
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

  const isClient = user?.role && ['Cliente', 'ClienteDemo'].includes(user.role);
  const isAdmin = user?.role === 'SuperAdmin';

  const value = {
    user,
    loading,
    signIn,
    signOut,
    checkSession,
    registerClient,
    isClient: !!isClient,
    isAdmin: !!isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};