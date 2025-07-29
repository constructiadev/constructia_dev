import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  CreditCard,
  Database,
  Brain,
  Download,
  Mail,
  Phone,
  Building2,
  Settings,
  Globe,
  Shield,
  TrendingUp,
  FileText,
  HardDrive,
  Zap
} from 'lucide-react';
import { callGeminiAI } from '../../lib/supabase';

interface Client {
  id: string;
  client_id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  subscription_plan: 'basic' | 'professional' | 'enterprise' | 'custom';
  subscription_status: 'active' | 'suspended' | 'cancelled';
  storage_used: number;
  storage_limit: number;
  documents_processed: number;
  tokens_available: number;
  obralia_credentials?: {
    configured: boolean;
    username?: string;
  };
  created_at: string;
  last_activity: string;
  monthly_revenue: number;
}

interface ClientKPICardProps {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ElementType;
  color: string;
  description?: string;
}

function ClientKPICard({ title, value, change, trend, icon: Icon, color, description }: ClientKPICardProps) {
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600';
  const trendSymbol = trend === 'up' ? '+' : trend === 'down' ? '-' : '';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="text-right">
          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
            mensual
          </span>
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        <div className="flex items-center justify-between mt-2">
          <p className={`text-sm font-medium ${trendColor}`}>
            {trendSymbol}{Math.abs(change)}% vs mes anterior
          </p>
        </div>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </div>
    </div>
  );
}

