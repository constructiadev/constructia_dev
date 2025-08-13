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

    // 3. Create admin user
    console.log('\n3️⃣ Creating admin user...');
    
    // Check if admin user exists
    const { data: existingAdmin, error: adminCheckError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin@constructia.com')
      .maybeSingle();

    if (adminCheckError && adminCheckError.code !== 'PGRST116') {
      console.error('❌ Error checking admin user:', adminCheckError);
    } else if (!existingAdmin) {
      // Create auth user
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
          console.log('✅ Admin user created successfully');
        }
      }
    } else {
      console.log('✅ Admin user already exists');
    }

    // 4. Create test client user and data
    console.log('\n4️⃣ Creating test client user and data...');
    
    // Check if client user exists
    const { data: existingClient, error: clientCheckError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'juan@construccionesgarcia.com')
      .maybeSingle();

    let clientUserId;

    if (clientCheckError && clientCheckError.code !== 'PGRST116') {
      console.error('❌ Error checking client user:', clientCheckError);
    } else if (!existingClient) {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: 'juan@construccionesgarcia.com',
        password: 'password123',
        email_confirm: true
      });

      if (authError && !authError.message.includes('already been registered')) {
        console.error('❌ Error creating client auth:', authError);
      } else {
        clientUserId = authData?.user?.id || 'client-user-id';
        
        // Create user profile
        const { error: userInsertError } = await supabase
          .from('users')
          .upsert({
            id: clientUserId,
            email: 'juan@construccionesgarcia.com',
            role: 'client'
          });

        if (userInsertError) {
          console.error('❌ Error creating client profile:', userInsertError);
        } else {
          console.log('✅ Client user created successfully');
        }
      }
    } else {
      clientUserId = existingClient.id;
      console.log('✅ Client user already exists');
    }

    // Create client record
    if (clientUserId) {
      const { data: existingClientRecord, error: clientRecordError } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', clientUserId)
        .maybeSingle();

      if (!existingClientRecord) {
        const { data: clientData, error: clientInsertError } = await supabase
          .from('clients')
          .upsert({
            user_id: clientUserId,
            client_id: `CLI-${clientUserId.substring(0, 8).toUpperCase()}`,
            company_name: 'Construcciones García S.L.',
            contact_name: 'Juan García',
            email: 'juan@construccionesgarcia.com',
            phone: '+34 600 123 456',
            address: 'Calle Construcción 123, 28001 Madrid',
            subscription_plan: 'professional',
            subscription_status: 'active',
            storage_used: 524288000,
            storage_limit: 1073741824,
            documents_processed: 15,
            tokens_available: 1000,
            obralia_credentials: { configured: true, username: 'test_user', password: 'test_pass' }
          })
          .select()
          .single();

        if (clientInsertError) {
          console.error('❌ Error creating client record:', clientInsertError);
        } else {
          console.log('✅ Client record created');
          
          // Create test companies
          const companies = [
            {
              client_id: clientData.id,
              name: 'Construcciones García S.L.',
              cif: 'B12345678',
              address: 'Calle Construcción 123, 28001 Madrid',
              phone: '+34 600 123 456',
              email: 'info@construccionesgarcia.com'
            },
            {
              client_id: clientData.id,
              name: 'Reformas Integrales López',
              cif: 'B87654321',
              address: 'Avenida Reforma 456, 28002 Madrid',
              phone: '+34 600 654 321',
              email: 'contacto@reformaslopez.com'
            }
          ];

          const { data: companiesData, error: companiesError } = await supabase
            .from('companies')
            .upsert(companies)
            .select();

          if (companiesError) {
            console.warn('⚠️ Error creating companies:', companiesError);
          } else {
            console.log('✅ Test companies created');

            // Create test projects
            const projects = [
              {
                company_id: companiesData[0].id,
                client_id: clientData.id,
                name: 'Edificio Residencial García',
                description: 'Construcción de edificio residencial de 4 plantas',
                status: 'active',
                progress: 65,
                start_date: '2024-01-15',
                end_date: '2025-06-30',
                budget: 450000,
                location: 'Madrid, España'
              },
              {
                company_id: companiesData[1].id,
                client_id: clientData.id,
                name: 'Reforma Oficinas López',
                description: 'Reforma integral de oficinas corporativas',
                status: 'planning',
                progress: 15,
                start_date: '2025-03-01',
                end_date: '2025-08-15',
                budget: 125000,
                location: 'Barcelona, España'
              }
            ];

            const { data: projectsData, error: projectsError } = await supabase
              .from('projects')
              .upsert(projects)
              .select();

            if (projectsError) {
              console.warn('⚠️ Error creating projects:', projectsError);
            } else {
              console.log('✅ Test projects created');

              // Create test documents
              const documents = [
                {
                  project_id: projectsData[0].id,
                  client_id: clientData.id,
                  filename: 'certificado_obra_123.pdf',
                  original_name: 'Certificado de Obra - Proyecto García.pdf',
                  file_size: 2048576,
                  file_type: 'application/pdf',
                  document_type: 'Certificado',
                  classification_confidence: 95,
                  upload_status: 'completed',
                  obralia_status: 'validated',
                  security_scan_status: 'safe',
                  processing_attempts: 1
                },
                {
                  project_id: projectsData[1].id,
                  client_id: clientData.id,
                  filename: 'factura_materiales_456.pdf',
                  original_name: 'Factura Materiales - Enero 2025.pdf',
                  file_size: 1024768,
                  file_type: 'application/pdf',
                  document_type: 'Factura',
                  classification_confidence: 92,
                  upload_status: 'processing',
                  obralia_status: 'pending',
                  security_scan_status: 'safe',
                  processing_attempts: 0
                }
              ];

              const { error: documentsError } = await supabase
                .from('documents')
                .upsert(documents);

              if (documentsError) {
                console.warn('⚠️ Error creating documents:', documentsError);
              } else {
                console.log('✅ Test documents created');
              }
            }
          }
        }
      } else {
        console.log('✅ Client record already exists');
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

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📝 Test credentials:');
    console.log('   Admin: admin@constructia.com / superadmin123');
    console.log('   Client: juan@construccionesgarcia.com / password123');
    console.log('\n⚠️  Remember: RLS is DISABLED for development. Re-enable for production!');

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

setupDatabase();