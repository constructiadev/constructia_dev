/*
  # Sincronización Completa del Esquema de Base de Datos

  1. Nuevas Tablas
    - `kpis` - Métricas y KPIs del sistema
    - `payment_gateways` - Configuración de pasarelas de pago
    - `processing_queue` - Cola de procesamiento de documentos
    - `backups` - Registro de backups del sistema
    - `token_packages` - Paquetes de tokens disponibles
    - `storage_packages` - Paquetes de almacenamiento adicional
    - `subscription_plans` - Planes de suscripción disponibles
    - `fiscal_events` - Eventos fiscales y recordatorios
    - `api_endpoints` - Endpoints de API monitoreados
    - `api_integrations` - Integraciones con APIs externas

  2. Columnas Añadidas a Tablas Existentes
    - `clients`: last_activity, monthly_revenue
    - `audit_logs`: user_role, user_email, client_name, status
    - `companies`: projects_count, documents_count, status, obralia_configured
    - `projects`: company_name, documents_count, team_members
    - `documents`: project_name, company_name, processed_at
    - `receipts`: client_name, client_email, client_address, client_tax_id, gross_amount, commission

  3. Seguridad
    - Políticas RLS para todas las nuevas tablas
    - Constraints y validaciones apropiadas
    - Triggers para updated_at automático
*/

-- =====================================================
-- MODIFICACIONES A TABLAS EXISTENTES
-- =====================================================

-- Tabla: clients - Añadir columnas para actividad y ingresos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'last_activity'
  ) THEN
    ALTER TABLE clients ADD COLUMN last_activity timestamp with time zone;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'monthly_revenue'
  ) THEN
    ALTER TABLE clients ADD COLUMN monthly_revenue numeric(10,2);
  END IF;
END $$;

-- Tabla: audit_logs - Añadir columnas para mejor tracking
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_logs' AND column_name = 'user_role'
  ) THEN
    ALTER TABLE audit_logs ADD COLUMN user_role text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_logs' AND column_name = 'user_email'
  ) THEN
    ALTER TABLE audit_logs ADD COLUMN user_email text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_logs' AND column_name = 'client_name'
  ) THEN
    ALTER TABLE audit_logs ADD COLUMN client_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_logs' AND column_name = 'status'
  ) THEN
    ALTER TABLE audit_logs ADD COLUMN status text;
  END IF;
END $$;

-- Añadir constraints para audit_logs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'audit_logs_status_check'
  ) THEN
    ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_status_check 
    CHECK (status IN ('success', 'warning', 'error'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'audit_logs_user_role_check'
  ) THEN
    ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_user_role_check 
    CHECK (user_role IN ('admin', 'client', 'system'));
  END IF;
END $$;

-- Tabla: companies - Añadir columnas para estadísticas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'projects_count'
  ) THEN
    ALTER TABLE companies ADD COLUMN projects_count integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'documents_count'
  ) THEN
    ALTER TABLE companies ADD COLUMN documents_count integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'status'
  ) THEN
    ALTER TABLE companies ADD COLUMN status text DEFAULT 'active';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'obralia_configured'
  ) THEN
    ALTER TABLE companies ADD COLUMN obralia_configured boolean DEFAULT false;
  END IF;
END $$;

-- Añadir constraint para companies status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'companies_status_check'
  ) THEN
    ALTER TABLE companies ADD CONSTRAINT companies_status_check 
    CHECK (status IN ('active', 'inactive'));
  END IF;
END $$;

-- Tabla: projects - Añadir columnas denormalizadas para UI
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'company_name'
  ) THEN
    ALTER TABLE projects ADD COLUMN company_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'documents_count'
  ) THEN
    ALTER TABLE projects ADD COLUMN documents_count integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'team_members'
  ) THEN
    ALTER TABLE projects ADD COLUMN team_members integer DEFAULT 0;
  END IF;
END $$;

-- Tabla: documents - Añadir columnas denormalizadas para UI
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'documents' AND column_name = 'project_name'
  ) THEN
    ALTER TABLE documents ADD COLUMN project_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'documents' AND column_name = 'company_name'
  ) THEN
    ALTER TABLE documents ADD COLUMN company_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'documents' AND column_name = 'processed_at'
  ) THEN
    ALTER TABLE documents ADD COLUMN processed_at timestamp with time zone;
  END IF;
END $$;

