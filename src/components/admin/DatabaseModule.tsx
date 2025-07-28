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
  RotateCcw
} from 'lucide-react';
import { callGeminiAI } from '../../lib/supabase';

interface DatabaseKPICardProps {
  title: string;
  value: string | number;
  status: 'good' | 'warning' | 'error';
  icon: React.ElementType;
  color: string;
  description?: string;
}

function DatabaseKPICard({ title, value, status, icon: Icon, color, description }: DatabaseKPICardProps) {
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

export default function DatabaseModule() {
  const [aiRecommendations, setAiRecommendations] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState('');
  const [backupProgress, setBackupProgress] = useState(0);
  const [isBackupRunning, setIsBackupRunning] = useState(false);

  // KPIs de Base de Datos
  const databaseKPIs = [
    { title: 'Estado General', value: 'Saludable', status: 'good' as const, icon: Database, color: 'bg-green-500', description: 'Todos los sistemas operativos' },
    { title: 'Espacio Utilizado', value: '2.4TB', status: 'warning' as const, icon: HardDrive, color: 'bg-blue-500', description: '78% del total disponible' },
    { title: 'Conexiones Activas', value: '89', status: 'good' as const, icon: Activity, color: 'bg-purple-500', description: 'De 200 máximas' },
    { title: 'Rendimiento', value: '98.7%', status: 'good' as const, icon: Zap, color: 'bg-yellow-500', description: 'Tiempo de respuesta óptimo' },
    { title: 'Último Backup', value: '2h ago', status: 'good' as const, icon: Shield, color: 'bg-indigo-500', description: 'Backup automático exitoso' },
    { title: 'Consultas/seg', value: '1,247', status: 'good' as const, icon: BarChart3, color: 'bg-orange-500', description: 'Promedio últimas 24h' }
  ];

  // Datos de simulación
  const simulationData = [
    { table: 'users', records: 247, size: '12MB', lastUpdate: '2025-01-27' },
    { table: 'clients', records: 247, size: '45MB', lastUpdate: '2025-01-27' },
    { table: 'companies', records: 156, size: '8MB', lastUpdate: '2025-01-27' },
    { table: 'projects', records: 89, size: '15MB', lastUpdate: '2025-01-26' },
    { table: 'documents', records: 1834, size: '234MB', lastUpdate: '2025-01-27' },
    { table: 'payments', records: 567, size: '23MB', lastUpdate: '2025-01-27' },
    { table: 'audit_logs', records: 12456, size: '89MB', lastUpdate: '2025-01-27' }
  ];

  const generateDatabaseInsights = async () => {
    setLoading(true);
    try {
      const prompt = `Como DBA experto de ConstructIA, analiza estos datos de la base de datos:
      - Estado: Saludable
      - Espacio usado: 2.4TB (78% del total)
      - Conexiones activas: 89/200
      - Rendimiento: 98.7%
      - 1,247 consultas/seg promedio
      - Último backup: hace 2 horas
      - 247 clientes, 1,834 documentos, 12,456 logs de auditoría
      
      Genera 3 recomendaciones técnicas para optimización y mantenimiento (máximo 160 palabras).`;
      
      const insights = await callGeminiAI(prompt);
      setAiRecommendations(insights);
    } catch (error) {
      setAiRecommendations('Error al generar recomendaciones. Intenta nuevamente.');
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
      // Simular inyección de datos
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Datos de simulación inyectados exitosamente');
    } catch (error) {
      alert('Error al inyectar datos de simulación');
    } finally {
      setLoading(false);
    }
  };

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
            <p className="text-blue-100 mt-1">Inspector inteligente con soporte IA</p>
          </div>
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8" />
            <button 
              onClick={generateDatabaseInsights}
              disabled={loading}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Analizando...' : 'Actualizar IA'}
            </button>
          </div>
        </div>
        
        {aiRecommendations && (
          <div className="mt-4 bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold mb-2">🔧 Recomendaciones DBA IA:</h3>
            <p className="text-sm text-white/90">{aiRecommendations}</p>
          </div>
        )}
      </div>

      {/* KPIs de Base de Datos */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Estado del Sistema de Base de Datos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          {databaseKPIs.map((kpi, index) => (
            <DatabaseKPICard key={index} {...kpi} />
          ))}
        </div>
      </div>

      {/* Inspector de Base de Datos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Inspector de Base de Datos</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tabla</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registros</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tamaño</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Última Actualización</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {simulationData.map((table, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <Database className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="font-medium text-gray-900">{table.table}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{table.records.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{table.size}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{table.lastUpdate}</td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-800">
                        <BarChart3 className="h-4 w-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-800">
                        <RefreshCw className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
                  <h4 className="font-semibold text-yellow-800">Datos Realistas</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Se inyectarán datos de prueba realistas para testing completo de la plataforma.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">Clientes de prueba</span>
                <span className="text-sm text-gray-600">50 registros</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">Documentos simulados</span>
                <span className="text-sm text-gray-600">500 registros</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">Transacciones</span>
                <span className="text-sm text-gray-600">200 registros</span>
              </div>
            </div>
            
            <button
              onClick={injectSimulationData}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Inyectando...' : 'Inyectar Datos de Simulación'}
            </button>
          </div>
        </div>

        {/* Módulo de Backup */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Sistema de Backup Inteligente</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <Shield className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-green-800">Último Backup</p>
                <p className="text-xs text-green-600">Hace 2 horas</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
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
              
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center">
                <Download className="h-4 w-4 mr-2" />
                Descargar Último Backup
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Módulo de Restauración */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Restauración Inteligente con IA</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-700">Backups Disponibles</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Backup_2025-01-27_14:30</p>
                  <p className="text-xs text-gray-500">2.4TB - Completo</p>
                </div>
                <button className="text-green-600 hover:text-green-800">
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Backup_2025-01-27_08:00</p>
                  <p className="text-xs text-gray-500">2.3TB - Completo</p>
                </div>
                <button className="text-green-600 hover:text-green-800">
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-700">Restauración Selectiva</h4>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm">Solo datos de clientes</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm">Solo configuraciones</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm">Solo logs de auditoría</span>
              </label>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-700">Recomendaciones IA</h4>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <div className="flex items-start">
                <Brain className="h-4 w-4 text-purple-600 mr-2 mt-0.5" />
                <div>
                  <p className="text-xs text-purple-700">
                    La IA recomienda restaurar desde el backup de las 14:30 para máxima integridad de datos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preparación para Producción */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Preparación para Producción</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Estado de Variables de Entorno</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                <span className="text-sm">SUPABASE_URL</span>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                <span className="text-sm">GEMINI_API_KEY</span>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                <span className="text-sm">STRIPE_SECRET_KEY</span>
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              </div>
              <div className="flex items-center justify-between p-2 bg-red-50 rounded">
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
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t">
          <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
            Evaluar Sistema con IA
          </button>
        </div>
      </div>
    </div>
  );
}