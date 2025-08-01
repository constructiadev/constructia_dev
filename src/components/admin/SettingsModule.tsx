import React, { useState, useEffect } from 'react';
import { Settings, Save, AlertCircle, CheckCircle, Database, Key, Globe, Mail } from 'lucide-react';
import { getSystemSettings, updateSystemSetting, getAPIIntegrations } from '../../lib/supabase';

interface SystemSetting {
  id: string;
  key: string;
  value: any;
  description: string;
  updated_at: string;
}

interface APIIntegration {
  id: string;
  name: string;
  status: string;
  description: string;
  requests_today: number;
  avg_response_time_ms: number;
  last_sync: string;
  config_details: any;
}

export default function SettingsModule() {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [integrations, setIntegrations] = useState<APIIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [settingsData, integrationsData] = await Promise.all([
        getSystemSettings(),
        getAPIIntegrations()
      ]);
      
      setSettings(settingsData || []);
      setIntegrations(integrationsData || []);
    } catch (error) {
      console.error('Error loading settings:', error);
      setMessage({ type: 'error', text: 'Error al cargar configuraciones' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSetting = async (key: string, value: any, description: string) => {
    try {
      setSaving(key);
      await updateSystemSetting(key, value, description);
      await loadData();
      setMessage({ type: 'success', text: 'Configuración actualizada exitosamente' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error updating setting:', error);
      setMessage({ type: 'error', text: 'Error al actualizar configuración' });
    } finally {
      setSaving(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'error':
      case 'disconnected':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="w-8 h-8 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Configuración del Sistema</h1>
      </div>

      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {message.text}
        </div>
      )}

      {/* Configuraciones del Sistema */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Configuraciones del Sistema</h2>
          </div>
        </div>
        <div className="p-6">
          {settings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Database className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No hay configuraciones del sistema disponibles</p>
              <button
                onClick={() => handleUpdateSetting('app_name', 'ConstructIA', 'Nombre de la aplicación')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Crear configuración inicial
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {settings.map((setting) => (
                <div key={setting.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{setting.key}</h3>
                    <span className="text-sm text-gray-500">
                      {new Date(setting.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{setting.description}</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      defaultValue={typeof setting.value === 'string' ? setting.value : JSON.stringify(setting.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const target = e.target as HTMLInputElement;
                          handleUpdateSetting(setting.key, target.value, setting.description);
                        }
                      }}
                    />
                    <button
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        handleUpdateSetting(setting.key, input.value, setting.description);
                      }}
                      disabled={saving === setting.key}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                    >
                      {saving === setting.key ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Guardar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Estado de Integraciones */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Estado de Integraciones</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="grid gap-4 md:grid-cols-2">
            {integrations.map((integration) => (
              <div key={integration.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">{integration.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(integration.status)}`}>
                    {integration.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{integration.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Requests hoy:</span>
                    <p className="font-medium">{integration.requests_today.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Tiempo respuesta:</span>
                    <p className="font-medium">{integration.avg_response_time_ms}ms</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t">
                  <span className="text-xs text-gray-500">
                    Última sincronización: {new Date(integration.last_sync).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Configuraciones Rápidas */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Configuraciones Rápidas</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <button
              onClick={() => handleUpdateSetting('maintenance_mode', false, 'Modo de mantenimiento del sistema')}
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-medium text-gray-900">Modo Mantenimiento</h3>
                  <p className="text-sm text-gray-600">Desactivar modo mantenimiento</p>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => handleUpdateSetting('email_notifications', true, 'Notificaciones por email habilitadas')}
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-green-600" />
                <div>
                  <h3 className="font-medium text-gray-900">Notificaciones Email</h3>
                  <p className="text-sm text-gray-600">Habilitar notificaciones</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}