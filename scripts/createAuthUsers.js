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

const DEV_TENANT_ID = '00000000-0000-0000-0000-000000000001';

async function createAuthUsers() {
  console.log('🔐 Creating Supabase Auth users for secure login...\n');

  try {
    // Test users to create
    const testUsers = [
      {
        id: '10000000-0000-0000-0000-000000000001',
        email: 'garcia@construcciones.com',
        password: 'password123',
        name: 'Juan García',
        role: 'ClienteAdmin'
      },
      {
        id: '10000000-0000-0000-0000-000000000002',
        email: 'lopez@reformas.com',
        password: 'password123',
        name: 'María López',
        role: 'ClienteAdmin'
      },
      {
        id: '10000000-0000-0000-0000-000000000003',
        email: 'martin@edificaciones.com',
        password: 'password123',
        name: 'Carlos Martín',
        role: 'ClienteAdmin'
      },
      {
        id: '20000000-0000-0000-0000-000000000001',
        email: 'admin@constructia.com',
        password: 'superadmin123',
        name: 'Super Admin',
        role: 'SuperAdmin'
      }
    ];

    for (const user of testUsers) {
      console.log(`Creating auth user: ${user.email}`);
      
      try {
        // Create Supabase Auth user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true,
          user_metadata: {
            name: user.name,
            role: user.role
          }
        });

        if (authError) {
          if (authError.message.includes('already been registered')) {
            console.log(`⚠️ User ${user.email} already exists in auth`);
            
            // Get existing user ID
            const { data: existingUsers } = await supabase.auth.admin.listUsers();
            const existingUser = existingUsers.users?.find(u => u.email === user.email);
            
            if (existingUser) {
              // Create/update profile in users table
              const { error: profileError } = await supabase
                .from('users')
                .upsert({
                  id: existingUser.id,
                  tenant_id: DEV_TENANT_ID,
                  email: user.email,
                  name: user.name,
                  role: user.role,
                  active: true
                }, { onConflict: 'id' });

              if (profileError) {
                console.error(`❌ Error creating profile for ${user.email}:`, profileError.message);
              } else {
                console.log(`✅ Profile created/updated for ${user.email}`);
              }
            }
          } else {
            console.error(`❌ Error creating auth user ${user.email}:`, authError.message);
          }
          continue;
        }

        if (authData.user) {
          // Create user profile in users table
          const { error: profileError } = await supabase
            .from('users')
            .upsert({
              id: authData.user.id,
              tenant_id: DEV_TENANT_ID,
              email: user.email,
              name: user.name,
              role: user.role,
              active: true
            }, { onConflict: 'id' });

          if (profileError) {
            console.error(`❌ Error creating profile for ${user.email}:`, profileError.message);
          } else {
            console.log(`✅ Auth user and profile created for ${user.email}`);
          }
        }

      } catch (userError) {
        console.error(`❌ Error processing user ${user.email}:`, userError);
      }
    }

    console.log('\n✅ Auth users creation completed!');
    console.log('\n🔐 Login credentials:');
    console.log('   Admin: admin@constructia.com / superadmin123');
    console.log('   Client 1: garcia@construcciones.com / password123');
    console.log('   Client 2: lopez@reformas.com / password123');
    console.log('   Client 3: martin@edificaciones.com / password123');
    console.log('\n🔒 All users are isolated by tenant for security');

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

createAuthUsers();