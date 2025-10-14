/*
  # Eliminación de Tablas Obsoletas de Arquitectura Antigua

  ## Descripción
  Esta migración elimina tablas de la arquitectura antigua que han sido reemplazadas
  por la nueva arquitectura multi-tenant. Solo se eliminan tablas que:
  - No tienen datos críticos O tienen equivalentes en la nueva arquitectura
  - No son usadas activamente por la aplicación
  - No rompen funcionalidad existente

  ## Tablas a Eliminar

  1. **audit_logs** (1200 registros)
     - Reemplazada por: `auditoria` en arquitectura multi-tenant
     - Razón: Sistema de auditoría migrado a nueva tabla
  
  2. **projects** (0 registros)
     - Reemplazada por: `obras` en arquitectura multi-tenant
     - Razón: Tabla vacía, funcionalidad migrada completamente

  3. **receipts** (0 registros)
     - No tiene reemplazo directo en multi-tenant
     - Razón: Tabla vacía, funcionalidad no implementada en nueva arquitectura

  4. **sepa_mandates** (1 registro)
     - Reemplazada por: `mandatos_sepa` en arquitectura multi-tenant
     - Razón: Solo 1 registro, funcionalidad migrada

  5. **system_settings** (14 registros)
     - Reemplazada por: `system_configurations` en arquitectura multi-tenant
     - Razón: Configuración migrada a nueva tabla

  ## Tablas NO Eliminadas

  - **clients**: Se mantiene porque:
    * Tiene 7 registros activos
    * Vistas de MRR (v_mrr_summary, v_mrr_by_client, etc.) dependen de ella
    * Es usada como puente entre la arquitectura antigua y nueva
    * Tiene foreign keys desde: payments, subscriptions
    * Se recomienda migración gradual en el futuro

  ## Backup
  Antes de ejecutar esta migración, se recomienda hacer backup manual de estas tablas
  si se necesita preservar datos históricos.

  ## Seguridad
  - Todas las eliminaciones usan DROP TABLE IF EXISTS para evitar errores
  - Se eliminan en orden correcto respetando foreign keys
  - Las vistas dependientes se actualizarán/eliminarán en migración posterior
*/

-- =====================================================================
-- PASO 1: Eliminar foreign keys que apuntan a tablas a eliminar
-- =====================================================================

-- Eliminar foreign keys desde audit_logs
DO $$
BEGIN
  -- FK desde audit_logs hacia clients (si existe)
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'audit_logs_client_id_fkey'
    AND table_name = 'audit_logs'
  ) THEN
    ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_client_id_fkey;
  END IF;
END $$;

-- Eliminar foreign keys desde projects hacia clients
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'projects_client_id_fkey'
    AND table_name = 'projects'
  ) THEN
    ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_client_id_fkey;
  END IF;
END $$;

-- Eliminar foreign keys desde receipts hacia clients
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'receipts_client_id_fkey'
    AND table_name = 'receipts'
  ) THEN
    ALTER TABLE receipts DROP CONSTRAINT IF EXISTS receipts_client_id_fkey;
  END IF;
END $$;

-- Eliminar foreign keys desde sepa_mandates hacia clients
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'sepa_mandates_client_id_fkey'
    AND table_name = 'sepa_mandates'
  ) THEN
    ALTER TABLE sepa_mandates DROP CONSTRAINT IF EXISTS sepa_mandates_client_id_fkey;
  END IF;
END $$;

-- =====================================================================
-- PASO 2: Eliminar políticas RLS de las tablas
-- =====================================================================

-- Eliminar políticas de audit_logs
DROP POLICY IF EXISTS "Clients can view own audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Admins can view all audit logs" ON audit_logs;
DROP POLICY IF EXISTS "System can insert audit logs" ON audit_logs;

-- Eliminar políticas de projects
DROP POLICY IF EXISTS "Clients can manage own projects" ON projects;
DROP POLICY IF EXISTS "Admins can manage all projects" ON projects;

