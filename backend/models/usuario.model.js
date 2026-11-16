// ─────────────────────────────────────────────────────────────────────────────
// models/usuario.model.js · El modelo de los usuarios.
// 🔑 LOGIN CON GOOGLE · Paso 7 de la guía de lectura (README).
// ─────────────────────────────────────────────────────────────────────────────
import { Schema, model } from 'mongoose'

// Los usuarios que entran con Google no tienen contraseña: los identifica googleId.
const usuarioSchema = new Schema({
  nombre: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  // googleId = el "sub" del token de Google: el id de la persona en Google.
  // No cambia nunca (el email sí puede cambiar). unique: una cuenta de Google, un usuario.
  googleId: { type: String, required: true, unique: true },
  // Si al crear el usuario no pasamos rol, queda 'cliente'.
  // Nadie se hace admin por entrar con Google: a admin lo cambia otro admin.
  rol: { type: String, enum: ['cliente', 'admin'], default: 'cliente' },
}, { timestamps: true })
// Fijate que NO hay campo password: no guardamos ninguna contraseña.
// (Si tu app también tiene login con contraseña, password existe pero no puede ser
// required, porque los usuarios de Google no la tienen.)

export default model('Usuario', usuarioSchema)
