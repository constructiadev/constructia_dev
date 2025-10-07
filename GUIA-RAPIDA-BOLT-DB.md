# ⚡ Guía Rápida: Migración a Bolt Database

## 🎯 Objetivo
Migrar tu aplicación ConstructIA de Supabase a Bolt Database Manager en **menos de 15 minutos**.

---

## 📋 Checklist Rápido

- [ ] **PASO 1**: Hacer backup de datos actuales (5 min)
- [ ] **PASO 2**: Abrir Bolt Database Manager (1 min)
- [ ] **PASO 3**: Ejecutar script de migración (3 min)
- [ ] **PASO 4**: Verificar tablas creadas (2 min)
- [ ] **PASO 5**: Actualizar aplicación (3 min)
- [ ] **PASO 6**: Probar funcionamiento (1 min)

---

## 🚀 Pasos Rápidos

### PASO 1: Backup de Datos (OPCIONAL pero recomendado)

Si tienes datos importantes en Supabase:

```bash
# Ejecuta desde la raíz del proyecto:
node scripts/exportDataFromSupabase.js
```

✅ Esto crea un archivo en: `exports/supabase-backup-[fecha].json`

---

### PASO 2: Abrir Bolt Database Manager

1. En Bolt.new, busca el **ícono de base de datos** en la barra superior
2. Haz clic en el ícono
3. Si ves "Ask Bolt to start your database", escribe en el chat:
   ```
   Por favor, inicializa una base de datos para este proyecto
   ```
4. Espera 10-30 segundos

---

### PASO 3: Ejecutar Script de Migración

1. Abre el archivo: `bolt-database-migration.sql`
2. **Selecciona TODO** (`Ctrl+A` o `Cmd+A`)
3. **Copia** (`Ctrl+C` o `Cmd+C`)
4. En el **SQL Editor de Bolt**, pega el contenido
5. Haz clic en **"Run"** (botón verde)
6. ⏳ Espera 30-60 segundos

✅ Deberías ver: "BOLT DATABASE MIGRATION COMPLETADA"

---

### PASO 4: Verificar Tablas Creadas

En el **Table View** (panel izquierdo) deberías ver 30+ tablas:

```
✅ tenants
✅ empresas
✅ obras
✅ proveedores
✅ trabajadores
✅ maquinaria
✅ documentos
✅ tareas
✅ ... y más
```

**Verificación rápida en SQL**:
```sql
SELECT COUNT(*) FROM tenants;
```
Debe devolver: `1` (el tenant demo)

---

### PASO 5: Actualizar Aplicación

#### Opción A: Si Bolt conecta automáticamente

Si usas Claude Agent, puede que **NO necesites hacer nada**.

Intenta cargar tu app y ver si funciona directamente.

#### Opción B: Si necesitas configurar manualmente

1. Obtén las credenciales de Bolt Database Manager
2. Actualiza `.env`:
   ```env
   # Comenta Supabase:
   # VITE_SUPABASE_URL=...
   # VITE_SUPABASE_ANON_KEY=...

   # Agrega Bolt Database (si es necesario):
   VITE_DATABASE_URL=bolt://...
   VITE_DATABASE_API_KEY=...
   ```
3. **REINICIA el servidor**: `Ctrl+C` y luego `npm run dev`

---

### PASO 6: Probar Funcionamiento

1. Abre tu aplicación en el navegador
2. Verifica:
   - ✅ No hay errores en consola (F12)
   - ✅ La app carga correctamente
   - ✅ Puedes ver el dashboard

---

## 🎉 ¡Listo!

Tu aplicación ahora usa **Bolt Database** nativo.

### Ventajas obtenidas:
- ✅ Sin errores de Supabase
- ✅ Configuración cero
- ✅ Todo integrado en Bolt
- ✅ Más estabilidad

---

## ❗ Problemas Comunes

### "type already exists"
✅ **Normal** - El script es idempotente, ignora y continúa

### "syntax error"
❌ Asegúrate de copiar el script COMPLETO

### Las tablas no aparecen
🔄 Refresca el Database Manager o cierra/abre

### La app no conecta
🔄 **REINICIA** el servidor después de cambiar `.env`

---

## 📚 Documentación Completa

Para instrucciones detalladas, consulta:
- `INSTRUCCIONES-BOLT-DATABASE.md` - Guía completa paso a paso
- `bolt-database-migration.sql` - Script de migración
- `scripts/exportDataFromSupabase.js` - Exportar datos

---

## 🆘 Ayuda

Si tienes problemas:
1. Revisa `INSTRUCCIONES-BOLT-DATABASE.md` (sección "Solución de Problemas")
2. Consulta https://support.bolt.new/cloud/database
3. Pregunta en Discord de Bolt.new

---

**Última actualización**: Octubre 2025
**Tiempo estimado**: 15 minutos
**Dificultad**: Fácil

