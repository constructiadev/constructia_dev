import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Logo from '../common/Logo';

interface LoginFormProps {
  isAdmin?: boolean;
}

export default function LoginForm({ isAdmin = false }: LoginFormProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginAdmin, user, profile, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (user && profile) {
      const redirectTo = profile.role === 'admin' ? '/admin/dashboard' : '/client/dashboard';
      navigate(redirectTo, { replace: true });
    }
  }, [user, profile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (isAdmin) {
        await loginAdmin(email, password);
        navigate('/admin/dashboard', { replace: true });
      } else {
        await login(email, password);
        navigate('/client/dashboard', { replace: true });
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err?.message || 'Error de autenticación');
    } finally {
      setSubmitting(false);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="mb-6">
            <Logo size="lg" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isAdmin ? 'Acceso Administrativo' : 'Iniciar Sesión'}
          </h1>
          <p className="text-gray-600">
            {isAdmin ? 'Panel de administración de ConstructIA' : 'Accede a tu cuenta de ConstructIA'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

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
              disabled={submitting}
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
                disabled={submitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={submitting}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {submitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
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
            disabled={submitting}
            className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            {isAdmin ? 'Usar credenciales de admin demo' : 'Usar credenciales de cliente demo'}
          </button>
          <div className="mt-3 text-xs text-gray-500 space-y-1">
            {isAdmin ? (
              <p><strong>Admin:</strong> admin@constructia.com / superadmin123</p>
            ) : (
              <p><strong>Cliente:</strong> juan@construccionesgarcia.com / password123</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}