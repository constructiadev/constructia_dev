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
    // First, create a default tenant
    console.log('Creating default tenant...');
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .upsert({
        id: '00000000-0000-0000-0000-000000000001',
        name: 'ConstructIA Default Tenant',
        status: 'active'
      })
      .select()
      .single();

    if (tenantError) {
      console.error('❌ Error creating tenant:', tenantError);
      throw tenantError;
    }
    console.log('✅ Default tenant created');

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
          tenant_id: tenant.id,
          email: 'admin@constructia.com',
          name: 'Admin User',
          role: 'SuperAdmin'
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
          tenant_id: tenant.id,
          email: 'juan@construccionesgarcia.com',
          name: 'Juan García',
          role: 'ClienteAdmin'
        });

      if (clientUserError) {
        console.warn('Client user profile error:', clientUserError.message);
      }

      console.log('✓ Client user created successfully');
    }

    console.log('\n✅ Test users created successfully!');
    console.log('\nDemo credentials:');
    console.log('SuperAdmin: admin@constructia.com / superadmin123');
    console.log('ClienteAdmin: juan@construccionesgarcia.com / password123');

  } catch (error) {
    console.error('Error creating test users:', error.message);
    process.exit(1);
  }
}

createTestUsers();