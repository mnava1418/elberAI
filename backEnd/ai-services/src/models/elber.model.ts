export type ElberEvent = 'elber:stream' | 'elber:response' | 'elber:error' | 'elber:title' | 'elber:cancelled' | 'elber:audio_chunk' | 'elber:audio_end'

export enum ElberAction {
    CHAT_TEXT = 'chat_text'
}

export type ElberUser = {
    uid: string,
    name: string,
}

export type ElberRequest = {
    user: ElberUser,
    text: string,
    chatId: number,
    title: string
    timeStamp: string,
    timeZone: string,
    isVoiceMode: boolean,
    location: { lat: number, lon: number }
}

export type ElberResponse = {
    originalRequest: ElberRequest,
    agentResponse: string,
    conversationId: string
}

export type ElberRole = 'user' | 'assistant'

export type ElberMessage = {
    id: string,
    createdAt: number,
    role: 'user' | 'assistant',
    content: string
}

export type ElberChat = {
    name?: string
    id: number
    messages: ElberMessage[]
}

export type TurnChat = {
    userMessage: string,
    assistantMessage: string, 
}

export type MemoryState = 'COLLECTING' | 'SUMMARIZING'

export type MemoryEntry = {
    summary: string
    turns: TurnChat[]
    tokenCount: number
    state: MemoryState
}

/***Long Term Memory Types***/

export type MemoryType =
  | "goal"
  | "plan"
  | "preference"
  | "constraint"
  | "profile"
  | "project"
  | "event"
  | "other";

export type MemoryRecord = {
  id: string;
  userId: string;
  roomId: string | null;
  subject: string | null;
  type: MemoryType;
  importance: number; // 1-5
  text: string;
  createdAt: string;
  updatedAt: string;
};

export type MemoryHit = MemoryRecord & {
  score: number; // 0-1 (más alto = más relevante)
};

export type UserContext = {
    userId: string,
    timeZone: string,
    location: { lat: number, lon: number }
}

export type UserData = {
    type: MemoryType,
    importance: number,
    info: string,
    updatedAt: string
}