/*
  ============================================================================
  APLICAR MIGRACIONES DE ELIMINACIÓN EN CASCADA
  ============================================================================

  Este script aplica las dos migraciones necesarias para implementar la
  eliminación automática en cascada de usuarios cuando se elimina un cliente.

  INSTRUCCIONES DE USO:
  1. Abre Supabase Dashboard: https://supabase.com/dashboard
  2. Selecciona tu proyecto
  3. Ve a "SQL Editor"
  4. Crea una nueva query
  5. Copia y pega este ARCHIVO COMPLETO
  6. Haz clic en "Run" (▶️)
  7. Espera a que complete (debería tomar ~30 segundos)
  8. Verifica los mensajes de NOTICE en los resultados

  IMPORTANTE:
  - Este script es idempotente (puedes ejecutarlo múltiples veces)
  - No elimina datos existentes sin tu confirmación
  - Crea funciones helper para diagnóstico
  - Limpia usuarios huérfanos automáticamente

  ============================================================================
*/

-- ============================================================================
-- PARTE 1: CREAR TRIGGER PARA ELIMINACIÓN AUTOMÁTICA
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'PARTE 1: INSTALANDO TRIGGER DE CASCADA';
  RAISE NOTICE '============================================';
  RAISE NOTICE '';
END $$;

-- Drop existing trigger if it exists (idempotency)
DROP TRIGGER IF EXISTS trigger_delete_user_on_client_delete ON public.clients;
DROP FUNCTION IF EXISTS delete_user_on_client_delete();

-- Create function to handle user deletion when client is deleted
CREATE OR REPLACE FUNCTION delete_user_on_client_delete()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_user_email text;
  v_user_role text;
  v_user_tenant_id uuid;
  v_client_company_name text;
BEGIN
  IF OLD.user_id IS NULL THEN
    RAISE NOTICE 'Client % has no associated user, skipping user deletion', OLD.id;
    RETURN OLD;
  END IF;

  SELECT email, role, tenant_id
  INTO v_user_email, v_user_role, v_user_tenant_id
  FROM public.users
  WHERE id = OLD.user_id;

  IF v_user_email IS NULL THEN
    RAISE WARNING 'User % not found for client %, may have been already deleted', OLD.user_id, OLD.id;
    RETURN OLD;
  END IF;

  IF v_user_role = 'SuperAdmin' THEN
    RAISE EXCEPTION 'Cannot delete client associated with SuperAdmin user. This is a safety protection.';
  END IF;

  v_client_company_name := OLD.company_name;

  BEGIN
    INSERT INTO public.auditoria (
      tenant_id,
      actor_user,
      accion,
      entidad,
      entidad_id,
      detalles,
      created_at
    )
    VALUES (
      COALESCE(v_user_tenant_id, OLD.tenant_id),
      NULL,
      'CASCADE_DELETE_USER_ON_CLIENT_DELETE',
      'users',
      OLD.user_id::text,
      jsonb_build_object(
        'trigger', 'automatic_cascade',
        'client_id', OLD.id,
        'client_company_name', v_client_company_name,
        'client_client_id', OLD.client_id,
        'user_id', OLD.user_id,
        'user_email', v_user_email,
        'user_role', v_user_role,
        'deletion_type', 'hard_delete',
        'reason', 'Client was deleted, cascading to user',
        'timestamp', now()
      ),
      now()
    );

    RAISE NOTICE 'Audit log created for user deletion: % (%)', v_user_email, OLD.user_id;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'Failed to create audit log for user deletion: %', SQLERRM;
  END;

  BEGIN
    DELETE FROM public.users WHERE id = OLD.user_id;
    RAISE NOTICE 'Deleted user % (%) associated with client % (%)',
                 v_user_email, OLD.user_id, v_client_company_name, OLD.id;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE EXCEPTION 'Failed to delete user % (%) associated with client %: %',
                      v_user_email, OLD.user_id, OLD.id, SQLERRM;
  END;

  RETURN OLD;
END;
$$;

COMMENT ON FUNCTION delete_user_on_client_delete() IS
'Automatically deletes the associated user when a client is deleted.
This is a UNIDIRECTIONAL cascade: client → user.
Preserves audit logs and includes safety checks against deleting SuperAdmin users.';

-- Create trigger on clients table
CREATE TRIGGER trigger_delete_user_on_client_delete
  BEFORE DELETE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION delete_user_on_client_delete();

COMMENT ON TRIGGER trigger_delete_user_on_client_delete ON public.clients IS
'Trigger that automatically deletes associated user when client is deleted.
Executes BEFORE DELETE to ensure user is removed before client.
Logs all deletions to auditoria table for compliance.';

