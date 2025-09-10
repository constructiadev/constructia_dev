import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText, Upload, Download, Eye, Trash2, AlertCircle, CheckCircle, Clock, Search, Filter, Plus, RefreshCw,
  Users, Building2, FolderOpen, Settings, Key, X, Save, Loader2,
  BarChart3, TrendingUp, Activity, Database, Shield, Globe, Zap,
  ArrowUp, ArrowDown, Minus, Star, Award, Lightbulb, Cpu, HardDrive, Wifi, Server, Monitor, Code, Terminal,
  Lock, Unlock, Edit, Copy, Calendar, User, Folder, Mail, ExternalLink, RotateCcw, Info,
  EyeOff, ChevronDown, ChevronRight, Brain, Target, Package, Send, Pause, Play
} from 'lucide-react';
import { manualManagementService, type ManualDocument, type ClientGroup, type PlatformCredential, type UploadSession } from '../../lib/manual-management-service';
import { useAuth } from '../../lib/auth-context';
import { logAuditoria, DEV_TENANT_ID } from '../../lib/supabase-real';
import DocumentUploadModal from './DocumentUploadModal'; // Reusing client upload component

interface QueueItem {
  id: string;
  client_id: string;
  client_name: string;
  project_id: string;
  project_name: string;
  original_name: string;
  file_size: number;
  file_type: string;
  status: 'pending' | 'processing' | 'uploaded' | 'error' | 'validated';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  platform: 'nalanda' | 'ctaima' | 'ecoordina';
  classification: string;
  confidence: number;
  integrity_score: number;
  retry_count: number;
  last_error?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

interface QueueStats {
  total: number;
  pending: number;
  processing: number;
  uploaded: number;
  error: number;
  validated: number;
  urgent: number;
  high: number;
  normal: number;
  low: number;
}

interface PlatformConnectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  credentials: PlatformCredential[];
  onSaveCredentials: (platform: string, username: string, password: string) => Promise<void>;
}

