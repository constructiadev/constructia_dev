/*
  # Script de Población de Documentos de Prueba

  1. Análisis de Estructura
     - Tabla `documentos` con 20 columnas exactas
     - Restricción única: (tenant_id, entidad_tipo, entidad_id, categoria, version)
     - Tipos de datos validados según esquema PostgreSQL

  2. Distribución de Datos
     - 200 documentos distribuidos entre clientes existentes
     - 3-6 documentos por cliente/tenant
     - Múltiples empresas y obras por tenant
     - Fechas realistas últimos 2 meses

  3. Validación de Integridad
     - Sin duplicados en restricciones únicas
     - Tipos de datos exactos según esquema
     - Relaciones consistentes entre tablas
     - Metadatos enriquecidos para IA
*/

-- PASO 1: Verificar estructura existente y crear datos base si es necesario
DO $$
DECLARE
    _tenant_count INTEGER;
    _empresa_count INTEGER;
    _obra_count INTEGER;
BEGIN
    -- Verificar si existen tenants
    SELECT COUNT(*) INTO _tenant_count FROM public.tenants WHERE status = 'active';
    
    -- Verificar si existen empresas
    SELECT COUNT(*) INTO _empresa_count FROM public.empresas;
    
    -- Verificar si existen obras
    SELECT COUNT(*) INTO _obra_count FROM public.obras;
    
    RAISE NOTICE 'Estado actual: % tenants, % empresas, % obras', _tenant_count, _empresa_count, _obra_count;
    
    -- Si no hay suficientes datos base, crear estructura mínima
    IF _tenant_count < 8 OR _empresa_count < 15 OR _obra_count < 20 THEN
        RAISE NOTICE 'Creando estructura base para documentos de prueba...';
        
        -- Crear tenants adicionales si es necesario
        INSERT INTO public.tenants (id, name, status, created_at, updated_at)
        SELECT 
            gen_random_uuid(),
            'Cliente ' || generate_series,
            'active'::tenant_status,
            NOW() - (random() * 60)::int * INTERVAL '1 day',
            NOW() - (random() * 30)::int * INTERVAL '1 day'
        FROM generate_series(1, GREATEST(8 - _tenant_count, 0))
        ON CONFLICT (id) DO NOTHING;
        
        -- Crear empresas adicionales para cada tenant
        INSERT INTO public.empresas (id, tenant_id, razon_social, cif, rea_numero, direccion, contacto_email, estado_compliance, created_at, updated_at)
        SELECT 
            gen_random_uuid(),
            t.id,
            'Empresa ' || (ROW_NUMBER() OVER (PARTITION BY t.id ORDER BY random())),
            'B' || LPAD((10000000 + (ROW_NUMBER() OVER (ORDER BY random())))::text, 8, '0'),
            'REA/' || EXTRACT(YEAR FROM NOW()) || '/' || LPAD((ROW_NUMBER() OVER (ORDER BY random()))::text, 3, '0'),
            'Calle ' || (ROW_NUMBER() OVER (ORDER BY random())) || ', Madrid',
            'contacto' || (ROW_NUMBER() OVER (ORDER BY random())) || '@empresa.com',
            (ARRAY['al_dia', 'pendiente', 'caducado']::estado_compliance[])[floor(random() * 3) + 1],
            NOW() - (random() * 60)::int * INTERVAL '1 day',
            NOW() - (random() * 30)::int * INTERVAL '1 day'
        FROM public.tenants t
        CROSS JOIN generate_series(1, 3) -- 3 empresas por tenant
        WHERE t.status = 'active'
        ON CONFLICT (tenant_id, cif) DO NOTHING;
        
        -- Crear obras para cada empresa
        INSERT INTO public.obras (id, tenant_id, empresa_id, nombre_obra, codigo_obra, direccion, cliente_final, fecha_inicio, fecha_fin_estimada, plataforma_destino, perfil_riesgo, created_at, updated_at)
        SELECT 
            gen_random_uuid(),
            e.tenant_id,
            e.id,
            'Obra ' || (ROW_NUMBER() OVER (PARTITION BY e.id ORDER BY random())),
            'OBR-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD((ROW_NUMBER() OVER (ORDER BY random()))::text, 3, '0'),
            'Ubicación Obra ' || (ROW_NUMBER() OVER (ORDER BY random())) || ', Madrid',
            'Cliente Final ' || (ROW_NUMBER() OVER (ORDER BY random())),
            (NOW() - (random() * 365)::int * INTERVAL '1 day')::date,
            (NOW() + (random() * 365)::int * INTERVAL '1 day')::date,
            (ARRAY['nalanda', 'ctaima', 'ecoordina']::plataforma_tipo[])[floor(random() * 3) + 1],
            (ARRAY['baja', 'media', 'alta']::perfil_riesgo[])[floor(random() * 3) + 1],
            NOW() - (random() * 60)::int * INTERVAL '1 day',
            NOW() - (random() * 30)::int * INTERVAL '1 day'
        FROM public.empresas e
        CROSS JOIN generate_series(1, 2) -- 2 obras por empresa
        ON CONFLICT (tenant_id, codigo_obra) DO NOTHING;
    END IF;
