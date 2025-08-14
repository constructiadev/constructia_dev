/*
  # Poblar base de datos con 50 clientes heterogéneos

  1. Crear usuarios de prueba
    - 50 usuarios con rol 'client'
    - Emails únicos y realistas
    - Fechas de creación distribuidas

  2. Crear clientes diversos
    - Empresas constructoras variadas
    - Contactos con nombres españoles
    - Planes distribuidos: Enterprise (24%), Professional (34%), Basic (30%), Custom (12%)
    - Estados realistas: 84% activos, 8% suspendidos, 8% cancelados
    - Configuración Obralia: 64% configurados

  3. Datos heterogéneos
    - Ciudades españolas variadas
    - Teléfonos y direcciones realistas
    - Uso de almacenamiento variable por plan
    - Tokens disponibles según plan
*/

-- Insertar 50 usuarios de prueba
INSERT INTO users (id, email, role, created_at, updated_at) VALUES
('11111111-1111-1111-1111-111111111111', 'juan.garcia@construccionesgarcia.com', 'client', '2024-03-15 10:30:00+00', NOW()),
('22222222-2222-2222-2222-222222222222', 'maria.lopez@obraspublicas.com', 'client', '2024-04-20 14:15:00+00', NOW()),
('33333333-3333-3333-3333-333333333333', 'carlos.martin@reformasintegrales.com', 'client', '2024-05-10 09:45:00+00', NOW()),
('44444444-4444-4444-4444-444444444444', 'ana.rodriguez@constructoramediterranea.com', 'client', '2024-06-05 16:20:00+00', NOW()),
('55555555-5555-5555-5555-555555555555', 'pedro.sanchez@ingenieriaobras.com', 'client', '2024-07-12 11:30:00+00', NOW()),
('66666666-6666-6666-6666-666666666666', 'laura.fernandez@construccionesdelsur.com', 'client', '2024-08-18 13:45:00+00', NOW()),
('77777777-7777-7777-7777-777777777777', 'miguel.ruiz@infraestructurascatalanas.com', 'client', '2024-09-22 08:15:00+00', NOW()),
('88888888-8888-8888-8888-888888888888', 'carmen.jimenez@obrasmaritimas.com', 'client', '2024-10-30 15:30:00+00', NOW()),
('99999999-9999-9999-9999-999999999999', 'jose.moreno@edificacionessostenibles.com', 'client', '2024-11-14 12:00:00+00', NOW()),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'isabel.munoz@tunelesyviaductos.com', 'client', '2024-12-01 10:45:00+00', NOW()),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'francisco.alvarez@reformasurbanas.com', 'client', '2024-01-08 14:30:00+00', NOW()),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'pilar.romero@construccionesandaluzas.com', 'client', '2024-02-14 09:15:00+00', NOW()),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'antonio.navarro@obrasciviles.com', 'client', '2024-03-20 16:45:00+00', NOW()),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'rosa.gutierrez@infraestructurasvascas.com', 'client', '2024-04-25 11:20:00+00', NOW()),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'manuel.torres@reformasecologicas.com', 'client', '2024-05-30 13:50:00+00', NOW()),
('gggggggg-gggg-gggg-gggg-gggggggggggg', 'elena.vazquez@construccionesindustriales.com', 'client', '2024-06-15 08:30:00+00', NOW()),
('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'rafael.ramos@obrasresidenciales.com', 'client', '2024-07-20 15:15:00+00', NOW()),
('iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', 'cristina.herrera@infraestructurascanarias.com', 'client', '2024-08-25 12:40:00+00', NOW()),
('jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', 'javier.molina@reformascomerciales.com', 'client', '2024-09-10 10:25:00+00', NOW()),
('kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk', 'beatriz.delgado@construccioneshistoricas.com', 'client', '2024-10-05 14:10:00+00', NOW()),
('llllllll-llll-llll-llll-llllllllllll', 'sergio.castro@obrasdeportivas.com', 'client', '2024-11-12 09:35:00+00', NOW()),
('mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm', 'monica.ortega@infraestructurasrurales.com', 'client', '2024-12-18 16:55:00+00', NOW()),
('nnnnnnnn-nnnn-nnnn-nnnn-nnnnnnnnnnnn', 'daniel.rubio@reformashospitalarias.com', 'client', '2024-01-23 11:40:00+00', NOW()),
('oooooooo-oooo-oooo-oooo-oooooooooooo', 'patricia.medina@construccioneseducativas.com', 'client', '2024-02-28 13:25:00+00', NOW()),
('pppppppp-pppp-pppp-pppp-pppppppppppp', 'alejandro.serrano@obrasturisticas.com', 'client', '2024-03-05 08:50:00+00', NOW()),
('qqqqqqqq-qqqq-qqqq-qqqq-qqqqqqqqqqqq', 'silvia.pena@infraestructuraslogisticas.com', 'client', '2024-04-10 15:35:00+00', NOW()),
('rrrrrrrr-rrrr-rrrr-rrrr-rrrrrrrrrrrr', 'roberto.cortes@reformashoteleras.com', 'client', '2024-05-15 12:20:00+00', NOW()),
('ssssssss-ssss-ssss-ssss-ssssssssssss', 'nuria.iglesias@construccionesaeroportuarias.com', 'client', '2024-06-20 10:05:00+00', NOW()),
('tttttttt-tttt-tttt-tttt-tttttttttttt', 'oscar.garrido@obrasferroviarias.com', 'client', '2024-07-25 14:50:00+00', NOW()),
('uuuuuuuu-uuuu-uuuu-uuuu-uuuuuuuuuuuu', 'raquel.santos@infraestructurasportuarias.com', 'client', '2024-08-30 09:15:00+00', NOW()),
('vvvvvvvv-vvvv-vvvv-vvvv-vvvvvvvvvvvv', 'victor.guerrero@reformasindustriales.com', 'client', '2024-09-15 16:40:00+00', NOW()),
('wwwwwwww-wwww-wwww-wwww-wwwwwwwwwwww', 'amparo.lozano@construccionesmineras.com', 'client', '2024-10-20 11:25:00+00', NOW()),
('xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', 'emilio.mendoza@obrasenergeticas.com', 'client', '2024-11-25 13:10:00+00', NOW()),
('yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy', 'dolores.prieto@infraestructurastecnologicas.com', 'client', '2024-12-30 08:55:00+00', NOW()),
('zzzzzzzz-zzzz-zzzz-zzzz-zzzzzzzzzzzz', 'ignacio.vargas@reformasculturales.com', 'client', '2024-01-15 15:20:00+00', NOW()),
('12345678-1234-1234-1234-123456789012', 'esperanza.campos@construccionesdeportivas.com', 'client', '2024-02-20 12:35:00+00', NOW()),
('23456789-2345-2345-2345-234567890123', 'ramon.cano@obrassanitarias.com', 'client', '2024-03-25 10:10:00+00', NOW()),
('34567890-3456-3456-3456-345678901234', 'concepcion.flores@infraestructuraseducativas.com', 'client', '2024-04-30 14:45:00+00', NOW()),
('45678901-4567-4567-4567-456789012345', 'tomas.aguilar@reformasreligiosas.com', 'client', '2024-05-05 09:30:00+00', NOW()),
('56789012-5678-5678-5678-567890123456', 'remedios.pascual@construccionesmilitares.com', 'client', '2024-06-10 16:15:00+00', NOW()),
('67890123-6789-6789-6789-678901234567', 'enrique.santana@obraspenitenciarias.com', 'client', '2024-07-15 11:50:00+00', NOW()),
('78901234-7890-7890-7890-789012345678', 'encarnacion.calvo@infraestructurasjudiciales.com', 'client', '2024-08-20 13:25:00+00', NOW()),
('89012345-8901-8901-8901-890123456789', 'gonzalo.parra@reformasgubernamentales.com', 'client', '2024-09-25 08:40:00+00', NOW()),
('90123456-9012-9012-9012-901234567890', 'inmaculada.hidalgo@construccionesdiplomaticas.com', 'client', '2024-10-30 15:55:00+00', NOW()),
('01234567-0123-0123-0123-012345678901', 'esteban.montero@obrasconsulares.com', 'client', '2024-11-15 12:30:00+00', NOW()),
('12340987-1234-1234-1234-123409876543', 'milagros.ibanez@infraestructurasembajadas.com', 'client', '2024-12-20 10:15:00+00', NOW()),
('23451098-2345-2345-2345-234510987654', 'nicolas.ferrer@reformasinternacionales.com', 'client', '2024-01-25 14:00:00+00', NOW()),
('34562109-3456-3456-3456-345621098765', 'asuncion.caballero@construccioneseuropeas.com', 'client', '2024-02-10 09:45:00+00', NOW()),
('45673210-4567-4567-4567-456732109876', 'andres.gallego@obrasglobales.com', 'client', '2024-03-15 16:30:00+00', NOW()),
('56784321-5678-5678-5678-567843210987', 'purificacion.leon@infraestructurasmundiales.com', 'client', '2024-04-20 11:15:00+00', NOW()),
('67895432-6789-6789-6789-678954321098', 'ricardo.vega@construccionesavanzadas.com', 'client', '2024-05-25 13:00:00+00', NOW());

-- Insertar 50 clientes con datos heterogéneos
INSERT INTO clients (
  user_id, client_id, company_name, contact_name, email, phone, address,
  subscription_plan, subscription_status, storage_used, storage_limit,
  documents_processed, tokens_available, obralia_credentials, created_at, updated_at
) VALUES
-- Enterprise clients (12 clientes - 24%)
('11111111-1111-1111-1111-111111111111', 'CLI-0001', 'Construcciones García S.L.', 'Juan García', 'juan.garcia@construccionesgarcia.com', '+34 600 123 456', 'Calle Construcción 123, Madrid', 'enterprise', 'active', 4200000000, 5368709120, 85, 8500, '{"configured": true, "username": "juan.garcia@obralia.com", "password": "Garcia2024!"}', '2024-03-15 10:30:00+00', NOW()),
('22222222-2222-2222-2222-222222222222', 'CLI-0002', 'Obras Públicas del Norte S.A.', 'María López', 'maria.lopez@obraspublicas.com', '+34 600 234 567', 'Avenida Norte 456, Bilbao', 'enterprise', 'active', 3800000000, 5368709120, 92, 7200, '{"configured": true, "username": "maria.lopez@obralia.com", "password": "Norte2024!"}', '2024-04-20 14:15:00+00', NOW()),
('33333333-3333-3333-3333-333333333333', 'CLI-0003', 'Reformas Integrales López', 'Carlos Martín', 'carlos.martin@reformasintegrales.com', '+34 600 345 678', 'Plaza Reforma 789, Barcelona', 'enterprise', 'active', 4500000000, 5368709120, 78, 9100, '{"configured": false}', '2024-05-10 09:45:00+00', NOW()),
('44444444-4444-4444-4444-444444444444', 'CLI-0004', 'Constructora Mediterránea S.A.', 'Ana Rodríguez', 'ana.rodriguez@constructoramediterranea.com', '+34 600 456 789', 'Paseo Mediterráneo 321, Valencia', 'enterprise', 'active', 3900000000, 5368709120, 88, 7800, '{"configured": true, "username": "ana.rodriguez@obralia.com", "password": "Mediterranea2024!"}', '2024-06-05 16:20:00+00', NOW()),
('55555555-5555-5555-5555-555555555555', 'CLI-0005', 'Ingeniería y Obras S.L.', 'Pedro Sánchez', 'pedro.sanchez@ingenieriaobras.com', '+34 600 567 890', 'Calle Ingeniería 654, Sevilla', 'enterprise', 'active', 4100000000, 5368709120, 95, 8200, '{"configured": true, "username": "pedro.sanchez@obralia.com", "password": "Ingenieria2024!"}', '2024-07-12 11:30:00+00', NOW()),
('66666666-6666-6666-6666-666666666666', 'CLI-0006', 'Construcciones del Sur S.A.', 'Laura Fernández', 'laura.fernandez@construccionesdelsur.com', '+34 600 678 901', 'Avenida Sur 987, Málaga', 'enterprise', 'suspended', 2100000000, 5368709120, 45, 3200, '{"configured": false}', '2024-08-18 13:45:00+00', NOW()),
('77777777-7777-7777-7777-777777777777', 'CLI-0007', 'Infraestructuras Catalanas S.L.', 'Miguel Ruiz', 'miguel.ruiz@infraestructurascatalanas.com', '+34 600 789 012', 'Rambla Cataluña 147, Barcelona', 'enterprise', 'active', 4300000000, 5368709120, 82, 7600, '{"configured": true, "username": "miguel.ruiz@obralia.com", "password": "Catalanas2024!"}', '2024-09-22 08:15:00+00', NOW()),
('88888888-8888-8888-8888-888888888888', 'CLI-0008', 'Obras Marítimas Galicia S.A.', 'Carmen Jiménez', 'carmen.jimenez@obrasmaritimas.com', '+34 600 890 123', 'Puerto Marítimo 258, A Coruña', 'enterprise', 'active', 3700000000, 5368709120, 90, 8800, '{"configured": true, "username": "carmen.jimenez@obralia.com", "password": "Maritimas2024!"}', '2024-10-30 15:30:00+00', NOW()),
('99999999-9999-9999-9999-999999999999', 'CLI-0009', 'Edificaciones Sostenibles S.L.', 'José Moreno', 'jose.moreno@edificacionessostenibles.com', '+34 600 901 234', 'Eco Plaza 369, Zaragoza', 'enterprise', 'active', 4000000000, 5368709120, 87, 7900, '{"configured": false}', '2024-11-14 12:00:00+00', NOW()),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'CLI-0010', 'Túneles y Viaductos S.A.', 'Isabel Muñoz', 'isabel.munoz@tunelesyviaductos.com', '+34 600 012 345', 'Vía Túnel 741, Santander', 'enterprise', 'cancelled', 1200000000, 5368709120, 32, 2100, '{"configured": false}', '2024-12-01 10:45:00+00', NOW()),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'CLI-0011', 'Reformas Urbanas Madrid S.L.', 'Francisco Álvarez', 'francisco.alvarez@reformasurbanas.com', '+34 600 123 456', 'Gran Vía 852, Madrid', 'enterprise', 'active', 4400000000, 5368709120, 93, 8400, '{"configured": true, "username": "francisco.alvarez@obralia.com", "password": "Urbanas2024!"}', '2024-01-08 14:30:00+00', NOW()),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'CLI-0012', 'Construcciones Andaluzas S.A.', 'Pilar Romero', 'pilar.romero@construccionesandaluzas.com', '+34 600 234 567', 'Alameda Andaluza 963, Granada', 'enterprise', 'active', 3600000000, 5368709120, 89, 7700, '{"configured": true, "username": "pilar.romero@obralia.com", "password": "Andaluzas2024!"}', '2024-02-14 09:15:00+00', NOW()),

