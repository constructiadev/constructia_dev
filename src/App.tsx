import React from 'react';
import { AuthProvider } from './context/AuthContext';
import Router from './components/Router';
import CookieConsent from './components/common/CookieConsent';

function App() {
  return (
    <AuthProvider>
        <Router />
        <CookieConsent />
    </AuthProvider>
  );
}

export default App;