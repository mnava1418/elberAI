import { AlertProps, ElberMessage, ElberState, SelectedMessage } from "../reducers/elber.reducer";

export const selectIsWaitingForElber = (state: ElberState): boolean => state.isWaiting

export const selectChatMessages = (state: ElberState): ElberMessage[] => state.chatMessages

export const selectSelectedChatMessage = (state: ElberState): SelectedMessage | null => state.selectedMessage

export const selectElberIsStreaming = (state: ElberState): boolean => state.isStreaming

export const selectAlert = (state: ElberState): AlertProps => state.alert