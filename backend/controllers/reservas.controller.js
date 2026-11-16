// ─────────────────────────────────────────────────────────────────────────────
// controllers/reservas.controller.js · Reservas de la persona que inició sesión.
// 🔑 LOGIN CON GOOGLE · Paso 9 de la guía de lectura (README).
// Estas rutas pasan antes por verificarToken (ver app.js), así que acá
// req.usuario ya existe: son los datos de NUESTRO token ({ id, rol }).
// ─────────────────────────────────────────────────────────────────────────────
import Reserva from '../models/reserva.model.js'

// POST /api/reservas → 201
export async function crearReserva(req, res) {
  const { pelicula, entradas } = req.body
  const reserva = await Reserva.create({
    pelicula,
    entradas,
    cliente: req.usuario.id, // el dueño sale del TOKEN, nunca del body: si no, cualquiera reserva a nombre de otro
  })
  res.status(201).json({ data: reserva, error: null })
}

// GET /api/reservas/mias → 200 con las reservas de quien hizo el pedido
export async function misReservas(req, res) {
  const reservas = await Reserva.find({ cliente: req.usuario.id })
  res.json({ data: reservas, error: null })
}
