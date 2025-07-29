import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  Brain, 
  Shield, 
  Zap, 
  CheckCircle, 
  Star,
  ArrowRight,
  FileText,
  Globe,
  Clock,
  Users,
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  Settings
} from 'lucide-react';
import Logo from '../common/Logo';

export default function LandingPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: '',
    consultationType: 'demo'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Formulario enviado:', formData);
    alert('¡Gracias por tu interés! Te contactaremos pronto.');
    setFormData({
      name: '',
      email: '',
      company: '',
      phone: '',
      message: '',
      consultationType: 'demo'
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
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
              <a href="#inicio" className="text-gray-700 hover:text-green-600 transition-colors">Inicio</a>
              <a href="#caracteristicas" className="text-gray-700 hover:text-green-600 transition-colors">Características</a>
              <a href="#planes" className="text-gray-700 hover:text-green-600 transition-colors">Planes</a>
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

      {/* Hero Section */}
      <section id="inicio" className="bg-gradient-to-br from-green-50 to-emerald-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Gestión Documental
                <span className="text-green-600"> Inteligente</span>
                <br />para Construcción
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Automatiza la clasificación y subida de documentos a Obralia con IA avanzada. 
                Ahorra tiempo, reduce errores y enfócate en construir.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link 
                  to="/register"
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center"
                >
                  Comenzar Gratis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <a 
                  href="#contacto"
                  className="border border-gray-300 hover:border-green-500 text-gray-700 hover:text-green-600 px-8 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center"
                >
                  Contáctanos
                </a>
              </div>

              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Sin tarjeta de crédito
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Configuración en 5 minutos
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-800">Procesamiento IA</h3>
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    En vivo
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600 mr-3" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">certificado_obra_A.pdf</p>
                      <p className="text-xs text-gray-600">Clasificando con IA...</p>
                    </div>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">factura_materiales_B.pdf</p>
                      <p className="text-xs text-green-600">Subido a Obralia ✓</p>
                    </div>
                    <span className="text-xs text-green-600 font-medium">94% confianza</span>
                  </div>
                  
                  <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                    <Brain className="h-5 w-5 text-purple-600 mr-3" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">dni_trabajador_C.pdf</p>
                      <p className="text-xs text-purple-600">Validado en Obralia ✓</p>
                    </div>
                    <span className="text-xs text-purple-600 font-medium">97% confianza</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Características */}
      <section id="caracteristicas" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ¿Por qué elegir ConstructIA?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              La única plataforma que combina IA avanzada con integración nativa a Obralia
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 rounded-xl hover:shadow-lg transition-shadow">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">IA Avanzada</h3>
              <p className="text-gray-600">
                Gemini AI clasifica documentos con 95% de precisión, 
                aprendiendo continuamente de tus patrones.
              </p>
            </div>

            <div className="text-center p-6 rounded-xl hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Integración Obralia</h3>
              <p className="text-gray-600">
                Subida automática a Obralia/Nalanda tras clasificación, 
                manteniendo trazabilidad completa.
              </p>
            </div>

            <div className="text-center p-6 rounded-xl hover:shadow-lg transition-shadow">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">100% Seguro</h3>
              <p className="text-gray-600">
                Encriptación de extremo a extremo, cumplimiento GDPR 
                y certificación ISO 27001.
              </p>
            </div>

            <div className="text-center p-6 rounded-xl hover:shadow-lg transition-shadow">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Súper Rápido</h3>
              <p className="text-gray-600">
                Procesamiento en menos de 3 segundos por documento, 
                con notificaciones en tiempo real.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sección Sobre ConstructIA */}
      <section id="empresa" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Sobre ConstructIA
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Somos pioneros en la digitalización del sector construcción, 
              combinando inteligencia artificial con experiencia en el sector.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Nuestra Misión</h3>
              <p className="text-gray-600 mb-6">
                Revolucionar la gestión documental en construcción mediante IA avanzada, 
                eliminando la burocracia manual y optimizando los procesos administrativos 
                para que las empresas se enfoquen en lo que mejor saben hacer: construir.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-gray-700">Especialistas en sector construcción</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-gray-700">Tecnología de vanguardia</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-gray-700">Soporte personalizado</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center p-6 bg-green-50 rounded-xl">
                <div className="text-3xl font-bold text-green-600 mb-2">500+</div>
                <div className="text-sm text-green-800">Empresas Confiando</div>
              </div>
              <div className="text-center p-6 bg-blue-50 rounded-xl">
                <div className="text-3xl font-bold text-blue-600 mb-2">2M+</div>
                <div className="text-sm text-blue-800">Documentos Procesados</div>
              </div>
              <div className="text-center p-6 bg-purple-50 rounded-xl">
                <div className="text-3xl font-bold text-purple-600 mb-2">95%</div>
                <div className="text-sm text-purple-800">Precisión IA</div>
              </div>
              <div className="text-center p-6 bg-orange-50 rounded-xl">
                <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
                <div className="text-sm text-orange-800">Soporte Disponible</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Nuestro Equipo</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Expertos en Construcción</h4>
                <p className="text-gray-600 text-sm">
                  Más de 20 años de experiencia en el sector, conocemos los desafíos reales.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Ingenieros de IA</h4>
                <p className="text-gray-600 text-sm">
                  PhDs en Machine Learning especializados en procesamiento de documentos.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Especialistas en Seguridad</h4>
                <p className="text-gray-600 text-sm">
                  Certificaciones ISO 27001 y GDPR para máxima protección de datos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Proceso de Implementación */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Implementación en 3 Pasos Simples
            </h2>
            <p className="text-xl text-gray-600">
              Desde el registro hasta la operación completa en menos de una semana
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Registro y Configuración</h3>
              <p className="text-gray-600 mb-4">
                Crea tu cuenta, configura tus empresas y proyectos. 
                Nuestro asistente IA te guía paso a paso.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800 font-medium">⏱️ Solo 5 minutos</p>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Entrenamiento Personalizado</h3>
              <p className="text-gray-600 mb-4">
                Nuestro equipo configura la IA específicamente para tus tipos de documentos 
                y procesos empresariales.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800 font-medium">📚 2-3 días hábiles</p>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-purple-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Operación Completa</h3>
              <p className="text-gray-600 mb-4">
                Comienza a subir documentos y disfruta de la automatización completa 
                con integración directa a Obralia.
              </p>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <p className="text-sm text-purple-800 font-medium">🚀 Inmediato</p>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <div className="bg-green-50 border border-green-200 rounded-xl p-8 max-w-2xl mx-auto">
              <h4 className="text-xl font-bold text-green-900 mb-4">🎯 Garantía de Satisfacción</h4>
              <p className="text-green-800">
                Si no estás completamente satisfecho en los primeros 30 días, 
                te devolvemos el 100% de tu dinero. Sin preguntas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Planes y Precios */}
      <section id="planes" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Planes que se Adaptan a tu Empresa
            </h2>
            <p className="text-xl text-gray-600">
              Desde startups hasta grandes constructoras
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Plan Básico */}
            <div className="border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Básico</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">€59</span>
                <span className="text-gray-600">/mes</span>
              </div>
              <ul className="space-y-3 mb-8">
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
            <div className="border-2 border-green-500 rounded-2xl p-8 relative hover:shadow-lg transition-shadow">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center">
                  <Star className="h-4 w-4 mr-1" />
                  Más Popular
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Profesional</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">€149</span>
                <span className="text-gray-600">/mes</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span>Hasta 500 documentos/mes</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span>1GB de almacenamiento</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span>IA avanzada con 95% precisión</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span>Integración Obralia completa</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span>Dashboard personalizado</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span>Soporte prioritario</span>
                </li>
              </ul>
              <Link 
                to="/register"
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors block text-center"
              >
                Comenzar Gratis
              </Link>
            </div>

            {/* Plan Empresarial */}
            <div className="border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Empresarial</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">€299</span>
                <span className="text-gray-600">/mes</span>
              </div>
              <ul className="space-y-3 mb-8">
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
                  <span>IA premium con análisis predictivo</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span>API personalizada</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span>Múltiples usuarios</span>
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

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Preguntas Frecuentes
            </h2>
            <p className="text-xl text-gray-600">
              Resolvemos las dudas más comunes sobre ConstructIA
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                ¿Qué tipos de documentos puede procesar la IA?
              </h3>
              <p className="text-gray-600">
                Nuestra IA procesa facturas, certificados, DNIs, contratos, seguros, planos técnicos, 
                albaranes, nóminas y cualquier documento relacionado con construcción. La precisión 
                promedio es del 95% y mejora continuamente con el uso.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                ¿Cómo funciona la integración con Obralia/Nalanda?
              </h3>
              <p className="text-gray-600">
                Una vez configuradas tus credenciales de Obralia, los documentos se suben automáticamente 
                tras ser clasificados por la IA. El sistema mantiene trazabilidad completa y notifica 
                el estado de cada documento en tiempo real.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                ¿Qué tan segura es la plataforma?
              </h3>
              <p className="text-gray-600">
                Utilizamos encriptación SSL de 256 bits, cumplimos con GDPR, tenemos certificación 
                ISO 27001 y realizamos auditorías de seguridad regulares. Tus documentos están 
                más seguros que en sistemas tradicionales.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                ¿Puedo cancelar mi suscripción en cualquier momento?
              </h3>
              <p className="text-gray-600">
                Sí, puedes cancelar en cualquier momento desde tu panel de control. No hay 
                penalizaciones ni costos ocultos. Mantienes acceso hasta el final del período 
                facturado y puedes exportar todos tus datos.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                ¿Qué tipo de soporte técnico ofrecen?
              </h3>
              <p className="text-gray-600">
                Ofrecemos soporte por email (plan Básico), soporte prioritario (plan Profesional) 
                y soporte 24/7 con gestor dedicado (plan Empresarial). También incluimos 
                documentación completa y tutoriales en video.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                ¿Necesito conocimientos técnicos para usar ConstructIA?
              </h3>
              <p className="text-gray-600">
                No, ConstructIA está diseñado para ser intuitivo. Si sabes usar email y navegador web, 
                puedes usar nuestra plataforma. Además, ofrecemos entrenamiento personalizado y 
                nuestro asistente IA te guía en cada paso.
              </p>
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
              Contáctanos y descubre cómo ConstructIA puede transformar tu empresa
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Información de Contacto */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-8">Información de Contacto</h3>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-green-100 p-3 rounded-lg mr-4">
                    <Mail className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Email</h4>
                    <p className="text-gray-600">contacto@constructia.com</p>
                    <p className="text-sm text-gray-500">Respuesta en menos de 24 horas</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-blue-100 p-3 rounded-lg mr-4">
                    <Phone className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Teléfono</h4>
                    <p className="text-gray-600">+34 91 000 00 00</p>
                    <p className="text-sm text-gray-500">Lunes a Viernes, 9:00 - 18:00</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-purple-100 p-3 rounded-lg mr-4">
                    <MapPin className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Oficina</h4>
                    <p className="text-gray-600">Calle Innovación 123</p>
                    <p className="text-gray-600">28001 Madrid, España</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-orange-100 p-3 rounded-lg mr-4">
                    <MessageCircle className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Chat en Vivo</h4>
                    <p className="text-gray-600">Disponible en la plataforma</p>
                    <p className="text-sm text-gray-500">Soporte técnico inmediato</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-green-50 rounded-xl">
                <h4 className="font-semibold text-green-900 mb-3">Horarios de Soporte</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-800">Plan Básico:</span>
                    <span className="text-green-600">Email (24-48h)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-800">Plan Profesional:</span>
                    <span className="text-green-600">Prioritario (2-4h)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-800">Plan Empresarial:</span>
                    <span className="text-green-600">24/7 Dedicado</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulario de Contacto */}
            <div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Tu nombre completo"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="tu@empresa.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Empresa
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Nombre de tu empresa"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="+34 600 000 000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Consulta
                  </label>
                  <select
                    name="consultationType"
                    value={formData.consultationType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="demo">Solicitar Demo</option>
                    <option value="pricing">Información de Precios</option>
                    <option value="integration">Consulta Técnica</option>
                    <option value="support">Soporte</option>
                    <option value="partnership">Alianzas</option>
                    <option value="other">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mensaje *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Cuéntanos sobre tu proyecto y cómo podemos ayudarte..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center"
                >
                  Enviar Mensaje
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <Logo size="md" />
              <p className="text-gray-600 mt-4 max-w-md">
                La plataforma de gestión documental inteligente que revoluciona 
                el sector construcción con IA avanzada.
              </p>
              <div className="flex items-center mt-6 space-x-4">
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  ISO 27001 Certificado
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Shield className="h-4 w-4 text-green-600 mr-2" />
                  GDPR Compliant
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Producto</h4>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#caracteristicas" className="hover:text-green-600 transition-colors">Características</a></li>
                <li><a href="#planes" className="hover:text-green-600 transition-colors">Precios</a></li>
                <li><Link to="/register" className="hover:text-green-600 transition-colors">Comenzar Gratis</Link></li>
                <li><a href="#" className="hover:text-green-600 transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Empresa</h4>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#empresa" className="hover:text-green-600 transition-colors">Sobre Nosotros</a></li>
                <li><a href="#contacto" className="hover:text-green-600 transition-colors">Contacto</a></li>
                <li><a href="#" className="hover:text-green-600 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-green-600 transition-colors">Carreras</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 text-sm">
              © 2024 ConstructIA. Todos los derechos reservados.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-600 hover:text-green-600 text-sm transition-colors">
                Términos de Servicio
              </a>
              <a href="#" className="text-gray-600 hover:text-green-600 text-sm transition-colors">
                Política de Privacidad
              </a>
              <Link 
                to="/admin/login" 
                className="text-gray-500 hover:text-gray-700 transition-colors opacity-70 hover:opacity-100"
                title="Panel de Administración"
              >
                <Settings className="h-5 w-5" />
              </Link>
            </div>

export default LandingPage
  )
}
  )
}