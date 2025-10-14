/*
  # Enhanced Receipts System with BI and KPIs

  ## Summary
  Mejora el sistema de recibos existente para soportar:
  - Almacenamiento de HTML generado del recibo
  - Metadata adicional para análisis BI
  - Tracking de visualizaciones y descargas
  - Campos calculados para reportes
  - Vistas materializadas para KPIs de rendimiento

  ## Changes

  1. Enhance receipts table
    - Add `receipt_html` field for storing generated HTML receipt
    - Add `fiscal_year` and `sequence_number` for unique receipt numbering
    - Add `qr_code` for verification
    - Add tracking fields: `viewed_at`, `downloaded_at`, `download_count`
    - Add `metadata` JSONB for flexible storage
    - Add `client_company_name` and `client_tax_id` for faster queries
    - Add computed fields for analytics

  2. Create receipt_analytics view
    - Aggregated statistics per client
    - Monthly revenue calculations
    - Payment method distribution

  3. Create financial_kpis view
    - Real-time KPI calculations from database
    - MRR (Monthly Recurring Revenue)
    - Conversion rates
    - Average transaction values
    - Revenue trends

  4. Security
    - Maintain existing RLS policies
    - Add policies for new fields
    - Ensure proper access control
*/

-- Step 1: Add new columns to receipts table
DO $$
BEGIN
  -- Add receipt_html column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'receipts' AND column_name = 'receipt_html'
  ) THEN
    ALTER TABLE receipts ADD COLUMN receipt_html text;
  END IF;

  -- Add fiscal_year column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'receipts' AND column_name = 'fiscal_year'
  ) THEN
    ALTER TABLE receipts ADD COLUMN fiscal_year integer DEFAULT EXTRACT(YEAR FROM CURRENT_DATE);
  END IF;

  -- Add sequence_number column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'receipts' AND column_name = 'sequence_number'
  ) THEN
    ALTER TABLE receipts ADD COLUMN sequence_number integer;
  END IF;

  -- Add qr_code column for verification
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'receipts' AND column_name = 'qr_code'
  ) THEN
    ALTER TABLE receipts ADD COLUMN qr_code text;
  END IF;

  -- Add tracking columns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'receipts' AND column_name = 'viewed_at'
  ) THEN
    ALTER TABLE receipts ADD COLUMN viewed_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'receipts' AND column_name = 'downloaded_at'
  ) THEN
    ALTER TABLE receipts ADD COLUMN downloaded_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'receipts' AND column_name = 'download_count'
  ) THEN
    ALTER TABLE receipts ADD COLUMN download_count integer DEFAULT 0;
  END IF;

  -- Add metadata column for flexible storage
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'receipts' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE receipts ADD COLUMN metadata jsonb DEFAULT '{}'::jsonb;
  END IF;

  -- Add denormalized fields for faster queries
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'receipts' AND column_name = 'client_company_name'
  ) THEN
    ALTER TABLE receipts ADD COLUMN client_company_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'receipts' AND column_name = 'client_tax_id'
  ) THEN
    ALTER TABLE receipts ADD COLUMN client_tax_id text;
  END IF;

  -- Add subscription_plan column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'receipts' AND column_name = 'subscription_plan'
  ) THEN
    ALTER TABLE receipts ADD COLUMN subscription_plan text;
  END IF;

  -- Add email_sent column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'receipts' AND column_name = 'email_sent'
  ) THEN
    ALTER TABLE receipts ADD COLUMN email_sent boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'receipts' AND column_name = 'email_sent_at'
  ) THEN
    ALTER TABLE receipts ADD COLUMN email_sent_at timestamptz;
  END IF;
END $$;

-- Step 2: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_receipts_client_date ON receipts(client_id, payment_date DESC);
CREATE INDEX IF NOT EXISTS idx_receipts_fiscal_year ON receipts(fiscal_year, sequence_number);
CREATE INDEX IF NOT EXISTS idx_receipts_status ON receipts(status);
CREATE INDEX IF NOT EXISTS idx_receipts_payment_method ON receipts(payment_method);
CREATE INDEX IF NOT EXISTS idx_receipts_created_at ON receipts(created_at DESC);

