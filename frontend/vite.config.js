// Configuración de Vite: el plugin de React y el puerto fijo 5173.
// strictPort: si el 5173 está ocupado, Vite avisa en vez de usar otro puerto
// (otro puerto no estaría en FRONTEND_URL ni en los orígenes autorizados de Google).
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, strictPort: true },
})