function PlatformConnectionsModal({ isOpen, onClose, credentials, onSaveCredentials }: PlatformConnectionsModalProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<'nalanda' | 'ctaima' | 'ecoordina'>('nalanda');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  const platforms = [
    { id: 'nalanda', name: 'Nalanda/Obralia', color: 'bg-blue-600', url: 'https://app.nalandaglobal.com' },
    { id: 'ctaima', name: 'CTAIMA', color: 'bg-green-600', url: 'https://login.ctaima.com' },
    { id: 'ecoordina', name: 'Ecoordina', color: 'bg-purple-600', url: 'https://welcometotwind.io' }
  ];

  useEffect(() => {
    if (isOpen) {
      const platformCreds = credentials.find(c => c.platform === selectedPlatform);
      setUsername(platformCreds?.username || '');
      setPassword(platformCreds?.password || '');
    }
  }, [isOpen, selectedPlatform, credentials]);

  const handleSave = async () => {
    if (!username || !password) {
      alert('Por favor completa todos los campos');
      return;
    }

    setSaving(true);
    try {
      await onSaveCredentials(selectedPlatform, username, password);
      alert('✅ Credenciales guardadas correctamente');
    } catch (error) {
      console.error('Error saving credentials:', error);
      alert('❌ Error al guardar credenciales');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Configurar Credenciales de Plataforma</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Platform Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Seleccionar Plataforma</label>
            <div className="grid grid-cols-1 gap-3">
              {platforms.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => setSelectedPlatform(platform.id as any)}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    selectedPlatform === platform.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 ${platform.color} rounded-lg flex items-center justify-center mr-3`}>
                        <Globe className="h-5 w-5 text-white" />
                      </div>
                      <span className="font-medium text-gray-900">{platform.name}</span>
                    </div>
                    <a href={platform.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Credentials Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Usuario</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Nombre de usuario"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !username || !password}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg disabled:opacity-50 flex items-center"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ManualManagement() {
  const { user } = useAuth();
  const [clientGroups, setClientGroups] = useState<ClientGroup[]>([]);
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [queueStats, setQueueStats] = useState<QueueStats>({
    total: 0, pending: 0, processing: 0, uploaded: 0, error: 0, validated: 0,
    urgent: 0, high: 0, normal: 0, low: 0
  });
  const [platformCredentials, setPlatformCredentials] = useState<PlatformCredential[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [selectedDocuments, setSelectedDocuments] = useState<QueueItem[]>([]);
  const [showPlatformModal, setShowPlatformModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadSessionId, setUploadSessionId] = useState<string | null>(null);
  const [processingBatch, setProcessingBatch] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [clientGroupsData, queueItemsData, queueStatsData, platformCredentialsData] = await Promise.all([
        manualManagementService.getClientGroups(),
        manualManagementService.getManualUploadQueueItems(),
        manualManagementService.getQueueStats(),
        manualManagementService.getPlatformCredentials() // Load tenant-wide credentials for display
      ]);

      setClientGroups(clientGroupsData);
      setQueueItems(queueItemsData);
      setQueueStats(queueStatsData);
      setPlatformCredentials(platformCredentialsData);
      setLoading(false);
      setProcessedCount(0); // Reset batch processing counts
      setErrorCount(0);
    } catch (err) {
      console.error('Error loading manual management data:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSavePlatformCredentials = async (platform: string, username: string, password: string) => {
    try {
      await manualManagementService.savePlatformCredentials(platform, username, password);
      await loadData(); // Refresh credentials
      
      await logAuditoria(
        'platform_credentials_updated',
        'manual_management',
        { platform, username: username.substring(0, 3) + '***' },
        user?.id || 'admin-user'
      );
    } catch (error) {
      console.error('Error saving platform credentials:', error);
      throw error;
    }
  };

  const handleUpdateDocumentStatus = async (documentId: string, newStatus: string, notes?: string) => {
    try {
      await manualManagementService.updateDocumentStatus(documentId, newStatus, 'nalanda', notes);
      await loadData(); // Refresh data
      
      await logAuditoria(
        'document_status_updated',
        'manual_management',
        { document_id: documentId, new_status: newStatus, notes },
        user?.id || 'admin-user'
      );
    } catch (error) {
      console.error('Error updating document status:', error);
      alert('❌ Error al actualizar estado del documento');
    }
  };

  const handleRetryDocument = async (documentId: string) => {
    try {
      await manualManagementService.retryDocument(documentId);
      await loadData(); // Refresh data
      alert('✅ Documento marcado para reintento');
      
      await logAuditoria(
        'document_retry_requested',
        'manual_management',
        { document_id: documentId },
        user?.id || 'admin-user'
      );
    } catch (error) {
      console.error('Error retrying document:', error);
      alert('❌ Error al reintentar documento');
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este documento?')) {
      return;
    }

    try {
      await manualManagementService.deleteDocument(documentId);
      await loadData(); // Refresh data
      alert('✅ Documento eliminado correctamente');
      
      await logAuditoria(
        'document_deleted',
        'manual_management',
        { document_id: documentId },
        user?.id || 'admin-user'
      );
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('❌ Error al eliminar documento');
    }
  };

  const handleDownloadDocument = async (documentId: string, filename: string) => {
    try {
      setLoading(true);
      const url = await manualManagementService.downloadDocument(documentId);
      
      if (url) {
        // Force download instead of opening in browser
        const link = document.createElement('a');
        link.href = url; // The signed URL
        link.download = filename; // Suggests the filename for download
        link.target = '_blank'; // Open in new tab to prevent navigation
        document.body.appendChild(link); // Append to body
        link.click(); // Simulate click
        document.body.removeChild(link); // Clean up

        alert('✅ Documento listo para descargar');
      } else {
        alert('❌ No se pudo obtener el enlace de descarga');
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('❌ Error al descargar documento');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessBatch = async () => {
    setProcessingBatch(true);
    const results = await manualManagementService.processDocumentsBatch(
      selectedDocuments.map(doc => doc.id),
      uploadSessionId || 'mock-session-id', // Fallback if session not started
      user?.id || 'admin-user'
    );
    setProcessedCount(results.success);
    setErrorCount(results.errors);
    setProcessingBatch(false);
    setSelectedDocuments([]);
    loadData(); // Refresh data after batch processing
  };

  const handleStartUploadSession = async () => {
    const sessionId = await manualManagementService.startUploadSession(user?.id || 'admin-user');
    setUploadSessionId(sessionId);
    setShowUploadModal(true);
  };

  const handleEndUploadSession = async () => {
    if (!uploadSessionId) return;
    
    setLoading(true);
    await manualManagementService.endUploadSession(uploadSessionId || 'mock-session-id', 'Manual upload completed');
    setUploadSessionId(null);
    setProcessedCount(0);
    setErrorCount(0);
    loadData();
  };

  const filteredItems = queueItems.filter(item => {
    const matchesSearch = item.original_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.project_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || item.priority === priorityFilter;
    const matchesPlatform = platformFilter === 'all' || item.platform === platformFilter;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesPlatform;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Gestión Manual de Documentos</h1>
            <p className="text-blue-100">Administración avanzada de la cola de procesamiento</p>
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
              onClick={() => setShowPlatformModal(true)}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              <Settings className="w-4 h-4 mr-2" />
              Plataformas
            </button>
            <button
              onClick={handleStartUploadSession}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              <Upload className="w-4 h-4 mr-2" />
              Subir Documentos
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Clientes Activos</p>
              <p className="text-2xl font-bold text-gray-900">{clientGroups.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Documentos</p>
              <p className="text-2xl font-bold text-gray-900">{queueStats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-gray-900">{queueStats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Con Errores</p>
              <p className="text-2xl font-bold text-gray-900">{queueStats.error}</p>
            </div>
          </div>
        </div>
      </div>

      {/* KPIs de Procesamiento */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Procesando</p>
              <p className="text-2xl font-bold text-gray-900">{queueStats.processing}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg flex items-center justify-center">
              <Upload className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Subiendo</p>
              <p className="text-2xl font-bold text-gray-900">{queueStats.uploaded}</p>
            </div>
          </div>
        </div>
        {processedCount > 0 && (
          <div className="bg-green-50 rounded-lg shadow-sm p-6 border">
            <p className="text-sm font-medium text-gray-600">Último Lote Procesado</p>
            <p className="text-2xl font-bold text-green-600">{processedCount} éxitos, {errorCount} errores</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Cola de Procesamiento Manual</h2>
          <p className="text-sm text-gray-600 mt-1">
            Gestiona documentos individualmente o en lotes con procesamiento FIFO
          </p>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar documentos, clientes o proyectos..."
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
                <option value="processing">Procesando</option>
                <option value="uploaded">Subidos</option>
                <option value="validated">Validados</option>
                <option value="error">Con errores</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todas las prioridades</option>
                <option value="urgent">Urgente</option>
                <option value="high">Alta</option>
                <option value="normal">Normal</option>
                <option value="low">Baja</option>
              </select>
              <select
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todas las plataformas</option>
                <option value="nalanda">Nalanda</option>
                <option value="ctaima">CTAIMA</option>
                <option value="ecoordina">Ecoordina</option>
              </select>
            </div>
          </div>
        </div>

        {/* Batch Actions */}
        {selectedDocuments.length > 0 && (
          <div className="px-6 py-4 bg-blue-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-900">
                  {selectedDocuments.length} documento(s) seleccionado(s)
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleProcessBatch}
                  disabled={processingBatch}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center"
                >
                  {processingBatch ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Procesar Lote
                    </>
                  )}
                </button>
                <button
                  onClick={() => setSelectedDocuments([])}
                  className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Documents Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedDocuments.length === filteredItems.length && filteredItems.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedDocuments(filteredItems);
                      } else {
                        setSelectedDocuments([]);
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Documento
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente/Proyecto
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prioridad
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plataforma
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedDocuments.some(selected => selected.id === doc.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedDocuments(prev => [...prev, doc]);
                        } else {
                          setSelectedDocuments(prev => prev.filter(selected => selected.id !== doc.id));
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{doc.original_name}</div>
                        <div className="text-sm text-gray-500">
                          {doc.classification} • {(doc.file_size / 1024 / 1024).toFixed(2)} MB • {doc.confidence}% confianza
                        </div>
                        {doc.last_error && (
                          <div className="text-xs text-red-600 mt-1">
                            Error: {doc.last_error}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm text-gray-900">{doc.client_name}</div>
                    <div className="text-sm text-gray-500">{doc.project_name}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      doc.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      doc.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      doc.status === 'uploaded' ? 'bg-green-100 text-green-800' :
                      doc.status === 'validated' ? 'bg-purple-100 text-purple-800' :
                      doc.status === 'error' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      doc.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                      doc.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      doc.priority === 'normal' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {doc.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-900 capitalize">{doc.platform}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownloadDocument(doc.id, doc.original_name)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Descargar documento"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      {doc.status === 'error' && (
                        <button
                          onClick={() => handleRetryDocument(doc.id)}
                          className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                          title="Reintentar procesamiento"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleUpdateDocumentStatus(doc.id, 'uploaded', 'Marcado como subido manualmente')}
                        className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                        title="Marcar como subido"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteDocument(doc.id)}
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

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay documentos</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || platformFilter !== 'all'
                ? 'No se encontraron documentos con los filtros aplicados'
                : 'No hay documentos en la cola de procesamiento'}
            </p>
          </div>
        )}
      </div>

      {/* Platform Connections Modal */}
      <PlatformConnectionsModal
        isOpen={showPlatformModal}
        onClose={() => setShowPlatformModal(false)}
        credentials={platformCredentials}
        onSaveCredentials={handleSavePlatformCredentials}
      />

      {/* Upload Modal */}
      {showUploadModal && (
        <DocumentUploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onUploadComplete={handleEndUploadSession}
          sessionId={uploadSessionId}
        />
      )}

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-4 text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}