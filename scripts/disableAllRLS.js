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

  try {
    // Get all tables in public schema
    const { data: tables, error: tablesError } = await supabase
      .rpc('sql', {
        query: `
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_type = 'BASE TABLE'
        `
      });

    if (tablesError) {
      console.error('❌ Could not fetch tables:', tablesError);
      throw new Error('Failed to fetch tables');
    }

    console.log(`📋 Found ${tables?.length || 0} tables to process`);

    // Process each table individually using direct SQL queries
    const tableNames = tables?.map(t => t.table_name) || [];
    
    for (const tableName of tableNames) {
      console.log(`🔧 Processing table: ${tableName}`);
      
      try {
        // Disable RLS for this table using raw SQL
        const { error: disableError } = await supabase.rpc('sql', {
          query: `ALTER TABLE public.${tableName} DISABLE ROW LEVEL SECURITY;`
        });

        if (disableError && !disableError.message.includes('does not exist')) {
          console.log(`⚠️  Could not disable RLS for ${tableName}:`, disableError.message);
        } else {
          console.log(`✅ RLS disabled for ${tableName}`);
        }

        // Grant permissions using raw SQL
        const { error: grantError } = await supabase.rpc('sql', {
          query: `
            GRANT ALL ON public.${tableName} TO anon;
            GRANT ALL ON public.${tableName} TO authenticated;
            GRANT ALL ON public.${tableName} TO service_role;
          `
        });

        if (grantError && !grantError.message.includes('does not exist')) {
          console.log(`⚠️  Could not grant permissions for ${tableName}:`, grantError.message);
        } else {
          console.log(`✅ Permissions granted for ${tableName}`);
        }

      } catch (tableError) {
        console.log(`⚠️  Error processing ${tableName}:`, tableError.message);
        continue;
      }
    }

    // Test database access after disabling RLS
    console.log('\n🧪 Testing database access...');
    
    const testTables = ['empresas', 'documentos', 'users', 'tenants'];
    
    for (const table of testTables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('id')
          .limit(1);
        
        if (error) {
          console.log(`⚠️  Table ${table} test failed:`, error.message);
        } else {
          console.log(`✅ Table ${table} accessible`);
        }
      } catch (e) {
        console.log(`⚠️  Error testing table ${table}:`, e.message);
      }
    }

    console.log('\n🎉 RLS disable process completed!');
    console.log('🔓 Database should now be accessible for development');
    console.log('\n⚠️  CRITICAL: This configuration is ONLY for development!');
    console.log('⚠️  DO NOT deploy to production with RLS disabled!');

  } catch (error) {
    console.error('❌ Fatal error:', error);
    console.log('\n🔧 Manual steps to disable RLS:');
    console.log('1. Go to Supabase Dashboard > SQL Editor');
    console.log('2. Run: ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;');
    console.log('3. Run: ALTER TABLE public.empresas DISABLE ROW LEVEL SECURITY;');
    console.log('4. Run: ALTER TABLE public.documentos DISABLE ROW LEVEL SECURITY;');
    console.log('5. Run: ALTER TABLE public.tenants DISABLE ROW LEVEL SECURITY;');
    console.log('6. Delete all policies from Authentication > Policies');
    process.exit(1);
  }
}

disableAllRLS();