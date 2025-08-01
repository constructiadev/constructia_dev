import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Read environment variables from .env file
const envPath = path.resolve('.env');
let supabaseUrl = '';
let supabaseServiceKey = '';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envLines = envContent.split('\n');
  
  for (const line of envLines) {
    if (line.startsWith('VITE_SUPABASE_URL=')) {
      supabaseUrl = line.split('=')[1]?.trim() || '';
    }
    if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
      supabaseServiceKey = line.split('=')[1]?.trim() || '';
    }
  }
}

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables in .env file:');
  console.error('- VITE_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nPlease add these to your .env file');
  process.exit(1);
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
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

// Helper para obtener integraciones de API
export const getAPIIntegrations = async () => {
  try {
    // Datos simulados ya que no existe la tabla api_integrations
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
      },
      {
        id: '3',
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
        id: '4',
        name: 'Stripe Payments',
        status: 'connected',
        description: 'Procesamiento de pagos',
        requests_today: 156,
        avg_response_time_ms: 234,
        last_sync: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        config_details: { 
          webhook_configured: true, 
          live_mode: true,
          api_version: '2023-10-16'
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
    // Simular envío de email
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log(`Recibo ${receiptId} enviado a ${clientEmail}`);
    
    return { success: true, message: 'Recibo enviado exitosamente' };
  } catch (error) {
    console.error('Error sending receipt email:', error);
    throw error;
  }
};

const testUsers = [
  {
    email: 'admin@constructia.com',
    password: 'superadmin123',
    role: 'admin'
  },
  {
    email: 'juan@construccionesgarcia.com',
    password: 'password123',
    role: 'client',
    clientData: {
      company_name: 'Construcciones García S.L.',
      contact_name: 'Juan García',
      phone: '+34 666 123 456',
      address: 'Calle Mayor 123, 28001 Madrid',
      tax_id: 'B12345678',
      subscription_plan: 'professional',
      subscription_status: 'active',
      storage_limit: 10737418240, // 10GB
      storage_used: 2147483648,   // 2GB
      obralia_credentials: {
        username: '',
        password: '',
        configured: false
      }
    }
  }
];

async function createTestUsers() {
  console.log('🚀 Creating test users...\n');

  for (const testUser of testUsers) {
    console.log(`👤 Creating user: ${testUser.email}`);
    
    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: testUser.email,
        password: testUser.password,
        email_confirm: true
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          console.log(`   ⚠️  User already exists: ${testUser.email}`);
          
          // Get existing user
          const { data: existingUsers } = await supabase.auth.admin.listUsers();
          const existingUser = existingUsers.users.find(u => u.email === testUser.email);
          
          if (existingUser) {
            await createUserProfile(existingUser.id, testUser);
          }
          continue;
        } else {
          throw authError;
        }
      }

      if (authData.user) {
        console.log(`   ✅ Auth user created: ${authData.user.id}`);
        await createUserProfile(authData.user.id, testUser);
      }

    } catch (error) {
      console.error(`   ❌ Error creating user ${testUser.email}:`, error.message);
    }
  }
}

async function createUserProfile(userId, testUser) {
  try {
    // 2. Create user profile
    const { error: userError } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email: testUser.email,
        role: testUser.role
      }, {
        onConflict: 'id'
      });

    if (userError) {
      console.log(`   ⚠️  User profile might already exist: ${userError.message}`);
    } else {
      console.log(`   ✅ User profile created`);
    }

    // 3. Create client record if it's a client user
    if (testUser.role === 'client' && testUser.clientData) {
      const clientId = `CLI-${userId.substring(0, 8).toUpperCase()}`;
      
      const { error: clientError } = await supabase
        .from('clients')
        .upsert({
          user_id: userId,
          client_id: clientId,
          ...testUser.clientData
        }, {
          onConflict: 'user_id'
        });

      if (clientError) {
        console.log(`   ⚠️  Client profile might already exist: ${clientError.message}`);
      } else {
        console.log(`   ✅ Client profile created: ${clientId}`);
      }
    }

    console.log('');
  } catch (error) {
    console.error(`   ❌ Error creating profile:`, error.message);
  }
}

// Run the script
createTestUsers().catch(console.error).finally(() => {
  console.log('\n✨ You can now login with:');
  console.log('👤 Admin: admin@constructia.com / superadmin123');
  console.log('👤 Client: juan@construccionesgarcia.com / password123');
  process.exit(0);
});