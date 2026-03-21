# API Gateway

The API Gateway is the only entry point to the backend. Every request coming from the mobile app passes through here before reaching any other service.

## What does it do?

### Single entry point
The gateway receives all HTTP requests from clients and forwards them to the corresponding microservice:

| Route | Destination service |
|---|---|
| `/auth/*` | Auth Services (port 4041) |
| `/ai/*` | AI Services (port 4042) |
| `/notification/*` | Notification Services (port 4043) |

### Firebase token validation
Before forwarding any request to the AI services, the gateway validates the Firebase JWT token sent by the app. If the token is invalid or expired, the request is rejected here and never reaches the destination service.

Authentication routes (`/auth`) are public — they do not require a token, because they are the ones that allow the user to register or sign in.

### Inter-service authentication
When the gateway forwards a request to another service, it adds two headers:
- `x-api-gateway-secret` — a shared secret so that internal services know the request comes from the gateway and not from an external source.
- `x-user-uid` — the user ID extracted from the validated Firebase token.

This allows internal services to trust that the user has already been authenticated and to know who they are without needing to validate the token themselves.

### Additional protections
- **Rate limiting**: maximum 100 requests per IP every 15 minutes.
- **Helmet**: HTTP security headers (protection against XSS, clickjacking, etc.).
- **CORS**: configured to accept requests from the client.

## Port

Runs on port `4040`.

## Environment variables

```
GATEWAY_PORT=4040
HOST=
AUTH_SERVICE=           # Internal URL of auth-services
AI_SERVICE=             # Internal URL of ai-services
NOTIFICATION_SERVICE=   # Internal URL of notification-services
GOOGLE_APPLICATION_CREDENTIALS=  # Path to the Firebase Admin SDK JSON file
FIREBASE_DB=            # Firebase Realtime Database URL
GATEWAY_SECRET=         # Shared secret with all other services
```

## Commands

```bash
npm install
cp .env.template .env
npm run dev     # Development with hot reload
npm run build   # Compile TypeScript
npm start       # Production
```

## Code structure

```
src/
├── app.ts              # Express configuration
├── bin/www.ts          # Server entry point
├── config/             # Environment variable loading
├── loaders/            # Firebase Admin initialization
├── middlewares/        # Firebase token validation and proxy headers
└── routes/             # Route definitions and proxy per service
```
