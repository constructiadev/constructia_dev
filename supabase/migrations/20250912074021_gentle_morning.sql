-- ConstructIA - Script SQL para insertar 100 documentos de prueba
-- Sistema: PostgreSQL (Supabase)
-- Propósito: Poblar la tabla 'documentos' con datos realistas para testing

-- =============================================================================
-- SCRIPT DE INSERCIÓN DE 100 DOCUMENTOS DE PRUEBA
-- =============================================================================

BEGIN;

-- Comentario: Descomenta las siguientes líneas si tienes problemas de RLS
-- ALTER TABLE public.documentos DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.empresas DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.obras DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.tenants DISABLE ROW LEVEL SECURITY;

-- Verificar que existen entidades base antes de insertar
DO $$
DECLARE
    tenant_count INTEGER;
    empresa_count INTEGER;
    obra_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO tenant_count FROM public.tenants;
    SELECT COUNT(*) INTO empresa_count FROM public.empresas;
    SELECT COUNT(*) INTO obra_count FROM public.obras;
    
    IF tenant_count = 0 THEN
        RAISE EXCEPTION 'No hay tenants en la base de datos. Crea al menos un tenant antes de ejecutar este script.';
    END IF;
    
    IF empresa_count = 0 THEN
        RAISE EXCEPTION 'No hay empresas en la base de datos. Crea al menos una empresa antes de ejecutar este script.';
    END IF;
    
    IF obra_count = 0 THEN
        RAISE EXCEPTION 'No hay obras en la base de datos. Crea al menos una obra antes de ejecutar este script.';
    END IF;
    
    RAISE NOTICE 'Verificación exitosa: % tenants, % empresas, % obras encontradas', tenant_count, empresa_count, obra_count;
END $$;

