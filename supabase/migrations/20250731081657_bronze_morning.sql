/*
  # Fix RLS INSERT policy for receipts table

  1. Security Changes
    - Drop existing INSERT policy for receipts table
    - Create new INSERT policy that allows authenticated users to insert receipts
    - Policy ensures users can only create receipts for their own client accounts
    - Uses auth.uid() to verify ownership through clients table relationship

  2. Policy Details
    - Policy name: "Authenticated users can insert receipts for own clients"
    - Uses WITH CHECK clause for INSERT operations
    - Verifies client_id belongs to authenticated user via clients.user_id = auth.uid()
*/

-- Drop existing INSERT policy if it exists
DROP POLICY IF EXISTS "Authenticated users can insert receipts for own clients" ON receipts;

-- Create new INSERT policy with correct auth.uid() reference
CREATE POLICY "Authenticated users can insert receipts for own clients"
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