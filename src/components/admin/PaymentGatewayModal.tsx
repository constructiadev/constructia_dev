import React, { useState } from 'react';
import { 
  CreditCard, 
  DollarSign, 
  Building, 
  Smartphone,
  X,
  Save,
  Calendar,
  Percent,
  Euro,
  Globe,
  Shield,
  AlertTriangle,
  CheckCircle,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';

interface PaymentGateway {
  id: string;
  name: string;
  type: 'stripe' | 'paypal' | 'sepa' | 'bizum' | 'custom';
  status: 'active' | 'inactive' | 'warning';
  commission_type: 'percentage' | 'fixed' | 'mixed';
  commission_percentage?: number;
  commission_fixed?: number;
  api_key?: string;
  secret_key?: string;
  webhook_url?: string;
  supported_currencies: string[];
  min_amount?: number;
  max_amount?: number;
  description: string;
  created_at: string;
  updated_at: string;
}

interface PaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (gateway: Partial<PaymentGateway>) => Promise<void>;
  gateway?: PaymentGateway | null;
  mode: 'create' | 'edit' | 'view';
}

export default function PaymentGatewayModal({ 
  isOpen, 
  onClose, 
  onSave, 
  gateway, 
  mode 
}: PaymentGatewayModalProps) {
  const [showSecrets, setShowSecrets] = useState(false);
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>(
    gateway?.supported_currencies || ['EUR']
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: gateway?.name || '',
    type: gateway?.type || 'stripe',
    status: gateway?.status || 'active',
    commission_type: gateway?.commission_type || 'mixed',
    commission_percentage: gateway?.commission_percentage || 2.9,
    commission_fixed: gateway?.commission_fixed || 0.30,
    description: gateway?.description || '',
    api_key: gateway?.api_key || '',
    secret_key: gateway?.secret_key || '',
    webhook_url: gateway?.webhook_url || '',
    min_amount: gateway?.min_amount || 1,
    max_amount: gateway?.max_amount || 10000
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const currencies = [
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'USD', name: 'Dólar Americano', symbol: '$' },
    { code: 'GBP', name: 'Libra Esterlina', symbol: '£' },
    { code: 'JPY', name: 'Yen Japonés', symbol: '¥' }
  ];

  const gatewayTypes = [
    { value: 'stripe', label: 'Stripe', icon: CreditCard, color: 'bg-blue-600' },
    { value: 'paypal', label: 'PayPal', icon: DollarSign, color: 'bg-blue-500' },
    { value: 'sepa', label: 'SEPA', icon: Building, color: 'bg-green-600' },
    { value: 'bizum', label: 'Bizum', icon: Smartphone, color: 'bg-orange-600' }
  ];

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name) newErrors.name = 'El nombre es obligatorio';
    if (!formData.description) newErrors.description = 'La descripción es obligatoria';
    if (selectedCurrencies.length === 0) newErrors.currencies = 'Debe seleccionar al menos una moneda';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const toggleCurrency = (currencyCode: string) => {
    const updated = selectedCurrencies.includes(currencyCode)
      ? selectedCurrencies.filter(c => c !== currencyCode)
      : [...selectedCurrencies, currencyCode];
    setSelectedCurrencies(updated);
    if (errors.currencies) {
      setErrors(prev => ({ ...prev, currencies: '' }));
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const gatewayData = {
        ...formData,
        supported_currencies: selectedCurrencies,
        updated_at: new Date().toISOString()
      };

      if (mode === 'create') {
        gatewayData.id = `gateway_${Date.now()}`;
        gatewayData.created_at = new Date().toISOString();
      }

      await onSave(gatewayData);
      onClose();
    } catch (error) {
      console.error('Error saving payment gateway:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const isReadOnly = mode === 'view';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white/20 p-3 rounded-full mr-4">
                <CreditCard className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {mode === 'create' ? 'Nueva Pasarela de Pago' : 
                   mode === 'edit' ? 'Editar Pasarela de Pago' : 
                   'Detalles de Pasarela de Pago'}
                </h2>
                <p className="text-blue-100">
                  {mode === 'create' ? 'Configurar nueva pasarela de pago' : 
                   mode === 'edit' ? 'Modificar configuración existente' : 
                   'Información de la pasarela'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={onSubmit} className="p-6 space-y-6">
          {/* Información Básica */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-4">Información Básica</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la Pasarela *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={isReadOnly}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder="Ej: Stripe Principal"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Pasarela *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  disabled={isReadOnly}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                >
                  {gatewayTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                disabled={isReadOnly}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="Descripción de la pasarela de pago..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>
          </div>

          {/* Monedas Soportadas */}
          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-4">Monedas Soportadas</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {currencies.map(currency => (
                <label
                  key={currency.code}
                  className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                    selectedCurrencies.includes(currency.code)
                      ? 'border-purple-500 bg-purple-100'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${isReadOnly ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={selectedCurrencies.includes(currency.code)}
                    onChange={() => !isReadOnly && toggleCurrency(currency.code)}
                    disabled={isReadOnly}
                    className="sr-only"
                  />
                  <div className="flex items-center">
                    <span className="text-lg mr-2">{currency.symbol}</span>
                    <div>
                      <p className="font-medium text-gray-800">{currency.code}</p>
                      <p className="text-xs text-gray-600">{currency.name}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
            {errors.currencies && (
              <p className="mt-2 text-sm text-red-600">{errors.currencies}</p>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              {isReadOnly ? 'Cerrar' : 'Cancelar'}
            </button>
            {!isReadOnly && (
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {mode === 'create' ? 'Crear Pasarela' : 'Guardar Cambios'}
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}