-- Tabla: receipts - Añadir columnas denormalizadas para recibos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'receipts' AND column_name = 'client_name'
  ) THEN
    ALTER TABLE receipts ADD COLUMN client_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'receipts' AND column_name = 'client_email'
  ) THEN
    ALTER TABLE receipts ADD COLUMN client_email text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'receipts' AND column_name = 'client_address'
  ) THEN
    ALTER TABLE receipts ADD COLUMN client_address text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'receipts' AND column_name = 'client_tax_id'
  ) THEN
    ALTER TABLE receipts ADD COLUMN client_tax_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'receipts' AND column_name = 'gross_amount'
  ) THEN
    ALTER TABLE receipts ADD COLUMN gross_amount numeric(10,2);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'receipts' AND column_name = 'commission'
  ) THEN
    ALTER TABLE receipts ADD COLUMN commission numeric(10,2);
  END IF;
END $$;

-- =====================================================
-- CREACIÓN DE NUEVAS TABLAS
-- =====================================================

-- Tabla: kpis
CREATE TABLE IF NOT EXISTS kpis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  value text NOT NULL,
  change numeric DEFAULT 0,
  trend text DEFAULT 'stable',
  period text DEFAULT 'monthly',
  category text,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Constraints para kpis
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'kpis_trend_check'
  ) THEN
    ALTER TABLE kpis ADD CONSTRAINT kpis_trend_check 
    CHECK (trend IN ('up', 'down', 'stable'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'kpis_period_check'
  ) THEN
    ALTER TABLE kpis ADD CONSTRAINT kpis_period_check 
    CHECK (period IN ('daily', 'weekly', 'monthly', 'yearly'));
  END IF;
END $$;

-- RLS para kpis
ALTER TABLE kpis ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Enable read access for authenticated users" ON kpis
FOR SELECT TO authenticated USING (true);

CREATE POLICY IF NOT EXISTS "Admins can manage KPIs" ON kpis
FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
) WITH CHECK (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

-- Trigger para kpis
CREATE TRIGGER IF NOT EXISTS update_kpis_updated_at 
BEFORE UPDATE ON kpis
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Tabla: payment_gateways
CREATE TABLE IF NOT EXISTS payment_gateways (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  status text DEFAULT 'active',
  commission_type text NOT NULL,
  commission_percentage numeric(5,2),
  commission_fixed numeric(10,2),
  api_key text,
  secret_key text,
  webhook_url text,
  supported_currencies text[] DEFAULT ARRAY['EUR'],
  min_amount numeric(10,2) DEFAULT 1,
  max_amount numeric(10,2) DEFAULT 10000,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Constraints para payment_gateways
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'payment_gateways_type_check'
  ) THEN
    ALTER TABLE payment_gateways ADD CONSTRAINT payment_gateways_type_check 
    CHECK (type IN ('stripe', 'paypal', 'sepa', 'bizum', 'custom'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'payment_gateways_status_check'
  ) THEN
    ALTER TABLE payment_gateways ADD CONSTRAINT payment_gateways_status_check 
    CHECK (status IN ('active', 'inactive', 'warning'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'payment_gateways_commission_type_check'
  ) THEN
    ALTER TABLE payment_gateways ADD CONSTRAINT payment_gateways_commission_type_check 
    CHECK (commission_type IN ('percentage', 'fixed', 'mixed'));
  END IF;
END $$;

-- RLS para payment_gateways
ALTER TABLE payment_gateways ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Admins can manage payment gateways" ON payment_gateways
FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
) WITH CHECK (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

CREATE POLICY IF NOT EXISTS "Clients can read payment gateways" ON payment_gateways
FOR SELECT TO authenticated USING (status = 'active');

-- Trigger para payment_gateways
CREATE TRIGGER IF NOT EXISTS update_payment_gateways_updated_at 
BEFORE UPDATE ON payment_gateways
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Tabla: processing_queue
CREATE TABLE IF NOT EXISTS processing_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  filename text NOT NULL,
  client_name text,
  status text NOT NULL DEFAULT 'pending',
  progress integer DEFAULT 0,
  classification text,
  confidence integer,
  obralia_section text,
  obralia_status text,
  error_message text,
  event_timestamp timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Constraints para processing_queue
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'processing_queue_status_check'
  ) THEN
    ALTER TABLE processing_queue ADD CONSTRAINT processing_queue_status_check 
    CHECK (status IN ('pending', 'uploading', 'analyzing', 'classified', 'pending_obralia', 'uploading_obralia', 'obralia_validated', 'completed', 'error'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'processing_queue_progress_check'
  ) THEN
    ALTER TABLE processing_queue ADD CONSTRAINT processing_queue_progress_check 
    CHECK (progress >= 0 AND progress <= 100);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'processing_queue_confidence_check'
  ) THEN
    ALTER TABLE processing_queue ADD CONSTRAINT processing_queue_confidence_check 
    CHECK (confidence >= 0 AND confidence <= 100);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'processing_queue_obralia_status_check'
  ) THEN
    ALTER TABLE processing_queue ADD CONSTRAINT processing_queue_obralia_status_check 
    CHECK (obralia_status IN ('pending', 'uploaded', 'validated', 'rejected'));
  END IF;
END $$;

-- RLS para processing_queue
ALTER TABLE processing_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Clients can view their own processing queue" ON processing_queue
FOR SELECT TO authenticated USING (
  client_id IN (SELECT clients.id FROM clients WHERE clients.user_id = auth.uid())
);

CREATE POLICY IF NOT EXISTS "Admins can manage all processing queue" ON processing_queue
FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
) WITH CHECK (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

-- Trigger para processing_queue
CREATE TRIGGER IF NOT EXISTS update_processing_queue_updated_at 
BEFORE UPDATE ON processing_queue
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Tabla: backups
CREATE TABLE IF NOT EXISTS backups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  backup_date timestamp with time zone NOT NULL,
  size_bytes bigint NOT NULL,
  type text NOT NULL,
  status text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Constraints para backups
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'backups_type_check'
  ) THEN
    ALTER TABLE backups ADD CONSTRAINT backups_type_check 
    CHECK (type IN ('full', 'incremental', 'differential'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'backups_status_check'
  ) THEN
    ALTER TABLE backups ADD CONSTRAINT backups_status_check 
    CHECK (status IN ('completed', 'running', 'failed'));
  END IF;
END $$;

-- RLS para backups
ALTER TABLE backups ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Admins can manage backups" ON backups
FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
) WITH CHECK (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

-- Trigger para backups
CREATE TRIGGER IF NOT EXISTS update_backups_updated_at 
BEFORE UPDATE ON backups
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Tabla: token_packages
CREATE TABLE IF NOT EXISTS token_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  tokens integer NOT NULL,
  price numeric(10,2) NOT NULL,
  description text,
  popular boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Constraints para token_packages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'token_packages_tokens_check'
  ) THEN
    ALTER TABLE token_packages ADD CONSTRAINT token_packages_tokens_check 
    CHECK (tokens > 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'token_packages_price_check'
  ) THEN
    ALTER TABLE token_packages ADD CONSTRAINT token_packages_price_check 
    CHECK (price > 0);
  END IF;
