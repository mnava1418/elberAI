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

export const deleteChat = (state: ChatState, chatId: number): ChatState => {
    if(!state.chats.has(chatId)) {
        return state
    }

    const newChats = new Map(state.chats)
    newChats.delete(chatId)
    return {...state, chats: newChats, selectedChatId: -1}
}

const addChatMessage = (state: ChatState, chatId: number, newMessage: ElberMessage): ChatState => {
    if(state.chats.has(chatId)) {
        const newChats = new Map(state.chats)
        const currChat = newChats.get(chatId) as ElberChat
        
        const updatedChat: ElberChat = {
            ...currChat,
            messages: [newMessage, ...currChat.messages]
        }
        
        newChats.set(chatId, updatedChat)
        return {...state, chats: newChats}
    } else {
        return createChat(state, chatId, newMessage )
    }
}

const createChat = (state: ChatState, chatId: number, newMessage: ElberMessage): ChatState => {
    const newChats = new Map(state.chats)
    const newChat: ElberChat = {
        id: chatId,
        messages: [newMessage]
    }

    newChats.set(chatId, newChat)
    return {...state, chats: newChats, selectedChatId: chatId}
}

const processChatStream = (state: ChatState, chunk: string): ChatState => {
    const newChats = new Map(state.chats)
    const currChat = newChats.get(state.selectedChatId) as ElberChat
    const chatMessages = [...currChat.messages]
    const message = chatMessages[0]

    if(message.role == "user") {
        const timeStamp = Date.now()
        const newMessage: ElberMessage = {
            id: `assistant: ${timeStamp}`,
            createdAt: timeStamp,
            role: 'assistant',
            content: chunk
        }

        return addChatMessage(state, state.selectedChatId, newMessage)
    } else {
        message.content = `${message.content}${chunk}`
        chatMessages[0] = message
        currChat.messages = [...chatMessages]
        newChats.set(state.selectedChatId, currChat)
        return {...state, chats: newChats}
    }
}

const updateChatTitle = (state: ChatState, title: string): ChatState => {
    const newChats = new Map(state.chats)
    const currChat = newChats.get(state.selectedChatId) as ElberChat
    currChat.name = title
    newChats.set(state.selectedChatId, currChat)
    return {...state, chats: newChats}
}

export type ChatAction =
| { type: 'SET_CHATS', chats: Map<number, ElberChat> }
| { type: 'SELECT_CHAT', selectedChatId: number }
| { type: 'SELECT_MESSAGE', selectedMessage: SelectedMessage }
| { type: 'ADD_CHAT_MESSAGE', chatId: number, newMessage: ElberMessage }
| { type: 'PROCESS_STREAM', chunk: string }
| { type: 'UPDATE_CHAT_TITLE', title: string }
| { type: 'DELETE_CHAT', chatId: number }
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
        case 'ADD_CHAT_MESSAGE':
            return addChatMessage(state, action.chatId, action.newMessage)
        case 'PROCESS_STREAM':
            return processChatStream(state, action.chunk)
        case 'UPDATE_CHAT_TITLE':
            return updateChatTitle(state, action.title)
        case 'DELETE_CHAT':
            return deleteChat(state, action.chatId)
        default:
            return state;
    }
}