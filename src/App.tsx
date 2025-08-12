import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { PaymentGatewayProvider } from './context/PaymentGatewayContext';
import Router from './components/Router';
import CookieConsent from './components/common/CookieConsent';

function App() {
  console.log('🔍 [App] Component rendering');
  
  return (
    <AuthProvider>
      {console.log('🔍 [App] AuthProvider rendered')}
      <PaymentGatewayProvider>
        {console.log('🔍 [App] PaymentGatewayProvider rendered')}
        <Router />
        <CookieConsent />
      </PaymentGatewayProvider>
    </AuthProvider>
  );
}

export default App;