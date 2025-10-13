/*
  # Security Audit Script - Role Verification

  This script audits all users in the system and identifies potential security issues:
  - Users with SuperAdmin role that are not in the authorized whitelist
  - Users with inconsistent tenant assignments
  - Orphaned user records
  - Recent security violations logged in auditoria

  Run this script periodically to ensure role integrity.
*/

-- ============================================
-- SECTION 1: IDENTIFY UNAUTHORIZED SUPERADMINS
-- ============================================

SELECT
  '🚨 UNAUTHORIZED SUPERADMIN DETECTED' as alert_level,
  u.id,
  u.email,
  u.name,
  u.role,
  u.tenant_id,
  u.active,
  u.created_at,
  u.updated_at,
  'This user has SuperAdmin role but email is not in authorized whitelist' as issue
FROM users u
WHERE u.role = 'SuperAdmin'
  AND u.email NOT IN ('admin@constructia.com', 'system@constructia.com')
ORDER BY u.email;

-- ============================================
-- SECTION 2: ALL SUPERADMIN USERS SUMMARY
-- ============================================

SELECT
  '📊 All SuperAdmin Users' as report_section,
  u.id,
  u.email,
  u.name,
  u.tenant_id,
  u.active,
  CASE
    WHEN u.email IN ('admin@constructia.com', 'system@constructia.com')
    THEN '✅ Authorized'
    ELSE '❌ UNAUTHORIZED'
  END as authorization_status,
  u.created_at,
  u.updated_at
FROM users u
WHERE u.role = 'SuperAdmin'
ORDER BY
  CASE
    WHEN u.email IN ('admin@constructia.com', 'system@constructia.com') THEN 0
    ELSE 1
  END,
  u.email;

-- ============================================
-- SECTION 3: USERS IN ADMIN TENANT
-- ============================================

SELECT
  '📊 Users in Admin Tenant (00000000-0000-0000-0000-000000000001)' as report_section,
  u.id,
  u.email,
  u.name,
  u.role,
  u.active,
  CASE
    WHEN u.role = 'SuperAdmin' AND u.email IN ('admin@constructia.com', 'system@constructia.com')
    THEN '✅ Correct'
    WHEN u.role = 'SuperAdmin' AND u.email NOT IN ('admin@constructia.com', 'system@constructia.com')
    THEN '❌ SECURITY ISSUE'
    WHEN u.role != 'SuperAdmin'
    THEN '⚠️ Non-admin in admin tenant'
    ELSE '❓ Unknown'
  END as status,
  u.created_at
FROM users u
WHERE u.tenant_id = '00000000-0000-0000-0000-000000000001'
ORDER BY u.email;

-- ============================================
-- SECTION 4: RECENT SECURITY VIOLATIONS
-- ============================================

SELECT
  '🚨 Recent Security Violations (Last 30 days)' as report_section,
  a.timestamp,
  a.user_id,
  u.email,
  u.role as current_role,
  a.accion,
  a.entidad_afectada,
  a.detalles,
  a.resultado,
  a.ip_origen
FROM auditoria a
LEFT JOIN users u ON a.user_id = u.id
WHERE a.accion IN ('SECURITY_VIOLATION', 'SUPERADMIN_CREATED')
  AND a.timestamp > now() - interval '30 days'
ORDER BY a.timestamp DESC
LIMIT 50;

-- ============================================
-- SECTION 5: ROLE DISTRIBUTION STATISTICS
-- ============================================

SELECT
  '📊 Role Distribution Statistics' as report_section,
  role,
  COUNT(*) as user_count,
  COUNT(CASE WHEN active THEN 1 END) as active_count,
  COUNT(CASE WHEN NOT active THEN 1 END) as inactive_count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM users
GROUP BY role
ORDER BY user_count DESC;

-- ============================================
-- SECTION 6: USERS WITH MULTIPLE TENANTS (Potential Issue)
-- ============================================

SELECT
  '⚠️ Users with Multiple Tenant Assignments' as report_section,
  u.email,
  COUNT(DISTINCT u.tenant_id) as tenant_count,
  array_agg(DISTINCT u.tenant_id) as tenant_ids,
  array_agg(DISTINCT u.role) as roles
FROM users u
GROUP BY u.email
HAVING COUNT(DISTINCT u.tenant_id) > 1
ORDER BY tenant_count DESC;

-- ============================================
-- SECTION 7: ORPHANED USERS (No Auth Record)
-- ============================================

SELECT
  '⚠️ Orphaned Users (No Auth Record)' as report_section,
  u.id,
  u.email,
  u.name,
  u.role,
  u.tenant_id,
  u.created_at,
  'User exists in users table but not in auth.users' as issue
FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users au
  WHERE au.id = u.id
)
ORDER BY u.created_at DESC
LIMIT 20;

-- ============================================
-- SECTION 8: RECOMMENDED ACTIONS
-- ============================================

SELECT
  '📋 Recommended Security Actions' as report_section,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM users
      WHERE role = 'SuperAdmin'
      AND email NOT IN ('admin@constructia.com', 'system@constructia.com')
    )
    THEN '🚨 CRITICAL: Revoke SuperAdmin role from unauthorized users immediately'
    ELSE '✅ No unauthorized SuperAdmin users found'
  END as action_1,

  CASE
    WHEN EXISTS (
      SELECT 1 FROM auditoria
      WHERE accion = 'SECURITY_VIOLATION'
      AND timestamp > now() - interval '7 days'
    )
    THEN '⚠️ WARNING: Review recent security violations in auditoria table'
    ELSE '✅ No recent security violations'
  END as action_2,

  CASE
    WHEN EXISTS (
      SELECT 1 FROM users u
      WHERE NOT EXISTS (SELECT 1 FROM auth.users au WHERE au.id = u.id)
    )
    THEN '⚠️ WARNING: Clean up orphaned user records'
    ELSE '✅ No orphaned user records'
  END as action_3;

-- ============================================
-- SECTION 9: AUDIT COMPLETION MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Security Audit Completed';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Review the results above for any security issues.';
  RAISE NOTICE 'Pay special attention to UNAUTHORIZED SUPERADMIN alerts.';
  RAISE NOTICE 'All SuperAdmin users should be in the authorized whitelist:';
  RAISE NOTICE '  - admin@constructia.com';
  RAISE NOTICE '  - system@constructia.com';
  RAISE NOTICE '========================================';
END $$;
