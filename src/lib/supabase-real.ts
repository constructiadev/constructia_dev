import { createClient } from '@supabase/supabase-js';
import { getEnvVar } from '../utils/env';

// Validate environment variables with detailed logging
const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');
const supabaseServiceKey = getEnvVar('VITE_SUPABASE_SERVICE_ROLE_KEY');

// Debug logging for environment variables
console.log('🔧 [Supabase] Environment variables check:');
console.log('   VITE_SUPABASE_URL:', supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'MISSING');
console.log('   VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'MISSING');
console.log('   VITE_SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? `${supabaseServiceKey.substring(0, 20)}...` : 'MISSING');

// Additional debugging for connection issues
if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.error('❌ [Supabase] CONFIGURACIÓN INCOMPLETA DETECTADA');
  console.error('📋 [Supabase] Pasos para solucionar:');
  console.error('   1. Verifica que el archivo .env existe en la raíz del proyecto');
  console.error('   2. Verifica que las variables estén correctamente escritas (sin espacios extra)');
  console.error('   3. REINICIA el servidor de desarrollo (Ctrl+C → npm run dev)');
  console.error('   4. Ve al módulo Database > Diagnóstico para más ayuda');
}

// Validate URL format if provided
if (supabaseUrl && !supabaseUrl.startsWith('https://')) {
  console.error('❌ [Supabase] Invalid URL format. Expected: https://your-project.supabase.co');
  console.error('   Current value:', supabaseUrl);
} else if (supabaseUrl && !supabaseUrl.includes('.supabase.co')) {
  console.error('❌ [Supabase] URL should contain .supabase.co domain');
  console.error('   Current value:', supabaseUrl);
  console.error('   Expected format: https://your-project-id.supabase.co');
}

// Log configuration status for debugging
console.log('🔧 [Supabase] Configuration check:');
console.log('   VITE_SUPABASE_URL:', supabaseUrl ? '✅ SET' : '❌ MISSING');
console.log('   VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ SET' : '❌ MISSING');
console.log('   VITE_SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ SET' : '❌ MISSING');

// Validate environment variables with detailed error messages
if (!supabaseUrl) {
  console.error('❌ VITE_SUPABASE_URL is not configured in .env file');
  console.error('Please add: VITE_SUPABASE_URL=https://your-project.supabase.co');
  console.error('Expected format: https://[project-id].supabase.co');
}
if (!supabaseAnonKey) {
  console.error('❌ VITE_SUPABASE_ANON_KEY is not configured in .env file');
  console.error('Please add: VITE_SUPABASE_ANON_KEY=your-anon-key');
  console.error('Find this key in: Supabase Dashboard > Settings > API');
}
if (!supabaseServiceKey) {
  console.error('❌ VITE_SUPABASE_SERVICE_ROLE_KEY is not configured in .env file');
  console.error('Please add: VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
  console.error('Find this key in: Supabase Dashboard > Settings > API');
  console.error('⚠️ WARNING: Service role key is required for admin functions');
}

// Check if all required environment variables are present
const isSupabaseConfigured = supabaseUrl && 
  supabaseUrl.startsWith('https://') && 
  supabaseUrl.includes('.supabase.co') &&
  supabaseAnonKey && 
  supabaseServiceKey;

// Log configuration status
if (!isSupabaseConfigured) {
  console.error('❌ [Supabase] CONFIGURACIÓN INCOMPLETA');
  console.error('🔧 [Supabase] SOLUCIÓN PASO A PASO:');
  console.error('   1. ✅ Archivo .env ya existe');
  console.error('   2. 🔧 Ve a https://supabase.com/dashboard');
  console.error('   3. 📋 Selecciona tu proyecto → Settings → API');
  console.error('   4. 📝 Copia URL, anon key y service role key');
  console.error('   5. 💾 Actualiza el archivo .env con las credenciales reales');
  console.error('   6. 🔄 REINICIA el servidor (Ctrl+C → npm run dev)');
  console.error('   7. 🔍 Ve a Admin → Database → Diagnóstico para verificar');
  console.error('');
  console.error('⚠️ [Supabase] IMPORTANTE: Las variables solo se cargan al INICIAR el servidor');
  console.error('   Si modificaste .env, DEBES reiniciar el servidor para que surta efecto');
} else {
  console.log('✅ [Supabase] Configuration appears valid, testing connection...');
}

// Create a safe dummy client that prevents network requests
const createDummyClient = () => {
  const dummyError = { 
    message: 'Supabase not configured - check .env file',
    details: 'Please verify VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, and VITE_SUPABASE_SERVICE_ROLE_KEY are set correctly'
  };
  
  return {
    auth: {
      getUser: () => {
        console.warn('⚠️ [Supabase] No configurado - revisa .env y reinicia servidor');
        return Promise.resolve({ 
          data: { user: null }, 
          error: { 
            message: 'Supabase not configured - check .env file and restart server',
            details: 'Variables de entorno faltantes o servidor no reiniciado'
          }
        });
      },
      getSession: () => {
        console.warn('⚠️ [Supabase] No configurado - revisa .env y reinicia servidor');
        return Promise.resolve({ 
          data: { session: null }, 
          error: {
            message: 'Supabase not configured - check .env file and restart server',
            details: 'Variables de entorno faltantes o servidor no reiniciado'
          }
        });
      },
      signInWithPassword: () => {
        console.error('❌ [Supabase] No se puede iniciar sesión - configuración incompleta');
        console.error('🔧 [Supabase] Solución: Configura .env y reinicia servidor');
        return Promise.resolve({
          data: { user: null, session: null },
          error: {
            ...dummyError,
            message: 'Cannot sign in - Supabase not configured. Check .env file and restart server.'
          }
        });
      },
      signUp: () => {
        console.error('❌ [Supabase] No se puede registrar - configuración incompleta');
        console.error('🔧 [Supabase] Solución: Configura .env y reinicia servidor');
        return Promise.resolve({
          data: { user: null, session: null },
          error: {
            ...dummyError,
            message: 'Cannot sign up - Supabase not configured. Check .env file and restart server.'
          }
        });
      },
      signOut: () => {
        console.warn('⚠️ [Supabase] Mock sign out - configuración incompleta');
        return Promise.resolve({ error: null });
      },
      onAuthStateChange: (callback) => {
        console.warn('⚠️ [Supabase] Mock auth state change - configuración incompleta');
        // Call callback immediately with null session to prevent waiting
        setTimeout(() => callback('SIGNED_OUT', null), 0);
        return { 
          data: { 
            subscription: { 
              unsubscribe: () => console.warn('⚠️ Mock auth subscription unsubscribed') 
            } 
          } 
        };
      }
    },
    from: (table) => ({
      select: (columns) => {
        console.error(`❌ [Supabase] No se puede consultar ${table} - configuración incompleta`);
        console.error('🔧 [Supabase] Ve a Admin → Database → Diagnóstico para solucionar');
        return {
          data: [],
          error: {
            ...dummyError,
            message: `Cannot query ${table} - Supabase not configured. Check .env file and restart server.`
          },
          eq: function(column, value) { return this; },
          neq: function(column, value) { return this; },
          gt: function(column, value) { return this; },
          gte: function(column, value) { return this; },
          lt: function(column, value) { return this; },
          lte: function(column, value) { return this; },
          like: function(column, pattern) { return this; },
          ilike: function(column, pattern) { return this; },
          is: function(column, value) { return this; },
          in: function(column, values) { return this; },
          contains: function(column, value) { return this; },
          containedBy: function(column, value) { return this; },
          rangeGt: function(column, range) { return this; },
          rangeGte: function(column, range) { return this; },
          rangeLt: function(column, range) { return this; },
          rangeLte: function(column, range) { return this; },
          rangeAdjacent: function(column, range) { return this; },
          overlaps: function(column, value) { return this; },
          textSearch: function(column, query) { return this; },
          match: function(query) { return this; },
          not: function(column, operator, value) { return this; },
          or: function(filters) { return this; },
          filter: function(column, operator, value) { return this; },
          order: function(column, options) { return this; },
          limit: function(count) { return this; },
          range: function(from, to) { return this; },
          single: function() { 
            console.error(`❌ [Supabase] No se puede ejecutar consulta en ${table} - configuración incompleta`);
            return Promise.resolve({
              data: null,
              error: {
                ...dummyError,
                message: `Cannot query ${table} - Supabase not configured. Check .env file and restart server.`
              }
            });
          },
          maybeSingle: function() { 
            console.error(`❌ [Supabase] No se puede ejecutar consulta en ${table} - configuración incompleta`);
            return Promise.resolve({
              data: null,
              error: {
                ...dummyError,
                message: `Cannot query ${table} - Supabase not configured. Check .env file and restart server.`
              }
            });
          }
        };
      },
      insert: (data) => {
        console.error(`❌ [Supabase] No se puede insertar en ${table} - configuración incompleta`);
        return {
          data: null,
          error: {
            ...dummyError,
            message: `Cannot insert into ${table} - Supabase not configured. Check .env file and restart server.`
          },
          select: function() { return this; },
          single: function() { 
            return Promise.resolve({
              data: null,
              error: {
                ...dummyError,
                message: `Cannot insert into ${table} - Supabase not configured.`
              }
            });
          },
          maybeSingle: function() { 
            return Promise.resolve({
              data: null,
              error: {
                ...dummyError,
                message: `Cannot insert into ${table} - Supabase not configured.`
              }
            });
          }
        };
      },
      update: (data) => {
        console.error(`❌ [Supabase] No se puede actualizar ${table} - configuración incompleta`);
        return {
          data: null,
          error: {
            ...dummyError,
            message: `Cannot update ${table} - Supabase not configured. Check .env file and restart server.`
          },
          eq: function(column, value) { return this; },
          select: function() { return this; },
          single: function() { 
            return Promise.resolve({
              data: null,
              error: {
                ...dummyError,
                message: `Cannot update ${table} - Supabase not configured.`
              }
            });
          }
        };
      },
      delete: () => {
        console.error(`❌ [Supabase] No se puede eliminar de ${table} - configuración incompleta`);
        return {
          data: null,
          error: {
            ...dummyError,
            message: `Cannot delete from ${table} - Supabase not configured. Check .env file and restart server.`
          },
          eq: function(column, value) { return this; }
        };
      },
      upsert: (data) => {
        console.error(`❌ [Supabase] No se puede hacer upsert en ${table} - configuración incompleta`);
        return {
          data: null,
          error: {
            ...dummyError,
            message: `Cannot upsert into ${table} - Supabase not configured. Check .env file and restart server.`
          },
          select: function() { return this; },
          single: function() { 
            return Promise.resolve({
              data: null,
              error: {
                ...dummyError,
                message: `Cannot upsert into ${table} - Supabase not configured.`
              }
            });
          }
        };
      },
      count: function() { 
        return Promise.resolve({ 
          count: 0, 
          error: {
            ...dummyError,
            message: 'Cannot count - Supabase not configured. Check .env file and restart server.'
          }
        });
      }
    }),
    storage: {
      from: (bucket) => ({
        upload: (path, file, options) => {
          console.error(`❌ [Supabase] No se puede subir a ${bucket} - configuración incompleta`);
          return Promise.resolve({
            data: null,
            error: {
              ...dummyError,
              message: `Cannot upload to ${bucket} - Supabase not configured. Check .env file and restart server.`
            }
          });
        },
        download: (path) => {
          console.error(`❌ [Supabase] No se puede descargar de ${bucket} - configuración incompleta`);
          return Promise.resolve({
            data: null,
            error: {
              ...dummyError,
              message: `Cannot download from ${bucket} - Supabase not configured.`
            }
          });
        },
        createSignedUrl: (path, expiresIn) => {
          console.error(`❌ [Supabase] No se puede crear URL firmada para ${bucket} - configuración incompleta`);
          return Promise.resolve({
            data: null,
            error: {
              ...dummyError,
              message: `Cannot create signed URL for ${bucket} - Supabase not configured.`
            }
          });
        },
        getPublicUrl: (path) => {
          console.error(`❌ [Supabase] No se puede obtener URL pública para ${bucket} - configuración incompleta`);
          return {
            data: { publicUrl: '' },
            error: {
              ...dummyError,
              message: `Cannot get public URL for ${bucket} - Supabase not configured.`
            }
          };
        },
        list: (path, options) => {
          console.error(`❌ [Supabase] No se puede listar ${bucket} - configuración incompleta`);
          return Promise.resolve({
            data: [],
            error: {
              ...dummyError,
              message: `Cannot list ${bucket} - Supabase not configured.`
            }
          });
        },
        remove: (paths) => {
          console.error(`❌ [Supabase] No se puede eliminar de ${bucket} - configuración incompleta`);
          return Promise.resolve({
            data: null,
            error: {
              ...dummyError,
              message: `Cannot remove from ${bucket} - Supabase not configured.`
            }
          });
        }
      }),
      listBuckets: () => {
        console.error(`❌ [Supabase] No se puede listar buckets - configuración incompleta`);
        return Promise.resolve({
          data: [],
          error: {
            ...dummyError,
            message: 'Cannot list buckets - Supabase not configured. Check .env file and restart server.'
          }
        });
      },
      createBucket: (id, options) => {
        console.error(`❌ [Supabase] No se puede crear bucket - configuración incompleta`);
        return Promise.resolve({
          data: null,
          error: {
            ...dummyError,
            message: 'Cannot create bucket - Supabase not configured. Check .env file and restart server.'
          }
        });
      }
    },
    channel: (name) => ({
      on: (event, filter, callback) => ({
        subscribe: () => {
          console.warn(`⚠️ [Supabase] Mock subscription a ${name} - configuración incompleta`);
          return { unsubscribe: () => {} };
        }
      })
    }),
    removeChannel: (channel) => {
      console.warn('⚠️ [Supabase] Mock remove channel - configuración incompleta');
      return Promise.resolve('ok');
    },
    removeAllChannels: () => {
      console.warn('⚠️ [Supabase] Mock remove all channels - configuración incompleta');
      return Promise.resolve('ok');
    }
  };
};

// Service role client for bypassing RLS
export const supabaseServiceClient = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        headers: {
          'x-client-info': 'constructia-admin'
        }
      }
    })
  : createDummyClient();

