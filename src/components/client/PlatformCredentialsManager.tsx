import React, { useState, useEffect } from 'react';
import { 
  Globe, // Changed to Globe for consistency
  Key, 
  Eye, 
  EyeOff, 
  Save, 
  CheckCircle, 
  AlertTriangle, 
  Plus, 
  Trash2,
  Shield,
  Lock,
  Unlock,
  Settings,
  RefreshCw,
  ExternalLink,
  Edit,
  X
} from 'lucide-react'; // Changed to X for consistency

import { manualManagementService, type PlatformCredential } from '../../lib/manual-management-service';
import { useAuth } from '../../lib/auth-context';
import { supabaseServiceClient } from '../../lib/supabase-real';

interface PlatformCredentialsManagerProps {
  clientId: string;
  onCredentialsUpdated?: () => void;
  isReadOnly?: boolean;
}

export default function PlatformCredentialsManager({ 
  clientId, 
  onCredentialsUpdated,
  isReadOnly = false
}: PlatformCredentialsManagerProps) {
  const { user } = useAuth();
  const [credentials, setCredentials] = useState<PlatformCredential[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPasswords, setShowPasswords] = useState<{[key: string]: boolean}>({});
  const [showForm, setShowForm] = useState(false);
  const [editingCredential, setEditingCredential] = useState<PlatformCredential | null>(null);
  const [selectedPlatformType, setSelectedPlatformType] = useState<'nalanda' | 'ctaima' | 'ecoordina'>('nalanda');
  const [newCredential, setNewCredential] = useState({
    platform_type: 'nalanda' as const,
    username: '',
    password: ''
  });

  const platforms = [
    { 
      type: 'nalanda' as const, 
      name: 'Nalanda/Obralia', 
      color: 'bg-blue-600',
      description: 'Plataforma principal de gestión CAE'
    },
    { 
      type: 'ctaima' as const, 
      name: 'CTAIMA', 
      color: 'bg-green-600',
      description: 'Sistema de coordinación de actividades'
    },
    { 
      type: 'ecoordina' as const, 
      name: 'Ecoordina', 
      color: 'bg-purple-600',
      description: 'Plataforma de coordinación empresarial'
    }
  ];

  useEffect(() => {
    loadCredentials();
  }, [clientId]);

  useEffect(() => {
    const currentCredential = credentials.find(cred => cred.platform_type === selectedPlatformType);
    if (currentCredential) {
      setNewCredential({
        platform_type: currentCredential.platform_type,
        username: currentCredential.username,
        password: currentCredential.password
      });
      setEditingCredential(currentCredential);
    } else {
      setNewCredential({ platform_type: selectedPlatformType, username: '', password: '' });
      setEditingCredential(null);
    }
  }, [selectedPlatformType, credentials]);

  const loadCredentials = async () => {
    try {
      setLoading(true);
      const creds = await manualManagementService.getPlatformCredentials(
        isReadOnly ? clientId : undefined
      );
      setCredentials(creds);
    } catch (error) {
      console.error('Error loading credentials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCredential = () => {
    setEditingCredential(null);
    setNewCredential({ platform_type: 'nalanda', username: '', password: '' });
    setShowForm(true);
  };

  const handleEditCredential = (credential: PlatformCredential) => {
    setEditingCredential(credential);
    setNewCredential({
      platform_type: credential.platform_type,
      username: credential.username,
      password: credential.password
    });
    setShowForm(true);
  };

  const handleSaveCredential = async () => {
    if (!newCredential.username || !newCredential.password) {
      alert('Por favor completa todos los campos');
      return;
    }

    try {
      setSaving(true);
      const success = await manualManagementService.savePlatformCredentials(
        newCredential.platform_type,
        newCredential.username,
        newCredential.password,
        user?.id
      );

      if (success) {
        await loadCredentials();
        setNewCredential({ platform_type: 'nalanda', username: '', password: '' });
        setEditingCredential(null);
        setShowForm(false);
        onCredentialsUpdated?.();
        alert('✅ Credenciales guardadas correctamente');
      } else {
        alert('❌ Error al guardar credenciales');
      }
    } catch (error) {
      console.error('Error saving credential:', error);
      alert('❌ Error al guardar credenciales');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCredential = async (credentialId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar estas credenciales?')) {
      return;
    }

    try {
      const { error } = await supabaseServiceClient
        .from('adaptadores')
        .delete()
        .eq('id', credentialId)
        .eq('tenant_id', user?.tenant_id);

      if (error) {
        throw new Error(error.message);
      }

      await loadCredentials();
      onCredentialsUpdated?.();
      alert('✅ Credenciales eliminadas correctamente');
    } catch (error) {
      console.error('Error deleting credential:', error);
      alert('❌ Error al eliminar credenciales');
    }
  };

  const togglePasswordVisibility = (credentialId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [credentialId]: !prev[credentialId]
    }));
  };

  const getPlatformInfo = (type: string) => {
    return platforms.find(p => p.type === type) || platforms[0];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Cargando credenciales...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">🔑 Credenciales de Plataformas</h3>
          <p className="text-gray-600">
            {isReadOnly ? 'Credenciales configuradas por el cliente' : 'Configura el acceso a las plataformas CAE'}
          </p>
        </div>
        {!isReadOnly && (
          <button
            onClick={handleAddCredential}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Credencial
          </button>
        )}
      </div>

      {/* Platform Selection Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {platforms.map((platform) => {
          const isSelected = selectedPlatformType === platform.type;
          const hasCredentials = credentials.some(cred => cred.platform_type === platform.type);
          
          return (
            <button
              key={platform.type}
              onClick={() => setSelectedPlatformType(platform.type)}
              className={`flex items-center p-4 border rounded-lg transition-colors ${
                isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className={`w-10 h-10 ${platform.color} rounded-lg flex items-center justify-center mr-3`}>
                <Globe className="h-5 w-5 text-white" />
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-gray-900">{platform.name}</h4>
                <p className="text-sm text-gray-600">{platform.description}</p>
                {hasCredentials ? (
                  <div className="flex items-center mt-1">
                    <CheckCircle className="h-3 w-3 text-green-600 mr-1" />
                    <span className="text-xs text-green-600">Configurado</span>
                  </div>
                ) : (
                  <div className="flex items-center mt-1">
                    <AlertTriangle className="h-3 w-3 text-yellow-600 mr-1" />
                    <span className="text-xs text-yellow-600">No configurado</span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Platform Credentials */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className={`w-10 h-10 ${getPlatformInfo(selectedPlatformType).color} rounded-lg flex items-center justify-center mr-3`}>
              <Globe className="h-5 w-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{getPlatformInfo(selectedPlatformType).name}</h4>
              <p className="text-sm text-gray-600">{getPlatformInfo(selectedPlatformType).description}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Usuario de {getPlatformInfo(selectedPlatformType).name}
            </label>
            <div className="flex items-center">
              <input
                type="text"
                value={newCredential.username}
                onChange={(e) => setNewCredential(prev => ({ ...prev, username: e.target.value }))}
                readOnly={isReadOnly}
                className={`flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  isReadOnly ? 'bg-gray-50' : ''
                }`}
                placeholder="usuario@plataforma.com"
              />
              {newCredential.username && (
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(newCredential.username)}
                  className="ml-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                  title="Copiar usuario"
                >
                  Copiar
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña de {getPlatformInfo(selectedPlatformType).name}
            </label>
            <div className="flex items-center">
              <div className="flex-1 flex items-center bg-gray-50 p-3 rounded-lg border">
                <span className="text-gray-900 font-mono flex-1">
                  {showPasswords[selectedPlatformType] ? newCredential.password : '••••••••••••••••'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({
                    ...prev,
                    [selectedPlatformType]: !prev[selectedPlatformType]
                  }))}
                  className="ml-2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords[selectedPlatformType] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {newCredential.password && (
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(newCredential.password)}
                  className="ml-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                  title="Copiar contraseña"
                >
                  Copiar
                </button>
              )}
            </div>
          </div>
        </div>
        {/* Display message if no credentials are found for the selected platform */}
        {(!newCredential.username && !newCredential.password) && (
          <div className="text-center text-gray-500 mt-4">No hay credenciales configuradas para esta plataforma.</div>
        )}
        
        {newCredential.username || newCredential.password ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <h4 className="font-semibold text-blue-800">Credenciales Configuradas</h4>
                <p className="text-sm text-blue-700">
                  {isReadOnly 
                    ? 'Estas son las credenciales que el cliente ha configurado para esta plataforma.'
                    : 'Credenciales guardadas correctamente para esta plataforma.'
                  }
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
              <div>
                <h4 className="font-semibold text-yellow-800">Sin Credenciales</h4>
                <p className="text-sm text-yellow-700">
                  {isReadOnly 
                    ? 'El cliente no ha configurado credenciales para esta plataforma.'
                    : 'No hay credenciales configuradas para esta plataforma.'
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {!isReadOnly && (newCredential.username || newCredential.password) && (
          <div className="mt-4 flex justify-end space-x-3">
            <button
              onClick={() => {
                setNewCredential({ platform_type: selectedPlatformType, username: '', password: '' });
                setEditingCredential(null);
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Limpiar
            </button>
            <button
              onClick={handleSaveCredential}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 flex items-center"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar
                </>
              )}
            </button>
          </div>
        )}

        {!isReadOnly && !newCredential.username && !newCredential.password && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setShowForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Añadir Credenciales
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Credential Form */}
      {showForm && !isReadOnly && !newCredential.username && !newCredential.password && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">
              {editingCredential ? 'Editar Credencial' : 'Nueva Credencial'}
            </h4>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingCredential(null);
                setNewCredential({ platform_type: selectedPlatformType, username: '', password: '' });
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usuario
              </label>
              <input
                type="text"
                value={newCredential.username}
                onChange={(e) => setNewCredential(prev => ({ 
                  ...prev, 
                  username: e.target.value 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="usuario@plataforma.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={newCredential.password}
                onChange={(e) => setNewCredential(prev => ({ 
                  ...prev, 
                  password: e.target.value 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end space-x-3">
            <button
              onClick={() => {
                setShowForm(false);
                setEditingCredential(null);
                setNewCredential({ platform_type: selectedPlatformType, username: '', password: '' });
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveCredential}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 flex items-center"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Instructions for Admin */}
      {isReadOnly && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-start">
            <Settings className="h-5 w-5 text-purple-600 mr-3 mt-0.5" />
            <div>
              <h4 className="font-semibold text-purple-800 mb-2">Instrucciones para el Administrador</h4>
              <ol className="text-sm text-purple-700 space-y-1">
                <li>1. Copia las credenciales usando los botones "Copiar"</li>
                <li>2. Abre la plataforma en nueva pestaña</li>
                <li>3. Inicia sesión con las credenciales copiadas</li>
                <li>4. Sube los documentos manualmente</li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}