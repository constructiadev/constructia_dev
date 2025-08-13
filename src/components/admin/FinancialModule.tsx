import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  Receipt, 
  Users,
  Building,
  Calendar,
  BarChart3,
  PieChart,
  RefreshCw,
  Download,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { 
  getAllReceipts, 
  getAllPaymentGateways, 
  getAllClients,
  calculateDynamicKPIs 
} from '../../lib/supabase';
import { geminiAI } from '../../lib/gemini';

interface FinancialKPI {
  id: string;
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ElementType;
  color: string;
  description: string;
}

const FinancialModule: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [kpis, setKpis] = useState<FinancialKPI[]>([]);

  useEffect(() => {
    loadFinancialData();
  }, []);

  const loadFinancialData = async () => {
    try {
      setLoading(true);

      const [receiptsData, gatewaysData, clientsData, dynamicKPIs] = await Promise.all([
        getAllReceipts(),
        getAllPaymentGateways(),
        getAllClients(),
        calculateDynamicKPIs()
      ]);

      // Calcular KPIs financieros
      const totalRevenue = receiptsData?.reduce((sum, receipt) => sum + parseFloat(receipt.amount || 0), 0) || 0;
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const monthlyRevenue = receiptsData?.filter(receipt => {
        const receiptDate = new Date(receipt.created_at);
        return receiptDate.getMonth() === currentMonth && receiptDate.getFullYear() === currentYear;
      }).reduce((sum, receipt) => sum + parseFloat(receipt.amount || 0), 0) || 0;

      const totalTransactions = receiptsData?.length || 0;
      const averageTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
      const activeClients = clientsData?.filter(client => client.subscription_status === 'active').length || 0;

      // KPIs financieros
      const financialKPIs: FinancialKPI[] = [
        {
          id: 'total-revenue',
          title: 'Ingresos Totales',
          value: `€${totalRevenue.toFixed(0)}`,
          change: 18.2,
          trend: 'up',
          icon: DollarSign,
          color: 'bg-blue-500',
          description: 'Ingresos acumulados'
        },
        {
          id: 'monthly-revenue',
          title: 'Ingresos Mensuales',
          value: `€${monthlyRevenue.toFixed(0)}`,
          change: 23.5,
          trend: 'up',
          icon: Calendar,
          color: 'bg-green-500',
          description: 'Ingresos del mes actual'
        },
        {
          id: 'avg-transaction',
          title: 'Valor Promedio',
          value: `€${averageTransactionValue.toFixed(0)}`,
          change: 12.8,
          trend: 'up',
          icon: TrendingUp,
          color: 'bg-blue-500',
          description: 'Valor promedio por transacción'
        },
        {
          id: 'total-transactions',
          title: 'Total Transacciones',
          value: totalTransactions,
          change: 15.7,
          trend: 'up',
          icon: Receipt,
          color: 'bg-purple-500',
          description: 'Transacciones procesadas'
        },
        {
          id: 'active-clients',
          title: 'Clientes Activos',
          value: activeClients,
          change: 8.3,
          trend: 'up',
          icon: Users,
          color: 'bg-orange-500',
          description: 'Clientes con suscripción activa'
        },
        {
          id: 'mrr',
          title: 'MRR',
          value: `€${(monthlyRevenue * 0.8).toFixed(0)}`,
          change: 19.4,
          trend: 'up',
          icon: BarChart3,
          color: 'bg-blue-500',
          description: 'Ingresos mensuales recurrentes'
        },
        {
          id: 'churn-rate',
          title: 'Tasa de Abandono',
          value: '2.3%',
          change: -5.2,
          trend: 'up',
          icon: TrendingUp,
          color: 'bg-green-500',
          description: 'Clientes que cancelan mensualmente'
        },
        {
          id: 'ltv',
          title: 'LTV',
          value: `€${(averageTransactionValue * 12).toFixed(0)}`,
          change: 25.1,
          trend: 'up',
          icon: Building,
          color: 'bg-cyan-500',
          description: 'Valor de vida del cliente'
        },
        {
          id: 'conversion-rate',
          title: 'Tasa de Conversión',
          value: '12.4%',
          change: 3.7,
          trend: 'up',
          icon: TrendingUp,
          color: 'bg-purple-500',
          description: 'Visitantes que se convierten'
        },
        {
          id: 'payment-success',
          title: 'Éxito de Pagos',
          value: '98.7%',
          change: 1.2,
          trend: 'up',
          icon: CreditCard,
          color: 'bg-green-500',
          description: 'Pagos procesados exitosamente'
        }
      ];

      setKpis(financialKPIs);

    } catch (error) {
      console.error('Error loading financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadFinancialData();
    setRefreshing(false);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUp className="w-4 h-4 text-green-500" />;
      case 'down': return <ArrowDown className="w-4 h-4 text-red-500" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando módulo financiero...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Verde Ejecutivo */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Módulo Financiero</h1>
            <p className="text-green-100 mb-4">
              Panel integral de análisis financiero y métricas de ingresos
            </p>
            <div className="space-y-1 text-sm text-green-100">
              <p>• Análisis de ingresos y rentabilidad en tiempo real</p>
              <p>• Métricas de conversión y retención de clientes</p>
              <p>• Monitoreo de transacciones y métodos de pago</p>
              <p>• Proyecciones financieras con inteligencia artificial</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={refreshData}
              disabled={refreshing}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Actualizando...' : 'Actualizar'}
            </button>
            <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </button>
          </div>
        </div>
      </div>

      {/* KPIs Financieros - 10 tarjetas en 2 filas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${kpi.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center space-x-1">
                  {getTrendIcon(kpi.trend)}
                  <span className={`text-sm font-medium ${
                    kpi.change > 0 ? 'text-green-600' : kpi.change < 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {kpi.change > 0 ? '+' : ''}{kpi.change}%
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">{kpi.title}</h3>
                <p className="text-2xl font-bold text-gray-900 mb-1">{kpi.value}</p>
                <p className="text-xs text-gray-500">{kpi.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Gráficos Financieros */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Evolución de Ingresos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Evolución de Ingresos</h3>
          <div className="h-64 flex items-end justify-between space-x-2">
            {[
              { month: 'Ene', value: 12450, color: 'bg-green-400' },
              { month: 'Feb', value: 14200, color: 'bg-green-500' },
              { month: 'Mar', value: 16800, color: 'bg-green-600' },
              { month: 'Abr', value: 15200, color: 'bg-green-500' },
              { month: 'May', value: 18900, color: 'bg-green-700' },
              { month: 'Jun', value: 21300, color: 'bg-green-800' },
              { month: 'Jul', value: 23100, color: 'bg-green-900' }
            ].map((item, index) => {
              const maxValue = 23100;
              const height = (item.value / maxValue) * 100;
              
              return (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div 
                    className={`w-full ${item.color} rounded-t transition-all duration-500 mb-2`}
                    style={{ height: `${height}%` }}
                  ></div>
                  <span className="text-xs text-gray-500">{item.month}</span>
                  <span className="text-xs font-medium text-gray-700">€{(item.value / 1000).toFixed(0)}K</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Métodos de Pago */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Métodos de Pago</h3>
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-40 h-40">
              <div className="absolute inset-0 rounded-full" style={{
                background: `conic-gradient(
                  #10b981 0deg 180deg,
                  #3b82f6 180deg 270deg,
                  #8b5cf6 270deg 315deg,
                  #f59e0b 315deg 360deg
                )`
              }}></div>
              <div className="absolute inset-6 bg-white rounded-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">100%</div>
                  <div className="text-xs text-gray-500">Pagos</div>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">Stripe</span>
              </div>
              <span className="text-sm font-medium text-gray-900">50%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">SEPA</span>
              </div>
              <span className="text-sm font-medium text-gray-900">25%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">PayPal</span>
              </div>
              <span className="text-sm font-medium text-gray-900">15%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">Bizum</span>
              </div>
              <span className="text-sm font-medium text-gray-900">10%</span>
            </div>
          </div>
        </div>

        {/* Distribución por Planes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Distribución por Planes</h3>
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-40 h-40">
              <div className="absolute inset-0 rounded-full" style={{
                background: `conic-gradient(
                  #8b5cf6 0deg 144deg,
                  #10b981 144deg 252deg,
                  #3b82f6 252deg 324deg,
                  #f59e0b 324deg 360deg
                )`
              }}></div>
              <div className="absolute inset-6 bg-white rounded-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{kpis.find(k => k.id === 'active-clients')?.value || 0}</div>
                  <div className="text-xs text-gray-500">Clientes</div>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">Enterprise</span>
              </div>
              <span className="text-sm font-medium text-gray-900">40%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">Professional</span>
              </div>
              <span className="text-sm font-medium text-gray-900">35%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">Basic</span>
              </div>
              <span className="text-sm font-medium text-gray-900">20%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">Custom</span>
              </div>
              <span className="text-sm font-medium text-gray-900">5%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de Área - Evolución de Ingresos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Evolución de Ingresos</h3>
        <div className="h-64 relative">
          <svg className="w-full h-full" viewBox="0 0 800 200">
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width="80" height="40" patternUnits="userSpaceOnUse">
                <path d="M 80 0 L 0 0 0 40" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {/* Area chart */}
            <path
              d="M 50 180 L 150 160 L 250 140 L 350 120 L 450 100 L 550 80 L 650 60 L 750 40 L 750 200 L 50 200 Z"
              fill="url(#gradient)"
              opacity="0.3"
            />
            <path
              d="M 50 180 L 150 160 L 250 140 L 350 120 L 450 100 L 550 80 L 650 60 L 750 40"
              fill="none"
              stroke="#10b981"
              strokeWidth="3"
            />
            
            {/* Gradient definition */}
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.8"/>
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.1"/>
              </linearGradient>
            </defs>
            
            {/* Data points */}
            {[
              { x: 50, y: 180 },
              { x: 150, y: 160 },
              { x: 250, y: 140 },
              { x: 350, y: 120 },
              { x: 450, y: 100 },
              { x: 550, y: 80 },
              { x: 650, y: 60 },
              { x: 750, y: 40 }
            ].map((point, index) => (
              <circle
                key={index}
                cx={point.x}
                cy={point.y}
                r="4"
                fill="#10b981"
                className="hover:r-6 transition-all cursor-pointer"
              />
            ))}
          </svg>
        </div>
      </div>

      {/* Gráficos Inferiores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ingresos por Mes - Barras Naranjas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Ingresos por Mes</h3>
          <div className="h-48 flex items-end justify-between space-x-2">
            {[
              { value: 45000, color: 'bg-orange-400' },
              { value: 52000, color: 'bg-orange-500' },
              { value: 68000, color: 'bg-orange-600' },
              { value: 55000, color: 'bg-orange-500' },
              { value: 78000, color: 'bg-orange-700' },
              { value: 82000, color: 'bg-orange-800' },
              { value: 95000, color: 'bg-orange-900' }
            ].map((bar, index) => {
              const maxValue = 95000;
              const height = (bar.value / maxValue) * 100;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className={`w-full ${bar.color} rounded-t transition-all duration-500`}
                    style={{ height: `${height}%` }}
                  ></div>
                  <span className="text-xs text-gray-500 mt-2">€{(bar.value / 1000).toFixed(0)}K</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Distribución de Ingresos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Distribución de Ingresos</h3>
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-40 h-40">
              <div className="absolute inset-0 rounded-full" style={{
                background: `conic-gradient(
                  #3b82f6 0deg 144deg,
                  #10b981 144deg 252deg,
                  #8b5cf6 252deg 324deg,
                  #f59e0b 324deg 360deg
                )`
              }}></div>
              <div className="absolute inset-6 bg-white rounded-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">€95K</div>
                  <div className="text-xs text-gray-500">Total</div>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">Suscripciones</span>
              </div>
              <span className="text-sm font-medium text-gray-900">€38K</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">Upgrades</span>
              </div>
              <span className="text-sm font-medium text-gray-900">€28K</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">Tokens Extra</span>
              </div>
              <span className="text-sm font-medium text-gray-900">€19K</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">Servicios</span>
              </div>
              <span className="text-sm font-medium text-gray-900">€10K</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Transacciones Recientes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Transacciones Recientes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Método</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Importe</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[
                { cliente: 'Construcciones García S.L.', plan: 'Professional', metodo: 'Stripe', importe: 149, estado: 'Completado', fecha: '2025-01-29' },
                { cliente: 'Reformas López', plan: 'Basic', metodo: 'SEPA', importe: 59, estado: 'Completado', fecha: '2025-01-28' },
                { cliente: 'Edificaciones Martín', plan: 'Enterprise', metodo: 'Stripe', importe: 299, estado: 'Pendiente', fecha: '2025-01-27' },
                { cliente: 'Constructora ABC', plan: 'Professional', metodo: 'PayPal', importe: 149, estado: 'Completado', fecha: '2025-01-26' },
                { cliente: 'Obras Públicas SL', plan: 'Custom', metodo: 'SEPA', importe: 450, estado: 'Completado', fecha: '2025-01-25' }
              ].map((transaction, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {transaction.cliente}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      transaction.plan === 'Enterprise' ? 'bg-purple-100 text-purple-800' :
                      transaction.plan === 'Professional' ? 'bg-blue-100 text-blue-800' :
                      transaction.plan === 'Custom' ? 'bg-orange-100 text-orange-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {transaction.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.metodo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    €{transaction.importe}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      transaction.estado === 'Completado' ? 'bg-green-100 text-green-800' :
                      transaction.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {transaction.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transaction.fecha).toLocaleDateString('es-ES')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center justify-center p-6 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors border border-blue-200">
            <div className="bg-blue-600 p-3 rounded-full mb-3">
              <Receipt className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-semibold text-blue-800 mb-1">Generar Reporte</h4>
            <p className="text-xs text-blue-600 text-center">Exportar datos financieros</p>
          </button>
          
          <button className="flex flex-col items-center justify-center p-6 bg-green-50 hover:bg-green-100 rounded-xl transition-colors border border-green-200">
            <div className="bg-green-600 p-3 rounded-full mb-3">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-semibold text-green-800 mb-1">Gestionar Pagos</h4>
            <p className="text-xs text-green-600 text-center">Configurar métodos de pago</p>
          </button>
          
          <button className="flex flex-col items-center justify-center p-6 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors border border-purple-200">
            <div className="bg-purple-600 p-3 rounded-full mb-3">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-semibold text-purple-800 mb-1">Análisis Avanzado</h4>
            <p className="text-xs text-purple-600 text-center">Insights con IA</p>
          </button>
          
          <button className="flex flex-col items-center justify-center p-6 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors border border-orange-200">
            <div className="bg-orange-600 p-3 rounded-full mb-3">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-semibold text-orange-800 mb-1">Gestión Clientes</h4>
            <p className="text-xs text-orange-600 text-center">Administrar suscripciones</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinancialModule;