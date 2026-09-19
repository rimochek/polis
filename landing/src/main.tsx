import React from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/golos-text';
import LoadingScreen from '../../src/LoadingScreen';
const PublicPage = React.lazy(() =>
  location.pathname === '/platform-demo.html'
    ? import('../../src/DemoWorkspaceEntry')
    : import('./PublicPage'),
);
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <React.Suspense fallback={<LoadingScreen />}>
      <PublicPage />
    </React.Suspense>
  </React.StrictMode>,
);
