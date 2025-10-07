-- ============================================
-- CONSTRUCTIA PLATFORM - BOLT DATABASE MIGRATION
-- Optimized for Bolt Native Database Manager
-- ============================================
--
-- Este script está optimizado para Bolt Database y puede tener
-- diferencias con el schema original de Supabase/PostgreSQL.
--
-- INSTRUCCIONES:
-- 1. Abre el Database Manager en Bolt (ícono en la barra superior)
-- 2. Copia TODO este archivo
-- 3. Pega en el SQL Editor de Bolt
-- 4. Haz clic en "Run" y espera 30-60 segundos
--
-- Si hay errores, ejecuta sección por sección.
-- ============================================

-- ============================================
-- SECCIÓN 1: CREAR TIPOS ENUM
-- ============================================

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('SuperAdmin', 'Cliente', 'ClienteDemo');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE tenant_status AS ENUM ('active', 'suspended');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE documento_categoria AS ENUM (
    'PRL', 'APTITUD_MEDICA', 'DNI', 'ALTA_SS', 'CONTRATO',
    'SEGURO_RC', 'REA', 'FORMACION_PRL', 'EVAL_RIESGOS',
    'CERT_MAQUINARIA', 'PLAN_SEGURIDAD', 'OTROS'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE documento_estado AS ENUM ('borrador', 'pendiente', 'aprobado', 'rechazado');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE entidad_tipo AS ENUM ('empresa', 'trabajador', 'maquinaria', 'obra');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE plataforma_tipo AS ENUM ('nalanda', 'ctaima', 'ecoordina', 'otro');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE perfil_riesgo AS ENUM ('baja', 'media', 'alta');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE estado_compliance AS ENUM ('al_dia', 'pendiente', 'caducado');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE estado_homologacion AS ENUM ('ok', 'pendiente', 'bloqueado');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE tarea_tipo AS ENUM ('subir', 'revisar', 'aprobar', 'rechazar', 'subsanar', 'enviar');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE tarea_estado AS ENUM ('abierta', 'en_progreso', 'resuelta');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE job_estado AS ENUM ('pendiente', 'enviado', 'aceptado', 'rechazado', 'error');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE adaptador_estado AS ENUM ('ready', 'error');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE plan_tipo AS ENUM ('Starter', 'Autonomo', 'AutonomoEmpleados', 'Empresas', 'Asesorias');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE suscripcion_estado AS ENUM ('activa', 'cancelada', 'trial');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE mensaje_tipo AS ENUM ('info', 'notificacion', 'alerta', 'recordatorio', 'urgencia');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE prioridad AS ENUM ('baja', 'media', 'alta');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE mensaje_estado AS ENUM ('programado', 'enviado', 'vencido');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE reporte_tipo AS ENUM ('operativo', 'financiero');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE token_tipo AS ENUM ('compra', 'consumo');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE medio_pago AS ENUM ('stripe', 'paypal', 'bizum', 'sepa', 'tarjeta');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE queue_status AS ENUM ('queued', 'in_progress', 'uploaded', 'error');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE documento_origen AS ENUM ('usuario', 'ia', 'import');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE compliance_status AS ENUM ('compliant', 'warning', 'non_compliant');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE request_type AS ENUM ('access', 'rectification', 'erasure', 'portability', 'objection');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE request_status AS ENUM ('pending', 'in_progress', 'completed', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE risk_level AS ENUM ('low', 'medium', 'high', 'very_high');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE assessment_status AS ENUM ('draft', 'under_review', 'approved', 'requires_action');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE breach_severity AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE breach_status AS ENUM ('investigating', 'contained', 'resolved');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- SECCIÓN 2: CREAR TABLAS CORE
-- ============================================

-- Tabla: tenants (inquilinos/clientes del sistema)
CREATE TABLE IF NOT EXISTS tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  status tenant_status DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla: empresas (compañías de construcción)
CREATE TABLE IF NOT EXISTS empresas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
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

-- Tabla: obras (proyectos de construcción)
CREATE TABLE IF NOT EXISTS obras (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
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

-- Tabla: proveedores (subcontratistas)
CREATE TABLE IF NOT EXISTS proveedores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  razon_social text NOT NULL,
  cif text NOT NULL,
  rea_numero text,
  contacto_email text,
  estado_homologacion estado_homologacion DEFAULT 'pendiente',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id, cif)
);

-- Tabla: trabajadores (empleados)
CREATE TABLE IF NOT EXISTS trabajadores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  proveedor_id uuid NOT NULL REFERENCES proveedores(id) ON DELETE CASCADE,
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

-- Tabla: maquinaria (equipos y maquinaria)
CREATE TABLE IF NOT EXISTS maquinaria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
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

-- Tabla: documentos (gestión documental)
CREATE TABLE IF NOT EXISTS documentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
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

-- Tabla: tareas (gestión de tareas)
CREATE TABLE IF NOT EXISTS tareas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  tipo tarea_tipo NOT NULL,
  documento_id uuid REFERENCES documentos(id) ON DELETE CASCADE,
  obra_id uuid REFERENCES obras(id) ON DELETE CASCADE,
  asignado_role text,
  asignado_user uuid,
  vencimiento timestamptz NOT NULL,
  estado tarea_estado DEFAULT 'abierta',
  comentarios text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla: requisitos_plataforma (requisitos por plataforma)
CREATE TABLE IF NOT EXISTS requisitos_plataforma (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
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

-- Tabla: mapping_templates (plantillas de mapeo)
CREATE TABLE IF NOT EXISTS mapping_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  plataforma plataforma_tipo NOT NULL,
  version integer DEFAULT 1,
  schema_destino jsonb NOT NULL,
  rules jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id, plataforma, version)
);

