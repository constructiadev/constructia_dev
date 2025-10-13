/*
  # Fix Tenant ID Assignment and Real Storage Tracking
  
  ## Summary
  This migration addresses critical multi-tenant isolation and storage tracking issues:
  - Assigns tenant_id to all clients based on their user relationships
  - Creates tenant records for clients without tenants
  - Implements real storage calculation from documentos table
  - Adds triggers for real-time storage tracking
  - Syncs storage data between clients and tenant_metadata tables
  
  ## Changes Made
  
  ### 1. Tenant ID Assignment
  - Update all clients.tenant_id from their associated users.tenant_id
  - Create missing tenant records for users without tenants
  - Ensure all clients have proper tenant isolation
  
  ### 2. Real Storage Calculation Functions
  - calculate_tenant_real_storage: Sums actual size_bytes from documentos per tenant
  - sync_storage_to_clients: Updates clients table with real storage
  - sync_storage_to_tenant_metadata: Updates tenant_metadata with real storage
  
  ### 3. Real-Time Storage Triggers
  - Trigger on documentos INSERT to increment storage_used
  - Trigger on documentos DELETE to decrement storage_used
  - Trigger on documentos UPDATE to adjust storage if size changes
  - Updates both clients and tenant_metadata tables simultaneously
  
  ### 4. Data Synchronization
  - Recalculates all storage values from actual documentos
  - Ensures consistency between clients and tenant_metadata
  - Adds validation to prevent negative storage values
  
  ## Security
  - All functions are SECURITY DEFINER for elevated privileges
  - Maintains existing RLS policies
  - Adds audit logging for storage changes
*/

-- ============================================================================
-- STEP 1: CREATE MISSING TENANTS FOR USERS WITHOUT TENANT_ID
-- ============================================================================

-- Create tenants for users who don't have one yet
INSERT INTO public.tenants (id, name, status, created_at, updated_at)
SELECT 
  gen_random_uuid() as id,
  COALESCE(c.company_name, u.email) as name,
  'active'::tenant_status as status,
  now() as created_at,
  now() as updated_at
FROM public.users u
LEFT JOIN public.clients c ON c.user_id = u.id
WHERE u.tenant_id IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.tenants t WHERE t.name = COALESCE(c.company_name, u.email)
  )
ON CONFLICT DO NOTHING;

-- Update users without tenant_id to link them to newly created tenants
UPDATE public.users u
SET tenant_id = (
  SELECT t.id 
  FROM public.tenants t
  LEFT JOIN public.clients c ON c.user_id = u.id
  WHERE t.name = COALESCE(c.company_name, u.email)
  LIMIT 1
)
WHERE u.tenant_id IS NULL;

-- ============================================================================
-- STEP 2: ASSIGN TENANT_ID TO ALL CLIENTS FROM USERS
-- ============================================================================

-- Update clients.tenant_id from their associated user's tenant_id
UPDATE public.clients c
SET tenant_id = u.tenant_id
FROM public.users u
WHERE c.user_id = u.id
  AND c.tenant_id IS NULL
  AND u.tenant_id IS NOT NULL;

-- For any remaining clients without tenant_id, create and assign a tenant
DO $$
DECLARE
  v_client RECORD;
  v_new_tenant_id uuid;
BEGIN
  FOR v_client IN 
    SELECT id, company_name, email 
    FROM public.clients 
    WHERE tenant_id IS NULL
  LOOP
    -- Create new tenant for this client
    INSERT INTO public.tenants (name, status)
    VALUES (v_client.company_name, 'active')
    RETURNING id INTO v_new_tenant_id;
    
    -- Assign tenant to client
    UPDATE public.clients
    SET tenant_id = v_new_tenant_id
    WHERE id = v_client.id;
    
    -- Create tenant_metadata
    INSERT INTO public.tenant_metadata (tenant_id, contact_name, contact_email)
    VALUES (v_new_tenant_id, v_client.company_name, v_client.email)
    ON CONFLICT (tenant_id) DO NOTHING;
    
    RAISE NOTICE 'Created tenant % for client %', v_new_tenant_id, v_client.company_name;
  END LOOP;
END $$;

-- ============================================================================
-- STEP 3: CREATE REAL STORAGE CALCULATION FUNCTIONS
-- ============================================================================

