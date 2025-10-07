# Solución: Dashboard de Bolt Vacío

## Problema Identificado

El dashboard de Bolt está vacío porque:
1. ❌ Falta la variable `VITE_SUPABASE_SERVICE_ROLE_KEY` en el archivo `.env`
2. ❌ Falta la tabla `users` en la base de datos
3. ❌ Faltan algunas tablas de compatibilidad (`clients`, `system_settings`)
4. ⚠️ Es posible que las políticas RLS estén bloqueando el acceso

## Solución Paso a Paso

### PASO 1: Obtener la Service Role Key de Supabase

1. Ve a tu [Dashboard de Supabase](https://supabase.com/dashboard)
2. Selecciona tu proyecto: `0ec90b57d6e95fcbda19832f`
3. Ve a **Settings** → **API**
4. En la sección "Project API keys", busca **service_role** (secret)
5. Copia la clave completa (empieza con `eyJ...`)

⚠️ **IMPORTANTE**: Esta clave es secreta y tiene permisos completos. NO la compartas públicamente.

### PASO 2: Actualizar el archivo .env

1. Abre el archivo `.env` en la raíz del proyecto
2. Reemplaza `YOUR_SERVICE_ROLE_KEY_HERE` con la clave que copiaste:

```env
VITE_SUPABASE_URL=https://0ec90b57d6e95fcbda19832f.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJib2x0IiwicmVmIjoiMGVjOTBiNTdkNmU5NWZjYmRhMTk4MzJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4ODE1NzQsImV4cCI6MTc1ODg4MTU3NH0.9I8-U0x86Ak8t2DGaIk0HfvTSLsAyzdnz-Nw00mMkKw
VITE_SUPABASE_SERVICE_ROLE_KEY=<TU_SERVICE_ROLE_KEY_AQUI>
```

3. Guarda el archivo

### PASO 3: Ejecutar el Script SQL en Supabase

1. Ve a tu [Dashboard de Supabase](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **SQL Editor**
4. Haz clic en **New Query**
5. Copia y pega el contenido del archivo `fix-bolt-database.sql`
6. Haz clic en **Run** (botón verde)
7. Espera a que termine (verás mensajes de confirmación)

Deberías ver un resultado similar a:

```
✅ Script completado exitosamente
Tablas users y clients creadas
Datos de prueba insertados
Políticas RLS configuradas
```

### PASO 4: Reiniciar el Servidor de Desarrollo

⚠️ **MUY IMPORTANTE**: Las variables de entorno solo se cargan al iniciar el servidor.

1. En tu terminal, presiona `Ctrl+C` para detener el servidor
2. Ejecuta nuevamente:
   ```bash
   npm run dev
   ```

### PASO 5: Verificar el Dashboard

1. Abre tu aplicación en el navegador
2. Inicia sesión como administrador:
   - Email: `admin@constructia.com`
   - Contraseña: (la que configuraste)
3. Ve a la sección **Admin** → **Database**
4. Deberías ver las tablas y datos

## Verificación Adicional

Si después de seguir todos los pasos el dashboard sigue vacío:

### A. Verificar en Supabase Table Editor

1. Ve a **Table Editor** en Supabase Dashboard
2. Verifica que existen estas tablas:
   - ✅ `tenants`
   - ✅ `users`
   - ✅ `clients`
   - ✅ `empresas`
   - ✅ `obras`
   - ✅ `documentos`
   - ✅ `system_settings`

### B. Verificar datos de prueba

1. En **Table Editor**, abre la tabla `users`
2. Deberías ver al menos 2 usuarios:
   - System Admin (`admin@constructia.com`)
   - Demo User (`demo@constructia.com`)

3. Abre la tabla `empresas`
4. Deberías ver al menos 1 empresa:
   - Constructora Demo S.L.

### C. Verificar en la consola del navegador

1. Abre las herramientas de desarrollo (F12)
2. Ve a la pestaña **Console**
3. Busca errores relacionados con Supabase
4. Si ves errores de "not configured", significa que el servidor no se reinició correctamente

## Solución de Problemas

### Problema: "Supabase not configured"
**Solución**: Reinicia el servidor (Ctrl+C → npm run dev)

### Problema: "relation 'users' does not exist"
**Solución**: Ejecuta el script `fix-bolt-database.sql` en Supabase

### Problema: "permission denied for table users"
**Solución**: Verifica que las políticas RLS se crearon correctamente en Supabase

### Problema: "No rows returned" al ejecutar el script
**Solución**: Esto es normal. Significa que el script se ejecutó sin errores.

## Datos de Prueba Creados

El script crea automáticamente:

- ✅ **Tenant de desarrollo**: `Development Tenant`
- ✅ **Usuario admin**: `admin@constructia.com` (SuperAdmin)
- ✅ **Usuario demo**: `demo@constructia.com` (Cliente)
- ✅ **Cliente demo**: Constructora Demo S.L.
- ✅ **Empresa demo**: Constructora Demo S.L.
- ✅ **Obra demo**: Proyecto Demo

## Próximos Pasos

Una vez que el dashboard muestre datos:

1. ✅ Explora las diferentes secciones del dashboard
2. ✅ Verifica que puedes ver empresas, obras y documentos
3. ✅ Crea nuevos datos de prueba desde la interfaz
4. ✅ Configura las credenciales de APIs externas si es necesario

## Soporte Adicional

Si después de seguir todos estos pasos el problema persiste:

1. Ve a **Admin** → **Database** → **Diagnóstico**
2. El módulo de diagnóstico te mostrará información detallada sobre:
   - Estado de conexión a Supabase
   - Variables de entorno configuradas
   - Tablas existentes
   - Políticas RLS
   - Errores de conexión

3. Toma una captura de pantalla del diagnóstico y compártela para obtener ayuda específica.

---

**Creado**: $(date)
**Versión**: 1.0
**Estado**: Listo para ejecutar
