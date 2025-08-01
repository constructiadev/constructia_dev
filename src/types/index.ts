// ConstructIA - Tipos TypeScript Globales
export interface User {
  id: string;
  email: string;
  role: 'client' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  client_id: string; // Formato: AAAA-REC-0001
  user_id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  address: string;
  subscription_plan: 'basic' | 'professional' | 'enterprise' | 'custom';
  subscription_status: 'active' | 'suspended' | 'cancelled';
  storage_used: number;
  storage_limit: number;
  documents_processed: number;
  tokens_available: number;
  obralia_credentials?: {
    username: string;
    password: string;
    configured: boolean;
  };
  created_at: string;
  updated_at: string;
  last_activity?: string;
  monthly_revenue?: number;
}

export interface Company {
  id: string;
  client_id: string;
  name: string;
  cif: string;
  address: string;
  phone?: string;
  email?: string;
  created_at: string;
  updated_at: string;
  projects_count?: number;
  documents_count?: number;
  status?: 'active' | 'inactive';
  obralia_configured?: boolean;
}

export interface Project {
  id: string;
  company_id: string;
  client_id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'paused' | 'completed';
  progress: number;
  start_date?: string;
  end_date?: string;
  budget?: number;
  location?: string;
  created_at: string;
  updated_at: string;
  company_name?: string;
  documents_count?: number;
  team_members?: number;
}

export interface Document {
  id: string;
  project_id: string;
  client_id: string;
  filename: string;
  original_name: string;
  file_size: number;
  file_type: string;
  document_type: string;
  classification_confidence: number;
  ai_metadata: any;
  upload_status: 'pending' | 'processing' | 'classified' | 'uploaded_to_obralia' | 'completed' | 'error';
  obralia_status: 'pending' | 'uploaded' | 'validated' | 'rejected' | 'error';
  security_scan_status: 'pending' | 'safe' | 'threat_detected';
  deletion_scheduled_at?: string;
  obralia_document_id?: string;
  processing_attempts: number;
  last_processing_error?: string;
  created_at: string;
  updated_at: string;
  project_name?: string;
  company_name?: string;
  processed_at?: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  client_id?: string;
  action: string;
  resource: string;
  resource: string;
  details: any;
  ip_address: string;
  user_agent: string;
  created_at: string;
  user_role?: 'admin' | 'client' | 'system';
  user_email?: string;
  client_name?: string;
  status?: 'success' | 'warning' | 'error';
}

export interface Payment {
  id: string;
  client_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  stripe_payment_intent_id?: string;
  description: string;
  created_at: string;
  updated_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  client_id: string;
  plan: string;
  status: 'active' | 'cancelled' | 'past_due';
  current_period_start: string;
  current_period_end: string;
  stripe_subscription_id?: string;
  created_at: string;
  updated_at: string;
}

export interface KPI {
  id: string;
  name: string;
  value: number | string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  category?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface SEPAMandate {
  id: string;
  mandate_id: string;
  client_id: string;
  deudor_nombre: string;
  deudor_direccion: string;
  deudor_codigo_postal: string;
  deudor_ciudad: string;
  deudor_pais: string;
  deudor_identificacion: string;
  iban: string;
  bic: string;
  banco_nombre: string;
  tipo_pago: 'recurrente' | 'unico';
  amount: number;
  currency: string;
  description: string;
  fecha_firma: string;
  ip_address: string;
  user_agent: string;
  session_id: string;
  status: 'active' | 'cancelled' | 'expired';
  created_at: string;
}

export interface Receipt {
  id: string;
  receipt_number: string;
  client_id: string;
  amount: number;
  base_amount: number;
  tax_amount: number;
  tax_rate: number;
  currency: string;
  payment_method: string;
  gateway_name: string;
  description: string;
  payment_date: string;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  transaction_id: string;
  invoice_items: any;
  client_details: any;
  company_details: any;
  created_at: string;
  updated_at: string;
  client_name?: string;
  client_email?: string;
  client_address?: string;
  client_tax_id?: string;
  gross_amount?: number;
  commission?: number;
}

export interface PaymentGateway {
  id: string;
  name: string;
  type: 'stripe' | 'paypal' | 'sepa' | 'bizum' | 'custom';
  status: 'active' | 'inactive' | 'warning';
  commission_type: 'percentage' | 'fixed' | 'mixed';
  commission_percentage?: number;
  commission_fixed?: number;
  commission_periods?: {
    start_date: string;
    end_date: string;
    percentage?: number;
    fixed?: number;
  }[];
  api_key?: string;
  secret_key?: string;
  webhook_url?: string;
  supported_currencies: string[];
  min_amount?: number;
  max_amount?: number;
  description: string;
  logo_base64?: string;
  transactions?: number;
  volume?: string;
  color?: string;
  created_at: string;
  updated_at: string;
}

export interface SystemSettings {
  id: string;
  key: string;
  value: any;
  description: string;
  updated_at: string;
}

// Nuevas interfaces para tablas identificadas

export interface ProcessingQueue {
  id: string;
  document_id?: string;
  client_id: string;
  filename: string;
  client_name?: string;
  status: 'uploading' | 'analyzing' | 'classified' | 'pending_obralia' | 'uploading_obralia' | 'obralia_validated' | 'completed' | 'error';
  progress?: number;
  classification?: string;
  confidence?: number;
  obralia_section?: string;
  obralia_status?: 'pending' | 'uploaded' | 'validated' | 'rejected';
  error_message?: string;
  event_timestamp?: string;
  created_at: string;
  updated_at: string;
}

export interface Backup {
  id: string;
  name: string;
  backup_date: string;
  size_bytes: number;
  type: 'full' | 'incremental' | 'differential';
  status: 'completed' | 'running' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface TokenPackage {
  id: string;
  name: string;
  tokens: number;
  price: number;
  description?: string;
  popular?: boolean;
  created_at: string;
  updated_at: string;
}

export interface StoragePackage {
  id: string;
  name: string;
  storage_mb: number;
  price: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  storage_mb: number;
  tokens_per_month: number;
  documents_per_month: string;
  support_level: string;
  popular?: boolean;
  created_at: string;
  updated_at: string;
}

export interface FiscalEvent {
  id: string;
  title: string;
  event_date: string;
  amount_estimate?: number;
  status: 'upcoming' | 'completed' | 'overdue';
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface APIEndpoint {
  id: string;
  name: string;
  method: string;
  endpoint_path: string;
  requests_per_hour?: number;
  avg_response_time_ms?: number;
  error_rate?: number;
  status: 'healthy' | 'slow' | 'error';
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface APIIntegration {
  id: string;
  name: string;
  status: 'connected' | 'warning' | 'error';
  description?: string;
  requests_today?: number;
  avg_response_time_ms?: number;
  last_sync?: string;
  config_details?: any;
  created_at: string;
  updated_at: string;
}