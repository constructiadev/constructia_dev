```sql
-- Script para corregir el tipo ENUM 'documento_categoria' y poblar la tabla 'documentos' con 200 registros.

-- Parte 1: Asegurar que el tipo ENUM 'documento_categoria' tenga los valores correctos.
-- Esto es crucial para la consistencia de los datos y para que el script de poblamiento funcione.
-- Se reemplazará 'DNI_CIF' por 'DNI' si es necesario, y se añadirán otros valores si faltan.

DO $$
BEGIN
    -- Verificar si el tipo ENUM 'documento_categoria' existe
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'documento_categoria') THEN
        -- Comprobar si 'DNI_CIF' existe y 'DNI' no existe en el ENUM actual
        IF EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'documento_categoria'::regtype AND enumlabel = 'DNI_CIF') AND
           NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'documento_categoria'::regtype AND enumlabel = 'DNI') THEN
            
            RAISE NOTICE 'Detectado DNI_CIF y falta DNI. Realizando migración de ENUM.';

            -- 1. Renombrar el tipo ENUM antiguo para evitar conflictos
            ALTER TYPE public.documento_categoria RENAME TO documento_categoria_old;

            -- 2. Crear el nuevo tipo ENUM con los valores deseados (incluyendo 'DNI' y excluyendo 'DNI_CIF')
            CREATE TYPE public.documento_categoria AS ENUM (
                'PRL',
                'APTITUD_MEDICA',
                'DNI', -- Nuevo valor según la lista proporcionada
                'ALTA_SS_TC2',
                'CONTRATO LABORAL',
                'SEGURO_RC',
                'REA',
                'CERTIFICACION_FORMACION_PRL',
                'EVAL_RIESGOS',
                'CERT_MAQUINARIA',
                'PLAN_SEGURIDAD',
                'OTROS',
                'CIF'
            );

            -- 3. Actualizar la columna 'categoria' en la tabla 'documentos' para usar el nuevo tipo ENUM.
            -- Se realiza una conversión explícita, manejando la migración de 'DNI_CIF' a 'DNI'.
            ALTER TABLE public.documentos
            ALTER COLUMN categoria TYPE public.documento_categoria USING
                CASE
                    WHEN categoria::text = 'DNI_CIF' THEN 'DNI'::public.documento_categoria
                    ELSE categoria::text::public.documento_categoria
                END;

            -- 4. Eliminar el tipo ENUM antiguo
            DROP TYPE public.documento_categoria_old;
            RAISE NOTICE 'Tipo ENUM documento_categoria actualizado: DNI_CIF reemplazado por DNI.';

        ELSIF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'documento_categoria'::regtype AND enumlabel = 'DNI') THEN
            -- Si 'DNI' falta pero 'DNI_CIF' no está presente (o ya fue migrado), simplemente añadir 'DNI'.
            ALTER TYPE public.documento_categoria ADD VALUE 'DNI' AFTER 'APTITUD_MEDICA';
            RAISE NOTICE 'Valor DNI añadido al tipo ENUM documento_categoria.';
        ELSE
            RAISE NOTICE 'El tipo ENUM documento_categoria ya está en el estado deseado o no requiere migración de DNI_CIF.';
        END IF;
    ELSE
        -- Si el tipo ENUM no existe, crearlo con todos los valores correctos.
        CREATE TYPE public.documento_categoria AS ENUM (
            'PRL',
            'APTITUD_MEDICA',
            'DNI',
            'ALTA_SS_TC2',
            'CONTRATO LABORAL',
            'SEGURO_RC',
            'REA',
            'CERTIFICACION_FORMACION_PRL',
            'EVAL_RIESGOS',
            'CERT_MAQUINARIA',
            'PLAN_SEGURIDAD',
            'OTROS',
            'CIF'
        );
        RAISE NOTICE 'Tipo ENUM documento_categoria creado.';
    END IF;
END
$$;

-- Parte 2: Poblar la tabla "documentos" con 200 registros.

-- Deshabilitar RLS para la ejecución del script si se usa una clave de servicio (service_role key)
-- La clave de servicio de Supabase bypassa RLS automáticamente, por lo que no es necesario un comando SET.

-- Limpiar datos existentes en las tablas para asegurar un inicio limpio
DELETE FROM public.manual_upload_queue;
DELETE FROM public.documentos;
-- Opcional: Si quieres limpiar también empresas, obras, etc., descomenta las siguientes líneas.
-- DELETE FROM public.obras;
-- DELETE FROM public.empresas;
-- DELETE FROM public.users WHERE id != '20000000-0000-0000-0000-000000000001'; -- Mantener el usuario admin de sistema
-- DELETE FROM public.tenants WHERE id != '00000000-0000-0000-0000-000000000001'; -- Mantener el tenant de desarrollo

-- Crear una tabla temporal para almacenar los datos generados antes de la inserción final
CREATE TEMPORARY TABLE temp_documents_data (
    doc_id UUID,
    tenant_id UUID,
    entidad_tipo public.entidad_tipo,
    entidad_id TEXT,
    categoria public.documento_categoria,
    file TEXT,
    mime TEXT,
    size_bytes BIGINT,
    hash_sha256 TEXT,
    version INTEGER,
    estado public.documento_estado,
    caducidad DATE,
    emisor TEXT,
    observaciones TEXT,
    metadatos JSONB,
    origen public.documento_origen,
    sensible BOOLEAN,
    virtual_path TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    -- Campos adicionales para la cola de subida manual
    queue_status public.queue_status,
    priority public.prioridad,
    operator_user UUID,
    queue_nota TEXT,
    empresa_id_for_queue UUID,
    obra_id_for_queue UUID
);

-- Definir categorías de documentos y sus tipos de entidad típicos
-- Esto ayuda a generar datos coherentes.
WITH doc_category_entity_map AS (
    SELECT * FROM (VALUES
        ('PRL'::public.documento_categoria, 'trabajador'::public.entidad_tipo),
        ('APTITUD_MEDICA'::public.documento_categoria, 'trabajador'::public.entidad_tipo),
        ('DNI'::public.documento_categoria, 'trabajador'::public.entidad_tipo), -- Actualizado a 'DNI'
        ('ALTA_SS_TC2'::public.documento_categoria, 'trabajador'::public.entidad_tipo),
        ('CONTRATO LABORAL'::public.documento_categoria, 'trabajador'::public.entidad_tipo),
        ('SEGURO_RC'::public.documento_categoria, 'empresa'::public.entidad_tipo),
        ('REA'::public.documento_categoria, 'empresa'::public.entidad_tipo),
        ('CERTIFICACION_FORMACION_PRL'::public.documento_categoria, 'trabajador'::public.entidad_tipo),
        ('EVAL_RIESGOS'::public.documento_categoria, 'obra'::public.entidad_tipo),
        ('CERT_MAQUINARIA'::public.documento_categoria, 'maquinaria'::public.entidad_tipo),
        ('PLAN_SEGURIDAD'::public.documento_categoria, 'obra'::public.entidad_tipo),
        ('CIF'::public.documento_categoria, 'empresa'::public.entidad_tipo),
        ('OTROS'::public.documento_categoria, 'obra'::public.entidad_tipo) -- 'OTROS' puede ser para obra o empresa
    ) AS t(category, entity_type)
),
-- Seleccionar combinaciones existentes de tenant, empresa, obra, trabajador, maquinaria y usuario
-- Esto asegura que los documentos se asocien a entidades válidas y existentes.
valid_entity_combinations AS (
    SELECT
        t.id AS tenant_id,
        e.id AS empresa_id,
        o.id AS obra_id,
        tr.id AS trabajador_id,
        m.id AS maquinaria_id,
        u.id AS user_id -- Usuario para operator_user en la cola
    FROM
        public.tenants t
    JOIN
        public.users u ON t.id = u.tenant_id
    LEFT JOIN
        public.empresas e ON t.id = e.tenant_id
    LEFT JOIN
        public.obras o ON e.id = o.empresa_id
    LEFT JOIN
        public.proveedores p ON e.id = p.empresa_id
    LEFT JOIN
        public.trabajadores tr ON p.id = tr.proveedor_id
    LEFT JOIN
        public.maquinaria m ON e.id = m.empresa_id
    WHERE
        e.id IS NOT NULL -- Asegurarse de que haya al menos una empresa
    GROUP BY -- Agrupar para obtener combinaciones únicas de IDs
        t.id, e.id, o.id, tr.id, m.id, u.id
),
-- Generar 200 filas de datos base
base_generated_rows AS (
    SELECT
        gen_random_uuid() AS doc_uuid,
        (random() * 60)::integer AS days_ago, -- Para created_at/updated_at (últimos 2 meses)
        (random() * 365)::integer AS days_future, -- Para caducidad (hasta 1 año en el futuro)
        floor(random() * 1000000 + 100000)::bigint AS random_size_bytes,
        md5(random()::text) AS random_hash,
        floor(random() * 3 + 1)::integer AS random_version, -- Versión 1 a 3
        unnest(ARRAY['borrador', 'pendiente', 'aprobado', 'rechazado']::public.documento_estado[]) AS random_estado,
        unnest(ARRAY['usuario', 'ia', 'import']::public.documento_origen[]) AS random_origen,
        random() > 0.8 AS random_sensible, -- 20% de probabilidad de ser sensible
        unnest(ARRAY['queued', 'in_progress', 'uploaded', 'error']::public.queue_status[]) AS random_queue_status,
        unnest(ARRAY['baja', 'normal', 'alta', 'urgencia']::public.prioridad[]) AS random_priority -- Usar el enum de prioridad
    FROM generate_series(1, 200) s -- Generar exactamente 200 filas
)
-- Insertar datos en la tabla temporal
INSERT INTO temp_documents_data (
    doc_id, tenant_id, entidad_tipo, entidad_id, categoria, file, mime, size_bytes, hash_sha256, version,
    estado, caducidad, emisor, observaciones, metadatos, origen, sensible, virtual_path, created_at, updated_at,
    queue_status, priority, operator_user, queue_nota, empresa_id_for_queue, obra_id_for_queue
)
SELECT
    bgr.doc_uuid,
    vec.tenant_id,
    dce.entity_type,
    -- Asignar entidad_id basado en entity_type
    CASE dce.entity_type
        WHEN 'empresa' THEN vec.empresa_id::TEXT
        WHEN 'obra' THEN vec.obra_id::TEXT
        WHEN 'trabajador' THEN vec.trabajador_id::TEXT
        WHEN 'maquinaria' THEN vec.maquinaria_id::TEXT
        ELSE vec.obra_id::TEXT -- Fallback a obra si no hay match o ID es NULL
    END AS entidad_id,
    dce.category,
    'https://constructia.com/files/' || vec.tenant_id || '/' || dce.category || '/' || bgr.doc_uuid || '.pdf' AS file_path,
    'application/pdf' AS mime_type,
    bgr.random_size_bytes,
    bgr.random_hash,
    bgr.random_version,
    bgr.random_estado,
    (NOW() + (bgr.days_future || ' days')::interval)::DATE AS caducidad_date,
    'ConstructIA S.L.' AS emisor,
    'Documento de prueba generado por script para testing de plataforma.' AS observaciones,
    jsonb_build_object(
        'ai_extraction', jsonb_build_object(
            'categoria_probable', dce.category,
            'entidad_tipo_probable', dce.entity_type,
            'campos', jsonb_build_object(
                'dni_nie', CASE WHEN dce.entity_type = 'trabajador' THEN md5(random()::text || 'dni') ELSE NULL END,
                'fecha_caducidad', (NOW() + (bgr.days_future || ' days')::interval)::DATE,
                'empresa', 'Empresa IA Detectada S.A.',
                'poliza_numero', CASE WHEN dce.category = 'SEGURO_RC' THEN md5(random()::text || 'poliza') ELSE NULL END,
                'rea_numero', CASE WHEN dce.category = 'REA' THEN md5(random()::text || 'rea') ELSE NULL END
            ),
            'confianza', jsonb_build_object(
                'categoria_probable', random(),
                'entidad_tipo_probable', random(),
                'campos_extraidos', random()
            )
        ),
        'generated_by_script', TRUE,
        'original_filename', dce.category || '_' || bgr.doc_uuid || '.pdf'
    ) AS metadatos,
    bgr.random_origen,
    bgr.random_sensible,
    '/virtual/path/' || vec.tenant_id || '/' || dce.category || '/' || bgr.doc_uuid AS virtual_path,
    (NOW() - (bgr.days_ago || ' days')::interval)::TIMESTAMPTZ AS created_at_ts,
    (NOW() - (bgr.days_ago || ' days')::interval)::TIMESTAMPTZ AS updated_at_ts,
    bgr.random_queue_status,
    bgr.random_priority,
    vec.user_id,
    'Documento para revisión manual y procesamiento por el administrador.' AS queue_nota,
    vec.empresa_id,
    vec.obra_id
FROM
    base_generated_rows bgr
CROSS JOIN LATERAL (
    -- Seleccionar una combinación aleatoria de entidades válidas para cada documento
    SELECT * FROM valid_entity_combinations ORDER BY random() LIMIT 1
) AS vec
CROSS JOIN LATERAL (
    -- Seleccionar una categoría y tipo de entidad aleatorios
    SELECT * FROM doc_category_entity_map ORDER BY random() LIMIT 1
) AS dce;

-- Insertar los documentos en la tabla 'documentos'
INSERT INTO public.documentos (
    id, tenant_id, entidad_tipo, entidad_id, categoria, file, mime, size_bytes, hash_sha256, version,
    estado, caducidad, emisor, observaciones, metadatos, origen, sensible, virtual_path, created_at, updated_at
)
SELECT
    doc_id, tenant_id, entidad_tipo, entidad_id, categoria, file, mime, size_bytes, hash_sha256, version,
    estado, caducidad, emisor, observaciones, metadatos, origen, sensible, virtual_path, created_at, updated_at
FROM
    temp_documents_data;

-- Insertar una parte de los documentos en la tabla 'manual_upload_queue'
-- Esto simula documentos que requieren procesamiento manual y afectará los KPIs.
INSERT INTO public.manual_upload_queue (
    id, tenant_id, empresa_id, obra_id, documento_id, status, operator_user, nota, created_at, updated_at, priority
)
SELECT
    gen_random_uuid(), -- Nuevo ID para la entrada en la cola
    td.tenant_id,
    td.empresa_id_for_queue,
    td.obra_id_for_queue,
    td.doc_id, -- ID del documento ya insertado
    td.queue_status,
    td.operator_user,
    td.queue_nota,
    td.created_at,
    td.updated_at,
    td.priority
FROM
    temp_documents_data td
WHERE
    random() < 0.7; -- Aproximadamente el 70% de los documentos irán a la cola manual

-- Consultas de verificación (para confirmar la población de datos)
SELECT 'Total documentos insertados:' AS metric, count(*) FROM public.documentos;
SELECT 'Documentos en manual_upload_queue:' AS metric, count(*) FROM public.manual_upload_queue;

SELECT
    t.name AS tenant_name,
    COUNT(d.id) AS total_documents,
    COUNT(CASE WHEN d.estado = 'aprobado' THEN 1 END) AS approved_documents,
    COUNT(CASE WHEN d.estado = 'pendiente' THEN 1 END) AS pending_documents,
    COUNT(CASE WHEN d.estado = 'rechazado' THEN 1 END) AS rejected_documents,
    COUNT(CASE WHEN d.estado = 'borrador' THEN 1 END) AS draft_documents
FROM
    public.documentos d
JOIN
    public.tenants t ON d.tenant_id = t.id
GROUP BY
    t.name
ORDER BY
    t.name;

SELECT
    d.categoria,
    COUNT(d.id) AS total_documents
FROM
    public.documentos d
GROUP BY
    d.categoria
ORDER BY
    total_documents DESC;

SELECT
    d.estado,
    COUNT(d.id) AS total_documents
FROM
    public.documentos d
GROUP BY
    d.estado
ORDER BY
    total_documents DESC;

-- Eliminar la tabla temporal
DROP TABLE temp_documents_data;
```