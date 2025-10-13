import { createClient } from '@supabase/supabase-js';
import { supabaseClient, supabaseServiceClient, DEV_TENANT_ID } from './supabase-real';
import type { AuthenticatedClient } from '../types';
import { 
  getTenantEmpresas,
  getTenantEmpresasNoRLS,
  getTenantUsersNoRLS,
  getTenantObras,
  getTenantObrasNoRLS, 
  getTenantStats,
  getCurrentUserTenant,
  getSystemSettings
} from './supabase-real';

// Constante UUID válida para desarrollo
export const TEST_USER_UUID = '00000000-0000-0000-0000-000000000001';

// Export DEV_TENANT_ID for use in other modules
export { DEV_TENANT_ID };

// Export functions from supabase-real for use in other modules
export { getTenantEmpresasNoRLS, getTenantUsersNoRLS, getTenantObrasNoRLS, getTenantStats, getSystemSettings };

// Use centralized client
export const supabase = supabaseClient;

// Helper para obtener datos del cliente actual
export const getCurrentClientData = async (userId: string) => {
  console.log('🔍 [Supabase] getCurrentClientData called with userId:', userId);
  
  try {
    if (!userId) {
      console.error('❌ [Supabase] No userId provided to getCurrentClientData');
      return null;
    }

    // Get user from new multi-tenant schema
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (userError) {
      if (userError.code === 'PGRST116') {
        console.log('⚠️ [Supabase] User data not found for user:', userId);
        return null;
      }
      console.error('❌ [Supabase] Database error:', userError);
      return null;
    }
    
    if (!userData) {
      console.log('⚠️ [Supabase] No user data found');
      return null;
    }

    // Transform user data to match expected client format
    const clientData = {
      id: userData.id,
      user_id: userId,
      client_id: `CLI-${userData.id.substring(0, 8)}`,
      company_name: userData.name || 'Usuario',
      contact_name: userData.name || 'Usuario',
      email: userData.email,
      phone: '',
      address: '',
      subscription_plan: 'professional',
      subscription_status: userData.active ? 'active' : 'suspended',
      storage_used: 0,
      storage_limit: 1073741824,
      documents_processed: 0,
      tokens_available: 1000,
      obralia_credentials: { configured: false },
      created_at: userData.created_at,
      updated_at: userData.updated_at
    };
    
    console.log('✅ [Supabase] User data retrieved successfully:', clientData.company_name);
    return clientData;
  } catch (error) {
    console.error('❌ [Supabase] Error getting client data:', error);
    return null;
  }
};

