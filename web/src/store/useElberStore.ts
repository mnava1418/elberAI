import { create } from 'zustand'

interface ElberStore {
  isWaiting: boolean
  isStreaming: boolean
  setWaiting: (value: boolean) => void
  setStreaming: (value: boolean) => void
  reset: () => void
}

const useElberStore = create<ElberStore>((set) => ({
  isWaiting: false,
  isStreaming: false,
  setWaiting: (value) => set({ isWaiting: value }),
  setStreaming: (value) => set({ isStreaming: value }),
  reset: () => set({ isWaiting: false, isStreaming: false }),
}))

export default useElberStore
