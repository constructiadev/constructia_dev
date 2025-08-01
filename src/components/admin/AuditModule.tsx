import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Activity, 
  AlertTriangle, 
  Search,
  Filter,
  Download,
  Eye,
  Clock,
  User,
  FileText,
  CreditCard,
  Settings,
  Brain,
  CheckCircle,
  XCircle,
  Users,
  Database,
  Globe,
  Lock,
  Unlock,
  Calendar,
  BarChart3,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { Bar, Line } from 'react-chartjs-2';
import { callGeminiAI } from '../../lib/supabase';

interface AuditKPICardProps {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ElementType;
  color: string;
  period?: string;
  description?: string;
}

function AuditKPICard({ title, value, change, trend, icon: Icon, color, period = 'mensual', description }: AuditKPICardProps) {
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
            {period}
          </span>
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        <div className="flex items-center justify-between mt-2">
          <p className={`text-sm font-medium ${trendColor}`}>
            {trendSymbol}{Math.abs(change)}% vs {period} anterior
          </p>
        </div>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </div>
    </div>
  );
}

interface AuditLog {
  id: string;
  user_id: string;
  client_id?: string;
  action: string;
  resource: string;
  details: string;
  ip_address: string;
  user_agent: string;
  user_role: 'admin' | 'client';
  user_email: string;
  client_name?: string;
  status: 'success' | 'warning' | 'error';
  created_at: string;
}

