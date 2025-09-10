import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

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

async function deleteDuplicateClients() {
  try {
    console.log('🔍 Starting duplicate client detection and removal...');
    console.log('📊 Connecting to Supabase database...');

    // Step 1: Fetch all clients ordered by created_at (oldest first)
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

    // Step 2: Identify duplicates based on client_id
    const seenClientIds = new Set();
    const duplicateIds = [];
    const duplicateDetails = [];

    allClients.forEach((client) => {
      if (seenClientIds.has(client.client_id)) {
        // This is a duplicate
        duplicateIds.push(client.id);
        duplicateDetails.push({
          id: client.id,
          client_id: client.client_id,
          company_name: client.company_name,
          contact_name: client.contact_name,
          email: client.email,
          created_at: client.created_at
        });
      } else {
        // First occurrence, keep it
        seenClientIds.add(client.client_id);
      }
    });

    console.log(`🔍 Analysis complete:`);
    console.log(`   - Unique client_ids: ${seenClientIds.size}`);
    console.log(`   - Duplicate records found: ${duplicateIds.length}`);

    if (duplicateIds.length === 0) {
      console.log('✅ No duplicate clients found. Database is clean!');
      return;
    }

    // Step 3: Display duplicates before deletion
    console.log('\n📋 Duplicate clients to be deleted:');
    duplicateDetails.forEach((duplicate, index) => {
      console.log(`   ${index + 1}. ID: ${duplicate.id}`);
      console.log(`      Client ID: ${duplicate.client_id}`);
      console.log(`      Company: ${duplicate.company_name}`);
      console.log(`      Contact: ${duplicate.contact_name}`);
      console.log(`      Email: ${duplicate.email}`);
      console.log(`      Created: ${duplicate.created_at}`);
      console.log('');
    });

    // Step 4: Confirm deletion (in production, you might want to add a confirmation prompt)
    console.log('⚠️ Proceeding with deletion of duplicate records...');

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
      .select('client_id')
      .order('created_at', { ascending: true });

    if (verifyError) {
      console.error(`⚠️ Error verifying cleanup: ${verifyError.message}`);
    } else {
      const remainingClientIds = new Set(remainingClients.map(c => c.client_id));
      console.log(`\n✅ Cleanup verification:`);
      console.log(`   - Remaining clients: ${remainingClients.length}`);
      console.log(`   - Unique client_ids: ${remainingClientIds.size}`);
      
      if (remainingClients.length === remainingClientIds.size) {
        console.log('✅ SUCCESS: All duplicates removed. Each client_id is now unique!');
      } else {
        console.log('⚠️ WARNING: Some duplicates may still exist. Manual review recommended.');
      }
    }

    // Step 7: Summary
    console.log('\n📊 OPERATION SUMMARY:');
    console.log(`   - Total clients processed: ${allClients.length}`);
    console.log(`   - Duplicate records deleted: ${totalDeleted}`);
    console.log(`   - Remaining clients: ${allClients.length - totalDeleted}`);
    console.log(`   - Unique client_ids preserved: ${seenClientIds.size}`);

  } catch (error) {
    console.error('❌ Error during duplicate client removal:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Execute the script
if (require.main === module) {
  deleteDuplicateClients()
    .then(() => {
      console.log('\n🎉 Duplicate client removal completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Script failed:', error.message);
      process.exit(1);
    });
}

module.exports = { deleteDuplicateClients };