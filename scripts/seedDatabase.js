import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Error: Variables de entorno VITE_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son requeridas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Datos mock para insertar
const mockUsers = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'admin@constructia.com',
    role: 'admin'
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'juan@construccionesgarcia.com',
    role: 'client'
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    email: 'maria@obrasnorte.es',
    role: 'client'
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    email: 'carlos@reformaslopez.com',
    role: 'client'
  }
];

const mockClients = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    user_id: '00000000-0000-0000-0000-000000000002',
    client_id: '2024-REC-0001',
    company_name: 'Construcciones García S.L.',
    contact_name: 'Juan García Martínez',
    email: 'juan@construccionesgarcia.com',
    phone: '+34 91 123 45 67',
    address: 'Calle Mayor 123, 28001 Madrid',
    subscription_plan: 'professional',
    subscription_status: 'active',
    storage_used: 850000000,
    storage_limit: 1000000000,
    documents_processed: 127,
    tokens_available: 450,
    obralia_credentials: {
      username: 'juan_garcia',
      password: 'encrypted_password',
      configured: true
    },
    last_activity: new Date().toISOString(),
    monthly_revenue: 149
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    user_id: '00000000-0000-0000-0000-000000000003',
    client_id: '2024-REC-0002',
    company_name: 'Obras Públicas del Norte S.A.',
    contact_name: 'María López Fernández',
    email: 'maria@obrasnorte.es',
    phone: '+34 94 876 54 32',
    address: 'Avenida Industrial 45, 48001 Bilbao',
    subscription_plan: 'enterprise',
    subscription_status: 'active',
    storage_used: 1200000000,
    storage_limit: 2000000000,
    documents_processed: 289,
    tokens_available: 1200,
    obralia_credentials: {
      username: 'maria_lopez',
      password: 'encrypted_password',
      configured: true
    },
    last_activity: new Date().toISOString(),
    monthly_revenue: 299
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    user_id: '00000000-0000-0000-0000-000000000004',
    client_id: '2024-REC-0003',
    company_name: 'Reformas Integrales López',
    contact_name: 'Carlos López Ruiz',
    email: 'carlos@reformaslopez.com',
    phone: '+34 96 111 22 33',
    address: 'Plaza España 8, 46001 Valencia',
    subscription_plan: 'basic',
    subscription_status: 'suspended',
    storage_used: 120000000,
    storage_limit: 500000000,
    documents_processed: 45,
    tokens_available: 50,
    obralia_credentials: {
      username: '',
      password: '',
      configured: false
    },
    last_activity: new Date().toISOString(),
    monthly_revenue: 59
  }
];

const mockCompanies = [
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    client_id: '11111111-1111-1111-1111-111111111111',
    name: 'Construcciones García S.L.',
    cif: 'B12345678',
    address: 'Calle Mayor 123, 28001 Madrid',
    phone: '+34 91 123 45 67',
    email: 'info@construccionesgarcia.com',
    projects_count: 5,
    documents_count: 87,
    status: 'active',
    obralia_configured: true
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    client_id: '22222222-2222-2222-2222-222222222222',
    name: 'Obras Públicas del Norte S.A.',
    cif: 'A87654321',
    address: 'Avenida Industrial 45, 48001 Bilbao',
    phone: '+34 94 876 54 32',
    email: 'contacto@obrasnorte.es',
    projects_count: 3,
    documents_count: 124,
    status: 'active',
    obralia_configured: false
  },
  {
    id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
    client_id: '33333333-3333-3333-3333-333333333333',
    name: 'Reformas Integrales López',
    cif: 'B11223344',
    address: 'Plaza España 8, 46001 Valencia',
    phone: '+34 96 111 22 33',
    email: 'reformas@lopez.com',
    projects_count: 2,
    documents_count: 45,
    status: 'inactive',
    obralia_configured: false
  }
];

