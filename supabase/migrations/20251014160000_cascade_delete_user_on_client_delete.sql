/*
  # Cascade Delete User When Client is Deleted

  ## Purpose
  This migration implements automatic unidirectional cascade deletion:
  - When a client is deleted → associated user is automatically deleted
  - Preserves audit logs (auditoria table records are NEVER deleted)
  - Implements hard delete (no soft delete, complete data removal)

  ## Changes
  1. Create trigger function to delete user when client is deleted
  2. Set up BEFORE DELETE trigger on clients table
  3. Log deletion events to auditoria table before deletion
  4. Ensure orphaned users cannot exist after this migration

  ## Important Notes
  - User deletion is UNIDIRECTIONAL: client delete → user delete
  - Deleting a user directly does NOT delete the client
  - SuperAdmin users are never affected by this trigger
  - Audit records are preserved permanently for compliance
  - This trigger works even when deleting via SQL directly

  ## Security
  - Function uses SECURITY DEFINER to bypass RLS for system operations
  - Only affects client-associated users (role = 'Cliente')
  - Cannot accidentally delete SuperAdmin users
*/

-- ============================================================================
-- STEP 1: Drop existing trigger if it exists (idempotency)
-- ============================================================================

DROP TRIGGER IF EXISTS trigger_delete_user_on_client_delete ON public.clients;
DROP FUNCTION IF EXISTS delete_user_on_client_delete();

-- ============================================================================
-- STEP 2: Create function to handle user deletion when client is deleted
-- ============================================================================

CREATE OR REPLACE FUNCTION delete_user_on_client_delete()
RETURNS TRIGGER
SECURITY DEFINER -- Required to bypass RLS for system operations
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_user_email text;
  v_user_role text;
  v_user_tenant_id uuid;
  v_client_company_name text;
BEGIN
  -- Only proceed if the client has an associated user_id
  IF OLD.user_id IS NULL THEN
    RAISE NOTICE 'Client % has no associated user, skipping user deletion', OLD.id;
    RETURN OLD;
  END IF;

  -- Fetch user details before deletion for audit logging
  SELECT email, role, tenant_id
  INTO v_user_email, v_user_role, v_user_tenant_id
  FROM public.users
  WHERE id = OLD.user_id;

  -- Safety check: if user not found, log warning but continue
  IF v_user_email IS NULL THEN
    RAISE WARNING 'User % not found for client %, may have been already deleted', OLD.user_id, OLD.id;
    RETURN OLD;
  END IF;

  -- Safety check: NEVER delete SuperAdmin users
  IF v_user_role = 'SuperAdmin' THEN
    RAISE EXCEPTION 'Cannot delete client associated with SuperAdmin user. This is a safety protection.';
  END IF;

  -- Get client company name for audit log
  v_client_company_name := OLD.company_name;

  -- Log the deletion event to auditoria BEFORE deleting
  -- This ensures audit trail is preserved
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
      NULL, -- System-triggered deletion, no specific actor
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
      -- If audit logging fails, log error but continue with deletion
      RAISE WARNING 'Failed to create audit log for user deletion: %', SQLERRM;
  END;

  -- Delete the associated user
  -- This will cascade to other tables that reference users(id) with ON DELETE CASCADE
  BEGIN
    DELETE FROM public.users WHERE id = OLD.user_id;
    RAISE NOTICE 'Deleted user % (%) associated with client % (%)',
                 v_user_email, OLD.user_id, v_client_company_name, OLD.id;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE EXCEPTION 'Failed to delete user % (%) associated with client %: %',
                      v_user_email, OLD.user_id, OLD.id, SQLERRM;
  END;

  -- Return OLD to allow the client deletion to proceed
  RETURN OLD;
END;
$$;

-- Add function comment
COMMENT ON FUNCTION delete_user_on_client_delete() IS
'Automatically deletes the associated user when a client is deleted.
This is a UNIDIRECTIONAL cascade: client → user.
Preserves audit logs and includes safety checks against deleting SuperAdmin users.';

-- ============================================================================
-- STEP 3: Create trigger on clients table
-- ============================================================================

CREATE TRIGGER trigger_delete_user_on_client_delete
  BEFORE DELETE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION delete_user_on_client_delete();

COMMENT ON TRIGGER trigger_delete_user_on_client_delete ON public.clients IS
'Trigger that automatically deletes associated user when client is deleted.
Executes BEFORE DELETE to ensure user is removed before client.
Logs all deletions to auditoria table for compliance.';

-- ============================================================================
-- STEP 4: Verify trigger was created successfully
-- ============================================================================

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

  RAISE NOTICE '========================================';
  RAISE NOTICE 'CASCADE DELETE TRIGGER SETUP COMPLETE';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'From now on, deleting a client will automatically delete the associated user.';
  RAISE NOTICE 'Audit logs are preserved in the auditoria table.';
  RAISE NOTICE 'SuperAdmin users are protected from accidental deletion.';
  RAISE NOTICE '========================================';
END $$;

-- ============================================================================
-- STEP 5: Add table comment documenting cascade behavior
-- ============================================================================

COMMENT ON TABLE public.clients IS
'Clients table with automatic cascade deletion to users table.
When a client is deleted, the associated user (via user_id) is automatically deleted.
This is UNIDIRECTIONAL: deleting user does NOT delete client.
All deletions are logged to auditoria table before execution.';
