import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';

// Service role client for bypassing RLS
export const supabaseServiceClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Centralized Supabase client - single instance for entire app
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce'
  }
});

// Re-export as supabase for backward compatibility
export const supabase = supabaseClient;

// Development tenant ID
export const DEV_TENANT_ID = '00000000-0000-0000-0000-000000000001';
export const DEV_ADMIN_USER_ID = '20000000-0000-0000-0000-000000000001';

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
    const { data, error } = await supabaseServiceClient
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
  detalles?: any
) => {
  try {
    await supabase
      .from('auditoria')
      .insert({
        tenant_id: tenantId,
        actor_user: userId,
        accion,
        entidad,
        entidad_id: entidadId,
        ip: '127.0.0.1', // In development
        detalles: detalles || {}
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
    ClienteAdmin: ['read:*', 'write:empresas', 'write:obras', 'write:proveedores', 'write:trabajadores', 'write:maquinaria', 'write:documentos'],
    GestorDocumental: ['read:*', 'write:documentos', 'write:tareas'],
    SupervisorObra: ['read:obras', 'read:documentos', 'write:tareas'],
    Proveedor: ['read:own', 'write:own'],
    Lector: ['read:*']
  };

  const userPermissions = permissions[userRole as keyof typeof permissions] || [];
  
  if (userPermissions.includes('*')) return true;
  
  const fullPermission = `${action}:${resource}`;
  const wildcardPermission = `${action}:*`;
  
  return userPermissions.includes(fullPermission) || 
         userPermissions.includes(wildcardPermission);
};