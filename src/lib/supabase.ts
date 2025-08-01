import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
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
    const { data, error } = await supabase
      .from('clients')
      .select(`
        *,
        users!inner(email, role)
      `)
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
        users!inner(email, role),
        clients(company_name)
      `)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      throw new Error(`Error fetching audit logs: ${error.message}`);
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    throw error;
  }
};

// Helper para guardar mandato SEPA
export const saveSEPAMandate = async (mandateData: any) => {
  try {
    const { data, error } = await supabase
      .from('sepa_mandates')
      .insert(mandateData)
      .select()
      .single();

    if (error) {
      throw new Error(`Error saving SEPA mandate: ${error.message}`);
    }
    
    return data;
  } catch (error) {
    console.error('Error saving SEPA mandate:', error);
    throw error;
  }
};

// Helper para obtener mandatos SEPA de un cliente
export const getClientSEPAMandates = async (clientId: string) => {
  try {
    if (!clientId) {
      throw new Error('Client ID is required');
    }

    const { data, error } = await supabase
      .from('sepa_mandates')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error getting SEPA mandates: ${error.message}`);
    }
    
    return data || [];
  } catch (error) {
    console.error('Error getting SEPA mandates:', error);
    throw error;
  }
};

// Helper para generar número de recibo único
export const generateReceiptNumber = () => {
  const year = new Date().getFullYear();
  const timestamp = Date.now().toString().slice(-6);
  return `REC-${year}-${timestamp}`;
};

// Helper para calcular impuestos (21% IVA)
export const calculateTaxes = (amount: number, taxRate: number = 21) => {
  const baseAmount = amount / (1 + taxRate / 100);
  const taxAmount = amount - baseAmount;
  
  return {
    baseAmount: Math.round(baseAmount * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    totalAmount: amount
  };
};

// Helper para crear recibo
export const createReceipt = async (receiptData: {
  clientId: string;
  amount: number;
  paymentMethod: string;
  gatewayName: string;
  description: string;
  transactionId: string;
  invoiceItems: any[];
  clientDetails: any;
}) => {
  try {
    const receiptNumber = generateReceiptNumber();
    const taxes = calculateTaxes(receiptData.amount);
    
    const receipt = {
      receipt_number: receiptNumber,
      client_id: receiptData.clientId,
      amount: receiptData.amount,
      base_amount: taxes.baseAmount,
      tax_amount: taxes.taxAmount,
      tax_rate: 21,
      currency: 'EUR',
      payment_method: receiptData.paymentMethod,
      gateway_name: receiptData.gatewayName,
      description: receiptData.description,
      transaction_id: receiptData.transactionId,
      invoice_items: receiptData.invoiceItems,
      client_details: receiptData.clientDetails,
      status: 'paid'
    };

    const { data, error } = await supabase
      .from('receipts')
      .insert(receipt)
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating receipt: ${error.message}`);
    }
    
    return data;
  } catch (error) {
    console.error('Error creating receipt:', error);
    throw error;
  }
};

// Helper para obtener recibos de un cliente
export const getClientReceipts = async (clientId: string) => {
  try {
    if (!clientId) {
      throw new Error('Client ID is required');
    }

    const { data, error } = await supabase
      .from('receipts')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error getting client receipts: ${error.message}`);
    }
    
    return data || [];
  } catch (error) {
    console.error('Error getting client receipts:', error);
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
        clients!inner(
          company_name,
          contact_name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error getting all receipts: ${error.message}`);
    }
    
    return data || [];
  } catch (error) {
    console.error('Error getting all receipts:', error);
    throw error;
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
      throw new Error(`Error fetching KPIs: ${error.message}`);
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching KPIs:', error);
    throw error;
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
      throw new Error(`Error fetching payment gateways: ${error.message}`);
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching payment gateways:', error);
    throw error;
  }
};

// Helper para obtener integraciones de API (datos estáticos)
export const getAPIIntegrations = async () => {
  try {
    // Datos simulados sin llamadas externas
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
      },
      {
        id: '3',
        name: 'Procesamiento Local',
        status: 'connected',
        description: 'Clasificación de documentos local',
        requests_today: 456,
        avg_response_time_ms: 123,
        last_sync: new Date().toISOString(),
        config_details: { 
          local_processing: true, 
          cache_enabled: true,
          queue_size: 10
        }
      }
    ];
  } catch (error) {
    console.error('Error fetching API integrations:', error);
    throw error;
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
      throw new Error(`Error fetching manual processing queue: ${error.message}`);
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching manual processing queue:', error);
    throw error;
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
      throw new Error(`Error fetching system settings: ${error.message}`);
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching system settings:', error);
    throw error;
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

// Helper para obtener estadísticas de ingresos
export const getRevenueStats = async () => {
  try {
    const { data, error } = await supabase
      .from('receipts')
      .select('amount, payment_date, gateway_name, status')
      .eq('status', 'paid')
      .order('payment_date', { ascending: false });

    if (error) {
      throw new Error(`Error fetching revenue stats: ${error.message}`);
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching revenue stats:', error);
    throw error;
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
      throw new Error(`Error fetching client stats: ${error.message}`);
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching client stats:', error);
    throw error;
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
      throw new Error(`Error fetching document stats: ${error.message}`);
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching document stats:', error);
    throw error;
  }
};

// Helper para obtener estadísticas de pagos
export const getPaymentStats = async () => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('amount, payment_method, payment_status, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching payment stats: ${error.message}`);
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    throw error;
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
    throw error;
  }
};

// Helper para simular envío de email
export const sendReceiptByEmail = async (receiptId: string, clientEmail: string) => {
  try {
    // Simular envío de email sin llamadas externas
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`Recibo ${receiptId} enviado a ${clientEmail}`);
    
    return { success: true, message: 'Recibo enviado exitosamente' };
  } catch (error) {
    console.error('Error sending receipt email:', error);
    throw error;
  }
};