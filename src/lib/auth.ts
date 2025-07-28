import { supabase } from './supabase';
import type { User } from '../types';

export const authService = {
  // Login de cliente
  async loginClient(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  },

  // Login de administrador
  async loginAdmin(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;

    // Verificar que es admin
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', data.user?.id)
      .single();

    if (profile?.role !== 'admin') {
      await supabase.auth.signOut();
      throw new Error('Acceso no autorizado');
    }

    return data;
  },

  // Registro de cliente
  async registerClient(email: string, password: string, clientData: any) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: clientData
      }
    });
    
    if (error) throw error;
    return data;
  },

  // Logout
  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Obtener usuario actual
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  // Verificar sesión
  async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }
};