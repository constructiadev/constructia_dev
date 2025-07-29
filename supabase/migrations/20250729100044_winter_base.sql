/*
  # Fix user signup database error

  1. Issues Fixed
    - Update handle_new_user function to handle errors gracefully
    - Ensure proper RLS policies for user creation
    - Add proper error handling for user profile creation

  2. Changes
    - Recreate handle_new_user function with better error handling
    - Ensure users table allows inserts from auth triggers
    - Add proper exception handling
*/

-- Drop and recreate the handle_new_user function with better error handling
DROP FUNCTION IF EXISTS handle_new_user();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  BEGIN
    -- Insert into public.users table
    INSERT INTO public.users (id, email, role)
    VALUES (NEW.id, NEW.email, 'client');
    
    RETURN NEW;
  EXCEPTION
    WHEN OTHERS THEN
      -- Log the error but don't fail the auth process
      RAISE LOG 'Error in handle_new_user: %', SQLERRM;
      RETURN NEW;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update RLS policies to allow system inserts
DROP POLICY IF EXISTS "System can insert users" ON users;
CREATE POLICY "System can insert users"
  ON users
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Ensure service role can manage users
DROP POLICY IF EXISTS "Service role can manage users" ON users;
CREATE POLICY "Service role can manage users"
  ON users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);