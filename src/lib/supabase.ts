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
      .select()
      .single();

    if (error) {
      console.error('Supabase error details:', error);
      throw new Error(`Database error: ${error.message} (Code: ${error.code})`);
    }

    if (!data) {
      throw new Error('No data returned from update operation. Client may not exist.');
    }

    console.log('Successfully updated Obralia credentials');
    return data;
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
      .maybeSingle();

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