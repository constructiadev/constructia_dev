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

const DEV_TENANT_ID = '00000000-0000-0000-0000-000000000001';

// Document types for construction industry
const documentTypes = [
  'Plan de Seguridad y Salud',
  'Certificado de Aptitud Médica',
  'DNI/NIE Trabajador',
  'Contrato de Trabajo',
  'Seguro de Responsabilidad Civil',
  'Registro de Empresa Acreditada (REA)',
  'Formación en PRL',
  'Evaluación de Riesgos',
  'Certificado de Maquinaria',
  'Licencia de Obras',
  'Proyecto de Ejecución',
  'Estudio de Seguridad',
  'Plan de Gestión de Residuos',
  'Certificado de Calidad',
  'Acta de Replanteo',
  'Control de Calidad',
  'Certificado Final de Obra',
  'Libro de Órdenes',
  'Parte de Accidente',
  'Informe Técnico',
  'Memoria de Calidades',
  'Presupuesto de Obra',
  'Mediciones y Certificaciones',
  'Factura de Materiales',
  'Albarán de Entrega',
  'Certificado de Conformidad',
  'Ensayos de Materiales',
  'Control Geotécnico',
  'Levantamiento Topográfico',
  'Estudio de Impacto Ambiental'
];

const priorities = ['low', 'normal', 'high', 'urgent'];
const statuses = ['queued', 'in_progress', 'uploaded', 'error'];
const platforms = ['nalanda', 'ctaima', 'ecoordina'];

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateRandomFileSize() {
  return Math.floor(Math.random() * 10000000) + 500000; // 0.5MB - 10MB
}

function generateRandomConfidence() {
  return Math.floor(Math.random() * 30) + 70; // 70-100%
}

function generateRandomDate(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  return date.toISOString();
}

