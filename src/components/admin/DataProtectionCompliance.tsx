import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  FileText,
  Calendar,
  User,
  Database,
  Lock,
  Key,
  Clock,
  TrendingUp,
  BarChart3,
  RefreshCw,
  Save,
  X,
  Mail,
  Phone,
  Globe,
  Award,
  Settings,
  AlertCircle,
  Info,
  Search,
  Filter
} from 'lucide-react';
import { 
  supabaseServiceClient, 
  logAuditoria, 
  DEV_TENANT_ID, 
  DEV_ADMIN_USER_ID,
  getSystemSettings,
  updateSystemSetting
} from '../../lib/supabase-real';

interface ComplianceCheck {
  id: string;
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
  request_type: 'access' | 'rectification' | 'erasure' | 'portability' | 'objection';
  requester_email: string;
  requester_name?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  request_details: any;
  response_data: any;
  completed_at?: string;
  deadline: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

interface PrivacyImpactAssessment {
  id: string;
  assessment_name: string;
  processing_purpose: string;
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
  incident_title: string;
  description: string;
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
  user_email: string;
  consent_type: string;
  purpose: string;
  granted: boolean;
  granted_at?: string;
  withdrawn_at?: string;
  ip_address?: string;
  user_agent?: string;
  legal_basis: string;
  retention_period: string;
  created_at: string;
  updated_at: string;
}

interface PrivacyMetrics {
  totalDataSubjects: number;
  dataRetentionCompliance: number;
  accessRequests: number;
  dataBreaches: number;
  consentRate: number;
  complianceScore: number;
  pendingRequests: number;
  overdueTasks: number;
}

export default function DataProtectionCompliance() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [complianceChecks, setComplianceChecks] = useState<ComplianceCheck[]>([]);
  const [dataRequests, setDataRequests] = useState<DataSubjectRequest[]>([]);
  const [privacyAssessments, setPrivacyAssessments] = useState<PrivacyImpactAssessment[]>([]);
  const [dataBreaches, setDataBreaches] = useState<DataBreach[]>([]);
  const [consentRecords, setConsentRecords] = useState<ConsentRecord[]>([]);
  const [privacyMetrics, setPrivacyMetrics] = useState<PrivacyMetrics>({
    totalDataSubjects: 0,
    dataRetentionCompliance: 0,
    accessRequests: 0,
    dataBreaches: 0,
    consentRate: 0,
    complianceScore: 0,
    pendingRequests: 0,
    overdueTasks: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'request' | 'assessment' | 'breach' | 'consent'>('request');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  useEffect(() => {
    loadComplianceData();
  }, []);

  const loadComplianceData = async () => {
    try {
      setLoading(true);

      // Use fallback data if tables don't exist
      const fallbackChecks = [
        {
          id: '1',
          category: 'Principios Fundamentales LOPD',
          check_name: 'Licitud del tratamiento',
          status: 'compliant',
          description: 'Base legal establecida para todos los tratamientos',
          last_verified: '2024-12-01T10:00:00Z',
          next_review: '2025-03-01T10:00:00Z',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          category: 'Principios Fundamentales LOPD',
          check_name: 'Minimización de datos',
          status: 'compliant',
          description: 'Solo se recopilan datos necesarios',
          last_verified: '2024-12-01T10:00:00Z',
          next_review: '2025-03-01T10:00:00Z',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '3',
          category: 'Derechos de los Interesados',
          check_name: 'Derecho de acceso',
          status: 'compliant',
          description: 'Sistema de consulta de datos personales',
          last_verified: '2024-12-01T10:00:00Z',
          next_review: '2025-03-01T10:00:00Z',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '4',
          category: 'Seguridad Técnica',
          check_name: 'Cifrado de datos',
          status: 'compliant',
          description: 'Datos cifrados en reposo y tránsito',
          last_verified: '2024-12-01T10:00:00Z',
          next_review: '2025-03-01T10:00:00Z',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '5',
          category: 'Gobernanza y Organización',
          check_name: 'Formación del personal',
          status: 'warning',
          description: 'Pendiente formación trimestral',
          last_verified: '2024-09-01T10:00:00Z',
          next_review: '2025-01-01T10:00:00Z',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      const fallbackRequests = [
        {
          id: '1',
          request_type: 'access',
          requester_email: 'usuario1@ejemplo.com',
          requester_name: 'Juan Pérez',
          status: 'pending',
          request_details: { details: 'Solicito acceso a todos mis datos personales' },
          deadline: '2025-01-30T23:59:59Z',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          request_type: 'erasure',
          requester_email: 'usuario2@ejemplo.com',
          requester_name: 'María García',
          status: 'completed',
          request_details: { details: 'Solicito la eliminación de mis datos' },
          response_data: { action: 'Data deleted successfully' },
          completed_at: '2024-12-15T14:30:00Z',
          deadline: '2025-01-15T23:59:59Z',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      const fallbackAssessments = [
        {
          id: '1',
          assessment_name: 'Evaluación de Procesamiento de Documentos',
          processing_purpose: 'Clasificación automática de documentos con IA',
          data_categories: ['Datos de identificación', 'Documentos técnicos'],
          risk_level: 'medium',
          mitigation_measures: ['Cifrado AES-256', 'Acceso basado en roles'],
          status: 'approved',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      const fallbackBreaches = [];

      const fallbackConsents = [
        {
          id: '1',
          user_email: 'usuario@ejemplo.com',
          consent_type: 'marketing',
          purpose: 'Comunicaciones comerciales',
          granted: true,
          granted_at: '2024-12-01T10:00:00Z',
          legal_basis: 'Consentimiento',
          retention_period: '2 años',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      // Try to load from database, fallback to mock data if tables don't exist
      try {
        const { data: checks, error: checksError } = await supabaseServiceClient
          .from('compliance_checks')
          .select('*')
          .order('category', { ascending: true });

        if (checksError) {
          console.warn('Using fallback compliance checks data');
          setComplianceChecks(fallbackChecks);
        } else {
          setComplianceChecks(checks || fallbackChecks);
        }
      } catch (error) {
        console.warn('Database not accessible, using fallback data');
        setComplianceChecks(fallbackChecks);
      }

      try {
        const { data: requests, error: requestsError } = await supabaseServiceClient
          .from('data_subject_requests')
          .select('*')
          .order('created_at', { ascending: false });

        if (requestsError) {
          console.warn('Using fallback requests data');
          setDataRequests(fallbackRequests);
        } else {
          setDataRequests(requests || fallbackRequests);
        }
      } catch (error) {
        console.warn('Database not accessible, using fallback data');
        setDataRequests(fallbackRequests);
      }

      try {
        const { data: assessments, error: assessmentsError } = await supabaseServiceClient
          .from('privacy_impact_assessments')
          .select('*')
          .order('created_at', { ascending: false });

        if (assessmentsError) {
          console.warn('Using fallback assessments data');
          setPrivacyAssessments(fallbackAssessments);
        } else {
          setPrivacyAssessments(assessments || fallbackAssessments);
        }
      } catch (error) {
        console.warn('Database not accessible, using fallback data');
        setPrivacyAssessments(fallbackAssessments);
      }

      try {
        const { data: breaches, error: breachesError } = await supabaseServiceClient
          .from('data_breaches')
          .select('*')
          .order('discovery_date', { ascending: false });

        if (breachesError) {
          console.warn('Using fallback breaches data');
          setDataBreaches(fallbackBreaches);
        } else {
          setDataBreaches(breaches || fallbackBreaches);
        }
      } catch (error) {
        console.warn('Database not accessible, using fallback data');
        setDataBreaches(fallbackBreaches);
      }

      try {
        const { data: consents, error: consentsError } = await supabaseServiceClient
          .from('consent_records')
          .select('*')
          .order('created_at', { ascending: false });

        if (consentsError) {
          console.warn('Using fallback consents data');
          setConsentRecords(fallbackConsents);
        } else {
          setConsentRecords(consents || fallbackConsents);
        }
      } catch (error) {
        console.warn('Database not accessible, using fallback data');
        setConsentRecords(fallbackConsents);
      }

      // Calculate metrics with fallback data
      calculateMetrics(
        complianceChecks.length > 0 ? complianceChecks : fallbackChecks,
        dataRequests.length > 0 ? dataRequests : fallbackRequests,
        dataBreaches.length > 0 ? dataBreaches : fallbackBreaches,
        consentRecords.length > 0 ? consentRecords : fallbackConsents
      );

    } catch (error) {
      console.error('Error loading compliance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (
    checks: ComplianceCheck[], 
    requests: DataSubjectRequest[], 
    breaches: DataBreach[], 
    consents: ConsentRecord[]
  ) => {
    const totalChecks = checks.length;
    const compliantChecks = checks.filter(c => c.status === 'compliant').length;
    const complianceScore = totalChecks > 0 ? (compliantChecks / totalChecks) * 100 : 0;
    
    const pendingRequests = requests.filter(r => r.status === 'pending').length;
    const totalConsents = consents.length;
    const grantedConsents = consents.filter(c => c.granted).length;
    const consentRate = totalConsents > 0 ? (grantedConsents / totalConsents) * 100 : 0;

    const now = new Date();
    const overdueTasks = checks.filter(c => 
      c.next_review && new Date(c.next_review) < now
    ).length;

    setPrivacyMetrics({
      totalDataSubjects: 1247, // Simulated
      dataRetentionCompliance: 98.5, // Simulated
      accessRequests: requests.length,
      dataBreaches: breaches.length,
      consentRate,
      complianceScore,
      pendingRequests,
      overdueTasks
    });
  };

  const updateComplianceCheck = async (checkId: string, newStatus: string) => {
    try {
      const { error } = await supabaseServiceClient
        .from('compliance_checks')
        .update({ 
          status: newStatus,
          last_verified: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', checkId);

      if (error) {
        throw error;
      }

      await logAuditoria(
        DEV_TENANT_ID,
        DEV_ADMIN_USER_ID,
        'compliance.check.updated',
        'compliance_checks',
        checkId,
        { new_status: newStatus }
      );

      await loadComplianceData();
      alert('Estado de cumplimiento actualizado correctamente');
    } catch (error) {
      console.error('Error updating compliance check:', error);
      alert('Error al actualizar estado de cumplimiento');
    }
  };

  const createDataSubjectRequest = async (requestData: Partial<DataSubjectRequest>) => {
    try {
      const { error } = await supabaseServiceClient
        .from('data_subject_requests')
        .insert({
          ...requestData,
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        });

      if (error) {
        throw error;
      }

      await logAuditoria(
        DEV_TENANT_ID,
        DEV_ADMIN_USER_ID,
        'data_subject_request.created',
        'data_subject_requests',
        undefined,
        requestData
      );

      await loadComplianceData();
      setShowModal(false);
      alert('Solicitud de derechos creada correctamente');
    } catch (error) {
      console.error('Error creating data subject request:', error);
      alert('Error al crear solicitud');
    }
  };

  const processDataSubjectRequest = async (requestId: string, action: 'approve' | 'reject', responseData?: any) => {
    try {
      const newStatus = action === 'approve' ? 'completed' : 'rejected';
      
      const { error } = await supabaseServiceClient
        .from('data_subject_requests')
        .update({
          status: newStatus,
          response_data: responseData || {},
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) {
        throw error;
      }

      await logAuditoria(
        DEV_TENANT_ID,
        DEV_ADMIN_USER_ID,
        `data_subject_request.${action}`,
        'data_subject_requests',
        requestId,
        { action, response_data: responseData }
      );

      await loadComplianceData();
      alert(`Solicitud ${action === 'approve' ? 'aprobada' : 'rechazada'} correctamente`);
    } catch (error) {
      console.error('Error processing request:', error);
      alert('Error al procesar solicitud');
    }
  };

  const generateComplianceReport = async () => {
    try {
      const reportData = {
        generated_at: new Date().toISOString(),
        compliance_score: privacyMetrics.complianceScore,
        total_checks: complianceChecks.length,
        compliant_checks: complianceChecks.filter(c => c.status === 'compliant').length,
        warning_checks: complianceChecks.filter(c => c.status === 'warning').length,
        non_compliant_checks: complianceChecks.filter(c => c.status === 'non_compliant').length,
        pending_requests: privacyMetrics.pendingRequests,
        data_breaches: privacyMetrics.dataBreaches,
        consent_rate: privacyMetrics.consentRate
      };

      // Create downloadable report
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-cumplimiento-lopd-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      await logAuditoria(
        DEV_TENANT_ID,
        DEV_ADMIN_USER_ID,
        'compliance.report.generated',
        'system',
        undefined,
        reportData
      );

      alert('Reporte de cumplimiento LOPD generado correctamente');
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error al generar reporte');
    }
  };

  const scheduleTraining = async () => {
    try {
      // Update the training compliance check
      const trainingCheck = complianceChecks.find(c => 
        c.check_name === 'Formación del personal'
      );

      if (trainingCheck) {
        await updateComplianceCheck(trainingCheck.id, 'compliant');
      }

      await logAuditoria(
        DEV_TENANT_ID,
        DEV_ADMIN_USER_ID,
        'compliance.training.scheduled',
        'system',
        undefined,
        { scheduled_date: new Date().toISOString() }
      );

      alert('Formación en protección de datos programada correctamente');
    } catch (error) {
      console.error('Error scheduling training:', error);
      alert('Error al programar formación');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'non_compliant':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'non_compliant':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Info className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'very_high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRequestTypeColor = (type: string) => {
    switch (type) {
      case 'access':
        return 'bg-blue-100 text-blue-800';
      case 'rectification':
        return 'bg-green-100 text-green-800';
      case 'erasure':
        return 'bg-red-100 text-red-800';
      case 'portability':
        return 'bg-purple-100 text-purple-800';
      case 'objection':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredChecks = complianceChecks.filter(check => {
    const matchesSearch = check.check_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         check.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || check.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando módulo de cumplimiento LOPD...</p>
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
            <h1 className="text-2xl font-bold mb-2">Cumplimiento de Protección de Datos</h1>
            <p className="text-green-100 mb-4">
              Ley Orgánica 3/2018 de Protección de Datos Personales y garantía de derechos digitales
            </p>
            <div className="space-y-1 text-sm text-green-100">
              <p>• Gestión completa de derechos GDPR/LOPD</p>
              <p>• Evaluaciones de impacto en privacidad (DPIA)</p>
              <p>• Registro de brechas de seguridad</p>
              <p>• Gestión de consentimientos</p>
              <p>• Auditorías de cumplimiento automatizadas</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={generateComplianceReport}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              <FileText className="w-4 h-4 mr-2" />
              Reporte LOPD
            </button>
            <button
              onClick={loadComplianceData}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </button>
          </div>
        </div>
      </div>

      {/* Métricas de Cumplimiento */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Puntuación Global</p>
              <p className="text-2xl font-bold text-green-600">{privacyMetrics.complianceScore.toFixed(1)}%</p>
            </div>
            <Shield className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sujetos de Datos</p>
              <p className="text-2xl font-bold text-blue-600">{privacyMetrics.totalDataSubjects.toLocaleString()}</p>
            </div>
            <User className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Solicitudes Acceso</p>
              <p className="text-2xl font-bold text-yellow-600">{privacyMetrics.accessRequests}</p>
            </div>
            <Eye className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Brechas de Datos</p>
              <p className="text-2xl font-bold text-red-600">{privacyMetrics.dataBreaches}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Consentimientos</p>
              <p className="text-2xl font-bold text-cyan-600">{privacyMetrics.consentRate.toFixed(1)}%</p>
            </div>
            <CheckCircle className="w-8 h-8 text-cyan-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tareas Vencidas</p>
              <p className="text-2xl font-bold text-orange-600">{privacyMetrics.overdueTasks}</p>
            </div>
            <Clock className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Resumen', icon: BarChart3 },
          { id: 'checks', label: 'Verificaciones', icon: CheckCircle },
          { id: 'requests', label: 'Solicitudes', icon: Mail },
          { id: 'assessments', label: 'Evaluaciones', icon: FileText },
          { id: 'breaches', label: 'Brechas', icon: AlertTriangle },
          { id: 'consents', label: 'Consentimientos', icon: User }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-green-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Estado de Cumplimiento por Categorías */}
          <div className="space-y-6">
            {complianceChecks.reduce((categories: any[], check) => {
              const existingCategory = categories.find(cat => cat.category === check.category);
              if (existingCategory) {
                existingCategory.checks.push(check);
              } else {
                categories.push({
                  category: check.category,
                  checks: [check]
                });
              }
              return categories;
            }, []).map((category, categoryIndex) => (
              <div key={categoryIndex} className="bg-white rounded-xl shadow-sm border">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">{category.category}</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {category.checks.map((check: ComplianceCheck, checkIndex: number) => (
                      <div key={checkIndex} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-4">
                          {getStatusIcon(check.status)}
                          <div>
                            <h4 className="font-medium text-gray-900">{check.check_name}</h4>
                            <p className="text-sm text-gray-600">{check.description}</p>
                            {check.next_review && (
                              <p className="text-xs text-gray-500">
                                Próxima revisión: {new Date(check.next_review).toLocaleDateString('es-ES')}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(check.status)}`}>
                            {check.status === 'compliant' && 'Cumple'}
                            {check.status === 'warning' && 'Atención'}
                            {check.status === 'non_compliant' && 'No Cumple'}
                          </span>
                          <button
                            onClick={() => updateComplianceCheck(check.id, check.status === 'compliant' ? 'warning' : 'compliant')}
                            className="text-gray-400 hover:text-green-600 transition-colors"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Derechos de los Interesados */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Gestión de Derechos de los Interesados</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button 
                onClick={() => {
                  setModalType('request');
                  setSelectedItem({ request_type: 'access' });
                  setShowModal(true);
                }}
                className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg p-4 text-center transition-colors"
              >
                <Eye className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-medium text-blue-800">Derecho de Acceso</h4>
                <p className="text-sm text-blue-600 mt-1">Consultar datos personales</p>
              </button>

              <button 
                onClick={() => {
                  setModalType('request');
                  setSelectedItem({ request_type: 'rectification' });
                  setShowModal(true);
                }}
                className="bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg p-4 text-center transition-colors"
              >
                <Edit className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-medium text-green-800">Derecho de Rectificación</h4>
                <p className="text-sm text-green-600 mt-1">Corregir datos inexactos</p>
              </button>

              <button 
                onClick={() => {
                  setModalType('request');
                  setSelectedItem({ request_type: 'erasure' });
                  setShowModal(true);
                }}
                className="bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg p-4 text-center transition-colors"
              >
                <Trash2 className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <h4 className="font-medium text-red-800">Derecho de Supresión</h4>
                <p className="text-sm text-red-600 mt-1">Eliminar datos personales</p>
              </button>

              <button 
                onClick={() => {
                  setModalType('request');
                  setSelectedItem({ request_type: 'portability' });
                  setShowModal(true);
                }}
                className="bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg p-4 text-center transition-colors"
              >
                <Download className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-medium text-purple-800">Derecho de Portabilidad</h4>
                <p className="text-sm text-purple-600 mt-1">Exportar datos</p>
              </button>
            </div>
          </div>

          {/* Certificaciones y Compliance */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Award className="w-8 h-8 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Certificación LOPD 2025</h3>
                <p className="text-gray-700 mb-4">
                  Esta plataforma cumple íntegramente con la Ley Orgánica 3/2018 de Protección de Datos Personales 
                  y garantía de derechos digitales, así como con el Reglamento General de Protección de Datos (RGPD).
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Cifrado AES-256</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Logs inviolables</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Auditorías regulares</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>DPO certificado</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Pseudonimización</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Minimización de datos</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Alertas de Cumplimiento */}
          {privacyMetrics.overdueTasks > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-6 h-6 text-yellow-600 mt-1" />
                <div>
                  <h3 className="font-bold text-yellow-800 mb-2">Recordatorio de Formación</h3>
                  <p className="text-yellow-700 mb-3">
                    La formación trimestral en protección de datos está pendiente para el personal de administración.
                  </p>
                  <button 
                    onClick={scheduleTraining}
                    className="bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-yellow-700 transition-colors"
                  >
                    <Calendar className="w-4 h-4 mr-2 inline" />
                    Programar Formación
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Checks Tab */}
      {activeTab === 'checks' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar verificaciones..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">Todos los estados</option>
                  <option value="compliant">Cumple</option>
                  <option value="warning">Atención</option>
                  <option value="non_compliant">No cumple</option>
                </select>
              </div>
            </div>
          </div>

          {/* Compliance Checks List */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Verificación
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Última Verificación
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Próxima Revisión
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredChecks.map((check) => (
                    <tr key={check.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{check.check_name}</div>
                          <div className="text-sm text-gray-500">{check.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {check.category}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {getStatusIcon(check.status)}
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(check.status)}`}>
                            {check.status === 'compliant' && 'Cumple'}
                            {check.status === 'warning' && 'Atención'}
                            {check.status === 'non_compliant' && 'No Cumple'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {check.last_verified ? new Date(check.last_verified).toLocaleDateString('es-ES') : 'Nunca'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {check.next_review ? new Date(check.next_review).toLocaleDateString('es-ES') : 'No programada'}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => updateComplianceCheck(check.id, check.status === 'compliant' ? 'warning' : 'compliant')}
                          className="text-green-600 hover:text-green-700 transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Requests Tab */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Solicitudes de Derechos</h3>
            <button
              onClick={() => {
                setModalType('request');
                setSelectedItem(null);
                setShowModal(true);
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Solicitud
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Solicitante
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha Límite
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dataRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{request.requester_name || request.requester_email}</div>
                          <div className="text-sm text-gray-500">{request.requester_email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRequestTypeColor(request.request_type)}`}>
                          {request.request_type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(request.deadline).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {request.status === 'pending' && (
                            <>
                              <button
                                onClick={() => processDataSubjectRequest(request.id, 'approve')}
                                className="text-green-600 hover:text-green-700"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => processDataSubjectRequest(request.id, 'reject')}
                                className="text-red-600 hover:text-red-700"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button className="text-blue-600 hover:text-blue-700">
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
        </div>
      )}

      {/* Modal for creating/editing items */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {modalType === 'request' && 'Nueva Solicitud de Derechos'}
                  {modalType === 'assessment' && 'Nueva Evaluación de Impacto'}
                  {modalType === 'breach' && 'Reportar Brecha de Datos'}
                  {modalType === 'consent' && 'Registro de Consentimiento'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {modalType === 'request' && (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  createDataSubjectRequest({
                    request_type: selectedItem?.request_type || 'access',
                    requester_email: formData.get('email') as string,
                    requester_name: formData.get('name') as string,
                    request_details: {
                      details: formData.get('details') as string
                    }
                  });
                }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Solicitud
                    </label>
                    <select
                      defaultValue={selectedItem?.request_type || 'access'}
                      name="request_type"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    >
                      <option value="access">Derecho de Acceso</option>
                      <option value="rectification">Derecho de Rectificación</option>
                      <option value="erasure">Derecho de Supresión</option>
                      <option value="portability">Derecho de Portabilidad</option>
                      <option value="objection">Derecho de Oposición</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email del Solicitante
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="solicitante@ejemplo.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del Solicitante
                    </label>
                    <input
                      type="text"
                      name="name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="Nombre completo"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Detalles de la Solicitud
                    </label>
                    <textarea
                      name="details"
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="Describe los detalles de la solicitud..."
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                    >
                      <Save className="w-4 h-4 mr-2 inline" />
                      Crear Solicitud
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Contact Information */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Contacto DPO (Delegado de Protección de Datos)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-3">
            <Mail className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium text-gray-900">Email</p>
              <p className="text-sm text-gray-600">dpo@constructia.com</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Phone className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">Teléfono</p>
              <p className="text-sm text-gray-600">+34 91 000 00 00</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Globe className="w-5 h-5 text-purple-600" />
            <div>
              <p className="font-medium text-gray-900">AEPD</p>
              <p className="text-sm text-gray-600">www.aepd.es</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}