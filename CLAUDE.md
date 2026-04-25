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

1. Socket event received → `listeners/elber.listener.ts`
2. `services/elber.service.ts#chat()` — loads STM session + fetches MTM and LTM in parallel
3. `agents/builders/chat.agent.ts` — builds per-request OpenAI Agents SDK agent with user context, tools, and web search skill
4. Response streamed (text) or returned whole (voice) → `handleResponse()`
5. `services/memory.service.ts#handleMemory()` — runs asynchronously after response:
   - Persists turn to MTM (PostgreSQL + in-memory cache)
   - Fires LTM extraction pipeline (independent of summary cycle)
   - Triggers MTM rolling summary if token budget (~2500 tokens) exceeded

**`conversationId`** format: `${uid}_${chatId}` — used as the key for all memory caches.

#### Socket.io Event Payloads

**Client → Server:**
- `user:ask` — `{ text, chatId, title, timeStamp, timeZone, isVoiceMode, user: { uid, name }, location: { lat, lon } | null }`
- `user:cancel` — `chatId` (triggers AbortController)

**Server → Client (text mode):** `elber:stream` (token fragment) → `elber:response` (done signal) → `elber:title`

**Server → Client (voice mode):** `elber:audio_chunk` (base64 MP3 per sentence) → `elber:audio_end` (full text) → `elber:title`

Both modes: `elber:error`, `elber:cancelled`

### AI Services — Memory Architecture

Three-tier memory in PostgreSQL with pgvector:

| Tier | Model | Storage | Purpose |
|---|---|---|---|
| STM | `ShortTermMemory` (singleton) | In-memory Map | OpenAI Agents SDK session (tool call history, current turns); 24-hour TTL |
| MTM | `MidTermMemory` (singleton) | In-memory cache + PostgreSQL | Recent turns + rolling summary; auto-compresses at ~2500 tokens |
| LTM | `LongTermMemory` | PostgreSQL + pgvector | Persistent user facts via vector embeddings (text-embedding-3-small, 1536-dim) |

**LTM extraction pipeline** (runs every turn, fire-and-forget):
1. `relevantInfoAgent` — evaluates last 3 conversation turns to detect if user shared personal info (uses conversational context, not just the isolated user message)
2. `ltmAgent` — extracts structured memory items (`profile | preference | constraint | goal | plan | project | event`) with `subject` (snake_case canonical key) and `importance` (1–5)
3. `LongTermMemory#ingestLTM()` — upserts by `subject` for profile facts, appends for episodic types; deduplication also via vector similarity (0.70 threshold)

**LTM semantic search**: topK=8, minImportance=2, minScore=0.75 — runs on every turn before building agent context.

**MTM summary cycle**: state machine (`COLLECTING` → `SUMMARIZING` → `COLLECTING`). When summarizing, STM session is cleared to force fresh context on next turn. Summary also triggers a second LTM extraction pass on the compressed text.

### AI Services — Agents & Prompts

**Pre-loaded agents** (defined as JSON in `src/agents/definitions/`, instantiated at startup via `loaders/agents.loader.ts`):

| Agent ID | Model | Purpose |
|---|---|---|
| `chat_summary` | gpt-4o-mini | Rolling MTM compression |
| `user_info` | gpt-4o-mini | Detects if user shared personal info (output: `IsRelevantType`) |
| `long_memory` | gpt-4o-mini | Extracts structured LTM items (output: `LTMList`) |
| `title_generator` | gpt-4o-mini | Auto-generates chat titles on first message |

Each JSON definition references named entries in three registries resolved at load time:
- `promptsRegistry` — maps prompt key → prompt function (`src/agents/prompts/`)
- `toolRegistry` — maps tool name → tool (`src/agents/tools/`)
- `outputTypesRegistry` — maps type name → Zod schema (`src/agents/outputTypes/`)

**Per-request agent** (`chat`): built dynamically in `agents/builders/chat.agent.ts` with injected user context (name, timezone, MTM summary, LTM results) and web search skill. Tools: `webSearch`, `getUserData`, `deleteAllUserData`, `deleteUserData`, `getWeather`, `geocodeLocation`.

`getWeather` — fetches current conditions + 12h hourly + 7-day daily from OpenWeather One Call API 3.0. Uses `location` from the request when the user doesn't name a city. `geocodeLocation` — resolves a city name to coordinates; must be called before `getWeather` whenever the user mentions a specific place.

Prompts live in `src/agents/prompts/`. Key rule in `chat.prompt.ts`: default to web search for any specific factual claim; skip only for definitions, math, and general advice.

### AI Services — Key File Paths

```
src/
├── listeners/
│   ├── elber.listener.ts       # user:ask, user:cancel handlers
│   └── socket.listener.ts      # routes Socket.io events
├── services/
│   ├── elber.service.ts        # main orchestration, streaming, voice
│   ├── memory.service.ts       # handleMemory() pipeline
│   ├── chat.service.ts         # Firebase chat operations
│   ├── ai.service.ts           # OpenAI embeddings
│   ├── polly.service.ts        # AWS Polly TTS synthesis
│   ├── weather.service.ts      # OpenWeather fetch, normalize, geocode
│   └── ltm/
│       ├── ltmWriter.service.ts
│       ├── ltmReader.service.ts
│       └── vectoreStore.service.ts   # pgvector queries
├── models/
│   ├── shortTermMemory.model.ts
│   ├── midTermMemory.model.ts
│   ├── longTermMemory.model.ts
│   └── weather.model.ts        # OneCallApiResponse + normalized output types
├── agents/
│   ├── builders/chat.agent.ts  # per-request chat agent
│   ├── definitions/*.agent.json
│   ├── prompts/                # all prompt functions
│   ├── tools/                  # webSearch, getUserData, getWeather, geocodeLocation
│   ├── outputTypes/            # Zod schemas for structured outputs
│   └── skills/web_search.skill.ts
├── loaders/
│   ├── agents.loader.ts        # startup: reads definitions, resolves registries
│   ├── socket.loader.ts        # Socket.io init + Firebase token validation
│   └── firebase.loader.ts
└── db/
    ├── migrations/             # 001_pgvector, 002_conversation_turns, 003_ltm_subject
    └── queries/memory.queries.ts
```

### AI Services — Database Schema

**`user_memories`** — LTM storage with pgvector:
- Columns: `user_id`, `subject` (snake_case, nullable), `type`, `importance`, `text`, `embedding[1536]`
- Unique constraint: `(user_id, subject) WHERE subject IS NOT NULL` — enables profile fact upserts
- IVFFLAT index on embedding (cosine distance)

**`conversation_turns`** — MTM persistence:
- Columns: `conversation_id` (`${uid}_${chatId}`), `user_id`, `chat_id`, `user_message`, `assistant_message`, `token_estimate`

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
- `OPENWEATHER_API_KEY` — OpenWeather One Call API 3.0 (weather + geocoding, ai-services)

Frontend uses `BACK_URL` (API gateway) and `SOCKET_URL` (WebSocket server) in `Elber/.env`.
