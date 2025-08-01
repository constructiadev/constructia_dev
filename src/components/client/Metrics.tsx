import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  getCurrentClientData, 
  getClientProjects, 
  getClientDocuments 
} from '../../lib/supabase';
import { 
  BarChart3, 
  TrendingUp, 
  FileText, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Calendar,
  Download
} from 'lucide-react';

interface MetricsData {
  totalDocuments: number;
  documentsThisMonth: number;
  avgProcessingTime: number;
  successRate: number;
  storageUsed: number;
  storageLimit: number;
}

const Metrics: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<MetricsData>({
    totalDocuments: 0,
    documentsThisMonth: 0,
    avgProcessingTime: 0,
    successRate: 0,
    storageUsed: 0,
    storageLimit: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadMetrics();
    }
  }, [user]);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get client data
      const clientData = await getCurrentClientData(user!.id);
      if (!clientData) {
        throw new Error('No client data found');
      }

      // Get documents
      const documents = await getClientDocuments(clientData.id);
      
      // Calculate metrics
      const now = new Date();
      const thisMonth = documents.filter(doc => {
        const docDate = new Date(doc.created_at);
        return docDate.getMonth() === now.getMonth() && 
               docDate.getFullYear() === now.getFullYear();
      });

      const completedDocs = documents.filter(doc => doc.upload_status === 'completed');
      const successRate = documents.length > 0 ? (completedDocs.length / documents.length) * 100 : 0;

      setMetrics({
        totalDocuments: documents.length,
        documentsThisMonth: thisMonth.length,
        avgProcessingTime: 2.3, // Simulated
        successRate: Math.round(successRate),
        storageUsed: clientData.storage_used,
        storageLimit: clientData.storage_limit
      });

    } catch (err) {
      console.error('Error loading metrics:', err);
      setError(err instanceof Error ? err.message : 'Error loading metrics');
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStoragePercentage = () => {
    return metrics.storageLimit > 0 ? (metrics.storageUsed / metrics.storageLimit) * 100 : 0;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Cargando métricas...</span>
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
            onClick={loadMetrics}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Métricas y Análisis</h1>
        <button
          onClick={loadMetrics}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Actualizar
        </button>
      </div>

      {/* KPIs principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Documentos</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalDocuments}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Este Mes</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.documentsThisMonth}</p>
            </div>
            <Calendar className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tiempo Promedio</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.avgProcessingTime}s</p>
            </div>
            <Clock className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tasa de Éxito</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.successRate}%</p>
            </div>
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
        </div>
      </div>

      {/* Uso de almacenamiento */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Uso de Almacenamiento</h2>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              {formatBytes(metrics.storageUsed)} de {formatBytes(metrics.storageLimit)}
            </span>
            <span className="text-gray-600">{getStoragePercentage().toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-300 ${
                getStoragePercentage() > 90 ? 'bg-red-500' :
                getStoragePercentage() > 75 ? 'bg-yellow-500' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(getStoragePercentage(), 100)}%` }}
            ></div>
          </div>
          {getStoragePercentage() > 90 && (
            <div className="flex items-center text-red-600 text-sm">
              <AlertTriangle className="w-4 w-4 mr-1" />
              Almacenamiento casi lleno. Considera actualizar tu plan.
            </div>
          )}
        </div>
      </div>

      {/* Estadísticas de rendimiento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rendimiento de Procesamiento</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Documentos procesados</span>
              <span className="font-semibold text-gray-900">{metrics.totalDocuments}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tiempo promedio</span>
              <span className="font-semibold text-gray-900">{metrics.avgProcessingTime}s</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tasa de éxito</span>
              <span className="font-semibold text-green-600">{metrics.successRate}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Mensual</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Documentos este mes</span>
              <span className="font-semibold text-gray-900">{metrics.documentsThisMonth}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Promedio diario</span>
              <span className="font-semibold text-gray-900">
                {Math.round(metrics.documentsThisMonth / new Date().getDate())}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tendencia</span>
              <div className="flex items-center">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="font-semibold text-green-600">+15%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
            <Download className="w-5 h-5 text-blue-600 mr-2" />
            <div className="text-left">
              <p className="font-medium text-blue-800">Exportar Métricas</p>
              <p className="text-xs text-blue-600">Descargar reporte completo</p>
            </div>
          </button>
          
          <button className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
            <BarChart3 className="w-5 h-5 text-green-600 mr-2" />
            <div className="text-left">
              <p className="font-medium text-green-800">Ver Tendencias</p>
              <p className="text-xs text-green-600">Análisis detallado</p>
            </div>
          </button>
          
          <button className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
            <TrendingUp className="w-5 h-5 text-purple-600 mr-2" />
            <div className="text-left">
              <p className="font-medium text-purple-800">Optimizar</p>
              <p className="text-xs text-purple-600">Sugerencias de mejora</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Metrics;