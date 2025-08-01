/*
  # Sincronización completa del esquema de base de datos

  1. Nuevas Columnas en Tablas Existentes
    - `clients`: last_activity, monthly_revenue
    - `audit_logs`: user_role, user_email, client_name, status
    - `companies`: projects_count, documents_count, status, obralia_configured
    - `projects`: company_name, documents_count, team_members
    - `documents`: project_name, company_name, processed_at
    - `receipts`: client_name, client_email, client_address, client_tax_id, gross_amount, commission
    - `kpis`: category, description

  2. Nuevas Tablas
    - `processing_queue`: Cola de procesamiento de documentos
    - `backups`: Registro de backups del sistema
    - `token_packages`: Paquetes de tokens disponibles
    - `storage_packages`: Paquetes de almacenamiento adicional
    - `subscription_plans`: Planes de suscripción disponibles
    - `fiscal_events`: Eventos fiscales y recordatorios
    - `api_endpoints`: Endpoints de API monitoreados
    - `api_integrations`: Integraciones con APIs externas

  3. Seguridad
    - Habilitar RLS en todas las nuevas tablas
    - Políticas de acceso apropiadas para cada tabla
    - Triggers para updated_at automático
*/

-- =====================================================
-- MODIFICACIONES DE COLUMNAS EN TABLAS EXISTENTES
-- =====================================================

-- Tabla: clients
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'last_activity'
  ) THEN
    ALTER TABLE public.clients ADD COLUMN last_activity timestamp with time zone;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'monthly_revenue'
  ) THEN
    ALTER TABLE public.clients ADD COLUMN monthly_revenue numeric(10,2);
  END IF;
END $$;

-- Tabla: audit_logs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_logs' AND column_name = 'user_role'
  ) THEN
    ALTER TABLE public.audit_logs ADD COLUMN user_role text;
    ALTER TABLE public.audit_logs ADD CONSTRAINT audit_logs_user_role_check 
      CHECK (user_role IN ('admin', 'client', 'system'));
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_logs' AND column_name = 'user_email'
  ) THEN
    ALTER TABLE public.audit_logs ADD COLUMN user_email text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_logs' AND column_name = 'client_name'
  ) THEN
    ALTER TABLE public.audit_logs ADD COLUMN client_name text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_logs' AND column_name = 'status'
  ) THEN
    ALTER TABLE public.audit_logs ADD COLUMN status text;
    ALTER TABLE public.audit_logs ADD CONSTRAINT audit_logs_status_check 
      CHECK (status IN ('success', 'warning', 'error'));
  END IF;
END $$;

-- Tabla: companies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'projects_count'
  ) THEN
    ALTER TABLE public.companies ADD COLUMN projects_count integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'documents_count'
  ) THEN
    ALTER TABLE public.companies ADD COLUMN documents_count integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'status'
  ) THEN
    ALTER TABLE public.companies ADD COLUMN status text DEFAULT 'active';
    ALTER TABLE public.companies ADD CONSTRAINT companies_status_check 
      CHECK (status IN ('active', 'inactive'));
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'obralia_configured'
  ) THEN
    ALTER TABLE public.companies ADD COLUMN obralia_configured boolean DEFAULT false;
  END IF;
END $$;

-- Tabla: projects
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'company_name'
  ) THEN
    ALTER TABLE public.projects ADD COLUMN company_name text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'documents_count'
  ) THEN
    ALTER TABLE public.projects ADD COLUMN documents_count integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'team_members'
  ) THEN
    ALTER TABLE public.projects ADD COLUMN team_members integer DEFAULT 0;
  END IF;
END $$;

-- Tabla: documents
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'documents' AND column_name = 'project_name'
  ) THEN
    ALTER TABLE public.documents ADD COLUMN project_name text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'documents' AND column_name = 'company_name'
  ) THEN
    ALTER TABLE public.documents ADD COLUMN company_name text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'documents' AND column_name = 'processed_at'
  ) THEN
    ALTER TABLE public.documents ADD COLUMN processed_at timestamp with time zone;
  END IF;
END $$;

