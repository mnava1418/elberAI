import { io, Socket } from 'socket.io-client'
import { SOCKET_URL } from '@/lib/constants'
import { auth } from '@/lib/firebase'
import useChatStore from '@/store/useChatStore'
import useElberStore from '@/store/useElberStore'
import { ElberMessage } from '@/types/chat.types'
import { ElberRequest } from '@/types/elber.types'

class SocketManager {
  private socket: Socket | null = null
  private static instance: SocketManager

  static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager()
    }
    return SocketManager.instance
  }

  disconnect() {
    if (this.socket) {
      this.socket.removeAllListeners()
      this.socket.disconnect()
      this.socket = null
    }
  }

  connect() {
    if (this.socket?.connected) return

    if (this.socket) {
      this.disconnect()
    }

    this.socket = io(SOCKET_URL, {
      path: '/socket.io',
      transports: ['websocket'],
      forceNew: false,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelayMax: 500,
      timeout: 2000,
      auth: async (cb) => {
        const token = await auth.currentUser?.getIdToken(true)
        cb({ token })
      },
    })

    this.socket.on('connect', () => {
      console.info('Connected to socket:', this.socket!.id)
      this.setListeners()
    })

    this.socket.on('disconnect', () => {
      console.info('Disconnected from socket...')
    })

    this.socket.on('connect_error', (err) => {
      console.error('Error connecting to socket:', err.message)
    })
  }

  private setListeners() {
    if (!this.socket?.connected) return

    this.socket.removeAllListeners()

    this.socket.on('elber:stream', (_chatId: number, chunk: string) => {
      useChatStore.getState().processStream(chunk)
      useElberStore.getState().setStreaming(true)
      useElberStore.getState().setWaiting(false)
    })

    this.socket.on('elber:response', () => {
      useElberStore.getState().setStreaming(false)
      useElberStore.getState().setWaiting(false)
    })

    this.socket.on('elber:title', (_chatId: number, text: string) => {
      useChatStore.getState().updateChatTitle(text)
    })

    this.socket.on('elber:error', (chatId: number) => {
      const errorMessage: ElberMessage = {
        id: `assistant:${Date.now()}`,
        createdAt: Date.now(),
        role: 'assistant',
        content: "No manches, se me hizo bolas el engrudo! Dame un minuto pa' recomponerme.",
      }
      useChatStore.getState().addChatMessage(chatId, errorMessage)
      useElberStore.getState().setStreaming(false)
      useElberStore.getState().setWaiting(false)
    })

    this.socket.on('elber:cancelled', () => {
      useElberStore.getState().setStreaming(false)
      useElberStore.getState().setWaiting(false)
    })
  }

  sendMessage(chatId: number, title: string, message: string) {
    const currentUser = auth.currentUser

    if (!this.socket?.connected || !currentUser) {
      const errorMessage: ElberMessage = {
        id: `assistant:${Date.now()}`,
        createdAt: Date.now(),
        role: 'assistant',
        content: '¡Pinche conexión se hizo la desaparecida y nos dejó tirados! Intenta de nuevo.',
      }
      useChatStore.getState().addChatMessage(chatId, errorMessage)
      return
    }

    const timeStamp = new Date().toLocaleString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    })

    const request: ElberRequest = {
      chatId,
      text: message,
      user: {
        name: currentUser.displayName ?? '',
        uid: currentUser.uid,
      },
      title,
      timeStamp,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      isVoiceMode: false,
      location: null,
    }

    this.socket.emit('user:ask', request)
  }

  cancelMessage(chatId: number) {
    if (this.socket?.connected) {
      this.socket.emit('user:cancel', chatId)
    }
  }
}

export default SocketManager
