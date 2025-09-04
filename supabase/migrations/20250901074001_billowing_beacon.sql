/*
  # Manual Management System Tables

  1. New Tables
    - `manual_upload_sessions` - Track admin upload sessions
    - `manual_document_queue` - Queue for manual document processing
    - `platform_credentials` - Store client platform credentials
    - `upload_logs` - Detailed logging for uploads

  2. Security
    - Enable RLS on all new tables
    - Add policies for admin and client access
    - Encrypt sensitive credential data

  3. Indexes
    - Performance indexes for queue operations
    - Search indexes for filtering
*/

-- Manual upload sessions table
CREATE TABLE IF NOT EXISTS manual_upload_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  session_start timestamptz DEFAULT now(),
  session_end timestamptz,
  documents_processed integer DEFAULT 0,
  documents_uploaded integer DEFAULT 0,
  documents_with_errors integer DEFAULT 0,
  session_notes text DEFAULT '',
  session_status text DEFAULT 'active' CHECK (session_status IN ('active', 'paused', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

-- Manual document queue table
CREATE TABLE IF NOT EXISTS manual_document_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  client_id uuid NOT NULL,
  document_id uuid NOT NULL,
  filename text NOT NULL,
  original_name text NOT NULL,
  file_size bigint NOT NULL,
  file_type text NOT NULL,
  classification text DEFAULT '',
  confidence integer DEFAULT 0 CHECK (confidence >= 0 AND confidence <= 100),
  corruption_detected boolean DEFAULT false,
  integrity_score integer DEFAULT 100 CHECK (integrity_score >= 0 AND integrity_score <= 100),
  upload_status text DEFAULT 'pending' CHECK (upload_status IN ('pending', 'uploading', 'uploaded', 'validated', 'error', 'corrupted')),
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  queue_position integer NOT NULL,
  retry_count integer DEFAULT 0,
  last_error text,
  admin_notes text DEFAULT '',
  platform_target text DEFAULT 'nalanda' CHECK (platform_target IN ('nalanda', 'ctaima', 'ecoordina')),
  company_id uuid,
  project_id uuid,
  estimated_processing_time interval,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Platform credentials table (encrypted)
CREATE TABLE IF NOT EXISTS platform_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  client_id uuid NOT NULL,
  platform_type text NOT NULL CHECK (platform_type IN ('nalanda', 'ctaima', 'ecoordina')),
  username text NOT NULL,
  password_encrypted text NOT NULL,
  additional_config jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  last_validated timestamptz,
  validation_status text DEFAULT 'pending' CHECK (validation_status IN ('pending', 'valid', 'invalid', 'expired')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id, client_id, platform_type)
);

-- Upload logs table
CREATE TABLE IF NOT EXISTS upload_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  session_id uuid REFERENCES manual_upload_sessions(id) ON DELETE SET NULL,
  document_queue_id uuid REFERENCES manual_document_queue(id) ON DELETE CASCADE,
  admin_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action text NOT NULL,
  status text NOT NULL CHECK (status IN ('success', 'error', 'warning', 'info')),
  message text NOT NULL,
  details jsonb DEFAULT '{}',
  processing_time_ms integer,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE manual_upload_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE manual_document_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE upload_logs ENABLE ROW LEVEL SECURITY;

-- Policies for manual_upload_sessions
CREATE POLICY "Admins can manage upload sessions"
  ON manual_upload_sessions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('SuperAdmin', 'GestorDocumental')
    )
  );

-- Policies for manual_document_queue
CREATE POLICY "Tenant access for document queue"
  ON manual_document_queue
  FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT users.tenant_id FROM users WHERE users.id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'SuperAdmin'
    )
  );

-- Policies for platform_credentials
CREATE POLICY "Clients can manage own credentials"
  ON platform_credentials
  FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT users.tenant_id FROM users WHERE users.id = auth.uid()
    )
  );

-- Policies for upload_logs
CREATE POLICY "Tenant access for upload logs"
  ON upload_logs
  FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT users.tenant_id FROM users WHERE users.id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'SuperAdmin'
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_manual_queue_tenant_status ON manual_document_queue(tenant_id, upload_status);
CREATE INDEX IF NOT EXISTS idx_manual_queue_position ON manual_document_queue(queue_position);
CREATE INDEX IF NOT EXISTS idx_manual_queue_priority ON manual_document_queue(priority, created_at);
CREATE INDEX IF NOT EXISTS idx_platform_credentials_client ON platform_credentials(tenant_id, client_id);
CREATE INDEX IF NOT EXISTS idx_upload_logs_session ON upload_logs(session_id, created_at);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_manual_queue_updated_at
  BEFORE UPDATE ON manual_document_queue
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_platform_credentials_updated_at
  BEFORE UPDATE ON platform_credentials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-assign queue positions
CREATE OR REPLACE FUNCTION assign_queue_position()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.queue_position IS NULL THEN
    SELECT COALESCE(MAX(queue_position), 0) + 1
    INTO NEW.queue_position
    FROM manual_document_queue
    WHERE tenant_id = NEW.tenant_id;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER auto_assign_queue_position
  BEFORE INSERT ON manual_document_queue
  FOR EACH ROW EXECUTE FUNCTION assign_queue_position();

-- Function to analyze document integrity
CREATE OR REPLACE FUNCTION analyze_document_integrity()
RETURNS TRIGGER AS $$
BEGIN
  -- Basic integrity checks
  IF NEW.file_size = 0 THEN
    NEW.corruption_detected = true;
    NEW.integrity_score = 0;
    NEW.upload_status = 'corrupted';
  ELSIF NEW.file_size < 1024 THEN
    NEW.integrity_score = 50;
  ELSIF NEW.confidence < 50 THEN
    NEW.integrity_score = NEW.confidence;
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_analyze_integrity
  BEFORE INSERT OR UPDATE ON manual_document_queue
  FOR EACH ROW EXECUTE FUNCTION analyze_document_integrity();

-- Function to update queue positions when status changes
CREATE OR REPLACE FUNCTION update_queue_positions()
RETURNS TRIGGER AS $$
BEGIN
  -- When a document is completed, move others up
  IF OLD.upload_status != 'uploaded' AND NEW.upload_status = 'uploaded' THEN
    UPDATE manual_document_queue 
    SET queue_position = queue_position - 1
    WHERE tenant_id = NEW.tenant_id 
    AND queue_position > OLD.queue_position
    AND upload_status IN ('pending', 'error');
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_queue_positions
  AFTER UPDATE ON manual_document_queue
  FOR EACH ROW EXECUTE FUNCTION update_queue_positions();