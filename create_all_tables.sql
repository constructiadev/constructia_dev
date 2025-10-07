/*
  ============================================================================
  CREAR TODAS LAS TABLAS DE LA BASE DE DATOS - SCRIPT COMPLETO
  ============================================================================

  Este script crea todas las tablas necesarias para ConstructIA Platform.

  INSTRUCCIONES:
  1. Abre tu Dashboard de Supabase
  2. Ve al Editor SQL
  3. Copia y pega este script completo
  4. Haz clic en "Run" para ejecutar

  Este script es idempotente - puede ejecutarse varias veces sin problemas.
  ============================================================================
*/

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Crear tipos ENUM
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('SuperAdmin', 'ClienteAdmin', 'GestorDocumental', 'SupervisorObra', 'Proveedor', 'Lector');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE tenant_status AS ENUM ('active', 'suspended');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE documento_categoria AS ENUM ('PRL', 'APTITUD_MEDICA', 'DNI', 'ALTA_SS', 'CONTRATO', 'SEGURO_RC', 'REA', 'FORMACION_PRL', 'EVAL_RIESGOS', 'CERT_MAQUINARIA', 'PLAN_SEGURIDAD', 'OTROS');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE documento_estado AS ENUM ('borrador', 'pendiente', 'aprobado', 'rechazado');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE entidad_tipo AS ENUM ('empresa', 'trabajador', 'maquinaria', 'obra');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE plataforma_tipo AS ENUM ('nalanda', 'ctaima', 'ecoordina', 'otro');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE perfil_riesgo AS ENUM ('baja', 'media', 'alta');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE estado_compliance AS ENUM ('al_dia', 'pendiente', 'caducado');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE estado_homologacion AS ENUM ('ok', 'pendiente', 'bloqueado');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE tarea_tipo AS ENUM ('subir', 'revisar', 'aprobar', 'rechazar', 'subsanar', 'enviar');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE tarea_estado AS ENUM ('abierta', 'en_progreso', 'resuelta');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE job_estado AS ENUM ('pendiente', 'enviado', 'aceptado', 'rechazado', 'error');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE adaptador_estado AS ENUM ('ready', 'error');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE plan_tipo AS ENUM ('Starter', 'Autonomo', 'AutonomoEmpleados', 'Empresas', 'Asesorias');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE suscripcion_estado AS ENUM ('activa', 'cancelada', 'trial');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE mensaje_tipo AS ENUM ('info', 'notificacion', 'alerta', 'recordatorio', 'urgencia');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE prioridad AS ENUM ('baja', 'media', 'alta');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE mensaje_estado AS ENUM ('programado', 'enviado', 'vencido');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE reporte_tipo AS ENUM ('operativo', 'financiero');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE token_tipo AS ENUM ('compra', 'consumo');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE medio_pago AS ENUM ('stripe', 'paypal', 'bizum', 'sepa', 'tarjeta');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE queue_status AS ENUM ('queued', 'in_progress', 'uploaded', 'error');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE documento_origen AS ENUM ('usuario', 'ia', 'import');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- CREAR TABLAS
-- ============================================================================

-- Tabla tenants
CREATE TABLE IF NOT EXISTS tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  status tenant_status DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla users
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email text NOT NULL,
  name text,
  role user_role NOT NULL,
  active boolean DEFAULT true,
  password_hash text,
  last_login_ip text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id, email)
);

-- Tabla empresas
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

-- Tabla obras
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

-- Tabla proveedores
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

-- Tabla trabajadores
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

-- Tabla maquinaria
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

-- Tabla documentos
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

-- Tabla tareas
CREATE TABLE IF NOT EXISTS tareas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  tipo tarea_tipo NOT NULL,
  documento_id uuid REFERENCES documentos(id) ON DELETE CASCADE,
  obra_id uuid REFERENCES obras(id) ON DELETE CASCADE,
  asignado_role text,
  asignado_user uuid REFERENCES users(id) ON DELETE SET NULL,
  vencimiento timestamptz NOT NULL,
  estado tarea_estado DEFAULT 'abierta',
  comentarios text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla requisitos_plataforma
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

-- Tabla mapping_templates
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

-- Tabla adaptadores
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

-- Tabla jobs_integracion
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

-- Tabla suscripciones
CREATE TABLE IF NOT EXISTS suscripciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  plan plan_tipo NOT NULL,
  limites jsonb DEFAULT '{}',
  stripe_customer_id text,
  estado suscripcion_estado DEFAULT 'trial',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id)
);

-- Tabla auditoria
CREATE TABLE IF NOT EXISTS auditoria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  actor_user uuid REFERENCES users(id) ON DELETE SET NULL,
  accion text NOT NULL,
  entidad text,
  entidad_id text,
  ip text,
  detalles jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Tabla mensajes
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

-- Tabla reportes
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

-- Tabla token_transactions
CREATE TABLE IF NOT EXISTS token_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  concepto text,
  monto numeric(10,2),
  tipo token_tipo,
  medio_pago medio_pago,
  created_at timestamptz DEFAULT now()
);

