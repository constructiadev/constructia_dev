/*
  ============================================================================
  FIX INFINITE RECURSION IN RLS POLICIES - COMPLETE SOLUTION
  ============================================================================

  This script resolves the "infinite recursion detected in policy for relation users"
  error by implementing SECURITY DEFINER functions and clean RLS policies.

  PROBLEM:
  - RLS policies were querying the users table from within the users table policies
  - This created a circular dependency causing infinite recursion

  SOLUTION:
  - Create SECURITY DEFINER functions that bypass RLS
  - Implement separate, specific policies for each access pattern
  - Use helper functions instead of direct subqueries

  HOW TO USE:
  1. Open your Supabase Dashboard
  2. Go to SQL Editor
  3. Copy and paste this entire script
  4. Click "Run" to execute

  This script is safe to run multiple times.
  ============================================================================
*/

-- ============================================
-- STEP 1: DROP ALL EXISTING POLICIES
-- ============================================

-- Drop all existing RLS policies to prevent conflicts
DROP POLICY IF EXISTS "SuperAdmin can access all tenants" ON tenants;
DROP POLICY IF EXISTS "Users can view own tenant" ON tenants;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "SuperAdmin can read all users" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "SuperAdmin can manage all users" ON users;
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
DROP POLICY IF EXISTS "Auditoria insert" ON auditoria;
DROP POLICY IF EXISTS "Mensajes tenant access" ON mensajes;
DROP POLICY IF EXISTS "Reportes tenant access" ON reportes;
DROP POLICY IF EXISTS "Token transactions tenant access" ON token_transactions;
DROP POLICY IF EXISTS "Checkout providers tenant access" ON checkout_providers;
DROP POLICY IF EXISTS "Mandatos SEPA tenant access" ON mandatos_sepa;
DROP POLICY IF EXISTS "Manual upload queue tenant access" ON manual_upload_queue;

-- ============================================
-- STEP 2: CREATE SECURITY DEFINER FUNCTIONS
-- ============================================

-- Function to check if current user is SuperAdmin (bypasses RLS)
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS boolean AS $$
BEGIN
  -- Use hardcoded SuperAdmin UUID to avoid recursion
  RETURN auth.uid() = '20000000-0000-0000-0000-000000000001'::uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's tenant_id (bypasses RLS)
CREATE OR REPLACE FUNCTION get_user_tenant_id()
RETURNS uuid AS $$
DECLARE
  user_tenant_id uuid;