-- Tabla: receipts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'receipts' AND column_name = 'client_name'
  ) THEN
    ALTER TABLE public.receipts ADD COLUMN client_name text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'receipts' AND column_name = 'client_email'
  ) THEN
    ALTER TABLE public.receipts ADD COLUMN client_email text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'receipts' AND column_name = 'client_address'
  ) THEN
    ALTER TABLE public.receipts ADD COLUMN client_address text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'receipts' AND column_name = 'client_tax_id'
  ) THEN
    ALTER TABLE public.receipts ADD COLUMN client_tax_id text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'receipts' AND column_name = 'gross_amount'
  ) THEN
    ALTER TABLE public.receipts ADD COLUMN gross_amount numeric(10,2);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'receipts' AND column_name = 'commission'
  ) THEN
    ALTER TABLE public.receipts ADD COLUMN commission numeric(10,2);
  END IF;
END $$;

-- Tabla: kpis (añadir columnas si la tabla ya existe)
DO $$
BEGIN
  -- Verificar si la tabla kpis existe
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kpis') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'kpis' AND column_name = 'category'
    ) THEN
      ALTER TABLE public.kpis ADD COLUMN category text;
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'kpis' AND column_name = 'description'
    ) THEN
      ALTER TABLE public.kpis ADD COLUMN description text;
    END IF;
  END IF;
END $$;

-- =====================================================
-- CREACIÓN DE NUEVAS TABLAS
-- =====================================================

-- Tabla: kpis (crear si no existe)
CREATE TABLE IF NOT EXISTS public.kpis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  value text NOT NULL,
  change numeric,
  trend text CHECK (trend IN ('up', 'down', 'stable')),
  period text CHECK (period IN ('daily', 'weekly', 'monthly', 'yearly')),
  category text,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.kpis ENABLE ROW LEVEL SECURITY;

-- Políticas para kpis
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'kpis' AND policyname = 'Enable read access for authenticated users'
  ) THEN
    CREATE POLICY "Enable read access for authenticated users" ON public.kpis
    FOR SELECT TO authenticated USING (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'kpis' AND policyname = 'Admins can manage KPIs'
  ) THEN
    CREATE POLICY "Admins can manage KPIs" ON public.kpis
    FOR ALL TO authenticated USING (
      EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
    ) WITH CHECK (
      EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
    );
  END IF;
END $$;

-- Trigger para kpis
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_kpis_updated_at'
  ) THEN
    CREATE TRIGGER update_kpis_updated_at BEFORE UPDATE ON public.kpis
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Tabla: processing_queue
CREATE TABLE IF NOT EXISTS public.processing_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES public.documents(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  filename text NOT NULL,
  client_name text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('uploading', 'analyzing', 'classified', 'pending_obralia', 'uploading_obralia', 'obralia_validated', 'completed', 'error')),
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  classification text,
  confidence integer CHECK (confidence >= 0 AND confidence <= 100),
  obralia_section text,
  obralia_status text CHECK (obralia_status IN ('pending', 'uploaded', 'validated', 'rejected')),
  error_message text,
  event_timestamp timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.processing_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view their own processing queue" ON public.processing_queue
FOR SELECT TO authenticated USING (
  client_id IN (SELECT clients.id FROM clients WHERE clients.user_id = auth.uid())
);

CREATE POLICY "Admins can manage all processing queue" ON public.processing_queue
FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

