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
  RefreshCw,
  Download,
  ArrowUp,
  ArrowDown,
  Minus,
  Settings,
  Calculator,
  Percent,
  Euro,
  Activity,
  Target,
  Zap,
  CheckCircle,
  AlertTriangle,
  Edit,
  Save,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  getAllReceipts, 
  getAllPaymentGateways, 
  getAllClients,
  calculateDynamicKPIs,
  getCommissionStatsByGateway,
  calculateIntelligentCommission,
  supabase
} from '../../lib/supabase';
import { geminiAI } from '../../lib/gemini';
import type { PaymentGateway } from '../../types';

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

interface CommissionStats {
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

interface CommissionEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  gateway: PaymentGateway | null;
  onSave: (gatewayId: string, percentage: number, fixed: number) => Promise<void>;
}

function CommissionEditModal({ isOpen, onClose, gateway, onSave }: CommissionEditModalProps) {
  const [percentage, setPercentage] = useState(0);
  const [fixed, setFixed] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (gateway) {
      setPercentage(gateway.commission_percentage || 0);
      setFixed(gateway.commission_fixed || 0);
    }
  }, [gateway]);

  const handleSave = async () => {
    if (!gateway) return;
    
    setSaving(true);
    try {
      await onSave(gateway.id, percentage, fixed);
      onClose();
    } catch (error) {
      console.error('Error saving commission:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !gateway) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Configurar Comisión</h2>
              <p className="text-green-100">{gateway.name}</p>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comisión Porcentual (%)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={percentage}
                onChange={(e) => setPercentage(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
              <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comisión Fija (€)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0"
                value={fixed}
                onChange={(e) => setFixed(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
              <Euro className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <h5 className="font-medium text-gray-800 mb-2">Ejemplo (€100)</h5>
            <div className="text-sm text-gray-600">
              <p>Comisión porcentual: €{(percentage * 100 / 100).toFixed(2)}</p>
              <p>Comisión fija: €{fixed.toFixed(2)}</p>
              <p className="font-medium text-gray-800 border-t pt-2 mt-2">
                Total: €{(percentage * 100 / 100 + fixed).toFixed(2)}
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const FinancialModule: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [kpis, setKpis] = useState<FinancialKPI[]>([]);
  const [commissionStats, setCommissionStats] = useState<CommissionStats[]>([]);
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [showCommissionModal, setShowCommissionModal] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | null>(null);
  const [aiInsights, setAiInsights] = useState<any[]>([]);

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

      setGateways(gatewaysData);

      // Calcular estadísticas de comisiones por gateway
      const commissionStatsData = gatewaysData.map(gateway => {
        const gatewayReceipts = receiptsData.filter(r => r.gateway_name === gateway.name);
        
        let totalCommissions = 0;
        let totalVolume = 0;
        let transactionCount = 0;

        gatewayReceipts.forEach(receipt => {
          const commission = calculateIntelligentCommission(
            gateway,
            receipt.amount,
            receipt.payment_date
          );
          totalCommissions += commission;
          totalVolume += receipt.amount;
          transactionCount++;
        });

        return {
          gateway_id: gateway.id,
          gateway_name: gateway.name,
          gateway_type: gateway.type,
          total_commissions: totalCommissions,
          total_volume: totalVolume,
          transaction_count: transactionCount,
          avg_commission_rate: totalVolume > 0 ? (totalCommissions / totalVolume) * 100 : 0,
          status: gateway.status,
          current_percentage: gateway.commission_percentage || 0,
          current_fixed: gateway.commission_fixed || 0
        };
      });

      setCommissionStats(commissionStatsData);

      // Calcular KPIs financieros
      const totalRevenue = receiptsData?.reduce((sum, receipt) => sum + parseFloat(receipt.amount || 0), 0) || 0;
      const totalCommissions = commissionStatsData.reduce((sum, stat) => sum + stat.total_commissions, 0);
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
          id: 'total-commissions',
          title: 'Comisiones Totales',
          value: `€${totalCommissions.toFixed(0)}`,
          change: 15.3,
          trend: 'up',
          icon: Calculator,
          color: 'bg-purple-500',
          description: 'Comisiones de pasarelas'
        },
        {
          id: 'avg-transaction',
          title: 'Valor Promedio',
          value: `€${averageTransactionValue.toFixed(0)}`,
          change: 12.8,
          trend: 'up',
          icon: TrendingUp,
          color: 'bg-cyan-500',
          description: 'Valor promedio por transacción'
        },
        {
          id: 'total-transactions',
          title: 'Total Transacciones',
          value: totalTransactions,
          change: 15.7,
          trend: 'up',
          icon: Receipt,
          color: 'bg-orange-500',
          description: 'Transacciones procesadas'
        },
        {
          id: 'active-clients',
          title: 'Clientes Activos',
          value: activeClients,
          change: 8.3,
          trend: 'up',
          icon: Users,
          color: 'bg-indigo-500',
          description: 'Clientes con suscripción activa'
        },
        {
          id: 'mrr',
          title: 'MRR',
          value: `€${(monthlyRevenue * 0.8).toFixed(0)}`,
          change: 19.4,
          trend: 'up',
          icon: BarChart3,
          color: 'bg-emerald-500',
          description: 'Ingresos mensuales recurrentes'
        },
        {
          id: 'churn-rate',
          title: 'Tasa de Abandono',
          value: '2.3%',
          change: -5.2,
          trend: 'up',
          icon: Target,
          color: 'bg-red-500',
          description: 'Clientes que cancelan mensualmente'
        },
        {
          id: 'ltv',
          title: 'LTV',
          value: `€${(averageTransactionValue * 12).toFixed(0)}`,
          change: 14.7,
          trend: 'up',
          icon: TrendingUp,
          color: 'bg-pink-500',
          description: 'Valor de vida del cliente'
        },
        {
          id: 'conversion-rate',
          title: 'Tasa de Conversión',
          value: '3.2%',
          change: 8.9,
          trend: 'up',
          icon: Target,
          color: 'bg-teal-500',
          description: 'Visitantes que se convierten'
        }
      ];

      setKpis(financialKPIs);

      // Generar insights financieros con IA
      const financialData = {
        revenue: totalRevenue,
        commissions: totalCommissions,
        transactions: totalTransactions,
        clients: activeClients,
        gateways: commissionStatsData
      };

      const insights = await geminiAI.analyzeFinancialTrends(financialData);
      setAiInsights(insights);

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

  const handleConfigureCommissions = (gateway: PaymentGateway) => {
    setSelectedGateway(gateway);
    setShowCommissionModal(true);
  };

  const handleSaveCommission = async (gatewayId: string, percentage: number, fixed: number) => {
    try {
      const { error } = await supabase
        .from('payment_gateways')
        .update({
          commission_percentage: percentage,
          commission_fixed: fixed,
          updated_at: new Date().toISOString()
        })
        .eq('id', gatewayId);

      if (error) {
        throw new Error(`Error updating commission: ${error.message}`);
      }

      await loadFinancialData();
    } catch (error) {
      console.error('Error saving commission:', error);
      throw error;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUp className="w-4 h-4 text-green-500" />;
      case 'down': return <ArrowDown className="w-4 h-4 text-red-500" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getGatewayIcon = (type: string) => {
    switch (type) {
      case 'stripe': return CreditCard;
      case 'paypal': return DollarSign;
      case 'sepa': return Building;
      case 'bizum': return Zap;
      default: return CreditCard;
    }
  };

  const getGatewayColor = (type: string) => {
    switch (type) {
      case 'stripe': return 'bg-blue-600';
      case 'paypal': return 'bg-blue-500';
      case 'sepa': return 'bg-green-600';
      case 'bizum': return 'bg-orange-600';
      default: return 'bg-gray-600';
    }
  };

  const exportFinancialReport = () => {
    const csvContent = [
      ['Fecha', 'Cliente', 'Método', 'Importe', 'Comisión', 'Estado'].join(','),
      ...commissionStats.map(stat => 
        [stat.gateway_name, stat.total_volume.toFixed(2), stat.total_commissions.toFixed(2), stat.transaction_count, stat.avg_commission_rate.toFixed(2)].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_financiero_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
              Panel integral de análisis financiero y gestión de comisiones
            </p>
            <div className="space-y-1 text-sm text-green-100">
              <p>• Análisis de ingresos y rentabilidad en tiempo real</p>
              <p>• Gestión inteligente de comisiones por períodos</p>
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
            <button 
              onClick={exportFinancialReport}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center"
            >
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
                <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comisiones por Pasarela de Pago */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Comisiones por Pasarela de Pago</h3>
          <div className="text-sm text-gray-600">
            Cálculo inteligente con períodos configurables
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {commissionStats.map((stat) => {
            const Icon = getGatewayIcon(stat.gateway_type);
            const color = getGatewayColor(stat.gateway_type);
            
            return (
              <div key={stat.gateway_id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center mr-3`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{stat.gateway_name}</h4>
                      <p className="text-xs text-gray-500">{stat.gateway_type.toUpperCase()}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const gateway = gateways.find(g => g.id === stat.gateway_id);
                      if (gateway) handleConfigureCommissions(gateway);
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    €{stat.total_commissions.toFixed(0)}
                  </div>
                  <div className="text-sm text-gray-600">Total comisiones</div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Comisión actual:</span>
                    <span className="font-medium text-purple-600">
                      {stat.current_percentage}% + €{stat.current_fixed}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Volumen:</span>
                    <span className="font-medium text-gray-900">€{stat.total_volume.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transacciones:</span>
                    <span className="font-medium text-gray-900">{stat.transaction_count}</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    stat.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {stat.status === 'active' ? 'Activa' : 'Inactiva'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Insights de IA */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {aiInsights.slice(0, 4).map((insight, index) => {
          const colors = [
            'bg-green-50 border-green-200 text-green-800',
            'bg-yellow-50 border-yellow-200 text-yellow-800', 
            'bg-blue-50 border-blue-200 text-blue-800',
            'bg-purple-50 border-purple-200 text-purple-800'
          ];
          const icons = [CheckCircle, AlertTriangle, TrendingUp, Activity];
          const Icon = icons[index];
          
          return (
            <div key={insight.title} className={`border rounded-xl p-6 ${colors[index]}`}>
              <div className="flex items-center mb-3">
                <Icon className="w-5 h-5 mr-2" />
                <h3 className="font-semibold">{insight.title}</h3>
              </div>
              <p className="text-sm">{insight.description}</p>
              <div className="mt-3 text-xs opacity-75">
                Confianza: {insight.confidence}%
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
          <div className="h-64 relative">
            <svg className="w-full h-full" viewBox="0 0 400 200">
              <defs>
                <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.1"/>
                </linearGradient>
              </defs>
              
              <g stroke="#f3f4f6" strokeWidth="1">
                {[0, 1, 2, 3, 4].map(i => (
                  <line key={i} x1="0" y1={i * 40} x2="400" y2={i * 40} />
                ))}
              </g>
              
              <path
                d="M 20 180 L 80 160 L 140 140 L 200 120 L 260 100 L 320 80 L 380 60 L 380 200 L 20 200 Z"
                fill="url(#revenueGradient)"
              />
              <path
                d="M 20 180 L 80 160 L 140 140 L 200 120 L 260 100 L 320 80 L 380 60"
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
              />
              
              {[
                { x: 20, y: 180 }, { x: 80, y: 160 }, { x: 140, y: 140 },
                { x: 200, y: 120 }, { x: 260, y: 100 }, { x: 320, y: 80 }, { x: 380, y: 60 }
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

        {/* Ingresos por Mes - Barras */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Ingresos Mensuales</h3>
          <div className="h-64 flex items-end justify-between space-x-2">
            {[
              { value: 45000, color: 'bg-blue-400' },
              { value: 52000, color: 'bg-blue-500' },
              { value: 68000, color: 'bg-blue-600' },
              { value: 55000, color: 'bg-blue-500' },
              { value: 78000, color: 'bg-blue-700' },
              { value: 82000, color: 'bg-blue-800' },
              { value: 95000, color: 'bg-blue-900' }
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

        {/* Distribución de Métodos de Pago */}
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
                  <div className="text-xl font-bold text-gray-900">100%</div>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comisión</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[
                { cliente: 'Construcciones García S.L.', plan: 'Professional', metodo: 'Stripe', importe: 149, comision: 2.39, estado: 'Completado', fecha: '2025-01-29' },
                { cliente: 'Reformas López', plan: 'Basic', metodo: 'SEPA', importe: 59, comision: 0.55, estado: 'Completado', fecha: '2025-01-28' },
                { cliente: 'Edificaciones Martín', plan: 'Enterprise', metodo: 'Stripe', importe: 299, comision: 4.78, estado: 'Pendiente', fecha: '2025-01-27' },
                { cliente: 'Constructora ABC', plan: 'Professional', metodo: 'PayPal', importe: 149, comision: 4.32, estado: 'Completado', fecha: '2025-01-26' },
                { cliente: 'Obras Públicas SL', plan: 'Custom', metodo: 'SEPA', importe: 450, comision: 2.25, estado: 'Completado', fecha: '2025-01-25' }
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    €{transaction.comision}
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
          <button 
            onClick={exportFinancialReport}
            className="flex flex-col items-center justify-center p-6 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors border border-blue-200"
          >
            <div className="bg-blue-600 p-3 rounded-full mb-3">
              <Receipt className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-semibold text-blue-800 mb-1">Generar Reporte</h4>
            <p className="text-xs text-blue-600 text-center">Exportar datos financieros</p>
          </button>
          
          <button 
            onClick={() => navigate('/admin/settings')}
            className="flex flex-col items-center justify-center p-6 bg-green-50 hover:bg-green-100 rounded-xl transition-colors border border-green-200"
          >
            <div className="bg-green-600 p-3 rounded-full mb-3">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-semibold text-green-800 mb-1">Configurar Comisiones</h4>
            <p className="text-xs text-green-600 text-center">Gestionar períodos de comisión</p>
          </button>
          
          <button 
            onClick={() => navigate('/admin/ai')}
            className="flex flex-col items-center justify-center p-6 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors border border-purple-200"
          >
            <div className="bg-purple-600 p-3 rounded-full mb-3">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-semibold text-purple-800 mb-1">Análisis Avanzado</h4>
            <p className="text-xs text-purple-600 text-center">Insights con IA</p>
          </button>
          
          <button 
            onClick={() => navigate('/admin/clients')}
            className="flex flex-col items-center justify-center p-6 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors border border-orange-200"
          >
            <div className="bg-orange-600 p-3 rounded-full mb-3">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-semibold text-orange-800 mb-1">Gestionar Clientes</h4>
            <p className="text-xs text-orange-600 text-center">Administrar suscripciones</p>
          </button>
        </div>
      </div>

      {/* Modal de Edición de Comisiones */}
      <CommissionEditModal
        isOpen={showCommissionModal}
        onClose={() => setShowCommissionModal(false)}
        gateway={selectedGateway}
        onSave={handleSaveCommission}
      />
    </div>
  );
};

export default FinancialModule;