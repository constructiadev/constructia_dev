import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
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

const schema = yup.object({
  name: yup.string().required('El nombre es obligatorio'),
  type: yup.string().required('El tipo es obligatorio'),
  commission_type: yup.string().required('El tipo de comisión es obligatorio'),
  commission_percentage: yup.number().when('commission_type', {
    is: (val: string) => val === 'percentage' || val === 'mixed',
    then: (schema) => schema.required('El porcentaje es obligatorio').min(0).max(100),
    otherwise: (schema) => schema.notRequired()
  }),
  commission_fixed: yup.number().when('commission_type', {
    is: (val: string) => val === 'fixed' || val === 'mixed',
    then: (schema) => schema.required('La comisión fija es obligatoria').min(0),
    otherwise: (schema) => schema.notRequired()
  }),
  description: yup.string().required('La descripción es obligatoria'),
  supported_currencies: yup.array().min(1, 'Debe seleccionar al menos una moneda')
});

// Logo base64 de ConstructIA
const CONSTRUCTIA_LOGO_BASE64 = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iOCIgZmlsbD0iIzEwYjk4MSIvPgo8cGF0aCBkPSJNOCAxMmg0djhoLTR2LTh6bTYgMGg0djhoLTR2LTh6bTYgMGg0djhoLTR2LTh6IiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K";

