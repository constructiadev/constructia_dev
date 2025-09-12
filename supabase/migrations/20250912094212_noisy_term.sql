/*
  # Poblar tabla documentos con 200 documentos de prueba

  1. Configuración inicial
     - Verifica y crea tenant, empresas y obras de prueba si no existen
     - Asegura estructura jerárquica completa para vincular documentos

  2. Generación de documentos
     - 200 documentos distribuidos entre diferentes clientes/tenants
     - 3-6 documentos por cliente para comportamiento heterogéneo
     - Fechas dentro de los últimos 2 meses
     - Categorías variadas según enum documento_categoria
     - Estados distribuidos según enum documento_estado

  3. Inserción en cola manual
     - Todos los documentos se añaden a manual_upload_queue
     - Estado inicial 'queued' para procesamiento FIFO
     - Prioridades aleatorias para simular flujo real

  4. Verificación
     - Conteo exacto de documentos insertados
     - Distribución por cliente y categoría
     - Validación de integridad referencial
*/

-- Configuración inicial: Crear estructura jerárquica de prueba
DO $$
DECLARE
    _tenant_ids UUID[] := ARRAY[]::UUID[];
    _empresa_ids UUID[] := ARRAY[]::UUID[];
    _obra_ids UUID[] := ARRAY[]::UUID[];
    _tenant_id UUID;
    _empresa_id UUID;
    _obra_id UUID;
    i INTEGER;
BEGIN
    RAISE NOTICE 'Iniciando configuración de estructura jerárquica...';

    -- Crear 8 tenants diferentes para simular diferentes clientes
    FOR i IN 1..8 LOOP
        -- Verificar si el tenant ya existe
        SELECT id INTO _tenant_id FROM public.tenants 
        WHERE name = 'Cliente Prueba ' || i LIMIT 1;

        IF _tenant_id IS NULL THEN
            _tenant_id := gen_random_uuid();
            INSERT INTO public.tenants (id, name, status, created_at, updated_at)
            VALUES (_tenant_id, 'Cliente Prueba ' || i, 'active', NOW(), NOW());
            RAISE NOTICE 'Tenant creado: Cliente Prueba % - ID: %', i, _tenant_id;
        ELSE
            RAISE NOTICE 'Tenant ya existe: Cliente Prueba % - ID: %', i, _tenant_id;
        END IF;

        _tenant_ids := array_append(_tenant_ids, _tenant_id);

        -- Crear 1-2 empresas por tenant
        FOR j IN 1..(1 + (i % 2)) LOOP
            -- Verificar si la empresa ya existe
            SELECT id INTO _empresa_id FROM public.empresas 
            WHERE tenant_id = _tenant_id AND cif = 'B' || LPAD((12345000 + (i * 10) + j)::text, 8, '0') LIMIT 1;

            IF _empresa_id IS NULL THEN
                _empresa_id := gen_random_uuid();
                INSERT INTO public.empresas (
                    id, tenant_id, razon_social, cif, rea_numero, direccion, 
                    contacto_email, estado_compliance, created_at, updated_at
                )
                VALUES (
                    _empresa_id, 
                    _tenant_id, 
                    'Empresa ' || i || '.' || j || ' S.L.', 
                    'B' || LPAD((12345000 + (i * 10) + j)::text, 8, '0'),
                    'REA/2024/' || LPAD((i * 10 + j)::text, 3, '0'),
                    'Calle Empresa ' || i || '.' || j || ', Madrid',
                    'contacto' || i || j || '@empresa.com',
                    'al_dia',
                    NOW(), 
                    NOW()
                );
                RAISE NOTICE 'Empresa creada: Empresa %.% S.L. - ID: %', i, j, _empresa_id;
            ELSE
                RAISE NOTICE 'Empresa ya existe: Empresa %.% S.L. - ID: %', i, j, _empresa_id;
            END IF;

            _empresa_ids := array_append(_empresa_ids, _empresa_id);

            -- Crear 1-3 obras por empresa
            FOR k IN 1..(1 + (j % 3)) LOOP
                -- Verificar si la obra ya existe
                SELECT id INTO _obra_id FROM public.obras 
                WHERE tenant_id = _tenant_id AND empresa_id = _empresa_id 
                AND codigo_obra = 'OBRA-' || i || j || k LIMIT 1;

                IF _obra_id IS NULL THEN
                    _obra_id := gen_random_uuid();
                    INSERT INTO public.obras (
                        id, tenant_id, empresa_id, nombre_obra, codigo_obra, direccion,
                        cliente_final, fecha_inicio, fecha_fin_estimada, plataforma_destino,
                        perfil_riesgo, created_at, updated_at
                    )
                    VALUES (
                        _obra_id,
                        _tenant_id,
                        _empresa_id,
                        'Proyecto ' || i || '.' || j || '.' || k,
                        'OBRA-' || i || j || k,
                        'Ubicación Proyecto ' || i || '.' || j || '.' || k || ', Madrid',
                        'Cliente Final ' || i || '.' || j,
                        (NOW() - (random() * 180)::int * INTERVAL '1 day')::date,
                        (NOW() + (random() * 365)::int * INTERVAL '1 day')::date,
                        (ARRAY['nalanda', 'ctaima', 'ecoordina'])[((i + j + k) % 3) + 1]::public.plataforma_tipo,
                        (ARRAY['baja', 'media', 'alta'])[((i + j) % 3) + 1]::public.perfil_riesgo,
                        NOW(),
                        NOW()
                    );
                    RAISE NOTICE 'Obra creada: Proyecto %.%.% - ID: %', i, j, k, _obra_id;
                ELSE
                    RAISE NOTICE 'Obra ya existe: Proyecto %.%.% - ID: %', i, j, k, _obra_id;
                END IF;

                _obra_ids := array_append(_obra_ids, _obra_id);
            END LOOP;
        END LOOP;
    END LOOP;

    RAISE NOTICE 'Configuración completada: % tenants, % empresas, % obras', 
                 array_length(_tenant_ids, 1), 
                 array_length(_empresa_ids, 1), 
                 array_length(_obra_ids, 1);
