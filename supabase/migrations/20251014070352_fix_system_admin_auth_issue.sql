/*
  # Fix System Admin Authentication Issue

  ## Problem
  The system@constructia.com user exists in database but authentication fails with
  "Database error querying schema" error. This happens because:
  1. The auth.users entry might have incorrect metadata
  2. The handle_new_user trigger might be interfering
  3. RLS policies might be blocking auth queries

  ## Solution
  1. Update auth.users with correct metadata and confirmation status
  2. Ensure public.users entry is properly synced
  3. Set raw_app_meta_data to prevent trigger issues
  4. Force email confirmation

  ## Changes
  - Update auth.users with proper metadata
  - Reset password to ensure it works
  - Confirm email address
  - Set app metadata to bypass trigger logic
*/

-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Update auth.users entry with all necessary fields
UPDATE auth.users
SET
  encrypted_password = crypt('Superadmin123', gen_salt('bf')),
  email_confirmed_at = COALESCE(email_confirmed_at, now()),
  confirmation_sent_at = now(),
  raw_app_meta_data = jsonb_build_object(
    'provider', 'email',
    'providers', ARRAY['email'],
    'role', 'SuperAdmin',
    'is_super_admin', true
  ),
  raw_user_meta_data = jsonb_build_object(
    'name', 'System Admin',
    'role', 'SuperAdmin'
  ),
  updated_at = now(),
  last_sign_in_at = NULL,
  role = 'authenticated',
  aud = 'authenticated'
WHERE email = 'system@constructia.com';

-- Ensure the public.users entry is correct with authorization
DO $$
BEGIN
  -- Set authorization flag
  PERFORM set_config('app.allow_superadmin_creation', 'true', true);
  
  -- Upsert user profile
  INSERT INTO users (
    id,
    tenant_id,
    email,
    name,
    role,
    active,
    created_at,
    updated_at
  )
  SELECT
    id,
    '00000000-0000-0000-0000-000000000001',
    email,
    'System Admin',
    'SuperAdmin',
    true,
    created_at,
    now()
  FROM auth.users
  WHERE email = 'system@constructia.com'
  ON CONFLICT (id) DO UPDATE
  SET
    role = 'SuperAdmin',
    name = 'System Admin',
    active = true,
    tenant_id = '00000000-0000-0000-0000-000000000001',
    updated_at = now();
  
  -- Reset authorization flag
  PERFORM set_config('app.allow_superadmin_creation', 'false', true);
END $$;

-- Remove any potential orphaned sessions that might cause issues
DELETE FROM auth.sessions
WHERE user_id = '20000000-0000-0000-0000-000000000001';

-- Log the fix
INSERT INTO auditoria (
  tenant_id,
  actor_user,
  accion,
  entidad,
  entidad_id,
  detalles,
  ip,
  created_at
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000001',
  'ADMIN_AUTH_FIXED',
  'auth_users',
  '20000000-0000-0000-0000-000000000001',
  jsonb_build_object(
    'email', 'system@constructia.com',
    'action', 'fix_authentication',
    'password_reset', true,
    'metadata_updated', true,
    'sessions_cleared', true
  ),
  '127.0.0.1',
  now()
);

-- Verification output
DO $$
DECLARE
  v_auth_user record;
  v_public_user record;
BEGIN
  -- Get auth user details
  SELECT 
    id,
    email,
    email_confirmed_at IS NOT NULL as confirmed,
    encrypted_password IS NOT NULL as has_password,
    role as auth_role
  INTO v_auth_user
  FROM auth.users
  WHERE email = 'system@constructia.com';
  
  -- Get public user details
  SELECT 
    id,
    email,
    role,
    active
  INTO v_public_user
  FROM users
  WHERE email = 'system@constructia.com';
  
  -- Output results
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'SYSTEM ADMIN AUTHENTICATION FIX';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Email: system@constructia.com';
  RAISE NOTICE 'Password: Superadmin123';
  RAISE NOTICE '';
  RAISE NOTICE 'Auth User Status:';
  RAISE NOTICE '  ID: %', v_auth_user.id;
  RAISE NOTICE '  Email Confirmed: %', v_auth_user.confirmed;
  RAISE NOTICE '  Has Password: %', v_auth_user.has_password;
  RAISE NOTICE '  Auth Role: %', v_auth_user.auth_role;
  RAISE NOTICE '';
  RAISE NOTICE 'Public User Status:';
  RAISE NOTICE '  ID: %', v_public_user.id;
  RAISE NOTICE '  Role: %', v_public_user.role;
  RAISE NOTICE '  Active: %', v_public_user.active;
  RAISE NOTICE '';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '  1. Go to /admin/login';
  RAISE NOTICE '  2. Enter: system@constructia.com';
  RAISE NOTICE '  3. Enter: Superadmin123';
  RAISE NOTICE '  4. Click "Acceder como Administrador"';
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Authentication should now work!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
END $$;