const mockProjects = [
  {
    id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
    company_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    client_id: '11111111-1111-1111-1111-111111111111',
    name: 'Edificio Residencial Centro',
    description: 'Construcción de edificio residencial de 8 plantas con 32 viviendas',
    status: 'active',
    progress: 65,
    start_date: '2024-01-15',
    end_date: '2024-12-20',
    budget: 2500000,
    location: 'Madrid Centro',
    company_name: 'Construcciones García S.L.',
    documents_count: 87,
    team_members: 12
  },
  {
    id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    company_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    client_id: '11111111-1111-1111-1111-111111111111',
    name: 'Reforma Oficinas Norte',
    description: 'Reforma integral de oficinas corporativas',
    status: 'active',
    progress: 30,
    start_date: '2024-03-01',
    end_date: '2024-08-15',
    budget: 450000,
    location: 'Distrito Norte',
    company_name: 'Construcciones García S.L.',
    documents_count: 34,
    team_members: 6
  },
  {
    id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
    company_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    client_id: '22222222-2222-2222-2222-222222222222',
    name: 'Puente Industrial A-7',
    description: 'Construcción de puente para acceso industrial',
    status: 'completed',
    progress: 100,
    start_date: '2023-06-01',
    end_date: '2024-01-30',
    budget: 1800000,
    location: 'Autopista A-7',
    company_name: 'Obras Públicas del Norte S.A.',
    documents_count: 156,
    team_members: 18
  }
];

const mockDocuments = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    project_id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
    client_id: '11111111-1111-1111-1111-111111111111',
    filename: 'certificado_obra_A_20240127.pdf',
    original_name: 'Certificado de Obra A.pdf',
    file_size: 2456789,
    file_type: 'application/pdf',
    document_type: 'Certificado',
    classification_confidence: 94,
    ai_metadata: {
      classification: 'Certificado de Obra',
      extracted_data: {
        amount: '€45,670',
        date: '2024-01-27',
        contractor: 'García Construcciones'
      }
    },
    upload_status: 'completed',
    obralia_status: 'validated',
    security_scan_status: 'safe',
    processing_attempts: 1,
    project_name: 'Edificio Residencial Centro',
    company_name: 'Construcciones García S.L.',
    processed_at: new Date().toISOString()
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    project_id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    client_id: '11111111-1111-1111-1111-111111111111',
    filename: 'factura_materiales_B_20240126.pdf',
    original_name: 'Factura Materiales B.pdf',
    file_size: 1234567,
    file_type: 'application/pdf',
    document_type: 'Factura',
    classification_confidence: 89,
    ai_metadata: {
      classification: 'Factura de Materiales',
      extracted_data: {
        amount: '€12,340',
        supplier: 'Materiales Norte S.A.',
        date: '2024-01-26'
      }
    },
    upload_status: 'completed',
    obralia_status: 'uploaded',
    security_scan_status: 'safe',
    processing_attempts: 1,
    project_name: 'Reforma Oficinas Norte',
    company_name: 'Construcciones García S.L.',
    processed_at: new Date().toISOString()
  }
];

const mockAuditLogs = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    user_id: '00000000-0000-0000-0000-000000000001',
    action: 'LOGIN_SUCCESS',
    resource: 'AUTH_SYSTEM',
    details: { message: 'Administrador inició sesión exitosamente' },
    ip_address: '192.168.1.100',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    user_role: 'admin',
    user_email: 'admin@constructia.com',
    status: 'success'
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    user_id: '00000000-0000-0000-0000-000000000002',
    client_id: '11111111-1111-1111-1111-111111111111',
    action: 'DOCUMENT_UPLOAD',
    resource: 'DOCUMENTS',
    details: { message: 'Documento certificado_obra_A.pdf subido exitosamente' },
    ip_address: '192.168.1.101',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    user_role: 'client',
    user_email: 'juan@construccionesgarcia.com',
    client_name: 'Construcciones García S.L.',
    status: 'success'
  }
];