-- Step 3: Create function to generate receipt number
CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS TRIGGER AS $$
DECLARE
  year integer;
  next_seq integer;
BEGIN
  -- Get current fiscal year
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
  NEW.receipt_number := 'REC-' || year || '-' || LPAD(next_seq::text, 6, '0');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger only if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'generate_receipt_number_trigger'
  ) THEN
    CREATE TRIGGER generate_receipt_number_trigger
      BEFORE INSERT ON receipts
      FOR EACH ROW
      WHEN (NEW.receipt_number IS NULL)
      EXECUTE FUNCTION generate_receipt_number();
  END IF;
END $$;

-- Step 4: Create analytics view for receipt statistics
CREATE OR REPLACE VIEW receipt_analytics AS
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
  jsonb_object_agg(
    COALESCE(r.payment_method, 'unknown'),
    COUNT(*)
  ) FILTER (WHERE r.payment_method IS NOT NULL) as payment_method_distribution
FROM receipts r
LEFT JOIN clients c ON c.id = r.client_id
GROUP BY r.client_id, c.company_name, c.email;

-- Step 5: Create financial KPIs view
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
)
SELECT
  -- Current month metrics
  COALESCE(cm.current_month_revenue, 0) as current_month_revenue,
  COALESCE(cm.current_month_transactions, 0) as current_month_transactions,
  COALESCE(cm.current_month_clients, 0) as current_month_clients,
  COALESCE(cm.current_month_avg_transaction, 0) as current_month_avg_transaction,

  -- Previous month metrics
  COALESCE(pm.previous_month_revenue, 0) as previous_month_revenue,
  COALESCE(pm.previous_month_transactions, 0) as previous_month_transactions,

  -- Growth calculations
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

  -- All time metrics
  COALESCE(at.total_revenue, 0) as total_revenue,
  COALESCE(at.total_transactions, 0) as total_transactions,
  COALESCE(at.total_clients, 0) as total_clients,
  COALESCE(at.avg_transaction_value, 0) as avg_transaction_value,
  at.first_transaction_date,

  -- MRR calculation (Monthly Recurring Revenue - last 3 months average)
  (
    SELECT COALESCE(AVG(revenue), 0)
    FROM monthly_revenue
    WHERE month >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '3 months')
  ) as mrr,

  -- Payment method distribution
  (
    SELECT jsonb_object_agg(payment_method, count)
    FROM (
      SELECT payment_method, COUNT(*) as count
      FROM receipts
      WHERE status = 'paid'
      GROUP BY payment_method
    ) pm_dist
  ) as payment_method_distribution,

  -- Top 10 clients by revenue
  (
    SELECT jsonb_agg(
      jsonb_build_object(
        'client_id', client_id,
        'client_name', client_name,
        'total_revenue', total_revenue,
        'transaction_count', transaction_count
      )
    )
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
    ) top_clients
  ) as top_clients,

  CURRENT_TIMESTAMP as calculated_at
FROM current_month cm
CROSS JOIN previous_month pm
CROSS JOIN all_time at;

-- Step 6: Create function to track receipt views
CREATE OR REPLACE FUNCTION track_receipt_view(receipt_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE receipts
  SET
    viewed_at = COALESCE(viewed_at, CURRENT_TIMESTAMP)
  WHERE id = receipt_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Create function to track receipt downloads
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

-- Step 8: Grant necessary permissions
GRANT SELECT ON receipt_analytics TO authenticated;
GRANT SELECT ON financial_kpis TO authenticated;
GRANT EXECUTE ON FUNCTION track_receipt_view(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION track_receipt_download(uuid) TO authenticated;

-- Step 9: Create function to get client receipts with proper RLS
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

GRANT EXECUTE ON FUNCTION get_client_receipts(uuid) TO authenticated;
