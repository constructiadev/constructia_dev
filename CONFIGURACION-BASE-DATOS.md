# 🚀 Guía de Configuración de Base de Datos ConstructIA

## ❌ Problema Actual

Tu aplicación está intentando conectarse a una base de datos que no existe. Los errores que ves en la consola se deben a que:

1. Las credenciales en el archivo `.env` son placeholders (no reales)
2. La URL de Supabase no apunta a un proyecto válido
3. Falta la clave `SERVICE_ROLE_KEY` necesaria para operaciones administrativas

## ✅ Solución Paso a Paso

### PASO 1: Crear Proyecto en Supabase (5 minutos)

1. **Ve a Supabase**: https://supabase.com/dashboard
2. **Inicia sesión** con tu cuenta (o crea una gratis)
3. **Crea un nuevo proyecto**:
   - Haz clic en "New Project"
   - Nombre del proyecto: `constructia-prod` (o el que prefieras)
   - Password de la base de datos: **GUARDA ESTA CONTRASEÑA** (la necesitarás)
   - Región: Elige la más cercana a ti
   - Plan: Free (suficiente para desarrollo)
4. **Espera 2-3 minutos** mientras Supabase crea tu proyecto

### PASO 2: Obtener Credenciales (2 minutos)

Una vez que tu proyecto esté listo:

1. En el dashboard de Supabase, ve a **Settings** (⚙️ en el menú lateral)
2. Haz clic en **API** en el submenú
3. Verás tres valores importantes:

   **📋 Copia estos valores:**

   - `Project URL`: algo como `https://abcd1234.supabase.co`
   - `anon/public` key: una cadena larga que empieza con `eyJ...`
   - `service_role` key: otra cadena larga (haz clic en "Reveal" para verla)

### PASO 3: Configurar el Archivo .env (1 minuto)

1. **Abre el archivo `.env`** en la raíz del proyecto
2. **Reemplaza los valores** con tus credenciales reales:

```env
VITE_SUPABASE_URL=https://TU_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ... (tu anon key aquí)
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJ... (tu service_role key aquí)
```

3. **Guarda el archivo** (Ctrl+S o Cmd+S)

### PASO 4: Crear el Schema de Base de Datos (3 minutos)

Tu base de datos está vacía. Necesitas crear todas las tablas:

1. **En Supabase**, ve a **SQL Editor** (📝 en el menú lateral)
2. Haz clic en **"New query"**
3. **Abre el archivo** `database-schema-complete.sql` de tu proyecto
4. **Copia TODO el contenido** (Ctrl+A → Ctrl+C)
5. **Pega** en el SQL Editor de Supabase (Ctrl+V)
6. Haz clic en **"Run"** (botón verde, esquina inferior derecha)
7. **Espera 10-30 segundos** mientras se ejecuta
8. Deberías ver: `Success. No rows returned`

### PASO 5: Verificar que Todo Funciona (2 minutos)

1. **En Supabase**, ve a **Table Editor** (📊 en el menú lateral)
2. Deberías ver todas las tablas creadas:
   - ✅ tenants
   - ✅ users
   - ✅ clients
   - ✅ empresas
   - ✅ obras
   - ✅ documentos
   - ✅ proveedores
   - ✅ trabajadores
   - ✅ maquinaria
   - ✅ adaptadores
   - ✅ y más...

### PASO 6: Reiniciar el Servidor (1 minuto)

**MUY IMPORTANTE**: Los cambios en `.env` solo se cargan al iniciar el servidor.

1. **Detén el servidor** actual (Ctrl+C en la terminal)
2. **Inicia de nuevo**: `npm run dev`
3. **Espera** a que cargue completamente

### PASO 7: Crear Usuario Demo (automático)

La primera vez que intentes iniciar sesión con las credenciales demo:
- Email: `demo@construcciones.com`
- Password: `password123`

La aplicación **creará automáticamente** el usuario demo si no existe.

## 🎯 Resultado Esperado

Después de seguir estos pasos:

- ✅ La aplicación se conecta a Supabase correctamente
- ✅ No verás errores de "fetch failed" en la consola
- ✅ Puedes iniciar sesión con el usuario demo
- ✅ El dashboard muestra datos reales (vacío al principio, pero funcional)
- ✅ Puedes crear empresas, proyectos y subir documentos

## 🆘 Solución de Problemas

### Error: "Failed to fetch"
- ✅ Verifica que copiaste correctamente la URL de Supabase
- ✅ Asegúrate de que la URL empieza con `https://`
- ✅ Verifica que el proyecto existe en tu dashboard de Supabase
- ✅ **REINICIA el servidor** después de cambiar `.env`

### Error: "Invalid API key"
- ✅ Verifica que copiaste las keys completas (son muy largas)
- ✅ No debe haber espacios al inicio o final de las keys
- ✅ Usa la `anon` key, no la `public` key (son la misma)
- ✅ **REINICIA el servidor** después de cambiar `.env`

### Error: "relation does not exist"
- ❌ No ejecutaste el script SQL o se ejecutó con errores
- ✅ Ve a SQL Editor en Supabase
- ✅ Ejecuta el archivo `database-schema-complete.sql` completo
- ✅ Verifica en Table Editor que las tablas existen

### La aplicación sigue sin funcionar
1. **Verifica el archivo `.env`**:
   ```bash
   cat .env
   ```
   Debe tener 3 líneas con valores reales (no placeholders)

2. **Verifica la consola del navegador** (F12):
   - Busca errores rojos
   - Copia el mensaje de error completo

3. **Verifica que Supabase está activo**:
   - Ve a tu dashboard de Supabase
   - El proyecto debe estar "Active" (verde)
   - No debe estar "Paused" (gris)

## 📞 Soporte

Si sigues teniendo problemas después de seguir todos los pasos:

1. Verifica que completaste **TODOS** los pasos en orden
2. Asegúrate de haber **REINICIADO** el servidor
3. Revisa la consola del navegador (F12) y copia los errores exactos
4. Verifica que tu proyecto en Supabase está activo (no pausado)

## 🎉 ¡Listo!

Una vez configurado, la aplicación funcionará correctamente y podrás:
- Gestionar clientes con aislamiento de datos (multi-tenant)
- Subir y clasificar documentos con IA
- Sincronizar con plataformas CAE (Nalanda, Ctaima, Ecoordina)
- Ver dashboards y métricas en tiempo real

¡Disfruta de ConstructIA! 🚀
