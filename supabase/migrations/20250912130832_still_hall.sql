/*
# Fix manual_upload_sessions table schema

1. Database Schema Fix
   - Add missing `admin_user_id` column to `manual_upload_sessions` table
   - Update column name from `admin_id` to `admin_user_id` for consistency
   - Add foreign key constraint for data integrity

2. Security
   - Maintain RLS policies
   - Ensure proper data relationships
*/

-- Add the missing admin_user_id column if it doesn't exist
DO $$
BEGIN
  -- Check if admin_user_id column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'manual_upload_sessions' 
    AND column_name = 'admin_user_id'
  ) THEN
    -- If admin_id exists, rename it to admin_user_id
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'manual_upload_sessions' 
      AND column_name = 'admin_id'
    ) THEN
      ALTER TABLE public.manual_upload_sessions 
      RENAME COLUMN admin_id TO admin_user_id;
    ELSE
      -- Add the column if neither exists
      ALTER TABLE public.manual_upload_sessions 
      ADD COLUMN admin_user_id UUID;
    END IF;
  END IF;
END $$;

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'manual_upload_sessions_admin_user_id_fkey'
  ) THEN
    ALTER TABLE public.manual_upload_sessions 
    ADD CONSTRAINT manual_upload_sessions_admin_user_id_fkey 
    FOREIGN KEY (admin_user_id) REFERENCES public.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Update any existing records to have a valid admin_user_id if they don't have one
UPDATE public.manual_upload_sessions 
SET admin_user_id = '20000000-0000-0000-0000-000000000001' -- DEV_ADMIN_USER_ID
WHERE admin_user_id IS NULL;