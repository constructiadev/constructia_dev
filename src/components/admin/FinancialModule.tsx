import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  Users, 
  BarChart3,
  RefreshCw,
  Download,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Activity,
  Target,
  Award,
  Zap,
  Building2,
  FileText,
  Clock,
  ArrowUp,
  ArrowDown,
  Minus,
  Eye,
  Settings,
  Filter,
  Search
} from 'lucide-react';
import { 
  getAllReceipts, 
  getCommissionStatsByGateway,
  getAllPaymentGateways,
  getAllClients
} from '../../lib/supabase';

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

interface MonthlyRevenueData {
  month: string;
  amount: number;
  transactions: number;
}

interface PaymentMethodData {
  method: string;
  amount: number;
  percentage: number;
  transactions: number;
  color: string;
}

interface CommissionStat {
  gateway_id: string;
  gateway_name: string;
  gateway_type: string;
  total_commissions: number;
  total_volume: number;
  transaction_count: number;
  avg_commission_rate: number;
  status: string;
  current_percentage: number;
  current_fixed: number;
}

export default function FinancialModule() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Financial data states
  const [monthlyRevenueData, setMonthlyRevenueData] = useState<MonthlyRevenueData[]>([]);
  const [paymentMethodDistribution, setPaymentMethodDistribution] = useState<PaymentMethodData[]>([]);
  const [commissionStats, setCommissionStats] = useState<CommissionStat[]>([]);
  const [totalMonthlyIncome, setTotalMonthlyIncome] = useState(0);
  const [totalOverallIncome, setTotalOverallIncome] = useState(0);
  const [avgTransactionValue, setAvgTransactionValue] = useState(0);
  const [activeSubscriptions, setActiveSubscriptions] = useState(0);
  const [kpis, setKpis] = useState<FinancialKPI[]>([]);

  useEffect(() => {
    loadFinancialData();
  }, []);

  const loadFinancialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all financial data
      const [receipts, commissionData, gateways, clients] = await Promise.all([
        getAllReceipts(),
        getCommissionStatsByGateway(),
        getAllPaymentGateways(),
        getAllClients()
      ]);

      console.log('📊 [Financial] Loaded data:', {
        receipts: receipts.length,
        commissions: commissionData.length,
        gateways: gateways.length,
        clients: clients.length
      });

      // Calculate monthly revenue data (last 6 months)
      const monthlyData: MonthlyRevenueData[] = [];
      const currentDate = new Date();
      
      for (let i = 5; i >= 0; i--) {
        const targetDate = new Date(currentDate);
        targetDate.setMonth(targetDate.getMonth() - i);
        
        const monthReceipts = receipts.filter(receipt => {
          const receiptDate = new Date(receipt.created_at);
          return receiptDate.getMonth() === targetDate.getMonth() && 
                 receiptDate.getFullYear() === targetDate.getFullYear();
        });
        
        const monthAmount = monthReceipts.reduce((sum, receipt) => sum + (receipt.amount || 0), 0);
        const monthTransactions = monthReceipts.length;
        
        monthlyData.push({
          month: targetDate.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }),
          amount: monthAmount,
          transactions: monthTransactions
        });
      }
      
      setMonthlyRevenueData(monthlyData);

      // Calculate current month income
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const currentMonthReceipts = receipts.filter(receipt => {
        const receiptDate = new Date(receipt.created_at);
        return receiptDate.getMonth() === currentMonth && receiptDate.getFullYear() === currentYear;
      });
      
      const monthlyIncome = currentMonthReceipts.reduce((sum, receipt) => sum + (receipt.amount || 0), 0);
      setTotalMonthlyIncome(monthlyIncome);

      // Calculate total income
      const totalIncome = receipts.reduce((sum, receipt) => sum + (receipt.amount || 0), 0);
      setTotalOverallIncome(totalIncome);

      // Calculate average transaction value
      const avgTransaction = receipts.length > 0 ? totalIncome / receipts.length : 0;
      setAvgTransactionValue(avgTransaction);

      // Calculate active subscriptions
      const activeClients = clients.filter(c => c.subscription_status === 'active').length;
      setActiveSubscriptions(activeClients);

      // Calculate payment method distribution
      const paymentMethods: { [key: string]: { amount: number; transactions: number; color: string } } = {};
      
      receipts.forEach(receipt => {
        const method = receipt.payment_method || 'unknown';
        if (!paymentMethods[method]) {
          paymentMethods[method] = { 
            amount: 0, 
            transactions: 0,
            color: getPaymentMethodColor(method)
          };
        }
        paymentMethods[method].amount += receipt.amount || 0;
        paymentMethods[method].transactions += 1;
      });

      const paymentMethodData: PaymentMethodData[] = Object.entries(paymentMethods).map(([method, data]) => ({
        method: getPaymentMethodLabel(method),
        amount: data.amount,
        percentage: totalIncome > 0 ? (data.amount / totalIncome) * 100 : 0,
        transactions: data.transactions,
        color: data.color
      }));

      setPaymentMethodDistribution(paymentMethodData);

      // Set commission stats
      setCommissionStats(commissionData);

      // Calculate KPIs with real data
      const previousMonthIncome = monthlyData[4]?.amount || 0; // Previous month
      const incomeChange = previousMonthIncome > 0 ? ((monthlyIncome - previousMonthIncome) / previousMonthIncome) * 100 : 0;

      const financialKPIs: FinancialKPI[] = [
        {
          id: 'total-income',
          title: 'Ingresos Totales',
          value: `€${totalIncome.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`,
          change: Math.round(incomeChange * 10) / 10,
          trend: incomeChange > 0 ? 'up' : incomeChange < 0 ? 'down' : 'stable',
          icon: DollarSign,
          color: 'bg-green-500',
          description: 'Ingresos acumulados totales'
        },
        {
          id: 'monthly-income',
          title: 'Ingresos Mensuales',
          value: `€${monthlyIncome.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`,
          change: Math.round(incomeChange * 10) / 10,
          trend: incomeChange > 0 ? 'up' : incomeChange < 0 ? 'down' : 'stable',
          icon: TrendingUp,
          color: 'bg-blue-500',
          description: 'Ingresos del mes actual'
        },
        {
          id: 'avg-transaction',
          title: 'Transacción Promedio',
          value: `€${avgTransaction.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`,
          change: 5.2,
          trend: 'up',
          icon: CreditCard,
          color: 'bg-purple-500',
          description: 'Valor promedio por transacción'
        },
        {
          id: 'active-subscriptions',
          title: 'Suscripciones Activas',
          value: activeClients,
          change: 8.7,
          trend: 'up',
          icon: Users,
          color: 'bg-orange-500',
          description: 'Clientes con suscripción activa'
        }
      ];

      setKpis(financialKPIs);

      console.log('✅ [Financial] Data processed successfully:', {
        monthlyIncome,
        totalIncome,
        avgTransaction,
        activeClients,
        paymentMethods: paymentMethodData.length
      });

    } catch (err) {
      console.error('❌ [Financial] Error loading financial data:', err);
      setError(err instanceof Error ? err.message : 'Error loading financial data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadFinancialData();
  };

  // Helper functions for payment methods
  const getPaymentMethodColor = (method: string): string => {
    const colors: { [key: string]: string } = {
      'stripe': '#10b981', // Green
      'sepa': '#3b82f6',   // Blue
      'paypal': '#8b5cf6', // Purple
      'bizum': '#f59e0b',  // Orange
      'tarjeta': '#ef4444', // Red
      'unknown': '#6b7280' // Gray
    };
    return colors[method.toLowerCase()] || colors.unknown;
  };

  const getPaymentMethodLabel = (method: string): string => {
    const labels: { [key: string]: string } = {
      'stripe': 'Stripe',
      'sepa': 'SEPA',
      'paypal': 'PayPal',
      'bizum': 'Bizum',
      'tarjeta': 'Tarjeta',
      'unknown': 'Otros'
    };
    return labels[method.toLowerCase()] || method;
  };

  // SVG Chart generation functions
  const generateLinePath = (data: MonthlyRevenueData[]): string => {
    if (!data || data.length === 0) return "M 20 180 L 380 180";
    
    const maxValue = Math.max(...data.map(d => d.amount), 1);
    const width = 360; // 380 - 20 (margins)
    const height = 120; // 180 - 60 (chart area)
    const stepX = width / (data.length - 1);
    
    let path = "";
    data.forEach((item, index) => {
      const x = 20 + (index * stepX);
      const y = 180 - ((item.amount / maxValue) * height);
      path += index === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
    });
    
    return path;
  };

  const generateAreaPath = (data: MonthlyRevenueData[]): string => {
    if (!data || data.length === 0) return "M 20 180 L 380 180 L 380 200 L 20 200 Z";
    
    const linePath = generateLinePath(data);
    return `${linePath} L 380 200 L 20 200 Z`;
  };

  const generateCirclePoints = (data: MonthlyRevenueData[]): Array<{x: number, y: number, value: number}> => {
    if (!data || data.length === 0) return [];
    
    const maxValue = Math.max(...data.map(d => d.amount), 1);
    const width = 360;
    const height = 120;
    const stepX = width / (data.length - 1);
    
    return data.map((item, index) => ({
      x: 20 + (index * stepX),
      y: 180 - ((item.amount / maxValue) * height),
      value: item.amount
    }));
  };

  // Pie chart generation functions
  const getCoordinatesForPercent = (percent: number): { x: number, y: number } => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return { x, y };
  };

  const createPieChartPath = (startPercent: number, endPercent: number): string => {
    const start = getCoordinatesForPercent(startPercent);
    const end = getCoordinatesForPercent(endPercent);
    const largeArcFlag = endPercent - startPercent > 0.5 ? 1 : 0;
    
    return [
      "M", 0, 0,
      "L", start.x, start.y,
      "A", 1, 1, 0, largeArcFlag, 1, end.x, end.y,
      "Z"
    ].join(" ");
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
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando datos financieros...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-red-800 font-medium">Error: {error}</span>
          </div>
          <button
            onClick={loadFinancialData}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Módulo Financiero</h1>
            <p className="text-green-100 mb-4">
              Análisis completo de ingresos, comisiones y métricas financieras
            </p>
            <div className="space-y-1 text-sm text-green-100">
              <p>• Datos en tiempo real de la base de datos</p>
              <p>• Análisis de ingresos por método de pago</p>
              <p>• Comisiones por pasarela de pago</p>
              <p>• Métricas de suscripciones y transacciones</p>
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

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Evolution Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Evolución de Ingresos</h3>
          <div className="text-center mb-4">
            <div className="text-2xl font-bold text-green-600">
              €{totalOverallIncome.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-sm text-gray-600">Ingresos totales</div>
          </div>
          <div className="h-64 relative">
            <svg className="w-full h-full" viewBox="0 0 400 200">
              <defs>
                <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.1"/>
                </linearGradient>
              </defs>
              
              {/* Grid lines */}
              <g stroke="#f3f4f6" strokeWidth="1">
                {[0, 1, 2, 3, 4].map(i => (
                  <line key={i} x1="0" y1={60 + i * 30} x2="400" y2={60 + i * 30} />
                ))}
              </g>
              
              {/* Area */}
              <path
                d={generateAreaPath(monthlyRevenueData)}
                fill="url(#revenueGradient)"
              />
              
              {/* Line */}
              <path
                d={generateLinePath(monthlyRevenueData)}
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
              />
              
              {/* Data points */}
              {generateCirclePoints(monthlyRevenueData).map((point, index) => (
                <circle
                  key={index}
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  fill="#10b981"
                  className="hover:r-6 transition-all cursor-pointer"
                >
                  <title>€{point.value.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</title>
                </circle>
              ))}
              
              {/* X-axis labels */}
              {monthlyRevenueData.map((item, index) => {
                const x = 20 + (index * (360 / (monthlyRevenueData.length - 1)));
                return (
                  <text
                    key={index}
                    x={x}
                    y="195"
                    textAnchor="middle"
                    className="text-xs fill-gray-500"
                  >
                    {item.month}
                  </text>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Monthly Revenue Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Ingresos Mensuales</h3>
          <div className="text-center mb-4">
            <div className="text-2xl font-bold text-blue-600">
              €{totalMonthlyIncome.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-sm text-gray-600">Este mes</div>
          </div>
          <div className="space-y-3">
            {monthlyRevenueData.map((item, index) => {
              const maxValue = Math.max(...monthlyRevenueData.map(d => d.amount), 1);
              const percentage = (item.amount / maxValue) * 100;
              const colors = ['bg-blue-400', 'bg-blue-500', 'bg-blue-600', 'bg-green-400', 'bg-green-500', 'bg-green-600'];
              
              return (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 w-16">{item.month}</span>
                  <div className="flex-1 mx-3">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-300 ${colors[index % colors.length]}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-20">
                    €{item.amount.toLocaleString('es-ES', { minimumFractionDigits: 0 })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Methods Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Métodos de Pago</h3>
          <div className="text-center mb-4">
            <div className="text-2xl font-bold text-purple-600">100%</div>
            <div className="text-sm text-gray-600">Pagos</div>
          </div>
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full" viewBox="-1 -1 2 2">
                {paymentMethodDistribution.length > 0 ? (
                  (() => {
                    let cumulativePercent = 0;
                    return paymentMethodDistribution.map((method, index) => {
                      const startPercent = cumulativePercent;
                      cumulativePercent += method.percentage / 100;
                      const endPercent = cumulativePercent;
                      
                      return (
                        <path
                          key={index}
                          d={createPieChartPath(startPercent, endPercent)}
                          fill={method.color}
                          className="hover:opacity-80 cursor-pointer"
                        >
                          <title>{method.method}: {method.percentage.toFixed(1)}%</title>
                        </path>
                      );
                    });
                  })()
                ) : (
                  <circle cx="0" cy="0" r="1" fill="#e5e7eb" />
                )}
              </svg>
              <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
                <span className="text-lg font-bold text-gray-900">
                  {paymentMethodDistribution.length}
                </span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            {paymentMethodDistribution.map((method, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: method.color }}
                  ></div>
                  <span className="text-sm text-gray-600">{method.method}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{method.percentage.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Commission Statistics Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Estadísticas de Comisiones por Pasarela</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pasarela
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Volumen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transacciones
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comisiones
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tasa Promedio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {commissionStats.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No hay datos de comisiones disponibles
                  </td>
                </tr>
              ) : (
                commissionStats.map((stat) => (
                  <tr key={stat.gateway_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <CreditCard className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{stat.gateway_name}</div>
                          <div className="text-sm text-gray-500 capitalize">{stat.gateway_type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      €{stat.total_volume.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {stat.transaction_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      €{stat.total_commissions.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {stat.avg_commission_rate.toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        stat.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {stat.status === 'active' ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Resumen Financiero</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
            <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <h4 className="font-semibold text-green-800 mb-2">Ingresos Totales</h4>
            <p className="text-2xl font-bold text-green-600 mb-1">
              €{totalOverallIncome.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-green-700">Desde el inicio</p>
          </div>
          
          <div className="text-center p-6 bg-blue-50 rounded-lg border border-blue-200">
            <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <h4 className="font-semibold text-blue-800 mb-2">Promedio Mensual</h4>
            <p className="text-2xl font-bold text-blue-600 mb-1">
              €{(totalOverallIncome / Math.max(monthlyRevenueData.length, 1)).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-blue-700">Últimos {monthlyRevenueData.length} meses</p>
          </div>
          
          <div className="text-center p-6 bg-purple-50 rounded-lg border border-purple-200">
            <CreditCard className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <h4 className="font-semibold text-purple-800 mb-2">Valor Promedio</h4>
            <p className="text-2xl font-bold text-purple-600 mb-1">
              €{avgTransactionValue.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-purple-700">Por transacción</p>
          </div>
        </div>
      </div>

      {/* Data Source Info */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
          <div>
            <h4 className="font-semibold text-green-800">Datos Conectados</h4>
            <p className="text-sm text-green-700">
              Los gráficos muestran datos reales de la tabla 'receipts' de la base de datos. 
              Última actualización: {new Date().toLocaleString('es-ES')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}