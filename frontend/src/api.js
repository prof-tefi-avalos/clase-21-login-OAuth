// ─────────────────────────────────────────────────────────────────────────────
// api.js · Todos los pedidos a nuestra API pasan por acá (axios).
// 🔑 LOGIN CON GOOGLE · Paso 8 de la guía de lectura (README): el interceptor.
// ─────────────────────────────────────────────────────────────────────────────
import axios from 'axios'

// La URL de la API sale de una variable de Vite. Vite la "hornea" en el build:
// si la cambiás en Vercel, hay que volver a desplegar.
// Con baseURL, alcanza con escribir api.get('/peliculas') en vez de la URL completa.
export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL })

// Nuestro JWT viaja en cada pedido (el de Google no: ese solo se usa una vez, en el login).
// Un interceptor se ejecuta ANTES de cada pedido: si hay token guardado,
// lo agrega en el encabezado Authorization, que es lo que lee verificarToken en la API.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Convierte cualquier error de axios en un mensaje para mostrar.
// · Si la API respondió (error.response), usamos su mensaje: { error: { message } }.
// · Si no hubo respuesta, la API está apagada, la URL está mal o CORS bloqueó
//   (para axios, un bloqueo de CORS es como si no hubiera respuesta: mirá la consola).
export function mensajeDeError(error) {
  if (error.response) return error.response.data?.error?.message ?? `Error ${error.response.status}`
  return 'No se pudo conectar con la API (¿está prendida? ¿VITE_API_URL? ¿CORS?)'
}