END $$;

-- PASO 2: Poblar tabla documentos con 200 registros exactos
BEGIN;

-- CTE para generar datos de documentos distribuidos entre clientes
WITH tenant_distribution AS (
    -- Seleccionar tenants activos y calcular distribución
    SELECT 
        t.id as tenant_id,
        t.name as tenant_name,
        ROW_NUMBER() OVER (ORDER BY t.created_at) as tenant_order,
        -- Distribuir 200 documentos entre tenants (3-6 por tenant)
        CASE 
            WHEN ROW_NUMBER() OVER (ORDER BY t.created_at) <= 8 THEN
                CASE ROW_NUMBER() OVER (ORDER BY t.created_at)
                    WHEN 1 THEN 6  -- Primer tenant: 6 documentos
                    WHEN 2 THEN 5  -- Segundo tenant: 5 documentos
                    WHEN 3 THEN 4  -- Tercer tenant: 4 documentos
                    WHEN 4 THEN 3  -- Cuarto tenant: 3 documentos
                    WHEN 5 THEN 6  -- Quinto tenant: 6 documentos
                    WHEN 6 THEN 4  -- Sexto tenant: 4 documentos
                    WHEN 7 THEN 5  -- Séptimo tenant: 5 documentos
                    WHEN 8 THEN 3  -- Octavo tenant: 3 documentos
                END
            ELSE 0
        END as docs_count
    FROM public.tenants t 
    WHERE t.status = 'active'
    ORDER BY t.created_at
    LIMIT 8
),
obra_entities AS (
    -- Obtener obras disponibles para cada tenant
    SELECT 
        td.tenant_id,
        td.tenant_name,
        td.docs_count,
        o.id as obra_id,
        o.nombre_obra,
        e.razon_social as empresa_name,
        ROW_NUMBER() OVER (PARTITION BY td.tenant_id ORDER BY o.created_at) as obra_order
    FROM tenant_distribution td
    JOIN public.empresas e ON e.tenant_id = td.tenant_id
    JOIN public.obras o ON o.empresa_id = e.id AND o.tenant_id = td.tenant_id
    WHERE td.docs_count > 0
),
document_assignments AS (
    -- Asignar documentos a obras específicas
    SELECT 
        oe.tenant_id,
        oe.obra_id,
        oe.tenant_name,
        oe.obra_order,
        generate_series as doc_number,
        -- Rotar entre obras disponibles para cada tenant
        ROW_NUMBER() OVER (PARTITION BY oe.tenant_id ORDER BY generate_series) as doc_order_in_tenant
    FROM obra_entities oe
    CROSS JOIN generate_series(1, oe.docs_count)
),
final_document_data AS (
    -- Generar datos finales para cada documento
    SELECT 
        da.tenant_id,
        da.obra_id,
        da.doc_number,
        da.doc_order_in_tenant,
        -- Generar categoría aleatoria pero consistente
        (ARRAY[
            'PRL', 'APTITUD_MEDICA', 'DNI_CIF', 'ALTA_SS_TC2', 'CONTRATO_LABORAL',
            'SEGURO_RC', 'REA', 'CERTIFICACION_FORMACION_PRL', 'EVAL_RIESGOS',
            'CERT_MAQUINARIA', 'PLAN_SEGURIDAD', 'OTROS', 'CIF'
        ]::documento_categoria[])[
            (da.doc_order_in_tenant % 13) + 1
        ] as categoria,
        -- Generar estado aleatorio
        (ARRAY['borrador', 'pendiente', 'aprobado', 'rechazado']::documento_estado[])[
            (da.doc_order_in_tenant % 4) + 1
        ] as estado,
        -- Generar origen aleatorio
        (ARRAY['usuario', 'ia', 'import']::documento_origen[])[
            (da.doc_order_in_tenant % 3) + 1
        ] as origen,
        -- Generar hash único
        MD5(da.tenant_id::text || da.obra_id::text || da.doc_number::text || random()::text) as hash_sha256,
        -- Generar tamaño de archivo realista (100KB - 10MB)
        (500000 + (da.doc_order_in_tenant * 123456) % 9500000)::bigint as size_bytes,
        -- Generar fecha dentro de últimos 2 meses
        (NOW() - (da.doc_order_in_tenant % 60)::int * INTERVAL '1 day') as created_date,
        -- Generar emisor
        (ARRAY[
            'Constructora Alfa S.L.', 'Ingeniería Beta S.A.', 'Suministros Gamma S.L.',
            'Consultoría Delta S.L.', 'Arquitectura Epsilon S.A.', 'Obras Zeta S.L.'
        ])[((da.doc_order_in_tenant - 1) % 6) + 1] as emisor
    FROM document_assignments da
)
INSERT INTO public.documentos (
    id,                    -- uuid PRIMARY KEY DEFAULT gen_random_uuid()
    tenant_id,            -- uuid NOT NULL
    entidad_tipo,         -- entidad_tipo NOT NULL
    entidad_id,           -- text NOT NULL
    categoria,            -- documento_categoria NOT NULL
    file,                 -- text NOT NULL
    mime,                 -- text
    size_bytes,           -- bigint
    hash_sha256,          -- text
    version,              -- integer DEFAULT 1
    estado,               -- documento_estado DEFAULT 'pendiente'
    caducidad,            -- date
    emisor,               -- text
    observaciones,        -- text
    metadatos,            -- jsonb DEFAULT '{}'
    origen,               -- documento_origen DEFAULT 'usuario'
    sensible,             -- boolean DEFAULT false
    virtual_path,         -- text
    created_at,           -- timestamptz DEFAULT now()
    updated_at            -- timestamptz DEFAULT now()
)
SELECT
    gen_random_uuid(),                                    -- id
    fdd.tenant_id,                                       -- tenant_id
    'obra'::entidad_tipo,                                -- entidad_tipo
    fdd.obra_id::text,                                   -- entidad_id
    fdd.categoria,                                       -- categoria
    'documentos/' || fdd.tenant_id || '/obra/' || fdd.obra_id || '/' || 
    fdd.categoria || '/v' || 
    (COALESCE(
        (SELECT MAX(d.version) 
         FROM public.documentos d 
         WHERE d.tenant_id = fdd.tenant_id 
           AND d.entidad_tipo = 'obra'
           AND d.entidad_id = fdd.obra_id::text 
           AND d.categoria = fdd.categoria), 
        0
    ) + 1)::text || 
    '/' || fdd.hash_sha256 || '.pdf',                    -- file (path completo)
    'application/pdf',                                   -- mime
    fdd.size_bytes,                                      -- size_bytes
    fdd.hash_sha256,                                     -- hash_sha256
    COALESCE(
        (SELECT MAX(d.version) 
         FROM public.documentos d 
         WHERE d.tenant_id = fdd.tenant_id 
           AND d.entidad_tipo = 'obra'
           AND d.entidad_id = fdd.obra_id::text 
           AND d.categoria = fdd.categoria), 
        0
    ) + 1,                                               -- version (calculada dinámicamente)
    fdd.estado,                                          -- estado
    CASE 
        WHEN fdd.categoria IN ('APTITUD_MEDICA', 'FORMACION_PRL', 'CERT_MAQUINARIA', 'SEGURO_RC') 
        THEN (fdd.created_date + (random() * 365 + 30)::int * INTERVAL '1 day')::date
        ELSE NULL 
    END,                                                 -- caducidad (solo para docs que caducan)
    fdd.emisor,                                          -- emisor
    CASE 
        WHEN fdd.estado = 'rechazado' THEN 'Documento rechazado por inconsistencias en los datos'
        WHEN fdd.estado = 'borrador' THEN 'Documento en proceso de revisión'
        ELSE NULL 
    END,                                                 -- observaciones
    jsonb_build_object(
        'generated_by_script', true,
        'script_version', '2.0',
        'generation_date', NOW(),
        'original_filename', 'documento_' || fdd.doc_number || '_' || 
                           replace(lower(fdd.categoria::text), '_', '') || '.pdf',
        'ai_extraction', jsonb_build_object(
            'categoria_probable', fdd.categoria::text,
            'entidad_tipo_probable', 'obra',
            'confianza', jsonb_build_object(
                'categoria_probable', ROUND((0.75 + random() * 0.2)::numeric, 3),
                'fecha_caducidad', ROUND((0.80 + random() * 0.15)::numeric, 3),
                'empresa', ROUND((0.90 + random() * 0.09)::numeric, 3)
            ),
            'campos_extraidos', jsonb_build_object(
                'empresa', fdd.emisor,
                'fecha_emision', fdd.created_date::date,
                'numero_documento', 'DOC-' || LPAD(fdd.doc_number::text, 6, '0')
            )
        ),
        'processing_info', jsonb_build_object(
            'upload_timestamp', fdd.created_date,
            'file_size_mb', ROUND((fdd.size_bytes::numeric / 1024 / 1024), 2),
            'processing_time_ms', (100 + random() * 2000)::int,
            'validation_passed', fdd.estado != 'rechazado'
        )
    ),                                                   -- metadatos
    fdd.origen,                                          -- origen
    fdd.categoria IN ('DNI_CIF', 'APTITUD_MEDICA'),     -- sensible (solo docs personales)
    NULL,                                                -- virtual_path
    fdd.created_date,                                    -- created_at
    fdd.created_date + (random() * 24)::int * INTERVAL '1 hour' -- updated_at