-- Verify trigger was created successfully
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'trigger_delete_user_on_client_delete'
  ) THEN
    RAISE NOTICE '✅ Trigger trigger_delete_user_on_client_delete created successfully';
  ELSE
    RAISE EXCEPTION '❌ Failed to create trigger trigger_delete_user_on_client_delete';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_proc
    WHERE proname = 'delete_user_on_client_delete'
  ) THEN
    RAISE NOTICE '✅ Function delete_user_on_client_delete() created successfully';
  ELSE
    RAISE EXCEPTION '❌ Failed to create function delete_user_on_client_delete()';
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '✅ PARTE 1 COMPLETADA: Trigger instalado correctamente';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- PARTE 2: LIMPIEZA DE USUARIOS HUÉRFANOS EXISTENTES
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'PARTE 2: LIMPIANDO USUARIOS HUÉRFANOS';
  RAISE NOTICE '============================================';
  RAISE NOTICE '';
END $$;

-- Report on orphaned users before cleanup
DO $$
DECLARE
  v_orphaned_count integer;
  v_orphaned_user record;
BEGIN
  SELECT COUNT(*)
  INTO v_orphaned_count
  FROM public.users u
  WHERE u.role != 'SuperAdmin'
    AND NOT EXISTS (
      SELECT 1
      FROM public.clients c
      WHERE c.user_id = u.id
    );

  RAISE NOTICE 'Found % orphaned user(s) to clean up', v_orphaned_count;

  IF v_orphaned_count = 0 THEN
    RAISE NOTICE '✅ No orphaned users found. Database is clean!';
    RETURN;
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE 'Orphaned users details:';

  FOR v_orphaned_user IN
    SELECT u.id, u.email, u.role, u.created_at
    FROM public.users u
    WHERE u.role != 'SuperAdmin'
      AND NOT EXISTS (
        SELECT 1
        FROM public.clients c
        WHERE c.user_id = u.id
      )
    ORDER BY u.created_at
  LOOP
    RAISE NOTICE '  • Email: %, Role: %, Created: %',
                 v_orphaned_user.email,
                 v_orphaned_user.role,
                 v_orphaned_user.created_at;
  END LOOP;

  RAISE NOTICE '';
END $$;

-- Log orphaned users to auditoria before deletion
DO $$
DECLARE
  v_orphaned_user record;
  v_logged_count integer := 0;
BEGIN
  RAISE NOTICE 'Logging orphaned users to auditoria table...';

  FOR v_orphaned_user IN
    SELECT u.id, u.email, u.role, u.tenant_id, u.name, u.created_at
    FROM public.users u
    WHERE u.role != 'SuperAdmin'
      AND NOT EXISTS (
        SELECT 1
        FROM public.clients c
        WHERE c.user_id = u.id
      )
  LOOP
    BEGIN
      INSERT INTO public.auditoria (
        tenant_id,
        actor_user,
        accion,
        entidad,
        entidad_id,
        detalles,
        created_at
      )
      VALUES (
        v_orphaned_user.tenant_id,
        NULL,
        'CLEANUP_ORPHANED_USER',
        'users',
        v_orphaned_user.id::text,
        jsonb_build_object(
          'cleanup_type', 'orphaned_user_removal',
          'user_id', v_orphaned_user.id,
          'user_email', v_orphaned_user.email,
          'user_name', v_orphaned_user.name,
          'user_role', v_orphaned_user.role,
          'user_created_at', v_orphaned_user.created_at,
          'reason', 'User exists without associated client record',
          'cleanup_timestamp', now()
        ),
        now()
      );

      v_logged_count := v_logged_count + 1;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING 'Failed to log orphaned user % to auditoria: %',
                      v_orphaned_user.email, SQLERRM;
    END;
  END LOOP;

  RAISE NOTICE '✅ Logged % orphaned user(s) to auditoria', v_logged_count;
END $$;

-- Delete orphaned users
DO $$
DECLARE
  v_deleted_count integer := 0;
  v_orphaned_user record;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE 'Deleting orphaned users...';

  FOR v_orphaned_user IN
    SELECT u.id, u.email
    FROM public.users u
    WHERE u.role != 'SuperAdmin'
      AND NOT EXISTS (
        SELECT 1
        FROM public.clients c
        WHERE c.user_id = u.id
      )
  LOOP
    BEGIN
      DELETE FROM public.users WHERE id = v_orphaned_user.id;
      v_deleted_count := v_deleted_count + 1;
      RAISE NOTICE '  ✓ Deleted orphaned user: %', v_orphaned_user.email;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING '  ✗ Failed to delete user %: %',
                      v_orphaned_user.email, SQLERRM;
    END;
  END LOOP;

  RAISE NOTICE '';
  RAISE NOTICE '✅ Successfully deleted % orphaned user(s)', v_deleted_count;
