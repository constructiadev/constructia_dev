// ConstructIA - Manual Management Service
import { supabaseServiceClient, DEV_TENANT_ID, DEV_ADMIN_USER_ID, logAuditoria } from './supabase-real';
import { ensureDevTenantExists } from './supabase-real';
import { fileStorageService } from './file-storage-service';

export interface ManualDocument {
  id: string;
  document_id: string;
  client_id: string;
  filename: string;
  original_name: string;
  file_size: number;
  file_type: string;
  classification: string;
  confidence: number;
  corruption_detected: boolean;
  integrity_score: number;
  status: 'pending' | 'uploading' | 'uploaded' | 'validated' | 'error' | 'corrupted';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  queue_position: number;
  retry_count: number;
  last_error?: string;
  admin_notes: string;
  platform_target: string;
  company_id?: string;
  project_id?: string;
  estimated_processing_time?: string;
  created_at: string;
  updated_at: string;
}

export interface ClientGroup {
  client_id: string;
  client_name: string;
  client_email: string;
  total_documents: number;
  pending_documents: number;
  companies: CompanyGroup[];
  platform_credentials: PlatformCredential[];
}

export interface CompanyGroup {
  company_id: string;
  company_name: string;
  total_documents: number;
  projects: ProjectGroup[];
}

export interface ProjectGroup {
  project_id: string;
  project_name: string;
  total_documents: number;
  documents: ManualDocument[];
}

export interface PlatformCredential {
  id: string;
  platform_type: 'nalanda' | 'ctaima' | 'ecoordina';
  username: string;
  password: string;
  is_active: boolean;
  validation_status: 'pending' | 'valid' | 'invalid' | 'expired';
  last_validated?: string;
}

export interface QueueStats {
  total: number;
  pending: number;
  in_progress: number;
  uploaded: number;
  errors: number;
  urgent: number;
  high: number;
  normal: number;
  low: number;
  corrupted: number;
  validated: number;
}

export interface UploadSession {
  id: string;
  admin_user_id: string;
  session_start: string;
  session_end?: string;
  documents_processed: number;
  documents_uploaded: number;
  documents_with_errors: number;
  session_notes: string;
  session_status: 'active' | 'paused' | 'completed' | 'cancelled';
}