-- Insertar 100 documentos de prueba con distribución realista
WITH 
-- Paso 1: Obtener entidades válidas con sus relaciones
valid_entities AS (
    SELECT
        t.id AS tenant_id,
        t.name AS tenant_name,
        e.id AS empresa_id,
        e.razon_social AS empresa_nombre,
        o.id AS obra_id,
        o.nombre_obra AS obra_nombre,
        o.codigo_obra AS obra_codigo
    FROM
        public.tenants t
    JOIN
        public.empresas e ON t.id = e.tenant_id
    JOIN
        public.obras o ON e.id = o.empresa_id AND t.id = o.tenant_id
),
-- Paso 2: Generar nombres de documentos realistas
document_names AS (
    SELECT 
        unnest(ARRAY[
            'Certificado_PRL_Trabajador', 'Aptitud_Medica_Anual', 'DNI_Trabajador_001', 
            'Contrato_Laboral_Temporal', 'Seguro_RC_Empresa', 'Registro_REA_Actualizado',
            'Formacion_PRL_Basica', 'Evaluacion_Riesgos_Obra', 'Certificado_Maquinaria_Grua',
            'Plan_Seguridad_Salud', 'Factura_Materiales_Enero', 'Albaran_Entrega_Cemento',
            'Parte_Trabajo_Diario', 'Control_Calidad_Hormigon', 'Mediciones_Obra_Mes',
            'Certificacion_Soldadura', 'Inspeccion_Grua_Torre', 'Revision_Andamios',
            'Acta_Reunion_Seguridad', 'Informe_Avance_Obra', 'Presupuesto_Adicional',
            'Modificado_Proyecto', 'Licencia_Obra_Mayor', 'Comunicacion_Ayuntamiento',
            'Estudio_Geotecnico', 'Proyecto_Ejecutivo', 'Memoria_Calidades',
            'Pliego_Condiciones', 'Mediciones_Presupuesto', 'Estudio_Seguridad',
            'Plan_Gestion_Residuos', 'Certificado_Eficiencia', 'Libro_Ordenes',
            'Control_Recepcion', 'Ensayos_Laboratorio', 'Certificado_Final_Obra'
        ]) AS base_name,
        unnest(ARRAY[
            'PRL', 'APTITUD_MEDICA', 'DNI_CIF', 'CONTRATO LABORAL', 'SEGURO_RC', 'REA',
            'CERTIFICACION_FORMACION_PRL', 'EVAL_RIESGOS', 'CERT_MAQUINARIA', 'PLAN_SEGURIDAD',
            'OTROS', 'OTROS', 'OTROS', 'OTROS', 'OTROS', 'OTROS', 'OTROS', 'OTROS', 'OTROS', 'OTROS',
            'OTROS', 'OTROS', 'OTROS', 'OTROS', 'OTROS', 'OTROS', 'OTROS', 'OTROS', 'OTROS', 'OTROS',
            'OTROS', 'OTROS', 'OTROS', 'OTROS', 'OTROS'
        ]) AS categoria
),
-- Paso 3: Generar 100 documentos con datos realistas
generated_documents AS (
    SELECT
        ROW_NUMBER() OVER () AS doc_number,
        -- Seleccionar entidad válida aleatoria
        (SELECT tenant_id FROM valid_entities ORDER BY RANDOM() LIMIT 1) AS tenant_id,
        'obra'::public.entidad_tipo AS entidad_tipo,
        (SELECT obra_id FROM valid_entities ORDER BY RANDOM() LIMIT 1) AS entidad_id,
        
        -- Usar nombres y categorías realistas
        dn.categoria::public.documento_categoria AS categoria,
        
        -- Generar path de archivo realista
        'uploads/' || 
        (SELECT tenant_id FROM valid_entities ORDER BY RANDOM() LIMIT 1)::TEXT || 
        '/obra/' || 
        (SELECT obra_id FROM valid_entities ORDER BY RANDOM() LIMIT 1)::TEXT || 
        '/' || dn.categoria || '/' || 
        dn.base_name || '_' || 
        TO_CHAR(NOW() - (RANDOM() * 60 || ' days')::INTERVAL, 'YYYY_MM_DD') ||
        CASE FLOOR(RANDOM() * 4)
            WHEN 0 THEN '.pdf'
            WHEN 1 THEN '.jpg'
            WHEN 2 THEN '.docx'
            ELSE '.xlsx'
        END AS file_path,
        
        -- Tipo MIME correspondiente
        CASE FLOOR(RANDOM() * 4)
            WHEN 0 THEN 'application/pdf'
            WHEN 1 THEN 'image/jpeg'
            WHEN 2 THEN 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ELSE 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        END AS mime,
        
        -- Tamaño de archivo realista (100KB - 10MB)
        FLOOR(RANDOM() * (10 * 1024 * 1024 - 100 * 1024) + 100 * 1024)::BIGINT AS size_bytes,
        
        -- Hash SHA256 único
        ENCODE(SHA256((dn.base_name || RANDOM()::TEXT)::BYTEA), 'hex') AS hash_sha256,
        
        1 AS version,
        
        -- Estados distribuidos de forma realista
        CASE FLOOR(RANDOM() * 10)
            WHEN 0, 1 THEN 'borrador'::public.documento_estado
            WHEN 2, 3, 4 THEN 'pendiente'::public.documento_estado
            WHEN 5, 6, 7, 8 THEN 'aprobado'::public.documento_estado
            ELSE 'rechazado'::public.documento_estado
        END AS estado,
        
        -- Fechas de caducidad realistas (solo para ciertos tipos)
        CASE 
            WHEN dn.categoria IN ('APTITUD_MEDICA', 'CERTIFICACION_FORMACION_PRL', 'SEGURO_RC', 'CERT_MAQUINARIA') 
            THEN (NOW() + (RANDOM() * 730 + 30 || ' days')::INTERVAL)::DATE -- Entre 30 días y 2 años
            ELSE NULL
        END AS caducidad,
        
        -- Emisores realistas según categoría
        CASE dn.categoria
            WHEN 'APTITUD_MEDICA' THEN 'Centro Médico Laboral'
            WHEN 'CERTIFICACION_FORMACION_PRL' THEN 'Instituto de Formación PRL'
            WHEN 'SEGURO_RC' THEN 'Compañía de Seguros'
            WHEN 'REA' THEN 'Fundación Laboral de la Construcción'
            WHEN 'CERT_MAQUINARIA' THEN 'Organismo de Control Autorizado'
            ELSE 'Empresa Constructora'
        END AS emisor,
        
        'Documento de prueba generado automáticamente - ' || dn.base_name AS observaciones,
        
        -- Metadatos JSONB con información de IA
        JSON_BUILD_OBJECT(
            'ai_extraction', JSON_BUILD_OBJECT(
                'confianza', JSON_BUILD_OBJECT(
                    'categoria_probable', ROUND((RANDOM() * 0.3 + 0.7)::NUMERIC, 2)
                ),
                'campos', JSON_BUILD_OBJECT(
                    'empresa', 'Empresa de Prueba',
                    'fecha_emision', TO_CHAR(NOW() - (RANDOM() * 60 || ' days')::INTERVAL, 'YYYY-MM-DD')
                )
            ),
            'original_filename', dn.base_name || '.pdf',
            'upload_timestamp', NOW()::TEXT,
            'generated_by_script', true
        )::JSONB AS metadatos,
        
        'usuario'::public.documento_origen AS origen,
        
        -- 15% probabilidad de ser sensible
        (RANDOM() < 0.15) AS sensible,
        
        -- Path virtual
        'virtual/' || dn.categoria || '/' || dn.base_name AS virtual_path,
        
        -- Fechas distribuidas en los últimos 2 meses
        (NOW() - (RANDOM() * 60 || ' days')::INTERVAL) AS created_at,
        (NOW() - (RANDOM() * 59 || ' days')::INTERVAL) AS updated_at
        
    FROM 
        document_names dn,
        GENERATE_SERIES(1, 3) AS multiplier -- Generar múltiples documentos por nombre base
    LIMIT 100 -- Asegurar exactamente 100 documentos
)
-- Inserción final con validación de entidades
INSERT INTO public.documentos (
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
    gd.tenant_id,
    gd.entidad_tipo,
    gd.entidad_id,
    gd.categoria,
    gd.file_path,
    gd.mime,
    gd.size_bytes,
    gd.hash_sha256,
    gd.version,
    gd.estado,
    gd.caducidad,
    gd.emisor,
    gd.observaciones,
    gd.metadatos,
    gd.origen,
    gd.sensible,
    gd.virtual_path,
    gd.created_at,
    gd.updated_at
FROM
    generated_documents gd
WHERE
    -- Validar que la entidad existe
    EXISTS (
        SELECT 1 FROM public.obras o 
        WHERE o.id = gd.entidad_id 
        AND o.tenant_id = gd.tenant_id
    );

-- Confirmar transacción
COMMIT;

-- Re-habilitar RLS si fue deshabilitado
-- ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.obras ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- CONSULTAS DE VERIFICACIÓN
-- =============================================================================

-- 1. Conteo total de documentos
SELECT 
    COUNT(*) AS total_documentos_insertados,
    'Documentos insertados correctamente' AS mensaje
FROM public.documentos 
WHERE metadatos->>'generated_by_script' = 'true';

-- 2. Distribución por tenant (cliente)
SELECT
    t.name AS cliente_tenant,
    COUNT(d.id) AS documentos_asignados,
    ROUND(COUNT(d.id) * 100.0 / (SELECT COUNT(*) FROM public.documentos WHERE metadatos->>'generated_by_script' = 'true'), 1) AS porcentaje
FROM
    public.documentos d
JOIN
    public.tenants t ON d.tenant_id = t.id
WHERE
    d.metadatos->>'generated_by_script' = 'true'
GROUP BY
    t.name, t.id
ORDER BY
    documentos_asignados DESC;

-- 3. Distribución por empresa y obra
SELECT
    e.razon_social AS empresa,
    o.nombre_obra AS obra,
    o.codigo_obra AS codigo_obra,
    COUNT(d.id) AS documentos_en_obra
FROM
    public.documentos d
JOIN
    public.obras o ON d.entidad_id = o.id AND d.entidad_tipo = 'obra'
JOIN
    public.empresas e ON o.empresa_id = e.id
WHERE
    d.metadatos->>'generated_by_script' = 'true'
GROUP BY
    e.razon_social, o.nombre_obra, o.codigo_obra
ORDER BY
    documentos_en_obra DESC;

-- 4. Distribución por categoría de documento
SELECT
    categoria,
    COUNT(*) AS cantidad,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM public.documentos WHERE metadatos->>'generated_by_script' = 'true'), 1) AS porcentaje
