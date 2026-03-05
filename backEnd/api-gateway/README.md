# 🚀 API Gateway - Elber AI Microservices Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Firebase](https://img.shields.io/badge/Firebase-039BE5?style=for-the-badge&logo=Firebase&logoColor=white)](https://firebase.google.com/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Security](https://img.shields.io/badge/Security-Helmet-green?style=for-the-badge&logo=security&logoColor=white)](https://helmetjs.github.io/)

> **High-Performance API Gateway** engineered for enterprise-grade microservices orchestration with advanced security, intelligent routing, and seamless scalability.

## 📋 Table of Contents

- [🎯 Key Features](#-key-features)
- [🛠 Tech Stack](#-tech-stack)
- [⚡ Quick Start](#-quick-start)
- [📖 API Documentation](#-api-documentation)
- [🏗 Architecture](#-architecture)
- [🔐 Security](#-security)
- [🐳 Docker Deployment](#-docker-deployment)
- [💻 Development Setup](#-development-setup)

---

## 🎯 Key Features

✨ **Enterprise-Grade Gateway Pattern** - Single entry point for distributed microservices architecture  
🔒 **Firebase JWT Authentication** - Stateless authentication with token validation middleware  
⚡ **Intelligent Request Proxying** - Advanced HTTP proxy with custom header propagation  
🛡️ **Multi-Layer Security** - Helmet, rate limiting (100 req/15min), and inter-service secrets  
📊 **Health Monitoring** - Built-in health checks and request logging for observability  
🎯 **Type-Safe Implementation** - Full TypeScript coverage with custom interfaces and error handling  

## 🛠 Tech Stack

### **Core Technologies**
![Node.js](https://img.shields.io/badge/Node.js-20.x-brightgreen) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue) ![Express.js](https://img.shields.io/badge/Express.js-5.1-yellow)

### **Security & Authentication**
![Firebase Admin](https://img.shields.io/badge/Firebase_Admin-13.5-orange) ![Helmet](https://img.shields.io/badge/Helmet-8.1-red) ![Rate Limiting](https://img.shields.io/badge/Rate_Limiting-Enabled-green)

### **Infrastructure & DevOps**
![Docker](https://img.shields.io/badge/Docker-Multi--Stage-blue) ![HTTP Proxy](https://img.shields.io/badge/HTTP_Proxy-Advanced-purple)

---

## ⚡ Quick Start

### Prerequisites
- Node.js 20+ 
- Docker & Docker Compose
- Firebase Admin credentials

### 🚀 Run in 3 commands:

```bash
# 1. Install dependencies
npm install

# 2. Set environment variables
cp .env.template .env  # Configure your Firebase & service URLs

# 3. Start the gateway
npm run dev
```

**Gateway running at:** `http://localhost:4040`  
**Health check:** `http://localhost:4040/health`

---

## 📖 API Documentation

### **Base URL:** `http://localhost:4040`

#### 🔍 **System Endpoints**

```http
GET /
GET /health
```

**Response Example:**
```json
{
  "message": "ELBER API Gateway is running!",
  "endPoint": "/apiGateway"
}
```

#### 🔐 **Authentication Routes** (Public)

```http
POST /auth/login
POST /auth/register
POST /auth/refresh
```

#### 🤖 **AI Services** (Protected)

```http
POST /ai/chat
GET  /ai/models
POST /ai/completion
```

**Headers Required:**
```http
Authorization: Bearer <firebase_jwt_token>
Content-Type: application/json
```

#### 📱 **Notification Services** (Public)

```http
POST /notification/send
GET  /notification/templates
```

### **Request Flow Example:**

```typescript
// 1. Client Request
const response = await fetch('http://gateway:4040/ai/chat', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ message: "Hello AI" })
});

// 2. Gateway validates Firebase token
// 3. Adds security headers: x-api-gateway-secret, x-user-uid
// 4. Proxies to AI microservice
// 5. Returns response to client
```

---

## 🏗 Architecture

### **Microservices Gateway Pattern**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│                 │    │                  │    │                 │
│  Mobile App     │◄──►│   API Gateway    │◄──►│  Auth Service   │
│  Web Client     │    │   (Port 4040)    │    │  (Port 3001)    │
│  Third Party    │    │                  │    │                 │
│                 │    └──────────┬───────┘    └─────────────────┘
└─────────────────┘               │
                                  │            ┌─────────────────┐
                                  │            │                 │
                                  └────────────┤   AI Services   │
                                  │            │  (Port 3002)    │
                                  │            │                 │
                                  │            └─────────────────┘
                                  │
                                  │            ┌─────────────────┐
                                  │            │                 │
                                  └────────────┤ Notification    │
                                               │  Service        │
                                               │                 │
                                               └─────────────────┘
```

### **Key Architectural Decisions:**

🎯 **Single Entry Point** - Eliminates CORS issues and centralizes security  
🔄 **Request/Response Transformation** - Custom headers for service-to-service auth  
⚡ **Async Processing** - Non-blocking proxy with 20s timeout for AI operations  
🏗️ **Modular Routes** - Separated concerns with dedicated route handlers  
📝 **Configuration Management** - Environment-driven config with dotenv  

---

## 🔐 Security

### **🛡️ Multi-Layer Security Implementation**

#### **1. HTTP Security Headers (Helmet.js)**
```typescript
// Automatically applied:
// - X-Content-Type-Options: nosniff
// - X-Frame-Options: DENY  
// - X-XSS-Protection: 1; mode=block
// - Strict-Transport-Security (HSTS)
```

#### **2. Rate Limiting**
```typescript
// Configuration
windowMs: 15 * 60 * 1000,  // 15 minutes
max: 100,                   // 100 requests per IP
```

#### **3. Firebase JWT Validation**
```typescript
// Middleware validates:
// ✓ Token signature
// ✓ Token expiration  
// ✓ Token issuer
// ✓ User claims propagation
```

#### **4. Inter-Service Authentication**
```typescript
// Custom headers added to proxied requests:
'x-api-gateway-secret': process.env.GATEWAY_SECRET,
'x-user-uid': user.uid
```

#### **5. Input Sanitization**
- JSON body parsing with size limits
- URL encoding protection
- Express built-in security features

---

## 🐳 Docker Deployment

### **🔥 Multi-Stage Dockerfile - Production Optimized**

```dockerfile
# Build Stage - Full development environment
FROM node:20-alpine AS builder
WORKDIR /usr/src/elber
COPY ./api-gateway/package*.json ./api-gateway/
COPY ./api-gateway/tsconfig.json ./api-gateway/
COPY ./api-gateway ./api-gateway
RUN cd ./api-gateway && npm install && npm run build

# Production Stage - Minimal runtime
FROM node:20-alpine
WORKDIR /usr/src/elber
COPY ./api-gateway/package*.json ./api-gateway/
RUN cd ./api-gateway && npm install --production
COPY --from=builder /usr/src/elber/api-gateway/dist ./api-gateway/dist
```

### **🚀 Docker Compose Integration**

```yaml
# Part of the Elber AI microservices stack
version: '3.8'
services:
  api-gateway:
    build: 
      context: .
      dockerfile: ./api-gateway/Dockerfile
    ports:
      - "4040:4040"
    environment:
      - GATEWAY_PORT=4040
      - AUTH_SERVICE=http://auth-service:3001
      - AI_SERVICE=http://ai-service:3002
      - NOTIFICATION_SERVICE=http://notification-service:3003
    depends_on:
      - auth-service
      - ai-service
      - notification-service
```

### **📦 Deployment Commands**

```bash
# Local Development
docker-compose up -d

# Production Deployment  
docker build -t elber-api-gateway .
docker run -p 4040:4040 --env-file .env elber-api-gateway

# Health Check
curl http://localhost:4040/health
```

---

## 💻 Development Setup

### **🛠️ Local Development Environment**

```bash
# 1. Clone and navigate
git clone <repository>
cd backEnd/api-gateway

# 2. Install dependencies
npm install

# 3. Environment setup
cp .env.example .env

# Configure these variables:
GATEWAY_PORT=4040
AUTH_SERVICE=http://localhost:3001  
AI_SERVICE=http://localhost:3002
NOTIFICATION_SERVICE=http://localhost:3003
GOOGLE_APPLICATION_CREDENTIALS=../../creds/googleCred.json
FIREBASE_DB=https://your-project.firebaseio.com
GATEWAY_SECRET=your-super-secret-key
```

### **🔧 Available Scripts**

```bash
npm run dev      # Development with hot reload (nodemon)
npm run build    # TypeScript compilation  
npm start        # Production mode
npm run test     # Run test suite
```

### **📁 Project Structure**

```
api-gateway/
├── src/
│   ├── app.ts                 # Express app configuration
│   ├── bin/www.ts            # Server entry point
│   ├── config/               # Environment configuration
│   ├── interfaces/           # TypeScript interfaces
│   ├── loaders/             # Service initializers (Firebase)
│   ├── middlewares/         # Custom middleware (auth, proxy)
│   └── routes/              # Route handlers (modular)
├── Dockerfile               # Multi-stage container build
├── package.json            # Dependencies and scripts
└── tsconfig.json           # TypeScript configuration
```

## 🔗 Related Services

- [Auth Services](../auth-services/) - JWT authentication and user management
- [AI Services](../ai-services/) - LLM integration and AI processing  
- [Notification Services](../notification-services/) - Push notifications and messaging

---

**Built with ♥️ by [Martin Nava](https://github.com/mnava1418) | Enterprise-Ready Microservices Architecture**