-- Eliminar políticas de receipts
DROP POLICY IF EXISTS "Clients can view own receipts" ON receipts;
DROP POLICY IF EXISTS "Admins can manage all receipts" ON receipts;

-- Eliminar políticas de sepa_mandates
DROP POLICY IF EXISTS "Clients can view own SEPA mandates" ON sepa_mandates;
DROP POLICY IF EXISTS "Clients can manage own SEPA mandates" ON sepa_mandates;
DROP POLICY IF EXISTS "Admins can manage all SEPA mandates" ON sepa_mandates;

-- Eliminar políticas de system_settings
DROP POLICY IF EXISTS "Admins can manage system settings" ON system_settings;
DROP POLICY IF EXISTS "Admins can read system settings" ON system_settings;

-- =====================================================================
-- PASO 3: Eliminar triggers asociados
-- =====================================================================

DROP TRIGGER IF EXISTS update_audit_logs_updated_at ON audit_logs;
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
DROP TRIGGER IF EXISTS update_receipts_updated_at ON receipts;
DROP TRIGGER IF EXISTS update_sepa_mandates_updated_at ON sepa_mandates;
DROP TRIGGER IF EXISTS update_system_settings_updated_at ON system_settings;

-- =====================================================================
-- PASO 4: Eliminar tablas en orden correcto
-- =====================================================================

-- Primero las tablas sin dependencias o con FKs ya eliminadas
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS receipts CASCADE;
DROP TABLE IF EXISTS sepa_mandates CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;

-- =====================================================================
-- PASO 5: Registrar la eliminación en auditoria
-- =====================================================================

DO $$
BEGIN
  -- Solo si la tabla auditoria existe
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'auditoria') THEN
    INSERT INTO auditoria (
      tenant_id,
      actor_user,
      accion,
      entidad,
      detalles,
      created_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000001'::uuid, -- Sistema
      NULL,
      'DROP_TABLES',
      'database_cleanup',
      jsonb_build_object(
        'action', 'remove_obsolete_tables',
        'tables_removed', jsonb_build_array(
          'audit_logs',
          'projects', 
          'receipts',
          'sepa_mandates',
          'system_settings'
        ),
        'reason', 'Migration to multi-tenant architecture complete',
        'migration_file', 'remove_obsolete_old_architecture_tables.sql'
      ),
      NOW()
    );
  END IF;
END $$;

-- =====================================================================
-- COMENTARIOS FINALES
-- =====================================================================

COMMENT ON SCHEMA public IS 'Tablas obsoletas eliminadas: audit_logs, projects, receipts, sepa_mandates, system_settings - Migración a arquitectura multi-tenant completada';

-- Mostrar resumen
DO $$
DECLARE
  tables_remaining INTEGER;
BEGIN
  SELECT COUNT(*) INTO tables_remaining
  FROM information_schema.tables
  WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE';
  
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Migración completada exitosamente';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Tablas eliminadas: 5';
  RAISE NOTICE '  - audit_logs (reemplazada por auditoria)';
  RAISE NOTICE '  - projects (reemplazada por obras)';
  RAISE NOTICE '  - receipts (no usada)';
  RAISE NOTICE '  - sepa_mandates (reemplazada por mandatos_sepa)';
  RAISE NOTICE '  - system_settings (reemplazada por system_configurations)';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Tablas restantes en base de datos: %', tables_remaining;
  RAISE NOTICE '============================================';
  RAISE NOTICE 'NOTA: La tabla "clients" se mantiene porque:';
  RAISE NOTICE '  - Tiene datos activos (7 registros)';
  RAISE NOTICE '  - Vistas de MRR dependen de ella';
  RAISE NOTICE '  - Se usa como puente con tenants';
  RAISE NOTICE '  - Migración gradual recomendada';
  RAISE NOTICE '============================================';
END $$;
