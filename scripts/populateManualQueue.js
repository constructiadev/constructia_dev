import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { Buffer } from 'buffer';

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
    // 1. Disable RLS for development
    console.log('1️⃣ Disabling RLS for development...');
    const tables = [
      'manual_upload_queue',
      'empresas',
      'obras',
      'documentos',
      'adaptadores',
      'users',
      'tenants'
    ];

    for (const table of tables) {
      try {
        const { error } = await supabase.rpc('exec_sql', {
          sql: `ALTER TABLE public.${table} DISABLE ROW LEVEL SECURITY;`
        });

        if (error) {
          console.warn(`⚠️ Could not disable RLS for ${table}: ${error.message}`);
        } else {
          console.log(`✅ RLS disabled for ${table}`);
        }
      } catch (e) {
        console.warn(`⚠️ Error with table ${table}:`, e.message);
      }
    }

    // 2. Get existing empresas and obras
    console.log('\n2️⃣ Getting existing empresas and obras...');
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

    // 3. Create platform credentials for each empresa
    console.log('\n3️⃣ Creating platform credentials...');
    const credentialsData = [];

    for (const empresa of empresas) {
      for (const platform of platforms) {
        credentialsData.push({
          tenant_id: DEV_TENANT_ID,
          plataforma: platform,
          alias: `${platform}-${empresa.razon_social.substring(0, 10)}`,
          credenciales: {
            username: platform === 'nalanda' ? `${empresa.razon_social.toLowerCase().replace(/\s+/g, '.')}@nalandaglobal.com` :
                     platform === 'ctaima' ? `${empresa.razon_social.toLowerCase().replace(/\s+/g, '.')}@ctaima.com` :
                     platform === 'ecoordina' ? `${empresa.razon_social.toLowerCase().replace(/\s+/g, '.')}@welcometotwind.io` :
                     `${empresa.razon_social.toLowerCase().replace(/\s+/g, '.')}@${platform}.com`,
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

    // 4. Create documentos with actual files in storage
    console.log('\n4️⃣ Creating documentos with actual files...');
    const documentosData = [];
    const uploadPromises = [];

    for (let i = 0; i < 150; i++) {
      const empresa = getRandomElement(empresas);
      const obra = obras.find(o => o.empresa_id === empresa.id) || getRandomElement(obras);
      const docType = getRandomElement(documentTypes);
      const fileExtension = Math.random() > 0.8 ? 'jpg' : 'pdf';
      const fileName = `${docType.toLowerCase().replace(/\s+/g, '_')}_${i + 1}.${fileExtension}`;
      const filePath = `${DEV_TENANT_ID}/obra/${obra.id}/OTROS/${fileName}`;
      
      // Create dummy file content
      const dummyContent = fileExtension === 'pdf' 
        ? `%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000074 00000 n \n0000000120 00000 n \ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n178\n%%EOF`
        : 'dummy image content for testing';
      
      const fileBuffer = Buffer.from(dummyContent, 'utf-8');
      
      // Upload file to storage
      const uploadPromise = supabase.storage
        .from('UPLOADDOCUMENTS')
        .upload(filePath, fileBuffer, {
          contentType: fileExtension === 'pdf' ? 'application/pdf' : 'image/jpeg',
          upsert: true
        });
      
      uploadPromises.push(uploadPromise);
      
      documentosData.push({
        tenant_id: DEV_TENANT_ID,
        entidad_tipo: 'obra',
        entidad_id: obra.id,
        categoria: 'OTROS',
        file: filePath,
        mime: fileExtension === 'pdf' ? 'application/pdf' : 'image/jpeg',
        size_bytes: generateRandomFileSize(),
        hash_sha256: `hash_${Date.now()}_${i}`,
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

    // Wait for all file uploads to complete
    console.log('📁 Uploading dummy files to storage...');
    const uploadResults = await Promise.allSettled(uploadPromises);
    const successfulUploads = uploadResults.filter(result => result.status === 'fulfilled').length;
    const failedUploads = uploadResults.filter(result => result.status === 'rejected').length;
    
    console.log(`✅ Uploaded ${successfulUploads} files successfully`);
    if (failedUploads > 0) console.log(`⚠️ Failed to upload ${failedUploads} files`);

    const { data: createdDocumentos, error: documentosError } = await supabase
      .from('documentos')
      .upsert(documentosData)
      .select();

    if (documentosError) {
      console.error('❌ Error creating documentos:', documentosError);
      throw documentosError;
    }

    console.log(`✅ Created ${createdDocumentos.length} documentos with actual files`);

    // 5. Create manual upload queue entries
    console.log('\n5️⃣ Creating manual upload queue entries...');
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

    // 6. Verification
    console.log('\n6️⃣ Verification...');
    
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

    // 7. Test queue access
    console.log('\n7️⃣ Testing queue access...');
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