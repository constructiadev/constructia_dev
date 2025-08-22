// ConstructIA - Manejadores de Webhooks
import { supabaseNew, logAuditoria } from './supabase-new';
import { automationEngine } from './automation-engine';
import { appConfig, getPlatformConfig } from '../config/app-config';

export interface WebhookEvent {
  type: string;
  data: any;
  timestamp: string;
  signature?: string;
  traceId?: string;
}

export interface WebhookResponse {
  ok: boolean;
  message?: string;
  error?: string;
}

export class WebhookHandlers {
  // Webhook Nalanda
  static async handleNalandaWebhook(
    body: string,
    signature: string
  ): Promise<WebhookResponse> {
    try {
      // Verificar firma
      const config = getPlatformConfig('nalanda');
      const isValidSignature = this.verifyHMACSignature(
        body,
        signature,
        config.webhookSecret || ''
      );

      if (!isValidSignature) {
        console.error('❌ Invalid Nalanda webhook signature');
        return { ok: false, error: 'Invalid signature' };
      }

      const payload = JSON.parse(body);
      console.log('📥 Nalanda webhook received:', payload.type);

      // Buscar job por trace_id
      const { data: job, error: jobError } = await supabaseNew
        .from('jobs_integracion')
        .select('*')
        .eq('trace_id', payload.traceId)
        .single();

      if (jobError || !job) {
        console.error('❌ Job not found for trace_id:', payload.traceId);
        return { ok: false, error: 'Job not found' };
      }

      // Actualizar estado del job
      const newStatus = this.mapNalandaStatus(payload.status);
      
      const { error: updateError } = await supabaseNew
        .from('jobs_integracion')
        .update({
          estado: newStatus,
          respuesta: payload,
          updated_at: new Date().toISOString()
        })
        .eq('id', job.id);

      if (updateError) {
        console.error('❌ Error updating job:', updateError);
        return { ok: false, error: 'Error updating job' };
      }

      // Si fue rechazado, crear tarea de subsanación
      if (newStatus === 'rechazado') {
        const errors = payload.errors || [];
        const errorMessages = errors.map((e: any) => e.message).join('; ');

        await supabaseNew
          .from('tareas')
          .insert({
            tenant_id: job.tenant_id,
            tipo: 'subsanar',
            obra_id: job.obra_id,
            estado: 'abierta',
            comentarios: `Rechazado por Nalanda: ${errorMessages}`,
            vencimiento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            asignado_role: 'GestorDocumental'
          });

        // Enviar notificación
        await automationEngine.sendNotification(
          'task_assigned',
          ['role:GestorDocumental'],
          {
            tarea: {
              tipo: 'subsanar',
              comentarios: `Rechazado por Nalanda: ${errorMessages}`,
              vencimiento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            }
          }
        );
      }

      // Log de auditoría
      await logAuditoria(
        job.tenant_id,
        'system',
        'webhook.nalanda.received',
        'job_integracion',
        job.id,
        {
          webhook_type: payload.type,
          new_status: newStatus,
          trace_id: payload.traceId
        }
      );

      console.log(`✅ Nalanda webhook processed: ${payload.traceId} -> ${newStatus}`);
      return { ok: true, message: 'Webhook processed successfully' };

    } catch (error) {
      console.error('❌ Error handling Nalanda webhook:', error);
      return { ok: false, error: 'Internal error' };
    }
  }

  // Webhook CTAIMA
  static async handleCTAIMAWebhook(
    body: string,
    signature: string
  ): Promise<WebhookResponse> {
    try {
      const config = getPlatformConfig('ctaima');
      const isValidSignature = this.verifyHMACSignature(
        body,
        signature,
        config.webhookSecret || ''
      );

      if (!isValidSignature) {
        console.error('❌ Invalid CTAIMA webhook signature');
        return { ok: false, error: 'Invalid signature' };
      }

      const payload = JSON.parse(body);
      console.log('📥 CTAIMA webhook received:', payload.type);

      // Procesar según tipo de evento
      switch (payload.type) {
        case 'project.imported':
          await this.handleProjectImported(payload, 'ctaima');
          break;
        case 'project.rejected':
          await this.handleProjectRejected(payload, 'ctaima');
          break;
        case 'document.validated':
          await this.handleDocumentValidated(payload, 'ctaima');
          break;
        default:
          console.log(`CTAIMA webhook type ${payload.type} not handled`);
      }

      return { ok: true, message: 'Webhook processed successfully' };

    } catch (error) {
      console.error('❌ Error handling CTAIMA webhook:', error);
      return { ok: false, error: 'Internal error' };
    }
  }

