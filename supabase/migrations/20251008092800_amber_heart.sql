@@ .. @@
-- Crear políticas
CREATE POLICY "SuperAdmin can access all tenants" ON tenants FOR ALL TO authenticated USING (
-  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'SuperAdmin')
+  auth.uid() = '20000000-0000-0000-0000-000000000001'::uuid
);

-CREATE POLICY "Users can access own tenant data" ON users FOR ALL TO authenticated USING (
-  tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
-  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
-);
+-- Users table policies - simplified to avoid recursion
+CREATE POLICY "Users can view own profile" ON users FOR SELECT TO authenticated USING (
+  id = auth.uid()
+);
+
+CREATE POLICY "SuperAdmin can view all users" ON users FOR SELECT TO authenticated USING (
+  auth.uid() = '20000000-0000-0000-0000-000000000001'::uuid
+);
+
+CREATE POLICY "Users can update own profile" ON users FOR UPDATE TO authenticated USING (
+  id = auth.uid()
+) WITH CHECK (id = auth.uid());
+
+CREATE POLICY "SuperAdmin can manage all users" ON users FOR ALL TO authenticated USING (
+  auth.uid() = '20000000-0000-0000-0000-000000000001'::uuid
+) WITH CHECK (auth.uid() = '20000000-0000-0000-0000-000000000001'::uuid);

CREATE POLICY "Empresas tenant access" ON empresas FOR ALL TO authenticated USING (
-  tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
-  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
+  auth.uid() = '20000000-0000-0000-0000-000000000001'::uuid
+  OR tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
);

CREATE POLICY "Obras tenant access" ON obras FOR ALL TO authenticated USING (
-  tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
-  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
+  auth.uid() = '20000000-0000-0000-0000-000000000001'::uuid
+  OR tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
);

CREATE POLICY "Proveedores tenant access" ON proveedores FOR ALL TO authenticated USING (
-  tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
-  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
+  auth.uid() = '20000000-0000-0000-0000-000000000001'::uuid
+  OR tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
);

CREATE POLICY "Trabajadores tenant access" ON trabajadores FOR ALL TO authenticated USING (
-  tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
-  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
+  auth.uid() = '20000000-0000-0000-0000-000000000001'::uuid
+  OR tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
);

CREATE POLICY "Maquinaria tenant access" ON maquinaria FOR ALL TO authenticated USING (
-  tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
-  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
+  auth.uid() = '20000000-0000-0000-0000-000000000001'::uuid
+  OR tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
);

CREATE POLICY "Documentos tenant access" ON documentos FOR ALL TO authenticated USING (
-  tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
-  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
+  auth.uid() = '20000000-0000-0000-0000-000000000001'::uuid
+  OR tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
);

CREATE POLICY "Tareas tenant access" ON tareas FOR ALL TO authenticated USING (
-  tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
-  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
+  auth.uid() = '20000000-0000-0000-0000-000000000001'::uuid
+  OR tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
);

CREATE POLICY "Requisitos plataforma tenant access" ON requisitos_plataforma FOR ALL TO authenticated USING (
-  tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
-  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
+  auth.uid() = '20000000-0000-0000-0000-000000000001'::uuid
+  OR tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
);

CREATE POLICY "Mapping templates tenant access" ON mapping_templates FOR ALL TO authenticated USING (
-  tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
-  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
+  auth.uid() = '20000000-0000-0000-0000-000000000001'::uuid
+  OR tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
);

CREATE POLICY "Adaptadores tenant access" ON adaptadores FOR ALL TO authenticated USING (
-  tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
-  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
+  auth.uid() = '20000000-0000-0000-0000-000000000001'::uuid
+  OR tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
);

CREATE POLICY "Jobs integracion tenant access" ON jobs_integracion FOR ALL TO authenticated USING (
-  tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
-  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
+  auth.uid() = '20000000-0000-0000-0000-000000000001'::uuid
+  OR tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
);

CREATE POLICY "Suscripciones tenant access" ON suscripciones FOR ALL TO authenticated USING (
-  tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
-  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
+  auth.uid() = '20000000-0000-0000-0000-000000000001'::uuid
+  OR tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
);

CREATE POLICY "Auditoria tenant access" ON auditoria FOR ALL TO authenticated USING (
-  tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
-  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
+  auth.uid() = '20000000-0000-0000-0000-000000000001'::uuid
+  OR tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
);

CREATE POLICY "Mensajes tenant access" ON mensajes FOR ALL TO authenticated USING (
-  tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
-  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
+  auth.uid() = '20000000-0000-0000-0000-000000000001'::uuid
+  OR tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
);

CREATE POLICY "Reportes tenant access" ON reportes FOR ALL TO authenticated USING (
-  tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
-  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
+  auth.uid() = '20000000-0000-0000-0000-000000000001'::uuid
+  OR tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
);

CREATE POLICY "Token transactions tenant access" ON token_transactions FOR ALL TO authenticated USING (
-  tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
-  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
+  auth.uid() = '20000000-0000-0000-0000-000000000001'::uuid
+  OR tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
);

CREATE POLICY "Checkout providers tenant access" ON checkout_providers FOR ALL TO authenticated USING (
-  tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
-  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
+  auth.uid() = '20000000-0000-0000-0000-000000000001'::uuid
+  OR tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
);

CREATE POLICY "Mandatos SEPA tenant access" ON mandatos_sepa FOR ALL TO authenticated USING (
-  tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
-  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
+  auth.uid() = '20000000-0000-0000-0000-000000000001'::uuid
+  OR tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
);

CREATE POLICY "Manual upload queue tenant access" ON manual_upload_queue FOR ALL TO authenticated USING (
-  tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
-  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin')
+  auth.uid() = '20000000-0000-0000-0000-000000000001'::uuid
+  OR tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
);