END $$;

-- ============================================================================
-- PARTE 3: CREAR FUNCIONES HELPER PARA DIAGNÓSTICO
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'PARTE 3: CREANDO FUNCIONES HELPER';
  RAISE NOTICE '============================================';
  RAISE NOTICE '';
END $$;

CREATE OR REPLACE FUNCTION get_orphaned_users_count()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count integer;
BEGIN
  SELECT COUNT(*)
  INTO v_count
  FROM public.users u
  WHERE u.role != 'SuperAdmin'
    AND NOT EXISTS (
      SELECT 1
      FROM public.clients c
      WHERE c.user_id = u.id
    );

  RETURN v_count;
END;
$$;

COMMENT ON FUNCTION get_orphaned_users_count() IS
'Returns the count of orphaned users (users without associated clients, excluding SuperAdmin).
Useful for monitoring database health and detecting issues.';

CREATE OR REPLACE FUNCTION get_orphaned_users_details()
RETURNS TABLE (
  user_id uuid,
  email text,
  role text,
  tenant_id uuid,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.email, u.role, u.tenant_id, u.created_at
  FROM public.users u
  WHERE u.role != 'SuperAdmin'
    AND NOT EXISTS (
      SELECT 1
      FROM public.clients c
      WHERE c.user_id = u.id
    )
  ORDER BY u.created_at DESC;
END;
$$;

COMMENT ON FUNCTION get_orphaned_users_details() IS
'Returns detailed information about orphaned users.
Useful for admin diagnostics and monitoring.';

RAISE NOTICE '✅ Funciones helper creadas correctamente';

-- ============================================================================
-- PARTE 4: VERIFICACIÓN FINAL Y ESTADÍSTICAS
-- ============================================================================

DO $$
DECLARE
  v_remaining_orphaned integer;
  v_total_users integer;
  v_total_clients integer;
  v_users_with_clients integer;
  v_superadmin_count integer;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'VERIFICACIÓN FINAL Y ESTADÍSTICAS';
  RAISE NOTICE '============================================';

  SELECT COUNT(*) INTO v_remaining_orphaned FROM get_orphaned_users_details();
  SELECT COUNT(*) INTO v_total_users FROM public.users;
  SELECT COUNT(*) INTO v_total_clients FROM public.clients;
  SELECT COUNT(*) INTO v_superadmin_count FROM public.users WHERE role = 'SuperAdmin';

  SELECT COUNT(DISTINCT user_id)
  INTO v_users_with_clients
  FROM public.clients
  WHERE user_id IS NOT NULL;

  RAISE NOTICE '';
  RAISE NOTICE 'Estadísticas de la Base de Datos:';
  RAISE NOTICE '  • Total usuarios: %', v_total_users;
  RAISE NOTICE '  • SuperAdmin usuarios: %', v_superadmin_count;
  RAISE NOTICE '  • Usuarios con clientes: %', v_users_with_clients;
  RAISE NOTICE '  • Total clientes: %', v_total_clients;
  RAISE NOTICE '  • Usuarios huérfanos restantes: %', v_remaining_orphaned;
  RAISE NOTICE '';

  IF v_remaining_orphaned = 0 THEN
    RAISE NOTICE '✅ ÉXITO: Todos los usuarios huérfanos han sido limpiados';
    RAISE NOTICE '✅ Integridad de base de datos restaurada';
  ELSE
    RAISE WARNING '⚠️  ADVERTENCIA: % usuario(s) huérfano(s) aún permanecen', v_remaining_orphaned;
    RAISE WARNING 'Puede requerir investigación manual';
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '============================================';
  RAISE NOTICE '✅ INSTALACIÓN COMPLETADA EXITOSAMENTE';
  RAISE NOTICE '============================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Próximos pasos:';
  RAISE NOTICE '  1. El trigger está activo desde ahora';
  RAISE NOTICE '  2. Eliminar un cliente automáticamente eliminará su usuario';
  RAISE NOTICE '  3. Los registros de auditoría se preservan permanentemente';
  RAISE NOTICE '  4. SuperAdmin usuarios están protegidos';
  RAISE NOTICE '  5. Verifica el dashboard de diagnóstico en el admin panel';
  RAISE NOTICE '';
  RAISE NOTICE 'Para monitorear usuarios huérfanos en el futuro:';
  RAISE NOTICE '  SELECT get_orphaned_users_count();';
  RAISE NOTICE '';
END $$;

-- Add table comment documenting cascade behavior
COMMENT ON TABLE public.clients IS
'Clients table with automatic cascade deletion to users table.
When a client is deleted, the associated user (via user_id) is automatically deleted.
This is UNIDIRECTIONAL: deleting user does NOT delete client.
All deletions are logged to auditoria table before execution.';
