# Cine · Login con Google (React + Express + MongoDB)

App de ejemplo de un **cine**: el público mira la cartelera y reserva entradas, y el administrador carga y saca películas. Se inicia sesión con **"Acceder con Google"**.

El repo tiene las dos partes de la app:

```
cine-login-google/
├── backend/    API en Express + MongoDB (se publica en Render)
└── frontend/   React + Vite (se publica en Vercel)
```

| Pedido | Qué hace | Quién |
|---|---|---|
| `GET /api/peliculas` · `/:id` | Ver la cartelera o una película | Cualquiera |
| `POST` · `PATCH` · `DELETE /api/peliculas` | Cargar, editar o sacar películas | Solo **admin** |
| `POST /api/reservas` · `GET /api/reservas/mias` | Reservar y ver mis reservas | Con sesión iniciada |
| `POST /api/auth/google` | Iniciar sesión con Google | Cualquiera |

Todas las respuestas tienen la forma `{ data, error }`. Todo el código está comentado: los archivos que forman parte del login con Google tienen la marca 🔑.

---

## 1. Crear el Client ID de Google (una sola vez, ≈ 10 min)

Los nombres de los menús de Google Cloud Console cambian seguido; si algo no coincide exactamente, buscá la opción equivalente.

> Usá una **cuenta personal de Gmail**. Con una cuenta de la facultad o del trabajo, los proyectos quedan dentro de esa organización, que puede tener límites o bloquear esta configuración (por ejemplo, el proyecto se crea pero no aparece).

1. Entrá a https://console.cloud.google.com con tu cuenta de Google.
2. Arriba, en el selector de proyectos: **Proyecto nuevo** → nombre `cine-demo` → **Crear**. Seleccionalo.
3. Menú ☰ → **APIs y servicios** (yo busqué **APIs y servicios** en el buscador, porque no estaba en la pantalla principal - se encuentra tambien en los accesos directos) → **Pantalla de consentimiento de OAuth** (Google Auth Platform) → **Comenzar**.
   - Nombre de la app: `Cine Demo`. Correo de asistencia: el tuyo.
   - Público: **Externo** (Usuarios externos).
   - Información de contacto: tu correo. Aceptá la política y **Crear**.
4. En **Público** (Audience), mientras la app esté en modo **Prueba**, agregá tu correo en **Usuarios de prueba**. Si no, Google puede rechazar el inicio de sesión.
5. En **Clientes** → **Crear cliente**:
   - Tipo de aplicación: **Aplicación web**. Nombre: `cine-front`.
   - **Orígenes autorizados de JavaScript**: agregá `http://localhost` **y** `http://localhost:5173` (en producción, sumá la URL de Vercel, sin barra final).
   - No hace falta completar los URI de redireccionamiento.
   - **Crear**. Copiá el **ID de cliente** (termina en `.apps.googleusercontent.com`).
6. Pegalo en los dos `.env` (el paso 2 de abajo explica cómo crearlos):
   - `frontend/.env`: `VITE_GOOGLE_CLIENT_ID=...`
   - `backend/.env`: `GOOGLE_CLIENT_ID=...` (el mismo valor)
7. Reiniciá la API y Vite. Los cambios en Google pueden tardar unos minutos en aplicarse: si el botón da error, esperá un poco y recargá.

No se necesita el **secreto del cliente**: este flujo solo usa el Client ID, que es público.

### Qué es cada cosa en la consola

| En la consola | Qué es |
|---|---|
| Proyecto | La "carpeta" donde Google guarda la configuración de tu app. |
| Pantalla de consentimiento | El nombre y el correo que ve la persona en la ventana de Google. |
| Público: Externo | Puede entrar cualquier cuenta de Google (Interno: solo cuentas de una organización). |
| Modo Prueba y usuarios de prueba | Mientras la app está en Prueba, solo pueden entrar los correos que cargues (hasta 100). Para un TP alcanza. |
| Cliente "Aplicación web" | Genera el **Client ID**, que identifica a tu app ante Google. |
| Orígenes autorizados | Las URL donde puede aparecer el botón. Si tu página no está en la lista, Google da `origin_mismatch`. |

---

## 2. Correrlo en tu compu

Necesitás Node 22 o más nuevo y MongoDB andando (local o Atlas).

**API** (en una terminal):

```bash
cd backend
npm install
cp .env.example .env
```

Completá el `.env`: `JWT_SECRET` (el comentario del archivo dice cómo generarlo) y `GOOGLE_CLIENT_ID`. Después:

```bash
npm run semilla
npm run dev
```

Tiene que aparecer `🟢 MongoDB conectado` y `🚀 API en el puerto 4000`.

