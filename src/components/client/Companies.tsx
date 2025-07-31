import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Users,
  Settings,
  Globe,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import ObraliaCredentialsModal from './ObraliaCredentialsModal';
import { useAuth } from '../../context/AuthContext';
import { getCurrentClientData, updateClientObraliaCredentials } from '../../lib/supabase';

interface Company {
  id: string;
  name: string;
  cif: string;
  address: string;
  phone: string;
  email: string;
  projects: number;
  documents: number;
  created_at: string;
  status: 'active' | 'inactive';
  obralia_configured?: boolean;
}

export default function Companies() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showObraliaModal, setShowObraliaModal] = useState(false);
  const [obraliaCompanyId, setObraliaCompanyId] = useState<string>('');
  const [companies, setCompanies] = useState<Company[]>([
    {
      id: '1',
      name: 'Construcciones García S.L.',
      cif: 'B12345678',
      address: 'Calle Mayor 123, Madrid',
      phone: '+34 91 123 45 67',
      email: 'info@construccionesgarcia.com',
      projects: 5,
      documents: 87,
      created_at: '2024-01-15',
      status: 'active',
      obralia_configured: true
    },
    {
      id: '2',
      name: 'Obras Públicas del Norte S.A.',
      cif: 'A87654321',
      address: 'Avenida Industrial 45, Bilbao',
      phone: '+34 94 876 54 32',
      email: 'contacto@obrasnorte.es',
      projects: 3,
      documents: 124,
      created_at: '2024-02-20',
      status: 'active',
      obralia_configured: false
    },
    {
      id: '3',
      name: 'Reformas Integrales López',
      cif: 'B11223344',
      address: 'Plaza España 8, Valencia',
      phone: '+34 96 111 22 33',
      email: 'reformas@lopez.com',
      projects: 2,
      documents: 45,
      created_at: '2024-03-10',
      status: 'inactive',
      obralia_configured: false
    }
  ]);
  const { user } = useAuth();

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.cif.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (company: Company) => {
    setSelectedCompany(company);
    setShowModal(true);
  };

  const handleDelete = (companyId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta empresa?')) {
      // Lógica de eliminación
      console.log('Eliminando empresa:', companyId);
    }
  };

  const handleObraliaConfig = (companyId: string) => {
    setObraliaCompanyId(companyId);
    setShowObraliaModal(true);
  };

  const handleSaveObraliaCredentials = async (credentials: { username: string; password: string }) => {
    if (!user?.id) {
      throw new Error('No se pudo identificar el usuario. Por favor, recarga la página.');
    }

    try {
      const clientData = await getCurrentClientData(user.id);
      
      if (!clientData || !clientData.id) {
        throw new Error('No se pudieron encontrar los datos del cliente. Por favor, contacta con soporte técnico.');
      }
      
      await updateClientObraliaCredentials(clientData.id, credentials);
      
      // Actualizar el estado local de la empresa específica
      setCompanies(prevCompanies => 
        prevCompanies.map(company => 
          company.id === obraliaCompanyId 
            ? { ...company, obralia_configured: true }
            : company
        )
      );
      
      alert('¡Credenciales de Obralia configuradas exitosamente para la empresa!');
      setShowObraliaModal(false);
      setObraliaCompanyId('');
      
    } catch (error) {
      console.error('Error saving Obralia credentials:', error);
      throw new Error('Error al guardar las credenciales. Intenta nuevamente.');
    }
  };

  const CompanyModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          {selectedCompany ? 'Editar Empresa' : 'Nueva Empresa'}
        </h3>
        
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de la Empresa
            </label>
            <input
              type="text"
              defaultValue={selectedCompany?.name || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Ej: Construcciones García S.L."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CIF
            </label>
            <input
              type="text"
              defaultValue={selectedCompany?.cif || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Ej: B12345678"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dirección
            </label>
            <input
              type="text"
              defaultValue={selectedCompany?.address || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Dirección completa"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                defaultValue={selectedCompany?.phone || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="+34 91 123 45 67"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                defaultValue={selectedCompany?.email || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="info@empresa.com"
              />
            </div>
          </div>
        </form>
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={() => {
              setShowModal(false);
              setSelectedCompany(null);
            }}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancelar
          </button>
          <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
            {selectedCompany ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Mis Empresas</h2>
          <p className="text-gray-600">Gestiona las empresas asociadas a tu cuenta</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Empresa
        </button>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nombre o CIF..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Lista de Empresas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanies.map((company) => (
          <div key={company.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="bg-green-100 p-2 rounded-lg mr-3">
                  <Building2 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{company.name}</h3>
                  <p className="text-sm text-gray-500">CIF: {company.cif}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                company.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {company.status === 'active' ? 'Activa' : 'Inactiva'}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                {company.address}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="h-4 w-4 mr-2" />
                {company.phone}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="h-4 w-4 mr-2" />
                {company.email}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{company.projects}</p>
                <p className="text-xs text-blue-800">Proyectos</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{company.documents}</p>
                <p className="text-xs text-green-800">Documentos</p>
              </div>
            </div>
            {/* Estado de Obralia */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Globe className="h-4 w-4 text-gray-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Obralia/Nalanda</span>
                </div>
                <div className="flex items-center space-x-2">
                  {company.obralia_configured ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-xs text-green-600 font-medium">Configurado</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <span className="text-xs text-orange-600 font-medium">No configurado</span>
                    </>
                  )}
                </div>
              </div>
              {!company.obralia_configured && (
                <button
                  onClick={() => handleObraliaConfig(company.id)}
                  className="mt-2 w-full flex items-center justify-center px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors text-sm"
                >
                  <Settings className="h-3 w-3 mr-2" />
                  Configurar Obralia
                </button>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center text-xs text-gray-500">
                <Calendar className="h-3 w-3 mr-1" />
                Creada: {new Date(company.created_at).toLocaleDateString()}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(company)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(company.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCompanies.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">No se encontraron empresas</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Crea tu primera empresa para comenzar'}
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            Nueva Empresa
          </button>
        </div>
      )}

      {/* Modal de Credenciales Obralia */}
      <ObraliaCredentialsModal
        isOpen={showObraliaModal}
        onSave={handleSaveObraliaCredentials}
        clientName={user?.email || 'Cliente'}
      />

      {/* Modal */}
      {showModal && <CompanyModal />}
    </div>
  );
}