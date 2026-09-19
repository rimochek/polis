import React from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/golos-text';
import LoadingScreen from '../../src/LoadingScreen';
const DemoPage = React.lazy(() => import('../../src/DemoWorkspaceEntry'));
const LandingPage = React.lazy(() => import('./PublicPage'));
const PublicPage = location.pathname === '/platform-demo.html' ? DemoPage : LandingPage;
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <React.Suspense fallback={<LoadingScreen />}>
      <PublicPage />
    </React.Suspense>
  </React.StrictMode>,
);
