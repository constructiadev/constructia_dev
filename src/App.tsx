import React from 'react';
import Router from './components/Router';
import CookieConsent from './components/common/CookieConsent';
import { AuthProvider } from './lib/auth-context';

function App() {
  console.log('🔍 [App] Component rendering - Development Mode');
  
  return (
    <AuthProvider>
      <>
        <Router />
        <CookieConsent />
      </>
    </AuthProvider>
  );
}

export default App;