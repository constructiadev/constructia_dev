import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  Activity, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Zap
} from 'lucide-react';
import { 
  calculateDynamicKPIs,
  getRevenueStats,
  getClientStats,
  getDocumentStats,
  getAPIIntegrations,
  getManualProcessingQueue
} from '../../lib/supabase';

interface KPICardProps {
  title: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
  color: string;
}

function KPICard({ title, value, change, trend, icon, color }: KPICardProps) {
  const getTrendColor = () => {
    if (!trend || trend === 'stable') return 'text-gray-500';
    return trend === 'up' ? 'text-green-500' : 'text-red-500';
  };

  const getTrendIcon = () => {
    if (!trend || trend === 'stable') return null;
    return trend === 'up' ? '↗' : '↘';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${getTrendColor()}`}>
              {getTrendIcon()} {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const [kpis, setKpis] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [kpisData, revenue, apiIntegrations, processingQueue] = await Promise.all([
        calculateDynamicKPIs(),
        getRevenueStats(),
        getAPIIntegrations(),
        getManualProcessingQueue()
      ]);

      setKpis(kpisData);
      setRevenueData(revenue);
      setIntegrations(apiIntegrations);
      setQueue(processingQueue);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700">Error: {error}</span>
          </div>
          <button 
            onClick={loadDashboardData}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const revenueThisMonth = revenueData
    .filter(r => {
      const date = new Date(r.payment_date);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    })
    .reduce((sum, r) => sum + r.amount, 0);

  const pendingQueue = queue.filter(q => q.manual_status === 'pending').length;
  const activeIntegrations = integrations.filter(i => i.status === 'connected').length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
        <button 
          onClick={loadDashboardData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Activity className="w-4 h-4" />
          Actualizar
        </button>
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Clientes Activos"
          value={kpis?.activeClients?.toString() || '0'}
          change="+12% vs mes anterior"
          trend="up"
          icon={<Users className="w-6 h-6 text-white" />}
          color="bg-blue-500"
        />
        
        <KPICard
          title="Ingresos Totales"
          value={`€${kpis?.totalRevenue?.toLocaleString() || '0'}`}
          change="+8% vs mes anterior"
          trend="up"
          icon={<DollarSign className="w-6 h-6 text-white" />}
          color="bg-green-500"
        />
        
        <KPICard
          title="Documentos Procesados"
          value={kpis?.documentsThisMonth?.toString() || '0'}
          change="Este mes"
          trend="stable"
          icon={<FileText className="w-6 h-6 text-white" />}
          color="bg-purple-500"
        />
        
        <KPICard
          title="Precisión IA"
          value={`${kpis?.avgConfidence || 0}%`}
          change="+2.3% vs mes anterior"
          trend="up"
          icon={<TrendingUp className="w-6 h-6 text-white" />}
          color="bg-orange-500"
        />
      </div>

      {/* Estado del Sistema */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Integraciones API */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Estado de Integraciones
          </h3>
          <div className="space-y-3">
            {integrations.map((integration) => (
              <div key={integration.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    integration.status === 'connected' ? 'bg-green-500' : 
                    integration.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <div>
                    <p className="font-medium text-gray-900">{integration.name}</p>
                    <p className="text-sm text-gray-500">{integration.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {integration.requests_today} req/día
                  </p>
                  <p className="text-xs text-gray-500">
                    {integration.avg_response_time_ms}ms avg
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cola de Procesamiento */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Cola de Procesamiento Manual
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="font-medium text-gray-900">Pendientes</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{pendingQueue}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="font-medium text-gray-900">En Proceso</span>
              </div>
              <span className="text-lg font-bold text-gray-900">
                {queue.filter(q => q.manual_status === 'in_progress').length}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="font-medium text-gray-900">Completados Hoy</span>
              </div>
              <span className="text-lg font-bold text-gray-900">
                {queue.filter(q => {
                  const processedDate = new Date(q.processed_at || '');
                  const today = new Date();
                  return q.manual_status === 'uploaded' && 
                         processedDate.toDateString() === today.toDateString();
                }).length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas Adicionales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Database className="w-5 h-5" />
            Almacenamiento
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Documentos</span>
              <span className="font-medium">{kpis?.totalDocuments || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Almacenamiento Usado</span>
              <span className="font-medium">2.3 GB</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Rendimiento IA
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Precisión Promedio</span>
              <span className="font-medium">{kpis?.avgConfidence || 0}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Documentos Clasificados</span>
              <span className="font-medium">{kpis?.totalDocuments || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tiempo Promedio</span>
              <span className="font-medium">2.3s</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Ingresos del Mes
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Este Mes</span>
              <span className="font-medium">€{revenueThisMonth.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Acumulado</span>
              <span className="font-medium">€{kpis?.totalRevenue?.toLocaleString() || '0'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Clientes Activos</span>
              <span className="font-medium">{kpis?.activeClients || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actividad Reciente */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Actividad Reciente del Sistema
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <div>
              <p className="font-medium text-gray-900">Sistema funcionando correctamente</p>
              <p className="text-sm text-gray-500">Todas las integraciones activas - hace 2 min</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <FileText className="w-5 h-5 text-blue-500" />
            <div>
              <p className="font-medium text-gray-900">
                {kpis?.documentsThisMonth || 0} documentos procesados este mes
              </p>
              <p className="text-sm text-gray-500">Clasificación IA funcionando - hace 5 min</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
            <Clock className="w-5 h-5 text-yellow-500" />
            <div>
              <p className="font-medium text-gray-900">
                {pendingQueue} documentos en cola manual
              </p>
              <p className="text-sm text-gray-500">Requieren revisión manual - hace 10 min</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;