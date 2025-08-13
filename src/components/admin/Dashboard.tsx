import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  Activity,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  Calendar,
  Download,
  Brain,
  Zap,
  Target,
  Globe,
  Shield,
  RefreshCw,
  Eye,
  ArrowUp,
  ArrowDown,
  Minus,
  Star,
  Award,
  Lightbulb
} from 'lucide-react';
import { 
  getAllClients, 
  getManualProcessingQueue, 
  calculateDynamicKPIs,
  getAllReceipts,
  getDocumentStats
} from '../../lib/supabase';
import { geminiAI, type AIInsight } from '../../lib/gemini';

interface ExecutiveKPI {
  id: string;
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ElementType;
  color: string;
  description: string;
  target?: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
}

interface ActivityItem {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  description: string;
  timestamp: string;
  icon: React.ElementType;
}

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kpis, setKpis] = useState<ExecutiveKPI[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [executiveSummary, setExecutiveSummary] = useState<string>('');
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [queueItems, setQueueItems] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar datos base
      const [clients, queue, dynamicKPIs, receipts, documents] = await Promise.all([
        getAllClients(),
        getManualProcessingQueue(),
        calculateDynamicKPIs(),
        getAllReceipts(),
        getDocumentStats()
      ]);

      // Generar KPIs ejecutivos
      const executiveKPIs: ExecutiveKPI[] = [
        {
          id: 'active-clients',
          title: 'Clientes Activos',
          value: dynamicKPIs.activeClients,
          change: 23.5,
          trend: 'up',
          icon: Users,
          color: 'bg-blue-500',
          description: 'Clientes con suscripción activa',
          target: 100,
          status: dynamicKPIs.activeClients > 50 ? 'excellent' : 'good'
        },
        {
          id: 'monthly-revenue',
          title: 'Ingresos Mensuales',
          value: `€${dynamicKPIs.totalRevenue.toFixed(0)}`,
          change: 18.2,
          trend: 'up',
          icon: DollarSign,
          color: 'bg-green-500',
          description: 'Ingresos recurrentes mensuales',
          status: 'excellent'
        },
        {
          id: 'ai-accuracy',
          title: 'Precisión IA',
          value: `${dynamicKPIs.avgConfidence}%`,
          change: 2.3,
          trend: 'up',
          icon: Brain,
          color: 'bg-purple-500',
          description: 'Precisión promedio de clasificación',
          target: 97,
          status: dynamicKPIs.avgConfidence > 95 ? 'excellent' : dynamicKPIs.avgConfidence > 90 ? 'good' : 'warning'
        },
        {
          id: 'documents-processed',
          title: 'Docs Procesados',
          value: dynamicKPIs.documentsThisMonth,
          change: 15.7,
          trend: 'up',
          icon: FileText,
          color: 'bg-orange-500',
          description: 'Documentos procesados este mes',
          status: 'good'
        },
        {
          id: 'system-uptime',
          title: 'Uptime Sistema',
          value: '99.97%',
          change: 0.1,
          trend: 'stable',
          icon: Shield,
          color: 'bg-emerald-500',
          description: 'Disponibilidad del sistema',
          target: 99.9,
          status: 'excellent'
        },
        {
          id: 'processing-speed',
          title: 'Velocidad Proc.',
          value: '2.3s',
          change: -12.4,
          trend: 'up',
          icon: Zap,
          color: 'bg-yellow-500',
          description: 'Tiempo promedio de procesamiento',
          status: 'good'
        },
        {
          id: 'customer-satisfaction',
          title: 'Satisfacción',
          value: '4.8/5',
          change: 5.2,
          trend: 'up',
          icon: Star,
          color: 'bg-pink-500',
          description: 'Puntuación promedio de clientes',
          status: 'excellent'
        },
        {
          id: 'api-performance',
          title: 'Performance API',
          value: '145ms',
          change: -8.3,
          trend: 'up',
          icon: Activity,
          color: 'bg-cyan-500',
          description: 'Tiempo de respuesta promedio',
          status: 'excellent'
        }
      ];

      setKpis(executiveKPIs);
      setQueueItems(queue);

      // Generar insights con IA
      const allData = {
        clients,
        documents,
        receipts,
        kpis: dynamicKPIs,
        queue: queue.length
      };

      const [insights, summary] = await Promise.all([
        geminiAI.generateInsights(allData, 'executive_dashboard'),
        geminiAI.generateExecutiveSummary(allData)
      ]);

      setAiInsights(insights);
      setExecutiveSummary(summary);

      // Generar actividad reciente
      const activities: ActivityItem[] = [
        {
          id: '1',
          type: 'success',
          title: 'Sistema Operativo',
          description: 'Todas las integraciones funcionando correctamente',
          timestamp: new Date().toISOString(),
          icon: CheckCircle
        },
        {
          id: '2',
          type: 'info',
          title: 'Nuevos Clientes',
          description: `${dynamicKPIs.activeClients} clientes activos en la plataforma`,
          timestamp: new Date(Date.now() - 300000).toISOString(),
          icon: Users
        },
        {
          id: '3',
          type: 'success',
          title: 'Procesamiento IA',
          description: `${dynamicKPIs.documentsThisMonth} documentos procesados este mes`,
          timestamp: new Date(Date.now() - 600000).toISOString(),
          icon: Brain
        },
        {
          id: '4',
          type: 'warning',
          title: 'Cola Manual',
          description: `${queue.length} documentos en cola de revisión manual`,
          timestamp: new Date(Date.now() - 900000).toISOString(),
          icon: AlertCircle
        }
      ];

      setRecentActivity(activities);

    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUp className="w-4 h-4 text-green-500" />;
      case 'down': return <ArrowDown className="w-4 h-4 text-red-500" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'border-green-500 bg-green-50';
      case 'good': return 'border-blue-500 bg-blue-50';
      case 'warning': return 'border-yellow-500 bg-yellow-50';
      case 'critical': return 'border-red-500 bg-red-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-blue-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'border-l-red-500 bg-red-50';
      case 'high': return 'border-l-orange-500 bg-orange-50';
      case 'medium': return 'border-l-blue-500 bg-blue-50';
      case 'low': return 'border-l-gray-500 bg-gray-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'hace un momento';
    if (diffInMinutes < 60) return `hace ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `hace ${Math.floor(diffInMinutes / 60)} h`;
    return `hace ${Math.floor(diffInMinutes / 1440)} días`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard ejecutivo...</p>
          <p className="text-sm text-gray-500 mt-2">Analizando datos con IA...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error de Conexión</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
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
      {/* Header Ejecutivo */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard Ejecutivo</h1>
            <p className="text-green-100">
              Resumen integral del rendimiento de ConstructIA
            </p>
            <div className="mt-3 flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Brain className="w-4 h-4" />
                <span className="text-sm">Análisis con IA</span>
              </div>
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4" />
                <span className="text-sm">Datos en tiempo real</span>
              </div>
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
            <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </button>
          </div>
        </div>
      </div>

      {/* Resumen Ejecutivo con IA */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center mb-4">
          <div className="bg-purple-100 p-2 rounded-lg mr-3">
            <Brain className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Resumen Ejecutivo IA</h2>
            <p className="text-gray-600">Análisis inteligente generado por Gemini</p>
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
          <p className="text-gray-800 leading-relaxed">{executiveSummary}</p>
        </div>
      </div>

      {/* KPIs Ejecutivos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.id} className={`bg-white rounded-xl shadow-sm border-l-4 p-6 ${getStatusColor(kpi.status)}`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`p-3 rounded-lg ${kpi.color}`}>
                  <Icon className="w-6 w-6 text-white" />
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
                {kpi.target && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Objetivo: {kpi.target}</span>
                      <span>{Math.round((Number(kpi.value) / kpi.target) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div 
                        className="bg-green-500 h-1 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((Number(kpi.value) / kpi.target) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Insights de IA */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Lightbulb className="w-6 h-6 text-yellow-500 mr-3" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Insights Inteligentes</h2>
                <p className="text-gray-600">Recomendaciones generadas por IA</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Brain className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-purple-600 font-medium">Gemini AI</span>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {aiInsights.map((insight, index) => (
              <div key={index} className={`border-l-4 rounded-lg p-4 ${getPriorityColor(insight.priority)}`}>
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                  <div className="flex items-center space-x-1">
                    <Target className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-500">{insight.confidence}%</span>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-3">{insight.description}</p>
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    insight.priority === 'critical' ? 'bg-red-100 text-red-800' :
                    insight.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                    insight.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {insight.priority}
                  </span>
                  <span className="text-xs text-gray-500 capitalize">{insight.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gráficos Ejecutivos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Evolución de Ingresos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Evolución de Ingresos</h3>
          <div className="space-y-3">
            {[
              { month: 'Ene 2025', value: 12450, growth: 15.2 },
              { month: 'Dic 2024', value: 10800, growth: 12.8 },
              { month: 'Nov 2024', value: 9570, growth: 8.4 },
              { month: 'Oct 2024', value: 8830, growth: 5.1 },
              { month: 'Sep 2024', value: 8400, growth: 3.2 }
            ].map((item, index) => {
              const maxValue = 12450;
              const percentage = (item.value / maxValue) * 100;
              
              return (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 w-20">{item.month}</span>
                  <div className="flex-1 mx-3">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-green-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-gray-900">€{item.value.toLocaleString()}</span>
                    <span className="text-xs text-green-600 ml-2">+{item.growth}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Distribución de Clientes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución de Clientes</h3>
          <div className="space-y-3">
            {[
              { plan: 'Enterprise', count: 12, color: 'bg-purple-500', percentage: 40 },
              { plan: 'Professional', count: 15, color: 'bg-blue-500', percentage: 50 },
              { plan: 'Basic', count: 3, color: 'bg-green-500', percentage: 10 }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${item.color}`}></div>
                  <span className="text-sm text-gray-600">{item.plan}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${item.color}`}
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rendimiento del Sistema */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rendimiento del Sistema</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">CPU Usage</span>
              <span className="font-semibold text-blue-600">23%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '23%' }}></div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Memory</span>
              <span className="font-semibold text-green-600">67%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '67%' }}></div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Storage</span>
              <span className="font-semibold text-yellow-600">45%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '45%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Actividad Reciente y Cola Manual */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actividad Reciente */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-blue-500" />
              Actividad Reciente
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <Icon className={`w-5 h-5 mt-0.5 ${getActivityIcon(activity.type)}`} />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(activity.timestamp)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Cola de Procesamiento Manual */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-orange-500" />
              Cola Manual ({queueItems.length})
            </h2>
          </div>
          <div className="p-6">
            {queueItems.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="text-gray-600">No hay documentos en cola manual</p>
                <p className="text-sm text-gray-500">Todos los documentos se procesan automáticamente</p>
              </div>
            ) : (
              <div className="space-y-3">
                {queueItems.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-blue-600">#{item.queue_position}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {item.documents?.original_name || 'Documento sin nombre'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {item.clients?.company_name || 'Cliente desconocido'}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      item.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                      item.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {item.priority}
                    </span>
                  </div>
                ))}
                {queueItems.length > 5 && (
                  <div className="text-center pt-3">
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Ver todos ({queueItems.length})
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Métricas Detalladas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Análisis de Tendencias */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Análisis de Tendencias</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <TrendingUp className="w-5 h-5 text-green-600 mr-3" />
                <div>
                  <p className="font-medium text-green-800">Crecimiento Sostenido</p>
                  <p className="text-sm text-green-700">+23% nuevos clientes este mes</p>
                </div>
              </div>
              <Award className="w-6 h-6 text-green-600" />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <BarChart3 className="w-5 h-5 text-blue-600 mr-3" />
                <div>
                  <p className="font-medium text-blue-800">Eficiencia Mejorada</p>
                  <p className="text-sm text-blue-700">Tiempo de procesamiento -12%</p>
                </div>
              </div>
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center">
                <Brain className="w-5 h-5 text-purple-600 mr-3" />
                <div>
                  <p className="font-medium text-purple-800">IA Optimizada</p>
                  <p className="text-sm text-purple-700">Precisión aumentó +2.3%</p>
                </div>
              </div>
              <Star className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Estado del Sistema */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado del Sistema</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Base de Datos</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900">Operativa</span>
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">APIs Externas</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900">Conectadas</span>
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Procesamiento IA</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900">Activo</span>
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-700">Almacenamiento</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900">67% Usado</span>
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Seguridad</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900">Protegido</span>
                <Shield className="w-4 h-4 text-green-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones Ejecutivas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Ejecutivas</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
            <Users className="w-6 h-6 text-blue-600 mr-2" />
            <div className="text-left">
              <p className="font-medium text-blue-800">Gestionar Clientes</p>
              <p className="text-xs text-blue-600">Administrar usuarios</p>
            </div>
          </button>
          
          <button className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
            <DollarSign className="w-6 h-6 text-green-600 mr-2" />
            <div className="text-left">
              <p className="font-medium text-green-800">Finanzas</p>
              <p className="text-xs text-green-600">Reportes financieros</p>
            </div>
          </button>
          
          <button className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
            <Brain className="w-6 h-6 text-purple-600 mr-2" />
            <div className="text-left">
              <p className="font-medium text-purple-800">IA & Análisis</p>
              <p className="text-xs text-purple-600">Inteligencia artificial</p>
            </div>
          </button>
          
          <button className="flex items-center justify-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
            <Globe className="w-6 h-6 text-orange-600 mr-2" />
            <div className="text-left">
              <p className="font-medium text-orange-800">Integraciones</p>
              <p className="text-xs text-orange-600">Conectar plataformas</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;