import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { CreditCard, Calendar, AlertCircle, CheckCircle, Clock, Building, ArrowUp, Download, Edit, X, AlertTriangle } from 'lucide-react';
import { useClientData } from '../../hooks/useClientData';
import { supabaseServiceClient } from '../../lib/supabase-real';
import { getAllReceipts, getSEPAMandates } from '../../lib/supabase';
import CheckoutModal from './CheckoutModal';

export default function Subscription() {
  const navigate = useNavigate();
  const { client, loading, error, refreshData } = useClientData();
  const [searchParams, setSearchParams] = useSearchParams();
  const [realSubscriptionData, setRealSubscriptionData] = useState<any>(null);
  const [realPaymentMethod, setRealPaymentMethod] = useState<any>(null);
  const [realBillingHistory, setRealBillingHistory] = useState<any[]>([]);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

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
      loadRealSubscriptionData();
    }
  }, [client]);

  const loadRealSubscriptionData = async () => {
    if (!client) return;
    
    try {
      setLoadingData(true);
      
      // Load real subscription data from suscripciones table
      const { data: suscripcion, error: suscripcionError } = await supabaseServiceClient
        .from('suscripciones')
        .select('*')
        .eq('tenant_id', client.tenant_id)
        .single();

      if (suscripcionError) {
        console.warn('No subscription found, using client data');
      }

      // Load real payment method (SEPA mandates or receipts)
      const [sepaData, receiptsData] = await Promise.all([
        getSEPAMandates(client.client_record_id || client.id),
        getAllReceipts()
      ]);

      // Filter receipts for this client
      const clientReceipts = receiptsData.filter(receipt => 
        receipt.client_id === client.client_record_id || 
        receipt.client_id === client.id
      );

      // Determine payment method from real data
      let paymentMethod = null;
      if (sepaData.length > 0) {
        const latestSepa = sepaData[0];
        paymentMethod = {
          type: 'sepa',
          iban: latestSepa.iban,
          banco: latestSepa.banco_nombre,
          status: latestSepa.status
        };
      } else if (clientReceipts.length > 0) {
        const latestReceipt = clientReceipts[0];
        paymentMethod = {
          type: 'card',
          method: latestReceipt.payment_method,
          gateway: latestReceipt.gateway_name,
          last_payment: latestReceipt.payment_date
        };
      }

      setRealSubscriptionData(suscripcion || {
        plan: client.subscription_plan,
        estado: client.subscription_status,
        created_at: client.created_at
      });
      
      setRealPaymentMethod(paymentMethod);
      setRealBillingHistory(clientReceipts);
      
    } catch (error) {
      console.error('Error loading real subscription data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleUpgradeSuccess = () => {
    refreshData();
    loadRealSubscriptionData();
    setShowCheckoutModal(false);
    
    // CRITICAL: Update client status from trial to active after successful payment
    console.log('✅ [Subscription] Payment successful - activating client account');
    
    // Force refresh of auth context to update subscription status
    window.location.href = '/client/dashboard';
  };

  const handleDownloadInvoices = async () => {
    try {
      if (!client) {
        alert('❌ Error: No se encontraron datos del cliente');
        return;
      }
      
      if (realBillingHistory.length === 0) {
        alert('No hay facturas disponibles para descargar');
        return;
      }

      // Generate CSV with real billing data
      const csvContent = [
        ['Fecha', 'Descripción', 'Importe', 'Estado', 'Método de Pago'].join(','),
        ...realBillingHistory.map(receipt => [
          new Date(receipt.payment_date || receipt.created_at).toLocaleDateString('es-ES'),
          receipt.description,
          `€${receipt.amount}`,
          receipt.status === 'paid' ? 'Pagado' : receipt.status,
          receipt.payment_method
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `facturas_${client.company_name}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      
      alert('✅ Facturas descargadas correctamente');
      
    } catch (error) {
      console.error('Error downloading invoices:', error);
      alert('❌ Error al descargar facturas: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  const handleCancelSubscription = async () => {
    if (!client?.tenant_id) {
      alert('❌ Error: No se encontró información del tenant');
      return;
    }
    
    if (!confirm('¿Estás seguro de que quieres cancelar tu suscripción? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      console.log('🔄 [Subscription] Cancelling subscription for tenant:', client.tenant_id);
      
      // Update subscription status to cancelled
      const { error } = await supabaseServiceClient
        .from('suscripciones')
        .update({ 
          estado: 'cancelada',
          updated_at: new Date().toISOString()
        })
        .eq('tenant_id', client.tenant_id);

      if (error) {
        console.error('❌ [Subscription] Error cancelling subscription:', error);
        throw new Error(`Error al cancelar suscripción: ${error.message}`);
      }

      console.log('✅ [Subscription] Subscription cancelled successfully');
      alert('✅ Suscripción cancelada correctamente. Tu acceso continuará hasta el final del período actual.');
      
      // Force refresh of all data
      await refreshData();
      await loadRealSubscriptionData();
      
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      alert('❌ Error al cancelar suscripción: ' + (error instanceof Error ? error.message : 'Error desconocido') + '. Por favor, contacta con soporte.');
    }
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Suscripción</h1>
          <p className="text-gray-600">Gestiona tu plan y facturación</p>
          <div className="mt-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium inline-block">
            🔒 DATOS AISLADOS
          </div>
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
          <h2 className="text-lg font-semibold text-gray-900">Información de Suscripción</h2>
          <div className="flex items-center space-x-2">
            <Building className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-600">{client?.company_name}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            {loadingData ? (
              <div className="flex items-center space-x-2 mb-3">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-600">Cargando datos reales...</span>
              </div>
            ) : (
            <div className="flex items-center space-x-3 mb-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPlanColor(client?.subscription_plan || '')}`}>
                {realSubscriptionData?.plan?.toUpperCase() || client?.subscription_plan?.toUpperCase()}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(client?.subscription_status || '')}`}>
                {(realSubscriptionData?.estado || client?.subscription_status) === 'activa' || 
                 (realSubscriptionData?.estado || client?.subscription_status) === 'active' ? 'Activo' : 
                 (realSubscriptionData?.estado || client?.subscription_status) === 'cancelada' || 
                 (realSubscriptionData?.estado || client?.subscription_status) === 'cancelled' ? 'Cancelado' : 
                 (realSubscriptionData?.estado || client?.subscription_status) === 'suspended' ? 'Suspendido' : 'Desconocido'}
              </span>
            </div>
            )}

            {realSubscriptionData && (
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Creada: {new Date(realSubscriptionData.created_at).toLocaleDateString('es-ES')}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Plan: {realSubscriptionData.plan || client?.subscription_plan}</span>
                </div>
                {realSubscriptionData.limites && (
                  <div className="text-xs text-gray-500 mt-2">
                    Límites: {JSON.stringify(realSubscriptionData.limites)}
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-3">Método de Pago Actual</h3>
            {loadingData ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-600">Cargando método de pago...</span>
              </div>
            ) : realPaymentMethod ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                {realPaymentMethod.type === 'sepa' ? (
                  <div>
                    <div className="flex items-center mb-2">
                      <Building className="h-5 w-5 text-green-600 mr-2" />
                      <span className="font-medium text-gray-900">Domiciliación SEPA</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div>IBAN: {realPaymentMethod.iban.replace(/(.{4})/g, '$1 ').trim()}</div>
                      <div>Banco: {realPaymentMethod.banco}</div>
                      <div>Estado: {realPaymentMethod.status === 'active' ? 'Activo' : realPaymentMethod.status}</div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center mb-2">
                      <CreditCard className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="font-medium text-gray-900">Tarjeta de Crédito</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div>Método: {realPaymentMethod.method}</div>
                      <div>Gateway: {realPaymentMethod.gateway}</div>
                      {realPaymentMethod.last_payment && (
                        <div>Último pago: {new Date(realPaymentMethod.last_payment).toLocaleDateString('es-ES')}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                  <span className="text-sm text-yellow-800">No hay método de pago configurado</span>
                </div>
              </div>
            )}
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
        
        {loadingData ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Cargando historial real...</span>
          </div>
        ) : realBillingHistory.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Sin historial de facturación</h3>
            <p className="text-gray-600">No hay facturas registradas para este cliente</p>
          </div>
        ) : (
          <div className="space-y-3">
            {realBillingHistory.map((receipt) => (
              <div key={receipt.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  {receipt.status === 'paid' ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : receipt.status === 'pending' ? (
                    <Clock className="h-5 w-5 text-yellow-600" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  )}
                  <div>
                    <div className="font-medium text-gray-900">{receipt.description}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(receipt.payment_date || receipt.created_at).toLocaleDateString('es-ES')} • {receipt.payment_method}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">€{receipt.amount}</div>
                  <div className={`text-sm ${
                    receipt.status === 'paid' ? 'text-green-600' : 
                    receipt.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {receipt.status === 'paid' ? 'Pagado' : 
                     receipt.status === 'pending' ? 'Pendiente' : 
                     receipt.status === 'failed' ? 'Fallido' : receipt.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Method Management */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Método de Pago</h2>
          <button 
            onClick={() => setShowCheckoutModal(true)}
            className="text-green-600 hover:text-green-700 font-medium flex items-center"
          >
            <Edit className="h-4 w-4 mr-1" />
            Actualizar
          </button>
        </div>

        {loadingData ? (
          <div className="flex items-center space-x-2 p-4">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">Cargando método de pago...</span>
          </div>
        ) : realPaymentMethod ? (
          <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
            {realPaymentMethod.type === 'sepa' ? (
              <>
                <Building className="h-8 w-8 text-green-600" />
                <div>
                  <div className="font-medium text-gray-900">
                    Domiciliación SEPA - {realPaymentMethod.iban.slice(-4)}
                  </div>
                  <div className="text-sm text-gray-600">{realPaymentMethod.banco}</div>
                </div>
              </>
            ) : (
              <>
                <CreditCard className="h-8 w-8 text-blue-600" />
                <div>
                  <div className="font-medium text-gray-900">{realPaymentMethod.method}</div>
                  <div className="text-sm text-gray-600">Gateway: {realPaymentMethod.gateway}</div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
              <span className="text-sm text-yellow-800">No hay método de pago configurado</span>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones</h2>
        
        <div className="space-y-3">
          <button 
            onClick={handleDownloadInvoices}
            disabled={realBillingHistory.length === 0}
            className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900 flex items-center">
                  <Download className="h-4 w-4 mr-2" />
                  Descargar Facturas
                </div>
                <div className="text-sm text-gray-600">
                  {realBillingHistory.length > 0 
                    ? `${realBillingHistory.length} factura(s) disponible(s)` 
                    : 'No hay facturas disponibles'
                  }
                </div>
              </div>
              {realBillingHistory.length > 0 && (
                <span className="text-green-600 text-sm">CSV</span>
              )}
            </div>
          </button>
          
          <button 
            onClick={() => setShowCheckoutModal(true)}
            className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900 flex items-center">
                  <ArrowUp className="h-4 w-4 mr-2" />
                  Cambiar Plan
                </div>
                <div className="text-sm text-gray-600">Actualizar o degradar tu suscripción</div>
              </div>
              <span className="text-blue-600 text-sm">Disponible</span>
            </div>
          </button>
          
          <button 
            onClick={handleCancelSubscription}
            disabled={(realSubscriptionData?.estado || client?.subscription_status) === 'cancelada'}
            className="w-full text-left p-3 border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium flex items-center">
                  <X className="h-4 w-4 mr-2" />
                  Cancelar Suscripción
                </div>
                <div className="text-sm">
                  {(realSubscriptionData?.estado || client?.subscription_status) === 'cancelada' 
                    ? 'Suscripción ya cancelada' 
                    : 'Cancelar tu suscripción actual'
                  }
                </div>
              </div>
              {(realSubscriptionData?.estado || client?.subscription_status) !== 'cancelada' && (
                <span className="text-red-600 text-sm">Confirmar</span>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Checkout Modal */}
      {(client || showCheckoutModal) && (
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