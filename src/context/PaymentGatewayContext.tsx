import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAllPaymentGateways } from '../lib/supabase';

interface PaymentGateway {
  id: string;
  name: string;
  type: string;
  status: string;
  commission_type: string;
  commission_percentage?: number;
  commission_fixed?: number;
  supported_currencies: string[];
  min_amount?: number;
  max_amount?: number;
  description?: string;
}

interface PaymentGatewayContextType {
  gateways: PaymentGateway[];
  loading: boolean;
  error: string | null;
  refreshGateways: () => Promise<void>;
  getActiveGatewaysForCurrency: (currency: string) => PaymentGateway[];
  calculateCommission: (gateway: PaymentGateway, amount: number) => number;
}

const PaymentGatewayContext = createContext<PaymentGatewayContextType | undefined>(undefined);

interface PaymentGatewayProviderProps {
  children: ReactNode;
}

export const PaymentGatewayProvider: React.FC<PaymentGatewayProviderProps> = ({ children }) => {
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGateways = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllPaymentGateways();
      setGateways(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading payment gateways');
      console.error('Error loading payment gateways:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshGateways = async () => {
    await loadGateways();
  };

  const getActiveGatewaysForCurrency = (currency: string): PaymentGateway[] => {
    return gateways.filter(gateway => 
      gateway.status === 'active' && 
      gateway.supported_currencies.includes(currency)
    );
  };

  const calculateCommission = (gateway: PaymentGateway, amount: number): number => {
    switch (gateway.commission_type) {
      case 'percentage':
        return amount * (gateway.commission_percentage || 0) / 100;
      case 'fixed':
        return gateway.commission_fixed || 0;
      case 'mixed':
        const percentageCommission = amount * (gateway.commission_percentage || 0) / 100;
        const fixedCommission = gateway.commission_fixed || 0;
        return percentageCommission + fixedCommission;
      default:
        return 0;
    }
  };

  useEffect(() => {
    loadGateways();
  }, []);

  const value: PaymentGatewayContextType = {
    gateways,
    loading,
    error,
    refreshGateways,
    getActiveGatewaysForCurrency,
    calculateCommission
  };

  return (
    <PaymentGatewayContext.Provider value={value}>
      {children}
    </PaymentGatewayContext.Provider>
  );
};

export const usePaymentGateways = (): PaymentGatewayContextType => {
  const context = useContext(PaymentGatewayContext);
  if (context === undefined) {
    throw new Error('usePaymentGateways must be used within a PaymentGatewayProvider');
  }
  return context;
};

export default PaymentGatewayProvider;