// Centralized Supabase client - single instance for entire app
export const supabaseClient = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        flowType: 'pkce',
        debug: false
      },
      global: {
        headers: {
          'x-client-info': 'constructia-client'
        }
      }
    })
  : createDummyClient();

// Re-export as supabase for backward compatibility
export const supabase = supabaseClient;

// Development tenant ID
export const DEV_TENANT_ID = '00000000-0000-0000-0000-000000000001';
export const DEV_ADMIN_USER_ID = '20000000-0000-0000-0000-000000000001';

// Ensure DEV_TENANT_ID exists in tenants table
export const ensureDevTenantExists = async () => {
  if (!isSupabaseConfigured) {
    console.error('❌ Cannot ensure dev tenant exists - Supabase not configured');
    return false;
  }

  try {
    // Check if DEV_TENANT_ID exists
    const { data: existingTenant, error: checkError } = await supabaseServiceClient
      .from('tenants')
      .select('id')
      .eq('id', DEV_TENANT_ID)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking for existing tenant:', checkError);
      return false;
    }

    // If tenant doesn't exist, create it
    if (!existingTenant) {
      const { error: insertError } = await supabaseServiceClient
        .from('tenants')
        .insert({
          id: DEV_TENANT_ID,
          name: 'Development Tenant',
          status: 'active'
        });

      if (insertError) {
        console.error('Error creating DEV_TENANT_ID:', insertError);
        return false;
      }

      console.log('✅ DEV_TENANT_ID created successfully');
    } else {
      console.log('✅ DEV_TENANT_ID already exists');
    }

    return true;
  } catch (error) {
    console.error('Error ensuring DEV_TENANT_ID exists:', error);
    return false;
  }
};

