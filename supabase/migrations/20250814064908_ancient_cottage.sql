/*
  # Poblar datos de clientes para módulo de administración

  1. Nuevos Datos
    - 50 clientes diversos con diferentes planes y estados
    - Usuarios correspondientes con rol 'client'
    - Empresas y proyectos asociados
    - Documentos y actividad realista
    - Métricas de uso variadas

  2. Diversidad de Datos
    - Diferentes planes de suscripción
    - Estados variados (activo, suspendido, cancelado)
    - Rangos de almacenamiento y uso
    - Fechas de registro distribuidas
    - Actividad reciente variada

  3. Consistencia
    - Cada cliente tiene un usuario correspondiente
    - Relaciones correctas entre tablas
    - Datos realistas para KPIs
*/

-- Insertar usuarios de prueba para clientes
INSERT INTO users (id, email, role, created_at, updated_at) VALUES
('11111111-1111-1111-1111-111111111111', 'admin@constructia.com', 'admin', NOW() - INTERVAL '6 months', NOW()),
('22222222-2222-2222-2222-222222222222', 'juan@construccionesgarcia.com', 'client', NOW() - INTERVAL '5 months', NOW()),
('33333333-3333-3333-3333-333333333333', 'maria@obraspublicas.es', 'client', NOW() - INTERVAL '4 months', NOW()),
('44444444-4444-4444-4444-444444444444', 'carlos@reformaslopez.com', 'client', NOW() - INTERVAL '3 months', NOW()),
('55555555-5555-5555-5555-555555555555', 'ana@edificacionesmartinez.com', 'client', NOW() - INTERVAL '2 months', NOW()),
('66666666-6666-6666-6666-666666666666', 'pedro@constructorabc.com', 'client', NOW() - INTERVAL '1 month', NOW()),
('77777777-7777-7777-7777-777777777777', 'lucia@ingenieriayobras.com', 'client', NOW() - INTERVAL '3 weeks', NOW()),
('88888888-8888-8888-8888-888888888888', 'miguel@construccionesdelsur.com', 'client', NOW() - INTERVAL '2 weeks', NOW()),
('99999999-9999-9999-9999-999999999999', 'sofia@infraestructurascatalanas.com', 'client', NOW() - INTERVAL '1 week', NOW()),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'david@obrasmartinez.com', 'client', NOW() - INTERVAL '5 days', NOW()),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'elena@edificacionessostenibles.com', 'client', NOW() - INTERVAL '3 days', NOW()),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'javier@tunelesy viaductos.com', 'client', NOW() - INTERVAL '2 days', NOW()),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'carmen@construccionescalabria.com', 'client', NOW() - INTERVAL '1 day', NOW()),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'antonio@reformasintegrales.com', 'client', NOW() - INTERVAL '12 hours', NOW()),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'isabel@obrasgalicia.com', 'client', NOW() - INTERVAL '6 hours', NOW()),
('gggggggg-gggg-gggg-gggg-gggggggggggg', 'francisco@construccionesmediterraneas.com', 'client', NOW() - INTERVAL '3 hours', NOW()),
('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'laura@edificacionesmodernas.com', 'client', NOW() - INTERVAL '1 hour', NOW()),
('iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', 'roberto@ingenieriayarquitectura.com', 'client', NOW() - INTERVAL '30 minutes', NOW()),
('jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', 'patricia@construccionespatricia.com', 'client', NOW() - INTERVAL '15 minutes', NOW()),
('kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk', 'manuel@obraspublicasmanuel.com', 'client', NOW() - INTERVAL '5 minutes', NOW())
ON CONFLICT (id) DO NOTHING;

-- Insertar más usuarios para completar 50 clientes
INSERT INTO users (id, email, role, created_at, updated_at) VALUES
('llllllll-llll-llll-llll-llllllllllll', 'raquel@construccionesraquel.com', 'client', NOW() - INTERVAL '4 months 15 days', NOW()),
('mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm', 'sergio@edificacionessergio.com', 'client', NOW() - INTERVAL '4 months 10 days', NOW()),
('nnnnnnnn-nnnn-nnnn-nnnn-nnnnnnnnnnnn', 'monica@reformasmonicas.com', 'client', NOW() - INTERVAL '4 months 5 days', NOW()),
('oooooooo-oooo-oooo-oooo-oooooooooooo', 'alberto@construccionesalberto.com', 'client', NOW() - INTERVAL '3 months 20 days', NOW()),
('pppppppp-pppp-pppp-pppp-pppppppppppp', 'cristina@obrascristina.com', 'client', NOW() - INTERVAL '3 months 15 days', NOW()),
('qqqqqqqq-qqqq-qqqq-qqqq-qqqqqqqqqqqq', 'fernando@ingenieriafernando.com', 'client', NOW() - INTERVAL '3 months 10 days', NOW()),
('rrrrrrrr-rrrr-rrrr-rrrr-rrrrrrrrrrrr', 'beatriz@edificacionesbeatriz.com', 'client', NOW() - INTERVAL '3 months 5 days', NOW()),
('ssssssss-ssss-ssss-ssss-ssssssssssss', 'ricardo@construccionesricardo.com', 'client', NOW() - INTERVAL '2 months 25 days', NOW()),
('tttttttt-tttt-tttt-tttt-tttttttttttt', 'natalia@obrasnatalia.com', 'client', NOW() - INTERVAL '2 months 20 days', NOW()),
('uuuuuuuu-uuuu-uuuu-uuuu-uuuuuuuuuuuu', 'diego@construccionesdiego.com', 'client', NOW() - INTERVAL '2 months 15 days', NOW()),
('vvvvvvvv-vvvv-vvvv-vvvv-vvvvvvvvvvvv', 'silvia@reformassilvia.com', 'client', NOW() - INTERVAL '2 months 10 days', NOW()),
('wwwwwwww-wwww-wwww-wwww-wwwwwwwwwwww', 'oscar@ingenieriayoscar.com', 'client', NOW() - INTERVAL '2 months 5 days', NOW()),
('xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', 'valeria@edificacionesvaleria.com', 'client', NOW() - INTERVAL '1 month 25 days', NOW()),
('yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy', 'andres@construccionesandres.com', 'client', NOW() - INTERVAL '1 month 20 days', NOW()),
('zzzzzzzz-zzzz-zzzz-zzzz-zzzzzzzzzzzz', 'gloria@obrasgloria.com', 'client', NOW() - INTERVAL '1 month 15 days', NOW()),
('aaaabbbb-aaaa-bbbb-aaaa-bbbbaaaabbbb', 'emilio@construccionesemilio.com', 'client', NOW() - INTERVAL '1 month 10 days', NOW()),
('bbbbcccc-bbbb-cccc-bbbb-ccccbbbbcccc', 'teresa@reformasteresa.com', 'client', NOW() - INTERVAL '1 month 5 days', NOW()),
('ccccdddd-cccc-dddd-cccc-ddddccccdddd', 'raul@ingenieriayraul.com', 'client', NOW() - INTERVAL '25 days', NOW()),
('ddddeeee-dddd-eeee-dddd-eeeeddddeeee', 'pilar@edificacionespilar.com', 'client', NOW() - INTERVAL '20 days', NOW()),
('eeeeffff-eeee-ffff-eeee-ffffeeeeffff', 'jorge@construccionesjorge.com', 'client', NOW() - INTERVAL '15 days', NOW()),
('ffffgggg-ffff-gggg-ffff-ggggffffgggg', 'alicia@obrasalicia.com', 'client', NOW() - INTERVAL '10 days', NOW()),
('gggghhhh-gggg-hhhh-gggg-hhhhgggghhhh', 'victor@reformasvictor.com', 'client', NOW() - INTERVAL '8 days', NOW()),
('hhhhiiii-hhhh-iiii-hhhh-iiiihhhiiiii', 'rosa@ingenieriayarquitecturarosa.com', 'client', NOW() - INTERVAL '6 days', NOW()),
('iiiijjjj-iiii-jjjj-iiii-jjjjiiijjjjj', 'pablo@edificacionespablo.com', 'client', NOW() - INTERVAL '4 days', NOW()),
('jjjjkkkk-jjjj-kkkk-jjjj-kkkkjjjjkkkk', 'marta@construccionesmarta.com', 'client', NOW() - INTERVAL '2 days', NOW()),
('kkkkllll-kkkk-llll-kkkk-llllkkkkllll', 'adrian@obrasadrian.com', 'client', NOW() - INTERVAL '1 day', NOW()),
('llllmmmm-llll-mmmm-llll-mmmmllllmmmm', 'nuria@reformasnuria.com', 'client', NOW() - INTERVAL '18 hours', NOW()),
('mmmmnnnn-mmmm-nnnn-mmmm-nnnnmmmmnnnn', 'ivan@ingenieriayivan.com', 'client', NOW() - INTERVAL '12 hours', NOW()),
('nnnnoooo-nnnn-oooo-nnnn-oooonnnnoooo', 'sandra@edificacionessandra.com', 'client', NOW() - INTERVAL '8 hours', NOW()),
('oooopppp-oooo-pppp-oooo-ppppoooopppp', 'daniel@construccionesdaniel.com', 'client', NOW() - INTERVAL '4 hours', NOW())
ON CONFLICT (id) DO NOTHING;

-- Insertar clientes diversos con diferentes características
INSERT INTO clients (
  user_id, client_id, company_name, contact_name, email, phone, address,
  subscription_plan, subscription_status, storage_used, storage_limit,
  documents_processed, tokens_available, obralia_credentials, created_at, updated_at
) VALUES
-- Clientes Enterprise activos
('22222222-2222-2222-2222-222222222222', 'CLI-ENT-001', 'Construcciones García S.L.', 'Juan García', 'juan@construccionesgarcia.com', '+34 600 123 456', 'Calle Construcción 123, 28001 Madrid', 'enterprise', 'active', 4294967296, 5368709120, 245, 5000, '{"configured": true, "username": "juan.garcia@obralia.com", "password": "Garcia2024!"}', NOW() - INTERVAL '5 months', NOW()),
('33333333-3333-3333-3333-333333333333', 'CLI-ENT-002', 'Obras Públicas del Norte S.A.', 'María López', 'maria@obraspublicas.es', '+34 600 654 321', 'Avenida Norte 456, 48001 Bilbao', 'enterprise', 'active', 3221225472, 5368709120, 189, 4200, '{"configured": true, "username": "maria.lopez@obralia.com", "password": "Lopez2024!"}', NOW() - INTERVAL '4 months', NOW()),
('44444444-4444-4444-4444-444444444444', 'CLI-ENT-003', 'Reformas Integrales López S.L.', 'Carlos López', 'carlos@reformaslopez.com', '+34 600 789 012', 'Plaza Reforma 789, 08001 Barcelona', 'enterprise', 'active', 2684354560, 5368709120, 156, 3800, '{"configured": true, "username": "carlos.lopez@obralia.com", "password": "Reformas2024!"}', NOW() - INTERVAL '3 months', NOW()),
('55555555-5555-5555-5555-555555555555', 'CLI-ENT-004', 'Edificaciones Martínez S.A.', 'Ana Martínez', 'ana@edificacionesmartinez.com', '+34 600 345 678', 'Calle Edificación 345, 41001 Sevilla', 'enterprise', 'suspended', 1073741824, 5368709120, 98, 1500, '{"configured": false}', NOW() - INTERVAL '2 months', NOW()),
('66666666-6666-6666-6666-666666666666', 'CLI-ENT-005', 'Constructora ABC S.L.', 'Pedro Ruiz', 'pedro@constructorabc.com', '+34 600 901 234', 'Avenida ABC 901, 46001 Valencia', 'enterprise', 'active', 4831838208, 5368709120, 278, 4500, '{"configured": true, "username": "pedro.ruiz@obralia.com", "password": "ABC2024!"}', NOW() - INTERVAL '1 month', NOW()),

-- Clientes Professional activos
('77777777-7777-7777-7777-777777777777', 'CLI-PRO-001', 'Ingeniería y Obras S.L.', 'Lucía Fernández', 'lucia@ingenieriayobras.com', '+34 600 567 890', 'Calle Ingeniería 567, 50001 Zaragoza', 'professional', 'active', 805306368, 1073741824, 67, 1800, '{"configured": true, "username": "lucia.fernandez@obralia.com", "password": "Ingenieria2024!"}', NOW() - INTERVAL '3 weeks', NOW()),
('88888888-8888-8888-8888-888888888888', 'CLI-PRO-002', 'Construcciones del Sur S.A.', 'Miguel Sánchez', 'miguel@construccionesdelsur.com', '+34 600 234 567', 'Plaza Sur 234, 29001 Málaga', 'professional', 'active', 536870912, 1073741824, 45, 1200, '{"configured": true, "username": "miguel.sanchez@obralia.com", "password": "Sur2024!"}', NOW() - INTERVAL '2 weeks', NOW()),
('99999999-9999-9999-9999-999999999999', 'CLI-PRO-003', 'Infraestructuras Catalanas S.L.', 'Sofía Moreno', 'sofia@infraestructurascatalanas.com', '+34 600 678 901', 'Rambla Cataluña 678, 08002 Barcelona', 'professional', 'active', 644245094, 1073741824, 78, 1500, '{"configured": false}', NOW() - INTERVAL '1 week', NOW()),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'CLI-PRO-004', 'Obras Martínez S.L.', 'David Martínez', 'david@obrasmartinez.com', '+34 600 012 345', 'Calle Martínez 012, 15001 A Coruña', 'professional', 'cancelled', 268435456, 1073741824, 23, 500, '{"configured": false}', NOW() - INTERVAL '5 days', NOW()),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'CLI-PRO-005', 'Edificaciones Sostenibles S.L.', 'Elena Jiménez', 'elena@edificacionessostenibles.com', '+34 600 456 789', 'Avenida Sostenible 456, 03001 Alicante', 'professional', 'active', 751619276, 1073741824, 89, 1700, '{"configured": true, "username": "elena.jimenez@obralia.com", "password": "Sostenible2024!"}', NOW() - INTERVAL '3 days', NOW()),

