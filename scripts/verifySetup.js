import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

console.log('\n🔍 ConstructIA - Verificación de Configuración\n');
console.log('='.repeat(60));

// Step 1: Check environment variables
console.log('\n📋 PASO 1: Verificando variables de entorno...\n');

let hasErrors = false;

if (!supabaseUrl || supabaseUrl === 'https://YOUR_PROJECT_ID.supabase.co') {
  console.log('❌ VITE_SUPABASE_URL no está configurada');
  console.log('   → Abre el archivo .env y reemplaza con tu URL real');
  hasErrors = true;
} else if (!supabaseUrl.includes('.supabase.co')) {
  console.log('❌ VITE_SUPABASE_URL tiene formato inválido');
  console.log('   → Debe ser: https://[project-id].supabase.co');
  hasErrors = true;
} else {
  console.log('✅ VITE_SUPABASE_URL configurada correctamente');
  console.log(`   ${supabaseUrl}`);
}

if (!supabaseAnonKey || supabaseAnonKey === 'YOUR_ANON_KEY_HERE') {
  console.log('❌ VITE_SUPABASE_ANON_KEY no está configurada');
  console.log('   → Abre el archivo .env y pega tu anon key de Supabase');
  hasErrors = true;
} else if (supabaseAnonKey.length < 100) {
  console.log('❌ VITE_SUPABASE_ANON_KEY parece inválida (muy corta)');
  console.log('   → Verifica que copiaste la key completa');
  hasErrors = true;
} else {
  console.log('✅ VITE_SUPABASE_ANON_KEY configurada');
  console.log(`   ${supabaseAnonKey.substring(0, 50)}...`);
}

if (!supabaseServiceKey || supabaseServiceKey === 'YOUR_SERVICE_ROLE_KEY_HERE') {
  console.log('❌ VITE_SUPABASE_SERVICE_ROLE_KEY no está configurada');
  console.log('   → Abre el archivo .env y pega tu service_role key');
  hasErrors = true;
} else if (supabaseServiceKey.length < 100) {
  console.log('❌ VITE_SUPABASE_SERVICE_ROLE_KEY parece inválida (muy corta)');
  console.log('   → Verifica que copiaste la key completa');
  hasErrors = true;
} else {
  console.log('✅ VITE_SUPABASE_SERVICE_ROLE_KEY configurada');
  console.log(`   ${supabaseServiceKey.substring(0, 50)}...`);
}

if (hasErrors) {
  console.log('\n❌ Configuración incompleta. Por favor:');
  console.log('   1. Abre el archivo .env en la raíz del proyecto');
  console.log('   2. Reemplaza los valores con tus credenciales de Supabase');
  console.log('   3. Guarda el archivo');
  console.log('   4. REINICIA el servidor (Ctrl+C → npm run dev)');
  console.log('   5. Ejecuta este script de nuevo: node scripts/verifySetup.js\n');
  process.exit(1);
}

console.log('\n='.repeat(60));

// Step 2: Test connection
console.log('\n📡 PASO 2: Probando conexión a Supabase...\n');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

try {
  // Try a simple query
  const { data, error } = await supabase
    .from('tenants')
    .select('count', { count: 'exact', head: true });

  if (error) {
    if (error.message.includes('relation') || error.message.includes('does not exist')) {
      console.log('⚠️  Conexión OK, pero la base de datos está vacía');
      console.log('   → Necesitas ejecutar el script SQL en Supabase:');
      console.log('   1. Ve a https://supabase.com/dashboard');
      console.log('   2. Abre SQL Editor');
      console.log('   3. Copia el contenido de database-schema-complete.sql');
      console.log('   4. Pégalo en el editor y haz clic en Run');
      console.log('   5. Espera a que termine (10-30 segundos)');
      console.log('   6. Ejecuta este script de nuevo\n');
      process.exit(1);
    } else if (error.message.includes('Failed to fetch') || error.message.includes('fetch failed')) {
      console.log('❌ No se puede conectar a Supabase');
      console.log('   → Posibles causas:');
      console.log('   1. La URL es incorrecta');
      console.log('   2. El proyecto no existe o está pausado');
      console.log('   3. Problema de red/firewall');
      console.log('   → Verifica en https://supabase.com/dashboard que:');
      console.log('   - El proyecto existe');
      console.log('   - El proyecto está "Active" (no "Paused")');
      console.log('   - La URL coincide con la del proyecto\n');
      process.exit(1);
    } else {
      console.log('❌ Error de conexión:', error.message);
      console.log('   → Verifica tus credenciales en el archivo .env\n');
      process.exit(1);
    }
  }

  console.log('✅ Conexión a Supabase exitosa');

} catch (err) {
  console.log('❌ Error al conectar:', err.message);
  console.log('   → Verifica tu conexión a internet');
  console.log('   → Verifica que el proyecto existe en Supabase\n');
  process.exit(1);
}

