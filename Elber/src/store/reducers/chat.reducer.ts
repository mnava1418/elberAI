import { ElberChat } from "../../models/chat.model"

export type ChatState = {
    chats: Map<number, ElberChat>
    selectedChatId: number
}

export const initialChatState: ChatState = {
    chats: new Map<number, ElberChat>(),
    selectedChatId: -1
}

export type ChatAction =
| { type: 'SET_CHATS', chats: Map<number, ElberChat> }
| { type: 'SELECT_CHAT', selectedChatId: number}
| { type: 'LOG_OUT' }

export const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
    switch (action.type) {
        case 'LOG_OUT':
            return {...initialChatState}
        case 'SET_CHATS':
            return {...state, chats: action.chats}
        case 'SELECT_CHAT':
            return {...state, selectedChatId: action.selectedChatId}
        default:
            return state;
    }
}