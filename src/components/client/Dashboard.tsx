import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, FileText, TrendingUp, Users, AlertCircle, CheckCircle, Clock, DollarSign, RefreshCw } from 'lucide-react';
import { supabase, supabaseServiceClient, DEV_TENANT_ID } from '../../lib/supabase';
import { getTenantStats, getTenantEmpresas, getTenantObras, getAllTenantDocumentsNoRLS } from '../../lib/supabase-real';

interface DashboardStats {
  totalProjects: number;
  totalCompanies: number;
  totalDocuments: number;
  documentsProcessed: number;
  storageUsed: number;
  storageLimit: number;
}

export default function ClientDashboard() {
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
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Usuario no autenticado');
      }
      
      // Get client data for this specific user
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (clientError || !clientData) {
        console.warn('No client data found, using tenant data directly');
        
        // Use tenant data directly from new architecture
        const tenantId = DEV_TENANT_ID;
        const [tenantStats, empresas, obras, documentos] = await Promise.all([
          getTenantStats(tenantId),
          getTenantEmpresas(tenantId),
          getTenantObras(tenantId),
          getAllTenantDocumentsNoRLS(tenantId)
        ]);
        
        // Set mock client data for display
        setClientData({
          company_name: 'Construcciones García S.L.',
          contact_name: 'Juan García',
          client_id: 'CLI-DD0355EF',
          subscription_plan: 'professional',
          subscription_status: 'active',
          storage_used: documentos.reduce((sum, doc) => sum + (doc.size_bytes || 0), 0),
          storage_limit: 1073741824 // 1GB for professional plan
        });
        
        // Calculate real stats from tenant data
        const newStats = {
          totalProjects: tenantStats.totalObras,
          totalCompanies: tenantStats.totalEmpresas,
          totalDocuments: tenantStats.totalDocumentos,
          documentsProcessed: tenantStats.documentosAprobados,
          storageUsed: documentos.reduce((sum, doc) => sum + (doc.size_bytes || 0), 0),
          storageLimit: 1073741824
        };
        
        setStats(newStats);
        
        console.log('✅ Dashboard data loaded from tenant:', {
          empresas: tenantStats.totalEmpresas,
          obras: tenantStats.totalObras,
          documentos: tenantStats.totalDocumentos,
          documentosAprobados: tenantStats.documentosAprobados
        });
        
        return;
      }
      
      setClientData(clientData);

      // Get ONLY data for this specific client
      const [
        projectsResponse,
        companiesResponse,
        documentsResponse
      ] = await Promise.all([
        supabase.from('projects').select('*').eq('client_id', clientData.id),
        supabase.from('companies').select('*').eq('client_id', clientData.id),
        supabase.from('documents').select('*').eq('client_id', clientData.id)
      ]);

      const projects = projectsResponse.data || [];
      const companies = companiesResponse.data || [];
      const documents = documentsResponse.data || [];

      if (projectsResponse.error) console.warn('Error loading projects:', projectsResponse.error);
      if (companiesResponse.error) console.warn('Error loading companies:', companiesResponse.error);
      if (documentsResponse.error) console.warn('Error loading documents:', documentsResponse.error);

      const newStats = {
        totalProjects: projects.length,
        totalCompanies: companies.length,
        totalDocuments: documents.length,
        documentsProcessed: documents.filter(d => d.upload_status === 'completed').length,
        storageUsed: clientData.storage_used || 0,
        storageLimit: clientData.storage_limit || 1073741824
      };

      setStats(newStats);
      
      console.log('✅ Dashboard data loaded:', {
        client: clientData.company_name,
        projects: projects.length,
        companies: companies.length,
        documents: documents.length
      });
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Error loading dashboard data');
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
    if (stats.storageLimit === 0) return 0;
    return Math.round((stats.storageUsed / stats.storageLimit) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error de Conexión</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
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
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Bienvenido, {clientData?.contact_name || 'Usuario'}
        </h1>
        <p className="text-gray-600">
          {clientData?.company_name || 'Empresa'} • Plan {clientData?.subscription_plan || 'básico'}
        </p>
        <div className="mt-3 flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span className="text-sm text-green-600">Conectado a base de datos</span>
          <span className="text-sm text-gray-500">• ID: {clientData?.client_id}</span>
        </div>
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
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Actividad Reciente</h3>
          <button
            onClick={loadDashboardData}
            className="flex items-center text-blue-600 hover:text-blue-700 text-sm"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Actualizar
          </button>
        </div>
        <div className="space-y-3">
          <div className="flex items-center p-3 bg-green-50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Base de datos conectada</p>
              <p className="text-sm text-gray-500">Datos cargados desde Supabase - hace 1 min</p>
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