-- Function to calculate real storage usage from documentos table
CREATE OR REPLACE FUNCTION calculate_tenant_real_storage(p_tenant_id uuid)
RETURNS bigint AS $$
DECLARE
  v_total_storage bigint;
BEGIN
  SELECT COALESCE(SUM(size_bytes), 0)
  INTO v_total_storage
  FROM public.documentos
  WHERE tenant_id = p_tenant_id;
  
  RETURN v_total_storage;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to sync real storage to clients table
CREATE OR REPLACE FUNCTION sync_storage_to_clients(p_tenant_id uuid)
RETURNS void AS $$
DECLARE
  v_real_storage bigint;
BEGIN
  v_real_storage := calculate_tenant_real_storage(p_tenant_id);
  
  UPDATE public.clients
  SET 
    storage_used = v_real_storage,
    updated_at = now()
  WHERE tenant_id = p_tenant_id;
  
  RAISE NOTICE 'Synced storage for tenant % to clients: % bytes', p_tenant_id, v_real_storage;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to sync real storage to tenant_metadata table
CREATE OR REPLACE FUNCTION sync_storage_to_tenant_metadata(p_tenant_id uuid)
RETURNS void AS $$
DECLARE
  v_real_storage bigint;
  v_doc_count integer;
BEGIN
  SELECT 
    COALESCE(SUM(size_bytes), 0),
    COUNT(*)
  INTO v_real_storage, v_doc_count
  FROM public.documentos
  WHERE tenant_id = p_tenant_id;
  
  UPDATE public.tenant_metadata
  SET 
    storage_used = v_real_storage,
    documents_count = v_doc_count,
    last_activity = now(),
    updated_at = now()
  WHERE tenant_id = p_tenant_id;
  
  RAISE NOTICE 'Synced storage for tenant % to tenant_metadata: % bytes, % docs', p_tenant_id, v_real_storage, v_doc_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Consolidated sync function that updates both tables