// Helper para obtener todos los clientes (admin)
export const getAllClients = async () => {
  try {
    console.log('🔍 [getAllClients] Starting to fetch clients from database...');

    // First, try to fetch clients directly without any joins to test basic connectivity
    const { data: directClientsData, error: directError } = await supabaseServiceClient
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (directError) {
      console.error('❌ [getAllClients] Error fetching clients directly:', directError);
      return [];
    }

    console.log(`✅ [getAllClients] Found ${directClientsData?.length || 0} clients in database (direct query)`);

    if (!directClientsData || directClientsData.length === 0) {
      console.log('⚠️ [getAllClients] No clients found in database');
      return [];
    }

    // Now fetch user data separately to get tenant_ids
    const userIds = directClientsData.map(c => c.user_id).filter(Boolean);
    console.log(`🔍 [getAllClients] Fetching tenant data for ${userIds.length} user IDs`);

    const { data: usersData, error: usersError } = await supabaseServiceClient
      .from('users')
      .select('id, tenant_id')
      .in('id', userIds);

    if (usersError) {
      console.warn('⚠️ [getAllClients] Error fetching users data:', usersError);
    }

    // Create a map of user_id to tenant_id
    const userTenantMap = new Map();
    (usersData || []).forEach(user => {
      userTenantMap.set(user.id, user.tenant_id);
    });

    console.log(`📊 [getAllClients] Mapped ${userTenantMap.size} users to tenants`);

    // Extract unique tenant_ids, using DEV_TENANT_ID as fallback for clients without users
    const tenantIds = [...new Set(directClientsData.map(client => {
      const tenantId = userTenantMap.get(client.user_id);
      return tenantId || DEV_TENANT_ID;
    }))];

    console.log(`📊 [getAllClients] Found ${tenantIds.length} unique tenant(s)`);

    // Fetch document stats for all relevant tenants using proper aggregate query
    const documentStatsPromises = tenantIds.map(async (tenantId) => {
      const { count, error: countError } = await supabaseServiceClient
        .from('documentos')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId);

      const { data: sizeData, error: sizeError } = await supabaseServiceClient
        .from('documentos')
        .select('size_bytes')
        .eq('tenant_id', tenantId);

      if (countError || sizeError) {
        console.warn(`⚠️ [getAllClients] Error fetching stats for tenant ${tenantId}:`, countError || sizeError);
        return { tenantId, count: 0, totalSize: 0 };
      }

      const totalSize = (sizeData || []).reduce((sum, doc) => sum + (doc.size_bytes || 0), 0);

      console.log(`📊 [getAllClients] Tenant ${tenantId.substring(0, 8)}: ${count || 0} documents, ${totalSize} bytes`);

      return {
        tenantId,
        count: count || 0,
        totalSize
      };
    });

    const documentStats = await Promise.all(documentStatsPromises);
    const documentStatsMap = new Map();
    documentStats.forEach(stat => {
      documentStatsMap.set(stat.tenantId, {
        total_documents: stat.count,
        total_storage_used: stat.totalSize
      });
    });

    console.log(`📊 [getAllClients] Fetched document stats for ${documentStatsMap.size} tenant(s)`);

    // Combine all data
    const combinedClients = directClientsData.map(client => {
      const tenantId = userTenantMap.get(client.user_id) || DEV_TENANT_ID;
      const stats = documentStatsMap.get(tenantId) || { total_documents: 0, total_storage_used: 0 };

      const combinedClient = {
        ...client,
        tenant_id: tenantId,
        total_documents: stats.total_documents,
        total_storage_used: stats.total_storage_used,
        documents_processed: stats.total_documents,
        storage_used: stats.total_storage_used,
      };

      console.log(`✅ [getAllClients] Client "${client.company_name}":`, {
        tenant_id: tenantId.substring(0, 8),
        documents: stats.total_documents,
        storage_bytes: stats.total_storage_used,
        storage_mb: (stats.total_storage_used / 1024 / 1024).toFixed(2)
      });

      return combinedClient;
    });

    console.log(`✅ [getAllClients] Successfully processed ${combinedClients.length} clients with real database stats`);

    return combinedClients;
  } catch (error) {
    console.error('❌ [getAllClients] Unexpected error fetching clients:', error);
    return [];
  }
};

// Helper para obtener todos los documentos del tenant sin RLS
// This function is already defined in supabase-real.ts and re-exported in supabase-new.ts
// No need to redefine here, just ensure it's used correctly where needed.
// export const getAllTenantDocumentsNoRLS = async (tenantId: string) => {
//   // ... (existing implementation)
// };

