import React, { useState, useEffect } from 'react';
import { FileText, Upload, CheckCircle, AlertTriangle, Clock, User, Building2, FolderOpen, RefreshCw, Search, Filter, Eye, Download, Trash2, Settings, Plus, X, Save, ArrowUp, ArrowDown, Play, Pause, Target, Brain, Shield, Database, Zap, Activity, BarChart3, Calendar, MapPin, Phone, Mail, Hash, Percent, Timer, Flag, Star, Award, TrendingUp, Users, Globe, Cpu, HardDrive, Wifi, Server, Monitor, Code, Terminal, Key, Lock, Unlock, Link, ExternalLink, Info, Lightbulb, Bookmark, Tag, Layers, Grid, List, Table, Car as CardIcon, Image, Video, Music, Archive, Folder, File, FileImage, File as FilePdf, FileSpreadsheet, WholeWord as FileWord, Pointer as FilePowerpoint, FileVideo, FileAudio, FileArchive, FileCode, FileJson, File as FileCsv, FileX as FileXml, File as FileZip } from 'lucide-react';
import { 
  getManualProcessingQueue, 
  getAllClients, 
  getClientCompanies, 
  getClientProjects,
  supabase 
} from '../../lib/supabase';

interface QueueDocument {
  id: string;
  document_id: string;
  client_id: string;
  company_id?: string;
  project_id?: string;
  queue_position: number;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  manual_status: 'pending' | 'in_progress' | 'uploaded' | 'validated' | 'error' | 'corrupted';
  ai_analysis: any;
  admin_notes: string;
  processed_by?: string;
  processed_at?: string;
  corruption_detected: boolean;
  file_integrity_score: number;
  retry_count: number;
  last_error_message?: string;
  estimated_processing_time?: string;
  created_at: string;
  updated_at: string;
  documents?: {
    filename: string;
    original_name: string;
    file_size: number;
    file_type: string;
    document_type: string;
    classification_confidence: number;
  };
  clients?: {
    company_name: string;
    contact_name: string;
    email: string;
  };
  companies?: {
    name: string;
  };
  projects?: {
    name: string;
  };
}

interface ProcessingModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: QueueDocument | null;
  onProcess: (documentId: string, action: 'upload' | 'validate' | 'reject', notes: string) => Promise<void>;
}

