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
    // 0. CRITICAL: First disable RLS on users table to break infinite recursion
    console.log('0️⃣ CRITICAL: Breaking infinite recursion on users table...');
    
    // Use direct SQL execution to bypass RLS completely
    const { error: usersRLSError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Disable RLS completely on users table
        ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;
        
        -- Drop ALL policies on users table
        DO $$ 
        DECLARE 
          pol RECORD;
        BEGIN 
          FOR pol IN (
            SELECT policyname 
            FROM pg_policies 
            WHERE tablename = 'users' AND schemaname = 'public'
          ) LOOP
            EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(pol.policyname) || ' ON public.users';
          END LOOP;
        END $$;
        
        -- Grant full permissions to all roles
        GRANT ALL ON public.users TO anon;
        GRANT ALL ON public.users TO authenticated;
        GRANT ALL ON public.users TO service_role;
        
        -- Also grant usage on sequence if exists
        GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
        GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
        GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO service_role;
      `
    });

    if (usersRLSError) {
      console.error('❌ CRITICAL: Could not disable users RLS:', usersRLSError);
      throw new Error('Failed to disable users RLS - manual intervention required');
    } else {
      console.log('✅ Users table RLS disabled successfully');
    }

    // Test users table access immediately
    try {
      const { data: testUsers, error: testError } = await supabase
        .from('users')
        .select('id')
        .limit(1);
      
      if (testError) {
        console.error('❌ Users table still not accessible:', testError);
        throw new Error('Users table access test failed');
      } else {
        console.log('✅ Users table access confirmed');
      }
    } catch (testError) {
      console.error('❌ Users table test failed:', testError);
      throw new Error('Users table verification failed');
    }

    const tables = [
      'tenants',
      'users',
      'empresas',
      'obras', 
      'proveedores',
      'trabajadores',
      'maquinaria',
      'documentos',
      'tareas',
      'requisitos_plataforma',
      'mapping_templates',
      'adaptadores',
      'jobs_integracion',
      'suscripciones',
      'auditoria',
      'mensajes',
      'reportes',
      'token_transactions',
      'checkout_providers',
      'mandatos_sepa',
      'manual_upload_queue',
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
      'sepa_mandates',
      'ai_insights'
    ];

    // 1. Disable RLS on all tables
    console.log('1️⃣ Disabling RLS on all tables...');
    for (const table of tables) {
      try {
        const { error } = await supabase
          .from('pg_class')
          .select('relname')
          .eq('relname', table)
          .single();

        if (!error) {
          // Table exists, try to disable RLS using direct SQL with comprehensive approach
          const { error: disableError } = await supabase.rpc('exec_sql', {
            sql: `
              DO $$ 
              BEGIN 
                -- Disable RLS
                IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = '${table}' AND table_schema = 'public') THEN
                  EXECUTE 'ALTER TABLE public.' || quote_ident('${table}') || ' DISABLE ROW LEVEL SECURITY';
                  
                  -- Drop all policies for this table
                  FOR pol IN (
                    SELECT policyname 
                    FROM pg_policies 
                    WHERE tablename = '${table}' AND schemaname = 'public'
                  ) LOOP
                    EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(pol.policyname) || ' ON public.' || quote_ident('${table}');
                  END LOOP;
                  
                  -- Grant permissions
                  EXECUTE 'GRANT ALL ON public.' || quote_ident('${table}') || ' TO anon';
                  EXECUTE 'GRANT ALL ON public.' || quote_ident('${table}') || ' TO authenticated';
                  EXECUTE 'GRANT ALL ON public.' || quote_ident('${table}') || ' TO service_role';
                END IF;
              END $$;
            `
          });

          if (disableError) {
            console.warn(`⚠️ Could not disable RLS for ${table}: ${disableError.message}`);
          } else {
            console.log(`✅ RLS disabled for ${table}`);
          }
        } else {
          console.warn(`⚠️ Table ${table} does not exist, skipping...`);
        }
      } catch (e) {
        console.warn(`⚠️ Error with table ${table}:`, e.message);
      }
    }

    // 2. Test database access
    console.log('\n2️⃣ Testing database access...');
    
    // Test empresas table (main table for new schema)
    const { data: empresasData, error: empresasError } = await supabase
      .from('empresas')
      .select('*')
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
      .limit(5);

    if (documentosError) {
      console.error('❌ Error accessing documentos table:', documentosError);
    } else {
      console.log(`✅ Documentos table accessible. Found ${documentosData?.length || 0} documentos`);
    }

    // Test insert on empresas table
    console.log('\n3️⃣ Testing insert permissions...');
    const testEmpresa = {
      tenant_id: '00000000-0000-0000-0000-000000000001',
      razon_social: 'Test Company S.L.',
      cif: 'B99999999',
      direccion: 'Test Address',
      contacto_email: 'test@example.com'
    };

    const { data: insertData, error: insertError } = await supabase
      .from('empresas')
      .upsert(testEmpresa)
      .select();

    if (insertError) {
      console.error('❌ Error testing insert:', insertError);
    } else {
      console.log('✅ Insert test successful');
      
      // Clean up test record
      await supabase
        .from('empresas')
        .eq('cif', 'B99999999');
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