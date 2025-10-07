# 🗄️ Migración a Bolt Database - README Principal

## 📌 Resumen

Este paquete de migración te permite **migrar tu plataforma ConstructIA de Supabase a Bolt Database Manager** de forma sencilla y segura.

---

## 📦 Contenido del Paquete

### 📄 Archivos Creados

| Archivo | Propósito | Cuándo Usar |
|---------|-----------|-------------|
| **GUIA-RAPIDA-BOLT-DB.md** | ⚡ Inicio rápido | Quieres migrar YA (15 min) |
| **INSTRUCCIONES-BOLT-DATABASE.md** | 📖 Guía completa | Quieres entender todo |
| **COMPARACION-SUPABASE-VS-BOLT.md** | 📊 Comparativa | Decidir si migrar |
| **bolt-database-migration.sql** | 🔧 Script SQL | Crear el schema |
| **scripts/exportDataFromSupabase.js** | 💾 Backup | Exportar datos actuales |

---

## 🚀 Inicio Rápido (3 Opciones)

### Opción 1: ⚡ Rápido (15 minutos)
```bash
# Lee y sigue:
GUIA-RAPIDA-BOLT-DB.md
```
Para usuarios que quieren migrar inmediatamente.

---

### Opción 2: 📖 Completo (30 minutos)
```bash
# Lee en orden:
1. COMPARACION-SUPABASE-VS-BOLT.md  # Entender diferencias
2. INSTRUCCIONES-BOLT-DATABASE.md   # Seguir paso a paso
```
Para usuarios que quieren entender completamente el proceso.

---

### Opción 3: 🔍 Evaluación (45 minutos)
```bash
# Lee todo para decidir:
1. COMPARACION-SUPABASE-VS-BOLT.md  # ¿Debo migrar?
2. INSTRUCCIONES-BOLT-DATABASE.md   # ¿Cómo migro?
3. Prueba en un proyecto test
4. Decide si migrar producción
```
Para usuarios que necesitan evaluar antes de migrar.

---

## 📋 Checklist de Migración

### Antes de Empezar
- [ ] Leer **COMPARACION-SUPABASE-VS-BOLT.md** para entender diferencias
- [ ] Decidir si Bolt Database es adecuado para tu caso
- [ ] Hacer backup de datos actuales de Supabase
- [ ] Tener acceso a Bolt.new con Claude Agent

### Durante la Migración
- [ ] Abrir Bolt Database Manager
- [ ] Ejecutar `bolt-database-migration.sql`
- [ ] Verificar que se crearon 30+ tablas
- [ ] Confirmar datos iniciales (tenant demo)
- [ ] Actualizar configuración de la app

### Después de Migrar
- [ ] Probar funcionalidad básica
- [ ] Verificar que no hay errores en consola
- [ ] Probar crear empresas, obras, documentos
- [ ] Configurar backups manuales regulares
- [ ] Documentar cambios para tu equipo

---

## 🎯 ¿Debo Migrar?

### ✅ Migra a Bolt Database si:
- Supabase te está dando muchos errores
- Tu proyecto vive completamente en Bolt.new
- Quieres cero configuración
- No necesitas features avanzadas de PostgreSQL
- Prefieres todo integrado en un lugar

### ⚠️ Considera mantener Supabase si:
- Necesitas Row Level Security complejo
- Usas funciones PL/pgSQL personalizadas
- Necesitas triggers complejos
- Requieres backups automáticos
- Tu app es crítica para producción
- Necesitas realtime subscriptions

**Lee**: `COMPARACION-SUPABASE-VS-BOLT.md` para más detalles

---

## 📚 Guía de Archivos Detallada

### 1. GUIA-RAPIDA-BOLT-DB.md
```
📄 Contenido:
- Checklist de 6 pasos
- 15 minutos de inicio a fin
- Comandos exactos a ejecutar
- Verificaciones rápidas

🎯 Para quién:
- Usuarios con prisa
- Ya decidiste migrar
- Quieres hacerlo YA

⏱️ Tiempo: 15 minutos
```

### 2. INSTRUCCIONES-BOLT-DATABASE.md
```
📄 Contenido:
- Guía paso a paso completa
- Explicaciones detalladas
- Solución de problemas
- Comparación de features
- Verificaciones exhaustivas

🎯 Para quién:
- Primera vez migrando
- Quieres entender todo
- Necesitas referencia completa

⏱️ Tiempo: 30-45 minutos
```

### 3. COMPARACION-SUPABASE-VS-BOLT.md
```
📄 Contenido:
- Comparación técnica detallada
- Tabla de características
- Casos de uso recomendados
- Matriz de decisión
- Pros y contras

🎯 Para quién:
- Evaluando opciones
- Necesitas justificar decisión
- Quieres datos completos

⏱️ Tiempo: 20-30 minutos lectura
```

