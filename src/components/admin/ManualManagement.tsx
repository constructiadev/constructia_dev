import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Users, 
  Building2, 
  FolderOpen, 
  Upload,
  Download,
  Eye,
  Settings,
  RefreshCw,
  Search,
  Filter,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Play,
  Pause,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  User,
  Shield,
  Database,
  Zap,
  Target,
  Activity,
  BarChart3,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Minus,
  Copy,
  ExternalLink,
  Key,
  Lock,
  Unlock,
  Save,
  X,
  Info,
  Loader2,
  Plus,
  Trash2,
  Edit,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { 
  getManualProcessingQueue, 
  getAllClients, 
  getAllPaymentGateways,
  updateClientObraliaCredentials,
  supabase 
} from '../../lib/supabase';

interface QueueItem {
  id: string;
  document_id: string;
  client_id: string;
  company_id: string;
  project_id: string;
  queue_position: number;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  manual_status: 'pending' | 'in_progress' | 'uploaded' | 'validated' | 'error' | 'corrupted';
  ai_analysis: any;
  admin_notes: string;
  corruption_detected: boolean;
  file_integrity_score: number;
  retry_count: number;
  estimated_processing_time: string;
  created_at: string;
  updated_at: string;
  documents?: {
    filename: string;
    original_name: string;
    document_type: string;
    file_size: number;
    classification_confidence: number;
  };
  clients?: {
    company_name: string;
    contact_name: string;
    obralia_credentials?: {
      configured: boolean;
      username?: string;
      password?: string;
    };
  };
  companies?: {
    name: string;
  };
  projects?: {
    name: string;
  };
}

interface GroupedQueueData {
  [clientId: string]: {
    client: {
      id: string;
      name: string;
      contact: string;
      obralia_configured: boolean;
      credentials?: {
        username: string;
        password: string;
      };
    };
    companies: {
      [companyId: string]: {
        company: {
          id: string;
          name: string;
        };
        projects: {
          [projectId: string]: {
            project: {
              id: string;
              name: string;
            };
            documents: QueueItem[];
          };
        };
      };
    };
    totalDocuments: number;
  };
}

interface ObraliaCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (clientId: string, credentials: { username: string; password: string }) => Promise<void>;
  clientData: {
    id: string;
    name: string;
    contact: string;
  } | null;
}

