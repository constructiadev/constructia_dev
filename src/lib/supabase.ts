import { createClient } from '@supabase/supabase-js';

// Constante UUID válida para desarrollo
export const TEST_USER_UUID = '00000000-0000-0000-0000-000000000001';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Verificar que las variables de entorno estén configuradas
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase configuration missing. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'Content-Type': 'application/json'
    }
  }
});

// Helper para obtener datos del cliente actual
export const getCurrentClientData = async (userId: string) => {
  console.log('🔍 [Supabase] getCurrentClientData called with userId:', userId);
  
  try {
    if (!userId) {
      console.error('❌ [Supabase] No userId provided to getCurrentClientData');
      return null;
    }

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('⚠️ [Supabase] Client data not found for user:', userId);
        return null;
      }
      console.error('❌ [Supabase] Database error:', error);
      return null;
    }
    
    console.log('✅ [Supabase] Client data retrieved successfully:', data?.company_name);
    return data;
  } catch (error) {
    console.error('❌ [Supabase] Error getting client data:', error);
    return null;
  }
};

// Helper para obtener todos los clientes (admin)
export const getAllClients = async () => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching all clients: ${error.message}`);
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching all clients:', error);
    throw error;
  }
};

// Helper para obtener proyectos del cliente
export const getClientProjects = async (clientId: string) => {
  try {
    if (!clientId) {
      throw new Error('Client ID is required');
    }

    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        companies!inner(name)
      `)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching projects: ${error.message}`);
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
};

// Helper para obtener empresas del cliente
export const getClientCompanies = async (clientId: string) => {
  try {
    if (!clientId) {
      throw new Error('Client ID is required');
    }

    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching companies: ${error.message}`);
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching companies:', error);
    throw error;
  }
};

// Helper para obtener documentos del cliente
export const getClientDocuments = async (clientId: string) => {
  try {
    if (!clientId) {
      throw new Error('Client ID is required');
    }

    const { data, error } = await supabase
      .from('documents')
      .select(`
        *,
        projects(name),
        companies(name)
      `)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching documents: ${error.message}`);
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching documents:', error);
    throw error;
  }
};

// Helper para obtener logs de auditoría
export const getAuditLogs = async () => {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select(`
        *,
        users(email, role),
        clients(company_name)
      `)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.warn('Error fetching audit logs:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return [];
  }
};

// Helper para obtener KPIs del sistema
export const getKPIs = async () => {
  try {
    const { data, error } = await supabase
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
    const { data, error } = await supabase
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
    const { data, error } = await supabase
      .from('manual_document_queue')
      .select(`
        *,
        documents(filename, original_name),
        clients(company_name),
        companies(name),
        projects(name)
      `)
      .order('queue_position', { ascending: true });

    if (error) {
      console.warn('Error fetching manual processing queue:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching manual processing queue:', error);
    return [];
  }
};

// Helper para obtener configuraciones del sistema
export const getSystemSettings = async () => {
  try {
    const { data, error } = await supabase
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
    const { data, error } = await supabase
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
    const { data, error } = await supabase
      .from('receipts')
      .select(`
        *,
        clients(
          company_name,
          contact_name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error getting all receipts:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error getting all receipts:', error);
    return [];
  }
};

// Helper para obtener estadísticas de clientes
export const getClientStats = async () => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('subscription_plan, subscription_status, created_at, storage_used, storage_limit')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching client stats:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching client stats:', error);
    return [];
  }
};

// Helper para obtener estadísticas de documentos
export const getDocumentStats = async () => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('document_type, upload_status, classification_confidence, created_at, file_size')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching document stats:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching document stats:', error);
    return [];
  }
};

// Helper para calcular KPIs dinámicamente
export const calculateDynamicKPIs = async () => {
  try {
    const [clients, documents, receipts] = await Promise.all([
      getClientStats(),
      getDocumentStats(),
      getAllReceipts()
    ]);

    const activeClients = clients.filter(c => c.subscription_status === 'active').length;
    const totalRevenue = receipts.reduce((sum, r) => sum + (r.amount || 0), 0);
    const documentsThisMonth = documents.filter(d => {
      const docDate = new Date(d.created_at);
      const now = new Date();
      return docDate.getMonth() === now.getMonth() && docDate.getFullYear() === now.getFullYear();
    }).length;
    
    const avgConfidence = documents.length > 0 
      ? documents.reduce((sum, d) => sum + (d.classification_confidence || 0), 0) / documents.length 
      : 0;

    return {
      activeClients,
      totalRevenue,
      documentsThisMonth,
      avgConfidence: Math.round(avgConfidence * 10) / 10,
      totalDocuments: documents.length,
      totalClients: clients.length
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
export const updateClientObraliaCredentials = async (clientId: string, credentials: { username: string; password: string }) => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .update({
        obralia_credentials: {
          configured: true,
          username: credentials.username,
          password: credentials.password
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', clientId)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating Obralia credentials: ${error.message}`);
    }
    
    return data;
  } catch (error) {
    console.error('Error updating Obralia credentials:', error);
    throw error;
  }
};

// Helper para obtener estadísticas de ingresos
export const getRevenueStats = async () => {
  try {
    const { data, error } = await supabase
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
    // Crear usuario de prueba primero para satisfacer la foreign key constraint
    const { error: userError } = await supabase
      .from('users')
      .upsert({
        id: TEST_USER_UUID,
        email: 'test@construccionesgarcia.com',
        role: 'client'
      });

    if (userError) {
      console.warn('Error creating test user:', userError);
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

// Helper para crear insight de IA
export const createAIInsight = async (insight: Partial<AIInsight>) => {
  try {
    const { data, error } = await supabase
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