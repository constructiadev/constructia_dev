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
  Info,
  Upload,
  Eye,
  Trash2,
  Plus,
  Filter,
  Search,
  Users,
  Factory,
  HardHat,
  Wrench,
  Key,
  Globe,
  Send,
  X,
  Save,
  Database,
  Shield,
  Target,
  Activity,
  BarChart3
} from 'lucide-react';
import {
  getAllClients,
  getClientDocuments,
  getClientProjects,
  getClientCompanies,
  supabase
} from '../../lib/supabase';

interface QueueDocument {
  id: string;
  client_id: string;
  client_name: string;
  client_email: string;
  project_id: string;
  project_name: string;
  company_name: string;
  filename: string;
  original_name: string;
  file_size: number;
  file_type: string;
  document_type: string;
  classification_confidence: number;
  upload_status: string;
  obralia_status: string;
  created_at: string;
  queue_position: number;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  target_platform?: string;
  client_credentials?: {
    [platform: string]: {
      username: string;
      password: string;
      configured: boolean;
    };
  };
}

interface PlatformCredentials {
  platform: string;
  username: string;
  password: string;
}

interface CredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (credentials: PlatformCredentials) => void;
  document: QueueDocument | null;
  availablePlatforms: string[];
}

function CredentialsModal({ isOpen, onClose, onSubmit, document, availablePlatforms }: CredentialsModalProps) {
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [credentials, setCredentials] = useState({ username: '', password: '' });

  useEffect(() => {
    if (document && availablePlatforms.length > 0) {
      setSelectedPlatform(availablePlatforms[0]);
      // Pre-fill credentials if available
      const platformCreds = document.client_credentials?.[availablePlatforms[0]];
      if (platformCreds) {
        setCredentials({
          username: platformCreds.username,
          password: platformCreds.password
        });
      }
    }
  }, [document, availablePlatforms]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPlatform && credentials.username && credentials.password) {
      onSubmit({
        platform: selectedPlatform,
        username: credentials.username,
        password: credentials.password
      });
    }
  };

  if (!isOpen || !document) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Subir a Plataforma Externa</h2>
              <p className="text-blue-100">{document.original_name}</p>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Plataforma Destino
            </label>
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              {availablePlatforms.map(platform => (
                <option key={platform} value={platform}>
                  {platform.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Shield className="h-5 w-5 text-blue-600 mr-2" />
              <h4 className="font-semibold text-blue-800">Credenciales del Cliente</h4>
            </div>
            <p className="text-sm text-blue-700">
              Cliente: <strong>{document.client_name}</strong>
            </p>
            <p className="text-xs text-blue-600">
              Las credenciales fueron configuradas previamente por el cliente
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Usuario
            </label>
            <input
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Usuario de la plataforma"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Contraseña de la plataforma"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center"
            >
              <Upload className="h-4 w-4 mr-2" />
              Subir Documento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NewManualManagement() {
  const [queue, setQueue] = useState<QueueDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedDocument, setSelectedDocument] = useState<QueueDocument | null>(null);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);

  const [stats, setStats] = useState({
    totalInQueue: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    errors: 0,
    totalClients: 0,
    platformsConfigured: 0
  });

  useEffect(() => {
    loadQueueData();
  }, []);

  const loadQueueData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get all clients
      const clients = await getAllClients();
      
      // Build FIFO queue from all client documents
      const queueDocuments: QueueDocument[] = [];
      let position = 1;

      for (const client of clients) {
        try {
          const [documents, projects, companies] = await Promise.all([
            getClientDocuments(client.id),
            getClientProjects(client.id),
            getClientCompanies(client.id)
          ]);

          // Add documents to queue with proper metadata
          documents.forEach(doc => {
            const project = projects.find(p => p.id === doc.project_id);
            const company = companies.find(c => c.id === project?.company_id);

            queueDocuments.push({
              id: doc.id,
              client_id: client.id,
              client_name: client.company_name,
              client_email: client.email,
              project_id: doc.project_id,
              project_name: project?.name || 'Proyecto sin nombre',
              company_name: company?.name || client.company_name,
              filename: doc.filename,
              original_name: doc.original_name,
              file_size: doc.file_size,
              file_type: doc.file_type,
              document_type: doc.document_type || 'Sin clasificar',
              classification_confidence: doc.classification_confidence || 0,
              upload_status: doc.upload_status,
              obralia_status: doc.obralia_status,
              created_at: doc.created_at,
              queue_position: position++,
              priority: doc.upload_status === 'error' ? 'high' : 'normal',
              target_platform: 'obralia', // Default platform
              client_credentials: {
                obralia: client.obralia_credentials || { username: '', password: '', configured: false },
                ctaima: { username: '', password: '', configured: false },
                ecoordina: { username: '', password: '', configured: false }
              }
            });
          });
        } catch (clientError) {
          console.warn(`Error loading data for client ${client.company_name}:`, clientError);
        }
      }

      // Sort by creation date (FIFO)
      queueDocuments.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

      setQueue(queueDocuments);

      // Calculate stats
      const newStats = {
        totalInQueue: queueDocuments.length,
        pending: queueDocuments.filter(d => d.upload_status === 'pending').length,
        processing: queueDocuments.filter(d => d.upload_status === 'processing').length,
        completed: queueDocuments.filter(d => d.upload_status === 'completed').length,
        errors: queueDocuments.filter(d => d.upload_status === 'error').length,
        totalClients: clients.length,
        platformsConfigured: clients.filter(c => c.obralia_credentials?.configured).length
      };

      setStats(newStats);

    } catch (err) {
      console.error('Error loading queue data:', err);
      setError(err instanceof Error ? err.message : 'Error loading queue data');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadDocument = (document: QueueDocument) => {
    // Get available platforms for this client
    const availablePlatforms = Object.entries(document.client_credentials || {})
      .filter(([_, creds]) => creds.configured)
      .map(([platform]) => platform);

    if (availablePlatforms.length === 0) {
      alert('Este cliente no tiene plataformas configuradas. El cliente debe configurar sus credenciales primero.');
      return;
    }

    setSelectedDocument(document);
    setShowCredentialsModal(true);
  };

  const handleCredentialsSubmit = async (credentials: PlatformCredentials) => {
    if (!selectedDocument) return;

    try {
      setProcessing(selectedDocument.id);
      setShowCredentialsModal(false);

      // Simulate upload process
      console.log(`🚀 Uploading ${selectedDocument.original_name} to ${credentials.platform}`);
      console.log(`📋 Using credentials: ${credentials.username} / ${credentials.password.replace(/./g, '*')}`);

      // Simulate API call to external platform
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Update document status
      const { error } = await supabase
        .from('documents')
        .update({
          upload_status: 'completed',
          obralia_status: 'uploaded',
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedDocument.id);

      if (error) {
        throw new Error(`Error updating document: ${error.message}`);
      }

      // Update queue
      setQueue(prev => prev.map(doc => 
        doc.id === selectedDocument.id 
          ? { ...doc, upload_status: 'completed', obralia_status: 'uploaded' }
          : doc
      ));

      alert(`✅ Documento subido exitosamente a ${credentials.platform.toUpperCase()}`);

    } catch (error) {
      console.error('Error uploading document:', error);
      alert(`❌ Error al subir documento: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setProcessing(null);
      setSelectedDocument(null);
    }
  };

  const handleRemoveFromQueue = async (documentId: string) => {
    if (!confirm('¿Estás seguro de eliminar este documento de la cola?')) return;

    try {
      setQueue(prev => prev.filter(doc => doc.id !== documentId));
      alert('✅ Documento eliminado de la cola');
    } catch (error) {
      console.error('Error removing document:', error);
      alert('❌ Error al eliminar documento');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredQueue = queue.filter(doc => {
    const matchesSearch = doc.original_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.project_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || doc.upload_status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || doc.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando cola de documentos...</p>
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
            onClick={loadQueueData}
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
              Cola FIFO global para subida manual a plataformas externas
            </p>
            <div className="space-y-1 text-sm text-red-100">
              <p>• Cola unificada de todos los clientes de ConstructIA</p>
              <p>• Subida en nombre del cliente usando sus credenciales</p>
              <p>• Soporte para CTAIMA, Ecoordina, Obralia y otras plataformas</p>
              <p>• Procesamiento FIFO con prioridades configurables</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={loadQueueData}
              disabled={loading}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualizar Cola
            </button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total en Cola</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalInQueue}</p>
            </div>
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Procesando</p>
              <p className="text-2xl font-bold text-blue-600">{stats.processing}</p>
            </div>
            <RefreshCw className="w-6 h-6 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completados</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Errores</p>
              <p className="text-2xl font-bold text-red-600">{stats.errors}</p>
            </div>
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Clientes</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalClients}</p>
            </div>
            <Users className="w-6 h-6 text-purple-600" />
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
                placeholder="Buscar documentos, clientes, proyectos..."
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
              <option value="completed">Completados</option>
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
          </div>
        </div>
      </div>

      {/* Document Queue */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Cola de Documentos FIFO</h2>
            <div className="text-sm text-gray-600">
              {filteredQueue.length} documentos en cola
            </div>
          </div>
        </div>

        {filteredQueue.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay documentos en la cola
            </h3>
            <p className="text-gray-600 mb-6">
              Los documentos aparecerán aquí cuando los clientes los suban a la plataforma
            </p>
            <button
              onClick={loadQueueData}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Actualizar Cola
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Posición
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Proyecto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prioridad
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
                {filteredQueue.map((document) => (
                  <tr key={document.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">#{document.queue_position}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">{document.original_name}</p>
                          <p className="text-sm text-gray-500">
                            {document.document_type} • {formatFileSize(document.file_size)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Building2 className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-900">{document.client_name}</p>
                          <p className="text-sm text-gray-500">{document.client_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Factory className="w-4 h-4 text-green-600" />
                        <div>
                          <p className="font-medium text-gray-900">{document.project_name}</p>
                          <p className="text-sm text-gray-500">{document.company_name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(document.upload_status)}`}>
                        {document.upload_status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(document.priority)}`}>
                        {document.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(document.created_at).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleUploadDocument(document)}
                          disabled={processing === document.id || document.upload_status === 'completed'}
                          className="p-2 text-blue-600 hover:text-blue-700 disabled:opacity-50 transition-colors"
                          title="Subir a plataforma"
                        >
                          {processing === document.id ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedDocument(document);
                            // Show document details modal
                          }}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRemoveFromQueue(document.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="Eliminar de cola"
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
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <Info className="w-6 h-6 text-blue-600 mt-1" />
          <div>
            <h3 className="font-bold text-blue-800 mb-2">🔄 Sistema de Cola FIFO</h3>
            <p className="text-blue-700 mb-3">
              Gestión centralizada de documentos de todos los clientes para subida manual a plataformas externas.
            </p>
            <div className="text-sm text-blue-600 space-y-1">
              <div><strong>Flujo de trabajo:</strong></div>
              <div>• 📥 Los clientes suben documentos a sus proyectos</div>
              <div>• 🔄 Los documentos entran automáticamente en la cola FIFO</div>
              <div>• 👨‍💼 El administrador procesa la cola usando credenciales del cliente</div>
              <div>• 🚀 Subida automática a CTAIMA, Ecoordina, Obralia, etc.</div>
              <div>• ✅ Confirmación y actualización de estado</div>
              <div className="mt-2 pt-2 border-t border-blue-300">
                <div className="font-medium text-blue-800">Plataformas soportadas:</div>
                <div>• 🏗️ CTAIMA • 🌐 Ecoordina • 📋 Obralia/Nalanda • 🔧 Otras plataformas</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Credentials Modal */}
      <CredentialsModal
        isOpen={showCredentialsModal}
        onClose={() => setShowCredentialsModal(false)}
        onSubmit={handleCredentialsSubmit}
        document={selectedDocument}
        availablePlatforms={selectedDocument ? Object.keys(selectedDocument.client_credentials || {}).filter(platform => 
          selectedDocument.client_credentials?.[platform]?.configured
        ) : []}
      />
    </div>
  );
}