  // Webhook Ecoordina
  static async handleEcoordinaWebhook(
    body: string,
    signature: string
  ): Promise<WebhookResponse> {
    try {
      const config = getPlatformConfig('ecoordina');
      const isValidSignature = this.verifyHMACSignature(
        body,
        signature,
        config.webhookSecret || ''
      );

      if (!isValidSignature) {
        console.error('❌ Invalid Ecoordina webhook signature');
        return { ok: false, error: 'Invalid signature' };
      }

      const payload = JSON.parse(body);
      console.log('📥 Ecoordina webhook received:', payload.type);

      // Procesar eventos de Ecoordina
      switch (payload.type) {
        case 'submission.accepted':
          await this.handleSubmissionAccepted(payload, 'ecoordina');
          break;
        case 'submission.rejected':
          await this.handleSubmissionRejected(payload, 'ecoordina');
          break;
        case 'document.expired':
          await this.handleDocumentExpired(payload, 'ecoordina');
          break;
        default:
          console.log(`Ecoordina webhook type ${payload.type} not handled`);
      }

      return { ok: true, message: 'Webhook processed successfully' };

    } catch (error) {
      console.error('❌ Error handling Ecoordina webhook:', error);
      return { ok: false, error: 'Internal error' };
    }
  }

  // Webhook Stripe
  static async handleStripeWebhook(
    body: string,
    signature: string
  ): Promise<WebhookResponse> {
    try {
      // En producción, verificar con Stripe SDK
      const payload = JSON.parse(body);
      console.log('💳 Stripe webhook received:', payload.type);

      return await automationEngine.handleWebhookStripe(payload);

    } catch (error) {
      console.error('❌ Error handling Stripe webhook:', error);
      return { ok: false, error: 'Internal error' };
    }
  }

  // Helpers privados
  private static mapNalandaStatus(nalandaStatus: string): string {
    const statusMap: { [key: string]: string } = {
      'accepted': 'aceptado',
      'rejected': 'rechazado',
      'processing': 'enviado',
      'error': 'error'
    };

    return statusMap[nalandaStatus] || 'error';
  }

  private static async handleProjectImported(payload: any, platform: string): Promise<void> {
    try {
      const { data: job, error } = await supabaseNew
        .from('jobs_integracion')
        .select('*')
        .eq('trace_id', payload.traceId)
        .single();

      if (error || !job) {
        console.error('Job not found for imported project:', payload.traceId);
        return;
      }

      await supabaseNew
        .from('jobs_integracion')
        .update({
          estado: 'aceptado',
          respuesta: payload,
          updated_at: new Date().toISOString()
        })
        .eq('id', job.id);

      console.log(`✅ Project imported successfully in ${platform}: ${payload.traceId}`);
    } catch (error) {
      console.error('Error handling project imported:', error);
    }
  }

  private static async handleProjectRejected(payload: any, platform: string): Promise<void> {
    try {
      const { data: job, error } = await supabaseNew
        .from('jobs_integracion')
        .select('*')
        .eq('trace_id', payload.traceId)
        .single();

      if (error || !job) {
        console.error('Job not found for rejected project:', payload.traceId);
        return;
      }

      await supabaseNew
        .from('jobs_integracion')
        .update({
          estado: 'rechazado',
          respuesta: payload,
          updated_at: new Date().toISOString()
        })
        .eq('id', job.id);

      // Crear tarea de subsanación
      const errorMessages = payload.errors?.map((e: any) => e.message).join('; ') || 'Proyecto rechazado';

      await supabaseNew
        .from('tareas')
        .insert({
          tenant_id: job.tenant_id,
          tipo: 'subsanar',
          obra_id: job.obra_id,
          estado: 'abierta',
          comentarios: `Rechazado por ${platform}: ${errorMessages}`,
          vencimiento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          asignado_role: 'GestorDocumental'
        });

      console.log(`❌ Project rejected in ${platform}: ${payload.traceId}`);
    } catch (error) {
      console.error('Error handling project rejected:', error);
    }
  }

  private static async handleDocumentValidated(payload: any, platform: string): Promise<void> {
    try {
      console.log(`✅ Document validated in ${platform}:`, payload.documentId);
      
      // Aquí se podría actualizar el estado del documento específico
      // si el payload incluye información suficiente para identificarlo
    } catch (error) {
      console.error('Error handling document validated:', error);
    }
  }

  private static async handleSubmissionAccepted(payload: any, platform: string): Promise<void> {
    await this.handleProjectImported(payload, platform);
  }

