import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Read environment variables from .env file
const envPath = path.join(process.cwd(), '.env');
let envVars = {};

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      envVars[key.trim()] = value.trim();
    }
  });
}

// Configuración de Supabase
const supabaseUrl = envVars.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = envVars.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTestUsers() {
  try {
    console.log('Creating test users...');

    // 1. Create admin user
    console.log('Creating admin user...');
    const { data: adminAuthData, error: adminAuthError } = await supabase.auth.admin.createUser({
      email: 'admin@constructia.com',
      password: 'superadmin123',
      email_confirm: true
    });

    if (adminAuthError && !adminAuthError.message.includes('already registered')) {
      throw adminAuthError;
    }

    const adminUserId = adminAuthData?.user?.id;
    
    if (adminUserId) {
      // Create admin user profile
      const { error: adminUserError } = await supabase
        .from('users')
        .upsert({
          id: adminUserId,
          email: 'admin@constructia.com',
          role: 'admin'
        });

      if (adminUserError) {
        console.warn('Admin user profile error:', adminUserError.message);
      } else {
        console.log('✓ Admin user created successfully');
      }
    }

    // 2. Create client user
    console.log('Creating client user...');
    const { data: clientAuthData, error: clientAuthError } = await supabase.auth.admin.createUser({
      email: 'juan@construccionesgarcia.com',
      password: 'password123',
      email_confirm: true
    });

    if (clientAuthError && !clientAuthError.message.includes('already registered')) {
      throw clientAuthError;
    }

    const clientUserId = clientAuthData?.user?.id;
    
    if (clientUserId) {
      // Create client user profile
      const { error: clientUserError } = await supabase
        .from('users')
        .upsert({
          id: clientUserId,
          email: 'juan@construccionesgarcia.com',
          role: 'client'
        });

      if (clientUserError) {
        console.warn('Client user profile error:', clientUserError.message);
      }

      // Create client profile
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .upsert({
          user_id: clientUserId,
          client_id: 'GARCIA001',
          company_name: 'Construcciones García S.L.',
          contact_name: 'Juan García',
          email: 'juan@construccionesgarcia.com',
          phone: '+34 91 123 45 67',
          address: 'Calle Mayor 123, 28001 Madrid',
          subscription_plan: 'professional',
          subscription_status: 'active',
          storage_used: 0,
          storage_limit: 1073741824,
          documents_processed: 0,
          tokens_available: 1000,
          obralia_credentials: { configured: false }
        })
        .select();

      if (clientError) {
        console.warn('Client profile error:', clientError.message);
      } else {
        console.log('✓ Client user created successfully');
        
        // Create a sample company for the client
        if (clientData && clientData[0]) {
          const { error: companyError } = await supabase
            .from('companies')
            .upsert({
              client_id: clientData[0].id,
              name: 'Construcciones García S.L.',
              cif: 'B12345678',
              address: 'Calle Mayor 123, 28001 Madrid',
              phone: '+34 91 123 45 67',
              email: 'info@construccionesgarcia.com'
            });

          if (companyError) {
            console.warn('Sample company error:', companyError.message);
          } else {
            console.log('✓ Sample company created');
          }
        }
      }
    }

    console.log('\n🎉 Test users created successfully!');
    console.log('Admin: admin@constructia.com / superadmin123');
    console.log('Client: juan@construccionesgarcia.com / password123');

  } catch (error) {
    console.error('Error creating test users:', error.message);
    process.exit(1);
  }
}

createTestUsers();