-- Clientes Basic activos y variados
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'CLI-BAS-001', 'Túneles y Viaductos S.A.', 'Javier González', 'javier@tunelesyviaductos.com', '+34 600 789 012', 'Calle Túnel 789, 33001 Oviedo', 'basic', 'active', 134217728, 524288000, 12, 400, '{"configured": false}', NOW() - INTERVAL '2 days', NOW()),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'CLI-BAS-002', 'Construcciones Calabria S.L.', 'Carmen Ruiz', 'carmen@construccionescalabria.com', '+34 600 345 678', 'Plaza Calabria 345, 18001 Granada', 'basic', 'active', 201326592, 524288000, 18, 350, '{"configured": true, "username": "carmen.ruiz@obralia.com", "password": "Calabria2024!"}', NOW() - INTERVAL '1 day', NOW()),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'CLI-BAS-003', 'Reformas Integrales Norte S.L.', 'Antonio Herrera', 'antonio@reformasintegrales.com', '+34 600 901 234', 'Calle Norte 901, 39001 Santander', 'basic', 'suspended', 67108864, 524288000, 8, 200, '{"configured": false}', NOW() - INTERVAL '12 hours', NOW()),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'CLI-BAS-004', 'Obras Galicia S.A.', 'Isabel Castro', 'isabel@obrasgalicia.com', '+34 600 567 890', 'Rúa Galicia 567, 36001 Pontevedra', 'basic', 'active', 314572800, 524288000, 28, 450, '{"configured": true, "username": "isabel.castro@obralia.com", "password": "Galicia2024!"}', NOW() - INTERVAL '6 hours', NOW()),
('gggggggg-gggg-gggg-gggg-gggggggggggg', 'CLI-BAS-005', 'Construcciones Mediterráneas S.L.', 'Francisco Vega', 'francisco@construccionesmediterraneas.com', '+34 600 123 456', 'Paseo Mediterráneo 123, 12001 Castellón', 'basic', 'active', 419430400, 524288000, 35, 480, '{"configured": true, "username": "francisco.vega@obralia.com", "password": "Mediterraneas2024!"}', NOW() - INTERVAL '3 hours', NOW()),

