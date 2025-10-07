-- ============================================
-- FIX BOLT DATABASE - Complete Setup
-- Este script crea la tabla users faltante y datos iniciales
-- ============================================

-- STEP 1: Create users table if it doesn't exist
-- ============================================

CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id uuid,
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  role user_role DEFAULT 'Cliente',
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON public.users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_user_id ON public.users(user_id);

-- STEP 2: Create RLS policies for users table
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "SuperAdmin can manage all users" ON public.users;

-- Create new policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR is_super_admin());

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "SuperAdmin can manage all users" ON public.users
  FOR ALL
  TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- STEP 3: Create trigger for updated_at
-- ============================================

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- STEP 4: Insert default tenant if it doesn't exist
-- ============================================

INSERT INTO public.tenants (id, name, status)
VALUES ('00000000-0000-0000-0000-000000000001', 'Development Tenant', 'active')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- STEP 5: Insert system admin user
-- ============================================

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

-- STEP 6: Create helper tables if they don't exist (legacy compatibility)
-- ============================================

-- Clients table (for backward compatibility)
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

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own client data" ON public.clients;
DROP POLICY IF EXISTS "Users can update own client data" ON public.clients;
DROP POLICY IF EXISTS "SuperAdmin can manage all clients" ON public.clients;

-- Create policies for clients
CREATE POLICY "Users can view own client data" ON public.clients
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_super_admin());

CREATE POLICY "Users can update own client data" ON public.clients
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "SuperAdmin can manage all clients" ON public.clients
  FOR ALL
  TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- STEP 7: Insert sample data
-- ============================================

-- Insert a sample client linked to an empresa
DO $$
DECLARE
  v_user_id uuid := '00000000-0000-0000-0000-000000000001';
  v_tenant_id uuid := '00000000-0000-0000-0000-000000000001';
  v_client_id uuid;
  v_empresa_id uuid;
BEGIN
  -- Insert user if not exists
  INSERT INTO public.users (id, tenant_id, user_id, email, name, role, active)
  VALUES (v_user_id, v_tenant_id, v_user_id, 'demo@constructia.com', 'Demo User', 'Cliente', true)
  ON CONFLICT (id) DO NOTHING;

  -- Insert client if not exists
  INSERT INTO public.clients (id, user_id, client_id, company_name, contact_name, email, phone, address)
  VALUES (
    gen_random_uuid(),
    v_user_id,
    'CLI-DEMO-001',
    'Constructora Demo S.L.',
    'Usuario Demo',
    'demo@constructia.com',
    '+34 600 000 000',
    'Calle Demo 123, Madrid'
  )
  ON CONFLICT (client_id) DO NOTHING
  RETURNING id INTO v_client_id;

  -- Insert sample empresa
  INSERT INTO public.empresas (id, tenant_id, razon_social, cif, direccion, contacto_email)
  VALUES (
    gen_random_uuid(),
    v_tenant_id,
    'Constructora Demo S.L.',
    'B12345678',
    'Calle Demo 123, Madrid',
    'demo@constructia.com'
  )
  ON CONFLICT (tenant_id, cif) DO NOTHING
  RETURNING id INTO v_empresa_id;

  -- Insert sample obra if empresa exists
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

-- STEP 8: Create system_settings table if it doesn't exist
-- ============================================

CREATE TABLE IF NOT EXISTS public.system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can read settings" ON public.system_settings;
DROP POLICY IF EXISTS "SuperAdmin can manage settings" ON public.system_settings;

CREATE POLICY "Authenticated users can read settings" ON public.system_settings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "SuperAdmin can manage settings" ON public.system_settings
  FOR ALL
  TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- Insert default system settings
INSERT INTO public.system_settings (key, value, description)
VALUES
  ('api_integrations', '{"gemini": {"enabled": true, "status": "connected"}, "obralia": {"enabled": true, "status": "connected"}}', 'API Integration settings'),
  ('email_notifications', 'true', 'Enable email notifications'),
  ('ai_auto_classification', 'true', 'Enable AI auto-classification')
ON CONFLICT (key) DO NOTHING;

-- STEP 9: Verify tables exist
-- ============================================

DO $$
BEGIN
  RAISE NOTICE 'Verificando tablas creadas...';

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
    RAISE NOTICE '✅ Tabla users existe';
  ELSE
    RAISE WARNING '❌ Tabla users NO existe';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'clients') THEN
    RAISE NOTICE '✅ Tabla clients existe';
  ELSE
    RAISE WARNING '❌ Tabla clients NO existe';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tenants') THEN
    RAISE NOTICE '✅ Tabla tenants existe';
  ELSE
    RAISE WARNING '❌ Tabla tenants NO existe';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'empresas') THEN
    RAISE NOTICE '✅ Tabla empresas existe';
  ELSE
    RAISE WARNING '❌ Tabla empresas NO existe';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'obras') THEN
    RAISE NOTICE '✅ Tabla obras existe';
  ELSE
    RAISE WARNING '❌ Tabla obras NO existe';
  END IF;
END $$;

-- COMPLETE
COMMENT ON TABLE public.users IS 'Users table - Fixed for Bolt Database compatibility';
COMMENT ON TABLE public.clients IS 'Clients table - Legacy compatibility layer';

SELECT
  '✅ Script completado exitosamente' as status,
  'Tablas users y clients creadas' as message,
  'Datos de prueba insertados' as data_status,
  'Políticas RLS configuradas' as security;
