/*
  # Create system_configurations table

  1. New Tables
    - `system_configurations`
      - `id` (uuid, primary key)
      - `platform_name` (text)
      - `admin_email` (text)
      - `max_file_size` (integer)
      - `backup_frequency` (text)
      - `ai_auto_classification` (boolean)
      - `email_notifications` (boolean)
      - `audit_retention_days` (integer)
      - `maintenance_mode` (boolean)
      - `max_concurrent_users` (integer)
      - `session_timeout` (integer)
      - `password_policy_strength` (text)
      - `two_factor_required` (boolean)
      - `security_config` (jsonb)
      - `integration_config` (jsonb)
      - `compliance_config` (jsonb)
      - `performance_config` (jsonb)
      - `notification_config` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `system_configurations` table
    - Add policy for SuperAdmin access only
*/

CREATE TABLE IF NOT EXISTS system_configurations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_name text DEFAULT 'ConstructIA',
  admin_email text DEFAULT 'admin@constructia.com',
  max_file_size integer DEFAULT 50,
  backup_frequency text DEFAULT 'daily',
  ai_auto_classification boolean DEFAULT true,
  email_notifications boolean DEFAULT true,
  audit_retention_days integer DEFAULT 365,
  maintenance_mode boolean DEFAULT false,
  max_concurrent_users integer DEFAULT 500,
  session_timeout integer DEFAULT 30,
  password_policy_strength text DEFAULT 'high',
  two_factor_required boolean DEFAULT true,
  security_config jsonb DEFAULT '{
    "encryption_level": "AES-256",
    "ssl_enforcement": true,
    "ip_whitelist_enabled": false,
    "allowed_ips": "",
    "failed_login_attempts": "5",
    "account_lockout_duration": "30",
    "cors_origins": "",
    "api_rate_limiting": true,
    "max_requests_per_minute": "1000",
    "suspicious_activity_alerts": true
  }'::jsonb,
  integration_config jsonb DEFAULT '{
    "obralia_auto_sync": true,
    "gemini_api_enabled": true,
    "stripe_webhook_validation": true,
    "sepa_direct_debit_enabled": true,
    "bizum_integration_active": true,
    "apple_pay_enabled": false,
    "google_pay_enabled": false,
    "external_api_timeout": "30",
    "webhook_retry_attempts": "3",
    "integration_health_checks": true
  }'::jsonb,
  compliance_config jsonb DEFAULT '{
    "lopd_compliance_level": "strict",
    "data_retention_policy": "7_years",
    "gdpr_consent_required": true,
    "right_to_be_forgotten": true,
    "data_portability_enabled": true,
    "breach_notification_time": "72",
    "privacy_impact_assessments": true,
    "data_processing_logs": true,
    "third_party_sharing_allowed": false,
    "anonymization_after_retention": true
  }'::jsonb,
  performance_config jsonb DEFAULT '{
    "cache_enabled": true,
    "cache_duration": "3600",
    "cdn_enabled": true,
    "image_optimization": true,
    "lazy_loading": true,
    "compression_enabled": true,
    "minification_enabled": true,
    "database_pool_size": "20",
    "query_timeout": "30",
    "auto_scaling_enabled": true
  }'::jsonb,
  notification_config jsonb DEFAULT '{
    "email_notifications": true,
    "sms_notifications": false,
    "push_notifications": true,
    "slack_integration": false,
    "teams_integration": false,
    "webhook_notifications": true,
    "notification_frequency": "immediate",
    "digest_enabled": true,
    "digest_frequency": "weekly",
    "escalation_enabled": true
  }'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE system_configurations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "SuperAdmin can manage system configurations"
  ON system_configurations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'SuperAdmin'
    )
  );

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_system_configurations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_system_configurations_updated_at
  BEFORE UPDATE ON system_configurations
  FOR EACH ROW
  EXECUTE FUNCTION update_system_configurations_updated_at();

-- Insert default configuration
INSERT INTO system_configurations (
  platform_name,
  admin_email,
  max_file_size,
  backup_frequency,
  ai_auto_classification,
  email_notifications,
  audit_retention_days,
  maintenance_mode,
  max_concurrent_users,
  session_timeout,
  password_policy_strength,
  two_factor_required
) VALUES (
  'ConstructIA',
  'admin@constructia.com',
  50,
  'daily',
  true,
  true,
  365,
  false,
  500,
  30,
  'high',
  true
) ON CONFLICT DO NOTHING;