import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
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
  X
} from 'lucide-react';

interface SEPAMandateData {
  // Datos del deudor (cliente)
  deudor_nombre: string;
  deudor_direccion: string;
  deudor_codigo_postal: string;
  deudor_ciudad: string;
  deudor_pais: string;
  deudor_identificacion: string;
  
  // Datos bancarios
  iban: string;
  bic: string;
  banco_nombre: string;
  
  // Datos del acreedor (ConstructIA)
  acreedor_nombre: string;
  acreedor_identificacion: string;
  acreedor_direccion: string;
  
  // Tipo de pago
  tipo_pago: 'recurrente' | 'unico';
  
  // Consentimiento y firma
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

const schema = yup.object({
  deudor_nombre: yup.string().required('El nombre del titular es obligatorio'),
  deudor_direccion: yup.string().required('La dirección es obligatoria'),
  deudor_codigo_postal: yup.string().required('El código postal es obligatorio'),
  deudor_ciudad: yup.string().required('La ciudad es obligatoria'),
  deudor_pais: yup.string().required('El país es obligatorio'),
  deudor_identificacion: yup.string().required('La identificación es obligatoria'),
  iban: yup.string()
    .required('El IBAN es obligatorio')
    .matches(/^[A-Z]{2}[0-9]{2}[A-Z0-9]{4}[0-9]{7}([A-Z0-9]?){0,16}$/, 'Formato de IBAN inválido'),
  bic: yup.string()
    .required('El BIC/SWIFT es obligatorio')
    .matches(/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/, 'Formato de BIC inválido'),
  banco_nombre: yup.string().required('El nombre del banco es obligatorio'),
  tipo_pago: yup.string().oneOf(['recurrente', 'unico']).required(),
  acepta_mandato: yup.boolean().oneOf([true], 'Debe aceptar el mandato SEPA')
});

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

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<SEPAMandateData>({
    resolver: yupResolver(schema),
    defaultValues: {
      deudor_nombre: clientData?.name || '',
      deudor_direccion: clientData?.address || '',
      deudor_codigo_postal: clientData?.postalCode || '',
      deudor_ciudad: clientData?.city || '',
      deudor_pais: clientData?.country || 'España',
      deudor_identificacion: clientData?.taxId || '',
      acreedor_nombre: 'ConstructIA S.L.',
      acreedor_identificacion: 'ES12345678901',
      acreedor_direccion: 'Calle Innovación 123, 28001 Madrid, España',
      tipo_pago: 'recurrente',
      acepta_mandato: false
    }
  });

  const watchedValues = watch();