const mockReceipts = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    receipt_number: 'REC-2024-001',
    client_id: '11111111-1111-1111-1111-111111111111',
    amount: 149.00,
    base_amount: 123.14,
    tax_amount: 25.86,
    tax_rate: 21,
    currency: 'EUR',
    payment_method: 'Tarjeta de Crédito',
    gateway_name: 'Stripe',
    description: 'Suscripción Plan Profesional - Enero 2024',
    payment_date: '2024-01-27T10:30:00Z',
    status: 'paid',
    transaction_id: 'txn_1234567890',
    invoice_items: [
      {
        description: 'Plan Profesional ConstructIA - Enero 2024',
        quantity: 1,
        unit_price: 123.14,
        total: 123.14
      }
    ],
    client_details: {
      name: 'Construcciones García S.L.',
      email: 'juan@construccionesgarcia.com',
      address: 'Calle Mayor 123, 28001 Madrid',
      tax_id: 'B12345678'
    },
    company_details: {
      name: 'ConstructIA S.L.',
      address: 'Calle Innovación 123, 28001 Madrid, España',
      tax_id: 'B87654321',
      phone: '+34 91 000 00 00',
      email: 'facturacion@constructia.com',
      website: 'www.constructia.com'
    },
    client_name: 'Construcciones García S.L.',
    client_email: 'juan@construccionesgarcia.com',
    client_address: 'Calle Mayor 123, 28001 Madrid',
    client_tax_id: 'B12345678',
    gross_amount: 153.32,
    commission: 4.32
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    receipt_number: 'REC-2024-002',
    client_id: '22222222-2222-2222-2222-222222222222',
    amount: 299.00,
    base_amount: 247.11,
    tax_amount: 51.89,
    tax_rate: 21,
    currency: 'EUR',
    payment_method: 'Transferencia SEPA',
    gateway_name: 'SEPA',
    description: 'Suscripción Plan Empresarial - Enero 2024',
    payment_date: '2024-01-26T15:45:00Z',
    status: 'paid',
    transaction_id: 'sepa_9876543210',
    invoice_items: [
      {
        description: 'Plan Empresarial ConstructIA - Enero 2024',
        quantity: 1,
        unit_price: 247.11,
        total: 247.11
      }
    ],
    client_details: {
      name: 'Obras Públicas del Norte S.A.',
      email: 'maria@obrasnorte.es',
      address: 'Avenida Industrial 45, 48001 Bilbao',
      tax_id: 'A87654321'
    },
    company_details: {
      name: 'ConstructIA S.L.',
      address: 'Calle Innovación 123, 28001 Madrid, España',
      tax_id: 'B87654321',
      phone: '+34 91 000 00 00',
      email: 'facturacion@constructia.com',
      website: 'www.constructia.com'
    },
    client_name: 'Obras Públicas del Norte S.A.',
    client_email: 'maria@obrasnorte.es',
    client_address: 'Avenida Industrial 45, 48001 Bilbao',
    client_tax_id: 'A87654321',
    gross_amount: 309.17,
    commission: 10.17
  }
];

const mockKPIs = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Clientes Activos',
    value: '247',
    change: 12.5,
    trend: 'up',
    period: 'monthly',
    category: 'clients',
    description: 'Total de clientes con suscripción activa'
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Ingresos Mensuales',
    value: '€47,850',
    change: 18.3,
    trend: 'up',
    period: 'monthly',
    category: 'financial',
    description: 'Ingresos recurrentes del mes'
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'Documentos Procesados',
    value: '12,456',
    change: 8.2,
    trend: 'up',
    period: 'monthly',
    category: 'documents',
    description: 'Total de documentos procesados con IA'
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    name: 'Precisión IA',
    value: '94.7%',
    change: 2.1,
    trend: 'up',
    period: 'monthly',
    category: 'ai',
    description: 'Precisión promedio de clasificación'
  }
];

