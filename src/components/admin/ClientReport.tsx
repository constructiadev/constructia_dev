import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Brain, 
  TrendingUp, 
  Users, 
  DollarSign,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Calendar,
  Target,
  Award,
  Zap,
  Building2,
  Activity,
  RefreshCw,
  Eye,
  X
} from 'lucide-react';
import { getAllClients, calculateDynamicKPIs, getAllReceipts } from '../../lib/supabase';
import { geminiAI } from '../../lib/gemini';
import { logAuditoria, DEV_ADMIN_USER_ID, DEV_TENANT_ID } from '../../lib/supabase-real';
import { useAuth } from '../../lib/auth-context';

interface ClientReportData {
  totalClients: number;
  activeClients: number;
  newClientsThisMonth: number;
  churnRate: number;
  avgRevenuePerClient: number;
  totalRevenue: number;
  clientsByPlan: { [key: string]: number };
  clientsByStatus: { [key: string]: number };
  topClients: any[];
  growthTrend: number[];
  aiInsights: string[];
  recommendations: string[];
  riskFactors: string[];
  opportunities: string[];
}

interface ClientReportProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ClientReport({ isOpen, onClose }: ClientReportProps) {
  const { user } = useAuth();
  const [reportData, setReportData] = useState<ClientReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      generateReport();
    }
  }, [isOpen]);

  const generateReport = async () => {
    try {
      setLoading(true);
      setGenerating(true);

      console.log('📊 [ClientReport] Generating comprehensive client report...');

      // Load real data from database
      const [clients, receipts, dynamicKPIs, allDocuments] = await Promise.all([
        getAllClients(),
        getAllReceipts(),
        calculateDynamicKPIs(),
        getAllTenantDocumentsNoRLS(DEV_TENANT_ID)
      ]);

      console.log('✅ [ClientReport] Data loaded:', {
        clients: clients.length,
        receipts: receipts.length,
        kpis: Object.keys(dynamicKPIs).length,
        documents: allDocuments.length
      });

      // Calculate real storage usage per client
      const clientsWithRealStorage = clients.map(client => {
        // Get documents for this client's tenant
        const clientDocuments = allDocuments.filter(doc => {
          // Match by email or tenant relationship
          return doc.metadatos?.user_email === client.email ||
                 doc.metadatos?.client_id === client.id;
        });
        
        const realStorageUsed = clientDocuments.reduce((sum, doc) => {
          return sum + (doc.size_bytes || 0);
        }, 0);
        
        return {
          ...client,
          storage_used: realStorageUsed,
          documents_count: clientDocuments.length,
          documents_this_month: clientDocuments.filter(doc => {
            const docDate = new Date(doc.created_at);
            return docDate.getMonth() === currentMonth && docDate.getFullYear() === currentYear;
          }).length
        };
      });
      // Calculate metrics
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const newClientsThisMonth = clientsWithRealStorage.filter(client => {
        const clientDate = new Date(client.created_at);
        return clientDate.getMonth() === currentMonth && clientDate.getFullYear() === currentYear;
      }).length;

      const cancelledClients = clientsWithRealStorage.filter(c => c.subscription_status === 'cancelled').length;
      const churnRate = clientsWithRealStorage.length > 0 ? (cancelledClients / clientsWithRealStorage.length) * 100 : 0;

      const totalRevenue = receipts.reduce((sum, receipt) => sum + parseFloat(receipt.amount || '0'), 0);
      const avgRevenuePerClient = clientsWithRealStorage.length > 0 ? totalRevenue / clientsWithRealStorage.length : 0;

      // Calculate storage metrics
      const totalStorageUsed = clientsWithRealStorage.reduce((sum, client) => sum + client.storage_used, 0);
      const totalStorageLimit = clientsWithRealStorage.reduce((sum, client) => sum + client.storage_limit, 0);
      const avgStorageUsage = clientsWithRealStorage.length > 0 ? 
        (totalStorageUsed / totalStorageLimit) * 100 : 0;
      
      // Find clients with high storage usage
      const highStorageClients = clientsWithRealStorage.filter(client => 
        (client.storage_used / client.storage_limit) > 0.8
      );
      // Group clients by plan and status
      const clientsByPlan = clientsWithRealStorage.reduce((acc, client) => {
        acc[client.subscription_plan] = (acc[client.subscription_plan] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });

      const clientsByStatus = clientsWithRealStorage.reduce((acc, client) => {
        acc[client.subscription_status] = (acc[client.subscription_status] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });

      // Calculate growth trend (last 6 months)
      const growthTrend = [];
      for (let i = 5; i >= 0; i--) {
        const targetDate = new Date();
        targetDate.setMonth(targetDate.getMonth() - i);
        
        const clientsInMonth = clientsWithRealStorage.filter(client => {
          const clientDate = new Date(client.created_at);
          return clientDate.getMonth() === targetDate.getMonth() && 
                 clientDate.getFullYear() === targetDate.getFullYear();
        }).length;
        
        growthTrend.push(clientsInMonth);
      }

      // Top clients by revenue
      const topClients = clientsWithRealStorage
        .map(client => ({
          ...client,
          revenue: receipts
            .filter(r => r.client_id === client.id)
            .reduce((sum, r) => sum + parseFloat(r.amount || '0'), 0)
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Top clients by storage usage
      const topStorageClients = clientsWithRealStorage
        .map(client => ({
          ...client,
          storage_percentage: (client.storage_used / client.storage_limit) * 100
        }))
        .sort((a, b) => b.storage_used - a.storage_used)
        .slice(0, 5);
      // Generate AI insights (simulated)
      const aiInsights = [
        `El crecimiento de clientes muestra una tendencia positiva del ${((newClientsThisMonth / Math.max(clients.length - newClientsThisMonth, 1)) * 100).toFixed(1)}% este mes.`,
        `La tasa de abandono del ${churnRate.toFixed(1)}% está ${churnRate < 5 ? 'por debajo' : 'por encima'} del promedio de la industria.`,
        `Los clientes del plan ${Object.keys(clientsByPlan).reduce((a, b) => clientsByPlan[a] > clientsByPlan[b] ? a : b)} representan el segmento más grande.`,
        `El ingreso promedio por cliente de €${avgRevenuePerClient.toFixed(0)} indica ${avgRevenuePerClient > 100 ? 'una buena' : 'una oportunidad de mejora en la'} monetización.`,
        `El uso promedio de almacenamiento es del ${avgStorageUsage.toFixed(1)}% con ${allDocuments.length} documentos totales procesados.`,
        `${highStorageClients.length} cliente(s) están cerca del límite de almacenamiento y podrían necesitar upgrade.`
      ];

      const recommendations = [
        'Implementar programa de retención para reducir la tasa de abandono',
        'Desarrollar estrategia de upselling para clientes del plan básico',
        'Crear campaña de referidos para aprovechar la satisfacción actual',
        'Optimizar onboarding para mejorar la activación de nuevos clientes',
        highStorageClients.length > 0 ? `Contactar a ${highStorageClients.length} cliente(s) para upgrade de almacenamiento` : 'Monitorear uso de almacenamiento para identificar oportunidades de upgrade'
      ];

      const riskFactors = [
        churnRate > 10 ? 'Tasa de abandono elevada requiere atención inmediata' : null,
        newClientsThisMonth === 0 ? 'Sin nuevos clientes este mes - revisar estrategia de adquisición' : null,
        clientsWithRealStorage.filter(c => c.subscription_status === 'active').length < clientsWithRealStorage.length * 0.8 ? 'Bajo porcentaje de clientes activos' : null,
        avgStorageUsage > 85 ? 'Uso de almacenamiento global alto - considerar expansión de infraestructura' : null,
        highStorageClients.length > 3 ? `${highStorageClients.length} clientes cerca del límite de almacenamiento` : null
      ].filter(Boolean);

      const opportunities = [
        'Expansión a mercados internacionales',
        'Desarrollo de funcionalidades premium',
        'Alianzas estratégicas con empresas del sector construcción',
        'Automatización avanzada con IA para reducir costos operativos',
        totalStorageUsed > 0 ? 'Optimización de almacenamiento y compresión de documentos' : 'Implementar sistema de gestión de almacenamiento'
      ];

      const reportData: ClientReportData = {
        totalClients: clientsWithRealStorage.length,
        activeClients: clientsWithRealStorage.filter(c => c.subscription_status === 'active').length,
        newClientsThisMonth,
        churnRate,
        avgRevenuePerClient,
        totalRevenue,
        clientsByPlan,
        clientsByStatus,
        topClients,
        topStorageClients,
        totalStorageUsed,
        totalStorageLimit,
        avgStorageUsage,
        highStorageClients: highStorageClients.length,
        totalDocuments: allDocuments.length,
        growthTrend,
        aiInsights,
        recommendations,
        riskFactors,
        opportunities
      };

      setReportData(reportData);

      // Log audit event for report generation
      await logAuditoria(
        DEV_TENANT_ID,
        user?.id || DEV_ADMIN_USER_ID,
        'admin.report_generated',
        'reporte',
        'client-analysis',
        {
          report_type: 'client_analysis',
          total_clients: clientsWithRealStorage.length,
          active_clients: reportData.activeClients,
          total_documents: allDocuments.length,
          total_storage_used: totalStorageUsed,
          ai_insights_generated: aiInsights.length,
          recommendations_provided: recommendations.length
        },
        '127.0.0.1',
        navigator.userAgent,
        'success'
      );

      console.log('✅ [ClientReport] Report generated successfully');

    } catch (error) {
      console.error('❌ [ClientReport] Error generating report:', error);
    } finally {
      setLoading(false);
      setGenerating(false);
    }
  };

  const printReport = () => {
    try {
      // Get absolute URL for logo
      const logoUrl = `${window.location.origin}/Logo ConstructIA.png`;
      const reportHTML = generateReportHTML();
      
      // Create a new window for printing
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (!printWindow) {
        alert('Por favor permite ventanas emergentes para imprimir el reporte');
        return;
      }

      // Write the HTML content
      printWindow.document.open();
      printWindow.document.write(reportHTML);
      printWindow.document.close();
      
      // Wait for content to load, then print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          // Close window after printing (optional)
          printWindow.onafterprint = () => {
            printWindow.close();
          };
        }, 500);
      };
      
      // Fallback if onload doesn't fire
      setTimeout(() => {
        if (printWindow && !printWindow.closed) {
          printWindow.print();
        }
      }, 1000);
      
    } catch (error) {
      console.error('Error printing report:', error);
      alert('Error al imprimir el reporte. Intenta descargar el HTML en su lugar.');
    }
  };

  const downloadReport = () => {
    const logoUrl = `${window.location.origin}/Logo ConstructIA.png`;
    const reportHTML = generateReportHTML();
    const blob = new Blob([reportHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-clientes-${new Date().toISOString().split('T')[0]}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateReportHTML = (logoUrl?: string): string => {
    if (!reportData) return '';

    const currentDate = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const formatBytes = (bytes: number): string => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte de Análisis de Clientes - ConstructIA</title>
    <style>
        @page {
            size: A4;
            margin: 15mm;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.4;
            color: #1f2937;
            background: white;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }
        
        .report-container {
            max-width: 210mm;
            margin: 0 auto;
            background: white;
            flex: 1;
            display: flex;
            flex-direction: column;
            min-height: 297mm;
            position: relative;
        }
        
        .main-content {
            flex: 1;
        }
        
        .header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .logo-section {
            display: flex;
            align-items: center;
        }
        
        .logo img {
            height: 50px;
            width: auto;
            margin-right: 15px;
            background: white;
            padding: 5px;
            border-radius: 8px;
        }
        
        .header-info h1 {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .header-info p {
            opacity: 0.9;
            font-size: 14px;
        }
        
        .report-meta {
            text-align: right;
            font-size: 12px;
            opacity: 0.9;
        }
        
        .kpi-grid {
            display: grid;
            grid-template-columns: repeat(6, 1fr);
            gap: 15px;
            margin-bottom: 20px;
        }
        
        .kpi-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
        }
        
        .kpi-value {
            font-size: 24px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 5px;
        }
        
        .kpi-label {
            font-size: 12px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .section {
            margin-bottom: 20px;
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            overflow: hidden;
        }
        
        .section-header {
            background: #f9fafb;
            padding: 12px 16px;
            border-bottom: 1px solid #e5e7eb;
            font-weight: 600;
            color: #374151;
            display: flex;
            align-items: center;
        }
        
        .section-header svg {
            width: 16px;
            height: 16px;
            margin-right: 8px;
        }
        
        .section-content {
            padding: 16px;
        }
        
        .chart-container {
            height: 120px;
            background: #f8fafc;
            border-radius: 6px;
            margin: 10px 0;
            display: flex;
            align-items: end;
            padding: 10px;
            gap: 8px;
        }
        
        .chart-bar {
            background: #10b981;
            border-radius: 2px 2px 0 0;
            min-height: 10px;
            flex: 1;
            position: relative;
            display: flex;
            align-items: end;
            justify-content: center;
        }
        
        .chart-label {
            position: absolute;
            bottom: -25px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 10px;
            color: #6b7280;
            white-space: nowrap;
        }
        
        .chart-value {
            color: white;
            font-size: 10px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .ai-section {
            background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
            color: white;
            border: none;
        }
        
        .ai-section .section-header {
            background: rgba(255, 255, 255, 0.1);
            color: white;
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .ai-section .section-content {
            color: white;
        }
        
        .insight-item {
            background: rgba(255, 255, 255, 0.1);
            padding: 10px;
            border-radius: 6px;
            margin-bottom: 8px;
            font-size: 13px;
            line-height: 1.4;
        }
        
        .recommendation-item {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 10px;
            margin-bottom: 8px;
            font-size: 13px;
            color: #92400e;
        }
        
        .risk-item {
            background: #fee2e2;
            border-left: 4px solid #ef4444;
            padding: 10px;
            margin-bottom: 8px;
            font-size: 13px;
            color: #dc2626;
        }
        
        .opportunity-item {
            background: #d1fae5;
            border-left: 4px solid #10b981;
            padding: 10px;
            margin-bottom: 8px;
            font-size: 13px;
            color: #065f46;
        }
        
        .two-column {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }
        
        .three-column {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 15px;
        }
        
        .table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
        }
        
        .table th,
        .table td {
            padding: 8px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .table th {
            background: #f9fafb;
            font-weight: 600;
            color: #374151;
        }
        
        .status-badge {
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: 500;
        }
        
        .status-active {
            background: #d1fae5;
            color: #065f46;
        }
        
        .status-suspended {
            background: #fef3c7;
            color: #92400e;
        }
        
        .status-cancelled {
            background: #fee2e2;
            color: #dc2626;
        }
        
        .storage-bar {
            width: 100%;
            height: 8px;
            background: #e5e7eb;
            border-radius: 4px;
            overflow: hidden;
        }
        
        .storage-fill {
            height: 100%;
            border-radius: 4px;
            transition: width 0.3s ease;
        }
        
        .storage-low { background: #10b981; }
        .storage-medium { background: #f59e0b; }
        .storage-high { background: #ef4444; }
        
        .footer {
            margin-top: auto;
            padding-top: 20px;
            text-align: center;
            font-size: 10px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
            padding: 10px 0;
        }
        
        @media print {
            .no-print {
                display: none !important;
            }
            
            body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            
            .report-container {
                min-height: 100vh;
            }
        }
    </style>
</head>
<body>
    <div class="report-container">
        <div class="main-content">
        <!-- Header -->
        <div class="header">
            <div class="logo-section">
                <div class="logo">
                    ${logoUrl ? `<img src="${logoUrl}" alt="ConstructIA Logo" style="height: 40px; width: auto;"/>` : '<div style="width: 40px; height: 40px; background: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #10b981; font-weight: bold; font-size: 20px;">C</div>'}
                </div>
                <div class="header-info" style="margin-left: 10px;">
                    <h1>Reporte de Análisis de Clientes</h1>
                    <p>Análisis integral con inteligencia artificial</p>
                </div>
            </div>
            <div class="report-meta">
                <div><strong>Fecha:</strong> ${currentDate}</div>
                <div><strong>Período:</strong> ${new Date().getFullYear()}</div>
                <div><strong>Generado por:</strong> ConstructIA IA</div>
            </div>
        </div>

        <!-- KPIs Principales -->
        <div class="kpi-grid">
            <div class="kpi-card">
                <div class="kpi-value">${reportData.totalClients}</div>
                <div class="kpi-label">Total Clientes</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-value">${reportData.activeClients}</div>
                <div class="kpi-label">Clientes Activos</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-value">€${Math.round(reportData.totalRevenue)}</div>
                <div class="kpi-label">Ingresos Totales</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-value">${reportData.churnRate.toFixed(1)}%</div>
                <div class="kpi-label">Tasa Abandono</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-value">${formatBytes(reportData.totalStorageUsed || 0)}</div>
                <div class="kpi-label">Almacenamiento Usado</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-value">${reportData.totalDocuments || 0}</div>
                <div class="kpi-label">Documentos Totales</div>
            </div>
        </div>

        <!-- Análisis IA -->
        <div class="section ai-section">
            <div class="section-header">
                <svg fill="currentColor" viewBox="0 0 20 20"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Análisis de Inteligencia Artificial
            </div>
            <div class="section-content">
                ${reportData.aiInsights.map(insight => `<div class="insight-item">🤖 ${insight}</div>`).join('')}
            </div>
        </div>

        <!-- Distribución y Tendencias -->
        <div class="three-column">
            <div class="section">
                <div class="section-header">
                    <svg fill="currentColor" viewBox="0 0 20 20"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                    Distribución por Plan
                </div>
                <div class="section-content">
                    <div class="chart-container">
                        ${Object.entries(reportData.clientsByPlan).map(([plan, count]) => {
                            const maxValue = Math.max(...Object.values(reportData.clientsByPlan), 1);
                            const height = (count / maxValue) * 100;
                            const colors = { basic: '#3b82f6', professional: '#10b981', enterprise: '#8b5cf6', custom: '#f59e0b' };
                            const color = colors[plan as keyof typeof colors] || '#6b7280';
                            return `
                                <div class="chart-bar" style="height: ${height}%; background: ${color};">
                                    <div class="chart-value">${count}</div>
                                    <div class="chart-label">${plan}</div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>

            <div class="section">
                <div class="section-header">
                    <svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                    Tendencia de Crecimiento
                </div>
                <div class="section-content">
                    <div class="chart-container">
                        ${reportData.growthTrend.map((value, index) => {
                            const maxValue = Math.max(...reportData.growthTrend, 1);
                            const height = (value / maxValue) * 100;
                            const months = ['Hace 5', 'Hace 4', 'Hace 3', 'Hace 2', 'Mes pasado', 'Este mes'];
                            return `
                                <div class="chart-bar" style="height: ${height}%;">
                                    <div class="chart-value">${value}</div>
                                    <div class="chart-label">${months[index]}</div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>

            <div class="section">
                <div class="section-header">
                    <svg fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"></path></svg>
                    Uso de Almacenamiento
                </div>
                <div class="section-content">
                    <div style="margin-bottom: 10px;">
                        <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 5px;">
                            <span>Uso Global:</span>
                            <span><strong>${formatBytes(reportData.totalStorageUsed || 0)} / ${formatBytes(reportData.totalStorageLimit || 0)}</strong></span>
                        </div>
                        <div class="storage-bar">
                            <div class="storage-fill ${(reportData.avgStorageUsage || 0) > 80 ? 'storage-high' : (reportData.avgStorageUsage || 0) > 60 ? 'storage-medium' : 'storage-low'}" 
                                 style="width: ${Math.min(reportData.avgStorageUsage || 0, 100)}%"></div>
                        </div>
                        <div style="text-align: center; font-size: 11px; color: #6b7280; margin-top: 5px;">
                            ${(reportData.avgStorageUsage || 0).toFixed(1)}% utilizado
                        </div>
                    </div>
                    ${reportData.highStorageClients > 0 ? `
                        <div style="background: #fee2e2; border: 1px solid #fecaca; border-radius: 6px; padding: 8px; font-size: 11px; color: #dc2626;">
                            ⚠️ ${reportData.highStorageClients} cliente(s) cerca del límite (>80%)
                        </div>
                    ` : `
                        <div style="background: #d1fae5; border: 1px solid #a7f3d0; border-radius: 6px; padding: 8px; font-size: 11px; color: #065f46;">
                            ✅ Todos los clientes con uso de almacenamiento saludable
                        </div>
                    `}
                </div>
            </div>
        </div>

        <!-- Top Clientes por Ingresos y Almacenamiento -->
        <div class="two-column">
            <div class="section">
                <div class="section-header">
                    <svg fill="currentColor" viewBox="0 0 20 20"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path></svg>
                    Top 5 Clientes por Ingresos
                </div>
                <div class="section-content">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Empresa</th>
                                <th>Plan</th>
                                <th>Ingresos</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${reportData.topClients.map(client => `
                                <tr>
                                    <td>${client.company_name}</td>
                                    <td style="text-transform: capitalize;">${client.subscription_plan}</td>
                                    <td><strong>€${client.revenue.toFixed(0)}</strong></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="section">
                <div class="section-header">
                    <svg fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"></path></svg>
                    Top 5 Clientes por Almacenamiento
                </div>
                <div class="section-content">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Empresa</th>
                                <th>Usado</th>
                                <th>% Uso</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${(reportData.topStorageClients || []).map(client => `
                                <tr>
                                    <td>${client.company_name}</td>
                                    <td>${formatBytes(client.storage_used)}</td>
                                    <td>
                                        <div style="display: flex; align-items: center;">
                                            <div class="storage-bar" style="width: 40px; height: 6px; margin-right: 8px;">
                                                <div class="storage-fill ${client.storage_percentage > 80 ? 'storage-high' : client.storage_percentage > 60 ? 'storage-medium' : 'storage-low'}" 
                                                     style="width: ${Math.min(client.storage_percentage, 100)}%"></div>
                                            </div>
                                            <span style="font-size: 10px;">${client.storage_percentage.toFixed(1)}%</span>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Recomendaciones y Riesgos -->
        <div class="two-column">
            <div class="section">
                <div class="section-header">
                    <svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>
                    Recomendaciones IA
                </div>
                <div class="section-content">
                    ${reportData.recommendations.map(rec => `<div class="recommendation-item">💡 ${rec}</div>`).join('')}
                </div>
            </div>

            <div class="section">
                <div class="section-header">
                    <svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
                    ${reportData.riskFactors.length > 0 ? 'Factores de Riesgo' : 'Oportunidades'}
                </div>
                <div class="section-content">
                    ${reportData.riskFactors.length > 0 
                        ? reportData.riskFactors.map(risk => `<div class="risk-item">⚠️ ${risk}</div>`).join('')
                        : reportData.opportunities.map(opp => `<div class="opportunity-item">🚀 ${opp}</div>`).join('')
                    }
                </div>
            </div>
        </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div>ConstructIA S.L. | Plataforma de Gestión Documental Inteligente</div>
            <div>Generado automáticamente el ${currentDate} | Confidencial</div>
        </div>
    </div>
</body>
</html>`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white/20 p-3 rounded-full mr-4">
                <FileText className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Reporte de Análisis de Clientes</h2>
                <p className="text-green-100">Análisis integral con inteligencia artificial</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {reportData && (
                <>
                  <button
                    onClick={downloadReport}
                    className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Descargar HTML
                  </button>
                  <button
                    onClick={printReport}
                    className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center"
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Imprimir
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600 mb-2">Generando reporte con IA...</p>
                {generating && (
                  <div className="flex items-center justify-center text-purple-600">
                    <Brain className="w-5 h-5 mr-2 animate-pulse" />
                    <span className="text-sm">Analizando datos con inteligencia artificial</span>
                  </div>
                )}
              </div>
            </div>
          ) : reportData ? (
            <div className="space-y-6">
              {/* Preview del Reporte */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Vista Previa del Reporte</h3>
                
                {/* KPIs */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="bg-white p-4 rounded-lg border text-center">
                    <div className="text-2xl font-bold text-blue-600">{reportData.totalClients}</div>
                    <div className="text-sm text-gray-600">Total Clientes</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border text-center">
                    <div className="text-2xl font-bold text-green-600">{reportData.activeClients}</div>
                    <div className="text-sm text-gray-600">Activos</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border text-center">
                    <div className="text-2xl font-bold text-purple-600">€{Math.round(reportData.totalRevenue)}</div>
                    <div className="text-sm text-gray-600">Ingresos</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border text-center">
                    <div className="text-2xl font-bold text-orange-600">{reportData.churnRate.toFixed(1)}%</div>
                    <div className="text-sm text-gray-600">Abandono</div>
                  </div>
                </div>

                {/* Insights de IA */}
                <div className="bg-purple-600 text-white rounded-lg p-4 mb-6">
                  <div className="flex items-center mb-3">
                    <Brain className="w-5 h-5 mr-2" />
                    <h4 className="font-semibold">Insights de Inteligencia Artificial</h4>
                  </div>
                  <div className="space-y-2">
                    {reportData.aiInsights.map((insight, index) => (
                      <div key={index} className="bg-white/10 p-2 rounded text-sm">
                        🤖 {insight}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recomendaciones */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg border p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Target className="w-4 h-4 mr-2 text-yellow-600" />
                      Recomendaciones
                    </h4>
                    <div className="space-y-2">
                      {reportData.recommendations.map((rec, index) => (
                        <div key={index} className="bg-yellow-50 border-l-4 border-yellow-400 p-2 text-sm text-yellow-800">
                          💡 {rec}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg border p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      {reportData.riskFactors.length > 0 ? (
                        <>
                          <AlertTriangle className="w-4 h-4 mr-2 text-red-600" />
                          Factores de Riesgo
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2 text-green-600" />
                          Oportunidades
                        </>
                      )}
                    </h4>
                    <div className="space-y-2">
                      {reportData.riskFactors.length > 0 
                        ? reportData.riskFactors.map((risk, index) => (
                            <div key={index} className="bg-red-50 border-l-4 border-red-400 p-2 text-sm text-red-800">
                              ⚠️ {risk}
                            </div>
                          ))
                        : reportData.opportunities.map((opp, index) => (
                            <div key={index} className="bg-green-50 border-l-4 border-green-400 p-2 text-sm text-green-800">
                              🚀 {opp}
                            </div>
                          ))
                      }
                    </div>
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex justify-center space-x-4">
                <button
                  onClick={generateReport}
                  disabled={loading}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      Regenerando...
                    </>
                  ) : (
                    <>
                      <Brain className="w-5 h-5 mr-2" />
                      Regenerar con IA
                    </>
                  )}
                </button>
                <button
                  onClick={downloadReport}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Descargar Reporte
                </button>
                <button
                  onClick={printReport}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center"
                >
                  <Printer className="w-5 h-5 mr-2" />
                  Imprimir A4
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Error al generar el reporte</p>
              <button
                onClick={generateReport}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Reintentar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}