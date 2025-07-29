import React, { createContext, useContext, useState, useEffect } from 'react';
import { CreditCard, DollarSign, Building, Smartphone } from 'lucide-react';

interface PaymentGateway {
  id: string;
  name: string;
  type: 'stripe' | 'paypal' | 'sepa' | 'bizum' | 'custom';
  status: 'active' | 'inactive' | 'warning';
  commission_type: 'percentage' | 'fixed' | 'mixed';
  commission_percentage?: number;
  commission_fixed?: number;
  commission_periods: {
    start_date: string;
    end_date: string;
    percentage?: number;
    fixed?: number;
  }[];
  api_key?: string;
  secret_key?: string;
  webhook_url?: string;
  supported_currencies: string[];
  min_amount?: number;
  max_amount?: number;
  description: string;
  logo_base64?: string;
  icon: React.ElementType;
  transactions: number;
  volume: string;
  color: string;
  created_at: string;
  updated_at: string;
}

interface PaymentGatewayContextType {
  gateways: PaymentGateway[];
  activeGateways: PaymentGateway[];
  addGateway: (gateway: Omit<PaymentGateway, 'id' | 'created_at' | 'updated_at'>) => void;
  updateGateway: (id: string, updates: Partial<PaymentGateway>) => void;
  deleteGateway: (id: string) => void;
  getGatewayById: (id: string) => PaymentGateway | undefined;
  getActiveGatewaysForCurrency: (currency: string) => PaymentGateway[];
  calculateCommission: (gatewayId: string, amount: number, date?: string) => number;
}

const PaymentGatewayContext = createContext<PaymentGatewayContextType | undefined>(undefined);

// Logo base64 de ConstructIA
const CONSTRUCTIA_LOGO_BASE64 = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iOCIgZmlsbD0iIzEwYjk4MSIvPgo8cGF0aCBkPSJNOCAxMmg0djhoLTR2LTh6bTYgMGg0djhoLTR2LTh6bTYgMGg0djhoLTR2LTh6IiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K";

