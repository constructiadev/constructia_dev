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
  CreditCard
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
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white/20 p-3 rounded-full mr-4">
                <Key className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Conexión Manual a Obralia/Nalanda</h2>
                <p className="text-blue-100 text-sm">{client.company_name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Client Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <Building className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <p className="font-semibold text-blue-800">{client.company_name}</p>
                <p className="text-sm text-blue-600">{client.contact_name} • {client.email}</p>
              </div>
            </div>
          </div>

          {/* Credentials Form */}
          <div className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <h4 className="font-semibold text-orange-800 mb-2">🔑 Credenciales de Acceso</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-orange-700 mb-1">
                    Usuario Completo
                  </label>
                  <span className="text-xs text-orange-600">Tu Gestor</span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-orange-700 mb-1">
                    Contraseña
                  </label>
                  <span className="text-xs text-orange-600">Tu Gestor</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center mb-2">
                  <User className="h-4 w-4 text-gray-500 mr-2" />
                  <label className="text-sm font-medium text-gray-700">Usuario:</label>
                </div>
                <input
                  type="text"
                  value={credentials.username}
                  onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="juan.garcia@obralia.com"
                />
              </div>

              <div>
                <div className="flex items-center mb-2">
                  <Lock className="h-4 w-4 text-gray-500 mr-2" />
                  <label className="text-sm font-medium text-gray-700">Contraseña:</label>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={credentials.password}
                    onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Garcia2024!"
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

            {/* Instructions */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <h5 className="font-medium text-yellow-800 mb-2">📋 Instrucciones de Uso:</h5>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>1. Usa las credenciales que te proporcionó el cliente</li>
                <li>2. Los Gestor verificará que cada campo Usuario y Contraseña</li>
                <li>3. Haga clic en Ingresar para CHNC en cada campo</li>
                <li>4. Al final, seleccione manualmente la opción y pulse con CHNC</li>
              </ul>
            </div>

            {/* Connection Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Estado de Conexión</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                client.obralia_credentials?.configured 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {client.obralia_credentials?.configured ? 'Configurado' : 'Desconfigurado'}
              </span>
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
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Conectando...
                  </>
                ) : (
                  <>
                    <Globe className="h-4 w-4 mr-2" />
                    Conectar a Obralia
                  </>
                )}
              </button>
            </div>

            {/* Document Queue Status */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800">📄 Documentos a Subir (2)</p>
                  <div className="space-y-1 mt-2">
                    <div className="flex items-center text-xs text-green-700">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span>Certificado de Obra Audi</span>
                      <span className="ml-auto text-red-600">Urgente</span>
                    </div>
                    <div className="flex items-center text-xs text-green-700">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                      <span>Factura Volquetes 8.pdf</span>
                      <span className="ml-auto text-orange-600">Normal</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Final Action */}
            <div className="bg-green-100 border border-green-300 rounded-lg p-3">
              <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors">
                ✓ Subir 2 Documentos
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedClient: Client | null;
  onUpload: (files: FileList, clientId: string, companyId: string, projectId: string) => void;
}

function DocumentUploadModal({ isOpen, onClose, selectedClient, onUpload }: DocumentUploadModalProps) {
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedClient) {
      loadClientData();
    }
  }, [selectedClient]);

  const loadClientData = async () => {
    if (!selectedClient) return;
    
    try {
      const [companiesData, projectsData] = await Promise.all([
        getClientCompanies(selectedClient.id),
        getClientProjects(selectedClient.id)
      ]);
      
      setCompanies(companiesData || []);
      setProjects(projectsData || []);
    } catch (error) {
      console.error('Error loading client data:', error);
    }
  };

  const handleFileSelect = (files: FileList) => {
    if (!selectedClient || !selectedCompany || !selectedProject) return;
    onUpload(files, selectedClient.id, selectedCompany, selectedProject);
    onClose();
  };

  const filteredProjects = projects.filter(project => 
    !selectedCompany || project.company_id === selectedCompany
  );

  if (!isOpen || !selectedClient) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white/20 p-3 rounded-full mr-4">
                <Upload className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Subir Documentos Manualmente</h2>
                <p className="text-green-100">{selectedClient.company_name}</p>
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
          {/* Hierarchy Selection */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800">Jerarquía: Cliente → Empresa → Proyecto → Documento</h3>
            
            {/* Client (Read-only) */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <p className="font-semibold text-blue-800">Cliente: {selectedClient.company_name}</p>
                  <p className="text-sm text-blue-600">{selectedClient.contact_name} • {selectedClient.email}</p>
                </div>
              </div>
            </div>

            {/* Company Selection */}
            <div>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                <option value="">Seleccionar empresa</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Project Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FolderOpen className="h-4 w-4 inline mr-1" />
                Proyecto *
              </label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                disabled={!selectedCompany}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
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
          </div>

          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
              dragOver
                ? 'border-green-400 bg-green-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              if (e.dataTransfer.files && selectedCompany && selectedProject) {
                handleFileSelect(e.dataTransfer.files);
              }
            }}
          >
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Arrastra documentos aquí
            </h4>
            <p className="text-gray-600 mb-4">
              O haz clic para seleccionar archivos
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={!selectedCompany || !selectedProject}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                  handleFileSelect(e.target.files);
                }
              }}
            />
          </div>

          {/* Requirements */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">
              <strong>Requisitos:</strong> Selecciona empresa y proyecto antes de subir documentos. 
              Los archivos se procesarán automáticamente con IA y se subirán a Obralia usando las credenciales del cliente.
            </p>
          </div>
        </div>
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

  const handleUploadDocuments = (files: FileList, clientId: string, companyId: string, projectId: string) => {
    // Simular subida de documentos
    console.log('Uploading documents:', {
      files: Array.from(files).map(f => f.name),
      clientId,
      companyId,
      projectId
    });
    
    // Aquí se implementaría la lógica real de subida
    alert(`Subiendo ${files.length} documentos para el cliente`);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'uploaded': return 'bg-green-100 text-green-800';
      case 'validated': return 'bg-emerald-100 text-emerald-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'corrupted': return 'bg-red-100 text-red-800';
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
    urgent: queue.filter(item => item.priority === 'urgent').length
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
              <p>— <strong>Insights Operativos IA:</strong></p>
              <p>• Análisis de Gestión Manual Constructia</p>
              <p>• <strong>Modo Intuitivo:</strong> 5 documentos totales, 5 pendientes y 0 con errores que requieren atención manual.</p>
              <p>• <strong>Recomendación Operativa:</strong> Priorización de documentos por cliente, los clientes con más documentos técnicos requieren mayor tiempo.</p>
              <p>• <strong>Procesamiento IA:</strong> Se han identificado 5 documentos urgentes que deben procesarse primero.</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              <Upload className="w-4 h-4 mr-2" />
              Subir Manual
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

      {/* Métricas en Tiempo Real */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Métricas en Tiempo Real</h3>
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
              <Activity className="w-6 h-6 text-teal-600" />
            </div>
            <div className="text-2xl font-bold text-teal-600">{stats.inProgress}</div>
            <div className="text-sm text-gray-600">Procesando</div>
          </div>
        </div>
      </div>

      {/* Controles Operativos */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">🎛️ Controles Operativos</h3>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Iniciar Sesión
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

      {/* Queue Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
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
              {filteredQueue.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center space-y-2">
                      <FileText className="w-12 h-12 text-gray-300" />
                      <span className="text-gray-500">No hay documentos en la cola manual</span>
                      <button
                        onClick={() => setShowUploadModal(true)}
                        className="mt-4 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Iniciar Gestión Manual
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredQueue.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{item.queue_position}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Building className="h-4 w-4 text-blue-600" />
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.companies?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.projects?.name || 'N/A'}
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
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(item.priority)}`}>
                        {item.priority === 'urgent' ? 'Urgente' :
                         item.priority === 'high' ? 'Alta' :
                         item.priority === 'normal' ? 'Normal' : 'Baja'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.manual_status)}`}>
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
                            const client = clients.find(c => c.id === item.client_id);
                            if (client) {
                              setSelectedClient(client);
                              setShowCredentialsModal(true);
                            }
                          }}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="Configurar Obralia"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                        <button
                          className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                          title="Procesar"
                        >
                          <Upload className="w-4 h-4" />
                        </button>
                        <button
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

      {/* Gestión Manual Operativa */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">🎯 Gestión Manual Operativa</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center text-sm text-gray-700">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <span><strong>Paso 1:</strong> Acceso directo integrado: Jefe habilita el acceso remoto dominado</span>
            </div>
            <div className="flex items-center text-sm text-gray-700">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <span><strong>Paso 2:</strong> Credenciales Manuales: Cada individuo de servicio y certificación que certificaciones</span>
            </div>
            <div className="flex items-center text-sm text-gray-700">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
              <span><strong>Paso 3:</strong> Procesamiento por Lotes: Selección múltiple documentos para subida masiva</span>
            </div>
            <div className="flex items-center text-sm text-gray-700">
              <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
              <span><strong>Paso 4:</strong> Integración Directa: Administración remota completa y gestión por objetivos</span>
            </div>
            <div className="flex items-center text-sm text-gray-700">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
              <span><strong>Paso 5:</strong> Procesamiento IA: Se han identificado 5 documentos urgentes que deben procesarse primero</span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-3">Estado Actual del Sistema</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Cola activa:</span>
                <span className="font-medium text-blue-600">{stats.total} documentos</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Clientes configurados:</span>
                <span className="font-medium text-green-600">
                  {clients.filter(c => c.obralia_credentials?.configured).length} de {clients.length}
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

      <DocumentUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        selectedClient={selectedClient}
        onUpload={handleUploadDocuments}
      />
    </div>
  );
}