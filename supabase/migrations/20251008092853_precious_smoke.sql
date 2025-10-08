@@ .. @@
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "SuperAdmin can manage all users" ON public.users;
+DROP POLICY IF EXISTS "SuperAdmin can view all users" ON public.users;

-- Create new policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT
  TO authenticated
-  USING (auth.uid() = id OR is_super_admin());
+  USING (auth.uid() = id);
+
+CREATE POLICY "SuperAdmin can view all users" ON public.users
+  FOR SELECT
+  TO authenticated
+  USING (auth.uid() = '20000000-0000-0000-0000-000000000001'::uuid);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "SuperAdmin can manage all users" ON public.users
  FOR ALL
  TO authenticated
-  USING (is_super_admin())
-  WITH CHECK (is_super_admin());
+  USING (auth.uid() = '20000000-0000-0000-0000-000000000001'::uuid)
+  WITH CHECK (auth.uid() = '20000000-0000-0000-0000-000000000001'::uuid);