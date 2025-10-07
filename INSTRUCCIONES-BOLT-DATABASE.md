# 🗄️ Guía Completa: Crear Base de Datos en Bolt Database Manager

## 📋 Índice
1. [Información Importante](#información-importante)
2. [Requisitos Previos](#requisitos-previos)
3. [Acceder al Database Manager de Bolt](#acceder-al-database-manager-de-bolt)
4. [Ejecutar el Script de Migración](#ejecutar-el-script-de-migración)
5. [Verificar la Instalación](#verificar-la-instalación)
6. [Actualizar la Aplicación](#actualizar-la-aplicación)
7. [Solución de Problemas](#solución-de-problemas)
8. [Diferencias con Supabase](#diferencias-con-supabase)

---

## 📌 Información Importante

### ¿Qué es Bolt Database?

Bolt Database es el gestor de base de datos nativo de Bolt.new que:
- ✅ Se crea automáticamente con tu proyecto
- ✅ No requiere configuración externa
- ✅ Está totalmente integrado con el entorno de desarrollo
- ✅ Incluye autenticación y almacenamiento incorporados
- ✅ Proporciona monitoreo y logs integrados
- ✅ Soporta bases de datos ilimitadas

### ¿Por qué migrar desde Supabase?

Si Supabase te está dando errores, Bolt Database ofrece:
- 🚀 Mayor estabilidad dentro del ecosistema Bolt
- 🔧 Configuración cero - ya está listo para usar
- 🔒 Seguridad integrada sin configuración adicional
- 📊 Interfaz visual para gestión de datos
- 💾 Sin límites de proyectos en el plan gratuito

### ⚠️ Consideraciones Importantes

**ANTES DE COMENZAR**, debes saber:

1. **Tecnología de Base de Datos**: Bolt Database usa una base de datos SQL compatible con PostgreSQL
2. **Limitaciones Conocidas**:
   - Version History NO restaura bases de datos
   - Requiere usar Claude Agent (no v1 Agent legacy)
3. **Compatibilidad**: La mayoría de SQL estándar funciona, pero algunas características avanzadas de PostgreSQL pueden requerir adaptación

---

## 🎯 Requisitos Previos

Antes de comenzar, asegúrate de:

- [ ] Estar usando **Bolt.new con Claude Agent** (no v1 Agent)
- [ ] Tener tu proyecto abierto en Bolt.new
- [ ] Tener el archivo `bolt-database-migration.sql` listo (se creará en el siguiente paso)
- [ ] Hacer backup de tus datos actuales de Supabase (si tienes datos importantes)

---

## 🔐 Acceder al Database Manager de Bolt

### Paso 1: Localizar el Ícono de Base de Datos

1. En tu proyecto de Bolt.new, busca en la **barra superior central**
2. Encontrarás un ícono de **Base de Datos** (cilindro/disco)
3. Haz clic en el ícono de base de datos

![Ubicación del Database Manager](https://support.bolt.new/cloud/database)

### Paso 2: Interfaz del Database Manager

Al abrir el Database Manager verás:

```
┌─────────────────────────────────────────────┐
│  Ask Bolt to start your database           │
│                                             │
│  Create tables, manage relationships, and  │
│  configure your database schema directly   │
│  from your project settings.               │
└─────────────────────────────────────────────┘
```

### Paso 3: Inicializar la Base de Datos

Si ves el mensaje "Ask Bolt to start your database", tienes dos opciones:

#### Opción A: Pedir a Claude Agent que Inicialice
```
En el chat de Bolt, escribe:
"Por favor, inicializa una base de datos para este proyecto"
```

#### Opción B: Crear Directamente desde la Interfaz
1. Si hay un botón "Create Database" o similar, haz clic
2. Espera 10-30 segundos mientras Bolt crea la base de datos
3. Verás que la interfaz cambia a mostrar el SQL Editor

### Paso 4: Acceder al SQL Editor

Una vez inicializada la base de datos, verás:
- 📊 **Table View**: Panel lateral con lista de tablas
- 📝 **SQL Editor**: Área central para escribir consultas
- 🔒 **Security Audit**: Pestaña para auditoría de seguridad
- 📈 **Monitoring**: Logs y métricas (si está disponible)

---

## 🚀 Ejecutar el Script de Migración

### IMPORTANTE: Sobre el Script de Migración

Este proyecto incluye un archivo SQL adaptado específicamente para Bolt Database:
- **Archivo**: `bolt-database-migration.sql`
- **Contenido**: Esquema completo de ConstructIA optimizado para Bolt
- **Tablas**: 30+ tablas con relaciones completas
- **Características**: Enums, índices, triggers, y políticas de seguridad

### Paso 1: Abrir el Script de Migración

1. En tu editor de código local (o en Bolt), abre el archivo:
   ```
   bolt-database-migration.sql
   ```

2. El archivo está organizado en secciones:
   ```sql
   -- SECCIÓN 1: CREAR TIPOS ENUM (33 tipos)
   -- SECCIÓN 2: CREAR TABLAS CORE (30+ tablas)
   -- SECCIÓN 3: CREAR ÍNDICES
   -- SECCIÓN 4: CREAR TRIGGERS
   -- SECCIÓN 5: DATOS INICIALES
   -- SECCIÓN 6: VERIFICACIÓN
   ```

### Paso 2: Ejecutar el Script Completo

Tienes dos opciones:

#### Opción A: Ejecución Completa (Recomendada)

1. **Selecciona TODO el contenido** del archivo `bolt-database-migration.sql`
   - Usa `Ctrl+A` (Windows/Linux) o `Cmd+A` (Mac)

2. **Copia el contenido**
   - Usa `Ctrl+C` (Windows/Linux) o `Cmd+C` (Mac)

3. **Pega en el SQL Editor de Bolt**
   - Haz clic en el área del SQL Editor
   - Usa `Ctrl+V` (Windows/Linux) o `Cmd+V` (Mac)

4. **Ejecuta el Script**
   - Busca el botón **"Run"** o **"Execute"** (generalmente verde)
   - Haz clic para ejecutar
   - ⏳ **Espera 30-60 segundos** (el script es grande)

5. **Observa los Resultados**
   - Si todo va bien, verás mensajes de éxito
   - Deberías ver: `Schema created successfully`

#### Opción B: Ejecución Por Secciones (Si Hay Errores)

Si la ejecución completa falla, ejecuta por secciones:

**SECCIÓN 1: Tipos ENUM (líneas 1-50 aprox.)**
```sql
-- Copia y ejecuta solo la SECCIÓN 1
-- Verifica que se crean los 33 tipos ENUM
```

**SECCIÓN 2: Tablas Core (líneas 50-400 aprox.)**
```sql
-- Copia y ejecuta la SECCIÓN 2
-- Verifica que se crean las tablas principales
```

**SECCIÓN 3: Índices (líneas 400-450 aprox.)**
```sql
-- Copia y ejecuta la SECCIÓN 3
-- Mejora el rendimiento de las consultas
```

**SECCIÓN 4: Triggers (líneas 450-500 aprox.)**
```sql
-- Copia y ejecuta la SECCIÓN 4
-- Actualización automática de timestamps
```

**SECCIÓN 5: Datos Iniciales (líneas 500-550 aprox.)**
```sql
-- Copia y ejecuta la SECCIÓN 5
-- Inserta tenant y configuración por defecto
```

### Paso 3: Revisar Mensajes de Error (Si los hay)

Si ves errores, lee cuidadosamente el mensaje:

**Error Común 1: "type already exists"**
```
✅ ESTO ESTÁ BIEN - El script es idempotente
El tipo ya fue creado, continúa con el siguiente
```

**Error Común 2: "table already exists"**
```
✅ ESTO ESTÁ BIEN - La tabla ya existe
Puedes continuar con el siguiente comando
```

**Error Común 3: "syntax error"**
```
❌ PROBLEMA - Revisa que copiaste el script completo
Verifica que no se cortó ninguna línea
```

**Error Común 4: "unsupported feature"**
```
⚠️ POSIBLE INCOMPATIBILIDAD
Algunas características de PostgreSQL pueden no estar disponibles
Consulta la sección de Diferencias con Supabase
```

---

## ✅ Verificar la Instalación

### Verificación Visual

1. **En el Table View** (panel lateral izquierdo), deberías ver:

```
📋 Tablas Creadas (30+):
├── tenants
├── empresas
├── obras
├── proveedores
├── trabajadores
├── maquinaria
├── documentos
├── tareas
├── requisitos_plataforma
├── mapping_templates
├── adaptadores
├── jobs_integracion
├── suscripciones
├── auditoria
├── mensajes
├── reportes
├── token_transactions
├── checkout_providers
├── mandatos_sepa
├── system_configurations
├── compliance_checks
├── data_subject_requests
├── privacy_impact_assessments
├── data_breaches
└── consent_records
```

### Verificación con SQL

Ejecuta estas consultas para verificar:

**1. Contar Tablas Creadas**
```sql
SELECT COUNT(*) as total_tables
FROM information_schema.tables
WHERE table_schema = 'public';
```
✅ Resultado esperado: `30` o más

**2. Verificar Tipos ENUM**
```sql
SELECT typname
FROM pg_type
WHERE typtype = 'e'
ORDER BY typname;
```
✅ Resultado esperado: `33 tipos ENUM`

**3. Verificar Datos Iniciales**
```sql
-- Debe existir el tenant demo
SELECT * FROM tenants;

-- Debe existir la configuración del sistema
SELECT * FROM system_configurations;
```
✅ Resultado esperado: `1 tenant`, `1 configuración`

**4. Verificar Relaciones**
```sql
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name;
```
✅ Resultado esperado: `40+ relaciones de foreign keys`

### Verificación de Seguridad

1. **Haz clic en la pestaña "Security Audit"**
2. Verifica que:
   - ✅ RLS está habilitado en todas las tablas
   - ✅ Las políticas de acceso están configuradas
   - ✅ No hay vulnerabilidades detectadas

---

## 🔄 Actualizar la Aplicación

Una vez que la base de datos está creada en Bolt, necesitas actualizar tu aplicación para usarla.

### Paso 1: Obtener Credenciales de Bolt Database

1. En el Database Manager, busca una sección de **"Connection Settings"** o **"API Keys"**
2. Copia las credenciales que proporcione Bolt
3. Probablemente serán similares a:
   ```
   DATABASE_URL=bolt://...
   DATABASE_API_KEY=...
   ```

### Paso 2: Actualizar Variables de Entorno

**OPCIÓN A: Si Bolt maneja automáticamente la conexión**

Si estás usando Claude Agent y la base de datos se creó automáticamente, es posible que NO necesites actualizar nada. Bolt puede conectar automáticamente.

**OPCIÓN B: Si necesitas configurar manualmente**

1. Crea o actualiza el archivo `.env` en la raíz del proyecto:

```env
# === BOLT DATABASE CONFIGURATION ===
# Reemplaza con tus credenciales reales de Bolt Database
VITE_DATABASE_URL=bolt://tu-proyecto.bolt.database
VITE_DATABASE_API_KEY=tu_api_key_aqui

# === COMENTADAS: SUPABASE (YA NO SE USA) ===
# VITE_SUPABASE_URL=https://xxx.supabase.co
# VITE_SUPABASE_ANON_KEY=xxx
# VITE_SUPABASE_SERVICE_ROLE_KEY=xxx
```

### Paso 3: Actualizar el Cliente de Base de Datos

Si tu aplicación usa un cliente específico, necesitarás actualizarlo.

**Archivos a revisar**:
- `src/lib/supabase.ts`
- `src/lib/supabase-real.ts`
- `src/lib/supabase-new.ts`

**Cambios necesarios**: (Dependerá de cómo Bolt expone su API)

```typescript
// ANTES (Supabase):
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// DESPUÉS (Bolt Database):
// Usa el cliente que Bolt proporciona
// Esto puede variar según la implementación de Bolt
```

### Paso 4: Reiniciar el Servidor de Desarrollo

**MUY IMPORTANTE**: Los cambios en `.env` solo se cargan al iniciar.

1. Si el servidor está corriendo, **detenlo**: `Ctrl+C`
2. **Inicia de nuevo**: `npm run dev`
3. Espera a que cargue completamente

### Paso 5: Probar la Aplicación

1. Abre tu aplicación en el navegador
2. Verifica que:
   - ✅ No hay errores en la consola del navegador (F12)
   - ✅ Puedes iniciar sesión
   - ✅ El dashboard carga correctamente
   - ✅ Puedes crear y ver datos

---

## 🔧 Solución de Problemas

### Problema 1: "Ask Bolt to start your database" no desaparece

**Causa**: La base de datos no se ha inicializado

**Solución**:
1. En el chat de Bolt, escribe: "Inicializa la base de datos"
2. Espera a que Claude Agent cree la base de datos
3. Refresca la página del Database Manager

### Problema 2: Error "syntax error at or near..."

**Causa**: SQL no compatible o mal formado

**Soluciones**:
1. Verifica que copiaste el script completo
2. Intenta ejecutar sección por sección
3. Revisa que no haya caracteres especiales corruptos
4. Algunas características de PostgreSQL pueden no estar soportadas

### Problema 3: Error "type ... already exists"

**Causa**: Ya ejecutaste parte del script anteriormente

**Solución**:
✅ **Esto está bien** - El script está diseñado para ser idempotente
- Continúa con la siguiente sección
- O ignora el error y continúa ejecutando

### Problema 4: Error "relation ... does not exist"

**Causa**: Intentas crear una relación antes de que exista la tabla referenciada

**Solución**:
1. Ejecuta el script en orden (SECCIÓN 1 → SECCIÓN 2 → etc.)
2. Verifica que las tablas padre se crearon primero
3. Ejemplo: `tenants` debe existir antes de `empresas`

### Problema 5: Tablas no aparecen en el Table View

**Causa**: Interfaz no actualizada o script no ejecutado completamente

**Solución**:
1. Refresca la página del Database Manager
2. Cierra y vuelve a abrir el Database Manager
3. Ejecuta esta consulta para verificar:
   ```sql
   SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public';
   ```

### Problema 6: La aplicación no conecta con Bolt Database

**Causa**: Configuración incorrecta o credenciales faltantes

**Solución**:
1. Verifica el archivo `.env` tiene las credenciales correctas
2. Asegúrate de haber **reiniciado** el servidor
3. Revisa la consola del navegador (F12) para ver errores específicos
4. Verifica que el cliente de base de datos esté configurado correctamente

### Problema 7: "Version History" borró mi base de datos

**⚠️ ADVERTENCIA IMPORTANTE**:
- Bolt Database NO soporta restauración con Version History
- Si vuelves a una versión anterior, la base de datos NO cambia
- **Haz backups regulares** de tus datos importantes

**Solución de prevención**:
1. Exporta datos regularmente con:
   ```sql
   COPY (SELECT * FROM mi_tabla) TO 'backup.csv' CSV HEADER;
   ```
2. Documenta los cambios de schema
3. Usa migraciones versionadas

### Problema 8: Error "unsupported command" o "feature not available"

**Causa**: Bolt Database puede no soportar todas las características de PostgreSQL

**Solución**:
1. Identifica qué comando está fallando
2. Busca alternativas en SQL estándar
3. Consulta la documentación de Bolt sobre limitaciones
4. Posibles incompatibilidades:
   - `gen_random_uuid()` → Usa UUID generados en la app
   - Triggers complejos → Simplifica lógica
   - RLS avanzado → Puede requerir adaptación

---

## 📊 Diferencias con Supabase

### Características Soportadas

| Característica | Supabase | Bolt Database | Notas |
|---|---|---|---|
| Tablas SQL | ✅ | ✅ | Ambos soportan tablas estándar |
| Tipos ENUM | ✅ | ⚠️ | Puede requerir adaptación |
| Foreign Keys | ✅ | ✅ | Totalmente compatible |
| Índices | ✅ | ✅ | Totalmente compatible |
| Triggers | ✅ | ⚠️ | Soporte limitado |
| RLS (Row Level Security) | ✅ | ⚠️ | Implementación diferente |
| UUID autogenerado | ✅ | ⚠️ | Puede requerir cambios |
| JSONB | ✅ | ⚠️ | Verifica compatibilidad |
| Funciones PL/pgSQL | ✅ | ❌ | Limitado o no disponible |
| Auth integrado | ✅ | ✅ | Ambos tienen auth |
| Storage | ✅ | ✅ | Ambos tienen storage |
| Realtime | ✅ | ❓ | Verifica disponibilidad |

### Funciones de Autenticación

**Supabase**:
```sql
auth.uid() -- ID del usuario autenticado
auth.jwt() -- JWT del usuario
```

**Bolt Database**:
```sql
-- Puede requerir una implementación diferente
-- Consulta la documentación de Bolt para equivalentes
```

### Adaptaciones Necesarias

#### 1. Funciones de Seguridad

**Supabase**:
```sql
CREATE FUNCTION is_super_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'SuperAdmin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Bolt Database** (si no soporta funciones complejas):
```sql
-- Opción 1: Mover lógica a la aplicación
-- Opción 2: Usar políticas más simples
-- Opción 3: Implementar checks a nivel de app
```

#### 2. Generación de UUIDs

**Supabase**:
```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
```

**Bolt Database** (si no soporta):
```sql
-- Opción 1: Generar UUIDs en la app
id uuid PRIMARY KEY

-- En tu código TypeScript:
import { v4 as uuidv4 } from 'uuid';
const id = uuidv4();
```

#### 3. Row Level Security

**Supabase** (avanzado):
```sql
CREATE POLICY "complex_policy" ON my_table
  FOR SELECT
  TO authenticated
  USING (
    tenant_id = get_user_tenant_id() AND
    status = 'active' AND
    created_at > now() - interval '30 days'
  );
```

**Bolt Database** (simplificado):
```sql
-- Puede requerir políticas más simples
-- O mover lógica a la capa de aplicación
```

### Ventajas de Bolt Database

1. **Integración Total**: No necesitas salir de Bolt
2. **Configuración Cero**: Ya está listo para usar
3. **Menor Latencia**: Todo en el mismo entorno
4. **Costos**: Incluido sin costos adicionales
5. **Simplicidad**: Un solo panel de control

### Ventajas de Supabase

1. **Características Avanzadas**: PostgreSQL completo
2. **Funciones PL/pgSQL**: Lógica compleja en DB
3. **Realtime**: Subscripciones en tiempo real
4. **Madurez**: Más establecido y probado
5. **Extensiones**: PostGIS, pg_cron, etc.

---

## 🎉 Resultado Final

Si seguiste todos los pasos correctamente, ahora tienes:

- ✅ Base de datos Bolt completamente configurada
- ✅ 30+ tablas con relaciones correctas
- ✅ Índices para optimizar rendimiento
- ✅ Triggers para timestamps automáticos
- ✅ Datos iniciales (tenant demo, configuración)
- ✅ Aplicación conectada y funcionando

### Próximos Pasos Recomendados

1. **Crear Usuario de Prueba**:
   ```sql
   INSERT INTO users (email, password_hash, role, tenant_id)
   VALUES ('admin@constructia.com', 'hash_here', 'SuperAdmin',
           '10000000-0000-0000-0000-000000000001');
   ```

2. **Probar Funcionalidad**:
   - Iniciar sesión
   - Crear una empresa
   - Crear un proyecto
   - Subir un documento

3. **Monitorear Rendimiento**:
   - Revisa el tab de Security Audit
   - Verifica logs de consultas
   - Optimiza índices si es necesario

4. **Hacer Backup**:
   - Exporta datos críticos regularmente
   - Documenta el schema actual

---

## 📞 Soporte y Recursos

### Documentación Oficial

- 📚 Bolt Database Docs: https://support.bolt.new/cloud/database
- 🎓 Bolt Community: https://discord.com/invite/stackblitz

### Archivos del Proyecto

- `bolt-database-migration.sql` - Script de migración completo
- `complete-database-schema.sql` - Schema original de Supabase
- Este archivo - Instrucciones completas

### Contacto

Si encuentras problemas:
1. Revisa la sección de Solución de Problemas
2. Consulta la documentación oficial de Bolt
3. Pregunta en el Discord de Bolt.new
4. Revisa los logs del Database Manager

---

## ✨ ¡Felicidades!

Has migrado exitosamente tu base de datos de Supabase a Bolt Database Manager. Ahora tienes un entorno completamente integrado y más estable para tu plataforma ConstructIA.

**Última actualización**: Octubre 2025
**Versión de Schema**: 1.0
**Compatible con**: Bolt.new Claude Agent

---

