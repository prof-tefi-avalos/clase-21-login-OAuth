// ─────────────────────────────────────────────────────────────────────────────
// semilla.js · Carga tres películas de ejemplo en la base. Uso: npm run semilla
// Ojo: primero BORRA todas las películas que haya.
// ─────────────────────────────────────────────────────────────────────────────
import 'dotenv/config'
import mongoose from 'mongoose'
import Pelicula from './models/pelicula.model.js'

await mongoose.connect(process.env.MONGO_URI)
await Pelicula.deleteMany()
await Pelicula.create([
  { titulo: 'Nueve reinas', anio: 2000, duracion: 114 },
  { titulo: 'El secreto de sus ojos', anio: 2009, duracion: 129 },
  { titulo: 'Relatos salvajes', anio: 2014, duracion: 122 },
])
console.log('🌱 3 películas cargadas en', mongoose.connection.name)
await mongoose.disconnect()
