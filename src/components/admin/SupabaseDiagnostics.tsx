import React, { useState, useEffect } from 'react';
import { 
  Database, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Copy, 
  Download,
  Settings,
  Key,
  Globe,
  Shield,
  Info,
  Terminal,
  FileText,
  Zap,
  Eye,
  EyeOff,
  ExternalLink,
  Code,
  Server,
  Wifi,
  Lock
} from 'lucide-react';

interface DiagnosticResult {
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: string;
  recommendation?: string;
}

interface EnvironmentCheck {
  url: DiagnosticResult;
  anonKey: DiagnosticResult;
  serviceKey: DiagnosticResult;
  connectionTest: DiagnosticResult;
  tableCheck: DiagnosticResult;
  authTest: DiagnosticResult;
}

export default function SupabaseDiagnostics() {
  const [diagnostics, setDiagnostics] = useState<EnvironmentCheck | null>(null);
  const [loading, setLoading] = useState(false);
  const [showKeys, setShowKeys] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    setLoading(true);
    console.log('🔍 [Diagnostics] Iniciando diagnóstico completo de Supabase...');

    try {
      const results: EnvironmentCheck = {
        url: checkSupabaseUrl(),
        anonKey: checkAnonKey(),
        serviceKey: checkServiceKey(),
        connectionTest: { status: 'warning', message: 'Pendiente de prueba' },
        tableCheck: { status: 'warning', message: 'Pendiente de verificación' },
        authTest: { status: 'warning', message: 'Pendiente de prueba' }
      };

      // Test connection if basic config is valid
      if (results.url.status === 'success' && results.anonKey.status === 'success') {
        setTestingConnection(true);
        
        // Test 1: Basic connection
        results.connectionTest = await testSupabaseConnection();
        
        // Test 2: Table existence
        if (results.connectionTest.status === 'success') {
          results.tableCheck = await testTableExistence();
        }
        
        // Test 3: Auth functionality
        if (results.connectionTest.status === 'success') {
          results.authTest = await testAuthFunctionality();
        }
        
        setTestingConnection(false);
      } else {
        results.connectionTest = { 
          status: 'error', 
          message: 'No se puede probar - configuración básica inválida',
          recommendation: 'Corrige la URL y las claves antes de probar la conexión'
        };
        results.tableCheck = { 
          status: 'error', 
          message: 'No se puede verificar - sin conexión',
          recommendation: 'Establece conexión primero'
        };
        results.authTest = { 
          status: 'error', 
          message: 'No se puede probar - sin conexión',
          recommendation: 'Establece conexión primero'
        };
      }

      setDiagnostics(results);
      
      // Log summary
      const hasErrors = Object.values(results).some(r => r.status === 'error');
      const hasWarnings = Object.values(results).some(r => r.status === 'warning');
      
      if (!hasErrors && !hasWarnings) {
        console.log('✅ [Diagnostics] Configuración de Supabase completamente válida');
      } else if (hasErrors) {
        console.error('❌ [Diagnostics] Se encontraron errores críticos en la configuración');
      } else {
        console.warn('⚠️ [Diagnostics] Se encontraron advertencias en la configuración');
      }

    } catch (error) {
      console.error('Error running diagnostics:', error);
    } finally {
      setLoading(false);
      setTestingConnection(false);
    }
  };

  const checkSupabaseUrl = (): DiagnosticResult => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    
    if (!url) {
      return {
        status: 'error',
        message: 'VITE_SUPABASE_URL no está configurada',
        recommendation: 'Añade VITE_SUPABASE_URL=https://tu-proyecto.supabase.co en tu archivo .env'
      };
    }

    if (!url.startsWith('https://')) {
      return {
        status: 'error',
        message: 'URL debe comenzar con https://',
        details: `Valor actual: ${url}`,
        recommendation: 'Corrige la URL para que comience con https://'
      };
    }

    if (!url.includes('.supabase.co')) {
      return {
        status: 'error',
        message: 'URL no parece ser de Supabase',
        details: `Valor actual: ${url}`,
        recommendation: 'La URL debe tener formato: https://tu-proyecto-id.supabase.co'
      };
    }

    // Extract project ID for validation
    const projectIdMatch = url.match(/https:\/\/([^.]+)\.supabase\.co/);
    if (!projectIdMatch) {
      return {
        status: 'error',
        message: 'No se pudo extraer el ID del proyecto de la URL',
        details: `URL: ${url}`,
        recommendation: 'Verifica que la URL tenga el formato correcto'
      };
    }

    return {
      status: 'success',
      message: 'URL válida',
      details: `Proyecto: ${projectIdMatch[1]}`
    };
  };

  const checkAnonKey = (): DiagnosticResult => {
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!key) {
      return {
        status: 'error',
        message: 'VITE_SUPABASE_ANON_KEY no está configurada',
        recommendation: 'Añade la clave anon desde Supabase Dashboard > Settings > API'
      };
    }

    if (key.length < 100) {
      return {
        status: 'error',
        message: 'Clave anon parece incompleta',
        details: `Longitud: ${key.length} caracteres`,
        recommendation: 'Verifica que copiaste la clave completa'
      };
    }

    if (!key.startsWith('eyJ')) {
      return {
        status: 'error',
        message: 'Clave anon no parece ser un JWT válido',
        recommendation: 'Las claves de Supabase deben comenzar con "eyJ"'
      };
    }

    return {
      status: 'success',
      message: 'Clave anon válida',
      details: `${key.substring(0, 20)}...`
    };
  };

  const checkServiceKey = (): DiagnosticResult => {
    const key = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
    
    if (!key) {
      return {
        status: 'error',
        message: 'VITE_SUPABASE_SERVICE_ROLE_KEY no está configurada',
        recommendation: 'Añade la service role key desde Supabase Dashboard > Settings > API'
      };
    }

    if (key.length < 100) {
      return {
        status: 'error',
        message: 'Service role key parece incompleta',
        details: `Longitud: ${key.length} caracteres`,
        recommendation: 'Verifica que copiaste la clave completa'
      };
    }

    if (!key.startsWith('eyJ')) {
      return {
        status: 'error',
        message: 'Service role key no parece ser un JWT válido',
        recommendation: 'Las claves de Supabase deben comenzar con "eyJ"'
      };
    }

    return {
      status: 'success',
      message: 'Service role key válida',
      details: `${key.substring(0, 20)}...`
    };
  };

  const testSupabaseConnection = async (): DiagnosticResult => {
    try {
      console.log('🔌 [Diagnostics] Probando conexión básica a Supabase...');

      const { createClient } = await import('@supabase/supabase-js');
      const testClient = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY
      );

      const startTime = Date.now();
      const { data, error } = await testClient
        .from('tenants')
        .select('count')
        .limit(1);

      const responseTime = Date.now() - startTime;

      if (error) {
        console.error('❌ [Diagnostics] Error de conexión:', error);
        
        if (error.message.includes('Failed to fetch')) {
          return {
            status: 'error',
            message: 'Error de red - No se puede conectar a Supabase',
            details: `Error: ${error.message}`,
            recommendation: 'Verifica tu conexión a internet y que la URL sea correcta'
          };
        }
        
        if (error.message.includes('Invalid API key')) {
          return {
            status: 'error',
            message: 'Clave de API inválida',
            details: error.message,
            recommendation: 'Verifica que las claves sean correctas y estén activas'
          };
        }
        
        if (error.message.includes('relation') && error.message.includes('does not exist')) {
          return {
            status: 'warning',
            message: 'Conexión OK pero tabla "tenants" no existe',
            details: error.message,
            recommendation: 'Ejecuta las migraciones de Supabase para crear las tablas'
          };
        }

        return {
          status: 'error',
          message: 'Error de base de datos',
          details: error.message,
          recommendation: 'Verifica la configuración en Supabase Dashboard'
        };
      }

      console.log('✅ [Diagnostics] Conexión exitosa a Supabase');
      return {
        status: 'success',
        message: 'Conexión exitosa',
        details: `Tiempo de respuesta: ${responseTime}ms`
      };

    } catch (error) {
      console.error('❌ [Diagnostics] Error durante test de conexión:', error);
      return {
        status: 'error',
        message: 'Error durante test de conexión',
        details: error instanceof Error ? error.message : 'Error desconocido',
        recommendation: 'Verifica la configuración de red y las credenciales'
      };
    }
  };

  const testTableExistence = async (): DiagnosticResult => {
    try {
      console.log('🔍 [Diagnostics] Verificando existencia de tablas...');

      const { createClient } = await import('@supabase/supabase-js');
      const testClient = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
      );

      const requiredTables = ['tenants', 'users', 'empresas', 'obras', 'documentos'];
      const tableResults = [];

      for (const table of requiredTables) {
        try {
          const { data, error } = await testClient
            .from(table)
            .select('count')
            .limit(1);

          if (error) {
            tableResults.push(`❌ ${table}: ${error.message}`);
          } else {
            tableResults.push(`✅ ${table}: OK`);
          }
        } catch (error) {
          tableResults.push(`❌ ${table}: Error de conexión`);
        }
      }

      const missingTables = tableResults.filter(result => result.includes('❌'));
      
      if (missingTables.length === 0) {
        return {
          status: 'success',
          message: 'Todas las tablas existen',
          details: tableResults.join('\n')
        };
      } else {
        return {
          status: 'warning',
          message: `${missingTables.length} tabla(s) faltante(s)`,
          details: tableResults.join('\n'),
          recommendation: 'Ejecuta las migraciones de Supabase para crear las tablas faltantes'
        };
      }

    } catch (error) {
      return {
        status: 'error',
        message: 'Error verificando tablas',
        details: error instanceof Error ? error.message : 'Error desconocido',
        recommendation: 'Verifica que el service role key sea correcto'
      };
    }
  };

  const testAuthFunctionality = async (): DiagnosticResult => {
    try {
      console.log('🔐 [Diagnostics] Probando funcionalidad de autenticación...');

      const { createClient } = await import('@supabase/supabase-js');
      const testClient = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY
      );

      // Test getting current user (should work even if no user is logged in)
      const { data: { user }, error } = await testClient.auth.getUser();
      
      // This should not error even if no user is logged in
      if (error && error.message !== 'Auth session missing!') {
        return {
          status: 'error',
          message: 'Error en sistema de autenticación',
          details: error.message,
          recommendation: 'Verifica la configuración de auth en Supabase'
        };
      }

      return {
        status: 'success',
        message: 'Sistema de autenticación funcional',
        details: user ? `Usuario actual: ${user.email}` : 'Sin usuario autenticado (normal)'
      };

    } catch (error) {
      return {
        status: 'error',
        message: 'Error probando autenticación',
        details: error instanceof Error ? error.message : 'Error desconocido',
        recommendation: 'Verifica la configuración de autenticación'
      };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const copyEnvTemplate = async () => {
    const template = `# Supabase Configuration
VITE_SUPABASE_URL=https://tu-proyecto-id.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
VITE_SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui

# Gemini AI Configuration (Opcional)
VITE_GEMINI_API_KEY=tu-gemini-api-key-aqui

# Instrucciones:
# 1. Ve a https://supabase.com/dashboard
# 2. Selecciona tu proyecto
# 3. Ve a Settings > API
# 4. Copia la URL del proyecto y las claves
# 5. Reemplaza los valores en este archivo
# 6. Guarda como .env en la raíz del proyecto
# 7. Reinicia el servidor de desarrollo (npm run dev)`;

    try {
      await navigator.clipboard.writeText(template);
      alert('✅ Template .env copiado al portapapeles');
    } catch (error) {
      console.error('Error copying template:', error);
      alert('❌ Error al copiar template');
    }
  };

  const getCurrentEnvValues = () => {
    return {
      url: import.meta.env.VITE_SUPABASE_URL || 'NO CONFIGURADA',
      anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'NO CONFIGURADA',
      serviceKey: import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'NO CONFIGURADA',
      geminiKey: import.meta.env.VITE_GEMINI_API_KEY || 'NO CONFIGURADA'
    };
  };

  const envValues = getCurrentEnvValues();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <Database className="w-8 h-8" />
              <h2 className="text-2xl font-bold">🔍 Diagnóstico de Supabase</h2>
            </div>
            <p className="text-red-100">
              Herramienta de diagnóstico para verificar y solucionar problemas de conexión
            </p>
          </div>
          <button
            onClick={runDiagnostics}
            disabled={loading}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Diagnosticando...' : 'Ejecutar Diagnóstico'}
          </button>
        </div>
      </div>

      {/* Estado General */}
      {diagnostics && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🔍 Resultados del Diagnóstico</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className={`border rounded-lg p-4 ${getStatusColor(diagnostics.url.status)}`}>
              <div className="flex items-center mb-2">
                <Globe className="w-5 h-5 mr-2" />
                <h4 className="font-semibold">URL de Supabase</h4>
              </div>
              <div className="flex items-center mb-2">
                {getStatusIcon(diagnostics.url.status)}
                <span className="text-sm ml-2">{diagnostics.url.message}</span>
              </div>
              {diagnostics.url.details && (
                <p className="text-xs opacity-75 mb-2">{diagnostics.url.details}</p>
              )}
              {diagnostics.url.recommendation && (
                <p className="text-xs font-medium">{diagnostics.url.recommendation}</p>
              )}
            </div>

            <div className={`border rounded-lg p-4 ${getStatusColor(diagnostics.anonKey.status)}`}>
              <div className="flex items-center mb-2">
                <Key className="w-5 h-5 mr-2" />
                <h4 className="font-semibold">Anon Key</h4>
              </div>
              <div className="flex items-center mb-2">
                {getStatusIcon(diagnostics.anonKey.status)}
                <span className="text-sm ml-2">{diagnostics.anonKey.message}</span>
              </div>
              {diagnostics.anonKey.details && (
                <p className="text-xs opacity-75 mb-2">{diagnostics.anonKey.details}</p>
              )}
              {diagnostics.anonKey.recommendation && (
                <p className="text-xs font-medium">{diagnostics.anonKey.recommendation}</p>
              )}
            </div>

            <div className={`border rounded-lg p-4 ${getStatusColor(diagnostics.serviceKey.status)}`}>
              <div className="flex items-center mb-2">
                <Shield className="w-5 h-5 mr-2" />
                <h4 className="font-semibold">Service Key</h4>
              </div>
              <div className="flex items-center mb-2">
                {getStatusIcon(diagnostics.serviceKey.status)}
                <span className="text-sm ml-2">{diagnostics.serviceKey.message}</span>
              </div>
              {diagnostics.serviceKey.details && (
                <p className="text-xs opacity-75 mb-2">{diagnostics.serviceKey.details}</p>
              )}
              {diagnostics.serviceKey.recommendation && (
                <p className="text-xs font-medium">{diagnostics.serviceKey.recommendation}</p>
              )}
            </div>

            <div className={`border rounded-lg p-4 ${getStatusColor(diagnostics.connectionTest.status)}`}>
              <div className="flex items-center mb-2">
                <Zap className="w-5 h-5 mr-2" />
                <h4 className="font-semibold">Test Conexión</h4>
              </div>
              <div className="flex items-center mb-2">
                {testingConnection ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-600 mr-2" />
                ) : (
                  getStatusIcon(diagnostics.connectionTest.status)
                )}
                <span className="text-sm ml-2">
                  {testingConnection ? 'Probando...' : diagnostics.connectionTest.message}
                </span>
              </div>
              {diagnostics.connectionTest.details && (
                <p className="text-xs opacity-75 mb-2">{diagnostics.connectionTest.details}</p>
              )}
              {diagnostics.connectionTest.recommendation && (
                <p className="text-xs font-medium">{diagnostics.connectionTest.recommendation}</p>
              )}
            </div>

            <div className={`border rounded-lg p-4 ${getStatusColor(diagnostics.tableCheck.status)}`}>
              <div className="flex items-center mb-2">
                <Database className="w-5 h-5 mr-2" />
                <h4 className="font-semibold">Verificación Tablas</h4>
              </div>
              <div className="flex items-center mb-2">
                {getStatusIcon(diagnostics.tableCheck.status)}
                <span className="text-sm ml-2">{diagnostics.tableCheck.message}</span>
              </div>
              {diagnostics.tableCheck.details && (
                <p className="text-xs opacity-75 mb-2 whitespace-pre-line">{diagnostics.tableCheck.details}</p>
              )}
              {diagnostics.tableCheck.recommendation && (
                <p className="text-xs font-medium">{diagnostics.tableCheck.recommendation}</p>
              )}
            </div>

            <div className={`border rounded-lg p-4 ${getStatusColor(diagnostics.authTest.status)}`}>
              <div className="flex items-center mb-2">
                <Lock className="w-5 h-5 mr-2" />
                <h4 className="font-semibold">Test Autenticación</h4>
              </div>
              <div className="flex items-center mb-2">
                {getStatusIcon(diagnostics.authTest.status)}
                <span className="text-sm ml-2">{diagnostics.authTest.message}</span>
              </div>
              {diagnostics.authTest.details && (
                <p className="text-xs opacity-75 mb-2">{diagnostics.authTest.details}</p>
              )}
              {diagnostics.authTest.recommendation && (
                <p className="text-xs font-medium">{diagnostics.authTest.recommendation}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Variables de Entorno Actuales */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">🔧 Variables de Entorno Actuales</h3>
          <button
            onClick={() => setShowKeys(!showKeys)}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            {showKeys ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {showKeys ? 'Ocultar' : 'Mostrar'} Claves
          </button>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="font-mono text-sm font-semibold">VITE_SUPABASE_URL</span>
            <div className="flex items-center space-x-2">
              {envValues.url !== 'NO CONFIGURADA' ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-600 font-mono">
                    {showKeys ? envValues.url : `${envValues.url.substring(0, 30)}...`}
                  </span>
                  <button
                    onClick={() => copyToClipboard(envValues.url, 'url')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs"
                  >
                    {copiedField === 'url' ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </button>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-600">NO CONFIGURADA</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="font-mono text-sm font-semibold">VITE_SUPABASE_ANON_KEY</span>
            <div className="flex items-center space-x-2">
              {envValues.anonKey !== 'NO CONFIGURADA' ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-600 font-mono">
                    {showKeys ? envValues.anonKey : `${envValues.anonKey.substring(0, 20)}...`}
                  </span>
                  <button
                    onClick={() => copyToClipboard(envValues.anonKey, 'anon')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs"
                  >
                    {copiedField === 'anon' ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </button>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-600">NO CONFIGURADA</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="font-mono text-sm font-semibold">VITE_SUPABASE_SERVICE_ROLE_KEY</span>
            <div className="flex items-center space-x-2">
              {envValues.serviceKey !== 'NO CONFIGURADA' ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-600 font-mono">
                    {showKeys ? envValues.serviceKey : `${envValues.serviceKey.substring(0, 20)}...`}
                  </span>
                  <button
                    onClick={() => copyToClipboard(envValues.serviceKey, 'service')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs"
                  >
                    {copiedField === 'service' ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </button>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-600">NO CONFIGURADA</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="font-mono text-sm font-semibold">VITE_GEMINI_API_KEY</span>
            <div className="flex items-center space-x-2">
              {envValues.geminiKey !== 'NO CONFIGURADA' ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-600 font-mono">
                    {showKeys ? envValues.geminiKey : `${envValues.geminiKey.substring(0, 20)}...`}
                  </span>
                  <button
                    onClick={() => copyToClipboard(envValues.geminiKey, 'gemini')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs"
                  >
                    {copiedField === 'gemini' ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </button>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm text-yellow-600">OPCIONAL - NO CONFIGURADA</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🚀 Acciones Rápidas</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={copyEnvTemplate}
            className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
          >
            <Copy className="w-5 h-5 text-blue-600 mr-2" />
            <div className="text-left">
              <p className="font-medium text-blue-800">Copiar Template .env</p>
              <p className="text-xs text-blue-600">Template con formato correcto</p>
            </div>
          </button>

          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors border border-green-200"
          >
            <ExternalLink className="w-5 h-5 text-green-600 mr-2" />
            <div className="text-left">
              <p className="font-medium text-green-800">Abrir Supabase Dashboard</p>
              <p className="text-xs text-green-600">Obtener credenciales</p>
            </div>
          </a>

          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors border border-purple-200"
          >
            <RefreshCw className="w-5 h-5 text-purple-600 mr-2" />
            <div className="text-left">
              <p className="font-medium text-purple-800">Recargar Aplicación</p>
              <p className="text-xs text-purple-600">Después de cambiar .env</p>
            </div>
          </button>
        </div>
      </div>

      {/* Guía Paso a Paso */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
        <div className="flex items-start">
          <Info className="w-6 h-6 text-green-600 mr-3 mt-1" />
          <div>
            <h3 className="font-bold text-green-800 mb-3">🔧 Guía de Solución Paso a Paso</h3>
            
            <div className="space-y-4 text-sm text-green-700">
              <div>
                <h4 className="font-semibold text-green-800 mb-2">1. Verificar archivo .env</h4>
                <ul className="space-y-1 ml-4">
                  <li>• Asegúrate de que existe un archivo llamado <code className="bg-white px-1 rounded">.env</code> en la raíz del proyecto</li>
                  <li>• El archivo debe estar al mismo nivel que <code className="bg-white px-1 rounded">package.json</code></li>
                  <li>• Si no existe, copia <code className="bg-white px-1 rounded">.env.example</code> a <code className="bg-white px-1 rounded">.env</code></li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-green-800 mb-2">2. Obtener credenciales de Supabase</h4>
                <ul className="space-y-1 ml-4">
                  <li>• Ve a <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline">https://supabase.com/dashboard</a></li>
                  <li>• Selecciona tu proyecto (o crea uno nuevo)</li>
                  <li>• Ve a <strong>Settings</strong> → <strong>API</strong></li>
                  <li>• Copia la <strong>URL</strong> del proyecto</li>
                  <li>• Copia la <strong>anon public</strong> key</li>
                  <li>• Copia la <strong>service_role</strong> key</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-green-800 mb-2">3. Configurar variables en .env</h4>
                <ul className="space-y-1 ml-4">
                  <li>• Abre el archivo <code className="bg-white px-1 rounded">.env</code> en tu editor</li>
                  <li>• Reemplaza los valores con tus credenciales reales</li>
                  <li>• Guarda el archivo</li>
                  <li>• <strong>Reinicia el servidor de desarrollo</strong> (Ctrl+C y luego npm run dev)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-green-800 mb-2">4. Verificar conexión</h4>
                <ul className="space-y-1 ml-4">
                  <li>• Ejecuta el diagnóstico nuevamente</li>
                  <li>• Todas las verificaciones deben mostrar ✅</li>
                  <li>• Si hay errores, revisa los mensajes específicos</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Template .env */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FileText className="w-6 h-6 text-gray-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-800">📄 Template .env</h3>
          </div>
          <button
            onClick={copyEnvTemplate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copiar Template
          </button>
        </div>

        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
          <pre>{`# Supabase Configuration
VITE_SUPABASE_URL=https://tu-proyecto-id.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
VITE_SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui

# Gemini AI Configuration (Opcional)
VITE_GEMINI_API_KEY=tu-gemini-api-key-aqui`}</pre>
        </div>

        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">📋 Instrucciones Detalladas:</h4>
          <ol className="text-sm text-blue-700 space-y-1">
            <li>1. Copia el template de arriba</li>
            <li>2. Crea un archivo llamado <code className="bg-white px-1 rounded">.env</code> en la raíz del proyecto</li>
            <li>3. Pega el template en el archivo</li>
            <li>4. Ve a <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline">Supabase Dashboard</a></li>
            <li>5. Selecciona tu proyecto → Settings → API</li>
            <li>6. Reemplaza <code className="bg-white px-1 rounded">tu-proyecto-id</code> con tu ID real</li>
            <li>7. Reemplaza <code className="bg-white px-1 rounded">tu-anon-key-aqui</code> con tu anon key</li>
            <li>8. Reemplaza <code className="bg-white px-1 rounded">tu-service-role-key-aqui</code> con tu service role key</li>
            <li>9. Guarda el archivo y reinicia el servidor (Ctrl+C → npm run dev)</li>
          </ol>
        </div>
      </div>

      {/* Errores Comunes */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <div className="flex items-start">
          <AlertTriangle className="w-6 h-6 text-yellow-600 mr-3 mt-1" />
          <div>
            <h3 className="font-bold text-yellow-800 mb-3">⚠️ Errores Comunes y Soluciones</h3>
            
            <div className="space-y-3 text-sm text-yellow-700">
              <div>
                <h4 className="font-semibold text-yellow-800">❌ Error "Failed to fetch"</h4>
                <ul className="ml-4 space-y-1">
                  <li>• Verifica tu conexión a internet</li>
                  <li>• Comprueba que la URL de Supabase sea correcta</li>
                  <li>• Asegúrate de que el proyecto de Supabase esté activo</li>
                  <li>• Verifica que no haya firewall bloqueando la conexión</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-yellow-800">❌ Error "Invalid API key"</h4>
                <ul className="ml-4 space-y-1">
                  <li>• Verifica que las claves API sean correctas</li>
                  <li>• Comprueba que no haya espacios extra al copiar</li>
                  <li>• Asegúrate de usar la service role key para operaciones admin</li>
                  <li>• Regenera las claves en Supabase si es necesario</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-yellow-800">❌ Error "relation does not exist"</h4>
                <ul className="ml-4 space-y-1">
                  <li>• Las tablas no están creadas en tu proyecto de Supabase</li>
                  <li>• Ve a Supabase Dashboard → SQL Editor</li>
                  <li>• Ejecuta las migraciones para crear las tablas</li>
                  <li>• Verifica que estés conectado al proyecto correcto</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-yellow-800">❌ Variables no se cargan después de cambiar .env</h4>
                <ul className="ml-4 space-y-1">
                  <li>• <strong>Reinicia completamente el servidor de desarrollo</strong></li>
                  <li>• Presiona Ctrl+C para detener el servidor</li>
                  <li>• Ejecuta <code className="bg-white px-1 rounded">npm run dev</code> nuevamente</li>
                  <li>• Verifica que el archivo se llame exactamente <code className="bg-white px-1 rounded">.env</code></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Test de Conexión Manual */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">🔌 Test de Conexión Manual</h3>
          <button
            onClick={runDiagnostics}
            disabled={loading || testingConnection}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center disabled:opacity-50"
          >
            {loading || testingConnection ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Probando...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Ejecutar Test Completo
              </>
            )}
          </button>
        </div>

        {diagnostics && (
          <div className="space-y-3">
            {Object.entries(diagnostics).map(([key, result]) => (
              <div key={key} className={`border rounded-lg p-4 ${getStatusColor(result.status)}`}>
                <div className="flex items-start">
                  {getStatusIcon(result.status)}
                  <div className="ml-3 flex-1">
                    <h4 className="font-semibold mb-1">
                      {key === 'url' ? '🌐 URL de Supabase' :
                       key === 'anonKey' ? '🔑 Anon Key' :
                       key === 'serviceKey' ? '🛡️ Service Key' :
                       key === 'connectionTest' ? '🔌 Test de Conexión' :
                       key === 'tableCheck' ? '📊 Verificación de Tablas' :
                       key === 'authTest' ? '🔐 Test de Autenticación' : key}
                    </h4>
                    <p className="text-sm mb-2">{result.message}</p>
                    {result.details && (
                      <p className="text-xs opacity-75 mb-2 whitespace-pre-line">{result.details}</p>
                    )}
                    {result.recommendation && (
                      <p className="text-xs font-medium bg-white/50 p-2 rounded">{result.recommendation}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Información de Contacto */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start">
          <Shield className="w-6 h-6 text-blue-600 mr-3 mt-1" />
          <div>
            <h3 className="font-bold text-blue-800 mb-2">🆘 ¿Necesitas Ayuda?</h3>
            <p className="text-blue-700 mb-3">
              Si sigues teniendo problemas después de seguir estas instrucciones:
            </p>
            <div className="text-sm text-blue-600 space-y-1">
              <div>• 📧 Contacta con soporte: <strong>soporte@constructia.com</strong></div>
              <div>• 📞 Llama al: <strong>+34 91 000 00 00</strong></div>
              <div>• 💬 Chat en vivo disponible en horario laboral</div>
              <div>• 📚 Documentación: <a href="https://docs.constructia.com" className="underline">docs.constructia.com</a></div>
              <div className="mt-2 pt-2 border-t border-blue-300">
                <div className="font-medium text-blue-800">Información para soporte:</div>
                <div>• 🆔 ID del proyecto: {envValues.url !== 'NO CONFIGURADA' ? envValues.url.split('.')[0].split('//')[1] : 'No disponible'}</div>
                <div>• 🌐 URL configurada: {envValues.url !== 'NO CONFIGURADA' ? '✅ Sí' : '❌ No'}</div>
                <div>• 🔑 Claves configuradas: {envValues.anonKey !== 'NO CONFIGURADA' && envValues.serviceKey !== 'NO CONFIGURADA' ? '✅ Sí' : '❌ No'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}