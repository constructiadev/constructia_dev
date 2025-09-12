import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Building2, 
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Plus,
  X,
  Save,
  Loader2
} from 'lucide-react';
import { 
  getTenantEmpresas, 
  getEmpresaObras, 
  createEmpresa, 
  createObra, 
  getCurrentUserTenant,
  logAuditoria,
  DEV_TENANT_ID,
  DEV_ADMIN_USER_ID
} from '../../lib/supabase-real';
import { useAuth } from '../../lib/auth-context';
import { manualManagementService } from '../../lib/manual-management-service';

interface Empresa {
  id: string;
  razon_social: string;
  cif: string;
  direccion?: string;
  contacto_email?: string;
}

interface Obra {
  id: string;
  nombre_obra: string;
  codigo_obra: string;
  empresa_id: string;
  direccion?: string;
  cliente_final?: string;
}

interface SelectedFile {
  file: File;
  id: string;
  preview?: string;
}

interface HierarchicalSelectorProps {
  onSelectionChange: (empresaId: string | null, obraId: string | null, empresa?: Empresa, obra?: Obra) => void;
  selectedEmpresa: string | null;
  selectedObra: string | null;
}

function HierarchicalSelector({ onSelectionChange, selectedEmpresa, selectedObra }: HierarchicalSelectorProps) {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [obras, setObras] = useState<{ [empresaId: string]: Obra[] }>({});
  const [expandedEmpresas, setExpandedEmpresas] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateEmpresa, setShowCreateEmpresa] = useState(false);
  const [showCreateObra, setShowCreateObra] = useState(false);
  const { user } = useAuth();
  const [newEmpresa, setNewEmpresa] = useState({
    razon_social: '',
    cif: '',
    direccion: '',
    contacto_email: ''
  });
  const [newObra, setNewObra] = useState({
    nombre_obra: '',
    codigo_obra: '',
    direccion: '',
    cliente_final: ''
  });

  useEffect(() => {
    loadEmpresas();
  }, []);

  const loadEmpresas = async () => {
    try {
      setLoading(true);
      const tenantId = user?.tenant_id || DEV_TENANT_ID;
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
      const tenantId = user?.tenant_id || DEV_TENANT_ID;
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
      if (!obras[empresaId]) {
        await loadObras(empresaId);
      }
    }
  };

  const handleCreateEmpresa = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tenantId = user?.tenant_id || DEV_TENANT_ID;
      const empresa = await createEmpresa(newEmpresa, tenantId);
      setEmpresas(prev => [...prev, empresa]);
      setNewEmpresa({ razon_social: '', cif: '', direccion: '', contacto_email: '' });
      setShowCreateEmpresa(false);
      
      // Log audit event
      await logAuditoria(
        tenantId,
        user?.id || 'unknown-user',
        'empresa.created',
        'empresa',
        empresa.id,
        { razon_social: empresa.razon_social }
      );
    } catch (error) {
      console.error('Error creating empresa:', error);
      alert('Error al crear empresa: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  const handleCreateObra = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpresa) return;

    try {
      const tenantId = user?.tenant_id || DEV_TENANT_ID;
      const obra = await createObra({
        ...newObra,
        empresa_id: selectedEmpresa
      }, tenantId);
      
      setObras(prev => ({
        ...prev,
        [selectedEmpresa]: [...(prev[selectedEmpresa] || []), obra]
      }));
      setNewObra({ nombre_obra: '', codigo_obra: '', direccion: '', cliente_final: '' });
      setShowCreateObra(false);
      
      // Log audit event
      await logAuditoria(
        tenantId,
        user?.id || 'unknown-user',
        'obra.created',
        'obra',
        obra.id,
        { nombre_obra: obra.nombre_obra }
      );
    } catch (error) {
      console.error('Error creating obra:', error);
      alert('Error al crear obra: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Cargando estructura...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Seleccionar Destino</h3>
        <button
          onClick={() => setShowCreateEmpresa(true)}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
        >
          <Plus className="w-4 h-4 mr-1" />
          Nueva Empresa
        </button>
      </div>

      {!empresas || empresas.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay empresas</h3>
          <p className="text-gray-600 mb-4">Crea tu primera empresa para comenzar</p>
          <button
            onClick={() => setShowCreateEmpresa(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Crear Primera Empresa
          </button>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg">
          {empresas.map((empresa) => (
            <div key={empresa.id} className="border-b border-gray-200 last:border-b-0">
              <div 
                className={`flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 ${
                  selectedEmpresa === empresa.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
                onClick={() => {
                  onSelectionChange(empresa.id, null, empresa);
                  toggleEmpresa(empresa.id);
                }}
              >
                <div className="flex items-center space-x-3">
                  <button className="p-1">
                    {expandedEmpresas.includes(empresa.id) ? 
                      <ChevronDown className="w-4 h-4 text-gray-600" /> : 
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    }
                  </button>
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">{empresa.razon_social}</h4>
                    <p className="text-sm text-gray-600">CIF: {empresa.cif}</p>
                  </div>
                </div>
                {selectedEmpresa === empresa.id && (
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                )}
              </div>

              {expandedEmpresas.includes(empresa.id) && (
                <div className="pl-12 pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-sm font-medium text-gray-700">Proyectos/Obras</h5>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowCreateObra(true);
                      }}
                      className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Nueva Obra
                    </button>
                  </div>

                  {!obras[empresa.id] || obras[empresa.id].length === 0 ? (
                    <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">
                      <FolderOpen className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-3">No hay obras en esta empresa</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowCreateObra(true);
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                      >
                        Crear Primera Obra
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {obras[empresa.id].map((obra) => (
                        <div
                          key={obra.id}
                          className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedObra === obra.id 
                              ? 'bg-green-100 border border-green-300' 
                              : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectionChange(empresa.id, obra.id, empresa, obra);
                          }}
                        >
                          <div className="flex items-center space-x-3">
                            <FolderOpen className="w-4 h-4 text-green-600" />
                            <div>
                              <h6 className="font-medium text-gray-900">{obra.nombre_obra}</h6>
                              <p className="text-xs text-gray-600">{obra.codigo_obra}</p>
                            </div>
                          </div>
                          {selectedObra === obra.id && (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          )}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Nueva Empresa</h3>
              <button
                onClick={() => setShowCreateEmpresa(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateEmpresa} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Razón Social *
                </label>
                <input
                  type="text"
                  required
                  value={newEmpresa.razon_social}
                  onChange={(e) => setNewEmpresa(prev => ({ ...prev, razon_social: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Construcciones García S.L."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CIF *
                </label>
                <input
                  type="text"
                  required
                  value={newEmpresa.cif}
                  onChange={(e) => setNewEmpresa(prev => ({ ...prev, cif: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="B12345678"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección
                </label>
                <input
                  type="text"
                  value={newEmpresa.direccion}
                  onChange={(e) => setNewEmpresa(prev => ({ ...prev, direccion: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Calle Construcción 123, Madrid"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email de Contacto
                </label>
                <input
                  type="email"
                  value={newEmpresa.contacto_email}
                  onChange={(e) => setNewEmpresa(prev => ({ ...prev, contacto_email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="info@empresa.com"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
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
                  <Save className="w-4 h-4 inline mr-1" />
                  Crear Empresa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Obra Modal */}
      {showCreateObra && selectedEmpresa && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Nueva Obra</h3>
              <button
                onClick={() => setShowCreateObra(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateObra} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la Obra *
                </label>
                <input
                  type="text"
                  required
                  value={newObra.nombre_obra}
                  onChange={(e) => setNewObra(prev => ({ ...prev, nombre_obra: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Edificio Residencial García"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código de Obra *
                </label>
                <input
                  type="text"
                  required
                  value={newObra.codigo_obra}
                  onChange={(e) => setNewObra(prev => ({ ...prev, codigo_obra: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="OBRA-001"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Calle Nueva 789, Madrid"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Inmobiliaria Madrid S.A."
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
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
                  <Save className="w-4 h-4 inline mr-1" />
                  Crear Obra
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DocumentUpload() {
  const { user } = useAuth();
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [selectedEmpresa, setSelectedEmpresa] = useState<string | null>(null);
  const [selectedObra, setSelectedObra] = useState<string | null>(null);
  const [selectedEmpresaObj, setSelectedEmpresaObj] = useState<Empresa | null>(null);
  const [selectedObraObj, setSelectedObraObj] = useState<Obra | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [fileId: string]: number }>({});
  const [uploadResults, setUploadResults] = useState<{ [fileId: string]: { success: boolean; message: string } }>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const documentCategories = [
    'PRL', 'APTITUD_MEDICA', 'DNI', 'ALTA_SS', 'CONTRATO', 
    'SEGURO_RC', 'REA', 'FORMACION_PRL', 'EVAL_RIESGOS', 
    'CERT_MAQUINARIA', 'PLAN_SEGURIDAD', 'OTROS'
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newFiles: SelectedFile[] = files.map(file => ({
      file,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }));
    
    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    const newFiles: SelectedFile[] = files.map(file => ({
      file,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }));
    
    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
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

  const handleUpload = async () => {
    if (!selectedEmpresa || !selectedObra || selectedFiles.length === 0 || !selectedCategory) {
      alert('Por favor selecciona empresa, obra, categoría y al menos un archivo');
      return;
    }

    setUploading(true);

    for (const selectedFile of selectedFiles) {
      try {
        // Validación crítica: verificar que el objeto file es realmente un File/Blob
        if (!(selectedFile.file instanceof File) && !(selectedFile.file instanceof Blob)) {
          console.error('❌ Invalid file object type:', {
            fileName: selectedFile.id,
            actualType: typeof selectedFile.file,
            constructor: selectedFile.file?.constructor?.name,
            isFile: selectedFile.file instanceof File,
            isBlob: selectedFile.file instanceof Blob
          });
          
          setUploadResults(prev => ({
            ...prev,
            [selectedFile.id]: {
              success: false,
              message: `Error: Objeto de archivo inválido (tipo: ${typeof selectedFile.file})`
            }
          }));
          continue; // Saltar este archivo y continuar con el siguiente
        }

        setUploadProgress(prev => ({ ...prev, [selectedFile.id]: 0 }));

        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 20) {
          setUploadProgress(prev => ({ ...prev, [selectedFile.id]: progress }));
          await new Promise(resolve => setTimeout(resolve, 200));
        }

        // Upload to manual queue with real file storage
        console.log('📁 Starting real file upload to manual queue...');
        console.log('📁 File validation passed:', {
          fileName: selectedFile.file.name,
          fileSize: selectedFile.file.size,
          fileType: selectedFile.file.type,
          isFile: selectedFile.file instanceof File,
          isBlob: selectedFile.file instanceof Blob
        });
        
        const document = await manualManagementService.addDocumentToQueue(
          selectedEmpresa, // clientId
          selectedObra,    // projectId
          selectedFile.file,
          'normal',        // priority
          'nalanda',       // platformTarget
          user?.id || DEV_ADMIN_USER_ID // userId
        );

        if (!document) {
          throw new Error('Error al subir archivo a la cola de procesamiento. Verifique la configuración de Supabase.');
        }
        setUploadResults(prev => ({
          ...prev,
          [selectedFile.id]: {
            success: true,
            message: 'Documento subido correctamente a la cola de procesamiento'
          }
        }));

        // Log audit event
        const tenantId = user?.tenant_id || DEV_TENANT_ID;
        await logAuditoria(
          tenantId,
          user?.id || DEV_ADMIN_USER_ID,
          'document.uploaded_to_queue',
          'documento',
          document.document_id,
          {
            categoria: selectedCategory,
            obra_id: selectedObra,
            filename: selectedFile.file.name,
            real_file_uploaded: true,
            queue_id: document.id
          }
        );

      } catch (error) {
        console.error('Error uploading file:', error);
        setUploadResults(prev => ({
          ...prev,
          [selectedFile.id]: {
            success: false,
            message: error instanceof Error ? error.message : 'Error al subir archivo a la cola'
          }
        }));
      }
    }

    setUploading(false);
  };

  const canUpload = selectedEmpresa && selectedObra && selectedFiles.length > 0 && selectedCategory;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Subir Documentos</h1>
        <p className="text-gray-600">Sube documentos siguiendo la estructura jerárquica</p>
        <div className="mt-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium inline-block">
          ✅ DATOS REALES - Sin datos mock
        </div>
      </div>

      {/* Hierarchical Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <HierarchicalSelector
          onSelectionChange={(empresaId, obraId, empresa, obra) => {
            setSelectedEmpresa(empresaId);
            setSelectedObra(obraId);
            setSelectedEmpresaObj(empresa || null);
            setSelectedObraObj(obra || null);
          }}
          selectedEmpresa={selectedEmpresa}
          selectedObra={selectedObra}
        />
      </div>

      {/* Category Selection */}
      {selectedEmpresa && selectedObra && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Categoría del Documento</h3>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            required
          >
            <option value="">Seleccionar categoría...</option>
            {documentCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      )}

      {/* File Upload Area */}
      {selectedEmpresa && selectedObra && selectedCategory && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Archivos</h3>
          
          {/* Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-400 transition-colors"
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Arrastra archivos aquí o haz clic para seleccionar
            </h4>
            <p className="text-gray-600 mb-4">
              Formatos soportados: PDF, JPG, PNG (máx. 20MB)
            </p>
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg cursor-pointer transition-colors inline-block"
            >
              Seleccionar Archivos
            </label>
          </div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-3">
                Archivos Seleccionados ({selectedFiles.length})
              </h4>
              <div className="space-y-3">
                {selectedFiles.map((selectedFile) => (
                  <div key={selectedFile.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{selectedFile.file.name}</p>
                        <p className="text-sm text-gray-600">
                          {(selectedFile.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {uploadProgress[selectedFile.id] !== undefined && (
                        <div className="w-24">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress[selectedFile.id]}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-600">{uploadProgress[selectedFile.id]}%</span>
                        </div>
                      )}
                      
                      {uploadResults[selectedFile.id] && (
                        <div className="flex items-center">
                          {uploadResults[selectedFile.id].success ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                      )}
                      
                      <button
                        onClick={() => removeFile(selectedFile.id)}
                        disabled={uploading}
                        className="text-red-600 hover:text-red-700 disabled:opacity-50"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Button */}
          {selectedFiles.length > 0 && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleUpload}
                disabled={!canUpload || uploading}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 mr-2" />
                    Subir {selectedFiles.length} Archivo{selectedFiles.length > 1 ? 's' : ''}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Selection Summary */}
      {(selectedEmpresa || selectedObra) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">Destino Seleccionado</h4>
          <div className="text-sm text-blue-700">
            {selectedEmpresa && (
              <p>📍 Empresa: {selectedEmpresaObj?.razon_social}</p>
            )}
            {selectedObra && (
              <p>📁 Obra: {selectedObraObj?.nombre_obra}</p>
            )}
            {selectedCategory && (
              <p>📄 Categoría: {selectedCategory}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}