import { supabaseClient } from './supabase-real';
import { supabaseServiceClient, DEV_TENANT_ID, DEV_ADMIN_USER_ID, logAuditoria } from './supabase-real';
import type { 
  Tenant, 
  NewUser, 
  Empresa, 
  Obra, 
  Proveedor, 
  Trabajador, 
  Maquinaria, 
  NewDocumento,
  Tarea,
  UserRole,
  MappingTemplate,
  RequisitoPlataforma,
  Adaptador,
  JobIntegracion
} from '../types';

// Use centralized client
export const supabaseNew = supabaseClient;

// Re-export constants from supabase-real
export { DEV_TENANT_ID, DEV_ADMIN_USER_ID };

// Helper para obtener tenant actual del usuario
export const getCurrentUserTenant = async (userId: string): Promise<string | null> => {
  try {
    const { data, error } = await supabaseNew
      .from('users')
      .select('tenant_id')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error getting user tenant:', error);
      return null;
    }

    return data?.tenant_id || null;
  } catch (error) {
    console.error('Error getting user tenant:', error);
    return null;
  }
};

// Helper para obtener datos del tenant
export const getTenantData = async (tenantId: string): Promise<Tenant | null> => {
  try {
    const { data, error } = await supabaseNew
      .from('tenants')
      .select('*')
      .eq('id', tenantId)
      .single();

    if (error) {
      console.error('Error getting tenant data:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error getting tenant data:', error);
    return null;
  }
};

// Helper para obtener empresas del tenant
export const getTenantEmpresas = async (tenantId: string): Promise<Empresa[]> => {
  try {
    const { data, error } = await supabaseNew
      .from('empresas')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('razon_social');

    if (error) {
      console.error('Error getting empresas:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error getting empresas:', error);
    return [];
  }
};

// Helper para obtener obras del tenant
export const getTenantObras = async (tenantId: string): Promise<Obra[]> => {
  try {
    const { data, error } = await supabaseNew
      .from('obras')
      .select(`
        *,
        empresas!inner(razon_social)
      `)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting obras:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error getting obras:', error);
    return [];
  }
};

// Helper para obtener proveedores del tenant
export const getTenantProveedores = async (tenantId: string): Promise<Proveedor[]> => {
  try {
    const { data, error } = await supabaseNew
      .from('proveedores')
      .select(`
        *,
        empresas!inner(razon_social)
      `)
      .eq('tenant_id', tenantId)
      .order('razon_social');

    if (error) {
      console.error('Error getting proveedores:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error getting proveedores:', error);
    return [];
  }
};

// Helper para obtener trabajadores del tenant
export const getTenantTrabajadores = async (tenantId: string): Promise<Trabajador[]> => {
  try {
    const { data, error } = await supabaseNew
      .from('trabajadores')
      .select(`
        *,
        proveedores!inner(razon_social)
      `)
      .eq('tenant_id', tenantId)
      .order('apellido', 'nombre');

    if (error) {
      console.error('Error getting trabajadores:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error getting trabajadores:', error);
    return [];
  }
};

// Helper para obtener maquinaria del tenant
export const getTenantMaquinaria = async (tenantId: string): Promise<Maquinaria[]> => {
  try {
    const { data, error } = await supabaseNew
      .from('maquinaria')
      .select(`
        *,
        empresas!inner(razon_social)
      `)
      .eq('tenant_id', tenantId)
      .order('tipo', 'marca_modelo');

    if (error) {
      console.error('Error getting maquinaria:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error getting maquinaria:', error);
    return [];
  }
};

// Helper para obtener documentos del tenant
export const getTenantDocumentos = async (tenantId: string): Promise<NewDocumento[]> => {
  try {
    const { data, error } = await supabaseNew
      .from('documentos')
      .select(`
        id,
        tenant_id,
        entidad_tipo,
        entidad_id,
        categoria,
        file,
        mime,
        size_bytes,
        hash_sha256,
        version,
        estado,
        caducidad,
        emisor,
        observaciones,
        metadatos,
        origen,
        sensible,
        virtual_path,
        created_at,
        updated_at
      `)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting documentos:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error getting documentos:', error);
    return [];
  }
};

// Helper para obtener cola de subida manual

// Helper para obtener tareas del tenant
export const getTenantTareas = async (tenantId: string): Promise<Tarea[]> => {
  try {
    const { data, error } = await supabaseNew
      .from('tareas')
      .select(`
        *,
        documentos(categoria, file),
        obras(nombre_obra, codigo_obra),
        users(name, email)
      `)
      .eq('tenant_id', tenantId)
      .order('vencimiento');

    if (error) {
      console.error('Error getting tareas:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error getting tareas:', error);
    return [];
  }
};

// Helper para crear documento
export const createDocumento = async (documentoData: Partial<NewDocumento>): Promise<NewDocumento | null> => {
  try {
    const { data, error } = await supabaseNew
      .from('documentos')
      .insert(documentoData)
      .select()
      .single();

    if (error) {
      console.error('Error creating documento:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error creating documento:', error);
    return null;
  }
};

// Helper para actualizar estado de documento
export const updateDocumentoEstado = async (
  documentoId: string, 
  estado: DocumentoEstado, 
  observaciones?: string
): Promise<boolean> => {
  try {
    const { error } = await supabaseNew
      .from('documentos')
      .update({ 
        estado, 
        observaciones,
        updated_at: new Date().toISOString()
      })
      .eq('id', documentoId);

    if (error) {
      console.error('Error updating documento estado:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating documento estado:', error);
    return false;
  }
};

// Helper para crear tarea
export const createTarea = async (tareaData: Partial<Tarea>): Promise<Tarea | null> => {
  try {
    const { data, error } = await supabaseNew
      .from('tareas')
      .insert(tareaData)
      .select()
      .single();

    if (error) {
      console.error('Error creating tarea:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error creating tarea:', error);
    return null;
  }
};

// Helper para añadir documento a cola manual

// Helper para obtener estructura jerárquica completa
export const getTenantHierarchy = async (tenantId: string) => {
  try {
    const [empresas, obras, proveedores, trabajadores, maquinaria, documentos] = await Promise.all([
      getTenantEmpresas(tenantId),
      getTenantObras(tenantId),
      getTenantProveedores(tenantId),
      getTenantTrabajadores(tenantId),
      getTenantMaquinaria(tenantId),
      getTenantDocumentos(tenantId)
    ]);

    // Construir jerarquía: Empresa -> Obra -> Documentos
    const hierarchy = empresas.map(empresa => ({
      ...empresa,
      obras: obras.filter(obra => obra.empresa_id === empresa.id).map(obra => ({
        ...obra,
        documentos: documentos.filter(doc => 
          doc.entidad_tipo === 'obra' && doc.entidad_id === obra.id
        ),
        proveedores: proveedores.filter(prov => prov.empresa_id === empresa.id).map(proveedor => ({
          ...proveedor,
          trabajadores: trabajadores.filter(trab => trab.proveedor_id === proveedor.id).map(trabajador => ({
            ...trabajador,
            documentos: documentos.filter(doc => 
              doc.entidad_tipo === 'trabajador' && doc.entidad_id === trabajador.id
            )
          }))
        })),
        maquinaria: maquinaria.filter(maq => maq.empresa_id === empresa.id).map(maquina => ({
          ...maquina,
          documentos: documentos.filter(doc => 
            doc.entidad_tipo === 'maquinaria' && doc.entidad_id === maquina.id
          )
        }))
      }))
    }));

    return hierarchy;
  } catch (error) {
    console.error('Error getting tenant hierarchy:', error);
    return [];
  }
};

// Helper para verificar permisos por rol
export const checkRolePermission = (userRole: UserRole, action: string, resource: string): boolean => {
  const permissions = {
    SuperAdmin: ['*'],
    ClienteAdmin: ['read:*', 'write:empresas', 'write:obras', 'write:proveedores', 'write:trabajadores', 'write:maquinaria'],
    GestorDocumental: ['read:*', 'write:documentos', 'write:tareas'],
    SupervisorObra: ['read:obras', 'read:documentos', 'write:tareas'],
    Proveedor: ['read:own', 'write:own'],
    Lector: ['read:*']
  };

  const userPermissions = permissions[userRole] || [];
  
  // SuperAdmin tiene acceso total
  if (userPermissions.includes('*')) return true;
  
  // Verificar permisos específicos
  const fullPermission = `${action}:${resource}`;
  const wildcardPermission = `${action}:*`;
  
  return userPermissions.includes(fullPermission) || 
         userPermissions.includes(wildcardPermission);
};

// Re-export logAuditoria from supabase-real
export { logAuditoria };

// Helper para obtener estadísticas del tenant
export const getTenantStats = async (tenantId: string) => {
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
      { count: tareasAbiertas },
      { count: queuePendientes }
    ] = await Promise.all([
      supabaseNew.from('empresas').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
      supabaseNew.from('obras').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
      supabaseNew.from('proveedores').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
      supabaseNew.from('trabajadores').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
      supabaseNew.from('maquinaria').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
      supabaseNew.from('documentos').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
      supabaseNew.from('documentos').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('estado', 'pendiente'),
      supabaseNew.from('documentos').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('estado', 'aprobado'),
      supabaseNew.from('tareas').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('estado', 'abierta'),
      supabaseNew.from('manual_upload_queue').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('status', 'queued')
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
      tareasAbiertas: tareasAbiertas || 0,
      queuePendientes: queuePendientes || 0
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
      tareasAbiertas: 0,
      queuePendientes: 0
    };
  }
};

// Helper para procesar documento en cola manual
// Helper para obtener mapping templates
export const getMappingTemplates = async (tenantId: string, plataforma?: string): Promise<MappingTemplate[]> => {
  try {
    let query = supabaseNew
      .from('mapping_templates')
      .select('*')
      .eq('tenant_id', tenantId);

    if (plataforma) {
      query = query.eq('plataforma', plataforma);
    }

    const { data, error } = await query.order('version', { ascending: false });

    if (error) {
      console.error('Error getting mapping templates:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error getting mapping templates:', error);
    return [];
  }
};

// Helper para crear mapping template
export const createMappingTemplate = async (templateData: Partial<MappingTemplate>): Promise<MappingTemplate | null> => {
  try {
    const { data, error } = await supabaseNew
      .from('mapping_templates')
      .insert(templateData)
      .select()
      .single();

    if (error) {
      console.error('Error creating mapping template:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error creating mapping template:', error);
    return null;
  }
};

// Helper para obtener requisitos de plataforma
export const getRequisitosPlatforma = async (
  tenantId: string,
  plataforma?: string,
  perfilRiesgo?: string
): Promise<RequisitoPlataforma[]> => {
  try {
    let query = supabaseNew
      .from('requisitos_plataforma')
      .select('*')
      .eq('tenant_id', tenantId);

    if (plataforma) {
      query = query.eq('plataforma', plataforma);
    }

    if (perfilRiesgo) {
      query = query.eq('perfil_riesgo', perfilRiesgo);
    }

    const { data, error } = await query.order('categoria');

    if (error) {
      console.error('Error getting requisitos plataforma:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error getting requisitos plataforma:', error);
    return [];
  }
};

// Helper para obtener adaptadores
export const getAdaptadores = async (tenantId: string, plataforma?: string): Promise<Adaptador[]> => {
  try {
    let query = supabaseNew
      .from('adaptadores')
      .select('*')
      .eq('tenant_id', tenantId);

    if (plataforma) {
      query = query.eq('plataforma', plataforma);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting adaptadores:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error getting adaptadores:', error);
    return [];
  }
};

// Helper para obtener jobs de integración
export const getJobsIntegracion = async (tenantId: string, obraId?: string): Promise<JobIntegracion[]> => {
  try {
    let query = supabaseNew
      .from('jobs_integracion')
      .select('*')
      .eq('tenant_id', tenantId);

    if (obraId) {
      query = query.eq('obra_id', obraId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting jobs integracion:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error getting jobs integracion:', error);
    return [];
  }
};