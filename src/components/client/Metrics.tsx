import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  FileText, 
  Clock,
  CheckCircle,
  Brain,
  HardDrive,
  Zap,
  Calendar,
  Download,
  Building2,
  FolderOpen
} from 'lucide-react';
import { Line, Bar, Doughnut, Area } from 'react-chartjs-2';
import { callGeminiAI } from '../../lib/supabase';

interface ClientKPICardProps {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ElementType;
  color: string;
  description?: string;
}

function ClientKPICard({ title, value, change, trend, icon: Icon, color, description }: ClientKPICardProps) {
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600';
  const trendSymbol = trend === 'up' ? '+' : trend === 'down' ? '-' : '';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <div className="flex items-center justify-between mt-2">
            <p className={`text-sm font-medium ${trendColor}`}>
              {trendSymbol}{Math.abs(change)}% vs mes anterior
            </p>
          </div>
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color} ml-4`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function Metrics() {
  const [aiInsights, setAiInsights] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');

  // KPIs del Cliente
  const clientKPIs = [
    { title: 'Documentos Procesados', value: '127', change: 15.2, trend: 'up' as const, icon: FileText, color: 'bg-blue-500', description: 'Total este mes' },
    { title: 'Proyectos Activos', value: '3', change: 0, trend: 'stable' as const, icon: FolderOpen, color: 'bg-green-500', description: 'En desarrollo' },
    { title: 'Precisión IA Promedio', value: '94.7%', change: 2.1, trend: 'up' as const, icon: Brain, color: 'bg-purple-500', description: 'Confianza clasificación' },
    { title: 'Tiempo Procesamiento', value: '2.1s', change: -8.3, trend: 'up' as const, icon: Clock, color: 'bg-orange-500', description: 'Promedio por documento' },
    { title: 'Almacenamiento Usado', value: '850MB', change: 12.5, trend: 'up' as const, icon: HardDrive, color: 'bg-indigo-500', description: 'De 1GB disponible' },
    { title: 'Tasa de Éxito', value: '96.8%', change: 1.2, trend: 'up' as const, icon: CheckCircle, color: 'bg-emerald-500', description: 'Documentos validados' },
    { title: 'Tokens Disponibles', value: '450', change: -15.6, trend: 'down' as const, icon: Zap, color: 'bg-yellow-500', description: 'Para procesamiento IA' },
    { title: 'Subidas a Obralia', value: '89', change: 18.7, trend: 'up' as const, icon: TrendingUp, color: 'bg-cyan-500', description: 'Exitosas este mes' }
  ];

  // Datos para gráficos
  const documentsEvolutionData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [{
      label: 'Documentos Procesados',
      data: [45, 67, 89, 103, 115, 127],
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  const documentTypesData = {
    labels: ['Certificados', 'Facturas', 'DNI/ID', 'Contratos', 'Seguros', 'Otros'],
    datasets: [{
      data: [32, 28, 18, 15, 8, 4],
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(156, 163, 175, 0.8)'
      ],
      borderWidth: 0
    }]
  };

  const processingTimeData = {
    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab', 'Dom'],
    datasets: [{
      label: 'Tiempo Promedio (segundos)',
      data: [2.3, 1.9, 2.1, 2.4, 1.8, 2.2, 2.0],
      backgroundColor: 'rgba(245, 158, 11, 0.8)',
      borderColor: 'rgb(245, 158, 11)',
      borderWidth: 1
    }]
  };

  const storageUsageData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [{
      label: 'Almacenamiento (MB)',
      data: [234, 345, 456, 567, 678, 850],
      borderColor: 'rgb(99, 102, 241)',
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  const generateClientInsights = async () => {
    setLoading(true);
    try {
      const prompt = `Como analista de datos de ConstructIA, analiza estas métricas del cliente:
      - 127 documentos procesados (+15.2%)
      - 3 proyectos activos
      - 94.7% precisión IA promedio (+2.1%)
      - 2.1s tiempo procesamiento (-8.3%)
      - 850MB almacenamiento usado (+12.5%)
      - 96.8% tasa de éxito (+1.2%)
      - 450 tokens disponibles (-15.6%)
      - 89 subidas exitosas a Obralia (+18.7%)
      
      Genera 3 insights personalizados y recomendaciones para optimizar su uso de la plataforma (máximo 150 palabras).`;
      
      const insights = await callGeminiAI(prompt);
      setAiInsights(insights);
    } catch (error) {
      setAiInsights('Error al generar insights personalizados. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateClientInsights();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header con IA Personalizada */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Mis Métricas</h2>
            <p className="text-blue-100 mt-1">Análisis personalizado de tu actividad con IA</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-white/20 text-white border border-white/30 rounded-lg px-3 py-2 text-sm"
            >
              <option value="weekly" className="text-gray-800">Semanal</option>
              <option value="monthly" className="text-gray-800">Mensual</option>
              <option value="quarterly" className="text-gray-800">Trimestral</option>
              <option value="yearly" className="text-gray-800">Anual</option>
            </select>
            <button 
              onClick={generateClientInsights}
              disabled={loading}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center"
            >
              <Brain className="h-4 w-4 mr-2" />
              {loading ? 'Analizando...' : 'Actualizar IA'}
            </button>
          </div>
        </div>
        
        {aiInsights && (
          <div className="mt-4 bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold mb-2">🎯 Insights Personalizados IA:</h3>
            <p className="text-sm text-white/90">{aiInsights}</p>
          </div>
        )}
      </div>

      {/* KPIs Principales */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Resumen de Actividad</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {clientKPIs.map((kpi, index) => (
            <ClientKPICard key={index} {...kpi} />
          ))}
        </div>
      </div>

      {/* Gráficos de Análisis */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Análisis Visual</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Evolución de Documentos</h4>
            <Line data={documentsEvolutionData} options={{ responsive: true, maintainAspectRatio: false }} height={250} />
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Tipos de Documentos</h4>
            <Doughnut data={documentTypesData} options={{ responsive: true, maintainAspectRatio: false }} height={250} />
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Tiempo de Procesamiento</h4>
            <Bar data={processingTimeData} options={{ responsive: true, maintainAspectRatio: false }} height={250} />
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Uso de Almacenamiento</h4>
            <Line data={storageUsageData} options={{ responsive: true, maintainAspectRatio: false }} height={250} />
          </div>
        </div>
      </div>

      {/* Resumen por Proyectos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Actividad por Proyecto</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <Building2 className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <p className="font-medium text-gray-800">Edificio Residencial Centro</p>
                <p className="text-sm text-gray-600">Construcciones García S.L.</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900">87 docs</p>
              <p className="text-sm text-green-600">+12 este mes</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <Building2 className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <p className="font-medium text-gray-800">Reforma Oficinas Norte</p>
                <p className="text-sm text-gray-600">Construcciones García S.L.</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900">34 docs</p>
              <p className="text-sm text-blue-600">+8 este mes</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <Building2 className="h-5 w-5 text-purple-600 mr-3" />
              <div>
                <p className="font-medium text-gray-800">Centro Comercial Valencia</p>
                <p className="text-sm text-gray-600">Reformas Integrales López</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900">6 docs</p>
              <p className="text-sm text-purple-600">+6 este mes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Objetivos y Recomendaciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Objetivos del Mes</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Documentos procesados</span>
                <span className="text-sm text-gray-600">127/150</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Precisión IA</span>
                <span className="text-sm text-gray-600">94.7%/95%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '99%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Proyectos completados</span>
                <span className="text-sm text-gray-600">1/2</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '50%' }}></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recomendaciones</h3>
          <div className="space-y-3">
            <div className="flex items-start p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-800">Excelente precisión IA</p>
                <p className="text-xs text-green-700">Tu tasa de clasificación está por encima del promedio</p>
              </div>
            </div>
            
            <div className="flex items-start p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <Zap className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Tokens bajos</p>
                <p className="text-xs text-yellow-700">Considera adquirir más tokens para el próximo mes</p>
              </div>
            </div>
            
            <div className="flex items-start p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800">Crecimiento constante</p>
                <p className="text-xs text-blue-700">Tu actividad ha aumentado un 15% este mes</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
            <Download className="h-5 w-5 text-blue-600 mr-2" />
            <span className="font-medium text-blue-800">Exportar Métricas</span>
          </button>
          
          <button className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
            <BarChart3 className="h-5 w-5 text-green-600 mr-2" />
            <span className="font-medium text-green-800">Reporte Mensual</span>
          </button>
          
          <button className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
            <Calendar className="h-5 w-5 text-purple-600 mr-2" />
            <span className="font-medium text-purple-800">Programar Análisis</span>
          </button>
        </div>
      </div>
    </div>
  );
}