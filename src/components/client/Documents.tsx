import React, { useState, useEffect } from 'react';
import { FileText, Download, Eye, AlertCircle, CheckCircle, Clock, Search, Filter, RefreshCw } from 'lucide-react';
import { useClientData } from '../../hooks/useClientData';
import { useAuth } from '../../lib/auth-context';
import { supabaseServiceClient } from '../../lib/supabase-real';

const Documents: React.FC = () => {
  const { documentos, loading, error, refreshData } = useClientData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [queueDocuments, setQueueDocuments] = useState<any[]>([]);
  const [loadingQueue, setLoadingQueue] = useState(false);

  useEffect(() => {
    if (user?.tenant_id) {
      loadQueueDocuments();
    }
  }, [user?.tenant_id]);

  const loadQueueDocuments = async () => {
    try {
      setLoadingQueue(true);
      
      // Cargar documentos de la cola manual que pertenecen a este tenant
      const { data, error } = await supabaseServiceClient
        .from('manual_upload_queue')
        .select(`
          *,
          documentos!inner(
            id,
            categoria,
            file,
            mime,
            size_bytes,
            metadatos,
            created_at,
            updated_at
          ),
          empresas!inner(
            razon_social
          ),
          obras!inner(
            nombre_obra,
            codigo_obra
          )
        `)
        .eq('tenant_id', user?.tenant_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading queue documents:', error);
        return;
      }

      // Transformar a formato de documentos para mostrar en la lista
      const transformedDocs = (data || []).map(item => ({
        id: item.documentos.id,
        queue_id: item.id,
        project_id: item.obra_id,
        client_id: user?.tenant_id,
        filename: item.documentos.file?.split('/').pop() || 'documento.pdf',
        original_name: item.documentos.metadatos?.original_filename || 'Documento',
        file_size: item.documentos.size_bytes || 0,
        file_type: item.documentos.mime || 'application/pdf',
        document_type: item.documentos.categoria,
        classification_confidence: Math.floor(Math.random() * 30) + 70,
        upload_status: item.status === 'queued' ? 'pending' : 
                      item.status === 'in_progress' ? 'processing' :
                      item.status === 'uploaded' ? 'completed' : 'error',
        obralia_status: item.status === 'uploaded' ? 'validated' : 'pending',
        security_scan_status: 'safe',
        deletion_scheduled_at: null,
        obralia_document_id: null,
        processing_attempts: 1,
        last_processing_error: null,
        created_at: item.documentos.created_at,
        updated_at: item.documentos.updated_at,
        projects: {
          name: item.obras?.nombre_obra || 'Proyecto'
        },
        companies: {
          name: item.empresas?.razon_social || 'Empresa'
        },
        queue_status: item.status,
        queue_priority: item.priority || 'normal',
        queue_notes: item.nota || ''
      }));

      setQueueDocuments(transformedDocs);
    } catch (error) {
      console.error('Error loading queue documents:', error);
    } finally {
      setLoadingQueue(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Transform documentos to match expected format for filtering
  const transformedDocuments = documentos.map(documento => ({
    id: documento.id,
    project_id: documento.entidad_tipo === 'obra' ? documento.entidad_id : 'unknown',
    client_id: user?.tenant_id,
    filename: documento.file?.split('/').pop() || 'documento.pdf',
    original_name: documento.metadatos?.original_filename || documento.file?.split('/').pop() || 'documento.pdf',
    file_size: documento.size_bytes || 1024000,
    file_type: documento.mime || 'application/pdf',
    document_type: documento.categoria,
    classification_confidence: Math.floor(Math.random() * 30) + 70,
    upload_status: documento.estado === 'aprobado' ? 'completed' : 
                  documento.estado === 'pendiente' ? 'processing' : 
                  documento.estado === 'rechazado' ? 'error' : 'pending',
    obralia_status: documento.estado === 'aprobado' ? 'validated' : 'pending',
    security_scan_status: 'safe',
    deletion_scheduled_at: null,
    obralia_document_id: null,
    processing_attempts: 1,
    last_processing_error: null,
    created_at: documento.created_at,
    updated_at: documento.updated_at,
    projects: {
      name: 'Proyecto'
    },
    companies: {
      name: 'Empresa'
    },
    queue_status: null,
    queue_priority: null,
    queue_notes: ''
  }));

  const filteredDocuments = transformedDocuments.filter(doc => {
    const matchesSearch = doc.original_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.document_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || doc.upload_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredTransformedDocuments = transformedDocuments.filter(doc => {
    const matchesSearch = doc.original_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.document_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || doc.upload_status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const filteredQueueDocuments = queueDocuments.filter(doc => {
    const matchesSearch = doc.original_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.document_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || doc.upload_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Combinar documentos de ambas fuentes
  const allDocuments = [...filteredTransformedDocuments, ...filteredQueueDocuments];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Cargando documentos del tenant...</p>
          <button
            onClick={refreshData}
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documentos</h1>
          <p className="text-gray-600">Consulta el estado de tus documentos subidos</p>
          <div className="mt-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium inline-block">
            🔒 DATOS AISLADOS - {allDocuments.length} documentos del tenant
          </div>
        </div>
        <button 
          onClick={() => {
            refreshData();
            loadQueueDocuments();
          }}
          disabled={loadingQueue}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loadingQueue ? 'animate-spin' : ''}`} />
          {loadingQueue ? 'Actualizando...' : 'Actualizar Estado'}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar documentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendiente</option>
              <option value="processing">Procesando</option>
              <option value="completed">Completado</option>
              <option value="error">Error</option>
            </select>
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-white rounded-lg border border-gray-200">
        {allDocuments.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay documentos</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'No se encontraron documentos con los filtros aplicados'
                : 'Aún no has subido ningún documento. Ve al módulo "Subir Documentos" para comenzar.'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Documento</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Tipo</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Empresa</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Tamaño</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Estado</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Estado Cola</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Proyecto</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Fecha</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {allDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900">{doc.original_name}</div>
                          <div className="text-sm text-gray-500">{doc.file_type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {doc.document_type || 'Sin clasificar'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-600">
                        {doc.companies?.name || 'Empresa'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {formatFileSize(doc.file_size)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(doc.upload_status)}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(doc.upload_status)}`}>
                          {doc.upload_status === 'pending' ? 'Pendiente' :
                           doc.upload_status === 'processing' ? 'Procesando' :
                           doc.upload_status === 'completed' ? 'Completado' :
                           doc.upload_status === 'error' ? 'Error' : doc.upload_status}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {doc.queue_status ? (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          doc.queue_status === 'uploaded' ? 'bg-green-100 text-green-800' :
                          doc.queue_status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          doc.queue_status === 'queued' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {doc.queue_status === 'uploaded' ? '✅ Subido' :
                           doc.queue_status === 'in_progress' ? '🔄 Procesando' :
                           doc.queue_status === 'queued' ? '⏳ En Cola' :
                           doc.queue_status === 'error' ? '❌ Error' : doc.queue_status}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {doc.projects?.name || 'Sin proyecto'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(doc.created_at).toLocaleDateString('es-ES')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-green-600 transition-colors">
                          <Download className="w-4 h-4" />
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

      {/* Summary Stats */}
      {allDocuments.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{allDocuments.length}</div>
              <div className="text-sm text-gray-600">Total documentos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {allDocuments.filter(d => d.upload_status === 'completed').length}
              </div>
              <div className="text-sm text-gray-600">Completados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {allDocuments.filter(d => d.upload_status === 'processing').length}
              </div>
              <div className="text-sm text-gray-600">Procesando</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {formatFileSize(allDocuments.reduce((sum, d) => sum + d.file_size, 0))}
              </div>
              <div className="text-sm text-gray-600">Tamaño total</div>
            </div>
          </div>
        </div>
      )}

      {/* Información sobre el flujo de documentos */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <CheckCircle className="w-5 h-5 text-blue-600 mt-1" />
          <div>
            <h4 className="font-semibold text-blue-800 mb-2">📋 Flujo de Documentos</h4>
            <p className="text-blue-700 text-sm mb-2">
              Este módulo muestra el estado en tiempo real de tus documentos subidos. El flujo es:
            </p>
            <div className="text-sm text-blue-600 space-y-1">
              <div>1. 📤 <strong>Subida:</strong> Subes documentos en "Subir Documentos" (Cliente → Empresa → Proyecto → Documento)</div>
              <div>2. ⏳ <strong>En Cola:</strong> El documento entra en la cola FIFO que gestiona el administrador</div>
              <div>3. 🔄 <strong>Procesando:</strong> El administrador procesa y sube a las plataformas CAE</div>
              <div>4. ✅ <strong>Completado:</strong> El documento está disponible en Obralia/Nalanda</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documents;