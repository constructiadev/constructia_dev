import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Shield, 
  Eye, 
  Search,
  Filter,
  Download,
  Calendar,
  User,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Brain,
  Database,
  Settings
} from 'lucide-react';
import { callGeminiAI } from '../../lib/supabase';

interface AuditLog {
  id: string;
  timestamp: string;
  user_id: string;
  user_email: string;
  user_role: 'client' | 'admin';
  action: string;
  resource: string;
  details: string;
  ip_address: string;
  user_agent: string;
  status: 'success' | 'warning' | 'error';
  client_id?: string;
}

interface AuditKPICardProps {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ElementType;
  color: string;
  period: string;
}

function AuditKPICard({ title, value, change, trend, icon: Icon, color, period }: AuditKPICardProps) {
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600';
  const trendSymbol = trend === 'up' ? '+' : trend === 'down' ? '-' : '';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <div className="flex items-center justify-between mt-2">
            <p className={`text-sm font-medium ${trendColor}`}>
              {trendSymbol}{Math.abs(change)}% vs {period} anterior
            </p>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {period}
            </span>
          </div>
        </div>
        <div className={`p-3 rounded-lg ${color} ml-4`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function AuditModule() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [dateRange, setDateRange] = useState('today');
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // KPIs de Auditoría
  const auditKPIs = [
    { title: 'Eventos Totales', value: '12,456', change: 18.5, trend: 'up' as const, icon: Activity, color: 'bg-blue-500', period: 'diario' },
    { title: 'Accesos Admin', value: '89', change: 12.3, trend: 'up' as const, icon: Shield, color: 'bg-red-500', period: 'diario' },
    { title: 'Accesos Cliente', value: '1,247', change: 8.7, trend: 'up' as const, icon: User, color: 'bg-green-500', period: 'diario' },
    { title: 'Documentos Subidos', value: '234', change: 15.2, trend: 'up' as const, icon: FileText, color: 'bg-purple-500', period: 'diario' },
    { title: 'Eventos Críticos', value: '3', change: -25.0, trend: 'up' as const, icon: AlertTriangle, color: 'bg-orange-500', period: 'diario' },
    { title: 'Sesiones Activas', value: '67', change: 5.4, trend: 'up' as const, icon: Clock, color: 'bg-indigo-500', period: 'tiempo real' }
  ];

  // Datos simulados de logs de auditoría
  const mockAuditLogs: AuditLog[] = [
    {
      id: '1',
      timestamp: '2025-01-27 15:45:23',
      user_id: 'admin-001',
      user_email: 'admin@constructia.com',
      user_role: 'admin',
      action: 'LOGIN',
      resource: 'admin_panel',
      details: 'Acceso exitoso al panel de administración',
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      status: 'success'
    },
    {
      id: '2',
      timestamp: '2025-01-27 15:42:15',
      user_id: 'client-001',
      user_email: 'juan@construccionesgarcia.com',
      user_role: 'client',
      action: 'DOCUMENT_UPLOAD',
      resource: 'documents',
      details: 'Subida de documento: certificado_obra_A.pdf',
      ip_address: '85.123.45.67',
      user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      status: 'success',
      client_id: '2024-REC-0001'
    },
    {
      id: '3',
      timestamp: '2025-01-27 15:38:42',
      user_id: 'client-002',
      user_email: 'maria@obrasnorte.es',
      user_role: 'client',
      action: 'PAYMENT_PROCESS',
      resource: 'payments',
      details: 'Procesamiento de pago de suscripción mensual - €149',
      ip_address: '78.234.56.89',
      user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
      status: 'success',
      client_id: '2024-REC-0002'
    },
    {
      id: '4',
      timestamp: '2025-01-27 15:35:18',
      user_id: 'system',
      user_email: 'system@constructia.com',
      user_role: 'admin',
      action: 'BACKUP_COMPLETE',
      resource: 'database',
      details: 'Backup automático completado exitosamente - 2.4TB',
      ip_address: '127.0.0.1',
      user_agent: 'ConstructIA-System/1.0',
      status: 'success'
    },
    {
      id: '5',
      timestamp: '2025-01-27 15:30:05',
      user_id: 'client-003',
      user_email: 'carlos@reformaslopez.com',
      user_role: 'client',
      action: 'LOGIN_FAILED',
      resource: 'auth',
      details: 'Intento de acceso fallido - contraseña incorrecta',
      ip_address: '91.145.67.23',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      status: 'warning',
      client_id: '2024-REC-0003'
    }
  ];

  useEffect(() => {
    setAuditLogs(mockAuditLogs);
    setFilteredLogs(mockAuditLogs);
  }, []);

  useEffect(() => {
    let filtered = auditLogs.filter(log => {
      const matchesSearch = log.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           log.details.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesAction = filterAction === 'all' || log.action.toLowerCase().includes(filterAction.toLowerCase());
      const matchesStatus = filterStatus === 'all' || log.status === filterStatus;
      const matchesRole = filterRole === 'all' || log.user_role === filterRole;
      
      return matchesSearch && matchesAction && matchesStatus && matchesRole;
    });

    setFilteredLogs(filtered);
  }, [auditLogs, searchTerm, filterAction, filterStatus, filterRole]);

  const generateAuditAnalysis = async () => {
    setLoading(true);
    try {
      const prompt = `Como auditor de seguridad de ConstructIA, analiza estos datos de auditoría:
      - 12,456 eventos totales hoy (+18.5%)
      - 89 accesos admin (+12.3%)
      - 1,247 accesos cliente (+8.7%)
      - 234 documentos subidos (+15.2%)
      - 3 eventos críticos (-25%)
      - 67 sesiones activas
      
      Últimas actividades: Login admin exitoso, subida de documentos, procesamiento de pagos, backup completado, intento de login fallido.
      
      Genera análisis de seguridad y 3 recomendaciones (máximo 160 palabras).`;
      
      const analysis = await callGeminiAI(prompt);
      setAiAnalysis(analysis);
    } catch (error) {
      setAiAnalysis('Error al generar análisis de auditoría. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <CheckCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'client': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'User', 'Role', 'Action', 'Resource', 'Status', 'IP', 'Details'].join(','),
      ...filteredLogs.map(log => [
        log.timestamp,
        log.user_email,
        log.user_role,
        log.action,
        log.resource,
        log.status,
        log.ip_address,
        `"${log.details}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    generateAuditAnalysis();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header con IA */}
      <div className="bg-gradient-to-r from-red-600 to-pink-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Módulo de Auditoría</h2>
            <p className="text-red-100 mt-1">Monitoreo completo de actividad con análisis IA</p>
          </div>
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8" />
            <button 
              onClick={generateAuditAnalysis}
              disabled={loading}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Analizando...' : 'Análisis IA'}
            </button>
          </div>
        </div>
        
        {aiAnalysis && (
          <div className="mt-4 bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold mb-2">🔍 Análisis de Seguridad IA:</h3>
            <p className="text-sm text-white/90">{aiAnalysis}</p>
          </div>
        )}
      </div>

      {/* KPIs de Auditoría */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Métricas de Auditoría</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          {auditKPIs.map((kpi, index) => (
            <AuditKPICard key={index} {...kpi} />
          ))}
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por usuario, acción o detalles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
          >
            <option value="all">Todas las acciones</option>
            <option value="login">Login</option>
            <option value="document">Documentos</option>
            <option value="payment">Pagos</option>
            <option value="backup">Backup</option>
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
          >
            <option value="all">Todos los estados</option>
            <option value="success">Exitoso</option>
            <option value="warning">Advertencia</option>
            <option value="error">Error</option>
          </select>
          
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
          >
            <option value="all">Todos los roles</option>
            <option value="admin">Administrador</option>
            <option value="client">Cliente</option>
          </select>
          
          <button
            onClick={exportLogs}
            className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </button>
        </div>
      </div>

      {/* Logs de Auditoría */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            Registro de Actividad ({filteredLogs.length} eventos)
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recurso</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detalles</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-400 mr-2" />
                      {log.timestamp}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{log.user_email}</div>
                      <div className="flex items-center mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(log.user_role)}`}>
                          {log.user_role}
                        </span>
                        {log.client_id && (
                          <span className="ml-2 text-xs text-gray-500">{log.client_id}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">{log.action}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.resource}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(log.status)}
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                        {log.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                    {log.ip_address}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resumen de Seguridad */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-800">Eventos Críticos</h4>
            <AlertTriangle className="h-5 w-5 text-orange-500" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
              <span className="text-sm">Intentos de login fallidos</span>
              <span className="font-bold text-yellow-600">3</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-red-50 rounded">
              <span className="text-sm">Accesos no autorizados</span>
              <span className="font-bold text-red-600">0</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-orange-50 rounded">
              <span className="text-sm">Errores de sistema</span>
              <span className="font-bold text-orange-600">1</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-800">Actividad por Hora</h4>
            <BarChart3 className="h-5 w-5 text-blue-500" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">14:00-15:00</span>
              <div className="flex items-center">
                <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '80%' }}></div>
                </div>
                <span className="text-sm font-medium">456</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">15:00-16:00</span>
              <div className="flex items-center">
                <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
                <span className="text-sm font-medium">567</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-800">Configuración</h4>
            <Settings className="h-5 w-5 text-gray-500" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Retención de logs</span>
              <span className="text-sm font-medium">90 días</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Alertas por email</span>
              <span className="text-sm font-medium text-green-600">Activo</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Backup automático</span>
              <span className="text-sm font-medium text-green-600">Diario</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}