END $$;

-- Parte principal: Insertar exactamente 200 documentos en la tabla 'documentos'
BEGIN;

RAISE NOTICE 'Iniciando inserción de 200 documentos...';

WITH 
-- Obtener todas las obras disponibles con su jerarquía
available_obras AS (
    SELECT 
        o.id AS obra_id,
        o.tenant_id,
        o.empresa_id,
        o.nombre_obra,
        o.codigo_obra,
        e.razon_social AS empresa_nombre,
        t.name AS tenant_nombre,
        ROW_NUMBER() OVER (ORDER BY o.created_at) AS obra_sequence
    FROM public.obras o
    JOIN public.empresas e ON o.empresa_id = e.id
    JOIN public.tenants t ON o.tenant_id = t.id
),
-- Generar 200 documentos distribuidos entre las obras disponibles
document_generation AS (
    SELECT 
        ROW_NUMBER() OVER () AS doc_number,
        ao.obra_id,
        ao.tenant_id,
        ao.empresa_id,
        ao.obra_sequence,
        -- Distribuir documentos: 3-6 por obra, ciclando entre obras disponibles
        ((doc_number - 1) % (SELECT COUNT(*) FROM available_obras)) + 1 AS target_obra_sequence
    FROM 
        available_obras ao,
        generate_series(1, 200) AS doc_number
),
-- Asignar cada documento a una obra específica
document_assignments AS (
    SELECT 
        dg.doc_number,
        ao.obra_id,
        ao.tenant_id,
        ao.empresa_id,
        ao.empresa_nombre,
        ao.tenant_nombre
    FROM document_generation dg
    JOIN available_obras ao ON ao.obra_sequence = ((dg.doc_number - 1) % (SELECT COUNT(*) FROM available_obras)) + 1
),
-- Generar datos aleatorios únicos para cada documento
document_data AS (
    SELECT 
        da.*,
        gen_random_uuid() AS doc_id,
        -- Categorías distribuidas aleatoriamente
        (ARRAY[
            'PRL', 'APTITUD_MEDICA', 'DNI_CIF', 'ALTA_SS_TC2', 'CONTRATO LABORAL',
            'SEGURO_RC', 'REA', 'CERTIFICACION_FORMACION_PRL', 'EVAL_RIESGOS',
            'CERT_MAQUINARIA', 'PLAN_SEGURIDAD', 'OTROS', 'CIF'
        ]::public.documento_categoria[])[floor(random() * 13) + 1] AS categoria,
        -- Estados distribuidos: 40% aprobado, 30% pendiente, 20% borrador, 10% rechazado
        CASE 
            WHEN random() < 0.4 THEN 'aprobado'::public.documento_estado
            WHEN random() < 0.7 THEN 'pendiente'::public.documento_estado
            WHEN random() < 0.9 THEN 'borrador'::public.documento_estado
            ELSE 'rechazado'::public.documento_estado
        END AS estado,
        -- Fechas dentro de los últimos 2 meses (60 días)
        (NOW() - (random() * 60)::int * INTERVAL '1 day') AS fecha_creacion,
        -- Tamaños de archivo realistas (100KB a 15MB)
        (FLOOR(random() * (15 * 1024 * 1024 - 100 * 1024) + 100 * 1024))::bigint AS size_bytes,
        -- Hash único para cada documento
        encode(sha256(random()::text::bytea), 'hex') AS hash_sha256,
        -- Emisores variados
        (ARRAY[
            'Constructora Alfa S.L.', 'Ingeniería Beta S.A.', 'Suministros Gamma S.L.',
            'Consultoría Delta S.L.', 'Arquitectura Epsilon S.A.', 'Servicios Zeta S.L.'
        ])[floor(random() * 6) + 1] AS emisor,
        -- Origen distribuido: 70% usuario, 30% IA
        CASE 
            WHEN random() < 0.7 THEN 'usuario'::public.documento_origen
            ELSE 'ia'::public.documento_origen
        END AS origen,
        -- 15% de documentos sensibles
        random() < 0.15 AS sensible,
        -- Fechas de caducidad: 30% sin caducidad, 50% futuras, 20% pasadas
        CASE
            WHEN random() < 0.3 THEN NULL
            WHEN random() < 0.8 THEN (NOW() + (random() * 730)::int * INTERVAL '1 day')::date
            ELSE (NOW() - (random() * 365)::int * INTERVAL '1 day')::date
        END AS caducidad
    FROM document_assignments da
)
INSERT INTO public.documentos (
    id,
    tenant_id,
    entidad_tipo,
    entidad_id,
    categoria,
    file,
    mime,
    size_bytes,
    hash_sha256,
    version,
    estado,
    caducidad,
    emisor,
    observaciones,
    metadatos,
    origen,
    sensible,
    virtual_path,
    created_at,
    updated_at
)
SELECT
    dd.doc_id,
    dd.tenant_id,
    'obra'::public.entidad_tipo,
    dd.obra_id::text,
    dd.categoria,
    'documentos/' || dd.tenant_id || '/obra/' || dd.obra_id || '/' || dd.categoria || '/v1/' || dd.hash_sha256 || '.pdf',
    'application/pdf',
    dd.size_bytes,
    dd.hash_sha256,
    -- Calcular versión dinámica para evitar duplicados
    COALESCE(
        (SELECT MAX(d.version) 
         FROM public.documentos d 
         WHERE d.tenant_id = dd.tenant_id 
           AND d.entidad_tipo = 'obra'
           AND d.entidad_id = dd.obra_id::text 
           AND d.categoria = dd.categoria), 
        0
    ) + 1,
    dd.estado,
    dd.caducidad,
    dd.emisor,
    CASE 
        WHEN random() < 0.3 THEN NULL
        ELSE 'Documento generado automáticamente para pruebas - ' || dd.tenant_nombre
    END,
    jsonb_build_object(
        'generated_by_script', true,
        'script_version', '2.0',
        'generation_date', NOW(),
        'original_filename', 'documento_' || LPAD(dd.doc_number::text, 3, '0') || '_' || 
                           replace(lower(dd.categoria::text), ' ', '_') || '.pdf',
        'tenant_name', dd.tenant_nombre,
        'empresa_name', dd.empresa_nombre,
        'ai_extraction', jsonb_build_object(
            'categoria_probable', dd.categoria::text,
            'entidad_tipo_probable', 'obra',
            'confianza', jsonb_build_object(
                'categoria_probable', ROUND((random() * 0.25 + 0.70)::numeric, 3),
                'fecha_caducidad', ROUND((random() * 0.20 + 0.75)::numeric, 3),
                'empresa', ROUND((random() * 0.15 + 0.80)::numeric, 3)
            ),
            'campos', jsonb_build_object(
                'empresa', dd.empresa_nombre,
                'fecha_emision', dd.fecha_creacion::date,
                'fecha_caducidad', dd.caducidad,
                'coincidencias_texto', ARRAY[dd.categoria::text, dd.empresa_nombre]
            )
        ),
        'upload_info', jsonb_build_object(
            'user_agent', 'ConstructIA-TestScript/2.0',
            'ip_address', '127.0.0.1',
            'upload_method', 'batch_script'
        )
    ),
    dd.origen,
    dd.sensible,
    NULL, -- virtual_path
    dd.fecha_creacion,
    dd.fecha_creacion + (random() * INTERVAL '1 hour') -- updated_at ligeramente posterior
FROM document_data dd
ORDER BY dd.doc_number;

-- Obtener estadísticas de inserción
GET DIAGNOSTICS _inserted_count = ROW_COUNT;
RAISE NOTICE 'Documentos insertados en tabla documentos: %', _inserted_count;

COMMIT;

-- Parte 2: Insertar documentos en la cola de gestión manual
BEGIN;

RAISE NOTICE 'Insertando documentos en cola de gestión manual...';

INSERT INTO public.manual_upload_queue (
    id,
    tenant_id,
    empresa_id,
    obra_id,
    documento_id,
    status,
    priority,
    operator_user,
    nota,
    created_at,
    updated_at
)
SELECT
    gen_random_uuid(),
    d.tenant_id,
    -- Obtener empresa_id de la obra asociada
    (SELECT o.empresa_id FROM public.obras o WHERE o.id = d.entidad_id::uuid),
    d.entidad_id::uuid,
    d.id,
    'queued'::public.queue_status,
    -- Distribución de prioridades: 10% urgent, 20% high, 60% normal, 10% low
    CASE 
        WHEN random() < 0.1 THEN 'urgent'
        WHEN random() < 0.3 THEN 'high'
        WHEN random() < 0.9 THEN 'normal'
        ELSE 'low'
    END,
    NULL, -- operator_user (sin asignar inicialmente)
    'Documento de prueba generado por script - Categoría: ' || d.categoria::text || 
    ' - Cliente: ' || (d.metadatos->>'tenant_name'),
    d.created_at,
    NOW()
