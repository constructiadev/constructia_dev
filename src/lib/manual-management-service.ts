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

      const transformedCredentials = (adaptadores || []).map(cred => this.transformSingleCredential(cred));
      console.log('🔍 [ManualManagement] Transformed credentials:', transformedCredentials);
      return transformedCredentials;

    } catch (error) {
      console.error('Error getting platform credentials:', error);
      return [];
    }
  }

  private transformSingleCredential(cred: any): PlatformCredential {
    // Check if credentials are properly configured
    const hasUsername = cred.credenciales?.username && 
                       typeof cred.credenciales.username === 'string' && 
                       cred.credenciales.username.trim().length > 0;
    const hasPassword = cred.credenciales?.password && 
                       typeof cred.credenciales.password === 'string' && 
                       cred.credenciales.password.trim().length > 0;
    const isConfigured = hasUsername && hasPassword;
    
    console.log(`🔍 [ManualManagement] Transforming credential for ${cred.plataforma}:`, {
      hasUsername,
      hasPassword,
      isConfigured,
      estado: cred.estado,
      credenciales: cred.credenciales
    });
    return {
      id: cred.id,
      platform_type: cred.plataforma,
      username: cred.credenciales?.username || '',
      password: cred.credenciales?.password || '',
      is_active: isConfigured && cred.estado === 'ready',
      validation_status: isConfigured && cred.estado === 'ready' ? 'valid' : 
                        cred.estado === 'error' ? 'invalid' : 'pending',
      last_validated: cred.updated_at
    };
  }

  // Add document to manual queue
  async addDocumentToQueue(
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

      // Ensure DEV_TENANT_ID exists before proceeding
      const tenantExists = await ensureDevTenantExists();
      if (!tenantExists) {
        throw new Error('Failed to ensure tenant exists in database');
      }

      // First, determine the next version number for this document category and entity
      const { data: existingDocs, error: versionError } = await supabaseServiceClient
        .from('documentos')
        .select('version')
        .eq('tenant_id', DEV_TENANT_ID)
        .eq('entidad_tipo', 'obra')
        .eq('entidad_id', projectId)
        .eq('categoria', category)
        .order('version', { ascending: false })
        .limit(1);

      if (versionError) {
        console.error('❌ Error checking existing document versions:', versionError);
        throw new Error(`Error checking existing versions: ${versionError.message}`);
      }

      const nextVersion = existingDocs && existingDocs.length > 0 ? existingDocs[0].version + 1 : 1;
      console.log(`📄 Next version for category ${category}: ${nextVersion}`);

      // First, upload the file to storage
      const uploadResult = await fileStorageService.uploadFile(
        file,
        DEV_TENANT_ID,
        'obra',
        projectId,
        category,
        nextVersion
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
          categoria: category,
          file: uploadResult.filePath || '',
          mime: file.type,
          size_bytes: file.size,
          version: nextVersion,
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
          nota: `Documento subido por usuario ${userId || 'unknown'} - Plataforma destino: ${platformTarget}`
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
      const updateData: any = {
        status: newStatus === 'pending' ? 'queued' :
               newStatus === 'uploading' ? 'in_progress' :
               newStatus === 'uploaded' ? 'uploaded' : 'error',
        updated_at: new Date().toISOString()
      };

      // If notes are provided, update them
      if (notes) {
        updateData.nota = notes;
      }

      const { error } = await supabaseServiceClient
        .from('manual_upload_queue')
        .update(updateData)
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
    userId?: string,
    tenantId?: string
  ): Promise<boolean> {
    try {
      const targetTenantId = tenantId || DEV_TENANT_ID;
      
      console.log('💾 [ManualManagement] Saving platform credentials:', {
        platformType,
        username,
        tenantId: targetTenantId,
        userId
      });

      const { data, error } = await supabaseServiceClient
        .from('adaptadores')
        .upsert({
          tenant_id: targetTenantId,
          plataforma: platformType,
          alias: 'Principal',
          credenciales: {
            username,
            password,
            configured: true
          },
          estado: 'ready',
          ultimo_envio: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'tenant_id,plataforma,alias'
        })
        .select();

      if (error) {
        console.error('Error saving platform credentials:', error);
        console.error('Error details:', error.message);
        return false;
      }

      console.log('✅ [ManualManagement] Platform credentials saved successfully:', data);

      // Log audit event
      await logAuditoria(
        targetTenantId,
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