**Front** (en otra terminal):

```bash
cd frontend
npm install
cp .env.example .env
```

Completá `VITE_GOOGLE_CLIENT_ID` y corré:

```bash
npm run dev
```

Abrí http://localhost:5173. Vite lee el `.env` **al arrancar**: si lo cambiás, cortá con Ctrl+C y volvé a correr `npm run dev`.

---

## 3. Cómo leer el código para entender el login con Google

Leelo **en este orden**: es el orden en que pasan las cosas cuando alguien toca "Acceder con Google". Cada archivo tiene la marca **🔑 LOGIN CON GOOGLE · Paso N** arriba.

### Antes de empezar: la idea

Hay **dos tokens** distintos, y entender cuál es cuál es la mitad del tema:

| | Lo firma | Para qué sirve | Cuánto se usa |
|---|---|---|---|
| **id_token de Google** (la `credential`) | Google | Probarle a nuestra API quién es la persona | **Una sola vez**, en el login |
| **Nuestro JWT** | Nuestra API, con `JWT_SECRET` | Entrar a las rutas protegidas | En **cada pedido** después del login |

El viaje completo:

```
 Persona            Front (React)                  API (Express)                  Google
    │ toca el botón ──▶ │                                │                             │
    │                   │ ──── abre la ventana ─────────────────────────────────────▶ │
    │ elige su cuenta ─────────────────────────────────────────────────────────────▶ │
    │                   │ ◀──────────── credential (id_token firmado por Google) ──── │
    │                   │ ── POST /api/auth/google { credential } ──▶ │                │
    │                   │                                │ ── ¿es auténtica y para  ─▶│
    │                   │                                │    nuestra app?            │
    │                   │                                │ busca o crea el usuario    │
    │                   │ ◀──────── { token: NUESTRO JWT } ──────── │                 │
    │                   │ ── GET /api/reservas/mias  (Authorization: Bearer NUESTRO JWT) ──▶
```

Esta app usa la forma en que **el front pide la credencial y el back la verifica**. Es la recomendada cuando solo queremos que la gente inicie sesión. La otra forma, en la que el backend maneja todo con el Client Secret (por ejemplo, con Passport), hace falta solo si la app tiene que usar APIs de Google en nombre de la persona (su Calendar, su Drive).

### Paso 1 · El Client ID · `frontend/.env.example` y `backend/.env.example`

Fijate que el **mismo** Client ID va en los dos lados. El front lo usa para mostrar el botón; la API, para comprobar que la credencial fue emitida para **esta** app. Es público: por eso puede ir en una variable `VITE_`.

### Paso 2 · El Provider · `frontend/src/main.jsx`

`GoogleOAuthProvider` envuelve toda la app una sola vez. Carga el script de Google y le pasa el Client ID a los botones.

### Paso 3 · El botón · `frontend/src/App.jsx` (buscá `<GoogleLogin`)

`GoogleLogin` dibuja el botón oficial. La ventana de Google, la elección de cuenta y la contraseña de Google las maneja Google: nuestra app nunca ve la contraseña. Mirá a qué función llama `onSuccess`.

### Paso 4 · Mandar la credencial a nuestra API · `frontend/src/App.jsx` (función `entrarConGoogle`)

Recibe `{ credential }` (el id_token), lo manda con `POST /auth/google` y guarda en `localStorage` **lo que respondió nuestra API**: nuestro token. Preguntate: ¿se guarda la credencial de Google en algún lado?

### Paso 5 · La ruta · `backend/app.js` (línea de `/api/auth`) y `backend/routes/auth.routes.js`

El pedido llega a `POST /api/auth/google`. Fijate que es **pública** (sin `verificarToken`): la persona todavía no tiene token, viene a buscarlo.

### Paso 6 · El controlador · `backend/controllers/auth.controller.js` ⭐ el más importante

Leelo con calma. Tiene tres partes, numeradas en los comentarios:

1. **Verificar** con `verifyIdToken`: firma de Google, vencimiento y `audience` (que sea para nuestro Client ID). Si falla → 401. Si sale bien, `getPayload()` da `sub`, `email`, `name`.
2. **Buscar o crear** el usuario por `googleId` (el `sub`). La primera vez, el login también es el registro.
3. **Firmar nuestro JWT** con `jwt.sign`: la misma línea que en un login con contraseña.

### Paso 7 · El modelo · `backend/models/usuario.model.js`

No hay `password`. `googleId` es único. El `rol` tiene default `cliente`: entrar con Google no te hace admin.

### Paso 8 · Los pedidos siguientes · `frontend/src/api.js` (el interceptor)

Antes de cada pedido, agrega `Authorization: Bearer <nuestro token>`. El token de Google ya no viaja más.

