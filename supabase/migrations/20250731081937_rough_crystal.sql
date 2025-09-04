/*
  # Fix RLS policy for receipts table

  1. Policy Changes
    - Drop existing restrictive INSERT policy for receipts
    - Create new INSERT policy that allows authenticated users to insert receipts for their own clients
    - Ensure the policy uses WITH CHECK clause for INSERT operations

  2. Security
    - Maintains security by ensuring users can only create receipts for clients they own
    - Uses auth.uid() to verify the authenticated user matches the client's user_id
*/

-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "Users can insert receipts for own clients" ON receipts;

-- Create a new INSERT policy that allows authenticated users to insert receipts for their own clients
CREATE POLICY "Allow authenticated users to insert their own receipts"
  ON receipts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = (
      SELECT user_id 
      FROM clients 
      WHERE id = client_id
    )
  );