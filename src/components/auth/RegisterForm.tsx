import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  Building2, 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  MapPin,
  CheckCircle,
  Brain,
  Shield,
  Zap,
  ArrowRight,
  AlertTriangle,
  CreditCard
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { callGeminiAI } from '../../lib/supabase';
import Logo from '../common/Logo';
import PaymentMethodSelector from '../client/PaymentMethodSelector';

interface RegisterFormData {
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  address: string;
  password: string;
  confirm_password: string;
  selected_plan: string;
  accepts_terms: boolean;
  accepts_privacy: boolean;
  accepts_marketing: boolean;
}

const schema = yup.object({
  company_name: yup.string().required('El nombre de la empresa es obligatorio'),
  contact_name: yup.string().required('El nombre de contacto es obligatorio'),
  email: yup.string().email('Email inválido').required('El email es obligatorio'),
  phone: yup.string().required('El teléfono es obligatorio'),
  address: yup.string().required('La dirección es obligatoria'),
  password: yup.string().min(8, 'La contraseña debe tener al menos 8 caracteres').required('La contraseña es obligatoria'),
  confirm_password: yup.string().oneOf([yup.ref('password')], 'Las contraseñas no coinciden').required('Confirma tu contraseña'),
  selected_plan: yup.string().required('Selecciona un plan'),
  accepts_terms: yup.boolean().oneOf([true], 'Debes aceptar los términos y condiciones'),
  accepts_privacy: yup.boolean().oneOf([true], 'Debes aceptar la política de privacidad'),
  accepts_marketing: yup.boolean()
});

