import React, { useState } from 'react';
import { 
  Download, 
  Mail, 
  FileText, 
  Calendar,
  Building2,
  CreditCard,
  CheckCircle,
  Euro,
  Printer,
  Eye,
  X
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ReceiptData {
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
  due_date?: string;
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

interface ReceiptGeneratorProps {
  receiptData: ReceiptData;
  onEmailSent?: () => void;
  showActions?: boolean;
  isPreview?: boolean;
}

export default function ReceiptGenerator({ 
  receiptData, 
  onEmailSent, 
  showActions = true,
  isPreview = false 
}: ReceiptGeneratorProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [showPreview, setShowPreview] = useState(isPreview);

  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const element = document.getElementById('receipt-content');
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Recibo_${receiptData.receipt_number}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error al generar el PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const sendEmail = async () => {
    setIsSendingEmail(true);
    try {
      // Simular envío de email
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert(`Recibo enviado exitosamente a ${receiptData.client_email}`);
      onEmailSent?.();
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Error al enviar el email');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: receiptData.currency
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'PAGADO';
      case 'pending': return 'PENDIENTE';
      case 'failed': return 'FALLIDO';
      default: return status.toUpperCase();
    }
  };

  return (
    <>
      {/* Actions Bar */}
      {showActions && (
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Recibo #{receiptData.receipt_number}
            </h3>
            <p className="text-sm text-gray-600">
              {receiptData.client_name} • {formatDate(receiptData.payment_date)}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowPreview(true)}
              className="flex items-center px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Eye className="h-4 w-4 mr-2" />
              Vista Previa
            </button>
            <button
              onClick={generatePDF}
              disabled={isGeneratingPDF}
              className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {isGeneratingPDF ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Descargar PDF
            </button>
            <button
              onClick={sendEmail}
              disabled={isSendingEmail}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {isSendingEmail ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Mail className="h-4 w-4 mr-2" />
              )}
              Enviar por Email
            </button>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                Vista Previa del Recibo
              </h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <ReceiptContent receiptData={receiptData} />
            </div>
            <div className="flex justify-end space-x-3 p-4 border-t border-gray-200">
              <button
                onClick={generatePDF}
                disabled={isGeneratingPDF}
                className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {isGeneratingPDF ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Descargar PDF
              </button>
              <button
                onClick={sendEmail}
                disabled={isSendingEmail}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {isSendingEmail ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Mail className="h-4 w-4 mr-2" />
                )}
                Enviar por Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Content (hidden for PDF generation) */}
      <div id="receipt-content" className="hidden">
        <ReceiptContent receiptData={receiptData} />
      </div>
    </>
  );
}

// Componente separado para el contenido del recibo
function ReceiptContent({ receiptData }: { receiptData: ReceiptData }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: receiptData.currency
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'PAGADO';
      case 'pending': return 'PENDIENTE';
      case 'failed': return 'FALLIDO';
      default: return status.toUpperCase();
    }
  };

  return (
    <div className="bg-white p-8 max-w-4xl mx-auto" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mr-4">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">ConstructIA</h1>
              <p className="text-green-600 font-medium">Gestión Documental Inteligente</p>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            <p>{receiptData.company_details.address}</p>
            <p>CIF: {receiptData.company_details.tax_id}</p>
            <p>Tel: {receiptData.company_details.phone}</p>
            <p>Email: {receiptData.company_details.email}</p>
            <p>Web: {receiptData.company_details.website}</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="mb-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">RECIBO</h2>
            <div className={`inline-flex px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(receiptData.status)}`}>
              {getStatusText(receiptData.status)}
            </div>
          </div>
          <div className="text-sm text-gray-600">
            <p><strong>Nº Recibo:</strong> {receiptData.receipt_number}</p>
            <p><strong>Fecha:</strong> {formatDate(receiptData.payment_date)}</p>
            <p><strong>ID Transacción:</strong> {receiptData.transaction_id}</p>
          </div>
        </div>
      </div>

      {/* Client Information */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Datos del Cliente</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="font-semibold text-gray-900">{receiptData.client_name}</p>
            <p className="text-gray-600">{receiptData.client_address}</p>
            <p className="text-gray-600">Email: {receiptData.client_email}</p>
          </div>
          <div>
            <p className="text-gray-600">
              <strong>CIF/NIF:</strong> {receiptData.client_tax_id}
            </p>
            <p className="text-gray-600">
              <strong>ID Cliente:</strong> {receiptData.client_id}
            </p>
          </div>
        </div>
      </div>

      {/* Invoice Items */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalle del Servicio</h3>
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Descripción</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 border-b">Cantidad</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 border-b">Precio Unitario</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 border-b">Total</th>
              </tr>
            </thead>
            <tbody>
              {receiptData.invoice_items.map((item, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-center">{item.quantity}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(item.unit_price)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right font-semibold">{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de Pago</h3>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <CreditCard className="h-5 w-5 text-blue-600 mr-2" />
              <span className="font-semibold text-blue-900">Método de Pago</span>
            </div>
            <p className="text-blue-800">{receiptData.gateway_name}</p>
            <p className="text-sm text-blue-600">{receiptData.payment_method}</p>
            <p className="text-xs text-blue-500 mt-2">
              Procesado el {formatDate(receiptData.payment_date)}
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen Fiscal</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Base Imponible:</span>
              <span className="font-semibold">{formatCurrency(receiptData.tax_details.base)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">IVA ({receiptData.tax_details.iva_rate}%):</span>
              <span className="font-semibold">{formatCurrency(receiptData.tax_details.iva_amount)}</span>
            </div>
            <div className="border-t border-gray-200 pt-3">
              <div className="flex justify-between text-lg">
                <span className="font-bold text-gray-900">TOTAL:</span>
                <span className="font-bold text-green-600">{formatCurrency(receiptData.amount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Confirmation */}
      {receiptData.status === 'paid' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <div className="flex items-center">
            <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
            <div>
              <h4 className="font-semibold text-green-900">Pago Confirmado</h4>
              <p className="text-green-700 text-sm">
                El pago ha sido procesado exitosamente el {formatDate(receiptData.payment_date)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-gray-200 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Términos y Condiciones</h4>
            <p className="text-xs text-gray-600">
              Este recibo confirma el pago del servicio de gestión documental inteligente de ConstructIA. 
              El servicio incluye procesamiento con IA, almacenamiento seguro e integración con Obralia/Nalanda.
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">
              Recibo generado automáticamente por ConstructIA
            </p>
            <p className="text-xs text-gray-500">
              {new Date().toLocaleDateString('es-ES')} - {new Date().toLocaleTimeString('es-ES')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}