-- Tabla checkout_providers
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

-- Tabla mandatos_sepa
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

-- Tabla manual_upload_queue
CREATE TABLE IF NOT EXISTS manual_upload_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  obra_id uuid NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
  documento_id uuid NOT NULL REFERENCES documentos(id) ON DELETE CASCADE,
  status queue_status DEFAULT 'queued',
  operator_user uuid REFERENCES users(id) ON DELETE SET NULL,
  nota text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- CREAR ÍNDICES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_users_tenant_email ON users(tenant_id, email);
CREATE INDEX IF NOT EXISTS idx_empresas_tenant_cif ON empresas(tenant_id, cif);
CREATE INDEX IF NOT EXISTS idx_obras_tenant_codigo ON obras(tenant_id, codigo_obra);
CREATE INDEX IF NOT EXISTS idx_proveedores_tenant_cif ON proveedores(tenant_id, cif);
CREATE INDEX IF NOT EXISTS idx_trabajadores_tenant_dni ON trabajadores(tenant_id, dni_nie);
CREATE INDEX IF NOT EXISTS idx_maquinaria_tenant_serie ON maquinaria(tenant_id, numero_serie);
CREATE INDEX IF NOT EXISTS idx_documentos_entidad ON documentos(tenant_id, entidad_tipo, entidad_id, categoria);
CREATE INDEX IF NOT EXISTS idx_documentos_hash ON documentos(tenant_id, hash_sha256);
CREATE INDEX IF NOT EXISTS idx_tareas_tenant_estado ON tareas(tenant_id, estado);
CREATE INDEX IF NOT EXISTS idx_jobs_tenant_plataforma ON jobs_integracion(tenant_id, plataforma, obra_id, estado);
CREATE INDEX IF NOT EXISTS idx_auditoria_tenant_fecha ON auditoria(tenant_id, created_at);
CREATE INDEX IF NOT EXISTS idx_mensajes_tenant_estado ON mensajes(tenant_id, estado);
CREATE INDEX IF NOT EXISTS idx_manual_queue_tenant_status ON manual_upload_queue(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_token_transactions_tenant_fecha ON token_transactions(tenant_id, created_at);

-- ============================================================================
-- CREAR FUNCIÓN updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================================================
-- CREAR TRIGGERS updated_at
-- ============================================================================

DROP TRIGGER IF EXISTS update_tenants_updated_at ON tenants;
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_empresas_updated_at ON empresas;
CREATE TRIGGER update_empresas_updated_at BEFORE UPDATE ON empresas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_obras_updated_at ON obras;
CREATE TRIGGER update_obras_updated_at BEFORE UPDATE ON obras FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_proveedores_updated_at ON proveedores;
CREATE TRIGGER update_proveedores_updated_at BEFORE UPDATE ON proveedores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_trabajadores_updated_at ON trabajadores;
CREATE TRIGGER update_trabajadores_updated_at BEFORE UPDATE ON trabajadores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_maquinaria_updated_at ON maquinaria;
CREATE TRIGGER update_maquinaria_updated_at BEFORE UPDATE ON maquinaria FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_documentos_updated_at ON documentos;
CREATE TRIGGER update_documentos_updated_at BEFORE UPDATE ON documentos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tareas_updated_at ON tareas;
CREATE TRIGGER update_tareas_updated_at BEFORE UPDATE ON tareas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_requisitos_plataforma_updated_at ON requisitos_plataforma;
CREATE TRIGGER update_requisitos_plataforma_updated_at BEFORE UPDATE ON requisitos_plataforma FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_mapping_templates_updated_at ON mapping_templates;
CREATE TRIGGER update_mapping_templates_updated_at BEFORE UPDATE ON mapping_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_adaptadores_updated_at ON adaptadores;
CREATE TRIGGER update_adaptadores_updated_at BEFORE UPDATE ON adaptadores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_jobs_integracion_updated_at ON jobs_integracion;
CREATE TRIGGER update_jobs_integracion_updated_at BEFORE UPDATE ON jobs_integracion FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_suscripciones_updated_at ON suscripciones;
CREATE TRIGGER update_suscripciones_updated_at BEFORE UPDATE ON suscripciones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_mensajes_updated_at ON mensajes;
CREATE TRIGGER update_mensajes_updated_at BEFORE UPDATE ON mensajes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_checkout_providers_updated_at ON checkout_providers;
CREATE TRIGGER update_checkout_providers_updated_at BEFORE UPDATE ON checkout_providers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_mandatos_sepa_updated_at ON mandatos_sepa;
CREATE TRIGGER update_mandatos_sepa_updated_at BEFORE UPDATE ON mandatos_sepa FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_manual_upload_queue_updated_at ON manual_upload_queue;
CREATE TRIGGER update_manual_upload_queue_updated_at BEFORE UPDATE ON manual_upload_queue FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- HABILITAR RLS (Row Level Security)
-- ============================================================================

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE obras ENABLE ROW LEVEL SECURITY;
ALTER TABLE proveedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE trabajadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE maquinaria ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tareas ENABLE ROW LEVEL SECURITY;
ALTER TABLE requisitos_plataforma ENABLE ROW LEVEL SECURITY;
ALTER TABLE mapping_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE adaptadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs_integracion ENABLE ROW LEVEL SECURITY;
ALTER TABLE suscripciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE auditoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensajes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reportes ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkout_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE mandatos_sepa ENABLE ROW LEVEL SECURITY;
ALTER TABLE manual_upload_queue ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CREAR POLÍTICAS RLS
-- ============================================================================

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "SuperAdmin can access all tenants" ON tenants;
DROP POLICY IF EXISTS "Users can access own tenant data" ON users;
DROP POLICY IF EXISTS "Empresas tenant access" ON empresas;
DROP POLICY IF EXISTS "Obras tenant access" ON obras;
DROP POLICY IF EXISTS "Proveedores tenant access" ON proveedores;
DROP POLICY IF EXISTS "Trabajadores tenant access" ON trabajadores;
DROP POLICY IF EXISTS "Maquinaria tenant access" ON maquinaria;
DROP POLICY IF EXISTS "Documentos tenant access" ON documentos;
DROP POLICY IF EXISTS "Tareas tenant access" ON tareas;
DROP POLICY IF EXISTS "Requisitos plataforma tenant access" ON requisitos_plataforma;
DROP POLICY IF EXISTS "Mapping templates tenant access" ON mapping_templates;
DROP POLICY IF EXISTS "Adaptadores tenant access" ON adaptadores;
DROP POLICY IF EXISTS "Jobs integracion tenant access" ON jobs_integracion;
DROP POLICY IF EXISTS "Suscripciones tenant access" ON suscripciones;
DROP POLICY IF EXISTS "Auditoria tenant access" ON auditoria;
DROP POLICY IF EXISTS "Mensajes tenant access" ON mensajes;
DROP POLICY IF EXISTS "Reportes tenant access" ON reportes;
DROP POLICY IF EXISTS "Token transactions tenant access" ON token_transactions;
DROP POLICY IF EXISTS "Checkout providers tenant access" ON checkout_providers;
DROP POLICY IF EXISTS "Mandatos SEPA tenant access" ON mandatos_sepa;
DROP POLICY IF EXISTS "Manual upload queue tenant access" ON manual_upload_queue;

-- Crear políticas
CREATE POLICY "SuperAdmin can access all tenants" ON tenants FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'SuperAdmin')
);

