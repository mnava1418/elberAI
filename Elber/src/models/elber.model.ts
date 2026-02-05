export enum ElberAction {
    CHAT_TEXT = 'chat_text'
}

export type ElberChatResponse = {
    chatId: number
    text: string
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
    timeStamp: string
}

export type ElberEvent = 'elber:stream' | 'elber:response' | 'elber:error' | 'elber:title'