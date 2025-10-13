/*
  # Prevent Unauthorized Role Escalation

  1. Security Enhancements
    - Create trigger to prevent unauthorized changes to SuperAdmin role
    - Create function to validate role changes
    - Add audit logging for role change attempts
    - Prevent users from self-assigning SuperAdmin role

  2. Validation Rules
    - Only authorized system operations can create SuperAdmin users
    - Role changes to SuperAdmin must be done via authorized SQL scripts
    - All role change attempts are logged for security auditing
    - Users can never update their own role to SuperAdmin

  3. Important Notes
    - This migration enforces the security policy: "Only Cliente users can be created via registration"
    - SuperAdmin users must be created manually via authorized SQL scripts
    - The trigger logs all unauthorized attempts for security monitoring
*/

-- Create function to validate and prevent unauthorized role changes
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
    
    -- Insert audit log
    INSERT INTO auditoria (
      tenant_id,
      user_id,
      accion,
      entidad_afectada,
      detalles,
      resultado,
      ip_origen
    ) VALUES (
      COALESCE(NEW.tenant_id, '00000000-0000-0000-0000-000000000001'),
      NEW.id,
      'SECURITY_VIOLATION',
      'users',
      jsonb_build_object(
        'attempted_role', 'SuperAdmin',
        'previous_role', OLD.role,
        'email', NEW.email,
        'reason', 'Unauthorized role escalation attempt blocked'
      ),
      'BLOCKED',
      inet_client_addr()::text
    );
    
    -- Prevent the role change
    RAISE EXCEPTION 'SECURITY: Unauthorized attempt to assign SuperAdmin role. SuperAdmin users can only be created via authorized SQL scripts.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and create new one
DROP TRIGGER IF EXISTS prevent_superadmin_escalation_trigger ON users;
CREATE TRIGGER prevent_superadmin_escalation_trigger
  BEFORE INSERT OR UPDATE OF role ON users
  FOR EACH ROW
  EXECUTE FUNCTION prevent_superadmin_role_escalation();

-- Create function to safely create SuperAdmin users (for authorized scripts only)
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
  ON CONFLICT (tenant_id, email) DO UPDATE SET
    role = 'SuperAdmin',
    name = EXCLUDED.name,
    active = true,
    updated_at = now();
  
  -- Log the authorized creation
  INSERT INTO auditoria (
    tenant_id,
    user_id,
    accion,
    entidad_afectada,
    detalles,
    resultado,
    ip_origen
  ) VALUES (
    p_tenant_id,
    v_user_id,
    'SUPERADMIN_CREATED',
    'users',
    jsonb_build_object(
      'email', p_email,
      'name', p_name,
      'created_via', 'authorized_function'
    ),
    'SUCCESS',
    inet_client_addr()::text
  );
  
  -- Reset authorization flag
  PERFORM set_config('app.allow_superadmin_creation', 'false', true);
  
  RAISE NOTICE 'Successfully created SuperAdmin user: %', p_email;
  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment explaining the security policy
COMMENT ON FUNCTION create_authorized_superadmin IS 
'SECURITY: This function is the ONLY authorized way to create SuperAdmin users. 
It must be called manually via SQL scripts by authorized database administrators.
User registration in the application ALWAYS creates Cliente role users.';

COMMENT ON TRIGGER prevent_superadmin_escalation_trigger ON users IS
'SECURITY: Prevents unauthorized role escalation to SuperAdmin. 
This trigger blocks any attempt to assign SuperAdmin role except through the authorized function.
All blocked attempts are logged in the auditoria table for security monitoring.';
