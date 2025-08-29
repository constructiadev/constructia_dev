import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Clock, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Search, 
  Filter,
  Eye,
  Upload,
  Trash2,
  User,
  Building2,
  FolderOpen,
  Settings,
  Info,
  ChevronDown,
  ChevronRight,
  Plus,
  X,
  Save,
  BarChart3,
  Calendar,
  Target,
  Activity,
  Database,
  Globe,
  Shield,
  Key,
  Mail,
  Bell,
  CreditCard,
  DollarSign,
  TrendingUp,
  Download,
  Package,
  Zap,
  Server,
  Monitor,
  Cpu,
  HardDrive,
  Wifi,
  Code,
  Terminal,
  Layers,
  Play,
  Pause
} from 'lucide-react';
import {
  getManualUploadQueue,
  getTenantStats,
  supabaseNew,
  logAuditoria
} from '../../lib/supabase-new';
import { DEV_TENANT_ID, DEV_ADMIN_USER_ID } from '../../lib/supabase-real';

interface ManualUploadItem {
  id: string;
  tenant_id: string;
  empresa_id: string;
  obra_id: string;
  documento_id: string;
  status: 'queued' | 'in_progress' | 'uploaded' | 'error';
  operator_user?: string;
  nota?: string;
  created_at: string;
  updated_at: string;
  documentos?: {
    file: string;
    categoria: string;
    estado: string;
  };
  empresas?: {
    razon_social: string;
  };
  obras?: {
    nombre_obra: string;
    codigo_obra: string;
  };
}

interface TenantStats {
  totalEmpresas: number;
  totalObras: number;
  totalDocumentos: number;
  documentosPendientes: number;
  documentosAprobados: number;
  queuePendientes: number;
}

