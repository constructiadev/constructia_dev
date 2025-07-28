/*
  # Create clients table

  1. New Tables
    - `clients`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `client_id` (text, unique) - Format: YYYY-REC-NNNN
      - `company_name` (text) - Client company name
      - `contact_name` (text) - Primary contact person
      - `email` (text) - Contact email
      - `phone` (text) - Contact phone
      - `address` (text) - Company address
      - `subscription_plan` (text) - Plan type
      - `subscription_status` (text) - Subscription status
      - `storage_used` (bigint) - Storage used in bytes
      - `storage_limit` (bigint) - Storage limit in bytes
      - `documents_processed` (integer) - Total documents processed
      - `tokens_available` (integer) - Available AI tokens
      - `obralia_credentials` (jsonb) - Encrypted Obralia credentials
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `clients` table
    - Add policies for client and admin access
*/

CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  client_id text UNIQUE NOT NULL,
  company_name text NOT NULL,
  contact_name text NOT NULL,
  email text NOT NULL,
  phone text DEFAULT '',
  address text DEFAULT '',
  subscription_plan text NOT NULL DEFAULT 'basic' CHECK (subscription_plan IN ('basic', 'professional', 'enterprise', 'custom')),
  subscription_status text NOT NULL DEFAULT 'active' CHECK (subscription_status IN ('active', 'suspended', 'cancelled')),
  storage_used bigint DEFAULT 0,
  storage_limit bigint DEFAULT 524288000, -- 500MB in bytes
  documents_processed integer DEFAULT 0,
  tokens_available integer DEFAULT 500,
  obralia_credentials jsonb DEFAULT '{"configured": false}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Clients can read their own data
CREATE POLICY "Clients can read own data"
  ON clients
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Clients can update their own data
CREATE POLICY "Clients can update own data"
  ON clients
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Admins can read all clients
CREATE POLICY "Admins can read all clients"
  ON clients
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to generate client ID
CREATE OR REPLACE FUNCTION generate_client_id()
RETURNS text AS $$
DECLARE
  year_part text;
  sequence_num integer;
  client_id text;
BEGIN
  year_part := EXTRACT(YEAR FROM now())::text;
  
  -- Get next sequence number for this year
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(client_id FROM '\d{4}-REC-(\d{4})') AS integer)
  ), 0) + 1
  INTO sequence_num
  FROM clients
  WHERE client_id LIKE year_part || '-REC-%';
  
  client_id := year_part || '-REC-' || LPAD(sequence_num::text, 4, '0');
  
  RETURN client_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at
CREATE OR REPLACE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();