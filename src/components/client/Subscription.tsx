import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { CreditCard, Calendar, AlertCircle, CheckCircle, Clock, Building, ArrowUp } from 'lucide-react';
import { useClientData } from '../../hooks/useClientData';
import CheckoutModal from './CheckoutModal';

export default function Subscription() {
  const navigate = useNavigate();
  const { client, loading, error, refreshData } = useClientData();
  const [searchParams, setSearchParams] = useSearchParams();
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  useEffect(() => {
    // Check if we should auto-open checkout modal (from registration)
    if (searchParams.get('showCheckout') === 'true') {
      setShowCheckoutModal(true);
      // Remove the query parameter
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (client) {
      // Simular datos de suscripción basados en el cliente real
      const mockSubscription = {
        id: `sub_${client.id}`,
        plan: client.subscription_plan,
        status: client.subscription_status,
        current_period_start: new Date().toISOString().split('T')[0],
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };
      setSubscriptionData(mockSubscription);
    }
  }, [client]);

  const handleUpgradeSuccess = () => {
    refreshData();
    setShowCheckoutModal(false);
    // Navigate to client dashboard after successful payment
    navigate('/client/dashboard', { replace: true });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      case 'past_due':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'basic':
        return 'text-blue-600 bg-blue-100';
      case 'professional':
        return 'text-purple-600 bg-purple-100';
      case 'enterprise':
        return 'text-indigo-600 bg-indigo-100';
      case 'custom':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStoragePercentage = () => {
    if (!client || client.storage_limit === 0) return 0;
    return Math.round((client.storage_used / client.storage_limit) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando suscripción del tenant...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={refreshData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Suscripción</h1>
        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
          🔒 DATOS AISLADOS
        </div>
        <button 
          onClick={() => setShowCheckoutModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
        >
          <ArrowUp className="w-4 h-4 mr-2" />
          Actualizar Plan
        </button>
      </div>

      {/* Current Plan */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Plan Actual</h2>
          <div className="flex items-center space-x-2">
            <Building className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-600">{client?.company_name}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center space-x-3 mb-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPlanColor(client?.subscription_plan || '')}`}>
                {client?.subscription_plan?.toUpperCase()}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(client?.subscription_status || '')}`}>
                {client?.subscription_status === 'active' ? 'Activo' : 
                 client?.subscription_status === 'cancelled' ? 'Cancelado' : 
                 client?.subscription_status === 'suspended' ? 'Suspendido' : 'Desconocido'}
              </span>
            </div>

            {subscriptionData && (
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Inicio: {new Date(subscriptionData.current_period_start).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Renovación: {new Date(subscriptionData.current_period_end).toLocaleDateString()}</span>
                </div>
              </div>
            )}
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-3">Uso de Recursos</h3>
            <div className="space-y-3">
              {/* Storage Usage */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Almacenamiento</span>
                  <span className="text-gray-900">
                    {formatBytes(client?.storage_used || 0)} / {formatBytes(client?.storage_limit || 0)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(getStoragePercentage(), 100)}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500">{getStoragePercentage()}% utilizado</span>
              </div>

              {/* Tokens Available */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Tokens Disponibles</span>
                  <span className="text-gray-900">{client?.tokens_available || 0}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((client?.tokens_available || 0) / 1000 * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Features */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Características del Plan</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Básico</h3>
            <div className="text-2xl font-bold text-blue-600 mb-2">€29/mes</div>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 500 MB almacenamiento</li>
              <li>• 500 tokens IA</li>
              <li>• 1 proyecto</li>
              <li>• Soporte email</li>
            </ul>
          </div>

          <div className="text-center p-4 border-2 border-green-500 rounded-lg bg-green-50">
            <h3 className="font-medium text-gray-900 mb-2">Profesional</h3>
            <div className="text-2xl font-bold text-green-600 mb-2">€79/mes</div>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 5 GB almacenamiento</li>
              <li>• 2000 tokens IA</li>
              <li>• 10 proyectos</li>
              <li>• Soporte prioritario</li>
            </ul>
            <div className="mt-3">
              <span className="bg-green-600 text-white px-2 py-1 rounded text-xs">Plan Actual</span>
            </div>
          </div>

          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Enterprise</h3>
            <div className="text-2xl font-bold text-purple-600 mb-2">€199/mes</div>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 50 GB almacenamiento</li>
              <li>• 10000 tokens IA</li>
              <li>• Proyectos ilimitados</li>
              <li>• Soporte 24/7</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Billing History */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Historial de Facturación</h2>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium text-gray-900">Plan Profesional - Enero 2025</div>
                <div className="text-sm text-gray-600">Pagado el 1 de enero, 2025</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium text-gray-900">€79.00</div>
              <div className="text-sm text-green-600">Pagado</div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium text-gray-900">Plan Profesional - Diciembre 2024</div>
                <div className="text-sm text-gray-600">Pagado el 1 de diciembre, 2024</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium text-gray-900">€79.00</div>
              <div className="text-sm text-green-600">Pagado</div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <div className="font-medium text-gray-900">Plan Profesional - Febrero 2025</div>
                <div className="text-sm text-gray-600">Próximo pago el 1 de febrero, 2025</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium text-gray-900">€79.00</div>
              <div className="text-sm text-yellow-600">Pendiente</div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Método de Pago</h2>
          <button className="text-green-600 hover:text-green-700 font-medium">
            Actualizar
          </button>
        </div>

        <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
          <CreditCard className="h-8 w-8 text-gray-400" />
          <div>
            <div className="font-medium text-gray-900">•••• •••• •••• 4242</div>
            <div className="text-sm text-gray-600">Visa que expira 12/26</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones</h2>
        
        <div className="space-y-3">
          <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="font-medium text-gray-900">Descargar Facturas</div>
            <div className="text-sm text-gray-600">Obtener todas las facturas en PDF</div>
          </button>
          
          <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="font-medium text-gray-900">Cambiar Plan</div>
            <div className="text-sm text-gray-600">Actualizar o degradar tu suscripción</div>
          </button>
          
          <button className="w-full text-left p-3 border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-red-600">
            <div className="font-medium">Cancelar Suscripción</div>
            <div className="text-sm">Cancelar tu suscripción actual</div>
          </button>
        </div>
      </div>

      {/* Checkout Modal */}
      {client && (
        <CheckoutModal
          isOpen={showCheckoutModal}
          onClose={() => setShowCheckoutModal(false)}
          currentClient={client}
          onUpgradeSuccess={handleUpgradeSuccess}
        />
      )}
    </div>
  );
}