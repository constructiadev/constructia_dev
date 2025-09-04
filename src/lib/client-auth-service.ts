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

      if (userError) {
        console.error('❌ [ClientAuth] Error fetching user profile:', userError);
        throw new Error('Error fetching user profile');
      }

      // CRITICAL SECURITY CHECK: Prevent admin users from accessing client portal
      if (userProfile && userProfile.role === 'SuperAdmin') {
        console.error('❌ [ClientAuth] SuperAdmin attempted client login - ACCESS DENIED');
        await supabase.auth.signOut(); // Force logout
        throw new Error('Access denied: Administrators cannot access the client portal');
      }

      let finalUserProfile = userProfile;

      // If user profile doesn't exist, create it automatically
      if (!userProfile) {
        console.log('⚠️ [ClientAuth] User profile not found, creating default profile...');
        
        const defaultName = authData.user.email?.split('@')[0] || 'Usuario';
        
        const { data: newProfile, error: createError } = await supabaseServiceClient
          .from('users')
          .upsert({
            id: userId,
            tenant_id: DEV_TENANT_ID,
            email: authData.user.email!,
            name: defaultName,
            role: 'ClienteAdmin',
            active: true
          }, {
            onConflict: 'tenant_id,email'
          })
          .select()
          .single();

        if (createError) {
          console.error('❌ [ClientAuth] Failed to create default profile:', createError.message);
          throw new Error('Failed to create user profile');
        }

        finalUserProfile = newProfile;
        console.log('✅ [ClientAuth] Default profile created successfully');
      }

      // Verify user has client role
      const clientRoles = ['ClienteAdmin'];
      if (!clientRoles.includes(finalUserProfile.role)) {
        console.error('❌ [ClientAuth] Invalid role for client portal:', finalUserProfile.role);
        await supabase.auth.signOut(); // Force logout for security
        throw new Error('Access denied: Invalid user role');
      }

      console.log('✅ [ClientAuth] User profile loaded:', finalUserProfile.email, 'Role:', finalUserProfile.role);

      // Step 3: Get client's empresa data (using tenant_id for isolation)
      const { data: empresa, error: empresaError } = await supabaseServiceClient
        .from('empresas')
        .select('*')
        .eq('tenant_id', finalUserProfile.tenant_id)
        .limit(1)
        .maybeSingle();

      if (empresaError) {
        console.error('❌ [ClientAuth] Error fetching empresa:', empresaError);
        // Don't throw error, just log warning and continue with default data
        console.warn('⚠️ [ClientAuth] Continuing without empresa data');
      }

      // Step 4: Build authenticated client context
      const authenticatedClient: AuthenticatedClient = {
        id: finalUserProfile.id,
        user_id: userId,
        tenant_id: finalUserProfile.tenant_id,
        email: finalUserProfile.email,
        name: finalUserProfile.name || 'Usuario',
        role: finalUserProfile.role,
        company_name: empresa?.razon_social || 'Empresa',
        subscription_plan: 'professional', // Default for development
        subscription_status: finalUserProfile.active ? 'active' : 'suspended',
        storage_used: Math.floor(Math.random() * 500000000), // Simulated for development
        storage_limit: 1073741824, // 1GB default
        tokens_available: 1000,
        obralia_credentials: {
          configured: Math.random() > 0.5, // Simulated for development
          username: empresa ? `user_${empresa.cif}` : undefined,
          password: empresa ? 'configured_password' : undefined
        }
      };

      console.log('✅ [ClientAuth] Client context created for tenant:', finalUserProfile.tenant_id);
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

      // Get user profile - check if exists first
      const { data: userProfile, error: userError } = await supabaseServiceClient
        .from('users')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (userError) {
        console.error('❌ [ClientAuth] Error fetching user profile:', userError);
        return null;
      }

      if (!userProfile) {
        console.warn('⚠️ [ClientAuth] User profile not found for user:', user.id);
        console.warn('⚠️ [ClientAuth] This user needs to be created in the users table first');
        return null;
      }

      // Verify client role
      const clientRoles = ['ClienteAdmin'];
      if (!clientRoles.includes(userProfile.role)) {
        console.log('ℹ️ [ClientAuth] Non-client role detected:', userProfile.role, '- returning null');
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

  // Create user profile for authenticated user (admin function)
  static async createUserProfile(
    userId: string,
    email: string,
    name: string,
    role: string = 'Cliente'
  ): Promise<boolean> {
    try {
      console.log('🔧 [ClientAuth] Creating user profile for:', email);

      const { data, error } = await supabaseServiceClient
        .from('users')
        .insert({
          id: userId,
          tenant_id: tenantId,
          email: email,
          name: name,
          role: role,
          active: true
        })
        .select()
        .single();

      if (error) {
        console.error('❌ [ClientAuth] Error creating user profile:', error);
        return false;
      }

      console.log('✅ [ClientAuth] User profile created successfully');
      return true;
    } catch (error) {
      console.error('❌ [ClientAuth] Error in createUserProfile:', error);
      return false;
    }
  }

  // Get all clients for a tenant (admin function)
  static async getTenantClients(tenantId: string): Promise<AuthenticatedClient[]> {
    try {
      const { data: users, error: usersError } = await supabaseServiceClient
        .from('users')
        .select('*')
        .eq('tenant_id', tenantId)
        .in('role', ['ClienteAdmin']);

      if (usersError) {
        console.error('❌ [ClientAuth] Error fetching tenant clients:', usersError);
        return [];
      }

      const clients: AuthenticatedClient[] = [];

      for (const user of users || []) {
        // Get empresa data for each user
        const { data: empresa } = await supabaseServiceClient
          .from('empresas')
          .select('*')
          .eq('tenant_id', tenantId)
          .limit(1)
          .maybeSingle();

        clients.push({
          id: user.id,
          user_id: user.id,
          tenant_id: user.tenant_id,
          email: user.email,
          name: user.name || 'Usuario',
          role: user.role,
          company_name: empresa?.razon_social || 'Empresa',
          subscription_plan: 'professional',
          subscription_status: user.active ? 'active' : 'suspended',
          storage_used: Math.floor(Math.random() * 500000000),
          storage_limit: 1073741824,
          tokens_available: 1000,
          obralia_credentials: {
            configured: Math.random() > 0.5,
            username: empresa ? `user_${empresa.cif}` : undefined,
            password: empresa ? 'configured_password' : undefined
          }
        });
      }

      return clients;
    } catch (error) {
      console.error('❌ [ClientAuth] Error getting tenant clients:', error);
      return [];
    }
  }
}