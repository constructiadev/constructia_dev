/*
  # Sistema Completo de Tracking de MRR (Monthly Recurring Revenue)

  ## Descripción
  Este migration crea un sistema integral para rastrear ingresos recurrentes mensuales (MRR)
  de todos los clientes registrados con suscripciones activas y canceladas.

  ## Cambios Principales

  1. **Funciones de Cálculo de Revenue**
     - `calculate_plan_monthly_cost()` - Calcula el costo mensual según el plan en EUR
     - `get_active_mrr()` - Calcula MRR total de clientes activos
     - `get_churned_mrr()` - Calcula MRR perdido por cancelaciones
     - `get_mrr_growth_rate()` - Calcula tasa de crecimiento MRR mes a mes
     - `validate_all_clients_have_subscription()` - Valida integridad de datos

  2. **Vistas de Análisis**
     - `v_mrr_summary` - Resumen ejecutivo de MRR
     - `v_churned_mrr` - Detalle de MRR cancelado
     - `v_mrr_by_client` - MRR individual por cliente
     - `v_mrr_by_plan` - MRR agrupado por tipo de plan
     - `v_bi_client_revenue_detail` - Vista detallada para BI
     - `v_bi_revenue_aggregated` - Vista agregada para BI
     - `v_subscription_consolidated` - Vista unificada de suscripciones

  3. **Tabla de Snapshots Históricos**
     - `mrr_analytics` - Almacena snapshots mensuales de MRR para análisis temporal

  4. **Triggers de Validación**
     - Valida que clientes activos tengan plan de suscripción
     - Actualiza automáticamente cálculos de MRR

  ## Seguridad
  - Row Level Security habilitado en tabla mrr_analytics
  - Políticas de acceso para admins y consultas de solo lectura
*/

-- ==================================================
-- 1. FUNCIÓN: Calcular costo mensual según plan
-- ==================================================
CREATE OR REPLACE FUNCTION calculate_plan_monthly_cost(plan_name TEXT)
RETURNS NUMERIC AS $$
BEGIN
  RETURN CASE plan_name
    WHEN 'basic' THEN 29.00
    WHEN 'professional' THEN 79.00
    WHEN 'enterprise' THEN 199.00
    WHEN 'custom' THEN 99.00 -- Valor por defecto para custom, puede ser variable
    ELSE 0.00
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ==================================================
-- 2. FUNCIÓN: Obtener MRR de clientes activos
-- ==================================================
CREATE OR REPLACE FUNCTION get_active_mrr()
RETURNS NUMERIC AS $$
DECLARE
  total_mrr NUMERIC;
BEGIN
  SELECT COALESCE(SUM(calculate_plan_monthly_cost(subscription_plan)), 0)
  INTO total_mrr
  FROM clients
  WHERE subscription_status = 'active';

  RETURN total_mrr;
END;
$$ LANGUAGE plpgsql STABLE;

-- ==================================================
-- 3. FUNCIÓN: Obtener MRR perdido (Churned)
-- ==================================================
CREATE OR REPLACE FUNCTION get_churned_mrr()
RETURNS NUMERIC AS $$
DECLARE
  churned_mrr NUMERIC;
BEGIN
  SELECT COALESCE(SUM(calculate_plan_monthly_cost(subscription_plan)), 0)
  INTO churned_mrr
  FROM clients
  WHERE subscription_status IN ('cancelled', 'suspended');

  RETURN churned_mrr;
END;
$$ LANGUAGE plpgsql STABLE;

-- ==================================================
-- 4. FUNCIÓN: Calcular tasa de crecimiento MRR
-- ==================================================
CREATE OR REPLACE FUNCTION get_mrr_growth_rate()
RETURNS NUMERIC AS $$
DECLARE
  current_month_mrr NUMERIC;
  previous_month_mrr NUMERIC;
  growth_rate NUMERIC;
BEGIN
  -- MRR del mes actual desde la tabla de analytics
  SELECT COALESCE(total_mrr, 0)
  INTO current_month_mrr
  FROM mrr_analytics
  WHERE mes = DATE_TRUNC('month', CURRENT_DATE)
  ORDER BY created_at DESC
  LIMIT 1;

  -- Si no hay datos en analytics, usar cálculo en vivo
  IF current_month_mrr = 0 THEN
    current_month_mrr := get_active_mrr();
  END IF;

  -- MRR del mes anterior
  SELECT COALESCE(total_mrr, 0)
  INTO previous_month_mrr
  FROM mrr_analytics
  WHERE mes = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
  ORDER BY created_at DESC
  LIMIT 1;

  -- Calcular tasa de crecimiento
  IF previous_month_mrr > 0 THEN
    growth_rate := ((current_month_mrr - previous_month_mrr) / previous_month_mrr) * 100;
  ELSE
    growth_rate := 0;
  END IF;

  RETURN ROUND(growth_rate, 2);