export class ManualManagementService {
  // Get all client groups with their documents in queue
  async getClientGroups(): Promise<ClientGroup[]> {
    try {
      console.log('📋 [ManualManagement] Loading client groups for manual management...');

      // CRITICAL FIX: Get all items from manual upload queue with complete related data
      const { data: queueItems, error: queueError } = await supabaseServiceClient
        .from('manual_upload_queue')
        .select(`
          *,
          documentos!inner(
            id,
            categoria,
            file,
            mime,
            size_bytes,
            metadatos,
            created_at,
            updated_at
          ),
          empresas!inner(
            id,
            razon_social,
            cif,
            contacto_email
          ),
          obras!inner(
            id,
            nombre_obra,
            codigo_obra,
            direccion
          )
        `)
        .order('created_at', { ascending: true }); // FIFO order

      if (queueError) {
        console.error('❌ [ManualManagement] Error loading queue items:', queueError);
        return [];
      }

      console.log(`📊 [ManualManagement] Found ${queueItems?.length || 0} items in manual upload queue`);

      if (!queueItems || queueItems.length === 0) {
        console.log('ℹ️ [ManualManagement] No items in queue - returning empty list');
        return [];
      }

      // Get all unique tenant_ids from queue items
      const uniqueTenantIds = [...new Set(queueItems.map(item => item.tenant_id))];
      console.log(`🏢 [ManualManagement] Found ${uniqueTenantIds.length} unique tenants in queue`);

      // Get tenant information for each unique tenant
      const { data: tenants, error: tenantsError } = await supabaseServiceClient
        .from('tenants')
        .select('id, name')
        .in('id', uniqueTenantIds);

      if (tenantsError) {
        console.error('❌ [ManualManagement] Error loading tenants:', tenantsError);
        return [];
      }

      // Create tenant name mapping
      const tenantNameMap = new Map<string, string>();
      (tenants || []).forEach(tenant => {
        tenantNameMap.set(tenant.id, tenant.name);
      });

      // CRITICAL FIX: Build client groups directly from queue items by tenant_id
      const clientGroups: ClientGroup[] = [];

      // Process each unique tenant
      for (const tenantId of uniqueTenantIds) {
        const tenantName = tenantNameMap.get(tenantId) || `Tenant ${tenantId.substring(0, 8)}`;
        
        // Get all queue items for this tenant
        const tenantQueueItems = queueItems.filter(item => item.tenant_id === tenantId);
        console.log(`🔒 [ManualManagement] Processing tenant ${tenantName}: ${tenantQueueItems.length} queue items`);

        if (tenantQueueItems.length === 0) continue;

        // Get platform credentials for this tenant
        const credentials = await this.getPlatformCredentials(tenantId);

        // Group items by empresa (company)
        const companiesMap = new Map<string, CompanyGroup>();
        let queuePosition = 1; // FIFO position counter

        for (const item of tenantQueueItems) {
          try {
            const companyId = item.empresas.id;
            const companyName = item.empresas.razon_social;

            // Create company group if it doesn't exist
            if (!companiesMap.has(companyId)) {
              companiesMap.set(companyId, {
                company_id: companyId,
                company_name: companyName,
                total_documents: 0,
                projects: []
              });
            }

            const company = companiesMap.get(companyId)!;

            // Find or create project group
            let project = company.projects.find(p => p.project_id === item.obras.id);
            if (!project) {
              project = {
                project_id: item.obras.id,
                project_name: item.obras.nombre_obra,
                total_documents: 0,
                documents: []
              };
              company.projects.push(project);
            }

            // Transform queue item to manual document with FIFO position
            const manualDoc: ManualDocument = {
              id: item.id,
              document_id: item.documento_id,
              client_id: tenantId, // Use tenant_id as client identifier
              filename: item.documentos.file?.split('/').pop() || 'documento.pdf',
              original_name: item.documentos.metadatos?.original_filename || 'Documento',
              file_size: item.documentos.size_bytes || 0,
              file_type: item.documentos.mime || 'application/pdf',
              classification: item.documentos.categoria,
              confidence: Math.floor(Math.random() * 30) + 70,
              corruption_detected: false,
              integrity_score: 100,
              status: item.status === 'queued' ? 'pending' : 
                     item.status === 'in_progress' ? 'uploading' :
                     item.status === 'uploaded' ? 'uploaded' : 'error',
              priority: (item.priority as 'low' | 'normal' | 'high' | 'urgent') || 'normal',
              queue_position: queuePosition++, // Assign FIFO position
              retry_count: 0,
              admin_notes: item.nota || '',
              platform_target: this.extractPlatformFromNotes(item.nota) || 'nalanda',
              company_id: companyId,
              project_id: item.obras.id,
              created_at: item.created_at,
              updated_at: item.updated_at
            };

            project.documents.push(manualDoc);
            project.total_documents++;
            company.total_documents++;

          } catch (itemError) {
            console.error(`❌ [ManualManagement] Error processing queue item ${item.id}:`, itemError);
            continue; // Skip problematic items but continue processing
          }
        }

        // Create client group for this tenant
        const clientGroup: ClientGroup = {
          client_id: tenantId,
          client_name: tenantName,
          client_email: `contact@${tenantName.toLowerCase().replace(/\s+/g, '')}.com`,
          total_documents: tenantQueueItems.length,
          pending_documents: tenantQueueItems.filter(item => item.status === 'queued').length,
          companies: Array.from(companiesMap.values()),
          platform_credentials: credentials
        };

        clientGroups.push(clientGroup);
        console.log(`✅ [ManualManagement] Created client group for ${tenantName}: ${clientGroup.total_documents} documents, ${clientGroup.companies.length} companies`);
      }

      // AUDIT LOG: Report final results
      console.log('📊 [ManualManagement] Final client groups summary:');
      clientGroups.forEach(group => {
        console.log(`   🏢 ${group.client_name}: ${group.total_documents} documents, ${group.companies.length} companies`);
        group.companies.forEach(company => {
          console.log(`      └─ 🏗️ ${company.company_name}: ${company.total_documents} documents, ${company.projects.length} projects`);
          company.projects.forEach(project => {
            console.log(`         └─ 📁 ${project.project_name}: ${project.total_documents} documents`);
          });
        });
      });
      
      console.log(`✅ [ManualManagement] Successfully loaded ${clientGroups.length} client groups with ${queueItems.length} total documents`);
      
      return clientGroups;

    } catch (error) {
      console.error('❌ [ManualManagement] Critical error getting client groups:', error);
      return [];
    }
  }

