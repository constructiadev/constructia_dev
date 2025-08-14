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

const documentTypes = [
  'Certificado de Obra', 'Factura de Materiales', 'Contrato de Construcción', 
  'Plano Arquitectónico', 'Memoria Técnica', 'Presupuesto Detallado',
  'Licencia de Obras', 'Permiso Municipal', 'Informe Técnico', 
  'Acta de Recepción', 'Registro de Calidad', 'Autorización Ambiental',
  'Certificado Energético', 'Estudio Geotécnico', 'Plan de Seguridad',
  'Medición de Obra', 'Valoración Inmobiliaria', 'Seguro de Obra',
  'Nómina de Personal', 'Parte de Trabajo', 'Control de Calidad',
  'Inspección Técnica', 'Certificado de Materiales', 'Orden de Trabajo',
  'Albarán de Entrega', 'Factura de Servicios', 'Contrato de Alquiler',
  'Póliza de Seguro', 'Certificado de Conformidad', 'Acta de Replanteo'
];

const priorities = ['low', 'normal', 'high', 'urgent'];
const manualStatuses = ['pending', 'in_progress', 'uploaded', 'validated', 'error', 'corrupted'];

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateRandomDate(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  return date.toISOString();
}

async function injectDocumentsToQueue() {
  console.log('🚀 Inyectando 30 documentos en la cola de procesamiento manual...\n');

  try {
    // 1. Obtener clientes, empresas y proyectos existentes
    console.log('1️⃣ Obteniendo datos existentes...');
    
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id, company_name, contact_name')
      .eq('subscription_status', 'active');

    if (clientsError || !clients || clients.length === 0) {
      throw new Error('No se encontraron clientes activos');
    }

    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name, client_id')
      .in('client_id', clients.map(c => c.id));

    if (companiesError) {
      throw new Error(`Error obteniendo empresas: ${companiesError.message}`);
    }

    // Si no hay empresas, crear algunas automáticamente
    if (!companies || companies.length === 0) {
      console.log('⚠️ No se encontraron empresas, creando empresas de ejemplo...');
      
      const newCompanies = clients.slice(0, 5).map(client => ({
        client_id: client.id,
        name: client.company_name,
        cif: `B${Math.floor(Math.random() * 90000000) + 10000000}`,
        address: `Calle Ejemplo ${Math.floor(Math.random() * 999) + 1}, Madrid`,
        phone: `+34 ${Math.floor(Math.random() * 900) + 600} ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 900) + 100}`,
        email: `contacto@${client.company_name.toLowerCase().replace(/\s+/g, '')}.com`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { data: createdCompanies, error: createError } = await supabase
        .from('companies')
        .insert(newCompanies)
        .select();

      if (createError) {
        throw new Error(`Error creando empresas: ${createError.message}`);
      }

      companies = createdCompanies;
      console.log(`✅ ${companies.length} empresas creadas automáticamente`);
    }

    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, name, company_id, client_id')
      .in('client_id', clients.map(c => c.id));

    if (projectsError) {
      throw new Error(`Error obteniendo proyectos: ${projectsError.message}`);
    }

    // Si no hay proyectos, crear algunos automáticamente
    if (!projects || projects.length === 0) {
      console.log('⚠️ No se encontraron proyectos, creando proyectos de ejemplo...');
      
      const newProjects = companies.map((company, index) => ({
        company_id: company.id,
        client_id: company.client_id,
        name: `Proyecto ${index + 1} - ${company.name}`,
        description: `Proyecto de construcción para ${company.name}`,
        status: 'active',
        progress: Math.floor(Math.random() * 80) + 10,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        budget: Math.floor(Math.random() * 500000) + 50000,
        location: 'Madrid, España',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { data: createdProjects, error: createProjectsError } = await supabase
        .from('projects')
        .insert(newProjects)
        .select();

      if (createProjectsError) {
        throw new Error(`Error creando proyectos: ${createProjectsError.message}`);
      }

      projects = createdProjects;
      console.log(`✅ ${projects.length} proyectos creados automáticamente`);
    }

    console.log(`✅ Datos obtenidos: ${clients.length} clientes, ${companies.length} empresas, ${projects.length} proyectos`);

    // 2. Crear 30 documentos distribuidos
    console.log('2️⃣ Creando 30 documentos...');
    const documents = [];

    for (let i = 0; i < 30; i++) {
      const client = getRandomElement(clients);
      const clientCompanies = companies.filter(c => c.client_id === client.id);
      const company = getRandomElement(clientCompanies);
      const companyProjects = projects.filter(p => p.company_id === company.id);
      const project = getRandomElement(companyProjects);
      
      const docType = getRandomElement(documentTypes);
      const fileSize = Math.floor(Math.random() * 5000000) + 100000; // 100KB - 5MB
      
      documents.push({
        project_id: project.id,
        client_id: client.id,
        filename: `${docType.toLowerCase().replace(/\s+/g, '_')}_${i + 1}_${Date.now()}.pdf`,
        original_name: `${docType} - ${project.name} (${i + 1}).pdf`,
        file_size: fileSize,
        file_type: 'application/pdf',
        document_type: docType,
        classification_confidence: Math.floor(Math.random() * 30) + 70, // 70-100%
        ai_metadata: {
          processing_time: Math.floor(Math.random() * 5000) + 1000,
          model_version: 'gemini-pro-v1.5',
          confidence_score: Math.floor(Math.random() * 30) + 70
        },
        upload_status: 'classified', // Listos para subir a Obralia
        obralia_status: 'pending',
        security_scan_status: 'safe',
        processing_attempts: 1,
        created_at: generateRandomDate(30),
        updated_at: new Date().toISOString()
      });
    }

    const { data: documentsData, error: documentsError } = await supabase
      .from('documents')
      .upsert(documents)
      .select();

    if (documentsError) {
      throw new Error(`Error creating documents: ${documentsError.message}`);
    }

    console.log(`✅ ${documents.length} documentos creados exitosamente`);

    // 3. Crear entradas en la cola manual
    console.log('3️⃣ Agregando documentos a la cola manual...');
    const queueEntries = [];

    documentsData.forEach((doc, index) => {
      const project = projects.find(p => p.id === doc.project_id);
      const company = companies.find(c => c.id === project?.company_id);
      const client = clients.find(c => c.id === doc.client_id);
      
      queueEntries.push({
        document_id: doc.id,
        client_id: doc.client_id,
        company_id: company?.id,
        project_id: doc.project_id,
        queue_position: index + 1,
        priority: getRandomElement(priorities),
        manual_status: getRandomElement(manualStatuses),
        ai_analysis: {
          document_type: doc.document_type,
          confidence: doc.classification_confidence,
          processing_time: Math.floor(Math.random() * 5000) + 1000,
          recommendations: [
            'Verificar datos del cliente',
            'Confirmar clasificación automática',
            'Revisar metadatos del documento'
          ]
        },
        admin_notes: '',
        corruption_detected: Math.random() < 0.05, // 5% de documentos con posibles problemas
        file_integrity_score: Math.floor(Math.random() * 20) + 80, // 80-100%
        retry_count: Math.floor(Math.random() * 3),
        estimated_processing_time: `00:0${Math.floor(Math.random() * 5) + 2}:00`,
        created_at: generateRandomDate(15),
        updated_at: new Date().toISOString()
      });
    });

    const { error: queueError } = await supabase
      .from('manual_document_queue')
      .upsert(queueEntries);

    if (queueError) {
      throw new Error(`Error adding documents to queue: ${queueError.message}`);
    }

    console.log(`✅ ${queueEntries.length} documentos agregados a la cola manual`);

    // 4. Verificación final
    console.log('4️⃣ Verificación final...');
    
    const { data: queueData, error: verifyError } = await supabase
      .from('manual_document_queue')
      .select(`
        *,
        documents(filename, original_name, document_type),
        clients(company_name, contact_name),
        companies(name),
        projects(name)
      `)
      .order('queue_position', { ascending: true });

    if (verifyError) {
      throw new Error(`Error verifying queue: ${verifyError.message}`);
    }

    console.log(`✅ Cola verificada: ${queueData?.length || 0} documentos en cola`);

    // Estadísticas por cliente
    const clientStats = {};
    queueData?.forEach(item => {
      const clientName = item.clients?.company_name || 'Cliente desconocido';
      if (!clientStats[clientName]) {
        clientStats[clientName] = {
          documents: 0,
          companies: new Set(),
          projects: new Set()
        };
      }
      clientStats[clientName].documents++;
      if (item.companies?.name) clientStats[clientName].companies.add(item.companies.name);
      if (item.projects?.name) clientStats[clientName].projects.add(item.projects.name);
    });

    console.log('\n📊 Estadísticas de la cola:');
    Object.entries(clientStats).forEach(([clientName, stats]) => {
      console.log(`   - ${clientName}:`);
      console.log(`     • ${stats.documents} documentos`);
      console.log(`     • ${stats.companies.size} empresas`);
      console.log(`     • ${stats.projects.size} proyectos`);
    });

    console.log('\n🎉 Cola de documentos poblada exitosamente!');
    console.log('📋 Los documentos están listos para procesamiento manual por el administrador');
    console.log('🔧 El administrador puede ahora gestionar la cola desde el módulo de Gestión Manual');

  } catch (error) {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  }
}

injectDocumentsToQueue();