/*
  # Fix RLS INSERT policy for receipts table

  1. Security Changes
    - Drop existing INSERT policy for receipts table
    - Create new INSERT policy that allows authenticated users to insert receipts
    - Policy ensures users can only create receipts for their own client accounts
    - Uses EXISTS clause to verify client ownership through user_id

  2. Policy Logic
    - Checks that the client_id in the receipt belongs to the authenticated user
    - Maintains data security by preventing cross-client receipt creation
    - Allows legitimate receipt generation for token purchases and plan changes
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