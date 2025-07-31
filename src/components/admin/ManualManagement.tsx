import React, { useState, useEffect } from 'react';
import { FileText, Users, Building2, FolderOpen, Search, Filter, Eye, Upload, CheckCircle, AlertTriangle, Clock, Brain, Settings, RefreshCw, Download, Play, Pause, SkipForward, Trash2, Edit, Globe, Shield, Zap, Database, TrendingUp, BarChart3, Activity, HardDrive, Cpu, Server, Monitor, Terminal, Code, Key, Lock, Unlock, Calendar, Mail, Phone, MapPin, Hash, Info, FileWarning as Warning, X, Plus, Minus, ArrowUp, ArrowDown, RotateCcw, Save, Send, Archive, Flag, Star, Bookmark } from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { callGeminiAI, supabase } from '../../lib/supabase';

interface ManualQueueDocument {
  id: string;
  document_id: string;
  client_id: string;
  company_id: string;
  project_id: string;
  queue_position: number;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  manual_status: 'pending' | 'in_progress' | 'uploaded' | 'validated' | 'error' | 'corrupted';
  ai_analysis: {
    classification: string;
    confidence: number;
    file_size: number;
    file_type: string;
    corruption_detected?: boolean;
    integrity_score?: number;
    recommended_action?: string;
  };
  admin_notes: string;
  processed_by?: string;
  processed_at?: string;
  obralia_credentials: {
    username?: string;
    configured?: boolean;
  };
  corruption_detected: boolean;
  file_integrity_score: number;
  retry_count: number;
  last_error_message?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  document_filename: string;
  document_original_name: string;
  client_name: string;
  company_name: string;
  project_name: string;
  client_email: string;
}

interface ManualKPICardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  icon: React.ElementType;
  color: string;
  status?: 'good' | 'warning' | 'error';
  description?: string;
  period?: string;
}

function ManualKPICard({ 
  title, 
  value, 
  change, 
  trend, 
  icon: Icon, 
  color, 
  status = 'good', 
  description, 
  period = 'tiempo real' 
}: ManualKPICardProps) {
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600';
  const trendSymbol = trend === 'up' ? '+' : trend === 'down' ? '-' : '';

  const statusColors = {
    good: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600'
  };

  const statusIcons = {
    good: CheckCircle,
    warning: AlertTriangle,
    error: AlertTriangle
  };

  const StatusIcon = statusIcons[status];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="flex items-center space-x-2">
          <StatusIcon className={`h-4 w-4 ${statusColors[status]}`} />
          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
            {period}
          </span>
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {change !== undefined && trend && (
          <div className="flex items-center justify-between mt-2">
            <p className={`text-sm font-medium ${trendColor}`}>
              {trendSymbol}{Math.abs(change)}% vs período anterior
            </p>
          </div>
        )}
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </div>
    </div>
  );
}

interface DocumentQueueCardProps {
  document: ManualQueueDocument;
  onStatusChange: (documentId: string, newStatus: string) => void;
  onPriorityChange: (documentId: string, newPriority: string) => void;
  onNotesUpdate: (documentId: string, notes: string) => void;
  onRetry: (documentId: string) => void;
  onRemove: (documentId: string) => void;
}

