import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  RefreshCw, Plus, FileText, AlertCircle, CheckCircle, X, Eye, Download, Clock, Brain, Shield, Database, Settings, Filter, Search, Calendar, Building2, User, Trash2, ChevronRight, ChevronDown, Info, Upload,
} from 'lucide-react';
import {
  getAllClients,
  updateClientObraliaCredentials,
  removeFile,
  getClientCompanies,
  getClientProjects,
  getClientDocuments,
  getManualProcessingQueue,
  supabase
} from '../../lib/supabase';

interface Client {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  obralia_credentials?: {
    configured: boolean;
    username?: string;
    password?: string;
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
  status: string;
  progress: number;
  company_id: string;
  client_id: string;
}

interface Document {
  id: string;
  filename: string;
  original_name: string;
  file_size: number;
  file_type: string;
  document_type?: string;
  classification_confidence?: number;
  project_id: string;
  client_id: string;
  created_at: string;
  updated_at: string;
}

interface ManualQueueItem {
  id: string;
  document_id: string;
  manual_status: 'pending' | 'in_progress' | 'uploaded' | 'validated' | 'error' | 'corrupted';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  admin_notes?: string;
  processed_by?: string;
  processed_at?: string;
  retry_count: number;
  last_error_message?: string;
  created_at: string;
  updated_at: string;
}

interface DocumentNode extends Document {
  manual_queue?: ManualQueueItem;
}

interface ProjectNode extends Project {
  documents: DocumentNode[];
}

interface CompanyNode extends Company {
  projects: ProjectNode[];
}

interface ClientNode extends Client {
  companies: CompanyNode[];
}

interface UploadedFile extends Document {
  manual_queue?: ManualQueueItem;
}

interface ObraliaCredentialsModalProps {
  isOpen: boolean;
  onSave: (credentials: { username: string; password: string }) => Promise<void>;
  clientName: string;
}

function ObraliaCredentialsModal({ isOpen, onSave, clientName }: ObraliaCredentialsModalProps) {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credentials.username || !credentials.password) return;

