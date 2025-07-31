import React, { useState, useEffect } from 'react';
import { FileText, Users, Building2, FolderOpen, Search, Filter, Eye, Upload, CheckCircle, AlertTriangle, Clock, Brain, Settings, RefreshCw, Download, Play, Pause, SkipForward, Trash2, Edit, Globe, Shield, Zap, Database, TrendingUp, BarChart3, Activity, HardDrive, Cpu, Server, Monitor, Terminal, Code, Key, Lock, Unlock, Calendar, Mail, Phone, MapPin, Hash, Info, FileWarning as Warning, X, Plus, Minus, ArrowUp, ArrowDown, RotateCcw, Save, Send, Archive, Flag, Star, Bookmark, ChevronDown, ChevronRight, ExternalLink, Copy } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { callGeminiAI } from '../../lib/supabase';

interface ManualDocument {
  id: string;
  document_id: string;
  filename: string;
  original_name: string;
  file_size: number;
  file_type: string;
  classification: string;
  confidence: number;
  corruption_detected: boolean;
  integrity_score: number;
  upload_status: 'pending' | 'uploading' | 'uploaded' | 'validated' | 'error' | 'corrupted';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  queue_position: number;
  retry_count: number;
  last_error?: string;
  admin_notes: string;
  created_at: string;
  updated_at: string;
}

interface ClientGroup {
  client_id: string;
  client_name: string;
  client_email: string;
  obralia_credentials: {
    username: string;
    password: string;
    configured: boolean;
  };
  companies: CompanyGroup[];
  total_documents: number;
  documents_per_hour: number;
  last_activity: string;
}

interface CompanyGroup {
  company_id: string;
  company_name: string;
  projects: ProjectGroup[];
  total_documents: number;
}

interface ProjectGroup {
  project_id: string;
  project_name: string;
  documents: ManualDocument[];
  total_documents: number;
}

interface ManualKPICardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  status?: 'good' | 'warning' | 'error';
  realTime?: boolean;
}

