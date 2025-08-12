/*
  # Deshabilitar RLS temporalmente para desarrollo

  1. Propósito
    - Deshabilitar Row Level Security en todas las tablas durante desarrollo
    - Permitir acceso completo a los datos para testing y desarrollo
    - Facilitar la depuración de problemas de autenticación

  2. Tablas afectadas
    - users: Deshabilitar RLS
    - clients: Deshabilitar RLS  
    - companies: Deshabilitar RLS
    - projects: Deshabilitar RLS
    - documents: Deshabilitar RLS
    - subscriptions: Deshabilitar RLS
    - payments: Deshabilitar RLS
    - receipts: Deshabilitar RLS
    - audit_logs: Deshabilitar RLS
    - kpis: Deshabilitar RLS
    - system_settings: Deshabilitar RLS
    - payment_gateways: Deshabilitar RLS
    - sepa_mandates: Deshabilitar RLS
    - manual_document_queue: Deshabilitar RLS
    - manual_upload_sessions: Deshabilitar RLS

  3. Nota importante
    - SOLO para desarrollo
    - Reactivar RLS antes de producción
    - Mantener políticas existentes para restaurar fácilmente
*/

-- Deshabilitar RLS en todas las tablas principales
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE receipts DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE payment_gateways DISABLE ROW LEVEL SECURITY;
ALTER TABLE sepa_mandates DISABLE ROW LEVEL SECURITY;
ALTER TABLE manual_document_queue DISABLE ROW LEVEL SECURITY;
ALTER TABLE manual_upload_sessions DISABLE ROW LEVEL SECURITY;

-- Comentario para recordar reactivar RLS
COMMENT ON TABLE users IS 'RLS DISABLED FOR DEVELOPMENT - REMEMBER TO RE-ENABLE FOR PRODUCTION';
COMMENT ON TABLE clients IS 'RLS DISABLED FOR DEVELOPMENT - REMEMBER TO RE-ENABLE FOR PRODUCTION';
COMMENT ON TABLE companies IS 'RLS DISABLED FOR DEVELOPMENT - REMEMBER TO RE-ENABLE FOR PRODUCTION';
COMMENT ON TABLE projects IS 'RLS DISABLED FOR DEVELOPMENT - REMEMBER TO RE-ENABLE FOR PRODUCTION';
COMMENT ON TABLE documents IS 'RLS DISABLED FOR DEVELOPMENT - REMEMBER TO RE-ENABLE FOR PRODUCTION';
COMMENT ON TABLE subscriptions IS 'RLS DISABLED FOR DEVELOPMENT - REMEMBER TO RE-ENABLE FOR PRODUCTION';
COMMENT ON TABLE payments IS 'RLS DISABLED FOR DEVELOPMENT - REMEMBER TO RE-ENABLE FOR PRODUCTION';
COMMENT ON TABLE receipts IS 'RLS DISABLED FOR DEVELOPMENT - REMEMBER TO RE-ENABLE FOR PRODUCTION';
COMMENT ON TABLE audit_logs IS 'RLS DISABLED FOR DEVELOPMENT - REMEMBER TO RE-ENABLE FOR PRODUCTION';
COMMENT ON TABLE kpis IS 'RLS DISABLED FOR DEVELOPMENT - REMEMBER TO RE-ENABLE FOR PRODUCTION';
COMMENT ON TABLE system_settings IS 'RLS DISABLED FOR DEVELOPMENT - REMEMBER TO RE-ENABLE FOR PRODUCTION';
COMMENT ON TABLE payment_gateways IS 'RLS DISABLED FOR DEVELOPMENT - REMEMBER TO RE-ENABLE FOR PRODUCTION';
COMMENT ON TABLE sepa_mandates IS 'RLS DISABLED FOR DEVELOPMENT - REMEMBER TO RE-ENABLE FOR PRODUCTION';
COMMENT ON TABLE manual_document_queue IS 'RLS DISABLED FOR DEVELOPMENT - REMEMBER TO RE-ENABLE FOR PRODUCTION';
COMMENT ON TABLE manual_upload_sessions IS 'RLS DISABLED FOR DEVELOPMENT - REMEMBER TO RE-ENABLE FOR PRODUCTION';