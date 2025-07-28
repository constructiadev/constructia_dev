import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Settings, 
  Activity, 
  Database,
  Zap,
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Eye,
  Trash2,
  Upload,
  Download,
  BarChart3,
  TrendingUp,
  Globe,
  Key,
  Sliders
} from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { callGeminiAI } from '../../lib/supabase';

interface AIKPICardProps {
  title: string;
  value: string | number;
  status: 'good' | 'warning' | 'error';
  icon: React.ElementType;
  color: string;
  description?: string;
}

function AIKPICard({ title, value, status, icon: Icon, color, description }: AIKPICardProps) {
  const statusColors = {
    good: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600'
  };

  const statusIcons = {
    good: CheckCircle,
    warning: AlertTriangle,
    error: AlertTriangle
  };

  const StatusIcon = statusIcons[status];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <StatusIcon className={`h-5 w-5 ${statusColors[status]}`} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </div>
    </div>
  );
}

interface ProcessingDocument {
  id: string;
  filename: string;
  client_name: string;
  status: 'classifying' | 'uploading_obralia' | 'validating' | 'completed' | 'error';
  progress: number;
  classification?: string;
  confidence?: number;
  error_message?: string;
  timestamp: string;
}

export default function AIIntegrationModule() {
  const [confidenceThreshold, setConfidenceThreshold] = useState(85);
  const [aiInsights, setAiInsights] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [processingQueue, setProcessingQueue] = useState<ProcessingDocument[]>([]);
  const [obraliaConfig, setObraliaConfig] = useState({
    apiUrl: 'https://api.obralia.com/v2',
    connected: false,
    lastSync: '2025-01-27 14:30:00'
  });

  // KPIs de IA e Integraciones
  const aiKPIs = [
    { title: 'Gemini AI Status', value: 'Activo', status: 'good' as const, icon: Brain, color: 'bg-purple-500', description: 'API funcionando correctamente' },
    { title: 'Documentos Clasificados', value: '1,834', status: 'good' as const, icon: FileText, color: 'bg-blue-500', description: 'Total procesados con IA' },
    { title: 'Precisión Promedio', value: '94.7%', status: 'good' as const, icon: TrendingUp, color: 'bg-green-500', description: 'Confianza de clasificación' },
    { title: 'Obralia Status', value: 'Configurando', status: 'warning' as const, icon: Globe, color: 'bg-orange-500', description: 'Integración en progreso' },
    { title: 'Cola de Procesamiento', value: '23', status: 'good' as const, icon: Clock, color: 'bg-indigo-500', description: 'Documentos pendientes' },
    { title: 'Tiempo Promedio IA', value: '2.3s', status: 'good' as const, icon: Zap, color: 'bg-yellow-500', description: 'Respuesta de Gemini' }
  ];

  // Datos simulados de cola de procesamiento
  const mockProcessingQueue: ProcessingDocument[] = [
    {
      id: '1',
      filename: 'certificado_obra_A.pdf',
      client_name: 'Construcciones García S.L.',
      status: 'uploading_obralia',
      progress: 75,
      classification: 'Certificado',
      confidence: 92,
      timestamp: '2025-01-27 15:45:00'
    },
    {
      id: '2',
      filename: 'factura_materiales_B.pdf',
      client_name: 'Obras Públicas del Norte S.A.',
      status: 'validating',
      progress: 90,
      classification: 'Factura',
      confidence: 88,
      timestamp: '2025-01-27 15:42:00'
    },
    {
      id: '3',
      filename: 'dni_trabajador_C.pdf',
      client_name: 'Reformas Integrales López',
      status: 'error',
      progress: 0,
      classification: 'DNI/Identificación',
      confidence: 76,
      error_message: 'Error de conexión con Obralia',
      timestamp: '2025-01-27 15:38:00'
    }
  ];

  // Datos para gráficos
  const classificationAccuracyData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [{
      label: 'Precisión de Clasificación (%)',
      data: [89.2, 91.5, 93.1, 94.7, 95.2, 94.7],
      borderColor: 'rgb(168, 85, 247)',
      backgroundColor: 'rgba(168, 85, 247, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  const documentTypesData = {
    labels: ['Certificados', 'Facturas', 'DNI/ID', 'Contratos', 'Seguros', 'Otros'],
    datasets: [{
      data: [35, 28, 15, 12, 7, 3],
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(156, 163, 175, 0.8)'
      ],
      borderWidth: 0
    }]
  };

  const processingTimeData = {
    labels: ['Clasificación IA', 'Subida Obralia', 'Validación', 'Eliminación'],
    datasets: [{
      label: 'Tiempo Promedio (segundos)',
      data: [2.3, 8.7, 15.2, 1.1],
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      borderColor: 'rgb(59, 130, 246)',
      borderWidth: 1
    }]
  };

  useEffect(() => {
    setProcessingQueue(mockProcessingQueue);
    generateAIInsights();
  }, []);

  const generateAIInsights = async () => {
    setLoading(true);
    try {
      const prompt = `Como experto en IA de ConstructIA, analiza estos datos:
      - 1,834 documentos clasificados con 94.7% precisión promedio
      - Gemini AI activo con 2.3s tiempo respuesta
      - 23 documentos en cola de procesamiento
      - Umbral de confianza actual: ${confidenceThreshold}%
      - Tipos principales: Certificados (35%), Facturas (28%), DNI (15%)
      - Integración Obralia en configuración
      
      Genera 3 recomendaciones técnicas para optimizar la IA y el procesamiento (máximo 150 palabras).`;
      
      const insights = await callGeminiAI(prompt);
      setAiInsights(insights);
    } catch (error) {
      setAiInsights('Error al generar insights de IA. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'classifying': return 'bg-purple-100 text-purple-800';
      case 'uploading_obralia': return 'bg-blue-100 text-blue-800';
      case 'validating': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'classifying': return <Brain className="h-4 w-4 text-purple-600 animate-pulse" />;
      case 'uploading_obralia': return <Upload className="h-4 w-4 text-blue-600" />;
      case 'validating': return <Shield className="h-4 w-4 text-yellow-600" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const retryProcessing = (documentId: string) => {
    setProcessingQueue(prev => prev.map(doc => 
      doc.id === documentId 
        ? { ...doc, status: 'classifying', progress: 0, error_message: undefined }
        : doc
    ));
  };

  const testObraliaConnection = async () => {
    setLoading(true);
    try {
      // Simular test de conexión
      await new Promise(resolve => setTimeout(resolve, 2000));
      setObraliaConfig(prev => ({ ...prev, connected: true, lastSync: new Date().toISOString() }));
      alert('Conexión con Obralia establecida exitosamente');
    } catch (error) {
      alert('Error al conectar con Obralia');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header con IA */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">IA & Integraciones</h2>
            <p className="text-purple-100 mt-1">Gestión avanzada de Gemini AI y Obralia/Nalanda</p>
          </div>
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8" />
            <button 
              onClick={generateAIInsights}
              disabled={loading}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Analizando...' : 'Actualizar IA'}
            </button>
          </div>
        </div>
        
        {aiInsights && (
          <div className="mt-4 bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold mb-2">🤖 Insights Técnicos IA:</h3>
            <p className="text-sm text-white/90">{aiInsights}</p>
          </div>
        )}
      </div>

      {/* KPIs de IA e Integraciones */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Estado de IA e Integraciones</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          {aiKPIs.map((kpi, index) => (
            <AIKPICard key={index} {...kpi} />
          ))}
        </div>
      </div>

      {/* Configuración de APIs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gemini AI Configuration */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Configuración Gemini AI</h3>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm text-green-600 font-medium">Conectado</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Umbral de Confianza: {confidenceThreshold}%
              </label>
              <input
                type="range"
                min="70"
                max="99"
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>70%</span>
                <span>85%</span>
                <span>99%</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-lg font-bold text-purple-600">2.3s</p>
                <p className="text-xs text-purple-800">Tiempo Respuesta</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-lg font-bold text-green-600">94.7%</p>
                <p className="text-xs text-green-800">Precisión</p>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Modelo:</span>
                <span className="font-medium">gemini-pro</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Requests hoy:</span>
                <span className="font-medium">1,247</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Límite diario:</span>
                <span className="font-medium">10,000</span>
              </div>
            </div>
          </div>
        </div>

        {/* Obralia/Nalanda Configuration */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Configuración Obralia/Nalanda</h3>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
              <span className="text-sm text-yellow-600 font-medium">Configurando</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL de API
              </label>
              <input
                type="text"
                value={obraliaConfig.apiUrl}
                onChange={(e) => setObraliaConfig(prev => ({ ...prev, apiUrl: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timeout (seg)
                </label>
                <input
                  type="number"
                  defaultValue="30"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reintentos
                </label>
                <input
                  type="number"
                  defaultValue="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Última sincronización:</span>
                <span className="font-medium">{obraliaConfig.lastSync}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Documentos subidos:</span>
                <span className="font-medium">1,456</span>
              </div>
            </div>
            
            <button
              onClick={testObraliaConnection}
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Probando...' : 'Probar Conexión'}
            </button>
          </div>
        </div>
      </div>

      {/* Gráficos de Análisis */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Análisis de Rendimiento IA</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Evolución de Precisión</h4>
            <Line data={classificationAccuracyData} options={{ responsive: true, maintainAspectRatio: false }} height={200} />
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Tipos de Documentos</h4>
            <Doughnut data={documentTypesData} options={{ responsive: true, maintainAspectRatio: false }} height={200} />
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Tiempos de Procesamiento</h4>
            <Bar data={processingTimeData} options={{ responsive: true, maintainAspectRatio: false }} height={200} />
          </div>
        </div>
      </div>

      {/* Cola de Procesamiento */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Cola de Procesamiento Asíncrono</h3>
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">Actualización automática</span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Documento</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progreso</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clasificación</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Confianza</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {processingQueue.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{doc.filename}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{doc.client_name}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      {getStatusIcon(doc.status)}
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                        {doc.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className={`h-2 rounded-full ${doc.status === 'error' ? 'bg-red-500' : 'bg-blue-500'}`}
                          style={{ width: `${doc.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{doc.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{doc.classification || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {doc.confidence ? `${doc.confidence}%` : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-800">
                        <Eye className="h-4 w-4" />
                      </button>
                      {doc.status === 'error' && (
                        <button
                          onClick={() => retryProcessing(doc.id)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {processingQueue.length === 0 && (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">Cola vacía</h3>
            <p className="text-gray-600">No hay documentos en procesamiento</p>
          </div>
        )}
      </div>

      {/* Mapeo de Entrenamiento */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Entrenamiento Asistido de IA</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-purple-50 rounded-lg">
            <Database className="h-8 w-8 text-purple-600 mx-auto mb-3" />
            <h4 className="font-semibold text-purple-800 mb-2">Documentos Históricos</h4>
            <p className="text-2xl font-bold text-purple-600 mb-1">1,834</p>
            <p className="text-sm text-purple-700">Disponibles para entrenamiento</p>
          </div>
          
          <div className="text-center p-6 bg-green-50 rounded-lg">
            <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-3" />
            <h4 className="font-semibold text-green-800 mb-2">Mejora de Precisión</h4>
            <p className="text-2xl font-bold text-green-600 mb-1">+5.2%</p>
            <p className="text-sm text-green-700">Últimos 30 días</p>
          </div>
          
          <div className="text-center p-6 bg-blue-50 rounded-lg">
            <Brain className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <h4 className="font-semibold text-blue-800 mb-2">Modelos Activos</h4>
            <p className="text-2xl font-bold text-blue-600 mb-1">3</p>
            <p className="text-sm text-blue-700">Especializados por tipo</p>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t">
          <button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors mr-4">
            Iniciar Entrenamiento
          </button>
          <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors">
            Exportar Dataset
          </button>
        </div>
      </div>
    </div>
  );
}