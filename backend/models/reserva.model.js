// ─────────────────────────────────────────────────────────────────────────────
// models/reserva.model.js · El modelo de las reservas.
// Una reserva no copia la película ni el usuario: guarda sus ids.
// ─────────────────────────────────────────────────────────────────────────────
import { Schema, model } from 'mongoose'

const reservaSchema = new Schema({
  pelicula: { type: Schema.Types.ObjectId, ref: 'Pelicula', required: true }, // id de la película
  entradas: { type: Number, required: true, min: 1 },
  cliente: { type: Schema.Types.ObjectId, required: true }, // id de quien reservó: sale del TOKEN, nunca del body
}, { timestamps: true })

export default model('Reserva', reservaSchema)
