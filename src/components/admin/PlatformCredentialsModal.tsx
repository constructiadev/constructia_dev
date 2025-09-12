import React, { useState, useEffect } from 'react';
import {
  X,
  Globe,
  Key,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  User,
  Lock,
  Shield,
  Building2,
  Mail,
  RefreshCw
} from 'lucide-react';
import { type ClientGroup, type PlatformCredential } from '../../lib/manual-management-service';

interface PlatformCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: ClientGroup;
}

export default function PlatformCredentialsModal({ 
  isOpen, 
  onClose, 
  client 
}: PlatformCredentialsModalProps) {
  const [showPasswords, setShowPasswords] = useState<{[key: string]: boolean}>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const platforms = [
    { 
      type: 'nalanda', 
      name: 'Nalanda/Obralia', 
      color: 'bg-blue-600',
      url: 'https://identity.nalandaglobal.com/realms/nalanda/protocol/openid-connect/auth?ui_locales=es+en+pt&scope=openid&response_type=code&redirect_uri=https%3A%2F%2Fapp.nalandaglobal.com%2Fsso%2Fcallback.action& state=iWjiywv5BdzdX9IagNMFTYQgz_0QJMlNxfowDD_XeSY&nonce=_wBHFNRC1xlSpdE_2Uq7UxLzCCD1Amy29V3LjcDk7iE&client_id=nalanda-app',
      description: 'Plataforma principal de gestión CAE'
    },
    { 
      type: 'ctaima', 
      name: 'CTAIMA', 
      color: 'bg-green-600',
      url: 'https://login.ctaima.com/Account/Login?ReturnUrl=%2Fconnect%2Fauthorize%2Fcallback%3Fclient_id%3Dmy_account_local%26redirect_uri%3Dhttps%253A%252F%252Fmyaccount.ctaima.com%26response_type%3Did_token%2520token%26scope%3Dopenid%2520profile%2520email%2520Abacus.read_product%26nonce%3DN0.405965576346192241756710652344%26state%3D17567106520800.5509632605791698',
      description: 'Sistema de coordinación de actividades'
    },
    { 
      type: 'ecoordina', 
      name: 'Ecoordina', 
      color: 'bg-purple-600',
      url: 'https://login.welcometotwind.io/junoprod.onmicrosoft.com/b2c_1a_signup_signin/oauth2/v2.0/authorize?client_id=b2a08c2d-92b8-48c6-8fef-b7358a110496&scope=openid%20profile%20offline_access&redirect_uri=https%3A%2F%2Fwelcometotwind.io%2F&client-request-id=76a43f68-c14b-40f3-b69c-0fb721c597f8&response_mode=fragment&response_type=code&x-client-SKU=msal.js.browser&x-client-VER=2.38.0&client_info=1&code_challenge=v5ig0AtC6pVVrqljy_BylnvEbolLoaYEwgkG_kjpdro&code_challenge_method=S256&nonce=4e4dccec-a6ff-4193-8c19-285a4908d6be&state=eyJpZCI6ImNmNTRiY2IwLTAzMTctNDNhMC1hYjU0LWRjNTUzMTk5YjBjMiIsIm1ldGEiOnsiaW50ZXJhY3Rpb25UeXBlIjoicmVkaXJlY3QifX0%3D',
      description: 'Plataforma de coordinación empresarial'
    }
  ];

  const togglePasswordVisibility = (credentialId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [credentialId]: !prev[credentialId]
    }));
  };

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const getPlatformInfo = (type: string) => {
    return platforms.find(p => p.type === type) || platforms[0];
  };

  const getCredentialForPlatform = (platformType: string): PlatformCredential | null => {
    return client.platform_credentials.find(cred => cred.platform_type === platformType) || null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white/20 p-3 rounded-full mr-4">
                <Key className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Credenciales de Plataformas CAE</h2>
                <p className="text-purple-100">
                  {client.client_name} • {client.client_email}
                </p>
                <p className="text-sm text-purple-200">
                  Credenciales operativas para acceso directo a plataformas
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Client Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <Building2 className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <h3 className="font-semibold text-blue-800">{client.client_name}</h3>
                <p className="text-sm text-blue-700">{client.client_email}</p>
                <p className="text-xs text-blue-600">
                  {client.total_documents} documentos • {client.companies.length} empresa(s)
                </p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-800 mb-2">Instrucciones de Uso</h4>
                <ol className="text-sm text-yellow-700 space-y-1">
                  <li>1. Copia las credenciales usando los botones "Copiar"</li>
                  <li>2. Abre la plataforma en nueva pestaña usando "Abrir Plataforma"</li>
                  <li>3. Inicia sesión con las credenciales copiadas</li>
                  <li>4. Sube los documentos manualmente desde la cola</li>
                  <li>5. Actualiza el estado en ConstructIA una vez completado</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Platform Credentials */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {platforms.map((platform) => {
              const credential = getCredentialForPlatform(platform.type);
              const credentialKey = `${client.client_id}-${platform.type}`;
              
              return (
                <div key={platform.type} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Platform Header */}
                  <div className={`${platform.color} text-white p-4`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Globe className="h-6 w-6 mr-3" />
                        <div>
                          <h3 className="font-semibold">{platform.name}</h3>
                          <p className="text-sm opacity-90">{platform.description}</p>
                        </div>
                      </div>
                      <a
                        href={platform.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
                        title="Abrir plataforma"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>

                  {/* Credentials Content */}
                  <div className="p-4">
                    {credential ? (
                      <div className="space-y-4">
                        {/* Status */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Estado:</span>
                          <div className="flex items-center">
                            {credential.is_active ? (
                              <>
                                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                                <span className="text-sm text-green-600">Configurado</span>
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="h-4 w-4 text-yellow-500 mr-1" />
                                <span className="text-sm text-yellow-600">Inactivo</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Username */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Usuario
                          </label>
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 flex items-center bg-gray-50 p-3 rounded-lg border">
                              <User className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-gray-900 font-mono flex-1">
                                {credential.username}
                              </span>
                            </div>
                            <button
                              onClick={() => copyToClipboard(credential.username, `${credentialKey}-username`)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm flex items-center"
                              title="Copiar usuario"
                            >
                              {copiedField === `${credentialKey}-username` ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Password */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Contraseña
                          </label>
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 flex items-center bg-gray-50 p-3 rounded-lg border">
                              <Lock className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-gray-900 font-mono flex-1">
                                {showPasswords[credentialKey] ? credential.password : '••••••••••••••••'}
                              </span>
                              <button
                                onClick={() => togglePasswordVisibility(credentialKey)}
                                className="ml-2 text-gray-400 hover:text-gray-600"
                              >
                                {showPasswords[credentialKey] ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                            <button
                              onClick={() => copyToClipboard(credential.password, `${credentialKey}-password`)}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm flex items-center"
                              title="Copiar contraseña"
                            >
                              {copiedField === `${credentialKey}-password` ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              copyToClipboard(credential.username, `${credentialKey}-username`);
                              setTimeout(() => {
                                copyToClipboard(credential.password, `${credentialKey}-password`);
                              }, 500);
                            }}
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm flex items-center justify-center"
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copiar Todo
                          </button>
                          <a
                            href={platform.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm flex items-center justify-center"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Abrir
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
                        <h4 className="font-semibold text-gray-900 mb-2">Sin Credenciales</h4>
                        <p className="text-sm text-gray-600 mb-4">
                          Este cliente no ha configurado credenciales para {platform.name}
                        </p>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                          <p className="text-xs text-gray-500">
                            El cliente debe configurar sus credenciales desde su panel de configuración
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <h4 className="font-semibold text-green-800">Resumen de Credenciales</h4>
                <p className="text-sm text-green-700">
                  {client.platform_credentials.filter(c => c.is_active).length} de {platforms.length} plataformas configuradas correctamente
                </p>
                <div className="mt-2 flex space-x-4 text-xs text-green-600">
                  <span>• Credenciales encriptadas y seguras</span>
                  <span>• Acceso directo a plataformas CAE</span>
                  <span>• Validación automática de estado</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-xl border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-600">
              <Key className="h-4 w-4 mr-2" />
              <span>Credenciales operativas para gestión manual de documentos</span>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  // Copy all credentials summary
                  const summary = client.platform_credentials.map(cred => 
                    `${getPlatformInfo(cred.platform_type).name}:\nUsuario: ${cred.username}\nContraseña: ${cred.password}\n`
                  ).join('\n');
                  copyToClipboard(summary, 'all-credentials');
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm flex items-center"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copiar Todas
              </button>
              <button
                onClick={onClose}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}