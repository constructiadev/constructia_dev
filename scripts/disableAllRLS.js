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

async function disableAllRLS() {
  console.log('🚀 Disabling ALL RLS policies for full permissive access...\n');

  const tables = [
    'users',
    'clients', 
    'companies',
    'projects',
    'documents',
    'subscriptions',
    'payments',
    'receipts',
    'payment_gateways',
    'system_settings',
    'kpis',
    'audit_logs',
    'manual_document_queue',
    'manual_upload_sessions',
    'sepa_mandates'
  ];

  try {
    // 1. Disable RLS on all tables
    console.log('1️⃣ Disabling RLS on all tables...');
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

    // 2. Drop all existing policies
    console.log('\n2️⃣ Dropping all existing RLS policies...');
    for (const table of tables) {
      try {
        // Get all policies for this table
        const { data: policies, error: policiesError } = await supabase
          .from('pg_policies')
          .select('policyname')
          .eq('tablename', table)
          .eq('schemaname', 'public');

        if (!policiesError && policies && policies.length > 0) {
          // Drop each policy
          for (const policy of policies) {
            try {
              const { error: dropError } = await supabase.rpc('drop_policy', {
                table_name: table,
                policy_name: policy.policyname
              });

              if (dropError) {
                console.warn(`⚠️ Could not drop policy ${policy.policyname} on ${table}: ${dropError.message}`);
              } else {
                console.log(`✅ Dropped policy ${policy.policyname} on ${table}`);
              }
            } catch (e) {
              console.warn(`⚠️ Error dropping policy ${policy.policyname}:`, e.message);
            }
          }
        } else if (policiesError) {
          console.warn(`⚠️ Could not get policies for ${table}: ${policiesError.message}`);
        }
      } catch (e) {
        console.warn(`⚠️ Error getting policies for ${table}:`, e.message);
      }
    }

    // 3. Grant full permissions to anon and authenticated roles
    console.log('\n3️⃣ Granting full permissions to anon and authenticated roles...');
    for (const table of tables) {
      try {
        // Grant all permissions to anon role
        const { error: anonError } = await supabase.rpc('grant_permissions', {
          table_name: table,
          role_name: 'anon'
        });

        if (anonError) {
          console.warn(`⚠️ Could not grant permissions to anon for ${table}: ${anonError.message}`);
        } else {
          console.log(`✅ Granted all permissions to anon for ${table}`);
        }

        // Grant all permissions to authenticated role
        const { error: authError } = await supabase.rpc('grant_permissions', {
          table_name: table,
          role_name: 'authenticated'
        });

        if (authError) {
          console.warn(`⚠️ Could not grant permissions to authenticated for ${table}: ${authError.message}`);
        } else {
          console.log(`✅ Granted all permissions to authenticated for ${table}`);
        }
      } catch (e) {
        console.warn(`⚠️ Error granting permissions for ${table}:`, e.message);
      }
    }

    // 4. Test database access
    console.log('\n4️⃣ Testing database access...');
    
    // Test users table
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(5);

    if (usersError) {
      console.error('❌ Error accessing users table:', usersError);
    } else {
      console.log(`✅ Users table accessible. Found ${usersData?.length || 0} users`);
    }

    // Test clients table
    const { data: clientsData, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .limit(5);

    if (clientsError) {
      console.error('❌ Error accessing clients table:', clientsError);
    } else {
      console.log(`✅ Clients table accessible. Found ${clientsData?.length || 0} clients`);
    }

    // Test insert on clients table
    console.log('\n5️⃣ Testing insert permissions...');
    const testClient = {
      user_id: '00000000-0000-0000-0000-000000000001',
      client_id: 'TEST-CLIENT-001',
      company_name: 'Test Company',
      contact_name: 'Test User',
      email: 'test@example.com',
      subscription_plan: 'basic',
      subscription_status: 'active'
    };

    const { data: insertData, error: insertError } = await supabase
      .from('clients')
      .upsert(testClient)
      .select();

    if (insertError) {
      console.error('❌ Error testing insert:', insertError);
    } else {
      console.log('✅ Insert test successful');
      
      // Clean up test record
      await supabase
        .from('clients')
        .delete()
        .eq('client_id', 'TEST-CLIENT-001');
    }

    console.log('\n🎉 All RLS policies disabled successfully!');
    console.log('🔓 Database is now fully permissive for development');
    console.log('\n⚠️  CRITICAL: This configuration is ONLY for development!');
    console.log('⚠️  DO NOT deploy to production with RLS disabled!');

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

disableAllRLS();