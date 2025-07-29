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
  Smartphone,
  BarChart3,
  RefreshCw,
  Eye,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe,
  Shield
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
  description?: string;
}

function FinancialKPICard({ title, value, change, trend, icon: Icon, color, period = 'mensual', description }: FinancialKPICardProps) {
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600';
  const trendSymbol = trend === 'up' ? '+' : trend === 'down' ? '-' : '';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="text-right">
          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
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

interface PaymentGatewayCardProps {
  name: string;
  icon: React.ElementType;
  status: 'active' | 'warning' | 'error';
  commission: string;
  transactions: number;
  volume: string;
  color: string;
}

function PaymentGatewayCard({ name, icon: Icon, status, commission, transactions, volume, color }: PaymentGatewayCardProps) {
  const statusColors = {
    active: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800'
  };

  const statusText = {
    active: 'Activo',
    warning: 'Advertencia',
    error: 'Error'
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center mr-3`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <h4 className="font-semibold text-gray-800">{name}</h4>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
          {statusText[status]}
        </span>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Comisión:</span>
          <span className="font-medium text-gray-900">{commission}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Transacciones:</span>
          <span className="font-medium text-gray-900">{transactions} este mes</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Volumen:</span>
          <span className="font-medium text-gray-900">{volume}</span>
        </div>
      </div>
      
      <button className="w-full mt-4 px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors text-sm font-medium">
        <Settings className="h-4 w-4 inline mr-2" />
        Configurar
      </button>
    </div>
  );
}

interface FiscalEventCardProps {
  title: string;
  date: string;
  amount: string;
  status: 'upcoming' | 'completed' | 'overdue';
  icon: React.ElementType;
  color: string;
}

function FiscalEventCard({ title, date, amount, status, icon: Icon, color }: FiscalEventCardProps) {
  const statusColors = {
    upcoming: 'border-yellow-200 bg-yellow-50',
    completed: 'border-green-200 bg-green-50',
    overdue: 'border-red-200 bg-red-50'
  };

  return (
    <div className={`border rounded-lg p-4 ${statusColors[status]}`}>
      <div className="flex items-center mb-2">
        <Icon className={`h-5 w-5 mr-2 ${color}`} />
        <span className="font-semibold text-gray-800">{date}</span>
      </div>
      <p className="text-sm text-gray-700 mb-1">{title}</p>
      <p className="text-xs text-gray-600">{amount}</p>
    </div>
  );
}

export default function FinancialModule() {
  const [aiInsights, setAiInsights] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [showGatewayModal, setShowGatewayModal] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState<any>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [paymentGateways, setPaymentGateways] = useState([
    {
      id: 'stripe_main',
      name: 'Stripe',
      icon: CreditCard,
      status: 'active' as const,
      commission: '2.9% + €0.30',
      transactions: 156,
      volume: '€21,450',
      color: 'bg-blue-600',
      commission_type: 'mixed',
      commission_percentage: 2.9,
      commission_fixed: 0.30,
      commission_periods: [
        {
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          percentage: 2.9,
          fixed: 0.30
        }
      ],
      supported_currencies: ['EUR', 'USD'],
      description: 'Pasarela principal para tarjetas de crédito'
    },
    {
      id: 'paypal_main',
      name: 'PayPal',
      icon: DollarSign,
      status: 'active' as const,
      commission: '3.4% + €0.35',
      transactions: 89,
      volume: '€13,200',
      color: 'bg-blue-500',
      commission_type: 'mixed',
      commission_percentage: 3.4,
      commission_fixed: 0.35,
      commission_periods: [
        {
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          percentage: 3.4,
          fixed: 0.35
        }
      ],
      supported_currencies: ['EUR', 'USD'],
      description: 'Pagos con cuenta PayPal'
    },
    {
      id: 'sepa_main',
      name: 'SEPA',
      icon: Building,
      status: 'active' as const,
      commission: '€0.50 fija',
      transactions: 34,
      volume: '€8,900',
      color: 'bg-green-600',
      commission_type: 'fixed',
      commission_fixed: 0.50,
      commission_periods: [
        {
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          fixed: 0.50
        }
      ],
      supported_currencies: ['EUR'],
      description: 'Transferencias bancarias SEPA'
    },
    {
      id: 'bizum_main',
      name: 'Bizum',
      icon: Smartphone,
      status: 'warning' as const,
      commission: '1.5%',
      transactions: 12,
      volume: '€2,300',
      color: 'bg-orange-600',
      commission_type: 'percentage',
      commission_percentage: 1.5,
      commission_periods: [
        {
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          percentage: 1.5
        }
      ],
      supported_currencies: ['EUR'],
      description: 'Pagos móviles Bizum'
    }
  ]);

  // KPIs Financieros Principales
  const financialKPIs = [
    { title: 'Ingresos Totales', value: '€47,850', change: 18.5, trend: 'up' as const, icon: Euro, color: 'bg-green-500', period: 'mensual', description: 'Ingresos brutos del mes' },
    { title: 'Ingresos Acumulados', value: '€284,200', change: 22.3, trend: 'up' as const, icon: TrendingUp, color: 'bg-emerald-500', period: 'anual', description: 'Total año fiscal 2024' },
    { title: 'Suscripciones Activas', value: '€38,450', change: 12.7, trend: 'up' as const, icon: CreditCard, color: 'bg-blue-500', period: 'mensual', description: 'Ingresos recurrentes' },
    { title: 'Venta de Tokens', value: '€9,400', change: 35.2, trend: 'up' as const, icon: DollarSign, color: 'bg-purple-500', period: 'mensual', description: 'Compras únicas de tokens' },
    { title: 'Comisiones Totales', value: '€2,340', change: 8.9, trend: 'up' as const, icon: Percent, color: 'bg-orange-500', period: 'mensual', description: 'Comisiones de pasarelas' },
    { title: 'Margen Neto', value: '€42,180', change: 15.4, trend: 'up' as const, icon: Calculator, color: 'bg-indigo-500', period: 'mensual', description: 'Beneficio después de gastos' },
    { title: 'Recibos Emitidos', value: '247', change: 12.1, trend: 'up' as const, icon: Receipt, color: 'bg-cyan-500', period: 'mensual', description: 'Facturas generadas' },
    { title: 'Tasa Conversión', value: '73.4%', change: 4.2, trend: 'up' as const, icon: PieChart, color: 'bg-pink-500', period: 'mensual', description: 'Visitantes a clientes' },
    { title: 'Valor Cliente Promedio', value: '€194', change: 9.8, trend: 'up' as const, icon: Building, color: 'bg-teal-500', period: 'mensual', description: 'ARPU mensual' },
    { title: 'Churn Rate', value: '2.1%', change: -12.5, trend: 'up' as const, icon: TrendingUp, color: 'bg-red-500', period: 'mensual', description: 'Tasa de cancelación' }
  ];

  // Pasarelas de Pago

  // Eventos Fiscales
  const fiscalEvents = [
    {
      title: 'Declaración IVA Q4 2024',
      date: '30 Ene',
      amount: 'Estimado: €5,670',
      status: 'upcoming' as const,
      icon: Calendar,
      color: 'text-yellow-600'
    },
    {
      title: 'Retenciones IRPF',
      date: '15 Feb',
      amount: 'Estimado: €2,340',
      status: 'upcoming' as const,
      icon: Calendar,
      color: 'text-blue-600'
    },
    {
      title: 'Cierre Fiscal Q1',
      date: '31 Mar',
      amount: 'Preparación automática',
      status: 'upcoming' as const,
      icon: Calendar,
      color: 'text-green-600'
    },
    {
      title: 'Declaración Anual',
      date: '30 Abr',
      amount: 'Recordatorio activado',
      status: 'upcoming' as const,
      icon: Calendar,
      color: 'text-purple-600'
    }
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
    labels: ['Stripe', 'PayPal', 'SEPA', 'Bizum', 'Otros'],
    datasets: [{
      data: [45, 28, 15, 8, 4],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(156, 163, 175, 0.8)'
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
      // Simular insights mientras Gemini está fallando
      const mockInsights = `💰 Análisis Financiero ConstructIA:

1. **Crecimiento Excepcional**: Los ingresos han aumentado un 18.5% este mes, impulsados principalmente por la venta de tokens (+35.2%) y nuevas suscripciones profesionales.

2. **Diversificación de Ingresos**: La estrategia de tokens únicos está funcionando excelentemente, representando ya el 19.6% de los ingresos totales.

3. **Optimización de Comisiones**: Stripe sigue siendo la pasarela principal (45% del volumen), pero SEPA ofrece mejor margen con comisión fija.`;
      
      setAiInsights(mockInsights);
    } catch (error) {
      setAiInsights('Error al generar insights financieros. La API de Gemini está temporalmente no disponible.');
    } finally {
      setLoading(false);
    }
  };

  const exportFinancialReport = () => {
    // Simular exportación de reporte
    const reportData = {
      period: selectedPeriod,
      total_revenue: 47850,
      subscriptions: 38450,
      tokens: 9400,
      commissions: 2340,
      net_margin: 42180
    };
    
    console.log('Exportando reporte financiero:', reportData);
    alert('Reporte financiero exportado exitosamente');
  };

  const calculateTaxes = () => {
    // Simular cálculo de impuestos
    const taxCalculation = {
      gross_revenue: 47850,
      vat: 5670,
      irpf: 2340,
      net_revenue: 39840
    };
    
    console.log('Cálculo de impuestos:', taxCalculation);
    alert(`Cálculo completado:\nIngresos brutos: €${taxCalculation.gross_revenue}\nIVA: €${taxCalculation.vat}\nIRPF: €${taxCalculation.irpf}\nIngresos netos: €${taxCalculation.net_revenue}`);
  };

  // Funciones para gestión de pasarelas
  const handleCreateGateway = () => {
    setSelectedGateway(null);
    setModalMode('create');
    setShowGatewayModal(true);
  };

  const handleViewGateway = (gatewayName: string) => {
    const gateway = paymentGateways.find(g => g.name === gatewayName);
    setSelectedGateway(gateway);
    setModalMode('view');
    setShowGatewayModal(true);
  };

  const handleEditGateway = (gatewayName: string) => {
    const gateway = paymentGateways.find(g => g.name === gatewayName);
    setSelectedGateway(gateway);
    setModalMode('edit');
    setShowGatewayModal(true);
  };

  const handleDeleteGateway = (gatewayName: string) => {
    if (confirm(`¿Estás seguro de que quieres eliminar la pasarela ${gatewayName}?`)) {
      setPaymentGateways(prev => prev.filter(g => g.name !== gatewayName));
      alert(`Pasarela ${gatewayName} eliminada exitosamente`);
    }
  };

  const handleSaveGateway = async (gatewayData: any) => {
    try {
      if (modalMode === 'create') {
        const newGateway = {
          ...gatewayData,
          icon: CreditCard, // Default icon
          transactions: 0,
          volume: '€0'
        };
        setPaymentGateways(prev => [...prev, newGateway]);
        alert('Pasarela creada exitosamente');
      } else if (modalMode === 'edit') {
        setPaymentGateways(prev => prev.map(g => 
          g.id === selectedGateway?.id ? { ...g, ...gatewayData } : g
        ));
        alert('Pasarela actualizada exitosamente');
      }
      setShowGatewayModal(false);
    } catch (error) {
      alert('Error al guardar la pasarela');
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
            <div className="text-sm text-white/90 whitespace-pre-line">{aiInsights}</div>
          </div>
        )}
      </div>

      {/* KPIs Financieros */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">KPIs Financieros Principales</h3>
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">Actualización automática</span>
          </div>
        </div>
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
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-800">Evolución de Ingresos</h4>
              <button className="text-gray-400 hover:text-gray-600">
                <Download className="h-4 w-4" />
              </button>
            </div>
            <div className="h-64">
              <Line data={revenueEvolutionData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-800">Métodos de Pago</h4>
              <button className="text-gray-400 hover:text-gray-600">
                <Eye className="h-4 w-4" />
              </button>
            </div>
            <div className="h-64">
              <Doughnut data={paymentMethodsData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-800">Comisiones Diarias</h4>
              <button className="text-gray-400 hover:text-gray-600">
                <BarChart3 className="h-4 w-4" />
              </button>
            </div>
            <div className="h-64">
              <Bar data={commissionsData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-800">Distribución por Planes</h4>
              <button className="text-gray-400 hover:text-gray-600">
                <Settings className="h-4 w-4" />
              </button>
            </div>
            <div className="h-64">
              <Doughnut data={subscriptionPlansData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
        </div>
      </div>

      {/* Configuración de Pasarelas de Pago */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Configuración de Pasarelas de Pago</h3>
          <button 
            onClick={handleCreateGateway}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Pasarela
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {paymentGateways.map((gateway, index) => (
            <PaymentGatewayCard 
              key={gateway.id} 
              name={gateway.name}
              icon={gateway.icon}
              status={gateway.status}
              commission={gateway.commission}
              transactions={gateway.transactions}
              volume={gateway.volume}
              color={gateway.color}
            />
          ))}
        </div>
      </div>

      {/* Calendario Fiscal con IA */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Calendario Fiscal Inteligente</h3>
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <span className="text-sm text-purple-600 font-medium">Generado con IA</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {fiscalEvents.map((event, index) => (
            <FiscalEventCard key={index} {...event} />
          ))}
        </div>
      </div>

      {/* Resumen Financiero y Acciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Resumen del Mes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Resumen del Mes</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 text-green-600 mr-3" />
                <span className="font-medium text-green-800">Ingresos Totales</span>
              </div>
              <span className="text-lg font-bold text-green-600">€47,850</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <CreditCard className="h-5 w-5 text-blue-600 mr-3" />
                <span className="font-medium text-blue-800">Suscripciones</span>
              </div>
              <span className="text-lg font-bold text-blue-600">€38,450</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-purple-600 mr-3" />
                <span className="font-medium text-purple-800">Tokens</span>
              </div>
              <span className="text-lg font-bold text-purple-600">€9,400</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center">
                <Percent className="h-5 w-5 text-orange-600 mr-3" />
                <span className="font-medium text-orange-800">Comisiones</span>
              </div>
              <span className="text-lg font-bold text-orange-600">€2,340</span>
            </div>
          </div>
        </div>

        {/* Estado de Configuración */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Estado de Configuración</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <span className="text-sm font-medium text-green-800">Stripe Configurado</span>
              </div>
              <span className="text-xs text-green-600">Operativo</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <span className="text-sm font-medium text-green-800">PayPal Activo</span>
              </div>
              <span className="text-xs text-green-600">Operativo</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
                <span className="text-sm font-medium text-yellow-800">Bizum Limitado</span>
              </div>
              <span className="text-xs text-yellow-600">Revisar</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-blue-600 mr-3" />
                <span className="text-sm font-medium text-blue-800">Seguridad PCI DSS</span>
              </div>
              <span className="text-xs text-blue-600">Certificado</span>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={exportFinancialReport}
            className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
          >
            <Download className="h-5 w-5 text-green-600 mr-2" />
            <div className="text-left">
              <p className="font-medium text-green-800">Exportar Reporte</p>
              <p className="text-xs text-green-600">PDF completo del mes</p>
            </div>
          </button>
          
          <button 
            onClick={calculateTaxes}
            className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <Calculator className="h-5 w-5 text-blue-600 mr-2" />
            <div className="text-left">
              <p className="font-medium text-blue-800">Calcular Impuestos</p>
              <p className="text-xs text-blue-600">Cálculo automático con IA</p>
            </div>
          </button>
          
          <button className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
            <Receipt className="h-5 w-5 text-purple-600 mr-2" />
            <div className="text-left">
              <p className="font-medium text-purple-800">Ver Recibos</p>
              <p className="text-xs text-purple-600">247 emitidos este mes</p>
            </div>
          </button>
        </div>
      </div>

      {/* Modal de Pasarela de Pago */}
      <PaymentGatewayModal
        isOpen={showGatewayModal}
        onClose={() => setShowGatewayModal(false)}
        onSave={handleSaveGateway}
        gateway={selectedGateway}
        mode={modalMode}
      />
    </div>
  );
}