function ProcessingModal({ isOpen, onClose, document, onProcess }: ProcessingModalProps) {
  const [action, setAction] = useState<'upload' | 'validate' | 'reject'>('upload');
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (document) {
      setNotes(document.admin_notes || '');
    }
  }, [document]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!document) return;

    setIsProcessing(true);
    try {
      await onProcess(document.id, action, notes);
      onClose();
    } catch (error) {
      console.error('Error processing document:', error);
      alert('Error al procesar el documento');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen || !document) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Procesar Documento</h2>
              <p className="text-orange-100">{document.documents?.original_name}</p>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Document Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-4">Información del Documento</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Cliente:</span>
                <p className="font-medium">{document.clients?.company_name}</p>
              </div>
              <div>
                <span className="text-gray-600">Proyecto:</span>
                <p className="font-medium">{document.projects?.name || 'Sin asignar'}</p>
              </div>
              <div>
                <span className="text-gray-600">Tipo:</span>
                <p className="font-medium">{document.documents?.document_type}</p>
              </div>
              <div>
                <span className="text-gray-600">Confianza IA:</span>
                <p className="font-medium">{document.documents?.classification_confidence}%</p>
              </div>
            </div>
          </div>

          {/* Action Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Acción a realizar
            </label>
            <div className="space-y-3">
              <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="action"
                  value="upload"
                  checked={action === 'upload'}
                  onChange={(e) => setAction(e.target.value as any)}
                  className="mr-3"
                />
                <div className="flex items-center">
                  <Upload className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-800">Subir a Obralia</p>
                    <p className="text-sm text-gray-600">Procesar y subir el documento</p>
                  </div>
                </div>
              </label>

              <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="action"
                  value="validate"
                  checked={action === 'validate'}
                  onChange={(e) => setAction(e.target.value as any)}
                  className="mr-3"
                />
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-800">Validar</p>
                    <p className="text-sm text-gray-600">Marcar como validado</p>
                  </div>
                </div>
              </label>

              <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="action"
                  value="reject"
                  checked={action === 'reject'}
                  onChange={(e) => setAction(e.target.value as any)}
                  className="mr-3"
                />
                <div className="flex items-center">
                  <X className="w-5 h-5 text-red-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-800">Rechazar</p>
                    <p className="text-sm text-gray-600">Rechazar el documento</p>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas del administrador
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Añadir notas sobre el procesamiento..."
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="flex items-center px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Procesando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Procesar Documento
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: FileList, clientId: string, projectId?: string) => Promise<void>;
  clients: any[];
  projects: any[];
}

function UploadModal({ isOpen, onClose, onUpload, clients, projects }: UploadModalProps) {
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFiles || !selectedClient) return;

    setIsUploading(true);
    try {
      await onUpload(selectedFiles, selectedClient, selectedProject || undefined);
      onClose();
      setSelectedFiles(null);
      setSelectedClient('');
      setSelectedProject('');
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Error al subir archivos');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (files: FileList) => {
    setSelectedFiles(files);
  };

  const clientProjects = projects.filter(p => p.client_id === selectedClient);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Subir Documentos Manualmente</h2>
              <p className="text-green-100">Añadir documentos a la cola de procesamiento</p>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Client Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cliente *
            </label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">Seleccionar cliente</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.company_name} - {client.contact_name}
                </option>
              ))}
            </select>
          </div>

          {/* Project Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Proyecto (opcional)
            </label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              disabled={!selectedClient}
            >
              <option value="">Sin proyecto específico</option>
              {clientProjects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Documentos *
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                dragOver
                  ? 'border-green-400 bg-green-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                if (e.dataTransfer.files) {
                  handleFileSelect(e.dataTransfer.files);
                }
              }}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                Arrastra archivos aquí o haz clic para seleccionar
              </p>
              <input
                type="file"
                multiple
                onChange={(e) => {
                  if (e.target.files) {
                    handleFileSelect(e.target.files);
                  }
                }}
                className="hidden"
                id="file-upload"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"
              />
              <label
                htmlFor="file-upload"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 cursor-pointer inline-block"
              >
                Seleccionar Archivos
              </label>
            </div>
            
            {selectedFiles && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  Archivos seleccionados ({selectedFiles.length}):
                </p>
                {Array.from(selectedFiles).map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700">{file.name}</span>
                    <span className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isUploading || !selectedFiles || !selectedClient}
              className="flex items-center px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Subir Documentos
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ManualManagement() {
  const [queue, setQueue] = useState<QueueDocument[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<QueueDocument | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [queueData, clientsData] = await Promise.all([
        getManualProcessingQueue(),
        getAllClients()
      ]);

      // Si no hay documentos en cola, crear algunos de ejemplo
      if (!queueData || queueData.length === 0) {
        await createSampleQueueDocuments();
        const newQueueData = await getManualProcessingQueue();
        setQueue(newQueueData || []);
      } else {
        setQueue(queueData);
      }

      setClients(clientsData || []);

      // Cargar proyectos para todos los clientes
      const allProjects = [];
      for (const client of clientsData || []) {
        try {
          const clientProjects = await getClientProjects(client.id);
          allProjects.push(...clientProjects);
        } catch (err) {
          console.warn(`Error loading projects for client ${client.id}:`, err);
        }
      }
      setProjects(allProjects);

    } catch (err) {
      console.error('Error loading manual management data:', err);
      setError(err instanceof Error ? err.message : 'Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const createSampleQueueDocuments = async () => {
    try {
      // Obtener clientes existentes
      const clients = await getAllClients();
      if (!clients || clients.length === 0) return;

      const sampleDocuments = [];
      const documentTypes = [
        'Certificado de Obra', 'Factura de Materiales', 'Contrato de Construcción',
        'Plano Arquitectónico', 'Memoria Técnica', 'Presupuesto Detallado',
        'Licencia de Obras', 'Permiso Municipal', 'Informe Técnico'
      ];

      // Crear 10 documentos de ejemplo
      for (let i = 0; i < 10; i++) {
        const client = clients[i % clients.length];
        const docType = documentTypes[i % documentTypes.length];
        
        // Crear documento primero
        const { data: documentData, error: docError } = await supabase
          .from('documents')
          .insert({
            client_id: client.id,
            filename: `${docType.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}_${i}.pdf`,
            original_name: `${docType} - Ejemplo ${i + 1}.pdf`,
            file_size: Math.floor(Math.random() * 5000000) + 100000,
            file_type: 'application/pdf',
            document_type: docType,
            classification_confidence: Math.floor(Math.random() * 30) + 70,
            upload_status: 'classified',
            obralia_status: 'pending',
            security_scan_status: 'safe',
            processing_attempts: 1
          })
          .select()
          .single();

        if (docError) {
          console.error('Error creating sample document:', docError);
          continue;
        }

        // Añadir a la cola manual
        sampleDocuments.push({
          document_id: documentData.id,
          client_id: client.id,
          queue_position: i + 1,
          priority: ['low', 'normal', 'high', 'urgent'][Math.floor(Math.random() * 4)],
          manual_status: ['pending', 'in_progress'][Math.floor(Math.random() * 2)],
          ai_analysis: {
            document_type: docType,
            confidence: Math.floor(Math.random() * 30) + 70,
            recommendations: ['Verificar datos del cliente', 'Confirmar clasificación']
          },
          admin_notes: '',
          corruption_detected: Math.random() < 0.1,
          file_integrity_score: Math.floor(Math.random() * 20) + 80,
          retry_count: 0,
          estimated_processing_time: `00:0${Math.floor(Math.random() * 5) + 2}:00`
        });
      }

      if (sampleDocuments.length > 0) {
        const { error: queueError } = await supabase
          .from('manual_document_queue')
          .insert(sampleDocuments);

        if (queueError) {
          console.error('Error creating sample queue documents:', queueError);
        }
      }
    } catch (error) {
      console.error('Error creating sample documents:', error);
    }
  };

  const handleProcessDocument = async (documentId: string, action: 'upload' | 'validate' | 'reject', notes: string) => {
    try {
      let newStatus = 'pending';
      switch (action) {
        case 'upload':
          newStatus = 'uploaded';
          break;
        case 'validate':
          newStatus = 'validated';
          break;
        case 'reject':
          newStatus = 'error';
          break;
      }

      const { error } = await supabase
        .from('manual_document_queue')
        .update({
          manual_status: newStatus,
          admin_notes: notes,
          processed_by: 'admin-user-id',
          processed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', documentId);

      if (error) {
        throw new Error(`Error updating document: ${error.message}`);
      }

      // Actualizar también el documento principal si es necesario
      if (action === 'upload') {
        const queueDoc = queue.find(q => q.id === documentId);
        if (queueDoc?.document_id) {
          await supabase
            .from('documents')
            .update({
              upload_status: 'uploaded_to_obralia',
              obralia_status: 'uploaded',
              updated_at: new Date().toISOString()
            })
            .eq('id', queueDoc.document_id);
        }
      }

      await loadData();
    } catch (error) {
      console.error('Error processing document:', error);
      throw error;
    }
  };

  const handleUploadFiles = async (files: FileList, clientId: string, projectId?: string) => {
    try {
      const client = clients.find(c => c.id === clientId);
      if (!client) throw new Error('Cliente no encontrado');

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Crear documento
        const { data: documentData, error: docError } = await supabase
          .from('documents')
          .insert({
            client_id: clientId,
            project_id: projectId,
            filename: `${file.name}_${Date.now()}_${i}`,
            original_name: file.name,
            file_size: file.size,
            file_type: file.type,
            document_type: 'Documento Manual',
            classification_confidence: 85,
            upload_status: 'classified',
            obralia_status: 'pending',
            security_scan_status: 'safe',
            processing_attempts: 1
          })
          .select()
          .single();

        if (docError) {
          console.error('Error creating document:', docError);
          continue;
        }

        // Añadir a la cola manual
        await supabase
          .from('manual_document_queue')
          .insert({
            document_id: documentData.id,
            client_id: clientId,
            project_id: projectId,
            queue_position: queue.length + i + 1,
            priority: 'normal',
            manual_status: 'pending',
            ai_analysis: {
              document_type: 'Documento Manual',
              confidence: 85,
              recommendations: ['Verificar clasificación manual']
            },
            admin_notes: 'Documento subido manualmente por administrador',
            corruption_detected: false,
            file_integrity_score: 95,
            retry_count: 0,
            estimated_processing_time: '00:03:00'
          });
      }

      await loadData();
    } catch (error) {
      console.error('Error uploading files:', error);
      throw error;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'uploaded': return 'bg-green-100 text-green-800';
      case 'validated': return 'bg-emerald-100 text-emerald-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'corrupted': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'in_progress': return <Play className="w-4 h-4" />;
      case 'uploaded': return <Upload className="w-4 h-4" />;
      case 'validated': return <CheckCircle className="w-4 h-4" />;
      case 'error': return <AlertTriangle className="w-4 h-4" />;
      case 'corrupted': return <X className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const filteredQueue = queue.filter(doc => {
    const matchesSearch = 
      doc.documents?.original_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.clients?.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.projects?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || doc.manual_status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || doc.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const stats = {
    total: queue.length,
    pending: queue.filter(d => d.manual_status === 'pending').length,
    inProgress: queue.filter(d => d.manual_status === 'in_progress').length,
    uploaded: queue.filter(d => d.manual_status === 'uploaded').length,
    validated: queue.filter(d => d.manual_status === 'validated').length,
    errors: queue.filter(d => d.manual_status === 'error' || d.manual_status === 'corrupted').length,
    configured: queue.filter(d => d.manual_status === 'validated').length
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-6 h-6 animate-spin text-orange-600" />
            <span className="text-gray-600">Cargando cola de procesamiento manual...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-red-800 font-medium">Error al cargar datos</span>
          </div>
          <p className="text-red-700 mt-2">{error}</p>
          <button
            onClick={loadData}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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
              Cola de procesamiento manual para subida a Obralia
            </p>
            <div className="space-y-1 text-sm text-orange-100">
              <p>• Gestión jerárquica: Cliente → Empresa → Proyecto → Documento</p>
              <p>• Subida manual con credenciales de cliente</p>
              <p>• Dos métodos: Drag & Drop y Selección de Directorio</p>
              <p>• Control de integridad y validación automática</p>
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
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Subir Documentos
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Cola</p>
              <p className="text-xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pendientes</p>
              <p className="text-xl font-semibold text-yellow-600">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Play className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">En Proceso</p>
              <p className="text-xl font-semibold text-blue-600">{stats.inProgress}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Subidos</p>
              <p className="text-xl font-semibold text-green-600">{stats.uploaded}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Errores</p>
              <p className="text-xl font-semibold text-red-600">{stats.errors}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Settings className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Configurados</p>
              <p className="text-xl font-semibold text-purple-600">{stats.configured}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar documentos, clientes, proyectos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendientes</option>
              <option value="in_progress">En proceso</option>
              <option value="uploaded">Subidos</option>
              <option value="validated">Validados</option>
              <option value="error">Errores</option>
              <option value="corrupted">Corruptos</option>
            </select>
          </div>

          <div className="relative">
            <Flag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none"
            >
              <option value="all">Todas las prioridades</option>
              <option value="urgent">Urgente</option>
              <option value="high">Alta</option>
              <option value="normal">Normal</option>
              <option value="low">Baja</option>
            </select>
          </div>

          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setPriorityFilter('all');
            }}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Queue Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {selectedDocuments.length > 0 && (
          <div className="bg-orange-50 border-b border-orange-200 p-4">
            <div className="flex items-center justify-between">
              <span className="text-orange-800 font-medium">
                {selectedDocuments.length} documentos seleccionados
              </span>
              <div className="flex space-x-2">
                <button className="px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700">
                  Procesar en lote
                </button>
                <button 
                  onClick={() => setSelectedDocuments([])}
                  className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                >
                  Limpiar selección
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedDocuments.length === filteredQueue.length && filteredQueue.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedDocuments(filteredQueue.map(d => d.id));
                      } else {
                        setSelectedDocuments([]);
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Posición
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Documento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Proyecto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prioridad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredQueue.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center space-y-4">
                      <FileText className="w-16 h-16 text-gray-300" />
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' 
                            ? 'No se encontraron documentos' 
                            : 'Cola vacía'
                          }
                        </h3>
                        <p className="text-gray-600 mb-4">
                          {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                            ? 'Intenta ajustar los filtros de búsqueda'
                            : 'No hay documentos en la cola de procesamiento manual'
                          }
                        </p>
                        {!searchTerm && statusFilter === 'all' && priorityFilter === 'all' && (
                          <button
                            onClick={() => setShowUploadModal(true)}
                            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg transition-colors"
                          >
                            Subir Documentos
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredQueue.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedDocuments.includes(doc.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedDocuments(prev => [...prev, doc.id]);
                          } else {
                            setSelectedDocuments(prev => prev.filter(id => id !== doc.id));
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">#{doc.queue_position}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {doc.documents?.original_name || 'Documento sin nombre'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {doc.documents?.document_type} • {doc.documents?.classification_confidence}% confianza
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{doc.clients?.company_name}</div>
                      <div className="text-sm text-gray-500">{doc.clients?.contact_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{doc.projects?.name || 'Sin asignar'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(doc.priority)}`}>
                        {doc.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(doc.manual_status)}
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(doc.manual_status)}`}>
                          {doc.manual_status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedDocument(doc);
                            setShowProcessingModal(true);
                          }}
                          className="p-1 text-gray-400 hover:text-orange-600 transition-colors"
                          title="Procesar documento"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                          title="Descargar"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Workflow Steps */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <Info className="w-5 h-5 text-blue-600 mr-2" />
          Flujo de Trabajo
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold">1</span>
            </div>
            <h4 className="font-semibold text-blue-800 mb-2">Configurar credenciales del cliente</h4>
            <p className="text-sm text-blue-700">Establecer acceso a Obralia/Nalanda</p>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold">2</span>
            </div>
            <h4 className="font-semibold text-green-800 mb-2">Seleccionar documentos a subir</h4>
            <p className="text-sm text-green-700">Elegir archivos desde el directorio</p>
          </div>

          <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold">3</span>
            </div>
            <h4 className="font-semibold text-orange-800 mb-2">Elegir método de subida</h4>
            <p className="text-sm text-orange-700">Drag & Drop o selección manual</p>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold">4</span>
            </div>
            <h4 className="font-semibold text-purple-800 mb-2">Confirmar subida a Obralia</h4>
            <p className="text-sm text-purple-700">Validación y procesamiento final</p>
          </div>
        </div>
      </div>

      {/* Processing Modal */}
      <ProcessingModal
        isOpen={showProcessingModal}
        onClose={() => setShowProcessingModal(false)}
        document={selectedDocument}
        onProcess={handleProcessDocument}
      />

      {/* Upload Modal */}
      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUploadFiles}
        clients={clients}
        projects={projects}
      />
    </div>
  );
}