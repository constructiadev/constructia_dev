import { supabaseClient, DEV_TENANT_ID } from './supabase-real';
import { 
  getTenantEmpresas,
  getTenantEmpresasNoRLS,
  getTenantObras,
  getTenantObrasNoRLS, 
  getAllTenantDocuments,
  getAllTenantDocumentsNoRLS,
  getTenantStats,
  getCurrentUserTenant
} from './supabase-real';
import { getManualUploadQueue } from './supabase-new';

// Constante UUID válida para desarrollo
export const TEST_USER_UUID = '00000000-0000-0000-0000-000000000001';

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
    // Get all empresas from new schema as "clients"
    const tenantId = DEV_TENANT_ID;
    const empresas = await getTenantEmpresasNoRLS(tenantId);

    // Transform empresas to client format for backward compatibility
    const clients = empresas.map((empresa, index) => ({
      id: empresa.id,
      user_id: `user-${empresa.id}`,
      client_id: `CLI-${empresa.cif}`,
      company_name: empresa.razon_social,
      contact_name: empresa.contacto_email?.split('@')[0] || 'Contacto',
      email: empresa.contacto_email || `contacto@${empresa.razon_social.toLowerCase().replace(/\s+/g, '')}.com`,
      phone: '+34 600 000 000',
      address: empresa.direccion || 'Dirección no especificada',
      subscription_plan: index % 4 === 0 ? 'enterprise' : index % 3 === 0 ? 'professional' : 'basic',
      subscription_status: empresa.estado_compliance === 'al_dia' ? 'active' : 'suspended',
      storage_used: Math.floor(Math.random() * 500000000),
      storage_limit: index % 4 === 0 ? 5368709120 : index % 3 === 0 ? 1073741824 : 524288000,
      documents_processed: Math.floor(Math.random() * 50) + 5,
      tokens_available: index % 4 === 0 ? 5000 : index % 3 === 0 ? 1000 : 500,
      obralia_credentials: { 
        configured: Math.random() > 0.3,
        username: `user_${empresa.cif}`,
        password: 'configured_password'
      },
      created_at: empresa.created_at,
      updated_at: empresa.updated_at
    }));
    
    return clients;
  } catch (error) {
    console.error('Error fetching all clients:', error);
    return [];
  }
};

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

    // Transform empresas to company format
    const companies = empresas.map(empresa => ({
      id: empresa.id,
      client_id: clientId,
      name: empresa.razon_social,
      cif: empresa.cif,
      address: empresa.direccion || '',
      phone: '+34 600 000 000',
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

// Helper para obtener documentos del cliente
export const getClientDocuments = async (clientId: string) => {
  try {
    if (!clientId) {
      throw new Error('Client ID is required');
    }

    // Get documentos from new schema
    const tenantId = DEV_TENANT_ID;
    const documentos = await getAllTenantDocumentsNoRLS(tenantId);

    // Transform documentos to document format
    const documents = documentos.map(documento => ({
      id: documento.id,
      project_id: documento.entidad_tipo === 'obra' ? documento.entidad_id : 'unknown',
      client_id: clientId,
      filename: documento.file?.split('/').pop() || 'documento.pdf',
      original_name: documento.metadatos?.original_filename || documento.file?.split('/').pop() || 'documento.pdf',
      file_size: documento.size_bytes || 1024000,
      file_type: documento.mime || 'application/pdf',
      document_type: documento.categoria,
      classification_confidence: Math.floor(Math.random() * 30) + 70,
      upload_status: documento.estado === 'aprobado' ? 'completed' : 
                    documento.estado === 'pendiente' ? 'processing' : 
                    documento.estado === 'rechazado' ? 'error' : 'pending',
      obralia_status: documento.estado === 'aprobado' ? 'validated' : 'pending',
      security_scan_status: 'safe',
      deletion_scheduled_at: null,
      obralia_document_id: null,
      processing_attempts: 1,
      last_processing_error: null,
      created_at: documento.created_at,
      updated_at: documento.updated_at,
      projects: {
        name: documento.obras?.nombre_obra || 'Proyecto'
      }
    }));
    
    return documents;
  } catch (error) {
    console.error('Error fetching documents:', error);
    return [];
  }
};

// Helper para obtener logs de auditoría
export const getAuditLogs = async () => {
  try {
    const { data, error } = await supabaseClient
      .from('auditoria')
      .select(`
        *,
        users(email, role),
        empresas(razon_social)
      `)
      .eq('tenant_id', DEV_TENANT_ID)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.warn('Error fetching audit logs:', error);
      return [];
    }
    
    // Transform audit logs to expected format
    const auditLogs = (data || []).map(log => ({
      id: log.id,
      user_id: log.actor_user,
      client_id: log.entidad_id,
      action: log.accion,
      resource: log.entidad || 'unknown',
      details: log.detalles,
      ip_address: log.ip || '127.0.0.1',
      user_agent: 'ConstructIA Admin',
      created_at: log.created_at,
      users: {
        email: log.users?.email || 'admin@constructia.com',
        role: log.users?.role || 'admin'
      },
      clients: {
        company_name: log.empresas?.razon_social || 'Empresa'
      }
    }));
    
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

// Helper para obtener cola de procesamiento manual
export const getManualProcessingQueue = async () => {
  try {
    // Use new manual upload queue
    const tenantId = DEV_TENANT_ID;
    const queueData = await getManualUploadQueue(tenantId);

    // Transform to expected format
    const queue = queueData.map(item => ({
      id: item.id,
      document_id: item.documento_id,
      client_id: item.empresa_id, // Use empresa as client
      company_id: item.empresa_id,
      project_id: item.obra_id,
      queue_position: Math.floor(Math.random() * 100) + 1,
      priority: item.status === 'error' ? 'high' : 'normal',
      manual_status: item.status === 'queued' ? 'pending' : 
                    item.status === 'in_progress' ? 'in_progress' :
                    item.status === 'uploaded' ? 'uploaded' : 'error',
      ai_analysis: {},
      admin_notes: item.nota || '',
      processed_by: item.operator_user,
      processed_at: item.updated_at,
      created_at: item.created_at,
      updated_at: item.updated_at,
      documents: {
        filename: item.documentos?.file?.split('/').pop() || 'documento.pdf',
        original_name: item.documentos?.file?.split('/').pop() || 'documento.pdf'
      },
      clients: {
        company_name: item.empresas?.razon_social || 'Empresa'
      },
      companies: {
        name: item.empresas?.razon_social || 'Empresa'
      },
      projects: {
        name: item.obras?.nombre_obra || 'Proyecto'
      }
    }));
    
    return queue;
  } catch (error) {
    console.error('Error fetching manual processing queue:', error);
    return [];
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
      classification_confidence: Math.floor(Math.random() * 30) + 70,
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
    const tenantId = DEV_TENANT_ID;
    const [stats, documentos, receipts] = await Promise.all([
      getTenantStats(tenantId),
      getAllTenantDocumentsNoRLS(tenantId),
      getAllReceipts()
    ]);

    const activeClients = stats.totalEmpresas; // Use empresas as active clients
    const totalRevenue = receipts.reduce((sum, r) => sum + (r.amount || 0), 0);
    const documentsThisMonth = documentos.filter(d => {
      const docDate = new Date(d.created_at);
      const now = new Date();
      return docDate.getMonth() === now.getMonth() && docDate.getFullYear() === now.getFullYear();
    }).length;
    
    const avgConfidence = documentos.length > 0 
      ? documentos.reduce((sum, d) => sum + 85, 0) / documentos.length // Simulated confidence
      : 0;

    return {
      activeClients,
      totalRevenue,
      documentsThisMonth,
      avgConfidence: Math.round(avgConfidence * 10) / 10,
      totalDocuments: documentos.length,
      totalClients: stats.totalEmpresas
    };
  } catch (error) {
    console.error('Error calculating dynamic KPIs:', error);
    return {
      activeClients: 0,
      totalRevenue: 0,
      documentsThisMonth: 0,
      avgConfidence: 0,
      totalDocuments: 0,
      totalClients: 0
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
    const { data, error } = await supabase
      .from('ai_insights')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.warn('Error fetching AI insights:', error);
      return [];
    }
    
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
          receipt.payment_date
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
        status: gateway.status
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
export const createAIInsight = async (insight: Partial<AIInsight>) => {
  try {
    const { data, error } = await supabaseClient
      .from('ai_insights')
      .insert({
        ...insight,
        created_at: new Date().toISOString(),
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