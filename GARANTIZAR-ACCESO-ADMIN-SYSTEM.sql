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
  ESTADO ACTUAL (VERIFICADO Y CORREGIDO) ✅
  ================================================================================

  ✅ Usuario creado en auth.users (Supabase Authentication)
  ✅ Usuario creado en public.users con rol SuperAdmin
  ✅ Contraseña actualizada a: Superadmin123
  ✅ Email confirmado
  ✅ Usuario activo
  ✅ Tenant asociado correctamente
  ✅ Políticas RLS configuradas para acceso SuperAdmin
  ✅ Trigger handle_new_user actualizado para NO interferir con SuperAdmin
  ✅ Metadata de autenticación configurada correctamente
  ✅ Sesiones anteriores limpiadas

  IMPORTANTE: Se aplicaron las siguientes correcciones:
  1. fix_role_escalation_trigger_auditoria_columns - Corrección de columnas de auditoría
  2. ensure_system_admin_access - Garantizar acceso SuperAdmin inicial
  3. fix_system_admin_auth_issue - Corrección del problema "Database error querying schema"
  4. fix_handle_new_user_trigger_for_superadmin - Actualización del trigger para evitar conflictos

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
  3. Ingresa la contraseña: Superadmin123 (con S mayúscula)
  4. Haz clic en "Acceder como Administrador"

  IMPORTANTE: La contraseña es case-sensitive. Debe ser exactamente: Superadmin123

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
  encrypted_password IS NOT NULL as tiene_password,
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

-- Verificación completa de todos los checks
WITH auth_check AS (
  SELECT
    'Auth User' as check_name,
    'Email Confirmed' as status_name,
    email_confirmed_at IS NOT NULL as status
  FROM auth.users
  WHERE email = 'system@constructia.com'

  UNION ALL

  SELECT
    'Auth User' as check_name,
    'Has Password' as status_name,
    encrypted_password IS NOT NULL as status
  FROM auth.users
  WHERE email = 'system@constructia.com'

  UNION ALL

  SELECT
    'Public User' as check_name,
    'Is SuperAdmin' as status_name,
    (role = 'SuperAdmin') as status
  FROM users
  WHERE email = 'system@constructia.com'

  UNION ALL

  SELECT
    'Public User' as check_name,
    'Is Active' as status_name,
    active as status
  FROM users
  WHERE email = 'system@constructia.com'
)
SELECT
  check_name,
  status_name,
  CASE WHEN status THEN '✅ YES' ELSE '❌ NO' END as result
FROM auth_check
ORDER BY check_name, status_name;

