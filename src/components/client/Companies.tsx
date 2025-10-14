import React, { useState, useEffect } from 'react';
import { Building2, FileText, TrendingUp, Users, AlertCircle, CheckCircle, Clock, DollarSign, RefreshCw } from 'lucide-react';
import { useClientData } from '../../hooks/useClientData';
import { useClientCompanies } from '../../hooks/useClientData';
import { useSuspensionStatus } from '../../hooks/useSuspensionStatus';

export default function Companies() {
  const { companies, loading, error, refreshCompanies } = useClientCompanies();
  const { client, stats } = useClientData();
  const { isSuspended, suspensionReason } = useSuspensionStatus();

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando empresas del tenant...</p>
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
            onClick={refreshCompanies}
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
      {/* Suspension Warning */}
      {isSuspended && (
        <div className="bg-orange-50 border-l-4 border-orange-500 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-6 h-6 text-orange-600 mr-3 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-orange-900 mb-1">
                Cuenta Suspendida - Acceso de Solo Lectura
              </h3>
              <p className="text-orange-800 text-sm">
                Puedes consultar la información de tus empresas, pero no puedes realizar modificaciones mientras tu cuenta esté suspendida.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Mis Empresas
        </h1>
        <p className="text-gray-600">
          Gestiona las empresas de tu tenant
        </p>
        <div className="mt-3 flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span className="text-sm text-green-600">🔒 Datos aislados por tenant</span>
          <span className="text-sm text-gray-500">• {companies.length} empresas</span>
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
              <p className="text-2xl font-bold text-gray-900">{companies.length}</p>
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
              <p className="text-2xl font-bold text-gray-900">{stats?.totalProjects || 0}</p>
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
              <p className="text-2xl font-bold text-gray-900">{stats?.totalDocuments || 0}</p>
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
              <p className="text-2xl font-bold text-gray-900">{stats?.documentsProcessed || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Storage Usage */}
      {client && (
        <div className="bg-white rounded-lg shadow-sm p-6">
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
      )}

      {/* Companies List */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Empresas del Tenant</h3>
        {companies.length === 0 ? (
          <div className="text-center py-8">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No hay empresas en este tenant</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map((company) => (
              <div key={company.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-3">
                  <Building2 className="w-5 h-5 text-blue-600 mr-2" />
                  <h4 className="font-medium text-gray-900">{company.name}</h4>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>CIF: {company.cif}</p>
                  <p>Email: {company.email || 'No especificado'}</p>
                  <p>Dirección: {company.address || 'No especificada'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FileText className="w-8 h-8 text-green-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Subir Documentos</p>
              <p className="text-sm text-gray-600">Añadir nuevos documentos</p>
            </div>
          </button>

          <button
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Building2 className="w-8 h-8 text-blue-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Ver Proyectos</p>
              <p className="text-sm text-gray-600">Gestionar proyectos</p>
            </div>
          </button>

          <button
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
            onClick={refreshCompanies}
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
              <p className="font-medium text-gray-900">Datos del tenant cargados</p>
              <p className="text-sm text-gray-500">Acceso seguro y aislado - hace 1 min</p>
            </div>
          </div>
          
          <div className="flex items-center p-3 bg-blue-50 rounded-lg">
            <FileText className="w-5 h-5 text-blue-500 mr-3" />
            <div>
              <p className="font-medium text-gray-900">
                {stats?.totalDocuments || 0} documentos en tu tenant
              </p>
              <p className="text-sm text-gray-500">Gestión documental activa - hace 5 min</p>
            </div>
          </div>
          
          <div className="flex items-center p-3 bg-purple-50 rounded-lg">
            <Building2 className="w-5 h-5 text-purple-500 mr-3" />
            <div>
              <p className="font-medium text-gray-900">
                {companies.length} empresas registradas
              </p>
              <p className="text-sm text-gray-500">Gestión de empresas - hace 10 min</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}