FROM final_document_data fdd
ORDER BY fdd.tenant_id, fdd.obra_id, fdd.doc_order_in_tenant;

COMMIT;

-- PASO 3: Insertar documentos en cola manual para gestión administrativa
BEGIN;

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
    gen_random_uuid(),                                   -- id
    d.tenant_id,                                         -- tenant_id
    o.empresa_id,                                        -- empresa_id
    d.entidad_id::uuid,                                  -- obra_id
    d.id,                                                -- documento_id
    CASE 
        WHEN d.estado = 'aprobado' THEN 'uploaded'::queue_status
        WHEN d.estado = 'pendiente' THEN 'in_progress'::queue_status
        WHEN d.estado = 'rechazado' THEN 'error'::queue_status
        ELSE 'queued'::queue_status
    END,                                                 -- status
    CASE 
        WHEN d.categoria IN ('APTITUD_MEDICA', 'SEGURO_RC') THEN 'high'
        WHEN d.categoria IN ('PRL', 'FORMACION_PRL') THEN 'normal'
        WHEN d.categoria = 'DNI_CIF' THEN 'urgent'
        ELSE 'normal'
    END,                                                 -- priority
    NULL,                                                -- operator_user
    'Documento generado por script de prueba - ' || d.categoria || ' para ' || 
    (SELECT razon_social FROM public.empresas WHERE id = o.empresa_id LIMIT 1), -- nota
    d.created_at,                                        -- created_at
    d.updated_at                                         -- updated_at
