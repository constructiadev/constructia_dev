import React, { useState, useEffect } from 'react';
import { 
  User, 
  Building2, 
  CreditCard, 
  Key, 
  Globe,
  Save,
  AlertCircle,
  CheckCircle,
  Settings as SettingsIcon
} from 'lucide-react';
import { useClientData } from '../../hooks/useClientData';
import { supabase } from '../../lib/supabase-real';

import PlatformCredentialsManager from './PlatformCredentialsManager';

export default function Settings() {
  const { client, loading, error, refreshData } = useClientData();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando configuración del tenant...</p>
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
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-yellow-500 mx-auto mb-4" />
          <p className="text-yellow-600">No se encontraron datos del cliente</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
            <p className="text-gray-600">Gestiona tu perfil y configuraciones de integración</p>
            <div className="mt-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium inline-block">
              🔒 DATOS AISLADOS - Tenant: {client.tenant_id.substring(0, 8)}
            </div>
          </div>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Información del Cliente */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <User className="w-6 h-6 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Información del Cliente</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Empresa
              </label>
              <p className="text-gray-900 font-medium">{client.company_name}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contacto
              </label>
              <p className="text-gray-900">{client.name}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <p className="text-gray-900">{client.email}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono
              </label>
              <p className="text-gray-900">No especificado</p>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dirección
              </label>
              <p className="text-gray-900">No especificada</p>
            </div>
          </div>
        </div>

        {/* Información de Suscripción */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <CreditCard className="w-6 h-6 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Suscripción</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plan Actual
              </label>
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                client.subscription_plan === 'enterprise' 
                  ? 'bg-purple-100 text-purple-800'
                  : client.subscription_plan === 'professional'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {client.subscription_plan.charAt(0).toUpperCase() + client.subscription_plan.slice(1)}
              </span>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                client.subscription_status === 'active' 
                  ? 'bg-green-100 text-green-800'
                  : client.subscription_status === 'suspended'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {client.subscription_status === 'active' ? 'Activa' : 
                 client.subscription_status === 'suspended' ? 'Suspendida' : 'Cancelada'}
              </span>
            </div>
          </div>
        </div>

        {/* Platform Credentials Management */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Globe className="w-6 h-6 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Credenciales de Plataformas CAE</h2>
          </div>
          
          <PlatformCredentialsManager 
            clientId={client?.id || ''}
            onCredentialsUpdated={refreshData}
          />
        </div>

        {/* Información de Integración */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Building2 className="w-6 h-6 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Estado de Integración</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Obralia/Nalanda</h3>
                <p className="text-sm text-gray-600">Plataforma de gestión de documentos</p>
              </div>
              <div className="flex items-center space-x-2">
                {client.obralia_credentials?.configured ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-green-600">Conectado</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                    <span className="text-sm text-yellow-600">No configurado</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}