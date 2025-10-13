# Implementación de Tenant ID y Seguimiento Real de Almacenamiento

## 📋 Resumen

Se ha implementado con éxito un sistema completo de asignación de tenant_id y seguimiento en tiempo real del almacenamiento basado en el tamaño real de los documentos en la base de datos.

## ✅ Estado de la Implementación

**Fecha:** 2025-10-13
**Estado:** ✓ COMPLETADO
**Migración:** `fix_tenant_id_and_real_storage_tracking.sql`

### Verificación de Resultados

```
✓ PASS: All clients have tenant_id
✓ PASS: All clients storage is synced
✓ PASS: All tenant_metadata storage is synced
✓ PASS: All 3 storage triggers are installed
✓ PASS: All 7 storage functions exist
```

## 🎯 Problemas Resueltos

### 1. Asignación de Tenant ID
**Problema:** 16 clientes no tenían `tenant_id` asignado, rompiendo el aislamiento multi-tenant.

**Solución:**
- Se crearon tenants para usuarios sin tenant_id
- Se actualizó `clients.tenant_id` desde `users.tenant_id`
- Se crearon registros en `tenant_metadata` para los nuevos tenants
- Todos los clientes ahora tienen tenant_id válido

### 2. Seguimiento de Almacenamiento Incorrecto
**Problema:** La barra de almacenamiento mostraba valores incorrectos porque no reflejaba el tamaño real de los documentos en la tabla `documentos`.

**Solución:**
- Se implementó cálculo real basado en `SUM(size_bytes)` de la tabla `documentos`
- Se sincronizaron los valores en `clients.storage_used` y `tenant_metadata.storage_used`
- Los valores ahora reflejan el espacio real utilizado en la base de datos

### 3. Falta de Actualización Automática
**Problema:** Los valores de almacenamiento no se actualizaban cuando se subían o eliminaban documentos.

**Solución:**
- Se crearon 3 triggers en la tabla `documentos`:
  - `trg_documentos_insert_update_storage`: Incrementa storage al insertar
  - `trg_documentos_delete_update_storage`: Decrementa storage al eliminar
  - `trg_documentos_update_update_storage`: Ajusta storage si cambia el tamaño
- Actualización automática y en tiempo real de ambas tablas (`clients` y `tenant_metadata`)

## 🔧 Componentes Implementados

### Funciones SQL Creadas

1. **`calculate_tenant_real_storage(tenant_id)`**
   - Calcula el almacenamiento real sumando `size_bytes` de todos los documentos del tenant
   - Retorna el valor en bytes

2. **`sync_storage_to_clients(tenant_id)`**
   - Sincroniza el almacenamiento real a la tabla `clients`
   - Actualiza `storage_used` y `updated_at`

3. **`sync_storage_to_tenant_metadata(tenant_id)`**
   - Sincroniza el almacenamiento real a la tabla `tenant_metadata`
   - Actualiza `storage_used`, `documents_count`, `last_activity` y `updated_at`

4. **`sync_tenant_storage(tenant_id)`**
   - Función consolidada que sincroniza ambas tablas
   - Útil para resincronizaciones manuales

5. **`update_storage_on_document_insert()`**
   - Trigger function ejecutada al insertar documentos
   - Incrementa automáticamente el storage_used

6. **`update_storage_on_document_delete()`**
   - Trigger function ejecutada al eliminar documentos
   - Decrementa automáticamente el storage_used
   - Previene valores negativos con `GREATEST(0, ...)`

7. **`update_storage_on_document_update()`**
   - Trigger function ejecutada al actualizar documentos
   - Ajusta el storage_used si cambia el tamaño del documento

### Triggers Instalados

| Trigger | Tabla | Evento | Función |
|---------|-------|--------|---------|
| `trg_documentos_insert_update_storage` | documentos | AFTER INSERT | `update_storage_on_document_insert()` |
| `trg_documentos_delete_update_storage` | documentos | AFTER DELETE | `update_storage_on_document_delete()` |
| `trg_documentos_update_update_storage` | documentos | AFTER UPDATE | `update_storage_on_document_update()` |

### Índices Agregados

```sql
CREATE INDEX idx_documentos_tenant_id ON public.documentos(tenant_id);
CREATE INDEX idx_documentos_tenant_size ON public.documentos(tenant_id, size_bytes);
```

## 📊 Datos Actuales

### Estadísticas de la Base de Datos

- **Total de Clientes:** 16
- **Clientes con tenant_id:** 16 (100%)
- **Clientes sin tenant_id:** 0
- **Total de Tenants con Documentos:** 2
- **Total de Documentos:** 19
- **Almacenamiento Total:** 4.76 MB

### Tenants con Almacenamiento

1. **Development Tenant**
   - Documentos: 13
   - Almacenamiento: 3.93 MB
   - Uso: 0.08% de 5 GB

2. **Edificaciones Savcenka S.L.**
   - Documentos: 6
   - Almacenamiento: 0.84 MB
   - Uso: 0.02% de 5 GB

## 🚀 Cómo Funciona

### Flujo de Almacenamiento

