// ConstructIA - Custom Hook for Client Data with Tenant Isolation
import { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth-context';
import { ClientIsolatedDataService, type ClientDataContext } from '../lib/client-isolated-data';

export function useClientData() {
  const { user } = useAuth();
  const [dataContext, setDataContext] = useState<ClientDataContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadClientData();
  }, [user]);

  const loadClientData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        console.log('⚠️ [useClientData] No authenticated user');
        setDataContext(null);
        return;
      }

      console.log('🔍 [useClientData] Loading data for user:', user.email);

      const context = await ClientIsolatedDataService.getClientDataContext();
      
      if (!context) {
        throw new Error('No se pudo cargar el contexto de datos del cliente');
      }

      setDataContext(context);
      console.log('✅ [useClientData] Data context loaded successfully');

    } catch (err) {
      console.error('❌ [useClientData] Error loading client data:', err);
      setError(err instanceof Error ? err.message : 'Error loading client data');
      setDataContext(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    await loadClientData();
  };

  return {
    client: dataContext?.client || null,
    empresas: dataContext?.empresas || [],
    obras: dataContext?.obras || [],
    documentos: dataContext?.documentos || [],
    stats: dataContext?.stats || {
      totalCompanies: 0,
      totalProjects: 0,
      totalDocuments: 0,
      documentsProcessed: 0,
      storageUsed: 0,
      storageLimit: 0
    },
    loading,
    error,
    refreshData
  };
}

// Hook for getting client projects with tenant isolation
export function useClientProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, [user]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.tenant_id) {
        setProjects([]);
        return;
      }

      const projectsData = await ClientIsolatedDataService.getClientProjects(user.tenant_id);
      setProjects(projectsData);

    } catch (err) {
      console.error('❌ [useClientProjects] Error:', err);
      setError(err instanceof Error ? err.message : 'Error loading projects');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  return { projects, loading, error, refreshProjects: loadProjects };
}

// Hook for getting client companies with tenant isolation
export function useClientCompanies() {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCompanies();
  }, [user]);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.tenant_id) {
        setCompanies([]);
        return;
      }

      const companiesData = await ClientIsolatedDataService.getClientCompanies(user.tenant_id);
      setCompanies(companiesData);

    } catch (err) {
      console.error('❌ [useClientCompanies] Error:', err);
      setError(err instanceof Error ? err.message : 'Error loading companies');
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  return { companies, loading, error, refreshCompanies: loadCompanies };
}

// Hook for getting client documents with tenant isolation
export function useClientDocuments() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDocuments();
  }, [user]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.tenant_id) {
        setDocuments([]);
        return;
      }

      const documentsData = await ClientIsolatedDataService.getClientDocuments(user.tenant_id);
      setDocuments(documentsData);

    } catch (err) {
      console.error('❌ [useClientDocuments] Error:', err);
      setError(err instanceof Error ? err.message : 'Error loading documents');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  return { documents, loading, error, refreshDocuments: loadDocuments };
}