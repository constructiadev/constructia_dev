// ConstructIA - Motor de Workflows y Automatizaciones
import { supabaseNew, logAuditoria } from './supabase-new';
import { geminiProcessor } from './gemini-document-processor';
import { validationEngine, ValidationEngine } from './validation-engine';
import { systemConfig } from './system-config';
import type { 
  NewDocumento, 
  Tarea, 
  DocumentoCategoria, 
  EntidadTipo,
  TareaTipo,
  DocumentoEstado 
} from '../types';

export interface DocumentUploadParams {
  tenantId: string;
  userId: string;
  entidadTipo: EntidadTipo;
  entidadId: string;
  categoria: DocumentoCategoria;
  file: File;
  observaciones?: string;
}

export interface WorkflowResult {
  success: boolean;
  documentoId?: string;
  tareaId?: string;
  errors: string[];
  warnings: string[];
  actions: string[];
}

export class WorkflowEngine {
  // 3.1 Subida de Documento (usuario)
  async processDocumentUpload(params: DocumentUploadParams): Promise<WorkflowResult> {
    const { tenantId, userId, entidadTipo, entidadId, categoria, file, observaciones } = params;
    const errors: string[] = [];
    const warnings: string[] = [];
    const actions: string[] = [];

    try {
      // Step 1: Validar archivo
      const fileValidation = validationEngine.validateFile(file);
      if (!fileValidation.isValid) {
        return {
          success: false,
          errors: fileValidation.errors,
          warnings: fileValidation.warnings,
          actions: []
        };
      }
      warnings.push(...fileValidation.warnings);

      // Step 2: Calcular hash y verificar duplicados
      const fileBuffer = await file.arrayBuffer();
      const hashArray = await crypto.subtle.digest('SHA-256', fileBuffer);
      const hashHex = Array.from(new Uint8Array(hashArray))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      // Verificar si existe documento con mismo hash
      const { data: existingDoc, error: hashError } = await supabaseNew
        .from('documentos')
        .select('version')
        .eq('tenant_id', tenantId)
        .eq('hash_sha256', hashHex)
        .eq('entidad_tipo', entidadTipo)
        .eq('entidad_id', entidadId)
        .eq('categoria', categoria)
        .order('version', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (hashError && hashError.code !== 'PGRST116') {
        errors.push(`Error verificando duplicados: ${hashError.message}`);
        return { success: false, errors, warnings, actions };
      }

      const version = existingDoc ? existingDoc.version + 1 : 1;

      // Step 3: Procesar con Gemini AI
      const extraction = await geminiProcessor.processDocument(
        fileBuffer,
        file.name,
        file.type
      );

      // Step 4: Validar extracción
      const extractionValidation = validationEngine.validateExtraction(
        extraction,
        categoria,
        entidadTipo
      );
      
      warnings.push(...extractionValidation.warnings);
      if (!extractionValidation.isValid) {
        errors.push(...extractionValidation.errors);
      }
      actions.push(...extractionValidation.requiredActions);

      // Step 5: Crear documento en base de datos
      const documentoData: Partial<NewDocumento> = {
        tenant_id: tenantId,
        entidad_tipo: entidadTipo,
        entidad_id: entidadId,
        categoria,
        file: `${tenantId}/${entidadTipo}/${entidadId}/${categoria}/${hashHex}.${file.name.split('.').pop()}`,
        mime: file.type,
        size_bytes: file.size,
        hash_sha256: hashHex,
        version,
        estado: extractionValidation.isValid ? 'pendiente' : 'borrador',
        caducidad: extraction.campos.fecha_caducidad || null,
        emisor: extraction.campos.empresa || null,
        observaciones,
        metadatos: {
          ai_extraction: extraction,
          original_filename: file.name,
          upload_timestamp: new Date().toISOString(),
          user_id: userId
        },
        origen: 'usuario'
      };

      const { data: documento, error: docError } = await supabaseNew
        .from('documentos')
        .insert(documentoData)
        .select()
        .single();

      if (docError) {
        errors.push(`Error creando documento: ${docError.message}`);
        return { success: false, errors, warnings, actions };
      }

      // Step 6: Crear tarea de revisión
      const tareaData: Partial<Tarea> = {
        tenant_id: tenantId,
        tipo: actions.includes('subsanar') ? 'subsanar' : 'revisar',
        documento_id: documento.id,
        asignado_role: 'GestorDocumental',
        vencimiento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 días
        estado: 'abierta',
        comentarios: `Documento subido por usuario. ${actions.length > 0 ? `Acciones requeridas: ${actions.join(', ')}` : 'Revisión estándar'}`
      };

      const { data: tarea, error: tareaError } = await supabaseNew
        .from('tareas')
        .insert(tareaData)
        .select()
        .single();

      if (tareaError) {
        warnings.push(`Error creando tarea: ${tareaError.message}`);
      }

      // Step 7: Auditoría
      await logAuditoria(
        tenantId,
        userId,
        'document.uploaded',
        'documento',
        documento.id,
        {
          categoria,
          entidad_tipo: entidadTipo,
          entidad_id: entidadId,
          file_size: file.size,
          ai_confidence: extraction.confianza,
          validation_result: extractionValidation
        }
      );

      return {
        success: true,
        documentoId: documento.id,
        tareaId: tarea?.id,
        errors,
        warnings,
        actions
      };

    } catch (error) {
      console.error('Error in document upload workflow:', error);
      return {
        success: false,
        errors: [`Error interno: ${error instanceof Error ? error.message : 'Error desconocido'}`],
        warnings,
        actions
      };
    }
  }

  // 3.2 Revisión → Aprobación
  async processDocumentReview(
    tenantId: string,
    userId: string,
    documentoId: string,
    action: 'aprobar' | 'rechazar',
    comentarios?: string
  ): Promise<WorkflowResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const actions: string[] = [];

    try {
      // Obtener documento
      const { data: documento, error: docError } = await supabaseNew
        .from('documentos')
        .select('*, obras(*)')
        .eq('id', documentoId)
        .eq('tenant_id', tenantId)
        .single();

      if (docError || !documento) {
        errors.push('Documento no encontrado');
        return { success: false, errors, warnings, actions };
      }

      // Actualizar estado del documento
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
        errors.push(`Error actualizando documento: ${updateError.message}`);
        return { success: false, errors, warnings, actions };
      }

      // Cerrar tarea relacionada
      const { error: tareaError } = await supabaseNew
        .from('tareas')
        .update({
          estado: 'resuelta',
          comentarios: `${action === 'aprobar' ? 'Aprobado' : 'Rechazado'} por ${userId}. ${comentarios || ''}`,
          updated_at: new Date().toISOString()
        })
        .eq('documento_id', documentoId)
        .eq('tenant_id', tenantId);

      if (tareaError) {
        warnings.push(`Error cerrando tarea: ${tareaError.message}`);
      }

      // Si se aprueba y la obra tiene plataforma destino, preparar paquete
      if (action === 'aprobar' && documento.obras?.plataforma_destino) {
        actions.push('preparar_paquete');
        // Aquí se podría disparar automáticamente el workflow de preparación de paquete
      }

      // Auditoría
      await logAuditoria(
        tenantId,
        userId,
        `document.${action}`,
        'documento',
        documentoId,
        {
          nuevo_estado: nuevoEstado,
          comentarios,
          obra_id: documento.obras?.id
        }
      );

      return {
        success: true,
        documentoId,
        errors,
        warnings,
        actions
      };

    } catch (error) {
      console.error('Error in document review workflow:', error);
      return {
        success: false,
        errors: [`Error interno: ${error instanceof Error ? error.message : 'Error desconocido'}`],
        warnings,
        actions
      };
    }
  }

  // 3.3 Preparar y Enviar Paquete (por Obra)
  async buildAndSendPackage(
    tenantId: string,
    userId: string,
    obraId: string,
    plataforma: string
  ): Promise<WorkflowResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const actions: string[] = [];

    try {
      // Obtener obra y documentos requeridos
      const { data: obra, error: obraError } = await supabaseNew
        .from('obras')
        .select(`
          *,
          empresas(*),
          documentos(*)
        `)
        .eq('id', obraId)
        .eq('tenant_id', tenantId)
        .single();

      if (obraError || !obra) {
        errors.push('Obra no encontrada');
        return { success: false, errors, warnings, actions };
      }

      // Verificar documentos requeridos
      const { data: requisitos, error: reqError } = await supabaseNew
        .from('requisitos_plataforma')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('plataforma', plataforma)
        .eq('perfil_riesgo', obra.perfil_riesgo);

      if (reqError) {
        warnings.push(`Error obteniendo requisitos: ${reqError.message}`);
      }

      // Verificar completitud del checklist
      const documentosAprobados = obra.documentos.filter((d: any) => d.estado === 'aprobado');
      const requisitosObligatorios = requisitos?.filter(r => r.obligatorio) || [];
      
      const faltantes = requisitosObligatorios.filter(req => 
        !documentosAprobados.some((doc: any) => 
          doc.categoria === req.categoria && 
          doc.entidad_tipo === req.aplica_a
        )
      );

      if (faltantes.length > 0) {
        errors.push(`Documentos faltantes: ${faltantes.map(f => f.categoria).join(', ')}`);
        return { success: false, errors, warnings, actions };
      }

      // Crear job de integración
      const { data: job, error: jobError } = await supabaseNew
        .from('jobs_integracion')
        .insert({
          tenant_id: tenantId,
          plataforma,
          obra_id: obraId,
          payload: {
            obra: obra,
            documentos: documentosAprobados,
            timestamp: new Date().toISOString()
          },
          estado: 'pendiente',
          trace_id: `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        })
        .select()
        .single();

      if (jobError) {
        errors.push(`Error creando job: ${jobError.message}`);
        return { success: false, errors, warnings, actions };
      }

      // Auditoría
      await logAuditoria(
        tenantId,
        userId,
        'package.prepared',
        'obra',
        obraId,
        {
          plataforma,
          job_id: job.id,
          documentos_count: documentosAprobados.length
        }
      );

      actions.push('job_created');

      return {
        success: true,
        errors,
        warnings,
        actions
      };

    } catch (error) {
      console.error('Error building package:', error);
      return {
        success: false,
        errors: [`Error interno: ${error instanceof Error ? error.message : 'Error desconocido'}`],
        warnings,
        actions
      };
    }
  }

  // 3.4 Caducidades y Alertas (job diario)
  async processExpiryAlerts(tenantId: string): Promise<WorkflowResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const actions: string[] = [];

    try {
      const alertDays = systemConfig.getAlertDays();
      const today = new Date();
      
      // Calcular fechas de alerta
      const alertDates = alertDays.map(days => {
        const alertDate = new Date(today);
        alertDate.setDate(alertDate.getDate() + days);
        return alertDate.toISOString().split('T')[0];
      });

      // Buscar documentos próximos a caducar
      const { data: documentosProximos, error: docError } = await supabaseNew
        .from('documentos')
        .select('*')
        .eq('tenant_id', tenantId)
        .in('caducidad', alertDates)
        .eq('estado', 'aprobado');

      if (docError) {
        errors.push(`Error obteniendo documentos próximos: ${docError.message}`);
        return { success: false, errors, warnings, actions };
      }

      // Crear tareas de subsanación para documentos próximos a caducar
      const tareasData = documentosProximos?.map(doc => ({
        tenant_id: tenantId,
        tipo: 'subsanar' as TareaTipo,
        documento_id: doc.id,
        asignado_role: 'GestorDocumental',
        vencimiento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        estado: 'abierta' as const,
        comentarios: `Documento próximo a caducar el ${doc.caducidad}. Renovación requerida.`
      })) || [];

      if (tareasData.length > 0) {
        const { error: tareasError } = await supabaseNew
          .from('tareas')
          .insert(tareasData);

        if (tareasError) {
          warnings.push(`Error creando tareas: ${tareasError.message}`);
        } else {
          actions.push(`${tareasData.length}_tareas_creadas`);
        }
      }

      // Crear mensajes de notificación
      const mensajesData = documentosProximos?.map(doc => ({
        tenant_id: tenantId,
        tipo: 'alerta' as const,
        titulo: 'Documento próximo a caducar',
        contenido: `El documento ${doc.categoria} caduca el ${doc.caducidad}`,
        prioridad: 'alta' as const,
        destinatarios: ['GestorDocumental', 'ClienteAdmin'],
        estado: 'programado' as const
      })) || [];

      if (mensajesData.length > 0) {
        const { error: mensajesError } = await supabaseNew
          .from('mensajes')
          .insert(mensajesData);

        if (mensajesError) {
          warnings.push(`Error creando mensajes: ${mensajesError.message}`);
        }
      }

      return {
        success: true,
        errors,
        warnings,
        actions
      };

    } catch (error) {
      console.error('Error processing expiry alerts:', error);
      return {
        success: false,
        errors: [`Error interno: ${error instanceof Error ? error.message : 'Error desconocido'}`],
        warnings,
        actions
      };
    }
  }

  // Crear tarea
  async createTask(
    tenantId: string,
    tipo: TareaTipo,
    documentoId?: string,
    obraId?: string,
    asignadoRole?: string,
    asignadoUser?: string,
    vencimiento?: string,
    comentarios?: string
  ): Promise<string | null> {
    try {
      const { data: tarea, error } = await supabaseNew
        .from('tareas')
        .insert({
          tenant_id: tenantId,
          tipo,
          documento_id: documentoId,
          obra_id: obraId,
          asignado_role: asignadoRole,
          asignado_user: asignadoUser,
          vencimiento: vencimiento || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          comentarios
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating task:', error);
        return null;
      }

      return tarea.id;
    } catch (error) {
      console.error('Error creating task:', error);
      return null;
    }
  }

  // Actualizar estado de tarea
  async updateTaskStatus(
    tenantId: string,
    tareaId: string,
    estado: 'abierta' | 'en_progreso' | 'resuelta',
    comentarios?: string
  ): Promise<boolean> {
    try {
      const { error } = await supabaseNew
        .from('tareas')
        .update({
          estado,
          comentarios,
          updated_at: new Date().toISOString()
        })
        .eq('id', tareaId)
        .eq('tenant_id', tenantId);

      if (error) {
        console.error('Error updating task status:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating task status:', error);
      return false;
    }
  }
}

export const workflowEngine = new WorkflowEngine();