// ─────────────────────────────────────────────────────────────────────────────
// tokens.js · Imprime dos tokens de prueba (admin y cliente) firmados con el
// JWT_SECRET del .env, para probar las rutas protegidas con Postman o curl
// sin pasar por Google. Uso: npm run tokens
// En una app real, los tokens los entrega el login (ver auth.controller.js).
// ─────────────────────────────────────────────────────────────────────────────
import 'dotenv/config'
import jwt from 'jsonwebtoken'

const firmar = (payload) => jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '4h' })

console.log('ADMIN   ', firmar({ id: '665f1c2b9d3e4a0011111111', rol: 'admin' }))
console.log('CLIENTE ', firmar({ id: '665f1c2b9d3e4a0022222222', rol: 'cliente' }))
