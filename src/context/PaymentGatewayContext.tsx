import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAllPaymentGateways } from '../lib/supabase';
import type { PaymentGateway } from '../types';

interface PaymentGatewayContextType {
  gateways: PaymentGateway[];
  loading: boolean;
  error: string | null;
  refreshGateways: () => Promise<void>;
  getAvailableGateways: (currency: string, amount: number) => PaymentGateway[];
}

const PaymentGatewayContext = createContext<PaymentGatewayContextType | undefined>(undefined);

export const usePaymentGateways = () => {
  const context = useContext(PaymentGatewayContext);
  if (context === undefined) {
    throw new Error('usePaymentGateways must be used within a PaymentGatewayProvider');
  }
  return context;
};

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
      console.error('Error loading payment gateways:', err);
      setError(err instanceof Error ? err.message : 'Error loading payment gateways');
      setGateways([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGateways();
  }, []);

  const refreshGateways = async () => {
    await loadGateways();
  };

  const getAvailableGateways = (currency: string, amount: number): PaymentGateway[] => {
    return gateways.filter(gateway => {
      const supportsCurrency = gateway.supported_currencies.includes(currency);
      const withinLimits = amount >= (gateway.min_amount || 0) && 
                          amount <= (gateway.max_amount || Infinity);
      const isActive = gateway.status === 'active';
      
      return supportsCurrency && withinLimits && isActive;
    });
  };

  const value = {
    gateways,
    loading,
    error,
    refreshGateways,
    getAvailableGateways
  };

  return (
    <PaymentGatewayContext.Provider value={value}>
      {children}
    </PaymentGatewayContext.Provider>
  );
};