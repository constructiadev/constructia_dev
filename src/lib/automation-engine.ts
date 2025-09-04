// ConstructIA - Motor de Automatizaciones y Tareas Programadas
import { supabaseNew, logAuditoria } from './supabase-new';
import { appConfig } from '../config/app-config';
import { WorkflowActions } from './workflow-actions';

export interface ScheduledTask {
  name: string;
  cron: string;
  lastRun?: string;
  nextRun?: string;
  enabled: boolean;
}

export interface NotificationTemplate {
  name: string;
  subject: string;
  body: string;
  type: 'email' | 'in_app' | 'sms';
}

export class AutomationEngine {
  private static instance: AutomationEngine;
  private scheduledTasks: Map<string, ScheduledTask> = new Map();
  private notificationTemplates: Map<string, NotificationTemplate> = new Map();

  constructor() {
    this.initializeTemplates();
    this.initializeScheduledTasks();
  }

  static getInstance(): AutomationEngine {
    if (!AutomationEngine.instance) {
      AutomationEngine.instance = new AutomationEngine();
    }
    return AutomationEngine.instance;
  }

  private initializeTemplates() {
    const templates: NotificationTemplate[] = [
      {
        name: 'doc_expiring',
        subject: 'Documento próximo a caducar - {{doc.categoria}}',
        body: `
          <h2>Documento próximo a caducar</h2>
          <p>El documento <strong>{{doc.categoria}}</strong> caduca el <strong>{{doc.caducidad}}</strong>.</p>
          <p>Entidad: {{doc.entidad_tipo}} - {{doc.entidad_id}}</p>
          <p>Por favor, renueva este documento antes de la fecha de caducidad.</p>
        `,
        type: 'email'
      },
      {
        name: 'admin_message',
        subject: '{{titulo}}',
        body: `
          <h2>{{titulo}}</h2>
          <p>{{contenido}}</p>
          <hr>
          <p><small>Mensaje enviado desde ConstructIA</small></p>
        `,
        type: 'email'
      },
      {
        name: 'task_assigned',
        subject: 'Nueva tarea asignada - {{tarea.tipo}}',
        body: `
          <h2>Nueva tarea asignada</h2>
          <p>Se te ha asignado una nueva tarea: <strong>{{tarea.tipo}}</strong></p>
          <p>Vencimiento: {{tarea.vencimiento}}</p>
          <p>Comentarios: {{tarea.comentarios}}</p>
        `,
        type: 'email'
      }
    ];

    templates.forEach(template => {
      this.notificationTemplates.set(template.name, template);
    });
  }

  private initializeScheduledTasks() {
    const tasks: ScheduledTask[] = [
      {
        name: 'DailyCaducities',
        cron: '0 8 * * *', // Diario a las 8:00
        enabled: true
      },
      {
        name: 'MonthlyReports',
        cron: '0 6 1 * *', // Primer día del mes a las 6:00
        enabled: true
      },
      {
        name: 'PurgeSensitiveDocs',
        cron: '0 2 * * *', // Diario a las 2:00
        enabled: true
      },
      {
        name: 'ExpireMessages',
        cron: '*/30 * * * *', // Cada 30 minutos
        enabled: true
      }
    ];

    tasks.forEach(task => {
      this.scheduledTasks.set(task.name, task);
    });
  }

  // Ejecutar tarea programada: DailyCaducities
  async executeDailyCaducities(): Promise<void> {
    console.log('🕐 Ejecutando tarea diaria de caducidades...');
    
    try {
      // Obtener todos los tenants activos
      const { data: tenants, error: tenantsError } = await supabaseNew
        .from('tenants')
        .select('id')
        .eq('status', 'active');

      if (tenantsError) {
        console.error('Error getting tenants:', tenantsError);
        return;
      }

      for (const tenant of tenants || []) {
        await this.processTenantCaducities(tenant.id);
      }

      console.log('✅ Tarea de caducidades completada');
    } catch (error) {
      console.error('Error in daily caducities task:', error);
    }
  }

