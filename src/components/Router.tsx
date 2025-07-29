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
import AIIntegrationModule from './admin/AIIntegrationModule';
import SettingsModule from './admin/SettingsModule';

// Páginas Cliente
import ClientDashboard from './client/Dashboard';
import Companies from './client/Companies';
import Projects from './client/Projects';
import Documents from './client/Documents';
import Metrics from './client/Metrics';
import Subscription from './client/Subscription';
import DocumentUpload from './client/DocumentUpload';
import Settings from './client/Settings';

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

  console.log('ProtectedRoute renderizado. Estado:', { 
    user: user?.email, 
    userRole, 
    loading, 
    requireAdmin 
  });

  if (loading) return <Loading />;
  
  if (!user) return <Navigate to="/" replace />;
  
  if (requireAdmin && userRole !== 'admin') {
    return <Navigate to="/client/dashboard" replace />;
  }

  return <>{children}</>;
}

export default function Router() {
  const { user, userRole, loading } = useAuth();

  console.log('Router renderizado. Estado:', { 
    user: user?.email, 
    userRole, 
    loading 
  });

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
          <Route path="ai" element={<AIIntegrationModule />} />
          <Route path="database" element={<DatabaseModule />} />
          <Route path="api" element={<APIManagement />} />
          <Route path="audit" element={<AuditModule />} />
          <Route path="settings" element={<SettingsModule />} />
        </Route>

        {/* Rutas del Cliente */}
        <Route path="/client" element={
          <ProtectedRoute>
            <ClientLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<ClientDashboard />} />
          <Route path="companies" element={<Companies />} />
          <Route path="projects" element={<Projects />} />
          <Route path="upload" element={<DocumentUpload />} />
          <Route path="documents" element={<Documents />} />
          <Route path="metrics" element={<Metrics />} />
          <Route path="subscription" element={<Subscription />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Ruta 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}