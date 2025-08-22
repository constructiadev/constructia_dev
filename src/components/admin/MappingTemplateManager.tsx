import React, { useState, useEffect } from 'react';
import {
  Settings,
  Code,
  Eye,
  Edit,
  Trash2,
  Plus,
  Save,
  X,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Copy,
  Download,
  Upload,
  Database,
  Zap,
  Globe,
  FileText,
  ArrowRight,
  Filter,
  Search
} from 'lucide-react';
import {
  MappingTemplateService,
  MappingEngine,
  TransformEngine,
  type MappingTemplate,
  type MappingRule
} from '../../types/mapping';
import { DEV_TENANT_ID } from '../../lib/supabase-new';

interface MappingTemplateManagerProps {
  tenantId?: string;
}

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: Partial<MappingTemplate>) => Promise<void>;
  template?: MappingTemplate | null;
  mode: 'create' | 'edit' | 'view';
}

function TemplateModal({ isOpen, onClose, onSave, template, mode }: TemplateModalProps) {
  const [formData, setFormData] = useState({
    plataforma: template?.plataforma || 'nalanda',
    version: template?.version || 1,
    schema_destino: template?.schema_destino || {},
    rules: template?.rules || []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testPayload, setTestPayload] = useState('');
  const [testResult, setTestResult] = useState<any>(null);

  const platforms = [
    { value: 'nalanda', label: 'Nalanda', color: 'bg-blue-600' },
    { value: 'ctaima', label: 'CTAIMA', color: 'bg-green-600' },
    { value: 'ecoordina', label: 'Ecoordina', color: 'bg-purple-600' },
    { value: 'otro', label: 'Otro', color: 'bg-gray-600' }
  ];

  const testMapping = () => {
    try {
      const payload = JSON.parse(testPayload);
      const mockTemplate: MappingTemplate = {
        id: 'test',
        tenant_id: 'test',
        plataforma: formData.plataforma as any,
        version: formData.version,
        schema_destino: formData.schema_destino,
        rules: formData.rules,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const engine = new MappingEngine(mockTemplate);
      const result = engine.transform(payload);
      const validation = engine.validate(result);

      setTestResult({
        transformed: result,
        validation,
        success: validation.isValid
      });
    } catch (error) {
      setTestResult({
        error: error instanceof Error ? error.message : 'Error en el test',
        success: false
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving template:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const isReadOnly = mode === 'view';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white/20 p-3 rounded-full mr-4">
                <Code className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {mode === 'create' ? 'Nuevo Template de Mapping' : 
                   mode === 'edit' ? 'Editar Template' : 
                   'Detalles del Template'}
                </h2>
                <p className="text-blue-100">
                  Configuración de transformación de datos
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuración */}
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plataforma *
                </label>
                <select
                  value={formData.plataforma}
                  onChange={(e) => setFormData(prev => ({ ...prev, plataforma: e.target.value }))}
                  disabled={isReadOnly}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  {platforms.map(platform => (
                    <option key={platform.value} value={platform.value}>
                      {platform.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Versión
                </label>
                <input
                  type="number"
                  value={formData.version}
                  onChange={(e) => setFormData(prev => ({ ...prev, version: parseInt(e.target.value) || 1 }))}
                  disabled={isReadOnly}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Schema Destino (JSON) *
                </label>
                <textarea
                  value={JSON.stringify(formData.schema_destino, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      setFormData(prev => ({ ...prev, schema_destino: parsed }));
                    } catch (error) {
                      // Mantener el valor para que el usuario pueda corregir
                    }
                  }}
                  disabled={isReadOnly}
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm disabled:bg-gray-100"
                  placeholder="Esquema JSON del sistema destino..."
                />
              </div>

              {!isReadOnly && (
                <div className="flex justify-end space-x-3">
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
                    className="flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {mode === 'create' ? 'Crear Template' : 'Guardar Cambios'}
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Test de Mapping */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Test de Mapping</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payload de Prueba (JSON)
              </label>
              <textarea
                value={testPayload}
                onChange={(e) => setTestPayload(e.target.value)}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder={`{
  "Company": {"cif":"B12345678", "name":"Test Company"},
  "Site": {"code":"OBRA001", "name":"Test Site"},
  "Worker": [{"dni":"12345678A", "name":"Juan"}],
  "Machine": [],
  "Docs": []
}`}
              />
            </div>

            <button
              onClick={testMapping}
              disabled={!testPayload}
              className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 flex items-center justify-center"
            >
              <Zap className="h-4 w-4 mr-2" />
              Probar Mapping
            </button>

            {testResult && (
              <div className="space-y-3">
                <div className={`p-3 rounded-lg ${
                  testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center">
                    {testResult.success ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                    )}
                    <span className={`font-medium ${
                      testResult.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {testResult.success ? 'Mapping exitoso' : 'Error en mapping'}
                    </span>
                  </div>
                </div>

                {testResult.transformed && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Resultado Transformado
                    </label>
                    <pre className="bg-gray-50 p-3 rounded-lg text-sm overflow-auto max-h-64">
                      {JSON.stringify(testResult.transformed, null, 2)}
                    </pre>
                  </div>
                )}

                {testResult.error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-800 text-sm">{testResult.error}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MappingTemplateManager({ tenantId = DEV_TENANT_ID }: MappingTemplateManagerProps) {
  const [templates, setTemplates] = useState<MappingTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedTemplate, setSelectedTemplate] = useState<MappingTemplate | null>(null);

  const mappingService = new MappingTemplateService(tenantId);

  useEffect(() => {
    loadTemplates();
  }, [tenantId]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const templatesData = await mappingService.getAllTemplates();
      setTemplates(templatesData);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = () => {
    setSelectedTemplate(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleEditTemplate = (template: MappingTemplate) => {
    setSelectedTemplate(template);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleViewTemplate = (template: MappingTemplate) => {
    setSelectedTemplate(template);
    setModalMode('view');
    setShowModal(true);
  };

  const handleSaveTemplate = async (templateData: Partial<MappingTemplate>) => {
    try {
      if (modalMode === 'create') {
        const newTemplate = await mappingService.createTemplate(
          templateData.plataforma!,
          templateData.schema_destino!,
          templateData.rules!
        );
        setTemplates(prev => [...prev, newTemplate]);
      } else if (modalMode === 'edit' && selectedTemplate) {
        // En producción, actualizar en base de datos
        const updatedTemplate = {
          ...selectedTemplate,
          ...templateData,
          updated_at: new Date().toISOString()
        };
        setTemplates(prev => prev.map(t => 
          t.id === selectedTemplate.id ? updatedTemplate : t
        ));
      }
    } catch (error) {
      console.error('Error saving template:', error);
      throw error;
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este template?')) {
      setTemplates(prev => prev.filter(t => t.id !== templateId));
    }
  };

  const handleDuplicateTemplate = async (template: MappingTemplate) => {
    const duplicated = {
      ...template,
      id: `${template.plataforma}-copy-${Date.now()}`,
      version: template.version + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setTemplates(prev => [...prev, duplicated]);
  };

  const getPlatformColor = (plataforma: string) => {
    switch (plataforma) {
      case 'nalanda': return 'bg-blue-600';
      case 'ctaima': return 'bg-green-600';
      case 'ecoordina': return 'bg-purple-600';
      case 'otro': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.plataforma.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = platformFilter === 'all' || template.plataforma === platformFilter;
    return matchesSearch && matchesPlatform;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando templates de mapping...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Templates de Mapping</h1>
            <p className="text-blue-100 mb-4">
              Gestión de esquemas de transformación para plataformas externas
            </p>
            <div className="space-y-1 text-sm text-blue-100">
              <p>• Motor de transformaciones con reglas configurables</p>
              <p>• Soporte para arrays, fechas, mapeos y transformaciones personalizadas</p>
              <p>• Validación automática de payloads transformados</p>
              <p>• Test en tiempo real de mappings</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={loadTemplates}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </button>
            <button
              onClick={handleCreateTemplate}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Template
            </button>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Templates</p>
              <p className="text-2xl font-bold text-blue-600">{templates.length}</p>
            </div>
            <Code className="w-6 h-6 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Nalanda</p>
              <p className="text-2xl font-bold text-blue-600">
                {templates.filter(t => t.plataforma === 'nalanda').length}
              </p>
            </div>
            <Globe className="w-6 h-6 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">CTAIMA</p>
              <p className="text-2xl font-bold text-green-600">
                {templates.filter(t => t.plataforma === 'ctaima').length}
              </p>
            </div>
            <Database className="w-6 h-6 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ecoordina</p>
              <p className="text-2xl font-bold text-purple-600">
                {templates.filter(t => t.plataforma === 'ecoordina').length}
              </p>
            </div>
            <Settings className="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todas las plataformas</option>
              <option value="nalanda">Nalanda</option>
              <option value="ctaima">CTAIMA</option>
              <option value="ecoordina">Ecoordina</option>
              <option value="otro">Otro</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Templates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <div key={template.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className={`w-10 h-10 ${getPlatformColor(template.plataforma)} rounded-lg flex items-center justify-center mr-3`}>
                    <Globe className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 capitalize">
                      {template.plataforma}
                    </h3>
                    <p className="text-sm text-gray-600">v{template.version}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleViewTemplate(template)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleEditTemplate(template)}
                    className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDuplicateTemplate(template)}
                    className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Reglas de mapping:</span>
                  <span className="font-medium text-gray-900">{template.rules.length}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Última actualización:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(template.updated_at).toLocaleDateString('es-ES')}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    ID: {template.id}
                  </span>
                  <button
                    onClick={() => handleViewTemplate(template)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                  >
                    Ver detalles
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <Code className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || platformFilter !== 'all' 
              ? 'No se encontraron templates' 
              : 'No hay templates de mapping'
            }
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || platformFilter !== 'all'
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'Los templates predefinidos se cargan automáticamente'
            }
          </p>
          {!searchTerm && platformFilter === 'all' && (
            <button
              onClick={handleCreateTemplate}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Crear Primer Template
            </button>
          )}
        </div>
      )}

      {/* Información de Transformaciones */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Transformaciones Disponibles
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TransformEngine.getAvailableTransforms().map((transform) => (
            <div key={transform.name} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Zap className="h-4 w-4 text-blue-600 mr-2" />
                <h4 className="font-medium text-gray-900">{transform.name}</h4>
              </div>
              <p className="text-sm text-gray-600">{transform.description}</p>
              <div className="mt-2">
                <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                  "transform": "{transform.name}"
                </code>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      <TemplateModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveTemplate}
        template={selectedTemplate}
        mode={modalMode}
      />
    </div>
  );
}