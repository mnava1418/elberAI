import { IMessage } from "react-native-gifted-chat";
import { ElberState } from "../reducers/elber.reducer";

export const selectIsWaitingForElber = (state: ElberState): boolean => state.isWaiting

export const selectChatMessages = (state: ElberState): IMessage[] => state.chatMessages