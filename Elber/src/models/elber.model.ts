export enum ElberAction {
    CHAT_TEXT = 'chat_text'
}

export type ElberResponse = {
    action: ElberAction,
    payload: Record<string, any>
}