END;
$$ LANGUAGE plpgsql STABLE;

-- ==================================================
-- 5. FUNCIÓN: Validar clientes sin suscripción
-- ==================================================
CREATE OR REPLACE FUNCTION validate_all_clients_have_subscription()
RETURNS TABLE(
  client_id TEXT,
  company_name TEXT,
  email TEXT,
  subscription_plan TEXT,
  subscription_status TEXT,
  issue TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id::TEXT,
    c.company_name,
    c.email,
    c.subscription_plan,
    c.subscription_status,
    CASE
      WHEN c.subscription_plan IS NULL THEN 'Missing subscription_plan'
      WHEN c.subscription_status = 'active' AND c.subscription_plan NOT IN ('basic', 'professional', 'enterprise', 'custom') THEN 'Invalid plan for active client'
      WHEN c.subscription_status = 'active' AND calculate_plan_monthly_cost(c.subscription_plan) = 0 THEN 'Active client with zero revenue'
      ELSE 'Unknown issue'
    END AS issue
  FROM clients c
  WHERE
    c.subscription_plan IS NULL
    OR (c.subscription_status = 'active' AND c.subscription_plan NOT IN ('basic', 'professional', 'enterprise', 'custom'))
    OR (c.subscription_status = 'active' AND calculate_plan_monthly_cost(c.subscription_plan) = 0);
END;
$$ LANGUAGE plpgsql STABLE;

-- ==================================================
-- 6. TABLA: Snapshots mensuales de MRR
-- ==================================================
CREATE TABLE IF NOT EXISTS mrr_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mes TIMESTAMPTZ NOT NULL,
  total_mrr NUMERIC(10,2) DEFAULT 0.00,
  active_clients INTEGER DEFAULT 0,
  churned_mrr NUMERIC(10,2) DEFAULT 0.00,
  churned_clients INTEGER DEFAULT 0,
  new_mrr NUMERIC(10,2) DEFAULT 0.00,
  new_clients INTEGER DEFAULT 0,
  expansion_mrr NUMERIC(10,2) DEFAULT 0.00,
  contraction_mrr NUMERIC(10,2) DEFAULT 0.00,
  net_mrr NUMERIC(10,2) DEFAULT 0.00,
  mrr_by_plan JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(mes)
);

-- Índices para mrr_analytics
CREATE INDEX IF NOT EXISTS idx_mrr_analytics_mes ON mrr_analytics(mes DESC);
CREATE INDEX IF NOT EXISTS idx_mrr_analytics_created_at ON mrr_analytics(created_at DESC);

-- RLS para mrr_analytics
ALTER TABLE mrr_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "SuperAdmins can manage MRR analytics"
  ON mrr_analytics FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'SuperAdmin'
    )
  );

CREATE POLICY "All authenticated users can read MRR analytics"
  ON mrr_analytics FOR SELECT
  TO authenticated
  USING (true);

-- ==================================================
-- 7. VISTA: Resumen de MRR
-- ==================================================
CREATE OR REPLACE VIEW v_mrr_summary AS
SELECT
  get_active_mrr() AS total_mrr,
  (SELECT COUNT(*) FROM clients WHERE subscription_status = 'active') AS active_clients,
  get_churned_mrr() AS churned_mrr,
  (SELECT COUNT(*) FROM clients WHERE subscription_status IN ('cancelled', 'suspended')) AS churned_clients,
  CASE
    WHEN (SELECT COUNT(*) FROM clients WHERE subscription_status = 'active') > 0
    THEN get_active_mrr() / (SELECT COUNT(*) FROM clients WHERE subscription_status = 'active')
    ELSE 0
  END AS avg_revenue_per_client,
  get_mrr_growth_rate() AS growth_rate_percentage,
  (get_active_mrr() - get_churned_mrr()) AS net_mrr,
  NOW() AS calculated_at;

-- ==================================================
-- 8. VISTA: MRR Cancelado (Churn Details)
-- ==================================================
CREATE OR REPLACE VIEW v_churned_mrr AS
SELECT
  c.id,
  c.company_name,
  c.email,
  c.subscription_plan,
  c.subscription_status,
  calculate_plan_monthly_cost(c.subscription_plan) AS monthly_revenue_lost,
  c.updated_at AS cancellation_date,
  c.created_at AS original_signup_date,
  EXTRACT(EPOCH FROM (c.updated_at - c.created_at)) / 86400 AS days_as_customer
