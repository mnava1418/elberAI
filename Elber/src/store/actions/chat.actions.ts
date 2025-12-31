import { ElberChat, ElberMessage } from "../../models/chat.model";
import { ChatAction, SelectedMessage } from "../reducers/chat.reducer";

export const logOutChat = (): ChatAction => ({
    type: 'LOG_OUT'
})

export const setChats = (chats: Map<number, ElberChat>): ChatAction => ({
    type: 'SET_CHATS',
    chats
})

export const selectChat = (selectedChatId: number): ChatAction => ({
    type: 'SELECT_CHAT',
    selectedChatId
})

export const selectMessage = (selectedMessage: SelectedMessage): ChatAction => ({
    type: 'SELECT_MESSAGE',
    selectedMessage
})

export const addChatMessage = (chatId: number, newMessage: ElberMessage): ChatAction => ({
    type: 'ADD_CHAT_MESSAGE',
    chatId,
    newMessage
})

export const processStream = (chunk: string): ChatAction => ({
    type: 'PROCESS_STREAM',
    chunk
})