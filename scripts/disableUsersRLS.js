import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function disableUsersRLS() {
  console.log('🔧 Disabling RLS for users table...');

  try {
    // Disable RLS on users table
    const { error } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;`
    });

    if (error) {
      console.error('❌ Error disabling RLS for users table:', error.message);
      throw error;
    }

    console.log('✅ RLS disabled for users table');

    // Test access to users table
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('id, email, role')
      .limit(1);

    if (testError) {
      console.error('❌ Error testing users table access:', testError.message);
    } else {
      console.log(`✅ Users table accessible. Found ${testData?.length || 0} users`);
    }

    console.log('\n🎉 Users table RLS disabled successfully!');
    console.log('⚠️  Remember: This is for development only. Re-enable RLS for production!');

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

disableUsersRLS();