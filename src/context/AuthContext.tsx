import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { authService } from '../lib/auth';

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
      // Para desarrollo, simular login exitoso con credenciales de prueba
      if (isAdmin && email === 'admin@constructia.com' && password === 'superadmin123') {
        // Simular usuario admin
        console.log('Estableciendo usuario admin simulado');
        const simulatedAdminUser = { 
          id: 'admin-001', 
          email: 'admin@constructia.com',
          user_metadata: { role: 'admin' }
        } as any;
        setUser(simulatedAdminUser);
        setUserRole('admin');
        console.log('Usuario admin simulado establecido:', simulatedAdminUser);
      } else if (!isAdmin && email === 'cliente@test.com' && password === 'password123') {
        // Simular usuario cliente
        console.log('Estableciendo usuario cliente simulado');
        const simulatedClientUser = { 
          id: 'client-001', 
          email: 'cliente@test.com',
          user_metadata: { role: 'client' }
        } as any;
        setUser(simulatedClientUser);
        setUserRole('client');
        console.log('Usuario cliente simulado establecido:', simulatedClientUser);
      } else {
        // Intentar login real con Supabase
        console.log('Intentando login real con Supabase desde AuthContext');
        if (isAdmin) {
          await authService.loginAdmin(email, password);
        } else {
          await authService.loginClient(email, password);
        }
        console.log('Login real completado desde AuthContext');
      }
    } catch (error) {
      console.error('Error en AuthContext login:', error);
      throw error;
    }
  };

  const logout = async () => {
    // Para desarrollo, simplemente limpiar el estado
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