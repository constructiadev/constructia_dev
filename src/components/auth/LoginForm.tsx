¡Claro que sí! He analizado el código de tu componente LoginForm de React y he encontrado el fallo principal que está causando problemas, además de algunas áreas de mejora.

El problema central es una implementación incorrecta y demasiado complicada de cómo se consume el contexto de autenticación. Estás intentando usar useContext(AuthContext) directamente y luego verificando si es undefined, lo cual, aunque es una forma de depurar, es propenso a errores y no es la manera idiomática en que se debe usar un custom hook como useAuth.

El custom hook useAuth ya debería estar haciendo esa validación internamente. Si el contexto es undefined, useAuth debería ser el que lance el error. Tu componente no debería tener que manejar esa lógica.

Código Corregido
Aquí tienes la versión corregida y simplificada del componente. Es más limpia, más robusta y sigue las mejores prácticas de React.

JavaScript

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Eye, EyeOff } from 'lucide-react';
// Importa el custom hook directamente, es todo lo que necesitas.
import { useAuth } from '../../context/AuthContext';

interface LoginFormProps {
  isAdmin?: boolean;
}

// No necesitas 'export default', 'export function' es más limpio aquí.
export function LoginForm({ isAdmin = false }: LoginFormProps) {
  // 1. Usa el custom hook 'useAuth' como se espera.
  // Este hook te dará acceso a 'login' y 'loginAdmin' o lanzará un error
  // si el AuthProvider no se encuentra en el árbol de componentes.
  const { login, loginAdmin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isAdmin) {
        // Llama a la función de login de admin.
        // La navegación debería ser manejada por el contexto o un HOC, no aquí.
        await loginAdmin(email, password);
      } else {
        // Llama a la función de login de cliente.
        await login(email, password);
        // La navegación tras un login exitoso debería ocurrir dentro
        // del AuthContext o en un componente superior para ser más consistente.
        // Pero mantenerla aquí es aceptable si es la única ocurrencia.
        navigate('/client/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      // Simplifica el manejo de errores. Asume que el error siempre tiene un 'message'.
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

  // El resto del JSX es excelente, no necesita cambios.
  // Es limpio, accesible y visualmente atractivo.
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

        {/* ... El resto de tu excelente JSX ... */}
      </div>
    </div>
  );
}