// Mount the workspace under StrictMode to expose unsafe development lifecycle behavior.
import React from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/golos-text';
import LoadingScreen from './LoadingScreen';

const isPublic = ['/', '/demo', '/demo/', '/demo.html'].includes(location.pathname);
const Page = React.lazy(() =>
  location.pathname === '/platform-demo.html'
    ? import('./DemoWorkspaceEntry')
    : isPublic
      ? import('../landing/src/PublicPage')
      : import('./WorkspaceEntry'),
);
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <React.Suspense fallback={<LoadingScreen />}>
      <Page />
    </React.Suspense>
  </React.StrictMode>,
);
