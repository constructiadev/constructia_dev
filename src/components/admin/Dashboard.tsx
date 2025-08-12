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
  PieChart,
  Calendar,
  Download
} from 'lucide-react';
// import { useAuth } from '../../context/AuthContext'; // Temporalmente desactivado
import {
  getAllClients,
  getKPIs,
  calculateDynamicKPIs,
  getRevenueStats,
  getDocumentStats,
  getManualProcessingQueue
} from '../../lib/supabase';

interface KPI {
  id: string;
  name: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  period: string;
  category: string;
  description: string;
}

interface QueueItem {
  id: string;
  document_id: string;
  queue_position: number;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  manual_status: string;
  created_at: string;
  documents?: {
    filename: string;
    original_name: string;
  };
  clients?: {
    company_name: string;
  };
}

const AdminDashboard: React.FC = () => {
  // const { user } = useAuth(); // Temporalmente desactivado
  const user = { id: 'admin-demo', email: 'admin@constructia.com' }; // Usuario demo para desarrollo
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [dynamicKpis, setDynamicKpis] = useState<any>({});
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);

  useEffect(() => {
    console.log('🔍 [AdminDashboard] Component mounted, loading data...');
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    console.log('🔍 [AdminDashboard] Starting loadDashboardData...');
    try {
      setLoading(true);
      setError(null);

      const [
        kpisData,
        dynamicKpisData,
        queueData,
        revenueStatsData
      ] = await Promise.all([
        getKPIs(),
        calculateDynamicKPIs(),
        getManualProcessingQueue(),
        getRevenueStats()
      ]);

      console.log('✅ [AdminDashboard] Data loaded successfully:', {
        kpis: kpisData?.length || 0,
        dynamicKpis: dynamicKpisData,
        queue: queueData?.length || 0,
        revenue: revenueStatsData?.length || 0
      });
      setKpis(kpisData);
      setDynamicKpis(dynamicKpisData);
      setQueueItems(queueData);
      setRevenueData(revenueStatsData);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      // En desarrollo, usar datos de demostración en lugar de mostrar error
      console.log('⚠️ [AdminDashboard] Using demo data due to error:', err);
      setKpis([]);
      setDynamicKpis({
        activeClients: 15,
        totalDocuments: 1247,
        totalRevenue: 12450.50,
        avgConfidence: 94.2,
        documentsThisMonth: 156,
        totalClients: 18
      });
      setQueueItems([]);
      setRevenueData([]);
    } finally {
      console.log('🔍 [AdminDashboard] Setting loading to false');
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'normal':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error al cargar el dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
          <p className="text-gray-600 mt-2">
            Bienvenido, {user?.email}. Aquí tienes un resumen del estado del sistema.
          </p>
        </div>

        {/* KPIs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Clientes Activos</p>
                <p className="text-2xl font-bold text-gray-900">{dynamicKpis.activeClients || 0}</p>
              </div>
              <Users className="w-8 h-8 text-indigo-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Documentos Procesados</p>
                <p className="text-2xl font-bold text-gray-900">{dynamicKpis.totalDocuments || 0}</p>
              </div>
              <FileText className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
                <p className="text-2xl font-bold text-gray-900">€{dynamicKpis.totalRevenue?.toFixed(2) || '0.00'}</p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Confianza IA Promedio</p>
                <p className="text-2xl font-bold text-gray-900">{dynamicKpis.avgConfidence || 0}%</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* KPIs from Database */}
        {kpis.length > 0 && (
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">KPIs del Sistema</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {kpis.map((kpi) => (
                  <div key={kpi.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{kpi.name}</h3>
                      {getTrendIcon(kpi.trend)}
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">{kpi.value}</p>
                    <p className="text-sm text-gray-600">{kpi.description}</p>
                    {kpi.change !== 0 && (
                      <p className={`text-sm mt-1 ${kpi.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {kpi.change > 0 ? '+' : ''}{kpi.change}% vs período anterior
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Manual Processing Queue */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Cola de Procesamiento Manual</h2>
            <p className="text-sm text-gray-600">Documentos pendientes de revisión manual</p>
          </div>
          <div className="p-6">
            {queueItems.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="text-gray-600">No hay documentos en la cola de procesamiento manual</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Posición
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Documento
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Prioridad
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {queueItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{item.queue_position}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.documents?.original_name || 'Documento sin nombre'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.clients?.company_name || 'Cliente desconocido'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(item.priority)}`}>
                            {item.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getStatusIcon(item.manual_status)}
                            <span className="ml-2 text-sm text-gray-900">{item.manual_status}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(item.created_at).toLocaleDateString('es-ES')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Actividad Reciente</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <p className="text-sm text-gray-600">
                    Sistema iniciado correctamente
                  </p>
                  <span className="text-xs text-gray-400">hace 2 min</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <p className="text-sm text-gray-600">
                    {dynamicKpis.documentsThisMonth || 0} documentos procesados este mes
                  </p>
                  <span className="text-xs text-gray-400">hace 5 min</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <p className="text-sm text-gray-600">
                    {queueItems.length} documentos en cola manual
                  </p>
                  <span className="text-xs text-gray-400">hace 10 min</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Acciones Rápidas</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <Users className="w-6 h-6 text-indigo-600 mr-2" />
                  <span className="text-sm font-medium">Gestionar Clientes</span>
                </button>
                <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <FileText className="w-6 h-6 text-green-600 mr-2" />
                  <span className="text-sm font-medium">Revisar Documentos</span>
                </button>
                <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <DollarSign className="w-6 h-6 text-yellow-600 mr-2" />
                  <span className="text-sm font-medium">Ver Finanzas</span>
                </button>
                <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <BarChart3 className="w-6 h-6 text-purple-600 mr-2" />
                  <span className="text-sm font-medium">Generar Reportes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;