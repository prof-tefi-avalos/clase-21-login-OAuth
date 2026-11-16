// ─────────────────────────────────────────────────────────────────────────────
// main.jsx · El punto de entrada del front: monta <App /> en el <div id="root">.
// 🔑 LOGIN CON GOOGLE · Paso 2 de la guía de lectura (README).
// ─────────────────────────────────────────────────────────────────────────────
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App.jsx'
import './estilos.css'

// El Client ID sale del .env. Como empieza con VITE_, queda en el JavaScript público,
// y está bien: el Client ID NO es un secreto, solo identifica a nuestra app ante Google.
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* El Provider carga el script de Google y le pasa nuestro Client ID a los botones. */}
    {/* Envuelve TODA la app una sola vez: así cualquier componente puede usar <GoogleLogin />. */}
    <GoogleOAuthProvider clientId={clientId ?? ''}>
      {/* googleConfigurado: si falta el Client ID, App muestra un aviso en vez del botón. */}
      <App googleConfigurado={Boolean(clientId)} />
    </GoogleOAuthProvider>
  </StrictMode>,
)
