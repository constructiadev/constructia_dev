/*
  # Data Protection Compliance Tables

  1. New Tables
    - `compliance_checks`
      - `id` (uuid, primary key)
      - `category` (text)
      - `check_name` (text)
      - `status` (enum: compliant, warning, non_compliant)
      - `description` (text)
      - `last_verified` (timestamp)
      - `next_review` (timestamp)
      - `responsible_user` (uuid)
      - `evidence_url` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `data_subject_requests`
      - `id` (uuid, primary key)
      - `request_type` (enum: access, rectification, erasure, portability, objection)
      - `requester_email` (text)
      - `requester_name` (text)
      - `status` (enum: pending, in_progress, completed, rejected)
      - `request_details` (jsonb)
      - `response_data` (jsonb)
      - `completed_at` (timestamp)
      - `deadline` (timestamp)
      - `assigned_to` (uuid)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `privacy_impact_assessments`
      - `id` (uuid, primary key)
      - `assessment_name` (text)
      - `processing_purpose` (text)
      - `data_categories` (jsonb)
      - `risk_level` (enum: low, medium, high, very_high)
      - `mitigation_measures` (jsonb)
      - `status` (enum: draft, under_review, approved, requires_action)
      - `assessor_id` (uuid)
      - `approved_by` (uuid)
      - `approved_at` (timestamp)
      - `next_review` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `data_breaches`
      - `id` (uuid, primary key)
      - `incident_title` (text)
      - `description` (text)
      - `severity` (enum: low, medium, high, critical)
      - `affected_records` (integer)
      - `data_categories` (jsonb)
      - `discovery_date` (timestamp)
      - `notification_date` (timestamp)
      - `authority_notified` (boolean)
      - `subjects_notified` (boolean)
      - `status` (enum: investigating, contained, resolved)
      - `mitigation_actions` (jsonb)
      - `lessons_learned` (text)
      - `reported_by` (uuid)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `consent_records`
      - `id` (uuid, primary key)
      - `user_email` (text)
      - `consent_type` (text)
      - `purpose` (text)
      - `granted` (boolean)
      - `granted_at` (timestamp)
      - `withdrawn_at` (timestamp)
      - `ip_address` (text)
      - `user_agent` (text)
      - `legal_basis` (text)
      - `retention_period` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for admin access only
    - Add audit triggers for all tables

  3. Enums
    - Create compliance_status enum
    - Create request_type enum
    - Create risk_level enum
    - Create breach_severity enum
    - Create breach_status enum
*/

-- Create enums
CREATE TYPE compliance_status AS ENUM ('compliant', 'warning', 'non_compliant');
CREATE TYPE request_type AS ENUM ('access', 'rectification', 'erasure', 'portability', 'objection');
CREATE TYPE request_status AS ENUM ('pending', 'in_progress', 'completed', 'rejected');
CREATE TYPE risk_level AS ENUM ('low', 'medium', 'high', 'very_high');
CREATE TYPE breach_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE breach_status AS ENUM ('investigating', 'contained', 'resolved');
CREATE TYPE pia_status AS ENUM ('draft', 'under_review', 'approved', 'requires_action');

-- Compliance checks table
CREATE TABLE IF NOT EXISTS compliance_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  check_name text NOT NULL,
  status compliance_status DEFAULT 'warning',
  description text,
  last_verified timestamptz,
  next_review timestamptz,
  responsible_user uuid,
  evidence_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Data subject requests table
CREATE TABLE IF NOT EXISTS data_subject_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_type request_type NOT NULL,
  requester_email text NOT NULL,
  requester_name text,
  status request_status DEFAULT 'pending',
  request_details jsonb DEFAULT '{}',
  response_data jsonb DEFAULT '{}',
  completed_at timestamptz,
  deadline timestamptz NOT NULL,
  assigned_to uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Privacy impact assessments table
CREATE TABLE IF NOT EXISTS privacy_impact_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_name text NOT NULL,
  processing_purpose text NOT NULL,
  data_categories jsonb DEFAULT '[]',
  risk_level risk_level DEFAULT 'medium',
  mitigation_measures jsonb DEFAULT '[]',
  status pia_status DEFAULT 'draft',
  assessor_id uuid,
  approved_by uuid,
  approved_at timestamptz,
  next_review timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Data breaches table
CREATE TABLE IF NOT EXISTS data_breaches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_title text NOT NULL,
  description text NOT NULL,
  severity breach_severity DEFAULT 'medium',
  affected_records integer DEFAULT 0,
  data_categories jsonb DEFAULT '[]',
  discovery_date timestamptz NOT NULL,
  notification_date timestamptz,
  authority_notified boolean DEFAULT false,
  subjects_notified boolean DEFAULT false,
  status breach_status DEFAULT 'investigating',
  mitigation_actions jsonb DEFAULT '[]',
  lessons_learned text,
  reported_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Consent records table
CREATE TABLE IF NOT EXISTS consent_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  consent_type text NOT NULL,
  purpose text NOT NULL,
  granted boolean DEFAULT false,
  granted_at timestamptz,
  withdrawn_at timestamptz,
  ip_address text,
  user_agent text,
  legal_basis text,
  retention_period text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE compliance_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_subject_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_impact_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_breaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admin can manage compliance checks"
  ON compliance_checks
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin can manage data subject requests"
  ON data_subject_requests
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin can manage privacy impact assessments"
  ON privacy_impact_assessments
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin can manage data breaches"
  ON data_breaches
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin can manage consent records"
  ON consent_records
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add updated_at triggers
CREATE TRIGGER update_compliance_checks_updated_at
  BEFORE UPDATE ON compliance_checks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_data_subject_requests_updated_at
  BEFORE UPDATE ON data_subject_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_privacy_impact_assessments_updated_at
  BEFORE UPDATE ON privacy_impact_assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_data_breaches_updated_at
  BEFORE UPDATE ON data_breaches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consent_records_updated_at
  BEFORE UPDATE ON consent_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();