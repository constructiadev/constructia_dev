/*
  # Insert sample data for development

  1. Sample Data
    - Admin user
    - Sample clients
    - Sample companies
    - Sample projects
    - Sample documents
    - Sample payments

  2. Note
    - This is for development/testing purposes only
    - Remove or modify for production deployment
*/

-- Insert sample admin user (if not exists)
INSERT INTO users (id, email, role) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@constructia.com', 'admin')
ON CONFLICT (id) DO NOTHING;

-- Insert sample client users
INSERT INTO users (id, email, role) VALUES
  ('11111111-1111-1111-1111-111111111111', 'juan@construccionesgarcia.com', 'client'),
  ('22222222-2222-2222-2222-222222222222', 'maria@obrasnorte.es', 'client'),
  ('33333333-3333-3333-3333-333333333333', 'carlos@reformaslopez.com', 'client')
ON CONFLICT (id) DO NOTHING;

-- Insert sample clients
INSERT INTO clients (id, user_id, client_id, company_name, contact_name, email, phone, address, subscription_plan, subscription_status, storage_used, storage_limit, documents_processed, tokens_available) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', '2024-REC-0001', 'Construcciones García S.L.', 'Juan García Martínez', 'juan@construccionesgarcia.com', '+34 91 123 45 67', 'Calle Mayor 123, Madrid', 'professional', 'active', 891289600, 1073741824, 127, 450),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', '2024-REC-0002', 'Obras Públicas del Norte S.A.', 'María López Fernández', 'maria@obrasnorte.es', '+34 94 876 54 32', 'Avenida Industrial 45, Bilbao', 'enterprise', 'active', 1258291200, 5368709120, 289, 1200),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', '2024-REC-0003', 'Reformas Integrales López', 'Carlos López Ruiz', 'carlos@reformaslopez.com', '+34 96 111 22 33', 'Plaza España 8, Valencia', 'basic', 'suspended', 125829120, 524288000, 45, 50)
ON CONFLICT (id) DO NOTHING;

-- Insert sample companies
INSERT INTO companies (id, client_id, name, cif, address, phone, email) VALUES
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Construcciones García S.L.', 'B12345678', 'Calle Mayor 123, Madrid', '+34 91 123 45 67', 'info@construccionesgarcia.com'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Obras Públicas del Norte S.A.', 'A87654321', 'Avenida Industrial 45, Bilbao', '+34 94 876 54 32', 'contacto@obrasnorte.es'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Reformas Integrales López', 'B11223344', 'Plaza España 8, Valencia', '+34 96 111 22 33', 'reformas@lopez.com')
ON CONFLICT (id) DO NOTHING;

-- Insert sample projects
INSERT INTO projects (id, company_id, client_id, name, description, status, progress, start_date, end_date, budget, location) VALUES
  ('gggggggg-gggg-gggg-gggg-gggggggggggg', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Edificio Residencial Centro', 'Construcción de edificio residencial de 8 plantas con 32 viviendas', 'active', 65, '2024-01-15', '2024-12-20', 2500000.00, 'Madrid Centro'),
  ('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Reforma Oficinas Norte', 'Reforma integral de oficinas corporativas', 'active', 30, '2024-03-01', '2024-08-15', 450000.00, 'Distrito Norte'),
  ('iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Puente Industrial A-7', 'Construcción de puente para acceso industrial', 'completed', 100, '2023-06-01', '2024-01-30', 1800000.00, 'Autopista A-7'),
  ('jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Centro Comercial Valencia', 'Construcción de centro comercial de 3 plantas', 'planning', 5, '2024-06-01', '2025-03-15', 3200000.00, 'Valencia Este')
ON CONFLICT (id) DO NOTHING;

-- Insert sample documents
INSERT INTO documents (id, project_id, client_id, filename, original_name, file_size, file_type, document_type, classification_confidence, ai_metadata, upload_status, obralia_status) VALUES
  ('kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk', 'gggggggg-gggg-gggg-gggg-gggggggggggg', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'certificado_obra_A_20240127.pdf', 'Certificado de Obra A.pdf', 2456789, 'application/pdf', 'Certificado', 94, '{"classification": "Certificado de Obra", "extracted_data": {"amount": "€45,670", "date": "2024-01-27", "contractor": "García Construcciones"}}', 'completed', 'validated'),
  ('llllllll-llll-llll-llll-llllllllllll', 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'factura_materiales_B_20240126.pdf', 'Factura Materiales B.pdf', 1234567, 'application/pdf', 'Factura', 89, '{"classification": "Factura de Materiales", "extracted_data": {"amount": "€12,340", "supplier": "Materiales Norte S.A.", "date": "2024-01-26"}}', 'completed', 'uploaded'),
  ('mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm', 'iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'dni_trabajador_C_20240125.pdf', 'DNI Trabajador C.pdf', 987654, 'application/pdf', 'DNI/Identificación', 96, '{"classification": "Documento de Identidad", "extracted_data": {"name": "Carlos Martínez López", "dni": "12345678X", "expiry": "2029-05-15"}}', 'completed', 'validated')
ON CONFLICT (id) DO NOTHING;

-- Insert sample payments
INSERT INTO payments (id, client_id, amount, currency, payment_method, payment_status, description) VALUES
  ('nnnnnnnn-nnnn-nnnn-nnnn-nnnnnnnnnnnn', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 149.00, 'EUR', 'stripe', 'completed', 'Plan Profesional - Enero 2024'),
  ('oooooooo-oooo-oooo-oooo-oooooooooooo', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 299.00, 'EUR', 'stripe', 'completed', 'Plan Empresarial - Enero 2024'),
  ('pppppppp-pppp-pppp-pppp-pppppppppppp', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 59.00, 'EUR', 'stripe', 'completed', 'Plan Básico - Diciembre 2023')
ON CONFLICT (id) DO NOTHING;

-- Insert sample subscriptions
INSERT INTO subscriptions (id, client_id, plan, status, current_period_start, current_period_end) VALUES
  ('qqqqqqqq-qqqq-qqqq-qqqq-qqqqqqqqqqqq', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'professional', 'active', '2024-01-27', '2024-02-27'),
  ('rrrrrrrr-rrrr-rrrr-rrrr-rrrrrrrrrrrr', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'enterprise', 'active', '2024-01-27', '2024-02-27'),
  ('ssssssss-ssss-ssss-ssss-ssssssssssss', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'basic', 'cancelled', '2023-12-27', '2024-01-27')
ON CONFLICT (id) DO NOTHING;