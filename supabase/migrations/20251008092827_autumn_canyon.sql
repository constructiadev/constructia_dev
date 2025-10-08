@@ .. @@
-- Tenants: Only SuperAdmin can access all tenants
CREATE POLICY "SuperAdmin can access all tenants"
  ON tenants FOR ALL TO authenticated
  USING (
-    EXISTS (
-      SELECT 1 FROM users
-      WHERE users.id = auth.uid()
-      AND users.role = 'SuperAdmin'
-    )
+    auth.uid() = '20000000-0000-0000-0000-000000000001'::uuid
  );

--- Users: Access own tenant data or SuperAdmin access
-CREATE POLICY "Users can access own tenant data"
-  ON users FOR ALL TO authenticated
+-- Users: Separate policies to avoid recursion
+CREATE POLICY "Users can view own profile"
+  ON users FOR SELECT TO authenticated
   USING (
-    tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
-    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
+    id = auth.uid()
+  );
+
+CREATE POLICY "SuperAdmin can view all users"
+  ON users FOR SELECT TO authenticated
+  USING (
+    auth.uid() = '20000000-0000-0000-0000-000000000001'::uuid
+  );
+
+CREATE POLICY "Users can update own profile"
+  ON users FOR UPDATE TO authenticated
+  USING (
+    id = auth.uid()
+  )
+  WITH CHECK (
+    id = auth.uid()
+  );
+
+CREATE POLICY "SuperAdmin can manage all users"
+  ON users FOR ALL TO authenticated
+  USING (
+    auth.uid() = '20000000-0000-0000-0000-000000000001'::uuid
+  )
+  WITH CHECK (
+    auth.uid() = '20000000-0000-0000-0000-000000000001'::uuid
   );

-- Empresas: Tenant-based access
CREATE POLICY "Empresas tenant access"
  ON empresas FOR ALL TO authenticated
  USING (
-    tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
-    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
+    auth.uid() = '20000000-0000-0000-0000-000000000001'::uuid
+    OR tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
   );

-- Obras: Tenant-based access
CREATE POLICY "Obras tenant access"
  ON obras FOR ALL TO authenticated
  USING (
-    tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
-    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
+    auth.uid() = '20000000-0000-0000-0000-000000000001'::uuid
+    OR tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
   );

-- Proveedores: Tenant-based access
CREATE POLICY "Proveedores tenant access"
  ON proveedores FOR ALL TO authenticated
  USING (
-    tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
-    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
+    auth.uid() = '20000000-0000-0000-0000-000000000001'::uuid
+    OR tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
   );

-- Trabajadores: Tenant-based access
CREATE POLICY "Trabajadores tenant access"
  ON trabajadores FOR ALL TO authenticated
  USING (
-    tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
-    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
+    auth.uid() = '20000000-0000-0000-0000-000000000001'::uuid
+    OR tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
   );

-- Maquinaria: Tenant-based access
CREATE POLICY "Maquinaria tenant access"
  ON maquinaria FOR ALL TO authenticated
  USING (
-    tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
-    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
+    auth.uid() = '20000000-0000-0000-0000-000000000001'::uuid
+    OR tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
   );

-- Documentos: Tenant-based access
CREATE POLICY "Documentos tenant access"
  ON documentos FOR ALL TO authenticated
  USING (
-    tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
-    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
+    auth.uid() = '20000000-0000-0000-0000-000000000001'::uuid
+    OR tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
   );

-- Tareas: Tenant-based access
CREATE POLICY "Tareas tenant access"
  ON tareas FOR ALL TO authenticated
  USING (
-    tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
-    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
+    auth.uid() = '20000000-0000-0000-0000-000000000001'::uuid
+    OR tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
   );

-- Requisitos plataforma: Tenant-based access
CREATE POLICY "Requisitos plataforma tenant access"
  ON requisitos_plataforma FOR ALL TO authenticated
  USING (
-    tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
-    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
+    auth.uid() = '20000000-0000-0000-0000-000000000001'::uuid
+    OR tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
   );

-- Mapping templates: Tenant-based access
CREATE POLICY "Mapping templates tenant access"
  ON mapping_templates FOR ALL TO authenticated
  USING (
-    tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
-    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
+    auth.uid() = '20000000-0000-0000-0000-000000000001'::uuid
+    OR tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
   );

-- Adaptadores: Tenant-based access
CREATE POLICY "Adaptadores tenant access"
  ON adaptadores FOR ALL TO authenticated
  USING (
-    tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
-    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
+    auth.uid() = '20000000-0000-0000-0000-000000000001'::uuid
+    OR tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
   );

-- Jobs integracion: Tenant-based access
CREATE POLICY "Jobs integracion tenant access"
  ON jobs_integracion FOR ALL TO authenticated
  USING (
-    tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
-    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
+    auth.uid() = '20000000-0000-0000-0000-000000000001'::uuid
+    OR tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
   );

-- Suscripciones: Tenant-based access
CREATE POLICY "Suscripciones tenant access"
  ON suscripciones FOR ALL TO authenticated
  USING (
-    tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
-    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
+    auth.uid() = '20000000-0000-0000-0000-000000000001'::uuid
+    OR tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
   );

-- Auditoria: Tenant-based access
CREATE POLICY "Auditoria tenant access"
  ON auditoria FOR ALL TO authenticated
  USING (
-    tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
-    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
+    auth.uid() = '20000000-0000-0000-0000-000000000001'::uuid
+    OR tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
   );

-- Mensajes: Tenant-based access
CREATE POLICY "Mensajes tenant access"
  ON mensajes FOR ALL TO authenticated
  USING (
-    tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
-    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
+    auth.uid() = '20000000-0000-0000-0000-000000000001'::uuid
+    OR tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
   );

-- Reportes: Tenant-based access
CREATE POLICY "Reportes tenant access"
  ON reportes FOR ALL TO authenticated
  USING (
-    tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
-    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
+    auth.uid() = '20000000-0000-0000-0000-000000000001'::uuid
+    OR tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
   );

-- Token transactions: Tenant-based access
CREATE POLICY "Token transactions tenant access"
  ON token_transactions FOR ALL TO authenticated
  USING (
-    tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
-    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
+    auth.uid() = '20000000-0000-0000-0000-000000000001'::uuid
+    OR tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
   );

-- Checkout providers: Tenant-based access
CREATE POLICY "Checkout providers tenant access"
  ON checkout_providers FOR ALL TO authenticated
  USING (
-    tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
-    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
+    auth.uid() = '20000000-0000-0000-0000-000000000001'::uuid
+    OR tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
   );

-- Mandatos SEPA: Tenant-based access
CREATE POLICY "Mandatos SEPA tenant access"
  ON mandatos_sepa FOR ALL TO authenticated
  USING (
-    tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
-    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
+    auth.uid() = '20000000-0000-0000-0000-000000000001'::uuid
+    OR tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
   );

-- Manual upload queue: Tenant-based access
CREATE POLICY "Manual upload queue tenant access"
  ON manual_upload_queue FOR ALL TO authenticated
  USING (
-    tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
-    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
+    auth.uid() = '20000000-0000-0000-0000-000000000001'::uuid
+    OR tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
   );