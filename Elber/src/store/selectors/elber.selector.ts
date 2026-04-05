import { AlertProps, ElberState } from "../reducers/elber.reducer";

export const selectIsWaitingForElber = (state: ElberState): boolean => state.isWaiting

export const selectElberIsStreaming = (state: ElberState): boolean => state.isStreaming

export const selectAlert = (state: ElberState): AlertProps => state.alert

export const selectVoiceMode = (state: ElberState): boolean => state.voiceMode

export const selectElberIsTalking = (state: ElberState): boolean => state.isTalking