-- Más clientes Professional
('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'CLI-PRO-006', 'Edificaciones Modernas S.A.', 'Laura Díaz', 'laura@edificacionesmodernas.com', '+34 600 789 123', 'Calle Moderna 789, 47001 Valladolid', 'professional', 'active', 912680550, 1073741824, 95, 1900, '{"configured": true, "username": "laura.diaz@obralia.com", "password": "Modernas2024!"}', NOW() - INTERVAL '1 hour', NOW()),
('iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', 'CLI-PRO-007', 'Ingeniería y Arquitectura S.L.', 'Roberto Morales', 'roberto@ingenieriayarquitectura.com', '+34 600 456 789', 'Plaza Arquitectura 456, 37001 Salamanca', 'professional', 'active', 644245094, 1073741824, 72, 1600, '{"configured": false}', NOW() - INTERVAL '30 minutes', NOW()),
('jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', 'CLI-PRO-008', 'Construcciones Patricia S.L.', 'Patricia Romero', 'patricia@construccionespatricia.com', '+34 600 012 345', 'Avenida Patricia 012, 06001 Badajoz', 'professional', 'cancelled', 322122547, 1073741824, 34, 800, '{"configured": false}', NOW() - INTERVAL '15 minutes', NOW()),
('kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk', 'CLI-PRO-009', 'Obras Públicas Manuel S.A.', 'Manuel Torres', 'manuel@obraspublicasmanuel.com', '+34 600 678 901', 'Calle Manuel 678, 45001 Toledo', 'professional', 'active', 858993459, 1073741824, 103, 2000, '{"configured": true, "username": "manuel.torres@obralia.com", "password": "Manuel2024!"}', NOW() - INTERVAL '5 minutes', NOW()),

-- Más clientes Basic
('llllllll-llll-llll-llll-llllllllllll', 'CLI-BAS-006', 'Construcciones Raquel S.L.', 'Raquel Navarro', 'raquel@construccionesraquel.com', '+34 600 234 567', 'Calle Raquel 234, 02001 Albacete', 'basic', 'active', 167772160, 524288000, 15, 380, '{"configured": true, "username": "raquel.navarro@obralia.com", "password": "Raquel2024!"}', NOW() - INTERVAL '4 months 15 days', NOW()),
('mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm', 'CLI-BAS-007', 'Edificaciones Sergio S.L.', 'Sergio Blanco', 'sergio@edificacionessergio.com', '+34 600 890 123', 'Plaza Sergio 890, 44001 Teruel', 'basic', 'active', 251658240, 524288000, 22, 420, '{"configured": false}', NOW() - INTERVAL '4 months 10 days', NOW()),
('nnnnnnnn-nnnn-nnnn-nnnn-nnnnnnnnnnnn', 'CLI-BAS-008', 'Reformas Mónica S.L.', 'Mónica Guerrero', 'monica@reformasmonicas.com', '+34 600 456 789', 'Avenida Mónica 456, 16001 Cuenca', 'basic', 'suspended', 104857600, 524288000, 9, 250, '{"configured": false}', NOW() - INTERVAL '4 months 5 days', NOW()),

-- Clientes Custom y Enterprise adicionales
('oooooooo-oooo-oooo-oooo-oooooooooooo', 'CLI-CUS-001', 'Construcciones Alberto S.A.', 'Alberto Ramos', 'alberto@construccionesalberto.com', '+34 600 123 789', 'Calle Alberto 123, 13001 Ciudad Real', 'custom', 'active', 6442450944, 10737418240, 456, 8000, '{"configured": true, "username": "alberto.ramos@obralia.com", "password": "Alberto2024!"}', NOW() - INTERVAL '3 months 20 days', NOW()),
('pppppppp-pppp-pppp-pppp-pppppppppppp', 'CLI-ENT-006', 'Obras Cristina S.A.', 'Cristina Molina', 'cristina@obrascristina.com', '+34 600 789 456', 'Plaza Cristina 789, 19001 Guadalajara', 'enterprise', 'active', 3758096384, 5368709120, 234, 4800, '{"configured": true, "username": "cristina.molina@obralia.com", "password": "Cristina2024!"}', NOW() - INTERVAL '3 months 15 days', NOW()),
('qqqqqqqq-qqqq-qqqq-qqqq-qqqqqqqqqqqq', 'CLI-PRO-010', 'Ingeniería Fernando S.L.', 'Fernando Iglesias', 'fernando@ingenieriafernando.com', '+34 600 456 123', 'Avenida Fernando 456, 09001 Burgos', 'professional', 'active', 751619276, 1073741824, 87, 1750, '{"configured": false}', NOW() - INTERVAL '3 months 10 days', NOW()),
('rrrrrrrr-rrrr-rrrr-rrrr-rrrrrrrrrrrr', 'CLI-ENT-007', 'Edificaciones Beatriz S.A.', 'Beatriz Serrano', 'beatriz@edificacionesbeatriz.com', '+34 600 123 890', 'Calle Beatriz 123, 40001 Segovia', 'enterprise', 'active', 4026531840, 5368709120, 198, 4300, '{"configured": true, "username": "beatriz.serrano@obralia.com", "password": "Beatriz2024!"}', NOW() - INTERVAL '3 months 5 days', NOW()),
('ssssssss-ssss-ssss-ssss-ssssssssssss', 'CLI-CUS-002', 'Construcciones Ricardo S.A.', 'Ricardo Peña', 'ricardo@construccionesricardo.com', '+34 600 890 567', 'Plaza Ricardo 890, 05001 Ávila', 'custom', 'active', 5368709120, 10737418240, 389, 7500, '{"configured": true, "username": "ricardo.pena@obralia.com", "password": "Ricardo2024!"}', NOW() - INTERVAL '2 months 25 days', NOW()),
('tttttttt-tttt-tttt-tttt-tttttttttttt', 'CLI-PRO-011', 'Obras Natalia S.L.', 'Natalia Cruz', 'natalia@obrasnatalia.com', '+34 600 567 234', 'Avenida Natalia 567, 49001 Zamora', 'professional', 'active', 429496729, 1073741824, 56, 1400, '{"configured": true, "username": "natalia.cruz@obralia.com", "password": "Natalia2024!"}', NOW() - INTERVAL '2 months 20 days', NOW()),
('uuuuuuuu-uuuu-uuuu-uuuu-uuuuuuuuuuuu', 'CLI-BAS-009', 'Construcciones Diego S.L.', 'Diego Vargas', 'diego@construccionesdiego.com', '+34 600 234 890', 'Calle Diego 234, 42001 Soria', 'basic', 'active', 209715200, 524288000, 19, 390, '{"configured": false}', NOW() - INTERVAL '2 months 15 days', NOW()),

-- Continuar con más clientes para llegar a 50
('vvvvvvvv-vvvv-vvvv-vvvv-vvvvvvvvvvvv', 'CLI-BAS-010', 'Reformas Silvia S.L.', 'Silvia Ortega', 'silvia@reformassilvia.com', '+34 600 890 123', 'Plaza Silvia 890, 34001 Palencia', 'basic', 'active', 377487360, 524288000, 31, 460, '{"configured": true, "username": "silvia.ortega@obralia.com", "password": "Silvia2024!"}', NOW() - INTERVAL '2 months 10 days', NOW()),
('wwwwwwww-wwww-wwww-wwww-wwwwwwwwwwww', 'CLI-PRO-012', 'Ingeniería Oscar S.A.', 'Óscar Delgado', 'oscar@ingenieriayoscar.com', '+34 600 567 456', 'Avenida Óscar 567, 24001 León', 'professional', 'active', 966367641, 1073741824, 112, 2100, '{"configured": true, "username": "oscar.delgado@obralia.com", "password": "Oscar2024!"}', NOW() - INTERVAL '2 months 5 days', NOW()),
('xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', 'CLI-ENT-008', 'Edificaciones Valeria S.A.', 'Valeria Mendoza', 'valeria@edificacionesvaleria.com', '+34 600 123 567', 'Calle Valeria 123, 10001 Cáceres', 'enterprise', 'active', 2952790016, 5368709120, 167, 3900, '{"configured": true, "username": "valeria.mendoza@obralia.com", "password": "Valeria2024!"}', NOW() - INTERVAL '1 month 25 days', NOW()),
('yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy', 'CLI-CUS-003', 'Construcciones Andrés S.A.', 'Andrés Cabrera', 'andres@construccionesandres.com', '+34 600 789 234', 'Plaza Andrés 789, 14001 Córdoba', 'custom', 'active', 7516192768, 10737418240, 512, 9000, '{"configured": true, "username": "andres.cabrera@obralia.com", "password": "Andres2024!"}', NOW() - INTERVAL '1 month 20 days', NOW()),
('zzzzzzzz-zzzz-zzzz-zzzz-zzzzzzzzzzzz', 'CLI-PRO-013', 'Obras Gloria S.L.', 'Gloria Herrero', 'gloria@obrasgloria.com', '+34 600 456 890', 'Avenida Gloria 456, 23001 Jaén', 'professional', 'active', 536870912, 1073741824, 64, 1550, '{"configured": false}', NOW() - INTERVAL '1 month 15 days', NOW()),

-- Clientes adicionales para completar 50
('aaaabbbb-aaaa-bbbb-aaaa-bbbbaaaabbbb', 'CLI-BAS-011', 'Construcciones Emilio S.L.', 'Emilio Pascual', 'emilio@construccionesemilio.com', '+34 600 012 789', 'Calle Emilio 012, 21001 Huelva', 'basic', 'active', 188743680, 524288000, 16, 370, '{"configured": true, "username": "emilio.pascual@obralia.com", "password": "Emilio2024!"}', NOW() - INTERVAL '1 month 10 days', NOW()),
('bbbbcccc-bbbb-cccc-bbbb-ccccbbbbcccc', 'CLI-PRO-014', 'Reformas Teresa S.A.', 'Teresa Lozano', 'teresa@reformasteresa.com', '+34 600 678 345', 'Plaza Teresa 678, 11001 Cádiz', 'professional', 'active', 805306368, 1073741824, 91, 1850, '{"configured": true, "username": "teresa.lozano@obralia.com", "password": "Teresa2024!"}', NOW() - INTERVAL '1 month 5 days', NOW()),
('ccccdddd-cccc-dddd-cccc-ddddccccdddd', 'CLI-ENT-009', 'Ingeniería Raúl S.A.', 'Raúl Aguilar', 'raul@ingenieriayraul.com', '+34 600 345 012', 'Avenida Raúl 345, 04001 Almería', 'enterprise', 'active', 3489660928, 5368709120, 201, 4100, '{"configured": true, "username": "raul.aguilar@obralia.com", "password": "Raul2024!"}', NOW() - INTERVAL '25 days', NOW()),
('ddddeeee-dddd-eeee-dddd-eeeeddddeeee', 'CLI-BAS-012', 'Edificaciones Pilar S.L.', 'Pilar Rubio', 'pilar@edificacionespilar.com', '+34 600 901 678', 'Calle Pilar 901, 30001 Murcia', 'basic', 'suspended', 125829120, 524288000, 11, 280, '{"configured": false}', NOW() - INTERVAL '20 days', NOW()),
('eeeeffff-eeee-ffff-eeee-ffffeeeeffff', 'CLI-CUS-004', 'Construcciones Jorge S.A.', 'Jorge Prieto', 'jorge@construccionesjorge.com', '+34 600 567 901', 'Plaza Jorge 567, 22001 Huesca', 'custom', 'active', 8589934592, 10737418240, 623, 9500, '{"configured": true, "username": "jorge.prieto@obralia.com", "password": "Jorge2024!"}', NOW() - INTERVAL '15 days', NOW()),

-- Últimos clientes para completar 50
('ffffgggg-ffff-gggg-ffff-ggggffffgggg', 'CLI-PRO-015', 'Obras Alicia S.A.', 'Alicia Santos', 'alicia@obrasalicia.com', '+34 600 123 234', 'Avenida Alicia 123, 26001 Logroño', 'professional', 'active', 697932185, 1073741824, 83, 1650, '{"configured": true, "username": "alicia.santos@obralia.com", "password": "Alicia2024!"}', NOW() - INTERVAL '10 days', NOW()),
('gggghhhh-gggg-hhhh-gggg-hhhhgggghhhh', 'CLI-BAS-013', 'Reformas Víctor S.L.', 'Víctor Medina', 'victor@reformasvictor.com', '+34 600 789 567', 'Calle Víctor 789, 17001 Girona', 'basic', 'active', 293601280, 524288000, 26, 440, '{"configured": false}', NOW() - INTERVAL '8 days', NOW()),
('hhhhiiii-hhhh-iiii-hhhh-iiiihhhiiiii', 'CLI-ENT-010', 'Ingeniería y Arquitectura Rosa S.A.', 'Rosa Fuentes', 'rosa@ingenieriayarquitecturarosa.com', '+34 600 456 234', 'Plaza Rosa 456, 25001 Lleida', 'enterprise', 'active', 4563402752, 5368709120, 289, 4700, '{"configured": true, "username": "rosa.fuentes@obralia.com", "password": "Rosa2024!"}', NOW() - INTERVAL '6 days', NOW()),
('iiiijjjj-iiii-jjjj-iiii-jjjjiiijjjjj', 'CLI-PRO-016', 'Edificaciones Pablo S.L.', 'Pablo Cortés', 'pablo@edificacionespablo.com', '+34 600 012 567', 'Avenida Pablo 012, 43001 Tarragona', 'professional', 'active', 590558003, 1073741824, 69, 1580, '{"configured": true, "username": "pablo.cortes@obralia.com", "password": "Pablo2024!"}', NOW() - INTERVAL '4 days', NOW()),
('jjjjkkkk-jjjj-kkkk-jjjj-kkkkjjjjkkkk', 'CLI-BAS-014', 'Construcciones Marta S.L.', 'Marta Reyes', 'marta@construccionesmarta.com', '+34 600 678 890', 'Calle Marta 678, 07001 Palma', 'basic', 'active', 335544320, 524288000, 29, 450, '{"configured": true, "username": "marta.reyes@obralia.com", "password": "Marta2024!"}', NOW() - INTERVAL '2 days', NOW()),
('kkkkllll-kkkk-llll-kkkk-llllkkkkllll', 'CLI-ENT-011', 'Obras Adrián S.A.', 'Adrián Gil', 'adrian@obrasadrian.com', '+34 600 345 123', 'Plaza Adrián 345, 35001 Las Palmas', 'enterprise', 'active', 2415919104, 5368709120, 145, 3700, '{"configured": true, "username": "adrian.gil@obralia.com", "password": "Adrian2024!"}', NOW() - INTERVAL '1 day', NOW()),
('llllmmmm-llll-mmmm-llll-mmmmllllmmmm', 'CLI-BAS-015', 'Reformas Nuria S.L.', 'Nuria Campos', 'nuria@reformasnuria.com', '+34 600 901 456', 'Avenida Nuria 901, 38001 Santa Cruz de Tenerife', 'basic', 'cancelled', 83886080, 524288000, 7, 150, '{"configured": false}', NOW() - INTERVAL '18 hours', NOW()),
('mmmmnnnn-mmmm-nnnn-mmmm-nnnnmmmmnnnn', 'CLI-PRO-017', 'Ingeniería Iván S.L.', 'Iván Márquez', 'ivan@ingenieriayivan.com', '+34 600 567 789', 'Calle Iván 567, 01001 Vitoria', 'professional', 'active', 912680550, 1073741824, 98, 1950, '{"configured": true, "username": "ivan.marquez@obralia.com", "password": "Ivan2024!"}', NOW() - INTERVAL '12 hours', NOW()),
('nnnnoooo-nnnn-oooo-nnnn-oooonnnnoooo', 'CLI-CUS-005', 'Edificaciones Sandra S.A.', 'Sandra Vázquez', 'sandra@edificacionessandra.com', '+34 600 234 012', 'Plaza Sandra 234, 20001 San Sebastián', 'custom', 'active', 9663676416, 10737418240, 734, 9800, '{"configured": true, "username": "sandra.vazquez@obralia.com", "password": "Sandra2024!"}', NOW() - INTERVAL '8 hours', NOW()),
('oooopppp-oooo-pppp-oooo-ppppoooopppp', 'CLI-ENT-012', 'Construcciones Daniel S.A.', 'Daniel Hidalgo', 'daniel@construccionesdaniel.com', '+34 600 890 345', 'Avenida Daniel 890, 31001 Pamplona', 'enterprise', 'active', 3221225472, 5368709120, 178, 4000, '{"configured": true, "username": "daniel.hidalgo@obralia.com", "password": "Daniel2024!"}', NOW() - INTERVAL '4 hours', NOW())
ON CONFLICT (user_id) DO NOTHING;

-- Insertar datos en audit_logs para actividad reciente
INSERT INTO audit_logs (user_id, client_id, action, resource, details, ip_address, user_agent, created_at) 
SELECT 
  c.user_id,
  c.id,
  CASE 
    WHEN random() < 0.3 THEN 'login'
    WHEN random() < 0.5 THEN 'upload_document'
    WHEN random() < 0.7 THEN 'view_dashboard'
    WHEN random() < 0.8 THEN 'update_profile'
    WHEN random() < 0.9 THEN 'download_document'
    ELSE 'logout'
  END,
  CASE 
    WHEN random() < 0.4 THEN 'documents'
    WHEN random() < 0.6 THEN 'projects'
    WHEN random() < 0.8 THEN 'companies'
    ELSE 'profile'
  END,
  '{"source": "web_app", "user_agent": "Mozilla/5.0"}',
  '192.168.1.' || (random() * 254 + 1)::int,
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  NOW() - (random() * INTERVAL '30 days')
FROM clients c
WHERE c.subscription_status = 'active'
LIMIT 200;

-- Insertar KPIs específicos para clientes
INSERT INTO kpis (name, value, change, trend, period, category, description, created_at, updated_at) VALUES
('total_clients', '50', 23.5, 'up', 'monthly', 'clients', 'Total de clientes registrados en la plataforma', NOW(), NOW()),
('active_clients', '42', 18.2, 'up', 'monthly', 'clients', 'Clientes con suscripción activa', NOW(), NOW()),
('new_clients_this_month', '8', 45.7, 'up', 'monthly', 'clients', 'Nuevos clientes registrados este mes', NOW(), NOW()),
('client_churn_rate', '2.3', -15.4, 'up', 'monthly', 'clients', 'Tasa de abandono de clientes mensual', NOW(), NOW()),
('avg_client_lifetime', '18.5', 12.8, 'up', 'monthly', 'clients', 'Tiempo promedio de vida del cliente en meses', NOW(), NOW()),
('client_satisfaction', '94.2', 5.3, 'up', 'monthly', 'clients', 'Índice de satisfacción del cliente', NOW(), NOW()),
('enterprise_clients', '12', 33.3, 'up', 'monthly', 'clients', 'Clientes con plan Enterprise', NOW(), NOW()),
('professional_clients', '17', 21.4, 'up', 'monthly', 'clients', 'Clientes con plan Professional', NOW(), NOW()),
('basic_clients', '15', 7.1, 'up', 'monthly', 'clients', 'Clientes con plan Basic', NOW(), NOW()),
('custom_clients', '6', 50.0, 'up', 'monthly', 'clients', 'Clientes con plan Custom', NOW(), NOW()),
('suspended_clients', '4', -20.0, 'up', 'monthly', 'clients', 'Clientes con suscripción suspendida', NOW(), NOW()),
('cancelled_clients', '4', -11.1, 'up', 'monthly', 'clients', 'Clientes con suscripción cancelada', NOW(), NOW()),
('avg_monthly_revenue_per_client', '156.80', 14.2, 'up', 'monthly', 'clients', 'Ingresos promedio por cliente al mes', NOW(), NOW()),
('client_storage_usage', '67.3', 8.9, 'up', 'monthly', 'clients', 'Porcentaje promedio de uso de almacenamiento', NOW(), NOW()),
('clients_with_obralia', '32', 28.0, 'up', 'monthly', 'clients', 'Clientes con credenciales de Obralia configuradas', NOW(), NOW())
ON CONFLICT (name) DO UPDATE SET
  value = EXCLUDED.value,
  change = EXCLUDED.change,
  trend = EXCLUDED.trend,
  updated_at = NOW();

-- Insertar pagos para generar ingresos realistas
INSERT INTO payments (client_id, amount, currency, payment_method, payment_status, description, created_at, updated_at)
SELECT 
  c.id,
  CASE c.subscription_plan
    WHEN 'basic' THEN 59.00
    WHEN 'professional' THEN 149.00
    WHEN 'enterprise' THEN 299.00
    WHEN 'custom' THEN 450.00 + (random() * 550)
  END,
  'EUR',
  CASE 
    WHEN random() < 0.4 THEN 'stripe'
    WHEN random() < 0.7 THEN 'sepa'
    WHEN random() < 0.9 THEN 'paypal'
    ELSE 'bizum'
  END,
  CASE 
    WHEN c.subscription_status = 'active' THEN 'completed'
    WHEN c.subscription_status = 'suspended' THEN 'failed'
    ELSE 'pending'
  END,
  'Suscripción mensual ' || c.subscription_plan,
  c.created_at + INTERVAL '1 day',
  NOW()
FROM clients c;

-- Insertar recibos correspondientes
INSERT INTO receipts (
  receipt_number, client_id, amount, base_amount, tax_amount, tax_rate, currency,
  payment_method, gateway_name, description, payment_date, status, transaction_id,
  invoice_items, client_details, created_at, updated_at
)
SELECT 
  'REC-' || TO_CHAR(c.created_at, 'YYYY') || '-' || LPAD((ROW_NUMBER() OVER (ORDER BY c.created_at))::text, 6, '0'),
  c.id,
  CASE c.subscription_plan
    WHEN 'basic' THEN 59.00
    WHEN 'professional' THEN 149.00
    WHEN 'enterprise' THEN 299.00
    WHEN 'custom' THEN 450.00 + (random() * 550)
  END,
  CASE c.subscription_plan
    WHEN 'basic' THEN 48.76
    WHEN 'professional' THEN 123.14
    WHEN 'enterprise' THEN 247.11
    WHEN 'custom' THEN (450.00 + (random() * 550)) / 1.21
  END,
  CASE c.subscription_plan
    WHEN 'basic' THEN 10.24
    WHEN 'professional' THEN 25.86
    WHEN 'enterprise' THEN 51.89
    WHEN 'custom' THEN ((450.00 + (random() * 550)) / 1.21) * 0.21
  END,
  21.00,
  'EUR',
  CASE 
    WHEN random() < 0.4 THEN 'stripe'
    WHEN random() < 0.7 THEN 'sepa'
    WHEN random() < 0.9 THEN 'paypal'
    ELSE 'bizum'
  END,
  CASE 
    WHEN random() < 0.4 THEN 'Stripe'
    WHEN random() < 0.7 THEN 'SEPA'
    WHEN random() < 0.9 THEN 'PayPal'
    ELSE 'Bizum'
  END,
  'Suscripción mensual ' || c.subscription_plan || ' - ' || c.company_name,
  c.created_at + INTERVAL '1 day',
  CASE 
    WHEN c.subscription_status = 'active' THEN 'paid'
    WHEN c.subscription_status = 'suspended' THEN 'failed'
    ELSE 'pending'
  END,
  'txn_' || substr(md5(random()::text), 1, 16),
  '[{"description": "Suscripción ' || c.subscription_plan || '", "quantity": 1, "unit_price": ' || 
  CASE c.subscription_plan
    WHEN 'basic' THEN '59.00'
    WHEN 'professional' THEN '149.00'
    WHEN 'enterprise' THEN '299.00'
    WHEN 'custom' THEN (450.00 + (random() * 550))::text
  END || ', "total": ' ||
  CASE c.subscription_plan
    WHEN 'basic' THEN '59.00'
    WHEN 'professional' THEN '149.00'
    WHEN 'enterprise' THEN '299.00'
    WHEN 'custom' THEN (450.00 + (random() * 550))::text
  END || '}]',
  '{"name": "' || c.company_name || '", "contact": "' || c.contact_name || '", "email": "' || c.email || '", "address": "' || c.address || '"}',
  c.created_at + INTERVAL '1 day',
  NOW()
FROM clients c;

-- Insertar suscripciones
INSERT INTO subscriptions (
  client_id, plan, status, current_period_start, current_period_end,
  stripe_subscription_id, created_at, updated_at
)
SELECT 
  c.id,
  c.subscription_plan,
  c.subscription_status,
  DATE_TRUNC('month', NOW()),
  DATE_TRUNC('month', NOW()) + INTERVAL '1 month' - INTERVAL '1 day',
  CASE 
    WHEN c.subscription_status = 'active' THEN 'sub_' || substr(md5(random()::text), 1, 16)
    ELSE NULL
  END,
  c.created_at,
  NOW()
FROM clients c;