export default function PaymentGatewayModal({ 
  isOpen, 
  onClose, 
  onSave, 
  gateway, 
  mode 
}: PaymentGatewayModalProps) {
  const [showSecrets, setShowSecrets] = useState(false);
  const [commissionPeriods, setCommissionPeriods] = useState(
    gateway?.commission_periods || [
      {
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        percentage: 2.9,
        fixed: 0.30
      }
    ]
  );
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>(
    gateway?.supported_currencies || ['EUR']
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<Partial<PaymentGateway>>({
    resolver: yupResolver(schema),
    defaultValues: {
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
      max_amount: gateway?.max_amount || 10000,
      supported_currencies: gateway?.supported_currencies || ['EUR']
    }
  });

  const watchedCommissionType = watch('commission_type');

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

  const addCommissionPeriod = () => {
    setCommissionPeriods([
      ...commissionPeriods,
      {
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        percentage: 2.9,
        fixed: 0.30
      }
    ]);
  };

  const removeCommissionPeriod = (index: number) => {
    setCommissionPeriods(commissionPeriods.filter((_, i) => i !== index));
  };

  const updateCommissionPeriod = (index: number, field: string, value: any) => {
    const updated = [...commissionPeriods];
    updated[index] = { ...updated[index], [field]: value };
    setCommissionPeriods(updated);
  };

  const toggleCurrency = (currencyCode: string) => {
    const updated = selectedCurrencies.includes(currencyCode)
      ? selectedCurrencies.filter(c => c !== currencyCode)
      : [...selectedCurrencies, currencyCode];
    setSelectedCurrencies(updated);
    setValue('supported_currencies', updated);
  };

  const onSubmit = async (data: Partial<PaymentGateway>) => {
    setIsSubmitting(true);
    try {
      const gatewayData = {
        ...data,
        commission_periods: commissionPeriods,
        supported_currencies: selectedCurrencies,
        logo_base64: CONSTRUCTIA_LOGO_BASE64,
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
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Información Básica */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-4">Información Básica</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la Pasarela *
                </label>
                <input
                  {...register('name')}
                  type="text"
                  disabled={isReadOnly}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder="Ej: Stripe Principal"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Pasarela *
                </label>
                <select
                  {...register('type')}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  {...register('status')}
                  disabled={isReadOnly}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                  <option value="warning">Advertencia</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Comisión *
                </label>
                <select
                  {...register('commission_type')}
                  disabled={isReadOnly}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="percentage">Solo Porcentaje</option>
                  <option value="fixed">Solo Fijo</option>
                  <option value="mixed">Mixto (% + Fijo)</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción *
              </label>
              <textarea
                {...register('description')}
                disabled={isReadOnly}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="Descripción de la pasarela de pago..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>
          </div>

          {/* Configuración de Comisiones */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-4">Configuración de Comisiones</h3>
            
            {/* Comisión Base */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {(watchedCommissionType === 'percentage' || watchedCommissionType === 'mixed') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Porcentaje Base (%) *
                  </label>
                  <div className="relative">
                    <input
                      {...register('commission_percentage')}
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      disabled={isReadOnly}
                      className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      placeholder="2.9"
                    />
                    <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  {errors.commission_percentage && (
                    <p className="mt-1 text-sm text-red-600">{errors.commission_percentage.message}</p>
                  )}
                </div>
              )}

              {(watchedCommissionType === 'fixed' || watchedCommissionType === 'mixed') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comisión Fija (€) *
                  </label>
                  <div className="relative">
                    <input
                      {...register('commission_fixed')}
                      type="number"
                      step="0.01"
                      min="0"
                      disabled={isReadOnly}
                      className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      placeholder="0.30"
                    />
                    <Euro className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  {errors.commission_fixed && (
                    <p className="mt-1 text-sm text-red-600">{errors.commission_fixed.message}</p>
                  )}
                </div>
              )}
            </div>

            {/* Períodos de Comisión */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-700">Períodos de Comisión Especiales</h4>
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={addCommissionPeriod}
                    className="flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                  >
                    <Calendar className="h-3 w-3 mr-1" />
                    Añadir Período
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {commissionPeriods.map((period, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium text-gray-700">Período {index + 1}</h5>
                      {!isReadOnly && commissionPeriods.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCommissionPeriod(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Fecha Inicio
                        </label>
                        <input
                          type="date"
                          value={period.start_date}
                          onChange={(e) => updateCommissionPeriod(index, 'start_date', e.target.value)}
                          disabled={isReadOnly}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Fecha Fin
                        </label>
                        <input
                          type="date"
                          value={period.end_date}
                          onChange={(e) => updateCommissionPeriod(index, 'end_date', e.target.value)}
                          disabled={isReadOnly}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                        />
                      </div>

                      {(watchedCommissionType === 'percentage' || watchedCommissionType === 'mixed') && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Porcentaje (%)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={period.percentage || ''}
                            onChange={(e) => updateCommissionPeriod(index, 'percentage', parseFloat(e.target.value))}
                            disabled={isReadOnly}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                            placeholder="2.9"
                          />
                        </div>
                      )}

                      {(watchedCommissionType === 'fixed' || watchedCommissionType === 'mixed') && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Fijo (€)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={period.fixed || ''}
                            onChange={(e) => updateCommissionPeriod(index, 'fixed', parseFloat(e.target.value))}
                            disabled={isReadOnly}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                            placeholder="0.30"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Configuración Técnica */}
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Configuración Técnica</h3>
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={() => setShowSecrets(!showSecrets)}
                  className="flex items-center text-sm text-gray-600 hover:text-gray-800"
                >
                  {showSecrets ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                  {showSecrets ? 'Ocultar' : 'Mostrar'} Credenciales
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key
                </label>
                <input
                  {...register('api_key')}
                  type={showSecrets ? 'text' : 'password'}
                  disabled={isReadOnly}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder="pk_live_..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secret Key
                </label>
                <input
                  {...register('secret_key')}
                  type={showSecrets ? 'text' : 'password'}
                  disabled={isReadOnly}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder="sk_live_..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Webhook URL
                </label>
                <input
                  {...register('webhook_url')}
                  type="url"
                  disabled={isReadOnly}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder="https://api.constructia.com/webhooks/stripe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto Mínimo (€)
                </label>
                <input
                  {...register('min_amount')}
                  type="number"
                  min="0"
                  step="0.01"
                  disabled={isReadOnly}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder="1.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto Máximo (€)
                </label>
                <input
                  {...register('max_amount')}
                  type="number"
                  min="0"
                  step="0.01"
                  disabled={isReadOnly}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder="10000.00"
                />
              </div>
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
            {errors.supported_currencies && (
              <p className="mt-2 text-sm text-red-600">{errors.supported_currencies.message}</p>
            )}
          </div>

          {/* Logo Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-4">Logo de la Pasarela</h3>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white border border-gray-200 rounded-lg flex items-center justify-center">
                <img 
                  src={CONSTRUCTIA_LOGO_BASE64} 
                  alt="ConstructIA Logo" 
                  className="w-12 h-12"
                />
              </div>
              <div>
                <p className="font-medium text-gray-800">Logo ConstructIA</p>
                <p className="text-sm text-gray-600">Se usará automáticamente en todas las pasarelas</p>
                <p className="text-xs text-gray-500">Formato: SVG Base64 optimizado</p>
              </div>
            </div>
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