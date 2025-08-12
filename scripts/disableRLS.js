import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function disableRLS() {
  console.log('🔧 Disabling RLS for development...');

  const tables = [
    'users', 'clients', 'companies', 'projects', 'documents',
    'subscriptions', 'payments', 'receipts', 'payment_gateways',
    'system_settings', 'kpis', 'audit_logs', 'manual_document_queue',
    'manual_upload_sessions', 'sepa_mandates'
  ];

  try {
    // Disable RLS on each table
    for (const table of tables) {
      const { error } = await supabase
        .rpc('exec_sql', {
          sql: `ALTER TABLE public.${table} DISABLE ROW LEVEL SECURITY;`
        });

      if (error) {
        console.log(`⚠️ Could not disable RLS for ${table}: ${error.message}`);
      } else {
        console.log(`✅ RLS disabled for ${table}`);
      }
    }

    // Test basic access
    console.log('\n🔍 Testing database access...');
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, role')
      .limit(5);

    if (usersError) {
      console.error('❌ Users table error:', usersError.message);
    } else {
      console.log(`✅ Users table accessible. Found ${users?.length || 0} users`);
    }

    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id, company_name, email')
      .limit(5);

    if (clientsError) {
      console.error('❌ Clients table error:', clientsError.message);
    } else {
      console.log(`✅ Clients table accessible. Found ${clients?.length || 0} clients`);
    }

    console.log('\n✅ RLS disabled successfully for development!');
    console.log('⚠️  Remember to re-enable RLS for production!');

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

disableRLS();