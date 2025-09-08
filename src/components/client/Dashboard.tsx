import React from 'react';
import { 
  Building2, 
  FileText, 
  BarChart3, 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Upload,
  FolderOpen,
  Settings,
  CreditCard,
  Activity,
  Target,
  Award,
  Zap,
  Shield,
  Database,
  Globe,
  RefreshCw
} from 'lucide-react';
import { useClientData } from '../../hooks/useClientData';

export default function ClientDashboard() {
  const { client, empresas, obras, documentos, stats, loading, error, refreshData } = useClientData();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard del cliente...</p>
          <p className="text-sm text-gray-500 mt-2">Acceso aislado por tenant</p>
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
            onClick={refreshData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acceso No Autorizado</h2>
          <p className="text-gray-600">No se encontraron datos del cliente</p>
        </div>
      </div>
    );
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStoragePercentage = () => {
    if (!client || client.storage_limit === 0) return 0;
    return Math.round((client.storage_used / client.storage_limit) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Bienvenido, {client.name}
            </h1>
            <p className="text-green-100 mb-4">
              Panel de gestión documental para {client.company_name}
            </p>
            <div className="space-y-1 text-sm text-green-100">
              <p>• 🔒 Acceso aislado por tenant: {client.tenant_id.substring(0, 8)}...</p>
              <p>• 👤 Rol: {client.role}</p>
              <p>• 📧 Email: {client.email}</p>
              <p>• 📊 Plan: {client.subscription_plan}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{stats.totalDocuments}</div>
            <div className="text-sm text-blue-200">Documentos</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border">
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

        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FolderOpen className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Proyectos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProjects}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Documentos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalDocuments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border">
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
      <div className="bg-white rounded-lg shadow-sm p-6 border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Uso de Almacenamiento</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              {formatBytes(client.storage_used)} de {formatBytes(client.storage_limit)} utilizados
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
      <div className="bg-white rounded-lg shadow-sm p-6 border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Upload className="w-8 h-8 text-green-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Subir Documentos</p>
              <p className="text-sm text-gray-600">Añadir nuevos documentos</p>
            </div>
          </button>

          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <BarChart3 className="w-8 h-8 text-blue-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Ver Métricas</p>
              <p className="text-sm text-gray-600">Analizar rendimiento</p>
            </div>
          </button>

          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Settings className="w-8 h-8 text-purple-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Configuración</p>
              <p className="text-sm text-gray-600">Ajustar preferencias</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm p-6 border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Actividad Reciente</h3>
          <button
            onClick={refreshData}
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
              <p className="font-medium text-gray-900">Acceso seguro al tenant</p>
              <p className="text-sm text-gray-500">Datos aislados cargados correctamente - hace 1 min</p>
            </div>
          </div>
          
          <div className="flex items-center p-3 bg-blue-50 rounded-lg">
            <FileText className="w-5 h-5 text-blue-500 mr-3" />
            <div>
              <p className="font-medium text-gray-900">
                {stats.totalDocuments} documentos en tu tenant
              </p>
              <p className="text-sm text-gray-500">Gestión documental activa - hace 5 min</p>
            </div>
          </div>
          
          <div className="flex items-center p-3 bg-purple-50 rounded-lg">
            <Building2 className="w-5 h-5 text-purple-500 mr-3" />
            <div>
              <p className="font-medium text-gray-900">
                {stats.totalCompanies} empresas registradas
              </p>
              <p className="text-sm text-gray-500">Gestión de empresas - hace 10 min</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tenant Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <Shield className="w-5 h-5 text-blue-600 mr-3" />
          <div>
            <h4 className="font-semibold text-blue-800">Acceso Aislado por Tenant</h4>
            <p className="text-sm text-blue-700">
              Estás viendo únicamente los datos de tu tenant. Acceso completamente aislado y seguro.
            </p>
            <div className="mt-2 text-xs text-blue-600">
              Tenant ID: {client.tenant_id} • Rol: {client.role} • Plan: {client.subscription_plan}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}