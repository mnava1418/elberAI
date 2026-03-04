# 🤖 Elber AI Services - Advanced AI Microservice Architecture

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue)](https://www.typescriptlang.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-Agents-orange)](https://openai.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.8.1-black)](https://socket.io/)
[![Firebase](https://img.shields.io/badge/Firebase-Admin-yellow)](https://firebase.google.com/)
[![Docker](https://img.shields.io/badge/Docker-Multi--Stage-blue)](https://www.docker.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-336791)](https://www.postgresql.org/)

> **AI microservice** powering real-time conversational AI with advanced memory management, multi-agent architecture, and production-ready security features.

## 📋 Table of Contents

- [🎯 Overview](#-overview)
- [✨ Key Features](#-key-features)  
- [🛠️ Tech Stack](#️-tech-stack)
- [⚡ Quick Start](#-quick-start)
- [📊 API Documentation](#-api-documentation)
- [🏗️ Architecture](#️-architecture)
- [🔒 Security](#-security)
- [🐳 Docker Deployment](#-docker-deployment)
- [💻 Development](#-development)
- [🤝 Contributing](#-contributing)

## 🎯 Overview

Elber AI Services is a **sophisticated microservice** that demonstrates advanced software engineering principles in AI applications. Built with enterprise-grade patterns, it showcases expertise in:

- **Multi-Agent AI Systems** with custom tool integration
- **Real-time communication** optimized for production scale  
- **Advanced memory management** (STM/MTM/LTM architecture)
- **Microservice security** with multi-layer authentication
- **Performance optimization** for concurrent AI operations

**Perfect for:** Senior developers seeking to demonstrate AI/ML engineering expertise, real-time system design, and scalable microservice architecture.

## ✨ Key Features

🧠 **Multi-Agent AI Architecture** - OpenAI Agents with custom tools for web search and user data management  
⚡ **Real-time Streaming** - WebSocket-based chat with optimized connection handling (60s timeout, 25s ping)  
🧮 **Advanced Memory System** - Short/Mid/Long-term memory for contextual conversations  
🔐 **Enterprise Security** - Firebase Auth + API Gateway validation + Rate limiting (100 req/15min)  
🔍 **Intelligent Search** - Context-aware web search with Serper API integration  
⚖️ **Production Ready** - Global error handlers, graceful shutdowns, and Docker optimization

## 🛠️ Tech Stack

### **Core Technologies**
- **Runtime:** Node.js 20.x (Alpine)
- **Language:** TypeScript 5.9+ (Strict mode)
- **Framework:** Express.js 5.x with Helmet security

### **AI & ML**
- **OpenAI Agents:** 0.3.7 (Multi-agent architecture)
- **OpenAI API:** 6.8.1 (GPT-4o-mini)
- **Zod:** 4.3.5 (Runtime validation)

### **Real-time & Communication**
- **Socket.io:** 4.8.1 (WebSocket optimization)
- **Firebase Admin:** 13.5.0 (Authentication)

### **Data & Storage**
- **PostgreSQL:** 8.17.2 (Primary database)
- **Firebase Realtime DB** (Chat persistence)

### **DevOps & Infrastructure**  
- **Docker:** Multi-stage builds
- **Rate Limiting:** Express-rate-limit
- **Security:** Helmet + Custom middleware

## ⚡ Quick Start

```bash
# Clone and install
git clone <repo-url>
cd ai-services
npm install

# Environment setup
cp .env.template .env
# Configure your OpenAI, Firebase, and Serper API keys

# Development mode
npm run dev

# Production build
npm run build && npm start
```

**🚀 Ready in < 3 minutes!** The service runs on `http://localhost:4042`

## 📊 API Documentation

### **Core Endpoints**

#### Health Check
```http
GET /ai/health
```
```json
{
  "endPoint": "/ai",
  "status": "healthy"
}
```

#### Chat Management
```http
GET /ai/chat
Headers: x-user-uid: <firebase-uid>
```
```json
{
  "chats": {
    "chatId": {
      "title": "Conversation Title",
      "messages": [...],
      "createdAt": 1709500800000
    }
  }
}
```

#### Delete Chat
```http
DELETE /ai/chat
Headers: x-user-uid: <firebase-uid>
Content-Type: application/json

{
  "chatId": "12345"
}
```

### **WebSocket Events**

#### Connection
```javascript
const socket = io('ws://localhost:4042', {
  auth: { token: 'firebase-jwt-token' }
});
```

#### Real-time Chat
```javascript
// Send message
socket.emit('elber:message', {
  text: "Hello AI!",
  chatId: 12345,
  title: "New Chat"
});

// Receive streaming response
socket.on('elber:stream', (chunk) => {
  console.log(chunk); // Partial response
});

socket.on('elber:response', (response) => {
  console.log(response); // Complete response with memory
});
```

## 🏗️ Architecture

### **Multi-Agent System**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Chat Agent    │    │  Memory Agent   │    │  Title Agent    │
│                 │    │                 │    │                 │  
│ • Main AI logic │    │ • STM/MTM/LTM   │    │ • Auto titles   │
│ • Tool calling  │────│ • Context mgmt  │────│ • Conversation  │
│ • Web search    │    │ • User profiling│    │   analysis      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Memory Architecture**
- **Short-term:** Current conversation context
- **Mid-term:** Session-based user preferences  
- **Long-term:** Persistent user personality and history

### **Security Layers**
```
Client Request → Rate Limiter → Helmet → API Gateway → Firebase Auth → Controller
```

### **Data Flow**
1. **WebSocket Connection** with Firebase JWT validation
2. **Message Processing** through multi-agent pipeline
3. **Memory Integration** with context enrichment  
4. **Real-time Streaming** with error handling
5. **Persistence** in Firebase + PostgreSQL

## 🔒 Security

### **Authentication**
- **Firebase JWT** validation for all WebSocket connections
- **API Gateway Secret** for inter-service communication
- **Request Origin** validation with CORS policies

### **Rate Limiting**
```typescript
// 100 requests per 15 minutes per IP
rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
})
```

### **Security Headers**
- Helmet.js integration for XSS, CSRF protection
- Content Security Policy enforcement
- HTTP Strict Transport Security

### **Error Handling** 
- Global exception handlers for AI stream cancellations
- Graceful degradation for service failures
- Sanitized error responses (no sensitive data leaks)

## 🐳 Docker Deployment

### **Multi-stage Dockerfile**
```dockerfile
# Build optimization with Alpine Linux
FROM node:20-alpine AS builder
# ... build process

FROM node:20-alpine 
# ... production runtime (30% smaller image)
```

### **Docker Compose** 
```bash
# From project root
cd backEnd
docker-compose up ai-services
```

### **Environment Variables**
```env
# Core
NODE_ENV=production  
PORT=4042

# AI Services
OPENAI_API_KEY=sk-...
SERPER_API_KEY=...

# Firebase
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY=...

# Gateway
API_GATEWAY_SECRET=...

# Database
DATABASE_URL=postgresql://...
```

## 💻 Development

### **Prerequisites**
- Node.js 20+
- TypeScript 5.9+
- Firebase project with Auth enabled
- OpenAI API access
- Serper API key (for web search)

### **Development Workflow**
```bash
# Install dependencies  
npm install

# Type checking
npm run build

# Watch mode with hot reload
npm run dev

# Production testing
npm run build && npm start
```

### **Code Structure**
```
src/
├── agents/          # Multi-agent AI system
├── controllers/     # HTTP request handlers  
├── services/        # Business logic layer
├── models/          # TypeScript interfaces
├── middlewares/     # Authentication & validation
├── tools/           # AI agent tools
├── loaders/         # Service initialization  
└── config/          # Environment configuration
```

### **Performance Optimizations**
- **Connection pooling** for database operations
- **WebSocket optimizations** (60s ping timeout, 25s intervals)
- **Memory management** for long-running conversations
- **Graceful error recovery** for AI stream interruptions

---
**🎯 Built for Scale:** This microservice demonstrates production-ready patterns for AI applications, real-time systems, and enterprise security. Perfect showcase for senior AI/ML engineering roles.

**👨‍💻 Author:** Martin Nava - *Demonstrating advanced TypeScript, AI agents, and microservice architecture*

### **Key Technical Highlights:**

✅ **Advanced AI Engineering** - Multi-agent architecture with OpenAI Agents  
✅ **Real-time Systems** - WebSocket optimization for production scale  
✅ **Security Expertise** - Multi-layer authentication and rate limiting  
✅ **Database Design** - PostgreSQL + Firebase hybrid architecture  
✅ **DevOps Skills** - Docker multi-stage builds and container optimization  
✅ **Performance** - Memory management and graceful error handling  
✅ **Code Quality** - TypeScript strict mode with comprehensive validation
