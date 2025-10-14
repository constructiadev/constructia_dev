import { supabaseServiceClient } from './supabase-real';

export interface ReceiptData {
  client_id: string;
  client_name: string;
  client_email: string;
  client_company_name: string;
  client_tax_id: string;
  client_address: string;
  amount: number;
  base_amount: number;
  tax_amount: number;
  tax_rate: number;
  currency: string;
  payment_method: string;
  gateway_name: string;
  description: string;
  subscription_plan: string;
  transaction_id: string;
  invoice_items?: any[];
}

export class ReceiptService {
  private static readonly COMPANY_DETAILS = {
    name: 'ConstructIA S.L.',
    address: 'Calle Innovación 123, 28001 Madrid, España',
    tax_id: 'B87654321',
    phone: '+34 91 000 00 00',
    email: 'facturacion@constructia.com',
    website: 'www.constructia.com',
    logo_url: '/Logo ConstructIA2.png'
  };

  static async createReceipt(data: ReceiptData): Promise<string> {
    try {
      console.log('📄 [ReceiptService] Creating receipt for:', data.client_company_name);

      const receiptHTML = this.generateReceiptHTML(data);

      const receiptRecord = {
        client_id: data.client_id,
        amount: data.amount,
        base_amount: data.base_amount,
        tax_amount: data.tax_amount,
        tax_rate: data.tax_rate,
        currency: data.currency,
        payment_method: data.payment_method,
        gateway_name: data.gateway_name,
        description: data.description,
        subscription_plan: data.subscription_plan,
        transaction_id: data.transaction_id,
        status: 'paid',
        payment_date: new Date().toISOString(),
        receipt_html: receiptHTML,
        client_company_name: data.client_company_name,
        client_tax_id: data.client_tax_id,
        client_details: {
          name: data.client_name,
          email: data.client_email,
          company: data.client_company_name,
          tax_id: data.client_tax_id,
          address: data.client_address
        },
        company_details: this.COMPANY_DETAILS,
        invoice_items: data.invoice_items || [],
        metadata: {
          created_by: 'system',
          source: 'registration',
          subscription_plan: data.subscription_plan
        }
      };

      const { data: receipt, error } = await supabaseServiceClient
        .from('receipts')
        .insert(receiptRecord)
        .select('id, receipt_number')
        .single();

      if (error) {
        console.error('❌ [ReceiptService] Error creating receipt:', error);
        throw new Error(`Error al crear el recibo: ${error.message}`);
      }

      console.log('✅ [ReceiptService] Receipt created successfully:', receipt.receipt_number);
      return receipt.receipt_number;

    } catch (error) {
      console.error('❌ [ReceiptService] Fatal error creating receipt:', error);
      throw error;
    }
  }

  static generateReceiptHTML(data: ReceiptData): string {
    const currentDate = new Date().toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    const currentTime = new Date().toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recibo - ${data.client_company_name}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f5f5f5;
      padding: 20px;
    }

