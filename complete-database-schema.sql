-- ============================================
-- CONSTRUCTIA PLATFORM - COMPLETE DATABASE SCHEMA
-- Multi-tenant Architecture - Complete Setup
-- ============================================

-- STEP 1: CREATE ENUM TYPES
-- ============================================

DO $$ BEGIN CREATE TYPE user_role AS ENUM ('SuperAdmin', 'Cliente', 'ClienteDemo'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE tenant_status AS ENUM ('active', 'suspended'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE documento_categoria AS ENUM ('PRL', 'APTITUD_MEDICA', 'DNI', 'ALTA_SS', 'CONTRATO', 'SEGURO_RC', 'REA', 'FORMACION_PRL', 'EVAL_RIESGOS', 'CERT_MAQUINARIA', 'PLAN_SEGURIDAD', 'OTROS'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE documento_estado AS ENUM ('borrador', 'pendiente', 'aprobado', 'rechazado'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE entidad_tipo AS ENUM ('empresa', 'trabajador', 'maquinaria', 'obra'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE plataforma_tipo AS ENUM ('nalanda', 'ctaima', 'ecoordina', 'otro'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE perfil_riesgo AS ENUM ('baja', 'media', 'alta'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE estado_compliance AS ENUM ('al_dia', 'pendiente', 'caducado'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE estado_homologacion AS ENUM ('ok', 'pendiente', 'bloqueado'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE tarea_tipo AS ENUM ('subir', 'revisar', 'aprobar', 'rechazar', 'subsanar', 'enviar'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE tarea_estado AS ENUM ('abierta', 'en_progreso', 'resuelta'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE job_estado AS ENUM ('pendiente', 'enviado', 'aceptado', 'rechazado', 'error'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE adaptador_estado AS ENUM ('ready', 'error'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE plan_tipo AS ENUM ('Starter', 'Autonomo', 'AutonomoEmpleados', 'Empresas', 'Asesorias'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE suscripcion_estado AS ENUM ('activa', 'cancelada', 'trial'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE mensaje_tipo AS ENUM ('info', 'notificacion', 'alerta', 'recordatorio', 'urgencia'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE prioridad AS ENUM ('baja', 'media', 'alta'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE mensaje_estado AS ENUM ('programado', 'enviado', 'vencido'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE reporte_tipo AS ENUM ('operativo', 'financiero'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE token_tipo AS ENUM ('compra', 'consumo'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE medio_pago AS ENUM ('stripe', 'paypal', 'bizum', 'sepa', 'tarjeta'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE queue_status AS ENUM ('queued', 'in_progress', 'uploaded', 'error'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE documento_origen AS ENUM ('usuario', 'ia', 'import'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE compliance_status AS ENUM ('compliant', 'warning', 'non_compliant'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE request_type AS ENUM ('access', 'rectification', 'erasure', 'portability', 'objection'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE request_status AS ENUM ('pending', 'in_progress', 'completed', 'rejected'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE risk_level AS ENUM ('low', 'medium', 'high', 'very_high'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE assessment_status AS ENUM ('draft', 'under_review', 'approved', 'requires_action'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE breach_severity AS ENUM ('low', 'medium', 'high', 'critical'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE breach_status AS ENUM ('investigating', 'contained', 'resolved'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- STEP 2: CREATE CORE TABLES
-- ============================================

-- Tenants table
CREATE TABLE IF NOT EXISTS public.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  status tenant_status DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Empresas table
CREATE TABLE IF NOT EXISTS public.empresas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  razon_social text NOT NULL,
  cif text NOT NULL,
  rea_numero text,
  cnae text,
  direccion text,
  contacto_email text,
  estado_compliance estado_compliance DEFAULT 'pendiente',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id, cif)
);

ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_empresas_tenant_cif ON public.empresas(tenant_id, cif);

-- Obras table
CREATE TABLE IF NOT EXISTS public.obras (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  empresa_id uuid NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  nombre_obra text NOT NULL,
  codigo_obra text NOT NULL,
  direccion text,
  cliente_final text,
  fecha_inicio date,
  fecha_fin_estimada date,
  plataforma_destino plataforma_tipo,
  perfil_riesgo perfil_riesgo DEFAULT 'media',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id, codigo_obra)
);

ALTER TABLE public.obras ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_obras_tenant_codigo ON public.obras(tenant_id, codigo_obra);

-- Proveedores table
CREATE TABLE IF NOT EXISTS public.proveedores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  empresa_id uuid NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  razon_social text NOT NULL,
  cif text NOT NULL,
  rea_numero text,
  contacto_email text,
  estado_homologacion estado_homologacion DEFAULT 'pendiente',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id, cif)
);

ALTER TABLE public.proveedores ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_proveedores_tenant_cif ON public.proveedores(tenant_id, cif);

-- Trabajadores table
CREATE TABLE IF NOT EXISTS public.trabajadores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  proveedor_id uuid NOT NULL REFERENCES public.proveedores(id) ON DELETE CASCADE,
  dni_nie text NOT NULL,
  nombre text,
  apellido text,
  nss text,
  puesto text,
  aptitud_medica_caducidad date,
  formacion_prl_nivel text,
  formacion_prl_caducidad date,
  epis_entregadas boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id, dni_nie)
);

ALTER TABLE public.trabajadores ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_trabajadores_tenant_dni ON public.trabajadores(tenant_id, dni_nie);

-- Maquinaria table
CREATE TABLE IF NOT EXISTS public.maquinaria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  empresa_id uuid NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  tipo text,
  marca_modelo text,
  numero_serie text,
  certificado_ce boolean DEFAULT true,
  mantenimiento_caducidad date,
  seguro_caducidad date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id, numero_serie)
);

ALTER TABLE public.maquinaria ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_maquinaria_tenant_serie ON public.maquinaria(tenant_id, numero_serie);

-- Documentos table
CREATE TABLE IF NOT EXISTS public.documentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  entidad_tipo entidad_tipo NOT NULL,
  entidad_id text NOT NULL,
  categoria documento_categoria NOT NULL,
  file text NOT NULL,
  mime text,
  size_bytes bigint,
  hash_sha256 text,
  version integer DEFAULT 1,
  estado documento_estado DEFAULT 'pendiente',
  caducidad date,
  emisor text,
  observaciones text,
  metadatos jsonb DEFAULT '{}',
  origen documento_origen DEFAULT 'usuario',
  sensible boolean DEFAULT false,
  virtual_path text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id, entidad_tipo, entidad_id, categoria, version),
  UNIQUE(tenant_id, hash_sha256)
);

ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_documentos_entidad ON public.documentos(tenant_id, entidad_tipo, entidad_id, categoria);
CREATE INDEX IF NOT EXISTS idx_documentos_hash ON public.documentos(tenant_id, hash_sha256);

-- Tareas table
CREATE TABLE IF NOT EXISTS public.tareas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  tipo tarea_tipo NOT NULL,
  documento_id uuid REFERENCES public.documentos(id) ON DELETE CASCADE,
  obra_id uuid REFERENCES public.obras(id) ON DELETE CASCADE,
  asignado_role text,
  asignado_user uuid,
  vencimiento timestamptz NOT NULL,
  estado tarea_estado DEFAULT 'abierta',
  comentarios text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.tareas ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_tareas_tenant_estado ON public.tareas(tenant_id, estado);

-- Requisitos plataforma table
CREATE TABLE IF NOT EXISTS public.requisitos_plataforma (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  plataforma plataforma_tipo NOT NULL,
  aplica_a entidad_tipo NOT NULL,
  perfil_riesgo perfil_riesgo NOT NULL,
  categoria documento_categoria NOT NULL,
  obligatorio boolean DEFAULT true,
  reglas_validacion jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id, plataforma, aplica_a, perfil_riesgo, categoria)
);

ALTER TABLE public.requisitos_plataforma ENABLE ROW LEVEL SECURITY;

-- Mapping templates table
CREATE TABLE IF NOT EXISTS public.mapping_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  plataforma plataforma_tipo NOT NULL,
  version integer DEFAULT 1,
  schema_destino jsonb NOT NULL,
  rules jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id, plataforma, version)
);

ALTER TABLE public.mapping_templates ENABLE ROW LEVEL SECURITY;

-- Adaptadores table
CREATE TABLE IF NOT EXISTS public.adaptadores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  plataforma plataforma_tipo NOT NULL,
  alias text,
  credenciales jsonb NOT NULL,
  estado adaptador_estado DEFAULT 'ready',
  ultimo_envio timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id, plataforma, alias)
);

ALTER TABLE public.adaptadores ENABLE ROW LEVEL SECURITY;

-- Jobs integracion table
CREATE TABLE IF NOT EXISTS public.jobs_integracion (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  plataforma plataforma_tipo NOT NULL,
  obra_id uuid NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  payload jsonb,
  estado job_estado DEFAULT 'pendiente',
  intentos integer DEFAULT 0,
  respuesta jsonb,
  trace_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.jobs_integracion ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_jobs_tenant_plataforma ON public.jobs_integracion(tenant_id, plataforma, obra_id, estado);

-- Suscripciones table
CREATE TABLE IF NOT EXISTS public.suscripciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE UNIQUE,
  plan plan_tipo NOT NULL,
  limites jsonb DEFAULT '{}',
  stripe_customer_id text,
  estado suscripcion_estado DEFAULT 'trial',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.suscripciones ENABLE ROW LEVEL SECURITY;

-- Auditoria table
CREATE TABLE IF NOT EXISTS public.auditoria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  actor_user uuid,
  accion text NOT NULL,
  entidad text,
  entidad_id text,
  ip text,
  detalles jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.auditoria ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_auditoria_tenant_fecha ON public.auditoria(tenant_id, created_at);

-- Mensajes table
CREATE TABLE IF NOT EXISTS public.mensajes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  tipo mensaje_tipo NOT NULL,
  titulo text,
  contenido text,
  prioridad prioridad DEFAULT 'media',
  vence timestamptz,
  destinatarios jsonb DEFAULT '[]',
  estado mensaje_estado DEFAULT 'programado',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.mensajes ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_mensajes_tenant_estado ON public.mensajes(tenant_id, estado);

-- Reportes table
CREATE TABLE IF NOT EXISTS public.reportes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  mes text NOT NULL,
  tipo reporte_tipo NOT NULL,
  kpis jsonb DEFAULT '{}',
  pdf_file text,
  enviado_a jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id, mes, tipo)
);

ALTER TABLE public.reportes ENABLE ROW LEVEL SECURITY;

-- Token transactions table
CREATE TABLE IF NOT EXISTS public.token_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  concepto text,
  monto numeric(10,2),
  tipo token_tipo,
  medio_pago medio_pago,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.token_transactions ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_token_transactions_tenant_fecha ON public.token_transactions(tenant_id, created_at);

-- Checkout providers table
CREATE TABLE IF NOT EXISTS public.checkout_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  proveedor medio_pago NOT NULL,
  logo_base64 text,
  comision_pct numeric(5,2),
  config jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id, proveedor)
);

ALTER TABLE public.checkout_providers ENABLE ROW LEVEL SECURITY;

-- Mandatos SEPA table
CREATE TABLE IF NOT EXISTS public.mandatos_sepa (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  cliente_email text NOT NULL,
  iban text NOT NULL,
  firma_base64 text,
  pdf_firmado text,
  firmado_en timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.mandatos_sepa ENABLE ROW LEVEL SECURITY;

-- System configurations table
CREATE TABLE IF NOT EXISTS public.system_configurations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_name text DEFAULT 'ConstructIA',
  admin_email text DEFAULT 'admin@constructia.com',
  max_file_size integer DEFAULT 50,
  backup_frequency text DEFAULT 'daily',
  ai_auto_classification boolean DEFAULT true,
  email_notifications boolean DEFAULT true,
  audit_retention_days integer DEFAULT 365,
  maintenance_mode boolean DEFAULT false,
  max_concurrent_users integer DEFAULT 500,
  session_timeout integer DEFAULT 30,
  password_policy_strength text DEFAULT 'high',
  two_factor_required boolean DEFAULT true,
  security_config jsonb,
  integration_config jsonb,
  compliance_config jsonb,
  performance_config jsonb,
  notification_config jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.system_configurations ENABLE ROW LEVEL SECURITY;

-- Compliance checks table
CREATE TABLE IF NOT EXISTS public.compliance_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  check_name text NOT NULL,
  status compliance_status NOT NULL,
  description text,
  last_verified timestamptz,
  next_review timestamptz,
  responsible_user text,
  evidence_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.compliance_checks ENABLE ROW LEVEL SECURITY;

-- Data subject requests table
CREATE TABLE IF NOT EXISTS public.data_subject_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_type request_type NOT NULL,
  requester_email text NOT NULL,
  requester_name text,
  status request_status NOT NULL,
  request_details jsonb,
  response_data jsonb,
  completed_at timestamptz,
  deadline timestamptz NOT NULL,
  assigned_to text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.data_subject_requests ENABLE ROW LEVEL SECURITY;

-- Privacy impact assessments table
CREATE TABLE IF NOT EXISTS public.privacy_impact_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_name text NOT NULL,
  processing_purpose text NOT NULL,
  data_categories text[] NOT NULL,
  risk_level risk_level NOT NULL,
  mitigation_measures text[] NOT NULL,
  status assessment_status NOT NULL,
  assessor_id text,
  approved_by text,
  approved_at timestamptz,
  next_review timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.privacy_impact_assessments ENABLE ROW LEVEL SECURITY;

-- Data breaches table
CREATE TABLE IF NOT EXISTS public.data_breaches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_title text NOT NULL,
  description text NOT NULL,
  severity breach_severity NOT NULL,
  affected_records integer,
  data_categories text[] NOT NULL,
  discovery_date timestamptz NOT NULL,
  notification_date timestamptz,
  authority_notified boolean DEFAULT false,
  subjects_notified boolean DEFAULT false,
  status breach_status NOT NULL,
  mitigation_actions text[] NOT NULL,
  lessons_learned text,
  reported_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.data_breaches ENABLE ROW LEVEL SECURITY;

-- Consent records table
CREATE TABLE IF NOT EXISTS public.consent_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  consent_type text NOT NULL,
  purpose text NOT NULL,
  granted boolean NOT NULL,
  granted_at timestamptz,
  withdrawn_at timestamptz,
  ip_address text,
  user_agent text,
  legal_basis text,
  retention_period text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;

-- STEP 3: CREATE UPDATE TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'tenants', 'empresas', 'obras', 'proveedores', 'trabajadores',
    'maquinaria', 'documentos', 'tareas', 'requisitos_plataforma',
    'mapping_templates', 'adaptadores', 'jobs_integracion', 'suscripciones',
    'mensajes', 'reportes', 'checkout_providers', 'mandatos_sepa',
    'system_configurations', 'compliance_checks', 'data_subject_requests',
    'privacy_impact_assessments', 'data_breaches', 'consent_records'
  ];
BEGIN
  FOREACH t IN ARRAY tables
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS update_%I_updated_at ON public.%I;
      CREATE TRIGGER update_%I_updated_at
        BEFORE UPDATE ON public.%I
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    ', t, t, t, t);
  END LOOP;
END $$;

-- STEP 4: CREATE RLS POLICIES
-- ============================================

-- Helper function to check if user is SuperAdmin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'SuperAdmin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get user's tenant_id
CREATE OR REPLACE FUNCTION get_user_tenant_id()
RETURNS uuid AS $$
BEGIN
  RETURN (
    SELECT tenant_id FROM public.users
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Tenants policies
CREATE POLICY "SuperAdmin can access all tenants" ON public.tenants FOR ALL TO authenticated USING (is_super_admin());
CREATE POLICY "Users can view own tenant" ON public.tenants FOR SELECT TO authenticated USING (id = get_user_tenant_id());

-- Empresas policies
CREATE POLICY "Empresas tenant access" ON public.empresas FOR ALL TO authenticated USING (is_super_admin() OR tenant_id = get_user_tenant_id());

-- Obras policies
CREATE POLICY "Obras tenant access" ON public.obras FOR ALL TO authenticated USING (is_super_admin() OR tenant_id = get_user_tenant_id());

-- Proveedores policies
CREATE POLICY "Proveedores tenant access" ON public.proveedores FOR ALL TO authenticated USING (is_super_admin() OR tenant_id = get_user_tenant_id());

-- Trabajadores policies
CREATE POLICY "Trabajadores tenant access" ON public.trabajadores FOR ALL TO authenticated USING (is_super_admin() OR tenant_id = get_user_tenant_id());

-- Maquinaria policies
CREATE POLICY "Maquinaria tenant access" ON public.maquinaria FOR ALL TO authenticated USING (is_super_admin() OR tenant_id = get_user_tenant_id());

-- Documentos policies
CREATE POLICY "Documentos tenant access" ON public.documentos FOR ALL TO authenticated USING (is_super_admin() OR tenant_id = get_user_tenant_id());

-- Tareas policies
CREATE POLICY "Tareas tenant access" ON public.tareas FOR ALL TO authenticated USING (is_super_admin() OR tenant_id = get_user_tenant_id());

-- Requisitos plataforma policies
CREATE POLICY "Requisitos tenant access" ON public.requisitos_plataforma FOR ALL TO authenticated USING (is_super_admin() OR tenant_id = get_user_tenant_id());

-- Mapping templates policies
CREATE POLICY "Mapping templates tenant access" ON public.mapping_templates FOR ALL TO authenticated USING (is_super_admin() OR tenant_id = get_user_tenant_id());

-- Adaptadores policies
CREATE POLICY "Adaptadores tenant access" ON public.adaptadores FOR ALL TO authenticated USING (is_super_admin() OR tenant_id = get_user_tenant_id());

-- Jobs integracion policies
CREATE POLICY "Jobs integracion tenant access" ON public.jobs_integracion FOR ALL TO authenticated USING (is_super_admin() OR tenant_id = get_user_tenant_id());

-- Suscripciones policies
CREATE POLICY "Suscripciones tenant access" ON public.suscripciones FOR ALL TO authenticated USING (is_super_admin() OR tenant_id = get_user_tenant_id());

-- Auditoria policies
CREATE POLICY "Auditoria tenant access" ON public.auditoria FOR SELECT TO authenticated USING (is_super_admin() OR tenant_id = get_user_tenant_id());
CREATE POLICY "Auditoria insert" ON public.auditoria FOR INSERT TO authenticated WITH CHECK (true);

-- Mensajes policies
CREATE POLICY "Mensajes tenant access" ON public.mensajes FOR ALL TO authenticated USING (is_super_admin() OR tenant_id = get_user_tenant_id());

-- Reportes policies
CREATE POLICY "Reportes tenant access" ON public.reportes FOR ALL TO authenticated USING (is_super_admin() OR tenant_id = get_user_tenant_id());

-- Token transactions policies
CREATE POLICY "Token transactions tenant access" ON public.token_transactions FOR ALL TO authenticated USING (is_super_admin() OR tenant_id = get_user_tenant_id());

-- Checkout providers policies
CREATE POLICY "Checkout providers tenant access" ON public.checkout_providers FOR ALL TO authenticated USING (is_super_admin() OR tenant_id = get_user_tenant_id());

-- Mandatos SEPA policies
CREATE POLICY "Mandatos SEPA tenant access" ON public.mandatos_sepa FOR ALL TO authenticated USING (is_super_admin() OR tenant_id = get_user_tenant_id());

-- System configurations policies
CREATE POLICY "SuperAdmin can manage system configurations" ON public.system_configurations FOR ALL TO authenticated USING (is_super_admin());

-- Compliance checks policies
CREATE POLICY "Authenticated users can read compliance checks" ON public.compliance_checks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage compliance checks" ON public.compliance_checks FOR ALL TO authenticated USING (true);

-- Data subject requests policies
CREATE POLICY "Authenticated users can read data subject requests" ON public.data_subject_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage data subject requests" ON public.data_subject_requests FOR ALL TO authenticated USING (true);

-- Privacy impact assessments policies
CREATE POLICY "Authenticated users can read privacy assessments" ON public.privacy_impact_assessments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage privacy assessments" ON public.privacy_impact_assessments FOR ALL TO authenticated USING (true);

-- Data breaches policies
CREATE POLICY "Authenticated users can read data breaches" ON public.data_breaches FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage data breaches" ON public.data_breaches FOR ALL TO authenticated USING (true);

-- Consent records policies
CREATE POLICY "Authenticated users can read consent records" ON public.consent_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage consent records" ON public.consent_records FOR ALL TO authenticated USING (true);

-- STEP 5: INSERT DEFAULT DATA
-- ============================================

-- Insert default tenant
INSERT INTO public.tenants (id, name, status)
VALUES ('10000000-0000-0000-0000-000000000001', 'ConstructIA Demo', 'active')
ON CONFLICT (id) DO NOTHING;

-- Insert default system configuration
INSERT INTO public.system_configurations (id)
VALUES (gen_random_uuid())
ON CONFLICT DO NOTHING;

-- COMPLETE
COMMENT ON SCHEMA public IS 'ConstructIA Platform - Multi-tenant Database Schema - Complete';
