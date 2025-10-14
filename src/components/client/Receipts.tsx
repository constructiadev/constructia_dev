import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Download,
  Eye,
  Search,
  Calendar,
  DollarSign,
  CreditCard,
  TrendingUp,
  Filter,
  X,
  FileText,
  Printer,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { ReceiptService } from '../../lib/receipt-service';
import { useClientData } from '../../hooks/useClientData';

interface ReceiptData {
  id: string;
  receipt_number: string;
  amount: number;
  payment_date: string;
  status: string;
  payment_method: string;
  gateway_name: string;
  description: string;
  receipt_html: string;
  download_count: number;
  viewed_at: string | null;
  downloaded_at: string | null;
  subscription_plan: string;
}

export default function Receipts() {
  const { client } = useClientData();
  const [receipts, setReceipts] = useState<ReceiptData[]>([]);
  const [filteredReceipts, setFilteredReceipts] = useState<ReceiptData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    if (client) {
      loadReceipts();
      loadAnalytics();
    }
  }, [client]);

  useEffect(() => {
    filterReceipts();
  }, [receipts, searchTerm, statusFilter]);

  const loadReceipts = async () => {
    if (!client?.client_record_id) return;

    try {
      setLoading(true);
      const data = await ReceiptService.getClientReceipts(client.client_record_id);
      setReceipts(data);
    } catch (error) {
      console.error('Error loading receipts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    if (!client?.client_record_id) return;

    try {
      const data = await ReceiptService.getReceiptAnalytics(client.client_record_id);
      if (data && data.length > 0) {
        setAnalytics(data[0]);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const filterReceipts = () => {
    let filtered = [...receipts];

    if (searchTerm) {
      filtered = filtered.filter(r =>
        r.receipt_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.payment_method.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    setFilteredReceipts(filtered);
  };

  const handleViewReceipt = async (receipt: ReceiptData) => {
    setSelectedReceipt(receipt);
    setShowReceiptModal(true);
    await ReceiptService.trackView(receipt.id);
  };

  const handleDownloadReceipt = async (receipt: ReceiptData) => {
    if (receipt.receipt_html) {
      ReceiptService.downloadReceiptHTML(receipt.receipt_html, receipt.receipt_number);
      await ReceiptService.trackDownload(receipt.id);

      setReceipts(receipts.map(r =>
        r.id === receipt.id
          ? { ...r, download_count: (r.download_count || 0) + 1 }
          : r
      ));
    }
  };

  const handlePrintReceipt = (receipt: ReceiptData) => {
    if (receipt.receipt_html) {
      ReceiptService.printReceipt(receipt.receipt_html);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      paid: 'Pagado',
      pending: 'Pendiente',
      failed: 'Fallido',
      refunded: 'Reembolsado'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      paid: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      failed: 'bg-red-100 text-red-800 border-red-200',
      refunded: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando recibos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mis Recibos</h1>
        <p className="text-gray-600 mt-2">
          Historial completo de pagos y transacciones
        </p>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 text-green-600" />
              <span className="text-sm text-green-600 font-medium">Total</span>
            </div>
            <div className="text-2xl font-bold text-green-900">
              €{Number(analytics.total_paid || 0).toFixed(2)}
            </div>
            <p className="text-sm text-green-700 mt-1">Total pagado</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Receipt className="w-8 h-8 text-blue-600" />
              <span className="text-sm text-blue-600 font-medium">Recibos</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">
              {analytics.total_receipts || 0}
            </div>
            <p className="text-sm text-blue-700 mt-1">Emitidos</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <span className="text-sm text-purple-600 font-medium">Promedio</span>
            </div>
            <div className="text-2xl font-bold text-purple-900">
              €{Number(analytics.average_transaction || 0).toFixed(2)}
            </div>
            <p className="text-sm text-purple-700 mt-1">Por transacción</p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Download className="w-8 h-8 text-orange-600" />
              <span className="text-sm text-orange-600 font-medium">Descargas</span>
            </div>
            <div className="text-2xl font-bold text-orange-900">
              {analytics.total_downloads || 0}
            </div>
            <p className="text-sm text-orange-700 mt-1">Totales</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por número, descripción o método de pago..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
            >
              <option value="all">Todos los estados</option>
              <option value="paid">Pagado</option>
              <option value="pending">Pendiente</option>
              <option value="failed">Fallido</option>
              <option value="refunded">Reembolsado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Receipts List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filteredReceipts.length === 0 ? (
          <div className="text-center py-16">
            <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No se encontraron recibos</p>
            <p className="text-gray-400 text-sm mt-2">
              {receipts.length === 0
                ? 'Aún no tienes ningún recibo. Los recibos se generan automáticamente con cada pago.'
                : 'Intenta ajustar los filtros de búsqueda'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Recibo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Método
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Importe
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredReceipts.map((receipt) => (
                  <tr key={receipt.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Receipt className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <div className="font-semibold text-gray-900">{receipt.receipt_number}</div>
                          {receipt.download_count > 0 && (
                            <div className="text-xs text-gray-500 mt-1">
                              {receipt.download_count} descarga{receipt.download_count !== 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {new Date(receipt.payment_date).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{receipt.description}</div>
                      {receipt.subscription_plan && (
                        <div className="text-xs text-gray-500 mt-1">{receipt.subscription_plan}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <CreditCard className="w-4 h-4 mr-2 text-gray-400" />
                        {receipt.gateway_name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">
                        €{receipt.amount.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(receipt.status)}`}>
                        {getStatusIcon(receipt.status)}
                        <span className="ml-1">{getStatusText(receipt.status)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleViewReceipt(receipt)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Ver recibo"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handlePrintReceipt(receipt)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Imprimir"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadReceipt(receipt)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Descargar"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Receipt Modal */}
      {showReceiptModal && selectedReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Recibo {selectedReceipt.receipt_number}</h2>
                <p className="text-green-100">Vista previa del recibo</p>
              </div>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {selectedReceipt.receipt_html ? (
                <div
                  dangerouslySetInnerHTML={{ __html: selectedReceipt.receipt_html }}
                  className="receipt-preview"
                />
              ) : (
                <div className="text-center py-16">
                  <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No se pudo cargar el contenido del recibo</p>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 p-6 bg-gray-50 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Descargado:</span> {selectedReceipt.download_count} veces
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => handlePrintReceipt(selectedReceipt)}
                  className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimir
                </button>
                <button
                  onClick={() => handleDownloadReceipt(selectedReceipt)}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Descargar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
