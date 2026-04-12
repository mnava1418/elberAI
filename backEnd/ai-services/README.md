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

**Mid-Term Memory (MTM)** — Stores the current conversation history as text. Every 8 conversation turns, a summary of the exchange is generated and the history is cleared. This prevents the context from growing indefinitely.

**Long-Term Memory (LTM)** — Persistent user memory stored in PostgreSQL with the pgvector extension. When a summary is generated (every 8 turns), the AI extracts relevant user information (goals, preferences, plans, constraints, personal profile) and stores it as vector embeddings. Before responding, this database is searched for the most relevant information to the current message using semantic search.

### AI agents
The service uses OpenAI Agents. There are several specialized agents:

- **Chat agent** — The main agent. Responds to user messages with access to tools (web search and user data access).
- **Title agent** — Automatically generates the title of each conversation after the first message.
- **Summary agent** — Generates conversation summaries every 8 turns.
- **LTM agent** — Extracts structured user information from the summary.
- **Relevant info agent** — Evaluates whether a piece of text contains information worth saving to LTM.

### Agent tools
The chat agent has access to two tools during a conversation:

- **Web search** (Serper API) — Activated when the user asks about recent events or news. The search includes the user's timezone to localize results.
- **User data management** — The agent can retrieve the user's saved memories (up to 10 most recent items) and can also delete them if the user requests it.

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
socket.emit('elber:message', {
  text: 'Hello Elber',
  chatId: '12345',      // null for a new conversation
  title: 'New chat',   // provisional title
  isVoiceMode: false   // true to receive audio instead of streamed text
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
│   ├── elber.agent.ts        # Chat agent and title agent
│   └── memory.agent.ts       # Summary agent, LTM agent, relevant info agent
├── models/
│   ├── elber.model.ts        # Chat data types and structures
│   ├── shortTermMemory.model.ts   # Active session management
│   ├── midTermMemory.model.ts     # Conversation history (24h TTL)
│   └── longTermMemory.model.ts   # Persistent memory in PostgreSQL/pgvector
├── tools/
│   ├── search.tools.ts       # Web search tool (Serper)
│   └── user.tools.ts         # User data management tools
├── services/
│   ├── elber.service.ts      # Main chat orchestration (text and voice modes)
│   ├── polly.service.ts      # Amazon Polly TTS: sentence splitting, MP3 synthesis
│   ├── memory.service.ts     # Memory processing pipeline
│   ├── chat.service.ts       # Firebase operations (save/read messages)
│   ├── ai.service.ts         # Embedding generation (text-embedding-3-small)
│   └── user.service.ts       # Delete all user data
├── controllers/              # HTTP handlers
├── listeners/                # WebSocket event handlers
├── middlewares/              # Gateway validation
└── routes/                   # HTTP routes
```
