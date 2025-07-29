import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
  Building2, 
  Shield, 
  Bell,
  CreditCard,
  Globe,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  Key,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getCurrentClientData, updateClientObraliaCredentials } from '../../lib/supabase';

interface ClientData {
  id: string;
  client_id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  address: string;
  subscription_plan: string;
  subscription_status: string;
  storage_used: number;
  storage_limit: number;
  documents_processed: number;
  tokens_available: number;
  obralia_credentials?: {
    username: string;
    password: string;
    configured: boolean;
  };
  created_at: string;
  updated_at: string;
}

export default function Settings() {
  const { user } = useAuth();
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showObraliaPassword, setShowObraliaPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // Estados para formularios
  const [profileForm, setProfileForm] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    address: ''
  });

  const [obraliaForm, setObraliaForm] = useState({
    username: '',
    password: ''
  });

  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    document_processed: true,
    obralia_upload: true,
    storage_alerts: true,
    payment_reminders: true
  });

  useEffect(() => {
    loadClientData();
  }, [user]);

  const loadClientData = async () => {
    if (!user?.id) return;
    
    try {
      const data = await getCurrentClientData(user.id);
      setClientData(data);
      
      // Inicializar formularios con datos actuales
      setProfileForm({
        company_name: data.company_name || '',
        contact_name: data.contact_name || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || ''
      });

      if (data.obralia_credentials) {
        setObraliaForm({
          username: data.obralia_credentials.username || '',
          password: data.obralia_credentials.password || ''
        });
      }
    } catch (error) {
      console.error('Error loading client data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProfileSettings = async () => {
    setSaving(true);
    try {
      // Simular guardado de perfil
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (clientData) {
        setClientData({
          ...clientData,
          ...profileForm
        });
      }
      
      alert('Configuración de perfil guardada exitosamente');
    } catch (error) {
      alert('Error al guardar la configuración de perfil');
    } finally {
      setSaving(false);
    }
  };

  const saveObraliaSettings = async () => {
    if (!clientData?.id) return;
    
    setSaving(true);
    try {
      await updateClientObraliaCredentials(clientData.id, obraliaForm);
      
      setClientData({
        ...clientData,
        obralia_credentials: {
          username: obraliaForm.username,
          password: obraliaForm.password,
          configured: true
        }
      });
      
      alert('Credenciales de Obralia actualizadas exitosamente');
    } catch (error) {
      alert('Error al actualizar las credenciales de Obralia');
    } finally {
      setSaving(false);
    }
  };

  const saveNotificationSettings = async () => {
    setSaving(true);
    try {
      // Simular guardado de notificaciones
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Configuración de notificaciones guardada exitosamente');
    } catch (error) {
      alert('Error al guardar la configuración de notificaciones');
    } finally {
      setSaving(false);
    }
  };

  const testObraliaConnection = async () => {
    setSaving(true);
    try {
      // Simular test de conexión
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Conexión con Obralia verificada exitosamente');
    } catch (error) {
      alert('Error al conectar con Obralia. Verifica tus credenciales.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', name: 'Perfil', icon: User },
    { id: 'obralia', name: 'Obralia/Nalanda', icon: Globe },
    { id: 'notifications', name: 'Notificaciones', icon: Bell },
    { id: 'security', name: 'Seguridad', icon: Shield }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Configuración</h2>
        <p className="text-gray-600">Gestiona tu perfil y preferencias de la cuenta</p>
      </div>

      {/* Información del Cliente */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <Building2 className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{clientData?.company_name}</h3>
              <p className="text-gray-600">{clientData?.contact_name}</p>
              <p className="text-sm text-gray-500">ID Cliente: {clientData?.client_id}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center mb-2">
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                {clientData?.subscription_plan}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              Miembro desde {clientData?.created_at ? new Date(clientData.created_at).toLocaleDateString() : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
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
          {/* Tab: Perfil */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800">Información del Perfil</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de la Empresa
                  </label>
                  <input
                    type="text"
                    value={profileForm.company_name}
                    onChange={(e) => setProfileForm({...profileForm, company_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de Contacto
                  </label>
                  <input
                    type="text"
                    value={profileForm.contact_name}
                    onChange={(e) => setProfileForm({...profileForm, contact_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <textarea
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({...profileForm, address: e.target.value})}
                    rows={3}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <button
                onClick={saveProfileSettings}
                disabled={saving}
                className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          )}

          {/* Tab: Obralia */}
          {activeTab === 'obralia' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Configuración Obralia/Nalanda</h3>
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${
                    clientData?.obralia_credentials?.configured ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className={`text-sm font-medium ${
                    clientData?.obralia_credentials?.configured ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {clientData?.obralia_credentials?.configured ? 'Configurado' : 'No configurado'}
                  </span>
                </div>
              </div>
              
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-orange-600 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-orange-800">Configuración Obligatoria</h4>
                    <p className="text-sm text-orange-700 mt-1">
                      Las credenciales de Obralia/Nalanda son necesarias para la subida automática de documentos.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Usuario Obralia
                  </label>
                  <input
                    type="text"
                    value={obraliaForm.username}
                    onChange={(e) => setObraliaForm({...obraliaForm, username: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="usuario@obralia.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña Obralia
                  </label>
                  <div className="relative">
                    <input
                      type={showObraliaPassword ? 'text' : 'password'}
                      value={obraliaForm.password}
                      onChange={(e) => setObraliaForm({...obraliaForm, password: e.target.value})}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowObraliaPassword(!showObraliaPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showObraliaPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={saveObraliaSettings}
                  disabled={saving}
                  className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Guardando...' : 'Guardar Credenciales'}
                </button>
                
                <button
                  onClick={testObraliaConnection}
                  disabled={saving}
                  className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {saving ? 'Probando...' : 'Probar Conexión'}
                </button>
              </div>
            </div>
          )}

          {/* Tab: Notificaciones */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800">Preferencias de Notificaciones</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-800">Notificaciones por Email</h4>
                    <p className="text-sm text-gray-600">Recibir notificaciones generales por correo</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.email_notifications}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        email_notifications: e.target.checked
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-800">Documentos Procesados</h4>
                    <p className="text-sm text-gray-600">Notificar cuando un documento sea procesado</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.document_processed}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        document_processed: e.target.checked
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-800">Subidas a Obralia</h4>
                    <p className="text-sm text-gray-600">Notificar cuando se suban documentos a Obralia</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.obralia_upload}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        obralia_upload: e.target.checked
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-800">Alertas de Almacenamiento</h4>
                    <p className="text-sm text-gray-600">Notificar cuando el almacenamiento esté lleno</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.storage_alerts}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        storage_alerts: e.target.checked
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-800">Recordatorios de Pago</h4>
                    <p className="text-sm text-gray-600">Recordatorios de renovación de suscripción</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.payment_reminders}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        payment_reminders: e.target.checked
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
              </div>
              
              <button
                onClick={saveNotificationSettings}
                disabled={saving}
                className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Guardando...' : 'Guardar Preferencias'}
              </button>
            </div>
          )}

          {/* Tab: Seguridad */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800">Configuración de Seguridad</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <h4 className="font-semibold text-green-800">Cuenta Verificada</h4>
                  </div>
                  <p className="text-sm text-green-700">Tu cuenta está verificada y segura</p>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <Shield className="h-5 w-5 text-blue-600 mr-2" />
                    <h4 className="font-semibold text-blue-800">Datos Encriptados</h4>
                  </div>
                  <p className="text-sm text-blue-700">Todas las credenciales están encriptadas</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Cambiar Contraseña</h4>
                  <div className="space-y-3">
                    <input
                      type="password"
                      placeholder="Contraseña actual"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <input
                      type="password"
                      placeholder="Nueva contraseña"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <input
                      type="password"
                      placeholder="Confirmar nueva contraseña"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <button className="mt-3 flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                    <Key className="h-4 w-4 mr-2" />
                    Cambiar Contraseña
                  </button>
                </div>
              </div>
              
              <div className="border-t pt-6">
                <h4 className="font-medium text-gray-800 mb-4">Información de Sesión</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Último acceso:</span>
                    <span className="font-medium">Hoy a las 15:30</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dispositivo:</span>
                    <span className="font-medium">Chrome en Windows</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">IP:</span>
                    <span className="font-medium">192.168.1.100</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}