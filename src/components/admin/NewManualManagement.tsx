import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Building2,
  User,
  Settings,
  ChevronRight,
  ChevronDown,
  Upload,
  Trash2,
  Eye,
  Plus,
  Filter,
  Search,
  Users,
  Wrench,
  HardHat,
  Factory
} from 'lucide-react';
import {
  getTenantHierarchy,
  getTenantStats,
  processManualQueueItem,
  removeFromManualQueue,
  DEV_TENANT_ID,
  DEV_ADMIN_USER_ID
} from '../../lib/supabase-new';
import PayloadManager from './PayloadManager';
import MappingTemplateManager from './MappingTemplateManager';

interface HierarchyNode {
  id: string;
  razon_social: string;
  cif: string;
  estado_compliance: string;
  obras: ObraNode[];
}

interface ObraNode {
  id: string;
  nombre_obra: string;
  codigo_obra: string;
  plataforma_destino?: string;
  perfil_riesgo: string;
  documentos: DocumentoNode[];
  proveedores: ProveedorNode[];
  maquinaria: MaquinariaNode[];
}

interface ProveedorNode {
  id: string;
  razon_social: string;
  cif: string;
  estado_homologacion: string;
  trabajadores: TrabajadorNode[];
}

interface TrabajadorNode {
  id: string;
  dni_nie: string;
  nombre?: string;
  apellido?: string;
  puesto?: string;
  documentos: DocumentoNode[];
}

interface MaquinariaNode {
  id: string;
  tipo?: string;
  marca_modelo?: string;
  numero_serie?: string;
  documentos: DocumentoNode[];
}

interface DocumentoNode {
  id: string;
  categoria: string;
  file: string;
  estado: string;
  caducidad?: string;
  queue_item?: {
    id: string;
    status: string;
    operator_user?: string;
    nota?: string;
  };
}