/*
  ================================================================================
  RESULTADO ESPERADO
  ================================================================================

  Primera consulta (auth.users):
  --------------------------------
  id: 20000000-0000-0000-0000-000000000001
  email: system@constructia.com
  email_confirmado: true
  tiene_password: true
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

  Cuarta consulta (verificación completa):
  -----------------------------------------
  Auth User | Email Confirmed | ✅ YES
  Auth User | Has Password    | ✅ YES
  Public User | Is Active     | ✅ YES
  Public User | Is SuperAdmin | ✅ YES

  ================================================================================
  MIGRACIONES APLICADAS
  ================================================================================

  Este acceso fue garantizado mediante las siguientes migraciones:

  1. fix_role_escalation_trigger_auditoria_columns
     - Corrige las columnas de la tabla auditoria en los triggers
     - Previene errores en el registro de auditoría
     - Actualiza prevent_superadmin_role_escalation() y create_authorized_superadmin()

  2. ensure_system_admin_access
     - Crea/actualiza el usuario en auth.users con la contraseña correcta
     - Crea/actualiza el usuario en public.users con rol SuperAdmin
     - Verifica y crea políticas RLS necesarias
     - Registra la operación en la tabla de auditoría
     - Usa set_config para autorizar la creación de SuperAdmin

  3. fix_system_admin_auth_issue
     - Actualiza metadata de autenticación (raw_app_meta_data y raw_user_meta_data)
     - Regenera el hash de la contraseña con bcrypt
     - Confirma el email address
     - Limpia sesiones anteriores que puedan causar conflictos
     - Establece el usuario como completamente autenticado

  4. fix_handle_new_user_trigger_for_superadmin
     - Corrige el trigger handle_new_user para verificar usuarios existentes
     - Previene el error "Database error querying schema" durante login
     - Preserva roles SuperAdmin existentes sin sobrescribirlos
     - Maneja errores gracefully sin bloquear la autenticación
     - Cambia el trigger de BEFORE a AFTER para mejor compatibilidad

  ================================================================================
  SEGURIDAD
  ================================================================================

  🔒 El sistema tiene múltiples capas de seguridad:

  1. Triggers que previenen escalada de privilegios no autorizada
  2. Políticas RLS que controlan el acceso a nivel de fila
  3. Registro de auditoría de todas las acciones administrativas
  4. Contraseña encriptada con bcrypt (nunca se almacena en texto plano)
  5. El rol SuperAdmin solo puede ser asignado mediante scripts SQL autorizados
  6. Whitelist de emails autorizados en src/config/security-config.ts
  7. Verificación de autorización antes de permitir login de admin

  ================================================================================
  NOTAS IMPORTANTES
  ================================================================================

  ⚠️ Este usuario es para administración del sistema
  ⚠️ No usar este usuario para operaciones de cliente
  ⚠️ La contraseña debe cambiarse en producción
  ⚠️ Todas las acciones como SuperAdmin son registradas en auditoría
  ⚠️ El email system@constructia.com está en la whitelist de seguridad

  ================================================================================
  SOPORTE Y SOLUCIÓN DE PROBLEMAS
  ================================================================================

  Si tienes problemas para iniciar sesión:

  1. Verifica que estás en la URL correcta: /admin/login
  2. Verifica que las variables de entorno de Supabase están configuradas en .env:
     - VITE_SUPABASE_URL
     - VITE_SUPABASE_ANON_KEY
     - VITE_SUPABASE_SERVICE_ROLE_KEY
  3. Ejecuta las consultas de verificación arriba
  4. Revisa los logs de la aplicación para errores de autenticación
  5. Recarga la página del navegador (Ctrl+Shift+R) para limpiar la caché
  6. Si el problema persiste, vuelve a ejecutar: fix_system_admin_auth_issue
  7. Verifica que no hay errores en la consola del navegador (F12)

  PROBLEMAS COMUNES RESUELTOS:

  ❌ Error: "Database error querying schema"
  ✅ Solución: Migración fix_handle_new_user_trigger_for_superadmin aplicada
     El trigger ahora verifica usuarios existentes antes de crear perfiles
     Ya NO debería aparecer este error

  ❌ Error: "Invalid login credentials"
  ✅ Solución: La contraseña se regeneró correctamente como Superadmin123
     Usa exactamente esta contraseña con la S mayúscula
     Case-sensitive: Superadmin123 (NO superadmin123)

  ❌ Error: Usuario no puede acceder al admin
  ✅ Solución: El email system@constructia.com está en la whitelist de seguridad
     Ver src/config/security-config.ts - líneas 22-25
     AUTHORIZED_SUPERADMIN_EMAILS incluye este email

  ❌ Error: "Access denied: User does not have SuperAdmin role"
  ✅ Solución: El rol está correctamente asignado en public.users
     Verificado con las queries de arriba
     Ejecuta la cuarta query para confirmar

  ❌ Error: Página en blanco después de login
  ✅ Solución: Limpia la caché del navegador y recarga
     O abre en modo incógnito para probar

  ================================================================================
  NOTAS TÉCNICAS
  ================================================================================

  IDs importantes:
  - User ID: 20000000-0000-0000-0000-000000000001
  - Tenant ID: 00000000-0000-0000-0000-000000000001 (DEV_TENANT_ID)
  - Instance ID: 00000000-0000-0000-0000-000000000000

  Password hashing:
  - Algoritmo: bcrypt
  - Salt rounds: 10 (default de gen_salt('bf'))
  - Función: crypt('Superadmin123', gen_salt('bf'))

  Authentication flow:
  1. Usuario ingresa credenciales en /admin/login
  2. AdminLogin.tsx verifica email en whitelist (security-config.ts)
  3. Supabase Auth verifica credenciales (auth.users)
  4. AdminLogin.tsx verifica rol SuperAdmin (public.users)
  5. Si todo OK, redirige a /admin
  6. ProtectedRoute verifica sesión continuamente

  ================================================================================
*/

-- Script de re-aplicación (si necesitas restablecer el acceso)
/*
  Si por alguna razón necesitas restablecer el acceso, ejecuta:

  1. Conecta a tu base de datos Supabase
  2. Ejecuta la migración: fix_system_admin_auth_issue
  3. El script es idempotente (seguro ejecutar múltiples veces)
  4. Verifica con las consultas de verificación arriba
  5. Recarga la página de login en el navegador
*/

-- FIN DEL DOCUMENTO
