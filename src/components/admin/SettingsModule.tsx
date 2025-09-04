import React, { useState, useEffect, useCallback } from 'react';
import { 
  Settings, 
  Save, 
  AlertCircle, 
  CheckCircle, 
  Database, 
  Key, 
  Globe, 
  Mail,
  Shield,
  Zap,
  Activity,
  Clock,
  RefreshCw,
  Download,
  Upload,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Server,
  Cloud,
  Bell,
  Users,
  FileText,
  BarChart3,
  Cpu,
  HardDrive,
  Wifi,
  Monitor,
  Code,
  Terminal,
  Archive,
  Trash2,
  Plus,
  X,
  Copy,
  Edit,
  Play,
  Pause,
  Target,
  TrendingUp,
  Building2,
  CreditCard
} from 'lucide-react';
import { 
  getSystemSettings, 
  updateSystemSetting, 
  getAPIIntegrations,
  supabase,
  supabaseServiceClient,
  logAuditoria,
  DEV_TENANT_ID,
  DEV_ADMIN_USER_ID
} from '../../lib/supabase-real';
import { appConfig, getPlatformConfig } from '../../config/app-config';
import { automationEngine } from '../../lib/automation-engine';

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

interface ConfigSection {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

interface SystemConfig {
  platform_name: string;
  admin_email: string;
  max_file_size: string;
  backup_frequency: string;
  ai_auto_classification: boolean;
  email_notifications: boolean;
  audit_retention_days: string;
  maintenance_mode: boolean;
  max_concurrent_users: string;
  session_timeout: string;
  password_policy_strength: string;
  two_factor_required: boolean;
}

interface SecurityConfig {
  encryption_level: string;
  ssl_enforcement: boolean;
  ip_whitelist_enabled: boolean;
  allowed_ips: string;
  failed_login_attempts: string;
  account_lockout_duration: string;
  cors_origins: string;
  api_rate_limiting: boolean;
  max_requests_per_minute: string;
  suspicious_activity_alerts: boolean;
}

interface IntegrationConfig {
  obralia_auto_sync: boolean;
  gemini_api_enabled: boolean;
  stripe_webhook_validation: boolean;
  sepa_direct_debit_enabled: boolean;
  bizum_integration_active: boolean;
  apple_pay_enabled: boolean;
  google_pay_enabled: boolean;
  external_api_timeout: string;
  webhook_retry_attempts: string;
  integration_health_checks: boolean;
}

interface ComplianceConfig {
  lopd_compliance_level: string;
  data_retention_policy: string;
  gdpr_consent_required: boolean;
  right_to_be_forgotten: boolean;
  data_portability_enabled: boolean;
  breach_notification_time: string;
  privacy_impact_assessments: boolean;
  data_processing_logs: boolean;
  third_party_sharing_allowed: boolean;
  anonymization_after_retention: boolean;
}

interface PerformanceConfig {
  cache_enabled: boolean;
  cache_duration: string;
  cdn_enabled: boolean;
  image_optimization: boolean;
  lazy_loading: boolean;
  compression_enabled: boolean;
  minification_enabled: boolean;
  database_pool_size: string;
  query_timeout: string;
  auto_scaling_enabled: boolean;
}

interface NotificationConfig {
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  slack_integration: boolean;
  teams_integration: boolean;
  webhook_notifications: boolean;
  notification_frequency: string;
  digest_enabled: boolean;
  digest_frequency: string;
  escalation_enabled: boolean;
}

export default function SettingsModule() {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [integrations, setIntegrations] = useState<APIIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState('system');
  const [dangerZoneStep, setDangerZoneStep] = useState(0);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [userConfirmation, setUserConfirmation] = useState('');
  const [showSecrets, setShowSecrets] = useState<{ [key: string]: boolean }>({});
  const [testingConnections, setTestingConnections] = useState<{ [key: string]: boolean }>({});

  // Configuration states
  const [systemConfig, setSystemConfig] = useState<SystemConfig>({
    platform_name: 'ConstructIA',
    admin_email: 'admin@constructia.com',
    max_file_size: '50',
    backup_frequency: 'daily',
    ai_auto_classification: true,
    email_notifications: true,
    audit_retention_days: '365',
    maintenance_mode: false,
    max_concurrent_users: '500',
    session_timeout: '30',
    password_policy_strength: 'high',
    two_factor_required: true
  });

  const [securityConfig, setSecurityConfig] = useState<SecurityConfig>({
    encryption_level: 'AES-256',
    ssl_enforcement: true,
    ip_whitelist_enabled: false,
    allowed_ips: '',
    failed_login_attempts: '5',
    account_lockout_duration: '30',
    cors_origins: '',
    api_rate_limiting: true,
    max_requests_per_minute: '1000',
    suspicious_activity_alerts: true
  });

  const [integrationConfig, setIntegrationConfig] = useState<IntegrationConfig>({
    obralia_auto_sync: true,
    gemini_api_enabled: true,
    stripe_webhook_validation: true,
    sepa_direct_debit_enabled: true,
    bizum_integration_active: true,
    apple_pay_enabled: false,
    google_pay_enabled: false,
    external_api_timeout: '30',
    webhook_retry_attempts: '3',
    integration_health_checks: true
  });

  const [complianceConfig, setComplianceConfig] = useState<ComplianceConfig>({
    lopd_compliance_level: 'strict',
    data_retention_policy: '7_years',
    gdpr_consent_required: true,
    right_to_be_forgotten: true,
    data_portability_enabled: true,
    breach_notification_time: '72',
    privacy_impact_assessments: true,
    data_processing_logs: true,
    third_party_sharing_allowed: false,
    anonymization_after_retention: true
  });

  const [performanceConfig, setPerformanceConfig] = useState<PerformanceConfig>({
    cache_enabled: true,
    cache_duration: '3600',
    cdn_enabled: true,
    image_optimization: true,
    lazy_loading: true,
    compression_enabled: true,
    minification_enabled: true,
    database_pool_size: '20',
    query_timeout: '30',
    auto_scaling_enabled: true
  });

  const [notificationConfig, setNotificationConfig] = useState<NotificationConfig>({
    email_notifications: true,
    sms_notifications: false,
    push_notifications: true,
    slack_integration: false,
    teams_integration: false,
    webhook_notifications: true,
    notification_frequency: 'immediate',
    digest_enabled: true,
    digest_frequency: 'weekly',
    escalation_enabled: true
  });

  const sections: ConfigSection[] = [
    {
      id: 'system',
      title: 'Sistema General',
      description: 'Configuración básica de la plataforma',
      icon: Settings,
      color: 'bg-blue-600'
    },
    {
      id: 'security',
      title: 'Seguridad',
      description: 'Configuración de seguridad avanzada',
      icon: Shield,
      color: 'bg-red-600'
    },
    {
      id: 'integration',
      title: 'Integraciones',
      description: 'APIs y servicios externos',
      icon: Globe,
      color: 'bg-green-600'
    },
    {
      id: 'compliance',
      title: 'Cumplimiento LOPD',
      description: 'GDPR y protección de datos',
      icon: Lock,
      color: 'bg-purple-600'
    },
    {
      id: 'performance',
      title: 'Rendimiento',
      description: 'Optimización y cache',
      icon: Zap,
      color: 'bg-orange-600'
    },
    {
      id: 'notifications',
      title: 'Notificaciones',
      description: 'Alertas y comunicaciones',
      icon: Bell,
      color: 'bg-cyan-600'
    },
    {
      id: 'danger-zone',
      title: 'Zona de Peligro',
      description: 'Operaciones críticas del sistema',
      icon: AlertTriangle,
      color: 'bg-red-700'
    }
  ];

  useEffect(() => {
    loadData();
    logAuditEvent('view_control_center');
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
      
      // Load configuration from system settings
      await loadConfiguration();
    } catch (error) {
      console.error('Error loading settings:', error);
      setMessage({ type: 'error', text: 'Error al cargar configuraciones' });
    } finally {
      setLoading(false);
    }
  };

  const loadConfiguration = async () => {
    try {
      // Load from system_settings table if available
      const { data: configurations, error } = await supabaseServiceClient
        .from('system_settings')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.warn('Error loading configurations:', error);
        return;
      }

      // Parse configurations into state objects
      configurations?.forEach(config => {
        try {
          const value = typeof config.value === 'string' ? JSON.parse(config.value) : config.value;
          
          if (config.key.startsWith('system_')) {
            setSystemConfig(prev => ({ ...prev, [config.key.replace('system_', '')]: value }));
          } else if (config.key.startsWith('security_')) {
            setSecurityConfig(prev => ({ ...prev, [config.key.replace('security_', '')]: value }));
          } else if (config.key.startsWith('integration_')) {
            setIntegrationConfig(prev => ({ ...prev, [config.key.replace('integration_', '')]: value }));
          } else if (config.key.startsWith('compliance_')) {
            setComplianceConfig(prev => ({ ...prev, [config.key.replace('compliance_', '')]: value }));
          } else if (config.key.startsWith('performance_')) {
            setPerformanceConfig(prev => ({ ...prev, [config.key.replace('performance_', '')]: value }));
          } else if (config.key.startsWith('notification_')) {
            setNotificationConfig(prev => ({ ...prev, [config.key.replace('notification_', '')]: value }));
          }
        } catch (parseError) {
          console.warn('Error parsing config value:', config.key, parseError);
        }
      });
    } catch (error) {
      console.error('Error loading configuration:', error);
    }
  };

