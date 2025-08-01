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

// Configuración de la API de Gemini
export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
export const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// Helper para llamadas a Gemini AI
export const callGeminiAI = async (prompt: string, maxRetries: number = 5) => {
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await attemptGeminiCall(prompt);
    } catch (error) {
      const isRetryableError = error instanceof Error && 
        error.message.includes('503');
      
      if (isRetryableError && attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff: 1s, 2s, 4s
        console.warn(`Gemini AI overloaded (attempt ${attempt + 1}/${maxRetries + 1}). Retrying in ${delay}ms...`);
        await sleep(delay);
        continue;
      }
      
      // If not retryable or max retries reached, throw the error
      throw error;
    }
  }
};

const attemptGeminiCall = async (prompt: string) => {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your .env file.');
    }

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      let errorMessage = `Gemini AI Error (${response.status})`;
      
      try {
        const errorData = await response.json();
        if (errorData.error && errorData.error.message) {
          errorMessage += `: ${errorData.error.message}`;
        } else if (errorData.message) {
          errorMessage += `: ${errorData.message}`;
        } else if (response.statusText) {
          errorMessage += `: ${response.statusText}`;
        }
      } catch (parseError) {
        // If we can't parse the error response, use status text or generic message
        if (response.statusText) {
          errorMessage += `: ${response.statusText}`;
        } else {
          errorMessage += ': Unknown error occurred';
        }
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data.candidates[0]?.content?.parts[0]?.text || '';
  } catch (error) {
    // Use warn for transient 503 errors, error for others
    if (error instanceof Error && error.message.includes('503')) {
      console.warn('Gemini AI temporarily overloaded:', error.message);
    }
    throw error;
  }
};
// Helper para actualizar credenciales de Obralia del cliente
export const updateClientObraliaCredentials = async (
  clientId: string, 
  credentials: { username: string; password: string }
) => {
  try {
    // Validar que clientId no sea null o undefined
    if (!clientId) {
      throw new Error('Client ID is required');
    }

    console.log('Updating Obralia credentials for client:', clientId);
    console.log('Credentials data:', { username: credentials.username, password: '[HIDDEN]' });

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
      console.error('Supabase error details:', error);
      throw new Error(`Database error: ${error.message} (Code: ${error.code})`);
    }

    if (!data || data.length === 0) {
      throw new Error('No data returned from update operation. Client may not exist.');
    }

    console.log('Successfully updated Obralia credentials');
    return data[0];
  } catch (error) {
    console.error('Error updating Obralia credentials:', error);
    throw error;
  }
};

// Helper para obtener datos del cliente actual
export const getCurrentClientData = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
};

// Helper para obtener empresas del cliente
export const getClientCompanies = async (clientId: string) => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select(`
        *,
        projects(count),
        documents(count)
      `)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching companies:', error);
    throw error;
  }
};

// Helper para obtener documentos del cliente
export const getClientDocuments = async (clientId: string) => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select(`
        *,
        projects!inner(name),
        companies!inner(name)
      `)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
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

    if (error) throw error;
    return data;
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

      {/* Ruta 404 */}
      <Route path="*" element={<Navigate to="/landing" replace />} />
    </Routes>
  }
}

// Helper para guardar mandato SEPA
export const saveSEPAMandate = async (mandateData: any) => {
  try {
    const { data, error } = await supabase
      .from('sepa_mandates')
      .insert(mandateData)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving SEPA mandate:', error);
    throw error;
  }
};

// Helper para obtener mandatos SEPA de un cliente
export const getClientSEPAMandates = async (clientId: string) => {
  try {
    const { data, error } = await supabase
      .from('sepa_mandates')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
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

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating receipt:', error);
    throw error;
  }
};

// Helper para obtener recibos de un cliente
export const getClientReceipts = async (clientId: string) => {
  try {
    const { data, error } = await supabase
      .from('receipts')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
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

    if (error) throw error;
    return data;
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

    if (error) throw error;
    return data;
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

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching payment gateways:', error);
    throw error;
  }
};

// Helper para obtener eventos fiscales
export const getFiscalEvents = async () => {
  try {
    // Como no existe la tabla fiscal_events, simularemos datos
    return [
      {
        id: '1',
        title: 'Declaración IVA Q4 2024',
        event_date: '2025-01-30',
        amount_estimate: 5670.00,
        status: 'upcoming',
        description: 'Estimado: €5,670'
      },
      {
        id: '2',
        title: 'Retenciones IRPF',
        event_date: '2025-02-15',
        amount_estimate: 2340.00,
        status: 'upcoming',
        description: 'Estimado: €2,340'
      }
    ];
  } catch (error) {
    console.error('Error fetching fiscal events:', error);
    throw error;
  }
};

