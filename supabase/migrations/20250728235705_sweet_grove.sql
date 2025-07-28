/*
  # Enable Required Extensions for Authentication

  1. Extensions
    - pgcrypto: For password hashing and UUID generation
    - uuid-ossp: For UUID functions (if not already enabled)

  2. Security
    - Enables proper password encryption
    - Ensures UUID generation works correctly
*/

-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Enable uuid-ossp extension for UUID functions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";