/*
  # Fix RLS INSERT policy for receipts table

  1. Changes
    - Drop existing INSERT policy for receipts table
    - Create new INSERT policy that allows authenticated users to insert receipts for their own clients
    - Use EXISTS clause to verify client ownership through user_id

  2. Security
    - Ensures users can only create receipts for clients they own
    - Maintains data isolation between different users
    - Uses proper WITH CHECK clause for INSERT operations
*/

-- Drop existing INSERT policy if it exists
DROP POLICY IF EXISTS "Authenticated users can insert receipts for own clients" ON receipts;

-- Create new INSERT policy with correct syntax
CREATE POLICY "Users can insert receipts for own clients"
  ON receipts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM clients 
      WHERE clients.id = client_id 
      AND clients.user_id = auth.uid()
    )
  );