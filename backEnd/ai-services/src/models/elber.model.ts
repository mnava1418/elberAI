export type ElberEvent = 'elber:stream' | 'elber:response' | 'elber:error'

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
    conversationId: string
}
