import React from 'react';
import Router from './components/Router';
import CookieConsent from './components/common/CookieConsent';

function App() {
  console.log('🔍 [App] Component rendering - Development Mode');
  
  return (
    <>
      <Router />
      <CookieConsent />
    </>
  );
}

export default App;