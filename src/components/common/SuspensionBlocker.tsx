import React from 'react';
import { AlertCircle, Lock } from 'lucide-react';

interface SuspensionBlockerProps {
  message?: string;
  className?: string;
}

export default function SuspensionBlocker({
  message = "Esta función no está disponible mientras tu cuenta esté suspendida. Contacta con soporte para resolver esta situación.",
  className = ""
}: SuspensionBlockerProps) {
  return (
    <div className={`bg-red-50 border-2 border-red-200 rounded-lg p-6 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Lock className="h-8 w-8 text-red-600" />
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            Cuenta Suspendida
          </h3>
          <p className="text-red-800">
            {message}
          </p>
          <div className="mt-4 flex space-x-3">
            <a
              href="/client/subscription"
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm"
            >
              Ver Suscripción
            </a>
            <a
              href="mailto:soporte@constructia.com"
              className="inline-flex items-center px-4 py-2 bg-white text-red-600 border-2 border-red-600 rounded-lg hover:bg-red-50 transition-colors font-semibold text-sm"
            >
              Contactar Soporte
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SuspensionOverlayProps {
  show: boolean;
  message?: string;
}

export function SuspensionOverlay({ show, message }: SuspensionOverlayProps) {
  if (!show) return null;

  return (
    <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 rounded-lg">
      <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
        <div className="flex items-center mb-4">
          <AlertCircle className="h-8 w-8 text-red-600 mr-3" />
          <h3 className="text-xl font-bold text-gray-900">Cuenta Suspendida</h3>
        </div>
        <p className="text-gray-700 mb-4">
          {message || "No puedes realizar esta acción mientras tu cuenta esté suspendida."}
        </p>
        <div className="flex space-x-3">
          <a
            href="/client/subscription"
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-center font-semibold"
          >
            Ver Suscripción
          </a>
          <a
            href="mailto:soporte@constructia.com"
            className="flex-1 px-4 py-2 bg-white text-red-600 border-2 border-red-600 rounded-lg hover:bg-red-50 transition-colors text-center font-semibold"
          >
            Contactar
          </a>
        </div>
      </div>
    </div>
  );
}
