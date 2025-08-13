import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Plus, 
  Settings, 
  Eye, 
  Trash2, 
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Globe,
  Database,
  Cloud,
  Smartphone,
  Building,
  CreditCard,
  FileText,
  Mail,
  MessageSquare,
  BarChart3,
  Shield,
  Key,
  Link,
  Activity,
  Server,
  Cpu,
  HardDrive,
  Wifi,
  Code,
  Terminal,
  Monitor,
  Layers,
  Play,
  Pause,
  Upload,
  Download,
  Search,
  Filter,
  Save,
  X,
  Edit,
  Copy,
  ExternalLink,
  Info,
  Webhook,
  Api,
  Lock,
  Unlock
} from 'lucide-react';

interface PlatformIntegration {
  id: string;
  name: string;
  type: 'database' | 'payment' | 'storage' | 'ai' | 'communication' | 'analytics' | 'crm' | 'erp' | 'document' | 'custom';
  status: 'connected' | 'disconnected' | 'error' | 'warning' | 'testing';
  description: string;
  provider: string;
  version: string;
  endpoint_url: string;
  api_key?: string;
  secret_key?: string;
  webhook_url?: string;
  config: {
    [key: string]: any;
  };
  health_check: {
    last_check: string;
    response_time: number;
    uptime_percentage: number;
    error_rate: number;
  };
  usage_stats: {
    requests_today: number;
    requests_this_month: number;
    data_transferred: number;
    cost_this_month: number;
  };
  features: string[];
  rate_limits: {
    requests_per_minute: number;
    requests_per_hour: number;
    requests_per_day: number;
  };
  created_at: string;
  updated_at: string;
  last_sync: string;
}

interface IntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (integration: Partial<PlatformIntegration>) => Promise<void>;
  integration?: PlatformIntegration | null;
  mode: 'create' | 'edit' | 'view';
}

