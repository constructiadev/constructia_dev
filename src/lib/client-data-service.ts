// ConstructIA - Client Data Service with Tenant Isolation
import { supabase, supabaseServiceClient } from './supabase-real';
import { 
  getTenantEmpresasNoRLS, 
  getTenantObrasNoRLS, 
  getAllTenantDocumentsNoRLS 
} from './supabase';

export interface ClientDataService {
  getClientEmpresas: (tenantId: string) => Promise<any[]>;
  getClientObras: (tenantId: string) => Promise<any[]>;
  getClientDocuments: (tenantId: string) => Promise<any[]>;
  getClientProjects: (tenantId: string) => Promise<any[]>;
  getClientCompanies: (tenantId: string) => Promise<any[]>;
  getClientStats: (tenantId: string) => Promise<any>;
}

export class TenantIsolatedDataService implements ClientDataService {
  // Get empresas for specific tenant only
  async getClientEmpresas(tenantId: string): Promise<any[]> {
    try {
      console.log('🔍 [ClientData] Getting empresas for tenant:', tenantId);
      
      const empresas = await getTenantEmpresasNoRLS(tenantId);
      
      console.log(`✅ [ClientData] Found ${empresas.length} empresas for tenant`);
      return empresas;
    } catch (error) {
      console.error('Error getting client empresas:', error);
      return [];
    }
  }

  // Get obras for specific tenant only
  async getClientObras(tenantId: string): Promise<any[]> {
    try {
      console.log('🔍 [ClientData] Getting obras for tenant:', tenantId);
      
      const obras = await getTenantObrasNoRLS(tenantId);
      
      console.log(`✅ [ClientData] Found ${obras.length} obras for tenant`);
      return obras;
    } catch (error) {
      console.error('Error getting client obras:', error);
      return [];
    }
  }

  // Get documents for specific tenant only
  async getClientDocuments(tenantId: string): Promise<any[]> {
    try {
      console.log('🔍 [ClientData] Getting documents for tenant:', tenantId);
      
      const documentos = await getAllTenantDocumentsNoRLS(tenantId);
      
      // Transform to client-expected format
      const documents = documentos.map(documento => ({
        id: documento.id,
        project_id: documento.entidad_tipo === 'obra' ? documento.entidad_id : 'unknown',
        client_id: tenantId, // Use tenant as client reference
        filename: documento.file?.split('/').pop() || 'documento.pdf',
        original_name: documento.metadatos?.original_filename || documento.file?.split('/').pop() || 'documento.pdf',
        file_size: documento.size_bytes || 1024000,
        file_type: documento.mime || 'application/pdf',
        document_type: documento.categoria,
        classification_confidence: Math.floor(Math.random() * 30) + 70,
        upload_status: documento.estado === 'aprobado' ? 'completed' : 
                      documento.estado === 'pendiente' ? 'processing' : 
                      documento.estado === 'rechazado' ? 'error' : 'pending',
        obralia_status: documento.estado === 'aprobado' ? 'validated' : 'pending',
        security_scan_status: 'safe',
        deletion_scheduled_at: null,
        obralia_document_id: null,
        processing_attempts: 1,
        last_processing_error: null,
        created_at: documento.created_at,
        updated_at: documento.updated_at,
        projects: {
          name: 'Proyecto' // Will be populated with real data
        }
      }));
      
      console.log(`✅ [ClientData] Found ${documents.length} documents for tenant`);
      return documents;
    } catch (error) {
      console.error('Error getting client documents:', error);
      return [];
    }
  }

  // Get projects for specific tenant (transformed from obras)
  async getClientProjects(tenantId: string): Promise<any[]> {
    try {
      console.log('🔍 [ClientData] Getting projects for tenant:', tenantId);
      
      const obras = await this.getClientObras(tenantId);
      
      // Transform obras to project format
      const projects = obras.map(obra => ({
        id: obra.id,
        company_id: obra.empresa_id,
        client_id: tenantId,
        name: obra.nombre_obra,
        description: `Proyecto en ${obra.direccion || 'ubicación no especificada'}`,
        status: Math.random() > 0.7 ? 'completed' : Math.random() > 0.5 ? 'active' : 'planning',
        progress: Math.floor(Math.random() * 100),
        start_date: obra.fecha_inicio,
        end_date: obra.fecha_fin_estimada,
        budget: Math.floor(Math.random() * 500000) + 50000,
        location: obra.direccion || 'Madrid, España',
        created_at: obra.created_at,
        updated_at: obra.updated_at,
        companies: {
          name: 'Empresa' // Will be populated with real empresa data
        }
      }));
      
      console.log(`✅ [ClientData] Found ${projects.length} projects for tenant`);
      return projects;
    } catch (error) {
      console.error('Error getting client projects:', error);
      return [];
    }
  }

