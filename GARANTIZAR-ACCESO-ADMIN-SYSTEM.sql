/*
  ================================================================================
  GARANTIZAR ACCESO ADMINISTRADOR - system@constructia.com
  ================================================================================

  Este script SQL garantiza el acceso completo de administrador para:

  📧 Email: system@constructia.com
  🔑 Contraseña: Superadmin123
  👤 Rol: SuperAdmin
  🏢 Tenant: Development Tenant (DEV_TENANT_ID)

  ================================================================================
  ESTADO ACTUAL (VERIFICADO)
  ================================================================================

  ✅ Usuario creado en auth.users (Supabase Authentication)
  ✅ Usuario creado en public.users con rol SuperAdmin
  ✅ Contraseña actualizada a: Superadmin123
  ✅ Email confirmado
  ✅ Usuario activo
  ✅ Tenant asociado correctamente
  ✅ Políticas RLS configuradas para acceso SuperAdmin

  ================================================================================
  DERECHOS DE ACCESO
  ================================================================================

  El usuario system@constructia.com tiene acceso completo a:

  ✓ Dashboard de administración completo
  ✓ Gestión de todos los tenants (clientes)
  ✓ Gestión de todos los usuarios
  ✓ Acceso a todos los recursos del sistema
  ✓ Bypass de aislamiento de tenants
  ✓ Gestión de empresas, obras, documentos de todos los clientes
  ✓ Configuración del sistema
  ✓ Logs de auditoría completos

  ================================================================================
  CÓMO INICIAR SESIÓN
  ================================================================================

  1. Navega a: /admin/login
  2. Ingresa el email: system@constructia.com
  3. Ingresa la contraseña: Superadmin123
  4. Haz clic en "Iniciar Sesión"

  ================================================================================
  VERIFICACIÓN DEL ESTADO
  ================================================================================

  Para verificar que el usuario está correctamente configurado, ejecuta:
*/

-- Verificar usuario en auth.users
SELECT
  id,
  email,
  email_confirmed_at IS NOT NULL as email_confirmado,
  created_at as fecha_creacion
FROM auth.users
WHERE email = 'system@constructia.com';

-- Verificar usuario en public.users
SELECT
  u.id,
  u.email,
  u.name as nombre,
  u.role as rol,
  u.active as activo,
  u.tenant_id,
  t.name as nombre_tenant,
  t.status as estado_tenant
FROM users u
LEFT JOIN tenants t ON u.tenant_id = t.id
WHERE u.email = 'system@constructia.com';

-- Verificar políticas RLS para SuperAdmin
SELECT
  tablename as tabla,
  policyname as politica,
  cmd as comando
FROM pg_policies
WHERE tablename = 'users'
AND policyname ILIKE '%superadmin%'
ORDER BY policyname;

/*
  ================================================================================
  RESULTADO ESPERADO
  ================================================================================

  Primera consulta (auth.users):
  --------------------------------
  id: 20000000-0000-0000-0000-000000000001
  email: system@constructia.com
  email_confirmado: true
  fecha_creacion: (fecha actual)

  Segunda consulta (public.users):
  ---------------------------------
  id: 20000000-0000-0000-0000-000000000001
  email: system@constructia.com
  nombre: System Admin
  rol: SuperAdmin
  activo: true
  tenant_id: 00000000-0000-0000-0000-000000000001
  nombre_tenant: Development Tenant
  estado_tenant: active

  Tercera consulta (RLS policies):
  ---------------------------------
  Múltiples políticas que permiten al SuperAdmin:
  - Leer todos los usuarios (SELECT)
  - Actualizar todos los usuarios (UPDATE)
  - Gestionar todos los usuarios (ALL)

  ================================================================================
  MIGRACIONES APLICADAS
  ================================================================================

  Este acceso fue garantizado mediante las siguientes migraciones:

  1. fix_role_escalation_trigger_auditoria_columns
     - Corrige las columnas de la tabla auditoria en los triggers
     - Previene errores en el registro de auditoría

  2. ensure_system_admin_access
     - Crea/actualiza el usuario en auth.users con la contraseña correcta
     - Crea/actualiza el usuario en public.users con rol SuperAdmin
     - Verifica y crea políticas RLS necesarias
     - Registra la operación en la tabla de auditoría

  ================================================================================
  SEGURIDAD
  ================================================================================

  🔒 El sistema tiene múltiples capas de seguridad:

  1. Triggers que previenen escalada de privilegios no autorizada
  2. Políticas RLS que controlan el acceso a nivel de fila
  3. Registro de auditoría de todas las acciones administrativas
  4. Contraseña encriptada con bcrypt (nunca se almacena en texto plano)
  5. El rol SuperAdmin solo puede ser asignado mediante scripts SQL autorizados

  ================================================================================
  NOTAS IMPORTANTES
  ================================================================================

  ⚠️ Este usuario es para administración del sistema
  ⚠️ No usar este usuario para operaciones de cliente
  ⚠️ La contraseña debe cambiarse en producción
  ⚠️ Todas las acciones como SuperAdmin son registradas en auditoría

  ================================================================================
  SOPORTE
  ================================================================================

  Si tienes problemas para iniciar sesión:

  1. Verifica que estás en la URL correcta: /admin/login
  2. Verifica que las variables de entorno de Supabase están configuradas
  3. Ejecuta las consultas de verificación arriba
  4. Revisa los logs de la aplicación para errores de autenticación
  5. Si es necesario, vuelve a ejecutar la migración ensure_system_admin_access

  ================================================================================
*/

-- Script de re-aplicación (si necesitas restablecer el acceso)
/*
  Si por alguna razón necesitas restablecer el acceso, ejecuta:

  1. Conecta a tu base de datos Supabase
  2. Ejecuta la migración: ensure_system_admin_access.sql
  3. El script es idempotente (seguro ejecutar múltiples veces)
  4. Verifica con las consultas de verificación arriba
*/

-- FIN DEL DOCUMENTO