// Helper para obtener configuraciones del sistema
export const getSystemSettings = async () => {
  try {
    const { data, error } = await supabaseClient
      .from('system_settings')
      .select('*')
      .order('key', { ascending: true });

    if (error) {
      console.warn('Error fetching system settings:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching system settings:', error);
    return [];
  }
};

// Update system setting
export const updateSystemSetting = async (key: string, value: any, description?: string) => {
  try {
    const { data, error } = await supabaseServiceClient
      .from('system_settings')
      .upsert({
        key,
        value,
        description: description || `Setting for ${key}`,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating system setting:', error);
      throw new Error(`Failed to update setting ${key}: ${error.message}`);
    }

    console.log(`✅ System setting updated: ${key}`);
    return data;
  } catch (error) {
    console.error('Error updating system setting:', error);
    throw error;
  }
};

// Real data functions - NO MOCK DATA

// Get current user's tenant
export const getCurrentUserTenant = async (): Promise<string | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabaseServiceClient
      .from('users')
      .select('tenant_id')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error getting user tenant:', error);
      return DEV_TENANT_ID; // Fallback to dev tenant
    }

    return data?.tenant_id || DEV_TENANT_ID;
  } catch (error) {
    console.error('Error getting current user tenant:', error);
    return DEV_TENANT_ID;
  }
};

