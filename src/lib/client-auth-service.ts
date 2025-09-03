// ConstructIA - Client Authentication and Data Isolation Service
import { supabase, supabaseServiceClient } from './supabase-real';
import { getCurrentUserTenant, DEV_TENANT_ID } from './supabase-real';

export interface AuthenticatedClient {
  id: string;
  user_id: string;
  tenant_id: string;
  email: string;
  name: string;
  role: string;
  company_name: string;
  subscription_plan: string;
  subscription_status: string;
  storage_used: number;
  storage_limit: number;
  tokens_available: number;
  obralia_credentials?: {
    configured: boolean;
    username?: string;
    password?: string;
  };
}

export class ClientAuthService {
  // Authenticate client and get their isolated data context
  static async authenticateClient(email: string, password: string): Promise<AuthenticatedClient | null> {
    try {
      console.log('🔐 [ClientAuth] Authenticating client:', email);

      // Step 1: Authenticate with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError || !authData.user) {
        console.error('❌ [ClientAuth] Authentication failed:', authError?.message);
        throw new Error(authError?.message || 'Authentication failed');
      }

      const userId = authData.user.id;
      console.log('✅ [ClientAuth] User authenticated:', userId);

      // Step 2: Get user profile from multi-tenant schema
      const { data: userProfile, error: userError } = await supabaseServiceClient
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (userError || !userProfile) {
        console.error('❌ [ClientAuth] User profile not found:', userError?.message);
        throw new Error('User profile not found');
      }

      // Verify user has client role
      const clientRoles = ['ClienteAdmin', 'GestorDocumental', 'SupervisorObra', 'Proveedor', 'Lector'];
      if (!clientRoles.includes(userProfile.role)) {
        console.error('❌ [ClientAuth] User does not have client role:', userProfile.role);
        throw new Error('Access denied: Invalid user role');
      }

      console.log('✅ [ClientAuth] User profile loaded:', userProfile.email, 'Role:', userProfile.role);

      // Step 3: Get client's empresa data (using tenant_id for isolation)
      const { data: empresa, error: empresaError } = await supabaseServiceClient
        .from('empresas')
        .select('*')
        .eq('tenant_id', userProfile.tenant_id)
        .limit(1)
        .maybeSingle();

      if (empresaError) {
        console.error('❌ [ClientAuth] Error fetching empresa:', empresaError);
        throw new Error('Error loading client company data');
      }

      // Step 4: Build authenticated client context
      const authenticatedClient: AuthenticatedClient = {
        id: userProfile.id,
        user_id: userId,
        tenant_id: userProfile.tenant_id,
        email: userProfile.email,
        name: userProfile.name || 'Usuario',
        role: userProfile.role,
        company_name: empresa?.razon_social || 'Empresa',
        subscription_plan: 'professional', // Default for development
        subscription_status: userProfile.active ? 'active' : 'suspended',
        storage_used: Math.floor(Math.random() * 500000000), // Simulated for development
        storage_limit: 1073741824, // 1GB default
        tokens_available: 1000,
        obralia_credentials: {
          configured: Math.random() > 0.5, // Simulated for development
          username: empresa ? `user_${empresa.cif}` : undefined,
          password: empresa ? 'configured_password' : undefined
        }
      };

      console.log('✅ [ClientAuth] Client context created for tenant:', userProfile.tenant_id);
      return authenticatedClient;

    } catch (error) {
      console.error('❌ [ClientAuth] Authentication error:', error);
      return null;
    }
  }

  // Get current authenticated client context
  static async getCurrentClient(): Promise<AuthenticatedClient | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('⚠️ [ClientAuth] No authenticated user found');
        return null;
      }

      // Get user profile
      const { data: userProfile, error: userError } = await supabaseServiceClient
        .from('users')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (userError || !userProfile) {
        console.warn('⚠️ [ClientAuth] User profile not found, creating default profile for user:', user.id);
        
        // Create a default user profile for development
        const defaultProfile = {
          id: user.id,
          tenant_id: DEV_TENANT_ID,
          email: user.email || 'unknown@example.com',
          name: user.email?.split('@')[0] || 'Usuario',
          role: 'ClienteAdmin' as const,
          active: true
        };

        // Insert the default profile
        const { data: newProfile, error: insertError } = await supabaseServiceClient
          .from('users')
          .upsert(defaultProfile, { onConflict: 'tenant_id,email' })
          .select()
          .single();

        if (insertError || !newProfile) {
          console.error('❌ [ClientAuth] Failed to create default profile:', insertError?.message);
          return null;
        }

        console.log('✅ [ClientAuth] Default profile created for user:', user.id);
        userProfile = newProfile;
      }

      // Verify client role
      const clientRoles = ['ClienteAdmin', 'GestorDocumental', 'SupervisorObra', 'Proveedor', 'Lector'];
      if (!clientRoles.includes(userProfile.role)) {
        console.error('❌ [ClientAuth] Invalid client role:', userProfile.role);
        return null;
      }

      // Get empresa data for this tenant
      const { data: empresa, error: empresaError } = await supabaseServiceClient
        .from('empresas')
        .select('*')
        .eq('tenant_id', userProfile.tenant_id)
        .limit(1)
        .maybeSingle();

      if (empresaError) {
        console.warn('⚠️ [ClientAuth] Error fetching empresa:', empresaError);
      }

      return {
        id: userProfile.id,
        user_id: user.id,
        tenant_id: userProfile.tenant_id,
        email: userProfile.email,
        name: userProfile.name || 'Usuario',
        role: userProfile.role,
        company_name: empresa?.razon_social || 'Empresa',
        subscription_plan: 'professional',
        subscription_status: userProfile.active ? 'active' : 'suspended',
        storage_used: Math.floor(Math.random() * 500000000),
        storage_limit: 1073741824,
        tokens_available: 1000,
        obralia_credentials: {
          configured: Math.random() > 0.5,
          username: empresa ? `user_${empresa.cif}` : undefined,
          password: empresa ? 'configured_password' : undefined
        }
      };

    } catch (error) {
      console.error('❌ [ClientAuth] Error getting current client:', error);
      return null;
    }
  }

  // Logout client
  static async logoutClient(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw new Error(error.message);
      }
      console.log('✅ [ClientAuth] Client logged out successfully');
    } catch (error) {
      console.error('❌ [ClientAuth] Logout error:', error);
      throw error;
    }
  }

  // Verify client has access to specific tenant data
  static async verifyTenantAccess(userId: string, tenantId: string): Promise<boolean> {
    try {
      const { data: userProfile, error } = await supabaseServiceClient
        .from('users')
        .select('tenant_id, role')
        .eq('id', userId)
        .single();

      if (error || !userProfile) {
        console.error('❌ [ClientAuth] User not found for tenant verification');
        return false;
      }

      // Check if user belongs to the requested tenant
      const hasAccess = userProfile.tenant_id === tenantId;
      
      if (!hasAccess) {
        console.error('❌ [ClientAuth] Access denied: User tenant mismatch');
      }

      return hasAccess;
    } catch (error) {
      console.error('❌ [ClientAuth] Error verifying tenant access:', error);
      return false;
    }
  }
}