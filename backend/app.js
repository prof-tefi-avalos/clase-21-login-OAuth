// ─────────────────────────────────────────────────────────────────────────────
// app.js · Arma la app de Express: middlewares globales, rutas y manejo de errores.
// El ORDEN importa: Express ejecuta los app.use de arriba hacia abajo.
// 🔑 LOGIN CON GOOGLE · Paso 5 de la guía de lectura (README): la línea de /api/auth.
// ─────────────────────────────────────────────────────────────────────────────
import express from 'express'
import cors from 'cors'
import authRouter from './routes/auth.routes.js'
import peliculasRouter from './routes/peliculas.routes.js'
import reservasRouter from './routes/reservas.routes.js'
import { verificarToken } from './middleware/auth.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()

// Solo el front puede llamar a la API desde el navegador.
// CORS: la API le dice al navegador qué origen acepta. Tiene que coincidir letra
// por letra con la URL del front (una barra de más al final y el navegador bloquea).
app.use(cors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:5173' }))

// Convierte el body JSON de los pedidos en un objeto: req.body.
app.use(express.json())

// Las rutas. Cada archivo de routes/ maneja un recurso.
app.use('/api/auth', authRouter)                           // login con Google (pública)
app.use('/api/peliculas', peliculasRouter)                 // ver es público; cargar/editar/borrar, solo admin
app.use('/api/reservas', verificarToken, reservasRouter)   // todo con token

// Al final de todo: cualquier error que se tire en un controlador termina acá.
app.use(errorHandler)

export default app