function IntegrationModal({ isOpen, onClose, onSave, integration, mode }: IntegrationModalProps) {
  const [formData, setFormData] = useState({
    name: integration?.name || '',
    type: integration?.type || 'custom',
    provider: integration?.provider || '',
    description: integration?.description || '',
    endpoint_url: integration?.endpoint_url || '',
    api_key: integration?.api_key || '',
    secret_key: integration?.secret_key || '',
    webhook_url: integration?.webhook_url || '',
    version: integration?.version || '1.0'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const integrationTypes = [
    { value: 'database', label: 'Base de Datos', icon: Database, color: 'bg-blue-600' },
    { value: 'payment', label: 'Pagos', icon: CreditCard, color: 'bg-green-600' },
    { value: 'storage', label: 'Almacenamiento', icon: Cloud, color: 'bg-purple-600' },
    { value: 'ai', label: 'Inteligencia Artificial', icon: Cpu, color: 'bg-pink-600' },
    { value: 'communication', label: 'Comunicación', icon: MessageSquare, color: 'bg-orange-600' },
    { value: 'analytics', label: 'Analíticas', icon: BarChart3, color: 'bg-indigo-600' },
    { value: 'crm', label: 'CRM', icon: Users, color: 'bg-teal-600' },
    { value: 'erp', label: 'ERP', icon: Building, color: 'bg-gray-600' },
    { value: 'document', label: 'Documentos', icon: FileText, color: 'bg-yellow-600' },
    { value: 'custom', label: 'Personalizada', icon: Code, color: 'bg-red-600' }
  ];

  const testConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    
    try {
      // Simular test de conexión
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simular resultado aleatorio
      const success = Math.random() > 0.3;
      setTestResult({
        success,
        message: success 
          ? 'Conexión exitosa. La integración está funcionando correctamente.'
          : 'Error de conexión. Verifica las credenciales y la URL del endpoint.'
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Error al probar la conexión.'
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const integrationData = {
        ...formData,
        config: {},
        health_check: {
          last_check: new Date().toISOString(),
          response_time: Math.floor(Math.random() * 500) + 50,
          uptime_percentage: 99.5,
          error_rate: 0.1
        },
        usage_stats: {
          requests_today: 0,
          requests_this_month: 0,
          data_transferred: 0,
          cost_this_month: 0
        },
        features: [],
        rate_limits: {
          requests_per_minute: 60,
          requests_per_hour: 3600,
          requests_per_day: 86400
        },
        status: 'disconnected' as const,
        last_sync: new Date().toISOString()
      };

      await onSave(integrationData);
      onClose();
    } catch (error) {
      console.error('Error saving integration:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const isReadOnly = mode === 'view';
  const selectedType = integrationTypes.find(t => t.value === formData.type);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white/20 p-3 rounded-full mr-4">
                {selectedType && <selectedType.icon className="h-8 w-8" />}
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {mode === 'create' ? 'Nueva Integración' : 
                   mode === 'edit' ? 'Editar Integración' : 
                   'Detalles de Integración'}
                </h2>
                <p className="text-blue-100">
                  {mode === 'create' ? 'Conectar nueva plataforma' : 
                   mode === 'edit' ? 'Modificar configuración' : 
                   'Información de la integración'}
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
                  Nombre de la Integración *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  disabled={isReadOnly}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder="Ej: Stripe Payments"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Integración *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  disabled={isReadOnly}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  required
                >
                  {integrationTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proveedor *
                </label>
                <input
                  type="text"
                  value={formData.provider}
                  onChange={(e) => setFormData(prev => ({ ...prev, provider: e.target.value }))}
                  disabled={isReadOnly}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder="Ej: Stripe, Google, Microsoft"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Versión de API
                </label>
                <input
                  type="text"
                  value={formData.version}
                  onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                  disabled={isReadOnly}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder="v1.0, v2.0, latest"
                />
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="Describe qué hace esta integración..."
                required
              />
            </div>
          </div>

          {/* Configuración de Conexión */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-4">Configuración de Conexión</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL del Endpoint *
                </label>
                <input
                  type="url"
                  value={formData.endpoint_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, endpoint_url: e.target.value }))}
                  disabled={isReadOnly}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder="https://api.ejemplo.com/v1"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showSecrets ? 'text' : 'password'}
                      value={formData.api_key}
                      onChange={(e) => setFormData(prev => ({ ...prev, api_key: e.target.value }))}
                      disabled={isReadOnly}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      placeholder="sk_test_..."
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecrets(!showSecrets)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showSecrets ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                    </button>
                  </div>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    placeholder="sk_live_..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Webhook URL
                </label>
                <input
                  type="url"
                  value={formData.webhook_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, webhook_url: e.target.value }))}
                  disabled={isReadOnly}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder="https://tu-dominio.com/webhooks/integration"
                />
              </div>
            </div>
          </div>

          {/* Test de Conexión */}
          {!isReadOnly && (
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Test de Conexión</h3>
                <button
                  type="button"
                  onClick={testConnection}
                  disabled={testingConnection || !formData.endpoint_url}
                  className="flex items-center px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {testingConnection ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Probando...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Probar Conexión
                    </>
                  )}
                </button>
              </div>

              {testResult && (
                <div className={`p-3 rounded-lg ${
                  testResult.success 
                    ? 'bg-green-100 border border-green-200' 
                    : 'bg-red-100 border border-red-200'
                }`}>
                  <div className="flex items-center">
                    {testResult.success ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 mr-2" />
                    )}
                    <span className={`text-sm ${
                      testResult.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {testResult.message}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

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
                    {mode === 'create' ? 'Crear Integración' : 'Guardar Cambios'}
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

interface IntegrationCardProps {
  integration: PlatformIntegration;
  onEdit: (integration: PlatformIntegration) => void;
  onView: (integration: PlatformIntegration) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

function IntegrationCard({ integration, onEdit, onView, onDelete, onToggleStatus }: IntegrationCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-100 border-green-200';
      case 'disconnected': return 'text-gray-600 bg-gray-100 border-gray-200';
      case 'error': return 'text-red-600 bg-red-100 border-red-200';
      case 'warning': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'testing': return 'text-blue-600 bg-blue-100 border-blue-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4" />;
      case 'disconnected': return <XCircle className="h-4 w-4" />;
      case 'error': return <AlertTriangle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'testing': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    const typeMap = {
      database: Database,
      payment: CreditCard,
      storage: Cloud,
      ai: Cpu,
      communication: MessageSquare,
      analytics: BarChart3,
      crm: Users,
      erp: Building,
      document: FileText,
      custom: Code
    };
    return typeMap[type as keyof typeof typeMap] || Code;
  };

  const getTypeColor = (type: string) => {
    const colorMap = {
      database: 'bg-blue-600',
      payment: 'bg-green-600',
      storage: 'bg-purple-600',
      ai: 'bg-pink-600',
      communication: 'bg-orange-600',
      analytics: 'bg-indigo-600',
      crm: 'bg-teal-600',
      erp: 'bg-gray-600',
      document: 'bg-yellow-600',
      custom: 'bg-red-600'
    };
    return colorMap[type as keyof typeof colorMap] || 'bg-gray-600';
  };

  const TypeIcon = getTypeIcon(integration.type);

  return (
    <div className={`border-2 rounded-xl p-6 transition-all hover:shadow-lg ${getStatusColor(integration.status)}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className={`w-12 h-12 ${getTypeColor(integration.type)} rounded-lg flex items-center justify-center mr-4`}>
            <TypeIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{integration.name}</h3>
            <p className="text-sm text-gray-600">{integration.provider} • v{integration.version}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusIcon(integration.status)}
          <span className="text-sm font-medium capitalize">{integration.status}</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-700 text-sm mb-4 line-clamp-2">{integration.description}</p>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-white/50 rounded-lg">
          <div className="text-lg font-bold text-gray-900">
            {integration.usage_stats.requests_today.toLocaleString()}
          </div>
          <div className="text-xs text-gray-600">Requests hoy</div>
        </div>
        <div className="text-center p-3 bg-white/50 rounded-lg">
          <div className="text-lg font-bold text-gray-900">
            {integration.health_check.response_time}ms
          </div>
          <div className="text-xs text-gray-600">Tiempo respuesta</div>
        </div>
      </div>

      {/* Health Metrics */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Uptime:</span>
          <span className="font-medium">{integration.health_check.uptime_percentage}%</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Error rate:</span>
          <span className="font-medium">{integration.health_check.error_rate}%</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        <button
          onClick={() => onView(integration)}
          className="flex-1 px-3 py-2 bg-white/50 hover:bg-white/75 rounded-lg transition-colors text-sm font-medium flex items-center justify-center"
        >
          <Eye className="h-3 w-3 mr-1" />
          Ver
        </button>
        <button
          onClick={() => onEdit(integration)}
          className="flex-1 px-3 py-2 bg-white/50 hover:bg-white/75 rounded-lg transition-colors text-sm font-medium flex items-center justify-center"
        >
          <Edit className="h-3 w-3 mr-1" />
          Editar
        </button>
        <button
          onClick={() => onToggleStatus(integration.id)}
          className="px-3 py-2 bg-white/50 hover:bg-white/75 rounded-lg transition-colors"
        >
          {integration.status === 'connected' ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
        </button>
        <button
          onClick={() => onDelete(integration.id)}
          className="px-3 py-2 bg-white/50 hover:bg-white/75 rounded-lg transition-colors text-red-600"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>

      {/* Last Sync */}
      <div className="mt-3 pt-3 border-t border-white/30">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>Última sincronización:</span>
          <span>{new Date(integration.last_sync).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

export default function PlatformIntegrationModule() {
  const [integrations, setIntegrations] = useState<PlatformIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedIntegration, setSelectedIntegration] = useState<PlatformIntegration | null>(null);

  // Integraciones predefinidas populares
  const popularIntegrations = [
    { name: 'Stripe', type: 'payment', provider: 'Stripe Inc.', description: 'Procesamiento de pagos online', icon: CreditCard },
    { name: 'PayPal', type: 'payment', provider: 'PayPal', description: 'Pagos digitales globales', icon: CreditCard },
    { name: 'Google Drive', type: 'storage', provider: 'Google', description: 'Almacenamiento en la nube', icon: Cloud },
    { name: 'Dropbox', type: 'storage', provider: 'Dropbox', description: 'Sincronización de archivos', icon: Cloud },
    { name: 'OpenAI', type: 'ai', provider: 'OpenAI', description: 'Servicios de inteligencia artificial', icon: Cpu },
    { name: 'Google Analytics', type: 'analytics', provider: 'Google', description: 'Análisis web avanzado', icon: BarChart3 },
    { name: 'Salesforce', type: 'crm', provider: 'Salesforce', description: 'Gestión de relaciones con clientes', icon: Users },
    { name: 'SAP', type: 'erp', provider: 'SAP', description: 'Planificación de recursos empresariales', icon: Building },
    { name: 'Slack', type: 'communication', provider: 'Slack', description: 'Comunicación empresarial', icon: MessageSquare },
    { name: 'Microsoft Teams', type: 'communication', provider: 'Microsoft', description: 'Colaboración y comunicación', icon: MessageSquare },
    { name: 'DocuSign', type: 'document', provider: 'DocuSign', description: 'Firma electrónica de documentos', icon: FileText },
    { name: 'Twilio', type: 'communication', provider: 'Twilio', description: 'Comunicaciones programables', icon: MessageSquare }
  ];

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      setLoading(true);
      
      // Simular carga de integraciones desde la base de datos
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Datos de ejemplo
      const mockIntegrations: PlatformIntegration[] = [
        {
          id: '1',
          name: 'Supabase Database',
          type: 'database',
          status: 'connected',
          description: 'Base de datos principal de ConstructIA',
          provider: 'Supabase',
          version: '2.39.3',
          endpoint_url: 'https://phbjqlytkeifcobaxunt.supabase.co',
          config: { ssl: true, pooling: true },
          health_check: {
            last_check: new Date().toISOString(),
            response_time: 89,
            uptime_percentage: 99.9,
            error_rate: 0.1
          },
          usage_stats: {
            requests_today: 15678,
            requests_this_month: 456789,
            data_transferred: 2.4,
            cost_this_month: 45.67
          },
          features: ['Real-time', 'Auth', 'Storage', 'Edge Functions'],
          rate_limits: {
            requests_per_minute: 1000,
            requests_per_hour: 60000,
            requests_per_day: 1440000
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_sync: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Stripe Payments',
          type: 'payment',
          status: 'connected',
          description: 'Procesamiento de pagos y suscripciones',
          provider: 'Stripe',
          version: '2023-10-16',
          endpoint_url: 'https://api.stripe.com/v1',
          config: { webhooks_enabled: true, test_mode: false },
          health_check: {
            last_check: new Date().toISOString(),
            response_time: 234,
            uptime_percentage: 99.8,
            error_rate: 0.2
          },
          usage_stats: {
            requests_today: 234,
            requests_this_month: 7890,
            data_transferred: 0.8,
            cost_this_month: 23.45
          },
          features: ['Payments', 'Subscriptions', 'Webhooks', 'Connect'],
          rate_limits: {
            requests_per_minute: 100,
            requests_per_hour: 6000,
            requests_per_day: 144000
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_sync: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Google AI Platform',
          type: 'ai',
          status: 'warning',
          description: 'Servicios de inteligencia artificial para clasificación',
          provider: 'Google Cloud',
          version: 'v1',
          endpoint_url: 'https://aiplatform.googleapis.com/v1',
          config: { model: 'gemini-pro', region: 'us-central1' },
          health_check: {
            last_check: new Date().toISOString(),
            response_time: 567,
            uptime_percentage: 98.5,
            error_rate: 1.2
          },
          usage_stats: {
            requests_today: 456,
            requests_this_month: 12345,
            data_transferred: 1.2,
            cost_this_month: 67.89
          },
          features: ['Text Analysis', 'Document Classification', 'OCR', 'Translation'],
          rate_limits: {
            requests_per_minute: 60,
            requests_per_hour: 3600,
            requests_per_day: 86400
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_sync: new Date().toISOString()
        }
      ];

      setIntegrations(mockIntegrations);
    } catch (error) {
      console.error('Error loading integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIntegration = () => {
    setSelectedIntegration(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleEditIntegration = (integration: PlatformIntegration) => {
    setSelectedIntegration(integration);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleViewIntegration = (integration: PlatformIntegration) => {
    setSelectedIntegration(integration);
    setModalMode('view');
    setShowModal(true);
  };

  const handleSaveIntegration = async (integrationData: Partial<PlatformIntegration>) => {
    try {
      if (modalMode === 'create') {
        const newIntegration: PlatformIntegration = {
          id: `integration_${Date.now()}`,
          created_at: new Date().toISOString(),
          ...integrationData
        } as PlatformIntegration;
        
        setIntegrations(prev => [...prev, newIntegration]);
      } else if (modalMode === 'edit' && selectedIntegration) {
        setIntegrations(prev => prev.map(integration => 
          integration.id === selectedIntegration.id 
            ? { ...integration, ...integrationData, updated_at: new Date().toISOString() }
            : integration
        ));
      }
    } catch (error) {
      console.error('Error saving integration:', error);
      throw error;
    }
  };

  const handleDeleteIntegration = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta integración?')) {
      setIntegrations(prev => prev.filter(integration => integration.id !== id));
    }
  };

  const handleToggleStatus = async (id: string) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === id 
        ? { 
            ...integration, 
            status: integration.status === 'connected' ? 'disconnected' : 'connected',
            updated_at: new Date().toISOString()
          }
        : integration
    ));
  };

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || integration.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || integration.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = {
    total: integrations.length,
    connected: integrations.filter(i => i.status === 'connected').length,
    disconnected: integrations.filter(i => i.status === 'disconnected').length,
    errors: integrations.filter(i => i.status === 'error').length,
    totalRequests: integrations.reduce((sum, i) => sum + i.usage_stats.requests_today, 0),
    avgResponseTime: integrations.length > 0 
      ? Math.round(integrations.reduce((sum, i) => sum + i.health_check.response_time, 0) / integrations.length)
      : 0
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-gray-600">Cargando integraciones...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Integraciones de Plataforma</h2>
            <p className="text-purple-100 mt-1">Conecta ConstructIA con servicios externos</p>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={loadIntegrations}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </button>
            <button
              onClick={handleCreateIntegration}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Integración
            </button>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Layers className="w-5 h-5 text-blue-600" />
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
              <p className="text-sm text-gray-600">Conectadas</p>
              <p className="text-xl font-semibold text-green-600">{stats.connected}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-50 rounded-lg">
              <XCircle className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Desconectadas</p>
              <p className="text-xl font-semibold text-gray-600">{stats.disconnected}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Errores</p>
              <p className="text-xl font-semibold text-red-600">{stats.errors}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Activity className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Requests Hoy</p>
              <p className="text-xl font-semibold text-purple-600">{stats.totalRequests.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tiempo Resp.</p>
              <p className="text-xl font-semibold text-orange-600">{stats.avgResponseTime}ms</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar integraciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">Todos los tipos</option>
              <option value="database">Base de Datos</option>
              <option value="payment">Pagos</option>
              <option value="storage">Almacenamiento</option>
              <option value="ai">IA</option>
              <option value="communication">Comunicación</option>
              <option value="analytics">Analíticas</option>
              <option value="crm">CRM</option>
              <option value="erp">ERP</option>
              <option value="document">Documentos</option>
              <option value="custom">Personalizada</option>
            </select>
          </div>

          <div className="relative">
            <Activity className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">Todos los estados</option>
              <option value="connected">Conectadas</option>
              <option value="disconnected">Desconectadas</option>
              <option value="error">Con errores</option>
              <option value="warning">Con advertencias</option>
              <option value="testing">En pruebas</option>
            </select>
          </div>

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

      {/* Integraciones Populares */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Integraciones Populares</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {popularIntegrations.map((popular, index) => {
            const Icon = popular.icon;
            const isAlreadyIntegrated = integrations.some(i => i.name === popular.name);
            
            return (
              <button
                key={index}
                onClick={() => {
                  if (!isAlreadyIntegrated) {
                    setSelectedIntegration(null);
                    setModalMode('create');
                    setShowModal(true);
                    // Pre-llenar el formulario con datos de la integración popular
                    setTimeout(() => {
                      setSelectedIntegration({
                        name: popular.name,
                        type: popular.type,
                        provider: popular.provider,
                        description: popular.description
                      } as PlatformIntegration);
                    }, 100);
                  }
                }}
                disabled={isAlreadyIntegrated}
                className={`p-4 border-2 border-dashed rounded-lg transition-all text-center ${
                  isAlreadyIntegrated
                    ? 'border-green-300 bg-green-50 cursor-not-allowed'
                    : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                }`}
              >
                <Icon className={`h-8 w-8 mx-auto mb-2 ${
                  isAlreadyIntegrated ? 'text-green-600' : 'text-gray-400'
                }`} />
                <p className={`text-sm font-medium ${
                  isAlreadyIntegrated ? 'text-green-800' : 'text-gray-700'
                }`}>
                  {popular.name}
                </p>
                {isAlreadyIntegrated && (
                  <div className="flex items-center justify-center mt-1">
                    <CheckCircle className="h-3 w-3 text-green-600 mr-1" />
                    <span className="text-xs text-green-600">Integrado</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Lista de Integraciones */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Integraciones Activas ({filteredIntegrations.length})
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {stats.connected} conectadas • {stats.errors} con errores
            </span>
          </div>
        </div>

        {filteredIntegrations.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || typeFilter !== 'all' || statusFilter !== 'all' 
                ? 'No se encontraron integraciones' 
                : 'No hay integraciones configuradas'
              }
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Comienza conectando tu primera plataforma externa'
              }
            </p>
            {!searchTerm && typeFilter === 'all' && statusFilter === 'all' && (
              <button
                onClick={handleCreateIntegration}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Crear Primera Integración
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredIntegrations.map((integration) => (
              <IntegrationCard
                key={integration.id}
                integration={integration}
                onEdit={handleEditIntegration}
                onView={handleViewIntegration}
                onDelete={handleDeleteIntegration}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <IntegrationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveIntegration}
        integration={selectedIntegration}
        mode={modalMode}
      />
    </div>
  );
}