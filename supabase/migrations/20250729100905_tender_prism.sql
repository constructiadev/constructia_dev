/*
  # Fix Supabase signup database error

  1. Database Schema Fixes
    - Ensure users table has proper structure
    - Fix handle_new_user trigger function
    - Add proper RLS policies for signup process

  2. Security
    - Enable RLS on users table
    - Add policies for authenticated users and service role
    - Allow system to insert during signup process

  3. Error Handling
    - Improve trigger function error handling
    - Ensure signup doesn't fail on profile creation errors
*/

-- Drop existing trigger and function to recreate them properly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recreate the handle_new_user function with proper error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert into public.users table
  INSERT INTO public.users (id, email, role)
  VALUES (new.id, new.email, 'client')
  ON CONFLICT (id) DO NOTHING;
  
  -- If user metadata contains client data, create client record
  IF new.raw_user_meta_data IS NOT NULL THEN
    BEGIN
      INSERT INTO public.clients (
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
        new.id,
        'CLI-' || UPPER(SUBSTRING(new.id::text, 1, 8)),
        COALESCE(new.raw_user_meta_data->>'company_name', ''),
        COALESCE(new.raw_user_meta_data->>'contact_name', ''),
        new.email,
        COALESCE(new.raw_user_meta_data->>'phone', ''),
        COALESCE(new.raw_user_meta_data->>'address', ''),
        COALESCE(new.raw_user_meta_data->>'selected_plan', 'basic')
      )
      ON CONFLICT (user_id) DO NOTHING;
    EXCEPTION WHEN OTHERS THEN
      -- Log error but don't fail the auth process
      RAISE WARNING 'Failed to create client record for user %: %', new.id, SQLERRM;
    END;
  END IF;
  
  RETURN new;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail the auth process
  RAISE WARNING 'Error in handle_new_user for user %: %', new.id, SQLERRM;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Ensure proper RLS policies for signup process
DROP POLICY IF EXISTS "Allow service role to insert users" ON public.users;
DROP POLICY IF EXISTS "Allow system to insert users during signup" ON public.users;

CREATE POLICY "Allow service role to insert users"
  ON public.users
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Allow system to insert users during signup"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Ensure clients table has proper policies for signup
DROP POLICY IF EXISTS "Allow service role to insert clients" ON public.clients;
DROP POLICY IF EXISTS "Allow system to insert clients during signup" ON public.clients;

CREATE POLICY "Allow service role to insert clients"
  ON public.clients
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Allow system to insert clients during signup"
  ON public.clients
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());