CREATE TRIGGER update_processing_queue_updated_at BEFORE UPDATE ON public.processing_queue
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Tabla: backups
CREATE TABLE IF NOT EXISTS public.backups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  backup_date timestamp with time zone NOT NULL,
  size_bytes bigint NOT NULL,
  type text NOT NULL CHECK (type IN ('full', 'incremental', 'differential')),
  status text NOT NULL CHECK (status IN ('completed', 'running', 'failed')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.backups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage backups" ON public.backups
FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

CREATE TRIGGER update_backups_updated_at BEFORE UPDATE ON public.backups
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Tabla: token_packages
CREATE TABLE IF NOT EXISTS public.token_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  tokens integer NOT NULL CHECK (tokens > 0),
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  description text,
  popular boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.token_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.token_packages
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage token packages" ON public.token_packages
FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

CREATE TRIGGER update_token_packages_updated_at BEFORE UPDATE ON public.token_packages
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Tabla: storage_packages
CREATE TABLE IF NOT EXISTS public.storage_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  storage_mb integer NOT NULL CHECK (storage_mb > 0),
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.storage_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.storage_packages
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage storage packages" ON public.storage_packages
FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

CREATE TRIGGER update_storage_packages_updated_at BEFORE UPDATE ON public.storage_packages
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Tabla: subscription_plans
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id text PRIMARY KEY,
  name text NOT NULL,
  price_monthly numeric(10,2) NOT NULL CHECK (price_monthly >= 0),
  price_yearly numeric(10,2) NOT NULL CHECK (price_yearly >= 0),
  features text[] NOT NULL,
  storage_mb integer NOT NULL CHECK (storage_mb > 0),
  tokens_per_month integer NOT NULL CHECK (tokens_per_month > 0),
  documents_per_month text NOT NULL,
  support_level text NOT NULL,
  popular boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.subscription_plans
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage subscription plans" ON public.subscription_plans
FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON public.subscription_plans
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Tabla: fiscal_events
CREATE TABLE IF NOT EXISTS public.fiscal_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  event_date date NOT NULL,
  amount_estimate numeric(10,2),
  status text NOT NULL CHECK (status IN ('upcoming', 'completed', 'overdue')),
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.fiscal_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage fiscal events" ON public.fiscal_events
FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

CREATE POLICY "Clients can view fiscal events" ON public.fiscal_events
FOR SELECT TO authenticated USING (true);

CREATE TRIGGER update_fiscal_events_updated_at BEFORE UPDATE ON public.fiscal_events
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Tabla: api_endpoints
CREATE TABLE IF NOT EXISTS public.api_endpoints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  method text NOT NULL CHECK (method IN ('GET', 'POST', 'PUT', 'DELETE', 'PATCH')),
  endpoint_path text NOT NULL,
  requests_per_hour integer DEFAULT 0 CHECK (requests_per_hour >= 0),
  avg_response_time_ms integer DEFAULT 0 CHECK (avg_response_time_ms >= 0),
  error_rate numeric(5,2) DEFAULT 0.00 CHECK (error_rate >= 0 AND error_rate <= 100),
  status text NOT NULL CHECK (status IN ('healthy', 'slow', 'error')),
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.api_endpoints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage API endpoints" ON public.api_endpoints
FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

CREATE TRIGGER update_api_endpoints_updated_at BEFORE UPDATE ON public.api_endpoints
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Tabla: api_integrations
CREATE TABLE IF NOT EXISTS public.api_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  status text NOT NULL CHECK (status IN ('connected', 'warning', 'error')),
  description text,
  requests_today integer DEFAULT 0 CHECK (requests_today >= 0),
  avg_response_time_ms integer DEFAULT 0 CHECK (avg_response_time_ms >= 0),
  last_sync timestamp with time zone,
  config_details jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.api_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage API integrations" ON public.api_integrations
FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

CREATE TRIGGER update_api_integrations_updated_at BEFORE UPDATE ON public.api_integrations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Tabla: payment_gateways (crear si no existe)
CREATE TABLE IF NOT EXISTS public.payment_gateways (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('stripe', 'paypal', 'sepa', 'bizum', 'custom')),
  status text NOT NULL CHECK (status IN ('active', 'inactive', 'warning')),
  commission_type text NOT NULL CHECK (commission_type IN ('percentage', 'fixed', 'mixed')),
  commission_percentage numeric(5,2) CHECK (commission_percentage >= 0 AND commission_percentage <= 100),
  commission_fixed numeric(10,2) CHECK (commission_fixed >= 0),
  commission_periods jsonb DEFAULT '[]',
  api_key text,
  secret_key text,
  webhook_url text,
  supported_currencies text[] NOT NULL,
  min_amount numeric(10,2) CHECK (min_amount >= 0),
  max_amount numeric(10,2) CHECK (max_amount >= 0),
  description text NOT NULL,
  logo_base64 text,
  transactions integer DEFAULT 0,
  volume text DEFAULT '€0',
  color text DEFAULT 'bg-gray-500',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.payment_gateways ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.payment_gateways
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage payment gateways" ON public.payment_gateways
FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

CREATE TRIGGER update_payment_gateways_updated_at BEFORE UPDATE ON public.payment_gateways
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();