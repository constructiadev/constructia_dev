import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { User, Settings as SettingsIcon, Key, Bell, Shield } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const [clientData, setClientData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchClientData();
    }
  }, [user]);

  const fetchClientData = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setClientData(data);
    } catch (error) {
      console.error('Error fetching client data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    // Simular guardado
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-blue-600" />
          Configuración
        </h1>
        <p className="text-gray-600 mt-2">
          Gestiona tu perfil y preferencias de la cuenta
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información del Perfil */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Información del Perfil
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la Empresa
              </label>
              <input
                type="text"
                value={clientData?.company_name || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nombre de tu empresa"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Persona de Contacto
              </label>
              <input
                type="text"
                value={clientData?.contact_name || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tu nombre completo"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                value={clientData?.phone || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="+34 600 000 000"
              />
            </div>
          </div>
        </div>

        {/* Credenciales de Obralia */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Key className="w-5 h-5 text-green-600" />
            Credenciales de Obralia
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usuario Obralia
              </label>
              <input
                type="text"
                value={clientData?.obralia_credentials?.username || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Tu usuario de Obralia"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña Obralia
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Tu contraseña de Obralia"
              />
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <div className={`w-3 h-3 rounded-full ${
                clientData?.obralia_credentials?.configured ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className={
                clientData?.obralia_credentials?.configured ? 'text-green-600' : 'text-red-600'
              }>
                {clientData?.obralia_credentials?.configured ? 'Configurado' : 'No configurado'}
              </span>
            </div>
          </div>
        </div>

        {/* Notificaciones */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-yellow-600" />
            Notificaciones
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700">Email de documentos procesados</p>
                <p className="text-sm text-gray-500">Recibir notificaciones cuando se procesen documentos</p>
              </div>
              <input type="checkbox" className="w-4 h-4 text-blue-600" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700">Alertas de límites</p>
                <p className="text-sm text-gray-500">Notificar cuando se acerque a los límites de almacenamiento</p>
              </div>
              <input type="checkbox" className="w-4 h-4 text-blue-600" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700">Actualizaciones del sistema</p>
                <p className="text-sm text-gray-500">Recibir información sobre nuevas funcionalidades</p>
              </div>
              <input type="checkbox" className="w-4 h-4 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Seguridad */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-600" />
            Seguridad
          </h2>
          
          <div className="space-y-4">
            <button className="w-full text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
              <p className="font-medium text-gray-700">Cambiar contraseña</p>
              <p className="text-sm text-gray-500">Actualiza tu contraseña de acceso</p>
            </button>
            
            <button className="w-full text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
              <p className="font-medium text-gray-700">Autenticación de dos factores</p>
              <p className="text-sm text-gray-500">Añade una capa extra de seguridad</p>
            </button>
            
            <button className="w-full text-left p-3 border border-red-200 rounded-md hover:bg-red-50 transition-colors text-red-600">
              <p className="font-medium">Eliminar cuenta</p>
              <p className="text-sm text-red-500">Eliminar permanentemente tu cuenta y datos</p>
            </button>
          </div>
        </div>
      </div>

      {/* Botón de Guardar */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </div>
  );
}