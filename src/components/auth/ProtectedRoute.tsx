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
          <p className="text-gray-600">Verificando acceso del tenant...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to appropriate login based on required role
    const loginPath = requireRole === 'admin' ? '/admin-login' : '/client-login';
    return <Navigate to={loginPath} replace />;
  }

  // Check role requirements
  if (requireRole === 'admin' && user.role !== 'SuperAdmin') {
    console.warn('⚠️ [ProtectedRoute] Admin access denied for role:', user.role);
    // Force logout and redirect to landing for security
    console.error('🚨 [ProtectedRoute] SECURITY: Non-admin attempted admin access - forcing logout');
    return <Navigate to={fallbackPath} replace />;
  }

  if (requireRole === 'client' && user.role === 'SuperAdmin') {
    console.warn('⚠️ [ProtectedRoute] Client access denied for role:', user.role);
    // Force logout and redirect to landing for security
    console.error('🚨 [ProtectedRoute] SECURITY: Admin attempted client access - forcing logout');
    return <Navigate to={fallbackPath} replace />;
  }

  if (requireRole === 'client' && !['Cliente', 'ClienteDemo'].includes(user.role)) {
    console.warn('⚠️ [ProtectedRoute] Invalid client role:', user.role);
    return <Navigate to={fallbackPath} replace />;
  }

  console.log('✅ [ProtectedRoute] Access granted for:', user.email, 'Role:', user.role, 'Tenant:', user.tenant_id);
  return <>{children}</>;
}