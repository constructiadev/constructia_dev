import React, { useState, useEffect } from 'react';
import {
  Users,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  Play,
  Pause,
  Search,
  Filter,
  Building2,
  FolderOpen,
  Globe,
  Key,
  Settings,
  Activity,
  BarChart3,
  Target,
  Zap,
  Database,
  Shield,
  Mail,
  Bell,
  Calendar,
  User,
  Plus,
  X,
  Save,
  Copy,
  ExternalLink,
  Info,
  Loader2
} from 'lucide-react';
import { manualManagementService, type ManualDocument, type ClientGroup, type PlatformCredential } from '../../lib/manual-management-service';
import { useAuth } from '../../lib/auth-context';
import PlatformCredentialsModal from './PlatformCredentialsModal';

interface QueueStats {
  total: number;
  pending: number;
  in_progress: number;
  uploaded: number;
  errors: number;
  urgent: number;
  high: number;
  normal: number;
  low: number;
  corrupted: number;
  validated: number;
}

interface UploadSession {
  id: string;
  admin_user_id: string;
  session_start: string;
  session_end?: string;
  documents_processed: number;
  documents_uploaded: number;
  documents_with_errors: number;
  session_notes: string;
  session_status: 'active' | 'paused' | 'completed' | 'cancelled';
}

