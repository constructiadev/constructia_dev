import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  X, 
  Eye,
  Download,
  Clock,
  Brain,
  Shield,
  Database,
  Settings,
  RefreshCw,
  Plus,
  Filter,
  Search,
  Calendar,
  Building2,
  User,
  Trash2
} from 'lucide-react';
import { getAllClients } from '../../lib/supabase';
import { updateClientObraliaCredentials } from '../../lib/supabase';
import ObraliaCredentialsModal from './ObraliaCredentialsModal';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'processing' | 'classifying' | 'uploading_to_obralia' | 'completed' | 'error';
  progress: number;
  error?: string;
  classification?: string;
  confidence?: number;
  project_id?: string;
  company_id?: string;
  obralia_status?: 'pending' | 'uploaded' | 'validated' | 'rejected';
  security_scan?: 'pending' | 'safe' | 'threat_detected';
  created_at: string;
}

interface Project {
  id: string;
  name: string;
  company_name: string;
}

interface Company {
  id: string;
  name: string;
}

interface FileDetailsModalProps {
  file: UploadedFile | null;
  isOpen: boolean;
  onClose: () => void;
  onRetry: (fileId: string) => void;
  onDelete: (fileId: string) => void;
}

function FileDetailsModal({ file, isOpen, onClose, onRetry, onDelete }: FileDetailsModalProps) {
  if (!isOpen || !file) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'classifying': return 'text-purple-600 bg-purple-100';
      case 'uploading_to_obralia': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'uploading': return 'Subiendo archivo';
      case 'processing': return 'Procesando con IA';
      case 'classifying': return 'Clasificando documento';
      case 'uploading_to_obralia': return 'Subiendo a Obralia';
      case 'completed': return 'Procesamiento completado';
      case 'error': return 'Error en procesamiento';
      default: return status;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-8 w-8 mr-3" />
              <div>
                <h2 className="text-xl font-bold">Detalles del Documento</h2>
                <p className="text-blue-100">{file.name}</p>
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
          {/* Estado Actual */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-4">Estado Actual</h3>
            <div className="flex items-center justify-between mb-4">
              <span className={`px-3 py-2 rounded-full text-sm font-medium ${getStatusColor(file.status)}`}>
                {getStatusText(file.status)}
              </span>
              {file.status !== 'completed' && file.status !== 'error' && (
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-1" />
                  {file.progress}% completado
                </div>
              )}
            </div>

            {/* Progress Bar */}
            {file.status !== 'completed' && file.status !== 'error' && (
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${file.progress}%` }}
                />
              </div>
            )}

            {/* Error Message */}
            {file.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                  <span className="text-red-800 font-medium">Error:</span>
                </div>
                <p className="text-red-700 text-sm mt-1">{file.error}</p>
              </div>
            )}
          </div>

          {/* Información del Archivo */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-4">Información del Archivo</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Nombre:</span>
                <p className="font-medium text-gray-900">{file.name}</p>
              </div>
              <div>
                <span className="text-gray-600">Tamaño:</span>
                <p className="font-medium text-gray-900">{formatFileSize(file.size)}</p>
              </div>
              <div>
                <span className="text-gray-600">Tipo:</span>
                <p className="font-medium text-gray-900">{file.type}</p>
              </div>
              <div>
                <span className="text-gray-600">Subido:</span>
                <p className="font-medium text-gray-900">
                  {new Date(file.created_at).toLocaleString('es-ES')}
                </p>
              </div>
            </div>
          </div>

          {/* Clasificación IA */}
          {file.classification && (
            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                <Brain className="w-5 h-5 mr-2" />
                Clasificación con IA
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Tipo detectado:</span>
                  <p className="font-medium text-purple-900">{file.classification}</p>
                </div>
                <div>
                  <span className="text-gray-600">Confianza:</span>
                  <p className="font-medium text-purple-900">{file.confidence}%</p>
                </div>
              </div>
              <div className="w-full bg-purple-200 rounded-full h-2 mt-3">
                <div
                  className="bg-purple-600 h-2 rounded-full"
                  style={{ width: `${file.confidence}%` }}
                />
              </div>
            </div>
          )}

          {/* Estado de Seguridad */}
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Análisis de Seguridad
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Estado del escaneo:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                file.security_scan === 'safe' ? 'bg-green-100 text-green-800' :
                file.security_scan === 'threat_detected' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {file.security_scan === 'safe' ? 'Seguro' :
                 file.security_scan === 'threat_detected' ? 'Amenaza detectada' :
                 'Analizando'}
              </span>
            </div>
          </div>

          {/* Estado de Obralia */}
          <div className="bg-orange-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
              <Database className="w-5 h-5 mr-2" />
              Estado en Obralia
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Estado de subida:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                file.obralia_status === 'validated' ? 'bg-green-100 text-green-800' :
                file.obralia_status === 'uploaded' ? 'bg-blue-100 text-blue-800' :
                file.obralia_status === 'rejected' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {file.obralia_status === 'validated' ? 'Validado' :
                 file.obralia_status === 'uploaded' ? 'Subido' :
                 file.obralia_status === 'rejected' ? 'Rechazado' :
                 'Pendiente'}
              </span>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            {file.status === 'error' && (
              <button
                onClick={() => onRetry(file.id)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reintentar
              </button>
            )}
            <button
              onClick={() => onDelete(file.id)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
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

interface ProjectSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (projectId: string, companyId: string) => void;
  projects: Project[];
  companies: Company[];
}

function ProjectSelectorModal({ isOpen, onClose, onSelect, projects, companies }: ProjectSelectorModalProps) {
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Asignar a Proyecto</h2>
              <p className="text-green-100">Selecciona empresa y proyecto</p>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Empresa
            </label>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">Seleccionar empresa</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Proyecto
            </label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">Seleccionar proyecto</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name} - {project.company_name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                if (selectedProject && selectedCompany) {
                  onSelect(selectedProject, selectedCompany);
                  onClose();
                }
              }}
              disabled={!selectedProject || !selectedCompany}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
            >
              Asignar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface BulkActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFiles: string[];
  onBulkAction: (action: string) => void;
}

function BulkActionsModal({ isOpen, onClose, selectedFiles, onBulkAction }: BulkActionsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Acciones en Lote</h2>
              <p className="text-orange-100">{selectedFiles.length} archivos seleccionados</p>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <button
            onClick={() => onBulkAction('retry')}
            className="w-full flex items-center justify-center p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <RefreshCw className="w-5 h-5 text-blue-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-blue-800">Reintentar Procesamiento</p>
              <p className="text-sm text-blue-600">Volver a procesar archivos con error</p>
            </div>
          </button>

          <button
            onClick={() => onBulkAction('assign')}
            className="w-full flex items-center justify-center p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
          >
            <Building2 className="w-5 h-5 text-green-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-green-800">Asignar a Proyecto</p>
              <p className="text-sm text-green-600">Asignar archivos a un proyecto específico</p>
            </div>
          </button>

          <button
            onClick={() => onBulkAction('delete')}
            className="w-full flex items-center justify-center p-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          >
            <Trash2 className="w-5 h-5 text-red-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-red-800">Eliminar Archivos</p>
              <p className="text-sm text-red-600">Eliminar permanentemente los archivos</p>
            </div>
          </button>

          <div className="flex justify-end pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const DocumentUpload: React.FC = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [clientData, setClientData] = useState<any>(null);
  const [showObraliaModal, setShowObraliaModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [showFileDetails, setShowFileDetails] = useState(false);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkObraliaCredentials();
  }, []);

  const checkObraliaCredentials = async () => {
    try {
      setLoading(true);
      
      // Obtener el primer cliente disponible
      const allClients = await getAllClients();
      if (!allClients || allClients.length === 0) {
        throw new Error('No hay clientes en la base de datos');
      }
      
      const activeClient = allClients.find(c => c.subscription_status === 'active') || allClients[0];
      setClientData(activeClient);
      
      // Verificar si tiene credenciales configuradas
      if (!activeClient?.obralia_credentials?.configured) {
        setShowObraliaModal(true);
      }
      
    } catch (error) {
      console.error('Error checking Obralia credentials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleObraliaCredentialsSave = async (credentials: { username: string; password: string }) => {
    try {
      if (!clientData?.id) {
        throw new Error('No se encontró información del cliente');
      }

      // Guardar credenciales en la base de datos
      await updateClientObraliaCredentials(clientData.id, credentials);
      
      // Recargar datos del cliente para reflejar los cambios
      await checkObraliaCredentials();
      
      // Cerrar el modal
      setShowObraliaModal(false);
      
      // Mostrar mensaje de éxito
      alert('Credenciales de Obralia configuradas correctamente. Ya puedes subir documentos.');
    } catch (error) {
      console.error('Error saving Obralia credentials:', error);
      throw error;
    }
  };

  // Datos mock para desarrollo
  const projects: Project[] = [
    { id: '1', name: 'Edificio Residencial García', company_name: 'Construcciones García S.L.' },
    { id: '2', name: 'Reforma Oficinas López', company_name: 'Reformas Integrales López' }
  ];

  const companies: Company[] = [
    { id: '1', name: 'Construcciones García S.L.' },
    { id: '2', name: 'Reformas Integrales López' }
  ];

  const handleFileSelect = (selectedFiles: FileList) => {
    // Verificar credenciales antes de permitir subida
    if (!clientData?.obralia_credentials?.configured) {
      setShowObraliaModal(true);
      return;
    }

    const newFiles: UploadedFile[] = Array.from(selectedFiles).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'uploading',
      progress: 0,
      created_at: new Date().toISOString()
    }));

    setFiles(prev => [...prev, ...newFiles]);
    
    // Simulate upload process for each file
    newFiles.forEach(file => {
      simulateUpload(file.id);
    });
  };

  const simulateUpload = (fileId: string) => {
    const stages = [
      { status: 'uploading', duration: 2000 },
      { status: 'processing', duration: 3000 },
      { status: 'classifying', duration: 2000 },
      { status: 'uploading_to_obralia', duration: 1500 }
    ];

    let currentStage = 0;
    let progress = 0;

    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5;

      if (progress >= 100 || currentStage >= stages.length) {
        clearInterval(interval);
        
        // Final status
        const isSuccess = Math.random() > 0.15; // 85% success rate
        setFiles(prev => prev.map(file => {
          if (file.id === fileId) {
            return {
              ...file,
              progress: 100,
              status: isSuccess ? 'completed' : 'error',
              error: isSuccess ? undefined : 'Error al procesar el documento con IA',
              classification: isSuccess ? ['Certificado', 'Factura', 'Contrato', 'Plano'][Math.floor(Math.random() * 4)] : undefined,
              confidence: isSuccess ? Math.floor(Math.random() * 20) + 80 : undefined,
              obralia_status: isSuccess ? 'validated' : 'rejected',
              security_scan: isSuccess ? 'safe' : 'threat_detected'
            };
          }
          return file;
        }));
        return;
      }

      // Update progress and stage
      if (progress > (currentStage + 1) * 25 && currentStage < stages.length - 1) {
        currentStage++;
      }

      setFiles(prev => prev.map(file => {
        if (file.id === fileId) {
          return {
            ...file,
            progress: Math.min(progress, 100),
            status: stages[currentStage]?.status || 'processing'
          };
        }
        return file;
      }));
    }, 300);
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
    setSelectedFiles(prev => prev.filter(id => id !== fileId));
  };

  const retryFile = (fileId: string) => {
    setFiles(prev => prev.map(file => {
      if (file.id === fileId) {
        return {
          ...file,
          status: 'uploading',
          progress: 0,
          error: undefined
        };
      }
      return file;
    }));
    simulateUpload(fileId);
  };

  const handleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleBulkAction = (action: string) => {
    switch (action) {
      case 'retry':
        selectedFiles.forEach(fileId => {
          const file = files.find(f => f.id === fileId);
          if (file && file.status === 'error') {
            retryFile(fileId);
          }
        });
        break;
      case 'delete':
        if (confirm(`¿Eliminar ${selectedFiles.length} archivos seleccionados?`)) {
          selectedFiles.forEach(fileId => removeFile(fileId));
        }
        break;
      case 'assign':
        setShowProjectSelector(true);
        break;
    }
    setShowBulkActions(false);
  };

  const handleProjectAssignment = (projectId: string, companyId: string) => {
    setFiles(prev => prev.map(file => 
      selectedFiles.includes(file.id) 
        ? { ...file, project_id: projectId, company_id: companyId }
        : file
    ));
    setSelectedFiles([]);
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
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'classifying':
        return <Brain className="w-5 h-5 text-purple-500" />;
      case 'uploading_to_obralia':
        return <Database className="w-5 h-5 text-orange-500" />;
      default:
        return <Clock className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'uploading': return 'Subiendo...';
      case 'processing': return 'Procesando...';
      case 'classifying': return 'Clasificando con IA...';
      case 'uploading_to_obralia': return 'Subiendo a Obralia...';
      case 'completed': return 'Completado';
      case 'error': return 'Error';
      default: return 'Procesando...';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'classifying': return 'bg-purple-100 text-purple-800';
      case 'uploading_to_obralia': return 'bg-orange-100 text-orange-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || file.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: files.length,
    completed: files.filter(f => f.status === 'completed').length,
    processing: files.filter(f => f.status !== 'completed' && f.status !== 'error').length,
    errors: files.filter(f => f.status === 'error').length,
    totalSize: files.reduce((sum, f) => sum + f.size, 0)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subir Documentos</h1>
          <p className="text-gray-600">Gestión avanzada de carga de documentos con IA</p>
          <div className="mt-2 flex items-center space-x-2">
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              🔧 MODO DESARROLLO - Simulación completa
            </div>
            {clientData?.obralia_credentials?.configured ? (
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                ✅ Obralia Configurado
              </div>
            ) : (
              <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                ⚠ Obralia No Configurado
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {selectedFiles.length > 0 && (
            <button
              onClick={() => setShowBulkActions(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Acciones ({selectedFiles.length})
            </button>
          )}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Añadir Archivos
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completados</p>
              <p className="text-xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Procesando</p>
              <p className="text-xl font-bold text-blue-600">{stats.processing}</p>
            </div>
            <Clock className="w-6 h-6 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Errores</p>
              <p className="text-xl font-bold text-red-600">{stats.errors}</p>
            </div>
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tamaño Total</p>
              <p className="text-xl font-bold text-gray-900">{formatFileSize(stats.totalSize)}</p>
            </div>
            <Upload className="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
          isDragOver
            ? 'border-green-400 bg-green-50 scale-105'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          if (e.dataTransfer.files) {
            handleFileSelect(e.dataTransfer.files);
          }
        }}
      >
        <div className="space-y-4">
          <Upload className="w-16 h-16 text-gray-400 mx-auto" />
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Arrastra archivos aquí o haz clic para seleccionar
            </h3>
            <p className="text-gray-600 mb-4">
              Procesamiento automático con IA • Clasificación inteligente • Integración con Obralia
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 text-sm text-gray-500">
            <span className="bg-gray-100 px-2 py-1 rounded">PDF</span>
            <span className="bg-gray-100 px-2 py-1 rounded">DOC/DOCX</span>
            <span className="bg-gray-100 px-2 py-1 rounded">XLS/XLSX</span>
            <span className="bg-gray-100 px-2 py-1 rounded">JPG/PNG</span>
            <span className="bg-gray-100 px-2 py-1 rounded">TXT</span>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Seleccionar Archivos
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"
          onChange={(e) => {
            if (e.target.files) {
              handleFileSelect(e.target.files);
            }
          }}
        />
      </div>

      {/* Filters */}
      {files.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar archivos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">Todos los estados</option>
                <option value="uploading">Subiendo</option>
                <option value="processing">Procesando</option>
                <option value="classifying">Clasificando</option>
                <option value="uploading_to_obralia">Subiendo a Obralia</option>
                <option value="completed">Completado</option>
                <option value="error">Error</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* File List */}
      {filteredFiles.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Archivos Subidos ({filteredFiles.length})
              </h3>
              <div className="flex items-center space-x-2">
                <label className="flex items-center text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={selectedFiles.length === filteredFiles.length && filteredFiles.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedFiles(filteredFiles.map(f => f.id));
                      } else {
                        setSelectedFiles([]);
                      }
                    }}
                    className="mr-2"
                  />
                  Seleccionar todos
                </label>
              </div>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {filteredFiles.map((file) => (
              <div key={file.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedFiles.includes(file.id)}
                    onChange={() => handleFileSelection(file.id)}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(file.status)}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{file.name}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>{formatFileSize(file.size)}</span>
                            <span>{file.type}</span>
                            {file.classification && (
                              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                                {file.classification} ({file.confidence}%)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(file.status)}`}>
                          {getStatusText(file.status)}
                        </span>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => {
                              setSelectedFile(file);
                              setShowFileDetails(true);
                            }}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {file.status === 'completed' && (
                            <button className="p-1 text-gray-400 hover:text-green-600 transition-colors">
                              <Download className="w-4 h-4" />
                            </button>
                          )}
                          {file.status === 'error' && (
                            <button
                              onClick={() => retryFile(file.id)}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => removeFile(file.id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    {file.status !== 'completed' && file.status !== 'error' && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>{getStatusText(file.status)}</span>
                          <span>{Math.round(file.progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${file.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Error Message */}
                    {file.error && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                        {file.error}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {files.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <Upload className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay documentos subidos
          </h3>
          <p className="text-gray-600 mb-6">
            Comienza subiendo tu primer documento para procesarlo con IA
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Subir Primer Documento
          </button>
        </div>
      )}

      {/* Processing Instructions */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
          <Brain className="w-5 h-5 text-purple-600 mr-2" />
          Procesamiento Inteligente
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-blue-600 font-bold">1</span>
            </div>
            <div>
              <p className="font-medium text-gray-800">Subida Segura</p>
              <p className="text-gray-600">Encriptación SSL</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-purple-600 font-bold">2</span>
            </div>
            <div>
              <p className="font-medium text-gray-800">Análisis IA</p>
              <p className="text-gray-600">Clasificación automática</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-green-600 font-bold">3</span>
            </div>
            <div>
              <p className="font-medium text-gray-800">Escaneo Seguridad</p>
              <p className="text-gray-600">Detección de amenazas</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-orange-600 font-bold">4</span>
            </div>
            <div>
              <p className="font-medium text-gray-800">Integración Obralia</p>
              <p className="text-gray-600">Subida automática</p>
            </div>
          </div>
        </div>
      </div>

      {/* Obralia Credentials Modal */}
      <ObraliaCredentialsModal
        isOpen={showObraliaModal}
        onSave={handleObraliaCredentialsSave}
        clientName={clientData?.company_name || 'Cliente'}
      />

      {/* Modals */}
      <FileDetailsModal
        file={selectedFile}
        isOpen={showFileDetails}
        onClose={() => setShowFileDetails(false)}
        onRetry={retryFile}
        onDelete={removeFile}
      />

      <ProjectSelectorModal
        isOpen={showProjectSelector}
        onClose={() => setShowProjectSelector(false)}
        onSelect={handleProjectAssignment}
        projects={projects}
        companies={companies}
      />

      <BulkActionsModal
        isOpen={showBulkActions}
        onClose={() => setShowBulkActions(false)}
        selectedFiles={selectedFiles}
        onBulkAction={handleBulkAction}
      />
    </div>
  );
};

export default DocumentUpload;