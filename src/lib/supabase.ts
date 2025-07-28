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
export const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// Helper para llamadas a Gemini AI
export const callGeminiAI = async (prompt: string) => {
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
    console.error('Error calling Gemini AI:', error);
    throw error;
  }
};
// Helper para actualizar credenciales de Obralia del cliente
export const updateClientObraliaCredentials = async (
  clientId: string, 
  credentials: { username: string; password: string }
) => {
  try {
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
