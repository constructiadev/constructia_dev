/*
  # Populate Data Protection Compliance Tables with Initial Data

  1. Sample Data
    - Compliance checks for LOPD/GDPR requirements
    - Sample data subject requests
    - Privacy impact assessments
    - Data breach records (historical)
    - Consent records

  2. Realistic Data
    - Based on actual LOPD/GDPR requirements
    - Proper status distributions
    - Realistic dates and scenarios
*/

-- Insert compliance checks
INSERT INTO public.compliance_checks (category, check_name, status, description, last_verified, next_review, responsible_user) VALUES
-- Principios Fundamentales LOPD
('Principios Fundamentales LOPD', 'Licitud del tratamiento', 'compliant', 'Base legal establecida para todos los tratamientos', now() - interval '15 days', now() + interval '75 days', 'DPO'),
('Principios Fundamentales LOPD', 'Minimización de datos', 'compliant', 'Solo se recopilan datos necesarios', now() - interval '10 days', now() + interval '80 days', 'DPO'),
('Principios Fundamentales LOPD', 'Exactitud de datos', 'compliant', 'Mecanismos de actualización implementados', now() - interval '20 days', now() + interval '70 days', 'DPO'),
('Principios Fundamentales LOPD', 'Limitación de conservación', 'compliant', 'Períodos de retención definidos', now() - interval '5 days', now() + interval '85 days', 'DPO'),

-- Derechos de los Interesados
('Derechos de los Interesados', 'Derecho de acceso', 'compliant', 'Sistema de consulta de datos personales', now() - interval '12 days', now() + interval '78 days', 'DPO'),
('Derechos de los Interesados', 'Derecho de rectificación', 'compliant', 'Proceso de corrección de datos', now() - interval '8 days', now() + interval '82 days', 'DPO'),
('Derechos de los Interesados', 'Derecho de supresión', 'compliant', 'Eliminación segura de datos', now() - interval '18 days', now() + interval '72 days', 'DPO'),
('Derechos de los Interesados', 'Derecho de portabilidad', 'compliant', 'Exportación de datos en formato estándar', now() - interval '25 days', now() + interval '65 days', 'DPO'),

-- Seguridad Técnica
('Seguridad Técnica', 'Cifrado de datos', 'compliant', 'Datos cifrados en reposo y tránsito', now() - interval '7 days', now() + interval '83 days', 'CISO'),
('Seguridad Técnica', 'Control de acceso', 'compliant', 'Autenticación y autorización robusta', now() - interval '14 days', now() + interval '76 days', 'CISO'),
('Seguridad Técnica', 'Logs de auditoría', 'compliant', 'Registro inviolable de actividades', now() - interval '3 days', now() + interval '87 days', 'CISO'),
('Seguridad Técnica', 'Backup seguro', 'compliant', 'Copias de seguridad cifradas', now() - interval '21 days', now() + interval '69 days', 'CISO'),

-- Gobernanza y Organización
('Gobernanza y Organización', 'Registro de actividades', 'compliant', 'Inventario completo de tratamientos', now() - interval '30 days', now() + interval '60 days', 'DPO'),
('Gobernanza y Organización', 'Evaluaciones de impacto', 'compliant', 'DPIA realizadas para tratamientos de alto riesgo', now() - interval '45 days', now() + interval '45 days', 'DPO'),
('Gobernanza y Organización', 'Formación del personal', 'warning', 'Pendiente formación trimestral', now() - interval '95 days', now() - interval '5 days', 'RRHH'),
('Gobernanza y Organización', 'Procedimientos de breach', 'compliant', 'Plan de respuesta a incidentes', now() - interval '60 days', now() + interval '30 days', 'CISO');

