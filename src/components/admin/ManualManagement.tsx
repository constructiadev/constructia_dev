import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Building2, 
  FolderOpen, 
  FileText, 
  Upload, 
  Download,
  Search,
  Filter,
  Eye,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Clock,
  Brain,
  ExternalLink,
  Settings,
  RefreshCw,
  Plus,
  Edit,
  Globe,
  Shield,
  Zap,
  BarChart3,
  TrendingUp
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { callGeminiAI } from '../../lib/supabase';

interface ManualDocument {
  id: string;
  filename: string;
  original_name: string;
  file_size: number;
  document_type: string;
  classification_confidence: number;
  upload_status: 'pending' | 'processing' | 'classified' | 'uploaded_to_obralia' | 'completed' | 'error';
  obralia_status: 'pending' | 'uploaded' | 'validated' | 'rejected' | 'error';
  created_at: string;
  project_id: string;
  project_name: string;
  company_id: string;
  company_name: string;
  client_id: string;
  client_name: string;
}

interface ClientGroup {
  client_id: string;
  client_name: string;
  companies: CompanyGroup[];
}

interface CompanyGroup {
  company_id: string;
  company_name: string;
  projects: ProjectGroup[];
}

interface ProjectGroup {
  project_id: string;
  project_name: string;
  documents_count: number;
  documents: ManualDocument[];
}

interface UploadProgress {
  id: string;
  filename: string;
  client_name: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
}

interface ManualKPICardProps {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ElementType;
  color: string;
  description?: string;
}

function ManualKPICard({ title, value, change, trend, icon: Icon, color, description }: ManualKPICardProps) {
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600';
  const trendSymbol = trend === 'up' ? '+' : trend === 'down' ? '-' : '';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="text-right">
          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
            tiempo real
          </span>
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        <div className="flex items-center justify-between mt-2">
          <p className={`text-sm font-medium ${trendColor}`}>
            {trendSymbol}{Math.abs(change)}% vs período anterior
          </p>
        </div>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </div>
    </div>
  );
}

