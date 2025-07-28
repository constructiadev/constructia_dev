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
  Plus
} from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { callGeminiAI } from '../../lib/supabase';

interface APIKPICardProps {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ElementType;
  color: string;
  status?: 'active' | 'warning' | 'error';
}

function APIKPICard({ title, value, change, trend, icon: Icon, color, status = 'active' }: APIKPICardProps) {
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600';
  const trendSymbol = trend === 'up' ? '+' : trend === 'down' ? '-' : '';
  
  const statusColors = {
    active: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
          {status}
        </span>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        <p className={`text-sm font-medium mt-1 ${trendColor}`}>
          {trendSymbol}{Math.abs(change)}% vs mes anterior
        </p>
      </div>
    </div>
  );
}

export default function APIManagement() {
  const [aiInsights, setAiInsights] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [selectedAPI, setSelectedAPI] = useState('');

  // KPIs de API
  const apiKPIs = [
    { title: 'APIs Activas', value: '12', change: 0, trend: 'stable' as const, icon: Zap, color: 'bg-blue-500', status: 'active' as const },
    { title: 'Requests/min', value: '1,247', change: 15.3, trend: 'up' as const, icon: Activity, color: 'bg-green-500', status: 'active' as const },
    { title: 'Tiempo Respuesta', value: '145ms', change: -8.7, trend: 'up' as const, icon: Clock, color: 'bg-purple-500', status: 'active' as const },
    { title: 'Uptime', value: '99.97%', change: 0.1, trend: 'stable' as const, icon: Shield, color: 'bg-emerald-500', status: 'active' as const },
    { title: 'Errores 4xx', value: '0.3%', change: -25.4, trend: 'up' as const, icon: AlertTriangle, color: 'bg-yellow-500', status: 'warning' as const },
    { title: 'Errores 5xx', value: '0.1%', change: -50.0, trend: 'up' as const, icon: AlertTriangle, color: 'bg-red-500', status: 'active' as const }
  ];

  // APIs configuradas
  const configuredAPIs = [
    {
      id: 'gemini',
      name: 'Gemini AI',
      status: 'active',
      endpoint: 'https://generativelanguage.googleapis.com/v1beta',
      requests: 1247,
      avgResponse: '234ms',
      lastUsed: '2025-01-27 15:30',
      description: 'Clasificación y análisis de documentos'
    },
    {
      id: 'obralia',
      name: 'Obralia/Nalanda',
      status: 'warning',
      endpoint: 'https://api.obralia.com/v2',
      requests: 89,
      avgResponse: '567ms',
      lastUsed: '2025-01-27 14:15',
      description: 'Subida automática de documentos'
    },
    {
      id: 'stripe',
      name: 'Stripe Payments',
      status: 'active',
      endpoint: 'https://api.stripe.com/v1',
      requests: 156,
      avgResponse: '123ms',
      lastUsed: '2025-01-27 15:45',
      description: 'Procesamiento de pagos'
    },
    {
      id: 'supabase',
      name: 'Supabase Database',
      status: 'active',
      endpoint: 'https://constructia.supabase.co',
      requests: 2341,
      avgResponse: '89ms',
      lastUsed: '2025-01-27 15:47',
      description: 'Base de datos principal'
    }
  ];

  // Datos para gráficos
  const requestsData = {
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
    datasets: [{
      label: 'Requests por Hora',
      data: [234, 189, 456, 789, 1247, 892],
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  const responseTimeData = {
    labels: ['Gemini AI', 'Obralia', 'Stripe', 'Supabase', 'Otros'],
    datasets: [{
      label: 'Tiempo de Respuesta (ms)',
      data: [234, 567, 123, 89, 156],
      backgroundColor: [
        'rgba(168, 85, 247, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(156, 163, 175, 0.8)'
      ],
      borderWidth: 0
    }]
  };

  const endpointUsageData = {
    labels: ['Clasificar Docs', 'Subir Obralia', 'Procesar Pago', 'Auth Usuario', 'Otros'],
    datasets: [{
      data: [45, 28, 15, 8, 4],
      backgroundColor: [
        'rgba(168, 85, 247, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(156, 163, 175, 0.8)'
      ],
      borderWidth: 0
    }]
  };

  const generateAPIInsights = async () => {
    setLoading(true);
    try {
      const prompt = `Como arquitecto de APIs de ConstructIA, analiza estos datos:
      - 12 APIs activas
      - 1,247 requests/min promedio
      - Tiempo respuesta: 145ms promedio
      - Uptime: 99.97%
      - Errores 4xx: 0.3%, Errores 5xx: 0.1%
      - APIs principales: Gemini AI (234ms), Obralia (567ms), Stripe (123ms), Supabase (89ms)
      
      Genera 3 recomendaciones técnicas para optimización de APIs y rendimiento (máximo 150 palabras).`;
      
      const insights = await callGeminiAI(prompt);
      setAiInsights(insights);
    } catch (error) {
      setAiInsights('Error al generar insights de APIs. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <CheckCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  useEffect(() => {
    generateAPIInsights();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header con IA */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">API Management</h2>
            <p className="text-blue-100 mt-1">Gestión integral de APIs con monitoreo BI</p>
          </div>
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8" />
            <button 
              onClick={generateAPIInsights}
              disabled={loading}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Analizando...' : 'Actualizar IA'}
            </button>
          </div>
        </div>
        
        {aiInsights && (
          <div className="mt-4 bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold mb-2">⚡ Insights de APIs IA:</h3>
            <p className="text-sm text-white/90">{aiInsights}</p>
          </div>
        )}
      </div>

      {/* KPIs de APIs */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Métricas de Rendimiento de APIs</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          {apiKPIs.map((kpi, index) => (
            <APIKPICard key={index} {...kpi} />
          ))}
        </div>
      </div>

      {/* Gráficos de Monitoreo */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Monitoreo en Tiempo Real</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Requests por Hora</h4>
            <Line data={requestsData} options={{ responsive: true, maintainAspectRatio: false }} height={200} />
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Tiempo de Respuesta</h4>
            <Bar data={responseTimeData} options={{ responsive: true, maintainAspectRatio: false }} height={200} />
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Endpoints Más Usados</h4>
            <Doughnut data={endpointUsageData} options={{ responsive: true, maintainAspectRatio: false }} height={200} />
          </div>
        </div>
      </div>

      {/* APIs Configuradas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">APIs Configuradas</h3>
          <button className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            <Plus className="h-4 w-4 mr-2" />
            Nueva API
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {configuredAPIs.map((api) => (
            <div key={api.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <Globe className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{api.name}</h4>
                    <p className="text-sm text-gray-500">{api.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(api.status)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(api.status)}`}>
                    {api.status}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Endpoint:</span>
                  <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                    {api.endpoint.length > 30 ? `${api.endpoint.substring(0, 30)}...` : api.endpoint}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <p className="text-lg font-bold text-blue-600">{api.requests}</p>
                    <p className="text-xs text-blue-800">Requests</p>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded">
                    <p className="text-lg font-bold text-green-600">{api.avgResponse}</p>
                    <p className="text-xs text-green-800">Avg Response</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Último uso: {api.lastUsed}</span>
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-800">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="text-green-600 hover:text-green-800">
                      <Settings className="h-4 w-4" />
                    </button>
                    <button className="text-purple-600 hover:text-purple-800">
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vigilancia de Endpoints */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Vigilancia de Endpoints Críticos</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Endpoint</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Método</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requests/h</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Response</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Error Rate</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">/api/documents/classify</td>
                <td className="px-4 py-3 text-sm text-gray-500">POST</td>
                <td className="px-4 py-3 text-sm text-gray-900">456</td>
                <td className="px-4 py-3 text-sm text-gray-900">234ms</td>
                <td className="px-4 py-3 text-sm text-gray-900">0.2%</td>
                <td className="px-4 py-3">
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Saludable</span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">/api/obralia/upload</td>
                <td className="px-4 py-3 text-sm text-gray-500">POST</td>
                <td className="px-4 py-3 text-sm text-gray-900">89</td>
                <td className="px-4 py-3 text-sm text-gray-900">567ms</td>
                <td className="px-4 py-3 text-sm text-gray-900">1.2%</td>
                <td className="px-4 py-3">
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Lento</span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">/api/payments/process</td>
                <td className="px-4 py-3 text-sm text-gray-500">POST</td>
                <td className="px-4 py-3 text-sm text-gray-900">156</td>
                <td className="px-4 py-3 text-sm text-gray-900">123ms</td>
                <td className="px-4 py-3 text-sm text-gray-900">0.1%</td>
                <td className="px-4 py-3">
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Óptimo</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Configuración Avanzada */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Configuración de Alertas</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-800">Tiempo de respuesta > 500ms</p>
                <p className="text-sm text-gray-600">Alerta por email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-800">Error rate > 1%</p>
                <p className="text-sm text-gray-600">Alerta crítica</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Rate Limiting</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Requests por minuto</label>
              <input
                type="number"
                defaultValue="1000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Burst limit</label>
              <input
                type="number"
                defaultValue="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
              Aplicar Configuración
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}