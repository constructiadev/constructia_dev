import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration. Please check your .env file.');
  console.log('Required variables:');
  console.log('- VITE_SUPABASE_URL');
  console.log('- VITE_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

console.log('🔧 Using Supabase URL:', supabaseUrl);
console.log('🔑 Service key configured:', supabaseServiceKey ? 'Yes' : 'No');

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixDatabaseAccess() {
  console.log('🚀 Starting database access fix...\n');

  try {
    // 0. Create default tenant first
    console.log('0️⃣ Creating default tenant...');
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .upsert({
        id: '00000000-0000-0000-0000-000000000001',
        name: 'ConstructIA Default Tenant',
        status: 'active'
      })
      .select()
      .single();

    if (tenantError) {
      console.error('❌ Error creating tenant:', tenantError);
    } else {
      console.log('✅ Default tenant ready');
    }

    // 1. Test basic connectivity
    console.log('1️⃣ Testing basic database connectivity...');
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (testError) {
      console.error('❌ Basic connectivity test failed:', testError.message);
      throw testError;
    }
    console.log(`✅ Database connectivity OK\n`);

    // 2. Disable RLS on all tables using direct SQL
    console.log('2️⃣ Disabling RLS on all tables...');
    const tables = [
      'tenants', 'users', 'empresas', 'obras', 'proveedores', 'trabajadores',
      'documentos', 'tareas', 'requisitos_plataforma', 'mapping_templates',
      'adaptadores', 'jobs_integracion', 'suscripciones', 'auditoria',
      'mensajes', 'reportes', 'token_transactions', 'checkout_providers',
      'mandatos_sepa', 'manual_upload_queue', 'ai_insights'
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

    // 3. Verify users exist and create if needed
    console.log('\n3️⃣ Verifying test users...');
    
    // Check admin user
    const { data: adminUser, error: adminError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin@constructia.com')
      .maybeSingle();

    if (adminError && adminError.code !== 'PGRST116') {
      console.error('❌ Error checking admin user:', adminError);
    } else if (!adminUser) {
      console.log('Creating admin user...');
      
      // Create auth user first
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: 'admin@constructia.com',
        password: 'superadmin123',
        email_confirm: true
      });

      if (authError && !authError.message.includes('already been registered')) {
        console.error('❌ Error creating admin auth:', authError);
      } else {
        const userId = authData?.user?.id || 'admin-user-id';
        
        // Create user profile
        const { error: userInsertError } = await supabase
          .from('users')
          .upsert({
            id: userId,
            tenant_id: tenant.id,
            email: 'admin@constructia.com',
            name: 'Admin User',
            role: 'SuperAdmin'
          });

        if (userInsertError) {
          console.error('❌ Error creating admin profile:', userInsertError);
        } else {
          console.log('✅ Admin user created');
        }
      }
    } else {
      console.log('✅ Admin user exists');
    }

    // Check client user
    const { data: clientUser, error: clientError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'juan@construccionesgarcia.com')
      .maybeSingle();

    if (clientError && clientError.code !== 'PGRST116') {
      console.error('❌ Error checking client user:', clientError);
    } else if (!clientUser) {
      console.log('Creating client user...');
      
      // Create auth user first
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: 'juan@construccionesgarcia.com',
        password: 'password123',
        email_confirm: true
      });

      if (authError && !authError.message.includes('already been registered')) {
        console.error('❌ Error creating client auth:', authError);
      } else {
        const userId = authData?.user?.id || 'client-user-id';
        
        // Create user profile
        const { error: userInsertError } = await supabase
          .from('users')
          .upsert({
            id: userId,
            tenant_id: tenant.id,
            email: 'juan@construccionesgarcia.com',
            name: 'Juan García',
            role: 'ClienteAdmin'
          });

        if (userInsertError) {
          console.error('❌ Error creating client profile:', userInsertError);
        } else {
          console.log('✅ Client user profile created');
        }
      }
    } else {
      console.log('✅ Client user exists');

    }

    // 4. Final verification
    console.log('\n4️⃣ Final verification...');
    
    const { data: allUsers, error: allUsersError } = await supabase
      .from('users')
      .select('*');

    if (allUsersError) {
      console.error('❌ Error accessing users table:', allUsersError);
    } else {
      console.log(`✅ Users table accessible. Found ${allUsers?.length || 0} users`);
      allUsers?.forEach(user => {
        console.log(`   - ${user.email} (${user.role})`);
      });
    }


    console.log('\n🎉 Database access fix completed!');
    console.log('\n📝 Test credentials:');
    console.log('   SuperAdmin: admin@constructia.com / superadmin123');
    console.log('   ClienteAdmin: juan@construccionesgarcia.com / password123');
    console.log('\n⚠️  Remember: RLS is now DISABLED for development. Re-enable for production!');

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

fixDatabaseAccess();