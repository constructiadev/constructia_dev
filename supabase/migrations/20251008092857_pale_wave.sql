@@ .. @@
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own client data" ON public.clients;
DROP POLICY IF EXISTS "Users can update own client data" ON public.clients;
DROP POLICY IF EXISTS "SuperAdmin can manage all clients" ON public.clients;

-- Create policies for clients
CREATE POLICY "Users can view own client data" ON public.clients
  FOR SELECT
  TO authenticated
-  USING (user_id = auth.uid() OR is_super_admin());
+  USING (user_id = auth.uid() OR auth.uid() = '20000000-0000-0000-0000-000000000001'::uuid);

CREATE POLICY "Users can update own client data" ON public.clients
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "SuperAdmin can manage all clients" ON public.clients
  FOR ALL
  TO authenticated
-  USING (is_super_admin())
-  WITH CHECK (is_super_admin());
+  USING (auth.uid() = '20000000-0000-0000-0000-000000000001'::uuid)
+  WITH CHECK (auth.uid() = '20000000-0000-0000-0000-000000000001'::uuid);