CREATE POLICY "Users can access own tenant data" ON users FOR ALL TO authenticated USING (
  tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
);

CREATE POLICY "Empresas tenant access" ON empresas FOR ALL TO authenticated USING (
  tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
);

CREATE POLICY "Obras tenant access" ON obras FOR ALL TO authenticated USING (
  tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
);

CREATE POLICY "Proveedores tenant access" ON proveedores FOR ALL TO authenticated USING (
  tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
);

CREATE POLICY "Trabajadores tenant access" ON trabajadores FOR ALL TO authenticated USING (
  tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
);

CREATE POLICY "Maquinaria tenant access" ON maquinaria FOR ALL TO authenticated USING (
  tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
);

CREATE POLICY "Documentos tenant access" ON documentos FOR ALL TO authenticated USING (
  tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
);

CREATE POLICY "Tareas tenant access" ON tareas FOR ALL TO authenticated USING (
  tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
);

CREATE POLICY "Requisitos plataforma tenant access" ON requisitos_plataforma FOR ALL TO authenticated USING (
  tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
);

CREATE POLICY "Mapping templates tenant access" ON mapping_templates FOR ALL TO authenticated USING (
  tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
);

CREATE POLICY "Adaptadores tenant access" ON adaptadores FOR ALL TO authenticated USING (
  tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
);

CREATE POLICY "Jobs integracion tenant access" ON jobs_integracion FOR ALL TO authenticated USING (
  tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
);

CREATE POLICY "Suscripciones tenant access" ON suscripciones FOR ALL TO authenticated USING (
  tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
);

CREATE POLICY "Auditoria tenant access" ON auditoria FOR ALL TO authenticated USING (
  tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
);

CREATE POLICY "Mensajes tenant access" ON mensajes FOR ALL TO authenticated USING (
  tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
);

CREATE POLICY "Reportes tenant access" ON reportes FOR ALL TO authenticated USING (
  tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
);

CREATE POLICY "Token transactions tenant access" ON token_transactions FOR ALL TO authenticated USING (
  tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
);

CREATE POLICY "Checkout providers tenant access" ON checkout_providers FOR ALL TO authenticated USING (
  tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
);

CREATE POLICY "Mandatos SEPA tenant access" ON mandatos_sepa FOR ALL TO authenticated USING (
  tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
);

CREATE POLICY "Manual upload queue tenant access" ON manual_upload_queue FOR ALL TO authenticated USING (
  tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
);

-- ============================================================================
-- SCRIPT COMPLETADO
-- ============================================================================
-- Todas las tablas han sido creadas exitosamente.
-- Ejecuta este query para verificar: SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
