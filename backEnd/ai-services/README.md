# AI Services

The brain of Elber. This service handles the entire conversation with the AI assistant: it receives messages, processes them with memory context, generates streaming responses, and learns about the user over time.

## What does it do?

### Real-time chat with streaming
Communication with this service is over WebSocket (Socket.io), not HTTP. When the user sends a message, the response arrives in progressive fragments (token by token), creating the sensation that Elber is typing live.

The client emits the `elber:message` event and receives three possible response events:
- `elber:stream` — partial response fragment (received multiple times)
- `elber:response` — complete response, signals that generation has finished
- `elber:error` — if an error occurred

### Voice output (Amazon Polly)
When a message is sent with `isVoiceMode: true`, the service switches from text streaming to audio synthesis. Instead of emitting token-by-token fragments, it:

1. Waits for the full AI response.
2. Strips markdown and splits the response into sentences.
3. Converts each sentence to MP3 using **Amazon Polly** (voice: `Andrés`, language: `es-MX`, engine: `generative`).
4. Emits each MP3 as a base64-encoded `elber:audio_chunk` event as soon as it is ready, so playback can begin on the client before all sentences are synthesized.
5. Emits `elber:audio_end` with the full response text once all chunks have been sent.

The user can send a `user:cancel` event at any time to abort synthesis and stop playback.

### Three-layer memory system
Elber remembers the user through three layers of memory that are combined before generating each response:

**Short-Term Memory (STM)** — The active OpenAI Agents session (tool call history, current turns). It is kept alive while the session is active (up to 24 hours) and is cleared after each MTM summary cycle to force fresh context on the next turn.

**Mid-Term Memory (MTM)** — Stores the current conversation history as text, persisted turn-by-turn in PostgreSQL. When the accumulated turns exceed a token budget (~2 500 tokens), a rolling summary is generated and the raw turns are discarded. This prevents context from growing indefinitely and survives service restarts. A state machine (`COLLECTING → SUMMARIZING → COLLECTING`) prevents concurrent summary generation.

**Memory document (Markdown file)** — A structured Markdown file stored at `data/memory/{userId}.md`, divided into nine sections: Identidad, Familia y relaciones, Amistades, Trabajo y estudios, Preferencias e intereses, Rutinas y hábitos, Metas y proyectos, Preocupaciones, and Bitácora de eventos. It is managed by `src/services/userMemory.service.ts` with an in-memory cache. After every conversation turn, a background agent (`userMemory.agent.ts`) reads the last 3 turns and writes new facts to the appropriate section via `record_memory`. Notable events go into "Bitácora de eventos" with the date. The full document is injected into the chat agent's context on every turn — the agent reads user information directly from context without calling any tool. Duplicate detection uses bidirectional word-overlap (75% threshold) at the code level. Write operations are serialized per user with an in-memory lock (`writeLocks`) to prevent race conditions between the foreground chat agent and the background keeper.

### AI agents
The service uses OpenAI Agents. Agents are split into two categories based on how they are instantiated:

**Pre-loaded agents** — Defined as JSON files in `src/agents/definitions/` and loaded once at server startup via `src/loaders/agents.loader.ts`. Each JSON file declares the agent's model, prompt key, output type, and tools. The loader resolves these references against the prompt, outputType, and tool registries and calls `Agent.create` once. At runtime, `getAgents(id)` returns the already-instantiated agent.

- **Summary agent** (`chat_summary`) — Generates rolling conversation summaries when the MTM token budget is exceeded.
- **Relevant info agent** (`user_info`) — Evaluates the last 3 conversation turns to detect whether the user shared personal information worth persisting to LTM.
- **LTM agent** (`long_memory`) — Extracts structured memory items from conversation text and summaries; returns a typed list of facts.
- **Title agent** (`title_generator`) — Automatically generates the title of a new conversation after the first message.

**Per-request agents** — Built dynamically on each chat session because they require user-specific context (user ID, timezone) to personalize their prompts and tool behavior.

- **Chat agent** (`src/agents/builders/chat.agent.ts`) — The main Elber agent. Responds to user messages with access to web search, weather, and memory tools. Its instructions are composed from the chat prompt plus injected skills (`webSearchSkill`, `memorySkill`). The full memory document is included in the prompt, so the agent answers questions about the user directly from context without calling any tool.
- **UserMemory agent** (`src/agents/builders/userMemory.agent.ts`) — Runs automatically after every conversation turn (the "keeper"). Reads the last 3 turns plus the current date and decides what to add or correct in the memory document. Uses `record_memory` to add new facts to the appropriate section, or `update_memory` to correct existing ones. Saves all types of information: stable facts, preferences, concerns, and notable events with dates.

