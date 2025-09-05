import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  FileText,
  Users,
  Mail,
  Phone,
  Globe,
  Calendar,
  Clock,
  Eye,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  Download,
  Search,
  Filter,
  Save,
  X,
  Info,
  Database,
  Lock,
  Unlock,
  Bell,
  Target,
  Activity,
  BarChart3,
  TrendingUp,
  AlertCircle,
  Settings,
  User,
  Building2,
  Zap
} from 'lucide-react';
import { supabaseServiceClient, DEV_TENANT_ID } from '../../lib/supabase-real';

interface ComplianceCheck {
  id: string;
  tenant_id: string;
  category: string;
  check_name: string;
  status: 'compliant' | 'warning' | 'non_compliant';
  description: string;
  last_verified: string;
  next_review: string;
  responsible_user?: string;
  evidence_url?: string;
  created_at: string;
  updated_at: string;
}

interface DataSubjectRequest {
  id: string;
  tenant_id: string;
  request_type: 'access' | 'rectification' | 'erasure' | 'portability' | 'objection';
  requester_email: string;
  requester_name?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  request_details: any;
  response_data?: any;
  completed_at?: string;
  deadline: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

interface PrivacyImpactAssessment {
  id: string;
  tenant_id: string;
  assessment_name: string;
  processing_purpose?: string;
  data_categories: string[];
  risk_level: 'low' | 'medium' | 'high' | 'very_high';
  mitigation_measures: string[];
  status: 'draft' | 'under_review' | 'approved' | 'requires_action';
  assessor_id?: string;
  approved_by?: string;
  approved_at?: string;
  next_review?: string;
  created_at: string;
  updated_at: string;
}

interface DataBreach {
  id: string;
  tenant_id: string;
  incident_title: string;
  description?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affected_records: number;
  data_categories: string[];
  discovery_date: string;
  notification_date?: string;
  authority_notified: boolean;
  subjects_notified: boolean;
  status: 'investigating' | 'contained' | 'resolved';
  mitigation_actions: string[];
  lessons_learned?: string;
  reported_by?: string;
  created_at: string;
  updated_at: string;
}

interface ConsentRecord {
  id: string;
  tenant_id: string;
  user_email: string;
  consent_type: string;
  purpose: string;
  granted: boolean;
  granted_at?: string;
  withdrawn_at?: string;
  ip_address?: string;
  user_agent?: string;
  legal_basis?: string;
  retention_period?: string;
  created_at: string;
  updated_at: string;
}

interface ComplianceKPIs {
  totalChecks: number;
  compliantChecks: number;
  warningChecks: number;
  nonCompliantChecks: number;
  complianceRate: number;
  pendingRequests: number;
  completedRequests: number;
  overdueRequests: number;
  activeAssessments: number;
  highRiskAssessments: number;
  openBreaches: number;
  resolvedBreaches: number;
  activeConsents: number;
  withdrawnConsents: number;
}

export default function DataProtectionCompliance() {
  const [activeTab, setActiveTab] = useState('resumen');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Data states
  const [complianceChecks, setComplianceChecks] = useState<ComplianceCheck[]>([]);
  const [dataRequests, setDataRequests] = useState<DataSubjectRequest[]>([]);
  const [assessments, setAssessments] = useState<PrivacyImpactAssessment[]>([]);
  const [breaches, setBreaches] = useState<DataBreach[]>([]);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [kpis, setKpis] = useState<ComplianceKPIs>({
    totalChecks: 0,
    compliantChecks: 0,
    warningChecks: 0,
    nonCompliantChecks: 0,
    complianceRate: 0,
    pendingRequests: 0,
    completedRequests: 0,
    overdueRequests: 0,
    activeAssessments: 0,
    highRiskAssessments: 0,
    openBreaches: 0,
    resolvedBreaches: 0,
    activeConsents: 0,
    withdrawnConsents: 0
  });

  // Modal states
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [showBreachModal, setShowBreachModal] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');

  // Form states
  const [newRequest, setNewRequest] = useState({
    request_type: 'access' as const,
    requester_email: '',
    requester_name: '',
    request_details: { details: '' },
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const [newAssessment, setNewAssessment] = useState({
    assessment_name: '',
    processing_purpose: '',
    data_categories: [] as string[],
    risk_level: 'medium' as const,
    mitigation_measures: [] as string[],
    status: 'draft' as const
  });

  const [newBreach, setNewBreach] = useState({
    incident_title: '',
    description: '',
    severity: 'medium' as const,
    affected_records: 0,
    data_categories: [] as string[],
    discovery_date: new Date().toISOString().split('T')[0],
    authority_notified: false,
    subjects_notified: false,
    status: 'investigating' as const,
    mitigation_actions: [] as string[]
  });

  const [newConsent, setNewConsent] = useState({
    user_email: '',
    consent_type: 'marketing',
    purpose: '',
    granted: true,
    legal_basis: 'consent',
    retention_period: '2 años'
  });

  useEffect(() => {
    loadComplianceData();
  }, []);

  const loadComplianceData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all compliance data with fallback
      const [checksData, requestsData, assessmentsData, breachesData, consentsData] = await Promise.all([
        loadComplianceChecks(),
        loadDataRequests(),
        loadAssessments(),
        loadBreaches(),
        loadConsents()
      ]);

      setComplianceChecks(checksData);
      setDataRequests(requestsData);
      setAssessments(assessmentsData);
      setBreaches(breachesData);
      setConsents(consentsData);

      // Calculate KPIs
      calculateKPIs(checksData, requestsData, assessmentsData, breachesData, consentsData);

    } catch (err) {
      console.error('Error loading compliance data:', err);
      setError(err instanceof Error ? err.message : 'Error loading compliance data');
    } finally {
      setLoading(false);
    }
  };

  const loadComplianceChecks = async (): Promise<ComplianceCheck[]> => {
    console.log('🔍 Loading compliance checks data...');
    return getFallbackComplianceChecks();
  };

  const loadDataRequests = async (): Promise<DataSubjectRequest[]> => {
    console.log('🔍 Using fallback requests data');
    return getFallbackDataRequests();
  };

  const loadAssessments = async (): Promise<PrivacyImpactAssessment[]> => {
    console.log('🔍 Using fallback assessments data');
    return getFallbackAssessments();
  };

  const loadBreaches = async (): Promise<DataBreach[]> => {
    console.log('🔍 Using fallback breaches data');
    return getFallbackBreaches();
  };

  const loadConsents = async (): Promise<ConsentRecord[]> => {
    console.log('🔍 Using fallback consents data');
    return getFallbackConsents();
  };

  const calculateKPIs = (
    checks: ComplianceCheck[],
    requests: DataSubjectRequest[],
    assessments: PrivacyImpactAssessment[],
    breaches: DataBreach[],
    consents: ConsentRecord[]
  ) => {
    const now = new Date();
    
    setKpis({
      totalChecks: checks.length,
      compliantChecks: checks.filter(c => c.status === 'compliant').length,
      warningChecks: checks.filter(c => c.status === 'warning').length,
      nonCompliantChecks: checks.filter(c => c.status === 'non_compliant').length,
      complianceRate: checks.length > 0 ? (checks.filter(c => c.status === 'compliant').length / checks.length) * 100 : 0,
      pendingRequests: requests.filter(r => r.status === 'pending').length,
      completedRequests: requests.filter(r => r.status === 'completed').length,
      overdueRequests: requests.filter(r => new Date(r.deadline) < now && r.status !== 'completed').length,
      activeAssessments: assessments.filter(a => a.status !== 'approved').length,
      highRiskAssessments: assessments.filter(a => ['high', 'very_high'].includes(a.risk_level)).length,
      openBreaches: breaches.filter(b => b.status !== 'resolved').length,
      resolvedBreaches: breaches.filter(b => b.status === 'resolved').length,
      activeConsents: consents.filter(c => c.granted && !c.withdrawn_at).length,
      withdrawnConsents: consents.filter(c => c.withdrawn_at).length
    });
  };

  // CRUD Functions for Data Subject Requests
  const handleCreateRequest = async () => {
    try {
      const requestData = {
        id: `req_${Date.now()}`,
        ...newRequest,
        tenant_id: DEV_TENANT_ID,
        status: 'pending' as const,
        assigned_to: 'dpo@constructia.com',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setDataRequests(prev => [requestData, ...prev]);
      setShowRequestModal(false);
      setNewRequest({
        request_type: 'access',
        requester_email: '',
        requester_name: '',
        request_details: { details: '' },
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
      alert('✅ Solicitud creada correctamente');
    } catch (error) {
      console.error('Error creating request:', error);
      alert('Error al crear solicitud');
    }
  };

  const handleUpdateRequestStatus = async (requestId: string, newStatus: DataSubjectRequest['status']) => {
    try {
      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      if (newStatus === 'completed') {
        updateData.completed_at = new Date().toISOString();
        updateData.response_data = { action: 'Solicitud procesada correctamente' };
      }

      setDataRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { ...req, ...updateData }
          : req
      ));
      alert('✅ Estado actualizado correctamente');
    } catch (error) {
      console.error('Error updating request:', error);
      alert('Error al actualizar solicitud');
    }
  };

  // CRUD Functions for Privacy Impact Assessments
  const handleCreateAssessment = async () => {
    try {
      const assessmentData = {
        id: `pia_${Date.now()}`,
        ...newAssessment,
        tenant_id: DEV_TENANT_ID,
        assessor_id: 'dpo@constructia.com',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setAssessments(prev => [assessmentData, ...prev]);
      setShowAssessmentModal(false);
      setNewAssessment({
        assessment_name: '',
        processing_purpose: '',
        data_categories: [],
        risk_level: 'medium',
        mitigation_measures: [],
        status: 'draft'
      });
      alert('✅ Evaluación creada correctamente');
    } catch (error) {
      console.error('Error creating assessment:', error);
      alert('Error al crear evaluación');
    }
  };

  const handleUpdateAssessmentStatus = async (assessmentId: string, newStatus: PrivacyImpactAssessment['status']) => {
    try {
      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      if (newStatus === 'approved') {
        updateData.approved_at = new Date().toISOString();
        updateData.approved_by = 'admin@constructia.com';
        updateData.next_review = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
      }

      setAssessments(prev => prev.map(assessment => 
        assessment.id === assessmentId 
          ? { ...assessment, ...updateData }
          : assessment
      ));
      alert('✅ Evaluación actualizada correctamente');
    } catch (error) {
      console.error('Error updating assessment:', error);
      alert('Error al actualizar evaluación');
    }
  };

  // CRUD Functions for Data Breaches
  const handleCreateBreach = async () => {
    try {
      const breachData = {
        id: `breach_${Date.now()}`,
        ...newBreach,
        tenant_id: DEV_TENANT_ID,
        reported_by: 'admin@constructia.com',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setBreaches(prev => [breachData, ...prev]);
      setShowBreachModal(false);
      setNewBreach({
        incident_title: '',
        description: '',
        severity: 'medium',
        affected_records: 0,
        data_categories: [],
        discovery_date: new Date().toISOString().split('T')[0],
        authority_notified: false,
        subjects_notified: false,
        status: 'investigating',
        mitigation_actions: []
      });
      alert('✅ Brecha registrada correctamente');
    } catch (error) {
      console.error('Error creating breach:', error);
      alert('Error al crear brecha');
    }
  };

  const handleUpdateBreachStatus = async (breachId: string, newStatus: DataBreach['status']) => {
    try {
      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      if (newStatus === 'resolved') {
        updateData.lessons_learned = 'Incidente resuelto y medidas implementadas';
      }

      setBreaches(prev => prev.map(breach => 
        breach.id === breachId 
          ? { ...breach, ...updateData }
          : breach
      ));
      alert('✅ Brecha actualizada correctamente');
    } catch (error) {
      console.error('Error updating breach:', error);
      alert('Error al actualizar brecha');
    }
  };

  // CRUD Functions for Consent Records
  const handleCreateConsent = async () => {
    try {
      const consentData = {
        id: `consent_${Date.now()}`,
        ...newConsent,
        tenant_id: DEV_TENANT_ID,
        granted_at: newConsent.granted ? new Date().toISOString() : undefined,
        ip_address: '127.0.0.1',
        user_agent: 'ConstructIA Admin Panel',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setConsents(prev => [consentData, ...prev]);
      setShowConsentModal(false);
      setNewConsent({
        user_email: '',
        consent_type: 'marketing',
        purpose: '',
        granted: true,
        legal_basis: 'consent',
        retention_period: '2 años'
      });
      alert('✅ Consentimiento registrado correctamente');
    } catch (error) {
      console.error('Error creating consent:', error);
      alert('Error al crear consentimiento');
    }
  };

  const handleWithdrawConsent = async (consentId: string) => {
    try {
      const updateData = {
        granted: false,
        withdrawn_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setConsents(prev => prev.map(consent => 
        consent.id === consentId 
          ? { ...consent, ...updateData }
          : consent
      ));
      alert('✅ Consentimiento retirado correctamente');
    } catch (error) {
      console.error('Error withdrawing consent:', error);
      alert('Error al retirar consentimiento');
    }
  };

  // Fallback data functions
  const getFallbackComplianceChecks = (): ComplianceCheck[] => [
    {
      id: '1',
      tenant_id: DEV_TENANT_ID,
      category: 'Principios Fundamentales LOPD',
      check_name: 'Licitud del tratamiento',
      status: 'compliant',
      description: 'Base legal establecida para todos los tratamientos',
      last_verified: '2024-12-01T10:00:00Z',
      next_review: '2025-03-01T10:00:00Z',
      created_at: '2024-12-01T10:00:00Z',
      updated_at: '2024-12-01T10:00:00Z'
    },
    {
      id: '2',
      tenant_id: DEV_TENANT_ID,
      category: 'Derechos de los Interesados',
      check_name: 'Derecho de acceso',
      status: 'compliant',
      description: 'Sistema de consulta de datos personales implementado',
      last_verified: '2024-12-01T10:00:00Z',
      next_review: '2025-03-01T10:00:00Z',
      created_at: '2024-12-01T10:00:00Z',
      updated_at: '2024-12-01T10:00:00Z'
    },
    {
      id: '3',
      tenant_id: DEV_TENANT_ID,
      category: 'Seguridad Técnica',
      check_name: 'Cifrado de datos',
      status: 'compliant',
      description: 'Datos cifrados en reposo y tránsito',
      last_verified: '2024-12-01T10:00:00Z',
      next_review: '2025-03-01T10:00:00Z',
      created_at: '2024-12-01T10:00:00Z',
      updated_at: '2024-12-01T10:00:00Z'
    },
    {
      id: '4',
      tenant_id: DEV_TENANT_ID,
      category: 'Gobernanza y Organización',
      check_name: 'Formación del personal',
      status: 'warning',
      description: 'Pendiente formación trimestral en protección de datos',
      last_verified: '2024-09-01T10:00:00Z',
      next_review: '2025-01-01T10:00:00Z',
      created_at: '2024-09-01T10:00:00Z',
      updated_at: '2024-12-01T10:00:00Z'
    },
    {
      id: '5',
      tenant_id: DEV_TENANT_ID,
      category: 'Documentación y Registros',
      check_name: 'Registro de actividades de tratamiento',
      status: 'compliant',
      description: 'Registro actualizado y completo',
      last_verified: '2024-12-01T10:00:00Z',
      next_review: '2025-06-01T10:00:00Z',
      created_at: '2024-12-01T10:00:00Z',
      updated_at: '2024-12-01T10:00:00Z'
    }
  ];

  const getFallbackDataRequests = (): DataSubjectRequest[] => [
    {
      id: '1',
      tenant_id: DEV_TENANT_ID,
      request_type: 'access',
      requester_email: 'usuario1@ejemplo.com',
      requester_name: 'Juan Pérez',
      status: 'pending',
      request_details: { details: 'Solicito acceso a todos mis datos personales almacenados en ConstructIA' },
      deadline: '2025-01-30T23:59:59Z',
      assigned_to: 'dpo@constructia.com',
      created_at: '2025-01-01T10:00:00Z',
      updated_at: '2025-01-01T10:00:00Z'
    },
    {
      id: '2',
      tenant_id: DEV_TENANT_ID,
      request_type: 'erasure',
      requester_email: 'usuario2@ejemplo.com',
      requester_name: 'María García',
      status: 'completed',
      request_details: { details: 'Solicito la eliminación completa de mis datos personales' },
      response_data: { action: 'Datos eliminados exitosamente', date: '2024-12-15T14:30:00Z' },
      completed_at: '2024-12-15T14:30:00Z',
      deadline: '2025-01-15T23:59:59Z',
      assigned_to: 'dpo@constructia.com',
      created_at: '2024-12-16T09:00:00Z',
      updated_at: '2024-12-15T14:30:00Z'
    },
    {
      id: '3',
      tenant_id: DEV_TENANT_ID,
      request_type: 'rectification',
      requester_email: 'usuario3@ejemplo.com',
      requester_name: 'Carlos López',
      status: 'in_progress',
      request_details: { details: 'Necesito corregir mi dirección de contacto en el sistema' },
      deadline: '2025-02-05T23:59:59Z',
      assigned_to: 'dpo@constructia.com',
      created_at: '2025-01-06T11:30:00Z',
      updated_at: '2025-01-06T11:30:00Z'
    }
  ];

  const getFallbackAssessments = (): PrivacyImpactAssessment[] => [
    {
      id: '1',
      tenant_id: DEV_TENANT_ID,
      assessment_name: 'Procesamiento de Documentos con IA',
      processing_purpose: 'Clasificación automática de documentos de construcción mediante inteligencia artificial',
      data_categories: ['Datos de identificación', 'Documentos profesionales', 'Metadatos de archivos'],
      risk_level: 'medium',
      mitigation_measures: [
        'Cifrado de datos en reposo y tránsito',
        'Acceso basado en roles',
        'Auditoría de accesos',
        'Minimización de datos procesados'
      ],
      status: 'approved',
      assessor_id: 'dpo@constructia.com',
      approved_by: 'admin@constructia.com',
      approved_at: '2024-11-15T14:00:00Z',
      next_review: '2025-11-15T14:00:00Z',
      created_at: '2024-11-01T09:00:00Z',
      updated_at: '2024-11-15T14:00:00Z'
    },
    {
      id: '2',
      tenant_id: DEV_TENANT_ID,
      assessment_name: 'Integración con Plataformas Externas',
      processing_purpose: 'Transferencia de datos a plataformas CAE (Nalanda, CTAIMA, Ecoordina)',
      data_categories: ['Datos de trabajadores', 'Documentos de obra', 'Información empresarial'],
      risk_level: 'high',
      mitigation_measures: [
        'Contratos de encargado de tratamiento',
        'Cláusulas contractuales tipo',
        'Evaluación de garantías de seguridad',
        'Monitoreo continuo de transferencias'
      ],
      status: 'under_review',
      assessor_id: 'dpo@constructia.com',
      created_at: '2024-12-01T10:00:00Z',
      updated_at: '2024-12-01T10:00:00Z'
    }
  ];

  const getFallbackBreaches = (): DataBreach[] => [
    {
      id: '1',
      tenant_id: DEV_TENANT_ID,
      incident_title: 'Acceso no autorizado detectado',
      description: 'Se detectaron múltiples intentos de acceso fallidos desde IP sospechosa',
      severity: 'medium',
      affected_records: 0,
      data_categories: ['Logs de acceso'],
      discovery_date: '2024-12-20T08:30:00Z',
      notification_date: '2024-12-20T09:00:00Z',
      authority_notified: false,
      subjects_notified: false,
      status: 'contained',
      mitigation_actions: [
        'Bloqueo de IP sospechosa',
        'Revisión de logs de seguridad',
        'Refuerzo de autenticación'
      ],
      reported_by: 'security@constructia.com',
      created_at: '2024-12-20T08:30:00Z',
      updated_at: '2024-12-20T10:00:00Z'
    }
  ];

  const getFallbackConsents = (): ConsentRecord[] => [
    {
      id: '1',
      tenant_id: DEV_TENANT_ID,
      user_email: 'cliente1@empresa.com',
      consent_type: 'marketing',
      purpose: 'Envío de comunicaciones comerciales y promocionales',
      granted: true,
      granted_at: '2024-11-01T10:00:00Z',
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      legal_basis: 'consent',
      retention_period: '2 años',
      created_at: '2024-11-01T10:00:00Z',
      updated_at: '2024-11-01T10:00:00Z'
    },
    {
      id: '2',
      tenant_id: DEV_TENANT_ID,
      user_email: 'cliente2@empresa.com',
      consent_type: 'analytics',
      purpose: 'Análisis de uso de la plataforma para mejoras',
      granted: true,
      granted_at: '2024-11-15T14:30:00Z',
      ip_address: '192.168.1.101',
      user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      legal_basis: 'consent',
      retention_period: '1 año',
      created_at: '2024-11-15T14:30:00Z',
      updated_at: '2024-11-15T14:30:00Z'
    },
    {
      id: '3',
      tenant_id: DEV_TENANT_ID,
      user_email: 'cliente3@empresa.com',
      consent_type: 'marketing',
      purpose: 'Envío de comunicaciones comerciales y promocionales',
      granted: false,
      granted_at: '2024-10-01T09:00:00Z',
      withdrawn_at: '2024-12-01T16:00:00Z',
      ip_address: '192.168.1.102',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      legal_basis: 'consent',
      retention_period: '2 años',
      created_at: '2024-10-01T09:00:00Z',
      updated_at: '2024-12-01T16:00:00Z'
    }
  ];

  // Utility functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
      case 'completed':
      case 'approved':
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'warning':
      case 'pending':
      case 'under_review':
      case 'investigating':
        return 'bg-yellow-100 text-yellow-800';
      case 'non_compliant':
      case 'rejected':
      case 'requires_action':
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
      case 'contained':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'very_high': return 'bg-red-100 text-red-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRequestTypeLabel = (type: string) => {
    const labels = {
      access: 'Acceso',
      rectification: 'Rectificación',
      erasure: 'Supresión',
      portability: 'Portabilidad',
      objection: 'Oposición'
    };
    return labels[type as keyof typeof labels] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando módulo de cumplimiento...</p>
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
            onClick={loadComplianceData}
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
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <Shield className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Cumplimiento LOPD/GDPR</h2>
            </div>
            <p className="text-green-100">
              Gestión integral de protección de datos y cumplimiento normativo
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{kpis.complianceRate.toFixed(1)}%</div>
            <div className="text-sm text-green-200">Cumplimiento Global</div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-6 gap-3 mt-6">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
            <div className="text-xl font-bold">{kpis.totalChecks}</div>
            <div className="text-xs text-green-100">Verificaciones</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-green-200">{kpis.compliantChecks}</div>
            <div className="text-xs text-green-100">Conformes</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-yellow-200">{kpis.pendingRequests}</div>
            <div className="text-xs text-green-100">Solicitudes</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-orange-200">{kpis.activeAssessments}</div>
            <div className="text-xs text-green-100">Evaluaciones</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-red-200">{kpis.openBreaches}</div>
            <div className="text-xs text-green-100">Brechas</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-blue-200">{kpis.activeConsents}</div>
            <div className="text-xs text-green-100">Consentimientos</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('resumen')}
          className={`flex-1 px-4 py-3 rounded-md font-medium transition-colors ${
            activeTab === 'resumen' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <BarChart3 className="w-5 h-5 inline mr-2" />
          Resumen
        </button>
        <button
          onClick={() => setActiveTab('verificaciones')}
          className={`flex-1 px-4 py-3 rounded-md font-medium transition-colors ${
            activeTab === 'verificaciones' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <CheckCircle className="w-5 h-5 inline mr-2" />
          Verificaciones
        </button>
        <button
          onClick={() => setActiveTab('solicitudes')}
          className={`flex-1 px-4 py-3 rounded-md font-medium transition-colors ${
            activeTab === 'solicitudes' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Mail className="w-5 h-5 inline mr-2" />
          Solicitudes
        </button>
        <button
          onClick={() => setActiveTab('evaluaciones')}
          className={`flex-1 px-4 py-3 rounded-md font-medium transition-colors ${
            activeTab === 'evaluaciones' ? 'bg-green-600 text-white' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FileText className="w-5 h-5 inline mr-2" />
          Evaluaciones
        </button>
        <button
          onClick={() => setActiveTab('brechas')}
          className={`flex-1 px-4 py-3 rounded-md font-medium transition-colors ${
            activeTab === 'brechas' ? 'bg-red-600 text-white' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <AlertTriangle className="w-5 h-5 inline mr-2" />
          Brechas
        </button>
        <button
          onClick={() => setActiveTab('consentimientos')}
          className={`flex-1 px-4 py-3 rounded-md font-medium transition-colors ${
            activeTab === 'consentimientos' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Users className="w-5 h-5 inline mr-2" />
          Consentimientos
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'resumen' && (
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cumplimiento Global</p>
                  <p className="text-2xl font-bold text-green-600">{kpis.complianceRate.toFixed(1)}%</p>
                </div>
                <Shield className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Solicitudes Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-600">{kpis.pendingRequests}</p>
                </div>
                <Mail className="w-8 h-8 text-yellow-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Brechas Abiertas</p>
                  <p className="text-2xl font-bold text-red-600">{kpis.openBreaches}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Consentimientos Activos</p>
                  <p className="text-2xl font-bold text-blue-600">{kpis.activeConsents}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Contact DPO */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contacto DPO (Delegado de Protección de Datos)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">dpo@constructia.com</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Teléfono</p>
                  <p className="font-medium text-gray-900">+34 91 000 00 00</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Globe className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">AEPD</p>
                  <p className="font-medium text-gray-900">www.aepd.es</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Verificaciones Tab */}
      {activeTab === 'verificaciones' && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Verificaciones de Cumplimiento</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Categoría</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Verificación</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Estado</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Última Verificación</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Próxima Revisión</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {complianceChecks.map((check) => (
                  <tr key={check.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">{check.category}</td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{check.check_name}</div>
                        <div className="text-sm text-gray-500">{check.description}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(check.status)}`}>
                        {check.status === 'compliant' ? 'Conforme' : 
                         check.status === 'warning' ? 'Advertencia' : 'No Conforme'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {formatDate(check.last_verified)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {formatDate(check.next_review)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Solicitudes Tab */}
      {activeTab === 'solicitudes' && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Solicitudes de Derechos</h3>
              <button
                onClick={() => setShowRequestModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nueva Solicitud
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Solicitante</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Tipo</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Estado</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Fecha Límite</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {dataRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{request.requester_name}</div>
                        <div className="text-sm text-gray-500">{request.requester_email}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {getRequestTypeLabel(request.request_type)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {request.status === 'pending' ? 'Pendiente' :
                         request.status === 'in_progress' ? 'En Progreso' :
                         request.status === 'completed' ? 'Completada' : 'Rechazada'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {formatDate(request.deadline)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {request.status === 'pending' && (
                          <button
                            onClick={() => handleUpdateRequestStatus(request.id, 'in_progress')}
                            className="text-blue-600 hover:text-blue-700 text-sm"
                          >
                            Procesar
                          </button>
                        )}
                        {request.status === 'in_progress' && (
                          <button
                            onClick={() => handleUpdateRequestStatus(request.id, 'completed')}
                            className="text-green-600 hover:text-green-700 text-sm"
                          >
                            Completar
                          </button>
                        )}
                        <button className="text-gray-400 hover:text-gray-600">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Evaluaciones Tab */}
      {activeTab === 'evaluaciones' && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Evaluaciones de Impacto en Protección de Datos</h3>
              <button
                onClick={() => setShowAssessmentModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nueva Evaluación
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Evaluación</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Nivel de Riesgo</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Estado</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Evaluador</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {assessments.map((assessment) => (
                  <tr key={assessment.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{assessment.assessment_name}</div>
                        <div className="text-sm text-gray-500">{assessment.processing_purpose}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskColor(assessment.risk_level)}`}>
                        {assessment.risk_level === 'low' ? 'Bajo' :
                         assessment.risk_level === 'medium' ? 'Medio' :
                         assessment.risk_level === 'high' ? 'Alto' : 'Muy Alto'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(assessment.status)}`}>
                        {assessment.status === 'draft' ? 'Borrador' :
                         assessment.status === 'under_review' ? 'En Revisión' :
                         assessment.status === 'approved' ? 'Aprobada' : 'Requiere Acción'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {assessment.assessor_id}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {assessment.status === 'under_review' && (
                          <button
                            onClick={() => handleUpdateAssessmentStatus(assessment.id, 'approved')}
                            className="text-green-600 hover:text-green-700 text-sm"
                          >
                            Aprobar
                          </button>
                        )}
                        <button className="text-gray-400 hover:text-gray-600">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-gray-400 hover:text-blue-600">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Brechas Tab */}
      {activeTab === 'brechas' && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Registro de Brechas de Seguridad</h3>
              <button
                onClick={() => setShowBreachModal(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Registrar Brecha
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Incidente</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Severidad</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Registros Afectados</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Estado</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Fecha Descubrimiento</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {breaches.map((breach) => (
                  <tr key={breach.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{breach.incident_title}</div>
                        <div className="text-sm text-gray-500">{breach.description}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskColor(breach.severity)}`}>
                        {breach.severity === 'low' ? 'Baja' :
                         breach.severity === 'medium' ? 'Media' :
                         breach.severity === 'high' ? 'Alta' : 'Crítica'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {breach.affected_records.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(breach.status)}`}>
                        {breach.status === 'investigating' ? 'Investigando' :
                         breach.status === 'contained' ? 'Contenida' : 'Resuelta'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {formatDate(breach.discovery_date)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {breach.status !== 'resolved' && (
                          <button
                            onClick={() => handleUpdateBreachStatus(breach.id, 'resolved')}
                            className="text-green-600 hover:text-green-700 text-sm"
                          >
                            Resolver
                          </button>
                        )}
                        <button className="text-gray-400 hover:text-gray-600">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-gray-400 hover:text-blue-600">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Consentimientos Tab */}
      {activeTab === 'consentimientos' && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Registro de Consentimientos</h3>
              <button
                onClick={() => setShowConsentModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Consentimiento
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Usuario</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Tipo</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Propósito</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Estado</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Fecha</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {consents.map((consent) => (
                  <tr key={consent.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{consent.user_email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {consent.consent_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {consent.purpose}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        consent.granted && !consent.withdrawn_at ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {consent.granted && !consent.withdrawn_at ? 'Activo' : 'Retirado'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {consent.withdrawn_at ? formatDate(consent.withdrawn_at) : formatDate(consent.granted_at || consent.created_at)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {consent.granted && !consent.withdrawn_at && (
                          <button
                            onClick={() => handleWithdrawConsent(consent.id)}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            Retirar
                          </button>
                        )}
                        <button className="text-gray-400 hover:text-gray-600">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Nueva Solicitud de Derechos</h3>
              <button
                onClick={() => setShowRequestModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Solicitud
                </label>
                <select
                  value={newRequest.request_type}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, request_type: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="access">Derecho de Acceso</option>
                  <option value="rectification">Derecho de Rectificación</option>
                  <option value="erasure">Derecho de Supresión</option>
                  <option value="portability">Derecho de Portabilidad</option>
                  <option value="objection">Derecho de Oposición</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email del Solicitante
                </label>
                <input
                  type="email"
                  value={newRequest.requester_email}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, requester_email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="usuario@ejemplo.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Solicitante
                </label>
                <input
                  type="text"
                  value={newRequest.requester_name}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, requester_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Juan Pérez"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Detalles de la Solicitud
                </label>
                <textarea
                  value={newRequest.request_details.details}
                  onChange={(e) => setNewRequest(prev => ({ 
                    ...prev, 
                    request_details: { details: e.target.value }
                  }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe los detalles de la solicitud..."
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateRequest}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Crear Solicitud
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assessment Modal */}
      {showAssessmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Nueva Evaluación de Impacto</h3>
              <button
                onClick={() => setShowAssessmentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la Evaluación
                </label>
                <input
                  type="text"
                  value={newAssessment.assessment_name}
                  onChange={(e) => setNewAssessment(prev => ({ ...prev, assessment_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Ej: Procesamiento de datos de empleados"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Propósito del Procesamiento
                </label>
                <textarea
                  value={newAssessment.processing_purpose}
                  onChange={(e) => setNewAssessment(prev => ({ ...prev, processing_purpose: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Describe el propósito del tratamiento de datos..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nivel de Riesgo
                </label>
                <select
                  value={newAssessment.risk_level}
                  onChange={(e) => setNewAssessment(prev => ({ ...prev, risk_level: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="low">Bajo</option>
                  <option value="medium">Medio</option>
                  <option value="high">Alto</option>
                  <option value="very_high">Muy Alto</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowAssessmentModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateAssessment}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Crear Evaluación
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Breach Modal */}
      {showBreachModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Registrar Brecha de Seguridad</h3>
              <button
                onClick={() => setShowBreachModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título del Incidente
                </label>
                <input
                  type="text"
                  value={newBreach.incident_title}
                  onChange={(e) => setNewBreach(prev => ({ ...prev, incident_title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder="Ej: Acceso no autorizado a base de datos"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={newBreach.description}
                  onChange={(e) => setNewBreach(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder="Describe los detalles del incidente..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Severidad
                  </label>
                  <select
                    value={newBreach.severity}
                    onChange={(e) => setNewBreach(prev => ({ ...prev, severity: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  >
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                    <option value="critical">Crítica</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Registros Afectados
                  </label>
                  <input
                    type="number"
                    value={newBreach.affected_records}
                    onChange={(e) => setNewBreach(prev => ({ ...prev, affected_records: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowBreachModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateBreach}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Registrar Brecha
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Consent Modal */}
      {showConsentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Nuevo Consentimiento</h3>
              <button
                onClick={() => setShowConsentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email del Usuario
                </label>
                <input
                  type="email"
                  value={newConsent.user_email}
                  onChange={(e) => setNewConsent(prev => ({ ...prev, user_email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="usuario@ejemplo.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Consentimiento
                </label>
                <select
                  value={newConsent.consent_type}
                  onChange={(e) => setNewConsent(prev => ({ ...prev, consent_type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="marketing">Marketing</option>
                  <option value="analytics">Analíticas</option>
                  <option value="cookies">Cookies</option>
                  <option value="newsletter">Newsletter</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Propósito
                </label>
                <textarea
                  value={newConsent.purpose}
                  onChange={(e) => setNewConsent(prev => ({ ...prev, purpose: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe el propósito del consentimiento..."
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={newConsent.granted}
                  onChange={(e) => setNewConsent(prev => ({ ...prev, granted: e.target.checked }))}
                  className="rounded text-blue-600"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Consentimiento otorgado
                </label>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowConsentModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateConsent}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Registrar Consentimiento
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}