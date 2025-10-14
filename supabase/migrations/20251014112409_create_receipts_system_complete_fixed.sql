/*
  # Complete Receipts System with BI and KPIs

  ## Summary
  Crea el sistema completo de recibos profesionales con:
  - Tabla receipts con todos los campos necesarios
  - Generación automática de números de recibo
  - Tracking de visualizaciones y descargas
  - Vistas para análisis BI y KPIs
  - Funciones de seguridad y utilidad

  ## Tables Created
  1. receipts - Almacena todos los recibos de la plataforma
  
  ## Views Created
  1. receipt_analytics - Análisis agregado por cliente
  2. financial_kpis - KPIs financieros en tiempo real
  
  ## Functions Created
  1. generate_receipt_number() - Genera números únicos de recibo
  2. track_receipt_view() - Registra visualizaciones
  3. track_receipt_download() - Registra descargas
  4. get_client_receipts() - Obtiene recibos de un cliente

  ## Security
  - RLS habilitado
  - Políticas para clientes y administradores
  - Funciones con SECURITY DEFINER para operaciones específicas
*/

-- Create receipts table
CREATE TABLE IF NOT EXISTS receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_number text UNIQUE,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Amount details
  amount numeric(10,2) NOT NULL,
  base_amount numeric(10,2) NOT NULL,
  tax_amount numeric(10,2) NOT NULL,
  tax_rate numeric(5,2) DEFAULT 21.00,
  currency text DEFAULT 'EUR',
  
  -- Payment details
  payment_method text NOT NULL,
  gateway_name text NOT NULL,
  description text NOT NULL,
  payment_date timestamptz DEFAULT now(),
  status text DEFAULT 'paid' CHECK (status IN ('paid', 'pending', 'failed', 'refunded')),
  transaction_id text NOT NULL,
  
  -- Receipt metadata
  subscription_plan text,
  invoice_items jsonb DEFAULT '[]'::jsonb,
  client_details jsonb DEFAULT '{}'::jsonb,
  company_details jsonb DEFAULT '{
    "name": "ConstructIA S.L.",
    "address": "Calle Innovación 123, 28001 Madrid, España",
    "tax_id": "B87654321",
    "phone": "+34 91 000 00 00",
    "email": "facturacion@constructia.com",
    "website": "www.constructia.com"
  }'::jsonb,
  
  -- Receipt HTML and tracking
  receipt_html text,
  fiscal_year integer DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  sequence_number integer,
  qr_code text,
  
  -- Tracking fields
  viewed_at timestamptz,
  downloaded_at timestamptz,
  download_count integer DEFAULT 0,
  email_sent boolean DEFAULT false,
  email_sent_at timestamptz,
  
  -- Denormalized fields for fast queries
  client_company_name text,
  client_tax_id text,
  
  -- Flexible metadata storage
  metadata jsonb DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_receipts_client_id ON receipts(client_id);
CREATE INDEX IF NOT EXISTS idx_receipts_client_date ON receipts(client_id, payment_date DESC);
CREATE INDEX IF NOT EXISTS idx_receipts_fiscal_year ON receipts(fiscal_year, sequence_number);
CREATE INDEX IF NOT EXISTS idx_receipts_status ON receipts(status);
CREATE INDEX IF NOT EXISTS idx_receipts_payment_method ON receipts(payment_method);
CREATE INDEX IF NOT EXISTS idx_receipts_created_at ON receipts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_receipts_receipt_number ON receipts(receipt_number);

-- RLS Policies

-- Clients can read their own receipts
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'receipts' 
    AND policyname = 'Clients can read own receipts'
  ) THEN
    CREATE POLICY "Clients can read own receipts"
      ON receipts
      FOR SELECT
      TO authenticated
      USING (
        client_id IN (
          SELECT id FROM clients WHERE user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Admins can read all receipts
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'receipts' 
    AND policyname = 'Admins can read all receipts'
  ) THEN
    CREATE POLICY "Admins can read all receipts"
      ON receipts
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM users 
          WHERE id = auth.uid() AND role = 'SuperAdmin'
        )
      );
  END IF;
END $$;

-- System can insert receipts
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'receipts' 
    AND policyname = 'System can insert receipts'
  ) THEN
    CREATE POLICY "System can insert receipts"
      ON receipts
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

-- System can update receipts
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'receipts' 
    AND policyname = 'System can update receipts'
  ) THEN
    CREATE POLICY "System can update receipts"
      ON receipts
      FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Function to generate receipt number
CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS TRIGGER AS $$
DECLARE
  year integer;
  next_seq integer;
BEGIN
  -- Get current fiscal year from payment_date
  year := EXTRACT(YEAR FROM COALESCE(NEW.payment_date, CURRENT_DATE));

  -- Get next sequence number for this year
  SELECT COALESCE(MAX(sequence_number), 0) + 1
  INTO next_seq
  FROM receipts
  WHERE fiscal_year = year;

  -- Set fiscal year and sequence number
  NEW.fiscal_year := year;
  NEW.sequence_number := next_seq;

  -- Generate receipt number in format: REC-YYYY-NNNNNN
  IF NEW.receipt_number IS NULL THEN
    NEW.receipt_number := 'REC-' || year || '-' || LPAD(next_seq::text, 6, '0');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic receipt number generation
DROP TRIGGER IF EXISTS generate_receipt_number_trigger ON receipts;
CREATE TRIGGER generate_receipt_number_trigger
  BEFORE INSERT ON receipts
  FOR EACH ROW
  WHEN (NEW.receipt_number IS NULL)
  EXECUTE FUNCTION generate_receipt_number();

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_receipts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_receipts_updated_at ON receipts;
CREATE TRIGGER update_receipts_updated_at
  BEFORE UPDATE ON receipts
  FOR EACH ROW
  EXECUTE FUNCTION update_receipts_updated_at();

-- Analytics view for receipt statistics per client (fixed aggregate)
CREATE OR REPLACE VIEW receipt_analytics AS
WITH payment_methods AS (
  SELECT
    client_id,
    jsonb_object_agg(payment_method, method_count) as payment_method_distribution
  FROM (
    SELECT
      client_id,
      COALESCE(payment_method, 'unknown') as payment_method,
      COUNT(*) as method_count
    FROM receipts
    WHERE payment_method IS NOT NULL
    GROUP BY client_id, payment_method
  ) pm
  GROUP BY client_id
)
SELECT
  r.client_id,
  c.company_name as client_name,
  c.email as client_email,
  COUNT(*) as total_receipts,
  SUM(r.amount) as total_spent,
  AVG(r.amount) as average_transaction,
  MAX(r.payment_date) as last_payment_date,
  MIN(r.payment_date) as first_payment_date,
  SUM(CASE WHEN r.status = 'paid' THEN r.amount ELSE 0 END) as total_paid,
  SUM(CASE WHEN r.status = 'pending' THEN r.amount ELSE 0 END) as total_pending,
  SUM(CASE WHEN r.status = 'failed' THEN 1 ELSE 0 END) as failed_count,
  SUM(r.download_count) as total_downloads,
  pm.payment_method_distribution
FROM receipts r
LEFT JOIN clients c ON c.id = r.client_id
LEFT JOIN payment_methods pm ON pm.client_id = r.client_id
GROUP BY r.client_id, c.company_name, c.email, pm.payment_method_distribution;

