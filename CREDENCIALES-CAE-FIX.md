# Fix: Credenciales CAE - Validación y Modal

## Problema Identificado

El sistema mostraba incorrectamente el mensaje de "Configuración Requerida: Credenciales CAE" incluso cuando el usuario ya había configurado las credenciales durante el proceso de checkout. Además, el modal para introducir credenciales no se abría cuando era necesario.

## Cambios Implementados

### 1. DocumentUpload.tsx - Mejoras en la Lógica de Validación

#### A. Verificación Mejorada de Credenciales

```typescript
const checkCaeCredentials = async () => {
  // Ahora verifica CUALQUIER credencial válida (Nalanda, CTAIMA o Ecoordina)
  // Logs detallados para debugging
  // Mensajes claros sobre el estado de las credenciales
}
```

**Mejoras:**
- Verifica que exista AL MENOS UNA credencial válida de las plataformas CAE
- Logs detallados para debugging (✅ PASS / ❌ FAIL)
- Mejor manejo de errores de base de datos

#### B. Re-validación Automática

```typescript
// Re-check cuando la ventana recupera el foco
useEffect(() => {
  window.addEventListener('focus', handleFocus);
}, []);

// Re-check cuando se actualizan credenciales
useEffect(() => {
  window.addEventListener('credentialsUpdated', handleCredentialsUpdated);
}, []);
```

**Beneficios:**
- Se actualiza automáticamente al volver de la página de configuración
- Detecta cambios en tiempo real mediante eventos personalizados
- No requiere refresh manual de la página

#### C. Modal de Configuración Integrado

```typescript
// Botón directo en el mensaje de advertencia
<button onClick={() => setShowCredentialsModal(true)}>
  Ir a Configuración de Credenciales
</button>

// Modal embebido con PlatformCredentialsManager
{showCredentialsModal && (
  <div className="modal">
    <PlatformCredentialsManager
      onCredentialsSaved={() => {
        checkCaeCredentials();
        setShowCredentialsModal(false);
      }}
    />
  </div>
)}
```

**Ventajas:**
- No requiere navegación a otra página
- Configuración instantánea dentro del flujo de trabajo
- Cierre automático tras guardar credenciales

#### D. Confirmación Antes de Upload

```typescript
const handleUpload = async () => {
  // Re-verifica credenciales antes de subir
  await checkCaeCredentials();

  if (!hasCaeCredentials) {
    const shouldConfigure = confirm('¿Desea configurar las credenciales ahora?');
    if (shouldConfigure) {
      setShowCredentialsModal(true);
    }
    return;
  }
  // Continuar con upload...
}
```

**Seguridad:**
- Verifica estado actual justo antes de upload
- Ofrece configuración inmediata si faltan credenciales
- Previene uploads sin las credenciales necesarias

### 2. PlatformCredentialsManager.tsx - Sistema de Eventos

#### A. Props Actualizadas

```typescript
interface PlatformCredentialsManagerProps {
  clientId?: string;  // Ahora opcional
  onCredentialsSaved?: () => void;  // Nuevo callback específico
  onCredentialsUpdated?: () => void;
  isReadOnly?: boolean;
}
```

**Flexibilidad:**
- Puede usarse sin clientId (usa tenant_id del usuario actual)
- Múltiples callbacks para diferentes casos de uso
- Compatible con uso desde DocumentUpload y Settings

#### B. Eventos Personalizados

```typescript
// Al guardar credenciales
window.dispatchEvent(new CustomEvent('credentialsUpdated', {
  detail: { tenantId: effectiveTenantId, timestamp: Date.now() }
}));

// Al eliminar credenciales
window.dispatchEvent(new CustomEvent('credentialsUpdated', {
  detail: { tenantId: effectiveTenantId, timestamp: Date.now() }
}));
```

**Comunicación:**
- Notifica a todos los componentes interesados
- No requiere pasar props entre componentes distantes
- Sincronización en tiempo real del estado

## Flujo de Usuario Mejorado

### Escenario 1: Usuario Nuevo sin Credenciales

