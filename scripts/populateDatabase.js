import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Datos para generar clientes diversos
const companyNames = [
  'Construcciones García S.L.', 'Obras Públicas del Norte S.A.', 'Reformas Integrales López',
  'Constructora Mediterránea S.A.', 'Ingeniería y Obras S.L.', 'Construcciones del Sur S.A.',
  'Infraestructuras Catalanas S.L.', 'Obras Marítimas Galicia S.A.', 'Edificaciones Sostenibles S.L.',
  'Túneles y Viaductos S.A.', 'Reformas Urbanas Madrid S.L.', 'Construcciones Andaluzas S.A.',
  'Obras Civiles Valencia S.L.', 'Infraestructuras Vascas S.A.', 'Reformas Ecológicas S.L.',
  'Construcciones Industriales S.A.', 'Obras Residenciales S.L.', 'Infraestructuras Canarias S.A.',
  'Reformas Comerciales S.L.', 'Construcciones Históricas S.A.', 'Obras Deportivas S.L.',
  'Infraestructuras Rurales S.A.', 'Reformas Hospitalarias S.L.', 'Construcciones Educativas S.A.',
  'Obras Turísticas S.L.', 'Infraestructuras Logísticas S.A.', 'Reformas Hoteleras S.L.',
  'Construcciones Aeroportuarias S.A.', 'Obras Ferroviarias S.L.', 'Infraestructuras Portuarias S.A.',
  'Reformas Industriales S.L.', 'Construcciones Mineras S.A.', 'Obras Energéticas S.L.',
  'Infraestructuras Tecnológicas S.A.', 'Reformas Culturales S.L.', 'Construcciones Deportivas S.A.',
  'Obras Sanitarias S.L.', 'Infraestructuras Educativas S.A.', 'Reformas Religiosas S.L.',
  'Construcciones Militares S.A.', 'Obras Penitenciarias S.L.', 'Infraestructuras Judiciales S.A.',
  'Reformas Gubernamentales S.L.', 'Construcciones Diplomáticas S.A.', 'Obras Consulares S.L.',
  'Infraestructuras Embajadas S.A.', 'Reformas Internacionales S.L.', 'Construcciones Europeas S.A.',
  'Obras Globales S.L.', 'Infraestructuras Mundiales S.A.'
];

const contactNames = [
  'Juan García', 'María López', 'Carlos Martín', 'Ana Rodríguez', 'Pedro Sánchez',
  'Laura Fernández', 'Miguel Ruiz', 'Carmen Jiménez', 'José Moreno', 'Isabel Muñoz',
  'Francisco Álvarez', 'Pilar Romero', 'Antonio Navarro', 'Rosa Gutiérrez', 'Manuel Torres',
  'Elena Vázquez', 'Rafael Ramos', 'Cristina Herrera', 'Javier Molina', 'Beatriz Delgado',
  'Sergio Castro', 'Mónica Ortega', 'Daniel Rubio', 'Patricia Medina', 'Alejandro Serrano',
  'Silvia Peña', 'Roberto Cortés', 'Nuria Iglesias', 'Óscar Garrido', 'Raquel Santos',
  'Víctor Guerrero', 'Amparo Lozano', 'Emilio Mendoza', 'Dolores Prieto', 'Ignacio Vargas',
  'Esperanza Campos', 'Ramón Cano', 'Concepción Flores', 'Tomás Aguilar', 'Remedios Pascual',
  'Enrique Santana', 'Encarnación Calvo', 'Gonzalo Parra', 'Inmaculada Hidalgo', 'Esteban Montero',
  'Milagros Ibáñez', 'Nicolás Ferrer', 'Asunción Caballero', 'Andrés Gallego', 'Purificación León'
];

const cities = [
  'Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Zaragoza', 'Málaga', 'Murcia', 'Palma',
  'Las Palmas', 'Bilbao', 'Alicante', 'Córdoba', 'Valladolid', 'Vigo', 'Gijón', 'Hospitalet',
  'Vitoria', 'Coruña', 'Granada', 'Elche', 'Oviedo', 'Badalona', 'Cartagena', 'Terrassa',
  'Jerez', 'Sabadell', 'Móstoles', 'Santa Cruz', 'Pamplona', 'Almería', 'Alcalá', 'Fuenlabrada',
  'Leganés', 'Santander', 'Burgos', 'Castellón', 'Alcorcón', 'Albacete', 'Getafe', 'Salamanca',
  'Huelva', 'Logroño', 'Badajoz', 'San Sebastián', 'Lleida', 'Tarragona', 'León', 'Cádiz',
  'Marbella', 'Dos Hermanas'
];

