// ─────────────────────────────────────────────────────────────────────────────
// routes/peliculas.routes.js · Rutas de películas: quién puede hacer qué.
// ─────────────────────────────────────────────────────────────────────────────
import { Router } from 'express'
import {
  listarPeliculas,
  obtenerPelicula,
  crearPelicula,
  editarPelicula,
  borrarPelicula,
} from '../controllers/peliculas.controller.js'
import { verificarToken, soloRol } from '../middleware/auth.js'

const router = Router()

// Públicas: ver la cartelera no pide nada.
router.get('/', listarPeliculas)
router.get('/:id', obtenerPelicula)

// router.use agrega verificarToken a TODAS las rutas que están DEBAJO, en este archivo.
// Lo de arriba sigue siendo público.
router.use(verificarToken)

// Solo admin. El pedido pasa en orden: verificarToken → soloRol → controlador.
// (soloRol tiene que ir después de verificarToken: necesita req.usuario.)
router.post('/', soloRol('admin'), crearPelicula)
router.patch('/:id', soloRol('admin'), editarPelicula)
router.delete('/:id', soloRol('admin'), borrarPelicula)

export default router
