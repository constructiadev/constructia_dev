import React from 'react';
import { 
  ArrowRight, 
  CheckCircle, 
  Shield, 
  Zap, 
  Users, 
  BarChart3, 
  FileText, 
  Globe, 
  Brain, 
  Lock, 
  Eye, 
  Database, 
  AlertTriangle, 
  Activity, 
  Award, 
  Target, 
  Building2, 
  Clock, 
  Star, 
  Lightbulb, 
  TrendingUp, 
  Smartphone, 
  Cloud, 
  Settings, 
  Mail, 
  Phone, 
  MapPin 
} from 'lucide-react';
import Logo from '../common/Logo';
import ContactSection from './ContactSection';

export default function LandingPage() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Logo size="md" />
            
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => scrollToSection('caracteristicas')}
                className="text-gray-600 hover:text-green-600 transition-colors"
              >
                Características
              </button>
              <button 
                onClick={() => scrollToSection('beneficios')}
                className="text-gray-600 hover:text-green-600 transition-colors"
              >
                Beneficios
              </button>
              <button 
                onClick={() => scrollToSection('gdpr')}
                className="text-gray-600 hover:text-green-600 transition-colors"
              >
                GDPR
              </button>
              <button 
                onClick={() => scrollToSection('contacto')}
                className="text-gray-600 hover:text-green-600 transition-colors"
              >
                Contacto
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <a 
                href="/client-login"
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                Iniciar Sesión
              </a>
              <a 
                href="/client-register"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Registrarse
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-20 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Gestión Documental
              <span className="block text-green-600">Inteligente para CAE</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Automatiza la clasificación y subida de documentos a Obralia/Nalanda con 
              inteligencia artificial. Cumplimiento GDPR garantizado.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <a 
                href="/client-register"
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center"
              >
                Comenzar Gratis
                <ArrowRight className="ml-2 w-5 h-5" />
              </a>
              <button 
                onClick={() => scrollToSection('contacto')}
                className="border border-green-600 text-green-600 hover:bg-green-50 px-8 py-4 rounded-lg font-semibold transition-colors"
              >
                Solicitar Demo
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex justify-center items-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-2 text-green-600" />
                <span>GDPR Certificado</span>
              </div>
              <div className="flex items-center">
                <Zap className="w-4 h-4 mr-2 text-blue-600" />
                <span>IA Avanzada</span>
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2 text-purple-600" />
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
              Tecnología de vanguardia diseñada específicamente para el sector construcción
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Clasificación Automática con IA
              </h3>
              <p className="text-gray-600">
                Nuestro motor de IA clasifica automáticamente documentos CAE con 95% de precisión. 
                Reconoce DNI, certificados médicos, PRL y más.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Integración con Obralia/Nalanda
              </h3>
              <p className="text-gray-600">
                Conexión directa con las principales plataformas CAE. Subida automática 
                de documentos validados.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Cumplimiento GDPR Total
              </h3>
              <p className="text-gray-600">
                Protección de datos certificada. Eliminación automática tras validación. 
                Auditorías continuas de seguridad.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Dashboard Inteligente
              </h3>
              <p className="text-gray-600">
                Métricas en tiempo real, alertas de caducidad y análisis predictivo 
                para optimizar tu gestión documental.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="bg-red-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Procesamiento Ultrarrápido
              </h3>
              <p className="text-gray-600">
                Clasificación y validación en menos de 30 segundos. API REST para 
                integraciones personalizadas.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="bg-teal-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Cloud className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Almacenamiento Seguro
              </h3>
              <p className="text-gray-600">
                Infraestructura en la nube con encriptación militar. Backups automáticos 
                y recuperación ante desastres.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="beneficios" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Beneficios para tu Empresa
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transforma tu gestión documental y mejora la eficiencia operativa
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="bg-green-100 p-3 rounded-lg flex-shrink-0">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Ahorra 80% del Tiempo
                  </h3>
                  <p className="text-gray-600">
                    Elimina la clasificación manual. Nuestro sistema procesa documentos 
                    automáticamente y los sube a Obralia sin intervención humana.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 p-3 rounded-lg flex-shrink-0">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    95% de Precisión Garantizada
                  </h3>
                  <p className="text-gray-600">
                    Nuestro motor de IA está entrenado específicamente para documentos 
                    del sector construcción español.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-purple-100 p-3 rounded-lg flex-shrink-0">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Cumplimiento Automático
                  </h3>
                  <p className="text-gray-600">
                    Garantiza el cumplimiento de normativas CAE y GDPR. Alertas automáticas 
                    de caducidad y renovación.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-orange-100 p-3 rounded-lg flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    ROI Inmediato
                  </h3>
                  <p className="text-gray-600">
                    Recupera la inversión en menos de 3 meses. Reduce costes operativos 
                    y mejora la productividad del equipo.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-600 to-blue-600 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-6">¿Por qué ConstructIA?</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-3 text-green-200" />
                  <span>Especializado en sector construcción</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-3 text-green-200" />
                  <span>Integración nativa con Obralia/Nalanda</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-3 text-green-200" />
                  <span>Soporte técnico en español</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-3 text-green-200" />
                  <span>Implementación en 24 horas</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-3 text-green-200" />
                  <span>Garantía de satisfacción 30 días</span>
                </div>
              </div>
              
              <div className="mt-8">
                <a 
                  href="/client-register"
                  className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors inline-flex items-center"
                >
                  Empezar Ahora
                  <ArrowRight className="ml-2 w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GDPR Compliance Section */}
      <section id="gdpr" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Cumplimiento GDPR Certificado
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              ConstructIA garantiza el máximo nivel de protección de datos y cumplimiento normativo 
              para el sector construcción, con certificaciones internacionales.
            </p>
          </div>

          {/* GDPR Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <Eye className="w-6 h-6 text-blue-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Transparencia Total</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Control completo sobre tus datos. Acceso, rectificación y portabilidad 
                garantizados según GDPR Art. 15-20.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <Database className="w-6 h-6 text-green-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Minimización de Datos</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Solo procesamos datos estrictamente necesarios. Eliminación automática 
                tras validación en Obralia (7 días).
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <Shield className="w-6 h-6 text-purple-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Seguridad por Diseño</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Encriptación end-to-end, autenticación multifactor y auditorías 
                continuas de seguridad.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <AlertTriangle className="w-6 h-6 text-orange-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Gestión de Brechas</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Protocolo automático de notificación de brechas en 72h. 
                Registro completo y notificación a autoridades.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <Activity className="w-6 h-6 text-red-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Auditoría Continua</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Logs detallados de todas las acciones. Trazabilidad completa 
                para auditorías internas y externas.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <Users className="w-6 h-6 text-indigo-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Derechos del Usuario</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Portal self-service para ejercer derechos GDPR. Respuesta 
                automática en menos de 30 días.
              </p>
            </div>
          </div>

          {/* GDPR Process */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Nuestro Proceso de Cumplimiento GDPR
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Evaluación de Impacto</h4>
                <p className="text-sm text-gray-600">
                  Análisis completo de riesgos antes del procesamiento de datos personales.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-600">2</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Consentimiento Informado</h4>
                <p className="text-sm text-gray-600">
                  Obtención de consentimiento claro y específico para cada finalidad de tratamiento.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-purple-600">3</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Procesamiento Seguro</h4>
                <p className="text-sm text-gray-600">
                  Tratamiento de datos con medidas técnicas y organizativas apropiadas.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-orange-600">4</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Eliminación Automática</h4>
                <p className="text-sm text-gray-600">
                  Borrado seguro de datos tras cumplir la finalidad del tratamiento.
                </p>
              </div>
            </div>
          </div>

          {/* Certifications */}
          <div className="mt-12 text-center">
            <h4 className="text-lg font-semibold text-gray-900 mb-6">Certificaciones y Cumplimiento</h4>
            <div className="flex justify-center items-center space-x-8 flex-wrap gap-4">
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="font-medium text-gray-900">ISO 27001</span>
              </div>
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-900">GDPR</span>
              </div>
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm">
                <Award className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-gray-900">LOPDGDD</span>
              </div>
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm">
                <Target className="w-5 h-5 text-orange-600" />
                <span className="font-medium text-gray-900">SOC 2</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Planes Adaptados a tu Empresa
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Desde startups hasta grandes corporaciones, tenemos el plan perfecto para ti
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Plan Básico */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Básico</h3>
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  €59<span className="text-lg text-gray-600">/mes</span>
                </div>
                <p className="text-gray-600">Perfecto para pequeñas empresas</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">100 documentos/mes</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">500MB almacenamiento</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Integración Obralia</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Soporte por email</span>
                </li>
              </ul>
              
              <a 
                href="/client-register"
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-semibold transition-colors text-center block"
              >
                Comenzar
              </a>
            </div>

            {/* Plan Profesional */}
            <div className="bg-white border-2 border-green-500 rounded-2xl p-8 hover:shadow-lg transition-shadow relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Más Popular
                </span>
              </div>
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Profesional</h3>
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  €149<span className="text-lg text-gray-600">/mes</span>
                </div>
                <p className="text-gray-600">Para empresas en crecimiento</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">500 documentos/mes</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">5GB almacenamiento</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Múltiples integraciones</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">API personalizada</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Soporte prioritario</span>
                </li>
              </ul>
              
              <a 
                href="/client-register"
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors text-center block"
              >
                Empezar Prueba
              </a>
            </div>

            {/* Plan Enterprise */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  €299<span className="text-lg text-gray-600">/mes</span>
                </div>
                <p className="text-gray-600">Para grandes organizaciones</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Documentos ilimitados</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">50GB almacenamiento</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">IA personalizada</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Gestor dedicado</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Soporte 24/7</span>
                </li>
              </ul>
              
              <button 
                onClick={() => scrollToSection('contacto')}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-semibold transition-colors"
              >
                Contactar Ventas
              </button>
            </div>
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
                Plataforma SaaS de gestión documental inteligente para el sector construcción. 
                Automatiza tu cumplimiento CAE con IA avanzada.
              </p>
              <div className="flex space-x-4 mt-6">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Globe className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Mail className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Phone className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Producto</h4>
              <ul className="space-y-2">
                <li><a href="#caracteristicas" className="text-gray-400 hover:text-white transition-colors">Características</a></li>
                <li><a href="#beneficios" className="text-gray-400 hover:text-white transition-colors">Beneficios</a></li>
                <li><a href="#gdpr" className="text-gray-400 hover:text-white transition-colors">GDPR</a></li>
                <li><a href="/client-register" className="text-gray-400 hover:text-white transition-colors">Registro</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors">Política de Privacidad</a></li>
                <li><a href="/terms-of-service" className="text-gray-400 hover:text-white transition-colors">Términos de Uso</a></li>
                <li><a href="/cookie-policy" className="text-gray-400 hover:text-white transition-colors">Política de Cookies</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 ConstructIA S.L. Todos los derechos reservados.
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <span className="text-gray-400 text-sm">CIF: B87654321</span>
              <button 
                onClick={() => window.location.href = '/admin-login'}
                className="text-gray-500 hover:text-gray-300 transition-colors"
                title="Acceso administrativo"
              >
                <Shield className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}