/*
  # Create documents table

  1. New Tables
    - `documents`
      - `id` (uuid, primary key)
      - `project_id` (uuid, foreign key to projects)
      - `client_id` (uuid, foreign key to clients)
      - `filename` (text) - Stored filename
      - `original_name` (text) - Original filename
      - `file_size` (bigint) - File size in bytes
      - `file_type` (text) - MIME type
      - `document_type` (text) - AI classified type
      - `classification_confidence` (integer) - AI confidence percentage
      - `ai_metadata` (jsonb) - AI extracted metadata
      - `upload_status` (text) - Upload processing status
      - `obralia_status` (text) - Obralia processing status
      - `security_scan_status` (text) - Security scan status
      - `deletion_scheduled_at` (timestamp) - Scheduled deletion time
      - `obralia_document_id` (text) - Obralia document reference
      - `processing_attempts` (integer) - Number of processing attempts
      - `last_processing_error` (text) - Last error message
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `documents` table
    - Add policies for client and admin access
*/

CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  filename text NOT NULL,
  original_name text NOT NULL,
  file_size bigint NOT NULL,
  file_type text NOT NULL,
  document_type text DEFAULT '',
  classification_confidence integer DEFAULT 0 CHECK (classification_confidence >= 0 AND classification_confidence <= 100),
  ai_metadata jsonb DEFAULT '{}'::jsonb,
  upload_status text NOT NULL DEFAULT 'pending' CHECK (upload_status IN ('pending', 'processing', 'classified', 'uploaded_to_obralia', 'completed', 'error')),
  obralia_status text NOT NULL DEFAULT 'pending' CHECK (obralia_status IN ('pending', 'uploaded', 'validated', 'rejected', 'error')),
  security_scan_status text NOT NULL DEFAULT 'pending' CHECK (security_scan_status IN ('pending', 'safe', 'threat_detected')),
  deletion_scheduled_at timestamptz,
  obralia_document_id text,
  processing_attempts integer DEFAULT 0,
  last_processing_error text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Clients can manage their own documents
CREATE POLICY "Clients can manage own documents"
  ON documents
  FOR ALL
  TO authenticated
  USING (
    client_id IN (
      SELECT id FROM clients WHERE user_id = auth.uid()
    )
  );

-- Admins can manage all documents
CREATE POLICY "Admins can manage all documents"
  ON documents
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger to update updated_at
CREATE OR REPLACE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update client storage usage
CREATE OR REPLACE FUNCTION update_client_storage()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE clients 
    SET storage_used = storage_used + NEW.file_size,
        documents_processed = documents_processed + 1
    WHERE id = NEW.client_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE clients 
    SET storage_used = storage_used - OLD.file_size
    WHERE id = OLD.client_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers to update client storage
CREATE OR REPLACE TRIGGER update_client_storage_on_insert
  AFTER INSERT ON documents
  FOR EACH ROW EXECUTE FUNCTION update_client_storage();

CREATE OR REPLACE TRIGGER update_client_storage_on_delete
  AFTER DELETE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_client_storage();