FROM
    public.documentos
WHERE
    metadatos->>'generated_by_script' = 'true'
GROUP BY
    categoria
ORDER BY
    cantidad DESC;

-- 5. Distribución por estado
SELECT
    estado,
    COUNT(*) AS cantidad,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM public.documentos WHERE metadatos->>'generated_by_script' = 'true'), 1) AS porcentaje
FROM
    public.documentos
WHERE
    metadatos->>'generated_by_script' = 'true'
GROUP BY
    estado
ORDER BY
    cantidad DESC;

-- 6. Verificación de integridad referencial
SELECT
    'Documentos huérfanos (sin tenant)' AS tipo_problema,
    COUNT(*) AS cantidad
FROM
    public.documentos d
LEFT JOIN
    public.tenants t ON d.tenant_id = t.id
WHERE
    d.metadatos->>'generated_by_script' = 'true'
    AND t.id IS NULL

UNION ALL

SELECT
    'Documentos huérfanos (sin obra)' AS tipo_problema,
    COUNT(*) AS cantidad
FROM
    public.documentos d
LEFT JOIN
    public.obras o ON d.entidad_id = o.id
WHERE
    d.metadatos->>'generated_by_script' = 'true'
    AND d.entidad_tipo = 'obra'
    AND o.id IS NULL;

-- 7. Verificación de fechas de creación (últimos 2 meses)
SELECT
    'Documentos en rango de fechas correcto' AS verificacion,
    COUNT(*) AS cantidad,
    MIN(created_at) AS fecha_mas_antigua,
    MAX(created_at) AS fecha_mas_reciente
FROM
    public.documentos
WHERE
    metadatos->>'generated_by_script' = 'true'
    AND created_at >= NOW() - INTERVAL '60 days';

-- 8. Resumen final
SELECT
    'RESUMEN FINAL' AS seccion,
    (SELECT COUNT(*) FROM public.documentos WHERE metadatos->>'generated_by_script' = 'true') AS documentos_insertados,
    (SELECT COUNT(DISTINCT tenant_id) FROM public.documentos WHERE metadatos->>'generated_by_script' = 'true') AS tenants_con_documentos,
    (SELECT COUNT(DISTINCT entidad_id) FROM public.documentos WHERE metadatos->>'generated_by_script' = 'true' AND entidad_tipo = 'obra') AS obras_con_documentos;