import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Eye,
  Search,
  Filter,
  Calendar,
  Building,
  CheckCircle,
  Clock,
  AlertTriangle,
  Users,
  Euro,
  Shield,
  Signature,
  CreditCard
} from 'lucide-react';
import jsPDF from 'jspdf';
import { supabase } from '../../lib/supabase';

interface SEPAMandate {
  id: string;
  mandate_id: string;
  client_id: string;
  deudor_nombre: string;
  deudor_direccion: string;
  deudor_codigo_postal: string;
  deudor_ciudad: string;
  deudor_pais: string;
  deudor_identificacion: string;
  iban: string;
  bic: string;
  banco_nombre: string;
  tipo_pago: 'recurrente' | 'unico';
  amount: number;
  currency: string;
  description: string;
  fecha_firma: string;
  ip_address: string;
  user_agent: string;
  session_id: string;
  status: 'active' | 'cancelled' | 'expired';
  created_at: string;
  client_name?: string;
  client_email?: string;
}

export default function SEPAMandatesManagement() {
  const [mandates, setMandates] = useState<SEPAMandate[]>([]);
  const [filteredMandates, setFilteredMandates] = useState<SEPAMandate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedMandate, setSelectedMandate] = useState<SEPAMandate | null>(null);
  const [showMandateModal, setShowMandateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMandates();
  }, []);

  useEffect(() => {
    let filtered = mandates.filter(mandate => {
      const matchesSearch = mandate.mandate_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           mandate.deudor_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           mandate.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           mandate.iban.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || mandate.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });

    setFilteredMandates(filtered);
  }, [mandates, searchTerm, filterStatus]);

  const loadMandates = async () => {
    try {
      // Simular datos de mandatos SEPA
      const mockMandates: SEPAMandate[] = [
        {
          id: '1',
          mandate_id: 'SEPA-2024-001',
          client_id: 'CLI-001',
          deudor_nombre: 'Construcciones García S.L.',
          deudor_direccion: 'Calle Mayor 123',
          deudor_codigo_postal: '28001',
          deudor_ciudad: 'Madrid',
          deudor_pais: 'España',
          deudor_identificacion: 'B12345678',
          iban: 'ES9121000418450200051332',
          bic: 'CAIXESBBXXX',
          banco_nombre: 'CaixaBank',
          tipo_pago: 'recurrente',
          amount: 149.00,
          currency: 'EUR',
          description: 'Suscripción Plan Profesional',
          fecha_firma: '2024-01-27T10:30:00Z',
          ip_address: '192.168.1.100',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          session_id: 'session_1234567890',
          status: 'active',
          created_at: '2024-01-27T10:30:00Z',
          client_name: 'Construcciones García S.L.',
          client_email: 'juan@construccionesgarcia.com'
        }
      ];
      
      setMandates(mockMandates);
      setFilteredMandates(mockMandates);
    } catch (error) {
      console.error('Error loading SEPA mandates:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cancelled': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'expired': return <Clock className="h-4 w-4 text-yellow-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatIBAN = (iban: string) => {
    return iban.replace(/(.{4})/g, '$1 ').trim();
  };

  const generateMandatePDF = (mandate: SEPAMandate) => {
    const pdf = new jsPDF();
    
    // Header
    pdf.setFontSize(20);
    pdf.text('MANDATO DE DOMICILIACIÓN SEPA', 20, 30);
    
    pdf.setFontSize(12);
    pdf.text(`ID Mandato: ${mandate.mandate_id}`, 20, 50);
    pdf.text(`Fecha de Firma: ${new Date(mandate.fecha_firma).toLocaleDateString('es-ES')}`, 20, 60);
    
    // Datos del Acreedor
    pdf.setFontSize(14);
    pdf.text('DATOS DEL ACREEDOR', 20, 80);
    pdf.setFontSize(10);
    pdf.text('ConstructIA S.L.', 20, 95);
    pdf.text('Calle Innovación 123, 28001 Madrid, España', 20, 105);
    pdf.text('CIF: B87654321', 20, 115);
    
    // Datos del Deudor
    pdf.setFontSize(14);
    pdf.text('DATOS DEL DEUDOR', 20, 135);
    pdf.setFontSize(10);
    pdf.text(`Nombre: ${mandate.deudor_nombre}`, 20, 150);
    pdf.text(`Dirección: ${mandate.deudor_direccion}`, 20, 160);
    pdf.text(`${mandate.deudor_codigo_postal} ${mandate.deudor_ciudad}, ${mandate.deudor_pais}`, 20, 170);
    pdf.text(`Identificación: ${mandate.deudor_identificacion}`, 20, 180);
    
    // Datos Bancarios
    pdf.setFontSize(14);
    pdf.text('DATOS BANCARIOS', 20, 200);
    pdf.setFontSize(10);
    pdf.text(`IBAN: ${formatIBAN(mandate.iban)}`, 20, 215);
    pdf.text(`BIC: ${mandate.bic}`, 20, 225);
    pdf.text(`Banco: ${mandate.banco_nombre}`, 20, 235);
    
    // Detalles del Pago
    pdf.setFontSize(14);
    pdf.text('DETALLES DEL PAGO', 20, 255);
    pdf.setFontSize(10);
    pdf.text(`Tipo: ${mandate.tipo_pago === 'recurrente' ? 'Pago Recurrente' : 'Pago Único'}`, 20, 270);
    pdf.text(`Importe: ${mandate.currency} ${mandate.amount.toFixed(2)}`, 20, 280);
    pdf.text(`Concepto: ${mandate.description}`, 20, 290);
    
    // Firma Digital
    pdf.setFontSize(12);
    pdf.text('FIRMA DIGITAL', 20, 310);
    pdf.setFontSize(8);
    pdf.text(`IP: ${mandate.ip_address}`, 20, 325);
    pdf.text(`Navegador: ${mandate.user_agent.substring(0, 50)}...`, 20, 335);
    pdf.text(`Sesión: ${mandate.session_id}`, 20, 345);
    
    pdf.save(`Mandato_SEPA_${mandate.mandate_id}.pdf`);
  };

  const handleViewMandate = (mandate: SEPAMandate) => {
    setSelectedMandate(mandate);
    setShowMandateModal(true);
  };

  const exportMandates = () => {
    const csvContent = [
      ['ID Mandato', 'Cliente', 'IBAN', 'Importe', 'Tipo', 'Estado', 'Fecha Firma'].join(','),
      ...filteredMandates.map(mandate => [
        mandate.mandate_id,
        mandate.deudor_nombre,
        mandate.iban,
        mandate.amount,
        mandate.tipo_pago,
        mandate.status,
        new Date(mandate.fecha_firma).toLocaleDateString('es-ES')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mandatos_sepa_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Mandatos SEPA</h2>
          <p className="text-gray-600">Gestión de mandatos de domiciliación bancaria</p>
        </div>
        <button
          onClick={exportMandates}
          className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          <Download className="h-4 w-4 mr-2" />
          Exportar ({filteredMandates.length})
        </button>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por ID mandato, cliente o IBAN..."
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
            <option value="active">Activo</option>
            <option value="cancelled">Cancelado</option>
            <option value="expired">Expirado</option>
          </select>
        </div>
      </div>

      {/* Lista de Mandatos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mandato</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Datos Bancarios</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Importe</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Firma</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMandates.map((mandate) => (
                <tr key={mandate.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-blue-600 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{mandate.mandate_id}</div>
                        <div className="text-sm text-gray-500">{mandate.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{mandate.deudor_nombre}</div>
                        <div className="text-sm text-gray-500">{mandate.client_email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{formatIBAN(mandate.iban)}</div>
                      <div className="text-sm text-gray-500">{mandate.banco_nombre}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {mandate.currency} {mandate.amount.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      mandate.tipo_pago === 'recurrente' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {mandate.tipo_pago === 'recurrente' ? 'Recurrente' : 'Único'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(mandate.status)}
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(mandate.status)}`}>
                        {mandate.status === 'active' ? 'Activo' : mandate.status === 'cancelled' ? 'Cancelado' : 'Expirado'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(mandate.fecha_firma).toLocaleDateString('es-ES')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewMandate(mandate)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Ver mandato"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => generateMandatePDF(mandate)}
                        className="text-green-600 hover:text-green-900"
                        title="Descargar PDF"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredMandates.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">No se encontraron mandatos</h3>
          <p className="text-gray-600">
            {searchTerm ? 'Intenta con otros términos de búsqueda' : 'No hay mandatos SEPA registrados'}
          </p>
        </div>
      )}

      {/* Modal de Detalles del Mandato */}
      {showMandateModal && selectedMandate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">
                  Detalles del Mandato SEPA
                </h3>
                <button
                  onClick={() => setShowMandateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Información del Mandato */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-3">Información del Mandato</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700 font-medium">ID Mandato:</span>
                    <p className="text-blue-600">{selectedMandate.mandate_id}</p>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Fecha de Firma:</span>
                    <p className="text-blue-600">{new Date(selectedMandate.fecha_firma).toLocaleString('es-ES')}</p>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Estado:</span>
                    <p className="text-blue-600">{selectedMandate.status}</p>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Tipo:</span>
                    <p className="text-blue-600">{selectedMandate.tipo_pago}</p>
                  </div>
                </div>
              </div>

              {/* Datos del Deudor */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-3">Datos del Deudor</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-700 font-medium">Nombre:</span>
                    <p className="text-gray-600">{selectedMandate.deudor_nombre}</p>
                  </div>
                  <div>
                    <span className="text-gray-700 font-medium">Identificación:</span>
                    <p className="text-gray-600">{selectedMandate.deudor_identificacion}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-700 font-medium">Dirección:</span>
                    <p className="text-gray-600">
                      {selectedMandate.deudor_direccion}, {selectedMandate.deudor_codigo_postal} {selectedMandate.deudor_ciudad}, {selectedMandate.deudor_pais}
                    </p>
                  </div>
                </div>
              </div>

              {/* Datos Bancarios */}
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-3">Datos Bancarios</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-green-700 font-medium">IBAN:</span>
                    <p className="text-green-600 font-mono">{formatIBAN(selectedMandate.iban)}</p>
                  </div>
                  <div>
                    <span className="text-green-700 font-medium">BIC:</span>
                    <p className="text-green-600 font-mono">{selectedMandate.bic}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-green-700 font-medium">Banco:</span>
                    <p className="text-green-600">{selectedMandate.banco_nombre}</p>
                  </div>
                </div>
              </div>

              {/* Información de Auditoría */}
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-semibold text-purple-800 mb-3">Información de Auditoría</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-purple-700 font-medium">IP Address:</span>
                    <p className="text-purple-600">{selectedMandate.ip_address}</p>
                  </div>
                  <div>
                    <span className="text-purple-700 font-medium">Sesión:</span>
                    <p className="text-purple-600">{selectedMandate.session_id}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-purple-700 font-medium">User Agent:</span>
                    <p className="text-purple-600 text-xs break-all">{selectedMandate.user_agent}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => generateMandatePDF(selectedMandate)}
                className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar PDF
              </button>
              <button
                onClick={() => setShowMandateModal(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
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