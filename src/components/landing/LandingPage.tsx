import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  CheckCircle, 
  Star, 
  Users, 
  FileText, 
  Shield, 
  Clock, 
  TrendingUp,
  Eye,
  Database,
  AlertTriangle,
  Activity,
  Upload,
  Zap,
  CheckCircle2,
  Sparkles,
  Building,
  FileCheck,
  Timer,
  Target
} from 'lucide-react';

const LandingPage = () => {
  const [currentDoc, setCurrentDoc] = useState(0);
  const [metrics, setMetrics] = useState({
    processed: 1247,
    accuracy: 94.2,
    avgTime: 2.3
  });

  const documents = [
    { name: 'Certificado PRL', status: 'processing', progress: 75 },
    { name: 'Aptitud Médica', status: 'completed', progress: 100 },
    { name: 'Seguro RC', status: 'analyzing', progress: 45 },
    { name: 'Plan Seguridad', status: 'validating', progress: 90 }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDoc((prev) => (prev + 1) % documents.length);
      setMetrics(prev => ({
        processed: prev.processed + Math.floor(Math.random() * 3),
        accuracy: 94.2 + (Math.random() - 0.5) * 0.4,
        avgTime: 2.3 + (Math.random() - 0.5) * 0.6
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">ConstructIA</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <button onClick={() => scrollToSection('features')} className="text-gray-600 hover:text-gray-900">Características</button>
              <button onClick={() => scrollToSection('pricing')} className="text-gray-600 hover:text-gray-900">Precios</button>
              <button onClick={() => scrollToSection('gdpr')} className="text-gray-600 hover:text-gray-900">GDPR</button>
              <button onClick={() => scrollToSection('contact')} className="text-gray-600 hover:text-gray-900">Contacto</button>
            </nav>
            <div className="flex items-center space-x-4">
              <button className="text-gray-600 hover:text-gray-900">Iniciar Sesión</button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Prueba Gratis
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mb-6">
                <Sparkles className="w-4 h-4 mr-2" />
                IA Avanzada para Construcción
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
                Gestión Documental
                <span className="text-blue-600"> Inteligente</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Automatiza la clasificación y subida de documentos a Obralia, Nalanda y CTAIMA. 
                Ahorra <strong>15 horas semanales</strong>, reduce errores al 0% y cumple con todas las normativas.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center">
                  Comenzar Gratis
                  <ArrowRight className="ml-2 w-5 h-5" />
                </button>
                <button className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 flex items-center justify-center">
                  Ver Demo
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Sin tarjeta de crédito
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Setup en 5 minutos
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Soporte en español
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Cumplimiento GDPR
                </div>
              </div>
            </div>

            {/* AI Animation */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">IA Procesando Documentos</h3>
                  <div className="flex items-center text-green-600">
                    <Activity className="w-4 h-4 mr-1" />
                    <span className="text-sm font-medium">En vivo</span>
                  </div>
                </div>

                {/* Current Document */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{documents[currentDoc].name}</span>
                    <span className="text-sm text-gray-500">{documents[currentDoc].progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${documents[currentDoc].progress}%` }}
                    ></div>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    Estado: <span className="font-medium">{documents[currentDoc].status}</span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{metrics.processed.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">Documentos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{metrics.accuracy.toFixed(1)}%</div>
                    <div className="text-xs text-gray-500">Precisión</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{metrics.avgTime.toFixed(1)}s</div>
                    <div className="text-xs text-gray-500">Tiempo Medio</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nueva sección de estadísticas */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800 mb-8">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            Nueva integración con CTAIMA disponible
          </div>

          {/* Título principal */}
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Gestión Documental <span className="text-green-600">Inteligente</span>
            <br />
            <span className="text-gray-600">para Construcción</span>
          </h2>

          {/* Descripción */}
          <p className="text-xl text-gray-600 mb-8 max-w-4xl mx-auto">
            Automatiza la clasificación y subida de documentos a <strong>Obralia/Nalanda</strong>,
            <strong> CTAIMA, ECoordina</strong> con IA. Ahorra <strong>15 horas semanales</strong>, reduce errores al <strong>0%</strong>
            <br />
            y cumple con todas las normativas.
          </p>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 flex items-center justify-center font-medium">
              <span className="mr-2">▶</span>
              Probar Demo Gratis
            </button>
            <button className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 flex items-center justify-center font-medium">
              <span className="mr-2">▶</span>
              Ver Video Demo
            </button>
          </div>

          {/* Beneficios */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            <div className="flex items-center justify-center text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              Sin tarjeta de crédito
            </div>
            <div className="flex items-center justify-center text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              Setup en 5 minutos
            </div>
            <div className="flex items-center justify-center text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              Soporte en español
            </div>
            <div className="flex items-center justify-center text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              Cumplimiento GDPR
            </div>
          </div>

          {/* Métricas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Building className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">500+</div>
              <div className="text-gray-600">Empresas Activas</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileCheck className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">50K+</div>
              <div className="text-gray-600">Documentos Procesados</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">94.2%</div>
              <div className="text-gray-600">Precisión IA</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Timer className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">15h</div>
              <div className="text-gray-600">Ahorro semanal</div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección ¿Cómo Funciona? */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">¿Cómo Funciona?</h2>
          <p className="text-gray-600 mb-16">Proceso automatizado en 4 pasos simples</p>

          <div className="grid md:grid-cols-4 gap-8">
            {/* Paso 1 */}
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-600">1</span>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Sube Documentos</h3>
              <p className="text-gray-600 text-sm">
                Arrastra y suelta o selecciona archivos desde tu dispositivo
              </p>
            </div>

            {/* Paso 2 */}
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-purple-600">2</span>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">IA Clasifica</h3>
              <p className="text-gray-600 text-sm">
                Gemini AI detecta y clasifica automáticamente cada documento
              </p>
            </div>

            {/* Paso 3 */}
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-green-600">3</span>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Validación</h3>
              <p className="text-gray-600 text-sm">
                Sistema valida fechas, formatos y cumplimiento normativo
              </p>
            </div>

            {/* Paso 4 */}
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-orange-600">4</span>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Integración</h3>
              <p className="text-gray-600 text-sm">
                Subida automática a Obralia/Nalanda con mapeo correcto
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Características Principales
            </h2>
            <p className="text-xl text-gray-600">
              Todo lo que necesitas para gestionar documentos de construcción
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Clasificación Automática
              </h3>
              <p className="text-gray-600">
                IA avanzada que identifica y clasifica documentos PRL, certificados médicos, seguros y más.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Cumplimiento Normativo
              </h3>
              <p className="text-gray-600">
                Validación automática de fechas de caducidad y requisitos legales específicos del sector.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Integración Directa
              </h3>
              <p className="text-gray-600">
                Conexión directa con Obralia, Nalanda, CTAIMA y ECoordina para subida automática.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Ahorro de Tiempo
              </h3>
              <p className="text-gray-600">
                Reduce el tiempo de gestión documental de 20 horas a 5 horas semanales.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Gestión de Equipos
              </h3>
              <p className="text-gray-600">
                Control completo de trabajadores, subcontratistas y documentación por obra.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Validación Inteligente
              </h3>
              <p className="text-gray-600">
                Detección automática de errores, documentos duplicados y fechas de caducidad.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* GDPR Section */}
      <section id="gdpr" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800 mb-6">
              <Shield className="w-4 h-4 mr-2" />
              Cumplimiento GDPR Garantizado
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Protección de Datos y Cumplimiento GDPR
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              ConstructIA cumple con todas las normativas de protección de datos, 
              garantizando la seguridad y privacidad de tu información empresarial.
            </p>
          </div>

          {/* GDPR Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Transparencia Total
              </h3>
              <p className="text-gray-600">
                Información clara sobre qué datos procesamos, cómo y por qué los utilizamos.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Database className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Minimización de Datos
              </h3>
              <p className="text-gray-600">
                Solo procesamos los datos estrictamente necesarios para el servicio.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Seguridad Avanzada
              </h3>
              <p className="text-gray-600">
                Cifrado end-to-end y medidas de seguridad técnicas y organizativas.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Derechos del Usuario
              </h3>
              <p className="text-gray-600">
                Acceso, rectificación, supresión y portabilidad de datos garantizados.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Gestión de Brechas
              </h3>
              <p className="text-gray-600">
                Protocolo de notificación de brechas en menos de 72 horas.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Activity className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Auditorías Regulares
              </h3>
              <p className="text-gray-600">
                Evaluaciones periódicas de cumplimiento y mejora continua.
              </p>
            </div>
          </div>

          {/* GDPR Process */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
              Nuestro Proceso de Cumplimiento GDPR
            </h3>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">1</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Evaluación</h4>
                <p className="text-sm text-gray-600">Análisis de impacto en protección de datos</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">2</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Implementación</h4>
                <p className="text-sm text-gray-600">Medidas técnicas y organizativas</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">3</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Monitoreo</h4>
                <p className="text-sm text-gray-600">Supervisión continua del cumplimiento</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">4</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Mejora</h4>
                <p className="text-sm text-gray-600">Actualización y optimización constante</p>
              </div>
            </div>
          </div>

          {/* Certifications */}
          <div className="mt-16 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-8">Certificaciones y Cumplimiento</h3>
            <div className="flex justify-center items-center space-x-8 opacity-60">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <span className="text-xs font-bold text-gray-600">ISO</span>
                </div>
                <span className="text-sm text-gray-600">ISO 27001</span>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <span className="text-xs font-bold text-gray-600">GDPR</span>
                </div>
                <span className="text-sm text-gray-600">GDPR</span>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <span className="text-xs font-bold text-gray-600">LOPD</span>
                </div>
                <span className="text-sm text-gray-600">LOPDGDD</span>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <span className="text-xs font-bold text-gray-600">SOC</span>
                </div>
                <span className="text-sm text-gray-600">SOC 2</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Precios Transparentes
            </h2>
            <p className="text-xl text-gray-600">
              Elige el plan que mejor se adapte a tu empresa
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Starter Plan */}
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Starter</h3>
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  €49<span className="text-lg text-gray-500">/mes</span>
                </div>
                <p className="text-gray-600">Perfecto para pequeñas empresas</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Hasta 100 documentos/mes</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>1 integración (Obralia o Nalanda)</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Soporte por email</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Dashboard básico</span>
                </li>
              </ul>
              <button className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800">
                Comenzar Prueba Gratis
              </button>
            </div>

            {/* Professional Plan */}
            <div className="bg-blue-600 rounded-2xl shadow-sm p-8 text-white relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-medium">
                  Más Popular
                </span>
              </div>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">Professional</h3>
                <div className="text-4xl font-bold mb-2">
                  €149<span className="text-lg opacity-75">/mes</span>
                </div>
                <p className="opacity-75">Para empresas en crecimiento</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                  <span>Hasta 500 documentos/mes</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                  <span>Todas las integraciones</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                  <span>Soporte prioritario</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                  <span>Analytics avanzados</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                  <span>API access</span>
                </li>
              </ul>
              <button className="w-full bg-white text-blue-600 py-3 rounded-lg hover:bg-gray-50 font-medium">
                Comenzar Prueba Gratis
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  Personalizado
                </div>
                <p className="text-gray-600">Para grandes organizaciones</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Documentos ilimitados</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Integraciones personalizadas</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Soporte 24/7</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>SLA garantizado</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Onboarding dedicado</span>
                </li>
              </ul>
              <button className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800">
                Contactar Ventas
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Lo que dicen nuestros clientes
            </h2>
            <p className="text-xl text-gray-600">
              Más de 500 empresas confían en ConstructIA
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "ConstructIA nos ha ahorrado más de 20 horas semanales en gestión documental. 
                La integración con Obralia es perfecta."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600 font-semibold">MG</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">María García</div>
                  <div className="text-sm text-gray-500">Directora de Obra, Constructora ABC</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "La clasificación automática es increíble. Ya no perdemos tiempo organizando documentos PRL."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-green-600 font-semibold">JL</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">José Luis Martín</div>
                  <div className="text-sm text-gray-500">Responsable PRL, Obras del Sur</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "El cumplimiento normativo automático nos da mucha tranquilidad. Recomendado 100%."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-purple-600 font-semibold">AR</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Ana Rodríguez</div>
                  <div className="text-sm text-gray-500">Gerente, Infraestructuras Madrid</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ¿Listo para empezar?
            </h2>
            <p className="text-xl text-gray-600">
              Comienza tu prueba gratuita de 14 días hoy mismo
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
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
                      placeholder="tu@empresa.com"
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
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium"
                >
                  Comenzar Prueba Gratis
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">C</span>
                </div>
                <span className="ml-2 text-xl font-bold">ConstructIA</span>
              </div>
              <p className="text-gray-300">
                Gestión documental inteligente para el sector de la construcción.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Producto</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white">Características</a></li>
                <li><a href="#" className="hover:text-white">Integraciones</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
                <li><a href="#" className="hover:text-white">Seguridad</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white">Sobre nosotros</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Carreras</a></li>
                <li><a href="#" className="hover:text-white">Contacto</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white">Privacidad</a></li>
                <li><a href="#" className="hover:text-white">Términos</a></li>
                <li><a href="#" className="hover:text-white">Cookies</a></li>
                <li><a href="#gdpr" className="hover:text-white">GDPR</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-600 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; 2024 ConstructIA. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;