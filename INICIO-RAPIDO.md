# 🚀 Inicio Rápido - ConstructIA

## ⚠️ ANTES DE CONTINUAR

Tu aplicación NO funcionará hasta que configures Supabase. Toma solo **5 minutos**.

## 📋 Checklist Rápido

- [ ] Tengo cuenta en Supabase (o la voy a crear ahora)
- [ ] Tengo 5 minutos disponibles
- [ ] El servidor está DETENIDO (si está corriendo, presiona Ctrl+C)

## 🎯 PASO 1: Crear Proyecto Supabase (2 min)

1. **Abre tu navegador** y ve a: **https://supabase.com/dashboard**

2. **Inicia sesión** (o crea cuenta gratis)

3. **Haz clic en "New Project"** (botón verde arriba a la derecha)

4. **Completa el formulario**:
   - Organization: Selecciona tu organización (o crea una)
   - Name: `constructia` (o el nombre que prefieras)
   - Database Password: Elige una contraseña segura
   - Region: Elige la más cercana a ti
   - Pricing Plan: Free (es suficiente)

5. **Haz clic en "Create new project"**

6. **ESPERA 2-3 minutos** - Verás una pantalla de "Setting up project..."

## 🔑 PASO 2: Copiar Credenciales (1 min)

Una vez que el proyecto esté listo (verás el dashboard):

1. **En el menú lateral**, haz clic en el ícono de **⚙️ Settings**

2. **Haz clic en "API"** en el submenú

3. **Verás tu configuración**:
   
   📋 **Project URL**:
   ```
   https://abcdefghijklmno.supabase.co
   ```
   👉 Copia esta URL completa
   
   📋 **API Keys - anon / public**:
   ```
   eyJhbGciOiJI... (una cadena muy larga)
   ```
   👉 Haz clic en el icono de copiar
   
   📋 **API Keys - service_role**:
   ```
   (clic en "Reveal" para verla)
   eyJhbGciOiJI... (otra cadena muy larga)
   ```
   👉 Haz clic en "Reveal" y luego copia

## 📝 PASO 3: Configurar .env (1 min)

1. **Abre el archivo `.env`** en la raíz de tu proyecto

2. **Reemplaza** los PLACEHOLDER con tus credenciales:

   **ANTES** (con PLACEHOLDER):
   ```env
   VITE_SUPABASE_URL=PLACEHOLDER_https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=PLACEHOLDER_eyJ_tu_anon_key_aqui
   VITE_SUPABASE_SERVICE_ROLE_KEY=PLACEHOLDER_eyJ_tu_service_role_key_aqui
   ```

   **DESPUÉS** (con tus credenciales reales):
   ```env
   VITE_SUPABASE_URL=https://abcdefghijklmno.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1... (tu clave completa)
   VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1... (tu clave completa)
   ```

3. **GUARDA el archivo** (Ctrl+S o Cmd+S)

## 🗄️ PASO 4: Crear Base de Datos (3 min)

1. **Vuelve a tu proyecto en Supabase**

2. **En el menú lateral**, haz clic en el ícono **📝 SQL Editor**

3. **Haz clic en "New query"**

4. **En tu proyecto local**:
   - Abre el archivo `database-schema-complete.sql`
   - Selecciona TODO (Ctrl+A o Cmd+A)
   - Copia (Ctrl+C o Cmd+C)

5. **De vuelta en Supabase SQL Editor**:
   - Pega el SQL (Ctrl+V o Cmd+V)
   - **Haz clic en "Run"** (botón verde, esquina inferior derecha)
   - Espera 10-30 segundos

6. **Verifica**: Debe decir "Success. No rows returned"

## ✅ PASO 5: Verificar (1 min)

1. **En Supabase**, ve al **📊 Table Editor**

2. **Deberías ver muchas tablas**:
   - tenants ✅
   - users ✅
   - empresas ✅
   - obras ✅
   - documentos ✅
   - proveedores ✅
   - y muchas más...

## 🚀 PASO 6: Iniciar Aplicación (30 seg)

1. **Abre tu terminal**

2. **Inicia el servidor**:
   ```bash
   npm run dev
   ```

3. **Espera** a que termine de cargar (verás "ready in XXXms")

4. **Abre tu navegador**: http://localhost:5173

## 🎉 ¡LISTO!

Ahora deberías ver:
- ✅ **Sin errores** en la consola del navegador
- ✅ **Página de inicio** de ConstructIA
- ✅ **Botones de acceso** funcionando

### Probar Login

1. Haz clic en **"Acceso Cliente"**

2. Usa estas credenciales demo:
   - Email: `demo@construcciones.com`
   - Password: `password123`

3. La primera vez **creará el usuario automáticamente**

4. Deberías ver el **dashboard del cliente**

## ❌ Si Algo Falla

### Error: "Failed to fetch"

- Verifica que copiaste las credenciales **completas** (son muy largas)
- Verifica que **NO hay espacios** al inicio/final de las líneas en `.env`
- **REINICIA el servidor**: Ctrl+C → npm run dev

### Error: "relation does not exist"

- El SQL no se ejecutó correctamente
- Ve a **SQL Editor** en Supabase
- Ejecuta `database-schema-complete.sql` de nuevo
- Verifica en **Table Editor** que las tablas existen

### Error: "Invalid API key"

- Las credenciales están incorrectas o incompletas
- Ve a **Settings > API** en tu proyecto Supabase
- Copia las credenciales de nuevo
- Reemplaza en `.env`
- **REINICIA el servidor**

## 📚 Más Ayuda

Si necesitas más información:
- **Guía detallada**: `cat SOLUCION-ERRORES.md`
- **Configuración de BD**: `cat CONFIGURACION-BASE-DATOS.md`
- **Verificar setup**: `npm run setup:check-db`

## 💾 Importante

- **Crea un respaldo** de tu `.env` configurado:
  ```bash
  cp .env .env.backup
  ```

- **Guarda tus credenciales** en un lugar seguro (gestor de contraseñas)

- **NUNCA subas `.env` a Git** (ya está en `.gitignore`)

---

**¿Todo funcionando?** ¡Felicitaciones! Ya puedes usar ConstructIA 🎉
