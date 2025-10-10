import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  Building2,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  Settings,
  Download,
  RefreshCw,
  Package,
  FolderOpen,
  Lock,
  Unlock,
  ArrowUp,
  ArrowDown,
  BarChart3,
  TrendingUp,
  Activity,
  Database,
  Shield,
  Globe,
  Zap,
  Target,
  Award,
  Star,
  Lightbulb,
  Brain,
  Cpu,
  HardDrive,
  Wifi,
  Server,
  Monitor,
  Code,
  Terminal,
  Key,
  X,
  Save
} from 'lucide-react';
import { 
  getAllClients, 
  getAllReceipts, 
  calculateDynamicKPIs,
  supabase 
} from '../../lib/supabase';
import { supabaseServiceClient, logAuditoria, DEV_TENANT_ID } from '../../lib/supabase-real';
import { useAuth } from '../../lib/auth-context';
import PlatformCredentialsManager from '../client/PlatformCredentialsManager';
import ClientReport from './ClientReport';

interface Client {
  id: string;
  client_id: string;
  company_name: string;
  tenant_id: string; // Add tenant_id to the Client interface
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
  obralia_credentials?: {
    configured: boolean;
    username?: string;
    password?: string;
  };
  created_at: string;
  updated_at: string;
  total_documents?: number; // Add total_documents
  total_storage_used?: number; // Add total_storage_used
}

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: Partial<Client>) => Promise<void>;
  client?: Client | null;
  mode: 'create' | 'edit' | 'view';
}

