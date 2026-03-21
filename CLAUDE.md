# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

ElberAI is a full-stack AI personal assistant with a React Native mobile app and a Node.js/Python microservices backend. The AI agent (Elber) supports real-time streaming, voice input, multi-tier memory, and automated news delivery.

## Commands

### Frontend (`Elber/`)
```bash
npm start              # Start Metro bundler
npm run android        # Run on Android emulator
npm run ios            # Run on iOS simulator
npm run lint           # ESLint
npm test               # Jest
```

### Backend Services (`backEnd/<service>/`)
All TypeScript services share the same scripts:
```bash
npm run dev            # Development with nodemon
npm run build          # Compile TypeScript → dist/
npm start              # Production
```

### News Services (`backEnd/news_services/`)
```bash
uv sync                                              # Install dependencies
uv run python src/news_services/main.py run          # Full pipeline
uv run python src/news_services/main.py test         # Fast mode (gpt-4o-mini)
```

### Docker (from `backEnd/`)
```bash
docker compose build --no-cache    # Build all services
docker compose up -d               # Start all services
docker compose logs -f <service>   # Tail logs for a service
docker compose down                # Stop all services
```

## Architecture

### Frontend (`Elber/src/`)
- **`store/`** — Redux-style state: `actions/`, `reducers/`, `selectors/`
- **`services/`** — Business logic: `auth`, `chat`, `elber`, `network`, `validation`
- **`hooks/`** — Domain hooks: `useChat`, `useVoice`, `useElberStatus`, `useAnimateText`
- **`view/screens/`** — Feature screens; **`view/components/`** — Reusable UI
- **`models/`** — TypeScript types; **`adapters/`** — Device permission wrappers

Real-time AI responses stream over Socket.io. Events: `elber:response`, `elber:stream`, `elber:error`, `elber:title`.

### Backend Microservices (`backEnd/`)

| Service | Port | Purpose |
|---|---|---|
| `api-gateway` | 4040 | Express reverse proxy; Firebase JWT validation; rate limiting (100 req/15 min) |
| `auth-services` | 4041 | User signup/login with manual approval workflow |
| `ai-services` | 4042 | OpenAI Agents, Socket.io streaming, memory management, PostgreSQL/pgvector |
| `notification-services` | 4043 | Email delivery via Nodemailer + OAuth2 |
| `news_services` | — | Python CrewAI pipeline; runs as a daily cron job |

**Inter-service auth**: All requests from the gateway carry `x-api-gateway-secret` and `x-user-uid` headers. Services validate these before processing.

### AI Services Memory Architecture
Three-tier memory stored in PostgreSQL with pgvector:
- **STM** (Short-Term Memory) — current conversation context
- **MTM** (Mid-Term Memory) — recent conversation history
- **LTM** (Long-Term Memory) — persistent user knowledge graph (vector embeddings)

The AI agent uses custom tools: web search (Serper API), user data retrieval, and chat summarization.

### News Services Pipeline
4-phase CrewAI multi-agent pipeline: Research → Fact-Checking → Editorial Curation → Distribution. Sends results to `notification-services` via JWT-authenticated REST call.

## Environment Variables

Each service has a `.env.template`. Key variables:

- `GATEWAY_SECRET` — shared secret for inter-service authentication
- `OPENAI_API_KEY` — OpenAI API
- `SERPER_API_KEY` — web search
- `GOOGLE_APPLICATION_CREDENTIALS` — path to Firebase Admin SDK JSON
- `FIREBASE_DB` — Firebase Realtime Database URL
- `PG_DB` — PostgreSQL connection string (ai-services)
- `JWT_TOKEN` / `JWT_SECRET` — token signing

Frontend uses `BACK_URL` (API gateway) and `SOCKET_URL` (WebSocket server) in `Elber/.env`.
