export type ElberEvent = 'elber:stream' | 'elber:response' | 'elber:error' | 'elber:title'

export enum ElberAction {
    CHAT_TEXT = 'chat_text'
}

export type ElberResponse = {
    action: ElberAction,
    payload: Record<string, any>
}

export type ElberUser = {
    uid: string,
    name: string,
}

export type ElberRequest = {
    userName: string,
    text: string,
    chatId: number,
    isNewChat: boolean
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