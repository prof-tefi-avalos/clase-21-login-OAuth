// ─────────────────────────────────────────────────────────────────────────────
// App.jsx · Toda la pantalla: cartelera, botón de Google, reservas.
// 🔑 LOGIN CON GOOGLE · Pasos 3 y 4 de la guía de lectura (README):
//    el botón <GoogleLogin /> y la función entrarConGoogle.
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { api, mensajeDeError } from './api.js'

// Si ya había iniciado sesión (antes de recargar la página), recuperamos el usuario guardado.
function leerUsuario() {
  const guardado = localStorage.getItem('usuario')
  return guardado ? JSON.parse(guardado) : null
}

export default function App({ googleConfigurado }) {
  const [peliculas, setPeliculas] = useState([])
  // usuario: null si no inició sesión; si no, { id, nombre, rol } (lo que devolvió nuestra API)
  const [usuario, setUsuario] = useState(leerUsuario)
  const [reservas, setReservas] = useState([])
  const [error, setError] = useState('')

  // Al cargar la página: la cartelera (ruta pública, no necesita token).
  useEffect(() => {
    api.get('/peliculas')
      .then(({ data }) => setPeliculas(data.data))
      .catch((e) => setError(mensajeDeError(e)))
  }, [])

  // Cuando hay usuario: sus reservas (ruta protegida: el interceptor de api.js agrega el token).
  useEffect(() => {
    if (!usuario) return
    api.get('/reservas/mias')
      .then(({ data }) => setReservas(data.data))
      .catch((e) => setError(mensajeDeError(e)))
  }, [usuario])

  // Google nos da una credencial (id_token). La mandamos a NUESTRA API, que la verifica
  // y nos devuelve NUESTRO token. Desde acá, es igual que un login con contraseña.
  //
  // Paso 4 · Google llama a esta función cuando la persona elige su cuenta.
  // Recibe { credential }: el id_token de Google (un JWT firmado por Google).
  async function entrarConGoogle({ credential }) {
    try {
      // Se la mandamos a nuestra API, que la verifica con Google (ver auth.controller.js)...
      const { data } = await api.post('/auth/google', { credential })
      // ...y guardamos lo que respondió NUESTRA API: nuestro token y el usuario.
      // La credencial de Google no se guarda: ya no sirve para nada más.
      localStorage.setItem('token', data.data.token)
      localStorage.setItem('usuario', JSON.stringify(data.data.usuario))
      setUsuario(data.data.usuario)
      setError('')
    } catch (e) {
      setError(mensajeDeError(e))
    }
  }

  // Cerrar sesión = borrar NUESTRO token. (La sesión de Google en el navegador es de la persona: no la tocamos.)
  function salir() {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    setUsuario(null)
    setReservas([])
  }

  // Reservar: el token lo agrega el interceptor; la API saca el cliente del token, no del body.
  async function reservar(pelicula) {
    try {
      const { data } = await api.post('/reservas', { pelicula: pelicula._id, entradas: 2 })
      setReservas((r) => [...r, data.data])
      setError('')
    } catch (e) {
      setError(mensajeDeError(e))
    }
  }

  // Las reservas guardan el id de la película: buscamos el título en la cartelera.
  const titulo = (id) => peliculas.find((p) => p._id === id)?.titulo ?? 'Película'

  return (
    <main>
      <header>
        <h1>🎬 Cine</h1>
        {usuario ? (
          <div className="sesion">
            Hola, <b>{usuario.nombre}</b> ({usuario.rol}) <button onClick={salir}>Salir</button>
          </div>
        ) : googleConfigurado ? (
          // Paso 3 · El botón oficial de Google. Nosotros no armamos la ventana ni pedimos el email:
          // eso lo hace Google. Nos avisa por onSuccess (todo bien) o por onError (algo falló).
          <GoogleLogin onSuccess={entrarConGoogle} onError={() => setError('Google no pudo iniciar sesión')} />
        ) : (
          <p className="aviso">Falta VITE_GOOGLE_CLIENT_ID en el .env</p>
        )}
      </header>

      {error && <p className="error">⚠️ {error}</p>}

      <h2>Cartelera</h2>
      <ul className="cartelera">
        {peliculas.map((p) => (
          <li key={p._id}>
            <b>{p.titulo}</b> <span>{p.anio} · {p.duracion} min</span>
            {usuario && <button onClick={() => reservar(p)}>Reservar 2 entradas</button>}
          </li>
        ))}
      </ul>

      {usuario && (
        <>
          <h2>Mis reservas</h2>
          {reservas.length === 0 ? <p>Todavía no reservaste.</p> : (
            <ul>{reservas.map((r) => <li key={r._id}>{titulo(r.pelicula)} · {r.entradas} entradas</li>)}</ul>
          )}
        </>
      )}
    </main>
  )
}