const plans = [
  {
    id: 'basic',
    name: 'Básico',
    price: 59,
    period: 'mes',
    features: [
      'Hasta 100 documentos/mes',
      '500MB de almacenamiento',
      'Clasificación IA básica',
      'Integración Obralia',
      'Soporte por email'
    ],
    popular: false
  },
  {
    id: 'professional',
    name: 'Profesional',
    price: 149,
    period: 'mes',
    features: [
      'Hasta 500 documentos/mes',
      '1GB de almacenamiento',
      'IA avanzada con 95% precisión',
      'Integración Obralia completa',
      'Dashboard personalizado',
      'Soporte prioritario'
    ],
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Empresarial',
    price: 299,
    period: 'mes',
    features: [
      'Documentos ilimitados',
      '5GB de almacenamiento',
      'IA premium con análisis predictivo',
      'API personalizada',
      'Múltiples usuarios',
      'Soporte 24/7'
    ],
    popular: false
  }
];

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [aiAssistance, setAiAssistance] = useState('');
  const [showPaymentSelector, setShowPaymentSelector] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null);

  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger
  } = useForm<RegisterFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      selected_plan: 'professional',
      accepts_terms: false,
      accepts_privacy: false,
      accepts_marketing: false
    }
  });

  const watchedValues = watch();

  // IA Asistente para acompañar al usuario
  const generateAIAssistance = async (step: number) => {
    setLoading(true);
    try {
      let prompt = '';
      switch (step) {
        case 1:
          prompt = `Como asistente IA de ConstructIA, ayuda al usuario en el registro. Genera un mensaje de bienvenida cálido y explica brevemente los beneficios de registrarse (máximo 80 palabras).`;
          break;
        case 2:
          prompt = `El usuario está seleccionando un plan. Explica brevemente las diferencias entre los planes y recomienda el plan Profesional para empresas medianas (máximo 100 palabras).`;
          break;
        case 3:
          prompt = `El usuario está en el paso de pago. Tranquilízalo sobre la seguridad del proceso y explica que puede cancelar en cualquier momento (máximo 80 palabras).`;
          break;
        default:
          prompt = `Genera un mensaje de ánimo para completar el registro en ConstructIA (máximo 60 palabras).`;
      }
      
      const assistance = await callGeminiAI(prompt);
      setAiAssistance(assistance);
    } catch (error) {
      setAiAssistance('¡Hola! Estoy aquí para ayudarte en tu registro. Si tienes alguna duda, no dudes en contactarnos.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    generateAIAssistance(currentStep);
  }, [currentStep]);

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isValid = await trigger(fieldsToValidate);
    
    if (isValid) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const getFieldsForStep = (step: number): (keyof RegisterFormData)[] => {
    switch (step) {
      case 1:
        return ['company_name', 'contact_name', 'email', 'phone', 'address'];
      case 2:
        return ['selected_plan'];
      case 3:
        return ['password', 'confirm_password', 'accepts_terms', 'accepts_privacy'];
      default:
        return [];
    }
  };

  const handlePlanSelect = (planId: string) => {
    setValue('selected_plan', planId);
    const plan = plans.find(p => p.id === planId);
    setSelectedPlan(plan || null);
  };

  const handlePaymentMethodSelected = async (gatewayId: string) => {
    setShowPaymentSelector(false);
    
    // Simular procesamiento de pago
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Registrar usuario
      await registerUser(watchedValues.email, watchedValues.password, {
        company_name: watchedValues.company_name,
        contact_name: watchedValues.contact_name,
        phone: watchedValues.phone,
        address: watchedValues.address,
        selected_plan: watchedValues.selected_plan,
        payment_gateway: gatewayId
      });
      
      // Redirigir al dashboard del cliente
      navigate('/client/dashboard');
      
    } catch (error: any) {
      alert('Error en el registro: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    console.log('onSubmit llamado con datos:', data);
    
    // Encontrar el plan seleccionado
    const plan = plans.find(p => p.id === data.selected_plan);
    if (!plan) {
      console.error('Plan no encontrado:', data.selected_plan);
      return;
    }
    
    console.log('Plan encontrado:', plan);
    setSelectedPlan(plan);
    setShowPaymentSelector(true);
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Información de tu Empresa</h2>
        <p className="text-gray-600 mt-2">Cuéntanos sobre tu empresa de construcción</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre de la Empresa *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
              <Building2 className="h-5 w-5 text-gray-400" />
            </div>
            <input
              {...register('company_name')}
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Construcciones García S.L."
            />
          </div>
          {errors.company_name && (
            <p className="mt-1 text-sm text-red-600">{errors.company_name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre de Contacto *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              {...register('contact_name')}
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Juan García"
            />
          </div>
          {errors.contact_name && (
            <p className="mt-1 text-sm text-red-600">{errors.contact_name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Corporativo *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              {...register('email')}
              type="email"
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="juan@construccionesgarcia.com"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Teléfono *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
              <Phone className="h-5 w-5 text-gray-400" />
            </div>
            <input
              {...register('phone')}
              type="tel"
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="+34 91 123 45 67"
            />
          </div>
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Dirección de la Empresa *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
            <MapPin className="h-5 w-5 text-gray-400" />
          </div>
          <input
            {...register('address')}
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Calle Mayor 123, 28001 Madrid"
          />
        </div>
        {errors.address && (
          <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Selecciona tu Plan</h2>
        <p className="text-gray-600 mt-2">Elige el plan que mejor se adapte a tu empresa</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all ${
              watchedValues.selected_plan === plan.id
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handlePlanSelect(plan.id)}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                  Más Popular
                </span>
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
              <div className="mt-2">
                <span className="text-3xl font-bold text-gray-900">€{plan.price}</span>
                <span className="text-gray-600">/{plan.period}</span>
              </div>
            </div>

            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            {watchedValues.selected_plan === plan.id && (
              <div className="absolute top-4 right-4">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
            )}
          </div>
        ))}
      </div>

      {errors.selected_plan && (
        <p className="text-sm text-red-600 text-center">{errors.selected_plan.message}</p>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Seguridad de tu Cuenta</h2>
        <p className="text-gray-600 mt-2">Crea una contraseña segura para proteger tu cuenta</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contraseña *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirmar Contraseña *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              {...register('confirm_password')}
              type={showConfirmPassword ? 'text' : 'password'}
              className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
          {errors.confirm_password && (
            <p className="mt-1 text-sm text-red-600">{errors.confirm_password.message}</p>
          )}
        </div>
      </div>

      {/* Términos y Condiciones */}
      <div className="space-y-4">
        <label className="flex items-start">
          <input
            {...register('accepts_terms')}
            type="checkbox"
            className="mt-1 mr-3"
          />
          <span className="text-sm text-gray-700">
            Acepto los <a href="#" className="text-green-600 hover:text-green-700">términos y condiciones</a> de ConstructIA *
          </span>
        </label>
        {errors.accepts_terms && (
          <p className="text-sm text-red-600">{errors.accepts_terms.message}</p>
        )}

        <label className="flex items-start">
          <input
            {...register('accepts_privacy')}
            type="checkbox"
            className="mt-1 mr-3"
          />
          <span className="text-sm text-gray-700">
            Acepto la <a href="#" className="text-green-600 hover:text-green-700">política de privacidad</a> *
          </span>
        </label>
        {errors.accepts_privacy && (
          <p className="text-sm text-red-600">{errors.accepts_privacy.message}</p>
        )}

        <label className="flex items-start">
          <input
            {...register('accepts_marketing')}
            type="checkbox"
            className="mt-1 mr-3"
          />
          <span className="text-sm text-gray-700">
            Quiero recibir noticias y ofertas especiales de ConstructIA
          </span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <Logo variant="light" size="md" />
                <h1 className="text-2xl font-bold mt-2">Registro en ConstructIA</h1>
                <p className="text-green-100">Únete a la revolución de la gestión documental</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-green-100">Paso {currentStep} de 3</div>
                <div className="w-32 bg-green-500 rounded-full h-2 mt-2">
                  <div 
                    className="bg-white h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(currentStep / 3) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Asistente IA */}
          {aiAssistance && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
              <div className="flex items-start">
                <Brain className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-800">Asistente IA</h4>
                  <p className="text-sm text-blue-700 mt-1">{aiAssistance}</p>
                </div>
              </div>
            </div>
          )}

          {/* Form Content */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-8">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <div>
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Anterior
                  </button>
                )}
              </div>
              
              <div>
                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center"
                  >
                    Continuar
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center"
                  >
                    {loading ? 'Procesando...' : 'Completar Registro'}
                    <CreditCard className="ml-2 h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-4 text-center">
            <p className="text-gray-600 text-sm">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-green-600 hover:text-green-700 font-medium">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>

        {/* Beneficios Sidebar */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm text-center">
            <Brain className="h-8 w-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">IA Avanzada</h3>
            <p className="text-sm text-gray-600">Clasificación automática con 95% de precisión</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm text-center">
            <Shield className="h-8 w-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">100% Seguro</h3>
            <p className="text-sm text-gray-600">Encriptación de extremo a extremo</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm text-center">
            <Zap className="h-8 w-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Súper Rápido</h3>
            <p className="text-sm text-gray-600">Procesamiento en menos de 3 segundos</p>
          </div>
        </div>
      </div>

      {/* Payment Method Selector Modal */}
      {showPaymentSelector && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    Finalizar Registro - Plan {selectedPlan.name}
                  </h3>
                  <p className="text-gray-600">
                    Selecciona tu método de pago para activar tu cuenta
                  </p>
                </div>
                <button
                  onClick={() => setShowPaymentSelector(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <PaymentMethodSelector
                amount={selectedPlan.price}
                currency="EUR"
                onSelect={handlePaymentMethodSelected}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}