/*
  # Create Test Users for ConstructIA

  1. Test Users
    - Admin user: admin@constructia.com / superadmin123
    - Client user: cliente@test.com / password123

  2. Security
    - Users created in auth.users table
    - Corresponding entries in public.users with correct roles
    - Email confirmation bypassed for testing

  3. Important Notes
    - These are test users for development
    - Passwords are hashed using Supabase's auth system
    - UUIDs are generated deterministically for consistency
*/

-- Insert admin user into auth.users
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  role,
  aud,
  confirmation_token,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'admin@constructia.com',
  crypt('superadmin123', gen_salt('bf')),
  now(),
  now(),
  now(),
  'authenticated',
  'authenticated',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- Insert client user into auth.users
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  role,
  aud,
  confirmation_token,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000002'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'cliente@test.com',
  crypt('password123', gen_salt('bf')),
  now(),
  now(),
  now(),
  'authenticated',
  'authenticated',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- Insert admin user into public.users
INSERT INTO public.users (
  id,
  email,
  role,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'admin@constructia.com',
  'admin',
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- Insert client user into public.users
INSERT INTO public.users (
  id,
  email,
  role,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000002'::uuid,
  'cliente@test.com',
  'client',
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- Create a test client record for the client user
INSERT INTO public.clients (
  id,
  user_id,
  client_id,
  company_name,
  contact_name,
  email,
  phone,
  address,
  subscription_plan,
  subscription_status,
  storage_used,
  storage_limit,
  documents_processed,
  tokens_available,
  obralia_credentials,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000002'::uuid,
  '2024-REC-0001',
  'Empresa de Prueba S.L.',
  'Cliente de Prueba',
  'cliente@test.com',
  '+34 91 123 45 67',
  'Calle de Prueba 123, Madrid',
  'professional',
  'active',
  0,
  1000,
  0,
  1000,
  jsonb_build_object(
    'username', 'obralia_test_user',
    'password', 'obralia_test_pass',
    'configured', false
  ),
  now(),
  now()
) ON CONFLICT (user_id) DO NOTHING;