### Agent skills
Skills are reusable instruction blocks injected into agent prompts at build time. Currently:

- **Web search skill** (`src/agents/skills/web_search.skill.ts`) — Defines the absolute rule for when the chat agent must call `webSearch`: any factual claim (numbers, names, dates, statistics) requires a search; only definitions, math, general advice, and user-specific questions are exempt.
- **Memory skill** (`src/agents/skills/memory.skill.ts`) — Documents when the chat agent must call each memory tool. Key rule: answering questions about the user ("what do you know about me?") must be done directly from the `<memoria_usuario>` context block — no tool call needed. Write tools (`record_memory`, `update_memory`, `forget_memory`, `reset_memory`) are called only on explicit user requests.

### Agent tools

**Chat agent tools** (available during conversation):

- **Web search** (Serper API) — Used for any factual query. The search includes the user's timezone to localize results (e.g., local times, country-specific data).
- **getWeather** — Fetches current conditions, 12-hour hourly forecast, and 7-day daily forecast from the OpenWeather One Call API 3.0. If the user does not specify a city, the tool uses the `location` coordinates sent with the request (device GPS). All dates and times are formatted in the user's timezone.
- **geocodeLocation** — Converts a city or place name to coordinates using the OpenWeather Geocoding API. The agent must call this before `getWeather` whenever the user mentions a specific location by name.
- **Memory management** (backed by `userMemory.service.ts`, stored in `data/memory/{userId}.md`):
  - `record_memory` — Adds a new fact to the specified section of the memory document. Called when the user asks Elber to remember something, or shares personal information worth persisting. Includes duplicate detection at the service level.
  - `update_memory` — Corrects an existing fact by exact text match (section + old text → new text). Used when the user corrects something previously stored.
  - `forget_memory` — Removes all bullets matching a keyword across all sections. Called only on explicit user request ("forget where I work").
  - `reset_memory` — Wipes the entire memory document and resets it to the empty template. Irreversible.
- **User data** (`getUserData`, `deleteAllUserData`, `deleteUserData`) — Retrieve or remove entries from the LTM table populated by the automatic extraction pipeline.

**UserMemory agent tools** (automatic keeper, runs after every turn):

- **record_memory** — Adds a new fact to the appropriate section of `data/memory/{userId}.md`. The keeper also uses `update_memory` when the user corrects existing information.

### Chat management
In addition to WebSocket, the service exposes HTTP endpoints to:
- Retrieve all of a user's chats (with their messages)
- Delete a specific chat
- Delete all chats

Chats are stored in Firebase Realtime Database.

## Port

Runs on port `4042`.

## HTTP Endpoints

| Method | Route | Description |
|---|---|---|
| GET | `/ai/health` | Health check |
| GET | `/ai/chat` | Get all user chats |
| DELETE | `/ai/chat` | Delete a chat (body: `{ chatId }`) |
| DELETE | `/ai/chat/all` | Delete all user chats |

> All endpoints require the `x-user-uid` header (sent by the gateway) and the `x-api-gateway-secret` header.

## WebSocket

**Connection:**
```javascript
const socket = io('ws://localhost:4042', {
  auth: { token: 'firebase-jwt-token' }
})
```

**Send a message:**
```javascript
socket.emit('user:ask', {
  text: 'Hello Elber',
  chatId: 12345,                   // Date.now() for a new conversation
  title: 'New chat',              // provisional title
  timeStamp: '...',               // formatted local timestamp
  timeZone: 'America/Monterrey',  // IANA timezone
  isVoiceMode: false,             // true to receive audio instead of streamed text
  user: { uid: '...', name: '...' },
  location: { lat: 25.67, lon: -100.31 }  // device GPS coords; null if permission denied
})
```

**Cancel ongoing response:**
```javascript
socket.emit('user:cancel', { chatId: '12345' })
```

**Receive a response (text mode — `isVoiceMode: false`):**
```javascript
socket.on('elber:stream', (chunk) => { /* partial text fragment */ })
socket.on('elber:response', (response) => { /* complete response text */ })
socket.on('elber:error', (error) => { /* error */ })
socket.on('elber:title', (title) => { /* AI-generated title */ })
```

