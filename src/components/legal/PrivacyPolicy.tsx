import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Eye, Lock, Database, Globe, CheckCircle } from 'lucide-react';
import Logo from '../common/Logo';

export default function PrivacyPolicy() {
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
            <Shield className="h-8 w-8 text-green-600 mr-4" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Política de Privacidad</h1>
              <p className="text-gray-600 mt-2">Última actualización: 29 de enero de 2025</p>
            </div>
          </div>

          {/* GDPR Notice */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <div className="flex items-start">
              <CheckCircle className="h-6 w-6 text-green-600 mr-3 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-900 mb-2">Cumplimiento GDPR</h3>
                <p className="text-green-800 text-sm">
                  ConstructIA cumple estrictamente con el Reglamento General de Protección de Datos (GDPR) 
                  y la Ley Orgánica de Protección de Datos y garantía de los derechos digitales (LOPDGDD). 
                  Tus derechos están protegidos en todo momento.
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-gray max-w-none">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Responsable del Tratamiento</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <p className="text-gray-700 mb-2"><strong>Responsable:</strong> ConstructIA S.L.</p>
              <p className="text-gray-700 mb-2"><strong>CIF:</strong> B87654321</p>
              <p className="text-gray-700 mb-2"><strong>Dirección:</strong> Calle Innovación 123, 28001 Madrid, España</p>
              <p className="text-gray-700 mb-2"><strong>Email:</strong> privacy@constructia.com</p>
              <p className="text-gray-700 mb-2"><strong>Teléfono:</strong> +34 91 000 00 00</p>
              <p className="text-gray-700"><strong>Delegado de Protección de Datos:</strong> dpo@constructia.com</p>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Datos Personales que Recopilamos</h2>
            <p className="text-gray-700 mb-4">
              Recopilamos diferentes tipos de información según cómo interactúes con nuestros servicios:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  Datos de Identificación
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Nombre y apellidos</li>
                  <li>• Dirección de email</li>
                  <li>• Número de teléfono</li>
                  <li>• Dirección postal</li>
                  <li>• NIF/CIF</li>
                  <li>• Datos de facturación</li>
                </ul>
              </div>

              <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                <h4 className="font-semibold text-purple-900 mb-3 flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  Datos de Uso
                </h4>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• Documentos subidos</li>
                  <li>• Metadatos de archivos</li>
                  <li>• Logs de actividad</li>
                  <li>• Preferencias de usuario</li>
                  <li>• Estadísticas de uso</li>
                  <li>• Datos de rendimiento</li>
                </ul>
              </div>

              <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                <h4 className="font-semibold text-orange-900 mb-3 flex items-center">
                  <Globe className="h-5 w-5 mr-2" />
                  Datos Técnicos
                </h4>
                <ul className="text-sm text-orange-800 space-y-1">
                  <li>• Dirección IP</li>
                  <li>• Tipo de navegador</li>
                  <li>• Sistema operativo</li>
                  <li>• Cookies y tecnologías similares</li>
                  <li>• Datos de geolocalización</li>
                  <li>• Información del dispositivo</li>
                </ul>
              </div>

              <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                  <Lock className="h-5 w-5 mr-2" />
                  Datos de Seguridad
                </h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Credenciales de acceso (encriptadas)</li>
                  <li>• Tokens de autenticación</li>
                  <li>• Logs de seguridad</li>
                  <li>• Intentos de acceso</li>
                  <li>• Configuración de seguridad</li>
                  <li>• Auditorías de acceso</li>
                </ul>
              </div>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Finalidades del Tratamiento</h2>
            <p className="text-gray-700 mb-4">
              Utilizamos tus datos personales para las siguientes finalidades, basadas en diferentes bases legales:
            </p>

            <div className="space-y-4 mb-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Ejecución del Contrato</h4>
                <p className="text-gray-700 text-sm mb-2">
                  Para proporcionar nuestros servicios de gestión documental e IA:
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Procesamiento y clasificación de documentos</li>
                  <li>• Integración con sistemas externos (Obralia/Nalanda)</li>
                  <li>• Gestión de tu cuenta y suscripción</li>
                  <li>• Facturación y cobros</li>
                  <li>• Soporte técnico y atención al cliente</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Interés Legítimo</h4>
                <p className="text-gray-700 text-sm mb-2">
                  Para mejorar nuestros servicios y garantizar la seguridad:
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Análisis de uso y mejora del servicio</li>
                  <li>• Detección y prevención de fraudes</li>
                  <li>• Seguridad de la plataforma</li>
                  <li>• Desarrollo de nuevas funcionalidades</li>
                  <li>• Comunicaciones comerciales (con opt-out)</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Consentimiento</h4>
                <p className="text-gray-700 text-sm mb-2">
                  Solo cuando hayas dado tu consentimiento explícito:
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Cookies no esenciales</li>
                  <li>• Marketing directo personalizado</li>
                  <li>• Análisis avanzados de comportamiento</li>
                  <li>• Compartir datos con terceros para marketing</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Obligación Legal</h4>
                <p className="text-gray-700 text-sm mb-2">
                  Para cumplir con nuestras obligaciones legales:
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Conservación de registros contables</li>
                  <li>• Cumplimiento de obligaciones fiscales</li>
                  <li>• Respuesta a requerimientos judiciales</li>
                  <li>• Auditorías de seguridad obligatorias</li>
                </ul>
              </div>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Compartir Datos con Terceros</h2>
            <p className="text-gray-700 mb-4">
              Solo compartimos tus datos con terceros en las siguientes circunstancias:
            </p>

            <div className="space-y-4 mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Proveedores de Servicios</h4>
                <p className="text-blue-800 text-sm mb-2">
                  Trabajamos con proveedores de confianza que nos ayudan a operar nuestros servicios:
                </p>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• <strong>Google Cloud Platform:</strong> Hosting y almacenamiento (EE.UU.)</li>
                  <li>• <strong>Supabase:</strong> Base de datos y autenticación (EE.UU.)</li>
                  <li>• <strong>Stripe:</strong> Procesamiento de pagos (EE.UU.)</li>
                  <li>• <strong>Google AI:</strong> Servicios de inteligencia artificial (EE.UU.)</li>
                  <li>• <strong>Obralia/Nalanda:</strong> Integración de documentos (España)</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-900 mb-2">Transferencias Internacionales</h4>
                <p className="text-yellow-800 text-sm">
                  Algunos de nuestros proveedores están ubicados fuera del EEE. Garantizamos la protección 
                  de tus datos mediante cláusulas contractuales tipo aprobadas por la Comisión Europea y 
                  certificaciones de adecuación como Privacy Shield o equivalentes.
                </p>
              </div>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Seguridad de los Datos</h2>
            <p className="text-gray-700 mb-4">
              Implementamos medidas técnicas y organizativas apropiadas para proteger tus datos:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                <h4 className="font-semibold text-green-900 mb-2">Medidas Técnicas</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Encriptación SSL/TLS 256-bit</li>
                  <li>• Encriptación de datos en reposo</li>
                  <li>• Autenticación multifactor</li>
                  <li>• Firewalls y sistemas de detección</li>
                  <li>• Backups automáticos encriptados</li>
                  <li>• Monitoreo 24/7 de seguridad</li>
                </ul>
              </div>

              <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                <h4 className="font-semibold text-purple-900 mb-2">Medidas Organizativas</h4>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• Acceso basado en roles</li>
                  <li>• Formación en privacidad del personal</li>
                  <li>• Auditorías de seguridad regulares</li>
                  <li>• Políticas de retención de datos</li>
                  <li>• Procedimientos de respuesta a incidentes</li>
                  <li>• Certificación ISO 27001</li>
                </ul>
              </div>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Retención de Datos</h2>
            <p className="text-gray-700 mb-4">
              Conservamos tus datos personales solo durante el tiempo necesario para las finalidades establecidas:
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700 font-medium">Datos de cuenta activa</span>
                <span className="text-gray-600">Mientras mantengas la suscripción</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700 font-medium">Documentos procesados</span>
                <span className="text-gray-600">7 días tras validación en Obralia</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700 font-medium">Datos de facturación</span>
                <span className="text-gray-600">10 años (obligación legal)</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700 font-medium">Logs de seguridad</span>
                <span className="text-gray-600">2 años</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700 font-medium">Datos de marketing</span>
                <span className="text-gray-600">Hasta retirada del consentimiento</span>
              </div>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Tus Derechos</h2>
            <p className="text-gray-700 mb-4">
              Bajo el GDPR, tienes los siguientes derechos respecto a tus datos personales:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Derechos de Acceso y Control</h4>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li><strong>Acceso:</strong> Obtener copia de tus datos personales</li>
                  <li><strong>Rectificación:</strong> Corregir datos inexactos o incompletos</li>
                  <li><strong>Supresión:</strong> Solicitar la eliminación de tus datos</li>
                  <li><strong>Limitación:</strong> Restringir el procesamiento</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Derechos de Portabilidad y Oposición</h4>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li><strong>Portabilidad:</strong> Recibir tus datos en formato estructurado</li>
                  <li><strong>Oposición:</strong> Oponerte al procesamiento</li>
                  <li><strong>Decisiones automatizadas:</strong> No estar sujeto solo a decisiones automatizadas</li>
                  <li><strong>Retirar consentimiento:</strong> En cualquier momento</li>
                </ul>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-green-900 mb-2">Cómo Ejercer tus Derechos</h4>
              <p className="text-green-800 text-sm mb-2">
                Puedes ejercer estos derechos contactándonos en:
              </p>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• <strong>Email:</strong> privacy@constructia.com</li>
                <li>• <strong>Formulario web:</strong> Disponible en tu panel de usuario</li>
                <li>• <strong>Correo postal:</strong> Calle Innovación 123, 28001 Madrid</li>
              </ul>
              <p className="text-green-800 text-sm mt-2">
                <strong>Tiempo de respuesta:</strong> Máximo 30 días naturales
              </p>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Cookies y Tecnologías Similares</h2>
            <p className="text-gray-700 mb-4">
              Utilizamos cookies y tecnologías similares para mejorar tu experiencia. Consulta nuestra 
              Política de Cookies para información detallada.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Menores de Edad</h2>
            <p className="text-gray-700 mb-4">
              Nuestros servicios no están dirigidos a menores de 16 años. No recopilamos intencionalmente 
              datos personales de menores sin el consentimiento parental verificable.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Cambios en esta Política</h2>
            <p className="text-gray-700 mb-4">
              Podemos actualizar esta Política de Privacidad ocasionalmente. Te notificaremos los cambios 
              significativos por email y mediante aviso en nuestra plataforma.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Autoridad de Control</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 text-sm">
                Si consideras que el tratamiento de tus datos no se ajusta a la normativa, puedes presentar 
                una reclamación ante la Agencia Española de Protección de Datos (AEPD):
              </p>
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                <li>• <strong>Web:</strong> www.aepd.es</li>
                <li>• <strong>Dirección:</strong> C/ Jorge Juan, 6, 28001 Madrid</li>
                <li>• <strong>Teléfono:</strong> 901 100 099</li>
              </ul>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Contacto</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <p className="text-gray-700 mb-2">
                Para cualquier consulta sobre esta Política de Privacidad:
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li><strong>Delegado de Protección de Datos:</strong> dpo@constructia.com</li>
                <li><strong>Email general:</strong> privacy@constructia.com</li>
                <li><strong>Teléfono:</strong> +34 91 000 00 00</li>
                <li><strong>Dirección:</strong> Calle Innovación 123, 28001 Madrid, España</li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 pt-6 mt-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-600">
                <Shield className="h-4 w-4 text-green-600 mr-2" />
                <span>Cumplimiento GDPR certificado</span>
              </div>
              <Link 
                to="/terms-of-service"
                className="text-green-600 hover:text-green-700 text-sm font-medium"
              >
                Ver Términos de Uso →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}