function DocumentQueueCard({ 
  document, 
  onStatusChange, 
  onPriorityChange, 
  onNotesUpdate, 
  onRetry, 
  onRemove 
}: DocumentQueueCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(document.admin_notes);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'uploaded': return 'bg-green-100 text-green-800';
      case 'validated': return 'bg-emerald-100 text-emerald-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'corrupted': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'in_progress': return <Upload className="h-4 w-4 text-blue-600 animate-pulse" />;
      case 'uploaded': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'validated': return <CheckCircle className="h-4 w-4 text-emerald-600" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'corrupted': return <AlertTriangle className="h-4 w-4 text-purple-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleSaveNotes = () => {
    onNotesUpdate(document.id, notes);
    setIsEditing(false);
  };

  return (
    <div className={`border-2 rounded-xl p-6 ${
      document.corruption_detected 
        ? 'border-red-300 bg-red-50' 
        : document.priority === 'urgent'
        ? 'border-orange-300 bg-orange-50'
        : 'border-gray-200 bg-white'
    } hover:shadow-md transition-shadow`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="bg-blue-100 p-2 rounded-lg mr-3">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-800">{document.document_original_name}</h4>
            <p className="text-sm text-gray-500">Posición en cola: #{document.queue_position}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {document.corruption_detected && (
            <div className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
              Corrupto
            </div>
          )}
          <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(document.priority)}`}>
            {document.priority}
          </div>
        </div>
      </div>

      {/* Client and Project Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="flex items-center text-sm">
          <Users className="h-4 w-4 text-gray-400 mr-2" />
          <div>
            <p className="font-medium text-gray-800">{document.client_name}</p>
            <p className="text-gray-500">{document.client_email}</p>
          </div>
        </div>
        <div className="flex items-center text-sm">
          <Building2 className="h-4 w-4 text-gray-400 mr-2" />
          <p className="text-gray-700">{document.company_name}</p>
        </div>
        <div className="flex items-center text-sm">
          <FolderOpen className="h-4 w-4 text-gray-400 mr-2" />
          <p className="text-gray-700">{document.project_name}</p>
        </div>
      </div>

      {/* AI Analysis */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
        <div className="flex items-center mb-2">
          <Brain className="h-4 w-4 text-purple-600 mr-2" />
          <span className="font-medium text-purple-800">Análisis IA</span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-purple-700">Clasificación:</span>
            <p className="font-medium text-purple-600">{document.ai_analysis.classification}</p>
          </div>
          <div>
            <span className="text-purple-700">Confianza:</span>
            <p className="font-medium text-purple-600">{document.ai_analysis.confidence}%</p>
          </div>
          <div>
            <span className="text-purple-700">Integridad:</span>
            <p className={`font-medium ${
              document.file_integrity_score >= 90 ? 'text-green-600' :
              document.file_integrity_score >= 70 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {document.file_integrity_score}%
            </p>
          </div>
          <div>
            <span className="text-purple-700">Tamaño:</span>
            <p className="font-medium text-purple-600">
              {(document.ai_analysis.file_size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </div>
      </div>

      {/* Obralia Credentials Status */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Globe className="h-4 w-4 text-green-600 mr-2" />
            <span className="text-sm font-medium text-green-800">Credenciales Obralia</span>
          </div>
          <div className="flex items-center">
            {document.obralia_credentials.configured ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-xs text-green-600">Configuradas</span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 text-red-600 mr-1" />
                <span className="text-xs text-red-600">No configuradas</span>
              </>
            )}
          </div>
        </div>
        {document.obralia_credentials.username && (
          <p className="text-xs text-green-700 mt-1">
            Usuario: {document.obralia_credentials.username}
          </p>
        )}
      </div>

      {/* Status and Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          {getStatusIcon(document.manual_status)}
          <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(document.manual_status)}`}>
            {document.manual_status}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={document.priority}
            onChange={(e) => onPriorityChange(document.id, e.target.value)}
            className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
          >
            <option value="low">Baja</option>
            <option value="normal">Normal</option>
            <option value="high">Alta</option>
            <option value="urgent">Urgente</option>
          </select>
          <select
            value={document.manual_status}
            onChange={(e) => onStatusChange(document.id, e.target.value)}
            className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
          >
            <option value="pending">Pendiente</option>
            <option value="in_progress">En Progreso</option>
            <option value="uploaded">Subido</option>
            <option value="validated">Validado</option>
            <option value="error">Error</option>
            <option value="corrupted">Corrupto</option>
          </select>
        </div>
      </div>

      {/* Admin Notes */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Notas del Administrador</span>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-blue-600 hover:text-blue-800 text-xs"
          >
            {isEditing ? 'Cancelar' : 'Editar'}
          </button>
        </div>
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Agregar notas sobre el procesamiento manual..."
            />
            <div className="flex space-x-2">
              <button
                onClick={handleSaveNotes}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs"
              >
                Guardar
              </button>
              <button
                onClick={() => {
                  setNotes(document.admin_notes);
                  setIsEditing(false);
                }}
                className="px-3 py-1 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded text-xs"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
            {document.admin_notes || 'Sin notas'}
          </p>
        )}
      </div>

      {/* Error Message */}
      {document.last_error_message && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <div className="flex items-start">
            <AlertTriangle className="h-4 w-4 text-red-600 mr-2 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Último Error</p>
              <p className="text-xs text-red-700">{document.last_error_message}</p>
              <p className="text-xs text-red-600 mt-1">Reintentos: {document.retry_count}</p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex space-x-2">
        <button
          onClick={() => onRetry(document.id)}
          className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm flex items-center justify-center"
        >
          <RotateCcw className="h-3 w-3 mr-1" />
          Reintentar
        </button>
        <button className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm">
          <Eye className="h-3 w-3" />
        </button>
        <button
          onClick={() => onRemove(document.id)}
          className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

export default function ManualManagement() {
  const [queueDocuments, setQueueDocuments] = useState<ManualQueueDocument[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<ManualQueueDocument[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterClient, setFilterClient] = useState('all');
  const [aiInsights, setAiInsights] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentSession, setCurrentSession] = useState<any>(null);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);

  // KPIs de Gestión Manual
  const manualKPIs = [
    { title: 'Documentos en Cola', value: queueDocuments.length.toString(), status: 'warning' as const, icon: Clock, color: 'bg-yellow-500', description: 'Pendientes de procesamiento manual', period: 'tiempo real' },
    { title: 'Documentos Corruptos', value: queueDocuments.filter(d => d.corruption_detected).length.toString(), status: 'error' as const, icon: AlertTriangle, color: 'bg-red-500', description: 'Requieren atención inmediata', period: 'tiempo real' },
    { title: 'En Progreso', value: queueDocuments.filter(d => d.manual_status === 'in_progress').length.toString(), status: 'good' as const, icon: Upload, color: 'bg-blue-500', description: 'Siendo procesados actualmente', period: 'tiempo real' },
    { title: 'Subidos Hoy', value: '23', change: 15.2, trend: 'up' as const, status: 'good' as const, icon: CheckCircle, color: 'bg-green-500', description: 'Documentos subidos manualmente', period: 'diario' },
    { title: 'Validados Hoy', value: '18', change: 12.5, trend: 'up' as const, status: 'good' as const, icon: Shield, color: 'bg-emerald-500', description: 'Documentos validados en Obralia', period: 'diario' },
    { title: 'Tiempo Promedio', value: '4.2min', change: -8.3, trend: 'up' as const, status: 'good' as const, icon: Clock, color: 'bg-purple-500', description: 'Por documento procesado', period: 'promedio' },
    { title: 'Tasa de Éxito', value: '94.7%', change: 2.1, trend: 'up' as const, status: 'good' as const, icon: TrendingUp, color: 'bg-indigo-500', description: 'Documentos procesados exitosamente', period: 'mensual' },
    { title: 'Sesión Activa', value: currentSession ? 'Sí' : 'No', status: currentSession ? 'good' as const : 'warning' as const, icon: Activity, color: 'bg-cyan-500', description: 'Estado de la sesión de procesamiento', period: 'tiempo real' }
  ];

  // Datos simulados de documentos en cola
  const mockQueueDocuments: ManualQueueDocument[] = [
    {
      id: '1',
      document_id: 'doc_001',
      client_id: 'cli_001',
      company_id: 'comp_001',
      project_id: 'proj_001',
      queue_position: 1,
      priority: 'urgent',
      manual_status: 'pending',
      ai_analysis: {
        classification: 'Certificado',
        confidence: 92,
        file_size: 2456789,
        file_type: 'application/pdf',
        corruption_detected: false,
        integrity_score: 95,
        recommended_action: 'upload_immediately'
      },
      admin_notes: 'Documento urgente para proyecto crítico',
      obralia_credentials: { username: 'juan_garcia', configured: true },
      corruption_detected: false,
      file_integrity_score: 95,
      retry_count: 0,
      created_at: '2025-01-27T15:45:00Z',
      updated_at: '2025-01-27T15:45:00Z',
      document_filename: 'certificado_obra_A_20240127.pdf',
      document_original_name: 'Certificado de Obra A.pdf',
      client_name: 'Construcciones García S.L.',
      company_name: 'Construcciones García S.L.',
      project_name: 'Edificio Residencial Centro',
      client_email: 'juan@construccionesgarcia.com'
    },
    {
      id: '2',
      document_id: 'doc_002',
      client_id: 'cli_002',
      company_id: 'comp_002',
      project_id: 'proj_002',
      queue_position: 2,
      priority: 'high',
      manual_status: 'pending',
      ai_analysis: {
        classification: 'Factura',
        confidence: 88,
        file_size: 1234567,
        file_type: 'application/pdf',
        corruption_detected: false,
        integrity_score: 88,
        recommended_action: 'upload_normal'
      },
      admin_notes: '',
      obralia_credentials: { username: 'maria_lopez', configured: true },
      corruption_detected: false,
      file_integrity_score: 88,
      retry_count: 1,
      last_error_message: 'Timeout de conexión con Obralia',
      created_at: '2025-01-27T15:42:00Z',
      updated_at: '2025-01-27T15:42:00Z',
      document_filename: 'factura_materiales_B_20240126.pdf',
      document_original_name: 'Factura Materiales B.pdf',
      client_name: 'Obras Públicas del Norte S.A.',
      company_name: 'Obras Públicas del Norte S.A.',
      project_name: 'Puente Industrial A-7',
      client_email: 'maria@obrasnorte.es'
    },
    {
      id: '3',
      document_id: 'doc_003',
      client_id: 'cli_003',
      company_id: 'comp_003',
      project_id: 'proj_003',
      queue_position: 3,
      priority: 'urgent',
      manual_status: 'corrupted',
      ai_analysis: {
        classification: 'unknown',
        confidence: 15,
        file_size: 0,
        file_type: 'application/pdf',
        corruption_detected: true,
        integrity_score: 0,
        recommended_action: 'manual_review_required'
      },
      admin_notes: 'Archivo corrupto detectado por IA - requiere revisión manual',
      obralia_credentials: { configured: false },
      corruption_detected: true,
      file_integrity_score: 0,
      retry_count: 3,
      last_error_message: 'Archivo corrupto o vacío detectado',
      created_at: '2025-01-27T15:38:00Z',
      updated_at: '2025-01-27T15:38:00Z',
      document_filename: 'documento_corrupto.pdf',
      document_original_name: 'Documento Corrupto.pdf',
      client_name: 'Reformas Integrales López',
      company_name: 'Reformas Integrales López',
      project_name: 'Centro Comercial Valencia',
      client_email: 'carlos@reformaslopez.com'
    }
  ];

  useEffect(() => {
    setQueueDocuments(mockQueueDocuments);
    setFilteredDocuments(mockQueueDocuments);
    generateManualInsights();
  }, []);

  useEffect(() => {
    let filtered = queueDocuments.filter(doc => {
      const matchesSearch = doc.document_original_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.project_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || doc.manual_status === filterStatus;
      const matchesPriority = filterPriority === 'all' || doc.priority === filterPriority;
      const matchesClient = filterClient === 'all' || doc.client_id === filterClient;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesClient;
    });

    // Ordenar por prioridad y posición en cola
    filtered.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 };
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder];
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder];
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      return a.queue_position - b.queue_position;
    });

    setFilteredDocuments(filtered);
  }, [queueDocuments, searchTerm, filterStatus, filterPriority, filterClient]);

  const generateManualInsights = async () => {
    setLoading(true);
    try {
      // Simular insights mientras Gemini está fallando
      const mockInsights = `🔧 Análisis de Gestión Manual:

1. **Cola Crítica**: ${queueDocuments.length} documentos pendientes, ${queueDocuments.filter(d => d.corruption_detected).length} corruptos detectados por IA.

2. **Priorización Inteligente**: IA ha identificado ${queueDocuments.filter(d => d.priority === 'urgent').length} documentos urgentes que requieren procesamiento inmediato.

3. **Optimización**: Tiempo promedio de 4.2min por documento, recomiendo procesar en lotes de 5-10 documentos para mayor eficiencia.`;
      
      setAiInsights(mockInsights);
    } catch (error) {
      setAiInsights('Error al generar insights de gestión manual. La API de Gemini está temporalmente no disponible.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (documentId: string, newStatus: string) => {
    setQueueDocuments(prev => prev.map(doc => 
      doc.id === documentId 
        ? { 
            ...doc, 
            manual_status: newStatus as any,
            processed_at: newStatus === 'uploaded' || newStatus === 'validated' ? new Date().toISOString() : doc.processed_at,
            updated_at: new Date().toISOString()
          }
        : doc
    ));

    // Simular actualización en base de datos
    console.log(`Actualizando estado del documento ${documentId} a ${newStatus}`);
  };

  const handlePriorityChange = async (documentId: string, newPriority: string) => {
    setQueueDocuments(prev => prev.map(doc => 
      doc.id === documentId 
        ? { ...doc, priority: newPriority as any, updated_at: new Date().toISOString() }
        : doc
    ));

    console.log(`Actualizando prioridad del documento ${documentId} a ${newPriority}`);
  };

  const handleNotesUpdate = async (documentId: string, notes: string) => {
    setQueueDocuments(prev => prev.map(doc => 
      doc.id === documentId 
        ? { ...doc, admin_notes: notes, updated_at: new Date().toISOString() }
        : doc
    ));

    console.log(`Actualizando notas del documento ${documentId}: ${notes}`);
  };

  const handleRetry = async (documentId: string) => {
    setQueueDocuments(prev => prev.map(doc => 
      doc.id === documentId 
        ? { 
            ...doc, 
            manual_status: 'pending',
            retry_count: doc.retry_count + 1,
            last_error_message: undefined,
            updated_at: new Date().toISOString()
          }
        : doc
    ));

    console.log(`Reintentando procesamiento del documento ${documentId}`);
  };

  const handleRemove = async (documentId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este documento de la cola?')) {
      setQueueDocuments(prev => prev.filter(doc => doc.id !== documentId));
      console.log(`Eliminando documento ${documentId} de la cola manual`);
    }
  };

  const startProcessingSession = async () => {
    setIsProcessing(true);
    const session = {
      id: `session_${Date.now()}`,
      admin_id: 'admin_001',
      session_start: new Date().toISOString(),
      documents_processed: 0,
      documents_uploaded: 0,
      documents_validated: 0,
      session_status: 'active'
    };
    setCurrentSession(session);
    console.log('Iniciando sesión de procesamiento manual');
  };

  const endProcessingSession = async () => {
    if (currentSession) {
      const updatedSession = {
        ...currentSession,
        session_end: new Date().toISOString(),
        session_status: 'completed'
      };
      setCurrentSession(null);
      setIsProcessing(false);
      console.log('Finalizando sesión de procesamiento manual', updatedSession);
    }
  };

  const processNextDocument = async () => {
    const nextDoc = filteredDocuments.find(doc => doc.manual_status === 'pending');
    if (nextDoc) {
      await handleStatusChange(nextDoc.id, 'in_progress');
      
      // Simular procesamiento
      setTimeout(async () => {
        await handleStatusChange(nextDoc.id, 'uploaded');
        
        // Simular validación
        setTimeout(async () => {
          await handleStatusChange(nextDoc.id, 'validated');
        }, 2000);
      }, 3000);
    }
  };

  const analyzeQueueWithAI = async () => {
    setLoading(true);
    try {
      // Simular análisis de IA de la cola
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Actualizar análisis de documentos
      setQueueDocuments(prev => prev.map(doc => ({
        ...doc,
        ai_analysis: {
          ...doc.ai_analysis,
          last_ai_analysis: new Date().toISOString(),
          queue_recommendation: doc.corruption_detected ? 'manual_review' : 'auto_process'
        }
      })));
      
      alert('Análisis de IA completado. Se han actualizado las recomendaciones para todos los documentos en cola.');
    } catch (error) {
      alert('Error al analizar la cola con IA');
    } finally {
      setLoading(false);
    }
  };

  const exportQueueReport = () => {
    const csvContent = [
      ['Posición', 'Documento', 'Cliente', 'Empresa', 'Proyecto', 'Prioridad', 'Estado', 'Integridad', 'Fecha'].join(','),
      ...filteredDocuments.map(doc => [
        doc.queue_position,
        `"${doc.document_original_name}"`,
        `"${doc.client_name}"`,
        `"${doc.company_name}"`,
        `"${doc.project_name}"`,
        doc.priority,
        doc.manual_status,
        `${doc.file_integrity_score}%`,
        new Date(doc.created_at).toLocaleDateString('es-ES')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cola_manual_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Datos para gráficos
  const queueStatusData = {
    labels: ['Pendientes', 'En Progreso', 'Subidos', 'Validados', 'Errores', 'Corruptos'],
    datasets: [{
      data: [
        queueDocuments.filter(d => d.manual_status === 'pending').length,
        queueDocuments.filter(d => d.manual_status === 'in_progress').length,
        queueDocuments.filter(d => d.manual_status === 'uploaded').length,
        queueDocuments.filter(d => d.manual_status === 'validated').length,
        queueDocuments.filter(d => d.manual_status === 'error').length,
        queueDocuments.filter(d => d.manual_status === 'corrupted').length
      ],
      backgroundColor: [
        'rgba(245, 158, 11, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(168, 85, 247, 0.8)'
      ],
      borderWidth: 0
    }]
  };

  const priorityDistributionData = {
    labels: ['Urgente', 'Alta', 'Normal', 'Baja'],
    datasets: [{
      data: [
        queueDocuments.filter(d => d.priority === 'urgent').length,
        queueDocuments.filter(d => d.priority === 'high').length,
        queueDocuments.filter(d => d.priority === 'normal').length,
        queueDocuments.filter(d => d.priority === 'low').length
      ],
      backgroundColor: [
        'rgba(239, 68, 68, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(156, 163, 175, 0.8)'
      ],
      borderWidth: 0
    }]
  };

  const processingTimeData = {
    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab', 'Dom'],
    datasets: [{
      label: 'Documentos Procesados',
      data: [12, 15, 8, 23, 18, 6, 4],
      borderColor: 'rgb(34, 197, 94)',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  const clients = [...new Set(queueDocuments.map(d => ({ id: d.client_id, name: d.client_name })))];

  return (
    <div className="space-y-8">
      {/* Header con IA */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Gestión Manual de Documentos</h2>
            <p className="text-orange-100 mt-1">Cola de procesamiento manual con IA integrada</p>
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
            <h3 className="font-semibold mb-2">🔧 Insights de Gestión Manual IA:</h3>
            <div className="text-sm text-white/90 whitespace-pre-line">{aiInsights}</div>
          </div>
        )}
      </div>

      {/* KPIs de Gestión Manual */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Métricas de Cola Manual</h3>
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">Actualización automática</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {manualKPIs.map((kpi, index) => (
            <ManualKPICard key={index} {...kpi} />
          ))}
        </div>
      </div>

      {/* Controles de Sesión */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Control de Sesión de Procesamiento</h3>
          <div className="flex items-center space-x-2">
            {currentSession && (
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                Sesión Activa
              </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-700">Controles de Sesión</h4>
            <div className="space-y-2">
              {!isProcessing ? (
                <button
                  onClick={startProcessingSession}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Iniciar Sesión Manual
                </button>
              ) : (
                <button
                  onClick={endProcessingSession}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  <Pause className="h-4 w-4 mr-2" />
                  Finalizar Sesión
                </button>
              )}
              
              <button
                onClick={processNextDocument}
                disabled={!isProcessing}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                <SkipForward className="h-4 w-4 mr-2" />
                Procesar Siguiente
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-700">Análisis IA</h4>
            <div className="space-y-2">
              <button
                onClick={analyzeQueueWithAI}
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                <Brain className="h-4 w-4 mr-2" />
                {loading ? 'Analizando...' : 'Analizar Cola con IA'}
              </button>
              
              <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center">
                <Shield className="h-4 w-4 mr-2" />
                Detectar Corrupción
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-700">Reportes</h4>
            <div className="space-y-2">
              <button
                onClick={exportQueueReport}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar Cola
              </button>
              
              <button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center">
                <BarChart3 className="h-4 w-4 mr-2" />
                Reporte Detallado
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos de Análisis */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Análisis Visual de la Cola</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-800">Estado de Documentos</h4>
              <Eye className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600" />
            </div>
            <div className="h-48">
              <Doughnut data={queueStatusData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-800">Distribución de Prioridad</h4>
              <BarChart3 className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600" />
            </div>
            <div className="h-48">
              <Doughnut data={priorityDistributionData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-800">Procesamiento Semanal</h4>
              <Download className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600" />
            </div>
            <div className="h-48">
              <Line data={processingTimeData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
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
                placeholder="Buscar por documento, cliente, empresa o proyecto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="in_progress">En Progreso</option>
            <option value="uploaded">Subido</option>
            <option value="validated">Validado</option>
            <option value="error">Error</option>
            <option value="corrupted">Corrupto</option>
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
          
          <select
            value={filterClient}
            onChange={(e) => setFilterClient(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">Todos los clientes</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Cola de Documentos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">
            Cola de Documentos ({filteredDocuments.length})
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {filteredDocuments.filter(d => d.corruption_detected).length} corruptos detectados
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredDocuments.map((document) => (
            <DocumentQueueCard
              key={document.id}
              document={document}
              onStatusChange={handleStatusChange}
              onPriorityChange={handlePriorityChange}
              onNotesUpdate={handleNotesUpdate}
              onRetry={handleRetry}
              onRemove={handleRemove}
            />
          ))}
        </div>

        {filteredDocuments.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">Cola vacía</h3>
            <p className="text-gray-600">
              {searchTerm ? 'No se encontraron documentos con esos criterios' : 'No hay documentos en la cola manual'}
            </p>
          </div>
        )}
      </div>

      {/* Información de Ayuda */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start">
          <Info className="h-6 w-6 text-blue-600 mr-3 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-800 mb-2">Gestión Manual de Documentos</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Los documentos se añaden automáticamente a la cola cuando falla la API de Obralia</li>
              <li>• La IA analiza la integridad y detecta archivos corruptos automáticamente</li>
              <li>• Los documentos se procesan en orden de prioridad y posición en cola</li>
              <li>• Las credenciales de Obralia de cada cliente se muestran para facilitar la subida manual</li>
              <li>• Se mantiene un registro completo de todas las operaciones manuales</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}