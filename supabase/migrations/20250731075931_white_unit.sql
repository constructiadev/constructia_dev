/*
  # Fix receipts table RLS policy for inserts

  1. Security Changes
    - Update INSERT policy for receipts table to allow authenticated users to create receipts
    - Policy allows inserts where the client_id matches a client owned by the authenticated user
    - Maintains security by ensuring users can only create receipts for their own clients

  2. Changes Made
    - Drop existing restrictive INSERT policy
    - Create new INSERT policy that properly validates client ownership
*/

-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "System can insert receipts" ON receipts;

-- Create a new INSERT policy that allows authenticated users to insert receipts for their own clients
CREATE POLICY "Authenticated users can insert receipts for own clients"
  ON receipts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    client_id IN (
      SELECT clients.id
      FROM clients
      WHERE clients.user_id = auth.uid()
    )
  );