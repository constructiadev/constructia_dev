# 🚨 IMPORTANTE: Lee Esto Primero

## ❌ Tu Aplicación Tiene Errores de Base de Datos

Si ves errores en la consola como:
- "Failed to fetch"
- "Supabase not configured"
- "Error fetching user profile"
- Dashboard vacío o pantalla blanca

**Es porque la base de datos NO está configurada.**

## ✅ Solución Rápida (15 minutos)

### **Lee uno de estos archivos (en orden de preferencia):**

1. 📄 **SOLUCION-ERRORES.md** ← EMPIEZA AQUÍ
   - Guía rápida y directa
   - Pasos numerados claros
   - Soluciones a problemas comunes

2. 📘 **CONFIGURACION-BASE-DATOS.md**
   - Guía detallada paso a paso
   - Explicaciones completas
   - Capturas de pantalla (si las añades)

## 🔧 Resumen Ultra-Rápido

Si ya sabes lo que haces:

```bash
# 1. Crea proyecto en Supabase (https://supabase.com)

# 2. Copia tus credenciales a .env:
VITE_SUPABASE_URL=https://tu-project.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=tu_service_key

# 3. Ejecuta el SQL en Supabase:
# - Copia database-schema-complete.sql
# - Pégalo en SQL Editor de Supabase
# - Run

# 4. Verifica
npm run setup:verify

# 5. Reinicia servidor
npm run dev
```

## 📞 Comandos Disponibles

```bash
npm run dev              # Iniciar servidor
npm run build            # Compilar proyecto
npm run setup:verify     # Verificar configuración
npm run setup:check-db   # Verificar base de datos
```

## 🆘 ¿Problemas?

1. **Lee** `SOLUCION-ERRORES.md` completo
2. **Sigue** todos los pasos EN ORDEN
3. **Reinicia** el servidor después de cambiar `.env`
4. **Verifica** con `npm run setup:verify`

---

## 📚 Estructura de Archivos de Ayuda

```
proyecto/
├── LEEME-PRIMERO.md              ← ESTÁS AQUÍ
├── SOLUCION-ERRORES.md           ← Guía rápida de solución
├── CONFIGURACION-BASE-DATOS.md   ← Guía detallada
├── database-schema-complete.sql  ← Script SQL para Supabase
├── .env                          ← Configura tus credenciales aquí
└── scripts/
    ├── verifySetup.js            ← Verificación automática
    └── checkDatabase.js          ← Verificación de tablas
```

## 🎯 Una Vez Configurado

Después de seguir los pasos, tu aplicación:
- ✅ Se conectará a Supabase correctamente
- ✅ No mostrará errores en consola
- ✅ Permitirá crear usuarios y datos
- ✅ Funcionará con aislamiento multi-tenant
- ✅ Procesará documentos con IA

## 🚀 Credenciales Demo

Después de configurar, usa:
- Email: `demo@construcciones.com`
- Password: `password123`

El sistema creará el usuario automáticamente la primera vez.

---

**¿Listo?** → Abre `SOLUCION-ERRORES.md` y sigue los pasos.
