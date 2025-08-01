import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Activity, 
  BarChart3, 
  Settings,
  Brain,
  Globe,
  Shield,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Eye,
  RefreshCw,
  Plus,
  Download,
  Server,
  Cpu,
  HardDrive,
  Wifi,
  Code,
  Terminal,
  Key,
  Monitor,
  Database,
  Layers,
  Play,
  Pause,
  Upload
} from 'lucide-react';

interface APIKPICardProps {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ElementType;
  color: string;
  status?: 'active' | 'warning' | 'error';
  period?: string;
}

function APIKPICard({ title, value, change, trend, icon: Icon, color, status = 'active', period = 'tiempo real' }: APIKPICardProps) {
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600';
  const trendSymbol = trend === 'up' ? '+' : trend === 'down' ? '-' : '';
  
  const statusColors = {
    active: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800'
  };

  const statusIcons = {
    active: CheckCircle,
    warning: AlertTriangle,
    error: AlertTriangle
  };

  const StatusIcon = statusIcons[status];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="flex items-center space-x-2">
          <StatusIcon className={`h-4 w-4 ${status === 'active' ? 'text-green-600' : status === 'warning' ? 'text-yellow-600' : 'text-red-600'}`} />
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
            {trendSymbol}{Math.abs(change)}% vs período anterior
          </p>
        </div>
      </div>
    </div>
  );
}

interface APIEndpointCardProps {
  name: string;
  method: string;
  endpoint: string;
  requests: number;
  avgResponse: string;
  errorRate: string;
  status: 'healthy' | 'slow' | 'error';
  icon: React.ElementType;
  color: string;
}

