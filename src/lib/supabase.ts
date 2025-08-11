import { createClient } from '@supabase/supabase-js';

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
  }
});

// Helper para actualizar credenciales de Obralia del cliente
export const updateClientObraliaCredentials = async (
  clientId: string, 
  credentials: { username: string; password: string }
) => {
  try {
    if (!clientId) {
      throw new Error('Client ID is required');
    }

    const { data, error } = await supabase
      .from('clients')
      .update({
        obralia_credentials: {
          username: credentials.username,
          password: credentials.password,
          configured: true
        }
      })
      .eq('id', clientId)
      .select();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    if (!data || data.length === 0) {
      throw new Error('No data returned from update operation. Client may not exist.');
    }

    return data[0];
  } catch (error) {
    console.error('Error updating Obralia credentials:', error);
    throw error;
  }
};

// Helper para obtener datos del cliente actual
export const getCurrentClientData = async (userId: string) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      throw new Error(`Error fetching client data: ${error.message}`);
    }
    
    return data;
  } catch (error) {
    console.error('Error getting client data:', error);
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

// Helper para obtener todos los clientes (admin)
export const getAllClients = async () => {
  try {
    // Usar service role para acceso directo sin autenticación
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