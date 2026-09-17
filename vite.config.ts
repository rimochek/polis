import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({plugins:[react()],server:{port:5173,strictPort:true,watch:{ignored:['**/.env','**/.env.*','**/artifacts/**','**/data/**','**/.playwright-cli/**','**/.impeccable/**']},fs:{deny:['.env','.env.*','**/data/**','**/artifacts/**','**/.impeccable/**']},proxy:{'/api':'http://127.0.0.1:5174'}},build:{chunkSizeWarningLimit:900}});
