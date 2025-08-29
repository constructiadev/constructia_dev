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

  try {
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
          // Table exists, try to disable RLS using direct SQL
          const { error: disableError } = await supabase.rpc('exec_sql', {
            sql: `ALTER TABLE IF EXISTS public.${table} DISABLE ROW LEVEL SECURITY;`
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

    // 2. Drop all existing policies
    console.log('\n2️⃣ Dropping all existing RLS policies...');
    for (const table of tables) {
      try {
        // Use direct SQL to drop all policies for the table
        const { error: dropError } = await supabase.rpc('exec_sql', {
          sql: `
            DO $$ 
            DECLARE 
              pol RECORD;
            BEGIN 
              FOR pol IN 
                SELECT policyname 
                FROM pg_policies 
                WHERE tablename = '${table}' AND schemaname = 'public'
              LOOP
                EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(pol.policyname) || ' ON public.' || quote_ident('${table}');
              END LOOP;
            END $$;
          `
        });

        if (dropError) {
          console.warn(`⚠️ Could not drop policies for ${table}: ${dropError.message}`);
        } else {
          console.log(`✅ Dropped all policies for ${table}`);
        }
      } catch (e) {
        console.warn(`⚠️ Error getting policies for ${table}:`, e.message);
      }
    }

    // 3. Grant full permissions to anon and authenticated roles
    console.log('\n3️⃣ Granting full permissions to anon and authenticated roles...');
    for (const table of tables) {
      try {
        // Use direct SQL to grant permissions
        const { error: grantError } = await supabase.rpc('exec_sql', {
          sql: `
            DO $$ 
            BEGIN 
              IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = '${table}' AND table_schema = 'public') THEN
                EXECUTE 'GRANT ALL ON public.' || quote_ident('${table}') || ' TO anon';
                EXECUTE 'GRANT ALL ON public.' || quote_ident('${table}') || ' TO authenticated';
                EXECUTE 'GRANT ALL ON public.' || quote_ident('${table}') || ' TO service_role';
              END IF;
            END $$;
          `
        });

        if (grantError) {
          console.warn(`⚠️ Could not grant permissions for ${table}: ${grantError.message}`);
        } else {
          console.log(`✅ Granted all permissions for ${table}`);
        }
      } catch (e) {
        console.warn(`⚠️ Error granting permissions for ${table}:`, e.message);
      }
    }

    // 4. Test database access
    console.log('\n4️⃣ Testing database access...');
    
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
    console.log('\n5️⃣ Testing insert permissions...');
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