// ─────────────────────────────────────────────────────────────────────────────
// middleware/errorHandler.js · Todos los errores terminan acá (ver el final de app.js)
// y se responden con la misma forma: { data: null, error: { message } }.
// ─────────────────────────────────────────────────────────────────────────────

// Crea un error con status. Uso: throw crearError('No existe esa película', 404)
export function crearError(message, status = 500) {
  const error = new Error(message)
  error.status = status
  return error
}

// Un middleware de errores tiene 4 parámetros: así Express sabe que es para errores.
export function errorHandler(err, req, res, next) {
  // Si no tiene status es un error inesperado: lo mostramos en la consola (en Render, en los Logs).
  if (!err.status) console.error(err)

  // ValidationError: un dato no cumple el schema (por ejemplo, duracion: 0) → 400
  if (err.name === 'ValidationError') {
    const campos = {}
    for (const [campo, detalle] of Object.entries(err.errors)) {
      campos[campo] = detalle.message
    }
    return res.status(400).json({ data: null, error: { message: 'Hay datos inválidos', campos } })
  }

  // CastError: un id sin formato de id (por ejemplo, /api/peliculas/titanic) → 400
  if (err.name === 'CastError') {
    return res.status(400).json({ data: null, error: { message: `"${err.value}" no es un valor válido para ${err.path}` } })
  }

  // 11000: se repitió un campo unique (por ejemplo, el mismo email) → 409
  if (err.code === 11000) {
    const [campo, valor] = Object.entries(err.keyValue)[0]
    return res.status(409).json({ data: null, error: { message: `Ya existe un registro con ${campo} = ${valor}` } })
  }

  // El resto: el status que le pusimos con crearError, o 500.
  res.status(err.status || 500).json({
    data: null,
    error: { message: err.message || 'Error interno del servidor' },
  })
}
