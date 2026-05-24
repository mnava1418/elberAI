import useElberStore from '@/store/useElberStore'

class AudioQueue {
  private static instance: AudioQueue
  private queue: string[] = []
  private isPlaying = false
  private cancelled = false
  private currentAudio: HTMLAudioElement | null = null
  private currentUrl: string | null = null

  static getInstance(): AudioQueue {
    if (!AudioQueue.instance) {
      AudioQueue.instance = new AudioQueue()
    }
    return AudioQueue.instance
  }

  addChunk(base64: string): void {
    if (this.cancelled) return
    this.queue.push(base64)
    if (!this.isPlaying) {
      this.playNext()
    }
  }

  stop(): void {
    this.cancelled = true
    this.queue = []
    this.isPlaying = false
    if (this.currentAudio) {
      this.currentAudio.pause()
      this.currentAudio = null
    }
    if (this.currentUrl) {
      URL.revokeObjectURL(this.currentUrl)
      this.currentUrl = null
    }
    useElberStore.getState().setTalking(false)
  }

  reset(): void {
    this.cancelled = false
  }

  private playNext(): void {
    if (this.cancelled || this.queue.length === 0) {
      this.isPlaying = false
      if (!this.cancelled) {
        useElberStore.getState().setTalking(false)
      }
      return
    }

    this.isPlaying = true
    const base64 = this.queue.shift()!

    try {
      const binary = atob(base64)
      const bytes = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i)
      }
      const blob = new Blob([bytes], { type: 'audio/mpeg' })
      const url = URL.createObjectURL(blob)
      this.currentUrl = url

      const audio = new Audio(url)
      this.currentAudio = audio

      audio.onended = () => {
        URL.revokeObjectURL(url)
        this.currentUrl = null
        this.currentAudio = null
        this.playNext()
      }

      audio.onerror = () => {
        URL.revokeObjectURL(url)
        this.currentUrl = null
        this.currentAudio = null
        this.playNext()
      }

      audio.play().catch(() => {
        URL.revokeObjectURL(url)
        this.currentUrl = null
        this.currentAudio = null
        this.playNext()
      })
    } catch {
      this.playNext()
    }
  }
}

export default AudioQueue
