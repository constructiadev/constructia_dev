import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Componentes de Auth
import LoginForm from './auth/LoginForm';

// Layouts
import AdminLayout from './layout/AdminLayout';

// Páginas Admin
import AdminDashboard from './admin/Dashboard';

// Componente de Loading
function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
    </div>
  );
}

// Rutas protegidas
function ProtectedRoute({ children, requireAdmin = false }: { children: React.ReactNode; requireAdmin?: boolean }) {
  const { user, userRole, loading } = useAuth();

  if (loading) return <Loading />;
  
  if (!user) return <Navigate to="/" replace />;
  
  if (requireAdmin && userRole !== 'admin') {
    return <Navigate to="/client/dashboard" replace />;
  }

  return <>{children}</>;
}

export default function Router() {
  const { user, userRole, loading } = useAuth();

  if (loading) return <Loading />;

  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={
          user ? (
            userRole === 'admin' ? <Navigate to="/admin" replace /> : <Navigate to="/client/dashboard" replace />
          ) : (
            <LoginForm />
          )
        } />
        
        <Route path="/admin/login" element={<LoginForm isAdmin />} />

        {/* Rutas del Admin */}
        <Route path="/admin" element={
          <ProtectedRoute requireAdmin>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="clients" element={<div className="p-6">Módulo de Clientes (En desarrollo)</div>} />
          <Route path="financial" element={<div className="p-6">Módulo Financiero (En desarrollo)</div>} />
          <Route path="ai" element={<div className="p-6">Módulo IA & Integraciones (En desarrollo)</div>} />
          <Route path="database" element={<div className="p-6">Módulo Base de Datos (En desarrollo)</div>} />
          <Route path="api" element={<div className="p-6">Módulo API Management (En desarrollo)</div>} />
          <Route path="audit" element={<div className="p-6">Módulo Auditoría (En desarrollo)</div>} />
          <Route path="settings" element={<div className="p-6">Configuración (En desarrollo)</div>} />
        </Route>

        {/* Rutas del Cliente */}
        <Route path="/client/dashboard" element={
          <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-800">Portal Cliente</h1>
                <p className="text-gray-600 mt-2">En desarrollo - Fase 2</p>
              </div>
            </div>
          </ProtectedRoute>
        } />

        {/* Ruta 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}