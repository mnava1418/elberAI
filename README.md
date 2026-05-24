# ElberAI

ElberAI is a personal AI assistant built as a full-stack application. It combines a React Native mobile app with a microservices backend to deliver a conversational AI experience that goes beyond a simple chatbot: Elber remembers who you are, learns from your conversations over time, can search the web when needed, and sends you a curated daily news briefing.

## The idea

Most AI chat apps treat every conversation as a blank slate. Elber is designed to be a long-term personal assistant — one that builds a persistent memory of your goals, preferences, and context, and uses that knowledge to give better, more relevant answers over time.

Access to Elber is intentionally controlled. New users must request access and be manually approved by an admin before they can register. This is a design decision, not a technical limitation.

## What Elber can do

- **Remember you** — After every message, a background agent reads the conversation and updates a persistent memory document with everything it learns about you: identity, family, friends, work, preferences, routines, goals, concerns, and notable events. This document is always included as context. Duplicates are detected and filtered out automatically.

- **Remember what happened** — You can explicitly ask Elber to remember a specific event ("remember that I had a tough interview at Google today"). It saves that moment in the "Bitácora de eventos" section of your memory document with the date, so it can surface it in future conversations.

- **Manage your memory** — You can ask Elber to correct or forget any specific fact at any time ("forget where I work", "update — I'm now 32, not 31", "forget everything you know about me"). These changes take effect immediately.

- **Search the web** — When you ask about recent events or news, Elber searches the internet in real time and incorporates the results into its response.

- **Check the weather** — Elber can report current conditions, hourly forecasts (12 hours), and daily forecasts (7 days) for any location. When you ask without specifying a place, it uses your device's GPS coordinates automatically. When you name a city, it resolves the coordinates and queries the weather for that location.

- **Stream responses** — Responses arrive progressively as Elber generates them, word by word, via WebSocket.

- **Understand your voice** — You can dictate messages instead of typing them using the device's native speech recognition.

- **Speak back to you** — In voice mode, Elber responds with synthesized speech powered by Amazon Polly. The response is streamed sentence by sentence as audio, so playback begins immediately without waiting for the full answer to be generated.

- **Send you a daily newsletter** — Every morning, a separate AI pipeline researches technology, sports, and geopolitics news, fact-checks the articles, and sends you a curated HTML newsletter by email.

## Architecture

ElberAI is composed of two client apps and five backend services:

```
Mobile App (React Native)          Web App (Next.js)
        │                                 │
        └──────────────┬──────────────────┘
                       ▼
              API Gateway :4040     ← Single entry point. Validates Firebase JWT tokens.
                       │
                       ├──▶  Auth Services :4041       ← Access requests, manual approval, registration
                       ├──▶  AI Services :4042         ← Chat, streaming, memory, web search
                       └──▶  Notification Services :4043  ← All outgoing emails (OAuth2 / Gmail)

News Services (cron job)            ← Daily newsletter pipeline, runs independently
```

| Service | Description |
|---|---|
| [Mobile App](./Elber/README.md) | React Native app — chat interface, voice input/output, auth flow, settings |
| [Web App](./web/README.md) | Next.js web client — landing page, login, real-time chat with streaming |
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

**Web**
- Next.js 16 (App Router) with TypeScript
- Firebase Authentication
- Socket.io client (real-time streaming)
- Zustand (state management)
- Tailwind CSS 4

**Backend (Node.js services)**
- Express.js with TypeScript
- Firebase Admin SDK (auth validation + Realtime Database for chat history)
- OpenAI Agents SDK
- PostgreSQL + pgvector (long-term memory with semantic search)
- Socket.io (WebSocket server)
- Nodemailer + Google OAuth2 (email)
- Amazon Polly (text-to-speech for voice responses)
- OpenWeather One Call API 3.0 (weather forecasts)
- Docker + Docker Compose

**News pipeline (Python)**
- CrewAI (multi-agent orchestration)
- OpenAI GPT-4o
- Serper API (real-time web search)
- Pydantic (data validation between pipeline stages)
- UV (package manager)

## How memory works

Elber maintains three layers of memory that are combined before every response:

| Layer | What it stores | Storage | Updated by |
|---|---|---|---|
| **Short-Term (STM)** | Active OpenAI Agents session (tool calls, current turns) | In-memory | Automatically, every turn |
| **Mid-Term (MTM)** | Current conversation history as text | PostgreSQL | Automatically, every turn; summarized when token budget exceeded |
| **Memory document** | Everything known about the user: identity, family, friends, work, preferences, routines, goals, concerns, and notable events | Markdown file per user (`data/memory/{userId}.md`) | Background agent after every turn; user can also modify explicitly |

**How each layer works:**

- **STM** holds the live OpenAI Agents session. It expires after 24 hours and is cleared when MTM generates a new summary, so the agent always reads fresh context.
- **MTM** persists every turn to PostgreSQL. When accumulated turns exceed a token budget (~2 500 tokens), a rolling summary is generated and the raw turns are discarded. The summary survives restarts and is injected into every new session.
- **Memory document** is a structured Markdown file divided into nine sections: Identidad, Familia y relaciones, Amistades, Trabajo y estudios, Preferencias e intereses, Rutinas y hábitos, Metas y proyectos, Preocupaciones, and Bitácora de eventos. After every turn, a background agent reads the last 3 turns and adds new facts to the appropriate section. Notable events (meetings, interviews, decisions) go into the Bitácora de eventos section with the date. The full document is injected into the agent's context on every turn — no semantic search required. Duplicate detection uses bidirectional word-overlap (75% threshold) at the code level to prevent re-writing the same fact. Write operations are serialized per user with an in-memory lock to prevent race conditions between the foreground agent and the background keeper.

