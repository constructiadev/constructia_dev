```sql
-- supabase/migrations/20250904_add_client_roles_to_enum.sql
-- This migration ensures the 'Cliente' and 'ClienteDemo' roles exist in the public.user_role enum.
-- It also updates existing users to these new roles for consistency.

-- Add 'Cliente' value to the public.user_role enum if it doesn't already exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'public.user_role'::regtype AND enumlabel = 'Cliente') THEN
        ALTER TYPE public.user_role ADD VALUE 'Cliente' AFTER 'SuperAdmin';
    END IF;
END
$$;

-- Add 'ClienteDemo' value to the public.user_role enum if it doesn't already exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'public.user_role'::regtype AND enumlabel = 'ClienteDemo') THEN
        ALTER TYPE public.user_role ADD VALUE 'ClienteDemo' AFTER 'Cliente';
    END IF;
END
$$;

-- Update existing users with old client-related roles to 'Cliente'
-- This handles users created before the new enum structure was fully in place
UPDATE public.users
SET role = 'Cliente'
WHERE role IN ('ClienteAdmin', 'GestorDocumental', 'SupervisorObra', 'Proveedor', 'Lector');

-- Update specific demo user to 'ClienteDemo' if they exist and are not already 'ClienteDemo'
-- This ensures the primary demo user is correctly categorized
UPDATE public.users
SET role = 'ClienteDemo'
WHERE email = 'garcia@construcciones.com' AND role != 'ClienteDemo';

-- Note: If you have other specific users that should be 'ClienteDemo',
-- add similar UPDATE statements here.
```