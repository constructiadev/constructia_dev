// ConstructIA - Diagnóstico de Conexión Supabase
// Herramienta para verificar y diagnosticar problemas de conexión

export interface SupabaseDiagnostics {
  configurationStatus: 'valid' | 'invalid' | 'missing';
  urlStatus: 'valid' | 'invalid' | 'missing';
  anonKeyStatus: 'valid' | 'invalid' | 'missing';
  serviceKeyStatus: 'valid' | 'invalid' | 'missing';
  connectionTest: 'success' | 'failed' | 'pending';
  errors: string[];
  recommendations: string[];
}

export class SupabaseDiagnosticsService {
  static async runDiagnostics(): Promise<SupabaseDiagnostics> {
    const diagnostics: SupabaseDiagnostics = {
      configurationStatus: 'missing',
      urlStatus: 'missing',
      anonKeyStatus: 'missing',
      serviceKeyStatus: 'missing',
      connectionTest: 'pending',
      errors: [],
      recommendations: []
    };

    console.log('🔍 [Diagnostics] Iniciando diagnóstico de Supabase...');

    // 1. Verificar variables de entorno
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const serviceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

    console.log('📋 [Diagnostics] Variables de entorno:');
    console.log('   VITE_SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING');
    console.log('   VITE_SUPABASE_ANON_KEY:', anonKey ? 'SET' : 'MISSING');
    console.log('   VITE_SUPABASE_SERVICE_ROLE_KEY:', serviceKey ? 'SET' : 'MISSING');

    // 2. Validar URL
    if (!supabaseUrl) {
      diagnostics.urlStatus = 'missing';
      diagnostics.errors.push('❌ VITE_SUPABASE_URL no está configurada');
      diagnostics.recommendations.push('Añade VITE_SUPABASE_URL=https://tu-proyecto.supabase.co en tu archivo .env');
    } else if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
      diagnostics.urlStatus = 'invalid';
      diagnostics.errors.push('❌ VITE_SUPABASE_URL tiene formato inválido');
      diagnostics.recommendations.push('La URL debe tener formato: https://tu-proyecto-id.supabase.co');
    } else {
      diagnostics.urlStatus = 'valid';
      console.log('✅ [Diagnostics] URL válida:', supabaseUrl);
    }

    // 3. Validar Anon Key
    if (!anonKey) {
      diagnostics.anonKeyStatus = 'missing';
      diagnostics.errors.push('❌ VITE_SUPABASE_ANON_KEY no está configurada');
      diagnostics.recommendations.push('Añade VITE_SUPABASE_ANON_KEY desde tu dashboard de Supabase > Settings > API');
    } else if (anonKey.length < 100) {
      diagnostics.anonKeyStatus = 'invalid';
      diagnostics.errors.push('❌ VITE_SUPABASE_ANON_KEY parece inválida (muy corta)');
      diagnostics.recommendations.push('Verifica que copiaste la clave completa desde Supabase Dashboard');
    } else {
      diagnostics.anonKeyStatus = 'valid';
      console.log('✅ [Diagnostics] Anon Key válida');
    }

    // 4. Validar Service Key
    if (!serviceKey) {
      diagnostics.serviceKeyStatus = 'missing';
      diagnostics.errors.push('❌ VITE_SUPABASE_SERVICE_ROLE_KEY no está configurada');
      diagnostics.recommendations.push('Añade VITE_SUPABASE_SERVICE_ROLE_KEY desde tu dashboard de Supabase > Settings > API');
    } else if (serviceKey.length < 100) {
      diagnostics.serviceKeyStatus = 'invalid';
      diagnostics.errors.push('❌ VITE_SUPABASE_SERVICE_ROLE_KEY parece inválida (muy corta)');
      diagnostics.recommendations.push('Verifica que copiaste la service role key completa desde Supabase Dashboard');
    } else {
      diagnostics.serviceKeyStatus = 'valid';
      console.log('✅ [Diagnostics] Service Key válida');
    }

