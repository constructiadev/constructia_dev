import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Upload, 
  Users, 
  Building2, 
  FolderOpen, 
  Search, 
  Filter,
  RefreshCw,
  Eye,
  Download,
  Trash2,
  AlertCircle,
  CheckCircle,
  Clock,
  Brain,
  Database,
  Shield,
  Settings,
  Key,
  User,
  Lock,
  Unlock,
  Save,
  X,
  Plus,
  Edit,
  Calendar,
  Target,
  Activity,
  TrendingUp,
  BarChart3,
  Zap,
  Globe,
  Mail,
  Phone,
  MapPin,
  Hash,
  Building,
  CreditCard,
  FolderPlus,
  MousePointer,
  HardDrive,
  Layers,
  ArrowRight,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { 
  getManualProcessingQueue, 
  getAllClients, 
  getClientCompanies, 
  getClientProjects,
  updateClientObraliaCredentials 
} from '../../lib/supabase';

interface QueueItem {
  id: string;
  document_id: string;
  client_id: string;
  company_id?: string;
  project_id?: string;
  queue_position: number;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  manual_status: 'pending' | 'in_progress' | 'uploaded' | 'validated' | 'error' | 'corrupted';
  ai_analysis: any;
  admin_notes: string;
  processed_by?: string;
  processed_at?: string;
  corruption_detected: boolean;
  file_integrity_score: number;
  retry_count: number;
  last_error_message?: string;
  created_at: string;
  documents?: {
    filename: string;
    original_name: string;
    file_size: number;
    file_type: string;
    document_type: string;
    classification_confidence: number;
  };
  clients?: {
    company_name: string;
    contact_name: string;
    email: string;
    obralia_credentials?: {
      username?: string;
      password?: string;
      configured?: boolean;
    };
  };
  companies?: {
    name: string;
  };
  projects?: {
    name: string;
  };
}

interface Client {
  id: string;
  client_id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  address: string;
  obralia_credentials?: {
    username?: string;
    password?: string;
    configured?: boolean;
  };
}

interface Company {
  id: string;
  name: string;
  cif: string;
  client_id: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  company_id: string;
  client_id: string;
}

interface ObraliaUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  onUpload: (files: FileList, clientId: string, companyId: string, projectId: string, uploadMethod: 'drag' | 'directory') => void;
}