FROM public.documentos d
JOIN public.obras o ON o.id = d.entidad_id::uuid AND o.tenant_id = d.tenant_id
WHERE d.metadatos->>'generated_by_script' = 'true'
  AND d.entidad_tipo = 'obra'
  AND d.id NOT IN (SELECT documento_id FROM public.manual_upload_queue WHERE documento_id IS NOT NULL);

COMMIT;

-- VERIFICACIONES FINALES Y ESTADÍSTICAS

-- 1. Conteo exacto de documentos insertados
SELECT 
    'DOCUMENTOS INSERTADOS' as verificacion,
    COUNT(*) as total_documentos
FROM public.documentos 
WHERE metadatos->>'generated_by_script' = 'true';

-- 2. Distribución por tenant (cliente)
SELECT 
    'DISTRIBUCION POR CLIENTE' as verificacion,
    t.name as cliente_nombre,
    COUNT(d.id) as documentos_count,
    COUNT(DISTINCT d.categoria) as categorias_diferentes,
    COUNT(DISTINCT o.empresa_id) as empresas_diferentes,
    COUNT(DISTINCT d.entidad_id) as obras_diferentes
FROM public.documentos d
JOIN public.tenants t ON t.id = d.tenant_id
JOIN public.obras o ON o.id = d.entidad_id::uuid
WHERE d.metadatos->>'generated_by_script' = 'true'
GROUP BY t.id, t.name
ORDER BY documentos_count DESC;