export default function ClientsManagement() {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [aiSearch, setAiSearch] = useState('');
  const [aiResults, setAiResults] = useState('');
  const [loading, setLoading] = useState(false);

  // KPIs de Clientes
  const clientKPIs = [
    { title: 'Total Clientes', value: '247', change: 12.5, trend: 'up' as const, icon: Users, color: 'bg-blue-500', description: 'Clientes registrados en la plataforma' },
    { title: 'Clientes Activos', value: '234', change: 8.2, trend: 'up' as const, icon: CheckCircle, color: 'bg-green-500', description: 'Con suscripción activa' },
    { title: 'Nuevos Este Mes', value: '23', change: 28.3, trend: 'up' as const, icon: Plus, color: 'bg-purple-500', description: 'Registros en los últimos 30 días' },
    { title: 'Almacenamiento Total', value: '2.4TB', change: 15.7, trend: 'up' as const, icon: Database, color: 'bg-indigo-500', description: 'Espacio utilizado por todos los clientes' },
    { title: 'Ingresos Mensuales', value: '€38,450', change: 22.1, trend: 'up' as const, icon: CreditCard, color: 'bg-emerald-500', description: 'Ingresos recurrentes del mes' },
    { title: 'Documentos Procesados', value: '12,456', change: 9.8, trend: 'up' as const, icon: FileText, color: 'bg-orange-500', description: 'Total procesados con IA este mes' }
  ];

  // Datos simulados de clientes
  const mockClients: Client[] = [
    {
      id: '1',
      client_id: '2024-REC-0001',
      company_name: 'Construcciones García S.L.',
      contact_name: 'Juan García Martínez',
      email: 'juan@construccionesgarcia.com',
      phone: '+34 91 123 45 67',
      subscription_plan: 'professional',
      subscription_status: 'active',
      storage_used: 850,
      storage_limit: 1000,
      documents_processed: 127,
      tokens_available: 450,
      obralia_credentials: { configured: true, username: 'juan_garcia' },
      created_at: '2024-01-15',
      last_activity: '2025-01-27',
      monthly_revenue: 149
    },
    {
      id: '2',
      client_id: '2024-REC-0002',
      company_name: 'Obras Públicas del Norte S.A.',
      contact_name: 'María López Fernández',
      email: 'maria@obrasnorte.es',
      phone: '+34 94 876 54 32',
      subscription_plan: 'enterprise',
      subscription_status: 'active',
      storage_used: 1200,
      storage_limit: 2000,
      documents_processed: 289,
      tokens_available: 1200,
      obralia_credentials: { configured: true, username: 'maria_lopez' },
      created_at: '2024-02-20',
      last_activity: '2025-01-27',
      monthly_revenue: 299
    },
    {
      id: '3',
      client_id: '2024-REC-0003',
      company_name: 'Reformas Integrales López',
      contact_name: 'Carlos López Ruiz',
      email: 'carlos@reformaslopez.com',
      phone: '+34 96 111 22 33',
      subscription_plan: 'basic',
      subscription_status: 'suspended',
      storage_used: 120,
      storage_limit: 500,
      documents_processed: 45,
      tokens_available: 50,
      obralia_credentials: { configured: false },
      created_at: '2024-03-10',
      last_activity: '2025-01-25',
      monthly_revenue: 59
    },
    {
      id: '4',
      client_id: '2024-REC-0004',
      company_name: 'Constructora Mediterránea S.A.',
      contact_name: 'Ana Martín González',
      email: 'ana@constructoramediterranea.com',
      phone: '+34 96 555 77 88',
      subscription_plan: 'professional',
      subscription_status: 'active',
      storage_used: 650,
      storage_limit: 1000,
      documents_processed: 98,
      tokens_available: 320,
      obralia_credentials: { configured: true, username: 'ana_martin' },
      created_at: '2024-01-28',
      last_activity: '2025-01-26',
      monthly_revenue: 149
    },
    {
      id: '5',
      client_id: '2024-REC-0005',
      company_name: 'Ingeniería y Obras S.L.',
      contact_name: 'Roberto Sánchez Vila',
      email: 'roberto@ingenieriaobras.com',
      phone: '+34 91 444 33 22',
      subscription_plan: 'custom',
      subscription_status: 'active',
      storage_used: 2100,
      storage_limit: 5000,
      documents_processed: 456,
      tokens_available: 2500,
      obralia_credentials: { configured: true, username: 'roberto_sanchez' },
      created_at: '2023-11-15',
      last_activity: '2025-01-27',
      monthly_revenue: 499
    }
  ];

  useEffect(() => {
    setClients(mockClients);
    setFilteredClients(mockClients);
  }, []);

  useEffect(() => {
    let filtered = clients.filter(client => {
      const matchesSearch = client.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           client.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           client.client_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           client.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPlan = filterPlan === 'all' || client.subscription_plan === filterPlan;
      const matchesStatus = filterStatus === 'all' || client.subscription_status === filterStatus;
      
      return matchesSearch && matchesPlan && matchesStatus;
    });

    setFilteredClients(filtered);
  }, [clients, searchTerm, filterPlan, filterStatus]);

  const handleAISearch = async () => {
    if (!aiSearch.trim()) return;
    
    setLoading(true);
    try {
      // Simular respuesta mientras Gemini está fallando
      const mockResponse = `🔍 Análisis de clientes basado en "${aiSearch}":

1. **Clientes con alto uso de almacenamiento**: 3 clientes están por encima del 80% de su límite
2. **Oportunidades de upgrade**: 15 clientes básicos podrían beneficiarse del plan profesional
3. **Retención**: Tasa de renovación del 94.2% en los últimos 6 meses`;
      
      setAiResults(mockResponse);
    } catch (error) {
      setAiResults('Error al procesar la búsqueda con IA. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'basic': return 'bg-blue-100 text-blue-800';
      case 'professional': return 'bg-green-100 text-green-800';
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      case 'custom': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const getStoragePercentage = (used: number, limit: number) => {
    return Math.round((used / limit) * 100);
  };

  const getStorageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const ClientModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">
            {selectedClient ? 'Detalles del Cliente' : 'Nuevo Cliente'}
          </h3>
          <button
            onClick={() => {
              setShowModal(false);
              setSelectedClient(null);
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        
        {selectedClient && (
          <div className="space-y-6">
            {/* Información Básica */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-3">Información Básica</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID Cliente</label>
                  <input
                    type="text"
                    value={selectedClient.client_id}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <select
                    defaultValue={selectedClient.subscription_status}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="active">Activo</option>
                    <option value="suspended">Suspendido</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
                  <input
                    type="text"
                    defaultValue={selectedClient.company_name}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contacto</label>
                  <input
                    type="text"
                    defaultValue={selectedClient.contact_name}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    defaultValue={selectedClient.email}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    defaultValue={selectedClient.phone}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Plan y Facturación */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-3">Plan y Facturación</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plan de Suscripción</label>
                  <select
                    defaultValue={selectedClient.subscription_plan}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="basic">Básico - €59/mes</option>
                    <option value="professional">Profesional - €149/mes</option>
                    <option value="enterprise">Empresarial - €299/mes</option>
                    <option value="custom">Personalizado - €499/mes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ingresos Mensuales</label>
                  <input
                    type="number"
                    defaultValue={selectedClient.monthly_revenue}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tokens Disponibles</label>
                  <input
                    type="number"
                    defaultValue={selectedClient.tokens_available}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Credenciales Obralia */}
            <div className="bg-orange-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-3">Credenciales Obralia/Nalanda</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Usuario Obralia</label>
                  <input
                    type="text"
                    defaultValue={selectedClient.obralia_credentials?.username || ''}
                    placeholder="usuario@obralia.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado Integración</label>
                  <select 
                    defaultValue={selectedClient.obralia_credentials?.configured ? 'configured' : 'pending'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="configured">Configurado</option>
                    <option value="pending">Pendiente</option>
                    <option value="error">Error</option>
                  </select>
                </div>
              </div>
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Importante:</strong> Las credenciales de Obralia son obligatorias para poder subir documentos.
                </p>
              </div>
            </div>

            {/* Métricas de Uso */}
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-3">Métricas de Uso</h4>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-3 bg-white rounded-lg border">
                  <FileText className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">{selectedClient.documents_processed}</p>
                  <p className="text-xs text-blue-800">Documentos</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border">
                  <HardDrive className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">
                    {getStoragePercentage(selectedClient.storage_used, selectedClient.storage_limit)}%
                  </p>
                  <p className="text-xs text-green-800">Almacenamiento</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border">
                  <Zap className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-600">{selectedClient.tokens_available}</p>
                  <p className="text-xs text-purple-800">Tokens</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border">
                  <CreditCard className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-emerald-600">€{selectedClient.monthly_revenue}</p>
                  <p className="text-xs text-emerald-800">Ingresos/mes</p>
                </div>
              </div>
            </div>

            {/* Actividad Reciente */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-3">Actividad Reciente</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-white rounded border">
                  <span className="text-sm">Último acceso:</span>
                  <span className="font-medium text-sm">{new Date(selectedClient.last_activity).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-white rounded border">
                  <span className="text-sm">Fecha de registro:</span>
                  <span className="font-medium text-sm">{new Date(selectedClient.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-white rounded border">
                  <span className="text-sm">Documentos este mes:</span>
                  <span className="font-medium text-sm">{selectedClient.documents_processed}</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
          <button
            onClick={() => {
              setShowModal(false);
              setSelectedClient(null);
            }}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancelar
          </button>
          <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header con IA */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Gestión de Clientes</h2>
            <p className="text-blue-100 mt-1">Administra todos los clientes de la plataforma con IA</p>
          </div>
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8" />
            <button
              onClick={() => setShowModal(true)}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Cliente
            </button>
          </div>
        </div>
      </div>

      {/* KPIs de Clientes */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Métricas de Clientes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          {clientKPIs.map((kpi, index) => (
            <ClientKPICard key={index} {...kpi} />
          ))}
        </div>
      </div>

      {/* Buscador Inteligente con IA */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Buscador Inteligente con IA</h3>
        <div className="flex space-x-4 mb-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Pregunta algo sobre los clientes... ej: '¿Cuántos clientes están cerca del límite de almacenamiento?'"
              value={aiSearch}
              onChange={(e) => setAiSearch(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleAISearch}
            disabled={loading}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center"
          >
            {loading ? <Brain className="h-4 w-4 animate-pulse" /> : <Brain className="h-4 w-4" />}
          </button>
        </div>
        
        {aiResults && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-semibold text-purple-800 mb-2">🤖 Respuesta IA:</h4>
            <div className="text-purple-700 text-sm whitespace-pre-line">{aiResults}</div>
          </div>
        )}
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por empresa, contacto, email o ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={filterPlan}
            onChange={(e) => setFilterPlan(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos los planes</option>
            <option value="basic">Básico</option>
            <option value="professional">Profesional</option>
            <option value="enterprise">Empresarial</option>
            <option value="custom">Personalizado</option>
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activo</option>
            <option value="suspended">Suspendido</option>
            <option value="cancelled">Cancelado</option>
          </select>

          <button className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </button>
        </div>
      </div>

      {/* Lista de Clientes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            Clientes ({filteredClients.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Almacenamiento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Obralia</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ingresos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Última Actividad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClients.map((client) => {
                const storagePercentage = getStoragePercentage(client.storage_used, client.storage_limit);
                const isStorageWarning = storagePercentage >= 85;
                
                return (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="bg-blue-100 p-2 rounded-lg mr-3">
                          <Building2 className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{client.company_name}</div>
                          <div className="text-sm text-gray-500">{client.contact_name}</div>
                          <div className="text-xs text-gray-400">{client.client_id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPlanColor(client.subscription_plan)}`}>
                        {client.subscription_plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(client.subscription_status)}`}>
                        {client.subscription_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-sm">
                            <span>{client.storage_used}MB / {client.storage_limit}MB</span>
                            {isStorageWarning && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className={`h-2 rounded-full ${getStorageColor(storagePercentage)}`}
                              style={{ width: `${Math.min(storagePercentage, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {client.obralia_credentials?.configured ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                            <span className="text-sm text-green-600">Configurado</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                            <span className="text-sm text-red-600">Pendiente</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      €{client.monthly_revenue}/mes
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(client.last_activity).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedClient(client);
                            setShowModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 className="h-4 w-4" />
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

      {/* Modal */}
      {showModal && <ClientModal />}
    </div>
  );
}