-- Tabla: adaptadores (conectores de plataformas)
CREATE TABLE IF NOT EXISTS adaptadores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  plataforma plataforma_tipo NOT NULL,
  alias text,
  credenciales jsonb NOT NULL,
  estado adaptador_estado DEFAULT 'ready',
  ultimo_envio timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id, plataforma, alias)
);

-- Tabla: jobs_integracion (trabajos de integración)
CREATE TABLE IF NOT EXISTS jobs_integracion (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  plataforma plataforma_tipo NOT NULL,
  obra_id uuid NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
  payload jsonb,
  estado job_estado DEFAULT 'pendiente',
  intentos integer DEFAULT 0,
  respuesta jsonb,
  trace_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla: suscripciones (planes de suscripción)
CREATE TABLE IF NOT EXISTS suscripciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE UNIQUE,
  plan plan_tipo NOT NULL,
  limites jsonb DEFAULT '{}',
  stripe_customer_id text,
  estado suscripcion_estado DEFAULT 'trial',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla: auditoria (logs de auditoría)
CREATE TABLE IF NOT EXISTS auditoria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  actor_user uuid,
  accion text NOT NULL,
  entidad text,
  entidad_id text,
  ip text,
  detalles jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Tabla: mensajes (sistema de mensajería)
CREATE TABLE IF NOT EXISTS mensajes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
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

-- Tabla: reportes (informes generados)
CREATE TABLE IF NOT EXISTS reportes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  mes text NOT NULL,
  tipo reporte_tipo NOT NULL,
  kpis jsonb DEFAULT '{}',
  pdf_file text,
  enviado_a jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id, mes, tipo)
);

-- Tabla: token_transactions (transacciones de tokens)
CREATE TABLE IF NOT EXISTS token_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  concepto text,
  monto numeric(10,2),
  tipo token_tipo,
  medio_pago medio_pago,
  created_at timestamptz DEFAULT now()
);

-- Tabla: checkout_providers (proveedores de pago)
CREATE TABLE IF NOT EXISTS checkout_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  proveedor medio_pago NOT NULL,
  logo_base64 text,
  comision_pct numeric(5,2),
  config jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id, proveedor)
);

