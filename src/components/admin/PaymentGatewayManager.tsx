import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Building,
  Smartphone,
  Globe,
  Plus,
  Edit,
  Trash2,
  Eye,
  Save,
  X,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Settings,
  DollarSign,
  Percent,
  Calendar,
  Activity,
  BarChart3,
  TrendingUp,
  Upload,
  Download,
  Copy,
  Key,
  Shield,
  Zap,
  Target,
  Award,
  Star,
  Info,
  Lock,
  Unlock
} from 'lucide-react';
import { getAllPaymentGateways, updatePaymentGateway } from '../../lib/supabase';
import type { PaymentGateway } from '../../types';

interface PaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (gateway: Partial<PaymentGateway>) => Promise<void>;
  gateway?: PaymentGateway | null;
  mode: 'create' | 'edit' | 'view';
}

function PaymentGatewayModal({ isOpen, onClose, onSave, gateway, mode }: PaymentGatewayModalProps) {
  const [formData, setFormData] = useState({
    name: gateway?.name || '',
    type: gateway?.type || 'stripe',
    status: gateway?.status || 'active',
    commission_type: gateway?.commission_type || 'percentage',
    commission_percentage: gateway?.commission_percentage || 2.9,
    commission_fixed: gateway?.commission_fixed || 0,
    api_key: gateway?.api_key || '',
    secret_key: gateway?.secret_key || '',
    webhook_url: gateway?.webhook_url || '',
    supported_currencies: gateway?.supported_currencies || ['EUR'],
    min_amount: gateway?.min_amount || 1,
    max_amount: gateway?.max_amount || 10000,
    description: gateway?.description || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const gatewayTypes = [
    { value: 'stripe', label: 'Stripe', icon: CreditCard, color: 'bg-blue-600' },
    { value: 'paypal', label: 'PayPal', icon: Globe, color: 'bg-blue-500' },
    { value: 'sepa', label: 'SEPA', icon: Building, color: 'bg-green-600' },
    { value: 'bizum', label: 'Bizum', icon: Smartphone, color: 'bg-orange-600' },
    { value: 'custom', label: 'Personalizado', icon: Settings, color: 'bg-gray-600' }
  ];

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) newErrors.name = 'El nombre es obligatorio';
    if (!formData.description.trim()) newErrors.description = 'La descripción es obligatoria';
    if (formData.commission_type === 'percentage' && (!formData.commission_percentage || formData.commission_percentage <= 0)) {
      newErrors.commission_percentage = 'El porcentaje de comisión debe ser mayor a 0';
    }
    if (formData.commission_type === 'fixed' && (!formData.commission_fixed || formData.commission_fixed <= 0)) {
      newErrors.commission_fixed = 'La comisión fija debe ser mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const gatewayData = {
        ...formData,
        supported_currencies: Array.isArray(formData.supported_currencies) 
          ? formData.supported_currencies 
          : formData.supported_currencies.split(',').map(c => c.trim()),
        transactions: 0,
        volume: '0',
        color: gatewayTypes.find(t => t.value === formData.type)?.color || 'bg-gray-600'
      };

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
  const selectedType = gatewayTypes.find(t => t.value === formData.type);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white/20 p-3 rounded-full mr-4">
                {selectedType && <selectedType.icon className="h-8 w-8" />}
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {mode === 'create' ? 'Nueva Pasarela de Pago' : 
                   mode === 'edit' ? 'Editar Pasarela' : 
                   'Detalles de Pasarela'}
                </h2>
                <p className="text-green-100">
                  {mode === 'create' ? 'Configurar nueva plataforma de pago' : 
                   mode === 'edit' ? 'Modificar configuración' : 
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
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  disabled={isReadOnly}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder="Ej: Stripe España"
                  required
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Pasarela *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  disabled={isReadOnly}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                  required
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
                  Estado *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  disabled={isReadOnly}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                  required
                >
                  <option value="active">Activa</option>
                  <option value="inactive">Inactiva</option>
                  <option value="warning">Advertencia</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Comisión *
                </label>
                <select
                  value={formData.commission_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, commission_type: e.target.value }))}
                  disabled={isReadOnly}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                  required
                >
                  <option value="percentage">Porcentaje</option>
                  <option value="fixed">Fijo</option>
                  <option value="mixed">Mixto</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                disabled={isReadOnly}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="Describe esta pasarela de pago..."
                required
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>
          </div>

          {/* Configuración de Comisiones */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-4">Configuración de Comisiones</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(formData.commission_type === 'percentage' || formData.commission_type === 'mixed') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Porcentaje de Comisión (%) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.commission_percentage}
                    onChange={(e) => setFormData(prev => ({ ...prev, commission_percentage: parseFloat(e.target.value) }))}
                    disabled={isReadOnly}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                    placeholder="2.9"
                    required
                  />
                  {errors.commission_percentage && <p className="mt-1 text-sm text-red-600">{errors.commission_percentage}</p>}
                </div>
              )}

              {(formData.commission_type === 'fixed' || formData.commission_type === 'mixed') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comisión Fija (€) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.commission_fixed}
                    onChange={(e) => setFormData(prev => ({ ...prev, commission_fixed: parseFloat(e.target.value) }))}
                    disabled={isReadOnly}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                    placeholder="0.30"
                    required
                  />
                  {errors.commission_fixed && <p className="mt-1 text-sm text-red-600">{errors.commission_fixed}</p>}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Importe Mínimo (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.min_amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, min_amount: parseFloat(e.target.value) }))}
                  disabled={isReadOnly}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder="1.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Importe Máximo (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.max_amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_amount: parseFloat(e.target.value) }))}
                  disabled={isReadOnly}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder="10000.00"
                />
              </div>
            </div>
          </div>

          {/* Configuración de API */}
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Configuración de API</h3>
              <button
                type="button"
                onClick={() => setShowSecrets(!showSecrets)}
                className="flex items-center text-sm text-gray-600 hover:text-gray-800"
              >
                {showSecrets ? <Lock className="h-4 w-4 mr-1" /> : <Unlock className="h-4 w-4 mr-1" />}
                {showSecrets ? 'Ocultar' : 'Mostrar'} claves
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key
                </label>
                <input
                  type={showSecrets ? 'text' : 'password'}
                  value={formData.api_key}
                  onChange={(e) => setFormData(prev => ({ ...prev, api_key: e.target.value }))}
                  disabled={isReadOnly}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder="pk_test_..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secret Key
                </label>
                <input
                  type={showSecrets ? 'text' : 'password'}
                  value={formData.secret_key}
                  onChange={(e) => setFormData(prev => ({ ...prev, secret_key: e.target.value }))}
                  disabled={isReadOnly}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder="sk_test_..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Webhook URL
                </label>
                <input
                  type="url"
                  value={formData.webhook_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, webhook_url: e.target.value }))}
                  disabled={isReadOnly}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder="https://tu-dominio.com/webhooks/payment"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monedas Soportadas
                </label>
                <input
                  type="text"
                  value={Array.isArray(formData.supported_currencies) ? formData.supported_currencies.join(', ') : formData.supported_currencies}
                  onChange={(e) => setFormData(prev => ({ ...prev, supported_currencies: e.target.value }))}
                  disabled={isReadOnly}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder="EUR, USD, GBP"
                />
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
                className="flex items-center px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
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