    setIsLoading(true);
    try {
      await onSave(credentials);
      setCredentials({ username: '', password: '' });
    } catch (error) {
      console.error('Error saving credentials:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Configurar Credenciales de Obralia</h3>
        <p className="text-gray-600 mb-4">Cliente: {clientName}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
            <input
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setCredentials({ username: '', password: '' })}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ManualManagement() {
  const [clients, setClients] = useState<ClientNode[]>([]);
  const [filteredClients, setFilteredClients] = useState<ClientNode[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [showFileDetails, setShowFileDetails] = useState(false);
  const [showObraliaCredentialsModal, setShowObraliaCredentialsModal] = useState(false);
  const [selectedClientForObralia, setSelectedClientForObralia] = useState<Client | null>(null);
  const [expandedClients, setExpandedClients] = useState<string[]>([]);
  const [expandedCompanies, setExpandedCompanies] = useState<string[]>([]);
  const [expandedProjects, setExpandedProjects] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    console.log('🔍 [ManualManagement] Loading data...');
    try {
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .order('company_name');

      if (clientsError) {
        throw new Error(`Error fetching clients: ${clientsError.message}`);
      }
      console.log(`✅ [ManualManagement] Fetched ${clientsData.length} clients.`);

      const clientsWithData: ClientNode[] = await Promise.all(clientsData.map(async (client: Client) => {
        const { data: companiesData, error: companiesError } = await supabase
          .from('companies')
          .select('*')
          .eq('client_id', client.id);
        if (companiesError) {
          console.warn(`Error fetching companies for client ${client.id}: ${companiesError.message}`);
        }
        console.log(`  - Client ${client.company_name}: Fetched ${companiesData?.length || 0} companies.`);

        const companiesWithData: CompanyNode[] = await Promise.all((companiesData || []).map(async (company: Company) => {
          const { data: projectsData, error: projectsError } = await supabase
            .from('projects')
            .select('*')
            .eq('company_id', company.id);
          if (projectsError) {
            console.warn(`Error fetching projects for company ${company.id}: ${projectsError.message}`);
          }
          console.log(`    - Company ${company.name}: Fetched ${projectsData?.length || 0} projects.`);

          const projectsWithData: ProjectNode[] = await Promise.all((projectsData || []).map(async (project: Project) => {
            const { data: documentsData, error: documentsError } = await supabase
              .from('documents')
              .select('*')
              .eq('project_id', project.id);
            if (documentsError) {
              console.warn(`Error fetching documents for project ${project.id}: ${documentsError.message}`);
            }
            console.log(`      - Project ${project.name}: Fetched ${documentsData?.length || 0} documents.`);

            const documentsWithQueueData: DocumentNode[] = await Promise.all((documentsData || []).map(async (doc: Document) => {
              const { data: queueItem, error: queueError } = await supabase
                .from('manual_processing_queue')
                .select('*')
                .eq('document_id', doc.id)
                .single();
              if (queueError && queueError.code !== 'PGRST116') { // PGRST116 means no rows found
                console.warn(`Error fetching queue item for document ${doc.id}: ${queueError.message}`);
              }
              // console.log(`        - Document ${doc.filename}: Queue status ${queueItem?.manual_status || 'N/A'}`);

              return {
                ...doc,
                manual_queue: queueItem || undefined
              };
            }));

            return { ...project, documents: documentsWithQueueData };
          }));

          return { ...company, projects: projectsWithData };
        }));

        return { ...client, companies: companiesWithData };
      }));
      setClients(clientsWithData);
      console.log('✅ [ManualManagement] Data loaded successfully.');
    } catch (err: any) {
      console.error('❌ [ManualManagement] Error loading data:', err);
      setError(err.message || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setFilteredClients(clients);
  }, [clients, searchTerm, statusFilter, priorityFilter]);

  const handleObraliaCredentialsSave = async (credentials: { username: string; password: string }) => {
    if (!selectedClientForObralia || !selectedClientForObralia.id) return;

    try {
      await updateClientObraliaCredentials(selectedClientForObralia.id, credentials);
      await loadData(); // Reload data to reflect changes
    } catch (err) {
      console.error('Error saving Obralia credentials:', err);
      setError(err instanceof Error ? err.message : 'Error al guardar las credenciales de Obralia');
      throw err; // Re-throw to keep modal open on error
    } finally {
      setShowObraliaCredentialsModal(false);
    }
  };

  const handleObraliaConnection = (client: Client) => {
    if (client) {
      if (client.obralia_credentials?.configured) {
        setSelectedClientForObralia(client);
      } else {
        setShowObraliaCredentialsModal(true);
        setSelectedClientForObralia(client);
      }
    }
  };

  const handleProcessDocument = async (document: DocumentNode, action: 'upload' | 'validate' | 'reject') => {
    // Implement actual processing logic here
    console.log(`Processing document ${document.original_name} with action: ${action}`);
    // Simulate API call and update status
    await new Promise(resolve => setTimeout(resolve, 1000));

    setClients(prevClients => prevClients.map(client => ({
      ...client,
      companies: client.companies.map(company => ({
        ...company,
        projects: company.projects.map(project => ({
          ...project,
          documents: project.documents.map(doc => 
            doc.id === document.id 
              ? { ...doc, manual_queue: { ...doc.manual_queue!, manual_status: action === 'upload' ? 'uploaded' : 'validated' } }
              : doc
          )
        }))
      }))
    })));
  };

  const handleAddDocumentToQueue = async (document: DocumentNode) => {
    // Logic to add document to manual queue
    console.log(`Adding document ${document.original_name} to manual queue.`);
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'in_progress': return 'En Proceso';
      case 'uploaded': return 'Subido';
      case 'validated': return 'Validado';
      case 'error': return 'Error';
      case 'corrupted': return 'Corrupto';
      default: return 'Desconocido';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const toggleClient = (clientId: string) => {
    setExpandedClients(prev => 
      prev.includes(clientId) 
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const toggleCompany = (companyId: string) => {
    setExpandedCompanies(prev => 
      prev.includes(companyId) 
        ? prev.filter(id => id !== companyId)
        : [...prev, companyId]
    );
  };

  const toggleProject = (projectId: string) => {
    setExpandedProjects(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  if (loading) {
    return ( // Loading state for the entire module
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando gestión manual...</p>
        </div>
      </div>
    );
  }

  if (error) { // Error state for the entire module
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar los datos</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadData}
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
              Cola de procesamiento manual para subida a Obralia
            </p>
            <div className="space-y-1 text-sm text-red-100">
              <p>• Gestión jerárquica: Cliente → Empresa → Proyecto → Documento</p>
              <p>• Subida manual con credenciales de cliente</p>
              <p>• Dos métodos: Drag & Drop y Selección de Archivo</p>
              <p>• Control de integridad y validación automática</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={loadData}
              disabled={loading}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> {/* Use loading state */}
              Actualizar
            </button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Cola</p>
              <p className="text-2xl font-bold text-gray-900">{filteredClients.reduce((acc, client) => acc + client.companies.reduce((accComp, comp) => accComp + comp.projects.reduce((accProj, proj) => accProj + proj.documents.filter(doc => doc.manual_queue?.manual_status).length, 0), 0), 0)}</p>
            </div>
          </div>
          <FileText className="w-8 h-8 text-blue-600" />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-medium text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-gray-900">{filteredClients.reduce((acc, client) => acc + client.companies.reduce((accComp, comp) => accComp + comp.projects.reduce((accProj, proj) => accProj + proj.documents.filter(doc => doc.manual_queue?.manual_status === 'pending').length, 0), 0), 0)}</p>
            </div>
          </div>
          <Clock className="w-8 h-8 text-yellow-600" />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-medium text-gray-600">En Proceso</p>
              <p className="text-2xl font-bold text-gray-900">{filteredClients.reduce((acc, client) => acc + client.companies.reduce((accComp, comp) => accComp + comp.projects.reduce((accProj, proj) => accProj + proj.documents.filter(doc => doc.manual_queue?.manual_status === 'in_progress').length, 0), 0), 0)}</p>
            </div>
          </div>
          <RefreshCw className="w-8 h-8 text-blue-600" />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-medium text-gray-600">Subidos</p>
              <p className="text-2xl font-bold text-gray-900">{filteredClients.reduce((acc, client) => acc + client.companies.reduce((accComp, comp) => accComp + comp.projects.reduce((accProj, proj) => accProj + proj.documents.filter(doc => doc.manual_queue?.manual_status === 'uploaded' || doc.manual_queue?.manual_status === 'validated').length, 0), 0), 0)}</p>
            </div>
          </div>
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-medium text-gray-600">Errores</p>
              <p className="text-2xl font-bold text-gray-900">{filteredClients.reduce((acc, client) => acc + client.companies.reduce((accComp, comp) => accComp + comp.projects.reduce((accProj, proj) => accProj + proj.documents.filter(doc => doc.manual_queue?.manual_status === 'error' || doc.manual_queue?.manual_status === 'corrupted').length, 0), 0), 0)}</p>
            </div>
          </div>
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar clientes, empresas, proyectos o documentos..."
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
              <option value="in_progress">En proceso</option>
              <option value="uploaded">Subidos</option>
              <option value="validated">Validados</option>
              <option value="error">Errores</option>
              <option value="corrupted">Corruptos</option>
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
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setPriorityFilter('all');
              }}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Document Queue */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Cola de Documentos Agrupada</h2>
          <div className="text-sm text-gray-600">
            {selectedFiles.length > 0 && (
              <span className="mr-4">{selectedFiles.length} seleccionados</span>
            )}
            <span>{filteredClients.reduce((acc, client) => acc + client.companies.reduce((accComp, comp) => accComp + comp.projects.reduce((accProj, proj) => accProj + proj.documents.filter(doc => doc.manual_queue?.manual_status).length, 0), 0), 0)} documentos en cola</span>
          </div>
        </div>

        {clients.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay documentos en la cola</h3>
            <p className="text-gray-600 mb-6">
              Los documentos aparecerán aquí cuando se añadan a la cola de procesamiento manual.
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              Añadir Documentos
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredClients.map(client => (
              <div key={client.id} className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                      <button onClick={() => toggleClient(client.id)} className="p-1 rounded-full hover:bg-gray-100">
                        {expandedClients.includes(client.id) ? <ChevronDown className="w-5 h-5 text-gray-600" /> : <ChevronRight className="w-5 h-5 text-gray-600" />} {/* Toggle icon */}
                      </button>
                      <User className="w-6 h-6 text-blue-600" />
                      <div>
                        <h3 className="font-semibold text-gray-900">{client.company_name}</h3>
                        <p className="text-sm text-gray-600">{client.contact_name} • {client.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{client.companies.reduce((acc, comp) => acc + comp.projects.reduce((accProj, proj) => accProj + proj.documents.filter(doc => doc.manual_queue?.manual_status).length, 0), 0)} documentos</span>
                      <button onClick={() => handleObraliaConnection(client)} className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors shadow-sm">
                        <Settings className="w-4 h-4 inline mr-1" />
                        Obralia
                      </button>
                    </div>
                  </div>
                  {expandedClients.includes(client.id) && (
                    <div className="pl-8 space-y-4">
                      {client.companies.map(company => (
                        <div key={company.id} className="border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
                          <div className="flex items-center space-x-3">
                            <button onClick={() => toggleCompany(company.id)} className="p-1 rounded-full hover:bg-gray-200">
                              {expandedCompanies.includes(company.id) ? <ChevronDown className="w-5 h-5 text-gray-600" /> : <ChevronRight className="w-5 h-5 text-gray-600" />} {/* Toggle icon */}
                            </button>
                            <Building2 className="w-5 h-5 text-green-600" />
                            <span className="font-medium text-gray-900">{company.name}</span>
                          </div>
                          <span className="text-sm text-gray-600">{company.projects.reduce((acc, proj) => acc + proj.documents.filter(doc => doc.manual_queue?.manual_status).length, 0)} documentos</span>
                        </div>
                        {expandedCompanies.includes(company.id) && (
                          <div className="pl-8"> {/* Indent projects */}
                            {company.projects.map(project => (
                              <div key={project.id} className="border-b border-gray-200">
                                <div className="flex items-center justify-between p-3 bg-gray-100">
                                  <div>
                                    <div className="flex items-center space-x-3">
                                      <button onClick={() => toggleProject(project.id)} className="p-1 rounded-full hover:bg-gray-200">
                                        {expandedProjects.includes(project.id) ? <ChevronDown className="w-5 h-5 text-gray-600" /> : <ChevronRight className="w-5 h-5 text-gray-600" />}
                                      </button> {/* Toggle icon */}
                                      <FileText className="w-5 h-5 text-purple-600" />
                                      <span className="font-medium text-gray-900">{project.name}</span>
                                    </div>
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {project.documents.filter(doc => doc.manual_queue?.manual_status).length} documentos
                                  </div>
                                  {expandedProjects.includes(project.id) && (
                                    <div className="pl-8">
                                      {/* Filter documents in queue */}
                                      {project.documents.filter(doc => doc.manual_queue?.manual_status).map(document => (
                                        <div key={document.id} className="flex items-center justify-between p-3 border-b border-gray-200 last:border-b-0">
                                          <div className="flex items-center space-x-3">
                                            <input
                                              type="checkbox"
                                              checked={selectedFiles.includes(document.id)}
                                              onChange={(e) => {
                                                if (e.target.checked) {
                                                  setSelectedFiles(prev => [...prev, document.id]);
                                                } else {
                                                  setSelectedFiles(prev => prev.filter(id => id !== document.id));
                                                }
                                              }}
                                              className="rounded border-gray-300"
                                            />
                                            <FileText className="w-5 h-5 text-gray-400" />
                                            <div>
                                              <p className="font-medium text-gray-900">{document.original_name}</p>
                                              <p className="text-sm text-gray-500">{document.document_type || 'Sin clasificar'} • {formatFileSize(document.file_size)}</p>
                                            </div>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            {document.manual_queue?.priority && (
                                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(document.manual_queue.priority)}`}>
                                                {document.manual_queue?.priority}
                                              </span>
                                            )}
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(document.manual_queue?.manual_status || 'pending')}`}>
                                              {getStatusText(document.manual_queue?.manual_status || '')}
                                            </span>
                                            <button
                                              onClick={() => {
                                                setSelectedFile(document);
                                                setShowFileDetails(true);
                                              }} /* View details button */
                                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors" 
                                            >
                                              <Eye className="w-4 h-4" />
                                            </button>
                                            {document.manual_queue?.manual_status === 'pending' && ( /* Process button for pending documents */
                                              <button
                                                onClick={() => handleProcessDocument(document, 'upload')}
                                                className="p-1 text-green-600 hover:text-green-700 transition-colors"
                                              >
                                                <Upload className="w-4 h-4" />
                                              </button>
                                            )}
                                            {document.manual_queue?.manual_status === 'error' && ( /* Retry button for error documents */
                                              <button
                                                onClick={() => handleProcessDocument(document, 'upload')}
                                                className="p-1 text-orange-600 hover:text-orange-700 transition-colors"
                                              >
                                                <RefreshCw className="w-4 h-4" />
                                              </button>
                                            )}
                                            <button
                                              onClick={() => removeFile(document.id)} /* Delete button */
                                              className="p-1 text-red-600 hover:text-red-700 transition-colors"
                                            >
                                              <Trash2 className="w-4 h-4" />
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Workflow Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Info className="w-5 h-5 mr-2 text-blue-600" />
          Flujo de Trabajo
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">1</div>
              <div>
                <p className="font-medium text-gray-900">Configurar credenciales de Obralia</p>
                <p className="text-sm text-gray-600">Asegúrate de que el cliente tenga sus credenciales de Obralia/Nalanda configuradas.</p>
              </div>
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">2</div>
              <div>
                <p className="font-medium text-gray-900">Añadir documentos a la cola</p>
                <p className="text-sm text-gray-600">Utiliza el botón "Añadir Archivos" o arrastra y suelta para añadir documentos a la cola manual.</p>
              </div>
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">3</div>
              <div>
                <p className="font-medium text-gray-900">Procesar documentos</p>
                <p className="text-sm text-gray-600">Haz clic en el botón "Subir" o "Reintentar" junto a cada documento para iniciar el procesamiento.</p>
              </div>
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">4</div>
              <div>
                <p className="font-medium text-gray-900">Validar y confirmar</p>
                <p className="text-sm text-gray-600">Una vez procesados, los documentos se validarán y se subirán automáticamente a Obralia.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Obralia Credentials Modal */}
      <ObraliaCredentialsModal
        isOpen={showObraliaCredentialsModal}
        onSave={handleObraliaCredentialsSave}
        clientName={selectedClientForObralia?.company_name || 'Cliente'}
      />
    </div>
  );
}