import { supabaseServiceClient, supabaseClient } from './supabase-real';

export interface TenantMetadata {
  id: string;
  tenant_id: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  company_address?: string;
  subscription_plan: string;
  subscription_status: string;
  subscription_start_date?: string;
  subscription_end_date?: string;
  storage_limit: number;
  storage_used: number;
  documents_limit: number;
  documents_count: number;
  companies_limit: number;
  companies_count: number;
  users_limit: number;
  users_count: number;
  tokens_available: number;
  tokens_used: number;
  monthly_cost: number;
  total_revenue: number;
  last_payment_date?: string;
  next_billing_date?: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  platform_credentials: any;
  last_activity?: string;
  last_login?: string;
  is_trial: boolean;
  trial_end_date?: string;
  is_suspended: boolean;
  suspension_reason?: string;
  internal_notes?: string;
  account_manager?: string;
  created_at: string;
  updated_at: string;
}

export interface TenantWithMetadata {
  id: string;
  name: string;
  status: string;
  created_at: string;
  updated_at: string;
  metadata?: TenantMetadata;
  companies_count?: number;
  projects_count?: number;
  documents_count?: number;
  users_count?: number;
}

export interface TenantMetrics {
  companies_count: number;
  projects_count: number;
  documents_count: number;
  users_count: number;
  storage_used: number;
  last_document_upload?: string;
  last_user_activity?: string;
}

