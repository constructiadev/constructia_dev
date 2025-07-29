<Routes>
  {/* Rutas públicas */}
  <Route path="/landing" element={<LandingPage />} />
  <Route path="/" element={
    user ? (
      userRole === 'admin' ? <Navigate to="/admin" replace /> : <Navigate to="/client/dashboard" replace />
    ) : (
      <LandingPage />
    )
  } />
  
  <Route path="/admin/login" element={<LoginForm isAdmin />} />
  <Route path="/client/login" element={<LoginForm />} />