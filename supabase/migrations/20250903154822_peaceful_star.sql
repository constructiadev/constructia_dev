/*
  # Create Cliente and ClienteDemo roles

  1. New Roles
    - Remove ClienteAdmin, GestorDocumental, SupervisorObra, Proveedor, Lector
    - Add Cliente and ClienteDemo roles
    - Keep SuperAdmin for administrators only

  2. Security
    - Update user_role enum to only include: SuperAdmin, Cliente, ClienteDemo
    - Update all existing users to use new roles
    - Maintain tenant isolation for clients

  3. Changes
    - Modify user_role enum type
    - Update existing user records
    - Update role validation in application
*/

-- Drop existing enum and recreate with new values
DROP TYPE IF EXISTS user_role CASCADE;

CREATE TYPE user_role AS ENUM ('SuperAdmin', 'Cliente', 'ClienteDemo');

-- Update users table to use new enum
ALTER TABLE users 
ALTER COLUMN role TYPE user_role 
USING CASE 
  WHEN role::text = 'SuperAdmin' THEN 'SuperAdmin'::user_role
  WHEN role::text IN ('ClienteAdmin', 'GestorDocumental', 'SupervisorObra', 'Proveedor', 'Lector') THEN 'Cliente'::user_role
  ELSE 'ClienteDemo'::user_role
END;

-- Update existing demo users to use ClienteDemo role
UPDATE users 
SET role = 'ClienteDemo'::user_role 
WHERE email IN (
  'garcia@construcciones.com',
  'lopez@reformas.com', 
  'martin@edificaciones.com'
);

-- Update admin user to ensure SuperAdmin role
UPDATE users 
SET role = 'SuperAdmin'::user_role 
WHERE email = 'admin@constructia.com';

-- Update RLS policies to use new roles
DROP POLICY IF EXISTS "Users can access own tenant data" ON users;

CREATE POLICY "Users can access own tenant data"
  ON users
  FOR ALL
  TO authenticated
  USING (
    (tenant_id IN (
      SELECT users_1.tenant_id
      FROM users users_1
      WHERE (users_1.id = uid())
    )) OR (
      EXISTS (
        SELECT 1
        FROM users users_1
        WHERE ((users_1.id = uid()) AND (users_1.role = 'SuperAdmin'::user_role))
      )
    )
  );

-- Update other policies that reference old roles
UPDATE requisitos_plataforma 
SET reglas_validacion = jsonb_set(
  reglas_validacion,
  '{0,when,role}',
  '"Cliente"'::jsonb
)
WHERE reglas_validacion::text LIKE '%ClienteAdmin%';

-- Update tareas table policies and constraints if they reference roles
UPDATE tareas 
SET asignado_role = 'Cliente'
WHERE asignado_role IN ('ClienteAdmin', 'GestorDocumental', 'SupervisorObra', 'Proveedor', 'Lector');

-- Update mensajes table destinatarios
UPDATE mensajes 
SET destinatarios = jsonb_set(
  destinatarios,
  '{0}',
  '"Cliente"'::jsonb
)
WHERE destinatarios::text LIKE '%ClienteAdmin%';

-- Add comment to track changes
COMMENT ON TYPE user_role IS 'Updated roles: SuperAdmin (admin only), Cliente (regular clients), ClienteDemo (demo clients)';