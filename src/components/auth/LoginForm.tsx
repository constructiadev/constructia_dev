import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LoginFormProps {
  isAdmin?: boolean; // opcional: si no viene, inferimos por la URL (/admin/*)
}

export default function LoginForm({ isAdmin: isAdminProp }: LoginFormProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginAdmin, isAuthenticated, userRole, loading } = useAuth();

  // Derivar modo admin del prop o del path
  const isAdminMode = isAdminProp ?? location.pathname.startsWith('/admin');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  // Si ya está autenticado, redirige al panel adecuado
  useEffect(() => {
    if (isAuthenticated && userRole) {
      navigate(userRole === 'admin' ? '/admin/dashboard' : '/client/dashboard', { replace: true });
    }
  }, [isAuthenticated, userRole, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (isAdminMode) {
        await loginAdmin(email, password); // esta función ya carga el perfil/rol
      } else {
        await login(email, password); // idem
      }

      // Tras login, el contexto ya tiene userRole actualizado
      if (userRole === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/client/dashboard', { replace: true });
      }
    } catch (err: any) {
      setError(err?.message || 'Credenciales inválidas o error de servidor.');
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemoCredentials = () => {
    if (isAdminMode) {
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
            {isAdminMode ? 'Acceso Administrativo' : 'Iniciar Sesión'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isAdminMode ? 'Panel de administración de ConstructIA' : 'Accede a tu cuenta de ConstructIA'}
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
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              placeholder="tu@email.com"
              required
              disabled={submitting || loading}
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
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors pr-12"
                placeholder="••••••••"
                required
                disabled={submitting || loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                disabled={submitting || loading}
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
            disabled={submitting || loading}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {(submitting || loading) ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        {!isAdminMode && (
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
            disabled={submitting || loading}
            className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            {isAdminMode ? 'Usar credenciales de admin demo' : 'Usar credenciales de cliente demo'}
          </button>
          <div className="mt-3 text-xs text-gray-500 space-y-1">
            {isAdminMode ? (
              <p><strong>Admin:</strong> admin@constructia.com / superadmin123</p>
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
