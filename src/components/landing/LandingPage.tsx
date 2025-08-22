import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  CheckCircle, 
  Building2, 
  FileText, 
  Brain, 
  Shield, 
  Zap,
  Users,
  BarChart3,
  Globe,
  Star,
  Award,
  Target,
  Lightbulb,
  Clock,
  TrendingUp,
  Database,
  Settings,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Play,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import Logo from '../common/Logo';

export default function LandingPage() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleGetStarted = () => {
    navigate('/client/dashboard');
  };

  const handleAdminAccess = () => {
    navigate('/admin-login');
  };

  const handleContactUs = () => {
    window.open('mailto:info@constructia.com', '_blank');
  };

  const handleScheduleDemo = () => {
    window.open('https://calendly.com/constructia-demo', '_blank');
  };

  const handleViewPricing = () => {
    // Scroll to pricing section
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLearnMore = () => {
    // Scroll to features section
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTryDemo = () => {
    navigate('/client/dashboard');
  };

  const handleWatchVideo = () => {
    window.open('https://youtube.com/watch?v=demo-constructia', '_blank');
  };

  const features = [
    {
      icon: Brain,
      title: 'IA Avanzada',
      description: 'Clasificación automática de documentos con Gemini AI',
      color: 'text-purple-600'
    },
    {
      icon: Shield,
      title: 'Seguridad Total',
      description: 'Encriptación end-to-end y cumplimiento GDPR',
      color: 'text-green-600'
    },
    {
      icon: Zap,
      title: 'Integración Automática',
      description: 'Conexión directa con Obralia, Nalanda y CTAIMA',
      color: 'text-blue-600'
    },
    {
      icon: BarChart3,
      title: 'Analytics Inteligente',
      description: 'Métricas y reportes en tiempo real',
      color: 'text-orange-600'
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
        'Soporte por email',
        'Integración básica'
      ],
      popular: false,
      action: handleGetStarted
    },
    {
      name: 'Profesional',
      price: '149',
      period: 'mes',
      description: 'Para empresas en crecimiento',
      features: [
        '500 documentos/mes',
        '1GB almacenamiento',
        'Soporte prioritario',
        'Integraciones avanzadas',
        'Analytics completo'
      ],
      popular: true,
      action: handleGetStarted
    },
    {
      name: 'Enterprise',
      price: '299',
      period: 'mes',
      description: 'Para grandes organizaciones',
      features: [
        'Documentos ilimitados',
        '5GB almacenamiento',
        'Soporte 24/7',
        'API personalizada',
        'Onboarding dedicado'
      ],
      popular: false,
      action: handleContactUs
    }
  ];

  const testimonials = [
    {
      name: 'Juan García',
      company: 'Construcciones García S.L.',
      text: 'ConstructIA ha revolucionado nuestra gestión documental. Ahorramos 15 horas semanales.',
      rating: 5
    },
    {
      name: 'María López',
      company: 'Reformas Integrales López',
      text: 'La integración con Obralia es perfecta. Todo automatizado y sin errores.',
      rating: 5
    },
    {
      name: 'Carlos Martín',
      company: 'Infraestructuras del Sur',
      text: 'El mejor ROI que hemos tenido. Se paga solo con el tiempo ahorrado.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Logo size="md" />
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={handleLearnMore}
                className="text-gray-600 hover:text-green-600 transition-colors"
              >
                Características
              </button>
              <button 
                onClick={handleViewPricing}
                className="text-gray-600 hover:text-green-600 transition-colors"
              >
                Precios
              </button>
              <button 
                onClick={handleContactUs}
                className="text-gray-600 hover:text-green-600 transition-colors"
              >
                Contacto
              </button>
              <button
                onClick={() => navigate('/client/dashboard')}
                className="text-gray-600 hover:text-green-600 transition-colors"
              >
                Iniciar Sesión
              </button>
              <button
                onClick={handleGetStarted}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Registrarse
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-gray-800"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <div className="space-y-4">
                <button 
                  onClick={handleLearnMore}
                  className="block w-full text-left text-gray-600 hover:text-green-600 transition-colors"
                >
                  Características
                </button>
                <button 
                  onClick={handleViewPricing}
                  className="block w-full text-left text-gray-600 hover:text-green-600 transition-colors"
                >
                  Precios
                </button>
                <button 
                  onClick={handleContactUs}
                  className="block w-full text-left text-gray-600 hover:text-green-600 transition-colors"
                >
                  Contacto
                </button>
                <button
                  onClick={handleGetStarted}
                  className="w-full bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Comenzar
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Gestión Documental
              <span className="text-green-600"> Inteligente</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Automatiza la clasificación y subida de documentos a Obralia con IA. 
              Ahorra tiempo, reduce errores y cumple con todas las normativas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleTryDemo}
                className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                Probar Demo Gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <button
                onClick={handleWatchVideo}
                className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                <Play className="mr-2 h-5 w-5" />
                Ver Demo
              </button>
            </div>
            <div className="mt-8 flex items-center justify-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                Sin tarjeta de crédito
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                Setup en 5 minutos
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                Soporte en español
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Características Principales
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Todo lo que necesitas para automatizar tu gestión documental
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className={`w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center`}>
                    <Icon className={`h-8 w-8 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Planes y Precios
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Elige el plan que mejor se adapte a tu empresa
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div key={index} className={`bg-white rounded-xl shadow-sm border-2 p-8 relative ${
                plan.popular ? 'border-green-500' : 'border-gray-200'
              }`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-green-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Más Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">€{plan.price}</span>
                    <span className="text-gray-600">/{plan.period}</span>
                  </div>
                  <p className="text-gray-600">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={plan.action}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                    plan.popular
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {plan.name === 'Enterprise' ? 'Contactar Ventas' : 'Comenzar Ahora'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Lo que dicen nuestros clientes
            </h2>
            <p className="text-xl text-gray-600">
              Empresas que ya confían en ConstructIA
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.company}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            ¿Listo para automatizar tu gestión documental?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Únete a cientos de empresas que ya ahorran tiempo y reducen errores con ConstructIA
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleTryDemo}
              className="bg-white text-green-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Comenzar Prueba Gratuita
            </button>
            <button
              onClick={handleScheduleDemo}
              className="border border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Agendar Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <Logo size="md" variant="light" />
              <p className="text-gray-400 mt-4 max-w-md">
                La plataforma de gestión documental inteligente para el sector construcción. 
                Automatiza, integra y cumple con todas las normativas.
              </p>
              <div className="flex space-x-4 mt-6">
                <button 
                  onClick={handleContactUs}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Mail className="h-5 w-5" />
                </button>
                <button className="text-gray-400 hover:text-white transition-colors">
                  <Phone className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Producto</h3>
              <ul className="space-y-2">
                <li>
                  <button 
                    onClick={handleLearnMore}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Características
                  </button>
                </li>
                <li>
                  <button 
                    onClick={handleViewPricing}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Precios
                  </button>
                </li>
                <li>
                  <button 
                    onClick={handleTryDemo}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Demo
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2">
                <li>
                  <button 
                    onClick={handleContactUs}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Contacto
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate('/privacy-policy')}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Privacidad
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate('/terms-of-service')}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Términos
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                © 2025 ConstructIA S.L. Todos los derechos reservados.
              </p>
              <div className="flex items-center space-x-4 mt-4 md:mt-0">
                <button
                  onClick={handleAdminAccess}
                  className="text-gray-500 hover:text-gray-300 transition-colors"
                  title="Acceso administrativo"
                >
                  <Shield className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}