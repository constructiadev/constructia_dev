import React, { useState, useEffect } from 'react';
import { 
  Globe, 
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
} from 'lucide-react';
import { manualManagementService, type PlatformCredential } from '../../lib/manual-management-service';
import { useAuth } from '../../lib/auth-context';
import { supabaseServiceClient } from '../../lib/supabase-real';

interface PlatformCredentialsManagerProps {
  clientId: string;
  onCredentialsUpdated?: () => void;
}

export default function PlatformCredentialsManager({ 
  clientId, 
  onCredentialsUpdated 
}: PlatformCredentialsManagerProps) {
  const { user } = useAuth();
  const [credentials, setCredentials] = useState<PlatformCredential[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPasswords, setShowPasswords] = useState<{[key: string]: boolean}>({});
  const [showForm, setShowForm] = useState(false);
  const [editingCredential, setEditingCredential] = useState<PlatformCredential | null>(null);
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

  const loadCredentials = async () => {
    try {
      setLoading(true);
      const creds = await manualManagementService.getPlatformCredentials(clientId);
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
          <p className="text-gray-600">Configura el acceso a las plataformas CAE</p>
        </div>
        <button
          onClick={handleAddCredential}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Credencial
        </button>
      </div>

      {/* Existing Credentials List */}
      <div className="space-y-4">
        {credentials.map((credential) => {
          const platformInfo = getPlatformInfo(credential.platform_type);
          
          return (
            <div key={credential.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className={`w-10 h-10 ${platformInfo.color} rounded-lg flex items-center justify-center mr-3`}>
                    <Globe className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{platformInfo.name}</h4>
                    <p className="text-sm text-gray-600">{platformInfo.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {credential.validation_status === 'valid' ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span className="text-sm">Credenciales configuradas</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-yellow-600">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      <span className="text-sm">Pendiente validación</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Usuario de {platformInfo.name}
                  </label>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <span className="text-gray-900 font-mono">{credential.username}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña de {platformInfo.name}
                  </label>
                  <div className="flex items-center bg-gray-50 p-3 rounded-lg border">
                    <span className="text-gray-900 font-mono flex-1">
                      {showPasswords[credential.id] ? credential.password : '••••••••••••••••'}
                    </span>
                    <button
                      onClick={() => togglePasswordVisibility(credential.id)}
                      className="ml-2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords[credential.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  {credential.last_validated && (
                    <span>Última validación: {new Date(credential.last_validated).toLocaleDateString('es-ES')}</span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEditCredential(credential)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center text-sm"
                  >
                    <Shield className="h-4 w-4 mr-1" />
                    Guardar Credenciales
                  </button>
                  <button
                    onClick={() => handleEditCredential(credential)}
                    className="text-blue-600 hover:text-blue-700 p-2"
                    title="Editar credenciales"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCredential(credential.id)}
                    className="text-red-600 hover:text-red-700 p-2"
                    title="Eliminar credenciales"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Credential Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">
              {editingCredential ? 'Editar Credencial' : 'Nueva Credencial'}
            </h4>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingCredential(null);
                setNewCredential({ platform_type: 'nalanda', username: '', password: '' });
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plataforma
              </label>
              <select
                value={newCredential.platform_type}
                onChange={(e) => setNewCredential(prev => ({ 
                  ...prev, 
                  platform_type: e.target.value as any 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {platforms.map(platform => (
                  <option key={platform.type} value={platform.type}>
                    {platform.name}
                  </option>
                ))}
              </select>
            </div>

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
                setNewCredential({ platform_type: 'nalanda', username: '', password: '' });
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

      {/* Warning if no credentials */}
      {credentials.length === 0 && !showForm && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
            <div>
              <h4 className="font-semibold text-yellow-800">Credenciales Requeridas</h4>
              <p className="text-sm text-yellow-700">
                Debes configurar al menos una credencial de plataforma para poder subir documentos.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}