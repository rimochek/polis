// Build the public landing as a separate static application with its own asset root.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
export default defineConfig({
  root: path.resolve('landing'),
  plugins: [react()],
  server: { host: '127.0.0.1', port: 5175, strictPort: true },
  build: { outDir: 'dist', emptyOutDir: true, chunkSizeWarningLimit: 800 },
});
