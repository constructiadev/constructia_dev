import React, { useState } from 'react';
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

  // Historial de pagos
  const paymentHistory: PaymentHistory[] = [
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
              {currentSubscription.tokens_limit - currentSubscription.tokens_used}
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
                {currentSubscription.storage_used}MB / {currentSubscription.storage_limit}MB
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${getUsageColor(getUsagePercentage(currentSubscription.storage_used, currentSubscription.storage_limit))}`}
                style={{ width: `${getUsagePercentage(currentSubscription.storage_used, currentSubscription.storage_limit)}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Tokens IA</span>
              <span className="text-sm text-gray-600">
                {currentSubscription.tokens_used} / {currentSubscription.tokens_limit}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${getUsageColor(getUsagePercentage(currentSubscription.tokens_used, currentSubscription.tokens_limit))}`}
                style={{ width: `${getUsagePercentage(currentSubscription.tokens_used, currentSubscription.tokens_limit)}%` }}
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
                    {payment.invoice_url && (
                      <button className="text-blue-600 hover:text-blue-800 text-sm">
                        <Download className="h-4 w-4" />
                      </button>
                    )}
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
    </div>
  );
}