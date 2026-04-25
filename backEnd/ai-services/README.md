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

### Three-level memory system
Elber remembers the user through three types of memory that are combined before generating each response:

**Short-Term Memory (STM)** — The active conversation session with the AI. It is kept alive while the session is active (up to 24 hours). This allows Elber to remember what was discussed in recent exchanges without needing to resend the entire history.

**Mid-Term Memory (MTM)** — Stores the current conversation history as text, persisted turn-by-turn in PostgreSQL. When the accumulated turns exceed a token budget, a rolling summary is generated and the turns are cleared. This prevents context from growing indefinitely and survives service restarts. A state machine (`COLLECTING → SUMMARIZING → COLLECTING`) prevents concurrent summary generation.

**Long-Term Memory (LTM)** — Persistent user memory stored in PostgreSQL with the pgvector extension. LTM extraction runs on two independent paths: on every turn (evaluating the user's message directly for relevant information) and after each summary is generated. Extracted facts are stored as vector embeddings. Before responding, this database is searched for the most relevant information to the current message using semantic search.

### AI agents
The service uses OpenAI Agents. Agents are split into two categories based on how they are instantiated:

**Pre-loaded agents** — Defined as JSON files in `src/agents/definitions/` and loaded once at server startup via `src/loaders/agents.loader.ts`. Each JSON file declares the agent's model, prompt key, output type, and tools. The loader resolves these references against the prompt, outputType, and tool registries and calls `Agent.create` once. At runtime, `getAgents(id)` returns the already-instantiated agent.

- **Summary agent** (`chat_summary`) — Generates rolling conversation summaries when the MTM token budget is exceeded.
- **Relevant info agent** (`user_info`) — Evaluates the last 3 conversation turns to detect whether the user shared personal information worth persisting to LTM.
- **LTM agent** (`long_memory`) — Extracts structured memory items from conversation text and summaries; returns a typed list of facts.
- **Title agent** (`title_generator`) — Automatically generates the title of a new conversation after the first message.

**Per-request agent** — Built dynamically on each chat session in `src/agents/builders/chat.agent.ts` because it requires user-specific context (timezone, user ID) to personalize its prompt and tool behavior.

- **Chat agent** — The main Elber agent. Responds to user messages with access to web search and user data tools. Its instructions are composed from the chat prompt plus injected skills.

### Agent skills
Skills are reusable instruction blocks injected into agent prompts at build time. Currently:

- **Web search skill** (`src/agents/skills/web_search.skill.ts`) — Defines the absolute rule for when the chat agent must call `webSearch`: any factual claim (numbers, names, dates, statistics) requires a search; only definitions, math, general advice, and user-specific questions are exempt.

### Agent tools
The chat agent has access to the following tools during a conversation:

- **Web search** (Serper API) — Used for any factual query. The search includes the user's timezone to localize results (e.g., local times, country-specific data).
- **User data management** — The agent can retrieve the user's saved memories (up to 10 most recent items) and can delete specific entries or the entire profile if the user requests it.
- **getWeather** — Fetches current conditions, 12-hour hourly forecast, and 7-day daily forecast from the OpenWeather One Call API 3.0. If the user does not specify a city, the tool uses the `location` coordinates sent with the request (device GPS). All dates and times are formatted in the user's timezone.
- **geocodeLocation** — Converts a city or place name to coordinates using the OpenWeather Geocoding API. The agent must call this before `getWeather` whenever the user mentions a specific location by name.

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
│   │   └── chat.agent.ts         # Elber chat agent — built per session with user context
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
│   │   └── index.ts              # prompt registry
│   ├── skills/
│   │   └── web_search.skill.ts   # Web search instruction block (injected into chat agent)
│   └── tools/                    # Tool implementations
│       ├── search.tools.ts       # Web search (Serper)
│       ├── user.tools.ts         # User data management
│       ├── weather.tools.ts      # getWeather + geocodeLocation (OpenWeather)
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
│   ├── memory.service.ts         # Memory processing pipeline
│   ├── chat.service.ts           # Firebase operations (save/read messages)
│   ├── ai.service.ts             # Embedding generation (text-embedding-3-small)
│   └── user.service.ts           # Delete all user data
├── controllers/                  # HTTP handlers
├── listeners/                    # WebSocket event handlers
├── middlewares/                  # Gateway validation
└── routes/                       # HTTP routes
```
