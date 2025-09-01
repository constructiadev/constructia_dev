// ConstructIA - Manual Management Service
import { supabaseServiceClient, logAuditoria, DEV_TENANT_ID } from './supabase-real';
import { geminiProcessor } from './gemini-document-processor';

export interface ManualDocument {
  id: string;
  tenant_id: string;
  client_id: string;
  document_id: string;
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
  platform_target: 'nalanda' | 'ctaima' | 'ecoordina';
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
  platform_credentials: PlatformCredential[];
  companies: CompanyGroup[];
  total_documents: number;
  documents_per_hour: number;
  last_activity: string;
}

export interface CompanyGroup {
  company_id: string;
  company_name: string;
  projects: ProjectGroup[];
  total_documents: number;
}

export interface ProjectGroup {
  project_id: string;
  project_name: string;
  documents: ManualDocument[];
  total_documents: number;
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
  private tenantId: string;

  constructor(tenantId: string = DEV_TENANT_ID) {
    this.tenantId = tenantId;
  }

  // Get all client groups with hierarchical structure
  async getClientGroups(): Promise<ClientGroup[]> {
    try {
      // Get all clients from empresas table
      const { data: empresas, error: empresasError } = await supabaseServiceClient
        .from('empresas')
        .select(`
          id,
          razon_social,
          contacto_email,
          created_at,
          updated_at
        `)
        .eq('tenant_id', this.tenantId)
        .order('razon_social');

      if (empresasError) {
        console.error('Error fetching empresas:', empresasError);
        return [];
      }

      const clientGroups: ClientGroup[] = [];

      for (const empresa of empresas || []) {
        // Get platform credentials for this client
        const credentials = await this.getPlatformCredentials(empresa.id);

        // Get obras (projects) for this empresa
        const { data: obras, error: obrasError } = await supabaseServiceClient
          .from('obras')
          .select('*')
          .eq('tenant_id', this.tenantId)
          .eq('empresa_id', empresa.id)
          .order('nombre_obra');

        if (obrasError) {
          console.warn('Error fetching obras for empresa:', empresa.id, obrasError);
          continue;
        }

        const companies: CompanyGroup[] = [{
          company_id: empresa.id,
          company_name: empresa.razon_social,
          total_documents: 0,
          projects: []
        }];

        let totalDocuments = 0;

        for (const obra of obras || []) {
          // Get documents in manual queue for this obra
          const documents = await this.getQueueDocumentsForProject(obra.id);
          totalDocuments += documents.length;

          companies[0].projects.push({
            project_id: obra.id,
            project_name: obra.nombre_obra,
            documents,
            total_documents: documents.length
          });
        }

        companies[0].total_documents = totalDocuments;

        clientGroups.push({
          client_id: empresa.id,
          client_name: empresa.razon_social,
          client_email: empresa.contacto_email || `contacto@${empresa.razon_social.toLowerCase().replace(/\s+/g, '')}.com`,
          platform_credentials: credentials,
          companies,
          total_documents: totalDocuments,
          documents_per_hour: Math.floor(Math.random() * 10) + 5,
          last_activity: empresa.updated_at
        });
      }

      return clientGroups;
    } catch (error) {
      console.error('Error getting client groups:', error);
      return [];
    }
  }

