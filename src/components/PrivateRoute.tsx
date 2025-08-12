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
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // Autenticado pero sin rol permitido → redirigir a su propio dashboard
  if (!userRole || !allowedRoles.includes(userRole)) {
    const dashboardPath = userRole === 'admin' ? '/admin/dashboard' : '/client/dashboard';
    return <Navigate to={dashboardPath} replace />;
  }

  // Si pasa las validaciones, renderiza el contenido
  return <>{children}</>;
}
