export type ElberEvent = 'elber:stream' | 'elber:response' | 'elber:error' | 'elber:title'

export enum ElberAction {
    CHAT_TEXT = 'chat_text'
}

export type ElberUser = {
    uid: string,
    name: string,
}

export type ElberRequest = {
    userName: string,
    text: string,
    chatId: number,
    title: string 
}

export type ElberResponse = {
    user: ElberUser,
    originalRequest: ElberRequest,
    agentResponse: string,
    memory: MemoryEntry,
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

export type MemoryEntry = {
    summary: string
    turnsCount: number
    turns: TurnChat[]
}

/***Long Term Memory Types***/

export type MemoryType =
  | "goal"
  | "plan"
  | "preference"
  | "constraint"
  | "profile"
  | "other";

export type MemoryRecord = {
  id: string;
  userId: string;
  roomId: string | null;
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
    userId: string
}