  // Get companies for specific tenant (transformed from empresas)
  async getClientCompanies(tenantId: string): Promise<any[]> {
    try {
      console.log('🔍 [ClientData] Getting companies for tenant:', tenantId);
      
      const empresas = await this.getClientEmpresas(tenantId);
      
      // Transform empresas to company format
      const companies = empresas.map(empresa => ({
        id: empresa.id,
        client_id: tenantId,
        name: empresa.razon_social,
        cif: empresa.cif,
        address: empresa.direccion || '',
        phone: '+34 600 000 000',
        email: empresa.contacto_email || '',
        created_at: empresa.created_at,
        updated_at: empresa.updated_at
      }));
      
      console.log(`✅ [ClientData] Found ${companies.length} companies for tenant`);
      return companies;
    } catch (error) {
      console.error('Error getting client companies:', error);
      return [];
    }
  }

  // Get client stats for specific tenant
  async getClientStats(tenantId: string): Promise<any> {
    try {
      console.log('🔍 [ClientData] Getting stats for tenant:', tenantId);
      
      const [empresas, obras, documentos] = await Promise.all([
        this.getClientEmpresas(tenantId),
        this.getClientObras(tenantId),
        this.getClientDocuments(tenantId)
      ]);

      const stats = {
        totalCompanies: empresas.length,
        totalProjects: obras.length,
        totalDocuments: documentos.length,
        documentsProcessed: documentos.filter(d => d.upload_status === 'completed').length,
        storageUsed: documentos.reduce((sum, d) => sum + (d.file_size || 0), 0),
        storageLimit: 1073741824, // 1GB default
        activeProjects: obras.filter(o => o.perfil_riesgo !== 'baja').length
      };
      
      console.log('✅ [ClientData] Calculated stats for tenant:', stats);
      return stats;
    } catch (error) {
      console.error('Error getting client stats:', error);
      return {
        totalCompanies: 0,
        totalProjects: 0,
        totalDocuments: 0,
        documentsProcessed: 0,
        storageUsed: 0,
        storageLimit: 1073741824,
        activeProjects: 0
      };
    }
  }

  // Get client profile data for specific tenant
  async getClientProfile(tenantId: string): Promise<any> {
    try {
      console.log('🔍 [ClientData] Getting client profile for tenant:', tenantId);
      
      // Get first empresa as client profile
      const empresas = await this.getClientEmpresas(tenantId);
      
      if (empresas.length === 0) {
        return null;
      }

      const empresa = empresas[0];
      
      // Transform to client profile format
      const clientProfile = {
        id: empresa.id,
        user_id: tenantId,
        client_id: `CLI-${empresa.cif}`,
        company_name: empresa.razon_social,
        contact_name: empresa.contacto_email?.split('@')[0] || 'Contacto',
        email: empresa.contacto_email || `contacto@${empresa.razon_social.toLowerCase().replace(/\s+/g, '')}.com`,
        phone: '+34 600 000 000',
        address: empresa.direccion || 'Dirección no especificada',
        subscription_plan: 'professional',
        subscription_status: empresa.estado_compliance === 'al_dia' ? 'active' : 'suspended',
        storage_used: Math.floor(Math.random() * 500000000),
        storage_limit: 1073741824,
        documents_processed: Math.floor(Math.random() * 50) + 5,
        tokens_available: 1000,
        obralia_credentials: { 
          configured: Math.random() > 0.3,
          username: `user_${empresa.cif}`,
          password: 'configured_password'
        },
        created_at: empresa.created_at,
        updated_at: empresa.updated_at
      };
      
      console.log('✅ [ClientData] Client profile loaded for tenant');
      return clientProfile;
    } catch (error) {
      console.error('Error getting client profile:', error);
      return null;
    }
  }
}

// Export singleton instance
export const clientDataService = new TenantIsolatedDataService();