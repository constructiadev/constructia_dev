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
# Gemini AI Configuration
VITE_GEMINI_API_KEY=AIzaSyDPJA1RU1KbHzOLG0tGAasXcS9H7iq625s