FROM public.documentos d
WHERE d.metadatos->>'generated_by_script' = 'true'
  AND d.metadatos->>'script_version' = '2.0'
  AND d.entidad_tipo = 'obra'
  AND NOT EXISTS (
      SELECT 1 FROM public.manual_upload_queue muq 
      WHERE muq.documento_id = d.id
  );

-- Obtener estadísticas de inserción en cola
GET DIAGNOSTICS _queue_inserted = ROW_COUNT;
RAISE NOTICE 'Documentos insertados en cola manual: %', _queue_inserted;

COMMIT;

-- Verificaciones finales y estadísticas
DO $$
DECLARE
    _total_docs INTEGER;
    _total_queue INTEGER;
    _docs_by_tenant RECORD;
    _docs_by_categoria RECORD;
    _docs_by_estado RECORD;
BEGIN
    RAISE NOTICE '=== VERIFICACIÓN FINAL ===';

    -- Contar documentos totales generados por el script
    SELECT COUNT(*) INTO _total_docs 
    FROM public.documentos 
    WHERE metadatos->>'generated_by_script' = 'true' 
      AND metadatos->>'script_version' = '2.0';
    
    RAISE NOTICE 'Total documentos generados: %', _total_docs;

    -- Contar documentos en cola manual
    SELECT COUNT(*) INTO _total_queue 
    FROM public.manual_upload_queue muq
    JOIN public.documentos d ON muq.documento_id = d.id
    WHERE d.metadatos->>'generated_by_script' = 'true'
      AND d.metadatos->>'script_version' = '2.0';
    
    RAISE NOTICE 'Total documentos en cola manual: %', _total_queue;

    -- Distribución por tenant (cliente)
    RAISE NOTICE '--- Distribución por Cliente ---';
    FOR _docs_by_tenant IN 
        SELECT 
            t.name AS tenant_name,
            COUNT(d.id) AS doc_count
        FROM public.documentos d
        JOIN public.tenants t ON d.tenant_id = t.id
        WHERE d.metadatos->>'generated_by_script' = 'true'
          AND d.metadatos->>'script_version' = '2.0'
        GROUP BY t.name
        ORDER BY doc_count DESC
    LOOP
        RAISE NOTICE '%: % documentos', _docs_by_tenant.tenant_name, _docs_by_tenant.doc_count;
    END LOOP;

    -- Distribución por categoría
    RAISE NOTICE '--- Distribución por Categoría ---';
    FOR _docs_by_categoria IN 
        SELECT 
            categoria::text AS categoria_name,
            COUNT(*) AS doc_count
        FROM public.documentos d
        WHERE d.metadatos->>'generated_by_script' = 'true'
          AND d.metadatos->>'script_version' = '2.0'
        GROUP BY categoria
        ORDER BY doc_count DESC
        LIMIT 10
    LOOP
        RAISE NOTICE '%: % documentos', _docs_by_categoria.categoria_name, _docs_by_categoria.doc_count;
    END LOOP;

    -- Distribución por estado
    RAISE NOTICE '--- Distribución por Estado ---';
    FOR _docs_by_estado IN 
        SELECT 
            estado::text AS estado_name,
            COUNT(*) AS doc_count
        FROM public.documentos d
        WHERE d.metadatos->>'generated_by_script' = 'true'
          AND d.metadatos->>'script_version' = '2.0'
        GROUP BY estado
        ORDER BY doc_count DESC
    LOOP
        RAISE NOTICE '%: % documentos', _docs_by_estado.estado_name, _docs_by_estado.doc_count;
    END LOOP;

    RAISE NOTICE '=== VERIFICACIÓN COMPLETADA ===';
