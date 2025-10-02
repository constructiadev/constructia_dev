import React, { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, Calendar, User, FileText, Settings, Database, CreditCard, Shield, AlertTriangle, CheckCircle, XCircle, Clock, Building2, Eye } from 'lucide-react';
import { getAuditLogs } from '../../lib/supabase';

interface AuditLog {
  id: string;
  action: string;
  resource: string;
  details: any;
  ip_address: string;
  user_agent: string;
  created_at: string;
  users: {
    email: string;
    role: string;
  };
  clients?: {
    company_name: string;
  };
}

const AuditModule: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tenantFilter, setTenantFilter] = useState('all');
  const [expandedDetails, setExpandedDetails] = useState<string[]>([]);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAuditLogs();
      setLogs(data || []);
      setFilteredLogs(data || []);
    } catch (err) {
      console.error('Error loading audit logs:', err);
      setError(err instanceof Error ? err.message : 'Error loading audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, []);

  useEffect(() => {
    let filtered = logs;

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.users?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.clients?.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por acción
    if (actionFilter !== 'all') {
      filtered = filtered.filter(log => log.action === actionFilter);
    }

    // Filtro por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(log => log.status === statusFilter);
    }

    // Filtro por tenant
    if (tenantFilter !== 'all') {
      filtered = filtered.filter(log => log.tenant_id === tenantFilter);
    }
    // Filtro por fecha
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      filtered = filtered.filter(log => new Date(log.created_at) >= filterDate);
    }

    setFilteredLogs(filtered);
  }, [logs, searchTerm, actionFilter, dateFilter, statusFilter, tenantFilter]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'login':
      case 'client.login':
      case 'admin.login':
      case 'logout':
        return <User className="w-4 h-4" />;
      case 'create':
      case 'client.logout':
      case 'admin.logout':
      case 'upload':
        return <FileText className="w-4 h-4" />;
      case 'update':
      case 'edit':
        return <Settings className="w-4 h-4" />;
      case 'delete':
        return <XCircle className="w-4 h-4" />;
      case 'payment':
        return <CreditCard className="w-4 h-4" />;
      case 'security':
        return <Shield className="w-4 h-4" />;
      default:
        return <Database className="w-4 h-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'login':
        return 'text-green-600 bg-green-50';
      case 'logout':
        return 'text-blue-600 bg-blue-50';
      case 'create':
      case 'client.registered':
      case 'empresa.created':
      case 'obra.created':
      case 'upload':
      case 'document.uploaded':
      case 'document.uploaded_to_queue':
        return 'text-emerald-600 bg-emerald-50';
      case 'update':
      case 'edit':
      case 'document.approved':
      case 'document.rejected':
        return 'text-amber-600 bg-amber-50';
      case 'delete':
      case 'document.purged':
      case 'client.login':
      case 'admin.login':
        return 'text-red-600 bg-red-50';
      case 'payment':
      case 'client.logout':
      case 'admin.logout':
      case 'payment.completed':
      case 'payment.failed':
      case 'client.registered':
      case 'empresa.created':
      case 'obra.created':
        return 'text-purple-600 bg-purple-50';
      case 'document.uploaded':
      case 'document.uploaded_to_queue':
      case 'security':
      case 'security.breach':
      case 'security.alert':
      case 'document.approved':
      case 'document.rejected':
        return 'text-orange-600 bg-orange-50';
      case 'integration.sent':
      case 'document.purged':
      case 'integration.received':
        return <Globe className="w-4 h-4" />;
      case 'payment.completed':
      case 'payment.failed':
      case 'data.access':
      case 'data.export':
      case 'security.breach':
      case 'security.alert':
        return <Download className="w-4 h-4" />;
      case 'integration.sent':
      case 'integration.received':
        return 'text-indigo-600 bg-indigo-50';
      case 'data.access':
      case 'data.export':
        return 'text-cyan-600 bg-cyan-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const uniqueActions = [...new Set(logs.map(log => log.action))];
  const uniqueTenants = [...new Set(logs.map(log => log.tenant_id))];
  const uniqueStatuses = [...new Set(logs.map(log => log.status))];

  const stats = {
    total: logs.length,
    today: logs.filter(log => {
      const today = new Date();
      const logDate = new Date(log.created_at);
      return logDate.toDateString() === today.toDateString();
    }).length,
    thisWeek: logs.filter(log => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(log.created_at) >= weekAgo;
    }).length,
    errors: logs.filter(log => log.status === 'error').length,
    warnings: logs.filter(log => log.status === 'warning').length,
    success: logs.filter(log => log.status === 'success').length,
    uniqueTenants: uniqueTenants.length,
    personalDataEvents: logs.filter(log => log.data_classification === 'personal_data').length
  };
  const toggleDetailsExpansion = (logId: string) => {
    setExpandedDetails(prev => 
      prev.includes(logId) 
        ? prev.filter(id => id !== logId)
        : [...prev, logId]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'error': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'error': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getDataClassificationColor = (classification: string) => {
    switch (classification) {
      case 'personal_data': return 'text-red-600 bg-red-50 border-red-200';
      case 'system_data': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-gray-600">Cargando logs de auditoría...</span>
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
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-red-800 font-medium">Error al cargar logs</span>
          </div>
          <p className="text-red-700 mt-2">{error}</p>
          <button
            onClick={loadAuditLogs}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Auditoría del Sistema</h1>
          <p className="text-gray-600 mt-1">Registro completo de actividades del sistema</p>
        </div>
        <button
          onClick={loadAuditLogs}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Database className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Logs</p>
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
              <p className="text-sm text-gray-600">Exitosos</p>
              <p className="text-xl font-semibold text-green-600">{stats.success}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Advertencias</p>
              <p className="text-xl font-semibold text-yellow-600">{stats.warnings}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
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
              <Building2 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tenants</p>
              <p className="text-xl font-semibold text-purple-600">{stats.uniqueTenants}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Shield className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Datos Personales</p>
              <p className="text-xl font-semibold text-orange-600">{stats.personalDataEvents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Calendar className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Esta Semana</p>
              <p className="text-xl font-semibold text-indigo-600">{stats.thisWeek}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por usuario, acción, IP, tenant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtro por acción */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">Todas las acciones</option>
              {uniqueActions.map(action => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>
          </div>

          {/* Filtro por estado */}
          <div className="relative">
            <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">Todos los estados</option>
              <option value="success">✅ Exitosos</option>
              <option value="warning">⚠️ Advertencias</option>
              <option value="error">❌ Errores</option>
            </select>
          </div>

          {/* Filtro por tenant */}
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={tenantFilter}
              onChange={(e) => setTenantFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">Todos los tenants</option>
              {uniqueTenants.map(tenantId => (
                <option key={tenantId} value={tenantId}>
                  {logs.find(l => l.tenant_id === tenantId)?.clients?.company_name || `Tenant ${tenantId.substring(0, 8)}`}
                </option>
              ))}
            </select>
          </div>
          {/* Filtro por fecha */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">Todas las fechas</option>
              <option value="today">Hoy</option>
              <option value="week">Última semana</option>
              <option value="month">Último mes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de logs */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recurso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tenant/Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Clasificación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User Agent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Detalles
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center space-y-2">
                      <Database className="w-8 h-8 text-gray-400" />
                      <span className="text-gray-500">No hay logs de auditoría disponibles</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className={`hover:bg-gray-50 ${
                    log.status === 'error' ? 'bg-red-50' : 
                    log.status === 'warning' ? 'bg-yellow-50' : ''
                  }`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className={`p-1 rounded-full ${log.users?.role === 'admin' ? 'bg-purple-100' : 'bg-blue-100'}`}>
                          <User className={`w-3 h-3 ${log.users?.role === 'admin' ? 'text-purple-600' : 'text-blue-600'}`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{log.users?.email}</p>
                          <p className="text-xs text-gray-500 capitalize">{log.users?.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                        {getActionIcon(log.action)}
                        <span className="capitalize">{log.action}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 capitalize">{log.resource}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(log.status)}`}>
                        {getStatusIcon(log.status)}
                        <span className="capitalize">{log.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <span className="text-sm font-medium text-gray-900">
                          {log.clients?.company_name || 'Sistema'}
                        </span>
                        <p className="text-xs text-gray-500">
                          {log.tenant_id?.substring(0, 8)}...
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getDataClassificationColor(log.data_classification)}`}>
                        {log.data_classification === 'personal_data' ? '🔒 Datos Personales' : '⚙️ Datos Sistema'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{formatDate(log.created_at)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500 font-mono">{log.ip_address}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap max-w-xs">
                      <div className="text-sm text-gray-500 truncate" title={log.user_agent}>
                        {log.user_agent.length > 30 ? `${log.user_agent.substring(0, 30)}...` : log.user_agent}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleDetailsExpansion(log.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        {expandedDetails.includes(log.id) ? 'Ocultar' : 'Ver'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
              
              {/* Expanded details rows */}
              {filteredLogs.map((log) => (
                expandedDetails.includes(log.id) && (
                  <tr key={`${log.id}-details`} className="bg-gray-50">
                    <td colSpan={10} className="px-6 py-4">
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <Database className="w-4 h-4 mr-2" />
                          Detalles del Evento de Auditoría
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase">Session ID</label>
                            <p className="text-sm text-gray-900 font-mono">{log.session_id}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase">Nivel de Cumplimiento</label>
                            <p className="text-sm text-gray-900">{log.compliance_level}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase">Clasificación de Datos</label>
                            <p className="text-sm text-gray-900">{log.data_classification}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase">Tenant ID</label>
                            <p className="text-sm text-gray-900 font-mono">{log.tenant_id}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase">User Agent Completo</label>
                            <p className="text-sm text-gray-900 break-all">{log.user_agent}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase">Timestamp</label>
                            <p className="text-sm text-gray-900">{log.details?.timestamp || 'N/A'}</p>
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">Detalles JSON</label>
                          <pre className="text-xs text-gray-700 bg-gray-100 p-3 rounded-lg overflow-x-auto max-h-40">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Información adicional */}
      {filteredLogs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <span className="text-blue-800 font-medium">
                Mostrando {filteredLogs.length} de {logs.length} logs de auditoría
              </span>
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">
                Cumplimiento GDPR/LOPD - Retención: 6 años
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditModule;