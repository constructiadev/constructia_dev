# 🔧 INSTRUCCIONES: Crear Base de Datos en Supabase

## 🎯 Tu situación actual

Veo que tu Table Editor de Supabase está vacío. Necesitas ejecutar el script SQL para crear todas las tablas.

## 📋 Pasos a seguir

### **PASO 1: Abrir SQL Editor en Supabase**

1. En la pantalla que estás viendo (Table Editor vacío)
2. En el menú lateral izquierdo, busca y haz clic en **"SQL Editor"**
3. Verás una interfaz para escribir consultas SQL

### **PASO 2: Crear una Nueva Query**

1. En SQL Editor, haz clic en el botón **"New query"** (arriba a la derecha)
2. Se abrirá un editor de texto vacío

### **PASO 3: Copiar el Script SQL**

1. Ve a tu proyecto en el editor de código
2. Abre el archivo: **`create_all_tables.sql`**
3. **Selecciona TODO el contenido** (Ctrl+A o Cmd+A)
4. **Copia** el contenido (Ctrl+C o Cmd+C)

### **PASO 4: Pegar y Ejecutar**

1. Vuelve a Supabase SQL Editor
2. **Pega** el contenido en el editor (Ctrl+V o Cmd+V)
3. Verás un script largo con muchas líneas SQL
4. Haz clic en el botón **"Run"** (esquina inferior derecha, botón verde)
5. ⏳ **Espera** 10-30 segundos mientras se ejecuta

### **PASO 5: Verificar Resultados**

Deberías ver uno de estos mensajes:

✅ **ÉXITO**:
```
Base de datos creada exitosamente
total_tables: 12 (o más)
```

❌ **ERROR**: Si ves un error, léelo y:
- Si dice "already exists", está bien, continúa
- Si dice otro error, copia el mensaje de error completo

### **PASO 6: Verificar Tablas Creadas**

1. Vuelve al **Table Editor** (menú lateral izquierdo)
2. Haz clic en el ícono de actualizar o recarga la página
3. Deberías ver ahora una lista de tablas en el panel izquierdo:
   - ✅ tenants
   - ✅ users
   - ✅ empresas
   - ✅ obras
   - ✅ proveedores
   - ✅ trabajadores
   - ✅ maquinaria
   - ✅ documentos
   - ✅ tareas
   - ✅ suscripciones
   - ✅ auditoria
   - ✅ system_settings
   - ✅ clients

### **PASO 7: Verificar Datos de Prueba**

1. En Table Editor, haz clic en la tabla **"users"**
2. Deberías ver 2 usuarios:
   - System Admin (admin@constructia.com)
   - Demo User (demo@constructia.com)

3. Haz clic en la tabla **"empresas"**
4. Deberías ver 1 empresa:
   - Constructora Demo S.L.

5. Haz clic en la tabla **"obras"**
6. Deberías ver 1 obra:
   - Proyecto Demo

## 🎉 Una vez completado

Cuando veas todas las tablas creadas:

1. Vuelve a tu proyecto
2. Asegúrate de que el archivo .env tiene las 3 variables
3. Obtén tu Service Role Key de Supabase Dashboard → Settings → API
4. Agrégala al archivo .env
5. Reinicia el servidor (Ctrl+C → npm run dev)

## 🔍 Verificar que funciona

1. Abre tu aplicación en el navegador
2. El dashboard de Bolt ahora debería mostrar:
   - ✅ Tablas en el Table Editor de Supabase
   - ✅ Datos en tu aplicación
   - ✅ Sin errores de "Supabase not configured"

## ❗ Problemas comunes

### "syntax error near..."
- Asegúrate de copiar TODO el script completo

### "permission denied"
- Verifica que tienes permisos de admin

### "type already exists"
- Esto está bien, el script es idempotente

### Dashboard de Bolt sigue vacío
- Verifica el .env tiene SERVICE_ROLE_KEY
- REINICIA el servidor

---

**Archivo script**: create_all_tables.sql
**Estado**: ✅ Listo para ejecutar