// Componente para zona de drop en proyectos
function ProjectDropZone({ 
  children, 
  onDrop, 
  className = "" 
}: { 
  children: React.ReactNode; 
  onDrop: (files: File[]) => void;
  className?: string;
}) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    noClick: true // Solo drag & drop, no click
  });

  return (
    <div 
      {...getRootProps()} 
      className={`${className} ${isDragActive ? 'bg-purple-100 border-purple-300' : ''} transition-colors`}
    >
      <input {...getInputProps()} />
      {children}
      {isDragActive && (
        <div className="absolute inset-0 bg-purple-100 bg-opacity-75 flex items-center justify-center rounded-lg">
          <div className="text-center">
            <Upload className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-purple-800 font-medium">Suelta archivos aquí</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ManualManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterClient, setFilterClient] = useState('all');
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [showObraliaModal, setShowObraliaModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientGroup | null>(null);
  const [selectedDocumentsForObralia, setSelectedDocumentsForObralia] = useState<ManualDocument[]>([]);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [aiInsights, setAiInsights] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // KPIs de Gestión Manual
  const manualKPIs = [
    { title: 'Documentos Pendientes', value: '156', change: -8.2, trend: 'up' as const, icon: Clock, color: 'bg-yellow-500', description: 'Esperando procesamiento manual' },
    { title: 'Procesados Hoy', value: '89', change: 15.3, trend: 'up' as const, icon: CheckCircle, color: 'bg-green-500', description: 'Documentos procesados manualmente' },
    { title: 'Errores Detectados', value: '12', change: -25.0, trend: 'up' as const, icon: AlertTriangle, color: 'bg-red-500', description: 'Documentos con errores' },
    { title: 'Clientes Afectados', value: '23', change: 5.4, trend: 'up' as const, icon: Users, color: 'bg-blue-500', description: 'Clientes con documentos pendientes' },
    { title: 'Tiempo Promedio', value: '3.2min', change: -12.1, trend: 'up' as const, icon: Zap, color: 'bg-purple-500', description: 'Tiempo de procesamiento manual' },
    { title: 'Tasa de Éxito', value: '96.8%', change: 2.1, trend: 'up' as const, icon: TrendingUp, color: 'bg-emerald-500', description: 'Documentos procesados exitosamente' }
  ];

  // Datos simulados de documentos
  const allDocuments: ManualDocument[] = [
    {
      id: '1',
      filename: 'certificado_obra_A_20240127.pdf',
      original_name: 'Certificado de Obra A.pdf',
      file_size: 2456789,
      document_type: 'Certificado',
      classification_confidence: 94,
      upload_status: 'pending',
      obralia_status: 'pending',
      created_at: '2024-01-27T10:30:00Z',
      project_id: 'proj_1',
      project_name: 'Edificio Residencial Centro',
      company_id: 'comp_1',
      company_name: 'Construcciones García S.L.',
      client_id: 'cli_1',
      client_name: 'Juan García'
    },
    {
      id: '2',
      filename: 'factura_materiales_B_20240126.pdf',
      original_name: 'Factura Materiales B.pdf',
      file_size: 1234567,
      document_type: 'Factura',
      classification_confidence: 89,
      upload_status: 'error',
      obralia_status: 'pending',
      created_at: '2024-01-26T15:45:00Z',
      project_id: 'proj_2',
      project_name: 'Reforma Oficinas Norte',
      company_id: 'comp_1',
      company_name: 'Construcciones García S.L.',
      client_id: 'cli_1',
      client_name: 'Juan García'
    },
    {
      id: '3',
      filename: 'dni_trabajador_C_20240125.pdf',
      original_name: 'DNI Trabajador C.pdf',
      file_size: 987654,
      document_type: 'DNI/Identificación',
      classification_confidence: 96,
      upload_status: 'pending',
      obralia_status: 'pending',
      created_at: '2024-01-25T09:15:00Z',
      project_id: 'proj_3',
      project_name: 'Puente Industrial A-7',
      company_id: 'comp_2',
      company_name: 'Obras Públicas del Norte S.A.',
      client_id: 'cli_2',
      client_name: 'María López'
    }
  ];

  // Agrupar documentos por cliente, empresa y proyecto
  const groupedDocuments = allDocuments.reduce((acc, doc) => {
    let client = acc.find(c => c.client_id === doc.client_id);
    if (!client) {
      client = {
        client_id: doc.client_id,
        client_name: doc.client_name,
        companies: []
      };
      acc.push(client);
    }

    let company = client.companies.find(c => c.company_id === doc.company_id);
    if (!company) {
      company = {
        company_id: doc.company_id,
        company_name: doc.company_name,
        projects: []
      };
      client.companies.push(company);
    }

    let project = company.projects.find(p => p.project_id === doc.project_id);
    if (!project) {
      project = {
        project_id: doc.project_id,
        project_name: doc.project_name,
        documents_count: 0,
        documents: []
      };
      company.projects.push(project);
    }

    project.documents.push(doc);
    project.documents_count = project.documents.length;

    return acc;
  }, [] as ClientGroup[]);

  const filteredDocuments = allDocuments.filter(doc => {
    const matchesSearch = doc.original_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.document_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.project_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || doc.upload_status === filterStatus;
    const matchesClient = filterClient === 'all' || doc.client_id === filterClient;
    
    return matchesSearch && matchesStatus && matchesClient;
  });

  const generateManualInsights = async () => {
    setLoading(true);
    try {
      // Simular insights mientras Gemini está fallando
      const mockInsights = `🔧 Análisis de Gestión Manual:

1. **Carga de Trabajo**: 156 documentos pendientes de procesamiento manual, principalmente certificados y facturas.

2. **Eficiencia**: El tiempo promedio de procesamiento manual es 3.2 minutos, con una tasa de éxito del 96.8%.

3. **Priorización**: Recomienda procesar primero los documentos de "Construcciones García S.L." (mayor volumen) y resolver los 12 errores detectados.`;
      
      setAiInsights(mockInsights);
    } catch (error) {
      setAiInsights('Error al generar insights manuales. La API de Gemini está temporalmente no disponible.');
    } finally {
      setLoading(false);
    }
  };

  const onDrop = async (files: File[], clientId: string, companyId: string, projectId: string) => {
    console.log('onDrop called with:', { files: files.length, clientId, companyId, projectId });
    
    const newUploads: UploadProgress[] = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      filename: file.name,
      client_name: groupedDocuments.find(c => c.client_id === clientId)?.client_name || 'Cliente',
      progress: 0,
      status: 'uploading'
    }));

    setUploadProgress(prev => [...prev, ...newUploads]);

    // Simular progreso de subida
    for (const upload of newUploads) {
      for (let progress = 0; progress <= 100; progress += 20) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setUploadProgress(prev => prev.map(u => 
          u.id === upload.id ? { ...u, progress } : u
        ));
      }
      
      setUploadProgress(prev => prev.map(u => 
        u.id === upload.id ? { ...u, status: 'completed' } : u
      ));
    }

    // Limpiar progreso después de 3 segundos
    setTimeout(() => {
      setUploadProgress(prev => prev.filter(u => !newUploads.find(n => n.id === u.id)));
    }, 3000);
  };

  const handleConnectObralia = (client: ClientGroup, documents: ManualDocument[]) => {
    console.log('handleConnectObralia called');
    console.log('Client:', client.client_name);
    console.log('Documents received:', documents);
    console.log('Documents count:', documents.length);
    
    setSelectedClient(client);
    setSelectedDocumentsForObralia(documents);
    setShowObraliaModal(true);
  };

  const handleObraliaConnection = async (credentials: { username: string; password: string }) => {
    try {
      // Simular conexión con Obralia
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert(`¡Credenciales configuradas para ${selectedClient?.client_name}! Se procesarán ${selectedDocumentsForObralia.length} documentos.`);
      setShowObraliaModal(false);
      setSelectedDocuments([]);
    } catch (error) {
      alert('Error al configurar credenciales de Obralia');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'processing': return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Componente para fila de cliente
  const ClientRow = ({ client, onConnectObralia }: { client: ClientGroup; onConnectObralia: (client: ClientGroup, documents: ManualDocument[]) => void }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);

    const allClientDocuments = client.companies.flatMap(company => 
      company.projects.flatMap(project => project.documents)
    );
    
    const pendingDocuments = allClientDocuments.filter(doc => 
      doc.upload_status === 'pending' || doc.upload_status === 'error'
    );

    const handleSelectAll = () => {
      console.log('handleSelectAll called');
      console.log('Current selectedDocuments:', selectedDocuments);
      console.log('Pending documents:', pendingDocuments);
      
      if (selectedDocuments.length === pendingDocuments.length) {
        console.log('Deselecting all documents');
        setSelectedDocuments([]);
      } else {
        console.log('Selecting all pending documents');
        setSelectedDocuments(pendingDocuments.map(d => d.id));
      }
    };

    const handleDocumentSelect = (documentId: string) => {
      console.log('handleDocumentSelect called with documentId:', documentId);
      console.log('Current selectedDocuments before update:', selectedDocuments);
      
      setSelectedDocuments(prev => 
        prev.includes(documentId) 
          ? prev.filter(id => id !== documentId)
          : [...prev, documentId]
      );
      
      // Log after state update (will show in next render)
      setTimeout(() => {
        console.log('selectedDocuments after update:', selectedDocuments);
      }, 100);
    };

    const getSelectedDocuments = () => {
      const selected = allClientDocuments.filter(doc => selectedDocuments.includes(doc.id));
      console.log('getSelectedDocuments called, returning:', selected);
      return selected;
    };

    return (
      <React.Fragment>
        {/* Client Header Row */}
        <tr className="bg-blue-50 border-b-2 border-blue-200">
          <td colSpan={8} className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="mr-3 p-1 hover:bg-blue-200 rounded"
                >
                  {isExpanded ? '▼' : '▶'}
                </button>
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-800">{client.client_name}</h3>
                  <p className="text-sm text-blue-600">
                    {allClientDocuments.length} documentos • {pendingDocuments.length} pendientes
                  </p>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={handleSelectAll}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                >
                  {selectedDocuments.length === pendingDocuments.length ? 'Deseleccionar' : 'Seleccionar'} Todo
                </button>
                <button
                  onClick={() => onConnectObralia(client, getSelectedDocuments())}
                  disabled={selectedDocuments.length === 0}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm disabled:opacity-50 flex items-center"
                >
                  {console.log('Rendering Conectar Obralia button, selectedDocuments.length:', selectedDocuments.length)}
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Conectar Obralia ({selectedDocuments.length})
                </button>
              </div>
            </div>
          </td>
        </tr>

        {/* Expanded Content */}
        {isExpanded && (
          <React.Fragment>
            {client.companies.map((company) => (
              <React.Fragment key={company.company_id}>
                {/* Company Header */}
                <tr className="bg-green-50">
                  <td colSpan={8} className="px-6 py-3">
                    <div className="flex items-center">
                      <div className="bg-green-100 p-2 rounded-lg mr-3 ml-8">
                        <Building2 className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-green-800">{company.company_name}</p>
                        <p className="text-sm text-green-600">{company.projects.length} proyectos</p>
                      </div>
                    </div>
                  </td>
                </tr>

                {/* Projects */}
                {company.projects.map((project) => (
                  <React.Fragment key={project.project_id}>
                    {/* Project Row with Drop Zone */}
                    <tr className="bg-purple-50 hover:bg-purple-100 transition-colors">
                      <ProjectDropZone
                        onDrop={(files) => onDrop(files, client.client_id, company.company_id, project.project_id)}
                        className="contents"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="bg-purple-100 p-2 rounded-lg mr-3">
                              <FolderOpen className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-medium text-purple-800">{project.project_name}</p>
                              <p className="text-sm text-purple-600">{project.documents_count} documentos</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-gray-500">-</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-500">-</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-500">-</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-500">-</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-500">-</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-500">-</td>
                        <td className="px-6 py-4 text-center">
                          <div className="text-xs text-purple-600 font-medium">
                            📁 Zona de Drop
                          </div>
                        </td>
                      </ProjectDropZone>
                    </tr>

                    {/* Documents */}
                    {project.documents.map((doc) => {
                      const isSelected = selectedDocuments.includes(doc.id);
                      const isPending = doc.upload_status === 'pending' || doc.upload_status === 'error';
                      
                      return (
                        <DocumentRow
                          key={doc.id}
                          document={doc}
                          isSelected={isSelected}
                          isPending={isPending}
                          onSelect={() => handleDocumentSelect(doc.id)}
                        />
                      );
                    })}
                  </React.Fragment>
                ))}
              </React.Fragment>
            ))}
          </React.Fragment>
        )}
      </React.Fragment>
    );
  };

  // Componente para fila de documento
  const DocumentRow = ({ 
    document, 
    isSelected, 
    isPending, 
    onSelect 
  }: { 
    document: ManualDocument; 
    isSelected: boolean; 
    isPending: boolean; 
    onSelect: () => void; 
  }) => {
    const handleDocumentSelect = (documentId: string) => {
      console.log('DocumentRow handleDocumentSelect called with:', documentId);
      console.log('Current isSelected:', isSelected);
      onSelect();
    };

    return (
      <tr className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            {isPending && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onSelect()}
                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            )}
            <div className="bg-gray-100 p-2 rounded-lg mr-3 ml-12">
              <FileText className="h-4 w-4 text-gray-600" />
            </div>
            <div>
              <p className="font-medium text-gray-800">{document.original_name}</p>
              <p className="text-sm text-gray-500">{formatFileSize(document.file_size)}</p>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {document.document_type}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {document.classification_confidence}%
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            {getStatusIcon(document.upload_status)}
            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(document.upload_status)}`}>
              {document.upload_status}
            </span>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            {getStatusIcon(document.obralia_status)}
            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(document.obralia_status)}`}>
              {document.obralia_status}
            </span>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {new Date(document.created_at).toLocaleDateString()}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
          <div className="flex space-x-2">
            <button className="text-blue-600 hover:text-blue-900">
              <Eye className="h-4 w-4" />
            </button>
            <button className="text-green-600 hover:text-green-900">
              <Download className="h-4 w-4" />
            </button>
            <button className="text-red-600 hover:text-red-900">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  useEffect(() => {
    generateManualInsights();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header con IA */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Gestión Manual</h2>
            <p className="text-orange-100 mt-1">Procesamiento manual de documentos con asistencia IA</p>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={generateManualInsights}
              disabled={loading}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center"
            >
              <Brain className="h-4 w-4 mr-2" />
              {loading ? 'Analizando...' : 'Actualizar IA'}
            </button>
          </div>
        </div>
        
        {aiInsights && (
          <div className="mt-4 bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold mb-2">🔧 Insights de Gestión Manual:</h3>
            <div className="text-sm text-white/90 whitespace-pre-line">{aiInsights}</div>
          </div>
        )}
      </div>

      {/* KPIs de Gestión Manual */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Métricas de Gestión Manual</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          {manualKPIs.map((kpi, index) => (
            <ManualKPICard key={index} {...kpi} />
          ))}
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por documento, cliente o proyecto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="processing">Procesando</option>
            <option value="error">Error</option>
            <option value="completed">Completado</option>
          </select>
          
          <select
            value={filterClient}
            onChange={(e) => setFilterClient(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">Todos los clientes</option>
            {groupedDocuments.map(client => (
              <option key={client.client_id} value={client.client_id}>
                {client.client_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla de Documentos Agrupados */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            Documentos por Cliente ({filteredDocuments.length})
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Arrastra archivos sobre las filas moradas de proyectos para subirlos
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documento/Proyecto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confianza IA</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado Subida</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado Obralia</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {groupedDocuments.map((client) => (
                <ClientRow 
                  key={client.client_id} 
                  client={client} 
                  onConnectObralia={handleConnectObralia}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Progress */}
      {uploadProgress.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Progreso de Subida</h3>
          <div className="space-y-3">
            {uploadProgress.map((progress) => (
              <div key={progress.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-800">{progress.filename}</p>
                    <p className="text-sm text-gray-600">{progress.client_name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700">{progress.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de Credenciales Obralia */}
      {showObraliaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Configurar Credenciales Obralia
            </h3>
            <p className="text-gray-600 mb-4">
              Cliente: {selectedClient?.client_name}
            </p>
            <p className="text-gray-600 mb-6">
              Documentos a procesar: {selectedDocumentsForObralia.length}
            </p>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usuario Obralia
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="usuario@obralia.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña Obralia
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="••••••••"
                />
              </div>
            </form>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowObraliaModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleObraliaConnection({ username: 'test', password: 'test' })}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
              >
                Configurar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}