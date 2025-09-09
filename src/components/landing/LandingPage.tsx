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
  Target, 
  Award,
  Eye,
  Database,
  AlertTriangle,
  Activity
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
      setAnimationStep((prev) => (prev + 1) % 4);
      
      // Update metrics occasionally
      if (Math.random() > 0.7) {
        setProcessedDocs(prev => prev + Math.floor(Math.random() * 3) + 1);
        setAiAccuracy(prev => Math.min(99.9, prev + (Math.random() - 0.5) * 0.1));
        setAvgTime(prev => Math.max(1.8, prev + (Math.random() - 0.5) * 0.2));
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const documentTypes = [
    { name: 'Certificado PRL', status: 'processing', confidence: 96 },
    { name: 'Aptitud Médica', status: 'completed', confidence: 98 },
    { name: 'Seguro RC', status: 'analyzing', confidence: 94 },
    { name: 'Plan Seguridad', status: 'uploading', confidence: 92 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'analyzing': return 'text-purple-600 bg-purple-100';
      case 'uploading': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

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
              <a href="#testimonios" className="text-gray-600 hover:text-green-600 transition-colors">Testimonios</a>
              <a href="#gdpr" className="text-gray-600 hover:text-green-600 transition-colors">GDPR</a>
              <a href="#contacto" className="text-gray-600 hover:text-green-600 transition-colors">Contacto</a>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/client-login')}
                className="text-gray-600 hover:text-green-600 transition-colors"
              >
                Iniciar Sesión
              </button>
              <button 
                onClick={() => navigate('/client-login')}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Comenzar Gratis
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Animation */}
      <section className="pt-24 pb-20 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div>
              <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Zap className="w-4 h-4 mr-2" />
                IA Avanzada para Construcción
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
                  Comenzar Prueba Gratuita
                  <ArrowRight className="ml-2 w-5 h-5" />
                </button>
                <button className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg hover:bg-gray-50 transition-colors font-semibold">
                  Ver Demo en Vivo
                </button>
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span>Sin configuración inicial</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span>Integración en 24h</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span>Soporte en español</span>
                </div>
              </div>
            </div>

            {/* AI Animation */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">IA Procesando Documentos</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-600">En tiempo real</span>
                  </div>
                </div>

                {/* Live Metrics */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{processedDocs.toLocaleString()}</div>
                    <div className="text-xs text-blue-800">Documentos</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{aiAccuracy.toFixed(1)}%</div>
                    <div className="text-xs text-green-800">Precisión IA</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{avgTime.toFixed(1)}s</div>
                    <div className="text-xs text-purple-800">Tiempo Medio</div>
                  </div>
                </div>

                {/* Document Processing Animation */}
                <div className="space-y-3">
                  {documentTypes.map((doc, index) => (
                    <div 
                      key={doc.name}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-500 ${
                        animationStep === index ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className={`w-5 h-5 ${
                          animationStep === index ? 'text-green-600' : 'text-gray-400'
                        }`} />
                        <div>
                          <div className="font-medium text-gray-900">{doc.name}</div>
                          <div className="text-xs text-gray-500">Confianza: {doc.confidence}%</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {animationStep === index && (
                          <div className="flex space-x-1">
                            <div className="w-1 h-1 bg-green-500 rounded-full animate-bounce"></div>
                            <div className="w-1 h-1 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-1 h-1 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        )}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                          {doc.status === 'completed' ? 'Completado' :
                           doc.status === 'processing' ? 'Procesando' :
                           doc.status === 'analyzing' ? 'Analizando' : 'Subiendo'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* AI Brain Animation */}
                <div className="mt-6 flex items-center justify-center">
                  <div className="relative">
                    <Brain className="w-8 h-8 text-green-600" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
                  </div>
                  <div className="ml-3 text-sm text-gray-600">
                    IA clasificando automáticamente...
                  </div>
                </div>
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
              Descubre cómo ConstructIA revoluciona la gestión documental en el sector construcción
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Brain className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">IA Avanzada</h3>
              <p className="text-gray-600">
                Clasificación automática de documentos CAE con precisión superior al 95%. 
                Reconoce certificados PRL, aptitudes médicas, seguros RC y más.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Integración Directa</h3>
              <p className="text-gray-600">
                Conexión automática con Obralia/Nalanda. Sube documentos clasificados 
                directamente a la plataforma CAE sin intervención manual.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Cumplimiento GDPR</h3>
              <p className="text-gray-600">
                Protección de datos certificada. Cumplimiento total con GDPR, LOPD y 
                normativas de seguridad del sector construcción.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Ahorro de Tiempo</h3>
              <p className="text-gray-600">
                Reduce el tiempo de gestión documental en un 80%. Automatiza tareas 
                repetitivas y enfócate en lo que realmente importa.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="bg-red-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Precisión Garantizada</h3>
              <p className="text-gray-600">
                Algoritmos entrenados específicamente para documentación CAE. 
                Detección inteligente de fechas de caducidad y campos críticos.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Soporte Especializado</h3>
              <p className="text-gray-600">
                Equipo de expertos en construcción y CAE. Soporte técnico en español 
                con conocimiento profundo del sector.
              </p>
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
      <section id="precios" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Planes Adaptados a tu Empresa
            </h2>
            <p className="text-xl text-gray-600">
              Desde autónomos hasta grandes constructoras. Encuentra el plan perfecto para ti.
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
                <p className="text-gray-600">Perfecto para autónomos y pequeñas empresas</p>
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
                  <span className="text-gray-700">Clasificación IA básica</span>
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
                <span className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                  Más Popular
                </span>
              </div>
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Profesional</h3>
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  €149<span className="text-lg text-gray-600">/mes</span>
                </div>
                <p className="text-gray-600">Ideal para empresas medianas</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">500 documentos/mes</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">2GB almacenamiento</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">IA avanzada + OCR</span>
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
                <p className="text-gray-600">Para grandes constructoras</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Documentos ilimitados</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">10GB almacenamiento</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">IA personalizada</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Integraciones ilimitadas</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Gestor de cuenta dedicado</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Soporte 24/7</span>
                </li>
              </ul>
              
              <button className="w-full bg-gray-100 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-semibold">
                Contactar Ventas
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonios" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Lo que Dicen Nuestros Clientes
            </h2>
            <p className="text-xl text-gray-600">
              Empresas líderes en construcción confían en ConstructIA
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6">
                "ConstructIA ha revolucionado nuestra gestión documental. La integración con Obralia 
                es perfecta y nos ahorra 15 horas semanales de trabajo administrativo."
              </p>
              <div className="flex items-center">
                <img 
                  src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1" 
                  alt="Carlos Martínez" 
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <div className="font-semibold text-gray-900">Carlos Martínez</div>
                  <div className="text-gray-600">Director, Construcciones Martínez</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6">
                "La precisión de la IA es impresionante. Clasifica correctamente el 98% de nuestros 
                documentos CAE. El ROI se vio en el primer mes de uso."
              </p>
              <div className="flex items-center">
                <img 
                  src="https://images.pexels.com/photos/3785077/pexels-photo-3785077.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1" 
                  alt="Ana López" 
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <div className="font-semibold text-gray-900">Ana López</div>
                  <div className="text-gray-600">Gerente de Calidad, Grupo López</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6">
                "El soporte técnico es excepcional. Entienden perfectamente las necesidades 
                del sector construcción y nos ayudaron con la integración en tiempo récord."
              </p>
              <div className="flex items-center">
                <img 
                  src="https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1" 
                  alt="Miguel García" 
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <div className="font-semibold text-gray-900">Miguel García</div>
                  <div className="text-gray-600">CTO, Edificaciones García</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <ContactSection />

      {/* Footer */}
      <footer className="bg-gray-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <Logo size="md" variant="light" />
              <p className="mt-4 text-gray-300 max-w-md">
                Plataforma SaaS líder en gestión documental inteligente para el sector construcción. 
                Automatiza tu CAE con IA avanzada.
              </p>
              <div className="mt-6 flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">LinkedIn</span>
                  <Building2 className="w-6 h-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Twitter</span>
                  <Users className="w-6 h-6" />
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Producto</h3>
              <ul className="space-y-2">
                <li><a href="#caracteristicas" className="text-gray-300 hover:text-white transition-colors">Características</a></li>
                <li><a href="#precios" className="text-gray-300 hover:text-white transition-colors">Precios</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Integraciones</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="/privacy-policy" className="text-gray-300 hover:text-white transition-colors">Privacidad</a></li>
                <li><a href="/terms-of-service" className="text-gray-300 hover:text-white transition-colors">Términos</a></li>
                <li><a href="/cookie-policy" className="text-gray-300 hover:text-white transition-colors">Cookies</a></li>
                <li><a href="#gdpr" className="text-gray-300 hover:text-white transition-colors">GDPR</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-600 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 ConstructIA One S.L. Todos los derechos reservados.
            </p>
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <span className="text-gray-400 text-sm">Portal Desarrollado en España</span>
              <button 
                onClick={() => navigate('/admin-login')}
                className="text-gray-500 hover:text-gray-300 transition-colors"
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