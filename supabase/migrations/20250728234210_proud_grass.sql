/*
  # Update existing clients with mock Obralia credentials

  1. Updates
    - Updates all existing clients in the `clients` table
    - Sets mock Obralia credentials for testing purposes
    - Marks all credentials as configured for existing clients

  2. Mock Data
    - Username: obralia_user_[client_number]
    - Password: obralia_pass_[client_number]
    - All marked as configured: true

  3. Security
    - This is for development/testing purposes only
    - In production, credentials should be properly encrypted
*/

-- Update existing clients with mock Obralia credentials
UPDATE clients 
SET obralia_credentials = jsonb_build_object(
  'username', 'obralia_user_' || SUBSTRING(client_id FROM 10),
  'password', 'obralia_pass_' || SUBSTRING(client_id FROM 10),
  'configured', true
)
WHERE obralia_credentials IS NULL 
   OR (obralia_credentials->>'configured')::boolean = false
   OR obralia_credentials->>'configured' IS NULL;

-- Ensure all existing clients have the configured flag set to true
UPDATE clients 
SET obralia_credentials = obralia_credentials || jsonb_build_object('configured', true)
WHERE obralia_credentials IS NOT NULL 
  AND (obralia_credentials->>'configured' IS NULL 
       OR (obralia_credentials->>'configured')::boolean = false);