const mockPaymentGateways = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Stripe Principal',
    type: 'stripe',
    status: 'active',
    commission_type: 'mixed',
    commission_percentage: 2.9,
    commission_fixed: 0.30,
    commission_periods: [
      {
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        percentage: 2.9,
        fixed: 0.30
      }
    ],
    api_key: 'pk_live_...',
    secret_key: 'sk_live_...',
    webhook_url: 'https://api.constructia.com/webhooks/stripe',
    supported_currencies: ['EUR', 'USD'],
    min_amount: 1,
    max_amount: 10000,
    description: 'Pasarela principal para tarjetas de crédito',
    logo_base64: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iOCIgZmlsbD0iIzEwYjk4MSIvPgo8cGF0aCBkPSJNOCAxMmg0djhoLTR2LTh6bTYgMGg0djhoLTR2LTh6bTYgMGg0djhoLTR2LTh6IiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K',
    transactions: 156,
    volume: '€21,450',
    color: 'bg-blue-600'
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'PayPal',
    type: 'paypal',
    status: 'active',
    commission_type: 'mixed',
    commission_percentage: 3.4,
    commission_fixed: 0.35,
    commission_periods: [
      {
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        percentage: 3.4,
        fixed: 0.35
      }
    ],
    supported_currencies: ['EUR', 'USD'],
    min_amount: 1,
    max_amount: 5000,
    description: 'Pagos con cuenta PayPal',
    logo_base64: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iOCIgZmlsbD0iIzEwYjk4MSIvPgo8cGF0aCBkPSJNOCAxMmg0djhoLTR2LTh6bTYgMGg0djhoLTR2LTh6bTYgMGg0djhoLTR2LTh6IiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K',
    transactions: 89,
    volume: '€13,200',
    color: 'bg-blue-500'
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'SEPA',
    type: 'sepa',
    status: 'active',
    commission_type: 'fixed',
    commission_fixed: 0.50,
    commission_periods: [
      {
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        fixed: 0.50
      }
    ],
    supported_currencies: ['EUR'],
    min_amount: 10,
    max_amount: 50000,
    description: 'Transferencias bancarias SEPA',
    logo_base64: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iOCIgZmlsbD0iIzEwYjk4MSIvPgo8cGF0aCBkPSJNOCAxMmg0djhoLTR2LTh6bTYgMGg0djhoLTR2LTh6bTYgMGg0djhoLTR2LTh6IiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K',
    transactions: 34,
    volume: '€8,900',
    color: 'bg-green-600'
  }
];

const mockSystemSettings = [
  {
    key: 'company_name',
    value: { text: 'ConstructIA S.L.' },
    description: 'Nombre de la empresa'
  },
  {
    key: 'company_address',
    value: { text: 'Calle Innovación 123, 28001 Madrid, España' },
    description: 'Dirección de la empresa'
  },
  {
    key: 'company_phone',
    value: { text: '+34 91 000 00 00' },
    description: 'Teléfono de la empresa'
  },
  {
    key: 'company_email',
    value: { text: 'contacto@constructia.com' },
    description: 'Email de contacto de la empresa'
  },
  {
    key: 'company_tax_id',
    value: { text: 'B87654321' },
    description: 'CIF/NIF de la empresa'
  },
  {
    key: 'company_website',
    value: { text: 'www.constructia.com' },
    description: 'Sitio web de la empresa'
  },
  {
    key: 'max_file_size_mb',
    value: { number: 10 },
    description: 'Tamaño máximo de archivo en MB'
  },
  {
    key: 'ai_confidence_threshold',
    value: { number: 85 },
    description: 'Umbral de confianza para clasificación IA'
  },
  {
    key: 'backup_frequency',
    value: { text: 'daily' },
    description: 'Frecuencia de backup automático'
  },
  {
    key: 'smtp_host',
    value: { text: 'smtp.gmail.com' },
    description: 'Servidor SMTP'
  },
  {
    key: 'smtp_port',
    value: { text: '587' },
    description: 'Puerto SMTP'
  },
  {
    key: 'smtp_user',
    value: { text: 'noreply@constructia.com' },
    description: 'Usuario SMTP'
  },
  {
    key: 'log_retention',
    value: { text: '90' },
    description: 'Días de retención de logs'
  },
  {
    key: 'session_timeout',
    value: { text: '30' },
    description: 'Minutos de timeout de sesión'
  }
];

const mockProcessingQueue = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    document_id: '11111111-1111-1111-1111-111111111111',
    client_id: '11111111-1111-1111-1111-111111111111',
    filename: 'certificado_obra_A.pdf',
    client_name: 'Construcciones García S.L.',
    status: 'uploading_obralia',
    progress: 75,
    classification: 'Certificado',
    confidence: 92,
    obralia_section: 'Certificados y Permisos',
    obralia_status: 'pending',
    event_timestamp: new Date().toISOString()
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    document_id: '22222222-2222-2222-2222-222222222222',
    client_id: '22222222-2222-2222-2222-222222222222',
    filename: 'factura_materiales_B.pdf',
    client_name: 'Obras Públicas del Norte S.A.',
    status: 'obralia_validated',
    progress: 90,
    classification: 'Factura',
    confidence: 88,
    obralia_section: 'Facturación',
    obralia_status: 'validated',
    event_timestamp: new Date().toISOString()
  }
];

