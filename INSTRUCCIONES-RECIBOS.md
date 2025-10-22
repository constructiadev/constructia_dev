# Sistema de Recibos Automáticos - Instrucciones de Configuración

## ✅ Cambios Implementados en el Código

### 1. Generación Automática de Recibos en el Registro
- **Archivo:** `src/lib/client-auth-service.ts`
- **Cambio:** Los recibos se crean automáticamente cuando un cliente se registra
- **Estado inicial:** `pending` con monto €0
- **Actualización:** Se actualiza al completar el checkout

### 2. Servicio de Recibos Mejorado
- **Archivo:** `src/lib/receipt-service.ts`
- **Nuevos métodos:**
  - `updateReceiptStatus()` - Actualiza el estado del recibo
  - `updateReceiptAmount()` - Actualiza los montos del recibo
  - `findPendingReceiptByClientId()` - Busca recibos pendientes
- **Estados soportados:** `pending`, `paid`, `failed`, `refunded`

### 3. Proceso de Checkout Actualizado
- **Archivo:** `src/components/auth/ClientCheckout.tsx`
- **Cambio:** Busca recibos pendientes antes de crear uno nuevo
- **Lógica:**
  - Si existe recibo pendiente → lo actualiza con datos reales
  - Si no existe → crea uno nuevo en estado `paid`
- **Compatible con:** Stripe y SEPA

### 4. Panel de Administrador - Tab de Recibos
- **Archivo:** `src/components/admin/FinancialModule.tsx`
- **Nueva pestaña:** "Recibos" con vista global
- **KPIs incluidos:**
  - Total de recibos acumulados
  - Recibos del mes actual
  - Ingresos totales acumulados
  - Ingresos del mes en curso
  - Clientes con pagos
  - Distribución por método de pago

### 5. Panel de Cliente - Vista de Recibos
- **Archivo:** `src/components/client/Receipts.tsx`
- **Funcionalidad:** Ya existente y funcionando
- **Características:**
  - Lista de todos los recibos del cliente
  - Búsqueda y filtrado
  - Descarga e impresión de recibos

---

## 📋 Base de Datos - Migración Necesaria

### Migración de Recibos
La migración completa ya existe en:
```
supabase/migrations/20251014112409_create_receipts_system_complete_fixed.sql
```

### ¿Cómo Aplicar la Migración?

#### Opción 1: Desde tu Panel de Supabase (Recomendado)
1. Abre tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Ve a **SQL Editor**
3. Copia todo el contenido del archivo: `supabase/migrations/20251014112409_create_receipts_system_complete_fixed.sql`
4. Pégalo en el editor SQL
5. Haz clic en **Run** para ejecutar la migración

#### Opción 2: Verificar si Ya Está Aplicada
Ejecuta esta consulta en el SQL Editor de Supabase:
```sql
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'receipts'
) as receipts_table_exists;
```

Si devuelve `true`, la tabla ya existe y no necesitas hacer nada.

---

## 🔍 Verificación de la Tabla `receipts`

La tabla de recibos incluye:

### Campos Principales
- `id` - UUID único del recibo
- `receipt_number` - Número de recibo (formato: REC-YYYY-NNNNNN)
- `client_id` - Referencia al cliente (FK a `clients.id`)
- `amount`, `base_amount`, `tax_amount` - Montos del recibo
- `payment_method` - Método de pago (Tarjeta, SEPA, etc.)
- `gateway_name` - Pasarela de pago (Stripe, SEPA, etc.)
- `status` - Estado: `pending`, `paid`, `failed`, `refunded`
- `transaction_id` - ID de transacción
- `payment_date` - Fecha de pago
- `subscription_plan` - Plan de suscripción

### Índices Creados
- Por `client_id` para consultas rápidas por cliente
- Por `payment_date` para ordenamiento temporal
- Por `status` para filtrado por estado
- Por `receipt_number` para búsqueda única

### Políticas RLS (Row Level Security)
✅ **Clientes:** Solo pueden ver sus propios recibos
✅ **Administradores:** Pueden ver todos los recibos
✅ **Sistema:** Puede insertar y actualizar recibos

### Funciones de Base de Datos
- `generate_receipt_number()` - Genera números únicos automáticamente
- `track_receipt_view()` - Registra visualizaciones
- `track_receipt_download()` - Registra descargas
- `get_client_receipts()` - Obtiene recibos de un cliente

### Vistas Analíticas
- `receipt_analytics` - Estadísticas agregadas por cliente
- `financial_kpis` - KPIs financieros en tiempo real

---