function ClientModal({ isOpen, onClose, onSave, client, mode }: ClientModalProps) {
  const [formData, setFormData] = useState({
    company_name: client?.company_name || '',
    contact_name: client?.contact_name || '',
    email: client?.email || '',
    phone: client?.phone || '',
    address: client?.address || '',
    subscription_plan: client?.subscription_plan || 'basic',
    subscription_status: client?.subscription_status || 'active'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.company_name) newErrors.company_name = 'Nombre de empresa es obligatorio';
    if (!formData.contact_name) newErrors.contact_name = 'Nombre de contacto es obligatorio';
    if (!formData.email) newErrors.email = 'Email es obligatorio';
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const clientData = {
        ...formData,
        client_id: client?.client_id || `CLI-${Date.now()}`,
        storage_limit: formData.subscription_plan === 'enterprise' ? 5368709120 : 
                      formData.subscription_plan === 'professional' ? 1073741824 : 524288000,
        tokens_available: formData.subscription_plan === 'enterprise' ? 5000 : 
                         formData.subscription_plan === 'professional' ? 1000 : 500
      };

      await onSave(clientData);
      onClose();
    } catch (error) {
      console.error('Error saving client:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const isReadOnly = mode === 'view';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">
                {mode === 'create' ? 'Nuevo Cliente' : 
                 mode === 'edit' ? 'Editar Cliente' : 
                 'Detalles del Cliente'}
              </h2>
              <p className="text-blue-100">
                {mode === 'create' ? 'Crear nuevo cliente en la plataforma' : 
                 mode === 'edit' ? 'Modificar información del cliente' : 
                 'Información del cliente'}
              </p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de Empresa *
              </label>
              <input
                type="text"
                value={formData.company_name}
                onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="Construcciones García S.L."
              />
              {errors.company_name && (
                <p className="mt-1 text-sm text-red-600">{errors.company_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de Contacto *
              </label>
              <input
                type="text"
                value={formData.contact_name}
                onChange={(e) => setFormData(prev => ({ ...prev, contact_name: e.target.value }))}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="Juan García"
              />
              {errors.contact_name && (
                <p className="mt-1 text-sm text-red-600">{errors.contact_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="juan@construccionesgarcia.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="+34 600 123 456"
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
                disabled={isReadOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="Calle Construcción 123, 28001 Madrid"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plan de Suscripción
              </label>
              <select
                value={formData.subscription_plan}
                onChange={(e) => setFormData(prev => ({ ...prev, subscription_plan: e.target.value }))}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="basic">Básico</option>
                <option value="professional">Profesional</option>
                <option value="enterprise">Enterprise</option>
                <option value="custom">Personalizado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado de Suscripción
              </label>
              <select
                value={formData.subscription_status}
                onChange={(e) => setFormData(prev => ({ ...prev, subscription_status: e.target.value }))}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="active">Activo</option>
                <option value="suspended">Suspendido</option>
                <option value="cancelled">Cancelado</option>
              </select>
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
                    {mode === 'create' ? 'Crear Cliente' : 'Guardar Cambios'}
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

// Component to display platform credentials status for each client in the table
function PlatformCredentialsStatus({
  client,
  onCredentialsUpdated
}: {
  client: Client;
  onCredentialsUpdated?: () => void;
}) {
  const [credentials, setCredentials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    loadCredentials();
  }, [client.tenant_id, refreshTrigger]);

  // Listen for storage events to update when credentials change for THIS specific tenant
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      const storageKey = `constructia_credentials_${client.tenant_id}`;
      if (e.key === storageKey) {
        console.log(`🔄 [PlatformCredentials] Storage changed for tenant ${client.tenant_id}, reloading...`);
        setRefreshTrigger(prev => prev + 1);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [client.tenant_id]);

  const loadCredentials = () => {
    try {
      // Use tenant_id as the primary key for credentials storage
      const storageKey = `constructia_credentials_${client.tenant_id}`;
      console.log('🔍 [PlatformCredentials] Loading credentials for tenant:', client.tenant_id);

      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsedCreds = JSON.parse(stored);
        setCredentials(Array.isArray(parsedCreds) ? parsedCreds : []);
        console.log('✅ [PlatformCredentials] Found credentials for tenant:', client.tenant_id, parsedCreds.length);
      } else {
        console.log('⚠️ [PlatformCredentials] No credentials found for tenant:', client.tenant_id);
        setCredentials([]);
      }
    } catch (error) {
      console.error('Error loading credentials for client:', client.id, error);
      setCredentials([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center">
        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
        <span className="text-xs text-gray-500">Cargando...</span>
      </div>
    );
  }

  const platforms = [
    { type: 'nalanda', name: 'Nalanda', color: 'bg-blue-500 text-white' },
    { type: 'ctaima', name: 'CTAIMA', color: 'bg-green-500 text-white' },
    { type: 'ecoordina', name: 'Ecoordina', color: 'bg-purple-500 text-white' }
  ];
  
  // Filter only configured platforms
  const configuredPlatforms = platforms.filter(platform => {
    const cred = credentials.find(c => c.platform_type === platform.type);
    const isConfigured = cred && 
                        cred.username && 
                        cred.username.trim().length > 0 && 
                        cred.password && 
                        cred.password.trim().length > 0 && 
                        cred.is_active !== false;
    
    return isConfigured;
  });
  
  if (configuredPlatforms.length === 0) {
    return (
      <div className="flex items-center">
        <span className="text-xs text-gray-400">Sin configurar</span>
      </div>
    );
  }
  
  return (
    <div className="flex flex-wrap gap-1">
      {configuredPlatforms.map(platform => (
        <span
          key={platform.type}
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${platform.color}`}
          title={`${platform.name} configurado`}
        >
          {platform.name}
        </span>
      ))}
    </div>
  );
}

const ClientsManagement: React.FC = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [credentialsModalClient, setCredentialsModalClient] = useState<Client | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    filterClients();
  }, [clients, searchTerm, statusFilter, planFilter]);

  const loadClients = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('👥 Loading clients from database...');
      const data = await getAllClients();
      console.log('✅ Clients loaded:', data?.length || 0);
      
      // Simulate realistic storage usage for development
      const clientsWithRealisticStorage = (data || []).map(client => ({
        ...client,
        storage_used: client.total_storage_used || 0, // Use real data
        documents_processed: client.total_documents || 0 // Use real data
      }));

      // Calculate total documents for debugging
      const totalDocs = clientsWithRealisticStorage.reduce((sum, c) => sum + (c.documents_processed || 0), 0);
      console.log('📊 Total documents across all clients:', totalDocs);
      console.log('📋 Sample client data:', clientsWithRealisticStorage.slice(0, 3).map(c => ({
        name: c.company_name,
        docs: c.documents_processed,
        storage: c.storage_used
      })));

      setClients(clientsWithRealisticStorage);
    } catch (err) {
      console.error('Error loading clients:', err);
      setError(err instanceof Error ? err.message : 'Error loading clients');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    console.log('🔄 Clients refresh triggered by admin');
    setRefreshing(true);
    await loadClients();
    setRefreshing(false);
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

    if (statusFilter !== 'all') {
      filtered = filtered.filter(client => client.subscription_status === statusFilter);
    }

    if (planFilter !== 'all') {
      filtered = filtered.filter(client => client.subscription_plan === planFilter);
    }

    setFilteredClients(filtered);
  };

  const handleCreateClient = () => {
    setSelectedClient(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleViewClient = (client: Client) => {
    setSelectedClient(client);
    setModalMode('view');
    setShowModal(true);
  };

  const handleSaveClient = async (clientData: Partial<Client>) => {
    try {
      if (modalMode === 'create') {
        // Simular creación de cliente
        const newClient: Client = {
          id: `client_${Date.now()}`,
          client_id: `CLI-${Date.now()}`,
          company_name: clientData.company_name || '',
          contact_name: clientData.contact_name || '',
          email: clientData.email || '',
          phone: clientData.phone || '',
          address: clientData.address || '',
          subscription_plan: clientData.subscription_plan || 'basic',
          subscription_status: clientData.subscription_status || 'active',
          storage_used: 0,
          storage_limit: clientData.subscription_plan === 'enterprise' ? 5368709120 : 
                        clientData.subscription_plan === 'professional' ? 1073741824 : 524288000,
          documents_processed: 0,
          tokens_available: clientData.subscription_plan === 'enterprise' ? 5000 : 
                           clientData.subscription_plan === 'professional' ? 1000 : 500,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        setClients(prev => [...prev, newClient]);
      } else if (modalMode === 'edit' && selectedClient) {
        const updatedClient = {
          ...selectedClient,
          ...clientData,
          updated_at: new Date().toISOString()
        };
        
        setClients(prev => prev.map(c => 
          c.id === selectedClient.id ? updatedClient : c
        ));
      }
    } catch (error) {
      console.error('Error saving client:', error);
      throw error;
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este cliente? Esta acción no se puede deshacer.')) {
      try {
        // Delete client from database
        const { error } = await supabaseServiceClient
          .from('clients')
          .delete()
          .eq('id', clientId);

        if (error) {
          console.error('Error deleting client:', error);
          alert('Error al eliminar cliente');
          return;
        }

        // Update local state
        setClients(prev => prev.filter(c => c.id !== clientId));
        
        alert('✅ Cliente eliminado correctamente');
      } catch (error) {
        console.error('Error deleting client:', error);
        alert('Error al eliminar cliente');
      }
    }
  };

  const handleSuspendClient = async (clientId: string) => {
    if (!confirm('¿Estás seguro de que quieres suspender este cliente?')) {
      return;
    }

    try {
      // Update client status in database
      const { error } = await supabaseServiceClient
        .from('clients')
        .update({ 
          subscription_status: 'suspended',
          updated_at: new Date().toISOString()
        })
        .eq('id', clientId);

      if (error) {
        console.error('Error suspending client:', error);
        alert('Error al suspender cliente');
        return;
      }

      // Update local state
      setClients(prev => prev.map(c => 
        c.id === clientId 
          ? { ...c, subscription_status: 'suspended', updated_at: new Date().toISOString() }
          : c
      ));
      
      alert('✅ Cliente suspendido correctamente');
    } catch (error) {
      console.error('Error suspending client:', error);
      alert('Error al suspender cliente');
    }
  };

  const handleActivateClient = async (clientId: string) => {
    if (!confirm('¿Estás seguro de que quieres activar este cliente?')) {
      return;
    }

    try {
      // Get client info for audit logging
      const client = clients.find(c => c.id === clientId);
      
      // Update client status in database
      const { error } = await supabaseServiceClient
        .from('clients')
        .update({ 
          subscription_status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', clientId);

      if (error) {
        console.error('Error activating client:', error);
        alert('Error al activar cliente');
        return;
      }

      // CRITICAL: Log audit event for global admin view
      if (client) {
        try {
          // Get tenant_id for this client
          const { data: userData, error: userError } = await supabaseServiceClient
            .from('users')
            .select('tenant_id')
            .eq('email', client.email)
            .maybeSingle();
          
          if (userError) {
            console.warn('⚠️ [ClientsManagement] Could not find user for audit logging:', userError);
          }
          
          const tenantId = userData?.tenant_id || DEV_TENANT_ID;
          
          await logAuditoria(
            tenantId,
            user?.id || 'admin-user',
            'admin.client_activated',
            'cliente',
            clientId,
            {
              company_name: client.company_name,
              contact_name: client.contact_name,
              email: client.email,
              previous_status: client.subscription_status,
              new_status: 'active',
              admin_action: true,
              global_admin_view: true
            },
            '127.0.0.1',
            navigator.userAgent,
            'success'
          );
        } catch (auditError) {
          console.warn('⚠️ [Audit] Failed to log client activation:', auditError);
        }
      }
      // Update local state
      setClients(prev => prev.map(c => 
        c.id === clientId 
          ? { ...c, subscription_status: 'active', updated_at: new Date().toISOString() }
          : c
      ));
      
      alert('✅ Cliente activado correctamente');
    } catch (error) {
      console.error('Error activating client:', error);
      alert('Error al activar cliente');
    }
  };

  const handleViewClientCredentials = async (client: Client) => {
    try {
      console.log('🔍 [ClientsManagement] Opening credentials for client:', client.company_name);
      
      // Use tenant_id from client object (now included from getAllClients)
      if (!client.tenant_id) {
        console.error('❌ [ClientsManagement] No tenant_id found for client:', client.id);
        alert('❌ Error: No se encontró el tenant para este cliente');
        return;
      }
      
      setCredentialsModalClient(client);
      console.log('✅ [ClientsManagement] Opening credentials modal for tenant:', client.tenant_id);
      setShowCredentialsModal(true);
    } catch (error) {
      console.error('Error opening credentials modal:', error);
      alert('Error al abrir las credenciales del cliente.');
    }
  };

  const exportClients = () => {
    const csvContent = [
      ['ID', 'Empresa', 'Contacto', 'Email', 'Plan', 'Estado', 'Creado'].join(','),
      ...filteredClients.map(client => 
        [
          client.client_id,
          client.company_name,
          client.contact_name,
          client.email,
          client.subscription_plan,
          client.subscription_status,
          new Date(client.created_at).toLocaleDateString()
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clientes_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'suspended': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'basic': return 'bg-blue-100 text-blue-800';
      case 'professional': return 'bg-purple-100 text-purple-800';
      case 'enterprise': return 'bg-indigo-100 text-indigo-800';
      case 'custom': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStoragePercentage = (used: number, limit: number) => {
    if (limit === 0) return 0;
    return Math.round((used / limit) * 100);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando clientes...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800 font-medium">Error: {error}</span>
          </div>
          <button
            onClick={loadClients}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Clientes</h1>
          <p className="text-gray-600">Administra clientes y suscripciones</p>
          <div className="mt-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium inline-block">
            ✅ DATOS REALES - {clients.length} clientes cargados
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowReportModal(true)}
            className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <FileText className="w-4 h-4 mr-2" />
            Generar Reporte IA
          </button>
          <button
            onClick={refreshData}
            disabled={refreshing}
            className="flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Actualizando...' : 'Actualizar'}
          </button>
          <button
            onClick={handleCreateClient}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Cliente
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Clientes</p>
              <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Activos</p>
              <p className="text-2xl font-bold text-green-600">
                {clients.filter(c => c.subscription_status === 'active').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Enterprise</p>
              <p className="text-2xl font-bold text-purple-600">
                {clients.filter(c => c.subscription_plan === 'enterprise').length}
              </p>
            </div>
            <Award className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Documentos</p>
              <p className="text-2xl font-bold text-orange-600">
                {clients.reduce((sum, c) => sum + (c.documents_processed || 0), 0)}
              </p>
            </div>
            <FileText className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar clientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="suspended">Suspendidos</option>
              <option value="cancelled">Cancelados</option>
            </select>
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los planes</option>
              <option value="basic">Básico</option>
              <option value="professional">Profesional</option>
              <option value="enterprise">Enterprise</option>
              <option value="custom">Personalizado</option>
            </select>
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setPlanFilter('all');
              }}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        {filteredClients.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'all' || planFilter !== 'all' 
                ? 'No se encontraron clientes' 
                : 'No hay clientes registrados'
              }
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'all' || planFilter !== 'all'
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Comienza creando tu primer cliente'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && planFilter === 'all' && (
              <button
                onClick={handleCreateClient}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Crear Primer Cliente
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Cliente</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">ID Cliente</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Plan</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Estado</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Almacenamiento</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Documentos</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Plataformas</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Building2 className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900">{client.company_name}</div>
                          <div className="text-sm text-gray-500">{client.contact_name}</div>
                          <div className="text-sm text-gray-500">{client.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-mono text-sm text-gray-900">{client.client_id}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPlanColor(client.subscription_plan)}`}>
                        {client.subscription_plan}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(client.subscription_status)}`}>
                        {client.subscription_status === 'active' ? 'Activo' : 
                         client.subscription_status === 'suspended' ? 'Suspendido' : 'Cancelado'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-900">
                        {formatBytes(client.storage_used)} / {formatBytes(client.storage_limit)}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        {(() => {
                          const percentage = getStoragePercentage(client.storage_used, client.storage_limit);
                          const displayPercentage = Math.max(percentage, 5); // Minimum 5% for visibility
                          return (
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                percentage > 90 ? 'bg-red-500' : 
                                percentage > 70 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(displayPercentage, 100)}%` }}
                            ></div>
                          );
                        })()}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {getStoragePercentage(client.storage_used, client.storage_limit)}% usado
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {client.total_documents || 0} {/* Use total_documents */}
                    </td>
                    <td className="py-3 px-4">
                      <PlatformCredentialsStatus
                        key={`credentials-${client.tenant_id}-${client.id}`}
                        client={client}
                        onCredentialsUpdated={() => {
                          // Force re-render of this specific component only
                          // No need to reload all clients, just trigger a state update
                          setClients(prev => [...prev]);
                        }}
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewClient(client)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditClient(client)}
                          className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                          title="Editar cliente"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            handleViewClientCredentials(client);
                          }}
                          className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
                          title="Ver credenciales de plataforma"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                        {client.subscription_status === 'active' ? (
                          <button
                            onClick={() => handleSuspendClient(client.id)}
                            className="p-1 text-gray-400 hover:text-yellow-600 transition-colors"
                            title="Suspender cliente"
                          >
                            <Lock className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivateClient(client.id)}
                            className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                            title="Activar cliente"
                          >
                            <Unlock className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteClient(client.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Eliminar cliente"
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
        )}
      </div>

      {/* Auto-refresh functionality */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <RefreshCw className="w-5 h-5 text-blue-600 mr-3" />
          <div>
            <h4 className="font-semibold text-blue-800">Actualización Automática</h4>
            <p className="text-sm text-blue-700">
              Los datos se actualizan automáticamente cada 30 segundos para mostrar nuevos documentos y cambios de estado.
            </p>
          </div>
        </div>
      </div>

      {/* Summary */}
      {filteredClients.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{filteredClients.length}</div>
              <div className="text-sm text-gray-600">Clientes mostrados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {filteredClients.filter(c => c.subscription_status === 'active').length}
              </div>
              <div className="text-sm text-gray-600">Activos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {filteredClients.filter(c => c.subscription_plan === 'enterprise').length}
              </div>
              <div className="text-sm text-gray-600">Enterprise</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {filteredClients.filter(c => c.obralia_credentials?.configured).length}
              </div>
              <div className="text-sm text-gray-600">Obralia OK</div>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      <ClientModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveClient}
        client={selectedClient}
        mode={modalMode}
      />

      {/* Credentials Modal */}
      {showCredentialsModal && credentialsModalClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-xl">
              <div>
                <h2 className="text-xl font-bold">Credenciales de Plataforma</h2>
                <p className="text-purple-100">{credentialsModalClient.company_name}</p>
                <p className="text-sm text-purple-200">Tenant: {credentialsModalClient.tenant_id}</p>
              </div>
              <button 
                onClick={() => setShowCredentialsModal(false)} 
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <PlatformCredentialsManager
                clientId={credentialsModalClient.tenant_id}
                isReadOnly={false}
                onCredentialsUpdated={() => {
                  // Trigger a lightweight state update instead of reloading all clients
                  // This will cause the PlatformCredentialsStatus component for THIS client to re-render
                  console.log(`✅ [ClientsManagement] Credentials updated for tenant: ${credentialsModalClient.tenant_id}`);
                  // Force a minimal re-render by updating the clients array reference
                  setClients(prev => [...prev]);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Client Report Modal */}
      <ClientReport
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
      />
    </div>
  );
};

export default ClientsManagement;