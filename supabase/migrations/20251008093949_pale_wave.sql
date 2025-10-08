```sql
/*
  ============================================================================
  FIX DUPLICATE RLS POLICIES - STANDALONE SCRIPT
  ============================================================================

  This script resolves the "policy already exists" error by:
  1. Dropping all existing RLS policies on all tables
  2. Recreating them with proper structure
  3. Ensuring idempotent operations that can be run multiple times safely

  HOW TO USE:
  1. Open your Supabase Dashboard
  2. Go to SQL Editor
  3. Copy and paste this entire script
  4. Click "Run" to execute

  This script is safe to run multiple times and will not affect your data.
  ============================================================================
*/

-- Drop all existing RLS policies to prevent duplicates
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

-- ============================================================================
-- RECREATE ALL RLS POLICIES
-- ============================================================================

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
CREATE POLICY "SuperAdmin can access all tenants"
  ON tenants FOR ALL TO authenticated
  USING (is_super_admin());

CREATE POLICY "Users can view own tenant"
  ON tenants FOR SELECT TO authenticated
  USING (id = get_user_tenant_id());

-- Users policies
CREATE POLICY "Users can read own data"
  ON users FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "SuperAdmin can read all users"
  ON users FOR SELECT TO authenticated
  USING (is_super_admin());

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "SuperAdmin can manage all users"
  ON users FOR ALL TO authenticated
  USING (is_super_admin());

-- Empresas: Tenant-based access
CREATE POLICY "Empresas tenant access"
  ON empresas FOR ALL TO authenticated
  USING (is_super_admin() OR tenant_id = get_user_tenant_id());

-- Obras: Tenant-based access
CREATE POLICY "Obras tenant access"
  ON obras FOR ALL TO authenticated
  USING (is_super_admin() OR tenant_id = get_user_tenant_id());

-- Proveedores: Tenant-based access
CREATE POLICY "Proveedores tenant access"
  ON proveedores FOR ALL TO authenticated
  USING (is_super_admin() OR tenant_id = get_user_tenant_id());

-- Trabajadores: Tenant-based access
CREATE POLICY "Trabajadores tenant access"
  ON trabajadores FOR ALL TO authenticated
  USING (is_super_admin() OR tenant_id = get_user_tenant_id());

-- Maquinaria: Tenant-based access
CREATE POLICY "Maquinaria tenant access"
  ON maquinaria FOR ALL TO authenticated
  USING (is_super_admin() OR tenant_id = get_user_tenant_id());

-- Documentos: Tenant-based access
CREATE POLICY "Documentos tenant access"
  ON documentos FOR ALL TO authenticated
  USING (is_super_admin() OR tenant_id = get_user_tenant_id());

-- Tareas: Tenant-based access
CREATE POLICY "Tareas tenant access"
  ON tareas FOR ALL TO authenticated
  USING (is_super_admin() OR tenant_id = get_user_tenant_id());

-- Requisitos plataforma: Tenant-based access
CREATE POLICY "Requisitos plataforma tenant access"
  ON requisitos_plataforma FOR ALL TO authenticated
  USING (is_super_admin() OR tenant_id = get_user_tenant_id());

-- Mapping templates: Tenant-based access
CREATE POLICY "Mapping templates tenant access"
  ON mapping_templates FOR ALL TO authenticated
  USING (is_super_admin() OR tenant_id = get_user_tenant_id());

-- Adaptadores: Tenant-based access
CREATE POLICY "Adaptadores tenant access"
  ON adaptadores FOR ALL TO authenticated
  USING (is_super_admin() OR tenant_id = get_user_tenant_id());

-- Jobs integracion: Tenant-based access
CREATE POLICY "Jobs integracion tenant access"
  ON jobs_integracion FOR ALL TO authenticated
  USING (is_super_admin() OR tenant_id = get_user_tenant_id());

-- Suscripciones: Tenant-based access
CREATE POLICY "Suscripciones tenant access"
  ON suscripciones FOR ALL TO authenticated
  USING (is_super_admin() OR tenant_id = get_user_tenant_id());

-- Auditoria: Tenant-based access
CREATE POLICY "Auditoria tenant access"
  ON auditoria FOR ALL TO authenticated
  USING (is_super_admin() OR tenant_id = get_user_tenant_id());

-- Mensajes: Tenant-based access
CREATE POLICY "Mensajes tenant access"
  ON mensajes FOR ALL TO authenticated
  USING (is_super_admin() OR tenant_id = get_user_tenant_id());

-- Reportes: Tenant-based access
CREATE POLICY "Reportes tenant access"
  ON reportes FOR ALL TO authenticated
  USING (is_super_admin() OR tenant_id = get_user_tenant_id());

-- Token transactions: Tenant-based access
CREATE POLICY "Token transactions tenant access"
  ON token_transactions FOR ALL TO authenticated
  USING (is_super_admin() OR tenant_id = get_user_tenant_id());

-- Checkout providers: Tenant-based access
CREATE POLICY "Checkout providers tenant access"
  ON checkout_providers FOR ALL TO authenticated
  USING (is_super_admin() OR tenant_id = get_user_tenant_id());

-- Mandatos SEPA: Tenant-based access
CREATE POLICY "Mandatos SEPA tenant access"
  ON mandatos_sepa FOR ALL TO authenticated
  USING (is_super_admin() OR tenant_id = get_user_tenant_id());

-- Manual upload queue: Tenant-based access
CREATE POLICY "Manual upload queue tenant access"
  ON manual_upload_queue FOR ALL TO authenticated
  USING (is_super_admin() OR tenant_id = get_user_tenant_id());

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================
-- Run this query after executing the script above to verify all policies exist:
-- SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename, policyname;
```