export function PaymentGatewayProvider({ children }: { children: React.ReactNode }) {
  const [gateways, setGateways] = useState<PaymentGateway[]>([
    {
      id: 'stripe_main',
      name: 'Stripe',
      type: 'stripe',
      status: 'active',
      commission_type: 'mixed',
      commission_percentage: 2.9,
      commission_fixed: 0.30,
      commission_periods: [
        {
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          percentage: 2.9,
          fixed: 0.30
        }
      ],
      api_key: 'pk_live_...',
      secret_key: 'sk_live_...',
      webhook_url: 'https://api.constructia.com/webhooks/stripe',
      supported_currencies: ['EUR', 'USD'],
      min_amount: 1,
      max_amount: 10000,
      description: 'Pasarela principal para tarjetas de crédito',
      logo_base64: CONSTRUCTIA_LOGO_BASE64,
      icon: CreditCard,
      transactions: 156,
      volume: '€21,450',
      color: 'bg-blue-600',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-27T15:30:00Z'
    },
    {
      id: 'paypal_main',
      name: 'PayPal',
      type: 'paypal',
      status: 'active',
      commission_type: 'mixed',
      commission_percentage: 3.4,
      commission_fixed: 0.35,
      commission_periods: [
        {
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          percentage: 3.4,
          fixed: 0.35
        }
      ],
      api_key: 'paypal_client_id',
      secret_key: 'paypal_secret',
      webhook_url: 'https://api.constructia.com/webhooks/paypal',
      supported_currencies: ['EUR', 'USD'],
      min_amount: 1,
      max_amount: 5000,
      description: 'Pagos con cuenta PayPal',
      logo_base64: CONSTRUCTIA_LOGO_BASE64,
      icon: DollarSign,
      transactions: 89,
      volume: '€13,200',
      color: 'bg-blue-500',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-27T15:30:00Z'
    },
    {
      id: 'sepa_main',
      name: 'SEPA',
      type: 'sepa',
      status: 'active',
      commission_type: 'fixed',
      commission_fixed: 0.50,
      commission_periods: [
        {
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          fixed: 0.50
        }
      ],
      supported_currencies: ['EUR'],
      min_amount: 10,
      max_amount: 50000,
      description: 'Transferencias bancarias SEPA',
      logo_base64: CONSTRUCTIA_LOGO_BASE64,
      icon: Building,
      transactions: 34,
      volume: '€8,900',
      color: 'bg-green-600',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-27T15:30:00Z'
    },
    {
      id: 'bizum_main',
      name: 'Bizum',
      type: 'bizum',
      status: 'warning',
      commission_type: 'percentage',
      commission_percentage: 1.5,
      commission_periods: [
        {
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          percentage: 1.5
        }
      ],
      supported_currencies: ['EUR'],
      min_amount: 0.50,
      max_amount: 1000,
      description: 'Pagos móviles Bizum',
      logo_base64: CONSTRUCTIA_LOGO_BASE64,
      icon: Smartphone,
      transactions: 12,
      volume: '€2,300',
      color: 'bg-orange-600',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-27T15:30:00Z'
    }
  ]);

  const activeGateways = gateways.filter(gateway => gateway.status === 'active');

  const addGateway = (gatewayData: Omit<PaymentGateway, 'id' | 'created_at' | 'updated_at'>) => {
    const newGateway: PaymentGateway = {
      ...gatewayData,
      id: `gateway_${Date.now()}`,
      logo_base64: CONSTRUCTIA_LOGO_BASE64,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setGateways(prev => [...prev, newGateway]);
  };

  const updateGateway = (id: string, updates: Partial<PaymentGateway>) => {
    setGateways(prev => prev.map(gateway => 
      gateway.id === id 
        ? { ...gateway, ...updates, updated_at: new Date().toISOString() }
        : gateway
    ));
  };

  const deleteGateway = (id: string) => {
    setGateways(prev => prev.filter(gateway => gateway.id !== id));
  };

  const getGatewayById = (id: string) => {
    return gateways.find(gateway => gateway.id === id);
  };

  const getActiveGatewaysForCurrency = (currency: string) => {
    return activeGateways.filter(gateway => 
      gateway.supported_currencies.includes(currency)
    );
  };

  const calculateCommission = (gatewayId: string, amount: number, date?: string) => {
    const gateway = getGatewayById(gatewayId);
    if (!gateway) return 0;

    const currentDate = date || new Date().toISOString().split('T')[0];
    
    // Buscar período de comisión aplicable
    const applicablePeriod = gateway.commission_periods.find(period => 
      currentDate >= period.start_date && currentDate <= period.end_date
    );

    if (!applicablePeriod) {
      // Usar comisión base si no hay período específico
      let commission = 0;
      if (gateway.commission_type === 'percentage' || gateway.commission_type === 'mixed') {
        commission += amount * (gateway.commission_percentage || 0) / 100;
      }
      if (gateway.commission_type === 'fixed' || gateway.commission_type === 'mixed') {
        commission += gateway.commission_fixed || 0;
      }
      return commission;
    }

    // Calcular comisión del período específico
    let commission = 0;
    if (applicablePeriod.percentage !== undefined) {
      commission += amount * applicablePeriod.percentage / 100;
    }
    if (applicablePeriod.fixed !== undefined) {
      commission += applicablePeriod.fixed;
    }

    return commission;
  };

  const value = {
    gateways,
    activeGateways,
    addGateway,
    updateGateway,
    deleteGateway,
    getGatewayById,
    getActiveGatewaysForCurrency,
    calculateCommission
  };

  return (
    <PaymentGatewayContext.Provider value={value}>
      {children}
    </PaymentGatewayContext.Provider>
  );
}

export function usePaymentGateways() {
  const context = useContext(PaymentGatewayContext);
  if (context === undefined) {
    throw new Error('usePaymentGateways must be used within a PaymentGatewayProvider');
  }
  return context;
}