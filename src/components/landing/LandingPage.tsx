import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  CheckCircle, 
  Star, 
  Users, 
  Building2, 
  FileText, 
  Brain, 
  Shield, 
  Zap, 
  Clock,
  Eye,
  Database,
  AlertTriangle,
  Activity,
  Mail,
  Phone,
  MapPin,
  Globe,
  Lock,
  Award,
  TrendingUp,
  BarChart3,
  Settings,
  Download,
  ExternalLink
} from 'lucide-react';
import Logo from '../common/Logo';
import ContactSection from './ContactSection';

export default function LandingPage() {
  const navigate = useNavigate();
  const [animationStep, setAnimationStep] = useState(0);
  const [processedDocs, setProcessedDocs] = useState(1247);
  const [aiAccuracy, setAiAccuracy] = useState(94.2);
  const [avgTime, setAvgTime] = useState(2.3);

  // Animation cycle for document processing
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationStep(prev => (prev + 1) % 4);
      
      // Update metrics occasionally
      if (Math.random() > 0.7) {
        setProcessedDocs(prev => prev + Math.floor(Math.random() * 3) + 1);
        setAiAccuracy(prev => Math.min(99.9, prev + (Math.random() - 0.5) * 0.1));
        setAvgTime(prev => Math.max(1.0, prev + (Math.random() - 0.5) * 0.2));
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const documentTypes = [
    { name: 'Certificado PRL', icon: Shield, color: 'text-green-600' },
    { name: 'Aptitud Médica', icon: FileText, color: 'text-blue-600' },
    { name: 'Seguro RC', icon: Award, color: 'text-purple-600' },
    { name: 'Plan Seguridad', icon: Settings, color: 'text-orange-600' }
  ];

  const currentDoc = documentTypes[animationStep];
  const CurrentIcon = currentDoc.icon;

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Logo size="md" />
            <div className="hidden md:flex items-center space-x-8">
              <a href="#caracteristicas" className="text-gray-600 hover:text-green-600 transition-colors">Características</a>
              <a href="#precios" className="text-gray-600 hover:text-green-600 transition-colors">Precios</a>
              <a href="#gdpr" className="text-gray-600 hover:text-green-600 transition-colors">GDPR</a>
              <a href="#contacto" className="text-gray-600 hover:text-green-600 transition-colors">Contacto</a>
              <button
                onClick={() => navigate('/client-login')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Acceso Cliente
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Animation */}
      <section className="pt-20 pb-16 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div>
              <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Brain className="w-4 h-4 mr-2" />
                IA Especializada en Construcción
              </div>
              
              <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Gestión Documental
                <span className="text-green-600"> Inteligente</span>
                <br />
                para Construcción
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Automatiza la clasificación y gestión de documentos CAE con IA avanzada. 
                Integración directa con Obralia/Nalanda para cumplimiento normativo automático.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  onClick={() => navigate('/client-login')}
                  className="bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center justify-center"
                >
                  Comenzar Ahora
                  <ArrowRight className="ml-2 w-5 h-5" />
                </button>
                <button className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg hover:bg-gray-50 transition-colors font-semibold">
                  Ver Demo
                </button>
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span>Configuración en 5 minutos</span>
                </div>
                <div className="flex items-center">
                  <Shield className="w-4 h-4 text-green-500 mr-2" />
                  <span>Cumplimiento GDPR</span>
                </div>
                <div className="flex items-center">
                  <Zap className="w-4 h-4 text-green-500 mr-2" />
                  <span>IA Especializada</span>
                </div>
              </div>
            </div>

            {/* AI Animation */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">IA Procesando Documentos</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-600 font-medium">En vivo</span>
                  </div>
                </div>

                {/* Current Document Processing */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`p-2 rounded-lg bg-white shadow-sm`}>
                      <CurrentIcon className={`w-6 h-6 ${currentDoc.color}`} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{currentDoc.name}</h4>
                      <p className="text-sm text-gray-600">Clasificando automáticamente...</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progreso de análisis</span>
                      <span className="text-gray-900 font-medium">{(animationStep + 1) * 25}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(animationStep + 1) * 25}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Real-time Metrics */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{processedDocs.toLocaleString()}</div>
                    <div className="text-xs text-green-700">Documentos</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{aiAccuracy.toFixed(1)}%</div>
                    <div className="text-xs text-blue-700">Precisión IA</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{avgTime.toFixed(1)}s</div>
                    <div className="text-xs text-purple-700">Tiempo Medio</div>
                  </div>
                </div>

                {/* Processing Steps */}
                <div className="mt-6 space-y-3">
                  {[
                    { step: 'Análisis OCR', status: animationStep >= 0 ? 'completed' : 'pending' },
                    { step: 'Clasificación IA', status: animationStep >= 1 ? 'completed' : 'pending' },
                    { step: 'Validación', status: animationStep >= 2 ? 'completed' : 'pending' },
                    { step: 'Envío a Obralia', status: animationStep >= 3 ? 'completed' : 'pending' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        item.status === 'completed' 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        {item.status === 'completed' ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <Clock className="w-4 h-4" />
                        )}
                      </div>
                      <span className={`text-sm ${
                        item.status === 'completed' ? 'text-gray-900 font-medium' : 'text-gray-500'
                      }`}>
                        {item.step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium animate-bounce">
                ✨ IA Activa
              </div>
              <div className="absolute -bottom-4 -left-4 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                🔒 Seguro GDPR
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Características */}
      <section id="caracteristicas" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              ¿Por qué elegir ConstructIA?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Nuestra plataforma combina inteligencia artificial avanzada con profundo conocimiento 
              del sector construcción para automatizar completamente tu gestión documental.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Brain className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">IA Especializada</h3>
              <p className="text-gray-600 mb-4">
                Algoritmos entrenados específicamente para documentos del sector construcción. 
                Reconoce automáticamente certificados PRL, aptitudes médicas, seguros RC y más.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Precisión del 94%+ en clasificación
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Extracción automática de fechas
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Detección de caducidades
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Integración Automática</h3>
              <p className="text-gray-600 mb-4">
                Conexión directa con Obralia/Nalanda. Los documentos se suben automáticamente 
                una vez clasificados y validados, sin intervención manual.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  API nativa con Obralia
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Sincronización en tiempo real
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Validación automática
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Cumplimiento Total</h3>
              <p className="text-gray-600 mb-4">
                Cumplimiento completo con GDPR, LOPD y normativas del sector. 
                Auditorías automáticas y reportes de cumplimiento.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Certificación GDPR
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Auditorías automáticas
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Reportes de cumplimiento
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Ahorro de Tiempo</h3>
              <p className="text-gray-600 mb-4">
                Reduce el tiempo de gestión documental en un 90%. Lo que antes tomaba horas, 
                ahora se completa en minutos de forma automática.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Procesamiento en 2.3s promedio
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Cero intervención manual
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Alertas automáticas
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Analytics Avanzados</h3>
              <p className="text-gray-600 mb-4">
                Dashboard completo con métricas en tiempo real, análisis de tendencias 
                y reportes ejecutivos automáticos.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Métricas en tiempo real
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Reportes automáticos
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Predicciones de IA
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="bg-red-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Soporte Especializado</h3>
              <p className="text-gray-600 mb-4">
                Equipo de expertos en construcción y tecnología. Soporte técnico 24/7 
                y consultoría especializada incluida.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Soporte 24/7
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Expertos en construcción
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Consultoría incluida
                </li>
              </ul>
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
              Cumplimiento GDPR Garantizado
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              ConstructIA está diseñada desde el primer día para cumplir con todas las normativas 
              de protección de datos. Tu información y la de tus clientes está completamente protegida.
            </p>
          </div>

          {/* GDPR Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="bg-green-100 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
                <Lock className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Encriptación Extremo a Extremo</h3>
              <p className="text-gray-600 text-sm">
                Todos los documentos se encriptan con AES-256 antes del almacenamiento. 
                Las claves de encriptación están separadas de los datos.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="bg-blue-100 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Derecho de Acceso</h3>
              <p className="text-gray-600 text-sm">
                Los usuarios pueden solicitar y obtener una copia completa de todos 
                sus datos personales en formato estructurado.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="bg-purple-100 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
                <Database className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Portabilidad de Datos</h3>
              <p className="text-gray-600 text-sm">
                Exportación completa de datos en formatos estándar. 
                Migración sin pérdidas a otras plataformas.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="bg-red-100 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Derecho al Olvido</h3>
              <p className="text-gray-600 text-sm">
                Eliminación completa y verificable de datos personales bajo solicitud. 
                Proceso automatizado con confirmación.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="bg-yellow-100 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
                <Activity className="w-5 h-5 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Auditoría Completa</h3>
              <p className="text-gray-600 text-sm">
                Registro detallado de todos los accesos y modificaciones. 
                Trazabilidad completa para auditorías de cumplimiento.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="bg-indigo-100 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
                <Globe className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Transferencias Seguras</h3>
              <p className="text-gray-600 text-sm">
                Cláusulas contractuales tipo para transferencias internacionales. 
                Cumplimiento con Privacy Shield y equivalentes.
              </p>
            </div>
          </div>

          {/* GDPR Process */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Nuestro Proceso de Cumplimiento GDPR
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-600">1</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Evaluación Inicial</h4>
                <p className="text-gray-600 text-sm">
                  Análisis completo de los datos que procesarás y evaluación de impacto en la privacidad.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">2</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Configuración Segura</h4>
                <p className="text-gray-600 text-sm">
                  Implementación de medidas técnicas y organizativas apropiadas para proteger los datos.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-purple-600">3</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Monitoreo Continuo</h4>
                <p className="text-gray-600 text-sm">
                  Supervisión 24/7 del cumplimiento y alertas automáticas ante cualquier anomalía.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-orange-600">4</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Reportes Automáticos</h4>
                <p className="text-gray-600 text-sm">
                  Generación automática de reportes de cumplimiento y documentación para auditorías.
                </p>
              </div>
            </div>
          </div>

          {/* Certifications */}
          <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">Certificaciones y Cumplimiento</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Award className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">ISO 27001</h4>
                <p className="text-xs text-gray-600">Gestión de Seguridad</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">GDPR</h4>
                <p className="text-xs text-gray-600">Protección de Datos</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">LOPDGDD</h4>
                <p className="text-xs text-gray-600">Normativa Española</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-orange-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">SOC 2</h4>
                <p className="text-xs text-gray-600">Controles de Seguridad</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Precios */}
      <section id="precios" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Planes Transparentes
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Elige el plan que mejor se adapte a tu empresa. Todos incluyen IA, 
              integración con Obralia y cumplimiento GDPR.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Plan Básico */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Básico</h3>
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  €59<span className="text-lg text-gray-600">/mes</span>
                </div>
                <p className="text-gray-600">Perfecto para pequeñas empresas</p>
              </div>
              
              <ul className="space-y-4 mb-8">
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
                  <span className="text-gray-700">IA de clasificación</span>
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
              
              <button className="w-full bg-gray-100 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-semibold">
                Comenzar Prueba
              </button>
            </div>

            {/* Plan Profesional */}
            <div className="bg-white rounded-2xl shadow-xl border-2 border-green-500 p-8 relative">
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
                <p className="text-gray-600">Ideal para empresas en crecimiento</p>
              </div>
              
              <ul className="space-y-4 mb-8">
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
                  <span className="text-gray-700">IA avanzada + OCR</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">API completa</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Soporte prioritario</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Analytics avanzados</span>
                </li>
              </ul>
              
              <button className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-semibold">
                Comenzar Ahora
              </button>
            </div>

            {/* Plan Empresarial */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Empresarial</h3>
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  €299<span className="text-lg text-gray-600">/mes</span>
                </div>
                <p className="text-gray-600">Para grandes organizaciones</p>
              </div>
              
              <ul className="space-y-4 mb-8">
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
                  <span className="text-gray-700">Integraciones custom</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Soporte 24/7</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Gestor dedicado</span>
                </li>
              </ul>
              
              <button className="w-full bg-gray-100 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-semibold">
                Contactar Ventas
              </button>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              ¿Necesitas un plan personalizado? Contáctanos para una solución a medida.
            </p>
            <button className="text-green-600 hover:text-green-700 font-semibold">
              Hablar con un Experto →
            </button>
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Lo que dicen nuestros clientes
            </h2>
            <p className="text-xl text-gray-600">
              Empresas líderes del sector confían en ConstructIA
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6">
                "ConstructIA ha revolucionado nuestra gestión documental. Lo que antes nos tomaba 
                días, ahora se completa en minutos. La integración con Obralia es perfecta."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-300 rounded-full mr-4"></div>
                <div>
                  <div className="font-semibold text-gray-900">María García</div>
                  <div className="text-gray-600">Directora de Operaciones, Construcciones García</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6">
                "La precisión de la IA es impresionante. Clasifica correctamente el 95% de nuestros 
                documentos sin intervención. El ROI se vio en el primer mes."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-300 rounded-full mr-4"></div>
                <div>
                  <div className="font-semibold text-gray-900">Carlos López</div>
                  <div className="text-gray-600">CTO, Reformas Integrales López</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6">
                "El cumplimiento GDPR automático nos da tranquilidad total. Los reportes 
                de auditoría se generan solos y el soporte técnico es excepcional."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-300 rounded-full mr-4"></div>
                <div>
                  <div className="font-semibold text-gray-900">Ana Martínez</div>
                  <div className="text-gray-600">Responsable Legal, Grupo Constructor Madrid</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <ContactSection />

      {/* Footer */}
      <footer className="bg-gray-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <Logo size="md" variant="light" />
              <p className="text-gray-300 mt-4 max-w-md">
                La plataforma líder en gestión documental inteligente para el sector construcción. 
                Automatiza, cumple y crece con ConstructIA.
              </p>
              <div className="flex space-x-4 mt-6">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Producto</h4>
              <ul className="space-y-2">
                <li><a href="#caracteristicas" className="text-gray-300 hover:text-white transition-colors">Características</a></li>
                <li><a href="#precios" className="text-gray-300 hover:text-white transition-colors">Precios</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Integraciones</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="/privacy-policy" className="text-gray-300 hover:text-white transition-colors">Política de Privacidad</a></li>
                <li><a href="/terms-of-service" className="text-gray-300 hover:text-white transition-colors">Términos de Uso</a></li>
                <li><a href="/cookie-policy" className="text-gray-300 hover:text-white transition-colors">Política de Cookies</a></li>
                <li><a href="#gdpr" className="text-gray-300 hover:text-white transition-colors">Cumplimiento GDPR</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-600 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 ConstructIA S.L. Todos los derechos reservados.
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <span className="text-gray-400 text-sm">Hecho con ❤️ en España</span>
              <button
                onClick={() => navigate('/admin-login')}
                className="text-gray-500 hover:text-gray-300 transition-colors"
                title="Acceso Administrativo"
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