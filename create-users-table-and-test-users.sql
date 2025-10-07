/*
  # Create Users Table and Test Users

  1. Purpose
    - Create the users table that's missing from the schema
    - Add test users for development and testing
    - Cliente user for /client routes testing
    - SuperAdmin user for /admin routes testing

  2. Users Table Structure
    - Links to Supabase Auth users via auth.users
    - Multi-tenant support via tenant_id
    - Role-based access control
    - User profile information

  3. Test Users Created
    - **Cliente User**
      - Email: cliente@constructia.com
      - Password: password123
      - Role: Cliente

    - **Admin User**
      - Email: admin@constructia.com
      - Password: superadmin123
      - Role: SuperAdmin

  4. Security
    - RLS enabled on users table
    - Policies enforce proper access control
    - Passwords securely hashed by Supabase Auth
*/

-- ============================================
-- STEP 1: CREATE USERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  email text NOT NULL,
  name text,
  role user_role NOT NULL,
  active boolean DEFAULT true,
  password_hash text,
  last_login_ip text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id, email)
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_tenant_email ON public.users(tenant_id, email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- ============================================
-- STEP 2: CREATE RLS POLICIES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "SuperAdmin can read all users" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "SuperAdmin can manage all users" ON public.users;

-- Users can read their own data
CREATE POLICY "Users can read own data"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- SuperAdmin can read all users
CREATE POLICY "SuperAdmin can read all users"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'SuperAdmin'
    )
  );

-- Users can update their own data
CREATE POLICY "Users can update own data"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- SuperAdmin can manage all users
CREATE POLICY "SuperAdmin can manage all users"
  ON public.users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'SuperAdmin'
    )
  );

-- ============================================
-- STEP 3: CREATE TEST USERS
-- ============================================

DO $$
DECLARE
  cliente_user_id uuid;
  admin_user_id uuid;
BEGIN
  -- Create cliente user in Supabase Auth
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    aud,
    role,
    confirmation_token,
    email_change_token_new,
    recovery_token
  )
  SELECT
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'cliente@constructia.com',
    crypt('password123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"Cliente de Prueba"}'::jsonb,
    'authenticated',
    'authenticated',
    '',
    '',
    ''
  WHERE NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'cliente@constructia.com'
  )
  RETURNING id INTO cliente_user_id;

  -- Get the user ID if it already exists
  IF cliente_user_id IS NULL THEN
    SELECT id INTO cliente_user_id FROM auth.users WHERE email = 'cliente@constructia.com';
  END IF;

  -- Create admin user in Supabase Auth
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    aud,
    role,
    confirmation_token,
    email_change_token_new,
    recovery_token
  )
  SELECT
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'admin@constructia.com',
    crypt('superadmin123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"Administrador"}'::jsonb,
    'authenticated',
    'authenticated',
    '',
    '',
    ''
  WHERE NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'admin@constructia.com'
  )
  RETURNING id INTO admin_user_id;

  -- Get the user ID if it already exists
  IF admin_user_id IS NULL THEN
    SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@constructia.com';
  END IF;

  -- Create profile record in users table for cliente
  IF cliente_user_id IS NOT NULL THEN
    INSERT INTO public.users (
      id,
      tenant_id,
      email,
      name,
      role,
      active
    )
    VALUES (
      cliente_user_id,
      '10000000-0000-0000-0000-000000000001',
      'cliente@constructia.com',
      'Cliente de Prueba',
      'Cliente',
      true
    )
    ON CONFLICT (tenant_id, email) DO UPDATE
    SET
      name = EXCLUDED.name,
      role = EXCLUDED.role,
      active = EXCLUDED.active,
      updated_at = now();

    RAISE NOTICE '✅ Cliente user created: cliente@constructia.com';
  END IF;

  -- Create profile record in users table for admin
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO public.users (
      id,
      tenant_id,
      email,
      name,
      role,
      active
    )
    VALUES (
      admin_user_id,
      '10000000-0000-0000-0000-000000000001',
      'admin@constructia.com',
      'Administrador',
      'SuperAdmin',
      true
    )
    ON CONFLICT (tenant_id, email) DO UPDATE
    SET
      name = EXCLUDED.name,
      role = EXCLUDED.role,
      active = EXCLUDED.active,
      updated_at = now();

    RAISE NOTICE '✅ Admin user created: admin@constructia.com';
  END IF;

  -- ============================================
  -- STEP 4: CREATE IDENTITIES FOR AUTH
  -- ============================================

  -- Create identity for cliente user
  IF cliente_user_id IS NOT NULL THEN
    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    )
    SELECT
      gen_random_uuid(),
      cliente_user_id,
      jsonb_build_object(
        'sub', cliente_user_id::text,
        'email', 'cliente@constructia.com'
      ),
      'email',
      now(),
      now(),
      now()
    WHERE NOT EXISTS (
      SELECT 1 FROM auth.identities
      WHERE user_id = cliente_user_id AND provider = 'email'
    );
  END IF;

  -- Create identity for admin user
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    )
    SELECT
      gen_random_uuid(),
      admin_user_id,
      jsonb_build_object(
        'sub', admin_user_id::text,
        'email', 'admin@constructia.com'
      ),
      'email',
      now(),
      now(),
      now()
    WHERE NOT EXISTS (
      SELECT 1 FROM auth.identities
      WHERE user_id = admin_user_id AND provider = 'email'
    );
  END IF;

  -- Log success
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Users table and test users created successfully!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Cliente Login:';
  RAISE NOTICE '  Email: cliente@constructia.com';
  RAISE NOTICE '  Password: password123';
  RAISE NOTICE '  Access: /client routes';
  RAISE NOTICE '';
  RAISE NOTICE 'Admin Login:';
  RAISE NOTICE '  Email: admin@constructia.com';
  RAISE NOTICE '  Password: superadmin123';
  RAISE NOTICE '  Access: /admin routes';
  RAISE NOTICE '========================================';

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Error: %', SQLERRM;
    RAISE EXCEPTION 'Failed to create users: %', SQLERRM;
END $$;
