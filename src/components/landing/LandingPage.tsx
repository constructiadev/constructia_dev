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
  X,
  Cpu,
  Cloud,
  Lock,
  Smartphone,
  Tablet,
  Monitor,
  Headphones,
  MessageCircle,
  Calendar,
  Download,
  Upload,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Plus,
  Minus,
  RefreshCw,
  Save,
  Copy,
  Share,
  Heart,
  Bookmark,
  Flag,
  AlertTriangle,
  Info,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Maximize,
  Minimize,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Battery,
  BatteryLow,
  Signal,
  Bluetooth,
  Camera,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Image,
  Paperclip,
  Link,
  Unlink,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  Hash,
  AtSign,
  Percent,
  DollarSign,
  Euro,
  PoundSterling,
  Yen,
  Bitcoin,
  CreditCard,
  Banknote,
  Wallet,
  ShoppingCart,
  ShoppingBag,
  Package,
  Truck,
  Plane,
  Car,
  Bike,
  Bus,
  Train,
  Ship,
  Anchor,
  Home,
  Office,
  Store,
  Factory,
  Warehouse,
  School,
  University,
  Hospital,
  Hotel,
  Restaurant,
  Cafe,
  Pizza,
  Coffee,
  Wine,
  Beer,
  Utensils,
  ChefHat,
  Shirt,
  Glasses,
  Watch,
  Crown,
  Gem,
  Gift,
  Balloon,
  Cake,
  PartyPopper,
  Gamepad2,
  Dice1,
  Puzzle,
  Book,
  BookOpen,
  Newspaper,
  PenTool,
  Paintbrush,
  Palette,
  Music,
  Radio,
  Tv,
  Film,
  Clapperboard,
  Headphones as HeadphonesIcon,
  Mic as MicIcon,
  Speaker,
  Volume1,
  VolumeX as VolumeXIcon,
  Sun,
  Moon,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Umbrella,
  Thermometer,
  Wind,
  Compass,
  Map,
  Navigation,
  Locate,
  MapPin as MapPinIcon,
  Route,
  Milestone,
  Mountain,
  Trees,
  Flower,
  Leaf,
  Sprout,
  Bug,
  Fish,
  Bird,
  Rabbit,
  Turtle,
  Snail,
  Butterfly,
  Footprints,
  Paw,
  Bone,
  Activity,
  Zap as ZapIcon,
  Flame,
  Droplets,
  Snowflake,
  Sparkles,
  Wand2,
  Scissors,
  Wrench,
  Hammer,
  Screwdriver,
  Drill,
  Saw,
  Ruler,
  Triangle,
  Square,
  Circle,
  Hexagon,
  Pentagon,
  Octagon,
  Diamond,
  Shapes,
  Grid3x3,
  Layout,
  Sidebar,
  PanelLeft,
  PanelRight,
  PanelTop,
  PanelBottom,
  Columns,
  Rows,
  Table,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  Timer,
  Stopwatch,
  Hourglass,
  History,
  RotateCcw as RotateCcwIcon,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
  Rewind,
  FastForward,
  Pause,
  StopCircle,
  Record,
  Disc,
  Radio as RadioIcon,
  Rss,
  Podcast,
  Headphones as HeadphonesAlt,
  AudioWaveform,
  AudioLines,
  ScanLine,
  Scan,
  QrCode,
  Barcode,
  Hash as HashIcon,
  Binary,
  Code2,
  Terminal as TerminalIcon,
  Command,
  Option,
  Alt,
  Shift,
  Ctrl,
  Space,
  Enter,
  Delete,
  Backspace,
  Tab,
  CapsLock,
  NumLock,
  ScrollLock,
  Insert,
  PageUp,
  PageDown,
  End,
  PrintScreen,
  Pause as PauseIcon,
  Break,
  Escape,
  Function,
  Fn,
  Windows,
  Cmd,
  Apple,
  Android,
  Chrome,
  Firefox,
  Safari,
  Edge,
  Opera,
  Internet,
  Wifi as WifiIcon,
  Router,
  Server as ServerIcon,
  HardDrive as HardDriveIcon,
  Cpu as CpuIcon,
  MemoryStick,
  SdCard,
  UsbPort,
  Ethernet,
  Bluetooth as BluetoothIcon,
  Nfc,
  Cast,
  Airplay,
  Chromecast,
  Tv as TvIcon,
  Monitor as MonitorIcon,
  Laptop,
  Tablet as TabletIcon,
  Smartphone as SmartphoneIcon,
  Watch as WatchIcon,
  Gamepad,
  Joystick,
  Mouse,
  Keyboard,
  Printer,
  Scanner,
  Webcam,
  Projector,
  Speaker as SpeakerIcon,
  Microphone,
  Camera as CameraIcon,
  Video as VideoIcon,
  Image as ImageIcon,
  Film as FilmIcon,
  FileVideo,
  FileAudio,
  FileImage,
  FileText as FileTextIcon,
  File,
  Folder,
  FolderOpen as FolderOpenIcon,
  Archive,
  Package2,
  Box,
  Container,
  Layers as LayersIcon,
  Stack,
  Grid,
  List as ListIcon,
  Menu as MenuIcon,
  MoreHorizontal,
  MoreVertical,
  Ellipsis,
  Dot,
  Circle as CircleIcon,
  Square as SquareIcon,
  Triangle as TriangleIcon,
  Star as StarIcon,
  Heart as HeartIcon,
  ThumbsUp,
  ThumbsDown,
  Like,
  Dislike,
  Smile,
  Frown,
  Meh,
  Angry,
  Laugh,
  Surprised,
  Confused,
  Sleepy,
  Dizzy,
  Expressionless,
  Neutral,
  Relieved,
  Satisfied,
  Kissing,
  SmilingFace,
  Grinning,
  Beaming,
  Winking,
  Squinting,
  Tongue,
  Hugging,
  Thinking,
  Shushing,
  Lying,
  Drooling,
  Sleeping,
  Sick,
  Injured,
  Nauseated,
  Sneezing,
  Exploding,
  Cowboy,
  Partying,
  Disguised,
  Sunglasses,
  Nerd,
  Monocle,
  Worried,
  Slightly,
  Unamused,
  Rolling,
  Grimacing,
  Persevering,
  Disappointed,
  Downcast,
  Pensive,
  Confused as ConfusedIcon,
  Astonished,
  Flushed,
  Pleading,
  Crying,
  Loudly,
  Fearful,
  Cold,
  Persevering as PerseveringIcon,
  Tired,
  Yawning,
  Triumph,
  Angry as AngryIcon,
  Rage,
  Cursing,
  Sad,
  Relieved as RelievedIcon,
  Disappointed as DisappointedIcon,
  Worried as WorriedIcon,
  Hushed,
  Frowning2,
  Anguished,
  Fearful as FearfulIcon,
  Weary,
  Exploding as ExplodingIcon,
  Grimacing as GrimacingIcon,
  Cold as ColdIcon,
  Hot,
  Woozy,
  Dizzy as DizzyIcon,
  Exploding as ExplodingAlt,
  Cowboy as CowboyIcon,
  Partying as PartyingIcon,
  Disguised as DisguisedIcon,
  Sunglasses as SunglassesIcon,
  Nerd as NerdIcon,
  Monocle as MonocleIcon
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

  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleGetStarted = () => {
    navigate('/client/dashboard');
  };

  const handleAdminAccess = () => {
    navigate('/admin-login');
  };

  const handleContactUs = () => {
    window.open('mailto:info@constructia.com?subject=Consulta%20sobre%20ConstructIA', '_blank');
  };

  const handleScheduleDemo = () => {
    window.open('https://calendly.com/constructia-demo', '_blank');
  };

  const handleViewPricing = () => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLearnMore = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTryDemo = () => {
    navigate('/client/dashboard');
  };

  const handleWatchVideo = () => {
    window.open('https://youtube.com/watch?v=demo-constructia', '_blank');
  };

  const handleNewsletterSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  const features = [
    {
      icon: Brain,
      title: 'IA Avanzada',
      description: 'Clasificación automática de documentos con Gemini AI. Precisión del 94.2% en identificación de tipos de documento.',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      details: [
        'Reconocimiento OCR avanzado',
        'Clasificación automática por categorías',
        'Extracción de metadatos inteligente',
        'Validación automática de fechas'
      ]
    },
    {
      icon: Shield,
      title: 'Seguridad Total',
      description: 'Encriptación end-to-end, cumplimiento GDPR y auditoría completa de todas las acciones.',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      details: [
        'Encriptación AES-256',
        'Cumplimiento GDPR/LOPD',
        'Auditoría completa',
        'Backup automático'
      ]
    },
    {
      icon: Zap,
      title: 'Integración Automática',
      description: 'Conexión directa con Obralia/Nalanda, ECoordina, CTAIMA. Subida automática sin intervención manual.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      details: [
        'API nativa Obralia/Nalanda',
        'Sincronización en tiempo real',
        'Mapeo automático de campos',
        'Gestión de errores inteligente'
      ]
    },
    {
      icon: BarChart3,
      title: 'Analytics Inteligente',
      description: 'Métricas en tiempo real, reportes automáticos y predicciones con IA para optimizar procesos.',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      details: [
        'Dashboard en tiempo real',
        'Reportes automáticos',
        'Predicciones con IA',
        'KPIs personalizables'
      ]
    },
    {
      icon: Clock,
      title: 'Ahorro de Tiempo',
      description: 'Reduce el tiempo de gestión documental en un 85%. Automatiza tareas repetitivas.',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-100',
      details: [
        'Procesamiento automático',
        'Eliminación de tareas manuales',
        'Flujos de trabajo optimizados',
        'Notificaciones inteligentes'
      ]
    },
    {
      icon: Target,
      title: 'Cumplimiento Normativo',
      description: 'Garantiza el cumplimiento de todas las normativas del sector construcción.',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      details: [
        'Normativas actualizadas',
        'Validación automática',
        'Alertas de caducidad',
        'Trazabilidad completa'
      ]
    }
  ];

  const plans = [
    {
      name: 'Básico',
      price: '59',
      period: 'mes',
      description: 'Perfecto para pequeñas empresas constructoras',
      features: [
        '100 documentos/mes',
        '500MB almacenamiento',
        'Clasificación IA básica',
        'Integración Obralia',
        'Soporte por email',
        'Dashboard básico',
        '1 usuario'
      ],
      popular: false,
      action: handleGetStarted,
      color: 'border-gray-200',
      buttonColor: 'bg-gray-100 text-gray-900 hover:bg-gray-200'
    },
    {
      name: 'Profesional',
      price: '149',
      period: 'mes',
      description: 'Para empresas en crecimiento con múltiples proyectos',
      features: [
        '500 documentos/mes',
        '2GB almacenamiento',
        'IA avanzada + OCR',
        'Integración múltiple (Obralia + Nalanda)',
        'Soporte prioritario',
        'Analytics completo',
        'Hasta 5 usuarios',
        'API personalizada',
        'Reportes automáticos'
      ],
      popular: true,
      action: handleGetStarted,
      color: 'border-green-500',
      buttonColor: 'bg-green-600 text-white hover:bg-green-700'
    },
    {
      name: 'Enterprise',
      price: '299',
      period: 'mes',
      description: 'Para grandes organizaciones con necesidades avanzadas',
      features: [
        'Documentos ilimitados',
        '10GB almacenamiento',
        'IA personalizada',
        'Todas las integraciones',
        'Soporte 24/7 dedicado',
        'Onboarding personalizado',
        'Usuarios ilimitados',
        'SLA garantizado',
        'Integración ERP/CRM',
        'Consultoría incluida'
      ],
      popular: false,
      action: handleContactUs,
      color: 'border-purple-500',
      buttonColor: 'bg-purple-600 text-white hover:bg-purple-700'
    }
  ];

  const testimonials = [
    {
      name: 'Juan García',
      company: 'Construcciones García S.L.',
      role: 'Director General',
      text: 'ConstructIA ha revolucionado nuestra gestión documental. Ahorramos 15 horas semanales y hemos eliminado completamente los errores de clasificación. La integración con Obralia es perfecta.',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop&crop=face',
      metrics: {
        timeSaved: '15h/semana',
        errorReduction: '100%',
        efficiency: '+85%'
      }
    },
    {
      name: 'María López',
      company: 'Reformas Integrales López',
      role: 'Responsable de Calidad',
      text: 'La precisión de la IA es impresionante. Clasifica correctamente el 96% de nuestros documentos. El dashboard nos da visibilidad total de todos nuestros proyectos.',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop&crop=face',
      metrics: {
        accuracy: '96%',
        projects: '23 activos',
        satisfaction: '10/10'
      }
    },
    {
      name: 'Carlos Martín',
      company: 'Infraestructuras del Sur',
      role: 'CTO',
      text: 'El mejor ROI que hemos tenido en software. Se paga solo con el tiempo ahorrado. La API es robusta y la integración con nuestros sistemas fue muy sencilla.',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop&crop=face',
      metrics: {
        roi: '340%',
        integration: '2 días',
        uptime: '99.9%'
      }
    },
    {
      name: 'Ana Rodríguez',
      company: 'Obras Públicas del Norte',
      role: 'Directora de Operaciones',
      text: 'Gestionar 50+ proyectos simultáneos ahora es posible. La automatización nos permite escalar sin aumentar el equipo administrativo.',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop&crop=face',
      metrics: {
        projects: '50+',
        scaling: '+200%',
        team: 'Sin aumento'
      }
    }
  ];

  const stats = [
    { number: '500+', label: 'Empresas Activas', icon: Building2 },
    { number: '50K+', label: 'Documentos Procesados', icon: FileText },
    { number: '94.2%', label: 'Precisión IA', icon: Brain },
    { number: '15h', label: 'Ahorro Semanal', icon: Clock }
  ];

  const integrations = [
    { name: 'Obralia', logo: 'https://via.placeholder.com/120x60/0066CC/FFFFFF?text=Obralia', status: 'Integración Nativa' },
    { name: 'Nalanda', logo: 'https://via.placeholder.com/120x60/00AA44/FFFFFF?text=Nalanda', status: 'Integración Nativa' },
    { name: 'CTAIMA', logo: 'https://via.placeholder.com/120x60/FF6600/FFFFFF?text=CTAIMA', status: 'Integración Nativa' },
    { name: 'Ecoordina', logo: 'https://via.placeholder.com/120x60/9933CC/FFFFFF?text=Ecoordina', status: 'Próximamente' }
  ];

  const faqs = [
    {
      question: '¿Cómo funciona la clasificación automática?',
      answer: 'Utilizamos Gemini AI de Google para analizar el contenido de cada documento y clasificarlo automáticamente según las categorías del sector construcción (PRL, aptitudes médicas, contratos, etc.). La precisión promedio es del 94.2%.'
    },
    {
      question: '¿Es seguro subir documentos sensibles?',
      answer: 'Absolutamente. Todos los documentos se encriptan con AES-256 antes del almacenamiento. Cumplimos con GDPR, LOPD y tenemos certificación ISO 27001. Los documentos sensibles se purgan automáticamente según las políticas configuradas.'
    },
    {
      question: '¿Qué plataformas soportan?',
      answer: 'Tenemos integración nativa con Obralia y Nalanda, y estamos desarrollando conectores para CTAIMA y Ecoordina. También ofrecemos API para integraciones personalizadas.'
    },
    {
      question: '¿Cuánto tiempo toma la implementación?',
      answer: 'La configuración básica toma menos de 30 minutos. Para empresas grandes con integraciones personalizadas, el proceso completo puede tomar 1-2 semanas con nuestro equipo de onboarding.'
    },
    {
      question: '¿Ofrecen soporte en español?',
      answer: 'Sí, todo nuestro equipo habla español y estamos basados en Madrid. Ofrecemos soporte por email, chat y teléfono en horario comercial español.'
    },
    {
      question: '¿Puedo cancelar en cualquier momento?',
      answer: 'Sí, puedes cancelar tu suscripción en cualquier momento desde tu panel de control. No hay penalizaciones ni costos de cancelación.'
    }
  ];

  const useCases = [
    {
      title: 'Constructoras Grandes',
      description: 'Gestión de múltiples obras simultáneas',
      icon: Building2,
      color: 'bg-blue-600',
      benefits: [
        'Centralización de documentos',
        'Cumplimiento normativo automático',
        'Reducción de errores humanos',
        'Escalabilidad sin límites'
      ]
    },
    {
      title: 'Empresas de Reformas',
      description: 'Optimización de procesos administrativos',
      icon: Wrench,
      color: 'bg-green-600',
      benefits: [
        'Gestión ágil de proyectos',
        'Integración con proveedores',
        'Control de calidad automático',
        'Reportes instantáneos'
      ]
    },
    {
      title: 'Consultoras de Ingeniería',
      description: 'Gestión documental para múltiples clientes',
      icon: Users,
      color: 'bg-purple-600',
      benefits: [
        'Multi-tenant seguro',
        'Separación por cliente',
        'Facturación automatizada',
        'Cumplimiento regulatorio'
      ]
    },
    {
      title: 'Administraciones Públicas',
      description: 'Transparencia y trazabilidad completa',
      icon: Shield,
      color: 'bg-orange-600',
      benefits: [
        'Auditoría completa',
        'Transparencia total',
        'Cumplimiento legal',
        'Acceso controlado por roles'
      ]
    }
  ];

  const processSteps = [
    {
      step: 1,
      title: 'Sube Documentos',
      description: 'Arrastra y suelta o selecciona archivos desde tu dispositivo',
      icon: Upload,
      color: 'bg-blue-600'
    },
    {
      step: 2,
      title: 'IA Clasifica',
      description: 'Gemini AI analiza y clasifica automáticamente cada documento',
      icon: Brain,
      color: 'bg-purple-600'
    },
    {
      step: 3,
      title: 'Validación',
      description: 'Sistema valida fechas, formatos y cumplimiento normativo',
      icon: CheckCircle,
      color: 'bg-green-600'
    },
    {
      step: 4,
      title: 'Integración',
      description: 'Subida automática a Obralia/Nalanda con mapeo correcto',
      icon: Zap,
      color: 'bg-orange-600'
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
                className="text-gray-600 hover:text-green-600 transition-colors font-medium"
              >
                Características
              </button>
              <button 
                onClick={handleViewPricing}
                className="text-gray-600 hover:text-green-600 transition-colors font-medium"
              >
                Precios
              </button>
              <button 
                onClick={() => document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-gray-600 hover:text-green-600 transition-colors font-medium"
              >
                Testimonios
              </button>
              <button 
                onClick={() => scrollToSection('contacto')}
                className="text-gray-700 hover:text-green-600 font-medium transition-colors"
              >
                Contacto
              </button>
              <button 
                onClick={handleContactUs}
                className="text-gray-600 hover:text-green-600 transition-colors font-medium"
              >
                Contacto
              </button>
              <button
                onClick={() => navigate('/client/dashboard')}
                className="text-gray-600 hover:text-green-600 transition-colors font-medium"
              >
                Iniciar Sesión
              </button>
              <button
                onClick={handleGetStarted}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                Comenzar Gratis
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
                  onClick={() => { handleLearnMore(); setIsMenuOpen(false); }}
                  className="block w-full text-left text-gray-600 hover:text-green-600 transition-colors font-medium"
                >
                  Características
                </button>
                <button 
                  onClick={() => { handleViewPricing(); setIsMenuOpen(false); }}
                  className="block w-full text-left text-gray-600 hover:text-green-600 transition-colors font-medium"
                >
                  Precios
                </button>
                <button 
                  onClick={() => { handleContactUs(); setIsMenuOpen(false); }}
                  className="block w-full text-left text-gray-600 hover:text-green-600 transition-colors font-medium"
                >
                  Contacto
                </button>
                <button
                  onClick={() => { navigate('/client/dashboard'); setIsMenuOpen(false); }}
                  className="block w-full text-left text-gray-600 hover:text-green-600 transition-colors font-medium"
                >
                  Iniciar Sesión
                </button>
                <button 
                  onClick={() => scrollToSection('contacto')}
                  className="text-left text-gray-700 hover:text-green-600 font-medium transition-colors"
                >
                  Contacteo
                </button>
                <button
                  onClick={() => { handleGetStarted(); setIsMenuOpen(false); }}
                  className="w-full bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  Comenzar Gratis
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-8">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800 mb-6">
                <Sparkles className="w-4 h-4 mr-2" />
                Nuevo: Integración con CTAIMA disponible
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Gestión Documental
              <span className="text-green-600"> Inteligente</span>
              <br />
              <span className="text-3xl md:text-5xl lg:text-6xl text-gray-700">
                para Construcción
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              Automatiza la clasificación y subida de documentos a Plataformas CAE oficiales <strong>Obralia/Nalanda</strong>, <strong>CTAIMA, ECoordina</strong> con IA. 
              Ahorra <strong>hasta 9 horas semanales</strong>, y reduce errores al <strong>0%</strong> y cumple con todas las normativas.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button
                onClick={handleTryDemo}
                className="bg-green-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                <Play className="mr-2 h-5 w-5" />
                Probar Demo Gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <button
                onClick={handleWatchVideo}
                className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 flex items-center justify-center"
              >
                <Play className="mr-2 h-5 w-5" />
                Ver Video Demo
              </button>
            </div>
            
            <div className="flex flex-wrap items-center justify-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center mb-4">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Sin tarjeta de crédito
              </div>
              <div className="flex items-center mb-4">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Setup en 5 minutos
              </div>
              <div className="flex items-center mb-4">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Soporte en español
              </div>
              <div className="flex items-center mb-4">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Cumplimiento GDPR
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <Icon className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ¿Cómo Funciona?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Proceso automatizado en 4 pasos simples
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="text-center">
                  <div className="relative mb-6">
                    <div className={`w-16 h-16 ${step.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-gray-700">{step.step}</span>
                    </div>
                    {index < processSteps.length - 1 && (
                      <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gray-300 transform -translate-x-8"></div>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              );
            })}
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
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Todo lo que necesitas para automatizar tu gestión documental y cumplir con las normativas del sector
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="group p-8 rounded-2xl border border-gray-200 hover:shadow-xl transition-all duration-300 hover:border-green-300 bg-white">
                  <div className={`w-16 h-16 ${feature.bgColor} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`h-8 w-8 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-center text-sm text-gray-500">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Casos de Uso
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              ConstructIA se adapta a diferentes tipos de empresas del sector construcción
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {useCases.map((useCase, index) => {
              const Icon = useCase.icon;
              return (
                <div key={index} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-center mb-6">
                    <div className={`w-12 h-12 ${useCase.color} rounded-lg flex items-center justify-center mr-4`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{useCase.title}</h3>
                      <p className="text-gray-600">{useCase.description}</p>
                    </div>
                  </div>
                  <ul className="space-y-3">
                    {useCase.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Integraciones Nativas
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Conectamos directamente con las principales plataformas del sector
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {integrations.map((integration, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow text-center">
                <div className="mb-4">
                  <img 
                    src={integration.logo} 
                    alt={integration.name}
                    className="h-12 mx-auto"
                  />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{integration.name}</h3>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                  integration.status === 'Integración Nativa' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {integration.status}
                </span>
              </div>
            ))}
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
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Elige el plan que mejor se adapte a tu empresa. Todos incluyen integración con IA y soporte en español.
            </p>
            <div className="mt-6 flex items-center justify-center">
              <span className="text-gray-600 mr-3">Facturación mensual</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
              <span className="text-gray-600 ml-3">Facturación anual <span className="text-green-600 font-semibold">(20% descuento)</span></span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div key={index} className={`bg-white rounded-2xl shadow-lg border-2 p-8 relative transform transition-all duration-300 hover:scale-105 ${
                plan.popular ? 'border-green-500 shadow-green-100' : plan.color
              }`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-green-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                      ⭐ Más Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-5xl font-bold text-gray-900">€{plan.price}</span>
                    <span className="text-gray-600 text-lg">/{plan.period}</span>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{plan.description}</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={plan.action}
                  className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${plan.buttonColor}`}
                >
                  {plan.name === 'Enterprise' ? 'Contactar Ventas' : 'Comenzar Ahora'}
                </button>
                
                {plan.popular && (
                  <div className="mt-4 text-center">
                    <span className="text-sm text-green-600 font-medium">
                      🎯 Recomendado para la mayoría de empresas
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">
              ¿Necesitas un plan personalizado? 
            </p>
            <button
              onClick={handleContactUs}
              className="text-green-600 hover:text-green-700 font-semibold"
            >
              Contacta con nuestro equipo de ventas →
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Lo que dicen nuestros clientes
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Más de 500 empresas ya confían en ConstructIA para su gestión documental
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-6">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover mr-4"
                  />
                  <div>
                    <div className="flex items-center mb-2">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                    <div className="text-sm text-gray-500">{testimonial.company}</div>
                  </div>
                </div>
                
                <blockquote className="text-gray-700 mb-6 italic leading-relaxed">
                  "{testimonial.text}"
                </blockquote>
                
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                  {Object.entries(testimonial.metrics).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <div className="font-bold text-green-600">{value}</div>
                      <div className="text-xs text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
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

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setActiveFAQ(activeFAQ === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900">{faq.question}</span>
                  {activeFAQ === index ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </button>
                {activeFAQ === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-green-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Mantente Actualizado
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Recibe las últimas novedades sobre ConstructIA y el sector construcción
          </p>
          
          {!isSubscribed ? (
            <form onSubmit={handleNewsletterSignup} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-green-300"
                required
              />
              <button
                type="submit"
                className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Suscribirse
              </button>
            </form>
          ) : (
            <div className="flex items-center justify-center text-green-100">
              <CheckCircle className="h-6 w-6 mr-2" />
              <span className="text-lg font-semibold">¡Gracias por suscribirte!</span>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            ¿Listo para automatizar tu gestión documental?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Únete a más de 500 empresas que ya ahorran tiempo, reducen errores y cumplen normativas con ConstructIA
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleTryDemo}
              className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Comenzar Prueba Gratuita
            </button>
            <button
              onClick={handleScheduleDemo}
              className="border-2 border-white text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300"
            >
              Agendar Demo Personalizada
            </button>
          </div>
          <div className="mt-8 flex items-center justify-center space-x-8 text-blue-100">
            <div className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              <span>Datos seguros</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              <span>Setup rápido</span>
            </div>
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              <span>Soporte experto</span>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <ContactSection id="contacto" />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <Logo size="md" variant="light" />
              <p className="text-gray-400 mt-4 max-w-md leading-relaxed">
                La plataforma de gestión documental inteligente para el sector construcción. 
                Automatiza, integra y cumple con todas las normativas del sector.
              </p>
              <div className="flex space-x-4 mt-6">
                <button 
                  onClick={handleContactUs}
                  className="text-gray-400 hover:text-white transition-colors p-2 bg-gray-800 rounded-lg"
                  title="Email"
                >
                  <Mail className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => window.open('tel:+34910000000', '_blank')}
                  className="text-gray-400 hover:text-white transition-colors p-2 bg-gray-800 rounded-lg"
                  title="Teléfono"
                >
                  <Phone className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => window.open('https://linkedin.com/company/constructia', '_blank')}
                  className="text-gray-400 hover:text-white transition-colors p-2 bg-gray-800 rounded-lg"
                  title="LinkedIn"
                >
                  <ExternalLink className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => window.open('https://twitter.com/constructia', '_blank')}
                  className="text-gray-400 hover:text-white transition-colors p-2 bg-gray-800 rounded-lg"
                  title="Twitter"
                >
                  <ExternalLink className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-6">Producto</h3>
              <ul className="space-y-3">
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
                    Demo Gratuita
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => window.open('https://docs.constructia.com', '_blank')}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Documentación
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => scrollToSection('contacto')}
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    Formulario de Contacto
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => window.open('https://api.constructia.com', '_blank')}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    API
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-6">Empresa</h3>
              <ul className="space-y-3">
                <li>
                  <button 
                    onClick={() => window.open('https://constructia.com/about', '_blank')}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Sobre Nosotros
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => window.open('https://constructia.com/careers', '_blank')}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Carreras
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => window.open('https://constructia.com/press', '_blank')}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Prensa
                  </button>
                </li>
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
                    onClick={() => window.open('https://constructia.com/partners', '_blank')}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Partners
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
                <p className="text-gray-400 text-sm">
                  © 2025 ConstructIA S.L. Todos los derechos reservados.
                </p>
                <div className="flex items-center space-x-4 text-sm">
                  <button
                    onClick={() => navigate('/privacy-policy')}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Privacidad
                  </button>
                  <button
                    onClick={() => navigate('/terms-of-service')}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Términos
                  </button>
                  <button
                    onClick={() => navigate('/cookie-policy')}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Cookies
                  </button>
                </div>
              </div>
              <div className="flex items-center space-x-4 mt-4 md:mt-0">
                <span className="text-gray-500 text-sm">CIF: B87654321</span>
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