### 4. bolt-database-migration.sql
```
📄 Contenido:
- Schema completo optimizado
- 33 tipos ENUM
- 30+ tablas
- Índices para rendimiento
- Triggers para timestamps
- Datos iniciales

🎯 Para quién:
- TODOS (archivo crítico)
- Es el script principal

⏱️ Tiempo: Ejecuta en 30-60 segundos
```

### 5. scripts/exportDataFromSupabase.js
```
📄 Contenido:
- Script Node.js
- Exporta todas las tablas
- Guarda en JSON
- Respeta dependencias

🎯 Para quién:
- Tienes datos en Supabase
- Quieres hacer backup
- Planeas importar datos

⏱️ Tiempo: 2-5 minutos ejecución
```

---

## 🔧 Instalación y Uso

### Paso 1: Preparación

```bash
# 1. Hacer backup (OPCIONAL pero recomendado)
node scripts/exportDataFromSupabase.js

# Output: exports/supabase-backup-[fecha].json
```

### Paso 2: Migración

```bash
# 2. Sigue la guía rápida
# Lee: GUIA-RAPIDA-BOLT-DB.md

# O la guía completa
# Lee: INSTRUCCIONES-BOLT-DATABASE.md
```

### Paso 3: Verificación

```sql
-- En Bolt Database SQL Editor:

-- Contar tablas
SELECT COUNT(*) FROM information_schema.tables
WHERE table_schema = 'public';
-- Esperado: 30+

-- Ver tenant demo
SELECT * FROM tenants;
-- Esperado: 1 fila
```

---

## 🆘 Ayuda y Soporte

### Problemas Comunes

**1. "Ask Bolt to start your database"**
```
Solución: En el chat de Bolt, escribe:
"Por favor, inicializa una base de datos para este proyecto"
```

**2. Error "type already exists"**
```
✅ Normal - Ignora y continúa
El script es idempotente
```

**3. Tablas no aparecen**
```
Solución:
1. Refresca el Database Manager
2. Cierra y vuelve a abrir
3. Verifica con SQL query
```

**4. La app no conecta**
```
Solución:
1. Verifica .env tiene credenciales correctas
2. REINICIA el servidor (Ctrl+C → npm run dev)
3. Revisa consola del navegador (F12)
```

### Documentación Completa de Problemas

📖 Lee sección "Solución de Problemas" en:
- `INSTRUCCIONES-BOLT-DATABASE.md` (más completa)
- `GUIA-RAPIDA-BOLT-DB.md` (versión rápida)

---

## 📊 Arquitectura del Schema

### Tablas Core (12)
```
tenants              → Clientes del sistema (multi-tenant)
empresas             → Compañías de construcción
obras                → Proyectos de construcción
proveedores          → Subcontratistas
trabajadores         → Empleados
maquinaria           → Equipos y maquinaria
documentos           → Gestión documental
tareas               → Sistema de tareas
requisitos_plataforma → Requisitos por plataforma
mapping_templates    → Plantillas de mapeo
adaptadores          → Conectores externos
jobs_integracion     → Jobs de integración
```

### Tablas de Gestión (8)
```
suscripciones        → Planes de suscripción
auditoria            → Logs de auditoría
mensajes             → Sistema de mensajería
reportes             → Informes generados
token_transactions   → Transacciones
checkout_providers   → Proveedores de pago
mandatos_sepa        → Mandatos SEPA
system_configurations → Config del sistema
```

### Tablas de Compliance (5)
```
compliance_checks              → Verificaciones
data_subject_requests         → Solicitudes RGPD
privacy_impact_assessments    → Evaluaciones
data_breaches                 → Brechas
consent_records               → Consentimientos
```

**Total**: 25 tablas + 33 tipos ENUM

---

## 🔐 Seguridad y Backups

### ⚠️ IMPORTANTE: Backups Manuales

Bolt Database **NO** tiene backups automáticos conocidos.

**Debes hacer backups regularmente:**

```bash
# Opción 1: Script de exportación (recomendado)
node scripts/exportDataFromSupabase.js

# Opción 2: SQL manual
# En Bolt Database SQL Editor:
COPY (SELECT * FROM mi_tabla) TO 'backup.csv' CSV HEADER;
```

**Frecuencia recomendada:**
- 📅 Diario: Para apps en producción
- 📅 Semanal: Para desarrollo activo
- 📅 Antes de cambios: Siempre antes de modificar schema

---

## 🎓 Recursos Adicionales

### Documentación Oficial

