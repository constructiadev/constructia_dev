import React, { useState, useEffect } from 'react';
import {
  Mail,
  Send,
  Clock,
  Users,
  Search,
  Plus,
  X,
  CheckCircle,
  AlertTriangle,
  Bell,
  MessageSquare,
  Eye,
  Trash2,
  RefreshCw,
  Filter,
  Calendar,
  Target,
  Info,
  User,
  Building2
} from 'lucide-react';
import { getAllClients, supabase } from '../../lib/supabase';

interface Client {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  subscription_status: string;
  last_activity?: string;
  unread_messages: number;
}

interface AdminMessage {
  id: string;
  admin_user_id: string;
  client_id: string;
  subject: string;
  message: string;
  message_type: 'notification' | 'alert' | 'update' | 'reminder' | 'urgent';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  read_status: boolean;
  read_at?: string;
  created_at: string;
  expires_at?: string;
  client_name?: string;
  client_email?: string;
}

interface MessageKPIs {
  totalClients: number;
  activeClients: number;
  messagesSent: number;
  messagesRead: number;
  readRate: number;
  urgentMessages: number;
}

export default function MessagingModule() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'send-message' | 'message-history' | 'client-status'>('send-message');
  const [clients, setClients] = useState<Client[]>([]);
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showClientSelector, setShowClientSelector] = useState(false);
  const [kpis, setKpis] = useState<MessageKPIs>({
    totalClients: 0,
    activeClients: 0,
    messagesSent: 0,
    messagesRead: 0,
    readRate: 0,
    urgentMessages: 0
  });

  const [messageForm, setMessageForm] = useState({
    subject: '',
    message: '',
    message_type: 'notification' as AdminMessage['message_type'],
    priority: 'medium' as AdminMessage['priority'],
    expires_at: '',
    client_ids: [] as string[]
  });

  useEffect(() => {
    loadClientsAndMessages();
  }, []);

  const loadClientsAndMessages = async () => {
    try {
      setLoading(true);

      // Cargar clientes reales
      const clientsData = await getAllClients();
      
      // Simular mensajes (en producción vendría de la tabla admin_client_messages)
      const mockMessages: AdminMessage[] = [
        {
          id: '1',
          admin_user_id: 'admin-1',
          client_id: clientsData[0]?.id || 'client-1',
          subject: 'Actualización del Sistema',
          message: 'Hemos implementado nuevas funcionalidades de IA para mejorar la clasificación de documentos.',
          message_type: 'update',
          priority: 'medium',
          read_status: true,
          read_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          client_name: clientsData[0]?.company_name || 'Cliente 1',
          client_email: clientsData[0]?.email || 'cliente1@example.com'
        },
        {
          id: '2',
          admin_user_id: 'admin-1',
          client_id: clientsData[1]?.id || 'client-2',
          subject: 'Mantenimiento Programado',
          message: 'El sistema estará en mantenimiento el próximo domingo de 2:00 AM a 4:00 AM.',
          message_type: 'alert',
          priority: 'high',
          read_status: false,
          created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          client_name: clientsData[1]?.company_name || 'Cliente 2',
          client_email: clientsData[1]?.email || 'cliente2@example.com'
        }
      ];

      // Mapear clientes con datos de mensajes no leídos
      const clientsWithUnread: Client[] = clientsData.map(client => ({
        id: client.id,
        company_name: client.company_name,
        contact_name: client.contact_name,
        email: client.email,
        subscription_status: client.subscription_status,
        last_activity: client.updated_at,
        unread_messages: mockMessages.filter(msg => msg.client_id === client.id && !msg.read_status).length
      }));

      setClients(clientsWithUnread);
      setMessages(mockMessages);

      // Calcular KPIs
      const totalClients = clientsWithUnread.length;
      const activeClients = clientsWithUnread.filter(c => c.subscription_status === 'active').length;
      const messagesSent = mockMessages.length;
      const messagesRead = mockMessages.filter(m => m.read_status).length;
      const readRate = messagesSent > 0 ? (messagesRead / messagesSent) * 100 : 0;
      const urgentMessages = mockMessages.filter(m => m.priority === 'urgent').length;

      setKpis({
        totalClients,
        activeClients,
        messagesSent,
        messagesRead,
        readRate,
        urgentMessages
      });

    } catch (error) {
      console.error('Error loading messaging data:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageForm.subject.trim() || !messageForm.message.trim() || messageForm.client_ids.length === 0) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    try {
      setSendingMessage(true);

      // Crear mensajes para cada cliente seleccionado
      const messagesToSend = messageForm.client_ids.map(clientId => ({
        admin_user_id: 'admin-user-temp-id',
        client_id: clientId,
        subject: messageForm.subject,
        message: messageForm.message,
        message_type: messageForm.message_type,
        priority: messageForm.priority,
        expires_at: messageForm.expires_at || null,
        created_at: new Date().toISOString(),
        read_status: false
      }));

      // Simular envío (en producción insertaría en admin_client_messages)
      const newMessages: AdminMessage[] = messagesToSend.map(msg => {
        const client = clients.find(c => c.id === msg.client_id);
        return {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          ...msg,
          client_name: client?.company_name || 'Cliente',
          client_email: client?.email || ''
        };
      });

      setMessages(prev => [...newMessages, ...prev]);

      // Actualizar contador de mensajes no leídos
      setClients(prev => prev.map(client =>
        messageForm.client_ids.includes(client.id)
          ? { ...client, unread_messages: client.unread_messages + 1 }
          : client
      ));

      // Actualizar KPIs
      setKpis(prev => ({
        ...prev,
        messagesSent: prev.messagesSent + newMessages.length,
        urgentMessages: messageForm.priority === 'urgent' ? prev.urgentMessages + newMessages.length : prev.urgentMessages
      }));

      clearForm();
      alert(`✅ Mensaje enviado exitosamente a ${messageForm.client_ids.length} cliente(s)`);

    } catch (error) {
      console.error('Error sending message:', error);
      alert('❌ Error al enviar mensaje. Inténtelo nuevamente.');
    } finally {
      setSendingMessage(false);
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!confirm('¿Está seguro de eliminar este mensaje? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      // En producción, eliminar de la base de datos
      await supabase
        .from('admin_client_messages')
        .delete()
        .eq('id', messageId);

      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      alert('✅ Mensaje eliminado correctamente');
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('❌ Error al eliminar mensaje');
    }
  };

  const toggleClientSelection = (clientId: string, checked: boolean) => {
    if (checked) {
      setMessageForm(prev => ({
        ...prev,
        client_ids: [...prev.client_ids, clientId]
      }));
    } else {
      setMessageForm(prev => ({
        ...prev,
        client_ids: prev.client_ids.filter(id => id !== clientId)
      }));
    }
  };

  const removeClientFromSelection = (clientId: string) => {
    setMessageForm(prev => ({
      ...prev,
      client_ids: prev.client_ids.filter(id => id !== clientId)
    }));
  };

  const selectClientForMessage = (client: Client) => {
    setMessageForm(prev => ({
      ...prev,
      client_ids: [client.id]
    }));
    setActiveTab('send-message');
  };

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.company_name || 'Cliente';
  };

  const getClientMessageCount = (clientId: string) => {
    return messages.filter(m => m.client_id === clientId).length;
  };

  const clearForm = () => {
    setMessageForm({
      subject: '',
      message: '',
      message_type: 'notification',
      priority: 'medium',
      expires_at: '',
      client_ids: []
    });
    setShowClientSelector(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES');
  };

  const getMessageTypeIconClass = (type: string) => {
    const classes: Record<string, string> = {
      'urgent': 'text-red-600',
      'alert': 'text-orange-600',
      'update': 'text-blue-600',
      'reminder': 'text-yellow-600',
      'notification': 'text-gray-600'
    };
    return classes[type] || 'text-gray-600';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      'urgent': 'bg-red-100 text-red-800 border-red-200',
      'high': 'bg-orange-100 text-orange-800 border-orange-200',
      'medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'low': 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPriorityText = (priority: string) => {
    const texts: Record<string, string> = {
      'urgent': '🔴 URGENTE',
      'high': '🟠 Alta',
      'medium': '🟡 Media',
      'low': '🟢 Baja'
    };
    return texts[priority] || priority;
  };

  const getStatusColor = (status: string) => {
    return status === 'active'
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-gray-100 text-gray-600 border-gray-200';
  };

  const filteredClients = clients.filter(client => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return client.company_name.toLowerCase().includes(search) ||
           client.contact_name.toLowerCase().includes(search) ||
           client.email.toLowerCase().includes(search);
  });

  const filteredMessages = messages.filter(msg => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return msg.client_name?.toLowerCase().includes(search) ||
           msg.subject.toLowerCase().includes(search) ||
           msg.client_email?.toLowerCase().includes(search) ||
           msg.message.toLowerCase().includes(search);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando módulo de mensajería...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header del módulo */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <Mail className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Mensajería Administrador → Cliente</h2>
            </div>
            <p className="text-blue-100">
              Sistema de notificaciones unidireccionales para comunicación directa con clientes
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{kpis.messagesSent}</div>
            <div className="text-sm text-blue-200">Mensajes Enviados</div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-6 gap-3 mt-6">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
            <div className="text-xl font-bold">{kpis.totalClients}</div>
            <div className="text-xs text-blue-100">Total Clientes</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-green-200">{kpis.activeClients}</div>
            <div className="text-xs text-blue-100">Activos</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-yellow-200">{kpis.messagesSent}</div>
            <div className="text-xs text-blue-100">Enviados</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-cyan-200">{kpis.messagesRead}</div>
            <div className="text-xs text-blue-100">Leídos</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-purple-200">{kpis.readRate.toFixed(1)}%</div>
            <div className="text-xs text-blue-100">Tasa Lectura</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-red-200">{kpis.urgentMessages}</div>
            <div className="text-xs text-blue-100">Urgentes</div>
          </div>
        </div>
      </div>

      {/* Navegación por tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('send-message')}
          className={`flex-1 px-4 py-3 rounded-md font-medium transition-colors whitespace-nowrap ${
            activeTab === 'send-message' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Send className="w-5 h-5 inline mr-2" />
          Enviar Mensaje
        </button>
        <button
          onClick={() => setActiveTab('message-history')}
          className={`flex-1 px-4 py-3 rounded-md font-medium transition-colors whitespace-nowrap ${
            activeTab === 'message-history' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Clock className="w-5 h-5 inline mr-2" />
          Historial de Mensajes
        </button>
        <button
          onClick={() => setActiveTab('client-status')}
          className={`flex-1 px-4 py-3 rounded-md font-medium transition-colors whitespace-nowrap ${
            activeTab === 'client-status' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Users className="w-5 h-5 inline mr-2" />
          Estado de Clientes
        </button>
      </div>

      {/* Tab: Enviar Mensaje */}
      {activeTab === 'send-message' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-6">
            <MessageSquare className="w-6 h-6 text-purple-600" />
            <h3 className="text-xl font-bold text-gray-900">Redactar Nuevo Mensaje</h3>
          </div>

          <form onSubmit={sendMessage} className="space-y-6">
            {/* Selección de destinatarios */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                <Users className="w-4 h-4 inline mr-1" />
                Destinatarios *
              </label>

              {!showClientSelector && messageForm.client_ids.length === 0 && (
                <button
                  type="button"
                  onClick={() => setShowClientSelector(true)}
                  className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 transition-colors text-center"
                >
                  <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <div className="text-gray-600">Seleccionar Cliente(s)</div>
                  <div className="text-sm text-gray-500">Haga clic para elegir destinatarios</div>
                </button>
              )}

              {showClientSelector && (
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">Seleccionar Clientes:</span>
                    <button
                      type="button"
                      onClick={() => setShowClientSelector(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="mb-3">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Buscar cliente por nombre, email o empresa..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                      />
                    </div>
                    {searchTerm && (
                      <div className="mt-1 text-xs text-gray-500">
                        Mostrando {filteredClients.length} de {clients.length} clientes
                      </div>
                    )}
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {(searchTerm ? filteredClients : clients).map(client => (
                      <label
                        key={client.id}
                        className="flex items-center space-x-3 p-2 hover:bg-white rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={messageForm.client_ids.includes(client.id)}
                          onChange={(e) => toggleClientSelection(client.id, e.target.checked)}
                          className="rounded text-purple-600"
                        />
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${
                            client.subscription_status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                          }`}></div>
                          <span className="font-medium text-gray-900">{client.company_name}</span>
                          <span className="text-sm text-gray-500">({client.email})</span>
                          {client.unread_messages > 0 && (
                            <span className="bg-red-100 text-red-800 px-1 py-0.5 rounded-full text-xs">
                              {client.unread_messages} no leídos
                            </span>
                          )}
                        </div>
                      </label>
                    ))}

                    {searchTerm && filteredClients.length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        No se encontraron clientes con "{searchTerm}"
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Clientes seleccionados */}
              {messageForm.client_ids.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-purple-50 rounded-lg">
                  {messageForm.client_ids.map(clientId => (
                    <div
                      key={clientId}
                      className="flex items-center space-x-2 bg-white px-3 py-1 rounded-full border"
                    >
                      <span className="text-sm font-medium">{getClientName(clientId)}</span>
                      <button
                        type="button"
                        onClick={() => removeClientFromSelection(clientId)}
                        className="text-gray-500 hover:text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowClientSelector(true)}
                    className="flex items-center space-x-1 text-purple-600 hover:text-purple-800 px-2 py-1 rounded-full"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm">Agregar más</span>
                  </button>
                </div>
              )}
            </div>

            {/* Configuración del mensaje */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Bell className="w-4 h-4 inline mr-1" />
                  Tipo de Mensaje
                </label>
                <select
                  value={messageForm.message_type}
                  onChange={(e) => setMessageForm(prev => ({ ...prev, message_type: e.target.value as AdminMessage['message_type'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="notification">🔔 Notificación</option>
                  <option value="alert">⚠️ Alerta</option>
                  <option value="update">ℹ️ Actualización</option>
                  <option value="reminder">⏰ Recordatorio</option>
                  <option value="urgent">🚨 Urgente</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Target className="w-4 h-4 inline mr-1" />
                  Prioridad
                </label>
                <select
                  value={messageForm.priority}
                  onChange={(e) => setMessageForm(prev => ({ ...prev, priority: e.target.value as AdminMessage['priority'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="low">🟢 Baja</option>
                  <option value="medium">🟡 Media</option>
                  <option value="high">🟠 Alta</option>
                  <option value="urgent">🔴 Urgente</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Vencimiento (Opcional)
                </label>
                <input
                  type="datetime-local"
                  value={messageForm.expires_at}
                  onChange={(e) => setMessageForm(prev => ({ ...prev, expires_at: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            {/* Asunto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MessageSquare className="w-4 h-4 inline mr-1" />
                Asunto *
              </label>
              <input
                type="text"
                placeholder="Escriba el asunto del mensaje..."
                value={messageForm.subject}
                onChange={(e) => setMessageForm(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            {/* Mensaje */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MessageSquare className="w-4 h-4 inline mr-1" />
                Mensaje *
              </label>
              <textarea
                placeholder="Escriba su mensaje aquí..."
                rows={6}
                maxLength={500}
                value={messageForm.message}
                onChange={(e) => setMessageForm(prev => ({ ...prev, message: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                required
              />
              <div className="text-right text-sm text-gray-500 mt-1">
                {messageForm.message.length}/500 caracteres
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-gray-600">
                <Info className="w-4 h-4 inline mr-1" />
                Los clientes recibirán este mensaje como notificación y no podrán responder
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={clearForm}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  <X className="w-4 h-4 inline mr-2" />
                  Limpiar
                </button>

                <button
                  type="submit"
                  disabled={sendingMessage || messageForm.client_ids.length === 0}
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                  {sendingMessage ? (
                    <>
                      <RefreshCw className="w-4 h-4 inline mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 inline mr-2" />
                      Enviar a {messageForm.client_ids.length} cliente(s)
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Tab: Historial de Mensajes */}
      {activeTab === 'message-history' && (
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Clock className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">Historial de Mensajes</h3>
              </div>

              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por cliente, asunto, mensaje..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80 text-sm"
                  />
                </div>
                {searchTerm && (
                  <span className="text-sm text-gray-500">
                    {filteredMessages.length} de {messages.length} mensajes
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {(searchTerm ? filteredMessages : messages).map(message => (
                <div
                  key={message.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Header del mensaje */}
                      <div className="flex items-center space-x-3 mb-2">
                        <MessageSquare className={`w-5 h-5 ${getMessageTypeIconClass(message.message_type)}`} />
                        <h4 className="font-semibold text-gray-900">{message.subject}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(message.priority)}`}>
                          {getPriorityText(message.priority)}
                        </span>
                        {message.read_status ? (
                          <span className="bg-green-100 text-green-800 px-2 py-1 text-xs rounded-full">
                            <CheckCircle className="w-3 h-3 inline mr-1" />
                            Leído
                          </span>
                        ) : (
                          <span className="bg-orange-100 text-orange-800 px-2 py-1 text-xs rounded-full">
                            <Mail className="w-3 h-3 inline mr-1" />
                            No leído
                          </span>
                        )}
                      </div>

                      {/* Destinatario */}
                      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                        <User className="w-4 h-4" />
                        <span><strong>Para:</strong> {message.client_name} ({message.client_email})</span>
                      </div>

                      {/* Contenido del mensaje */}
                      <div className="text-gray-800 text-sm bg-gray-50 p-3 rounded-lg mb-3">
                        {message.message}
                      </div>

                      {/* Footer del mensaje */}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-4">
                          <span>
                            <Calendar className="w-3 h-3 inline mr-1" />
                            Enviado: {formatDate(message.created_at)}
                          </span>
                          {message.read_status && message.read_at && (
                            <span>
                              <Eye className="w-3 h-3 inline mr-1" />
                              Leído: {formatDate(message.read_at)}
                            </span>
                          )}
                          {message.expires_at && (
                            <span>
                              <Clock className="w-3 h-3 inline mr-1" />
                              Vence: {formatDate(message.expires_at)}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => deleteMessage(message.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Eliminar mensaje"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {(searchTerm ? filteredMessages : messages).length === 0 && (
                <div className="text-center py-12">
                  <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  {searchTerm ? (
                    <div>
                      <p className="text-gray-500 mb-2">No se encontraron mensajes con "{searchTerm}"</p>
                      <button
                        onClick={() => setSearchTerm('')}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Limpiar búsqueda
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-500">No hay mensajes en el historial</p>
                      <button
                        onClick={() => setActiveTab('send-message')}
                        className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                      >
                        <Plus className="w-4 h-4 inline mr-2" />
                        Enviar Primer Mensaje
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Estado de Clientes */}
      {activeTab === 'client-status' && (
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Users className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-bold text-gray-900">Estado de Clientes</h3>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar cliente, empresa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-80 text-sm"
                />
              </div>
            </div>
            {searchTerm && (
              <div className="mt-2 text-sm text-gray-500">
                Mostrando {filteredClients.length} de {clients.length} clientes
              </div>
            )}
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(searchTerm ? filteredClients : clients).map(client => (
                <div
                  key={client.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200"
                >
                  {/* Header del cliente */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <User className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{client.company_name}</h4>
                        <p className="text-sm text-gray-600">{client.email}</p>
                        <p className="text-xs text-gray-500">{client.contact_name}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(client.subscription_status)}`}>
                      {client.subscription_status === 'active' ? '✅ Activo' : '⏸️ Inactivo'}
                    </span>
                  </div>

                  {/* Estadísticas del cliente */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="text-center bg-gray-50 rounded-lg p-2">
                      <div className="text-lg font-bold text-gray-900">{client.unread_messages}</div>
                      <div className="text-xs text-gray-600">No Leídos</div>
                    </div>
                    <div className="text-center bg-gray-50 rounded-lg p-2">
                      <div className="text-lg font-bold text-gray-900">
                        {getClientMessageCount(client.id)}
                      </div>
                      <div className="text-xs text-gray-600">Total Msgs</div>
                    </div>
                  </div>

                  {/* Último acceso */}
                  {client.last_activity && (
                    <div className="text-xs text-gray-500 mb-3">
                      <Clock className="w-3 h-3 inline mr-1" />
                      Último acceso: {formatDate(client.last_activity)}
                    </div>
                  )}

                  {/* Botón de acción */}
                  <button
                    onClick={() => selectClientForMessage(client)}
                    className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm whitespace-nowrap"
                  >
                    <Send className="w-4 h-4 inline mr-2" />
                    Enviar Mensaje
                  </button>
                </div>
              ))}

              {(searchTerm ? filteredClients : clients).length === 0 && (
                <div className="col-span-full text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  {searchTerm ? (
                    <div>
                      <p className="text-gray-500 mb-2">No se encontraron clientes con "{searchTerm}"</p>
                      <button
                        onClick={() => setSearchTerm('')}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Limpiar búsqueda
                      </button>
                    </div>
                  ) : (
                    <p className="text-gray-500">No se encontraron clientes</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Panel informativo */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <Info className="w-6 h-6 text-purple-600 mt-1" />
          <div>
            <h3 className="font-bold text-purple-800 mb-2">📧 Sistema de Mensajería Unidireccional</h3>
            <p className="text-purple-700 mb-3">
              Herramienta de comunicación directa del administrador hacia clientes individuales. Los mensajes aparecen como notificaciones en el dashboard del cliente.
            </p>
            <div className="text-sm text-purple-600 space-y-1">
              <div><strong>Características del sistema:</strong></div>
              <div>• 📤 Envío unidireccional - clientes NO pueden responder</div>
              <div>• 🎯 Destinatarios múltiples - un mensaje a varios clientes</div>
              <div>• 🏷️ Categorización por tipo y prioridad</div>
              <div>• ⏰ Mensajes con vencimiento automático</div>
              <div>• 👁️ Seguimiento de lectura en tiempo real</div>
              <div>• 📊 Estadísticas completas de engagement</div>
              <div>• 🔍 Búsqueda inteligente en todos los módulos</div>
              <div className="mt-2 pt-2 border-t border-purple-300">
                <div className="font-medium text-purple-800">Tipos de mensaje disponibles:</div>
                <div>• 🔔 Notificación general • ⚠️ Alerta importante • ℹ️ Actualización del sistema</div>
                <div>• ⏰ Recordatorio de acción • 🚨 Mensaje urgente</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}