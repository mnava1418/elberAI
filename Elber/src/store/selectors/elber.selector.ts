import { ElberMessage, ElberState, SelectedMessage } from "../reducers/elber.reducer";

export const selectIsWaitingForElber = (state: ElberState): boolean => state.isWaiting

export const selectChatMessages = (state: ElberState): ElberMessage[] => state.chatMessages

export const selectSelectedChatMessage = (state: ElberState): SelectedMessage | null => state.selectedMessage