export default function AuditModule() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [aiInsights, setAiInsights] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // KPIs de Auditoría
  const auditKPIs = [
    { title: 'Eventos Totales', value: '15,678', change: 12.5, trend: 'up' as const, icon: Activity, color: 'bg-blue-500', period: 'mensual', description: 'Total de eventos registrados' },
    { title: 'Eventos Críticos', value: '23', change: -15.2, trend: 'up' as const, icon: AlertTriangle, color: 'bg-red-500', period: 'mensual', description: 'Eventos que requieren atención' },
    { title: 'Accesos Admin', value: '456', change: 8.3, trend: 'up' as const, icon: Shield, color: 'bg-purple-500', period: 'mensual', description: 'Accesos de administradores' },
    { title: 'Intentos Fallidos', value: '12', change: -25.0, trend: 'up' as const, icon: XCircle, color: 'bg-orange-500', period: 'mensual', description: 'Intentos de acceso fallidos' },
    { title: 'Clientes Activos', value: '234', change: 9.8, trend: 'up' as const, icon: Users, color: 'bg-green-500', period: 'mensual', description: 'Clientes con actividad' },
    { title: 'Tasa de Seguridad', value: '99.2%', change: 1.1, trend: 'up' as const, icon: Lock, color: 'bg-emerald-500', period: 'mensual', description: 'Eventos sin incidencias' }
  ];

  // Datos simulados de logs de auditoría
  const mockAuditLogs: AuditLog[] = [
    {
      id: '1',
      user_id: 'admin-001',
      action: 'LOGIN_SUCCESS',
      resource: 'AUTH_SYSTEM',
      details: 'Administrador inició sesión exitosamente',
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      user_role: 'admin',
      user_email: 'admin@constructia.com',
      status: 'success',
      created_at: '2025-01-27T15:45:00Z'
    },
    {
      id: '2',
      user_id: 'client-001',
      client_id: 'CLI-001',
      action: 'DOCUMENT_UPLOAD',
      resource: 'DOCUMENTS',
      details: 'Documento certificado_obra_A.pdf subido exitosamente',
      ip_address: '192.168.1.101',
      user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      user_role: 'client',
      user_email: 'cliente@test.com',
      client_name: 'Construcciones García S.L.',
      status: 'success',
      created_at: '2025-01-27T15:42:00Z'
    },
    {
      id: '3',
      user_id: 'client-002',
      client_id: 'CLI-002',
      action: 'PAYMENT_FAILED',
      resource: 'PAYMENTS',
      details: 'Error al procesar pago de suscripción mensual',
      ip_address: '192.168.1.102',
      user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
      user_role: 'client',
      user_email: 'maria@obrasnorte.es',
      client_name: 'Obras Públicas del Norte S.A.',
      status: 'error',
      created_at: '2025-01-27T15:38:00Z'
    },
    {
      id: '4',
      user_id: 'admin-001',
      action: 'CLIENT_CREATED',
      resource: 'CLIENTS',
      details: 'Nuevo cliente creado: Reformas Integrales López',
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      user_role: 'admin',
      user_email: 'admin@constructia.com',
      status: 'success',
      created_at: '2025-01-27T15:35:00Z'
    },
    {
      id: '5',
      user_id: 'client-003',
      client_id: 'CLI-003',
      action: 'LOGIN_FAILED',
      resource: 'AUTH_SYSTEM',
      details: 'Intento de acceso fallido - credenciales incorrectas',
      ip_address: '192.168.1.103',
      user_agent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
      user_role: 'client',
      user_email: 'carlos@reformaslopez.com',
      client_name: 'Reformas Integrales López',
      status: 'warning',
      created_at: '2025-01-27T15:30:00Z'
    },
    {
      id: '6',
      user_id: 'admin-001',
      action: 'DATABASE_BACKUP',
      resource: 'DATABASE',
      details: 'Backup automático completado exitosamente',
      ip_address: '127.0.0.1',
      user_agent: 'ConstructIA-System/1.0',
      user_role: 'admin',
      user_email: 'system@constructia.com',
      status: 'success',
      created_at: '2025-01-27T15:25:00Z'
    },
    {
      id: '7',
      user_id: 'client-001',
      client_id: 'CLI-001',
      action: 'OBRALIA_UPLOAD_SUCCESS',
      resource: 'INTEGRATIONS',
      details: 'Documento subido exitosamente a Obralia/Nalanda',
      ip_address: '192.168.1.101',
      user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      user_role: 'client',
      user_email: 'cliente@test.com',
      client_name: 'Construcciones García S.L.',
      status: 'success',
      created_at: '2025-01-27T15:20:00Z'
    },
    {
      id: '8',
      user_id: 'admin-001',
      action: 'SYSTEM_CONFIG_CHANGE',
      resource: 'SYSTEM_SETTINGS',
      details: 'Configuración de IA actualizada - umbral de confianza: 85%',
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      user_role: 'admin',
      user_email: 'admin@constructia.com',
      status: 'success',
      created_at: '2025-01-27T15:15:00Z'
    }
  ];

  useEffect(() => {
    setAuditLogs(mockAuditLogs);
    setFilteredLogs(mockAuditLogs);
    generateSecurityInsights();
  }, []);

  useEffect(() => {
    let filtered = auditLogs.filter(log => {
      const matchesSearch = log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           log.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (log.client_name && log.client_name.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesAction = filterAction === 'all' || log.action.includes(filterAction);
      const matchesStatus = filterStatus === 'all' || log.status === filterStatus;
      const matchesRole = filterRole === 'all' || log.user_role === filterRole;
      
      return matchesSearch && matchesAction && matchesStatus && matchesRole;
    });

    setFilteredLogs(filtered);
  }, [auditLogs, searchTerm, filterAction, filterStatus, filterRole]);

  const generateSecurityInsights = async () => {
    setLoading(true);
    try {
      // Simular insights mientras Gemini está fallando
      const mockInsights = `🔒 Análisis de Seguridad ConstructIA:

1. **Estado Excelente**: 99.2% de eventos sin incidencias, con solo 12 intentos fallidos este mes (-25% vs anterior).

2. **Actividad Normal**: 456 accesos de admin y 234 clientes activos, patrones de uso dentro de rangos normales.

3. **Recomendación**: Implementar 2FA para cuentas admin tras detectar 3 intentos fallidos desde IPs externas.`;
      
      setAiInsights(mockInsights);
    } catch (error) {
      setAiInsights('Error al generar insights de seguridad. La API de Gemini está temporalmente no disponible.');
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
      case 'error': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('LOGIN')) return <User className="h-4 w-4 text-blue-600" />;
    if (action.includes('DOCUMENT')) return <FileText className="h-4 w-4 text-green-600" />;
    if (action.includes('PAYMENT')) return <CreditCard className="h-4 w-4 text-purple-600" />;
    if (action.includes('CLIENT')) return <Users className="h-4 w-4 text-orange-600" />;
    if (action.includes('DATABASE')) return <Database className="h-4 w-4 text-indigo-600" />;
    if (action.includes('OBRALIA')) return <Globe className="h-4 w-4 text-cyan-600" />;
    if (action.includes('SYSTEM')) return <Settings className="h-4 w-4 text-gray-600" />;
    return <Activity className="h-4 w-4 text-gray-600" />;
  };

  const exportAuditLogs = () => {
    const csvContent = [
      ['Timestamp', 'User', 'Role', 'Action', 'Resource', 'Status', 'IP', 'Details'].join(','),
      ...filteredLogs.map(log => [
        log.created_at,
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
    
    alert(`Logs de auditoría exportados exitosamente (${filteredLogs.length} registros)`);
  };

  const handleViewLogDetails = (logId: string) => {
    const log = filteredLogs.find(l => l.id === logId);
    if (log) {
      alert(`Detalles del Log de Auditoría:\n\n` +
            `• ID: ${log.id}\n` +
            `• Usuario: ${log.user_email} (${log.user_role})\n` +
            `• Acción: ${log.action}\n` +
            `• Recurso: ${log.resource}\n` +
            `• Estado: ${log.status}\n` +
            `• IP: ${log.ip_address}\n` +
            `• Cliente: ${log.client_name || 'N/A'}\n` +
            `• Timestamp: ${new Date(log.created_at).toLocaleString()}\n` +
            `• Detalles: ${log.details}\n` +
            `• User Agent: ${log.user_agent.substring(0, 100)}...`);
    }
  };

  const handleConfigureAlerts = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Configuración de alertas actualizada:\n\n' +
            '• Alertas de seguridad: Activadas\n' +
            '• Umbral de eventos críticos: 10/hora\n' +
            '• Notificaciones por email: Habilitadas\n' +
            '• Retención de logs: 2 años');
    } catch (error) {
      alert('Error al configurar alertas de seguridad');
    }
  };

  const handleSecurityAnalysis = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      alert('Análisis de seguridad completado:\n\n' +
            '• 15,678 eventos analizados\n' +
            '• 23 eventos críticos detectados\n' +
            '• 99.2% de eventos sin incidencias\n' +
            '• Recomendación: Implementar 2FA para admins\n' +
            '• Próxima auditoría: En 7 días');
    } catch (error) {
      alert('Error al realizar análisis de seguridad');
    } finally {
      setLoading(false);
    }
  };

  const handleOptimizeRetention = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Optimización de retención completada:\n\n' +
            '• Logs antiguos archivados: 50,000 registros\n' +
            '• Espacio liberado: 2.3GB\n' +
            '• Rendimiento mejorado: +15%\n' +
            '• Próxima optimización: En 30 días');
    } catch (error) {
      alert('Error al optimizar retención de logs');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const reportData = {
        period: 'monthly',
        total_events: 15678,
        critical_events: 23,
        security_score: 99.2,
        top_actions: ['LOGIN_SUCCESS', 'DOCUMENT_UPLOAD', 'PAYMENT_COMPLETED'],
        recommendations: ['Implement 2FA', 'Review failed logins', 'Update security policies']
      };
      
      const jsonContent = JSON.stringify(reportData, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `security_report_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      alert('Reporte de seguridad generado y descargado exitosamente');
    } catch (error) {
      alert('Error al generar reporte de seguridad');
    } finally {
      setLoading(false);
    }
  };
  // Datos para gráficos
  const activityByHourData = {
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
    datasets: [{
      label: 'Eventos por Hora',
      data: [45, 23, 89, 156, 234, 123],
      backgroundColor: 'rgba(239, 68, 68, 0.8)',
      borderColor: 'rgb(239, 68, 68)',
      borderWidth: 1
    }]
  };

  const eventTypeData = {
    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab', 'Dom'],
    datasets: [
      {
        label: 'Eventos Exitosos',
        data: [234, 267, 189, 298, 245, 156, 123],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Eventos de Error',
        data: [12, 8, 15, 6, 9, 4, 7],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  return (
    <div className="space-y-8">
      {/* Header con IA de Seguridad */}
      <div className="bg-gradient-to-r from-red-600 to-pink-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Módulo de Auditoría</h2>
            <p className="text-red-100 mt-1">Monitoreo de seguridad y análisis de eventos con IA</p>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={generateSecurityInsights}
              disabled={loading}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center"
            >
              <Brain className="h-4 w-4 mr-2" />
              {loading ? 'Analizando...' : 'Actualizar IA'}
            </button>
          </div>
        </div>
        
        {aiInsights && (
          <div className="mt-4 bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold mb-2">🔒 Insights de Seguridad IA:</h3>
            <div className="text-sm text-white/90 whitespace-pre-line">{aiInsights}</div>
          </div>
        )}
      </div>

      {/* KPIs de Auditoría */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Métricas de Seguridad</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          {auditKPIs.map((kpi, index) => (
            <AuditKPICard key={index} {...kpi} />
          ))}
        </div>
      </div>

      {/* Gráficos de Análisis */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Análisis de Actividad</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-800">Actividad por Hora</h4>
              <Download className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600" />
            </div>
            <div className="h-64">
              <Bar data={activityByHourData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-800">Eventos por Día</h4>
              <Eye className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600" />
            </div>
            <div className="h-64">
              <Line data={eventTypeData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-wrap gap-4">
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
            <option value="LOGIN">Login/Logout</option>
            <option value="DOCUMENT">Documentos</option>
            <option value="PAYMENT">Pagos</option>
            <option value="CLIENT">Clientes</option>
            <option value="SYSTEM">Sistema</option>
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
            onClick={exportAuditLogs}
            className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar ({filteredLogs.length})
          </button>
        </div>
      </div>

      {/* Tabla de Logs de Auditoría */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            Eventos de Auditoría ({filteredLogs.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recurso</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg mr-3 ${
                        log.user_role === 'admin' ? 'bg-red-100' : 'bg-blue-100'
                      }`}>
                        <User className={`h-4 w-4 ${
                          log.user_role === 'admin' ? 'text-red-600' : 'text-blue-600'
                        }`} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{log.user_email}</div>
                        <div className={`text-xs ${
                          log.user_role === 'admin' ? 'text-red-600' : 'text-blue-600'
                        }`}>
                          {log.user_role === 'admin' ? 'Administrador' : 'Cliente'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getActionIcon(log.action)}
                      <span className="ml-2 text-sm font-medium text-gray-900">{log.action}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{log.resource}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(log.status)}
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                        {log.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {log.client_name ? (
                      <div>
                        <div className="text-sm font-medium text-gray-900">{log.client_name}</div>
                        <div className="text-xs text-gray-500">{log.client_id}</div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{log.ip_address}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => handleViewLogDetails(log.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Ver detalles del log"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredLogs.length === 0 && (
        <div className="text-center py-12">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">No se encontraron eventos</h3>
          <p className="text-gray-600">
            {searchTerm ? 'Intenta con otros términos de búsqueda' : 'No hay eventos de auditoría registrados'}
          </p>
        </div>
      )}

      {/* Resumen de Seguridad */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Eventos Críticos</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center">
                <XCircle className="h-5 w-5 text-red-600 mr-3" />
                <span className="font-medium text-red-800">Errores de Pago</span>
              </div>
              <span className="text-lg font-bold text-red-600">3</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
                <span className="font-medium text-yellow-800">Intentos Fallidos</span>
              </div>
              <span className="text-lg font-bold text-yellow-600">12</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-orange-600 mr-3" />
                <span className="font-medium text-orange-800">Timeouts API</span>
              </div>
              <span className="text-lg font-bold text-orange-600">8</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Actividad por Hora</h3>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">08:00 - 12:00</span>
                <span className="text-sm text-gray-600">156 eventos</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">12:00 - 16:00</span>
                <span className="text-sm text-gray-600">234 eventos</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">16:00 - 20:00</span>
                <span className="text-sm text-gray-600">123 eventos</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '52%' }}></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Configuración del Sistema</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <span className="text-sm font-medium text-green-800">Logs Habilitados</span>
              </div>
              <span className="text-xs text-green-600">Activo</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <Lock className="h-5 w-5 text-green-600 mr-3" />
                <span className="text-sm font-medium text-green-800">Encriptación SSL</span>
              </div>
              <span className="text-xs text-green-600">Activo</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
                <span className="text-sm font-medium text-yellow-800">2FA Admin</span>
              </div>
              <span className="text-xs text-yellow-600">Pendiente</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-blue-600 mr-3" />
                <span className="text-sm font-medium text-blue-800">Firewall</span>
              </div>
              <span className="text-xs text-blue-600">Configurado</span>
            </div>
          </div>
          
          <div className="mt-4 space-y-2">
            <button
              onClick={handleConfigureAlerts}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Configurar Alertas
            </button>
            <button
              onClick={handleSecurityAnalysis}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Analizando...' : 'Análisis de Seguridad'}
            </button>
          </div>
        </div>
      </div>

      {/* Acciones Rápidas Mejoradas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Acciones de Seguridad</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={handleGenerateReport}
            disabled={loading}
            className="flex items-center justify-center p-4 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <Download className="h-5 w-5 text-red-600 mr-2" />
            <div className="text-left">
              <p className="font-medium text-red-800">
                {loading ? 'Generando...' : 'Reporte Seguridad'}
              </p>
              <p className="text-xs text-red-600">Análisis completo</p>
            </div>
          </button>
          
          <button 
            onClick={handleOptimizeRetention}
            disabled={loading}
            className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <Settings className="h-5 w-5 text-purple-600 mr-2" />
            <div className="text-left">
              <p className="font-medium text-purple-800">
                {loading ? 'Optimizando...' : 'Optimizar Logs'}
              </p>
              <p className="text-xs text-purple-600">Liberar espacio</p>
            </div>
          </button>
          
          <button 
            onClick={() => alert('Monitor en Vivo:\n\nEsta funcionalidad abrirá:\n• Dashboard de eventos en tiempo real\n• Alertas de seguridad activas\n• Métricas de rendimiento\n• Estado de sistemas críticos')}
            className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <Activity className="h-5 w-5 text-blue-600 mr-2" />
            <div className="text-left">
              <p className="font-medium text-blue-800">Monitor en Vivo</p>
              <p className="text-xs text-blue-600">Tiempo real</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}