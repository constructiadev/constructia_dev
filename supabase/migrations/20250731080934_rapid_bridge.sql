/*
  # Fix RLS INSERT policy for receipts table

  1. Security Changes
    - Drop existing restrictive INSERT policy for receipts
    - Create new INSERT policy that allows authenticated users to insert receipts for their own clients
    - Policy checks that the client_id in the receipt belongs to the authenticated user

  2. Policy Logic
    - Users can only insert receipts for clients where clients.user_id = auth.uid()
    - This maintains security while allowing legitimate receipt creation
*/

-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "Authenticated users can insert receipts for own clients" ON receipts;

-- Create a new INSERT policy that allows users to insert receipts for their own clients
CREATE POLICY "Users can insert receipts for own clients"
  ON receipts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    client_id IN (
      SELECT id FROM clients WHERE user_id = auth.uid()
    )
  );