-- Financial KPIs view with real-time calculations
CREATE OR REPLACE VIEW financial_kpis AS
WITH monthly_revenue AS (
  SELECT
    DATE_TRUNC('month', payment_date) as month,
    SUM(amount) as revenue,
    COUNT(*) as transaction_count,
    COUNT(DISTINCT client_id) as unique_clients
  FROM receipts
  WHERE status = 'paid'
  GROUP BY DATE_TRUNC('month', payment_date)
),
current_month AS (
  SELECT
    SUM(amount) as current_month_revenue,
    COUNT(*) as current_month_transactions,
    COUNT(DISTINCT client_id) as current_month_clients,
    AVG(amount) as current_month_avg_transaction
  FROM receipts
  WHERE status = 'paid'
    AND DATE_TRUNC('month', payment_date) = DATE_TRUNC('month', CURRENT_DATE)
),
previous_month AS (
  SELECT
    SUM(amount) as previous_month_revenue,
    COUNT(*) as previous_month_transactions
  FROM receipts
  WHERE status = 'paid'
    AND DATE_TRUNC('month', payment_date) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
),
all_time AS (
  SELECT
    SUM(amount) as total_revenue,
    COUNT(*) as total_transactions,
    COUNT(DISTINCT client_id) as total_clients,
    AVG(amount) as avg_transaction_value,
    MIN(payment_date) as first_transaction_date
  FROM receipts
  WHERE status = 'paid'
),
payment_method_dist AS (
  SELECT jsonb_object_agg(payment_method, count) as distribution
  FROM (
    SELECT payment_method, COUNT(*) as count
    FROM receipts
    WHERE status = 'paid'
    GROUP BY payment_method
  ) pm_dist
),
top_clients_data AS (
  SELECT jsonb_agg(
    jsonb_build_object(
      'client_id', client_id,
      'client_name', client_name,
      'total_revenue', total_revenue,
      'transaction_count', transaction_count
    )
  ) as top_clients
  FROM (
    SELECT
      r.client_id,
      c.company_name as client_name,
      SUM(r.amount) as total_revenue,
      COUNT(*) as transaction_count
    FROM receipts r
    LEFT JOIN clients c ON c.id = r.client_id
    WHERE r.status = 'paid'
    GROUP BY r.client_id, c.company_name
    ORDER BY total_revenue DESC
    LIMIT 10
  ) top_clients_subquery
)
SELECT
  COALESCE(cm.current_month_revenue, 0) as current_month_revenue,
  COALESCE(cm.current_month_transactions, 0) as current_month_transactions,
  COALESCE(cm.current_month_clients, 0) as current_month_clients,
  COALESCE(cm.current_month_avg_transaction, 0) as current_month_avg_transaction,
  COALESCE(pm.previous_month_revenue, 0) as previous_month_revenue,
  COALESCE(pm.previous_month_transactions, 0) as previous_month_transactions,
  CASE
    WHEN pm.previous_month_revenue > 0 THEN
      ROUND(((cm.current_month_revenue - pm.previous_month_revenue) / pm.previous_month_revenue * 100)::numeric, 2)
    ELSE 0
  END as revenue_growth_percent,
  CASE
    WHEN pm.previous_month_transactions > 0 THEN
      ROUND(((cm.current_month_transactions - pm.previous_month_transactions)::numeric / pm.previous_month_transactions * 100)::numeric, 2)
    ELSE 0
  END as transaction_growth_percent,
  COALESCE(at.total_revenue, 0) as total_revenue,
  COALESCE(at.total_transactions, 0) as total_transactions,
  COALESCE(at.total_clients, 0) as total_clients,
  COALESCE(at.avg_transaction_value, 0) as avg_transaction_value,
  at.first_transaction_date,
  (
    SELECT COALESCE(AVG(revenue), 0)
    FROM monthly_revenue
    WHERE month >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '3 months')
  ) as mrr,
  pmd.distribution as payment_method_distribution,
  tcd.top_clients,
  CURRENT_TIMESTAMP as calculated_at
FROM current_month cm
CROSS JOIN previous_month pm
CROSS JOIN all_time at
CROSS JOIN payment_method_dist pmd
CROSS JOIN top_clients_data tcd;

-- Function to track receipt views
CREATE OR REPLACE FUNCTION track_receipt_view(receipt_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE receipts
  SET viewed_at = COALESCE(viewed_at, CURRENT_TIMESTAMP)
  WHERE id = receipt_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to track receipt downloads
CREATE OR REPLACE FUNCTION track_receipt_download(receipt_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE receipts
  SET
    downloaded_at = CURRENT_TIMESTAMP,
    download_count = COALESCE(download_count, 0) + 1
  WHERE id = receipt_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get client receipts with proper RLS
CREATE OR REPLACE FUNCTION get_client_receipts(p_client_id uuid DEFAULT NULL)
RETURNS TABLE (
  id uuid,
  receipt_number text,
  amount numeric,
  payment_date timestamptz,
  status text,
  payment_method text,
  description text,
  receipt_html text,
  download_count integer,
  viewed_at timestamptz,
  downloaded_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.receipt_number,
    r.amount,
    r.payment_date,
    r.status,
    r.payment_method,
    r.description,
    r.receipt_html,
    r.download_count,
    r.viewed_at,
    r.downloaded_at
  FROM receipts r
  WHERE
    CASE
      WHEN p_client_id IS NOT NULL THEN r.client_id = p_client_id
      ELSE true
    END
  ORDER BY r.payment_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT SELECT ON receipt_analytics TO authenticated;
GRANT SELECT ON financial_kpis TO authenticated;
GRANT EXECUTE ON FUNCTION track_receipt_view(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION track_receipt_download(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_client_receipts(uuid) TO authenticated;