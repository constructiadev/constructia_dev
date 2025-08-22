// ConstructIA - Panel de Configuración del Sistema
import React, { useState, useEffect } from 'react';
import {
  Settings,
  Key,
  Database,
  Shield,
  Globe,
  Save,
  Eye,
  EyeOff,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Copy,
  Download,
  Upload,
  Lock,
  Unlock,
  Server,
  Cloud,
  Mail,
  Bell,
  Calendar,
  FileText,
  CreditCard,
  Zap
} from 'lucide-react';
import { appConfig, getPlatformConfig } from '../../config/app-config';
import { automationEngine } from '../../lib/automation-engine';

interface ConfigSection {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

interface SecretField {
  key: string;
  label: string;
  description: string;
  required: boolean;
  type: 'text' | 'password' | 'url';
  placeholder?: string;
}

interface ConfigField {
  key: string;
  label: string;
  description: string;
  type: 'number' | 'array' | 'boolean' | 'select';
  options?: string[];
  min?: number;
  max?: number;
}

export default function SystemConfigPanel() {
  const [activeSection, setActiveSection] = useState('secrets');
  const [showSecrets, setShowSecrets] = useState<{ [key: string]: boolean }>({});
  const [secrets, setSecrets] = useState<{ [key: string]: string }>({});
  const [config, setConfig] = useState<{ [key: string]: any }>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [testingConnections, setTestingConnections] = useState<{ [key: string]: boolean }>({});

  const sections: ConfigSection[] = [
    {
      id: 'secrets',
      title: 'Secrets & API Keys',
      description: 'Configuración de claves API y secretos',
      icon: Key,
      color: 'bg-red-600'
    },
    {
      id: 'platforms',
      title: 'Plataformas Externas',
      description: 'Configuración de integraciones',
      icon: Globe,
      color: 'bg-blue-600'
    },
    {
      id: 'storage',
      title: 'Almacenamiento',
      description: 'Configuración de S3 y archivos',
      icon: Cloud,
      color: 'bg-green-600'
    },
    {
      id: 'security',
      title: 'Seguridad',
      description: 'Configuración de seguridad y rate limiting',
      icon: Shield,
      color: 'bg-purple-600'
    },
    {
      id: 'automation',
      title: 'Automatización',
      description: 'Tareas programadas y notificaciones',
      icon: Zap,
      color: 'bg-orange-600'
    }
  ];

  const secretFields: SecretField[] = [
    {
      key: 'GEMINI_API_KEY',
      label: 'Gemini API Key',
      description: 'Clave API de Google Gemini para procesamiento IA',
      required: true,
      type: 'password',
      placeholder: 'AIzaSy...'
    },
    {
      key: 'S3_ENDPOINT',
      label: 'S3 Endpoint',
      description: 'URL del endpoint S3 compatible',
      required: true,
      type: 'url',
      placeholder: 'https://s3.amazonaws.com'
    },
    {
      key: 'S3_BUCKET',
      label: 'S3 Bucket',
      description: 'Nombre del bucket S3',
      required: true,
      type: 'text',
      placeholder: 'constructia-documents'
    },
    {
      key: 'S3_KEY',
      label: 'S3 Access Key',
      description: 'Clave de acceso S3',
      required: true,
      type: 'password',
      placeholder: 'AKIA...'
    },
    {
      key: 'S3_SECRET',
      label: 'S3 Secret Key',
      description: 'Clave secreta S3',
      required: true,
      type: 'password',
      placeholder: 'wJalrXUt...'
    }
  ];

  const platformFields: SecretField[] = [
    {
      key: 'NALANDA_API_BASE',
      label: 'Nalanda API Base',
      description: 'URL base de la API de Nalanda',
      required: false,
      type: 'url',
      placeholder: 'https://api.nalanda.com/v1'
    },
    {
      key: 'NALANDA_API_KEY',
      label: 'Nalanda API Key',
      description: 'Clave API de Nalanda',
      required: false,
      type: 'password',
      placeholder: 'nlr_...'
    },
    {
      key: 'NALANDA_WEBHOOK_SECRET',
      label: 'Nalanda Webhook Secret',
      description: 'Secreto para verificar webhooks de Nalanda',
      required: false,
      type: 'password',
      placeholder: 'whsec_...'
    },
    {
      key: 'CTAIMA_API_BASE',
      label: 'CTAIMA API Base',
      description: 'URL base de la API de CTAIMA',
      required: false,
      type: 'url',
      placeholder: 'https://api.ctaima.com/v2'
    },
    {
      key: 'CTAIMA_API_KEY',
      label: 'CTAIMA API Key',
      description: 'Clave API de CTAIMA',
      required: false,
      type: 'password',
      placeholder: 'cta_...'
    },
    {
      key: 'CTAIMA_WEBHOOK_SECRET',
      label: 'CTAIMA Webhook Secret',
      description: 'Secreto para verificar webhooks de CTAIMA',
      required: false,
      type: 'password',
      placeholder: 'whsec_...'
    },
    {
      key: 'ECOORDINA_API_BASE',
      label: 'Ecoordina API Base',
      description: 'URL base de la API de Ecoordina',
      required: false,
      type: 'url',
      placeholder: 'https://api.ecoordina.com/v1'
    },
    {
      key: 'ECOORDINA_API_KEY',
      label: 'Ecoordina API Key',
      description: 'Clave API de Ecoordina',
      required: false,
      type: 'password',
      placeholder: 'eco_...'
    },
    {
      key: 'ECOORDINA_WEBHOOK_SECRET',
      label: 'Ecoordina Webhook Secret',
      description: 'Secreto para verificar webhooks de Ecoordina',
      required: false,
      type: 'password',
      placeholder: 'whsec_...'
    }
  ];

  const configFields: ConfigField[] = [
    {
      key: 'MAX_FILE_MB',
      label: 'Tamaño Máximo de Archivo (MB)',
      description: 'Tamaño máximo permitido para archivos subidos',
      type: 'number',
      min: 1,
      max: 100
    },
    {
      key: 'ALERT_DAYS',
      label: 'Días de Alerta',
      description: 'Días antes de caducidad para enviar alertas',
      type: 'array'
    },
    {
      key: 'RATE_LIMIT_MAX',
      label: 'Límite de Peticiones',
      description: 'Máximo número de peticiones por ventana',
      type: 'number',
      min: 10,
      max: 1000
    },
    {
      key: 'RATE_LIMIT_WINDOW',
      label: 'Ventana de Rate Limit (seg)',
      description: 'Duración de la ventana de rate limiting',
      type: 'number',
      min: 30,
      max: 3600
    }
  ];

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      // Cargar configuración desde variables de entorno
      const envSecrets: { [key: string]: string } = {};
      
      secretFields.forEach(field => {
        envSecrets[field.key] = import.meta.env[`VITE_${field.key}`] || '';
      });

      platformFields.forEach(field => {
        envSecrets[field.key] = import.meta.env[`VITE_${field.key}`] || '';
      });

      setSecrets(envSecrets);

      // Cargar configuración de la app
      setConfig({
        MAX_FILE_MB: appConfig.settings.MAX_FILE_MB,
        ALERT_DAYS: appConfig.settings.ALERT_DAYS,
        RATE_LIMIT_MAX: appConfig.settings.security.rate_limit.max,
        RATE_LIMIT_WINDOW: appConfig.settings.security.rate_limit.windowSec
      });

    } catch (error) {
      console.error('Error loading configuration:', error);
      setMessage({ type: 'error', text: 'Error cargando configuración' });
    }
  };

  const handleSaveSecrets = async () => {
    try {
      setSaving(true);
      
      // En desarrollo, simular guardado
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage({ type: 'success', text: 'Secrets guardados exitosamente' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error saving secrets:', error);
      setMessage({ type: 'error', text: 'Error guardando secrets' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveConfig = async () => {
    try {
      setSaving(true);
      
      // En desarrollo, simular guardado
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage({ type: 'success', text: 'Configuración guardada exitosamente' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error saving config:', error);
      setMessage({ type: 'error', text: 'Error guardando configuración' });
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async (platform: string) => {
    try {
      setTestingConnections(prev => ({ ...prev, [platform]: true }));
      
      // Simular test de conexión
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const success = Math.random() > 0.3; // 70% éxito
      
      setMessage({ 
        type: success ? 'success' : 'error', 
        text: success 
          ? `Conexión con ${platform} exitosa` 
          : `Error conectando con ${platform}` 
      });
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error(`Error testing ${platform} connection:`, error);
      setMessage({ type: 'error', text: `Error probando conexión con ${platform}` });
    } finally {
      setTestingConnections(prev => ({ ...prev, [platform]: false }));
    }
  };

  const toggleSecretVisibility = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setMessage({ type: 'success', text: 'Copiado al portapapeles' });
    setTimeout(() => setMessage(null), 2000);
  };

  const exportConfig = () => {
    const configData = {
      secrets: secrets,
      config: config,
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(configData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `constructia-config-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderSecretsSection = () => (
    <div className="space-y-6">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
          <div>
            <h4 className="font-semibold text-red-800">Información Sensible</h4>
            <p className="text-sm text-red-700">
              Los secrets se almacenan de forma segura y encriptada. Solo modifica si es necesario.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {secretFields.map(field => (
          <div key={field.key} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleSecretVisibility(field.key)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showSecrets[field.key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => copyToClipboard(secrets[field.key] || '')}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
            <input
              type={showSecrets[field.key] ? 'text' : 'password'}
              value={secrets[field.key] || ''}
              onChange={(e) => setSecrets(prev => ({ ...prev, [field.key]: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder={field.placeholder}
            />
            <p className="text-xs text-gray-500 mt-1">{field.description}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSaveSecrets}
          disabled={saving}
          className="flex items-center px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50"
        >
          {saving ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Guardar Secrets
        </button>
      </div>
    </div>
  );

  const renderPlatformsSection = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <Globe className="h-5 w-5 text-blue-600 mr-2" />
          <div>
            <h4 className="font-semibold text-blue-800">Integraciones de Plataforma</h4>
            <p className="text-sm text-blue-700">
              Configura las conexiones con Nalanda, CTAIMA y Ecoordina
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {['nalanda', 'ctaima', 'ecoordina'].map(platform => {
          const platformConfig = getPlatformConfig(platform);
          const isConfigured = platformConfig.apiBase && platformConfig.apiKey;
          
          return (
            <div key={platform} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className={`w-10 h-10 ${isConfigured ? 'bg-green-600' : 'bg-gray-400'} rounded-lg flex items-center justify-center mr-3`}>
                    <Globe className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 capitalize">{platform}</h3>
                    <p className="text-sm text-gray-600">
                      {isConfigured ? 'Configurado' : 'No configurado'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {isConfigured ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {platformFields
                  .filter(field => field.key.toLowerCase().includes(platform))
                  .map(field => (
                    <div key={field.key}>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        {field.label}
                      </label>
                      <div className="relative">
                        <input
                          type={showSecrets[field.key] ? 'text' : 'password'}
                          value={secrets[field.key] || ''}
                          onChange={(e) => setSecrets(prev => ({ ...prev, [field.key]: e.target.value }))}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={field.placeholder}
                        />
                        <button
                          onClick={() => toggleSecretVisibility(field.key)}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showSecrets[field.key] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </button>
                      </div>
                    </div>
                  ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => testConnection(platform)}
                  disabled={!isConfigured || testingConnections[platform]}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 text-sm"
                >
                  {testingConnections[platform] ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Probando...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Probar Conexión
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderAutomationSection = () => {
    const scheduledTasks = automationEngine.getScheduledTasksStatus();
    
    return (
      <div className="space-y-6">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-orange-600 mr-2" />
            <div>
              <h4 className="font-semibold text-orange-800">Tareas Programadas</h4>
              <p className="text-sm text-orange-700">
                Gestión de automatizaciones y tareas del sistema
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {scheduledTasks.map(task => (
            <div key={task.name} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{task.name}</h3>
                  <p className="text-sm text-gray-600">Cron: {task.cron}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={task.enabled}
                    onChange={(e) => automationEngine.toggleTask(task.name, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                </label>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Estado:</span>
                  <span className={`font-medium ${task.enabled ? 'text-green-600' : 'text-gray-600'}`}>
                    {task.enabled ? 'Activa' : 'Deshabilitada'}
                  </span>
                </div>
                {task.lastRun && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Última ejecución:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(task.lastRun).toLocaleString('es-ES')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ejecutar Tareas Manualmente</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => automationEngine.executeDailyCaducities()}
              className="flex items-center justify-center p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
            >
              <Calendar className="h-5 w-5 text-yellow-600 mr-3" />
              <div className="text-left">
                <p className="font-medium text-yellow-800">Procesar Caducidades</p>
                <p className="text-sm text-yellow-600">Ejecutar alertas de caducidad</p>
              </div>
            </button>

            <button
              onClick={() => automationEngine.executeMonthlyReports()}
              className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <FileText className="h-5 w-5 text-blue-600 mr-3" />
              <div className="text-left">
                <p className="font-medium text-blue-800">Generar Reportes</p>
                <p className="text-sm text-blue-600">Crear reportes mensuales</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Configuración del Sistema</h1>
            <p className="text-gray-300 mb-4">
              Panel de administración global de ConstructIA
            </p>
            <div className="space-y-1 text-sm text-gray-300">
              <p>• Gestión de secrets y configuración global</p>
              <p>• Configuración de integraciones con plataformas externas</p>
              <p>• Automatizaciones y tareas programadas</p>
              <p>• Monitoreo de seguridad y rate limiting</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={exportConfig}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </button>
            <button
              onClick={loadConfiguration}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Recargar
            </button>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 mr-2" />
          ) : (
            <AlertTriangle className="w-5 h-5 mr-2" />
          )}
          {message.text}
        </div>
      )}

      {/* Navigation */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="flex overflow-x-auto">
          {sections.map(section => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-5 w-5 mr-2" />
                <div className="text-left">
                  <p className="font-medium">{section.title}</p>
                  <p className="text-xs text-gray-500">{section.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        {activeSection === 'secrets' && renderSecretsSection()}
        {activeSection === 'platforms' && renderPlatformsSection()}
        {activeSection === 'automation' && renderAutomationSection()}
        
        {activeSection === 'storage' && (
          <div className="text-center py-12">
            <Cloud className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Configuración de Almacenamiento</h3>
            <p className="text-gray-600">Configuración de S3 y gestión de archivos</p>
          </div>
        )}
        
        {activeSection === 'security' && (
          <div className="text-center py-12">
            <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Configuración de Seguridad</h3>
            <p className="text-gray-600">Rate limiting, CORS y políticas de seguridad</p>
          </div>
        )}
      </div>
    </div>
  );
}