import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  getCurrentClientData, 
  getClientProjects, 
  getClientCompanies, 
  getClientDocuments 
} from '../../lib/supabase';
import { 
  Building2, 
  FileText, 
  FolderOpen, 
  TrendingUp, 
  Users, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react';

interface ClientData {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  subscription_plan: string;
  subscription_status: string;
  storage_used: number;
  storage_limit: number;
  documents_processed: number;
  tokens_available: number;
}

interface Project {
  id: string;
  name: string;
  status: string;
  progress: number;
  companies: { name: string };
  documents: { count: number }[];
}

interface Company {
  id: string;
  name: string;
  cif: string;
  projects: { count: number }[];
  documents: { count: number }[];
}

interface Document {
  id: string;
  filename: string;
  upload_status: string;
  obralia_status: string;
  created_at: string;
  projects: { name: string };
  companies: { name: string };
}

const ClientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener datos del cliente
      const client = await getCurrentClientData(user!.id);
      setClientData(client);

      // Obtener proyectos, empresas y documentos
      const [projectsData, companiesData, documentsData] = await Promise.all([
        getClientProjects(client.id),
        getClientCompanies(client.id),
        getClientDocuments(client.id)
      ]);

      setProjects(projectsData || []);
      setCompanies(companiesData || []);
      setDocuments(documentsData || []);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatStorageSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const getStoragePercentage = () => {
    if (!clientData) return 0;
    return (clientData.storage_used / clientData.storage_limit) * 100;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
      case 'safe':
        return 'text-green-600 bg-green-100';
      case 'pending':
      case 'processing':
        return 'text-yellow-600 bg-yellow-100';
      case 'error':
      case 'cancelled':
      case 'threat_detected':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Bienvenido, {clientData?.contact_name}
        </h1>
        <p className="text-gray-600">{clientData?.company_name}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Empresas</p>
              <p className="text-2xl font-bold text-gray-900">{companies.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FolderOpen className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Proyectos</p>
              <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Documentos</p>
              <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tokens</p>
              <p className="text-2xl font-bold text-gray-900">{clientData?.tokens_available || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Storage Usage */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Uso de Almacenamiento</h2>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              {formatStorageSize(clientData?.storage_used || 0)} de {formatStorageSize(clientData?.storage_limit || 0)}
            </span>
            <span className="text-gray-600">{getStoragePercentage().toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(getStoragePercentage(), 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Proyectos Recientes</h2>
          <div className="space-y-3">
            {projects.slice(0, 5).map((project) => (
              <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{project.name}</p>
                  <p className="text-sm text-gray-600">{project.companies?.name}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                  <p className="text-sm text-gray-600 mt-1">{project.progress}%</p>
                </div>
              </div>
            ))}
            {projects.length === 0 && (
              <p className="text-gray-500 text-center py-4">No hay proyectos aún</p>
            )}
          </div>
        </div>

        {/* Recent Documents */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Documentos Recientes</h2>
          <div className="space-y-3">
            {documents.slice(0, 5).map((document) => (
              <div key={document.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{document.filename}</p>
                  <p className="text-sm text-gray-600">{document.projects?.name}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(document.upload_status)}`}>
                    {document.upload_status}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(document.created_at).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>
            ))}
            {documents.length === 0 && (
              <p className="text-gray-500 text-center py-4">No hay documentos aún</p>
            )}
          </div>
        </div>
      </div>

      {/* Subscription Info */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Información de Suscripción</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Plan Actual</p>
            <p className="text-lg font-semibold text-gray-900 capitalize">
              {clientData?.subscription_plan}
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Estado</p>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getStatusColor(clientData?.subscription_status || '')}`}>
              {clientData?.subscription_status}
            </span>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Documentos Procesados</p>
            <p className="text-lg font-semibold text-gray-900">
              {clientData?.documents_processed || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;