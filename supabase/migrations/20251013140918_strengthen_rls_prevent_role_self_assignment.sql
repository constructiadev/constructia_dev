/*
  # Strengthen RLS Policies to Prevent Role Self-Assignment

  1. Security Enhancements
    - Add RLS policy to prevent users from modifying their own role
    - Add RLS policy to prevent users from setting role to SuperAdmin
    - Ensure only service client can modify roles
    - Add explicit denial policies for unauthorized role changes

  2. Changes Applied
    - Create restrictive UPDATE policy for users table
    - Users can update their own profile EXCEPT the role field
    - Only authorized service operations can change roles
    - All role change attempts via application are blocked

  3. Security Notes
    - Users can update: name, phone, address, but NEVER role
    - SuperAdmin role can only be assigned via authorized SQL functions
    - This complements the trigger-based protection already in place
    - RLS provides defense-in-depth security strategy
*/

-- ============================================
-- DROP EXISTING POTENTIALLY PERMISSIVE POLICIES
-- ============================================

-- Drop any existing policies that might allow role updates
DO $$
BEGIN
  -- Drop user update policies that might be too permissive
  DROP POLICY IF EXISTS "Users can update own profile" ON users;
  DROP POLICY IF EXISTS "Users can update their own data" ON users;
  DROP POLICY IF EXISTS "Enable update for users based on id" ON users;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Some policies did not exist, continuing...';
END $$;

-- ============================================
-- CREATE SECURE UPDATE POLICY FOR USERS
-- ============================================

-- Policy: Users can update their own profile EXCEPT role field
CREATE POLICY "Users can update own profile except role"
ON users
FOR UPDATE
TO authenticated
USING (
  auth.uid() = id
)
WITH CHECK (
  auth.uid() = id
  AND role = (SELECT role FROM users WHERE id = auth.uid())
);

COMMENT ON POLICY "Users can update own profile except role" ON users IS
'SECURITY: Users can update their own profile but CANNOT change their role.
This prevents privilege escalation via self-assignment of SuperAdmin role.
The WITH CHECK ensures the role field remains unchanged during updates.';

-- ============================================
-- CREATE RESTRICTIVE POLICY FOR ROLE CHANGES
-- ============================================

-- Explicit DENY policy for any attempt to change role via application
CREATE POLICY "Deny role changes from application"
ON users
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (
  -- Allow update only if role is NOT being changed
  -- This is enforced by checking that new role equals current role
  true
)
WITH CHECK (
  -- Prevent any role change by ensuring new role = existing role
  role = (SELECT role FROM users WHERE id = auth.uid() OR id = users.id LIMIT 1)
);

COMMENT ON POLICY "Deny role changes from application" ON users IS
'SECURITY: Restrictive policy that explicitly prevents role changes from application code.
This works in conjunction with other policies to ensure defense in depth.
Only authorized database functions can modify roles.';

-- ============================================
-- CREATE POLICY TO ALLOW SERVICE CLIENT OPERATIONS
-- ============================================

-- Policy: Allow service client to perform necessary operations
-- This is needed for authorized operations like user registration
CREATE POLICY "Service client can manage users"
ON users
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

COMMENT ON POLICY "Service client can manage users" ON users IS
'Allows service_role (backend operations) to manage users.
This is required for legitimate operations like user registration.
Service client operations are trusted and bypass user-level restrictions.';

-- ============================================
-- VERIFY EXISTING SELECT AND INSERT POLICIES
-- ============================================

-- Ensure we have a basic SELECT policy for users to read their own data
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'users'
    AND policyname LIKE '%select%'
    OR policyname LIKE '%read%'
  ) THEN
    CREATE POLICY "Users can read own profile"
    ON users
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

    RAISE NOTICE 'Created SELECT policy for users table';
  END IF;
END $$;

-- ============================================
-- CREATE AUDIT LOG FOR BLOCKED UPDATE ATTEMPTS
-- ============================================

-- Create function to log blocked role change attempts
CREATE OR REPLACE FUNCTION log_blocked_role_change_attempt()
RETURNS trigger AS $$
BEGIN
  -- Only log if role is being changed
  IF OLD.role IS DISTINCT FROM NEW.role THEN
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
      COALESCE(NEW.tenant_id, OLD.tenant_id),
      NEW.id,
      'BLOCKED_ROLE_CHANGE',
      'users',
      jsonb_build_object(
        'old_role', OLD.role,
        'attempted_new_role', NEW.role,
        'email', NEW.email,
        'blocked_by', 'RLS_policy'
      ),
      'BLOCKED',
      inet_client_addr()::text
    );

    RAISE WARNING 'SECURITY: Blocked role change attempt for user % from % to %',
      NEW.email, OLD.role, NEW.role;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to log blocked attempts (runs BEFORE the restrictive policy denies)
DROP TRIGGER IF EXISTS log_role_change_attempts ON users;
CREATE TRIGGER log_role_change_attempts
  BEFORE UPDATE OF role ON users
  FOR EACH ROW
  WHEN (OLD.role IS DISTINCT FROM NEW.role)
  EXECUTE FUNCTION log_blocked_role_change_attempt();

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- List all policies on users table
DO $$
DECLARE
  policy_record record;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Current RLS Policies on users table:';
  RAISE NOTICE '========================================';

  FOR policy_record IN
    SELECT
      policyname,
      cmd,
      CASE
        WHEN permissive = 'PERMISSIVE' THEN 'PERMISSIVE'
        ELSE 'RESTRICTIVE'
      END as policy_type,
      roles
    FROM pg_policies
    WHERE tablename = 'users'
    ORDER BY policyname
  LOOP
    RAISE NOTICE 'Policy: % | Command: % | Type: % | Roles: %',
      policy_record.policyname,
      policy_record.cmd,
      policy_record.policy_type,
      policy_record.roles;
  END LOOP;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'RLS Policies Updated Successfully';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Users can now:';
  RAISE NOTICE '  ✅ Read their own profile';
  RAISE NOTICE '  ✅ Update their own profile (name, email, etc.)';
  RAISE NOTICE '  ❌ CANNOT change their role';
  RAISE NOTICE '  ❌ CANNOT assign SuperAdmin to themselves';
  RAISE NOTICE '';
  RAISE NOTICE 'Role changes can only be made via:';
  RAISE NOTICE '  - Authorized SQL functions (create_authorized_superadmin)';
  RAISE NOTICE '  - Direct database operations by DBAs';
  RAISE NOTICE '========================================';
END $$;
