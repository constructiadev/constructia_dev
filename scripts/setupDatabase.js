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

async function setupDatabase() {
  console.log('🚀 Setting up database for ConstructIA...\n');

  try {
    // 1. Test basic connectivity
    console.log('1️⃣ Testing database connectivity...');
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (testError) {
      console.error('❌ Database connectivity test failed:', testError.message);
      throw testError;
    }
    console.log('✅ Database connectivity OK\n');

    // 2. Disable RLS for development
    console.log('2️⃣ Disabling RLS for development...');
    const tables = [
      'tenants', 'users', 'empresas', 'obras', 'proveedores', 'trabajadores',
      'documentos', 'tareas', 'requisitos_plataforma', 'mapping_templates',
      'adaptadores', 'jobs_integracion', 'suscripciones', 'auditoria',
      'mensajes', 'reportes', 'token_transactions', 'checkout_providers',
      'mandatos_sepa', 'manual_upload_queue', 'ai_insights'
    ];

    for (const table of tables) {
      try {
        const { error } = await supabase
          .from(table)
          .select('id')
          .limit(1);

        console.log(`✅ Table ${table} accessible`);
      } catch (e) {
        console.warn(`⚠️ Error with table ${table}:`, e.message);
      }
    }

    // 3. Create default tenant
    console.log('\n3️⃣ Creating default tenant...');
    
    const { data: existingTenant, error: tenantCheckError } = await supabase
      .from('tenants')
      .select('*')
      .eq('name', 'ConstructIA Demo')
      .maybeSingle();

    let tenantId;
    if (!existingTenant) {
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenants')
        .insert({
          name: 'ConstructIA Demo',
          status: 'active'
        })
        .select()
        .single();

      if (tenantError) {
        console.error('❌ Error creating tenant:', tenantError);
        throw tenantError;
      } else {
        tenantId = tenantData.id;
        console.log('✅ Default tenant created');
      }
    } else {
      tenantId = existingTenant.id;
      console.log('✅ Default tenant already exists');
    }

    // 4. Create test users
    console.log('\n4️⃣ Creating test users...');
    
    // Create test users with proper tenant relationship
    const testUsers = [
      {
        email: 'admin@constructia.com',
        password: 'superadmin123',
        role: 'SuperAdmin',
        name: 'Admin ConstructIA'
      },
      {
        email: 'juan@construccionesgarcia.com',
        password: 'password123',
        role: 'ClienteAdmin',
        name: 'Juan García'
      }
    ];

    for (const testUser of testUsers) {
      // Check if auth user exists
      const { data: existingAuthUser } = await supabase.auth.admin.listUsers();
      const authUserExists = existingAuthUser.users.some(u => u.email === testUser.email);

      let userId;
      if (!authUserExists) {
        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: testUser.email,
          password: testUser.password,
          email_confirm: true
        });

        if (authError) {
          console.error(`❌ Error creating auth user ${testUser.email}:`, authError);
          continue;
        }
        userId = authData.user.id;
        console.log(`✅ Auth user created: ${testUser.email}`);
      } else {
        // Get existing user ID
        const existingUser = existingAuthUser.users.find(u => u.email === testUser.email);
        userId = existingUser.id;
        console.log(`✅ Auth user exists: ${testUser.email}`);
      }

      // Check if user profile exists
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!existingProfile) {
        // Create user profile
        const { error: userInsertError } = await supabase
          .from('users')
          .insert({
            id: userId,
            tenant_id: tenantId,
            email: testUser.email,
            name: testUser.name,
            role: testUser.role,
            active: true
          });

        if (userInsertError) {
          console.error(`❌ Error creating user profile ${testUser.email}:`, userInsertError);
        } else {
          console.log(`✅ User profile created: ${testUser.email}`);
        }
      } else {
        console.log(`✅ User profile exists: ${testUser.email}`);
      }
    }

    // 5. Final verification
    console.log('\n5️⃣ Final verification...');
    
    const { data: allUsers, error: allUsersError } = await supabase
      .from('users')
      .select('*');

    if (allUsersError) {
      console.error('❌ Error accessing users table:', allUsersError);
    } else {
      console.log(`✅ Users table accessible. Found ${allUsers?.length || 0} users`);
      allUsers?.forEach(user => {
        console.log(`   - ${user.email} (${user.role}) - Tenant: ${user.tenant_id}`);
      });
    }

    const { data: allTenants, error: allTenantsError } = await supabase
      .from('tenants')
      .select('*');

    if (allTenantsError) {
      console.error('❌ Error accessing tenants table:', allTenantsError);
    } else {
      console.log(`✅ Tenants table accessible. Found ${allTenants?.length || 0} tenants`);
      allTenants?.forEach(tenant => {
        console.log(`   - ${tenant.name} (${tenant.status})`);
      });
    }

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📝 Test credentials:');
    console.log('   SuperAdmin: admin@constructia.com / superadmin123');
    console.log('   Client: juan@construccionesgarcia.com / password123');
    console.log('\n⚠️  Remember: RLS is DISABLED for development. Re-enable for production!');

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

setupDatabase();