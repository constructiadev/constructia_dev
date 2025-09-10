import React, { useState, useEffect } from 'react';
import { 
  X, 
  CreditCard, 
  Building, 
  Check, 
  AlertCircle, 
  CheckCircle, 
  Lock,
  Euro,
  Calendar,
  User,
  Mail,
  MapPin,
  Phone,
  FileText,
  Shield,
  Zap,
  Star,
  Crown,
  Loader2
} from 'lucide-react';
import { getAllPaymentGateways, createSEPAMandate, getSEPAMandates } from '../../lib/supabase';
import type { PaymentGateway, SEPAMandate, AuthenticatedClient } from '../../types';

interface SubscriptionPlan {
  id: string;
  name: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  storage_gb: number;
  tokens_per_month: number;
  documents_per_month: string;
  support_level: string;
  popular?: boolean;
  color: string;
  icon: React.ElementType;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentClient: AuthenticatedClient;
  onUpgradeSuccess: () => void;
}

export default function CheckoutModal({ 
  isOpen, 
  onClose, 
  currentClient, 
  onUpgradeSuccess 
}: CheckoutModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'stripe' | 'sepa'>('stripe');
  const [paymentGateways, setPaymentGateways] = useState<PaymentGateway[]>([]);
  const [existingSEPAMandate, setExistingSEPAMandate] = useState<SEPAMandate | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showSEPAForm, setShowSEPAForm] = useState(false);
  const [sepaFormData, setSEPAFormData] = useState({
    deudor_nombre: currentClient.name || '',
    deudor_direccion: '',
    deudor_codigo_postal: '',
    deudor_ciudad: '',
    deudor_identificacion: '',
    iban: '',
    bic: '',
    banco_nombre: ''
  });

  const subscriptionPlans: SubscriptionPlan[] = [
    {
      id: 'basic',
      name: 'Básico',
      price_monthly: 29,
      price_yearly: 290,
      features: [
        '500 MB almacenamiento',
        '500 tokens IA',
        '1 proyecto',
        'Soporte email',
        'Integración Obralia'
      ],
      storage_gb: 0.5,
      tokens_per_month: 500,
      documents_per_month: '100',
      support_level: 'Email',
      color: 'border-blue-200 bg-blue-50',
      icon: FileText
    },
    {
      id: 'professional',
      name: 'Profesional',
      price_monthly: 79,
      price_yearly: 790,
      features: [
        '5 GB almacenamiento',
        '2000 tokens IA',
        '10 proyectos',
        'Soporte prioritario',
        'API personalizada',
        'Múltiples integraciones'
      ],
      storage_gb: 5,
      tokens_per_month: 2000,
      documents_per_month: '500',
      support_level: 'Prioritario',
      popular: true,
      color: 'border-green-200 bg-green-50',
      icon: Zap
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price_monthly: 199,
      price_yearly: 1990,
      features: [
        '50 GB almacenamiento',
        '10000 tokens IA',
        'Proyectos ilimitados',
        'Soporte 24/7',
        'IA personalizada',
        'Gestor de cuenta dedicado'
      ],
      storage_gb: 50,
      tokens_per_month: 10000,
      documents_per_month: 'Ilimitados',
      support_level: '24/7',
      color: 'border-purple-200 bg-purple-50',
      icon: Crown
    }
  ];

  useEffect(() => {
    if (isOpen) {
      loadPaymentData();
    }
  }, [isOpen]);

  const loadPaymentData = async () => {
    try {
      setLoading(true);
      const [gateways, sepaData] = await Promise.all([
        getAllPaymentGateways(),
        getSEPAMandates(currentClient.id)
      ]);
      
      setPaymentGateways(gateways.filter(g => g.status === 'active'));
      setExistingSEPAMandate(sepaData.length > 0 ? sepaData[0] : null);
      
      // Pre-select current plan
      const currentPlan = subscriptionPlans.find(p => p.id === currentClient.subscription_plan);
      if (currentPlan) {
        setSelectedPlan(currentPlan);
      }
    } catch (error) {
      console.error('Error loading payment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
  };

  const getPrice = (plan: SubscriptionPlan) => {
    return billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly;
  };

  const getSavings = (plan: SubscriptionPlan) => {
    const yearlyPrice = plan.price_yearly;
    const monthlyYearlyPrice = plan.price_monthly * 12;
    return monthlyYearlyPrice - yearlyPrice;
  };

  const handleSEPAMandateUpdate = async () => {
    if (!selectedPlan) return;

    try {
      setProcessing(true);
      
      // Validate SEPA form
      const requiredFields = ['deudor_nombre', 'deudor_direccion', 'deudor_codigo_postal', 'deudor_ciudad', 'deudor_identificacion', 'iban', 'bic', 'banco_nombre'];
      const missingFields = requiredFields.filter(field => !sepaFormData[field as keyof typeof sepaFormData]);
      
      if (missingFields.length > 0) {
        alert(`Por favor completa los siguientes campos: ${missingFields.join(', ')}`);
        return;
      }

      // Create new SEPA mandate with updated amount
      const mandateData = {
        client_id: currentClient.id,
        deudor_nombre: sepaFormData.deudor_nombre,
        deudor_direccion: sepaFormData.deudor_direccion,
        deudor_codigo_postal: sepaFormData.deudor_codigo_postal,
        deudor_ciudad: sepaFormData.deudor_ciudad,
        deudor_pais: 'España',
        deudor_identificacion: sepaFormData.deudor_identificacion,
        iban: sepaFormData.iban,
        bic: sepaFormData.bic,
        banco_nombre: sepaFormData.banco_nombre,
        tipo_pago: 'recurrente' as const,
        amount: getPrice(selectedPlan),
        currency: 'EUR',
        description: `Suscripción ${selectedPlan.name} - ${billingCycle === 'yearly' ? 'Anual' : 'Mensual'}`,
        fecha_firma: new Date().toISOString(),
        ip_address: '127.0.0.1',
        user_agent: navigator.userAgent,
        session_id: `session_${Date.now()}`,
        status: 'active'
      };

      const mandate = await createSEPAMandate(mandateData);
      
      if (mandate) {
        alert('✅ Mandato SEPA actualizado correctamente. Tu suscripción se actualizará en el próximo ciclo de facturación.');
        onUpgradeSuccess();
      } else {
        throw new Error('Error al crear el mandato SEPA');
      }
    } catch (error) {
      console.error('Error updating SEPA mandate:', error);
      alert('❌ Error al actualizar el mandato SEPA. Por favor, inténtalo de nuevo.');
    } finally {
      setProcessing(false);
    }
  };

  const handleStripePayment = async () => {
    if (!selectedPlan) return;

    try {
      setProcessing(true);
      
      // Simulate Stripe payment process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate success (90% success rate)
      if (Math.random() > 0.1) {
        alert('✅ Pago procesado correctamente. Tu suscripción se ha actualizado.');
        onUpgradeSuccess();
      } else {
        throw new Error('Error en el procesamiento del pago');
      }
    } catch (error) {
      console.error('Error processing Stripe payment:', error);
      alert('❌ Error al procesar el pago. Por favor, inténtalo de nuevo.');
    } finally {
      setProcessing(false);
    }
  };

  const handlePayment = async () => {
    if (selectedPaymentMethod === 'sepa') {
      await handleSEPAMandateUpdate();
    } else {
      await handleStripePayment();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Actualizar Suscripción</h2>
              <p className="text-green-100">Elige tu nuevo plan y método de pago</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Cargando opciones de pago...</p>
          </div>
        ) : (
          <div className="p-6 space-y-8">
            {/* Billing Cycle Toggle */}
            <div className="text-center">
              <div className="inline-flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-6 py-2 rounded-md font-medium transition-colors ${
                    billingCycle === 'monthly' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Mensual
                </button>
                <button
                  onClick={() => setBillingCycle('yearly')}
                  className={`px-6 py-2 rounded-md font-medium transition-colors ${
                    billingCycle === 'yearly' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Anual
                  <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                    Ahorra hasta €200
                  </span>
                </button>
              </div>
            </div>

            {/* Plan Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Selecciona tu Plan</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {subscriptionPlans.map((plan) => {
                  const Icon = plan.icon;
                  const isCurrentPlan = plan.id === currentClient.subscription_plan;
                  const isSelected = selectedPlan?.id === plan.id;
                  
                  return (
                    <div
                      key={plan.id}
                      className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-green-500 bg-green-50' 
                          : isCurrentPlan
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handlePlanSelect(plan)}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                            Más Popular
                          </span>
                        </div>
                      )}
                      
                      {isCurrentPlan && (
                        <div className="absolute -top-3 right-4">
                          <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                            Plan Actual
                          </span>
                        </div>
                      )}

                      <div className="text-center mb-6">
                        <div className={`w-12 h-12 mx-auto mb-4 rounded-lg flex items-center justify-center ${
                          plan.id === 'basic' ? 'bg-blue-100' :
                          plan.id === 'professional' ? 'bg-green-100' : 'bg-purple-100'
                        }`}>
                          <Icon className={`w-6 h-6 ${
                            plan.id === 'basic' ? 'text-blue-600' :
                            plan.id === 'professional' ? 'text-green-600' : 'text-purple-600'
                          }`} />
                        </div>
                        <h4 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h4>
                        <div className="text-3xl font-bold text-gray-900 mb-1">
                          €{getPrice(plan)}
                          <span className="text-lg text-gray-600">/{billingCycle === 'yearly' ? 'año' : 'mes'}</span>
                        </div>
                        {billingCycle === 'yearly' && getSavings(plan) > 0 && (
                          <p className="text-sm text-green-600 font-medium">
                            Ahorras €{getSavings(plan)} al año
                          </p>
                        )}
                      </div>

                      <ul className="space-y-3 mb-6">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-sm">
                            <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {isSelected && (
                        <div className="absolute inset-0 border-2 border-green-500 rounded-xl pointer-events-none">
                          <div className="absolute top-4 right-4">
                            <CheckCircle className="w-6 h-6 text-green-500" />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Payment Method Selection */}
            {selectedPlan && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Método de Pago</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Stripe Payment */}
                  {paymentGateways.some(g => g.type === 'stripe') && (
                    <div
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        selectedPaymentMethod === 'stripe' 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedPaymentMethod('stripe')}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <CreditCard className="w-6 h-6 text-blue-600 mr-3" />
                          <div>
                            <h4 className="font-semibold text-gray-900">Tarjeta de Crédito</h4>
                            <p className="text-sm text-gray-600">Visa, Mastercard, American Express</p>
                          </div>
                        </div>
                        {selectedPaymentMethod === 'stripe' && (
                          <CheckCircle className="w-5 h-5 text-blue-500" />
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        Procesado por Stripe • Pago inmediato • SSL seguro
                      </div>
                    </div>
                  )}

                  {/* SEPA Payment */}
                  {paymentGateways.some(g => g.type === 'sepa') && (
                    <div
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        selectedPaymentMethod === 'sepa' 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedPaymentMethod('sepa')}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <Building className="w-6 h-6 text-green-600 mr-3" />
                          <div>
                            <h4 className="font-semibold text-gray-900">Domiciliación SEPA</h4>
                            <p className="text-sm text-gray-600">Débito directo desde tu cuenta bancaria</p>
                          </div>
                        </div>
                        {selectedPaymentMethod === 'sepa' && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {existingSEPAMandate 
                          ? `Mandato existente: ${existingSEPAMandate.iban.replace(/(.{4})/g, '$1 ').trim().slice(-8)}` 
                          : 'Nuevo mandato SEPA requerido'
                        }
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SEPA Form */}
            {selectedPlan && selectedPaymentMethod === 'sepa' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-green-900">
                    {existingSEPAMandate ? 'Actualizar Mandato SEPA' : 'Nuevo Mandato SEPA'}
                  </h3>
                  <div className="text-sm text-green-700">
                    Nuevo importe: €{getPrice(selectedPlan)}/{billingCycle === 'yearly' ? 'año' : 'mes'}
                  </div>
                </div>

                {existingSEPAMandate && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mr-3" />
                      <div>
                        <h4 className="font-semibold text-yellow-800">Actualización de Mandato Requerida</h4>
                        <p className="text-sm text-yellow-700">
                          El cambio de plan requiere actualizar tu mandato SEPA con el nuevo importe de €{getPrice(selectedPlan)}.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del Titular *
                    </label>
                    <input
                      type="text"
                      value={sepaFormData.deudor_nombre}
                      onChange={(e) => setSEPAFormData(prev => ({ ...prev, deudor_nombre: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="Juan García Martínez"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      DNI/CIF *
                    </label>
                    <input
                      type="text"
                      value={sepaFormData.deudor_identificacion}
                      onChange={(e) => setSEPAFormData(prev => ({ ...prev, deudor_identificacion: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="12345678A"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dirección *
                    </label>
                    <input
                      type="text"
                      value={sepaFormData.deudor_direccion}
                      onChange={(e) => setSEPAFormData(prev => ({ ...prev, deudor_direccion: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="Calle Mayor 123, 1º A"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Código Postal *
                    </label>
                    <input
                      type="text"
                      value={sepaFormData.deudor_codigo_postal}
                      onChange={(e) => setSEPAFormData(prev => ({ ...prev, deudor_codigo_postal: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="28001"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ciudad *
                    </label>
                    <input
                      type="text"
                      value={sepaFormData.deudor_ciudad}
                      onChange={(e) => setSEPAFormData(prev => ({ ...prev, deudor_ciudad: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="Madrid"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      IBAN *
                    </label>
                    <input
                      type="text"
                      value={sepaFormData.iban}
                      onChange={(e) => setSEPAFormData(prev => ({ ...prev, iban: e.target.value.toUpperCase() }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 font-mono"
                      placeholder="ES91 2100 0418 4502 0005 1332"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      BIC/SWIFT *
                    </label>
                    <input
                      type="text"
                      value={sepaFormData.bic}
                      onChange={(e) => setSEPAFormData(prev => ({ ...prev, bic: e.target.value.toUpperCase() }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 font-mono"
                      placeholder="CAIXESBBXXX"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del Banco *
                    </label>
                    <input
                      type="text"
                      value={sepaFormData.banco_nombre}
                      onChange={(e) => setSEPAFormData(prev => ({ ...prev, banco_nombre: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="CaixaBank"
                      required
                    />
                  </div>
                </div>

                {/* SEPA Legal Notice */}
                <div className="mt-6 bg-white border border-green-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <Shield className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-green-900 mb-2">Autorización de Domiciliación SEPA</h4>
                      <p className="text-sm text-green-800 mb-2">
                        Al proceder, autorizas a ConstructIA S.L. (CIF: B87654321) a enviar instrucciones a tu banco 
                        para debitar tu cuenta y a tu banco para debitar tu cuenta de acuerdo con las instrucciones de ConstructIA S.L.
                      </p>
                      <p className="text-xs text-green-700">
                        Como parte de tus derechos, tienes derecho al reembolso por parte de tu banco bajo los términos 
                        y condiciones del acuerdo con tu banco. El reembolso debe ser reclamado dentro de las 8 semanas 
                        a partir de la fecha en que se debitó tu cuenta.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Order Summary */}
            {selectedPlan && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen del Pedido</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Plan seleccionado:</span>
                    <span className="font-medium text-gray-900">{selectedPlan.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ciclo de facturación:</span>
                    <span className="font-medium text-gray-900">
                      {billingCycle === 'yearly' ? 'Anual' : 'Mensual'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Método de pago:</span>
                    <span className="font-medium text-gray-900">
                      {selectedPaymentMethod === 'stripe' ? 'Tarjeta de Crédito' : 'Domiciliación SEPA'}
                    </span>
                  </div>
                  <div className="border-t border-gray-300 pt-3">
                    <div className="flex justify-between text-lg">
                      <span className="font-semibold text-gray-900">Total:</span>
                      <span className="font-bold text-green-600">
                        €{getPrice(selectedPlan)}/{billingCycle === 'yearly' ? 'año' : 'mes'}
                      </span>
                    </div>
                    {billingCycle === 'yearly' && getSavings(selectedPlan) > 0 && (
                      <div className="text-sm text-green-600 text-right">
                        Ahorras €{getSavings(selectedPlan)} al año
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                onClick={onClose}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handlePayment}
                disabled={!selectedPlan || processing || (selectedPaymentMethod === 'sepa' && !sepaFormData.iban)}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5 mr-2" />
                    {selectedPaymentMethod === 'sepa' 
                      ? (existingSEPAMandate ? 'Actualizar Mandato' : 'Crear Mandato SEPA')
                      : 'Proceder al Pago'
                    }
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}