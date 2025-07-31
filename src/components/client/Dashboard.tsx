import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Building2, 
  FolderOpen, 
  Clock,
  TrendingUp,
  Brain,
  CheckCircle,
  AlertTriangle,
  Download,
  Upload
} from 'lucide-react';
import { callGeminiAI, getCurrentClientData, updateClientObraliaCredentials } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import ObraliaCredentialsModal from './ObraliaCredentialsModal';

interface ClientData {
  id: string;
  client_id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  subscription_plan: string;
  subscription_status: string;
  storage_used: number;
  storage_limit: number;
  documents_processed: number;
  tokens_available: number;
  obralia_credentials?: {
    username: string;
    password: string;
    configured: boolean;
  };
  created_at: string;
  updated_at: string;
}

interface ClientKPICardProps {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ElementType;
  color: string;
}

function ClientKPICard({ title, value, change, trend, icon: Icon, color }: ClientKPICardProps) {
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600';
  const trendSymbol = trend === 'up' ? '+' : trend === 'down' ? '-' : '';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <p className={`text-sm font-medium mt-1 ${trendColor}`}>
            {trendSymbol}{Math.abs(change)}% vs mes anterior
          </p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function ClientDashboard() {
  const [aiAssistance, setAiAssistance] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [showObraliaModal, setShowObraliaModal] = useState(false);
  const { user } = useAuth();

  // KPIs del Cliente
  const clientKPIs = [
    { title: 'Documentos Subidos', value: '127', change: 15.2, trend: 'up' as const, icon: FileText, color: 'bg-blue-500' },
    { title: 'Empresas Activas', value: '3', change: 0, trend: 'stable' as const, icon: Building2, color: 'bg-green-500' },
    { title: 'Proyectos en Curso', value: '8', change: 12.5, trend: 'up' as const, icon: FolderOpen, color: 'bg-purple-500' },
    { title: 'Tiempo Promedio', value: '2.1s', change: -8.3, trend: 'up' as const, icon: Clock, color: 'bg-orange-500' },
    { title: 'Tasa de Éxito', value: '94.7%', change: 2.1, trend: 'up' as const, icon: CheckCircle, color: 'bg-emerald-500' }
  ];

  const recentDocuments = [
    { name: 'Certificado_Obra_A.pdf', status: 'Procesado', date: '2025-01-27', type: 'Certificado' },
    { name: 'Factura_Materiales_B.pdf', status: 'En Obralia', date: '2025-01-27', type: 'Factura' },
    { name: 'DNI_Trabajador_C.pdf', status: 'Validado', date: '2025-01-26', type: 'Identificación' },
    { name: 'Contrato_Subcontrata.pdf', status: 'Procesando', date: '2025-01-26', type: 'Contrato' },
    { name: 'Seguro_Responsabilidad.pdf', status: 'Completado', date: '2025-01-25', type: 'Seguro' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completado': return 'bg-green-100 text-green-800';
      case 'Validado': return 'bg-green-100 text-green-800';
      case 'Procesado': return 'bg-blue-100 text-blue-800';
      case 'En Obralia': return 'bg-yellow-100 text-yellow-800';
      case 'Procesando': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const generateAIAssistance = async () => {
    setLoading(true);
    try {
      const prompt = `Como asistente IA de ConstructIA, basándote en estos datos del cliente:
      - 127 documentos subidos (+15.2%)
      - 3 empresas activas
      - 8 proyectos en curso (+12.5%)
      - 94.7% tasa de éxito (+2.1%)
      
      Genera 3 recomendaciones personalizadas para optimizar su gestión documental (máximo 120 palabras).`;
      
      const assistance = await callGeminiAI(prompt);
      setAiAssistance(assistance);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('503') && errorMessage.includes('overloaded')) {
        setAiAssistance('🤖 El servicio de IA está temporalmente sobrecargado. Por favor, inténtalo de nuevo más tarde.');
      } else {
        setAiAssistance('Error al generar asistencia. Intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadClientData = async () => {
    if (!user?.id) {
      setShowObraliaModal(false);
      return;
    }
    
    try {
      const data = await getCurrentClientData(user.id);
      
      if (!data) {
        setClientData(null);
        setShowObraliaModal(false);
        return;
      }
      
      setClientData(data);
      
      // Verificar si necesita configurar credenciales de Obralia
      const needsObraliaConfig = !data.obralia_credentials || 
                                !data.obralia_credentials.configured;
      
      if (needsObraliaConfig) {
        setShowObraliaModal(true);
      }
    } catch (error) {
      console.error('Error loading client data:', error);
      // Si hay error, asumir que necesita configuración
      setShowObraliaModal(false);
    }
  };

  const handleSaveObraliaCredentials = async (credentials: { username: string; password: string }) => {
    if (!clientData?.id) {
      throw new Error('No se pudo identificar el cliente. Por favor, recarga la página.');
    }

    try {
      await updateClientObraliaCredentials(clientData.id, credentials);
      
      // Actualizar el estado local
      setClientData({
        ...clientData,
        obralia_credentials: {
          username: credentials.username,
          password: credentials.password,
          configured: true
        }
      });
      
      setShowObraliaModal(false);
      
      // Mostrar mensaje de éxito
      alert('¡Credenciales de Obralia configuradas exitosamente! Ahora puedes subir documentos.');
      
    } catch (error) {
      console.error('Error saving Obralia credentials:', error);
      throw new Error('Error al guardar las credenciales. Intenta nuevamente.');
    }
  };

  useEffect(() => {
    generateAIAssistance();
    loadClientData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header con Asistente IA */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">¡Bienvenido a ConstructIA!</h2>
            <p className="text-green-100 mt-1">Tu asistente inteligente para gestión documental</p>
          </div>
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8" />
            <button 
              onClick={generateAIAssistance}
              disabled={loading}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Generando...' : 'Actualizar IA'}
            </button>
          </div>
        </div>
        
        {aiAssistance && (
          <div className="mt-4 bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold mb-2">🤖 Asistente IA - Recomendaciones:</h3>
            <p className="text-sm text-white/90">{aiAssistance}</p>
          </div>
        )}
      </div>

      {/* KPIs del Cliente */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Resumen de tu Actividad</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {clientKPIs.map((kpi, index) => (
            <ClientKPICard key={index} {...kpi} />
          ))}
        </div>
      </div>

      {/* Documentos Recientes y Acciones Rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Documentos Recientes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Documentos Recientes</h3>
            <FileText className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {recentDocuments.map((doc, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-800 text-sm">{doc.name}</p>
                  <p className="text-xs text-gray-500">{doc.type} • {doc.date}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                  {doc.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Acciones Rápidas</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
              <div className="flex items-center">
                <Upload className="h-5 w-5 text-green-600 mr-3" />
                <span className="font-medium text-green-800">Subir Documentos</span>
              </div>
              <span className="text-green-600">→</span>
            </button>
            
            <button className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
              <div className="flex items-center">
                <Building2 className="h-5 w-5 text-blue-600 mr-3" />
                <span className="font-medium text-blue-800">Nueva Empresa</span>
              </div>
              <span className="text-blue-600">→</span>
            </button>
            
            <button className="w-full flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
              <div className="flex items-center">
                <FolderOpen className="h-5 w-5 text-purple-600 mr-3" />
                <span className="font-medium text-purple-800">Nuevo Proyecto</span>
              </div>
              <span className="text-purple-600">→</span>
            </button>
            
            <button className="w-full flex items-center justify-between p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
              <div className="flex items-center">
                <Download className="h-5 w-5 text-orange-600 mr-3" />
                <span className="font-medium text-orange-800">Descargar Reporte</span>
              </div>
              <span className="text-orange-600">→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Alertas y Notificaciones */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Alertas y Notificaciones</h3>
        <div className="space-y-3">
          <div className="flex items-start p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-800">Almacenamiento al 78%</p>
              <p className="text-sm text-yellow-700">Considera adquirir más tokens de almacenamiento.</p>
            </div>
          </div>
          
          <div className="flex items-start p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
            <div>
              <p className="font-medium text-green-800">Integración Obralia Activa</p>
              <p className="text-sm text-green-700">Todos los documentos se están subiendo correctamente.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Credenciales Obralia */}
      <ObraliaCredentialsModal
        isOpen={showObraliaModal}
        onSave={handleSaveObraliaCredentials}
        clientName={clientData?.company_name || user?.email || 'Cliente'}
      />
    </div>
  );
}