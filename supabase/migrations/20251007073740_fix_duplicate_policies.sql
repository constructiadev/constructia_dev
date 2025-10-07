/*
  # Fix Duplicate RLS Policies Issue

  1. Purpose
    - Resolve the "policy already exists" error when running migrations
    - Ensure all RLS policies are idempotent and can be safely re-applied
    - Clean up duplicate policy definitions across migration files

  2. Changes
    - Drop existing policies if they exist before recreating them
    - Use IF EXISTS clauses to make operations idempotent
    - Recreate all tenant-based RLS policies with proper structure

  3. Security
    - Maintain strict tenant isolation
    - Preserve SuperAdmin global access across all tenants
    - Ensure authenticated users can only access their tenant data

  4. Important Notes
    - This migration is safe to run multiple times
    - All existing policies will be dropped and recreated
    - No data will be lost, only policy definitions are affected
*/

-- Drop all existing RLS policies on tenants table if they exist
DROP POLICY IF EXISTS "SuperAdmin can access all tenants" ON tenants;
DROP POLICY IF EXISTS "Tenants read access" ON tenants;
DROP POLICY IF EXISTS "Tenants write access" ON tenants;

-- Drop all existing RLS policies on users table if they exist
DROP POLICY IF EXISTS "Users can access own tenant data" ON users;
DROP POLICY IF EXISTS "Users read own tenant" ON users;
DROP POLICY IF EXISTS "Users write own tenant" ON users;

-- Drop all existing RLS policies on empresas table if they exist
DROP POLICY IF EXISTS "Empresas tenant access" ON empresas;
DROP POLICY IF EXISTS "Empresas read access" ON empresas;
DROP POLICY IF EXISTS "Empresas write access" ON empresas;

-- Drop all existing RLS policies on obras table if they exist
DROP POLICY IF EXISTS "Obras tenant access" ON obras;
DROP POLICY IF EXISTS "Obras read access" ON obras;
DROP POLICY IF EXISTS "Obras write access" ON obras;

-- Drop all existing RLS policies on proveedores table if they exist
DROP POLICY IF EXISTS "Proveedores tenant access" ON proveedores;
DROP POLICY IF EXISTS "Proveedores read access" ON proveedores;
DROP POLICY IF EXISTS "Proveedores write access" ON proveedores;

-- Drop all existing RLS policies on trabajadores table if they exist
DROP POLICY IF EXISTS "Trabajadores tenant access" ON trabajadores;
DROP POLICY IF EXISTS "Trabajadores read access" ON trabajadores;
DROP POLICY IF EXISTS "Trabajadores write access" ON trabajadores;

-- Drop all existing RLS policies on maquinaria table if they exist
DROP POLICY IF EXISTS "Maquinaria tenant access" ON maquinaria;
DROP POLICY IF EXISTS "Maquinaria read access" ON maquinaria;
DROP POLICY IF EXISTS "Maquinaria write access" ON maquinaria;

-- Drop all existing RLS policies on documentos table if they exist
DROP POLICY IF EXISTS "Documentos tenant access" ON documentos;
DROP POLICY IF EXISTS "Documentos read access" ON documentos;
DROP POLICY IF EXISTS "Documentos write access" ON documentos;

-- Drop all existing RLS policies on tareas table if they exist
DROP POLICY IF EXISTS "Tareas tenant access" ON tareas;
DROP POLICY IF EXISTS "Tareas read access" ON tareas;
DROP POLICY IF EXISTS "Tareas write access" ON tareas;

-- Drop all existing RLS policies on requisitos_plataforma table if they exist
DROP POLICY IF EXISTS "Requisitos plataforma tenant access" ON requisitos_plataforma;
DROP POLICY IF EXISTS "Requisitos read access" ON requisitos_plataforma;
DROP POLICY IF EXISTS "Requisitos write access" ON requisitos_plataforma;

-- Drop all existing RLS policies on mapping_templates table if they exist
DROP POLICY IF EXISTS "Mapping templates tenant access" ON mapping_templates;
DROP POLICY IF EXISTS "Mapping read access" ON mapping_templates;
DROP POLICY IF EXISTS "Mapping write access" ON mapping_templates;

-- Drop all existing RLS policies on adaptadores table if they exist
DROP POLICY IF EXISTS "Adaptadores tenant access" ON adaptadores;
DROP POLICY IF EXISTS "Adaptadores read access" ON adaptadores;
DROP POLICY IF EXISTS "Adaptadores write access" ON adaptadores;

-- Drop all existing RLS policies on jobs_integracion table if they exist
DROP POLICY IF EXISTS "Jobs integracion tenant access" ON jobs_integracion;
DROP POLICY IF EXISTS "Jobs read access" ON jobs_integracion;
DROP POLICY IF EXISTS "Jobs write access" ON jobs_integracion;

-- Drop all existing RLS policies on suscripciones table if they exist
DROP POLICY IF EXISTS "Suscripciones tenant access" ON suscripciones;
DROP POLICY IF EXISTS "Suscripciones read access" ON suscripciones;
DROP POLICY IF EXISTS "Suscripciones write access" ON suscripciones;

-- Drop all existing RLS policies on auditoria table if they exist
DROP POLICY IF EXISTS "Auditoria tenant access" ON auditoria;
DROP POLICY IF EXISTS "Auditoria read access" ON auditoria;
DROP POLICY IF EXISTS "Auditoria write access" ON auditoria;