    // 5. Test de conexión - Use centralized client to avoid creating new instances
    if (diagnostics.urlStatus === 'valid' && diagnostics.anonKeyStatus === 'valid') {
      try {
        console.log('🔌 [Diagnostics] Probando conexión a Supabase...');

        // CRITICAL: Use centralized client instead of creating a new instance
        const { supabaseClient } = await import('../lib/supabase-real');

        // Test simple de conexión
        const { data, error } = await supabaseClient
          .from('tenants')
          .select('count')
          .limit(1);

        if (error) {
          diagnostics.connectionTest = 'failed';
          diagnostics.errors.push(`❌ Error de conexión: ${error.message}`);

          if (error.message.includes('Failed to fetch')) {
            diagnostics.recommendations.push('Verifica tu conexión a internet y que la URL de Supabase sea correcta');
          } else if (error.message.includes('Invalid API key')) {
            diagnostics.recommendations.push('Verifica que las claves de API sean correctas y estén activas');
          } else if (error.message.includes('relation') && error.message.includes('does not exist')) {
            diagnostics.recommendations.push('La tabla no existe. Ejecuta las migraciones de Supabase primero');
          } else {
            diagnostics.recommendations.push('Error de base de datos. Verifica la configuración en Supabase Dashboard');
          }
        } else {
          diagnostics.connectionTest = 'success';
          console.log('✅ [Diagnostics] Conexión exitosa a Supabase');
        }
      } catch (error) {
        diagnostics.connectionTest = 'failed';
        diagnostics.errors.push(`❌ Error de conexión: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        diagnostics.recommendations.push('Verifica la configuración de red y las credenciales de Supabase');
      }
    } else {
      diagnostics.connectionTest = 'failed';
      diagnostics.errors.push('❌ No se puede probar conexión: configuración inválida');
    }

    // 6. Estado general
    if (diagnostics.urlStatus === 'valid' && 
        diagnostics.anonKeyStatus === 'valid' && 
        diagnostics.serviceKeyStatus === 'valid' && 
        diagnostics.connectionTest === 'success') {
      diagnostics.configurationStatus = 'valid';
    } else if (diagnostics.errors.length > 0) {
      diagnostics.configurationStatus = 'invalid';
    } else {
      diagnostics.configurationStatus = 'missing';
    }

    return diagnostics;
  }

  static async fixCommonIssues(): Promise<string[]> {
    const fixes: string[] = [];

    try {
      // 1. Verificar si el archivo .env existe
      console.log('🔧 [Diagnostics] Verificando archivo .env...');
      
      // 2. Verificar formato de variables
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (supabaseUrl && !supabaseUrl.startsWith('https://')) {
        fixes.push('⚠️ URL de Supabase debe comenzar con https://');
      }

      // 3. Verificar que las claves no estén vacías
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const serviceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

      if (anonKey && anonKey.trim() === '') {
        fixes.push('⚠️ VITE_SUPABASE_ANON_KEY está vacía');
      }

      if (serviceKey && serviceKey.trim() === '') {
        fixes.push('⚠️ VITE_SUPABASE_SERVICE_ROLE_KEY está vacía');
      }

      // 4. Verificar formato de claves
      if (anonKey && !anonKey.startsWith('eyJ')) {
        fixes.push('⚠️ VITE_SUPABASE_ANON_KEY no parece ser un JWT válido');
      }

      if (serviceKey && !serviceKey.startsWith('eyJ')) {
        fixes.push('⚠️ VITE_SUPABASE_SERVICE_ROLE_KEY no parece ser un JWT válido');
      }

      if (fixes.length === 0) {
        fixes.push('✅ No se encontraron problemas comunes en la configuración');
      }

    } catch (error) {
      fixes.push(`❌ Error durante verificación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }

    return fixes;
  }

  static generateEnvTemplate(projectId?: string): string {
    return `# Supabase Configuration
VITE_SUPABASE_URL=https://${projectId || 'tu-proyecto-id'}.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
VITE_SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui

# Gemini AI Configuration
VITE_GEMINI_API_KEY=tu-gemini-api-key-aqui

# Instrucciones:
# 1. Ve a https://supabase.com/dashboard
# 2. Selecciona tu proyecto
# 3. Ve a Settings > API
# 4. Copia la URL del proyecto y las claves
# 5. Reemplaza los valores en este archivo
# 6. Guarda como .env en la raíz del proyecto
# 7. Reinicia el servidor de desarrollo`;
  }
}