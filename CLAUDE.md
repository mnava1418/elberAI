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
2. `services/elber.service.ts#chat()` — loads STM session + fetches MTM summary and user memory document in parallel
3. `agents/builders/chat.agent.ts` — builds per-request OpenAI Agents SDK agent with user context, tools, and web search skill
4. Response streamed (text) or returned whole (voice) → `handleResponse()`
5. `services/memory.service.ts#handleMemory()` — runs asynchronously after response:
   - Persists turn to MTM (PostgreSQL + in-memory cache)
   - Fires keeper agent to update memory document (independent of summary cycle)
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

Three-layer memory system:

| Layer | Storage | Purpose |
|---|---|---|
| STM | In-memory Map | OpenAI Agents SDK session (tool call history, current turns); 24-hour TTL |
| MTM | In-memory cache + PostgreSQL | Recent turns + rolling summary; auto-compresses at ~2500 tokens |
| Memory document | Markdown file per user (`data/memory/{userId}.md`) | Everything known about the user: 9 sections (Identidad, Familia y relaciones, Amistades, Trabajo y estudios, Preferencias e intereses, Rutinas y hábitos, Metas y proyectos, Preocupaciones, Bitácora de eventos) — managed by `userMemory.service.ts` with in-memory cache; bidirectional token-overlap dedup (75% threshold); write lock per user prevents race conditions |

**Keeper agent** (runs every turn, fire-and-forget): `handleUserMemory()` in `memory.service.ts` passes the last 3 turns + current date to `userMemoryAgent`. The keeper adds new facts via `record_memory` or corrects existing ones via `update_memory`. Notable events go to "Bitácora de eventos" with a `YYYY-MM-DD` date prefix. The keeper does NOT delete entries — only explicit user requests trigger `forget_memory` or `reset_memory`.

**Memory document in context**: the full `data/memory/{userId}.md` is injected as `context.userMemory` into the chat prompt on every turn. The chat agent answers questions about the user directly from context — no tool call needed.

**MTM summary cycle**: state machine (`COLLECTING` → `SUMMARIZING` → `COLLECTING`). When summarizing, STM session is cleared to force fresh context on next turn.

### AI Services — Agents & Prompts

**Pre-loaded agents** (defined as JSON in `src/agents/definitions/`, instantiated at startup via `loaders/agents.loader.ts`):

| Agent ID | Model | Purpose |
|---|---|---|
| `chat_summary` | gpt-4o-mini | Rolling MTM compression |
| `title_generator` | gpt-4o-mini | Auto-generates chat titles on first message |

Each JSON definition references named entries in three registries resolved at load time:
- `promptsRegistry` — maps prompt key → prompt function (`src/agents/prompts/`)
- `toolRegistry` — maps tool name → tool (`src/agents/tools/`)
- `outputTypesRegistry` — maps type name → Zod schema (`src/agents/outputTypes/`)

**Per-request agents** — two builders, both instantiated dynamically on each chat session:

- **Chat agent** (`agents/builders/chat.agent.ts`): handles user messages. Injected context: user name, timezone, MTM summary, full memory document. Skills: `webSearchSkill`, `memorySkill`. Tools: `webSearch`, `getWeather`, `geocodeLocation`, `getUserData`, `deleteAllUserData`, `deleteUserData`, `recordMemory`, `updateMemory`, `forgetMemory`, `resetMemory`.
- **UserMemory agent** (`agents/builders/userMemory.agent.ts`): the keeper — runs automatically after every turn. Receives last 3 turns + current date, updates the memory document via `record_memory` (new facts) or `update_memory` (corrections). Handles all information types: stable facts, preferences, concerns, and dated events.

`getWeather` — fetches current conditions + 12h hourly + 7-day daily from OpenWeather One Call API 3.0. Uses `location` from the request when the user doesn't name a city. `geocodeLocation` — resolves a city name to coordinates; must be called before `getWeather` whenever the user mentions a specific place.

`recordMemory` — adds a fact to a specific section of the memory document; called by the chat agent when the user explicitly asks to remember something, or by the keeper for new facts. `updateMemory` — corrects by exact text match (section + `old_info` → `new_info`). `forgetMemory` — keyword-based removal across all sections, explicit user request only. `resetMemory` — wipes the entire document.

Prompts live in `src/agents/prompts/`. Key rule in `chat.prompt.ts`: default to web search for any specific factual claim; skip only for definitions, math, and general advice.

### AI Services — Key File Paths

```
src/
├── listeners/
│   ├── elber.listener.ts       # user:ask, user:cancel handlers
│   └── socket.listener.ts      # routes Socket.io events
├── services/
│   ├── elber.service.ts        # main orchestration, streaming, voice
│   ├── memory.service.ts       # handleMemory() pipeline: MTM persistence, keeper trigger, summary cycle
│   ├── userMemory.service.ts   # memory doc CRUD: recordMemoryFact, editMemoryFact, forgetMemoryFacts, resetMemoryData; write lock per user
│   ├── chat.service.ts         # Firebase chat operations
│   ├── ai.service.ts           # OpenAI embeddings
│   ├── polly.service.ts        # AWS Polly TTS synthesis
│   ├── weather.service.ts      # OpenWeather fetch, normalize, geocode
│   └── ltm/                    # legacy pgvector layer (still used by MTM DB pool; user_memories table not written by memory tools)
├── models/
│   ├── shortTermMemory.model.ts
│   ├── midTermMemory.model.ts
│   ├── longTermMemory.model.ts
│   └── weather.model.ts        # OneCallApiResponse + normalized output types
├── agents/
│   ├── builders/
│   │   ├── chat.agent.ts       # per-request chat agent (user messages)
│   │   └── userMemory.agent.ts # per-request background agent (profile MD updates)
│   ├── definitions/*.agent.json
│   ├── prompts/                # all prompt functions (including userMemory.prompt.ts)
│   ├── tools/
│   │   ├── search.tools.ts     # webSearch (Serper)
│   │   ├── user.tools.ts       # getUserData, deleteAllUserData, deleteUserData
│   │   ├── weather.tools.ts    # getWeather, geocodeLocation
│   │   ├── memory.tools.ts     # recordMemory, updateMemory, forgetMemory, resetMemory (backed by userMemory.service.ts)
│   │   └── index.ts            # tool registry
│   ├── outputTypes/            # Zod schemas for structured outputs
│   └── skills/
│       ├── web_search.skill.ts # when to call webSearch
│       └── memory.skill.ts     # when to use memory tools vs. answer directly from context
├── loaders/
│   ├── agents.loader.ts        # startup: reads definitions, resolves registries
│   ├── socket.loader.ts        # Socket.io init + Firebase token validation
│   └── firebase.loader.ts
└── db/
    ├── migrations/             # 001_pgvector, 002_conversation_turns, 003_ltm_subject
    └── queries/memory.queries.ts
```

### AI Services — Database Schema

**`user_memories`** — legacy pgvector table (no longer written by memory tools; kept for Fase B cleanup):
- Columns: `user_id`, `subject` (snake_case, nullable), `type`, `importance`, `text`, `embedding[1536]`

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
