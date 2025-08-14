import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  AlertCircle, 
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  FileText,
  Clock,
  Building2,
  CreditCard,
  Shield,
  Activity,
  BarChart3,
  RefreshCw,
  Download,
  Settings,
  Key,
  Phone,
  Mail,
  MapPin,
  Hash,
  User,
  Save,
  X,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { 
  supabase, 
  getAllClients, 
  updateClientObraliaCredentials,
  getKPIs,
  calculateDynamicKPIs,
  getAuditLogs
} from '../../lib/supabase';

interface Client {
  id: string;
  client_id: string;
  user_id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  address: string;
  subscription_plan: string;
  subscription_status: string;
  storage_used: number;
  storage_limit: number;
  documents_processed: number;
  tokens_available: number;
  obralia_credentials: {
    username?: string;
    password?: string;
    configured: boolean;
  };
  created_at: string;
  updated_at: string;
  last_activity?: string;
  monthly_revenue?: number;
}

interface ClientKPI {
  id: string;
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ElementType;
  color: string;
  description: string;
}

interface EditClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  onSave: (clientData: Partial<Client>) => Promise<void>;
}

function EditClientModal({ isOpen, onClose, client, onSave }: EditClientModalProps) {
  const [formData, setFormData] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    address: '',
    subscription_plan: 'basic',
    subscription_status: 'active',
    storage_limit: 524288000,
    tokens_available: 500
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (client) {
      setFormData({
        company_name: client.company_name,
        contact_name: client.contact_name,
        email: client.email,
        phone: client.phone || '',
        address: client.address || '',
        subscription_plan: client.subscription_plan,
        subscription_status: client.subscription_status,
        storage_limit: client.storage_limit,
        tokens_available: client.tokens_available
      });
    }
  }, [client]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;

    setSaving(true);
    try {
      await onSave({ ...formData, id: client.id });
      onClose();
    } catch (error) {
      console.error('Error saving client:', error);
      alert('Error al guardar los cambios del cliente');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !client) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Editar Cliente</h2>
              <p className="text-blue-100">{client.company_name}</p>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la Empresa *
              </label>
              <input
                type="text"
                value={formData.company_name}
                onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de Contacto *
              </label>
              <input
                type="text"
                value={formData.contact_name}
                onChange={(e) => setFormData(prev => ({ ...prev, contact_name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dirección
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plan de Suscripción *
              </label>
              <select
                value={formData.subscription_plan}
                onChange={(e) => setFormData(prev => ({ ...prev, subscription_plan: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="basic">Basic</option>
                <option value="professional">Professional</option>
                <option value="enterprise">Enterprise</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado de Suscripción *
              </label>
              <select
                value={formData.subscription_status}
                onChange={(e) => setFormData(prev => ({ ...prev, subscription_status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Activo</option>
                <option value="suspended">Suspendido</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Límite de Almacenamiento (MB)
              </label>
              <input
                type="number"
                value={Math.round(formData.storage_limit / 1048576)}
                onChange={(e) => setFormData(prev => ({ ...prev, storage_limit: parseInt(e.target.value) * 1048576 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tokens Disponibles
              </label>
              <input
                type="number"
                value={formData.tokens_available}
                onChange={(e) => setFormData(prev => ({ ...prev, tokens_available: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface ClientDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  onEdit: (client: Client) => void;
  onConfigureObralia: (client: Client) => void;
}

function ClientDetailsModal({ isOpen, onClose, client, onEdit, onConfigureObralia }: ClientDetailsModalProps) {
  if (!isOpen || !client) return null;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'suspended': return 'text-yellow-600 bg-yellow-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'basic': return 'text-blue-600 bg-blue-100';
      case 'professional': return 'text-purple-600 bg-purple-100';
      case 'enterprise': return 'text-orange-600 bg-orange-100';
      case 'custom': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white/20 p-3 rounded-full mr-4">
                <Building2 className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Detalles del Cliente</h2>
                <p className="text-green-100">{client.company_name}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Información General */}
            <div className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Información General
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Hash className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600 w-20">ID:</span>
                    <span className="text-sm font-mono text-gray-900">{client.client_id}</span>
                  </div>
                  <div className="flex items-center">
                    <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600 w-20">Empresa:</span>
                    <span className="text-sm text-gray-900">{client.company_name}</span>
                  </div>
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600 w-20">Contacto:</span>
                    <span className="text-sm text-gray-900">{client.contact_name}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600 w-20">Email:</span>
                    <span className="text-sm text-gray-900">{client.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600 w-20">Teléfono:</span>
                    <span className="text-sm text-gray-900">{client.phone || 'No especificado'}</span>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                    <span className="text-sm text-gray-600 w-20">Dirección:</span>
                    <span className="text-sm text-gray-900">{client.address || 'No especificada'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Suscripción y Uso
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Plan:</span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPlanColor(client.subscription_plan)}`}>
                      {client.subscription_plan.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Estado:</span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(client.subscription_status)}`}>
                      {client.subscription_status === 'active' ? 'Activo' : 
                       client.subscription_status === 'suspended' ? 'Suspendido' : 'Cancelado'}
                    </span>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Almacenamiento:</span>
                      <span className="text-gray-900">
                        {formatBytes(client.storage_used)} / {formatBytes(client.storage_limit)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ width: `${Math.min((client.storage_used / client.storage_limit) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Documentos procesados:</span>
                    <span className="text-sm font-medium text-gray-900">{client.documents_processed}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tokens disponibles:</span>
                    <span className="text-sm font-medium text-gray-900">{client.tokens_available}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Configuración e Historial */}
            <div className="space-y-6">
              <div className="bg-orange-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-orange-900 mb-4 flex items-center">
                  <Key className="h-5 w-5 mr-2" />
                  Configuración Obralia
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Estado:</span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      client.obralia_credentials?.configured 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {client.obralia_credentials?.configured ? 'Configurado' : 'Sin configurar'}
                    </span>
                  </div>
                  {client.obralia_credentials?.configured && (
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600 w-16">Usuario:</span>
                        <span className="text-sm font-mono text-gray-900">
                          {client.obralia_credentials.username || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600 w-16">Password:</span>
                        <span className="text-sm font-mono text-gray-900">••••••••</span>
                      </div>
                    </div>
                  )}
                  <button
                    onClick={() => onConfigureObralia(client)}
                    className="w-full mt-3 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                  >
                    {client.obralia_credentials?.configured ? 'Reconfigurar' : 'Configurar'} Obralia
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Historial
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Registro:</span>
                    <span className="text-gray-900">{formatDate(client.created_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Última actualización:</span>
                    <span className="text-gray-900">{formatDate(client.updated_at)}</span>
                  </div>
                  {client.last_activity && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Última actividad:</span>
                      <span className="text-gray-900">{formatDate(client.last_activity)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={() => onEdit(client)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Editar Cliente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ObraliaConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  onSave: (clientId: string, credentials: { username: string; password: string }) => Promise<void>;
}

function ObraliaConfigModal({ isOpen, onClose, client, onSave }: ObraliaConfigModalProps) {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (client?.obralia_credentials) {
      setCredentials({
        username: client.obralia_credentials.username || '',
        password: client.obralia_credentials.password || ''
      });
    }
  }, [client]);

  const handleSave = async () => {
    if (!client || !credentials.username || !credentials.password) return;
    
    setSaving(true);
    try {
      await onSave(client.id, credentials);
      onClose();
    } catch (error) {
      console.error('Error saving credentials:', error);
      alert('Error al guardar las credenciales');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !client) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Configurar Obralia</h2>
              <p className="text-orange-100">{client.company_name}</p>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <h4 className="font-semibold text-yellow-800 mb-2">📋 Credenciales de Acceso</h4>
            <p className="text-sm text-yellow-700">
              Solicita al cliente sus credenciales de Obralia/Nalanda para configurar la integración automática.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Usuario de Obralia *
            </label>
            <input
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              placeholder="usuario@obralia.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña de Obralia *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <Eye className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !credentials.username || !credentials.password}
              className="flex items-center px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Credenciales
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ClientsManagement() {
  const [clients, setClients] = useState<Client[]>([]);
  const [kpis, setKpis] = useState<ClientKPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPlan, setFilterPlan] = useState('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showObraliaModal, setShowObraliaModal] = useState(false);

  useEffect(() => {
    loadClientsData();
  }, []);

  const loadClientsData = async () => {
    try {
      setLoading(true);
      
      const [clientsData, kpisData, dynamicKPIs] = await Promise.all([
        getAllClients(),
        getKPIs(),
        calculateDynamicKPIs()
      ]);

      setClients(clientsData);

      // Calcular KPIs específicos de clientes
      const activeClients = clientsData.filter(c => c.subscription_status === 'active').length;
      const suspendedClients = clientsData.filter(c => c.subscription_status === 'suspended').length;
      const cancelledClients = clientsData.filter(c => c.subscription_status === 'cancelled').length;
      const enterpriseClients = clientsData.filter(c => c.subscription_plan === 'enterprise').length;
      const professionalClients = clientsData.filter(c => c.subscription_plan === 'professional').length;
      const basicClients = clientsData.filter(c => c.subscription_plan === 'basic').length;
      const customClients = clientsData.filter(c => c.subscription_plan === 'custom').length;
      const obraliaConfigured = clientsData.filter(c => c.obralia_credentials?.configured).length;

      // Calcular nuevos clientes este mes
      const thisMonth = new Date();
      const newClientsThisMonth = clientsData.filter(c => {
        const clientDate = new Date(c.created_at);
        return clientDate.getMonth() === thisMonth.getMonth() && 
               clientDate.getFullYear() === thisMonth.getFullYear();
      }).length;

      // Calcular ingresos promedio por cliente
      const totalRevenue = dynamicKPIs.totalRevenue || 0;
      const avgRevenuePerClient = activeClients > 0 ? totalRevenue / activeClients : 0;

      const clientKPIs: ClientKPI[] = [
        {
          id: 'total-clients',
          title: 'Total Clientes',
          value: clientsData.length,
          change: 23.5,
          trend: 'up',
          icon: Users,
          color: 'bg-blue-500',
          description: 'Clientes registrados en total'
        },
        {
          id: 'active-clients',
          title: 'Clientes Activos',
          value: activeClients,
          change: 18.2,
          trend: 'up',
          icon: CheckCircle,
          color: 'bg-green-500',
          description: 'Clientes con suscripción activa'
        },
        {
          id: 'new-clients',
          title: 'Nuevos Este Mes',
          value: newClientsThisMonth,
          change: 45.7,
          trend: 'up',
          icon: TrendingUp,
          color: 'bg-emerald-500',
          description: 'Nuevos clientes este mes'
        },
        {
          id: 'enterprise-clients',
          title: 'Enterprise',
          value: enterpriseClients,
          change: 33.3,
          trend: 'up',
          icon: Building2,
          color: 'bg-purple-500',
          description: 'Clientes Enterprise'
        },
        {
          id: 'professional-clients',
          title: 'Professional',
          value: professionalClients,
          change: 21.4,
          trend: 'up',
          icon: CreditCard,
          color: 'bg-indigo-500',
          description: 'Clientes Professional'
        },
        {
          id: 'basic-clients',
          title: 'Basic',
          value: basicClients,
          change: 7.1,
          trend: 'up',
          icon: Shield,
          color: 'bg-cyan-500',
          description: 'Clientes Basic'
        },
        {
          id: 'suspended-clients',
          title: 'Suspendidos',
          value: suspendedClients,
          change: -20.0,
          trend: 'up',
          icon: AlertCircle,
          color: 'bg-yellow-500',
          description: 'Clientes suspendidos'
        },
        {
          id: 'cancelled-clients',
          title: 'Cancelados',
          value: cancelledClients,
          change: -11.1,
          trend: 'up',
          icon: X,
          color: 'bg-red-500',
          description: 'Clientes cancelados'
        },
        {
          id: 'avg-revenue',
          title: 'Ingresos/Cliente',
          value: `€${avgRevenuePerClient.toFixed(0)}`,
          change: 14.2,
          trend: 'up',
          icon: DollarSign,
          color: 'bg-orange-500',
          description: 'Ingresos promedio por cliente'
        },
        {
          id: 'obralia-configured',
          title: 'Obralia Config.',
          value: obraliaConfigured,
          change: 28.0,
          trend: 'up',
          icon: Key,
          color: 'bg-pink-500',
          description: 'Clientes con Obralia configurado'
        }
      ];

      setKpis(clientKPIs);
    } catch (error) {
      console.error('Error loading clients data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadClientsData();
    setRefreshing(false);
  };

  const handleViewClient = (client: Client) => {
    setSelectedClient(client);
    setShowDetailsModal(true);
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setShowEditModal(true);
  };

  const handleConfigureObralia = (client: Client) => {
    setSelectedClient(client);
    setShowObraliaModal(true);
  };

  const handleSaveClient = async (clientData: Partial<Client>) => {
    try {
      const { error } = await supabase
        .from('clients')
        .update({
          ...clientData,
          updated_at: new Date().toISOString()
        })
        .eq('id', clientData.id);

      if (error) {
        throw new Error(`Error updating client: ${error.message}`);
      }

      await loadClientsData();
    } catch (error) {
      console.error('Error saving client:', error);
      throw error;
    }
  };

  const handleSaveObraliaCredentials = async (clientId: string, credentials: { username: string; password: string }) => {
    try {
      await updateClientObraliaCredentials(clientId, credentials);
      await loadClientsData();
    } catch (error) {
      console.error('Error saving Obralia credentials:', error);
      throw error;
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este cliente? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId);

      if (error) {
        throw new Error(`Error deleting client: ${error.message}`);
      }

      await loadClientsData();
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('Error al eliminar el cliente');
    }
  };

  const exportClientsData = () => {
    const csvContent = [
      ['ID Cliente', 'Empresa', 'Contacto', 'Email', 'Plan', 'Estado', 'Documentos', 'Almacenamiento', 'Registro'].join(','),
      ...filteredClients.map(client => [
        client.client_id,
        client.company_name,
        client.contact_name,
        client.email,
        client.subscription_plan,
        client.subscription_status,
        client.documents_processed,
        `${Math.round((client.storage_used / client.storage_limit) * 100)}%`,
        new Date(client.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clientes_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUp className="w-4 h-4 text-green-500" />;
      case 'down': return <ArrowDown className="w-4 h-4 text-red-500" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.client_id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || client.subscription_status === filterStatus;
    const matchesPlan = filterPlan === 'all' || client.subscription_plan === filterPlan;

    return matchesSearch && matchesStatus && matchesPlan;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'suspended': return 'text-yellow-600 bg-yellow-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'basic': return 'text-blue-600 bg-blue-100';
      case 'professional': return 'text-purple-600 bg-purple-100';
      case 'enterprise': return 'text-orange-600 bg-orange-100';
      case 'custom': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando gestión de clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Gestión de Clientes</h1>
            <p className="text-blue-100 mb-4">
              Panel integral de administración y análisis de clientes
            </p>
            <div className="space-y-1 text-sm text-blue-100">
              <p>• Análisis completo de base de clientes y tendencias</p>
              <p>• Gestión de suscripciones y configuraciones</p>
              <p>• Métricas de adquisición y retención</p>
              <p>• Configuración de integraciones por cliente</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={refreshData}
              disabled={refreshing}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Actualizando...' : 'Actualizar'}
            </button>
            <button 
              onClick={exportClientsData}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </button>
          </div>
        </div>
      </div>

      {/* KPIs de Clientes */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${kpi.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center space-x-1">
                  {getTrendIcon(kpi.trend)}
                  <span className={`text-sm font-medium ${
                    kpi.change > 0 ? 'text-green-600' : kpi.change < 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {kpi.change > 0 ? '+' : ''}{kpi.change}%
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">{kpi.title}</h3>
                <p className="text-2xl font-bold text-gray-900 mb-1">{kpi.value}</p>
                <p className="text-xs text-gray-500">{kpi.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por empresa, contacto, email o ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activo</option>
                <option value="suspended">Suspendido</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
            <select
              value={filterPlan}
              onChange={(e) => setFilterPlan(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los planes</option>
              <option value="basic">Basic</option>
              <option value="professional">Professional</option>
              <option value="enterprise">Enterprise</option>
              <option value="custom">Custom</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de Clientes */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Almacenamiento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Documentos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Obralia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{client.company_name}</div>
                      <div className="text-sm text-gray-500">{client.contact_name}</div>
                      <div className="text-sm text-gray-500">{client.email}</div>
                      <div className="text-xs text-gray-400">ID: {client.client_id}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPlanColor(client.subscription_plan)}`}>
                      {client.subscription_plan.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(client.subscription_status)}`}>
                      {client.subscription_status === 'active' ? 'Activo' : 
                       client.subscription_status === 'suspended' ? 'Suspendido' : 'Cancelado'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatBytes(client.storage_used)} / {formatBytes(client.storage_limit)}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${Math.min((client.storage_used / client.storage_limit) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {Math.round((client.storage_used / client.storage_limit) * 100)}% usado
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-gray-400 mr-2" />
                      {client.documents_processed}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {client.obralia_credentials?.configured ? (
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          <span className="text-xs">Configurado</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-red-600">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          <span className="text-xs">Sin configurar</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(client.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewClient(client)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditClient(client)}
                        className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleConfigureObralia(client)}
                        className="text-orange-600 hover:text-orange-900 p-1 rounded hover:bg-orange-50"
                        title="Configurar Obralia"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClient(client.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredClients.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay clientes</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterStatus !== 'all' || filterPlan !== 'all'
                ? 'No se encontraron clientes con los filtros aplicados.'
                : 'No hay clientes registrados en el sistema.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Análisis de Tendencias */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Distribución por Plan</h3>
          <div className="space-y-4">
            {['enterprise', 'professional', 'basic', 'custom'].map((plan, index) => {
              const count = clients.filter(c => c.subscription_plan === plan).length;
              const percentage = clients.length > 0 ? (count / clients.length) * 100 : 0;
              const colors = ['bg-orange-500', 'bg-purple-500', 'bg-blue-500', 'bg-gray-500'];
              
              return (
                <div key={plan} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${colors[index]}`}></div>
                    <span className="text-sm text-gray-600 capitalize">{plan}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${colors[index]}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Estado de Suscripciones</h3>
          <div className="space-y-4">
            {['active', 'suspended', 'cancelled'].map((status, index) => {
              const count = clients.filter(c => c.subscription_status === status).length;
              const percentage = clients.length > 0 ? (count / clients.length) * 100 : 0;
              const colors = ['bg-green-500', 'bg-yellow-500', 'bg-red-500'];
              const labels = ['Activos', 'Suspendidos', 'Cancelados'];
              
              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${colors[index]}`}></div>
                    <span className="text-sm text-gray-600">{labels[index]}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${colors[index]}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Configuración Obralia</h3>
          <div className="space-y-4">
            {[
              { label: 'Configurados', count: clients.filter(c => c.obralia_credentials?.configured).length, color: 'bg-green-500' },
              { label: 'Sin configurar', count: clients.filter(c => !c.obralia_credentials?.configured).length, color: 'bg-red-500' }
            ].map((item, index) => {
              const percentage = clients.length > 0 ? (item.count / clients.length) * 100 : 0;
              
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${item.color}`}></div>
                    <span className="text-sm text-gray-600">{item.label}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${item.color}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8">{item.count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modales */}
      <ClientDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        client={selectedClient}
        onEdit={handleEditClient}
        onConfigureObralia={handleConfigureObralia}
      />

      <EditClientModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        client={selectedClient}
        onSave={handleSaveClient}
      />

      <ObraliaConfigModal
        isOpen={showObraliaModal}
        onClose={() => setShowObraliaModal(false)}
        client={selectedClient}
        onSave={handleSaveObraliaCredentials}
      />
    </div>
  );
}