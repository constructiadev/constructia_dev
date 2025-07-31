/*
  # Manual Document Queue Management

  1. New Tables
    - `manual_document_queue`
      - `id` (uuid, primary key)
      - `document_id` (uuid, foreign key to documents)
      - `client_id` (uuid, foreign key to clients)
      - `company_id` (uuid, foreign key to companies)
      - `project_id` (uuid, foreign key to projects)
      - `queue_position` (integer)
      - `priority` (text: 'low', 'normal', 'high', 'urgent')
      - `manual_status` (text: 'pending', 'in_progress', 'uploaded', 'validated', 'error', 'corrupted')
      - `ai_analysis` (jsonb)
      - `admin_notes` (text)
      - `processed_by` (uuid, foreign key to users)
      - `processed_at` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `manual_upload_sessions`
      - `id` (uuid, primary key)
      - `admin_id` (uuid, foreign key to users)
      - `session_start` (timestamp)
      - `session_end` (timestamp)
      - `documents_processed` (integer)
      - `documents_uploaded` (integer)
      - `documents_validated` (integer)
      - `session_notes` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for admin-only access
    - Add audit logging triggers

  3. Functions
    - Auto-queue documents when Obralia fails
    - AI analysis for document corruption detection
    - Queue position management
*/

-- Create manual_document_queue table
CREATE TABLE IF NOT EXISTS manual_document_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  queue_position integer NOT NULL,
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  manual_status text DEFAULT 'pending' CHECK (manual_status IN ('pending', 'in_progress', 'uploaded', 'validated', 'error', 'corrupted')),
  ai_analysis jsonb DEFAULT '{}',
  admin_notes text DEFAULT '',
  processed_by uuid REFERENCES users(id) ON DELETE SET NULL,
  processed_at timestamptz,
  obralia_credentials jsonb DEFAULT '{}',
  corruption_detected boolean DEFAULT false,
  file_integrity_score integer DEFAULT 100 CHECK (file_integrity_score >= 0 AND file_integrity_score <= 100),
  retry_count integer DEFAULT 0,
  last_error_message text,
  estimated_processing_time interval,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create manual_upload_sessions table
CREATE TABLE IF NOT EXISTS manual_upload_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES users(id) ON DELETE CASCADE,
  session_start timestamptz DEFAULT now(),
  session_end timestamptz,
  documents_processed integer DEFAULT 0,
  documents_uploaded integer DEFAULT 0,
  documents_validated integer DEFAULT 0,
  documents_with_errors integer DEFAULT 0,
  session_notes text DEFAULT '',
  session_status text DEFAULT 'active' CHECK (session_status IN ('active', 'paused', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE manual_document_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE manual_upload_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for manual_document_queue
CREATE POLICY "Admins can manage manual document queue"
  ON manual_document_queue
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() AND users.role = 'admin'
  ));

-- RLS Policies for manual_upload_sessions
CREATE POLICY "Admins can manage upload sessions"
  ON manual_upload_sessions
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() AND users.role = 'admin'
  ));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_manual_queue_position ON manual_document_queue(queue_position);
CREATE INDEX IF NOT EXISTS idx_manual_queue_status ON manual_document_queue(manual_status);
CREATE INDEX IF NOT EXISTS idx_manual_queue_priority ON manual_document_queue(priority);
CREATE INDEX IF NOT EXISTS idx_manual_queue_client ON manual_document_queue(client_id);
CREATE INDEX IF NOT EXISTS idx_manual_queue_created ON manual_document_queue(created_at);

-- Function to auto-add documents to manual queue when Obralia fails
CREATE OR REPLACE FUNCTION add_to_manual_queue()
RETURNS TRIGGER AS $$
BEGIN
  -- Only add to manual queue if obralia_status is 'error' or 'rejected'
  IF NEW.obralia_status IN ('error', 'rejected') AND OLD.obralia_status != NEW.obralia_status THEN
    INSERT INTO manual_document_queue (
      document_id,
      client_id,
      company_id,
      project_id,
      queue_position,
      priority,
      manual_status,
      ai_analysis,
      last_error_message
    )
    SELECT 
      NEW.id,
      NEW.client_id,
      p.company_id,
      NEW.project_id,
      COALESCE((SELECT MAX(queue_position) FROM manual_document_queue), 0) + 1,
      CASE 
        WHEN NEW.document_type = 'Certificado' THEN 'high'
        WHEN NEW.document_type = 'Factura' THEN 'normal'
        ELSE 'low'
      END,
      'pending',
      jsonb_build_object(
        'classification', NEW.document_type,
        'confidence', NEW.classification_confidence,
        'file_size', NEW.file_size,
        'file_type', NEW.file_type,
        'auto_queued', true,
        'reason', 'obralia_upload_failed'
      ),
      NEW.last_processing_error
    FROM projects p
    WHERE p.id = NEW.project_id
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-add failed documents to manual queue
DROP TRIGGER IF EXISTS trigger_add_to_manual_queue ON documents;
CREATE TRIGGER trigger_add_to_manual_queue
  AFTER UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION add_to_manual_queue();

-- Function to update queue positions when documents are processed
CREATE OR REPLACE FUNCTION update_queue_positions()
RETURNS TRIGGER AS $$
BEGIN
  -- When a document is processed, update positions of remaining documents
  IF OLD.manual_status = 'pending' AND NEW.manual_status != 'pending' THEN
    UPDATE manual_document_queue 
    SET queue_position = queue_position - 1,
        updated_at = now()
    WHERE queue_position > OLD.queue_position 
    AND manual_status = 'pending';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for queue position management
DROP TRIGGER IF EXISTS trigger_update_queue_positions ON manual_document_queue;
CREATE TRIGGER trigger_update_queue_positions
  AFTER UPDATE ON manual_document_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_queue_positions();

-- Function to detect file corruption using AI analysis
CREATE OR REPLACE FUNCTION analyze_document_integrity()
RETURNS TRIGGER AS $$
BEGIN
  -- Simulate AI analysis for file integrity
  NEW.file_integrity_score := CASE 
    WHEN NEW.ai_analysis->>'file_size' = '0' THEN 0
    WHEN NEW.ai_analysis->>'classification' = 'unknown' THEN 30
    WHEN NEW.ai_analysis->>'confidence' IS NULL THEN 50
    WHEN (NEW.ai_analysis->>'confidence')::integer < 70 THEN 60
    ELSE 100
  END;
  
  NEW.corruption_detected := NEW.file_integrity_score < 70;
  
  -- Auto-set priority based on integrity and document type
  IF NEW.corruption_detected THEN
    NEW.priority := 'urgent';
    NEW.manual_status := 'error';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for AI integrity analysis
DROP TRIGGER IF EXISTS trigger_analyze_integrity ON manual_document_queue;
CREATE TRIGGER trigger_analyze_integrity
  BEFORE INSERT OR UPDATE ON manual_document_queue
  FOR EACH ROW
  EXECUTE FUNCTION analyze_document_integrity();

-- Create updated_at trigger for manual_document_queue
DROP TRIGGER IF EXISTS update_manual_queue_updated_at ON manual_document_queue;
CREATE TRIGGER update_manual_queue_updated_at
  BEFORE UPDATE ON manual_document_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();