export default function NewManualManagement() {
  const [hierarchy, setHierarchy] = useState<HierarchyNode[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedEmpresas, setExpandedEmpresas] = useState<string[]>([]);
  const [expandedObras, setExpandedObras] = useState<string[]>([]);
  const [expandedProveedores, setExpandedProveedores] = useState<string[]>([]);
  const [expandedMaquinaria, setExpandedMaquinaria] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showMappingManager, setShowMappingManager] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [hierarchyData, statsData] = await Promise.all([
        getTenantHierarchy(DEV_TENANT_ID),
        getTenantStats(DEV_TENANT_ID)
      ]);

      setHierarchy(hierarchyData);
      setStats(statsData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (type: string, id: string) => {
    const setters = {
      empresa: setExpandedEmpresas,
      obra: setExpandedObras,
      proveedor: setExpandedProveedores,
      maquinaria: setExpandedMaquinaria
    };

    const setter = setters[type as keyof typeof setters];
    if (setter) {
      setter(prev => 
        prev.includes(id) 
          ? prev.filter(item => item !== id)
          : [...prev, id]
      );
    }
  };

  const handleProcessDocument = async (queueId: string, action: 'upload' | 'error' | 'complete') => {
    try {
      const success = await processManualQueueItem(queueId, action, DEV_ADMIN_USER_ID);
      if (success) {
        await loadData(); // Recargar datos
        alert(`Documento ${action === 'upload' ? 'procesado' : action === 'error' ? 'marcado con error' : 'completado'} correctamente`);
      }
    } catch (error) {
      console.error('Error processing document:', error);
      alert('Error al procesar el documento: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  const handleRemoveFromQueue = async (queueId: string) => {
    try {
      const success = await removeFromManualQueue(queueId);
      if (success) {
        await loadData(); // Recargar datos
        alert('Documento eliminado de la cola correctamente');
      }
    } catch (error) {
      console.error('Error removing from queue:', error);
      alert('Error al eliminar de la cola: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'queued': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'uploaded': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'queued': return 'En Cola';
      case 'in_progress': return 'Procesando';
      case 'uploaded': return 'Subido';
      case 'error': return 'Error';
      default: return status;
    }
  };

  const getComplianceColor = (estado: string) => {
    switch (estado) {
      case 'al_dia': return 'text-green-600';
      case 'pendiente': return 'text-yellow-600';
      case 'caducado': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getRiskColor = (riesgo: string) => {
    switch (riesgo) {
      case 'baja': return 'text-green-600';
      case 'media': return 'text-yellow-600';
      case 'alta': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando gestión manual...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar los datos</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Gestión Manual de Documentos</h1>
            <p className="text-red-100 mb-4">
              Sistema multi-tenant con estructura jerárquica completa
            </p>
            <div className="space-y-1 text-sm text-red-100">
              <p>• Arquitectura: Tenant → Empresa → Obra → [Proveedores → Trabajadores | Maquinaria]</p>
              <p>• Gestión por roles: SuperAdmin, ClienteAdmin, GestorDocumental, etc.</p>
              <p>• Cola de procesamiento manual con seguimiento completo</p>
              <p>• Integración con plataformas: Nalanda, CTAIMA, Ecoordina</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={loadData}
              disabled={loading}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
            <button
              onClick={() => setShowMappingManager(true)}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              <Settings className="w-4 h-4 mr-2" />
              Templates
            </button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Empresas</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalEmpresas || 0}</p>
            </div>
            <Building2 className="w-6 h-6 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Obras</p>
              <p className="text-2xl font-bold text-green-600">{stats.totalObras || 0}</p>
            </div>
            <Factory className="w-6 h-6 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Trabajadores</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalTrabajadores || 0}</p>
            </div>
            <HardHat className="w-6 h-6 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Documentos</p>
              <p className="text-2xl font-bold text-orange-600">{stats.totalDocumentos || 0}</p>
            </div>
            <FileText className="w-6 h-6 text-orange-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En Cola</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.queuePendientes || 0}</p>
            </div>
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tareas</p>
              <p className="text-2xl font-bold text-red-600">{stats.tareasAbiertas || 0}</p>
            </div>
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
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
                placeholder="Buscar empresas, obras, trabajadores..."
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
              <option value="queued">En cola</option>
              <option value="in_progress">En proceso</option>
              <option value="uploaded">Subidos</option>
              <option value="error">Con errores</option>
            </select>
          </div>
        </div>
      </div>

      {/* Jerarquía de Datos */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Estructura Jerárquica Multi-Tenant
          </h2>
          <p className="text-gray-600 text-sm">
            Gestión organizada por empresa → obra → [proveedores → trabajadores | maquinaria]
          </p>
        </div>

        <div className="p-6">
          {hierarchy.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay datos en el tenant
              </h3>
              <p className="text-gray-600 mb-6">
                Ejecuta la migración de datos iniciales para poblar el sistema
              </p>
              <button
                onClick={loadData}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Recargar Datos
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {hierarchy.map((empresa) => (
                <div key={empresa.id} className="border border-gray-200 rounded-lg">
                  {/* Empresa Level */}
                  <div className="flex items-center justify-between p-4 bg-blue-50 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                      <button 
                        onClick={() => toggleExpanded('empresa', empresa.id)}
                        className="p-1 rounded-full hover:bg-blue-100"
                      >
                        {expandedEmpresas.includes(empresa.id) ? 
                          <ChevronDown className="w-5 h-5 text-gray-600" /> : 
                          <ChevronRight className="w-5 h-5 text-gray-600" />
                        }
                      </button>
                      <Building2 className="w-6 h-6 text-blue-600" />
                      <div>
                        <h3 className="font-semibold text-gray-900">{empresa.razon_social}</h3>
                        <p className="text-sm text-gray-600">
                          CIF: {empresa.cif} • 
                          <span className={`ml-1 ${getComplianceColor(empresa.estado_compliance)}`}>
                            {empresa.estado_compliance}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {empresa.obras.length} obras
                    </div>
                  </div>

                  {/* Obras Level */}
                  {expandedEmpresas.includes(empresa.id) && (
                    <div className="pl-8">
                      {empresa.obras.map((obra) => (
                        <div key={obra.id} className="border-b border-gray-200 last:border-b-0">
                          <div className="flex items-center justify-between p-4 bg-green-50">
                            <div className="flex items-center space-x-3">
                              <button 
                                onClick={() => toggleExpanded('obra', obra.id)}
                                className="p-1 rounded-full hover:bg-green-100"
                              >
                                {expandedObras.includes(obra.id) ? 
                                  <ChevronDown className="w-5 h-5 text-gray-600" /> : 
                                  <ChevronRight className="w-5 h-5 text-gray-600" />
                                }
                              </button>
                              <Factory className="w-5 h-5 text-green-600" />
                              <div>
                                <h4 className="font-medium text-gray-900">{obra.nombre_obra}</h4>
                                <p className="text-sm text-gray-600">
                                  {obra.codigo_obra} • 
                                  <span className={`ml-1 ${getRiskColor(obra.perfil_riesgo)}`}>
                                    Riesgo {obra.perfil_riesgo}
                                  </span>
                                  {obra.plataforma_destino && (
                                    <span className="ml-2 bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                                      → {obra.plataforma_destino}
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className="text-sm text-gray-600">
                              {obra.documentos.length + obra.proveedores.reduce((acc, p) => acc + p.trabajadores.reduce((acc2, t) => acc2 + t.documentos.length, 0), 0) + obra.maquinaria.reduce((acc, m) => acc + m.documentos.length, 0)} docs
                            </div>
                          </div>

                          {/* Contenido de la Obra */}
                          {expandedObras.includes(obra.id) && (
                            <div className="pl-8 bg-gray-50">
                              {/* Documentos de Obra */}
                              {obra.documentos.length > 0 && (
                                <div className="py-3">
                                  <h5 className="font-medium text-gray-800 mb-2 flex items-center">
                                    <FileText className="w-4 h-4 mr-2" />
                                    Documentos de Obra ({obra.documentos.length})
                                  </h5>
                                  <div className="space-y-2">
                                    {obra.documentos.map((doc) => (
                                      <DocumentRow key={doc.id} documento={doc} onProcess={handleProcessDocument} onRemove={handleRemoveFromQueue} />
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Proveedores */}
                              {obra.proveedores.map((proveedor) => (
                                <div key={proveedor.id} className="border-t border-gray-200 py-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-3">
                                      <button 
                                        onClick={() => toggleExpanded('proveedor', proveedor.id)}
                                        className="p-1 rounded-full hover:bg-gray-200"
                                      >
                                        {expandedProveedores.includes(proveedor.id) ? 
                                          <ChevronDown className="w-4 h-4 text-gray-600" /> : 
                                          <ChevronRight className="w-4 h-4 text-gray-600" />
                                        }
                                      </button>
                                      <Users className="w-5 h-5 text-purple-600" />
                                      <div>
                                        <h5 className="font-medium text-gray-900">{proveedor.razon_social}</h5>
                                        <p className="text-sm text-gray-600">
                                          {proveedor.cif} • 
                                          <span className={`ml-1 ${proveedor.estado_homologacion === 'ok' ? 'text-green-600' : 'text-yellow-600'}`}>
                                            {proveedor.estado_homologacion}
                                          </span>
                                        </p>
                                      </div>
                                    </div>
                                    <span className="text-sm text-gray-600">
                                      {proveedor.trabajadores.length} trabajadores
                                    </span>
                                  </div>

                                  {/* Trabajadores */}
                                  {expandedProveedores.includes(proveedor.id) && (
                                    <div className="pl-8 space-y-2">
                                      {proveedor.trabajadores.map((trabajador) => (
                                        <div key={trabajador.id} className="bg-white border border-gray-200 rounded p-3">
                                          <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center space-x-2">
                                              <HardHat className="w-4 h-4 text-orange-600" />
                                              <span className="font-medium text-gray-900">
                                                {trabajador.nombre} {trabajador.apellido}
                                              </span>
                                              <span className="text-sm text-gray-600">
                                                ({trabajador.dni_nie})
                                              </span>
                                              {trabajador.puesto && (
                                                <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                                                  {trabajador.puesto}
                                                </span>
                                              )}
                                            </div>
                                            <span className="text-sm text-gray-600">
                                              {trabajador.documentos.length} docs
                                            </span>
                                          </div>
                                          
                                          {/* Documentos del Trabajador */}
                                          {trabajador.documentos.length > 0 && (
                                            <div className="space-y-1">
                                              {trabajador.documentos.map((doc) => (
                                                <DocumentRow key={doc.id} documento={doc} onProcess={handleProcessDocument} onRemove={handleRemoveFromQueue} />
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}

                              {/* Maquinaria */}
                              {obra.maquinaria.map((maquina) => (
                                <div key={maquina.id} className="border-t border-gray-200 py-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-3">
                                      <button 
                                        onClick={() => toggleExpanded('maquinaria', maquina.id)}
                                        className="p-1 rounded-full hover:bg-gray-200"
                                      >
                                        {expandedMaquinaria.includes(maquina.id) ? 
                                          <ChevronDown className="w-4 h-4 text-gray-600" /> : 
                                          <ChevronRight className="w-4 h-4 text-gray-600" />
                                        }
                                      </button>
                                      <Wrench className="w-5 h-5 text-gray-600" />
                                      <div>
                                        <h5 className="font-medium text-gray-900">
                                          {maquina.tipo} {maquina.marca_modelo}
                                        </h5>
                                        <p className="text-sm text-gray-600">
                                          Serie: {maquina.numero_serie}
                                        </p>
                                      </div>
                                    </div>
                                    <span className="text-sm text-gray-600">
                                      {maquina.documentos.length} docs
                                    </span>
                                  </div>

                                  {/* Documentos de Maquinaria */}
                                  {expandedMaquinaria.includes(maquina.id) && (
                                    <div className="pl-8 space-y-1">
                                      {maquina.documentos.map((doc) => (
                                        <DocumentRow key={doc.id} documento={doc} onProcess={handleProcessDocument} onRemove={handleRemoveFromQueue} />
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Información del Sistema */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Estado del Sistema Multi-Tenant
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <h4 className="font-semibold text-green-800">Nueva Arquitectura Activa</h4>
            </div>
            <p className="text-sm text-green-700">
              Sistema multi-tenant con separación completa de datos por tenant. 
              RLS habilitado en todas las tablas.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Settings className="w-5 h-5 text-blue-600 mr-2" />
              <h4 className="font-semibold text-blue-800">Roles Implementados</h4>
            </div>
            <p className="text-sm text-blue-700">
              6 roles definidos: SuperAdmin, ClienteAdmin, GestorDocumental, 
              SupervisorObra, Proveedor, Lector.
            </p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <FileText className="w-5 h-5 text-purple-600 mr-2" />
              <h4 className="font-semibold text-purple-800">Categorías de Documentos</h4>
            </div>
            <p className="text-sm text-purple-700">
              12 categorías específicas del sector construcción con validaciones 
              automáticas y flujos de aprobación.
            </p>
          </div>
        </div>
      </div>

      {/* Gestor de Payloads */}
      <PayloadManager tenantId={DEV_TENANT_ID} />

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
              <MappingTemplateManager tenantId={DEV_TENANT_ID} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente para mostrar fila de documento
interface DocumentRowProps {
  documento: DocumentoNode;
  onProcess: (queueId: string, action: 'upload' | 'error' | 'complete') => void;
  onRemove: (queueId: string) => void;
}

function DocumentRow({ documento, onProcess, onRemove }: DocumentRowProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'queued': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'uploaded': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'queued': return 'En Cola';
      case 'in_progress': return 'Procesando';
      case 'uploaded': return 'Subido';
      case 'error': return 'Error';
      default: return status;
    }
  };

  return (
    <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded">
      <div className="flex items-center space-x-3">
        <FileText className="w-4 h-4 text-gray-400" />
        <div>
          <p className="font-medium text-gray-900">{documento.categoria}</p>
          <p className="text-sm text-gray-600">
            Estado: {documento.estado}
            {documento.caducidad && (
              <span className="ml-2 text-orange-600">
                Caduca: {new Date(documento.caducidad).toLocaleDateString()}
              </span>
            )}
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        {documento.queue_item && (
          <>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(documento.queue_item.status)}`}>
              {getStatusText(documento.queue_item.status)}
            </span>
            
            {documento.queue_item.status === 'queued' && (
              <button
                onClick={() => onProcess(documento.queue_item!.id, 'upload')}
                className="p-1 text-green-600 hover:text-green-700 transition-colors"
                title="Procesar documento"
              >
                <Upload className="w-4 h-4" />
              </button>
            )}
            
            {documento.queue_item.status === 'error' && (
              <button
                onClick={() => onProcess(documento.queue_item!.id, 'upload')}
                className="p-1 text-blue-600 hover:text-blue-700 transition-colors"
                title="Reintentar"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
            
            <button
              onClick={() => onRemove(documento.queue_item!.id)}
              className="p-1 text-red-600 hover:text-red-700 transition-colors"
              title="Eliminar de cola"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}
        
        <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
          <Eye className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}