  private async processTenantCaducities(tenantId: string): Promise<void> {
    try {
      const alertDays = appConfig.settings.ALERT_DAYS;
      const today = new Date();
      
      // Calcular fechas de alerta
      const alertDates = alertDays.map(days => {
        const alertDate = new Date(today);
        alertDate.setDate(alertDate.getDate() + days);
        return alertDate.toISOString().split('T')[0];
      });

      // Buscar documentos próximos a caducar
      const { data: documentos, error: docsError } = await supabaseNew
        .from('documentos')
        .select('*')
        .eq('tenant_id', tenantId)
        .in('caducidad', alertDates)
        .eq('estado', 'aprobado');

      if (docsError) {
        console.error('Error getting expiring documents:', docsError);
        return;
      }

      // Crear tareas y mensajes para cada documento
      for (const documento of documentos || []) {
        // Crear tarea de subsanación
        await supabaseNew
          .from('tareas')
          .insert({
            tenant_id: tenantId,
            tipo: 'subsanar',
            documento_id: documento.id,
            asignado_role: 'GestorDocumental',
            vencimiento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            estado: 'abierta',
            comentarios: `Documento próximo a caducar el ${documento.caducidad}. Renovación requerida.`
          });

        // Crear mensaje de alerta
        await supabaseNew
          .from('mensajes')
          .insert({
            tenant_id: tenantId,
            tipo: 'alerta',
            titulo: 'Documento próximo a caducar',
            contenido: `El documento ${documento.categoria} caduca el ${documento.caducidad}`,
            prioridad: 'alta',
            destinatarios: ['GestorDocumental', 'ClienteAdmin'],
            estado: 'programado'
          });

        // Enviar notificación
        await this.sendNotification('doc_expiring', ['role:ClienteAdmin'], { doc: documento });
      }

      console.log(`✅ Procesadas ${documentos?.length || 0} caducidades para tenant ${tenantId}`);
    } catch (error) {
      console.error(`Error processing caducities for tenant ${tenantId}:`, error);
    }
  }

  // Ejecutar tarea programada: MonthlyReports
  async executeMonthlyReports(): Promise<void> {
    console.log('📊 Ejecutando generación de reportes mensuales...');
    
    try {
      const { data: tenants, error: tenantsError } = await supabaseNew
        .from('tenants')
        .select('id')
        .eq('status', 'active');

      if (tenantsError) {
        console.error('Error getting tenants:', tenantsError);
        return;
      }

      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const monthStr = lastMonth.toISOString().substring(0, 7); // YYYY-MM

      for (const tenant of tenants || []) {
        // Obtener emails de administradores del tenant
        const { data: admins, error: adminsError } = await supabaseNew
          .from('users')
          .select('email')
          .eq('tenant_id', tenant.id)
          .in('role', ['SuperAdmin', 'ClienteAdmin']);

        if (adminsError) {
          console.error('Error getting admin emails:', adminsError);
          continue;
        }

        const adminEmails = admins?.map(admin => admin.email) || [];

        // Generar reporte operativo
        await WorkflowActions.createMessage(
          { tenantId: tenant.id, userId: 'system', userRole: 'system', ip: '127.0.0.1' },
          'info',
          `Reporte Operativo ${monthStr}`,
          `Reporte mensual generado automáticamente para el período ${monthStr}`,
          'media',
          null,
          adminEmails
        );
      }

      console.log('✅ Reportes mensuales generados');
    } catch (error) {
      console.error('Error in monthly reports task:', error);
    }
  }