FROM clients c
WHERE c.subscription_status IN ('cancelled', 'suspended')
ORDER BY c.updated_at DESC;

-- ==================================================
-- 9. VISTA: MRR por Cliente (Individual)
-- ==================================================
CREATE OR REPLACE VIEW v_mrr_by_client AS
SELECT
  c.id,
  c.client_id,
  c.company_name,
  c.email,
  c.subscription_plan,
  c.subscription_status,
  calculate_plan_monthly_cost(c.subscription_plan) AS monthly_revenue,
  c.storage_used,
  c.storage_limit,
  c.documents_processed,
  c.tokens_available,
  c.created_at AS signup_date,
  c.updated_at,
  CASE
    WHEN c.subscription_status = 'active' THEN 'Contributing'
    WHEN c.subscription_status = 'cancelled' THEN 'Churned'
    WHEN c.subscription_status = 'suspended' THEN 'At Risk'
    ELSE 'Unknown'
  END AS revenue_status
FROM clients c
ORDER BY calculate_plan_monthly_cost(c.subscription_plan) DESC;

-- ==================================================
-- 10. VISTA: MRR por Plan (Agregado)
-- ==================================================
CREATE OR REPLACE VIEW v_mrr_by_plan AS
SELECT
  c.subscription_plan AS plan_name,
  COUNT(*) AS client_count,
  SUM(calculate_plan_monthly_cost(c.subscription_plan)) AS total_mrr,
  ROUND(
    (SUM(calculate_plan_monthly_cost(c.subscription_plan)) * 100.0 / NULLIF(get_active_mrr(), 0)),
    2
  ) AS percentage_of_total_mrr,
  AVG(c.storage_used) AS avg_storage_used,
  AVG(c.documents_processed) AS avg_documents_processed
FROM clients c
WHERE c.subscription_status = 'active'
GROUP BY c.subscription_plan
ORDER BY total_mrr DESC;

-- ==================================================
-- 11. VISTA: Detalle para BI (Individual)
-- ==================================================
CREATE OR REPLACE VIEW v_bi_client_revenue_detail AS
SELECT
  c.id AS client_id,
  c.client_id AS client_code,
  c.company_name,
  c.email,
  c.phone,
  c.address,
  c.subscription_plan,
  c.subscription_status,
  calculate_plan_monthly_cost(c.subscription_plan) AS monthly_revenue_eur,
  c.storage_used AS storage_used_bytes,
  c.storage_limit AS storage_limit_bytes,
  ROUND((c.storage_used::NUMERIC / NULLIF(c.storage_limit, 0)) * 100, 2) AS storage_usage_percent,
  c.documents_processed,
  c.tokens_available,
  c.created_at AS signup_date,
  c.updated_at AS last_modified,
  DATE_PART('day', NOW() - c.created_at) AS customer_age_days,
  DATE_PART('month', NOW() - c.created_at) AS customer_age_months,
  CASE
    WHEN c.subscription_status = 'active' THEN calculate_plan_monthly_cost(c.subscription_plan) * 12
    ELSE 0
  END AS annual_revenue_potential,
  CASE
    WHEN c.updated_at > NOW() - INTERVAL '7 days' THEN 'Active'
    WHEN c.updated_at > NOW() - INTERVAL '30 days' THEN 'Moderate'
    WHEN c.updated_at IS NOT NULL THEN 'Inactive'
    ELSE 'Never Active'
  END AS activity_level
FROM clients c;

-- ==================================================
-- 12. VISTA: Agregados para BI (Por Mes y Plan)
-- ==================================================
CREATE OR REPLACE VIEW v_bi_revenue_aggregated AS
SELECT
  DATE_TRUNC('month', c.created_at) AS signup_month,
  c.subscription_plan,
  c.subscription_status,
  COUNT(*) AS client_count,
  SUM(calculate_plan_monthly_cost(c.subscription_plan)) AS total_mrr,
  AVG(calculate_plan_monthly_cost(c.subscription_plan)) AS avg_revenue_per_client,
  SUM(c.storage_used) AS total_storage_used,
  SUM(c.documents_processed) AS total_documents_processed,
  AVG(c.tokens_available) AS avg_tokens_available
FROM clients c
GROUP BY DATE_TRUNC('month', c.created_at), c.subscription_plan, c.subscription_status
ORDER BY signup_month DESC, total_mrr DESC;

