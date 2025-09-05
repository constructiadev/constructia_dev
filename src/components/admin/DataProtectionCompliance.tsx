import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Mail, 
  Phone, 
  Globe, 
  FileText, 
  Users, 
  Eye, 
  Database, 
  Lock, 
  Calendar, 
  Activity, 
  BarChart3,
  RefreshCw,
  Download,
  Settings,
  Bell,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Info,
  Clock,
  Target,
  Award,
  Zap,
  Building2
} from 'lucide-react';

interface GDPRMetric {
  id: string;
  title: string;
  value: number;
  total: number;
  percentage: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  description: string;
  icon: React.ElementType;
  color: string;
}

interface DataRequest {
  id: string;
  type: 'access' | 'rectification' | 'erasure' | 'portability' | 'restriction' | 'objection';
  requester_email: string;
  requester_name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  created_at: string;
  due_date: string;
  description: string;
  response_sent?: boolean;
}

interface DataBreach {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'detected' | 'investigating' | 'contained' | 'resolved';
  affected_records: number;
  detected_at: string;
  reported_to_authority: boolean;
  notification_sent: boolean;
  description: string;
}

export default function DataProtectionCompliance() {
  const [activeTab, setActiveTab] = useState('resumen');
  const [loading, setLoading] = useState(false);
  const [gdprMetrics, setGdprMetrics] = useState<GDPRMetric[]>([]);
  const [dataRequests, setDataRequests] = useState<DataRequest[]>([]);
  const [dataBreaches, setDataBreaches] = useState<DataBreach[]>([]);

  useEffect(() => {
    loadComplianceData();
  }, []);

  const loadComplianceData = async () => {
    try {
      setLoading(true);
      
      // Simular carga de datos GDPR
      const mockMetrics: GDPRMetric[] = [
        {
          id: 'verificaciones',
          title: 'Verificaciones',
          value: 5,
          total: 5,
          percentage: 100,
          status: 'excellent',
          description: 'Verificaciones de cumplimiento completadas',
          icon: CheckCircle,
          color: 'bg-green-500'
        },
        {
          id: 'conformes',
          title: 'Conformes',
          value: 4,
          total: 5,
          percentage: 80,
          status: 'good',
          description: 'Procesos conformes con GDPR',
          icon: Shield,
          color: 'bg-blue-500'
        },
        {
          id: 'solicitudes',
          title: 'Solicitudes',
          value: 1,
          total: 1,
          percentage: 100,
          status: 'excellent',
          description: 'Solicitudes de derechos GDPR',
          icon: Mail,
          color: 'bg-orange-500'
        },
        {
          id: 'evaluaciones',
          title: 'Evaluaciones',
          value: 1,
          total: 1,
          percentage: 100,
          status: 'excellent',
          description: 'Evaluaciones de impacto completadas',
          icon: FileText,
          color: 'bg-teal-500'
        },
        {
          id: 'brechas',
          title: 'Brechas',
          value: 1,
          total: 1,
          percentage: 100,
          status: 'warning',
          description: 'Brechas de seguridad gestionadas',
          icon: AlertTriangle,
          color: 'bg-red-500'
        },
        {
          id: 'consentimientos',
          title: 'Consentimientos',
          value: 2,
          total: 2,
          percentage: 100,
          status: 'excellent',
          description: 'Consentimientos activos gestionados',
          icon: Users,
          color: 'bg-purple-500'
        }
      ];

      const mockRequests: DataRequest[] = [
        {
          id: '1',
          type: 'access',
          requester_email: 'cliente@empresa.com',
          requester_name: 'Juan García',
          status: 'completed',
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          due_date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Solicitud de acceso a datos personales',
          response_sent: true
        }
      ];

      const mockBreaches: DataBreach[] = [
        {
          id: '1',
          title: 'Intento de acceso no autorizado',
          severity: 'medium',
          status: 'resolved',
          affected_records: 0,
          detected_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          reported_to_authority: false,
          notification_sent: false,
          description: 'Intento fallido de acceso desde IP sospechosa. Sin compromiso de datos.'
        }
      ];

      setGdprMetrics(mockMetrics);
      setDataRequests(mockRequests);
      setDataBreaches(mockBreaches);
      
    } catch (error) {
      console.error('Error loading compliance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRequestTypeText = (type: string) => {
    const types = {
      'access': 'Acceso',
      'rectification': 'Rectificación',
      'erasure': 'Supresión',
      'portability': 'Portabilidad',
      'restriction': 'Limitación',
      'objection': 'Oposición'
    };
    return types[type as keyof typeof types] || type;
  };

  const getRequestStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBreachSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const tabs = [
    { id: 'resumen', name: 'Resumen', icon: BarChart3 },
    { id: 'verificaciones', name: 'Verificaciones', icon: CheckCircle },
    { id: 'solicitudes', name: 'Solicitudes', icon: Mail },
    { id: 'evaluaciones', name: 'Evaluaciones', icon: FileText },
    { id: 'brechas', name: 'Brechas', icon: AlertTriangle },
    { id: 'consentimientos', name: 'Consentimientos', icon: Users }
  ];

  return (
    <div className="space-y-6">
      {/* Header con métricas principales */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <Shield className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Cumplimiento LOPD/GDPR</h2>
            </div>
            <p className="text-green-100 mb-4">
              Gestión integral de protección de datos y cumplimiento normativo
            </p>
            <div className="space-y-1 text-sm text-green-100">
              <p>• Cumplimiento total con GDPR y LOPDGDD</p>
              <p>• Gestión automatizada de derechos de usuarios</p>
              <p>• Monitoreo continuo de brechas de seguridad</p>
              <p>• Evaluaciones de impacto en protección de datos</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">80.0%</div>
            <div className="text-sm text-blue-200">Cumplimiento Global</div>
          </div>
        </div>

        {/* Métricas en el header */}
        <div className="grid grid-cols-6 gap-3 mt-6">
          {gdprMetrics.map((metric) => (
            <div key={metric.id} className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
              <div className="text-xl font-bold">{metric.value}</div>
              <div className="text-xs text-blue-100">{metric.title}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Navegación por tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-3 rounded-md font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id ? 'bg-green-600 text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-5 h-5 inline mr-2" />
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* Tab: Resumen */}
      {activeTab === 'resumen' && (
        <div className="space-y-6">
          {/* KPIs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gdprMetrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <div key={metric.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${metric.color}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(metric.status)}`}>
                      {metric.status === 'excellent' ? 'Excelente' :
                       metric.status === 'good' ? 'Bueno' :
                       metric.status === 'warning' ? 'Atención' : 'Crítico'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1">{metric.title}</h3>
                    <div className="flex items-baseline space-x-2 mb-2">
                      <span className="text-2xl font-bold text-gray-900">{metric.value}</span>
                      <span className="text-sm text-gray-500">/ {metric.total}</span>
                      <span className="text-sm font-medium text-green-600">{metric.percentage}%</span>
                    </div>
                    <p className="text-xs text-gray-500">{metric.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cumplimiento Global */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Cumplimiento Global</h3>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="text-2xl font-bold text-green-600">80.0%</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Verificaciones completadas</span>
                <span className="font-semibold text-green-600">5/5 (100%)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Procesos conformes</span>
                <span className="font-semibold text-blue-600">4/5 (80%)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Solicitudes gestionadas</span>
                <span className="font-semibold text-orange-600">1/1 (100%)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Evaluaciones realizadas</span>
                <span className="font-semibold text-teal-600">1/1 (100%)</span>
              </div>
            </div>
          </div>

          {/* Contacto DPO */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Contacto DPO (Delegado de Protección de Datos)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Mail className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Email</h4>
                  <p className="text-gray-600">dpo@constructia.com</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Phone className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Teléfono</h4>
                  <p className="text-gray-600">+34 91 000 00 00</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Globe className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">AEPD</h4>
                  <a 
                    href="https://www.aepd.es" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:text-purple-700 flex items-center"
                  >
                    www.aepd.es
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Actividad Reciente */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Actividad Reciente de GDPR</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-green-800">Solicitud de acceso completada</p>
                    <p className="text-sm text-green-700">Juan García - cliente@empresa.com</p>
                  </div>
                </div>
                <span className="text-xs text-green-600">hace 5 días</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center">
                  <Shield className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium text-blue-800">Evaluación de impacto actualizada</p>
                    <p className="text-sm text-blue-700">Procesamiento de documentos CAE</p>
                  </div>
                </div>
                <span className="text-xs text-blue-600">hace 1 semana</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3" />
                  <div>
                    <p className="font-medium text-yellow-800">Brecha de seguridad resuelta</p>
                    <p className="text-sm text-yellow-700">Intento de acceso no autorizado bloqueado</p>
                  </div>
                </div>
                <span className="text-xs text-yellow-600">hace 10 días</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Verificaciones */}
      {activeTab === 'verificaciones' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Verificaciones de Cumplimiento</h3>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Verificación
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-green-200 rounded-lg p-4 bg-green-50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-green-900">Política de Privacidad</h4>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-sm text-green-800 mb-3">
                Política actualizada y conforme con GDPR. Última revisión: 29/01/2025
              </p>
              <div className="text-xs text-green-700">
                ✅ Cumple con Art. 13-14 GDPR
              </div>
            </div>

            <div className="border border-green-200 rounded-lg p-4 bg-green-50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-green-900">Registro de Actividades</h4>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-sm text-green-800 mb-3">
                Registro completo de tratamientos según Art. 30 GDPR
              </p>
              <div className="text-xs text-green-700">
                ✅ Actualizado mensualmente
              </div>
            </div>

            <div className="border border-green-200 rounded-lg p-4 bg-green-50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-green-900">Medidas Técnicas</h4>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-sm text-green-800 mb-3">
                Encriptación, pseudonimización y medidas de seguridad implementadas
              </p>
              <div className="text-xs text-green-700">
                ✅ Cumple con Art. 32 GDPR
              </div>
            </div>

            <div className="border border-green-200 rounded-lg p-4 bg-green-50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-green-900">Contratos DPA</h4>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-sm text-green-800 mb-3">
                Acuerdos de procesamiento de datos con todos los proveedores
              </p>
              <div className="text-xs text-green-700">
                ✅ Cumple con Art. 28 GDPR
              </div>
            </div>

            <div className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-yellow-900">Formación Personal</h4>
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              </div>
              <p className="text-sm text-yellow-800 mb-3">
                Formación en protección de datos pendiente para 2 empleados
              </p>
              <div className="text-xs text-yellow-700">
                ⚠️ Programada para febrero 2025
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Solicitudes */}
      {activeTab === 'solicitudes' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Solicitudes de Derechos GDPR</h3>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Solicitud
            </button>
          </div>

          <div className="space-y-4">
            {dataRequests.map((request) => (
              <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Mail className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold text-gray-900">{getRequestTypeText(request.type)}</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRequestStatusColor(request.status)}`}>
                        {request.status === 'completed' ? 'Completada' :
                         request.status === 'in_progress' ? 'En Progreso' :
                         request.status === 'pending' ? 'Pendiente' : 'Rechazada'}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      <strong>Solicitante:</strong> {request.requester_name} ({request.requester_email})
                    </div>
                    
                    <p className="text-gray-800 text-sm mb-3">{request.description}</p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Recibida: {new Date(request.created_at).toLocaleDateString()}</span>
                      <span>Vence: {new Date(request.due_date).toLocaleDateString()}</span>
                      {request.response_sent && (
                        <span className="text-green-600">✅ Respuesta enviada</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button className="p-2 text-gray-400 hover:text-blue-600">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-green-600">
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Evaluaciones */}
      {activeTab === 'evaluaciones' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Evaluaciones de Impacto (EIPD)</h3>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Evaluación
            </button>
          </div>

          <div className="space-y-4">
            <div className="border border-purple-200 rounded-lg p-6 bg-purple-50">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-purple-900">Procesamiento de Documentos CAE</h4>
                <span className="bg-green-100 text-green-800 px-2 py-1 text-xs rounded-full">Aprobada</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h5 className="font-medium text-purple-800 mb-2">Datos Procesados</h5>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• Documentos de identificación (DNI/NIE)</li>
                    <li>• Certificados médicos y PRL</li>
                    <li>• Datos de empresas y trabajadores</li>
                    <li>• Metadatos de archivos</li>
                  </ul>
                </div>
                
                <div>
                  <h5 className="font-medium text-purple-800 mb-2">Medidas Implementadas</h5>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• Encriptación end-to-end</li>
                    <li>• Pseudonimización de datos</li>
                    <li>• Eliminación automática (7 días)</li>
                    <li>• Control de acceso basado en roles</li>
                  </ul>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs text-purple-600">
                <span>Última revisión: 15/01/2025</span>
                <span>Próxima revisión: 15/07/2025</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Brechas */}
      {activeTab === 'brechas' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Gestión de Brechas de Seguridad</h3>
            <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Reportar Brecha
            </button>
          </div>

          <div className="space-y-4">
            {dataBreaches.map((breach) => (
              <div key={breach.id} className={`border rounded-lg p-4 ${getBreachSeverityColor(breach.severity)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <AlertTriangle className="w-5 h-5" />
                      <h4 className="font-semibold">{breach.title}</h4>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-white/50">
                        {breach.severity === 'critical' ? 'Crítica' :
                         breach.severity === 'high' ? 'Alta' :
                         breach.severity === 'medium' ? 'Media' : 'Baja'}
                      </span>
                    </div>
                    
                    <p className="text-sm mb-3">{breach.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Registros afectados:</span>
                        <span className="ml-2">{breach.affected_records}</span>
                      </div>
                      <div>
                        <span className="font-medium">Estado:</span>
                        <span className="ml-2 capitalize">{breach.status}</span>
                      </div>
                      <div>
                        <span className="font-medium">Detectada:</span>
                        <span className="ml-2">{new Date(breach.detected_at).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="font-medium">Reportada a AEPD:</span>
                        <span className="ml-2">{breach.reported_to_authority ? '✅ Sí' : '❌ No'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button className="p-2 text-gray-400 hover:text-blue-600">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-green-600">
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Consentimientos */}
      {activeTab === 'consentimientos' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Gestión de Consentimientos</h3>
            <div className="flex space-x-2">
              <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </button>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center">
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualizar
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-blue-900">Consentimientos Activos</h4>
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <div className="space-y-2 text-sm text-blue-800">
                <div className="flex justify-between">
                  <span>Cookies analíticas:</span>
                  <span className="font-medium">89 usuarios</span>
                </div>
                <div className="flex justify-between">
                  <span>Marketing directo:</span>
                  <span className="font-medium">67 usuarios</span>
                </div>
              </div>
            </div>

            <div className="border border-green-200 rounded-lg p-4 bg-green-50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-green-900">Tasa de Consentimiento</h4>
                <span className="text-2xl font-bold text-green-600">78%</span>
              </div>
              <div className="space-y-2 text-sm text-green-800">
                <div className="flex justify-between">
                  <span>Cookies esenciales:</span>
                  <span className="font-medium">100%</span>
                </div>
                <div className="flex justify-between">
                  <span>Cookies opcionales:</span>
                  <span className="font-medium">78%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Información de cumplimiento */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <Info className="w-6 h-6 text-blue-600 mt-1" />
          <div>
            <h3 className="font-bold text-blue-800 mb-2">📋 Módulo de Cumplimiento LOPD/GDPR</h3>
            <p className="text-blue-700 mb-3">
              Sistema integral de gestión de protección de datos conforme al Reglamento General de Protección de Datos (GDPR) 
              y la Ley Orgánica de Protección de Datos y garantía de los derechos digitales (LOPDGDD).
            </p>
            <div className="text-sm text-blue-600 space-y-1">
              <div><strong>Características del módulo:</strong></div>
              <div>• 🛡️ Monitoreo continuo del cumplimiento normativo</div>
              <div>• 📊 Dashboard ejecutivo con métricas en tiempo real</div>
              <div>• 📝 Gestión automatizada de solicitudes de derechos</div>
              <div>• 🔍 Evaluaciones de impacto en protección de datos</div>
              <div>• 🚨 Sistema de gestión de brechas de seguridad</div>
              <div>• ✅ Control de consentimientos y cookies</div>
              <div>• 📞 Contacto directo con DPO y autoridades</div>
              <div className="mt-2 pt-2 border-t border-blue-300">
                <div className="font-medium text-blue-800">Cumplimiento certificado:</div>
                <div>• 🇪🇺 GDPR (Reglamento UE 2016/679) • 🇪🇸 LOPDGDD (LO 3/2018)</div>
                <div>• 🔒 ISO 27001 • 📋 SOC 2 Type II</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}