// Helper para obtener proyectos del cliente
export const getClientProjects = async (clientId: string) => {
  try {
    if (!clientId) {
      throw new Error('Client ID is required');
    }

    // Get obras from new schema
    const tenantId = DEV_TENANT_ID;
    const obras = await getTenantObrasNoRLS(tenantId);

    // Transform obras to project format
    const projects = obras.map(obra => ({
      id: obra.id,
      company_id: obra.empresa_id,
      client_id: clientId,
      name: obra.nombre_obra,
      description: `Proyecto en ${obra.direccion || 'ubicación no especificada'}`,
      status: Math.random() > 0.7 ? 'completed' : Math.random() > 0.5 ? 'active' : 'planning',
      progress: Math.floor(Math.random() * 100),
      start_date: obra.fecha_inicio,
      end_date: obra.fecha_fin_estimada,
      budget: Math.floor(Math.random() * 500000) + 50000,
      location: obra.direccion || 'Madrid, España',
      created_at: obra.created_at,
      updated_at: obra.updated_at,
      companies: {
        name: obra.empresas?.razon_social || 'Empresa'
      }
    }));
    
    return projects;
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
};

// Helper para obtener empresas del cliente
export const getClientCompanies = async (clientId: string) => {
  try {
    if (!clientId) {
      throw new Error('Client ID is required');
    }

    // Get empresas from new schema
    const tenantId = DEV_TENANT_ID;
    const empresas = await getTenantEmpresasNoRLS(tenantId);

    // Transform empresas to company format (using empresas table directly)
    const companies = empresas.map(empresa => ({
      id: empresa.id,
      client_id: clientId,
      name: empresa.razon_social,
      cif: empresa.cif,
      address: empresa.direccion || '',
      phone: '+34 600 000 000', // Default phone since empresas table doesn't have phone
      email: empresa.contacto_email || '',
      created_at: empresa.created_at,
      updated_at: empresa.updated_at
    }));
    
    return companies;
  } catch (error) {
    console.error('Error fetching companies:', error);
    return [];
  }
};

// Helper para obtener todos los documentos del tenant sin RLS
export const getAllTenantDocumentsNoRLS = async (tenantId: string) => {
  try {
    // Use service role client for direct access without RLS
    const { data, error } = await supabaseServiceClient
      .from('documentos')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tenant documents:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAllTenantDocumentsNoRLS:', error);
    throw error;
  }
};

// Helper para obtener documentos del cliente

// Helper para obtener logs de auditoría
export const getAuditLogs = async (
  newData?: any,
  userId?: string | null
) => {
  try {
    let actorUserId = userId;
    
    if (!actorUserId) {
      const { data: { user } } = await supabase.auth.getUser();
      actorUserId = user?.id || null;
    }

    // Skip audit logging if no valid user ID
    if (!actorUserId) {
      console.warn('Skipping audit log - no valid user ID');
      return;
    }

    // CRITICAL FIX: Get ALL audit logs from ALL tenants for admin view
    console.log('📋 [AuditLogs] Loading GLOBAL audit logs for admin dashboard...');
    
    // Use service client to bypass RLS and get ALL audit logs from ALL tenants
    const { data, error } = await supabaseServiceClient
      .from('auditoria')
      .select(`
        *,
        users(email, role, tenant_id)
      `)
      .order('created_at', { ascending: false })
      .limit(500);

    if (error) {
      console.warn('Error fetching audit logs:', error);
      return [];
    }
    
    // Get all tenants to map tenant_id to company names for better display
    const { data: tenants, error: tenantsError } = await supabaseServiceClient
      .from('tenants')
      .select('id, name');

    if (tenantsError) {
      console.warn('Error fetching tenants for audit logs:', tenantsError);
    }

    // Get all empresas to map tenant_id to real company names
    const { data: empresas, error: empresasError } = await supabaseServiceClient
      .from('empresas')
      .select('tenant_id, razon_social');

    if (empresasError) {
      console.warn('Error fetching empresas for audit logs:', empresasError);
    }

    // Create tenant name mapping
    const tenantNameMap = new Map<string, string>();
    (tenants || []).forEach(tenant => {
      tenantNameMap.set(tenant.id, tenant.name);
    });

    // Create empresa name mapping for better client identification
    const empresaNameMap = new Map<string, string>();
    (empresas || []).forEach(empresa => {
      empresaNameMap.set(empresa.tenant_id, empresa.razon_social);
    });
    console.log(`✅ [AuditLogs] Loaded ${data?.length || 0} audit logs from ALL tenants`);
    console.log(`📊 [AuditLogs] Tenant mapping: ${tenantNameMap.size} tenants available`);
    console.log(`🏢 [AuditLogs] Empresa mapping: ${empresaNameMap.size} empresas available`);
    
    // Transform audit logs to expected format
    const auditLogs = (data || []).map(log => ({
      id: log.id,
      user_id: log.actor_user,
      client_id: log.entidad_id,
      action: log.accion,
      resource: log.entidad || 'unknown',
      details: log.detalles,
      ip_address: log.ip || '127.0.0.1',
      user_agent: log.detalles?.user_agent || 'Unknown',
      status: log.detalles?.status || 'success',
      session_id: log.detalles?.session_id || 'unknown',
      compliance_level: log.detalles?.compliance_level || 'GDPR_LOPD',
      data_classification: log.detalles?.data_classification || 'system_data',
      tenant_id: log.tenant_id,
      original_tenant_id: log.detalles?.original_tenant_id || log.tenant_id,
      is_global_audit: log.detalles?.global_admin_view || false,
      cross_tenant_action: log.detalles?.cross_tenant_action || false,
      created_at: log.created_at,
      users: {
        email: log.users?.email || 'admin@constructia.com',
        role: log.users?.role || 'admin'
      },
      clients: {
        company_name: empresaNameMap.get(log.detalles?.original_tenant_id || log.tenant_id) || 
                     tenantNameMap.get(log.detalles?.original_tenant_id || log.tenant_id) || 
                     `Tenant ${(log.detalles?.original_tenant_id || log.tenant_id)?.substring(0, 8) || 'Unknown'}`
      }
    }));
    
    // Log summary for debugging
    const tenantCounts = new Map<string, number>();
    const globalAuditCount = auditLogs.filter(log => log.is_global_audit).length;
    const crossTenantCount = auditLogs.filter(log => log.cross_tenant_action).length;
    
    auditLogs.forEach(log => {
      const tenantId = log.original_tenant_id || log.tenant_id;
      tenantCounts.set(tenantId, (tenantCounts.get(tenantId) || 0) + 1);
    });
    
    console.log('📊 [AuditLogs] Audit logs by tenant:');
    tenantCounts.forEach((count, tenantId) => {
      const tenantName = empresaNameMap.get(tenantId) || tenantNameMap.get(tenantId) || 'Unknown';
      console.log(`   🏢 ${tenantName}: ${count} logs`);
    });
    
    console.log(`📊 [AuditLogs] Global audit entries: ${globalAuditCount}`);
    console.log(`📊 [AuditLogs] Cross-tenant actions: ${crossTenantCount}`);
    
    return auditLogs;
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return [];
  }
};

// Helper para obtener KPIs del sistema
export const getKPIs = async () => {
  try {
    const { data, error } = await supabaseClient
      .from('kpis')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching KPIs:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching KPIs:', error);
    return [];
  }
};

// Helper para obtener todas las pasarelas de pago
export const getAllPaymentGateways = async () => {
  try {
    const { data, error } = await supabaseClient
      .from('payment_gateways')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching payment gateways:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching payment gateways:', error);
    return [];
  }
};

// Helper para obtener mandatos SEPA del cliente
export const getSEPAMandates = async (clientId: string) => {
  try {
    const { data, error } = await supabaseClient
      .from('sepa_mandates')
      .select('*')
      .eq('client_id', clientId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching SEPA mandates:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching SEPA mandates:', error);
    return [];
  }
};

// Helper para crear mandato SEPA
export const createSEPAMandate = async (mandateData: Partial<SEPAMandate>) => {
  try {
    console.log('🔍 [SEPA] Creating SEPA mandate for client_id:', mandateData.client_id);
    
    const { data, error } = await supabaseClient
      .from('sepa_mandates')
      .insert({
        ...mandateData,
        mandate_id: `SEPA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('❌ [SEPA] Error creating SEPA mandate:', error);
      throw new Error(`Error creating SEPA mandate: ${error.message}`);
    }
    
    console.log('✅ [SEPA] SEPA mandate created successfully');
    return data;
  } catch (error) {
    console.error('Error creating SEPA mandate:', error);
    throw error;
  }
};

// Helper para obtener cola de procesamiento manual

// Helper para actualizar configuración del sistema
export const updateSystemSetting = async (key: string, value: any, description?: string) => {
  try {
    const { data, error } = await supabaseClient
      .from('system_settings')
      .upsert({
        key,
        value,
        description: description || `Configuración para ${key}`,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating system setting: ${error.message}`);
    }
    
    return data;
  } catch (error) {
    console.error('Error updating system setting:', error);
    throw error;
  }
};

// Helper para obtener todos los recibos (admin)
export const getAllReceipts = async () => {
  try {
    const { data, error } = await supabaseClient
      .from('receipts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error getting all receipts:', error);
      return [];
    }
    
    // Transform receipts to include mock client info
    const receipts = (data || []).map(receipt => ({
      ...receipt,
      clients: {
        company_name: 'Empresa Cliente',
        contact_name: 'Contacto',
        email: 'contacto@empresa.com'
      }
    }));
    
    return receipts;
  } catch (error) {
    console.error('Error getting all receipts:', error);
    return [];
  }
};

// Helper para obtener estadísticas de clientes
export const getClientStats = async () => {
  try {
    // Get empresas as client stats
    const tenantId = DEV_TENANT_ID;
    const empresas = await getTenantEmpresasNoRLS(tenantId);

    // Transform to client stats format
    const clientStats = empresas.map((empresa, index) => ({
      subscription_plan: index % 4 === 0 ? 'enterprise' : index % 3 === 0 ? 'professional' : 'basic',
      subscription_status: empresa.estado_compliance === 'al_dia' ? 'active' : 'suspended',
      created_at: empresa.created_at,
      storage_used: Math.floor(Math.random() * 500000000),
      storage_limit: index % 4 === 0 ? 5368709120 : index % 3 === 0 ? 1073741824 : 524288000
    }));
    
    return clientStats;
  } catch (error) {
    console.error('Error fetching client stats:', error);
    return [];
  }
};

// Helper para obtener estadísticas de documentos
export const getDocumentStats = async () => {
  try {
    // Get documentos from new schema
    const tenantId = DEV_TENANT_ID;
    const documentos = await getAllTenantDocumentsNoRLS(tenantId);

    // Transform to document stats format
    const documentStats = documentos.map(documento => ({
      document_type: documento.categoria,
      upload_status: documento.estado === 'aprobado' ? 'completed' : 
                    documento.estado === 'pendiente' ? 'processing' : 'pending',
      classification_confidence: documento.metadatos?.ai_extraction?.confianza?.categoria_probable 
        ? Math.round(documento.metadatos.ai_extraction.confianza.categoria_probable * 100)
        : Math.floor(Math.random() * 30) + 70,
      created_at: documento.created_at,
      file_size: documento.size_bytes || 1024000
    }));
    
    return documentStats;
  } catch (error) {
    console.error('Error fetching document stats:', error);
    return [];
  }
};

// Helper para calcular KPIs dinámicamente
export const calculateDynamicKPIs = async () => {
  try {
    console.log('📊 [calculateDynamicKPIs] Starting to calculate system-wide KPIs...');

    // Fetch clients and receipts in parallel
    const [receipts, clients] = await Promise.all([
      getAllReceipts(),
      getAllClients()
    ]);

    console.log(`✅ [calculateDynamicKPIs] Loaded ${clients.length} clients and ${receipts.length} receipts`);

    // Extract unique tenant IDs from all clients
    const uniqueTenantIds = [...new Set(clients.map(c => c.tenant_id).filter(Boolean))];
    console.log(`📋 [calculateDynamicKPIs] Found ${uniqueTenantIds.length} unique tenant(s)`);

    // Fetch documents for all tenants in parallel
    const allDocumentsPromises = uniqueTenantIds.map(async (tenantId) => {
      try {
        const docs = await getAllTenantDocumentsNoRLS(tenantId);
        console.log(`  ✓ Tenant ${tenantId}: ${docs.length} documents`);
        return docs;
      } catch (error) {
        console.warn(`  ⚠️ Error fetching documents for tenant ${tenantId}:`, error);
        return [];
      }
    });

    const allDocumentsArrays = await Promise.all(allDocumentsPromises);

    // Flatten all documents into a single array
    const allDocuments = allDocumentsArrays.flat();
    console.log(`📄 [calculateDynamicKPIs] Total documents across all tenants: ${allDocuments.length}`);

    // Calculate active clients (clients with active subscription)
    const activeClients = clients.filter(c => c.subscription_status === 'active').length;

    // Calculate total revenue
    const totalRevenue = receipts.reduce((sum, r) => sum + (r.amount || 0), 0);

    // Calculate documents uploaded this month across all tenants
    const documentsThisMonth = allDocuments.filter(d => {
      const docDate = new Date(d.created_at);
      const now = new Date();
      return docDate.getMonth() === now.getMonth() && docDate.getFullYear() === now.getFullYear();
    }).length;

    console.log(`📅 [calculateDynamicKPIs] Documents this month: ${documentsThisMonth}`);

    // Calculate real AI confidence from document metadata across all tenants
    const avgConfidence = allDocuments.length > 0
      ? allDocuments.reduce((sum, d) => {
          const aiExtraction = d.metadatos?.ai_extraction;
          const confidence = aiExtraction?.confianza?.categoria_probable || 0.85;
          return sum + (confidence * 100);
        }, 0) / allDocuments.length
      : 0;

    // Calculate monthly revenue data for chart
    const monthlyRevenueData = [];
    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date();
      targetDate.setMonth(targetDate.getMonth() - i);

      const monthlyTotal = receipts.filter(receipt => {
        const receiptDate = new Date(receipt.created_at);
        return receiptDate.getMonth() === targetDate.getMonth() &&
               receiptDate.getFullYear() === targetDate.getFullYear();
      }).reduce((sum, receipt) => sum + (receipt.amount || 0), 0);

      monthlyRevenueData.push(monthlyTotal);
    }

    // Calculate document status distribution across all tenants
    const completedDocumentsCount = allDocuments.filter(d => d.estado === 'aprobado').length;
    const processingDocumentsCount = allDocuments.filter(d => d.estado === 'pendiente').length;
    const rejectedDocumentsCount = allDocuments.filter(d => d.estado === 'rechazado').length;
    const draftDocumentsCount = allDocuments.filter(d => d.estado === 'borrador').length;

    console.log(`📊 [calculateDynamicKPIs] Document status: Completed=${completedDocumentsCount}, Processing=${processingDocumentsCount}, Rejected=${rejectedDocumentsCount}, Draft=${draftDocumentsCount}`);

    // Calculate clients by plan
    const clientsByPlan = {
      basic: clients.filter(c => c.subscription_plan === 'basic').length,
      professional: clients.filter(c => c.subscription_plan === 'professional').length,
      enterprise: clients.filter(c => c.subscription_plan === 'enterprise').length,
      custom: clients.filter(c => c.subscription_plan === 'custom').length
    };

    const result = {
      activeClients,
      totalRevenue,
      documentsThisMonth,
      avgConfidence: Math.round(avgConfidence * 10) / 10,
      totalDocuments: allDocuments.length,
      totalClients: clients.length,
      monthlyRevenueData,
      completedDocumentsCount,
      processingDocumentsCount,
      rejectedDocumentsCount,
      draftDocumentsCount,
      clientsByPlan
    };

    console.log('✅ [calculateDynamicKPIs] KPIs calculated successfully:', {
      totalDocuments: result.totalDocuments,
      totalClients: result.totalClients,
      activeClients: result.activeClients,
      documentsThisMonth: result.documentsThisMonth
    });

    return result;
  } catch (error) {
    console.error('❌ [calculateDynamicKPIs] Error calculating dynamic KPIs:', error);
    return {
      activeClients: 0,
      totalRevenue: 0,
      documentsThisMonth: 0,
      avgConfidence: 0,
      totalDocuments: 0,
      totalClients: 0,
      monthlyRevenueData: [0, 0, 0, 0, 0, 0],
      completedDocumentsCount: 0,
      processingDocumentsCount: 0,
      rejectedDocumentsCount: 0,
      draftDocumentsCount: 0,
      clientsByPlan: { basic: 0, professional: 0, enterprise: 0, custom: 0 }
    };
  }
};

