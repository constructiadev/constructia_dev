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
    // 1. Test basic connectivity
    console.log('1️⃣ Testing basic database connectivity...');
    const { count, error: testError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (testError) {
      console.error('❌ Basic connectivity test failed:', testError.message);
      throw testError;
    }
    console.log(`✅ Database connectivity OK (${count} users found)\n`);

    // 2. Disable RLS on all tables using direct SQL
    console.log('2️⃣ Disabling RLS on all tables...');
    const tables = [
      'users', 'clients', 'companies', 'projects', 'documents',
      'subscriptions', 'payments', 'receipts', 'payment_gateways',
      'system_settings', 'kpis', 'audit_logs', 'manual_document_queue',
      'manual_upload_sessions', 'sepa_mandates'
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
            email: 'admin@constructia.com',
            role: 'admin'
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
            email: 'juan@construccionesgarcia.com',
            role: 'client'
          });

        if (userInsertError) {
          console.error('❌ Error creating client profile:', userInsertError);
        } else {
          console.log('✅ Client user profile created');
          
          // Create client record
          const { error: clientInsertError } = await supabase
            .from('clients')
            .upsert({
              user_id: userId,
              client_id: `CLI-${userId.substring(0, 8).toUpperCase()}`,
              company_name: 'Construcciones García S.L.',
              contact_name: 'Juan García',
              email: 'juan@construccionesgarcia.com',
              phone: '+34 600 123 456',
              address: 'Calle Construcción 123, 28001 Madrid',
              subscription_plan: 'professional',
              subscription_status: 'active',
              storage_used: 0,
              storage_limit: 1073741824,
              documents_processed: 0,
              tokens_available: 1000,
              obralia_credentials: { configured: false }
            });

          if (clientInsertError) {
            console.error('❌ Error creating client record:', clientInsertError);
          } else {
            console.log('✅ Client record created');
          }
        }
      }
    } else {
      console.log('✅ Client user exists');
      
      // Verify client record exists
      const { data: clientRecord, error: clientRecordError } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', clientUser.id)
        .maybeSingle();

      if (clientRecordError && clientRecordError.code !== 'PGRST116') {
        console.error('❌ Error checking client record:', clientRecordError);
      } else if (!clientRecord) {
        console.log('Creating missing client record...');
        const { error: clientInsertError } = await supabase
          .from('clients')
          .upsert({
            user_id: clientUser.id,
            client_id: `CLI-${clientUser.id.substring(0, 8).toUpperCase()}`,
            company_name: 'Construcciones García S.L.',
            contact_name: 'Juan García',
            email: 'juan@construccionesgarcia.com',
            phone: '+34 600 123 456',
            address: 'Calle Construcción 123, 28001 Madrid',
            subscription_plan: 'professional',
            subscription_status: 'active',
            storage_used: 0,
            storage_limit: 1073741824,
            documents_processed: 0,
            tokens_available: 1000,
            obralia_credentials: { configured: false }
          });

        if (clientInsertError) {
          console.error('❌ Error creating client record:', clientInsertError);
        } else {
          console.log('✅ Client record created');
        }
      } else {
        console.log('✅ Client record exists');
      }
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

    const { data: allClients, error: allClientsError } = await supabase
      .from('clients')
      .select('*');

    if (allClientsError) {
      console.error('❌ Error accessing clients table:', allClientsError);
    } else {
      console.log(`✅ Clients table accessible. Found ${allClients?.length || 0} clients`);
      allClients?.forEach(client => {
        console.log(`   - ${client.company_name} (${client.email})`);
      });
    }

    console.log('\n🎉 Database access fix completed!');
    console.log('\n📝 Test credentials:');
    console.log('   Admin: admin@constructia.com / superadmin123');
    console.log('   Client: juan@construccionesgarcia.com / password123');
    console.log('\n⚠️  Remember: RLS is now DISABLED for development. Re-enable for production!');

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

fixDatabaseAccess();