  // Ejecutar tarea programada: PurgeSensitiveDocs
  async executePurgeSensitiveDocs(): Promise<void> {
    console.log('🗑️ Ejecutando purga de documentos sensibles...');
    
    try {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      const { data: documentos, error: docsError } = await supabaseNew
        .from('documentos')
        .select('*')
        .eq('sensible', true)
        .eq('estado', 'aprobado')
        .lt('updated_at', twoDaysAgo.toISOString());

      if (docsError) {
        console.error('Error getting sensitive documents:', docsError);
        return;
      }

      for (const documento of documentos || []) {
        // Eliminar archivo físico (simular)
        console.log(`🗑️ Purgando archivo: ${documento.file}`);

        // Actualizar registro para marcar como purgado
        await supabaseNew
          .from('documentos')
          .update({
            file: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', documento.id);

        // Log de auditoría
        await logAuditoria(
          documento.tenant_id,
          'system',
          'document.purged',
          'documento',
          documento.id,
          { original_file: documento.file }
        );
      }

      console.log(`✅ Purgados ${documentos?.length || 0} documentos sensibles`);
    } catch (error) {
      console.error('Error in purge sensitive docs task:', error);
    }
  }

  // Ejecutar tarea programada: ExpireMessages
  async executeExpireMessages(): Promise<void> {
    try {
      const now = new Date().toISOString();

      const { error } = await supabaseNew
        .from('mensajes')
        .update({ estado: 'vencido' })
        .eq('estado', 'programado')
        .lt('vence', now);

      if (error) {
        console.error('Error expiring messages:', error);
      }
    } catch (error) {
      console.error('Error in expire messages task:', error);
    }
  }

  // Enviar notificación
  async sendNotification(
    templateName: string,
    recipients: string[],
    context: any
  ): Promise<void> {
    try {
      const template = this.notificationTemplates.get(templateName);
      if (!template) {
        console.error(`Template ${templateName} not found`);
        return;
      }

      // Renderizar template
      const subject = this.renderTemplate(template.subject, context);
      const body = this.renderTemplate(template.body, context);

      // Simular envío de notificación
      console.log(`📧 Enviando notificación "${subject}" a:`, recipients);
      console.log(`📄 Contenido:`, body);

      // En producción, aquí se integraría con servicio de email real
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  private renderTemplate(template: string, context: any): string {
    return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
      const value = this.getValueByPath(context, path.trim());
      return value !== null && value !== undefined ? String(value) : match;
    });
  }

  private getValueByPath(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  }

  // Webhook handlers
  async handleWebhookNalanda(payload: any, signature: string): Promise<boolean> {
    try {
      // Verificar firma HMAC
      const isValidSignature = this.verifyWebhookSignature(
        payload,
        signature,
        process.env.VITE_NALANDA_WEBHOOK_SECRET || ''
      );

      if (!isValidSignature) {
        console.error('Invalid webhook signature from Nalanda');
        return false;
      }

      // Buscar job por trace_id
      const { data: job, error: jobError } = await supabaseNew
        .from('jobs_integracion')
        .select('*')
        .eq('trace_id', payload.traceId)
        .single();

      if (jobError || !job) {
        console.error('Job not found for trace_id:', payload.traceId);
        return false;
      }

      // Actualizar estado del job
      const { error: updateError } = await supabaseNew
        .from('jobs_integracion')
        .update({
          estado: payload.status,
          respuesta: payload,
          updated_at: new Date().toISOString()
        })
        .eq('id', job.id);

      if (updateError) {
        console.error('Error updating job:', updateError);
        return false;
      }

      // Si fue rechazado, crear tarea de subsanación
      if (payload.status === 'rejected') {
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
            vencimiento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          });
      }

      return true;
    } catch (error) {
      console.error('Error handling Nalanda webhook:', error);
      return false;
    }
  }

  async handleWebhookStripe(payload: any): Promise<boolean> {
    try {
      console.log('💳 Procesando webhook de Stripe:', payload.type);

      switch (payload.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSuccess(payload.data.object);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(payload.data.object);
          break;
        case 'invoice.payment_succeeded':
          await this.handleSubscriptionPayment(payload.data.object);
          break;
        default:
          console.log(`Webhook type ${payload.type} not handled`);
      }

      return true;
    } catch (error) {
      console.error('Error handling Stripe webhook:', error);
      return false;
    }
  }