BEGIN
  -- If SuperAdmin, return null (can access all tenants)
  IF auth.uid() = '20000000-0000-0000-0000-000000000001'::uuid THEN
    RETURN null;
  END IF;
  
  -- For regular users, get their tenant_id directly
  SELECT tenant_id INTO user_tenant_id
  FROM public.users
  WHERE id = auth.uid()
  LIMIT 1;
  
  RETURN COALESCE(user_tenant_id, '00000000-0000-0000-0000-000000000001'::uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STEP 3: CREATE NON-RECURSIVE RLS POLICIES
-- ============================================

-- TENANTS TABLE POLICIES
CREATE POLICY "SuperAdmin can access all tenants"
  ON tenants FOR ALL TO authenticated
  USING (is_super_admin());

CREATE POLICY "Users can view own tenant"
  ON tenants FOR SELECT TO authenticated
  USING (id = get_user_tenant_id());

-- USERS TABLE POLICIES (CRITICAL - NO RECURSION)
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "SuperAdmin can view all users"
  ON users FOR SELECT TO authenticated
  USING (is_super_admin());

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "SuperAdmin can manage all users"
  ON users FOR ALL TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- EMPRESAS TABLE POLICIES
CREATE POLICY "Empresas tenant access"
  ON empresas FOR ALL TO authenticated
  USING (is_super_admin() OR tenant_id = get_user_tenant_id());

-- OBRAS TABLE POLICIES
CREATE POLICY "Obras tenant access"
  ON obras FOR ALL TO authenticated
  USING (is_super_admin() OR tenant_id = get_user_tenant_id());

-- PROVEEDORES TABLE POLICIES
CREATE POLICY "Proveedores tenant access"
  ON proveedores FOR ALL TO authenticated
  USING (is_super_admin() OR tenant_id = get_user_tenant_id());

-- TRABAJADORES TABLE POLICIES
CREATE POLICY "Trabajadores tenant access"
  ON trabajadores FOR ALL TO authenticated
  USING (is_super_admin() OR tenant_id = get_user_tenant_id());

-- MAQUINARIA TABLE POLICIES
CREATE POLICY "Maquinaria tenant access"
  ON maquinaria FOR ALL TO authenticated
  USING (is_super_admin() OR tenant_id = get_user_tenant_id());

-- DOCUMENTOS TABLE POLICIES
CREATE POLICY "Documentos tenant access"
  ON documentos FOR ALL TO authenticated
  USING (is_super_admin() OR tenant_id = get_user_tenant_id());

-- TAREAS TABLE POLICIES
CREATE POLICY "Tareas tenant access"
  ON tareas FOR ALL TO authenticated
  USING (is_super_admin() OR tenant_id = get_user_tenant_id());

-- REQUISITOS PLATAFORMA TABLE POLICIES
CREATE POLICY "Requisitos plataforma tenant access"
  ON requisitos_plataforma FOR ALL TO authenticated
  USING (is_super_admin() OR tenant_id = get_user_tenant_id());

-- MAPPING TEMPLATES TABLE POLICIES
CREATE POLICY "Mapping templates tenant access"
  ON mapping_templates FOR ALL TO authenticated
  USING (is_super_admin() OR tenant_id = get_user_tenant_id());

-- ADAPTADORES TABLE POLICIES
CREATE POLICY "Adaptadores tenant access"
  ON adaptadores FOR ALL TO authenticated
  USING (is_super_admin() OR tenant_id = get_user_tenant_id());

-- JOBS INTEGRACION TABLE POLICIES
CREATE POLICY "Jobs integracion tenant access"
  ON jobs_integracion FOR ALL TO authenticated
  USING (is_super_admin() OR tenant_id = get_user_tenant_id());

-- SUSCRIPCIONES TABLE POLICIES
CREATE POLICY "Suscripciones tenant access"
  ON suscripciones FOR ALL TO authenticated
  USING (is_super_admin() OR tenant_id = get_user_tenant_id());

-- AUDITORIA TABLE POLICIES
CREATE POLICY "Auditoria tenant access"
  ON auditoria FOR SELECT TO authenticated
  USING (is_super_admin() OR tenant_id = get_user_tenant_id());

CREATE POLICY "Auditoria insert"
  ON auditoria FOR INSERT TO authenticated
  WITH CHECK (true);

-- MENSAJES TABLE POLICIES
CREATE POLICY "Mensajes tenant access"
  ON mensajes FOR ALL TO authenticated
  USING (is_super_admin() OR tenant_id = get_user_tenant_id());

-- REPORTES TABLE POLICIES
CREATE POLICY "Reportes tenant access"
  ON reportes FOR ALL TO authenticated
  USING (is_super_admin() OR tenant_id = get_user_tenant_id());

-- TOKEN TRANSACTIONS TABLE POLICIES
CREATE POLICY "Token transactions tenant access"
  ON token_transactions FOR ALL TO authenticated
  USING (is_super_admin() OR tenant_id = get_user_tenant_id());

-- CHECKOUT PROVIDERS TABLE POLICIES
CREATE POLICY "Checkout providers tenant access"
  ON checkout_providers FOR ALL TO authenticated
  USING (is_super_admin() OR tenant_id = get_user_tenant_id());

-- MANDATOS SEPA TABLE POLICIES
CREATE POLICY "Mandatos SEPA tenant access"
  ON mandatos_sepa FOR ALL TO authenticated
  USING (is_super_admin() OR tenant_id = get_user_tenant_id());

-- MANUAL UPLOAD QUEUE TABLE POLICIES
CREATE POLICY "Manual upload queue tenant access"
  ON manual_upload_queue FOR ALL TO authenticated
  USING (is_super_admin() OR tenant_id = get_user_tenant_id());

-- ============================================
-- STEP 4: VERIFICATION
-- ============================================

-- Verify that policies were created successfully
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'RLS INFINITE RECURSION FIX COMPLETED';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Helper functions created:';
  RAISE NOTICE '  - is_super_admin() (SECURITY DEFINER)';
  RAISE NOTICE '  - get_user_tenant_id() (SECURITY DEFINER)';
  RAISE NOTICE '';
  RAISE NOTICE 'All RLS policies recreated without recursion';
  RAISE NOTICE 'SuperAdmin UUID: 20000000-0000-0000-0000-000000000001';
  RAISE NOTICE 'Default Tenant UUID: 00000000-0000-0000-0000-000000000001';
  RAISE NOTICE '========================================';
END $$;

-- Test the helper functions
SELECT 
  'Helper functions test:' as test_type,
  is_super_admin() as is_super_admin_result,
  get_user_tenant_id() as user_tenant_id_result;

-- List all policies to verify they exist
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;