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
    
    // Verificar que el usuario tiene perfil de cliente
    if (data.user) {
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle();
      
      if (profileError && profileError.code !== 'PGRST116') {
        throw new Error('Error al verificar el perfil del usuario');
      }
      
      if (profile && profile.role !== 'client') {
        await supabase.auth.signOut();
        throw new Error('Acceso no autorizado para clientes');
      }
    }
    
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
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', data.user?.id)
      .maybeSingle();

    if (profileError && profileError.code !== 'PGRST116') {
      await supabase.auth.signOut();
      throw new Error('Error al verificar permisos');
    }
    
    if (!profile) {
      // Crear perfil de admin si no existe
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: data.user?.id,
          email: email,
          role: 'admin'
        });
      
      if (insertError) {
        await supabase.auth.signOut();
        throw new Error('Error al crear perfil de administrador');
      }
    } else if (profile.role !== 'admin') {
      await supabase.auth.signOut();
      throw new Error('Acceso no autorizado');
    }

    return data;
  },

  // Registro de cliente
  async registerClient(email: string, password: string, clientData: any) {
    try {
      // First, try to sign up the user without additional data
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: clientData
        }
      });
      
      if (error) {
        // Handle user already exists error
        if (error.message.includes('User already registered') || error.message.includes('user_already_exists')) {
          throw new Error('El usuario ya está registrado. Por favor, inicia sesión.');
        }
        
        // If signup fails with metadata, try without it
        if (error.message.includes('Database error saving new user')) {
          const { data: retryData, error: retryError } = await supabase.auth.signUp({
            email,
            password
          });
          
          if (retryError) throw retryError;
          
          // If user creation succeeds, manually create client record
          if (retryData.user) {
            await this.createClientRecord(retryData.user.id, email, clientData);
          }
          
          return retryData;
        }
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Helper method to create client record manually
  async createClientRecord(userId: string, email: string, clientData: any) {
    try {
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
        // Don't throw here - user is already created
      }
    } catch (error) {
      console.error('Error in createClientRecord:', error);
      // Don't throw here - user is already created
    }
  },

  // Reset password
  async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    
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