-- Tabla: mandatos_sepa (mandatos SEPA)
CREATE TABLE IF NOT EXISTS mandatos_sepa (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  cliente_email text NOT NULL,
  iban text NOT NULL,
  firma_base64 text,
  pdf_firmado text,
  firmado_en timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla: system_configurations (configuración del sistema)
CREATE TABLE IF NOT EXISTS system_configurations (
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

-- Tabla: compliance_checks (verificaciones de cumplimiento)
CREATE TABLE IF NOT EXISTS compliance_checks (
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

-- Tabla: data_subject_requests (solicitudes de datos personales)
CREATE TABLE IF NOT EXISTS data_subject_requests (
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

-- Tabla: privacy_impact_assessments (evaluaciones de impacto de privacidad)
CREATE TABLE IF NOT EXISTS privacy_impact_assessments (
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

-- Tabla: data_breaches (brechas de seguridad)
CREATE TABLE IF NOT EXISTS data_breaches (
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

-- Tabla: consent_records (registros de consentimiento)
CREATE TABLE IF NOT EXISTS consent_records (
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

-- ============================================
-- SECCIÓN 3: CREAR ÍNDICES PARA RENDIMIENTO
-- ============================================

-- Índices para empresas
CREATE INDEX IF NOT EXISTS idx_empresas_tenant_cif ON empresas(tenant_id, cif);
CREATE INDEX IF NOT EXISTS idx_empresas_tenant ON empresas(tenant_id);

-- Índices para obras
CREATE INDEX IF NOT EXISTS idx_obras_tenant_codigo ON obras(tenant_id, codigo_obra);
CREATE INDEX IF NOT EXISTS idx_obras_empresa ON obras(empresa_id);

-- Índices para proveedores
CREATE INDEX IF NOT EXISTS idx_proveedores_tenant_cif ON proveedores(tenant_id, cif);
CREATE INDEX IF NOT EXISTS idx_proveedores_empresa ON proveedores(empresa_id);

-- Índices para trabajadores
CREATE INDEX IF NOT EXISTS idx_trabajadores_tenant_dni ON trabajadores(tenant_id, dni_nie);
CREATE INDEX IF NOT EXISTS idx_trabajadores_proveedor ON trabajadores(proveedor_id);

-- Índices para maquinaria
CREATE INDEX IF NOT EXISTS idx_maquinaria_tenant_serie ON maquinaria(tenant_id, numero_serie);
CREATE INDEX IF NOT EXISTS idx_maquinaria_empresa ON maquinaria(empresa_id);

-- Índices para documentos
CREATE INDEX IF NOT EXISTS idx_documentos_entidad ON documentos(tenant_id, entidad_tipo, entidad_id, categoria);
CREATE INDEX IF NOT EXISTS idx_documentos_hash ON documentos(tenant_id, hash_sha256);
CREATE INDEX IF NOT EXISTS idx_documentos_tenant ON documentos(tenant_id);

-- Índices para tareas
CREATE INDEX IF NOT EXISTS idx_tareas_tenant_estado ON tareas(tenant_id, estado);
CREATE INDEX IF NOT EXISTS idx_tareas_documento ON tareas(documento_id);
CREATE INDEX IF NOT EXISTS idx_tareas_obra ON tareas(obra_id);

-- Índices para jobs_integracion
CREATE INDEX IF NOT EXISTS idx_jobs_tenant_plataforma ON jobs_integracion(tenant_id, plataforma, obra_id, estado);

-- Índices para auditoria
CREATE INDEX IF NOT EXISTS idx_auditoria_tenant_fecha ON auditoria(tenant_id, created_at);

-- Índices para mensajes
CREATE INDEX IF NOT EXISTS idx_mensajes_tenant_estado ON mensajes(tenant_id, estado);

-- Índices para token_transactions
CREATE INDEX IF NOT EXISTS idx_token_transactions_tenant_fecha ON token_transactions(tenant_id, created_at);

-- ============================================
-- SECCIÓN 4: CREAR TRIGGERS PARA TIMESTAMPS
-- ============================================

-- Función para actualizar timestamp automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a todas las tablas relevantes
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
      DROP TRIGGER IF EXISTS update_%I_updated_at ON %I;
      CREATE TRIGGER update_%I_updated_at
        BEFORE UPDATE ON %I
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    ', t, t, t, t);
  END LOOP;
END $$;

-- ============================================
-- SECCIÓN 5: INSERTAR DATOS INICIALES
-- ============================================

-- Insertar tenant demo
INSERT INTO tenants (id, name, status)
VALUES ('10000000-0000-0000-0000-000000000001', 'ConstructIA Demo', 'active')
ON CONFLICT (id) DO NOTHING;

-- Insertar configuración del sistema por defecto
INSERT INTO system_configurations (id)
VALUES (gen_random_uuid())
ON CONFLICT DO NOTHING;

-- ============================================
-- SECCIÓN 6: VERIFICACIÓN DEL SCHEMA
-- ============================================

-- Verificar que se crearon todas las tablas
DO $$
DECLARE
  table_count integer;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE';

  RAISE NOTICE '========================================';
  RAISE NOTICE 'BOLT DATABASE MIGRATION COMPLETADA';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total de tablas creadas: %', table_count;
  RAISE NOTICE 'Tenant demo ID: 10000000-0000-0000-0000-000000000001';
  RAISE NOTICE '========================================';
END $$;

-- Comentario final
COMMENT ON SCHEMA public IS 'ConstructIA Platform - Bolt Database - Multi-tenant Architecture';

-- ============================================
-- FIN DE LA MIGRACIÓN
-- ============================================
--
-- PRÓXIMOS PASOS:
-- 1. Verifica que no haya errores arriba
-- 2. Ve al Table View para ver las tablas creadas
-- 3. Ejecuta consultas de verificación (ver INSTRUCCIONES-BOLT-DATABASE.md)
-- 4. Actualiza las credenciales en tu aplicación
-- 5. Reinicia el servidor de desarrollo
--
-- ¡MIGRACIÓN COMPLETADA! 🎉
-- ============================================
