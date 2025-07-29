import React from 'react';
import Router from './components/Router';
import { AuthProvider } from './context/AuthContext';
import { PaymentGatewayProvider } from './context/PaymentGatewayContext';

function App() {
  return (
    <AuthProvider>
      <PaymentGatewayProvider>
        <Router />
      </PaymentGatewayProvider>
    </AuthProvider>
  );
}

export default App;