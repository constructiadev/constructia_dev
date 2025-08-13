// src/components/PrivateRoute.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface PrivateRouteProps {
  allowedRoles: Array<'admin' | 'client'>;
  children: React.ReactNode;
}

export default function PrivateRoute({ allowedRoles, children }: PrivateRouteProps) {
  // MODO DESARROLLO: Desactivar autenticación temporalmente
  console.log('🔧 [PrivateRoute] DEVELOPMENT MODE: Authentication disabled');
  
  // Permitir acceso directo sin autenticación
  return <>{children}</>;
}
