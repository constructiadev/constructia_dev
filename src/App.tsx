import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PaymentGatewayProvider } from './context/PaymentGatewayContext';
import Router from './components/Router';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PaymentGatewayProvider>
          <Router />
        </PaymentGatewayProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;