import { create } from 'zustand'
import { ElberChat, ElberMessage } from '@/types/chat.types'

interface ChatStore {
  chats: Map<number, ElberChat>
  selectedChatId: number
  setChats: (chats: Map<number, ElberChat>) => void
  selectChat: (chatId: number) => void
  addChatMessage: (chatId: number, message: ElberMessage) => void
  processStream: (chunk: string) => void
  updateChatTitle: (title: string) => void
  deleteChat: (chatId: number) => void
  deleteAllChats: () => void
  logOut: () => void
}

const useChatStore = create<ChatStore>((set) => ({
  chats: new Map(),
  selectedChatId: -1,

  setChats: (chats) => set({ chats }),

  selectChat: (chatId) => set({ selectedChatId: chatId }),

  addChatMessage: (chatId, message) =>
    set((state) => {
      const newChats = new Map(state.chats)

      if (newChats.has(chatId)) {
        const currChat = newChats.get(chatId) as ElberChat
        newChats.set(chatId, { ...currChat, messages: [message, ...currChat.messages] })
        return { chats: newChats }
      } else {
        newChats.set(chatId, { id: chatId, messages: [message] })
        return { chats: newChats, selectedChatId: chatId }
      }
    }),

  processStream: (chunk) =>
    set((state) => {
      const newChats = new Map(state.chats)
      const currChat = newChats.get(state.selectedChatId) as ElberChat
      const chatMessages = [...currChat.messages]
      const message = chatMessages[0]

      if (message.role === 'user') {
        const timeStamp = Date.now()
        const newMessage: ElberMessage = {
          id: `assistant: ${timeStamp}`,
          createdAt: timeStamp,
          role: 'assistant',
          content: chunk,
        }
        const updatedChats = new Map(newChats)
        updatedChats.set(state.selectedChatId, {
          ...currChat,
          messages: [newMessage, ...currChat.messages],
        })
        return { chats: updatedChats }
      } else {
        message.content = `${message.content}${chunk}`
        chatMessages[0] = message
        currChat.messages = [...chatMessages]
        newChats.set(state.selectedChatId, currChat)
        return { chats: newChats }
      }
    }),

  updateChatTitle: (title) =>
    set((state) => {
      const newChats = new Map(state.chats)
      const currChat = newChats.get(state.selectedChatId) as ElberChat
      newChats.set(state.selectedChatId, { ...currChat, name: title })
      return { chats: newChats }
    }),

  deleteChat: (chatId) =>
    set((state) => {
      if (!state.chats.has(chatId)) return state
      const newChats = new Map(state.chats)
      newChats.delete(chatId)
      return { chats: newChats, selectedChatId: -1 }
    }),

  deleteAllChats: () => set({ chats: new Map(), selectedChatId: -1 }),

  logOut: () => set({ chats: new Map(), selectedChatId: -1 }),
}))

export default useChatStore
