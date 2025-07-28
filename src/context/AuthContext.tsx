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
    // Verificar sesión existente
    authService.getSession().then(session => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      }
      setLoading(false);
    });

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchUserRole(session.user.id);
        } else {
          setUserRole(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();
      
      setUserRole(data?.role || 'client');
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole('client');
    }
  };

  const login = async (email: string, password: string, isAdmin = false) => {
    try {
      // Para desarrollo, simular login exitoso con credenciales de prueba
      if (isAdmin && email === 'admin@constructia.com' && password === 'superadmin123') {
        // Simular usuario admin
        setUser({ 
          id: 'admin-001', 
          email: 'admin@constructia.com',
          user_metadata: { role: 'admin' }
        } as any);
        setUserRole('admin');
      } else if (!isAdmin && email === 'cliente@test.com' && password === 'password123') {
        // Simular usuario cliente
        setUser({ 
          id: 'client-001', 
          email: 'cliente@test.com',
          user_metadata: { role: 'client' }
        } as any);
        setUserRole('client');
      } else {
        // Intentar login real con Supabase
        if (isAdmin) {
          await authService.loginAdmin(email, password);
        } else {
          await authService.loginClient(email, password);
        }
      }
    } catch (error) {
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