## 🚀 Flujo Completo del Sistema de Recibos

### 1. Registro de Cliente
```
Cliente completa registro
    ↓
Se crea tenant, user, empresa, client
    ↓
Se genera recibo automáticamente
    ↓
Estado: PENDING, Monto: €0
    ↓
Cliente es redirigido a checkout
```

### 2. Checkout y Pago
```
Cliente selecciona plan y método de pago
    ↓
Sistema busca recibo pendiente
    ↓
¿Existe recibo pendiente?
    ├─ SÍ → Actualiza monto y estado a PAID
    └─ NO → Crea nuevo recibo en estado PAID
    ↓
Recibo completo guardado en base de datos
```

### 3. Visualización
```
Panel de Cliente:
- Ve sus propios recibos
- Puede descargar PDF/HTML
- Filtrar por fecha, estado

Panel de Administrador:
- Ve todos los recibos globalmente
- KPIs acumulados y del mes
- Métricas por cliente
- Distribución por método de pago
- Exportar a CSV
```

---

## 📊 Datos que se Muestran en el Panel de Administrador

### KPIs Principales
1. **Total Acumulado**
   - Número total de recibos generados
   - Ingresos totales acumulados

2. **Mes Actual**
   - Recibos emitidos este mes
   - Ingresos del mes en curso

3. **Ingresos Totales**
   - Total histórico
   - Promedio por recibo

4. **Clientes con Pagos**
   - Número de clientes únicos con recibos
   - Porcentaje del total de clientes

### Tabla de Recibos Globales
Muestra todos los recibos de todos los clientes con:
- Número de recibo
- Nombre del cliente
- Plan de suscripción
- Método de pago
- Importe
- Comisión
- Estado (Completado, Pendiente, Fallido)
- Fecha

### Distribución por Método de Pago
Tarjetas visuales con:
- Nombre del método (Tarjeta, SEPA, PayPal, etc.)
- Total acumulado
- Número de recibos
- Porcentaje del total

---

## 🧪 Cómo Probar el Sistema

### Prueba 1: Registro de Nuevo Cliente
1. Ve a la página de registro: `/client/register`
2. Completa el formulario de registro
3. Verifica en la consola del navegador:
   ```
   ✅ [ClientAuth] Registration receipt created: REC-2025-000001
   ```
4. Ve al checkout
5. Completa el pago
6. Verifica en la consola:
   ```
   ✅ [ClientCheckout] Pending receipt updated to paid: REC-2025-000001
   ```

### Prueba 2: Ver Recibos en Panel de Cliente
1. Inicia sesión como cliente
2. Ve a la sección "Mis Recibos"
3. Deberías ver tu recibo con:
   - Número de recibo
   - Monto pagado
   - Método de pago
   - Estado: Completado
   - Opciones de descarga/impresión

### Prueba 3: Ver Recibos en Panel de Administrador
1. Inicia sesión como administrador
2. Ve a "Módulo Financiero"
3. Haz clic en la pestaña "Recibos"
4. Verifica que se muestren:
   - KPIs con datos acumulados y del mes
   - Tabla con todos los recibos de todos los clientes
   - Distribución por método de pago

---

## ⚠️ Importante

### Si la tabla `receipts` NO existe en tu base de datos:
1. **Aplica la migración** usando el SQL Editor de Supabase
2. La migración está en: `supabase/migrations/20251014112409_create_receipts_system_complete_fixed.sql`
3. Esta migración es **idempotente** (segura de ejecutar múltiples veces)

### Si la tabla YA existe:
- El código está listo para funcionar
- Los recibos se generarán automáticamente en el próximo registro
- Los clientes existentes pueden generar recibos en su próximo pago

---

## 🔄 Actualizaciones Futuras Sugeridas

### Notificaciones por Email
- Enviar recibo por email al cliente después del pago
- Recordatorios para recibos pendientes

### Facturación Recurrente
- Generación automática de recibos mensuales
- Renovación de suscripciones

### Reportes Avanzados
- Exportación de recibos a PDF
- Integración con sistemas contables
- Reportes fiscales trimestrales/anuales

### Multi-divisa
- Soporte para múltiples monedas
- Conversión automática

---

## 📞 Soporte

Si tienes problemas:
1. Verifica que la migración esté aplicada
2. Revisa la consola del navegador para logs detallados
3. Verifica las variables de entorno en `.env`
4. Asegúrate de que RLS esté correctamente configurado

---

**Estado del Sistema:** ✅ Completamente implementado y listo para usar

**Última Actualización:** 2025-10-22
