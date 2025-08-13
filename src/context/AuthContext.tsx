import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { User as AppUser } from '../types';

// --- Tipos de contexto
interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: AppUser | null;
  userRole: 'admin' | 'client' | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isClient: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginAdmin: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, clientData: any) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<any>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

  const userRole: 'admin' | 'client' | null = (userProfile?.role as 'admin' | 'client') ?? null;

  // --- Cargar sesión inicial + suscripción a cambios de auth
  useEffect(() => {
    let isMounted = true;

    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setUserProfile(null);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        if (!isMounted) return;
        setSession(null);
        setUser(null);
        setUserProfile(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
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

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // --- Utilidad: cargar perfil (DB primero, luego fallback de desarrollo)
  const loadUserProfile = async (userId: string) => {
    try {
      // 1) Intentar obtener perfil desde DB
      const { data: dbProfile, error: dbErr } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!dbErr && dbProfile) {
        setUserProfile(dbProfile as AppUser);
        return;
      }

      // 2) Fallback para desarrollo (según email)
      const { data: { user } } = await supabase.auth.getUser();
      const userEmail = user?.email || 'unknown@email.com';
      const isAdmin = userEmail.includes('admin@constructia.com');

      const fallback: AppUser = {
        id: userId,
        email: userEmail,
        role: (isAdmin ? 'admin' : 'client') as 'admin' | 'client',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any;

      setUserProfile(fallback);
    } catch (error) {
      console.error('❌ [AuthContext] Error in loadUserProfile:', error);

      // Último fallback
      const { data: { user } } = await supabase.auth.getUser();
      const userEmail = user?.email || 'unknown@email.com';
      const isAdmin = userEmail.includes('admin@constructia.com');

      const emergency: AppUser = {
        id: userId,
        email: userEmail,
        role: (isAdmin ? 'admin' : 'client'),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any;

      setUserProfile(emergency);
    }
  };

  // --- Login cliente (no fuerza rol; confía en DB o fallback de desarrollo)
  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message?.includes('Invalid login credentials')) {
          throw new Error('Credenciales incorrectas. Verifica tu email y contraseña.');
        }
        throw error;
      }
      if (!data.user) throw new Error('No se pudo establecer la sesión del usuario.');
      await loadUserProfile(data.user.id);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // --- Login admin (versión robusta)
  const loginAdmin = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);

      // 1) Autenticación
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message?.includes('Invalid login credentials')) {
          throw new Error('Credenciales incorrectas. Verifica tu email y contraseña.');
        }
        throw error;
      }

      const authedUser = data.user;
      if (!authedUser) {
        throw new Error('No se pudo establecer la sesión del usuario.');
      }

      // 2) Verificar/crear perfil en tabla "users"
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('id, role, email')
        .eq('id', authedUser.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error obteniendo perfil:', profileError);
        await supabase.auth.signOut();
        throw new Error('Error al verificar permisos de administrador.');
      }

      if (!profile) {
        // No existe fila => crear perfil admin
        const { error: insertError } = await supabase
          .from('users')
          .insert({ id: authedUser.id, email, role: 'admin' });

        if (insertError) {
          console.error('Error creando perfil admin:', insertError);
          await supabase.auth.signOut();
          throw new Error('Error al crear el perfil de administrador.');
        }

        await loadUserProfile(authedUser.id);
        return;
      }

      if (profile.role !== 'admin') {
        await supabase.auth.signOut();
        throw new Error('Acceso no autorizado. Solo administradores pueden acceder.');
      }

      await loadUserProfile(authedUser.id);
    } catch (err) {
      console.error('Admin login error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // --- Registro de cliente (crea fila en users + clients)
  const register = async (email: string, password: string, clientData: any): Promise<void> => {
    try {
      setLoading(true);

      // 1) Crear usuario en auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('No se pudo crear el usuario.');

      // 2) Crear perfil en tabla users
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email,
          role: 'client'
        });

      if (userError) throw userError;

      // 3) Crear registro de cliente
      const clientId = `CLI-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const { error: clientError } = await supabase
        .from('clients')
        .insert({
          user_id: authData.user.id,
          client_id: clientId,
          company_name: clientData.company_name || '',
          contact_name: clientData.contact_name || '',
          email: email,
          phone: clientData.phone || '',
          address: clientData.address || '',
          subscription_plan: 'basic',
          subscription_status: 'active',
          storage_used: 0,
          storage_limit: 524288000, // 500MB
          documents_processed: 0,
          tokens_available: 500
        });

      if (clientError) throw clientError;

      // 4) Cargar perfil del usuario
      await loadUserProfile(authData.user.id);

    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

}