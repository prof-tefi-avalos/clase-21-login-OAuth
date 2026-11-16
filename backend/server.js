// ─────────────────────────────────────────────────────────────────────────────
// server.js · El punto de entrada: arranca la API.
// Su trabajo es solo "abrir el local": cargar las variables, conectar a la base
// y empezar a escuchar. La configuración de Express está en app.js.
// ─────────────────────────────────────────────────────────────────────────────

// 1. PRIMERA línea: carga el .env en process.env.
//    Con import, los archivos importados se ejecutan antes que el resto del código:
//    si esta línea fuera más abajo, app.js podría leer las variables como undefined.
import 'dotenv/config'
import app from './app.js'
import { conectarDB } from './config/db.js'

// 2. Revisamos que estén las variables obligatorias.
//    Si falta alguna (por ejemplo, te olvidaste de cargarla en Render), la API
//    corta acá con un mensaje claro en los Logs, en vez de fallar más tarde.
const requeridas = ['MONGO_URI', 'JWT_SECRET']
const faltan = requeridas.filter((nombre) => !process.env[nombre])
if (faltan.length > 0) {
  console.error('Faltan variables de entorno:', faltan.join(', '))
  process.exit(1) // 1 = terminó con error
}

// 3. El puerto: Render define PORT solo. El ?? 4000 es para tu compu ("si no viene, usá 4000").
const PORT = process.env.PORT ?? 4000

// 4. Primero esperamos la conexión a la base y recién después escuchamos pedidos.
await conectarDB()
app.listen(PORT, () => {
  console.log(`🚀 API en el puerto ${PORT}`)
})
