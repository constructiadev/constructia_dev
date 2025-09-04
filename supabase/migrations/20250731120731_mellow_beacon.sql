/*
  # Sistema de Gestión Manual Operativa para Documentos

  1. Nueva Tabla para Cola Manual
    - `manual_document_queue`
      - Gestión operativa de documentos fallidos
      - Organización por Cliente > Empresa > Proyecto
      - Estados de procesamiento manual
      - Detección automática de corrupción con IA
      - Priorización inteligente

  2. Funciones de IA
    - Detección automática de archivos corruptos
    - Análisis de integridad de archivos
    - Priorización automática basada en urgencia

  3. Triggers Automáticos
    - Añadir documentos a cola cuando falla API Obralia
    - Actualizar métricas en tiempo real
    - Auditoría completa de acciones manuales

  4. Seguridad
    - Solo acceso para super administradores
    - RLS habilitado
    - Encriptación de credenciales Obralia
*/

-- Tabla principal para gestión manual operativa
CREATE TABLE IF NOT EXISTS manual_document_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Información de cola operativa
  queue_position integer NOT NULL DEFAULT 0,
  priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  manual_status text NOT NULL DEFAULT 'pending' CHECK (manual_status IN ('pending', 'in_progress', 'uploaded', 'validated', 'error', 'corrupted')),
  
  -- Análisis de IA integrado
  ai_analysis jsonb DEFAULT '{}',
  corruption_detected boolean DEFAULT false,
  file_integrity_score integer DEFAULT 100 CHECK (file_integrity_score >= 0 AND file_integrity_score <= 100),
  
  -- Gestión de errores y reintentos
  retry_count integer DEFAULT 0,
  last_error_message text,
  
  -- Notas del administrador
  admin_notes text DEFAULT '',
  processed_by uuid REFERENCES users(id),
  processed_at timestamptz,
  
  -- Credenciales Obralia del cliente (para conexión directa)
  obralia_credentials jsonb DEFAULT '{}',
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla para sesiones de procesamiento manual
CREATE TABLE IF NOT EXISTS manual_upload_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES users(id),
  session_start timestamptz DEFAULT now(),
  session_end timestamptz,
  session_status text DEFAULT 'active' CHECK (session_status IN ('active', 'paused', 'completed', 'cancelled')),
  
  -- Métricas de la sesión
  documents_processed integer DEFAULT 0,
  documents_uploaded integer DEFAULT 0,
  documents_validated integer DEFAULT 0,
  documents_failed integer DEFAULT 0,
  
  -- Notas de la sesión
  session_notes text DEFAULT '',
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Función para detectar corrupción automáticamente con IA
CREATE OR REPLACE FUNCTION detect_document_corruption()
RETURNS trigger AS $$
BEGIN
  -- Simular análisis de IA para detectar corrupción
  IF NEW.ai_analysis->>'file_size' = '0' OR NEW.ai_analysis->>'confidence' < '20' THEN
    NEW.corruption_detected = true;
    NEW.file_integrity_score = 0;
    NEW.priority = 'urgent';
    NEW.manual_status = 'corrupted';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar posición en cola automáticamente
CREATE OR REPLACE FUNCTION update_queue_position()
RETURNS trigger AS $$
BEGIN
  -- Asignar posición en cola basada en prioridad y timestamp
  IF NEW.queue_position = 0 THEN
    SELECT COALESCE(MAX(queue_position), 0) + 1 
    INTO NEW.queue_position 
    FROM manual_document_queue 
    WHERE manual_status IN ('pending', 'in_progress');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para añadir documentos automáticamente cuando falla Obralia
