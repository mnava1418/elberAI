export enum ElberAction {
    CHAT_TEXT = 'chat_text'
}

export type ElberChatResponse = {
    chatId: number
    text: string
}

export type ElberRequest = {
    userName: string,
    text: string,
    chatId: number,
    title: string
}

export type ElberEvent = 'elber:stream' | 'elber:response' | 'elber:error' | 'elber:title'