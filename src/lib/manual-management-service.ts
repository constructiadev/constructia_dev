// ConstructIA - Manual Management Service
import { supabaseServiceClient, DEV_TENANT_ID, DEV_ADMIN_USER_ID, logAuditoria } from './supabase-real';
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
      console.log('📋 Loading client groups for manual management...');

      // Get all items from manual upload queue with related data
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
            razon_social
          ),
          obras!inner(
            id,
            nombre_obra,
            codigo_obra
          )
        `)
        .order('created_at', { ascending: false });

      if (queueError) {
        console.error('Error loading queue items:', queueError);
        return [];
      }

      // Get all clients from the old schema for client information
      const { data: clients, error: clientsError } = await supabaseServiceClient
        .from('clients')
        .select('*')
        .order('company_name');

      if (clientsError) {
        console.error('Error loading clients:', clientsError);
        return [];
      }

      // Group queue items by client
      const clientGroups: ClientGroup[] = [];

      // Process each client
      for (const client of clients) {
        // Get queue items for this client (using empresa_id as proxy for client relationship)
        const clientQueueItems = queueItems?.filter(item => {
          // In the new schema, we need to map client to tenant
          // For now, we'll use a simple mapping
          return true; // Include all items for demo
        }) || [];

        if (clientQueueItems.length === 0) continue;

        // Get platform credentials for this client
        const credentials = await this.getPlatformCredentials(client.id);

        // Group by company
        const companiesMap = new Map<string, CompanyGroup>();

        for (const item of clientQueueItems) {
          const companyId = item.empresas.id;
          const companyName = item.empresas.razon_social;

          if (!companiesMap.has(companyId)) {
            companiesMap.set(companyId, {
              company_id: companyId,
              company_name: companyName,
              total_documents: 0,
              projects: []
            });
          }

          const company = companiesMap.get(companyId)!;

          // Group by project
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

          // Transform queue item to manual document
          const manualDoc: ManualDocument = {
            id: item.id,
            document_id: item.documento_id,
            client_id: client.id,
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
            priority: item.priority || 'normal',
            queue_position: Math.floor(Math.random() * 100) + 1,
            retry_count: 0,
            admin_notes: item.nota || '',
            platform_target: 'nalanda',
            company_id: companyId,
            project_id: item.obras.id,
            created_at: item.created_at,
            updated_at: item.updated_at
          };

          project.documents.push(manualDoc);
          project.total_documents++;
          company.total_documents++;
        }

        const clientGroup: ClientGroup = {
          client_id: client.id,
          client_name: client.company_name,
          client_email: client.email,
          total_documents: clientQueueItems.length,
          pending_documents: clientQueueItems.filter(item => item.status === 'queued').length,
          companies: Array.from(companiesMap.values()),
          platform_credentials: credentials
        };

        clientGroups.push(clientGroup);
      }

      console.log('✅ Client groups loaded:', clientGroups.length);
      return clientGroups;

    } catch (error) {
      console.error('Error getting client groups:', error);
      return [];
    }
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

      // Get all documents from manual_document_queue for additional stats
      const { data: manualQueueItems, error: manualError } = await supabaseServiceClient
        .from('manual_document_queue')
        .select('manual_status, priority, corruption_detected')
        .order('created_at', { ascending: true });

      if (manualError) {
        console.warn('Error getting manual queue stats:', manualError);
      }

      // Combine both queue sources for comprehensive stats
      const allQueueItems = queueItems || [];
      const allManualItems = manualQueueItems || [];
      
      // Count upload queue items
      const uploadQueueStats = {
        total: allQueueItems.length,
        pending: allQueueItems.filter(item => item.status === 'queued').length,
        in_progress: allQueueItems.filter(item => item.status === 'in_progress').length,
        uploaded: allQueueItems.filter(item => item.status === 'uploaded').length,
        errors: allQueueItems.filter(item => item.status === 'error').length,
        urgent: allQueueItems.filter(item => item.priority === 'urgent').length,
        high: allQueueItems.filter(item => item.priority === 'high').length,
        normal: allQueueItems.filter(item => item.priority === 'normal').length,
        low: allQueueItems.filter(item => item.priority === 'low').length
      };

      // Count manual queue items
      const manualQueueStats = {
        total: allManualItems.length,
        pending: allManualItems.filter(item => item.manual_status === 'pending').length,
        in_progress: allManualItems.filter(item => item.manual_status === 'in_progress').length,
        uploaded: allManualItems.filter(item => item.manual_status === 'uploaded').length,
        validated: allManualItems.filter(item => item.manual_status === 'validated').length,
        errors: allManualItems.filter(item => item.manual_status === 'error').length,
        corrupted: allManualItems.filter(item => item.corruption_detected === true).length,
        urgent: allManualItems.filter(item => item.priority === 'urgent').length,
        high: allManualItems.filter(item => item.priority === 'high').length,
        normal: allManualItems.filter(item => item.priority === 'normal').length,
        low: allManualItems.filter(item => item.priority === 'low').length
      };

      // Combine stats from both queues for accurate totals
      const combinedStats = {
        total: uploadQueueStats.total + manualQueueStats.total,
        pending: uploadQueueStats.pending + manualQueueStats.pending,
        in_progress: uploadQueueStats.in_progress + manualQueueStats.in_progress,
        uploaded: uploadQueueStats.uploaded + manualQueueStats.uploaded,
        errors: uploadQueueStats.errors + manualQueueStats.errors,
        urgent: uploadQueueStats.urgent + manualQueueStats.urgent,
        high: uploadQueueStats.high + manualQueueStats.high,
        normal: uploadQueueStats.normal + manualQueueStats.normal,
        low: uploadQueueStats.low + manualQueueStats.low,
        corrupted: manualQueueStats.corrupted,
        validated: manualQueueStats.validated
      };

      console.log('📊 [ManualManagement] Queue stats calculated:', {
        upload_queue: uploadQueueStats,
        manual_queue: manualQueueStats,
        combined: combinedStats
      });
      
      return combinedStats;

    } catch (error) {
      console.error('Error getting queue stats:', error);
      return {
        total: 0, pending: 0, in_progress: 0, uploaded: 0, errors: 0,
        urgent: 0, high: 0, normal: 0, low: 0, corrupted: 0, validated: 0
      };
    }
  }

  // Get platform credentials for a client
  async getPlatformCredentials(clientId?: string): Promise<PlatformCredential[]> {
    try {
      // If clientId is provided and looks like a tenant ID, use it directly
      const tenantId = clientId || DEV_TENANT_ID;
      
      const { data: adaptadores, error } = await supabaseServiceClient
        .from('adaptadores')
        .select('*')
        .eq('tenant_id', tenantId);

      if (error) {
        console.error('Error getting platform credentials:', error);
        return [];
      }

      return (adaptadores || []).map(cred => this.transformSingleCredential(cred));

    } catch (error) {
      console.error('Error getting platform credentials:', error);
      return [];
    }
  }

  private transformSingleCredential(cred: any): PlatformCredential {
    return {
      id: cred.id,
      platform_type: cred.plataforma,
      username: cred.credenciales?.username || '',
      password: cred.credenciales?.password || '',
      is_active: cred.estado === 'ready',
      validation_status: 'valid',
      last_validated: cred.updated_at
    };
  }

  // Add document to manual queue
  async addDocumentToQueue(
    clientId: string,
    projectId: string,
    file: File,
    priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal',
    platformTarget: string = 'nalanda',
    userId?: string
  ): Promise<{ id: string; document_id: string } | null> {
    try {
      console.log('📁 Adding document to manual queue...');

      // First, upload the file to storage
      const uploadResult = await fileStorageService.uploadFile(
        file,
        DEV_TENANT_ID,
        'obra',
        projectId,
        'OTROS',
        1
      );

      if (!uploadResult.success) {
        console.error('❌ File upload failed:', uploadResult.error);
        throw new Error(uploadResult.error || 'File upload failed');
      }

      // Create document record
      const { data: documento, error: docError } = await supabaseServiceClient
        .from('documentos')
        .insert({
          tenant_id: DEV_TENANT_ID,
          entidad_tipo: 'obra',
          entidad_id: projectId,
          categoria: 'OTROS',
          file: uploadResult.filePath || '',
          mime: file.type,
          size_bytes: file.size,
          version: 1,
          estado: 'pendiente',
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
        throw new Error(`Error creating document: ${docError.message}`);
      }

      // Add to manual upload queue
      const { data: queueItem, error: queueError } = await supabaseServiceClient
        .from('manual_upload_queue')
        .insert({
          tenant_id: DEV_TENANT_ID,
          empresa_id: clientId, // Using clientId as empresa_id for now
          obra_id: projectId,
          documento_id: documento.id,
          status: 'queued',
          priority: priority,
          nota: `Documento subido por usuario ${userId || 'unknown'}`
        })
        .select()
        .single();

      if (queueError) {
        console.error('❌ Error adding to queue:', queueError);
        throw new Error(`Error adding to queue: ${queueError.message}`);
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
      const { error } = await supabaseServiceClient
        .from('manual_upload_queue')
        .update({
          status: newStatus === 'pending' ? 'queued' :
                 newStatus === 'uploading' ? 'in_progress' :
                 newStatus === 'uploaded' ? 'uploaded' : 'error',
          nota: notes || '',
          updated_at: new Date().toISOString()
        })
        .eq('id', queueItemId);

      if (error) {
        console.error('Error updating document status:', error);
        return false;
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
    userId?: string
  ): Promise<boolean> {
    try {
      const tenantId = DEV_TENANT_ID;

      const { error } = await supabaseServiceClient
        .from('adaptadores')
        .upsert({
          tenant_id: tenantId,
          plataforma: platformType,
          alias: 'Principal',
          credenciales: {
            username,
            password,
            configured: true
          },
          estado: 'ready'
        }, {
          onConflict: 'tenant_id,plataforma,alias'
        });

      if (error) {
        console.error('Error saving platform credentials:', error);
        return false;
      }

      // Log audit event
      await logAuditoria(
        tenantId,
        userId || DEV_ADMIN_USER_ID,
        'platform.credentials_updated',
        'adaptador',
        platformType,
        { platform: platformType, username }
      );

      return true;
    } catch (error) {
      console.error('Error saving platform credentials:', error);
      return false;
    }
  }
}

export const manualManagementService = new ManualManagementService();