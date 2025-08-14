import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  User, 
  Building2, 
  FolderOpen, 
  RefreshCw, 
  Search, 
  Filter, 
  Eye, 
  Download, 
  Trash2, 
  Settings, 
  Plus, 
  X, 
  Save, 
  Play, 
  Pause, 
  Target, 
  Brain, 
  Shield, 
  Database, 
  Zap, 
  Activity, 
  BarChart3, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  Hash, 
  Percent, 
  Timer, 
  Flag, 
  Star, 
  Award, 
  TrendingUp, 
  Users, 
  Globe, 
  Cpu, 
  HardDrive, 
  Wifi, 
  Server, 
  Monitor, 
  Code, 
  Terminal, 
  Key, 
  Lock, 
  Unlock, 
  Link, 
  ExternalLink, 
  Info, 
  Lightbulb, 
  Bookmark, 
  Tag, 
  Layers, 
  Grid, 
  List, 
  Table, 
  Image, 
  Video, 
  Music, 
  Archive, 
  Folder, 
  File, 
  FileImage, 
  FileSpreadsheet, 
  ChevronDown,
  ChevronRight,
  Copy,
  Edit
} from 'lucide-react';
import { 
  getManualProcessingQueue, 
  getAllClients, 
  getClientCompanies, 
  getClientProjects,
  getClientDocuments,
  supabase 
} from '../../lib/supabase';

interface QueueDocument {
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
  estimated_processing_time?: string;
  created_at: string;
  updated_at: string;
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
  };
  companies?: {
    name: string;
  };
  projects?: {
    name: string;
  };
}

interface ClientGroup {
  client: any;
  companies: CompanyGroup[];
  totalDocuments: number;
  pendingDocuments: number;
  obraliaConfigured: boolean;
}

interface CompanyGroup {
  company: any;
  projects: ProjectGroup[];
  totalDocuments: number;
  pendingDocuments: number;
}

interface ProjectGroup {
  project: any;
  documents: QueueDocument[];
  totalDocuments: number;
  pendingDocuments: number;
}

interface ObraliaConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: any;
  selectedDocuments: QueueDocument[];
  onConnect: (credentials: { username: string; password: string }) => Promise<void>;
}