- **Bolt Database**: https://support.bolt.new/cloud/database
- **Bolt Community**: https://discord.com/invite/stackblitz
- **Supabase** (referencia): https://supabase.com/docs

### Archivos del Proyecto

```
📁 Raíz del proyecto
├── 📄 GUIA-RAPIDA-BOLT-DB.md              ← Inicio rápido
├── 📄 INSTRUCCIONES-BOLT-DATABASE.md      ← Guía completa
├── 📄 COMPARACION-SUPABASE-VS-BOLT.md     ← Comparativa
├── 📄 bolt-database-migration.sql         ← Script SQL
├── 📄 MIGRACION-BOLT-DATABASE-README.md   ← Este archivo
└── 📁 scripts/
    └── 📄 exportDataFromSupabase.js       ← Export script
```

---

## 📈 Roadmap Post-Migración

### Semana 1: Estabilización
- [ ] Migrar a Bolt Database
- [ ] Verificar funcionalidad básica
- [ ] Configurar backups manuales
- [ ] Documentar cambios para el equipo
- [ ] Monitorear errores

### Semana 2-4: Evaluación
- [ ] Evaluar rendimiento
- [ ] Identificar limitaciones
- [ ] Adaptar código si es necesario
- [ ] Comparar con Supabase anterior
- [ ] Decidir si continuar o revertir

### Mes 2+: Optimización
- [ ] Optimizar queries
- [ ] Agregar índices si necesario
- [ ] Implementar caché si aplica
- [ ] Escalar según necesidad
- [ ] Evaluar features adicionales

---

## ✨ Características del Schema Migrado

### ✅ Incluye:
- 33 tipos ENUM para validación
- 25 tablas completamente relacionadas
- Índices optimizados para rendimiento
- Triggers para timestamps automáticos
- Constraints para integridad de datos
- Tenant demo listo para usar
- Configuración inicial del sistema

### ⚠️ Adaptaciones necesarias:
- RLS puede requerir lógica en la app
- Funciones de auth (auth.uid()) pueden necesitar alternativa
- Triggers complejos pueden necesitar adaptación
- Backups deben ser manuales

---

## 🎉 ¡Éxito!

Una vez completada la migración, tendrás:

- ✅ Base de datos nativa en Bolt
- ✅ Cero dependencias externas
- ✅ Todo integrado en un lugar
- ✅ Schema completo y funcional
- ✅ Datos listos para usar

### Próximos Pasos:

1. **Prueba tu aplicación**
   - Inicia sesión
   - Crea empresas
   - Crea proyectos
   - Sube documentos

2. **Configura backups**
   - Programa exportaciones regulares
   - Guarda en lugar seguro

3. **Monitorea rendimiento**
   - Usa Security Audit en Bolt
   - Revisa logs regularmente

4. **Disfruta la estabilidad**
   - Sin errores de Supabase
   - Todo en un solo lugar

---

## 📞 Contacto y Contribuciones

### ¿Encontraste un problema?
1. Revisa la sección "Solución de Problemas"
2. Consulta `INSTRUCCIONES-BOLT-DATABASE.md`
3. Pregunta en Discord de Bolt.new

### ¿Mejoras al script?
Si mejoras estos scripts o documentación:
1. Documenta los cambios
2. Comparte con la comunidad
3. Ayuda a otros desarrolladores

---

## 📝 Notas de Versión

**Versión**: 1.0
**Fecha**: Octubre 2025
**Compatible con**:
- Bolt.new con Claude Agent
- ConstructIA Platform v1.0
- PostgreSQL-compatible SQL

**Cambios en esta versión**:
- ✨ Creación inicial del paquete de migración
- ✨ Script SQL optimizado para Bolt
- ✨ Documentación completa en español
- ✨ Script de exportación de datos
- ✨ Guía rápida y completa

---

## ⚖️ Licencia y Uso

Este paquete de migración es parte del proyecto ConstructIA.

**Puedes**:
- ✅ Usar estos scripts en tu proyecto
- ✅ Modificar según tus necesidades
- ✅ Compartir con otros desarrolladores
- ✅ Mejorar y contribuir

**Debes**:
- 📖 Leer la documentación antes de usar
- 💾 Hacer backups antes de migrar
- 🧪 Probar en entorno de desarrollo primero
- 🔐 Proteger tus credenciales

---

## 🙏 Agradecimientos

Gracias por usar este paquete de migración. Esperamos que facilite tu transición de Supabase a Bolt Database.

**¡Buena suerte con tu migración!** 🚀

---

**Última actualización**: Octubre 2025
**Mantenedor**: Sistema ConstructIA
**Soporte**: Ver sección de Ayuda y Soporte arriba

