// ─────────────────────────────────────────────────────────────────────────────
// config/db.js · La conexión a MongoDB, en un solo lugar.
// Se llama UNA vez, al arrancar (desde server.js). Mongoose reutiliza esa
// conexión en todos los modelos: no hay que conectar en cada controlador.
// ─────────────────────────────────────────────────────────────────────────────
import mongoose from 'mongoose'

export async function conectarDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('🟢 MongoDB conectado:', mongoose.connection.name)
  } catch (error) {
    // Sin base, la API no sirve: mostramos el motivo y cortamos el proceso.
    // process.exit(1): el 1 significa "terminó con error" (0 sería "todo bien").
    // En Render, este mensaje aparece en los Logs (por ejemplo, si Atlas no deja entrar).
    console.error('🔴 No se pudo conectar:', error.message)
    process.exit(1)
  }
}
