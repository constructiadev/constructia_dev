import React from 'react';
import Router from './components/Router';
import { AuthProvider } from './context/AuthContext';
import { PaymentGatewayProvider } from './context/PaymentGatewayContext';
import CookieConsent from './components/common/CookieConsent';

function App() {
  return (
    <AuthProvider>
      <PaymentGatewayProvider>
        <Router />
        <CookieConsent />
      </PaymentGatewayProvider>
    </AuthProvider>
  );
}

export default App;