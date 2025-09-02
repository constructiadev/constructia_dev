import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { supabaseServiceClient } from '../../lib/supabase';
import Logo from '../common/Logo';

export default function ClientLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      // 1. Intentar login con Supabase
      const { data, error: authError } = await supabaseServiceClient.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!data.user) {
        throw new Error('No se pudo autenticar el usuario');
      }

      // 2. Verificar que el usuario tiene rol de cliente
      const { data: roleData, error: roleError } = await supabaseServiceClient
        .from('users')
        .select('role, tenant_id')
        .eq('id', data.user.id)
        .single();

      if (roleError) {
        console.error('Error fetching user data:', roleError);
        throw new Error(`No se pudo verificar el rol del usuario: ${roleError.message}`);
      }

      // Check if user has appropriate client role
      const allowedRoles = ['ClienteAdmin', 'GestorDocumental', 'SupervisorObra', 'Proveedor', 'Lector'];
      if (!allowedRoles.includes(roleData.role)) {
        throw new Error(`Acceso denegado. Rol '${roleData.role}' no autorizado para el panel de cliente.`);
      }

      // Store user session data
      localStorage.setItem('userRole', roleData.role);
      localStorage.setItem('tenantId', roleData.tenant_id);
      localStorage.setItem('userId', data.user.id);

      // 3. Redirigir al panel de cliente
      console.log('✅ Client login successful');
      navigate('/client/dashboard', { replace: true });

    } catch (err: any) {
      console.error('Client login error:', err);
      setError(err?.message || 'Error de autenticación');
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('juan@construccionesgarcia.com');
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="mb-6">
            <Logo size="lg" />
          </div>
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full mr-3">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Acceso Cliente</h1>
              <p className="text-blue-600 font-medium">Portal de Gestión Documental</p>
            </div>
          </div>
          <p className="text-gray-600">
            Accede a tu panel de gestión de documentos
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="tu@empresa.com"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors pr-12"
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
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {submitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={fillDemoCredentials}
            disabled={submitting}
            className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            Usar credenciales de cliente demo
          </button>
          <div className="mt-3 text-xs text-gray-500 text-center">
            <p><strong>Cliente:</strong> juan@construccionesgarcia.com / password123</p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/landing')}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            ← Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
}