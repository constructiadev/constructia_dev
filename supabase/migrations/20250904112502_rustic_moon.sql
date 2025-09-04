/*
  # Simplify Admin Roles to SuperAdmin Only

  1. Database Changes
    - Remove GestorDocumental, SupervisorObra, Proveedor, Lector from user_role enum
    - Keep only SuperAdmin, Cliente, ClienteDemo
    - Convert existing admin users to SuperAdmin
    - Update all policies to use SuperAdmin only

  2. Security
    - SuperAdmin has full privileges
    - SuperAdmin can create other SuperAdmin users
    - Client roles remain isolated to their tenant data
*/

-- Step 1: Convert all existing admin users to SuperAdmin
UPDATE users 
SET role = 'SuperAdmin' 
WHERE role IN ('GestorDocumental', 'SupervisorObra', 'Proveedor', 'Lector');

-- Step 2: Create new simplified enum
CREATE TYPE user_role_simplified AS ENUM ('SuperAdmin', 'Cliente', 'ClienteDemo');

-- Step 3: Update the column to use new enum
ALTER TABLE users ALTER COLUMN role TYPE user_role_simplified USING role::text::user_role_simplified;

-- Step 4: Drop old enum and rename new one
DROP TYPE user_role;
ALTER TYPE user_role_simplified RENAME TO user_role;

-- Step 5: Update all policies to use SuperAdmin only for admin access
DROP POLICY IF EXISTS "Empresas tenant access" ON empresas;
CREATE POLICY "Empresas tenant access" ON empresas
  FOR ALL TO authenticated
  USING (
    (tenant_id IN (SELECT users.tenant_id FROM users WHERE users.id = uid())) OR
    (EXISTS (SELECT 1 FROM users WHERE users.id = uid() AND users.role = 'SuperAdmin'))
  );

DROP POLICY IF EXISTS "Obras tenant access" ON obras;
CREATE POLICY "Obras tenant access" ON obras
  FOR ALL TO authenticated
  USING (
    (tenant_id IN (SELECT users.tenant_id FROM users WHERE users.id = uid())) OR
    (EXISTS (SELECT 1 FROM users WHERE users.id = uid() AND users.role = 'SuperAdmin'))
  );

DROP POLICY IF EXISTS "Documentos tenant access" ON documentos;
CREATE POLICY "Documentos tenant access" ON documentos
  FOR ALL TO authenticated
  USING (
    (tenant_id IN (SELECT users.tenant_id FROM users WHERE users.id = uid())) OR
    (EXISTS (SELECT 1 FROM users WHERE users.id = uid() AND users.role = 'SuperAdmin'))
  );

DROP POLICY IF EXISTS "Proveedores tenant access" ON proveedores;
CREATE POLICY "Proveedores tenant access" ON proveedores
  FOR ALL TO authenticated
  USING (
    (tenant_id IN (SELECT users.tenant_id FROM users WHERE users.id = uid())) OR
    (EXISTS (SELECT 1 FROM users WHERE users.id = uid() AND users.role = 'SuperAdmin'))
  );

DROP POLICY IF EXISTS "Trabajadores tenant access" ON trabajadores;
CREATE POLICY "Trabajadores tenant access" ON trabajadores
  FOR ALL TO authenticated
  USING (
    (tenant_id IN (SELECT users.tenant_id FROM users WHERE users.id = uid())) OR
    (EXISTS (SELECT 1 FROM users WHERE users.id = uid() AND users.role = 'SuperAdmin'))
  );

DROP POLICY IF EXISTS "Maquinaria tenant access" ON maquinaria;
CREATE POLICY "Maquinaria tenant access" ON maquinaria
  FOR ALL TO authenticated
  USING (
    (tenant_id IN (SELECT users.tenant_id FROM users WHERE users.id = uid())) OR
    (EXISTS (SELECT 1 FROM users WHERE users.id = uid() AND users.role = 'SuperAdmin'))
  );

DROP POLICY IF EXISTS "Tareas tenant access" ON tareas;
CREATE POLICY "Tareas tenant access" ON tareas
  FOR ALL TO authenticated
  USING (
    (tenant_id IN (SELECT users.tenant_id FROM users WHERE users.id = uid())) OR
    (EXISTS (SELECT 1 FROM users WHERE users.id = uid() AND users.role = 'SuperAdmin'))
  );

DROP POLICY IF EXISTS "Auditoria tenant access" ON auditoria;
CREATE POLICY "Auditoria tenant access" ON auditoria
  FOR ALL TO authenticated
  USING (
    (tenant_id IN (SELECT users.tenant_id FROM users WHERE users.id = uid())) OR
    (EXISTS (SELECT 1 FROM users WHERE users.id = uid() AND users.role = 'SuperAdmin'))
  );

DROP POLICY IF EXISTS "Mensajes tenant access" ON mensajes;
CREATE POLICY "Mensajes tenant access" ON mensajes
  FOR ALL TO authenticated
  USING (
    (tenant_id IN (SELECT users.tenant_id FROM users WHERE users.id = uid())) OR
    (EXISTS (SELECT 1 FROM users WHERE users.id = uid() AND users.role = 'SuperAdmin'))
  );

