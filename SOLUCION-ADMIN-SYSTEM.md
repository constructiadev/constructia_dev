# Solución: Error de Acceso del Administrador System

## Problema
El usuario `system@constructia.com` no puede iniciar sesión y muestra el error:
```
Database error querying schema
Failed phbjqlytkeifcobaxunt_ant_type=password:1 to load resource:
the server responded with a status of 500 ()
```

## Causa
El usuario `system@constructia.com` existe en la tabla `public.users` pero NO existe en la tabla `auth.users` de Supabase. Esto causa un error cuando intenta autenticarse.

## Solución Rápida

### Opción 1: Crear el usuario manualmente en Supabase Dashboard (RECOMENDADO)

1. Ve a tu proyecto de Supabase: https://supabase.com/dashboard
2. Navega a **Authentication** → **Users**
3. Haz clic en **Add User** → **Create new user**
4. Completa los datos:
   - **Email**: `system@constructia.com`
   - **Password**: `Superadmin123`
   - **Auto Confirm User**: ✅ ACTIVADO (muy importante)
5. Haz clic en **Create user**
6. Anota el `User UID` que se genera (será algo como `20000000-0000-0000-0000-000000000001`)

### Opción 2: Usar SQL (requiere permisos de service_role)

Si tienes acceso al SQL Editor de Supabase, ejecuta:

```sql
-- IMPORTANTE: Este código debe ejecutarse desde Supabase Dashboard SQL Editor
-- o usando el service_role key

-- Primero, crea el usuario en auth.users usando la función interna
SELECT
  auth.uid() AS current_user_id;

-- Nota: La creación de usuarios en auth.users debe hacerse mediante:
-- 1. Supabase Dashboard UI (recomendado)
-- 2. Supabase Admin API con service_role key
-- 3. Supabase Auth Admin API
```

### Opción 3: Usar solo el primer administrador

Si el primer administrador (`admin@constructia.com` / `superadmin123`) funciona correctamente:

1. Inicia sesión con: `admin@constructia.com` / `superadmin123`
2. Usa este usuario para todas las operaciones administrativas
3. El usuario `system@constructia.com` es principalmente para operaciones internas del sistema

## Verificación

Después de crear el usuario en auth.users, verifica que:

1. El usuario aparece en **Authentication** → **Users** en Supabase Dashboard
2. El estado es **Confirmed** (no Pending)
3. Puedes iniciar sesión con `system@constructia.com` / `Superadmin123`

## Usuarios Administrativos Disponibles

### Usuario Principal (USAR ESTE)
- **Email**: `admin@constructia.com`
- **Password**: `superadmin123`
- **Estado**: ✅ Funcionando
- **Uso**: Administración general

### Usuario del Sistema (Requiere configuración)
- **Email**: `system@constructia.com`
- **Password**: `Superadmin123`
- **Estado**: ⚠️ Requiere creación en auth.users
- **Uso**: Operaciones internas del sistema

## Recomendación

**Usa `admin@constructia.com` / `superadmin123` para acceso administrativo.**

El usuario `system@constructia.com` es principalmente para operaciones internas automáticas y puede configurarse más tarde si es necesario.

## Notas Técnicas

- Los usuarios en `auth.users` se crean mediante Supabase Auth API
- Los usuarios en `public.users` son referencias a los usuarios de autenticación
- Ambas tablas deben estar sincronizadas para que el login funcione correctamente
- Las migraciones SQL NO pueden crear usuarios en `auth.users` directamente
- Se debe usar Supabase Dashboard UI o Admin API para crear usuarios de autenticación
