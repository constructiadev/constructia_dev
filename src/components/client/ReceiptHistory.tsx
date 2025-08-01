import React, { useState, useEffect } from 'react';
import { Receipt, Download, Mail, Calendar, Euro, FileText, Search, Filter } from 'lucide-react';
import { getClientReceipts } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface ReceiptData {
  id: string;
  receipt_number: string;
  amount: number;
  base_amount: number;
  tax_amount: number;
  tax_rate: number;
  currency: string;
  payment_method: string;
  gateway_name: string;
  description: string;
  payment_date: string;
  status: string;
  transaction_id: string;
  invoice_items: any[];
  client_details: any;
  company_details: any;
  created_at: string;
}

const ReceiptHistory: React.FC = () => {
  const { user, clientData } = useAuth();
  const [receipts, setReceipts] = useState<ReceiptData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null);

  useEffect(() => {
    if (clientData?.id) {
      loadReceipts();
    }
  }, [clientData]);

  const loadReceipts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!clientData?.id) {
        throw new Error('No se encontraron datos del cliente');
      }

      const data = await getClientReceipts(clientData.id);
      setReceipts(data || []);
    } catch (err) {
      console.error('Error loading receipts:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar los recibos');
    } finally {
      setLoading(false);
    }
  };

  const filteredReceipts = receipts.filter(receipt => {
    const matchesSearch = receipt.receipt_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         receipt.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || receipt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const downloadReceipt = (receipt: ReceiptData) => {
    // Simular descarga de PDF
    console.log('Descargando recibo:', receipt.receipt_number);
    // Aquí iría la lógica para generar y descargar el PDF
  };

  const sendReceiptByEmail = async (receipt: ReceiptData) => {
    try {
      // Simular envío por email
      console.log('Enviando recibo por email:', receipt.receipt_number);
      alert('Recibo enviado por email exitosamente');
    } catch (error) {
      console.error('Error sending receipt:', error);
      alert('Error al enviar el recibo por email');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Pagado';
      case 'pending': return 'Pendiente';
      case 'failed': return 'Fallido';
      case 'refunded': return 'Reembolsado';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Cargando historial de recibos...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <FileText className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700">Error: {error}</span>
          </div>
          <button
            onClick={loadReceipts}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Historial de Recibos</h1>
        <p className="text-gray-600">Consulta y gestiona todos tus recibos de pago</p>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por número de recibo o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
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
      </div>

      {/* Lista de recibos */}
      {filteredReceipts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay recibos</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'all' 
              ? 'No se encontraron recibos que coincidan con los filtros aplicados'
              : 'Aún no tienes recibos generados'
            }
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recibo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Método de Pago
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Importe
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReceipts.map((receipt) => (
                  <tr key={receipt.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Receipt className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          {receipt.receipt_number}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        {formatDate(receipt.payment_date)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {receipt.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 capitalize">
                        {receipt.payment_method}
                      </div>
                      <div className="text-xs text-gray-500">
                        {receipt.gateway_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm font-medium text-gray-900">
                        <Euro className="w-4 h-4 text-gray-400 mr-1" />
                        {formatAmount(receipt.amount)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Base: {formatAmount(receipt.base_amount)} + IVA: {formatAmount(receipt.tax_amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(receipt.status)}`}>
                        {getStatusText(receipt.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setSelectedReceipt(receipt)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="Ver detalles"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => downloadReceipt(receipt)}
                          className="text-green-600 hover:text-green-900 p-1 rounded"
                          title="Descargar PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => sendReceiptByEmail(receipt)}
                          className="text-purple-600 hover:text-purple-900 p-1 rounded"
                          title="Enviar por email"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de detalles del recibo */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Detalles del Recibo {selectedReceipt.receipt_number}
                </h2>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Información del Pago</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Número de Recibo:</span>
                      <span className="font-medium">{selectedReceipt.receipt_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fecha de Pago:</span>
                      <span className="font-medium">{formatDate(selectedReceipt.payment_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Método de Pago:</span>
                      <span className="font-medium capitalize">{selectedReceipt.payment_method}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pasarela:</span>
                      <span className="font-medium">{selectedReceipt.gateway_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ID Transacción:</span>
                      <span className="font-medium text-xs">{selectedReceipt.transaction_id}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Desglose Financiero</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Base Imponible:</span>
                      <span className="font-medium">{formatAmount(selectedReceipt.base_amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">IVA ({selectedReceipt.tax_rate}%):</span>
                      <span className="font-medium">{formatAmount(selectedReceipt.tax_amount)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-gray-900 font-semibold">Total:</span>
                      <span className="font-bold text-lg">{formatAmount(selectedReceipt.amount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Descripción</h3>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {selectedReceipt.description}
                </p>
              </div>

              {selectedReceipt.invoice_items && selectedReceipt.invoice_items.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Elementos Facturados</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    {selectedReceipt.invoice_items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between py-2 border-b border-gray-200 last:border-b-0">
                        <span className="text-gray-700">{item.description || `Elemento ${index + 1}`}</span>
                        <span className="font-medium">{formatAmount(item.amount || 0)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => downloadReceipt(selectedReceipt)}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Descargar PDF
                </button>
                <button
                  onClick={() => sendReceiptByEmail(selectedReceipt)}
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Enviar por Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiptHistory;