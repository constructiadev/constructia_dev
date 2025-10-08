@@ .. @@
-- ============================================================================
-- CREAR POLÍTICAS RLS
-- ============================================================================

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "SuperAdmin can access all tenants" ON tenants;
DROP POLICY IF EXISTS "Users can access own tenant data" ON users;
+DROP POLICY IF EXISTS "Users can view own profile" ON users;
+DROP POLICY IF EXISTS "SuperAdmins can view all users" ON users;
+DROP POLICY IF EXISTS "SuperAdmins can manage all users" ON users;
 DROP POLICY IF EXISTS "Empresas tenant access" ON empresas;
@@ .. @@
DROP POLICY IF EXISTS "Manual upload queue tenant access" ON manual_upload_queue;

+-- ============================================================================
+-- CREAR FUNCIÓN PARA IDENTIFICAR SUPERADMIN SIN RECURSIÓN
+-- ============================================================================
+
+CREATE OR REPLACE FUNCTION is_super_admin()
+RETURNS boolean AS $$
+BEGIN
+  -- Hardcoded SuperAdmin user ID to avoid recursion
+  RETURN auth.uid() = '20000000-0000-0000-0000-000000000001'::uuid;
+END;
+$$ LANGUAGE plpgsql SECURITY DEFINER;
+
 -- Crear políticas
 CREATE POLICY "SuperAdmin can access all tenants" ON tenants FOR ALL TO authenticated USING (
-  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'SuperAdmin')
+  is_super_admin()
 );

-CREATE POLICY "Users can access own tenant data" ON users FOR ALL TO authenticated USING (
-  tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
-  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
+-- Políticas separadas para users para evitar recursión
+CREATE POLICY "Users can view own profile" ON users FOR SELECT TO authenticated USING (
+  id = auth.uid() OR is_super_admin()
+);
+
+CREATE POLICY "SuperAdmins can view all users" ON users FOR SELECT TO authenticated USING (
+  is_super_admin()
+);
+
+CREATE POLICY "SuperAdmins can manage all users" ON users FOR INSERT, UPDATE, DELETE TO authenticated USING (
+  is_super_admin()
 );

 CREATE POLICY "Empresas tenant access" ON empresas FOR ALL TO authenticated USING (
   tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
-  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
+  OR is_super_admin()
 );

 CREATE POLICY "Obras tenant access" ON obras FOR ALL TO authenticated USING (
   tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
-  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
+  OR is_super_admin()
 );

 CREATE POLICY "Proveedores tenant access" ON proveedores FOR ALL TO authenticated USING (
   tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
-  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
+  OR is_super_admin()
 );

 CREATE POLICY "Trabajadores tenant access" ON trabajadores FOR ALL TO authenticated USING (
   tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
-  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
+  OR is_super_admin()
 );

 CREATE POLICY "Maquinaria tenant access" ON maquinaria FOR ALL TO authenticated USING (
   tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
-  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
+  OR is_super_admin()
 );

 CREATE POLICY "Documentos tenant access" ON documentos FOR ALL TO authenticated USING (
   tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
-  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
+  OR is_super_admin()
 );

 CREATE POLICY "Tareas tenant access" ON tareas FOR ALL TO authenticated USING (
   tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
-  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
+  OR is_super_admin()
 );

 CREATE POLICY "Requisitos plataforma tenant access" ON requisitos_plataforma FOR ALL TO authenticated USING (
   tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
-  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
+  OR is_super_admin()
 );

 CREATE POLICY "Mapping templates tenant access" ON mapping_templates FOR ALL TO authenticated USING (
   tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
-  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
+  OR is_super_admin()
 );

 CREATE POLICY "Adaptadores tenant access" ON adaptadores FOR ALL TO authenticated USING (
   tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
-  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
+  OR is_super_admin()
 );

 CREATE POLICY "Jobs integracion tenant access" ON jobs_integracion FOR ALL TO authenticated USING (
   tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
-  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
+  OR is_super_admin()
 );

 CREATE POLICY "Suscripciones tenant access" ON suscripciones FOR ALL TO authenticated USING (
   tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
-  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
+  OR is_super_admin()
 );

 CREATE POLICY "Auditoria tenant access" ON auditoria FOR ALL TO authenticated USING (
   tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
-  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
+  OR is_super_admin()
 );

 CREATE POLICY "Mensajes tenant access" ON mensajes FOR ALL TO authenticated USING (
   tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
-  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
+  OR is_super_admin()
 );

 CREATE POLICY "Reportes tenant access" ON reportes FOR ALL TO authenticated USING (
   tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
-  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
+  OR is_super_admin()
 );

 CREATE POLICY "Token transactions tenant access" ON token_transactions FOR ALL TO authenticated USING (
   tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
-  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
+  OR is_super_admin()
 );

 CREATE POLICY "Checkout providers tenant access" ON checkout_providers FOR ALL TO authenticated USING (
   tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
-  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
+  OR is_super_admin()
 );

 CREATE POLICY "Mandatos SEPA tenant access" ON mandatos_sepa FOR ALL TO authenticated USING (
   tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
-  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
+  OR is_super_admin()
 );

 CREATE POLICY "Manual upload queue tenant access" ON manual_upload_queue FOR ALL TO authenticated USING (
   tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
-  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
+  OR is_super_admin()
 );