// Helper para obtener planes de suscripción
export const getSubscriptionPlans = async () => {
  try {
    // Como no existe la tabla subscription_plans, retornamos datos estáticos
    return [
      {
        id: 'basic',
        name: 'Básico',
        price_monthly: 59.00,
        price_yearly: 590.00,
        features: [
          'Hasta 100 documentos/mes',
          '500MB de almacenamiento',
          'Clasificación IA básica',
          'Integración Obralia',
          'Soporte por email'
        ],
        storage_mb: 500,
        tokens_per_month: 500,
        documents_per_month: '100/mes',
        support_level: 'Email',
        popular: false
      },
      {
        id: 'professional',
        name: 'Profesional',
        price_monthly: 149.00,
        price_yearly: 1490.00,
        features: [
          'Hasta 500 documentos/mes',
          '1GB de almacenamiento',
          'IA avanzada con 95% precisión',
          'Integración Obralia completa',
          'Dashboard personalizado',
          'Soporte prioritario'
        ],
        storage_mb: 1024,
        tokens_per_month: 1000,
        documents_per_month: '500/mes',
        support_level: 'Prioritario',
        popular: true
      },
      {
        id: 'enterprise',
        name: 'Empresarial',
        price_monthly: 299.00,
        price_yearly: 2990.00,
        features: [
          'Documentos ilimitados',
          '5GB de almacenamiento',
          'IA premium con análisis predictivo',
          'API personalizada',
          'Múltiples usuarios',
          'Soporte 24/7'
        ],
        storage_mb: 5120,
        tokens_per_month: 5000,
        documents_per_month: 'Ilimitados',
        support_level: '24/7',
        popular: false
      }
    ];
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    throw error;
  }
};

// Helper para obtener integraciones de API
export const getAPIIntegrations = async () => {
  try {
    // Como no existe la tabla api_integrations, simularemos datos
    return [
      {
        id: '1',
        name: 'Gemini AI',
        status: 'connected',
        description: 'Integración con la API de Gemini para IA',
        requests_today: 8947,
        avg_response_time_ms: 234,
        last_sync: new Date().toISOString(),
        config_details: { 
          api_key_configured: true, 
          model: 'gemini-pro',
          rate_limit: 50000
        }
      },
      {
        id: '2',
        name: 'Obralia/Nalanda',
        status: 'warning',
        description: 'Integración con la plataforma Obralia/Nalanda',
        requests_today: 234,
        avg_response_time_ms: 567,
        last_sync: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        config_details: { 
          api_key_configured: false, 
          webhook_configured: true,
          timeout: 30000
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

    if (error) throw error;
    return data;
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

    if (error) throw error;
    return data;
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

    if (error) throw error;
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

    if (error) throw error;
    return data;
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

    if (error) throw error;
    return data;
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

    if (error) throw error;
    return data;
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

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    throw error;
  }
};

    console.error('Error getting client data:', error);
    throw error;
  } catch (error) {
    console.error('Error calculating dynamic KPIs:', error);
    throw error;
  }
};

// Helper para obtener proyectos del cliente
export const getClientProjects = async (clientId: string) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        companies!inner(name),
        documents(count)
      `)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
};

// Helper para obtener empresas del cliente
export const getClientCompanies = async (clientId: string) => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select(`
        *,
        projects(count),
        documents(count)
      `)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching companies:', error);
    throw error;
  }
};

// Helper para obtener documentos del cliente
export const getClientDocuments = async (clientId: string) => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select(`
        *,
        projects!inner(name),
        companies!inner(name)
      `)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
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

    if (error) throw error;
    return data;
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

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching audit logs:', error);
        <Route path="documents" element={<Documents />} />
        <Route path="receipts" element={<ReceiptHistory />} />
        <Route path="metrics" element={<Metrics />} />
        <Route path="subscription" element={<Subscription />} />
        <Route path="settings" element={<Settings />} />
      </Route>

// Helper para simular envío de email
export const sendReceiptByEmail = async (receiptId: string, clientEmail: string) => {
  try {
    // Simular envío de email
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // En producción aquí iría la integración con servicio de email
    console.log(`Recibo ${receiptId} enviado a ${clientEmail}`);
    
    return { success: true, message: 'Recibo enviado exitosamente' };
  } catch (error) {
    console.error('Error sending receipt email:', error);
    throw error;
  }
};