/*
  # Insert Development Client Records

  1. New Records
    - Insert development client record with ID `a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11`
    - Insert development admin client record with ID `b1c2d3e4-f5a6-7890-1234-567890abcdef`
    - Both records match the mock data used in `getCurrentClientData()` function

  2. Purpose
    - Fixes foreign key constraint violation when creating receipts
    - Ensures development environment has proper client records
    - Matches existing mock user IDs from AuthContext

  3. Data Consistency
    - Uses same IDs and data as defined in `src/lib/supabase.ts`
    - Ensures foreign key relationships work correctly
*/

-- Insert development client record
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
  obralia_credentials
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
  '{"configured": false}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Insert development admin client record
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
  obralia_credentials
) VALUES (
  'b1c2d3e4-f5a6-7890-1234-567890abcdef',
  'dev-admin-001',
  'ADM-001',
  'Constructia Admin',
  'Administrador',
  'admin@constructia.com',
  '+34 900 000 000',
  'Oficina Central, Madrid',
  'enterprise',
  'active',
  0,
  10737418240,
  0,
  1000,
  '{"configured": true, "username": "admin_obralia", "password": "admin_pass"}'::jsonb
) ON CONFLICT (id) DO NOTHING;