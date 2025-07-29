import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Brain, 
  Shield, 
  Zap, 
  CheckCircle, 
  ArrowRight,
  Play,
  Star,
  Users,
  FileText,
  Globe,
  TrendingUp,
  Clock,
  Award,
  Sparkles,
  ChevronDown,
  Menu,
  X,
  Mail,
  Phone,
  MapPin,
  Send,
  MessageCircle,
  Bot,
  Lightbulb,
  Target,
  Rocket,
  Heart,
  Coffee,
  Code,
  Database,
  Cloud,
  Lock,
  Upload
} from 'lucide-react';
import Logo from '../common/Logo';
import { callGeminiAI } from '../../lib/supabase';

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  delay?: number;
}

function FeatureCard({ icon: Icon, title, description, color, delay = 0 }: FeatureCardProps) {
  return (
    <div 
      className={`bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center mb-6 mx-auto`}>
        <Icon className="h-8 w-8 text-white" />
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">{title}</h3>
      <p className="text-gray-600 text-center leading-relaxed">{description}</p>
    </div>
  );
}

interface TestimonialCardProps {
  name: string;
  company: string;
  role: string;
  content: string;
  avatar: string;
  rating: number;
}

function TestimonialCard({ name, company, role, content, avatar, rating }: TestimonialCardProps) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
      <div className="flex items-center mb-4">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`h-5 w-5 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
          />
        ))}
      </div>
      <p className="text-gray-700 mb-6 italic">"{content}"</p>
      <div className="flex items-center">
        <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
          {name.charAt(0)}
        </div>
        <div>
          <h4 className="font-semibold text-gray-800">{name}</h4>
          <p className="text-sm text-gray-600">{role}</p>
          <p className="text-sm text-green-600 font-medium">{company}</p>
        </div>
      </div>
    </div>
  );
}

interface PricingCardProps {
  name: string;
  price: string;
  period: string;
  features: string[];
  popular?: boolean;
  color: string;
  buttonText: string;
}

function PricingCard({ name, price, period, features, popular = false, color, buttonText }: PricingCardProps) {
  return (
    <div className={`relative bg-white rounded-2xl p-8 shadow-lg border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 ${
      popular ? 'border-green-500 scale-105' : 'border-gray-200'
    }`}>
      {popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-2 rounded-full text-sm font-bold flex items-center">
            <Sparkles className="h-4 w-4 mr-2" />
            Más Popular
          </span>
        </div>
      )}
      
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">{name}</h3>
        <div className="mb-4">
          <span className="text-5xl font-bold text-gray-900">{price}</span>
          <span className="text-gray-600 ml-2">{period}</span>
        </div>
      </div>
      
      <ul className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>
      
      <button className={`w-full ${color} text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1`}>
        {buttonText}
      </button>
    </div>
  );
}

function LandingPage() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{type: 'user' | 'ai', message: string}>>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [email, setEmail] = useState('');
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });

  // Estadísticas dinámicas
  const [stats, setStats] = useState({
    clients: 247,
    documents: 12456,
    accuracy: 94.7,
    uptime: 99.97
  });

  useEffect(() => {
    // Animación de números
    const interval = setInterval(() => {
      setStats(prev => ({
        clients: prev.clients + Math.floor(Math.random() * 2),
        documents: prev.documents + Math.floor(Math.random() * 5),
        accuracy: Math.min(99.9, prev.accuracy + Math.random() * 0.1),
        uptime: Math.min(99.99, prev.uptime + Math.random() * 0.01)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleAIChat = async () => {
    if (!chatMessage.trim()) return;
    
    const userMessage = chatMessage;
    setChatMessage('');
    setChatHistory(prev => [...prev, { type: 'user', message: userMessage }]);
    setIsTyping(true);

    try {
      const prompt = `Como asistente de ConstructIA, responde de manera amigable y profesional a esta consulta sobre nuestra plataforma de gestión documental con IA para construcción: "${userMessage}". 
      
      Información clave:
      - ConstructIA es una plataforma SaaS de gestión documental con IA
      - Clasificamos documentos automáticamente con Gemini AI
      - Integramos con Obralia/Nalanda
      - Ofrecemos planes desde €59/mes
      - Tenemos 247+ clientes activos
      - 94.7% de precisión en clasificación
      
      Responde en máximo 100 palabras, siendo útil y persuasivo.`;
      
      const response = await callGeminiAI(prompt);
      
      setTimeout(() => {
        setChatHistory(prev => [...prev, { type: 'ai', message: response }]);
        setIsTyping(false);
      }, 1000);
    } catch (error) {
      setTimeout(() => {
        setChatHistory(prev => [...prev, { 
          type: 'ai', 
          message: '¡Hola! Soy el asistente IA de ConstructIA. Estoy aquí para ayudarte con cualquier pregunta sobre nuestra plataforma de gestión documental inteligente. ¿En qué puedo asistirte?' 
        }]);
        setIsTyping(false);
      }, 1000);
    }
  };

  const handleNewsletterSignup = async () => {
    if (!email.trim()) return;
    
    // Simular suscripción
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert('¡Gracias por suscribirte! Te mantendremos informado sobre ConstructIA.');
    setEmail('');
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simular envío
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert('¡Mensaje enviado! Nos pondremos en contacto contigo pronto.');
    setContactForm({ name: '', email: '', company: '', message: '' });
  };

  const features = [
    {
      icon: Brain,
      title: 'IA Avanzada',
      description: 'Clasificación automática de documentos con Gemini AI y 94.7% de precisión',
      color: 'bg-gradient-to-br from-purple-500 to-purple-600'
    },
    {
      icon: Shield,
      title: 'Seguridad Total',
      description: 'Encriptación SSL, cumplimiento GDPR y almacenamiento seguro en la nube',
      color: 'bg-gradient-to-br from-blue-500 to-blue-600'
    },
    {
      icon: Globe,
      title: 'Integración Obralia',
      description: 'Subida automática a Obralia/Nalanda tras validación inteligente',
      color: 'bg-gradient-to-br from-green-500 to-green-600'
    },
    {
      icon: Zap,
      title: 'Procesamiento Rápido',
      description: 'Análisis de documentos en menos de 3 segundos con tecnología de vanguardia',
      color: 'bg-gradient-to-br from-yellow-500 to-orange-500'
    },
    {
      icon: FileText,
      title: 'Gestión Completa',
      description: 'Organiza proyectos, empresas y documentos en una plataforma unificada',
      color: 'bg-gradient-to-br from-indigo-500 to-indigo-600'
    },
    {
      icon: TrendingUp,
      title: 'Analytics Avanzados',
      description: 'Métricas detalladas y reportes inteligentes para optimizar tu flujo de trabajo',
      color: 'bg-gradient-to-br from-pink-500 to-pink-600'
    }
  ];

  const testimonials = [
    {
      name: 'Juan García',
      company: 'Construcciones García S.L.',
      role: 'Director General',
      content: 'ConstructIA ha revolucionado nuestra gestión documental. La IA clasifica perfectamente nuestros certificados y facturas, ahorrando horas de trabajo manual.',
      avatar: 'JG',
      rating: 5
    },
    {
      name: 'María López',
      company: 'Obras Públicas del Norte',
      role: 'Jefa de Proyectos',
      content: 'La integración con Obralia es perfecta. Los documentos se suben automáticamente y el equipo puede enfocarse en lo importante: construir.',
      avatar: 'ML',
      rating: 5
    },
    {
      name: 'Carlos Martín',
      company: 'Reformas Integrales',
      role: 'Gerente de Operaciones',
      content: 'El ROI ha sido inmediato. En 3 meses hemos reducido el tiempo de gestión documental en un 70%. Imprescindible para cualquier constructora.',
      avatar: 'CM',
      rating: 5
    }
  ];

  const pricingPlans = [
    {
      name: 'Básico',
      price: '€59',
      period: '/mes',
      features: [
        'Hasta 100 documentos/mes',
        '500MB de almacenamiento',
        'Clasificación IA básica',
        'Integración Obralia',
        'Soporte por email'
      ],
      color: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
      buttonText: 'Empezar Gratis'
    },
    {
      name: 'Profesional',
      price: '€149',
      period: '/mes',
      features: [
        'Hasta 500 documentos/mes',
        '1GB de almacenamiento',
        'IA avanzada 95% precisión',
        'Dashboard personalizado',
        'Múltiples proyectos',
        'Soporte prioritario'
      ],
      popular: true,
      color: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700',
      buttonText: 'Prueba 14 días gratis'
    },
    {
      name: 'Empresarial',
      price: '€299',
      period: '/mes',
      features: [
        'Documentos ilimitados',
        '5GB de almacenamiento',
        'IA premium + análisis predictivo',
        'API personalizada',
        'Múltiples usuarios',
        'Soporte 24/7'
      ],
      color: 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
      buttonText: 'Contactar Ventas'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo size="md" />
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-green-600 transition-colors">Características</a>
              <a href="#pricing" className="text-gray-700 hover:text-green-600 transition-colors">Precios</a>
              <a href="#testimonials" className="text-gray-700 hover:text-green-600 transition-colors">Testimonios</a>
              <a href="#contact" className="text-gray-700 hover:text-green-600 transition-colors">Contacto</a>
              <button 
                onClick={() => navigate('/')}
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Iniciar Sesión
              </button>
              <button 
                onClick={() => navigate('/admin/login')}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Admin
              </button>
            </div>

            {/* Mobile menu button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100">
            <div className="px-4 py-2 space-y-2">
              <a href="#features" className="block py-2 text-gray-700">Características</a>
              <a href="#pricing" className="block py-2 text-gray-700">Precios</a>
              <a href="#testimonials" className="block py-2 text-gray-700">Testimonios</a>
              <a href="#contact" className="block py-2 text-gray-700">Contacto</a>
              <button 
                onClick={() => navigate('/')}
                className="block w-full text-left py-2 text-green-600"
              >
                Iniciar Sesión
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-gray-50 via-white to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Potenciado por Gemini AI
                </div>
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Gestión Documental
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600"> Inteligente</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Revoluciona tu empresa constructora con IA avanzada. Clasifica, organiza y sube documentos automáticamente a Obralia con 94.7% de precisión.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => navigate('/')}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg flex items-center justify-center"
                >
                  Prueba Gratis 14 Días
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
                <button className="border-2 border-gray-300 hover:border-green-600 text-gray-700 hover:text-green-600 font-bold py-4 px-8 rounded-xl transition-all duration-300 flex items-center justify-center">
                  <Play className="mr-2 h-5 w-5" />
                  Ver Demo
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{stats.clients}+</div>
                  <div className="text-sm text-gray-600">Clientes Activos</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{stats.documents.toLocaleString()}+</div>
                  <div className="text-sm text-gray-600">Documentos Procesados</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{stats.accuracy.toFixed(1)}%</div>
                  <div className="text-sm text-gray-600">Precisión IA</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600">{stats.uptime.toFixed(2)}%</div>
                  <div className="text-sm text-gray-600">Uptime</div>
                </div>
              </div>
            </div>

            {/* Hero Image/Animation */}
            <div className="relative">
              <div className="bg-gradient-to-br from-green-400 to-emerald-600 rounded-3xl p-8 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="bg-white rounded-2xl p-6 space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                    <div className="h-4 bg-green-200 rounded w-1/2 animate-pulse"></div>
                  </div>
                  <div className="flex items-center space-x-2 pt-4">
                    <Brain className="h-6 w-6 text-purple-600 animate-pulse" />
                    <span className="text-sm font-medium text-gray-700">Clasificando con IA...</span>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-white rounded-full p-4 shadow-lg animate-bounce">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-full p-4 shadow-lg animate-pulse">
                <Zap className="h-8 w-8 text-yellow-600" />
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
              Características que Transforman tu Negocio
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Descubre cómo ConstructIA revoluciona la gestión documental en construcción con tecnología de vanguardia
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard 
                key={index} 
                {...feature} 
                delay={index * 100}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Cómo Funciona en 3 Pasos Simples
            </h2>
            <p className="text-xl text-gray-600">
              Desde la subida hasta Obralia, todo automatizado con IA
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Upload className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">1. Sube Documentos</h3>
              <p className="text-gray-600">
                Arrastra y suelta tus documentos PDF, imágenes o Word. Nuestra plataforma los recibe de forma segura.
              </p>
            </div>

            <div className="text-center group">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Brain className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">2. IA Clasifica</h3>
              <p className="text-gray-600">
                Gemini AI analiza y clasifica automáticamente: certificados, facturas, DNIs, contratos y más con 94.7% precisión.
              </p>
            </div>

            <div className="text-center group">
              <div className="bg-gradient-to-br from-green-500 to-green-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Globe className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">3. Sube a Obralia</h3>
              <p className="text-gray-600">
                Los documentos validados se suben automáticamente a Obralia/Nalanda en la sección correcta. ¡Sin intervención manual!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Lo que Dicen Nuestros Clientes
            </h2>
            <p className="text-xl text-gray-600">
              Empresas constructoras que ya confían en ConstructIA
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} {...testimonial} />
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Planes que se Adaptan a tu Empresa
            </h2>
            <p className="text-xl text-gray-600">
              Desde startups hasta grandes constructoras, tenemos el plan perfecto
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <PricingCard key={index} {...plan} />
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              ¿Necesitas un plan personalizado para tu empresa?
            </p>
            <button className="text-green-600 hover:text-green-700 font-semibold">
              Contacta con nuestro equipo de ventas →
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-emerald-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            ¿Listo para Revolucionar tu Gestión Documental?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Únete a más de 247 empresas que ya confían en ConstructIA para optimizar sus procesos
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="tu@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-6 py-4 rounded-xl border-0 focus:ring-4 focus:ring-white/20 text-gray-900"
            />
            <button 
              onClick={handleNewsletterSignup}
              className="bg-white text-green-600 hover:bg-gray-100 font-bold py-4 px-8 rounded-xl transition-colors flex items-center justify-center"
            >
              <Send className="mr-2 h-5 w-5" />
              Empezar Gratis
            </button>
          </div>
          
          <p className="text-green-100 text-sm mt-4">
            14 días gratis • Sin tarjeta de crédito • Cancelación en cualquier momento
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Hablemos de tu Proyecto
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Nuestro equipo está listo para ayudarte a implementar ConstructIA en tu empresa
              </p>

              <div className="space-y-6">
                <div className="flex items-center">
                  <div className="bg-green-100 p-3 rounded-full mr-4">
                    <Mail className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Email</h4>
                    <p className="text-gray-600">hola@constructia.com</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="bg-blue-100 p-3 rounded-full mr-4">
                    <Phone className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Teléfono</h4>
                    <p className="text-gray-600">+34 900 123 456</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="bg-purple-100 p-3 rounded-full mr-4">
                    <MapPin className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Oficina</h4>
                    <p className="text-gray-600">Madrid, España</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8">
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Nombre"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <input
                  type="text"
                  placeholder="Empresa"
                  value={contactForm.company}
                  onChange={(e) => setContactForm({...contactForm, company: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                
                <textarea
                  placeholder="Cuéntanos sobre tu proyecto..."
                  rows={4}
                  value={contactForm.message}
                  onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
                
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300"
                >
                  Enviar Mensaje
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <Logo size="md" variant="light" />
              <p className="text-gray-400">
                La plataforma de gestión documental inteligente para empresas constructoras del futuro.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors cursor-pointer">
                  <Heart className="h-5 w-5" />
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors cursor-pointer">
                  <Coffee className="h-5 w-5" />
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors cursor-pointer">
                  <Code className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Producto</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Características</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Precios</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integraciones</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Sobre Nosotros</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Carreras</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Prensa</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Soporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Centro de Ayuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentación</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Estado del Sistema</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contacto</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">
              © 2025 ConstructIA. Todos los derechos reservados.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacidad</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Términos</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>

      {/* AI Chat Assistant */}
      <div className="fixed bottom-6 right-6 z-50">
        {aiChatOpen && (
          <div className="bg-white rounded-2xl shadow-2xl w-80 h-96 mb-4 border border-gray-200 flex flex-col">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center">
                <Bot className="h-6 w-6 mr-2" />
                <span className="font-semibold">Asistente IA</span>
              </div>
              <button 
                onClick={() => setAiChatOpen(false)}
                className="text-white/80 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {chatHistory.length === 0 && (
                <div className="bg-gray-100 rounded-lg p-3">
                  <p className="text-sm text-gray-700">
                    ¡Hola! Soy el asistente IA de ConstructIA. ¿En qué puedo ayudarte?
                  </p>
                </div>
              )}
              
              {chatHistory.map((chat, index) => (
                <div key={index} className={`${chat.type === 'user' ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block p-3 rounded-lg max-w-xs ${
                    chat.type === 'user' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    <p className="text-sm">{chat.message}</p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="text-left">
                  <div className="inline-block bg-gray-100 p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Escribe tu pregunta..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAIChat()}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                />
                <button 
                  onClick={handleAIChat}
                  className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
        
        <button 
          onClick={() => setAiChatOpen(!aiChatOpen)}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110"
        >
          {aiChatOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        </button>
      </div>
    </div>
  );
}

export default LandingPage