function ManualKPICard({ title, value, icon: Icon, color, status = 'good', realTime = true }: ManualKPICardProps) {
  const statusColors = {
    good: 'border-green-200 bg-green-50',
    warning: 'border-yellow-200 bg-yellow-50',
    error: 'border-red-200 bg-red-50'
  };

  return (
    <div className={`border-2 rounded-xl p-4 ${statusColors[status]} hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        {realTime && (
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
            <span className="text-xs text-gray-600">En vivo</span>
          </div>
        )}
      </div>
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

interface ObraliaConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientCredentials: {
    username: string;
    password: string;
  };
  clientName: string;
  documentsToUpload: ManualDocument[];
  onUploadComplete: (documentIds: string[]) => void;
}

function ObraliaConnectionModal({ 
  isOpen, 
  onClose, 
  clientCredentials, 
  clientName, 
  documentsToUpload,
  onUploadComplete 
}: ObraliaConnectionModalProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connected' | 'error'>('disconnected');

  // URL directa de Nalanda para acceso rápido
  const NALANDA_LOGIN_URL = 'https://identity.nalandaglobal.com/realms/nalanda/protocol/openid-connect/auth?ui_locales=es+en+pt&scope=openid&response_type=code&nln_action=redirect&redirect_uri=https%3A%2F%2Fapp.nalandaglobal.com%2FcuadroMandoSubcontratistaByPropietario%21executeLegacy.action%3FcifPropietarioObra%3DA28233534&state=tEO5k9LKsYgxxFseUPQukwYcxwAf9RQWup79Qkk_XGg&nonce=-nbdOhp9ZiDn0J3BFOvdhlebtygGGeO8CAzTN5BNnsk&client_id=nalanda-app';

  const openNalandaDirect = () => {
    window.open(NALANDA_LOGIN_URL, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
  };

  const copyCredentials = () => {
    const credentialsText = `Usuario: ${clientCredentials.username}\nContraseña: ${clientCredentials.password}`;
    navigator.clipboard.writeText(credentialsText).then(() => {
      alert('Credenciales copiadas al portapapeles');
    }).catch(() => {
      // Fallback para navegadores que no soportan clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = credentialsText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Credenciales copiadas al portapapeles');
    });
  };
  const connectToObralia = async () => {
    setIsConnecting(true);
    try {
      // Simular conexión a Obralia
      await new Promise(resolve => setTimeout(resolve, 2000));
      setConnectionStatus('connected');
      alert(`Conectado exitosamente a Obralia como ${clientCredentials.username}`);
    } catch (error) {
      setConnectionStatus('error');
      alert('Error al conectar con Obralia. Verifica las credenciales.');
    } finally {
      setIsConnecting(false);
    }
  };

  const uploadDocuments = async () => {
    if (connectionStatus !== 'connected') return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      for (let i = 0; i < documentsToUpload.length; i++) {
        // Simular subida de cada documento
        await new Promise(resolve => setTimeout(resolve, 1500));
        setUploadProgress(((i + 1) / documentsToUpload.length) * 100);
      }
      
      onUploadComplete(documentsToUpload.map(d => d.id));
      alert(`${documentsToUpload.length} documentos subidos exitosamente a Obralia`);
      onClose();
    } catch (error) {
      alert('Error durante la subida de documentos');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">
            Conexión Manual a Obralia/Nalanda
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Client Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <Users className="h-5 w-5 text-blue-600 mr-3" />
            <div>
              <h4 className="font-semibold text-blue-800">{clientName}</h4>
              <p className="text-sm text-blue-700">
                Usuario Obralia: {clientCredentials.username}
              </p>
            </div>
          </div>
        </div>

        {/* Acceso Directo a Nalanda */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Globe className="h-5 w-5 text-orange-600 mr-3" />
              <div>
                <h4 className="font-semibold text-orange-800">Acceso Directo a Nalanda</h4>
                <p className="text-sm text-orange-700">
                  Abre Nalanda en nueva pestaña y copia las credenciales automáticamente
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={copyCredentials}
                className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
              >
                <Copy className="h-3 w-3 mr-1" />
                Copiar Credenciales
              </button>
              <button
                onClick={openNalandaDirect}
                className="flex items-center px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors text-sm"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Abrir Nalanda
              </button>
            </div>
          </div>
          
          {/* Credenciales Visibles */}
          <div className="mt-3 p-3 bg-white border border-orange-200 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-orange-800">Usuario:</span>
                <p className="text-orange-700 font-mono bg-orange-100 px-2 py-1 rounded mt-1">
                  {clientCredentials.username}
                </p>
              </div>
              <div>
                <span className="font-medium text-orange-800">Contraseña:</span>
                <p className="text-orange-700 font-mono bg-orange-100 px-2 py-1 rounded mt-1">
                  {clientCredentials.password}
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Connection Status */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium text-gray-700">Estado de Conexión</span>
            <div className="flex items-center">
              {connectionStatus === 'connected' && (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  <span className="text-green-600 font-medium">Conectado</span>
                </>
              )}
              {connectionStatus === 'error' && (
                <>
                  <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                  <span className="text-red-600 font-medium">Error</span>
                </>
              )}
              {connectionStatus === 'disconnected' && (
                <>
                  <Clock className="h-4 w-4 text-gray-600 mr-2" />
                  <span className="text-gray-600 font-medium">Desconectado</span>
                </>
              )}
            </div>
          </div>

          {connectionStatus === 'disconnected' && (
            <button
              onClick={connectToObralia}
              disabled={isConnecting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {isConnecting ? 'Conectando...' : 'Conectar a Obralia'}
            </button>
          )}
        </div>

        {/* Documents to Upload */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-700 mb-3">
            Documentos a Subir ({documentsToUpload.length})
          </h4>
          <div className="max-h-40 overflow-y-auto space-y-2">
            {documentsToUpload.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="text-sm font-medium">{doc.original_name}</span>
                </div>
                <span className="text-xs text-gray-500">{doc.classification}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progreso de Subida</span>
              <span className="text-sm text-gray-600">{Math.round(uploadProgress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={uploadDocuments}
            disabled={connectionStatus !== 'connected' || isUploading}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            {isUploading ? 'Subiendo...' : `Subir ${documentsToUpload.length} Documentos`}
          </button>
        </div>
      </div>
    </div>
  );
}

interface ClientRowProps {
  client: ClientGroup;
  isExpanded: boolean;
  onToggle: () => void;
  onConnectObralia: (client: ClientGroup, documents: ManualDocument[]) => void;
  onStatusChange: (documentId: string, newStatus: string) => void;
  onDrop: (files: File[], clientId: string, companyId: string, projectId: string) => void;
}

function ClientRow({ client, isExpanded, onToggle, onConnectObralia, onStatusChange, onDrop }: ClientRowProps) {
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  
  const allDocuments = client.companies.flatMap(company => 
    company.projects.flatMap(project => project.documents)
  );

  const pendingDocuments = allDocuments.filter(doc => doc.upload_status === 'pending');
  const corruptedDocuments = allDocuments.filter(doc => doc.corruption_detected);

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
    console.log('DocumentRow handleDocumentSelect called with:', documentId);
    console.log('Current isSelected:', isSelected);
    console.log('handleDocumentSelect called with documentId:', documentId);
    console.log('Current selectedDocuments before update:', selectedDocuments);
    
    setSelectedDocuments(prev => 
      prev.includes(documentId) 
        ? prev.filter(id => id !== documentId)
        : [...prev, documentId]
    );
    
    // Log after state update (will show in next render)
    setTimeout(() => {
      console.log('selectedDocuments after update should be updated in next render');
    }, 100);
  };

  const getSelectedDocuments = () => {
    const selected = allDocuments.filter(doc => selectedDocuments.includes(doc.id));
    console.log('getSelectedDocuments called, returning:', selected);
    return selected;
  };

  return (
    <>
      {/* Client Header Row */}
      <tr className="bg-blue-50 border-b-2 border-blue-200">
        <td colSpan={8} className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={onToggle}
                className="mr-3 p-1 hover:bg-blue-100 rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-blue-600" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-blue-600" />
                )}
              </button>
              <div className="bg-blue-100 p-2 rounded-lg mr-4">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">{client.client_name}</h3>
                <p className="text-sm text-blue-700">{client.client_email}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              {/* Obralia Credentials */}
              <div className="flex items-center">
                <Globe className="h-4 w-4 text-green-600 mr-2" />
                <div className="text-right">
                  <p className="text-sm font-medium text-green-800">
                    {client.obralia_credentials.username}
                  </p>
                  <p className="text-xs text-green-600">Credenciales OK</p>
                </div>
              </div>
              
              {/* Stats */}
              <div className="text-center">
                <p className="text-lg font-bold text-blue-900">{client.total_documents}</p>
                <p className="text-xs text-blue-700">Documentos</p>
              </div>
              
              <div className="text-center">
                <p className="text-lg font-bold text-green-600">{client.documents_per_hour}</p>
                <p className="text-xs text-green-700">Docs/hora</p>
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
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Conectar Obralia ({selectedDocuments.length})
                </button>
              </div>
            </div>
          </div>
        </td>
      </tr>

      {/* Expanded Content */}
      {isExpanded && client.companies.map((company) => (
        <React.Fragment key={company.company_id}>
          {/* Company Header */}
          <tr className="bg-green-50">
            <td colSpan={8} className="px-12 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Building2 className="h-4 w-4 text-green-600 mr-3" />
                  <span className="font-medium text-green-800">{company.company_name}</span>
                </div>
                <span className="text-sm text-green-700">{company.total_documents} documentos</span>
              </div>
            </td>
          </tr>

          {/* Projects and Documents */}
          {company.projects.map((project) => (
            <React.Fragment key={project.project_id}>
              {/* Project Header */}
              <tr className="bg-purple-50">
                <td colSpan={8} className="px-16 py-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FolderOpen className="h-4 w-4 text-purple-600 mr-2" />
                      <span className="font-medium text-purple-800">{project.project_name}</span>
                    </div>
                    <span className="text-sm text-purple-700">{project.total_documents} documentos</span>
                  </div>
                </td>
              </tr>

              {/* Documents */}
              {project.documents.map((document) => (
                <DocumentRow
                  key={document.id}
                  document={document}
                  isSelected={selectedDocuments.includes(document.id)}
                  onSelect={() => handleDocumentSelect(document.id)}
                  onStatusChange={onStatusChange}
                  onDrop={(files) => onDrop(files, client.client_id, company.company_id, project.project_id)}
                />
              ))}
          ))}
        </React.Fragment>
      ))}
    </>
  );
}

interface DocumentRowProps {
  document: ManualDocument;
  isSelected: boolean;
  onSelect: () => void;
  onStatusChange: (documentId: string, newStatus: string) => void;
  onDrop: (files: File[]) => void;
}

function DocumentRow({ document, isSelected, onSelect, onStatusChange, onDrop }: DocumentRowProps) {
  const { getRootProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxSize: 10 * 1024 * 1024,
    noClick: true
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'uploading': return 'bg-blue-100 text-blue-800';
      case 'uploaded': return 'bg-green-100 text-green-800';
      case 'validated': return 'bg-emerald-100 text-emerald-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'corrupted': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-3 w-3 text-yellow-600" />;
      case 'uploading': return <Upload className="h-3 w-3 text-blue-600 animate-pulse" />;
      case 'uploaded': return <CheckCircle className="h-3 w-3 text-green-600" />;
      case 'validated': return <CheckCircle className="h-3 w-3 text-emerald-600" />;
      case 'error': return <AlertTriangle className="h-3 w-3 text-red-600" />;
      case 'corrupted': return <AlertTriangle className="h-3 w-3 text-purple-600" />;
      default: return <Clock className="h-3 w-3 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'normal': return 'bg-blue-500';
      case 'low': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <tr 
      className={`hover:bg-gray-50 ${
        document.corruption_detected ? 'bg-red-50' : ''
      } ${isDragActive ? 'bg-blue-100' : ''} ${isSelected ? 'bg-blue-50' : ''}`}
    >
      {/* Selection */}
      <td className="px-6 py-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      </td>

      {/* Document Info */}
      <td 
        {...getRootProps()}
        className={`px-6 py-3 ${isDragActive ? 'bg-blue-100 border-2 border-dashed border-blue-400' : ''}`}
      >
        <div className="flex items-center">
          <FileText className="h-4 w-4 text-blue-600 mr-2" />
          <div>
            <p className="text-sm font-medium text-gray-900">{document.original_name}</p>
            <p className="text-xs text-gray-500">
              {(document.file_size / 1024 / 1024).toFixed(2)} MB • {document.file_type}
              {isDragActive && <span className="text-blue-600 font-medium"> • Arrastra aquí</span>}
            </p>
          </div>
        </div>
      </td>

      {/* Queue Position */}
      <td className="px-6 py-3 text-center">
        <div className="flex items-center justify-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${getPriorityColor(document.priority)}`}></div>
          <span className="text-sm font-medium">#{document.queue_position}</span>
        </div>
      </td>

      {/* AI Analysis */}
      <td className="px-6 py-3">
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Brain className="h-3 w-3 text-purple-600 mr-1" />
            <span className="text-sm font-medium">{document.classification}</span>
          </div>
          <div className="text-xs text-gray-600">{document.confidence}% confianza</div>
          {document.corruption_detected && (
            <div className="text-xs text-red-600 font-medium mt-1">⚠️ Corrupto</div>
          )}
        </div>
      </td>

      {/* Integrity */}
      <td className="px-6 py-3 text-center">
        <div className={`text-sm font-medium ${
          document.integrity_score >= 90 ? 'text-green-600' :
          document.integrity_score >= 70 ? 'text-yellow-600' : 'text-red-600'
        }`}>
          {document.integrity_score}%
        </div>
      </td>

      {/* Status */}
      <td className="px-6 py-3">
        <div className="flex items-center justify-center">
          {getStatusIcon(document.upload_status)}
          <select
            value={document.upload_status}
            onChange={(e) => onStatusChange(document.id, e.target.value)}
            className={`ml-2 px-2 py-1 rounded-full text-xs font-medium border-0 ${getStatusColor(document.upload_status)}`}
          >
            <option value="pending">Pendiente</option>
            <option value="uploading">Subiendo</option>
            <option value="uploaded">Subido</option>
            <option value="validated">Validado</option>
            <option value="error">Error</option>
            <option value="corrupted">Corrupto</option>
          </select>
        </div>
      </td>

      {/* Retry Count */}
      <td className="px-6 py-3 text-center">
        <span className={`text-sm ${document.retry_count > 0 ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
          {document.retry_count}
        </span>
      </td>

      {/* Actions */}
      <td className="px-6 py-3">
        <div className="flex space-x-1">
          <button
            onClick={() => onStatusChange(document.id, 'uploading')}
            className="p-1 text-blue-600 hover:bg-blue-100 rounded"
            title="Procesar"
          >
            <Play className="h-3 w-3" />
          </button>
          <button
            className="p-1 text-green-600 hover:bg-green-100 rounded"
            title="Ver"
          >
            <Eye className="h-3 w-3" />
          </button>
          <button
            onClick={() => onStatusChange(document.id, 'pending')}
            className="p-1 text-orange-600 hover:bg-orange-100 rounded"
            title="Reintentar"
          >
            <RotateCcw className="h-3 w-3" />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function ManualManagement() {
  const [clientGroups, setClientGroups] = useState<ClientGroup[]>([]);
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showObraliaModal, setShowObraliaModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientGroup | null>(null);
  const [selectedDocuments, setSelectedDocuments] = useState<ManualDocument[]>([]);
  const [aiInsights, setAiInsights] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Datos simulados organizados por cliente
  const mockClientGroups: ClientGroup[] = [
    {
      client_id: 'cli_001',
      client_name: 'Construcciones García S.L.',
      client_email: 'juan@construccionesgarcia.com',
      obralia_credentials: {
        username: 'juan_garcia',
        password: 'encrypted_password',
        configured: true
      },
      total_documents: 5,
      documents_per_hour: 12,
      last_activity: '2025-01-27T15:45:00Z',
      companies: [
        {
          company_id: 'comp_001',
          company_name: 'Construcciones García S.L.',
          total_documents: 5,
          projects: [
            {
              project_id: 'proj_001',
              project_name: 'Edificio Residencial Centro',
              total_documents: 3,
              documents: [
                {
                  id: '1',
                  document_id: 'doc_001',
                  filename: 'certificado_obra_A.pdf',
                  original_name: 'Certificado de Obra A.pdf',
                  file_size: 2456789,
                  file_type: 'application/pdf',
                  classification: 'Certificado',
                  confidence: 92,
                  corruption_detected: false,
                  integrity_score: 95,
                  upload_status: 'pending',
                  priority: 'urgent',
                  queue_position: 1,
                  retry_count: 0,
                  admin_notes: 'Documento urgente para proyecto crítico',
                  created_at: '2025-01-27T15:45:00Z',
                  updated_at: '2025-01-27T15:45:00Z'
                },
                {
                  id: '2',
                  document_id: 'doc_002',
                  filename: 'factura_materiales_B.pdf',
                  original_name: 'Factura Materiales B.pdf',
                  file_size: 1234567,
                  file_type: 'application/pdf',
                  classification: 'Factura',
                  confidence: 88,
                  corruption_detected: false,
                  integrity_score: 88,
                  upload_status: 'error',
                  priority: 'high',
                  queue_position: 2,
                  retry_count: 1,
                  last_error: 'Timeout de conexión con Obralia',
                  admin_notes: '',
                  created_at: '2025-01-27T15:42:00Z',
                  updated_at: '2025-01-27T15:42:00Z'
                },
                {
                  id: '3',
                  document_id: 'doc_003',
                  filename: 'documento_corrupto.pdf',
                  original_name: 'Documento Corrupto.pdf',
                  file_size: 0,
                  file_type: 'application/pdf',
                  classification: 'unknown',
                  confidence: 15,
                  corruption_detected: true,
                  integrity_score: 0,
                  upload_status: 'corrupted',
                  priority: 'urgent',
                  queue_position: 3,
                  retry_count: 3,
                  last_error: 'Archivo corrupto o vacío detectado',
                  admin_notes: 'Archivo corrupto detectado por IA - requiere revisión manual',
                  created_at: '2025-01-27T15:38:00Z',
                  updated_at: '2025-01-27T15:38:00Z'
                }
              ]
            },
            {
              project_id: 'proj_002',
              project_name: 'Reforma Oficinas Norte',
              total_documents: 2,
              documents: [
                {
                  id: '4',
                  document_id: 'doc_004',
                  filename: 'contrato_reforma.pdf',
                  original_name: 'Contrato de Reforma.pdf',
                  file_size: 3456789,
                  file_type: 'application/pdf',
                  classification: 'Contrato',
                  confidence: 94,
                  corruption_detected: false,
                  integrity_score: 96,
                  upload_status: 'pending',
                  priority: 'normal',
                  queue_position: 4,
                  retry_count: 0,
                  admin_notes: '',
                  created_at: '2025-01-27T15:35:00Z',
                  updated_at: '2025-01-27T15:35:00Z'
                },
                {
                  id: '5',
                  document_id: 'doc_005',
                  filename: 'seguro_obra.pdf',
                  original_name: 'Seguro de Obra.pdf',
                  file_size: 1876543,
                  file_type: 'application/pdf',
                  classification: 'Seguro',
                  confidence: 91,
                  corruption_detected: false,
                  integrity_score: 93,
                  upload_status: 'uploaded',
                  priority: 'normal',
                  queue_position: 5,
                  retry_count: 0,
                  admin_notes: 'Subido exitosamente',
                  created_at: '2025-01-27T15:30:00Z',
                  updated_at: '2025-01-27T15:30:00Z'
                }
              ]
            }
          ]
        }
      ]
    }
  ];

  useEffect(() => {
    setClientGroups(mockClientGroups);
    generateManualInsights();
  }, []);

  const generateManualInsights = async () => {
    setLoading(true);
    try {
      const totalDocuments = clientGroups.reduce((sum, client) => sum + client.total_documents, 0);
      const corruptedCount = clientGroups.reduce((sum, client) => 
        sum + client.companies.reduce((compSum, company) => 
          compSum + company.projects.reduce((projSum, project) => 
            projSum + project.documents.filter(doc => doc.corruption_detected).length, 0), 0), 0);

      const mockInsights = `🔧 Análisis de Gestión Manual ConstructIA:

1. **Cola Activa**: ${totalDocuments} documentos en cola, ${corruptedCount} corruptos detectados automáticamente por IA.

2. **Eficiencia**: Promedio de 12 docs/hora por cliente, recomiendo procesar en lotes por proyecto para optimizar tiempo.

3. **Priorización**: IA ha identificado documentos urgentes que requieren procesamiento inmediato antes que otros.`;
      
      setAiInsights(mockInsights);
    } catch (error) {
      setAiInsights('Error al generar insights. La API de Gemini está temporalmente no disponible.');
    } finally {
      setLoading(false);
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

  const handleConnectObralia = (client: ClientGroup, documents: ManualDocument[]) => {
    console.log('handleConnectObralia called');
    console.log('Client:', client.client_name);
    console.log('Documents received:', documents);
    console.log('Documents count:', documents.length);
    
    setSelectedClient(client);
    setSelectedDocuments(documents);
    setShowObraliaModal(true);
  };

  const handleUploadComplete = (documentIds: string[]) => {
    // Actualizar estado de documentos subidos
    setClientGroups(prev => prev.map(client => ({
      ...client,
      companies: client.companies.map(company => ({
        ...company,
        projects: company.projects.map(project => ({
          ...project,
          documents: project.documents.map(doc => 
            documentIds.includes(doc.id) 
              ? { ...doc, upload_status: 'uploaded' as const, updated_at: new Date().toISOString() }
              : doc
          )
        }))
      }))
    })));
  };

  const handleStatusChange = (documentId: string, newStatus: string) => {
    setClientGroups(prev => prev.map(client => ({
      ...client,
      companies: client.companies.map(company => ({
        ...company,
        projects: company.projects.map(project => ({
          ...project,
          documents: project.documents.map(doc => 
            doc.id === documentId 
              ? { ...doc, upload_status: newStatus as any, updated_at: new Date().toISOString() }
              : doc
          )
        }))
      }))
    })));
  };

  const handleFileDrop = (files: File[], clientId: string, companyId: string, projectId: string) => {
    console.log('Archivos arrastrados:', files, 'para cliente:', clientId, 'empresa:', companyId, 'proyecto:', projectId);
    // Aquí se procesarían los archivos arrastrados
    alert(`${files.length} archivo(s) añadido(s) a la cola para procesamiento`);
  };

  // Calcular KPIs en tiempo real
  const allDocuments = clientGroups.flatMap(client => 
    client.companies.flatMap(company => 
      company.projects.flatMap(project => project.documents)
    )
  );

  const kpis = [
    {
      title: 'Total en Cola',
      value: allDocuments.length.toString(),
      icon: FileText,
      color: 'bg-blue-500',
      status: 'good' as const
    },
    {
      title: 'Pendientes',
      value: allDocuments.filter(d => d.upload_status === 'pending').length.toString(),
      icon: Clock,
      color: 'bg-yellow-500',
      status: 'warning' as const
    },
    {
      title: 'Subidos Hoy',
      value: allDocuments.filter(d => d.upload_status === 'uploaded').length.toString(),
      icon: CheckCircle,
      color: 'bg-green-500',
      status: 'good' as const
    },
    {
      title: 'Corruptos',
      value: allDocuments.filter(d => d.corruption_detected).length.toString(),
      icon: AlertTriangle,
      color: 'bg-red-500',
      status: 'error' as const
    },
    {
      title: 'En Progreso',
      value: allDocuments.filter(d => d.upload_status === 'uploading').length.toString(),
      icon: Upload,
      color: 'bg-purple-500',
      status: 'good' as const
    },
    {
      title: 'Validados',
      value: allDocuments.filter(d => d.upload_status === 'validated').length.toString(),
      icon: Shield,
      color: 'bg-emerald-500',
      status: 'good' as const
    }
  ];

  return (
                  <tr 
                    className="bg-purple-50 hover:bg-purple-100 transition-colors"
                    title="Arrastra archivos aquí para añadir al proyecto"
                  >
      {/* Header con IA */}
                      <ProjectDropZone
                        projectId={project.project_id}
                        projectName={project.project_name}
                        totalDocuments={project.total_documents}
                        onDrop={(files) => onDrop(files, client.client_id, company.company_id, project.project_id)}
                      />
                    </td>
                  </tr>

                  {/* Documents */}
                  {project.documents.map((document) => (
                    <DocumentRow
                      key={document.id}
                      document={document}
                      isSelected={selectedDocuments.includes(document.id)}
                      onSelect={() => handleDocumentSelect(document.id)}
                      onStatusChange={onStatusChange}
                      onDrop={(files) => onDrop(files, client.client_id, company.company_id, project.project_id)}
                    />
                  ))}
                </React.Fragment>
              ))}
            </React.Fragment>
          ))}
        </React.Fragment>
      ))}
    </>
  );
}

interface ProjectDropZoneProps {
  projectId: string;
  projectName: string;
  totalDocuments: number;
  onDrop: (files: File[]) => void;
}

function ProjectDropZone({ projectId, projectName, totalDocuments, onDrop }: ProjectDropZoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxSize: 10 * 1024 * 1024,
    noClick: false
  });

  return (
    <div 
      {...getRootProps()}
      className={`flex items-center justify-between p-2 rounded-lg transition-all ${
        isDragActive ? 'bg-purple-200 border-2 border-dashed border-purple-400' : ''
      }`}
    >
      <input {...getInputProps()} />
      <div className="flex items-center">
        <FolderOpen className="h-4 w-4 text-purple-600 mr-2" />
        <span className="font-medium text-purple-800">{projectName}</span>
        {isDragActive && (
          <span className="ml-2 text-purple-600 font-medium animate-pulse">
            📁 Suelta archivos aquí
          </span>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-sm text-purple-700">{totalDocuments} documentos</span>
        {isDragActive && (
          <Upload className="h-4 w-4 text-purple-600 animate-bounce" />
        )}
      </div>
    </div>
  );
}

interface DocumentRowProps {
  document: ManualDocument;
  isSelected: boolean;
  onSelect: () => void;
  onStatusChange: (documentId: string, newStatus: string) => void;
  onDrop: (files: File[]) => void;
}

function DocumentRow({ document, isSelected, onSelect, onStatusChange, onDrop }: DocumentRowProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'uploading': return 'bg-blue-100 text-blue-800';
      case 'uploaded': return 'bg-green-100 text-green-800';
      case 'validated': return 'bg-emerald-100 text-emerald-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'corrupted': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-3 w-3 text-yellow-600" />;
      case 'uploading': return <Upload className="h-3 w-3 text-blue-600 animate-pulse" />;
      case 'uploaded': return <CheckCircle className="h-3 w-3 text-green-600" />;
      case 'validated': return <CheckCircle className="h-3 w-3 text-emerald-600" />;
      case 'error': return <AlertTriangle className="h-3 w-3 text-red-600" />;
      case 'corrupted': return <AlertTriangle className="h-3 w-3 text-purple-600" />;
      default: return <Clock className="h-3 w-3 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'normal': return 'bg-blue-500';
      case 'low': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const handleDocumentSelect = (documentId: string) => {
    console.log('DocumentRow handleDocumentSelect called with:', documentId);
    console.log('Current isSelected:', isSelected);
    onSelect();
  };

  return (
    <tr 
      className={`hover:bg-gray-50 ${
        document.corruption_detected ? 'bg-red-50' : ''
      } ${isSelected ? 'bg-blue-50' : ''}`}
    >
      {/* Selection */}
      <td className="px-6 py-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => handleDocumentSelect(document.id)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      </td>

      {/* Document Info */}
      <td className="px-6 py-3">
        <div className="flex items-center">
          <FileText className="h-4 w-4 text-blue-600 mr-2" />
          <div>
            <p className="text-sm font-medium text-gray-900">{document.original_name}</p>
            <p className="text-xs text-gray-500">
              {(document.file_size / 1024 / 1024).toFixed(2)} MB • {document.file_type}
            </p>
          </div>
        </div>
      </td>

      {/* Queue Position */}
      <td className="px-6 py-3 text-center">
        <div className="flex items-center justify-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${getPriorityColor(document.priority)}`}></div>
          <span className="text-sm font-medium">#{document.queue_position}</span>
        </div>
      </td>

      {/* AI Analysis */}
      <td className="px-6 py-3">
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Brain className="h-3 w-3 text-purple-600 mr-1" />
            <span className="text-sm font-medium">{document.classification}</span>
          </div>
          <div className="text-xs text-gray-600">{document.confidence}% confianza</div>
          {document.corruption_detected && (
            <div className="text-xs text-red-600 font-medium mt-1">⚠️ Corrupto</div>
          )}
        </div>
      </td>

      {/* Integrity */}
      <td className="px-6 py-3 text-center">
        <div className={`text-sm font-medium ${
          document.integrity_score >= 90 ? 'text-green-600' :
          document.integrity_score >= 70 ? 'text-yellow-600' : 'text-red-600'
        }`}>
          {document.integrity_score}%
        </div>
      </td>

      {/* Status */}
      <td className="px-6 py-3">
        <div className="flex items-center justify-center">
          {getStatusIcon(document.upload_status)}
          <select
            value={document.upload_status}
            onChange={(e) => onStatusChange(document.id, e.target.value)}
            className={`ml-2 px-2 py-1 rounded-full text-xs font-medium border-0 ${getStatusColor(document.upload_status)}`}
          >
            <option value="pending">Pendiente</option>
            <option value="uploading">Subiendo</option>
            <option value="uploaded">Subido</option>
            <option value="validated">Validado</option>
            <option value="error">Error</option>
            <option value="corrupted">Corrupto</option>
          </select>
        </div>
      </td>

      {/* Retry Count */}
      <td className="px-6 py-3 text-center">
        <span className={`text-sm ${document.retry_count > 0 ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
          {document.retry_count}
        </span>
      </td>

      {/* Actions */}
      <td className="px-6 py-3">
        <div className="flex space-x-1">
          <button
            onClick={() => onStatusChange(document.id, 'uploading')}
            className="p-1 text-blue-600 hover:bg-blue-100 rounded"
            title="Procesar"
          >
            <Play className="h-3 w-3" />
          </button>
          <button
            className="p-1 text-green-600 hover:bg-green-100 rounded"
            title="Ver"
          >
            <Eye className="h-3 w-3" />
          </button>
          <button
            onClick={() => onStatusChange(document.id, 'pending')}
            className="p-1 text-orange-600 hover:bg-orange-100 rounded"
            title="Reintentar"
          >
            <RotateCcw className="h-3 w-3" />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function ManualManagement() {
  const [clientGroups, setClientGroups] = useState<ClientGroup[]>([]);
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showObraliaModal, setShowObraliaModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientGroup | null>(null);
  const [selectedDocuments, setSelectedDocuments] = useState<ManualDocument[]>([]);
  const [aiInsights, setAiInsights] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Datos simulados organizados por cliente
  const mockClientGroups: ClientGroup[] = [
    {
      client_id: 'cli_001',
      client_name: 'Construcciones García S.L.',
      client_email: 'juan@construccionesgarcia.com',
      obralia_credentials: {
        username: 'juan_garcia',
        password: 'encrypted_password',
        configured: true
      },
      total_documents: 5,
      documents_per_hour: 12,
      last_activity: '2025-01-27T15:45:00Z',
      companies: [
        {
          company_id: 'comp_001',
          company_name: 'Construcciones García S.L.',
          total_documents: 5,
          projects: [
            {
              project_id: 'proj_001',
              project_name: 'Edificio Residencial Centro',
              total_documents: 3,
              documents: [
                {
                  id: '1',
                  document_id: 'doc_001',
                  filename: 'certificado_obra_A.pdf',
                  original_name: 'Certificado de Obra A.pdf',
                  file_size: 2456789,
                  file_type: 'application/pdf',
                  classification: 'Certificado',
                  confidence: 92,
                  corruption_detected: false,
                  integrity_score: 95,
                  upload_status: 'pending',
                  priority: 'urgent',
                  queue_position: 1,
                  retry_count: 0,
                  admin_notes: 'Documento urgente para proyecto crítico',
                  created_at: '2025-01-27T15:45:00Z',
                  updated_at: '2025-01-27T15:45:00Z'
                },
                {
                  id: '2',
                  document_id: 'doc_002',
                  filename: 'factura_materiales_B.pdf',
                  original_name: 'Factura Materiales B.pdf',
                  file_size: 1234567,
                  file_type: 'application/pdf',
                  classification: 'Factura',
                  confidence: 88,
                  corruption_detected: false,
                  integrity_score: 88,
                  upload_status: 'error',
                  priority: 'high',
                  queue_position: 2,
                  retry_count: 1,
                  last_error: 'Timeout de conexión con Obralia',
                  admin_notes: '',
                  created_at: '2025-01-27T15:42:00Z',
                  updated_at: '2025-01-27T15:42:00Z'
                },
                {
                  id: '3',
                  document_id: 'doc_003',
                  filename: 'documento_corrupto.pdf',
                  original_name: 'Documento Corrupto.pdf',
                  file_size: 0,
                  file_type: 'application/pdf',
                  classification: 'unknown',
                  confidence: 15,
                  corruption_detected: true,
                  integrity_score: 0,
                  upload_status: 'corrupted',
                  priority: 'urgent',
                  queue_position: 3,
                  retry_count: 3,
                  last_error: 'Archivo corrupto o vacío detectado',
                  admin_notes: 'Archivo corrupto detectado por IA - requiere revisión manual',
                  created_at: '2025-01-27T15:38:00Z',
                  updated_at: '2025-01-27T15:38:00Z'
                }
              ]
            },
            {
              project_id: 'proj_002',
              project_name: 'Reforma Oficinas Norte',
              total_documents: 2,
              documents: [
                {
                  id: '4',
                  document_id: 'doc_004',
                  filename: 'contrato_reforma.pdf',
                  original_name: 'Contrato de Reforma.pdf',
                  file_size: 3456789,
                  file_type: 'application/pdf',
                  classification: 'Contrato',
                  confidence: 94,
                  corruption_detected: false,
                  integrity_score: 96,
                  upload_status: 'pending',
                  priority: 'normal',
                  queue_position: 4,
                  retry_count: 0,
                  admin_notes: '',
                  created_at: '2025-01-27T15:35:00Z',
                  updated_at: '2025-01-27T15:35:00Z'
                },
                {
                  id: '5',
                  document_id: 'doc_005',
                  filename: 'seguro_obra.pdf',
                  original_name: 'Seguro de Obra.pdf',
                  file_size: 1876543,
                  file_type: 'application/pdf',
                  classification: 'Seguro',
                  confidence: 91,
                  corruption_detected: false,
                  integrity_score: 93,
                  upload_status: 'uploaded',
                  priority: 'normal',
                  queue_position: 5,
                  retry_count: 0,
                  admin_notes: 'Subido exitosamente',
                  created_at: '2025-01-27T15:30:00Z',
                  updated_at: '2025-01-27T15:30:00Z'
                }
              ]
            }
          ]
        }
      ]
    }
  ];

  useEffect(() => {
    setClientGroups(mockClientGroups);
    generateManualInsights();
  }, []);

  const generateManualInsights = async () => {
    setLoading(true);
    try {
      const totalDocuments = clientGroups.reduce((sum, client) => sum + client.total_documents, 0);
      const corruptedCount = clientGroups.reduce((sum, client) => 
        sum + client.companies.reduce((compSum, company) => 
          compSum + company.projects.reduce((projSum, project) => 
            projSum + project.documents.filter(doc => doc.corruption_detected).length, 0), 0), 0);

      const mockInsights = `🔧 Análisis de Gestión Manual ConstructIA:

1. **Cola Activa**: ${totalDocuments} documentos en cola, ${corruptedCount} corruptos detectados automáticamente por IA.

2. **Eficiencia**: Promedio de 12 docs/hora por cliente, recomiendo procesar en lotes por proyecto para optimizar tiempo.

3. **Priorización**: IA ha identificado documentos urgentes que requieren procesamiento inmediato antes que otros.`;
      
      setAiInsights(mockInsights);
    } catch (error) {
      setAiInsights('Error al generar insights. La API de Gemini está temporalmente no disponible.');
    } finally {
      setLoading(false);
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

  const handleConnectObralia = (client: ClientGroup, documents: ManualDocument[]) => {
    console.log('handleConnectObralia called');
    console.log('Client:', client.client_name);
    console.log('Documents received:', documents);
    console.log('Documents count:', documents.length);
    
    setSelectedClient(client);
    setSelectedDocuments(documents);
    setShowObraliaModal(true);
  };

  const handleUploadComplete = (documentIds: string[]) => {
    // Actualizar estado de documentos subidos
    setClientGroups(prev => prev.map(client => ({
      ...client,
      companies: client.companies.map(company => ({
        ...company,
        projects: company.projects.map(project => ({
          ...project,
          documents: project.documents.map(doc => 
            documentIds.includes(doc.id) 
              ? { ...doc, upload_status: 'uploaded' as const, updated_at: new Date().toISOString() }
              : doc
          )
        }))
      }))
    })));
  };

  const handleStatusChange = (documentId: string, newStatus: string) => {
    setClientGroups(prev => prev.map(client => ({
      ...client,
      companies: client.companies.map(company => ({
        ...company,
        projects: company.projects.map(project => ({
          ...project,
          documents: project.documents.map(doc => 
            doc.id === documentId 
              ? { ...doc, upload_status: newStatus as any, updated_at: new Date().toISOString() }
              : doc
          )
        }))
      }))
    })));
  };

  const handleFileDrop = (files: File[], clientId: string, companyId: string, projectId: string) => {
    console.log('Archivos arrastrados:', files, 'para cliente:', clientId, 'empresa:', companyId, 'proyecto:', projectId);
    // Aquí se procesarían los archivos arrastrados
    alert(`${files.length} archivo(s) añadido(s) a la cola para procesamiento`);
  };

  // Calcular KPIs en tiempo real
  const allDocuments = clientGroups.flatMap(client => 
    client.companies.flatMap(company => 
      company.projects.flatMap(project => project.documents)
    )
  );

  const kpis = [
    {
      title: 'Total en Cola',
      value: allDocuments.length.toString(),
      icon: FileText,
      color: 'bg-blue-500',
      status: 'good' as const
    },
    {
      title: 'Pendientes',
      value: allDocuments.filter(d => d.upload_status === 'pending').length.toString(),
      icon: Clock,
      color: 'bg-yellow-500',
      status: 'warning' as const
    },
    {
      title: 'Subidos Hoy',
      value: allDocuments.filter(d => d.upload_status === 'uploaded').length.toString(),
      icon: CheckCircle,
      color: 'bg-green-500',
      status: 'good' as const
    },
    {
      title: 'Corruptos',
      value: allDocuments.filter(d => d.corruption_detected).length.toString(),
      icon: AlertTriangle,
      color: 'bg-red-500',
      status: 'error' as const
    },
    {
      title: 'En Progreso',
      value: allDocuments.filter(d => d.upload_status === 'uploading').length.toString(),
      icon: Upload,
      color: 'bg-purple-500',
      status: 'good' as const
    },
    {
      title: 'Validados',
      value: allDocuments.filter(d => d.upload_status === 'validated').length.toString(),
      icon: Shield,
      color: 'bg-emerald-500',
      status: 'good' as const
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header con IA */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Gestión Manual de Documentos</h2>
            <p className="text-orange-100 mt-1">Cola operativa con conexión directa a Obralia/Nalanda</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              <span className="text-sm">
                {isProcessing ? 'Sesión Activa' : 'Sesión Inactiva'}
              </span>
            </div>
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
            <h3 className="font-semibold mb-2">🔧 Insights Operativos IA:</h3>
            <div className="text-sm text-white/90 whitespace-pre-line">{aiInsights}</div>
          </div>
        )}
      </div>

      {/* KPIs en Tiempo Real */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Métricas en Tiempo Real</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {kpis.map((kpi, index) => (
            <ManualKPICard key={index} {...kpi} />
          ))}
        </div>
      </div>

      {/* Controles Operativos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Controles Operativos</h3>
          <div className="flex space-x-3">
            <button
              onClick={() => setIsProcessing(!isProcessing)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center ${
                isProcessing 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isProcessing ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pausar Sesión
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Iniciar Sesión
                </>
              )}
            </button>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Exportar Cola
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar cliente, empresa, proyecto o documento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendientes</option>
            <option value="uploading">Subiendo</option>
            <option value="uploaded">Subidos</option>
            <option value="validated">Validados</option>
            <option value="error">Errores</option>
            <option value="corrupted">Corruptos</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">Todas las prioridades</option>
            <option value="urgent">Urgente</option>
            <option value="high">Alta</option>
            <option value="normal">Normal</option>
            <option value="low">Baja</option>
          </select>
        </div>
      </div>

      {/* Tabla Operativa */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sel</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Documento</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Cola #</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Análisis IA</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Integridad</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Reintentos</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clientGroups.map((client) => (
                <ClientRow
                  key={client.client_id}
                  client={client}
                  isExpanded={expandedClients.has(client.client_id)}
                  onToggle={() => toggleClientExpansion(client.client_id)}
                  onConnectObralia={handleConnectObralia}
                  onStatusChange={handleStatusChange}
                  onDrop={handleFileDrop}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Información de Ayuda */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start">
          <Info className="h-6 w-6 text-blue-600 mr-3 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-800 mb-2">Gestión Manual Operativa</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>Drag & Drop:</strong> Arrastra archivos directamente sobre las filas de proyectos</li>
              <li>• <strong>Acceso Directo Nalanda:</strong> Abre Nalanda en nueva pestaña con un clic</li>
              <li>• <strong>Credenciales Automáticas:</strong> Copia las credenciales del cliente al portapapeles</li>
              <li>• <strong>Procesamiento por Lotes:</strong> Selecciona múltiples documentos para subida masiva</li>
              <li>• <strong>IA Integrada:</strong> Detecta automáticamente archivos corruptos y prioriza</li>
              <li>• <strong>Organización Jerárquica:</strong> Cliente → Empresa → Proyecto → Documentos</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modal de Conexión Obralia */}
      {showObraliaModal && selectedClient && (
        <ObraliaConnectionModal
          isOpen={showObraliaModal}
          onClose={() => setShowObraliaModal(false)}
          clientCredentials={selectedClient.obralia_credentials}
          clientName={selectedClient.client_name}
          documentsToUpload={selectedDocuments}
          onUploadComplete={handleUploadComplete}
        />
      )}
    </div>
  );
}

      {/* KPIs en Tiempo Real */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Métricas en Tiempo Real</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {kpis.map((kpi, index) => (
            <ManualKPICard key={index} {...kpi} />
          ))}
        </div>
      </div>

      {/* Controles Operativos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Controles Operativos</h3>
          <div className="flex space-x-3">
            <button
              onClick={() => setIsProcessing(!isProcessing)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center ${
                isProcessing 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isProcessing ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pausar Sesión
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Iniciar Sesión
                </>
              )}
            </button>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Exportar Cola
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar cliente, empresa, proyecto o documento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendientes</option>
            <option value="uploading">Subiendo</option>
            <option value="uploaded">Subidos</option>
            <option value="validated">Validados</option>
            <option value="error">Errores</option>
            <option value="corrupted">Corruptos</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">Todas las prioridades</option>
            <option value="urgent">Urgente</option>
            <option value="high">Alta</option>
            <option value="normal">Normal</option>
            <option value="low">Baja</option>
          </select>
        </div>
      </div>

      {/* Tabla Operativa */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sel</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Documento</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Cola #</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Análisis IA</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Integridad</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Reintentos</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clientGroups.map((client) => (
                <ClientRow
                  key={client.client_id}
                  client={client}
                  isExpanded={expandedClients.has(client.client_id)}
                  onToggle={() => toggleClientExpansion(client.client_id)}
                  onConnectObralia={handleConnectObralia}
                  onStatusChange={handleStatusChange}
                  onDrop={handleFileDrop}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Información de Ayuda */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start">
          <Info className="h-6 w-6 text-blue-600 mr-3 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-800 mb-2">Gestión Manual Operativa</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>Drag & Drop:</strong> Arrastra archivos directamente sobre las filas de proyectos</li>
              <li>• <strong>Acceso Directo Nalanda:</strong> Abre Nalanda en nueva pestaña con un clic</li>
              <li>• <strong>Credenciales Automáticas:</strong> Copia las credenciales del cliente al portapapeles</li>
              <li>• <strong>Procesamiento por Lotes:</strong> Selecciona múltiples documentos para subida masiva</li>
              <li>• <strong>IA Integrada:</strong> Detecta automáticamente archivos corruptos y prioriza</li>
              <li>• <strong>Organización Jerárquica:</strong> Cliente → Empresa → Proyecto → Documentos</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modal de Conexión Obralia */}
      {showObraliaModal && selectedClient && (
        <ObraliaConnectionModal
          isOpen={showObraliaModal}
          onClose={() => setShowObraliaModal(false)}
          clientCredentials={selectedClient.obralia_credentials}
          clientName={selectedClient.client_name}
          documentsToUpload={selectedDocuments}
          onUploadComplete={handleUploadComplete}
        />
      )}
    </div>
  );
}