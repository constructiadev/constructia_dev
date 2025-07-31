/*
  # Fix RLS INSERT policy for receipts table

  1. Policy Changes
    - Drop existing incorrect INSERT policy for receipts
    - Create new INSERT policy that allows authenticated users to insert receipts for their own clients
    - Use EXISTS clause to verify client ownership through clients.user_id = auth.uid()

  2. Security
    - Maintains data isolation between different users
    - Ensures users can only create receipts for clients they own
    - Uses proper WITH CHECK clause for INSERT operations
*/

-- Drop the existing incorrect INSERT policy
DROP POLICY IF EXISTS "Authenticated users can insert receipts for own clients" ON receipts;

-- Create the correct INSERT policy for receipts
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