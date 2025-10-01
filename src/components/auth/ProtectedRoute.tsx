import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth-context';

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
  const { user, loading } = useAuth();

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
    // Only SuperAdmin can access admin routes
    if (user.role !== 'SuperAdmin') {
      console.error('❌ [ProtectedRoute] ADMIN ACCESS DENIED for role:', user.role);
      console.error('❌ [ProtectedRoute] Redirecting to client login - admin access forbidden');
      return <Navigate to="/client-login" replace />;
    }
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
      // Allow access only to subscription page for checkout
      const currentPath = window.location.pathname;
      if (currentPath !== '/client/subscription') {
        return <Navigate to="/client/subscription?showCheckout=true" replace />;
      }
    }
  }

  console.log('✅ [ProtectedRoute] Access granted for:', user.email, 'Role:', user.role, 'Tenant:', user.tenant_id);
  return <>{children}</>;
}