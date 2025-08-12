import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { User as AppUser } from '../types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: AppUser | null;
  userRole: 'admin' | 'client' | null;
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

  const userRole = userProfile?.role || null;

  useEffect(() => {
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
        setSession(null);
        setUser(null);
        setUserProfile(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
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
    console.log('🔍 [AuthContext] Loading user profile for:', userId);
    
    try {
      if (!userId) {
        console.warn('⚠️ [AuthContext] No user ID provided to loadUserProfile');
        return;
      }

      console.log('🔍 [AuthContext] Querying users table...');
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      console.log('🔍 [AuthContext] User profile query result:', { data, error });

      if (error) {
        console.error('❌ [AuthContext] Error loading user profile:', error);
        // Si no existe el perfil, intentar crearlo
        if (error.code === 'PGRST116') {
          console.log('⚠️ [AuthContext] User profile not found, will be created on next login');
        }
        return;
      }

      if (data) {
        console.log('✅ [AuthContext] User profile loaded:', data.email, 'Role:', data.role);
        setUserProfile(data);
      } else {
        console.log('⚠️ [AuthContext] No user profile data returned');
      }
    } catch (error) {
      console.error('❌ [AuthContext] Error loading user profile:', error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
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
      
      // Durante desarrollo, no verificar rol específico
      console.log('Login successful for:', email);
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const loginAdmin = async (email: string, password: string) => {
    try {
      setLoading(true);
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

      // Verificar que es admin después del login
      if (data.user) {
        try {
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('role')
            .eq('id', data.user.id)
            .maybeSingle();

          if (profileError) {
            if (profileError.code === 'PGRST116') {
              // Usuario no existe en la tabla users, crear perfil de admin
              const { error: insertError } = await supabase
                .from('users')
                .insert({
                  id: data.user.id,
                  email: email,
                  role: 'admin'
                });
              
              if (insertError) {
                console.error('Error creating admin profile:', insertError);
                await supabase.auth.signOut();
                throw new Error('Error al crear el perfil de administrador.');
              }
              
              // Cargar el perfil recién creado
              await loadUserProfile(data.user.id);
            } else {
              console.error('Error fetching user profile:', profileError);
              await supabase.auth.signOut();
              throw new Error('Error al verificar permisos de administrador.');
            }
          } else if (profile?.role !== 'admin') {
            await supabase.auth.signOut();
            throw new Error('Acceso no autorizado. Solo administradores pueden acceder.');
          } else {
            // Usuario admin válido, cargar perfil
            await loadUserProfile(data.user.id);
          }
        } catch (profileError) {
          console.error('Error in admin verification:', profileError);
          await supabase.auth.signOut();
          throw new Error('Error al verificar permisos de administrador.');
        }
      }

      return data;
    } catch (error) {
      console.error('Admin login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, clientData: any) => {
    try {
      setLoading(true);
      
      // Primero crear el usuario en auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password
      });
      
      if (authError) {
        if (authError.message.includes('User already registered')) {
          throw new Error('El usuario ya está registrado. Por favor, inicia sesión.');
        }
        throw authError;
      }
      
      if (authData.user) {
        await createClientRecord(authData.user.id, email, clientData);
        
        // Hacer login automático después del registro
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (loginError) {
          console.warn('Auto-login after registration failed:', loginError);
        }
      }
      
      return authData;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createClientRecord = async (userId: string, email: string, clientData: any) => {
    console.log('🔍 [AuthContext] Creating client record for user:', userId, 'with data:', clientData);
    
    try {
      // Crear registro en users primero
      console.log('🔍 [AuthContext] Creating user record...');
      const { error: userError } = await supabase
        .from('users')
        .upsert({
          id: userId,
          email: email,
          role: 'client'
        });
      
      if (userError) {
        console.error('❌ [AuthContext] Error creating user record:', userError);
        console.error('Error creating user record:', userError);
        throw userError;
      }
      console.log('✅ [AuthContext] User record created successfully');

      // Luego crear el registro del cliente
      console.log('🔍 [AuthContext] Creating client record...');
      const { error } = await supabase
        .from('clients')
        .upsert({
          user_id: userId,
          client_id: `CLI-${userId.substring(0, 8).toUpperCase()}`,
          company_name: clientData.company_name || '',
          contact_name: clientData.contact_name || '',
          email: email,
          phone: clientData.phone || '',
          address: clientData.address || '',
          subscription_plan: 'basic'
        });
      
      if (error) {
        console.error('❌ [AuthContext] Error creating client record:', error);
        console.error('Error creating client record:', error);
        throw error;
      }
      console.log('✅ [AuthContext] Client record created successfully');
      
      // Cargar el perfil del usuario recién creado
      console.log('🔍 [AuthContext] Loading user profile after creation...');
      await loadUserProfile(userId);
    } catch (error) {
      console.error('❌ [AuthContext] Error in createClientRecord:', error);
      console.error('Error in createClientRecord:', error);
      throw error;
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
    userRole,
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