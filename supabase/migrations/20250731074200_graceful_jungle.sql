/*
  # Create receipts table

  1. New Tables
    - `receipts`
      - `id` (uuid, primary key)
      - `receipt_number` (text, unique)
      - `client_id` (uuid, foreign key)
      - `amount` (numeric)
      - `base_amount` (numeric)
      - `tax_amount` (numeric)
      - `tax_rate` (numeric)
      - `currency` (text)
      - `payment_method` (text)
      - `gateway_name` (text)
      - `description` (text)
      - `payment_date` (timestamptz)
      - `status` (text)
      - `transaction_id` (text)
      - `invoice_items` (jsonb)
      - `client_details` (jsonb)
      - `company_details` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `receipts` table
    - Add policies for clients to read their own receipts
    - Add policies for admins to read all receipts
    - Add policy for system to insert receipts
*/

CREATE TABLE IF NOT EXISTS receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_number text UNIQUE NOT NULL,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL,
  base_amount numeric(10,2) NOT NULL,
  tax_amount numeric(10,2) NOT NULL,
  tax_rate numeric(5,2) DEFAULT 21.00,
  currency text DEFAULT 'EUR',
  payment_method text NOT NULL,
  gateway_name text NOT NULL,
  description text NOT NULL,
  payment_date timestamptz DEFAULT now(),
  status text DEFAULT 'paid' CHECK (status IN ('paid', 'pending', 'failed', 'refunded')),
  transaction_id text NOT NULL,
  invoice_items jsonb DEFAULT '[]'::jsonb,
  client_details jsonb DEFAULT '{}'::jsonb,
  company_details jsonb DEFAULT '{
    "name": "ConstructIA S.L.",
    "address": "Calle Innovación 123, 28001 Madrid, España",
    "tax_id": "B87654321",
    "phone": "+34 91 000 00 00",
    "email": "facturacion@constructia.com",
    "website": "www.constructia.com"
  }'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

-- Clients can read their own receipts
CREATE POLICY "Clients can read own receipts"
  ON receipts
  FOR SELECT
  TO authenticated
  USING (client_id IN (
    SELECT id FROM clients WHERE user_id = auth.uid()
  ));

-- Admins can read all receipts
CREATE POLICY "Admins can read all receipts"
  ON receipts
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- System can insert receipts
CREATE POLICY "System can insert receipts"
  ON receipts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_receipts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_receipts_updated_at
  BEFORE UPDATE ON receipts
  FOR EACH ROW
  EXECUTE FUNCTION update_receipts_updated_at();