import React, { useState } from 'react';
import { 
  FolderOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Calendar,
  Users,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Building2,
  MapPin,
  Euro
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  company_name: string;
  description: string;
  status: 'active' | 'completed' | 'paused' | 'planning';
  progress: number;
  start_date: string;
  end_date?: string;
  budget: number;
  documents_count: number;
  team_members: number;
  location: string;
  created_at: string;
}

export default function Projects() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Datos simulados de proyectos
  const projects: Project[] = [
    {
      id: '1',
      name: 'Edificio Residencial Centro',
      company_name: 'Construcciones García S.L.',
      description: 'Construcción de edificio residencial de 8 plantas con 32 viviendas',
      status: 'active',
      progress: 65,
      start_date: '2024-01-15',
      end_date: '2024-12-20',
      budget: 2500000,
      documents_count: 87,
      team_members: 12,
      location: 'Madrid Centro',
      created_at: '2024-01-10'
    },
    {
      id: '2',
      name: 'Reforma Oficinas Norte',
      company_name: 'Construcciones García S.L.',
      description: 'Reforma integral de oficinas corporativas',
      status: 'active',
      progress: 30,
      start_date: '2024-03-01',
      end_date: '2024-08-15',
      budget: 450000,
      documents_count: 34,
      team_members: 6,
      location: 'Distrito Norte',
      created_at: '2024-02-20'
    },
    {
      id: '3',
      name: 'Puente Industrial A-7',
      company_name: 'Obras Públicas del Norte S.A.',
      description: 'Construcción de puente para acceso industrial',
      status: 'completed',
      progress: 100,
      start_date: '2023-06-01',
      end_date: '2024-01-30',
      budget: 1800000,
      documents_count: 156,
      team_members: 18,
      location: 'Autopista A-7',
      created_at: '2023-05-15'
    },
    {
      id: '4',
      name: 'Centro Comercial Valencia',
      company_name: 'Reformas Integrales López',
      description: 'Construcción de centro comercial de 3 plantas',
      status: 'planning',
      progress: 5,
      start_date: '2024-06-01',
      end_date: '2025-03-15',
      budget: 3200000,
      documents_count: 12,
      team_members: 4,
      location: 'Valencia Este',
      created_at: '2024-01-25'
    },
    {
      id: '5',
      name: 'Rehabilitación Edificio Histórico',
      company_name: 'Reformas Integrales López',
      description: 'Rehabilitación de edificio histórico del siglo XVIII',
      status: 'paused',
      progress: 45,
      start_date: '2023-09-01',
      budget: 890000,
      documents_count: 78,
      team_members: 8,
      location: 'Casco Histórico',
      created_at: '2023-08-10'
    }
  ];

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'planning': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'paused': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'planning': return <Clock className="h-4 w-4 text-purple-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'completed': return 'Completado';
      case 'paused': return 'Pausado';
      case 'planning': return 'Planificación';
      default: return status;
    }
  };

  const ProjectModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">
            {selectedProject ? 'Detalles del Proyecto' : 'Nuevo Proyecto'}
          </h3>
          <button
            onClick={() => {
              setShowModal(false);
              setSelectedProject(null);
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        
        {selectedProject && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Proyecto</label>
                <input
                  type="text"
                  defaultValue={selectedProject.name}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select
                  defaultValue={selectedProject.status}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="planning">Planificación</option>
                  <option value="active">Activo</option>
                  <option value="paused">Pausado</option>
                  <option value="completed">Completado</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea
                defaultValue={selectedProject.description}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Inicio</label>
                <input
                  type="date"
                  defaultValue={selectedProject.start_date}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Fin</label>
                <input
                  type="date"
                  defaultValue={selectedProject.end_date}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Presupuesto (€)</label>
                <input
                  type="number"
                  defaultValue={selectedProject.budget}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
                <input
                  type="text"
                  defaultValue={selectedProject.location}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Progreso: {selectedProject.progress}%</label>
              <input
                type="range"
                min="0"
                max="100"
                defaultValue={selectedProject.progress}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        )}
        
        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
          <button
            onClick={() => {
              setShowModal(false);
              setSelectedProject(null);
            }}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancelar
          </button>
          <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
            Guardar Cambios
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
          <h2 className="text-2xl font-bold text-gray-800">Mis Proyectos</h2>
          <p className="text-gray-600">Gestiona todos tus proyectos de construcción</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Proyecto
        </button>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar proyectos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="all">Todos los estados</option>
            <option value="planning">Planificación</option>
            <option value="active">Activo</option>
            <option value="paused">Pausado</option>
            <option value="completed">Completado</option>
          </select>
        </div>
      </div>

      {/* Lista de Proyectos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProjects.map((project) => (
          <div key={project.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="bg-green-100 p-2 rounded-lg mr-3">
                  <FolderOpen className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{project.name}</h3>
                  <p className="text-sm text-gray-500">{project.company_name}</p>
                </div>
              </div>
              <div className="flex items-center">
                {getStatusIcon(project.status)}
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                  {getStatusText(project.status)}
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">{project.description}</p>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Progreso</span>
                <span className="font-medium">{project.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                {project.location}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Euro className="h-4 w-4 mr-2" />
                {project.budget.toLocaleString()}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <FileText className="h-4 w-4 mr-2" />
                {project.documents_count} docs
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-4 w-4 mr-2" />
                {project.team_members} miembros
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center text-xs text-gray-500">
                <Calendar className="h-3 w-3 mr-1" />
                Inicio: {new Date(project.start_date).toLocaleDateString()}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedProject(project);
                    setShowModal(true);
                  }}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">No se encontraron proyectos</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Crea tu primer proyecto para comenzar'}
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            Nuevo Proyecto
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && <ProjectModal />}
    </div>
  );
}