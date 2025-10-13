import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth-context';
import { isAuthorizedSuperAdmin } from '../../config/security-config';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: 'client' | 'admin';
  fallbackPath?: string;
}

export default function ProtectedRoute({
  children,
  requireRole,
  fallbackPath = '/landing'
}: ProtectedRouteProps) {
  const { user, loading, signOut } = useAuth();

  // SECURITY: Continuous validation of user role and authorization
  useEffect(() => {
    if (!user || loading) return;

    // Validate SuperAdmin users against whitelist
    if (user.role === 'SuperAdmin') {
      if (!isAuthorizedSuperAdmin(user.email)) {
        console.error('❌ [ProtectedRoute] SECURITY VIOLATION: Unauthorized SuperAdmin detected');
        console.error('❌ [ProtectedRoute] Email:', user.email, 'is not in authorized whitelist');
        console.error('❌ [ProtectedRoute] Forcing logout for security...');

        signOut().catch(err => console.error('Error during security logout:', err));
      }
    }

    // Validate role matches required route
    if (requireRole === 'admin' && user.role !== 'SuperAdmin') {
      console.error('❌ [ProtectedRoute] Role mismatch: User with role', user.role, 'attempting admin access');
    }

    if (requireRole === 'client' && user.role === 'SuperAdmin') {
      console.error('❌ [ProtectedRoute] Security: SuperAdmin attempting client portal access');
    }
  }, [user, loading, requireRole, signOut]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('🔐 [ProtectedRoute] No user found, redirecting to login');
    // Always redirect to fallbackPath (default: /landing) when no user is found
    return <Navigate to={fallbackPath} replace />;
  }

  // CRITICAL: Strict role-based access control
  if (requireRole === 'admin') {
    // SECURITY: Multi-level validation for admin access
    if (user.role !== 'SuperAdmin') {
      console.error('❌ [ProtectedRoute] ADMIN ACCESS DENIED for role:', user.role);
      console.error('❌ [ProtectedRoute] User:', user.email);
      console.error('❌ [ProtectedRoute] Redirecting to client login - admin access forbidden');
      return <Navigate to="/client-login" replace />;
    }

    // SECURITY: Verify SuperAdmin is in authorized whitelist
    if (!isAuthorizedSuperAdmin(user.email)) {
      console.error('❌ [ProtectedRoute] SECURITY VIOLATION: Unauthorized SuperAdmin access attempt');
      console.error('❌ [ProtectedRoute] Email:', user.email, 'is not authorized');
      console.error('❌ [ProtectedRoute] Forcing redirect to landing page');
      return <Navigate to="/landing" replace />;
    }

    console.log('✅ [ProtectedRoute] Authorized SuperAdmin access granted:', user.email);
  }

  if (requireRole === 'client') {
    // Only Cliente and ClienteDemo can access client routes
    if (!['Cliente', 'ClienteDemo'].includes(user.role)) {
      console.log('🔐 [ProtectedRoute] CLIENT ACCESS DENIED for role:', user.role);
      if (user.role === 'SuperAdmin') {
        console.log('🔐 [ProtectedRoute] SuperAdmin cannot access client portal');
        return <Navigate to="/admin-login" replace />;
      }
      console.log('🔐 [ProtectedRoute] Invalid role - redirecting to landing');
      return <Navigate to={fallbackPath} replace />;
    }

    // CRITICAL: Check if client has completed checkout (not in trial status)
    if (user.subscription_status === 'trial') {
      console.log('🔐 [ProtectedRoute] CLIENT IN TRIAL - redirecting to checkout');
      // Redirect to dedicated checkout page
      return <Navigate to="/client-checkout" replace />;
    }
  }

  console.log('✅ [ProtectedRoute] Access granted for:', user.email, 'Role:', user.role, 'Tenant:', user.tenant_id);
  return <>{children}</>;
}