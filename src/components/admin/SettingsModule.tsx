# Supabase Configuration
VITE_SUPABASE_URL=https://phbjqlytkeifcobaxunt.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoYmpxbHl0a2VpZmNvYmF4dW50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MzkxODQsImV4cCI6MjA2OTMxNTE4NH0.tLaitxNX-EsvpKDH_KGeI-zkQ9n9LGbpA_wuHqpvtnE
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoYmpxbHl0a2VpZmNvYmF4dW50Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzczOTE4NCwiZXhwIjoyMDY5MzE1MTg0fQ.xXaaTS_bfB2Koy6tTsi-kgD7SFejsUJFguW7Y4qQ3cg

  // CRUD Functions for Data Subject Requests
  const handleCreateRequest = async () => {
    try {
      const requestData = {
        ...newRequest,
        tenant_id: DEV_TENANT_ID,
        status: 'pending' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabaseServiceClient
        .from('data_subject_requests')
        .insert(requestData)
        .select()
        .single();

      if (error) {
        console.error('Error creating request:', error);
        alert('Error al crear solicitud: ' + error.message);
        return;
      }

      setDataRequests(prev => [data, ...prev]);
      setShowRequestModal(false);
      setNewRequest({
        request_type: 'access',
        requester_email: '',
        requester_name: '',
        request_details: { details: '' },
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
      alert('✅ Solicitud creada correctamente');
    } catch (error) {
      console.error('Error creating request:', error);
      alert('Error al crear solicitud');
    }
  };

  const handleUpdateRequestStatus = async (requestId: string, newStatus: DataSubjectRequest['status']) => {
    try {
      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      if (newStatus === 'completed') {
        updateData.completed_at = new Date().toISOString();
        updateData.response_data = { action: 'Solicitud procesada correctamente' };
      }

      const { error } = await supabaseServiceClient
        .from('data_subject_requests')
        .update(updateData)
        .eq('id', requestId);

      if (error) {
        console.error('Error updating request:', error);
        alert('Error al actualizar solicitud: ' + error.message);
        return;
      }

      setDataRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { ...req, ...updateData }
          : req
      ));
      alert('✅ Estado actualizado correctamente');
    } catch (error) {
      console.error('Error updating request:', error);
      alert('Error al actualizar solicitud');
    }
  };

  // CRUD Functions for Privacy Impact Assessments
  const handleCreateAssessment = async () => {
    try {
      const assessmentData = {
        ...newAssessment,
        tenant_id: DEV_TENANT_ID,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabaseServiceClient
        .from('privacy_impact_assessments')
        .insert(assessmentData)
        .select()
        .single();

      if (error) {
        console.error('Error creating assessment:', error);
        alert('Error al crear evaluación: ' + error.message);
        return;
      }

      setAssessments(prev => [data, ...prev]);
      setShowAssessmentModal(false);
      setNewAssessment({
        assessment_name: '',
        processing_purpose: '',
        data_categories: [],
        risk_level: 'medium',
        mitigation_measures: [],
        status: 'draft'
      });
      alert('✅ Evaluación creada correctamente');
    } catch (error) {
      console.error('Error creating assessment:', error);
      alert('Error al crear evaluación');
    }
  };

  const handleUpdateAssessmentStatus = async (assessmentId: string, newStatus: PrivacyImpactAssessment['status']) => {
    try {
      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      if (newStatus === 'approved') {
        updateData.approved_at = new Date().toISOString();
        updateData.approved_by = 'admin@constructia.com';
        updateData.next_review = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
      }

      const { error } = await supabaseServiceClient
        .from('privacy_impact_assessments')
        .update(updateData)
        .eq('id', assessmentId);

      if (error) {
        console.error('Error updating assessment:', error);
        alert('Error al actualizar evaluación: ' + error.message);
        return;
      }

      setAssessments(prev => prev.map(assessment => 
        assessment.id === assessmentId 
          ? { ...assessment, ...updateData }
          : assessment
      ));
      alert('✅ Evaluación actualizada correctamente');
    } catch (error) {
      console.error('Error updating assessment:', error);
      alert('Error al actualizar evaluación');
    }
  };

  // CRUD Functions for Data Breaches
  const handleCreateBreach = async () => {
    try {
      const breachData = {
        ...newBreach,
        tenant_id: DEV_TENANT_ID,
        reported_by: 'admin@constructia.com',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabaseServiceClient
        .from('data_breaches')
        .insert(breachData)
        .select()
        .single();

      if (error) {
        console.error('Error creating breach:', error);
        alert('Error al crear brecha: ' + error.message);
        return;
      }

      setBreaches(prev => [data, ...prev]);
      setShowBreachModal(false);
      setNewBreach({
        incident_title: '',
        description: '',
        severity: 'medium',
        affected_records: 0,
        data_categories: [],
        discovery_date: new Date().toISOString().split('T')[0],
        authority_notified: false,
        subjects_notified: false,
        status: 'investigating',
        mitigation_actions: []
      });
      alert('✅ Brecha registrada correctamente');
    } catch (error) {
      console.error('Error creating breach:', error);
      alert('Error al crear brecha');
    }
  };

  const handleUpdateBreachStatus = async (breachId: string, newStatus: DataBreach['status']) => {
    try {
      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      if (newStatus === 'resolved') {
        updateData.lessons_learned = 'Incidente resuelto y medidas implementadas';
      }

      const { error } = await supabaseServiceClient
        .from('data_breaches')
        .update(updateData)
        .eq('id', breachId);

      if (error) {
        console.error('Error updating breach:', error);
        alert('Error al actualizar brecha: ' + error.message);
        return;
      }

      setBreaches(prev => prev.map(breach => 
        breach.id === breachId 
          ? { ...breach, ...updateData }
          : breach
      ));
      alert('✅ Brecha actualizada correctamente');
    } catch (error) {
      console.error('Error updating breach:', error);
      alert('Error al actualizar brecha');
    }
  };

import React, { useState, useEffect } from 'react';
import { AlertTriangle, Settings, Shield, Database, Key, Bell, Users, FileText, Activity } from 'lucide-react';
import { supabaseServiceClient } from '../../lib/supabase-real';

const DEV_TENANT_ID = '00000000-0000-0000-0000-000000000001';

export default function SettingsModule() {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    siteName: 'ConstructIA',
    adminEmail: 'admin@constructia.com',
    maxFileSize: '50',
    allowedFileTypes: 'pdf,doc,docx,jpg,png',
    autoBackup: true,
    emailNotifications: true,
    maintenanceMode: false
  });

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('✅ Configuración guardada correctamente');
    } catch (error) {
      alert('❌ Error al guardar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          Configuración General
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Sitio
            </label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => setSettings({...settings, siteName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email del Administrador
            </label>
            <input
              type="email"
              value={settings.adminEmail}
              onChange={(e) => setSettings({...settings, adminEmail: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tamaño Máximo de Archivo (MB)
            </label>
            <input
              type="number"
              value={settings.maxFileSize}
              onChange={(e) => setSettings({...settings, maxFileSize: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipos de Archivo Permitidos
            </label>
            <input
              type="text"
              value={settings.allowedFileTypes}
              onChange={(e) => setSettings({...settings, allowedFileTypes: e.target.value})}
              placeholder="pdf,doc,docx,jpg,png"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="mt-6 space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="autoBackup"
              checked={settings.autoBackup}
              onChange={(e) => setSettings({...settings, autoBackup: e.target.checked})}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="autoBackup" className="ml-2 block text-sm text-gray-900">
              Backup Automático Diario
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="emailNotifications"
              checked={settings.emailNotifications}
              onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-900">
              Notificaciones por Email
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="maintenanceMode"
              checked={settings.maintenanceMode}
              onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-900">
              Modo Mantenimiento
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2" />
          Configuración de Seguridad
        </h3>
        
        <div className="space-y-6">
          <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Importante:</strong> Los cambios de seguridad requieren reiniciar el sistema.
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiempo de Sesión (minutos)
              </label>
              <input
                type="number"
                defaultValue="60"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Intentos de Login Máximos
              </label>
              <input
                type="number"
                defaultValue="5"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="twoFactor"
                defaultChecked
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="twoFactor" className="ml-2 block text-sm text-gray-900">
                Autenticación de Dos Factores (2FA)
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="auditLog"
                defaultChecked
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="auditLog" className="ml-2 block text-sm text-gray-900">
                Registro de Auditoría Detallado
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="ipWhitelist"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="ipWhitelist" className="ml-2 block text-sm text-gray-900">
                Lista Blanca de IPs para Admin
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDatabaseSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Database className="w-5 h-5 mr-2" />
          Configuración de Base de Datos
        </h3>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">1,247</div>
              <div className="text-sm text-blue-800">Total Documentos</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">89</div>
              <div className="text-sm text-green-800">Clientes Activos</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">2.3 GB</div>
              <div className="text-sm text-purple-800">Espacio Usado</div>
            </div>
          </div>
          
          <div className="space-y-4">
            <button className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Ejecutar Backup Manual
            </button>
            
            <button className="w-full md:w-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors ml-0 md:ml-3">
              Optimizar Base de Datos
            </button>
            
            <button className="w-full md:w-auto px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors ml-0 md:ml-3">
              Limpiar Logs Antiguos
            </button>
          </div>
          
          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-2">Configuración de Backup</h4>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="backup-daily"
                  name="backup-frequency"
                  defaultChecked
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label htmlFor="backup-daily" className="ml-2 block text-sm text-gray-900">
                  Diario (Recomendado)
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="backup-weekly"
                  name="backup-frequency"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label htmlFor="backup-weekly" className="ml-2 block text-sm text-gray-900">
                  Semanal
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'security', name: 'Seguridad', icon: Shield },
    { id: 'database', name: 'Base de Datos', icon: Database },
    { id: 'integrations', name: 'Integraciones', icon: Key },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Configuración del Sistema</h1>
        <p className="text-gray-600">Gestiona la configuración global de la plataforma</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'general' && renderGeneralSettings()}
      {activeTab === 'security' && renderSecuritySettings()}
      {activeTab === 'database' && renderDatabaseSettings()}
      {activeTab === 'integrations' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Key className="w-5 h-5 mr-2" />
            Integraciones
          </h3>
          <p className="text-gray-600">Configuración de integraciones disponible próximamente.</p>
        </div>
      )}

      {/* Save Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSaveSettings}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Guardando...' : 'Guardar Configuración'}
        </button>
      </div>
    </div>
  );
}