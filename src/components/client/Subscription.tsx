import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getCurrentClientData, createReceipt, sendReceiptByEmail } from '../../lib/supabase';
import { Client as ClientData } from '../../types';
import SEPAMandateForm from './SEPAMandateForm';
import PaymentMethodSelector from './PaymentMethodSelector';
import ReceiptGenerator from '../common/ReceiptGenerator';
import { 
  CreditCard, 
  Package, 
  Calendar,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Download,
  Settings,
  HardDrive,
  Zap,
  FileText,
  Clock,
  Euro,
  Crown,
  Star,
  Shield
} from 'lucide-react';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  period: 'monthly' | 'yearly';
  features: string[];
  storage: string;
  tokens: number;
  documents: string;
  support: string;
  popular?: boolean;
}

interface PaymentHistory {
  id: string;
  date: string;
  amount: number;
  description: string;
  status: 'paid' | 'pending' | 'failed';
  invoice_url?: string;
}

export default function Subscription() {
  const [currentPlan] = useState('professional');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [showStorageModal, setShowStorageModal] = useState(false);
  const [selectedTokenPackage, setSelectedTokenPackage] = useState('');
  const [selectedStoragePackage, setSelectedStoragePackage] = useState('');
  const [showPaymentSelector, setShowPaymentSelector] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [tokensAvailable, setTokensAvailable] = useState(450);
  const [storageUsed, setStorageUsed] = useState(850);
  const [storageLimit, setStorageLimit] = useState(1000);
  const [paymentReceipts, setPaymentReceipts] = useState<{[key: string]: any}>({});
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([
    {
      id: '1',
      date: '2024-01-27',
      amount: 149,
      description: 'Plan Profesional - Enero 2024',
      status: 'paid',
      invoice_url: '#'
    },
    {
      id: '2',
      date: '2023-12-27',
      amount: 149,
      description: 'Plan Profesional - Diciembre 2023',
      status: 'paid',
      invoice_url: '#'
    },
    {
      id: '3',
      date: '2023-11-27',
      amount: 149,
      description: 'Plan Profesional - Noviembre 2023',
      status: 'paid',
      invoice_url: '#'
    },
    {
      id: '4',
      date: '2023-10-27',
      amount: 149,
      description: 'Plan Profesional - Octubre 2023',
      status: 'paid',
      invoice_url: '#'
    }
  ]);
  const { user } = useAuth();

  // Auto-seleccionar el paquete popular cuando se abre el modal
  useEffect(() => {
    if (showTokenModal && !selectedTokenPackage) {
      const popularPackage = tokenPackages.find(p => p.popular);
      if (popularPackage) {
        setSelectedTokenPackage(popularPackage.id);
      }
    }
  }, [showTokenModal]);

  useEffect(() => {
    if (showStorageModal && !selectedStoragePackage) {
      setSelectedStoragePackage(storagePackages[0].id);
    }
  }, [showStorageModal]);
  // Cargar datos del cliente al montar el componente
  useEffect(() => {
    const loadClientData = async () => {
      let data = null;
      
      if (user?.id) {
        try {
          data = await getCurrentClientData(user.id);
          
          // Si no hay datos del cliente, usar datos simulados para desarrollo
          if (!data) {
            const mockClientData = {
              id: 'mock-client-id',
              client_id: '2024-REC-0001',
              user_id: user.id,
              company_name: 'Construcciones García S.L.',
              contact_name: 'Juan García Martínez',
              email: user.email || 'juan@construccionesgarcia.com',
              phone: '+34 91 123 45 67',
              address: 'Calle Mayor 123, 28001 Madrid',
              subscription_plan: 'professional',
              subscription_status: 'active',
              storage_used: 850,
              storage_limit: 1000,
              documents_processed: 127,
              tokens_available: 450,
              obralia_credentials: {
                username: 'juan_garcia',
                password: 'encrypted_password',
                configured: true
              },
              created_at: '2024-01-15T00:00:00Z',
              updated_at: new Date().toISOString()
            };
            setClientData(mockClientData);
          } else {
            setClientData(data);
          }
        } catch (error) {
          console.error('Error loading client data:', error);
          // En caso de error, usar datos simulados para desarrollo
          const mockClientData = {
            id: 'mock-client-id',
            client_id: '2024-REC-0001',
            user_id: user?.id || 'mock-user-id',
            company_name: 'Construcciones García S.L.',
            contact_name: 'Juan García Martínez',
            email: user?.email || 'juan@construccionesgarcia.com',
            phone: '+34 91 123 45 67',
            address: 'Calle Mayor 123, 28001 Madrid',
            subscription_plan: 'professional',
            subscription_status: 'active',
            storage_used: 850,
            storage_limit: 1000,
            documents_processed: 127,
            tokens_available: 450,
            obralia_credentials: {
              username: 'juan_garcia',
              password: 'encrypted_password',
              configured: true
            },
            created_at: '2024-01-15T00:00:00Z',
            updated_at: new Date().toISOString()
          };
          setClientData(mockClientData);
        }
      }
      
      // Inicializar estados locales con datos del cliente
      if (data) {
        setTokensAvailable(data.tokens_available || 450);
        setStorageUsed(data.storage_used || 850);
        setStorageLimit(data.storage_limit || 1000);
      }
    };

    loadClientData();
  }, [user?.id]);

  // Plan actual del cliente
  const currentSubscription = {
    plan: 'Profesional',
    status: 'active',
    next_billing: '2024-02-27',
    amount: 149,
    storage_used: 850,
    storage_limit: 1000,
    tokens_used: 550,
    tokens_limit: 1000,
    documents_processed: 127,
    documents_limit: 500
  };

  // Paquetes de tokens disponibles
  const tokenPackages = [
    {
      id: 'tokens_500',
      name: 'Paquete Básico',
      tokens: 500,
      price: 29,
      description: 'Ideal para uso ocasional',
      popular: false
    },
    {
      id: 'tokens_1500',
      name: 'Paquete Profesional',
      tokens: 1500,
      price: 79,
      description: 'Perfecto para uso regular',
      popular: true
    },
    {
      id: 'tokens_5000',
      name: 'Paquete Empresarial',
      tokens: 5000,
      price: 199,
      description: 'Para uso intensivo',
      popular: false
    }
  ];

  // Paquetes de almacenamiento adicional
  const storagePackages = [
    {
      id: 'storage_1gb',
      name: '+1GB Adicional',
      storage: '1GB',
      price: 9.99,
      description: 'Ampliación mensual'
    },
    {
      id: 'storage_5gb',
      name: '+5GB Adicional',
      storage: '5GB',
      price: 39.99,
      description: 'Ampliación mensual'
    },
    {
      id: 'storage_10gb',
      name: '+10GB Adicional',
      storage: '10GB',
      price: 69.99,
      description: 'Ampliación mensual'
    }
  ];

  // Planes disponibles
  const subscriptionPlans: SubscriptionPlan[] = [
    {
      id: 'basic',
      name: 'Básico',
      price: billingPeriod === 'monthly' ? 59 : 590,
      period: billingPeriod,
      features: [
        'Hasta 100 documentos/mes',
        '500MB de almacenamiento',
        'Clasificación IA básica',
        'Integración Obralia',
        'Soporte por email'
      ],
      storage: '500MB',
      tokens: 500,
      documents: '100/mes',
      support: 'Email'
    },
    {
      id: 'professional',
      name: 'Profesional',
      price: billingPeriod === 'monthly' ? 149 : 1490,
      period: billingPeriod,
      features: [
        'Hasta 500 documentos/mes',
        '1GB de almacenamiento',
        'IA avanzada con 95% precisión',
        'Integración Obralia completa',
        'Dashboard personalizado',
        'Soporte prioritario'
      ],
      storage: '1GB',
      tokens: 1000,
      documents: '500/mes',
      support: 'Prioritario',
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Empresarial',
      price: billingPeriod === 'monthly' ? 299 : 2990,
      period: billingPeriod,
      features: [
        'Documentos ilimitados',
        '5GB de almacenamiento',
        'IA premium con análisis predictivo',
        'API personalizada',
        'Múltiples usuarios',
        'Soporte 24/7'
      ],
      storage: '5GB',
      tokens: 5000,
      documents: 'Ilimitados',
      support: '24/7'
    },
    {
      id: 'custom',
      name: 'Personalizado',
      price: 499,
      period: billingPeriod,
      features: [
        'Solución a medida',
        'Almacenamiento personalizado',
        'Integraciones específicas',
        'Entrenamiento IA personalizado',
        'Gestor de cuenta dedicado',
        'SLA garantizado'
      ],
      storage: 'Personalizado',
      tokens: 10000,
      documents: 'Sin límite',
      support: 'Dedicado'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUsagePercentage = (used: number, limit: number) => {
    return Math.round((used / limit) * 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const purchaseTokens = async () => {
    const selectedPackage = tokenPackages.find(p => p.id === selectedTokenPackage);
    if (!selectedPackage) return;

    // Verificar que tenemos datos del cliente
    if (!clientData) {
      alert('No se pudieron cargar los datos del cliente. Por favor, recarga la página e intenta nuevamente.');
      return;
    }
    
    setLoading(true);
    try {
      // Simular procesamiento de pago
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Crear recibo simulado con estructura completa
      const receipt = {
        id: `receipt_${Date.now()}`,
        receipt_number: `REC-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`,
        client_id: clientData.client_id,
        client_name: clientData.company_name,
        client_email: clientData.email,
        client_address: clientData.address,
        client_tax_id: 'B12345678',
        amount: selectedPackage.price,
        gross_amount: selectedPackage.price * 1.21,
        commission: selectedPackage.price * 0.029 + 0.30,
        currency: 'EUR',
        payment_method: 'Tarjeta de Crédito',
        gateway_name: 'Stripe',
        description: `Compra de Tokens - ${selectedPackage.name}`,
        payment_date: new Date().toISOString(),
        status: 'paid' as const,
        transaction_id: `txn_tokens_${Date.now()}`,
        invoice_items: [{
          description: `${selectedPackage.name} - ${selectedPackage.tokens.toLocaleString()} Tokens IA`,
          quantity: 1,
          unit_price: selectedPackage.price / 1.21,
          total: selectedPackage.price / 1.21
        }],
        tax_details: {
          base: selectedPackage.price / 1.21,
          iva_rate: 21,
          iva_amount: selectedPackage.price - (selectedPackage.price / 1.21),
          total: selectedPackage.price
        },
        company_details: {
          name: 'ConstructIA S.L.',
          address: 'Calle Innovación 123, 28001 Madrid, España',
          tax_id: 'B87654321',
          phone: '+34 91 000 00 00',
          email: 'facturacion@constructia.com',
          website: 'www.constructia.com'
        }
      };
      
      // Simular envío de email
      console.log(`Recibo ${receipt.receipt_number} enviado a ${clientData.email}`);
      
      // Mostrar recibo en pantalla
      setSelectedReceipt(receipt);
      setShowReceiptModal(true);
      
      // Actualizar tokens disponibles localmente
      setTokensAvailable(prev => prev + selectedPackage.tokens);
      
      // Agregar al historial de pagos
      const newPayment: PaymentHistory = {
        id: `payment_${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        amount: selectedPackage.price,
        description: `Compra de Tokens - ${selectedPackage.name}`,
        status: 'paid',
        invoice_url: '#'
      };
      setPaymentHistory(prev => [newPayment, ...prev]);
      
      // Guardar el recibo para poder descargarlo después
      setPaymentReceipts(prev => ({
        ...prev,
        [newPayment.id]: receipt
      }));
      
      setShowTokenModal(false);
      setSelectedTokenPackage('');
      
      // No mostrar alert aquí, el modal del recibo ya indica el éxito
    } catch (error) {
      console.error('Error purchasing tokens:', error);
      alert('Error al procesar la compra. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const purchaseStorage = async () => {
    const selectedPackage = storagePackages.find(p => p.id === selectedStoragePackage);
    if (!selectedPackage) return;

    // Verificar que tenemos datos del cliente
    if (!clientData) {
      alert('No se pudieron cargar los datos del cliente. Por favor, recarga la página e intenta nuevamente.');
      return;
    }
    
    setLoading(true);
    try {
      // Simular procesamiento de pago
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Crear recibo simulado con estructura completa
      const receipt = {
        id: `receipt_${Date.now()}`,
        receipt_number: `REC-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`,
        client_id: clientData.client_id,
        client_name: clientData.company_name,
        client_email: clientData.email,
        client_address: clientData.address,
        client_tax_id: 'B12345678',
        amount: selectedPackage.price,
        gross_amount: selectedPackage.price * 1.21,
        commission: selectedPackage.price * 0.029 + 0.30,
        currency: 'EUR',
        payment_method: 'Tarjeta de Crédito',
        gateway_name: 'Stripe',
        description: `Ampliación de Almacenamiento - ${selectedPackage.name}`,
        payment_date: new Date().toISOString(),
        status: 'paid' as const,
        transaction_id: `txn_storage_${Date.now()}`,
        invoice_items: [{
          description: `${selectedPackage.name} - Ampliación mensual`,
          quantity: 1,
          unit_price: selectedPackage.price / 1.21,
          total: selectedPackage.price / 1.21
        }],
        tax_details: {
          base: selectedPackage.price / 1.21,
          iva_rate: 21,
          iva_amount: selectedPackage.price - (selectedPackage.price / 1.21),
          total: selectedPackage.price
        },
        company_details: {
          name: 'ConstructIA S.L.',
          address: 'Calle Innovación 123, 28001 Madrid, España',
          tax_id: 'B87654321',
          phone: '+34 91 000 00 00',
          email: 'facturacion@constructia.com',
          website: 'www.constructia.com'
        }
      };
      
      // Simular envío de email
      console.log(`Recibo ${receipt.receipt_number} enviado a ${clientData.email}`);
      
      // Mostrar recibo en pantalla
      setSelectedReceipt(receipt);
      setShowReceiptModal(true);
      
      // Actualizar almacenamiento localmente
      const storageValue = parseInt(selectedPackage.storage.replace(/[^\d]/g, ''));
      const additionalStorage = storageValue * 1024; // Convert GB to MB
      console.log(`Agregando ${storageValue}GB (${additionalStorage}MB) al límite actual de ${storageLimit}MB`);
      setStorageLimit(prev => prev + additionalStorage);
      
      // Agregar al historial de pagos
      const newPayment: PaymentHistory = {
        id: `payment_${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        amount: selectedPackage.price,
        description: `Ampliación de Almacenamiento - ${selectedPackage.name}`,
        status: 'paid',
        invoice_url: '#'
      };
      setPaymentHistory(prev => [newPayment, ...prev]);
      
      // Guardar el recibo para poder descargarlo después
      setPaymentReceipts(prev => ({
        ...prev,
        [newPayment.id]: receipt
      }));
      
      setShowStorageModal(false);
      setSelectedStoragePackage('');
      
      alert('¡Almacenamiento ampliado exitosamente! El recibo se ha enviado por email.');
    } catch (error) {
      console.error('Error purchasing storage:', error);
      alert('Error al procesar la compra. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handlePlanUpgrade = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setShowPaymentSelector(true);
  };

  const handlePaymentMethodSelected = (gatewayId: string) => {
    console.log('Método de pago seleccionado:', gatewayId);
    setShowPaymentSelector(false);
    
    if (selectedPlan) {
      // Crear recibo para cambio de plan
      const createPlanChangeReceipt = async () => {
        try {
          if (!clientData) {
            alert('No se pudieron cargar los datos del cliente. Por favor, recarga la página e intenta nuevamente.');
            return;
          }
          
          // Crear recibo simulado con estructura completa
          const receipt = {
            id: `receipt_${Date.now()}`,
            receipt_number: `REC-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`,
            client_id: clientData.client_id,
            client_name: clientData.company_name,
            client_email: clientData.email,
            client_address: clientData.address,
            client_tax_id: 'B12345678',
            amount: selectedPlan.price,
            gross_amount: selectedPlan.price * 1.21,
            commission: selectedPlan.price * 0.029 + 0.30,
            currency: 'EUR',
            payment_method: gatewayId === 'stripe_main' ? 'Tarjeta de Crédito' : 
                           gatewayId === 'paypal_main' ? 'PayPal' :
                           gatewayId === 'sepa_main' ? 'Transferencia SEPA' : 'Bizum',
            gateway_name: gatewayId === 'stripe_main' ? 'Stripe' : 
                         gatewayId === 'paypal_main' ? 'PayPal' :
                         gatewayId === 'sepa_main' ? 'SEPA' : 'Bizum',
            description: `Cambio a Plan ${selectedPlan.name} - ${new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`,
            payment_date: new Date().toISOString(),
            status: 'paid' as const,
            transaction_id: `txn_plan_${Date.now()}`,
            invoice_items: [{
              description: `Plan ${selectedPlan.name} ConstructIA - ${new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`,
              quantity: 1,
              unit_price: selectedPlan.price / 1.21,
              total: selectedPlan.price / 1.21
            }],
            tax_details: {
              base: selectedPlan.price / 1.21,
              iva_rate: 21,
              iva_amount: selectedPlan.price - (selectedPlan.price / 1.21),
              total: selectedPlan.price
            },
            company_details: {
              name: 'ConstructIA S.L.',
              address: 'Calle Innovación 123, 28001 Madrid, España',
              tax_id: 'B87654321',
              phone: '+34 91 000 00 00',
              email: 'facturacion@constructia.com',
              website: 'www.constructia.com'
            }
          };
          
          // Simular envío de email
          console.log(`Recibo ${receipt.receipt_number} enviado a ${clientData.email}`);
          
          // Agregar al historial de pagos
          const newPayment: PaymentHistory = {
            id: `payment_${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            amount: selectedPlan.price,
            description: `Cambio a Plan ${selectedPlan.name} - ${new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`,
            status: 'paid',
            invoice_url: '#'
          };
          setPaymentHistory(prev => [newPayment, ...prev]);
          
          // Guardar el recibo para poder descargarlo después
          setPaymentReceipts(prev => ({
            ...prev,
            [newPayment.id]: receipt
          }));
          
          setSelectedReceipt(receipt);
          setShowReceiptModal(true);
          
          alert('¡Plan actualizado exitosamente! El recibo se ha enviado por email.');
          
        } catch (error) {
          console.error('Error creating plan change receipt:', error);
          alert('Error al procesar el cambio de plan. Intenta nuevamente.');
        }
      };
      
      createPlanChangeReceipt();
    }
  };

  const downloadReceiptFromHistory = (paymentId: string) => {
    const receipt = paymentReceipts[paymentId];
    if (receipt) {
      // Crear una instancia temporal del ReceiptGenerator para generar el PDF
      setSelectedReceipt(receipt);
      setShowReceiptModal(true);
    } else {
      alert('Recibo no disponible para descarga');
    }
  };

  const TokenPurchaseModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Comprar Tokens de Servicio</h3>
          <button
            onClick={() => setShowTokenModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">¿Qué son los tokens?</h4>
          <p className="text-sm text-blue-700">
            Los tokens se utilizan para el procesamiento de documentos con IA. Cada documento consume tokens según su complejidad. 
            Esta es una compra única, no recurrente.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {tokenPackages.map((pkg) => (
            <div 
              key={pkg.id}
              className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all ${
                selectedTokenPackage === pkg.id
                  ? 'border-green-500 bg-green-50'
                  : pkg.popular
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedTokenPackage(pkg.id)}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Más Popular
                  </span>
                </div>
              )}
              
              <div className="text-center">
                <h4 className="text-lg font-semibold text-gray-800 mb-2">{pkg.name}</h4>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-gray-900">€{pkg.price}</span>
                  <span className="text-gray-600 ml-1">una vez</span>
                </div>
                <div className="mb-4">
                  <span className="text-2xl font-bold text-green-600">{pkg.tokens.toLocaleString()}</span>
                  <span className="text-gray-600 ml-1">tokens</span>
                </div>
                <p className="text-sm text-gray-600">{pkg.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setShowTokenModal(false)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={purchaseTokens}
            disabled={!selectedTokenPackage}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Comprar Tokens
          </button>
        </div>
      </div>
    </div>
  );

  const StoragePurchaseModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Ampliar Almacenamiento</h3>
          <button
            onClick={() => setShowStorageModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <h4 className="font-semibold text-orange-800 mb-2">Almacenamiento Adicional</h4>
          <p className="text-sm text-orange-700">
            Amplía tu capacidad de almacenamiento mensualmente. El cargo se añadirá a tu facturación recurrente.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {storagePackages.map((pkg) => (
            <div 
              key={pkg.id}
              className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
                selectedStoragePackage === pkg.id
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedStoragePackage(pkg.id)}
            >
              <div className="text-center">
                <h4 className="text-lg font-semibold text-gray-800 mb-2">{pkg.name}</h4>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-gray-900">€{pkg.price}</span>
                  <span className="text-gray-600 ml-1">/mes</span>
                </div>
                <div className="mb-4">
                  <span className="text-2xl font-bold text-blue-600">{pkg.storage}</span>
                  <span className="text-gray-600 ml-1">adicional</span>
                </div>
                <p className="text-sm text-gray-600">{pkg.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setShowStorageModal(false)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={purchaseStorage}
            disabled={!selectedStoragePackage}
            className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Ampliar Almacenamiento
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Mi Suscripción</h2>
        <p className="text-gray-600">Gestiona tu plan y facturación</p>
      </div>

      {/* Estado Actual de la Suscripción */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Plan Actual</h3>
          <div className="flex items-center">
            <Crown className="h-5 w-5 text-yellow-500 mr-2" />
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentSubscription.status)}`}>
              {currentSubscription.status === 'active' ? 'Activo' : currentSubscription.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Package className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-blue-800">Plan</p>
            <p className="text-xl font-bold text-blue-600">{currentSubscription.plan}</p>
            <p className="text-xs text-blue-700">€{currentSubscription.amount}/mes</p>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Calendar className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-green-800">Próximo Cobro</p>
            <p className="text-lg font-bold text-green-600">
              {new Date(currentSubscription.next_billing).toLocaleDateString()}
            </p>
            <p className="text-xs text-green-700">Renovación automática</p>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <HardDrive className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-purple-800">Almacenamiento</p>
            <p className="text-lg font-bold text-purple-600">
              {getUsagePercentage(currentSubscription.storage_used, currentSubscription.storage_limit)}%
            </p>
            <p className="text-xs text-purple-700">
              {currentSubscription.storage_used}MB / {currentSubscription.storage_limit}MB
            </p>
          </div>

          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <Zap className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-orange-800">Tokens IA</p>
            <p className="text-lg font-bold text-orange-600">
              {tokensAvailable}
            </p>
            <p className="text-xs text-orange-700">Disponibles</p>
          </div>
        </div>

        {/* Barras de Uso */}
        <div className="mt-6 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Almacenamiento</span>
              <span className="text-sm text-gray-600">
                {storageUsed}MB / {storageLimit}MB
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${getUsageColor(getUsagePercentage(storageUsed, storageLimit))}`}
                style={{ width: `${getUsagePercentage(storageUsed, storageLimit)}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Tokens IA</span>
              <span className="text-sm text-gray-600">
                {1000 - tokensAvailable} / 1000
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${getUsageColor(getUsagePercentage(1000 - tokensAvailable, 1000))}`}
                style={{ width: `${getUsagePercentage(1000 - tokensAvailable, 1000)}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Documentos procesados</span>
              <span className="text-sm text-gray-600">
                {currentSubscription.documents_processed} / {currentSubscription.documents_limit}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${getUsageColor(getUsagePercentage(currentSubscription.documents_processed, currentSubscription.documents_limit))}`}
                style={{ width: `${getUsagePercentage(currentSubscription.documents_processed, currentSubscription.documents_limit)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Compra de Tokens y Almacenamiento */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Servicios Adicionales</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="bg-green-100 p-2 rounded-lg mr-3">
                  <Zap className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Tokens de Servicio</h4>
                  <p className="text-sm text-gray-600">Para procesamiento de documentos con IA</p>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Tokens disponibles:</span>
                <span className="font-medium">{tokensAvailable}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getUsageColor(getUsagePercentage(1000 - tokensAvailable, 1000))}`}
                  style={{ width: `${getUsagePercentage(1000 - tokensAvailable, 1000)}%` }}
                ></div>
              </div>
            </div>
            
            <button
              onClick={() => setShowTokenModal(true)}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Comprar Tokens
            </button>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <HardDrive className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Almacenamiento Adicional</h4>
                  <p className="text-sm text-gray-600">Amplía tu capacidad de almacenamiento</p>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Almacenamiento usado:</span>
                <span className="font-medium">{storageUsed}MB / {storageLimit}MB</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getUsageColor(getUsagePercentage(storageUsed, storageLimit))}`}
                  style={{ width: `${getUsagePercentage(storageUsed, storageLimit)}%` }}
                ></div>
              </div>
            </div>
            
            <button
              onClick={() => setShowStorageModal(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Ampliar Almacenamiento
            </button>
          </div>
        </div>
      </div>

      {/* Planes Disponibles */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Cambiar Plan</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Facturación:</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  billingPeriod === 'monthly' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Mensual
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  billingPeriod === 'yearly' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Anual
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {subscriptionPlans.map((plan) => (
            <div 
              key={plan.id} 
              className={`relative rounded-xl border-2 p-6 ${
                plan.popular 
                  ? 'border-green-500 bg-green-50' 
                  : currentPlan === plan.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center">
                    <Star className="h-3 w-3 mr-1" />
                    Más Popular
                  </span>
                </div>
              )}

              {currentPlan === plan.id && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Plan Actual
                  </span>
                </div>
              )}

              <div className="text-center mb-4">
                <h4 className="text-lg font-semibold text-gray-800">{plan.name}</h4>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-gray-900">€{plan.price}</span>
                  <span className="text-gray-600">/{plan.period === 'monthly' ? 'mes' : 'año'}</span>
                </div>
                {billingPeriod === 'yearly' && (
                  <p className="text-sm text-green-600 mt-1">Ahorra 2 meses</p>
                )}
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm">
                  <FileText className="h-4 w-4 text-gray-400 mr-2" />
                  <span>{plan.documents}</span>
                </div>
                <div className="flex items-center text-sm">
                  <HardDrive className="h-4 w-4 text-gray-400 mr-2" />
                  <span>{plan.storage}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Zap className="h-4 w-4 text-gray-400 mr-2" />
                  <span>{plan.tokens} tokens IA</span>
                </div>
                <div className="flex items-center text-sm">
                  <Shield className="h-4 w-4 text-gray-400 mr-2" />
                  <span>Soporte {plan.support}</span>
                </div>
              </div>

              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button 
                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                  currentPlan === plan.id
                    ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                    : plan.popular
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
                disabled={currentPlan === plan.id}
                onClick={() => currentPlan !== plan.id && handlePlanUpgrade(plan)}
              >
                {currentPlan === plan.id ? 'Plan Actual' : 'Cambiar Plan'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Historial de Pagos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Historial de Pagos</h3>
          <button className="flex items-center px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Importe</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paymentHistory.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {new Date(payment.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{payment.description}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">€{payment.amount}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                      {payment.status === 'paid' ? 'Pagado' : payment.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button 
                      onClick={() => downloadReceiptFromHistory(payment.id)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                      title="Descargar recibo"
                    >
                        <Download className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Configuración de Facturación */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Configuración de Facturación</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-800 mb-3">Método de Pago</h4>
            <div className="flex items-center p-4 border border-gray-200 rounded-lg">
              <CreditCard className="h-6 w-6 text-gray-400 mr-3" />
              <div className="flex-1">
                <p className="font-medium text-gray-800">•••• •••• •••• 4242</p>
                <p className="text-sm text-gray-600">Visa que expira 12/2025</p>
              </div>
              <button className="text-blue-600 hover:text-blue-800">
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-800 mb-3">Dirección de Facturación</h4>
            <div className="p-4 border border-gray-200 rounded-lg">
              <p className="font-medium text-gray-800">Construcciones García S.L.</p>
              <p className="text-sm text-gray-600">Calle Mayor 123</p>
              <p className="text-sm text-gray-600">28001 Madrid, España</p>
              <p className="text-sm text-gray-600">CIF: B12345678</p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-800">Renovación Automática</h4>
              <p className="text-sm text-gray-600">Tu suscripción se renovará automáticamente</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Modales */}
      {showTokenModal && <TokenPurchaseModal />}
      {showStorageModal && <StoragePurchaseModal />}
      
      {/* Selector de Método de Pago */}
      {showPaymentSelector && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800">
                Seleccionar Método de Pago - {selectedPlan.name}
              </h3>
              <button
                onClick={() => setShowPaymentSelector(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <PaymentMethodSelector
              amount={selectedPlan.price}
              currency="EUR"
              onSelect={handlePaymentMethodSelected}
            />
          </div>
        </div>
      )}

      {/* Modal de Recibo */}
      {showReceiptModal && selectedReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 bg-green-50">
              <div className="flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-green-800">¡Compra Completada!</h3>
                  <p className="text-green-700">Tu recibo ha sido enviado por email</p>
                </div>
              </div>
            </div>
            <ReceiptGenerator
              receiptData={selectedReceipt}
              onEmailSent={() => {
                alert('Recibo reenviado exitosamente');
              }}
              showActions={true}
            />
            <div className="p-4 border-t border-gray-200 text-center">
              <button
                onClick={() => setShowReceiptModal(false)}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}