/*
  # Crear tablas faltantes para sincronizar con datos mock

  1. Nuevas Tablas
    - `kpis` - Métricas e indicadores clave de rendimiento
    - `payment_gateways` - Configuración de pasarelas de pago
    
  2. Seguridad
    - Habilitar RLS en todas las nuevas tablas
    - Políticas de acceso basadas en roles
    
  3. Funcionalidad
    - Triggers para updated_at automático
    - Constraints para validación de datos
*/

-- Crear tabla KPIs
CREATE TABLE IF NOT EXISTS public.kpis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  value text NOT NULL,
  change numeric DEFAULT 0,
  trend text CHECK (trend IN ('up', 'down', 'stable')) DEFAULT 'stable',
  period text CHECK (period IN ('daily', 'weekly', 'monthly', 'yearly')) DEFAULT 'monthly',
  category text DEFAULT 'general',
  description text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Crear tabla Payment Gateways
CREATE TABLE IF NOT EXISTS public.payment_gateways (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  type text CHECK (type IN ('stripe', 'paypal', 'sepa', 'bizum', 'custom')) NOT NULL,
  status text CHECK (status IN ('active', 'inactive', 'warning')) DEFAULT 'active',
  commission_type text CHECK (commission_type IN ('percentage', 'fixed', 'mixed')) NOT NULL,
  commission_percentage numeric CHECK (commission_percentage >= 0 AND commission_percentage <= 100),
  commission_fixed numeric CHECK (commission_fixed >= 0),
  api_key text,
  secret_key text,
  webhook_url text,
  supported_currencies jsonb DEFAULT '["EUR"]'::jsonb,
  min_amount numeric DEFAULT 1,
  max_amount numeric DEFAULT 10000,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_gateways ENABLE ROW LEVEL SECURITY;

-- Políticas para KPIs
CREATE POLICY "Authenticated users can read KPIs"
  ON public.kpis
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage KPIs"
  ON public.kpis
  FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
  );

-- Políticas para Payment Gateways
CREATE POLICY "Admins can manage payment gateways"
  ON public.payment_gateways
  FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
  );

-- Triggers para updated_at
CREATE TRIGGER update_kpis_updated_at
  BEFORE UPDATE ON public.kpis
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_gateways_updated_at
  BEFORE UPDATE ON public.payment_gateways
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();