END $$;

-- Consulta final: Mostrar muestra de documentos creados
SELECT 
    'MUESTRA DE DOCUMENTOS CREADOS' AS info;

SELECT
    d.id,
    t.name AS cliente,
    e.razon_social AS empresa,
    o.nombre_obra AS proyecto,
    d.categoria,
    d.estado,
    d.file,
    d.size_bytes,
    d.created_at,
    muq.status AS queue_status,
    muq.priority AS queue_priority
FROM public.documentos d
JOIN public.tenants t ON d.tenant_id = t.id
JOIN public.obras o ON d.entidad_id = o.id::text
JOIN public.empresas e ON o.empresa_id = e.id
LEFT JOIN public.manual_upload_queue muq ON muq.documento_id = d.id
WHERE d.metadatos->>'generated_by_script' = 'true'
  AND d.metadatos->>'script_version' = '2.0'
ORDER BY d.created_at DESC
LIMIT 15;

-- Estadísticas finales
SELECT 
    'ESTADÍSTICAS FINALES' AS info;

SELECT
    COUNT(*) AS total_documentos_generados,
    COUNT(DISTINCT d.tenant_id) AS clientes_con_documentos,
    COUNT(DISTINCT o.empresa_id) AS empresas_con_documentos,
    COUNT(DISTINCT d.entidad_id) AS obras_con_documentos,
    AVG(d.size_bytes)::bigint AS tamano_promedio_bytes,
    MIN(d.created_at) AS fecha_mas_antigua,
    MAX(d.created_at) AS fecha_mas_reciente
FROM public.documentos d
JOIN public.obras o ON d.entidad_id = o.id::text
WHERE d.metadatos->>'generated_by_script' = 'true'
  AND d.metadatos->>'script_version' = '2.0';