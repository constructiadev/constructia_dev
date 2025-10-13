/*
  # Create System Admin User in Supabase Auth

  This migration creates the system admin user (system@constructia.com)
  in both auth.users and public.users tables.

  ## Security
  - User is created with SuperAdmin role
  - User is associated with DEV_TENANT_ID
  - Password: Superadmin123

  ## Important
  This user is for administrative purposes only.
*/

-- First, check if the user exists in auth.users
-- If not, create it using Supabase's admin API
-- Note: This requires service_role key access

-- Create or update the system admin user in public.users table
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
  email = EXCLUDED.email,
  role = 'SuperAdmin',
  active = true,
  updated_at = now();

-- Log the migration
DO $$
BEGIN
  RAISE NOTICE 'System admin user entry created in users table';
  RAISE NOTICE 'IMPORTANT: You must create the auth.users entry manually via Supabase Dashboard';
  RAISE NOTICE 'Email: system@constructia.com';
  RAISE NOTICE 'Password: Superadmin123';
  RAISE NOTICE 'Go to: Authentication > Users > Add User';
END $$;
