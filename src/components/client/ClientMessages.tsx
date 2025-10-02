import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Bell,
  Clock,
  AlertTriangle,
  Info,
  MessageSquare,
  CheckCircle,
  Calendar,
  User,
  RefreshCw
} from 'lucide-react';
import { supabaseServiceClient } from '../../lib/supabase-real';
import { useAuth } from '../../lib/auth-context';

interface ClientMessage {
  id: string;
  tipo: 'info' | 'notificacion' | 'alerta' | 'recordatorio' | 'urgencia';
  titulo: string;
  contenido: string;
  prioridad: 'baja' | 'media' | 'alta';
  vence?: string;
  estado: 'programado' | 'enviado' | 'vencido';
  created_at: string;
  updated_at: string;
}

interface ClientMessagesProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId: string;
  userEmail: string;
}

export default function ClientMessages({ isOpen, onClose, tenantId, userEmail }: ClientMessagesProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ClientMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadMessages();
    }
  }, [isOpen, tenantId, userEmail]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📧 [ClientMessages] Loading messages for tenant:', tenantId, 'email:', userEmail);

      // CRITICAL FIX: Load messages using both tenant_id and email in destinatarios
      const { data: mensajesData, error: mensajesError } = await supabaseServiceClient
        .from('mensajes')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (mensajesError) {
        console.error('Error loading client messages:', mensajesError);
        setError('Error al cargar mensajes');
        return;
      }

      // CRITICAL FIX: Filter messages that contain the user's email in destinatarios array
      const filteredMessages = (mensajesData || []).filter(mensaje => {
        if (!mensaje.destinatarios || !Array.isArray(mensaje.destinatarios)) {
          return false;
        }
        
        // Check if user email is in the destinatarios array
        const isForThisUser = mensaje.destinatarios.includes(userEmail);
        
        if (isForThisUser) {
          console.log('📧 [ClientMessages] Found message for user:', mensaje.titulo);
        }
        
        return isForThisUser;
      });

      console.log('📧 [ClientMessages] Total messages found:', mensajesData?.length || 0);
      console.log('📧 [ClientMessages] Messages for this user:', filteredMessages.length);
      
      setMessages(filteredMessages);
    } catch (error) {
      console.error('Error in loadMessages:', error);
      setError('Error al cargar mensajes');
    } finally {
      setLoading(false);
    }
  };

  const refreshMessages = async () => {
    console.log('🔄 [ClientMessages] Refreshing messages...');
    setRefreshing(true);
    await loadMessages();
    setRefreshing(false);
  };

  const markAsRead = async (messageId: string) => {
    try {
      console.log('📧 [ClientMessages] Marking message as read:', messageId);
      
      // Marcar mensaje como leído actualizando el estado
      const { error } = await supabaseServiceClient
        .from('mensajes')
        .update({ 
          estado: 'enviado',
          updated_at: new Date().toISOString()
        })
        .eq('id', messageId);

      if (error) {
        console.error('Error marking message as read:', error);
        return;
      }

      console.log('✅ [ClientMessages] Message marked as read successfully');

      // Actualizar estado local
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, estado: 'enviado' as const }
          : msg
      ));
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const getMessageTypeIcon = (tipo: string) => {
    switch (tipo) {
      case 'urgencia':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'alerta':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />;
      case 'recordatorio':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'notificacion':
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getMessageTypeColor = (tipo: string) => {
    switch (tipo) {
      case 'urgencia':
        return 'bg-red-50 border-red-200';
      case 'alerta':
        return 'bg-orange-50 border-orange-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      case 'recordatorio':
        return 'bg-yellow-50 border-yellow-200';
      case 'notificacion':
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getPriorityColor = (prioridad: string) => {
    switch (prioridad) {
      case 'alta':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'media':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'baja':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityText = (prioridad: string) => {
    switch (prioridad) {
      case 'alta':
        return '🔴 Alta';
      case 'media':
        return '🟡 Media';
      case 'baja':
        return '🟢 Baja';
      default:
        return prioridad;
    }
  };

  const getTypeText = (tipo: string) => {
    switch (tipo) {
      case 'urgencia':
        return '🚨 Urgente';
      case 'alerta':
        return '⚠️ Alerta';
      case 'info':
        return 'ℹ️ Información';
      case 'recordatorio':
        return '⏰ Recordatorio';
      case 'notificacion':
        return '🔔 Notificación';
      default:
        return tipo;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES');
  };

  const isMessageExpired = (message: ClientMessage) => {
    if (!message.vence) return false;
    return new Date(message.vence) < new Date();
  };

  const unreadMessages = messages.filter(m => m.estado === 'programado').length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white/20 p-3 rounded-full mr-4">
                <Mail className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Mensajes del Administrador</h2>
                <p className="text-blue-100">
                  {messages.length} mensajes • {unreadMessages} sin leer
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={refreshMessages}
                disabled={refreshing}
                className="bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg transition-colors flex items-center"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Actualizando...' : 'Actualizar'}
              </button>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando mensajes...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={loadMessages}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Reintentar
              </button>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay mensajes</h3>
              <p className="text-gray-600">
                No tienes mensajes del administrador en este momento.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`border rounded-lg p-4 transition-all cursor-pointer hover:shadow-md ${
                    getMessageTypeColor(message.tipo)
                  } ${
                    message.estado === 'programado' ? 'border-l-4 border-l-blue-500' : ''
                  }`}
                  onClick={() => markAsRead(message.id)}
                >
                  {/* Header del mensaje */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getMessageTypeIcon(message.tipo)}
                      <div>
                        <h4 className="font-semibold text-gray-900">{message.titulo}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(message.prioridad)}`}>
                            {getPriorityText(message.prioridad)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {getTypeText(message.tipo)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {message.estado === 'programado' && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 text-xs rounded-full">
                          <Mail className="w-3 h-3 inline mr-1" />
                          Nuevo
                        </span>
                      )}
                      {message.estado === 'enviado' && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 text-xs rounded-full">
                          <CheckCircle className="w-3 h-3 inline mr-1" />
                          Leído
                        </span>
                      )}
                      {isMessageExpired(message) && (
                        <span className="bg-red-100 text-red-800 px-2 py-1 text-xs rounded-full">
                          ⏰ Vencido
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Contenido del mensaje */}
                  <div className="text-gray-800 text-sm bg-white/50 p-3 rounded-lg mb-3">
                    {message.contenido}
                  </div>

                  {/* Footer del mensaje */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-4">
                      <span>
                        <Calendar className="w-3 h-3 inline mr-1" />
                        Recibido: {formatDate(message.created_at)}
                      </span>
                      {message.vence && (
                        <span className={isMessageExpired(message) ? 'text-red-600' : ''}>
                          <Clock className="w-3 h-3 inline mr-1" />
                          {isMessageExpired(message) ? 'Venció' : 'Vence'}: {formatDate(message.vence)}
                        </span>
                      )}
                    </div>
                    {message.estado === 'programado' && (
                      <span className="text-blue-600 font-medium">
                        Haz clic para marcar como leído
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-xl border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-600">
              <Info className="w-4 h-4 mr-2" />
              <span>Los mensajes se marcan como leídos automáticamente al hacer clic</span>
            </div>
            <div className="text-sm text-gray-500">
              {unreadMessages > 0 && (
                <span className="text-blue-600 font-medium">
                  {unreadMessages} mensaje{unreadMessages > 1 ? 's' : ''} sin leer
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}