interface PaymentGatewayCardProps {
  gateway: PaymentGateway;
  onEdit: (gateway: PaymentGateway) => void;
  onView: (gateway: PaymentGateway) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

function PaymentGatewayCard({ gateway, onEdit, onView, onDelete, onToggleStatus }: PaymentGatewayCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100 border-green-200';
      case 'inactive': return 'text-gray-600 bg-gray-100 border-gray-200';
      case 'warning': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'stripe': return CreditCard;
      case 'paypal': return Globe;
      case 'sepa': return Building;
      case 'bizum': return Smartphone;
      default: return Settings;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'stripe': return 'bg-blue-600';
      case 'paypal': return 'bg-blue-500';
      case 'sepa': return 'bg-green-600';
      case 'bizum': return 'bg-orange-600';
      default: return 'bg-gray-600';
    }
  };

  const TypeIcon = getTypeIcon(gateway.type);

  return (
    <div className={`border-2 rounded-xl p-6 transition-all hover:shadow-lg ${getStatusColor(gateway.status)}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className={`w-12 h-12 ${getTypeColor(gateway.type)} rounded-lg flex items-center justify-center mr-4`}>
            <TypeIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{gateway.name}</h3>
            <p className="text-sm text-gray-600 capitalize">{gateway.type}</p>
          </div>
        </div>
        <span className="text-sm font-medium capitalize">{gateway.status}</span>
      </div>

      {/* Description */}
      <p className="text-gray-700 text-sm mb-4">{gateway.description}</p>

      {/* Commission Info */}
      <div className="bg-white/50 rounded-lg p-3 mb-4">
        <div className="text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Comisión:</span>
            <span className="font-medium">
              {gateway.commission_type === 'percentage' && `${gateway.commission_percentage}%`}
              {gateway.commission_type === 'fixed' && `€${gateway.commission_fixed}`}
              {gateway.commission_type === 'mixed' && `${gateway.commission_percentage}% + €${gateway.commission_fixed}`}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Límites:</span>
            <span className="font-medium">€{gateway.min_amount} - €{gateway.max_amount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Monedas:</span>
            <span className="font-medium">{gateway.supported_currencies.join(', ')}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        <button
          onClick={() => onView(gateway)}
          className="flex-1 px-3 py-2 bg-white/50 hover:bg-white/75 rounded-lg transition-colors text-sm font-medium flex items-center justify-center"
        >
          <Eye className="h-3 w-3 mr-1" />
          Ver
        </button>
        <button
          onClick={() => onEdit(gateway)}
          className="flex-1 px-3 py-2 bg-white/50 hover:bg-white/75 rounded-lg transition-colors text-sm font-medium flex items-center justify-center"
        >
          <Edit className="h-3 w-3 mr-1" />
          Editar
        </button>
        <button
          onClick={() => onToggleStatus(gateway.id)}
          className="px-3 py-2 bg-white/50 hover:bg-white/75 rounded-lg transition-colors"
        >
          {gateway.status === 'active' ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
        </button>
        <button
          onClick={() => onDelete(gateway.id)}
          className="px-3 py-2 bg-white/50 hover:bg-white/75 rounded-lg transition-colors text-red-600"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

export default function PaymentGatewayManager() {
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadPaymentGateways();
  }, []);

  const loadPaymentGateways = async () => {
    try {
      setLoading(true);
      
      // Load real payment gateways or create defaults
      const realGateways = await getAllPaymentGateways();
      
      if (realGateways.length === 0) {
        // Create default payment gateways
        const defaultGateways: PaymentGateway[] = [
          {
            id: 'stripe-default',
            name: 'Stripe España',
            type: 'stripe',
            status: 'active',
            commission_type: 'percentage',
            commission_percentage: 2.9,
            commission_fixed: 0.30,
            api_key: 'pk_test_...',
            secret_key: 'sk_test_...',
            webhook_url: 'https://constructia.com/webhooks/stripe',
            supported_currencies: ['EUR', 'USD'],
            min_amount: 1,
            max_amount: 10000,
            description: 'Procesamiento de tarjetas de crédito y débito',
            transactions: 1247,
            volume: '€45,678',
            color: 'bg-blue-600',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'paypal-default',
            name: 'PayPal España',
            type: 'paypal',
            status: 'active',
            commission_type: 'percentage',
            commission_percentage: 3.4,
            commission_fixed: 0.35,
            api_key: 'AYjcyDcqLnCY-ykzlHMVDrjM...',
            secret_key: 'EGnHDxD_qRPdaLdHCKiw...',
            webhook_url: 'https://constructia.com/webhooks/paypal',
            supported_currencies: ['EUR', 'USD'],
            min_amount: 1,
            max_amount: 8000,
            description: 'Pagos con cuenta PayPal y tarjetas',
            transactions: 456,
            volume: '€12,345',
            color: 'bg-blue-500',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'sepa-default',
            name: 'SEPA Directo',
            type: 'sepa',
            status: 'active',
            commission_type: 'fixed',
            commission_percentage: 0,
            commission_fixed: 1.50,
            api_key: '',
            secret_key: '',
            webhook_url: 'https://constructia.com/webhooks/sepa',
            supported_currencies: ['EUR'],
            min_amount: 10,
            max_amount: 50000,
            description: 'Domiciliación bancaria SEPA para Europa',
            transactions: 234,
            volume: '€67,890',
            color: 'bg-green-600',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'bizum-default',
            name: 'Bizum España',
            type: 'bizum',
            status: 'active',
            commission_type: 'percentage',
            commission_percentage: 1.5,
            commission_fixed: 0,
            api_key: 'bizum_api_key_...',
            secret_key: 'bizum_secret_...',
            webhook_url: 'https://constructia.com/webhooks/bizum',
            supported_currencies: ['EUR'],
            min_amount: 0.50,
            max_amount: 1000,
            description: 'Pagos instantáneos con móvil (solo España)',
            transactions: 89,
            volume: '€2,345',
            color: 'bg-orange-600',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        
        setGateways(defaultGateways);
      } else {
        setGateways(realGateways);
      }
    } catch (error) {
      console.error('Error loading payment gateways:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGateway = () => {
    setSelectedGateway(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleEditGateway = (gateway: PaymentGateway) => {
    setSelectedGateway(gateway);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleViewGateway = (gateway: PaymentGateway) => {
    setSelectedGateway(gateway);
    setModalMode('view');
    setShowModal(true);
  };

  const handleSaveGateway = async (gatewayData: Partial<PaymentGateway>) => {
    try {
      if (modalMode === 'create') {
        const newGateway: PaymentGateway = {
          id: `gateway_${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          transactions: 0,
          volume: '€0',
          ...gatewayData
        } as PaymentGateway;
        
        setGateways(prev => [...prev, newGateway]);
        alert('✅ Pasarela de pago creada correctamente');
      } else if (modalMode === 'edit' && selectedGateway) {
        setGateways(prev => prev.map(gateway => 
          gateway.id === selectedGateway.id 
            ? { ...gateway, ...gatewayData, updated_at: new Date().toISOString() }
            : gateway
        ));
        alert('✅ Pasarela de pago actualizada correctamente');
      }
    } catch (error) {
      console.error('Error saving payment gateway:', error);
      alert('❌ Error al guardar pasarela de pago');
      throw error;
    }
  };

  const handleDeleteGateway = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta pasarela de pago?')) {
      setGateways(prev => prev.filter(gateway => gateway.id !== id));
      alert('✅ Pasarela de pago eliminada correctamente');
    }
  };

  const handleToggleStatus = async (id: string) => {
    setGateways(prev => prev.map(gateway => 
      gateway.id === id 
        ? { 
            ...gateway, 
            status: gateway.status === 'active' ? 'inactive' : 'active',
            updated_at: new Date().toISOString()
          }
        : gateway
    ));
    
    const gateway = gateways.find(g => g.id === id);
    const newStatus = gateway?.status === 'active' ? 'desactivada' : 'activada';
    alert(`✅ Pasarela ${newStatus} correctamente`);
  };

  const filteredGateways = gateways.filter(gateway => {
    const matchesSearch = gateway.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         gateway.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || gateway.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || gateway.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = {
    total: gateways.length,
    active: gateways.filter(g => g.status === 'active').length,
    inactive: gateways.filter(g => g.status === 'inactive').length,
    totalTransactions: gateways.reduce((sum, g) => sum + (g.transactions || 0), 0),
    totalVolume: gateways.reduce((sum, g) => {
      const volume = parseFloat(g.volume?.replace(/[€,]/g, '') || '0');
      return sum + volume;
    }, 0)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando pasarelas de pago...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Pasarelas de Pago</h2>
          <p className="text-gray-600">Configura y administra métodos de pago</p>
        </div>
        <button
          onClick={handleCreateGateway}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Pasarela
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Activas</p>
              <p className="text-xl font-semibold text-green-600">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-50 rounded-lg">
              <Lock className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Inactivas</p>
              <p className="text-xl font-semibold text-gray-600">{stats.inactive}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Activity className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Transacciones</p>
              <p className="text-xl font-semibold text-purple-600">{stats.totalTransactions.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Volumen</p>
              <p className="text-xl font-semibold text-orange-600">€{stats.totalVolume.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar pasarelas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">Todos los tipos</option>
            <option value="stripe">Stripe</option>
            <option value="paypal">PayPal</option>
            <option value="sepa">SEPA</option>
            <option value="bizum">Bizum</option>
            <option value="custom">Personalizado</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activas</option>
            <option value="inactive">Inactivas</option>
            <option value="warning">Con advertencias</option>
          </select>

          <button
            onClick={() => {
              setSearchTerm('');
              setTypeFilter('all');
              setStatusFilter('all');
            }}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Payment Gateways Grid */}
      <div>
        {filteredGateways.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || typeFilter !== 'all' || statusFilter !== 'all' 
                ? 'No se encontraron pasarelas' 
                : 'No hay pasarelas configuradas'
              }
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Comienza configurando tu primera pasarela de pago'
              }
            </p>
            {!searchTerm && typeFilter === 'all' && statusFilter === 'all' && (
              <button
                onClick={handleCreateGateway}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Crear Primera Pasarela
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredGateways.map((gateway) => (
              <PaymentGatewayCard
                key={gateway.id}
                gateway={gateway}
                onEdit={handleEditGateway}
                onView={handleViewGateway}
                onDelete={handleDeleteGateway}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <PaymentGatewayModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveGateway}
        gateway={selectedGateway}
        mode={modalMode}
      />
    </div>
  );
}