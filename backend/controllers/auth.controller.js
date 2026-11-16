// ─────────────────────────────────────────────────────────────────────────────
// controllers/auth.controller.js · Login con Google.
// 🔑 LOGIN CON GOOGLE · Paso 6 de la guía de lectura (README). Es el corazón del login.
//
// Qué recibe: la "credential" que Google le dio al front. Es un id_token: un JWT
// firmado por GOOGLE (no por nosotros) que dice quién es la persona.
// Qué devuelve: NUESTRO token (un JWT firmado con nuestro JWT_SECRET), igual que
// un login con contraseña. Desde ahí, el resto de la API no se entera de Google.
// ─────────────────────────────────────────────────────────────────────────────
import jwt from 'jsonwebtoken'
import { OAuth2Client } from 'google-auth-library' // la librería oficial de Google
import Usuario from '../models/usuario.model.js'
import { crearError } from '../middleware/errorHandler.js'

// El cliente de Google se crea una sola vez (no en cada pedido).
// No necesita Client Secret: solo vamos a VERIFICAR tokens, no a pedirlos.
const google = new OAuth2Client()

// POST /api/auth/google · body: { credential } (el id_token que le dio Google al front)
export async function loginConGoogle(req, res) {
  const { credential } = req.body
  // Dos controles antes de empezar:
  if (!credential) throw crearError('Falta la credencial de Google', 400)          // error del que pide
  if (!process.env.GOOGLE_CLIENT_ID) throw crearError('Falta configurar GOOGLE_CLIENT_ID en el .env', 500) // error nuestro

  // 1. Le preguntamos a Google si la credencial es auténtica, vigente y emitida para NUESTRA app.
  //    verifyIdToken hace tres controles:
  //    · la FIRMA: descarga las claves públicas de Google y comprueba que el token lo firmó Google;
  //    · el VENCIMIENTO: estos tokens duran 1 hora;
  //    · el AUDIENCE: que el token se haya emitido para nuestro Client ID. Sin esto, alguien
  //      podría traer un token que Google emitió para OTRA app y entrar a la nuestra.
  //    ⚠️ No alcanza con jwt.decode: decode solo LEE el token, no revisa la firma.
  //    Y no sirve jwt.verify con nuestro JWT_SECRET: este token no lo firmamos nosotros.
  let datos
  try {
    const ticket = await google.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    })
    // getPayload() devuelve los datos de adentro del token:
    // { sub, email, email_verified, name, picture, aud, iss, exp, ... }
    datos = ticket.getPayload()
  } catch {
    // Si falla cualquiera de los tres controles, verifyIdToken tira un error.
    throw crearError('Credencial de Google inválida', 401)
  }
  // Solo aceptamos cuentas con el email verificado por Google.
  if (!datos.email_verified) throw crearError('El email de Google no está verificado', 401)

  // 2. Si es la primera vez, lo registramos (con el rol por defecto: cliente).
  //    Buscamos por googleId (el "sub"), no por email: el email puede cambiar, el sub no.
  //    O sea: el login con Google también es el registro.
  let usuario = await Usuario.findOne({ googleId: datos.sub })
  if (!usuario) {
    // No pasamos rol → queda el default del modelo: 'cliente'.
    usuario = await Usuario.create({ googleId: datos.sub, email: datos.email, nombre: datos.name })
  }

  // 3. Desde acá, igual que un login con contraseña: devolvemos NUESTRO token.
  //    Lleva NUESTRO id de usuario y el rol, y se firma con NUESTRO secreto.
  //    Es el que el front va a mandar en cada pedido (Authorization: Bearer ...).
  const token = jwt.sign({ id: usuario._id, rol: usuario.rol }, process.env.JWT_SECRET, { expiresIn: '1h' })
  res.json({
    data: { token, usuario: { id: usuario._id, nombre: usuario.nombre, rol: usuario.rol } },
    error: null,
  })
}
