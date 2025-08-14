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
    // 1. Verificar conexión a Supabase
    console.log('1️⃣ Verificando conexión a Supabase...');
    
    const { data: testConnection, error: connectionError } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (connectionError) {
      console.error('❌ Error de conexión a Supabase:', connectionError.message);
      console.log('\n🔧 Posibles soluciones:');
      console.log('   1. Verifica que VITE_SUPABASE_URL esté configurado correctamente');
      console.log('   2. Verifica que VITE_SUPABASE_SERVICE_ROLE_KEY sea válido');
      console.log('   3. Asegúrate de que RLS esté deshabilitado para desarrollo');
      throw new Error(`Conexión a Supabase fallida: ${connectionError.message}`);
    }
    
    console.log('✅ Conexión a Supabase exitosa');

    // 2. Obtener clientes existentes
    console.log('2️⃣ Obteniendo clientes existentes...');
    
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id, company_name, contact_name, subscription_status');

    if (clientsError) {
      throw new Error(`Error obteniendo clientes: ${clientsError.message}`);
    }
    
    if (!clients || clients.length === 0) {
      console.log('⚠️ No se encontraron clientes. Ejecutando script de población primero...');
      console.log('   Ejecuta: node scripts/populateDatabase.js');
      throw new Error('No hay clientes en la base de datos. Ejecuta el script de población primero.');
    }
    
    console.log(`✅ ${clients.length} clientes encontrados`);

    // 3. Obtener o crear empresas
    console.log('3️⃣ Obteniendo empresas...');
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name, client_id')
      .in('client_id', clients.map(c => c.id));

    if (companiesError) {
      throw new Error(`Error obteniendo empresas: ${companiesError.message}`);
    }

    let finalCompanies = companies || [];
    
    // Si hay pocos empresas, crear más automáticamente
    if (finalCompanies.length < 5) {
      console.log(`⚠️ Solo ${finalCompanies.length} empresas encontradas, creando más empresas de ejemplo...`);
      
      const clientsNeedingCompanies = clients.filter(client => 
        !finalCompanies.some(company => company.client_id === client.id)
      ).slice(0, 10);
      
      const newCompanies = clientsNeedingCompanies.map(client => ({
        client_id: client.id,
        name: client.company_name,
        cif: `B${Math.floor(Math.random() * 90000000) + 10000000}`,
        address: `Calle Ejemplo ${Math.floor(Math.random() * 999) + 1}, Madrid`,
        phone: `+34 ${Math.floor(Math.random() * 900) + 600} ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 900) + 100}`,
        email: `contacto@${client.company_name.toLowerCase().replace(/\s+/g, '')}.com`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      if (newCompanies.length > 0) {
        const { data: createdCompanies, error: createError } = await supabase
          .from('companies')
          .insert(newCompanies)
          .select();

        if (createError) {
          console.warn(`⚠️ Error creando empresas: ${createError.message}`);
        } else {
          finalCompanies = [...finalCompanies, ...createdCompanies];
          console.log(`✅ ${createdCompanies.length} empresas creadas automáticamente`);
        }
      }
    }

    if (finalCompanies.length === 0) {
      throw new Error('No se pudieron obtener o crear empresas');
    }

    console.log(`✅ ${finalCompanies.length} empresas disponibles`);

    // 4. Obtener o crear proyectos
    console.log('4️⃣ Obteniendo proyectos...');
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, name, company_id, client_id')
      .in('client_id', clients.map(c => c.id));

    if (projectsError) {
      throw new Error(`Error obteniendo proyectos: ${projectsError.message}`);
    }

    let finalProjects = projects || [];
    
    // Si hay pocos proyectos, crear más automáticamente
    if (finalProjects.length < 10) {
      console.log(`⚠️ Solo ${finalProjects.length} proyectos encontrados, creando más proyectos de ejemplo...`);
      
      const newProjects = finalCompanies.slice(0, 15).map((company, index) => ({
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

      if (newProjects.length > 0) {
        const { data: createdProjects, error: createProjectsError } = await supabase
          .from('projects')
          .insert(newProjects)
          .select();

        if (createProjectsError) {
          console.warn(`⚠️ Error creando proyectos: ${createProjectsError.message}`);
        } else {
          finalProjects = [...finalProjects, ...createdProjects];
          console.log(`✅ ${createdProjects.length} proyectos creados automáticamente`);
        }
      }
    }

    if (finalProjects.length === 0) {
      throw new Error('No se pudieron obtener o crear proyectos');
    }

    console.log(`✅ ${finalProjects.length} proyectos disponibles`);
    console.log(`📊 Resumen: ${clients.length} clientes, ${finalCompanies.length} empresas, ${finalProjects.length} proyectos`);

    // 5. Crear 30 documentos distribuidos
    console.log('5️⃣ Creando 30 documentos...');
    const documents = [];

    for (let i = 0; i < 30; i++) {
      const client = getRandomElement(clients);
      const clientCompanies = finalCompanies.filter(c => c.client_id === client.id);
      const company = getRandomElement(clientCompanies);
      const companyProjects = finalProjects.filter(p => p.company_id === company.id);
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

    // 6. Crear entradas en la cola manual
    console.log('6️⃣ Agregando documentos a la cola manual...');
    const queueEntries = [];

    documentsData.forEach((doc, index) => {
      const project = finalProjects.find(p => p.id === doc.project_id);
      const company = finalCompanies.find(c => c.id === project?.company_id);
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

    // 7. Verificación final
    console.log('7️⃣ Verificación final...');
    
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
    console.error('❌ Error fatal:', error.message);
    console.log('\n🔧 Diagnóstico:');
    console.log('   1. Verifica que el archivo .env tenga las variables correctas');
    console.log('   2. Asegúrate de que VITE_SUPABASE_SERVICE_ROLE_KEY sea válido');
    console.log('   3. Ejecuta primero: node scripts/populateDatabase.js');
    console.log('   4. Verifica que RLS esté deshabilitado: node scripts/disableAllRLS.js');
    process.exit(1);
  }
}

injectDocumentsToQueue();