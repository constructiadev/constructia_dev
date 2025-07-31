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
    // Handle development users with mock response
    if (clientId === 'dev-client-uuid-001' || clientId === 'dev-admin-uuid-001') {
      // Simulate successful update for development users
      return {
        id: clientId,
        obralia_credentials: {
          username: credentials.username,
          password: credentials.password,
          configured: true
        },
        updated_at: new Date().toISOString()
      };
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
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating Obralia credentials:', error);
    throw error;
  }
};

// Helper para obtener datos del cliente actual
export const getCurrentClientData = async (userId: string) => {
  try {
    // Handle development users with mock data
    if (userId === 'dev-client-001') {
      return {
        id: 'dev-client-uuid-001',
        user_id: 'dev-client-001',
        client_id: 'CLI-001',
        company_name: 'Empresa de Prueba S.L.',
        contact_name: 'Cliente de Prueba',
        email: 'cliente@test.com',
        phone: '+34 600 000 000',
        address: 'Calle Falsa 123, Madrid',
        subscription_plan: 'professional',
        subscription_status: 'active',
        storage_used: 1048576,
        storage_limit: 5368709120,
        documents_processed: 25,
        tokens_available: 750,
        obralia_credentials: {
          configured: false
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }

    if (userId === 'dev-admin-001') {
      return {
        id: 'dev-admin-uuid-001',
        user_id: 'dev-admin-001',
        client_id: 'ADM-001',
        company_name: 'Constructia Admin',
        contact_name: 'Administrador',
        email: 'admin@constructia.com',
        phone: '+34 900 000 000',
        address: 'Oficina Central, Madrid',
        subscription_plan: 'enterprise',
        subscription_status: 'active',
        storage_used: 0,
        storage_limit: 10737418240,
        documents_processed: 0,
        tokens_available: 1000,
        obralia_credentials: {
          configured: true,
          username: 'admin_obralia',
          password: 'admin_pass'
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting current client data:', error);
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