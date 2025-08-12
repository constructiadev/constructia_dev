import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LoginFormProps {
  isAdmin?: boolean;
}

export default function LoginForm({ isAdmin = false }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, loginAdmin } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isAdmin) {
        await loginAdmin(email, password);
        // La navegación se manejará automáticamente por el Router
      } else {
        await login(email, password);
        navigate('/client/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Error de autenticación. Por favor, inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    if (isAdmin) {
      setEmail('admin@constructia.com');
      setPassword('superadmin123');
    } else {
      setEmail('juan@construccionesgarcia.com');
      setPassword('password123');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <LogIn className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isAdmin ? 'Acceso Administrativo' : 'Iniciar Sesión'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isAdmin ? 'Panel de administración de ConstructIA' : 'Accede a tu cuenta de ConstructIA'}
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              placeholder="tu@email.com"
              required
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors pr-12"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
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
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            ← Volver al inicio
          </Link>
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-2">Credenciales de prueba:</p>
          <div className="text-xs text-gray-600 space-y-1">
            <p><strong>Email:</strong> {isAdmin ? 'admin@constructia.com' : 'juan@construccionesgarcia.com'}</p>
            <p><strong>Contraseña:</strong> {isAdmin ? 'superadmin123' : 'password123'}</p>
          </div>
          <button
            type="button"
            onClick={fillDemoCredentials}
            className="mt-2 text-xs bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded transition-colors"
          >
            Usar credenciales de prueba
          </button>
          {isAdmin && (
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="mt-2 text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded transition-colors"
            >
              Acceso Directo al Panel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}