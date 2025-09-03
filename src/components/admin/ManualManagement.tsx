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
import { manualManagementService, type ManualDocument, type ClientGroup } from '../../lib/manual-management-service';

interface PlatformConnectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (credentials: { [platform: string]: { username: string; password: string } }) => Promise<void>;
  existingCredentials?: { [platform: string]: { username: string; password: string } };
}

function PlatformConnectionsModal({ 
  isOpen, 
  onClose, 
  onSave, 
  existingCredentials = {} 
}: PlatformConnectionsModalProps) {
  const [credentials, setCredentials] = useState<{ [platform: string]: { username: string; password: string } }>({
    nalanda: existingCredentials.nalanda || { username: '', password: '' },
    ctaima: existingCredentials.ctaima || { username: '', password: '' },
    ecoordina: existingCredentials.ecoordina || { username: '', password: '' }
  });
  const [showPasswords, setShowPasswords] = useState<{ [platform: string]: boolean }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testingConnections, setTestingConnections] = useState<{ [platform: string]: boolean }>({});
  const [connectionResults, setConnectionResults] = useState<{ [platform: string]: { success: boolean; message: string } }>({});

  const platforms = [
    { 
      id: 'nalanda', 
      name: 'Nalanda/Obralia', 
      color: 'bg-blue-600',
      description: 'Plataforma principal de gestión CAE',
      loginUrl: 'https://identity.nalandaglobal.com/realms/nalanda/protocol/openid-connect/auth'
    },
    { 
      id: 'ctaima', 
      name: 'CTAIMA', 
      color: 'bg-green-600',
      description: 'Sistema de coordinación de actividades',
      loginUrl: 'https://login.ctaima.com/Account/Login'
    },
    { 
      id: 'ecoordina', 
      name: 'Ecoordina', 
      color: 'bg-purple-600',
      description: 'Plataforma de coordinación empresarial',
      loginUrl: 'https://login.welcometotwind.io'
    }
  ];

  const testConnection = async (platformId: string) => {
    const creds = credentials[platformId];
    if (!creds.username || !creds.password) {
      alert('Por favor completa las credenciales antes de probar la conexión');
      return;
    }

    setTestingConnections(prev => ({ ...prev, [platformId]: true }));
    setConnectionResults(prev => ({ ...prev, [platformId]: { success: false, message: '' } }));

    try {
      // Simular test de conexión
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simular resultado (80% éxito)
      const success = Math.random() > 0.2;
      
      setConnectionResults(prev => ({
        ...prev,
        [platformId]: {
          success,
          message: success 
            ? 'Conexión exitosa. Credenciales válidas.'
            : 'Error de conexión. Verifica las credenciales.'
        }
      }));
    } catch (error) {
      setConnectionResults(prev => ({
        ...prev,
        [platformId]: {
          success: false,
          message: 'Error al probar la conexión.'
        }
      }));
    } finally {
      setTestingConnections(prev => ({ ...prev, [platformId]: false }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar que al menos una plataforma tenga credenciales
    const hasCredentials = Object.values(credentials).some(cred => 
      cred.username.trim() && cred.password.trim()
    );
    
    if (!hasCredentials) {
      alert('Por favor configura al menos una plataforma');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(credentials);
      onClose();
    } catch (error) {
      console.error('Error saving platform credentials:', error);
      alert('Error al guardar credenciales');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateCredential = (platformId: string, field: 'username' | 'password', value: string) => {
    setCredentials(prev => ({
      ...prev,
      [platformId]: {
        ...prev[platformId],
        [field]: value
      }
    }));
  };

  const togglePasswordVisibility = (platformId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [platformId]: !prev[platformId]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white/20 p-3 rounded-full mr-4">
                <Globe className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Conexiones a Plataformas</h2>
                <p className="text-blue-100">Configurar credenciales para Nalanda, CTAIMA y Ecoordina</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Platform Credentials */}
          <div className="space-y-6">
            {platforms.map((platform) => (
              <div key={platform.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className={`w-12 h-12 ${platform.color} rounded-lg flex items-center justify-center mr-4`}>
                      <Globe className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{platform.name}</h3>
                      <p className="text-sm text-gray-600">{platform.description}</p>
                      <a 
                        href={platform.loginUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 flex items-center mt-1"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Ir a la plataforma
                      </a>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => testConnection(platform.id)}
                    disabled={testingConnections[platform.id] || !credentials[platform.id]?.username || !credentials[platform.id]?.password}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 flex items-center"
                  >
                    {testingConnections[platform.id] ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Probando...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Probar
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Usuario
                    </label>
                    <input
                      type="text"
                      value={credentials[platform.id]?.username || ''}
                      onChange={(e) => updateCredential(platform.id, 'username', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder={`usuario@${platform.id}.com`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contraseña
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords[platform.id] ? 'text' : 'password'}
                        value={credentials[platform.id]?.password || ''}
                        onChange={(e) => updateCredential(platform.id, 'password', e.target.value)}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility(platform.id)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords[platform.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Connection Test Result */}
                {connectionResults[platform.id] && (
                  <div className={`mt-4 p-3 rounded-lg ${
                    connectionResults[platform.id].success 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    <div className="flex items-center">
                      {connectionResults[platform.id].success ? (
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                      )}
                      <span className={`text-sm ${
                        connectionResults[platform.id].success ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {connectionResults[platform.id].message}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Credenciales
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

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
  expandedClients: string[];
  showPlatformModal: boolean;
  processingClients: { [clientId: string]: boolean };
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
      url: 'https://identity.nalandaglobal.com/realms/nalanda/protocol/openid-connect/auth',
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
      url: 'https://login.welcometotwind.io',
      description: 'Plataforma de coordinación empresarial'
    }
  ];

  useEffect(() => {
    if (isOpen && clientId) {
      loadCredentials();
    }
  }, [isOpen, clientId, selectedPlatform]);

  const loadCredentials = async () => {
    try {
      setLoading(true);
      const clientCredentials = await manualManagementService.getPlatformCredentials(clientId);
      const platformCredential = clientCredentials.find(c => c.platform_type === selectedPlatform);
      setCredentials(platformCredential || null);
    } catch (error) {
      console.error('Error loading credentials:', error);
      setCredentials(null);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: 'username' | 'password') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(type);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const openPlatform = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (!isOpen) return null;

  const selectedPlatformInfo = platforms.find(p => p.id === selectedPlatform);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white/20 p-3 rounded-full mr-4">
                <Globe className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Conexiones a Plataformas</h2>
                <p className="text-blue-100">Cliente: {clientName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Platform Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Seleccionar Plataforma
            </label>
            <div className="grid grid-cols-1 gap-3">
              {platforms.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => setSelectedPlatform(platform.id as any)}
                  className={`flex items-center justify-between p-4 border-2 rounded-lg transition-colors ${
                    selectedPlatform === platform.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-10 h-10 ${platform.color} rounded-lg flex items-center justify-center mr-3`}>
                      <Globe className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-semibold text-gray-900">{platform.name}</h4>
                      <p className="text-sm text-gray-600">{platform.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openPlatform(platform.url);
                      }}
                      className="text-blue-600 hover:text-blue-700"
                      title="Abrir plataforma"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </button>
                    {selectedPlatform === platform.id && (
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Credentials Display */}
          {selectedPlatformInfo && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">
                  Credenciales para {selectedPlatformInfo.name}
                </h3>
                <button
                  onClick={() => openPlatform(selectedPlatformInfo.url)}
                  className="flex items-center text-blue-600 hover:text-blue-700 text-sm"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Abrir Plataforma
                </button>
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
                      <div className="flex-1 bg-white border border-gray-300 rounded-lg p-3 font-mono text-sm">
                        {credentials.username}
                      </div>
                      <button
                        onClick={() => copyToClipboard(credentials.username, 'username')}
                        className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        title="Copiar usuario"
                      >
                        {copySuccess === 'username' ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contraseña
                    </label>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-white border border-gray-300 rounded-lg p-3 font-mono text-sm flex items-center justify-between">
                        <span>
                          {showPassword ? credentials.password : '••••••••••••'}
                        </span>
                        <button
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <button
                        onClick={() => copyToClipboard(credentials.password, 'password')}
                        className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                        title="Copiar contraseña"
                      >
                        {copySuccess === 'password' ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${
                        credentials.validation_status === 'valid' ? 'bg-green-500' : 'bg-yellow-500'
                      }`}></div>
                      <span className="text-sm text-gray-700">
                        Estado: {credentials.validation_status === 'valid' ? 'Válidas' : 'Pendiente validación'}
                      </span>
                    </div>
                    {credentials.last_validated && (
                      <span className="text-xs text-gray-500">
                        Validado: {new Date(credentials.last_validated).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                  <h4 className="font-semibold text-gray-900 mb-2">
                    No hay credenciales configuradas
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Este cliente no tiene credenciales para {selectedPlatformInfo.name}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-800 mb-2">Instrucciones para el Administrador</h4>
                <ol className="text-sm text-blue-700 space-y-1">
                  <li>1. Copia las credenciales usando los botones de copiar</li>
                  <li>2. Abre la plataforma haciendo clic en "Abrir Plataforma"</li>
                  <li>3. Inicia sesión con las credenciales copiadas</li>
                  <li>4. Sube los documentos manualmente en la plataforma</li>
                  <li>5. Vuelve aquí y marca los documentos como "Subidos"</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-xl">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              <Key className="h-4 w-4 inline mr-1" />
              Credenciales del cliente para uso administrativo
            </div>
            <button
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await manualManagementService.getClientGroups();
      setClientGroups(data);
    } catch (error) {
      console.error('Error loading manual management data:', error);
      setError(error instanceof Error ? error.message : 'Error loading data');
    } finally {
      setLoading(false);
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
    setSelectedClientForUpload({ clientId, projectId });
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

      {/* Client Groups */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Clientes con Documentos ({filteredClients.length})
            </h3>
            <div className="text-sm text-gray-600">
              Procesamiento FIFO por cliente
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
                                    <span className="font-medium text-gray-800">{project.project_name}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-600">{project.total_documents} docs</span>
                                    <button
                                      onClick={() => handleUploadForClient(client.client_id, project.project_id)}
                                      className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs transition-colors flex items-center"
                                    >
                                      <Plus className="w-3 h-3 mr-1" />
                                      Subir
                                    </button>
                                  </div>
                                </div>

                                {/* Documents */}
                                {project.documents.length > 0 && (
                                  <div className="space-y-2">
                                    {project.documents
                                      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                                      .map((document, index) => (
                                        <div key={document.id} className="flex items-center justify-between p-2 bg-white rounded border">
                                          <div className="flex items-center">
                                            <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded mr-2">
                                              #{index + 1}
                                            </span>
                                            <FileText className="w-4 h-4 text-gray-400 mr-2" />
                                            <div>
                                              <div className="font-medium text-gray-900 text-sm">{document.original_name}</div>
                                              <div className="text-xs text-gray-500">
                                                {document.classification} • {(document.file_size / 1024 / 1024).toFixed(2)} MB
                                              </div>
                                            </div>
                                          </div>

                                          <div className="flex items-center space-x-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                              document.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                              document.status === 'uploaded' ? 'bg-green-100 text-green-800' :
                                              document.status === 'error' ? 'bg-red-100 text-red-800' :
                                              'bg-gray-100 text-gray-800'
                                            }`}>
                                              {document.status}
                                            </span>
                                            <button
                                              onClick={() => console.log('Download document:', document.id)}
                                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                              title="Descargar documento"
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
        selectedClientForUpload={selectedClientForUpload}
        onClose={() => setShowUploadModal(false)}
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