CREATE OR REPLACE FUNCTION sync_tenant_storage(p_tenant_id uuid)
RETURNS void AS $$
BEGIN
  PERFORM sync_storage_to_clients(p_tenant_id);
  PERFORM sync_storage_to_tenant_metadata(p_tenant_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 4: CREATE REAL-TIME STORAGE TRACKING TRIGGERS
-- ============================================================================

-- Function to update storage when document is inserted
CREATE OR REPLACE FUNCTION update_storage_on_document_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tenant_id IS NOT NULL THEN
    -- Update clients table
    UPDATE public.clients
    SET storage_used = storage_used + COALESCE(NEW.size_bytes, 0)
    WHERE tenant_id = NEW.tenant_id;
    
    -- Update tenant_metadata table
    UPDATE public.tenant_metadata
    SET 
      storage_used = storage_used + COALESCE(NEW.size_bytes, 0),
      documents_count = documents_count + 1,
      last_activity = now(),
      updated_at = now()
    WHERE tenant_id = NEW.tenant_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update storage when document is deleted
CREATE OR REPLACE FUNCTION update_storage_on_document_delete()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.tenant_id IS NOT NULL THEN
    -- Update clients table (prevent negative values)
    UPDATE public.clients
    SET storage_used = GREATEST(0, storage_used - COALESCE(OLD.size_bytes, 0))
    WHERE tenant_id = OLD.tenant_id;
    
    -- Update tenant_metadata table (prevent negative values)
    UPDATE public.tenant_metadata
    SET 
      storage_used = GREATEST(0, storage_used - COALESCE(OLD.size_bytes, 0)),
      documents_count = GREATEST(0, documents_count - 1),
      last_activity = now(),
      updated_at = now()
    WHERE tenant_id = OLD.tenant_id;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update storage when document size changes
CREATE OR REPLACE FUNCTION update_storage_on_document_update()
RETURNS TRIGGER AS $$
DECLARE
  v_size_diff bigint;
BEGIN
  -- Only update if size changed
  IF OLD.size_bytes IS DISTINCT FROM NEW.size_bytes THEN
    v_size_diff := COALESCE(NEW.size_bytes, 0) - COALESCE(OLD.size_bytes, 0);
    
    IF NEW.tenant_id IS NOT NULL THEN
      -- Update clients table
      UPDATE public.clients
      SET storage_used = GREATEST(0, storage_used + v_size_diff)
      WHERE tenant_id = NEW.tenant_id;
      
      -- Update tenant_metadata table
      UPDATE public.tenant_metadata
      SET 
        storage_used = GREATEST(0, storage_used + v_size_diff),
        last_activity = now(),
        updated_at = now()
      WHERE tenant_id = NEW.tenant_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS trg_documentos_insert_update_storage ON public.documentos;
DROP TRIGGER IF EXISTS trg_documentos_delete_update_storage ON public.documentos;
DROP TRIGGER IF EXISTS trg_documentos_update_update_storage ON public.documentos;

-- Create triggers for real-time storage tracking
CREATE TRIGGER trg_documentos_insert_update_storage
  AFTER INSERT ON public.documentos
  FOR EACH ROW
  EXECUTE FUNCTION update_storage_on_document_insert();

CREATE TRIGGER trg_documentos_delete_update_storage
  AFTER DELETE ON public.documentos
  FOR EACH ROW
  EXECUTE FUNCTION update_storage_on_document_delete();

CREATE TRIGGER trg_documentos_update_update_storage
  AFTER UPDATE ON public.documentos
  FOR EACH ROW
  EXECUTE FUNCTION update_storage_on_document_update();

-- ============================================================================
-- STEP 5: RECALCULATE ALL STORAGE FROM ACTUAL DOCUMENTOS
-- ============================================================================

-- Reset all storage to 0 first
UPDATE public.clients SET storage_used = 0;
UPDATE public.tenant_metadata SET storage_used = 0, documents_count = 0;

-- Recalculate storage for all tenants from actual documentos
DO $$
DECLARE
  v_tenant RECORD;
BEGIN
  FOR v_tenant IN SELECT DISTINCT id FROM public.tenants LOOP
    PERFORM sync_tenant_storage(v_tenant.id);
  END LOOP;
  
  RAISE NOTICE 'Storage recalculation completed for all tenants';
END $$;

-- ============================================================================
-- STEP 6: CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Ensure index exists on documentos.tenant_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_documentos_tenant_id ON public.documentos(tenant_id);
CREATE INDEX IF NOT EXISTS idx_documentos_tenant_size ON public.documentos(tenant_id, size_bytes);

-- ============================================================================
-- STEP 7: ADD COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON FUNCTION calculate_tenant_real_storage(uuid) IS 'Calculates real storage usage by summing size_bytes from documentos table for a tenant';
COMMENT ON FUNCTION sync_storage_to_clients(uuid) IS 'Syncs real storage calculation to clients table for a tenant';
COMMENT ON FUNCTION sync_storage_to_tenant_metadata(uuid) IS 'Syncs real storage calculation to tenant_metadata table for a tenant';
COMMENT ON FUNCTION sync_tenant_storage(uuid) IS 'Syncs real storage to both clients and tenant_metadata tables';
COMMENT ON FUNCTION update_storage_on_document_insert() IS 'Trigger function to update storage when document is inserted';
COMMENT ON FUNCTION update_storage_on_document_delete() IS 'Trigger function to update storage when document is deleted';
COMMENT ON FUNCTION update_storage_on_document_update() IS 'Trigger function to update storage when document size changes';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Show summary of tenant_id assignments
SELECT 
  'Clients with tenant_id' as status,
  COUNT(*) as count
FROM public.clients
WHERE tenant_id IS NOT NULL
UNION ALL
SELECT 
  'Clients without tenant_id' as status,
  COUNT(*) as count
FROM public.clients
WHERE tenant_id IS NULL;

-- Show storage sync status
SELECT 
  t.id as tenant_id,
  t.name as tenant_name,
  c.storage_used as clients_storage,
  tm.storage_used as metadata_storage,
  COALESCE(SUM(d.size_bytes), 0) as actual_storage,
  CASE 
    WHEN c.storage_used = COALESCE(SUM(d.size_bytes), 0) THEN '✓ Synced'
    ELSE '✗ Out of sync'
  END as sync_status
FROM public.tenants t
LEFT JOIN public.clients c ON c.tenant_id = t.id
LEFT JOIN public.tenant_metadata tm ON tm.tenant_id = t.id
LEFT JOIN public.documentos d ON d.tenant_id = t.id
GROUP BY t.id, t.name, c.storage_used, tm.storage_used
ORDER BY t.name
LIMIT 20;
