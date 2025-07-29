import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  CheckCircle, 
  Star, 
  Users, 
  FileText, 
  Brain,
  Shield,
  Zap,
  Building2,
  Play,
  X,
  Pause,
  VolumeX,
  Volume2,
  RotateCcw,
  Euro,
  Clock,
  TrendingUp,
  Globe,
  Eye,
  Settings,
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  Send,
  Calendar,
  ExternalLink
} from 'lucide-react';
import Logo from '../common/Logo';

export default function LandingPage() {
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Animación de datos en tiempo real
  useEffect(() => {
    const animateCounters = () => {
      // Animar contador de documentos
      const docsCounter = document.getElementById('docs-counter');
      if (docsCounter) {
        const currentDocs = parseInt(docsCounter.textContent?.replace(',', '') || '12456');
        const newDocs = currentDocs + Math.floor(Math.random() * 3);
        docsCounter.textContent = newDocs.toLocaleString();
      }

      // Animar precisión IA
      const aiAccuracy = document.getElementById('ai-accuracy');
      if (aiAccuracy) {
        const variations = ['95.7%', '95.8%', '95.9%', '96.0%', '95.6%'];
        const randomAccuracy = variations[Math.floor(Math.random() * variations.length)];
        aiAccuracy.textContent = randomAccuracy;
      }

      // Animar tiempo de respuesta
      const responseTime = document.getElementById('response-time');
      if (responseTime) {
        const times = ['2.3s', '2.1s', '2.4s', '2.2s', '2.5s'];
        const randomTime = times[Math.floor(Math.random() * times.length)];
        responseTime.textContent = randomTime;
      }

      // Animar clientes activos
      const activeClients = document.getElementById('active-clients');
      if (activeClients) {
        const currentClients = parseInt(activeClients.textContent || '247');
        const variation = Math.random() > 0.7 ? 1 : 0; // 30% probabilidad de incremento
        if (variation) {
          activeClients.textContent = (currentClients + variation).toString();
        }
      }
    };

    // Actualizar cada 5 segundos
    const interval = setInterval(animateCounters, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: Brain,
      title: "IA Avanzada",
      description: "Clasificación automática de documentos con 95% de precisión usando Gemini AI"
    },
    {
      icon: Shield,
      title: "Seguridad Total",
      description: "Encriptación de extremo a extremo y cumplimiento GDPR garantizado"
    },
    {
      icon: Zap,
      title: "Procesamiento Rápido",
      description: "Documentos procesados en menos de 3 segundos promedio"
    },
    {
      icon: Building2,
      title: "Integración Obralia",
      description: "Subida automática a Obralia/Nalanda tras validación"
    }
  ];

  const testimonials = [
    {
      name: "Carlos García",
      company: "Construcciones García S.L.",
      text: "ConstructIA ha revolucionado nuestra gestión documental. Ahorramos 15 horas semanales.",
      rating: 5
    },
    {
      name: "María López",
      company: "Obras Públicas del Norte",
      text: "La precisión de la IA es impresionante. Nunca habíamos tenido un sistema tan eficiente.",
      rating: 5
    },
    {
      name: "Juan Martínez",
      company: "Reformas Integrales",
      text: "El soporte es excepcional y la integración con Obralia es perfecta.",
      rating: 5
    }
  ];

  const stats = [
    { number: "10,000+", label: "Documentos Procesados" },
    { number: "95%", label: "Precisión IA" },
    { number: "3s", label: "Tiempo Promedio" },
    { number: "24/7", label: "Soporte Disponible" }
  ];

  const pricingPlans = [
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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 h-16">
            <div className="flex items-center space-x-4">
              <Logo size="md" />
              <div className="hidden sm:block">
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-semibold">
                  Powered by Gemini AI
                </span>
              </div>
            </div>
            
            <nav className="hidden lg:flex items-center space-x-6">
              <a href="#features" className="text-gray-600 hover:text-green-600 transition-colors">
                Características
              </a>
              <a href="#services" className="text-gray-600 hover:text-green-600 transition-colors">
                Servicios IA
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-green-600 transition-colors">
                Precios
              </a>
              <a href="#contact" className="text-gray-600 hover:text-green-600 transition-colors">
                Contacto
              </a>
            </nav>
            
            <div className="flex items-center space-x-3">
              <div className="hidden sm:block">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-green-600 transition-colors font-medium"
                >
                  Iniciar Sesión
                </Link>
              </div>
              <div className="flex items-center space-x-2">
                <Link
                  to="/register"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors font-semibold"
                >
                  Comenzar Gratis
                </Link>
                <button
                  onClick={() => setShowVideoModal(true)}
                  className="hidden md:flex border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg font-semibold transition-colors items-center"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Ver Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-emerald-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                Gestión Documental
                <span className="text-green-600"> Inteligente</span>
                <br />
                para Construcción
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Automatiza la clasificación y gestión de documentos con IA avanzada. 
                Integración directa con Obralia/Nalanda para máxima eficiencia.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link
                  to="/register"
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center"
                >
                  Comenzar Prueba Gratuita
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  to="/admin/login"
                  className="border border-green-600 text-green-600 hover:bg-green-50 px-8 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center"
                >
                  Ver Demo Admin
                </Link>
              </div>
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Sin tarjeta de crédito
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Configuración en 5 minutos
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Soporte 24/7
                </div>
              </div>
            </div>
            
            {/* Imagen Hero con botón de video */}
            <div className="relative">
              <img 
                src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800" 
                alt="Gestión documental inteligente" 
                className="w-full h-auto rounded-2xl shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">ConstructIA en Acción</h3>
                      <p className="text-sm text-gray-600">Procesamiento inteligente de documentos</p>
                    </div>
                    <button
                      onClick={() => setShowVideoModal(true)}
                      className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-full transition-colors"
                    >
                      <Play className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Potencia tu Gestión Documental
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              ConstructIA combina inteligencia artificial avanzada con integración perfecta 
              para revolucionar cómo gestionas tus documentos de construcción.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                  <feature.icon className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Services Section */}
      <section id="services" className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Brain className="h-4 w-4 mr-2" />
              Powered by Gemini AI
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Servicios de IA Especializados
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              Soluciones inteligentes diseñadas específicamente para el sector de la construcción, 
              con IA avanzada que entiende las particularidades de cada tipo de proyecto.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {/* Gestión Documental General */}
            <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Gestión Documental Inteligente
              </h3>
              <p className="text-gray-600 mb-6">
                Clasificación automática de documentos de construcción con IA avanzada. 
                Procesamiento inteligente de facturas, certificados, contratos y más.
              </p>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                  Clasificación automática con 95% precisión
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                  Extracción de datos clave
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                  Integración directa con Obralia
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                  Procesamiento en tiempo real
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Tiempo promedio:</span>
                  <span className="font-bold text-green-600">2.3 segundos</span>
                </div>
              </div>
            </div>

            {/* Certificación de Maquinarias */}
            <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-gradient-to-br from-orange-500 to-red-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                <Settings className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Certificación de Maquinarias
              </h3>
              <p className="text-gray-600 mb-6">
                Gestión especializada de documentación técnica para maquinaria de construcción. 
                IA entrenada específicamente para certificados, inspecciones y mantenimiento.
              </p>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-orange-500 mr-3" />
                  Certificados de inspección técnica
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-orange-500 mr-3" />
                  Documentación de mantenimiento
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-orange-500 mr-3" />
                  Seguros y pólizas de maquinaria
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-orange-500 mr-3" />
                  Alertas de vencimiento automáticas
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Precisión especializada:</span>
                  <span className="font-bold text-orange-600">97.2%</span>
                </div>
              </div>
            </div>

            {/* Obra Civil y Pública */}
            <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Obra Civil y Pública
              </h3>
              <p className="text-gray-600 mb-6">
                Gestión integral y puntual de documentación para proyectos de obra civil y pública. 
                IA especializada en normativas y requisitos específicos del sector público.
              </p>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-blue-500 mr-3" />
                  Documentación de licitaciones
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-blue-500 mr-3" />
                  Certificados de obra pública
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-blue-500 mr-3" />
                  Cumplimiento normativo automático
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-blue-500 mr-3" />
                  Gestión de permisos y licencias
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Cumplimiento normativo:</span>
                  <span className="font-bold text-blue-600">99.1%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Características Técnicas de la IA */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Tecnología IA de Vanguardia
              </h3>
              <p className="text-gray-600 max-w-3xl mx-auto">
                Nuestro sistema utiliza Gemini AI de Google, entrenado específicamente para el sector de la construcción
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl">
                <Brain className="h-10 w-10 text-purple-600 mx-auto mb-4" />
                <h4 className="font-bold text-gray-900 mb-2">Gemini AI</h4>
                <p className="text-sm text-gray-600">Modelo de IA más avanzado de Google</p>
              </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                <Zap className="h-10 w-10 text-green-600 mx-auto mb-4" />
                <h4 className="font-bold text-gray-900 mb-2">Procesamiento Rápido</h4>
                <p className="text-sm text-gray-600">Resultados en menos de 3 segundos</p>
              </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
                <Shield className="h-10 w-10 text-blue-600 mx-auto mb-4" />
                <h4 className="font-bold text-gray-900 mb-2">Seguridad Total</h4>
                <p className="text-sm text-gray-600">Encriptación y cumplimiento GDPR</p>
              </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl">
                <TrendingUp className="h-10 w-10 text-orange-600 mx-auto mb-4" />
                <h4 className="font-bold text-gray-900 mb-2">Mejora Continua</h4>
                <p className="text-sm text-gray-600">IA que aprende de cada documento</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Planes que se Adaptan a tu Empresa
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Desde pequeñas empresas hasta grandes corporaciones, tenemos el plan perfecto para ti.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan) => (
              <div
                key={plan.id}
                className={`relative border-2 rounded-xl p-8 ${
                  plan.popular
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      Más Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-semibold text-gray-900">{plan.name}</h3>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">€{plan.price}</span>
                    <span className="text-gray-600">/{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to="/register"
                  className={`block w-full text-center py-3 px-6 rounded-lg font-semibold transition-colors ${
                    plan.popular
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}
                >
                  Comenzar Ahora
                </Link>
              </div>
            ))}
          </div>

          {/* Información sobre Tokens para Suscriptores */}
          <div className="mt-16 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Tokens de Servicio para Suscriptores
              </h3>
              <p className="text-lg text-gray-600 mb-6 max-w-3xl mx-auto">
                Los <strong>Tokens de Servicio</strong> son un upgrade puntual y no recurrente para suscriptores activos. 
                Perfectos para picos de trabajo: nuevos proyectos, inspecciones en obra, o cuando necesites procesar 
                más documentos de lo habitual.
              </p>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 mb-6">
                <h4 className="font-semibold text-gray-900 mb-4">¿Cuándo necesitas tokens adicionales?</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Building2 className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-green-800">Nuevo Proyecto</p>
                    <p className="text-xs text-green-600">Gran volumen inicial</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <Eye className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-orange-800">Inspección en Obra</p>
                    <p className="text-xs text-orange-600">Documentación intensiva</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-purple-800">Pico de Actividad</p>
                    <p className="text-xs text-purple-600">Temporada alta</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-blue-800">Auditoría</p>
                    <p className="text-xs text-blue-600">Revisión masiva</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  <strong>Solo para suscriptores:</strong> Los tokens son un upgrade puntual y no recurrente 
                  que se añade a tu suscripción actual. No tienen caducidad y se usan cuando los necesites.
                </p>
              </div>
              <p className="text-gray-600">
                <strong>¿Ya eres cliente?</strong>{' '}
                <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                  Inicia sesión para comprar tokens →
                </Link>
              </p>
            </div>
          </div>
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              ¿Necesitas algo más específico?
            </p>
            <Link
              to="/register"
              className="text-green-600 hover:text-green-700 font-semibold"
            >
              Contacta para un plan personalizado →
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Lo que Dicen Nuestros Clientes
            </h2>
            <p className="text-xl text-gray-600">
              Empresas de construcción que ya confían en ConstructIA
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.text}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-gray-600 text-sm">{testimonial.company}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Real-time Stats Section */}
      <section className="py-20 bg-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              ConstructIA en Tiempo Real
            </h2>
            <p className="text-xl text-green-100">
              Datos actualizados en vivo de nuestra plataforma
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-white/20 rounded-lg p-6 mb-4">
                <FileText className="h-8 w-8 text-white mx-auto mb-2" />
                <div id="docs-counter" className="text-3xl font-bold text-white">12,456</div>
                <div className="text-green-100">Documentos Procesados</div>
              </div>
              <div className="text-sm text-green-200">+127 hoy</div>
            </div>
            
            <div className="text-center">
              <div className="bg-white/20 rounded-lg p-6 mb-4">
                <Users className="h-8 w-8 text-white mx-auto mb-2" />
                <div id="active-clients" className="text-3xl font-bold text-white">247</div>
                <div className="text-green-100">Clientes Activos</div>
              </div>
              <div className="text-sm text-green-200">+3 esta semana</div>
            </div>
            
            <div className="text-center">
              <div className="bg-white/20 rounded-lg p-6 mb-4">
                <Clock className="h-8 w-8 text-white mx-auto mb-2" />
                <div id="response-time" className="text-3xl font-bold text-white">2.3s</div>
                <div className="text-green-100">Tiempo Promedio</div>
              </div>
              <div className="text-sm text-green-200">-0.2s este mes</div>
            </div>
            
            <div className="text-center">
              <div className="bg-white/20 rounded-lg p-6 mb-4">
                <TrendingUp className="h-8 w-8 text-white mx-auto mb-2" />
                <div id="ai-accuracy" className="text-3xl font-bold text-white">95.7%</div>
                <div className="text-green-100">Precisión IA</div>
              </div>
              <div className="text-sm text-green-200">+1.2% este mes</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              ¿Tienes Preguntas? Contáctanos
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Nuestro equipo de expertos está aquí para ayudarte a implementar ConstructIA en tu empresa
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Información de Contacto */}
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Información de Contacto</h3>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="bg-green-100 p-3 rounded-lg mr-4">
                      <Mail className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Email</h4>
                      <p className="text-gray-600">contacto@constructia.com</p>
                      <p className="text-sm text-gray-500">Respuesta en menos de 24 horas</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-blue-100 p-3 rounded-lg mr-4">
                      <Phone className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Teléfono</h4>
                      <p className="text-gray-600">+34 91 000 00 00</p>
                      <p className="text-sm text-gray-500">Lunes a Viernes, 9:00 - 18:00</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-purple-100 p-3 rounded-lg mr-4">
                      <MapPin className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Oficina</h4>
                      <p className="text-gray-600">Calle Innovación 123</p>
                      <p className="text-gray-600">28001 Madrid, España</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-orange-100 p-3 rounded-lg mr-4">
                      <MessageCircle className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Chat en Vivo</h4>
                      <p className="text-gray-600">Disponible en la plataforma</p>
                      <p className="text-sm text-gray-500">Soporte técnico inmediato</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Horarios de Soporte */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="h-5 w-5 text-green-600 mr-2" />
                  Horarios de Soporte
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lunes - Viernes:</span>
                    <span className="font-medium">9:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sábados:</span>
                    <span className="font-medium">10:00 - 14:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Domingos:</span>
                    <span className="font-medium">Cerrado</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-gray-600">Emergencias 24/7:</span>
                    <span className="font-medium text-green-600">Plan Empresarial</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Formulario de Contacto */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Envíanos un Mensaje</h3>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Tu nombre"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Empresa
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Nombre de tu empresa"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="tu@email.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="+34 600 000 000"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Consulta
                  </label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                    <option value="">Selecciona una opción</option>
                    <option value="demo">Solicitar Demo</option>
                    <option value="pricing">Información de Precios</option>
                    <option value="integration">Integración con Obralia</option>
                    <option value="support">Soporte Técnico</option>
                    <option value="custom">Plan Personalizado</option>
                    <option value="other">Otro</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mensaje *
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Cuéntanos sobre tu proyecto y cómo podemos ayudarte..."
                  ></textarea>
                </div>
                
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    className="mt-1 mr-3"
                  />
                  <label className="text-sm text-gray-600">
                    Acepto recibir comunicaciones comerciales de ConstructIA y he leído la{' '}
                    <a href="#" className="text-green-600 hover:text-green-700">política de privacidad</a>
                  </label>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
                >
                  <Send className="h-5 w-5 mr-2" />
                  Enviar Mensaje
                </button>
              </form>
            </div>
          </div>
          
          {/* Información Adicional */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Respuesta Rápida</h4>
              <p className="text-gray-600">Respondemos todas las consultas en menos de 24 horas</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Equipo Experto</h4>
              <p className="text-gray-600">Especialistas en construcción y tecnología IA</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ExternalLink className="h-8 w-8 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Demo Personalizada</h4>
              <p className="text-gray-600">Configuramos una demo específica para tu empresa</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            ¿Listo para Revolucionar tu Gestión Documental?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Únete a cientos de empresas que ya están ahorrando tiempo y dinero con ConstructIA
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors inline-flex items-center justify-center"
            >
              Comenzar Ahora Gratis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <button
              onClick={() => setShowVideoModal(true)}
              className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 rounded-lg font-semibold transition-colors inline-flex items-center justify-center"
            >
              <Play className="mr-2 h-5 w-5" />
              Ver Demo Completo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Logo variant="light" size="md" />
              <p className="text-gray-400 mt-4">
                Gestión documental inteligente para el sector de la construcción.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Producto</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Características</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Precios</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integraciones</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Sobre Nosotros</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contacto</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Soporte</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Centro de Ayuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentación</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Estado del Sistema</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 relative">
            <p>&copy; 2025 ConstructIA. Todos los derechos reservados.</p>
            {/* Acceso discreto de administrador */}
            <Link
              to="/admin/login"
              className="absolute bottom-0 right-0 opacity-20 hover:opacity-60 transition-opacity duration-300"
              title="Acceso administrador"
            >
              <Shield className="h-3 w-3 text-gray-500" />
            </Link>
          </div>
        </div>
      </footer>

      {/* Modal de Video Demo */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl w-full max-w-4xl">
            {/* Header del Modal */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">ConstructIA en Acción</h3>
                  <p className="text-green-100">Demo interactivo de la plataforma</p>
                </div>
                <button
                  onClick={() => setShowVideoModal(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Contenido del Video */}
            <div className="relative bg-gray-900 aspect-video overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                poster="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1200"
                muted={isVideoMuted}
                onPlay={() => setIsVideoPlaying(true)}
                onPause={() => setIsVideoPlaying(false)}
                onEnded={() => setIsVideoPlaying(false)}
              >
                <source src="https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4" type="video/mp4" />
                <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" />
                Tu navegador no soporta el elemento video.
              </video>
              
              {/* Overlay de controles */}
              <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => {
                      if (videoRef.current) {
                        if (isVideoPlaying) {
                          videoRef.current.pause();
                        } else {
                          videoRef.current.play();
                        }
                      }
                    }}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-4 transition-colors"
                  >
                    {isVideoPlaying ? (
                      <Pause className="h-8 w-8 text-white" />
                    ) : (
                      <Play className="h-8 w-8 text-white ml-1" />
                    )}
                  </button>
                  
                  <button
                    onClick={() => {
                      if (videoRef.current) {
                        setIsVideoMuted(!isVideoMuted);
                        videoRef.current.muted = !isVideoMuted;
                      }
                    }}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-colors"
                  >
                    {isVideoMuted ? (
                      <VolumeX className="h-6 w-6 text-white" />
                    ) : (
                      <Volume2 className="h-6 w-6 text-white" />
                    )}
                  </button>
                  
                  <button
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.currentTime = 0;
                        videoRef.current.play();
                      }
                    }}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-colors"
                  >
                    <RotateCcw className="h-6 w-6 text-white" />
                  </button>
                </div>
              </div>
              
              {/* Indicador de estado cuando no está reproduciendo */}
              {!isVideoPlaying && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="bg-white/20 rounded-full p-8 mb-6 mx-auto w-24 h-24 flex items-center justify-center backdrop-blur-sm">
                      <Play className="h-10 w-10 text-white ml-1" />
                    </div>
                    <p className="text-white text-xl font-semibold mb-2">Ver ConstructIA en Acción</p>
                    <p className="text-white/80">Haz clic para reproducir el demo</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer del Modal */}
            <div className="bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Demo mostrando el procesamiento de documentos con IA
                </div>
                <div className="flex space-x-3">
                  <Link
                    to="/register"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm"
                    onClick={() => setShowVideoModal(false)}
                  >
                    Comenzar Gratis
                  </Link>
                  <Link
                    to="/admin/login"
                    className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-semibold transition-colors text-sm"
                    onClick={() => setShowVideoModal(false)}
                  >
                    Ver Demo Admin
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}