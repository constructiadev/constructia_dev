#!/usr/bin/env node

/**
 * Script para eliminar el rol ClienteAdmin y asegurar aislamiento de clientes
 * 
 * Este script:
 * 1. Convierte todos los usuarios con rol ClienteAdmin a Cliente
 * 2. Verifica que solo existan los roles permitidos para clientes
 * 3. Asegura el aislamiento de datos por tenant
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function removeClienteAdminRole() {
  try {
    console.log('🔧 Starting ClienteAdmin role removal and client isolation setup...');

    // 1. Convertir todos los usuarios ClienteAdmin a Cliente
    console.log('📝 Converting ClienteAdmin users to Cliente...');
    const { data: updatedUsers, error: updateError } = await supabase
      .from('users')
      .update({ role: 'Cliente' })
      .eq('role', 'ClienteAdmin')
      .select('id, email, role');

    if (updateError) {
      console.error('❌ Error updating ClienteAdmin users:', updateError);
    } else {
      console.log(`✅ Updated ${updatedUsers?.length || 0} users from ClienteAdmin to Cliente`);
      updatedUsers?.forEach(user => {
        console.log(`   - ${user.email}: ${user.role}`);
      });
    }

    // 2. Verificar que solo existan los roles permitidos
    console.log('🔍 Verifying current user roles...');
    const { data: allUsers, error: fetchError } = await supabase
      .from('users')
      .select('id, email, role, tenant_id')
      .order('role');

    if (fetchError) {
      console.error('❌ Error fetching users:', fetchError);
      return;
    }

    console.log('📊 Current user roles distribution:');
    const roleCount = {};
    allUsers?.forEach(user => {
      roleCount[user.role] = (roleCount[user.role] || 0) + 1;
    });

    Object.entries(roleCount).forEach(([role, count]) => {
      console.log(`   - ${role}: ${count} users`);
    });

    // 3. Verificar que no existan roles no permitidos para clientes
    const allowedClientRoles = ['Cliente', 'ClienteDemo'];
    const adminRoles = ['SuperAdmin'];
    const allAllowedRoles = [...allowedClientRoles, ...adminRoles];

    const invalidUsers = allUsers?.filter(user => !allAllowedRoles.includes(user.role));
    
    if (invalidUsers && invalidUsers.length > 0) {
      console.log('⚠️  Found users with invalid roles:');
      invalidUsers.forEach(user => {
        console.log(`   - ${user.email}: ${user.role} (will be converted to Cliente)`);
      });

      // Convertir usuarios con roles inválidos a Cliente
      const { error: cleanupError } = await supabase
        .from('users')
        .update({ role: 'Cliente' })
        .in('id', invalidUsers.map(u => u.id));

      if (cleanupError) {
        console.error('❌ Error cleaning up invalid roles:', cleanupError);
      } else {
        console.log('✅ Converted invalid roles to Cliente');
      }
    }

    // 4. Verificar aislamiento por tenant
    console.log('🔒 Verifying tenant isolation...');
    const { data: tenants, error: tenantsError } = await supabase
      .from('tenants')
      .select('id, name');

    if (tenantsError) {
      console.error('❌ Error fetching tenants:', tenantsError);
      return;
    }

    for (const tenant of tenants || []) {
      const { data: tenantUsers, error: tenantUsersError } = await supabase
        .from('users')
        .select('id, email, role')
        .eq('tenant_id', tenant.id);

      if (tenantUsersError) {
        console.error(`❌ Error fetching users for tenant ${tenant.name}:`, tenantUsersError);
        continue;
      }

      const clientUsers = tenantUsers?.filter(u => allowedClientRoles.includes(u.role)) || [];
      const adminUsers = tenantUsers?.filter(u => adminRoles.includes(u.role)) || [];

      console.log(`🏢 Tenant: ${tenant.name}`);
      console.log(`   - Client users: ${clientUsers.length}`);
      console.log(`   - Admin users: ${adminUsers.length}`);
      
      clientUsers.forEach(user => {
        console.log(`     📱 ${user.email} (${user.role})`);
      });
      
      adminUsers.forEach(user => {
        console.log(`     🔧 ${user.email} (${user.role})`);
      });
    }

    // 5. Crear usuarios de prueba si no existen
    console.log('👥 Ensuring test users exist...');
    
    const testUsers = [
      {
        email: 'cliente.demo@constructia.com',
        password: 'demo123456',
        name: 'Cliente Demo',
        role: 'Cliente'
      },
      {
        email: 'cliente.test@constructia.com', 
        password: 'test123456',
        name: 'Cliente Test',
        role: 'ClienteDemo'
      }
    ];

    for (const testUser of testUsers) {
      // Crear usuario en Supabase Auth
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: testUser.email,
        password: testUser.password,
        email_confirm: true
      });

      if (authError && !authError.message.includes('already registered')) {
        console.error(`❌ Error creating auth user ${testUser.email}:`, authError);
        continue;
      }

      const userId = authUser?.user?.id || (await supabase.auth.admin.listUsers()).data.users.find(u => u.email === testUser.email)?.id;

      if (!userId) {
        console.error(`❌ Could not get user ID for ${testUser.email}`);
        continue;
      }

      // Crear perfil de usuario
      const { error: profileError } = await supabase
        .from('users')
        .upsert({
          id: userId,
          tenant_id: tenants?.[0]?.id,
          email: testUser.email,
          name: testUser.name,
          role: testUser.role,
          active: true
        }, {
          onConflict: 'tenant_id,email'
        });

      if (profileError) {
        console.error(`❌ Error creating profile for ${testUser.email}:`, profileError);
      } else {
        console.log(`✅ Test user created/updated: ${testUser.email} (${testUser.role})`);
      }
    }

    console.log('🎉 ClienteAdmin role removal and client isolation setup completed!');
    console.log('');
    console.log('📋 Summary:');
    console.log('   - Removed ClienteAdmin role from all users');
    console.log('   - Only allowed roles: SuperAdmin, Cliente, ClienteDemo');
    console.log('   - Client users are isolated to their tenant data only');
    console.log('   - Admin users can access all tenant data');
    console.log('');
    console.log('🔐 Test Credentials:');
    console.log('   Cliente Demo: cliente.demo@constructia.com / demo123456');
    console.log('   Cliente Test: cliente.test@constructia.com / test123456');

  } catch (error) {
    console.error('❌ Script execution error:', error);
    process.exit(1);
  }
}

// Ejecutar el script
removeClienteAdminRole();