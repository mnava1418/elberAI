import { ElberChat } from "../../models/chat.model";
import { ChatState } from "../reducers/chat.reducer";

export const selectChats = (state: ChatState): Map<number, ElberChat> => state.chats