  const handleFormSubmit = async (data: SEPAMandateData) => {
    setIsSubmitting(true);
    try {
      // Capturar datos de auditoría
      const auditData = {
        ...data,
        fecha_firma: new Date().toISOString(),
        ip_address: '192.168.1.100', // En producción obtener IP real
        user_agent: navigator.userAgent,
        session_id: `session_${Date.now()}`,
        mandate_id: mandateId,
        amount,
        currency,
        description
      };

      await onSubmit(auditData);
      onClose();
    } catch (error) {
      console.error('Error al procesar mandato SEPA:', error);
    } finally {
      setIsSubmitting(false);
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
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
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

          {/* Datos del Acreedor (ConstructIA) */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
              <Building className="h-5 w-5 mr-2" />
              Datos del Acreedor
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Acreedor
                </label>
                <input
                  {...register('acreedor_nombre')}
                  type="text"
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Identificación del Acreedor
                </label>
                <input
                  {...register('acreedor_identificacion')}
                  type="text"
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección del Acreedor
                </label>
                <input
                  {...register('acreedor_direccion')}
                  type="text"
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                />
              </div>
            </div>
          </div>

          {/* Datos del Deudor (Cliente) */}
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
                  {...register('deudor_nombre')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Nombre completo o razón social"
                />
                {errors.deudor_nombre && (
                  <p className="mt-1 text-sm text-red-600">{errors.deudor_nombre.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección *
                </label>
                <input
                  {...register('deudor_direccion')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Dirección completa"
                />
                {errors.deudor_direccion && (
                  <p className="mt-1 text-sm text-red-600">{errors.deudor_direccion.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código Postal *
                </label>
                <input
                  {...register('deudor_codigo_postal')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="28001"
                />
                {errors.deudor_codigo_postal && (
                  <p className="mt-1 text-sm text-red-600">{errors.deudor_codigo_postal.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ciudad *
                </label>
                <input
                  {...register('deudor_ciudad')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Madrid"
                />
                {errors.deudor_ciudad && (
                  <p className="mt-1 text-sm text-red-600">{errors.deudor_ciudad.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  País *
                </label>
                <select
                  {...register('deudor_pais')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="España">España</option>
                  <option value="Francia">Francia</option>
                  <option value="Alemania">Alemania</option>
                  <option value="Italia">Italia</option>
                  <option value="Portugal">Portugal</option>
                </select>
                {errors.deudor_pais && (
                  <p className="mt-1 text-sm text-red-600">{errors.deudor_pais.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  NIF/CIF/Identificación *
                </label>
                <input
                  {...register('deudor_identificacion')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="12345678A / B12345678"
                />
                {errors.deudor_identificacion && (
                  <p className="mt-1 text-sm text-red-600">{errors.deudor_identificacion.message}</p>
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
                  {...register('iban')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono"
                  placeholder="ES91 2100 0418 4502 0005 1332"
                  onChange={(e) => {
                    const value = e.target.value.replace(/\s/g, '').toUpperCase();
                    setValue('iban', value);
                  }}
                />
                {watchedValues.iban && (
                  <p className="mt-1 text-sm text-gray-600">
                    Formato: {formatIBAN(watchedValues.iban)}
                  </p>
                )}
                {errors.iban && (
                  <p className="mt-1 text-sm text-red-600">{errors.iban.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  BIC/SWIFT *
                </label>
                <input
                  {...register('bic')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono"
                  placeholder="CAIXESBBXXX"
                  onChange={(e) => {
                    setValue('bic', e.target.value.toUpperCase());
                  }}
                />
                {errors.bic && (
                  <p className="mt-1 text-sm text-red-600">{errors.bic.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Banco *
                </label>
                <input
                  {...register('banco_nombre')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="CaixaBank"
                />
                {errors.banco_nombre && (
                  <p className="mt-1 text-sm text-red-600">{errors.banco_nombre.message}</p>
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
                  {...register('tipo_pago')}
                  type="radio"
                  value="recurrente"
                  className="mr-3"
                />
                <div>
                  <p className="font-medium text-gray-800">Pago Recurrente</p>
                  <p className="text-sm text-gray-600">Para suscripciones y pagos periódicos</p>
                </div>
              </label>
              <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100">
                <input
                  {...register('tipo_pago')}
                  type="radio"
                  value="unico"
                  className="mr-3"
                />
                <div>
                  <p className="font-medium text-gray-800">Pago Único</p>
                  <p className="text-sm text-gray-600">Para un solo adeudo</p>
                </div>
              </label>
            </div>
          </div>

          {/* Términos y Condiciones */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Términos del Mandato SEPA
            </h3>
            <div className="text-sm text-gray-700 space-y-2">
              <p>
                <strong>Al firmar este mandato, autoriza a:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>ConstructIA S.L. a enviar instrucciones a su banco para adeudar su cuenta</li>
                <li>Su banco a adeudar su cuenta de acuerdo con las instrucciones de ConstructIA S.L.</li>
              </ul>
              <p className="mt-3">
                <strong>Sus derechos:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Tiene derecho a la devolución por su banco según los términos acordados con el mismo</li>
                <li>La solicitud de devolución deberá presentarse dentro de las 8 semanas siguientes al adeudo</li>
                <li>Puede cancelar este mandato contactando con ConstructIA S.L. o su banco</li>
              </ul>
            </div>
            <button
              type="button"
              onClick={() => setShowTerms(true)}
              className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
            >
              <Eye className="h-4 w-4 mr-1" />
              Ver términos completos
            </button>
          </div>

          {/* Consentimiento y Firma Electrónica */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
              <Signature className="h-5 w-5 mr-2" />
              Consentimiento y Firma Electrónica
            </h3>
            
            <div className="space-y-4">
              <div className="bg-white border border-green-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Shield className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-800 mb-2">Validez Legal</h4>
                    <p className="text-sm text-green-700">
                      Su consentimiento electrónico tiene la misma validez legal que una firma manuscrita 
                      según la normativa europea eIDAS y la legislación española.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-green-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Lock className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-800 mb-2">Registro de Auditoría</h4>
                    <p className="text-sm text-green-700 mb-2">
                      Se registrará la siguiente información para garantizar la validez del mandato:
                    </p>
                    <ul className="text-xs text-green-600 space-y-1">
                      <li>• Fecha y hora exacta del consentimiento</li>
                      <li>• Dirección IP desde la que se firma</li>
                      <li>• Información del dispositivo y navegador</li>
                      <li>• Hash del documento firmado</li>
                      <li>• Identificador único de la sesión</li>
                    </ul>
                  </div>
                </div>
              </div>

              <label className="flex items-start p-4 border-2 border-green-300 rounded-lg cursor-pointer hover:bg-green-100">
                <input
                  {...register('acepta_mandato')}
                  type="checkbox"
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
                  <p className="text-xs text-green-600 mt-2">
                    <strong>Fecha de firma:</strong> {new Date().toLocaleDateString('es-ES')} a las {new Date().toLocaleTimeString('es-ES')}
                  </p>
                </div>
              </label>
              {errors.acepta_mandato && (
                <p className="text-sm text-red-600">{errors.acepta_mandato.message}</p>
              )}
            </div>
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
              disabled={isSubmitting || !watchedValues.acepta_mandato}
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

        {/* Modal de Términos Completos */}
        {showTerms && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Términos Completos del Mandato SEPA</h3>
                <button
                  onClick={() => setShowTerms(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="text-sm text-gray-700 space-y-3">
                <h4 className="font-semibold">1. Autorización</h4>
                <p>
                  Mediante la firma de este mandato, el deudor autoriza a ConstructIA S.L. a enviar 
                  instrucciones a la entidad del deudor para adeudar su cuenta y a la entidad del 
                  deudor a efectuar los adeudos en su cuenta siguiendo las instrucciones de ConstructIA S.L.
                </p>
                
                <h4 className="font-semibold">2. Derechos del Deudor</h4>
                <p>
                  El deudor tiene derecho a la devolución por su entidad en los términos y condiciones 
                  del contrato suscrito con la misma. La solicitud de devolución deberá presentarse 
                  dentro de las ocho semanas siguientes al adeudo en cuenta.
                </p>
                
                <h4 className="font-semibold">3. Cancelación</h4>
                <p>
                  El deudor podrá cancelar este mandato dirigiéndose a ConstructIA S.L. o a su entidad.
                </p>
                
                <h4 className="font-semibold">4. Notificación Previa</h4>
                <p>
                  ConstructIA S.L. notificará al deudor la fecha de adeudo y el importe del mismo con 
                  al menos 14 días de antelación a la fecha de adeudo.
                </p>
                
                <h4 className="font-semibold">5. Protección de Datos</h4>
                <p>
                  Los datos proporcionados serán tratados conforme a la normativa de protección de datos 
                  vigente y únicamente para la gestión de los adeudos autorizados.
                </p>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowTerms(false)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}