// Helper para actualizar credenciales de Obralia del cliente
// TODO: Implement with new multi-tenant architecture
export const updateClientObraliaCredentials = async (clientId: string, credentials: { username: string; password: string }) => {
  console.log('⚠️ updateClientObraliaCredentials: Function needs implementation with new schema');
  // For now, simulate success
  return { id: clientId, updated_at: new Date().toISOString() };
};

// Helper para obtener estadísticas de ingresos
export const getRevenueStats = async () => {
  try {
    const { data, error } = await supabaseClient
      .from('receipts')
      .select('amount, currency, payment_date, status, payment_method')
      .eq('status', 'paid')
      .order('payment_date', { ascending: false });

    if (error) {
      console.warn('Error fetching revenue stats:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching revenue stats:', error);
    return [];
  }
};

// Helper para obtener integraciones de API (datos locales)
export const getAPIIntegrations = async () => {
  try {
    return [
      {
        id: '1',
        name: 'Supabase Database',
        status: 'connected',
        description: 'Base de datos principal',
        requests_today: 15678,
        avg_response_time_ms: 89,
        last_sync: new Date().toISOString(),
        config_details: { 
          connection_pool: 'active', 
          ssl: true,
          max_connections: 200
        }
      },
      {
        id: '2',
        name: 'Sistema de Archivos',
        status: 'connected',
        description: 'Almacenamiento local de documentos',
        requests_today: 234,
        avg_response_time_ms: 45,
        last_sync: new Date().toISOString(),
        config_details: { 
          storage_configured: true, 
          encryption: true,
          backup_enabled: true
        }
      }
    ];
  } catch (error) {
    console.error('Error fetching API integrations:', error);
    throw error;
  }
};

// Helper para crear cliente de prueba
export const createTestClient = async () => {
  try {
    const testClientData = {
      user_id: TEST_USER_UUID,
      client_id: 'CLI-TEST-001',
      company_name: 'Construcciones García S.L.',
      contact_name: 'Juan García',
      email: 'juan@construccionesgarcia.com',
      phone: '+34 600 123 456',
      address: 'Calle Construcción 123, 28001 Madrid',
      subscription_plan: 'professional',
      subscription_status: 'active',
      storage_used: 524288000,
      storage_limit: 1073741824,
      documents_processed: 15,
      tokens_available: 1000,
      obralia_credentials: { configured: true, username: 'test_user', password: 'test_pass' }
    };

    const { data, error } = await supabase
      .from('clients')
      .upsert(testClientData)
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating test client: ${error.message}`);
    }
    
    return data;
  } catch (error) {
    console.error('Error creating test client:', error);
    throw error;
  }
};

// Helper para crear datos de prueba
export const createTestData = async () => {
  try {
    // Verificar si el usuario de prueba ya existe
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('id', TEST_USER_UUID)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      throw new Error(`Error checking for existing user: ${checkError.message}`);
    }

    // Si el usuario no existe, crearlo
    if (!existingUser) {
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: TEST_USER_UUID,
          tenant_id: DEV_TENANT_ID,
          email: 'test@construccionesgarcia.com',
          role: 'client'
        });

      if (userError) {
        throw new Error(`Error creating test user: ${userError.message}`);
      }
    }

    // Verificar que el usuario existe antes de crear el cliente
    const { data: verifyUser, error: verifyError } = await supabase
      .from('users')
      .select('id')
      .eq('id', TEST_USER_UUID)
      .single();

    if (verifyError || !verifyUser) {
      throw new Error('Test user could not be verified after creation');
    }

    // Crear cliente de prueba
    const client = await createTestClient();
    
    // Crear empresas de prueba
    const companies = [
      {
        client_id: client.id,
        name: 'Construcciones García S.L.',
        cif: 'B12345678',
        address: 'Calle Construcción 123, 28001 Madrid',
        phone: '+34 600 123 456',
        email: 'info@construccionesgarcia.com'
      },
      {
        client_id: client.id,
        name: 'Reformas Integrales López',
        cif: 'B87654321',
        address: 'Avenida Reforma 456, 28002 Madrid',
        phone: '+34 600 654 321',
        email: 'contacto@reformaslopez.com'
      }
    ];

    const { data: companiesData, error: companiesError } = await supabase
      .from('companies')
      .upsert(companies)
      .select();

    if (companiesError) {
      console.warn('Error creating test companies:', companiesError);
    }

    // Crear proyectos de prueba
    if (companiesData && companiesData.length > 0) {
      const projects = [
        {
          company_id: companiesData[0].id,
          client_id: client.id,
          name: 'Edificio Residencial García',
          description: 'Construcción de edificio residencial de 4 plantas',
          status: 'active',
          progress: 65,
          start_date: '2024-01-15',
          end_date: '2025-06-30',
          budget: 450000,
          location: 'Madrid, España'
        },
        {
          company_id: companiesData[1].id,
          client_id: client.id,
          name: 'Reforma Oficinas López',
          description: 'Reforma integral de oficinas corporativas',
          status: 'planning',
          progress: 15,
          start_date: '2025-03-01',
          end_date: '2025-08-15',
          budget: 125000,
          location: 'Barcelona, España'
        }
      ];

      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .upsert(projects)
        .select();

      if (projectsError) {
        console.warn('Error creating test projects:', projectsError);
      }

      // Crear documentos de prueba
      if (projectsData && projectsData.length > 0) {
        const documents = [
          {
            project_id: projectsData[0].id,
            client_id: client.id,
            filename: 'certificado_obra_123.pdf',
            original_name: 'Certificado de Obra - Proyecto García.pdf',
            file_size: 2048576,
            file_type: 'application/pdf',
            document_type: 'Certificado',
            classification_confidence: 95,
            upload_status: 'completed',
            obralia_status: 'validated',
            security_scan_status: 'safe',
            processing_attempts: 1
          },
          {
            project_id: projectsData[1].id,
            client_id: client.id,
            filename: 'factura_materiales_456.pdf',
            original_name: 'Factura Materiales - Enero 2025.pdf',
            file_size: 1024768,
            file_type: 'application/pdf',
            document_type: 'Factura',
            classification_confidence: 92,
            upload_status: 'processing',
            obralia_status: 'pending',
            security_scan_status: 'safe',
            processing_attempts: 0
          }
        ];

        const { error: documentsError } = await supabase
          .from('documents')
          .upsert(documents);

        if (documentsError) {
          console.warn('Error creating test documents:', documentsError);
        }
      }
    }

    return client;
  } catch (error) {
    console.error('Error creating test data:', error);
    throw error;
  }
};

// Helper para obtener insights de IA
export const getAIInsights = async () => {
  try {
    console.log('🔍 [SEPA] Getting SEPA mandates for client_id:', clientId);
    const { data, error } = await supabase
      .from('ai_insights')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(10);

      console.error('❌ [SEPA] Error fetching SEPA mandates:', error);
    if (error) {
      console.warn('Error fetching AI insights:', error);
      return [];
    }
    
    console.log('✅ [SEPA] Found', data?.length || 0, 'SEPA mandates');
    return data || [];
  } catch (error) {
    console.error('Error fetching AI insights:', error);
    return [];
  }
};

// Helper para calcular comisión inteligente basada en períodos
export const calculateIntelligentCommission = (
  gateway: any,
  amount: number,
  transactionDate: string
): number => {
  try {
    // Si no hay períodos configurados, usar comisión estándar
    if (!gateway.commission_periods || gateway.commission_periods.length === 0) {
      switch (gateway.commission_type) {
        case 'percentage':
          return amount * (gateway.commission_percentage || 0) / 100;
        case 'fixed':
          return gateway.commission_fixed || 0;
        case 'mixed':
          const percentageCommission = amount * (gateway.commission_percentage || 0) / 100;
          const fixedCommission = gateway.commission_fixed || 0;
          return percentageCommission + fixedCommission;
        default:
          return 0;
      }
    }

    // Buscar el período que corresponde a la fecha de transacción
    const transactionDateObj = new Date(transactionDate);
    const applicablePeriod = gateway.commission_periods.find((period: any) => {
      const startDate = new Date(period.start_date);
      const endDate = new Date(period.end_date);
      return transactionDateObj >= startDate && transactionDateObj <= endDate;
    });

    if (!applicablePeriod) {
      // Si no hay período aplicable, usar comisión estándar
      return amount * (gateway.commission_percentage || 0) / 100 + (gateway.commission_fixed || 0);
    }

    // Calcular comisión del período aplicable
    const percentageCommission = amount * (applicablePeriod.percentage || 0) / 100;
    const fixedCommission = applicablePeriod.fixed || 0;
    return percentageCommission + fixedCommission;

  } catch (error) {
    console.error('Error calculating intelligent commission:', error);
    return 0;
  }
};

// Helper para obtener estadísticas de comisiones por gateway
export const getCommissionStatsByGateway = async () => {
  try {
    const [receipts, gateways] = await Promise.all([
      getAllReceipts(),
      getAllPaymentGateways()
    ]);

    const commissionStats = gateways.map(gateway => {
      const gatewayReceipts = receipts.filter(r => r.gateway_name === gateway.name);
      
      let totalCommissions = 0;
      let totalVolume = 0;
      let transactionCount = 0;

      gatewayReceipts.forEach(receipt => {
        const commission = calculateIntelligentCommission(
          gateway,
          receipt.amount,
          receipt.payment_date || receipt.created_at
        );
        totalCommissions += commission;
        totalVolume += receipt.amount;
        transactionCount++;
      });

      return {
        gateway_id: gateway.id,
        gateway_name: gateway.name,
        gateway_type: gateway.type,
        total_commissions: totalCommissions,
        total_volume: totalVolume,
        transaction_count: transactionCount,
        avg_commission_rate: totalVolume > 0 ? (totalCommissions / totalVolume) * 100 : 0,
        status: gateway.status,
        current_percentage: gateway.commission_percentage || 0,
        current_fixed: gateway.commission_fixed || 0
      };
    });

    return commissionStats;
  } catch (error) {
    console.error('Error getting commission stats by gateway:', error);
    return [];
  }
};

// Helper para eliminar documento
export const removeFile = async (documentId: string) => {
  try {
    if (!documentId) {
      throw new Error('Document ID is required');
    }

    const { error } = await supabaseClient
      .from('documentos')
      .delete()
      .eq('id', documentId);

    if (error) {
      throw new Error(`Error removing document: ${error.message}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error removing document:', error);
    throw error;
  }
};

// Helper para crear insight de IA
export const createAIInsight = async (insight: Partial<AIInsight>, actorUserId?: string) => {
  try {
    const { data, error } = await supabaseClient
      .from('ai_insights')
      .insert({
        ...insight,
        actor_user: actorUserId,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating AI insight: ${error.message}`);
    }
    
    return data;
  } catch (error) {
    console.error('Error creating AI insight:', error);
    throw error;
  }
};

// Helper para actualizar pasarela de pago
export const updatePaymentGateway = async (gatewayId: string, gatewayData: Partial<PaymentGateway>) => {
  try {
    // Filter out properties that don't exist in the payment_gateways schema
    const { 
      logo_base64, 
      color, 
      transactions, 
      volume, 
      commission_periods,
      ...validData 
    } = gatewayData;
    
    const { data, error } = await supabaseClient
      .from('payment_gateways')
      .update({
        ...validData,
        updated_at: new Date().toISOString()
      })
      .eq('id', gatewayId)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating payment gateway: ${error.message}`);
    }
    
    return data;
  } catch (error) {
    console.error('Error updating payment gateway:', error);
    throw error;
  }
};

// Helper para guardar logo de pasarela en la tabla correcta
export const savePaymentGatewayLogo = async (gatewayId: string, logoBase64: string) => {
  try {
    // Usar la tabla checkout_providers que sí tiene logo_base64
    const { data, error } = await supabaseClient
      .from('checkout_providers')
      .upsert({
        tenant_id: DEV_TENANT_ID,
        proveedor: 'custom', // Mapear según el tipo de gateway
        logo_base64: logoBase64,
        config: { gateway_id: gatewayId },
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error saving gateway logo: ${error.message}`);
    }
    
    return data;
  } catch (error) {
    console.error('Error saving gateway logo:', error);
    throw error;
  }
};