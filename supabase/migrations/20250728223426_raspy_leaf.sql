/*
  # Create system_settings table

  1. New Tables
    - `system_settings`
      - `id` (uuid, primary key)
      - `key` (text, unique) - Setting key
      - `value` (jsonb) - Setting value
      - `description` (text) - Setting description
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `system_settings` table
    - Add policies for admin access only

  3. Initial Settings
    - AI confidence threshold
    - Storage limits
    - Token limits
    - System maintenance mode
*/

CREATE TABLE IF NOT EXISTS system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  description text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can manage system settings
CREATE POLICY "Admins can manage system settings"
  ON system_settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger to update updated_at
CREATE OR REPLACE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON system_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default system settings
INSERT INTO system_settings (key, value, description) VALUES
  ('ai_confidence_threshold', '85', 'Minimum AI confidence threshold for automatic classification'),
  ('default_storage_limit_basic', '524288000', 'Default storage limit for basic plan (500MB in bytes)'),
  ('default_storage_limit_professional', '1073741824', 'Default storage limit for professional plan (1GB in bytes)'),
  ('default_storage_limit_enterprise', '5368709120', 'Default storage limit for enterprise plan (5GB in bytes)'),
  ('default_tokens_basic', '500', 'Default tokens for basic plan'),
  ('default_tokens_professional', '1000', 'Default tokens for professional plan'),
  ('default_tokens_enterprise', '5000', 'Default tokens for enterprise plan'),
  ('maintenance_mode', 'false', 'System maintenance mode flag'),
  ('gemini_api_enabled', 'true', 'Gemini AI API enabled flag'),
  ('obralia_integration_enabled', 'true', 'Obralia integration enabled flag'),
  ('document_retention_days', '7', 'Days to retain documents after Obralia validation'),
  ('max_file_size_mb', '10', 'Maximum file size in MB'),
  ('supported_file_types', '["application/pdf", "image/jpeg", "image/png", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]', 'Supported file types for upload')
ON CONFLICT (key) DO NOTHING;