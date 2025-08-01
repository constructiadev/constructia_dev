import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, LogIn, Building2 } from 'lucide-react';

interface LoginFormProps {
  isAdmin?: boolean;
}

export default function LoginForm({ isAdmin = false }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, loginAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isAdmin) {
        await loginAdmin(email, password);
        navigate('/admin');
      } else {
        await login(email, password);
        navigate('/client/dashboard');
      }
    } catch (err) {
      console.error('Error en handleSubmit:', err);
      setError(err instanceof Error ? err.message : 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 p-3 rounded-full">
                {isAdmin ? (
                  <Building2 className="h-8 w-8 text-green-600" />
                ) : (
                  <LogIn className="h-8 w-8 text-green-600" />
                )}
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">
              {isAdmin ? 'Acceso Administrador' : 'Iniciar Sesión'}
            </h2>
            <p className="text-gray-600 mt-2">
              {isAdmin 
                ? 'Panel de administración de ConstructIA' 
                : 'Accede a tu cuenta de ConstructIA'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Iniciando sesión...
                </div>
              ) : (
                `${isAdmin ? 'Acceder como Admin' : 'Iniciar Sesión'}`
              )}
            </button>
          </form>

          {!isAdmin && (
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                ¿No tienes una cuenta?{' '}
                <Link to="/register" className="text-green-600 hover:text-green-700 font-medium">
                  Regístrate aquí
                </Link>
              </p>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link 
              to="/landing" 
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              ← Volver al inicio
            </Link>
          </div>

          {/* Demo credentials */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              {isAdmin ? 'Credenciales de prueba (Admin):' : 'Credenciales de prueba:'}
            </h3>
            <div className="text-xs text-gray-600 space-y-1">
              {isAdmin ? (
                <>
                  <p><strong>Email:</strong> admin@constructia.com</p>
                  <p><strong>Contraseña:</strong> admin123</p>
                </>
              ) : (
                <>
                  <p><strong>Email:</strong> cliente@test.com</p>
                  <p><strong>Contraseña:</strong> cliente123</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}