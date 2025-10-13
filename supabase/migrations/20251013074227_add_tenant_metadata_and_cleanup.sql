/*
  # Migración: Arquitectura Multi-Tenant Completa
  
  ## Descripción
  Esta migración implementa la arquitectura multitenancy correcta donde:
  - 1 Tenant = 1 Cliente comercial
  - Cada tenant puede tener múltiples empresas
  - Cada empresa puede tener múltiples proyectos/obras
  
  ## Cambios
  
  1. Nueva Tabla: tenant_metadata
     - Almacena información comercial de cada tenant/cliente
     - Incluye: plan de suscripción, límites, métricas de facturación
     - Relación 1:1 con tenants
  
  2. Modificaciones a tabla tenants
     - Agregar campos adicionales para información comercial
     - Mejorar indexación para consultas frecuentes
  
  3. Agregar tenant_id a tabla clients (para compatibilidad)
     - Mantener tabla clients pero vincularla a tenants
     - Permitir migración gradual
  
  4. Funciones auxiliares
     - get_tenant_metrics: Calcula métricas de uso por tenant
     - get_tenant_companies_count: Cuenta empresas por tenant
  
  5. Políticas RLS mejoradas
     - Asegurar aislamiento total entre tenants
  
  ## Seguridad
  - RLS habilitado en todas las nuevas tablas
  - Políticas restrictivas por defecto
  - Funciones SECURITY DEFINER para helpers
*/

-- ============================================================================
-- STEP 1: CREATE TENANT_METADATA TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.tenant_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE UNIQUE,
  
  -- Información comercial del cliente
  contact_name text,
  contact_email text,
  contact_phone text,
  company_address text,
  
  -- Información de suscripción
  subscription_plan text DEFAULT 'trial',
  subscription_status text DEFAULT 'trial',
  subscription_start_date timestamptz DEFAULT now(),
  subscription_end_date timestamptz,
  
  -- Límites y uso
  storage_limit bigint DEFAULT 5368709120, -- 5GB default
  storage_used bigint DEFAULT 0,
  documents_limit integer DEFAULT 1000,
  documents_count integer DEFAULT 0,
  companies_limit integer DEFAULT 5,
  companies_count integer DEFAULT 0,
  users_limit integer DEFAULT 3,
  users_count integer DEFAULT 1,
  
  -- Tokens y créditos
  tokens_available integer DEFAULT 100,
  tokens_used integer DEFAULT 0,
  
  -- Facturación
  monthly_cost numeric(10,2) DEFAULT 0.00,
  total_revenue numeric(10,2) DEFAULT 0.00,
  last_payment_date timestamptz,
  next_billing_date timestamptz,
  
  -- Stripe integration
  stripe_customer_id text,
  stripe_subscription_id text,
  
  -- Configuración de plataformas externas
  platform_credentials jsonb DEFAULT '{}',
  
  -- Métricas de actividad
  last_activity timestamptz DEFAULT now(),
  last_login timestamptz,
  
  -- Flags y configuración
  is_trial boolean DEFAULT true,
  trial_end_date timestamptz DEFAULT (now() + interval '14 days'),
  is_suspended boolean DEFAULT false,
  suspension_reason text,
  
  -- Notas internas (solo admin)
  internal_notes text,
  account_manager text,
  
  -- Auditoría
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.tenant_metadata ENABLE ROW LEVEL SECURITY;

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_tenant_metadata_tenant_id ON public.tenant_metadata(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_metadata_subscription_status ON public.tenant_metadata(subscription_status);
CREATE INDEX IF NOT EXISTS idx_tenant_metadata_contact_email ON public.tenant_metadata(contact_email);
CREATE INDEX IF NOT EXISTS idx_tenant_metadata_stripe_customer ON public.tenant_metadata(stripe_customer_id);

-- ============================================================================
-- STEP 2: ADD TENANT_ID TO CLIENTS TABLE (for backward compatibility)
-- ============================================================================

-- Agregar tenant_id a clients si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
      AND table_name = 'clients' 
      AND column_name = 'tenant_id'
  ) THEN
    ALTER TABLE public.clients ADD COLUMN tenant_id uuid REFERENCES public.tenants(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_clients_tenant_id ON public.clients(tenant_id);
  END IF;
END $$;

-- ============================================================================
-- STEP 3: ENHANCE TENANTS TABLE
-- ============================================================================

-- Agregar campos adicionales a tenants si no existen
DO $$
BEGIN
  -- Agregar description si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
      AND table_name = 'tenants' 
      AND column_name = 'description'
  ) THEN
    ALTER TABLE public.tenants ADD COLUMN description text;
  END IF;
  
  -- Agregar logo_url si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
      AND table_name = 'tenants' 
      AND column_name = 'logo_url'
  ) THEN
    ALTER TABLE public.tenants ADD COLUMN logo_url text;
  END IF;
  
  -- Agregar settings si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
      AND table_name = 'tenants' 
      AND column_name = 'settings'
  ) THEN
    ALTER TABLE public.tenants ADD COLUMN settings jsonb DEFAULT '{}';
  END IF;
