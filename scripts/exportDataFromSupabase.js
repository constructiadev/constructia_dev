/**
 * SCRIPT: Exportar Datos desde Supabase
 *
 * Este script exporta todos los datos de tu base de datos Supabase
 * para poder importarlos posteriormente en Bolt Database.
 *
 * INSTRUCCIONES:
 * 1. Asegúrate de que tu .env tenga las credenciales de Supabase
 * 2. Ejecuta: node scripts/exportDataFromSupabase.js
 * 3. Los datos se guardarán en: exports/supabase-backup-[fecha].json
 * 4. Usa estos datos con el script importDataToBolt.js
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ ERROR: Faltan credenciales de Supabase en .env');
  console.error('   Asegúrate de tener VITE_SUPABASE_URL y VITE_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Tablas a exportar en orden (respetando dependencias)
const TABLES_TO_EXPORT = [
  'tenants',
  'empresas',
  'obras',
  'proveedores',
  'trabajadores',
  'maquinaria',
  'documentos',
  'tareas',
  'requisitos_plataforma',
  'mapping_templates',
  'adaptadores',
  'jobs_integracion',
  'suscripciones',
  'auditoria',
  'mensajes',
  'reportes',
  'token_transactions',
  'checkout_providers',
  'mandatos_sepa',
  'system_configurations',
  'compliance_checks',
  'data_subject_requests',
  'privacy_impact_assessments',
  'data_breaches',
  'consent_records'
];

async function exportTable(tableName) {
  console.log(`\n📦 Exportando tabla: ${tableName}`);

  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*');

    if (error) {
      if (error.message.includes('does not exist')) {
        console.log(`   ⚠️  Tabla ${tableName} no existe en Supabase - omitiendo`);
        return { table: tableName, rows: [], status: 'not_found' };
      }
      throw error;
    }

    console.log(`   ✅ ${data.length} registros exportados`);
    return { table: tableName, rows: data, status: 'success' };

  } catch (error) {
    console.error(`   ❌ Error exportando ${tableName}:`, error.message);
    return { table: tableName, rows: [], status: 'error', error: error.message };
  }
}

async function exportAllData() {
  console.log('🚀 INICIANDO EXPORTACIÓN DE DATOS DE SUPABASE');
  console.log('='.repeat(60));

  const exportData = {
    exportDate: new Date().toISOString(),
    sourceDatabase: 'Supabase',
    sourceUrl: SUPABASE_URL,
    tables: []
  };

  for (const tableName of TABLES_TO_EXPORT) {
    const tableData = await exportTable(tableName);
    exportData.tables.push(tableData);
  }

  // Crear directorio exports si no existe
  const exportsDir = path.join(process.cwd(), 'exports');
  if (!fs.existsSync(exportsDir)) {
    fs.mkdirSync(exportsDir, { recursive: true });
  }

  // Guardar archivo con timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const filename = `supabase-backup-${timestamp}.json`;
  const filepath = path.join(exportsDir, filename);

  fs.writeFileSync(filepath, JSON.stringify(exportData, null, 2), 'utf8');

  console.log('\n' + '='.repeat(60));
  console.log('✅ EXPORTACIÓN COMPLETADA');
  console.log('='.repeat(60));

  // Resumen
  const totalRows = exportData.tables.reduce((sum, t) => sum + t.rows.length, 0);
  const successTables = exportData.tables.filter(t => t.status === 'success').length;
  const notFoundTables = exportData.tables.filter(t => t.status === 'not_found').length;
  const errorTables = exportData.tables.filter(t => t.status === 'error').length;

  console.log(`\n📊 RESUMEN:`);
  console.log(`   Total de tablas procesadas: ${TABLES_TO_EXPORT.length}`);
  console.log(`   ✅ Exportadas exitosamente: ${successTables}`);
  console.log(`   ⚠️  No encontradas: ${notFoundTables}`);
  console.log(`   ❌ Con errores: ${errorTables}`);
  console.log(`   📝 Total de registros: ${totalRows}`);
  console.log(`\n💾 Archivo guardado en: ${filepath}`);
  console.log(`\n📌 PRÓXIMO PASO:`);
  console.log(`   Usa este archivo con: node scripts/importDataToBolt.js`);
  console.log('='.repeat(60));
}

// Ejecutar exportación
exportAllData().catch(error => {
  console.error('\n❌ ERROR FATAL:', error);
  process.exit(1);
});
