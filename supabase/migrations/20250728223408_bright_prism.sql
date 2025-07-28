/*
  # Create audit_logs table

  1. New Tables
    - `audit_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `client_id` (uuid, foreign key to clients, nullable)
      - `action` (text) - Action performed
      - `resource` (text) - Resource affected
      - `details` (jsonb) - Action details
      - `ip_address` (text) - User IP address
      - `user_agent` (text) - User agent string
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `audit_logs` table
    - Add policies for admin access only
*/

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  action text NOT NULL,
  resource text NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  ip_address text DEFAULT '',
  user_agent text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can read audit logs
CREATE POLICY "Admins can read audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- System can insert audit logs
CREATE POLICY "System can insert audit logs"
  ON audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Function to create audit log
CREATE OR REPLACE FUNCTION create_audit_log(
  p_user_id uuid,
  p_client_id uuid,
  p_action text,
  p_resource text,
  p_details jsonb DEFAULT '{}'::jsonb,
  p_ip_address text DEFAULT '',
  p_user_agent text DEFAULT ''
)
RETURNS uuid AS $$
DECLARE
  log_id uuid;
BEGIN
  INSERT INTO audit_logs (user_id, client_id, action, resource, details, ip_address, user_agent)
  VALUES (p_user_id, p_client_id, p_action, p_resource, p_details, p_ip_address, p_user_agent)
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;