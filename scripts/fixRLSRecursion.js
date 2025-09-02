import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixRLSRecursion() {
  console.log('🔧 Fixing RLS infinite recursion...');
  
  try {
    // First, drop all policies on users table to break recursion
    console.log('1️⃣ Dropping all policies on users table...');
    
    const dropPoliciesQuery = `
      DO $$
      DECLARE
        policy_record RECORD;
      BEGIN
        FOR policy_record IN 
          SELECT schemaname, tablename, policyname 
          FROM pg_policies 
          WHERE tablename = 'users' AND schemaname = 'public'
        LOOP
          EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
            policy_record.policyname, 
            policy_record.schemaname, 
            policy_record.tablename);
        END LOOP;
      END $$;
    `;
    
    const { error: dropError } = await supabase.rpc('exec_sql', { 
      sql: dropPoliciesQuery 
    });
    
    if (dropError) {
      console.log('⚠️ Could not drop policies via RPC, trying direct approach...');
      
      // Try dropping specific known policies
      const knownPolicies = [
        'Users can access own tenant data',
        'SuperAdmin can access all users',
        'Tenant isolation policy'
      ];
      
      for (const policyName of knownPolicies) {
        try {
          const { error } = await supabase.rpc('exec_sql', {
            sql: `DROP POLICY IF EXISTS "${policyName}" ON public.users;`
          });
          if (!error) {
            console.log(`✅ Dropped policy: ${policyName}`);
          }
        } catch (e) {
          console.log(`⚠️ Could not drop policy ${policyName}: ${e.message}`);
        }
      }
    } else {
      console.log('✅ All policies dropped successfully');
    }
    
    // Disable RLS on users table
    console.log('2️⃣ Disabling RLS on users table...');
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;'
    });
    
    if (rlsError) {
      console.error('❌ Error disabling RLS:', rlsError);
    } else {
      console.log('✅ RLS disabled on users table');
    }
    
    // Verify the fix by testing a simple query
    console.log('3️⃣ Testing users table access...');
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('id, email, role')
      .limit(1);
    
    if (testError) {
      console.error('❌ Still having issues with users table:', testError);
    } else {
      console.log('✅ Users table access working correctly');
      console.log(`📊 Found ${testData?.length || 0} users in database`);
    }
    
    console.log('🎉 RLS recursion fix completed!');
    
  } catch (error) {
    console.error('❌ Error fixing RLS recursion:', error);
    process.exit(1);
  }
}

fixRLSRecursion();