-- Professional clients (17 clientes - 34%)
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'CLI-0013', 'Obras Civiles Valencia S.L.', 'Antonio Navarro', 'antonio.navarro@obrasciviles.com', '+34 600 345 678', 'Ciudad de las Artes 159, Valencia', 'professional', 'active', 750000000, 1073741824, 45, 1800, '{"configured": true, "username": "antonio.navarro@obralia.com", "password": "Civiles2024!"}', '2024-03-20 16:45:00+00', NOW()),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'CLI-0014', 'Infraestructuras Vascas S.A.', 'Rosa Gutiérrez', 'rosa.gutierrez@infraestructurasvascas.com', '+34 600 456 789', 'Euskadi Etorbidea 357, Vitoria', 'professional', 'active', 820000000, 1073741824, 52, 1650, '{"configured": false}', '2024-04-25 11:20:00+00', NOW()),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'CLI-0015', 'Reformas Ecológicas S.L.', 'Manuel Torres', 'manuel.torres@reformasecologicas.com', '+34 600 567 890', 'Parque Ecológico 468, Pamplona', 'professional', 'active', 680000000, 1073741824, 38, 1950, '{"configured": true, "username": "manuel.torres@obralia.com", "password": "Ecologicas2024!"}', '2024-05-30 13:50:00+00', NOW()),
('gggggggg-gggg-gggg-gggg-gggggggggggg', 'CLI-0016', 'Construcciones Industriales S.A.', 'Elena Vázquez', 'elena.vazquez@construccionesindustriales.com', '+34 600 678 901', 'Polígono Industrial 579, Gijón', 'professional', 'suspended', 450000000, 1073741824, 28, 1200, '{"configured": false}', '2024-06-15 08:30:00+00', NOW()),
('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'CLI-0017', 'Obras Residenciales S.L.', 'Rafael Ramos', 'rafael.ramos@obrasresidenciales.com', '+34 600 789 012', 'Residencial Norte 680, Oviedo', 'professional', 'active', 890000000, 1073741824, 58, 1750, '{"configured": true, "username": "rafael.ramos@obralia.com", "password": "Residenciales2024!"}', '2024-07-20 15:15:00+00', NOW()),
('iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', 'CLI-0018', 'Infraestructuras Canarias S.A.', 'Cristina Herrera', 'cristina.herrera@infraestructurascanarias.com', '+34 600 890 123', 'Las Palmas Centro 791, Las Palmas', 'professional', 'active', 720000000, 1073741824, 42, 1850, '{"configured": false}', '2024-08-25 12:40:00+00', NOW()),
('jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', 'CLI-0019', 'Reformas Comerciales S.L.', 'Javier Molina', 'javier.molina@reformascomerciales.com', '+34 600 901 234', 'Centro Comercial 802, Murcia', 'professional', 'active', 650000000, 1073741824, 35, 1950, '{"configured": true, "username": "javier.molina@obralia.com", "password": "Comerciales2024!"}', '2024-09-10 10:25:00+00', NOW()),
('kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk', 'CLI-0020', 'Construcciones Históricas S.A.', 'Beatriz Delgado', 'beatriz.delgado@construccioneshistoricas.com', '+34 600 012 345', 'Casco Histórico 913, Toledo', 'professional', 'active', 780000000, 1073741824, 48, 1700, '{"configured": true, "username": "beatriz.delgado@obralia.com", "password": "Historicas2024!"}', '2024-10-05 14:10:00+00', NOW()),
('llllllll-llll-llll-llll-llllllllllll', 'CLI-0021', 'Obras Deportivas S.L.', 'Sergio Castro', 'sergio.castro@obrasdeportivas.com', '+34 600 123 456', 'Estadio Municipal 124, Vigo', 'professional', 'active', 850000000, 1073741824, 55, 1600, '{"configured": false}', '2024-11-12 09:35:00+00', NOW()),
('mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm', 'CLI-0022', 'Infraestructuras Rurales S.A.', 'Mónica Ortega', 'monica.ortega@infraestructurasrurales.com', '+34 600 234 567', 'Campo Rural 235, Salamanca', 'professional', 'active', 620000000, 1073741824, 32, 2000, '{"configured": true, "username": "monica.ortega@obralia.com", "password": "Rurales2024!"}', '2024-12-18 16:55:00+00', NOW()),
('nnnnnnnn-nnnn-nnnn-nnnn-nnnnnnnnnnnn', 'CLI-0023', 'Reformas Hospitalarias S.L.', 'Daniel Rubio', 'daniel.rubio@reformashospitalarias.com', '+34 600 345 678', 'Hospital Central 346, Valladolid', 'professional', 'active', 710000000, 1073741824, 41, 1900, '{"configured": false}', '2024-01-23 11:40:00+00', NOW()),
('oooooooo-oooo-oooo-oooo-oooooooooooo', 'CLI-0024', 'Construcciones Educativas S.A.', 'Patricia Medina', 'patricia.medina@construccioneseducativas.com', '+34 600 456 789', 'Campus Universitario 457, Córdoba', 'professional', 'suspended', 380000000, 1073741824, 22, 1100, '{"configured": false}', '2024-02-28 13:25:00+00', NOW()),
('pppppppp-pppp-pppp-pppp-pppppppppppp', 'CLI-0025', 'Obras Turísticas S.L.', 'Alejandro Serrano', 'alejandro.serrano@obrasturisticas.com', '+34 600 567 890', 'Costa del Sol 568, Marbella', 'professional', 'active', 920000000, 1073741824, 62, 1550, '{"configured": true, "username": "alejandro.serrano@obralia.com", "password": "Turisticas2024!"}', '2024-03-05 08:50:00+00', NOW()),
('qqqqqqqq-qqqq-qqqq-qqqq-qqqqqqqqqqqq', 'CLI-0026', 'Infraestructuras Logísticas S.A.', 'Silvia Peña', 'silvia.pena@infraestructuraslogisticas.com', '+34 600 678 901', 'Zona Logística 679, Zaragoza', 'professional', 'active', 760000000, 1073741824, 46, 1750, '{"configured": true, "username": "silvia.pena@obralia.com", "password": "Logisticas2024!"}', '2024-04-10 15:35:00+00', NOW()),
('rrrrrrrr-rrrr-rrrr-rrrr-rrrrrrrrrrrr', 'CLI-0027', 'Reformas Hoteleras S.L.', 'Roberto Cortés', 'roberto.cortes@reformashoteleras.com', '+34 600 789 012', 'Hotel Plaza 790, Palma', 'professional', 'active', 830000000, 1073741824, 51, 1650, '{"configured": false}', '2024-05-15 12:20:00+00', NOW()),
('ssssssss-ssss-ssss-ssss-ssssssssssss', 'CLI-0028', 'Construcciones Aeroportuarias S.A.', 'Nuria Iglesias', 'nuria.iglesias@construccionesaeroportuarias.com', '+34 600 890 123', 'Terminal Aeroportuario 801, Alicante', 'professional', 'active', 690000000, 1073741824, 39, 1900, '{"configured": true, "username": "nuria.iglesias@obralia.com", "password": "Aeroportuarias2024!"}', '2024-06-20 10:05:00+00', NOW()),
('tttttttt-tttt-tttt-tttt-tttttttttttt', 'CLI-0029', 'Obras Ferroviarias S.L.', 'Óscar Garrido', 'oscar.garrido@obrasferroviarias.com', '+34 600 901 234', 'Estación Central 912, León', 'professional', 'active', 870000000, 1073741824, 56, 1600, '{"configured": true, "username": "oscar.garrido@obralia.com", "password": "Ferroviarias2024!"}', '2024-07-25 14:50:00+00', NOW()),

-- Basic clients (15 clientes - 30%)
('uuuuuuuu-uuuu-uuuu-uuuu-uuuuuuuuuuuu', 'CLI-0030', 'Infraestructuras Portuarias S.A.', 'Raquel Santos', 'raquel.santos@infraestructurasportuarias.com', '+34 600 012 345', 'Puerto Comercial 123, Cádiz', 'basic', 'active', 320000000, 524288000, 18, 450, '{"configured": false}', '2024-08-30 09:15:00+00', NOW()),
('vvvvvvvv-vvvv-vvvv-vvvv-vvvvvvvvvvvv', 'CLI-0031', 'Reformas Industriales S.L.', 'Víctor Guerrero', 'victor.guerrero@reformasindustriales.com', '+34 600 123 456', 'Polígono Sur 234, Huelva', 'basic', 'active', 280000000, 524288000, 15, 520, '{"configured": true, "username": "victor.guerrero@obralia.com", "password": "Industriales2024!"}', '2024-09-15 16:40:00+00', NOW()),
('wwwwwwww-wwww-wwww-wwww-wwwwwwwwwwww', 'CLI-0032', 'Construcciones Mineras S.A.', 'Amparo Lozano', 'amparo.lozano@construccionesmineras.com', '+34 600 234 567', 'Mina Principal 345, Almería', 'basic', 'active', 410000000, 524288000, 22, 380, '{"configured": false}', '2024-10-20 11:25:00+00', NOW()),
('xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', 'CLI-0033', 'Obras Energéticas S.L.', 'Emilio Mendoza', 'emilio.mendoza@obrasenergeticas.com', '+34 600 345 678', 'Parque Eólico 456, Burgos', 'basic', 'active', 350000000, 524288000, 19, 470, '{"configured": true, "username": "emilio.mendoza@obralia.com", "password": "Energeticas2024!"}', '2024-11-25 13:10:00+00', NOW()),
('yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy', 'CLI-0034', 'Infraestructuras Tecnológicas S.A.', 'Dolores Prieto', 'dolores.prieto@infraestructurastecnologicas.com', '+34 600 456 789', 'Parque Tecnológico 567, Logroño', 'basic', 'cancelled', 180000000, 524288000, 8, 250, '{"configured": false}', '2024-12-30 08:55:00+00', NOW()),
('zzzzzzzz-zzzz-zzzz-zzzz-zzzzzzzzzzzz', 'CLI-0035', 'Reformas Culturales S.L.', 'Ignacio Vargas', 'ignacio.vargas@reformasculturales.com', '+34 600 567 890', 'Centro Cultural 678, Badajoz', 'basic', 'active', 290000000, 524288000, 16, 510, '{"configured": true, "username": "ignacio.vargas@obralia.com", "password": "Culturales2024!"}', '2024-01-15 15:20:00+00', NOW()),
('12345678-1234-1234-1234-123456789012', 'CLI-0036', 'Construcciones Deportivas S.A.', 'Esperanza Campos', 'esperanza.campos@construccionesdeportivas.com', '+34 600 678 901', 'Complejo Deportivo 789, Castellón', 'basic', 'active', 370000000, 524288000, 20, 420, '{"configured": false}', '2024-02-20 12:35:00+00', NOW()),
('23456789-2345-2345-2345-234567890123', 'CLI-0037', 'Obras Sanitarias S.L.', 'Ramón Cano', 'ramon.cano@obrassanitarias.com', '+34 600 789 012', 'Centro Sanitario 890, Albacete', 'basic', 'active', 330000000, 524288000, 17, 480, '{"configured": true, "username": "ramon.cano@obralia.com", "password": "Sanitarias2024!"}', '2024-03-25 10:10:00+00', NOW()),
('34567890-3456-3456-3456-345678901234', 'CLI-0038', 'Infraestructuras Educativas S.A.', 'Concepción Flores', 'concepcion.flores@infraestructuraseducativas.com', '+34 600 890 123', 'Campus Educativo 901, Tarragona', 'basic', 'active', 260000000, 524288000, 14, 530, '{"configured": false}', '2024-04-30 14:45:00+00', NOW()),
('45678901-4567-4567-4567-456789012345', 'CLI-0039', 'Reformas Religiosas S.L.', 'Tomás Aguilar', 'tomas.aguilar@reformasreligiosas.com', '+34 600 901 234', 'Plaza Catedral 012, Ávila', 'basic', 'active', 240000000, 524288000, 13, 550, '{"configured": true, "username": "tomas.aguilar@obralia.com", "password": "Religiosas2024!"}', '2024-05-05 09:30:00+00', NOW()),
('56789012-5678-5678-5678-567890123456', 'CLI-0040', 'Construcciones Militares S.A.', 'Remedios Pascual', 'remedios.pascual@construccionesmilitares.com', '+34 600 012 345', 'Base Militar 123, Segovia', 'basic', 'suspended', 150000000, 524288000, 7, 300, '{"configured": false}', '2024-06-10 16:15:00+00', NOW()),
('67890123-6789-6789-6789-678901234567', 'CLI-0041', 'Obras Penitenciarias S.L.', 'Enrique Santana', 'enrique.santana@obraspenitenciarias.com', '+34 600 123 456', 'Centro Penitenciario 234, Soria', 'basic', 'active', 310000000, 524288000, 16, 490, '{"configured": true, "username": "enrique.santana@obralia.com", "password": "Penitenciarias2024!"}', '2024-07-15 11:50:00+00', NOW()),
('78901234-7890-7890-7890-789012345678', 'CLI-0042', 'Infraestructuras Judiciales S.A.', 'Encarnación Calvo', 'encarnacion.calvo@infraestructurasjudiciales.com', '+34 600 234 567', 'Palacio Justicia 345, Cuenca', 'basic', 'active', 390000000, 524288000, 21, 410, '{"configured": false}', '2024-08-20 13:25:00+00', NOW()),
('89012345-8901-8901-8901-890123456789', 'CLI-0043', 'Reformas Gubernamentales S.L.', 'Gonzalo Parra', 'gonzalo.parra@reformasgubernamentales.com', '+34 600 345 678', 'Edificio Gobierno 456, Guadalajara', 'basic', 'cancelled', 120000000, 524288000, 5, 200, '{"configured": false}', '2024-09-25 08:40:00+00', NOW()),
('90123456-9012-9012-9012-901234567890', 'CLI-0044', 'Construcciones Diplomáticas S.A.', 'Inmaculada Hidalgo', 'inmaculada.hidalgo@construccionesdiplomaticas.com', '+34 600 456 789', 'Embajada Central 567, Madrid', 'basic', 'active', 270000000, 524288000, 14, 520, '{"configured": true, "username": "inmaculada.hidalgo@obralia.com", "password": "Diplomaticas2024!"}', '2024-10-30 15:55:00+00', NOW()),

-- Custom clients (6 clientes - 12%)
('01234567-0123-0123-0123-012345678901', 'CLI-0045', 'Obras Consulares S.L.', 'Esteban Montero', 'esteban.montero@obrasconsulares.com', '+34 600 567 890', 'Consulado General 678, Barcelona', 'custom', 'active', 6200000000, 10737418240, 125, 12500, '{"configured": true, "username": "esteban.montero@obralia.com", "password": "Consulares2024!"}', '2024-11-15 12:30:00+00', NOW()),
('12340987-1234-1234-1234-123409876543', 'CLI-0046', 'Infraestructuras Embajadas S.A.', 'Milagros Ibáñez', 'milagros.ibanez@infraestructurasembajadas.com', '+34 600 678 901', 'Distrito Embajadas 789, Madrid', 'custom', 'active', 7800000000, 10737418240, 145, 11200, '{"configured": false}', '2024-12-20 10:15:00+00', NOW()),
('23451098-2345-2345-2345-234510987654', 'CLI-0047', 'Reformas Internacionales S.L.', 'Nicolás Ferrer', 'nicolas.ferrer@reformasinternacionales.com', '+34 600 789 012', 'Centro Internacional 890, Valencia', 'custom', 'active', 5900000000, 10737418240, 115, 13800, '{"configured": true, "username": "nicolas.ferrer@obralia.com", "password": "Internacionales2024!"}', '2024-01-25 14:00:00+00', NOW()),
('34562109-3456-3456-3456-345621098765', 'CLI-0048', 'Construcciones Europeas S.A.', 'Asunción Caballero', 'asuncion.caballero@construccioneseuropeas.com', '+34 600 890 123', 'Distrito Europeo 901, Sevilla', 'custom', 'suspended', 3200000000, 10737418240, 68, 6500, '{"configured": false}', '2024-02-10 09:45:00+00', NOW()),
('45673210-4567-4567-4567-456732109876', 'CLI-0049', 'Obras Globales S.L.', 'Andrés Gallego', 'andres.gallego@obrasglobales.com', '+34 600 901 234', 'Plaza Global 012, Bilbao', 'custom', 'active', 8100000000, 10737418240, 152, 10800, '{"configured": true, "username": "andres.gallego@obralia.com", "password": "Globales2024!"}', '2024-03-15 16:30:00+00', NOW()),
('56784321-5678-5678-5678-567843210987', 'CLI-0050', 'Infraestructuras Mundiales S.A.', 'Purificación León', 'purificacion.leon@infraestructurasmundiales.com', '+34 600 012 345', 'Centro Mundial 123, Las Palmas', 'custom', 'cancelled', 2800000000, 10737418240, 58, 4200, '{"configured": false}', '2024-04-20 11:15:00+00', NOW());

-- Crear empresas para cada cliente (1-3 empresas por cliente)
INSERT INTO companies (client_id, name, cif, address, phone, email, created_at, updated_at) VALUES
-- Empresas para clientes Enterprise
('11111111-1111-1111-1111-111111111111', 'Construcciones García S.L.', 'B12345001', 'Calle Construcción 123, Madrid', '+34 600 123 456', 'info@construccionesgarcia.com', '2024-03-15 10:30:00+00', NOW()),
('11111111-1111-1111-1111-111111111111', 'García Filial Norte S.L.', 'B12345002', 'Avenida Norte 456, Madrid', '+34 600 123 457', 'norte@construccionesgarcia.com', '2024-04-01 10:30:00+00', NOW()),
('22222222-2222-2222-2222-222222222222', 'Obras Públicas del Norte S.A.', 'A12345003', 'Avenida Norte 456, Bilbao', '+34 600 234 567', 'info@obraspublicas.com', '2024-04-20 14:15:00+00', NOW()),
('22222222-2222-2222-2222-222222222222', 'Norte División Marítima S.A.', 'A12345004', 'Puerto Norte 789, Bilbao', '+34 600 234 568', 'maritima@obraspublicas.com', '2024-05-01 14:15:00+00', NOW()),
('33333333-3333-3333-3333-333333333333', 'Reformas Integrales López', 'B12345005', 'Plaza Reforma 789, Barcelona', '+34 600 345 678', 'info@reformasintegrales.com', '2024-05-10 09:45:00+00', NOW()),
('44444444-4444-4444-4444-444444444444', 'Constructora Mediterránea S.A.', 'A12345006', 'Paseo Mediterráneo 321, Valencia', '+34 600 456 789', 'info@constructoramediterranea.com', '2024-06-05 16:20:00+00', NOW()),
('55555555-5555-5555-5555-555555555555', 'Ingeniería y Obras S.L.', 'B12345007', 'Calle Ingeniería 654, Sevilla', '+34 600 567 890', 'info@ingenieriaobras.com', '2024-07-12 11:30:00+00', NOW()),
('66666666-6666-6666-6666-666666666666', 'Construcciones del Sur S.A.', 'A12345008', 'Avenida Sur 987, Málaga', '+34 600 678 901', 'info@construccionesdelsur.com', '2024-08-18 13:45:00+00', NOW()),
('77777777-7777-7777-7777-777777777777', 'Infraestructuras Catalanas S.L.', 'B12345009', 'Rambla Cataluña 147, Barcelona', '+34 600 789 012', 'info@infraestructurascatalanas.com', '2024-09-22 08:15:00+00', NOW()),
('88888888-8888-8888-8888-888888888888', 'Obras Marítimas Galicia S.A.', 'A12345010', 'Puerto Marítimo 258, A Coruña', '+34 600 890 123', 'info@obrasmaritimas.com', '2024-10-30 15:30:00+00', NOW()),
('99999999-9999-9999-9999-999999999999', 'Edificaciones Sostenibles S.L.', 'B12345011', 'Eco Plaza 369, Zaragoza', '+34 600 901 234', 'info@edificacionessostenibles.com', '2024-11-14 12:00:00+00', NOW()),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Túneles y Viaductos S.A.', 'A12345012', 'Vía Túnel 741, Santander', '+34 600 012 345', 'info@tunelesyviaductos.com', '2024-12-01 10:45:00+00', NOW()),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Reformas Urbanas Madrid S.L.', 'B12345013', 'Gran Vía 852, Madrid', '+34 600 123 456', 'info@reformasurbanas.com', '2024-01-08 14:30:00+00', NOW()),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Construcciones Andaluzas S.A.', 'A12345014', 'Alameda Andaluza 963, Granada', '+34 600 234 567', 'info@construccionesandaluzas.com', '2024-02-14 09:15:00+00', NOW()),