console.log('\n='.repeat(60));

// Step 3: Check database schema
console.log('\n📊 PASO 3: Verificando tablas de base de datos...\n');

const requiredTables = [
  'tenants',
  'users',
  'clients',
  'empresas',
  'obras',
  'documentos',
  'proveedores',
  'trabajadores',
  'maquinaria',
  'adaptadores',
  'suscripciones',
  'auditoria'
];

let missingTables = [];

for (const table of requiredTables) {
  try {
    const { error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (error && (error.message.includes('relation') || error.message.includes('does not exist'))) {
      console.log(`❌ ${table} - NO EXISTE`);
      missingTables.push(table);
    } else if (error) {
      console.log(`⚠️  ${table} - Error: ${error.message}`);
    } else {
      console.log(`✅ ${table} - OK`);
    }
  } catch (err) {
    console.log(`❌ ${table} - Error al verificar`);
    missingTables.push(table);
  }
}

if (missingTables.length > 0) {
  console.log(`\n❌ Faltan ${missingTables.length} tablas en la base de datos`);
  console.log('\n🔧 SOLUCIÓN:');
  console.log('   1. Ve a https://supabase.com/dashboard');
  console.log('   2. Selecciona tu proyecto');
  console.log('   3. Ve a SQL Editor (📝 en el menú lateral)');
  console.log('   4. Haz clic en "New query"');
  console.log('   5. Abre database-schema-complete.sql de este proyecto');
  console.log('   6. Copia TODO el contenido y pégalo en el editor');
  console.log('   7. Haz clic en "Run" (botón verde)');
  console.log('   8. Espera a que termine (10-30 segundos)');
  console.log('   9. Ejecuta este script de nuevo\n');
  process.exit(1);
}

console.log('\n✅ Todas las tablas necesarias existen');

console.log('\n='.repeat(60));

// Step 4: Check for initial data
console.log('\n👥 PASO 4: Verificando datos iniciales...\n');

try {
  const { data: tenants, error: tenantsError } = await supabase
    .from('tenants')
    .select('id, name, status');

  if (tenantsError) {
    console.log('⚠️  No se pudo verificar tenants:', tenantsError.message);
  } else if (!tenants || tenants.length === 0) {
    console.log('⚠️  No hay tenants en la base de datos');
    console.log('   → Esto es normal en una instalación nueva');
    console.log('   → El primer tenant se creará al registrar el primer usuario');
  } else {
    console.log(`✅ Encontrados ${tenants.length} tenant(s):`);
    tenants.forEach(tenant => {
      console.log(`   - ${tenant.name} (${tenant.status})`);
    });
  }

  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, email, role');

  if (usersError) {
    console.log('⚠️  No se pudo verificar users:', usersError.message);
  } else if (!users || users.length === 0) {
    console.log('⚠️  No hay usuarios en la base de datos');
    console.log('   → Esto es normal en una instalación nueva');
    console.log('   → Usa las credenciales demo para crear el primer usuario:');
    console.log('   → Email: demo@construcciones.com');
    console.log('   → Password: password123');
  } else {
    console.log(`✅ Encontrados ${users.length} usuario(s):`);
    users.slice(0, 5).forEach(user => {
      console.log(`   - ${user.email} (${user.role})`);
    });
    if (users.length > 5) {
      console.log(`   ... y ${users.length - 5} más`);
    }
  }

} catch (err) {
  console.log('⚠️  Error al verificar datos:', err.message);
}

console.log('\n='.repeat(60));
console.log('\n🎉 ¡VERIFICACIÓN COMPLETADA!\n');
console.log('Tu configuración de ConstructIA está lista para usar.\n');
console.log('Próximos pasos:');
console.log('   1. Inicia el servidor: npm run dev');
console.log('   2. Abre http://localhost:5173 en tu navegador');
console.log('   3. Haz clic en "Acceso Cliente"');
console.log('   4. Usa las credenciales demo o regístrate:');
console.log('      - Email: demo@construcciones.com');
console.log('      - Password: password123\n');
console.log('¡Disfruta de ConstructIA! 🚀\n');