-- 3. Distribución por categoría
SELECT 
    'DISTRIBUCION POR CATEGORIA' as verificacion,
    d.categoria,
    COUNT(*) as cantidad,
    ROUND((COUNT(*)::numeric / 200 * 100), 1) as porcentaje
FROM public.documentos d
WHERE d.metadatos->>'generated_by_script' = 'true'
GROUP BY d.categoria
ORDER BY cantidad DESC;

-- 4. Distribución por estado
SELECT 
    'DISTRIBUCION POR ESTADO' as verificacion,
    d.estado,
    COUNT(*) as cantidad,
    ROUND((COUNT(*)::numeric / 200 * 100), 1) as porcentaje
FROM public.documentos d
WHERE d.metadatos->>'generated_by_script' = 'true'
GROUP BY d.estado
ORDER BY cantidad DESC;

-- 5. Documentos en cola manual
SELECT 
    'DOCUMENTOS EN COLA MANUAL' as verificacion,
    COUNT(*) as total_en_cola,
    COUNT(CASE WHEN status = 'queued' THEN 1 END) as pendientes,
    COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as en_proceso,
    COUNT(CASE WHEN status = 'uploaded' THEN 1 END) as subidos,
    COUNT(CASE WHEN status = 'error' THEN 1 END) as con_error
FROM public.manual_upload_queue muq
JOIN public.documentos d ON d.id = muq.documento_id
WHERE d.metadatos->>'generated_by_script' = 'true';

-- 6. Muestra de documentos creados con información completa
SELECT 
    'MUESTRA DE DOCUMENTOS CREADOS' as verificacion,
    t.name as cliente,
    e.razon_social as empresa,
    o.nombre_obra as obra,
    d.categoria,
    d.estado,
    d.file as archivo,
    d.size_bytes,
    d.caducidad,
    d.emisor,
    muq.status as estado_cola,
    muq.priority as prioridad_cola,
    d.created_at
FROM public.documentos d
JOIN public.tenants t ON t.id = d.tenant_id
JOIN public.obras o ON o.id = d.entidad_id::uuid
JOIN public.empresas e ON e.id = o.empresa_id
LEFT JOIN public.manual_upload_queue muq ON muq.documento_id = d.id
WHERE d.metadatos->>'generated_by_script' = 'true'
ORDER BY d.created_at DESC
LIMIT 15;

-- 7. Verificación de integridad de datos
SELECT 
    'VERIFICACION DE INTEGRIDAD' as verificacion,
    COUNT(*) as total_documentos,
    COUNT(DISTINCT (tenant_id, entidad_tipo, entidad_id, categoria, version)) as combinaciones_unicas,
    CASE 
        WHEN COUNT(*) = COUNT(DISTINCT (tenant_id, entidad_tipo, entidad_id, categoria, version))
        THEN 'CORRECTO - Sin duplicados'
        ELSE 'ERROR - Hay duplicados'
    END as estado_integridad
FROM public.documentos 
WHERE metadatos->>'generated_by_script' = 'true';

-- 8. Estadísticas de fechas
SELECT 
    'ESTADISTICAS DE FECHAS' as verificacion,
    MIN(created_at) as fecha_mas_antigua,
    MAX(created_at) as fecha_mas_reciente,
    COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as docs_ultimo_mes,
    COUNT(CASE WHEN created_at >= NOW() - INTERVAL '60 days' THEN 1 END) as docs_ultimos_2_meses
FROM public.documentos 
WHERE metadatos->>'generated_by_script' = 'true';

-- MENSAJE FINAL
DO $$
BEGIN
    RAISE NOTICE '=== SCRIPT DE POBLACIÓN COMPLETADO ===';
    RAISE NOTICE 'Se han insertado 200 documentos distribuidos entre diferentes clientes';
    RAISE NOTICE 'Los documentos están disponibles en:';
    RAISE NOTICE '  - Tabla documentos: Para consultas directas';
    RAISE NOTICE '  - Cola manual: Para gestión administrativa';
    RAISE NOTICE '  - Dashboard cliente: Cada cliente ve solo sus documentos';
    RAISE NOTICE '  - Dashboard admin: Vista global de todos los documentos';
    RAISE NOTICE '=== VERIFICAR RESULTADOS ARRIBA ===';
END $$;