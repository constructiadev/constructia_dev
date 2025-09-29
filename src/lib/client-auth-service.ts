// ConstructIA - Client Authentication and Data Isolation Service
import { supabase, supabaseServiceClient } from './supabase-real';
import { getCurrentUserTenant, DEV_TENANT_ID, logAuditoria } from './supabase-real';

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

interface ClientRegistrationData {
  // User data
  email: string;
  password: string;
  contact_name: string;
  
  // Company data
  company_name: string;
  cif_nif: string;
  address: string;
  phone: string;
  postal_code: string;
  city: string;
  
  // CAE credentials
  cae_credentials: Array<{
    platform: 'nalanda' | 'ctaima' | 'ecoordina';
    username: string;
    password: string;
  }>;
  
  // Marketing preferences
  accept_marketing: boolean;
}

export class ClientAuthService {
  // Register new client with complete setup
  static async registerNewClient(registrationData: ClientRegistrationData): Promise<AuthenticatedClient | null> {
    try {
      console.log('🔐 [ClientAuth] Starting new client registration:', registrationData.email);
      
      // STEP 0: Comprehensive Supabase validation
      if (!supabase || !supabaseServiceClient) {
        throw new Error('❌ Error de configuración: Supabase no está configurado correctamente. Contacta con el administrador del sistema.');
      }

      // Test database connectivity before starting registration
      try {
        console.log('🔌 [ClientAuth] Testing database connectivity...');
        const { data: testData, error: testError } = await supabaseServiceClient
          .from('tenants')
          .select('id')
          .limit(1);
        
        if (testError) {
          console.error('❌ [ClientAuth] Database connectivity test failed:', testError);
          if (testError.message.includes('Invalid API key')) {
            throw new Error('❌ Error de configuración: La clave de API de Supabase no es válida. Contacta con el administrador del sistema.');
          } else if (testError.message.includes('Failed to fetch')) {
            throw new Error('❌ Error de conexión: No se puede conectar a la base de datos. Verifica tu conexión a internet.');
          } else {
            throw new Error(`❌ Error de base de datos: ${testError.message}`);
          }
        }
        console.log('✅ [ClientAuth] Database connectivity verified');
      } catch (connectivityError) {
        console.error('❌ [ClientAuth] Connectivity test failed:', connectivityError);
        throw connectivityError;
      }

      // Variables para rollback en caso de error
      let createdTenant: any = null;
      let createdAuthUser: any = null;
      let createdUserProfile: any = null;
      let createdEmpresa: any = null;
      let createdClientRecord: any = null;

      try {
        // STEP 1: Create new tenant
        console.log('📋 [ClientAuth] Step 1: Creating tenant...');
        const { data: newTenant, error: tenantError } = await supabaseServiceClient
          .from('tenants')
          .insert({
            name: registrationData.company_name,
            status: 'active'
          })
          .select()
          .single();

        if (tenantError) {
          console.error('❌ [ClientAuth] Error creating tenant:', tenantError);
          throw new Error(`Error al crear el espacio del cliente: ${tenantError.message}`);
        }

        createdTenant = newTenant;
        console.log('✅ [ClientAuth] Tenant created:', newTenant.id);

        // STEP 2: Create Supabase Auth user
        console.log('📋 [ClientAuth] Step 2: Creating auth user...');
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: registrationData.email,
          password: registrationData.password,
          options: {
            emailRedirectTo: undefined // Disable email confirmation for development
          }
        });

        if (authError || !authData.user) {
          console.error('❌ [ClientAuth] Error creating auth user:', authError);
          if (authError?.message.includes('User already registered')) {
            throw new Error('❌ Este email ya está registrado. ¿Ya tienes una cuenta? Intenta iniciar sesión.');
          } else if (authError?.message.includes('Failed to fetch')) {
            throw new Error('❌ Error de conexión: No se puede conectar al servicio de autenticación.');
          } else {
            throw new Error(`❌ Error al crear la cuenta de usuario: ${authError?.message || 'Error desconocido'}`);
          }
        }

        createdAuthUser = authData.user;
        console.log('✅ [ClientAuth] Auth user created:', authData.user.id);

        // STEP 3: Create user profile
        console.log('📋 [ClientAuth] Step 3: Creating user profile...');
        const { data: userProfile, error: userError } = await supabaseServiceClient
          .from('users')
          .insert({
            id: authData.user.id,
            tenant_id: newTenant.id,
            email: registrationData.email,
            name: registrationData.contact_name,
            role: 'Cliente',
            active: true
          })
          .select()
          .single();

        if (userError) {
          console.error('❌ [ClientAuth] Error creating user profile:', userError);
          throw new Error(`Error al crear el perfil de usuario: ${userError.message}`);
        }

        createdUserProfile = userProfile;
        console.log('✅ [ClientAuth] User profile created');

        // STEP 4: Create empresa (company)
        console.log('📋 [ClientAuth] Step 4: Creating empresa...');
        const { data: empresa, error: empresaError } = await supabaseServiceClient
          .from('empresas')
          .insert({
            tenant_id: newTenant.id,
            razon_social: registrationData.company_name,
            cif: registrationData.cif_nif,
            direccion: `${registrationData.address}, ${registrationData.postal_code} ${registrationData.city}`,
            contacto_email: registrationData.email,
            estado_compliance: 'pendiente'
          })
          .select()
          .single();

        if (empresaError) {
          console.error('❌ [ClientAuth] Error creating empresa:', empresaError);
          throw new Error(`Error al crear la empresa: ${empresaError.message}`);
        }

        createdEmpresa = empresa;
        console.log('✅ [ClientAuth] Empresa created');

        // STEP 5: Create CAE platform credentials (adaptadores) - ALWAYS IN DATABASE
        console.log('📋 [ClientAuth] Step 5: Creating CAE credentials...');
        if (registrationData.cae_credentials.length > 0) {
          const adaptadores = registrationData.cae_credentials.map(cred => ({
            tenant_id: newTenant.id,
            plataforma: cred.platform,
            alias: 'Principal',
            credenciales: {
              username: cred.username,
              password: cred.password,
              configured: true
            },
            estado: 'ready'
          }));

          const { error: adaptadoresError } = await supabaseServiceClient
            .from('adaptadores')
            .insert(adaptadores);

          if (adaptadoresError) {
            console.error('❌ [ClientAuth] Error creating adaptadores:', adaptadoresError);
            throw new Error(`Error al guardar las credenciales CAE: ${adaptadoresError.message}`);
          }
          
          console.log('✅ [ClientAuth] CAE credentials saved in database');
        }

        // STEP 6: Create client record in old schema for compatibility
        console.log('📋 [ClientAuth] Step 6: Creating client record...');
        const { data: clientRecord, error: clientError } = await supabaseServiceClient
          .from('clients')
          .insert({
            user_id: authData.user.id,
            client_id: `CLI-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
            company_name: registrationData.company_name,
            contact_name: registrationData.contact_name,
            email: registrationData.email,
            phone: registrationData.phone,
            address: `${registrationData.address}, ${registrationData.postal_code} ${registrationData.city}`,
            subscription_plan: 'basic',
            subscription_status: 'active',
            storage_used: 0,
            storage_limit: 524288000, // 500MB for basic plan
            documents_processed: 0,
            tokens_available: 500,
            obralia_credentials: {
              configured: registrationData.cae_credentials.some(c => c.platform === 'nalanda'),
              username: registrationData.cae_credentials.find(c => c.platform === 'nalanda')?.username,
              password: registrationData.cae_credentials.find(c => c.platform === 'nalanda')?.password
            }
          })
          .select()
          .single();

        if (clientError) {
          console.error('❌ [ClientAuth] Error creating client record:', clientError);
          throw new Error(`Error al crear el registro de cliente: ${clientError.message}`);
        }

        createdClientRecord = clientRecord;
        console.log('✅ [ClientAuth] Client record created');

        // STEP 7: Log audit event
        console.log('📋 [ClientAuth] Step 7: Logging audit event...');
        try {
          await logAuditoria(
            newTenant.id,
            authData.user.id,
            'client.registered',
            'empresa',
            empresa.id,
            {
              company_name: registrationData.company_name,
              cif_nif: registrationData.cif_nif,
              platforms_configured: registrationData.cae_credentials.length,
              marketing_consent: registrationData.accept_marketing
            }
          );
          console.log('✅ [ClientAuth] Audit event logged');
        } catch (auditError) {
          console.warn('⚠️ [ClientAuth] Audit logging failed (non-critical):', auditError);
          // No lanzar error, el audit log es no crítico
        }

        // STEP 8: Build authenticated client object
        const authenticatedClient: AuthenticatedClient = {
          id: userProfile.id,
          client_record_id: clientRecord.id,
          tenant_id: newTenant.id,
          email: registrationData.email,
          name: registrationData.contact_name,
          role: 'Cliente',
          company_name: registrationData.company_name,
          subscription_plan: 'basic',
          subscription_status: 'active',
          storage_used: 0,
          storage_limit: 524288000,
          tokens_available: 500,
          obralia_credentials: {
            configured: registrationData.cae_credentials.some(c => c.platform === 'nalanda'),
            username: registrationData.cae_credentials.find(c => c.platform === 'nalanda')?.username,
            password: registrationData.cae_credentials.find(c => c.platform === 'nalanda')?.password
          }
        };

        console.log('✅ [ClientAuth] Client registration completed successfully');
        return authenticatedClient;

      } catch (stepError) {
        console.error('❌ [ClientAuth] Registration step failed:', stepError);
        
        // ROLLBACK LOGIC: Intentar limpiar datos creados
        console.log('🔄 [ClientAuth] Iniciando proceso de rollback...');
        
        try {
          // Rollback en orden inverso
          if (createdClientRecord) {
            console.log('🔄 [ClientAuth] Rollback: Eliminando client record...');
            await supabaseServiceClient.from('clients').delete().eq('id', createdClientRecord.id);
          }
          
          if (createdEmpresa) {
            console.log('🔄 [ClientAuth] Rollback: Eliminando empresa...');
            await supabaseServiceClient.from('empresas').delete().eq('id', createdEmpresa.id);
          }
          
          if (createdUserProfile) {
            console.log('🔄 [ClientAuth] Rollback: Eliminando user profile...');
            await supabaseServiceClient.from('users').delete().eq('id', createdUserProfile.id);
          }
          
          if (createdAuthUser) {
            console.log('🔄 [ClientAuth] Rollback: Eliminando auth user...');
            await supabase.auth.admin.deleteUser(createdAuthUser.id);
          }
          
          if (createdTenant) {
            console.log('🔄 [ClientAuth] Rollback: Eliminando tenant...');
            await supabaseServiceClient.from('tenants').delete().eq('id', createdTenant.id);
          }
          
          console.log('✅ [ClientAuth] Rollback completado exitosamente');
        } catch (rollbackError) {
          console.error('❌ [ClientAuth] Error durante rollback:', rollbackError);
          console.error('⚠️ [ClientAuth] ATENCIÓN: Pueden quedar datos inconsistentes en la base de datos');
        }
        
        // Lanzar error original con mensaje amigable
        if (stepError instanceof Error) {
          throw new Error(`Error en el registro: ${stepError.message}. Se ha intentado revertir los cambios.`);
        } else {
          throw new Error('Error desconocido durante el registro. Se ha intentado revertir los cambios.');
        }
      }

    } catch (error) {
      console.error('❌ [ClientAuth] Registration error:', error);
      throw error;
    }
  }

  // Authenticate client and get their isolated data context
  static async authenticateClient(email: string, password: string): Promise<AuthenticatedClient | null> {
    try {
      console.log('🔐 [ClientAuth] Authenticating client:', email);

      // Check if Supabase is properly configured before making requests
      if (!supabase || typeof supabase.auth?.signInWithPassword !== 'function') {
        throw new Error('Supabase not properly configured. Check environment variables.');
      }

      // Step 1: Authenticate with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError || !authData.user) {
        console.error('❌ [ClientAuth] Authentication failed:', authError?.message);
        if (authError?.message === 'Failed to fetch') {
          throw new Error('Network error: Cannot connect to Supabase. Check VITE_SUPABASE_URL in .env file.');
        }
        throw new Error(authError?.message || 'Authentication failed');
      }

      const userId = authData.user.id;
      console.log('✅ [ClientAuth] User authenticated:', userId);

      // Step 2: Get user profile from multi-tenant schema
      let { data: userProfile, error: userError } = await supabaseServiceClient
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

      // CRITICAL SECURITY CHECK: Only allow Cliente and ClienteDemo roles
      if (userProfile && !['Cliente', 'ClienteDemo'].includes(userProfile.role)) {
        console.error('❌ [ClientAuth] Invalid role attempted client login - ACCESS DENIED:', userProfile.role);
        await supabase.auth.signOut(); // Force logout
        throw new Error(`Access denied: Role ${userProfile.role} cannot access the client portal`);
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
            role: 'Cliente',
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
      const clientRoles = ['Cliente', 'ClienteDemo'];
      if (!clientRoles.includes(finalUserProfile.role)) {
        console.error('❌ [ClientAuth] Invalid role for client portal:', finalUserProfile.role);
        await supabase.auth.signOut(); // Force logout for security
        throw new Error('Access denied: Invalid user role');
      }

      console.log('✅ [ClientAuth] User profile loaded:', finalUserProfile.email, 'Role:', finalUserProfile.role);

      // Step 3: Get client record from clients table using user_id
      const { data: clientRecord, error: clientError } = await supabaseServiceClient
        .from('clients')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (clientError) {
        console.error('❌ [ClientAuth] Error fetching client record:', clientError);
        throw new Error('Error fetching client record');
      }

      if (!clientRecord) {
        console.error('❌ [ClientAuth] No client record found for user:', userId);
        throw new Error('Client record not found');
      }

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
        client_record_id: clientRecord.id,
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
      // Check if Supabase is properly configured before making requests
      if (!supabase || typeof supabase.auth?.getUser !== 'function') {
        console.warn('⚠️ [ClientAuth] Supabase not properly configured - using fallback');
        return null;
      }

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        if (authError.message === 'Failed to fetch') {
          console.warn('⚠️ [ClientAuth] Network error - Supabase unreachable. Check VITE_SUPABASE_URL in .env');
        } else {
          console.error('❌ [ClientAuth] Auth error:', authError);
        }
        return null;
      }
      
      if (!user) {
        console.log('⚠️ [ClientAuth] No authenticated user found');
        return null;
      }

      // Get user profile - check if exists first
      let { data: userProfile, error: userError } = await supabaseServiceClient
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
        console.warn('⚠️ [ClientAuth] Creating default user profile...');
        
        // Create default user profile automatically
        const defaultName = user.email?.split('@')[0] || 'Usuario';
        
        const { data: newProfile, error: createError } = await supabaseServiceClient
          .from('users')
          .insert({
            id: user.id,
            tenant_id: DEV_TENANT_ID,
            email: user.email!,
            name: defaultName,
            role: 'Cliente',
            active: true
          })
          .select()
          .single();

        if (createError) {
          console.error('❌ [ClientAuth] Failed to create default profile:', createError.message);
          return null;
        }

        userProfile = newProfile;
        console.log('✅ [ClientAuth] Default profile created successfully');
      }

      // Verify client role
      const clientRoles = ['Cliente', 'ClienteDemo'];
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

      // Get client record from clients table using user_id
      const { data: clientRecord, error: clientError } = await supabaseServiceClient
        .from('clients')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (clientError) {
        console.warn('⚠️ [ClientAuth] Error fetching client record:', clientError);
        return null;
      }

      if (!clientRecord) {
        console.warn('⚠️ [ClientAuth] No client record found for user:', user.id);
        return null;
      }

      return {
        id: userProfile.id,
        client_record_id: clientRecord.id,
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
          role: role === 'ClienteAdmin' ? 'Cliente' : role, // Convert any remaining ClienteAdmin to Cliente
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
        .in('role', ['Cliente', 'ClienteDemo']);

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
          client_record_id: user.id, // This would need to be updated with actual client record lookup
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