export default function NewManualManagement() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [queueItems, setQueueItems] = useState<ManualUploadItem[]>([]);
  const [stats, setStats] = useState<TenantStats>({
    totalEmpresas: 0,
    totalObras: 0,
    totalDocumentos: 0,
    documentosPendientes: 0,
    documentosAprobados: 0,
    queuePendientes: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [queueData, statsData] = await Promise.all([
        getManualUploadQueue(DEV_TENANT_ID),
        getTenantStats(DEV_TENANT_ID)
      ]);

      setQueueItems(queueData);
      setStats(statsData);

    } catch (err) {
      console.error('Error loading manual management data:', err);
      setError(err instanceof Error ? err.message : 'Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessItem = async (itemId: string, action: 'upload' | 'error' | 'complete') => {
    try {
      // Update item status
      const { error } = await supabaseNew
        .from('manual_upload_queue')
        .update({
          status: action === 'upload' ? 'in_progress' : 
                  action === 'error' ? 'error' : 'uploaded',
          operator_user: DEV_ADMIN_USER_ID,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId);

      if (error) {
        throw new Error(`Error updating item: ${error.message}`);
      }

      // Log audit event
      await logAuditoria(
        DEV_TENANT_ID,
        DEV_ADMIN_USER_ID,
        `manual_queue.${action}`,
        'manual_upload_queue',
        itemId,
        { action }
      );

      // Reload data
      await loadData();

    } catch (error) {
      console.error('Error processing item:', error);
      alert('Error al procesar elemento: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  const handleBulkAction = async (action: 'upload' | 'delete') => {
    if (selectedItems.length === 0) {
      alert('Selecciona al menos un elemento');
      return;
    }

    if (!confirm(`¿Estás seguro de ${action === 'upload' ? 'procesar' : 'eliminar'} ${selectedItems.length} elemento(s)?`)) {
      return;
    }

    try {
      for (const itemId of selectedItems) {
        if (action === 'upload') {
          await handleProcessItem(itemId, 'upload');
        } else {
          await supabaseNew
            .from('manual_upload_queue')
            .delete()
            .eq('id', itemId);
        }
      }

      setSelectedItems([]);
      await loadData();

    } catch (error) {
      console.error('Error in bulk action:', error);
      alert('Error en acción masiva: ' + (error instanceof Error ? error.message : 'Error desconocido'));
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'queued': return <Clock className="w-4 h-4" />;
      case 'in_progress': return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'uploaded': return <CheckCircle className="w-4 h-4" />;
      case 'error': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const filteredItems = queueItems.filter(item => {
    const matchesSearch = item.empresas?.razon_social?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.obras?.nombre_obra?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.documentos?.categoria?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando gestión manual...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
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
      <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Gestión Manual de Documentos</h1>
            <p className="text-orange-100 mb-4">
              Cola de procesamiento manual para subida a plataformas externas
            </p>
            <div className="space-y-1 text-sm text-orange-100">
              <p>• Gestión de documentos pendientes de subida manual</p>
              <p>• Procesamiento por lotes y individual</p>
              <p>• Seguimiento de estado y auditoría completa</p>
              <p>• Integración con Nalanda, CTAIMA y Ecoordina</p>
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
              <p className="text-sm font-medium text-gray-600">Total Empresas</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalEmpresas}</p>
            </div>
            <Building2 className="w-6 h-6 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Obras</p>
              <p className="text-2xl font-bold text-green-600">{stats.totalObras}</p>
            </div>
            <FolderOpen className="w-6 h-6 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Documentos</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalDocumentos}</p>
            </div>
            <FileText className="w-6 h-6 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.documentosPendientes}</p>
            </div>
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aprobados</p>
              <p className="text-2xl font-bold text-green-600">{stats.documentosAprobados}</p>
            </div>
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En Cola</p>
              <p className="text-2xl font-bold text-orange-600">{stats.queuePendientes}</p>
            </div>
            <Package className="w-6 h-6 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por empresa, obra o documento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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

      {/* Queue Items */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Cola de Procesamiento Manual</h3>
            {selectedItems.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{selectedItems.length} seleccionados</span>
                <button
                  onClick={() => handleBulkAction('upload')}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  Procesar Seleccionados
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  Eliminar Seleccionados
                </button>
              </div>
            )}
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'all' 
                ? 'No se encontraron elementos' 
                : 'No hay elementos en la cola'
              }
            </h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all'
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Los documentos aparecerán aquí cuando se añadan a la cola manual'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems(filteredItems.map(item => item.id));
                        } else {
                          setSelectedItems([]);
                        }
                      }}
                      className="rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Empresa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Obra
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
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
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedItems(prev => [...prev, item.id]);
                          } else {
                            setSelectedItems(prev => prev.filter(id => id !== item.id));
                          }
                        }}
                        className="rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building2 className="w-5 h-5 text-blue-600 mr-3" />
                        <span className="font-medium text-gray-900">
                          {item.empresas?.razon_social || 'Empresa Desconocida'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FolderOpen className="w-5 h-5 text-green-600 mr-3" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {item.obras?.nombre_obra || 'Obra Desconocida'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {item.obras?.codigo_obra || 'Sin código'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-purple-600 mr-3" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {item.documentos?.categoria || 'Sin categoría'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {item.documentos?.file?.split('/').pop() || 'archivo.pdf'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(item.status)}
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.created_at).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            // View item details
                            alert(`Detalles del elemento:\n\nEmpresa: ${item.empresas?.razon_social}\nObra: ${item.obras?.nombre_obra}\nDocumento: ${item.documentos?.categoria}\nEstado: ${item.status}\nNota: ${item.nota || 'Sin notas'}`);
                          }}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {item.status === 'queued' && (
                          <button
                            onClick={() => handleProcessItem(item.id, 'upload')}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Upload className="w-4 h-4" />
                          </button>
                        )}
                        {item.status === 'error' && (
                          <button
                            onClick={() => handleProcessItem(item.id, 'upload')}
                            className="text-orange-600 hover:text-orange-700"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (confirm('¿Estás seguro de eliminar este elemento?')) {
                              supabaseNew
                                .from('manual_upload_queue')
                                .delete()
                                .eq('id', item.id)
                                .then(() => loadData());
                            }
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Information Panel */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <Info className="w-6 h-6 text-orange-600 mt-1" />
          <div>
            <h3 className="font-bold text-orange-800 mb-2">🔧 Sistema de Gestión Manual</h3>
            <p className="text-orange-700 mb-3">
              Este módulo permite gestionar documentos que requieren procesamiento manual antes de ser enviados a las plataformas externas.
            </p>
            <div className="text-sm text-orange-600 space-y-1">
              <div><strong>Funcionalidades principales:</strong></div>
              <div>• 📋 Cola de documentos pendientes de procesamiento</div>
              <div>• 🔄 Procesamiento individual y por lotes</div>
              <div>• 📊 Estadísticas en tiempo real del tenant</div>
              <div>• 🔍 Búsqueda y filtrado avanzado</div>
              <div>• 📝 Seguimiento de auditoría completo</div>
              <div>• 🚀 Integración con Nalanda, CTAIMA y Ecoordina</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}