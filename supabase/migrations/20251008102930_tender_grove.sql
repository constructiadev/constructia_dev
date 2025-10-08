/*
  ============================================================================
  FIX DATABASE SCHEMA ERROR - Complete Solution
  ============================================================================

  This script fixes the "Database error querying schema" by:
  1. Creating the missing users table and other required tables
  2. Setting up proper RLS policies without infinite recursion
  3. Creating test users for admin and client login
  4. Ensuring proper tenant structure

  INSTRUCTIONS:
  1. Go to https://supabase.com/dashboard
  2. Select your project: phbjqlytkeifcobaxunt
  3. Go to SQL Editor
  4. Copy and paste this ENTIRE script
  5. Click "Run" and wait for completion
  ============================================================================
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- STEP 1: CREATE ENUM TYPES
-- ============================================================================

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
  CREATE TYPE queue_status AS ENUM ('queued', 'in_progress', 'uploaded', 'error');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- STEP 2: CREATE CORE TABLES
-- ============================================================================

-- Tenants table
CREATE TABLE IF NOT EXISTS public.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  status tenant_status DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Users table (CRITICAL - this was missing)
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
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
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id, cif)
);

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
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id, codigo_obra)
);

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
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id, entidad_tipo, entidad_id, categoria, version)
);

-- Manual upload queue table
CREATE TABLE IF NOT EXISTS public.manual_upload_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  empresa_id uuid NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  obra_id uuid NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  documento_id uuid NOT NULL REFERENCES public.documentos(id) ON DELETE CASCADE,
  status queue_status DEFAULT 'queued',
  priority text DEFAULT 'normal',
  operator_user uuid,
  nota text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Auditoria table (CRITICAL - for global audit logging)
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

-- Mensajes table
CREATE TABLE IF NOT EXISTS public.mensajes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  tipo text NOT NULL,
  titulo text,
  contenido text,
  prioridad text DEFAULT 'media',
  vence timestamptz,
  destinatarios jsonb DEFAULT '[]',
  estado text DEFAULT 'programado',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Clients table (for compatibility)
CREATE TABLE IF NOT EXISTS public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  client_id text UNIQUE,
  company_name text NOT NULL,
  contact_name text,
  email text,
  phone text,
  address text,
  subscription_plan text DEFAULT 'professional',
  subscription_status text DEFAULT 'active',
  storage_used bigint DEFAULT 0,
  storage_limit bigint DEFAULT 1073741824,
  documents_processed integer DEFAULT 0,
  tokens_available integer DEFAULT 1000,
  obralia_credentials jsonb DEFAULT '{"configured": false}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- STEP 3: CREATE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_users_tenant_email ON public.users(tenant_id, email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_empresas_tenant_cif ON public.empresas(tenant_id, cif);
CREATE INDEX IF NOT EXISTS idx_obras_tenant_codigo ON public.obras(tenant_id, codigo_obra);
CREATE INDEX IF NOT EXISTS idx_documentos_tenant ON public.documentos(tenant_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_tenant_fecha ON public.auditoria(tenant_id, created_at);
CREATE INDEX IF NOT EXISTS idx_auditoria_actor ON public.auditoria(actor_user);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients(email);

-- ============================================================================
-- STEP 4: CREATE SECURITY DEFINER FUNCTIONS (NO RECURSION)
-- ============================================================================

-- Helper function to check if user is SuperAdmin (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS boolean AS $$
DECLARE
  user_role_value text;
BEGIN
  -- Direct query to avoid RLS recursion
  SELECT role INTO user_role_value
  FROM public.users
  WHERE id = auth.uid()
  LIMIT 1;
  
  RETURN user_role_value = 'SuperAdmin';
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get user's tenant_id (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION get_user_tenant_id()
RETURNS uuid AS $$
DECLARE
  user_tenant_id uuid;
BEGIN
  -- Direct query to avoid RLS recursion
  SELECT tenant_id INTO user_tenant_id
  FROM public.users
  WHERE id = auth.uid()
  LIMIT 1;
  
  RETURN user_tenant_id;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 5: ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.obras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manual_upload_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auditoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensajes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 6: DROP ALL EXISTING POLICIES TO PREVENT CONFLICTS
-- ============================================================================

-- Drop all existing policies
DROP POLICY IF EXISTS "SuperAdmin can access all tenants" ON public.tenants;
DROP POLICY IF EXISTS "Users can view own tenant" ON public.tenants;
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "SuperAdmin can read all users" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "SuperAdmin can manage all users" ON public.users;
DROP POLICY IF EXISTS "Empresas tenant access" ON public.empresas;
DROP POLICY IF EXISTS "Obras tenant access" ON public.obras;
DROP POLICY IF EXISTS "Documentos tenant access" ON public.documentos;
DROP POLICY IF EXISTS "Manual upload queue tenant access" ON public.manual_upload_queue;
DROP POLICY IF EXISTS "Auditoria tenant access" ON public.auditoria;
DROP POLICY IF EXISTS "Auditoria insert" ON public.auditoria;
DROP POLICY IF EXISTS "Mensajes tenant access" ON public.mensajes;
DROP POLICY IF EXISTS "Users can view own client data" ON public.clients;
DROP POLICY IF EXISTS "Users can update own client data" ON public.clients;
DROP POLICY IF EXISTS "SuperAdmin can manage all clients" ON public.clients;

-- ============================================================================
-- STEP 7: CREATE CLEAN RLS POLICIES USING SECURITY DEFINER FUNCTIONS
-- ============================================================================

-- Tenants policies
CREATE POLICY "SuperAdmin can access all tenants"
  ON public.tenants FOR ALL TO authenticated
  USING (is_super_admin());

CREATE POLICY "Users can view own tenant"
  ON public.tenants FOR SELECT TO authenticated
  USING (id = get_user_tenant_id());

-- Users policies (SEPARATE POLICIES TO AVOID RECURSION)
CREATE POLICY "Users can read own profile"
  ON public.users FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "SuperAdmin can read all users"
  ON public.users FOR SELECT TO authenticated
  USING (is_super_admin());

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "SuperAdmin can manage all users"
  ON public.users FOR ALL TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- Empresas policies
CREATE POLICY "Empresas tenant access"
  ON public.empresas FOR ALL TO authenticated
  USING (is_super_admin() OR tenant_id = get_user_tenant_id());

-- Obras policies
CREATE POLICY "Obras tenant access"
  ON public.obras FOR ALL TO authenticated
  USING (is_super_admin() OR tenant_id = get_user_tenant_id());

-- Documentos policies
CREATE POLICY "Documentos tenant access"
  ON public.documentos FOR ALL TO authenticated
  USING (is_super_admin() OR tenant_id = get_user_tenant_id());

-- Manual upload queue policies
CREATE POLICY "Manual upload queue tenant access"
  ON public.manual_upload_queue FOR ALL TO authenticated
  USING (is_super_admin() OR tenant_id = get_user_tenant_id());

-- Auditoria policies (GLOBAL ACCESS FOR ADMIN)
CREATE POLICY "SuperAdmin can read all audit logs"
  ON public.auditoria FOR SELECT TO authenticated
  USING (is_super_admin());

CREATE POLICY "Users can read own tenant audit logs"
  ON public.auditoria FOR SELECT TO authenticated
  USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Anyone can insert audit logs"
  ON public.auditoria FOR INSERT TO authenticated
  WITH CHECK (true);

-- Mensajes policies
CREATE POLICY "Mensajes tenant access"
  ON public.mensajes FOR ALL TO authenticated
  USING (is_super_admin() OR tenant_id = get_user_tenant_id());

-- Clients policies
CREATE POLICY "Users can view own client data"
  ON public.clients FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR is_super_admin());

CREATE POLICY "Users can update own client data"
  ON public.clients FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "SuperAdmin can manage all clients"
  ON public.clients FOR ALL TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- ============================================================================
-- STEP 8: CREATE UPDATE TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to tables with updated_at column
DROP TRIGGER IF EXISTS update_tenants_updated_at ON public.tenants;
CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_empresas_updated_at ON public.empresas;
CREATE TRIGGER update_empresas_updated_at
  BEFORE UPDATE ON public.empresas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_obras_updated_at ON public.obras;
CREATE TRIGGER update_obras_updated_at
  BEFORE UPDATE ON public.obras
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_documentos_updated_at ON public.documentos;
CREATE TRIGGER update_documentos_updated_at
  BEFORE UPDATE ON public.documentos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_manual_upload_queue_updated_at ON public.manual_upload_queue;
CREATE TRIGGER update_manual_upload_queue_updated_at
  BEFORE UPDATE ON public.manual_upload_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_clients_updated_at ON public.clients;
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STEP 9: INSERT DEFAULT DATA
-- ============================================================================

-- Insert default tenant
INSERT INTO public.tenants (id, name, status)
VALUES ('00000000-0000-0000-0000-000000000001', 'Development Tenant', 'active')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- Insert system admin user
INSERT INTO public.users (id, tenant_id, email, name, role, active)
VALUES (
  '20000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'admin@constructia.com',
  'System Admin',
  'SuperAdmin',
  true
)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    role = EXCLUDED.role,
    active = EXCLUDED.active;

-- Insert demo client user
INSERT INTO public.users (id, tenant_id, email, name, role, active)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'demo@construcciones.com',
  'Demo User',
  'Cliente',
  true
)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    role = EXCLUDED.role,
    active = EXCLUDED.active;

-- Insert sample client record
INSERT INTO public.clients (id, user_id, client_id, company_name, contact_name, email, phone, address)
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000001',
  'CLI-DEMO-001',
  'Constructora Demo S.L.',
  'Usuario Demo',
  'demo@construcciones.com',
  '+34 600 000 000',
  'Calle Demo 123, Madrid'
)
ON CONFLICT (client_id) DO NOTHING;

-- Insert sample empresa
DO $$
DECLARE
  v_tenant_id uuid := '00000000-0000-0000-0000-000000000001';
  v_empresa_id uuid;
BEGIN
  INSERT INTO public.empresas (id, tenant_id, razon_social, cif, direccion, contacto_email)
  VALUES (
    gen_random_uuid(),
    v_tenant_id,
    'Constructora Demo S.L.',
    'B12345678',
    'Calle Demo 123, Madrid',
    'demo@construcciones.com'
  )
  ON CONFLICT (tenant_id, cif) DO NOTHING
  RETURNING id INTO v_empresa_id;

  -- Insert sample obra if empresa was created
  IF v_empresa_id IS NOT NULL THEN
    INSERT INTO public.obras (tenant_id, empresa_id, nombre_obra, codigo_obra, direccion, fecha_inicio)
    VALUES (
      v_tenant_id,
      v_empresa_id,
      'Proyecto Demo',
      'OBRA-DEMO-001',
      'Madrid, España',
      CURRENT_DATE
    )
    ON CONFLICT (tenant_id, codigo_obra) DO NOTHING;
  END IF;
END $$;

-- ============================================================================
-- STEP 10: VERIFICATION
-- ============================================================================

-- Verify tables exist
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'DATABASE SCHEMA FIX COMPLETED';
  RAISE NOTICE '========================================';

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
    RAISE NOTICE '✅ Table users exists';
  ELSE
    RAISE WARNING '❌ Table users does NOT exist';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tenants') THEN
    RAISE NOTICE '✅ Table tenants exists';
  ELSE
    RAISE WARNING '❌ Table tenants does NOT exist';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'auditoria') THEN
    RAISE NOTICE '✅ Table auditoria exists';
  ELSE
    RAISE WARNING '❌ Table auditoria does NOT exist';
  END IF;

  -- Check if admin user exists
  IF EXISTS (SELECT 1 FROM public.users WHERE email = 'admin@constructia.com' AND role = 'SuperAdmin') THEN
    RAISE NOTICE '✅ Admin user exists';
  ELSE
    RAISE WARNING '❌ Admin user does NOT exist';
  END IF;

  -- Check if demo user exists
  IF EXISTS (SELECT 1 FROM public.users WHERE email = 'demo@construcciones.com' AND role = 'Cliente') THEN
    RAISE NOTICE '✅ Demo user exists';
  ELSE
    RAISE WARNING '❌ Demo user does NOT exist';
  END IF;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'NEXT STEPS:';
  RAISE NOTICE '1. Update your .env file with correct SERVICE_ROLE_KEY';
  RAISE NOTICE '2. Restart your development server (Ctrl+C then npm run dev)';
  RAISE NOTICE '3. Try admin login: admin@constructia.com / superadmin123';
  RAISE NOTICE '4. Try client login: demo@construcciones.com / password123';
  RAISE NOTICE '========================================';
END $$;

-- Final comment
COMMENT ON TABLE public.users IS 'Users table - Fixed for database schema error';
COMMENT ON TABLE public.auditoria IS 'Audit table - Global logging for all tenants';

-- Show table count
SELECT 
  'Database schema fix completed' as status,
  COUNT(*) as tables_created
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE';