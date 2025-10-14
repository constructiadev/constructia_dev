import React from 'react';
import { AlertCircle, Mail, Phone, MessageSquare } from 'lucide-react';

interface SuspendedAccountBannerProps {
  suspensionReason?: string | null;
  companyName?: string;
}

export default function SuspendedAccountBanner({ suspensionReason, companyName }: SuspendedAccountBannerProps) {
  return (
    <div className="bg-red-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <AlertCircle className="h-8 w-8 animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold mb-2">
              Cuenta Suspendida
            </h2>
            <p className="text-red-100 mb-3 text-base">
              Su cuenta ha sido suspendida. Póngase en contacto con la administración de ConstructIA para solventarlo.
              <span className="block mt-2 font-semibold">
                Momentáneamente no puede subir documentos a la plataforma ni acceder a la mayoría de funcionalidades.
              </span>
            </p>

            {suspensionReason && (
              <div className="bg-red-700 bg-opacity-50 rounded-lg p-3 mb-3">
                <p className="font-semibold text-sm mb-1">Motivo de suspensión:</p>
                <p className="text-red-100 text-sm">{suspensionReason}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-4 mt-4">
              <a
                href="mailto:soporte@constructia.com"
                className="inline-flex items-center px-4 py-2 bg-white text-red-600 rounded-lg hover:bg-red-50 transition-colors font-semibold text-sm"
              >
                <Mail className="h-4 w-4 mr-2" />
                Contactar por Email
              </a>
              <a
                href="tel:+34900123456"
                className="inline-flex items-center px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors font-semibold text-sm"
              >
                <Phone className="h-4 w-4 mr-2" />
                Llamar al Soporte
              </a>
              <button
                onClick={() => {
                  window.location.href = '/client/subscription';
                }}
                className="inline-flex items-center px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors font-semibold text-sm"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Ver Suscripción
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-red-500">
              <p className="text-red-100 text-xs">
                Solo tiene acceso a las secciones de <strong>Configuración</strong> y <strong>Suscripción</strong>.
                {companyName && ` Empresa: ${companyName}`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
