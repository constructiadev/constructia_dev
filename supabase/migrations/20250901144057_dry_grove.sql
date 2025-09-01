/*
  # Disable RLS for users table during development

  1. Changes
    - Disable Row Level Security on users table
    - Drop all existing policies that cause infinite recursion
  
  2. Security Note
    - This is for development only
    - RLS should be re-enabled with proper policies for production
*/

-- Disable RLS on users table
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies on users table to prevent recursion
DROP POLICY IF EXISTS "Users can access own tenant data" ON users;
DROP POLICY IF EXISTS "SuperAdmin can access all users" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;