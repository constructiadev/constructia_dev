import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
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
  Loader2,
  ArrowRight,
  X
} from 'lucide-react';
import { getAllPaymentGateways, createSEPAMandate } from '../../lib/supabase';
import { supabaseServiceClient } from '../../lib/supabase-real';
import { useAuth } from '../../lib/auth-context';
import Logo from '../common/Logo';
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

export default function ClientCheckout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, checkSession } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'stripe' | 'sepa'>('stripe');
  const [paymentGateways, setPaymentGateways] = useState<PaymentGateway[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [sepaFormData, setSEPAFormData] = useState({
    deudor_nombre: '',
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
    // Verificar que el usuario viene del registro
    const fromRegistration = location.state?.fromRegistration;
    const clientData = location.state?.clientData;

    if (!fromRegistration || !clientData) {
      console.log('❌ [ClientCheckout] Access denied - not from registration');
      navigate('/landing', { replace: true });
      return;
    }

    // Pre-seleccionar plan profesional como recomendado
    const professionalPlan = subscriptionPlans.find(p => p.id === 'professional');
    if (professionalPlan) {
      setSelectedPlan(professionalPlan);
    }

    // Pre-llenar datos SEPA con información del cliente
    if (clientData) {
      setSEPAFormData(prev => ({
        ...prev,
        deudor_nombre: clientData.name || '',
        deudor_direccion: clientData.address || '',
        deudor_codigo_postal: clientData.postal_code || '',
        deudor_ciudad: clientData.city || '',
        deudor_identificacion: clientData.cif_nif || ''
      }));
    }

    loadPaymentData();
  }, [location.state, navigate]);

  const loadPaymentData = async () => {
    try {
      setLoading(true);
      const gateways = await getAllPaymentGateways();
      setPaymentGateways(gateways.filter(g => g.status === 'active'));
    } catch (error) {
      console.error('Error loading payment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPrice = (plan: SubscriptionPlan) => {
    return billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly;
  };

  const getSavings = (plan: SubscriptionPlan) => {
    const yearlyPrice = plan.price_yearly;
    const monthlyYearlyPrice = plan.price_monthly * 12;
    return monthlyYearlyPrice - yearlyPrice;
  };

  const handlePaymentComplete = async () => {
    if (!selectedPlan) return;

    try {
      setProcessing(true);
      
      console.log('💳 [ClientCheckout] Processing payment for plan:', selectedPlan.name);
      
      // Simular procesamiento de pago
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Simular éxito del pago (95% éxito)
      if (Math.random() > 0.05) {
        console.log('✅ [ClientCheckout] Payment successful - activating client account');
        
        // CRITICAL: Update client subscription status from trial to active
        if (user?.tenant_id) {
          try {
            const { error: updateError } = await supabaseServiceClient
              .from('suscripciones')
              .update({
                plan: selectedPlan.id === 'basic' ? 'Starter' : 
                      selectedPlan.id === 'professional' ? 'Autonomo' : 'Empresas',
                estado: 'activa',
                limites: {
                  max_obras: selectedPlan.id === 'basic' ? 1 : 
                           selectedPlan.id === 'professional' ? 10 : 999,
                  max_trabajadores: selectedPlan.id === 'basic' ? 10 : 
                                   selectedPlan.id === 'professional' ? 100 : 9999,
                  max_documentos: selectedPlan.id === 'basic' ? 100 : 
                                 selectedPlan.id === 'professional' ? 500 : 99999,
                  storage_gb: selectedPlan.storage_gb
                },
                updated_at: new Date().toISOString()
              })
              .eq('tenant_id', user.tenant_id);

            if (updateError) {
              console.error('❌ [ClientCheckout] Error updating subscription:', updateError);
            } else {
              console.log('✅ [ClientCheckout] Subscription activated successfully');
            }
          } catch (subscriptionError) {
            console.error('❌ [ClientCheckout] Error activating subscription:', subscriptionError);
          }
        }
        
        // CRITICAL: Force auth context refresh to update subscription status
        await checkSession();
        
        // Show success message
        const paymentMethodText = selectedPaymentMethod === 'stripe' ? 'tarjeta de crédito' :
                                 selectedPaymentMethod === 'paypal' ? 'PayPal' :
                                 selectedPaymentMethod === 'bizum' ? 'Bizum' :
                                 selectedPaymentMethod === 'sepa' ? 'SEPA' : 'método seleccionado';
        
        alert(`✅ ¡Pago con ${paymentMethodText} completado! Tu plan ${selectedPlan.name} está activo. Bienvenido a ConstructIA.`);
        
        // CRITICAL: Navigate to client dashboard after successful payment
        navigate('/client/dashboard', { replace: true });
        
      } else {
        throw new Error('Error en el procesamiento del pago');
      }
    } catch (error) {
      console.error('❌ [ClientCheckout] Payment error:', error);
      alert('❌ Error al procesar el pago. Por favor, inténtalo de nuevo o contacta con soporte.');
    } finally {
      setProcessing(false);
    }
  };

  const handleSkipCheckout = () => {
    // CRITICAL: Checkout is mandatory - redirect to landing if cancelled
    if (confirm('⚠️ El checkout es obligatorio para activar tu cuenta. Si cancelas, perderás el registro. ¿Estás seguro?')) {
      console.log('🔒 [ClientCheckout] User cancelled checkout - redirecting to landing');
      navigate('/landing', { replace: true });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Preparando checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-8">
          <div className="text-center mb-6">
            <Logo size="md" variant="light" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">¡Registro Completado!</h1>
            <p className="text-green-100 mb-4">
              Ahora selecciona tu plan para activar tu cuenta
            </p>
            <div className="bg-white/20 rounded-lg p-4 max-w-2xl mx-auto">
              <div className="flex items-center justify-center space-x-4 text-sm">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <span>1. Registro</span>
                </div>
                <ArrowRight className="w-4 h-4" />
                <div className="flex items-center bg-white/30 px-3 py-1 rounded-full">
                  <CreditCard className="w-5 h-5 mr-2" />
                  <span className="font-semibold">2. Checkout</span>
                </div>
                <ArrowRight className="w-4 h-4" />
                <div className="flex items-center text-white/70">
                  <User className="w-5 h-5 mr-2" />
                  <span>3. Acceso</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              Selecciona tu Plan para Activar tu Cuenta
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {subscriptionPlans.map((plan) => {
                const Icon = plan.icon;
                const isSelected = selectedPlan?.id === plan.id;
                
                return (
                  <div
                    key={plan.id}
                    className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-green-500 bg-green-50 transform scale-105' 
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                    onClick={() => setSelectedPlan(plan)}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                          ⭐ Recomendado
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

                {/* SEPA Payment */}
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
                    Mandato SEPA • Débito automático • Zona Euro
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SEPA Form */}
          {selectedPlan && selectedPaymentMethod === 'sepa' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-4">
                Datos para Domiciliación SEPA
              </h3>

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
                      para debitar tu cuenta según el plan seleccionado.
                    </p>
                    <p className="text-xs text-green-700">
                      Tienes derecho al reembolso por parte de tu banco bajo los términos y condiciones del acuerdo. 
                      El reembolso debe ser reclamado dentro de las 8 semanas.
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
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <button
              onClick={handleSkipCheckout}
              className="text-gray-600 hover:text-gray-800 transition-colors flex items-center"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar Registro
            </button>
            
            <button
              onClick={handlePaymentComplete}
              disabled={!selectedPlan || processing || (selectedPaymentMethod === 'sepa' && !sepaFormData.iban)}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Procesando Pago...
                </>
              ) : (
                <>
                  {/* PayPal Payment */}
                  <div
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedPaymentMethod === 'paypal' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedPaymentMethod('paypal')}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <Globe className="w-6 h-6 text-blue-600 mr-3" />
                        <div>
                          <h4 className="font-semibold text-gray-900">PayPal</h4>
                          <p className="text-sm text-gray-600">Pago seguro con tu cuenta PayPal</p>
                        </div>
                      </div>
                      {selectedPaymentMethod === 'paypal' && (
                        <CheckCircle className="w-5 h-5 text-blue-500" />
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      PayPal • Pago inmediato • Protección del comprador
                    </div>
                  </div>
                  <Lock className="w-5 h-5 mr-2" />
                  {selectedPaymentMethod === 'sepa' 
                    ? 'Crear Mandato SEPA'
                    : 'Proceder al Pago'
                  }
                </>
              )}
            </button>
          </div>

                  {/* Bizum Payment */}
                  <div
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedPaymentMethod === 'bizum' 
                        ? 'border-orange-500 bg-orange-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedPaymentMethod('bizum')}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <Smartphone className="w-6 h-6 text-orange-600 mr-3" />
                        <div>
                          <h4 className="font-semibold text-gray-900">Bizum</h4>
                          <p className="text-sm text-gray-600">Pago instantáneo con tu móvil</p>
                        </div>
                      </div>
                      {selectedPaymentMethod === 'bizum' && (
                        <CheckCircle className="w-5 h-5 text-orange-500" />
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      Bizum • Pago instantáneo • Solo bancos españoles
                    </div>
                  </div>
          {/* Security Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <Shield className="w-5 h-5 text-blue-600 mr-3" />
              <div>
                <h4 className="font-semibold text-blue-800">Pago Seguro</h4>
                <p className="text-sm text-blue-700">
                  Tu información de pago está protegida con encriptación SSL de grado bancario. 
                  No almacenamos datos de tarjetas de crédito.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}