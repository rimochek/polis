// Mount the workspace under StrictMode to expose unsafe development lifecycle behavior.
import React from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/golos-text';
import LoadingScreen from './LoadingScreen';

const isPublic = ['/', '/demo', '/demo/', '/demo.html'].includes(location.pathname);
// Separate loaders keep each route's CSS dependencies attached to its own import.
const DemoPage = React.lazy(() => import('./DemoWorkspaceEntry'));
const PublicPage = React.lazy(() => import('../landing/src/PublicPage'));
const WorkspacePage = React.lazy(() => import('./WorkspaceEntry'));
const Page =
  location.pathname === '/platform-demo.html' ? DemoPage : isPublic ? PublicPage : WorkspacePage;
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <React.Suspense fallback={<LoadingScreen />}>
      <Page />
    </React.Suspense>
  </React.StrictMode>,
);
