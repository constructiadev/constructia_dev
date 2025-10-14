/*
  # Fix Role Escalation Trigger - Correct Auditoria Column Names

  ## Problem
  The prevent_superadmin_role_escalation trigger function uses incorrect column names
  for the auditoria table, causing migration failures.

  ## Changes
  - Update prevent_superadmin_role_escalation() function to use correct column names:
    - user_id -> actor_user
    - entidad_afectada -> entidad  
    - resultado -> (removed, not in table)
    - ip_origen -> ip

  - Update create_authorized_superadmin() function with same corrections

  ## Security
  - Maintains all security checks and protections
  - Preserves audit logging functionality
  - No changes to security policy
*/

-- ============================================
-- Fix prevent_superadmin_role_escalation function
-- ============================================

CREATE OR REPLACE FUNCTION prevent_superadmin_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
  -- If attempting to set role to SuperAdmin
  IF NEW.role = 'SuperAdmin' AND (OLD.role IS NULL OR OLD.role != 'SuperAdmin') THEN
    
    -- Check if this is being called from an authorized context
    -- We allow SuperAdmin creation only if current_setting is set (by authorized scripts)
    BEGIN
      -- Try to get authorization flag
      IF current_setting('app.allow_superadmin_creation', true) = 'true' THEN
        -- Authorized operation - allow it
        RAISE NOTICE 'Authorized SuperAdmin role assignment for user: %', NEW.email;
        RETURN NEW;
      END IF;
    EXCEPTION
      WHEN OTHERS THEN
        -- Setting doesn't exist, continue to denial
        NULL;
    END;
    
    -- Log the unauthorized attempt
    RAISE WARNING 'SECURITY: Unauthorized attempt to assign SuperAdmin role to user: % (ID: %)', NEW.email, NEW.id;
    
    -- Insert audit log (using correct column names)
    INSERT INTO auditoria (
      tenant_id,
      actor_user,
      accion,
      entidad,
      entidad_id,
      detalles,
      ip,
      created_at
    ) VALUES (
      COALESCE(NEW.tenant_id, '00000000-0000-0000-0000-000000000001'),
      NEW.id,
      'SECURITY_VIOLATION',
      'users',
      NEW.id::text,
      jsonb_build_object(
        'attempted_role', 'SuperAdmin',
        'previous_role', OLD.role,
        'email', NEW.email,
        'reason', 'Unauthorized role escalation attempt blocked',
        'resultado', 'BLOCKED'
      ),
      COALESCE(inet_client_addr()::text, '127.0.0.1'),
      now()
    );
    
    -- Prevent the role change
    RAISE EXCEPTION 'SECURITY: Unauthorized attempt to assign SuperAdmin role. SuperAdmin users can only be created via authorized SQL scripts.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Fix create_authorized_superadmin function
-- ============================================

CREATE OR REPLACE FUNCTION create_authorized_superadmin(
  p_email text,
  p_name text,
  p_tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'
)
RETURNS uuid AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Set authorization flag
  PERFORM set_config('app.allow_superadmin_creation', 'true', true);
  
  -- Check if user already exists in auth.users
  SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % does not exist in auth.users. Create the auth user first.', p_email;
  END IF;
  
  -- Insert or update user profile with SuperAdmin role
  INSERT INTO users (
    id,
    tenant_id,
    email,
    name,
    role,
    active
  ) VALUES (
    v_user_id,
    p_tenant_id,
    p_email,
    p_name,
    'SuperAdmin',
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    role = 'SuperAdmin',
    name = EXCLUDED.name,
    active = true,
    updated_at = now();
  
  -- Log the authorized creation (using correct column names)
  INSERT INTO auditoria (
    tenant_id,
    actor_user,
    accion,
    entidad,
    entidad_id,
    detalles,
    ip,
    created_at
  ) VALUES (
    p_tenant_id,
    v_user_id,
    'SUPERADMIN_CREATED',
    'users',
    v_user_id::text,
    jsonb_build_object(
      'email', p_email,
      'name', p_name,
      'created_via', 'authorized_function',
      'resultado', 'SUCCESS'
    ),
    COALESCE(inet_client_addr()::text, '127.0.0.1'),
    now()
  );
  
  -- Reset authorization flag
  PERFORM set_config('app.allow_superadmin_creation', 'false', true);
  
  RAISE NOTICE 'Successfully created SuperAdmin user: %', p_email;
  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Verification
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Role escalation trigger functions updated with correct auditoria column names';
  RAISE NOTICE '   • actor_user (was: user_id)';
  RAISE NOTICE '   • entidad (was: entidad_afectada)';
  RAISE NOTICE '   • ip (was: ip_origen)';
  RAISE NOTICE '   • resultado moved to detalles jsonb field';
END $$;
