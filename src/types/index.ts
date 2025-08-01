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
}

export interface Company {
  id: string;
  client_id: string;
  name: string;
  cif: string;
  address: string;
  created_at: string;
  updated_at: string;
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
}

export interface AuditLog {
  id: string;
  user_id: string;
  client_id?: string;
  action: string;
  resource: string;
  details: any;
  ip_address: string;
  user_agent: string;
  created_at: string;
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

// Nueva interfaz para mandatos SEPA (basada en datos mock)
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

// Nueva interfaz para recibos (basada en datos mock)
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
}

// Nueva interfaz para pasarelas de pago (basada en datos mock)
export interface PaymentGateway {
  id: string;
  name: string;
  type: 'stripe' | 'paypal' | 'sepa' | 'bizum' | 'custom';
  status: 'active' | 'inactive' | 'warning';
  commission_type: 'percentage' | 'fixed' | 'mixed';
  commission_percentage?: number;
  commission_fixed?: number;
  api_key?: string;
  secret_key?: string;
  webhook_url?: string;
  supported_currencies: string[];
  min_amount?: number;
  max_amount?: number;
  description: string;
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