export class TenantDataService {
  static async getAllTenantsWithMetadata(): Promise<TenantWithMetadata[]> {
    try {
      console.log('🔍 [TenantDataService] Fetching all tenants with metadata...');

      const { data: tenants, error } = await supabaseServiceClient
        .from('tenants')
        .select(`
          *,
          tenant_metadata (*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ [TenantDataService] Error fetching tenants:', error);
        throw error;
      }

      console.log(`✅ [TenantDataService] Fetched ${tenants?.length || 0} tenants`);
      return tenants as TenantWithMetadata[];
    } catch (error) {
      console.error('❌ [TenantDataService] Exception:', error);
      throw error;
    }
  }

  static async getTenantById(tenantId: string): Promise<TenantWithMetadata | null> {
    try {
      console.log('🔍 [TenantDataService] Fetching tenant:', tenantId);

      const { data, error } = await supabaseServiceClient
        .from('tenants')
        .select(`
          *,
          tenant_metadata (*)
        `)
        .eq('id', tenantId)
        .maybeSingle();

      if (error) {
        console.error('❌ [TenantDataService] Error fetching tenant:', error);
        throw error;
      }

      return data as TenantWithMetadata | null;
    } catch (error) {
      console.error('❌ [TenantDataService] Exception:', error);
      throw error;
    }
  }

  static async getTenantMetrics(tenantId: string): Promise<TenantMetrics> {
    try {
      console.log('🔍 [TenantDataService] Fetching metrics for tenant:', tenantId);

      const { data, error } = await supabaseServiceClient
        .rpc('get_tenant_metrics', { p_tenant_id: tenantId });

      if (error) {
        console.error('❌ [TenantDataService] Error fetching metrics:', error);
        throw error;
      }

      return data as TenantMetrics;
    } catch (error) {
      console.error('❌ [TenantDataService] Exception:', error);
      throw error;
    }
  }

  static async getTenantCompanies(tenantId: string): Promise<any[]> {
    try {
      console.log('🔍 [TenantDataService] Fetching companies for tenant:', tenantId);

      const { data, error } = await supabaseServiceClient
        .from('empresas')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ [TenantDataService] Error fetching companies:', error);
        throw error;
      }

      console.log(`✅ [TenantDataService] Fetched ${data?.length || 0} companies`);
      return data || [];
    } catch (error) {
      console.error('❌ [TenantDataService] Exception:', error);
      throw error;
    }
  }

  static async getTenantProjects(tenantId: string): Promise<any[]> {
    try {
      console.log('🔍 [TenantDataService] Fetching projects for tenant:', tenantId);

      const { data, error } = await supabaseServiceClient
        .from('obras')
        .select(`
          *,
          empresas!inner (
            razon_social,
            cif
          )
        `)
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ [TenantDataService] Error fetching projects:', error);
        throw error;
      }

      console.log(`✅ [TenantDataService] Fetched ${data?.length || 0} projects`);
      return data || [];
    } catch (error) {
      console.error('❌ [TenantDataService] Exception:', error);
      throw error;
    }
  }

  static async getTenantDocuments(tenantId: string): Promise<any[]> {
    try {
      console.log('🔍 [TenantDataService] Fetching documents for tenant:', tenantId);

      const { data, error } = await supabaseServiceClient
        .from('documentos')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ [TenantDataService] Error fetching documents:', error);
        throw error;
      }

      console.log(`✅ [TenantDataService] Fetched ${data?.length || 0} documents`);
      return data || [];
    } catch (error) {
      console.error('❌ [TenantDataService] Exception:', error);
      throw error;
    }
  }

  static async updateTenantMetrics(tenantId: string): Promise<void> {
    try {
      console.log('🔄 [TenantDataService] Updating metrics for tenant:', tenantId);

      const { error } = await supabaseServiceClient
        .rpc('update_tenant_metrics', { p_tenant_id: tenantId });

      if (error) {
        console.error('❌ [TenantDataService] Error updating metrics:', error);
        throw error;
      }

      console.log('✅ [TenantDataService] Metrics updated successfully');
    } catch (error) {
      console.error('❌ [TenantDataService] Exception:', error);
      throw error;
    }
  }

  static async createTenant(name: string, contactEmail: string, contactName?: string): Promise<TenantWithMetadata> {
    try {
      console.log('🔍 [TenantDataService] Creating new tenant:', name);

      const { data: tenant, error: tenantError } = await supabaseServiceClient
        .from('tenants')
        .insert({
          name,
          status: 'active'
        })
        .select()
        .single();

      if (tenantError) {
        console.error('❌ [TenantDataService] Error creating tenant:', tenantError);
        throw tenantError;
      }

      const { data: metadata, error: metadataError } = await supabaseServiceClient
        .from('tenant_metadata')
        .insert({
          tenant_id: tenant.id,
          contact_name: contactName || name,
          contact_email: contactEmail,
          subscription_plan: 'trial',
          subscription_status: 'trial',
          is_trial: true
        })
        .select()
        .single();

      if (metadataError) {
        console.error('❌ [TenantDataService] Error creating metadata:', metadataError);
        throw metadataError;
      }

      console.log('✅ [TenantDataService] Tenant created successfully:', tenant.id);

      return {
        ...tenant,
        metadata
      };
    } catch (error) {
      console.error('❌ [TenantDataService] Exception:', error);
      throw error;
    }
  }

  static async updateTenantStatus(tenantId: string, status: 'active' | 'suspended'): Promise<void> {
    try {
      console.log('🔄 [TenantDataService] Updating tenant status:', tenantId, status);

      const { error } = await supabaseServiceClient
        .from('tenants')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', tenantId);

      if (error) {
        console.error('❌ [TenantDataService] Error updating status:', error);
        throw error;
      }

      console.log('✅ [TenantDataService] Status updated successfully');
    } catch (error) {
      console.error('❌ [TenantDataService] Exception:', error);
      throw error;
    }
  }

  static async updateTenantMetadata(tenantId: string, updates: Partial<TenantMetadata>): Promise<void> {
    try {
      console.log('🔄 [TenantDataService] Updating tenant metadata:', tenantId);

      const { error } = await supabaseServiceClient
        .from('tenant_metadata')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('tenant_id', tenantId);

      if (error) {
        console.error('❌ [TenantDataService] Error updating metadata:', error);
        throw error;
      }

      console.log('✅ [TenantDataService] Metadata updated successfully');
    } catch (error) {
      console.error('❌ [TenantDataService] Exception:', error);
      throw error;
    }
  }

  static async getAdminTenantsOverview(): Promise<any[]> {
    try {
      console.log('🔍 [TenantDataService] Fetching admin tenants overview...');

      const { data, error } = await supabaseServiceClient
        .from('admin_tenants_overview')
        .select('*')
        .order('tenant_created_at', { ascending: false });

      if (error) {
        console.error('❌ [TenantDataService] Error fetching overview:', error);
        throw error;
      }

      console.log(`✅ [TenantDataService] Fetched overview for ${data?.length || 0} tenants`);
      return data || [];
    } catch (error) {
      console.error('❌ [TenantDataService] Exception:', error);
      throw error;
    }
  }

  static async refreshAdminOverview(): Promise<void> {
    try {
      console.log('🔄 [TenantDataService] Refreshing admin overview...');

      const { error } = await supabaseServiceClient
        .rpc('refresh_materialized_view', { view_name: 'admin_tenants_overview' });

      if (error) {
        console.error('❌ [TenantDataService] Error refreshing overview:', error);
      }

      console.log('✅ [TenantDataService] Overview refreshed successfully');
    } catch (error) {
      console.error('❌ [TenantDataService] Exception:', error);
    }
  }

  static async getTenantUsers(tenantId: string): Promise<any[]> {
    try {
      console.log('🔍 [TenantDataService] Fetching users for tenant:', tenantId);

      const { data, error } = await supabaseServiceClient
        .from('users')
        .select('id, email, name, role, active, created_at, last_login_ip')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ [TenantDataService] Error fetching users:', error);
        throw error;
      }

      console.log(`✅ [TenantDataService] Fetched ${data?.length || 0} users`);
      return data || [];
    } catch (error) {
      console.error('❌ [TenantDataService] Exception:', error);
      throw error;
    }
  }

  static async createCompanyForTenant(tenantId: string, companyData: {
    razon_social: string;
    cif: string;
    rea_numero?: string;
    cnae?: string;
    direccion?: string;
    contacto_email?: string;
  }): Promise<any> {
    try {
      console.log('🔍 [TenantDataService] Creating company for tenant:', tenantId);

      const { data, error } = await supabaseServiceClient
        .from('empresas')
        .insert({
          tenant_id: tenantId,
          ...companyData
        })
        .select()
        .single();

      if (error) {
        console.error('❌ [TenantDataService] Error creating company:', error);
        throw error;
      }

      await this.updateTenantMetrics(tenantId);

      console.log('✅ [TenantDataService] Company created successfully:', data.id);
      return data;
    } catch (error) {
      console.error('❌ [TenantDataService] Exception:', error);
      throw error;
    }
  }
}

export default TenantDataService;
