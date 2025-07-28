import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  TrendingUp, 
  DollarSign, 
  PieChart, 
  Calendar,
  Download,
  Brain,
  Euro,
  Percent,
  Calculator,
  Receipt,
  Building,
  Smartphone
} from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { callGeminiAI } from '../../lib/supabase';

interface FinancialKPICardProps {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ElementType;
  color: string;
  period?: string;
}

function FinancialKPICard({ title, value, change, trend, icon: Icon, color, period = 'mensual' }: FinancialKPICardProps) {
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
              {trendSymbol}{Math.abs(change)}% vs {period} anterior
            </p>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {period}
            </span>
          </div>
        </div>
        <div className={`p-3 rounded-lg ${color} ml-4`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function FinancialModule() {
  const [aiInsights, setAiInsights] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');

  // KPIs Financieros Principales
  const financialKPIs = [
    { title: 'Ingresos Totales', value: '€47,850', change: 18.5, trend: 'up' as const, icon: Euro, color: 'bg-green-500', period: 'mensual' },
    { title: 'Ingresos Acumulados', value: '€284,200', change: 22.3, trend: 'up' as const, icon: TrendingUp, color: 'bg-emerald-500', period: 'anual' },
    { title: 'Suscripciones Activas', value: '€38,450', change: 12.7, trend: 'up' as const, icon: CreditCard, color: 'bg-blue-500', period: 'mensual' },
    { title: 'Venta de Tokens', value: '€9,400', change: 35.2, trend: 'up' as const, icon: DollarSign, color: 'bg-purple-500', period: 'mensual' },
    { title: 'Comisiones Totales', value: '€2,340', change: 8.9, trend: 'up' as const, icon: Percent, color: 'bg-orange-500', period: 'mensual' },
    { title: 'Margen Neto', value: '€42,180', change: 15.4, trend: 'up' as const, icon: Calculator, color: 'bg-indigo-500', period: 'mensual' },
    { title: 'Recibos Emitidos', value: '247', change: 12.1, trend: 'up' as const, icon: Receipt, color: 'bg-cyan-500', period: 'mensual' },
    { title: 'Tasa Conversión', value: '73.4%', change: 4.2, trend: 'up' as const, icon: PieChart, color: 'bg-pink-500', period: 'mensual' },
    { title: 'Valor Cliente Promedio', value: '€194', change: 9.8, trend: 'up' as const, icon: Building, color: 'bg-teal-500', period: 'mensual' },
    { title: 'Churn Rate', value: '2.1%', change: -12.5, trend: 'up' as const, icon: TrendingUp, color: 'bg-red-500', period: 'mensual' }
  ];

  // Datos para gráficos
  const revenueEvolutionData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Ingresos Totales (€)',
        data: [28400, 31200, 35800, 39200, 43100, 47850],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Suscripciones (€)',
        data: [24200, 26800, 29400, 32100, 35200, 38450],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const paymentMethodsData = {
    labels: ['Stripe', 'PayPal', 'Tarjeta', 'SEPA', 'Bizum'],
    datasets: [{
      data: [45, 28, 15, 8, 4],
      backgroundColor: [
        'rgba(99, 102, 241, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(239, 68, 68, 0.8)'
      ],
      borderWidth: 0
    }]
  };

  const commissionsData = {
    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab', 'Dom'],
    datasets: [{
      label: 'Comisiones por Día (€)',
      data: [145, 189, 234, 198, 267, 156, 123],
      backgroundColor: 'rgba(245, 158, 11, 0.8)',
      borderColor: 'rgb(245, 158, 11)',
      borderWidth: 1
    }]
  };

  const subscriptionPlansData = {
    labels: ['Básico €59', 'Profesional €149', 'Empresarial €299', 'Personalizado €499'],
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

  const generateFinancialInsights = async () => {
    setLoading(true);
    try {
      const prompt = `Como analista financiero de ConstructIA, basándote en estos KPIs:
      - Ingresos mensuales: €47,850 (+18.5%)
      - Ingresos acumulados: €284,200 (+22.3%)
      - Suscripciones: €38,450 (+12.7%)
      - Venta tokens: €9,400 (+35.2%)
      - Margen neto: €42,180 (+15.4%)
      - Tasa conversión: 73.4% (+4.2%)
      - Churn rate: 2.1% (-12.5%)
      
      Genera 3 insights estratégicos financieros y recomendaciones para optimizar ingresos (máximo 180 palabras).`;
      
      const insights = await callGeminiAI(prompt);
      setAiInsights(insights);
    } catch (error) {
      setAiInsights('Error al generar insights financieros. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateFinancialInsights();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header con IA Financiera */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Módulo Financiero BI</h2>
            <p className="text-emerald-100 mt-1">Análisis financiero inteligente con IA</p>
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
              onClick={generateFinancialInsights}
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
            <h3 className="font-semibold mb-2">💰 Insights Financieros IA:</h3>
            <p className="text-sm text-white/90">{aiInsights}</p>
          </div>
        )}
      </div>

      {/* KPIs Financieros */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">KPIs Financieros Principales</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {financialKPIs.map((kpi, index) => (
            <FinancialKPICard key={index} {...kpi} />
          ))}
        </div>
      </div>

      {/* Gráficos Financieros Dinámicos */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Análisis Visual Financiero</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Evolución de Ingresos</h4>
            <Line data={revenueEvolutionData} options={{ responsive: true, maintainAspectRatio: false }} height={250} />
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Métodos de Pago</h4>
            <Doughnut data={paymentMethodsData} options={{ responsive: true, maintainAspectRatio: false }} height={250} />
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Comisiones Diarias</h4>
            <Bar data={commissionsData} options={{ responsive: true, maintainAspectRatio: false }} height={250} />
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Distribución por Planes</h4>
            <Doughnut data={subscriptionPlansData} options={{ responsive: true, maintainAspectRatio: false }} height={250} />
          </div>
        </div>
      </div>

      {/* Configuración de Pasarelas de Pago */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Configuración de Pasarelas de Pago</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Stripe */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center mr-3">
                  <CreditCard className="h-4 w-4 text-white" />
                </div>
                <h4 className="font-semibold">Stripe</h4>
              </div>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Activo</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Comisión:</span>
                <span className="font-medium">2.9% + €0.30</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Transacciones:</span>
                <span className="font-medium">156 este mes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Volumen:</span>
                <span className="font-medium">€21,450</span>
              </div>
            </div>
            <button className="w-full mt-3 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm">
              Configurar
            </button>
          </div>

          {/* PayPal */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center mr-3">
                  <DollarSign className="h-4 w-4 text-white" />
                </div>
                <h4 className="font-semibold">PayPal</h4>
              </div>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Activo</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Comisión:</span>
                <span className="font-medium">3.4% + €0.35</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Transacciones:</span>
                <span className="font-medium">89 este mes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Volumen:</span>
                <span className="font-medium">€13,200</span>
              </div>
            </div>
            <button className="w-full mt-3 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm">
              Configurar
            </button>
          </div>

          {/* SEPA */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center mr-3">
                  <Building className="h-4 w-4 text-white" />
                </div>
                <h4 className="font-semibold">SEPA</h4>
              </div>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Activo</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Comisión:</span>
                <span className="font-medium">€0.50 fija</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Transacciones:</span>
                <span className="font-medium">34 este mes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Volumen:</span>
                <span className="font-medium">€8,900</span>
              </div>
            </div>
            <button className="w-full mt-3 px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm">
              Configurar
            </button>
          </div>
        </div>
      </div>

      {/* Calendario Fiscal con IA */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Calendario Fiscal Inteligente</h3>
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <span className="text-sm text-purple-600 font-medium">Generado con IA</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Calendar className="h-5 w-5 text-yellow-600 mr-2" />
              <span className="font-semibold text-yellow-800">Próximo: 30 Ene</span>
            </div>
            <p className="text-sm text-yellow-700">Declaración IVA Q4 2024</p>
            <p className="text-xs text-yellow-600 mt-1">Estimado: €5,670</p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Calendar className="h-5 w-5 text-blue-600 mr-2" />
              <span className="font-semibold text-blue-800">15 Feb</span>
            </div>
            <p className="text-sm text-blue-700">Retenciones IRPF</p>
            <p className="text-xs text-blue-600 mt-1">Estimado: €2,340</p>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Calendar className="h-5 w-5 text-green-600 mr-2" />
              <span className="font-semibold text-green-800">31 Mar</span>
            </div>
            <p className="text-sm text-green-700">Cierre Fiscal Q1</p>
            <p className="text-xs text-green-600 mt-1">Preparación automática</p>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Calendar className="h-5 w-5 text-purple-600 mr-2" />
              <span className="font-semibold text-purple-800">30 Abr</span>
            </div>
            <p className="text-sm text-purple-700">Declaración Anual</p>
            <p className="text-xs text-purple-600 mt-1">Recordatorio activado</p>
          </div>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-left">
          <div className="flex items-center justify-between mb-4">
            <Download className="h-8 w-8 text-green-600" />
            <span className="text-sm text-gray-500">PDF</span>
          </div>
          <h4 className="font-semibold text-gray-800 mb-2">Reporte Financiero</h4>
          <p className="text-sm text-gray-600">Descargar reporte completo del mes</p>
        </button>
        
        <button className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-left">
          <div className="flex items-center justify-between mb-4">
            <Calculator className="h-8 w-8 text-blue-600" />
            <span className="text-sm text-gray-500">Auto</span>
          </div>
          <h4 className="font-semibold text-gray-800 mb-2">Calcular Impuestos</h4>
          <p className="text-sm text-gray-600">Cálculo automático con IA</p>
        </button>
        
        <button className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-left">
          <div className="flex items-center justify-between mb-4">
            <Receipt className="h-8 w-8 text-purple-600" />
            <span className="text-sm text-gray-500">247</span>
          </div>
          <h4 className="font-semibold text-gray-800 mb-2">Recibos Emitidos</h4>
          <p className="text-sm text-gray-600">Ver todos los recibos del mes</p>
        </button>
      </div>
    </div>
  );
}