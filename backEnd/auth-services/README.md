# Auth Services

Elber's authentication service. It handles the entire access flow: from the moment a user requests to join the system to when they have their account created and verified.

## What does it do?

### Controlled access flow (manual approval)
Elber does not allow open registration. Every new user must go through a manual approval process:

1. **The user requests access** by submitting their email (`POST /access/request`). The system saves the request in Firebase and sends two emails: one to the user confirming the request was received, and one to the administrator with two links (approve / reject).

2. **The administrator reviews** by clicking one of the links in the email. Each link contains a signed JWT that encodes the decision. The `/access/review` endpoint decodes that token and updates the status in Firebase.

3. **If approved**, the system generates a 6-digit numeric code and emails it to the user.

4. **The user validates the code** (`POST /access/validateCode`). If the code is correct, they can proceed to registration.

5. **The user registers** (`POST /user/signUp`). The service verifies that access is approved, that no account with that email already exists, and creates the account in Firebase Authentication.

### Password recovery
The user can request a recovery link (`POST /user/resetPassword`). The service generates a Firebase password reset link and sends it by email through the notification service.

## Port

Runs on port `4041`.

## Endpoints

| Method | Route | Description | Auth required |
|---|---|---|---|
| POST | `/access/request` | Request access to the system | No |
| POST | `/access/validateCode` | Validate the 6-digit code | No |
| GET | `/access/review` | Approve or reject a request (admin) | Signed JWT in query param |
| POST | `/user/signUp` | Create a user account | No |
| POST | `/user/resetPassword` | Send a password recovery link | No |
| GET | `/health` | Health check | No |

> All endpoints validate that the request comes from the API Gateway via the `x-api-gateway-secret` header.

## Environment variables

```
AUTH_PORT=4041
GOOGLE_APPLICATION_CREDENTIALS=  # Path to the Firebase Admin SDK JSON file
FIREBASE_DB=          # Firebase Realtime Database URL
JWT_TOKEN=            # Secret for signing approval tokens
HOST=                 # Service host
GATEWAY_SECRET=       # Shared secret with the API Gateway
API_GATEWAY=          # API Gateway URL
INTERNAL_TOKEN=       # Token for calling notification-services
NOTIFICATION_SERVICE= # Notification service URL
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
├── controllers/
│   ├── auth.controller.ts   # Access request, code validation, admin review
│   └── user.controller.ts   # Registration and password recovery
├── services/
│   ├── auth.service.ts         # Access flow logic and code generation
│   ├── user.service.ts         # Account creation in Firebase Auth
│   └── notification.service.ts # Calls to the notification service
├── middlewares/     # Gateway secret validation
└── routes/          # Route definitions
```