-- Drop all existing RLS policies on mensajes table if they exist
DROP POLICY IF EXISTS "Mensajes tenant access" ON mensajes;
DROP POLICY IF EXISTS "Mensajes read access" ON mensajes;
DROP POLICY IF EXISTS "Mensajes write access" ON mensajes;

-- Drop all existing RLS policies on reportes table if they exist
DROP POLICY IF EXISTS "Reportes tenant access" ON reportes;
DROP POLICY IF EXISTS "Reportes read access" ON reportes;
DROP POLICY IF EXISTS "Reportes write access" ON reportes;

-- Drop all existing RLS policies on token_transactions table if they exist
DROP POLICY IF EXISTS "Token transactions tenant access" ON token_transactions;
DROP POLICY IF EXISTS "Token read access" ON token_transactions;
DROP POLICY IF EXISTS "Token write access" ON token_transactions;

-- Drop all existing RLS policies on checkout_providers table if they exist
DROP POLICY IF EXISTS "Checkout providers tenant access" ON checkout_providers;
DROP POLICY IF EXISTS "Checkout read access" ON checkout_providers;
DROP POLICY IF EXISTS "Checkout write access" ON checkout_providers;

-- Drop all existing RLS policies on mandatos_sepa table if they exist
DROP POLICY IF EXISTS "Mandatos SEPA tenant access" ON mandatos_sepa;
DROP POLICY IF EXISTS "Mandatos read access" ON mandatos_sepa;
DROP POLICY IF EXISTS "Mandatos write access" ON mandatos_sepa;

-- Drop all existing RLS policies on manual_upload_queue table if they exist
DROP POLICY IF EXISTS "Manual upload queue tenant access" ON manual_upload_queue;
DROP POLICY IF EXISTS "Manual queue read access" ON manual_upload_queue;
DROP POLICY IF EXISTS "Manual queue write access" ON manual_upload_queue;

-- ============================================================================
-- RECREATE ALL RLS POLICIES
-- ============================================================================

-- Tenants: Only SuperAdmin can access all tenants
CREATE POLICY "SuperAdmin can access all tenants"
  ON tenants
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'SuperAdmin'
    )
  );

-- Users: Access own tenant data or SuperAdmin access
CREATE POLICY "Users can access own tenant data"
  ON users
  FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'SuperAdmin'
    )
  );

-- Empresas: Tenant-based access
CREATE POLICY "Empresas tenant access"
  ON empresas
  FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'SuperAdmin'
    )
  );

-- Obras: Tenant-based access
CREATE POLICY "Obras tenant access"
  ON obras
  FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'SuperAdmin'
    )
  );

-- Proveedores: Tenant-based access
CREATE POLICY "Proveedores tenant access"
  ON proveedores
  FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'SuperAdmin'
    )
  );

-- Trabajadores: Tenant-based access
CREATE POLICY "Trabajadores tenant access"
  ON trabajadores
  FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'SuperAdmin'
    )
  );

-- Maquinaria: Tenant-based access
CREATE POLICY "Maquinaria tenant access"
  ON maquinaria
  FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'SuperAdmin'
    )
  );

-- Documentos: Tenant-based access
CREATE POLICY "Documentos tenant access"
  ON documentos
  FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'SuperAdmin'
    )
  );

-- Tareas: Tenant-based access
CREATE POLICY "Tareas tenant access"
  ON tareas
  FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'SuperAdmin'
    )
  );

-- Requisitos plataforma: Tenant-based access
CREATE POLICY "Requisitos plataforma tenant access"
  ON requisitos_plataforma
  FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'SuperAdmin'
    )
  );

-- Mapping templates: Tenant-based access
CREATE POLICY "Mapping templates tenant access"
  ON mapping_templates
  FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'SuperAdmin'
    )
  );

-- Adaptadores: Tenant-based access
CREATE POLICY "Adaptadores tenant access"
  ON adaptadores
  FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'SuperAdmin'
    )
  );

-- Jobs integracion: Tenant-based access
CREATE POLICY "Jobs integracion tenant access"
  ON jobs_integracion
  FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'SuperAdmin'
    )
  );

-- Suscripciones: Tenant-based access
CREATE POLICY "Suscripciones tenant access"
  ON suscripciones
  FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'SuperAdmin'
    )
  );

-- Auditoria: Tenant-based access
CREATE POLICY "Auditoria tenant access"
  ON auditoria
  FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'SuperAdmin'
    )
  );

-- Mensajes: Tenant-based access
CREATE POLICY "Mensajes tenant access"
  ON mensajes
  FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'SuperAdmin'
    )
  );

-- Reportes: Tenant-based access
CREATE POLICY "Reportes tenant access"
  ON reportes
  FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'SuperAdmin'
    )
  );

-- Token transactions: Tenant-based access
CREATE POLICY "Token transactions tenant access"
  ON token_transactions
  FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'SuperAdmin'
    )
  );

-- Checkout providers: Tenant-based access
CREATE POLICY "Checkout providers tenant access"
  ON checkout_providers
  FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'SuperAdmin'
    )
  );

-- Mandatos SEPA: Tenant-based access
CREATE POLICY "Mandatos SEPA tenant access"
  ON mandatos_sepa
  FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'SuperAdmin'
    )
  );

-- Manual upload queue: Tenant-based access
CREATE POLICY "Manual upload queue tenant access"
  ON manual_upload_queue
  FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'SuperAdmin'
    )
  );
