# 🤖 Elber - Intelligent Chat Application

[![React Native](https://img.shields.io/badge/React_Native-0.80.2-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.4-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-23.1.2-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.8.1-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io/)

> **An intelligent AI chat application that integrates real-time streaming, secure authentication, and voice capabilities using React Native with clean architecture.**

## 📋 Table of Contents

- [✨ Key Features](#-key-features)
- [🚀 Tech Stack](#-tech-stack)
- [⚡ Quick Start](#-quick-start)
- [🏗️ Architecture](#️-architecture)
- [🔒 Security](#-security)

---

## ✨ Key Features

🎯 **Real-Time AI Streaming** - Progressive AI responses with streaming via WebSocket
🔐 **Robust Authentication** - Firebase Auth with JWT tokens and session management
🎙️ **Voice Capabilities** - Native speech-to-text integration and voice recognition
📱 **Advanced UX** - Smooth animations with Reanimated and native navigation
💬 **Intelligent Chat** - Optimized interface with Gifted Chat and real-time messaging
🎨 **Responsive UI** - Reusable components with Linear Gradient and Vector Icons

---

## 🚀 Tech Stack

### **Frontend Core**
![React Native](https://img.shields.io/badge/React_Native-0.80.2-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0.4-3178C6?style=flat-square&logo=typescript)
![React Navigation](https://img.shields.io/badge/React_Navigation-7.x-9C27B0?style=flat-square)

### **State Management & Architecture**
![Redux Pattern](https://img.shields.io/badge/Redux_Pattern-Actions/Reducers-764ABC?style=flat-square&logo=redux)
![Context API](https://img.shields.io/badge/Context_API-GlobalProvider-61DAFB?style=flat-square)
![Custom Hooks](https://img.shields.io/badge/Custom_Hooks-Animation/Auth/Chat-20232A?style=flat-square)

### **Real-time & Networking**
![Socket.io](https://img.shields.io/badge/Socket.io-4.8.1-010101?style=flat-square&logo=socketdotio)
![Axios](https://img.shields.io/badge/Axios-1.11.0-5A29E4?style=flat-square)
![Firebase](https://img.shields.io/badge/Firebase_Auth-23.1.2-FFCA28?style=flat-square&logo=firebase)

### **UI/UX & Animations**
![Reanimated](https://img.shields.io/badge/Reanimated-4.1.3-FF6B6B?style=flat-square)
![Gifted Chat](https://img.shields.io/badge/Gifted_Chat-2.8.1-4ECDC4?style=flat-square)
![Vector Icons](https://img.shields.io/badge/Vector_Icons-10.3.0-45B7D1?style=flat-square)
![Linear Gradient](https://img.shields.io/badge/Linear_Gradient-2.8.3-FF9F43?style=flat-square)

### **Voice & Permissions**
![Voice Recognition](https://img.shields.io/badge/Voice_Recognition-3.2.4-E74C3C?style=flat-square)
![Permissions](https://img.shields.io/badge/Native_Permissions-5.4.4-2ECC71?style=flat-square)

---

## ⚡ Quick Start

### Prerequisites
```bash
node >= 18.0.0
npm >= 8.0.0
React Native CLI
```

### Installation & Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/elber-ai.git
cd elber-ai/Elber

# Install dependencies
npm install

# iOS Setup
cd ios && pod install && cd ..

# Configure environment variables
cp .env.template .env
# Edit .env with your configurations
```

### Run the application
```bash
# Terminal 1 - Metro Bundler
npm start

# Terminal 2 - iOS (with specific simulator)
npm run start:ios

# Terminal 3 - Android
npm run android
```

---

## 🏗️ Architecture

### **Clean Architecture Implementation**

```
src/
├── 📁 adapters/          # Third-party adapters (permissions, etc.)
├── 📁 models/           # TypeScript types and data models
├── 📁 services/         # Business service layer
├── 📁 store/           # Global state (Redux pattern)
│   ├── actions/        # Action creators
│   ├── reducers/       # Pure reducers
│   └── selectors/      # State selectors
├── 📁 hooks/           # Custom hooks by domain
│   ├── animation/      # Animation hooks
│   ├── auth/          # Authentication logic
│   └── chat/          # Chat logic
└── 📁 view/           # Presentation and UI
    ├── components/    # Reusable components
    └── screens/      # Screens by feature
```

### **Event-Driven Architecture**
```typescript
// Real-time AI event handling
ElberEvent: 'elber:response' | 'elber:stream' | 'elber:error' | 'elber:title'

// Progressive streaming
handleStreamEvent() -> dispatch(processStream()) -> UI update
```

### **Service Layer Pattern**
- `auth.service.ts` - Authentication and token management
- `chat.service.ts` - Chat CRUD with authorization
- `elber.service.ts` - AI-specific logic and streaming
- `network.service.ts` - HTTP client with interceptors
- `validation.service.ts` - Business validations

---

## 🔒 Security

### **Security Implementations**

✅ **Firebase Authentication** with auto-renewable JWT tokens
✅ **Bearer Token Authorization** on all API calls  
✅ **Request Interceptors** for automatic header management
✅ **User Session Management** with auto-logout on token expiration
✅ **Device Permissions** - Granular native permission handling
✅ **Environment Variables** - Sensitive configuration in .env

### **Authorization Pattern**
```typescript
// Each request includes automatic verification
const token = await getIdToken(currentUser, true)
const config: AxiosRequestConfig = {
    headers: { Authorization: `Bearer ${token}` }
}
```

---