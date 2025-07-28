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
  name: string;
  description: string;
  status: 'active' | 'completed' | 'paused';
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
  name: string;
  value: number | string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export interface SystemSettings {
  id: string;
  key: string;
  value: any;
  description: string;
  updated_at: string;
}