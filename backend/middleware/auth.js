// ─────────────────────────────────────────────────────────────────────────────
// middleware/auth.js · Autenticación y autorización.
// 🔑 LOGIN CON GOOGLE · Paso 9 de la guía de lectura (README).
// Fijate que este archivo NO tiene nada de Google: verifica NUESTRO token.
// Por eso agregar "Iniciar sesión con Google" no obliga a cambiarlo.
// ─────────────────────────────────────────────────────────────────────────────
import jwt from 'jsonwebtoken'
import { crearError } from './errorHandler.js'

// AUTENTICACIÓN · "¿Quién sos?"
// Lee el encabezado Authorization: Bearer <token>. Si falta o es inválido → 401.
// Si está bien, deja los datos del token en req.usuario ({ id, rol }).
export function verificarToken(req, res, next) {
  const [tipo, token] = (req.headers.authorization ?? '').split(' ')
  if (tipo !== 'Bearer' || !token) throw crearError('Falta el token', 401)
  try {
    // jwt.verify revisa la firma con NUESTRO secreto y el vencimiento.
    // Un token editado a mano (por ejemplo, con el rol cambiado a admin) no pasa: 401.
    req.usuario = jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    throw crearError('Token inválido o vencido', 401)
  }
  next() // sigue al próximo middleware o al controlador
}

// AUTORIZACIÓN · "¿Podés hacer esto?"
// soloRol('admin') devuelve un middleware que deja pasar solo esos roles → si no, 403.
// Usa req.usuario, así que tiene que ir DESPUÉS de verificarToken.
export const soloRol = (...roles) => (req, res, next) => {
  if (!roles.includes(req.usuario.rol)) throw crearError('No tenés permiso', 403)
  next()
}