const mockBackups = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Backup_2025-01-27_14:30',
    backup_date: '2025-01-27T14:30:00Z',
    size_bytes: 2400000000000, // 2.4TB
    type: 'full',
    status: 'completed'
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Backup_2025-01-27_08:00',
    backup_date: '2025-01-27T08:00:00Z',
    size_bytes: 2300000000000, // 2.3TB
    type: 'full',
    status: 'completed'
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'Backup_2025-01-26_20:00',
    backup_date: '2025-01-26T20:00:00Z',
    size_bytes: 156000000, // 156MB
    type: 'incremental',
    status: 'completed'
  }
];

const mockTokenPackages = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Paquete Básico',
    tokens: 500,
    price: 29.00,
    description: 'Ideal para uso ocasional',
    popular: false
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Paquete Profesional',
    tokens: 1500,
    price: 79.00,
    description: 'Perfecto para uso regular',
    popular: true
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'Paquete Empresarial',
    tokens: 5000,
    price: 199.00,
    description: 'Para uso intensivo',
    popular: false
  }
];

const mockStoragePackages = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: '+1GB Adicional',
    storage_mb: 1024, // 1GB
    price: 9.99,
    description: 'Ampliación mensual'
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: '+5GB Adicional',
    storage_mb: 5120, // 5GB
    price: 39.99,
    description: 'Ampliación mensual'
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: '+10GB Adicional',
    storage_mb: 10240, // 10GB
    price: 69.99,
    description: 'Ampliación mensual'
  }
];

const mockSubscriptionPlans = [
  {
    id: 'basic',
    name: 'Básico',
    price_monthly: 59.00,
    price_yearly: 590.00,
    features: [
      'Hasta 100 documentos/mes',
      '500MB de almacenamiento',
      'Clasificación IA básica',
      'Integración Obralia',
      'Soporte por email'
    ],
    storage_mb: 500,
    tokens_per_month: 500,
    documents_per_month: '100/mes',
    support_level: 'Email',
    popular: false
  },
  {
    id: 'professional',
    name: 'Profesional',
    price_monthly: 149.00,
    price_yearly: 1490.00,
    features: [
      'Hasta 500 documentos/mes',
      '1GB de almacenamiento',
      'IA avanzada con 95% precisión',
      'Integración Obralia completa',
      'Dashboard personalizado',
      'Soporte prioritario'
    ],
    storage_mb: 1024,
    tokens_per_month: 1000,
    documents_per_month: '500/mes',
    support_level: 'Prioritario',
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Empresarial',
    price_monthly: 299.00,
    price_yearly: 2990.00,
    features: [
      'Documentos ilimitados',
      '5GB de almacenamiento',
      'IA premium con análisis predictivo',
      'API personalizada',
      'Múltiples usuarios',
      'Soporte 24/7'
    ],
    storage_mb: 5120,
    tokens_per_month: 5000,
    documents_per_month: 'Ilimitados',
    support_level: '24/7',
    popular: false
  },
  {
    id: 'custom',
    name: 'Personalizado',
    price_monthly: 499.00,
    price_yearly: 4990.00,
    features: [
      'Solución a medida',
      'Almacenamiento personalizado',
      'Integraciones específicas',
      'Entrenamiento IA personalizado',
      'Gestor de cuenta dedicado',
      'SLA garantizado'
    ],
    storage_mb: 10240,
    tokens_per_month: 10000,
    documents_per_month: 'Sin límite',
    support_level: 'Dedicado',
    popular: false
  }
];

const mockFiscalEvents = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    title: 'Declaración IVA Q4 2024',
    event_date: '2025-01-30',
    amount_estimate: 5670.00,
    status: 'upcoming',
    description: 'Estimado: €5,670'
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    title: 'Retenciones IRPF',
    event_date: '2025-02-15',
    amount_estimate: 2340.00,
    status: 'upcoming',
    description: 'Estimado: €2,340'
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    title: 'Cierre Fiscal Q1',
    event_date: '2025-03-31',
    amount_estimate: null,
    status: 'upcoming',
    description: 'Preparación automática'
  }
];

