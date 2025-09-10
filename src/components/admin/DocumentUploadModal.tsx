import React, { useState, useEffect, useCallback } from 'react';
import { 
  Upload, 
  FileText, 
  Building2, 
  User, 
  CheckCircle, 
  AlertCircle,
  ChevronRight,
  ChevronDown,
  Plus,
  X as XIcon, // Renamed to avoid conflict with component prop
  Search,
  Save,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  getTenantEmpresas, 
  getEmpresaObras, 
  createEmpresa, 
  createObra, 
  getCurrentUserTenant,
  getAllClients, // For admin to select client
  logAuditoria,
  DEV_TENANT_ID 
} from '../../lib/supabase-real';
import { manualManagementService } from '../../lib/manual-management-service';

interface SelectedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
}

interface Empresa {
  id: string;
  nombre: string;
  codigo: string;
}

interface Obra {
  id: string;
  nombre: string;
  codigo_obra: string;
  direccion: string;
  cliente_final: string;
}

interface HierarchicalSelectorProps {
  onSelectionChange: (clientId: string | null, empresaId: string | null, obraId: string | null) => void;
  selectedClient: string | null;
  selectedEmpresa: string | null;
  selectedObra: string | null;
}

function AdminDocumentTargetSelector({ onSelectionChange, selectedClient, selectedEmpresa, selectedObra }: HierarchicalSelectorProps) {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [obras, setObras] = useState<{ [empresaId: string]: Obra[] }>({});
  const [expandedEmpresas, setExpandedEmpresas] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateEmpresa, setShowCreateEmpresa] = useState(false);
  const [showCreateObra, setShowCreateObra] = useState(false);
  const { user } = useAuth();

  const [newEmpresa, setNewEmpresa] = useState({
    nombre: '',
    codigo: ''
  });

  const [newObra, setNewObra] = useState({
    nombre: '',
    codigo_obra: '',
    direccion: '',
    cliente_final: ''
  });
  const [clients, setClients] = useState<any[]>([]); // For admin to select client
  const [filteredClients, setFilteredClients] = useState<any[]>([]);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [selectedClientTenantId, setSelectedClientTenantId] = useState<string | null>(null);

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    if (selectedClientTenantId) {
      loadEmpresas(selectedClientTenantId);
    } else {
      setEmpresas([]);
      setObras({});
    }
  }, [selectedClientTenantId]);

  const loadClients = async () => {
    try {
      const allClients = await getAllClients(); // Fetches from 'clients' table
      setClients(allClients);
      setFilteredClients(allClients);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const loadEmpresas = async (tenantId: string) => {
    try {
      setLoading(true);
      const empresasData = await getTenantEmpresas(tenantId);
      setEmpresas(empresasData);
    } catch (error) {
      console.error('Error loading empresas:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadObras = async (empresaId: string) => {
    try {
      const tenantId = selectedClientTenantId || user?.tenant_id || DEV_TENANT_ID;
      const obrasData = await getEmpresaObras(empresaId, tenantId);
      setObras(prev => ({ ...prev, [empresaId]: obrasData }));
    } catch (error) {
      console.error('Error loading obras:', error);
    }
  };

  const toggleEmpresa = async (empresaId: string) => {
    if (expandedEmpresas.includes(empresaId)) {
      setExpandedEmpresas(prev => prev.filter(id => id !== empresaId));
    } else {
      setExpandedEmpresas(prev => [...prev, empresaId]);
      if (!obras[empresaId] && selectedClientTenantId) {
        await loadObras(empresaId);
      }
    }
  };

  const handleClientSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setClientSearchTerm(term);
    if (term) {
      setFilteredClients(clients.filter(client =>
        client.company_name.toLowerCase().includes(term.toLowerCase()) ||
        client.email.toLowerCase().includes(term.toLowerCase())
      ));
    } else {
      setFilteredClients(clients);
    }
  };

  const handleCreateEmpresa = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tenantId = user?.tenant_id || DEV_TENANT_ID;
      await createEmpresa(newEmpresa.nombre, newEmpresa.codigo, tenantId);
      setNewEmpresa({ nombre: '', codigo: '' });
      setShowCreateEmpresa(false);
      loadEmpresas(tenantId);
    } catch (error) {
      console.error('Error creating empresa:', error);
    }
  };

  const handleCreateObra = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpresa || !selectedClientTenantId) return;

    try {
      const tenantId = user?.tenant_id || DEV_TENANT_ID;
      await createObra(
        newObra.nombre,
        newObra.codigo_obra,
        newObra.direccion,
        newObra.cliente_final,
        selectedEmpresa,
        tenantId
      );
      setNewObra({
        nombre: '',
        codigo_obra: '',
        direccion: '',
        cliente_final: ''
      });
      setShowCreateObra(false);
      loadObras(selectedEmpresa);
    } catch (error) {
      console.error('Error creating obra:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Seleccionar Cliente</h3>
      </div>
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar cliente por nombre o email..."
            value={clientSearchTerm}
            onChange={handleClientSearch}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="max-h-48 overflow-y-auto space-y-2">
          {filteredClients.length === 0 && clientSearchTerm ? (
            <div className="text-center text-gray-500 py-4">No se encontraron clientes.</div>
          ) : filteredClients.length === 0 && !clientSearchTerm ? (
            <div className="text-center text-gray-500 py-4">Cargando clientes...</div>
          ) : (
            filteredClients.map(client => (
              <div
                key={client.id}
                className={\`flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-gray-50 ${
                  selectedClient === client.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
                onClick={() => {
                  onSelectionChange(client.id, null, null);
                  setSelectedClientTenantId(client.tenant_id);
                }}
              >
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-blue-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">{client.company_name}</h4>
                    <p className="text-sm text-gray-600">{client.email}</p>
                  </div>
                </div>
                {selectedClient === client.id && (
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {selectedClient && (
        <>
          <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Seleccionar Destino</h3>
        <button
          onClick={() => setShowCreateEmpresa(true)}
          className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Nueva Empresa
        </button>
      </div>
      
      {!empresas || empresas.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No hay empresas disponibles</p>
          <p className="text-sm text-gray-400 mt-2">Crea una nueva empresa para comenzar</p>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg">
          {\empresas.map(empresa => (
            <div key={empresa.id} className="border-b border-gray-200 last:border-b-0">
              <div
                className={`flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 ${
                  selectedEmpresa === empresa.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
                onClick={(e) => {
                  onSelectionChange(selectedClient, empresa.id, null);
                  toggleEmpresa(empresa.id);
                }}
              >
                <div className="flex items-center space-x-3">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">{empresa.nombre}</h4>
                    <p className="text-sm text-gray-600">Código: {empresa.codigo}</p>
                  </div>
                </div>
                {expandedEmpresas.includes(empresa.id) ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </div>

              {expandedEmpresas.includes(empresa.id) && (
                <div className="px-4 pb-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-sm font-medium text-gray-700">Proyectos/Obras</h5>
                    <button
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        setShowCreateObra(true);
                      }}
                      className="flex items-center space-x-1 px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Nueva Obra</span>
                    </button>
                  </div>

                  {!obras[empresa.id] || obras[empresa.id].length === 0 ? (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      No hay obras disponibles
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {obras[empresa.id].map(obra => (
                        <div
                          key={obra.id}
                          className={`p-3 rounded-lg cursor-pointer ${
                            selectedObra === obra.id 
                              ? 'bg-green-100 border border-green-300' 
                              : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectionChange(selectedClient, empresa.id, obra.id);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h6 className="font-medium text-gray-900">{obra.nombre}</h6>
                              <p className="text-xs text-gray-600">Código: {obra.codigo_obra}</p>
                            </div>
                            {selectedObra === obra.id && <CheckCircle className="w-4 h-4 text-green-600" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Empresa Modal */}
      {showCreateEmpresa && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Nueva Empresa</h3>
              <button
                onClick={() => setShowCreateEmpresa(false)} // Use XIcon here
                className="text-gray-400 hover:text-gray-600"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateEmpresa} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la Empresa
                </label>
                <input
                  type="text"
                  value={newEmpresa.nombre}
                  onChange={(e) => setNewEmpresa(prev => ({ ...prev, nombre: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código
                </label>
                <input
                  type="text"
                  value={newEmpresa.codigo}
                  onChange={(e) => setNewEmpresa(prev => ({ ...prev, codigo: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateEmpresa(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Crear Empresa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Obra Modal */}
      {showCreateObra && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Nueva Obra</h3>
              <button
                onClick={() => setShowCreateObra(false)} // Use XIcon here
                className="text-gray-400 hover:text-gray-600"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateObra} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la Obra
                </label>
                <input
                  type="text"
                  value={newObra.nombre}
                  onChange={(e) => setNewObra(prev => ({ ...prev, nombre: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código de Obra
                </label>
                <input
                  type="text"
                  value={newObra.codigo_obra}
                  onChange={(e) => setNewObra(prev => ({ ...prev, codigo_obra: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección
                </label>
                <input
                  type="text"
                  value={newObra.direccion}
                  onChange={(e) => setNewObra(prev => ({ ...prev, direccion: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cliente Final
                </label>
                <input
                  type="text"
                  value={newObra.cliente_final}
                  onChange={(e) => setNewObra(prev => ({ ...prev, cliente_final: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateObra(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Crear Obra
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}

export default function DocumentUploadModal() {
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [selectedEmpresa, setSelectedEmpresa] = useState<string | null>(null);
  const [selectedObra, setSelectedObra] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [fileId: string]: number }>({});
  const [uploadResults, setUploadResults] = useState<{ [fileId: string]: { success: boolean; message: string } }>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const { user } = useAuth();

  const documentCategories = [
    { value: 'planos', label: 'Planos' },
    { value: 'especificaciones', label: 'Especificaciones Técnicas' },
    { value: 'memorias', label: 'Memorias de Cálculo' },
    { value: 'informes', label: 'Informes' },
    { value: 'certificados', label: 'Certificados' },
    { value: 'manuales', label: 'Manuales' },
    { value: 'otros', label: 'Otros' }
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newSelectedFiles: SelectedFile[] = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      size: file.size,
      type: file.type
    }));
    setSelectedFiles(prev => [...prev, ...newSelectedFiles]);
  };

  const removeFile = (fileId: string) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== fileId));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileId];
      return newProgress;
    });
    setUploadResults(prev => {
      const newResults = { ...prev };
      delete newResults[fileId];
      return newResults;
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleUpload = async () => {
    if (!selectedEmpresa || !selectedObra || !selectedCategory || selectedFiles.length === 0) {
      return;
    }

    setUploading(true);

    for (const selectedFile of selectedFiles) {
      try { // Ensure selectedFile.file is a valid File/Blob object
        // Validación crítica: verificar que el objeto file es realmente un File/Blob
        if (!(selectedFile.file instanceof File) && !(selectedFile.file instanceof Blob)) {
          console.error('❌ Invalid file object type:', {
            fileName: selectedFile.name,
            fileType: typeof selectedFile.file,
            fileConstructor: selectedFile.file?.constructor?.name,
            isFile: selectedFile.file instanceof File,
            isBlob: selectedFile.file instanceof Blob
          });
          
          setUploadResults(prev => ({
            ...prev,
            [selectedFile.id]: {
              success: false,
              message: 'Error: Tipo de archivo inválido'
            }
          }));
          continue;
        }

        setUploadProgress(prev => ({
          ...prev,
          [selectedFile.id]: 0
        }));

        // Upload to manual queue with real file storage
        console.log('📁 Starting real file upload to manual queue...'); // Log the start of the upload
        console.log('📁 File validation passed:', {
          fileName: selectedFile.file.name,
          fileSize: selectedFile.file.size,
          fileType: selectedFile.file.type,
          isFile: selectedFile.file instanceof File,
          isBlob: selectedFile.file instanceof Blob
        });
        
        const document = await manualManagementService.addDocumentToQueue( // Call the service to add document
          selectedEmpresa, // clientId
          selectedObra,    // projectId
          selectedFile.file,
          selectedCategory,
          (progress) => {
            setUploadProgress(prev => ({
              ...prev,
              [selectedFile.id]: progress
            }));
          }
        );

        setUploadResults(prev => ({
          ...prev,
          [selectedFile.id]: {
            success: true,
            message: 'Archivo subido exitosamente'
          }
        }));

        // Log audit event
        const tenantId = user?.tenant_id || DEV_TENANT_ID; // Use current user's tenant ID
        await logAuditoria(
          tenantId,
          user?.id || 'unknown-user',
          'document_upload',
          'documents',
          document.id,
          `Documento subido: ${selectedFile.name}`
        );

      } catch (error) {
        console.error('Upload error:', error);
        setUploadResults(prev => ({
          ...prev,
          [selectedFile.id]: {
            success: false,
            message: error instanceof Error ? error.message : 'Error desconocido'
          }
        }));
      }
    }

    setUploading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Subir Documentos</h2>
      </div>

      {/* Hierarchical Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"> {/* Hierarchical selector for admin */}
        <AdminDocumentTargetSelector
          onSelectionChange={(clientId, empresaId, obraId) => {
            setSelectedClient(clientId);
            setSelectedEmpresa(empresaId);
            setSelectedObra(obraId);
          }}
          selectedClient={selectedClient}
          selectedEmpresa={selectedEmpresa}
          selectedObra={selectedObra}
        />
        {/* Pass selectedClient to the selector */}
      </div>

      {/* Category Selection */}
      {selectedClient && selectedEmpresa && selectedObra && ( // Only show category selection after all hierarchy is selected
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Categoría del Documento</h3>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Seleccionar categoría...</option>
            {documentCategories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* File Upload Area */}
      {selectedClient && selectedEmpresa && selectedObra && selectedCategory && ( // Only show file upload after all hierarchy and category are selected
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Archivos</h3>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <div className="space-y-2">
              <p className="text-lg text-gray-600">Arrastra archivos aquí o</p>
              <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
                <span>Seleccionar archivos</span>
                <input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.dwg,.dxf"
                />
              </label>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Formatos soportados: PDF, DOC, XLS, PPT, imágenes, CAD
            </p>
          </div>

          {/* Selected Files List */}
          {selectedFiles.length > 0 && (
            <div className="mt-6 space-y-3">
              <h4 className="font-medium text-gray-900">Archivos seleccionados ({selectedFiles.length})</h4>
              {selectedFiles.map(file => (
                <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-600">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {/* Upload Progress */}
                    {uploadProgress[file.id] !== undefined && (
                      <div className="w-32">
                        <div className="bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress[file.id]}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{uploadProgress[file.id]}%</p>
                      </div>
                    )}
                    
                    {/* Upload Result */}
                    {uploadResults[file.id] && (
                      <div className="flex items-center space-x-2">
                        {uploadResults[file.id].success ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-600" />
                        )}
                        <span className={`text-sm ${uploadResults[file.id].success ? 'text-green-600' : 'text-red-600'}`}>
                          {uploadResults[file.id].message}
                        </span>
                      </div>
                    )}
                    
                    {/* Remove Button */}
                    {!uploading && (
                      <button
                        onClick={() => removeFile(file.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <XIcon className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upload Button */}
          {selectedFiles.length > 0 && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Subiendo...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    <span>Subir Archivos ({selectedFiles.length})</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Selection Summary */}
      {(selectedClient || selectedEmpresa || selectedObra) && ( // Show summary if any part of hierarchy is selected
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">Destino Seleccionado</h4>
          <div className="text-sm text-blue-700">
            {selectedClient && <p>Cliente: {selectedClient}</p>}
            {selectedEmpresa && <p>Empresa: {selectedEmpresa}</p>}
            {selectedObra && <p>Obra: {selectedObra}</p>}
            {selectedCategory && <p>Categoría: {documentCategories.find(c => c.value === selectedCategory)?.label}</p>}
          </div>
        </div>
      )}
    </div>
  );
}