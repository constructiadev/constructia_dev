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
import { getAllClients, updateClientObraliaCredentials, supabase } from '../../lib/supabase';

import ObraliaCredentialsModal from './ObraliaCredentialsModal';
import PlatformCredentialsManager from './PlatformCredentialsManager';

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [clientData, setClientData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showObraliaModal, setShowObraliaModal] = useState(false);
  const [obraliaCredentials, setObraliaCredentials] = useState({
    username: '',
    password: ''
  });

  useEffect(() => {
    loadClientData();
  }, []);

  const loadClientData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Obtener usuario autenticado actual
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Usuario no autenticado');
      }
      
      // Obtener datos específicos del cliente autenticado
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (clientError || !clientData) {
        throw new Error('No se encontraron datos del cliente');
      }
      
      setClientData(clientData);
      
      // Configurar credenciales existentes
      if (clientData.obralia_credentials) {
        setObraliaCredentials({
          username: clientData.obralia_credentials.username || '',
          password: clientData.obralia_credentials.password || ''
        });
      }
      
      // Mostrar modal si no está configurado
      if (!clientData.obralia_credentials?.configured) {
        setShowObraliaModal(true);
      }
      
    } catch (err) {
      console.error('Error loading client data:', err);
      setError(err instanceof Error ? err.message : 'Error loading client data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveObraliaCredentials = async () => {
    if (!clientData || !obraliaCredentials.username || !obraliaCredentials.password) return;
    
    try {
      setSaving(true);
      // Validar formato de credenciales
      if (obraliaCredentials.username.length < 3) {
        setMessage({ type: 'error', text: 'El usuario debe tener al menos 3 caracteres' });
        return;
      }
      if (obraliaCredentials.password.length < 6) {
        setMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres' });
        return;
      }
      
      await updateClientObraliaCredentials(clientData.id, obraliaCredentials);
      await loadClientData(); // Recargar datos
      setMessage({ type: 'success', text: 'Credenciales de Obralia actualizadas correctamente' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error saving Obralia credentials:', error);
      setMessage({ type: 'error', text: 'Error al guardar las credenciales. Verifica los datos e inténtalo de nuevo.' });
    } finally {
      setSaving(false);
    }
  };

  const handleObraliaModalSave = async (credentials: { username: string; password: string }) => {
    if (!clientData) return;
    
    try {
      await updateClientObraliaCredentials(clientData.id, credentials);
      await loadClientData();
      setShowObraliaModal(false);
      setMessage({ type: 'success', text: 'Credenciales de Obralia configuradas correctamente' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error saving Obralia credentials:', error);
      setMessage({ type: 'error', text: 'Error al configurar las credenciales de Obralia' });
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando configuración...</p>
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
            onClick={loadClientData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!clientData) {
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
            <div className="mt-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium inline-block">
              ✅ DATOS REALES
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
              <p className="text-gray-900 font-medium">{clientData.company_name}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contacto
              </label>
              <p className="text-gray-900">{clientData.contact_name}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <p className="text-gray-900">{clientData.email}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono
              </label>
              <p className="text-gray-900">{clientData.phone || 'No especificado'}</p>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dirección
              </label>
              <p className="text-gray-900">{clientData.address || 'No especificada'}</p>
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
                clientData.subscription_plan === 'enterprise' 
                  ? 'bg-purple-100 text-purple-800'
                  : clientData.subscription_plan === 'professional'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {clientData.subscription_plan.charAt(0).toUpperCase() + clientData.subscription_plan.slice(1)}
              </span>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                clientData.subscription_status === 'active' 
                  ? 'bg-green-100 text-green-800'
                  : clientData.subscription_status === 'suspended'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {clientData.subscription_status === 'active' ? 'Activa' : 
                 clientData.subscription_status === 'suspended' ? 'Suspendida' : 'Cancelada'}
              </span>
            </div>
          </div>
        </div>

        {/* Credenciales de Obralia */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Key className="w-6 h-6 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Credenciales de Obralia</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="obralia-username" className="block text-sm font-medium text-gray-700 mb-2">
                Usuario de Obralia
              </label>
              <input
                type="text"
                id="obralia-username"
                value={obraliaCredentials.username}
                onChange={(e) => setObraliaCredentials(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Introduce tu usuario de Obralia"
              />
            </div>
            
            <div>
              <label htmlFor="obralia-password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña de Obralia
              </label>
              <input
                type="password"
                id="obralia-password"
                value={obraliaCredentials.password}
                onChange={(e) => setObraliaCredentials(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Introduce tu contraseña de Obralia"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {clientData.obralia_credentials?.configured ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-green-600">Credenciales configuradas</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                    <span className="text-sm text-yellow-600">Credenciales no configuradas</span>
                  </>
                )}
              </div>
              
              <button
                onClick={handleSaveObraliaCredentials}
                disabled={saving || !obraliaCredentials.username || !obraliaCredentials.password}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Guardando...' : 'Guardar Credenciales'}</span>
              </button>
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
            clientId={clientData?.id || ''}
            onCredentialsUpdated={loadClientData}
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
                {clientData.obralia_credentials?.configured ? (
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
      
      {/* Modal de Credenciales Obralia */}
      <ObraliaCredentialsModal
        isOpen={showObraliaModal}
        onSave={handleObraliaModalSave}
        clientName={clientData.company_name}
      />
    </>
  );
}