async function populateManualQueue() {
  console.log('🚀 Populating manual upload queue with test documents...\n');

  try {
    // 1. Get existing empresas and obras
    console.log('1️⃣ Getting existing empresas and obras...');
    const { data: empresas, error: empresasError } = await supabase
      .from('empresas')
      .select('*')
      .eq('tenant_id', DEV_TENANT_ID);

    if (empresasError) {
      console.error('❌ Error fetching empresas:', empresasError);
      throw empresasError;
    }

    if (!empresas || empresas.length === 0) {
      console.error('❌ No empresas found. Run populateNewArchitecture.js first');
      process.exit(1);
    }

    console.log(`✅ Found ${empresas.length} empresas`);

    const { data: obras, error: obrasError } = await supabase
      .from('obras')
      .select('*')
      .eq('tenant_id', DEV_TENANT_ID);

    if (obrasError) {
      console.error('❌ Error fetching obras:', obrasError);
      throw obrasError;
    }

    if (!obras || obras.length === 0) {
      console.error('❌ No obras found. Run populateNewArchitecture.js first');
      process.exit(1);
    }

    console.log(`✅ Found ${obras.length} obras`);

    // 2. Create platform credentials for each empresa
    console.log('\n2️⃣ Creating platform credentials...');
    const credentialsData = [];

    for (const empresa of empresas) {
      for (const platform of platforms) {
        credentialsData.push({
          tenant_id: DEV_TENANT_ID,
          plataforma: platform,
          alias: `${platform}-${empresa.razon_social.substring(0, 10)}`,
          credenciales: {
            username: `${empresa.razon_social.toLowerCase().replace(/\s+/g, '.')}@${platform}.com`,
            password: `${empresa.cif}${platform}2025!`,
            configured: true,
            empresa_id: empresa.id
          },
          estado: 'ready'
        });
      }
    }

    const { error: credentialsError } = await supabase
      .from('adaptadores')
      .upsert(credentialsData);

    if (credentialsError) {
      console.warn('⚠️ Error creating credentials:', credentialsError.message);
    } else {
      console.log(`✅ Created ${credentialsData.length} platform credentials`);
    }

    // 3. Create documentos in the documentos table first
    console.log('\n3️⃣ Creating documentos...');
    const documentosData = [];

    for (let i = 0; i < 150; i++) {
      const empresa = getRandomElement(empresas);
      const obra = obras.find(o => o.empresa_id === empresa.id) || getRandomElement(obras);
      const docType = getRandomElement(documentTypes);
      const fileExtension = Math.random() > 0.8 ? 'jpg' : 'pdf';
      const fileName = `${docType.toLowerCase().replace(/\s+/g, '_')}_${empresa.id.substring(0, 8)}_${i + 1}.${fileExtension}`;
      
      documentosData.push({
        tenant_id: DEV_TENANT_ID,
        entidad_tipo: 'obra',
        entidad_id: obra.id,
        categoria: 'OTROS',
        file: `${DEV_TENANT_ID}/obra/${obra.id}/OTROS/${fileName}`,
        mime: fileExtension === 'pdf' ? 'application/pdf' : 'image/jpeg',
        size_bytes: generateRandomFileSize(),
        hash_sha256: `hash_${empresa.id}_${obra.id}_${i}_${Math.random().toString(36).substr(2, 9)}`,
        version: 1,
        estado: 'pendiente',
        metadatos: {
          original_filename: fileName,
          ai_extraction: {
            categoria_probable: 'OTROS',
            confianza: generateRandomConfidence() / 100
          }
        },
        origen: 'usuario',
        sensible: Math.random() > 0.7,
        created_at: generateRandomDate(30)
      });
    }

    const { data: createdDocumentos, error: documentosError } = await supabase
      .from('documentos')
      .upsert(documentosData)
      .select();

    if (documentosError) {
      console.error('❌ Error creating documentos:', documentosError);
      throw documentosError;
    }

    console.log(`✅ Created ${createdDocumentos.length} documentos`);

    // 4. Create manual upload queue entries
    console.log('\n4️⃣ Creating manual upload queue entries...');
    const queueData = [];

    for (let i = 0; i < createdDocumentos.length; i++) {
      const documento = createdDocumentos[i];
      const obra = obras.find(o => o.id === documento.entidad_id);
      const empresa = empresas.find(e => e.id === obra?.empresa_id);
      
      if (!obra || !empresa) continue;

      queueData.push({
        tenant_id: DEV_TENANT_ID,
        empresa_id: empresa.id,
        obra_id: obra.id,
        documento_id: documento.id,
        status: getRandomElement(statuses),
        nota: `Documento ${documento.metadatos?.original_filename || 'documento'} - ${getRandomElement(documentTypes)}`
      });
    }

    const { error: queueError } = await supabase
      .from('manual_upload_queue')
      .upsert(queueData);

    if (queueError) {
      console.error('❌ Error creating queue entries:', queueError);
      throw queueError;
    }

    console.log(`✅ Created ${queueData.length} queue entries`);

    // 5. Verification
    console.log('\n5️⃣ Verification...');
    
    const { count: totalQueue } = await supabase
      .from('manual_upload_queue')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', DEV_TENANT_ID);

    const { count: totalDocumentos } = await supabase
      .from('documentos')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', DEV_TENANT_ID);

    const { count: totalAdaptadores } = await supabase
      .from('adaptadores')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', DEV_TENANT_ID);

    console.log('\n📊 Final Statistics:');
    console.log(`   - Queue entries: ${totalQueue || 0}`);
    console.log(`   - Total documentos: ${totalDocumentos || 0}`);
    console.log(`   - Platform credentials: ${totalAdaptadores || 0}`);
    console.log(`   - Empresas: ${empresas.length}`);
    console.log(`   - Obras: ${obras.length}`);

    // 6. Test queue access
    console.log('\n6️⃣ Testing queue access...');
    const { data: queueTest, error: queueTestError } = await supabase
      .from('manual_upload_queue')
      .select('*')
      .eq('tenant_id', DEV_TENANT_ID)
      .limit(5);

    if (queueTestError) {
      console.error('❌ Queue access test failed:', queueTestError);
    } else {
      console.log(`✅ Queue access test passed. Found ${queueTest?.length || 0} entries`);
    }

    console.log('\n🎉 Manual queue population completed successfully!');
    console.log('🔧 The manual management module should now show populated data');
    console.log('📋 Administrators can now test the full workflow');

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

populateManualQueue();