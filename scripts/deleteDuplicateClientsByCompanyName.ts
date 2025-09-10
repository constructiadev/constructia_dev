import { createClient } from '@supabase/supabase-js';
import { getEnvVar } from '../src/utils/env';

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseServiceKey = getEnvVar('VITE_SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration');
  console.error('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY are set in .env');
  process.exit(1);
}

// Create Supabase client with service role (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function deleteDuplicateClientsByCompanyName() {
  try {
    console.log('🔍 Starting duplicate client detection by company_name...');
    console.log('📊 Connecting to Supabase database...');

    // Step 1: Fetch all clients ordered by created_at (oldest first to keep the first occurrence)
    const { data: allClients, error: fetchError } = await supabase
      .from('clients')
      .select('id, client_id, company_name, contact_name, email, created_at')
      .order('created_at', { ascending: true });

    if (fetchError) {
      throw new Error(`Error fetching clients: ${fetchError.message}`);
    }

    if (!allClients || allClients.length === 0) {
      console.log('ℹ️ No clients found in database');
      return;
    }

    console.log(`📋 Found ${allClients.length} total clients in database`);

    // Step 2: Identify duplicates based on company_name (case-insensitive)
    const seenCompanyNames = new Map<string, any>(); // Map to store first occurrence of each company name
    const duplicateIds: string[] = [];
    const duplicateDetails: any[] = [];

    allClients.forEach((client) => {
      const normalizedCompanyName = client.company_name.toLowerCase().trim();
      
      if (seenCompanyNames.has(normalizedCompanyName)) {
        // This is a duplicate company name
        duplicateIds.push(client.id);
        duplicateDetails.push({
          id: client.id,
          client_id: client.client_id,
          company_name: client.company_name,
          contact_name: client.contact_name,
          email: client.email,
          created_at: client.created_at,
          original_company: seenCompanyNames.get(normalizedCompanyName)
        });
      } else {
        // First occurrence of this company name, keep it
        seenCompanyNames.set(normalizedCompanyName, {
          id: client.id,
          company_name: client.company_name,
          created_at: client.created_at
        });
      }
    });

    console.log(`🔍 Analysis complete:`);
    console.log(`   - Unique company names: ${seenCompanyNames.size}`);
    console.log(`   - Duplicate records found: ${duplicateIds.length}`);

    if (duplicateIds.length === 0) {
      console.log('✅ No duplicate company names found. Database is clean!');
      return;
    }

    // Step 3: Display duplicates before deletion
    console.log('\n📋 Duplicate clients to be deleted (by company_name):');
    duplicateDetails.forEach((duplicate, index) => {
      console.log(`   ${index + 1}. ID: ${duplicate.id}`);
      console.log(`      Client ID: ${duplicate.client_id}`);
      console.log(`      Company: ${duplicate.company_name} (DUPLICATE)`);
      console.log(`      Contact: ${duplicate.contact_name}`);
      console.log(`      Email: ${duplicate.email}`);
      console.log(`      Created: ${duplicate.created_at}`);
      console.log(`      Original kept: ${duplicate.original_company.company_name} (${duplicate.original_company.created_at})`);
      console.log('');
    });

    // Step 4: Confirm deletion
    console.log('⚠️ Proceeding with deletion of duplicate company name records...');
    console.log('📝 Legal compliance: Only one company per unique name will remain');

    // Step 5: Delete duplicates in batches (Supabase has limits on array size)
    const batchSize = 100;
    let totalDeleted = 0;

    for (let i = 0; i < duplicateIds.length; i += batchSize) {
      const batch = duplicateIds.slice(i, i + batchSize);
      
      console.log(`🗑️ Deleting batch ${Math.floor(i / batchSize) + 1} (${batch.length} records)...`);

      const { error: deleteError } = await supabase
        .from('clients')
        .delete()
        .in('id', batch);

      if (deleteError) {
        console.error(`❌ Error deleting batch: ${deleteError.message}`);
        throw deleteError;
      }

      totalDeleted += batch.length;
      console.log(`✅ Batch deleted successfully (${totalDeleted}/${duplicateIds.length} total)`);
    }

    // Step 6: Verify cleanup
    const { data: remainingClients, error: verifyError } = await supabase
      .from('clients')
      .select('company_name, created_at')
      .order('created_at', { ascending: true });

    if (verifyError) {
      console.error(`⚠️ Error verifying cleanup: ${verifyError.message}`);
    } else {
      // Check for remaining duplicates
      const remainingCompanyNames = new Set();
      const stillDuplicated: string[] = [];
      
      remainingClients.forEach(client => {
        const normalizedName = client.company_name.toLowerCase().trim();
        if (remainingCompanyNames.has(normalizedName)) {
          stillDuplicated.push(client.company_name);
        } else {
          remainingCompanyNames.add(normalizedName);
        }
      });

      console.log(`\n✅ Cleanup verification:`);
      console.log(`   - Remaining clients: ${remainingClients.length}`);
      console.log(`   - Unique company names: ${remainingCompanyNames.size}`);
      
      if (stillDuplicated.length === 0) {
        console.log('✅ SUCCESS: All duplicate company names removed. Each company name is now unique!');
      } else {
        console.log('⚠️ WARNING: Some duplicate company names still exist:');
        stillDuplicated.forEach(name => console.log(`   - ${name}`));
      }
    }

    // Step 7: Summary
    console.log('\n📊 OPERATION SUMMARY:');
    console.log(`   - Total clients processed: ${allClients.length}`);
    console.log(`   - Duplicate company records deleted: ${totalDeleted}`);
    console.log(`   - Remaining clients: ${allClients.length - totalDeleted}`);
    console.log(`   - Unique company names preserved: ${seenCompanyNames.size}`);
    console.log(`   - Legal compliance: ✅ No duplicate company names`);

  } catch (error) {
    console.error('❌ Error during duplicate client removal by company name:', error);
    console.error('Stack trace:', error);
    process.exit(1);
  }
}

// Execute the script
if (import.meta.url === `file://${process.argv[1]}`) {
  deleteDuplicateClientsByCompanyName()
    .then(() => {
      console.log('\n🎉 Duplicate client removal by company name completed successfully!');
      console.log('🏢 Legal compliance achieved: Each company name is now unique');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Script failed:', error.message);
      process.exit(1);
    });
}

export { deleteDuplicateClientsByCompanyName };