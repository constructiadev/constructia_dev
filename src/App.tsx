import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { PaymentGatewayProvider } from './context/PaymentGatewayContext';
import Router from './components/Router';
import CookieConsent from './components/common/CookieConsent';
import './lib/chartSetup';

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