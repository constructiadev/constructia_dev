import React, { useState } from 'react';
import { 
  Shield, 
  Eye, 
  EyeOff, 
  AlertTriangle,
  CheckCircle,
  Globe,
  Lock,
  User
} from 'lucide-react';

interface ObraliaCredentials {
  username: string;
  password: string;
}

interface ObraliaCredentialsModalProps {
  isOpen: boolean;
  onSave: (credentials: ObraliaCredentials) => Promise<void>;
  clientName: string;
}

export default function ObraliaCredentialsModal({ 
  isOpen, 
  onSave, 
  clientName 
}: ObraliaCredentialsModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [credentials, setCredentials] = useState<ObraliaCredentials>({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!credentials.username || credentials.username.length < 3) {
      newErrors.username = 'El usuario de Obralia es obligatorio (mín. 3 caracteres)';
    }
    if (!credentials.password || credentials.password.length < 6) {
      newErrors.password = 'La contraseña de Obralia es obligatoria (mín. 6 caracteres)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      await onSave(credentials);
      setCredentials({ username: '', password: '' });
    } catch (error) {
      console.error('Error saving Obralia credentials:', error);
      // Show specific error message to user
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      alert(`Error al guardar credenciales: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-white/20 p-3 rounded-full">
              <Shield className="h-8 w-8" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-center">Configuración Obligatoria</h2>
          <p className="text-orange-100 text-center mt-2">
            Credenciales de Nalanda/Obralia
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Warning Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-yellow-800 mb-1">
                  Configuración Requerida
                </h4>
                <p className="text-sm text-yellow-700">
                  Para poder subir documentos automáticamente a Obralia/Nalanda, 
                  necesitas configurar tus credenciales. Esta configuración es 
                  <strong> obligatoria</strong> para usar la plataforma.
                </p>
              </div>
            </div>
          </div>

          {/* Client Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <Globe className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <p className="font-semibold text-blue-800">Cliente: {clientName}</p>
                <p className="text-sm text-blue-700">
                  Las credenciales se almacenan de forma segura y encriptada
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usuario de Obralia/Nalanda *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  value={credentials.username}
                  onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                  type="text"
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                    errors.username 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300'
                  }`}
                  placeholder="tu_usuario@obralia.com"
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña de Obralia/Nalanda *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  type={showPassword ? 'text' : 'password'}
                  className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                    errors.password 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Security Notice */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm text-green-800">
                    <strong>Seguridad garantizada:</strong> Tus credenciales se 
                    encriptan antes de almacenarse y solo se usan para la 
                    integración automática con Obralia.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando credenciales...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Guardar y Continuar
                </>
              )}
            </button>
          </form>

          {/* Footer Note */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Al guardar estas credenciales, aceptas que ConstructIA las use 
              exclusivamente para la integración con Obralia/Nalanda según 
              nuestros términos de servicio.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}