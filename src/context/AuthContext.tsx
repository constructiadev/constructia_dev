import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { authService } from '../lib/auth';

// Development mode fallback users
const DEV_USERS = {
  'admin@constructia.com': {
    id: 'dev-admin-001',
    email: 'admin@constructia.com',
    role: 'admin' as const,
    password: 'superadmin123'
  },
  'cliente@test.com': {
    id: 'dev-client-001', 
    email: 'cliente@test.com',
    role: 'client' as const,
    password: 'password123'
  }
};

interface AuthContextType {
  user: User | null;
  userRole: 'client' | 'admin' | null;
  loading: boolean;
  login: (email: string, password: string, isAdmin?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, clientData: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<'client' | 'admin' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider useEffect iniciado');
    
    // Auto-login para demo del administrador
    const autoLoginAdmin = async () => {
      try {
        const mockUser = {
          id: 'dev-admin-001',
          email: 'admin@constructia.com',
          aud: 'authenticated',
          role: 'authenticated',
          email_confirmed_at: new Date().toISOString(),
          phone: '',
          confirmed_at: new Date().toISOString(),
          last_sign_in_at: new Date().toISOString(),
          app_metadata: {},
          user_metadata: {},
          identities: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as User;
        
        setUser(mockUser);
        setUserRole('admin');
        setLoading(false);
        console.log('Auto-login de administrador completado');
        return;
      } catch (error) {
        console.error('Error en auto-login:', error);
      }
    };
    
    autoLoginAdmin();
    return;
    
    // Verificar sesión existente
    authService.getSession().then(session => {
      console.log('Sesión existente obtenida:', session?.user?.email);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      }
      setLoading(false);
      console.log('Estado inicial de autenticación establecido');
    });

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Estado de autenticación cambiado:', event, session?.user?.email);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchUserRole(session.user.id);
        } else {
          setUserRole(null);
        }
        setLoading(false);
        console.log('Cambio de estado de autenticación procesado');
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    console.log('Obteniendo rol de usuario para ID:', userId);
    try {
      // Check if it's a development user
      const devUser = Object.values(DEV_USERS).find(u => u.id === userId);
      if (devUser) {
        console.log('Rol de usuario dev obtenido:', devUser.role);
        setUserRole(devUser.role);
        return;
      }

      const { data } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();
      
      console.log('Rol de usuario obtenido:', data?.role);
      setUserRole(data?.role || 'client');
    } catch (error) {
      console.error('Error al obtener el rol de usuario:', error);
      setUserRole('client');
    }
  };

  const login = async (email: string, password: string, isAdmin = false) => {
    console.log('Función login de AuthContext llamada con:', { email, isAdmin });
    try {
      // Check for development users first
      const devUser = DEV_USERS[email as keyof typeof DEV_USERS];
      if (devUser && devUser.password === password) {
        console.log('Usando usuario de desarrollo:', email);
        // Create a mock user object
        const mockUser = {
          id: devUser.id,
          email: devUser.email,
          aud: 'authenticated',
          role: 'authenticated',
          email_confirmed_at: new Date().toISOString(),
          phone: '',
          confirmed_at: new Date().toISOString(),
          last_sign_in_at: new Date().toISOString(),
          app_metadata: {},
          user_metadata: {},
          identities: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as User;
        
        setUser(mockUser);
        setUserRole(devUser.role);
        return;
      }

      // Try real Supabase login
      console.log('Intentando login real con Supabase desde AuthContext');
      try {
        if (isAdmin) {
          await authService.loginAdmin(email, password);
        } else {
          await authService.loginClient(email, password);
        }
      } catch (supabaseError) {
        console.error('Error de Supabase, usando modo desarrollo:', supabaseError);
        throw new Error('Credenciales inválidas. Verifica que los usuarios de prueba estén configurados en Supabase.');
      }
      console.log('Login real completado desde AuthContext');
    } catch (error) {
      console.error('Error en AuthContext login:', error);
      throw error;
    }
  };

  const logout = async () => {
    // Clear state
    setUser(null);
    setUserRole(null);
    
    // Intentar logout real si hay conexión a Supabase
    try {
      await authService.logout();
    } catch (error) {
      // Ignorar errores de logout en desarrollo
      console.log('Logout simulado para desarrollo');
    }
  };

  const register = async (email: string, password: string, clientData: any) => {
    await authService.registerClient(email, password, clientData);
  };

  const value = {
    user,
    userRole,
    loading,
    login,
    logout,
    register
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}