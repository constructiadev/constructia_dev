```sql
-- Eliminar la tabla 'system_configurations' si existe
DROP TABLE IF EXISTS public.system_configurations CASCADE;

-- Opcional: Eliminar el tipo ENUM 'compliance_status' si ya no es referenciado por ninguna otra tabla
-- Si 'compliance_status' solo era usado por 'system_configurations' y 'compliance_checks'
-- y 'compliance_checks' se mantiene, entonces no se debe eliminar.
-- Si 'compliance_checks' también se eliminara, entonces se podría considerar eliminar el ENUM.
-- Por ahora, solo eliminamos la tabla.
```