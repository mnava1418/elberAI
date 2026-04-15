# ElberAI

ElberAI is a personal AI assistant built as a full-stack application. It combines a React Native mobile app with a microservices backend to deliver a conversational AI experience that goes beyond a simple chatbot: Elber remembers who you are, learns from your conversations over time, can search the web when needed, and sends you a curated daily news briefing.

## The idea

Most AI chat apps treat every conversation as a blank slate. Elber is designed to be a long-term personal assistant — one that builds a persistent memory of your goals, preferences, and context, and uses that knowledge to give better, more relevant answers over time.

Access to Elber is intentionally controlled. New users must request access and be manually approved by an admin before they can register. This is a design decision, not a technical limitation.

## What Elber can do

- **Remember you** — Elber builds a memory of who you are across conversations. After every few exchanges it summarizes what was discussed and extracts relevant information about you (goals, plans, preferences), storing it as vector embeddings in a database. Every time you send a message, the most relevant memories are retrieved and included as context.

- **Search the web** — When you ask about recent events or news, Elber searches the internet in real time and incorporates the results into its response.

- **Stream responses** — Responses arrive progressively as Elber generates them, word by word, via WebSocket.

- **Understand your voice** — You can dictate messages instead of typing them using the device's native speech recognition.

- **Speak back to you** — In voice mode, Elber responds with synthesized speech powered by Amazon Polly. The response is streamed sentence by sentence as audio, so playback begins immediately without waiting for the full answer to be generated.

- **Send you a daily newsletter** — Every morning, a separate AI pipeline researches technology, sports, and geopolitics news, fact-checks the articles, and sends you a curated HTML newsletter by email.

## Architecture

ElberAI is composed of a mobile app and five backend services:

```
Mobile App (React Native)
        │
        ▼
  API Gateway :4040          ← Single entry point. Validates Firebase JWT tokens.
        │
        ├──▶  Auth Services :4041       ← Access requests, manual approval, registration
        ├──▶  AI Services :4042         ← Chat, streaming, memory, web search
        └──▶  Notification Services :4043  ← All outgoing emails (OAuth2 / Gmail)

News Services (cron job)     ← Daily newsletter pipeline, runs independently
```

| Service | Description |
|---|---|
| [Mobile App](./Elber/README.md) | React Native app — chat interface, voice input/output, auth flow, settings |
| [API Gateway](./backEnd/api-gateway/README.md) | Entry point for all requests. Validates Firebase tokens and routes traffic. |
| [Auth Services](./backEnd/auth-services/README.md) | Manual approval workflow, access codes, user registration, password reset |
| [AI Services](./backEnd/ai-services/README.md) | OpenAI Agents, 3-tier memory system, real-time streaming, web search, Amazon Polly TTS |
| [Notification Services](./backEnd/notification-services/README.md) | Sends all system emails via Nodemailer and Google OAuth2 |
| [News Services](./backEnd/news_services/README.md) | 7-agent CrewAI pipeline that generates and distributes the daily newsletter |

## Tech stack

**Mobile**
- React Native with TypeScript
- Firebase Authentication
- Socket.io (real-time streaming)
- React Native Voice (speech recognition)
- React Native Sound + React Native Blob Util (voice output / audio playback)

**Backend (Node.js services)**
- Express.js with TypeScript
- Firebase Admin SDK (auth validation + Realtime Database for chat history)
- OpenAI Agents SDK
- PostgreSQL + pgvector (long-term memory with semantic search)
- Socket.io (WebSocket server)
- Nodemailer + Google OAuth2 (email)
- Amazon Polly (text-to-speech for voice responses)
- Docker + Docker Compose

**News pipeline (Python)**
- CrewAI (multi-agent orchestration)
- OpenAI GPT-4o
- Serper API (real-time web search)
- Pydantic (data validation between pipeline stages)
- UV (package manager)

## How memory works

Elber maintains three layers of memory that are combined before every response:

| Layer | What it stores | How long |
|---|---|---|
| **Short-Term (STM)** | The active conversation session | Up to 24 hours |
| **Mid-Term (MTM)** | Current conversation history as text, persisted in PostgreSQL | Summarized when accumulated turns exceed a token budget |
| **Long-Term (LTM)** | User profile: goals, preferences, plans, constraints | Persistent — stored as vector embeddings in PostgreSQL |

When the accumulated conversation turns exceed a token budget, the mid-term history is compressed into a rolling summary. On every turn, the AI also evaluates the user's message directly for relevant personal information to store in long-term memory. On every new message, a semantic search retrieves the most relevant memories and injects them as context for the AI.

