import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase configuration. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function disableRLSForDevelopment() {
  console.log('🔧 Disabling RLS for development environment...');

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
    'sepa_mandates'
  ];

  try {
    for (const table of tables) {
      console.log(`Disabling RLS for table: ${table}`);
      
      const { error } = await supabase.rpc('exec_sql', {
        sql: `ALTER TABLE ${table} DISABLE ROW LEVEL SECURITY;`
      });

      if (error) {
        console.warn(`Warning: Could not disable RLS for ${table}:`, error.message);
        // Try alternative method
        try {
          const { error: altError } = await supabase
            .from(table)
            .select('id')
            .limit(1);
          
          if (altError) {
            console.warn(`Table ${table} might not exist or have access issues`);
          } else {
            console.log(`✓ Table ${table} is accessible`);
          }
        } catch (e) {
          console.warn(`Could not test access to ${table}`);
        }
      } else {
        console.log(`✓ RLS disabled for ${table}`);
      }
    }

    // Test database connectivity
    console.log('\n🔍 Testing database connectivity...');
    
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

    // Test specific user
    console.log('\n🔍 Testing specific user access...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'juan@construccionesgarcia.com')
      .maybeSingle();
    
    if (userError) {
      console.error('❌ Error accessing user juan@construccionesgarcia.com:', userError);
    } else if (userData) {
      console.log('✅ User found:', userData.email, 'Role:', userData.role);
      
      // Test client data for this user
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', userData.id)
        .maybeSingle();
      
      if (clientError) {
        console.error('❌ Error accessing client data:', clientError);
      } else if (clientData) {
        console.log('✅ Client data found:', clientData.company_name);
      } else {
        console.log('⚠️ No client data found for user');
      }
    } else {
      console.log('⚠️ User juan@construccionesgarcia.com not found');
    }

    console.log('\n✅ RLS disabled for development. Remember to re-enable for production!');
    console.log('\n⚠️  SECURITY WARNING: RLS is now disabled. Do not deploy to production with this configuration!');

  } catch (error) {
    console.error('❌ Error disabling RLS:', error);
    process.exit(1);
  }
}

disableRLSForDevelopment();