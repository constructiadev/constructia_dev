# 🔧 Solución de Errores - ConstructIA

## ❌ Error Actual: "Database error querying schema"

El error muestra que Supabase no puede consultar el esquema de la base de datos.

## ✅ SOLUCIÓN RÁPIDA

### El archivo .env está CORRECTO

Bolt gestiona automáticamente las credenciales de Supabase. Solo necesitas la API key de Gemini (ya configurada).

### Problema Real: Falta el Esquema de la Base de Datos

**REINICIA EL SERVIDOR** para que Bolt aplique las migraciones automáticamente:

```bash
# Detén el servidor actual
Ctrl+C

# Reinicia
npm run dev
```

Bolt detectará las migraciones en `supabase/migrations/` y las aplicará automáticamente.

## 📋 Verificación

Después de reiniciar, intenta:
1. Hacer login en la aplicación
2. Si funciona ✅ - problema resuelto
3. Si sigue fallando, ejecuta: `npm run setup:check-db`

## 🔍 Si Sigue Fallando

El problema es que las **migraciones no se aplicaron**. Las tablas necesarias no existen en la base de datos.

### Tablas que deben existir:
- tenants
- users  
- empresas
- obras
- documentos
- proveedores
- trabajadores
- maquinaria

### Solución: Aplicar Migraciones Manualmente

Como Bolt gestiona la base de datos internamente, contacta con soporte de Bolt para que reapliquen las migraciones.

O usa tu propio proyecto Supabase (ver GUIA-RECUPERACION-ENV.md).

