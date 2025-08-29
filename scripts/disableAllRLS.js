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
    // 0. CRITICAL: Use service role key to execute raw SQL and disable ALL RLS
    console.log('0️⃣ CRITICAL: Disabling ALL RLS using service role...');
    
    // Execute comprehensive RLS disable using raw SQL
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        -- STEP 1: Disable RLS on ALL tables in public schema
        DO $$
        DECLARE
          table_record RECORD;
          policy_record RECORD;
        BEGIN
          -- Disable RLS on all tables
          FOR table_record IN (
            SELECT tablename 
            FROM pg_tables 
            WHERE schemaname = 'public'
          ) LOOP
            BEGIN
              EXECUTE 'ALTER TABLE public.' || quote_ident(table_record.tablename) || ' DISABLE ROW LEVEL SECURITY';
              RAISE NOTICE 'RLS disabled for table: %', table_record.tablename;
            EXCEPTION
              WHEN OTHERS THEN
                RAISE NOTICE 'Could not disable RLS for table %: %', table_record.tablename, SQLERRM;
            END;
          END LOOP;
          
          -- Drop ALL policies on ALL tables
          FOR policy_record IN (
            SELECT schemaname, tablename, policyname
            FROM pg_policies
            WHERE schemaname = 'public'
          ) LOOP
            BEGIN
              EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(policy_record.policyname) || 
                      ' ON ' || quote_ident(policy_record.schemaname) || '.' || quote_ident(policy_record.tablename);
              RAISE NOTICE 'Policy dropped: % on %', policy_record.policyname, policy_record.tablename;
            EXCEPTION
              WHEN OTHERS THEN
                RAISE NOTICE 'Could not drop policy % on %: %', policy_record.policyname, policy_record.tablename, SQLERRM;
            END;
          END LOOP;
          
          -- Grant ALL permissions to ALL roles on ALL tables
          FOR table_record IN (
            SELECT tablename 
            FROM pg_tables 
            WHERE schemaname = 'public'
          ) LOOP
            BEGIN
              EXECUTE 'GRANT ALL ON public.' || quote_ident(table_record.tablename) || ' TO anon';
              EXECUTE 'GRANT ALL ON public.' || quote_ident(table_record.tablename) || ' TO authenticated';
              EXECUTE 'GRANT ALL ON public.' || quote_ident(table_record.tablename) || ' TO service_role';
              RAISE NOTICE 'Permissions granted for table: %', table_record.tablename;
            EXCEPTION
              WHEN OTHERS THEN
                RAISE NOTICE 'Could not grant permissions for table %: %', table_record.tablename, SQLERRM;
            END;
          END LOOP;
          
          -- Grant usage on all sequences
          GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
          GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
          GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO service_role;
          
          RAISE NOTICE 'RLS completely disabled for all tables in public schema';
        END
        $$;
      `
    });

    if (rlsError) {
      console.error('❌ CRITICAL: Could not disable RLS completely:', rlsError);
      throw new Error('Failed to disable RLS - manual intervention required');
    } else {
      console.log('✅ ALL RLS policies disabled successfully');
    }

    const tables = [
      'users', 'empresas', 'documentos', 'receipts', 'payment_gateways'
    ];

    // 1. Test critical tables
    console.log('1️⃣ Testing critical table access...');
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('id')
          .limit(1);
        
        if (error) {
          console.error(`❌ Table ${table} not accessible:`, error.message);
        } else {
          console.log(`✅ Table ${table} accessible`);
        }
      } catch (e) {
        console.error(`❌ Error testing table ${table}:`, e.message);
      }
    }

    // 2. Test database access
    console.log('\n2️⃣ Testing database access...');
    
    // Test empresas table
    const { data: empresasData, error: empresasError } = await supabase
      .from('empresas')
      .select('*')
      .eq('tenant_id', '00000000-0000-0000-0000-000000000001')
      .limit(5);

    if (empresasError) {
      console.error('❌ Error accessing empresas table:', empresasError);
    } else {
      console.log(`✅ Empresas table accessible. Found ${empresasData?.length || 0} empresas`);
    }

    // Test documentos table
    const { data: documentosData, error: documentosError } = await supabase
      .from('documentos')
      .select('*')
      .eq('tenant_id', '00000000-0000-0000-0000-000000000001')
      .limit(5);

    if (documentosError) {
      console.error('❌ Error accessing documentos table:', documentosError);
    } else {
      console.log(`✅ Documentos table accessible. Found ${documentosData?.length || 0} documentos`);
    }

    console.log('\n🎉 All RLS policies disabled successfully!');
    console.log('🔓 Database is now fully permissive for development');
    console.log('\n⚠️  CRITICAL: This configuration is ONLY for development!');
    console.log('⚠️  DO NOT deploy to production with RLS disabled!');

  } catch (error) {
    console.error('❌ Fatal error:', error);
    console.log('\n🔧 If RLS issues persist, manually disable RLS in Supabase dashboard:');
    console.log('1. Go to Table Editor');
    console.log('2. For each table, click Settings > Row Level Security');
    console.log('3. Toggle OFF "Enable RLS"');
    console.log('4. Delete all policies');
    process.exit(1);
  }
}

disableAllRLS();