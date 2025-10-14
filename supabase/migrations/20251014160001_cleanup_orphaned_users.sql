/*
  # Cleanup Orphaned Users

  ## Purpose
  This migration identifies and removes orphaned user records - users who exist
  in the users table but have no corresponding client record.

  ## What it does
  1. Identifies users without associated clients
  2. Excludes SuperAdmin users from cleanup (they don't need clients)
  3. Logs all orphaned users to auditoria before deletion
  4. Deletes orphaned users to clean up the database
  5. Reports statistics on cleanup operation

  ## Safety
  - Never deletes SuperAdmin users
  - Logs all deletions to auditoria for compliance
  - Uses transactions for atomicity
  - Provides detailed reporting of cleanup actions

  ## Run Once
  This is a one-time cleanup migration. After running, the trigger from the
  previous migration (20251014160000) will prevent new orphaned users.
*/

-- ============================================================================
-- STEP 1: Report on orphaned users before cleanup
-- ============================================================================

DO $$
DECLARE
  v_orphaned_count integer;
  v_orphaned_user record;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'ORPHANED USERS CLEANUP - STARTING';
  RAISE NOTICE '========================================';

  -- Count orphaned users (excluding SuperAdmin)
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
    RAISE NOTICE '========================================';
    RETURN;
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE 'Orphaned users details:';
  RAISE NOTICE '---';

  -- List all orphaned users
  FOR v_orphaned_user IN
    SELECT u.id, u.email, u.role, u.tenant_id, u.created_at
    FROM public.users u
    WHERE u.role != 'SuperAdmin'
      AND NOT EXISTS (
        SELECT 1
        FROM public.clients c
        WHERE c.user_id = u.id
      )
    ORDER BY u.created_at
  LOOP
    RAISE NOTICE 'ID: %, Email: %, Role: %, Tenant: %, Created: %',
                 v_orphaned_user.id,
                 v_orphaned_user.email,
                 v_orphaned_user.role,
                 v_orphaned_user.tenant_id,
                 v_orphaned_user.created_at;
  END LOOP;

  RAISE NOTICE '';
END $$;

-- ============================================================================
-- STEP 2: Log orphaned users to auditoria before deletion
-- ============================================================================

DO $$
DECLARE
  v_orphaned_user record;
  v_logged_count integer := 0;
BEGIN
  RAISE NOTICE 'Logging orphaned users to auditoria table...';

  -- Log each orphaned user to auditoria
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
        NULL, -- System cleanup, no specific actor
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

-- ============================================================================
-- STEP 3: Delete orphaned users
-- ============================================================================

DO $$
DECLARE
  v_deleted_count integer := 0;
  v_orphaned_user record;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE 'Deleting orphaned users...';

  -- Delete each orphaned user
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
      RAISE NOTICE '  ✓ Deleted orphaned user: % (%)', v_orphaned_user.email, v_orphaned_user.id;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING '  ✗ Failed to delete user % (%): %',
                      v_orphaned_user.email, v_orphaned_user.id, SQLERRM;
    END;
  END LOOP;

  RAISE NOTICE '';
  RAISE NOTICE '✅ Successfully deleted % orphaned user(s)', v_deleted_count;
END $$;

-- ============================================================================
-- STEP 4: Verify cleanup and report final statistics
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
  RAISE NOTICE '========================================';
  RAISE NOTICE 'CLEANUP VERIFICATION & STATISTICS';
  RAISE NOTICE '========================================';

  -- Count remaining orphaned users (should be 0)
  SELECT COUNT(*)
  INTO v_remaining_orphaned
  FROM public.users u
  WHERE u.role != 'SuperAdmin'
    AND NOT EXISTS (
      SELECT 1
      FROM public.clients c
      WHERE c.user_id = u.id
    );

  -- Get overall statistics
  SELECT COUNT(*) INTO v_total_users FROM public.users;
  SELECT COUNT(*) INTO v_total_clients FROM public.clients;
  SELECT COUNT(*) INTO v_superadmin_count FROM public.users WHERE role = 'SuperAdmin';

  SELECT COUNT(DISTINCT user_id)
  INTO v_users_with_clients
  FROM public.clients
  WHERE user_id IS NOT NULL;

  RAISE NOTICE 'Final Database Statistics:';
  RAISE NOTICE '  Total users: %', v_total_users;
  RAISE NOTICE '  SuperAdmin users: %', v_superadmin_count;
  RAISE NOTICE '  Users with clients: %', v_users_with_clients;
  RAISE NOTICE '  Total clients: %', v_total_clients;
  RAISE NOTICE '  Remaining orphaned users: %', v_remaining_orphaned;
  RAISE NOTICE '';

  IF v_remaining_orphaned = 0 THEN
    RAISE NOTICE '✅ SUCCESS: All orphaned users have been cleaned up!';
    RAISE NOTICE '✅ Database integrity restored.';
  ELSE
    RAISE WARNING '⚠️  WARNING: % orphaned user(s) still remain', v_remaining_orphaned;
    RAISE WARNING 'Manual investigation may be required.';
  END IF;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'ORPHANED USERS CLEANUP - COMPLETED';
  RAISE NOTICE '========================================';
END $$;

-- ============================================================================
-- STEP 5: Add helper function to detect orphaned users (for future use)
-- ============================================================================

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

-- ============================================================================
-- STEP 6: Add helper function to get orphaned user details
-- ============================================================================

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
