// src/components/PrivateRoute.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface PrivateRouteProps {
  allowedRoles: Array<'admin' | 'client'>;
  children: React.ReactNode;
}

export default function PrivateRoute({ allowedRoles, children }: PrivateRouteProps) {
  const { isAuthenticated, userRole, loading } = useAuth();
  const location = useLocation();

  console.log('🔍 [PrivateRoute] Auth state:', { isAuthenticated, userRole, loading });

  // Mientras se verifica el estado de autenticación, muestra un loader o pantalla vacía
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Cargando…</p>
      </div>
    );
  }

  // No autenticado → redirigir al login correspondiente
  if (!isAuthenticated) {
    const loginPath = allowedRoles.includes('admin') ? '/admin/login' : '/login';
    console.log('🔍 [PrivateRoute] Not authenticated, redirecting to:', loginPath);
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // Autenticado pero sin rol permitido → redirigir a su propio dashboard
  if (!userRole || !allowedRoles.includes(userRole)) {
    console.log('🔍 [PrivateRoute] Role not allowed. UserRole:', userRole, 'AllowedRoles:', allowedRoles);
    const dashboardPath = userRole === 'admin' ? '/admin/dashboard' : '/client/dashboard';
    return <Navigate to={dashboardPath} replace />;
  }

  console.log('✅ [PrivateRoute] Access granted for role:', userRole);
  // Si pasa las validaciones, renderiza el contenido
  return <>{children}</>;
}