END $$;

-- RLS para token_packages
ALTER TABLE token_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON token_packages
FOR SELECT TO authenticated USING (true);

CREATE POLICY IF NOT EXISTS "Admins can manage token packages" ON token_packages
FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
) WITH CHECK (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

-- Trigger para token_packages
CREATE TRIGGER IF NOT EXISTS update_token_packages_updated_at 
BEFORE UPDATE ON token_packages
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Tabla: storage_packages
CREATE TABLE IF NOT EXISTS storage_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  storage_mb integer NOT NULL,
  price numeric(10,2) NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Constraints para storage_packages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'storage_packages_storage_mb_check'
  ) THEN
    ALTER TABLE storage_packages ADD CONSTRAINT storage_packages_storage_mb_check 
    CHECK (storage_mb > 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'storage_packages_price_check'
  ) THEN
    ALTER TABLE storage_packages ADD CONSTRAINT storage_packages_price_check 
    CHECK (price > 0);
  END IF;
END $$;

-- RLS para storage_packages
ALTER TABLE storage_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Enable read access for all users on storage packages" ON storage_packages
FOR SELECT TO authenticated USING (true);

CREATE POLICY IF NOT EXISTS "Admins can manage storage packages" ON storage_packages
FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
) WITH CHECK (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

-- Trigger para storage_packages
CREATE TRIGGER IF NOT EXISTS update_storage_packages_updated_at 
BEFORE UPDATE ON storage_packages
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Tabla: subscription_plans
CREATE TABLE IF NOT EXISTS subscription_plans (
  id text PRIMARY KEY,
  name text NOT NULL,
  price_monthly numeric(10,2) NOT NULL,
  price_yearly numeric(10,2) NOT NULL,
  features text[],
  storage_mb integer NOT NULL,
  tokens_per_month integer NOT NULL,
  documents_per_month text NOT NULL,
  support_level text NOT NULL,
  popular boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Constraints para subscription_plans
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'subscription_plans_price_monthly_check'
  ) THEN
    ALTER TABLE subscription_plans ADD CONSTRAINT subscription_plans_price_monthly_check 
    CHECK (price_monthly > 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'subscription_plans_price_yearly_check'
  ) THEN
    ALTER TABLE subscription_plans ADD CONSTRAINT subscription_plans_price_yearly_check 
    CHECK (price_yearly > 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'subscription_plans_storage_mb_check'
  ) THEN
    ALTER TABLE subscription_plans ADD CONSTRAINT subscription_plans_storage_mb_check 
    CHECK (storage_mb > 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'subscription_plans_tokens_per_month_check'
  ) THEN
    ALTER TABLE subscription_plans ADD CONSTRAINT subscription_plans_tokens_per_month_check 
    CHECK (tokens_per_month > 0);
  END IF;
END $$;

-- RLS para subscription_plans
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Enable read access for all users on subscription plans" ON subscription_plans
FOR SELECT TO authenticated USING (true);

CREATE POLICY IF NOT EXISTS "Admins can manage subscription plans" ON subscription_plans
FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
) WITH CHECK (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

-- Trigger para subscription_plans
CREATE TRIGGER IF NOT EXISTS update_subscription_plans_updated_at 
BEFORE UPDATE ON subscription_plans
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Tabla: fiscal_events
CREATE TABLE IF NOT EXISTS fiscal_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  event_date date NOT NULL,
  amount_estimate numeric(10,2),
  status text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Constraints para fiscal_events
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'fiscal_events_status_check'
  ) THEN
    ALTER TABLE fiscal_events ADD CONSTRAINT fiscal_events_status_check 
    CHECK (status IN ('upcoming', 'completed', 'overdue'));
  END IF;