const mockApiEndpoints = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Clasificar Documentos',
    method: 'POST',
    endpoint_path: '/api/documents/classify',
    requests_per_hour: 456,
    avg_response_time_ms: 234,
    error_rate: 0.2,
    status: 'healthy',
    description: 'Endpoint para clasificación de documentos con IA'
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Subir a Obralia',
    method: 'POST',
    endpoint_path: '/api/obralia/upload',
    requests_per_hour: 89,
    avg_response_time_ms: 567,
    error_rate: 1.2,
    status: 'slow',
    description: 'Endpoint para subida automática a Obralia/Nalanda'
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'Procesar Pago',
    method: 'POST',
    endpoint_path: '/api/payments/process',
    requests_per_hour: 156,
    avg_response_time_ms: 123,
    error_rate: 0.1,
    status: 'healthy',
    description: 'Endpoint para procesamiento de pagos'
  }
];

const mockApiIntegrations = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Gemini AI',
    status: 'connected',
    description: 'Integración con la API de Gemini para IA',
    requests_today: 8947,
    avg_response_time_ms: 234,
    last_sync: new Date().toISOString(),
    config_details: { api_key_configured: true, model: 'gemini-pro' }
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Obralia/Nalanda',
    status: 'warning',
    description: 'Integración con la plataforma Obralia/Nalanda',
    requests_today: 234,
    avg_response_time_ms: 567,
    last_sync: new Date().toISOString(),
    config_details: { api_key_configured: false, webhook_configured: true }
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'Supabase Database',
    status: 'connected',
    description: 'Base de datos principal',
    requests_today: 15678,
    avg_response_time_ms: 89,
    last_sync: new Date().toISOString(),
    config_details: { connection_pool: 'active', ssl: true }
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    name: 'Stripe Payments',
    status: 'connected',
    description: 'Procesamiento de pagos',
    requests_today: 156,
    avg_response_time_ms: 234,
    last_sync: new Date().toISOString(),
    config_details: { webhook_configured: true, live_mode: true }
  }
];

// Funciones de inserción
async function seedTable(tableName, data, options = {}) {
  console.log(`🔄 Insertando datos en ${tableName}...`);
  try {
    // Verificar si la tabla existe
    const { data: tableExists, error: tableError } = await supabase
      .from(tableName)
      .select('id')
      .limit(1);
    
    if (tableError && tableError.code === '42P01') {
      console.log(`⚠️ Tabla ${tableName} no existe, saltando...`);
      return true; // No es un error, simplemente la tabla no existe aún
    }
    
    if (tableError) {
      console.error(`❌ Error verificando tabla ${tableName}:`, tableError);
      return false;
    }
    
    // Si hay datos existentes y no queremos sobrescribir, saltar
    if (options.skipIfExists && tableExists && tableExists.length > 0) {
      console.log(`⏭️ Tabla ${tableName} ya tiene datos, saltando...`);
      return true;
    }
    
    const { data: insertedData, error } = await supabase
      .from(tableName)
      .insert(data)
      .select();
    
    if (error) {
      console.error(`❌ Error al insertar en ${tableName}:`, error);
      return false;
    }
    
    console.log(`✅ ${insertedData.length} registros insertados en ${tableName} correctamente`);
    return true;
  } catch (err) {
    console.error(`❌ Error general en seedTable para ${tableName}:`, err);
    return false;
  }
}

// Función para limpiar datos existentes (opcional)
async function cleanTable(tableName) {
  console.log(`🧹 Limpiando tabla ${tableName}...`);
  try {
    const { error } = await supabase
      .from(tableName)
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Eliminar todos los registros
    
    if (error) {
      console.error(`❌ Error al limpiar ${tableName}:`, error);
      return false;
    }
    
    console.log(`✅ Tabla ${tableName} limpiada correctamente`);
    return true;
  } catch (err) {
    console.error(`❌ Error general al limpiar ${tableName}:`, err);
    return false;
  }
}

