import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  CreditCard, 
  Activity,
  TrendingUp,
  Database,
  Shield,
  Zap,
  Server,
  Brain
} from 'lucide-react';
import { Line, Bar, Doughnut, Area } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { callGeminiAI } from '../../lib/supabase';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface KPICardProps {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ElementType;
  color: string;
}

function KPICard({ title, value, change, trend, icon: Icon, color }: KPICardProps) {
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600';
  const trendSymbol = trend === 'up' ? '+' : trend === 'down' ? '-' : '';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <p className={`text-sm font-medium mt-1 ${trendColor}`}>
            {trendSymbol}{Math.abs(change)}% vs mes anterior
          </p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [aiInsights, setAiInsights] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // KPIs Operativos Principales (Top 10)
  const operationalKPIs = [
    { title: 'Clientes Activos', value: '247', change: 12.5, trend: 'up' as const, icon: Users, color: 'bg-blue-500' },
    { title: 'Documentos Procesados', value: '1,834', change: 8.2, trend: 'up' as const, icon: FileText, color: 'bg-green-500' },
    { title: 'Ingresos Mensuales', value: '€18,450', change: 15.3, trend: 'up' as const, icon: CreditCard, color: 'bg-emerald-500' },
    { title: 'Tiempo Promedio IA', value: '2.3s', change: -5.1, trend: 'up' as const, icon: Brain, color: 'bg-yellow-500' },
    { title: 'Tasa Conversión', value: '73.4%', change: 4.2, trend: 'up' as const, icon: TrendingUp, color: 'bg-purple-500' },
    { title: 'Almacenamiento Usado', value: '834GB', change: 18.7, trend: 'up' as const, icon: Database, color: 'bg-indigo-500' },
    { title: 'Uptime Sistema', value: '99.97%', change: 0.1, trend: 'stable' as const, icon: Server, color: 'bg-gray-500' },
    { title: 'Transacciones/día', value: '156', change: 9.8, trend: 'up' as const, icon: Activity, color: 'bg-orange-500' },
    { title: 'APIs Activas', value: '12', change: 0, trend: 'stable' as const, icon: Zap, color: 'bg-cyan-500' },
    { title: 'Nivel Seguridad', value: 'Alto', change: 0, trend: 'stable' as const, icon: Shield, color: 'bg-red-500' }
  ];

  // KPIs Secundarios (Bottom 10)
  const secondaryKPIs = [
    { title: 'Nuevos Registros', value: '23', change: 28.3, trend: 'up' as const, icon: Users, color: 'bg-blue-400' },
    { title: 'Documentos Pendientes', value: '45', change: -12.1, trend: 'up' as const, icon: FileText, color: 'bg-yellow-400' },
    { title: 'Tokens Vendidos', value: '1,247', change: 22.4, trend: 'up' as const, icon: Zap, color: 'bg-purple-400' },
    { title: 'Satisfacción Cliente', value: '4.8/5', change: 2.1, trend: 'up' as const, icon: TrendingUp, color: 'bg-green-400' },
    { title: 'Errores IA', value: '0.3%', change: -15.2, trend: 'up' as const, icon: Brain, color: 'bg-red-400' },
    { title: 'Tiempo Respuesta', value: '145ms', change: -8.7, trend: 'up' as const, icon: Activity, color: 'bg-indigo-400' },
    { title: 'Backups Completados', value: '7/7', change: 0, trend: 'stable' as const, icon: Database, color: 'bg-gray-400' },
    { title: 'Sesiones Activas', value: '89', change: 5.6, trend: 'up' as const, icon: Server, color: 'bg-orange-400' },
    { title: 'Integraciones Activas', value: '3/3', change: 0, trend: 'stable' as const, icon: Zap, color: 'bg-cyan-400' },
    { title: 'Alertas Seguridad', value: '0', change: -100, trend: 'up' as const, icon: Shield, color: 'bg-emerald-400' }
  ];

  // Datos para gráficos
  const revenueData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [{
      label: 'Ingresos (€)',
      data: [12400, 13200, 14800, 16200, 17100, 18450],
      borderColor: 'rgb(34, 197, 94)',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  const documentsData = {
    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab', 'Dom'],
    datasets: [{
      label: 'Documentos Procesados',
      data: [45, 67, 89, 123, 98, 76, 54],
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      borderColor: 'rgb(59, 130, 246)',
      borderWidth: 1
    }]
  };

  const clientsData = {
    labels: ['Básico', 'Profesional', 'Empresarial', 'Personalizado'],
    datasets: [{
      data: [89, 134, 67, 23],
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(245, 158, 11, 0.8)'
      ],
      borderWidth: 0
    }]
  };

  const performanceData = {
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
    datasets: [{
      label: 'CPU %',
      data: [23, 18, 45, 67, 89, 34],
      borderColor: 'rgb(168, 85, 247)',
      backgroundColor: 'rgba(168, 85, 247, 0.1)',
      fill: true
    }, {
      label: 'Memoria %',
      data: [34, 28, 56, 78, 92, 45],
      borderColor: 'rgb(245, 158, 11)',
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
      fill: true
    }]
  };

  const generateAIInsights = async () => {
    setLoading(true);
    try {
      const prompt = `Basándote en estos KPIs de ConstructIA:
      - 247 clientes activos (+12.5%)
      - 1,834 documentos procesados (+8.2%)
      - €18,450 ingresos mensuales (+15.3%)
      - 2.3s tiempo promedio IA (-5.1%)
      - 73.4% tasa conversión (+4.2%)
      
      Genera 3 insights estratégicos breves para mejorar el negocio (máximo 150 palabras total).`;
      
      const insights = await callGeminiAI(prompt);
      setAiInsights(insights);
    } catch (error) {
      setAiInsights('Error al generar insights. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateAIInsights();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header con IA Insights */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Dashboard BI - ConstructIA</h2>
            <p className="text-green-100 mt-1">Análisis inteligente en tiempo real</p>
          </div>
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8" />
            <button 
              onClick={generateAIInsights}
              disabled={loading}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Generando...' : 'Actualizar IA'}
            </button>
          </div>
        </div>
        
        {aiInsights && (
          <div className="mt-4 bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold mb-2">💡 Insights Estratégicos IA:</h3>
            <p className="text-sm text-white/90">{aiInsights}</p>
          </div>
        )}
      </div>

      {/* KPIs Operativos Principales */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">KPIs Operativos Principales</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {operationalKPIs.map((kpi, index) => (
            <KPICard key={index} {...kpi} />
          ))}
        </div>
      </div>

      {/* Gráficos Dinámicos */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Análisis Visual Dinámico</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Evolución de Ingresos</h4>
            <Line data={revenueData} options={{ responsive: true, maintainAspectRatio: false }} height={200} />
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Documentos por Día</h4>
            <Bar data={documentsData} options={{ responsive: true, maintainAspectRatio: false }} height={200} />
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Distribución de Clientes</h4>
            <Doughnut data={clientsData} options={{ responsive: true, maintainAspectRatio: false }} height={200} />
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Rendimiento del Sistema</h4>
            <Line data={performanceData} options={{ responsive: true, maintainAspectRatio: false }} height={200} />
          </div>
        </div>
      </div>

      {/* KPIs Secundarios */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Métricas Complementarias</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {secondaryKPIs.map((kpi, index) => (
            <KPICard key={index} {...kpi} />
          ))}
        </div>
      </div>

      {/* Panel de Estado del Sistema */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Estado del Sistema en Tiempo Real</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Server className="h-8 w-8 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-800">Servidores</h4>
            <p className="text-green-600 font-medium">Operativo</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Database className="h-8 w-8 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-800">Base de Datos</h4>
            <p className="text-blue-600 font-medium">Saludable</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Brain className="h-8 w-8 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-800">IA Gemini</h4>
            <p className="text-purple-600 font-medium">Activa</p>
          </div>
        </div>
      </div>
    </div>
  );
}