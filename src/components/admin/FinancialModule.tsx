import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  Receipt, 
  AlertCircle,
  Calendar,
  BarChart3,
  PieChart,
  Users,
  Building
} from 'lucide-react';
import { 
  getAllReceipts, 
  getAllPaymentGateways, 
  getAllClients,
  getKPIs,
  calculateDynamicKPIs 
} from '../../lib/supabase';

interface FinancialKPIs {
  totalRevenue: number;
  monthlyRevenue: number;
  averageTransactionValue: number;
  totalTransactions: number;
  activeClients: number;
  conversionRate: number;
}

const FinancialModule: React.FC = () => {
  const [kpis, setKpis] = useState<FinancialKPIs>({
    totalRevenue: 0,
    monthlyRevenue: 0,
    averageTransactionValue: 0,
    totalTransactions: 0,
    activeClients: 0,
    conversionRate: 0
  });
  const [receipts, setReceipts] = useState<any[]>([]);
  const [gateways, setGateways] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFinancialData();
  }, []);

  const loadFinancialData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [receiptsData, gatewaysData, clientsData, dynamicKPIs] = await Promise.all([
        getAllReceipts(),
        getAllPaymentGateways(),
        getAllClients(),
        calculateDynamicKPIs()
      ]);

      setReceipts(receiptsData || []);
      setGateways(gatewaysData || []);

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
      const conversionRate = clientsData?.length > 0 ? (activeClients / clientsData.length) * 100 : 0;

      setKpis({
        totalRevenue,
        monthlyRevenue,
        averageTransactionValue,
        totalTransactions,
        activeClients,
        conversionRate
      });

    } catch (err) {
      console.error('Error loading financial data:', err);
      setError(err instanceof Error ? err.message : 'Error loading financial data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700">Error: {error}</span>
          </div>
          <button 
            onClick={loadFinancialData}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Módulo Financiero</h1>
        <button 
          onClick={loadFinancialData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Actualizar Datos
        </button>
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
              <p className="text-2xl font-bold text-gray-900">€{kpis.totalRevenue.toFixed(2)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ingresos Mensuales</p>
              <p className="text-2xl font-bold text-gray-900">€{kpis.monthlyRevenue.toFixed(2)}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Valor Promedio</p>
              <p className="text-2xl font-bold text-gray-900">€{kpis.averageTransactionValue.toFixed(2)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Transacciones</p>
              <p className="text-2xl font-bold text-gray-900">{kpis.totalTransactions}</p>
            </div>
            <Receipt className="w-8 h-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Clientes Activos</p>
              <p className="text-2xl font-bold text-gray-900">{kpis.activeClients}</p>
            </div>
            <Users className="w-8 h-8 text-indigo-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tasa de Conversión</p>
              <p className="text-2xl font-bold text-gray-900">{kpis.conversionRate.toFixed(1)}%</p>
            </div>
            <BarChart3 className="w-8 h-8 text-teal-600" />
          </div>
        </div>
      </div>

      {/* Pasarelas de Pago */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Pasarelas de Pago
          </h2>
        </div>
        <div className="p-6">
          {gateways.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay pasarelas de pago configuradas</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gateways.map((gateway) => (
                <div key={gateway.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{gateway.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      gateway.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {gateway.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Tipo: {gateway.type}</p>
                  <p className="text-sm text-gray-600">
                    Comisión: {gateway.commission_type === 'percentage' 
                      ? `${gateway.commission_percentage}%` 
                      : `€${gateway.commission_fixed}`}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Transacciones Recientes */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Receipt className="w-5 h-5 mr-2" />
            Transacciones Recientes
          </h2>
        </div>
        <div className="p-6">
          {receipts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay transacciones registradas</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recibo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cantidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Método
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {receipts.slice(0, 10).map((receipt) => (
                    <tr key={receipt.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {receipt.receipt_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {receipt.clients?.company_name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        €{parseFloat(receipt.amount || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {receipt.payment_method}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(receipt.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          receipt.status === 'paid' 
                            ? 'bg-green-100 text-green-800' 
                            : receipt.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {receipt.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancialModule;