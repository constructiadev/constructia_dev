import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Guard
import PrivateRoute from '../components/PrivateRoute';

// Layouts
import AdminLayout from './layout/AdminLayout';
import ClientLayout from './layout/ClientLayout';

// Auth
import LoginForm from './auth/LoginForm';        // ⬅ ojo: default import
import RegisterForm from './auth/RegisterForm';

// Admin pages
import AdminDashboard from './admin/Dashboard';
import ClientsManagement from './admin/ClientsManagement';
import FinancialModule from './admin/FinancialModule';
import AIIntegrationModule from './admin/AIIntegrationModule';
import DatabaseModule from './admin/DatabaseModule';
import APIManagement from './admin/APIManagement';
import AuditModule from './admin/AuditModule';
import SettingsModule from './admin/SettingsModule';

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
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* Públicas */}
        <Route path="/" element={<Navigate to="/landing" replace />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/login" element={<Navigate to="/client/dashboard" replace />} />
        <Route path="/admin/login" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/register" element={<RegisterForm />} />

        {/* Legales */}
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/cookie-policy" element={<CookiePolicy />} />

        {/* Admin (PROTEGIDO) */}
        <Route
          path="/admin"
          element={<AdminLayout />}
        >
          <Route index element={<AdminDashboard />} />
          <Route path="clients" element={<ClientsManagement />} />
          <Route path="financial" element={<FinancialModule />} />
          <Route path="ai" element={<AIIntegrationModule />} />
          <Route path="database" element={<DatabaseModule />} />
          <Route path="api" element={<APIManagement />} />
          <Route path="audit" element={<AuditModule />} />
          <Route path="settings" element={<SettingsModule />} />
        </Route>

        {/* Client (PROTEGIDO) */}
        <Route
          path="/client"
          element={<ClientLayout />}
        >
          <Route path="dashboard" element={<ClientDashboard />} />
          <Route path="companies" element={<Companies />} />
          <Route path="projects" element={<Projects />} />
          <Route path="upload" element={<DocumentUpload />} />
          <Route path="documents" element={<Documents />} />
          <Route path="metrics" element={<Metrics />} />
          <Route path="subscription" element={<Subscription />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
