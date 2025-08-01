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

async function createTestUsers() {
  console.log('Creating test users...');

  try {
    // Create admin user
    console.log('Creating admin user...');
    const { data: adminAuth, error: adminAuthError } = await supabase.auth.admin.createUser({
      email: 'admin@constructia.com',
      password: 'superadmin123',
      email_confirm: true
    });

    if (adminAuthError && !adminAuthError.message.includes('already been registered')) {
      throw adminAuthError;
    }

    if (adminAuth.user) {
      // Create user profile
      const { error: adminUserError } = await supabase
        .from('users')
        .upsert({
          id: adminAuth.user.id,
          email: 'admin@constructia.com',
          role: 'admin'
        });

      if (adminUserError) {
        console.warn('Admin user profile error:', adminUserError.message);
      } else {
        console.log('✓ Admin user created successfully');
      }
    }

    // Create client user
    console.log('Creating client user...');
    const { data: clientAuth, error: clientAuthError } = await supabase.auth.admin.createUser({
      email: 'juan@construccionesgarcia.com',
      password: 'password123',
      email_confirm: true
    });

    if (clientAuthError && !clientAuthError.message.includes('already been registered')) {
      throw clientAuthError;
    }

    if (clientAuth.user) {
      // Create user profile
      const { error: clientUserError } = await supabase
        .from('users')
        .upsert({
          id: clientAuth.user.id,
          email: 'juan@construccionesgarcia.com',
          role: 'client'
        });

      if (clientUserError) {
        console.warn('Client user profile error:', clientUserError.message);
      }

      // Create client record
      const { error: clientRecordError } = await supabase
        .from('clients')
        .upsert({
          user_id: clientAuth.user.id,
          client_id: `CLI-${clientAuth.user.id.substring(0, 8).toUpperCase()}`,
          company_name: 'Construcciones García S.L.',
          contact_name: 'Juan García',
          email: 'juan@construccionesgarcia.com',
          phone: '+34 600 123 456',
          address: 'Calle Construcción 123, 28001 Madrid',
          subscription_plan: 'professional',
          subscription_status: 'active',
          storage_used: 0,
          storage_limit: 1073741824, // 1GB
          documents_processed: 0,
          tokens_available: 1000,
          obralia_credentials: { configured: false }
        });

      if (clientRecordError) {
        console.warn('Client record error:', clientRecordError.message);
      } else {
        console.log('✓ Client user created successfully');
      }
    }

    console.log('\n✅ Test users created successfully!');
    console.log('\nDemo credentials:');
    console.log('Admin: admin@constructia.com / superadmin123');
    console.log('Client: juan@construccionesgarcia.com / password123');

  } catch (error) {
    console.error('Error creating test users:', error.message);
    process.exit(1);
  }
}

createTestUsers();