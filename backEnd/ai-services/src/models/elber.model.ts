export type ElberEvent = 'elber:stream' | 'elber:response' | 'elber:error' |'elber:canceled'

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

export interface ElberRequest {
    role: 'user' | 'assistant',
    content: string
}

export interface ElberMessage extends ElberRequest {
    id: string,
    createdAt: number,
}