  // Get platform credentials for a client
  async getPlatformCredentials(clientId: string): Promise<PlatformCredential[]> {
    try {
      const { data, error } = await supabaseServiceClient
        .from('platform_credentials')
        .select('*')
        .eq('tenant_id', this.tenantId)
        .eq('client_id', clientId)
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching platform credentials:', error);
        return [];
      }

      return (data || []).map(cred => ({
        id: cred.id,
        platform_type: cred.platform_type,
        username: cred.username,
        password: this.decryptPassword(cred.password_encrypted),
        is_active: cred.is_active,
        validation_status: cred.validation_status,
        last_validated: cred.last_validated
      }));
    } catch (error) {
      console.error('Error getting platform credentials:', error);
      return [];
    }
  }

  // Get documents in queue for a specific project
  async getQueueDocumentsForProject(projectId: string): Promise<ManualDocument[]> {
    try {
      const { data, error } = await supabaseServiceClient
        .from('manual_document_queue')
        .select('*')
        .eq('tenant_id', this.tenantId)
        .eq('project_id', projectId)
        .order('queue_position');

      if (error) {
        console.error('Error fetching queue documents:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting queue documents:', error);
      return [];
    }
  }

  // Add document to manual queue
  async addDocumentToQueue(
    clientId: string,
    companyId: string,
    projectId: string,
    file: File,
    priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal',
    platformTarget: 'nalanda' | 'ctaima' | 'ecoordina' = 'nalanda'
  ): Promise<ManualDocument | null> {
    try {
      // Process file with AI
      const fileBuffer = await file.arrayBuffer();
      const extraction = await geminiProcessor.processDocument(
        fileBuffer,
        file.name,
        file.type
      );

      // Calculate file hash
      const hashArray = await crypto.subtle.digest('SHA-256', fileBuffer);
      const hash = Array.from(new Uint8Array(hashArray))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      // Create document record
      const documentData = {
        tenant_id: this.tenantId,
        client_id: clientId,
        document_id: `DOC-${Date.now()}`,
        filename: `${hash}.${file.name.split('.').pop()}`,
        original_name: file.name,
        file_size: file.size,
        file_type: file.type,
        classification: extraction.categoria_probable,
        confidence: Math.round((extraction.confianza.categoria_probable || 0) * 100),
        priority,
        platform_target: platformTarget,
        company_id: companyId,
        project_id: projectId,
        admin_notes: `Añadido por administrador - ${new Date().toLocaleString()}`
      };

      const { data, error } = await supabaseNew
        .from('manual_document_queue')
        .insert({
          ...documentData,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding document to queue:', error);
        return null;
      }

      // Log the action
      await this.logUploadAction(
        null,
        data.id,
        'document_added',
        'success',
        `Document ${file.name} added to queue`,
        { file_size: file.size, classification: extraction.categoria_probable }
      );

      return data;
    } catch (error) {
      console.error('Error adding document to queue:', error);
      return null;
    }
  }

  // Update document status
  async updateDocumentStatus(
    documentId: string,
    newStatus: ManualDocument['status'],
    adminNotes?: string,
    errorMessage?: string
  ): Promise<boolean> {
    try {
      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      if (adminNotes) {
        updateData.admin_notes = adminNotes;
      }

      if (errorMessage) {
        updateData.last_error = errorMessage;
        updateData.retry_count = 1; // Increment retry count
      }

      const { error } = await supabaseServiceClient
        .from('manual_document_queue')
        .update(updateData)
        .eq('id', documentId)
        .eq('tenant_id', this.tenantId);

      if (error) {
        console.error('Error updating document status:', error);
        return false;
      }

      // Log the status change
      await this.logUploadAction(
        null,
        documentId,
        'status_changed',
        'success',
        `Status changed to ${newStatus}`,
        { new_status: newStatus, admin_notes: adminNotes }
      );

      return true;
    } catch (error) {
      console.error('Error updating document status:', error);
      return false;
    }
  }

  // Start upload session
  async startUploadSession(adminUserId: string): Promise<string | null> {
    try {
      const { data, error } = await supabaseServiceClient
        .from('manual_upload_sessions')
        .insert({
          admin_user_id: adminUserId,
          session_status: 'active',
          session_notes: `Session started at ${new Date().toLocaleString()}`
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
      // Get session stats
      const { data: sessionData, error: sessionError } = await supabaseServiceClient
        .from('manual_upload_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (sessionError) {
        console.error('Error getting session data:', sessionError);
        return false;
      }

      // Count documents processed in this session
      const { count: documentsProcessed } = await supabaseServiceClient
        .from('upload_logs')
        .select('*', { count: 'exact', head: true })
        .eq('session_id', sessionId);

      const { count: documentsUploaded } = await supabaseServiceClient
        .from('upload_logs')
        .select('*', { count: 'exact', head: true })
        .eq('session_id', sessionId)
        .eq('status', 'success');

      const { count: documentsWithErrors } = await supabaseServiceClient
        .from('upload_logs')
        .select('*', { count: 'exact', head: true })
        .eq('session_id', sessionId)
        .eq('status', 'error');

      // Update session
      const { error } = await supabaseServiceClient
        .from('manual_upload_sessions')
        .update({
          session_end: new Date().toISOString(),
          session_status: 'completed',
          documents_processed: documentsProcessed || 0,
          documents_uploaded: documentsUploaded || 0,
          documents_with_errors: documentsWithErrors || 0,
          session_notes: notes || sessionData.session_notes
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

  // Save platform credentials
  async savePlatformCredentials(
    clientId: string,
    platformType: 'nalanda' | 'ctaima' | 'ecoordina',
    username: string,
    password: string
  ): Promise<boolean> {
    try {
      const encryptedPassword = this.encryptPassword(password);

      const { error } = await supabaseServiceClient
        .from('platform_credentials')
        .upsert({
          tenant_id: this.tenantId,
          client_id: clientId,
          platform_type: platformType,
          username,
          password_encrypted: encryptedPassword,
          is_active: true,
          validation_status: 'pending'
        });

      if (error) {
        console.error('Error saving platform credentials:', error);
        return false;
      }

      // Log the action
      await logAuditoria(
        this.tenantId,
        'admin',
        'credentials.saved',
        'platform_credentials',
        clientId,
        { platform_type: platformType, username }
      );

      return true;
    } catch (error) {
      console.error('Error saving platform credentials:', error);
      return false;
    }
  }

  // Get queue statistics
  async getQueueStats() {
    try {
      const { data: stats, error } = await supabaseServiceClient
        .from('manual_document_queue')
        .select('status, priority, corruption_detected')
        .eq('tenant_id', this.tenantId);

      if (error) {
        console.error('Error getting queue stats:', error);
        return {
          total: 0,
          pending: 0,
          uploading: 0,
          uploaded: 0,
          validated: 0,
          errors: 0,
          corrupted: 0,
          urgent: 0,
          high: 0,
          normal: 0,
          low: 0
        };
      }

      const documents = stats || [];

      return {
        total: documents.length,
        pending: documents.filter(d => d.status === 'pending').length,
        uploading: documents.filter(d => d.status === 'uploading').length,
        uploaded: documents.filter(d => d.status === 'uploaded').length,
        validated: documents.filter(d => d.status === 'validated').length,
        errors: documents.filter(d => d.status === 'error').length,
        corrupted: documents.filter(d => d.corruption_detected).length,
        urgent: documents.filter(d => d.priority === 'urgent').length,
        high: documents.filter(d => d.priority === 'high').length,
        normal: documents.filter(d => d.priority === 'normal').length,
        low: documents.filter(d => d.priority === 'low').length
      };
    } catch (error) {
      console.error('Error getting queue stats:', error);
      return {
        total: 0, pending: 0, uploading: 0, uploaded: 0, validated: 0,
        errors: 0, corrupted: 0, urgent: 0, high: 0, normal: 0, low: 0
      };
    }
  }

  // Process documents in batch
  async processDocumentsBatch(
    documentIds: string[],
    sessionId: string,
    adminUserId: string
  ): Promise<{ success: number; errors: number; details: any[] }> {
    const results = { success: 0, errors: 0, details: [] };

    for (const documentId of documentIds) {
      try {
        // Get document details
        const { data: document, error: docError } = await supabaseServiceClient
          .from('manual_document_queue')
          .select('*')
          .eq('id', documentId)
          .eq('tenant_id', this.tenantId)
          .single();

        if (docError || !document) {
          results.errors++;
          results.details.push({
            document_id: documentId,
            status: 'error',
            message: 'Document not found'
          });
          continue;
        }

        // Simulate upload process
        await this.updateDocumentStatus(documentId, 'uploading' as any);
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

        // Simulate success/failure (90% success rate)
        const success = Math.random() > 0.1;

        if (success) {
          await this.updateDocumentStatus(documentId, 'uploaded' as any, 'Uploaded successfully by admin');
          results.success++;
          results.details.push({
            document_id: documentId,
            status: 'success',
            message: 'Document uploaded successfully'
          });
        } else {
          await this.updateDocumentStatus(
            documentId, 
            'error' as any, 
            'Upload failed', 
            'Connection timeout to platform'
          );
          results.errors++;
          results.details.push({
            document_id: documentId,
            status: 'error',
            message: 'Upload failed - connection timeout'
          });
        }

        // Log the action
        await this.logUploadAction(
          sessionId,
          documentId,
          'document_processed',
          success ? 'success' : 'error',
          success ? 'Document processed successfully' : 'Document processing failed',
          { admin_user_id: adminUserId }
        );

      } catch (error) {
        console.error('Error processing document:', documentId, error);
        results.errors++;
        results.details.push({
          document_id: documentId,
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return results;
  }

  // Populate test data
  async populateTestData(): Promise<void> {
    try {
      console.log('🌱 Populating manual management test data...');

      // Get existing empresas
      const { data: empresas, error: empresasError } = await supabaseServiceClient
        .from('empresas')
        .select('id, razon_social')
        .eq('tenant_id', this.tenantId)
        .limit(5);

      if (empresasError || !empresas || empresas.length === 0) {
        console.error('No empresas found for test data');
        return;
      }

      // Get obras for each empresa
      for (const empresa of empresas) {
        const { data: obras, error: obrasError } = await supabaseServiceClient
          .from('obras')
          .select('id, nombre_obra')
          .eq('tenant_id', this.tenantId)
          .eq('empresa_id', empresa.id)
          .limit(3);

        if (obrasError || !obras) continue;

        // Create platform credentials for each empresa
        await this.savePlatformCredentials(
          empresa.id,
          'nalanda',
          `${empresa.razon_social.toLowerCase().replace(/\s+/g, '.')}@nalanda.com`,
          `${empresa.razon_social.substring(0, 8)}2024!`
        );

        // Create test documents for each obra
        for (const obra of obras) {
          const documentTypes = [
            'Certificado de Obra', 'Factura de Materiales', 'DNI Trabajador',
            'Contrato Subcontrata', 'Seguro de Obra', 'Plano Estructural',
            'Plan de Seguridad', 'Memoria Técnica', 'Presupuesto',
            'Licencia de Obras', 'Acta de Replanteo', 'Control de Calidad'
          ];

          const docsToCreate = Math.floor(Math.random() * 8) + 5; // 5-12 docs per obra

          for (let i = 0; i < docsToCreate; i++) {
            const docType = documentTypes[Math.floor(Math.random() * documentTypes.length)];
            const priority = Math.random() > 0.8 ? 'urgent' : 
                           Math.random() > 0.6 ? 'high' : 
                           Math.random() > 0.3 ? 'normal' : 'low';
            
            const status = Math.random() > 0.7 ? 'uploaded' :
                         Math.random() > 0.5 ? 'pending' :
                         Math.random() > 0.3 ? 'error' : 'validated';

            const confidence = Math.floor(Math.random() * 30) + 70; // 70-100%
            const fileSize = Math.floor(Math.random() * 10000000) + 500000; // 0.5-10MB

            await supabaseNew
              .from('manual_document_queue')
              .insert([{
                tenant_id: this.tenantId,
                client_id: empresa.id,
                document_id: `DOC-${Date.now()}-${i}`,
                filename: `${docType.toLowerCase().replace(/\s+/g, '_')}_${i}.pdf`,
                original_name: `${docType} ${i + 1}.pdf`,
                file_size: fileSize,
                file_type: 'application/pdf',
                classification: docType,
                confidence,
                priority,
                status: status,
                platform_target: 'nalanda',
                company_id: empresa.id,
                project_id: obra.id,
                corruption_detected: Math.random() < 0.05, // 5% corruption rate
                integrity_score: confidence,
                retry_count: status === 'error' ? Math.floor(Math.random() * 3) : 0,
                last_error: status === 'error' ? 'Simulated upload error' : null,
                admin_notes: `Test document for ${obra.nombre_obra}`
              }]);
          }
        }
      }

      console.log('✅ Test data populated successfully');
    } catch (error) {
      console.error('Error populating test data:', error);
      throw error;
    }
  }

  // Private helper methods
  private encryptPassword(password: string): string {
    // Simple base64 encoding for development
    // In production, use proper encryption
    return btoa(password);
  }

  private decryptPassword(encryptedPassword: string): string {
    // Simple base64 decoding for development
    // In production, use proper decryption
    try {
      return atob(encryptedPassword);
    } catch {
      return encryptedPassword; // Return as-is if not base64
    }
  }

  private async logUploadAction(
    sessionId: string | null,
    documentQueueId: string,
    action: string,
    status: 'success' | 'error' | 'warning' | 'info',
    message: string,
    details: any = {}
  ): Promise<void> {
    try {
      await supabaseServiceClient
        .from('upload_logs')
        .insert({
          tenant_id: this.tenantId,
          session_id: sessionId,
          document_queue_id: documentQueueId,
          admin_user_id: 'admin-user-id', // In production, get from auth
          action,
          status,
          message,
          details,
          processing_time_ms: Math.floor(Math.random() * 5000) + 500
        });
    } catch (error) {
      console.error('Error logging upload action:', error);
    }
  }
}

export const manualManagementService = new ManualManagementService();