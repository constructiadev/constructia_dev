/*
  # Add priority column to manual_upload_queue table

  1. Schema Changes
    - Add `priority` column to `manual_upload_queue` table
    - Set default value to 'normal'
    - Add check constraint for valid priority values

  2. Data Migration
    - All existing records will get 'normal' priority by default

  3. Notes
    - This column is required by the manual management service
    - Valid values: 'low', 'normal', 'high', 'urgent'
*/

-- Add priority column to manual_upload_queue table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'manual_upload_queue' AND column_name = 'priority'
  ) THEN
    ALTER TABLE manual_upload_queue 
    ADD COLUMN priority TEXT DEFAULT 'normal';
    
    -- Add check constraint for valid priority values
    ALTER TABLE manual_upload_queue 
    ADD CONSTRAINT manual_upload_queue_priority_check 
    CHECK (priority IN ('low', 'normal', 'high', 'urgent'));
  END IF;
END $$;