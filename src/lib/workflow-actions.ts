// ConstructIA - Acciones de Workflow
import { supabaseNew, logAuditoria } from './supabase-new';
import { geminiProcessor } from './gemini-document-processor';
import { validationEngine } from './validation-engine';
import { appConfig } from '../config/app-config';
import type { 
  NewDocumento, 
  Tarea, 
  JobIntegracion,
  DocumentoCategoria,
  EntidadTipo,
  TareaTipo,
  DocumentoEstado 
} from '../types';

export interface WorkflowContext {
  tenantId: string;
  userId: string;
  userRole: string;
  ip: string;
}

export interface ActionResult {
  ok: boolean;
  data?: any;
  error?: string;
  warnings?: string[];
}

export class WorkflowActions {
  // Acción: AdminLogin
  static async adminLogin(
    email: string, 
    password: string, 
    ip: string
  ): Promise<ActionResult> {
    try {
      // Buscar usuario admin
      const { data: user, error: userError } = await supabaseNew
        .from('users')
        .select('*')
        .eq('email', email)
        .in('role', ['SuperAdmin', 'ClienteAdmin'])
        .single();

      if (userError || !user) {
        return { ok: false, error: 'Credenciales inválidas' };
      }

      // En desarrollo, omitir verificación de hash de contraseña
      const isValidPassword = password === 'superadmin123' || password === 'password123';
      
      if (!isValidPassword) {
        return { ok: false, error: 'Credenciales inválidas' };
      }

      // Actualizar último login
      await supabaseNew
        .from('users')
        .update({ last_login_ip: ip })
        .eq('id', user.id);

      return {
        ok: true,
        data: {
          user_id: user.id,
          tenant_id: user.tenant_id,
          role: user.role,
          scope: 'admin'
        }
      };
    } catch (error) {
      console.error('Error in admin login:', error);
      return { ok: false, error: 'Error interno de autenticación' };
    }
  }

  // Acción: ClientLogin
  static async clientLogin(
    email: string, 
    password: string, 
    ip: string
  ): Promise<ActionResult> {
    try {
      // Buscar usuario cliente
      const { data: user, error: userError } = await supabaseNew
        .from('users')
        .select('*')
        .eq('email', email)
        .in('role', ['Cliente', 'ClienteDemo'])
        .single();

      if (userError || !user) {
        return { ok: false, error: 'Credenciales inválidas' };
      }

      // En desarrollo, omitir verificación de hash de contraseña
      const isValidPassword = password === 'password123';
      
      if (!isValidPassword) {
        return { ok: false, error: 'Credenciales inválidas' };
      }

      // Actualizar último login
      await supabaseNew
        .from('users')
        .update({ last_login_ip: ip })
        .eq('id', user.id);

      return {
        ok: true,
        data: {
          user_id: user.id,
          tenant_id: user.tenant_id,
          role: user.role,
          scope: 'client'
        }
      };
    } catch (error) {
      console.error('Error in client login:', error);
      return { ok: false, error: 'Error interno de autenticación' };
    }
  }

