import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('- VITE_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nPlease check your .env file');
  process.exit(1);
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const testUsers = [
  {
    email: 'admin@constructia.com',
    password: 'superadmin123',
    role: 'admin',
    userData: {
      email: 'admin@constructia.com',
      role: 'admin'
    }
  },
  {
    email: 'juan@construccionesgarcia.com',
    password: 'password123',
    role: 'client',
    userData: {
      email: 'juan@construccionesgarcia.com',
      role: 'client'
    },
    clientData: {
      company_name: 'Construcciones García S.L.',
      contact_name: 'Juan García',
      phone: '+34 600 123 456',
      address: 'Calle Mayor 123, 28001 Madrid',
      subscription_plan: 'professional',
      subscription_status: 'active',
      storage_used: 157286400, // ~150MB
      storage_limit: 1073741824, // 1GB
      documents_processed: 45,
      tokens_available: 750,
      obralia_credentials: {
        username: 'juan.garcia@obralia.com',
        password: 'obralia_pass_123',
        configured: true
      }
    }
  }
];

async function createTestUsers() {
  console.log('🚀 Creating test users for ConstructIA...\n');

  for (const testUser of testUsers) {
    try {
      console.log(`📧 Creating user: ${testUser.email}`);

      // 1. Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: testUser.email,
        password: testUser.password,
        email_confirm: true // Auto-confirm email
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          console.log(`   ⚠️  User already exists, skipping auth creation`);
          
          // Get existing user
          const { data: existingUsers } = await supabase.auth.admin.listUsers();
          const existingUser = existingUsers.users.find(u => u.email === testUser.email);
          
          if (existingUser) {
            // Continue with profile creation using existing user ID
            await createUserProfile(existingUser.id, testUser);
          }
          continue;
        } else {
          throw authError;
        }
      }

      if (authData.user) {
        console.log(`   ✅ Auth user created with ID: ${authData.user.id}`);
        await createUserProfile(authData.user.id, testUser);
      }

    } catch (error) {
      console.error(`   ❌ Error creating user ${testUser.email}:`, error.message);
    }
  }

  console.log('\n🎉 Test users creation completed!');
  console.log('\n📋 Test Credentials:');
  console.log('👤 Admin: admin@constructia.com / superadmin123');
  console.log('👤 Client: juan@construccionesgarcia.com / password123');
}

async function createUserProfile(userId, testUser) {
  try {
    // 2. Create user profile
    const { error: userError } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email: testUser.email,
        role: testUser.role
      });

    if (userError) {
      console.log(`   ⚠️  User profile might already exist: ${userError.message}`);
    } else {
      console.log(`   ✅ User profile created`);
    }

    // 3. Create client record if it's a client user
    if (testUser.role === 'client' && testUser.clientData) {
      const clientId = `CLI-${userId.substring(0, 8).toUpperCase()}`;
      
      const { error: clientError } = await supabase
        .from('clients')
        .upsert({
          user_id: userId,
          client_id: clientId,
          ...testUser.clientData
        });

      if (clientError) {
        console.log(`   ⚠️  Client profile might already exist: ${clientError.message}`);
      } else {
        console.log(`   ✅ Client profile created with ID: ${clientId}`);
      }
    }

  } catch (error) {
    console.error(`   ❌ Error creating profile for ${testUser.email}:`, error.message);
  }
}

// Run the script
createTestUsers().catch(console.error);