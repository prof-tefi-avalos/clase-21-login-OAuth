// ─────────────────────────────────────────────────────────────────────────────
// routes/auth.routes.js · Las rutas de autenticación.
// 🔑 LOGIN CON GOOGLE · Paso 5 de la guía de lectura (README).
// Las rutas solo unen método + URL con un controlador: no tienen lógica.
// ─────────────────────────────────────────────────────────────────────────────
import { Router } from 'express'
import { loginConGoogle } from '../controllers/auth.controller.js'

const router = Router()

// POST /api/auth/google (el /api/auth se define en app.js).
// Es PÚBLICA, sin verificarToken: la persona todavía no tiene token, viene a buscarlo.
router.post('/google', loginConGoogle)

export default router
