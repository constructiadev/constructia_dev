/*
  # Create AI Insights Table

  1. New Tables
    - `ai_insights`
      - `id` (uuid, primary key)
      - `insight_type` (text) - tipo de insight generado
      - `title` (text) - título del insight
      - `description` (text) - descripción detallada
      - `data_source` (jsonb) - datos fuente utilizados
      - `ai_analysis` (jsonb) - análisis completo de la IA
      - `confidence_score` (integer) - puntuación de confianza
      - `category` (text) - categoría del insight
      - `priority` (text) - prioridad del insight
      - `status` (text) - estado del insight
      - `generated_by` (text) - modelo de IA que lo generó
      - `expires_at` (timestamp) - cuándo expira el insight
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `ai_insights` table
    - Add policy for admins to manage insights
    - Add policy for authenticated users to read insights
*/

CREATE TABLE IF NOT EXISTS ai_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  insight_type text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  data_source jsonb DEFAULT '{}'::jsonb,
  ai_analysis jsonb DEFAULT '{}'::jsonb,
  confidence_score integer DEFAULT 0 CHECK (confidence_score >= 0 AND confidence_score <= 100),
  category text DEFAULT 'general'::text,
  priority text DEFAULT 'medium'::text CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status text DEFAULT 'active'::text CHECK (status IN ('active', 'archived', 'dismissed')),
  generated_by text DEFAULT 'gemini-pro'::text,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage AI insights"
  ON ai_insights
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() AND users.role = 'admin'
  ));

CREATE POLICY "Authenticated users can read AI insights"
  ON ai_insights
  FOR SELECT
  TO authenticated
  USING (true);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_ai_insights_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ai_insights_updated_at
  BEFORE UPDATE ON ai_insights
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_insights_updated_at();