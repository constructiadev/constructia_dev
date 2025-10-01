// ConstructIA - Tipos TypeScript Globales

// Nuevos tipos para la arquitectura multi-tenant
export type UserRole = 'SuperAdmin' | 'Cliente' | 'ClienteDemo';
export type ClientRole = 'Cliente' | 'ClienteDemo';
export type AdminRole = 'SuperAdmin';
export type TenantStatus = 'active' | 'suspended';
export type DocumentoCategoria = 'PRL' | 'APTITUD_MEDICA' | 'DNI' | 'ALTA_SS' | 'CONTRATO' | 'SEGURO_RC' | 'REA' | 'FORMACION_PRL' | 'EVAL_RIESGOS' | 'CERT_MAQUINARIA' | 'PLAN_SEGURIDAD' | 'OTROS';
export type DocumentoCategoria = 'prl' | 'aptitud_medica' | 'dni' | 'alta_ss' | 'contrato' | 'seguro_rc' | 'rea' | 'formacion_prl' | 'eval_riesgos' | 'cert_maquinaria' | 'plan_seguridad' | 'otros';
export type DocumentoEstado = 'borrador' | 'pendiente' | 'aprobado' | 'rechazado';
export type EntidadTipo = 'empresa' | 'trabajador' | 'maquinaria' | 'obra';
export type PlataformaTipo = 'nalanda' | 'ctaima' | 'ecoordina' | 'otro';
export type PerfilRiesgo = 'baja' | 'media' | 'alta';
export type EstadoCompliance = 'al_dia' | 'pendiente' | 'caducado';
export type EstadoHomologacion = 'ok' | 'pendiente' | 'bloqueado';
export type TareaTipo = 'subir' | 'revisar' | 'aprobar' | 'rechazar' | 'subsanar' | 'enviar';
export type TareaEstado = 'abierta' | 'en_progreso' | 'resuelta';
export type JobEstado = 'pendiente' | 'enviado' | 'aceptado' | 'rechazado' | 'error';
export type AdaptadorEstado = 'ready' | 'error';
export type PlanTipo = 'Starter' | 'Autonomo' | 'AutonomoEmpleados' | 'Empresas' | 'Asesorias';
export type SuscripcionEstado = 'activa' | 'cancelada' | 'trial';
export type MensajeTipo = 'info' | 'notificacion' | 'alerta' | 'recordatorio' | 'urgencia';
export type Prioridad = 'baja' | 'media' | 'alta';
export type MensajeEstado = 'programado' | 'enviado' | 'vencido';
export type ReporteTipo = 'operativo' | 'financiero';
export type TokenTipo = 'compra' | 'consumo';
export type MedioPago = 'stripe' | 'paypal' | 'bizum' | 'sepa' | 'tarjeta';
export type QueueStatus = 'queued' | 'in_progress' | 'uploaded' | 'error';
export type DocumentoOrigen = 'usuario' | 'ia' | 'import';

// Authentication interfaces
export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: string;
  tenant_id: string;
}

export interface AuthenticatedClient extends AuthenticatedUser {
  client_record_id: string;
  client_record_id: string;
  company_name: string;
  subscription_plan: string;
  subscription_status: string;
  storage_used: number;
  storage_limit: number;
  tokens_available: number;
  obralia_credentials?: {
    configured: boolean;
    username?: string;
    password?: string;
  };
}

// Re-exportar tipos de payloads
export type {
  CompanyPayload,
  SitePayload,
  WorkerPayload,
  MachinePayload,
  DocumentPayload,
  IntegrationPayload,
  PayloadBuilder,
  PayloadTransformer
} from './payloads';

// Re-exportar tipos de mapping
export type {
  MappingRule,
  MappingTemplate,
  TransformFunction,
  WorkflowStep,
  Workflow,
  MappingEngine,
  MappingTemplateService,
  WorkflowEngine,
  TransformEngine
} from './mapping';

// Interfaces para la nueva arquitectura
export interface Tenant {
  id: string;
  name: string;
  status: TenantStatus;
  created_at: string;
  updated_at: string;
}

export interface NewUser {
  id: string;
  tenant_id: string;
  email: string;
  name?: string;
  role: UserRole;
  active: boolean;
  password_hash?: string;
  last_login_ip?: string;
  created_at: string;
  updated_at: string;
}

export interface Empresa {
  id: string;
  tenant_id: string;
  razon_social: string;
  cif: string;
  rea_numero?: string;
  cnae?: string;
  direccion?: string;
  contacto_email?: string;
  estado_compliance: EstadoCompliance;
  created_at: string;
  updated_at: string;
}

export interface Obra {
  id: string;
  tenant_id: string;
  empresa_id: string;
  nombre_obra: string;
  codigo_obra: string;
  direccion?: string;
  cliente_final?: string;
  fecha_inicio?: string;
  fecha_fin_estimada?: string;
  plataforma_destino?: PlataformaTipo;
  perfil_riesgo: PerfilRiesgo;
  created_at: string;
  updated_at: string;
}

export interface Proveedor {
  id: string;
  tenant_id: string;
  empresa_id: string;
  razon_social: string;
  cif: string;
  rea_numero?: string;
  contacto_email?: string;
  estado_homologacion: EstadoHomologacion;
  created_at: string;
  updated_at: string;
}

