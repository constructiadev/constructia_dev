import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getCurrentClientData } from '../../lib/supabase';
import { CreditCard, Calendar, CheckCircle, AlertCircle, Crown, Zap, Building } from 'lucide-react';

interface ClientData {
  id: string;
  subscription_plan: string;
  subscription_status: string;
  storage_used: number;
  storage_limit: number;
  documents_processed: number;
  tokens_available: number;
  created_at: string;
}

export default function Subscription() {
  const { user } = useAuth();
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadClientData();
    }
  }, [user]);

  const loadClientData = async () => {
    try {
      setLoading(true);
      const data = await getCurrentClientData(user!.id);
      setClientData(data);
    } catch (error) {
      console.error('Error loading client data:', error);
    } finally {
      setLoading(false);
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
    if (!clientData) return 0;
    return Math.round((clientData.storage_used / clientData.storage_limit) * 100);
  };

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'basic':
        return <CreditCard className="w-6 h-6" />;
      case 'professional':
        return <Zap className="w-6 h-6" />;
      case 'enterprise':
        return <Crown className="w-6 h-6" />;
      case 'custom':
        return <Building className="w-6 h-6" />;
      default:
        return <CreditCard className="w-6 h-6" />;
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'basic':
        return 'text-blue-600 bg-blue-100';
      case 'professional':
        return 'text-purple-600 bg-purple-100';
      case 'enterprise':
        return 'text-yellow-600 bg-yellow-100';
      case 'custom':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'suspended':
      case 'cancelled':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!clientData) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-800">Error al cargar los datos de suscripción</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Mi Suscripción</h1>
        <div className="flex items-center space-x-2">
          {getStatusIcon(clientData.subscription_status)}
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            clientData.subscription_status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {clientData.subscription_status === 'active' ? 'Activa' : 'Inactiva'}
          </span>
        </div>
      </div>

      {/* Plan Actual */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Plan Actual</h2>
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${getPlanColor(clientData.subscription_plan)}`}>
            {getPlanIcon(clientData.subscription_plan)}
            <span className="font-medium capitalize">{clientData.subscription_plan}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{clientData.documents_processed}</div>
            <div className="text-sm text-gray-600">Documentos Procesados</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{clientData.tokens_available}</div>
            <div className="text-sm text-gray-600">Tokens Disponibles</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{getStoragePercentage()}%</div>
            <div className="text-sm text-gray-600">Almacenamiento Usado</div>
          </div>
        </div>
      </div>

      {/* Uso de Almacenamiento */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Uso de Almacenamiento</h2>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Usado: {formatBytes(clientData.storage_used)}</span>
            <span className="text-gray-600">Límite: {formatBytes(clientData.storage_limit)}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-300 ${
                getStoragePercentage() > 90 ? 'bg-red-500' :
                getStoragePercentage() > 75 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(getStoragePercentage(), 100)}%` }}
            ></div>
          </div>
          {getStoragePercentage() > 90 && (
            <div className="flex items-center text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 mr-1" />
              Almacenamiento casi lleno. Considera actualizar tu plan.
            </div>
          )}
        </div>
      </div>

      {/* Información de Facturación */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Información de Facturación</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div>
              <div className="text-sm text-gray-600">Cliente desde</div>
              <div className="font-medium">
                {new Date(clientData.created_at).toLocaleDateString('es-ES')}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <CreditCard className="w-5 h-5 text-gray-400" />
            <div>
              <div className="text-sm text-gray-600">Método de pago</div>
              <div className="font-medium">Tarjeta terminada en ****</div>
            </div>
          </div>
        </div>
      </div>

      {/* Planes Disponibles */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Planes Disponibles</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-2 mb-3">
              <CreditCard className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-blue-600">Básico</h3>
            </div>
            <div className="text-2xl font-bold mb-2">€29/mes</div>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 500 MB almacenamiento</li>
              <li>• 100 documentos/mes</li>
              <li>• Soporte básico</li>
            </ul>
          </div>
          
          <div className="border-2 border-purple-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-purple-50">
            <div className="flex items-center space-x-2 mb-3">
              <Zap className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-purple-600">Profesional</h3>
              <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded">Recomendado</span>
            </div>
            <div className="text-2xl font-bold mb-2">€79/mes</div>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 5 GB almacenamiento</li>
              <li>• 500 documentos/mes</li>
              <li>• Soporte prioritario</li>
              <li>• API avanzada</li>
            </ul>
          </div>
          
          <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-2 mb-3">
              <Crown className="w-5 h-5 text-yellow-600" />
              <h3 className="font-semibold text-yellow-600">Enterprise</h3>
            </div>
            <div className="text-2xl font-bold mb-2">€199/mes</div>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Almacenamiento ilimitado</li>
              <li>• Documentos ilimitados</li>
              <li>• Soporte 24/7</li>
              <li>• Integración personalizada</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}