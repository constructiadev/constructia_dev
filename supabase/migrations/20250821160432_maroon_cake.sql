/*
  # Poblar Datos Iniciales

  1. Crear tenant de desarrollo
  2. Crear usuarios de prueba con roles específicos
  3. Crear datos de ejemplo para testing
*/

-- Crear tenant de desarrollo
INSERT INTO tenants (id, name, status) VALUES 
('00000000-0000-0000-0000-000000000001', 'ConstructIA Development', 'active')
ON CONFLICT (id) DO NOTHING;

-- Crear usuarios de prueba
INSERT INTO users (id, tenant_id, email, name, role, active, password_hash) VALUES 
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'superadmin@constructia.com', 'Super Administrador', 'SuperAdmin', true, '$argon2id$v=19$m=65536,t=3,p=4$hash'),
('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'admin@constructia.com', 'Administrador Cliente', 'ClienteAdmin', true, '$argon2id$v=19$m=65536,t=3,p=4$hash'),
('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'gestor@constructia.com', 'Gestor Documental', 'GestorDocumental', true, '$argon2id$v=19$m=65536,t=3,p=4$hash'),
('40000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'supervisor@constructia.com', 'Supervisor de Obra', 'SupervisorObra', true, '$argon2id$v=19$m=65536,t=3,p=4$hash'),
('50000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'proveedor@constructia.com', 'Proveedor Test', 'Proveedor', true, '$argon2id$v=19$m=65536,t=3,p=4$hash'),
('60000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'lector@constructia.com', 'Usuario Lector', 'Lector', true, '$argon2id$v=19$m=65536,t=3,p=4$hash')
ON CONFLICT (tenant_id, email) DO NOTHING;

-- Crear empresas de ejemplo
INSERT INTO empresas (id, tenant_id, razon_social, cif, rea_numero, cnae, direccion, contacto_email, estado_compliance) VALUES 
('e1000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Construcciones García S.L.', 'B12345678', 'REA001', '4120', 'Calle Construcción 123, Madrid', 'info@construccionesgarcia.com', 'al_dia'),
('e2000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Reformas Integrales López', 'B87654321', 'REA002', '4330', 'Avenida Reforma 456, Barcelona', 'contacto@reformaslopez.com', 'pendiente')
ON CONFLICT (tenant_id, cif) DO NOTHING;

-- Crear obras de ejemplo
INSERT INTO obras (id, tenant_id, empresa_id, nombre_obra, codigo_obra, direccion, cliente_final, fecha_inicio, fecha_fin_estimada, plataforma_destino, perfil_riesgo) VALUES 
('o1000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', 'Edificio Residencial García', 'OBR-2025-001', 'Plaza Mayor 1, Madrid', 'Ayuntamiento de Madrid', '2025-01-15', '2025-12-31', 'nalanda', 'alta'),
('o2000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'e2000000-0000-0000-0000-000000000001', 'Reforma Centro Comercial', 'OBR-2025-002', 'Gran Vía 50, Barcelona', 'Inmobiliaria BCN S.A.', '2025-02-01', '2025-08-30', 'ctaima', 'media')
ON CONFLICT (tenant_id, codigo_obra) DO NOTHING;

-- Crear proveedores de ejemplo
INSERT INTO proveedores (id, tenant_id, empresa_id, razon_social, cif, rea_numero, contacto_email, estado_homologacion) VALUES 
('p1000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', 'Subcontratas García S.L.', 'B11111111', 'REA003', 'subcontratas@garcia.com', 'ok'),
('p2000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'e2000000-0000-0000-0000-000000000001', 'Instalaciones López S.L.', 'B22222222', 'REA004', 'instalaciones@lopez.com', 'pendiente')
ON CONFLICT (tenant_id, cif) DO NOTHING;

-- Crear trabajadores de ejemplo
INSERT INTO trabajadores (id, tenant_id, proveedor_id, dni_nie, nombre, apellido, nss, puesto, aptitud_medica_caducidad, formacion_prl_nivel, formacion_prl_caducidad, epis_entregadas) VALUES 
('t1000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'p1000000-0000-0000-0000-000000000001', '12345678A', 'Juan', 'Pérez', '123456789012', 'Oficial 1ª', '2025-12-31', 'Básico 60h', '2025-06-30', true),
('t2000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'p1000000-0000-0000-0000-000000000001', '87654321B', 'María', 'González', '987654321098', 'Peón especialista', '2025-11-30', 'Básico 60h', '2025-05-31', false),
('t3000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'p2000000-0000-0000-0000-000000000001', '11111111C', 'Carlos', 'Martín', '111111111111', 'Electricista', '2025-10-31', 'Específico Electricidad', '2025-04-30', true)
ON CONFLICT (tenant_id, dni_nie) DO NOTHING;

-- Crear maquinaria de ejemplo
INSERT INTO maquinaria (id, tenant_id, empresa_id, tipo, marca_modelo, numero_serie, certificado_ce, mantenimiento_caducidad, seguro_caducidad) VALUES 
('m1000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', 'Grúa Torre', 'Liebherr 280 EC-H', 'LH280-2024-001', true, '2025-06-30', '2025-12-31'),
('m2000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'e2000000-0000-0000-0000-000000000001', 'Excavadora', 'Caterpillar 320D', 'CAT320-2023-045', true, '2025-08-15', '2025-11-30')
ON CONFLICT (tenant_id, numero_serie) DO NOTHING;

-- Crear suscripción de ejemplo
INSERT INTO suscripciones (tenant_id, plan, limites, estado) VALUES 
('00000000-0000-0000-0000-000000000001', 'Empresas', '{"max_obras": 50, "max_trabajadores": 500, "max_documentos": 10000, "storage_gb": 100}', 'activa')
ON CONFLICT (tenant_id) DO NOTHING;

-- Crear adaptadores de ejemplo
INSERT INTO adaptadores (tenant_id, plataforma, alias, credenciales, estado) VALUES 
('00000000-0000-0000-0000-000000000001', 'nalanda', 'Nalanda Principal', '{"username": "constructia_dev", "password": "dev_password", "endpoint": "https://api.nalanda.com/v1"}', 'ready'),
('00000000-0000-0000-0000-000000000001', 'ctaima', 'CTAIMA Integración', '{"api_key": "ctaima_dev_key", "endpoint": "https://api.ctaima.com/v2"}', 'ready')
ON CONFLICT (tenant_id, plataforma, alias) DO NOTHING;

-- Crear requisitos de plataforma de ejemplo
INSERT INTO requisitos_plataforma (tenant_id, plataforma, aplica_a, perfil_riesgo, categoria, obligatorio, reglas_validacion) VALUES 
('00000000-0000-0000-0000-000000000001', 'nalanda', 'trabajador', 'alta', 'PRL', true, '{"min_hours": 60, "max_expiry_days": 365}'),
('00000000-0000-0000-0000-000000000001', 'nalanda', 'trabajador', 'alta', 'APTITUD_MEDICA', true, '{"max_expiry_days": 365}'),
('00000000-0000-0000-0000-000000000001', 'nalanda', 'maquinaria', 'alta', 'CERT_MAQUINARIA', true, '{"ce_required": true}'),
('00000000-0000-0000-0000-000000000001', 'ctaima', 'empresa', 'media', 'SEGURO_RC', true, '{"min_coverage": 300000}')
ON CONFLICT (tenant_id, plataforma, aplica_a, perfil_riesgo, categoria) DO NOTHING;

-- Crear mapping templates de ejemplo
INSERT INTO mapping_templates (tenant_id, plataforma, version, schema_destino, rules) VALUES 
('00000000-0000-0000-0000-000000000001', 'nalanda', 1, 
'{"company": {"taxId": "", "name": "", "rea": "", "contactEmail": ""}, "site": {"code": "", "name": "", "client": "", "riskProfile": ""}, "workers": [{"idNumber": "", "name": "", "surname": "", "prlLevel": "", "prlExpiry": ""}], "machines": [{"serial": "", "type": "", "maintenanceExpiry": ""}], "attachments": [{"type": "", "url": "", "expiry": "", "metadata": {}}]}',
'[{"from": "Company.cif", "to": "company.taxId"}, {"from": "Company.name", "to": "company.name"}, {"from": "Worker[*].dni", "to": "workers[*].idNumber", "transform": "upper"}]')
ON CONFLICT (tenant_id, plataforma, version) DO NOTHING;