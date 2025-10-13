-- ============================================================================
-- VERIFICATION SCRIPT: Tenant ID Assignment and Real Storage Tracking
-- ============================================================================
-- Use this script to verify that tenant_id assignment and storage tracking
-- are working correctly after the migration.
-- ============================================================================

-- 1. Verify all clients have tenant_id assigned
SELECT
  '1. TENANT ID ASSIGNMENT' as check_name,
  CASE
    WHEN COUNT(*) FILTER (WHERE tenant_id IS NULL) = 0 THEN '✓ PASS: All clients have tenant_id'
    ELSE '✗ FAIL: ' || COUNT(*) FILTER (WHERE tenant_id IS NULL)::text || ' clients without tenant_id'
  END as result
FROM public.clients;

-- 2. Verify storage sync between clients and documentos
SELECT
  '2. STORAGE SYNC (clients)' as check_name,
  CASE
    WHEN COUNT(*) = 0 THEN '✓ PASS: All clients storage is synced'
    ELSE '✗ FAIL: ' || COUNT(*)::text || ' clients out of sync'
  END as result
FROM (
  SELECT
    c.id,
    c.storage_used as clients_storage,
    COALESCE(doc_stats.actual_storage, 0) as actual_storage
  FROM public.clients c
  LEFT JOIN (
    SELECT tenant_id, SUM(COALESCE(size_bytes, 0)) as actual_storage
    FROM public.documentos
    GROUP BY tenant_id
  ) doc_stats ON doc_stats.tenant_id = c.tenant_id
  WHERE c.storage_used != COALESCE(doc_stats.actual_storage, 0)
) mismatches;

-- 3. Verify storage sync between tenant_metadata and documentos
SELECT
  '3. STORAGE SYNC (tenant_metadata)' as check_name,
  CASE
    WHEN COUNT(*) = 0 THEN '✓ PASS: All tenant_metadata storage is synced'
    ELSE '✗ FAIL: ' || COUNT(*)::text || ' tenant_metadata records out of sync'
  END as result
FROM (
  SELECT
    tm.tenant_id,
    tm.storage_used as metadata_storage,
    COALESCE(doc_stats.actual_storage, 0) as actual_storage
  FROM public.tenant_metadata tm
  LEFT JOIN (
    SELECT tenant_id, SUM(COALESCE(size_bytes, 0)) as actual_storage
    FROM public.documentos
    GROUP BY tenant_id
  ) doc_stats ON doc_stats.tenant_id = tm.tenant_id
  WHERE tm.storage_used != COALESCE(doc_stats.actual_storage, 0)
) mismatches;

-- 4. Verify triggers are installed
SELECT
  '4. TRIGGERS INSTALLED' as check_name,
  CASE
    WHEN COUNT(*) = 3 THEN '✓ PASS: All 3 storage triggers are installed'
    ELSE '✗ FAIL: Only ' || COUNT(*)::text || ' triggers installed (expected 3)'
  END as result
FROM pg_trigger
WHERE tgrelid = 'public.documentos'::regclass
  AND tgname LIKE '%storage%';

-- 5. Verify helper functions exist
SELECT
  '5. HELPER FUNCTIONS' as check_name,
  CASE
    WHEN COUNT(*) = 7 THEN '✓ PASS: All 7 storage functions exist'
    ELSE '✗ FAIL: Only ' || COUNT(*)::text || ' functions found (expected 7)'
  END as result
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname IN (
    'calculate_tenant_real_storage',
    'sync_storage_to_clients',
    'sync_storage_to_tenant_metadata',
    'sync_tenant_storage',
    'update_storage_on_document_insert',
    'update_storage_on_document_delete',
    'update_storage_on_document_update'
  );

-- ============================================================================
-- DETAILED REPORTS
-- ============================================================================

-- Report 1: Tenant Storage Overview
SELECT
  t.name as tenant_name,
  tm.documents_count,
  ROUND(tm.storage_used / 1024.0 / 1024.0, 2) as storage_mb,
  ROUND(tm.storage_limit / 1024.0 / 1024.0 / 1024.0, 2) as limit_gb,
  ROUND((tm.storage_used::numeric / NULLIF(tm.storage_limit, 0)) * 100, 2) as usage_percent,
  CASE
    WHEN tm.storage_used = COALESCE(doc_stats.actual_storage, 0) THEN '✓ Synced'
    ELSE '✗ Out of sync'
  END as sync_status
FROM public.tenants t
LEFT JOIN public.tenant_metadata tm ON tm.tenant_id = t.id
LEFT JOIN (
  SELECT tenant_id, SUM(COALESCE(size_bytes, 0)) as actual_storage
  FROM public.documentos
  GROUP BY tenant_id
) doc_stats ON doc_stats.tenant_id = t.id
WHERE tm.storage_used > 0
ORDER BY tm.storage_used DESC;

-- Report 2: Clients with Storage
SELECT
  c.company_name,
  ROUND(c.storage_used / 1024.0 / 1024.0, 2) as storage_mb,
  ROUND(c.storage_limit / 1024.0 / 1024.0 / 1024.0, 2) as limit_gb,
  c.documents_processed,
  t.name as tenant_name
FROM public.clients c
LEFT JOIN public.tenants t ON t.id = c.tenant_id
WHERE c.storage_used > 0
ORDER BY c.storage_used DESC;

-- Report 3: Documents by Tenant
SELECT
  t.name as tenant_name,
  COUNT(d.id) as document_count,
  ROUND(SUM(d.size_bytes) / 1024.0 / 1024.0, 2) as total_mb,
  ROUND(AVG(d.size_bytes) / 1024.0, 2) as avg_kb_per_doc
FROM public.documentos d
JOIN public.tenants t ON t.id = d.tenant_id
GROUP BY t.id, t.name
ORDER BY SUM(d.size_bytes) DESC;

-- ============================================================================
-- MANUAL RESYNC COMMAND (if needed)
-- ============================================================================
-- If you find any storage values out of sync, run this command:
--
-- DO $$
-- DECLARE
--   v_tenant RECORD;
-- BEGIN
--   FOR v_tenant IN SELECT DISTINCT id FROM public.tenants LOOP
--     PERFORM sync_tenant_storage(v_tenant.id);
--   END LOOP;
-- END $$;
