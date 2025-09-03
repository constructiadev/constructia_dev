import React, { useState, useEffect } from 'react';
import {
  FileText,
  Upload,
  Download,
  Eye,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Building2,
  Search,
  Filter,
  RefreshCw,
  Play,
  Pause,
  Settings,
  BarChart3,
  Activity,
  Database,
  Globe,
  Zap,
  Target,
  Package,
  Send,
  X,
  Plus,
  Save,
  Mail,
  AlertCircle,
  ExternalLink,
  RotateCcw,
  Shield,
  Info,
  Calendar,
  User,
  Folder,
  HardDrive,
  Cpu,
  Wifi,
  Server,
  Monitor,
  Code,
  Terminal,
  Key,
  Lock,
  Unlock,
  Edit,
  Copy,
  Star,
  Award,
  Lightbulb,
  Brain,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { manualManagementService, type ManualDocument, type ClientGroup } from '../../lib/manual-management-service';

interface ManualManagementState {
  clientGroups: ClientGroup[];
  selectedClient: string | null;
  selectedCompany: string | null;
  selectedProject: string | null;
  queueStats: any;
  loading: boolean;
  error: string | null;
  draggedDocument: ManualDocument | null;
  uploadingFiles: { [fileId: string]: boolean };
  downloadingFiles: { [documentId: string]: boolean };
}

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: File[], clientId: string, projectId: string) => Promise<void>;
  selectedClient: string | null;
  selectedProject: string | null;
  clientGroups: ClientGroup[];
}

