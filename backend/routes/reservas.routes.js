// ─────────────────────────────────────────────────────────────────────────────
// routes/reservas.routes.js · Rutas de reservas.
// No hace falta verificarToken acá: ya se aplica a todo /api/reservas en app.js.
// ─────────────────────────────────────────────────────────────────────────────
import { Router } from 'express'
import { crearReserva, misReservas } from '../controllers/reservas.controller.js'

const router = Router()

router.get('/mias', misReservas) // GET  /api/reservas/mias
router.post('/', crearReserva)   // POST /api/reservas

export default router
