/*
  # Populate Compliance Data

  1. Initial compliance checks data
  2. Sample privacy impact assessments
  3. Sample consent records
  4. Default compliance configuration
*/

-- Insert initial compliance checks
INSERT INTO compliance_checks (category, check_name, status, description, last_verified, next_review) VALUES
-- Principios Fundamentales LOPD
('Principios Fundamentales LOPD', 'Licitud del tratamiento', 'compliant', 'Base legal establecida para todos los tratamientos', now(), now() + interval '3 months'),
('Principios Fundamentales LOPD', 'Minimización de datos', 'compliant', 'Solo se recopilan datos necesarios', now(), now() + interval '3 months'),
('Principios Fundamentales LOPD', 'Exactitud de datos', 'compliant', 'Mecanismos de actualización implementados', now(), now() + interval '3 months'),
('Principios Fundamentales LOPD', 'Limitación de conservación', 'compliant', 'Períodos de retención definidos', now(), now() + interval '3 months'),

-- Derechos de los Interesados
('Derechos de los Interesados', 'Derecho de acceso', 'compliant', 'Sistema de consulta de datos personales', now(), now() + interval '3 months'),
('Derechos de los Interesados', 'Derecho de rectificación', 'compliant', 'Proceso de corrección de datos', now(), now() + interval '3 months'),
('Derechos de los Interesados', 'Derecho de supresión', 'compliant', 'Eliminación segura de datos', now(), now() + interval '3 months'),
('Derechos de los Interesados', 'Derecho de portabilidad', 'compliant', 'Exportación de datos en formato estándar', now(), now() + interval '3 months'),

-- Seguridad Técnica
('Seguridad Técnica', 'Cifrado de datos', 'compliant', 'Datos cifrados en reposo y tránsito', now(), now() + interval '6 months'),
('Seguridad Técnica', 'Control de acceso', 'compliant', 'Autenticación y autorización robusta', now(), now() + interval '6 months'),
('Seguridad Técnica', 'Logs de auditoría', 'compliant', 'Registro inviolable de actividades', now(), now() + interval '6 months'),
('Seguridad Técnica', 'Backup seguro', 'compliant', 'Copias de seguridad cifradas', now(), now() + interval '6 months'),

-- Gobernanza y Organización
('Gobernanza y Organización', 'Registro de actividades', 'compliant', 'Inventario completo de tratamientos', now(), now() + interval '12 months'),
('Gobernanza y Organización', 'Evaluaciones de impacto', 'compliant', 'DPIA realizadas para tratamientos de alto riesgo', now(), now() + interval '12 months'),
('Gobernanza y Organización', 'Formación del personal', 'warning', 'Pendiente formación trimestral', now() - interval '2 months', now() + interval '1 month'),
('Gobernanza y Organización', 'Procedimientos de breach', 'compliant', 'Plan de respuesta a incidentes', now(), now() + interval '12 months');

-- Insert sample privacy impact assessments
INSERT INTO privacy_impact_assessments (assessment_name, processing_purpose, data_categories, risk_level, mitigation_measures, status, next_review) VALUES
('Procesamiento de Documentos CAE', 'Clasificación automática de documentos de construcción', 
 '["Datos de identificación", "Documentos laborales", "Certificados médicos"]', 
 'medium', 
 '["Cifrado AES-256", "Acceso basado en roles", "Logs de auditoría", "Pseudonimización"]', 
 'approved', 
 now() + interval '12 months'),

('Sistema de Pagos y Facturación', 'Procesamiento de pagos y generación de facturas', 
 '["Datos bancarios", "Información fiscal", "Historial de transacciones"]', 
 'high', 
 '["Tokenización de datos", "PCI DSS compliance", "Cifrado extremo a extremo", "Monitoreo continuo"]', 
 'approved', 
 now() + interval '6 months'),

('Integración con Obralia/Nalanda', 'Sincronización de datos con plataformas externas', 
 '["Datos de trabajadores", "Certificados", "Información de empresas"]', 
 'medium', 
 '["Contratos de encargado", "Cifrado en tránsito", "Validación de integridad"]', 
 'under_review', 
 now() + interval '3 months');

-- Insert sample consent records
INSERT INTO consent_records (user_email, consent_type, purpose, granted, granted_at, ip_address, legal_basis, retention_period) VALUES
('garcia@construcciones.com', 'Procesamiento de datos', 'Gestión documental y clasificación IA', true, now() - interval '30 days', '192.168.1.100', 'Ejecución de contrato', '7 años'),
('lopez@reformas.com', 'Marketing directo', 'Comunicaciones comerciales personalizadas', true, now() - interval '15 days', '192.168.1.101', 'Consentimiento', '2 años'),
('martin@edificaciones.com', 'Cookies analíticas', 'Análisis de uso de la plataforma', false, null, '192.168.1.102', 'Interés legítimo', '2 años');

-- Insert sample data subject request
INSERT INTO data_subject_requests (request_type, requester_email, requester_name, request_details, deadline, status) VALUES
('access', 'cliente@ejemplo.com', 'Juan Ejemplo', 
 '{"solicitud": "Solicito acceso a todos mis datos personales", "fecha_solicitud": "2025-01-29"}', 
 now() + interval '30 days', 
 'pending');

-- Insert system configuration for compliance
INSERT INTO system_settings (key, value, description) VALUES
('compliance_config', '{
  "lopd_compliance_level": "strict",
  "data_retention_policy": "7_years",
  "gdpr_consent_required": true,
  "right_to_be_forgotten": true,
  "data_portability_enabled": true,
  "breach_notification_time": "72",
  "privacy_impact_assessments": true,
  "data_processing_logs": true,
  "third_party_sharing_allowed": false,
  "anonymization_after_retention": true,
  "dpo_contact": "dpo@constructia.com",
  "authority_contact": "AEPD - Agencia Española de Protección de Datos"
}', 'Configuración de cumplimiento LOPD/GDPR')
ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = now();