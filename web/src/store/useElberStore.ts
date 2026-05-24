import { create } from 'zustand'

interface ElberStore {
  isWaiting: boolean
  isStreaming: boolean
  isTalking: boolean
  voiceMode: boolean
  setWaiting: (value: boolean) => void
  setStreaming: (value: boolean) => void
  setTalking: (value: boolean) => void
  setVoiceMode: (value: boolean) => void
  reset: () => void
}

const useElberStore = create<ElberStore>((set) => ({
  isWaiting: false,
  isStreaming: false,
  isTalking: false,
  voiceMode: false,
  setWaiting: (value) => set({ isWaiting: value }),
  setStreaming: (value) => set({ isStreaming: value }),
  setTalking: (value) => set({ isTalking: value }),
  setVoiceMode: (value) => set({ voiceMode: value }),
  reset: () => set({ isWaiting: false, isStreaming: false, isTalking: false }),
}))

export default useElberStore
