import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createDevTenant() {
  console.log('🏗️  Creating development tenant...');

  try {
    // Check if it already exists
    const { data: existing } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', '00000000-0000-0000-0000-000000000001')
      .maybeSingle();

    if (existing) {
      console.log('✅ Dev tenant already exists:', existing.name);
      return;
    }

    // Create dev tenant
    const { data, error } = await supabase
      .from('tenants')
      .insert({
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Desarrollo',
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating dev tenant:', error.message);
      process.exit(1);
    }

    console.log('✅ Dev tenant created successfully:', data.name);

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    process.exit(1);
  }
}

createDevTenant();
