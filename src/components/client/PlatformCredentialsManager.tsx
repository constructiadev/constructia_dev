/**
 * PlatformCredentialsManager Component
 *
 * Manages platform credentials (Nalanda, CTAIMA, Ecoordina) for clients.
 *
 * CRITICAL IMPLEMENTATION NOTES:
 * ================================
 *
 * 1. PER-TENANT ISOLATION:
 *    - Each client has a unique tenant_id
 *    - Credentials are stored in localStorage with key: `constructia_credentials_${tenantId}`
 *    - This ensures credentials are isolated per client
 *
 * 2. SAME-TAB SYNCHRONIZATION:
 *    - When credentials are saved, a custom event 'constructia-credentials-updated' is dispatched
 *    - This allows other components in the same tab to update immediately
 *    - Browser storage events only fire in OTHER tabs, not the current tab
 *
 * 3. CUSTOM EVENT PAYLOAD:
 *    - tenantId: The tenant whose credentials were updated
 *    - credentials: Array of platform credentials
 *    - timestamp: When the update occurred
 *
 * 4. ADMIN ACCESS:
 *    - When called from admin panel, clientId parameter contains the target client's tenant_id
 *    - Admin can view/edit any client's credentials by passing their tenant_id
 *    - Read-only mode is available for viewing without editing
 *
 * @param clientId - The tenant_id of the client whose credentials to manage
 * @param onCredentialsUpdated - Callback fired when credentials are successfully updated
 * @param isReadOnly - If true, credentials can only be viewed, not edited
 */
import React, { useState, useEffect } from 'react';
import {
  Globe,
  Key,
  Eye,
  EyeOff,
  Save,
  CheckCircle,
  AlertTriangle,
  Shield,
  RefreshCw,
  Info,
  Lock,
  Unlock
} from 'lucide-react';
import { useAuth } from '../../lib/auth-context';

