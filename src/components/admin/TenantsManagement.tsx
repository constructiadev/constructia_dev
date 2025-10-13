import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  Search,
  Filter,
  Eye,
  Edit,
  Power,
  PowerOff,
  Plus,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  FileText,
  Database,
  Clock,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar,
  Package,
  Settings,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Activity,
  Download,
  BarChart3
} from 'lucide-react';
import TenantDataService from '../../lib/tenant-service';
import type { AdminTenantOverview, TenantWithMetadata } from '../../types';

interface TenantDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: AdminTenantOverview | null;
}

function TenantDetailsModal({ isOpen, onClose, tenant }: TenantDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'companies' | 'stats' | 'billing'>('info');
  const [companies, setCompanies] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && tenant && activeTab === 'companies') {
      loadTenantData();
    }
  }, [isOpen, tenant, activeTab]);

  const loadTenantData = async () => {
    if (!tenant) return;

    setLoading(true);
    try {
      const [companiesData, projectsData] = await Promise.all([
        TenantDataService.getTenantCompanies(tenant.tenant_id),
        TenantDataService.getTenantProjects(tenant.tenant_id)
      ]);
      setCompanies(companiesData);
      setProjects(projectsData);
    } catch (error) {
      console.error('Error loading tenant data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !tenant) return null;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date?: string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-blue-600 to-green-600 p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">{tenant.tenant_name}</h2>
              <p className="text-blue-100">ID: {tenant.tenant_id.substring(0, 8)}...</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="flex gap-4 mt-4">
            <div className="flex items-center gap-2">
              {tenant.is_suspended ? (
                <XCircle className="w-5 h-5 text-red-300" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-300" />
              )}
              <span className="text-sm">
                {tenant.is_suspended ? 'Suspendido' : 'Activo'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {tenant.is_trial ? (
                <>
                  <Clock className="w-5 h-5 text-yellow-300" />
                  <span className="text-sm">Trial</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5 text-green-300" />
                  <span className="text-sm">{tenant.subscription_plan}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="border-b border-gray-200">
          <div className="flex gap-4 px-6">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-4 py-3 font-medium transition-colors border-b-2 ${
                activeTab === 'info'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Información General
            </button>
            <button
              onClick={() => setActiveTab('companies')}
              className={`px-4 py-3 font-medium transition-colors border-b-2 ${
                activeTab === 'companies'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Empresas ({tenant.companies_count})
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-4 py-3 font-medium transition-colors border-b-2 ${
                activeTab === 'stats'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Estadísticas
            </button>
            <button
              onClick={() => setActiveTab('billing')}
              className={`px-4 py-3 font-medium transition-colors border-b-2 ${
                activeTab === 'billing'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Facturación
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'info' && (
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Información de Contacto
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Nombre de Contacto</p>
                    <p className="font-medium text-gray-900">{tenant.contact_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {tenant.contact_email || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Fecha de Registro</p>
                    <p className="font-medium text-gray-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {formatDate(tenant.tenant_created_at)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Última Actividad</p>
                    <p className="font-medium text-gray-900 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-gray-400" />
                      {formatDate(tenant.last_activity)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
                  <Database className="w-5 h-5 text-green-600" />
                  Uso de Recursos
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">Almacenamiento</span>
                      <span className="font-medium text-gray-900">
                        {formatBytes(tenant.storage_used)} / {formatBytes(tenant.storage_limit)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          tenant.storage_usage_percent > 90
                            ? 'bg-red-500'
                            : tenant.storage_usage_percent > 70
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(tenant.storage_usage_percent, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{tenant.storage_usage_percent.toFixed(1)}% usado</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Empresas</p>
                      <p className="text-2xl font-bold text-gray-900">{tenant.companies_count}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Proyectos</p>
                      <p className="text-2xl font-bold text-gray-900">{tenant.projects_count}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Documentos</p>
                      <p className="text-2xl font-bold text-gray-900">{tenant.documents_count}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Usuarios</p>
                      <p className="text-2xl font-bold text-gray-900">{tenant.users_count}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'companies' && (
            <div>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Cargando empresas...</p>
                </div>
              ) : companies.length > 0 ? (
                <div className="space-y-4">
                  {companies.map((company) => (
                    <div key={company.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Building2 className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{company.razon_social}</h4>
                            <p className="text-sm text-gray-600">CIF: {company.cif}</p>
                            {company.direccion && (
                              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                <MapPin className="w-3 h-3" />
                                {company.direccion}
                              </p>
                            )}
                            {company.contacto_email && (
                              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                <Mail className="w-3 h-3" />
                                {company.contacto_email}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          company.estado_compliance === 'al_dia'
                            ? 'bg-green-100 text-green-700'
                            : company.estado_compliance === 'pendiente'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {company.estado_compliance}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-600">Este tenant no tiene empresas registradas</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-blue-50 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Documentos Procesados</h4>
                    <p className="text-3xl font-bold text-blue-600">{tenant.documents_count}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">Total de documentos almacenados en el sistema</p>
              </div>

              <div className="bg-green-50 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Building2 className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Empresas Activas</h4>
                    <p className="text-3xl font-bold text-green-600">{tenant.companies_count}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">Empresas registradas en este tenant</p>
              </div>

              <div className="bg-purple-50 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Database className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Proyectos</h4>
                    <p className="text-3xl font-bold text-purple-600">{tenant.projects_count}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">Total de proyectos/obras en gestión</p>
              </div>

              <div className="bg-orange-50 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Users className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Usuarios</h4>
                    <p className="text-3xl font-bold text-orange-600">{tenant.users_count}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">Usuarios con acceso al sistema</p>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6">
                  <p className="text-blue-100 text-sm mb-2">Plan Actual</p>
                  <p className="text-2xl font-bold capitalize">{tenant.subscription_plan}</p>
                  <p className="text-blue-100 text-sm mt-2">{tenant.subscription_status}</p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6">
                  <p className="text-green-100 text-sm mb-2">Costo Mensual</p>
                  <p className="text-2xl font-bold">€{tenant.monthly_cost.toFixed(2)}</p>
                  <p className="text-green-100 text-sm mt-2">Por mes</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6">
                  <p className="text-purple-100 text-sm mb-2">Ingresos Totales</p>
                  <p className="text-2xl font-bold">€{tenant.total_revenue.toFixed(2)}</p>
                  <p className="text-purple-100 text-sm mt-2">Histórico</p>
                </div>
              </div>

              {tenant.is_trial && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-900">Período de Prueba</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      El período de prueba finaliza el {formatDate(tenant.trial_end_date)}
                    </p>
                  </div>
                </div>
              )}

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Información de Stripe</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customer ID:</span>
                    <span className="font-mono text-gray-900">{tenant.stripe_customer_id || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 p-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TenantsManagement() {
  const [tenants, setTenants] = useState<AdminTenantOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'suspended' | 'trial'>('all');
  const [selectedTenant, setSelectedTenant] = useState<AdminTenantOverview | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [expandedTenants, setExpandedTenants] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await TenantDataService.getAdminTenantsOverview();
      setTenants(data);
    } catch (err) {
      console.error('Error loading tenants:', err);
      setError('Error al cargar los clientes. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const filteredTenants = tenants.filter((tenant) => {
    const matchesSearch =
      tenant.tenant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.contact_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.tenant_id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'active' && !tenant.is_suspended && !tenant.is_trial) ||
      (filterStatus === 'suspended' && tenant.is_suspended) ||
      (filterStatus === 'trial' && tenant.is_trial);

    return matchesSearch && matchesFilter;
  });

  const handleViewDetails = (tenant: AdminTenantOverview) => {
    setSelectedTenant(tenant);
    setIsDetailsModalOpen(true);
  };

  const toggleTenantExpansion = (tenantId: string) => {
    const newExpanded = new Set(expandedTenants);
    if (newExpanded.has(tenantId)) {
      newExpanded.delete(tenantId);
    } else {
      newExpanded.add(tenantId);
    }
    setExpandedTenants(newExpanded);
  };

  const getStatusBadge = (tenant: AdminTenantOverview) => {
    if (tenant.is_suspended) {
      return (
        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium flex items-center gap-1">
          <PowerOff className="w-3 h-3" />
          Suspendido
        </span>
      );
    }
    if (tenant.is_trial) {
      return (
        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Trial
        </span>
      );
    }
    return (
      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
        <CheckCircle className="w-3 h-3" />
        Activo
      </span>
    );
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
          <p className="text-gray-600">Cargando clientes/tenants...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadTenants}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-8 h-8 text-blue-600" />
              Gestión de Clientes (Tenants)
            </h1>
            <p className="text-gray-600 mt-1">
              Administra todos los clientes y sus empresas asociadas
            </p>
          </div>
          <button
            onClick={loadTenants}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8" />
              <div>
                <p className="text-blue-100 text-sm">Total Clientes</p>
                <p className="text-2xl font-bold">{tenants.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8" />
              <div>
                <p className="text-green-100 text-sm">Activos</p>
                <p className="text-2xl font-bold">
                  {tenants.filter(t => !t.is_suspended && !t.is_trial).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8" />
              <div>
                <p className="text-yellow-100 text-sm">En Trial</p>
                <p className="text-2xl font-bold">
                  {tenants.filter(t => t.is_trial).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg p-4">
            <div className="flex items-center gap-3">
              <PowerOff className="w-8 h-8" />
              <div>
                <p className="text-red-100 text-sm">Suspendidos</p>
                <p className="text-2xl font-bold">
                  {tenants.filter(t => t.is_suspended).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre, email o ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'active', 'trial', 'suspended'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'Todos' : status === 'active' ? 'Activos' : status === 'trial' ? 'Trial' : 'Suspendidos'}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filteredTenants.length > 0 ? (
            filteredTenants.map((tenant) => (
              <div key={tenant.tenant_id} className="border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Building2 className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-gray-900 text-lg">{tenant.tenant_name}</h3>
                          {getStatusBadge(tenant)}
                        </div>
                        <p className="text-sm text-gray-600">{tenant.contact_email || 'Sin email'}</p>
                        <div className="flex gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            {tenant.companies_count} empresas
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            {tenant.documents_count} documentos
                          </span>
                          <span className="flex items-center gap-1">
                            <Database className="w-4 h-4" />
                            {formatBytes(tenant.storage_used)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewDetails(tenant)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => toggleTenantExpansion(tenant.tenant_id)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title={expandedTenants.has(tenant.tenant_id) ? 'Contraer' : 'Expandir'}
                      >
                        {expandedTenants.has(tenant.tenant_id) ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {expandedTenants.has(tenant.tenant_id) && (
                    <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-4 gap-4">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-xs text-blue-600 mb-1">Plan</p>
                        <p className="font-semibold text-gray-900 capitalize">{tenant.subscription_plan}</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <p className="text-xs text-green-600 mb-1">Ingresos Totales</p>
                        <p className="font-semibold text-gray-900">€{tenant.total_revenue.toFixed(2)}</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3">
                        <p className="text-xs text-purple-600 mb-1">Proyectos</p>
                        <p className="font-semibold text-gray-900">{tenant.projects_count}</p>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-3">
                        <p className="text-xs text-orange-600 mb-1">Usuarios</p>
                        <p className="font-semibold text-gray-900">{tenant.users_count}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No se encontraron clientes</p>
            </div>
          )}
        </div>
      </div>

      <TenantDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        tenant={selectedTenant}
      />
    </div>
  );
}
