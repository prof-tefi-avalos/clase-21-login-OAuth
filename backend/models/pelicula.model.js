// ─────────────────────────────────────────────────────────────────────────────
// models/pelicula.model.js · El MODELO de las películas (la M de MVC):
// qué datos tiene una película y qué reglas tienen que cumplir.
// ─────────────────────────────────────────────────────────────────────────────
import { Schema, model } from 'mongoose'

const peliculaSchema = new Schema({
  titulo: { type: String, required: true, trim: true }, // trim: saca espacios de los costados
  anio: { type: Number, required: true },
  duracion: { type: Number, required: true, min: 1 },   // en minutos; 0 o negativo → ValidationError (400)
}, { timestamps: true }) // agrega createdAt y updatedAt solos

// 'Pelicula' → Mongoose usa la colección "peliculas".
export default model('Pelicula', peliculaSchema)
