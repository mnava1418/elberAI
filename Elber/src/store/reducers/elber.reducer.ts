import { GiftedChat, IMessage } from "react-native-gifted-chat"

export type ElberState = {
    isWaiting: boolean
    chatMessages: IMessage[]
}

export const initialElberState: ElberState = {
    isWaiting: false,
    chatMessages: []
}

const addChatMessage = (state: ElberState, newMessage: IMessage): ElberState => {
    const currMessages = state.chatMessages
    return {...state, chatMessages: GiftedChat.append(currMessages, [newMessage]) }
}

export type ElberAction =
| { type: 'WAITING_FOR_ELBER', isWaiting: boolean }
| { type: 'ADD_CHAT_MESSAGE', newMessage: IMessage}
| { type: 'LOG_OUT' }

export const elberReducer = (state: ElberState, action: ElberAction): ElberState => {
    switch (action.type) {
        case 'WAITING_FOR_ELBER':
            return {...state, isWaiting: action.isWaiting};
        case 'LOG_OUT':
            return { ...initialElberState };
        case 'ADD_CHAT_MESSAGE':
            return addChatMessage(state, action.newMessage)
        default:
            return state;
    }
};