**Receive a response (voice mode — `isVoiceMode: true`):**
```javascript
socket.on('elber:audio_chunk', (base64Mp3) => { /* one synthesized sentence as MP3 */ })
socket.on('elber:audio_end', (response) => { /* all chunks sent; full response text included */ })
socket.on('elber:cancelled', () => { /* generation was cancelled */ })
socket.on('elber:error', (error) => { /* error */ })
socket.on('elber:title', (title) => { /* AI-generated title */ })
```

## Environment variables

```
AI_PORT=4042
GOOGLE_APPLICATION_CREDENTIALS=  # Path to the Firebase Admin SDK JSON file
FIREBASE_DB=        # Firebase Realtime Database URL
OPENAI_API_KEY=     # OpenAI API key
GATEWAY_SECRET=     # Shared secret with the API Gateway
PG_DB=              # PostgreSQL connection string (with pgvector)
SERPER_API_KEY=     # Serper API key for web search
AWS_ACCESS_KEY_ID=        # AWS credentials for Amazon Polly
AWS_SECRET_ACCESS_KEY=    # AWS credentials for Amazon Polly
AWS_REGION=us-east-1      # AWS region (defaults to us-east-1)
OPENWEATHER_API_KEY=      # OpenWeather One Call API 3.0 key (weather + geocoding)
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
├── agents/
│   ├── builders/
│   │   ├── chat.agent.ts         # Elber chat agent — built per session with user context
│   │   └── userMemory.agent.ts   # Background agent — saves permanent facts to profile MD after each turn
│   ├── definitions/              # JSON config files — one per pre-loaded agent
│   │   ├── chat_summary.agent.json
│   │   ├── user_info.agent.json
│   │   ├── long_memory.agent.json
│   │   └── title_generator.agent.json
│   ├── outputTypes/              # Zod schemas for structured agent outputs
│   │   ├── user_info.output.ts   # IsRelevantType
│   │   ├── long_memory.output.ts # LTMList
│   │   ├── title_generator.output.ts
│   │   └── index.ts              # outputType registry
│   ├── prompts/                  # Prompt functions for all agents
│   │   ├── chat.prompt.ts
│   │   ├── summary.prompt.ts
│   │   ├── relevantInfo.prompt.ts
│   │   ├── longTermMemory.prompt.ts
│   │   ├── title_generator.prompt.ts
│   │   ├── userMemory.prompt.ts  # Instructions for the background profile-saving agent
│   │   └── index.ts              # prompt registry
│   ├── skills/
│   │   ├── web_search.skill.ts   # Web search rules (injected into chat agent)
│   │   └── memory.skill.ts       # Memory tool rules (injected into chat agent)
│   └── tools/                    # Tool implementations
│       ├── search.tools.ts       # Web search (Serper)
│       ├── user.tools.ts         # getUserData, deleteAllUserData, deleteUserData
│       ├── weather.tools.ts      # getWeather + geocodeLocation (OpenWeather)
│       ├── memory.tools.ts       # recordMemory, updateMemory, forgetMemory, resetMemory
│       └── index.ts              # tool registry
├── loaders/
│   └── agents.loader.ts          # Reads definitions/, resolves registries, pre-loads agents at startup
├── models/
│   ├── agent.model.ts            # AgentConfig interface and AgentId type
│   ├── elber.model.ts            # Chat data types and structures (includes location field)
│   ├── weather.model.ts          # Types for OpenWeather API response and normalized output
│   ├── prompt.model.ts           # ChatPromptContext type
│   ├── shortTermMemory.model.ts  # Active session management
│   ├── midTermMemory.model.ts    # Conversation history (write-through cache + PostgreSQL)
│   └── longTermMemory.model.ts   # Persistent memory in PostgreSQL/pgvector
├── services/
│   ├── elber.service.ts          # Main chat orchestration (text and voice modes)
│   ├── weather.service.ts        # OpenWeather One Call API 3.0: fetch, normalize, geocode
│   ├── polly.service.ts          # Amazon Polly TTS: sentence splitting, MP3 synthesis
│   ├── memory.service.ts         # MTM pipeline + keeper trigger (handleMemory, handleUserMemory)
│   ├── userMemory.service.ts     # Memory doc CRUD: recordMemoryFact, editMemoryFact, forgetMemoryFacts, resetMemoryData
│   ├── chat.service.ts           # Firebase operations (save/read messages)
│   ├── ai.service.ts             # Embedding generation (text-embedding-3-small)
│   └── user.service.ts           # Delete all user data
├── controllers/                  # HTTP handlers
├── listeners/                    # WebSocket event handlers
├── middlewares/                  # Gateway validation
└── routes/                       # HTTP routes
```
