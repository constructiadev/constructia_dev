import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  FileText, 
  Users, 
  Building2, 
  FolderOpen,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  Plus,
  X,
  Eye,
  Download,
  Trash2,
  Settings,
  Search,
  Filter,
  Calendar,
  Target,
  Activity,
  BarChart3,
  Zap,
  Globe,
  Database,
  Server,
  Monitor,
  Cpu,
  HardDrive,
  Wifi,
  Code,
  Terminal,
  Key,
  Layers,
  Play,
  Pause,
  Save,
  Edit,
  Copy,
  ExternalLink,
  Info,
  Loader2
} from 'lucide-react';
import { manualManagementService, type ManualDocument, type ClientGroup } from '../../lib/manual-management-service';

interface SelectedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
}

export default function ManualManagement() {
  const [loading, setLoading] = useState(true);
  const [clientGroups, setClientGroups] = useState<ClientGroup[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [fileId: string]: number }>({});
  const [uploadResults, setUploadResults] = useState<{ [fileId: string]: { success: boolean; message: string } }>({});
  const [stats, setStats] = useState<any>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [groups, queueStats] = await Promise.all([
        manualManagementService.getClientGroups(),
        manualManagementService.getQueueStats()
      ]);
      
      setClientGroups(groups);
      setStats(queueStats);
    } catch (err) {
      console.error('Error loading manual management data:', err);
      setError(err instanceof Error ? err.message : 'Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // CRITICAL: Validate that each file is actually a File object
    const validFiles: SelectedFile[] = [];
    
    files.forEach((file, index) => {
      console.log(`🔍 [ManualManagement] Validating file ${index + 1}:`, {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        isFile: file instanceof File,
        isBlob: file instanceof Blob,
        constructor: file.constructor.name,
        typeof: typeof file
      });

      // Only add if it's a valid File object
      if (file instanceof File) {
        validFiles.push({
          id: `file_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
          file: file, // Keep the actual File object
          name: file.name,
          size: file.size,
          type: file.type
        });
        console.log(`✅ [ManualManagement] File ${file.name} validated successfully`);
      } else {
        console.error(`❌ [ManualManagement] Invalid file object at index ${index}:`, {
          expectedType: 'File',
          actualType: typeof file,
          actualConstructor: file?.constructor?.name,
          fileValue: file
        });
      }
    });
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
    console.log(`📁 [ManualManagement] Added ${validFiles.length} valid files out of ${files.length} total`);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    
    // CRITICAL: Same validation for dropped files
    const validFiles: SelectedFile[] = [];
    
    files.forEach((file, index) => {
      console.log(`🔍 [ManualManagement] Validating dropped file ${index + 1}:`, {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        isFile: file instanceof File,
        isBlob: file instanceof Blob,
        constructor: file.constructor.name,
        typeof: typeof file
      });

      if (file instanceof File) {
        validFiles.push({
          id: `drop_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
          file: file, // Keep the actual File object
          name: file.name,
          size: file.size,
          type: file.type
        });
        console.log(`✅ [ManualManagement] Dropped file ${file.name} validated successfully`);
      } else {
        console.error(`❌ [ManualManagement] Invalid dropped file at index ${index}:`, {
          expectedType: 'File',
          actualType: typeof file,
          actualConstructor: file?.constructor?.name,
          fileValue: file
        });
      }
    });
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
    console.log(`📁 [ManualManagement] Added ${validFiles.length} valid dropped files out of ${files.length} total`);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClient || !selectedProject || selectedFiles.length === 0) {
      alert('Por favor selecciona cliente, proyecto y al menos un archivo');
      return;
    }

    await handleUploadDocuments();
  };

  const handleUploadDocuments = async () => {
    if (selectedFiles.length === 0) {
      alert('No hay archivos seleccionados para subir');
      return;
    }

    setUploading(true);
    console.log(`📤 [ManualManagement] Starting upload of ${selectedFiles.length} files`);

    for (const selectedFile of selectedFiles) {
      try {
        console.log(`📁 [ManualManagement] Processing file: ${selectedFile.name}`);
        
        // CRITICAL: Final validation before upload
        if (!(selectedFile.file instanceof File) && !(selectedFile.file instanceof Blob)) {
          console.error(`❌ [ManualManagement] CRITICAL: Invalid file object for ${selectedFile.name}:`, {
            expectedType: 'File or Blob',
            actualType: typeof selectedFile.file,
            actualConstructor: selectedFile.file?.constructor?.name,
            fileValue: selectedFile.file,
            selectedFileStructure: {
              id: selectedFile.id,
              name: selectedFile.name,
              size: selectedFile.size,
              type: selectedFile.type,
              fileProperty: selectedFile.file
            }
          });
          
          setUploadResults(prev => ({
            ...prev,
            [selectedFile.id]: {
              success: false,
              message: `Error crítico: Objeto de archivo inválido (tipo: ${typeof selectedFile.file}, constructor: ${selectedFile.file?.constructor?.name})`
            }
          }));
          continue;
        }

        console.log(`✅ [ManualManagement] File validation passed for ${selectedFile.name}:`, {
          fileName: selectedFile.file.name,
          fileSize: selectedFile.file.size,
          fileType: selectedFile.file.type,
          isFile: selectedFile.file instanceof File,
          isBlob: selectedFile.file instanceof Blob
        });

        setUploadProgress(prev => ({ ...prev, [selectedFile.id]: 0 }));

        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 20) {
          setUploadProgress(prev => ({ ...prev, [selectedFile.id]: progress }));
          await new Promise(resolve => setTimeout(resolve, 200));
        }

        // Upload to manual queue with the actual File object
        console.log(`📁 [ManualManagement] Calling addDocumentToQueue with validated file:`, {
          fileName: selectedFile.file.name,
          clientId: selectedClient,
          projectId: selectedProject,
          fileIsValid: selectedFile.file instanceof File
        });
        
        const document = await manualManagementService.addDocumentToQueue(
          selectedClient,
          selectedProject,
          selectedFile.file, // Pass the actual File object
          'normal',
          'nalanda'
        );

        if (!document) {
          throw new Error('Error al subir archivo a la cola de procesamiento');
        }

        setUploadResults(prev => ({
          ...prev,
          [selectedFile.id]: {
            success: true,
            message: 'Documento subido correctamente a la cola de procesamiento'
          }
        }));

        console.log(`✅ [ManualManagement] File ${selectedFile.name} uploaded successfully`);

      } catch (error) {
        console.error(`❌ [ManualManagement] Failed to add document to queue: ${selectedFile.name}`, error);
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
    console.log(`📤 [ManualManagement] Upload process completed`);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando gestión manual...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
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
      <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Gestión Manual de Documentos</h1>
            <p className="text-orange-100 mb-4">
              Subida manual de documentos con validación de archivos reales
            </p>
            <div className="space-y-1 text-sm text-orange-100">
              <p>• Subida de archivos reales con validación estricta</p>
              <p>• Procesamiento con IA y almacenamiento seguro</p>
              <p>• Cola de procesamiento manual para administradores</p>
              <p>• Integración directa con plataformas CAE</p>
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
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-blue-600">{stats.total || 0}</p>
            </div>
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending || 0}</p>
            </div>
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Procesando</p>
              <p className="text-2xl font-bold text-blue-600">{stats.in_progress || 0}</p>
            </div>
            <Activity className="w-6 h-6 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Subidos</p>
              <p className="text-2xl font-bold text-green-600">{stats.uploaded || 0}</p>
            </div>
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Errores</p>
              <p className="text-2xl font-bold text-red-600">{stats.errors || 0}</p>
            </div>
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Clientes</p>
              <p className="text-2xl font-bold text-purple-600">{clientGroups.length}</p>
            </div>
            <Users className="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Upload Form */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Subir Documentos</h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client and Project Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cliente *
              </label>
              <select
                value={selectedClient}
                onChange={(e) => {
                  setSelectedClient(e.target.value);
                  setSelectedProject(''); // Reset project when client changes
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                required
              >
                <option value="">Seleccionar cliente...</option>
                {clientGroups.map((group) => (
                  <option key={group.client_id} value={group.client_id}>
                    {group.client_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Proyecto *
              </label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                required
                disabled={!selectedClient}
              >
                <option value="">Seleccionar proyecto...</option>
                {selectedClient && clientGroups
                  .find(g => g.client_id === selectedClient)
                  ?.companies.flatMap(c => c.projects)
                  .map((project) => (
                    <option key={project.project_id} value={project.project_id}>
                      {project.project_name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* File Upload Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Archivos *
            </label>
            
            {/* Drop Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-400 transition-colors"
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
                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg cursor-pointer transition-colors inline-block"
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
                          <p className="font-medium text-gray-900">{selectedFile.name}</p>
                          <p className="text-sm text-gray-600">
                            {formatFileSize(selectedFile.size)} • {selectedFile.type}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {uploadProgress[selectedFile.id] !== undefined && (
                          <div className="w-24">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-orange-600 h-2 rounded-full transition-all duration-300"
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
                          type="button"
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
          </div>

          {/* Upload Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={uploading || !selectedClient || !selectedProject || selectedFiles.length === 0}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Subiendo {selectedFiles.length} archivo{selectedFiles.length > 1 ? 's' : ''}...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 mr-2" />
                  Subir {selectedFiles.length} Archivo{selectedFiles.length > 1 ? 's' : ''}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Client Groups Display */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Clientes y Proyectos</h3>
        </div>
        <div className="p-6">
          {clientGroups.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No hay clientes disponibles</p>
            </div>
          ) : (
            <div className="space-y-4">
              {clientGroups.map((group) => (
                <div key={group.client_id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <Building2 className="w-5 h-5 text-blue-600 mr-2" />
                      <div>
                        <h4 className="font-medium text-gray-900">{group.client_name}</h4>
                        <p className="text-sm text-gray-600">{group.client_email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{group.total_documents} docs</p>
                      <p className="text-xs text-gray-500">{group.documents_per_hour}/hora</p>
                    </div>
                  </div>
                  
                  {group.companies.map((company) => (
                    <div key={company.company_id} className="ml-6 space-y-2">
                      <h5 className="font-medium text-gray-800">{company.company_name}</h5>
                      {company.projects.map((project) => (
                        <div key={project.project_id} className="ml-4 flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm text-gray-700">{project.project_name}</span>
                          <span className="text-xs text-gray-500">{project.total_documents} docs</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}