interface PlatformCredential {
  platform_type: 'nalanda' | 'ctaima' | 'ecoordina';
  username: string;
  password: string;
  is_active: boolean;
  last_updated: string;
}

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
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState<{[key: string]: boolean}>({});
  const [selectedPlatformType, setSelectedPlatformType] = useState<'nalanda' | 'ctaima' | 'ecoordina'>('nalanda');
  const [newCredential, setNewCredential] = useState({
    platform_type: 'nalanda' as const,
    username: '',
    password: ''
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const platforms = [
    { 
      type: 'nalanda' as const, 
      name: 'Nalanda/Obralia', 
      color: 'bg-blue-600',
      description: 'Plataforma principal de gestión CAE',
      url: 'https://app.nalandaglobal.com'
    },
    { 
      type: 'ctaima' as const, 
      name: 'CTAIMA', 
      color: 'bg-green-600',
      description: 'Sistema de coordinación de actividades',
      url: 'https://myaccount.ctaima.com'
    },
    { 
      type: 'ecoordina' as const, 
      name: 'Ecoordina', 
      color: 'bg-purple-600',
      description: 'Plataforma de coordinación empresarial',
      url: 'https://welcometotwind.io'
    }
  ];

  // CRITICAL: Always use clientId if provided, otherwise fall back to user's tenant_id
  // When called from admin panel, clientId will be the target client's tenant_id
  // When called from client panel, it will use the logged-in user's tenant_id
  const effectiveTenantId = clientId || user?.tenant_id || 'default';
  const STORAGE_KEY = `constructia_credentials_${effectiveTenantId}`;

  useEffect(() => {
    console.log(`🔐 [PlatformCredentialsManager] Initializing for tenant: ${effectiveTenantId}`);
    loadCredentialsFromStorage();
  }, [clientId, effectiveTenantId]);

  useEffect(() => {
    const currentCredential = credentials.find(cred => cred.platform_type === selectedPlatformType);
    if (currentCredential) {
      setNewCredential({
        platform_type: currentCredential.platform_type,
        username: currentCredential.username,
        password: currentCredential.password
      });
    } else {
      setNewCredential({ platform_type: selectedPlatformType, username: '', password: '' });
    }
    
    // Auto-show password in readonly mode for admin viewing
    if (isReadOnly) {
      setShowPasswords(prev => ({
        ...prev,
        [selectedPlatformType]: true
      }));
    }
  }, [selectedPlatformType, credentials, isReadOnly]);

  const loadCredentialsFromStorage = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedCredentials = JSON.parse(stored);
        setCredentials(parsedCredentials);
        console.log('✅ [PlatformCredentials] Loaded from localStorage:', parsedCredentials.length, 'credentials');
      } else {
        // Crear credenciales por defecto para demo
        const defaultCredentials: PlatformCredential[] = [
          {
            platform_type: 'nalanda',
            username: 'demo@construcciones.com',
            password: 'nalanda2024',
            is_active: true,
            last_updated: new Date().toISOString()
          },
          {
            platform_type: 'ctaima',
            username: 'demo@construcciones.com',
            password: 'ctaima2024',
            is_active: false,
            last_updated: new Date().toISOString()
          },
          {
            platform_type: 'ecoordina',
            username: '',
            password: '',
            is_active: false,
            last_updated: new Date().toISOString()
          }
        ];
        setCredentials(defaultCredentials);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultCredentials));
        console.log('✅ [PlatformCredentials] Created default credentials');
      }
    } catch (error) {
      console.error('Error loading credentials from storage:', error);
      setCredentials([]);
    }
  };

  const saveCredentialsToStorage = (newCredentials: PlatformCredential[]) => {
    try {
      console.log(`💾 [PlatformCredentialsManager] Saving credentials to key: ${STORAGE_KEY}`);
      console.log(`   Tenant ID: ${effectiveTenantId}`);
      console.log(`   Credentials count: ${newCredentials.length}`);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newCredentials));
      console.log('✅ [PlatformCredentials] Saved to localStorage successfully');

      // Dispatch custom event for same-tab synchronization
      const event = new CustomEvent('constructia-credentials-updated', {
        detail: {
          tenantId: effectiveTenantId,
          credentials: newCredentials,
          timestamp: Date.now()
        }
      });
      window.dispatchEvent(event);
      console.log(`📢 [PlatformCredentials] Dispatched credentials update event for tenant: ${effectiveTenantId}`);

      return true;
    } catch (error) {
      console.error('Error saving credentials to storage:', error);
      return false;
    }
  };

  const handleSaveCredential = async () => {
    if (!newCredential.username.trim() || !newCredential.password.trim()) {
      setMessage({ type: 'error', text: 'Por favor completa todos los campos' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    try {
      setLoading(true);
      
      // Actualizar credenciales en el estado local
      const updatedCredentials = credentials.filter(c => c.platform_type !== newCredential.platform_type);
      const newCred: PlatformCredential = {
        platform_type: newCredential.platform_type,
        username: newCredential.username,
        password: newCredential.password,
        is_active: true,
        last_updated: new Date().toISOString()
      };
      
      const finalCredentials = [...updatedCredentials, newCred];
      
      // Guardar en localStorage
      const saved = saveCredentialsToStorage(finalCredentials);
      
      if (saved) {
        setCredentials(finalCredentials);
        setMessage({ type: 'success', text: 'Credenciales guardadas correctamente' });
        onCredentialsUpdated?.();
      } else {
        setMessage({ type: 'error', text: 'Error al guardar credenciales' });
      }
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error saving credential:', error);
      setMessage({ type: 'error', text: 'Error al guardar credenciales' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCredential = (platformType: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar estas credenciales?')) {
      return;
    }

    try {
      const updatedCredentials = credentials.map(cred => 
        cred.platform_type === platformType 
          ? { ...cred, username: '', password: '', is_active: false, last_updated: new Date().toISOString() }
          : cred
      );
      
      const saved = saveCredentialsToStorage(updatedCredentials);
      
      if (saved) {
        setCredentials(updatedCredentials);
        setMessage({ type: 'success', text: 'Credenciales eliminadas correctamente' });
        onCredentialsUpdated?.();
      } else {
        setMessage({ type: 'error', text: 'Error al eliminar credenciales' });
      }
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error deleting credential:', error);
      setMessage({ type: 'error', text: 'Error al eliminar credenciales' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const togglePasswordVisibility = (platformType: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [platformType]: !prev[platformType]
    }));
  };

  const getPlatformInfo = (type: string) => {
    return platforms.find(p => p.type === type) || platforms[0];
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setMessage({ type: 'success', text: `${label} copiado al portapapeles` });
      setTimeout(() => setMessage(null), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      setMessage({ type: 'error', text: 'Error al copiar' });
      setTimeout(() => setMessage(null), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">🔑 Credenciales de Plataformas</h3>
          <p className="text-gray-600">
            {isReadOnly ? 'Credenciales configuradas (almacenadas localmente)' : 'Configura el acceso a las plataformas CAE'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadCredentialsFromStorage}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Recargar
          </button>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertTriangle className="w-5 h-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Platform Selection Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {platforms.map((platform) => {
          const isSelected = selectedPlatformType === platform.type;
          const credentialForPlatform = credentials.find(cred => cred.platform_type === platform.type);
          const hasCredentials = credentialForPlatform && credentialForPlatform.username && credentialForPlatform.password;
          
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
                {hasCredentials && credentialForPlatform?.is_active ? (
                  <div className="flex items-center mt-1">
                    <CheckCircle className="h-3 w-3 text-green-600 mr-1" />
                    <span className="text-xs text-green-600">Configurado</span>
                  </div>
                ) : hasCredentials && !credentialForPlatform?.is_active ? (
                  <div className="flex items-center mt-1">
                    <AlertTriangle className="h-3 w-3 text-yellow-600 mr-1" />
                    <span className="text-xs text-yellow-600">Inactivo</span>
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

      {/* Selected Platform Credentials Form */}
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
          <a
            href={getPlatformInfo(selectedPlatformType).url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm flex items-center"
          >
            <Globe className="h-4 w-4 mr-1" />
            Abrir Plataforma
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Usuario de {getPlatformInfo(selectedPlatformType).name} *
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
              {isReadOnly && newCredential.username && (
                <button
                  type="button"
                  onClick={() => copyToClipboard(newCredential.username, 'Usuario')}
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
              Contraseña de {getPlatformInfo(selectedPlatformType).name} *
            </label>
            <div className="flex items-center">
              <div className="flex-1 flex items-center">
                <input
                  type={showPasswords[selectedPlatformType] ? "text" : "password"}
                  value={newCredential.password}
                  onChange={(e) => setNewCredential(prev => ({ ...prev, password: e.target.value }))}
                  readOnly={isReadOnly}
                  className={`flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    isReadOnly ? 'bg-gray-50' : ''
                  }`}
                  placeholder="••••••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility(selectedPlatformType)}
                  className="ml-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {showPasswords[selectedPlatformType] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {isReadOnly && newCredential.password && (
                <button
                  type="button"
                  onClick={() => copyToClipboard(newCredential.password, 'Contraseña')}
                  className="ml-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                  title="Copiar contraseña"
                >
                  Copiar
                </button>
              )}
            </div>
          </div>
        </div>

        {!isReadOnly && (
          <div className="flex justify-between items-center">
            <button
              onClick={() => handleDeleteCredential(selectedPlatformType)}
              className="text-red-600 hover:text-red-700 text-sm flex items-center"
            >
              <Lock className="h-4 w-4 mr-1" />
              Eliminar Credenciales
            </button>
            <button
              onClick={handleSaveCredential}
              disabled={loading || !newCredential.username.trim() || !newCredential.password.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Guardar Credenciales
            </button>
          </div>
        )}
      </div>

      {/* Status Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Estado de Configuración</h4>
        <div className="space-y-2">
          {platforms.map((platform) => {
            const credential = credentials.find(c => c.platform_type === platform.type);
            const isConfigured = credential && credential.username && credential.password && credential.is_active;
            
            return (
              <div key={platform.type} className="flex items-center justify-between p-2 bg-white rounded border">
                <div className="flex items-center">
                  <div className={`w-6 h-6 ${platform.color} rounded flex items-center justify-center mr-3`}>
                    <Globe className="h-3 w-3 text-white" />
                  </div>
                  <span className="font-medium text-gray-900">{platform.name}</span>
                </div>
                <div className="flex items-center">
                  {isConfigured ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                      <span className="text-sm text-green-600">Configurado</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mr-1" />
                      <span className="text-sm text-yellow-600">No configurado</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-800 mb-2">💾 Almacenamiento Local</h4>
            <p className="text-sm text-blue-700 mb-2">
              Las credenciales se almacenan localmente en tu navegador para evitar problemas de conectividad.
            </p>
            <div className="text-sm text-blue-600 space-y-1">
              <div>• 🔐 Almacenamiento seguro en localStorage del navegador</div>
              <div>• 🔄 Sincronización automática entre pestañas</div>
              <div>• 📱 Persistencia entre sesiones</div>
              <div>• 🛡️ No se envían a servidores externos</div>
              <div>• 🔑 Acceso directo para administradores en modo lectura</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}