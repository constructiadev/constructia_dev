/*
  # Fix infinite recursion in users table RLS policies

  1. Problem
    - The "Admins can read all users" policy creates infinite recursion
    - It checks if current user is admin by querying the same users table
    - This creates a circular dependency during policy evaluation

  2. Solution
    - Remove the problematic admin policy that causes recursion
    - Keep the essential policies for user self-access
    - Admins will use service role or direct database access for user management

  3. Security
    - Users can still read and update their own data
    - Service role can still insert users during signup
    - System can insert users during authentication flow
*/

-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Admins can read all users" ON users;

-- Keep existing safe policies (these don't cause recursion)
-- "Users can read own data" - safe because it only checks uid() = id
-- "Users can update own data" - safe because it only checks uid() = id  
-- "Allow service role to insert users" - safe because it's for service_role
-- "Allow system to insert users during signup" - safe because it only checks uid() = id