function ObraliaCredentialsModal({ isOpen, onClose, onSave, clientData }: ObraliaCredentialsModalProps) {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!credentials.username || credentials.username.length < 3) {
      newErrors.username = 'El usuario de Obralia es obligatorio (mín. 3 caracteres)';
    }
    if (!credentials.password || credentials.password.length < 6) {
      newErrors.password = 'La contraseña de Obralia es obligatoria (mín. 6 caracteres)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !clientData) return;
    
    setIsSubmitting(true);
    try {
      await onSave(clientData.id, credentials);
      setCredentials({ username: '', password: '' });
      onClose();
    } catch (error) {
      console.error('Error saving Obralia credentials:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !clientData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white/20 p-3 rounded-full mr-4">
                <Shield className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Configuración Obligatoria</h2>
                <p className="text-orange-100">Credenciales de Obralia</p>
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
        <div className="p-6">
          {/* Warning Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-yellow-800 mb-1">
                  Configuración Requerida
                </h4>
                <p className="text-sm text-yellow-700">
                  Para poder subir documentos automáticamente a Obralia, 
                  necesitas configurar tus credenciales. Esta configuración es 
                  <strong> obligatoria</strong> para usar la plataforma.
                </p>
              </div>
            </div>
          </div>

          {/* Client Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <User className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <p className="font-semibold text-blue-800">Cliente: {clientData.name}</p>
                <p className="text-sm text-blue-700">Contacto: {clientData.contact}</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usuario de Obralia *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={credentials.username}
                  onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="obralia_user"
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña de Obralia *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <Lock className="h-5 w-5" /> : <Unlock className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Security Notice */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm text-green-800">
                    <strong>Seguridad garantizada:</strong> Las credenciales se 
                    almacenan de forma segura y encriptada para la integración automática con Obralia.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando credenciales...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar y Continuar
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientData: {
    id: string;
    name: string;
    credentials?: {
      username: string;
      password: string;
    };
  } | null;
  selectedDocuments: QueueItem[];
  onUploadComplete: () => void;
}

function DocumentUploadModal({ isOpen, onClose, clientData, selectedDocuments, onUploadComplete }: DocumentUploadModalProps) {
  const [uploadMethod, setUploadMethod] = useState<'drag' | 'directory'>('drag');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const directoryInputRef = useRef<HTMLInputElement>(null);

  const simulateUpload = async () => {
    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatus('Conectando con Obralia...');

    try {
      // Simular proceso de subida
      const steps = [
        { progress: 20, status: 'Autenticando con credenciales...' },
        { progress: 40, status: 'Navegando a la sección correcta...' },
        { progress: 60, status: 'Subiendo documentos...' },
        { progress: 80, status: 'Validando documentos subidos...' },
        { progress: 100, status: 'Subida completada exitosamente' }
      ];

      for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        setUploadProgress(step.progress);
        setUploadStatus(step.status);
      }

      // Actualizar estado de documentos en la base de datos
      const documentIds = selectedDocuments.map(doc => doc.document_id);
      await supabase
        .from('manual_document_queue')
        .update({
          manual_status: 'uploaded',
          updated_at: new Date().toISOString()
        })
        .in('document_id', documentIds);

      onUploadComplete();
      setTimeout(() => {
        onClose();
        setIsUploading(false);
        setUploadProgress(0);
        setUploadStatus('');
      }, 2000);

    } catch (error) {
      console.error('Error uploading to Obralia:', error);
      setUploadStatus('Error en la subida');
      setIsUploading(false);
    }
  };

  if (!isOpen || !clientData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white/20 p-3 rounded-full mr-4">
                <Upload className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Subir a Obralia</h2>
                <p className="text-blue-100">{selectedDocuments.length} documentos seleccionados</p>
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
          {/* Client Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <User className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <p className="font-semibold text-blue-800">{clientData.name}</p>
                  <p className="text-sm text-blue-700">
                    Usuario Obralia: {clientData.credentials?.username || 'No configurado'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Copy className="h-4 w-4 text-blue-600 cursor-pointer" title="Copiar usuario" />
                <Copy className="h-4 w-4 text-blue-600 cursor-pointer" title="Copiar contraseña" />
              </div>
            </div>
          </div>

          {/* Upload Method Selection */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800">Método de Subida</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                uploadMethod === 'drag' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="uploadMethod"
                  value="drag"
                  checked={uploadMethod === 'drag'}
                  onChange={(e) => setUploadMethod(e.target.value as 'drag' | 'directory')}
                  className="sr-only"
                />
                <div className="flex items-center">
                  <Upload className="h-6 w-6 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Drag & Drop</p>
                    <p className="text-sm text-gray-600">Subida individual de archivos</p>
                  </div>
                </div>
              </label>

              <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                uploadMethod === 'directory' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="uploadMethod"
                  value="directory"
                  checked={uploadMethod === 'directory'}
                  onChange={(e) => setUploadMethod(e.target.value as 'drag' | 'directory')}
                  className="sr-only"
                />
                <div className="flex items-center">
                  <FolderOpen className="h-6 w-6 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Selección de Directorio</p>
                    <p className="text-sm text-gray-600">Subida masiva de carpetas</p>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Documents List */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-3">Documentos a Subir ({selectedDocuments.length})</h4>
            <div className="max-h-32 overflow-y-auto space-y-2">
              {selectedDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{doc.documents?.original_name}</span>
                  <span className="text-gray-500">{doc.documents?.document_type}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <Loader2 className="h-5 w-5 text-blue-600 animate-spin mr-2" />
                <span className="font-medium text-blue-800">Subiendo a Obralia...</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-3 mb-2">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-blue-700">{uploadStatus}</p>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
              <div>
                <h4 className="font-semibold text-green-800 mb-2">Instrucciones</h4>
                <ol className="text-sm text-green-700 space-y-1">
                  <li>1. Copia las credenciales mostradas arriba</li>
                  <li>2. Accede a Obralia con esas credenciales</li>
                  <li>3. Navega a la sección correspondiente del proyecto</li>
                  <li>4. Sube los documentos usando el método seleccionado</li>
                  <li>5. Confirma la subida en este modal</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={simulateUpload}
              disabled={isUploading}
              className="flex items-center px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Confirmar Subida
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface DocumentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: QueueItem | null;
  onUpdateStatus: (documentId: string, status: string) => void;
}

function DocumentDetailsModal({ isOpen, onClose, document, onUpdateStatus }: DocumentDetailsModalProps) {
  if (!isOpen || !document) return null;

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-8 w-8 mr-3" />
              <div>
                <h2 className="text-xl font-bold">Detalles del Documento</h2>
                <p className="text-purple-100">{document.documents?.original_name}</p>
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
          {/* Document Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Información del Documento</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Nombre:</span>
                  <span className="font-medium text-gray-900">{document.documents?.original_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tipo:</span>
                  <span className="font-medium text-gray-900">{document.documents?.document_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tamaño:</span>
                  <span className="font-medium text-gray-900">{formatFileSize(document.documents?.file_size || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Confianza IA:</span>
                  <span className="font-medium text-gray-900">{document.documents?.classification_confidence}%</span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Jerarquía</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <User className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="text-gray-700">{document.clients?.company_name}</span>
                </div>
                <div className="flex items-center ml-4">
                  <Building2 className="h-4 w-4 text-green-600 mr-2" />
                  <span className="text-gray-700">{document.companies?.name}</span>
                </div>
                <div className="flex items-center ml-8">
                  <FolderOpen className="h-4 w-4 text-purple-600 mr-2" />
                  <span className="text-gray-700">{document.projects?.name}</span>
                </div>
                <div className="flex items-center ml-12">
                  <FileText className="h-4 w-4 text-orange-600 mr-2" />
                  <span className="text-gray-700">{document.documents?.original_name}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Queue Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Estado en Cola</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Posición:</span>
                <p className="font-medium text-gray-900">#{document.queue_position}</p>
              </div>
              <div>
                <span className="text-gray-600">Prioridad:</span>
                <p className={`font-medium ${
                  document.priority === 'urgent' ? 'text-red-600' :
                  document.priority === 'high' ? 'text-orange-600' :
                  document.priority === 'normal' ? 'text-blue-600' : 'text-gray-600'
                }`}>
                  {document.priority.toUpperCase()}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Estado:</span>
                <p className="font-medium text-gray-900">{document.manual_status}</p>
              </div>
              <div>
                <span className="text-gray-600">Integridad:</span>
                <p className="font-medium text-gray-900">{document.file_integrity_score}%</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => onUpdateStatus(document.document_id, 'error')}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Marcar Error
            </button>
            <button
              onClick={() => onUpdateStatus(document.document_id, 'uploaded')}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              Marcar Subido
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const ManualManagement: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [groupedQueue, setGroupedQueue] = useState<GroupedQueueData>({});
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(new Set());
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDocumentDetails, setShowDocumentDetails] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [selectedDocument, setSelectedDocument] = useState<QueueItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadQueueData();
  }, []);

  const loadQueueData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queueData = await getManualProcessingQueue();
      setQueue(queueData || []);
      
      // Agrupar datos por jerarquía
      const grouped: GroupedQueueData = {};
      
      queueData.forEach(item => {
        const clientId = item.client_id;
        const companyId = item.company_id;
        const projectId = item.project_id;
        
        if (!grouped[clientId]) {
          grouped[clientId] = {
            client: {
              id: clientId,
              name: item.clients?.company_name || 'Cliente desconocido',
              contact: item.clients?.contact_name || '',
              obralia_configured: item.clients?.obralia_credentials?.configured || false,
              credentials: item.clients?.obralia_credentials?.configured ? {
                username: item.clients?.obralia_credentials?.username || '',
                password: item.clients?.obralia_credentials?.password || ''
              } : undefined
            },
            companies: {},
            totalDocuments: 0
          };
        }
        
        if (!grouped[clientId].companies[companyId]) {
          grouped[clientId].companies[companyId] = {
            company: {
              id: companyId,
              name: item.companies?.name || 'Empresa desconocida'
            },
            projects: {}
          };
        }
        
        if (!grouped[clientId].companies[companyId].projects[projectId]) {
          grouped[clientId].companies[companyId].projects[projectId] = {
            project: {
              id: projectId,
              name: item.projects?.name || 'Proyecto desconocido'
            },
            documents: []
          };
        }
        
        grouped[clientId].companies[companyId].projects[projectId].documents.push(item);
        grouped[clientId].totalDocuments++;
      });
      
      setGroupedQueue(grouped);
      
    } catch (err) {
      console.error('Error loading queue data:', err);
      setError(err instanceof Error ? err.message : 'Error loading queue data');
    } finally {
      setLoading(false);
    }
  };

  const toggleClientExpansion = (clientId: string) => {
    const newExpanded = new Set(expandedClients);
    if (newExpanded.has(clientId)) {
      newExpanded.delete(clientId);
    } else {
      newExpanded.add(clientId);
    }
    setExpandedClients(newExpanded);
  };

  const toggleCompanyExpansion = (companyId: string) => {
    const newExpanded = new Set(expandedCompanies);
    if (newExpanded.has(companyId)) {
      newExpanded.delete(companyId);
    } else {
      newExpanded.add(companyId);
    }
    setExpandedCompanies(newExpanded);
  };

  const toggleProjectExpansion = (projectId: string) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedProjects(newExpanded);
  };

  const toggleDocumentSelection = (documentId: string) => {
    const newSelected = new Set(selectedDocuments);
    if (newSelected.has(documentId)) {
      newSelected.delete(documentId);
    } else {
      newSelected.add(documentId);
    }
    setSelectedDocuments(newSelected);
  };

  const handleConfigureCredentials = (clientData: any) => {
    setSelectedClient(clientData);
    setShowCredentialsModal(true);
  };

  const handleSaveCredentials = async (clientId: string, credentials: { username: string; password: string }) => {
    try {
      await updateClientObraliaCredentials(clientId, credentials);
      await loadQueueData(); // Recargar datos
    } catch (error) {
      console.error('Error saving credentials:', error);
      throw error;
    }
  };

  const handleUploadToObralia = (clientData: any) => {
    const clientDocuments = queue.filter(doc => 
      doc.client_id === clientData.id && selectedDocuments.has(doc.document_id)
    );
    
    if (clientDocuments.length === 0) {
      alert('Selecciona al menos un documento para subir');
      return;
    }
    
    setSelectedClient(clientData);
    setShowUploadModal(true);
  };

  const handleUpdateDocumentStatus = async (documentId: string, status: string) => {
    try {
      await supabase
        .from('manual_document_queue')
        .update({
          manual_status: status,
          updated_at: new Date().toISOString()
        })
        .eq('document_id', documentId);
      
      await loadQueueData();
    } catch (error) {
      console.error('Error updating document status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'uploaded': return 'text-green-600 bg-green-100';
      case 'validated': return 'text-emerald-600 bg-emerald-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'corrupted': return 'text-red-800 bg-red-200';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'normal': return 'text-blue-600 bg-blue-100';
      case 'low': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const stats = {
    total: queue.length,
    pending: queue.filter(q => q.manual_status === 'pending').length,
    inProgress: queue.filter(q => q.manual_status === 'in_progress').length,
    uploaded: queue.filter(q => q.manual_status === 'uploaded').length,
    errors: queue.filter(q => q.manual_status === 'error' || q.manual_status === 'corrupted').length,
    clientsWithCredentials: Object.values(groupedQueue).filter(g => g.client.obralia_configured).length,
    clientsWithoutCredentials: Object.values(groupedQueue).filter(g => !g.client.obralia_configured).length
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-gray-600">Cargando cola de documentos...</span>
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
            <span className="text-red-800 font-medium">Error al cargar la cola</span>
          </div>
          <p className="text-red-700 mt-2">{error}</p>
          <button
            onClick={loadQueueData}
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
              Cola de procesamiento manual para subida a Obralia
            </p>
            <div className="space-y-1 text-sm text-orange-100">
              <p>• Gestión jerárquica: Cliente → Empresa → Proyecto → Documento</p>
              <p>• Subida manual con credenciales de cliente</p>
              <p>• Dos métodos: Drag & Drop y Selección de Directorio</p>
              <p>• Control de integridad y validación automática</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={loadQueueData}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </button>
            {selectedDocuments.size > 0 && (
              <button
                onClick={() => {
                  const firstSelectedDoc = queue.find(doc => selectedDocuments.has(doc.document_id));
                  if (firstSelectedDoc) {
                    const clientData = groupedQueue[firstSelectedDoc.client_id]?.client;
                    if (clientData?.obralia_configured) {
                      handleUploadToObralia(clientData);
                    } else {
                      handleConfigureCredentials(clientData);
                    }
                  }
                }}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors flex items-center"
              >
                <Upload className="w-4 h-4 mr-2" />
                Subir Seleccionados ({selectedDocuments.size})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Métricas Operativas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Cola</p>
              <p className="text-xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pendientes</p>
              <p className="text-xl font-semibold text-yellow-600">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">En Proceso</p>
              <p className="text-xl font-semibold text-blue-600">{stats.inProgress}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Subidos</p>
              <p className="text-xl font-semibold text-green-600">{stats.uploaded}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Errores</p>
              <p className="text-xl font-semibold text-red-600">{stats.errors}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Configurados</p>
              <p className="text-xl font-semibold text-purple-600">{stats.clientsWithCredentials}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar documentos, clientes, proyectos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendiente</option>
              <option value="in_progress">En Proceso</option>
              <option value="uploaded">Subido</option>
              <option value="validated">Validado</option>
              <option value="error">Error</option>
              <option value="corrupted">Corrupto</option>
            </select>
          </div>

          <div className="relative">
            <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none"
            >
              <option value="all">Todas las prioridades</option>
              <option value="urgent">Urgente</option>
              <option value="high">Alta</option>
              <option value="normal">Normal</option>
              <option value="low">Baja</option>
            </select>
          </div>

          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setPriorityFilter('all');
            }}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Cola Jerárquica */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Cola de Documentos Agrupada</h2>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {selectedDocuments.size} documentos seleccionados
              </span>
              <button
                onClick={() => setSelectedDocuments(new Set())}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Limpiar selección
              </button>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {Object.entries(groupedQueue).map(([clientId, clientGroup]) => (
            <div key={clientId} className="p-4">
              {/* Cliente Level */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => toggleClientExpansion(clientId)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    {expandedClients.has(clientId) ? (
                      <ChevronDown className="w-4 h-4 text-gray-600" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    )}
                  </button>
                  <User className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{clientGroup.client.name}</h3>
                    <p className="text-sm text-gray-600">
                      {clientGroup.totalDocuments} documentos • {clientGroup.client.contact}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {clientGroup.client.obralia_configured ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        ✓ Configurado
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                        ⚠ Sin configurar
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {!clientGroup.client.obralia_configured ? (
                    <button
                      onClick={() => handleConfigureCredentials(clientGroup.client)}
                      className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm transition-colors"
                    >
                      <Key className="w-3 h-3 mr-1 inline" />
                      Configurar
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUploadToObralia(clientGroup.client)}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
                    >
                      <Upload className="w-3 h-3 mr-1 inline" />
                      Subir a Obralia
                    </button>
                  )}
                </div>
              </div>

              {/* Empresas Level */}
              {expandedClients.has(clientId) && (
                <div className="ml-8 space-y-3">
                  {Object.entries(clientGroup.companies).map(([companyId, companyGroup]) => (
                    <div key={companyId}>
                      <div className="flex items-center space-x-3 mb-2">
                        <button
                          onClick={() => toggleCompanyExpansion(companyId)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          {expandedCompanies.has(companyId) ? (
                            <ChevronDown className="w-4 h-4 text-gray-600" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-600" />
                          )}
                        </button>
                        <Building2 className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-gray-800">{companyGroup.company.name}</span>
                        <span className="text-sm text-gray-500">
                          ({Object.keys(companyGroup.projects).length} proyectos)
                        </span>
                      </div>

                      {/* Proyectos Level */}
                      {expandedCompanies.has(companyId) && (
                        <div className="ml-8 space-y-2">
                          {Object.entries(companyGroup.projects).map(([projectId, projectGroup]) => (
                            <div key={projectId}>
                              <div className="flex items-center space-x-3 mb-2">
                                <button
                                  onClick={() => toggleProjectExpansion(projectId)}
                                  className="p-1 hover:bg-gray-100 rounded"
                                >
                                  {expandedProjects.has(projectId) ? (
                                    <ChevronDown className="w-4 h-4 text-gray-600" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4 text-gray-600" />
                                  )}
                                </button>
                                <FolderOpen className="w-4 h-4 text-purple-600" />
                                <span className="font-medium text-gray-800">{projectGroup.project.name}</span>
                                <span className="text-sm text-gray-500">
                                  ({projectGroup.documents.length} documentos)
                                </span>
                              </div>

                              {/* Documentos Level */}
                              {expandedProjects.has(projectId) && (
                                <div className="ml-8">
                                  <div className="bg-gray-50 rounded-lg overflow-hidden">
                                    <table className="w-full text-sm">
                                      <thead className="bg-gray-100">
                                        <tr>
                                          <th className="text-left p-3 font-medium text-gray-700">
                                            <input
                                              type="checkbox"
                                              onChange={(e) => {
                                                const projectDocIds = projectGroup.documents.map(d => d.document_id);
                                                if (e.target.checked) {
                                                  setSelectedDocuments(prev => new Set([...prev, ...projectDocIds]));
                                                } else {
                                                  setSelectedDocuments(prev => {
                                                    const newSet = new Set(prev);
                                                    projectDocIds.forEach(id => newSet.delete(id));
                                                    return newSet;
                                                  });
                                                }
                                              }}
                                              className="mr-2"
                                            />
                                            Documento
                                          </th>
                                          <th className="text-left p-3 font-medium text-gray-700">Tipo</th>
                                          <th className="text-left p-3 font-medium text-gray-700">Prioridad</th>
                                          <th className="text-left p-3 font-medium text-gray-700">Estado</th>
                                          <th className="text-left p-3 font-medium text-gray-700">Confianza</th>
                                          <th className="text-left p-3 font-medium text-gray-700">Acciones</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-200">
                                        {projectGroup.documents.map((doc) => (
                                          <tr key={doc.id} className="hover:bg-gray-100">
                                            <td className="p-3">
                                              <div className="flex items-center">
                                                <input
                                                  type="checkbox"
                                                  checked={selectedDocuments.has(doc.document_id)}
                                                  onChange={() => toggleDocumentSelection(doc.document_id)}
                                                  className="mr-3"
                                                />
                                                <div className="flex items-center">
                                                  <FileText className="w-4 h-4 text-orange-600 mr-2" />
                                                  <div>
                                                    <p className="font-medium text-gray-900">
                                                      {doc.documents?.original_name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                      Pos. #{doc.queue_position}
                                                    </p>
                                                  </div>
                                                </div>
                                              </div>
                                            </td>
                                            <td className="p-3">
                                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                                                {doc.documents?.document_type}
                                              </span>
                                            </td>
                                            <td className="p-3">
                                              <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(doc.priority)}`}>
                                                {doc.priority.toUpperCase()}
                                              </span>
                                            </td>
                                            <td className="p-3">
                                              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(doc.manual_status)}`}>
                                                {doc.manual_status}
                                              </span>
                                            </td>
                                            <td className="p-3">
                                              <div className="flex items-center">
                                                <div className="w-12 bg-gray-200 rounded-full h-2 mr-2">
                                                  <div
                                                    className="bg-green-600 h-2 rounded-full"
                                                    style={{ width: `${doc.documents?.classification_confidence || 0}%` }}
                                                  />
                                                </div>
                                                <span className="text-xs text-gray-600">
                                                  {doc.documents?.classification_confidence}%
                                                </span>
                                              </div>
                                            </td>
                                            <td className="p-3">
                                              <div className="flex items-center space-x-1">
                                                <button
                                                  onClick={() => {
                                                    setSelectedDocument(doc);
                                                    setShowDocumentDetails(true);
                                                  }}
                                                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                                  title="Ver detalles"
                                                >
                                                  <Eye className="w-3 h-3" />
                                                </button>
                                                <button
                                                  onClick={() => handleUpdateDocumentStatus(doc.document_id, 'in_progress')}
                                                  className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                                                  title="Marcar en proceso"
                                                >
                                                  <Play className="w-3 h-3" />
                                                </button>
                                                <button
                                                  onClick={() => handleUpdateDocumentStatus(doc.document_id, 'error')}
                                                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                                  title="Marcar error"
                                                >
                                                  <XCircle className="w-3 h-3" />
                                                </button>
                                              </div>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
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
      </div>

      {/* Información de Ayuda */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <Info className="h-6 w-6 text-blue-600 mr-3 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-800 mb-2">Flujo de Trabajo</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-blue-700">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                  <span className="text-blue-600 font-bold text-xs">1</span>
                </div>
                <span>Configurar credenciales del cliente</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                  <span className="text-blue-600 font-bold text-xs">2</span>
                </div>
                <span>Seleccionar documentos a subir</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                  <span className="text-blue-600 font-bold text-xs">3</span>
                </div>
                <span>Elegir método de subida</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                  <span className="text-blue-600 font-bold text-xs">4</span>
                </div>
                <span>Confirmar subida a Obralia</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ObraliaCredentialsModal
        isOpen={showCredentialsModal}
        onClose={() => setShowCredentialsModal(false)}
        onSave={handleSaveCredentials}
        clientData={selectedClient}
      />

      <DocumentUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        clientData={selectedClient}
        selectedDocuments={queue.filter(doc => selectedDocuments.has(doc.document_id))}
        onUploadComplete={loadQueueData}
      />

      <DocumentDetailsModal
        isOpen={showDocumentDetails}
        onClose={() => setShowDocumentDetails(false)}
        document={selectedDocument}
        onUpdateStatus={handleUpdateDocumentStatus}
      />
    </div>
  );
};

export default ManualManagement;