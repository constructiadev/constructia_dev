# Instrucciones para Configurar la Base de Datos ConstructIA

## Resumen

La base de datos completa de ConstructIA ya ha sido generada en el archivo `complete-database-schema.sql`. Este archivo contiene toda la estructura multi-tenant necesaria para la plataforma.

## Problema Actual

Las herramientas de integración con Supabase están experimentando problemas de conexión. Por lo tanto, deberás ejecutar el SQL manualmente en el panel de Supabase.

## Pasos para Ejecutar el Schema

### Opción 1: Ejecución Directa en Supabase (RECOMENDADO)

1. **Accede al Panel de Supabase**
   - Ve a: https://0ec90b57d6e95fcbda19832f.supabase.co
   - Inicia sesión con tus credenciales

2. **Abre el SQL Editor**
   - En el menú lateral, busca "SQL Editor"
   - Haz clic en "New Query"

3. **Copia y Pega el SQL**
   - Abre el archivo `complete-database-schema.sql` ubicado en la raíz del proyecto
   - Copia todo su contenido
   - Pégalo en el editor SQL de Supabase

4. **Ejecuta el Script**
   - Haz clic en el botón "Run" o presiona `Ctrl+Enter` (Windows/Linux) o `Cmd+Enter` (Mac)
   - Espera a que se complete la ejecución (puede tardar 1-2 minutos)

5. **Verifica la Creación**
   - Ve a "Table Editor" en el menú lateral
   - Deberías ver todas las tablas nuevas creadas

### Opción 2: Ejecutar en Partes (Si hay problemas)

Si el script completo da errores por ser demasiado largo, ejecuta las secciones por separado:

1. **STEP 1**: Ejecuta la sección de ENUMs (líneas 1-30)
2. **STEP 2**: Ejecuta la sección de tablas principales (líneas 31-250)
3. **STEP 3**: Ejecuta la sección de triggers (líneas 251-280)
4. **STEP 4**: Ejecuta la sección de políticas RLS (líneas 281-360)
5. **STEP 5**: Ejecuta la sección de datos por defecto (líneas 361-fin)

## Estructura Creada

El script creará:

### 🎯 Tipos ENUM (30+)
- `user_role`, `tenant_status`, `documento_categoria`, `documento_estado`
- `entidad_tipo`, `plataforma_tipo`, `perfil_riesgo`, `estado_compliance`
- Y muchos más para garantizar la consistencia de datos

### 📊 Tablas Principales (30+)
- **Core**: `tenants`, `empresas`, `obras`, `proveedores`, `trabajadores`, `maquinaria`
- **Documentos**: `documentos`, `tareas`, `requisitos_plataforma`
- **Integración**: `mapping_templates`, `adaptadores`, `jobs_integracion`
- **Subscripciones**: `suscripciones`, `token_transactions`, `checkout_providers`
- **Auditoría**: `auditoria`, `mensajes`, `reportes`
- **GDPR/Compliance**: `compliance_checks`, `data_subject_requests`, `privacy_impact_assessments`, `data_breaches`, `consent_records`
- **Sistema**: `system_configurations`, `mandatos_sepa`

### 🔐 Seguridad
- **RLS habilitado** en todas las tablas
- **Políticas multi-tenant** para aislamiento de datos
- **Funciones auxiliares** para verificación de permisos
- **Triggers automáticos** para actualización de timestamps

### 📈 Índices
- Índices optimizados para consultas por tenant
- Índices compuestos para búsquedas comunes
- Índices únicos para garantizar integridad

## Verificación Post-Instalación

Después de ejecutar el script, verifica que:

1. **Tablas Creadas**: Deberías tener ~30 tablas nuevas
2. **ENUMs Creados**: Verifica en el Schema Visualizer
3. **RLS Activo**: Todas las tablas deben tener RLS habilitado
4. **Tenant por Defecto**: Debe existir un tenant "ConstructIA Demo"

## Datos de Prueba

El tenant por defecto creado tiene este ID:
```
10000000-0000-0000-0000-000000000001
```

Puedes usarlo para crear datos de prueba.

## Solución de Problemas

### Error: "Type already exists"
- **Solución**: El script usa `DO $$ BEGIN ... EXCEPTION WHEN duplicate_object` para evitar este error. Si aún ocurre, puedes ignorarlo.

### Error: "Table already exists"
- **Solución**: El script usa `CREATE TABLE IF NOT EXISTS`. Si una tabla ya existe, no la sobrescribirá.

### Error: "Permission denied"
- **Solución**: Asegúrate de estar usando una cuenta con permisos de administrador en Supabase.

### Error de timeout
- **Solución**: Ejecuta el script en partes más pequeñas (ver Opción 2 arriba).

## Próximos Pasos

Una vez que la base de datos esté configurada:

1. La aplicación debería poder conectarse automáticamente
2. Podrás crear empresas, obras, documentos, etc.
3. El sistema multi-tenant estará completamente funcional
4. Las políticas RLS protegerán los datos de cada tenant

## Notas Importantes

- ⚠️ **BACKUP**: Si ya tienes datos en la base de datos, haz un backup antes de ejecutar este script
- 🔒 **SEGURIDAD**: No compartas las credenciales de Supabase públicamente
- 📝 **LOGS**: Revisa los logs de Supabase después de la ejecución para detectar posibles advertencias
- 🎯 **TESTING**: Después de la instalación, prueba crear un tenant, empresa y documento para verificar que todo funciona

## Contacto y Soporte

Si encuentras problemas durante la instalación, revisa:
- Los logs del SQL Editor de Supabase
- La consola del navegador para errores de permisos
- La documentación oficial de Supabase sobre migraciones

---

**Última actualización**: Octubre 2025
**Versión del Schema**: 1.0.0
**Compatible con**: Supabase v2.x