```
1. Usuario sube documento
   ↓
2. Se inserta en tabla documentos con size_bytes
   ↓
3. Trigger detecta INSERT
   ↓
4. Se actualiza clients.storage_used += size_bytes
   ↓
5. Se actualiza tenant_metadata.storage_used += size_bytes
   ↓
6. Dashboard del cliente muestra valor actualizado en tiempo real
```

### Sincronización de Datos

```sql
-- Las dos tablas siempre están sincronizadas:
clients.storage_used = SUM(documentos.size_bytes WHERE tenant_id = X)
tenant_metadata.storage_used = SUM(documentos.size_bytes WHERE tenant_id = X)
```

## 🔍 Verificación y Mantenimiento

### Script de Verificación

Ejecuta el archivo `verify-tenant-storage.sql` para verificar:
- Asignación de tenant_id
- Sincronización de storage en clients
- Sincronización de storage en tenant_metadata
- Existencia de triggers
- Existencia de funciones helper

### Resincronización Manual

Si por alguna razón los valores se desincronizaran, ejecuta:

```sql
DO $$
DECLARE
  v_tenant RECORD;
BEGIN
  FOR v_tenant IN SELECT DISTINCT id FROM public.tenants LOOP
    PERFORM sync_tenant_storage(v_tenant.id);
  END LOOP;
END $$;
```

### Consultas Útiles

**Ver almacenamiento por tenant:**
```sql
SELECT
  t.name as tenant_name,
  tm.documents_count,
  ROUND(tm.storage_used / 1024.0 / 1024.0, 2) as storage_mb,
  ROUND((tm.storage_used::numeric / NULLIF(tm.storage_limit, 0)) * 100, 2) as usage_percent
FROM public.tenant_metadata tm
JOIN public.tenants t ON t.id = tm.tenant_id
WHERE tm.storage_used > 0
ORDER BY tm.storage_used DESC;
```

**Verificar sincronización:**
```sql
SELECT
  t.name,
  c.storage_used as clients_storage,
  tm.storage_used as metadata_storage,
  COALESCE(SUM(d.size_bytes), 0) as actual_storage
FROM public.tenants t
LEFT JOIN public.clients c ON c.tenant_id = t.id
LEFT JOIN public.tenant_metadata tm ON tm.tenant_id = t.id
LEFT JOIN public.documentos d ON d.tenant_id = t.id
GROUP BY t.id, t.name, c.storage_used, tm.storage_used;
```

## 🎨 Impacto en el Frontend

### Componentes Afectados

El dashboard del cliente (`src/components/client/Dashboard.tsx`) ahora muestra:

1. **Barra de Almacenamiento Real:**
   - Refleja el tamaño real de los documentos
   - Se actualiza automáticamente al subir/eliminar documentos
   - Muestra porcentaje correcto basado en límite del plan

2. **Métricas Precisas:**
   - Total de documentos por tenant
   - Almacenamiento usado en MB/GB
   - Porcentaje de uso del límite

### Código Relevante

El hook `useClientData.ts` obtiene los datos:

```typescript
const stats = {
  totalDocuments: documentos.length,
  storageUsed: documentos.reduce((sum, d) => sum + (d.size_bytes || 0), 0),
  storageLimit: client.storage_limit
};
```

El componente Dashboard.tsx muestra:

```typescript
const getStoragePercentage = () => {
  if (!client || client.storage_limit === 0) return 0;
  return Math.round((client.storage_used / client.storage_limit) * 100);
};
```

## ⚠️ Consideraciones Importantes

### Seguridad

- Todas las funciones usan `SECURITY DEFINER` para permisos elevados
- Las políticas RLS existentes se mantienen intactas
- Los triggers previenen valores negativos de storage

### Performance

- Los índices optimizan las consultas de suma de almacenamiento
- Los triggers son eficientes y solo actualizan lo necesario
- La vista materializada `admin_tenants_overview` se refresca con datos actualizados

### Límites del Sistema

- **Límite por defecto:** 5 GB por tenant
- **Límite personalizable:** Se puede ajustar en `tenant_metadata.storage_limit`
- **Alertas:** El dashboard muestra alertas cuando el uso supera el 90%

## 📝 Notas de Migración

### Archivo de Migración

**Ubicación:** `/tmp/cc-agent/53513374/project/supabase/migrations/[timestamp]_fix_tenant_id_and_real_storage_tracking.sql`

### Pasos Ejecutados

1. ✅ Crear tenants para usuarios sin tenant_id
2. ✅ Asignar tenant_id a todos los clientes
3. ✅ Crear funciones de cálculo de almacenamiento
4. ✅ Crear triggers de actualización automática
5. ✅ Recalcular todo el almacenamiento desde documentos
6. ✅ Crear índices de performance
7. ✅ Verificar integridad de datos

## 🎉 Resultado Final

**100% de clientes con tenant_id asignado**
**100% de almacenamiento sincronizado y en tiempo real**
**Sistema robusto con actualizaciones automáticas**

La plataforma ahora tiene un sistema de seguimiento de almacenamiento completamente funcional y preciso que refleja el uso real de cada tenant en tiempo real.
