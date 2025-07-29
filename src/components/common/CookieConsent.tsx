import React, { useState, useEffect } from 'react';
import { X, Cookie, Shield, Eye, Settings } from 'lucide-react';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('constructia-cookie-consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem('constructia-cookie-consent', 'all');
    setIsVisible(false);
  };

  const acceptNecessary = () => {
    localStorage.setItem('constructia-cookie-consent', 'necessary');
    setIsVisible(false);
  };

  const rejectAll = () => {
    localStorage.setItem('constructia-cookie-consent', 'rejected');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50 p-4">
      <div className="bg-white rounded-t-2xl shadow-2xl w-full max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Cookie className="h-6 w-6 text-orange-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Configuración de Cookies</h3>
          </div>
          <button
            onClick={rejectAll}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 mb-4">
            En ConstructIA utilizamos cookies para mejorar tu experiencia, analizar el tráfico del sitio web 
            y personalizar el contenido. Puedes elegir qué tipos de cookies aceptar.
          </p>

          {!showDetails ? (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">🍪 ¿Qué cookies utilizamos?</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>Esenciales:</strong> Necesarias para el funcionamiento básico</li>
                  <li>• <strong>Analíticas:</strong> Para entender cómo usas nuestra plataforma</li>
                  <li>• <strong>Funcionales:</strong> Para recordar tus preferencias</li>
                  <li>• <strong>Marketing:</strong> Para mostrarte contenido relevante</li>
                </ul>
              </div>

              <button
                onClick={() => setShowDetails(true)}
                className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center"
              >
                <Settings className="h-4 w-4 mr-1" />
                Ver configuración detallada
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">Cookies Esenciales</h4>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Siempre activas</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Necesarias para el funcionamiento básico del sitio web, autenticación y seguridad.
                  </p>
                  <p className="text-xs text-gray-500">
                    Incluye: cookies de sesión, CSRF tokens, preferencias de idioma
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">Cookies Analíticas</h4>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Nos ayudan a entender cómo interactúas con nuestro sitio web.
                  </p>
                  <p className="text-xs text-gray-500">
                    Incluye: Google Analytics, métricas de rendimiento, mapas de calor
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">Cookies Funcionales</h4>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Mejoran la funcionalidad y personalización del sitio web.
                  </p>
                  <p className="text-xs text-gray-500">
                    Incluye: preferencias de usuario, configuración de dashboard, idioma
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">Cookies de Marketing</h4>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Se utilizan para mostrarte anuncios relevantes en otros sitios web.
                  </p>
                  <p className="text-xs text-gray-500">
                    Incluye: Facebook Pixel, Google Ads, remarketing, seguimiento de conversiones
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-600 hover:text-gray-700 text-sm font-medium"
              >
                ← Volver a vista simple
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-2xl">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
            <div className="flex items-center text-xs text-gray-600">
              <Shield className="h-4 w-4 mr-1" />
              <span>Tus datos están protegidos según GDPR</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={acceptNecessary}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm"
              >
                Solo Necesarias
              </button>
              <button
                onClick={acceptAll}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
              >
                Aceptar Todas
              </button>
            </div>
          </div>
          <div className="mt-3 text-center">
            <a href="/privacy-policy" className="text-xs text-gray-500 hover:text-gray-700 mr-4">
              Política de Privacidad
            </a>
            <a href="/cookie-policy" className="text-xs text-gray-500 hover:text-gray-700">
              Política de Cookies
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}