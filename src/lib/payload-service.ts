// ConstructIA - Servicio de Gestión de Payloads
import { 
  PayloadBuilder, 
  PayloadTransformer, 
  type IntegrationPayload,
  type CompanyPayload,
  type SitePayload 
} from '../types/payloads';
import {
  MappingTemplateService,
  MappingEngine,
  WorkflowEngine,
  type MappingTemplate,
  type Workflow
} from '../types/mapping';
import { 
  getTenantHierarchy, 
  supabaseNew,
  logAuditoria 
} from './supabase-new';
import type { PlataformaTipo } from '../types';

export class PayloadService {
  private tenantId: string;
  private mappingService: MappingTemplateService;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
    this.mappingService = new MappingTemplateService(tenantId);
  }

  // Generar payload para una obra específica
  async generatePayloadForObra(obraId: string): Promise<IntegrationPayload | null> {
    try {
      // Obtener datos completos de la obra
      const { data: obra, error: obraError } = await supabaseNew
        .from('obras')
        .select(`
          *,
          empresas!inner(*)
        `)
        .eq('id', obraId)
        .eq('tenant_id', this.tenantId)
        .single();

      if (obraError || !obra) {
        console.error('Error fetching obra:', obraError);
        return null;
      }

      // Obtener proveedores y trabajadores
      const { data: proveedores, error: proveedoresError } = await supabaseNew
        .from('proveedores')
        .select(`
          *,
          trabajadores(*)
        `)
        .eq('empresa_id', obra.empresa_id)
        .eq('tenant_id', this.tenantId);

      if (proveedoresError) {
        console.error('Error fetching proveedores:', proveedoresError);
      }

      // Obtener maquinaria
      const { data: maquinaria, error: maquinariaError } = await supabaseNew
        .from('maquinaria')
        .select('*')
        .eq('empresa_id', obra.empresa_id)
        .eq('tenant_id', this.tenantId);

      if (maquinariaError) {
        console.error('Error fetching maquinaria:', maquinariaError);
      }

      // Obtener documentos de todas las entidades
      const { data: documentos, error: documentosError } = await supabaseNew
        .from('documentos')
        .select('*')
        .eq('tenant_id', this.tenantId)
        .or(`entidad_id.eq.${obraId},entidad_id.in.(${[
          ...(proveedores?.flatMap(p => p.trabajadores?.map((t: any) => t.id) || []) || []),
          ...(maquinaria?.map(m => m.id) || [])
        ].join(',')})`);

      if (documentosError) {
        console.error('Error fetching documentos:', documentosError);
      }

      // Construir payload
      const allWorkers = proveedores?.flatMap(p => p.trabajadores || []) || [];
      
      const payload = PayloadBuilder.fromTenantData(
        obra.empresas,
        obra,
        allWorkers,
        maquinaria || [],
        documentos || []
      );

      return payload;
    } catch (error) {
      console.error('Error generating payload for obra:', error);
      return null;
    }
  }

  // Generar payloads para todas las obras del tenant
  async generateAllPayloads(): Promise<IntegrationPayload[]> {
    try {
      const hierarchy = await getTenantHierarchy(this.tenantId);
      return PayloadTransformer.transformFromNewArchitecture(hierarchy);
    } catch (error) {
      console.error('Error generating all payloads:', error);
      return [];
    }
  }

  // Enviar payload a plataforma específica
  async sendToPlataforma(
    payload: IntegrationPayload,
    plataforma: PlataformaTipo,
    adaptadorId: string,
    userId: string
  ): Promise<{ success: boolean; jobId?: string; error?: string }> {
    try {
      // Obtener template de mapping para la plataforma
      const template = await this.mappingService.getTemplate(plataforma);
      if (!template) {
        throw new Error(`No se encontró template de mapping para ${plataforma}`);
      }

      // Aplicar transformación usando el motor de mapping
      const mappingEngine = new MappingEngine(template);
      const transformedPayload = mappingEngine.transform(payload);

      // Validar payload transformado
      const validation = mappingEngine.validate(transformedPayload);
      if (!validation.isValid) {
        throw new Error(`Payload inválido: ${validation.errors.join(', ')}`);
      }

      // Obtener credenciales del adaptador
      const { data: adaptador, error: adaptadorError } = await supabaseNew
        .from('adaptadores')
        .select('*')
        .eq('id', adaptadorId)
        .eq('tenant_id', this.tenantId)
        .single();

      if (adaptadorError || !adaptador) {
        throw new Error('Adaptador no encontrado o sin permisos');
      }

      // Crear job de integración
      const { data: job, error: jobError } = await supabaseNew
        .from('jobs_integracion')
        .insert({
          tenant_id: this.tenantId,
          plataforma,
          obra_id: payload.Site.code, // Usar código de obra como referencia
          payload: transformedPayload,
          estado: 'pendiente',
          intentos: 0,
          trace_id: `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        })
        .select()
        .single();

      if (jobError) {
        throw new Error(`Error creating integration job: ${jobError.message}`);
      }

      // Log de auditoría
      await logAuditoria(
        this.tenantId,
        userId,
        'envio_payload',
        'obra',
        payload.Site.code,
        {
          plataforma,
          adaptador_id: adaptadorId,
          job_id: job.id,
          payload_size: JSON.stringify(transformedPayload).length
        }
      );

      // Simular envío (en producción aquí iría la lógica real de envío)
      console.log(`📤 Payload enviado a ${plataforma}:`, transformedPayload);

      return {
        success: true,
        jobId: job.id
      };
    } catch (error) {
      console.error('Error sending payload to platform:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  // Obtener estado de jobs de integración
  async getIntegrationJobs(obraId?: string) {
    try {
      let query = supabaseNew
        .from('jobs_integracion')
        .select('*')
        .eq('tenant_id', this.tenantId)
        .order('created_at', { ascending: false });

      if (obraId) {
        query = query.eq('obra_id', obraId);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Error fetching integration jobs: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error getting integration jobs:', error);
      return [];
    }
  }

  // Reintentar job fallido
  async retryJob(jobId: string, userId: string): Promise<boolean> {
    try {
      const { data: job, error: jobError } = await supabaseNew
        .from('jobs_integracion')
        .select('*')
        .eq('id', jobId)
        .eq('tenant_id', this.tenantId)
        .single();

      if (jobError || !job) {
        throw new Error('Job no encontrado');
      }

      // Actualizar job para reintento
      const { error: updateError } = await supabaseNew
        .from('jobs_integracion')
        .update({
          estado: 'pendiente',
          intentos: job.intentos + 1,
          respuesta: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId);

      if (updateError) {
        throw new Error(`Error updating job: ${updateError.message}`);
      }

      // Log de auditoría
      await logAuditoria(
        this.tenantId,
        userId,
        'reintento_job',
        'job_integracion',
        jobId,
        { intento: job.intentos + 1 }
      );

      return true;
    } catch (error) {
      console.error('Error retrying job:', error);
      return false;
    }
  }

  // Validar payload antes del envío
  validatePayload(payload: IntegrationPayload): { isValid: boolean; errors: string[] } {
    const builder = new PayloadBuilder()
      .setCompany(payload.Company)
      .setSite(payload.Site)
      .setWorkers(payload.Worker)
      .setMachines(payload.Machine)
      .setDocuments(payload.Docs);

    return builder.validate();
  }

  // Obtener estadísticas de payloads
  async getPayloadStats() {
    try {
      const { data: jobs, error } = await supabaseNew
        .from('jobs_integracion')
        .select('estado, plataforma, created_at')
        .eq('tenant_id', this.tenantId);

      if (error) {
        throw new Error(`Error fetching payload stats: ${error.message}`);
      }

      const stats = {
        total: jobs?.length || 0,
        pendientes: jobs?.filter(j => j.estado === 'pendiente').length || 0,
        enviados: jobs?.filter(j => j.estado === 'enviado').length || 0,
        aceptados: jobs?.filter(j => j.estado === 'aceptado').length || 0,
        rechazados: jobs?.filter(j => j.estado === 'rechazado').length || 0,
        errores: jobs?.filter(j => j.estado === 'error').length || 0,
        porPlataforma: {
          nalanda: jobs?.filter(j => j.plataforma === 'nalanda').length || 0,
          ctaima: jobs?.filter(j => j.plataforma === 'ctaima').length || 0,
          ecoordina: jobs?.filter(j => j.plataforma === 'ecoordina').length || 0,
          otro: jobs?.filter(j => j.plataforma === 'otro').length || 0
        }
      };

      return stats;
    } catch (error) {
      console.error('Error getting payload stats:', error);
      return {
        total: 0,
        pendientes: 0,
        enviados: 0,
        aceptados: 0,
        rechazados: 0,
        errores: 0,
        porPlataforma: { nalanda: 0, ctaima: 0, ecoordina: 0, otro: 0 }
      };
    }
  }
}

// Instancia por defecto para desarrollo
export const payloadService = new PayloadService('00000000-0000-0000-0000-000000000001');