  // Acción: UploadDocument
  static async uploadDocument(
    context: WorkflowContext,
    entidadTipo: EntidadTipo,
    entidadId: string,
    categoria: DocumentoCategoria,
    file: File,
    observaciones?: string
  ): Promise<ActionResult> {
    try {
      // Step 1: Validar archivo
      const fileValidation = validationEngine.validateFile(file);
      if (!fileValidation.isValid) {
        return { ok: false, error: fileValidation.errors.join(', ') };
      }

      // Step 2: Calcular hash
      const fileBuffer = await file.arrayBuffer();
      const hashArray = await crypto.subtle.digest('SHA-256', fileBuffer);
      const hash = Array.from(new Uint8Array(hashArray))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      // Step 3: Verificar versión
      const { data: existing, error: existingError } = await supabaseNew
        .from('documentos')
        .select('version')
        .eq('tenant_id', context.tenantId)
        .eq('entidad_tipo', entidadTipo)
        .eq('entidad_id', entidadId)
        .eq('categoria', categoria)
        .order('version', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingError && existingError.code !== 'PGRST116') {
        return { ok: false, error: 'Error verificando versiones' };
      }

      const version = existing ? existing.version + 1 : 1;

      // Step 4: Procesar con Gemini
      const extraction = await geminiProcessor.processDocument(
        fileBuffer,
        file.name,
        file.type
      );

      // Step 5: Validar extracción
      const extractionValidation = validationEngine.validateExtraction(
        extraction,
        categoria,
        entidadTipo
      );

      // Step 6: Crear documento
      const fileUrl = `${context.tenantId}/${entidadTipo}/${entidadId}/${categoria}/v${version}/${hash}.${file.name.split('.').pop()}`;
      
      const documentoData: Partial<NewDocumento> = {
        tenant_id: context.tenantId,
        entidad_tipo: entidadTipo,
        entidad_id: entidadId,
        categoria,
        file: fileUrl,
        mime: file.type,
        size_bytes: file.size,
        hash_sha256: hash,
        version,
        estado: extractionValidation.isValid ? 'pendiente' : 'borrador',
        caducidad: extraction.campos.fecha_caducidad || null,
        emisor: extraction.campos.empresa || null,
        observaciones,
        metadatos: {
          ai_extraction: extraction,
          original_filename: file.name,
          upload_timestamp: new Date().toISOString(),
          user_id: context.userId,
          validation_result: extractionValidation
        },
        origen: 'usuario'
      };

      const { data: documento, error: docError } = await supabaseNew
        .from('documentos')
        .insert(documentoData)
        .select()
        .single();

      if (docError) {
        return { ok: false, error: `Error creando documento: ${docError.message}` };
      }

      // Step 7: Crear tarea de revisión
      const tareaData: Partial<Tarea> = {
        tenant_id: context.tenantId,
        tipo: extractionValidation.requiredActions.includes('subsanar') ? 'subsanar' : 'revisar',
        documento_id: documento.id,
        asignado_role: 'GestorDocumental',
        vencimiento: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 días
        estado: 'abierta',
        comentarios: `Documento subido por usuario. ${extractionValidation.requiredActions.length > 0 ? `Acciones requeridas: ${extractionValidation.requiredActions.join(', ')}` : 'Revisión estándar'}`
      };

      const { data: tarea, error: tareaError } = await supabaseNew
        .from('tareas')
        .insert(tareaData)
        .select()
        .single();

      if (tareaError) {
        console.warn('Error creating task:', tareaError);
      }

      // Step 8: Auditoría
      await logAuditoria(
        context.tenantId,
        context.userId,
        'document.uploaded',
        'documento',
        documento.id,
        {
          categoria,
          entidad_tipo: entidadTipo,
          entidad_id: entidadId,
          file_size: file.size,
          ai_confidence: extraction.confianza,
          validation_result: extractionValidation,
          workflow_step: 'upload_document',
          tarea_created: !!tarea?.id
        },
        context.ip,
        navigator.userAgent,
        extractionValidation.isValid ? 'success' : 'warning'
      );

      return {
        ok: true,
        data: {
          documento_id: documento.id,
          tarea_id: tarea?.id,
          extraction,
          validation: extractionValidation
        },
        warnings: extractionValidation.warnings
      };

    } catch (error) {
      console.error('Error in upload document workflow:', error);
      return { 
        ok: false, 
        error: error instanceof Error ? error.message : 'Error interno' 
      };
    }
  }

  // Acción: ReviewApproveDocument
  static async reviewApproveDocument(
    context: WorkflowContext,
    documentoId: string,
    action: 'aprobar' | 'rechazar',
    comentarios?: string
  ): Promise<ActionResult> {
    try {
      // Obtener documento
      const { data: documento, error: docError } = await supabaseNew
        .from('documentos')
        .select('*')
        .eq('id', documentoId)
        .eq('tenant_id', context.tenantId)
        .single();

      if (docError || !documento) {
        return { ok: false, error: 'Documento no encontrado' };
      }

      // Actualizar estado
      const nuevoEstado: DocumentoEstado = action === 'aprobar' ? 'aprobado' : 'rechazado';
      
      const { error: updateError } = await supabaseNew
        .from('documentos')
        .update({
          estado: nuevoEstado,
          observaciones: comentarios,
          updated_at: new Date().toISOString()
        })
        .eq('id', documentoId);

      if (updateError) {
        return { ok: false, error: `Error actualizando documento: ${updateError.message}` };
      }

      // Cerrar tareas relacionadas
      await supabaseNew
        .from('tareas')
        .update({
          estado: 'resuelta',
          comentarios: `${action === 'aprobar' ? 'Aprobado' : 'Rechazado'} por ${context.userId}. ${comentarios || ''}`,
          updated_at: new Date().toISOString()
        })
        .eq('documento_id', documentoId)
        .eq('tenant_id', context.tenantId);

      // Auditoría
      await logAuditoria(
        context.tenantId,
        context.userId,
        `document.${action}`,
        'documento',
        documentoId,
        {
          nuevo_estado: nuevoEstado,
          comentarios
        }
      );

      // Si se aprueba, verificar si se puede crear job de integración
      if (action === 'aprobar') {
        await this.checkAndQueueIntegration(context, documentoId);
      }

      return {
        ok: true,
        data: { documento_id: documentoId, nuevo_estado: nuevoEstado }
      };

    } catch (error) {
      console.error('Error in review document workflow:', error);
      return { 
        ok: false, 
        error: error instanceof Error ? error.message : 'Error interno' 
      };
    }
  }