### Paso 9 · La API no se enteró de Google · `backend/middleware/auth.js` y `backend/controllers/reservas.controller.js`

`verificarToken` no tiene ni una línea de Google: verifica **nuestro** token con **nuestro** secreto y deja `req.usuario`. La reserva se guarda con `cliente: req.usuario.id`. Conclusión: agregar "Iniciar sesión con Google" a una API que ya usa JWT es sumar **una ruta, un controlador y un campo en el modelo**. El resto no cambia.

### Verlo funcionando

Con la app corriendo, abrí las DevTools (F12) → **Network** y tocá "Acceder con Google":

- En el pedido `google`: **Payload** tiene la `credential` (larguísima: es el id_token). **Response** tiene `data.token` (el nuestro).
- Reservá: en el pedido `reservas`, **Headers** muestra `Authorization: Bearer` + nuestro token.

### ¿Lo entendiste? Probá responder

1. ¿Por qué la API no puede verificar la credencial de Google con `jwt.verify` y su `JWT_SECRET`?
2. ¿Qué pasaría si la API no le pasara `audience` a `verifyIdToken`?
3. ¿Por qué se busca al usuario por `sub` y no por `email`?
4. Después del login, ¿qué token viaja en cada pedido?
5. ¿Qué archivos habría que tocar para guardar también la foto de la persona? (Pista: viene en `picture`.)

<details><summary>Respuestas</summary>

1. Porque no la firmamos nosotros: la firma Google con su clave privada. `verifyIdToken` la verifica con las claves públicas de Google.
2. Aceptaría credenciales que Google emitió para **otras** apps: alguien podría usar una de esas para entrar a la nuestra.
3. Porque el `sub` no cambia nunca; el email de una cuenta sí puede cambiar.
4. Nuestro JWT, en `Authorization: Bearer`. La credencial de Google se usa una sola vez.
5. El modelo (`usuario.model.js`, agregar el campo) y el controlador (`auth.controller.js`, guardar `datos.picture` en el `create`). Si la querés mostrar, también la respuesta del login y `App.jsx`.

</details>

---

## 4. Publicarlo

| Dónde | Root Directory | Variables |
|---|---|---|
| **Render** (backend) | `backend` · Build: `npm install` · Start: `npm start` | `MONGO_URI` (la de Atlas), `JWT_SECRET`, `FRONTEND_URL` (la URL de Vercel, sin barra final), `GOOGLE_CLIENT_ID` |
| **Vercel** (frontend) | `frontend` (Vite se detecta solo) | `VITE_API_URL` (la URL de Render + `/api`), `VITE_GOOGLE_CLIENT_ID` |

Y en Google Cloud Console, agregá la URL de Vercel en los **orígenes autorizados** del cliente. `frontend/vercel.json` hace que recargar una ruta no dé 404 en Vercel: le dice que, para cualquier ruta, devuelva `index.html`.

Si cambiás una variable `VITE_` en Vercel, hacé **Redeploy**: Vite escribe los valores en el código al hacer el build.

---

## Errores típicos

| Qué ves | Qué pasa |
|---|---|
| “Falta VITE_GOOGLE_CLIENT_ID en el .env” | No está en `frontend/.env`, o no reiniciaste Vite. |
| Ventana de Google con `origin_mismatch` o “no autorizado” | Faltan `http://localhost` y `http://localhost:5173` en los orígenes autorizados, o todavía no se aplicaron. |
| Google no te deja entrar con tu cuenta | La app está en modo Prueba y tu correo no está en **Usuarios de prueba**. |
| “Credencial de Google inválida” | El `GOOGLE_CLIENT_ID` de la API no es el mismo que el del front. |
| “Falta configurar GOOGLE_CLIENT_ID en el .env” | Falta en `backend/.env`. |
| “No se pudo conectar con la API” | La API no está prendida, `VITE_API_URL` está mal, o `FRONTEND_URL` de la API no coincide con la URL del front (CORS: mirá la consola). |
| `Faltan variables de entorno: JWT_SECRET` | Falta en `backend/.env` (o en Render → Environment). |

## Probar la API sin Google

`npm run tokens` (en `backend/`) imprime un token de admin y uno de cliente, para probar las rutas protegidas con Postman o curl:

| Pedido | Responde |
|---|---|
| `GET /api/peliculas` | 200 |
| `GET /api/peliculas/titanic` | 400 (no es un id) |
| `POST /api/peliculas` sin token | 401 |
| `POST /api/peliculas` con token de cliente | 403 |
| `POST /api/peliculas` con token de admin y `{"titulo":"Kamchatka","anio":2002,"duracion":105}` | 201 |