function FileUploadModal({ 
  isOpen, 
  onClose, 
  onUpload, 
  selectedClient, 
  selectedProject, 
  clientGroups 
}: FileUploadModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [clientId, setClientId] = useState(selectedClient || '');
  const [projectId, setProjectId] = useState(selectedProject || '');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clientId || !projectId || selectedFiles.length === 0) {
      alert('Por favor selecciona cliente, proyecto y al menos un archivo');
      return;
    }

    setUploading(true);
    try {
      await onUpload(selectedFiles, clientId, projectId);
      setSelectedFiles([]);
      onClose();
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Subir Documentos</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Client and Project Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cliente *
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Seleccionar cliente...</option>
                {clientGroups.map(client => (
                  <option key={client.client_id} value={client.client_id}>
                    {client.client_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Proyecto *
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
                disabled={!clientId}
              >
                <option value="">Seleccionar proyecto...</option>
                {clientGroups
                  .find(c => c.client_id === clientId)
                  ?.companies.flatMap(company => company.projects)
                  .map(project => (
                    <option key={project.project_id} value={project.project_id}>
                      {project.project_name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* File Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors"
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Arrastra archivos aquí o haz clic para seleccionar
            </h4>
            <p className="text-gray-600 mb-4">
              Formatos soportados: PDF, JPG, PNG (máx. 20MB)
            </p>
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload-modal"
            />
            <label
              htmlFor="file-upload-modal"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg cursor-pointer transition-colors inline-block"
            >
              Seleccionar Archivos
            </label>
          </div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">
                Archivos Seleccionados ({selectedFiles.length})
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-600">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={uploading || selectedFiles.length === 0 || !clientId || !projectId}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg disabled:opacity-50 flex items-center"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Subir {selectedFiles.length} Archivo{selectedFiles.length > 1 ? 's' : ''}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ManualManagement() {
  const [state, setState] = useState<ManualManagementState>({
    clientGroups: [],
    selectedClient: null,
    selectedCompany: null,
    selectedProject: null,
    queueStats: {},
    loading: true,
    error: null,
    draggedDocument: null,
    uploadingFiles: {},
    downloadingFiles: {}
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const [clientGroups, queueStats] = await Promise.all([
        manualManagementService.getClientGroups(),
        manualManagementService.getQueueStats()
      ]);

      setState(prev => ({
        ...prev,
        clientGroups,
        queueStats,
        loading: false
      }));
    } catch (error) {
      console.error('Error loading manual management data:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error loading data',
        loading: false
      }));
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleUploadDocuments = async (files: File[], clientId: string, projectId: string) => {
    const uploadPromises = files.map(async (file) => {
      const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      try {
        setState(prev => ({
          ...prev,
          uploadingFiles: { ...prev.uploadingFiles, [fileId]: true }
        }));

        console.log('📁 [ManualManagement] Starting file upload:', {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          clientId,
          projectId
        });

        const document = await manualManagementService.addDocumentToQueue(
          clientId,
          projectId,
          file,
          'normal',
          'nalanda'
        );

        if (!document) {
          throw new Error('Error al subir archivo a la cola de procesamiento');
        }

        console.log('✅ [ManualManagement] File uploaded successfully:', file.name);
        return { success: true, fileName: file.name };
      } catch (error) {
        console.error('❌ Failed to add document to queue:', file.name);
        console.error('Error details:', error);
        return { success: false, fileName: file.name, error };
      } finally {
        setState(prev => ({
          ...prev,
          uploadingFiles: { ...prev.uploadingFiles, [fileId]: false }
        }));
      }
    });

    const results = await Promise.all(uploadPromises);
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    if (successful > 0) {
      alert(`✅ ${successful} archivo(s) subido(s) correctamente${failed > 0 ? `. ${failed} archivo(s) fallaron.` : ''}`);
      await loadData(); // Refresh data
    } else {
      alert('❌ Error al subir archivos. Revisa la consola para más detalles.');
    }
  };

  const handleDownloadDocument = async (document: ManualDocument) => {
    try {
      setState(prev => ({
        ...prev,
        downloadingFiles: { ...prev.downloadingFiles, [document.id]: true }
      }));

      console.log('📁 [ManualManagement] Starting document download:', document.original_name);
      
      const downloadUrl = await manualManagementService.downloadDocument(document.id);
      
      if (!downloadUrl) {
        throw new Error('No se pudo generar la URL de descarga');
      }

      // Open download in new tab
      window.open(downloadUrl, '_blank');
      console.log('✅ [ManualManagement] Document download initiated successfully');
    } catch (error) {
      console.error('❌ Error downloading document:', error);
      alert('Error al descargar documento: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    } finally {
      setState(prev => ({
        ...prev,
        downloadingFiles: { ...prev.downloadingFiles, [document.id]: false }
      }));
    }
  };

  const handleReuploadCorrupted = async (document: ManualDocument) => {
    try {
      // Check if document object is available
      if (typeof window === 'undefined' || !window.document) {
        throw new Error('Document object not available');
      }

      // Create file input for re-upload using window.document
      const input = window.document.createElement('input');
      input.type = 'file';
      input.accept = '.pdf,.jpg,.jpeg,.png';
      
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        try {
          const success = await manualManagementService.reuploadCorruptedDocument(document.id, file);
          
          if (success) {
            alert('✅ Archivo re-subido correctamente');
            await loadData(); // Refresh data
          } else {
            alert('❌ Error al re-subir archivo');
          }
        } catch (error) {
          console.error('Error re-uploading file:', error);
          alert('❌ Error al re-subir archivo');
        }
      };

      input.click();
    } catch (error) {
      console.error('Error initiating re-upload:', error);
    }
  };

  const handleNotifyClientCorruption = async (document: ManualDocument) => {
    try {
      const success = await manualManagementService.notifyClientAboutCorruptedFile(
        document.id,
        document.original_name,
        `Archivo corrupto detectado. Integridad: ${document.integrity_score}%`
      );

      if (success) {
        alert('✅ Cliente notificado sobre archivo corrupto');
      } else {
        alert('❌ Error al notificar al cliente');
      }
    } catch (error) {
      console.error('Error notifying client:', error);
      alert('❌ Error al notificar al cliente');
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, document: ManualDocument) => {
    // Only allow dragging for pending and error status
    if (document.status !== 'pending' && document.status !== 'error') {
      e.preventDefault();
      return;
    }
    
    setState(prev => ({ ...prev, draggedDocument: document }));
    e.dataTransfer.setData('text/plain', document.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setState(prev => ({ ...prev, draggedDocument: null }));
  };

  const handleDropOnReupload = async (e: React.DragEvent) => {
    e.preventDefault();
    
    if (!state.draggedDocument) return;
    
    const document = state.draggedDocument;
    
    // Only allow re-upload for pending and error status
    if (document.status !== 'pending' && document.status !== 'error') {
      alert('Solo se pueden re-subir documentos en estado pendiente o con errores');
      return;
    }

    await handleReuploadCorrupted(document);
    setState(prev => ({ ...prev, draggedDocument: null }));
  };

  const handleDragOverReupload = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'uploading': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'uploaded': return 'bg-green-100 text-green-800 border-green-200';
      case 'validated': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      case 'corrupted': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'uploading': return <Upload className="w-4 h-4" />;
      case 'uploaded': return <CheckCircle className="w-4 h-4" />;
      case 'validated': return <Shield className="w-4 h-4" />;
      case 'error': return <AlertTriangle className="w-4 h-4" />;
      case 'corrupted': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'normal': return 'bg-blue-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const isDraggable = (document: ManualDocument) => {
    return document.status === 'pending' || document.status === 'error';
  };

  const isCorrupted = (document: ManualDocument) => {
    return document.corruption_detected || document.integrity_score < 50;
  };

  const getAllDocuments = (): ManualDocument[] => {
    return state.clientGroups.flatMap(client =>
      client.companies.flatMap(company =>
        company.projects.flatMap(project => project.documents)
      )
    );
  };

  const filteredDocuments = getAllDocuments().filter(doc => {
    const matchesSearch = doc.original_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.classification.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (state.loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando gestión manual...</p>
          </div>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-red-800 font-medium">Error: {state.error}</span>
          </div>
          <button
            onClick={loadData}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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
              Administración directa de la cola de procesamiento con archivos reales
            </p>
            <div className="space-y-1 text-sm text-orange-100">
              <p>• 📁 Subida real de archivos al bucket de Supabase Storage</p>
              <p>• 🔄 Drag & Drop para re-subir documentos pendientes o con errores</p>
              <p>• 📥 Descarga directa de documentos desde el almacenamiento</p>
              <p>• 📧 Notificación automática a clientes sobre archivos corruptos</p>
              <p>• 🔍 Detección de integridad y gestión de archivos dañados</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={refreshData}
              disabled={refreshing}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Actualizando...' : 'Actualizar'}
            </button>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              <Upload className="w-4 h-4 mr-2" />
              Subir Documentos
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-blue-600">{state.queueStats.total || 0}</p>
            </div>
            <Package className="w-6 h-6 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">{state.queueStats.pending || 0}</p>
            </div>
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Subidos</p>
              <p className="text-2xl font-bold text-green-600">{state.queueStats.uploaded || 0}</p>
            </div>
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Errores</p>
              <p className="text-2xl font-bold text-red-600">{state.queueStats.errors || 0}</p>
            </div>
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Corruptos</p>
              <p className="text-2xl font-bold text-orange-600">{state.queueStats.corrupted || 0}</p>
            </div>
            <AlertCircle className="w-6 h-6 text-orange-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Validados</p>
              <p className="text-2xl font-bold text-emerald-600">{state.queueStats.validated || 0}</p>
            </div>
            <Shield className="w-6 h-6 text-emerald-600" />
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
                placeholder="Buscar documentos..."
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
              <option value="pending">Pendientes</option>
              <option value="uploading">Subiendo</option>
              <option value="uploaded">Subidos</option>
              <option value="validated">Validados</option>
              <option value="error">Con errores</option>
              <option value="corrupted">Corruptos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Drag & Drop Re-upload Zone */}
      <div
        onDrop={handleDropOnReupload}
        onDragOver={handleDragOverReupload}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          state.draggedDocument 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 bg-gray-50'
        }`}
      >
        <RotateCcw className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <h3 className="font-medium text-gray-900 mb-1">Zona de Re-subida</h3>
        <p className="text-sm text-gray-600">
          Arrastra documentos pendientes o con errores aquí para re-subirlos
        </p>
        {state.draggedDocument && (
          <div className="mt-2 p-2 bg-blue-100 rounded text-sm text-blue-800">
            📄 Arrastrando: {state.draggedDocument.original_name}
          </div>
        )}
      </div>

      {/* Documents List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Cola de Documentos ({filteredDocuments.length})
          </h3>
        </div>
        
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay documentos en la cola
            </h3>
            <p className="text-gray-600 mb-6">
              Los documentos aparecerán aquí cuando se suban a la cola de procesamiento
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Subir Primer Documento
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prioridad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Integridad
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
                {filteredDocuments.map((document) => (
                  <tr 
                    key={document.id} 
                    className={`hover:bg-gray-50 transition-colors ${
                      isDraggable(document) ? 'cursor-move' : ''
                    } ${isCorrupted(document) ? 'bg-orange-50' : ''}`}
                    draggable={isDraggable(document)}
                    onDragStart={(e) => handleDragStart(e, document)}
                    onDragEnd={handleDragEnd}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {isDraggable(document) && (
                          <div className="mr-2 text-gray-400">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path>
                            </svg>
                          </div>
                        )}
                        <FileText className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <div className="font-medium text-gray-900 flex items-center">
                            {document.original_name}
                            {isCorrupted(document) && (
                              <AlertCircle className="w-4 h-4 text-orange-500 ml-2" title="Archivo corrupto" />
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {document.classification} • {(document.file_size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {state.clientGroups.find(c => c.client_id === document.client_id)?.client_name || 'Cliente'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(document.status)}
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(document.status)}`}>
                          {document.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${getPriorityColor(document.priority)}`}></div>
                        <span className="text-sm text-gray-900 capitalize">{document.priority}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className={`h-2 rounded-full ${
                              document.integrity_score >= 80 ? 'bg-green-500' :
                              document.integrity_score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${document.integrity_score}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900">{document.integrity_score}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(document.created_at).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {/* Download Button */}
                        <button
                          onClick={() => handleDownloadDocument(document)}
                          disabled={state.downloadingFiles[document.id]}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-50"
                          title="Descargar documento"
                        >
                          {state.downloadingFiles[document.id] ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                        </button>

                        {/* View Button */}
                        <button
                          onClick={() => handleDownloadDocument(document)}
                          className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                          title="Ver documento"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Re-upload for corrupted files */}
                        {isCorrupted(document) && (
                          <>
                            <button
                              onClick={() => handleReuploadCorrupted(document)}
                              className="p-1 text-gray-400 hover:text-orange-600 transition-colors"
                              title="Re-subir archivo corrupto"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleNotifyClientCorruption(document)}
                              className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
                              title="Notificar cliente sobre corrupción"
                            >
                              <Mail className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {/* Delete Button */}
                        <button
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Eliminar documento"
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

      {/* Client Groups Summary */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Resumen por Cliente ({state.clientGroups.length})
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {state.clientGroups.map((client) => (
              <div key={client.client_id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <Building2 className="w-5 h-5 text-blue-600 mr-2" />
                    <div>
                      <h4 className="font-medium text-gray-900">{client.client_name}</h4>
                      <p className="text-sm text-gray-600">{client.client_email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">{client.total_documents}</div>
                    <div className="text-xs text-gray-500">documentos</div>
                  </div>
                </div>

                <div className="space-y-2">
                  {client.companies.map((company) => (
                    <div key={company.company_id} className="bg-gray-50 rounded p-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-800">{company.company_name}</span>
                        <span className="text-sm text-gray-600">{company.total_documents} docs</span>
                      </div>
                      <div className="mt-1 space-y-1">
                        {company.projects.map((project) => (
                          <div key={project.project_id} className="flex items-center justify-between text-xs text-gray-600">
                            <span>📁 {project.project_name}</span>
                            <span>{project.total_documents}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Última actividad:</span>
                    <span>{new Date(client.last_activity).toLocaleDateString('es-ES')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <FileUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUploadDocuments}
        selectedClient={state.selectedClient}
        selectedProject={state.selectedProject}
        clientGroups={state.clientGroups}
      />

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <Info className="h-6 w-6 text-blue-600 mr-3 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-800 mb-2">🔧 Funcionalidades Activas</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• <strong>📁 Subida real:</strong> Los archivos se almacenan en Supabase Storage</p>
              <p>• <strong>📥 Descarga directa:</strong> Haz clic en el icono de descarga para obtener el archivo</p>
              <p>• <strong>🔄 Drag & Drop:</strong> Arrastra documentos pendientes/errores a la zona de re-subida</p>
              <p>• <strong>🚨 Detección de corrupción:</strong> Archivos con integridad &lt; 50% se marcan como corruptos</p>
              <p>• <strong>📧 Notificación automática:</strong> Los clientes reciben alertas sobre archivos corruptos</p>
              <p>• <strong>🔄 Re-subida:</strong> Botón específico para archivos corruptos o dañados</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}