import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { supabase, supabaseServiceClient } from '../../lib/supabase-real';
import { useAuth } from '../../lib/auth-context';
import Logo from '../common/Logo';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { checkSession } = useAuth();
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
      // Admin authentication - separate from client auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError || !authData.user) {
        throw new Error(authError?.message || 'Authentication failed');
      }

      // Verify admin role
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('role')
        .eq('id', authData.user.id)
        .maybeSingle();

      if (profileError) {
        await supabase.auth.signOut();
        console.error('❌ [AdminLogin] Database error:', profileError);

        // Provide user-friendly error messages
        if (profileError.message.includes('querying schema')) {
          throw new Error('Error de configuración de base de datos. Contacta al administrador del sistema.');
        } else if (profileError.message.includes('JWT')) {
          throw new Error('Error de autenticación. Por favor, recarga la página e intenta nuevamente.');
        } else {
          throw new Error(`Error de base de datos: ${profileError.message}`);
        }
      } else if (!userProfile) {
        // Profile doesn't exist, create it as SuperAdmin
        const { error: createError } = await supabaseServiceClient
          .from('users')
          .upsert({
            id: authData.user.id,
            tenant_id: '00000000-0000-0000-0000-000000000001', // Default tenant for admin
            email: authData.user.email,
            name: authData.user.user_metadata?.name || 'Super Admin',
            role: 'SuperAdmin',
            active: true
          }, {
            onConflict: 'tenant_id,email'
          });

        if (createError) {
          await supabase.auth.signOut();
          throw new Error(`Failed to create admin profile: ${createError.message}`);
        }

        console.log('✅ [AdminLogin] Created new SuperAdmin profile for:', authData.user.email);
      } else if (userProfile.role !== 'SuperAdmin') {
        // User exists but doesn't have SuperAdmin role - upgrade them for admin login
        console.log('🔄 [AdminLogin] Upgrading user role to SuperAdmin for admin access');
        
        const { error: upgradeError } = await supabaseServiceClient
          .from('users')
          .update({
            role: 'SuperAdmin',
            updated_at: new Date().toISOString()
          })
          .eq('id', authData.user.id);

        if (upgradeError) {
          await supabase.auth.signOut();
          throw new Error(`Failed to upgrade user to SuperAdmin: ${upgradeError.message}`);
        }

        console.log('✅ [AdminLogin] Successfully upgraded user to SuperAdmin role');
      }

      // Ensure DEV_ADMIN_USER_ID exists in users table for audit logging
      const { error: adminUserError } = await supabaseServiceClient
        .from('users')
        .upsert({
          id: '20000000-0000-0000-0000-000000000001', // DEV_ADMIN_USER_ID
          tenant_id: '00000000-0000-0000-0000-000000000001',
          email: 'system@constructia.com',
          name: 'System Admin',
          role: 'SuperAdmin',
          active: true
        }, {
          onConflict: 'id'
        });

      if (adminUserError) {
        console.warn('Could not create system admin user:', adminUserError);
      }

      // Update auth context and let ProtectedRoute handle navigation
      await checkSession();
      navigate('/admin', { replace: true });
    } catch (err: any) {
      console.error('❌ [AdminLogin] Login error:', err);

      // Provide user-friendly error messages
      let errorMessage = 'Error de autenticación';

      if (err?.message) {
        if (err.message.includes('Invalid login credentials')) {
          errorMessage = 'Credenciales incorrectas. Verifica tu email y contraseña.';
        } else if (err.message.includes('Email not confirmed')) {
          errorMessage = 'Email no confirmado. Por favor, confirma tu email antes de iniciar sesión.';
        } else if (err.message.includes('Database error') || err.message.includes('querying schema')) {
          errorMessage = 'Este usuario requiere configuración adicional. Usa admin@constructia.com para acceder.';
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('admin@constructia.com');
    setPassword('superadmin123');
  };

  const fillSystemCredentials = () => {
    setEmail('system@constructia.com');
    setPassword('Superadmin123');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="mb-6">
            <Logo size="lg" />
          </div>
          <div className="flex items-center justify-center mb-4">
            <div className="bg-red-100 p-3 rounded-full mr-3">
              <Shield className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Acceso Administrativo</h1>
              <p className="text-red-600 font-medium">Solo Administradores</p>
            </div>
          </div>
          <p className="text-gray-600">
            Panel de administración de ConstructIA
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
              Email de Administrador
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
              placeholder="admin@constructia.com"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors pr-12"
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
            className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {submitting ? 'Verificando acceso...' : 'Acceder como Administrador'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200 space-y-3">
          <button
            type="button"
            onClick={fillDemoCredentials}
            disabled={submitting}
            className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            Usar Admin Principal
          </button>
          <div className="text-xs text-gray-500 text-center">
            <p><strong>Admin Principal:</strong> admin@constructia.com / superadmin123</p>
            <p className="mt-1 text-gray-400">✅ Usuario recomendado</p>
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