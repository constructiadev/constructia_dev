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
  Minus,
  ChevronDown,
  ChevronRight,
  EyeOff,
  Loader2
} from 'lucide-react';
import { manualManagementService, type ClientGroup, type ManualDocument } from '../../lib/manual-management-service';
import { supabaseClient, DEV_TENANT_ID } from '../../lib/supabase-real';

interface PlatformConnectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  clientName: string;
}

function PlatformConnectionsModal({ isOpen, onClose, clientId, clientName }: PlatformConnectionsModalProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<'nalanda' | 'ctaima' | 'ecoordina'>('nalanda');
  const [credentials, setCredentials] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const platforms = [
    { 
      id: 'nalanda', 
      name: 'Nalanda/Obralia', 
      color: 'bg-blue-600',
      url: 'https://identity.nalandaglobal.com/realms/nalanda/protocol/openid-connect/auth?ui_locales=es+en+pt&scope=openid&response_type=code&redirect_uri=https%3A%2F%2Fapp.nalandaglobal.com%2Fsso%2Fcallback.action&state=A_qGxYJMOi6_x7iS_nHB82svOzebK1xt_jUPTvqkQpY&nonce=Gnuep5RCKXo-9NSXhTohvgTO_B7HTFAcy5JA27gHB8s&client_id=nalanda-app',
      description: 'Plataforma principal de gestión CAE'
    },
    { 
      id: 'ctaima', 
      name: 'CTAIMA', 
      color: 'bg-green-600',
      url: 'https://login.ctaima.com/Account/Login',
      description: 'Sistema de coordinación de actividades'
    },
    { 
      id: 'ecoordina', 
      name: 'Ecoordina', 
      color: 'bg-purple-600',
      url: 'https://login.welcometotwind.io/junoprod.onmicrosoft.com/b2c_1a_signup_signin/oauth2/v2.0/authorize?client_id=b2a08c2d-92b8-48c6-8fef-b7358a110496&scope=openid%20profile%20offline_access&redirect_uri=https%3A%2F%2Fwelcometotwind.io%2F&client-request-id=76a43f68-c14b-40f3-b69c-0fb721c597f8&response_mode=fragment&response_type=code&x-client-SKU=msal.js.browser&x-client-VER=2.38.0&client_info=1&code_challenge=v5ig0AtC6pVVrqljy_BylnvEbolLoaYEwgkG_kjpdro&code_challenge_method=S256&nonce=4e4dccec-a6ff-4193-8c19-285a4908d6be&state=eyJpZCI6ImNmNTRiY2IwLTAzMTctNDNhMC1hYjU0LWRjNTUzMTk5YjBjMiIsIm1ldGEiOnsiaW50ZXJhY3Rpb25UeXBlIjoicmVkaXJlY3QifX0%3D',
      description: 'Plataforma de coordinación empresarial'
    }
  ];

  useEffect(() => {
    if (isOpen && clientId) {
      loadCredentials(selectedPlatform);
    }
  }, [isOpen, clientId]);

  useEffect(() => {
    if (isOpen && clientId && selectedPlatform) {
      loadCredentials(selectedPlatform);
    }
  }, [selectedPlatform]);

  const loadCredentials = async (platform: string) => {
    try {
      setLoading(true);
      console.log('🔍 Loading credentials for client:', clientId, 'platform:', platform);
      const creds = await manualManagementService.getPlatformCredentials(clientId, platform);
      setCredentials(creds);
      console.log('✅ Credentials loaded:', creds);
    } catch (error) {
      console.error('Error loading credentials:', error);
      setCredentials(null);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(type);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const selectedPlatformData = platforms.find(p => p.id === selectedPlatform);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Credenciales de Plataforma - {clientName}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Platform Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Seleccionar Plataforma
            </label>
            <div className="grid grid-cols-1 gap-3">
              {platforms.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => setSelectedPlatform(platform.id as any)}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    selectedPlatform === platform.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 ${platform.color} rounded-lg flex items-center justify-center mr-3`}>
                        <Globe className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{platform.name}</h4>
                        <p className="text-sm text-gray-600">{platform.description}</p>
                      </div>
                    </div>
                    <a
                      href={platform.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Abrir
                    </a>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Credentials Display */}
          {selectedPlatformData && (
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className={`w-8 h-8 ${selectedPlatformData.color} rounded-lg flex items-center justify-center mr-3`}>
                  <Globe className="h-4 w-4 text-white" />
                </div>
                <h4 className="font-medium text-gray-900">
                  Credenciales para {selectedPlatformData.name}
                </h4>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">Cargando credenciales...</span>
                </div>
              ) : credentials ? (
                <div className="space-y-4">
                  {/* Username */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Usuario
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={credentials.username || ''}
                        readOnly
                        className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900"
                      />
                      <button
                        onClick={() => copyToClipboard(credentials.username || '', 'username')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors flex items-center"
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        {copySuccess === 'username' ? 'Copiado!' : 'Copiar'}
                      </button>
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contraseña
                    </label>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={credentials.password || ''}
                          readOnly
                          className="w-full px-3 py-2 pr-10 bg-white border border-gray-300 rounded-lg text-gray-900"
                        />
                        <button
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <button
                        onClick={() => copyToClipboard(credentials.password || '', 'password')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors flex items-center"
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        {copySuccess === 'password' ? 'Copiado!' : 'Copiar'}
                      </button>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                    <div className="flex items-start">
                      <Info className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Instrucciones:</p>
                        <ol className="list-decimal list-inside space-y-1">
                          <li>Copia las credenciales usando los botones</li>
                          <li>Abre la plataforma en nueva pestaña</li>
                          <li>Inicia sesión con las credenciales copiadas</li>
                          <li>Sube los documentos manualmente</li>
                          <li>Marca los documentos como "Subidos" en el panel</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                  <h4 className="font-medium text-gray-900 mb-2">
                    No hay credenciales configuradas
                  </h4>
                  <p className="text-gray-600">
                    Este cliente no tiene credenciales para {selectedPlatformData.name}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
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
  const [clientId, setClientId] = useState('');
  const [projectId, setProjectId] = useState('');

  // Initialize form when modal opens or selectedClient changes
  useEffect(() => {
    if (isOpen) {
      setClientId(selectedClient || '');
      setProjectId(selectedProject || '');
    }
  }, [isOpen, selectedClient, selectedProject]);

  // Reset project when client changes (only if client field is enabled)
  useEffect(() => {
    if (!selectedClient && clientId) {
      setProjectId('');
    }
  }, [clientId, selectedClient]);

  // Get available projects for selected client
  const availableProjects = clientGroups
    .find(c => c.client_id === clientId)
    ?.companies.flatMap(company => company.projects) || [];

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
                {selectedClient ? 'Cliente (preseleccionado)' : 'Cliente *'}
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                disabled={!!selectedClient}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  selectedClient ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                required
              >
                <option value="">Seleccionar cliente...</option>
                {clientGroups.map(client => (
                  <option key={client.client_id} value={client.client_id}>
                    {client.client_name}
                  </option>
                ))}
              </select>
              {selectedClient && (
                <p className="text-xs text-gray-500 mt-1">
                  Cliente preseleccionado desde la cola individual
                </p>
              )}
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
                {availableProjects.map(project => (
                  <option key={project.project_id} value={project.project_id}>
                    {project.project_name}
                  </option>
                ))}
              </select>
              {!clientId && (
                <p className="text-xs text-gray-500 mt-1">
                  Primero selecciona un cliente
                </p>
              )}
              {clientId && availableProjects.length === 0 && (
                <p className="text-xs text-yellow-600 mt-1">
                  Este cliente no tiene proyectos disponibles
                </p>
              )}
            </div>
          </div>

          {/* File Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              'border-gray-300 hover:border-blue-400'
            }`}
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
  const [clientGroups, setClientGroups] = useState<ClientGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedClients, setExpandedClients] = useState<string[]>([]);
  const [processingClients, setProcessingClients] = useState<string[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<{[key: string]: boolean}>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedClientForUpload, setSelectedClientForUpload] = useState<{clientId: string; projectId: string} | null>(null);
  const [showPlatformModal, setShowPlatformModal] = useState(false);
  const [selectedClientForPlatform, setSelectedClientForPlatform] = useState<{clientId: string; clientName: string} | null>(null);
  const [draggedDocument, setDraggedDocument] = useState<ManualDocument | null>(null);
  const [updatingDocuments, setUpdatingDocuments] = useState<string[]>([]);
  const [queueStats, setQueueStats] = useState({
    total: 0,
    pending: 0,
    in_progress: 0,
    uploaded: 0,
    errors: 0,
    urgent: 0,
    high: 0,
    normal: 0,
    low: 0
  });

  useEffect(() => {
    loadData();
    
    // Set up real-time subscription to manual_upload_queue changes
    const subscription = supabaseClient
      .channel('manual-queue-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'manual_upload_queue',
          filter: `tenant_id=eq.${DEV_TENANT_ID}`
        },
        (payload) => {
          console.log('📡 Real-time update received for manual queue:', payload);
          // Reload data when queue changes
          loadData();
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Auto-refresh every 30 seconds to show real-time updates
    const interval = setInterval(() => {
      if (!loading) {
        loadClientGroups();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [loading]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      
      const [clientGroupsData, statsData] = await Promise.all([
        manualManagementService.getClientGroups(),
        manualManagementService.getQueueStats()
      ]);
      
      setClientGroups(clientGroupsData);
      setQueueStats(statsData);
    } catch (error) {
      console.error('Error loading manual management data:', error);
      setError(error instanceof Error ? error.message : 'Error loading data');
    } finally {
      setLoading(false);
      console.log('📊 Queue stats updated');
    }
  };

  const handleDocumentDragStart = (document: ManualDocument) => {
    setDraggedDocument(document);
  };

  const handleDocumentDrop = async (event: React.DragEvent) => {
    event.preventDefault();
    
    if (!draggedDocument) return;
    
    // Only allow re-upload for error documents
    if (draggedDocument.status !== 'error') {
      alert('Solo se pueden re-subir documentos con errores');
      setDraggedDocument(null);
      return;
    }
    
    // Get files from drop event
    const files = Array.from(event.dataTransfer.files);
    if (files.length === 0) {
      alert('No se detectaron archivos para re-subir');
      setDraggedDocument(null);
      return;
    }
    
    const file = files[0]; // Use first file for re-upload
    
    try {
      setUpdatingDocuments(prev => [...prev, draggedDocument.id]);
      
      // Re-upload the corrupted document
      const success = await manualManagementService.reuploadCorruptedDocument(
        draggedDocument.id,
        file
      );
      
      if (success) {
        alert('✅ Documento re-subido correctamente');
        await loadData(); // Refresh data
      } else {
        alert('❌ Error al re-subir documento');
      }
    } catch (error) {
      console.error('Error re-uploading document:', error);
      alert('❌ Error al re-subir documento');
    } finally {
      setUpdatingDocuments(prev => prev.filter(id => id !== draggedDocument.id));
      setDraggedDocument(null);
    }
  };

  const handleDocumentDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDownloadDocument = async (documentId: string, fileName: string) => {
    try {
      console.log('📥 Starting download for document:', documentId);
      const downloadUrl = await manualManagementService.downloadDocument(documentId);
      
      if (downloadUrl) {
        // Create temporary link and trigger download
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('✅ Download initiated successfully');
      } else {
        alert('❌ Error al generar enlace de descarga');
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('❌ Error al descargar documento');
    }
  };

  const handleMarkAsUploaded = async (documentId: string, documentName: string) => {
    if (!confirm(`¿Marcar "${documentName}" como subido correctamente?`)) {
      return;
    }
    
    try {
      setUpdatingDocuments(prev => [...prev, documentId]);
      
      const success = await manualManagementService.updateDocumentStatus(
        documentId,
        'uploaded',
        'nalanda', // Default platform
        `Marcado como subido por administrador - ${new Date().toLocaleString()}`
      );
      
      if (success) {
        alert('✅ Documento marcado como subido');
        await loadData(); // Refresh data
      } else {
        alert('❌ Error al marcar documento como subido');
      }
    } catch (error) {
      console.error('Error marking document as uploaded:', error);
      alert('❌ Error al marcar documento como subido');
    } finally {
      setUpdatingDocuments(prev => prev.filter(id => id !== documentId));
    }
  };

  const handleNotifyClientAboutError = async (document: ManualDocument) => {
    try {
      const success = await manualManagementService.notifyClientAboutCorruptedFile(
        document.id,
        document.original_name,
        document.last_error || 'Documento con errores detectados'
      );
      
      if (success) {
        alert('✅ Cliente notificado sobre el error del documento');
      } else {
        alert('❌ Error al notificar al cliente');
      }
    } catch (error) {
      console.error('Error notifying client:', error);
      alert('❌ Error al notificar al cliente');
    }
  };
  
  const handleConfigurePlatforms = (clientId: string, clientName: string) => {
    setSelectedClientForPlatform({ clientId, clientName });
    setShowPlatformModal(true);
  };

  const handleFileUpload = async (clientId: string, projectId: string, files: FileList) => {
    const fileArray = Array.from(files);
    const uploadKey = `${clientId}-${projectId}`;
    
    try {
      setUploadingFiles(prev => ({ ...prev, [uploadKey]: true }));
      
      for (const file of fileArray) {
        await manualManagementService.addDocumentToQueue(
          clientId,
          projectId,
          file,
          'normal',
          'nalanda'
        );
      }
      
      alert(`✅ ${fileArray.length} archivo(s) subido(s) correctamente`);
      await loadData(); // Refresh data
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('❌ Error al subir archivos');
    } finally {
      setUploadingFiles(prev => ({ ...prev, [uploadKey]: false }));
    }
  };

  const handleProcessClientFIFO = async (clientId: string) => {
    try {
      setProcessingClients(prev => [...prev, clientId]);
      
      // Get all pending documents for this client
      const client = clientGroups.find(c => c.client_id === clientId);
      if (!client) return;
      
      const allDocuments = client.companies.flatMap(company =>
        company.projects.flatMap(project => project.documents)
      );
      
      const pendingDocuments = allDocuments.filter(doc => 
        doc.status === 'pending' || doc.status === 'error'
      );
      
      if (pendingDocuments.length === 0) {
        alert('No hay documentos pendientes para este cliente');
        return;
      }
      
      // Process documents in FIFO order
      const results = await manualManagementService.processDocumentsBatch(
        pendingDocuments.map(doc => doc.id),
        'session-temp-id',
        'admin-user-id'
      );
      
      alert(`✅ Procesamiento completado: ${results.success} exitosos, ${results.errors} errores`);
      await loadData(); // Refresh data
      
    } catch (error) {
      console.error('Error processing client documents:', error);
      alert('❌ Error al procesar documentos del cliente');
    } finally {
      setProcessingClients(prev => prev.filter(id => id !== clientId));
    }
  };

  const toggleClientExpansion = (clientId: string) => {
    setExpandedClients(prev => 
      prev.includes(clientId) 
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const handleUploadForClient = (clientId: string, projectId: string) => {
    setSelectedClientForUpload({ clientId, projectId: '' }); // Don't preselect project, let admin choose
    setShowUploadModal(true);
  };

  const filteredClients = clientGroups.filter(client => {
    const matchesSearch = client.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.client_email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    
    // Filter by document status
    const hasMatchingStatus = client.companies.some(company =>
      company.projects.some(project =>
        project.documents.some(doc => doc.status === statusFilter)
      )
    );
    
    return matchesSearch && hasMatchingStatus;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Cargando gestión manual...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-red-800 font-medium">Error: {error}</span>
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
            <div className="mt-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium inline-block">
              🔄 COLA EN TIEMPO REAL - Actualización automática cada 30s
            </div>
              Administración directa de la cola de procesamiento con archivos reales
            </p>
            <div className="space-y-1 text-sm text-orange-100">
              <p>• 📁 Subida real de archivos al bucket de Supabase Storage</p>
              <p>• 🔄 Procesamiento FIFO por cliente con documentos reales</p>
              <p>• 📥 Descarga directa de documentos desde el almacenamiento</p>
              <p>• 🔗 Conexiones a plataformas externas (Nalanda, CTAIMA, Ecoordina)</p>
              <p>• 📧 Notificación automática a clientes sobre el estado de procesamiento</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={loadData}
              disabled={loading}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Actualizando...' : 'Actualizar'}
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Clientes</p>
              <p className="text-2xl font-bold text-blue-600">{clientGroups.length}</p>
            </div>
            <Users className="w-6 h-6 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Documentos</p>
              <p className="text-2xl font-bold text-green-600">
                {clientGroups.reduce((sum, client) => sum + client.total_documents, 0)}
              </p>
            </div>
            <FileText className="w-6 h-6 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Procesando</p>
              <p className="text-2xl font-bold text-yellow-600">{processingClients.length}</p>
            </div>
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Subiendo</p>
              <p className="text-2xl font-bold text-purple-600">
                {Object.values(uploadingFiles).filter(Boolean).length}
              </p>
            </div>
            <Upload className="w-6 h-6 text-purple-600" />
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
                placeholder="Buscar clientes..."
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
            </select>
          </div>
        </div>
      </div>
              Sistema de cola FIFO (First In, First Out) conectado con las subidas de clientes. Los documentos que suben los clientes aparecen automáticamente aquí.
      {/* Client Groups */}
      <div className="bg-white rounded-lg shadow-sm border">
              <div><strong>Flujo de documentos:</strong></div>
              <div>• 📤 Cliente sube documento en "Subir Documentos" (Cliente → Empresa → Proyecto → Documento)</div>
              <div>• ⏳ Documento aparece automáticamente en esta cola FIFO</div>
            <h3 className="text-lg font-semibold text-gray-900">
              Clientes con Documentos ({filteredClients.length})
              <div>• 📊 Cliente ve cambios de estado en tiempo real en su módulo "Documentos"</div>
            <div className="text-sm text-gray-600">
              <div>• 📋 Notas del administrador visibles para el cliente</div>
              <div>• 🔄 Actualización automática cada 30 segundos</div>
            </div>
          </div>
        </div>
        
        {filteredClients.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay clientes con documentos
            </h3>
            <p className="text-gray-600 mb-6">
              Los clientes aparecerán aquí cuando tengan documentos en la cola
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Subir Documentos
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredClients.map((client) => {
              const isExpanded = expandedClients.includes(client.client_id);
              const isProcessing = processingClients.includes(client.client_id);

              return (
                <div key={client.client_id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <button
                        onClick={() => toggleClientExpansion(client.client_id)}
                        className="mr-3 p-1"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-gray-600" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-600" />
                        )}
                      </button>
                      <Building2 className="w-6 h-6 text-blue-600 mr-3" />
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{client.client_name}</h4>
                        <p className="text-sm text-gray-600">{client.client_email}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                          <span>📄 {client.total_documents} documentos</span>
                          <span>🕒 {client.documents_per_hour}/hora</span>
                          <span>📅 {new Date(client.last_activity).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleConfigurePlatforms(client.client_id, client.client_name)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors flex items-center"
                      >
                        <Settings className="w-3 w-3 mr-1" />
                        Configurar Plataformas
                      </button>
                      <button
                        onClick={() => handleProcessClientFIFO(client.client_id)}
                        disabled={processingClients.includes(client.client_id) || client.total_documents === 0}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors disabled:opacity-50 flex items-center"
                      >
                        {processingClients.includes(client.client_id) ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin mr-1" />
                            Procesando...
                          </>
                        ) : (
                          <>
                            <Send className="w-3 h-3 mr-1" />
                            Procesar FIFO ({client.total_documents})
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Client Details */}
                  {isExpanded && (
                    <div className="mt-4 ml-8 space-y-4">
                      {client.companies.map((company) => (
                        <div key={company.company_id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center">
                              <Building2 className="w-5 h-5 text-green-600 mr-2" />
                              <div>
                                <h5 className="font-medium text-gray-900">{company.company_name}</h5>
                                <p className="text-sm text-gray-600">{company.total_documents} documentos</p>
                              </div>
                            </div>
                          </div>

                          {/* Projects */}
                          <div className="space-y-3">
                            {company.projects.map((project) => (
                              <div key={project.project_id} className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center">
                                    <Folder className="w-4 h-4 text-purple-600 mr-2" />
                                className={`flex items-center justify-between p-3 bg-white rounded-lg border transition-all ${
                                  document.status === 'uploaded' ? 'border-green-300 bg-green-50' :
                                  document.status === 'uploading' ? 'border-blue-300 bg-blue-50' :
                                  document.status === 'error' ? 'border-red-300 bg-red-50' :
                                  'border-gray-200 hover:shadow-sm'
                                }`}
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-600">{project.total_documents} docs</span>
                                    <button
                                      onClick={() => handleUploadForClient(client.client_id, project.project_id)}
                                      className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs transition-colors flex items-center"
                                    >
                                      <Plus className="w-3 h-3 mr-1" />
                                      Subir
                                      {document.platform_target && (
                                        <span className="ml-2 text-blue-600">→ {document.platform_target}</span>
                                      )}
                                    </button>
                                  </div>
                                    {/* Botón para cambiar estado */}
                                </div>

                                {/* Documents */}
                                {project.documents.length > 0 && (
                                  <div 
                                    className="space-y-2"
                                    onDrop={handleDocumentDrop}
                                    onDragOver={handleDocumentDragOver}
                                  >
                                    {project.documents
                                      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                                      .map((document, index) => {
                                        const canDrag = document.status === 'pending' || document.status === 'error';
                                        const isUpdating = updatingDocuments.includes(document.id);
                                        return (
                                          <div 
                                            key={document.id} 
                                            draggable={canDrag}
                                            onDragStart={() => canDrag && handleDocumentDragStart(document)}
                                            className={`flex items-center justify-between p-3 bg-white rounded border transition-all ${
                                              canDrag ? 'cursor-move hover:shadow-md hover:border-blue-300' : 'cursor-default'
                                            } ${isUpdating ? 'opacity-50' : ''}`}
                                          >
                                            <div className="flex items-center">
                                              <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded mr-2">
                                                #{index + 1}
                                              </span>
                                              <FileText className={`w-4 h-4 mr-2 ${
                                                document.status === 'uploaded' ? 'text-green-500' :
                                                document.status === 'error' ? 'text-red-500' :
                                                document.status === 'pending' ? 'text-yellow-500' :
                                                'text-gray-400'
                                              }`} />
                                              <div>
                                                <div className="font-medium text-gray-900 text-sm">
                                                  {document.original_name}
                                                  {canDrag && (
                                                    <span className="ml-2 text-xs text-blue-600 bg-blue-100 px-1 py-0.5 rounded">
                                                      📋 Arrastrable
                                                    </span>
                                                  )}
                                                </div>
                                                <div className="text-xs text-gray-500 space-y-1">
                                                  <div>
                                                    📄 {document.classification} • 
                                                    💾 {(document.file_size / 1024 / 1024).toFixed(2)} MB • 
                                                    🎯 {document.confidence}% confianza
                                                  </div>
                                                  <div>
                                                    🔒 Integridad: {document.integrity_score}% • 
                                                    🔄 Reintentos: {document.retry_count} • 
                                                    ⏰ {new Date(document.created_at).toLocaleString()}
                                                  </div>
                                                  {document.last_error && (
                                                    <div className="text-red-600">
                                                      ❌ Error: {document.last_error}
                                                    </div>
                                                  )}
                                                  {document.admin_notes && (
                                                    <div className="text-blue-600">
                                                      📝 Notas: {document.admin_notes}
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                document.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                document.status === 'uploading' ? 'bg-blue-100 text-blue-800' :
                                                document.status === 'validated' ? 'bg-purple-100 text-purple-800' :
                                                document.status === 'uploaded' ? 'bg-green-100 text-green-800' :
                                                document.status === 'error' ? 'bg-red-100 text-red-800' :
                                                'bg-gray-100 text-gray-800'
                                              }`}>
                                                {document.status}
                                              </span>
                                              
                                              {/* Mark as Uploaded Button */}
                                              {(document.status === 'pending' || document.status === 'error') && (
                                                <button
                                                  onClick={() => handleMarkAsUploaded(document.id, document.original_name)}
                                                  disabled={isUpdating}
                                                  className="p-1 text-gray-400 hover:text-green-600 transition-colors disabled:opacity-50"
                                                  title="Marcar como subido"
                                                >
                                                  {isUpdating ? (
                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                  ) : (
                                                    <CheckCircle className="w-3 h-3" />
                                                  )}
                                                </button>
                                              )}
                                              
                                              {/* Download Button */}
                                              <button
                                                onClick={() => handleDownloadDocument(document.id, document.original_name)}
                                                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                                title="Descargar documento"
                                              >
                                                <Download className="w-3 h-3" />
                                              </button>
                                              
                                              {/* Notify Client Button for Error Documents */}
                                              {document.status === 'error' && (
                                                <button
                                                  onClick={() => handleNotifyClientAboutError(document)}
                                                  className="p-1 text-gray-400 hover:text-orange-600 transition-colors"
                                                  title="Notificar cliente sobre error"
                                                >
                                                  <Mail className="w-3 h-3" />
                                                </button>
                                              )}
                                      title={
                                        document.status === 'pending' ? 'Marcar como procesando' :
                                        document.status === 'uploading' ? 'Marcar como subido' :
                                        document.status === 'uploaded' ? 'Marcar como validado' :
                                        'Cambiar estado'
                                      }
                                          </div>
                                      {document.status === 'pending' ? <Play className="w-4 h-4" /> :
                                       document.status === 'uploading' ? <CheckCircle className="w-4 h-4" /> :
                                       document.status === 'uploaded' ? <Award className="w-4 h-4" /> :
                                       <Settings className="w-4 h-4" />}
                                      })}
                                  </div>
                                )}
                                
                                {/* Notas del administrador */}
                                {document.admin_notes && (
                                  <div className="mt-2 pt-2 border-t border-gray-200">
                                    <div className="text-xs text-gray-600">
                                      <strong>Notas:</strong> {document.admin_notes}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <FileUploadModal
        isOpen={showUploadModal}
        clientGroups={clientGroups}
        selectedClient={selectedClientForUpload?.clientId || null}
        selectedProject={selectedClientForUpload?.projectId || null}
        onClose={() => setShowUploadModal(false)}
        onUpload={async (files, clientId, projectId) => {
          for (const file of files) {
            await manualManagementService.addDocumentToQueue(
              clientId,
              projectId,
              file,
              'normal',
              'nalanda'
            );
          }
          await loadData();
        }}
      />

      {/* Platform Connections Modal */}
      {showPlatformModal && selectedClientForPlatform && (
        <PlatformConnectionsModal
          isOpen={showPlatformModal}
          onClose={() => setShowPlatformModal(false)}
          clientId={selectedClientForPlatform.clientId}
          clientName={selectedClientForPlatform.clientName}
        />
      )}
    </div>
  );
}