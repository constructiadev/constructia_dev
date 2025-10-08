@@ .. @@
-- Drop all existing RLS policies to prevent duplicates
DROP POLICY IF EXISTS "SuperAdmin can access all tenants" ON tenants;
DROP POLICY IF EXISTS "Users can access own tenant data" ON users;
+DROP POLICY IF EXISTS "Users can view own profile" ON users;
+DROP POLICY IF EXISTS "SuperAdmin can view all users" ON users;
+DROP POLICY IF EXISTS "Users can update own profile" ON users;
+DROP POLICY IF EXISTS "SuperAdmin can manage all users" ON users;
DROP POLICY IF EXISTS "Empresas tenant access" ON empresas;