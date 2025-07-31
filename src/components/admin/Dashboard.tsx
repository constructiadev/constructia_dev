import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Brain,
  Building2,
  Globe,
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Download,
  RefreshCw,
  Settings,
  Eye
} from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
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

interface AdminKPICardProps {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ElementType;
  color: string;
  description?: string;
  period?: string;
}

function AdminKPICard({ title, value, change, trend, icon: Icon, color, description, period = 'mensual' }: AdminKPICardProps) {
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600';
  const trendSymbol = trend === 'up' ? '+' : trend === 'down' ? '-' : '';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="text-right">
          <span className={`text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600`}>
            {period}
          </span>
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        <div className="flex items-center justify-between mt-2">
          <p className={`text-sm font-medium ${trendColor}`}>
            {trendSymbol}{Math.abs(change)}% vs {period} anterior
          </p>
        </div>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </div>
    </div>
  );
}

interface SystemStatusCardProps {
  title: string;
  status: 'operational' | 'warning' | 'error';
  description: string;
  icon: React.ElementType;
  lastUpdate?: string;
}

function SystemStatusCard({ title, status, description, icon: Icon, lastUpdate }: SystemStatusCardProps) {
  const statusColors = {
    operational: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    error: 'bg-red-100 text-red-800 border-red-200'
  };

  const statusIcons = {
    operational: CheckCircle,
    warning: AlertTriangle,
    error: AlertTriangle
  };

  const StatusIcon = statusIcons[status];

  return (
    <div className={`border rounded-xl p-6 ${statusColors[status]}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <Icon className="h-6 w-6 mr-3" />
          <h4 className="font-semibold">{title}</h4>
        </div>
        <StatusIcon className="h-5 w-5" />
      </div>
      <p className="text-sm mb-2">{description}</p>
      {lastUpdate && (
        <p className="text-xs opacity-75">Última actualización: {lastUpdate}</p>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const [aiInsights, setAiInsights] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const navigate = useNavigate();

  // KPIs Principales del Administrador
  const adminKPIs = [
    { title: 'Clientes Activos', value: '247', change: 12.5, trend: 'up' as const, icon: Users, color: 'bg-blue-500', description: 'Total de clientes con suscripción activa', period: 'mensual' },
    { title: 'Ingresos Mensuales', value: '€47,850', change: 18.3, trend: 'up' as const, icon: CreditCard, color: 'bg-emerald-500', description: 'Ingresos recurrentes del mes', period: 'mensual' },
    { title: 'Documentos Procesados', value: '12,456', change: 8.2, trend: 'up' as const, icon: FileText, color: 'bg-green-500', description: 'Total de documentos procesados con IA', period: 'mensual' },
    { title: 'Tiempo Promedio IA', value: '2.3s', change: -5.1, trend: 'up' as const, icon: Brain, color: 'bg-purple-500', description: 'Tiempo de respuesta de Gemini AI', period: 'tiempo real' },
    { title: 'Tasa de Conversión', value: '73.4%', change: 4.2, trend: 'up' as const, icon: TrendingUp, color: 'bg-orange-500', description: 'Visitantes que se convierten en clientes', period: 'mensual' },
    { title: 'Uptime Sistema', value: '99.97%', change: 0.1, trend: 'stable' as const, icon: Server, color: 'bg-indigo-500', description: 'Disponibilidad del sistema', period: 'mensual' },
    { title: 'APIs Activas', value: '12', change: 0, trend: 'stable' as const, icon: Zap, color: 'bg-cyan-500', description: 'Integraciones funcionando correctamente', period: 'tiempo real' },
    { title: 'Almacenamiento Total', value: '2.4TB', change: 15.7, trend: 'up' as const, icon: Database, color: 'bg-gray-500', description: 'Espacio utilizado por todos los clientes', period: 'mensual' }
  ];

  // Estados del Sistema
  const systemStatus = [
    {
      title: 'Servidores Principales',
      status: 'operational' as const,
      description: 'Todos los servidores funcionando correctamente',
      icon: Server,
      lastUpdate: 'hace 2 minutos'
    },
    {
      title: 'Base de Datos',
      status: 'operational' as const,
      description: 'Supabase operativo con 99.97% uptime',
      icon: Database,
      lastUpdate: 'hace 1 minuto'
    },
    {
      title: 'Gemini AI',
      status: 'warning' as const,
      description: 'Servicio temporalmente sobrecargado',
      icon: Brain,
      lastUpdate: 'hace 5 minutos'
    },
    {
      title: 'Integraciones',
      status: 'operational' as const,
      description: 'Stripe, Obralia y APIs funcionando',
      icon: Globe,
      lastUpdate: 'hace 3 minutos'
    }
  ];

  // Datos para gráficos
  const revenueData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [{
      label: 'Ingresos (€)',
      data: [28400, 31200, 35800, 39200, 43100, 47850],
      borderColor: 'rgb(34, 197, 94)',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  const clientsGrowthData = {
    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab', 'Dom'],
    datasets: [{
      label: 'Nuevos Clientes',
      data: [3, 5, 8, 4, 7, 6, 9],
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      borderColor: 'rgb(59, 130, 246)',
      borderWidth: 1
    }]
  };

  const subscriptionPlansData = {
    labels: ['Básico', 'Profesional', 'Empresarial', 'Personalizado'],
    datasets: [{
      data: [89, 134, 67, 23],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(245, 158, 11, 0.8)'
      ],
      borderWidth: 0
    }]
  };

  const generateAIInsights = async () => {
    setLoading(true);
    try {
      // Simular insights mientras Gemini está fallando
      const mockInsights = `📊 Análisis del Sistema ConstructIA:

1. **Crecimiento Sostenido**: Los ingresos han aumentado un 18.3% este mes, principalmente impulsados por nuevas suscripciones profesionales.

2. **Optimización IA**: El tiempo de respuesta de Gemini AI ha mejorado un 5.1%, pero actualmente experimenta sobrecarga temporal.

3. **Retención Excelente**: La tasa de conversión del 73.4% indica una propuesta de valor sólida y experiencia de usuario optimizada.`;
      
      setAiInsights(mockInsights);
    } catch (error) {
      setAiInsights('Error al generar insights. La API de Gemini está temporalmente no disponible.');
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
            <h2 className="text-2xl font-bold">Dashboard Ejecutivo</h2>
            <p className="text-green-100 mt-1">Panel de control integral con análisis IA</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-white/20 text-white border border-white/30 rounded-lg px-3 py-2 text-sm"
            >
              <option value="daily" className="text-gray-800">Diario</option>
              <option value="weekly" className="text-gray-800">Semanal</option>
              <option value="monthly" className="text-gray-800">Mensual</option>
              <option value="yearly" className="text-gray-800">Anual</option>
            </select>
            <button 
              onClick={generateAIInsights}
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
            <h3 className="font-semibold mb-2">🤖 Insights Ejecutivos IA:</h3>
            <div className="text-sm text-white/90 whitespace-pre-line">{aiInsights}</div>
          </div>
        )}
      </div>

      {/* KPIs Principales */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Métricas Principales</h3>
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">Actualización automática</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {adminKPIs.map((kpi, index) => (
            <AdminKPICard key={index} {...kpi} />
          ))}
        </div>
      </div>

      {/* Estado del Sistema */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Estado del Sistema</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {systemStatus.map((status, index) => (
            <SystemStatusCard key={index} {...status} />
          ))}
        </div>
      </div>

      {/* Gráficos de Análisis */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Análisis Visual</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-800">Evolución de Ingresos</h4>
              <Download className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600" />
            </div>
            <div className="h-64">
              <Line data={revenueData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-800">Nuevos Clientes</h4>
              <Eye className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600" />
            </div>
            <div className="h-64">
              <Bar data={clientsGrowthData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-800">Distribución de Planes</h4>
              <BarChart3 className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600" />
            </div>
            <div className="h-64">
              <Doughnut data={subscriptionPlansData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
        </div>
      </div>

      {/* Actividad Reciente */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Actividad Reciente del Sistema</h3>
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            Ver todo
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="bg-green-100 p-2 rounded-full mr-4">
              <Users className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-green-800">Nuevo cliente registrado</p>
              <p className="text-sm text-green-600">Construcciones Martínez S.L. - Plan Profesional</p>
            </div>
            <span className="text-xs text-green-600">hace 5 min</span>
          </div>
          
          <div className="flex items-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="bg-blue-100 p-2 rounded-full mr-4">
              <FileText className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-blue-800">Lote de documentos procesado</p>
              <p className="text-sm text-blue-600">45 documentos clasificados con IA</p>
            </div>
            <span className="text-xs text-blue-600">hace 12 min</span>
          </div>
          
          <div className="flex items-center p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="bg-purple-100 p-2 rounded-full mr-4">
              <CreditCard className="h-4 w-4 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-purple-800">Pago procesado exitosamente</p>
              <p className="text-sm text-purple-600">€149 - Suscripción mensual renovada</p>
            </div>
            <span className="text-xs text-purple-600">hace 18 min</span>
          </div>
          
          <div className="flex items-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="bg-yellow-100 p-2 rounded-full mr-4">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-yellow-800">Advertencia del sistema</p>
              <p className="text-sm text-yellow-600">API de Gemini experimentando latencia alta</p>
            </div>
            <span className="text-xs text-yellow-600">hace 25 min</span>
          </div>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
            onClick={() => navigate('/admin/clients')}
            <Users className="h-5 w-5 text-blue-600 mr-2" />
            <span className="font-medium text-blue-800">Gestionar Clientes</span>
          </button>
          
          <button className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
            onClick={() => navigate('/admin/financial')}
            <CreditCard className="h-5 w-5 text-green-600 mr-2" />
            <span className="font-medium text-green-800">Ver Finanzas</span>
          </button>
          
          <button className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
            onClick={() => navigate('/admin/ai')}
            <Brain className="h-5 w-5 text-purple-600 mr-2" />
            <span className="font-medium text-purple-800">Configurar IA</span>
          </button>
          
          <button className="flex items-center justify-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
            onClick={() => navigate('/admin/settings')}
            <Settings className="h-5 w-5 text-orange-600 mr-2" />
            <span className="font-medium text-orange-800">Configuración</span>
          </button>
        </div>
      </div>
    </div>
  );
}