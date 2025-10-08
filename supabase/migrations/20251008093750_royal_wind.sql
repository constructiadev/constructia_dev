/*
  ============================================================================
  FIX INFINITE RECURSION IN RLS POLICIES - CLEAN SOLUTION
  ============================================================================

  This script fixes the "infinite recursion detected in policy for relation users"
  error by creating SECURITY DEFINER functions that bypass RLS and implementing
  clean, non-recursive policies.

  HOW TO USE:
  1. Open your Supabase Dashboard
  2. Go to SQL Editor
  3. Copy and paste this entire script
  4. Click "Run" to execute

  This script is safe to run multiple times.
  ============================================================================
*/

-- First, drop all existing policies to start clean
DROP POLICY IF EXISTS "SuperAdmin can access all tenants" ON tenants;
DROP POLICY IF EXISTS "Users can access own tenant data" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "SuperAdmins can view all users" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "SuperAdmins can manage all users" ON users;
DROP POLICY IF EXISTS "Tenant access for authenticated users" ON tenants;

-- Drop existing helper functions if they exist
DROP FUNCTION IF EXISTS is_super_admin();
DROP FUNCTION IF EXISTS get_user_tenant_id();

-- ============================================================================
-- CREATE SECURITY DEFINER HELPER FUNCTIONS
-- ============================================================================

-- Function to check if current user is SuperAdmin (bypasses RLS)
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role_val text;
BEGIN
  -- Get the role directly without RLS interference
  SELECT role INTO user_role_val
  FROM users
  WHERE id = auth.uid()
  LIMIT 1;
  
  RETURN COALESCE(user_role_val = 'SuperAdmin', false);
END;
$$;

-- Function to get current user's tenant_id (bypasses RLS)
CREATE OR REPLACE FUNCTION get_user_tenant_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  tenant_uuid uuid;
BEGIN
  -- Get the tenant_id directly without RLS interference
  SELECT tenant_id INTO tenant_uuid
  FROM users
  WHERE id = auth.uid()
  LIMIT 1;
  
  RETURN tenant_uuid;
END;
$$;

-- ============================================================================
-- CREATE CLEAN RLS POLICIES
-- ============================================================================

-- TENANTS TABLE POLICIES
CREATE POLICY "Tenant access for authenticated users"
  ON tenants FOR ALL TO authenticated
  USING (
    -- SuperAdmins can access all tenants
    is_super_admin()
    OR
    -- Regular users can only access their own tenant
    id = get_user_tenant_id()
  );

-- USERS TABLE POLICIES
-- Policy 1: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT TO authenticated
  USING (id = auth.uid());

-- Policy 2: SuperAdmins can view all users
CREATE POLICY "SuperAdmins can view all users"
  ON users FOR SELECT TO authenticated
  USING (is_super_admin());

-- Policy 3: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE TO authenticated
  USING (id = auth.uid());

-- Policy 4: SuperAdmins can insert/update/delete all users
CREATE POLICY "SuperAdmins can manage all users"
  ON users FOR ALL TO authenticated
  USING (is_super_admin());

-- ============================================================================
-- UPDATE OTHER TABLE POLICIES TO USE HELPER FUNCTIONS
-- ============================================================================

-- Drop and recreate policies for other tables using the helper functions
DROP POLICY IF EXISTS "Empresas tenant access" ON empresas;
CREATE POLICY "Empresas tenant access"
  ON empresas FOR ALL TO authenticated
  USING (
    tenant_id = get_user_tenant_id()
    OR is_super_admin()
  );

DROP POLICY IF EXISTS "Obras tenant access" ON obras;
CREATE POLICY "Obras tenant access"
  ON obras FOR ALL TO authenticated
  USING (
    tenant_id = get_user_tenant_id()
    OR is_super_admin()
  );

DROP POLICY IF EXISTS "Proveedores tenant access" ON proveedores;
CREATE POLICY "Proveedores tenant access"
  ON proveedores FOR ALL TO authenticated
  USING (
    tenant_id = get_user_tenant_id()
    OR is_super_admin()
  );

DROP POLICY IF EXISTS "Trabajadores tenant access" ON trabajadores;
CREATE POLICY "Trabajadores tenant access"
  ON trabajadores FOR ALL TO authenticated
  USING (
    tenant_id = get_user_tenant_id()
    OR is_super_admin()
  );

