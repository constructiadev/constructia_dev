# 🔧 Solución a los Errores de Base de Datos

## 🎯 Resumen del Problema

Tu aplicación ConstructIA está mostrando errores en la consola porque **la base de datos no está configurada correctamente**. Los errores que ves son:

- ❌ `Failed to fetch` o `TypeError: fetch failed`
- ❌ `Error fetching user profile`
- ❌ `Supabase not configured`
- ❌ Pantalla blanca o dashboard vacío

## ✅ Solución Rápida (15 minutos)

Sigue estos pasos **EN ORDEN**:

### 1️⃣ Configurar Supabase (5 minutos)

**a) Crea un proyecto en Supabase:**
- Ve a: https://supabase.com/dashboard
- Inicia sesión (o crea cuenta gratis)
- Clic en "New Project"
- Nombre: `constructia` (o el que prefieras)
- Guarda la contraseña que te pida
- Espera 2-3 minutos a que se cree el proyecto

**b) Obtén las credenciales:**
- En tu proyecto, ve a: **Settings** → **API**
- Copia estos 3 valores:
  - `Project URL`
  - `anon/public` key
  - `service_role` key (haz clic en "Reveal")

### 2️⃣ Actualizar el archivo .env (1 minuto)

**a) Abre el archivo `.env` en la raíz del proyecto**

**b) Reemplaza todo con:**

```env
VITE_SUPABASE_URL=https://TU_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aquí
VITE_SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aquí

VITE_GEMINI_API_KEY=AIzaSyDPJA1RU1KbHzOLG0tGAasXcS9H7iq625s
```

**c) Guarda el archivo** (Ctrl+S / Cmd+S)

### 3️⃣ Crear el Schema de Base de Datos (3 minutos)

**a) En Supabase:**
- Ve a: **SQL Editor** (📝 en el menú lateral)
- Clic en "New query"

**b) En tu proyecto:**
- Abre el archivo: `database-schema-complete.sql`
- Selecciona TODO el contenido (Ctrl+A / Cmd+A)
- Cópialo (Ctrl+C / Cmd+C)

**c) De vuelta en Supabase:**
- Pega el SQL en el editor (Ctrl+V / Cmd+V)
- Clic en **"Run"** (botón verde, abajo a la derecha)
- Espera 10-30 segundos
- Debe decir: "Success. No rows returned"

### 4️⃣ Verificar que Todo Funciona (2 minutos)

**a) Verifica en Supabase:**
- Ve a: **Table Editor** (📊 en el menú lateral)
- Debes ver muchas tablas: `tenants`, `users`, `clients`, `empresas`, etc.

**b) Verifica con el script:**

```bash
npm run setup:verify
```

Debes ver: ✅ en todos los checks

### 5️⃣ Reiniciar el Servidor (1 minuto)

**MUY IMPORTANTE**: Los cambios en `.env` solo se aplican al reiniciar.

```bash
# Detén el servidor (Ctrl+C si está corriendo)

# Inicia de nuevo
npm run dev
```

### 6️⃣ Probar la Aplicación (2 minutos)

**a) Abre tu navegador:**
- Ve a: http://localhost:5173

**b) Haz clic en "Acceso Cliente"**

**c) Usa las credenciales demo:**
- Email: `demo@construcciones.com`
- Password: `password123`

**d) La primera vez creará el usuario automáticamente**

## 🎉 ¡Listo!

Si seguiste todos los pasos, ahora deberías ver:
- ✅ Sin errores en la consola
- ✅ Dashboard funcional (vacío al principio, pero funcional)
- ✅ Puedes crear empresas, proyectos y documentos

## ❌ Si Sigues Teniendo Problemas

### Problema: "Failed to fetch"

**Causa**: Las credenciales en `.env` están mal configuradas

**Solución**:
1. Verifica que copiaste las 3 keys completas (son muy largas)
2. Verifica que no hay espacios al inicio/final de las keys
3. Verifica que la URL tiene el formato: `https://[id].supabase.co`
4. **REINICIA el servidor** (Ctrl+C → npm run dev)

### Problema: "relation does not exist"

**Causa**: El schema SQL no se ejecutó o falló

**Solución**:
1. Ve a SQL Editor en Supabase
2. Ejecuta `database-schema-complete.sql` completo
3. Verifica que en Table Editor aparezcan las tablas

### Problema: "Invalid API key"

**Causa**: Las keys están incorrectas o incompletas

**Solución**:
1. Ve a Settings → API en tu proyecto Supabase
2. Copia las keys de nuevo (usa el botón "Copy")
3. Reemplaza en `.env`
4. **REINICIA el servidor**

### Problema: El proyecto Supabase está "Paused"

**Causa**: Supabase pausa proyectos inactivos en el plan gratuito

**Solución**:
1. Ve a tu dashboard de Supabase
2. Selecciona el proyecto
3. Clic en "Restore" si está pausado
4. Espera 1-2 minutos
5. **REINICIA el servidor**

## 📞 Comandos Útiles

```bash
# Verificar configuración completa
npm run setup:verify

# Verificar solo la base de datos
npm run setup:check-db

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build
```

## 📚 Archivos de Ayuda

- `CONFIGURACION-BASE-DATOS.md` - Guía detallada paso a paso
- `database-schema-complete.sql` - Script SQL para crear tablas
- `scripts/verifySetup.js` - Script de verificación automática
- `scripts/checkDatabase.js` - Script para verificar tablas

## 🆘 Última Opción

Si nada de esto funciona:

1. **Verifica que completaste TODOS los pasos en orden**
2. **Asegúrate de haber REINICIADO el servidor**
3. **Verifica la consola del navegador** (F12):
   - Busca errores rojos
   - Copia el mensaje de error exacto
4. **Verifica que tu proyecto Supabase está "Active"** (no "Paused")
5. **Prueba con un proyecto Supabase nuevo** desde cero

## 🎓 ¿Qué Hace Cada Paso?

- **Paso 1**: Crea un espacio de base de datos en la nube
- **Paso 2**: Conecta tu aplicación con ese espacio
- **Paso 3**: Crea todas las tablas y estructura de datos
- **Paso 4**: Verifica que todo está correcto
- **Paso 5**: Carga la nueva configuración en la aplicación
- **Paso 6**: Prueba que todo funciona

Una vez configurado, **nunca tendrás que repetir esto**. La aplicación funcionará siempre que el servidor esté corriendo y Supabase esté activo.

---

**Última actualización**: Octubre 2025
**ConstructIA Platform** - Sistema de Gestión Documental con IA
