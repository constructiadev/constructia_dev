/*
  # Fix receipts RLS policy for INSERT operations

  1. Security Changes
    - Drop existing problematic INSERT policy for receipts
    - Create new INSERT policy that allows authenticated users to insert receipts for their own clients
    - Uses auth.uid() to match user_id in clients table
    - Follows expert recommendation for RLS policy structure

  2. Policy Details
    - Policy name: "Allow authenticated users to insert their own receipts"
    - Target: INSERT operations on receipts table
    - Role: authenticated users
    - Check: client_id must belong to a client where user_id = auth.uid()
*/

-- Drop the existing problematic INSERT policy
DROP POLICY IF EXISTS "Allow all authenticated users to insert receipts" ON receipts;
DROP POLICY IF EXISTS "System can insert receipts" ON receipts;
DROP POLICY IF EXISTS "Allow authenticated users to insert receipts" ON receipts;

-- Create the new INSERT policy using the expert's recommended approach
CREATE POLICY "Allow authenticated users to insert their own receipts" 
ON receipts 
FOR INSERT 
TO authenticated 
WITH CHECK (
  client_id IN (
    SELECT id 
    FROM clients 
    WHERE user_id = auth.uid()
  )
);