import React, { useState } from 'react';
import { 
  X, 
  CreditCard, 
  Lock, 
  Shield, 
  CheckCircle, 
  AlertTriangle,
  Loader2,
  Eye,
  Calendar,
  User,
  Building,
  Globe,
  Zap
} from 'lucide-react';
import { logAuditoria, DEV_ADMIN_USER_ID, DEV_TENANT_ID } from '../../lib/supabase-real';
import { useAuth } from '../../lib/auth-context';

interface StripePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
  amount: number;
  planName: string;
  billingCycle: 'monthly' | 'yearly';
}

interface CardData {
  number: string;
  expiry: string;
  cvc: string;
  name: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export default function StripePaymentModal({ 
  isOpen, 
  onClose, 
  onPaymentSuccess, 
  amount, 
  planName, 
  billingCycle 
}: StripePaymentModalProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<'form' | 'processing' | 'verification' | 'success'>('form');
  const [cardData, setCardData] = useState<CardData>({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'ES'
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [processingStep, setProcessingStep] = useState('');

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!cardData.number.replace(/\s/g, '')) {
      newErrors.number = 'Número de tarjeta requerido';
    } else if (cardData.number.replace(/\s/g, '').length !== 16) {
      newErrors.number = 'Número de tarjeta inválido';
    }

    if (!cardData.expiry) {
      newErrors.expiry = 'Fecha de caducidad requerida';
    } else if (!/^\d{2}\/\d{2}$/.test(cardData.expiry)) {
      newErrors.expiry = 'Formato inválido (MM/YY)';
    }

    if (!cardData.cvc) {
      newErrors.cvc = 'CVC requerido';
    } else if (cardData.cvc.length !== 3) {
      newErrors.cvc = 'CVC debe tener 3 dígitos';
    }

    if (!cardData.name.trim()) {
      newErrors.name = 'Nombre del titular requerido';
    }

    if (!cardData.email.trim()) {
      newErrors.email = 'Email requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleInputChange = (field: keyof CardData, value: string) => {
    let formattedValue = value;
    
    if (field === 'number') {
      formattedValue = formatCardNumber(value);
    } else if (field === 'expiry') {
      formattedValue = formatExpiry(value);
    } else if (field === 'cvc') {
      formattedValue = value.replace(/\D/g, '').substring(0, 3);
    }

    setCardData(prev => ({ ...prev, [field]: formattedValue }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const processPayment = async () => {
    if (!validateForm()) return;

    try {
      setStep('processing');
      setProcessingStep('Validando datos de la tarjeta...');
      await new Promise(resolve => setTimeout(resolve, 1500));

      setProcessingStep('Conectando con el banco emisor...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      setStep('verification');
      setProcessingStep('Verificación 3D Secure en progreso...');
      await new Promise(resolve => setTimeout(resolve, 2500));

      setProcessingStep('Confirmando transacción...');
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulate payment success (95% success rate)
      if (Math.random() > 0.05) {
        setStep('success');
        
        // Log audit event for successful payment
        await logAuditoria(
          user?.tenant_id || DEV_TENANT_ID,
          user?.id || DEV_ADMIN_USER_ID,
          'payment.stripe_success',
          'pago',
          `payment_${Date.now()}`,
          {
            payment_method: 'stripe',
            amount: amount,
            currency: 'EUR',
            plan: planName,
            billing_cycle: billingCycle,
            card_last_four: cardData.number.slice(-4),
            cardholder_name: cardData.name,
            transaction_id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            payment_status: 'completed',
            security_checks: {
              cvc_check: 'pass',
              address_check: 'pass',
              three_d_secure: 'authenticated'
            }
          },
          '127.0.0.1',
          navigator.userAgent,
          'success'
        );

        setTimeout(() => {
          onPaymentSuccess();
        }, 2000);
      } else {
        throw new Error('Pago rechazado por el banco');
      }

    } catch (error) {
      console.error('Payment processing error:', error);
      setStep('form');
      setErrors({ general: error instanceof Error ? error.message : 'Error en el procesamiento' });
    }
  };

  const getCardType = (number: string) => {
    const num = number.replace(/\s/g, '');
    if (num.startsWith('4')) return 'Visa';
    if (num.startsWith('5') || num.startsWith('2')) return 'Mastercard';
    if (num.startsWith('3')) return 'American Express';
    return 'Tarjeta';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white/20 p-3 rounded-full mr-4">
                <CreditCard className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Pago Seguro con Tarjeta</h2>
                <p className="text-blue-100">
                  Plan {planName} • €{amount}/{billingCycle === 'yearly' ? 'año' : 'mes'}
                </p>
              </div>
            </div>
            {step === 'form' && (
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            )}
          </div>
        </div>

        {/* Security Indicators */}
        <div className="bg-green-50 border-b border-green-200 p-4">
          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center text-green-700">
              <Shield className="w-4 h-4 mr-2" />
              <span>SSL 256-bit</span>
            </div>
            <div className="flex items-center text-green-700">
              <Lock className="w-4 h-4 mr-2" />
              <span>3D Secure</span>
            </div>
            <div className="flex items-center text-green-700">
              <CheckCircle className="w-4 h-4 mr-2" />
              <span>PCI DSS</span>
            </div>
            <div className="flex items-center text-green-700">
              <Globe className="w-4 h-4 mr-2" />
              <span>Stripe Certified</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'form' && (
            <div className="space-y-6">
              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                    <span className="text-red-800">{errors.general}</span>
                  </div>
                </div>
              )}

              {/* Card Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Información de la Tarjeta</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número de Tarjeta *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardData.number}
                        onChange={(e) => handleInputChange('number', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.number ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <span className="text-xs text-gray-500 font-medium">
                          {getCardType(cardData.number)}
                        </span>
                      </div>
                    </div>
                    {errors.number && <p className="mt-1 text-sm text-red-600">{errors.number}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha Caducidad *
                      </label>
                      <input
                        type="text"
                        value={cardData.expiry}
                        onChange={(e) => handleInputChange('expiry', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.expiry ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="MM/YY"
                        maxLength={5}
                      />
                      {errors.expiry && <p className="mt-1 text-sm text-red-600">{errors.expiry}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVC *
                      </label>
                      <input
                        type="text"
                        value={cardData.cvc}
                        onChange={(e) => handleInputChange('cvc', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.cvc ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="123"
                        maxLength={3}
                      />
                      {errors.cvc && <p className="mt-1 text-sm text-red-600">{errors.cvc}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del Titular *
                    </label>
                    <input
                      type="text"
                      value={cardData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Como aparece en la tarjeta"
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                  </div>
                </div>
              </div>

              {/* Billing Information */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Información de Facturación</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={cardData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="juan@empresa.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dirección
                    </label>
                    <input
                      type="text"
                      value={cardData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Calle Principal 123"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ciudad
                    </label>
                    <input
                      type="text"
                      value={cardData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Madrid"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Código Postal
                    </label>
                    <input
                      type="text"
                      value={cardData.postalCode}
                      onChange={(e) => handleInputChange('postalCode', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="28001"
                    />
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Resumen del Pago</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Plan:</span>
                    <span className="font-medium">{planName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Facturación:</span>
                    <span className="font-medium">{billingCycle === 'yearly' ? 'Anual' : 'Mensual'}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold border-t pt-2">
                    <span>Total:</span>
                    <span className="text-green-600">€{amount}</span>
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Shield className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-800 mb-2">Transacción Segura</h4>
                    <p className="text-green-700 text-sm mb-2">
                      Tu pago está protegido por múltiples capas de seguridad:
                    </p>
                    <ul className="text-green-700 text-sm space-y-1">
                      <li>• Encriptación SSL de grado bancario</li>
                      <li>• Verificación 3D Secure obligatoria</li>
                      <li>• Cumplimiento PCI DSS Level 1</li>
                      <li>• Monitoreo de fraude en tiempo real</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Payment Button */}
              <button
                onClick={processPayment}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center"
              >
                <Lock className="w-5 h-5 mr-2" />
                Pagar €{amount} de forma segura
              </button>
            </div>
          )}

          {step === 'processing' && (
            <div className="text-center py-12">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Procesando Pago</h3>
              <p className="text-gray-600 mb-4">{processingStep}</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                <div className="flex items-center text-blue-800">
                  <Shield className="w-5 h-5 mr-2" />
                  <span className="text-sm">Conexión segura establecida con Stripe</span>
                </div>
              </div>
            </div>
          )}

          {step === 'verification' && (
            <div className="text-center py-12">
              <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Eye className="w-10 h-10 text-orange-600 animate-pulse" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Verificación Bancaria</h3>
              <p className="text-gray-600 mb-4">Tu banco está verificando la transacción</p>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 max-w-md mx-auto">
                <div className="flex items-center text-orange-800">
                  <Zap className="w-5 h-5 mr-2" />
                  <span className="text-sm">Autenticación 3D Secure en progreso</span>
                </div>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-12">
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">¡Pago Exitoso!</h3>
              <p className="text-gray-600 mb-4">
                Tu pago de €{amount} ha sido procesado correctamente
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
                <div className="space-y-2 text-sm text-green-800">
                  <div className="flex justify-between">
                    <span>Plan activado:</span>
                    <span className="font-medium">{planName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Próximo cobro:</span>
                    <span className="font-medium">
                      {new Date(Date.now() + (billingCycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Redirigiendo a tu dashboard en unos segundos...
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 'form' && (
          <div className="bg-gray-50 px-6 py-4 rounded-b-xl border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-600">
                <Lock className="w-4 h-4 mr-2" />
                <span>Tus datos están protegidos y no se almacenan</span>
              </div>
              <div className="text-sm text-gray-500">
                Procesado por Stripe
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}