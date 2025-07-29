import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginForm from './components/auth/LoginForm';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<Navigate to="/admin/login" replace />} />
          <Route path="/admin/login" element={<LoginForm isAdmin />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;