-- Empresas para clientes Professional (continuar con más empresas...)
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Obras Civiles Valencia S.L.', 'B12345015', 'Ciudad de las Artes 159, Valencia', '+34 600 345 678', 'info@obrasciviles.com', '2024-03-20 16:45:00+00', NOW()),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Infraestructuras Vascas S.A.', 'A12345016', 'Euskadi Etorbidea 357, Vitoria', '+34 600 456 789', 'info@infraestructurasvascas.com', '2024-04-25 11:20:00+00', NOW()),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Reformas Ecológicas S.L.', 'B12345017', 'Parque Ecológico 468, Pamplona', '+34 600 567 890', 'info@reformasecologicas.com', '2024-05-30 13:50:00+00', NOW()),
('gggggggg-gggg-gggg-gggg-gggggggggggg', 'Construcciones Industriales S.A.', 'A12345018', 'Polígono Industrial 579, Gijón', '+34 600 678 901', 'info@construccionesindustriales.com', '2024-06-15 08:30:00+00', NOW()),
('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'Obras Residenciales S.L.', 'B12345019', 'Residencial Norte 680, Oviedo', '+34 600 789 012', 'info@obrasresidenciales.com', '2024-07-20 15:15:00+00', NOW()),
('iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', 'Infraestructuras Canarias S.A.', 'A12345020', 'Las Palmas Centro 791, Las Palmas', '+34 600 890 123', 'info@infraestructurascanarias.com', '2024-08-25 12:40:00+00', NOW()),
('jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', 'Reformas Comerciales S.L.', 'B12345021', 'Centro Comercial 802, Murcia', '+34 600 901 234', 'info@reformascomerciales.com', '2024-09-10 10:25:00+00', NOW()),
('kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk', 'Construcciones Históricas S.A.', 'A12345022', 'Casco Histórico 913, Toledo', '+34 600 012 345', 'info@construccioneshistoricas.com', '2024-10-05 14:10:00+00', NOW()),
('llllllll-llll-llll-llll-llllllllllll', 'Obras Deportivas S.L.', 'B12345023', 'Estadio Municipal 124, Vigo', '+34 600 123 456', 'info@obrasdeportivas.com', '2024-11-12 09:35:00+00', NOW()),
('mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm', 'Infraestructuras Rurales S.A.', 'A12345024', 'Campo Rural 235, Salamanca', '+34 600 234 567', 'info@infraestructurasrurales.com', '2024-12-18 16:55:00+00', NOW()),
('nnnnnnnn-nnnn-nnnn-nnnn-nnnnnnnnnnnn', 'Reformas Hospitalarias S.L.', 'B12345025', 'Hospital Central 346, Valladolid', '+34 600 345 678', 'info@reformashospitalarias.com', '2024-01-23 11:40:00+00', NOW()),
('oooooooo-oooo-oooo-oooo-oooooooooooo', 'Construcciones Educativas S.A.', 'A12345026', 'Campus Universitario 457, Córdoba', '+34 600 456 789', 'info@construccioneseducativas.com', '2024-02-28 13:25:00+00', NOW()),
('pppppppp-pppp-pppp-pppp-pppppppppppp', 'Obras Turísticas S.L.', 'B12345027', 'Costa del Sol 568, Marbella', '+34 600 567 890', 'info@obrasturisticas.com', '2024-03-05 08:50:00+00', NOW()),
('qqqqqqqq-qqqq-qqqq-qqqq-qqqqqqqqqqqq', 'Infraestructuras Logísticas S.A.', 'A12345028', 'Zona Logística 679, Zaragoza', '+34 600 678 901', 'info@infraestructuraslogisticas.com', '2024-04-10 15:35:00+00', NOW()),
('rrrrrrrr-rrrr-rrrr-rrrr-rrrrrrrrrrrr', 'Reformas Hoteleras S.L.', 'B12345029', 'Hotel Plaza 790, Palma', '+34 600 789 012', 'info@reformashoteleras.com', '2024-05-15 12:20:00+00', NOW()),

-- Empresas para clientes Basic
('uuuuuuuu-uuuu-uuuu-uuuu-uuuuuuuuuuuu', 'Infraestructuras Portuarias S.A.', 'A12345030', 'Puerto Comercial 123, Cádiz', '+34 600 012 345', 'info@infraestructurasportuarias.com', '2024-08-30 09:15:00+00', NOW()),
('vvvvvvvv-vvvv-vvvv-vvvv-vvvvvvvvvvvv', 'Reformas Industriales S.L.', 'B12345031', 'Polígono Sur 234, Huelva', '+34 600 123 456', 'info@reformasindustriales.com', '2024-09-15 16:40:00+00', NOW()),
('wwwwwwww-wwww-wwww-wwww-wwwwwwwwwwww', 'Construcciones Mineras S.A.', 'A12345032', 'Mina Principal 345, Almería', '+34 600 234 567', 'info@construccionesmineras.com', '2024-10-20 11:25:00+00', NOW()),
('xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', 'Obras Energéticas S.L.', 'B12345033', 'Parque Eólico 456, Burgos', '+34 600 345 678', 'info@obrasenergeticas.com', '2024-11-25 13:10:00+00', NOW()),
('yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy', 'Infraestructuras Tecnológicas S.A.', 'A12345034', 'Parque Tecnológico 567, Logroño', '+34 600 456 789', 'info@infraestructurastecnologicas.com', '2024-12-30 08:55:00+00', NOW()),
('zzzzzzzz-zzzz-zzzz-zzzz-zzzzzzzzzzzz', 'Reformas Culturales S.L.', 'B12345035', 'Centro Cultural 678, Badajoz', '+34 600 567 890', 'info@reformasculturales.com', '2024-01-15 15:20:00+00', NOW()),
('12345678-1234-1234-1234-123456789012', 'Construcciones Deportivas S.A.', 'A12345036', 'Complejo Deportivo 789, Castellón', '+34 600 678 901', 'info@construccionesdeportivas.com', '2024-02-20 12:35:00+00', NOW()),
('23456789-2345-2345-2345-234567890123', 'Obras Sanitarias S.L.', 'B12345037', 'Centro Sanitario 890, Albacete', '+34 600 789 012', 'info@obrassanitarias.com', '2024-03-25 10:10:00+00', NOW()),
('34567890-3456-3456-3456-345678901234', 'Infraestructuras Educativas S.A.', 'A12345038', 'Campus Educativo 901, Tarragona', '+34 600 890 123', 'info@infraestructuraseducativas.com', '2024-04-30 14:45:00+00', NOW()),
('45678901-4567-4567-4567-456789012345', 'Reformas Religiosas S.L.', 'B12345039', 'Plaza Catedral 012, Ávila', '+34 600 901 234', 'info@reformasreligiosas.com', '2024-05-05 09:30:00+00', NOW()),
('56789012-5678-5678-5678-567890123456', 'Construcciones Militares S.A.', 'A12345040', 'Base Militar 123, Segovia', '+34 600 012 345', 'info@construccionesmilitares.com', '2024-06-10 16:15:00+00', NOW()),
('67890123-6789-6789-6789-678901234567', 'Obras Penitenciarias S.L.', 'B12345041', 'Centro Penitenciario 234, Soria', '+34 600 123 456', 'info@obraspenitenciarias.com', '2024-07-15 11:50:00+00', NOW()),
('78901234-7890-7890-7890-789012345678', 'Infraestructuras Judiciales S.A.', 'A12345042', 'Palacio Justicia 345, Cuenca', '+34 600 234 567', 'info@infraestructurasjudiciales.com', '2024-08-20 13:25:00+00', NOW()),
('89012345-8901-8901-8901-890123456789', 'Reformas Gubernamentales S.L.', 'B12345043', 'Edificio Gobierno 456, Guadalajara', '+34 600 345 678', 'info@reformasgubernamentales.com', '2024-09-25 08:40:00+00', NOW()),
('90123456-9012-9012-9012-901234567890', 'Construcciones Diplomáticas S.A.', 'A12345044', 'Embajada Central 567, Madrid', '+34 600 456 789', 'info@construccionesdiplomaticas.com', '2024-10-30 15:55:00+00', NOW()),

-- Empresas para clientes Custom
('01234567-0123-0123-0123-012345678901', 'Obras Consulares S.L.', 'B12345045', 'Consulado General 678, Barcelona', '+34 600 567 890', 'info@obrasconsulares.com', '2024-11-15 12:30:00+00', NOW()),
('12340987-1234-1234-1234-123409876543', 'Infraestructuras Embajadas S.A.', 'A12345046', 'Distrito Embajadas 789, Madrid', '+34 600 678 901', 'info@infraestructurasembajadas.com', '2024-12-20 10:15:00+00', NOW()),
('23451098-2345-2345-2345-234510987654', 'Reformas Internacionales S.L.', 'B12345047', 'Centro Internacional 890, Valencia', '+34 600 789 012', 'info@reformasinternacionales.com', '2024-01-25 14:00:00+00', NOW()),
('34562109-3456-3456-3456-345621098765', 'Construcciones Europeas S.A.', 'A12345048', 'Distrito Europeo 901, Sevilla', '+34 600 890 123', 'info@construccioneseuropeas.com', '2024-02-10 09:45:00+00', NOW()),
('45673210-4567-4567-4567-456732109876', 'Obras Globales S.L.', 'B12345049', 'Plaza Global 012, Bilbao', '+34 600 901 234', 'info@obrasglobales.com', '2024-03-15 16:30:00+00', NOW()),
('56784321-5678-5678-5678-567843210987', 'Infraestructuras Mundiales S.A.', 'A12345050', 'Centro Mundial 123, Las Palmas', '+34 600 012 345', 'info@infraestructurasmundiales.com', '2024-04-20 11:15:00+00', NOW());

-- Crear proyectos para las empresas (2-5 proyectos por empresa)
INSERT INTO projects (company_id, client_id, name, description, status, progress, start_date, end_date, budget, location, created_at, updated_at)
SELECT 
  c.id as company_id,
  c.client_id,
  CASE 
    WHEN random() < 0.3 THEN 'Edificio Residencial ' || c.name
    WHEN random() < 0.6 THEN 'Reforma Integral ' || c.name
    ELSE 'Construcción Industrial ' || c.name
  END as name,
  'Proyecto de construcción para ' || c.name as description,
  CASE 
    WHEN random() < 0.4 THEN 'active'
    WHEN random() < 0.7 THEN 'planning'
    WHEN random() < 0.9 THEN 'completed'
    ELSE 'paused'
  END as status,
  FLOOR(random() * 100) as progress,
  (NOW() - INTERVAL '6 months' + random() * INTERVAL '12 months')::date as start_date,
  (NOW() + INTERVAL '6 months' + random() * INTERVAL '18 months')::date as end_date,
  FLOOR(random() * 500000 + 50000) as budget,
  CASE 
    WHEN random() < 0.2 THEN 'Madrid, España'
    WHEN random() < 0.4 THEN 'Barcelona, España'
    WHEN random() < 0.6 THEN 'Valencia, España'
    WHEN random() < 0.8 THEN 'Sevilla, España'
    ELSE 'Bilbao, España'
  END as location,
  c.created_at + INTERVAL '1 month',
  NOW()
FROM companies c
CROSS JOIN generate_series(1, 3) -- 3 proyectos por empresa
WHERE random() < 0.8; -- 80% de las empresas tienen proyectos

-- Crear documentos para los proyectos
INSERT INTO documents (
  project_id, client_id, filename, original_name, file_size, file_type,
  document_type, classification_confidence, upload_status, obralia_status,
  security_scan_status, processing_attempts, created_at, updated_at
)
SELECT 
  p.id as project_id,
  p.client_id,
  'doc_' || generate_random_uuid() || '.pdf' as filename,
  CASE 
    WHEN random() < 0.25 THEN 'Certificado de Obra - ' || p.name || '.pdf'
    WHEN random() < 0.5 THEN 'Factura Materiales - ' || p.name || '.pdf'
    WHEN random() < 0.75 THEN 'Contrato Obra - ' || p.name || '.pdf'
    ELSE 'Plano Técnico - ' || p.name || '.pdf'
  END as original_name,
  FLOOR(random() * 5000000 + 100000) as file_size,
  'application/pdf' as file_type,
  CASE 
    WHEN random() < 0.25 THEN 'Certificado'
    WHEN random() < 0.5 THEN 'Factura'
    WHEN random() < 0.75 THEN 'Contrato'
    ELSE 'Plano'
  END as document_type,
  FLOOR(random() * 30 + 70) as classification_confidence,
  CASE 
    WHEN random() < 0.7 THEN 'completed'
    WHEN random() < 0.85 THEN 'processing'
    WHEN random() < 0.95 THEN 'classified'
    ELSE 'error'
  END as upload_status,
  CASE 
    WHEN random() < 0.6 THEN 'validated'
    WHEN random() < 0.8 THEN 'uploaded'
    WHEN random() < 0.95 THEN 'pending'
    ELSE 'rejected'
  END as obralia_status,
  CASE 
    WHEN random() < 0.9 THEN 'safe'
    WHEN random() < 0.98 THEN 'pending'
    ELSE 'threat_detected'
  END as security_scan_status,
  CASE 
    WHEN random() < 0.9 THEN 1
    ELSE FLOOR(random() * 3 + 2)
  END as processing_attempts,
  p.created_at + INTERVAL '1 week' + random() * INTERVAL '3 months',
  NOW()
FROM projects p
CROSS JOIN generate_series(1, 8) -- 8 documentos por proyecto
WHERE random() < 0.9; -- 90% de los proyectos tienen documentos

-- Crear suscripciones para clientes activos
INSERT INTO subscriptions (client_id, plan, status, current_period_start, current_period_end, created_at, updated_at)
SELECT 
  c.user_id as client_id,
  c.subscription_plan as plan,
  c.subscription_status as status,
  CASE 
    WHEN c.subscription_status = 'active' THEN DATE_TRUNC('month', NOW())
    ELSE c.created_at
  END as current_period_start,
  CASE 
    WHEN c.subscription_status = 'active' THEN DATE_TRUNC('month', NOW()) + INTERVAL '1 month'
    ELSE c.created_at + INTERVAL '1 month'
  END as current_period_end,
  c.created_at,
  NOW()
FROM clients c
WHERE c.subscription_status IN ('active', 'suspended');

-- Crear pagos y recibos para clientes activos
INSERT INTO payments (client_id, amount, currency, payment_method, payment_status, description, created_at, updated_at)
SELECT 
  c.user_id as client_id,
  CASE 
    WHEN c.subscription_plan = 'enterprise' THEN 299.00
    WHEN c.subscription_plan = 'professional' THEN 149.00
    WHEN c.subscription_plan = 'custom' THEN FLOOR(random() * 400 + 200)
    ELSE 59.00
  END as amount,
  'EUR' as currency,
  CASE 
    WHEN random() < 0.4 THEN 'stripe'
    WHEN random() < 0.7 THEN 'sepa'
    WHEN random() < 0.9 THEN 'paypal'
    ELSE 'bizum'
  END as payment_method,
  CASE 
    WHEN random() < 0.95 THEN 'completed'
    ELSE 'failed'
  END as payment_status,
  'Suscripción ' || c.subscription_plan || ' - ' || TO_CHAR(NOW(), 'Month YYYY') as description,
  c.created_at + INTERVAL '1 day',
  NOW()
FROM clients c
CROSS JOIN generate_series(1, 3) -- 3 pagos por cliente
WHERE c.subscription_status = 'active'
AND random() < 0.8; -- 80% de los clientes activos tienen pagos

-- Crear recibos correspondientes a los pagos completados
INSERT INTO receipts (
  receipt_number, client_id, amount, base_amount, tax_amount, tax_rate,
  currency, payment_method, gateway_name, description, payment_date,
  status, transaction_id, client_details, created_at, updated_at
)
SELECT 
  'REC-2025-' || LPAD((ROW_NUMBER() OVER())::text, 6, '0') as receipt_number,
  p.client_id,
  p.amount,
  ROUND(p.amount / 1.21, 2) as base_amount,
  ROUND(p.amount - (p.amount / 1.21), 2) as tax_amount,
  21.00 as tax_rate,
  p.currency,
  p.payment_method,
  INITCAP(p.payment_method) as gateway_name,
  p.description,
  p.created_at as payment_date,
  'paid' as status,
  'txn_' || substr(md5(random()::text), 1, 10) as transaction_id,
  jsonb_build_object(
    'name', c.company_name,
    'contact', c.contact_name,
    'email', c.email,
    'address', c.address,
    'tax_id', 'B' || LPAD(FLOOR(random() * 90000000 + 10000000)::text, 8, '0')
  ) as client_details,
  p.created_at,
  NOW()
FROM payments p
JOIN clients c ON p.client_id = c.user_id
WHERE p.payment_status = 'completed';

-- Crear logs de auditoría
INSERT INTO audit_logs (user_id, client_id, action, resource, details, ip_address, user_agent, created_at)
SELECT 
  c.user_id,
  c.user_id as client_id,
  CASE 
    WHEN random() < 0.3 THEN 'login'
    WHEN random() < 0.5 THEN 'upload'
    WHEN random() < 0.7 THEN 'create'
    WHEN random() < 0.85 THEN 'update'
    ELSE 'view'
  END as action,
  CASE 
    WHEN random() < 0.4 THEN 'document'
    WHEN random() < 0.6 THEN 'project'
    WHEN random() < 0.8 THEN 'company'
    ELSE 'client'
  END as resource,
  jsonb_build_object(
    'timestamp', NOW(),
    'success', random() < 0.95,
    'details', 'Acción realizada desde el panel de cliente'
  ) as details,
  '192.168.1.' || FLOOR(random() * 254 + 1) as ip_address,
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' as user_agent,
  c.created_at + random() * INTERVAL '30 days'
FROM clients c
CROSS JOIN generate_series(1, 5) -- 5 logs por cliente
WHERE random() < 0.8; -- 80% de los clientes tienen logs

-- Actualizar KPIs del sistema
INSERT INTO kpis (name, value, change, trend, period, category, description, created_at, updated_at) VALUES
('Total Clientes', '50', 25.0, 'up', 'monthly', 'clients', 'Total de clientes registrados en la plataforma', NOW(), NOW()),
('Clientes Activos', '42', 18.5, 'up', 'monthly', 'clients', 'Clientes con suscripción activa', NOW(), NOW()),
('Clientes Enterprise', '12', 33.3, 'up', 'monthly', 'clients', 'Clientes con plan Enterprise', NOW(), NOW()),
('Tasa de Retención', '84%', 5.2, 'up', 'monthly', 'clients', 'Porcentaje de clientes que renuevan', NOW(), NOW()),
('Configuración Obralia', '64%', 12.8, 'up', 'monthly', 'integrations', 'Clientes con Obralia configurado', NOW(), NOW()),
('Ingresos Mensuales', '7850', 22.3, 'up', 'monthly', 'financial', 'Ingresos mensuales recurrentes', NOW(), NOW()),
('Documentos Procesados', '1200', 28.7, 'up', 'monthly', 'documents', 'Documentos procesados este mes', NOW(), NOW()),
('Precisión IA', '94.2%', 2.1, 'up', 'monthly', 'ai', 'Precisión promedio de clasificación', NOW(), NOW()),
('Tiempo Respuesta', '145ms', -8.3, 'up', 'monthly', 'performance', 'Tiempo promedio de respuesta', NOW(), NOW()),
('Uptime Sistema', '99.97%', 0.1, 'stable', 'monthly', 'performance', 'Disponibilidad del sistema', NOW(), NOW())
ON CONFLICT (name) DO UPDATE SET
  value = EXCLUDED.value,
  change = EXCLUDED.change,
  trend = EXCLUDED.trend,
  updated_at = NOW();

-- Crear configuraciones del sistema
INSERT INTO system_settings (key, value, description, updated_at) VALUES
('app_name', '"ConstructIA"', 'Nombre de la aplicación', NOW()),
('max_file_size', '10485760', 'Tamaño máximo de archivo en bytes (10MB)', NOW()),
('ai_confidence_threshold', '85', 'Umbral mínimo de confianza para clasificación IA', NOW()),
('obralia_integration_enabled', 'true', 'Integración con Obralia habilitada', NOW()),
('email_notifications', 'true', 'Notificaciones por email habilitadas', NOW()),
('maintenance_mode', 'false', 'Modo de mantenimiento del sistema', NOW()),
('backup_frequency', '"daily"', 'Frecuencia de respaldos automáticos', NOW()),
('session_timeout', '3600', 'Tiempo de expiración de sesión en segundos', NOW()),
('max_concurrent_uploads', '5', 'Máximo número de subidas concurrentes', NOW()),
('storage_cleanup_days', '7', 'Días para limpiar documentos procesados', NOW())
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Crear pasarelas de pago
INSERT INTO payment_gateways (
  name, type, status, commission_type, commission_percentage, commission_fixed,
  supported_currencies, min_amount, max_amount, description, created_at, updated_at
) VALUES
('Stripe Principal', 'stripe', 'active', 'mixed', 2.9, 0.30, '["EUR", "USD"]', 1, 10000, 'Pasarela principal para tarjetas de crédito', NOW(), NOW()),
('SEPA Directo', 'sepa', 'active', 'fixed', 0, 0.50, '["EUR"]', 10, 50000, 'Domiciliación bancaria SEPA', NOW(), NOW()),
('PayPal Business', 'paypal', 'active', 'percentage', 3.4, 0, '["EUR", "USD"]', 1, 5000, 'Pagos con PayPal', NOW(), NOW()),
('Bizum Empresas', 'bizum', 'active', 'fixed', 0, 0.25, '["EUR"]', 1, 1000, 'Pagos instantáneos con Bizum', NOW(), NOW())
ON CONFLICT (name) DO UPDATE SET
  status = EXCLUDED.status,
  commission_percentage = EXCLUDED.commission_percentage,
  commission_fixed = EXCLUDED.commission_fixed,
  updated_at = NOW();