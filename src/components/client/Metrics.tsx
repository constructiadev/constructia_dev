import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  BarChart3, 
  TrendingUp, 
  FileText, 
  Clock, 
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Calendar,
  Target,
  Activity
} from 'lucide-react';
import { 
  getCurrentClientData,
  getClientDocuments,
  getClientProjects
} from '../../lib/supabase';

interface MetricsData {
  totalDocuments: number;
  documentsThisMonth: number;
  avgConfidence: number;
  processingTime: number;
  successRate: number;
  documentsByType: { [key: string]: number };
  documentsByStatus: { [key: string]: number };
  monthlyProgress: number[];
}

export default function Metrics() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<MetricsData>({
    totalDocuments: 0,
    documentsThisMonth: 0,
    avgConfidence: 0,
    processingTime: 0,
    successRate: 0,
    documentsByType: {},
    documentsByStatus: {},
    monthlyProgress: []
  });
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    if (user) {
      loadMetrics();
    }
  }, [user, selectedPeriod]);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.id) {
        throw new Error('Usuario no autenticado');
      }

      const clientData = await getCurrentClientData(user.id);
      if (!clientData) {
        throw new Error('No se encontraron datos del cliente');
      }

      const [documents, projects] = await Promise.all([
        getClientDocuments(clientData.id),
        getClientProjects(clientData.id)
      ]);

      // Calcular métricas
      const now = new Date();
      const thisMonth = documents.filter(d => {
        const docDate = new Date(d.created_at);
        return docDate.getMonth() === now.getMonth() && docDate.getFullYear() === now.getFullYear();
      });

      const avgConfidence = documents.length > 0 
        ? documents.reduce((sum, d) => sum + (d.classification_confidence || 0), 0) / documents.length 
        : 0;

      const successfulDocs = documents.filter(d => 
        d.upload_status === 'completed' || d.upload_status === 'uploaded_to_obralia'
      );

      const successRate = documents.length > 0 ? (successfulDocs.length / documents.length) * 100 : 0;

      // Agrupar por tipo
      const documentsByType = documents.reduce((acc, doc) => {
        acc[doc.document_type] = (acc[doc.document_type] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });

      // Agrupar por estado
      const documentsByStatus = documents.reduce((acc, doc) => {
        acc[doc.upload_status] = (acc[doc.upload_status] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });

      // Progreso mensual (últimos 6 meses)
      const monthlyProgress = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthDocs = documents.filter(d => {
          const docDate = new Date(d.created_at);
          return docDate.getMonth() === date.getMonth() && docDate.getFullYear() === date.getFullYear();
        });
        monthlyProgress.push(monthDocs.length);
      }

      setMetrics({
        totalDocuments: documents.length,
        documentsThisMonth: thisMonth.length,
        avgConfidence: Math.round(avgConfidence * 10) / 10,
        processingTime: 2.3, // Simulado
        successRate: Math.round(successRate * 10) / 10,
        documentsByType,
        documentsByStatus,
        monthlyProgress
      });

    } catch (err) {
      console.error('Error loading metrics:', err);
      setMetrics({
        totalDocuments: 0,
        documentsThisMonth: 0,
        avgConfidence: 0,
        processingTime: 0,
        successRate: 0,
        documentsByType: {},
        documentsByStatus: {},
        monthlyProgress: [0, 0, 0, 0, 0, 0]
      });
      setError('Datos no disponibles temporalmente');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Cargando métricas...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-red-700">Error: {error}</span>
        </div>
        <button 
          onClick={loadMetrics}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Métricas y Análisis</h1>
          <p className="text-gray-600">Analiza el rendimiento de tu gestión documental</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="week">Esta semana</option>
            <option value="month">Este mes</option>
            <option value="quarter">Este trimestre</option>
            <option value="year">Este año</option>
          </select>
          <button 
            onClick={loadMetrics}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </button>
        </div>
      </div>

      {/* KPIs */}
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
              <p className="text-sm font-medium text-gray-600">Precisión IA</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.avgConfidence}%</p>
            </div>
            <Target className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tasa de Éxito</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.successRate}%</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Simple Charts with CSS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Progreso Mensual</h3>
          <div className="space-y-3">
            {metrics.monthlyProgress.map((value, index) => {
              const maxValue = Math.max(...metrics.monthlyProgress, 1);
              const percentage = (value / maxValue) * 100;
              const months = ['Hace 5 meses', 'Hace 4 meses', 'Hace 3 meses', 'Hace 2 meses', 'Mes pasado', 'Este mes'];
              
              return (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 w-24">{months[index]}</span>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8">{value}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Documentos por Tipo</h3>
          <div className="space-y-3">
            {Object.entries(metrics.documentsByType).map(([type, count], index) => {
              const total = Object.values(metrics.documentsByType).reduce((sum, val) => sum + val, 0);
              const percentage = total > 0 ? (count / total) * 100 : 0;
              const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-purple-500', 'bg-pink-500'];
              
              return (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${colors[index % colors.length]}`}></div>
                    <span className="text-sm text-gray-600">{type || 'Sin clasificar'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${colors[index % colors.length]}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado de Documentos</h3>
          <div className="space-y-3">
            {Object.entries(metrics.documentsByStatus).map(([status, count], index) => {
              const total = Object.values(metrics.documentsByStatus).reduce((sum, val) => sum + val, 0);
              const percentage = total > 0 ? (count / total) * 100 : 0;
              const statusColors = {
                'completed': 'bg-green-500',
                'uploaded_to_obralia': 'bg-blue-500',
                'processing': 'bg-yellow-500',
                'classified': 'bg-purple-500',
                'pending': 'bg-gray-500',
                'error': 'bg-red-500'
              };
              const statusLabels = {
                'completed': 'Completado',
                'uploaded_to_obralia': 'Subido a Obralia',
                'processing': 'Procesando',
                'classified': 'Clasificado',
                'pending': 'Pendiente',
                'error': 'Error'
              };
              
              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${statusColors[status as keyof typeof statusColors] || 'bg-gray-500'}`}></div>
                    <span className="text-sm text-gray-600">{statusLabels[status as keyof typeof statusLabels] || status}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${statusColors[status as keyof typeof statusColors] || 'bg-gray-500'}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Métricas de Rendimiento</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tiempo promedio de procesamiento</span>
              <span className="font-semibold text-blue-600">{metrics.processingTime}s</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Precisión de clasificación</span>
              <span className="font-semibold text-green-600">{metrics.avgConfidence}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tasa de éxito</span>
              <span className="font-semibold text-purple-600">{metrics.successRate}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Documentos este mes</span>
              <span className="font-semibold text-orange-600">{metrics.documentsThisMonth}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2" />
          Insights y Recomendaciones
        </h3>
        <div className="space-y-3">
          {metrics.avgConfidence >= 90 && (
            <div className="flex items-center p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
              <div>
                <p className="font-medium text-green-800">Excelente precisión de IA</p>
                <p className="text-sm text-green-700">
                  Tu precisión promedio de {metrics.avgConfidence}% está por encima del promedio
                </p>
              </div>
            </div>
          )}
          
          {metrics.documentsThisMonth > 0 && (
            <div className="flex items-center p-3 bg-blue-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-500 mr-3" />
              <div>
                <p className="font-medium text-blue-800">Actividad constante</p>
                <p className="text-sm text-blue-700">
                  Has procesado {metrics.documentsThisMonth} documentos este mes
                </p>
              </div>
            </div>
          )}
          
          {metrics.successRate < 80 && (
            <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-500 mr-3" />
              <div>
                <p className="font-medium text-yellow-800">Oportunidad de mejora</p>
                <p className="text-sm text-yellow-700">
                  Tu tasa de éxito es del {metrics.successRate}%. Considera revisar la calidad de los documentos
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}