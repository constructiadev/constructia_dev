/**
 * Security Configuration
 *
 * CRITICAL: This file contains security-critical configuration
 * DO NOT modify without proper authorization and security review
 */

/**
 * AUTHORIZED SUPERADMIN EMAILS
 *
 * SECURITY POLICY:
 * - Only emails in this whitelist can have SuperAdmin role
 * - SuperAdmin users can ONLY be created via authorized SQL scripts
 * - User registration ALWAYS creates role 'Cliente' - NEVER 'SuperAdmin'
 * - Any attempt to login as admin with non-whitelisted email will be REJECTED
 *
 * To add a new SuperAdmin:
 * 1. Add email to this whitelist
 * 2. Create user via authorized SQL script in database
 * 3. Never use the application UI to create SuperAdmin users
 */
export const AUTHORIZED_SUPERADMIN_EMAILS = [
  'admin@constructia.com',
  'system@constructia.com'
] as const;

/**
 * Check if an email is authorized to have SuperAdmin role
 * @param email - Email address to check
 * @returns true if email is authorized for SuperAdmin access
 */
export function isAuthorizedSuperAdmin(email: string): boolean {
  const normalizedEmail = email.toLowerCase().trim();
  return AUTHORIZED_SUPERADMIN_EMAILS.includes(normalizedEmail as any);
}

/**
 * SECURITY: Default role for all user registrations
 * This value must NEVER be changed - all registrations create Cliente users
 */
export const DEFAULT_USER_ROLE = 'Cliente' as const;

/**
 * SECURITY: Admin tenant ID
 * Only users in this tenant with whitelisted emails can be SuperAdmin
 */
export const ADMIN_TENANT_ID = '00000000-0000-0000-0000-000000000001';

/**
 * SECURITY: System admin user ID for audit logging
 */
export const SYSTEM_ADMIN_USER_ID = '20000000-0000-0000-0000-000000000001';
