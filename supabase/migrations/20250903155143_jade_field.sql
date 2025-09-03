/*
  # Fix user_role enum to include Cliente and ClienteDemo

  1. Database Changes
    - Add 'Cliente' and 'ClienteDemo' to user_role enum
    - Update existing users with old roles to new client roles
    - Remove old client-related roles that are no longer needed

  2. Security
    - Maintain existing RLS policies
    - Ensure proper role-based access control
*/

-- Add new client roles to the enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'Cliente';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'ClienteDemo';

-- Update existing users with old client roles to new roles
UPDATE users 
SET role = 'Cliente'::user_role 
WHERE role IN ('ClienteAdmin'::user_role, 'GestorDocumental'::user_role, 'SupervisorObra'::user_role, 'Proveedor'::user_role, 'Lector'::user_role);

-- Update any demo users to ClienteDemo role
UPDATE users 
SET role = 'ClienteDemo'::user_role 
WHERE email LIKE '%demo%' OR email LIKE '%test%' OR name LIKE '%Demo%';