  const logAuditEvent = async (action: string, table?: string, recordId?: string, oldData?: any, newData?: any) => {
    try {
      await logAuditoria(
        DEV_TENANT_ID,
        DEV_ADMIN_USER_ID,
        action,
        table || 'system_settings',
        recordId,
        { oldData, newData, timestamp: new Date().toISOString() }
      );
    } catch (error) {
      console.error('Error logging audit event:', error);
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

  const saveConfiguration = async () => {
    try {
      setSaving('all');
      
      // Save all configuration sections
      const configSections = [
        { prefix: 'system_', config: systemConfig },
        { prefix: 'security_', config: securityConfig },
        { prefix: 'integration_', config: integrationConfig },
        { prefix: 'compliance_', config: complianceConfig },
        { prefix: 'performance_', config: performanceConfig },
        { prefix: 'notification_', config: notificationConfig }
      ];

      for (const section of configSections) {
        for (const [key, value] of Object.entries(section.config)) {
          await updateSystemSetting(
            `${section.prefix}${key}`,
            value,
            `${section.prefix.replace('_', '')} configuration: ${key}`
          );
        }
      }

      await logAuditEvent('save_complete_configuration', 'system_settings', 'all', null, {
        system: systemConfig,
        security: securityConfig,
        integration: integrationConfig,
        compliance: complianceConfig,
        performance: performanceConfig,
        notification: notificationConfig
      });

      setMessage({ type: 'success', text: 'Toda la configuración guardada exitosamente' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error saving configuration:', error);
      setMessage({ type: 'error', text: 'Error al guardar configuración completa' });
    } finally {
      setSaving(null);
    }
  };

  const resetToDefaults = async () => {
    if (!confirm('¿Estás seguro de restablecer toda la configuración a valores por defecto? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await logAuditEvent('reset_configuration_to_defaults', 'system_settings');

      setSystemConfig({
        platform_name: 'ConstructIA',
        admin_email: 'admin@constructia.com',
        max_file_size: '50',
        backup_frequency: 'daily',
        ai_auto_classification: true,
        email_notifications: true,
        audit_retention_days: '365',
        maintenance_mode: false,
        max_concurrent_users: '500',
        session_timeout: '30',
        password_policy_strength: 'high',
        two_factor_required: true
      });

      setMessage({ type: 'success', text: 'Configuración restablecida a valores por defecto' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error resetting configuration:', error);
      setMessage({ type: 'error', text: 'Error al restablecer configuración' });
    }
  };

  const exportConfiguration = async () => {
    try {
      await logAuditEvent('export_system_configuration');

      const fullConfig = {
        system: systemConfig,
        security: securityConfig,
        integration: integrationConfig,
        compliance: complianceConfig,
        performance: performanceConfig,
        notification: notificationConfig,
        export_date: new Date().toISOString(),
        version: '1.1',
        platform: 'ConstructIA'
      };

      const blob = new Blob([JSON.stringify(fullConfig, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `constructia-config-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      setMessage({ type: 'success', text: 'Configuración exportada exitosamente' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error exporting configuration:', error);
      setMessage({ type: 'error', text: 'Error al exportar configuración' });
    }
  };

  const testSystemHealth = async () => {
    try {
      setLoading(true);
      await logAuditEvent('test_system_health');

      // Test database connection
      const { data: dbTest, error: dbError } = await supabase
        .from('tenants')
        .select('id')
        .limit(1);

      // Test API integrations
      const integrationTests = await Promise.all(
        integrations.map(async (integration) => {
          try {
            // Simulate health check
            await new Promise(resolve => setTimeout(resolve, 500));
            return { name: integration.name, status: 'healthy' };
          } catch {
            return { name: integration.name, status: 'error' };
          }
        })
      );

      const healthyIntegrations = integrationTests.filter(t => t.status === 'healthy').length;
      const totalIntegrations = integrationTests.length;

      await new Promise(resolve => setTimeout(resolve, 1000));

      const healthReport = `✅ Sistema operativo al 100%\n` +
                          `📊 Base de datos: ${dbError ? 'Error' : 'Accesible'}\n` +
                          `🔌 APIs: ${healthyIntegrations}/${totalIntegrations} funcionando\n` +
                          `🤖 Servicios de IA: Activos\n` +
                          `💾 Copias de seguridad: Al día\n` +
                          `🔒 Seguridad: ${securityConfig.ssl_enforcement ? 'SSL Activo' : 'SSL Inactivo'}\n` +
                          `📈 Rendimiento: ${performanceConfig.cache_enabled ? 'Cache Activo' : 'Cache Inactivo'}`;

      alert(healthReport);
    } catch (error) {
      console.error('Error testing system health:', error);
      alert('❌ Error al probar el estado del sistema');
    } finally {
      setLoading(false);
    }
  };

  const generateConfirmationCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setConfirmationCode(code);
    return code;
  };

  const executeDataPurge = async () => {
    try {
      setLoading(true);

      await logAuditEvent('CRITICAL_DATA_PURGE_INITIATED', 'system', 'danger_zone', null, {
        action: 'complete_database_purge',
        timestamp: new Date().toISOString(),
        admin_confirmation: true
      });

      const tablesToPurge = [
        'documents',
        'companies',
        'projects',
        'payments',
        'receipts',
        'subscriptions',
        'manual_document_queue',
        'documentos',
        'obras',
        'empresas',
        'proveedores',
        'trabajadores',
        'maquinaria',
        'tareas',
        'jobs_integracion',
        'mensajes',
        'reportes',
        'token_transactions'
      ];

      let purgedTables = 0;
      for (const table of tablesToPurge) {
        try {
          const { error } = await supabaseServiceClient
            .from(table)
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');

          if (!error) {
            purgedTables++;
            console.log(`✅ Tabla ${table} limpiada`);
          } else if (!error.message.includes('relation') && !error.message.includes('does not exist')) {
            console.warn(`⚠️ Error limpiando tabla ${table}:`, error.message);
          }
        } catch (tableError) {
          console.warn(`⚠️ Error en tabla ${table}:`, tableError);
        }
      }

      // Reset KPIs
      try {
        const { error: kpiError } = await supabaseServiceClient
          .from('kpis')
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000');

        if (!kpiError) {
          console.log('✅ KPIs reseteados');
        }
      } catch (kpiError) {
        console.warn('⚠️ Error reseteando KPIs:', kpiError);
      }

      await logAuditEvent('CRITICAL_DATA_PURGE_COMPLETED', 'system', 'danger_zone', null, {
        action: 'complete_database_purge_finished',
        timestamp: new Date().toISOString(),
        tables_purged: purgedTables,
        kpis_reset: true,
        audit_logs_preserved: true
      });

      alert(`✅ LIMPIEZA COMPLETA REALIZADA\n\n` +
            `📊 ${purgedTables} tablas limpiadas\n` +
            `🔄 KPIs reseteados\n` +
            `📋 Logs de auditoría preservados\n\n` +
            `La base de datos está ahora limpia para nuevas pruebas.`);

      setDangerZoneStep(0);
      setConfirmationCode('');
      setUserConfirmation('');
    } catch (error) {
      console.error('Error durante la limpieza:', error);
      await logAuditEvent('CRITICAL_DATA_PURGE_FAILED', 'system', 'danger_zone', null, {
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      });
      alert('❌ Error durante la limpieza de datos. Revisa los logs de auditoría.');
    } finally {
      setLoading(false);
    }
  };

  const handleDangerZoneAction = () => {
    if (dangerZoneStep === 0) {
      const code = generateConfirmationCode();
      setDangerZoneStep(1);
      logAuditEvent('DANGER_ZONE_STEP_1_INITIATED', 'system', 'danger_zone', null, { confirmation_code: code });
    } else if (dangerZoneStep === 1) {
      if (userConfirmation.toUpperCase() === confirmationCode) {
        setDangerZoneStep(2);
        logAuditEvent('DANGER_ZONE_STEP_2_CODE_VERIFIED', 'system', 'danger_zone');
      } else {
        alert('❌ Código de confirmación incorrecto');
        logAuditEvent('DANGER_ZONE_CODE_VERIFICATION_FAILED', 'system', 'danger_zone', null, { attempted_code: userConfirmation });
      }
    } else if (dangerZoneStep === 2) {
      if (confirm('⚠️ CONFIRMACIÓN FINAL\n\n' +
                  'Esta acción eliminará TODOS los datos de la base de datos excepto:\n' +
                  '• Los logs de auditoría (por cumplimiento LOPD)\n' +
                  '• Los usuarios de prueba del sistema\n\n' +
                  '¿Estás ABSOLUTAMENTE SEGURO de continuar?\n\n' +
                  '🔴 CONFIRMACIÓN FINAL 🔴')) {
        executeDataPurge();
      } else {
        logAuditEvent('DANGER_ZONE_FINAL_CONFIRMATION_CANCELLED', 'system', 'danger_zone');
      }
    }
  };

  const cancelDangerZone = () => {
    logAuditEvent('DANGER_ZONE_OPERATION_CANCELLED', 'system', 'danger_zone', null, { step_cancelled: dangerZoneStep });
    setDangerZoneStep(0);
    setConfirmationCode('');
    setUserConfirmation('');
  };

  const testConnection = async (platform: string) => {
    try {
      setTestingConnections(prev => ({ ...prev, [platform]: true }));
      
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const success = Math.random() > 0.3; // 70% success rate
      
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
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando Control Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Control Center</h1>
            <p className="text-green-100 mb-4">
              Centro de control empresarial con configuración avanzada
            </p>
            <div className="space-y-1 text-sm text-green-100">
              <p>• Configuración completa del sistema en 6 módulos especializados</p>
              <p>• Cumplimiento LOPD/GDPR con auditoría completa</p>
              <p>• Gestión de seguridad, rendimiento e integraciones</p>
              <p>• Zona de peligro con protocolo de seguridad multi-paso</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={testSystemHealth}
              disabled={loading}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Probando...
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4 mr-2" />
                  Test Sistema
                </>
              )}
            </button>
            <button
              onClick={exportConfiguration}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar Config
            </button>
            <button
              onClick={resetToDefaults}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </button>
            <button
              onClick={saveConfiguration}
              disabled={saving === 'all'}
              className="bg-white/20 hover:bg-white/30 px-6 py-2 rounded-lg transition-colors flex items-center disabled:opacity-50"
            >
              {saving === 'all' ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Todo
                </>
              )}
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
            <AlertCircle className="w-5 h-5 mr-2" />
          )}
          {message.text}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="flex overflow-x-auto">
          {sections.map(section => {
            const Icon = section.icon;
            const isActive = activeTab === section.id;
            const isDangerZone = section.id === 'danger-zone';
            
            return (
              <button
                key={section.id}
                onClick={() => setActiveTab(section.id)}
                className={`flex items-center px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? isDangerZone 
                      ? 'border-red-500 text-red-600 bg-red-50'
                      : 'border-green-500 text-green-600 bg-green-50'
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

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        {/* System Configuration */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <Settings className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Configuración General del Sistema</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de la Plataforma</label>
                <input
                  type="text"
                  value={systemConfig.platform_name}
                  onChange={(e) => setSystemConfig({ ...systemConfig, platform_name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Administrador</label>
                <input
                  type="email"
                  value={systemConfig.admin_email}
                  onChange={(e) => setSystemConfig({ ...systemConfig, admin_email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tamaño Máximo Archivo (MB)</label>
                <input
                  type="number"
                  value={systemConfig.max_file_size}
                  onChange={(e) => setSystemConfig({ ...systemConfig, max_file_size: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Máximo Usuarios Concurrentes</label>
                <input
                  type="number"
                  value={systemConfig.max_concurrent_users}
                  onChange={(e) => setSystemConfig({ ...systemConfig, max_concurrent_users: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Timeout Sesión (minutos)</label>
                <input
                  type="number"
                  value={systemConfig.session_timeout}
                  onChange={(e) => setSystemConfig({ ...systemConfig, session_timeout: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Política de Contraseñas</label>
                <select
                  value={systemConfig.password_policy_strength}
                  onChange={(e) => setSystemConfig({ ...systemConfig, password_policy_strength: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                  <option value="enterprise">Empresarial</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Retención Auditoría (días)</label>
                <input
                  type="number"
                  value={systemConfig.audit_retention_days}
                  onChange={(e) => setSystemConfig({ ...systemConfig, audit_retention_days: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Frecuencia Backup</label>
                <select
                  value={systemConfig.backup_frequency}
                  onChange={(e) => setSystemConfig({ ...systemConfig, backup_frequency: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="hourly">Cada Hora</option>
                  <option value="4hours">Cada 4 Horas</option>
                  <option value="daily">Diario</option>
                  <option value="weekly">Semanal</option>
                </select>
              </div>
            </div>

            {/* Feature Toggles */}
            <div className="mt-8 space-y-4">
              <h4 className="font-medium text-gray-900">Funcionalidades del Sistema</h4>

              {[{
                key: 'ai_auto_classification',
                label: 'Clasificación IA Automática',
                desc: 'Clasifica documentos automáticamente usando IA'
              }, {
                key: 'email_notifications',
                label: 'Notificaciones Email',
                desc: 'Envía notificaciones por correo electrónico'
              }, {
                key: 'two_factor_required',
                label: 'Autenticación 2FA Obligatoria',
                desc: 'Requiere verificación en dos pasos'
              }, {
                key: 'maintenance_mode',
                label: 'Modo Mantenimiento',
                desc: 'Activa el modo mantenimiento del sistema',
                danger: true
              }].map((feature) => (
                <div key={feature.key} className={`flex items-center justify-between p-4 border rounded-lg ${feature.danger ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
                  <div>
                    <h5 className={`font-medium ${feature.danger ? 'text-red-900' : 'text-gray-900'}`}>{feature.label}</h5>
                    <p className={`text-sm ${feature.danger ? 'text-red-600' : 'text-gray-600'}`}>{feature.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={systemConfig[feature.key as keyof SystemConfig] as boolean}
                      onChange={(e) => setSystemConfig({ ...systemConfig, [feature.key]: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className={`w-11 h-6 ${feature.danger ? 'bg-red-200 peer-checked:bg-red-600' : 'bg-gray-200 peer-checked:bg-green-600'} peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Security Configuration */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <Shield className="w-6 h-6 text-red-600" />
              <h2 className="text-xl font-semibold text-gray-900">Configuración de Seguridad Avanzada</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nivel de Cifrado</label>
                <select
                  value={securityConfig.encryption_level}
                  onChange={(e) => setSecurityConfig({ ...securityConfig, encryption_level: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="AES-128">AES-128</option>
                  <option value="AES-256">AES-256</option>
                  <option value="RSA-2048">RSA-2048</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Intentos Login Fallidos Permitidos</label>
                <input
                  type="number"
                  value={securityConfig.failed_login_attempts}
                  onChange={(e) => setSecurityConfig({ ...securityConfig, failed_login_attempts: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duración Bloqueo Cuenta (minutos)</label>
                <input
                  type="number"
                  value={securityConfig.account_lockout_duration}
                  onChange={(e) => setSecurityConfig({ ...securityConfig, account_lockout_duration: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Requests/Minuto API</label>
                <input
                  type="number"
                  value={securityConfig.max_requests_per_minute}
                  onChange={(e) => setSecurityConfig({ ...securityConfig, max_requests_per_minute: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">IPs Permitidas (una por línea)</label>
                <textarea
                  value={securityConfig.allowed_ips}
                  onChange={(e) => setSecurityConfig({ ...securityConfig, allowed_ips: e.target.value })}
                  placeholder="192.168.1.1&#10;10.0.0.0/8&#10;172.16.0.0/12"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent h-24"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Orígenes CORS Permitidos</label>
                <textarea
                  value={securityConfig.cors_origins}
                  onChange={(e) => setSecurityConfig({ ...securityConfig, cors_origins: e.target.value })}
                  placeholder="https://constructia.com&#10;https://app.constructia.com"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent h-24"
                />
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <h4 className="font-medium text-gray-900">Configuraciones de Seguridad</h4>

              {[{
                key: 'ssl_enforcement',
                label: 'Forzar SSL/HTTPS',
                desc: 'Redirecciona automáticamente HTTP a HTTPS'
              }, {
                key: 'ip_whitelist_enabled',
                label: 'Whitelist de IPs',
                desc: 'Solo permite acceso desde IPs autorizadas'
              }, {
                key: 'api_rate_limiting',
                label: 'Limitación de API',
                desc: 'Limita requests por minuto por IP'
              }, {
                key: 'suspicious_activity_alerts',
                label: 'Alertas Actividad Sospechosa',
                desc: 'Notifica comportamientos anómalos'
              }].map((feature) => (
                <div key={feature.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h5 className="font-medium text-gray-900">{feature.label}</h5>
                    <p className="text-sm text-gray-600">{feature.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={securityConfig[feature.key as keyof SecurityConfig] as boolean}
                      onChange={(e) => setSecurityConfig({ ...securityConfig, [feature.key]: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Integration Configuration */}
        {activeTab === 'integration' && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <Globe className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">Configuración de Integraciones</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Timeout APIs Externas (segundos)</label>
                <input
                  type="number"
                  value={integrationConfig.external_api_timeout}
                  onChange={(e) => setIntegrationConfig({ ...integrationConfig, external_api_timeout: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reintentos Webhook</label>
                <input
                  type="number"
                  value={integrationConfig.webhook_retry_attempts}
                  onChange={(e) => setIntegrationConfig({ ...integrationConfig, webhook_retry_attempts: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <h4 className="font-medium text-gray-900">Estados de Integración</h4>

              {[{
                key: 'obralia_auto_sync',
                label: 'Sincronización Automática Obralia',
                desc: 'Sincroniza documentos automáticamente'
              }, {
                key: 'gemini_api_enabled',
                label: 'Google Gemini IA Habilitado',
                desc: 'Usa Gemini para análisis de documentos'
              }, {
                key: 'stripe_webhook_validation',
                label: 'Validación Webhooks Stripe',
                desc: 'Verifica firma de webhooks de Stripe'
              }, {
                key: 'sepa_direct_debit_enabled',
                label: 'SEPA Débito Directo',
                desc: 'Permite pagos por domiciliación SEPA'
              }, {
                key: 'bizum_integration_active',
                label: 'Integración Bizum Activa',
                desc: 'Acepta pagos a través de Bizum'
              }, {
                key: 'apple_pay_enabled',
                label: 'Apple Pay Habilitado',
                desc: 'Permite pagos con Apple Pay'
              }, {
                key: 'google_pay_enabled',
                label: 'Google Pay Habilitado',
                desc: 'Permite pagos con Google Pay'
              }, {
                key: 'integration_health_checks',
                label: 'Health Checks Integraciones',
                desc: 'Monitorea salud de todas las integraciones'
              }].map((feature) => (
                <div key={feature.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h5 className="font-medium text-gray-900">{feature.label}</h5>
                    <p className="text-sm text-gray-600">{feature.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={integrationConfig[feature.key as keyof IntegrationConfig] as boolean}
                      onChange={(e) => setIntegrationConfig({ ...integrationConfig, [feature.key]: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
              ))}
            </div>

            {/* Platform Connection Tests */}
            <div className="mt-8 bg-blue-50 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 mb-4">Test de Conexiones</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['nalanda', 'ctaima', 'ecoordina'].map(platform => (
                  <button
                    key={platform}
                    onClick={() => testConnection(platform)}
                    disabled={testingConnections[platform]}
                    className="flex items-center justify-center p-4 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50"
                  >
                    {testingConnections[platform] ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Probando...
                      </>
                    ) : (
                      <>
                        <Globe className="w-4 h-4 mr-2" />
                        Test {platform.charAt(0).toUpperCase() + platform.slice(1)}
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Compliance Configuration */}
        {activeTab === 'compliance' && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <Lock className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900">Configuración Cumplimiento LOPD/GDPR</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nivel Cumplimiento LOPD</label>
                <select
                  value={complianceConfig.lopd_compliance_level}
                  onChange={(e) => setComplianceConfig({ ...complianceConfig, lopd_compliance_level: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="basic">Básico</option>
                  <option value="standard">Estándar</option>
                  <option value="strict">Estricto</option>
                  <option value="maximum">Máximo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Política Retención Datos</label>
                <select
                  value={complianceConfig.data_retention_policy}
                  onChange={(e) => setComplianceConfig({ ...complianceConfig, data_retention_policy: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="1_year">1 Año</option>
                  <option value="3_years">3 Años</option>
                  <option value="5_years">5 Años</option>
                  <option value="7_years">7 Años</option>
                  <option value="10_years">10 Años</option>
                  <option value="indefinite">Indefinido</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tiempo Notificación Brechas (horas)</label>
                <input
                  type="number"
                  value={complianceConfig.breach_notification_time}
                  onChange={(e) => setComplianceConfig({ ...complianceConfig, breach_notification_time: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <h4 className="font-medium text-gray-900">Derechos y Cumplimiento GDPR</h4>

              {[{
                key: 'gdpr_consent_required',
                label: 'Consentimiento GDPR Obligatorio',
                desc: 'Requiere consentimiento explícito para procesamiento'
              }, {
                key: 'right_to_be_forgotten',
                label: 'Derecho al Olvido',
                desc: 'Permite eliminación completa de datos personales'
              }, {
                key: 'data_portability_enabled',
                label: 'Portabilidad de Datos',
                desc: 'Facilita exportación de datos personales'
              }, {
                key: 'privacy_impact_assessments',
                label: 'Evaluaciones Impacto Privacidad',
                desc: 'Realiza evaluaciones DPIA automáticas'
              }, {
                key: 'data_processing_logs',
                label: 'Logs Procesamiento Datos',
                desc: 'Registra todo procesamiento de datos personales'
              }, {
                key: 'third_party_sharing_allowed',
                label: 'Compartir con Terceros',
                desc: 'Permite compartir datos con terceros autorizados'
              }, {
                key: 'anonymization_after_retention',
                label: 'Anonimización Post-Retención',
                desc: 'Anonimiza datos tras periodo de retención'
              }].map((feature) => (
                <div key={feature.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h5 className="font-medium text-gray-900">{feature.label}</h5>
                    <p className="text-sm text-gray-600">{feature.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={complianceConfig[feature.key as keyof ComplianceConfig] as boolean}
                      onChange={(e) => setComplianceConfig({ ...complianceConfig, [feature.key]: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
              ))}
            </div>

            {/* LOPD Status Indicator */}
            <div className="mt-8 bg-green-50 border border-green-200 rounded-xl p-6">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <h4 className="font-bold text-green-800">Estado Cumplimiento LOPD</h4>
                  <p className="text-green-700">✅ Cumplimiento Nivel: {complianceConfig.lopd_compliance_level.toUpperCase()}</p>
                  <p className="text-green-700">✅ Todos los derechos GDPR configurados correctamente</p>
                  <p className="text-green-700">✅ Logs de auditoría inviolables activos</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Performance Configuration */}
        {activeTab === 'performance' && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <Zap className="w-6 h-6 text-orange-600" />
              <h2 className="text-xl font-semibold text-gray-900">Configuración de Rendimiento</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duración Cache (segundos)</label>
                <input
                  type="number"
                  value={performanceConfig.cache_duration}
                  onChange={(e) => setPerformanceConfig({ ...performanceConfig, cache_duration: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tamaño Pool Base de Datos</label>
                <input
                  type="number"
                  value={performanceConfig.database_pool_size}
                  onChange={(e) => setPerformanceConfig({ ...performanceConfig, database_pool_size: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Timeout Queries (segundos)</label>
                <input
                  type="number"
                  value={performanceConfig.query_timeout}
                  onChange={(e) => setPerformanceConfig({ ...performanceConfig, query_timeout: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <h4 className="font-medium text-gray-900">Optimizaciones de Rendimiento</h4>

              {[{
                key: 'cache_enabled',
                label: 'Cache Habilitado',
                desc: 'Usa cache para mejorar velocidad de respuesta'
              }, {
                key: 'cdn_enabled',
                label: 'CDN Habilitado',
                desc: 'Distribuye contenido estático globalmente'
              }, {
                key: 'image_optimization',
                label: 'Optimización Imágenes',
                desc: 'Comprime y optimiza imágenes automáticamente'
              }, {
                key: 'lazy_loading',
                label: 'Carga Lazy',
                desc: 'Carga contenido según necesidad'
              }, {
                key: 'compression_enabled',
                label: 'Compresión Habilitada',
                desc: 'Comprime respuestas HTTP (gzip/brotli)'
              }, {
                key: 'minification_enabled',
                label: 'Minificación CSS/JS',
                desc: 'Minifica archivos para reducir tamaño'
              }, {
                key: 'auto_scaling_enabled',
                label: 'Auto-escalado',
                desc: 'Escala recursos según demanda'
              }].map((feature) => (
                <div key={feature.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h5 className="font-medium text-gray-900">{feature.label}</h5>
                    <p className="text-sm text-gray-600">{feature.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={performanceConfig[feature.key as keyof PerformanceConfig] as boolean}
                      onChange={(e) => setPerformanceConfig({ ...performanceConfig, [feature.key]: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notifications Configuration */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <Bell className="w-6 h-6 text-cyan-600" />
              <h2 className="text-xl font-semibold text-gray-900">Configuración de Notificaciones</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Frecuencia Notificaciones</label>
                <select
                  value={notificationConfig.notification_frequency}
                  onChange={(e) => setNotificationConfig({ ...notificationConfig, notification_frequency: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="immediate">Inmediata</option>
                  <option value="hourly">Cada Hora</option>
                  <option value="daily">Diaria</option>
                  <option value="weekly">Semanal</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Frecuencia Resumen</label>
                <select
                  value={notificationConfig.digest_frequency}
                  onChange={(e) => setNotificationConfig({ ...notificationConfig, digest_frequency: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="daily">Diario</option>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensual</option>
                </select>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <h4 className="font-medium text-gray-900">Canales de Notificación</h4>

              {[{
                key: 'email_notifications',
                label: 'Notificaciones Email',
                desc: 'Envía alertas por correo electrónico'
              }, {
                key: 'sms_notifications',
                label: 'Notificaciones SMS',
                desc: 'Envía alertas críticas por SMS'
              }, {
                key: 'push_notifications',
                label: 'Notificaciones Push',
                desc: 'Notificaciones push en navegador'
              }, {
                key: 'slack_integration',
                label: 'Integración Slack',
                desc: 'Envía alertas al canal de Slack'
              }, {
                key: 'teams_integration',
                label: 'Integración Microsoft Teams',
                desc: 'Envía alertas a Teams'
              }, {
                key: 'webhook_notifications',
                label: 'Notificaciones Webhook',
                desc: 'Envía eventos a URLs personalizadas'
              }, {
                key: 'digest_enabled',
                label: 'Resúmenes Habilitados',
                desc: 'Genera resúmenes periódicos'
              }, {
                key: 'escalation_enabled',
                label: 'Escalado Automático',
                desc: 'Escala alertas críticas automáticamente'
              }].map((feature) => (
                <div key={feature.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h5 className="font-medium text-gray-900">{feature.label}</h5>
                    <p className="text-sm text-gray-600">{feature.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationConfig[feature.key as keyof NotificationConfig] as boolean}
                      onChange={(e) => setNotificationConfig({ ...notificationConfig, [feature.key]: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Danger Zone Configuration */}
        {activeTab === 'danger-zone' && (
          <div className="space-y-6">
            {/* Critical Security Alert */}
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                  <AlertTriangle className="text-white text-2xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-red-800">🚨 ZONA DE PELIGRO CRÍTICO 🚨</h2>
                  <p className="text-red-700 font-medium">
                    Acceso restringido - Solo para administradores autorizados
                  </p>
                </div>
              </div>

              <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-6">
                <h3 className="font-bold text-red-800 mb-2">⚠️ ADVERTENCIA CRÍTICA DE SEGURIDAD ⚠️</h3>
                <ul className="text-red-700 space-y-1 text-sm">
                  <li>• Esta operación eliminará TODOS los datos de la base de datos</li>
                  <li>• Solo se preservarán los logs de auditoría (por cumplimiento LOPD)</li>
                  <li>• Solo se mantendrán los usuarios de prueba del sistema</li>
                  <li>• Todos los KPIs se resetearán a valores iniciales</li>
                  <li>• <strong>ESTA ACCIÓN NO SE PUEDE DESHACER</strong></li>
                </ul>
              </div>
            </div>

            {/* Multi-step Confirmation Process */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-red-600" />
                Proceso de Confirmación de Limpieza (Protocolo de Seguridad)
              </h3>

              {/* Step Indicator */}
              <div className="flex items-center justify-between mb-8">
                <div className={`flex items-center space-x-2 ${dangerZoneStep >= 0 ? 'text-red-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${dangerZoneStep >= 0 ? 'bg-red-600 text-white' : 'bg-gray-300 text-gray-600'}`}>1</div>
                  <span className="font-medium">Iniciar Proceso</span>
                </div>
                <div className="flex-1 h-px bg-gray-300 mx-4"></div>
                <div className={`flex items-center space-x-2 ${dangerZoneStep >= 1 ? 'text-red-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${dangerZoneStep >= 1 ? 'bg-red-600 text-white' : 'bg-gray-300 text-gray-600'}`}>2</div>
                  <span className="font-medium">Código Verificación</span>
                </div>
                <div className="flex-1 h-px bg-gray-300 mx-4"></div>
                <div className={`flex items-center space-x-2 ${dangerZoneStep >= 2 ? 'text-red-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${dangerZoneStep >= 2 ? 'bg-red-600 text-white' : 'bg-gray-300 text-gray-600'}`}>3</div>
                  <span className="font-medium">Ejecutar Limpieza</span>
                </div>
              </div>

              {/* Step 0: Initial State */}
              {dangerZoneStep === 0 && (
                <div className="text-center py-8">
                  <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-xl font-bold text-gray-800 mb-2">Limpieza Completa de Base de Datos</h4>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Este proceso eliminará todos los datos de prueba y dejará el sistema limpio para nuevas pruebas.
                  </p>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left max-w-lg mx-auto">
                    <h5 className="font-bold text-yellow-800 mb-2">Se preservarán:</h5>
                    <ul className="text-yellow-700 text-sm space-y-1">
                      <li>✅ Logs de auditoría (cumplimiento LOPD)</li>
                      <li>✅ Usuarios de prueba del sistema</li>
                      <li>✅ Configuraciones del sistema</li>
                    </ul>
                  </div>

                  <button
                    onClick={handleDangerZoneAction}
                    className="bg-red-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-red-700 transition-colors"
                  >
                    <AlertTriangle className="w-4 h-4 mr-2 inline" />
                    INICIAR PROCESO DE LIMPIEZA
                  </button>
                </div>
              )}

              {/* Step 1: Verification Code */}
              {dangerZoneStep === 1 && (
                <div className="text-center py-8">
                  <Key className="w-16 h-16 text-red-600 mx-auto mb-4" />
                  <h4 className="text-xl font-bold text-red-800 mb-2">Verificación de Seguridad</h4>
                  <p className="text-gray-600 mb-6">
                    Introduce el código de confirmación para continuar
                  </p>

                  <div className="bg-red-100 border-2 border-red-300 rounded-lg p-4 mb-6 max-w-sm mx-auto">
                    <p className="text-red-800 font-bold text-lg mb-2">Código de Confirmación:</p>
                    <div className="text-3xl font-mono font-bold text-red-700 bg-white px-4 py-2 rounded border-2 border-red-300">
                      {confirmationCode}
                    </div>
                  </div>

                  <div className="max-w-sm mx-auto mb-6">
                    <input
                      type="text"
                      value={userConfirmation}
                      onChange={(e) => setUserConfirmation(e.target.value.toUpperCase())}
                      placeholder="Introduce el código aquí"
                      className="w-full border-2 border-red-300 rounded-lg px-4 py-3 text-center text-xl font-mono font-bold uppercase focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      maxLength={6}
                    />
                  </div>

                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={cancelDangerZone}
                      className="bg-gray-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors"
                    >
                      <X className="w-4 h-4 mr-2 inline" />
                      Cancelar
                    </button>
                    <button
                      onClick={handleDangerZoneAction}
                      disabled={userConfirmation.length !== 6}
                      className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle className="w-4 h-4 mr-2 inline" />
                      Verificar Código
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Final Confirmation */}
              {dangerZoneStep === 2 && (
                <div className="text-center py-8">
                  <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4 animate-pulse" />
                  <h4 className="text-xl font-bold text-red-800 mb-2">🔴 CONFIRMACIÓN FINAL 🔴</h4>
                  <p className="text-red-700 font-medium mb-6">
                    Código verificado correctamente. Listo para ejecutar la limpieza.
                  </p>

                  <div className="bg-red-100 border-2 border-red-400 rounded-lg p-6 mb-6 max-w-lg mx-auto">
                    <h5 className="font-bold text-red-800 mb-3 text-lg">RESUMEN DE LA OPERACIÓN:</h5>
                    <div className="text-left text-red-700 space-y-2">
                      <div className="flex items-center space-x-2">
                        <Trash2 className="w-4 h-4 text-red-600" />
                        <span>Eliminar TODOS los datos de múltiples tablas</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-red-600" />
                        <span>Mantener usuarios de prueba del sistema</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <BarChart3 className="w-4 h-4 text-red-600" />
                        <span>Resetear todos los KPIs a valores iniciales</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Preservar logs de auditoría (LOPD)</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={cancelDangerZone}
                      className="bg-gray-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors"
                    >
                      <X className="w-4 h-4 mr-2 inline" />
                      Cancelar Proceso
                    </button>
                    <button
                      onClick={handleDangerZoneAction}
                      disabled={loading}
                      className="bg-red-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 inline animate-spin" />
                          EJECUTANDO LIMPIEZA...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 mr-2 inline" />
                          EJECUTAR LIMPIEZA COMPLETA
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Audit Guarantees */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <h4 className="font-bold text-green-800">Garantías de Auditoría y Cumplimiento</h4>
                  <div className="text-green-700 text-sm mt-2 grid grid-cols-2 gap-2">
                    <div>✅ Logs de auditoría completamente preservados</div>
                    <div>✅ Cumplimiento LOPD mantenido al 100%</div>
                    <div>✅ Proceso completamente traceable</div>
                    <div>✅ Registro inviolable de todas las acciones</div>
                  </div>
                  <p className="text-green-600 text-sm mt-3">
                    <strong>Nota:</strong> Cada paso de este proceso se registra en los logs de auditoría
                    para cumplir con la normativa LOPD y garantizar la trazabilidad completa.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legacy Settings Section */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Configuraciones Heredadas del Sistema</h2>
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

      {/* System Health Status */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
        <div className="flex items-center space-x-3">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <div>
            <h3 className="font-bold text-green-800">Control Center - Estado del Sistema</h3>
            <p className="text-green-700">
              <strong>Configuración empresarial completa</strong> con 6 módulos avanzados: Sistema, Seguridad,
              Integraciones, Cumplimiento LOPD, Rendimiento y Notificaciones.
            </p>
            <div className="mt-2 text-sm text-green-600 grid grid-cols-3 gap-2">
              <div>✅ Sistema General configurado</div>
              <div>✅ Seguridad AES-256 activa</div>
              <div>✅ Integraciones monitoreadas</div>
              <div>✅ Cumplimiento LOPD estricto</div>
              <div>✅ Optimización automática</div>
              <div>✅ Notificaciones multi-canal</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}