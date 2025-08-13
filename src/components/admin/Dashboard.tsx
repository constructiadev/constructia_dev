import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  Calendar,
  Download,
  Brain,
  Zap,
  Target,
  Globe,
  Shield,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Minus,
  Star,
  Award,
  Lightbulb,
  Building2,
  CreditCard,
  Database,
  Cpu,
  HardDrive,
  Wifi
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
  status: 'excellent' | 'good' | 'warning' | 'critical';
}

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kpis, setKpis] = useState<ExecutiveKPI[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [executiveSummary, setExecutiveSummary] = useState<string>('');
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
          id: 'total-clients',
          title: 'Clientes',
          value: dynamicKPIs.totalClients,
          change: 23.5,
          trend: 'up',
          icon: Users,
          color: 'bg-blue-500',
          description: 'Total de clientes registrados',
          status: 'excellent'
        },
        {
          id: 'monthly-revenue',
          title: 'Ingresos Mensuales',
          value: `€${dynamicKPIs.totalRevenue.toFixed(0)}`,
          change: 18.2,
          trend: 'up',
          icon: DollarSign,
          color: 'bg-green-500',
          description: 'Ingresos del mes actual',
          status: 'excellent'
        },
        {
          id: 'documents-processed',
          title: 'Documentos Procesados',
          value: dynamicKPIs.documentsThisMonth,
          change: 15.7,
          trend: 'up',
          icon: FileText,
          color: 'bg-green-500',
          description: 'Documentos procesados este mes',
          status: 'good'
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
          status: 'excellent'
        },
        {
          id: 'processing-speed',
          title: 'Velocidad Procesamiento',
          value: '99.97%',
          change: -8.3,
          trend: 'up',
          icon: Zap,
          color: 'bg-blue-500',
          description: 'Eficiencia del sistema',
          status: 'excellent'
        },
        {
          id: 'active-projects',
          title: 'Proyectos Activos',
          value: '12',
          change: 12.8,
          trend: 'up',
          icon: Building2,
          color: 'bg-cyan-500',
          description: 'Proyectos en desarrollo',
          status: 'good'
        },
        {
          id: 'system-uptime',
          title: 'Uptime Sistema',
          value: '2.4%',
          change: 0.1,
          trend: 'stable',
          icon: Shield,
          color: 'bg-gray-500',
          description: 'Disponibilidad del sistema',
          status: 'excellent'
        },
        {
          id: 'api-performance',
          title: 'Performance API',
          value: '2.4%',
          change: -5.2,
          trend: 'up',
          icon: Activity,
          color: 'bg-gray-500',
          description: 'Rendimiento de APIs',
          status: 'good'
        }
      ];

      setKpis(executiveKPIs);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard ejecutivo...</p>
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
      {/* Header Verde Ejecutivo */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Dashboard Ejecutivo</h1>
            <p className="text-green-100 mb-4">
              Panel integral de control y monitoreo de ConstructIA
            </p>
            <div className="space-y-1 text-sm text-green-100">
              <p>• Análisis en tiempo real con IA integrada</p>
              <p>• Métricas de rendimiento y crecimiento</p>
              <p>• Monitoreo de sistemas y procesos</p>
              <p>• Insights inteligentes para toma de decisiones</p>
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
              <Download className="w-4 w-4 mr-2" />
              Exportar
            </button>
          </div>
        </div>
      </div>

      {/* KPIs Grid - 8 tarjetas como en la imagen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Sección de Insights con IA - 4 tarjetas como en la imagen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center mb-3">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <h3 className="font-semibold text-green-800">Estado del Sistema</h3>
          </div>
          <p className="text-sm text-green-700">
            Todos los sistemas operando correctamente. Base de datos, APIs y servicios de IA funcionando sin interrupciones.
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-center mb-3">
            <Clock className="w-5 h-5 text-yellow-600 mr-2" />
            <h3 className="font-semibold text-yellow-800">Optimización IA</h3>
          </div>
          <p className="text-sm text-yellow-700">
            Precisión de clasificación en 94.2%. Recomendamos ajustar parámetros para alcanzar el objetivo del 97%.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center mb-3">
            <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="font-semibold text-blue-800">Crecimiento</h3>
          </div>
          <p className="text-sm text-blue-700">
            Crecimiento sostenido del 23% en nuevos clientes. Tendencia positiva para alcanzar 150 clientes activos.
          </p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
          <div className="flex items-center mb-3">
            <Brain className="w-5 h-5 text-purple-600 mr-2" />
            <h3 className="font-semibold text-purple-800">Integraciones</h3>
          </div>
          <p className="text-sm text-purple-700">
            12 integraciones activas funcionando correctamente. Todas las APIs externas responden dentro de los parámetros normales.
          </p>
        </div>
      </div>

      {/* Gráficos - 3 secciones como en la imagen */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Evolución de Ingresos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Evolución de Ingresos</h3>
          <div className="space-y-4">
            {[
              { month: 'Ene', value: 12450, color: 'bg-green-400' },
              { month: 'Feb', value: 14200, color: 'bg-green-500' },
              { month: 'Mar', value: 16800, color: 'bg-green-600' },
              { month: 'Abr', value: 15200, color: 'bg-green-500' },
              { month: 'May', value: 18900, color: 'bg-green-700' },
              { month: 'Jun', value: 21300, color: 'bg-green-800' }
            ].map((item, index) => {
              const maxValue = 21300;
              const percentage = (item.value / maxValue) * 100;
              
              return (
                <div key={index} className="flex items-center">
                  <span className="text-sm text-gray-600 w-8">{item.month}</span>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-200 rounded-full h-6">
                      <div 
                        className={`h-6 rounded-full transition-all duration-500 ${item.color}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-16 text-right">
                    €{(item.value / 1000).toFixed(1)}K
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Nuevos Clientes - Gráfico de barras */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Nuevos Clientes</h3>
          <div className="flex items-end justify-between h-48 space-x-2">
            {[
              { value: 45, color: 'bg-blue-400' },
              { value: 62, color: 'bg-blue-500' },
              { value: 78, color: 'bg-blue-600' },
              { value: 55, color: 'bg-blue-500' },
              { value: 89, color: 'bg-blue-700' },
              { value: 92, color: 'bg-blue-800' },
              { value: 105, color: 'bg-blue-900' }
            ].map((bar, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className={`w-full ${bar.color} rounded-t transition-all duration-500`}
                  style={{ height: `${(bar.value / 105) * 100}%` }}
                ></div>
                <span className="text-xs text-gray-500 mt-2">{bar.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Distribución de Planes - Gráfico circular */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Distribución de Planes</h3>
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-32 h-32">
              {/* Simulación de gráfico circular con CSS */}
              <div className="absolute inset-0 rounded-full" style={{
                background: `conic-gradient(
                  #10b981 0deg 144deg,
                  #3b82f6 144deg 252deg,
                  #8b5cf6 252deg 324deg,
                  #f59e0b 324deg 360deg
                )`
              }}></div>
              <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
                <span className="text-lg font-bold text-gray-900">{kpis[0]?.value || 0}</span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Enterprise</span>
              </div>
              <span className="text-sm font-medium">40%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Professional</span>
              </div>
              <span className="text-sm font-medium">30%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Basic</span>
              </div>
              <span className="text-sm font-medium">20%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Custom</span>
              </div>
              <span className="text-sm font-medium">10%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actividad Reciente del Sistema - Lista como en la imagen */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Actividad Reciente del Sistema</h2>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                <div>
                  <p className="font-medium text-green-800">Sistema Operativo al 100%</p>
                  <p className="text-sm text-green-700">Todas las integraciones funcionando correctamente</p>
                </div>
              </div>
              <span className="text-xs text-green-600">hace 2 min</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <Users className="w-5 h-5 text-blue-600 mr-3" />
                <div>
                  <p className="font-medium text-blue-800">Nuevo cliente registrado</p>
                  <p className="text-sm text-blue-700">Construcciones Martínez S.L. - Plan Professional</p>
                </div>
              </div>
              <span className="text-xs text-blue-600">hace 15 min</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center">
                <Brain className="w-5 h-5 text-purple-600 mr-3" />
                <div>
                  <p className="font-medium text-purple-800">IA procesó 45 documentos</p>
                  <p className="text-sm text-purple-700">Precisión promedio del 96.2% en clasificación</p>
                </div>
              </div>
              <span className="text-xs text-purple-600">hace 1 hora</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-yellow-600 mr-3" />
                <div>
                  <p className="font-medium text-yellow-800">Backup automático completado</p>
                  <p className="text-sm text-yellow-700">Base de datos respaldada exitosamente - 2.4GB</p>
                </div>
              </div>
              <span className="text-xs text-yellow-600">hace 3 horas</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center">
                <DollarSign className="w-5 h-5 text-orange-600 mr-3" />
                <div>
                  <p className="font-medium text-orange-800">Pago procesado exitosamente</p>
                  <p className="text-sm text-orange-700">€149.00 - Suscripción Professional renovada</p>
                </div>
              </div>
              <span className="text-xs text-orange-600">hace 6 horas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones Rápidas - 4 botones como en la imagen */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center justify-center p-6 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors border border-blue-200">
            <div className="bg-blue-600 p-3 rounded-full mb-3">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-semibold text-blue-800 mb-1">Gestión de Clientes</h4>
            <p className="text-xs text-blue-600 text-center">Administrar usuarios y suscripciones</p>
          </button>
          
          <button className="flex flex-col items-center justify-center p-6 bg-green-50 hover:bg-green-100 rounded-xl transition-colors border border-green-200">
            <div className="bg-green-600 p-3 rounded-full mb-3">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-semibold text-green-800 mb-1">Reportes Financieros</h4>
            <p className="text-xs text-green-600 text-center">Análisis de ingresos y métricas</p>
          </button>
          
          <button className="flex flex-col items-center justify-center p-6 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors border border-purple-200">
            <div className="bg-purple-600 p-3 rounded-full mb-3">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-semibold text-purple-800 mb-1">IA & Análisis</h4>
            <p className="text-xs text-purple-600 text-center">Inteligencia artificial y insights</p>
          </button>
          
          <button className="flex flex-col items-center justify-center p-6 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors border border-orange-200">
            <div className="bg-orange-600 p-3 rounded-full mb-3">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-semibold text-orange-800 mb-1">Integraciones</h4>
            <p className="text-xs text-orange-600 text-center">Conectar plataformas externas</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;