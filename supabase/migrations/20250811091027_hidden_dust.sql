/*
  # Desactivar RLS temporalmente para desarrollo

  1. Desactivación de RLS
    - Desactiva RLS en todas las tablas existentes
    - Permite acceso completo a todos los datos durante desarrollo
    - Facilita testing y debugging

  2. Tablas afectadas
    - users
    - clients
    - companies
    - projects
    - documents
    - subscriptions
    - payments
    - receipts
    - payment_gateways
    - system_settings
    - kpis
    - audit_logs
    - sepa_mandates
    - manual_document_queue
    - manual_upload_sessions

  3. Nota importante
    - Esta configuración es SOLO para desarrollo
    - Se debe reactivar RLS antes de producción
    - Los datos están temporalmente sin protección
*/

-- Desactivar RLS en todas las tablas
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE receipts DISABLE ROW LEVEL SECURITY;
ALTER TABLE payment_gateways DISABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE sepa_mandates DISABLE ROW LEVEL SECURITY;
ALTER TABLE manual_document_queue DISABLE ROW LEVEL SECURITY;
ALTER TABLE manual_upload_sessions DISABLE ROW LEVEL SECURITY;

-- Crear función para reactivar RLS cuando sea necesario
CREATE OR REPLACE FUNCTION enable_all_rls()
RETURNS void AS $$
BEGIN
  -- Reactivar RLS en todas las tablas
  ALTER TABLE users ENABLE ROW LEVEL SECURITY;
  ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
  ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
  ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
  ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
  ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
  ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
  ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
  ALTER TABLE payment_gateways ENABLE ROW LEVEL SECURITY;
  ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
  ALTER TABLE kpis ENABLE ROW LEVEL SECURITY;
  ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
  ALTER TABLE sepa_mandates ENABLE ROW LEVEL SECURITY;
  ALTER TABLE manual_document_queue ENABLE ROW LEVEL SECURITY;
  ALTER TABLE manual_upload_sessions ENABLE ROW LEVEL SECURITY;
  
  RAISE NOTICE 'RLS reactivado en todas las tablas';
END;
$$ LANGUAGE plpgsql;

-- Comentario para recordar reactivar RLS
COMMENT ON FUNCTION enable_all_rls() IS 'Función para reactivar RLS en todas las tablas cuando termine el desarrollo';

-- Insertar configuración del sistema para recordar el estado
INSERT INTO system_settings (key, value, description) 
VALUES (
  'rls_disabled_for_development', 
  true, 
  'RLS desactivado temporalmente para desarrollo - REACTIVAR ANTES DE PRODUCCIÓN'
) ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  updated_at = now();