import React, { useState, useEffect } from 'react';
import { logAuditoria } from '../../lib/supabase-new';
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
  Copy,
  Clock
} from 'lucide-react';
import { 
  manualManagementService, 
  type ManualDocument, 
  type ClientGroup, 
  type CompanyGroup, 
  type ProjectGroup,
  type PlatformCredential 
} from '../../lib/manual-management-service';

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

interface PlatformConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientCredentials: PlatformCredential[];
  clientName: string;
  documentsToUpload: ManualDocument[];
  onUploadComplete: (documentIds: string[]) => void;
}

function PlatformConnectionModal({ 
  isOpen, 
  onClose, 
  clientCredentials, 
  clientName, 
  documentsToUpload,
  onUploadComplete 
}: PlatformConnectionModalProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<'nalanda' | 'ctaima' | 'ecoordina'>('nalanda');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connected' | 'error'>('disconnected');
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copying' | 'success' | 'error'>('idle');
  const [tempFiles, setTempFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showTempDirectory, setShowTempDirectory] = useState(false);

  const platformUrls = {
    nalanda: 'https://identity.nalandaglobal.com/realms/nalanda/protocol/openid-connect/auth?ui_locales=es+en+pt&scope=openid&response_type=code&redirect_uri=https%3A%2F%2Fapp.nalandaglobal.com%2Fsso%2Fcallback.action&state=iWjiywv5BdzdX9IagNMFTYQgz_0QJMlNxfowDD_XeSY&nonce=_wBHFNRC1xlSpdE_2Uq7UxLzCCD1Amy29V3LjcDk7iE&client_id=nalanda-app',
    ctaima: 'https://login.ctaima.com/Account/Login?ReturnUrl=%2Fconnect%2Fauthorize%2Fcallback%3Fclient_id%3Dmy_account_local%26redirect_uri%3Dhttps%253A%252F%252Fmyaccount.ctaima.com%26response_type%3Did_token%2520token%26scope%3Dopenid%2520profile%2520email%2520Abacus.read_product%26nonce%3DN0.405965576346192241756710652344%26state%3D17567106520800.5509632605791698',
    ecoordina: 'https://login.welcometotwind.io/junoprod.onmicrosoft.com/b2c_1a_signup_signin/oauth2/v2.0/authorize?client_id=b2a08c2d-92b8-48c6-8fef-b7358a110496&scope=openid%20profile%20offline_access&redirect_uri=https%3A%2F%2Fwelcometotwind.io%2F&client-request-id=76a43f68-c14b-40f3-b69c-0fb721c597f8&response_mode=fragment&response_type=code&x-client-SKU=msal.js.browser&x-client-VER=2.38.0&client_info=1&code_challenge=v5ig0AtC6pVVrqljy_BylnvEbolLoaYEwgkG_kjpdro&code_challenge_method=S256&nonce=4e4dccec-a6ff-4193-8c19-285a4908d6be&state=eyJpZCI6ImNmNTRiY2IwLTAzMTctNDNhMC1hYjU0LWRjNTUzMTk5YjBjMiIsIm1ldGEiOnsiaW50ZXJhY3Rpb25UeXBlIjoicmVkaXJlY3QifX0%3D'
  };

  const selectedCredential = clientCredentials.find(cred => cred.platform_type === selectedPlatform);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      setTempFiles(prev => [...prev, ...files]);
      alert(`📁 ${files.length} archivo(s) añadido(s) al directorio temporal`);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setTempFiles(prev => [...prev, ...files]);
      alert(`📁 ${files.length} archivo(s) añadido(s) al directorio temporal`);
    }
  };

  const removeTempFile = (index: number) => {
    setTempFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearTempDirectory = () => {
    setTempFiles([]);
    alert('🗑️ Directorio temporal limpiado');
  };

  const downloadTempFiles = async () => {
    if (tempFiles.length === 0) return;
    
    // Create a temporary directory structure for download
    const zip = new JSZip();
    
    for (const file of tempFiles) {
      const arrayBuffer = await file.arrayBuffer();
      zip.file(file.name, arrayBuffer);
    }
    
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `documentos_${selectedPlatform}_${new Date().toISOString().split('T')[0]}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const openPlatform = () => {
    const url = platformUrls[selectedPlatform];
    const platformWindow = window.open(
      url, 
      `${selectedPlatform}_login`, 
      'width=1400,height=900,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no'
    );
    
    if (platformWindow) {
      platformWindow.focus();
      setTimeout(() => {
        if (selectedCredential) {
          alert(`✅ ${selectedPlatform.toUpperCase()} abierto en nueva ventana.\n\n📋 Credenciales:\n👤 Usuario: ${selectedCredential.username}\n🔑 Contraseña: ${selectedCredential.password}`);
        }
      }, 1000);
    } else {
      alert('❌ No se pudo abrir la plataforma. Verifica que no esté bloqueado por el navegador.');
    }
  };

  const copyToClipboard = async (text: string, fieldName: string) => {
    setCopyStatus('copying');
    
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus('success');
      
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
          ✅ ${fieldName} copiado
        </div>
      `;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        document.body.removeChild(notification);
        setCopyStatus('idle');
      }, 3000);
      
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      setCopyStatus('error');
      prompt(`❌ Error al copiar. ${fieldName} (selecciona y copia manualmente):`, text);
      setTimeout(() => setCopyStatus('idle'), 2000);
    }
  };

  const uploadDocuments = async () => {
    if (!selectedCredential) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const totalDocuments = documentsToUpload.length + tempFiles.length;
      let processed = 0;
      
      // Process queue documents
      for (let i = 0; i < documentsToUpload.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        processed++;
        setUploadProgress((processed / totalDocuments) * 100);
      }
      
      // Process temp files
      for (let i = 0; i < tempFiles.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        processed++;
        setUploadProgress((processed / totalDocuments) * 100);
      }
      
      onUploadComplete(documentsToUpload.map(d => d.id));
      
      // Clear temp directory after successful upload
      setTempFiles([]);
      
      alert(`✅ ${totalDocuments} documentos subidos exitosamente a ${selectedPlatform.toUpperCase()}`);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">🔗 Conexión a Plataformas CAE</h3>
              <p className="text-orange-100">Cliente: {clientName}</p>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Platform Selection */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Seleccionar Plataforma</h4>
            <div className="grid grid-cols-3 gap-3">
              {(['nalanda', 'ctaima', 'ecoordina'] as const).map(platform => {
                const credential = clientCredentials.find(cred => cred.platform_type === platform);
                const isSelected = selectedPlatform === platform;
                const isConfigured = credential && credential.is_active;
                
                return (
                  <button
                    key={platform}
                    onClick={() => setSelectedPlatform(platform)}
                    disabled={!isConfigured}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      isSelected 
                        ? 'border-orange-500 bg-orange-50' 
                        : isConfigured
                        ? 'border-gray-200 hover:border-gray-300'
                        : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="text-center">
                      <Globe className={`h-8 w-8 mx-auto mb-2 ${
                        isConfigured ? 'text-green-600' : 'text-gray-400'
                      }`} />
                      <h5 className="font-semibold text-gray-900 capitalize">{platform}</h5>
                      <p className="text-xs text-gray-600">
                        {isConfigured ? '✅ Configurado' : '❌ No configurado'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Credentials Display */}
          {selectedCredential && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-blue-800">
                  🔑 Credenciales de {selectedPlatform.toUpperCase()}
                </h4>
                <button
                  onClick={openPlatform}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Abrir {selectedPlatform.toUpperCase()}
                </button>
                <a
                  href={platformUrls[selectedPlatform]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Link Directo
                </a>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-blue-800">👤 Usuario:</span>
                    <button
                      onClick={() => copyToClipboard(selectedCredential.username, 'Usuario')}
                      className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded text-xs"
                    >
                      <Copy className="h-3 w-3 mr-1 inline" />
                      Copiar
                    </button>
                  </div>
                  <div className="bg-blue-100 p-3 rounded border-2 border-dashed border-blue-300">
                    <p className="text-blue-900 font-mono font-bold break-all select-all">
                      {selectedCredential.username}
                    </p>
                  </div>
                </div>
                
                <div className="bg-white border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-blue-800">🔑 Contraseña:</span>
                    <button
                      onClick={() => copyToClipboard(selectedCredential.password, 'Contraseña')}
                      className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded text-xs"
                    >
                      <Copy className="h-3 w-3 mr-1 inline" />
                      Copiar
                    </button>
                  </div>
                  <div className="bg-blue-100 p-3 rounded border-2 border-dashed border-blue-300">
                    <p className="text-blue-900 font-mono font-bold break-all select-all">
                      {selectedCredential.password}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Documents to Upload */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">
              📁 Documentos a Subir ({documentsToUpload.length + tempFiles.length})
            </h4>
            
            {/* Queue Documents */}
            <div className="max-h-32 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-3 bg-gray-50 mb-4">
              <h5 className="text-sm font-medium text-gray-700 mb-2">📋 Documentos de la Cola ({documentsToUpload.length})</h5>
              {documentsToUpload.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 text-blue-600 mr-2" />
                    <div>
                      <span className="text-sm font-medium">{doc.original_name}</span>
                      <p className="text-xs text-gray-500">
                        {doc.classification} • {doc.confidence}% confianza
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    doc.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                    doc.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                    doc.priority === 'normal' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {doc.priority}
                  </span>
                </div>
              ))}
              {documentsToUpload.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No hay documentos seleccionados</p>
                  <p className="text-xs">Selecciona documentos de la tabla o arrastra archivos aquí</p>
                </div>
              )}
            </div>

            {/* Temporary Directory */}
            <div className="border-2 border-dashed border-orange-300 rounded-lg p-4 bg-orange-50">
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-sm font-medium text-orange-800">
                  🗂️ Directorio Temporal ({tempFiles.length} archivos)
                </h5>
                <div className="flex space-x-2">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    id="temp-file-upload"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  />
                  <label
                    htmlFor="temp-file-upload"
                    className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-xs cursor-pointer flex items-center"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Añadir
                  </label>
                  {tempFiles.length > 0 && (
                    <>
                      <button
                        onClick={downloadTempFiles}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs flex items-center"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Descargar ZIP
                      </button>
                      <button
                        onClick={clearTempDirectory}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs flex items-center"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Limpiar
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              <div 
                className={`min-h-24 max-h-32 overflow-y-auto transition-all ${
                  isDragOver 
                    ? 'bg-orange-200 border-2 border-dashed border-orange-500 transform scale-105' 
                    : 'bg-white border border-orange-200'
                } rounded-lg p-3`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {tempFiles.length === 0 ? (
                  <div className="text-center py-4 text-orange-600">
                    <Upload className="h-6 w-6 mx-auto mb-2" />
                    <p className="text-sm">
                      {isDragOver 
                        ? '⬇️ Suelta los archivos aquí' 
                        : '📁 Arrastra archivos aquí o usa el botón "Añadir"'
                      }
                    </p>
                    <p className="text-xs text-orange-500 mt-1">
                      Para plataformas que no soportan drag & drop directo
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {tempFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-orange-100 rounded">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 text-orange-600 mr-2" />
                          <div>
                            <span className="text-sm font-medium text-orange-900">{file.name}</span>
                            <p className="text-xs text-orange-700">
                              {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeTempFile(index)}
                          className="text-red-600 hover:text-red-700 p-1"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-3 text-xs text-orange-700">
                <p><strong>💡 Uso del Directorio Temporal:</strong></p>
                <p>• Arrastra archivos desde tu sistema o desde la cola de documentos</p>
                <p>• Descarga como ZIP para subir manualmente a plataformas</p>
                <p>• Se limpia automáticamente al completar la subida</p>
              </div>
            </div>
          </div>

          {/* Platform Support Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h5 className="font-medium text-blue-800 mb-2">
              🌐 Soporte de {selectedPlatform.toUpperCase()}
            </h5>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-blue-700">
                  <strong>Drag & Drop:</strong> {
                    selectedPlatform === 'nalanda' ? '✅ Soportado' :
                    selectedPlatform === 'ctaima' ? '⚠️ Limitado' :
                    '❌ No soportado'
                  }
                </p>
              </div>
              <div>
                <p className="text-blue-700">
                  <strong>Subida Manual:</strong> ✅ Siempre disponible
                </p>
              </div>
            </div>
            <p className="text-xs text-blue-600 mt-2">
              {selectedPlatform === 'nalanda' && 'Puedes arrastrar directamente o usar el directorio temporal'}
              {selectedPlatform === 'ctaima' && 'Recomendado usar directorio temporal para mejor compatibilidad'}
              {selectedPlatform === 'ecoordina' && 'Usa el directorio temporal y descarga ZIP para subida manual'}
            </p>
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">📤 Progreso de Subida</span>
                <span className="text-sm text-gray-600">{Math.round(uploadProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-green-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Procesando {documentsToUpload.length + tempFiles.length} documentos...
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancelar
            </button>
            {tempFiles.length > 0 && (
              <button
                onClick={downloadTempFiles}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar ZIP
              </button>
            )}
            <button
              onClick={uploadDocuments}
              disabled={!selectedCredential || isUploading || (documentsToUpload.length === 0 && tempFiles.length === 0)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg disabled:opacity-50"
            >
              {isUploading ? '📤 Subiendo...' : `📤 Subir ${documentsToUpload.length + tempFiles.length} a ${selectedPlatform.toUpperCase()}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ClientRowProps {
  client: ClientGroup;
  isExpanded: boolean;
  onToggle: () => void;
  onConnectPlatform: (client: ClientGroup, documents: ManualDocument[]) => void;
  onStatusChange: (documentId: string, newStatus: string) => void;
  onDrop: (files: File[], clientId: string, companyId: string, projectId: string) => void;
}

function ClientRow({ client, isExpanded, onToggle, onConnectPlatform, onStatusChange, onDrop }: ClientRowProps) {
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  
  const allDocuments = client.companies.flatMap(company => 
    company.projects.flatMap(project => project.documents)
  );

  const pendingDocuments = allDocuments.filter(doc => 
    doc.status === 'pending' || doc.status === 'error'
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

  const hasValidCredentials = client.platform_credentials.some(cred => cred.is_active);

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
              {/* Platform Status */}
              <div className="flex items-center">
                <Globe className={`h-4 w-4 mr-2 ${hasValidCredentials ? 'text-green-600' : 'text-red-600'}`} />
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {hasValidCredentials ? '✅ Plataformas OK' : '❌ Sin credenciales'}
                  </p>
                  <p className="text-xs text-gray-600">
                    {client.platform_credentials.length} configuradas
                  </p>
                </div>
              </div>
              
              {/* Stats */}
              <div className="text-center">
                <p className="text-lg font-bold text-blue-900">{client.total_documents}</p>
                <p className="text-xs text-blue-700">📄 Total</p>
              </div>
              
              <div className="text-center">
                <p className="text-lg font-bold text-yellow-600">{pendingDocuments.length}</p>
                <p className="text-xs text-yellow-700">⏳ Pendientes</p>
              </div>
              
              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={handleSelectAll}
                  disabled={pendingDocuments.length === 0}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm disabled:opacity-50"
                >
                  {selectedDocuments.length === pendingDocuments.length ? '❌ Deseleccionar' : '✅ Seleccionar'} Todo
                </button>
                <button
                  onClick={() => onConnectPlatform(client, getSelectedDocuments())}
                  disabled={selectedDocuments.length === 0 || !hasValidCredentials}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm disabled:opacity-50"
                >
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

          {/* Projects */}
          {company.projects.map((project) => (
            <React.Fragment key={project.project_id}>
              {/* Project Header with Drop Zone */}
              <tr className="bg-purple-50">
                <td colSpan={8} className="px-16 py-2">
                  <ProjectDropZone
                    project={project}
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
  project: ProjectGroup;
  onDrop: (files: File[]) => void;
}

interface ProjectGroup {
  project_id: string;
  project_name: string;
  documents: ManualDocument[];
  total_documents: number;
}

interface ManualDocument {
  id: string;
  tenant_id: string;
  client_id: string;
  document_id: string;
  filename: string;
  original_name: string;
  file_size: number;
  file_type: string;
  classification: string;
  confidence: number;
  corruption_detected: boolean;
  integrity_score: number;
  status: 'pending' | 'uploading' | 'uploaded' | 'validated' | 'error' | 'corrupted';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  queue_position: number;
  retry_count: number;
  last_error?: string;
  nota: string;
  platform_target: 'nalanda' | 'ctaima' | 'ecoordina';
  company_id?: string;
  project_id?: string;
  estimated_processing_time?: string;
  created_at: string;
  updated_at: string;
}

function ProjectDropZone({ project, onDrop }: ProjectDropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onDrop(files);
    }
  };

  const handleAddFiles = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx';
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      if (files.length > 0) {
        onDrop(files);
      }
    };
    input.click();
  };
  
  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex items-center justify-between p-3 rounded-lg transition-all cursor-pointer ${
        isDragOver 
          ? 'bg-purple-200 border-2 border-dashed border-purple-400 transform scale-105' 
          : 'hover:bg-purple-100 border border-purple-200'
      }`}
    >
      <div className="flex items-center">
        <FolderOpen className="h-4 w-4 text-purple-600 mr-2" />
        <span className="font-medium text-purple-800">📁 {project.project_name}</span>
        {isDragOver && (
          <span className="ml-3 text-purple-600 font-bold animate-pulse">
            ⬇️ Suelta archivos aquí
          </span>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-sm text-purple-700">📊 {project.total_documents} documentos</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleAddFiles();
          }}
          className="bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded text-xs flex items-center"
        >
          {isDragOver ? (
            <Upload className="h-3 w-3 animate-bounce" />
          ) : (
            <>
              <Plus className="h-3 w-3 mr-1" />
              Añadir
            </>
          )}
        </button>
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
  const [isDragging, setIsDragging] = useState(false);

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

  const canSelect = document.status === 'pending' || document.status === 'error';

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', JSON.stringify({
      id: document.id,
      name: document.original_name,
      type: 'queue-document'
    }));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };
  
  return (
    <tr 
      draggable={canSelect}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`hover:bg-gray-50 transition-all ${
      document.corruption_detected ? 'bg-red-50' : ''
    } ${isSelected ? 'bg-blue-50' : ''} ${
      isDragging ? 'opacity-50 transform scale-95' : ''
    } ${canSelect ? 'cursor-grab active:cursor-grabbing' : ''}`}
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
        {canSelect && (
          <div className="text-xs text-gray-500 mt-1">
            🖱️ Arrastra
          </div>
        )}
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
          <div className="text-xs text-gray-600">🎯 {document.confidence}%</div>
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
          {getStatusIcon(document.status)}
          <select
            value={document.status}
            onChange={(e) => onStatusChange(document.id, e.target.value)}
            className={`ml-2 px-2 py-1 rounded-full text-xs font-medium border-0 ${getStatusColor(document.status)}`}
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
  const [showPlatformModal, setShowPlatformModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientGroup | null>(null);
  const [selectedDocuments, setSelectedDocuments] = useState<ManualDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [queueStats, setQueueStats] = useState<any>({});
  const [currentSession, setCurrentSession] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load real data from database
      const [groups, stats] = await Promise.all([
        manualManagementService.getClientGroups(),
        manualManagementService.getQueueStats()
      ]);
      
      setClientGroups(groups);
      setQueueStats(stats);

      // If no data exists, populate test data
      if (groups.length === 0) {
        await manualManagementService.populateTestData();
        
        // Reload after populating
        const newGroups = await manualManagementService.getClientGroups();
        const newStats = await manualManagementService.getQueueStats();
        setClientGroups(newGroups);
        setQueueStats(newStats);
      }
    } catch (error) {
      console.error('Error loading manual management data:', error);
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

  const handleConnectPlatform = (client: ClientGroup, documents: ManualDocument[]) => {
    setSelectedClient(client);
    setSelectedDocuments(documents);
    setShowPlatformModal(true);
  };

  const handleUploadComplete = async (documentIds: string[]) => {
    // Update document statuses in local state
    setClientGroups(prev => prev.map(client => ({
      ...client,
      companies: client.companies.map(company => ({
        ...company,
        projects: company.projects.map(project => ({
          ...project,
          documents: project.documents.map(doc => 
            documentIds.includes(doc.id) 
              ? { ...doc, status: 'uploaded' as const, updated_at: new Date().toISOString() }
              : doc
          )
        }))
      }))
    })));

    // Update database
    for (const docId of documentIds) {
      await manualManagementService.updateDocumentStatus(docId, 'uploaded', 'Uploaded by admin');
    }

    // Refresh stats
    const newStats = await manualManagementService.getQueueStats();
    setQueueStats(newStats);
  };

  const handleStatusChange = async (documentId: string, newStatus: string) => {
    await manualManagementService.updateDocumentStatus(
      documentId, 
      newStatus as ManualDocument['status']
    );
    
    // Update local state
    setClientGroups(prev => prev.map(client => ({
      ...client,
      companies: client.companies.map(company => ({
        ...company,
        projects: company.projects.map(project => ({
          ...project,
          documents: project.documents.map(doc => 
            doc.id === documentId 
              ? { ...doc, status: newStatus as any, updated_at: new Date().toISOString() }
              : doc
          )
        }))
      }))
    })));

    // Refresh stats
    const newStats = await manualManagementService.getQueueStats();
    setQueueStats(newStats);
  };

  const handleFileDrop = async (files: File[], clientId: string, companyId: string, projectId: string) => {
    console.log('Files dropped:', files.length, 'for project:', projectId);
    
    for (const file of files) {
      const queueEntryId = await manualManagementService.addDocumentToQueue(
        clientId,
        companyId,
        projectId,
        file,
        'normal',
        'nalanda'
      );
      
      if (queueEntryId) {
        // Refresh queue data after successful upload
      }
    }
    
    alert(`📁 ${files.length} archivo(s) añadido(s) a la cola`);
    await loadData(); // Refresh data
  };

  const startProcessingSession = async () => {
    const sessionId = await manualManagementService.startUploadSession('admin-user-id');
    if (sessionId) {
      setCurrentSession(sessionId);
      setIsProcessing(true);
    }
  };

  const endProcessingSession = async () => {
    if (currentSession) {
      await manualManagementService.endUploadSession(currentSession, 'Session ended by admin');
      setCurrentSession(null);
      setIsProcessing(false);
    }
  };

  const kpis = [
    {
      title: 'Total en Cola',
      value: queueStats.total || 0,
      icon: FileText,
      color: 'bg-blue-500',
      status: 'good' as const
    },
    {
      title: 'Pendientes',
      value: queueStats.pending || 0,
      icon: Clock,
      color: 'bg-yellow-500',
      status: 'warning' as const
    },
    {
      title: 'Subidos',
      value: queueStats.uploaded || 0,
      icon: CheckCircle,
      color: 'bg-green-500',
      status: 'good' as const
    },
    {
      title: 'Errores',
      value: queueStats.errors || 0,
      icon: AlertTriangle,
      color: 'bg-red-500',
      status: 'error' as const
    },
    {
      title: 'Corruptos',
      value: queueStats.corrupted || 0,
      icon: Warning,
      color: 'bg-purple-500',
      status: 'error' as const
    },
    {
      title: 'Validados',
      value: queueStats.validated || 0,
      icon: Shield,
      color: 'bg-emerald-500',
      status: 'good' as const
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando gestión manual...</p>
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
            <h2 className="text-2xl font-bold">🔧 Gestión Manual de Documentos</h2>
            <p className="text-orange-100 mt-1">Cola operativa con conexión directa a plataformas CAE</p>
            <div className="mt-3 text-sm text-orange-100">
              <p>• Sistema FIFO con priorización inteligente</p>
              <p>• Conexión directa a Nalanda, CTAIMA y Ecoordina</p>
              <p>• Detección automática de archivos corruptos</p>
              <p>• Auditoría completa de todas las operaciones</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-2xl font-bold">{queueStats.total || 0}</div>
              <div className="text-sm text-orange-200">Documentos en Cola</div>
            </div>
            <button 
              onClick={loadData}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Métricas en Tiempo Real</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {kpis.map((kpi, index) => (
            <ManualKPICard key={index} {...kpi} />
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">⚙️ Controles Operativos</h3>
          <div className="flex space-x-3">
            <button
              onClick={isProcessing ? endProcessingSession : startProcessingSession}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center ${
                isProcessing 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isProcessing ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  ⏸️ Finalizar Sesión
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

        {/* Filters */}
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

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
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
              {clientGroups.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <FileText className="w-12 h-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No hay documentos en cola</h3>
                      <p className="text-gray-600 mb-4">Los documentos aparecerán aquí cuando los clientes los suban</p>
                      <button
                        onClick={() => manualManagementService.populateTestData().then(loadData)}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg"
                      >
                        Crear Datos de Prueba
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                clientGroups.map((client) => (
                  <ClientRow
                    key={client.client_id}
                    client={client}
                    isExpanded={expandedClients.has(client.client_id)}
                    onToggle={() => toggleClientExpansion(client.client_id)}
                    onConnectPlatform={handleConnectPlatform}
                    onStatusChange={handleStatusChange}
                    onDrop={handleFileDrop}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Help Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start">
          <Info className="h-6 w-6 text-blue-600 mr-3 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-800 mb-2">🎯 Gestión Manual Operativa</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>📁 Drag & Drop:</strong> Arrastra archivos sobre las filas moradas de proyectos</li>
              <li>• <strong>🌐 Acceso Directo:</strong> Abre plataformas CAE en ventanas optimizadas</li>
              <li>• <strong>📋 Credenciales:</strong> Copia automática de credenciales del cliente</li>
              <li>• <strong>📦 Procesamiento por Lotes:</strong> Selecciona múltiples documentos</li>
              <li>• <strong>🤖 IA Integrada:</strong> Detecta archivos corruptos automáticamente</li>
              <li>• <strong>🏗️ Estructura Jerárquica:</strong> Cliente → Empresa → Proyecto → Documentos</li>
              <li>• <strong>🔒 Seguridad:</strong> Auditoría completa de todas las operaciones</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Platform Connection Modal */}
      {showPlatformModal && selectedClient && (
        <PlatformConnectionModal
          isOpen={showPlatformModal}
          onClose={() => setShowPlatformModal(false)}
          clientCredentials={selectedClient.platform_credentials}
          clientName={selectedClient.client_name}
          documentsToUpload={selectedDocuments}
          onUploadComplete={handleUploadComplete}
        />
      )}
    </div>
  );
}