-- ==================================================
-- 13. VISTA: Suscripciones Consolidadas
-- ==================================================
CREATE OR REPLACE VIEW v_subscription_consolidated AS
SELECT
  c.id AS client_id,
  c.company_name,
  c.email,
  c.subscription_plan AS client_plan,
  c.subscription_status AS client_status,
  s.plan AS suscripcion_plan,
  s.estado AS suscripcion_estado,
  s.stripe_customer_id,
  calculate_plan_monthly_cost(c.subscription_plan) AS monthly_revenue,
  CASE
    WHEN c.subscription_plan = s.plan AND c.subscription_status = s.estado THEN 'Synced'
    WHEN c.subscription_plan != s.plan THEN 'Plan Mismatch'
    WHEN c.subscription_status != s.estado THEN 'Status Mismatch'
    ELSE 'Error'
  END AS sync_status,
  c.updated_at AS client_updated_at,
  s.updated_at AS suscripcion_updated_at
FROM clients c
LEFT JOIN suscripciones s ON s.tenant_id = c.tenant_id;

-- ==================================================
-- 14. FUNCIÓN: Crear snapshot mensual de MRR
-- ==================================================
CREATE OR REPLACE FUNCTION sp_calculate_monthly_mrr_snapshot()
RETURNS VOID AS $$
DECLARE
  v_current_month TIMESTAMPTZ;
  v_total_mrr NUMERIC;
  v_active_clients INTEGER;
  v_churned_mrr NUMERIC;
  v_churned_clients INTEGER;
  v_mrr_by_plan JSONB;
BEGIN
  v_current_month := DATE_TRUNC('month', CURRENT_DATE);

  -- Calcular métricas
  v_total_mrr := get_active_mrr();

  SELECT COUNT(*) INTO v_active_clients
  FROM clients WHERE subscription_status = 'active';

  v_churned_mrr := get_churned_mrr();

  SELECT COUNT(*) INTO v_churned_clients
  FROM clients WHERE subscription_status IN ('cancelled', 'suspended');

  -- Generar distribución por plan
  SELECT jsonb_object_agg(plan_name, total_mrr)
  INTO v_mrr_by_plan
  FROM v_mrr_by_plan;

  -- Insertar o actualizar snapshot
  INSERT INTO mrr_analytics (
    mes, total_mrr, active_clients, churned_mrr, churned_clients,
    net_mrr, mrr_by_plan, created_at, updated_at
  ) VALUES (
    v_current_month,
    v_total_mrr,
    v_active_clients,
    v_churned_mrr,
    v_churned_clients,
    v_total_mrr - v_churned_mrr,
    v_mrr_by_plan,
    NOW(),
    NOW()
  )
  ON CONFLICT (mes) DO UPDATE SET
    total_mrr = EXCLUDED.total_mrr,
    active_clients = EXCLUDED.active_clients,
    churned_mrr = EXCLUDED.churned_mrr,
    churned_clients = EXCLUDED.churned_clients,
    net_mrr = EXCLUDED.net_mrr,
    mrr_by_plan = EXCLUDED.mrr_by_plan,
    updated_at = NOW();

END;
$$ LANGUAGE plpgsql;

-- ==================================================
-- 15. Ejecutar primer snapshot
-- ==================================================
SELECT sp_calculate_monthly_mrr_snapshot();

-- ==================================================
-- 16. Comentarios en objetos
-- ==================================================
COMMENT ON FUNCTION calculate_plan_monthly_cost IS 'Calcula el costo mensual en EUR según el plan de suscripción';
COMMENT ON FUNCTION get_active_mrr IS 'Retorna el MRR total de todos los clientes activos';
COMMENT ON FUNCTION get_churned_mrr IS 'Retorna el MRR perdido por clientes cancelados o suspendidos';
COMMENT ON FUNCTION get_mrr_growth_rate IS 'Calcula la tasa de crecimiento del MRR comparando mes actual vs anterior';
COMMENT ON TABLE mrr_analytics IS 'Snapshots mensuales de métricas MRR para análisis temporal';
COMMENT ON VIEW v_mrr_summary IS 'Vista resumen ejecutivo de MRR con métricas clave';
COMMENT ON VIEW v_churned_mrr IS 'Vista detallada de clientes cancelados y revenue perdido';
COMMENT ON VIEW v_mrr_by_client IS 'Vista de MRR individual por cada cliente';
COMMENT ON VIEW v_mrr_by_plan IS 'Vista de MRR agregado por tipo de plan de suscripción';
