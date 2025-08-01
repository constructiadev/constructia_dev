import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { User as AppUser } from '../types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: AppUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginAdmin: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, clientData: any) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Función para verificar si el usuario existe en la base de datos
  const checkUserExists = async (email: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, role')
        .eq('email', email)
        .single();
      
      return { exists: !error && data, userData: data };
    } catch (error) {
      return { exists: false, userData: null };
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await loadUserProfile(session.user.id);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setUserProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error loading user profile:', error);
        return;
      }

      setUserProfile(data);
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // Primero verificar si el usuario existe en nuestra base de datos
      const { exists, userData } = await checkUserExists(email);
      
      if (!exists) {
        throw new Error('Usuario no encontrado. Por favor, regístrate primero.');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Credenciales incorrectas. Verifica tu email y contraseña.');
        }
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const loginAdmin = async (email: string, password: string) => {
    try {
      // Verificar si el usuario existe y es admin
      const { exists, userData } = await checkUserExists(email);
      
      if (!exists) {
        throw new Error('Usuario administrador no encontrado.');
      }
      
      if (userData?.role !== 'admin') {
        throw new Error('Acceso no autorizado. Solo administradores pueden acceder.');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Credenciales incorrectas. Verifica tu email y contraseña.');
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Admin login error:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, clientData: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: clientData
        }
      });
      
      if (error) {
        if (error.message.includes('User already registered') || error.message.includes('user_already_exists')) {
          throw new Error('El usuario ya está registrado. Por favor, inicia sesión.');
        }
        
        throw error;
      }
      
      // Si el usuario se creó correctamente, crear el registro del cliente
      if (data.user) {
        await createClientRecord(data.user.id, email, clientData);
      }
      
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const createClientRecord = async (userId: string, email: string, clientData: any) => {
    try {
      // Primero crear el registro en users
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: email,
          role: 'client'
        });
      
      if (userError) {
        console.error('Error creating user record:', userError);
      }

      // Luego crear el registro del cliente
      const { error } = await supabase
        .from('clients')
        .insert({
          user_id: userId,
          client_id: `CLI-${userId.substring(0, 8).toUpperCase()}`,
          company_name: clientData.company_name || '',
          contact_name: clientData.contact_name || '',
          email: email,
          phone: clientData.phone || '',
          address: clientData.address || '',
          subscription_plan: clientData.selected_plan || 'basic'
        });
      
      if (error) {
        console.error('Error creating client record:', error);
      }
    } catch (error) {
      console.error('Error in createClientRecord:', error);
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
    return data;
  };

  const value = {
    user,
    session,
    userProfile,
    loading,
    login,
    loginAdmin,
    register,
    logout,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};