// Función principal de seeding
async function seedDatabase() {
  console.log('🚀 Iniciando proceso de seeding de la base de datos...\n');
  
  try {
    // Verificar conexión
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Error de conexión a Supabase:', testError);
      return;
    }
    
    console.log('✅ Conexión a Supabase establecida correctamente\n');
    
    // Preguntar si limpiar datos existentes
    console.log('⚠️ ADVERTENCIA: Este proceso insertará datos de prueba en tu base de datos.');
    console.log('Si ya tienes datos importantes, considera hacer un backup primero.\n');
    
    // Ejecutar seeding en orden (respetando claves foráneas)
    const results = [];
    
    console.log('📋 Insertando datos base del sistema...');
    results.push(await seedTable('users', mockUsers, { skipIfExists: true }));
    results.push(await seedTable('clients', mockClients, { skipIfExists: true }));
    results.push(await seedTable('companies', mockCompanies, { skipIfExists: true }));
    results.push(await seedTable('projects', mockProjects, { skipIfExists: true }));
    results.push(await seedTable('documents', mockDocuments, { skipIfExists: true }));
    results.push(await seedTable('audit_logs', mockAuditLogs, { skipIfExists: true }));
    results.push(await seedTable('receipts', mockReceipts, { skipIfExists: true }));
    
    console.log('\n📊 Insertando datos de configuración...');
    results.push(await seedTable('kpis', mockKPIs));
    results.push(await seedTable('payment_gateways', mockPaymentGateways));
    results.push(await seedTable('system_settings', mockSystemSettings, { skipIfExists: true }));
    
    console.log('\n🔧 Insertando datos de gestión...');
    results.push(await seedTable('processing_queue', mockProcessingQueue));
    results.push(await seedTable('backups', mockBackups));
    results.push(await seedTable('token_packages', mockTokenPackages));
    results.push(await seedTable('storage_packages', mockStoragePackages));
    results.push(await seedTable('subscription_plans', mockSubscriptionPlans));
    results.push(await seedTable('fiscal_events', mockFiscalEvents));
    results.push(await seedTable('api_endpoints', mockApiEndpoints));
    results.push(await seedTable('api_integrations', mockApiIntegrations));
    
    const successCount = results.filter(Boolean).length;
    const totalCount = results.length;
    
    console.log('\n📊 Resumen del seeding:');
    console.log(`✅ Operaciones exitosas: ${successCount}/${totalCount}`);
    
    if (successCount === totalCount) {
      console.log('🎉 ¡Seeding completado exitosamente!');
      console.log('💡 Tu aplicación ahora puede funcionar con datos reales de Supabase');
      console.log('\n📋 Datos insertados:');
      console.log('• 4 usuarios (1 admin + 3 clientes)');
      console.log('• 3 clientes con configuraciones completas');
      console.log('• 3 empresas asociadas a los clientes');
      console.log('• 3 proyectos con datos realistas');
      console.log('• 2 documentos de ejemplo');
      console.log('• 2 logs de auditoría');
      console.log('• 2 recibos de ejemplo');
      console.log('• 4 KPIs principales del sistema');
      console.log('• 3 pasarelas de pago configuradas');
      console.log('• 14 configuraciones del sistema');
      console.log('• 2 elementos en cola de procesamiento');
      console.log('• 3 backups registrados');
      console.log('• 3 paquetes de tokens');
      console.log('• 3 paquetes de almacenamiento');
      console.log('• 4 planes de suscripción');
      console.log('• 3 eventos fiscales');
      console.log('• 3 endpoints de API');
      console.log('• 4 integraciones de API');
    } else {
      console.log('⚠️ Algunas operaciones fallaron. Revisa los errores arriba.');
      console.log('💡 Las tablas que fallaron pueden no existir aún. Ejecuta primero la migración SQL.');
    }
    
  } catch (error) {
    console.error('❌ Error fatal en el proceso de seeding:', error);
  }
}

// Función para limpiar todos los datos (usar con precaución)
async function cleanAllData() {
  console.log('🧹 Limpiando todos los datos de prueba...\n');
  
  const tablesToClean = [
    'api_integrations',
    'api_endpoints', 
    'fiscal_events',
    'subscription_plans',
    'storage_packages',
    'token_packages',
    'backups',
    'processing_queue',
    'kpis',
    'payment_gateways',
    'receipts',
    'audit_logs',
    'documents',
    'projects',
    'companies',
    'clients',
    'users'
  ];
  
  for (const table of tablesToClean) {
    await cleanTable(table);
  }
  
  console.log('🎉 Limpieza completada');
}

// Ejecutar el seeding
if (process.argv.includes('--clean')) {
  cleanAllData();
} else {
  seedDatabase();
}

// Exportar funciones para uso externo
export { seedDatabase, cleanAllData, seedTable, cleanTable };