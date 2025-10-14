/*
  # Fix handle_new_user Trigger for SuperAdmin Authentication

  ## Problem
  The handle_new_user trigger tries to insert users with role='client' which:
  1. Conflicts with existing SuperAdmin users
  2. Causes "Database error querying schema" during authentication
  3. Doesn't respect existing user profiles

  ## Solution
  Update the trigger to:
  1. Check if user already exists in public.users BEFORE inserting
  2. Only create new profiles for users who don't have one
  3. Never override existing SuperAdmin users
  4. Handle errors gracefully without failing auth

  ## Changes
  - Update handle_new_user function to be idempotent
  - Add check for existing users before insertion
  - Preserve existing roles (especially SuperAdmin)
*/

-- Drop and recreate the trigger function with proper logic
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_existing_user_role text;
BEGIN
  -- Check if user already exists in public.users
  SELECT role INTO v_existing_user_role
  FROM users
  WHERE id = NEW.id;
  
  -- If user exists, don't do anything (preserve existing data, especially SuperAdmin)
  IF v_existing_user_role IS NOT NULL THEN
    RAISE NOTICE 'User % already exists with role %. Skipping profile creation.', NEW.email, v_existing_user_role;
    RETURN NEW;
  END IF;
  
  -- User doesn't exist, create new profile
  BEGIN
    -- For new users, check if they have role metadata
    DECLARE
      v_user_role text;
      v_tenant_id uuid;
    BEGIN
      -- Extract role from metadata if available
      v_user_role := COALESCE(
        NEW.raw_user_meta_data->>'role',
        NEW.raw_app_meta_data->>'role',
        'Cliente'  -- Default role for new users
      );
      
      -- Get tenant_id (default to DEV_TENANT for now)
      v_tenant_id := '00000000-0000-0000-0000-000000000001';
      
      -- Insert new user profile
      INSERT INTO users (
        id,
        tenant_id,
        email,
        name,
        role,
        active
      )
      VALUES (
        NEW.id,
        v_tenant_id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        v_user_role::user_role,
        true
      );
      
      RAISE NOTICE 'Created new user profile for % with role %', NEW.email, v_user_role;
      
    EXCEPTION WHEN OTHERS THEN
      -- Log error but don't fail auth
      RAISE WARNING 'Failed to create user profile for %: %', NEW.email, SQLERRM;
    END;
    
    -- Try to create client record if metadata exists
    IF NEW.raw_user_meta_data IS NOT NULL AND 
       (NEW.raw_user_meta_data->>'company_name') IS NOT NULL THEN
      BEGIN
        INSERT INTO clients (
          user_id,
          client_id,
          company_name,
          contact_name,
          email,
          phone,
          address,
          subscription_plan
        )
        VALUES (
          NEW.id,
          'CLI-' || UPPER(SUBSTRING(NEW.id::text, 1, 8)),
          COALESCE(NEW.raw_user_meta_data->>'company_name', ''),
          COALESCE(NEW.raw_user_meta_data->>'contact_name', ''),
          NEW.email,
          COALESCE(NEW.raw_user_meta_data->>'phone', ''),
          COALESCE(NEW.raw_user_meta_data->>'address', ''),
          COALESCE(NEW.raw_user_meta_data->>'selected_plan', 'basic')
        )
        ON CONFLICT (user_id) DO NOTHING;
      EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Failed to create client record for %: %', NEW.email, SQLERRM;
      END;
    END IF;
    
  EXCEPTION WHEN OTHERS THEN
    -- Final catch-all: log but don't fail auth
    RAISE WARNING 'Error in handle_new_user for %: %', NEW.email, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure trigger is properly attached
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Verification
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'handle_new_user Trigger Updated';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Changes:';
  RAISE NOTICE '  1. Checks for existing users before inserting';
  RAISE NOTICE '  2. Preserves SuperAdmin and other existing roles';
  RAISE NOTICE '  3. Only creates profiles for truly new users';
  RAISE NOTICE '  4. Handles errors gracefully without failing auth';
  RAISE NOTICE '';
  RAISE NOTICE 'This should fix the "Database error querying schema" issue';
  RAISE NOTICE 'for system@constructia.com and other existing users.';
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
END $$;
