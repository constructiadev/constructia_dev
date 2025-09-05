import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  CheckCircle, 
  Star, 
  Users, 
  Shield, 
  Zap,
  Building2,
  FileText,
  Brain,
  Globe,
  Clock,
  Award,
  Target,
  TrendingUp,
  BarChart3,
  Lock,
  Smartphone,
  Mail,
  Phone,
  MapPin,
  Upload
} from 'lucide-react';
import Logo from '../common/Logo';
import ContactSection from './ContactSection';

export default function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Brain,
      title: 'IA Avanzada',
      description: 'Clasificación automática de documentos con precisión del 95%',
      color: 'bg-purple-600'
    },
    {
      icon: Shield,
      title: 'Seguridad Total',
      description: 'Cumplimiento GDPR y encriptación de extremo a extremo',
      color: 'bg-green-600'
    },
    {
      icon: Zap,
      title: 'Integración Directa',
      description: 'Conexión automática con Obralia/Nalanda',
      color: 'bg-blue-600'
    },
    {
      icon: BarChart3,
      title: 'Análisis Inteligente',
      description: 'Métricas y reportes en tiempo real',
      color: 'bg-orange-600'
    }
  ];

  const plans = [
    {
      name: 'Básico',
      price: '59',
      period: 'mes',
      description: 'Perfecto para pequeñas empresas',
      features: [
        '100 documentos/mes',
        '500MB almacenamiento',
        'Clasificación IA básica',
        'Soporte por email'
      ],
      popular: false,
      color: 'border-gray-200'
    },
    {
      name: 'Profesional',
      price: '149',
      period: 'mes',
      description: 'Ideal para empresas en crecimiento',
      features: [
        '500 documentos/mes',
        '1GB almacenamiento',
        'IA avanzada + OCR',
        'Integración Obralia',
        'Soporte prioritario'
      ],
      popular: true,
      color: 'border-green-500'
    },
    {
      name: 'Enterprise',
      price: '299',
      period: 'mes',
      description: 'Para grandes organizaciones',
      features: [
        'Documentos ilimitados',
        '5GB almacenamiento',
        'IA personalizada',
        'Múltiples integraciones',
        'Soporte 24/7',
        'API completa'
      ],
      popular: false,
      color: 'border-purple-500'
    }
  ];

  const testimonials = [
    {
      name: 'Juan García',
      company: 'Construcciones García S.L.',
      text: 'ConstructIA ha revolucionado nuestra gestión documental. Ahora procesamos documentos 10x más rápido.',
      rating: 5
    },
    {
      name: 'María López',
      company: 'Reformas Integrales López',
      text: 'La integración con Obralia es perfecta. Ya no perdemos tiempo subiendo documentos manualmente.',
      rating: 5
    },
    {
      name: 'Carlos Martín',
      company: 'Edificaciones Martín S.A.',
      text: 'El soporte es excepcional y la IA clasifica nuestros documentos con una precisión increíble.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo size="md" />
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#caracteristicas" className="text-gray-600 hover:text-green-600 transition-colors">
                Características
              </a>
              <a href="#como-funciona" className="text-gray-600 hover:text-green-600 transition-colors">
                Cómo Funciona
              </a>
              <a href="#precios" className="text-gray-600 hover:text-green-600 transition-colors">
                Precios
              </a>
              <a href="#testimonios" className="text-gray-600 hover:text-green-600 transition-colors">
                Testimonios
              </a>
              <a href="#contacto" className="text-gray-600 hover:text-green-600 transition-colors">
                Contacto
              </a>
            </nav>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/client-login')}
                className="text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => navigate('/client-login')}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Comenzar Gratis
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Gestión Documental
              <span className="text-green-600"> Inteligente</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Automatiza la clasificación y subida de documentos a Obralia con IA avanzada. 
              Ahorra tiempo, reduce errores y mantén tu documentación siempre al día.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button
                onClick={() => navigate('/client-login')}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center"
              >
                Comenzar Gratis
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
              <button className="border border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-4 rounded-lg font-semibold text-lg transition-colors">
                Ver Demo
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-600">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                <span>Cumplimiento GDPR</span>
              </div>
              <div className="flex items-center">
                <Shield className="w-4 h-4 text-blue-600 mr-2" />
                <span>Datos Seguros</span>
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 text-purple-600 mr-2" />
                <span>+50 Empresas</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="caracteristicas" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Características Principales
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tecnología de vanguardia para optimizar tu gestión documental
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow">
                  <div className={`w-16 h-16 ${feature.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="como-funciona" className="py-20 bg-gradient-to-br from-blue-50 to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              ¿Cómo Funciona?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Proceso simple y automatizado en 4 pasos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="relative">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Upload className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">1</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Sube Documentos</h3>
              <p className="text-gray-600">
                Arrastra y suelta tus documentos PDF, imágenes o archivos de construcción
              </p>
            </div>

            <div className="text-center">
              <div className="relative">
                <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Brain className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">2</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">IA Clasifica</h3>
              <p className="text-gray-600">
                Nuestra IA analiza y clasifica automáticamente cada documento con 95% de precisión
              </p>
            </div>

            <div className="text-center">
              <div className="relative">
                <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">3</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Validación</h3>
              <p className="text-gray-600">
                Revisión automática de calidad y validación de datos extraídos
              </p>
            </div>

            <div className="text-center">
              <div className="relative">
                <div className="w-20 h-20 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Globe className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">4</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Integración</h3>
              <p className="text-gray-600">
                Subida automática a Obralia/Nalanda con todos los datos correctos
              </p>
            </div>
          </div>

          {/* Process Flow */}
          <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
              Flujo de Procesamiento Inteligente
            </h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Documento Original</p>
                  <p className="text-sm text-gray-600">PDF, imagen, escaneado</p>
                </div>
              </div>
              
              <ArrowRight className="w-6 h-6 text-gray-400" />
              
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Brain className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Análisis IA</p>
                  <p className="text-sm text-gray-600">OCR + Clasificación</p>
                </div>
              </div>
              
              <ArrowRight className="w-6 h-6 text-gray-400" />
              
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Datos Estructurados</p>
                  <p className="text-sm text-gray-600">Campos extraídos</p>
                </div>
              </div>
              
              <ArrowRight className="w-6 h-6 text-gray-400" />
              
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Globe className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Obralia/Nalanda</p>
                  <p className="text-sm text-gray-600">Subida automática</p>
                </div>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <Clock className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Ahorra 90% del Tiempo</h4>
              <p className="text-gray-600">
                Lo que antes tomaba horas, ahora se hace en minutos
              </p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <Target className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">95% de Precisión</h4>
              <p className="text-gray-600">
                IA entrenada específicamente para documentos de construcción
              </p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <Shield className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">100% Seguro</h4>
              <p className="text-gray-600">
                Cumplimiento GDPR y encriptación de extremo a extremo
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="precios" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Planes y Precios
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Elige el plan que mejor se adapte a las necesidades de tu empresa
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div key={index} className={`bg-white rounded-2xl shadow-lg border-2 ${plan.color} p-8 relative ${plan.popular ? 'transform scale-105' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      Más Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-bold text-gray-900">€{plan.price}</span>
                    <span className="text-gray-600 ml-2">/{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => navigate('/client-login')}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                    plan.popular
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'border border-gray-300 hover:border-gray-400 text-gray-700'
                  }`}
                >
                  Comenzar Ahora
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonios" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Lo que Dicen Nuestros Clientes
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Empresas de construcción que ya confían en ConstructIA
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-8">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.text}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-gray-600 text-sm">{testimonial.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <ContactSection />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <Logo size="md" variant="light" />
              <p className="text-gray-400 mt-4 max-w-md">
                ConstructIA es la plataforma líder en gestión documental inteligente 
                para el sector de la construcción en España.
              </p>
              <div className="flex items-center space-x-4 mt-6">
                <Mail className="w-5 h-5 text-gray-400" />
                <span className="text-gray-400">contacto@constructia.com</span>
              </div>
              <div className="flex items-center space-x-4 mt-2">
                <Phone className="w-5 h-5 text-gray-400" />
                <span className="text-gray-400">+34 91 000 00 00</span>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Producto</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#caracteristicas" className="hover:text-white transition-colors">Características</a></li>
                <li><a href="#precios" className="hover:text-white transition-colors">Precios</a></li>
                <li><button onClick={() => navigate('/client-login')} className="hover:text-white transition-colors">Demo</button></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/privacy-policy" className="hover:text-white transition-colors">Política de Privacidad</Link></li>
                <li><Link to="/terms-of-service" className="hover:text-white transition-colors">Términos de Uso</Link></li>
                <li><Link to="/cookie-policy" className="hover:text-white transition-colors">Política de Cookies</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">GDPR</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <p className="text-gray-400 text-sm">
                © 2025 ConstructIA S.L. Todos los derechos reservados.
              </p>
              <div className="flex items-center space-x-6 mt-4 md:mt-0">
                <button
                  onClick={() => navigate('/admin-login')}
                  className="text-gray-500 hover:text-gray-300 transition-colors"
                  title="Acceso administrativo"
                >
                  <Shield className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}