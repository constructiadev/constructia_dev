import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  FileText, 
  TrendingUp, 
  Users, 
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  RefreshCw
} from 'lucide-react';
import { 
  getCurrentClientData,
  getClientProjects,
  getClientCompanies,
  getClientDocuments
} from '../../lib/supabase';

interface DashboardStats {
  totalProjects: number;
  totalCompanies: number;
  totalDocuments: number;
  documentsProcessed: number;
  storageUsed: number;
  storageLimit: number;
}

export default function ClientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    totalCompanies: 0,
    totalDocuments: 0,
    documentsProcessed: 0,
    storageUsed: 0,
    storageLimit: 0
  });
  const [clientData, setClientData] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.id) {
        throw new Error('Usuario no autenticado');
      }

      // Get client data
      const client = await getCurrentClientData(user.id);
      if (!client) {
        setError('No se encontraron datos del cliente para este usuario');
        return;
      }

      setClientData(client);

      // Get dashboard statistics
      const [projects, companies, documents] = await Promise.all([
        getClientProjects(client.id),
        getClientCompanies(client.id),
        getClientDocuments(client.id)
      ]);

      const processedDocs = documents.filter(doc => 
        doc.upload_status === 'completed' || doc.upload_status === 'uploaded_to_obralia'
      ).length;

      setStats({
        totalProjects: projects.length,
        totalCompanies: companies.length,
        totalDocuments: documents.length,
        documentsProcessed: processedDocs,
        storageUsed: client.storage_used || 0,
        storageLimit: client.storage_limit || 524288000
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError(error instanceof Error ? error.message : 'Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStoragePercentage = () => {
    return Math.round((stats.storageUsed / stats.storageLimit) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="text-gray-600">Cargando dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {error === 'No se encontraron datos del cliente para este usuario' ? 'Perfil de Cliente Incompleto' : 'Error'}
          </h2>
          <p className="text-gray-600 mb-4">
            {error === 'No se encontraron datos del cliente para este usuario' 
              ? 'Tu perfil de cliente no está completo. Por favor, completa tu información para acceder al dashboard.'
              : error
            }
          </p>
          <div className="flex space-x-3 justify-center">
            <button
              onClick={loadDashboardData}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reintentar
            </button>
            <button
              onClick={() => navigate('/client/settings')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              {error === 'No se encontraron datos del cliente para este usuario' ? 'Completar Perfil' : 'Ir a Configuración'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Bienvenido, {clientData?.contact_name || user?.email}
        </h1>
        <p className="text-gray-600">
          {clientData?.company_name && `${clientData.company_name} • `}
          Plan {clientData?.subscription_plan || 'Básico'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Empresas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCompanies}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Proyectos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProjects}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Documentos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalDocuments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Procesados</p>
              <p className="text-2xl font-bold text-gray-900">{stats.documentsProcessed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Storage Usage */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Uso de Almacenamiento</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              {formatBytes(stats.storageUsed)} de {formatBytes(stats.storageLimit)} utilizados
            </span>
            <span className="text-gray-900 font-medium">{getStoragePercentage()}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                getStoragePercentage() > 90 ? 'bg-red-500' : 
                getStoragePercentage() > 70 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(getStoragePercentage(), 100)}%` }}
            ></div>
          </div>
          {getStoragePercentage() > 90 && (
            <div className="flex items-center text-red-600 text-sm mt-2">
              <AlertCircle className="w-4 h-4 mr-1" />
              Almacenamiento casi lleno. Considera actualizar tu plan.
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/client/upload')}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FileText className="w-8 h-8 text-green-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Subir Documentos</p>
              <p className="text-sm text-gray-600">Añadir nuevos documentos</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/client/companies')}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Building2 className="w-8 h-8 text-blue-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Gestionar Empresas</p>
              <p className="text-sm text-gray-600">Administrar empresas</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/client/metrics')}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <TrendingUp className="w-8 h-8 text-purple-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Ver Métricas</p>
              <p className="text-sm text-gray-600">Analizar rendimiento</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
        <div className="space-y-3">
          <div className="flex items-center p-3 bg-green-50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Sistema funcionando correctamente</p>
              <p className="text-sm text-gray-500">Todas las funciones operativas - hace 2 min</p>
            </div>
          </div>
          
          <div className="flex items-center p-3 bg-blue-50 rounded-lg">
            <FileText className="w-5 h-5 text-blue-500 mr-3" />
            <div>
              <p className="font-medium text-gray-900">
                {stats.totalDocuments} documentos en tu cuenta
              </p>
              <p className="text-sm text-gray-500">Gestión documental activa - hace 5 min</p>
            </div>
          </div>
          
          <div className="flex items-center p-3 bg-purple-50 rounded-lg">
            <Building2 className="w-5 h-5 text-purple-500 mr-3" />
            <div>
              <p className="font-medium text-gray-900">
                {stats.totalProjects} proyectos activos
              </p>
              <p className="text-sm text-gray-500">Gestión de proyectos - hace 10 min</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}