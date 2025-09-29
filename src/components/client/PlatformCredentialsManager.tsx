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
  X,
  Loader2,
  Info
} from 'lucide-react';
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
  const [savingCredentials, setSavingCredentials] = useState(false);
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
    
    // Auto-show password in readonly mode for admin viewing
    if (isReadOnly) {
      setShowPasswords(prev => ({
        ...prev,
        [selectedPlatformType]: true
      }));
    }
  }, [selectedPlatformType, credentials, isReadOnly]);

  const loadCredentials = async () => {
    try {
      setLoading(true);
      // In readonly mode, load credentials for the specific tenant (clientId is actually tenantId)
      // In edit mode, load credentials for current user's tenant
      const targetTenantId = isReadOnly ? clientId : undefined;
      console.log('🔍 [PlatformCredentials] Loading credentials for tenant:', targetTenantId, 'readonly:', isReadOnly);
      
      const creds = await manualManagementService.getPlatformCredentials(targetTenantId);
      console.log('✅ [PlatformCredentials] Loaded credentials:', creds.length);
      setCredentials(creds);
    } catch (error) {
      console.error('Error loading credentials:', error);
      setCredentials([]);
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
    if (!newCredential.username.trim() || !newCredential.password.trim()) {
      alert('Por favor completa todos los campos');
      return;
    }

    try {
      setSavingCredentials(true);
      
      // Use the correct tenant ID for saving
      const targetTenantId = isReadOnly ? clientId : user?.tenant_id;
      
      if (!targetTenantId) {
        alert('❌ Error: No se pudo identificar el tenant');
        return;
      }
      
      const success = await manualManagementService.savePlatformCredentials(
        newCredential.platform_type,
        newCredential.username,
        newCredential.password,
        user?.id,
        targetTenantId
      );

      if (success) {
        await loadCredentials();
        setNewCredential({ platform_type: 'nalanda', username: '', password: '' });
        setEditingCredential(null);
        onCredentialsUpdated?.();
        alert('✅ Credenciales guardadas correctamente');
      } else {
        alert('❌ Error al guardar credenciales');
      }
    } catch (error) {
      console.error('Error saving credential:', error);
      alert('❌ Error al guardar credenciales');
    } finally {
      setSavingCredentials(false);
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
              Usuario de {getPlatformInfo(selectedPlatformType).name} *
            </label>
            {isReadOnly ? (
              <div className="flex items-center">
                <input
                  type="text"
                  value={newCredential.username}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
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
            ) : (
              <input
                type="text"
                value={newCredential.username}
                onChange={(e) => setNewCredential(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="usuario@plataforma.com"
                required
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña de {getPlatformInfo(selectedPlatformType).name} *
            </label>
            {isReadOnly ? (
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
            ) : (
              <div className="flex items-center">
                <input
                  type={showPasswords[selectedPlatformType] ? "text" : "password"}
                  value={newCredential.password}
                  onChange={(e) => setNewCredential(prev => ({ ...prev, password: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({
                    ...prev,
                    [selectedPlatformType]: !prev[selectedPlatformType]
                  }))}
                  className="ml-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {showPasswords[selectedPlatformType] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            )}
          </div>
        </div>

        {!isReadOnly && (
          <div className="flex justify-end">
            <button
              onClick={handleSaveCredential}
              disabled={savingCredentials || !newCredential.username.trim() || !newCredential.password.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center"
            >
              {savingCredentials ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {editingCredential ? 'Actualizar' : 'Guardar'} Credenciales
            </button>
          </div>
        )}
      </div>

      {/* Instructions for Client */}
      {!isReadOnly && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
            <div>
              <h4 className="font-semibold text-green-800 mb-2">Configuración de Credenciales</h4>
              <p className="text-sm text-green-700 mb-2">
                Configura tus credenciales de acceso a las plataformas CAE para permitir la integración automática.
              </p>
              <div className="text-sm text-green-600 space-y-1">
                <div>• 🔐 Las credenciales se almacenan de forma segura y encriptada</div>
                <div>• 🔄 Permiten la subida automática de documentos a las plataformas</div>
                <div>• ⚙️ Puedes configurar múltiples plataformas según tus necesidades</div>
                <div>• 🛡️ Solo tú y los administradores autorizados pueden ver estas credenciales</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}