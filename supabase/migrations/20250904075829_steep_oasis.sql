/*
  # Redefinir enum user_role para estructura aislada de clientes

  1. Actualización de Roles Existentes
    - Convertir todos los roles de cliente antiguos a 'Cliente'
    - Mantener 'SuperAdmin' sin cambios
    
  2. Redefinición del Enum
    - Eliminar enum actual user_role
    - Crear nuevo enum con solo: SuperAdmin, Cliente, ClienteDemo
    
  3. Seguridad
    - Mantener políticas RLS existentes
    - Asegurar aislamiento de datos por tenant
*/

-- Step 1: Update existing user roles to new structure
UPDATE public.users 
SET role = 'SuperAdmin'::text 
WHERE role IN ('SuperAdmin');

UPDATE public.users 
SET role = 'Cliente'::text 
WHERE role IN ('ClienteAdmin', 'GestorDocumental', 'SupervisorObra', 'Proveedor', 'Lector', 'client');

-- Step 2: Drop the constraint that uses the enum
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;

-- Step 3: Change column to text temporarily
ALTER TABLE public.users ALTER COLUMN role TYPE text;

-- Step 4: Drop the old enum
DROP TYPE IF EXISTS public.user_role CASCADE;

-- Step 5: Create new enum with only the required roles
CREATE TYPE public.user_role AS ENUM (
  'SuperAdmin',
  'Cliente', 
  'ClienteDemo'
);

-- Step 6: Update column back to use the new enum
ALTER TABLE public.users ALTER COLUMN role TYPE public.user_role USING role::public.user_role;

-- Step 7: Set default value
ALTER TABLE public.users ALTER COLUMN role SET DEFAULT 'Cliente'::public.user_role;

-- Step 8: Add constraint to ensure only valid roles
ALTER TABLE public.users ADD CONSTRAINT users_role_check 
CHECK (role IN ('SuperAdmin', 'Cliente', 'ClienteDemo'));

-- Step 9: Update any existing policies to use new role names
DROP POLICY IF EXISTS "Users can access own tenant data" ON public.users;

CREATE POLICY "Users can access own tenant data"
  ON public.users
  FOR ALL
  TO authenticated
  USING (
    (tenant_id IN (
      SELECT users_1.tenant_id
      FROM users users_1
      WHERE (users_1.id = auth.uid())
    )) OR (
      EXISTS (
        SELECT 1
        FROM users users_1
        WHERE ((users_1.id = auth.uid()) AND (users_1.role = 'SuperAdmin'::user_role))
      )
    )
  );

-- Step 10: Ensure tenant isolation for client roles
DROP POLICY IF EXISTS "Cliente tenant isolation" ON public.users;

CREATE POLICY "Cliente tenant isolation"
  ON public.users
  FOR ALL
  TO authenticated
  USING (
    CASE 
      WHEN role = 'SuperAdmin' THEN true
      WHEN role IN ('Cliente', 'ClienteDemo') THEN tenant_id IN (
        SELECT tenant_id FROM users WHERE id = auth.uid()
      )
      ELSE false
    END
  );