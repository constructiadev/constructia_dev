import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  CheckCircle, 
  Brain, 
  Shield, 
  Zap, 
  Building2,
  FileText,
  Globe,
  Users,
  Star,
  Quote,
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  Clock,
  Send,
  ChevronRight
} from 'lucide-react';
import Logo from '../common/Logo';

export default function LandingPage() {
  const [contactForm, setContactForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    inquiry_type: '',
    message: '',
    accepts_privacy: false
  });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simular envío de formulario
    alert('¡Gracias por tu consulta! Te contactaremos en menos de 24 horas.');
    setContactForm({
      name: '',
      company: '',
      email: '',
      phone: '',
      inquiry_type: '',
      message: '',
      accepts_privacy: false
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Logo size="md" />
            
            <nav className="hidden md:flex space-x-8">
              <a href="#producto" className="text-gray-700 hover:text-green-600 transition-colors">Producto</a>
              <a href="#empresa" className="text-gray-700 hover:text-green-600 transition-colors">Empresa</a>
              <a href="#contacto" className="text-gray-700 hover:text-green-600 transition-colors">Contacto</a>
            </nav>
            
            <div className="flex items-center space-x-4">
              <Link 
                to="/login" 
                className="text-gray-700 hover:text-green-600 transition-colors"
              >
                Iniciar Sesión
              </Link>
              <Link 
                to="/register" 
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Comenzar Gratis
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section con Animación de IA */}
      <section className="relative bg-gradient-to-br from-gray-50 to-white py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Contenido del Hero */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                  Gestión Documental
                  <span className="text-green-600 block">Inteligente</span>
                  <span className="text-2xl md:text-3xl text-gray-600 font-normal block mt-2">
                    para Construcción
                  </span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Automatiza la clasificación y gestión de documentos con IA avanzada. 
                  Integración directa con Obralia/Nalanda para máxima eficiencia.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/register" 
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors flex items-center justify-center"
                >
                  Comenzar Gratis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <button className="border border-gray-300 hover:border-green-600 text-gray-700 hover:text-green-600 px-8 py-4 rounded-xl font-semibold text-lg transition-colors">
                  Ver Demo
                </button>
              </div>

              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  <span>Sin tarjeta de crédito</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  <span>Configuración en 5 minutos</span>
                </div>
              </div>
            </div>

            {/* Animación de IA */}
            <div className="relative h-96 lg:h-[500px] flex items-center justify-center">
              {/* Círculos de fondo animados */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-80 h-80 bg-green-100 rounded-full animate-pulse opacity-20"></div>
                <div className="absolute w-60 h-60 bg-emerald-200 rounded-full animate-ping opacity-30"></div>
                <div className="absolute w-40 h-40 bg-green-300 rounded-full animate-bounce opacity-40"></div>
              </div>

              {/* Cerebro IA Central */}
              <div className="relative z-10 bg-white rounded-full p-8 shadow-2xl animate-pulse">
                <Brain className="h-20 w-20 text-green-600" />
              </div>

              {/* Documentos flotantes */}
              <div className="absolute top-16 left-16 bg-blue-100 p-3 rounded-lg shadow-lg animate-bounce" style={{ animationDelay: '0.5s' }}>
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="absolute top-20 right-20 bg-purple-100 p-3 rounded-lg shadow-lg animate-bounce" style={{ animationDelay: '1s' }}>
                <Building2 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="absolute bottom-20 left-20 bg-orange-100 p-3 rounded-lg shadow-lg animate-bounce" style={{ animationDelay: '1.5s' }}>
                <Shield className="h-6 w-6 text-orange-600" />
              </div>
              <div className="absolute bottom-16 right-16 bg-emerald-100 p-3 rounded-lg shadow-lg animate-bounce" style={{ animationDelay: '2s' }}>
                <Zap className="h-6 w-6 text-emerald-600" />
              </div>

              {/* Partículas de datos */}
              <div className="absolute top-32 left-32 w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
              <div className="absolute top-40 right-32 w-2 h-2 bg-blue-500 rounded-full animate-ping" style={{ animationDelay: '0.3s' }}></div>
              <div className="absolute bottom-32 left-40 w-2 h-2 bg-purple-500 rounded-full animate-ping" style={{ animationDelay: '0.6s' }}></div>
              <div className="absolute bottom-40 right-40 w-2 h-2 bg-orange-500 rounded-full animate-ping" style={{ animationDelay: '0.9s' }}></div>

              {/* Líneas de conexión animadas */}
              <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 5 }}>
                <defs>
                  <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#059669" stopOpacity="0.2" />
                  </linearGradient>
                </defs>
                <path 
                  d="M 100 100 Q 200 150 300 100 T 400 150" 
                  stroke="url(#lineGradient)" 
                  strokeWidth="2" 
                  fill="none"
                  className="animate-pulse"
                />
                <path 
                  d="M 150 300 Q 250 250 350 300 T 450 250" 
                  stroke="url(#lineGradient)" 
                  strokeWidth="2" 
                  fill="none"
                  className="animate-pulse"
                  style={{ animationDelay: '1s' }}
                />
              </svg>

              {/* Textos flotantes */}
              <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold animate-bounce">
                🤖 IA Procesando...
              </div>
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-emerald-600 text-white px-4 py-2 rounded-full text-sm font-semibold animate-bounce" style={{ animationDelay: '1s' }}>
                ✨ 95% Precisión
              </div>

              {/* Indicadores de actividad */}
              <div className="absolute top-1/2 left-8 transform -translate-y-1/2">
                <div className="flex flex-col space-y-2">
                  <div className="w-16 h-2 bg-green-200 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-green-600 rounded-full animate-pulse"></div>
                  </div>
                  <div className="w-12 h-2 bg-blue-200 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                  </div>
                  <div className="w-20 h-2 bg-purple-200 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-purple-600 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                  </div>
                </div>
              </div>

              <div className="absolute top-1/2 right-8 transform -translate-y-1/2">
                <div className="flex flex-col space-y-2">
                  <div className="w-14 h-2 bg-orange-200 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-orange-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <div className="w-18 h-2 bg-emerald-200 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-emerald-600 rounded-full animate-pulse" style={{ animationDelay: '0.7s' }}></div>
                  </div>
                  <div className="w-10 h-2 bg-cyan-200 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-cyan-600 rounded-full animate-pulse" style={{ animationDelay: '1.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Características Principales */}
      <section id="producto" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Potenciado por Inteligencia Artificial
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Nuestra IA avanzada automatiza completamente la gestión documental, 
              desde la clasificación hasta la integración con Obralia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-shadow">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Brain className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Clasificación Inteligente</h3>
              <p className="text-gray-600 mb-4">
                Gemini AI clasifica automáticamente tus documentos con 95% de precisión. 
                Reconoce facturas, certificados, DNIs y más.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Procesamiento en 2-3 segundos
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Extracción de datos clave
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Aprendizaje continuo
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Globe className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Integración Obralia</h3>
              <p className="text-gray-600 mb-4">
                Conexión directa con Obralia/Nalanda. Los documentos se suben automáticamente 
                tras la validación por IA.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Subida automática
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Validación en tiempo real
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Trazabilidad completa
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-shadow">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Seguridad Avanzada</h3>
              <p className="text-gray-600 mb-4">
                Encriptación de extremo a extremo y cumplimiento GDPR. 
                Tus documentos están completamente protegidos.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Encriptación SSL 256-bit
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Cumplimiento GDPR
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Auditoría completa
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Planes y Precios */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Planes Adaptados a tu Empresa
            </h2>
            <p className="text-xl text-gray-600">
              Desde startups hasta grandes constructoras, tenemos el plan perfecto para ti.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Plan Básico */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Básico</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">€59</span>
                  <span className="text-gray-600">/mes</span>
                </div>
                <p className="text-gray-600">Perfecto para pequeñas empresas</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span>Hasta 100 documentos/mes</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span>500MB de almacenamiento</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span>Clasificación IA básica</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span>Integración Obralia</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span>Soporte por email</span>
                </li>
              </ul>
              
              <Link 
                to="/register" 
                className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 px-6 rounded-lg font-semibold transition-colors block text-center"
              >
                Comenzar Gratis
              </Link>
            </div>

            {/* Plan Profesional */}
            <div className="bg-green-600 text-white rounded-2xl p-8 hover:shadow-lg transition-shadow relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Más Popular
                </span>
              </div>
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">Profesional</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">€149</span>
                  <span className="text-green-100">/mes</span>
                </div>
                <p className="text-green-100">Ideal para empresas medianas</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-200 mr-3" />
                  <span>Hasta 500 documentos/mes</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-200 mr-3" />
                  <span>1GB de almacenamiento</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-200 mr-3" />
                  <span>IA avanzada con 95% precisión</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-200 mr-3" />
                  <span>Dashboard personalizado</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-200 mr-3" />
                  <span>Soporte prioritario</span>
                </li>
              </ul>
              
              <Link 
                to="/register" 
                className="w-full bg-white hover:bg-gray-100 text-green-600 py-3 px-6 rounded-lg font-semibold transition-colors block text-center"
              >
                Comenzar Gratis
              </Link>
            </div>

            {/* Plan Empresarial */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Empresarial</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">€299</span>
                  <span className="text-gray-600">/mes</span>
                </div>
                <p className="text-gray-600">Para grandes constructoras</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span>Documentos ilimitados</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span>5GB de almacenamiento</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span>IA premium + análisis predictivo</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span>API personalizada</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span>Soporte 24/7</span>
                </li>
              </ul>
              
              <Link 
                to="/register" 
                className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 px-6 rounded-lg font-semibold transition-colors block text-center"
              >
                Comenzar Gratis
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Lo que dicen nuestros clientes
            </h2>
            <p className="text-xl text-gray-600">
              Empresas de construcción que ya confían en ConstructIA
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <Quote className="h-8 w-8 text-green-600 mb-4" />
              <p className="text-gray-600 mb-6">
                "ConstructIA ha revolucionado nuestra gestión documental. La IA clasifica 
                perfectamente nuestros certificados y facturas. Ahorramos 15 horas semanales."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Juan García</p>
                  <p className="text-gray-600 text-sm">Director, Construcciones García S.L.</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <Quote className="h-8 w-8 text-green-600 mb-4" />
              <p className="text-gray-600 mb-6">
                "La integración con Obralia es perfecta. Los documentos se suben automáticamente 
                y nunca perdemos un papel. El ROI fue inmediato."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">María López</p>
                  <p className="text-gray-600 text-sm">CEO, Obras Públicas del Norte</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <Quote className="h-8 w-8 text-green-600 mb-4" />
              <p className="text-gray-600 mb-6">
                "Increíble precisión de la IA. Clasifica correctamente el 96% de nuestros documentos. 
                El equipo está encantado con la facilidad de uso."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Carlos Martín</p>
                  <p className="text-gray-600 text-sm">Gerente, Reformas Integrales López</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de Contacto */}
      <section id="contacto" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ¿Listo para Revolucionar tu Gestión Documental?
            </h2>
            <p className="text-xl text-gray-600">
              Contacta con nuestro equipo de expertos para una demo personalizada
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Información de Contacto */}
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Información de Contacto</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Mail className="h-6 w-6 text-green-600 mr-4" />
                    <div>
                      <p className="font-semibold text-gray-900">Email</p>
                      <p className="text-gray-600">contacto@constructia.com</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-6 w-6 text-green-600 mr-4" />
                    <div>
                      <p className="font-semibold text-gray-900">Teléfono</p>
                      <p className="text-gray-600">+34 91 000 00 00</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-6 w-6 text-green-600 mr-4" />
                    <div>
                      <p className="font-semibold text-gray-900">Oficina</p>
                      <p className="text-gray-600">Calle Innovación 123, 28001 Madrid</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <MessageCircle className="h-6 w-6 text-green-600 mr-4" />
                    <div>
                      <p className="font-semibold text-gray-900">Chat en Vivo</p>
                      <p className="text-gray-600">Disponible en la plataforma</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h4 className="font-semibold text-green-800 mb-4">Horarios de Soporte</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-green-700">Lunes - Viernes:</span>
                    <span className="font-medium text-green-800">9:00 - 18:00</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-green-700">Sábados:</span>
                    <span className="font-medium text-green-800">10:00 - 14:00</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-green-700">Emergencias 24/7:</span>
                    <span className="font-medium text-green-800">Plan Empresarial</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-2">Respuesta Rápida</h4>
                    <p className="text-sm text-blue-700">
                      Nuestro equipo de expertos responde en menos de 24 horas. 
                      Para demos personalizadas, agenda una llamada directamente.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulario de Contacto */}
            <div className="bg-gray-50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Solicita una Demo</h3>
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Tu nombre completo"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Empresa *
                    </label>
                    <input
                      type="text"
                      required
                      value={contactForm.company}
                      onChange={(e) => setContactForm({...contactForm, company: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Nombre de tu empresa"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="tu@empresa.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="+34 600 000 000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Consulta *
                  </label>
                  <select
                    required
                    value={contactForm.inquiry_type}
                    onChange={(e) => setContactForm({...contactForm, inquiry_type: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="demo">Solicitar Demo</option>
                    <option value="pricing">Información de Precios</option>
                    <option value="integration">Consulta de Integración</option>
                    <option value="support">Soporte Técnico</option>
                    <option value="custom">Plan Personalizado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mensaje *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Cuéntanos sobre tu empresa y necesidades..."
                  />
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    required
                    checked={contactForm.accepts_privacy}
                    onChange={(e) => setContactForm({...contactForm, accepts_privacy: e.target.checked})}
                    className="mt-1 mr-3"
                  />
                  <label className="text-sm text-gray-600">
                    Acepto la política de privacidad y el tratamiento de mis datos para contacto comercial. *
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center"
                >
                  <Send className="h-5 w-5 mr-2" />
                  Enviar Consulta
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-green-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Comienza tu Transformación Digital Hoy
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Únete a las empresas que ya están revolucionando su gestión documental con IA
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/register" 
              className="bg-white hover:bg-gray-100 text-green-600 px-8 py-4 rounded-xl font-semibold text-lg transition-colors flex items-center justify-center"
            >
              Comenzar Gratis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <button className="border border-green-400 hover:bg-green-500 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors">
              Agendar Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <Logo variant="light" size="md" />
              <p className="text-gray-400">
                Gestión documental inteligente para el sector de la construcción.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Producto</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Características</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Precios</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integraciones</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Empresa</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Sobre Nosotros</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contacto</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Soporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Centro de Ayuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentación</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Estado del Sistema</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 ConstructIA. Todos los derechos reservados.</p>
          </div>
        </div>

        {/* Icono discreto de acceso admin */}
        <Link 
          to="/admin/login" 
          className="absolute bottom-4 right-4 opacity-20 hover:opacity-60 transition-opacity"
          title="Acceso administrador"
        >
          <Shield className="h-3 w-3 text-gray-400" />
        </Link>
      </footer>
    </div>
  );
}