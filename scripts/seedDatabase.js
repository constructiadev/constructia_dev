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
    }
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
    }
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
    }
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
    email: 'info@construccionesgarcia.com'
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    client_id: '22222222-2222-2222-2222-222222222222',
    name: 'Obras Públicas del Norte S.A.',
    cif: 'A87654321',
    address: 'Avenida Industrial 45, 48001 Bilbao',
    phone: '+34 94 876 54 32',
    email: 'contacto@obrasnorte.es'
  },
  {
    id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
    client_id: '33333333-3333-3333-3333-333333333333',
    name: 'Reformas Integrales López',
    cif: 'B11223344',
    address: 'Plaza España 8, 46001 Valencia',
    phone: '+34 96 111 22 33',
    email: 'reformas@lopez.com'
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
    location: 'Madrid Centro'
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
    location: 'Distrito Norte'
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
    location: 'Autopista A-7'
  }
];

const mockKPIs = [
  {
    name: 'Clientes Activos',
    value: '247',
    change: 12.5,
    trend: 'up',
    period: 'monthly',
    category: 'clients',
    description: 'Total de clientes con suscripción activa'
  },
  {
    name: 'Ingresos Mensuales',
    value: '€47,850',
    change: 18.3,
    trend: 'up',
    period: 'monthly',
    category: 'financial',
    description: 'Ingresos recurrentes del mes'
  },
  {
    name: 'Documentos Procesados',
    value: '12,456',
    change: 8.2,
    trend: 'up',
    period: 'monthly',
    category: 'documents',
    description: 'Total de documentos procesados con IA'
  },
  {
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
    name: 'Stripe Principal',
    type: 'stripe',
    status: 'active',
    commission_type: 'mixed',
    commission_percentage: 2.9,
    commission_fixed: 0.30,
    api_key: 'pk_live_...',
    secret_key: 'sk_live_...',
    webhook_url: 'https://api.constructia.com/webhooks/stripe',
    supported_currencies: ['EUR', 'USD'],
    min_amount: 1,
    max_amount: 10000,
    description: 'Pasarela principal para tarjetas de crédito'
  },
  {
    name: 'PayPal',
    type: 'paypal',
    status: 'active',
    commission_type: 'mixed',
    commission_percentage: 3.4,
    commission_fixed: 0.35,
    supported_currencies: ['EUR', 'USD'],
    min_amount: 1,
    max_amount: 5000,
    description: 'Pagos con cuenta PayPal'
  },
  {
    name: 'SEPA',
    type: 'sepa',
    status: 'active',
    commission_type: 'fixed',
    commission_fixed: 0.50,
    supported_currencies: ['EUR'],
    min_amount: 10,
    max_amount: 50000,
    description: 'Transferencias bancarias SEPA'
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
  }
];

// Funciones de inserción
async function seedUsers() {
  console.log('🔄 Insertando usuarios...');
  try {
    const { data, error } = await supabase
      .from('users')
      .insert(mockUsers)
      .select();
    
    if (error) {
      console.error('❌ Error al insertar usuarios:', error);
      return false;
    }
    
    console.log(`✅ ${data.length} usuarios insertados correctamente`);
    return true;
  } catch (err) {
    console.error('❌ Error general en seedUsers:', err);
    return false;
  }
}

async function seedClients() {
  console.log('🔄 Insertando clientes...');
  try {
    const { data, error } = await supabase
      .from('clients')
      .insert(mockClients)
      .select();
    
    if (error) {
      console.error('❌ Error al insertar clientes:', error);
      return false;
    }
    
    console.log(`✅ ${data.length} clientes insertados correctamente`);
    return true;
  } catch (err) {
    console.error('❌ Error general en seedClients:', err);
    return false;
  }
}

async function seedCompanies() {
  console.log('🔄 Insertando empresas...');
  try {
    const { data, error } = await supabase
      .from('companies')
      .insert(mockCompanies)
      .select();
    
    if (error) {
      console.error('❌ Error al insertar empresas:', error);
      return false;
    }
    
    console.log(`✅ ${data.length} empresas insertadas correctamente`);
    return true;
  } catch (err) {
    console.error('❌ Error general en seedCompanies:', err);
    return false;
  }
}

async function seedProjects() {
  console.log('🔄 Insertando proyectos...');
  try {
    const { data, error } = await supabase
      .from('projects')
      .insert(mockProjects)
      .select();
    
    if (error) {
      console.error('❌ Error al insertar proyectos:', error);
      return false;
    }
    
    console.log(`✅ ${data.length} proyectos insertados correctamente`);
    return true;
  } catch (err) {
    console.error('❌ Error general en seedProjects:', err);
    return false;
  }
}

async function seedKPIs() {
  console.log('🔄 Insertando KPIs...');
  try {
    const { data, error } = await supabase
      .from('kpis')
      .insert(mockKPIs)
      .select();
    
    if (error) {
      console.error('❌ Error al insertar KPIs:', error);
      return false;
    }
    
    console.log(`✅ ${data.length} KPIs insertados correctamente`);
    return true;
  } catch (err) {
    console.error('❌ Error general en seedKPIs:', err);
    return false;
  }
}

async function seedPaymentGateways() {
  console.log('🔄 Insertando pasarelas de pago...');
  try {
    const { data, error } = await supabase
      .from('payment_gateways')
      .insert(mockPaymentGateways)
      .select();
    
    if (error) {
      console.error('❌ Error al insertar pasarelas de pago:', error);
      return false;
    }
    
    console.log(`✅ ${data.length} pasarelas de pago insertadas correctamente`);
    return true;
  } catch (err) {
    console.error('❌ Error general en seedPaymentGateways:', err);
    return false;
  }
}

async function seedSystemSettings() {
  console.log('🔄 Insertando configuraciones del sistema...');
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .insert(mockSystemSettings)
      .select();
    
    if (error) {
      console.error('❌ Error al insertar configuraciones:', error);
      return false;
    }
    
    console.log(`✅ ${data.length} configuraciones insertadas correctamente`);
    return true;
  } catch (err) {
    console.error('❌ Error general en seedSystemSettings:', err);
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
    
    // Ejecutar seeding en orden (respetando claves foráneas)
    const results = [];
    
    results.push(await seedUsers());
    results.push(await seedClients());
    results.push(await seedCompanies());
    results.push(await seedProjects());
    results.push(await seedKPIs());
    results.push(await seedPaymentGateways());
    results.push(await seedSystemSettings());
    
    const successCount = results.filter(Boolean).length;
    const totalCount = results.length;
    
    console.log('\n📊 Resumen del seeding:');
    console.log(`✅ Operaciones exitosas: ${successCount}/${totalCount}`);
    
    if (successCount === totalCount) {
      console.log('🎉 ¡Seeding completado exitosamente!');
      console.log('💡 Tu aplicación ahora puede funcionar con datos reales de Supabase');
    } else {
      console.log('⚠️ Algunas operaciones fallaron. Revisa los errores arriba.');
    }
    
  } catch (error) {
    console.error('❌ Error fatal en el proceso de seeding:', error);
  }
}

// Ejecutar el seeding
seedDatabase();