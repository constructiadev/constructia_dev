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
  Zap
} from 'lucide-react';
import { SupabaseDiagnosticsService, type SupabaseDiagnostics } from '../../utils/supabase-diagnostics';

export default function SupabaseDiagnostics() {
  const [diagnostics, setDiagnostics] = useState<SupabaseDiagnostics | null>(null);
  const [loading, setLoading] = useState(false);
  const [fixes, setFixes] = useState<string[]>([]);
  const [showEnvTemplate, setShowEnvTemplate] = useState(false);

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    setLoading(true);
    try {
      const result = await SupabaseDiagnosticsService.runDiagnostics();
      setDiagnostics(result);
      
      const commonFixes = await SupabaseDiagnosticsService.fixCommonIssues();
      setFixes(commonFixes);
    } catch (error) {
      console.error('Error running diagnostics:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyEnvTemplate = async () => {
    const template = SupabaseDiagnosticsService.generateEnvTemplate();
    try {
      await navigator.clipboard.writeText(template);
      alert('✅ Template .env copiado al portapapeles');
    } catch (error) {
      console.error('Error copying template:', error);
      alert('❌ Error al copiar template');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'invalid':
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'missing':
      case 'pending':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid':
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'invalid':
      case 'failed':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'missing':
      case 'pending':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Ejecutando diagnóstico de Supabase...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <Database className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Diagnóstico de Supabase</h2>
            </div>
            <p className="text-blue-100">
              Herramienta de diagnóstico para verificar la conexión a Supabase
            </p>
          </div>
          <button
            onClick={runDiagnostics}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Ejecutar Diagnóstico
          </button>
        </div>
      </div>

      {/* Estado General */}
      {diagnostics && (
        <div className={`border rounded-xl p-6 ${getStatusColor(diagnostics.configurationStatus)}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              {getStatusIcon(diagnostics.configurationStatus)}
              <h3 className="text-lg font-semibold ml-3">
                Estado General: {
                  diagnostics.configurationStatus === 'valid' ? 'Configuración Válida' :
                  diagnostics.configurationStatus === 'invalid' ? 'Configuración Inválida' :
                  'Configuración Faltante'
                }
              </h3>
            </div>
          </div>
          
          {diagnostics.configurationStatus === 'valid' ? (
            <p className="text-sm">
              ✅ Supabase está configurado correctamente y la conexión es exitosa.
            </p>
          ) : (
            <p className="text-sm">
              ❌ Hay problemas con la configuración de Supabase. Revisa los detalles abajo.
            </p>
          )}
        </div>
      )}

      {/* Verificaciones Detalladas */}
      {diagnostics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`border rounded-lg p-4 ${getStatusColor(diagnostics.urlStatus)}`}>
            <div className="flex items-center mb-2">
              <Globe className="w-5 h-5 mr-2" />
              <h4 className="font-semibold">URL de Supabase</h4>
            </div>
            <div className="flex items-center">
              {getStatusIcon(diagnostics.urlStatus)}
              <span className="text-sm ml-2">
                {diagnostics.urlStatus === 'valid' ? 'Válida' :
                 diagnostics.urlStatus === 'invalid' ? 'Inválida' : 'Faltante'}
              </span>
            </div>
          </div>

          <div className={`border rounded-lg p-4 ${getStatusColor(diagnostics.anonKeyStatus)}`}>
            <div className="flex items-center mb-2">
              <Key className="w-5 h-5 mr-2" />
              <h4 className="font-semibold">Anon Key</h4>
            </div>
            <div className="flex items-center">
              {getStatusIcon(diagnostics.anonKeyStatus)}
              <span className="text-sm ml-2">
                {diagnostics.anonKeyStatus === 'valid' ? 'Válida' :
                 diagnostics.anonKeyStatus === 'invalid' ? 'Inválida' : 'Faltante'}
              </span>
            </div>
          </div>

          <div className={`border rounded-lg p-4 ${getStatusColor(diagnostics.serviceKeyStatus)}`}>
            <div className="flex items-center mb-2">
              <Shield className="w-5 h-5 mr-2" />
              <h4 className="font-semibold">Service Key</h4>
            </div>
            <div className="flex items-center">
              {getStatusIcon(diagnostics.serviceKeyStatus)}
              <span className="text-sm ml-2">
                {diagnostics.serviceKeyStatus === 'valid' ? 'Válida' :
                 diagnostics.serviceKeyStatus === 'invalid' ? 'Inválida' : 'Faltante'}
              </span>
            </div>
          </div>

          <div className={`border rounded-lg p-4 ${getStatusColor(diagnostics.connectionTest)}`}>
            <div className="flex items-center mb-2">
              <Zap className="w-5 h-5 mr-2" />
              <h4 className="font-semibold">Test Conexión</h4>
            </div>
            <div className="flex items-center">
              {getStatusIcon(diagnostics.connectionTest)}
              <span className="text-sm ml-2">
                {diagnostics.connectionTest === 'success' ? 'Exitoso' :
                 diagnostics.connectionTest === 'failed' ? 'Fallido' : 'Pendiente'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Errores */}
      {diagnostics && diagnostics.errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <XCircle className="w-6 h-6 text-red-600 mr-3" />
            <h3 className="text-lg font-semibold text-red-800">Errores Encontrados</h3>
          </div>
          <div className="space-y-2">
            {diagnostics.errors.map((error, index) => (
              <div key={index} className="flex items-start">
                <AlertTriangle className="w-4 h-4 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recomendaciones */}
      {diagnostics && diagnostics.recommendations.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <Info className="w-6 h-6 text-blue-600 mr-3" />
            <h3 className="text-lg font-semibold text-blue-800">Recomendaciones</h3>
          </div>
          <div className="space-y-2">
            {diagnostics.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start">
                <CheckCircle className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-blue-700">{recommendation}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Soluciones Automáticas */}
      {fixes.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <Settings className="w-6 h-6 text-yellow-600 mr-3" />
            <h3 className="text-lg font-semibold text-yellow-800">Verificaciones Automáticas</h3>
          </div>
          <div className="space-y-2">
            {fixes.map((fix, index) => (
              <div key={index} className="flex items-start">
                <Terminal className="w-4 h-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-yellow-700">{fix}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Template .env */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FileText className="w-6 h-6 text-gray-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-800">Template .env</h3>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowEnvTemplate(!showEnvTemplate)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <FileText className="w-4 h-4 mr-2" />
              {showEnvTemplate ? 'Ocultar' : 'Mostrar'} Template
            </button>
            <button
              onClick={copyEnvTemplate}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copiar Template
            </button>
          </div>
        </div>

        {showEnvTemplate && (
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
            <pre>{SupabaseDiagnosticsService.generateEnvTemplate()}</pre>
          </div>
        )}

        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">Pasos para Configurar Supabase:</h4>
          <ol className="text-sm text-blue-700 space-y-1">
            <li>1. Ve a <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline">https://supabase.com/dashboard</a></li>
            <li>2. Selecciona tu proyecto o crea uno nuevo</li>
            <li>3. Ve a Settings {'>'} API</li>
            <li>4. Copia la URL del proyecto y las claves API</li>
            <li>5. Crea un archivo .env en la raíz del proyecto</li>
            <li>6. Pega el template y reemplaza con tus valores reales</li>
            <li>7. Reinicia el servidor de desarrollo (npm run dev)</li>
          </ol>
        </div>
      </div>

      {/* Variables de Entorno Actuales */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center mb-4">
          <Terminal className="w-6 h-6 text-gray-600 mr-3" />
          <h3 className="text-lg font-semibold text-gray-800">Variables de Entorno Actuales</h3>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="font-mono text-sm">VITE_SUPABASE_URL</span>
            <div className="flex items-center">
              {import.meta.env.VITE_SUPABASE_URL ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-sm text-gray-600">
                    {import.meta.env.VITE_SUPABASE_URL.substring(0, 30)}...
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-red-600 mr-2" />
                  <span className="text-sm text-red-600">No configurada</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="font-mono text-sm">VITE_SUPABASE_ANON_KEY</span>
            <div className="flex items-center">
              {import.meta.env.VITE_SUPABASE_ANON_KEY ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-sm text-gray-600">
                    {import.meta.env.VITE_SUPABASE_ANON_KEY.substring(0, 20)}...
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-red-600 mr-2" />
                  <span className="text-sm text-red-600">No configurada</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="font-mono text-sm">VITE_SUPABASE_SERVICE_ROLE_KEY</span>
            <div className="flex items-center">
              {import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-sm text-gray-600">
                    {import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)}...
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-red-600 mr-2" />
                  <span className="text-sm text-red-600">No configurada</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="font-mono text-sm">VITE_GEMINI_API_KEY</span>
            <div className="flex items-center">
              {import.meta.env.VITE_GEMINI_API_KEY ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-sm text-gray-600">
                    {import.meta.env.VITE_GEMINI_API_KEY.substring(0, 20)}...
                  </span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
                  <span className="text-sm text-yellow-600">Opcional - No configurada</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Acciones Rápidas</h3>
        
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
            <Globe className="w-5 h-5 text-green-600 mr-2" />
            <div className="text-left">
              <p className="font-medium text-green-800">Abrir Supabase</p>
              <p className="text-xs text-green-600">Dashboard de Supabase</p>
            </div>
          </a>

          <button
            onClick={runDiagnostics}
            className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors border border-purple-200"
          >
            <RefreshCw className="w-5 h-5 text-purple-600 mr-2" />
            <div className="text-left">
              <p className="font-medium text-purple-800">Ejecutar Test</p>
              <p className="text-xs text-purple-600">Verificar conexión</p>
            </div>
          </button>
        </div>
      </div>

      {/* Información de Ayuda */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
        <div className="flex items-start">
          <Info className="w-6 h-6 text-green-600 mr-3 mt-1" />
          <div>
            <h3 className="font-bold text-green-800 mb-2">💡 Solución de Problemas Comunes</h3>
            <div className="text-sm text-green-700 space-y-2">
              <div><strong>Error "Failed to fetch":</strong></div>
              <div>• Verifica tu conexión a internet</div>
              <div>• Comprueba que la URL de Supabase sea correcta</div>
              <div>• Asegúrate de que el proyecto de Supabase esté activo</div>
              
              <div className="mt-3"><strong>Error "Invalid API key":</strong></div>
              <div>• Verifica que las claves API sean correctas</div>
              <div>• Comprueba que no haya espacios extra al copiar</div>
              <div>• Asegúrate de usar la service role key para operaciones admin</div>
              
              <div className="mt-3"><strong>Error "relation does not exist":</strong></div>
              <div>• Ejecuta las migraciones de Supabase</div>
              <div>• Verifica que las tablas estén creadas en tu proyecto</div>
              <div>• Comprueba que estés conectado al proyecto correcto</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}