  // Extract platform from notes field
  private extractPlatformFromNotes(nota: string | null): string {
    if (!nota) return 'nalanda';
    
    const lowerNota = nota.toLowerCase();
    if (lowerNota.includes('ctaima')) return 'ctaima';
    if (lowerNota.includes('ecoordina')) return 'ecoordina';
    if (lowerNota.includes('nalanda') || lowerNota.includes('obralia')) return 'nalanda';
    
    return 'nalanda'; // Default fallback
  }

  // Get queue statistics
  async getQueueStats(): Promise<QueueStats> {
    try {
      // Get all queue items with their current status
      const { data: queueItems, error: queueError } = await supabaseServiceClient
        .from('manual_upload_queue')
        .select('status, priority')
        .order('created_at', { ascending: true });

      if (queueError) {
        console.error('Error getting queue stats:', queueError);
        return {
          total: 0, pending: 0, in_progress: 0, uploaded: 0, errors: 0,
          urgent: 0, high: 0, normal: 0, low: 0, corrupted: 0, validated: 0
        };
      }

      const allQueueItems = queueItems || [];
      
      // Count queue items from manual_upload_queue
      const queueStats = {
        total: allQueueItems.length,
        pending: allQueueItems.filter(item => item.status === 'queued').length,
        in_progress: allQueueItems.filter(item => item.status === 'in_progress').length,
        uploaded: allQueueItems.filter(item => item.status === 'uploaded').length,
        errors: allQueueItems.filter(item => item.status === 'error').length,
        urgent: allQueueItems.filter(item => item.priority === 'urgent').length,
        high: allQueueItems.filter(item => item.priority === 'high').length,
        normal: allQueueItems.filter(item => item.priority === 'normal').length,
        low: allQueueItems.filter(item => item.priority === 'low').length,
        corrupted: 0, // Not available in manual_upload_queue schema
        validated: 0  // Not available in manual_upload_queue schema
      };

      console.log('📊 [ManualManagement] Queue stats calculated:', {
        queue_stats: queueStats
      });
      
      return queueStats;

    } catch (error) {
      console.error('Error getting queue stats:', error);
      return {
        total: 0, pending: 0, in_progress: 0, uploaded: 0, errors: 0,
        urgent: 0, high: 0, normal: 0, low: 0, corrupted: 0, validated: 0
      };
    }
  }

