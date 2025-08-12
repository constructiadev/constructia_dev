import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import Logo from '../common/Logo';

export default function TermsOfService() {
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
            <FileText className="h-8 w-8 text-green-600 mr-4" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Términos y Condiciones de Uso</h1>
              <p className="text-gray-600 mt-2">Última actualización: 29 de enero de 2025</p>
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-start">
              <AlertTriangle className="h-6 w-6 text-blue-600 mr-3 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Información Importante</h3>
                <p className="text-blue-800 text-sm">
                  Al acceder y utilizar ConstructIA, aceptas estar legalmente vinculado por estos términos y condiciones. 
                  Si no estás de acuerdo con alguno de estos términos, no utilices nuestros servicios.
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-gray max-w-none">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Definiciones</h2>
            <p className="text-gray-700 mb-4">
              En estos Términos y Condiciones, las siguientes palabras tendrán los significados que se indican:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li><strong>"ConstructIA"</strong> se refiere a ConstructIA S.L., empresa española con CIF B87654321</li>
              <li><strong>"Servicio"</strong> se refiere a la plataforma de gestión documental inteligente</li>
              <li><strong>"Usuario"</strong> se refiere a cualquier persona que acceda o utilice el Servicio</li>
              <li><strong>"Cliente"</strong> se refiere a usuarios con suscripción activa de pago</li>
              <li><strong>"Contenido"</strong> se refiere a documentos, datos e información subida por el Usuario</li>
              <li><strong>"IA"</strong> se refiere a los servicios de inteligencia artificial proporcionados</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Descripción del Servicio</h2>
            <p className="text-gray-700 mb-4">
              ConstructIA proporciona una plataforma SaaS de gestión documental que utiliza inteligencia artificial 
              para clasificar automáticamente documentos del sector construcción e integrarlos con sistemas externos 
              como Obralia/Nalanda.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-green-900 mb-2">Servicios Incluidos:</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Clasificación automática de documentos con IA</li>
                <li>• Almacenamiento seguro en la nube</li>
                <li>• Integración con Obralia/Nalanda</li>
                <li>• Dashboard de gestión y métricas</li>
                <li>• API para integraciones personalizadas</li>
                <li>• Soporte técnico según plan contratado</li>
              </ul>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Registro y Cuentas de Usuario</h2>
            <p className="text-gray-700 mb-4">
              Para utilizar nuestros servicios, debes crear una cuenta proporcionando información precisa y completa. 
              Eres responsable de mantener la confidencialidad de tus credenciales de acceso.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-yellow-900 mb-2">Responsabilidades del Usuario:</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Proporcionar información veraz y actualizada</li>
                <li>• Mantener seguras las credenciales de acceso</li>
                <li>• Notificar inmediatamente cualquier uso no autorizado</li>
                <li>• Cumplir con todas las leyes aplicables</li>
                <li>• No compartir cuentas entre múltiples usuarios</li>
              </ul>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Uso Aceptable</h2>
            <p className="text-gray-700 mb-4">
              Al utilizar ConstructIA, te comprometes a no realizar las siguientes actividades prohibidas:
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-red-900 mb-2">Actividades Prohibidas:</h4>
              <ul className="text-sm text-red-800 space-y-1">
                <li>• Subir contenido ilegal, difamatorio o que infrinja derechos de terceros</li>
                <li>• Intentar acceder a sistemas o datos no autorizados</li>
                <li>• Realizar ingeniería inversa del software</li>
                <li>• Sobrecargar intencionalmente nuestros sistemas</li>
                <li>• Revender o redistribuir el servicio sin autorización</li>
                <li>• Utilizar el servicio para actividades fraudulentas</li>
              </ul>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Planes de Suscripción y Facturación</h2>
            <p className="text-gray-700 mb-4">
              ConstructIA ofrece diferentes planes de suscripción con características y limitaciones específicas. 
              Los precios están disponibles en nuestro sitio web y pueden cambiar con previo aviso.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Plan Básico - €59/mes</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• 100 documentos/mes</li>
                  <li>• 500MB almacenamiento</li>
                  <li>• Soporte por email</li>
                </ul>
              </div>
              <div className="border border-green-500 rounded-lg p-4 bg-green-50">
                <h4 className="font-semibold text-green-900 mb-2">Plan Profesional - €149/mes</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• 500 documentos/mes</li>
                  <li>• 1GB almacenamiento</li>
                  <li>• Soporte prioritario</li>
                </ul>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Plan Empresarial - €299/mes</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Documentos ilimitados</li>
                  <li>• 5GB almacenamiento</li>
                  <li>• Soporte 24/7</li>
                </ul>
              </div>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Política de Reembolsos</h2>
            <p className="text-gray-700 mb-4">
              Ofrecemos una garantía de satisfacción de 30 días para nuevos clientes. Si no estás satisfecho 
              con nuestro servicio durante los primeros 30 días, puedes solicitar un reembolso completo.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Propiedad Intelectual</h2>
            <p className="text-gray-700 mb-4">
              ConstructIA y todos sus componentes (software, algoritmos de IA, diseño, contenido) son propiedad 
              de ConstructIA S.L. y están protegidos por las leyes de propiedad intelectual españolas e internacionales.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Protección de Datos</h2>
            <p className="text-gray-700 mb-4">
              El tratamiento de datos personales se rige por nuestra Política de Privacidad y cumple con el 
              Reglamento General de Protección de Datos (GDPR) y la Ley Orgánica de Protección de Datos (LOPD).
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Limitación de Responsabilidad</h2>
            <p className="text-gray-700 mb-4">
              ConstructIA proporciona el servicio "tal como está" y no garantiza que esté libre de errores o 
              interrupciones. Nuestra responsabilidad se limita al importe pagado por el servicio en los 
              últimos 12 meses.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Terminación del Servicio</h2>
            <p className="text-gray-700 mb-4">
              Puedes cancelar tu suscripción en cualquier momento desde tu panel de control. ConstructIA se 
              reserva el derecho de suspender o terminar cuentas que violen estos términos.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Ley Aplicable y Jurisdicción</h2>
            <p className="text-gray-700 mb-4">
              Estos términos se rigen por la legislación española. Cualquier disputa será resuelta por los 
              tribunales de Madrid, España.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Modificaciones</h2>
            <p className="text-gray-700 mb-4">
              ConstructIA se reserva el derecho de modificar estos términos en cualquier momento. Los cambios 
              significativos serán notificados con al menos 30 días de antelación.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">13. Contacto</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <p className="text-gray-700 mb-2">
                Para cualquier consulta sobre estos términos, puedes contactarnos:
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li><strong>Email:</strong> legal@constructia.com</li>
                <li><strong>Dirección:</strong> Calle Innovación 123, 28001 Madrid, España</li>
                <li><strong>Teléfono:</strong> +34 91 000 00 00</li>
                <li><strong>CIF:</strong> B87654321</li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 pt-6 mt-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                <span>Documento legalmente vinculante</span>
              </div>
              <Link 
                to="/privacy-policy"
                className="text-green-600 hover:text-green-700 text-sm font-medium"
              >
                Ver Política de Privacidad →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}