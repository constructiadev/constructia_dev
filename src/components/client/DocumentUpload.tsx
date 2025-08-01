import React, { useState, useEffect } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, Clock, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { 
  supabase, 
  getCurrentClientData, 
  getClientProjects, 
  getClientCompanies,
  callGeminiAI 
} from '../../lib/supabase';

interface Company {
  id: string;
  name: string;
}

interface Project {
  id: string;
  name: string;
  companies: { name: string };
}

interface UploadedFile {
  id: string;
  file: File;
  status: 'uploading' | 'classifying' | 'uploading_to_obralia' | 'completed' | 'error';
  progress: number;
  classification?: string;
  confidence?: number;
  error?: string;
}

const DocumentUpload: React.FC = () => {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [clientData, setClientData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadInitialData();
    }
  }, [user]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Obtener datos del cliente
      const client = await getCurrentClientData(user!.id);
      setClientData(client);
      
      // Obtener empresas y proyectos
      const [companiesData, projectsData] = await Promise.all([
        getClientCompanies(client.id),
        getClientProjects(client.id)
      ]);
      
      setCompanies(companiesData || []);
      setProjects(projectsData || []);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = (files: File[]) => {
    if (!selectedCompany || !selectedProject) {
      alert('Por favor selecciona una empresa y un proyecto antes de subir archivos.');
      return;
    }

    const newFiles: UploadedFile[] = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      status: 'uploading',
      progress: 0
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Procesar cada archivo
    newFiles.forEach(uploadedFile => {
      processFile(uploadedFile);
    });
  };

  const processFile = async (uploadedFile: UploadedFile) => {
    try {
      // Simular progreso de subida
      updateFileStatus(uploadedFile.id, 'uploading', 30);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Subir archivo a Supabase Storage
      const fileName = `${Date.now()}_${uploadedFile.file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, uploadedFile.file);

      if (uploadError) throw uploadError;

      updateFileStatus(uploadedFile.id, 'classifying', 60);

      // Clasificar documento con IA
      const classification = await classifyDocument(uploadedFile.file);
      
      updateFileStatus(uploadedFile.id, 'uploading_to_obralia', 80);

      // Crear registro en la base de datos
      const { data: documentData, error: dbError } = await supabase
        .from('documents')
        .insert({
          client_id: clientData.id,
          project_id: selectedProject,
          filename: fileName,
          original_name: uploadedFile.file.name,
          file_size: uploadedFile.file.size,
          file_type: uploadedFile.file.type,
          document_type: classification.type,
          classification_confidence: classification.confidence,
          ai_metadata: classification.metadata,
          upload_status: 'classified'
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Procesar a Obralia (simulado)
      await processToObralia(documentData.id);

      updateFileStatus(uploadedFile.id, 'completed', 100, classification);

    } catch (error) {
      console.error('Error processing file:', error);
      updateFileStatus(uploadedFile.id, 'error', 0, undefined, error instanceof Error ? error.message : 'Error desconocido');
    }
  };

  const classifyDocument = async (file: File): Promise<{ type: string; confidence: number; metadata: any }> => {
    try {
      const prompt = `
        Analiza el nombre del archivo "${file.name}" y clasifícalo según estos tipos de documentos de construcción:
        - Proyecto Básico
        - Proyecto de Ejecución
        - Estudio de Seguridad y Salud
        - Plan de Seguridad y Salud
        - Dirección de Obra
        - Dirección de Ejecución
        - Coordinación de Seguridad y Salud
        - Libro del Edificio
        - Certificado Final de Obra
        - Licencia de Obras
        - Otro

        Responde SOLO con un JSON en este formato:
        {
          "type": "tipo_de_documento",
          "confidence": numero_entre_0_y_100,
          "metadata": {
            "keywords": ["palabra1", "palabra2"],
            "category": "categoria"
          }
        }
      `;

      const response = await callGeminiAI(prompt);
      
      try {
        const parsed = JSON.parse(response);
        return {
          type: parsed.type || 'Otro',
          confidence: parsed.confidence || 50,
          metadata: parsed.metadata || {}
        };
      } catch (parseError) {
        // Si no se puede parsear, usar clasificación por defecto
        return {
          type: 'Otro',
          confidence: 30,
          metadata: { keywords: [], category: 'unknown' }
        };
      }
    } catch (error) {
      console.error('Error classifying document:', error);
      return {
        type: 'Otro',
        confidence: 0,
        metadata: { error: 'Classification failed' }
      };
    }
  };

  const processToObralia = async (documentId: string) => {
    try {
      // Verificar credenciales de Obralia
      if (!clientData?.obralia_credentials?.configured) {
        throw new Error('Credenciales de Obralia no configuradas');
      }

      // Llamar a la función Edge para procesar el documento
      const { data, error } = await supabase.functions.invoke('process-document', {
        body: { 
          documentId,
          obraliaCredentials: clientData.obralia_credentials
        }
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error processing to Obralia:', error);
      throw error;
    }
  };

  const updateFileStatus = (
    fileId: string, 
    status: UploadedFile['status'], 
    progress: number, 
    classification?: { type: string; confidence: number; metadata: any },
    error?: string
  ) => {
    setUploadedFiles(prev => prev.map(file => 
      file.id === fileId 
        ? { 
            ...file, 
            status, 
            progress,
            classification: classification?.type,
            confidence: classification?.confidence,
            error 
          }
        : file
    ));
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
      case 'classifying':
      case 'uploading_to_obralia':
        return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
        return 'Subiendo archivo...';
      case 'classifying':
        return 'Clasificando documento...';
      case 'uploading_to_obralia':
        return 'Enviando a Obralia...';
      case 'completed':
        return 'Completado';
      case 'error':
        return 'Error';
      default:
        return 'Pendiente';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Subir Documentos</h2>
        
        {/* Selectores de empresa y proyecto */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Empresa
            </label>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar empresa...</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Proyecto
            </label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar proyecto...</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name} - {project.companies?.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Zona de arrastrar y soltar */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            Arrastra archivos aquí o haz clic para seleccionar
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Formatos soportados: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG
          </p>
          <input
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
          >
            Seleccionar archivos
          </label>
        </div>

        {/* Lista de archivos subidos */}
        {uploadedFiles.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Archivos en proceso</h3>
            <div className="space-y-3">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    {getStatusIcon(file.status)}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {file.file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {getStatusText(file.status)}
                        {file.classification && (
                          <span className="ml-2 text-blue-600">
                            • {file.classification} ({file.confidence}% confianza)
                          </span>
                        )}
                      </p>
                      {file.error && (
                        <p className="text-xs text-red-600 mt-1">{file.error}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {file.status !== 'completed' && file.status !== 'error' && (
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${file.progress}%` }}
                        ></div>
                      </div>
                    )}
                    
                    <button
                      onClick={() => removeFile(file.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Información de almacenamiento */}
        {clientData && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Almacenamiento utilizado
                </p>
                <p className="text-xs text-blue-700">
                  {(clientData.storage_used / (1024 * 1024)).toFixed(2)} MB de{' '}
                  {(clientData.storage_limit / (1024 * 1024)).toFixed(0)} MB
                </p>
              </div>
              <div className="w-32 bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${Math.min(
                      (clientData.storage_used / clientData.storage_limit) * 100,
                      100
                    )}%`
                  }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentUpload;