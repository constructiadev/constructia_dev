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
  AlertTriangle,
  Users,
  CreditCard,
  TrendingUp,
  BarChart3,
  Building2,
  Percent
} from 'lucide-react';
import ReceiptGenerator from '../common/ReceiptGenerator';

interface AdminReceipt {
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

interface ReceiptKPICardProps {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ElementType;
  color: string;
  description?: string;
}

function ReceiptKPICard({ title, value, change, trend, icon: Icon, color, description }: ReceiptKPICardProps) {
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
            mensual
          </span>
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        <div className="flex items-center justify-between mt-2">
          <p className={`text-sm font-medium ${trendColor}`}>
            {trendSymbol}{Math.abs(change)}% vs mes anterior
          </p>
        </div>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </div>
    </div>
  );
}

export default function ReceiptManagement() {
  const [receipts, setReceipts] = useState<AdminReceipt[]>([]);
  const [filteredReceipts, setFilteredReceipts] = useState<AdminReceipt[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterGateway, setFilterGateway] = useState('all');
  const [selectedReceipt, setSelectedReceipt] = useState<AdminReceipt | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // KPIs de Recibos
  const receiptKPIs = [
    { title: 'Recibos Emitidos', value: '247', change: 12.5, trend: 'up' as const, icon: FileText, color: 'bg-blue-500', description: 'Total de recibos este mes' },
    { title: 'Ingresos Brutos', value: '€47,850', change: 18.3, trend: 'up' as const, icon: Euro, color: 'bg-green-500', description: 'Ingresos antes de comisiones' },
    { title: 'Comisiones Totales', value: '€2,340', change: 8.9, trend: 'up' as const, icon: Percent, color: 'bg-orange-500', description: 'Comisiones de pasarelas' },
    { title: 'Ingresos Netos', value: '€45,510', change: 19.1, trend: 'up' as const, icon: TrendingUp, color: 'bg-emerald-500', description: 'Ingresos después de comisiones' },
    { title: 'Tasa de Éxito', value: '98.7%', change: 1.2, trend: 'up' as const, icon: CheckCircle, color: 'bg-purple-500', description: 'Pagos exitosos' },
    { title: 'Tiempo Promedio', value: '2.3s', change: -5.4, trend: 'up' as const, icon: Clock, color: 'bg-indigo-500', description: 'Procesamiento de pagos' }
  ];

  // Datos simulados de recibos con información de comisiones para admin
  const mockReceipts: AdminReceipt[] = [
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
      receipt_number: 'REC-2024-002',
      client_id: 'CLI-002',
      client_name: 'Obras Públicas del Norte S.A.',
      client_email: 'maria@obrasnorte.es',
      client_address: 'Avenida Industrial 45, 48001 Bilbao',
      client_tax_id: 'A87654321',
      amount: 299.00,
      gross_amount: 309.17,
      commission: 10.17,
      currency: 'EUR',
      payment_method: 'Transferencia SEPA',
      gateway_name: 'SEPA',
      description: 'Suscripción Plan Empresarial - Enero 2024',
      payment_date: '2024-01-26T15:45:00Z',
      status: 'paid',
      transaction_id: 'sepa_9876543210',
      invoice_items: [
        {
          description: 'Plan Empresarial ConstructIA - Enero 2024',
          quantity: 1,
          unit_price: 247.11,
          total: 247.11
        }
      ],
      tax_details: {
        base: 247.11,
        iva_rate: 21,
        iva_amount: 51.89,
        total: 299.00
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
      receipt_number: 'REC-2024-003',
      client_id: 'CLI-003',
      client_name: 'Reformas Integrales López',
      client_email: 'carlos@reformaslopez.com',
      client_address: 'Plaza España 8, 46001 Valencia',
      client_tax_id: 'B11223344',
      amount: 79.00,
      gross_amount: 81.69,
      commission: 2.69,
      currency: 'EUR',
      payment_method: 'PayPal',
      gateway_name: 'PayPal',
      description: 'Compra de Tokens - Paquete Profesional',
      payment_date: '2024-01-25T09:15:00Z',
      status: 'paid',
      transaction_id: 'pp_tokens_001',
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
                           receipt.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           receipt.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           receipt.transaction_id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || receipt.status === filterStatus;
      const matchesGateway = filterGateway === 'all' || receipt.gateway_name === filterGateway;
      
      return matchesSearch && matchesStatus && matchesGateway;
    });

    setFilteredReceipts(filtered);
  }, [receipts, searchTerm, filterStatus, filterGateway]);

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

  const handleViewReceipt = (receipt: AdminReceipt) => {
    setSelectedReceipt(receipt);
    setShowReceiptModal(true);
  };

  const exportReceipts = () => {
    const csvContent = [
      ['Número', 'Cliente', 'Descripción', 'Importe', 'Comisión', 'Neto', 'Pasarela', 'Estado', 'Fecha'].join(','),
      ...filteredReceipts.map(receipt => [
        receipt.receipt_number,
        receipt.client_name,
        `"${receipt.description}"`,
        receipt.amount,
        receipt.commission,
        (receipt.amount - receipt.commission).toFixed(2),
        receipt.gateway_name,
        receipt.status,
        new Date(receipt.payment_date).toLocaleDateString('es-ES')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recibos_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const gateways = [...new Set(receipts.map(r => r.gateway_name))];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gestión de Recibos</h2>
          <p className="text-gray-600">Administración completa de recibos y facturación</p>
        </div>
        <button
          onClick={exportReceipts}
          className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          <Download className="h-4 w-4 mr-2" />
          Exportar ({filteredReceipts.length})
        </button>
      </div>

      {/* KPIs de Recibos */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Métricas de Facturación</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          {receiptKPIs.map((kpi, index) => (
            <ReceiptKPICard key={index} {...kpi} />
          ))}
        </div>
      </div>

      {/* Resumen de Comisiones por Pasarela */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Análisis de Comisiones por Pasarela</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <CreditCard className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-blue-800">Stripe</p>
            <p className="text-2xl font-bold text-blue-600">€1,234</p>
            <p className="text-xs text-blue-700">Comisiones este mes</p>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Building2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-green-800">SEPA</p>
            <p className="text-2xl font-bold text-green-600">€456</p>
            <p className="text-xs text-green-700">Comisiones este mes</p>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Euro className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-purple-800">PayPal</p>
            <p className="text-2xl font-bold text-purple-600">€567</p>
            <p className="text-xs text-purple-700">Comisiones este mes</p>
          </div>
          
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <BarChart3 className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-orange-800">Bizum</p>
            <p className="text-2xl font-bold text-orange-600">€83</p>
            <p className="text-xs text-orange-700">Comisiones este mes</p>
          </div>
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
                placeholder="Buscar por número, cliente, descripción o transacción..."
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
          
          <select
            value={filterGateway}
            onChange={(e) => setFilterGateway(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="all">Todas las pasarelas</option>
            {gateways.map(gateway => (
              <option key={gateway} value={gateway}>{gateway}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de Recibos con Información de Comisiones */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recibo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Importe Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comisión</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Neto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pasarela</th>
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
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{receipt.client_name}</div>
                        <div className="text-sm text-gray-500">{receipt.client_id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{receipt.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{formatCurrency(receipt.amount)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-red-600">-{formatCurrency(receipt.commission)}</div>
                    <div className="text-xs text-gray-500">
                      {((receipt.commission / receipt.gross_amount) * 100).toFixed(2)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-green-600">
                      {formatCurrency(receipt.amount - receipt.commission)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{receipt.gateway_name}</div>
                    <div className="text-sm text-gray-500">{receipt.payment_method}</div>
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