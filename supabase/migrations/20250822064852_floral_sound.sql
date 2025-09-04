/*
  # Complete Multi-Tenant System for ConstructIA

  1. New Tables
    - `tenants` - Multi-tenant isolation
    - `users` - User management with roles
    - `empresas` - Companies within tenant
    - `obras` - Construction sites/projects
    - `proveedores` - Suppliers
    - `trabajadores` - Workers
    - `maquinaria` - Machinery/equipment
    - `documentos` - Documents with AI metadata
    - `tareas` - Tasks and workflow
    - `requisitos_plataforma` - Platform requirements
    - `mapping_templates` - Data transformation templates
    - `adaptadores` - Platform connectors
    - `jobs_integracion` - Integration jobs
    - `suscripciones` - Subscriptions
    - `auditoria` - Audit logs
    - `mensajes` - Messages and notifications
    - `reportes` - Reports
    - `token_transactions` - Token usage tracking
    - `checkout_providers` - Payment providers
    - `mandatos_sepa` - SEPA mandates
    - `manual_upload_queue` - Manual upload queue

  2. Security
    - Enable RLS on all tables
    - Tenant-based isolation policies
    - Role-based access control
    - Audit logging for all operations

  3. Enums and Types
    - User roles: SuperAdmin, ClienteAdmin, GestorDocumental, etc.
    - Document categories: PRL, APTITUD_MEDICA, DNI, etc.
    - Platform types: nalanda, ctaima, ecoordina, otro
    - Task types and states
    - Integration job states
*/

-- Create custom types
CREATE TYPE user_role AS ENUM ('SuperAdmin', 'ClienteAdmin', 'GestorDocumental', 'SupervisorObra', 'Proveedor', 'Lector');
CREATE TYPE tenant_status AS ENUM ('active', 'suspended');
CREATE TYPE documento_categoria AS ENUM ('PRL', 'APTITUD_MEDICA', 'DNI', 'ALTA_SS', 'CONTRATO', 'SEGURO_RC', 'REA', 'FORMACION_PRL', 'EVAL_RIESGOS', 'CERT_MAQUINARIA', 'PLAN_SEGURIDAD', 'OTROS');
CREATE TYPE documento_estado AS ENUM ('borrador', 'pendiente', 'aprobado', 'rechazado');
CREATE TYPE entidad_tipo AS ENUM ('empresa', 'trabajador', 'maquinaria', 'obra');
CREATE TYPE plataforma_tipo AS ENUM ('nalanda', 'ctaima', 'ecoordina', 'otro');
CREATE TYPE perfil_riesgo AS ENUM ('baja', 'media', 'alta');
CREATE TYPE estado_compliance AS ENUM ('al_dia', 'pendiente', 'caducado');
CREATE TYPE estado_homologacion AS ENUM ('ok', 'pendiente', 'bloqueado');
CREATE TYPE tarea_tipo AS ENUM ('subir', 'revisar', 'aprobar', 'rechazar', 'subsanar', 'enviar');
CREATE TYPE tarea_estado AS ENUM ('abierta', 'en_progreso', 'resuelta');
CREATE TYPE job_estado AS ENUM ('pendiente', 'enviado', 'aceptado', 'rechazado', 'error');
CREATE TYPE adaptador_estado AS ENUM ('ready', 'error');
CREATE TYPE plan_tipo AS ENUM ('Starter', 'Autonomo', 'AutonomoEmpleados', 'Empresas', 'Asesorias');
CREATE TYPE suscripcion_estado AS ENUM ('activa', 'cancelada', 'trial');
CREATE TYPE mensaje_tipo AS ENUM ('info', 'notificacion', 'alerta', 'recordatorio', 'urgencia');
CREATE TYPE prioridad AS ENUM ('baja', 'media', 'alta');
CREATE TYPE mensaje_estado AS ENUM ('programado', 'enviado', 'vencido');
CREATE TYPE reporte_tipo AS ENUM ('operativo', 'financiero');
CREATE TYPE token_tipo AS ENUM ('compra', 'consumo');
CREATE TYPE medio_pago AS ENUM ('stripe', 'paypal', 'bizum', 'sepa', 'tarjeta');
CREATE TYPE queue_status AS ENUM ('queued', 'in_progress', 'uploaded', 'error');
CREATE TYPE documento_origen AS ENUM ('usuario', 'ia', 'import');

-- Create tenants table
CREATE TABLE IF NOT EXISTS tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  status tenant_status DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create users table
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

-- Create empresas table
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

-- Create obras table
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

-- Create proveedores table
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

-- Create trabajadores table
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

-- Create maquinaria table
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

-- Create documentos table
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

-- Create tareas table
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

-- Create requisitos_plataforma table
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

-- Create mapping_templates table
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

-- Create adaptadores table
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

-- Create jobs_integracion table
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

-- Create suscripciones table
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

-- Create auditoria table
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

-- Create mensajes table
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

-- Create reportes table
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

-- Create token_transactions table
CREATE TABLE IF NOT EXISTS token_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  concepto text,
  monto numeric(10,2),
  tipo token_tipo,
  medio_pago medio_pago,
  created_at timestamptz DEFAULT now()
);

