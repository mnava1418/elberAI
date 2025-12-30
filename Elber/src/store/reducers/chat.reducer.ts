import { ElberChat, ElberMessage } from "../../models/chat.model"

export type SelectedMessage = {
    layout: {
        px: number,
        py: number,
        pv: 'right' | 'left'
        height: number,
    },
    message: ElberMessage
}

export type ChatState = {
    chats: Map<number, ElberChat>
    selectedChatId: number
    selectedMessage: SelectedMessage | null
}

export const initialChatState: ChatState = {
    chats: new Map<number, ElberChat>(),
    selectedChatId: -1,
    selectedMessage: null
}

export type ChatAction =
| { type: 'SET_CHATS', chats: Map<number, ElberChat> }
| { type: 'SELECT_CHAT', selectedChatId: number}
| { type: 'SELECT_MESSAGE', selectedMessage: SelectedMessage}
| { type: 'LOG_OUT' }

export const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
    switch (action.type) {
        case 'LOG_OUT':
            return {...initialChatState}
        case 'SET_CHATS':
            return {...state, chats: action.chats}
        case 'SELECT_CHAT':
            return {...state, selectedChatId: action.selectedChatId}
        case 'SELECT_MESSAGE':
            return {...state, selectedMessage: action.selectedMessage}
        default:
            return state;
    }
}