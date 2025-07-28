import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Buscar documentos programados para eliminación
    const { data: documentsToDelete, error } = await supabaseClient
      .from('documents')
      .select('*')
      .lte('deletion_scheduled_at', new Date().toISOString())
      .eq('obralia_status', 'validated')

    if (error) throw error

    let deletedCount = 0
    let errorCount = 0

    for (const document of documentsToDelete || []) {
      try {
        // 1. Eliminar archivo del storage
        const { error: storageError } = await supabaseClient.storage
          .from('documents')
          .remove([document.filename])

        if (storageError) {
          console.error(`Error deleting file ${document.filename}:`, storageError)
          errorCount++
          continue
        }

        // 2. Actualizar estado del documento
        await supabaseClient
          .from('documents')
          .update({ 
            upload_status: 'completed',
            deletion_scheduled_at: null
          })
          .eq('id', document.id)

        // 3. Registrar en audit log
        await supabaseClient
          .from('audit_logs')
          .insert({
            user_id: 'system',
            client_id: document.client_id,
            action: 'DOCUMENT_DELETED_CLEANUP',
            details: `Documento ${document.filename} eliminado tras validación en Obralia`,
            ip_address: '127.0.0.1',
            user_agent: 'ConstructIA-Cleanup/1.0'
          })

        deletedCount++

      } catch (docError) {
        console.error(`Error processing document ${document.id}:`, docError)
        errorCount++
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        deleted_count: deletedCount,
        error_count: errorCount,
        message: `Limpieza completada: ${deletedCount} documentos eliminados, ${errorCount} errores`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in cleanup function:', error)
    
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