function APIEndpointCard({ name, method, endpoint, requests, avgResponse, errorRate, status, icon: Icon, color }: APIEndpointCardProps) {
  const statusColors = {
    healthy: 'bg-green-100 text-green-800 border-green-200',
    slow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    error: 'bg-red-100 text-red-800 border-red-200'
  };

  const statusText = {
    healthy: 'Saludable',
    slow: 'Lento',
    error: 'Error'
  };

  return (
    <div className={`border rounded-xl p-6 ${statusColors[status]} hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center mr-3`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold">{name}</h4>
            <p className="text-sm opacity-75">{method} {endpoint}</p>
          </div>
        </div>
        <span className="text-xs font-medium">
          {statusText[status]}
        </span>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span>Requests/hora:</span>
          <span className="font-medium">{requests}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Tiempo respuesta:</span>
          <span className="font-medium">{avgResponse}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Error rate:</span>
          <span className="font-medium">{errorRate}</span>
        </div>
      </div>
      
      <div className="flex space-x-2 mt-4">
        <button className="flex-1 px-3 py-2 bg-white/50 hover:bg-white/75 rounded-lg transition-colors text-sm font-medium">
          <Eye className="h-3 w-3 inline mr-1" />
          Ver
        </button>
        <button className="px-3 py-2 bg-white/50 hover:bg-white/75 rounded-lg transition-colors">
          <Settings className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

interface APIIntegrationCardProps {
  name: string;
  icon: React.ElementType;
  status: 'connected' | 'warning' | 'error';
  description: string;
  requests: number;
  avgResponse: string;
  lastSync: string;
  color: string;
}

function APIIntegrationCard({ name, icon: Icon, status, description, requests, avgResponse, lastSync, color }: APIIntegrationCardProps) {
  const statusColors = {
    connected: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    error: 'bg-red-100 text-red-800 border-red-200'
  };

  const statusIcons = {
    connected: CheckCircle,
    warning: AlertTriangle,
    error: AlertTriangle
  };

  const StatusIcon = statusIcons[status];

  return (
    <div className={`border rounded-xl p-6 ${statusColors[status]} hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center mr-3`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold">{name}</h4>
            <p className="text-sm opacity-75">{description}</p>
          </div>
        </div>
        <StatusIcon className="h-5 w-5" />
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span>Requests hoy:</span>
          <span className="font-medium">{requests.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Tiempo respuesta:</span>
          <span className="font-medium">{avgResponse}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Última sync:</span>
          <span className="font-medium">{lastSync}</span>
        </div>
      </div>
      
      <div className="flex space-x-2 mt-4">
        <button className="flex-1 px-3 py-2 bg-white/50 hover:bg-white/75 rounded-lg transition-colors text-sm font-medium">
          <Settings className="h-3 w-3 inline mr-1" />
          Configurar
        </button>
        <button className="px-3 py-2 bg-white/50 hover:bg-white/75 rounded-lg transition-colors">
          <RefreshCw className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

export default function APIManagement() {
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('realtime');

  // KPIs de API
  const apiKPIs = [
    { title: 'APIs Activas', value: '12', change: 0, trend: 'stable' as const, icon: Zap, color: 'bg-blue-500', status: 'active' as const, period: 'tiempo real' },
    { title: 'Requests/min', value: '1,247', change: 15.3, trend: 'up' as const, icon: Activity, color: 'bg-green-500', status: 'active' as const, period: 'tiempo real' },
    { title: 'Tiempo Respuesta', value: '145ms', change: -8.7, trend: 'up' as const, icon: Clock, color: 'bg-purple-500', status: 'active' as const, period: 'promedio' },
    { title: 'Uptime', value: '99.97%', change: 0.1, trend: 'stable' as const, icon: Shield, color: 'bg-emerald-500', status: 'active' as const, period: 'mensual' },
    { title: 'Errores 4xx', value: '0.3%', change: -25.4, trend: 'up' as const, icon: AlertTriangle, color: 'bg-yellow-500', status: 'warning' as const, period: 'diario' },
    { title: 'Errores 5xx', value: '0.1%', change: -50.0, trend: 'up' as const, icon: AlertTriangle, color: 'bg-red-500', status: 'active' as const, period: 'diario' },
    { title: 'Throughput', value: '2.4K/s', change: 12.8, trend: 'up' as const, icon: TrendingUp, color: 'bg-indigo-500', status: 'active' as const, period: 'tiempo real' },
    { title: 'Latencia P95', value: '234ms', change: -5.2, trend: 'up' as const, icon: BarChart3, color: 'bg-cyan-500', status: 'active' as const, period: 'promedio' }
  ];

  // APIs configuradas
  const configuredAPIs = [
    {
      name: 'Supabase Database',
      icon: Database,
      status: 'connected' as const,
      description: 'Base de datos principal',
      requests: 15678,
      avgResponse: '89ms',
      lastSync: 'hace 1 min',
      color: 'bg-green-600'
    },
    {
      name: 'Sistema de Archivos',
      icon: HardDrive,
      status: 'connected' as const,
      description: 'Almacenamiento local de documentos',
      requests: 234,
      avgResponse: '45ms',
      lastSync: 'hace 2 min',
      color: 'bg-blue-600'
    },
    {
      name: 'Procesamiento Local',
      icon: Cpu,
      status: 'connected' as const,
      description: 'Clasificación de documentos local',
      requests: 456,
      avgResponse: '123ms',
      lastSync: 'hace 1 min',
      color: 'bg-purple-600'
    },
    {
      name: 'Sistema de Autenticación',
      icon: Shield,
      status: 'connected' as const,
      description: 'Gestión de usuarios y sesiones',
      requests: 89,
      avgResponse: '67ms',
      lastSync: 'hace 30 seg',
      color: 'bg-orange-600'
    }
  ];

  // Endpoints críticos
  const criticalEndpoints = [
    {
      name: 'Autenticación',
      method: 'POST',
      endpoint: '/api/auth/login',
      requests: 234,
      avgResponse: '89ms',
      errorRate: '0.5%',
      status: 'healthy' as const,
      icon: Key,
      color: 'bg-green-600'
    },
    {
      name: 'Subir Documentos',
      method: 'POST',
      endpoint: '/api/documents/upload',
      requests: 456,
      avgResponse: '234ms',
      errorRate: '0.2%',
      status: 'healthy' as const,
      icon: Upload,
      color: 'bg-blue-600'
    },
    {
      name: 'Gestión de Clientes',
      method: 'GET',
      endpoint: '/api/clients',
      requests: 156,
      avgResponse: '123ms',
      errorRate: '0.1%',
      status: 'healthy' as const,
      icon: Database,
      color: 'bg-purple-600'
    },
    {
      name: 'Sistema de Métricas',
      method: 'GET',
      endpoint: '/api/metrics',
      requests: 89,
      avgResponse: '67ms',
      errorRate: '0.3%',
      status: 'healthy' as const,
      icon: BarChart3,
      color: 'bg-orange-600'
    }
  ];

  // Crear gráficos simples con CSS
  const createSimpleChart = (data: number[], labels: string[], title: string) => {
    const maxValue = Math.max(...data, 1);
    
    return (
      <div className="space-y-3">
        <h4 className="font-medium text-gray-700 mb-3">{title}</h4>
        {data.map((value, index) => {
          const percentage = (value / maxValue) * 100;
          const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500', 'bg-yellow-500'];
          
          return (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-gray-600 w-20">{labels[index]}</span>
              <div className="flex-1 mx-3">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-300 ${colors[index % colors.length]}`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
              <span className="text-sm font-medium text-gray-900 w-12">{value}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">API Management</h2>
            <p className="text-blue-100 mt-1">Gestión integral de APIs con monitoreo local</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-white/20 text-white border border-white/30 rounded-lg px-3 py-2 text-sm"
            >
              <option value="realtime" className="text-gray-800">Tiempo Real</option>
              <option value="hourly" className="text-gray-800">Por Hora</option>
              <option value="daily" className="text-gray-800">Diario</option>
              <option value="weekly" className="text-gray-800">Semanal</option>
            </select>
            <button 
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </button>
          </div>
        </div>
        
        <div className="mt-4 bg-white/10 rounded-lg p-4">
          <h3 className="font-semibold mb-2">📊 Estado del Sistema:</h3>
          <div className="text-sm text-white/90">
            Sistema funcionando correctamente con todas las APIs locales operativas. 
            Rendimiento óptimo sin dependencias externas.
          </div>
        </div>
      </div>

      {/* KPIs de APIs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Métricas de Rendimiento de APIs</h3>
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">Actualización automática</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {apiKPIs.map((kpi, index) => (
            <APIKPICard key={index} {...kpi} />
          ))}
        </div>
      </div>

      {/* Gráficos Simples */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Monitoreo en Tiempo Real</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            {createSimpleChart(
              [234, 189, 456, 789, 1247, 892],
              ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
              'Requests por Hora'
            )}
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            {createSimpleChart(
              [234, 567, 123, 89, 156],
              ['Supabase', 'Archivos', 'Procesamiento', 'Auth', 'Otros'],
              'Tiempo de Respuesta (ms)'
            )}
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            {createSimpleChart(
              [45, 28, 15, 8, 4],
              ['Auth', 'Upload', 'Clientes', 'Métricas', 'Otros'],
              'Endpoints Más Usados (%)'
            )}
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            {createSimpleChart(
              [0.2, 0.1, 0.3, 0.2, 0.4, 0.1, 0.2],
              ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab', 'Dom'],
              'Tasa de Error Semanal (%)'
            )}
          </div>
        </div>
      </div>

      {/* APIs Configuradas */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">APIs Configuradas</h3>
          <button className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            <Plus className="h-4 w-4 mr-2" />
            Nueva API
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {configuredAPIs.map((api, index) => (
            <APIIntegrationCard key={index} {...api} />
          ))}
        </div>
      </div>

      {/* Endpoints Críticos */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Endpoints Críticos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {criticalEndpoints.map((endpoint, index) => (
            <APIEndpointCard key={index} {...endpoint} />
          ))}
        </div>
      </div>

      {/* Monitoreo de Sistema */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Monitoreo de Sistema en Tiempo Real</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-6 bg-blue-50 rounded-lg border border-blue-200">
            <Cpu className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <h4 className="font-semibold text-blue-800 mb-2">CPU Usage</h4>
            <p className="text-2xl font-bold text-blue-600 mb-1">23%</p>
            <p className="text-sm text-blue-700">Promedio últimas 24h</p>
            <div className="w-full bg-blue-200 rounded-full h-2 mt-3">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '23%' }}></div>
            </div>
          </div>
          
          <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
            <HardDrive className="h-8 w-8 text-green-600 mx-auto mb-3" />
            <h4 className="font-semibold text-green-800 mb-2">Memory Usage</h4>
            <p className="text-2xl font-bold text-green-600 mb-1">67%</p>
            <p className="text-sm text-green-700">8GB de 12GB usados</p>
            <div className="w-full bg-green-200 rounded-full h-2 mt-3">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '67%' }}></div>
            </div>
          </div>
          
          <div className="text-center p-6 bg-purple-50 rounded-lg border border-purple-200">
            <Wifi className="h-8 w-8 text-purple-600 mx-auto mb-3" />
            <h4 className="font-semibold text-purple-800 mb-2">Network I/O</h4>
            <p className="text-2xl font-bold text-purple-600 mb-1">45MB/s</p>
            <p className="text-sm text-purple-700">Tráfico promedio</p>
            <div className="w-full bg-purple-200 rounded-full h-2 mt-3">
              <div className="bg-purple-600 h-2 rounded-full" style={{ width: '45%' }}></div>
            </div>
          </div>
          
          <div className="text-center p-6 bg-orange-50 rounded-lg border border-orange-200">
            <Server className="h-8 w-8 text-orange-600 mx-auto mb-3" />
            <h4 className="font-semibold text-orange-800 mb-2">Load Average</h4>
            <p className="text-2xl font-bold text-orange-600 mb-1">1.2</p>
            <p className="text-sm text-orange-700">Carga del sistema</p>
            <div className="w-full bg-orange-200 rounded-full h-2 mt-3">
              <div className="bg-orange-600 h-2 rounded-full" style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
            <Download className="h-5 w-5 text-green-600 mr-2" />
            <div className="text-left">
              <p className="font-medium text-green-800">Exportar Reporte</p>
              <p className="text-xs text-green-600">Métricas completas</p>
            </div>
          </button>
          
          <button className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
            <Terminal className="h-5 w-5 text-blue-600 mr-2" />
            <div className="text-left">
              <p className="font-medium text-blue-800">Consola API</p>
              <p className="text-xs text-blue-600">Testing local</p>
            </div>
          </button>
          
          <button className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
            <Monitor className="h-5 w-5 text-purple-600 mr-2" />
            <div className="text-left">
              <p className="font-medium text-purple-800">Monitoreo</p>
              <p className="text-xs text-purple-600">Dashboard en vivo</p>
            </div>
          </button>
          
          <button className="flex items-center justify-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
            <Settings className="h-5 w-5 text-orange-600 mr-2" />
            <div className="text-left">
              <p className="font-medium text-orange-800">Configuración</p>
              <p className="text-xs text-orange-600">Parámetros locales</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}