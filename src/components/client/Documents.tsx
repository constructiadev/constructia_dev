import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Download,
  Eye,
  Clock,
  CheckCircle,
  AlertTriangle,
  Brain,
  Upload,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getCurrentClientData, getClientDocuments } from '../../lib/supabase';
import type { Document } from '../../types';

export default function Documents() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadDocuments();
  }, [user]);

  useEffect(() => {
    filterDocuments();
  }, [documents, searchTerm, filterStatus, filterType]);

  const loadDocuments = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Obtener datos del cliente
      const clientData = await getCurrentClientData(user.id);
      if (!clientData) {
        throw new Error('No se encontraron datos del cliente');
      }

      // Obtener documentos del cliente
      const documentsData = await getClientDocuments(clientData.id);
      
      // Transformar datos para compatibilidad con el componente
      const transformedDocuments = documentsData.map((doc: any) => ({
        id: doc.id,
        project_id: doc.project_id,
        client_id: doc.client_id,
        filename: doc.filename,
        original_name: doc.original_name,
        file_size: doc.file_size,
        file_type: doc.file_type,
        document_type: doc.document_type,
        classification_confidence: doc.classification_confidence,
        ai_metadata: doc.ai_metadata,
        upload_status: doc.upload_status,
        obralia_status: doc.obralia_status,
        security_scan_status: doc.security_scan_status,
        deletion_scheduled_at: doc.deletion_scheduled_at,
        obralia_document_id: doc.obralia_document_id,
        processing_attempts: doc.processing_attempts,
        last_processing_error: doc.last_processing_error,
        created_at: doc.created_at,
        updated_at: doc.updated_at,
        project_name: doc.projects?.name || 'Sin proyecto',
        company_name: doc.companies?.name || 'Sin empresa',
        processed_at: doc.updated_at
      }));
      
      setDocuments(transformedDocuments);
      setFilteredDocuments(transformedDocuments);
    } catch (error) {
      console.error('Error loading documents:', error);
      setError('Error al cargar los documentos');
    } finally {
      setLoading(false);
    }
  };

  const filterDocuments = () => {
    let filtered = documents.filter(doc => {
      const matchesSearch = doc.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.original_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.document_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.project_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.company_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || doc.upload_status === filterStatus;
      const matchesType = filterType === 'all' || doc.document_type === filterType;
      
      return matchesSearch && matchesStatus && matchesType;
    });

    setFilteredDocuments(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'uploaded_to_obralia': return 'bg-blue-100 text-blue-800';
      case 'classified': return 'bg-purple-100 text-purple-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'uploaded_to_obralia': return <Upload className="h-4 w-4 text-blue-600" />;
      case 'classified': return <Brain className="h-4 w-4 text-purple-600" />;
      case 'processing': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const documentTypes = [...new Set(documents.map(doc => doc.document_type))];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error al cargar documentos</h3>
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={loadDocuments}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Mis Documentos</h2>
          <p className="text-gray-600">Gestión completa de documentos procesados</p>
        </div>
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">{filteredDocuments.length} documentos</span>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar documentos..."
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
            <option value="completed">Completado</option>
            <option value="uploaded_to_obralia">Subido a Obralia</option>
            <option value="classified">Clasificado</option>
            <option value="processing">Procesando</option>
            <option value="error">Error</option>
          </select>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="all">Todos los tipos</option>
            {documentTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de Documentos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proyecto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tamaño</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confianza IA</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDocuments.map((document) => (
                <tr key={document.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-blue-600 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{document.original_name}</div>
                        <div className="text-sm text-gray-500">{document.filename}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{document.project_name}</div>
                      <div className="text-sm text-gray-500">{document.company_name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {document.document_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {formatFileSize(document.file_size)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {getStatusIcon(document.upload_status)}
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(document.upload_status)}`}>
                        {document.upload_status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {document.classification_confidence}%
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(document.created_at)}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900">
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

      {filteredDocuments.length === 0 && !loading && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">No se encontraron documentos</h3>
          <p className="text-gray-600">
            {searchTerm ? 'Intenta con otros términos de búsqueda' : 'No hay documentos disponibles'}
          </p>
        </div>
      )}
    </div>
  );
}