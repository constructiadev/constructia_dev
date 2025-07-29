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
  X
} from 'lucide-react';
import Logo from '../common/Logo';

export default function LandingPage() {
  const [showVideoModal, setShowVideoModal] = useState(false);

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
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
              <button
                onClick={() => setShowVideoModal(true)}
                className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center"
              >
                <Play className="mr-2 h-5 w-5" />
                Ver Demo Video
              </button>
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
          {/* Imagen Hero Restaurada */}
              <div 
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

      {/* Modal de Video Demo */}
      <VideoModal 
        isOpen={showVideoModal} 
        onClose={() => setShowVideoModal(false)} 
      />
    </div>
  );
}

// Componente del Modal de Video
function VideoModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoProgress, setVideoProgress] = useState(0);

  // Simular video con animación
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isVideoPlaying && isOpen) {
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
  }, [isVideoPlaying, isOpen]);

  const togglePlay = () => {
    setIsVideoPlaying(!isVideoPlaying);
    if (!isVideoPlaying && videoProgress >= 100) {
      setVideoProgress(0);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const restartVideo = () => {
    setVideoProgress(0);
    setIsVideoPlaying(true);
  };

  // Reset cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setIsVideoPlaying(false);
      setVideoProgress(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
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
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Contenido del Video */}
        <div className="relative bg-gray-900 aspect-video">
          {/* Simulación de interfaz de ConstructIA */}
          <div className="absolute inset-0 flex items-center justify-center">
            {!isVideoPlaying && videoProgress === 0 ? (
              <div className="text-center">
                <div className="bg-white/20 rounded-full p-8 mb-6 mx-auto w-24 h-24 flex items-center justify-center">
                  <Play className="h-10 w-10 text-white ml-1" />
                </div>
                <p className="text-white text-xl font-semibold mb-2">Ver ConstructIA en Acción</p>
                <p className="text-white/80">Demo interactivo de 20 segundos</p>
              </div>
            ) : (
              <div className="w-full h-full relative">
                {/* Simulación de interfaz de ConstructIA */}
                <div className="absolute inset-6 bg-white rounded-lg p-6 opacity-95">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <img 
                        src="/Logo ConstructIA.png" 
                        alt="ConstructIA" 
                        className="w-12 h-12 object-contain mr-4"
                      />
                      <div>
                        <h4 className="font-bold text-gray-900">ConstructIA</h4>
                        <p className="text-sm text-gray-600">Gestión Documental IA</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Documentos Procesados</div>
                      <div className="text-3xl font-bold text-green-600">
                        {Math.floor(videoProgress * 1.27)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Simulación de documentos siendo procesados */}
                  <div className="space-y-3">
                    {[
                      { name: 'Certificado_Obra_A.pdf', type: 'Certificado', threshold: 20 },
                      { name: 'Factura_Materiales_B.pdf', type: 'Factura', threshold: 45 },
                      { name: 'DNI_Trabajador_C.pdf', type: 'Identificación', threshold: 70 }
                    ].map((doc, i) => (
                      <div 
                        key={i}
                        className={`flex items-center p-3 rounded-lg transition-all duration-500 ${
                          videoProgress > doc.threshold ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                        }`}
                      >
                        <FileText className={`h-5 w-5 mr-3 ${
                          videoProgress > doc.threshold ? 'text-green-600' : 'text-gray-400'
                        }`} />
                        <div className="flex-1">
                          <div className="text-sm font-medium">{doc.name}</div>
                          <div className="text-xs text-gray-500">
                            {videoProgress > doc.threshold ? `Clasificado como ${doc.type}` : 'Analizando con IA...'}
                          </div>
                        </div>
                        {videoProgress > doc.threshold && (
                          <div className="flex items-center">
                            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                            <span className="text-xs text-green-600 font-medium">
                              {Math.floor(85 + Math.random() * 10)}% confianza
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Barra de progreso de IA */}
                  <div className="mt-6">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="font-medium">Procesamiento IA Global</span>
                      <span className="text-green-600 font-bold">{Math.floor(videoProgress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${videoProgress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Controles del video */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={togglePlay}
                  className="bg-white/20 hover:bg-white/30 rounded-full p-3 transition-colors"
                >
                  {isVideoPlaying ? (
                    <Pause className="h-5 w-5 text-white" />
                  ) : (
                    <Play className="h-5 w-5 text-white ml-0.5" />
                  )}
                </button>
                
                <button
                  onClick={toggleMute}
                  className="bg-white/20 hover:bg-white/30 rounded-full p-3 transition-colors"
                >
                  {isMuted ? (
                    <VolumeX className="h-5 w-5 text-white" />
                  ) : (
                    <Volume2 className="h-5 w-5 text-white" />
                  )}
                </button>
                
                <button
                  onClick={restartVideo}
                  className="bg-white/20 hover:bg-white/30 rounded-full p-3 transition-colors"
                >
                  <RotateCcw className="h-5 w-5 text-white" />
                </button>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-white text-sm">
                  {Math.floor(videoProgress * 0.2)}s / 20s
                </div>
              </div>
            </div>
            
            {/* Barra de progreso del video */}
            <div className="mt-4">
              <div className="w-full bg-white/20 rounded-full h-1">
                <div 
                  className="bg-green-500 h-1 rounded-full transition-all duration-300"
                  style={{ width: `${videoProgress}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Indicador de reproducción */}
          {isVideoPlaying && (
            <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold animate-pulse">
              🔴 EN VIVO
            </div>
          )}
        </div>

        {/* Footer del Modal */}
        <div className="bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Demo interactivo mostrando el procesamiento de documentos con IA
            </div>
            <div className="flex space-x-3">
              <Link
                to="/register"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm"
                onClick={onClose}
              >
                Comenzar Gratis
              </Link>
              <Link
                to="/admin/login"
                className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-semibold transition-colors text-sm"
                onClick={onClose}
              >
                Ver Demo Admin
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}