import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Lock, 
  Users, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Globe, 
  Award,
  Brain,
  Zap,
  Clock,
  Target,
  ArrowRight,
  Play,
  Pause
} from 'lucide-react';

const LandingPage = () => {
  const [currentSection, setCurrentSection] = useState('home');
  const [aiMetrics, setAiMetrics] = useState({
    documentsProcessed: 0,
    accuracy: 0,
    timesSaved: 0
  });
  const [isAnimating, setIsAnimating] = useState(true);

  // AI Animation Effect
  useEffect(() => {
    if (!isAnimating) return;

    const interval = setInterval(() => {
      setAiMetrics(prev => ({
        documentsProcessed: Math.min(prev.documentsProcessed + Math.floor(Math.random() * 3) + 1, 1247),
        accuracy: Math.min(prev.accuracy + 0.1, 98.7),
        timesSaved: Math.min(prev.timesSaved + Math.floor(Math.random() * 2) + 1, 847)
      }));
    }, 100);

    return () => clearInterval(interval);
  }, [isAnimating]);

  const scrollToSection = (sectionId: string) => {
    setCurrentSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">ConstructIA</span>
            </div>
            <div className="hidden md:flex space-x-8">
              <button 
                onClick={() => scrollToSection('home')}
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Inicio
              </button>
              <button 
                onClick={() => scrollToSection('features')}
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Características
              </button>
              <button 
                onClick={() => scrollToSection('gdpr')}
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                GDPR
              </button>
              <button 
                onClick={() => scrollToSection('contact')}
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Contacto
              </button>
            </div>
            <div className="flex space-x-4">
              <button className="text-gray-700 hover:text-blue-600 transition-colors">
                Iniciar Sesión
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Comenzar Gratis
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with AI Animation */}
      <section id="home" className="pt-16 pb-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
                Gestión Documental
                <span className="text-blue-600 block">Inteligente</span>
                para Construcción
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                ConstructIA revoluciona la gestión documental en el sector de la construcción 
                con IA avanzada, cumplimiento GDPR automático y integración perfecta con 
                plataformas como Obralia, CTaima y eCoordina.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
                  Comenzar Prueba Gratuita
                  <ArrowRight className="ml-2 w-5 h-5" />
                </button>
                <button className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg hover:bg-gray-50 transition-colors">
                  Ver Demo
                </button>
              </div>
            </div>

            {/* Right Column - AI Animation */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">IA Procesando Documentos</h3>
                  <button 
                    onClick={() => setIsAnimating(!isAnimating)}
                    className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                  >
                    {isAnimating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                </div>

                {/* AI Processing Animation */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${isAnimating ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                    <span className="text-sm text-gray-600">Analizando DNI_trabajador_001.pdf</span>
                    <div className={`ml-auto w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full ${isAnimating ? 'animate-spin' : ''}`}></div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${isAnimating ? 'bg-yellow-500 animate-pulse' : 'bg-gray-300'}`}></div>
                    <span className="text-sm text-gray-600">Clasificando certificado_PRL.pdf</span>
                    <div className={`ml-auto w-6 h-6 border-2 border-yellow-600 border-t-transparent rounded-full ${isAnimating ? 'animate-spin' : ''}`}></div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${isAnimating ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'}`}></div>
                    <span className="text-sm text-gray-600">Validando seguro_RC.pdf</span>
                    <CheckCircle className="ml-auto w-5 h-5 text-green-500" />
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{aiMetrics.documentsProcessed}</div>
                    <div className="text-xs text-gray-600">Documentos</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{aiMetrics.accuracy.toFixed(1)}%</div>
                    <div className="text-xs text-gray-600">Precisión</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{aiMetrics.timesSaved}h</div>
                    <div className="text-xs text-gray-600">Tiempo Ahorrado</div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-blue-500 rounded-full animate-bounce opacity-20"></div>
                <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-green-500 rounded-full animate-pulse opacity-30"></div>
                <div className="absolute top-1/2 -right-6 w-4 h-4 bg-purple-500 rounded-full animate-ping opacity-25"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Características Principales
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              ConstructIA combina inteligencia artificial avanzada con cumplimiento normativo 
              para ofrecer la solución más completa del mercado.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">IA Avanzada</h3>
              <p className="text-gray-600">
                Clasificación automática de documentos con 98.7% de precisión usando 
                modelos de IA entrenados específicamente para el sector construcción.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Automatización Total</h3>
              <p className="text-gray-600">
                Subida automática a plataformas como Obralia, CTaima y eCoordina. 
                Elimina el trabajo manual y reduce errores.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Cumplimiento GDPR</h3>
              <p className="text-gray-600">
                Cumplimiento automático con GDPR y LOPDGDD. Encriptación extremo a extremo 
                y gestión completa de derechos de los interesados.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Ahorro de Tiempo</h3>
              <p className="text-gray-600">
                Reduce hasta un 90% el tiempo dedicado a gestión documental. 
                Más tiempo para lo que realmente importa: tu negocio.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Precisión Extrema</h3>
              <p className="text-gray-600">
                Validación automática de documentos con detección de errores, 
                fechas de caducidad y requisitos específicos por obra.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Integración Universal</h3>
              <p className="text-gray-600">
                Compatible con todas las plataformas principales del sector. 
                API abierta para integraciones personalizadas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* GDPR Section */}
      <section id="gdpr" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Cumplimiento GDPR Integral
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              ConstructIA está diseñada desde el primer día para cumplir estrictamente con el GDPR y la LOPDGDD. 
              Tu privacidad y la de tus clientes es nuestra máxima prioridad.
            </p>
          </div>

          {/* GDPR Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-xl shadow-lg p-8 border border-blue-100">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Encriptación Extremo a Extremo</h3>
              <p className="text-gray-600 mb-4">
                Todos los documentos se encriptan con AES-256 antes del almacenamiento. 
                Tus datos están protegidos incluso si alguien accede físicamente a nuestros servidores.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Encriptación SSL/TLS 256-bit en tránsito</li>
                <li>• Encriptación AES-256 en reposo</li>
                <li>• Claves de encriptación rotadas automáticamente</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 border border-green-100">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Derechos del Interesado</h3>
              <p className="text-gray-600 mb-4">
                Facilitamos el ejercicio de todos los derechos GDPR con herramientas automatizadas 
                para acceso, rectificación, supresión y portabilidad de datos.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Portal de autogestión de derechos</li>
                <li>• Respuesta automática en 72 horas</li>
                <li>• Exportación de datos en formato estándar</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 border border-purple-100">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Registro de Actividades</h3>
              <p className="text-gray-600 mb-4">
                Mantenemos un registro detallado de todas las actividades de tratamiento 
                según el artículo 30 del GDPR.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Auditoría completa de accesos</li>
                <li>• Trazabilidad de modificaciones</li>
                <li>• Reportes automáticos de cumplimiento</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 border border-orange-100">
              <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Gestión de Brechas</h3>
              <p className="text-gray-600 mb-4">
                Sistema automatizado para detectar, reportar y gestionar brechas de seguridad 
                cumpliendo con los plazos de notificación del GDPR.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Detección automática de anomalías</li>
                <li>• Notificación a autoridades en 72h</li>
                <li>• Comunicación a interesados si procede</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 border border-red-100">
              <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Evaluaciones de Impacto</h3>
              <p className="text-gray-600 mb-4">
                Realizamos evaluaciones de impacto en protección de datos (EIPD) 
                para todos los tratamientos de alto riesgo.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Análisis automático de riesgos</li>
                <li>• Medidas de mitigación integradas</li>
                <li>• Revisiones periódicas programadas</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 border border-teal-100">
              <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Transferencias Internacionales</h3>
              <p className="text-gray-600 mb-4">
                Garantizamos la protección de datos en transferencias internacionales 
                mediante cláusulas contractuales tipo y certificaciones de adecuación.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Cláusulas contractuales tipo (CCT)</li>
                <li>• Evaluación de países terceros</li>
                <li>• Certificaciones de adecuación</li>
              </ul>
            </div>
          </div>

          {/* GDPR Compliance Process */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
              Nuestro Proceso de Cumplimiento GDPR
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Análisis de Riesgos</h4>
                <p className="text-sm text-gray-600">
                  Evaluamos automáticamente el riesgo de cada documento y tratamiento
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-600">2</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Medidas de Protección</h4>
                <p className="text-sm text-gray-600">
                  Aplicamos automáticamente las medidas técnicas y organizativas apropiadas
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-purple-600">3</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Monitoreo Continuo</h4>
                <p className="text-sm text-gray-600">
                  Supervisamos constantemente el cumplimiento y detectamos anomalías
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-orange-600">4</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Reportes Automáticos</h4>
                <p className="text-sm text-gray-600">
                  Generamos reportes de cumplimiento y auditorías de forma automática
                </p>
              </div>
            </div>
          </div>

          {/* Certifications */}
          <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">Certificaciones y Cumplimiento</h3>
              <p className="text-blue-100 mb-8 max-w-3xl mx-auto">
                ConstructIA cuenta con las certificaciones más exigentes del sector para garantizar 
                la máxima protección de datos y cumplimiento normativo.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-white/10 rounded-lg p-4 text-center">
                  <Shield className="w-8 h-8 mx-auto mb-2" />
                  <div className="font-semibold">ISO 27001</div>
                  <div className="text-sm text-blue-200">Seguridad de la Información</div>
                </div>
                
                <div className="bg-white/10 rounded-lg p-4 text-center">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                  <div className="font-semibold">GDPR</div>
                  <div className="text-sm text-blue-200">Cumplimiento Certificado</div>
                </div>
                
                <div className="bg-white/10 rounded-lg p-4 text-center">
                  <Globe className="w-8 h-8 mx-auto mb-2" />
                  <div className="font-semibold">LOPDGDD</div>
                  <div className="text-sm text-blue-200">Ley Española</div>
                </div>
                
                <div className="bg-white/10 rounded-lg p-4 text-center">
                  <Award className="w-8 h-8 mx-auto mb-2" />
                  <div className="font-semibold">SOC 2</div>
                  <div className="text-sm text-blue-200">Controles de Seguridad</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              ¿Listo para Revolucionar tu Gestión Documental?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Únete a cientos de empresas que ya confían en ConstructIA para 
              optimizar sus procesos documentales.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-50 rounded-2xl p-8">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre
                    </label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Tu nombre"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input 
                      type="email" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Empresa
                  </label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nombre de tu empresa"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mensaje
                  </label>
                  <textarea 
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Cuéntanos sobre tu proyecto..."
                  ></textarea>
                </div>
                <button 
                  type="submit"
                  className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Solicitar Demo Gratuita
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Shield className="w-8 h-8 text-blue-400" />
                <span className="ml-2 text-xl font-bold">ConstructIA</span>
              </div>
              <p className="text-gray-300 mb-4">
                La plataforma de gestión documental más avanzada para el sector de la construcción.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Producto</h4>
              <ul className="space-y-2 text-gray-300">
                <li><button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">Características</button></li>
                <li><a href="#" className="hover:text-white transition-colors">Precios</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integraciones</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Sobre Nosotros</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Carreras</a></li>
                <li><button onClick={() => scrollToSection('contact')} className="hover:text-white transition-colors">Contacto</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Términos de Servicio</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Política de Privacidad</a></li>
                <li><button onClick={() => scrollToSection('gdpr')} className="hover:text-white transition-colors">GDPR</button></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-600 mt-12 pt-8 text-center text-gray-300">
            <p>&copy; 2024 ConstructIA. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;