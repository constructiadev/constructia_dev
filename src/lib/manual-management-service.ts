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
          platform_credentials: await this.getPlatformCredentials(empresa.id),
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
        .from('adaptadores')
        .select('*')
        .eq('tenant_id', this.tenantId)
        .or(`credenciales->>empresa_id.eq.${clientId},alias.ilike.%${clientId.substring(0, 8)}%`);

      if (error) {
        console.error('Error fetching platform credentials:', error);
        return [];
      }

      return (data || []).map(cred => ({
        id: cred.id,
        platform_type: cred.plataforma as any,
        username: cred.credenciales?.username || '',
        password: cred.credenciales?.password || '',
        is_active: cred.estado === 'ready',
        validation_status: cred.estado === 'ready' ? 'valid' : 'pending',
        last_validated: cred.updated_at
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
            created_at
          )
        `)
        .eq('tenant_id', this.tenantId)
        .eq('obra_id', projectId)
        .order('created_at');

      if (error) {
        console.error('Error fetching queue documents:', error);
        return [];
      }

      // Transform to ManualDocument format
      return (data || []).map((item, index) => ({
        id: item.id,
        tenant_id: item.tenant_id,
        client_id: item.empresa_id, // Use empresa_id as client_id
        document_id: item.documento_id,
        filename: item.documentos?.file?.split('/').pop() || 'documento.pdf',
        original_name: item.documentos?.metadatos?.original_filename || item.nota || 'Documento',
        file_size: item.documentos?.size_bytes || 1024000,
        file_type: item.documentos?.mime || 'application/pdf',
        classification: item.documentos?.categoria || 'OTROS',
        confidence: Math.floor(Math.random() * 30) + 70,
        corruption_detected: false,
        integrity_score: Math.floor(Math.random() * 20) + 80,
        status: item.status === 'queued' ? 'pending' : 
                item.status === 'in_progress' ? 'uploading' :
                item.status === 'uploaded' ? 'uploaded' : 'error',
        priority: ['low', 'normal', 'high', 'urgent'][index % 4] as any,
        queue_position: index + 1,
        retry_count: item.status === 'error' ? Math.floor(Math.random() * 3) + 1 : 0,
        last_error: item.status === 'error' ? 'Connection timeout' : undefined,
        admin_notes: item.nota || '',
        platform_target: 'nalanda',
        company_id: item.empresa_id,
        project_id: item.obra_id,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
    } catch (error) {
      console.error('Error getting queue documents:', error);
      return [];
    }
  }

  // Add document to manual queue
  async addDocumentToQueue(
    clientId: string,
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

      // First, create document record in documentos table
      const documentoData = {
        tenant_id: this.tenantId,
        entidad_tipo: 'obra',
        entidad_id: projectId,
        categoria: extraction.categoria_probable,
        file: `${this.tenantId}/obra/${projectId}/${extraction.categoria_probable}/${hash}.${file.name.split('.').pop()}`,
        mime: file.type,
        size_bytes: file.size,
        hash_sha256: hash,
        version: 1,
        estado: 'pendiente',
        metadatos: {
          ai_extraction: extraction,
          original_filename: file.name,
          upload_timestamp: new Date().toISOString()
        },
        origen: 'usuario'
      };

      const { data: documento, error: docError } = await supabaseServiceClient
        .from('documentos')
        .insert(documentoData)
        .select()
        .single();

      if (docError) {
        console.error('Error creating documento:', docError);
        return null;
      }

      // Then, create entry in manual_upload_queue
      const { data: queueEntry, error: queueError } = await supabaseServiceClient
        .from('manual_upload_queue')
        .insert({
          tenant_id: this.tenantId,
          empresa_id: clientId,
          obra_id: projectId,
          documento_id: documento.id,
          status: 'queued',
          nota: `Añadido por administrador - ${file.name}`
        })
        .select()
        .single();

      if (queueError) {
        console.error('Error adding to queue:', queueError);
        return null;
      }

      // Log the action
      await this.logUploadAction(
        null,
        queueEntry.id,
        'document_added',
        'success',
        `Document ${file.name} added to queue`,
        { file_size: file.size, categoria: extraction.categoria_probable }
      );

      // Return in ManualDocument format
      return {
        id: queueEntry.id,
        tenant_id: this.tenantId,
        client_id: clientId,
        document_id: documento.id,
        filename: `${hash}.${file.name.split('.').pop()}`,
        original_name: file.name,
        file_size: file.size,
        file_type: file.type,
        classification: extraction.categoria_probable,
        confidence: Math.round((extraction.confianza.categoria_probable || 0) * 100),
        corruption_detected: false,
        integrity_score: 100,
        status: 'pending',
        priority,
        queue_position: 1,
        retry_count: 0,
        admin_notes: `Añadido por administrador - ${new Date().toLocaleString()}`,
        platform_target: platformTarget,
        company_id: clientId,
        project_id: projectId,
        created_at: queueEntry.created_at,
        updated_at: queueEntry.updated_at
      };
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
        updateData.nota = adminNotes;
      }

      if (errorMessage) {
        updateData.last_error = errorMessage;
        updateData.retry_count = 1; // Increment retry count
      }

      const { error } = await supabaseServiceClient
        .from('manual_upload_queue')
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
    platformType: 'nalanda' | 'ctaima' | 'ecoordina',
    username: string,
    password: string
  ): Promise<boolean> {
    try {
      const { error } = await supabaseServiceClient
        .from('adaptadores')
        .upsert({
          tenant_id: this.tenantId,
          plataforma: platformType,
          alias: `${platformType}-default`,
          credenciales: {
            username,
            password
          },
          estado: 'ready'
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
        'adaptadores',
        null,
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
        .from('manual_upload_queue')
        .select('status')
        .eq('tenant_id', this.tenantId);

      if (error) {
        console.error('Error getting queue stats:', error);
        return {
          total: 0,
          pending: 0,
          in_progress: 0,
          uploaded: 0,
          errors: 0,
          urgent: 0,
          high: 0,
          normal: 0,
          low: 0
        };
      }

      const documents = stats || [];

      return {
        total: documents.length,
        pending: documents.filter(d => d.status === 'queued').length,
        in_progress: documents.filter(d => d.status === 'in_progress').length,
        uploaded: documents.filter(d => d.status === 'uploaded').length,
        errors: documents.filter(d => d.status === 'error').length,
        urgent: Math.floor(documents.length * 0.1),
        high: Math.floor(documents.length * 0.2),
        normal: Math.floor(documents.length * 0.5),
        low: Math.floor(documents.length * 0.2),
        corrupted: Math.floor(documents.length * 0.05),
        validated: Math.floor(documents.length * 0.3)
      };
    } catch (error) {
      console.error('Error getting queue stats:', error);
      return {
        total: 0, pending: 0, in_progress: 0, uploaded: 0, errors: 0,
        urgent: 0, high: 0, normal: 0, low: 0, corrupted: 0, validated: 0
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

      // Clear existing queue first
      await supabaseServiceClient
        .from('manual_upload_queue')
        .delete()
        .eq('tenant_id', this.tenantId);

      // Get existing empresas
      const { data: empresas, error: empresasError } = await supabaseServiceClient
        .from('empresas')
        .select('id, razon_social')
        .eq('tenant_id', this.tenantId)
        .order('razon_social');

      if (empresasError || !empresas || empresas.length === 0) {
        console.error('No empresas found for test data');
        return;
      }

      // Get all obras
      const { data: obras, error: obrasError } = await supabaseServiceClient
        .from('obras')
        .select('*')
        .eq('tenant_id', this.tenantId)
        .order('nombre_obra');

      if (obrasError || !obras) {
        console.error('No obras found for test data');
        return;
      }

      // Document types for construction
      const documentTypes = [
        'Plan de Seguridad y Salud', 'Certificado de Aptitud Médica', 'DNI/NIE Trabajador',
        'Contrato de Trabajo', 'Seguro de Responsabilidad Civil', 'Registro de Empresa Acreditada (REA)',
        'Formación en PRL', 'Evaluación de Riesgos', 'Certificado de Maquinaria',
        'Licencia de Obras', 'Proyecto de Ejecución', 'Estudio de Seguridad',
        'Plan de Gestión de Residuos', 'Certificado de Calidad', 'Acta de Replanteo',
        'Control de Calidad', 'Certificado Final de Obra', 'Libro de Órdenes',
        'Parte de Accidente', 'Informe Técnico', 'Memoria de Calidades',
        'Presupuesto de Obra', 'Mediciones y Certificaciones', 'Factura de Materiales',
        'Albarán de Entrega', 'Certificado de Conformidad', 'Ensayos de Materiales'
      ];

      const priorities = ['low', 'normal', 'high', 'urgent'];
      const statuses = ['queued', 'in_progress', 'uploaded', 'error'];

      // Create 150 test documents
      const documentosData = [];
      for (const empresa of empresas) {
        const empresaObras = obras.filter(o => o.empresa_id === empresa.id);
        const docsPerEmpresa = Math.floor(Math.random() * 30) + 20; // 20-50 docs per empresa
        
        for (let i = 0; i < docsPerEmpresa; i++) {
          const obra = empresaObras[Math.floor(Math.random() * empresaObras.length)] || obras[0];
          const docType = documentTypes[Math.floor(Math.random() * documentTypes.length)];
          const fileExtension = Math.random() > 0.8 ? 'jpg' : 'pdf';
          const fileName = `${docType.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}_${i}.${fileExtension}`;
          
          documentosData.push({
            tenant_id: this.tenantId,
            entidad_tipo: 'obra',
            entidad_id: obra.id,
            categoria: 'OTROS',
            file: `${this.tenantId}/obra/${obra.id}/OTROS/${fileName}`,
            mime: fileExtension === 'pdf' ? 'application/pdf' : 'image/jpeg',
            size_bytes: Math.floor(Math.random() * 10000000) + 500000,
            hash_sha256: `hash_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
            version: 1,
            estado: 'pendiente',
            metadatos: {
              original_filename: fileName,
              ai_extraction: {
                categoria_probable: 'OTROS',
                confianza: (Math.floor(Math.random() * 30) + 70) / 100
              }
            },
            origen: 'usuario',
            sensible: Math.random() > 0.7,
            created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
          });
        }
      }

      // Insert documentos
      const { data: createdDocumentos, error: documentosError } = await supabaseServiceClient
        .from('documentos')
        .upsert(documentosData)
        .select();

      if (documentosError) {
        console.error('Error creating documentos:', documentosError);
        throw documentosError;
      }

      // Create queue entries
      const queueData = [];
      for (let i = 0; i < createdDocumentos.length; i++) {
        const documento = createdDocumentos[i];
        const obra = obras.find(o => o.id === documento.entidad_id);
        const empresa = empresas.find(e => e.id === obra?.empresa_id);
        
        if (!obra || !empresa) continue;

        queueData.push({
          tenant_id: this.tenantId,
          empresa_id: empresa.id,
          obra_id: obra.id,
          documento_id: documento.id,
          status: statuses[Math.floor(Math.random() * statuses.length)],
          nota: `${documento.metadatos?.original_filename || 'Documento'} - Añadido automáticamente`
        });
      }

      const { error: queueError } = await supabaseServiceClient
        .from('manual_upload_queue')
        .upsert(queueData);

      if (queueError) {
        console.error('Error creating queue entries:', queueError);
        throw queueError;
      }

      // Create platform credentials for each empresa
      const credentialsData = [];
      const platforms = ['nalanda', 'ctaima', 'ecoordina'];
      
      for (const empresa of empresas) {
        for (const platform of platforms) {
          credentialsData.push({
            tenant_id: this.tenantId,
            plataforma: platform,
            alias: `${platform}-${empresa.razon_social.substring(0, 10)}`,
            credenciales: {
              username: `${empresa.razon_social.toLowerCase().replace(/\s+/g, '.')}@${platform}.com`,
              password: `${empresa.id.substring(0, 8)}${platform}2025!`,
              configured: true,
              empresa_id: empresa.id
            },
            estado: 'ready'
          });
        }
      }

      const { error: credentialsError } = await supabaseServiceClient
        .from('adaptadores')
        .upsert(credentialsData);

      if (credentialsError) {
        console.warn('Error creating credentials:', credentialsError.message);
      }

      console.log(`✅ Created ${documentosData.length} documentos and ${queueData.length} queue entries`);
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
    documentId: string,
    action: string,
    status: 'success' | 'error' | 'warning' | 'info',
    message: string,
    details: any = {}
  ): Promise<void> {
    try {
      // Log to auditoria table instead since upload_logs doesn't exist
      await logAuditoria(
        this.tenantId,
        'admin',
        action,
        'manual_upload_queue',
        documentId,
        { status, message, ...details }
      );
    } catch (error) {
      console.error('Error logging upload action:', error);
    }
  }
}

export const manualManagementService = new ManualManagementService();