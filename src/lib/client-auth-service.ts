// ConstructIA - Client Authentication and Data Isolation Service
import { supabase, supabaseServiceClient } from './supabase-real';
import { getCurrentUserTenant, DEV_TENANT_ID, logAuditoria } from './supabase-real';
import type { AuthenticatedClient } from '../types';
import { ReceiptService } from './receipt-service';

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

      // STEP 0.6: Check for duplicate company name and CIF
      console.log('🔍 [ClientAuth] Checking for duplicate company name and CIF...');
      try {
        // Check for duplicate company name
        const { data: existingCompanyByName, error: nameCheckError } = await supabaseServiceClient
          .from('empresas')
          .select('id, razon_social, tenant_id')
          .ilike('razon_social', registrationData.company_name.trim())
          .limit(1)
          .maybeSingle();

        if (nameCheckError && !nameCheckError.message.includes('No rows found')) {
          console.error('❌ [ClientAuth] Error checking company name:', nameCheckError);
          throw new Error(`Error verificando nombre de empresa: ${nameCheckError.message}`);
        }

        if (existingCompanyByName) {
          console.warn('⚠️ [ClientAuth] Company name already exists:', registrationData.company_name);
          throw new Error(`❌ El nombre de empresa "${registrationData.company_name}" ya está registrado. Por favor, utiliza un nombre diferente.`);
        }

        // Check for duplicate CIF
        const { data: existingCompanyByCIF, error: cifCheckError } = await supabaseServiceClient
          .from('empresas')
          .select('id, cif, razon_social, tenant_id')
          .eq('cif', registrationData.cif_nif.toUpperCase().trim())
          .limit(1)
          .maybeSingle();

        if (cifCheckError && !cifCheckError.message.includes('No rows found')) {
          console.error('❌ [ClientAuth] Error checking CIF:', cifCheckError);
          throw new Error(`Error verificando CIF: ${cifCheckError.message}`);
        }

        if (existingCompanyByCIF) {
          console.warn('⚠️ [ClientAuth] CIF already exists:', registrationData.cif_nif);
          throw new Error(`❌ El CIF "${registrationData.cif_nif}" ya está registrado por la empresa "${existingCompanyByCIF.razon_social}". Cada empresa debe tener un CIF único.`);
        }

        console.log('✅ [ClientAuth] Company name and CIF are available for registration');
      } catch (companyCheckError) {
        if (companyCheckError instanceof Error && companyCheckError.message.includes('❌')) {
          throw companyCheckError; // Re-throw user-friendly messages
        }
        console.error('❌ [ClientAuth] Unexpected error during company validation:', companyCheckError);
        throw new Error('Error verificando datos de empresa. Inténtalo de nuevo.');
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
          if (authError?.message.includes('User already registered')) {
            console.warn('⚠️ [ClientAuth] Email already registered:', registrationData.email);
            // This is a validation error, not a system error - no rollback needed
            throw new Error('VALIDATION_ERROR: ❌ Este email ya está registrado. ¿Ya tienes una cuenta? Intenta iniciar sesión.');
          } else if (authError?.message.includes('Failed to fetch')) {
            console.error('❌ [ClientAuth] Network error during auth user creation:', authError);
            throw new Error('❌ Error de conexión: No se puede conectar al servicio de autenticación.');
          } else {
            console.error('❌ [ClientAuth] Error creating auth user:', authError);
            throw new Error(`❌ Error al crear la cuenta de usuario: ${authError?.message || 'Error desconocido'}`);
          }
        }

        createdAuthUser = authData.user;
        console.log('✅ [ClientAuth] Auth user created:', authData.user.id);

        // STEP 3: Create user profile
        // SECURITY: Role is ALWAYS 'Cliente' - SuperAdmin can only be created via authorized SQL scripts
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

        // STEP 5: Create CAE platform credentials - SAVE TO credenciales_plataforma TABLE
        console.log('📋 [ClientAuth] Step 5: Creating CAE credentials...');
        if (registrationData.cae_credentials.length > 0) {
          // CRITICAL: Save to credenciales_plataforma table (unified storage)
          const platformCredentials = registrationData.cae_credentials.map(cred => ({
            tenant_id: newTenant.id,
            platform_type: cred.platform,
            username: cred.username,
            password: cred.password,
            is_active: true,
            last_updated: new Date().toISOString()
          }));

          const { error: credentialsError } = await supabaseServiceClient
            .from('credenciales_plataforma')
            .insert(platformCredentials);

          if (credentialsError) {
            console.error('❌ [ClientAuth] Error creating platform credentials:', credentialsError);
            throw new Error(`Error al guardar las credenciales CAE: ${credentialsError.message}`);
          }

          console.log('✅ [ClientAuth] CAE credentials saved to credenciales_plataforma table:', platformCredentials.length);

          // ALSO save to adaptadores table for backward compatibility with existing integrations
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
            console.warn('⚠️ [ClientAuth] Warning: Could not save to adaptadores table (legacy):', adaptadoresError.message);
            // Don't fail registration if legacy table insert fails
          } else {
            console.log('✅ [ClientAuth] Legacy adaptadores records created for compatibility');
          }
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

        // STEP 6.5: Generate initial receipt for registration (in pending status until checkout)
        console.log('📋 [ClientAuth] Step 6.5: Generating registration receipt...');
        let registrationReceiptNumber: string | null = null;
        try {
          const receiptData = {
            client_id: clientRecord.id,
            client_name: registrationData.contact_name,
            client_email: registrationData.email,
            client_company_name: registrationData.company_name,
            client_tax_id: registrationData.cif_nif,
            client_address: `${registrationData.address}, ${registrationData.postal_code} ${registrationData.city}`,
            amount: 0, // Will be updated during checkout
            base_amount: 0,
            tax_amount: 0,
            tax_rate: 21, // IVA estándar en España
            currency: 'EUR',
            payment_method: 'Pendiente',
            gateway_name: 'Registro',
            description: 'Registro inicial en la plataforma ConstructIA',
            subscription_plan: 'Starter (Trial)',
            transaction_id: `REG-${Date.now()}-${clientRecord.id.substring(0, 8)}`,
            status: 'pending' as const,
            invoice_items: [{
              description: 'Plan Starter - Período de prueba',
              quantity: 1,
              unit_price: 0,
              total: 0
            }]
          };

          registrationReceiptNumber = await ReceiptService.createReceipt(receiptData);
          console.log('✅ [ClientAuth] Registration receipt created:', registrationReceiptNumber);

          // Update client record with receipt reference
          await supabaseServiceClient
            .from('clients')
            .update({ last_receipt_number: registrationReceiptNumber })
            .eq('id', clientRecord.id);

        } catch (receiptError) {
          console.error('⚠️ [ClientAuth] Warning: Could not create registration receipt (non-critical):', receiptError);
          // Don't fail registration if receipt creation fails - it can be generated later
        }

        // STEP 7: Create subscription record in trial status (requires checkout to activate)
        console.log('📋 [ClientAuth] Step 7: Creating trial subscription...');
        const { data: subscription, error: subscriptionError } = await supabaseServiceClient
          .from('suscripciones')
          .insert({
            tenant_id: newTenant.id,
            plan: 'Starter',
            limites: {
              max_obras: 1,
              max_trabajadores: 10,
              max_documentos: 50,
              storage_gb: 0.5
            },
            estado: 'trial'
          })
          .select()
          .single();

        if (subscriptionError) {
          console.error('❌ [ClientAuth] Error creating trial subscription:', subscriptionError);
          throw new Error(`Error al crear la suscripción de prueba: ${subscriptionError.message}`);
        }

        console.log('✅ [ClientAuth] Trial subscription created');

        // STEP 8: Log audit event
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
              marketing_consent: registrationData.accept_marketing,
              tenant_created: true,
              user_profile_created: true,
              client_record_created: true,
              subscription_created: true,
              global_admin_view: true,
              cross_tenant_action: false,
              new_client_registration: true
            },
            '127.0.0.1', // IP address - in production get from request
            navigator.userAgent,
            'success'
          );
          console.log('✅ [ClientAuth] Audit event logged');
        } catch (auditError) {
          console.warn('⚠️ [ClientAuth] Audit logging failed (non-critical):', auditError);
          // No lanzar error, el audit log es no crítico
        }

        // STEP 9: Build authenticated client object with trial status
        const authenticatedClient: AuthenticatedClient = {
          id: userProfile.id,
          client_record_id: clientRecord.id,
          tenant_id: newTenant.id,
          email: registrationData.email,
          name: registrationData.contact_name,
          role: 'Cliente',
          company_name: registrationData.company_name,
          cif_nif: registrationData.cif_nif,
          address: registrationData.address,
          postal_code: registrationData.postal_code,
          city: registrationData.city,
          phone: registrationData.phone,
          subscription_plan: 'trial',
          subscription_status: 'trial',
          storage_used: 0,
          storage_limit: 524288000, // 500MB for trial
          tokens_available: 50, // Limited tokens for trial
          obralia_credentials: {
            configured: registrationData.cae_credentials.some(c => c.platform === 'nalanda'),
            username: registrationData.cae_credentials.find(c => c.platform === 'nalanda')?.username,
            password: registrationData.cae_credentials.find(c => c.platform === 'nalanda')?.password
          }
        };

        console.log('✅ [ClientAuth] Client registration completed - TRIAL STATUS (requires checkout)');
        return authenticatedClient;

      } catch (stepError) {
        console.error('❌ [ClientAuth] Registration step failed:', stepError);
        
        // Check if this is a validation error (no rollback needed)
        if (stepError instanceof Error && stepError.message.startsWith('VALIDATION_ERROR:')) {
          const cleanMessage = stepError.message.replace('VALIDATION_ERROR: ', '');
          throw new Error(cleanMessage);
        }
        
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
            // Note: Cannot delete auth user without admin API access
            console.log('⚠️ [ClientAuth] Auth user cleanup skipped - requires admin API');
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

    } catch (error: any) {
      console.error('❌ [ClientAuth] Registration step failed:', error);
      
      // Enhanced error handling
      let userFriendlyError = '❌ Error durante el registro. Por favor, inténtalo de nuevo.';
      
      if (error?.message) {
        if (error.message.includes('❌')) {
          userFriendlyError = error.message;
        } else if (error.message.includes('Failed to fetch')) {
          userFriendlyError = '❌ Error de conexión: No se puede conectar al servidor.';
        } else if (error.message.includes('already registered') || error.message.includes('duplicate')) {
          userFriendlyError = '❌ Este email ya está registrado. ¿Ya tienes una cuenta? Intenta iniciar sesión.';
        } else {
          userFriendlyError = `❌ ${error.message}`;
        }
      }
      
      throw new Error(userFriendlyError);
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
      let { data: clientRecord, error: clientError } = await supabaseServiceClient
        .from('clients')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (clientError) {
        console.error('❌ [ClientAuth] Error fetching client record:', clientError);
        throw new Error('Error fetching client record');
      }

      if (!clientRecord) {
        console.warn('⚠️ [ClientAuth] No client record found for user:', userId, '- creating one...');
        
        // Create client record automatically
        const { data: newClientRecord, error: createClientError } = await supabaseServiceClient
          .from('clients')
          .insert({
            user_id: userId,
            client_id: `CLI-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
            company_name: empresa?.razon_social || finalUserProfile.name || 'Empresa',
            contact_name: finalUserProfile.name || 'Usuario',
            email: finalUserProfile.email,
            phone: '',
            address: empresa?.direccion || '',
            subscription_plan: 'professional',
            subscription_status: 'active',
            storage_used: 0,
            storage_limit: 1073741824,
            documents_processed: 0,
            tokens_available: 1000,
            obralia_credentials: {
              configured: false
            }
          })
          .select('id')
          .single();

        if (createClientError) {
          console.error('❌ [ClientAuth] Error creating client record:', createClientError);
          throw new Error('Error creating client record');
        }

        console.log('✅ [ClientAuth] Client record created successfully');
        
        // CRITICAL: Verify client record was created successfully
        if (!newClientRecord || !newClientRecord.id) {
          console.error('❌ [ClientAuth] Client record creation returned null or invalid data');
          throw new Error('Failed to create client record - invalid response');
        }
        
        // Update clientRecord with the newly created record
        const updatedClientRecord = { id: newClientRecord.id };
        console.log('✅ [ClientAuth] Client record verified and assigned:', updatedClientRecord.id);
        
        // CRITICAL: Ensure we have a valid client record before proceeding
        if (!updatedClientRecord || !updatedClientRecord.id) {
          console.error('❌ [ClientAuth] Client record is still null after creation attempt');
          throw new Error('Unable to create or verify client record');
        }
        
        // Use the verified client record
        clientRecord = updatedClientRecord;
      }

      // CRITICAL: Final verification that clientRecord exists before building authenticated client
      if (!clientRecord || !clientRecord.id) {
        console.error('❌ [ClientAuth] Client record is null before building authenticated client');
        console.error('❌ [ClientAuth] This should not happen - check client record creation logic');
        throw new Error('Client record not available - authentication cannot proceed');
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

      // Get client record from clients table using user_id, including suspension status
      let { data: clientRecord, error: clientError } = await supabaseServiceClient
        .from('clients')
        .select('id, subscription_status, suspension_reason')
        .eq('user_id', user.id)
        .maybeSingle();

      if (clientError) {
        console.warn('⚠️ [ClientAuth] Error fetching client record:', clientError);
        return null;
      }

      if (!clientRecord) {
        console.warn('⚠️ [ClientAuth] No client record found for user:', user.id, '- creating one...');
        
        // Create client record automatically
        const { data: newClientRecord, error: createClientError } = await supabaseServiceClient
          .from('clients')
          .insert({
            user_id: user.id,
            client_id: `CLI-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
            company_name: empresa?.razon_social || userProfile.name || 'Empresa',
            contact_name: userProfile.name || 'Usuario',
            email: userProfile.email,
            phone: '',
            address: empresa?.direccion || '',
            subscription_plan: 'professional',
            subscription_status: 'active',
            storage_used: 0,
            storage_limit: 1073741824,
            documents_processed: 0,
            tokens_available: 1000,
            obralia_credentials: {
              configured: false
            }
          })
          .select('id')
          .single();

        if (createClientError) {
          console.error('❌ [ClientAuth] Error creating client record:', createClientError);
          return null;
        }

        console.log('✅ [ClientAuth] Client record created automatically');
        
        // CRITICAL: Verify client record was created successfully
        if (!newClientRecord || !newClientRecord.id) {
          console.error('❌ [ClientAuth] Client record creation returned null or invalid data');
          return null;
        }
        
        // Update clientRecord with the newly created record
        const updatedClientRecord = {
          id: newClientRecord.id,
          subscription_status: 'active',
          suspension_reason: null
        };
        console.log('✅ [ClientAuth] Client record verified and assigned:', updatedClientRecord.id);

        // Use the verified client record
        clientRecord = updatedClientRecord;
      }

      // CRITICAL: Final verification that clientRecord exists
      if (!clientRecord || !clientRecord.id) {
        console.error('❌ [ClientAuth] Client record is null - cannot proceed');
        return null;
      }

      // Determine if account is suspended
      const isSuspended = clientRecord.subscription_status === 'suspended';

      return {
        id: userProfile.id,
        client_record_id: clientRecord.id,
        tenant_id: userProfile.tenant_id,
        email: userProfile.email,
        name: userProfile.name || 'Usuario',
        role: userProfile.role,
        company_name: empresa?.razon_social || 'Empresa',
        subscription_plan: 'professional',
        is_suspended: isSuspended,
        suspension_reason: clientRecord.suspension_reason,
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

      
      // STEP 0.5: Check if email already exists before creating tenant
      console.log('🔍 [ClientAuth] Checking if email already exists...');
      try {
        const { data: existingUser, error: checkError } = await supabaseServiceClient.auth.admin.getUserByEmail(registrationData.email);
        
        if (checkError && !checkError.message.includes('User not found')) {
          console.error('❌ [ClientAuth] Error checking existing user:', checkError);
          throw new Error(`Error verificando usuario existente: ${checkError.message}`);
        }
        
        if (existingUser && existingUser.user) {
          console.warn('⚠️ [ClientAuth] Email already registered:', registrationData.email);
          throw new Error('❌ Este email ya está registrado. ¿Ya tienes una cuenta? Intenta iniciar sesión.');
        }
        
        console.log('✅ [ClientAuth] Email is available for registration');
      } catch (emailCheckError) {
        if (emailCheckError instanceof Error && emailCheckError.message.includes('Este email ya está registrado')) {
          throw emailCheckError; // Re-throw the user-friendly message
        }
        console.error('❌ [ClientAuth] Unexpected error during email check:', emailCheckError);
        throw new Error('Error verificando disponibilidad del email. Inténtalo de nuevo.');
      }
      
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

  private static getPlanTokens(planId: string): number {
    const tokenMap: { [key: string]: number } = {
      'basic': 500,
      'professional': 2000,
      'enterprise': 10000
    };
    return tokenMap[planId] || 500;
  }

  private static getPlanStorage(planId: string): number {
    const storageMap: { [key: string]: number } = {
      'basic': 0.5,
      'professional': 5,
      'enterprise': 50
    };
    return storageMap[planId] || 0.5;
  }
}