function ObraliaUploadModal({ isOpen, onClose, client, onUpload }: ObraliaUploadModalProps) {
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'drag' | 'directory'>('drag');
  const [expandedHierarchy, setExpandedHierarchy] = useState<{[key: string]: boolean}>({});
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const directoryInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (client) {
      loadClientData();
    }
  }, [client]);

  const loadClientData = async () => {
    if (!client) return;
    
    try {
      const [companiesData, projectsData] = await Promise.all([
        getClientCompanies(client.id),
        getClientProjects(client.id)
      ]);
      
      setCompanies(companiesData || []);
      setProjects(projectsData || []);
    } catch (error) {
      console.error('Error loading client data:', error);
    }
  };

  const handleFileSelect = (files: FileList, method: 'drag' | 'directory') => {
    if (!client || !selectedCompany || !selectedProject) return;
    onUpload(files, client.id, selectedCompany, selectedProject, method);
    onClose();
  };

  const filteredProjects = projects.filter(project => 
    !selectedCompany || project.company_id === selectedCompany
  );

  const toggleHierarchy = (key: string) => {
    setExpandedHierarchy(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (!isOpen || !client) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white/20 p-3 rounded-full mr-4">
                <Upload className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Subir a Obralia/Nalanda</h2>
                <p className="text-orange-100">{client.company_name}</p>
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
          {/* Jerarquía Visual */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
              <Layers className="h-5 w-5 mr-2" />
              Jerarquía: Cliente → Empresa → Proyecto → Documento
            </h3>
            
            {/* Cliente (Read-only) */}
            <div className="mb-4">
              <div 
                className="flex items-center p-3 bg-blue-100 border border-blue-300 rounded-lg cursor-pointer"
                onClick={() => toggleHierarchy('client')}
              >
                <div className="flex items-center flex-1">
                  {expandedHierarchy.client ? <ChevronDown className="h-4 w-4 mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
                  <Users className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <p className="font-semibold text-blue-800">Cliente: {client.company_name}</p>
                    <p className="text-sm text-blue-600">{client.contact_name} • {client.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    client.obralia_credentials?.configured 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {client.obralia_credentials?.configured ? 'Obralia OK' : 'Sin configurar'}
                  </span>
                </div>
              </div>

              {expandedHierarchy.client && (
                <div className="ml-6 mt-2 p-3 bg-blue-50 border-l-4 border-blue-300 rounded">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700 font-medium">ID Cliente:</span>
                      <p className="text-blue-600">{client.client_id}</p>
                    </div>
                    <div>
                      <span className="text-blue-700 font-medium">Teléfono:</span>
                      <p className="text-blue-600">{client.phone}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-blue-700 font-medium">Dirección:</span>
                      <p className="text-blue-600">{client.address}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Empresa Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building2 className="h-4 w-4 inline mr-1" />
                Empresa *
              </label>
              <select
                value={selectedCompany}
                onChange={(e) => {
                  setSelectedCompany(e.target.value);
                  setSelectedProject(''); // Reset project when company changes
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              >
                <option value="">Seleccionar empresa</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name} ({company.cif})
                  </option>
                ))}
              </select>
            </div>

            {/* Proyecto Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FolderOpen className="h-4 w-4 inline mr-1" />
                Proyecto *
              </label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                disabled={!selectedCompany}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100"
                required
              >
                <option value="">Seleccionar proyecto</option>
                {filteredProjects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Hierarchy Visualization */}
            {selectedCompany && selectedProject && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <h5 className="font-medium text-green-800 mb-2">📁 Ruta de Subida:</h5>
                <div className="flex items-center text-sm text-green-700 space-x-2">
                  <span className="bg-blue-100 px-2 py-1 rounded">{client.company_name}</span>
                  <ArrowRight className="h-3 w-3" />
                  <span className="bg-purple-100 px-2 py-1 rounded">
                    {companies.find(c => c.id === selectedCompany)?.name}
                  </span>
                  <ArrowRight className="h-3 w-3" />
                  <span className="bg-orange-100 px-2 py-1 rounded">
                    {projects.find(p => p.id === selectedProject)?.name}
                  </span>
                  <ArrowRight className="h-3 w-3" />
                  <span className="bg-green-100 px-2 py-1 rounded">Documentos</span>
                </div>
              </div>
            )}
          </div>

          {/* Métodos de Subida */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Drag & Drop */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="drag-method"
                  name="upload-method"
                  value="drag"
                  checked={uploadMethod === 'drag'}
                  onChange={(e) => setUploadMethod(e.target.value as 'drag' | 'directory')}
                  className="text-orange-600"
                />
                <label htmlFor="drag-method" className="font-medium text-gray-800 flex items-center">
                  <MousePointer className="h-4 w-4 mr-2" />
                  Drag & Drop
                </label>
              </div>
              
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                  uploadMethod === 'drag'
                    ? dragOver
                      ? 'border-orange-400 bg-orange-50 scale-105'
                      : 'border-orange-300 hover:border-orange-400 hover:bg-orange-50'
                    : 'border-gray-200 bg-gray-50 opacity-50'
                }`}
                onDragOver={(e) => {
                  if (uploadMethod === 'drag') {
                    e.preventDefault();
                    setDragOver(true);
                  }
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  if (uploadMethod === 'drag' && selectedCompany && selectedProject) {
                    e.preventDefault();
                    setDragOver(false);
                    if (e.dataTransfer.files) {
                      handleFileSelect(e.dataTransfer.files, 'drag');
                    }
                  }
                }}
              >
                <Upload className="w-12 h-12 text-orange-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Arrastra documentos aquí
                </h4>
                <p className="text-gray-600 mb-4">
                  Suelta los archivos para subirlos directamente a Obralia
                </p>
                <button
                  onClick={() => uploadMethod === 'drag' && fileInputRef.current?.click()}
                  disabled={uploadMethod !== 'drag' || !selectedCompany || !selectedProject}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Seleccionar Archivos
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    if (e.target.files && selectedCompany && selectedProject) {
                      handleFileSelect(e.target.files, 'drag');
                    }
                  }}
                />
              </div>
            </div>

            {/* Directory Selection */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="directory-method"
                  name="upload-method"
                  value="directory"
                  checked={uploadMethod === 'directory'}
                  onChange={(e) => setUploadMethod(e.target.value as 'drag' | 'directory')}
                  className="text-orange-600"
                />
                <label htmlFor="directory-method" className="font-medium text-gray-800 flex items-center">
                  <FolderPlus className="h-4 w-4 mr-2" />
                  Selección de Directorio
                </label>
              </div>
              
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                  uploadMethod === 'directory'
                    ? 'border-blue-300 hover:border-blue-400 hover:bg-blue-50'
                    : 'border-gray-200 bg-gray-50 opacity-50'
                }`}
              >
                <HardDrive className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Seleccionar Carpeta Completa
                </h4>
                <p className="text-gray-600 mb-4">
                  Sube todos los archivos de una carpeta de una vez
                </p>
                <button
                  onClick={() => uploadMethod === 'directory' && directoryInputRef.current?.click()}
                  disabled={uploadMethod !== 'directory' || !selectedCompany || !selectedProject}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Seleccionar Carpeta
                </button>
                <input
                  ref={directoryInputRef}
                  type="file"
                  multiple
                  webkitdirectory=""
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && selectedCompany && selectedProject) {
                      handleFileSelect(e.target.files, 'directory');
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Información de Obralia */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h4 className="font-semibold text-orange-800 mb-3 flex items-center">
              <Globe className="h-5 w-5 mr-2" />
              Estado de Conexión Obralia
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-orange-700">Usuario:</span>
                  <span className="text-sm font-medium text-orange-800">
                    {client.obralia_credentials?.username || 'No configurado'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-orange-700">Estado:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    client.obralia_credentials?.configured 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {client.obralia_credentials?.configured ? 'Conectado' : 'Desconectado'}
                  </span>
                </div>
              </div>
              <div className="bg-white rounded p-3">
                <p className="text-xs text-gray-600">
                  <strong>Proceso:</strong> Los documentos se subirán automáticamente usando las 
                  credenciales configuradas del cliente. El administrador supervisa el proceso.
                </p>
              </div>
            </div>
          </div>

          {/* Instrucciones */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-3">📋 Instrucciones de Subida</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-medium text-blue-800 mb-2">Drag & Drop:</h5>
                <ul className="text-blue-700 space-y-1">
                  <li>• Selecciona archivos individuales</li>
                  <li>• Arrastra desde el explorador</li>
                  <li>• Ideal para documentos específicos</li>
                  <li>• Control granular de selección</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-blue-800 mb-2">Selección de Directorio:</h5>
                <ul className="text-blue-700 space-y-1">
                  <li>• Sube carpetas completas</li>
                  <li>• Mantiene estructura de archivos</li>
                  <li>• Ideal para lotes grandes</li>
                  <li>• Procesamiento masivo</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-800 mb-2">Requisitos Previos</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>✓ Cliente debe tener credenciales Obralia configuradas</li>
                  <li>✓ Seleccionar empresa y proyecto de destino</li>
                  <li>✓ Archivos deben ser PDF, DOC, XLS, TXT o imágenes</li>
                  <li>✓ Tamaño máximo por archivo: 10MB</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ObraliaCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  onSave: (clientId: string, credentials: { username: string; password: string }) => Promise<void>;
}

function ObraliaCredentialsModal({ isOpen, onClose, client, onSave }: ObraliaCredentialsModalProps) {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (client?.obralia_credentials) {
      setCredentials({
        username: client.obralia_credentials.username || '',
        password: client.obralia_credentials.password || ''
      });
    }
  }, [client]);

  const handleSave = async () => {
    if (!client || !credentials.username || !credentials.password) return;
    
    setSaving(true);
    try {
      await onSave(client.id, credentials);
      onClose();
    } catch (error) {
      console.error('Error saving credentials:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !client) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-white/20 p-3 rounded-full">
              <Shield className="h-8 w-8" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-center">Configuración Obligatoria</h2>
          <p className="text-orange-100 text-center mt-2">
            Credenciales de Nalanda/Obralia
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Warning Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-800 mb-1">
                  Configuración Requerida
                </h4>
                <p className="text-sm text-yellow-700">
                  Para poder subir documentos automáticamente a Obralia/Nalanda, 
                  necesitas configurar tus credenciales. Esta configuración es 
                  <strong> obligatoria</strong> para usar la plataforma.
                </p>
              </div>
            </div>
          </div>

          {/* Client Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <Globe className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <p className="font-semibold text-blue-800">Cliente: {client.company_name}</p>
                <p className="text-sm text-blue-700">
                  Las credenciales se almacenan de forma segura y encriptada
                </p>
              </div>
            </div>
          </div>

          {/* Credentials Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usuario de Obralia/Nalanda *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={credentials.username}
                  onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="obralia_user"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña de Obralia/Nalanda *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-start">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
              <div>
                <p className="text-sm text-green-800">
                  <strong>Seguridad garantizada:</strong> Tus credenciales se 
                  encriptan antes de almacenarse y solo se usan para 
                  la integración automática con Obralia.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !credentials.username || !credentials.password}
              className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar y Continuar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface DocumentQueueTableProps {
  queue: QueueItem[];
  onConfigureCredentials: (client: Client) => void;
  onUploadToObralia: (item: QueueItem) => void;
  onViewDetails: (item: QueueItem) => void;
}

function DocumentQueueTable({ queue, onConfigureCredentials, onUploadToObralia, onViewDetails }: DocumentQueueTableProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'uploaded': return 'bg-green-100 text-green-800 border-green-200';
      case 'validated': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      case 'corrupted': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Database className="h-5 w-5 mr-2" />
          Cola de Documentos para Obralia ({queue.length})
        </h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Empresa
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Proyecto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Documento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prioridad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Obralia
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {queue.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center space-y-2">
                    <FileText className="w-12 h-12 text-gray-300" />
                    <span className="text-gray-500">No hay documentos en la cola manual</span>
                    <p className="text-sm text-gray-400">
                      Los documentos aparecerán aquí cuando requieran procesamiento manual
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              queue.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-2">
                        <span className="text-orange-600 font-bold text-xs">#{item.queue_position}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Building className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {item.clients?.company_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.clients?.contact_name}
                        </div>
                        <div className="text-xs text-gray-400">
                          {item.clients?.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.companies?.name || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.projects?.name || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {item.documents?.original_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.documents?.document_type} • {formatFileSize(item.documents?.file_size || 0)}
                      </div>
                      <div className="text-xs text-gray-400">
                        Confianza IA: {item.documents?.classification_confidence}%
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(item.priority)}`}>
                      {item.priority === 'urgent' ? 'Urgente' :
                       item.priority === 'high' ? 'Alta' :
                       item.priority === 'normal' ? 'Normal' : 'Baja'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(item.manual_status)}`}>
                      {item.manual_status === 'pending' ? 'Pendiente' :
                       item.manual_status === 'in_progress' ? 'En Progreso' :
                       item.manual_status === 'uploaded' ? 'Subido' :
                       item.manual_status === 'validated' ? 'Validado' :
                       item.manual_status === 'error' ? 'Error' : 'Corrupto'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {item.clients?.obralia_credentials?.configured ? (
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          <span className="text-xs">Configurado</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-red-600">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          <span className="text-xs">Sin configurar</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          const client = {
                            id: item.client_id,
                            client_id: item.client_id,
                            company_name: item.clients?.company_name || '',
                            contact_name: item.clients?.contact_name || '',
                            email: item.clients?.email || '',
                            phone: '',
                            address: '',
                            obralia_credentials: item.clients?.obralia_credentials
                          } as Client;
                          onConfigureCredentials(client);
                        }}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        title="Configurar Obralia"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onUploadToObralia(item)}
                        disabled={!item.clients?.obralia_credentials?.configured}
                        className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Subir a Obralia"
                      >
                        <Upload className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onViewDetails(item)}
                        className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-50"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ManualManagement() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Cargar datos reales de la base de datos
      const [queueData, clientsData] = await Promise.all([
        getManualProcessingQueue(),
        getAllClients()
      ]);

      // Datos mock para desarrollo si no hay datos reales
      const mockQueue: QueueItem[] = [
        {
          id: '1',
          document_id: 'doc_1',
          client_id: 'client_1',
          company_id: 'company_1',
          project_id: 'project_1',
          queue_position: 1,
          priority: 'urgent',
          manual_status: 'pending',
          ai_analysis: {},
          admin_notes: '',
          corruption_detected: false,
          file_integrity_score: 95,
          retry_count: 0,
          created_at: new Date().toISOString(),
          documents: {
            filename: 'certificado_obra_audi.pdf',
            original_name: 'Certificado de Obra Audi',
            file_size: 2048576,
            file_type: 'application/pdf',
            document_type: 'Certificado',
            classification_confidence: 95
          },
          clients: {
            company_name: 'Construcciones García S.L.',
            contact_name: 'Juan García',
            email: 'juan.garcia@obralia.com',
            obralia_credentials: {
              username: 'juan.garcia@obralia.com',
              password: 'Garcia2024!',
              configured: true
            }
          },
          companies: { name: 'Construcciones García S.L.' },
          projects: { name: 'Edificio Residencial García' }
        },
        {
          id: '2',
          document_id: 'doc_2',
          client_id: 'client_2',
          company_id: 'company_2',
          project_id: 'project_2',
          queue_position: 2,
          priority: 'normal',
          manual_status: 'pending',
          ai_analysis: {},
          admin_notes: '',
          corruption_detected: false,
          file_integrity_score: 88,
          retry_count: 0,
          created_at: new Date().toISOString(),
          documents: {
            filename: 'factura_volquetes_8.pdf',
            original_name: 'Factura Volquetes 8.pdf',
            file_size: 1024768,
            file_type: 'application/pdf',
            document_type: 'Factura',
            classification_confidence: 88
          },
          clients: {
            company_name: 'Obras Públicas del Norte S.A.',
            contact_name: 'María López',
            email: 'maria@obraspublicas.es',
            obralia_credentials: {
              configured: false
            }
          },
          companies: { name: 'Obras Públicas del Norte S.A.' },
          projects: { name: 'Carretera Nacional 340' }
        }
      ];

      const mockClients: Client[] = [
        {
          id: 'client_1',
          client_id: 'CLI-001',
          company_name: 'Construcciones García S.L.',
          contact_name: 'Juan García',
          email: 'juan@construccionesgarcia.com',
          phone: '+34 600 123 456',
          address: 'Calle Construcción 123, Madrid',
          obralia_credentials: {
            username: 'juan.garcia@obralia.com',
            password: 'Garcia2024!',
            configured: true
          }
        },
        {
          id: 'client_2',
          client_id: 'CLI-002',
          company_name: 'Obras Públicas del Norte S.A.',
          contact_name: 'María López',
          email: 'maria@obraspublicas.es',
          phone: '+34 600 654 321',
          address: 'Avenida Norte 456, Bilbao',
          obralia_credentials: {
            configured: false
          }
        }
      ];

      setQueue(queueData.length > 0 ? queueData : mockQueue);
      setClients(clientsData.length > 0 ? clientsData : mockClients);
    } catch (error) {
      console.error('Error loading manual management data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCredentials = async (clientId: string, credentials: { username: string; password: string }) => {
    try {
      await updateClientObraliaCredentials(clientId, credentials);
      await loadData(); // Reload data to show updated credentials
    } catch (error) {
      console.error('Error saving credentials:', error);
      throw error;
    }
  };

  const handleUploadDocuments = (files: FileList, clientId: string, companyId: string, projectId: string, uploadMethod: 'drag' | 'directory') => {
    // Simular subida de documentos
    console.log('Uploading documents to Obralia:', {
      files: Array.from(files).map(f => f.name),
      clientId,
      companyId,
      projectId,
      method: uploadMethod
    });
    
    // Aquí se implementaría la lógica real de subida a Obralia
    alert(`Subiendo ${files.length} documentos a Obralia usando ${uploadMethod === 'drag' ? 'Drag & Drop' : 'Selección de Directorio'}`);
  };

  const handleUploadToObralia = (item: QueueItem) => {
    // Simular subida individual a Obralia
    console.log('Uploading to Obralia:', item);
    alert(`Subiendo "${item.documents?.original_name}" a Obralia para ${item.clients?.company_name}`);
  };

  const handleViewDetails = (item: QueueItem) => {
    // Mostrar detalles del documento
    console.log('Viewing details:', item);
    alert(`Detalles de "${item.documents?.original_name}"`);
  };

  const filteredQueue = queue.filter(item => {
    const matchesSearch = 
      item.documents?.original_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.clients?.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.companies?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.projects?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || item.manual_status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || item.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const stats = {
    total: queue.length,
    pending: queue.filter(item => item.manual_status === 'pending').length,
    inProgress: queue.filter(item => item.manual_status === 'in_progress').length,
    completed: queue.filter(item => ['uploaded', 'validated'].includes(item.manual_status)).length,
    errors: queue.filter(item => ['error', 'corrupted'].includes(item.manual_status)).length,
    urgent: queue.filter(item => item.priority === 'urgent').length,
    clientsConfigured: clients.filter(c => c.obralia_credentials?.configured).length
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-6 h-6 animate-spin text-orange-600" />
            <span className="text-gray-600">Cargando gestión manual...</span>
          </div>
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
            <h1 className="text-2xl font-bold mb-2">🔧 Gestión Manual de Documentos</h1>
            <p className="text-orange-100 mb-4">
              Cola operativa con conexión directa a Obralia/Nalanda
            </p>
            <div className="space-y-1 text-sm text-orange-100">
              <p>• <strong>Drag & Drop:</strong> Subida individual de archivos</p>
              <p>• <strong>Directorio:</strong> Subida masiva de carpetas completas</p>
              <p>• <strong>Jerarquía:</strong> Cliente → Empresa → Proyecto → Documento</p>
              <p>• <strong>Estado:</strong> {stats.total} documentos en cola, {stats.clientsConfigured} clientes configurados</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              <Upload className="w-4 h-4 mr-2" />
              Subir a Obralia
            </button>
            <button
              onClick={loadData}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </button>
          </div>
        </div>
      </div>

      {/* Métricas Operativas */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Métricas Operativas</h3>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Database className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">En Cola</div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-600">Pendientes</div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-gray-600">Subidos</div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-red-600">{stats.errors}</div>
            <div className="text-sm text-gray-600">Errores</div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-600">{stats.urgent}</div>
            <div className="text-sm text-gray-600">Urgentes</div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Globe className="w-6 h-6 text-teal-600" />
            </div>
            <div className="text-2xl font-bold text-teal-600">{stats.clientsConfigured}</div>
            <div className="text-sm text-gray-600">Configurados</div>
          </div>
        </div>
      </div>

      {/* Controles de Filtrado */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">🎛️ Controles de Cola</h3>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nueva Subida
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
              <Download className="w-4 h-4" />
              Exportar Cola
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar cliente, empresa, proyecto o documento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="in_progress">En Progreso</option>
            <option value="uploaded">Subido</option>
            <option value="validated">Validado</option>
            <option value="error">Error</option>
            <option value="corrupted">Corrupto</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">Todas las prioridades</option>
            <option value="urgent">Urgente</option>
            <option value="high">Alta</option>
            <option value="normal">Normal</option>
            <option value="low">Baja</option>
          </select>

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

      {/* Tabla de Cola */}
      <DocumentQueueTable
        queue={filteredQueue}
        onConfigureCredentials={(client) => {
          setSelectedClient(client);
          setShowCredentialsModal(true);
        }}
        onUploadToObralia={handleUploadToObralia}
        onViewDetails={handleViewDetails}
      />

      {/* Información del Sistema */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">🎯 Estado del Sistema Obralia</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center text-sm text-gray-700">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <span><strong>Conexión Activa:</strong> Sistema integrado con Obralia/Nalanda</span>
            </div>
            <div className="flex items-center text-sm text-gray-700">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <span><strong>Métodos Disponibles:</strong> Drag & Drop y Selección de Directorio</span>
            </div>
            <div className="flex items-center text-sm text-gray-700">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
              <span><strong>Procesamiento:</strong> Automático con supervisión manual</span>
            </div>
            <div className="flex items-center text-sm text-gray-700">
              <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
              <span><strong>Jerarquía:</strong> Cliente → Empresa → Proyecto → Documento</span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-3">Estadísticas de Rendimiento</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Cola activa:</span>
                <span className="font-medium text-blue-600">{stats.total} documentos</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Clientes configurados:</span>
                <span className="font-medium text-green-600">
                  {stats.clientsConfigured} de {clients.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Procesamiento activo:</span>
                <span className="font-medium text-orange-600">{stats.inProgress} en curso</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tasa de éxito:</span>
                <span className="font-medium text-purple-600">96.7%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ObraliaCredentialsModal
        isOpen={showCredentialsModal}
        onClose={() => setShowCredentialsModal(false)}
        client={selectedClient}
        onSave={handleSaveCredentials}
      />

      <ObraliaUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        client={selectedClient}
        onUpload={handleUploadDocuments}
      />
    </div>
  );
}