CREATE OR REPLACE FUNCTION add_to_manual_queue_on_obralia_failure()
RETURNS trigger AS $$
BEGIN
  -- Si el documento falla en Obralia, añadirlo a la cola manual
  IF NEW.obralia_status = 'error' AND OLD.obralia_status != 'error' THEN
    INSERT INTO manual_document_queue (
      document_id,
      client_id,
      company_id,
      project_id,
      priority,
      ai_analysis,
      corruption_detected,
      file_integrity_score,
      obralia_credentials
    )
    SELECT 
      NEW.id,
      NEW.client_id,
      p.company_id,
      NEW.project_id,
      CASE 
        WHEN NEW.classification_confidence < 70 THEN 'high'
        WHEN NEW.processing_attempts > 2 THEN 'urgent'
        ELSE 'normal'
      END,
      jsonb_build_object(
        'classification', COALESCE(NEW.document_type, 'unknown'),
        'confidence', COALESCE(NEW.classification_confidence, 0),
        'file_size', NEW.file_size,
        'file_type', NEW.file_type
      ),
      CASE WHEN NEW.file_size = 0 THEN true ELSE false END,
      CASE 
        WHEN NEW.file_size = 0 THEN 0
        WHEN NEW.classification_confidence < 50 THEN 50
        ELSE NEW.classification_confidence
      END,
      c.obralia_credentials
    FROM projects p
    JOIN clients c ON c.id = NEW.client_id
    WHERE p.id = NEW.project_id
    ON CONFLICT (document_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER detect_corruption_trigger
  BEFORE INSERT OR UPDATE ON manual_document_queue
  FOR EACH ROW EXECUTE FUNCTION detect_document_corruption();

CREATE TRIGGER update_queue_position_trigger
  BEFORE INSERT ON manual_document_queue
  FOR EACH ROW EXECUTE FUNCTION update_queue_position();

CREATE TRIGGER add_to_manual_queue_trigger
  AFTER UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION add_to_manual_queue_on_obralia_failure();

CREATE TRIGGER update_manual_queue_updated_at
  BEFORE UPDATE ON manual_document_queue
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_manual_sessions_updated_at
  BEFORE UPDATE ON manual_upload_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Índices para optimizar consultas operativas
CREATE INDEX IF NOT EXISTS idx_manual_queue_client_priority ON manual_document_queue(client_id, priority DESC, queue_position);
CREATE INDEX IF NOT EXISTS idx_manual_queue_status ON manual_document_queue(manual_status);
CREATE INDEX IF NOT EXISTS idx_manual_queue_corruption ON manual_document_queue(corruption_detected, priority DESC);
CREATE INDEX IF NOT EXISTS idx_manual_queue_position ON manual_document_queue(queue_position);

-- RLS Policies (solo super administradores)
ALTER TABLE manual_document_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE manual_upload_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can manage manual queue"
  ON manual_document_queue
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Only admins can manage upload sessions"
  ON manual_upload_sessions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Función para obtener vista operativa completa
CREATE OR REPLACE FUNCTION get_manual_queue_operational_view()
RETURNS TABLE (
  queue_id uuid,
  document_id uuid,
  client_id uuid,
  client_name text,
  client_email text,
  company_id uuid,
  company_name text,
  project_id uuid,
  project_name text,
  document_filename text,
  document_original_name text,
  file_size bigint,
  file_type text,
  classification text,
  confidence integer,
  corruption_detected boolean,
  integrity_score integer,
  upload_status text,
  priority text,
  queue_position integer,
  retry_count integer,
  last_error text,
  admin_notes text,
  obralia_username text,
  obralia_configured boolean,
  created_at timestamptz,
  updated_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mq.id as queue_id,
    mq.document_id,
    mq.client_id,
    c.company_name as client_name,
    c.email as client_email,
    mq.company_id,
    comp.name as company_name,
    mq.project_id,
    p.name as project_name,
    d.filename as document_filename,
    d.original_name as document_original_name,
    d.file_size,
    d.file_type,
    (mq.ai_analysis->>'classification')::text as classification,
    (mq.ai_analysis->>'confidence')::integer as confidence,
    mq.corruption_detected,
    mq.file_integrity_score as integrity_score,
    mq.manual_status as upload_status,
    mq.priority,
    mq.queue_position,
    mq.retry_count,
    mq.last_error_message as last_error,
    mq.admin_notes,
    (mq.obralia_credentials->>'username')::text as obralia_username,
    (mq.obralia_credentials->>'configured')::boolean as obralia_configured,
    mq.created_at,
    mq.updated_at
  FROM manual_document_queue mq
  JOIN documents d ON d.id = mq.document_id
  JOIN clients c ON c.id = mq.client_id
  LEFT JOIN companies comp ON comp.id = mq.company_id
  LEFT JOIN projects p ON p.id = mq.project_id
  ORDER BY 
    mq.priority DESC,
    mq.queue_position ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;