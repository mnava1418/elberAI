# 🔐 Auth Services

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Firebase](https://img.shields.io/badge/Firebase-039BE5?style=for-the-badge&logo=Firebase&logoColor=white)](https://firebase.google.com/)
[![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)](https://jwt.io/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

> **High-Performance Microservice** | Authentication system with advanced access control, real-time Firebase integration, and automated email workflows.

## 🚀 Overview

A production-ready authentication microservice designed for scalable applications, featuring a sophisticated **manual approval system**, **JWT token management**, and **real-time Firebase integration**. Built with security-first principles and modern DevOps practices.

**🎯 Key Business Value:**
- **Zero unauthorized access** with manual approval workflow
- **Instant notifications** through integrated email system

---

## ✨ Core Features

- 🛡️ **Advanced Security Stack** - Helmet, CORS, Rate Limiting, JWT validation
- 🔄 **Manual Approval Workflow** - Admin-controlled access with email notifications
- ⚡ **Real-time Firebase Integration** - Live status updates and data persistence
- 📧 **Automated Email System** - Seamless notification service integration
- 🐳 **Multi-stage Docker Build** - Optimized container deployment
- 🏗️ **Clean Architecture** - Separation of concerns with service/controller pattern

---

## 🛠️ Tech Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| **Runtime** | Node.js 20 + TypeScript | Type-safe backend development |
| **Framework** | Express.js | RESTful API framework |
| **Database** | Firebase Realtime DB | Real-time data synchronization |
| **Authentication** | JWT + bcryptjs | Secure token management |
| **Security** | Helmet + Rate Limiting | Production security measures |
| **DevOps** | Docker + Multi-stage Build | Container orchestration |
| **Architecture** | Microservices + Proxy Pattern | Scalable system design |

---

## 🚀 Quick Start

### Prerequisites
```bash
# Required environment
Node.js 20+
Docker & Docker Compose
Firebase Project Setup
```

### 🔧 Local Development
```bash
# 1. Clone and navigate
cd backEnd/auth-services

# 2. Install dependencies
npm install

# 3. Environment setup
cp .env.template .env
# Configure: JWT_TOKEN, FIREBASE_DB, GOOGLE_APPLICATION_CREDENTIALS

# 4. Start development server
npm run dev
# 🟢 Server running on http://localhost:3001
```

### 🐳 Docker Deployment
```bash
# Build optimized image
docker build -t elber-auth-service .

# Run container
docker run -p 3001:3001 \
  --env-file .env \
  elber-auth-service

# Or use docker-compose
docker-compose up auth-services
```

---

## 📚 API Documentation

<details>
<summary><strong>🔑 Access Management Endpoints</strong></summary>

### Request Access
```http
POST /access/request
Content-Type: application/json

{
  "email": "user@example.com"
}

# Response
{
  "status": "pending",
  "message": "¡Listo! Recibimos tu solicitud..."
}
```

### Validate Access Code
```http
POST /access/validateCode
Content-Type: application/json

{
  "email": "user@example.com",
  "accessCode": 123456
}

# Response
{
  "isValid": true,
  "message": ""
}
```

### Admin Access Review
```http
GET /access/review?token={jwt_token}
Authorization: Bearer {admin_token}

# Auto-approves/rejects based on JWT payload
```

</details>

<details>
<summary><strong>👤 User Management Endpoints</strong></summary>

### User Registration
```http
POST /user/signUp
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "displayName": "John Doe"
}
```

### Password Reset
```http
POST /user/resetPassword
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### Health Check
```http
GET /health

# Response
{
  "endPoint": "/auth"
}
```

</details>

---

### 🔄 Access Control Flow

1. **Request Submission** → User submits email for access
2. **Real-time Storage** → Request stored in Firebase with timestamp
3. **Admin Notification** → Automated email with approve/reject links
4. **Token-based Review** → JWT-secured approval/rejection endpoints
5. **Code Generation** → 6-digit access code for approved users
6. **User Notification** → Email with access instructions
7. **Code Validation** → Secure code verification system
8. **User Registration** → Complete onboarding process

---

## 🛡️ Security Implementation

<details>
<summary><strong>Security Measures Detail</strong></summary>

### 🔒 Multi-layer Security Stack
```typescript
// Helmet - Security headers
app.use(helmet());

// Rate Limiting - DoS protection
app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // requests per IP
}));

// JWT Validation - Token security
const validateToken = (req, res, next) => {
    const decoded = jwt.verify(token, process.env.JWT_TOKEN);
    // Additional validation logic
}

// Proxy Validation - Internal service auth
app.use(proxy_validate);
```

### 🔐 Access Control Features
- **Manual Approval System** - Human-verified access requests
- **Email-based Verification** - Multi-step validation process
- **Time-limited Codes** - Secure access code expiration
- **Request Status Tracking** - Prevent duplicate submissions
- **Firebase Security Rules** - Database-level access control

### 🛠️ Security Best Practices
- Environment variable configuration
- bcryptjs for password hashing
- Structured error handling
- Input validation and sanitization
- CORS configuration for cross-origin protection

</details>

---

## 🐳 Docker & Deployment

<details>
<summary><strong>Production Deployment Configuration</strong></summary>

### Multi-stage Dockerfile Optimization
```dockerfile
# Build Stage - Development dependencies
FROM node:20-alpine AS builder
WORKDIR /usr/src/elber
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Runtime Stage - Production only
FROM node:20-alpine
WORKDIR /usr/src/elber
COPY package*.json ./
RUN npm install --production
COPY --from=builder /usr/src/elber/dist ./dist
```

### Environment Configuration
```bash
# Required Environment Variables
JWT_TOKEN=                    # JWT signing secret
FIREBASE_DB=                  # Firebase database URL
GOOGLE_APPLICATION_CREDENTIALS= # Firebase service account
API_GATEWAY=                  # Gateway service URL
NOTIFICATION_SERVICE=         # Email service endpoint
GATEWAY_SECRET=              # Internal service authentication
```

### Production Checklist
- [ ] Environment secrets configured
- [ ] Firebase project setup
- [ ] SSL certificates installed
- [ ] Rate limiting configured
- [ ] Monitoring and logging enabled
- [ ] Health check endpoints active

</details>

---

## 💻 Development Setup

<details>
<summary><strong>Local Development Environment</strong></summary>

### Project Structure
```
auth-services/
├── src/
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic
│   ├── routes/          # API endpoints
│   ├── middlewares/     # Security & validation
│   ├── models/          # Type definitions
│   ├── config/          # Environment setup
│   └── utils/           # Helper functions
├── creds/              # Firebase credentials
├── Dockerfile          # Container configuration
└── package.json        # Dependencies
```

### Development Commands
```bash
# Development with hot reload
npm run dev

# Production build
npm run build

# Start production server
npm start

# TypeScript compilation check
npx tsc --noEmit
```

### Code Quality Standards
- **TypeScript Strict Mode** - Enhanced type safety
- **ESLint Configuration** - Code style enforcement  
- **Error Handling** - Structured try-catch patterns
- **Logging Standards** - Consistent request logging
- **Interface Documentation** - Comprehensive type definitions

</details>

---
