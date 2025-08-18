# Auth Services

Servicio de autenticación y registro de usuarios para Elber.

## Scripts
- `npm run dev`: Inicia el servidor en modo desarrollo con nodemon y TypeScript.
- `npm run build`: Compila el código TypeScript a JavaScript.
- `npm start`: Ejecuta el servidor compilado.

## Endpoints principales
- `POST /access/request` — Solicitar acceso al app
- `POST /access/validateCode` — Validar código de acceso
- `GET /access/review` — Aceptar o rechazar acceso


## Variables de entorno
- `PORT`: Puerto del servidor
