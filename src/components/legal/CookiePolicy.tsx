import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Cookie, Settings, Eye, BarChart3, Target } from 'lucide-react';
import Logo from '../common/Logo';

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <Logo size="md" variant="dark" />
            <Link 
              to="/landing" 
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al inicio
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {/* Title */}
          <div className="flex items-center mb-8">
            <Cookie className="h-8 w-8 text-orange-600 mr-4" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Política de Cookies</h1>
              <p className="text-gray-600 mt-2">Última actualización: 29 de enero de 2025</p>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-gray max-w-none">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. ¿Qué son las Cookies?</h2>
            <p className="text-gray-700 mb-4">
              Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas 
              un sitio web. Nos permiten reconocer tu navegador y capturar y recordar cierta información 
              para mejorar tu experiencia de usuario.
            </p>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-orange-900 mb-2">Información Importante</h4>
              <p className="text-orange-800 text-sm">
                ConstructIA utiliza cookies para proporcionar, proteger y mejorar nuestros servicios. 
                Al continuar usando nuestro sitio web, aceptas el uso de cookies según se describe en esta política.
              </p>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Tipos de Cookies que Utilizamos</h2>
            
            <div className="space-y-6 mb-8">
              <div className="border border-green-200 rounded-lg p-6 bg-green-50">
                <div className="flex items-center mb-4">
                  <Settings className="h-6 w-6 text-green-600 mr-3" />
                  <h3 className="text-lg font-semibold text-green-900">Cookies Estrictamente Necesarias</h3>
                </div>
                <p className="text-green-800 text-sm mb-3">
                  Estas cookies son esenciales para que puedas navegar por el sitio web y utilizar sus funciones. 
                  Sin estas cookies, no podemos proporcionar los servicios solicitados.
                </p>
                <div className="bg-white border border-green-200 rounded p-3">
                  <h4 className="font-semibold text-green-900 mb-2">Ejemplos de uso:</h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• <strong>Autenticación:</strong> Mantener tu sesión iniciada</li>
                    <li>• <strong>Seguridad:</strong> Protección CSRF y validación de formularios</li>
                    <li>• <strong>Funcionalidad:</strong> Recordar preferencias de idioma</li>
                    <li>• <strong>Carrito:</strong> Mantener elementos seleccionados</li>
                  </ul>
                  <p className="text-xs text-green-700 mt-2">
                    <strong>Duración:</strong> Sesión o hasta 1 año | <strong>Base legal:</strong> Interés legítimo
                  </p>
                </div>
              </div>

              <div className="border border-blue-200 rounded-lg p-6 bg-blue-50">
                <div className="flex items-center mb-4">
                  <BarChart3 className="h-6 w-6 text-blue-600 mr-3" />
                  <h3 className="text-lg font-semibold text-blue-900">Cookies Analíticas</h3>
                </div>
                <p className="text-blue-800 text-sm mb-3">
                  Nos ayudan a entender cómo los visitantes interactúan con nuestro sitio web, 
                  proporcionando información sobre las áreas visitadas, el tiempo de permanencia y cualquier problema encontrado.
                </p>
                <div className="bg-white border border-blue-200 rounded p-3">
                  <h4 className="font-semibold text-blue-900 mb-2">Servicios utilizados:</h4>
                  <ul className="text-sm text-blue-800 space-y-2">
                    <li>
                      <strong>Google Analytics 4:</strong>
                      <ul className="ml-4 mt-1 space-y-1">
                        <li>- Análisis de tráfico y comportamiento</li>
                        <li>- Métricas de rendimiento del sitio</li>
                        <li>- Informes demográficos agregados</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Hotjar:</strong>
                      <ul className="ml-4 mt-1 space-y-1">
                        <li>- Mapas de calor de interacción</li>
                        <li>- Grabaciones de sesiones (anonimizadas)</li>
                        <li>- Análisis de formularios</li>
                      </ul>
                    </li>
                  </ul>
                  <p className="text-xs text-blue-700 mt-2">
                    <strong>Duración:</strong> Hasta 2 años | <strong>Base legal:</strong> Consentimiento
                  </p>
                </div>
              </div>

              <div className="border border-purple-200 rounded-lg p-6 bg-purple-50">
                <div className="flex items-center mb-4">
                  <Eye className="h-6 w-6 text-purple-600 mr-3" />
                  <h3 className="text-lg font-semibold text-purple-900">Cookies Funcionales</h3>
                </div>
                <p className="text-purple-800 text-sm mb-3">
                  Permiten que el sitio web recuerde las elecciones que haces y proporcionan 
                  funciones mejoradas y más personales.
                </p>
                <div className="bg-white border border-purple-200 rounded p-3">
                  <h4 className="font-semibold text-purple-900 mb-2">Funcionalidades:</h4>
                  <ul className="text-sm text-purple-800 space-y-1">
                    <li>• <strong>Preferencias de usuario:</strong> Tema, idioma, configuración de dashboard</li>
                    <li>• <strong>Chat en vivo:</strong> Historial de conversaciones de soporte</li>
                    <li>• <strong>Formularios:</strong> Autocompletado de campos frecuentes</li>
                    <li>• <strong>Personalización:</strong> Contenido adaptado a tu perfil</li>
                  </ul>
                  <p className="text-xs text-purple-700 mt-2">
                    <strong>Duración:</strong> Hasta 1 año | <strong>Base legal:</strong> Consentimiento
                  </p>
                </div>
              </div>

              <div className="border border-red-200 rounded-lg p-6 bg-red-50">
                <div className="flex items-center mb-4">
                  <Target className="h-6 w-6 text-red-600 mr-3" />
                  <h3 className="text-lg font-semibold text-red-900">Cookies de Marketing</h3>
                </div>
                <p className="text-red-800 text-sm mb-3">
                  Se utilizan para hacer un seguimiento de los visitantes en los sitios web con la 
                  intención de mostrar anuncios relevantes y atractivos para el usuario individual.
                </p>
                <div className="bg-white border border-red-200 rounded p-3">
                  <h4 className="font-semibold text-red-900 mb-2">Plataformas utilizadas:</h4>
                  <ul className="text-sm text-red-800 space-y-2">
                    <li>
                      <strong>Google Ads:</strong>
                      <ul className="ml-4 mt-1 space-y-1">
                        <li>- Remarketing y audiencias similares</li>
                        <li>- Seguimiento de conversiones</li>
                        <li>- Optimización de campañas</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Facebook Pixel:</strong>
                      <ul className="ml-4 mt-1 space-y-1">
                        <li>- Audiencias personalizadas</li>
                        <li>- Seguimiento de eventos</li>
                        <li>- Optimización de anuncios</li>
                      </ul>
                    </li>
                    <li>
                      <strong>LinkedIn Insight Tag:</strong>
                      <ul className="ml-4 mt-1 space-y-1">
                        <li>- Remarketing B2B</li>
                        <li>- Análisis de audiencia profesional</li>
                      </ul>
                    </li>
                  </ul>
                  <p className="text-xs text-red-700 mt-2">
                    <strong>Duración:</strong> Hasta 2 años | <strong>Base legal:</strong> Consentimiento
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Gestión de Cookies</h2>
            <p className="text-gray-700 mb-4">
              Puedes controlar y gestionar las cookies de varias maneras:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Panel de Preferencias</h4>
                <p className="text-gray-700 text-sm mb-3">
                  Utiliza nuestro panel de configuración de cookies para activar o desactivar 
                  categorías específicas en cualquier momento.
                </p>
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                  Configurar Cookies
                </button>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Configuración del Navegador</h4>
                <p className="text-gray-700 text-sm mb-3">
                  Todos los navegadores permiten gestionar las cookies a través de su configuración de privacidad.
                </p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• <strong>Chrome:</strong> Configuración {'>'} Privacidad y seguridad {'>'} Cookies</li>
                  <li>• <strong>Firefox:</strong> Preferencias {'>'} Privacidad y seguridad</li>
                  <li>• <strong>Safari:</strong> Preferencias {'>'} Privacidad</li>
                  <li>• <strong>Edge:</strong> Configuración {'>'} Privacidad, búsqueda y servicios</li>
                </ul>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Importante</h4>
              <p className="text-yellow-800 text-sm">
                Deshabilitar ciertas cookies puede afectar la funcionalidad del sitio web. Las cookies 
                estrictamente necesarias no se pueden deshabilitar ya que son esenciales para el funcionamiento del servicio.
              </p>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Cookies de Terceros</h2>
            <p className="text-gray-700 mb-4">
              Algunos de nuestros socios pueden establecer cookies en tu dispositivo cuando visitas nuestro sitio:
            </p>

            <div className="overflow-x-auto mb-6">
              <table className="w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Proveedor</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Propósito</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Duración</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Política</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-900">Google Analytics</td>
                    <td className="px-4 py-3 text-sm text-gray-700">Análisis de tráfico web</td>
                    <td className="px-4 py-3 text-sm text-gray-700">2 años</td>
                    <td className="px-4 py-3 text-sm">
                      <a href="https://policies.google.com/privacy" className="text-blue-600 hover:text-blue-800">
                        Ver política
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-900">Stripe</td>
                    <td className="px-4 py-3 text-sm text-gray-700">Procesamiento de pagos</td>
                    <td className="px-4 py-3 text-sm text-gray-700">Sesión</td>
                    <td className="px-4 py-3 text-sm">
                      <a href="https://stripe.com/privacy" className="text-blue-600 hover:text-blue-800">
                        Ver política
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-900">Hotjar</td>
                    <td className="px-4 py-3 text-sm text-gray-700">Análisis de comportamiento</td>
                    <td className="px-4 py-3 text-sm text-gray-700">1 año</td>
                    <td className="px-4 py-3 text-sm">
                      <a href="https://www.hotjar.com/legal/policies/privacy/" className="text-blue-600 hover:text-blue-800">
                        Ver política
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-900">Facebook</td>
                    <td className="px-4 py-3 text-sm text-gray-700">Marketing y remarketing</td>
                    <td className="px-4 py-3 text-sm text-gray-700">90 días</td>
                    <td className="px-4 py-3 text-sm">
                      <a href="https://www.facebook.com/privacy/policy/" className="text-blue-600 hover:text-blue-800">
                        Ver política
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Tecnologías Similares</h2>
            <p className="text-gray-700 mb-4">
              Además de cookies, utilizamos otras tecnologías similares:
            </p>

            <div className="space-y-4 mb-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Local Storage</h4>
                <p className="text-gray-700 text-sm">
                  Almacenamos datos localmente en tu navegador para mejorar el rendimiento y 
                  recordar preferencias de usuario entre sesiones.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Session Storage</h4>
                <p className="text-gray-700 text-sm">
                  Datos temporales que se eliminan cuando cierras el navegador, utilizados 
                  para mantener el estado de la aplicación durante tu sesión.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Web Beacons</h4>
                <p className="text-gray-700 text-sm">
                  Pequeñas imágenes transparentes que nos ayudan a entender cómo interactúas 
                  con nuestros emails y contenido web.
                </p>
              </div>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Actualizaciones de esta Política</h2>
            <p className="text-gray-700 mb-4">
              Podemos actualizar esta Política de Cookies ocasionalmente para reflejar cambios en 
              nuestras prácticas o por razones operativas, legales o reglamentarias.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Contacto</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <p className="text-gray-700 mb-2">
                Si tienes preguntas sobre nuestra Política de Cookies:
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li><strong>Email:</strong> cookies@constructia.com</li>
                <li><strong>Delegado de Protección de Datos:</strong> dpo@constructia.com</li>
                <li><strong>Teléfono:</strong> +34 91 000 00 00</li>
                <li><strong>Dirección:</strong> Calle Innovación 123, 28001 Madrid, España</li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 pt-6 mt-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-600">
                <Cookie className="h-4 w-4 text-orange-600 mr-2" />
                <span>Gestión transparente de cookies</span>
              </div>
              <div className="flex space-x-4">
                <Link 
                  to="/privacy-policy"
                  className="text-green-600 hover:text-green-700 text-sm font-medium"
                >
                  Política de Privacidad
                </Link>
                <Link 
                  to="/terms-of-service"
                  className="text-green-600 hover:text-green-700 text-sm font-medium"
                >
                  Términos de Uso
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}