const plans = ['basic', 'professional', 'enterprise', 'custom'];
const statuses = ['active', 'suspended', 'cancelled'];

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateRandomEmail(contactName, companyName) {
  // Clean contact name: remove accents, convert to lowercase, replace spaces with dots
  const cleanName = contactName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters except spaces
    .replace(/\s+/g, '.'); // Replace spaces with dots
  
  // Clean company name for domain
  const cleanCompany = companyName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters except spaces
    .replace(/\s+/g, '') // Remove all spaces
    .substring(0, 15); // Ensure reasonable length
  
  // Generate unique email with timestamp
  const timestamp = Date.now();
  const name = `${cleanName}${timestamp}`;
  const domain = `${cleanCompany}example.com`; // Use example.com for safety
  
  return `${name}@${domain}`;
}

function generateRandomPhone() {
  return `+34 ${Math.floor(Math.random() * 900) + 600} ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 900) + 100}`;
}

function generateRandomCIF() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const letter = letters[Math.floor(Math.random() * letters.length)];
  const numbers = Math.floor(Math.random() * 90000000) + 10000000;
  return `${letter}${numbers}`;
}

function getStorageByPlan(plan) {
  switch (plan) {
    case 'basic': return { limit: 524288000, used: Math.floor(Math.random() * 400000000) }; // 500MB
    case 'professional': return { limit: 1073741824, used: Math.floor(Math.random() * 800000000) }; // 1GB
    case 'enterprise': return { limit: 5368709120, used: Math.floor(Math.random() * 4000000000) }; // 5GB
    case 'custom': return { limit: 10737418240, used: Math.floor(Math.random() * 8000000000) }; // 10GB
    default: return { limit: 524288000, used: Math.floor(Math.random() * 400000000) };
  }
}

function getTokensByPlan(plan) {
  switch (plan) {
    case 'basic': return Math.floor(Math.random() * 500) + 100;
    case 'professional': return Math.floor(Math.random() * 1500) + 500;
    case 'enterprise': return Math.floor(Math.random() * 5000) + 2000;
    case 'custom': return Math.floor(Math.random() * 10000) + 5000;
    default: return Math.floor(Math.random() * 500) + 100;
  }
}

function generateRandomDate(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  return date.toISOString();
}