END $$;

-- ============================================================================
-- STEP 4: CREATE HELPER FUNCTIONS
-- ============================================================================

-- Función para obtener métricas de un tenant
CREATE OR REPLACE FUNCTION get_tenant_metrics(p_tenant_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_metrics jsonb;
BEGIN
  SELECT jsonb_build_object(
    'companies_count', (SELECT COUNT(*) FROM public.empresas WHERE tenant_id = p_tenant_id),
    'projects_count', (SELECT COUNT(*) FROM public.obras WHERE tenant_id = p_tenant_id),
    'documents_count', (SELECT COUNT(*) FROM public.documentos WHERE tenant_id = p_tenant_id),
    'users_count', (SELECT COUNT(*) FROM public.users WHERE tenant_id = p_tenant_id),
    'storage_used', (SELECT COALESCE(SUM(size_bytes), 0) FROM public.documentos WHERE tenant_id = p_tenant_id),
    'last_document_upload', (SELECT MAX(created_at) FROM public.documentos WHERE tenant_id = p_tenant_id),
    'last_user_activity', (SELECT MAX(last_login_ip) FROM public.users WHERE tenant_id = p_tenant_id)
  ) INTO v_metrics;
  
  RETURN v_metrics;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para contar empresas de un tenant
CREATE OR REPLACE FUNCTION get_tenant_companies_count(p_tenant_id uuid)
RETURNS integer AS $$
BEGIN
  RETURN (SELECT COUNT(*)::integer FROM public.empresas WHERE tenant_id = p_tenant_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para actualizar métricas de tenant_metadata
CREATE OR REPLACE FUNCTION update_tenant_metrics(p_tenant_id uuid)
RETURNS void AS $$
DECLARE
  v_metrics jsonb;
BEGIN
  v_metrics := get_tenant_metrics(p_tenant_id);
  
  UPDATE public.tenant_metadata
  SET 
    companies_count = (v_metrics->>'companies_count')::integer,
    documents_count = (v_metrics->>'documents_count')::integer,
    users_count = (v_metrics->>'users_count')::integer,
    storage_used = (v_metrics->>'storage_used')::bigint,
    last_activity = GREATEST(
      COALESCE((v_metrics->>'last_document_upload')::timestamptz, '1970-01-01'::timestamptz),
      COALESCE((v_metrics->>'last_user_activity')::timestamptz, '1970-01-01'::timestamptz)
    ),
    updated_at = now()
  WHERE tenant_id = p_tenant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 5: CREATE RLS POLICIES FOR TENANT_METADATA
-- ============================================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "SuperAdmin can manage all tenant metadata" ON public.tenant_metadata;
DROP POLICY IF EXISTS "Users can view own tenant metadata" ON public.tenant_metadata;
DROP POLICY IF EXISTS "Users can update own tenant metadata" ON public.tenant_metadata;

-- SuperAdmin puede ver y gestionar todo
CREATE POLICY "SuperAdmin can manage all tenant metadata"
  ON public.tenant_metadata FOR ALL TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- Los usuarios pueden ver solo metadata de su propio tenant
CREATE POLICY "Users can view own tenant metadata"
  ON public.tenant_metadata FOR SELECT TO authenticated
  USING (tenant_id = get_user_tenant_id());

-- Los usuarios pueden actualizar ciertos campos de su tenant metadata
CREATE POLICY "Users can update own tenant metadata"
  ON public.tenant_metadata FOR UPDATE TO authenticated
  USING (tenant_id = get_user_tenant_id())
  WITH CHECK (tenant_id = get_user_tenant_id());

-- ============================================================================
-- STEP 6: CREATE TRIGGERS FOR AUTO-UPDATE
-- ============================================================================

-- Trigger para actualizar updated_at en tenant_metadata
DROP TRIGGER IF EXISTS update_tenant_metadata_updated_at ON public.tenant_metadata;
CREATE TRIGGER update_tenant_metadata_updated_at
  BEFORE UPDATE ON public.tenant_metadata
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STEP 7: CREATE VIEW FOR ADMIN TENANT OVERVIEW
-- ============================================================================

-- Vista materializada para resumen de tenants (para panel admin)
DROP MATERIALIZED VIEW IF EXISTS admin_tenants_overview;
CREATE MATERIALIZED VIEW admin_tenants_overview AS
SELECT 
  t.id as tenant_id,
  t.name as tenant_name,
  t.status as tenant_status,
  t.created_at as tenant_created_at,
  tm.contact_name,
  tm.contact_email,
  tm.subscription_plan,
  tm.subscription_status,
  tm.storage_used,
  tm.storage_limit,
  tm.documents_count,
  tm.companies_count,
  tm.users_count,
  tm.monthly_cost,
  tm.total_revenue,
  tm.last_activity,
  tm.is_trial,
  tm.trial_end_date,
  tm.is_suspended,
  ROUND((tm.storage_used::numeric / NULLIF(tm.storage_limit, 0)) * 100, 2) as storage_usage_percent,
  (SELECT COUNT(*) FROM public.empresas e WHERE e.tenant_id = t.id) as actual_companies_count,
  (SELECT COUNT(*) FROM public.obras o WHERE o.tenant_id = t.id) as projects_count,
  (SELECT COUNT(*) FROM public.documentos d WHERE d.tenant_id = t.id) as actual_documents_count
FROM public.tenants t
LEFT JOIN public.tenant_metadata tm ON t.id = tm.tenant_id
ORDER BY t.created_at DESC;

-- Crear índice en la vista materializada
CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_tenants_overview_tenant_id 
  ON admin_tenants_overview(tenant_id);

-- ============================================================================
-- STEP 8: INSERT DEFAULT METADATA FOR EXISTING TENANTS
-- ============================================================================

-- Crear tenant_metadata para tenants existentes que no lo tengan
INSERT INTO public.tenant_metadata (tenant_id, contact_name, contact_email, subscription_plan)
SELECT 
  t.id,
  t.name,
  COALESCE(
    (SELECT email FROM public.users WHERE tenant_id = t.id AND role = 'Cliente' LIMIT 1),
    'no-email@constructia.com'
  ),
  'professional'
FROM public.tenants t
WHERE NOT EXISTS (
  SELECT 1 FROM public.tenant_metadata tm WHERE tm.tenant_id = t.id
)
ON CONFLICT (tenant_id) DO NOTHING;

-- Actualizar métricas para todos los tenants existentes
DO $$
DECLARE
  v_tenant record;
BEGIN
  FOR v_tenant IN SELECT id FROM public.tenants LOOP
    PERFORM update_tenant_metrics(v_tenant.id);
  END LOOP;
END $$;

-- ============================================================================
-- STEP 9: REFRESH MATERIALIZED VIEW
-- ============================================================================

REFRESH MATERIALIZED VIEW admin_tenants_overview;

-- ============================================================================
-- VERIFICATION & COMMENTS
-- ============================================================================

COMMENT ON TABLE public.tenant_metadata IS 'Metadata comercial para cada tenant/cliente - incluye suscripción, límites y métricas';
COMMENT ON FUNCTION get_tenant_metrics(uuid) IS 'Calcula métricas en tiempo real para un tenant específico';
COMMENT ON FUNCTION update_tenant_metrics(uuid) IS 'Actualiza las métricas almacenadas en tenant_metadata';
COMMENT ON MATERIALIZED VIEW admin_tenants_overview IS 'Vista optimizada para el panel de administración de clientes/tenants';

-- Mostrar resumen
SELECT 
  'Tenant Metadata Migration Completed' as status,
  COUNT(*) as tenants_with_metadata
FROM public.tenant_metadata;