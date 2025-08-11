import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Import layouts
import AdminLayout from './layout/AdminLayout';
import ClientLayout from './layout/ClientLayout';

// Import auth components
import LoginForm from './auth/LoginForm';
import RegisterForm from './auth/RegisterForm';

// Import admin components
import AdminDashboard from './admin/Dashboard';
import ClientsManagement from './admin/ClientsManagement';
import FinancialModule from './admin/FinancialModule';
import AIIntegrationModule from './admin/AIIntegrationModule';
import DatabaseModule from './admin/DatabaseModule';
import APIManagement from './admin/APIManagement';
import AuditModule from './admin/AuditModule';
import SettingsModule from './admin/SettingsModule';

// Import client components
import ClientDashboard from './client/Dashboard';
import Companies from './client/Companies';
import Projects from './client/Projects';
import DocumentUpload from './client/DocumentUpload';
import Documents from './client/Documents';
import Metrics from './client/Metrics';
import Subscription from './client/Subscription';
import Settings from './client/Settings';

// Import landing and legal pages
import LandingPage from './landing/LandingPage';
import PrivacyPolicy from './legal/PrivacyPolicy';
import TermsOfService from './legal/TermsOfService';
import CookiePolicy from './legal/CookiePolicy';

function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole?: 'admin' | 'client' }) {
  const { user, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to={userRole === 'admin' ? '/admin' : '/client/dashboard'} replace />;
  }

  return <>{children}</>;
}

export default function Router() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Navigate to="/landing" replace />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/admin/login" element={<LoginForm isAdmin={true} />} />
        
        {/* Legal pages */}
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/cookie-policy" element={<CookiePolicy />} />

        {/* Admin routes */}
        <Route path="/admin" element={
            <AdminLayout />
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

        {/* Client routes */}
        <Route path="/client" element={
          <ProtectedRoute requiredRole="client">
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

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/landing" replace />} />
      </Routes>
    </BrowserRouter>
  );
}