  private async handlePaymentSuccess(paymentIntent: any): Promise<void> {
    try {
      // Buscar transacción por payment_intent_id
      const { data: transaction, error } = await supabaseNew
        .from('token_transactions')
        .select('*')
        .eq('stripe_payment_intent_id', paymentIntent.id)
        .single();

      if (error || !transaction) {
        console.error('Transaction not found for payment_intent:', paymentIntent.id);
        return;
      }

      // Actualizar estado de la transacción
      await supabaseNew
        .from('token_transactions')
        .update({
          estado: 'completado',
          updated_at: new Date().toISOString()
        })
        .eq('id', transaction.id);

      console.log(`✅ Pago completado para transacción ${transaction.id}`);
    } catch (error) {
      console.error('Error handling payment success:', error);
    }
  }

  private async handlePaymentFailed(paymentIntent: any): Promise<void> {
    try {
      // Buscar transacción por payment_intent_id
      const { data: transaction, error } = await supabaseNew
        .from('token_transactions')
        .select('*')
        .eq('stripe_payment_intent_id', paymentIntent.id)
        .single();

      if (error || !transaction) {
        console.error('Transaction not found for payment_intent:', paymentIntent.id);
        return;
      }

      // Actualizar estado de la transacción
      await supabaseNew
        .from('token_transactions')
        .update({
          estado: 'fallido',
          updated_at: new Date().toISOString()
        })
        .eq('id', transaction.id);

      console.log(`❌ Pago fallido para transacción ${transaction.id}`);
    } catch (error) {
      console.error('Error handling payment failure:', error);
    }
  }

  private async handleSubscriptionPayment(invoice: any): Promise<void> {
    try {
      console.log(`💰 Pago de suscripción recibido: ${invoice.id}`);
      
      // Aquí se actualizaría el estado de la suscripción
      // En producción, buscar por customer_id y actualizar suscripción
    } catch (error) {
      console.error('Error handling subscription payment:', error);
    }
  }

  private verifyWebhookSignature(
    payload: any,
    signature: string,
    secret: string
  ): boolean {
    try {
      // Implementación simplificada de verificación HMAC
      // En producción, usar crypto.createHmac
      return signature.length > 0 && secret.length > 0;
    } catch (error) {
      console.error('Error verifying webhook signature:', error);
      return false;
    }
  }

  // Ejecutar todas las tareas programadas (para desarrollo)
  async runScheduledTasks(): Promise<void> {
    console.log('🔄 Ejecutando tareas programadas...');

    for (const [name, task] of this.scheduledTasks) {
      if (!task.enabled) continue;

      try {
        switch (name) {
          case 'DailyCaducities':
            await this.executeDailyCaducities();
            break;
          case 'MonthlyReports':
            await this.executeMonthlyReports();
            break;
          case 'PurgeSensitiveDocs':
            await this.executePurgeSensitiveDocs();
            break;
          case 'ExpireMessages':
            await this.executeExpireMessages();
            break;
          default:
            console.log(`Task ${name} not implemented`);
        }

        // Actualizar última ejecución
        task.lastRun = new Date().toISOString();
      } catch (error) {
        console.error(`Error executing task ${name}:`, error);
      }
    }
  }

  // Obtener estado de tareas programadas
  getScheduledTasksStatus(): ScheduledTask[] {
    return Array.from(this.scheduledTasks.values());
  }

  // Habilitar/deshabilitar tarea
  toggleTask(taskName: string, enabled: boolean): boolean {
    const task = this.scheduledTasks.get(taskName);
    if (task) {
      task.enabled = enabled;
      return true;
    }
    return false;
  }
}

// Instancia global del motor de automatización
export const automationEngine = AutomationEngine.getInstance();

// Helper para inicializar automatizaciones en desarrollo
export const initializeAutomations = () => {
  console.log('🤖 Inicializando motor de automatizaciones...');
  
  // Automatizaciones deshabilitadas en desarrollo
  // El administrador ejecutará las tareas manualmente según sea necesario
  console.log('⚠️ Automatizaciones programadas deshabilitadas - Control manual del administrador');
};