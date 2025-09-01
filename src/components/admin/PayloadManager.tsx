import React, { useState, useEffect } from 'react';
import {
  Package,
  Send,
  RefreshCw,
  Eye,
  Code,
  CheckCircle,
  AlertTriangle,
  Clock,
  Building2,
  Factory,
  Users,
  FileText,
  Settings,
  Download,
  Upload,
  Database,
  Zap,
  Globe,
  Activity,
  BarChart3,
  Filter,
  Search,
  Calendar,
  Target,
  Layers
  X
} from 'lucide-react';
import { PayloadService } from '../../lib/payload-service';
import { getTenantObras, DEV_TENANT_ID, DEV_ADMIN_USER_ID } from '../../lib/supabase-new';
import { MappingTemplateService, MappingEngine } from '../../types/mapping';
import type { IntegrationPayload, PlataformaTipo } from '../../types';
import MappingTemplateManager from './MappingTemplateManager';

interface PayloadManagerProps {
  tenantId?: string;
}

export default function PayloadManager({ tenantId = DEV_TENANT_ID }: PayloadManagerProps) {
  const [payloads, setPayloads] = useState<IntegrationPayload[]>([]);
  const [obras, setObras] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [selectedPayload, setSelectedPayload] = useState<IntegrationPayload | null>(null);
  const [showPayloadModal, setShowPayloadModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<PlataformaTipo>('nalanda');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showMappingManager, setShowMappingManager] = useState(false);
  const [selectedPayloadForPreview, setSelectedPayloadForPreview] = useState<any>(null);
  const [showPayloadPreview, setShowPayloadPreview] = useState(false);

  const payloadService = new PayloadService(tenantId);
  const mappingService = new MappingTemplateService(tenantId);

  useEffect(() => {
    loadData();
  }, [tenantId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [obrasData, payloadsData, jobsData, statsData] = await Promise.all([
        getTenantObras(tenantId),
        payloadService.generateAllPayloads(),
        payloadService.getIntegrationJobs(),
        payloadService.getPayloadStats()
      ]);

      setObras(obrasData);
      setPayloads(payloadsData);
      setJobs(jobsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading payload data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendPayload = async (payload: IntegrationPayload, platform: PlataformaTipo) => {
    try {
      // Obtener template de mapping
      const template = await mappingService.getTemplate(platform);
      if (!template) {
        console.error('❌ No se encontró template de mapping para', platform);
        alert(`No se encontró template de mapping para ${platform}`);
        return;
      }

      // Aplicar transformación
      const mappingEngine = new MappingEngine(template);
      const transformedPayload = mappingEngine.transform(payload);

      // Validar resultado
      const validation = mappingEngine.validate(transformedPayload);
      if (!validation.isValid) {
        console.error('❌ Payload inválido:', validation.errors);
        alert(`Payload inválido: ${validation.errors.join(', ')}`);
        return;
      }

      console.log('🔄 Payload transformado para', platform, ':', transformedPayload);

      const result = await payloadService.sendToPlataforma(
        payload,
        platform,
        'default-adapter-id', // En producción, seleccionar adaptador específico
        DEV_ADMIN_USER_ID
      );

      if (result.success) {
        console.log('✅ Payload enviado exitosamente:', result.jobId);
        alert(`Payload enviado exitosamente a ${platform}`);
        await loadData(); // Recargar datos
      } else {
        console.error('❌ Error enviando payload:', result.error);
        alert(`Error enviando payload: ${result.error}`);
      }
    } catch (error) {
      console.error('Error sending payload:', error);
      alert('Error al enviar payload: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  const handleRetryJob = async (jobId: string) => {
    try {
      const success = await payloadService.retryJob(jobId, DEV_ADMIN_USER_ID);
      if (success) {
        alert('Job reintentado correctamente');
        await loadData(); // Recargar datos
      } else {
        alert('Error al reintentar el job');
      }
    } catch (error) {
      console.error('Error retrying job:', error);
      alert('Error al reintentar job: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  const handlePreviewTransformation = async (payload: IntegrationPayload, platform: PlataformaTipo) => {
    try {
      const template = await mappingService.getTemplate(platform);
      if (!template) {
        console.error('No se encontró template para', platform);
        return;
      }

      const mappingEngine = new MappingEngine(template);
      const transformedPayload = mappingEngine.transform(payload);
      const validation = mappingEngine.validate(transformedPayload);

      setSelectedPayloadForPreview({
        original: payload,
        transformed: transformedPayload,
        validation,
        platform,
        template
      });
      setShowPayloadPreview(true);
    } catch (error) {
      console.error('Error previewing transformation:', error);
    }
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'aceptado': return 'bg-green-100 text-green-800';
      case 'enviado': return 'bg-blue-100 text-blue-800';
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'rechazado': return 'bg-red-100 text-red-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case 'aceptado': return <CheckCircle className="w-4 h-4" />;
      case 'enviado': return <Send className="w-4 h-4" />;
      case 'pendiente': return <Clock className="w-4 h-4" />;
      case 'rechazado': return <AlertTriangle className="w-4 h-4" />;
      case 'error': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getPlatformColor = (plataforma: PlataformaTipo) => {
    switch (plataforma) {
      case 'nalanda': return 'bg-blue-600';
      case 'ctaima': return 'bg-green-600';
      case 'ecoordina': return 'bg-purple-600';
      case 'otro': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.obra_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.plataforma.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.estado === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando gestor de payloads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Gestor de Payloads</h1>
            <p className="text-blue-100 mb-4">
              Construcción y envío de payloads para integración con plataformas externas
            </p>
            <div className="space-y-1 text-sm text-blue-100">
              <p>• Esquema unificado: Company → Site → Workers → Machines → Docs</p>
              <p>• Transformación automática por plataforma (Nalanda, CTAIMA, Ecoordina)</p>
              <p>• Validación y seguimiento de envíos</p>
              <p>• Gestión de jobs de integración con reintentos</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={loadData}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Jobs</p>
              <p className="text-2xl font-bold text-blue-600">{stats.total || 0}</p>
            </div>
            <Package className="w-6 h-6 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendientes || 0}</p>
            </div>
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Enviados</p>
              <p className="text-2xl font-bold text-blue-600">{stats.enviados || 0}</p>
            </div>
            <Send className="w-6 h-6 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aceptados</p>
              <p className="text-2xl font-bold text-green-600">{stats.aceptados || 0}</p>
            </div>
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rechazados</p>
              <p className="text-2xl font-bold text-red-600">{stats.rechazados || 0}</p>
            </div>
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Errores</p>
              <p className="text-2xl font-bold text-red-600">{stats.errores || 0}</p>
            </div>
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
        </div>
      </div>

      {/* Distribución por Plataforma */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Plataforma</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Object.entries(stats.porPlataforma || {}).map(([plataforma, count]) => (
            <div key={plataforma} className="text-center p-4 border border-gray-200 rounded-lg">
              <div className={`w-12 h-12 ${getPlatformColor(plataforma as PlataformaTipo)} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                <Globe className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 capitalize">{plataforma}</h4>
              <p className="text-2xl font-bold text-gray-900">{count as number}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por obra o plataforma..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los estados</option>
              <option value="pendiente">Pendientes</option>
              <option value="enviado">Enviados</option>
              <option value="aceptado">Aceptados</option>
              <option value="rechazado">Rechazados</option>
              <option value="error">Con errores</option>
            </select>
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value as PlataformaTipo)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="nalanda">Nalanda</option>
              <option value="ctaima">CTAIMA</option>
              <option value="ecoordina">Ecoordina</option>
              <option value="otro">Otro</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Jobs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Jobs de Integración</h3>
        </div>
        
        {filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay jobs de integración
            </h3>
            <p className="text-gray-600 mb-6">
              Los jobs aparecerán aquí cuando se envíen payloads a las plataformas
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Obra
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plataforma
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Intentos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Factory className="w-5 h-5 text-gray-400 mr-3" />
                        <span className="font-medium text-gray-900">{job.obra_id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 ${getPlatformColor(job.plataforma)} rounded-full mr-2`}></div>
                        <span className="text-gray-900 capitalize">{job.plataforma}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(job.estado)}
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.estado)}`}>
                          {job.estado}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {job.intentos}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(job.created_at).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedPayload(job.payload);
                            setShowPayloadModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {(job.estado === 'error' || job.estado === 'rechazado') && (
                          <button
                            onClick={() => handleRetryJob(job.id)}
                            className="text-orange-600 hover:text-orange-700"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Generador de Payloads */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Generar Nuevo Payload</h3>
        <div className="mb-4 flex justify-end">
          <button
            onClick={() => setShowMappingManager(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
          >
            <Settings className="w-4 h-4 mr-2" />
            Gestionar Templates
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {obras.map((obra) => (
            <div key={obra.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <Factory className="w-5 h-5 text-green-600 mr-2" />
                  <div>
                    <h4 className="font-medium text-gray-900">{obra.nombre_obra}</h4>
                    <p className="text-sm text-gray-600">{obra.codigo_obra}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  obra.perfil_riesgo === 'alta' ? 'bg-red-100 text-red-800' :
                  obra.perfil_riesgo === 'media' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {obra.perfil_riesgo}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value as PlataformaTipo)}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="nalanda">Nalanda</option>
                  <option value="ctaima">CTAIMA</option>
                  <option value="ecoordina">Ecoordina</option>
                  <option value="otro">Otro</option>
                </select>
                
                <div className="flex space-x-2">
                  <button
                    onClick={async () => {
                      const payload = await payloadService.generatePayloadForObra(obra.id);
                      if (payload) {
                        await handlePreviewTransformation(payload, selectedPlatform);
                      }
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm transition-colors flex items-center"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Preview
                  </button>
                  <button
                    onClick={async () => {
                      const payload = await payloadService.generatePayloadForObra(obra.id);
                      if (payload) {
                        await handleSendPayload(payload, selectedPlatform);
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors flex items-center"
                  >
                    <Send className="w-3 h-3 mr-1" />
                    Enviar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Payload */}
      {showPayloadModal && selectedPayload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Payload JSON</h3>
                <button
                  onClick={() => setShowPayloadModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm">
                {JSON.stringify(selectedPayload, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Gestión de Templates */}
      {showMappingManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-7xl max-h-[95vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Gestión de Templates de Mapping</h3>
                <button
                  onClick={() => setShowMappingManager(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <MappingTemplateManager tenantId={tenantId} />
            </div>
          </div>
        </div>
      )}

      {/* Modal de Preview de Transformación */}
      {showPayloadPreview && selectedPayloadForPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Preview de Transformación - {selectedPayloadForPreview.platform}
                </h3>
                <button
                  onClick={() => setShowPayloadPreview(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Payload Original</h4>
                <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm max-h-96">
                  {JSON.stringify(selectedPayloadForPreview.original, null, 2)}
                </pre>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Payload Transformado</h4>
                <div className={`p-3 rounded-lg mb-3 ${
                  selectedPayloadForPreview.validation.isValid 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center">
                    {selectedPayloadForPreview.validation.isValid ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                    )}
                    <span className={`font-medium ${
                      selectedPayloadForPreview.validation.isValid ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {selectedPayloadForPreview.validation.isValid ? 'Válido' : 'Inválido'}
                    </span>
                  </div>
                  {!selectedPayloadForPreview.validation.isValid && (
                    <ul className="mt-2 text-sm text-red-700">
                      {selectedPayloadForPreview.validation.errors.map((error: string, index: number) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm max-h-96">
                  {JSON.stringify(selectedPayloadForPreview.transformed, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}