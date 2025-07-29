import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Download,
  Eye,
  Trash2,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Clock,
  Upload,
  Brain,
  Building2,
  FolderOpen
} from 'lucide-react';

interface Document {
  id: string;
  filename: string;
  original_name: string;
  document_type: string;
  file_size: number;
  project_name: string;
  company_name: string;
  upload_status: 'completed' | 'processing' | 'error' | 'pending';
  obralia_status: 'validated' | 'uploaded' | 'pending' | 'rejected';
  classification_confidence: number;
  ai_metadata: {
    classification: string;
    extracted_data?: any;
  };
  created_at: string;
  processed_at?: string;
}

export default function Documents() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterProject, setFilterProject] = useState('all');

  // Datos simulados de documentos
  const documents: Document[] = [
    {
      id: '1',
      filename: 'certificado_obra_A_20240127.pdf',
      original_name: 'Certificado de Obra A.pdf',
      document_type: 'Certificado',
      file_size: 2456789,
      project_name: 'Edificio Residencial Centro',
      company_name: 'Construcciones García S.L.',
      upload_status: 'completed',
      obralia_status: 'validated',
      classification_confidence: 94,
      ai_metadata: {
        classification: 'Certificado de Obra',
        extracted_data: {
          amount: '€45,670',
          date: '2024-01-27',
          contractor: 'García Construcciones'
        }
      },
      created_at: '2024-01-27T10:30:00Z',
      processed_at: '2024-01-27T10:32:15Z'
    },
    {
      id: '2',
      filename: 'factura_materiales_B_20240126.pdf',
      original_name: 'Factura Materiales B.pdf',
      document_type: 'Factura',
      file_size: 1234567,
      project_name: 'Reforma Oficinas Norte',
      company_name: 'Construcciones García S.L.',
      upload_status: 'completed',
      obralia_status: 'uploaded',
      classification_confidence: 89,
      ai_metadata: {
        classification: 'Factura de Materiales',
        extracted_data: {
          amount: '€12,340',
          supplier: 'Materiales Norte S.A.',
          date: '2024-01-26'
        }
      },
      created_at: '2024-01-26T15:45:00Z',
      processed_at: '2024-01-26T15:47:22Z'
    },
    {
      id: '3',
      filename: 'dni_trabajador_C_20240125.pdf',
      original_name: 'DNI Trabajador C.pdf',
      document_type: 'DNI/Identificación',
      file_size: 987654,
      project_name: 'Puente Industrial A-7',
      company_name: 'Obras Públicas del Norte S.A.',
      upload_status: 'completed',
      obralia_status: 'validated',
      classification_confidence: 96,
      ai_metadata: {
        classification: 'Documento de Identidad',
        extracted_data: {
          name: 'Carlos Martínez López',
          dni: '12345678X',
          expiry: '2029-05-15'
        }
      },
      created_at: '2024-01-25T09:15:00Z',
      processed_at: '2024-01-25T09:16:45Z'
    },
    {
      id: '4',
      filename: 'contrato_subcontrata_20240124.pdf',
      original_name: 'Contrato Subcontrata.pdf',
      document_type: 'Contrato',
      file_size: 3456789,
      project_name: 'Centro Comercial Valencia',
      company_name: 'Reformas Integrales López',
      upload_status: 'processing',
      obralia_status: 'pending',
      classification_confidence: 87,
      ai_metadata: {
        classification: 'Contrato de Subcontratación'
      },
      created_at: '2024-01-24T14:20:00Z'
    },
    {
      id: '5',
      filename: 'seguro_responsabilidad_20240123.pdf',
      original_name: 'Seguro Responsabilidad Civil.pdf',
      document_type: 'Seguro',
      file_size: 1876543,
      project_name: 'Rehabilitación Edificio Histórico',
      company_name: 'Reformas Integrales López',
      upload_status: 'error',
      obralia_status: 'rejected',
      classification_confidence: 76,
      ai_metadata: {
        classification: 'Póliza de Seguro'
      },
      created_at: '2024-01-23T11:30:00Z'
    }
  ];

  const projects = [
    'Edificio Residencial Centro',
    'Reforma Oficinas Norte',
    'Puente Industrial A-7',
    'Centro Comercial Valencia',
    'Rehabilitación Edificio Histórico'
  ];

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.original_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.document_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.company_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || doc.document_type === filterType;
    const matchesStatus = filterStatus === 'all' || doc.upload_status === filterStatus;
    const matchesProject = filterProject === 'all' || doc.project_name === filterProject;
    
    return matchesSearch && matchesType && matchesStatus && matchesProject;
  });

  const getUploadStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getObraliaStatusColor = (status: string) => {
    switch (status) {
      case 'validated': return 'bg-emerald-100 text-emerald-800';
      case 'uploaded': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'validated':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'processing':
      case 'uploaded':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'error':
      case 'rejected':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDocumentTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'certificado':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'factura':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'dni/identificación':
        return <FileText className="h-5 w-5 text-purple-600" />;
      case 'contrato':
        return <FileText className="h-5 w-5 text-orange-600" />;
      case 'seguro':
        return <FileText className="h-5 w-5 text-indigo-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Mis Documentos</h2>
          <p className="text-gray-600">Biblioteca completa de documentos procesados con IA</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{filteredDocuments.length}</span> documentos
          </div>
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
                placeholder="Buscar por nombre, tipo, proyecto o empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="all">Todos los tipos</option>
            <option value="Certificado">Certificados</option>
            <option value="Factura">Facturas</option>
            <option value="DNI/Identificación">DNI/Identificación</option>
            <option value="Contrato">Contratos</option>
            <option value="Seguro">Seguros</option>
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="all">Todos los estados</option>
            <option value="completed">Completado</option>
            <option value="processing">Procesando</option>
            <option value="error">Error</option>
            <option value="pending">Pendiente</option>
          </select>
          
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="all">Todos los proyectos</option>
            {projects.map(project => (
              <option key={project} value={project}>{project}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de Documentos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proyecto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clasificación IA</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Obralia</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDocuments.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getDocumentTypeIcon(doc.document_type)}
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{doc.original_name}</div>
                        <div className="text-sm text-gray-500">
                          {doc.document_type} • {formatFileSize(doc.file_size)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FolderOpen className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{doc.project_name}</div>
                        <div className="text-sm text-gray-500">{doc.company_name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Brain className="h-4 w-4 text-purple-600 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{doc.ai_metadata.classification}</div>
                        <div className="text-sm text-gray-500">{doc.classification_confidence}% confianza</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(doc.upload_status)}
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getUploadStatusColor(doc.upload_status)}`}>
                        {doc.upload_status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(doc.obralia_status)}
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getObraliaStatusColor(doc.obralia_status)}`}>
                        {doc.obralia_status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(doc.created_at).toLocaleDateString()}
                    </div>
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredDocuments.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">No se encontraron documentos</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Sube tu primer documento para comenzar'}
          </p>
        </div>
      )}

      {/* Información de IA */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
        <div className="flex items-start">
          <Brain className="h-6 w-6 text-purple-600 mr-3 mt-0.5" />
          <div>
            <h4 className="font-semibold text-purple-800 mb-2">Clasificación Inteligente con IA</h4>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• Todos los documentos son clasificados automáticamente por Gemini AI</li>
              <li>• Se extraen datos relevantes de cada documento</li>
              <li>• Los documentos se suben automáticamente a Obralia tras la validación</li>
              <li>• Se mantiene un historial completo de procesamiento</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}