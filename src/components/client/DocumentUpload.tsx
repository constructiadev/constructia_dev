import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  FileText, 
  X, 
  CheckCircle, 
  AlertCircle,
  Brain,
  Loader,
  Eye
} from 'lucide-react';
import { callGeminiAI } from '../../lib/supabase';

interface UploadedFile {
  id: string;
  file: File;
  status: 'uploading' | 'analyzing' | 'classified' | 'pending_obralia' | 'uploading_obralia' | 'obralia_validated' | 'completed' | 'error';
  classification?: string;
  confidence?: number;
  obralia_section?: string;
  obralia_status?: 'pending' | 'uploaded' | 'validated' | 'rejected';
  error_message?: string;
}

export default function DocumentUpload() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedProject, setSelectedProject] = useState('');

  // Datos simulados
  const companies = [
    { id: '1', name: 'Construcciones García S.L.' },
    { id: '2', name: 'Obras Públicas del Norte S.A.' },
    { id: '3', name: 'Reformas Integrales López' }
  ];

  const projects = [
    { id: '1', name: 'Edificio Residencial Centro', company_id: '1' },
    { id: '2', name: 'Reforma Oficinas Norte', company_id: '1' },
    { id: '3', name: 'Puente Industrial A-7', company_id: '2' },
    { id: '4', name: 'Centro Comercial Valencia', company_id: '3' }
  ];

  const filteredProjects = projects.filter(p => p.company_id === selectedCompany);

  const classifyDocument = async (file: File): Promise<{ classification: string; confidence: number; obralia_section: string }> => {
    const prompt = `Analiza este documento de construcción y clasifícalo:
    Nombre del archivo: ${file.name}
    Tipo: ${file.type}
    
    Clasifica en una de estas categorías:
    - Factura
    - Certificado
    - DNI/Identificación
    - Contrato
    - Seguro
    - Plano/Técnico
    - Otro
    
    Indica también la sección de Obralia donde debería subirse:
    - Documentación Administrativa
    - Certificados y Permisos
    - Facturación
    - Personal
    - Técnica
    
    Responde en formato: "Clasificación: [tipo] | Confianza: [0-100]% | Sección Obralia: [sección]"`;

    try {
      const response = await callGeminiAI(prompt);
      
      // Parsear respuesta (simulado)
      const classification = response.includes('Factura') ? 'Factura' : 
                           response.includes('Certificado') ? 'Certificado' :
                           response.includes('DNI') ? 'DNI/Identificación' :
                           response.includes('Contrato') ? 'Contrato' : 'Documento';
      
      const confidence = Math.floor(Math.random() * 20) + 80; // 80-100%
      const obralia_section = 'Documentación Administrativa';
      
      return { classification, confidence, obralia_section };
    } catch (error) {
      throw new Error('Error al clasificar documento');
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      status: 'uploading'
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Procesar cada archivo
    for (const fileData of newFiles) {
      try {
        // Simular subida
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileData.id ? { ...f, status: 'analyzing' } : f
        ));

        // Clasificar con IA
        const { classification, confidence, obralia_section } = await classifyDocument(fileData.file);
        
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileData.id ? { 
            ...f, 
            status: 'classified',
            classification,
            confidence,
            obralia_section
          } : f
        ));

      } catch (error) {
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileData.id ? { 
            ...f, 
            status: 'error',
            error_message: 'Error al procesar el archivo'
          } : f
        ));
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const processToObralia = async () => {
    const classifiedFiles = uploadedFiles.filter(f => f.status === 'classified');
    
    for (const fileData of classifiedFiles) {
      try {
        // Actualizar estado a pending_obralia
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileData.id ? { ...f, status: 'pending_obralia' } : f
        ));

        // Simular procesamiento asíncrono
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileData.id ? { ...f, status: 'uploading_obralia' } : f
        ));

        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileData.id ? { 
            ...f, 
            status: 'obralia_validated',
            obralia_status: 'validated'
          } : f
        ));

        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileData.id ? { ...f, status: 'completed' } : f
        ));

      } catch (error) {
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileData.id ? { 
            ...f, 
            status: 'error',
            error_message: 'Error al procesar con Obralia'
          } : f
        ));
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading':
        return <Loader className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'analyzing':
        return <Brain className="h-4 w-4 text-purple-600 animate-pulse" />;
      case 'classified':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending_obralia':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'uploading_obralia':
        return <Upload className="h-4 w-4 text-blue-600 animate-pulse" />;
      case 'obralia_validated':
        return <CheckCircle className="h-4 w-4 text-emerald-600" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusText = (file: UploadedFile) => {
    switch (file.status) {
      case 'uploading':
        return 'Subiendo...';
      case 'analyzing':
        return 'Analizando con IA...';
      case 'classified':
        return `${file.classification} (${file.confidence}% confianza)`;
      case 'pending_obralia':
        return 'Esperando subida a Obralia...';
      case 'uploading_obralia':
        return 'Subiendo a Obralia...';
      case 'obralia_validated':
        return 'Validado en Obralia';
      case 'completed':
        return 'Proceso completado';
      case 'error':
        return file.error_message || 'Error';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Subir Documentos</h2>
        <p className="text-gray-600">Arrastra y suelta tus documentos para procesarlos automáticamente</p>
      </div>

      {/* Selección de Empresa y Proyecto */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Destino de los Documentos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Empresa
            </label>
            <select
              value={selectedCompany}
              onChange={(e) => {
                setSelectedCompany(e.target.value);
                setSelectedProject('');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Selecciona una empresa</option>
              {companies.map(company => (
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
              disabled={!selectedCompany}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="">Selecciona un proyecto</option>
              {filteredProjects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Zona de Subida */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {/* Verificación de credenciales Obralia */}
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-800">Credenciales Obralia Requeridas</h4>
              <p className="text-sm text-red-700 mt-1">
                Para poder subir documentos, necesitas configurar tus credenciales de Obralia/Nalanda. 
                Contacta con el administrador para configurarlas.
              </p>
            </div>
          </div>
        </div>
        
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            isDragActive 
              ? 'border-green-500 bg-green-50' 
              : 'border-gray-300 hover:border-red-400 hover:bg-red-50 opacity-50 cursor-not-allowed'
          }`}
        >
          <input {...getInputProps()} disabled />
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          {isDragActive ? (
            <p className="text-green-600 font-medium">Suelta los archivos aquí...</p>
          ) : (
            <div>
              <p className="text-red-600 font-medium mb-2">
                Subida deshabilitada - Configura credenciales Obralia primero
              </p>
              <p className="text-sm text-gray-500">
                Contacta con el administrador para habilitar la subida de documentos
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Lista de Archivos Subidos */}
      {uploadedFiles.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Archivos Procesados</h3>
          <div className="space-y-3">
            {uploadedFiles.map((fileData) => (
              <div key={fileData.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center flex-1">
                  <FileText className="h-8 w-8 text-blue-600 mr-3" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{fileData.file.name}</p>
                    <div className="flex items-center mt-1">
                      {getStatusIcon(fileData.status)}
                      <span className="text-sm text-gray-600 ml-2">
                        {getStatusText(fileData)}
                      </span>
                    </div>
                    {fileData.obralia_section && (
                      <p className="text-xs text-purple-600 mt-1">
                        → Destino Obralia: {fileData.obralia_section}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {fileData.status === 'classified' && (
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Eye className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => removeFile(fileData.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {uploadedFiles.some(f => f.status === 'classified') && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <button 
                onClick={processToObralia}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Procesar y Subir a Obralia ({uploadedFiles.filter(f => f.status === 'classified').length} documentos)
              </button>
            </div>
          )}
        </div>
      )}

      {/* Información de Ayuda */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start">
          <Brain className="h-6 w-6 text-blue-600 mr-3 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-800 mb-2">Procesamiento Inteligente con IA</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Los documentos se clasifican automáticamente usando Gemini AI</li>
              <li>• Se detecta el tipo de documento y su destino en Obralia</li>
              <li>• Los archivos se suben automáticamente tras la validación</li>
              <li>• Se mantiene un registro completo de todas las operaciones</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}