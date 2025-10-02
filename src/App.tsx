import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import Router from './components/Router';
import CookieConsent from './components/common/CookieConsent';
import { AuthProvider } from './lib/auth-context';

function App() {
  console.log('🔍 [App] Component rendering - Development Mode');
  
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <>
          <Router />
          <CookieConsent />
        </>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;