/*
  # Fix RLS INSERT policy for receipts table

  1. Policy Changes
    - Drop existing INSERT policy for receipts
    - Create new INSERT policy with proper USING clause
    - Allow authenticated users to insert receipts for their own clients

  2. Security
    - Maintains data isolation between clients
    - Ensures users can only create receipts for clients they own
*/

-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Authenticated users can insert receipts for own clients" ON receipts;

-- Create new INSERT policy with USING clause
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