export interface Trabajador {
  id: string;
  tenant_id: string;
  proveedor_id: string;
  dni_nie: string;
  nombre?: string;
  apellido?: string;
  nss?: string;
  puesto?: string;
  aptitud_medica_caducidad?: string;
  formacion_prl_nivel?: string;
  formacion_prl_caducidad?: string;
  epis_entregadas: boolean;
  created_at: string;
  updated_at: string;
}

export interface Maquinaria {
  id: string;
  tenant_id: string;
  empresa_id: string;
  tipo?: string;
  marca_modelo?: string;
  numero_serie?: string;
  certificado_ce: boolean;
  mantenimiento_caducidad?: string;
  seguro_caducidad?: string;
  created_at: string;
  updated_at: string;
}

export interface NewDocumento {
  id: string;
  tenant_id: string;
  entidad_tipo: EntidadTipo;
  entidad_id: string;
  categoria: DocumentoCategoria;
  file: string;
  mime?: string;
  size_bytes?: number;
  hash_sha256?: string;
  version: number;
  estado: DocumentoEstado;
  caducidad?: string;
  emisor?: string;
  observaciones?: string;
  metadatos: any;
  origen: DocumentoOrigen;
  sensible: boolean;
  virtual_path?: string;
  created_at: string;
  updated_at: string;
}

export interface Tarea {
  id: string;
  tenant_id: string;
  tipo: TareaTipo;
  documento_id?: string;
  obra_id?: string;
  asignado_role?: string;
  asignado_user?: string;
  vencimiento: string;
  estado: TareaEstado;
  comentarios?: string;
  created_at: string;
  updated_at: string;
}

export interface RequisitoPlataforma {
  id: string;
  tenant_id: string;
  plataforma: PlataformaTipo;
  aplica_a: EntidadTipo;
  perfil_riesgo: PerfilRiesgo;
  categoria: DocumentoCategoria;
  obligatorio: boolean;
  reglas_validacion: any;
  created_at: string;
  updated_at: string;
}

export interface MappingTemplate {
  id: string;
  tenant_id: string;
  plataforma: PlataformaTipo;
  version: number;
  schema_destino: any;
  rules: any;
  created_at: string;
  updated_at: string;
}

export interface Adaptador {
  id: string;
  tenant_id: string;
  plataforma: PlataformaTipo;
  alias?: string;
  credenciales: any;
  estado: AdaptadorEstado;
  ultimo_envio?: string;
  created_at: string;
  updated_at: string;
}

export interface JobIntegracion {
  id: string;
  tenant_id: string;
  plataforma: PlataformaTipo;
  obra_id: string;
  payload?: any;
  estado: JobEstado;
  intentos: number;
  respuesta?: any;
  trace_id?: string;
  created_at: string;
  updated_at: string;
}

export interface NewSuscripcion {
  id: string;
  tenant_id: string;
  plan: PlanTipo;
  limites: any;
  stripe_customer_id?: string;
  estado: SuscripcionEstado;
  created_at: string;
  updated_at: string;
}

export interface NewAuditoria {
  id: string;
  tenant_id: string;
  actor_user?: string;
  accion: string;
  entidad?: string;
  entidad_id?: string;
  ip?: string;
  detalles: any;
  created_at: string;
}

export interface Mensaje {
  id: string;
  tenant_id: string;
  tipo: MensajeTipo;
  titulo?: string;
  contenido?: string;
  prioridad: Prioridad;
  vence?: string;
  destinatarios: any;
  estado: MensajeEstado;
  created_at: string;
  updated_at: string;
}

export interface Reporte {
  id: string;
  tenant_id: string;
  mes: string;
  tipo: ReporteTipo;
  kpis: any;
  pdf_file?: string;
  enviado_a: any;
  created_at: string;
  updated_at: string;
}

export interface TokenTransaction {
  id: string;
  tenant_id: string;
  concepto?: string;
  monto?: number;
  tipo?: TokenTipo;
  medio_pago?: MedioPago;
  created_at: string;
}

export interface CheckoutProvider {
  id: string;
  tenant_id: string;
  proveedor: MedioPago;
  logo_base64?: string;
  comision_pct?: number;
  config: any;
  created_at: string;
  updated_at: string;
}

export interface MandatoSEPA {
  id: string;
  tenant_id: string;
  cliente_email: string;
  iban: string;
  firma_base64?: string;
  pdf_firmado?: string;
  firmado_en?: string;
  created_at: string;
  updated_at: string;
}

export interface ManualUploadQueue {
  id: string;
  tenant_id: string;
  empresa_id: string;
  obra_id: string;
  documento_id: string;
  status: QueueStatus;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  operator_user?: string;
  nota?: string;
  created_at: string;
  updated_at: string;
}
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
    description?: string;
  }[];
  api_key?: string;
  secret_key?: string;
  webhook_url?: string;
  supported_currencies: string[];
  min_amount?: number;
  max_amount?: number;
  description: string;
  transactions?: number;
  volume?: string;
  color?: string;
  created_at: string;
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

export interface AIInsight {
  id: string;
  insight_type: 'trend' | 'anomaly' | 'recommendation' | 'prediction' | 'alert';
  title: string;
  description: string;
  data_source: any;
  ai_analysis: any;
  confidence_score: number;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'archived' | 'dismissed';
  generated_by: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}