import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  RefreshCw,
  Download,
  TrendingUp,
  TrendingDown,
  Minus,
  Building2,
  CreditCard,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Hash,
  Settings,
  Key,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  BarChart3,
  DollarSign,
  FileText,
  Database,
  Shield,
  Globe,
  Activity,
  Target,
  Award,
  Zap,
  User,
  Save,
  Package,
  FolderOpen,
  Lock,
  Unlock,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { 
  getAllClients, 
  getClientProjects, 
  getClientCompanies, 
  getClientDocuments,
  updateClientObraliaCredentials,
  supabase 
} from '../../lib/supabase';
import type { Client } from '../../types';

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

interface ClientDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  onUpdate: () => void;
}

function ClientDetailsModal({ isOpen, onClose, client, onUpdate }: ClientDetailsModalProps) {
  const [activeTab, setActiveTab] = useState('details');
  const [projects, setProjects] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (client && isOpen) {
      loadClientData();
    }
  }, [client, isOpen]);

  const loadClientData = async () => {
    if (!client) return;
    
    setLoading(true);
    try {
      const [projectsData, companiesData, documentsData] = await Promise.all([
        getClientProjects(client.id),
        getClientCompanies(client.id),
        getClientDocuments(client.id)
      ]);
      
      setProjects(projectsData || []);
      setCompanies(companiesData || []);
      setDocuments(documentsData || []);
    } catch (error) {
      console.error('Error loading client data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStoragePercentage = () => {
    if (!client || client.storage_limit === 0) return 0;
    return Math.round((client.storage_used / client.storage_limit) * 100);
  };

  if (!isOpen || !client) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white/20 p-3 rounded-full mr-4">
                <Building2 className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{client.company_name}</h2>
                <p className="text-blue-100">{client.contact_name} • {client.email}</p>
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

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'details', label: 'Detalles', icon: User },
              { id: 'projects', label: 'Proyectos', icon: FolderOpen },
              { id: 'companies', label: 'Empresas', icon: Building2 },
              { id: 'documents', label: 'Documentos', icon: FileText },
              { id: 'billing', label: 'Facturación', icon: CreditCard }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {activeTab === 'details' && (
                <div className="space-y-6">
                  {/* Client Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">ID Cliente</label>
                        <p className="mt-1 text-sm text-gray-900 font-mono">{client.client_id}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Empresa</label>
                        <p className="mt-1 text-sm text-gray-900">{client.company_name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Contacto</label>
                        <p className="mt-1 text-sm text-gray-900">{client.contact_name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <p className="mt-1 text-sm text-gray-900">{client.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                        <p className="mt-1 text-sm text-gray-900">{client.phone || 'No especificado'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Dirección</label>
                        <p className="mt-1 text-sm text-gray-900">{client.address || 'No especificada'}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Plan de Suscripción</label>
                        <span className={`mt-1 inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                          client.subscription_plan === 'enterprise' ? 'bg-purple-100 text-purple-800' :
                          client.subscription_plan === 'professional' ? 'bg-blue-100 text-blue-800' :
                          client.subscription_plan === 'custom' ? 'bg-orange-100 text-orange-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {client.subscription_plan.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Estado</label>
                        <span className={`mt-1 inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                          client.subscription_status === 'active' ? 'bg-green-100 text-green-800' :
                          client.subscription_status === 'suspended' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {client.subscription_status === 'active' ? 'Activo' :
                           client.subscription_status === 'suspended' ? 'Suspendido' : 'Cancelado'}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Almacenamiento</label>
                        <div className="mt-1">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>{formatBytes(client.storage_used)} / {formatBytes(client.storage_limit)}</span>
                            <span>{getStoragePercentage()}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                getStoragePercentage() > 90 ? 'bg-red-500' : 
                                getStoragePercentage() > 70 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(getStoragePercentage(), 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Tokens Disponibles</label>
                        <p className="mt-1 text-sm text-gray-900">{client.tokens_available}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Documentos Procesados</label>
                        <p className="mt-1 text-sm text-gray-900">{client.documents_processed}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Obralia Configurado</label>
                        <span className={`mt-1 inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                          client.obralia_credentials?.configured ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {client.obralia_credentials?.configured ? 'Sí' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'projects' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Proyectos ({projects.length})</h3>
                  {projects.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No hay proyectos registrados</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {projects.map((project) => (
                        <div key={project.id} className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900">{project.name}</h4>
                          <p className="text-sm text-gray-600 mb-2">{project.description}</p>
                          <div className="flex justify-between items-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              project.status === 'active' ? 'bg-green-100 text-green-800' :
                              project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                              project.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {project.status}
                            </span>
                            <span className="text-sm text-gray-600">{project.progress}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'companies' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Empresas ({companies.length})</h3>
                  {companies.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No hay empresas registradas</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {companies.map((company) => (
                        <div key={company.id} className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900">{company.name}</h4>
                          <p className="text-sm text-gray-600">CIF: {company.cif}</p>
                          <p className="text-sm text-gray-600">{company.address}</p>
                          {company.email && (
                            <p className="text-sm text-gray-600">{company.email}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'documents' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Documentos ({documents.length})</h3>
                  {documents.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No hay documentos registrados</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Documento</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {documents.slice(0, 10).map((doc) => (
                            <tr key={doc.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {doc.original_name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {doc.document_type}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                  doc.upload_status === 'completed' ? 'bg-green-100 text-green-800' :
                                  doc.upload_status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                  doc.upload_status === 'error' ? 'bg-red-100 text-red-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {doc.upload_status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(doc.created_at).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'billing' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Información de Facturación</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800">Plan Actual</h4>
                      <p className="text-2xl font-bold text-green-600">{client.subscription_plan.toUpperCase()}</p>
                      <p className="text-sm text-green-700">
                        {client.subscription_plan === 'enterprise' ? '€299/mes' :
                         client.subscription_plan === 'professional' ? '€149/mes' :
                         client.subscription_plan === 'custom' ? 'Personalizado' : '€59/mes'}
                      </p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800">Estado</h4>
                      <p className="text-2xl font-bold text-blue-600">
                        {client.subscription_status === 'active' ? 'ACTIVO' :
                         client.subscription_status === 'suspended' ? 'SUSPENDIDO' : 'CANCELADO'}
                      </p>
                      <p className="text-sm text-blue-700">Desde {new Date(client.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-800">Uso de Recursos</h4>
                      <p className="text-sm text-purple-700">
                        Almacenamiento: {getStoragePercentage()}%
                      </p>
                      <p className="text-sm text-purple-700">
                        Tokens: {client.tokens_available}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
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
    tokens_available: 500
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (client) {
      setFormData({
        company_name: client.company_name || '',
        contact_name: client.contact_name || '',
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || '',
        subscription_plan: client.subscription_plan || 'basic',
        subscription_status: client.subscription_status || 'active',
        tokens_available: client.tokens_available || 500
      });
    }
  }, [client]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;

    setSaving(true);
    try {
      await onSave({
        id: client.id,
        ...formData,
        updated_at: new Date().toISOString()
      });
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
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Editar Cliente</h2>
              <p className="text-green-100">{client.company_name}</p>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Empresa</label>
              <input
                type="text"
                value={formData.company_name}
                onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contacto</label>
              <input
                type="text"
                value={formData.contact_name}
                onChange={(e) => setFormData(prev => ({ ...prev, contact_name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Plan</label>
              <select
                value={formData.subscription_plan}
                onChange={(e) => setFormData(prev => ({ ...prev, subscription_plan: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="basic">Básico</option>
                <option value="professional">Profesional</option>
                <option value="enterprise">Enterprise</option>
                <option value="custom">Personalizado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
              <select
                value={formData.subscription_status}
                onChange={(e) => setFormData(prev => ({ ...prev, subscription_status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="active">Activo</option>
                <option value="suspended">Suspendido</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tokens Disponibles</label>
              <input
                type="number"
                value={formData.tokens_available}
                onChange={(e) => setFormData(prev => ({ ...prev, tokens_available: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                min="0"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
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
              className="flex items-center px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
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

interface ObraliaCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  onSave: (clientId: string, credentials: { username: string; password: string }) => Promise<void>;
}

function ObraliaCredentialsModal({ isOpen, onClose, client, onSave }: ObraliaCredentialsModalProps) {
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
            <div className="flex items-center">
              <Key className="h-6 w-6 mr-3" />
              <div>
                <h2 className="text-lg font-bold">Credenciales Obralia</h2>
                <p className="text-orange-100">{client.company_name}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Usuario</label>
            <input
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              placeholder="usuario@obralia.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
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
                {showPassword ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
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
                  Guardar
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
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showObraliaModal, setShowObraliaModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [kpis, setKpis] = useState<ClientKPI[]>([]);

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    filterClients();
  }, [clients, searchTerm, planFilter, statusFilter]);

  const loadClients = async () => {
    try {
      setLoading(true);
      const clientsData = await getAllClients();
      setClients(clientsData);
      calculateKPIs(clientsData);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateKPIs = (clientsData: Client[]) => {
    const now = new Date();
    const thisMonth = clientsData.filter(c => {
      const createdDate = new Date(c.created_at);
      return createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear();
    });

    const lastMonth = clientsData.filter(c => {
      const createdDate = new Date(c.created_at);
      const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return createdDate.getMonth() === lastMonthDate.getMonth() && createdDate.getFullYear() === lastMonthDate.getFullYear();
    });

    const activeClients = clientsData.filter(c => c.subscription_status === 'active');
    const cancelledClients = clientsData.filter(c => c.subscription_status === 'cancelled');
    const obraliaConfigured = clientsData.filter(c => c.obralia_credentials?.configured);
    
    const avgRevenue = activeClients.reduce((sum, c) => {
      const planRevenue = c.subscription_plan === 'enterprise' ? 299 :
                         c.subscription_plan === 'professional' ? 149 :
                         c.subscription_plan === 'custom' ? 250 : 59;
      return sum + planRevenue;
    }, 0) / Math.max(activeClients.length, 1);

    const churnRate = (cancelledClients.length / Math.max(clientsData.length, 1)) * 100;
    const growthRate = lastMonth.length > 0 ? ((thisMonth.length - lastMonth.length) / lastMonth.length) * 100 : 0;

    const clientKPIs: ClientKPI[] = [
      {
        id: 'total-clients',
        title: 'Total Clientes',
        value: clientsData.length,
        change: growthRate,
        trend: growthRate > 0 ? 'up' : growthRate < 0 ? 'down' : 'stable',
        icon: Users,
        color: 'bg-blue-500',
        description: 'Clientes registrados'
      },
      {
        id: 'active-clients',
        title: 'Clientes Activos',
        value: activeClients.length,
        change: 15.2,
        trend: 'up',
        icon: CheckCircle,
        color: 'bg-green-500',
        description: 'Suscripciones activas'
      },
      {
        id: 'new-this-month',
        title: 'Nuevos Este Mes',
        value: thisMonth.length,
        change: 23.5,
        trend: 'up',
        icon: TrendingUp,
        color: 'bg-purple-500',
        description: 'Adquisiciones mensuales'
      },
      {
        id: 'churn-rate',
        title: 'Tasa de Abandono',
        value: `${churnRate.toFixed(1)}%`,
        change: -5.3,
        trend: 'up',
        icon: TrendingDown,
        color: 'bg-red-500',
        description: 'Clientes que cancelan'
      },
      {
        id: 'avg-revenue',
        title: 'Ingreso Promedio',
        value: `€${avgRevenue.toFixed(0)}`,
        change: 12.8,
        trend: 'up',
        icon: DollarSign,
        color: 'bg-emerald-500',
        description: 'Revenue por cliente'
      },
      {
        id: 'obralia-adoption',
        title: 'Adopción Obralia',
        value: `${Math.round((obraliaConfigured.length / Math.max(clientsData.length, 1)) * 100)}%`,
        change: 8.7,
        trend: 'up',
        icon: Globe,
        color: 'bg-orange-500',
        description: 'Clientes con Obralia'
      }
    ];

    setKpis(clientKPIs);
  };

  const filterClients = () => {
    let filtered = clients;

    if (searchTerm) {
      filtered = filtered.filter(client =>
        client.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.client_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (planFilter !== 'all') {
      filtered = filtered.filter(client => client.subscription_plan === planFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(client => client.subscription_status === statusFilter);
    }

    setFilteredClients(filtered);
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

  const handleDeleteClient = async (client: Client) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar el cliente ${client.company_name}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', client.id);

      if (error) {
        throw error;
      }

      await loadClients();
      alert('Cliente eliminado exitosamente');
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('Error al eliminar el cliente');
    }
  };

  const handleSaveClient = async (clientData: Partial<Client>) => {
    try {
      const { error } = await supabase
        .from('clients')
        .update(clientData)
        .eq('id', clientData.id);

      if (error) {
        throw error;
      }

      await loadClients();
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  };

  const handleSaveObraliaCredentials = async (clientId: string, credentials: { username: string; password: string }) => {
    try {
      await updateClientObraliaCredentials(clientId, credentials);
      await loadClients();
    } catch (error) {
      console.error('Error saving Obralia credentials:', error);
      throw error;
    }
  };

  const exportClients = () => {
    const csvContent = [
      ['ID Cliente', 'Empresa', 'Contacto', 'Email', 'Plan', 'Estado', 'Fecha Registro'].join(','),
      ...filteredClients.map(client => [
        client.client_id,
        client.company_name,
        client.contact_name,
        client.email,
        client.subscription_plan,
        client.subscription_status,
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

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      case 'professional': return 'bg-blue-100 text-blue-800';
      case 'custom': return 'bg-orange-100 text-orange-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'suspended': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
              Panel integral de Business Intelligence para gestión de clientes
            </p>
            <div className="space-y-1 text-sm text-blue-100">
              <p>• Análisis completo de adquisición y retención de clientes</p>
              <p>• Métricas de rendimiento y satisfacción en tiempo real</p>
              <p>• Gestión de suscripciones y configuraciones Obralia</p>
              <p>• Herramientas de toma de decisiones basadas en datos</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={loadClients}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </button>
            <button
              onClick={exportClients}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
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

      {/* Análisis Visual */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Distribución por Plan */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Distribución por Plan</h3>
          <div className="space-y-4">
            {['enterprise', 'professional', 'basic', 'custom'].map((plan, index) => {
              const count = clients.filter(c => c.subscription_plan === plan).length;
              const percentage = clients.length > 0 ? (count / clients.length) * 100 : 0;
              const colors = ['bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-orange-500'];
              
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

        {/* Estado de Suscripciones */}
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

        {/* Configuración Obralia */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Configuración Obralia</h3>
          <div className="space-y-4">
            {[
              { key: 'configured', label: 'Configurados', color: 'bg-green-500' },
              { key: 'not_configured', label: 'Sin configurar', color: 'bg-red-500' }
            ].map((item, index) => {
              const count = item.key === 'configured' 
                ? clients.filter(c => c.obralia_credentials?.configured).length
                : clients.filter(c => !c.obralia_credentials?.configured).length;
              const percentage = clients.length > 0 ? (count / clients.length) * 100 : 0;
              
              return (
                <div key={item.key} className="flex items-center justify-between">
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
                    <span className="text-sm font-medium text-gray-900 w-8">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col sm:flex-row gap-4">
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
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los planes</option>
              <option value="basic">Básico</option>
              <option value="professional">Profesional</option>
              <option value="enterprise">Enterprise</option>
              <option value="custom">Personalizado</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="suspended">Suspendidos</option>
              <option value="cancelled">Cancelados</option>
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
                  Obralia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uso
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
              {filteredClients.map((client) => {
                const storagePercentage = client.storage_limit > 0 ? (client.storage_used / client.storage_limit) * 100 : 0;
                
                return (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{client.company_name}</div>
                          <div className="text-sm text-gray-500">{client.contact_name}</div>
                          <div className="text-xs text-gray-400">{client.email}</div>
                        </div>
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
                      <div className="flex items-center">
                        {client.obralia_credentials?.configured ? (
                          <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500 mr-1" />
                        )}
                        <span className="text-xs text-gray-600">
                          {client.obralia_credentials?.configured ? 'Configurado' : 'Sin configurar'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mb-1">
                          <div 
                            className={`h-2 rounded-full ${
                              storagePercentage > 90 ? 'bg-red-500' : 
                              storagePercentage > 70 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(storagePercentage, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">{Math.round(storagePercentage)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(client.created_at).toLocaleDateString()}
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
                          title="Editar cliente"
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
                          onClick={() => handleDeleteClient(client)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          title="Eliminar cliente"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resumen */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Mostrando {filteredClients.length} de {clients.length} clientes
          </span>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>Activos: {clients.filter(c => c.subscription_status === 'active').length}</span>
            <span>Enterprise: {clients.filter(c => c.subscription_plan === 'enterprise').length}</span>
            <span>Obralia: {clients.filter(c => c.obralia_credentials?.configured).length}</span>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ClientDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        client={selectedClient}
        onUpdate={loadClients}
      />

      <EditClientModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        client={selectedClient}
        onSave={handleSaveClient}
      />

      <ObraliaCredentialsModal
        isOpen={showObraliaModal}
        onClose={() => setShowObraliaModal(false)}
        client={selectedClient}
        onSave={handleSaveObraliaCredentials}
      />
    </div>
  );
}