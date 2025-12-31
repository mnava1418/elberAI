import { ElberChat } from "../../models/chat.model";
import { ChatState, SelectedMessage } from "../reducers/chat.reducer";

export const selectChats = (state: ChatState): Map<number, ElberChat> => state.chats

export const selectChatInfo = (state: ChatState): ElberChat => {
    if(state.selectedChatId === -1 || !state.chats.has(state.selectedChatId)) {
        return {
            id: -1,
            name: 'Chat Nuevo',
            messages: []
        }
    } else {
        return state.chats.get(state.selectedChatId) as ElberChat
    }
}

export const selectMessage = (state: ChatState): SelectedMessage | null => state.selectedMessage

export const getSelectedChatId = (state: ChatState): number => state.selectedChatId