END $$;

-- RLS para fiscal_events
ALTER TABLE fiscal_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Admins can manage fiscal events" ON fiscal_events
FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
) WITH CHECK (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

CREATE POLICY IF NOT EXISTS "Clients can view fiscal events" ON fiscal_events
FOR SELECT TO authenticated USING (true);

-- Trigger para fiscal_events
CREATE TRIGGER IF NOT EXISTS update_fiscal_events_updated_at 
BEFORE UPDATE ON fiscal_events
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Tabla: api_endpoints
CREATE TABLE IF NOT EXISTS api_endpoints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  method text NOT NULL,
  endpoint_path text NOT NULL,
  requests_per_hour integer DEFAULT 0,
  avg_response_time_ms integer DEFAULT 0,
  error_rate numeric(5,2) DEFAULT 0.00,
  status text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Constraints para api_endpoints
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'api_endpoints_method_check'
  ) THEN
    ALTER TABLE api_endpoints ADD CONSTRAINT api_endpoints_method_check 
    CHECK (method IN ('GET', 'POST', 'PUT', 'DELETE', 'PATCH'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'api_endpoints_status_check'
  ) THEN
    ALTER TABLE api_endpoints ADD CONSTRAINT api_endpoints_status_check 
    CHECK (status IN ('healthy', 'slow', 'error'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'api_endpoints_error_rate_check'
  ) THEN
    ALTER TABLE api_endpoints ADD CONSTRAINT api_endpoints_error_rate_check 
    CHECK (error_rate >= 0 AND error_rate <= 100);
  END IF;
END $$;

-- RLS para api_endpoints
ALTER TABLE api_endpoints ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Admins can manage API endpoints" ON api_endpoints
FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
) WITH CHECK (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

-- Trigger para api_endpoints
CREATE TRIGGER IF NOT EXISTS update_api_endpoints_updated_at 
BEFORE UPDATE ON api_endpoints
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Tabla: api_integrations
CREATE TABLE IF NOT EXISTS api_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  status text NOT NULL,
  description text,
  requests_today integer DEFAULT 0,
  avg_response_time_ms integer DEFAULT 0,
  last_sync timestamp with time zone,
  config_details jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Constraints para api_integrations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'api_integrations_status_check'
  ) THEN
    ALTER TABLE api_integrations ADD CONSTRAINT api_integrations_status_check 
    CHECK (status IN ('connected', 'warning', 'error'));
  END IF;
END $$;

-- RLS para api_integrations
ALTER TABLE api_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Admins can manage API integrations" ON api_integrations
FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
) WITH CHECK (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

-- Trigger para api_integrations
CREATE TRIGGER IF NOT EXISTS update_api_integrations_updated_at 
BEFORE UPDATE ON api_integrations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();