  // Acción: CheckAndQueueIntegration
  static async checkAndQueueIntegration(
    context: WorkflowContext,
    documentoId: string
  ): Promise<ActionResult> {
    try {
      // Obtener documento y obra relacionada
      const { data: documento, error: docError } = await supabaseNew
        .from('documentos')
        .select(`
          *,
          obras!inner(*)
        `)
        .eq('id', documentoId)
        .eq('tenant_id', context.tenantId)
        .single();

      if (docError || !documento) {
        return { ok: false, error: 'Documento no encontrado' };
      }

      // Verificar si la obra tiene plataforma destino
      const obra = (documento as any).obras;
      if (!obra || !obra.plataforma_destino) {
        return { ok: true, data: { message: 'Obra sin plataforma destino configurada' } };
      }

      // Verificar si el checklist está completo
      const isComplete = await this.isChecklistComplete(
        context.tenantId,
        obra.id,
        obra.plataforma_destino
      );

      if (isComplete) {
        // Crear job de integración
        const { data: job, error: jobError } = await supabaseNew
          .from('jobs_integracion')
          .insert({
            tenant_id: context.tenantId,
            plataforma: obra.plataforma_destino,
            obra_id: obra.id,
            estado: 'pendiente',
            trace_id: `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          })
          .select()
          .single();

        if (jobError) {
          return { ok: false, error: `Error creando job: ${jobError.message}` };
        }

        return {
          ok: true,
          data: { job_id: job.id, message: 'Job de integración creado' }
        };
      }

      return { 
        ok: true, 
        data: { message: 'Checklist incompleto, job no creado' } 
      };

    } catch (error) {
      console.error('Error checking integration queue:', error);
      return { 
        ok: false, 
        error: error instanceof Error ? error.message : 'Error interno' 
      };
    }
  }

  // Acción: BuildPackage
  static async buildPackage(
    context: WorkflowContext,
    obraId: string,
    plataforma: string
  ): Promise<ActionResult> {
    try {
      // Cargar contexto completo de la obra
      const obraContext = await this.loadObraContext(context.tenantId, obraId);
      if (!obraContext) {
        return { ok: false, error: 'Obra no encontrada' };
      }

      // Obtener documentos requeridos
      const requiredDocs = await this.getRequiredDocs(
        context.tenantId,
        obraId,
        plataforma
      );

      // Recopilar documentos aprobados
      const approvedDocs = await this.collectApprovedDocs(
        context.tenantId,
        obraId,
        requiredDocs
      );

      // Construir esquema común
      const commonSchema = this.buildCommonSchema(obraContext, approvedDocs);

      // Obtener mapping más reciente
      const { data: mapping, error: mappingError } = await supabaseNew
        .from('mapping_templates')
        .select('*')
        .eq('tenant_id', context.tenantId)
        .eq('plataforma', plataforma)
        .order('version', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (mappingError || !mapping) {
        return { ok: false, error: 'Template de mapping no encontrado' };
      }

      // Aplicar mapping
      const payload = this.applyMapping(commonSchema, mapping.rules);

      // Actualizar job con payload
      const { error: updateError } = await supabaseNew
        .from('jobs_integracion')
        .update({ payload })
        .eq('obra_id', obraId)
        .eq('plataforma', plataforma)
        .eq('estado', 'pendiente');

      if (updateError) {
        return { ok: false, error: `Error actualizando job: ${updateError.message}` };
      }

      return {
        ok: true,
        data: { payload }
      };

    } catch (error) {
      console.error('Error building package:', error);
      return { 
        ok: false, 
        error: error instanceof Error ? error.message : 'Error interno' 
      };
    }
  }

  // Acción: SendViaAdapter
  static async sendViaAdapter(
    context: WorkflowContext,
    jobId: string
  ): Promise<ActionResult> {
    try {
      // Obtener job
      const { data: job, error: jobError } = await supabaseNew
        .from('jobs_integracion')
        .select('*')
        .eq('id', jobId)
        .eq('tenant_id', context.tenantId)
        .single();

      if (jobError || !job) {
        return { ok: false, error: 'Job no encontrado' };
      }

      // Obtener adaptador
      const { data: connector, error: connectorError } = await supabaseNew
        .from('adaptadores')
        .select('*')
        .eq('tenant_id', context.tenantId)
        .eq('plataforma', job.plataforma)
        .single();

      if (connectorError || !connector) {
        return { ok: false, error: 'Adaptador no encontrado' };
      }

      // Simular envío (en producción aquí iría la lógica real)
      const response = await this.simulateTransport(connector, job.payload);

      // Determinar estado
      const estado = response.ok 
        ? (response.status === 'accepted' ? 'aceptado' : 
           response.status === 'rejected' ? 'rechazado' : 'enviado')
        : 'error';

      // Actualizar job
      const { error: updateError } = await supabaseNew
        .from('jobs_integracion')
        .update({
          estado,
          respuesta: response,
          intentos: job.intentos + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId);

      if (updateError) {
        return { ok: false, error: `Error actualizando job: ${updateError.message}` };
      }

      // Programar reintento si es necesario
      if (!response.ok && (response.code === 429 || response.code >= 500) && job.intentos < 5) {
        await this.scheduleRetry(jobId, job.intentos + 1);
      }

      // Auditoría
      await logAuditoria(
        context.tenantId,
        context.userId,
        'integration.sent',
        'job_integracion',
        jobId,
        { estado, response },
        context.ip,
        navigator.userAgent,
        response.ok ? 'success' : 'error'
      );

      return {
        ok: true,
        data: { estado, response }
      };

    } catch (error) {
      console.error('Error sending via adapter:', error);
      return { 
        ok: false, 
        error: error instanceof Error ? error.message : 'Error interno' 
      };
    }
  }

  // Acción: CreateMessage
  static async createMessage(
    context: WorkflowContext,
    tipo: string,
    titulo: string,
    contenido: string,
    prioridad: string,
    vence: string | null,
    destinatarios: string[]
  ): Promise<ActionResult> {
    try {
      const mensajes = destinatarios.map(destinatario => ({
        tenant_id: context.tenantId,
        tipo,
        titulo,
        contenido,
        prioridad,
        vence,
        destinatarios: [destinatario],
        estado: 'programado'
      }));

      const { data, error } = await supabaseNew
        .from('mensajes')
        .insert(mensajes)
        .select();

      if (error) {
        return { ok: false, error: `Error creando mensajes: ${error.message}` };
      }

      return {
        ok: true,
        data: { mensajes_creados: data.length }
      };

    } catch (error) {
      console.error('Error creating message:', error);
      return { 
        ok: false, 
        error: error instanceof Error ? error.message : 'Error interno' 
      };
    }
  }

  // Helpers privados
  private static async isChecklistComplete(
    tenantId: string,
    obraId: string,
    plataforma: string
  ): Promise<boolean> {
    try {
      // Obtener requisitos para la plataforma
      const { data: requisitos, error: reqError } = await supabaseNew
        .from('requisitos_plataforma')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('plataforma', plataforma)
        .eq('obligatorio', true);

      if (reqError) {
        console.error('Error getting requirements:', reqError);
        return false;
      }

      // Verificar que todos los requisitos obligatorios están cumplidos
      for (const requisito of requisitos || []) {
        const { data: documento, error: docError } = await supabaseNew
          .from('documentos')
          .select('id')
          .eq('tenant_id', tenantId)
          .eq('categoria', requisito.categoria)
          .eq('estado', 'aprobado')
          .limit(1)
          .maybeSingle();

        if (docError || !documento) {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error checking checklist completeness:', error);
      return false;
    }
  }

  private static async loadObraContext(tenantId: string, obraId: string) {
    try {
      const { data, error } = await supabaseNew
        .from('obras')
        .select(`
          *,
          empresas!inner(*)
        `)
        .eq('id', obraId)
        .eq('tenant_id', tenantId)
        .single();

      if (error) {
        console.error('Error loading obra context:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error loading obra context:', error);
      return null;
    }
  }

  private static async getRequiredDocs(
    tenantId: string,
    obraId: string,
    plataforma: string
  ) {
    try {
      const { data, error } = await supabaseNew
        .from('requisitos_plataforma')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('plataforma', plataforma);

      if (error) {
        console.error('Error getting required docs:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting required docs:', error);
      return [];
    }
  }

  private static async collectApprovedDocs(
    tenantId: string,
    obraId: string,
    requirements: any[]
  ) {
    try {
      const { data, error } = await supabaseNew
        .from('documentos')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('estado', 'aprobado');

      if (error) {
        console.error('Error collecting approved docs:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error collecting approved docs:', error);
      return [];
    }
  }

  private static buildCommonSchema(obraContext: any, documents: any[]) {
    return {
      Company: {
        cif: obraContext.empresas?.cif || '',
        name: obraContext.empresas?.razon_social || '',
        rea: obraContext.empresas?.rea_numero || '',
        contactEmail: obraContext.empresas?.contacto_email || ''
      },
      Site: {
        code: obraContext.codigo_obra || '',
        name: obraContext.nombre_obra || '',
        client: obraContext.cliente_final || '',
        riskProfile: obraContext.perfil_riesgo || 'media'
      },
      Worker: [],
      Machine: [],
      Docs: documents.map(doc => ({
        entityType: doc.entidad_tipo,
        category: doc.categoria,
        fileUrl: doc.file,
        expiry: doc.caducidad,
        meta: doc.metadatos
      }))
    };
  }

  private static applyMapping(commonSchema: any, rules: any[]) {
    // Aplicar reglas de mapping (implementación simplificada)
    const result = {};
    
    rules.forEach(rule => {
      const sourceValue = this.getValueByPath(commonSchema, rule.from);
      let transformedValue = sourceValue;

      // Aplicar transformación si existe
      if (rule.transform) {
        transformedValue = this.applyTransform(sourceValue, rule.transform);
      }

      this.setValueByPath(result, rule.to, transformedValue);
    });

    return result;
  }

  private static getValueByPath(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  }

  private static setValueByPath(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => {
      if (!current[key]) {
        current[key] = {};
      }
      return current[key];
    }, obj);

    target[lastKey] = value;
  }

  private static applyTransform(value: any, transform: string): any {
    const [transformName, params] = transform.split(':');
    
    switch (transformName) {
      case 'upper':
        return value?.toString().toUpperCase() || '';
      case 'lower':
        return value?.toString().toLowerCase() || '';
      case 'date':
        if (!value) return '';
        const date = new Date(value);
        return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
      case 'map':
        if (!params) return value;
        const mappings = params.split('|').reduce((acc, pair) => {
          const [from, to] = pair.split('=');
          if (from && to) acc[from] = to;
          return acc;
        }, {} as any);
        return mappings[value] || mappings['*'] || value;
      default:
        return value;
    }
  }

  private static async simulateTransport(connector: any, payload: any) {
    // Simular envío HTTP
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const success = Math.random() > 0.2; // 80% éxito
    
    if (success) {
      return {
        ok: true,
        status: 'accepted',
        message: 'Payload enviado exitosamente',
        timestamp: new Date().toISOString()
      };
    } else {
      return {
        ok: false,
        code: Math.random() > 0.5 ? 500 : 400,
        error: 'Error simulado en el envío',
        timestamp: new Date().toISOString()
      };
    }
  }

  private static async scheduleRetry(jobId: string, attempt: number) {
    // Programar reintento con backoff exponencial
    const delays = [60000, 300000, 900000, 3600000, 14400000]; // 1m, 5m, 15m, 1h, 4h
    const delay = delays[Math.min(attempt - 1, delays.length - 1)];
    
    console.log(`📅 Programando reintento para job ${jobId} en ${delay}ms (intento ${attempt})`);
    
    // En producción, usar un sistema de colas como Bull/Agenda
    setTimeout(async () => {
      console.log(`🔄 Ejecutando reintento para job ${jobId}`);
      // Aquí se ejecutaría SendViaAdapter nuevamente
    }, delay);
  }
}

// Exportar funciones de acción individuales
export const {
  adminLogin,
  clientLogin,
  uploadDocument,
  reviewApproveDocument,
  checkAndQueueIntegration,
  buildPackage,
  sendViaAdapter,
  createMessage
} = WorkflowActions;