export enum ElberAction {
    CHAT_TEXT = 'chat_text'
}

export type ElberResponse = {
    action: ElberAction,
    payload: Record<string, any>
}

export type ElberRequest = {
    userName: string,
    text: string,
    chatId: number
}

export type ElberEvent = 'elber:stream' | 'elber:response' | 'elber:error'