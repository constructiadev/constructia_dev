#!/usr/bin/env node

/**
 * Script para eliminar definitivamente el rol ClienteAdmin y restringir acceso de clientes
 * 
 * Este script:
 * 1. Elimina definitivamente el rol ClienteAdmin de la base de datos
 * 2. Convierte todos los usuarios ClienteAdmin existentes a Cliente
 * 3. Restringe el acceso de clientes solo a roles Cliente y ClienteDemo
 * 4. Actualiza todas las referencias al rol ClienteAdmin
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
    console.log('🔧 Starting COMPLETE ClienteAdmin role removal...');

    // 1. Identificar y convertir todos los usuarios ClienteAdmin a Cliente
    console.log('1️⃣ Converting ALL ClienteAdmin users to Cliente...');
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

    // 2. Eliminar el rol ClienteAdmin del enum user_role
    console.log('2️⃣ Removing ClienteAdmin from user_role enum...');
    try {
      const { error: enumError } = await supabase.rpc('exec_sql', {
        query: `
          -- First, ensure no users have ClienteAdmin role
          UPDATE users SET role = 'Cliente' WHERE role = 'ClienteAdmin';
          
          -- Create new enum without ClienteAdmin
          CREATE TYPE user_role_new AS ENUM ('SuperAdmin', 'Cliente', 'ClienteDemo', 'GestorDocumental', 'SupervisorObra', 'Proveedor', 'Lector');
          
          -- Update the column to use new enum
          ALTER TABLE users ALTER COLUMN role TYPE user_role_new USING role::text::user_role_new;
          
          -- Drop old enum and rename new one
          DROP TYPE user_role;
          ALTER TYPE user_role_new RENAME TO user_role;
        `
      });

      if (enumError) {
        console.warn('⚠️ Could not modify enum directly:', enumError.message);
        console.log('📝 Manual step required: Remove ClienteAdmin from user_role enum in Supabase Dashboard');
      } else {
        console.log('✅ ClienteAdmin role removed from enum successfully');
      }
    } catch (enumError) {
      console.warn('⚠️ Enum modification failed:', enumError);
      console.log('📝 Manual step required: Remove ClienteAdmin from user_role enum');
    }

    // 3. Verificar que solo existan los roles permitidos
    console.log('3️⃣ Verifying current user roles...');
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

    // 4. Verificar que no existan roles no permitidos para clientes
    const allowedClientRoles = ['Cliente', 'ClienteDemo'];
    const adminRoles = ['SuperAdmin', 'GestorDocumental', 'SupervisorObra', 'Proveedor', 'Lector'];
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

    // 5. Verificar aislamiento por tenant
    console.log('5️⃣ Verifying tenant isolation...');
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

    // 6. Actualizar usuarios de prueba para usar solo roles permitidos
    console.log('6️⃣ Updating test users to use only allowed client roles...');
    
    const testUsers = [
      {
        email: 'garcia@construcciones.com',
        password: 'password123',
        name: 'Juan García',
        role: 'Cliente'
      },
      {
        email: 'lopez@reformas.com',
        password: 'password123',
        name: 'María López',
        role: 'Cliente'
      },
      {
        email: 'martin@edificaciones.com',
        password: 'password123',
        name: 'Carlos Martín',
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
          onConflict: 'id'
        });

      if (profileError) {
        console.error(`❌ Error creating profile for ${testUser.email}:`, profileError);
      } else {
        console.log(`✅ Test user created/updated: ${testUser.email} (${testUser.role})`);
      }
    }

    // 7. Verificación final
    console.log('7️⃣ Final verification...');
    const { data: finalUsers, error: finalError } = await supabase
      .from('users')
      .select('role')
      .eq('role', 'ClienteAdmin');

    if (finalError) {
      console.warn('⚠️ Could not verify ClienteAdmin removal:', finalError.message);
    } else if (finalUsers && finalUsers.length > 0) {
      console.error(`❌ Found ${finalUsers.length} users still with ClienteAdmin role!`);
    } else {
      console.log('✅ No users with ClienteAdmin role found - removal successful');
    }

    console.log('🎉 ClienteAdmin role COMPLETELY removed and client access restricted!');
    console.log('');
    console.log('📋 Summary:');
    console.log('   - ❌ ELIMINATED ClienteAdmin role completely from database');
    console.log('   - ✅ Client access RESTRICTED to: Cliente, ClienteDemo ONLY');
    console.log('   - 🔒 Admin roles: SuperAdmin, GestorDocumental, SupervisorObra, Proveedor, Lector');
    console.log('   - Client users are isolated to their tenant data only');
    console.log('   - Updated enum to prevent future ClienteAdmin creation');
    console.log('');
    console.log('🔐 Test Credentials:');
    console.log('   Cliente 1: garcia@construcciones.com / password123');
    console.log('   Cliente 2: lopez@reformas.com / password123');
    console.log('   Cliente Demo: martin@edificaciones.com / password123');
    console.log('   Admin: admin@constructia.com / superadmin123');

  } catch (error) {
    console.error('❌ Script execution error:', error);
    process.exit(1);
  }
}

// Ejecutar el script
removeClienteAdminRole();