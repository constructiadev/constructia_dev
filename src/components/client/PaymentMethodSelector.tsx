import React, { useState } from 'react';
import { 
  CreditCard, 
  DollarSign, 
  Building, 
  Smartphone,
  CheckCircle,
  AlertTriangle,
  Euro,
  Shield,
  Clock,
  Info
} from 'lucide-react';
import { usePaymentGateways } from '../../context/PaymentGatewayContext';
import SEPAMandateForm from './SEPAMandateForm';

interface PaymentMethodSelectorProps {
  amount: number;
  currency: string;
  onSelect: (gatewayId: string) => void;
  selectedGatewayId?: string;
}

export default function PaymentMethodSelector({ 
  amount, 
  currency, 
  onSelect, 
  selectedGatewayId 
}: PaymentMethodSelectorProps) {
  const { getActiveGatewaysForCurrency, calculateCommission } = usePaymentGateways();
  const [showCommissionDetails, setShowCommissionDetails] = useState(false);
  const [showSEPAForm, setShowSEPAForm] = useState(false);
  const [selectedSEPAGateway, setSelectedSEPAGateway] = useState<any>(null);

  const availableGateways = getActiveGatewaysForCurrency(currency);

  const getGatewayIcon = (type: string) => {
    switch (type) {
      case 'stripe': return CreditCard;
      case 'paypal': return DollarSign;
      case 'sepa': return Building;
      case 'bizum': return Smartphone;
      default: return CreditCard;
    }
  };

  const getGatewayColor = (type: string) => {
    switch (type) {
      case 'stripe': return 'border-blue-500 bg-blue-50';
      case 'paypal': return 'border-blue-400 bg-blue-50';
      case 'sepa': return 'border-green-500 bg-green-50';
      case 'bizum': return 'border-orange-500 bg-orange-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const formatCommission = (gatewayId: string) => {
    const commission = calculateCommission(gatewayId, amount);
    return `€${commission.toFixed(2)}`;
  };

  const getTotalAmount = (gatewayId: string) => {
    const commission = calculateCommission(gatewayId, amount);
    return amount + commission;
  };

  const isGatewayAvailable = (gateway: any) => {
    return amount >= (gateway.min_amount || 0) && 
           amount <= (gateway.max_amount || Infinity) &&
           gateway.status === 'active';
  };

  const handleSEPASelection = (gateway: any) => {
    setSelectedSEPAGateway(gateway);
    setShowSEPAForm(true);
  };

  const handleSEPAMandateSubmit = async (mandateData: any) => {
    try {
      // Aquí se procesaría el mandato SEPA
      console.log('Mandato SEPA firmado:', mandateData);
      
      // Simular procesamiento
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Notificar selección del gateway SEPA
      onSelect(selectedSEPAGateway.id);
      
      alert('¡Mandato SEPA firmado exitosamente! El servicio comenzará una vez procesado el mandato.');
      
    } catch (error) {
      console.error('Error al procesar mandato SEPA:', error);
      throw error;
    }
  };

  if (availableGateways.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <AlertTriangle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
          No hay métodos de pago disponibles
        </h3>
        <p className="text-yellow-700">
          No se encontraron pasarelas de pago activas para {currency}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Seleccionar Método de Pago</h3>
            <p className="text-gray-600">Elige cómo quieres realizar el pago</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Importe:</p>
            <p className="text-xl font-bold text-gray-900">{currency} {amount.toFixed(2)}</p>
          </div>
        </div>

        {/* Información de Comisiones */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Info className="h-5 w-5 text-blue-600 mr-2" />
              <span className="font-medium text-blue-800">Información de Comisiones</span>
            </div>
            <button
              onClick={() => setShowCommissionDetails(!showCommissionDetails)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {showCommissionDetails ? 'Ocultar' : 'Ver'} detalles
            </button>
          </div>
          
          {showCommissionDetails && (
            <div className="mt-3 pt-3 border-t border-blue-200">
              <p className="text-sm text-blue-700">
                Las comisiones se calculan automáticamente según la pasarela seleccionada y 
                se añaden al importe total. Los precios mostrados incluyen todas las tasas aplicables.
              </p>
            </div>
          )}
        </div>

        {/* Métodos de Pago */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableGateways.map((gateway) => {
            const Icon = getGatewayIcon(gateway.type);
            const isSelected = selectedGatewayId === gateway.id;
            const isAvailable = isGatewayAvailable(gateway);
            const commission = calculateCommission(gateway.id, amount);
            const totalAmount = getTotalAmount(gateway.id);

            return (
              <div
                key={gateway.id}
                className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all ${
                  isSelected
                    ? `${getGatewayColor(gateway.type)} border-opacity-100`
                    : isAvailable
                    ? 'border-gray-200 hover:border-gray-300 bg-white'
                    : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                }`}
                onClick={() => {
                  if (!isAvailable) return;
                  
                  if (gateway.type === 'sepa') {
                    handleSEPASelection(gateway);
                  } else {
                    onSelect(gateway.id);
                  }
                }}
              >
                {/* Indicador de selección */}
                {isSelected && (
                  <div className="absolute top-4 right-4">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                )}

                {/* Header del método */}
                <div className="flex items-center mb-4">
                  <div className={`w-12 h-12 ${gateway.color} rounded-lg flex items-center justify-center mr-4`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{gateway.name}</h4>
                    <p className="text-sm text-gray-600">{gateway.description}</p>
                  </div>
                </div>

                {/* Información de costos */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Importe base:</span>
                    <span className="font-medium">{currency} {amount.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Comisión:</span>
                    <span className="font-medium text-orange-600">
                      {commission > 0 ? `+ ${currency} ${commission.toFixed(2)}` : 'Gratis'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <span className="font-medium text-gray-800">Total a pagar:</span>
                    <span className="text-lg font-bold text-gray-900">
                      {currency} {totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Información adicional */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center">
                      <Shield className="h-3 w-3 mr-1" />
                      <span>Pago seguro</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{gateway.type === 'sepa' ? 'Procesamiento 1-2 días' : 'Procesamiento inmediato'}</span>
                    </div>
                  </div>
                </div>

                {/* Nota especial para SEPA */}
                {gateway.type === 'sepa' && (
                  <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                    <strong>Nota:</strong> Requiere firma de mandato SEPA. El servicio comenzará una vez firmado el mandato.
                  </div>
                )}

                {/* Estado de disponibilidad */}
                {!isAvailable && (
                  <div className="absolute inset-0 bg-gray-100 bg-opacity-75 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <AlertTriangle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-600">No disponible</p>
                      <p className="text-xs text-gray-500">
                        {amount < (gateway.min_amount || 0) 
                          ? `Mínimo: ${currency} ${gateway.min_amount}`
                          : amount > (gateway.max_amount || Infinity)
                          ? `Máximo: ${currency} ${gateway.max_amount}`
                          : 'Temporalmente no disponible'
                        }
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Información de seguridad */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start">
            <Shield className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
            <div>
              <h4 className="font-semibold text-green-800 mb-1">Pagos 100% Seguros</h4>
              <p className="text-sm text-green-700">
                Todos los pagos están protegidos con encriptación SSL de 256 bits y cumplen 
                con los estándares PCI DSS. Tus datos financieros están completamente seguros.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Mandato SEPA */}
      {showSEPAForm && (
        <SEPAMandateForm
          isOpen={showSEPAForm}
          onClose={() => setShowSEPAForm(false)}
          onSubmit={handleSEPAMandateSubmit}
          amount={amount}
          currency={currency}
          description="Suscripción ConstructIA"
          clientData={{
            name: "Cliente de Prueba",
            address: "Calle Ejemplo 123",
            city: "Madrid",
            postalCode: "28001",
            country: "España",
            taxId: "12345678A"
          }}
        />
      )}
    </>
  );
}