  private static async handleSubmissionRejected(payload: any, platform: string): Promise<void> {
    await this.handleProjectRejected(payload, platform);
  }

  private static async handleDocumentExpired(payload: any, platform: string): Promise<void> {
    try {
      console.log(`⏰ Document expired notification from ${platform}:`, payload.documentId);
      
      // Crear tarea de renovación si se puede identificar el documento
      if (payload.documentId) {
        // Buscar documento por ID externo en metadatos
        const { data: documento, error } = await supabaseNew
          .from('documentos')
          .select('*')
          .contains('metadatos', { external_id: payload.documentId })
          .single();

        if (!error && documento) {
          await supabaseNew
            .from('tareas')
            .insert({
              tenant_id: documento.tenant_id,
              tipo: 'subsanar',
              documento_id: documento.id,
              estado: 'abierta',
              comentarios: `Documento expirado en ${platform}. Renovación urgente requerida.`,
              vencimiento: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
              asignado_role: 'GestorDocumental'
            });
        }
      }
    } catch (error) {
      console.error('Error handling document expired:', error);
    }
  }

  private static verifyHMACSignature(
    body: string,
    signature: string,
    secret: string
  ): boolean {
    try {
      // Implementación simplificada para desarrollo
      // En producción, usar crypto.createHmac('sha256', secret)
      return signature.length > 0 && secret.length > 0;
    } catch (error) {
      console.error('Error verifying HMAC signature:', error);
      return false;
    }
  }

  // Helper para registrar webhook recibido
  static async logWebhookReceived(
    platform: string,
    type: string,
    payload: any,
    success: boolean,
    error?: string
  ): Promise<void> {
    try {
      await supabaseNew
        .from('auditoria')
        .insert({
          tenant_id: 'system',
          accion: `webhook.${platform}.${type}`,
          entidad: 'webhook',
          entidad_id: payload.traceId || payload.id || 'unknown',
          ip: '0.0.0.0',
          detalles: {
            platform,
            type,
            success,
            error,
            payload_size: JSON.stringify(payload).length
          }
        });
    } catch (auditError) {
      console.error('Error logging webhook:', auditError);
    }
  }
}

// Funciones de endpoint para usar en edge functions
export const webhookNalanda = async (request: Request): Promise<Response> => {
  try {
    const body = await request.text();
    const signature = request.headers.get('X-Signature') || '';
    
    const result = await WebhookHandlers.handleNalandaWebhook(body, signature);
    
    await WebhookHandlers.logWebhookReceived(
      'nalanda',
      'import_status',
      JSON.parse(body),
      result.ok,
      result.error
    );

    return new Response(
      JSON.stringify(result),
      {
        status: result.ok ? 200 : 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in Nalanda webhook endpoint:', error);
    return new Response(
      JSON.stringify({ ok: false, error: 'Internal error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const webhookCTAIMA = async (request: Request): Promise<Response> => {
  try {
    const body = await request.text();
    const signature = request.headers.get('X-Signature') || '';
    
    const result = await WebhookHandlers.handleCTAIMAWebhook(body, signature);
    
    await WebhookHandlers.logWebhookReceived(
      'ctaima',
      'project_status',
      JSON.parse(body),
      result.ok,
      result.error
    );

    return new Response(
      JSON.stringify(result),
      {
        status: result.ok ? 200 : 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in CTAIMA webhook endpoint:', error);
    return new Response(
      JSON.stringify({ ok: false, error: 'Internal error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const webhookEcoordina = async (request: Request): Promise<Response> => {
  try {
    const body = await request.text();
    const signature = request.headers.get('X-Signature') || '';
    
    const result = await WebhookHandlers.handleEcoordinaWebhook(body, signature);
    
    await WebhookHandlers.logWebhookReceived(
      'ecoordina',
      'submission_status',
      JSON.parse(body),
      result.ok,
      result.error
    );

    return new Response(
      JSON.stringify(result),
      {
        status: result.ok ? 200 : 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in Ecoordina webhook endpoint:', error);
    return new Response(
      JSON.stringify({ ok: false, error: 'Internal error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const webhookStripe = async (request: Request): Promise<Response> => {
  try {
    const body = await request.text();
    const signature = request.headers.get('Stripe-Signature') || '';
    
    const result = await WebhookHandlers.handleStripeWebhook(body, signature);
    
    return new Response(
      JSON.stringify(result),
      {
        status: result.ok ? 200 : 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in Stripe webhook endpoint:', error);
    return new Response(
      JSON.stringify({ ok: false, error: 'Internal error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};