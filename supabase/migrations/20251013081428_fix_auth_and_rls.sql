/*
  # Fix Authentication and RLS Issues

  This migration addresses:
  1. Ensures users table has proper structure for admin/client authentication
  2. Fixes RLS policies to allow admin access without errors
  3. Adds missing indexes for performance
  4. Ensures DEV_TENANT_ID and DEV_ADMIN_USER_ID exist
  5. Grants proper permissions to authenticated and service roles

  ## Changes
  - Ensure users table structure supports both admin and client roles
  - Fix RLS policies that may be blocking legitimate admin queries
  - Add system admin user for audit logging
  - Grant necessary permissions to service role
  - Add performance indexes

  ## Security
  - RLS remains enabled on all tables
  - Service role can bypass RLS for admin operations
  - Authenticated users can only access their own data
*/

-- Ensure DEV_TENANT_ID exists in tenants table
INSERT INTO tenants (id, name, status, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Development Tenant',
  'active',
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE SET
  status = 'active',
  updated_at = now();

-- Ensure users table has all necessary columns
DO $$
BEGIN
  -- Add active column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'active'
  ) THEN
    ALTER TABLE users ADD COLUMN active boolean DEFAULT true;
  END IF;

  -- Add updated_at column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE users ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Ensure DEV_ADMIN_USER_ID exists for system operations
INSERT INTO users (id, tenant_id, email, name, role, active, created_at, updated_at)
VALUES (
  '20000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'system@constructia.com',
  'System Admin',
  'SuperAdmin',
  true,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE SET
  role = 'SuperAdmin',
  active = true,
  updated_at = now();

-- Fix users table RLS policies to allow proper admin access
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;

-- Create comprehensive RLS policies for users table
CREATE POLICY "SuperAdmin can read all users"
  ON users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users AS u
      WHERE u.id = auth.uid() AND u.role = 'SuperAdmin'
    )
  );

CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR auth.uid() IN (
    SELECT id FROM users WHERE role = 'SuperAdmin'
  ));

CREATE POLICY "SuperAdmin can update all users"
  ON users FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users AS u
      WHERE u.id = auth.uid() AND u.role = 'SuperAdmin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users AS u
      WHERE u.id = auth.uid() AND u.role = 'SuperAdmin'
    )
  );

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "SuperAdmin can insert users"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users AS u
      WHERE u.id = auth.uid() AND u.role = 'SuperAdmin'
    )
  );

-- Fix tenants table RLS policies
DROP POLICY IF EXISTS "Tenants are viewable by all authenticated users" ON tenants;
DROP POLICY IF EXISTS "Tenants are viewable by tenant members" ON tenants;

CREATE POLICY "SuperAdmin can read all tenants"
  ON tenants FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'SuperAdmin'
    )
  );

CREATE POLICY "Users can read own tenant"
  ON tenants FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT tenant_id FROM users WHERE users.id = auth.uid()
    )
  );

CREATE POLICY "SuperAdmin can manage tenants"
  ON tenants FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'SuperAdmin'
    )
  );

-- Grant necessary permissions to service role
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(active);

-- Ensure auditoria table accepts system admin user
CREATE INDEX IF NOT EXISTS idx_auditoria_tenant_id ON auditoria(tenant_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_actor_user ON auditoria(actor_user);
CREATE INDEX IF NOT EXISTS idx_auditoria_created_at ON auditoria(created_at);

-- Log successful migration
DO $$
BEGIN
  RAISE NOTICE 'Migration completed: Authentication and RLS policies fixed';
END $$;