export default function ManualManagement() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'queue' | 'clients' | 'sessions' | 'credentials'>('queue');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [clientGroups, setClientGroups] = useState<ClientGroup[]>([]);
  const [queueStats, setQueueStats] = useState<QueueStats>({
    total: 0, pending: 0, in_progress: 0, uploaded: 0, errors: 0,
    urgent: 0, high: 0, normal: 0, low: 0, corrupted: 0, validated: 0
  });
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [processingBatch, setProcessingBatch] = useState(false);
  const [currentSession, setCurrentSession] = useState<UploadSession | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [selectedClientForCredentials, setSelectedClientForCredentials] = useState<ClientGroup | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load data sequentially to avoid overwhelming the database
      console.log('📋 Loading manual management data...');
      
      const groups = await manualManagementService.getClientGroups();
      setClientGroups(groups);
      
      const stats = await manualManagementService.getQueueStats();
      setQueueStats(stats);

      console.log('✅ Manual management data loaded successfully');
    } catch (error) {
      console.error('Error loading manual management data:', error);
      // Set fallback data instead of empty arrays
      setClientGroups([]);
      setQueueStats({
        total: 0, pending: 0, in_progress: 0, uploaded: 0, errors: 0,
        urgent: 0, high: 0, normal: 0, low: 0, corrupted: 0, validated: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    console.log('🔄 Manual refresh triggered by admin');
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleDocumentSelection = (documentId: string, checked: boolean) => {
    if (checked) {
      setSelectedDocuments(prev => [...prev, documentId]);
    } else {
      setSelectedDocuments(prev => prev.filter(id => id !== documentId));
    }
  };

  const handleSelectAll = (documents: ManualDocument[]) => {
    const documentIds = documents.map(d => d.id);
    setSelectedDocuments(prev => {
      const allSelected = documentIds.every(id => prev.includes(id));
      if (allSelected) {
        return prev.filter(id => !documentIds.includes(id));
      } else {
        return [...new Set([...prev, ...documentIds])];
      }
    });
  };

  const handleProcessBatch = async () => {
    if (selectedDocuments.length === 0) {
      alert('Selecciona al menos un documento para procesar');
      return;
    }

    if (!confirm(`¿Procesar ${selectedDocuments.length} documento(s) seleccionado(s)?`)) {
      return;
    }

    try {
      setProcessingBatch(true);
      
      // Start session if not active
      let sessionId = currentSession?.id;
      if (!sessionId) {
        sessionId = await manualManagementService.startUploadSession(user?.id || 'admin');
        if (sessionId) {
          setCurrentSession({
            id: sessionId,
            admin_user_id: user?.id || 'admin',
            session_start: new Date().toISOString(),
            documents_processed: 0,
            documents_uploaded: 0,
            documents_with_errors: 0,
            session_notes: '',
            session_status: 'active'
          });
        }
      }

      if (!sessionId) {
        alert('Error al iniciar sesión de procesamiento');
        return;
      }

      // Process documents
      const results = await manualManagementService.processDocumentsBatch(
        selectedDocuments,
        sessionId,
        user?.id || 'admin'
      );

      // Update session stats
      if (currentSession) {
        setCurrentSession(prev => prev ? {
          ...prev,
          documents_processed: prev.documents_processed + selectedDocuments.length,
          documents_uploaded: prev.documents_uploaded + results.success,
          documents_with_errors: prev.documents_with_errors + results.errors
        } : null);
      }

      // Clear selection and refresh
      setSelectedDocuments([]);
      await refreshData();

      alert(`✅ Procesamiento completado:\n- Exitosos: ${results.success}\n- Errores: ${results.errors}`);
    } catch (error) {
      console.error('Error processing batch:', error);
      alert('❌ Error al procesar documentos');
    } finally {
      setProcessingBatch(false);
    }
  };

  const handleEndSession = async () => {
    if (!currentSession) return;

    try {
      const success = await manualManagementService.endUploadSession(
        currentSession.id,
        `Session completed: ${currentSession.documents_processed} processed, ${currentSession.documents_uploaded} uploaded`
      );

      if (success) {
        setCurrentSession(null);
        alert('✅ Sesión finalizada correctamente');
      }
    } catch (error) {
      console.error('Error ending session:', error);
      alert('❌ Error al finalizar sesión');
    }
  };

  const handleDownloadDocument = async (documentId: string, fileName: string) => {
    try {
      const downloadUrl = await manualManagementService.downloadDocument(documentId);
      
      if (downloadUrl) {
        // Create temporary link and trigger download
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert('❌ Error al generar enlace de descarga');
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('❌ Error al descargar documento');
    }
  };

  const handleUpdateDocumentStatus = async (
    documentId: string, 
    newStatus: ManualDocument['status'],
    targetPlatform?: string
  ) => {
    try {
      const success = await manualManagementService.updateDocumentStatus(
        documentId,
        newStatus,
        targetPlatform,
        `Status updated by admin to ${newStatus} ${targetPlatform ? `for ${targetPlatform}` : ''}`
      );

      if (success) {
        await refreshData();
        alert(`✅ Estado actualizado a: ${newStatus}`);
      } else {
        alert('❌ Error al actualizar estado');
      }
    } catch (error) {
      console.error('Error updating document status:', error);
      alert('❌ Error al actualizar estado');
    }
  };

  const handleViewCredentials = (client: ClientGroup) => {
    setSelectedClientForCredentials(client);
    setShowCredentialsModal(true);
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
      case 'validated': return <CheckCircle className="w-4 h-4" />;
      case 'error': return <XCircle className="w-4 h-4" />;
      case 'corrupted': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '⏳ Pendiente';
      case 'uploading': return '🔄 Subiendo';
      case 'uploaded': return '✅ Subido';
      case 'validated': return '🎯 Validado';
      case 'error': return '❌ Error';
      case 'corrupted': return '⚠️ Corrupto';
      default: return status;
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent': return '🔴 Urgente';
      case 'high': return '🟠 Alta';
      case 'normal': return '🔵 Normal';
      case 'low': return '🟢 Baja';
      default: return priority;
    }
  };

  // Get all documents from all clients for filtering
  const allDocuments = clientGroups.flatMap(client => 
    client.companies.flatMap(company => 
      company.projects.flatMap(project => 
        project.documents.map(doc => ({
          ...doc,
          client_name: client.client_name,
          company_name: company.company_name,
          project_name: project.project_name
        }))
      )
    )
  );

  const filteredDocuments = allDocuments.filter(doc => {
    const matchesSearch = !searchTerm || 
      doc.original_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.project_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || doc.priority === priorityFilter;
    const matchesClient = selectedClient === 'all' || doc.client_id === selectedClient;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesClient;
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando cola de gestión manual...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <Users className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Gestión Manual de Documentos</h2>
            </div>
            <p className="text-purple-100 mb-4">
              Cola FIFO para procesamiento manual de documentos subidos por clientes
            </p>
            <div className="space-y-1 text-sm text-purple-100">
              <div>• 📋 Cola FIFO con {queueStats.total} documentos pendientes</div>
              <div>• 🔄 Actualización automática cada 30 segundos</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{queueStats.total}</div>
            <div className="text-sm text-purple-200">Documentos en Cola</div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-6 gap-3 mt-6">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-yellow-200">{queueStats.pending}</div>
            <div className="text-xs text-purple-100">Pendientes</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-blue-200">{queueStats.in_progress}</div>
            <div className="text-xs text-purple-100">Procesando</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-green-200">{queueStats.uploaded}</div>
            <div className="text-xs text-purple-100">Subidos</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-red-200">{queueStats.errors}</div>
            <div className="text-xs text-purple-100">Errores</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-orange-200">{queueStats.corrupted}</div>
            <div className="text-xs text-purple-100">Corruptos</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-emerald-200">{queueStats.validated}</div>
            <div className="text-xs text-purple-100">Validados</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('queue')}
          className={`flex-1 px-4 py-3 rounded-md font-medium transition-colors ${
            activeTab === 'queue' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FileText className="w-5 h-5 inline mr-2" />
          Cola de Documentos
        </button>
        <button
          onClick={() => setActiveTab('clients')}
          className={`flex-1 px-4 py-3 rounded-md font-medium transition-colors ${
            activeTab === 'clients' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Users className="w-5 h-5 inline mr-2" />
          Vista por Clientes
        </button>
        <button
          onClick={() => setActiveTab('sessions')}
          className={`flex-1 px-4 py-3 rounded-md font-medium transition-colors ${
            activeTab === 'sessions' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Activity className="w-5 h-5 inline mr-2" />
          Sesiones de Trabajo
        </button>
        <button
          onClick={() => setActiveTab('credentials')}
          className={`flex-1 px-4 py-3 rounded-md font-medium transition-colors ${
            activeTab === 'credentials' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Key className="w-5 h-5 inline mr-2" />
          Credenciales
        </button>
      </div>

      {/* Tab: Cola de Documentos */}
      {activeTab === 'queue' && (
        <div className="space-y-6">
          {/* Session Status */}
          {currentSession && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Activity className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <h4 className="font-semibold text-green-800">Sesión Activa</h4>
                    <p className="text-sm text-green-700">
                      Procesados: {currentSession.documents_processed} | 
                      Subidos: {currentSession.documents_uploaded} | 
                      Errores: {currentSession.documents_with_errors}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleEndSession}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Finalizar Sesión
                </button>
              </div>
            </div>
          )}

          {/* Filters and Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por documento, cliente, empresa..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-3">
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">Todos los clientes</option>
                  {clientGroups.map(client => (
                    <option key={client.client_id} value={client.client_id}>
                      {client.client_name}
                    </option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">Todos los estados</option>
                  <option value="pending">Pendientes</option>
                  <option value="uploading">Subiendo</option>
                  <option value="uploaded">Subidos</option>
                  <option value="error">Errores</option>
                </select>

                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">Todas las prioridades</option>
                  <option value="urgent">Urgente</option>
                  <option value="high">Alta</option>
                  <option value="normal">Normal</option>
                  <option value="low">Baja</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={refreshData}
                  disabled={refreshing}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Actualizando...' : 'Actualizar'}
                </button>

                {selectedDocuments.length > 0 && (
                  <button
                    onClick={handleProcessBatch}
                    disabled={processingBatch}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center disabled:opacity-50"
                  >
                    {processingBatch ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Procesar {selectedDocuments.length}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Documents Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || selectedClient !== 'all'
                    ? 'No se encontraron documentos'
                    : 'No hay documentos en la cola'
                  }
                </h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || selectedClient !== 'all'
                    ? 'Intenta ajustar los filtros de búsqueda'
                    : 'Los documentos aparecerán aquí cuando los clientes los suban'
                  }
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-4">
                        <input
                          type="checkbox"
                          checked={filteredDocuments.length > 0 && filteredDocuments.every(doc => selectedDocuments.includes(doc.id))}
                          onChange={() => handleSelectAll(filteredDocuments)}
                          className="rounded text-purple-600"
                        />
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Pos.</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Documento</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Cliente</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Empresa</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Proyecto</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Tipo</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Tamaño</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Prioridad</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Estado</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Plataforma</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Fecha</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredDocuments.map((doc) => (
                      <tr key={doc.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={selectedDocuments.includes(doc.id)}
                            onChange={(e) => handleDocumentSelection(doc.id, e.target.checked)}
                            className="rounded text-purple-600"
                          />
                        </td>
                        <td className="py-3 px-4 text-sm font-medium text-gray-900">
                          #{doc.queue_position}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-gray-400" />
                            <div>
                              <div className="font-medium text-gray-900">{doc.original_name}</div>
                              <div className="text-sm text-gray-500">{doc.file_type}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {doc.client_name}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {doc.company_name}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {doc.project_name}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {doc.classification}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {formatFileSize(doc.file_size)}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(doc.priority)}`}>
                            {getPriorityText(doc.priority)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(doc.status)}
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(doc.status)}`}>
                              {getStatusText(doc.status)}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {doc.platform_target}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {new Date(doc.created_at).toLocaleDateString('es-ES')}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDownloadDocument(doc.id, doc.original_name)}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Descargar documento"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            
                            {doc.status === 'pending' && (
                              <button
                                onClick={() => handleUpdateDocumentStatus(doc.id, 'uploading', doc.platform_target)}
                                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                title="Marcar como subiendo"
                              >
                                <Upload className="w-4 h-4" />
                              </button>
                            )}
                            
                            {doc.status === 'uploading' && (
                              <button
                                onClick={() => handleUpdateDocumentStatus(doc.id, 'uploaded', doc.platform_target)}
                                className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                                title="Marcar como subido"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            
                            {doc.status === 'uploaded' && (
                              <button
                                onClick={() => handleUpdateDocumentStatus(doc.id, 'validated', doc.platform_target)}
                                className="p-1 text-gray-400 hover:text-emerald-600 transition-colors"
                                title="Marcar como validado"
                              >
                                <Target className="w-4 h-4" />
                              </button>
                            )}
                            
                            <button
                              onClick={() => handleUpdateDocumentStatus(doc.id, 'error', doc.platform_target)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              title="Marcar como error"
                            >
                              <XCircle className="w-4 h-4" />
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
        </div>
      )}

      {/* Tab: Vista por Clientes */}
      {activeTab === 'clients' && (
        <div className="space-y-6">
          {clientGroups.map((client) => (
            <div key={client.client_id} className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <User className="w-6 h-6 text-blue-600 mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{client.client_name}</h3>
                      <p className="text-sm text-gray-600">{client.client_email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-600">{client.total_documents}</div>
                    <div className="text-sm text-gray-600">Documentos</div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {client.companies.map((company) => (
                  <div key={company.company_id} className="mb-6 last:mb-0">
                    <div className="flex items-center mb-4">
                      <Building2 className="w-5 h-5 text-green-600 mr-2" />
                      <h4 className="font-semibold text-gray-900">{company.company_name}</h4>
                      <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                        {company.total_documents} docs
                      </span>
                    </div>

                    <div className="space-y-3">
                      {company.projects.map((project) => (
                        <div key={project.project_id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center">
                              <FolderOpen className="w-4 h-4 text-purple-600 mr-2" />
                              <span className="font-medium text-gray-900">{project.project_name}</span>
                            </div>
                            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                              {project.total_documents} documentos
                            </span>
                          </div>

                          {project.documents.length > 0 && (
                            <div className="space-y-2">
                              {project.documents.map((doc) => (
                                <div key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                  <div className="flex items-center">
                                    <FileText className="w-4 h-4 text-gray-400 mr-2" />
                                    <span className="text-sm text-gray-900">{doc.original_name}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(doc.status)}`}>
                                      {getStatusText(doc.status)}
                                    </span>
                                    <button
                                      onClick={() => handleDownloadDocument(doc.id, doc.original_name)}
                                      className="p-1 text-gray-400 hover:text-blue-600"
                                    >
                                      <Download className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Sesiones de Trabajo */}
      {activeTab === 'sessions' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Sesiones de Trabajo</h3>
            {!currentSession && (
              <button
                onClick={async () => {
                  const sessionId = await manualManagementService.startUploadSession(user?.id || 'admin');
                  if (sessionId) {
                    setCurrentSession({
                      id: sessionId,
                      admin_user_id: user?.id || 'admin',
                      session_start: new Date().toISOString(),
                      documents_processed: 0,
                      documents_uploaded: 0,
                      documents_with_errors: 0,
                      session_notes: '',
                      session_status: 'active'
                    });
                  }
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
              >
                <Play className="w-4 h-4 mr-2" />
                Iniciar Sesión
              </button>
            )}
          </div>

          {currentSession ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-green-800">Sesión Activa</h4>
                    <p className="text-sm text-green-700">
                      Iniciada: {new Date(currentSession.session_start).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentSession(prev => prev ? { ...prev, session_status: 'paused' } : null)}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded-lg text-sm"
                    >
                      <Pause className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleEndSession}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm"
                    >
                      Finalizar
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{currentSession.documents_processed}</div>
                    <div className="text-sm text-green-700">Procesados</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{currentSession.documents_uploaded}</div>
                    <div className="text-sm text-green-700">Subidos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{currentSession.documents_with_errors}</div>
                    <div className="text-sm text-green-700">Errores</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No hay sesión activa</p>
            </div>
          )}
        </div>
      )}

      {/* Tab: Credenciales */}
      {activeTab === 'credentials' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Credenciales de Plataformas</h3>
          <div className="space-y-4">
            {clientGroups.map((client) => (
              <div key={client.client_id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">{client.client_name}</h4>
                    <p className="text-sm text-gray-600">{client.client_email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                      {client.platform_credentials.length} plataformas
                    </span>
                    <button
                      onClick={() => handleViewCredentials(client)}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg text-xs flex items-center"
                    >
                      <Key className="w-3 h-3 mr-1" />
                      Ver Credenciales
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {client.platform_credentials.map((credential) => (
                    <div key={credential.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <Globe className="w-4 h-4 text-purple-600 mr-2" />
                          <span className="font-medium text-gray-900 capitalize">{credential.platform_type}</span>
                        </div>
                        <span className={`w-2 h-2 rounded-full ${
                          credential.is_active ? 'bg-green-500' : 'bg-red-500'
                        }`}></span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <div>Usuario: {credential.username}</div>
                        <div>Estado: {credential.validation_status}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center py-4">
                  <p className="text-sm text-gray-600 mb-2">
                    {client.platform_credentials.length} plataforma(s) configurada(s)
                  </p>
                  <p className="text-xs text-gray-500">
                    Haz clic en "Ver Credenciales" para acceder a las credenciales operativas
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-semibold text-purple-800 mb-2">Flujo de Trabajo Manual</h4>
            <div className="text-sm text-purple-700 space-y-1">
              <div>• 📋 Cliente sube documentos a través del portal</div>
              <div>• ⏳ Documentos entran en cola FIFO por prioridad</div>
              <div>• 👨‍💼 Administrador procesa documentos manualmente</div>
              <div>• 🎯 Administrador sube a plataformas CAE (Nalanda, CTAIMA, Ecoordina)</div>
              <div>• ✅ Documento queda validado y disponible en plataforma destino</div>
              <div className="mt-2 pt-2 border-t border-purple-300">
                <div className="font-medium text-purple-800">Estados disponibles:</div>
                <div>• ⏳ Pendiente • 🔄 Subiendo • ✅ Subido • 🎯 Validado • ❌ Error • ⚠️ Corrupto</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Credentials Modal */}
      {showCredentialsModal && selectedClientForCredentials && (
        <PlatformCredentialsModal
          isOpen={showCredentialsModal}
          onClose={() => {
            setShowCredentialsModal(false);
            setSelectedClientForCredentials(null);
          }}
          client={selectedClientForCredentials}
        />
      )}
    </div>
  );
}