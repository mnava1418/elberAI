export type ElberMessage = {
    id: string,
    createdAt: number,
    role: 'user' | 'assistant',
    content: string
}

export type SelectedMessage = {
    layout: {
        px: number,
        py: number,
        pv: 'right' | 'left'
        height: number,
    },
    message: ElberMessage
}

export type ElberState = {
    isWaiting: boolean
    chatMessages: ElberMessage[],
    selectedMessage: SelectedMessage | null
}

export const initialElberState: ElberState = {
    isWaiting: false,
    chatMessages: [],
    selectedMessage: null
}

const addChatMessage = (state: ElberState, newMessage: ElberMessage): ElberState => {
    const currMessages = state.chatMessages
    return {...state, chatMessages: [newMessage, ...currMessages] }
}

const processStream = (state: ElberState, chunk: string): ElberState => {
    const currMessages = state.chatMessages
    const message = currMessages[0]

    if(message.role === 'user') {
        const timeStamp = new Date().getTime()
        const newMessage: ElberMessage = {
            id: `user:${timeStamp}`,
            createdAt: timeStamp,
            role: 'assistant',
            content: chunk
        }

        return addChatMessage(state, newMessage)

    } else {
        message.content = `${message.content}${chunk}`
        currMessages[0] = message
        return {...state, chatMessages: [...currMessages]}
    }
}

export type ElberAction =
| { type: 'WAITING_FOR_ELBER', isWaiting: boolean }
| { type: 'ADD_CHAT_MESSAGE', newMessage: ElberMessage}
| { type: 'SELECT_CHAT_MESSAGE', selectedMessage: SelectedMessage }
| { type: 'PROCESS_STREAM', chunk: string }
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
        case 'PROCESS_STREAM':
            return processStream(state, action.chunk)
        default:
            return state;
    }
};