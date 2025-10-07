# 🔧 Guía de Recuperación del Archivo .env

## ⚠️ Problema Identificado

El archivo `.env` se borró o perdió su configuración después de ser configurado automáticamente por Bolt. Esto ocurre porque las credenciales de Bolt son temporales.

## ✅ Solución Implementada

Se ha restaurado el archivo `.env` con las credenciales de tu proyecto real de Supabase:
- **Proyecto ID**: `phbjqlytkeifcobaxunt`
- **URL**: `https://phbjqlytkeifcobaxunt.supabase.co`

## 🚨 ACCIÓN REQUERIDA INMEDIATA

### Paso 1: Obtener SERVICE_ROLE_KEY

El archivo `.env` actual tiene un placeholder para el SERVICE_ROLE_KEY. Debes reemplazarlo con tu clave real:

1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto `phbjqlytkeifcobaxunt`
3. En el menú lateral, ve a **Settings** ⚙️
4. Haz clic en **API**
5. En la sección "Project API keys", busca `service_role`
6. Haz clic en **"Reveal"** para ver la clave completa
7. Copia la clave completa (será muy larga, como `eyJhbGci...`)
8. Abre el archivo `.env` en la raíz del proyecto
9. Reemplaza la línea:
   ```
   VITE_SUPABASE_SERVICE_ROLE_KEY=REPLACE_WITH_YOUR_REAL_SERVICE_ROLE_KEY
   ```
   Con:
   ```
   VITE_SUPABASE_SERVICE_ROLE_KEY=tu_clave_real_aqui
   ```
10. Guarda el archivo (Ctrl+S o Cmd+S)

### Paso 2: Reiniciar el Servidor

**MUY IMPORTANTE**: Las variables de entorno solo se cargan al iniciar el servidor.

```bash
# Detén el servidor actual (si está corriendo)
# Ctrl+C en la terminal donde corre

# Reinicia el servidor
npm run dev
```

### Paso 3: Verificar la Conexión

Una vez que el servidor esté corriendo con el SERVICE_ROLE_KEY correcto:

```bash
npm run setup:check-db
```

Deberías ver:
- ✅ Conexión a Supabase exitosa
- ✅ Tablas detectadas
- ✅ Tenant de desarrollo encontrado

## 📋 Estructura del Archivo .env

Tu archivo `.env` debe tener exactamente estas 4 variables:

```env
VITE_SUPABASE_URL=https://phbjqlytkeifcobaxunt.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ... (tu anon key completa)
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJ... (tu service role key completa)
VITE_GEMINI_API_KEY=AIza... (tu Gemini API key)
```

## 🔒 Sistema de Respaldo

Se ha creado un archivo de respaldo en:
```
.env.backup-YYYYMMDD-HHMMSS
```

### Crear Respaldos Manuales

Cada vez que configures correctamente tu `.env`, crea un respaldo:

```bash
cp .env .env.backup-$(date +%Y%m%d-%H%M%S)
```

### Restaurar desde Respaldo

Si pierdes tu `.env` nuevamente:

```bash
# Lista los respaldos disponibles
ls -la .env.backup-*

# Restaura el más reciente
cp .env.backup-YYYYMMDD-HHMMSS .env

# Reinicia el servidor
npm run dev
```

## 🛡️ Prevención Futura

### 1. Nunca Subas .env a Git
El archivo `.gitignore` ya incluye `.env`, asegúrate de no modificar eso.

### 2. Guarda las Credenciales en un Lugar Seguro
Recomendaciones:
- Gestor de contraseñas (1Password, Bitwarden, etc.)
- Archivo encriptado local
- Documentación privada del proyecto

### 3. Documenta el Proyecto Supabase
En tu documentación privada, anota:
- **Proyecto ID**: phbjqlytkeifcobaxunt
- **URL**: https://phbjqlytkeifcobaxunt.supabase.co
- **Ubicación**: Supabase Dashboard > tu cuenta
- **Región**: (anota cuál elegiste)

### 4. Verifica Antes de Reiniciar
Antes de reiniciar el servidor, verifica:
```bash
cat .env
```
Confirma que las 4 variables estén presentes y completas.

## 🔍 Diagnóstico de Problemas

### Error: "fetch failed"
**Causa**: Las credenciales son inválidas o el proyecto no existe.

**Solución**:
1. Verifica que el proyecto `phbjqlytkeifcobaxunt` exista en tu dashboard
2. Confirma que el proyecto esté activo (no pausado)
3. Verifica que copiaste las credenciales correctamente
4. Reinicia el servidor después de cualquier cambio en `.env`

### Error: "Invalid API key"
**Causa**: La clave está incompleta o tiene espacios extra.

**Solución**:
1. Copia la clave completa desde Supabase (incluye todo desde `eyJ` hasta el final)
2. No debe haber espacios al inicio o final
3. No debe haber saltos de línea en medio de la clave
4. Reinicia el servidor

### Error: "relation does not exist"
**Causa**: Las tablas no se han creado en la base de datos.

**Solución**:
1. Ve a tu proyecto en Supabase Dashboard
2. Navega a **SQL Editor**
3. Ejecuta el archivo `database-schema-complete.sql` completo
4. Verifica en **Table Editor** que las tablas existan

### El Dashboard muestra datos vacíos
**Causa**: Las tablas existen pero no tienen datos de prueba.

**Solución**:
```bash
# Esto creará datos de prueba
npm run setup:verify
```

## 📞 Contacto de Emergencia

Si después de seguir todos los pasos sigues teniendo problemas:

1. **Verifica el respaldo**: `ls -la .env.backup-*`
2. **Revisa los logs del servidor**: Busca errores específicos en la consola
3. **Verifica el proyecto en Supabase**: Confirma que esté activo
4. **Verifica las credenciales**: Compáralas con las del dashboard

## ✅ Checklist de Verificación

Después de configurar correctamente:

- [ ] Archivo `.env` existe en la raíz del proyecto
- [ ] Tiene las 4 variables necesarias (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_SUPABASE_SERVICE_ROLE_KEY, VITE_GEMINI_API_KEY)
- [ ] SERVICE_ROLE_KEY ha sido reemplazado con la clave real (no contiene "REPLACE")
- [ ] No hay espacios extra al inicio o final de las líneas
- [ ] Se ha creado un respaldo: `.env.backup-YYYYMMDD-HHMMSS`
- [ ] El servidor ha sido reiniciado después de los cambios
- [ ] `npm run setup:check-db` muestra conexión exitosa
- [ ] El proyecto en Supabase está activo y accesible

## 🎯 Resultado Esperado

Una vez completados todos los pasos:
- ✅ La aplicación se conecta correctamente a Supabase
- ✅ No hay errores de "fetch failed" en la consola
- ✅ El dashboard muestra datos (aunque sea vacío al inicio)
- ✅ Puedes crear empresas, proyectos y subir documentos
- ✅ Las funcionalidades de IA funcionan correctamente

---

**Última actualización**: $(date +%Y-%m-%d)
**Estado del archivo**: Restaurado con credenciales de proyecto real
**Acción pendiente**: Reemplazar SERVICE_ROLE_KEY con clave real