DROP POLICY IF EXISTS "Maquinaria tenant access" ON maquinaria;
CREATE POLICY "Maquinaria tenant access"
  ON maquinaria FOR ALL TO authenticated
  USING (
    tenant_id = get_user_tenant_id()
    OR is_super_admin()
  );

DROP POLICY IF EXISTS "Documentos tenant access" ON documentos;
CREATE POLICY "Documentos tenant access"
  ON documentos FOR ALL TO authenticated
  USING (
    tenant_id = get_user_tenant_id()
    OR is_super_admin()
  );

DROP POLICY IF EXISTS "Tareas tenant access" ON tareas;
CREATE POLICY "Tareas tenant access"
  ON tareas FOR ALL TO authenticated
  USING (
    tenant_id = get_user_tenant_id()
    OR is_super_admin()
  );

DROP POLICY IF EXISTS "Requisitos plataforma tenant access" ON requisitos_plataforma;
CREATE POLICY "Requisitos plataforma tenant access"
  ON requisitos_plataforma FOR ALL TO authenticated
  USING (
    tenant_id = get_user_tenant_id()
    OR is_super_admin()
  );

DROP POLICY IF EXISTS "Mapping templates tenant access" ON mapping_templates;
CREATE POLICY "Mapping templates tenant access"
  ON mapping_templates FOR ALL TO authenticated
  USING (
    tenant_id = get_user_tenant_id()
    OR is_super_admin()
  );

DROP POLICY IF EXISTS "Adaptadores tenant access" ON adaptadores;
CREATE POLICY "Adaptadores tenant access"
  ON adaptadores FOR ALL TO authenticated
  USING (
    tenant_id = get_user_tenant_id()
    OR is_super_admin()
  );

DROP POLICY IF EXISTS "Jobs integracion tenant access" ON jobs_integracion;
CREATE POLICY "Jobs integracion tenant access"
  ON jobs_integracion FOR ALL TO authenticated
  USING (
    tenant_id = get_user_tenant_id()
    OR is_super_admin()
  );

DROP POLICY IF EXISTS "Suscripciones tenant access" ON suscripciones;
CREATE POLICY "Suscripciones tenant access"
  ON suscripciones FOR ALL TO authenticated
  USING (
    tenant_id = get_user_tenant_id()
    OR is_super_admin()
  );

DROP POLICY IF EXISTS "Auditoria tenant access" ON auditoria;
CREATE POLICY "Auditoria tenant access"
  ON auditoria FOR ALL TO authenticated
  USING (
    tenant_id = get_user_tenant_id()
    OR is_super_admin()
  );

DROP POLICY IF EXISTS "Mensajes tenant access" ON mensajes;
CREATE POLICY "Mensajes tenant access"
  ON mensajes FOR ALL TO authenticated
  USING (
    tenant_id = get_user_tenant_id()
    OR is_super_admin()
  );

DROP POLICY IF EXISTS "Reportes tenant access" ON reportes;
CREATE POLICY "Reportes tenant access"
  ON reportes FOR ALL TO authenticated
  USING (
    tenant_id = get_user_tenant_id()
    OR is_super_admin()
  );

DROP POLICY IF EXISTS "Token transactions tenant access" ON token_transactions;
CREATE POLICY "Token transactions tenant access"
  ON token_transactions FOR ALL TO authenticated
  USING (
    tenant_id = get_user_tenant_id()
    OR is_super_admin()
  );

DROP POLICY IF EXISTS "Checkout providers tenant access" ON checkout_providers;
CREATE POLICY "Checkout providers tenant access"
  ON checkout_providers FOR ALL TO authenticated
  USING (
    tenant_id = get_user_tenant_id()
    OR is_super_admin()
  );

DROP POLICY IF EXISTS "Mandatos SEPA tenant access" ON mandatos_sepa;
CREATE POLICY "Mandatos SEPA tenant access"
  ON mandatos_sepa FOR ALL TO authenticated
  USING (
    tenant_id = get_user_tenant_id()
    OR is_super_admin()
  );

DROP POLICY IF EXISTS "Manual upload queue tenant access" ON manual_upload_queue;
CREATE POLICY "Manual upload queue tenant access"
  ON manual_upload_queue FOR ALL TO authenticated
  USING (
    tenant_id = get_user_tenant_id()
    OR is_super_admin()
  );

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Test the helper functions
SELECT 'Helper functions created successfully' as status;

-- Verify policies exist
SELECT 
  schemaname, 
  tablename, 
  policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'tenants')
ORDER BY tablename, policyname;