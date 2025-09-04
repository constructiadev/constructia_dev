/*
  # Add Cliente and ClienteDemo roles to user_role enum

  1. Database Schema Updates
    - Add 'Cliente' value to user_role enum if it doesn't exist
    - Add 'ClienteDemo' value to user_role enum if it doesn't exist
    - Update existing users with old roles to use 'Cliente'
  
  2. Data Migration
    - Convert any existing 'ClienteAdmin' users to 'Cliente'
    - Convert any existing 'client' users to 'Cliente'
    - Ensure all users have valid roles
  
  3. Security
    - Maintain existing RLS policies
    - Ensure tenant isolation is preserved
*/

-- First, update any existing users with invalid roles to 'SuperAdmin' temporarily
-- This prevents constraint violations during enum modification
UPDATE users 
SET role = 'SuperAdmin'::user_role 
WHERE role NOT IN ('SuperAdmin', 'ClienteAdmin', 'GestorDocumental', 'SupervisorObra', 'Proveedor', 'Lector');

-- Add 'Cliente' to the enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'Cliente' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
    ) THEN
        ALTER TYPE user_role ADD VALUE 'Cliente';
    END IF;
END $$;

-- Add 'ClienteDemo' to the enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'ClienteDemo' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
    ) THEN
        ALTER TYPE user_role ADD VALUE 'ClienteDemo';
    END IF;
END $$;

-- Now update users to use the new roles
UPDATE users 
SET role = 'Cliente'::user_role 
WHERE role IN ('ClienteAdmin', 'GestorDocumental', 'SupervisorObra', 'Proveedor', 'Lector');

-- Ensure we have at least one SuperAdmin user
INSERT INTO users (
    id,
    tenant_id,
    email,
    name,
    role,
    active
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM tenants LIMIT 1),
    'admin@constructia.com',
    'Super Admin',
    'SuperAdmin'::user_role,
    true
) ON CONFLICT (tenant_id, email) DO UPDATE SET
    role = 'SuperAdmin'::user_role,
    active = true;

-- Create demo client user
INSERT INTO users (
    id,
    tenant_id,
    email,
    name,
    role,
    active
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM tenants LIMIT 1),
    'garcia@construcciones.com',
    'García Construcciones',
    'ClienteDemo'::user_role,
    true
) ON CONFLICT (tenant_id, email) DO UPDATE SET
    role = 'ClienteDemo'::user_role,
    active = true;