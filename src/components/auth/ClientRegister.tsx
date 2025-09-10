import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, 
  Building2, 
  Mail, 
  Lock, 
  Phone, 
  MapPin, 
  FileText,
  Globe,
  Key,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Shield,
  CreditCard,
  Users,
  Zap
} from 'lucide-react';
import { ClientAuthService } from '../../lib/client-auth-service';
import Logo from '../common/Logo';

interface RegistrationForm {
  // User Information
  email: string;
  password: string;
  confirmPassword: string;
  contact_name: string;
  
  // Company Information
  company_name: string;
  cif_nif: string;
  address: string;
  phone: string;
  postal_code: string;
  city: string;
  
  // CAE Platform Credentials (Optional)
  obralia_username: string;
  obralia_password: string;
  ctaima_username: string;
  ctaima_password: string;
  ecoordina_username: string;
  ecoordina_password: string;
  
  // Legal
  accept_terms: boolean;
  accept_privacy: boolean;
  accept_marketing: boolean;
}

interface FormErrors {
  [key: string]: string;
}

export default function ClientRegister() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [showPasswords, setShowPasswords] = useState<{[key: string]: boolean}>({});
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<RegistrationForm>({
    // User Information
    email: '',
    password: '',
    confirmPassword: '',
    contact_name: '',
    
    // Company Information
    company_name: '',
    cif_nif: '',
    address: '',
    phone: '',
    postal_code: '',
    city: '',
    
    // CAE Platform Credentials
    obralia_username: '',
    obralia_password: '',
    ctaima_username: '',
    ctaima_password: '',
    ecoordina_username: '',
    ecoordina_password: '',
    
    // Legal
    accept_terms: false,
    accept_privacy: false,
    accept_marketing: false
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};

    if (step === 1) {
      // User Information Validation
      if (!formData.email.trim()) {
        newErrors.email = 'El email es obligatorio';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email inválido';
      }
      
      if (!formData.password) {
        newErrors.password = 'La contraseña es obligatoria';
      } else if (formData.password.length < 8) {
        newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
      
      if (!formData.contact_name.trim()) {
        newErrors.contact_name = 'El nombre de contacto es obligatorio';
      }
    }

    if (step === 2) {
      // Company Information Validation
      if (!formData.company_name.trim()) {
        newErrors.company_name = 'La razón social es obligatoria';
      }
      
      if (!formData.cif_nif.trim()) {
        newErrors.cif_nif = 'El CIF/NIF es obligatorio';
      } else if (!/^[0-9]{8}[A-Z]$|^[A-Z][0-9]{7}[A-Z]$|^[A-Z][0-9]{8}$/.test(formData.cif_nif.toUpperCase())) {
        newErrors.cif_nif = 'Formato de CIF/NIF inválido';
      }
      
      if (!formData.address.trim()) {
        newErrors.address = 'La dirección es obligatoria';
      }
      
      if (!formData.phone.trim()) {
        newErrors.phone = 'El teléfono es obligatorio';
      } else if (!/^(\+34|0034|34)?[6789]\d{8}$/.test(formData.phone.replace(/\s/g, ''))) {
        newErrors.phone = 'Formato de teléfono español inválido';
      }
      
      if (!formData.postal_code.trim()) {
        newErrors.postal_code = 'El código postal es obligatorio';
      } else if (!/^\d{5}$/.test(formData.postal_code)) {
        newErrors.postal_code = 'Código postal debe tener 5 dígitos';
      }
      
      if (!formData.city.trim()) {
        newErrors.city = 'La ciudad es obligatoria';
      }
    }

    if (step === 4) {
      // Legal Validation
      if (!formData.accept_terms) {
        newErrors.accept_terms = 'Debes aceptar los términos y condiciones';
      }
      
      if (!formData.accept_privacy) {
        newErrors.accept_privacy = 'Debes aceptar la política de privacidad';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleInputChange = (field: keyof RegistrationForm, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(4)) return;

    try {
      setSubmitting(true);
      setError('');

      // Prepare CAE credentials
      const caeCredentials = [];
      
      if (formData.obralia_username && formData.obralia_password) {
        caeCredentials.push({
          platform: 'nalanda',
          username: formData.obralia_username,
          password: formData.obralia_password
        });
      }
      
      if (formData.ctaima_username && formData.ctaima_password) {
        caeCredentials.push({
          platform: 'ctaima',
          username: formData.ctaima_username,
          password: formData.ctaima_password
        });
      }
      
      if (formData.ecoordina_username && formData.ecoordina_password) {
        caeCredentials.push({
          platform: 'ecoordina',
          username: formData.ecoordina_username,
          password: formData.ecoordina_password
        });
      }

      // Register new client
      const registrationData = {
        // User data
        email: formData.email,
        password: formData.password,
        contact_name: formData.contact_name,
        
        // Company data
        company_name: formData.company_name,
        cif_nif: formData.cif_nif.toUpperCase(),
        address: formData.address,
        phone: formData.phone,
        postal_code: formData.postal_code,
        city: formData.city,
        
        // CAE credentials
        cae_credentials: caeCredentials,
        
        // Marketing preferences
        accept_marketing: formData.accept_marketing
      };

      const authenticatedClient = await ClientAuthService.registerNewClient(registrationData);
      
      if (!authenticatedClient) {
        throw new Error('Error en el registro. Por favor, inténtalo de nuevo.');
      }

      // Navigate to subscription with checkout modal
      navigate('/client/subscription?showCheckout=true', { replace: true });

    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err?.message || 'Error durante el registro');
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemoData = () => {
    setFormData({
      email: 'demo@construcciones.com',
      password: 'password123',
      confirmPassword: 'password123',
      contact_name: 'Juan García',
      company_name: 'Construcciones García S.L.',
      cif_nif: 'B12345678',
      address: 'Calle Construcción 123',
      phone: '+34 600 123 456',
      postal_code: '28001',
      city: 'Madrid',
      obralia_username: 'garcia_construcciones',
      obralia_password: 'obralia2024',
      ctaima_username: '',
      ctaima_password: '',
      ecoordina_username: '',
      ecoordina_password: '',
      accept_terms: true,
      accept_privacy: true,
      accept_marketing: false
    });
  };

  const steps = [
    { number: 1, title: 'Información Personal', icon: User },
    { number: 2, title: 'Datos de Empresa', icon: Building2 },
    { number: 3, title: 'Credenciales CAE', icon: Globe },
    { number: 4, title: 'Términos Legales', icon: Shield }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-8">
          <div className="text-center mb-6">
            <Logo size="lg" variant="light" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Registro de Cliente</h1>
            <p className="text-green-100">
              Únete a ConstructIA y revoluciona tu gestión documental
            </p>
          </div>
          
          {/* Progress Steps */}
          <div className="flex justify-center mt-8">
            <div className="flex items-center space-x-4">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.number;
                const isCompleted = currentStep > step.number;
                
                return (
                  <React.Fragment key={step.number}>
                    <div className="flex items-center space-x-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isCompleted ? 'bg-green-400' : 
                        isActive ? 'bg-white text-green-600' : 
                        'bg-white/20 text-white/60'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          <Icon className="w-5 h-5" />
                        )}
                      </div>
                      <div className="hidden md:block">
                        <div className={`text-sm font-medium ${
                          isActive ? 'text-white' : 'text-white/80'
                        }`}>
                          {step.title}
                        </div>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-8 h-px ${
                        isCompleted ? 'bg-green-400' : 'bg-white/20'
                      }`}></div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Step 1: User Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <User className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900">Información Personal</h2>
                  <p className="text-gray-600">Datos básicos para tu cuenta de usuario</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Corporativo *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="tu@empresa.com"
                        required
                      />
                    </div>
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contraseña *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type={showPasswords.password ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('password')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.password ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirmar Contraseña *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type={showPasswords.confirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirmPassword')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.confirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre de Contacto *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={formData.contact_name}
                        onChange={(e) => handleInputChange('contact_name', e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          errors.contact_name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="Juan García Martínez"
                        required
                      />
                    </div>
                    {errors.contact_name && <p className="mt-1 text-sm text-red-600">{errors.contact_name}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Company Information */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <Building2 className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900">Datos de la Empresa</h2>
                  <p className="text-gray-600">Información de tu empresa constructora</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Razón Social *
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={formData.company_name}
                        onChange={(e) => handleInputChange('company_name', e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          errors.company_name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="Construcciones García S.L."
                        required
                      />
                    </div>
                    {errors.company_name && <p className="mt-1 text-sm text-red-600">{errors.company_name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CIF/NIF *
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={formData.cif_nif}
                        onChange={(e) => handleInputChange('cif_nif', e.target.value.toUpperCase())}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          errors.cif_nif ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="B12345678"
                        required
                      />
                    </div>
                    {errors.cif_nif && <p className="mt-1 text-sm text-red-600">{errors.cif_nif}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="+34 600 123 456"
                        required
                      />
                    </div>
                    {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dirección *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          errors.address ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="Calle Construcción 123, 1º A"
                        required
                      />
                    </div>
                    {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Código Postal *
                    </label>
                    <input
                      type="text"
                      value={formData.postal_code}
                      onChange={(e) => handleInputChange('postal_code', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        errors.postal_code ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="28001"
                      maxLength={5}
                      required
                    />
                    {errors.postal_code && <p className="mt-1 text-sm text-red-600">{errors.postal_code}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ciudad *
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        errors.city ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Madrid"
                      required
                    />
                    {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: CAE Platform Credentials */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <Globe className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900">Credenciales de Plataformas CAE</h2>
                  <p className="text-gray-600">Configura el acceso a tus plataformas (opcional)</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <Zap className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-800">Configuración Opcional</h4>
                      <p className="text-blue-700 text-sm">
                        Puedes configurar estas credenciales ahora o más tarde desde tu panel de configuración. 
                        Esto permitirá la integración automática con las plataformas CAE.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  {/* Obralia/Nalanda */}
                  <div className="border border-orange-200 rounded-lg p-6 bg-orange-50">
                    <div className="flex items-center mb-4">
                      <div className="bg-orange-600 p-2 rounded-lg mr-3">
                        <Globe className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-orange-900">Obralia/Nalanda</h3>
                        <p className="text-sm text-orange-700">Plataforma principal de gestión CAE</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Usuario</label>
                        <input
                          type="text"
                          value={formData.obralia_username}
                          onChange={(e) => handleInputChange('obralia_username', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                          placeholder="tu_usuario@obralia.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
                        <div className="relative">
                          <input
                            type={showPasswords.obralia ? 'text' : 'password'}
                            value={formData.obralia_password}
                            onChange={(e) => handleInputChange('obralia_password', e.target.value)}
                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('obralia')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPasswords.obralia ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CTAIMA */}
                  <div className="border border-green-200 rounded-lg p-6 bg-green-50">
                    <div className="flex items-center mb-4">
                      <div className="bg-green-600 p-2 rounded-lg mr-3">
                        <Globe className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-green-900">CTAIMA</h3>
                        <p className="text-sm text-green-700">Sistema de coordinación de actividades</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Usuario</label>
                        <input
                          type="text"
                          value={formData.ctaima_username}
                          onChange={(e) => handleInputChange('ctaima_username', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          placeholder="tu_usuario@ctaima.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
                        <div className="relative">
                          <input
                            type={showPasswords.ctaima ? 'text' : 'password'}
                            value={formData.ctaima_password}
                            onChange={(e) => handleInputChange('ctaima_password', e.target.value)}
                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('ctaima')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPasswords.ctaima ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ecoordina */}
                  <div className="border border-purple-200 rounded-lg p-6 bg-purple-50">
                    <div className="flex items-center mb-4">
                      <div className="bg-purple-600 p-2 rounded-lg mr-3">
                        <Globe className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-purple-900">Ecoordina</h3>
                        <p className="text-sm text-purple-700">Plataforma de coordinación empresarial</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Usuario</label>
                        <input
                          type="text"
                          value={formData.ecoordina_username}
                          onChange={(e) => handleInputChange('ecoordina_username', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          placeholder="tu_usuario@ecoordina.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
                        <div className="relative">
                          <input
                            type={showPasswords.ecoordina ? 'text' : 'password'}
                            value={formData.ecoordina_password}
                            onChange={(e) => handleInputChange('ecoordina_password', e.target.value)}
                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('ecoordina')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPasswords.ecoordina ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Legal Terms */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <Shield className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900">Términos y Condiciones</h2>
                  <p className="text-gray-600">Acepta nuestros términos para completar el registro</p>
                </div>

                <div className="space-y-6">
                  <div className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="accept_terms"
                        checked={formData.accept_terms}
                        onChange={(e) => handleInputChange('accept_terms', e.target.checked)}
                        className="mt-1 rounded text-green-600 focus:ring-green-500"
                        required
                      />
                      <div className="flex-1">
                        <label htmlFor="accept_terms" className="text-sm text-gray-700 cursor-pointer">
                          Acepto los{' '}
                          <Link to="/terms-of-service" className="text-green-600 hover:text-green-700 underline">
                            Términos y Condiciones de Uso
                          </Link>{' '}
                          de ConstructIA *
                        </label>
                        {errors.accept_terms && <p className="mt-1 text-sm text-red-600">{errors.accept_terms}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="accept_privacy"
                        checked={formData.accept_privacy}
                        onChange={(e) => handleInputChange('accept_privacy', e.target.checked)}
                        className="mt-1 rounded text-green-600 focus:ring-green-500"
                        required
                      />
                      <div className="flex-1">
                        <label htmlFor="accept_privacy" className="text-sm text-gray-700 cursor-pointer">
                          Acepto la{' '}
                          <Link to="/privacy-policy" className="text-green-600 hover:text-green-700 underline">
                            Política de Privacidad
                          </Link>{' '}
                          y el tratamiento de mis datos según GDPR *
                        </label>
                        {errors.accept_privacy && <p className="mt-1 text-sm text-red-600">{errors.accept_privacy}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="accept_marketing"
                        checked={formData.accept_marketing}
                        onChange={(e) => handleInputChange('accept_marketing', e.target.checked)}
                        className="mt-1 rounded text-green-600 focus:ring-green-500"
                      />
                      <div className="flex-1">
                        <label htmlFor="accept_marketing" className="text-sm text-gray-700 cursor-pointer">
                          Acepto recibir comunicaciones comerciales y newsletters de ConstructIA (opcional)
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-green-800">Protección de Datos Garantizada</h4>
                        <p className="text-green-700 text-sm">
                          Tus datos están protegidos según GDPR y LOPDGDD. Utilizamos encriptación de grado militar 
                          y cumplimos con las normativas más estrictas de protección de datos.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-8 border-t border-gray-200">
              <div className="flex items-center space-x-4">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                    Anterior
                  </button>
                )}
                
                <button
                  type="button"
                  onClick={fillDemoData}
                  className="text-sm text-blue-600 hover:text-blue-700 underline"
                >
                  Rellenar datos de prueba
                </button>
              </div>

              <div className="flex items-center space-x-4">
                <Link
                  to="/client-login"
                  className="text-gray-600 hover:text-gray-800 text-sm"
                >
                  ¿Ya tienes cuenta? Inicia sesión
                </Link>
                
                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
                  >
                    Siguiente
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Registrando...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5 mr-2" />
                        Completar Registro
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-600">
              <Shield className="w-4 h-4 text-green-600 mr-2" />
              <span>Registro seguro con encriptación SSL</span>
            </div>
            <Link
              to="/landing"
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}