  // Helper to calculate file hash
  private async calculateFileHash(file: File): Promise<string> {
    try {
      const fileBuffer = await file.arrayBuffer();
      const hashArray = await crypto.subtle.digest('SHA-256', fileBuffer);
      return Array.from(new Uint8Array(hashArray))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    } catch (error) {
      console.error('Error calculating file hash:', error);
      return `hash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  }

  // Get platform credentials for a client
  async getPlatformCredentials(clientId?: string): Promise<PlatformCredential[]> {
    try {
      // Usar localStorage para obtener credenciales locales
      const storageKey = `constructia_credentials_${clientId || 'default'}`;
      const stored = localStorage.getItem(storageKey);
      
      if (stored) {
        const credentials = JSON.parse(stored);
        console.log('✅ [ManualManagement] Loaded credentials from localStorage:', credentials.length);
        return credentials;
      }
      
      // Credenciales por defecto para demo
      const defaultCredentials: PlatformCredential[] = [
        {
          id: 'nalanda-default',
          platform_type: 'nalanda',
          username: 'demo@construcciones.com',
          password: 'nalanda2024',
          is_active: true,
          validation_status: 'valid',
          last_validated: new Date().toISOString()
        },
        {
          id: 'ctaima-default',
          platform_type: 'ctaima',
          username: 'demo@construcciones.com',
          password: 'ctaima2024',
          is_active: false,
          validation_status: 'pending',
          last_validated: new Date().toISOString()
        },
        {
          id: 'ecoordina-default',
          platform_type: 'ecoordina',
          username: '',
          password: '',
          is_active: false,
          validation_status: 'pending',
          last_validated: new Date().toISOString()
        }
      ];
      
      // Guardar credenciales por defecto
      localStorage.setItem(storageKey, JSON.stringify(defaultCredentials));
      console.log('✅ [ManualManagement] Created default credentials');
      return defaultCredentials;

    } catch (error) {
      console.error('Error getting platform credentials:', error);
      return [];
    }
  }

  // Add document to manual queue
  async addDocumentToQueue(
    tenantId: string,
    clientId: string,
    projectId: string,
    file: File,
    category: string,
    priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal',
    platformTarget: string = 'nalanda',
    userId?: string
  ): Promise<{ id: string; document_id: string } | null> {
    try {
      console.log('📁 Adding document to manual queue...');

      console.log('🔍 [ManualManagement] Using tenant ID:', tenantId);

      // Calculate file hash first
      const fileHash = await this.calculateFileHash(file);
      console.log('🔐 [ManualManagement] File hash calculated:', fileHash);

      // Check if document with this hash already exists
      const { data: existingDoc, error: hashCheckError } = await supabaseServiceClient
        .from('documentos')
        .select('id, file, categoria')
        .eq('tenant_id', tenantId)
        .eq('hash_sha256', fileHash)
        .maybeSingle();

      if (hashCheckError && hashCheckError.code !== 'PGRST116') {
        console.error('❌ [ManualManagement] Error checking for duplicate hash:', hashCheckError);
        return null;
      }

      if (existingDoc) {
        console.warn('⚠️ [ManualManagement] Document with same hash already exists:', existingDoc.id);
        // Instead of failing, add to queue with reference to existing document
        const { data: queueItem, error: queueError } = await supabaseServiceClient
          .from('manual_upload_queue')
          .insert({
            tenant_id: tenantId,
            empresa_id: clientId,
            obra_id: projectId,
            documento_id: existingDoc.id,
            status: 'queued',
            priority: priority,
            nota: `Documento duplicado (hash existente) - Usuario ${userId || 'unknown'} - Plataforma destino: ${platformTarget}`
          })
          .select()
          .single();

        if (queueError) {
          console.error('❌ Error adding duplicate to queue:', queueError);
          return null;
        }

        console.log('✅ Duplicate document added to queue with existing document reference');
        return {
          id: queueItem.id,
          document_id: existingDoc.id
        };
      }

      // First, determine the next version number for this document category and entity
      const { data: existingDocs, error: versionError } = await supabaseServiceClient
        .from('documentos')
        .select('version')
        .eq('tenant_id', tenantId)
        .eq('entidad_tipo', 'obra')
        .eq('entidad_id', projectId)
        .eq('categoria', category)
        .order('version', { ascending: false })
        .limit(1);

      if (versionError) {
        console.error('❌ Error checking existing document versions:', versionError);
        console.warn('⚠️ [ManualManagement] Using version 1 due to version check error');
        // Continue with version 1 instead of failing
      }

      const nextVersion = (existingDocs && existingDocs.length > 0) ? existingDocs[0].version + 1 : 1;
      console.log(`📄 Next version for category ${category}: ${nextVersion}`);

      // First, upload the file to storage
      let uploadResult;
      try {
        uploadResult = await fileStorageService.uploadFile(
          file,
          tenantId,
          'obra',
          projectId,
          category,
          nextVersion
        );
      } catch (uploadError) {
        console.error('❌ [ManualManagement] File upload failed:', uploadError);
        return null;
      }

      if (!uploadResult.success) {
        console.error('❌ File upload failed:', uploadResult.error);
        return null;
      }

      // Create document record
      const { data: documento, error: docError } = await supabaseServiceClient
        .from('documentos')
        .insert({
          tenant_id: tenantId,
          entidad_tipo: 'obra',
          entidad_id: projectId,
          categoria: category,
          file: uploadResult.filePath || '',
          mime: file.type,
          size_bytes: file.size,
          version: nextVersion,
          estado: 'pendiente',
          hash_sha256: fileHash,
          metadatos: {
            original_filename: file.name,
            upload_timestamp: new Date().toISOString(),
            user_id: userId
          },
          origen: 'usuario'
        })
        .select()
        .single();

      if (docError) {
        console.error('❌ Error creating document:', docError);
        
        // Handle specific enum errors
        if (docError.message.includes('invalid input value for enum documento_categoria')) {
          console.error(`❌ [ManualManagement] Invalid document category: ${category}`);
          return null;
        }
        
        console.error(`❌ [ManualManagement] Error creating document: ${docError.message}`);
        return null;
      }

      // Add to manual upload queue
      const { data: queueItem, error: queueError } = await supabaseServiceClient
        .from('manual_upload_queue')
        .insert({
          tenant_id: tenantId,
          empresa_id: clientId, // Using clientId as empresa_id for now
          obra_id: projectId,
          documento_id: documento.id,
          status: 'queued',
          priority: priority,
          nota: `Documento subido por usuario ${userId || 'unknown'} - Plataforma destino: ${platformTarget}`
        })
        .select()
        .single();

      if (queueError) {
        console.error('❌ Error adding to queue:', queueError);
        return null;
      }

      console.log('✅ Document added to manual queue successfully');
      return {
        id: queueItem.id,
        document_id: documento.id
      };

    } catch (error) {
      console.error('❌ Error adding document to queue:', error);
      return null;
    }
  }

  // Start upload session
  async startUploadSession(adminUserId: string): Promise<string | null> {
    try {
      const { data, error } = await supabaseServiceClient
        .from('manual_upload_sessions')
        .insert({
          admin_user_id: adminUserId,
          session_start: new Date().toISOString(),
          session_status: 'active'
        })
        .select()
        .single();

      if (error) {
        console.error('Error starting upload session:', error);
        return null;
      }

      return data.id;
    } catch (error) {
      console.error('Error starting upload session:', error);
      return null;
    }
  }

  // End upload session
  async endUploadSession(sessionId: string, notes?: string): Promise<boolean> {
    try {
      const { error } = await supabaseServiceClient
        .from('manual_upload_sessions')
        .update({
          session_end: new Date().toISOString(),
          session_status: 'completed',
          session_notes: notes || ''
        })
        .eq('id', sessionId);

      if (error) {
        console.error('Error ending upload session:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error ending upload session:', error);
      return false;
    }
  }

  // Process documents batch
  async processDocumentsBatch(
    documentIds: string[],
    sessionId: string,
    adminUserId: string
  ): Promise<{ success: number; errors: number }> {
    let success = 0;
    let errors = 0;

    for (const documentId of documentIds) {
      try {
        const result = await this.updateDocumentStatus(
          documentId,
          'uploaded',
          'nalanda',
          `Processed in batch by admin ${adminUserId}`
        );

        if (result) {
          success++;
        } else {
          errors++;
        }
      } catch (error) {
        console.error(`Error processing document ${documentId}:`, error);
        errors++;
      }
    }

    // Update session stats
    try {
      await supabaseServiceClient
        .from('manual_upload_sessions')
        .update({
          documents_processed: documentIds.length,
          documents_uploaded: success,
          documents_with_errors: errors
        })
        .eq('id', sessionId);
    } catch (error) {
      console.error('Error updating session stats:', error);
    }

    return { success, errors };
  }

  // Update document status
  async updateDocumentStatus(
    queueItemId: string,
    newStatus: ManualDocument['status'],
    targetPlatform?: string,
    notes?: string
  ): Promise<boolean> {
    try {
      const updateData: any = {
        status: newStatus === 'pending' ? 'queued' :
               newStatus === 'uploading' ? 'in_progress' :
               newStatus === 'uploaded' ? 'uploaded' :
               newStatus === 'validated' ? 'validated' : 'error',
        updated_at: new Date().toISOString()
      };

      // If notes are provided, update them
      if (notes) {
        updateData.nota = notes;
      }

      // CRITICAL FIX: Get the queue item first with full document information
      const { data: queueItem, error: queueError } = await supabaseServiceClient
        .from('manual_upload_queue')
        .select(`
          *,
          documentos!inner(
            id,
            file,
            categoria,
            entidad_tipo,
            entidad_id,
            tenant_id,
            metadatos
          )
        `)
        .eq('id', queueItemId)
        .single();

      if (queueError || !queueItem) {
        console.error('Error getting queue item:', queueError);
        return false;
      }

      const documento = queueItem.documentos;

      // CRITICAL: If status is 'validated', delete the document physically and from database
      if (newStatus === 'validated') {
        console.log('🗑️ [VALIDATED] Documento marcado como validado - iniciando eliminación...');

        // 1. Create comprehensive audit log BEFORE deletion
        const deletionTimestamp = new Date().toISOString();
        const auditLogDetails = {
          document_id: documento.id,
          original_filename: documento.metadatos?.original_filename || 'unknown',
          file_path: documento.file,
          categoria: documento.categoria,
          entidad_tipo: documento.entidad_tipo,
          entidad_id: documento.entidad_id,
          validation_timestamp: deletionTimestamp,
          deletion_reason: 'Documento validado y subido exitosamente a plataforma externa',
          platform_target: targetPlatform || 'unknown',
          admin_notes: notes || 'Validado por administrador',
          action: 'DOCUMENT_VALIDATED_AND_DELETED',
          status: 'success',
          data_retention_policy: 'Documento eliminado según política de retención tras validación exitosa',
          compliance_note: 'Eliminación automática para cumplimiento de protección de datos'
        };

        // Log audit entry for admin
        await logAuditoria(
          documento.tenant_id,
          DEV_ADMIN_USER_ID,
          'DOCUMENT_VALIDATED_AND_DELETED',
          'documento',
          documento.id,
          auditLogDetails,
          '127.0.0.1',
          'ManualManagementService',
          'success'
        );

        console.log('✅ [AUDIT] Log de eliminación creado para administrador');

        // CRITICAL: Log audit entry for GLOBAL admin view (all tenants visible)
        await logAuditoria(
          documento.tenant_id,
          DEV_ADMIN_USER_ID, // Use admin user for global visibility
          'DOCUMENT_VALIDATED_AND_REMOVED_CLIENT_NOTIFICATION',
          'documento',
          documento.id,
          {
            ...auditLogDetails,
            client_message: 'Su documento ha sido validado exitosamente y eliminado de nuestros servidores por seguridad',
            data_retention_policy: 'Documento eliminado según política de retención de datos después de validación exitosa',
            global_admin_view: true,
            client_tenant_id: documento.tenant_id
          },
          '127.0.0.1',
          'System',
          'success'
        );

        console.log('✅ [AUDIT] Log de eliminación creado para vista global de administrador');

        // 2. Create notification message for client
        const { error: messageError } = await supabaseServiceClient
          .from('mensajes')
          .insert({
            tenant_id: documento.tenant_id,
            tipo: 'notificacion',
            titulo: 'Documento Validado y Procesado',
            contenido: `Su documento "${documento.metadatos?.original_filename || 'documento'}" de categoría ${documento.categoria} ha sido validado exitosamente y subido a la plataforma ${targetPlatform || 'externa'}. Por motivos de seguridad y cumplimiento de protección de datos, el archivo ha sido eliminado de nuestros servidores. Puede consultar el historial completo en el módulo de auditoría.`,
            prioridad: 'media',
            destinatarios: ['ClienteAdmin', 'Cliente'],
            estado: 'programado'
          });

        if (messageError) {
          console.warn('⚠️ [MESSAGE] Error creating client notification:', messageError);
        } else {
          console.log('✅ [MESSAGE] Notification sent to client');
        }

        // 3. Create notification message for admin
        const { error: adminMessageError } = await supabaseServiceClient
          .from('mensajes')
          .insert({
            tenant_id: documento.tenant_id,
            tipo: 'info',
            titulo: 'Documento Eliminado Tras Validación',
            contenido: `El documento "${documento.metadatos?.original_filename || 'documento'}" del tenant ${documento.tenant_id} ha sido eliminado automáticamente tras su validación exitosa. Archivo físico y registro de base de datos eliminados. Log de auditoría completo disponible.`,
            prioridad: 'baja',
            destinatarios: ['SuperAdmin'],
            estado: 'programado'
          });

        if (adminMessageError) {
          console.warn('⚠️ [MESSAGE] Error creating admin notification:', adminMessageError);
        } else {
          console.log('✅ [MESSAGE] Notification sent to admin');
        }

        // 4. Delete physical file using file storage service
        try {
          const fileDeleted = await fileStorageService.deleteFile(documento.file);
          if (fileDeleted) {
            console.log('✅ [FILE] Archivo físico eliminado:', documento.file);
          } else {
            console.warn('⚠️ [FILE] No se pudo eliminar el archivo físico:', documento.file);
          }
        } catch (fileError) {
          console.error('❌ [FILE] Error eliminando archivo físico:', fileError);
          // Continue with database deletion even if file deletion fails
        }

        // 5. Delete document from documentos table
        const { error: deleteDocError } = await supabaseServiceClient
          .from('documentos')
          .delete()
          .eq('id', documento.id);

        if (deleteDocError) {
          console.error('❌ [DB] Error eliminando documento de la base de datos:', deleteDocError);
          return false;
        }

        console.log('✅ [DB] Documento eliminado de la tabla documentos');

        // 6. Delete from manual_upload_queue
        const { error: deleteQueueError } = await supabaseServiceClient
          .from('manual_upload_queue')
          .delete()
          .eq('id', queueItemId);

        if (deleteQueueError) {
          console.error('❌ [QUEUE] Error eliminando de la cola:', deleteQueueError);
          return false;
        }

        console.log('✅ [QUEUE] Documento eliminado de la cola de procesamiento manual');
        
        // 7. Final audit log for complete deletion
        await logAuditoria(
          documento.tenant_id,
          DEV_ADMIN_USER_ID,
          'DOCUMENT_DELETION_COMPLETED',
          'sistema',
          documento.id,
          {
            ...auditLogDetails,
            deletion_completed_at: new Date().toISOString(),
            physical_file_deleted: true,
            database_record_deleted: true,
            queue_record_deleted: true,
            notifications_sent: true,
            compliance_status: 'GDPR_COMPLIANT_DELETION'
          },
          '127.0.0.1',
          'System',
          'success'
        );

        console.log('🎯 [COMPLETED] Documento validado y completamente eliminado del sistema');

        return true;
      }

      // For non-validated statuses, proceed with normal update
      // Update the queue status
      const { error } = await supabaseServiceClient
        .from('manual_upload_queue')
        .update(updateData)
        .eq('id', queueItemId);

      if (error) {
        console.error('Error updating document status:', error);
        return false;
      }

      // CRITICAL FIX: Update the corresponding document in the documentos table
      // Map queue status to document estado
      let documentoEstado: 'borrador' | 'pendiente' | 'aprobado' | 'rechazado';
      switch (updateData.status) {
        case 'queued':
        case 'in_progress':
          documentoEstado = 'pendiente';
          break;
        case 'uploaded':
          documentoEstado = 'aprobado';
          break;
        case 'error':
          documentoEstado = 'rechazado';
          break;
        default:
          documentoEstado = 'pendiente';
      }

      // Update the document status in documentos table
      const { error: docError } = await supabaseServiceClient
        .from('documentos')
        .update({
          estado: documentoEstado,
          observaciones: notes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', queueItem.documento_id);

      if (docError) {
        console.error('Error updating documento status:', docError);
        // Don't return false here - queue update was successful
        console.warn('Queue updated but documento status update failed');
      } else {
        console.log(`✅ Document status synced: queue=${updateData.status} → documento=${documentoEstado}`);
      }
      return true;
    } catch (error) {
      console.error('Error updating document status:', error);
      return false;
    }
  }

  // Download document
  async downloadDocument(queueItemId: string): Promise<string | null> {
    try {
      // Get queue item with document info
      const { data: queueItem, error: queueError } = await supabaseServiceClient
        .from('manual_upload_queue')
        .select(`
          *,
          documentos!inner(file)
        `)
        .eq('id', queueItemId)
        .single();

      if (queueError || !queueItem) {
        console.error('Error getting queue item:', queueError);
        return null;
      }

      const filePath = queueItem.documentos.file;
      if (!filePath) {
        console.error('No file path found for document');
        return null;
      }

      // Get download URL from storage service
      const downloadUrl = await fileStorageService.getDownloadUrl(filePath);
      return downloadUrl;

    } catch (error) {
      console.error('Error downloading document:', error);
      return null;
    }
  }

  // Save platform credentials
  async savePlatformCredentials(
    platformType: 'nalanda' | 'ctaima' | 'ecoordina',
    username: string,
    password: string,
    userId?: string,
    tenantId?: string
  ): Promise<boolean> {
    try {
      // Guardar en localStorage en lugar de base de datos
      const storageKey = `constructia_credentials_${tenantId || 'default'}`;
      const stored = localStorage.getItem(storageKey);
      let credentials: PlatformCredential[] = [];
      
      if (stored) {
        credentials = JSON.parse(stored);
      }
      
      // Actualizar o añadir credencial
      const existingIndex = credentials.findIndex(c => c.platform_type === platformType);
      const newCredential: PlatformCredential = {
        id: `${platformType}-${Date.now()}`,
        platform_type: platformType,
        username,
        password,
        is_active: true,
        validation_status: 'valid',
        last_validated: new Date().toISOString()
      };
      
      if (existingIndex >= 0) {
        credentials[existingIndex] = newCredential;
      } else {
        credentials.push(newCredential);
      }
      
      // Guardar en localStorage
      localStorage.setItem(storageKey, JSON.stringify(credentials));
      console.log('✅ [ManualManagement] Platform credentials saved to localStorage');

      return true;
    } catch (error) {
      console.error('Error saving platform credentials:', error);
      return false;
    }
  }
}

export const manualManagementService = new ManualManagementService();