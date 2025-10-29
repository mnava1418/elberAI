import { IMessage } from "react-native-gifted-chat";
import { ElberState, SelectedMessage } from "../reducers/elber.reducer";

export const selectIsWaitingForElber = (state: ElberState): boolean => state.isWaiting

export const selectChatMessages = (state: ElberState): IMessage[] => state.chatMessages

export const selectSelectedChatMessage = (state: ElberState): SelectedMessage | null => state.selectedMessage