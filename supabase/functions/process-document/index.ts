import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DocumentProcessRequest {
  document_id: string;
  client_id: string;
  file_path: string;
  classification?: string;
  confidence?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { document_id, client_id, file_path, classification, confidence }: DocumentProcessRequest = await req.json()

    // 1. Obtener credenciales de Obralia del cliente
    const { data: client, error: clientError } = await supabaseClient
      .from('clients')
      .select('obralia_credentials')
      .eq('id', client_id)
      .single()

    if (clientError || !client?.obralia_credentials?.configured) {
      throw new Error('Credenciales de Obralia no configuradas para este cliente')
    }

    // 2. Actualizar estado del documento a "uploading_obralia"
    await supabaseClient
      .from('documents')
      .update({ 
        upload_status: 'uploading_obralia',
        obralia_status: 'pending'
      })
      .eq('id', document_id)

    // 3. Simular llamada a API de Obralia (aquí iría la integración real)
    const obraliaResponse = await uploadToObralia({
      credentials: client.obralia_credentials,
      file_path,
      classification,
      confidence
    })

    // 4. Actualizar estado según respuesta de Obralia
    if (obraliaResponse.success) {
      await supabaseClient
        .from('documents')
        .update({ 
          upload_status: 'uploaded_to_obralia',
          obralia_status: 'uploaded',
          deletion_scheduled_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 días
        })
        .eq('id', document_id)

      // 5. Registrar en audit log
      await supabaseClient
        .from('audit_logs')
        .insert({
          user_id: 'system',
          client_id,
          action: 'DOCUMENT_UPLOADED_OBRALIA',
          details: `Documento ${document_id} subido exitosamente a Obralia`,
          ip_address: '127.0.0.1',
          user_agent: 'ConstructIA-EdgeFunction/1.0'
        })

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Documento procesado y subido a Obralia exitosamente',
          obralia_id: obraliaResponse.obralia_id
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    } else {
      throw new Error(obraliaResponse.error || 'Error desconocido en Obralia')
    }

  } catch (error) {
    console.error('Error processing document:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

// Función simulada para subir a Obralia
async function uploadToObralia({ credentials, file_path, classification, confidence }: any) {
  // Aquí iría la integración real con la API de Obralia/Nalanda
  // Por ahora simulamos una respuesta exitosa
  
  try {
    // Simular delay de API externa
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Simular respuesta exitosa (90% de las veces)
    if (Math.random() > 0.1) {
      return {
        success: true,
        obralia_id: `OBR_${Date.now()}`,
        message: 'Documento subido exitosamente'
      }
    } else {
      return {
        success: false,
        error: 'Error de conexión con Obralia'
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}