// Helper para obtener usuarios sin RLS
export const getTenantUsersNoRLS = async (tenantId: string): Promise<NewUser[]> => {
  try {
    // Use service role client to bypass RLS completely
    const { data, error } = await supabaseServiceClient
      .from('users')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('name');

    if (error) {
      console.error('Error getting tenant users (NoRLS):', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error getting tenant users (NoRLS):', error);
    return [];
  }
};

// Get all companies for current tenant
export const getTenantEmpresas = async (tenantId: string = DEV_TENANT_ID) => {
  try {
    // Direct query without RLS to avoid recursion
    return await getTenantEmpresasNoRLS(tenantId);
  } catch (error) {
    console.error('Error fetching empresas:', error);
    return [];
  }
};

// Fallback function without RLS
export const getTenantEmpresasNoRLS = async (tenantId: string = DEV_TENANT_ID) => {
  try {
    // Use service role client to bypass RLS completely
    const { data, error } = await supabaseServiceClient
      .from('empresas')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('razon_social');

    if (error) {
      console.error('Error fetching empresas:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching empresas:', error);
    return [];
  }
};

// Get all obras for current tenant
export const getTenantObras = async (tenantId: string = DEV_TENANT_ID) => {
  try {
    // Direct query without RLS to avoid recursion
    return await getTenantObrasNoRLS(tenantId);
  } catch (error) {
    console.error('Error fetching obras:', error);
    return [];
  }
};

// Fallback function without RLS
export const getTenantObrasNoRLS = async (tenantId: string = DEV_TENANT_ID) => {
  try {
    // Use service role client to bypass RLS completely
    const { data, error } = await supabaseServiceClient
      .from('obras')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching obras:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching obras:', error);
    return [];
  }
};

// Get obras for specific empresa
export const getEmpresaObras = async (empresaId: string, tenantId: string = DEV_TENANT_ID) => {
  try {
    const { data, error } = await supabase
      .from('obras')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('empresa_id', empresaId)
      .order('nombre_obra');

    if (error) {
      console.error('Error fetching empresa obras:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching empresa obras:', error);
    return [];
  }
};

// Create new empresa
export const createEmpresa = async (empresaData: {
  razon_social: string;
  cif: string;
  rea_numero?: string;
  cnae?: string;
  direccion?: string;
  contacto_email?: string;
}, tenantId: string = DEV_TENANT_ID) => {
  try {
    const { data, error } = await supabase
      .from('empresas')
      .insert({
        ...empresaData,
        tenant_id: tenantId
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating empresa:', error);
      throw new Error(`Error creating empresa: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error creating empresa:', error);
    throw error;
  }
};

// Create new obra
export const createObra = async (obraData: {
  empresa_id: string;
  nombre_obra: string;
  codigo_obra: string;
  direccion?: string;
  cliente_final?: string;
  fecha_inicio?: string;
  fecha_fin_estimada?: string;
  plataforma_destino?: string;
  perfil_riesgo?: string;
}, tenantId: string = DEV_TENANT_ID) => {
  try {
    const { data, error } = await supabase
      .from('obras')
      .insert({
        ...obraData,
        tenant_id: tenantId
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating obra:', error);
      throw new Error(`Error creating obra: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error creating obra:', error);
    throw error;
  }
};

// Upload document to specific obra
export const uploadDocumentToObra = async (documentData: {
  obra_id: string;
  categoria: string;
  file: File;
  observaciones?: string;
}, tenantId: string = DEV_TENANT_ID) => {
  try {
    // Calculate file hash
    const fileBuffer = await documentData.file.arrayBuffer();
    const hashArray = await crypto.subtle.digest('SHA-256', fileBuffer);
    const hash = Array.from(new Uint8Array(hashArray))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Check for existing version
    const { data: existing, error: existingError } = await supabase
      .from('documentos')
      .select('version')
      .eq('tenant_id', tenantId)
      .eq('entidad_tipo', 'obra')
      .eq('entidad_id', documentData.obra_id)
      .eq('categoria', documentData.categoria)
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingError && existingError.code !== 'PGRST116') {
      throw new Error(`Error checking existing versions: ${existingError.message}`);
    }

    const version = existing ? existing.version + 1 : 1;

    // Create document record
    const fileUrl = `${tenantId}/obra/${documentData.obra_id}/${documentData.categoria}/v${version}/${hash}.${documentData.file.name.split('.').pop()}`;
    
    const { data, error } = await supabase
      .from('documentos')
      .insert({
        tenant_id: tenantId,
        entidad_tipo: 'obra',
        entidad_id: documentData.obra_id,
        categoria: documentData.categoria,
        file: fileUrl,
        mime: documentData.file.type,
        size_bytes: documentData.file.size,
        hash_sha256: hash,
        version,
        estado: 'pendiente',
        observaciones: documentData.observaciones,
        metadatos: {
          original_filename: documentData.file.name,
          upload_timestamp: new Date().toISOString()
        },
        origen: 'usuario'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating document:', error);
      throw new Error(`Error creating document: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error uploading document:', error);
    throw error;
  }
};

// Get documents for obra
export const getObraDocuments = async (obraId: string, tenantId: string = DEV_TENANT_ID) => {
  try {
    const { data, error } = await supabase
      .from('documentos')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('entidad_tipo', 'obra')
      .eq('entidad_id', obraId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching obra documents:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching obra documents:', error);
    return [];
  }
};

// Get all documents for tenant
export const getAllTenantDocuments = async (tenantId: string = DEV_TENANT_ID) => {
  try {
    // Direct query without RLS to avoid recursion
    return await getAllTenantDocumentsNoRLS(tenantId);
  } catch (error) {
    console.error('Error fetching all documents:', error);
    return [];
  }
};

// Fallback function without RLS
export const getAllTenantDocumentsNoRLS = async (tenantId: string = DEV_TENANT_ID) => {
  try {
    // Use regular client for RLS-enabled queries when called from client context
    const { data, error } = await supabaseClient
      .from('documentos')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all documents:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching all documents:', error);
    return [];
  }
};

// Get tenant statistics
export const getTenantStats = async (tenantId: string = DEV_TENANT_ID) => {
  try {
    const [
      { count: totalEmpresas },
      { count: totalObras },
      { count: totalProveedores },
      { count: totalTrabajadores },
      { count: totalMaquinaria },
      { count: totalDocumentos },
      { count: documentosPendientes },
      { count: documentosAprobados },
      { count: tareasAbiertas }
    ] = await Promise.all([
      supabaseServiceClient.from('empresas').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
      supabaseServiceClient.from('obras').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
      supabaseServiceClient.from('proveedores').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
      supabaseServiceClient.from('trabajadores').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
      supabaseServiceClient.from('maquinaria').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
      supabaseServiceClient.from('documentos').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
      supabaseServiceClient.from('documentos').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('estado', 'pendiente'),
      supabaseServiceClient.from('documentos').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('estado', 'aprobado'),
      supabaseServiceClient.from('tareas').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('estado', 'abierta')
    ]);

    return {
      totalEmpresas: totalEmpresas || 0,
      totalObras: totalObras || 0,
      totalProveedores: totalProveedores || 0,
      totalTrabajadores: totalTrabajadores || 0,
      totalMaquinaria: totalMaquinaria || 0,
      totalDocumentos: totalDocumentos || 0,
      documentosPendientes: documentosPendientes || 0,
      documentosAprobados: documentosAprobados || 0,
      tareasAbiertas: tareasAbiertas || 0
    };
  } catch (error) {
    console.error('Error getting tenant stats:', error);
    return {
      totalEmpresas: 0,
      totalObras: 0,
      totalProveedores: 0,
      totalTrabajadores: 0,
      totalMaquinaria: 0,
      totalDocumentos: 0,
      documentosPendientes: 0,
      documentosAprobados: 0,
      tareasAbiertas: 0
    };
  }
};

// Get tenant hierarchy (complete structure)
export const getTenantHierarchy = async (tenantId: string = DEV_TENANT_ID) => {
  try {
    const [empresas, obras, proveedores, trabajadores, maquinaria, documentos] = await Promise.all([
      getTenantEmpresas(tenantId),
      getTenantObras(tenantId),
      supabase.from('proveedores').select('*').eq('tenant_id', tenantId),
      supabase.from('trabajadores').select('*').eq('tenant_id', tenantId),
      supabase.from('maquinaria').select('*').eq('tenant_id', tenantId),
      supabase.from('documentos').select('*').eq('tenant_id', tenantId)
    ]);

    // Build hierarchy
    const hierarchy = empresas.map(empresa => ({
      ...empresa,
      obras: obras.filter(obra => obra.empresa_id === empresa.id).map(obra => ({
        ...obra,
        documentos: documentos.data?.filter(doc => 
          doc.entidad_tipo === 'obra' && doc.entidad_id === obra.id
        ) || [],
        proveedores: proveedores.data?.filter(prov => prov.empresa_id === empresa.id).map(proveedor => ({
          ...proveedor,
          trabajadores: trabajadores.data?.filter(trab => trab.proveedor_id === proveedor.id).map(trabajador => ({
            ...trabajador,
            documentos: documentos.data?.filter(doc => 
              doc.entidad_tipo === 'trabajador' && doc.entidad_id === trabajador.id
            ) || []
          })) || []
        })) || [],
        maquinaria: maquinaria.data?.filter(maq => maq.empresa_id === empresa.id).map(maquina => ({
          ...maquina,
          documentos: documentos.data?.filter(doc => 
            doc.entidad_tipo === 'maquinaria' && doc.entidad_id === maquina.id
          ) || []
        })) || []
      }))
    }));

    return hierarchy;
  } catch (error) {
    console.error('Error getting tenant hierarchy:', error);
    return [];
  }
};

// Authentication functions
export const authenticateUser = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('No user data returned');
    }

    // Get user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      throw new Error('User profile not found');
    }

    return {
      user: data.user,
      profile: userProfile,
      session: data.session
    };
  } catch (error) {
    console.error('Error authenticating user:', error);
    throw error;
  }
};

// Create user account
export const createUserAccount = async (userData: {
  email: string;
  password: string;
  name: string;
  tenant_id?: string;
  role?: string;
}) => {
  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password
    });

    if (authError) {
      throw new Error(authError.message);
    }

    if (!authData.user) {
      throw new Error('No user created');
    }

    // Create user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        tenant_id: userData.tenant_id || DEV_TENANT_ID,
        email: userData.email,
        name: userData.name,
        role: userData.role || 'ClienteAdmin',
        active: true
      })
      .select()
      .single();

    if (profileError) {
      console.error('Error creating user profile:', profileError);
      throw new Error(`Error creating user profile: ${profileError.message}`);
    }

    return {
      user: authData.user,
      profile,
      session: authData.session
    };
  } catch (error) {
    console.error('Error creating user account:', error);
    throw error;
  }
};

// Logout user
export const logoutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
};

// Get current user session
export const getCurrentSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting session:', error);
      return null;
    }

    return session;
  } catch (error) {
    console.error('Error getting current session:', error);
    return null;
  }
};

// Real-time subscriptions
export const subscribeToTenantChanges = (tenantId: string, callback: (payload: any) => void) => {
  return supabase
    .channel('tenant-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        filter: `tenant_id=eq.${tenantId}`
      },
      callback
    )
    .subscribe();
};

// Audit logging
export const logAuditoria = async (
  tenantId: string,
  userId: string,
  accion: string,
  entidad?: string,
  entidadId?: string,
  detalles?: any,
  ipAddress?: string,
  userAgent?: string,
  status?: 'success' | 'warning' | 'error'
) => {
  try {
    // Validate userId and fallback to DEV_ADMIN_USER_ID if invalid
    let validUserId = userId;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (!userId || userId === 'system' || !uuidRegex.test(userId)) {
      validUserId = DEV_ADMIN_USER_ID; // Use system admin user ID
    }

    // Enhanced details object with GDPR compliance data
    const enhancedDetalles = {
      ...detalles,
      user_agent: userAgent || 'Unknown',
      status: status || 'success',
      timestamp: new Date().toISOString(),
      session_id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      compliance_level: 'GDPR_LOPD',
      data_classification: entidad ? 'personal_data' : 'system_data'
    };
    await supabaseServiceClient
      .from('auditoria')
      .insert({
        tenant_id: tenantId,
        actor_user: validUserId,
        accion,
        entidad,
        entidad_id: entidadId,
        ip: ipAddress || '127.0.0.1',
        detalles: enhancedDetalles
      });
  } catch (error) {
    console.error('Error logging audit event:', error);
  }
};

// Get user permissions
export const getUserPermissions = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('role, tenant_id')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error getting user permissions:', error);
      return { role: 'Lector', tenant_id: DEV_TENANT_ID };
    }

    return data;
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return { role: 'Lector', tenant_id: DEV_TENANT_ID };
  }
};

// Check if user can access resource
export const canUserAccess = (userRole: string, action: string, resource: string): boolean => {
  const permissions = {
    SuperAdmin: ['*'],
    Cliente: ['read:own', 'write:own'],
    ClienteDemo: ['read:own']
  };

  const userPermissions = permissions[userRole as keyof typeof permissions] || [];
  
  if (userPermissions.includes('*')) return true;
  
  const fullPermission = `${action}:${resource}`;
  const wildcardPermission = `${action}:*`;
  
  return userPermissions.includes(fullPermission) || 
         userPermissions.includes(wildcardPermission);
};

// API Integration functions
export const getAPIIntegrations = async () => {
  try {
    const { data, error } = await supabaseServiceClient
      .from('system_settings')
      .select('*')
      .eq('key', 'api_integrations')
      .single();

    if (error) {
      console.warn('No API integrations found, returning defaults');
      return {
        gemini: { enabled: true, status: 'connected' },
        obralia: { enabled: true, status: 'connected' },
        stripe: { enabled: true, status: 'connected' },
        sepa: { enabled: true, status: 'connected' }
      };
    }

    return data?.value || {
      gemini: { enabled: true, status: 'connected' },
      obralia: { enabled: true, status: 'connected' },
      stripe: { enabled: true, status: 'connected' },
      sepa: { enabled: true, status: 'connected' }
    };
  } catch (error) {
    console.error('Error loading API integrations:', error);
    return {
      gemini: { enabled: false, status: 'error' },
      obralia: { enabled: false, status: 'error' },
      stripe: { enabled: false, status: 'error' },
      sepa: { enabled: false, status: 'error' }
    };
  }
};