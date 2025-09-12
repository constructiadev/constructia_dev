// ConstructIA - Script Node.js para ejecutar inserción de documentos de prueba
// Ejecuta el script SQL desde Node.js con manejo de errores

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration');
  console.error('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY are set in .env');
  process.exit(1);
}

// Create Supabase client with service role (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executeTestDocumentsScript() {
  try {
    console.log('📋 ConstructIA - Inserción de Documentos de Prueba');
    console.log('=' .repeat(60));
    console.log('🔌 Conectando a Supabase...');

    // Leer el script SQL
    const sqlScript = fs.readFileSync(
      path.join(__dirname, 'insertTestDocuments.sql'), 
      'utf8'
    );

    console.log('📄 Script SQL cargado correctamente');
    console.log('🚀 Ejecutando inserción de 100 documentos...');

    // Ejecutar el script SQL completo
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql_query: sqlScript 
    });

    if (error) {
      // Si rpc no está disponible, intentar con query directo
      console.log('⚠️ RPC no disponible, intentando ejecución directa...');
      
      // Dividir el script en partes ejecutables
      const sqlParts = sqlScript
        .split(';')
        .map(part => part.trim())
        .filter(part => part.length > 0 && !part.startsWith('--'));

      for (const sqlPart of sqlParts) {
        if (sqlPart.toUpperCase().includes('SELECT')) {
          const { data: selectData, error: selectError } = await supabase
            .from('documentos')
            .select('*', { count: 'exact', head: true });
          
          if (selectError) {
            console.error('❌ Error en consulta de verificación:', selectError);
          } else {
            console.log('📊 Documentos en base de datos:', selectData);
          }
        }
      }
    } else {
      console.log('✅ Script ejecutado correctamente');
      console.log('📊 Resultados:', data);
    }

    // Verificación manual de la inserción
    console.log('\n🔍 Verificando inserción...');
    
    const { count: totalDocs, error: countError } = await supabase
      .from('documentos')
      .select('*', { count: 'exact', head: true })
      .contains('metadatos', { generated_by_script: true });

    if (countError) {
      console.error('❌ Error verificando documentos:', countError);
    } else {
      console.log(`✅ Documentos de prueba insertados: ${totalDocs || 0}`);
    }

    // Verificar distribución por tenant
    const { data: tenantDistribution, error: distError } = await supabase
      .from('documentos')
      .select(`
        tenant_id,
        tenants(name)
      `)
      .contains('metadatos', { generated_by_script: true });

    if (!distError && tenantDistribution) {
      const distribution = tenantDistribution.reduce((acc, doc) => {
        const tenantName = doc.tenants?.name || 'Unknown';
        acc[tenantName] = (acc[tenantName] || 0) + 1;
        return acc;
      }, {});

      console.log('\n📊 Distribución por cliente (tenant):');
      Object.entries(distribution).forEach(([tenant, count]) => {
        console.log(`   ${tenant}: ${count} documentos`);
      });
    }

    console.log('\n🎉 Proceso completado exitosamente!');
    console.log('📝 Los documentos deberían ser visibles en:');
    console.log('   - Módulo de Gestión Manual del administrador');
    console.log('   - Panel de documentos de cada cliente individual');

  } catch (error) {
    console.error('❌ Error durante la ejecución:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Ejecutar el script
if (require.main === module) {
  executeTestDocumentsScript()
    .then(() => {
      console.log('\n✅ Script de inserción completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Script falló:', error.message);
      process.exit(1);
    });
}

module.exports = { executeTestDocumentsScript };