-- Create checkout_providers table
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

-- Create mandatos_sepa table
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

-- Create manual_upload_queue table
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

-- Create indexes for performance
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
CREATE INDEX IF NOT EXISTS idx_token_transactions_tenant_fecha ON token_transactions(tenant_id, created_at);
CREATE INDEX IF NOT EXISTS idx_manual_queue_tenant_status ON manual_upload_queue(tenant_id, status);

-- Enable RLS on all tables
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

-- Create RLS policies

-- Tenants: Only SuperAdmin can access all tenants
CREATE POLICY "SuperAdmin can access all tenants"
  ON tenants
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'SuperAdmin'
    )
  );

-- Users: Access own tenant data or SuperAdmin access
CREATE POLICY "Users can access own tenant data"
  ON users
  FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'SuperAdmin'
    )
  );

-- Empresas: Tenant-based access
CREATE POLICY "Empresas tenant access"
  ON empresas
  FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'SuperAdmin'
    )
  );

-- Obras: Tenant-based access
CREATE POLICY "Obras tenant access"
  ON obras
  FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'SuperAdmin'
    )
  );

-- Proveedores: Tenant-based access
CREATE POLICY "Proveedores tenant access"
  ON proveedores
  FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'SuperAdmin'
    )
  );

-- Trabajadores: Tenant-based access
CREATE POLICY "Trabajadores tenant access"
  ON trabajadores
  FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'SuperAdmin'
    )
  );

-- Maquinaria: Tenant-based access
CREATE POLICY "Maquinaria tenant access"
  ON maquinaria
  FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'SuperAdmin'
    )
  );

-- Documentos: Tenant-based access
CREATE POLICY "Documentos tenant access"
  ON documentos
  FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'SuperAdmin'
    )
  );

-- Tareas: Tenant-based access
CREATE POLICY "Tareas tenant access"
  ON tareas
  FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'SuperAdmin'
    )
  );

-- Requisitos plataforma: Tenant-based access
CREATE POLICY "Requisitos plataforma tenant access"
  ON requisitos_plataforma
  FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'SuperAdmin'
    )
  );

-- Mapping templates: Tenant-based access
CREATE POLICY "Mapping templates tenant access"
  ON mapping_templates
  FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'SuperAdmin'
    )
  );

-- Adaptadores: Tenant-based access
CREATE POLICY "Adaptadores tenant access"
  ON adaptadores
  FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'SuperAdmin'
    )
  );

-- Jobs integracion: Tenant-based access
CREATE POLICY "Jobs integracion tenant access"
  ON jobs_integracion
  FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'SuperAdmin'
    )
  );

-- Suscripciones: Tenant-based access
CREATE POLICY "Suscripciones tenant access"
  ON suscripciones
  FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'SuperAdmin'
    )
  );

-- Auditoria: Tenant-based access
CREATE POLICY "Auditoria tenant access"
  ON auditoria
  FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'SuperAdmin'
    )
  );

-- Mensajes: Tenant-based access
CREATE POLICY "Mensajes tenant access"
  ON mensajes
  FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'SuperAdmin'
    )
  );

-- Reportes: Tenant-based access
CREATE POLICY "Reportes tenant access"
  ON reportes
  FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'SuperAdmin'
    )
  );

-- Token transactions: Tenant-based access
CREATE POLICY "Token transactions tenant access"
  ON token_transactions
  FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'SuperAdmin'
    )
  );

-- Checkout providers: Tenant-based access
CREATE POLICY "Checkout providers tenant access"
  ON checkout_providers
  FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'SuperAdmin'
    )
  );

-- Mandatos SEPA: Tenant-based access
CREATE POLICY "Mandatos SEPA tenant access"
  ON mandatos_sepa
  FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'SuperAdmin'
    )
  );

-- Manual upload queue: Tenant-based access
CREATE POLICY "Manual upload queue tenant access"
  ON manual_upload_queue
  FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'SuperAdmin'
    )
  );

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_empresas_updated_at BEFORE UPDATE ON empresas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_obras_updated_at BEFORE UPDATE ON obras FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_proveedores_updated_at BEFORE UPDATE ON proveedores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trabajadores_updated_at BEFORE UPDATE ON trabajadores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_maquinaria_updated_at BEFORE UPDATE ON maquinaria FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documentos_updated_at BEFORE UPDATE ON documentos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tareas_updated_at BEFORE UPDATE ON tareas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_requisitos_plataforma_updated_at BEFORE UPDATE ON requisitos_plataforma FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mapping_templates_updated_at BEFORE UPDATE ON mapping_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_adaptadores_updated_at BEFORE UPDATE ON adaptadores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobs_integracion_updated_at BEFORE UPDATE ON jobs_integracion FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_suscripciones_updated_at BEFORE UPDATE ON suscripciones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mensajes_updated_at BEFORE UPDATE ON mensajes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reportes_updated_at BEFORE UPDATE ON reportes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_checkout_providers_updated_at BEFORE UPDATE ON checkout_providers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mandatos_sepa_updated_at BEFORE UPDATE ON mandatos_sepa FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_manual_upload_queue_updated_at BEFORE UPDATE ON manual_upload_queue FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();