DROP POLICY IF EXISTS "Reportes tenant access" ON reportes;
CREATE POLICY "Reportes tenant access" ON reportes
  FOR ALL TO authenticated
  USING (
    (tenant_id IN (SELECT users.tenant_id FROM users WHERE users.id = uid())) OR
    (EXISTS (SELECT 1 FROM users WHERE users.id = uid() AND users.role = 'SuperAdmin'))
  );

DROP POLICY IF EXISTS "Suscripciones tenant access" ON suscripciones;
CREATE POLICY "Suscripciones tenant access" ON suscripciones
  FOR ALL TO authenticated
  USING (
    (tenant_id IN (SELECT users.tenant_id FROM users WHERE users.id = uid())) OR
    (EXISTS (SELECT 1 FROM users WHERE users.id = uid() AND users.role = 'SuperAdmin'))
  );

DROP POLICY IF EXISTS "Adaptadores tenant access" ON adaptadores;
CREATE POLICY "Adaptadores tenant access" ON adaptadores
  FOR ALL TO authenticated
  USING (
    (tenant_id IN (SELECT users.tenant_id FROM users WHERE users.id = uid())) OR
    (EXISTS (SELECT 1 FROM users WHERE users.id = uid() AND users.role = 'SuperAdmin'))
  );

DROP POLICY IF EXISTS "Jobs integracion tenant access" ON jobs_integracion;
CREATE POLICY "Jobs integracion tenant access" ON jobs_integracion
  FOR ALL TO authenticated
  USING (
    (tenant_id IN (SELECT users.tenant_id FROM users WHERE users.id = uid())) OR
    (EXISTS (SELECT 1 FROM users WHERE users.id = uid() AND users.role = 'SuperAdmin'))
  );

DROP POLICY IF EXISTS "Mapping templates tenant access" ON mapping_templates;
CREATE POLICY "Mapping templates tenant access" ON mapping_templates
  FOR ALL TO authenticated
  USING (
    (tenant_id IN (SELECT users.tenant_id FROM users WHERE users.id = uid())) OR
    (EXISTS (SELECT 1 FROM users WHERE users.id = uid() AND users.role = 'SuperAdmin'))
  );

DROP POLICY IF EXISTS "Requisitos plataforma tenant access" ON requisitos_plataforma;
CREATE POLICY "Requisitos plataforma tenant access" ON requisitos_plataforma
  FOR ALL TO authenticated
  USING (
    (tenant_id IN (SELECT users.tenant_id FROM users WHERE users.id = uid())) OR
    (EXISTS (SELECT 1 FROM users WHERE users.id = uid() AND users.role = 'SuperAdmin'))
  );

DROP POLICY IF EXISTS "Token transactions tenant access" ON token_transactions;
CREATE POLICY "Token transactions tenant access" ON token_transactions
  FOR ALL TO authenticated
  USING (
    (tenant_id IN (SELECT users.tenant_id FROM users WHERE users.id = uid())) OR
    (EXISTS (SELECT 1 FROM users WHERE users.id = uid() AND users.role = 'SuperAdmin'))
  );

DROP POLICY IF EXISTS "Checkout providers tenant access" ON checkout_providers;
CREATE POLICY "Checkout providers tenant access" ON checkout_providers
  FOR ALL TO authenticated
  USING (
    (tenant_id IN (SELECT users.tenant_id FROM users WHERE users.id = uid())) OR
    (EXISTS (SELECT 1 FROM users WHERE users.id = uid() AND users.role = 'SuperAdmin'))
  );

DROP POLICY IF EXISTS "Mandatos SEPA tenant access" ON mandatos_sepa;
CREATE POLICY "Mandatos SEPA tenant access" ON mandatos_sepa
  FOR ALL TO authenticated
  USING (
    (tenant_id IN (SELECT users.tenant_id FROM users WHERE users.id = uid())) OR
    (EXISTS (SELECT 1 FROM users WHERE users.id = uid() AND users.role = 'SuperAdmin'))
  );

DROP POLICY IF EXISTS "Manual upload queue tenant access" ON manual_upload_queue;
CREATE POLICY "Manual upload queue tenant access" ON manual_upload_queue
  FOR ALL TO authenticated
  USING (
    (tenant_id IN (SELECT users.tenant_id FROM users WHERE users.id = uid())) OR
    (EXISTS (SELECT 1 FROM users WHERE users.id = uid() AND users.role = 'SuperAdmin'))
  );

-- Step 6: Add policy for SuperAdmin to create other SuperAdmin users
CREATE POLICY "SuperAdmin can create users" ON users
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE users.id = uid() AND users.role = 'SuperAdmin')
  );

CREATE POLICY "SuperAdmin can update users" ON users
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = uid() AND users.role = 'SuperAdmin')
  );

CREATE POLICY "SuperAdmin can delete users" ON users
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = uid() AND users.role = 'SuperAdmin')
  );