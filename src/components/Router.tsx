import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../lib/auth-context';
import ProtectedRoute from './auth/ProtectedRoute';

// Layouts
import AdminLayout from './layout/AdminLayout';
import ClientLayout from './layout/ClientLayout';

// Auth
import AdminLogin from './auth/AdminLogin';
import ClientLogin from './auth/ClientLogin';

// Admin pages
import AdminDashboard from './admin/Dashboard';
import ClientsManagement from './admin/ClientsManagement';
import FinancialModule from './admin/FinancialModule';
import AIIntegrationModule from './admin/AIIntegrationModule';
import PlatformIntegrationModule from './admin/PlatformIntegrationModule';
import DatabaseModule from './admin/DatabaseModule';
import APIManagement from './admin/APIManagement';
import AuditModule from './admin/AuditModule';
import SettingsModule from './admin/SettingsModule';
import MessagingModule from './admin/MessagingModule';
import ManualManagement from './admin/ManualManagement';
import DataProtectionCompliance from './admin/DataProtectionCompliance';

// Client pages
import ClientDashboard from './client/Dashboard';
import Companies from './client/Companies';
import Projects from './client/Projects';
import DocumentUpload from './client/DocumentUpload';
import Documents from './client/Documents';
import Metrics from './client/Metrics';
import Subscription from './client/Subscription';
import Settings from './client/Settings';

// Public pages
import LandingPage from './landing/LandingPage';
import PrivacyPolicy from './legal/PrivacyPolicy';
import TermsOfService from './legal/TermsOfService';
import CookiePolicy from './legal/CookiePolicy';

export default function Router() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Navigate to="/landing" replace />} />
          <Route path="/landing" element={<LandingPage />} />
          
          {/* Admin login - Solo accesible desde el escudo del footer */}
          <Route path="/admin-login" element={<AdminLogin />} />
          
          {/* Client login - Acceso aislado para clientes externos - FUNCIONAL */}
          <Route path="/client-login" element={<ClientLogin />} />

          {/* Legal pages */}
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/cookie-policy" element={<CookiePolicy />} />

          {/* Admin routes - Protegidas por rol */}
          <Route path="/admin" element={
            <ProtectedRoute requireRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="clients" element={<ClientsManagement />} />
            <Route path="financial" element={<FinancialModule />} />
            <Route path="ai" element={<AIIntegrationModule />} />
            <Route path="integrations" element={<PlatformIntegrationModule />} />
            <Route path="database" element={<DatabaseModule />} />
            <Route path="api" element={<APIManagement />} />
            <Route path="audit" element={<AuditModule />} />
            <Route path="settings" element={<SettingsModule />} />
            <Route path="messaging" element={<MessagingModule />} />
            <Route path="manual" element={<ManualManagement />} />
            <Route path="compliance" element={<DataProtectionCompliance />} />
          </Route>

          {/* Client routes - Protegidas por rol y tenant */}
          <Route path="/client" element={
            <ProtectedRoute requireRole="client">
              <ClientLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/client/dashboard" replace />} />
            <Route path="dashboard" element={<ClientDashboard />} />
            <Route path="companies" element={<Companies />} />
            <Route path="projects" element={<Projects />} />
            <Route path="upload" element={<DocumentUpload />} />
            <Route path="documents" element={<Documents />} />
            <Route path="metrics" element={<Metrics />} />
            <Route path="subscription" element={<Subscription />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Redirect any admin access attempts by clients to their dashboard */}
          <Route path="/admin/*" element={<Navigate to="/client/dashboard" replace />} />
          
          {/* Redirect any client access attempts by admins to landing */}
          <Route path="/client/*" element={
            <ProtectedRoute requireRole="client" fallbackPath="/landing">
              <Navigate to="/admin/dashboard" replace />
            </ProtectedRoute>
          } />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/landing" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}