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
npm test               # Jest
npm run test:coverage  # Jest with coverage report
```

Run a single test file:
```bash
npx jest src/__tests__/services/memory.service.test.ts
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

Real-time AI responses stream over Socket.io. Events: `elber:response`, `elber:stream`, `elber:error`, `elber:title`, `elber:audio_chunk`, `elber:audio_end`, `elber:cancelled`.

#### Voice Mode Flow
Voice mode has two distinct paths in `elber.service.ts`:
- **Text mode** — `stream: true`, responses streamed token by token via `elber:stream` events
- **Voice mode** — `stream: false`, full response returned then split into sentences → synthesized via AWS Polly → sent as base64 audio chunks via `elber:audio_chunk`

In `useVoice.ts`, auto-send only triggers when the silence timer expires (not on manual stop). The `stoppedByTimer` ref controls this. Auto-restart after Elber finishes speaking is driven by the `isTalking` effect in `InputToolBar.tsx`, which depends on `[isTalking, isWaiting, isStreaming]`.

### Backend Microservices (`backEnd/`)

| Service | Port | Purpose |
|---|---|---|
| `api-gateway` | 4040 | Express reverse proxy; Firebase JWT validation; rate limiting (100 req/15 min) |
| `auth-services` | 4041 | User signup/login with manual approval workflow |
| `ai-services` | 4042 | OpenAI Agents SDK, Socket.io streaming, memory management, PostgreSQL/pgvector |
| `notification-services` | 4043 | Email delivery via Nodemailer + OAuth2 |
| `news_services` | — | Python CrewAI pipeline; runs as a daily cron job |

**Inter-service auth**: All requests from the gateway carry `x-api-gateway-secret` and `x-user-uid` headers. Services validate these before processing.

### AI Services — Request Lifecycle (`ai-services`)

1. Socket event received → `elber.listener.ts`
2. `elber.service.ts#chat()` — loads STM session + fetches MTM and LTM in parallel
3. `agents/elber.agent.ts` — OpenAI Agents SDK agent with `webSearch` and `getUserData` tools
4. Response streamed (text) or returned whole (voice) → `handleResponse()`
5. `memory.service.ts#handleMemory()` — runs asynchronously after response:
   - Persists turn to MTM (PostgreSQL + in-memory cache)
   - Fires LTM extraction pipeline (independent of summary cycle)
   - Triggers MTM rolling summary if token budget (~2500 tokens) exceeded

**`conversationId`** format: `${uid}_${chatId}` — used as the key for all memory caches.

### AI Services — Memory Architecture

Three-tier memory in PostgreSQL with pgvector:

| Tier | Model | Storage | Purpose |
|---|---|---|---|
| STM | `ShortTermMemory` (singleton) | In-memory | OpenAI Agents SDK session (tool call history, current turns) |
| MTM | `MidTermMemory` (singleton) | In-memory cache + PostgreSQL | Recent turns + rolling summary; auto-compresses at ~2500 tokens |
| LTM | `LongTermMemory` | PostgreSQL + pgvector | Persistent user facts via vector embeddings |

**LTM extraction pipeline** (runs every turn, fire-and-forget):
1. `relevantInfoAgent` — evaluates last 3 conversation turns to detect if user shared personal info (uses conversational context, not just the isolated user message)
2. `ltmAgent` — extracts structured memory items (`profile | preference | constraint | goal | plan | project | event`)
3. `LongTermMemory#ingestLTM()` — upserts by `subject` for profile facts, appends for episodic types

**MTM summary cycle**: state machine (`COLLECTING` → `SUMMARIZING` → `COLLECTING`). When summarizing, STM session is cleared to force fresh context on next turn. Summary also triggers a second LTM extraction pass on the compressed text.

### AI Services — Agents & Prompts

All agents use the OpenAI Agents SDK (`@openai/agents`). Prompts live in `src/prompts/` and are injected as agent instructions:

- `chat.prompt.ts` — Elber's personality + **webSearch usage rules** (default: search for any specific factual claim; only skip for definitions, math, general advice)
- `relevantInfo.prompt.ts` — detects if user is sharing personal info; receives last 3 turns as context
- `longTermMemory.prompt.ts` — extracts structured LTM items with `subject` (snake_case canonical key) for deduplication
- `summary.prompt.ts` — rolling MTM compression

### News Services Pipeline
4-phase CrewAI multi-agent pipeline: Research → Fact-Checking → Editorial Curation → Distribution. Sends results to `notification-services` via JWT-authenticated REST call.

## Environment Variables

Each service has a `.env.template`. Key variables:

- `GATEWAY_SECRET` — shared secret for inter-service authentication
- `OPENAI_API_KEY` — OpenAI API
- `SERPER_API_KEY` — web search (Serper API)
- `GOOGLE_APPLICATION_CREDENTIALS` — path to Firebase Admin SDK JSON
- `FIREBASE_DB` — Firebase Realtime Database URL
- `PG_DB` — PostgreSQL connection string (ai-services)
- `JWT_TOKEN` / `JWT_SECRET` — token signing
- `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `AWS_REGION` — AWS Polly (TTS for voice mode)

Frontend uses `BACK_URL` (API gateway) and `SOCKET_URL` (WebSocket server) in `Elber/.env`.