async function populateDatabase() {
  console.log('🚀 Poblando base de datos con 50 clientes diversos...\n');

  try {
    // 1. Crear usuarios usando Supabase Auth
    console.log('1️⃣ Creando usuarios con UUIDs válidos...');
    const users = [];
    
    for (let i = 0; i < 50; i++) {
      const contactName = contactNames[i];
      const companyName = companyNames[i];
      const email = generateRandomEmail(contactName, companyName);
      
      // Crear usuario con Supabase Auth para obtener UUID válido
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: email,
        password: 'TempPassword123!',
        email_confirm: true
      });

      if (authError) {
        console.error(`❌ Error creating auth user ${email}:`, authError);
        continue;
      }
      
      users.push({
        id: authUser.user.id,
        email: email,
        role: 'client',
        created_at: generateRandomDate(365),
        updated_at: new Date().toISOString()
      });
    }

    const { error: usersError } = await supabase
      .from('users')
      .upsert(users);

    if (usersError) {
      console.error('❌ Error creating users:', usersError);
      throw usersError;
    }
    console.log(`✅ ${users.length} usuarios creados exitosamente`);

    // 2. Crear clientes con datos diversos
    console.log('2️⃣ Creando clientes con datos diversos...');
    const clients = [];
    
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const contactName = contactNames[i];
      const companyName = companyNames[i];
      const city = getRandomElement(cities);
      const plan = getRandomElement(plans);
      const status = getRandomElement(statuses);
      const storage = getStorageByPlan(plan);
      const tokens = getTokensByPlan(plan);
      
      // Distribuir estados de manera realista
      let finalStatus = status;
      if (Math.random() < 0.84) finalStatus = 'active'; // 84% activos
      else if (Math.random() < 0.08) finalStatus = 'suspended'; // 8% suspendidos
      else finalStatus = 'cancelled'; // 8% cancelados

      // Configuración de Obralia más realista
      const obraliaConfigured = Math.random() < 0.64; // 64% configurados

      clients.push({
        user_id: user.id,
        client_id: `CLI-${Date.now()}-${String(i + 1).padStart(4, '0')}`, // Add timestamp for uniqueness
        company_name: companyName,
        contact_name: contactName,
        email: user.email,
        phone: generateRandomPhone(),
        address: `Calle ${getRandomElement(['Construcción', 'Reforma', 'Obra', 'Edificación', 'Ingeniería'])} ${Math.floor(Math.random() * 999) + 1}, ${city}`,
        subscription_plan: plan,
        subscription_status: finalStatus,
        storage_used: storage.used,
        storage_limit: storage.limit,
        documents_processed: Math.floor(Math.random() * 100) + (plan === 'enterprise' ? 50 : plan === 'professional' ? 20 : 5),
        tokens_available: tokens,
        obralia_credentials: {
          configured: obraliaConfigured,
          username: obraliaConfigured ? `${contactName.toLowerCase().replace(' ', '.')}@obralia.com` : null,
          password: obraliaConfigured ? `${companyName.substring(0, 8)}2024!` : null
        },
        created_at: generateRandomDate(365),
        updated_at: new Date().toISOString()
      });
    }

    const { data: clientsData, error: clientsError } = await supabase
      .from('clients')
      .upsert(clients)
      .select();

    if (clientsError) {
      console.error('❌ Error creating clients:', clientsError);
      throw clientsError;
    }
    console.log('✅ 50 clientes creados exitosamente');

    // 3. Crear empresas para cada cliente
    console.log('3️⃣ Creando empresas...');
    const companies = [];
    
    clientsData.forEach((client, index) => {
      // Cada cliente tiene 1-3 empresas
      const numCompanies = Math.floor(Math.random() * 3) + 1;
      
      for (let j = 0; j < numCompanies; j++) {
        companies.push({
          client_id: client.id, // Usar id como referencia
          name: j === 0 ? client.company_name : `${client.company_name.split(' ')[0]} ${getRandomElement(['Filial', 'Sucursal', 'División'])} ${j + 1}`,
          cif: generateRandomCIF(),
          address: client.address,
          phone: client.phone,
          email: client.email,
          created_at: generateRandomDate(300),
          updated_at: new Date().toISOString()
        });
      }
    });

    const { data: companiesData, error: companiesError } = await supabase
      .from('companies')
      .upsert(companies)
      .select();

    if (companiesError) {
      console.error('❌ Error creating companies:', companiesError);
      throw companiesError;
    }
    console.log(`✅ ${companies.length} empresas creadas exitosamente`);

    // 4. Crear proyectos
    console.log('4️⃣ Creando proyectos...');
    const projects = [];
    const projectTypes = [
      'Edificio Residencial', 'Reforma Integral', 'Construcción Industrial', 'Obra Civil',
      'Rehabilitación', 'Ampliación', 'Demolición', 'Urbanización', 'Infraestructura',
      'Restauración', 'Modernización', 'Reparación', 'Mantenimiento', 'Instalación'
    ];

    companiesData.forEach((company) => {
      const numProjects = Math.floor(Math.random() * 5) + 1; // 1-5 proyectos por empresa
      
      for (let j = 0; j < numProjects; j++) {
        const projectType = getRandomElement(projectTypes);
        const status = getRandomElement(['planning', 'active', 'paused', 'completed']);
        const progress = status === 'completed' ? 100 : 
                        status === 'active' ? Math.floor(Math.random() * 80) + 10 :
                        status === 'paused' ? Math.floor(Math.random() * 60) + 20 :
                        Math.floor(Math.random() * 30);

        projects.push({
          company_id: company.id,
          client_id: company.client_id,
          name: `${projectType} ${company.name.split(' ')[0]}`,
          description: `Proyecto de ${projectType.toLowerCase()} para ${company.name}`,
          status: status,
          progress: progress,
          start_date: generateRandomDate(200).split('T')[0],
          end_date: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          budget: Math.floor(Math.random() * 500000) + 50000,
          location: `${getRandomElement(cities)}, España`,
          created_at: generateRandomDate(180),
          updated_at: new Date().toISOString()
        });
      }
    });

    const { data: projectsData, error: projectsError } = await supabase
      .from('projects')
      .upsert(projects)
      .select();

    if (projectsError) {
      console.error('❌ Error creating projects:', projectsError);
      throw projectsError;
    }
    console.log(`✅ ${projects.length} proyectos creados exitosamente`);

    // 5. Crear documentos
    console.log('5️⃣ Creando documentos...');
    const documents = [];
    const documentTypes = [
      'Certificado', 'Factura', 'Contrato', 'Plano', 'Memoria', 'Presupuesto',
      'Licencia', 'Permiso', 'Informe', 'Acta', 'Registro', 'Autorización'
    ];
    const uploadStatuses = ['pending', 'processing', 'classified', 'uploaded_to_obralia', 'completed', 'error'];
    const obraliaStatuses = ['pending', 'uploaded', 'validated', 'rejected', 'error'];
    const securityStatuses = ['pending', 'safe', 'threat_detected'];

    projectsData.forEach((project) => {
      const numDocuments = Math.floor(Math.random() * 15) + 5; // 5-20 documentos por proyecto
      
      for (let j = 0; j < numDocuments; j++) {
        const docType = getRandomElement(documentTypes);
        const uploadStatus = getRandomElement(uploadStatuses);
        const obraliaStatus = getRandomElement(obraliaStatuses);
        const securityStatus = getRandomElement(securityStatuses);
        const confidence = Math.floor(Math.random() * 30) + 70; // 70-100%
        const fileSize = Math.floor(Math.random() * 5000000) + 100000; // 100KB - 5MB

        documents.push({
          project_id: project.id,
          client_id: project.client_id,
          filename: `${docType.toLowerCase()}_${j + 1}_${Date.now()}.pdf`,
          original_name: `${docType} - ${project.name} (${j + 1}).pdf`,
          file_size: fileSize,
          file_type: 'application/pdf',
          document_type: docType,
          classification_confidence: confidence,
          ai_metadata: {
            processing_time: Math.floor(Math.random() * 5000) + 1000,
            model_version: 'gemini-pro-v1.5',
            confidence_score: confidence
          },
          upload_status: uploadStatus,
          obralia_status: obraliaStatus,
          security_scan_status: securityStatus,
          processing_attempts: uploadStatus === 'error' ? Math.floor(Math.random() * 3) + 1 : 1,
          last_processing_error: uploadStatus === 'error' ? 'Error de conexión con Obralia' : null,
          created_at: generateRandomDate(90),
          updated_at: new Date().toISOString()
        });
      }
    });

    const { error: documentsError } = await supabase
      .from('documents')
      .upsert(documents);

    if (documentsError) {
      console.error('❌ Error creating documents:', documentsError);
      throw documentsError;
    }
    console.log(`✅ ${documents.length} documentos creados exitosamente`);

    // 6. Crear suscripciones
    console.log('6️⃣ Creando suscripciones...');
    const subscriptions = [];
    
    clientsData.forEach((client) => {
      if (client.subscription_status === 'active') {
        const startDate = new Date(client.created_at);
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);

        subscriptions.push({
          client_id: client.id,
          plan: client.subscription_plan,
          status: client.subscription_status,
          current_period_start: startDate.toISOString(),
          current_period_end: endDate.toISOString(),
          stripe_subscription_id: `sub_${Math.random().toString(36).substr(2, 9)}`,
          created_at: client.created_at,
          updated_at: new Date().toISOString()
        });
      }
    });

    const { error: subscriptionsError } = await supabase
      .from('subscriptions')
      .upsert(subscriptions);

    if (subscriptionsError) {
      console.error('❌ Error creating subscriptions:', subscriptionsError);
      throw subscriptionsError;
    }
    console.log(`✅ ${subscriptions.length} suscripciones creadas exitosamente`);

    // 7. Crear pagos y recibos
    console.log('7️⃣ Creando pagos y recibos...');
    const payments = [];
    const receipts = [];
    const paymentMethods = ['stripe', 'sepa', 'paypal', 'bizum'];
    
    clientsData.forEach((client, index) => {
      if (client.subscription_status === 'active') {
        // Crear 1-6 pagos por cliente activo
        const numPayments = Math.floor(Math.random() * 6) + 1;
        
        for (let j = 0; j < numPayments; j++) {
          const amount = client.subscription_plan === 'enterprise' ? 299 :
                        client.subscription_plan === 'professional' ? 149 :
                        client.subscription_plan === 'custom' ? Math.floor(Math.random() * 400) + 200 :
                        59;
          
          const paymentMethod = getRandomElement(paymentMethods);
          const paymentDate = generateRandomDate(180);
          
          const payment = {
            client_id: client.id,
            amount: amount,
            currency: 'EUR',
            payment_method: paymentMethod,
            payment_status: Math.random() < 0.95 ? 'completed' : 'failed',
            stripe_payment_intent_id: `pi_${Math.random().toString(36).substr(2, 9)}`,
            description: `Suscripción ${client.subscription_plan} - ${new Date(paymentDate).toLocaleDateString()}`,
            created_at: paymentDate,
            updated_at: new Date().toISOString()
          };

          payments.push(payment);

          // Crear recibo correspondiente
          if (payment.payment_status === 'completed') {
            const baseAmount = amount / 1.21; // Sin IVA
            const taxAmount = amount - baseAmount; // IVA 21%

            receipts.push({
              receipt_number: `REC-${new Date().getFullYear()}-${String(index * 10 + j + 1).padStart(6, '0')}`,
              client_id: client.id,
              amount: amount,
              base_amount: baseAmount,
              tax_amount: taxAmount,
              tax_rate: 21.00,
              currency: 'EUR',
              payment_method: paymentMethod,
              gateway_name: paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1),
              description: payment.description,
              payment_date: paymentDate,
              status: 'paid',
              transaction_id: `txn_${Math.random().toString(36).substr(2, 9)}`,
              invoice_items: [{
                description: `Suscripción ${client.subscription_plan}`,
                quantity: 1,
                unit_price: baseAmount,
                total: baseAmount
              }],
              client_details: {
                name: client.company_name,
                contact: client.contact_name,
                email: client.email,
                address: client.address,
                tax_id: generateRandomCIF()
              },
              created_at: paymentDate,
              updated_at: new Date().toISOString()
            });
          }
        }
      }
    });

    const { error: paymentsError } = await supabase
      .from('payments')
      .upsert(payments);

    if (paymentsError) {
      console.error('❌ Error creating payments:', paymentsError);
      throw paymentsError;
    }
    console.log(`✅ ${payments.length} pagos creados exitosamente`);

    const { error: receiptsError } = await supabase
      .from('receipts')
      .upsert(receipts);

    if (receiptsError) {
      console.error('❌ Error creating receipts:', receiptsError);
      throw receiptsError;
    }
    console.log(`✅ ${receipts.length} recibos creados exitosamente`);

    // 8. Crear logs de auditoría
    console.log('8️⃣ Creando logs de auditoría...');
    const auditLogs = [];
    const actions = ['login', 'logout', 'create', 'update', 'delete', 'upload', 'download', 'payment'];
    const resources = ['client', 'document', 'project', 'company', 'subscription', 'payment'];

    for (let i = 0; i < 200; i++) {
      const user = getRandomElement(users);
      const client = clientsData.find(c => c.user_id === user.id);
      
      auditLogs.push({
        user_id: user.id,
        client_id: client ? client.id : null,
        action: getRandomElement(actions),
        resource: getRandomElement(resources),
        details: {
          ip_address: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          timestamp: new Date().toISOString()
        },
        ip_address: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        created_at: generateRandomDate(30)
      });
    }

    const { error: auditError } = await supabase
      .from('audit_logs')
      .upsert(auditLogs);

    if (auditError) {
      console.error('❌ Error creating audit logs:', auditError);
      throw auditError;
    }
    console.log(`✅ ${auditLogs.length} logs de auditoría creados exitosamente`);

    // 9. Crear KPIs del sistema
    console.log('9️⃣ Creando KPIs del sistema...');
    const kpis = [
      {
        name: 'Total Clientes',
        value: clients.length.toString(),
        change: 23.5,
        trend: 'up',
        period: 'monthly',
        category: 'clients',
        description: 'Total de clientes registrados'
      },
      {
        name: 'Clientes Activos',
        value: clients.filter(c => c.subscription_status === 'active').length.toString(),
        change: 18.2,
        trend: 'up',
        period: 'monthly',
        category: 'clients',
        description: 'Clientes con suscripción activa'
      },
      {
        name: 'Tasa de Retención',
        value: '84%',
        change: 5.7,
        trend: 'up',
        period: 'monthly',
        category: 'clients',
        description: 'Porcentaje de clientes que renuevan'
      },
      {
        name: 'Ingresos Mensuales',
        value: (receipts.reduce((sum, r) => sum + r.amount, 0) / 6).toFixed(0),
        change: 15.3,
        trend: 'up',
        period: 'monthly',
        category: 'financial',
        description: 'Ingresos promedio mensuales'
      },
      {
        name: 'Documentos Procesados',
        value: documents.length.toString(),
        change: 28.9,
        trend: 'up',
        period: 'monthly',
        category: 'documents',
        description: 'Total de documentos procesados'
      },
      {
        name: 'Precisión IA',
        value: '94.2%',
        change: 2.1,
        trend: 'up',
        period: 'monthly',
        category: 'ai',
        description: 'Precisión promedio de clasificación'
      }
    ];

    const { error: kpisError } = await supabase
      .from('kpis')
      .upsert(kpis.map(kpi => ({
        ...kpi,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })));

    if (kpisError) {
      console.error('❌ Error creating KPIs:', kpisError);
      throw kpisError;
    }
    console.log(`✅ ${kpis.length} KPIs creados exitosamente`);

    // 10. Crear pasarelas de pago
    console.log('🔟 Creando pasarelas de pago...');
    const paymentGateways = [
      {
        name: 'Stripe Principal',
        type: 'stripe',
        status: 'active',
        commission_type: 'mixed',
        commission_percentage: 2.9,
        commission_fixed: 0.30,
        api_key: 'pk_test_...',
        secret_key: 'sk_test_...',
        webhook_url: 'https://constructia.com/webhooks/stripe',
        supported_currencies: ['EUR', 'USD'],
        min_amount: 1,
        max_amount: 10000,
        description: 'Pasarela principal para tarjetas de crédito'
      },
      {
        name: 'SEPA Directo',
        type: 'sepa',
        status: 'active',
        commission_type: 'fixed',
        commission_percentage: 0,
        commission_fixed: 0.50,
        supported_currencies: ['EUR'],
        min_amount: 10,
        max_amount: 50000,
        description: 'Domiciliación bancaria SEPA'
      },
      {
        name: 'PayPal Business',
        type: 'paypal',
        status: 'active',
        commission_type: 'percentage',
        commission_percentage: 3.4,
        commission_fixed: 0,
        supported_currencies: ['EUR', 'USD'],
        min_amount: 1,
        max_amount: 5000,
        description: 'Pagos con PayPal'
      },
      {
        name: 'Bizum Empresas',
        type: 'bizum',
        status: 'active',
        commission_type: 'fixed',
        commission_percentage: 0,
        commission_fixed: 0.25,
        supported_currencies: ['EUR'],
        min_amount: 1,
        max_amount: 1000,
        description: 'Pagos instantáneos con Bizum'
      }
    ];

    const { error: gatewaysError } = await supabase
      .from('payment_gateways')
      .upsert(paymentGateways.map(gateway => ({
        ...gateway,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })));

    if (gatewaysError) {
      console.error('❌ Error creating payment gateways:', gatewaysError);
      throw gatewaysError;
    }
    console.log(`✅ ${paymentGateways.length} pasarelas de pago creadas exitosamente`);

    // 11. Verificación final
    console.log('\n🔍 Verificación final...');
    
    const { data: finalClients, error: finalError } = await supabase
      .from('clients')
      .select('*');

    if (finalError) {
      console.error('❌ Error en verificación final:', finalError);
    } else {
      console.log(`✅ Verificación exitosa: ${finalClients?.length || 0} clientes en base de datos`);
      
      // Estadísticas finales
      const activeClients = clientsData?.filter(c => c.subscription_status === 'active').length || 0;
      const enterpriseClients = clientsData?.filter(c => c.subscription_plan === 'enterprise').length || 0;
      const configuredObralia = clientsData?.filter(c => c.obralia_credentials?.configured).length || 0;
      
      console.log('\n📊 Estadísticas finales:');
      console.log(`   - Total clientes: ${clientsData?.length || 0}`);
      console.log(`   - Clientes activos: ${activeClients} (${Math.round(activeClients / (clientsData?.length || 1) * 100)}%)`);
      console.log(`   - Clientes Enterprise: ${enterpriseClients}`);
      console.log(`   - Obralia configurado: ${configuredObralia} (${Math.round(configuredObralia / (clientsData?.length || 1) * 100)}%)`);
      console.log(`   - Total empresas: ${companies.length}`);
      console.log(`   - Total proyectos: ${projects.length}`);
      console.log(`   - Total documentos: ${documents.length}`);
      console.log(`   - Total pagos: ${payments.length}`);
      console.log(`   - Total recibos: ${receipts.length}`);
    }

    console.log('\n🎉 Base de datos poblada exitosamente!');
    console.log('🔧 Todos los KPIs y módulos ahora tienen datos reales');
    console.log('📈 La plataforma está lista para análisis BI completo');

  } catch (error) {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  }
}

populateDatabase();