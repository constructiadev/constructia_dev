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

  // CRUD Functions for Consent Records
  const handleCreateConsent = async () => {
    try {
      const consentData = {
      }
      <footer className="bg-gray-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Cumplimiento GDPR Integral
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              ConstructIA está diseñada desde el primer día para cumplir estrictamente con el GDPR y la LOPDGDD. 
              Tu privacidad y la de tus clientes es nuestra máxima prioridad.
            </p>
          </div>

          {/* GDPR Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-xl shadow-lg p-8 border border-blue-100">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Encriptación Extremo a Extremo</h3>
              <p className="text-gray-600 mb-4">
                Todos los documentos se encriptan con AES-256 antes del almacenamiento. 
                Tus datos están protegidos incluso si alguien accede físicamente a nuestros servidores.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Encriptación SSL/TLS 256-bit en tránsito</li>
                <li>• Encriptación AES-256 en reposo</li>
                <li>• Claves de encriptación rotadas automáticamente</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 border border-green-100">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Derechos del Interesado</h3>
              <p className="text-gray-600 mb-4">
                Facilitamos el ejercicio de todos los derechos GDPR con herramientas automatizadas 
                para acceso, rectificación, supresión y portabilidad de datos.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Portal de autogestión de derechos</li>
                <li>• Respuesta automática en 72 horas</li>
                <li>• Exportación de datos en formato estándar</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 border border-purple-100">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Registro de Actividades</h3>
              <p className="text-gray-600 mb-4">
                Mantenemos un registro detallado de todas las actividades de tratamiento 
                según el artículo 30 del GDPR.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Auditoría completa de accesos</li>
                <li>• Trazabilidad de modificaciones</li>
                <li>• Reportes automáticos de cumplimiento</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 border border-orange-100">
              <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Gestión de Brechas</h3>
              <p className="text-gray-600 mb-4">
                Sistema automatizado para detectar, reportar y gestionar brechas de seguridad 
                cumpliendo con los plazos de notificación del GDPR.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Detección automática de anomalías</li>
                <li>• Notificación a autoridades en 72h</li>
                <li>• Comunicación a interesados si procede</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 border border-red-100">
              <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Evaluaciones de Impacto</h3>
              <p className="text-gray-600 mb-4">
                Realizamos evaluaciones de impacto en protección de datos (EIPD) 
                para todos los tratamientos de alto riesgo.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Análisis automático de riesgos</li>
                <li>• Medidas de mitigación integradas</li>
                <li>• Revisiones periódicas programadas</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 border border-teal-100">
              <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Transferencias Internacionales</h3>
              <p className="text-gray-600 mb-4">
                Garantizamos la protección de datos en transferencias internacionales 
                mediante cláusulas contractuales tipo y certificaciones de adecuación.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Cláusulas contractuales tipo (CCT)</li>
                <li>• Evaluación de países terceros</li>
                <li><a href="#gdpr" className="hover:text-white transition-colors">GDPR</a></li>
              </ul>
            </div>
          </div>

          {/* GDPR Compliance Process */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
              Nuestro Proceso de Cumplimiento GDPR
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Análisis de Riesgos</h4>
                <p className="text-sm text-gray-600">
                  Evaluamos automáticamente el riesgo de cada documento y tratamiento
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-600">2</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Medidas de Protección</h4>
                <p className="text-sm text-gray-600">
                  Aplicamos automáticamente las medidas técnicas y organizativas apropiadas
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-purple-600">3</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Monitoreo Continuo</h4>
                <p className="text-sm text-gray-600">
                  Supervisamos constantemente el cumplimiento y detectamos anomalías
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-orange-600">4</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Reportes Automáticos</h4>
                <p className="text-sm text-gray-600">
                  Generamos reportes de cumplimiento y auditorías de forma automática
                </p>
              </div>
            </div>
          </div>

          {/* Certifications */}
          <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <div className="text-center">
          <div className="border-t border-gray-600 mt-12 pt-8">
              <p className="text-blue-100 mb-8 max-w-3xl mx-auto">
                ConstructIA cuenta con las certificaciones más exigentes del sector para garantizar 
                la máxima protección de datos y cumplimiento normativo.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-white/10 rounded-lg p-4 text-center">
                  <Shield className="w-8 h-8 mx-auto mb-2" />
                  <div className="font-semibold">ISO 27001</div>
                  <div className="text-sm text-blue-200">Seguridad de la Información</div>
                </div>
                
                <div className="bg-white/10 rounded-lg p-4 text-center">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                  <div className="font-semibold">GDPR</div>
                  <div className="text-sm text-blue-200">Cumplimiento Certificado</div>
                </div>
                
                <div className="bg-white/10 rounded-lg p-4 text-center">
                  <Globe className="w-8 h-8 mx-auto mb-2" />
                  <div className="font-semibold">LOPDGDD</div>
                  <div className="text-sm text-blue-200">Ley Española</div>
                </div>
                
                <div className="bg-white/10 rounded-lg p-4 text-center">
                  <Award className="w-8 h-8 mx-auto mb-2" />
                  <div className="font-semibold">SOC 2</div>
                  <div className="text-sm text-blue-200">Controles de Seguridad</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

# Gemini AI Configuration
VITE_GEMINI_API_KEY=AIzaSyDPJA1RU1KbHzOLG0tGAasXcS9H7iq625s
    }
  }