    .receipt-container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      box-shadow: 0 0 20px rgba(0,0,0,0.1);
      border-radius: 8px;
      overflow: hidden;
    }

    .header {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 40px 40px 30px;
      position: relative;
    }

    .header::after {
      content: '';
      position: absolute;
      bottom: -20px;
      left: 0;
      right: 0;
      height: 20px;
      background: white;
      border-radius: 50% 50% 0 0 / 100% 100% 0 0;
    }

    .logo-section {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
    }

    .logo {
      font-size: 28px;
      font-weight: bold;
      letter-spacing: -0.5px;
    }

    .receipt-badge {
      background: rgba(255,255,255,0.2);
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
    }

    .receipt-title {
      font-size: 36px;
      font-weight: 700;
      margin-bottom: 5px;
    }

    .receipt-subtitle {
      font-size: 16px;
      opacity: 0.9;
    }

    .content {
      padding: 50px 40px 40px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin-bottom: 40px;
    }

    .info-block {
      border-left: 3px solid #10b981;
      padding-left: 15px;
    }

    .info-label {
      font-size: 12px;
      text-transform: uppercase;
      color: #6b7280;
      font-weight: 600;
      letter-spacing: 0.5px;
      margin-bottom: 5px;
    }

    .info-value {
      font-size: 15px;
      color: #1f2937;
      font-weight: 500;
    }

    .info-value.large {
      font-size: 18px;
      color: #10b981;
      font-weight: 700;
    }

    .details-section {
      background: #f9fafb;
      border-radius: 8px;
      padding: 30px;
      margin-bottom: 30px;
    }

    .section-title {
      font-size: 18px;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e5e7eb;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #e5e7eb;
    }

    .detail-row:last-child {
      border-bottom: none;
    }

    .detail-label {
      color: #6b7280;
      font-size: 14px;
    }

    .detail-value {
      color: #1f2937;
      font-weight: 600;
      font-size: 14px;
    }

    .amount-section {
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      border-radius: 8px;
      padding: 25px 30px;
      margin-bottom: 30px;
    }

    .amount-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .amount-row:last-child {
      margin-bottom: 0;
      padding-top: 15px;
      border-top: 2px solid #10b981;
      margin-top: 10px;
    }

    .amount-label {
      font-size: 14px;
      color: #374151;
    }

    .amount-value {
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
    }

    .total-label {
      font-size: 20px;
      font-weight: 700;
      color: #059669;
    }

    .total-value {
      font-size: 32px;
      font-weight: 800;
      color: #059669;
    }

    .footer {
      background: #f9fafb;
      padding: 30px 40px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }

    .company-info {
      font-size: 12px;
      color: #6b7280;
      line-height: 1.8;
      margin-bottom: 15px;
    }

    .legal-notice {
      font-size: 11px;
      color: #9ca3af;
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid #e5e7eb;
    }

    .qr-placeholder {
      width: 100px;
      height: 100px;
      background: white;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      display: inline-block;
      margin: 15px 0;
    }

    .status-badge {
      display: inline-block;
      background: #10b981;
      color: white;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 20px;
    }

    @media print {
      body {
        background: white;
        padding: 0;
      }

      .receipt-container {
        box-shadow: none;
        max-width: none;
      }
    }

    @media (max-width: 600px) {
      .content, .header, .footer {
        padding-left: 20px;
        padding-right: 20px;
      }

      .info-grid {
        grid-template-columns: 1fr;
        gap: 20px;
      }

      .receipt-title {
        font-size: 28px;
      }
    }
  </style>
