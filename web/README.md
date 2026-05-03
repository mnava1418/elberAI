# Elber Web

Next.js web client for ElberAI. Provides the same chat experience as the mobile app — real-time streaming, chat history, and Firebase authentication — accessible from any browser.

## Features

- **Landing page** — hero, features overview, and footer
- **Login** — Firebase email/password authentication with email verification
- **Chat interface** — sidebar with conversation list, streaming message display, and message input
- **Real-time streaming** — Socket.io connection to `ai-services` for token-by-token response streaming
- **State management** — Zustand stores for user session, chat history, and Elber status

## Tech stack

- Next.js 16 with App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Zustand (state management)
- Socket.io client (real-time streaming)
- Firebase (authentication)
- React Markdown (message rendering)
- Vitest (testing)

## Project structure

```
src/
├── app/
│   ├── page.tsx            # Landing page
│   ├── login/page.tsx      # Login screen
│   └── chat/
│       ├── layout.tsx      # Chat layout wrapper (socket connection)
│       └── page.tsx        # Main chat view
├── components/
│   ├── AuthProvider.tsx    # Firebase auth state listener
│   ├── landing/            # Hero, Features, Footer
│   └── chat/               # ChatLayout, ChatWindow, Sidebar, MessageList, InputToolBar, MessageBubble, IsWaiting, SidebarItem
├── hooks/
│   ├── useAuthGuard.ts     # Redirects unauthenticated users
│   └── useSocket.ts        # Connects/disconnects socket on mount
├── services/
│   ├── auth.service.ts     # signIn / logOut via Firebase
│   ├── chat.service.ts     # getChats, deleteChat, deleteAllChats (REST → api-gateway)
│   └── socket.service.ts   # SocketManager singleton (connect, sendMessage, cancelMessage)
├── store/
│   ├── useChatStore.ts     # Chats map, selected chat, message stream processing
│   ├── useElberStore.ts    # isWaiting / isStreaming flags
│   └── useUserStore.ts     # Logged-in user profile
├── types/
│   ├── chat.types.ts       # ElberChat, ElberMessage
│   └── elber.types.ts      # ElberRequest
└── lib/
    ├── firebase.ts         # Firebase app + auth init
    └── constants.ts        # BACK_URL, SOCKET_URL from env
```

## Environment variables

Create a `.env.local` file at the root of `web/`:

```
NEXT_PUBLIC_BACK_URL=        # API gateway HTTP URL (e.g. http://localhost:4040)
NEXT_PUBLIC_SOCKET_URL=      # AI services WebSocket URL (e.g. http://localhost:4042)

NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

## Commands

```bash
npm install
npm run dev       # Development server (http://localhost:3000)
npm run build     # Production build
npm start         # Production server
npm test          # Vitest
```

## Socket events

The web client uses the same Socket.io events as the mobile app:

**Client → Server:**
- `user:ask` — sends a message with `{ chatId, text, user, title, timeStamp, timeZone, isVoiceMode, location }`
- `user:cancel` — cancels an in-progress response

**Server → Client:**
- `elber:stream` — token chunk during streaming
- `elber:response` — signals end of response
- `elber:title` — updated chat title after first message
- `elber:error` — error during generation
- `elber:cancelled` — confirms cancellation
