import React, { useState } from 'react';
import { 
  Building, 
  CreditCard, 
  Shield, 
  CheckCircle,
  AlertTriangle,
  FileText,
  Calendar,
  User,
  MapPin,
  Hash,
  Signature,
  Lock,
  Globe,
  Info,
  Download,
  Eye,
  EyeOff,
  X
} from 'lucide-react';

interface SEPAMandateData {
  deudor_nombre: string;
  deudor_direccion: string;
  deudor_codigo_postal: string;
  deudor_ciudad: string;
  deudor_pais: string;
  deudor_identificacion: string;
  iban: string;
  bic: string;
  banco_nombre: string;
  tipo_pago: 'recurrente' | 'unico';
  acepta_mandato: boolean;
  fecha_firma: string;
  ip_address: string;
  user_agent: string;
  session_id: string;
}

interface SEPAMandateFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (mandateData: SEPAMandateData) => Promise<void>;
  amount: number;
  currency: string;
  description: string;
  clientData?: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    taxId: string;
  };
}

export default function SEPAMandateForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  amount, 
  currency, 
  description,
  clientData 
}: SEPAMandateFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [mandateId] = useState(() => `SEPA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const [formData, setFormData] = useState({
    deudor_nombre: clientData?.name || '',
    deudor_direccion: clientData?.address || '',
    deudor_codigo_postal: clientData?.postalCode || '',
    deudor_ciudad: clientData?.city || '',
    deudor_pais: clientData?.country || 'España',
    deudor_identificacion: clientData?.taxId || '',
    iban: '',
    bic: '',
    banco_nombre: '',
    tipo_pago: 'recurrente' as const,
    acepta_mandato: false
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.deudor_nombre) newErrors.deudor_nombre = 'El nombre del titular es obligatorio';
    if (!formData.deudor_direccion) newErrors.deudor_direccion = 'La dirección es obligatoria';
    if (!formData.deudor_codigo_postal) newErrors.deudor_codigo_postal = 'El código postal es obligatorio';
    if (!formData.deudor_ciudad) newErrors.deudor_ciudad = 'La ciudad es obligatoria';
    if (!formData.deudor_pais) newErrors.deudor_pais = 'El país es obligatorio';
    if (!formData.deudor_identificacion) newErrors.deudor_identificacion = 'La identificación es obligatoria';
    if (!formData.iban) newErrors.iban = 'El IBAN es obligatorio';
    if (!formData.bic) newErrors.bic = 'El BIC/SWIFT es obligatorio';
    if (!formData.banco_nombre) newErrors.banco_nombre = 'El nombre del banco es obligatorio';
    if (!formData.acepta_mandato) newErrors.acepta_mandato = 'Debe aceptar el mandato SEPA';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const mandateData = {
        ...formData,
        fecha_firma: new Date().toISOString(),
        ip_address: '192.168.1.100',
        user_agent: navigator.userAgent,
        session_id: `session_${Date.now()}`
      };

      await onSubmit(mandateData);
      onClose();
    } catch (error) {
      console.error('Error al procesar mandato SEPA:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const formatIBAN = (iban: string) => {
    return iban.replace(/(.{4})/g, '$1 ').trim();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white/20 p-3 rounded-full mr-4">
                <Building className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Mandato de Domiciliación SEPA</h2>
                <p className="text-green-100">Autorización para adeudo directo</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información del Mandato */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-800 mb-2">Información del Mandato</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700 font-medium">ID Mandato:</span>
                    <p className="text-blue-600">{mandateId}</p>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Importe:</span>
                    <p className="text-blue-600">{currency} {amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Concepto:</span>
                    <p className="text-blue-600">{description}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Datos del Deudor */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Datos del Deudor (Titular de la Cuenta)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Completo / Razón Social *
                </label>
                <input
                  type="text"
                  value={formData.deudor_nombre}
                  onChange={(e) => handleInputChange('deudor_nombre', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Nombre completo o razón social"
                />
                {errors.deudor_nombre && (
                  <p className="mt-1 text-sm text-red-600">{errors.deudor_nombre}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección *
                </label>
                <input
                  type="text"
                  value={formData.deudor_direccion}
                  onChange={(e) => handleInputChange('deudor_direccion', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Dirección completa"
                />
                {errors.deudor_direccion && (
                  <p className="mt-1 text-sm text-red-600">{errors.deudor_direccion}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código Postal *
                </label>
                <input
                  type="text"
                  value={formData.deudor_codigo_postal}
                  onChange={(e) => handleInputChange('deudor_codigo_postal', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="28001"
                />
                {errors.deudor_codigo_postal && (
                  <p className="mt-1 text-sm text-red-600">{errors.deudor_codigo_postal}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ciudad *
                </label>
                <input
                  type="text"
                  value={formData.deudor_ciudad}
                  onChange={(e) => handleInputChange('deudor_ciudad', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Madrid"
                />
                {errors.deudor_ciudad && (
                  <p className="mt-1 text-sm text-red-600">{errors.deudor_ciudad}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  País *
                </label>
                <select
                  value={formData.deudor_pais}
                  onChange={(e) => handleInputChange('deudor_pais', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="España">España</option>
                  <option value="Francia">Francia</option>
                  <option value="Alemania">Alemania</option>
                  <option value="Italia">Italia</option>
                  <option value="Portugal">Portugal</option>
                </select>
                {errors.deudor_pais && (
                  <p className="mt-1 text-sm text-red-600">{errors.deudor_pais}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  NIF/CIF/Identificación *
                </label>
                <input
                  type="text"
                  value={formData.deudor_identificacion}
                  onChange={(e) => handleInputChange('deudor_identificacion', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="12345678A / B12345678"
                />
                {errors.deudor_identificacion && (
                  <p className="mt-1 text-sm text-red-600">{errors.deudor_identificacion}</p>
                )}
              </div>
            </div>
          </div>

          {/* Datos Bancarios */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Datos de la Cuenta Bancaria
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IBAN *
                </label>
                <input
                  type="text"
                  value={formData.iban}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\s/g, '').toUpperCase();
                    handleInputChange('iban', value);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono"
                  placeholder="ES91 2100 0418 4502 0005 1332"
                />
                {formData.iban && (
                  <p className="mt-1 text-sm text-gray-600">
                    Formato: {formatIBAN(formData.iban)}
                  </p>
                )}
                {errors.iban && (
                  <p className="mt-1 text-sm text-red-600">{errors.iban}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  BIC/SWIFT *
                </label>
                <input
                  type="text"
                  value={formData.bic}
                  onChange={(e) => handleInputChange('bic', e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono"
                  placeholder="CAIXESBBXXX"
                />
                {errors.bic && (
                  <p className="mt-1 text-sm text-red-600">{errors.bic}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Banco *
                </label>
                <input
                  type="text"
                  value={formData.banco_nombre}
                  onChange={(e) => handleInputChange('banco_nombre', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="CaixaBank"
                />
                {errors.banco_nombre && (
                  <p className="mt-1 text-sm text-red-600">{errors.banco_nombre}</p>
                )}
              </div>
            </div>
          </div>

          {/* Tipo de Pago */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Tipo de Pago
            </h3>
            <div className="space-y-3">
              <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100">
                <input
                  type="radio"
                  name="tipo_pago"
                  value="recurrente"
                  checked={formData.tipo_pago === 'recurrente'}
                  onChange={(e) => handleInputChange('tipo_pago', e.target.value)}
                  className="mr-3"
                />
                <div>
                  <p className="font-medium text-gray-800">Pago Recurrente</p>
                  <p className="text-sm text-gray-600">Para suscripciones y pagos periódicos</p>
                </div>
              </label>
              <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100">
                <input
                  type="radio"
                  name="tipo_pago"
                  value="unico"
                  checked={formData.tipo_pago === 'unico'}
                  onChange={(e) => handleInputChange('tipo_pago', e.target.value)}
                  className="mr-3"
                />
                <div>
                  <p className="font-medium text-gray-800">Pago Único</p>
                  <p className="text-sm text-gray-600">Para un solo adeudo</p>
                </div>
              </label>
            </div>
          </div>

          {/* Consentimiento */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
              <Signature className="h-5 w-5 mr-2" />
              Consentimiento y Firma Electrónica
            </h3>
            
            <label className="flex items-start p-4 border-2 border-green-300 rounded-lg cursor-pointer hover:bg-green-100">
              <input
                type="checkbox"
                checked={formData.acepta_mandato}
                onChange={(e) => handleInputChange('acepta_mandato', e.target.checked)}
                className="mt-1 mr-3"
              />
              <div>
                <p className="font-semibold text-green-800">
                  ✓ Acepto y autorizo el mandato de domiciliación SEPA
                </p>
                <p className="text-sm text-green-700 mt-1">
                  Confirmo que he leído y acepto los términos del mandato SEPA. Autorizo a ConstructIA S.L. 
                  a realizar adeudos en mi cuenta bancaria según las condiciones establecidas.
                </p>
              </div>
            </label>
            {errors.acepta_mandato && (
              <p className="text-sm text-red-600 mt-2">{errors.acepta_mandato}</p>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.acepta_mandato}
              className="flex items-center px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Procesando Mandato...
                </>
              ) : (
                <>
                  <Signature className="h-4 w-4 mr-2" />
                  Firmar Mandato SEPA
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}