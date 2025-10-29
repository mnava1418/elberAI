import { GiftedChat, IMessage } from "react-native-gifted-chat"

export type SelectedMessage = {
    layout: {
        px: number,
        py: number,
        pv: 'right' | 'left'
        height: number,
    },
    message: IMessage
}

export type ElberState = {
    isWaiting: boolean
    chatMessages: IMessage[],
    selectedMessage: SelectedMessage | null
}

export const initialElberState: ElberState = {
    isWaiting: false,
    chatMessages: [],
    selectedMessage: null
}

const addChatMessage = (state: ElberState, newMessage: IMessage): ElberState => {
    const currMessages = state.chatMessages
    return {...state, chatMessages: GiftedChat.append(currMessages, [newMessage]) }
}

export type ElberAction =
| { type: 'WAITING_FOR_ELBER', isWaiting: boolean }
| { type: 'ADD_CHAT_MESSAGE', newMessage: IMessage}
| { type: 'SELECT_CHAT_MESSAGE', selectedMessage: SelectedMessage }
| { type: 'LOG_OUT' }

export const elberReducer = (state: ElberState, action: ElberAction): ElberState => {
    switch (action.type) {
        case 'WAITING_FOR_ELBER':
            return {...state, isWaiting: action.isWaiting};
        case 'LOG_OUT':
            return { ...initialElberState };
        case 'ADD_CHAT_MESSAGE':
            return addChatMessage(state, action.newMessage)
        case 'SELECT_CHAT_MESSAGE':
            return {...state, selectedMessage: action.selectedMessage}
        default:
            return state;
    }
};