</head>
<body>
  <div class="receipt-container">
    <!-- Header -->
    <div class="header">
      <div class="logo-section">
        <div class="logo">⚡ ConstructIA</div>
        <div class="receipt-badge">RECIBO OFICIAL</div>
      </div>
      <div class="receipt-title">Recibo de Pago</div>
      <div class="receipt-subtitle">Confirmación de Transacción Exitosa</div>
    </div>

    <!-- Content -->
    <div class="content">
      <div class="status-badge">✓ PAGO COMPLETADO</div>

      <!-- Info Grid -->
      <div class="info-grid">
        <div class="info-block">
          <div class="info-label">Número de Recibo</div>
          <div class="info-value large">[Generado automáticamente]</div>
        </div>
        <div class="info-block">
          <div class="info-label">Fecha de Emisión</div>
          <div class="info-value">${currentDate} - ${currentTime}</div>
        </div>
        <div class="info-block">
          <div class="info-label">ID de Transacción</div>
          <div class="info-value">${data.transaction_id}</div>
        </div>
        <div class="info-block">
          <div class="info-label">Método de Pago</div>
          <div class="info-value">${data.gateway_name} (${data.payment_method})</div>
        </div>
      </div>

      <!-- Client Details -->
      <div class="details-section">
        <div class="section-title">Datos del Cliente</div>
        <div class="detail-row">
          <span class="detail-label">Nombre / Razón Social</span>
          <span class="detail-value">${data.client_company_name}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">CIF/NIF</span>
          <span class="detail-value">${data.client_tax_id}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Email</span>
          <span class="detail-value">${data.client_email}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Dirección</span>
          <span class="detail-value">${data.client_address}</span>
        </div>
      </div>

      <!-- Transaction Details -->
      <div class="details-section">
        <div class="section-title">Detalles de la Transacción</div>
        <div class="detail-row">
          <span class="detail-label">Descripción</span>
          <span class="detail-value">${data.description}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Plan de Suscripción</span>
          <span class="detail-value">${data.subscription_plan}</span>
        </div>
      </div>

      <!-- Amount Section -->
      <div class="amount-section">
        <div class="amount-row">
          <span class="amount-label">Base Imponible</span>
          <span class="amount-value">${data.base_amount.toFixed(2)} ${data.currency}</span>
        </div>
        <div class="amount-row">
          <span class="amount-label">IVA (${data.tax_rate}%)</span>
          <span class="amount-value">${data.tax_amount.toFixed(2)} ${data.currency}</span>
        </div>
        <div class="amount-row">
          <span class="total-label">Total Pagado</span>
          <span class="total-value">${data.amount.toFixed(2)} ${data.currency}</span>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="company-info">
        <strong>${this.COMPANY_DETAILS.name}</strong><br>
        ${this.COMPANY_DETAILS.address}<br>
        CIF: ${this.COMPANY_DETAILS.tax_id}<br>
        Tel: ${this.COMPANY_DETAILS.phone} | Email: ${this.COMPANY_DETAILS.email}<br>
        ${this.COMPANY_DETAILS.website}
      </div>

      <div class="legal-notice">
        Este documento constituye un recibo oficial de pago.
        Conserve este recibo para sus registros contables.
        Para cualquier consulta, póngase en contacto con nuestro departamento de facturación.
        <br><br>
        Documento generado electrónicamente • Válido sin firma ni sello
        <br>
        © ${new Date().getFullYear()} ${this.COMPANY_DETAILS.name} - Todos los derechos reservados
      </div>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  static async getClientReceipts(clientId: string) {
    try {
      const { data, error } = await supabaseServiceClient
        .from('receipts')
        .select('*')
        .eq('client_id', clientId)
        .order('payment_date', { ascending: false });

      if (error) {
        console.error('❌ [ReceiptService] Error fetching receipts:', error);
        throw new Error(`Error al obtener recibos: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('❌ [ReceiptService] Fatal error fetching receipts:', error);
      throw error;
    }
  }

  static async getAllReceipts() {
    try {
      const { data, error } = await supabaseServiceClient
        .from('receipts')
        .select(`
          *,
          clients:client_id (
            company_name,
            email,
            subscription_plan
          )
        `)
        .order('payment_date', { ascending: false });

      if (error) {
        console.error('❌ [ReceiptService] Error fetching all receipts:', error);
        throw new Error(`Error al obtener recibos: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('❌ [ReceiptService] Fatal error fetching all receipts:', error);
      throw error;
    }
  }

  static async trackView(receiptId: string) {
    try {
      const { error } = await supabaseServiceClient
        .rpc('track_receipt_view', { receipt_id: receiptId });

      if (error) {
        console.error('❌ [ReceiptService] Error tracking view:', error);
      }
    } catch (error) {
      console.error('❌ [ReceiptService] Fatal error tracking view:', error);
    }
  }

  static async trackDownload(receiptId: string) {
    try {
      const { error } = await supabaseServiceClient
        .rpc('track_receipt_download', { receipt_id: receiptId });

      if (error) {
        console.error('❌ [ReceiptService] Error tracking download:', error);
      }
    } catch (error) {
      console.error('❌ [ReceiptService] Fatal error tracking download:', error);
    }
  }

  static async getFinancialKPIs() {
    try {
      const { data, error } = await supabaseServiceClient
        .from('financial_kpis')
        .select('*')
        .single();

      if (error) {
        console.error('❌ [ReceiptService] Error fetching KPIs:', error);
        throw new Error(`Error al obtener KPIs: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('❌ [ReceiptService] Fatal error fetching KPIs:', error);
      throw error;
    }
  }

  static async getReceiptAnalytics(clientId?: string) {
    try {
      let query = supabaseServiceClient.from('receipt_analytics').select('*');

      if (clientId) {
        query = query.eq('client_id', clientId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ [ReceiptService] Error fetching analytics:', error);
        throw new Error(`Error al obtener análisis: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('❌ [ReceiptService] Fatal error fetching analytics:', error);
      throw error;
    }
  }

  static downloadReceiptHTML(receiptHTML: string, receiptNumber: string) {
    const blob = new Blob([receiptHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `recibo_${receiptNumber}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  static printReceipt(receiptHTML: string) {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(receiptHTML);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  }
}
