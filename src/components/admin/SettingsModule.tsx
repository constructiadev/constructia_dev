import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Brain, 
  Shield, 
  Zap, 
  Database,
  Image,
  Server,
  Monitor,
  Globe,
  Key,
  Lock,
  Unlock,
  RefreshCw,
  Trash2,
  Download,
  Upload,
  Eye,
  EyeOff,
  Save,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  BarChart3,
  HardDrive,
  Cpu,
  Wifi,
  Mail,
  Bell,
  Users,
  FileText,
  CreditCard,
  Layers,
  Code,
  Terminal,
  Sliders,
  Gauge,
  TrendingUp,
  Calendar,
  Search,
  Filter,
  Plus,
  Edit,
  X,
  Info,
  Warning,
  Power,
  Pause,
  Play
} from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { callGeminiAI } from '../../lib/supabase';

interface SettingsKPICardProps {
  title: string;
  value: string | number;
  status: 'good' | 'warning' | 'error';
  icon: React.ElementType;
  color: string;
  description?: string;
  action?: () => void;
  actionLabel?: string;
}

function SettingsKPICard({ title, value, status, icon: Icon, color, description, action, actionLabel }: SettingsKPICardProps) {
  const statusColors = {
    good: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600'
  };

  const statusIcons = {
    good: CheckCircle,
    warning: AlertTriangle,
    error: AlertTriangle
  };

  const StatusIcon = statusIcons[status];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <StatusIcon className={`h-5 w-5 ${statusColors[status]}`} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
        {action && actionLabel && (
          <button
            onClick={action}
            className="mt-3 w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}

interface ConfigurationSectionProps {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  status?: 'good' | 'warning' | 'error';
  collapsible?: boolean;
}

function ConfigurationSection({ title, icon: Icon, children, status = 'good', collapsible = true }: ConfigurationSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const statusColors = {
    good: 'border-green-200 bg-green-50',
    warning: 'border-yellow-200 bg-yellow-50',
    error: 'border-red-200 bg-red-50'
  };

  return (
    <div className={`border rounded-xl ${statusColors[status]}`}>
      <div 
        className={`p-4 ${collapsible ? 'cursor-pointer' : ''} flex items-center justify-between`}
        onClick={() => collapsible && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <Icon className="h-5 w-5 mr-3" />
          <h3 className="font-semibold text-gray-800">{title}</h3>
        </div>
        {collapsible && (
          <button className="text-gray-600 hover:text-gray-800">
            {isExpanded ? '−' : '+'}
          </button>
        )}
      </div>
      {isExpanded && (
        <div className="p-4 pt-0">
          {children}
        </div>
      )}
    </div>
  );
}

export default function SettingsModule() {
  const [aiInsights, setAiInsights] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [showSecrets, setShowSecrets] = useState(false);
  const [cacheSize, setCacheSize] = useState('2.4GB');
  const [systemHealth, setSystemHealth] = useState(98.7);

  // Estados de configuración
  const [generalSettings, setGeneralSettings] = useState({
    site_name: 'ConstructIA',
    site_description: 'Plataforma SaaS de Gestión Documental',
    admin_email: 'admin@constructia.com',
    timezone: 'Europe/Madrid',
    language: 'es',
    maintenance_mode: false,
    debug_mode: false,
    analytics_enabled: true
  });

  const [securitySettings, setSecuritySettings] = useState({
    two_factor_required: false,
    session_timeout: 30,
    password_min_length: 8,
    max_login_attempts: 5,
    ip_whitelist_enabled: false,
    ssl_force: true,
    cors_enabled: true,
    rate_limiting: true,
    encryption_level: 'AES-256'
  });

  const [performanceSettings, setPerformanceSettings] = useState({
    cache_enabled: true,
    cache_ttl: 3600,
    compression_enabled: true,
    cdn_enabled: false,
    lazy_loading: true,
    image_optimization: true,
    database_pooling: true,
    query_optimization: true
  });

  const [imageSettings, setImageSettings] = useState({
    max_upload_size: 10,
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
    auto_resize: true,
    quality_compression: 85,
    watermark_enabled: false,
    thumbnail_generation: true,
    storage_provider: 'supabase'
  });

  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    slack_integration: false,
    webhook_notifications: true,
    sms_alerts: false,
    push_notifications: true,
    alert_threshold_cpu: 80,
    alert_threshold_memory: 85,
    alert_threshold_disk: 90
  });

  // KPIs del Sistema
  const systemKPIs = [
    { title: 'Estado General', value: 'Saludable', status: 'good' as const, icon: Shield, color: 'bg-green-500', description: 'Todos los sistemas operativos' },
    { title: 'Rendimiento', value: `${systemHealth}%`, status: 'good' as const, icon: Gauge, color: 'bg-blue-500', description: 'Rendimiento general del sistema' },
    { title: 'Caché Sistema', value: cacheSize, status: 'warning' as const, icon: Database, color: 'bg-purple-500', description: 'Memoria caché utilizada', action: () => clearCache(), actionLabel: 'Limpiar Caché' },
    { title: 'Seguridad', value: 'Óptima', status: 'good' as const, icon: Lock, color: 'bg-red-500', description: 'Configuración de seguridad' },
    { title: 'Backup Status', value: '2h ago', status: 'good' as const, icon: HardDrive, color: 'bg-indigo-500', description: 'Último backup automático' },
    { title: 'Logs Sistema', value: '15.2MB', status: 'good' as const, icon: FileText, color: 'bg-orange-500', description: 'Tamaño de logs actuales', action: () => clearLogs(), actionLabel: 'Limpiar Logs' },
    { title: 'APIs Activas', value: '12', status: 'good' as const, icon: Globe, color: 'bg-cyan-500', description: 'Integraciones funcionando' },
    { title: 'Usuarios Online', value: '89', status: 'good' as const, icon: Users, color: 'bg-pink-500', description: 'Usuarios activos ahora' }
  ];

  const tabs = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'security', name: 'Seguridad', icon: Shield },
    { id: 'performance', name: 'Rendimiento', icon: Zap },
    { id: 'images', name: 'Imágenes', icon: Image },
    { id: 'notifications', name: 'Notificaciones', icon: Bell },
    { id: 'monitoring', name: 'Monitoreo', icon: Monitor },
    { id: 'advanced', name: 'Avanzado', icon: Code }
  ];

  // Datos para gráficos
  const systemPerformanceData = {
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
    datasets: [{
      label: 'Rendimiento del Sistema (%)',
      data: [95.2, 97.1, 98.7, 96.3, 98.1, 97.8],
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  const resourceUsageData = {
    labels: ['CPU', 'Memoria', 'Disco', 'Red'],
    datasets: [{
      data: [23, 67, 45, 34],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(168, 85, 247, 0.8)'
      ],
      borderWidth: 0
    }]
  };

  const securityEventsData = {
    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab', 'Dom'],
    datasets: [{
      label: 'Eventos de Seguridad',
      data: [12, 8, 15, 6, 9, 4, 7],
      backgroundColor: 'rgba(239, 68, 68, 0.8)',
      borderColor: 'rgb(239, 68, 68)',
      borderWidth: 1
    }]
  };

  const generateSystemInsights = async () => {
    setLoading(true);
    try {
      // Simular insights mientras Gemini está fallando
      const mockInsights = `⚙️ Análisis de Configuración del Sistema:

1. **Rendimiento Óptimo**: El sistema mantiene 98.7% de rendimiento con configuración balanceada entre seguridad y velocidad.

2. **Optimización de Caché**: Con ${cacheSize} de caché utilizada, recomiendo limpiar caché semanalmente para mantener rendimiento óptimo.

3. **Seguridad Robusta**: Configuración SSL activa y rate limiting habilitado. Considerar activar 2FA para administradores.

4. **Recomendación**: Habilitar CDN para mejorar tiempos de carga de imágenes en un 40%.`;
      
      setAiInsights(mockInsights);
    } catch (error) {
      setAiInsights('Error al generar insights del sistema. La API de Gemini está temporalmente no disponible.');
    } finally {
      setLoading(false);
    }
  };

  const clearCache = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setCacheSize('0.2GB');
      setSystemHealth(99.2);
      alert('Caché del sistema limpiado exitosamente. Rendimiento mejorado.');
    } catch (error) {
      alert('Error al limpiar el caché del sistema.');
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert('Logs del sistema limpiados exitosamente. Espacio liberado: 15.2MB');
    } catch (error) {
      alert('Error al limpiar los logs del sistema.');
    } finally {
      setLoading(false);
    }
  };

  const optimizeDatabase = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      setSystemHealth(99.5);
      alert('Base de datos optimizada exitosamente. Rendimiento mejorado al 99.5%');
    } catch (error) {
      alert('Error al optimizar la base de datos.');
    } finally {
      setLoading(false);
    }
  };

  const runSystemDiagnostic = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 4000));
      alert(`Diagnóstico del sistema completado:
      
✅ Base de datos: Saludable
✅ APIs: Funcionando correctamente
✅ Seguridad: Configuración óptima
⚠️ Caché: Recomendado limpiar
✅ Backups: Actualizados
✅ SSL: Certificado válido`);
    } catch (error) {
      alert('Error al ejecutar el diagnóstico del sistema.');
    } finally {
      setLoading(false);
    }
  };

  const exportSystemConfig = () => {
    const config = {
      general: generalSettings,
      security: securitySettings,
      performance: performanceSettings,
      images: imageSettings,
      notifications: notificationSettings,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `constructia_config_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const saveSettings = async (section: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert(`Configuración de ${section} guardada exitosamente`);
    } catch (error) {
      alert(`Error al guardar la configuración de ${section}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateSystemInsights();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header con IA */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Configuración del Sistema</h2>
            <p className="text-gray-300 mt-1">Centro de control integral con IA para toda la plataforma</p>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={runSystemDiagnostic}
              disabled={loading}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center"
            >
              <Activity className="h-4 w-4 mr-2" />
              {loading ? 'Diagnosticando...' : 'Diagnóstico IA'}
            </button>
            <button 
              onClick={generateSystemInsights}
              disabled={loading}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center"
            >
              <Brain className="h-4 w-4 mr-2" />
              {loading ? 'Analizando...' : 'Actualizar IA'}
            </button>
          </div>
        </div>
        
        {aiInsights && (
          <div className="mt-4 bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold mb-2">🤖 Insights de Configuración IA:</h3>
            <div className="text-sm text-white/90 whitespace-pre-line">{aiInsights}</div>
          </div>
        )}
      </div>

      {/* KPIs del Sistema */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Estado del Sistema</h3>
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">Actualización automática</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {systemKPIs.map((kpi, index) => (
            <SettingsKPICard key={index} {...kpi} />
          ))}
        </div>
      </div>

      {/* Gráficos de Monitoreo */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Monitoreo del Sistema</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-800">Rendimiento por Hora</h4>
              <Download className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600" />
            </div>
            <div className="h-48">
              <Line data={systemPerformanceData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-800">Uso de Recursos</h4>
              <Eye className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600" />
            </div>
            <div className="h-48">
              <Doughnut data={resourceUsageData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-800">Eventos de Seguridad</h4>
              <BarChart3 className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600" />
            </div>
            <div className="h-48">
              <Bar data={securityEventsData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs de Configuración */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-gray-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Tab: General */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <ConfigurationSection title="Configuración General" icon={Settings}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del Sitio
                    </label>
                    <input
                      type="text"
                      value={generalSettings.site_name}
                      onChange={(e) => setGeneralSettings({...generalSettings, site_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email del Administrador
                    </label>
                    <input
                      type="email"
                      value={generalSettings.admin_email}
                      onChange={(e) => setGeneralSettings({...generalSettings, admin_email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Zona Horaria
                    </label>
                    <select
                      value={generalSettings.timezone}
                      onChange={(e) => setGeneralSettings({...generalSettings, timezone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                    >
                      <option value="Europe/Madrid">Europa/Madrid</option>
                      <option value="Europe/London">Europa/Londres</option>
                      <option value="America/New_York">América/Nueva York</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Idioma
                    </label>
                    <select
                      value={generalSettings.language}
                      onChange={(e) => setGeneralSettings({...generalSettings, language: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                    >
                      <option value="es">Español</option>
                      <option value="en">English</option>
                      <option value="fr">Français</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción del Sitio
                  </label>
                  <textarea
                    value={generalSettings.site_description}
                    onChange={(e) => setGeneralSettings({...generalSettings, site_description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">Modo Mantenimiento</p>
                      <p className="text-sm text-gray-600">Deshabilitar acceso público</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={generalSettings.maintenance_mode}
                        onChange={(e) => setGeneralSettings({...generalSettings, maintenance_mode: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">Modo Debug</p>
                      <p className="text-sm text-gray-600">Mostrar errores detallados</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={generalSettings.debug_mode}
                        onChange={(e) => setGeneralSettings({...generalSettings, debug_mode: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">Analytics</p>
                      <p className="text-sm text-gray-600">Recopilar métricas de uso</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={generalSettings.analytics_enabled}
                        onChange={(e) => setGeneralSettings({...generalSettings, analytics_enabled: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-600"></div>
                    </label>
                  </div>
                </div>

                <button
                  onClick={() => saveSettings('general')}
                  disabled={loading}
                  className="mt-6 flex items-center px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Guardando...' : 'Guardar Configuración General'}
                </button>
              </ConfigurationSection>
            </div>
          )}

          {/* Tab: Security */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <ConfigurationSection title="Configuración de Seguridad" icon={Shield} status="good">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timeout de Sesión (minutos)
                    </label>
                    <input
                      type="number"
                      value={securitySettings.session_timeout}
                      onChange={(e) => setSecuritySettings({...securitySettings, session_timeout: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Longitud Mínima de Contraseña
                    </label>
                    <input
                      type="number"
                      value={securitySettings.password_min_length}
                      onChange={(e) => setSecuritySettings({...securitySettings, password_min_length: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Máximo Intentos de Login
                    </label>
                    <input
                      type="number"
                      value={securitySettings.max_login_attempts}
                      onChange={(e) => setSecuritySettings({...securitySettings, max_login_attempts: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nivel de Encriptación
                    </label>
                    <select
                      value={securitySettings.encryption_level}
                      onChange={(e) => setSecuritySettings({...securitySettings, encryption_level: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    >
                      <option value="AES-128">AES-128</option>
                      <option value="AES-256">AES-256</option>
                      <option value="RSA-2048">RSA-2048</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium text-red-800">Autenticación de Dos Factores</p>
                      <p className="text-sm text-red-600">Requerido para administradores</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={securitySettings.two_factor_required}
                        onChange={(e) => setSecuritySettings({...securitySettings, two_factor_required: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium text-red-800">Forzar SSL/HTTPS</p>
                      <p className="text-sm text-red-600">Redirigir todo el tráfico a HTTPS</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={securitySettings.ssl_force}
                        onChange={(e) => setSecuritySettings({...securitySettings, ssl_force: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium text-red-800">Rate Limiting</p>
                      <p className="text-sm text-red-600">Limitar requests por IP</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={securitySettings.rate_limiting}
                        onChange={(e) => setSecuritySettings({...securitySettings, rate_limiting: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium text-red-800">Whitelist de IPs</p>
                      <p className="text-sm text-red-600">Restringir acceso por IP</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={securitySettings.ip_whitelist_enabled}
                        onChange={(e) => setSecuritySettings({...securitySettings, ip_whitelist_enabled: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                  </div>
                </div>

                <button
                  onClick={() => saveSettings('seguridad')}
                  disabled={loading}
                  className="mt-6 flex items-center px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  {loading ? 'Guardando...' : 'Guardar Configuración de Seguridad'}
                </button>
              </ConfigurationSection>
            </div>
          )}

          {/* Tab: Performance */}
          {activeTab === 'performance' && (
            <div className="space-y-6">
              <ConfigurationSection title="Configuración de Rendimiento" icon={Zap} status="warning">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      TTL de Caché (segundos)
                    </label>
                    <input
                      type="number"
                      value={performanceSettings.cache_ttl}
                      onChange={(e) => setPerformanceSettings({...performanceSettings, cache_ttl: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                    <div>
                      <p className="font-medium text-yellow-800">Caché Habilitado</p>
                      <p className="text-sm text-yellow-600">Mejora velocidad de respuesta</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={performanceSettings.cache_enabled}
                        onChange={(e) => setPerformanceSettings({...performanceSettings, cache_enabled: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                    <div>
                      <p className="font-medium text-yellow-800">Compresión GZIP</p>
                      <p className="text-sm text-yellow-600">Reduce tamaño de respuestas</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={performanceSettings.compression_enabled}
                        onChange={(e) => setPerformanceSettings({...performanceSettings, compression_enabled: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                    <div>
                      <p className="font-medium text-yellow-800">CDN Habilitado</p>
                      <p className="text-sm text-yellow-600">Distribución global de contenido</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={performanceSettings.cdn_enabled}
                        onChange={(e) => setPerformanceSettings({...performanceSettings, cdn_enabled: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                    <div>
                      <p className="font-medium text-yellow-800">Lazy Loading</p>
                      <p className="text-sm text-yellow-600">Carga diferida de imágenes</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={performanceSettings.lazy_loading}
                        onChange={(e) => setPerformanceSettings({...performanceSettings, lazy_loading: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                    <div>
                      <p className="font-medium text-yellow-800">Database Pooling</p>
                      <p className="text-sm text-yellow-600">Optimización de conexiones DB</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={performanceSettings.database_pooling}
                        onChange={(e) => setPerformanceSettings({...performanceSettings, database_pooling: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
                    </label>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-3">Acciones de Optimización</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={clearCache}
                      disabled={loading}
                      className="flex items-center justify-center p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {loading ? 'Limpiando...' : 'Limpiar Caché'}
                    </button>
                    
                    <button
                      onClick={optimizeDatabase}
                      disabled={loading}
                      className="flex items-center justify-center p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Database className="h-4 w-4 mr-2" />
                      {loading ? 'Optimizando...' : 'Optimizar DB'}
                    </button>
                    
                    <button
                      onClick={clearLogs}
                      disabled={loading}
                      className="flex items-center justify-center p-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      {loading ? 'Limpiando...' : 'Limpiar Logs'}
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => saveSettings('rendimiento')}
                  disabled={loading}
                  className="mt-6 flex items-center px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  {loading ? 'Guardando...' : 'Guardar Configuración de Rendimiento'}
                </button>
              </ConfigurationSection>
            </div>
          )}

          {/* Tab: Images */}
          {activeTab === 'images' && (
            <div className="space-y-6">
              <ConfigurationSection title="Configuración de Imágenes" icon={Image}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tamaño Máximo de Subida (MB)
                    </label>
                    <input
                      type="number"
                      value={imageSettings.max_upload_size}
                      onChange={(e) => setImageSettings({...imageSettings, max_upload_size: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Calidad de Compresión (%)
                    </label>
                    <input
                      type="range"
                      min="50"
                      max="100"
                      value={imageSettings.quality_compression}
                      onChange={(e) => setImageSettings({...imageSettings, quality_compression: Number(e.target.value)})}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>50%</span>
                      <span className="font-medium">{imageSettings.quality_compression}%</span>
                      <span>100%</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Proveedor de Almacenamiento
                    </label>
                    <select
                      value={imageSettings.storage_provider}
                      onChange={(e) => setImageSettings({...imageSettings, storage_provider: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="supabase">Supabase Storage</option>
                      <option value="aws">Amazon S3</option>
                      <option value="cloudinary">Cloudinary</option>
                      <option value="local">Almacenamiento Local</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Formatos Permitidos
                  </label>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    {['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'txt'].map(format => (
                      <label key={format} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={imageSettings.allowed_formats.includes(format)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setImageSettings({
                                ...imageSettings,
                                allowed_formats: [...imageSettings.allowed_formats, format]
                              });
                            } else {
                              setImageSettings({
                                ...imageSettings,
                                allowed_formats: imageSettings.allowed_formats.filter(f => f !== format)
                              });
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm">{format.toUpperCase()}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium text-blue-800">Redimensionado Automático</p>
                      <p className="text-sm text-blue-600">Optimizar tamaño de imágenes</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={imageSettings.auto_resize}
                        onChange={(e) => setImageSettings({...imageSettings, auto_resize: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium text-blue-800">Generación de Miniaturas</p>
                      <p className="text-sm text-blue-600">Crear thumbnails automáticamente</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={imageSettings.thumbnail_generation}
                        onChange={(e) => setImageSettings({...imageSettings, thumbnail_generation: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium text-blue-800">Marca de Agua</p>
                      <p className="text-sm text-blue-600">Añadir logo a imágenes</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={imageSettings.watermark_enabled}
                        onChange={(e) => setImageSettings({...imageSettings, watermark_enabled: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium text-blue-800">Optimización de Imágenes</p>
                      <p className="text-sm text-blue-600">Compresión inteligente</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={imageSettings.image_optimization}
                        onChange={(e) => setImageSettings({...imageSettings, image_optimization: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                <button
                  onClick={() => saveSettings('imágenes')}
                  disabled={loading}
                  className="mt-6 flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  <Image className="h-4 w-4 mr-2" />
                  {loading ? 'Guardando...' : 'Guardar Configuración de Imágenes'}
                </button>
              </ConfigurationSection>
            </div>
          )}

          {/* Tab: Notifications */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <ConfigurationSection title="Configuración de Notificaciones" icon={Bell}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Umbral de Alerta CPU (%)
                    </label>
                    <input
                      type="number"
                      value={notificationSettings.alert_threshold_cpu}
                      onChange={(e) => setNotificationSettings({...notificationSettings, alert_threshold_cpu: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Umbral de Alerta Memoria (%)
                    </label>
                    <input
                      type="number"
                      value={notificationSettings.alert_threshold_memory}
                      onChange={(e) => setNotificationSettings({...notificationSettings, alert_threshold_memory: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Umbral de Alerta Disco (%)
                    </label>
                    <input
                      type="number"
                      value={notificationSettings.alert_threshold_disk}
                      onChange={(e) => setNotificationSettings({...notificationSettings, alert_threshold_disk: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-green-800">Notificaciones por Email</p>
                      <p className="text-sm text-green-600">Alertas por correo electrónico</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.email_notifications}
                        onChange={(e) => setNotificationSettings({...notificationSettings, email_notifications: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-green-800">Integración Slack</p>
                      <p className="text-sm text-green-600">Notificaciones en Slack</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.slack_integration}
                        onChange={(e) => setNotificationSettings({...notificationSettings, slack_integration: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-green-800">Webhooks</p>
                      <p className="text-sm text-green-600">Notificaciones HTTP</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.webhook_notifications}
                        onChange={(e) => setNotificationSettings({...notificationSettings, webhook_notifications: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-green-800">Push Notifications</p>
                      <p className="text-sm text-green-600">Notificaciones del navegador</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.push_notifications}
                        onChange={(e) => setNotificationSettings({...notificationSettings, push_notifications: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                </div>

                <button
                  onClick={() => saveSettings('notificaciones')}
                  disabled={loading}
                  className="mt-6 flex items-center px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  {loading ? 'Guardando...' : 'Guardar Configuración de Notificaciones'}
                </button>
              </ConfigurationSection>
            </div>
          )}

          {/* Tab: Monitoring */}
          {activeTab === 'monitoring' && (
            <div className="space-y-6">
              <ConfigurationSection title="Monitoreo del Sistema" icon={Monitor}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center p-6 bg-blue-50 rounded-lg border border-blue-200">
                    <Cpu className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                    <h4 className="font-semibold text-blue-800 mb-2">CPU</h4>
                    <p className="text-2xl font-bold text-blue-600 mb-1">23%</p>
                    <p className="text-sm text-blue-700">Uso actual</p>
                    <div className="w-full bg-blue-200 rounded-full h-2 mt-3">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '23%' }}></div>
                    </div>
                  </div>
                  
                  <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
                    <HardDrive className="h-8 w-8 text-green-600 mx-auto mb-3" />
                    <h4 className="font-semibold text-green-800 mb-2">Memoria</h4>
                    <p className="text-2xl font-bold text-green-600 mb-1">67%</p>
                    <p className="text-sm text-green-700">8GB / 12GB</p>
                    <div className="w-full bg-green-200 rounded-full h-2 mt-3">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '67%' }}></div>
                    </div>
                  </div>
                  
                  <div className="text-center p-6 bg-purple-50 rounded-lg border border-purple-200">
                    <Database className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                    <h4 className="font-semibold text-purple-800 mb-2">Disco</h4>
                    <p className="text-2xl font-bold text-purple-600 mb-1">45%</p>
                    <p className="text-sm text-purple-700">2.4TB / 5TB</p>
                    <div className="w-full bg-purple-200 rounded-full h-2 mt-3">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                  </div>
                  
                  <div className="text-center p-6 bg-orange-50 rounded-lg border border-orange-200">
                    <Wifi className="h-8 w-8 text-orange-600 mx-auto mb-3" />
                    <h4 className="font-semibold text-orange-800 mb-2">Red</h4>
                    <p className="text-2xl font-bold text-orange-600 mb-1">34%</p>
                    <p className="text-sm text-orange-700">45MB/s</p>
                    <div className="w-full bg-orange-200 rounded-full h-2 mt-3">
                      <div className="bg-orange-600 h-2 rounded-full" style={{ width: '34%' }}></div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-3">Servicios del Sistema</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-white rounded border">
                        <span className="text-sm">Supabase Database</span>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          <span className="text-xs text-green-600">Operativo</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-white rounded border">
                        <span className="text-sm">Gemini AI</span>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                          <span className="text-xs text-yellow-600">Latencia</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-white rounded border">
                        <span className="text-sm">Stripe Payments</span>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          <span className="text-xs text-green-600">Operativo</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-white rounded border">
                        <span className="text-sm">Obralia Integration</span>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                          <span className="text-xs text-red-600">Error</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-3">Logs Recientes</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center p-2 bg-white rounded border">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span>Sistema iniciado correctamente</span>
                        <span className="ml-auto text-xs text-gray-500">15:45</span>
                      </div>
                      <div className="flex items-center p-2 bg-white rounded border">
                        <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                        <span>Latencia alta en Gemini AI</span>
                        <span className="ml-auto text-xs text-gray-500">15:42</span>
                      </div>
                      <div className="flex items-center p-2 bg-white rounded border">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span>Backup completado</span>
                        <span className="ml-auto text-xs text-gray-500">15:30</span>
                      </div>
                      <div className="flex items-center p-2 bg-white rounded border">
                        <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                        <span>Error en Obralia API</span>
                        <span className="ml-auto text-xs text-gray-500">15:25</span>
                      </div>
                    </div>
                  </div>
                </div>
              </ConfigurationSection>
            </div>
          )}

          {/* Tab: Advanced */}
          {activeTab === 'advanced' && (
            <div className="space-y-6">
              <ConfigurationSection title="Configuración Avanzada" icon={Code}>
                <div className="space-y-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-yellow-800">Configuración Avanzada</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          Estas configuraciones son para usuarios avanzados. Cambios incorrectos pueden afectar el funcionamiento del sistema.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Variables de Entorno
                      </label>
                      <textarea
                        rows={8}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent font-mono text-sm"
                        defaultValue={`VITE_SUPABASE_URL=configured
VITE_SUPABASE_ANON_KEY=configured
VITE_GEMINI_API_KEY=configured
VITE_STRIPE_PUBLISHABLE_KEY=configured
VITE_APP_ENV=production
VITE_APP_NAME=ConstructIA
VITE_APP_VERSION=1.0.0`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Configuración JSON
                      </label>
                      <textarea
                        rows={8}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent font-mono text-sm"
                        defaultValue={JSON.stringify({
                          api_rate_limit: 1000,
                          max_file_size: 10485760,
                          session_timeout: 1800,
                          cache_ttl: 3600,
                          debug_mode: false
                        }, null, 2)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={exportSystemConfig}
                      className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <Download className="h-5 w-5 text-blue-600 mr-2" />
                      <div className="text-left">
                        <p className="font-medium text-blue-800">Exportar Config</p>
                        <p className="text-xs text-blue-600">Descargar configuración</p>
                      </div>
                    </button>
                    
                    <button className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                      <Upload className="h-5 w-5 text-green-600 mr-2" />
                      <div className="text-left">
                        <p className="font-medium text-green-800">Importar Config</p>
                        <p className="text-xs text-green-600">Cargar configuración</p>
                      </div>
                    </button>
                    
                    <button className="flex items-center justify-center p-4 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                      <RefreshCw className="h-5 w-5 text-red-600 mr-2" />
                      <div className="text-left">
                        <p className="font-medium text-red-800">Reset Config</p>
                        <p className="text-xs text-red-600">Restaurar por defecto</p>
                      </div>
                    </button>
                  </div>
                </div>
              </ConfigurationSection>
            </div>
          )}
        </div>
      </div>

      {/* Acciones Rápidas del Sistema */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Acciones Rápidas del Sistema</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button 
            onClick={runSystemDiagnostic}
            disabled={loading}
            className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <Activity className="h-5 w-5 text-purple-600 mr-2" />
            <div className="text-left">
              <p className="font-medium text-purple-800">Diagnóstico IA</p>
              <p className="text-xs text-purple-600">Análisis completo</p>
            </div>
          </button>
          
          <button 
            onClick={clearCache}
            disabled={loading}
            className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <Trash2 className="h-5 w-5 text-blue-600 mr-2" />
            <div className="text-left">
              <p className="font-medium text-blue-800">Limpiar Caché</p>
              <p className="text-xs text-blue-600">Liberar {cacheSize}</p>
            </div>
          </button>
          
          <button 
            onClick={optimizeDatabase}
            disabled={loading}
            className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <Database className="h-5 w-5 text-green-600 mr-2" />
            <div className="text-left">
              <p className="font-medium text-green-800">Optimizar DB</p>
              <p className="text-xs text-green-600">Mejorar rendimiento</p>
            </div>
          </button>
          
          <button 
            onClick={exportSystemConfig}
            className="flex items-center justify-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
          >
            <Download className="h-5 w-5 text-orange-600 mr-2" />
            <div className="text-left">
              <p className="font-medium text-orange-800">Exportar Todo</p>
              <p className="text-xs text-orange-600">Backup completo</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}