-- Insert sample data subject requests
INSERT INTO public.data_subject_requests (request_type, requester_email, requester_name, status, request_details, deadline, assigned_to) VALUES
('access', 'juan.garcia@email.com', 'Juan García López', 'pending', '{"details": "Solicito acceso a todos mis datos personales almacenados en la plataforma"}', now() + interval '25 days', 'DPO'),
('rectification', 'maria.lopez@email.com', 'María López Martín', 'in_progress', '{"details": "Necesito corregir mi dirección postal", "current_address": "Calle Falsa 123", "new_address": "Calle Real 456"}', now() + interval '20 days', 'DPO'),
('erasure', 'carlos.ruiz@email.com', 'Carlos Ruiz Sánchez', 'completed', '{"details": "Solicito la eliminación completa de mis datos"}', now() - interval '5 days', 'DPO'),
('portability', 'ana.martin@email.com', 'Ana Martín González', 'pending', '{"details": "Necesito exportar mis datos para cambiar de proveedor"}', now() + interval '28 days', 'DPO'),
('objection', 'pedro.sanchez@email.com', 'Pedro Sánchez Ruiz', 'rejected', '{"details": "Me opongo al tratamiento de mis datos para marketing", "reason": "Tratamiento necesario para ejecución contractual"}', now() - interval '10 days', 'DPO');

-- Insert privacy impact assessments
INSERT INTO public.privacy_impact_assessments (assessment_name, processing_purpose, data_categories, risk_level, mitigation_measures, status, assessor_id, next_review) VALUES
('DPIA - Sistema de Gestión Documental', 'Procesamiento de documentos de construcción y datos de trabajadores', ARRAY['Datos identificativos', 'Datos laborales', 'Documentos técnicos'], 'medium', ARRAY['Cifrado AES-256', 'Control de acceso basado en roles', 'Logs de auditoría'], 'approved', 'DPO', now() + interval '1 year'),
('DPIA - Plataforma de Pagos', 'Procesamiento de datos financieros y de pago', ARRAY['Datos bancarios', 'Historial de transacciones', 'Datos identificativos'], 'high', ARRAY['Tokenización de datos', 'PCI DSS compliance', 'Monitoreo continuo'], 'approved', 'DPO', now() + interval '6 months'),
('DPIA - Sistema de IA para Clasificación', 'Análisis automático de documentos mediante IA', ARRAY['Contenido de documentos', 'Metadatos', 'Patrones de uso'], 'medium', ARRAY['Pseudonimización', 'Minimización de datos', 'Revisión humana'], 'under_review', 'DPO', now() + interval '3 months');

-- Insert historical data breaches (for demonstration)
INSERT INTO public.data_breaches (incident_title, description, severity, affected_records, data_categories, discovery_date, notification_date, authority_notified, subjects_notified, status, mitigation_actions, lessons_learned, reported_by) VALUES
('Intento de acceso no autorizado', 'Detección de múltiples intentos de login fallidos desde IP sospechosa', 'low', 0, ARRAY['Logs de acceso'], now() - interval '45 days', now() - interval '44 days', false, false, 'resolved', ARRAY['Bloqueo de IP', 'Refuerzo de políticas de contraseña'], 'Implementar rate limiting más estricto', 'Sistema automático'),
('Error en configuración de backup', 'Backup temporal accesible públicamente durante 2 horas', 'medium', 150, ARRAY['Datos de contacto', 'Metadatos de documentos'], now() - interval '120 days', now() - interval '118 days', true, true, 'resolved', ARRAY['Corrección inmediata', 'Revisión de permisos', 'Notificación a afectados'], 'Implementar doble verificación en configuraciones críticas', 'Administrador de sistemas');

-- Insert consent records
INSERT INTO public.consent_records (user_email, consent_type, purpose, granted, granted_at, ip_address, legal_basis, retention_period) VALUES
('demo@constructia.com', 'marketing', 'Envío de comunicaciones comerciales', true, now() - interval '30 days', '192.168.1.100', 'Consentimiento', '2 años'),
('test@constructia.com', 'analytics', 'Análisis de uso de la plataforma', true, now() - interval '15 days', '192.168.1.101', 'Consentimiento', '1 año'),
('juan.garcia@email.com', 'essential', 'Funcionamiento básico de la plataforma', true, now() - interval '60 days', '203.0.113.1', 'Ejecución contractual', 'Duración del contrato'),
('maria.lopez@email.com', 'marketing', 'Envío de comunicaciones comerciales', false, null, null, 'Consentimiento', '2 años'),
('carlos.ruiz@email.com', 'analytics', 'Análisis de uso de la plataforma', true, now() - interval '90 days', '203.0.113.2', 'Consentimiento', '1 año');