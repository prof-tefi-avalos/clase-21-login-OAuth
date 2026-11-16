// ─────────────────────────────────────────────────────────────────────────────
// controllers/peliculas.controller.js · Los CONTROLADORES de películas (la C de MVC):
// reciben el pedido, usan el modelo y responden.
// Con Express 5, si una función async tira un error (throw), Express lo manda
// solo al errorHandler: no hace falta try/catch en cada controlador.
// ─────────────────────────────────────────────────────────────────────────────
import Pelicula from '../models/pelicula.model.js'
import { crearError } from '../middleware/errorHandler.js'

// GET /api/peliculas → 200 con la lista
export async function listarPeliculas(req, res) {
  const peliculas = await Pelicula.find()
  res.json({ data: peliculas, error: null })
}

// GET /api/peliculas/:id → 200, o 404 si no existe
export async function obtenerPelicula(req, res) {
  const pelicula = await Pelicula.findById(req.params.id)
  // findById NO tira error si no encuentra: devuelve null. Por eso este if.
  // (Si el id ni siquiera tiene formato de id, como "titanic", Mongoose tira CastError → 400.)
  if (!pelicula) throw crearError('No existe esa película', 404)
  res.json({ data: pelicula, error: null })
}

// POST /api/peliculas → 201 con la película creada
export async function crearPelicula(req, res) {
  // Tomamos solo los campos que esperamos (no todo req.body).
  const { titulo, anio, duracion } = req.body
  const pelicula = await Pelicula.create({ titulo, anio, duracion }) // create valida siempre
  res.status(201).json({ data: pelicula, error: null })
}

// PATCH /api/peliculas/:id → 200 con la película editada, o 404
export async function editarPelicula(req, res) {
  const { titulo, anio, duracion } = req.body
  const pelicula = await Pelicula.findByIdAndUpdate(
    req.params.id,
    { titulo, anio, duracion }, // los campos que vienen undefined no se tocan
    // returnDocument: 'after' → devuelve la película ya editada.
    // runValidators: true → al EDITAR, Mongoose solo valida si se lo pedís.
    { returnDocument: 'after', runValidators: true },
  )
  if (!pelicula) throw crearError('No existe esa película', 404)
  res.json({ data: pelicula, error: null })
}

// DELETE /api/peliculas/:id → 204 (sin contenido), o 404
export async function borrarPelicula(req, res) {
  const pelicula = await Pelicula.findByIdAndDelete(req.params.id)
  if (!pelicula) throw crearError('No existe esa película', 404)
  res.status(204).end()
}
