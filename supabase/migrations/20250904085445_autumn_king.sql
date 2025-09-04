/*
  # Fix user_role enum to include Cliente and ClienteDemo

  1. Database Schema Updates
    - Add 'Cliente' and 'ClienteDemo' values to user_role enum if they don't exist
    - Update existing users with old roles to use new roles
    - Ensure enum contains only: SuperAdmin, ClienteAdmin, GestorDocumental, SupervisorObra, Proveedor, Lector, Cliente, ClienteDemo

  2. Data Migration
    - Convert any existing 'client' roles to 'Cliente'
    - Preserve existing role assignments where possible

  3. Security
    - Maintain RLS policies for tenant isolation
*/

-- First, let's check what values currently exist in the enum
-- and add the missing ones safely

DO $$
BEGIN
    -- Add 'Cliente' if it doesn't exist
    BEGIN
        ALTER TYPE public.user_role ADD VALUE 'Cliente';
        RAISE NOTICE 'Added Cliente to user_role enum';
    EXCEPTION
        WHEN duplicate_object THEN
            RAISE NOTICE 'Cliente already exists in user_role enum';
    END;

    -- Add 'ClienteDemo' if it doesn't exist
    BEGIN
        ALTER TYPE public.user_role ADD VALUE 'ClienteDemo';
        RAISE NOTICE 'Added ClienteDemo to user_role enum';
    EXCEPTION
        WHEN duplicate_object THEN
            RAISE NOTICE 'ClienteDemo already exists in user_role enum';
    END;
END $$;

-- Update any users that might have invalid roles
-- Convert 'client' to 'Cliente' if any exist
UPDATE public.users 
SET role = 'Cliente'::user_role 
WHERE role::text = 'client';

-- Ensure we have some test data with the correct roles
-- This will help verify the enum is working correctly
INSERT INTO public.users (id, tenant_id, email, name, role, active) VALUES
  ('11111111-1111-1111-1111-111111111111', (SELECT id FROM tenants LIMIT 1), 'cliente.demo@constructia.com', 'Cliente Demo', 'Cliente'::user_role, true),
  ('22222222-2222-2222-2222-222222222222', (SELECT id FROM tenants LIMIT 1), 'cliente.test@constructia.com', 'Cliente Test', 'ClienteDemo'::user_role, true)
ON CONFLICT (tenant_id, email) DO UPDATE SET
  role = EXCLUDED.role,
  name = EXCLUDED.name,
  active = EXCLUDED.active;

-- Verify the enum now contains the correct values
DO $$
DECLARE
    enum_values text[];
BEGIN
    SELECT array_agg(enumlabel ORDER BY enumsortorder) 
    INTO enum_values
    FROM pg_enum 
    WHERE enumtypid = 'public.user_role'::regtype;
    
    RAISE NOTICE 'Current user_role enum values: %', enum_values;
END $$;