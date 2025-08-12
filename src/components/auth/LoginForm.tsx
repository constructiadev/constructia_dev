import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

interface LoginFormProps {
  isAdmin?: boolean;
}

export function LoginForm({ isAdmin = false }: LoginFormProps) {
  console.log('🔍 [LoginForm] Component rendering, isAdmin:', isAdmin);
  
  // Use useContext directly to debug the context availability
  const authContext = useContext(AuthContext);
  console.log('🔍 [LoginForm] AuthContext value:', authContext);
  
  // Check if context is available
  if (!authContext) {
    console.error('❌ [LoginForm] AuthContext is undefined - AuthProvider not found');
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <h1 className="text-xl font-bold text-red-600 mb-4">Error de Configuración</h1>
          <p className="text-gray-600">
            El contexto de autenticación no está disponible. Por favor, recarga la página.
          </p>
        </div>
      </div>
    );
  }

  const { login, loginAdmin } = authContext;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔍 [LoginForm] Form submitted, isAdmin:', isAdmin);
    setLoading(true);
    setError('');

    try {
      if (isAdmin) {
        console.log('🔍 [LoginForm] Attempting admin login');
        await loginAdmin(email, password);
        console.log('✅ [LoginForm] Admin login successful');
      } else {
        console.log('🔍 [LoginForm] Attempting client login');
        await login(email, password);
        console.log('✅ [LoginForm] Client login successful, navigating to dashboard');
        navigate('/client/dashboard');
      }
    } catch (err) {
      console.error('❌ [LoginForm] Login error:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocurrió un error inesperado. Por favor, inténtalo de nuevo.');
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

        <div className="mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={fillDemoCredentials}
            className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            {isAdmin ? 'Usar credenciales de admin demo' : 'Usar credenciales de cliente demo'}
          </button>
          <div className="mt-3 text-xs text-gray-500 space-y-1">
            {isAdmin ? (
              <>
                <p><strong>Admin:</strong> admin@constructia.com / superadmin123</p>
              </>
            ) : (
              <>
                <p><strong>Cliente:</strong> juan@construccionesgarcia.com / password123</p>
                <p><strong>Cliente 2:</strong> maria@reformasmodernas.com / password123</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}