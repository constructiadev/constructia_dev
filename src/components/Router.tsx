import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Componentes de Auth
import LoginForm from './auth/LoginForm';

// Layouts
import AdminLayout from './layout/AdminLayout';
import ClientLayout from './layout/ClientLayout';

// Páginas Admin
import AdminDashboard from './admin/Dashboard';
import ClientsManagement from './admin/ClientsManagement';
import FinancialModule from './admin/FinancialModule';
import DatabaseModule from './admin/DatabaseModule';
import APIManagement from './admin/APIManagement';
import AuditModule from './admin/AuditModule';

// Páginas Cliente
import ClientDashboard from './client/Dashboard';
import Companies from './client/Companies';
import DocumentUpload from './client/DocumentUpload';
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
          <Route path="clients" element={<ClientsManagement />} />
          <Route path="financial" element={<FinancialModule />} />
          <Route path="ai" element={<div className="p-6">Módulo IA & Integraciones (En desarrollo)</div>} />
          <Route path="database" element={<DatabaseModule />} />
          <Route path="api" element={<APIManagement />} />
          <Route path="audit" element={<AuditModule />} />
          <Route path="settings" element={<div className="p-6">Configuración (En desarrollo)</div>} />
        </Route>

        {/* Rutas del Cliente */}
        <Route path="/client" element={
          <ProtectedRoute>
            <ClientLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<ClientDashboard />} />
          <Route path="companies" element={<Companies />} />
          <Route path="projects" element={<div className="p-6">Módulo de Proyectos (En desarrollo)</div>} />
          <Route path="upload" element={<DocumentUpload />} />
          <Route path="documents" element={<div className="p-6">Módulo de Documentos (En desarrollo)</div>} />
          <Route path="metrics" element={<div className="p-6">Módulo de Métricas (En desarrollo)</div>} />
          <Route path="subscription" element={<div className="p-6">Módulo de Suscripción (En desarrollo)</div>} />
          <Route path="settings" element={<div className="p-6">Configuración Cliente (En desarrollo)</div>} />
        </Route>

        {/* Ruta 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}