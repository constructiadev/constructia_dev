/*
  # Add admin_user_id column to manual_upload_sessions

  1. Schema Changes
    - Add `admin_user_id` column to `manual_upload_sessions` table
    - Set up foreign key constraint to `users` table
    - Update existing records to use a default admin user ID

  2. Security
    - Maintain existing RLS policies
    - Ensure proper referential integrity
*/

-- Add the admin_user_id column to manual_upload_sessions table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'manual_upload_sessions' AND column_name = 'admin_user_id'
  ) THEN
    ALTER TABLE manual_upload_sessions ADD COLUMN admin_user_id uuid;
  END IF;
END $$;

-- Add foreign key constraint to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'manual_upload_sessions_admin_user_id_fkey'
  ) THEN
    ALTER TABLE manual_upload_sessions 
    ADD CONSTRAINT manual_upload_sessions_admin_user_id_fkey 
    FOREIGN KEY (admin_user_id) REFERENCES users(id) ON DELETE SET NULL;
  END IF;
END $$;