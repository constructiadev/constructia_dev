import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Mail, 
  Eye,
  Search,
  Filter,
  Calendar,
  Euro,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import ReceiptGenerator from '../common/ReceiptGenerator';

interface Receipt {
  id: string;
  receipt_number: string;
  client_id: string;
  client_name: string;
  client_email: string;
  client_address: string;
  client_tax_id: string;
  amount: number;
  gross_amount: number;
  commission: number;
  currency: string;
  payment_method: string;
  gateway_name: string;
  description: string;
  payment_date: string;
  status: 'paid' | 'pending' | 'failed';
  transaction_id: string;
  invoice_items: {
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
  }[];
  tax_details: {
    base: number;
    iva_rate: number;
    iva_amount: number;
    total: number;
  };
  company_details: {
    name: string;
    address: string;
    tax_id: string;
    phone: string;
    email: string;
    website: string;
  };
}

export default function ReceiptHistory() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [filteredReceipts, setFilteredReceipts] = useState<Receipt[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Datos simulados de recibos
  const mockReceipts: Receipt[] = [
    {
      id: '1',
      receipt_number: 'REC-2024-001',
      client_id: 'CLI-001',
      client_name: 'Construcciones García S.L.',
      client_email: 'juan@construccionesgarcia.com',
      client_address: 'Calle Mayor 123, 28001 Madrid',
      client_tax_id: 'B12345678',
      amount: 149.00,
      gross_amount: 153.32,
      commission: 4.32,
      currency: 'EUR',
      payment_method: 'Tarjeta de Crédito',
      gateway_name: 'Stripe',
      description: 'Suscripción Plan Profesional - Enero 2024',
      payment_date: '2024-01-27T10:30:00Z',
      status: 'paid',
      transaction_id: 'txn_1234567890',
      invoice_items: [
        {
          description: 'Plan Profesional ConstructIA - Enero 2024',
          quantity: 1,
          unit_price: 123.14,
          total: 123.14
        }
      ],
      tax_details: {
        base: 123.14,
        iva_rate: 21,
        iva_amount: 25.86,
        total: 149.00
      },
      company_details: {
        name: 'ConstructIA S.L.',
        address: 'Calle Innovación 123, 28001 Madrid, España',
        tax_id: 'B87654321',
        phone: '+34 91 000 00 00',
        email: 'facturacion@constructia.com',
        website: 'www.constructia.com'
      }
    },
    {
      id: '2',
      receipt_number: 'REC-2023-012',
      client_id: 'CLI-001',
      client_name: 'Construcciones García S.L.',
      client_email: 'juan@construccionesgarcia.com',
      client_address: 'Calle Mayor 123, 28001 Madrid',
      client_tax_id: 'B12345678',
      amount: 149.00,
      gross_amount: 153.32,
      commission: 4.32,
      currency: 'EUR',
      payment_method: 'Tarjeta de Crédito',
      gateway_name: 'Stripe',
      description: 'Suscripción Plan Profesional - Diciembre 2023',
      payment_date: '2023-12-27T10:30:00Z',
      status: 'paid',
      transaction_id: 'txn_0987654321',
      invoice_items: [
        {
          description: 'Plan Profesional ConstructIA - Diciembre 2023',
          quantity: 1,
          unit_price: 123.14,
          total: 123.14
        }
      ],
      tax_details: {
        base: 123.14,
        iva_rate: 21,
        iva_amount: 25.86,
        total: 149.00
      },
      company_details: {
        name: 'ConstructIA S.L.',
        address: 'Calle Innovación 123, 28001 Madrid, España',
        tax_id: 'B87654321',
        phone: '+34 91 000 00 00',
        email: 'facturacion@constructia.com',
        website: 'www.constructia.com'
      }
    },
    {
      id: '3',
      receipt_number: 'REC-2024-002',
      client_id: 'CLI-001',
      client_name: 'Construcciones García S.L.',
      client_email: 'juan@construccionesgarcia.com',
      client_address: 'Calle Mayor 123, 28001 Madrid',
      client_tax_id: 'B12345678',
      amount: 79.00,
      gross_amount: 81.29,
      commission: 2.29,
      currency: 'EUR',
      payment_method: 'PayPal',
      gateway_name: 'PayPal',
      description: 'Compra de Tokens - Paquete Profesional',
      payment_date: '2024-01-15T14:20:00Z',
      status: 'paid',
      transaction_id: 'txn_tokens_001',
      invoice_items: [
        {
          description: 'Paquete de 1500 Tokens IA',
          quantity: 1,
          unit_price: 65.29,
          total: 65.29
        }
      ],
      tax_details: {
        base: 65.29,
        iva_rate: 21,
        iva_amount: 13.71,
        total: 79.00
      },
      company_details: {
        name: 'ConstructIA S.L.',
        address: 'Calle Innovación 123, 28001 Madrid, España',
        tax_id: 'B87654321',
        phone: '+34 91 000 00 00',
        email: 'facturacion@constructia.com',
        website: 'www.constructia.com'
      }
    }
  ];

  useEffect(() => {
    setReceipts(mockReceipts);
    setFilteredReceipts(mockReceipts);
  }, []);

  useEffect(() => {
    let filtered = receipts.filter(receipt => {
      const matchesSearch = receipt.receipt_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           receipt.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           receipt.payment_method.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || receipt.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });

    setFilteredReceipts(filtered);
  }, [receipts, searchTerm, filterStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const handleViewReceipt = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    setShowReceiptModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Mis Recibos</h2>
          <p className="text-gray-600">Historial completo de pagos y recibos</p>
        </div>
        <div className="text-sm text-gray-600">
          <span className="font-medium">{filteredReceipts.length}</span> recibos
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por número, descripción o método de pago..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="all">Todos los estados</option>
            <option value="paid">Pagado</option>
            <option value="pending">Pendiente</option>
            <option value="failed">Fallido</option>
          </select>
        </div>
      </div>

      {/* Lista de Recibos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recibo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Método de Pago</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Importe</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReceipts.map((receipt) => (
                <tr key={receipt.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-blue-600 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{receipt.receipt_number}</div>
                        <div className="text-sm text-gray-500">{receipt.transaction_id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{receipt.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{receipt.gateway_name}</div>
                    <div className="text-sm text-gray-500">{receipt.payment_method}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{formatCurrency(receipt.amount)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(receipt.status)}
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(receipt.status)}`}>
                        {receipt.status === 'paid' ? 'Pagado' : receipt.status === 'pending' ? 'Pendiente' : 'Fallido'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(receipt.payment_date).toLocaleDateString('es-ES')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewReceipt(receipt)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Ver recibo"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        className="text-green-600 hover:text-green-900"
                        title="Descargar PDF"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        className="text-purple-600 hover:text-purple-900"
                        title="Reenviar por email"
                      >
                        <Mail className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredReceipts.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">No se encontraron recibos</h3>
          <p className="text-gray-600">
            {searchTerm ? 'Intenta con otros términos de búsqueda' : 'No hay recibos disponibles'}
          </p>
        </div>
      )}

      {/* Modal de Recibo */}
      {showReceiptModal && selectedReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
            <ReceiptGenerator
              receiptData={selectedReceipt}
              onEmailSent={() => {
                alert('Recibo reenviado exitosamente');
                setShowReceiptModal(false);
              }}
              showActions={true}
            />
            <div className="p-4 border-t border-gray-200 text-center">
              <button
                onClick={() => setShowReceiptModal(false)}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}