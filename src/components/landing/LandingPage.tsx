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
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  RotateCcw
} from 'lucide-react';
import Logo from '../common/Logo';

export default function LandingPage() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Simular video con animación
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isVideoPlaying) {
      interval = setInterval(() => {
        setVideoProgress(prev => {
          if (prev >= 100) {
            setIsVideoPlaying(false);
            return 0;
          }
          return prev + 0.5; // Progreso cada 100ms para video de 20 segundos
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isVideoPlaying]);

  const togglePlay = () => {
    setIsVideoPlaying(!isVideoPlaying);
    if (!isVideoPlaying && videoProgress >= 100) {
      setVideoProgress(0);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const restartVideo = () => {
    setVideoProgress(0);
    setIsVideoPlaying(true);
  };

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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Logo size="md" />
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-600 hover:text-green-600 transition-colors">
                Características
              </a>
              <a href="#demo" className="text-gray-600 hover:text-green-600 transition-colors">
                Demo
              </a>
              <a href="#testimonials" className="text-gray-600 hover:text-green-600 transition-colors">
                Testimonios
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-green-600 transition-colors">
                Precios
              </a>
            </nav>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-green-600 transition-colors"
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
            
            {/* Video Demo Animado */}
            <div className="relative">
              <div 
                ref={containerRef}
                className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-2xl"
              >
                {/* Video simulado con animación */}
                <div className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900">
                  {/* Contenido del video simulado */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    {!isVideoPlaying && videoProgress === 0 ? (
                      <div className="text-center">
                        <div className="bg-white/20 rounded-full p-6 mb-4 mx-auto w-20 h-20 flex items-center justify-center">
                          <Play className="h-8 w-8 text-white ml-1" />
                        </div>
                        <p className="text-white text-lg font-semibold">Ver ConstructIA en Acción</p>
                        <p className="text-white/80 text-sm">Demo de 20 segundos</p>
                      </div>
                    ) : (
                      <div className="w-full h-full relative">
                        {/* Simulación de interfaz de ConstructIA */}
                        <div className="absolute inset-4 bg-white rounded-lg p-4 opacity-90">
                          <div className="flex items-center justify-between mb-4">
                            <div style={{ width: '72px', height: '72px' }}>
                              <img 
                                src="/Logo ConstructIA.png" 
                                alt="ConstructIA" 
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-600">Documentos Procesados</div>
                              <div className="text-2xl font-bold text-green-600">
                                {Math.floor(videoProgress * 1.27)}
                              </div>
                            </div>
                          </div>
                          
                          {/* Simulación de documentos siendo procesados */}
                          <div className="space-y-2">
                            {[1, 2, 3].map((i) => (
                              <div 
                                key={i}
                                className={`flex items-center p-2 rounded transition-all duration-500 ${
                                  videoProgress > i * 25 ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                                }`}
                              >
                                <FileText className={`h-4 w-4 mr-2 ${
                                  videoProgress > i * 25 ? 'text-green-600' : 'text-gray-400'
                                }`} />
                                <div className="flex-1">
                                  <div className="text-xs font-medium">
                                    {i === 1 && 'Certificado_Obra_A.pdf'}
                                    {i === 2 && 'Factura_Materiales_B.pdf'}
                                    {i === 3 && 'DNI_Trabajador_C.pdf'}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {videoProgress > i * 25 ? 'Procesado con IA' : 'Esperando...'}
                                  </div>
                                </div>
                                {videoProgress > i * 25 && (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                )}
                              </div>
                            ))}
                          </div>
                          
                          {/* Barra de progreso de IA */}
                          <div className="mt-4">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span>Procesamiento IA</span>
                              <span>{Math.floor(videoProgress)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${videoProgress}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Controles del video */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={togglePlay}
                          className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
                        >
                          {isVideoPlaying ? (
                            <Pause className="h-4 w-4 text-white" />
                          ) : (
                            <Play className="h-4 w-4 text-white ml-0.5" />
                          )}
                        </button>
                        
                        <button
                          onClick={toggleMute}
                          className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
                        >
                          {isMuted ? (
                            <VolumeX className="h-4 w-4 text-white" />
                          ) : (
                            <Volume2 className="h-4 w-4 text-white" />
                          )}
                        </button>
                        
                        <button
                          onClick={restartVideo}
                          className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
                        >
                          <RotateCcw className="h-4 w-4 text-white" />
                        </button>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="text-white text-xs">
                          {Math.floor(videoProgress * 0.2)}s / 20s
                        </div>
                        <button
                          onClick={toggleFullscreen}
                          className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
                        >
                          <Maximize className="h-4 w-4 text-white" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Barra de progreso del video */}
                    <div className="mt-2">
                      <div className="w-full bg-white/20 rounded-full h-1">
                        <div 
                          className="bg-green-500 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${videoProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Indicador de reproducción */}
              {isVideoPlaying && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold animate-pulse">
                  EN VIVO
                </div>
              )}
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

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
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
              <div key={index} className="bg-gray-50 p-8 rounded-xl">
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

      {/* CTA Section */}
      <section className="py-20 bg-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            ¿Listo para Revolucionar tu Gestión Documental?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Únete a cientos de empresas que ya están ahorrando tiempo y dinero con ConstructIA
          </p>
          <Link
            to="/register"
            className="bg-white text-green-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold transition-colors inline-flex items-center"
          >
            Comenzar Ahora Gratis
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
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
                <li><a href="#" className="hover:text-white transition-colors">Características</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Precios</a></li>
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
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 ConstructIA. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}