import React, { useState, useEffect } from 'react';
import { Plus, Building2, Search, Filter, AlertCircle, CheckCircle, MapPin, Mail, Phone } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Company {
  id: string;
  name: string;
  cif: string;
  address: string;
  phone?: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export default function Companies() {
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCompany, setNewCompany] = useState({
    name: '',
    cif: '',
    address: '',
    phone: '',
    email: ''
  });

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener usuario autenticado actual
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Usuario no autenticado');
      }
      
      // Obtener datos del cliente autenticado
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (clientError || !clientData) {
        throw new Error('No se encontraron datos del cliente');
      }
      
      // Obtener SOLO las empresas de este cliente específico
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .eq('client_id', clientData.id)
        .order('name');

      if (companiesError) {
        console.warn('Error loading companies:', companiesError);
        setCompanies([]);
      } else {
        setCompanies(companiesData || []);
      }
      
    } catch (err) {
      console.error('Error loading companies:', err);
      setError(err instanceof Error ? err.message : 'Error loading companies');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Obtener usuario autenticado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');
      
      // Obtener datos del cliente
      const { data: clientData } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (!clientData) throw new Error('Cliente no encontrado');
      
      // Crear empresa para este cliente específico
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .insert({
          client_id: clientData.id,
          name: newCompany.name,
          cif: newCompany.cif,
          address: newCompany.address,
          phone: newCompany.phone,
          email: newCompany.email
        })
        .select()
        .single();
      
      if (companyError) {
        throw new Error(`Error creating company: ${companyError.message}`);
      }
      
      setCompanies(prev => [...prev, companyData]);
      setNewCompany({ name: '', cif: '', address: '', phone: '', email: '' });
      setShowCreateModal(false);
      
    } catch (err) {
      console.error('Error creating company:', err);
      alert('Error al crear empresa: ' + (err instanceof Error ? err.message : 'Error desconocido'));
    }
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.cif.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando empresas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadCompanies}
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Empresas</h1>
          <p className="text-gray-600">Gestiona las empresas de tu cuenta</p>
          <div className="mt-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium inline-block">
            ✅ DATOS INDIVIDUALES - {companies.length} empresas
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva Empresa
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar empresas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Mis Empresas</p>
              <p className="text-2xl font-bold text-gray-900">{companies.length}</p>
            </div>
          </div>
        </div>

        {/* Placeholder stats - se pueden calcular desde las empresas del cliente */}
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCompanies.map((company) => (
          <div key={company.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <Building2 className="w-8 h-8 text-blue-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{company.name}</h3>
                    <p className="text-sm text-gray-600">CIF: {company.cif}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                {company.address && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    {company.address}
                  </div>
                )}
                
                {company.email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    {company.email}
                  </div>
                )}
                
                {company.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    {company.phone}
                  </div>
                )}
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-xs text-gray-500">
                  Creada {new Date(company.created_at).toLocaleDateString('es-ES')}
                </span>
                <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                  Ver detalles
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCompanies.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No se encontraron empresas' : 'No tienes empresas registradas'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm 
              ? 'Intenta ajustar el término de búsqueda'
              : 'Crea tu primera empresa para comenzar'
            }
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2"
      )}
      </div>
    </div>
  );
}