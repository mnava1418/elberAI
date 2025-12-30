import { ElberChat } from "../../models/chat.model";
import { ChatAction } from "../reducers/chat.reducer";

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