1. Usuario navega a "Subir Documentos"
2. Sistema verifica credenciales → ❌ FAIL
3. Muestra banner naranja con advertencia clara
4. Usuario hace clic en "Ir a Configuración de Credenciales"
5. Modal se abre in-place
6. Usuario configura credenciales de Nalanda/CTAIMA/Ecoordina
7. Modal se cierra automáticamente
8. Sistema re-verifica → ✅ PASS
9. Banner naranja desaparece
10. Puede subir documentos

### Escenario 2: Usuario con Credenciales Configuradas

1. Usuario navega a "Subir Documentos"
2. Sistema verifica credenciales → ✅ PASS
3. Muestra banner verde: "Credenciales CAE configuradas correctamente"
4. Puede subir documentos inmediatamente

### Escenario 3: Usuario Intenta Upload sin Credenciales

1. Usuario selecciona archivos y hace clic en "Subir"
2. Sistema re-verifica credenciales justo antes del upload
3. Si faltan credenciales → Pregunta si desea configurar ahora
4. Si acepta → Abre modal de configuración
5. Si rechaza → Cancela el upload

## Validaciones Implementadas

### Credenciales Válidas Requieren:

- ✅ `is_active = true`
- ✅ `username` no vacío (trim().length > 0)
- ✅ `password` no vacío (trim().length > 0)
- ✅ `platform_type` en ['nalanda', 'ctaima', 'ecoordina']

### Condición de Éxito:

- AL MENOS UNA plataforma CAE con credenciales válidas
- No requiere las tres plataformas, solo una es suficiente

## Logs de Debugging

### Consola del Navegador:

```
🔍 [DocumentUpload] Checking CAE credentials for tenant: abc123...
📊 [DocumentUpload] Retrieved credentials: 2
✅ [DocumentUpload] Valid credential found: nalanda
✅ [DocumentUpload] CAE credentials check: PASS (1 platform(s))
```

o

```
🔍 [DocumentUpload] Checking CAE credentials for tenant: abc123...
📊 [DocumentUpload] Retrieved credentials: 0
❌ [DocumentUpload] CAE credentials check: FAIL
```

### Al Guardar Credenciales:

```
💾 [PlatformCredentials] Saving nalanda credentials for tenant: abc123...
✅ [PlatformCredentials] Saved to database successfully
🔄 [DocumentUpload] Credentials updated - rechecking
✅ [DocumentUpload] CAE credentials check: PASS (1 platform(s))
```

## Compatibilidad

- ✅ Funciona con tenant_id del usuario actual
- ✅ Funciona en panel de cliente
- ✅ Compatible con panel de administrador (puede pasar clientId)
- ✅ Mantiene compatibilidad con Settings page
- ✅ No rompe funcionalidad existente

## Testing Recomendado

1. **Test 1: Usuario sin credenciales**
   - Navegar a DocumentUpload
   - Verificar que aparece el banner naranja
   - Hacer clic en botón de configuración
   - Verificar que modal se abre
   - Guardar credenciales
   - Verificar que modal se cierra y banner desaparece

2. **Test 2: Usuario con credenciales**
   - Configurar credenciales en Settings
   - Navegar a DocumentUpload
   - Verificar banner verde
   - Intentar subir documento
   - Verificar que funciona sin problemas

3. **Test 3: Re-validación automática**
   - Abrir DocumentUpload sin credenciales
   - En otra pestaña, ir a Settings y configurar credenciales
   - Volver a la pestaña de DocumentUpload
   - Verificar que detecta las nuevas credenciales automáticamente

4. **Test 4: Modal desde upload**
   - Intentar subir sin credenciales
   - Verificar prompt de confirmación
   - Aceptar y verificar que modal se abre
   - Configurar y verificar que upload procede

## Archivos Modificados

- `/src/components/client/DocumentUpload.tsx` - 7 cambios principales
- `/src/components/client/PlatformCredentialsManager.tsx` - 3 cambios

## Notas Importantes

- El sistema ahora distingue entre "sin credenciales" vs "credenciales inválidas"
- La verificación es más robusta y tiene mejor manejo de errores
- Los logs facilitan el debugging de problemas de credenciales
- El modal integrado mejora significativamente la UX
- La re-validación automática elimina la necesidad de refresh manual
