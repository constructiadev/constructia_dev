/*
  # Crear tabla de mandatos SEPA

  1. Nueva Tabla
    - `sepa_mandates`
      - `id` (uuid, primary key)
      - `mandate_id` (text, unique)
      - `client_id` (uuid, foreign key)
      - `deudor_nombre` (text)
      - `deudor_direccion` (text)
      - `deudor_codigo_postal` (text)
      - `deudor_ciudad` (text)
      - `deudor_pais` (text)
      - `deudor_identificacion` (text)
      - `iban` (text)
      - `bic` (text)
      - `banco_nombre` (text)
      - `tipo_pago` (text)
      - `amount` (numeric)
      - `currency` (text)
      - `description` (text)
      - `fecha_firma` (timestamptz)
      - `ip_address` (text)
      - `user_agent` (text)
      - `session_id` (text)
      - `status` (text)
      - `created_at` (timestamptz)

  2. Seguridad
    - Enable RLS on `sepa_mandates` table
    - Add policies for clients and admins
*/

CREATE TABLE IF NOT EXISTS sepa_mandates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mandate_id text UNIQUE NOT NULL,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  deudor_nombre text NOT NULL,
  deudor_direccion text NOT NULL,
  deudor_codigo_postal text NOT NULL,
  deudor_ciudad text NOT NULL,
  deudor_pais text NOT NULL DEFAULT 'España',
  deudor_identificacion text NOT NULL,
  iban text NOT NULL,
  bic text NOT NULL,
  banco_nombre text NOT NULL,
  tipo_pago text NOT NULL CHECK (tipo_pago IN ('recurrente', 'unico')),
  amount numeric(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'EUR',
  description text NOT NULL,
  fecha_firma timestamptz NOT NULL,
  ip_address text NOT NULL,
  user_agent text NOT NULL,
  session_id text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sepa_mandates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can read own SEPA mandates"
  ON sepa_mandates
  FOR SELECT
  TO authenticated
  USING (client_id IN (
    SELECT id FROM clients WHERE user_id = auth.uid()
  ));

CREATE POLICY "Admins can read all SEPA mandates"
  ON sepa_mandates
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "System can insert SEPA mandates"
  ON sepa_mandates
  FOR INSERT
  TO authenticated
  WITH CHECK (true);