/*
  # Create exec_sql function for development scripts

  1. New Functions
    - `exec_sql(sql text)` - Allows scripts to execute SQL commands
    
  2. Security
    - Function is created for development purposes only
    - Should be removed or restricted in production
    
  3. Usage
    - Used by development scripts to disable RLS and manage database schema
*/

CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
RETURNS SETOF record
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY EXECUTE sql;
END;
$$;

-- Grant execute permissions to authenticated users and service role
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO anon;