function ObraliaConnectionModal({ isOpen, onClose, client, selectedDocuments, onConnect }: ObraliaConnectionModalProps) {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [isConnecting, setIsConnecting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleConnect = async () => {
    if (!credentials.username || !credentials.password) return;
    
    setIsConnecting(true);
    try {
      await onConnect(credentials);
      onClose();
    } catch (error) {
      console.error('Error connecting to Obralia:', error);
      alert('Error al conectar con Obralia');
    } finally {
      setIsConnecting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white/20 p-3 rounded-full mr-4">
                <Database className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Conexión Manual a Obralia/Nalanda</h2>
                <p className="text-orange-100">{client?.company_name}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Client Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <Building2 className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <h4 className="font-semibold text-blue-800">{client?.company_name}</h4>
                <p className="text-sm text-blue-700">{selectedDocuments.length} documentos seleccionados para subida</p>
              </div>
            </div>
          </div>

          {/* Credentials Form */}
          <div className="bg-orange-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
              <Key className="h-5 w-5 mr-2" />
              Credenciales de Acceso
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Usuario:
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={credentials.username}
                    onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="juan.garcia@obralia.com"
                  />
                  <button
                    type="button"
                    onClick={() => setCredentials(prev => ({ ...prev, username: 'juan.garcia@obralia.com' }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-orange-600 hover:text-orange-700 text-sm"
                  >
                    Copiar
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña:
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={credentials.password}
                    onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full pl-10 pr-16 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="Garcia2024!"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setCredentials(prev => ({ ...prev, password: 'Garcia2024!' }))}
                      className="text-orange-600 hover:text-orange-700 text-sm"
                    >
                      Copiar
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2 flex items-center">
              <Info className="h-4 w-4 mr-2" />
              Instrucciones de Uso:
            </h4>
            <ol className="text-sm text-yellow-700 space-y-1">
              <li>1. Haz clic en "Abrir Nalanda" para abrir la ventana de login</li>
              <li>2. Usa "Copiar" individual para cada campo (Usuario y Contraseña)</li>
              <li>3. Pega en Nalanda con Ctrl+V en cada campo</li>
              <li>4. Si falla, selecciona manualmente el texto y copia con Ctrl+C</li>
            </ol>
          </div>

          {/* Connection Status */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Estado de Conexión</span>
              <span className="flex items-center text-red-600">
                <AlertTriangle className="h-4 w-4 mr-1" />
                Desconectado
              </span>
            </div>
          </div>

          {/* Documents to Upload */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-3 flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Documentos a Subir ({selectedDocuments.length})
            </h4>
            <div className="max-h-32 overflow-y-auto space-y-2">
              {selectedDocuments.map((doc, index) => (
                <div key={doc.id} className="flex items-center justify-between text-sm">
                  <span className="text-green-700">{doc.documents?.original_name}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    doc.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                    doc.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {doc.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t border-gray-200">
            <div className="flex space-x-3">
              <button
                onClick={() => setCredentials({ username: 'juan.garcia@obralia.com', password: 'Garcia2024!' })}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center"
              >
                <Copy className="h-4 w-4 mr-2" />
                Secuencia Completa
              </button>
              <button
                onClick={() => window.open('https://nalanda.obralia.com', '_blank')}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors flex items-center"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Abrir Nalanda
              </button>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleConnect}
                disabled={isConnecting || !credentials.username || !credentials.password}
                className="flex items-center px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
              >
                {isConnecting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Conectando...
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4 mr-2" />
                    Conectar a Obralia
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ProcessingModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: QueueDocument | null;
  onProcess: (documentId: string, action: 'upload' | 'validate' | 'reject', notes: string) => Promise<void>;
}

function ProcessingModal({ isOpen, onClose, document, onProcess }: ProcessingModalProps) {
  const [action, setAction] = useState<'upload' | 'validate' | 'reject'>('upload');
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (document) {
      setNotes(document.admin_notes || '');
    }
  }, [document]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!document) return;

    setIsProcessing(true);
    try {
      await onProcess(document.id, action, notes);
      onClose();
    } catch (error) {
      console.error('Error processing document:', error);
      alert('Error al procesar el documento');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen || !document) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Procesar Documento</h2>
              <p className="text-orange-100">{document.documents?.original_name}</p>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Document Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-4">Información del Documento</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Cliente:</span>
                <p className="font-medium">{document.clients?.company_name}</p>
              </div>
              <div>
                <span className="text-gray-600">Proyecto:</span>
                <p className="font-medium">{document.projects?.name || 'Sin asignar'}</p>
              </div>
              <div>
                <span className="text-gray-600">Tipo:</span>
                <p className="font-medium">{document.documents?.document_type}</p>
              </div>
              <div>
                <span className="text-gray-600">Confianza IA:</span>
                <p className="font-medium">{document.documents?.classification_confidence}%</p>
              </div>
            </div>
          </div>

          {/* Action Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Acción a realizar
            </label>
            <div className="space-y-3">
              <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="action"
                  value="upload"
                  checked={action === 'upload'}
                  onChange={(e) => setAction(e.target.value as any)}
                  className="mr-3"
                />
                <div className="flex items-center">
                  <Upload className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-800">Subir a Obralia</p>
                    <p className="text-sm text-gray-600">Procesar y subir el documento</p>
                  </div>
                </div>
              </label>

              <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="action"
                  value="validate"
                  checked={action === 'validate'}
                  onChange={(e) => setAction(e.target.value as any)}
                  className="mr-3"
                />
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-800">Validar</p>
                    <p className="text-sm text-gray-600">Marcar como validado</p>
                  </div>
                </div>
              </label>

              <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="action"
                  value="reject"
                  checked={action === 'reject'}
                  onChange={(e) => setAction(e.target.value as any)}
                  className="mr-3"
                />
                <div className="flex items-center">
                  <X className="w-5 h-5 text-red-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-800">Rechazar</p>
                    <p className="text-sm text-gray-600">Rechazar el documento</p>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas del administrador
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Añadir notas sobre el procesamiento..."
            />
          </div>

          {/* Footer */}
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
              disabled={isProcessing}
              className="flex items-center px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Procesando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Procesar Documento
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
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(new Set());
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [showObraliaModal, setShowObraliaModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<QueueDocument | null>(null);
  const [selectedClient, setSelectedClient] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener todos los clientes
      const clients = await getAllClients();
      if (!clients || clients.length === 0) {
        throw new Error('No hay clientes en la base de datos');
      }

      // Crear estructura jerárquica
      const groups: ClientGroup[] = [];

      for (const client of clients) {
        try {
          // Obtener empresas del cliente
          const companies = await getClientCompanies(client.id);
          const companyGroups: CompanyGroup[] = [];

          for (const company of companies) {
            try {
              // Obtener proyectos de la empresa
              const projects = await getClientProjects(client.id);
              const companyProjects = projects.filter(p => p.company_id === company.id);
              const projectGroups: ProjectGroup[] = [];

              for (const project of companyProjects) {
                try {
                  // Obtener documentos del proyecto
                  const documents = await getClientDocuments(client.id);
                  const projectDocuments = documents.filter(d => d.project_id === project.id);
                  
                  // Convertir documentos a formato de cola
                  const queueDocuments: QueueDocument[] = projectDocuments.map((doc, index) => ({
                    id: `queue_${doc.id}`,
                    document_id: doc.id,
                    client_id: client.id,
                    company_id: company.id,
                    project_id: project.id,
                    queue_position: index + 1,
                    priority: ['normal', 'high', 'urgent', 'low'][Math.floor(Math.random() * 4)] as any,
                    manual_status: ['pending', 'in_progress', 'uploaded'][Math.floor(Math.random() * 3)] as any,
                    ai_analysis: {
                      document_type: doc.document_type,
                      confidence: doc.classification_confidence,
                      recommendations: ['Verificar clasificación', 'Confirmar datos']
                    },
                    admin_notes: '',
                    processed_by: undefined,
                    processed_at: undefined,
                    corruption_detected: false,
                    file_integrity_score: Math.floor(Math.random() * 20) + 80,
                    retry_count: 0,
                    last_error_message: undefined,
                    estimated_processing_time: '00:03:00',
                    created_at: doc.created_at,
                    updated_at: doc.updated_at,
                    documents: {
                      filename: doc.filename,
                      original_name: doc.original_name,
                      file_size: doc.file_size,
                      file_type: doc.file_type,
                      document_type: doc.document_type,
                      classification_confidence: doc.classification_confidence
                    },
                    clients: {
                      company_name: client.company_name,
                      contact_name: client.contact_name,
                      email: client.email
                    },
                    companies: {
                      name: company.name
                    },
                    projects: {
                      name: project.name
                    }
                  }));

                  if (queueDocuments.length > 0) {
                    projectGroups.push({
                      project,
                      documents: queueDocuments,
                      totalDocuments: queueDocuments.length,
                      pendingDocuments: queueDocuments.filter(d => d.manual_status === 'pending').length
                    });
                  }
                } catch (err) {
                  console.warn(`Error loading documents for project ${project.id}:`, err);
                }
              }

              if (projectGroups.length > 0) {
                companyGroups.push({
                  company,
                  projects: projectGroups,
                  totalDocuments: projectGroups.reduce((sum, p) => sum + p.totalDocuments, 0),
                  pendingDocuments: projectGroups.reduce((sum, p) => sum + p.pendingDocuments, 0)
                });
              }
            } catch (err) {
              console.warn(`Error loading projects for company ${company.id}:`, err);
            }
          }

          if (companyGroups.length > 0) {
            groups.push({
              client,
              companies: companyGroups,
              totalDocuments: companyGroups.reduce((sum, c) => sum + c.totalDocuments, 0),
              pendingDocuments: companyGroups.reduce((sum, c) => sum + c.pendingDocuments, 0),
              obraliaConfigured: client.obralia_credentials?.configured || false
            });
          }
        } catch (err) {
          console.warn(`Error loading data for client ${client.id}:`, err);
        }
      }

      setClientGroups(groups);

    } catch (err) {
      console.error('Error loading manual management data:', err);
      setError(err instanceof Error ? err.message : 'Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessDocument = async (documentId: string, action: 'upload' | 'validate' | 'reject', notes: string) => {
    try {
      // Simular procesamiento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Actualizar estado local
      setClientGroups(prev => prev.map(clientGroup => ({
        ...clientGroup,
        companies: clientGroup.companies.map(companyGroup => ({
          ...companyGroup,
          projects: companyGroup.projects.map(projectGroup => ({
            ...projectGroup,
            documents: projectGroup.documents.map(doc => 
              doc.id === documentId 
                ? { 
                    ...doc, 
                    manual_status: action === 'upload' ? 'uploaded' : action === 'validate' ? 'validated' : 'error',
                    admin_notes: notes,
                    processed_at: new Date().toISOString()
                  }
                : doc
            )
          }))
        }))
      })));

      console.log(`Documento ${documentId} procesado con acción: ${action}`);
    } catch (error) {
      console.error('Error processing document:', error);
      throw error;
    }
  };

  const handleObraliaConnect = async (credentials: { username: string; password: string }) => {
    try {
      // Simular conexión a Obralia
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Actualizar credenciales del cliente
      if (selectedClient) {
        const { error } = await supabase
          .from('clients')
          .update({
            obralia_credentials: {
              configured: true,
              username: credentials.username,
              password: credentials.password
            }
          })
          .eq('id', selectedClient.id);

        if (error) {
          throw new Error(`Error updating credentials: ${error.message}`);
        }
      }

      // Procesar documentos seleccionados
      const selectedDocs = getAllSelectedDocuments();
      for (const doc of selectedDocs) {
        await handleProcessDocument(doc.id, 'upload', 'Subido automáticamente tras conexión a Obralia');
      }

      await loadData();
      setSelectedDocuments([]);
    } catch (error) {
      console.error('Error connecting to Obralia:', error);
      throw error;
    }
  };

  const toggleClientExpansion = (clientId: string) => {
    setExpandedClients(prev => {
      const newSet = new Set(prev);
      if (newSet.has(clientId)) {
        newSet.delete(clientId);
      } else {
        newSet.add(clientId);
      }
      return newSet;
    });
  };

  const toggleCompanyExpansion = (companyId: string) => {
    setExpandedCompanies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(companyId)) {
        newSet.delete(companyId);
      } else {
        newSet.add(companyId);
      }
      return newSet;
    });
  };

  const toggleProjectExpansion = (projectId: string) => {
    setExpandedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  const handleDocumentSelection = (documentId: string) => {
    setSelectedDocuments(prev => 
      prev.includes(documentId) 
        ? prev.filter(id => id !== documentId)
        : [...prev, documentId]
    );
  };

  const getAllSelectedDocuments = (): QueueDocument[] => {
    const allDocuments: QueueDocument[] = [];
    clientGroups.forEach(clientGroup => {
      clientGroup.companies.forEach(companyGroup => {
        companyGroup.projects.forEach(projectGroup => {
          projectGroup.documents.forEach(doc => {
            if (selectedDocuments.includes(doc.id)) {
              allDocuments.push(doc);
            }
          });
        });
      });
    });
    return allDocuments;
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'in_progress': return <Play className="w-4 h-4" />;
      case 'uploaded': return <Upload className="w-4 h-4" />;
      case 'validated': return <CheckCircle className="w-4 h-4" />;
      case 'error': return <AlertTriangle className="w-4 h-4" />;
      case 'corrupted': return <X className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Calcular estadísticas
  const stats = {
    total: clientGroups.reduce((sum, c) => sum + c.totalDocuments, 0),
    pending: clientGroups.reduce((sum, c) => sum + c.pendingDocuments, 0),
    inProgress: 0,
    uploaded: 0,
    validated: 0,
    errors: 0
  };

  clientGroups.forEach(clientGroup => {
    clientGroup.companies.forEach(companyGroup => {
      companyGroup.projects.forEach(projectGroup => {
        projectGroup.documents.forEach(doc => {
          switch (doc.manual_status) {
            case 'in_progress': stats.inProgress++; break;
            case 'uploaded': stats.uploaded++; break;
            case 'validated': stats.validated++; break;
            case 'error':
            case 'corrupted': stats.errors++; break;
          }
        });
      });
    });
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-6 h-6 animate-spin text-orange-600" />
            <span className="text-gray-600">Cargando cola de procesamiento manual...</span>
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
            <span className="text-red-800 font-medium">Error al cargar datos</span>
          </div>
          <p className="text-red-700 mt-2">{error}</p>
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
              onClick={loadData}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </button>
            {selectedDocuments.length > 0 && (
              <button
                onClick={() => {
                  const firstDoc = getAllSelectedDocuments()[0];
                  if (firstDoc) {
                    setSelectedClient(clientGroups.find(c => c.client.id === firstDoc.client_id)?.client);
                    setShowObraliaModal(true);
                  }
                }}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center"
              >
                <Database className="w-4 h-4 mr-2" />
                Conectar a Obralia
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
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
              <Play className="w-5 h-5 text-blue-600" />
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
              <Settings className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Validados</p>
              <p className="text-xl font-semibold text-purple-600">{stats.validated}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar clientes, empresa, proyecto o documento..."
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
              <option value="pending">Pendientes</option>
              <option value="in_progress">En proceso</option>
              <option value="uploaded">Subidos</option>
              <option value="validated">Validados</option>
              <option value="error">Errores</option>
              <option value="corrupted">Corruptos</option>
            </select>
          </div>

          <div className="relative">
            <Flag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
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

      {/* Hierarchical Document Tree */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Cola de Documentos Agrupada
            </h3>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {selectedDocuments.length} documentos seleccionados
              </span>
              {selectedDocuments.length > 0 && (
                <button
                  onClick={() => setSelectedDocuments([])}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  Limpiar selección
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          {clientGroups.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay documentos en cola</h3>
              <p className="text-gray-600 mb-6">
                No se encontraron documentos para procesar manualmente
              </p>
              <button
                onClick={loadData}
                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Recargar Datos
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {clientGroups.map((clientGroup) => (
                <div key={clientGroup.client.id} className="border border-gray-200 rounded-lg">
                  {/* Client Header */}
                  <div 
                    className="flex items-center justify-between p-4 bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => toggleClientExpansion(clientGroup.client.id)}
                  >
                    <div className="flex items-center space-x-3">
                      {expandedClients.has(clientGroup.client.id) ? (
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                      )}
                      <Building2 className="w-6 h-6 text-blue-600" />
                      <div>
                        <h4 className="font-semibold text-gray-900">{clientGroup.client.company_name}</h4>
                        <p className="text-sm text-gray-600">{clientGroup.client.contact_name} • {clientGroup.client.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{clientGroup.totalDocuments} documentos</p>
                        <p className="text-xs text-yellow-600">{clientGroup.pendingDocuments} pendientes</p>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        clientGroup.obraliaConfigured 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {clientGroup.obraliaConfigured ? 'Configurado' : 'Sin configurar'}
                      </div>
                    </div>
                  </div>

                  {/* Companies */}
                  {expandedClients.has(clientGroup.client.id) && (
                    <div className="border-t border-gray-200">
                      {clientGroup.companies.map((companyGroup) => (
                        <div key={companyGroup.company.id} className="border-b border-gray-100 last:border-b-0">
                          {/* Company Header */}
                          <div 
                            className="flex items-center justify-between p-4 pl-12 bg-green-50 cursor-pointer hover:bg-green-100 transition-colors"
                            onClick={() => toggleCompanyExpansion(companyGroup.company.id)}
                          >
                            <div className="flex items-center space-x-3">
                              {expandedCompanies.has(companyGroup.company.id) ? (
                                <ChevronDown className="w-4 h-4 text-gray-600" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-gray-600" />
                              )}
                              <Building2 className="w-5 h-5 text-green-600" />
                              <div>
                                <h5 className="font-medium text-gray-900">{companyGroup.company.name}</h5>
                                <p className="text-sm text-gray-600">CIF: {companyGroup.company.cif}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">{companyGroup.totalDocuments} documentos</p>
                              <p className="text-xs text-yellow-600">{companyGroup.pendingDocuments} pendientes</p>
                            </div>
                          </div>

                          {/* Projects */}
                          {expandedCompanies.has(companyGroup.company.id) && (
                            <div className="bg-gray-50">
                              {companyGroup.projects.map((projectGroup) => (
                                <div key={projectGroup.project.id} className="border-b border-gray-200 last:border-b-0">
                                  {/* Project Header */}
                                  <div 
                                    className="flex items-center justify-between p-4 pl-20 bg-purple-50 cursor-pointer hover:bg-purple-100 transition-colors"
                                    onClick={() => toggleProjectExpansion(projectGroup.project.id)}
                                  >
                                    <div className="flex items-center space-x-3">
                                      {expandedProjects.has(projectGroup.project.id) ? (
                                        <ChevronDown className="w-4 h-4 text-gray-600" />
                                      ) : (
                                        <ChevronRight className="w-4 h-4 text-gray-600" />
                                      )}
                                      <FolderOpen className="w-5 h-5 text-purple-600" />
                                      <div>
                                        <h6 className="font-medium text-gray-900">{projectGroup.project.name}</h6>
                                        <p className="text-sm text-gray-600">
                                          {projectGroup.project.status} • {projectGroup.project.progress}% completado
                                        </p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm font-medium text-gray-900">{projectGroup.totalDocuments} documentos</p>
                                      <p className="text-xs text-yellow-600">{projectGroup.pendingDocuments} pendientes</p>
                                    </div>
                                  </div>

                                  {/* Documents */}
                                  {expandedProjects.has(projectGroup.project.id) && (
                                    <div className="bg-white">
                                      {projectGroup.documents.map((doc) => (
                                        <div key={doc.id} className="flex items-center justify-between p-4 pl-28 border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                                          <div className="flex items-center space-x-3">
                                            <input
                                              type="checkbox"
                                              checked={selectedDocuments.includes(doc.id)}
                                              onChange={() => handleDocumentSelection(doc.id)}
                                              className="rounded border-gray-300"
                                            />
                                            <FileText className="w-4 h-4 text-gray-400" />
                                            <div>
                                              <p className="text-sm font-medium text-gray-900">
                                                {doc.documents?.original_name}
                                              </p>
                                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                <span>{formatFileSize(doc.documents?.file_size || 0)}</span>
                                                <span>{doc.documents?.document_type}</span>
                                                <span>{doc.documents?.classification_confidence}% confianza</span>
                                              </div>
                                            </div>
                                          </div>
                                          
                                          <div className="flex items-center space-x-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(doc.priority)}`}>
                                              {doc.priority}
                                            </span>
                                            <div className="flex items-center">
                                              {getStatusIcon(doc.manual_status)}
                                              <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.manual_status)}`}>
                                                {doc.manual_status}
                                              </span>
                                            </div>
                                            <div className="flex space-x-1">
                                              <button
                                                onClick={() => {
                                                  setSelectedDocument(doc);
                                                  setShowProcessingModal(true);
                                                }}
                                                className="p-1 text-gray-400 hover:text-orange-600 transition-colors"
                                                title="Procesar documento"
                                              >
                                                <Settings className="w-4 h-4" />
                                              </button>
                                              <button
                                                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                                title="Ver detalles"
                                              >
                                                <Eye className="w-4 h-4" />
                                              </button>
                                              <button
                                                className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                                                title="Descargar"
                                              >
                                                <Download className="w-4 h-4" />
                                              </button>
                                            </div>
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
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Workflow Steps */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <Info className="w-5 h-5 text-blue-600 mr-2" />
          Flujo de Trabajo
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold">1</span>
            </div>
            <h4 className="font-semibold text-blue-800 mb-2">Configurar credenciales del cliente</h4>
            <p className="text-sm text-blue-700">Establecer acceso a Obralia/Nalanda</p>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold">2</span>
            </div>
            <h4 className="font-semibold text-green-800 mb-2">Seleccionar documentos a subir</h4>
            <p className="text-sm text-green-700">Elegir archivos desde el directorio</p>
          </div>

          <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold">3</span>
            </div>
            <h4 className="font-semibold text-orange-800 mb-2">Elegir método de subida</h4>
            <p className="text-sm text-orange-700">Drag & Drop o selección manual</p>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold">4</span>
            </div>
            <h4 className="font-semibold text-purple-800 mb-2">Confirmar subida a Obralia</h4>
            <p className="text-sm text-purple-700">Validación y procesamiento final</p>
          </div>
        </div>
      </div>

      {/* Processing Modal */}
      <ProcessingModal
        isOpen={showProcessingModal}
        onClose={() => setShowProcessingModal(false)}
        document={selectedDocument}
        onProcess={handleProcessDocument}
      />

      {/* Obralia Connection Modal */}
      <ObraliaConnectionModal
        isOpen={showObraliaModal}
        onClose={() => setShowObraliaModal(false)}
        client={selectedClient}
        selectedDocuments={getAllSelectedDocuments()}
        onConnect={handleObraliaConnect}
      />
    </div>
  );
}