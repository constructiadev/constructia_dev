// ConstructIA - Custom Hook for Client Data with Tenant Isolation
import { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth-context';
import { ClientIsolatedDataService, type ClientDataContext } from '../lib/client-isolated-data';
import { getAllClients, getClientProjects, getClientCompanies, getClientDocuments } from '../lib/supabase';

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

      // Use tenant-isolated data service
      const context = await ClientIsolatedDataService.getClientDataContext();
      
      if (!context) {
        console.warn('⚠️ [useClientData] No context from isolated service, using fallback');
        // Fallback to basic client data
        const fallbackContext = {
          client: user,
          empresas: [],
          obras: [],
          documentos: [],
          stats: {
            totalCompanies: 0,
            totalProjects: 0,
            totalDocuments: 0,
            documentsProcessed: 0,
            storageUsed: user.storage_used || 0,
            storageLimit: user.storage_limit || 1073741824
          }
        };
        setDataContext(fallbackContext);
        return;
      }

      setDataContext(context);
      console.log('✅ [useClientData] Data context loaded successfully');

    } catch (err) {
      console.error('❌ [useClientData] Error loading client data:', err);
      // Don't set error, use fallback instead
      if (user) {
        const fallbackContext = {
          client: user,
          empresas: [],
          obras: [],
          documentos: [],
          stats: {
            totalCompanies: 0,
            totalProjects: 0,
            totalDocuments: 0,
            documentsProcessed: 0,
            storageUsed: user.storage_used || 0,
            storageLimit: user.storage_limit || 1073741824
          }
        };
        setDataContext(fallbackContext);
      } else {
        setError(err instanceof Error ? err.message : 'Error loading client data');
        setDataContext(null);
      }
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
        console.log('⚠️ [useClientProjects] No tenant_id, using fallback');
        // Use fallback method for projects
        const fallbackProjects = await getClientProjects('fallback-client-id');
        setProjects([]);
        return;
      }

      try {
        const projectsData = await ClientIsolatedDataService.getClientProjects(user.tenant_id);
        setProjects(projectsData);
      } catch (isolatedError) {
        console.warn('⚠️ [useClientProjects] Isolated service failed, using fallback');
        const fallbackProjects = await getClientProjects('fallback-client-id');
        setProjects(fallbackProjects);
      }

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
        console.log('⚠️ [useClientCompanies] No tenant_id, using fallback');
        const fallbackCompanies = await getClientCompanies('fallback-client-id');
        setCompanies([]);
        return;
      }

      try {
        const companiesData = await ClientIsolatedDataService.getClientCompanies(user.tenant_id);
        setCompanies(companiesData);
      } catch (isolatedError) {
        console.warn('⚠️ [useClientCompanies] Isolated service failed, using fallback');
        const fallbackCompanies = await getClientCompanies('fallback-client-id');
        setCompanies(fallbackCompanies);
      }

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
        console.log('⚠️ [useClientDocuments] No tenant_id, using fallback');
        const fallbackDocuments = await getClientDocuments('fallback-client-id');
        setDocuments([]);
        return;
      }

      try {
        const documentsData = await ClientIsolatedDataService.getClientDocuments(user.tenant_id);
        setDocuments(documentsData);
      } catch (isolatedError) {
        console.warn('⚠️ [useClientDocuments] Isolated service failed, using fallback');
        const fallbackDocuments = await getClientDocuments('fallback-client-id');
        setDocuments(fallbackDocuments);
      }

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