/*
  # Create Platform Credentials Table

  1. New Table
    - `credenciales_plataforma`
      - `id` (uuid, primary key)
      - `tenant_id` (uuid, foreign key to tenants)
      - `platform_type` (text: 'nalanda', 'ctaima', 'ecoordina')
      - `username` (text)
      - `password` (text, encrypted)
      - `is_active` (boolean)
      - `last_updated` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `credenciales_plataforma` table
    - Add policies for tenant-isolated access
    - Add policy for SuperAdmin to view all credentials

  3. Indexes
    - Index on (tenant_id, platform_type) for fast lookups
*/

-- Create platform credentials table
CREATE TABLE IF NOT EXISTS public.credenciales_plataforma (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  platform_type text NOT NULL CHECK (platform_type IN ('nalanda', 'ctaima', 'ecoordina')),
  username text NOT NULL,
  password text NOT NULL,
  is_active boolean DEFAULT true,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id, platform_type)
);

-- Enable RLS
ALTER TABLE public.credenciales_plataforma ENABLE ROW LEVEL SECURITY;

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_credenciales_tenant_platform 
ON public.credenciales_plataforma(tenant_id, platform_type);

-- Policy: Users can view their own tenant's credentials
CREATE POLICY "Users can view own tenant credentials"
  ON public.credenciales_plataforma
  FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
  );

-- Policy: Users can insert their own tenant's credentials
CREATE POLICY "Users can insert own tenant credentials"
  ON public.credenciales_plataforma
  FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
  );

-- Policy: Users can update their own tenant's credentials
CREATE POLICY "Users can update own tenant credentials"
  ON public.credenciales_plataforma
  FOR UPDATE
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
  );

-- Policy: Users can delete their own tenant's credentials
CREATE POLICY "Users can delete own tenant credentials"
  ON public.credenciales_plataforma
  FOR DELETE
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
  );

-- Policy: SuperAdmin can view all credentials
CREATE POLICY "SuperAdmin can view all credentials"
  ON public.credenciales_plataforma
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = '20000000-0000-0000-0000-000000000001'::uuid
  );

-- Policy: SuperAdmin can manage all credentials
CREATE POLICY "SuperAdmin can manage all credentials"
  ON public.credenciales_plataforma
  FOR ALL
  TO authenticated
  USING (
    auth.uid() = '20000000-0000-0000-0000-000000000001'::uuid
  )
  WITH CHECK (
    auth.uid() = '20000000-0000-0000-0000-000000000001'::uuid
  );
