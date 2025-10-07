import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Checking Supabase configuration...');
console.log('URL:', supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'MISSING');
console.log('Service Key:', supabaseServiceKey ? 'SET' : 'MISSING');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDatabase() {
  try {
    console.log('\n📋 Checking database tables...');

    // Check for main tables
    const tables = [
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
      'suscripciones'
    ];

    const results = {};

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });

        if (error) {
          results[table] = { exists: false, error: error.message };
        } else {
          results[table] = { exists: true, count: data?.length || 0 };
        }
      } catch (err) {
        results[table] = { exists: false, error: err.message };
      }
    }

    console.log('\n📊 Table Status:');
    for (const [table, status] of Object.entries(results)) {
      if (status.exists) {
        console.log(`  ✅ ${table} - OK`);
      } else {
        console.log(`  ❌ ${table} - MISSING (${status.error})`);
      }
    }

    // Check for dev tenant
    console.log('\n🔍 Checking for development tenant...');
    const { data: devTenant, error: tenantError } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', '00000000-0000-0000-0000-000000000001')
      .maybeSingle();

    if (tenantError) {
      console.log('  ❌ Dev tenant check failed:', tenantError.message);
    } else if (devTenant) {
      console.log('  ✅ Dev tenant exists:', devTenant.name);
    } else {
      console.log('  ⚠️  Dev tenant does not exist - needs creation');
    }

    // Check for users
    console.log('\n👥 Checking users...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, role');

    if (usersError) {
      console.log('  ❌ Cannot check users:', usersError.message);
    } else if (users && users.length > 0) {
      console.log(`  ✅ Found ${users.length} users`);
      users.forEach(user => {
        console.log(`    - ${user.email} (${user.role})`);
      });
    } else {
      console.log('  ⚠️  No users found');
    }

    console.log('\n✅ Database check complete');

  } catch (error) {
    console.error('\n❌ Database check failed:', error.message);
    process.exit(1);
  }
}

checkDatabase();
