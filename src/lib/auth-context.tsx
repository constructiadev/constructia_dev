import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ClientAuthService, type AuthenticatedClient } from './client-auth-service';

interface AuthContextType {
  user: AuthenticatedClient | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isClient: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthenticatedClient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    checkSession();

    // Check session periodically for development
    const interval = setInterval(checkSession, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const checkSession = async () => {
    try {
      setLoading(true);
      const currentClient = await ClientAuthService.getCurrentClient();
      setUser(currentClient);
      
      if (currentClient) {
        console.log('✅ [AuthContext] Client session verified:', currentClient.email);
      } else {
        console.log('⚠️ [AuthContext] No active client session');
      }
    } catch (error) {
      console.error('Error checking session:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 [AuthContext] Attempting client sign in:', email);
      
      const authenticatedClient = await ClientAuthService.authenticateClient(email, password);

      if (!authenticatedClient) {
        throw new Error('Credenciales inválidas o acceso denegado');
      }

      setUser(authenticatedClient);
      console.log('✅ [AuthContext] Client signed in successfully:', authenticatedClient.email);

    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await ClientAuthService.logoutClient();
      setUser(null);
      console.log('✅ [AuthContext] Client signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const isClient = user?.role && ['ClienteAdmin', 'GestorDocumental', 'SupervisorObra', 'Proveedor', 'Lector'].includes(user.role);
  const isAdmin = user?.role === 'SuperAdmin';

  const value = {
    user,
    loading,
    signIn,
    signOut,
    isClient: !!isClient,
    isAdmin: !!isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};