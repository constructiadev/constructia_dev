import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Users, 
  Building2, 
  FolderOpen, 
  Search, 
  Filter, 
  Eye, 
  Upload, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Brain, 
  Settings, 
  RefreshCw, 
  Download, 
  Play, 
  Pause, 
  SkipForward, 
  Trash2, 
  Edit, 
  Globe, 
  Shield, 
  Zap, 
  Database, 
  TrendingUp, 
  BarChart3, 
  Activity, 
  HardDrive, 
  Cpu, 
  Server, 
  Monitor, 
  Terminal, 
  Code, 
  Key, 
  Lock, 
  Unlock, 
  Calendar, 
  Mail, 
  Phone, 
  MapPin, 
  Hash, 
  Info, 
  FileWarning as Warning, 
  X, 
  Plus, 
  Minus, 
  ArrowUp, 
  ArrowDown, 
  RotateCcw, 
  Save, 
  Send, 
  Archive, 
  Flag, 
  Star, 
  Bookmark, 
  ChevronDown, 
  ChevronRight, 
  ExternalLink, 
  Copy 
} from 'lucide-react';
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
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copying' | 'success' | 'error'>('idle');

  // URL directa de Nalanda para acceso rápido
  const NALANDA_LOGIN_URL = 'https://identity.nalandaglobal.com/realms/nalanda/protocol/openid-connect/auth?ui_locales=es+en+pt&scope=openid&response_type=code&nln_action=redirect&redirect_uri=https%3A%2F%2Fapp.nalandaglobal.com%2FcuadroMandoSubcontratistaByPropietario%21executeLegacy.action%3FcifPropietarioObra%3DA28233534&state=tEO5k9LKsYgxxFseUPQukwYcxwAf9RQWup79Qkk_XGg&nonce=-nbdOhp9ZiDn0J3BFOvdhlebtygGGeO8CAzTN5BNnsk&client_id=nalanda-app';

  const openNalandaDirect = () => {
    // Abrir Nalanda en nueva ventana con dimensiones específicas
    const nalandaWindow = window.open(
      NALANDA_LOGIN_URL, 
      'nalanda_login', 
      'width=1400,height=900,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no'
    );
    
    if (nalandaWindow) {
      // Enfocar la ventana
      nalandaWindow.focus();
      
      // Mostrar instrucciones al usuario
      setTimeout(() => {
        alert(`✅ Nalanda abierto en nueva ventana.\n\n📋 Credenciales preparadas:\n👤 Usuario: ${clientCredentials.username}\n🔑 Contraseña: ${clientCredentials.password}\n\n💡 Usa los botones de copia individual para cada campo.`);
      }, 1000);
    } else {
      alert('❌ No se pudo abrir Nalanda. Verifica que no esté bloqueado por el navegador.');
    }
  };

  const copyToClipboard = async (text: string, fieldName: string) => {
    setCopyStatus('copying');
    
    try {
      // Método 1: Clipboard API moderno
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        setCopyStatus('success');
        
        // Mostrar confirmación específica
        const notification = document.createElement('div');
        notification.innerHTML = `
          <div style="
            position: fixed; 
            top: 20px; 
            right: 20px; 
            background: #10b981; 
            color: white; 
            padding: 12px 20px; 
            border-radius: 8px; 
            font-weight: 600; 
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          ">
            ✅ ${fieldName} copiado: ${text}
          </div>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
          document.body.removeChild(notification);
          setCopyStatus('idle');
        }, 3000);
        
      } else {
        // Método 2: Fallback para navegadores antiguos
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
          setCopyStatus('success');
          alert(`✅ ${fieldName} copiado: ${text}`);
        } else {
          throw new Error('Comando de copia falló');
        }
        
        setTimeout(() => setCopyStatus('idle'), 2000);
      }
      
    } catch (error) {
      console.error('Error copiando al portapapeles:', error);
      setCopyStatus('error');
      
      // Mostrar las credenciales en un prompt como fallback
      prompt(`❌ Error al copiar. ${fieldName} (selecciona y copia manualmente):`, text);
      
      setTimeout(() => setCopyStatus('idle'), 2000);
    }
  };

  const copyCredentialsSequence = async () => {
    setCopyStatus('copying');
    
    try {
      // Secuencia de copia mejorada
      await copyToClipboard(clientCredentials.username, 'Usuario');
      
      // Esperar un momento antes de la siguiente copia
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await copyToClipboard(clientCredentials.password, 'Contraseña');
      
      // Instrucciones detalladas
      setTimeout(() => {
        alert(`🎯 SECUENCIA DE PEGADO RECOMENDADA:\n\n1️⃣ Ve a la ventana de Nalanda\n2️⃣ Haz clic en el campo Usuario\n3️⃣ Pega (Ctrl+V): ${clientCredentials.username}\n4️⃣ Haz clic en el campo Contraseña\n5️⃣ Pega (Ctrl+V): ${clientCredentials.password}\n6️⃣ Presiona Enter o clic en Iniciar Sesión\n\n💡 Si no funciona, usa los botones de copia individual.`);
      }, 500);
      
    } catch (error) {
      console.error('Error en secuencia de copia:', error);
      setCopyStatus('error');
    }
  };

  const connectToObralia = async () => {
    setIsConnecting(true);
    try {
      // Simular conexión a Obralia
      await new Promise(resolve => setTimeout(resolve, 2000));
      setConnectionStatus('connected');
      alert(`✅ Conectado exitosamente a Obralia como ${clientCredentials.username}`);
    } catch (error) {
      setConnectionStatus('error');
      alert('❌ Error al conectar con Obralia. Verifica las credenciales.');
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
      alert(`✅ ${documentsToUpload.length} documentos subidos exitosamente a Obralia`);
      onClose();
    } catch (error) {
      alert('❌ Error durante la subida de documentos');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">
            🔗 Conexión Manual a Obralia/Nalanda
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
                📄 {documentsToUpload.length} documentos seleccionados para subida
              </p>
            </div>
          </div>
        </div>

        {/* Credenciales Mejoradas con Copia Individual */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Key className="h-5 w-5 text-orange-600 mr-3" />
              <h4 className="font-semibold text-orange-800">Credenciales de Acceso</h4>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={copyCredentialsSequence}
                disabled={copyStatus === 'copying'}
                className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm disabled:opacity-50"
              >
                {copyStatus === 'copying' ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                ) : (
                  <Copy className="h-3 w-3 mr-1" />
                )}
                Secuencia Completa
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
          
          {/* Credenciales con Copia Individual */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-orange-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-orange-800">👤 Usuario:</span>
                <button
                  onClick={() => copyToClipboard(clientCredentials.username, 'Usuario')}
                  disabled={copyStatus === 'copying'}
                  className="flex items-center px-2 py-1 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded text-xs transition-colors disabled:opacity-50"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copiar
                </button>
              </div>
              <div className="bg-orange-100 p-3 rounded border-2 border-dashed border-orange-300">
                <p className="text-orange-900 font-mono text-lg font-bold break-all select-all">
                  {clientCredentials.username}
                </p>
              </div>
            </div>
            
            <div className="bg-white border border-orange-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-orange-800">🔑 Contraseña:</span>
                <button
                  onClick={() => copyToClipboard(clientCredentials.password, 'Contraseña')}
                  disabled={copyStatus === 'copying'}
                  className="flex items-center px-2 py-1 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded text-xs transition-colors disabled:opacity-50"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copiar
                </button>
              </div>
              <div className="bg-orange-100 p-3 rounded border-2 border-dashed border-orange-300">
                <p className="text-orange-900 font-mono text-lg font-bold break-all select-all">
                  {clientCredentials.password}
                </p>
              </div>
            </div>
          </div>

          {/* Instrucciones de Uso */}
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h5 className="font-semibold text-yellow-800 mb-2">📋 Instrucciones de Uso:</h5>
            <ol className="text-sm text-yellow-700 space-y-1">
              <li><strong>1.</strong> Haz clic en "Abrir Nalanda" para abrir la ventana de login</li>
              <li><strong>2.</strong> Usa "Copiar" individual para cada campo (Usuario y Contraseña)</li>
              <li><strong>3.</strong> Pega en Nalanda con Ctrl+V en cada campo</li>
              <li><strong>4.</strong> Si falla, selecciona manualmente el texto y copia con Ctrl+C</li>
            </ol>
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
              {isConnecting ? '🔄 Conectando...' : '🔗 Conectar a Obralia'}
            </button>
          )}
        </div>

        {/* Documents to Upload */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-700 mb-3">
            📁 Documentos a Subir ({documentsToUpload.length})
          </h4>
          <div className="max-h-40 overflow-y-auto space-y-2">
            {documentsToUpload.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 text-blue-600 mr-2" />
                  <div>
                    <span className="text-sm font-medium">{doc.original_name}</span>
                    <p className="text-xs text-gray-500">{doc.classification} • {doc.confidence}% confianza</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    doc.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                    doc.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                    doc.priority === 'normal' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {doc.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">📤 Progreso de Subida</span>
              <span className="text-sm text-gray-600">{Math.round(uploadProgress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-green-500 h-3 rounded-full transition-all duration-300 flex items-center justify-center"
                style={{ width: `${uploadProgress}%` }}
              >
                {uploadProgress > 20 && (
                  <span className="text-white text-xs font-bold">
                    {Math.round(uploadProgress)}%
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            ❌ Cancelar
          </button>
          <button
            onClick={uploadDocuments}
            disabled={connectionStatus !== 'connected' || isUploading}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            {isUploading ? '📤 Subiendo...' : `📤 Subir ${documentsToUpload.length} Documentos`}
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

  const pendingDocuments = allDocuments.filter(doc => 
    doc.upload_status === 'pending' || doc.upload_status === 'error'
  );

  const handleSelectAll = () => {
    if (selectedDocuments.length === pendingDocuments.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(pendingDocuments.map(d => d.id));
    }
  };

  const handleDocumentSelect = (documentId: string) => {
    setSelectedDocuments(prev => 
      prev.includes(documentId) 
        ? prev.filter(id => id !== documentId)
        : [...prev, documentId]
    );
  };

  const getSelectedDocuments = () => {
    return allDocuments.filter(doc => selectedDocuments.includes(doc.id));
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
                    👤 {client.obralia_credentials.username}
                  </p>
                  <p className="text-xs text-green-600">🔑 Credenciales OK</p>
                </div>
              </div>
              
              {/* Stats */}
              <div className="text-center">
                <p className="text-lg font-bold text-blue-900">{client.total_documents}</p>
                <p className="text-xs text-blue-700">📄 Documentos</p>
              </div>
              
              <div className="text-center">
                <p className="text-lg font-bold text-green-600">{pendingDocuments.length}</p>
                <p className="text-xs text-green-700">⏳ Pendientes</p>
              </div>
              
              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={handleSelectAll}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                >
                  {selectedDocuments.length === pendingDocuments.length ? '❌ Deseleccionar' : '✅ Seleccionar'} Todo
                </button>
                <button
                  onClick={() => onConnectObralia(client, getSelectedDocuments())}
                  disabled={selectedDocuments.length === 0}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm disabled:opacity-50 flex items-center"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  🔗 Conectar ({selectedDocuments.length})
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
                  <span className="font-medium text-green-800">🏢 {company.company_name}</span>
                </div>
                <span className="text-sm text-green-700">📊 {company.total_documents} documentos</span>
              </div>
            </td>
          </tr>

          {/* Projects and Documents */}
          {company.projects.map((project) => (
            <React.Fragment key={project.project_id}>
              {/* Project Header with Drop Zone */}
              <tr className="bg-purple-50">
                <td colSpan={8} className="px-16 py-2">
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
                />
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
      className={`flex items-center justify-between p-3 rounded-lg transition-all cursor-pointer ${
        isDragActive 
          ? 'bg-purple-200 border-2 border-dashed border-purple-400 transform scale-105' 
          : 'hover:bg-purple-100 border border-purple-200'
      }`}
    >
      <input {...getInputProps()} />
      <div className="flex items-center">
        <FolderOpen className="h-4 w-4 text-purple-600 mr-2" />
        <span className="font-medium text-purple-800">📁 {projectName}</span>
        {isDragActive && (
          <span className="ml-3 text-purple-600 font-bold animate-pulse">
            ⬇️ Suelta archivos aquí
          </span>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-sm text-purple-700">📊 {totalDocuments} documentos</span>
        {isDragActive ? (
          <Upload className="h-4 w-4 text-purple-600 animate-bounce" />
        ) : (
          <Plus className="h-4 w-4 text-purple-600" />
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
}

function DocumentRow({ document, isSelected, onSelect, onStatusChange }: DocumentRowProps) {
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

  const canSelect = document.upload_status === 'pending' || document.upload_status === 'error';

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
          onChange={onSelect}
          disabled={!canSelect}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
        />
      </td>

      {/* Document Info */}
      <td className="px-6 py-3">
        <div className="flex items-center">
          <FileText className="h-4 w-4 text-blue-600 mr-2" />
          <div>
            <p className="text-sm font-medium text-gray-900">{document.original_name}</p>
            <p className="text-xs text-gray-500">
              📏 {(document.file_size / 1024 / 1024).toFixed(2)} MB • 📄 {document.file_type}
            </p>
            {document.last_error && (
              <p className="text-xs text-red-600 mt-1">❌ {document.last_error}</p>
            )}
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
          <div className="text-xs text-gray-600">🎯 {document.confidence}% confianza</div>
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
            <option value="pending">⏳ Pendiente</option>
            <option value="uploading">📤 Subiendo</option>
            <option value="uploaded">✅ Subido</option>
            <option value="validated">🎯 Validado</option>
            <option value="error">❌ Error</option>
            <option value="corrupted">🚫 Corrupto</option>
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

  // Datos simulados expandidos - 10 clientes con 10-15 documentos cada uno
  const mockClientGroups: ClientGroup[] = [
    {
      client_id: 'cli_001',
      client_name: 'Construcciones García S.L.',
      client_email: 'juan@construccionesgarcia.com',
      obralia_credentials: {
        username: 'juan.garcia@obralia.com',
        password: 'Garcia2024!',
        configured: true
      },
      total_documents: 12,
      documents_per_hour: 8,
      last_activity: '2025-01-27T15:45:00Z',
      companies: [
        {
          company_id: 'comp_001',
          company_name: 'Construcciones García S.L.',
          total_documents: 12,
          projects: [
            {
              project_id: 'proj_001',
              project_name: 'Edificio Residencial Centro',
              total_documents: 7,
              documents: [
                {
                  id: 'doc_001', document_id: 'DOC-001', filename: 'certificado_obra_A.pdf', original_name: 'Certificado de Obra A.pdf',
                  file_size: 2456789, file_type: 'application/pdf', classification: 'Certificado', confidence: 92,
                  corruption_detected: false, integrity_score: 95, upload_status: 'pending', priority: 'urgent',
                  queue_position: 1, retry_count: 0, admin_notes: 'Documento urgente para proyecto crítico',
                  created_at: '2025-01-27T15:45:00Z', updated_at: '2025-01-27T15:45:00Z'
                },
                {
                  id: 'doc_002', document_id: 'DOC-002', filename: 'factura_materiales_B.pdf', original_name: 'Factura Materiales B.pdf',
                  file_size: 1234567, file_type: 'application/pdf', classification: 'Factura', confidence: 88,
                  corruption_detected: false, integrity_score: 88, upload_status: 'error', priority: 'high',
                  queue_position: 2, retry_count: 1, last_error: 'Timeout de conexión con Obralia', admin_notes: '',
                  created_at: '2025-01-27T15:42:00Z', updated_at: '2025-01-27T15:42:00Z'
                },
                {
                  id: 'doc_003', document_id: 'DOC-003', filename: 'dni_trabajador_C.pdf', original_name: 'DNI Trabajador C.pdf',
                  file_size: 987654, file_type: 'application/pdf', classification: 'DNI/Identificación', confidence: 96,
                  corruption_detected: false, integrity_score: 98, upload_status: 'pending', priority: 'normal',
                  queue_position: 3, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T15:40:00Z', updated_at: '2025-01-27T15:40:00Z'
                },
                {
                  id: 'doc_004', document_id: 'DOC-004', filename: 'contrato_subcontrata.pdf', original_name: 'Contrato Subcontrata.pdf',
                  file_size: 3456789, file_type: 'application/pdf', classification: 'Contrato', confidence: 94,
                  corruption_detected: false, integrity_score: 96, upload_status: 'pending', priority: 'normal',
                  queue_position: 4, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T15:35:00Z', updated_at: '2025-01-27T15:35:00Z'
                },
                {
                  id: 'doc_005', document_id: 'DOC-005', filename: 'seguro_obra.pdf', original_name: 'Seguro de Obra.pdf',
                  file_size: 1876543, file_type: 'application/pdf', classification: 'Seguro', confidence: 91,
                  corruption_detected: false, integrity_score: 93, upload_status: 'uploaded', priority: 'normal',
                  queue_position: 5, retry_count: 0, admin_notes: 'Subido exitosamente',
                  created_at: '2025-01-27T15:30:00Z', updated_at: '2025-01-27T15:30:00Z'
                },
                {
                  id: 'doc_006', document_id: 'DOC-006', filename: 'plano_estructural.pdf', original_name: 'Plano Estructural.pdf',
                  file_size: 5432109, file_type: 'application/pdf', classification: 'Plano/Técnico', confidence: 89,
                  corruption_detected: false, integrity_score: 92, upload_status: 'pending', priority: 'high',
                  queue_position: 6, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T15:25:00Z', updated_at: '2025-01-27T15:25:00Z'
                },
                {
                  id: 'doc_007', document_id: 'DOC-007', filename: 'documento_corrupto.pdf', original_name: 'Documento Corrupto.pdf',
                  file_size: 0, file_type: 'application/pdf', classification: 'unknown', confidence: 15,
                  corruption_detected: true, integrity_score: 0, upload_status: 'corrupted', priority: 'urgent',
                  queue_position: 7, retry_count: 3, last_error: 'Archivo corrupto o vacío detectado', 
                  admin_notes: 'Archivo corrupto detectado por IA - requiere revisión manual',
                  created_at: '2025-01-27T15:20:00Z', updated_at: '2025-01-27T15:20:00Z'
                }
              ]
            },
            {
              project_id: 'proj_002',
              project_name: 'Reforma Oficinas Norte',
              total_documents: 5,
              documents: [
                {
                  id: 'doc_008', document_id: 'DOC-008', filename: 'presupuesto_reforma.pdf', original_name: 'Presupuesto Reforma.pdf',
                  file_size: 2345678, file_type: 'application/pdf', classification: 'Presupuesto', confidence: 87,
                  corruption_detected: false, integrity_score: 90, upload_status: 'pending', priority: 'normal',
                  queue_position: 8, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T15:15:00Z', updated_at: '2025-01-27T15:15:00Z'
                },
                {
                  id: 'doc_009', document_id: 'DOC-009', filename: 'licencia_obras.pdf', original_name: 'Licencia de Obras.pdf',
                  file_size: 1567890, file_type: 'application/pdf', classification: 'Licencia', confidence: 95,
                  corruption_detected: false, integrity_score: 97, upload_status: 'pending', priority: 'high',
                  queue_position: 9, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T15:10:00Z', updated_at: '2025-01-27T15:10:00Z'
                },
                {
                  id: 'doc_010', document_id: 'DOC-010', filename: 'memoria_tecnica.pdf', original_name: 'Memoria Técnica.pdf',
                  file_size: 4567890, file_type: 'application/pdf', classification: 'Memoria Técnica', confidence: 93,
                  corruption_detected: false, integrity_score: 94, upload_status: 'error', priority: 'normal',
                  queue_position: 10, retry_count: 2, last_error: 'Error de validación en Obralia', admin_notes: '',
                  created_at: '2025-01-27T15:05:00Z', updated_at: '2025-01-27T15:05:00Z'
                },
                {
                  id: 'doc_011', document_id: 'DOC-011', filename: 'acta_replanteo.pdf', original_name: 'Acta de Replanteo.pdf',
                  file_size: 1890123, file_type: 'application/pdf', classification: 'Acta', confidence: 90,
                  corruption_detected: false, integrity_score: 91, upload_status: 'pending', priority: 'normal',
                  queue_position: 11, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T15:00:00Z', updated_at: '2025-01-27T15:00:00Z'
                },
                {
                  id: 'doc_012', document_id: 'DOC-012', filename: 'certificado_calidad.pdf', original_name: 'Certificado de Calidad.pdf',
                  file_size: 2123456, file_type: 'application/pdf', classification: 'Certificado', confidence: 94,
                  corruption_detected: false, integrity_score: 96, upload_status: 'validated', priority: 'normal',
                  queue_position: 12, retry_count: 0, admin_notes: 'Validado correctamente en Obralia',
                  created_at: '2025-01-27T14:55:00Z', updated_at: '2025-01-27T14:55:00Z'
                }
              ]
            }
          ]
        }
      ]
    },
    {
      client_id: 'cli_002',
      client_name: 'Obras Públicas del Norte S.A.',
      client_email: 'maria@obrasnorte.es',
      obralia_credentials: {
        username: 'maria.lopez@nalanda.es',
        password: 'Norte2024#',
        configured: true
      },
      total_documents: 15,
      documents_per_hour: 12,
      last_activity: '2025-01-27T15:30:00Z',
      companies: [
        {
          company_id: 'comp_002',
          company_name: 'Obras Públicas del Norte S.A.',
          total_documents: 15,
          projects: [
            {
              project_id: 'proj_003',
              project_name: 'Puente Industrial A-7',
              total_documents: 10,
              documents: [
                {
                  id: 'doc_013', document_id: 'DOC-013', filename: 'estudio_geotecnico.pdf', original_name: 'Estudio Geotécnico.pdf',
                  file_size: 8765432, file_type: 'application/pdf', classification: 'Estudio Técnico', confidence: 97,
                  corruption_detected: false, integrity_score: 98, upload_status: 'pending', priority: 'urgent',
                  queue_position: 13, retry_count: 0, admin_notes: 'Documento crítico para cimentación',
                  created_at: '2025-01-27T14:50:00Z', updated_at: '2025-01-27T14:50:00Z'
                },
                {
                  id: 'doc_014', document_id: 'DOC-014', filename: 'proyecto_basico.pdf', original_name: 'Proyecto Básico.pdf',
                  file_size: 12345678, file_type: 'application/pdf', classification: 'Proyecto', confidence: 95,
                  corruption_detected: false, integrity_score: 97, upload_status: 'pending', priority: 'urgent',
                  queue_position: 14, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T14:45:00Z', updated_at: '2025-01-27T14:45:00Z'
                },
                {
                  id: 'doc_015', document_id: 'DOC-015', filename: 'calculo_estructural.pdf', original_name: 'Cálculo Estructural.pdf',
                  file_size: 6789012, file_type: 'application/pdf', classification: 'Cálculo', confidence: 92,
                  corruption_detected: false, integrity_score: 94, upload_status: 'error', priority: 'high',
                  queue_position: 15, retry_count: 1, last_error: 'Archivo demasiado grande para Obralia', admin_notes: '',
                  created_at: '2025-01-27T14:40:00Z', updated_at: '2025-01-27T14:40:00Z'
                },
                {
                  id: 'doc_016', document_id: 'DOC-016', filename: 'informe_impacto.pdf', original_name: 'Informe de Impacto Ambiental.pdf',
                  file_size: 4321098, file_type: 'application/pdf', classification: 'Informe', confidence: 89,
                  corruption_detected: false, integrity_score: 91, upload_status: 'pending', priority: 'normal',
                  queue_position: 16, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T14:35:00Z', updated_at: '2025-01-27T14:35:00Z'
                },
                {
                  id: 'doc_017', document_id: 'DOC-017', filename: 'autorizacion_trafico.pdf', original_name: 'Autorización de Tráfico.pdf',
                  file_size: 1098765, file_type: 'application/pdf', classification: 'Autorización', confidence: 93,
                  corruption_detected: false, integrity_score: 95, upload_status: 'pending', priority: 'high',
                  queue_position: 17, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T14:30:00Z', updated_at: '2025-01-27T14:30:00Z'
                },
                {
                  id: 'doc_018', document_id: 'DOC-018', filename: 'mediciones_obra.pdf', original_name: 'Mediciones de Obra.pdf',
                  file_size: 3210987, file_type: 'application/pdf', classification: 'Medición', confidence: 91,
                  corruption_detected: false, integrity_score: 93, upload_status: 'uploaded', priority: 'normal',
                  queue_position: 18, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T14:25:00Z', updated_at: '2025-01-27T14:25:00Z'
                },
                {
                  id: 'doc_019', document_id: 'DOC-019', filename: 'plan_seguridad.pdf', original_name: 'Plan de Seguridad y Salud.pdf',
                  file_size: 5678901, file_type: 'application/pdf', classification: 'Plan de Seguridad', confidence: 96,
                  corruption_detected: false, integrity_score: 97, upload_status: 'pending', priority: 'urgent',
                  queue_position: 19, retry_count: 0, admin_notes: 'Obligatorio antes del inicio de obras',
                  created_at: '2025-01-27T14:20:00Z', updated_at: '2025-01-27T14:20:00Z'
                },
                {
                  id: 'doc_020', document_id: 'DOC-020', filename: 'ensayos_materiales.pdf', original_name: 'Ensayos de Materiales.pdf',
                  file_size: 2987654, file_type: 'application/pdf', classification: 'Ensayo', confidence: 88,
                  corruption_detected: false, integrity_score: 89, upload_status: 'error', priority: 'normal',
                  queue_position: 20, retry_count: 2, last_error: 'Formato no reconocido por Obralia', admin_notes: '',
                  created_at: '2025-01-27T14:15:00Z', updated_at: '2025-01-27T14:15:00Z'
                },
                {
                  id: 'doc_021', document_id: 'DOC-021', filename: 'topografia_terreno.pdf', original_name: 'Topografía del Terreno.pdf',
                  file_size: 7654321, file_type: 'application/pdf', classification: 'Topografía', confidence: 94,
                  corruption_detected: false, integrity_score: 95, upload_status: 'pending', priority: 'normal',
                  queue_position: 21, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T14:10:00Z', updated_at: '2025-01-27T14:10:00Z'
                },
                {
                  id: 'doc_022', document_id: 'DOC-022', filename: 'control_calidad.pdf', original_name: 'Control de Calidad.pdf',
                  file_size: 1543210, file_type: 'application/pdf', classification: 'Control', confidence: 90,
                  corruption_detected: false, integrity_score: 92, upload_status: 'validated', priority: 'normal',
                  queue_position: 22, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T14:05:00Z', updated_at: '2025-01-27T14:05:00Z'
                }
              ]
            },
            {
              project_id: 'proj_004',
              project_name: 'Rehabilitación Carretera N-340',
              total_documents: 5,
              documents: [
                {
                  id: 'doc_023', document_id: 'DOC-023', filename: 'estudio_trafico.pdf', original_name: 'Estudio de Tráfico.pdf',
                  file_size: 4567123, file_type: 'application/pdf', classification: 'Estudio', confidence: 91,
                  corruption_detected: false, integrity_score: 93, upload_status: 'pending', priority: 'high',
                  queue_position: 23, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T14:00:00Z', updated_at: '2025-01-27T14:00:00Z'
                },
                {
                  id: 'doc_024', document_id: 'DOC-024', filename: 'firmes_pavimentos.pdf', original_name: 'Firmes y Pavimentos.pdf',
                  file_size: 3456789, file_type: 'application/pdf', classification: 'Especificación', confidence: 89,
                  corruption_detected: false, integrity_score: 91, upload_status: 'pending', priority: 'normal',
                  queue_position: 24, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T13:55:00Z', updated_at: '2025-01-27T13:55:00Z'
                },
                {
                  id: 'doc_025', document_id: 'DOC-025', filename: 'senalizacion_vial.pdf', original_name: 'Señalización Vial.pdf',
                  file_size: 2109876, file_type: 'application/pdf', classification: 'Señalización', confidence: 92,
                  corruption_detected: false, integrity_score: 94, upload_status: 'uploaded', priority: 'normal',
                  queue_position: 25, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T13:50:00Z', updated_at: '2025-01-27T13:50:00Z'
                },
                {
                  id: 'doc_026', document_id: 'DOC-026', filename: 'drenaje_pluvial.pdf', original_name: 'Sistema de Drenaje Pluvial.pdf',
                  file_size: 5432167, file_type: 'application/pdf', classification: 'Sistema', confidence: 88,
                  corruption_detected: false, integrity_score: 90, upload_status: 'pending', priority: 'normal',
                  queue_position: 26, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T13:45:00Z', updated_at: '2025-01-27T13:45:00Z'
                },
                {
                  id: 'doc_027', document_id: 'DOC-027', filename: 'presupuesto_final.pdf', original_name: 'Presupuesto Final.pdf',
                  file_size: 2876543, file_type: 'application/pdf', classification: 'Presupuesto', confidence: 95,
                  corruption_detected: false, integrity_score: 96, upload_status: 'pending', priority: 'high',
                  queue_position: 27, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T13:40:00Z', updated_at: '2025-01-27T13:40:00Z'
                }
              ]
            }
          ]
        }
      ]
    },
    {
      client_id: 'cli_003',
      client_name: 'Reformas Integrales López',
      client_email: 'carlos@reformaslopez.com',
      obralia_credentials: {
        username: 'carlos.lopez@obralia.com',
        password: 'Lopez2024$',
        configured: true
      },
      total_documents: 11,
      documents_per_hour: 6,
      last_activity: '2025-01-27T15:20:00Z',
      companies: [
        {
          company_id: 'comp_003',
          company_name: 'Reformas Integrales López',
          total_documents: 11,
          projects: [
            {
              project_id: 'proj_005',
              project_name: 'Centro Comercial Valencia',
              total_documents: 6,
              documents: [
                {
                  id: 'doc_028', document_id: 'DOC-028', filename: 'proyecto_arquitectonico.pdf', original_name: 'Proyecto Arquitectónico.pdf',
                  file_size: 9876543, file_type: 'application/pdf', classification: 'Proyecto', confidence: 96,
                  corruption_detected: false, integrity_score: 97, upload_status: 'pending', priority: 'urgent',
                  queue_position: 28, retry_count: 0, admin_notes: 'Proyecto principal del centro comercial',
                  created_at: '2025-01-27T13:35:00Z', updated_at: '2025-01-27T13:35:00Z'
                },
                {
                  id: 'doc_029', document_id: 'DOC-029', filename: 'instalaciones_electricas.pdf', original_name: 'Instalaciones Eléctricas.pdf',
                  file_size: 4321567, file_type: 'application/pdf', classification: 'Instalación', confidence: 93,
                  corruption_detected: false, integrity_score: 94, upload_status: 'pending', priority: 'high',
                  queue_position: 29, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T13:30:00Z', updated_at: '2025-01-27T13:30:00Z'
                },
                {
                  id: 'doc_030', document_id: 'DOC-030', filename: 'climatizacion_hvac.pdf', original_name: 'Sistema de Climatización HVAC.pdf',
                  file_size: 3567890, file_type: 'application/pdf', classification: 'Sistema HVAC', confidence: 91,
                  corruption_detected: false, integrity_score: 92, upload_status: 'error', priority: 'normal',
                  queue_position: 30, retry_count: 1, last_error: 'Documento muy técnico, requiere revisión', admin_notes: '',
                  created_at: '2025-01-27T13:25:00Z', updated_at: '2025-01-27T13:25:00Z'
                },
                {
                  id: 'doc_031', document_id: 'DOC-031', filename: 'proteccion_incendios.pdf', original_name: 'Protección contra Incendios.pdf',
                  file_size: 2890123, file_type: 'application/pdf', classification: 'Protección', confidence: 94,
                  corruption_detected: false, integrity_score: 95, upload_status: 'pending', priority: 'urgent',
                  queue_position: 31, retry_count: 0, admin_notes: 'Obligatorio para licencia de apertura',
                  created_at: '2025-01-27T13:20:00Z', updated_at: '2025-01-27T13:20:00Z'
                },
                {
                  id: 'doc_032', document_id: 'DOC-032', filename: 'accesibilidad_universal.pdf', original_name: 'Accesibilidad Universal.pdf',
                  file_size: 1765432, file_type: 'application/pdf', classification: 'Accesibilidad', confidence: 90,
                  corruption_detected: false, integrity_score: 91, upload_status: 'uploaded', priority: 'normal',
                  queue_position: 32, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T13:15:00Z', updated_at: '2025-01-27T13:15:00Z'
                },
                {
                  id: 'doc_033', document_id: 'DOC-033', filename: 'eficiencia_energetica.pdf', original_name: 'Certificado Eficiencia Energética.pdf',
                  file_size: 2543210, file_type: 'application/pdf', classification: 'Certificado', confidence: 95,
                  corruption_detected: false, integrity_score: 96, upload_status: 'validated', priority: 'normal',
                  queue_position: 33, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T13:10:00Z', updated_at: '2025-01-27T13:10:00Z'
                }
              ]
            },
            {
              project_id: 'proj_006',
              project_name: 'Rehabilitación Edificio Histórico',
              total_documents: 5,
              documents: [
                {
                  id: 'doc_034', document_id: 'DOC-034', filename: 'estudio_historico.pdf', original_name: 'Estudio Histórico-Artístico.pdf',
                  file_size: 6543210, file_type: 'application/pdf', classification: 'Estudio Histórico', confidence: 87,
                  corruption_detected: false, integrity_score: 89, upload_status: 'pending', priority: 'high',
                  queue_position: 34, retry_count: 0, admin_notes: 'Patrimonio histórico protegido',
                  created_at: '2025-01-27T13:05:00Z', updated_at: '2025-01-27T13:05:00Z'
                },
                {
                  id: 'doc_035', document_id: 'DOC-035', filename: 'intervencion_estructural.pdf', original_name: 'Intervención Estructural.pdf',
                  file_size: 4210987, file_type: 'application/pdf', classification: 'Intervención', confidence: 92,
                  corruption_detected: false, integrity_score: 93, upload_status: 'pending', priority: 'urgent',
                  queue_position: 35, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T13:00:00Z', updated_at: '2025-01-27T13:00:00Z'
                },
                {
                  id: 'doc_036', document_id: 'DOC-036', filename: 'conservacion_fachada.pdf', original_name: 'Conservación de Fachada.pdf',
                  file_size: 3876543, file_type: 'application/pdf', classification: 'Conservación', confidence: 89,
                  corruption_detected: false, integrity_score: 90, upload_status: 'error', priority: 'normal',
                  queue_position: 36, retry_count: 1, last_error: 'Requiere autorización de patrimonio', admin_notes: '',
                  created_at: '2025-01-27T12:55:00Z', updated_at: '2025-01-27T12:55:00Z'
                },
                {
                  id: 'doc_037', document_id: 'DOC-037', filename: 'restauracion_cubiertas.pdf', original_name: 'Restauración de Cubiertas.pdf',
                  file_size: 2654321, file_type: 'application/pdf', classification: 'Restauración', confidence: 91,
                  corruption_detected: false, integrity_score: 92, upload_status: 'pending', priority: 'normal',
                  queue_position: 37, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T12:50:00Z', updated_at: '2025-01-27T12:50:00Z'
                },
                {
                  id: 'doc_038', document_id: 'DOC-038', filename: 'memoria_valorada.pdf', original_name: 'Memoria Valorada.pdf',
                  file_size: 1987654, file_type: 'application/pdf', classification: 'Memoria', confidence: 93,
                  corruption_detected: false, integrity_score: 94, upload_status: 'uploaded', priority: 'normal',
                  queue_position: 38, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T12:45:00Z', updated_at: '2025-01-27T12:45:00Z'
                }
              ]
            }
          ]
        }
      ]
    },
    {
      client_id: 'cli_004',
      client_name: 'Constructora Mediterránea S.A.',
      client_email: 'ana@constructoramediterranea.com',
      obralia_credentials: {
        username: 'ana.martin@nalanda.es',
        password: 'Mediterranea2024!',
        configured: true
      },
      total_documents: 13,
      documents_per_hour: 10,
      last_activity: '2025-01-27T15:15:00Z',
      companies: [
        {
          company_id: 'comp_004',
          company_name: 'Constructora Mediterránea S.A.',
          total_documents: 13,
          projects: [
            {
              project_id: 'proj_007',
              project_name: 'Complejo Residencial Costa Brava',
              total_documents: 8,
              documents: [
                {
                  id: 'doc_039', document_id: 'DOC-039', filename: 'urbanizacion_completa.pdf', original_name: 'Proyecto de Urbanización Completa.pdf',
                  file_size: 15432109, file_type: 'application/pdf', classification: 'Urbanización', confidence: 97,
                  corruption_detected: false, integrity_score: 98, upload_status: 'pending', priority: 'urgent',
                  queue_position: 39, retry_count: 0, admin_notes: 'Proyecto master del complejo',
                  created_at: '2025-01-27T12:40:00Z', updated_at: '2025-01-27T12:40:00Z'
                },
                {
                  id: 'doc_040', document_id: 'DOC-040', filename: 'viviendas_tipo_a.pdf', original_name: 'Viviendas Tipo A.pdf',
                  file_size: 6789012, file_type: 'application/pdf', classification: 'Vivienda', confidence: 94,
                  corruption_detected: false, integrity_score: 95, upload_status: 'pending', priority: 'high',
                  queue_position: 40, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T12:35:00Z', updated_at: '2025-01-27T12:35:00Z'
                },
                {
                  id: 'doc_041', document_id: 'DOC-041', filename: 'viviendas_tipo_b.pdf', original_name: 'Viviendas Tipo B.pdf',
                  file_size: 6234567, file_type: 'application/pdf', classification: 'Vivienda', confidence: 93,
                  corruption_detected: false, integrity_score: 94, upload_status: 'pending', priority: 'high',
                  queue_position: 41, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T12:30:00Z', updated_at: '2025-01-27T12:30:00Z'
                },
                {
                  id: 'doc_042', document_id: 'DOC-042', filename: 'zonas_comunes.pdf', original_name: 'Zonas Comunes.pdf',
                  file_size: 4567890, file_type: 'application/pdf', classification: 'Zona Común', confidence: 91,
                  corruption_detected: false, integrity_score: 92, upload_status: 'error', priority: 'normal',
                  queue_position: 42, retry_count: 1, last_error: 'Planos demasiado detallados para procesamiento automático', admin_notes: '',
                  created_at: '2025-01-27T12:25:00Z', updated_at: '2025-01-27T12:25:00Z'
                },
                {
                  id: 'doc_043', document_id: 'DOC-043', filename: 'piscina_comunitaria.pdf', original_name: 'Piscina Comunitaria.pdf',
                  file_size: 3210987, file_type: 'application/pdf', classification: 'Instalación', confidence: 89,
                  corruption_detected: false, integrity_score: 90, upload_status: 'pending', priority: 'normal',
                  queue_position: 43, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T12:20:00Z', updated_at: '2025-01-27T12:20:00Z'
                },
                {
                  id: 'doc_044', document_id: 'DOC-044', filename: 'jardineria_paisajismo.pdf', original_name: 'Jardinería y Paisajismo.pdf',
                  file_size: 2876543, file_type: 'application/pdf', classification: 'Paisajismo', confidence: 86,
                  corruption_detected: false, integrity_score: 88, upload_status: 'uploaded', priority: 'low',
                  queue_position: 44, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T12:15:00Z', updated_at: '2025-01-27T12:15:00Z'
                },
                {
                  id: 'doc_045', document_id: 'DOC-045', filename: 'parking_subterraneo.pdf', original_name: 'Parking Subterráneo.pdf',
                  file_size: 5432109, file_type: 'application/pdf', classification: 'Parking', confidence: 92,
                  corruption_detected: false, integrity_score: 93, upload_status: 'pending', priority: 'normal',
                  queue_position: 45, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T12:10:00Z', updated_at: '2025-01-27T12:10:00Z'
                },
                {
                  id: 'doc_046', document_id: 'DOC-046', filename: 'ventilacion_garaje.pdf', original_name: 'Ventilación de Garaje.pdf',
                  file_size: 1654321, file_type: 'application/pdf', classification: 'Ventilación', confidence: 88,
                  corruption_detected: false, integrity_score: 89, upload_status: 'validated', priority: 'normal',
                  queue_position: 46, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T12:05:00Z', updated_at: '2025-01-27T12:05:00Z'
                }
              ]
            },
            {
              project_id: 'proj_008',
              project_name: 'Reforma Integral Oficinas',
              total_documents: 5,
              documents: [
                {
                  id: 'doc_047', document_id: 'DOC-047', filename: 'distribucion_espacios.pdf', original_name: 'Distribución de Espacios.pdf',
                  file_size: 3456789, file_type: 'application/pdf', classification: 'Distribución', confidence: 90,
                  corruption_detected: false, integrity_score: 91, upload_status: 'pending', priority: 'normal',
                  queue_position: 47, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T12:00:00Z', updated_at: '2025-01-27T12:00:00Z'
                },
                {
                  id: 'doc_048', document_id: 'DOC-048', filename: 'mobiliario_oficina.pdf', original_name: 'Mobiliario de Oficina.pdf',
                  file_size: 2109876, file_type: 'application/pdf', classification: 'Mobiliario', confidence: 85,
                  corruption_detected: false, integrity_score: 87, upload_status: 'pending', priority: 'low',
                  queue_position: 48, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T11:55:00Z', updated_at: '2025-01-27T11:55:00Z'
                },
                {
                  id: 'doc_049', document_id: 'DOC-049', filename: 'iluminacion_led.pdf', original_name: 'Sistema de Iluminación LED.pdf',
                  file_size: 1876543, file_type: 'application/pdf', classification: 'Iluminación', confidence: 92,
                  corruption_detected: false, integrity_score: 93, upload_status: 'error', priority: 'normal',
                  queue_position: 49, retry_count: 2, last_error: 'Especificaciones técnicas no estándar', admin_notes: '',
                  created_at: '2025-01-27T11:50:00Z', updated_at: '2025-01-27T11:50:00Z'
                },
                {
                  id: 'doc_050', document_id: 'DOC-050', filename: 'cableado_estructurado.pdf', original_name: 'Cableado Estructurado.pdf',
                  file_size: 2345678, file_type: 'application/pdf', classification: 'Cableado', confidence: 89,
                  corruption_detected: false, integrity_score: 90, upload_status: 'pending', priority: 'normal',
                  queue_position: 50, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T11:45:00Z', updated_at: '2025-01-27T11:45:00Z'
                },
                {
                  id: 'doc_051', document_id: 'DOC-051', filename: 'acabados_interiores.pdf', original_name: 'Acabados Interiores.pdf',
                  file_size: 3109876, file_type: 'application/pdf', classification: 'Acabados', confidence: 87,
                  corruption_detected: false, integrity_score: 88, upload_status: 'uploaded', priority: 'low',
                  queue_position: 51, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T11:40:00Z', updated_at: '2025-01-27T11:40:00Z'
                }
              ]
            }
          ]
        }
      ]
    },
    {
      client_id: 'cli_005',
      client_name: 'Ingeniería y Obras S.L.',
      client_email: 'roberto@ingenieriaobras.com',
      obralia_credentials: {
        username: 'roberto.sanchez@obralia.com',
        password: 'Ingenieria2024&',
        configured: true
      },
      total_documents: 14,
      documents_per_hour: 15,
      last_activity: '2025-01-27T15:40:00Z',
      companies: [
        {
          company_id: 'comp_005',
          company_name: 'Ingeniería y Obras S.L.',
          total_documents: 14,
          projects: [
            {
              project_id: 'proj_009',
              project_name: 'Planta Industrial Química',
              total_documents: 9,
              documents: [
                {
                  id: 'doc_052', document_id: 'DOC-052', filename: 'proceso_industrial.pdf', original_name: 'Proceso Industrial.pdf',
                  file_size: 12345678, file_type: 'application/pdf', classification: 'Proceso', confidence: 96,
                  corruption_detected: false, integrity_score: 97, upload_status: 'pending', priority: 'urgent',
                  queue_position: 52, retry_count: 0, admin_notes: 'Proceso crítico de producción',
                  created_at: '2025-01-27T11:35:00Z', updated_at: '2025-01-27T11:35:00Z'
                },
                {
                  id: 'doc_053', document_id: 'DOC-053', filename: 'seguridad_industrial.pdf', original_name: 'Seguridad Industrial.pdf',
                  file_size: 8765432, file_type: 'application/pdf', classification: 'Seguridad', confidence: 98,
                  corruption_detected: false, integrity_score: 99, upload_status: 'pending', priority: 'urgent',
                  queue_position: 53, retry_count: 0, admin_notes: 'Obligatorio para licencia industrial',
                  created_at: '2025-01-27T11:30:00Z', updated_at: '2025-01-27T11:30:00Z'
                },
                {
                  id: 'doc_054', document_id: 'DOC-054', filename: 'impacto_ambiental.pdf', original_name: 'Evaluación Impacto Ambiental.pdf',
                  file_size: 9876543, file_type: 'application/pdf', classification: 'Impacto Ambiental', confidence: 95,
                  corruption_detected: false, integrity_score: 96, upload_status: 'error', priority: 'urgent',
                  queue_position: 54, retry_count: 1, last_error: 'Documento requiere firma digital adicional', admin_notes: '',
                  created_at: '2025-01-27T11:25:00Z', updated_at: '2025-01-27T11:25:00Z'
                },
                {
                  id: 'doc_055', document_id: 'DOC-055', filename: 'tratamiento_residuos.pdf', original_name: 'Tratamiento de Residuos.pdf',
                  file_size: 4321098, file_type: 'application/pdf', classification: 'Residuos', confidence: 92,
                  corruption_detected: false, integrity_score: 93, upload_status: 'pending', priority: 'high',
                  queue_position: 55, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T11:20:00Z', updated_at: '2025-01-27T11:20:00Z'
                },
                {
                  id: 'doc_056', document_id: 'DOC-056', filename: 'sistemas_control.pdf', original_name: 'Sistemas de Control.pdf',
                  file_size: 6543210, file_type: 'application/pdf', classification: 'Control', confidence: 94,
                  corruption_detected: false, integrity_score: 95, upload_status: 'uploaded', priority: 'normal',
                  queue_position: 56, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T11:15:00Z', updated_at: '2025-01-27T11:15:00Z'
                },
                {
                  id: 'doc_057', document_id: 'DOC-057', filename: 'instrumentacion.pdf', original_name: 'Instrumentación y Control.pdf',
                  file_size: 5210987, file_type: 'application/pdf', classification: 'Instrumentación', confidence: 91,
                  corruption_detected: false, integrity_score: 92, upload_status: 'pending', priority: 'normal',
                  queue_position: 57, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T11:10:00Z', updated_at: '2025-01-27T11:10:00Z'
                },
                {
                  id: 'doc_058', document_id: 'DOC-058', filename: 'tuberias_proceso.pdf', original_name: 'Tuberías de Proceso.pdf',
                  file_size: 7654321, file_type: 'application/pdf', classification: 'Tubería', confidence: 89,
                  corruption_detected: false, integrity_score: 90, upload_status: 'pending', priority: 'normal',
                  queue_position: 58, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T11:05:00Z', updated_at: '2025-01-27T11:05:00Z'
                },
                {
                  id: 'doc_059', document_id: 'DOC-059', filename: 'equipos_principales.pdf', original_name: 'Equipos Principales.pdf',
                  file_size: 8321098, file_type: 'application/pdf', classification: 'Equipos', confidence: 93,
                  corruption_detected: false, integrity_score: 94, upload_status: 'validated', priority: 'normal',
                  queue_position: 59, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T11:00:00Z', updated_at: '2025-01-27T11:00:00Z'
                },
                {
                  id: 'doc_060', document_id: 'DOC-060', filename: 'manual_operacion.pdf', original_name: 'Manual de Operación.pdf',
                  file_size: 6789012, file_type: 'application/pdf', classification: 'Manual', confidence: 90,
                  corruption_detected: false, integrity_score: 91, upload_status: 'pending', priority: 'normal',
                  queue_position: 60, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T10:55:00Z', updated_at: '2025-01-27T10:55:00Z'
                }
              ]
            },
            {
              project_id: 'proj_010',
              project_name: 'Depuradora de Aguas',
              total_documents: 5,
              documents: [
                {
                  id: 'doc_061', document_id: 'DOC-061', filename: 'tratamiento_primario.pdf', original_name: 'Tratamiento Primario.pdf',
                  file_size: 5432109, file_type: 'application/pdf', classification: 'Tratamiento', confidence: 94,
                  corruption_detected: false, integrity_score: 95, upload_status: 'pending', priority: 'high',
                  queue_position: 61, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T10:50:00Z', updated_at: '2025-01-27T10:50:00Z'
                },
                {
                  id: 'doc_062', document_id: 'DOC-062', filename: 'tratamiento_secundario.pdf', original_name: 'Tratamiento Secundario.pdf',
                  file_size: 4876543, file_type: 'application/pdf', classification: 'Tratamiento', confidence: 93,
                  corruption_detected: false, integrity_score: 94, upload_status: 'pending', priority: 'high',
                  queue_position: 62, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T10:45:00Z', updated_at: '2025-01-27T10:45:00Z'
                },
                {
                  id: 'doc_063', document_id: 'DOC-063', filename: 'control_olores.pdf', original_name: 'Control de Olores.pdf',
                  file_size: 2345678, file_type: 'application/pdf', classification: 'Control', confidence: 87,
                  corruption_detected: false, integrity_score: 88, upload_status: 'error', priority: 'normal',
                  queue_position: 63, retry_count: 1, last_error: 'Documento técnico muy específico', admin_notes: '',
                  created_at: '2025-01-27T10:40:00Z', updated_at: '2025-01-27T10:40:00Z'
                },
                {
                  id: 'doc_064', document_id: 'DOC-064', filename: 'bombeo_aguas.pdf', original_name: 'Sistema de Bombeo.pdf',
                  file_size: 3765432, file_type: 'application/pdf', classification: 'Bombeo', confidence: 91,
                  corruption_detected: false, integrity_score: 92, upload_status: 'uploaded', priority: 'normal',
                  queue_position: 64, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T10:35:00Z', updated_at: '2025-01-27T10:35:00Z'
                },
                {
                  id: 'doc_065', document_id: 'DOC-065', filename: 'analisis_aguas.pdf', original_name: 'Análisis de Aguas.pdf',
                  file_size: 1987654, file_type: 'application/pdf', classification: 'Análisis', confidence: 89,
                  corruption_detected: false, integrity_score: 90, upload_status: 'pending', priority: 'normal',
                  queue_position: 65, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T10:30:00Z', updated_at: '2025-01-27T10:30:00Z'
                }
              ]
            }
          ]
        }
      ]
    },
    {
      client_id: 'cli_006',
      client_name: 'Constructora del Sur S.A.',
      client_email: 'pedro@constructoradelsur.com',
      obralia_credentials: {
        username: 'pedro.ruiz@nalanda.es',
        password: 'Sur2024*',
        configured: true
      },
      total_documents: 10,
      documents_per_hour: 7,
      last_activity: '2025-01-27T15:10:00Z',
      companies: [
        {
          company_id: 'comp_006',
          company_name: 'Constructora del Sur S.A.',
          total_documents: 10,
          projects: [
            {
              project_id: 'proj_011',
              project_name: 'Hospital Regional',
              total_documents: 10,
              documents: [
                {
                  id: 'doc_066', document_id: 'DOC-066', filename: 'proyecto_hospitalario.pdf', original_name: 'Proyecto Hospitalario.pdf',
                  file_size: 18765432, file_type: 'application/pdf', classification: 'Proyecto Hospitalario', confidence: 98,
                  corruption_detected: false, integrity_score: 99, upload_status: 'pending', priority: 'urgent',
                  queue_position: 66, retry_count: 0, admin_notes: 'Proyecto de alta complejidad sanitaria',
                  created_at: '2025-01-27T10:25:00Z', updated_at: '2025-01-27T10:25:00Z'
                },
                {
                  id: 'doc_067', document_id: 'DOC-067', filename: 'instalaciones_medicas.pdf', original_name: 'Instalaciones Médicas.pdf',
                  file_size: 9876543, file_type: 'application/pdf', classification: 'Instalación Médica', confidence: 96,
                  corruption_detected: false, integrity_score: 97, upload_status: 'pending', priority: 'urgent',
                  queue_position: 67, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T10:20:00Z', updated_at: '2025-01-27T10:20:00Z'
                },
                {
                  id: 'doc_068', document_id: 'DOC-068', filename: 'quirofanos_especializados.pdf', original_name: 'Quirófanos Especializados.pdf',
                  file_size: 7654321, file_type: 'application/pdf', classification: 'Quirófano', confidence: 95,
                  corruption_detected: false, integrity_score: 96, upload_status: 'error', priority: 'urgent',
                  queue_position: 68, retry_count: 1, last_error: 'Requiere validación médica especializada', admin_notes: '',
                  created_at: '2025-01-27T10:15:00Z', updated_at: '2025-01-27T10:15:00Z'
                },
                {
                  id: 'doc_069', document_id: 'DOC-069', filename: 'sistema_gases.pdf', original_name: 'Sistema de Gases Medicinales.pdf',
                  file_size: 5432109, file_type: 'application/pdf', classification: 'Gases Medicinales', confidence: 93,
                  corruption_detected: false, integrity_score: 94, upload_status: 'pending', priority: 'urgent',
                  queue_position: 69, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T10:10:00Z', updated_at: '2025-01-27T10:10:00Z'
                },
                {
                  id: 'doc_070', document_id: 'DOC-070', filename: 'esterilizacion_central.pdf', original_name: 'Central de Esterilización.pdf',
                  file_size: 4321098, file_type: 'application/pdf', classification: 'Esterilización', confidence: 92,
                  corruption_detected: false, integrity_score: 93, upload_status: 'uploaded', priority: 'high',
                  queue_position: 70, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T10:05:00Z', updated_at: '2025-01-27T10:05:00Z'
                },
                {
                  id: 'doc_071', document_id: 'DOC-071', filename: 'laboratorio_clinico.pdf', original_name: 'Laboratorio Clínico.pdf',
                  file_size: 6789012, file_type: 'application/pdf', classification: 'Laboratorio', confidence: 94,
                  corruption_detected: false, integrity_score: 95, upload_status: 'pending', priority: 'high',
                  queue_position: 71, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T10:00:00Z', updated_at: '2025-01-27T10:00:00Z'
                },
                {
                  id: 'doc_072', document_id: 'DOC-072', filename: 'radiologia_digital.pdf', original_name: 'Radiología Digital.pdf',
                  file_size: 8210987, file_type: 'application/pdf', classification: 'Radiología', confidence: 91,
                  corruption_detected: false, integrity_score: 92, upload_status: 'pending', priority: 'normal',
                  queue_position: 72, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T09:55:00Z', updated_at: '2025-01-27T09:55:00Z'
                },
                {
                  id: 'doc_073', document_id: 'DOC-073', filename: 'farmacia_hospitalaria.pdf', original_name: 'Farmacia Hospitalaria.pdf',
                  file_size: 3456789, file_type: 'application/pdf', classification: 'Farmacia', confidence: 89,
                  corruption_detected: false, integrity_score: 90, upload_status: 'validated', priority: 'normal',
                  queue_position: 73, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T09:50:00Z', updated_at: '2025-01-27T09:50:00Z'
                },
                {
                  id: 'doc_074', document_id: 'DOC-074', filename: 'urgencias_trauma.pdf', original_name: 'Urgencias y Trauma.pdf',
                  file_size: 5876543, file_type: 'application/pdf', classification: 'Urgencias', confidence: 96,
                  corruption_detected: false, integrity_score: 97, upload_status: 'pending', priority: 'urgent',
                  queue_position: 74, retry_count: 0, admin_notes: 'Área crítica del hospital',
                  created_at: '2025-01-27T09:45:00Z', updated_at: '2025-01-27T09:45:00Z'
                },
                {
                  id: 'doc_075', document_id: 'DOC-075', filename: 'uci_especializada.pdf', original_name: 'UCI Especializada.pdf',
                  file_size: 4987654, file_type: 'application/pdf', classification: 'UCI', confidence: 97,
                  corruption_detected: false, integrity_score: 98, upload_status: 'error', priority: 'urgent',
                  queue_position: 75, retry_count: 2, last_error: 'Especificaciones médicas muy técnicas', admin_notes: '',
                  created_at: '2025-01-27T09:40:00Z', updated_at: '2025-01-27T09:40:00Z'
                }
              ]
            }
          ]
        }
      ]
    },
    {
      client_id: 'cli_007',
      client_name: 'Infraestructuras Catalanas S.L.',
      client_email: 'jordi@infracatalanas.com',
      obralia_credentials: {
        username: 'jordi.vila@obralia.com',
        password: 'Catalanas2024!',
        configured: true
      },
      total_documents: 12,
      documents_per_hour: 9,
      last_activity: '2025-01-27T15:05:00Z',
      companies: [
        {
          company_id: 'comp_007',
          company_name: 'Infraestructuras Catalanas S.L.',
          total_documents: 12,
          projects: [
            {
              project_id: 'proj_012',
              project_name: 'Metro Línea 9 Extensión',
              total_documents: 7,
              documents: [
                {
                  id: 'doc_076', document_id: 'DOC-076', filename: 'tuneladora_tbm.pdf', original_name: 'Tuneladora TBM.pdf',
                  file_size: 14321098, file_type: 'application/pdf', classification: 'Maquinaria', confidence: 95,
                  corruption_detected: false, integrity_score: 96, upload_status: 'pending', priority: 'urgent',
                  queue_position: 76, retry_count: 0, admin_notes: 'Maquinaria especializada para túneles',
                  created_at: '2025-01-27T09:35:00Z', updated_at: '2025-01-27T09:35:00Z'
                },
                {
                  id: 'doc_077', document_id: 'DOC-077', filename: 'estaciones_metro.pdf', original_name: 'Estaciones de Metro.pdf',
                  file_size: 11234567, file_type: 'application/pdf', classification: 'Estación', confidence: 94,
                  corruption_detected: false, integrity_score: 95, upload_status: 'pending', priority: 'high',
                  queue_position: 77, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T09:30:00Z', updated_at: '2025-01-27T09:30:00Z'
                },
                {
                  id: 'doc_078', document_id: 'DOC-078', filename: 'vias_ferreas.pdf', original_name: 'Vías Férreas.pdf',
                  file_size: 8765432, file_type: 'application/pdf', classification: 'Vía Férrea', confidence: 92,
                  corruption_detected: false, integrity_score: 93, upload_status: 'error', priority: 'high',
                  queue_position: 78, retry_count: 1, last_error: 'Especificaciones ferroviarias complejas', admin_notes: '',
                  created_at: '2025-01-27T09:25:00Z', updated_at: '2025-01-27T09:25:00Z'
                },
                {
                  id: 'doc_079', document_id: 'DOC-079', filename: 'senalizacion_metro.pdf', original_name: 'Señalización Metro.pdf',
                  file_size: 3456789, file_type: 'application/pdf', classification: 'Señalización', confidence: 90,
                  corruption_detected: false, integrity_score: 91, upload_status: 'pending', priority: 'normal',
                  queue_position: 79, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T09:20:00Z', updated_at: '2025-01-27T09:20:00Z'
                },
                {
                  id: 'doc_080', document_id: 'DOC-080', filename: 'ventilacion_tuneles.pdf', original_name: 'Ventilación de Túneles.pdf',
                  file_size: 6543210, file_type: 'application/pdf', classification: 'Ventilación', confidence: 93,
                  corruption_detected: false, integrity_score: 94, upload_status: 'uploaded', priority: 'normal',
                  queue_position: 80, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T09:15:00Z', updated_at: '2025-01-27T09:15:00Z'
                },
                {
                  id: 'doc_081', document_id: 'DOC-081', filename: 'sistemas_emergencia.pdf', original_name: 'Sistemas de Emergencia.pdf',
                  file_size: 4876543, file_type: 'application/pdf', classification: 'Emergencia', confidence: 95,
                  corruption_detected: false, integrity_score: 96, upload_status: 'pending', priority: 'urgent',
                  queue_position: 81, retry_count: 0, admin_notes: 'Crítico para seguridad del metro',
                  created_at: '2025-01-27T09:10:00Z', updated_at: '2025-01-27T09:10:00Z'
                },
                {
                  id: 'doc_082', document_id: 'DOC-082', filename: 'control_accesos.pdf', original_name: 'Control de Accesos.pdf',
                  file_size: 2765432, file_type: 'application/pdf', classification: 'Control Accesos', confidence: 88,
                  corruption_detected: false, integrity_score: 89, upload_status: 'validated', priority: 'normal',
                  queue_position: 82, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T09:05:00Z', updated_at: '2025-01-27T09:05:00Z'
                }
              ]
            },
            {
              project_id: 'proj_013',
              project_name: 'Parque Tecnológico',
              total_documents: 5,
              documents: [
                {
                  id: 'doc_083', document_id: 'DOC-083', filename: 'edificios_oficinas.pdf', original_name: 'Edificios de Oficinas.pdf',
                  file_size: 7654321, file_type: 'application/pdf', classification: 'Edificio', confidence: 91,
                  corruption_detected: false, integrity_score: 92, upload_status: 'pending', priority: 'normal',
                  queue_position: 83, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T09:00:00Z', updated_at: '2025-01-27T09:00:00Z'
                },
                {
                  id: 'doc_084', document_id: 'DOC-084', filename: 'centro_investigacion.pdf', original_name: 'Centro de Investigación.pdf',
                  file_size: 6321098, file_type: 'application/pdf', classification: 'Centro I+D', confidence: 89,
                  corruption_detected: false, integrity_score: 90, upload_status: 'pending', priority: 'high',
                  queue_position: 84, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T08:55:00Z', updated_at: '2025-01-27T08:55:00Z'
                },
                {
                  id: 'doc_085', document_id: 'DOC-085', filename: 'laboratorios_alta_tecnologia.pdf', original_name: 'Laboratorios Alta Tecnología.pdf',
                  file_size: 8987654, file_type: 'application/pdf', classification: 'Laboratorio', confidence: 93,
                  corruption_detected: false, integrity_score: 94, upload_status: 'error', priority: 'normal',
                  queue_position: 85, retry_count: 1, last_error: 'Tecnología muy avanzada, requiere especialista', admin_notes: '',
                  created_at: '2025-01-27T08:50:00Z', updated_at: '2025-01-27T08:50:00Z'
                },
                {
                  id: 'doc_086', document_id: 'DOC-086', filename: 'fibra_optica.pdf', original_name: 'Red de Fibra Óptica.pdf',
                  file_size: 3210987, file_type: 'application/pdf', classification: 'Fibra Óptica', confidence: 87,
                  corruption_detected: false, integrity_score: 88, upload_status: 'uploaded', priority: 'normal',
                  queue_position: 86, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T08:45:00Z', updated_at: '2025-01-27T08:45:00Z'
                },
                {
                  id: 'doc_087', document_id: 'DOC-087', filename: 'datacenter_principal.pdf', original_name: 'Datacenter Principal.pdf',
                  file_size: 5876543, file_type: 'application/pdf', classification: 'Datacenter', confidence: 92,
                  corruption_detected: false, integrity_score: 93, upload_status: 'pending', priority: 'high',
                  queue_position: 87, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T08:40:00Z', updated_at: '2025-01-27T08:40:00Z'
                }
              ]
            }
          ]
        }
      ]
    },
    {
      client_id: 'cli_008',
      client_name: 'Obras Marítimas Galicia S.A.',
      client_email: 'manuel@obrasmaritimas.com',
      obralia_credentials: {
        username: 'manuel.fernandez@nalanda.es',
        password: 'Maritimas2024#',
        configured: true
      },
      total_documents: 11,
      documents_per_hour: 8,
      last_activity: '2025-01-27T14:55:00Z',
      companies: [
        {
          company_id: 'comp_008',
          company_name: 'Obras Marítimas Galicia S.A.',
          total_documents: 11,
          projects: [
            {
              project_id: 'proj_014',
              project_name: 'Puerto Deportivo Vigo',
              total_documents: 6,
              documents: [
                {
                  id: 'doc_088', document_id: 'DOC-088', filename: 'dragado_puerto.pdf', original_name: 'Dragado del Puerto.pdf',
                  file_size: 12876543, file_type: 'application/pdf', classification: 'Dragado', confidence: 94,
                  corruption_detected: false, integrity_score: 95, upload_status: 'pending', priority: 'urgent',
                  queue_position: 88, retry_count: 0, admin_notes: 'Operación crítica para navegación',
                  created_at: '2025-01-27T08:35:00Z', updated_at: '2025-01-27T08:35:00Z'
                },
                {
                  id: 'doc_089', document_id: 'DOC-089', filename: 'muelles_flotantes.pdf', original_name: 'Muelles Flotantes.pdf',
                  file_size: 8765432, file_type: 'application/pdf', classification: 'Muelle', confidence: 92,
                  corruption_detected: false, integrity_score: 93, upload_status: 'pending', priority: 'high',
                  queue_position: 89, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T08:30:00Z', updated_at: '2025-01-27T08:30:00Z'
                },
                {
                  id: 'doc_090', document_id: 'DOC-090', filename: 'rompeolas_principal.pdf', original_name: 'Rompeolas Principal.pdf',
                  file_size: 9543210, file_type: 'application/pdf', classification: 'Rompeolas', confidence: 91,
                  corruption_detected: false, integrity_score: 92, upload_status: 'error', priority: 'high',
                  queue_position: 90, retry_count: 1, last_error: 'Cálculos marítimos muy complejos', admin_notes: '',
                  created_at: '2025-01-27T08:25:00Z', updated_at: '2025-01-27T08:25:00Z'
                },
                {
                  id: 'doc_091', document_id: 'DOC-091', filename: 'servicios_portuarios.pdf', original_name: 'Servicios Portuarios.pdf',
                  file_size: 4321098, file_type: 'application/pdf', classification: 'Servicios', confidence: 88,
                  corruption_detected: false, integrity_score: 89, upload_status: 'uploaded', priority: 'normal',
                  queue_position: 91, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T08:20:00Z', updated_at: '2025-01-27T08:20:00Z'
                },
                {
                  id: 'doc_092', document_id: 'DOC-092', filename: 'club_nautico.pdf', original_name: 'Club Náutico.pdf',
                  file_size: 5678901, file_type: 'application/pdf', classification: 'Club Náutico', confidence: 86,
                  corruption_detected: false, integrity_score: 87, upload_status: 'pending', priority: 'low',
                  queue_position: 92, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T08:15:00Z', updated_at: '2025-01-27T08:15:00Z'
                },
                {
                  id: 'doc_093', document_id: 'DOC-093', filename: 'restaurante_maritimo.pdf', original_name: 'Restaurante Marítimo.pdf',
                  file_size: 2987654, file_type: 'application/pdf', classification: 'Restaurante', confidence: 84,
                  corruption_detected: false, integrity_score: 85, upload_status: 'validated', priority: 'low',
                  queue_position: 93, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T08:10:00Z', updated_at: '2025-01-27T08:10:00Z'
                }
              ]
            },
            {
              project_id: 'proj_015',
              project_name: 'Dique Seco Industrial',
              total_documents: 5,
              documents: [
                {
                  id: 'doc_094', document_id: 'DOC-094', filename: 'dique_construccion.pdf', original_name: 'Construcción del Dique.pdf',
                  file_size: 16543210, file_type: 'application/pdf', classification: 'Dique', confidence: 96,
                  corruption_detected: false, integrity_score: 97, upload_status: 'pending', priority: 'urgent',
                  queue_position: 94, retry_count: 0, admin_notes: 'Infraestructura naval crítica',
                  created_at: '2025-01-27T08:05:00Z', updated_at: '2025-01-27T08:05:00Z'
                },
                {
                  id: 'doc_095', document_id: 'DOC-095', filename: 'gruas_portuarias.pdf', original_name: 'Grúas Portuarias.pdf',
                  file_size: 7890123, file_type: 'application/pdf', classification: 'Grúa', confidence: 93,
                  corruption_detected: false, integrity_score: 94, upload_status: 'pending', priority: 'high',
                  queue_position: 95, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T08:00:00Z', updated_at: '2025-01-27T08:00:00Z'
                },
                {
                  id: 'doc_096', document_id: 'DOC-096', filename: 'sistemas_bombeo.pdf', original_name: 'Sistemas de Bombeo.pdf',
                  file_size: 5432109, file_type: 'application/pdf', classification: 'Bombeo', confidence: 90,
                  corruption_detected: false, integrity_score: 91, upload_status: 'error', priority: 'normal',
                  queue_position: 96, retry_count: 2, last_error: 'Sistemas hidráulicos muy específicos', admin_notes: '',
                  created_at: '2025-01-27T07:55:00Z', updated_at: '2025-01-27T07:55:00Z'
                },
                {
                  id: 'doc_097', document_id: 'DOC-097', filename: 'compuertas_estancas.pdf', original_name: 'Compuertas Estancas.pdf',
                  file_size: 4210987, file_type: 'application/pdf', classification: 'Compuerta', confidence: 89,
                  corruption_detected: false, integrity_score: 90, upload_status: 'uploaded', priority: 'normal',
                  queue_position: 97, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T07:50:00Z', updated_at: '2025-01-27T07:50:00Z'
                },
                {
                  id: 'doc_098', document_id: 'DOC-098', filename: 'mantenimiento_naval.pdf', original_name: 'Mantenimiento Naval.pdf',
                  file_size: 3654321, file_type: 'application/pdf', classification: 'Mantenimiento', confidence: 87,
                  corruption_detected: false, integrity_score: 88, upload_status: 'pending', priority: 'normal',
                  queue_position: 98, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T07:45:00Z', updated_at: '2025-01-27T07:45:00Z'
                }
              ]
            }
          ]
        }
      ]
    },
    {
      client_id: 'cli_009',
      client_name: 'Edificaciones Sostenibles S.L.',
      client_email: 'laura@edificacionessostenibles.com',
      obralia_credentials: {
        username: 'laura.gonzalez@obralia.com',
        password: 'Sostenible2024$',
        configured: true
      },
      total_documents: 10,
      documents_per_hour: 11,
      last_activity: '2025-01-27T14:50:00Z',
      companies: [
        {
          company_id: 'comp_009',
          company_name: 'Edificaciones Sostenibles S.L.',
          total_documents: 10,
          projects: [
            {
              project_id: 'proj_016',
              project_name: 'Edificio Passivhaus',
              total_documents: 10,
              documents: [
                {
                  id: 'doc_099', document_id: 'DOC-099', filename: 'certificacion_passivhaus.pdf', original_name: 'Certificación Passivhaus.pdf',
                  file_size: 6789012, file_type: 'application/pdf', classification: 'Certificación', confidence: 97,
                  corruption_detected: false, integrity_score: 98, upload_status: 'pending', priority: 'urgent',
                  queue_position: 99, retry_count: 0, admin_notes: 'Certificación internacional obligatoria',
                  created_at: '2025-01-27T07:40:00Z', updated_at: '2025-01-27T07:40:00Z'
                },
                {
                  id: 'doc_100', document_id: 'DOC-100', filename: 'aislamiento_termico.pdf', original_name: 'Aislamiento Térmico.pdf',
                  file_size: 4567890, file_type: 'application/pdf', classification: 'Aislamiento', confidence: 94,
                  corruption_detected: false, integrity_score: 95, upload_status: 'pending', priority: 'high',
                  queue_position: 100, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T07:35:00Z', updated_at: '2025-01-27T07:35:00Z'
                },
                {
                  id: 'doc_101', document_id: 'DOC-101', filename: 'ventilacion_mecanica.pdf', original_name: 'Ventilación Mecánica.pdf',
                  file_size: 5432109, file_type: 'application/pdf', classification: 'Ventilación', confidence: 92,
                  corruption_detected: false, integrity_score: 93, upload_status: 'error', priority: 'high',
                  queue_position: 101, retry_count: 1, last_error: 'Sistemas de ventilación muy técnicos', admin_notes: '',
                  created_at: '2025-01-27T07:30:00Z', updated_at: '2025-01-27T07:30:00Z'
                },
                {
                  id: 'doc_102', document_id: 'DOC-102', filename: 'carpinteria_exterior.pdf', original_name: 'Carpintería Exterior.pdf',
                  file_size: 3876543, file_type: 'application/pdf', classification: 'Carpintería', confidence: 89,
                  corruption_detected: false, integrity_score: 90, upload_status: 'pending', priority: 'normal',
                  queue_position: 102, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T07:25:00Z', updated_at: '2025-01-27T07:25:00Z'
                },
                {
                  id: 'doc_103', document_id: 'DOC-103', filename: 'energia_renovable.pdf', original_name: 'Energía Renovable.pdf',
                  file_size: 7210987, file_type: 'application/pdf', classification: 'Energía', confidence: 95,
                  corruption_detected: false, integrity_score: 96, upload_status: 'uploaded', priority: 'normal',
                  queue_position: 103, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T07:20:00Z', updated_at: '2025-01-27T07:20:00Z'
                },
                {
                  id: 'doc_104', document_id: 'DOC-104', filename: 'gestion_agua.pdf', original_name: 'Gestión del Agua.pdf',
                  file_size: 4654321, file_type: 'application/pdf', classification: 'Gestión Agua', confidence: 91,
                  corruption_detected: false, integrity_score: 92, upload_status: 'pending', priority: 'normal',
                  queue_position: 104, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T07:15:00Z', updated_at: '2025-01-27T07:15:00Z'
                },
                {
                  id: 'doc_105', document_id: 'DOC-105', filename: 'materiales_ecologicos.pdf', original_name: 'Materiales Ecológicos.pdf',
                  file_size: 3210987, file_type: 'application/pdf', classification: 'Materiales', confidence: 88,
                  corruption_detected: false, integrity_score: 89, upload_status: 'validated', priority: 'normal',
                  queue_position: 105, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T07:10:00Z', updated_at: '2025-01-27T07:10:00Z'
                },
                {
                  id: 'doc_106', document_id: 'DOC-106', filename: 'huella_carbono.pdf', original_name: 'Huella de Carbono.pdf',
                  file_size: 2876543, file_type: 'application/pdf', classification: 'Huella Carbono', confidence: 86,
                  corruption_detected: false, integrity_score: 87, upload_status: 'pending', priority: 'low',
                  queue_position: 106, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T07:05:00Z', updated_at: '2025-01-27T07:05:00Z'
                },
                {
                  id: 'doc_107', document_id: 'DOC-107', filename: 'certificado_breeam.pdf', original_name: 'Certificado BREEAM.pdf',
                  file_size: 4987654, file_type: 'application/pdf', classification: 'Certificado', confidence: 93,
                  corruption_detected: false, integrity_score: 94, upload_status: 'pending', priority: 'high',
                  queue_position: 107, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T07:00:00Z', updated_at: '2025-01-27T07:00:00Z'
                },
                {
                  id: 'doc_108', document_id: 'DOC-108', filename: 'auditoria_energetica.pdf', original_name: 'Auditoría Energética.pdf',
                  file_size: 3543210, file_type: 'application/pdf', classification: 'Auditoría', confidence: 90,
                  corruption_detected: false, integrity_score: 91, upload_status: 'error', priority: 'normal',
                  queue_position: 108, retry_count: 1, last_error: 'Datos energéticos muy detallados', admin_notes: '',
                  created_at: '2025-01-27T06:55:00Z', updated_at: '2025-01-27T06:55:00Z'
                }
              ]
            }
          ]
        }
      ]
    },
    {
      client_id: 'cli_010',
      client_name: 'Túneles y Viaductos S.A.',
      client_email: 'francisco@tunelesyviaductos.com',
      obralia_credentials: {
        username: 'francisco.moreno@nalanda.es',
        password: 'Tuneles2024&',
        configured: true
      },
      total_documents: 13,
      documents_per_hour: 14,
      last_activity: '2025-01-27T14:45:00Z',
      companies: [
        {
          company_id: 'comp_010',
          company_name: 'Túneles y Viaductos S.A.',
          total_documents: 13,
          projects: [
            {
              project_id: 'proj_017',
              project_name: 'Túnel Transpirenaico',
              total_documents: 8,
              documents: [
                {
                  id: 'doc_109', document_id: 'DOC-109', filename: 'perforacion_tunel.pdf', original_name: 'Perforación del Túnel.pdf',
                  file_size: 20123456, file_type: 'application/pdf', classification: 'Perforación', confidence: 98,
                  corruption_detected: false, integrity_score: 99, upload_status: 'pending', priority: 'urgent',
                  queue_position: 109, retry_count: 0, admin_notes: 'Proyecto de infraestructura internacional',
                  created_at: '2025-01-27T06:50:00Z', updated_at: '2025-01-27T06:50:00Z'
                },
                {
                  id: 'doc_110', document_id: 'DOC-110', filename: 'sostenimiento_rocas.pdf', original_name: 'Sostenimiento de Rocas.pdf',
                  file_size: 12345678, file_type: 'application/pdf', classification: 'Sostenimiento', confidence: 95,
                  corruption_detected: false, integrity_score: 96, upload_status: 'pending', priority: 'urgent',
                  queue_position: 110, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T06:45:00Z', updated_at: '2025-01-27T06:45:00Z'
                },
                {
                  id: 'doc_111', document_id: 'DOC-111', filename: 'ventilacion_tunel.pdf', original_name: 'Ventilación del Túnel.pdf',
                  file_size: 8765432, file_type: 'application/pdf', classification: 'Ventilación', confidence: 93,
                  corruption_detected: false, integrity_score: 94, upload_status: 'error', priority: 'urgent',
                  queue_position: 111, retry_count: 1, last_error: 'Sistemas de ventilación subterránea complejos', admin_notes: '',
                  created_at: '2025-01-27T06:40:00Z', updated_at: '2025-01-27T06:40:00Z'
                },
                {
                  id: 'doc_112', document_id: 'DOC-112', filename: 'impermeabilizacion.pdf', original_name: 'Impermeabilización.pdf',
                  file_size: 6543210, file_type: 'application/pdf', classification: 'Impermeabilización', confidence: 91,
                  corruption_detected: false, integrity_score: 92, upload_status: 'pending', priority: 'high',
                  queue_position: 112, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T06:35:00Z', updated_at: '2025-01-27T06:35:00Z'
                },
                {
                  id: 'doc_113', document_id: 'DOC-113', filename: 'drenaje_subterraneo.pdf', original_name: 'Drenaje Subterráneo.pdf',
                  file_size: 5210987, file_type: 'application/pdf', classification: 'Drenaje', confidence: 89,
                  corruption_detected: false, integrity_score: 90, upload_status: 'uploaded', priority: 'normal',
                  queue_position: 113, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T06:30:00Z', updated_at: '2025-01-27T06:30:00Z'
                },
                {
                  id: 'doc_114', document_id: 'DOC-114', filename: 'iluminacion_tunel.pdf', original_name: 'Iluminación del Túnel.pdf',
                  file_size: 4321098, file_type: 'application/pdf', classification: 'Iluminación', confidence: 87,
                  corruption_detected: false, integrity_score: 88, upload_status: 'pending', priority: 'normal',
                  queue_position: 114, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T06:25:00Z', updated_at: '2025-01-27T06:25:00Z'
                },
                {
                  id: 'doc_115', document_id: 'DOC-115', filename: 'sistemas_seguridad.pdf', original_name: 'Sistemas de Seguridad.pdf',
                  file_size: 7654321, file_type: 'application/pdf', classification: 'Seguridad', confidence: 94,
                  corruption_detected: false, integrity_score: 95, upload_status: 'validated', priority: 'high',
                  queue_position: 115, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T06:20:00Z', updated_at: '2025-01-27T06:20:00Z'
                },
                {
                  id: 'doc_116', document_id: 'DOC-116', filename: 'control_trafico.pdf', original_name: 'Control de Tráfico.pdf',
                  file_size: 3987654, file_type: 'application/pdf', classification: 'Control Tráfico', confidence: 90,
                  corruption_detected: false, integrity_score: 91, upload_status: 'pending', priority: 'normal',
                  queue_position: 116, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T06:15:00Z', updated_at: '2025-01-27T06:15:00Z'
                }
              ]
            },
            {
              project_id: 'proj_018',
              project_name: 'Viaducto de Montaña',
              total_documents: 5,
              documents: [
                {
                  id: 'doc_117', document_id: 'DOC-117', filename: 'calculo_viaducto.pdf', original_name: 'Cálculo Estructural Viaducto.pdf',
                  file_size: 15432109, file_type: 'application/pdf', classification: 'Cálculo Estructural', confidence: 97,
                  corruption_detected: false, integrity_score: 98, upload_status: 'pending', priority: 'urgent',
                  queue_position: 117, retry_count: 0, admin_notes: 'Cálculos críticos para estabilidad',
                  created_at: '2025-01-27T06:10:00Z', updated_at: '2025-01-27T06:10:00Z'
                },
                {
                  id: 'doc_118', document_id: 'DOC-118', filename: 'pilares_hormigon.pdf', original_name: 'Pilares de Hormigón.pdf',
                  file_size: 9876543, file_type: 'application/pdf', classification: 'Pilar', confidence: 94,
                  corruption_detected: false, integrity_score: 95, upload_status: 'pending', priority: 'high',
                  queue_position: 118, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T06:05:00Z', updated_at: '2025-01-27T06:05:00Z'
                },
                {
                  id: 'doc_119', document_id: 'DOC-119', filename: 'tablero_viaducto.pdf', original_name: 'Tablero del Viaducto.pdf',
                  file_size: 11234567, file_type: 'application/pdf', classification: 'Tablero', confidence: 92,
                  corruption_detected: false, integrity_score: 93, upload_status: 'error', priority: 'high',
                  queue_position: 119, retry_count: 2, last_error: 'Especificaciones estructurales muy complejas', admin_notes: '',
                  created_at: '2025-01-27T06:00:00Z', updated_at: '2025-01-27T06:00:00Z'
                },
                {
                  id: 'doc_120', document_id: 'DOC-120', filename: 'juntas_dilatacion.pdf', original_name: 'Juntas de Dilatación.pdf',
                  file_size: 4567890, file_type: 'application/pdf', classification: 'Junta', confidence: 88,
                  corruption_detected: false, integrity_score: 89, upload_status: 'uploaded', priority: 'normal',
                  queue_position: 120, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T05:55:00Z', updated_at: '2025-01-27T05:55:00Z'
                },
                {
                  id: 'doc_121', document_id: 'DOC-121', filename: 'barreras_seguridad.pdf', original_name: 'Barreras de Seguridad.pdf',
                  file_size: 2987654, file_type: 'application/pdf', classification: 'Barrera', confidence: 85,
                  corruption_detected: false, integrity_score: 86, upload_status: 'pending', priority: 'normal',
                  queue_position: 121, retry_count: 0, admin_notes: '',
                  created_at: '2025-01-27T05:50:00Z', updated_at: '2025-01-27T05:50:00Z'
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
      const pendingCount = clientGroups.reduce((sum, client) => 
        sum + client.companies.reduce((compSum, company) => 
          compSum + company.projects.reduce((projSum, project) => 
            projSum + project.documents.filter(doc => doc.upload_status === 'pending').length, 0), 0), 0);
      const errorCount = clientGroups.reduce((sum, client) => 
        sum + client.companies.reduce((compSum, company) => 
          compSum + company.projects.reduce((projSum, project) => 
            projSum + project.documents.filter(doc => doc.upload_status === 'error').length, 0), 0), 0);

      const mockInsights = `🔧 Análisis de Gestión Manual ConstructIA:

1. **Cola Masiva**: ${totalDocuments} documentos totales, ${pendingCount} pendientes y ${errorCount} con errores que requieren atención manual.

2. **Eficiencia Operativa**: Promedio de 10 docs/hora por cliente. Los clientes con más documentos técnicos (hospitales, túneles) requieren más tiempo.

3. **Priorización IA**: Se han identificado ${clientGroups.reduce((sum, client) => 
  sum + client.companies.reduce((compSum, company) => 
    compSum + company.projects.reduce((projSum, project) => 
      projSum + project.documents.filter(doc => doc.priority === 'urgent').length, 0), 0), 0)} documentos urgentes que deben procesarse primero.`;
      
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
    alert(`📁 ${files.length} archivo(s) añadido(s) a la cola para procesamiento en el proyecto`);
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
      title: 'Errores',
      value: allDocuments.filter(d => d.upload_status === 'error').length.toString(),
      icon: AlertTriangle,
      color: 'bg-red-500',
      status: 'error' as const
    },
    {
      title: 'Corruptos',
      value: allDocuments.filter(d => d.corruption_detected).length.toString(),
      icon: Warning,
      color: 'bg-purple-500',
      status: 'error' as const
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
            <h2 className="text-2xl font-bold">🔧 Gestión Manual de Documentos</h2>
            <p className="text-orange-100 mt-1">Cola operativa con conexión directa a Obralia/Nalanda</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              <span className="text-sm">
                {isProcessing ? '🟢 Sesión Activa' : '🔴 Sesión Inactiva'}
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
            <h3 className="font-semibold mb-2">🤖 Insights Operativos IA:</h3>
            <div className="text-sm text-white/90 whitespace-pre-line">{aiInsights}</div>
          </div>
        )}
      </div>

      {/* KPIs en Tiempo Real */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Métricas en Tiempo Real</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {kpis.map((kpi, index) => (
            <ManualKPICard key={index} {...kpi} />
          ))}
        </div>
      </div>

      {/* Controles Operativos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">⚙️ Controles Operativos</h3>
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
                  ⏸️ Pausar Sesión
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  ▶️ Iniciar Sesión
                </>
              )}
            </button>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center">
              <Download className="h-4 w-4 mr-2" />
              📥 Exportar Cola
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
                placeholder="🔍 Buscar cliente, empresa, proyecto o documento..."
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
            <option value="all">📋 Todos los estados</option>
            <option value="pending">⏳ Pendientes</option>
            <option value="uploading">📤 Subiendo</option>
            <option value="uploaded">✅ Subidos</option>
            <option value="validated">🎯 Validados</option>
            <option value="error">❌ Errores</option>
            <option value="corrupted">🚫 Corruptos</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">🎯 Todas las prioridades</option>
            <option value="urgent">🔴 Urgente</option>
            <option value="high">🟠 Alta</option>
            <option value="normal">🔵 Normal</option>
            <option value="low">⚪ Baja</option>
          </select>
        </div>
      </div>

      {/* Tabla Operativa */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">✅ Sel</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">📄 Documento</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">🔢 Cola #</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">🤖 Análisis IA</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">🛡️ Integridad</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">📊 Estado</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">🔄 Reintentos</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">⚡ Acciones</th>
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
            <h4 className="font-semibold text-blue-800 mb-2">🎯 Gestión Manual Operativa</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>📁 Drag & Drop:</strong> Arrastra archivos directamente sobre las filas **moradas** de proyectos</li>
              <li>• <strong>🌐 Acceso Directo Nalanda:</strong> Abre Nalanda en nueva ventana optimizada</li>
              <li>• <strong>📋 Credenciales Mejoradas:</strong> Copia individual de usuario y contraseña con notificaciones</li>
              <li>• <strong>📦 Procesamiento por Lotes:</strong> Selecciona múltiples documentos para subida masiva</li>
              <li>• <strong>🤖 IA Integrada:</strong> Detecta automáticamente archivos corruptos y prioriza por urgencia</li>
              <li>• <strong>🏗️ Organización Jerárquica:</strong> Cliente → Empresa → Proyecto → Documentos</li>
              <li>• <strong>🎯 Selección Inteligente:</strong> Solo documentos pendientes o con error son seleccionables</li>
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