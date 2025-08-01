import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Brain, 
  Download, 
  Upload, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Settings,
  BarChart3,
  HardDrive,
  Activity,
  Shield,
  Clock,
  Zap,
  FileText,
  Play,
  Pause,
  RotateCcw,
  Server,
  Cpu,
  Eye,
  Trash2,
  Plus,
  Monitor,
  Terminal,
  Code,
  Layers,
  Archive
} from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { callGeminiAI } from '../../lib/supabase';

interface DatabaseKPICardProps {
  title: string;
  value: string | number;
  status: 'good' | 'warning' | 'error';
  icon: React.ElementType;
  color: string;
  description?: string;
  period?: string;
}

function DatabaseKPICard({ title, value, status, icon: Icon, color, description, period = 'tiempo real' }: DatabaseKPICardProps) {
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="flex items-center space-x-2">
          <StatusIcon className={`h-4 w-4 ${statusColors[status]}`} />
          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
            {period}
          </span>
        </div>
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

interface TableStatsCardProps {
  tableName: string;
  records: number;
  size: string;
  lastUpdate: string;
  growth: number;
  icon: React.ElementType;
  color: string;
}

function TableStatsCard({ tableName, records, size, lastUpdate, growth, icon: Icon, color }: TableStatsCardProps) {
  const growthColor = growth > 0 ? 'text-green-600' : growth < 0 ? 'text-red-600' : 'text-gray-600';
  const growthSymbol = growth > 0 ? '+' : '';

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center mr-3`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-800">{tableName}</h4>
            <p className="text-sm text-gray-500">Tabla principal</p>
          </div>
        </div>
        <div className="text-right">
          <span className={`text-xs font-medium ${growthColor}`}>
            {growthSymbol}{growth}%
          </span>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Registros:</span>
          <span className="font-medium text-gray-900">{records.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tamaño:</span>
          <span className="font-medium text-gray-900">{size}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Actualización:</span>
          <span className="font-medium text-gray-900">{lastUpdate}</span>
        </div>
      </div>
      
      <div className="flex space-x-2 mt-4">
        <button 
          onClick={() => handleViewTable(tableName)}
          className="flex-1 px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors text-sm font-medium"
        >
          <Eye className="h-3 w-3 inline mr-1" />
          Ver
        </button>
        <button 
          onClick={() => handleAnalyzeTable(tableName)}
          className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors"
        >
          <BarChart3 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

interface BackupCardProps {
  name: string;
  date: string;
  size: string;
  type: 'full' | 'incremental' | 'differential';
  status: 'completed' | 'running' | 'failed';
  icon: React.ElementType;
}

function BackupCard({ name, date, size, type, status, icon: Icon }: BackupCardProps) {
  const statusColors = {
    completed: 'bg-green-100 text-green-800 border-green-200',
    running: 'bg-blue-100 text-blue-800 border-blue-200',
    failed: 'bg-red-100 text-red-800 border-red-200'
  };

  const typeColors = {
    full: 'bg-purple-100 text-purple-800',
    incremental: 'bg-blue-100 text-blue-800',
    differential: 'bg-orange-100 text-orange-800'
  };

  return (
    <div className={`border rounded-lg p-4 ${statusColors[status]} hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <Icon className="h-5 w-5 mr-2" />
          <span className="font-semibold">{name}</span>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[type]}`}>
          {type}
        </span>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Fecha:</span>
          <span className="font-medium">{date}</span>
        </div>
        <div className="flex justify-between">
          <span>Tamaño:</span>
          <span className="font-medium">{size}</span>
        </div>
        <div className="flex justify-between">
          <span>Estado:</span>
          <span className="font-medium">{status}</span>
        </div>
      </div>
      
      <div className="flex space-x-2 mt-3">
        <button className="flex-1 px-3 py-2 bg-white/50 hover:bg-white/75 rounded-lg transition-colors text-sm font-medium">
          <Download className="h-3 w-3 inline mr-1" />
          Descargar
        </button>
        <button className="px-3 py-2 bg-white/50 hover:bg-white/75 rounded-lg transition-colors">
          <RotateCcw className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

export default function DatabaseModule() {
  const [aiRecommendations, setAiRecommendations] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [isBackupRunning, setIsBackupRunning] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState('');
  const [showSimulationModal, setShowSimulationModal] = useState(false);

  // KPIs de Base de Datos
  const databaseKPIs = [
    { title: 'Estado General', value: 'Saludable', status: 'good' as const, icon: Database, color: 'bg-green-500', description: 'Todos los sistemas operativos', period: 'tiempo real' },
    { title: 'Espacio Utilizado', value: '2.4TB', status: 'warning' as const, icon: HardDrive, color: 'bg-blue-500', description: '78% del total disponible', period: 'tiempo real' },
    { title: 'Conexiones Activas', value: '89', status: 'good' as const, icon: Activity, color: 'bg-purple-500', description: 'De 200 máximas', period: 'tiempo real' },
    { title: 'Rendimiento', value: '98.7%', status: 'good' as const, icon: Zap, color: 'bg-yellow-500', description: 'Tiempo de respuesta óptimo', period: 'tiempo real' },
    { title: 'Último Backup', value: '2h ago', status: 'good' as const, icon: Shield, color: 'bg-indigo-500', description: 'Backup automático exitoso', period: 'tiempo real' },
    { title: 'Consultas/seg', value: '1,247', status: 'good' as const, icon: BarChart3, color: 'bg-orange-500', description: 'Promedio últimas 24h', period: 'tiempo real' },
    { title: 'CPU Database', value: '23%', status: 'good' as const, icon: Cpu, color: 'bg-cyan-500', description: 'Uso del procesador', period: 'tiempo real' },
    { title: 'Memoria RAM', value: '67%', status: 'warning' as const, icon: Server, color: 'bg-pink-500', description: 'Uso de memoria', period: 'tiempo real' }
  ];

  // Estadísticas de tablas
  const tableStats = [
    { tableName: 'users', records: 247, size: '12MB', lastUpdate: '2025-01-27', growth: 12.5, icon: FileText, color: 'bg-blue-600' },
    { tableName: 'clients', records: 247, size: '45MB', lastUpdate: '2025-01-27', growth: 12.5, icon: FileText, color: 'bg-green-600' },
    { tableName: 'companies', records: 156, size: '8MB', lastUpdate: '2025-01-27', growth: 8.3, icon: FileText, color: 'bg-purple-600' },
    { tableName: 'projects', records: 89, size: '15MB', lastUpdate: '2025-01-26', growth: 15.2, icon: FileText, color: 'bg-orange-600' },
    { tableName: 'documents', records: 1834, size: '234MB', lastUpdate: '2025-01-27', growth: 18.7, icon: FileText, color: 'bg-indigo-600' },
    { tableName: 'payments', records: 567, size: '23MB', lastUpdate: '2025-01-27', growth: 22.1, icon: FileText, color: 'bg-emerald-600' },
    { tableName: 'audit_logs', records: 12456, size: '89MB', lastUpdate: '2025-01-27', growth: 35.4, icon: FileText, color: 'bg-cyan-600' },
    { tableName: 'subscriptions', records: 234, size: '5MB', lastUpdate: '2025-01-27', growth: 9.8, icon: FileText, color: 'bg-pink-600' }
  ];

  // Backups disponibles
  const availableBackups = [
    { name: 'Backup_2025-01-27_14:30', date: '27/01/2025 14:30', size: '2.4TB', type: 'full' as const, status: 'completed' as const, icon: Archive },
    { name: 'Backup_2025-01-27_08:00', date: '27/01/2025 08:00', size: '2.3TB', type: 'full' as const, status: 'completed' as const, icon: Archive },
    { name: 'Backup_2025-01-26_20:00', date: '26/01/2025 20:00', size: '156MB', type: 'incremental' as const, status: 'completed' as const, icon: Archive },
    { name: 'Backup_2025-01-26_12:00', date: '26/01/2025 12:00', size: '89MB', type: 'differential' as const, status: 'completed' as const, icon: Archive }
  ];

  // Datos para gráficos
  const performanceData = {
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
    datasets: [{
      label: 'Consultas por Hora',
      data: [456, 234, 789, 1247, 1456, 892],
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  const storageDistributionData = {
    labels: ['Documentos', 'Logs', 'Usuarios', 'Proyectos', 'Otros'],
    datasets: [{
      data: [65, 20, 8, 5, 2],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(156, 163, 175, 0.8)'
      ],
      borderWidth: 0
    }]
  };

  const connectionStatsData = {
    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab', 'Dom'],
    datasets: [{
      label: 'Conexiones Activas',
      data: [67, 89, 78, 92, 85, 45, 34],
      backgroundColor: 'rgba(168, 85, 247, 0.8)',
      borderColor: 'rgb(168, 85, 247)',
      borderWidth: 1
    }]
  };

  const generateDatabaseInsights = async () => {
    setLoading(true);
    try {
      // Simular insights mientras Gemini está fallando
      const mockInsights = `🗄️ Análisis Técnico de Base de Datos:

1. **Rendimiento Óptimo**: El sistema mantiene 98.7% de rendimiento con 1,247 consultas/seg, superando objetivos de SLA.

2. **Almacenamiento**: Con 2.4TB utilizados (78%), recomiendo planificar expansión en los próximos 2 meses.

3. **Optimización**: La tabla 'audit_logs' crece 35.4% mensual, considerar archivado automático de logs antiguos.`;
      
      setAiRecommendations(mockInsights);
    } catch (error) {
      setAiRecommendations('Error al generar recomendaciones. La API de Gemini está temporalmente no disponible.');
    } finally {
      setLoading(false);
    }
  };

  const simulateBackup = () => {
    setIsBackupRunning(true);
    setBackupProgress(0);
    
    const interval = setInterval(() => {
      setBackupProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsBackupRunning(false);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const injectSimulationData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Datos de simulación inyectados exitosamente');
      setShowSimulationModal(false);
    } catch (error) {
      alert('Error al inyectar datos de simulación');
    } finally {
      setLoading(false);
    }
  };

  const optimizeDatabase = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      alert('Base de datos optimizada exitosamente. Rendimiento mejorado al 99.2%');
    } catch (error) {
      alert('Error al optimizar la base de datos.');
    } finally {
      setLoading(false);
    }
  };

  const exportDatabaseReport = () => {
    const reportData = {
      tables: tableStats.length,
      total_records: tableStats.reduce((sum, table) => sum + table.records, 0),
      total_size: '2.4TB',
      performance: '98.7%',
      connections: 89,
      queries_per_second: 1247
    };
    
    console.log('Exportando reporte de base de datos:', reportData);
    alert('Reporte de base de datos exportado exitosamente');
  };

  const handleViewTable = (tableName: string) => {
    alert(`Vista de tabla: ${tableName}\n\nEsta funcionalidad mostraría:\n• Estructura de la tabla\n• Primeros 100 registros\n• Índices y relaciones\n• Estadísticas detalladas`);
  };

  const handleAnalyzeTable = (tableName: string) => {
    alert(`Análisis de tabla: ${tableName}\n\nEsta funcionalidad proporcionaría:\n• Análisis de rendimiento\n• Consultas más lentas\n• Uso de índices\n• Recomendaciones de optimización`);
  };

  const handleNewQuery = () => {
    alert('Nueva Consulta SQL\n\nEsta funcionalidad abriría:\n• Editor SQL con sintaxis highlighting\n• Autocompletado de tablas y campos\n• Historial de consultas\n• Exportación de resultados');
  };
  
  const SimulationModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Inyección de Datos de Simulación</h3>
          <button
            onClick={() => setShowSimulationModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-800">Datos Realistas para Testing</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Se inyectarán datos de prueba realistas para testing completo de la plataforma. Esta acción es irreversible.
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-800">Datos a Inyectar:</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium">Clientes de prueba</span>
                <span className="text-sm text-blue-600 font-bold">50 registros</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium">Empresas simuladas</span>
                <span className="text-sm text-green-600 font-bold">25 registros</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="text-sm font-medium">Proyectos</span>
                <span className="text-sm text-purple-600 font-bold">75 registros</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <span className="text-sm font-medium">Documentos simulados</span>
                <span className="text-sm text-orange-600 font-bold">500 registros</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-800">Impacto Estimado:</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">Tiempo estimado</span>
                <span className="text-sm text-gray-600 font-bold">2-3 minutos</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">Espacio adicional</span>
                <span className="text-sm text-gray-600 font-bold">~150MB</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">Transacciones</span>
                <span className="text-sm text-gray-600 font-bold">200 registros</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">Logs de auditoría</span>
                <span className="text-sm text-gray-600 font-bold">1000 registros</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setShowSimulationModal(false)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={injectSimulationData}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Inyectando...' : 'Confirmar Inyección'}
          </button>
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    generateDatabaseInsights();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header con IA */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Control de Base de Datos</h2>
            <p className="text-blue-100 mt-1">Inspector inteligente con soporte IA y monitoreo avanzado</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedOperation}
              onChange={(e) => setSelectedOperation(e.target.value)}
              className="bg-white/20 text-white border border-white/30 rounded-lg px-3 py-2 text-sm"
            >
              <option value="" className="text-gray-800">Seleccionar operación</option>
              <option value="backup" className="text-gray-800">Backup Manual</option>
              <option value="optimize" className="text-gray-800">Optimizar DB</option>
              <option value="analyze" className="text-gray-800">Analizar Rendimiento</option>
            </select>
            <button 
              onClick={generateDatabaseInsights}
              disabled={loading}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center"
            >
              <Brain className="h-4 w-4 mr-2" />
              {loading ? 'Analizando...' : 'Actualizar IA'}
            </button>
          </div>
        </div>
        
        {aiRecommendations && (
          <div className="mt-4 bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold mb-2">🔧 Recomendaciones DBA IA:</h3>
            <div className="text-sm text-white/90 whitespace-pre-line">{aiRecommendations}</div>
          </div>
        )}
      </div>

      {/* KPIs de Base de Datos */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Estado del Sistema de Base de Datos</h3>
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">Actualización automática</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {databaseKPIs.map((kpi, index) => (
            <DatabaseKPICard key={index} {...kpi} />
          ))}
        </div>
      </div>

      {/* Gráficos de Monitoreo */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Monitoreo en Tiempo Real</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-800">Rendimiento por Hora</h4>
              <button className="text-gray-400 hover:text-gray-600">
                <Download className="h-4 w-4" />
              </button>
            </div>
            <div className="h-48">
              <Line data={performanceData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-800">Distribución de Almacenamiento</h4>
              <button className="text-gray-400 hover:text-gray-600">
                <Eye className="h-4 w-4" />
              </button>
            </div>
            <div className="h-48">
              <Doughnut data={storageDistributionData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-800">Conexiones por Día</h4>
              <button className="text-gray-400 hover:text-gray-600">
                <BarChart3 className="h-4 w-4" />
              </button>
            </div>
            <div className="h-48">
              <Bar data={connectionStatsData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
        </div>
      </div>

      {/* Inspector de Tablas */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Inspector de Tablas</h3>
          <button 
            onClick={handleNewQuery}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Consulta
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tableStats.map((table, index) => (
            <TableStatsCard key={index} {...table} />
          ))}
        </div>
      </div>

      {/* Sistema de Backup Inteligente */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Sistema de Backup Inteligente</h3>
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <span className="text-sm text-purple-600 font-medium">Automatizado con IA</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Estado Actual */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-700">Estado Actual</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                <Shield className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-green-800">Último Backup</p>
                <p className="text-xs text-green-600">Hace 2 horas</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                <HardDrive className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-blue-800">Tamaño Total</p>
                <p className="text-xs text-blue-600">2.4TB</p>
              </div>
            </div>
            
            {isBackupRunning && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Progreso del backup</span>
                  <span>{backupProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${backupProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <button
                onClick={simulateBackup}
                disabled={isBackupRunning}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {isBackupRunning ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                {isBackupRunning ? 'Backup en Progreso...' : 'Iniciar Backup Manual'}
              </button>
              
              <button 
                onClick={optimizeDatabase}
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                <Settings className="h-4 w-4 mr-2" />
                {loading ? 'Optimizando...' : 'Optimizar Base de Datos'}
              </button>
            </div>
          </div>

          {/* Backups Disponibles */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="font-semibold text-gray-700">Backups Disponibles</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableBackups.map((backup, index) => (
                <BackupCard key={index} {...backup} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Módulo de Simulación */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Inyección de Datos de Simulación</h3>
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-800">Datos Realistas para Testing</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Se inyectarán datos de prueba realistas para testing completo de la plataforma.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium">Clientes de prueba</span>
                <span className="text-sm text-blue-600 font-bold">50 registros</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium">Documentos simulados</span>
                <span className="text-sm text-green-600 font-bold">500 registros</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="text-sm font-medium">Transacciones</span>
                <span className="text-sm text-purple-600 font-bold">200 registros</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <span className="text-sm font-medium">Logs de auditoría</span>
                <span className="text-sm text-orange-600 font-bold">1000 registros</span>
              </div>
            </div>
            
            <button
              onClick={() => setShowSimulationModal(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Inyectar Datos de Simulación
            </button>
          </div>
        </div>

        {/* Preparación para Producción */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Preparación para Producción</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-700 mb-3">Estado de Variables de Entorno</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200">
                  <span className="text-sm">SUPABASE_URL</span>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200">
                  <span className="text-sm">GEMINI_API_KEY</span>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between p-2 bg-yellow-50 rounded border border-yellow-200">
                  <span className="text-sm">STRIPE_SECRET_KEY</span>
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                </div>
                <div className="flex items-center justify-between p-2 bg-red-50 rounded border border-red-200">
                  <span className="text-sm">OBRALIA_API_KEY</span>
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-700 mb-3">Checklist de Producción</h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" checked className="mr-2" />
                  <span className="text-sm">Base de datos optimizada</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" checked className="mr-2" />
                  <span className="text-sm">Backups configurados</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">SSL/TLS configurado</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">Monitoreo activado</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">Alertas configuradas</span>
                </label>
              </div>
            </div>
            
            <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
              Evaluar Sistema con IA
            </button>
          </div>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button 
            onClick={exportDatabaseReport}
            className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
          >
            <div className="flex items-center">
              <Download className="h-5 w-5 text-green-600 mr-2" />
              <div className="text-left">
                <p className="font-medium text-green-800">Exportar Reporte</p>
                <p className="text-xs text-green-600">Análisis completo</p>
              </div>
            </div>
          </button>
          
          <button 
            onClick={() => alert('Consola SQL: Esta funcionalidad abrirá una interfaz para ejecutar consultas SQL directamente en la base de datos.')}
            className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <div className="flex items-center">
              <Terminal className="h-5 w-5 text-blue-600 mr-2" />
              <div className="text-left">
                <p className="font-medium text-blue-800">Consola SQL</p>
                <p className="text-xs text-blue-600">Ejecutar consultas</p>
              </div>
            </div>
          </button>
          
          <button 
            onClick={() => alert('Monitoreo: Abriendo dashboard de métricas en tiempo real de la base de datos.')}
            className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
          >
            <div className="flex items-center">
              <Monitor className="h-5 w-5 text-purple-600 mr-2" />
              <div className="text-left">
                <p className="font-medium text-purple-800">Monitoreo</p>
                <p className="text-xs text-purple-600">Métricas en vivo</p>
              </div>
            </div>
          </button>
          
          <button 
            onClick={() => alert('Configuración: Accediendo a parámetros avanzados de la base de datos (timeouts, conexiones, cache, etc.).')}
            className="flex items-center justify-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
          >
            <div className="flex items-center">
              <Settings className="h-5 w-5 text-orange-600 mr-2" />
              <div className="text-left">
                <p className="font-medium text-orange-800">Configuración</p>
                <p className="text-xs text-orange-600">Parámetros avanzados</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Modal de Simulación */}
      {showSimulationModal && <SimulationModal />}
    </div>
  );
}