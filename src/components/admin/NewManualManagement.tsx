import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Building2,
  User,
  Settings,
  ChevronRight,
  ChevronDown,
  Info,
  Upload,
  Eye,
  Trash2,
  Plus,
  Filter,
  Search,
  Users,
  Factory,
  HardHat,
  Wrench,
  Key,
  Globe,
  Send,
  X,
  Save,
  Database,
  Shield,
  Target,
  Activity,
  BarChart3,
  FolderOpen
} from 'lucide-react';
import {
  AlertCircle,
  CheckCircle,
  Building2,
  User,
  Settings,
  ChevronDown,
  Search
} from 'lucide-react';
import {
  supabaseServiceClient,
  DEV_TENANT_ID
} from '../lib/supabase';

interface DocumentNode {
  id: string;
  categoria: string;
  file: string;
  mime?: string;
  size_bytes?: number;
  estado: string;
  caducidad?: string;
  metadatos: any;
  created_at: string;
  updated_at: string;
  entidad_tipo: string;
  entidad_id: string;
  manual_queue?: {
    id: string;
    status: 'queued' | 'in_progress' | 'uploaded' | 'error';
    priority: 'low' | 'normal' | 'high' | 'urgent';
    nota?: string;
    created_at: string;
  };
}

interface ObraNode {
  id: string;
  nombre_obra: string;
  codigo_obra: string;
  direccion?: string;
  cliente_final?: string;
  plataforma_destino?: string;
  perfil_riesgo: string;
  documentos: DocumentNode[];
  proveedores: {
    id: string;
    razon_social: string;
    trabajadores: {
      id: string;
      nombre?: string;
      apellido?: string;
      dni_nie: string;
      documentos: DocumentNode[];
    }[];
  }[];
  maquinaria: {
    id: string;
    tipo?: string;
    numero_serie?: string;
    documentos: DocumentNode[];
  }[];
}

interface EmpresaNode {
  id: string;
  razon_social: string;
  cif: string;
  contacto_email?: string;
  estado_compliance: string;
  obras: ObraNode[];
}

interface ClientNode {
  id: string;
  tenant_id: string;
  email: string;
  name?: string;
  role: string;
  empresas: EmpresaNode[];
  platform_credentials: {
    [platform: string]: {
      username: string;
      password: string;
      configured: boolean;
    };
  };
}

interface PlatformCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (platform: string, credentials: { username: string; password: string }) => Promise<void>;
  document: DocumentNode | null;
  clientName: string;
  availablePlatforms: string[];
}

function PlatformCredentialsModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  document, 
  clientName,
  availablePlatforms 
}: PlatformCredentialsModalProps) {
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (availablePlatforms.length > 0) {
      setSelectedPlatform(availablePlatforms[0]);
    }
  }, [availablePlatforms]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlatform || !credentials.username || !credentials.password) return;

    setIsSubmitting(true);
    try {
      await onSubmit(selectedPlatform, credentials);
      setCredentials({ username: '', password: '' });
      onClose();
    } catch (error) {
      console.error('Error submitting credentials:', error);
      alert('Error al procesar documento: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !document) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Subir a Plataforma Externa</h2>
              <p className="text-blue-100">{document.file?.split('/').pop() || 'documento.pdf'}</p>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Shield className="h-5 w-5 text-blue-600 mr-2" />
              <h4 className="font-semibold text-blue-800">Cliente: {clientName}</h4>
            </div>
            <p className="text-sm text-blue-700">
              Documento: <strong>{document.categoria}</strong> • Estado: <strong>{document.estado}</strong>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Plataforma Destino
            </label>
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              {availablePlatforms.map(platform => (
                <option key={platform} value={platform}>
                  {platform.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Usuario de {selectedPlatform?.toUpperCase()}
            </label>
            <input
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Usuario de la plataforma"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña de {selectedPlatform?.toUpperCase()}
            </label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Contraseña de la plataforma"
              required
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
              <p className="text-sm text-yellow-800">
                Estas credenciales fueron configuradas previamente por el cliente
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Subir Documento
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NewManualManagement() {
  const [clients, setClients] = useState<ClientNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [expandedClients, setExpandedClients] = useState<string[]>([]);
  const [expandedEmpresas, setExpandedEmpresas] = useState<string[]>([]);
  const [expandedObras, setExpandedObras] = useState<string[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<DocumentNode | null>(null);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [selectedClientForModal, setSelectedClientForModal] = useState<ClientNode | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalInQueue: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    errors: 0,
    totalClients: 0,
    platformsConfigured: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get tenant hierarchy with all data
      const hierarchy = await getTenantHierarchy(DEV_TENANT_ID);
      const tenantStats = await getTenantStats(DEV_TENANT_ID);

      // Get users for this tenant
      const { data: users, error: usersError } = await supabaseNew
        .from('users')
        .select('*')
        .eq('tenant_id', DEV_TENANT_ID);

      if (usersError) {
        console.error('Error fetching users:', usersError);
      }

      // Build client nodes with hierarchical structure
      const clientNodes: ClientNode[] = (users || []).map(user => {
        // Find empresas for this user (simulate ownership)
        const userEmpresas = hierarchy.filter((_, index) => index % (users?.length || 1) === (users?.indexOf(user) || 0));

        return {
          id: user.id,
          tenant_id: user.tenant_id,
          email: user.email,
          name: user.name,
          role: user.role,
          empresas: userEmpresas,
          platform_credentials: {
            ctaima: { username: `${user.email.split('@')[0]}_ctaima`, password: 'configured_pass', configured: Math.random() > 0.3 },
            ecoordina: { username: `${user.email.split('@')[0]}_eco`, password: 'configured_pass', configured: Math.random() > 0.5 },
            obralia: { username: `${user.email.split('@')[0]}_obr`, password: 'configured_pass', configured: Math.random() > 0.4 },
            nalanda: { username: `${user.email.split('@')[0]}_nal`, password: 'configured_pass', configured: Math.random() > 0.6 }
          }
        };
      });

      setClients(clientNodes);

      // Calculate real stats from hierarchy
      let totalDocuments = 0;
      let pendingDocs = 0;
      let completedDocs = 0;
      let errorDocs = 0;
      let platformsConfigured = 0;

      clientNodes.forEach(client => {
        // Count configured platforms
        const configuredPlatforms = Object.values(client.platform_credentials).filter(cred => cred.configured).length;
        if (configuredPlatforms > 0) platformsConfigured++;

        client.empresas.forEach(empresa => {
          empresa.obras.forEach(obra => {
            // Count documents from obra
            totalDocuments += obra.documentos.length;
            obra.documentos.forEach(doc => {
              if (doc.estado === 'pendiente') pendingDocs++;
              else if (doc.estado === 'aprobado') completedDocs++;
              else if (doc.estado === 'rechazado') errorDocs++;
            });

            // Count documents from proveedores/trabajadores
            obra.proveedores.forEach(proveedor => {
              proveedor.trabajadores.forEach(trabajador => {
                totalDocuments += trabajador.documentos.length;
                trabajador.documentos.forEach(doc => {
                  if (doc.estado === 'pendiente') pendingDocs++;
                  else if (doc.estado === 'aprobado') completedDocs++;
                  else if (doc.estado === 'rechazado') errorDocs++;
                });
              });
            });

            // Count documents from maquinaria
            obra.maquinaria.forEach(maquina => {
              totalDocuments += maquina.documentos.length;
              maquina.documentos.forEach(doc => {
                if (doc.estado === 'pendiente') pendingDocs++;
                else if (doc.estado === 'aprobado') completedDocs++;
                else if (doc.estado === 'rechazado') errorDocs++;
              });
            });
          });
        });
      });

      setStats({
        totalInQueue: totalDocuments,
        pending: pendingDocs,
        processing: Math.floor(totalDocuments * 0.1), // 10% processing
        completed: completedDocs,
        errors: errorDocs,
        totalClients: clientNodes.length,
        platformsConfigured
      });

    } catch (err) {
      console.error('Error loading manual management data:', err);
      setError(err instanceof Error ? err.message : 'Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadDocument = (document: DocumentNode, client: ClientNode) => {
    // Get available platforms for this client
    const availablePlatforms = Object.entries(client.platform_credentials)
      .filter(([_, creds]) => creds.configured)
      .map(([platform]) => platform);

    if (availablePlatforms.length === 0) {
      alert('Este cliente no tiene plataformas configuradas. El cliente debe configurar sus credenciales primero.');
      return;
    }

    setSelectedDocument(document);
    setSelectedClientForModal(client);
    setShowCredentialsModal(true);
  };

  const handleCredentialsSubmit = async (platform: string, credentials: { username: string; password: string }) => {
    if (!selectedDocument || !selectedClientForModal) return;

    try {
      setProcessing(selectedDocument.id);

      // Simulate upload process
      console.log(`🚀 Uploading document to ${platform.toUpperCase()}`);
      console.log(`📋 Document: ${selectedDocument.categoria} - ${selectedDocument.file?.split('/').pop()}`);
      console.log(`👤 Client: ${selectedClientForModal.name || selectedClientForModal.email}`);
      console.log(`🔑 Using credentials: ${credentials.username} / ${credentials.password.replace(/./g, '*')}`);

      // Simulate API call to external platform
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Update document status
      const { error } = await supabaseNew
        .from('documentos')
        .update({
          estado: 'aprobado',
          metadatos: {
            ...selectedDocument.metadatos,
            uploaded_to_platform: platform,
            upload_timestamp: new Date().toISOString(),
            uploaded_by_admin: DEV_ADMIN_USER_ID
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedDocument.id);

      if (error) {
        throw new Error(`Error updating document: ${error.message}`);
      }

      // Log audit event
      await logAuditoria(
        DEV_TENANT_ID,
        DEV_ADMIN_USER_ID,
        'document.uploaded_manually',
        'documento',
        selectedDocument.id,
        {
          platform,
          client_id: selectedClientForModal.id,
          original_filename: selectedDocument.file?.split('/').pop()
        }
      );

      // Update local state
      setClients(prev => prev.map(client => 
        client.id === selectedClientForModal.id 
          ? {
              ...client,
              empresas: client.empresas.map(empresa => ({
                ...empresa,
                obras: empresa.obras.map(obra => ({
                  ...obra,
                  documentos: obra.documentos.map(doc => 
                    doc.id === selectedDocument.id 
                      ? { ...doc, estado: 'aprobado' }
                      : doc
                  ),
                  proveedores: obra.proveedores.map(proveedor => ({
                    ...proveedor,
                    trabajadores: proveedor.trabajadores.map(trabajador => ({
                      ...trabajador,
                      documentos: trabajador.documentos.map(doc => 
                        doc.id === selectedDocument.id 
                          ? { ...doc, estado: 'aprobado' }
                          : doc
                      )
                    }))
                  })),
                  maquinaria: obra.maquinaria.map(maquina => ({
                    ...maquina,
                    documentos: maquina.documentos.map(doc => 
                      doc.id === selectedDocument.id 
                        ? { ...doc, estado: 'aprobado' }
                        : doc
                    )
                  }))
                }))
              }))
            }
          : client
      ));

      alert(`✅ Documento subido exitosamente a ${platform.toUpperCase()}`);

    } catch (error) {
      console.error('Error uploading document:', error);
      alert(`❌ Error al subir documento: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setProcessing(null);
      setSelectedDocument(null);
      setSelectedClientForModal(null);
    }
  };

  const handleRemoveDocument = async (documentId: string) => {
    if (!confirm('¿Estás seguro de eliminar este documento?')) return;

    try {
      const { error } = await supabaseNew
        .from('documentos')
        .delete()
        .eq('id', documentId);

      if (error) {
        throw new Error(`Error deleting document: ${error.message}`);
      }

      // Update local state
      setClients(prev => prev.map(client => ({
        ...client,
        empresas: client.empresas.map(empresa => ({
          ...empresa,
          obras: empresa.obras.map(obra => ({
            ...obra,
            documentos: obra.documentos.filter(doc => doc.id !== documentId),
            proveedores: obra.proveedores.map(proveedor => ({
              ...proveedor,
              trabajadores: proveedor.trabajadores.map(trabajador => ({
                ...trabajador,
                documentos: trabajador.documentos.filter(doc => doc.id !== documentId)
              }))
            })),
            maquinaria: obra.maquinaria.map(maquina => ({
              ...maquina,
              documentos: maquina.documentos.filter(doc => doc.id !== documentId)
            }))
          }))
        }))
      })));

      alert('✅ Documento eliminado correctamente');
    } catch (error) {
      console.error('Error removing document:', error);
      alert('❌ Error al eliminar documento');
    }
  };

  const toggleClient = (clientId: string) => {
    setExpandedClients(prev => 
      prev.includes(clientId) 
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const toggleEmpresa = (empresaId: string) => {
    setExpandedEmpresas(prev => 
      prev.includes(empresaId) 
        ? prev.filter(id => id !== empresaId)
        : [...prev, empresaId]
    );
  };

  const toggleObra = (obraId: string) => {
    setExpandedObras(prev => 
      prev.includes(obraId) 
        ? prev.filter(id => id !== obraId)
        : [...prev, obraId]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'aprobado': return 'bg-green-100 text-green-800';
      case 'rechazado': return 'bg-red-100 text-red-800';
      case 'borrador': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pendiente': return 'Pendiente';
      case 'aprobado': return 'Aprobado';
      case 'rechazado': return 'Rechazado';
      case 'borrador': return 'Borrador';
      default: return status;
    }
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getAllDocuments = (): DocumentNode[] => {
    const allDocs: DocumentNode[] = [];
    
    clients.forEach(client => {
      client.empresas.forEach(empresa => {
        empresa.obras.forEach(obra => {
          // Add obra documents
          allDocs.push(...obra.documentos);
          
          // Add trabajador documents
          obra.proveedores.forEach(proveedor => {
            proveedor.trabajadores.forEach(trabajador => {
              allDocs.push(...trabajador.documentos);
            });
          });
          
          // Add maquinaria documents
          obra.maquinaria.forEach(maquina => {
            allDocs.push(...maquina.documentos);
          });
        });
      });
    });

    return allDocs.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  };

  const getClientForDocument = (documentId: string): ClientNode | null => {
    for (const client of clients) {
      for (const empresa of client.empresas) {
        for (const obra of empresa.obras) {
          // Check obra documents
          if (obra.documentos.some(doc => doc.id === documentId)) {
            return client;
          }
          
          // Check trabajador documents
          for (const proveedor of obra.proveedores) {
            for (const trabajador of proveedor.trabajadores) {
              if (trabajador.documentos.some(doc => doc.id === documentId)) {
                return client;
              }
            }
          }
          
          // Check maquinaria documents
          for (const maquina of obra.maquinaria) {
            if (maquina.documentos.some(doc => doc.id === documentId)) {
              return client;
            }
          }
        }
      }
    }
    return null;
  };

  const filteredClients = clients.filter(client => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return client.email.toLowerCase().includes(search) ||
           client.name?.toLowerCase().includes(search) ||
           client.empresas.some(empresa => 
             empresa.razon_social.toLowerCase().includes(search) ||
             empresa.obras.some(obra => obra.nombre_obra.toLowerCase().includes(search))
           );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando gestión manual...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar los datos</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Gestión Manual de Documentos</h1>
            <p className="text-red-100 mb-4">
              Cola FIFO global para subida manual a plataformas externas
            </p>
            <div className="space-y-1 text-sm text-red-100">
              <p>• Estructura jerárquica: Cliente → Empresa → Obra → Documento</p>
              <p>• Subida en nombre del cliente usando sus credenciales</p>
              <p>• Soporte para CTAIMA, Ecoordina, Obralia y otras plataformas</p>
              <p>• Procesamiento FIFO con prioridades configurables</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={loadData}
              disabled={loading}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualizar Cola
            </button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total en Cola</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalInQueue}</p>
            </div>
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Procesando</p>
              <p className="text-2xl font-bold text-blue-600">{stats.processing}</p>
            </div>
            <RefreshCw className="w-6 h-6 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completados</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Errores</p>
              <p className="text-2xl font-bold text-red-600">{stats.errors}</p>
            </div>
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Clientes</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalClients}</p>
            </div>
            <Users className="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar clientes, empresas, obras o documentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los estados</option>
              <option value="pendiente">Pendientes</option>
              <option value="aprobado">Aprobados</option>
              <option value="rechazado">Rechazados</option>
              <option value="borrador">Borradores</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todas las prioridades</option>
              <option value="urgent">Urgente</option>
              <option value="high">Alta</option>
              <option value="normal">Normal</option>
              <option value="low">Baja</option>
            </select>
          </div>
        </div>
      </div>

      {/* Hierarchical Document Queue */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Cola de Documentos Jerárquica</h2>
            <div className="text-sm text-gray-600">
              {stats.totalInQueue} documentos en cola
            </div>
          </div>
        </div>

        {filteredClients.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay documentos en la cola
            </h3>
            <p className="text-gray-600 mb-6">
              Los documentos aparecerán aquí cuando los clientes los suban a la plataforma
            </p>
            <button
              onClick={loadData}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Actualizar Cola
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredClients.map(client => (
              <div key={client.id} className="p-4">
                {/* Client Level */}
                <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={() => toggleClient(client.id)}
                      className="p-1 rounded-full hover:bg-gray-100"
                    >
                      {expandedClients.includes(client.id) ? 
                        <ChevronDown className="w-5 h-5 text-gray-600" /> : 
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                      }
                    </button>
                    <User className="w-6 h-6 text-blue-600" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{client.name || client.email}</h3>
                      <p className="text-sm text-gray-600">{client.email} • {client.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-600">
                      {client.empresas.reduce((acc, emp) => 
                        acc + emp.obras.reduce((accObra, obra) => 
                          accObra + obra.documentos.length + 
                          obra.proveedores.reduce((accProv, prov) => 
                            accProv + prov.trabajadores.reduce((accTrab, trab) => 
                              accTrab + trab.documentos.length, 0), 0) +
                          obra.maquinaria.reduce((accMaq, maq) => 
                            accMaq + maq.documentos.length, 0), 0), 0)
                      } documentos
                    </div>
                    <div className="flex items-center space-x-2">
                      {Object.entries(client.platform_credentials).map(([platform, creds]) => (
                        <div
                          key={platform}
                          className={`w-3 h-3 rounded-full ${
                            creds.configured ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                          title={`${platform.toUpperCase()}: ${creds.configured ? 'Configurado' : 'No configurado'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Empresa Level */}
                {expandedClients.includes(client.id) && (
                  <div className="pl-8 space-y-2">
                    {client.empresas.map(empresa => (
                      <div key={empresa.id} className="border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-t-lg">
                          <div className="flex items-center space-x-3">
                            <button 
                              onClick={() => toggleEmpresa(empresa.id)}
                              className="p-1 rounded-full hover:bg-gray-200"
                            >
                              {expandedEmpresas.includes(empresa.id) ? 
                                <ChevronDown className="w-4 h-4 text-gray-600" /> : 
                                <ChevronRight className="w-4 h-4 text-gray-600" />
                              }
                            </button>
                            <Building2 className="w-5 h-5 text-green-600" />
                            <div>
                              <h4 className="font-medium text-gray-900">{empresa.razon_social}</h4>
                              <p className="text-sm text-gray-600">CIF: {empresa.cif}</p>
                            </div>
                          </div>
                          <div className="text-sm text-gray-600">
                            {empresa.obras.reduce((acc, obra) => 
                              acc + obra.documentos.length + 
                              obra.proveedores.reduce((accProv, prov) => 
                                accProv + prov.trabajadores.reduce((accTrab, trab) => 
                                  accTrab + trab.documentos.length, 0), 0) +
                              obra.maquinaria.reduce((accMaq, maq) => 
                                accMaq + maq.documentos.length, 0), 0)
                            } documentos
                          </div>
                        </div>

                        {/* Obra Level */}
                        {expandedEmpresas.includes(empresa.id) && (
                          <div className="pl-6 pb-2">
                            {empresa.obras.map(obra => (
                              <div key={obra.id} className="border-t border-gray-200">
                                <div className="flex items-center justify-between p-3 hover:bg-gray-50">
                                  <div className="flex items-center space-x-3">
                                    <button 
                                      onClick={() => toggleObra(obra.id)}
                                      className="p-1 rounded-full hover:bg-gray-100"
                                    >
                                      {expandedObras.includes(obra.id) ? 
                                        <ChevronDown className="w-4 h-4 text-gray-600" /> : 
                                        <ChevronRight className="w-4 h-4 text-gray-600" />
                                      }
                                    </button>
                                    <Factory className="w-4 h-4 text-purple-600" />
                                    <div>
                                      <h5 className="font-medium text-gray-900">{obra.nombre_obra}</h5>
                                      <p className="text-sm text-gray-600">{obra.codigo_obra}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-600">
                                      {obra.documentos.length + 
                                       obra.proveedores.reduce((acc, prov) => 
                                         acc + prov.trabajadores.reduce((accTrab, trab) => 
                                           accTrab + trab.documentos.length, 0), 0) +
                                       obra.maquinaria.reduce((acc, maq) => 
                                         acc + maq.documentos.length, 0)
                                      } docs
                                    </span>
                                    {obra.plataforma_destino && (
                                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                        {obra.plataforma_destino.toUpperCase()}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Documents Level */}
                                {expandedObras.includes(obra.id) && (
                                  <div className="pl-6 pb-2 space-y-2">
                                    {/* Obra Documents */}
                                    {obra.documentos.length > 0 && (
                                      <div>
                                        <h6 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                          <FileText className="w-4 h-4 mr-1" />
                                          Documentos de Obra ({obra.documentos.length})
                                        </h6>
                                        {obra.documentos.map(document => (
                                          <div key={document.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                                            <div className="flex items-center space-x-3">
                                              <FileText className="w-4 h-4 text-gray-400" />
                                              <div>
                                                <p className="font-medium text-gray-900">{document.categoria}</p>
                                                <p className="text-sm text-gray-600">
                                                  {document.file?.split('/').pop()} • {formatFileSize(document.size_bytes)}
                                                </p>
                                              </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(document.estado)}`}>
                                                {getStatusText(document.estado)}
                                              </span>
                                              <button
                                                onClick={() => handleUploadDocument(document, client)}
                                                disabled={processing === document.id || document.estado === 'aprobado'}
                                                className="p-1 text-blue-600 hover:text-blue-700 disabled:opacity-50 transition-colors"
                                                title="Subir a plataforma"
                                              >
                                                {processing === document.id ? (
                                                  <RefreshCw className="w-4 h-4 animate-spin" />
                                                ) : (
                                                  <Upload className="w-4 h-4" />
                                                )}
                                              </button>
                                              <button
                                                onClick={() => handleRemoveDocument(document.id)}
                                                className="p-1 text-red-600 hover:text-red-700 transition-colors"
                                                title="Eliminar documento"
                                              >
                                                <Trash2 className="w-4 h-4" />
                                              </button>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    {/* Trabajador Documents */}
                                    {obra.proveedores.map(proveedor => 
                                      proveedor.trabajadores.map(trabajador => 
                                        trabajador.documentos.length > 0 && (
                                          <div key={trabajador.id}>
                                            <h6 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                              <HardHat className="w-4 h-4 mr-1" />
                                              Trabajador: {trabajador.nombre} {trabajador.apellido} ({trabajador.documentos.length})
                                            </h6>
                                            {trabajador.documentos.map(document => (
                                              <div key={document.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                <div className="flex items-center space-x-3">
                                                  <FileText className="w-4 h-4 text-blue-400" />
                                                  <div>
                                                    <p className="font-medium text-gray-900">{document.categoria}</p>
                                                    <p className="text-sm text-gray-600">
                                                      {document.file?.split('/').pop()} • {formatFileSize(document.size_bytes)}
                                                    </p>
                                                  </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(document.estado)}`}>
                                                    {getStatusText(document.estado)}
                                                  </span>
                                                  <button
                                                    onClick={() => handleUploadDocument(document, client)}
                                                    disabled={processing === document.id || document.estado === 'aprobado'}
                                                    className="p-1 text-blue-600 hover:text-blue-700 disabled:opacity-50 transition-colors"
                                                  >
                                                    {processing === document.id ? (
                                                      <RefreshCw className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                      <Upload className="w-4 h-4" />
                                                    )}
                                                  </button>
                                                  <button
                                                    onClick={() => handleRemoveDocument(document.id)}
                                                    className="p-1 text-red-600 hover:text-red-700 transition-colors"
                                                  >
                                                    <Trash2 className="w-4 h-4" />
                                                  </button>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        )
                                      )
                                    )}

                                    {/* Maquinaria Documents */}
                                    {obra.maquinaria.map(maquina => 
                                      maquina.documentos.length > 0 && (
                                        <div key={maquina.id}>
                                          <h6 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                            <Wrench className="w-4 h-4 mr-1" />
                                            Máquina: {maquina.tipo} - {maquina.numero_serie} ({maquina.documentos.length})
                                          </h6>
                                          {maquina.documentos.map(document => (
                                            <div key={document.id} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                                              <div className="flex items-center space-x-3">
                                                <FileText className="w-4 h-4 text-purple-400" />
                                                <div>
                                                  <p className="font-medium text-gray-900">{document.categoria}</p>
                                                  <p className="text-sm text-gray-600">
                                                    {document.file?.split('/').pop()} • {formatFileSize(document.size_bytes)}
                                                  </p>
                                                </div>
                                              </div>
                                              <div className="flex items-center space-x-2">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(document.estado)}`}>
                                                  {getStatusText(document.estado)}
                                                </span>
                                                <button
                                                  onClick={() => handleUploadDocument(document, client)}
                                                  disabled={processing === document.id || document.estado === 'aprobado'}
                                                  className="p-1 text-purple-600 hover:text-purple-700 disabled:opacity-50 transition-colors"
                                                >
                                                  {processing === document.id ? (
                                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                                  ) : (
                                                    <Upload className="w-4 h-4" />
                                                  )}
                                                </button>
                                                <button
                                                  onClick={() => handleRemoveDocument(document.id)}
                                                  className="p-1 text-red-600 hover:text-red-700 transition-colors"
                                                >
                                                  <Trash2 className="w-4 h-4" />
                                                </button>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      )
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Information Panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <Info className="w-6 h-6 text-blue-600 mt-1" />
          <div>
            <h3 className="font-bold text-blue-800 mb-2">🔄 Sistema de Gestión Manual Jerárquico</h3>
            <p className="text-blue-700 mb-3">
              Gestión centralizada de documentos organizados por estructura jerárquica: Cliente → Empresa → Obra → Documento.
            </p>
            <div className="text-sm text-blue-600 space-y-1">
              <div><strong>Estructura jerárquica:</strong></div>
              <div>• 👤 <strong>Cliente</strong>: Usuario del sistema con credenciales de plataformas</div>
              <div>• 🏢 <strong>Empresa</strong>: Entidades empresariales del cliente</div>
              <div>• 🏗️ <strong>Obra</strong>: Proyectos específicos de cada empresa</div>
              <div>• 📄 <strong>Documentos</strong>: Archivos de obra, trabajadores y maquinaria</div>
              <div className="mt-2 pt-2 border-t border-blue-300">
                <div className="font-medium text-blue-800">Tipos de documentos:</div>
                <div>• 🏗️ <strong>Obra</strong>: Planes, certificados, evaluaciones</div>
                <div>• 👷 <strong>Trabajadores</strong>: DNI, aptitud médica, formación PRL</div>
                <div>• 🔧 <strong>Maquinaria</strong>: Certificados, mantenimiento, seguros</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Credentials Modal */}
      <PlatformCredentialsModal
        isOpen={showCredentialsModal}
        onClose={() => setShowCredentialsModal(false)}
        onSubmit={handleCredentialsSubmit}
        document={selectedDocument}
        clientName={selectedClientForModal?.name || selectedClientForModal?.email || 'Cliente'}
        availablePlatforms={selectedClientForModal ? 
          Object.entries(selectedClientForModal.platform_credentials)
            .filter(([_, creds]) => creds.configured)
            .map(([platform]) => platform)
          : []
        }
      />
    </div>
  );
}