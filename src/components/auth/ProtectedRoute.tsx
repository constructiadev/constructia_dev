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
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Check role requirements
  if (requireRole === 'admin' && user.role !== 'SuperAdmin') {
    return <Navigate to="/client/dashboard" replace />;
  }

  if (requireRole === 'client' && !['ClienteAdmin', 'GestorDocumental', 'SupervisorObra', 'Proveedor', 'Lector'].includes(user.role)) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
}