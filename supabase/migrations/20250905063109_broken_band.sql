/*
  # Create Data Protection Compliance Tables

  1. New Tables
    - `compliance_checks` - Stores compliance verification items
    - `data_subject_requests` - Manages GDPR/LOPD rights requests  
    - `privacy_impact_assessments` - DPIA records
    - `data_breaches` - Security incident tracking
    - `consent_records` - User consent management

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated access

  3. Enums
    - Create all necessary enum types for status fields
*/

-- Create ENUM types if they don't exist
DO $$ BEGIN
    CREATE TYPE public.compliance_status AS ENUM ('compliant', 'warning', 'non_compliant');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.request_type AS ENUM ('access', 'rectification', 'erasure', 'portability', 'objection');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.request_status AS ENUM ('pending', 'in_progress', 'completed', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.risk_level AS ENUM ('low', 'medium', 'high', 'very_high');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.assessment_status AS ENUM ('draft', 'under_review', 'approved', 'requires_action');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.breach_severity AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.breach_status AS ENUM ('investigating', 'contained', 'resolved');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create tables
CREATE TABLE IF NOT EXISTS public.compliance_checks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    category text NOT NULL,
    check_name text NOT NULL,
    status public.compliance_status NOT NULL,
    description text,
    last_verified timestamptz,
    next_review timestamptz,
    responsible_user text,
    evidence_url text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.data_subject_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    request_type public.request_type NOT NULL,
    requester_email text NOT NULL,
    requester_name text,
    status public.request_status NOT NULL,
    request_details jsonb,
    response_data jsonb,
    completed_at timestamptz,
    deadline timestamptz NOT NULL,
    assigned_to text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.privacy_impact_assessments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_name text NOT NULL,
    processing_purpose text NOT NULL,
    data_categories text[] NOT NULL,
    risk_level public.risk_level NOT NULL,
    mitigation_measures text[] NOT NULL,
    status public.assessment_status NOT NULL,
    assessor_id text,
    approved_by text,
    approved_at timestamptz,
    next_review timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.data_breaches (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_title text NOT NULL,
    description text NOT NULL,
    severity public.breach_severity NOT NULL,
    affected_records integer,
    data_categories text[] NOT NULL,
    discovery_date timestamptz NOT NULL,
    notification_date timestamptz,
    authority_notified boolean DEFAULT FALSE,
    subjects_notified boolean DEFAULT FALSE,
    status public.breach_status NOT NULL,
    mitigation_actions text[] NOT NULL,
    lessons_learned text,
    reported_by text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.consent_records (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email text NOT NULL,
    consent_type text NOT NULL,
    purpose text NOT NULL,
    granted boolean NOT NULL,
    granted_at timestamptz,
    withdrawn_at timestamptz,
    ip_address text,
    user_agent text,
    legal_basis text,
    retention_period text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.compliance_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_subject_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.privacy_impact_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_breaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated access
CREATE POLICY "Authenticated users can read compliance checks"
  ON public.compliance_checks
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage compliance checks"
  ON public.compliance_checks
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read data subject requests"
  ON public.data_subject_requests
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage data subject requests"
  ON public.data_subject_requests
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read privacy assessments"
  ON public.privacy_impact_assessments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage privacy assessments"
  ON public.privacy_impact_assessments
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read data breaches"
  ON public.data_breaches
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage data breaches"
  ON public.data_breaches
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read consent records"
  ON public.consent_records
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage consent records"
  ON public.consent_records
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_compliance_checks_updated_at
    BEFORE UPDATE ON public.compliance_checks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_data_subject_requests_updated_at
    BEFORE UPDATE ON public.data_subject_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_privacy_impact_assessments_updated_at
    BEFORE UPDATE ON public.privacy_impact_assessments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_data_breaches_updated_at
    BEFORE UPDATE ON public.data_breaches
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consent_records_updated_at
    BEFORE UPDATE ON public.consent_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();