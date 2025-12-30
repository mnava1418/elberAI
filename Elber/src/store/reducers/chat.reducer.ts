import { ElberChat } from "../../models/chat.model"

export type ChatState = {
    chats: Map<number, ElberChat>
}

export const initialChatState: ChatState = {
    chats: new Map<number, ElberChat>()
}

export type ChatAction =
| { type: 'SET_CHATS', chats: Map<number, ElberChat> }
| { type: 'LOG_OUT' }

export const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
    switch (action.type) {
        case 'LOG_OUT':
            return {...initialChatState}
        case 'SET_CHATS':
            return {...state, chats: action.chats}
        default:
            return state;
    }
}