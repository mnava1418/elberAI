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