/*
  # Insert development user and client records

  1. New Records
    - Insert development user with ID `dev-client-001`
    - Insert development client with ID `a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11`
    
  2. Purpose
    - Fix foreign key constraint violation when creating receipts
    - Ensure development environment has required test data
    
  3. Data Consistency
    - User ID matches what's used in AuthContext mock data
    - Client ID matches what's used in getCurrentClientData function
*/

-- Insert development user first (required for foreign key)
INSERT INTO users (
  id,
  email,
  role,
  created_at,
  updated_at
) VALUES (
  'dev-client-001',
  'cliente@test.com',
  'client',
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- Insert development client with the exact ID that's causing the error
INSERT INTO clients (
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
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'dev-client-001',
  'CLI-001',
  'Empresa de Prueba S.L.',
  'Cliente de Prueba',
  'cliente@test.com',
  '+34 600 000 000',
  'Calle Falsa 123, Madrid',
  'professional',
  'active',
  1048576,
  5368709120,
  25,
  750,
  '{"configured": false}'::jsonb,
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;