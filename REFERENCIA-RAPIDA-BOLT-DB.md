# 🎯 Referencia Rápida - Bolt Database

## ⚡ Comandos Esenciales

### Acceso a Bolt Database
```
1. Clic en ícono de BD (barra superior)
2. Si dice "Ask Bolt to start": escribe en chat
   "Por favor, inicializa una base de datos"
3. Espera 10-30 segundos
```

### Ejecutar Migración
```sql
-- 1. Abre: bolt-database-migration.sql
-- 2. Ctrl+A (seleccionar todo)
-- 3. Ctrl+C (copiar)
-- 4. Pega en SQL Editor de Bolt
-- 5. Clic en "Run"
-- 6. Espera 30-60 segundos
```

### Verificar Instalación
```sql
-- Contar tablas (esperado: 30+)
SELECT COUNT(*) FROM information_schema.tables
WHERE table_schema = 'public';

-- Ver tenant demo (esperado: 1 fila)
SELECT * FROM tenants;

-- Listar todas las tablas
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

---

## 📁 Archivos - ¿Cuál Usar?

| Necesito... | Archivo |
|-------------|---------|
| Empezar YA (15 min) | `GUIA-RAPIDA-BOLT-DB.md` |
| Instrucciones completas | `INSTRUCCIONES-BOLT-DATABASE.md` |
| Decidir si migrar | `COMPARACION-SUPABASE-VS-BOLT.md` |
| Índice general | `MIGRACION-BOLT-DATABASE-README.md` |
| Script SQL | `bolt-database-migration.sql` |
| Backup de datos | `scripts/exportDataFromSupabase.js` |
| Esta referencia | `REFERENCIA-RAPIDA-BOLT-DB.md` |

---

## 🔥 Problemas Frecuentes

### "Ask Bolt to start your database"
```
✅ En el chat de Bolt:
"Por favor, inicializa una base de datos"
```

### Error "type already exists"
```
✅ NORMAL - Ignora y continúa
```

### Tablas no aparecen
```
✅ Refresca el Database Manager
✅ Cierra y vuelve a abrir
```

### App no conecta
```
✅ Verifica .env tiene credenciales
✅ REINICIA el servidor (Ctrl+C → npm run dev)
```

---

## 📊 Tablas Principales

```
✅ tenants              - Clientes (multi-tenant)
✅ empresas             - Compañías
✅ obras                - Proyectos
✅ proveedores          - Subcontratistas
✅ trabajadores         - Empleados
✅ maquinaria           - Equipos
✅ documentos           - Documentación
✅ tareas               - Sistema de tareas
✅ adaptadores          - Integraciones
✅ suscripciones        - Planes
✅ auditoria            - Logs
✅ mensajes             - Notificaciones
... y 13 más
```

---

## 🔐 Backup Manual

```bash
# Ejecutar desde raíz del proyecto:
node scripts/exportDataFromSupabase.js

# Output: exports/supabase-backup-[fecha].json
```

**Frecuencia recomendada:**
- Diario (producción)
- Semanal (desarrollo)
- Antes de cambios importantes

---

## 🎯 Checklist de 6 Pasos

- [ ] 1. Backup datos (opcional) - `node scripts/exportDataFromSupabase.js`
- [ ] 2. Abrir Database Manager en Bolt
- [ ] 3. Inicializar BD si es necesario
- [ ] 4. Ejecutar `bolt-database-migration.sql`
- [ ] 5. Verificar 30+ tablas creadas
- [ ] 6. Actualizar app y reiniciar servidor

---

## 📞 Ayuda

- 📖 **Guía completa**: `INSTRUCCIONES-BOLT-DATABASE.md`
- 📊 **Comparación**: `COMPARACION-SUPABASE-VS-BOLT.md`
- 🌐 **Bolt Docs**: https://support.bolt.new/cloud/database
- 💬 **Discord**: https://discord.com/invite/stackblitz

---

## ⚠️ Importante

- ❗ Bolt Database NO tiene backups automáticos
- ❗ Version History NO restaura la BD
- ❗ Haz backups manuales regularmente
- ❗ RLS puede requerir lógica en la app
- ❗ Algunas features de PostgreSQL pueden no estar

---

## ✅ Verificación Post-Migración

```bash
# 1. Build exitoso
npm run build

# 2. Servidor funcionando
npm run dev

# 3. App carga sin errores
# Abre navegador → F12 → Consola (sin errores rojos)

# 4. Funcionalidad básica
# - Iniciar sesión
# - Ver dashboard
# - Crear empresa
# - Ver listados
```

---

**Tiempo total**: 15-30 minutos
**Dificultad**: Fácil
**Última actualización**: Octubre 2025

