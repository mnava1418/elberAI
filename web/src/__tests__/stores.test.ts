import { describe, it, expect, beforeEach } from 'vitest'
import useUserStore from '../store/useUserStore'
import useChatStore from '../store/useChatStore'
import useElberStore from '../store/useElberStore'
import { ElberMessage } from '../types/chat.types'

// Reset store state between tests
beforeEach(() => {
  useUserStore.setState({ profile: null, isLoggedIn: false })
  useChatStore.setState({ chats: new Map(), selectedChatId: -1 })
  useElberStore.setState({ isWaiting: false, isStreaming: false })
})

// --- useUserStore ---
describe('useUserStore', () => {
  it('logIn sets profile and isLoggedIn', () => {
    useUserStore.getState().logIn({ name: 'Martin', email: 'martin@test.com' })
    const { profile, isLoggedIn } = useUserStore.getState()
    expect(isLoggedIn).toBe(true)
    expect(profile?.name).toBe('Martin')
  })

  it('logOut clears state', () => {
    useUserStore.getState().logIn({ name: 'Martin', email: 'martin@test.com' })
    useUserStore.getState().logOut()
    const { profile, isLoggedIn } = useUserStore.getState()
    expect(isLoggedIn).toBe(false)
    expect(profile).toBeNull()
  })
})

// --- useChatStore ---
describe('useChatStore', () => {
  const userMsg: ElberMessage = {
    id: 'user:1',
    createdAt: 1000,
    role: 'user',
    content: 'Hola',
  }

  it('addChatMessage creates chat and sets selectedChatId when chat does not exist', () => {
    useChatStore.getState().addChatMessage(1, userMsg)
    const { chats, selectedChatId } = useChatStore.getState()
    expect(chats.has(1)).toBe(true)
    expect(selectedChatId).toBe(1)
    expect(chats.get(1)?.messages[0].content).toBe('Hola')
  })

  it('addChatMessage prepends message when chat already exists', () => {
    useChatStore.getState().addChatMessage(1, userMsg)
    const secondMsg: ElberMessage = { id: 'user:2', createdAt: 2000, role: 'user', content: 'Segundo' }
    useChatStore.getState().addChatMessage(1, secondMsg)
    const messages = useChatStore.getState().chats.get(1)?.messages
    expect(messages?.[0].content).toBe('Segundo')
    expect(messages?.length).toBe(2)
  })

  it('processStream creates assistant message when last message is user', () => {
    useChatStore.getState().addChatMessage(1, userMsg)
    useChatStore.getState().processStream('Hola ')
    const messages = useChatStore.getState().chats.get(1)?.messages
    expect(messages?.[0].role).toBe('assistant')
    expect(messages?.[0].content).toBe('Hola ')
  })

  it('processStream appends chunk when last message is assistant', () => {
    useChatStore.getState().addChatMessage(1, userMsg)
    useChatStore.getState().processStream('Hola ')
    useChatStore.getState().processStream('mundo')
    const messages = useChatStore.getState().chats.get(1)?.messages
    expect(messages?.[0].content).toBe('Hola mundo')
    expect(messages?.length).toBe(2)
  })

  it('updateChatTitle sets name on selected chat', () => {
    useChatStore.getState().addChatMessage(1, userMsg)
    useChatStore.getState().updateChatTitle('Mi chat')
    expect(useChatStore.getState().chats.get(1)?.name).toBe('Mi chat')
  })

  it('deleteChat removes chat and resets selectedChatId', () => {
    useChatStore.getState().addChatMessage(1, userMsg)
    useChatStore.getState().deleteChat(1)
    expect(useChatStore.getState().chats.has(1)).toBe(false)
    expect(useChatStore.getState().selectedChatId).toBe(-1)
  })

  it('deleteAllChats clears all chats', () => {
    useChatStore.getState().addChatMessage(1, userMsg)
    useChatStore.getState().addChatMessage(2, userMsg)
    useChatStore.getState().deleteAllChats()
    expect(useChatStore.getState().chats.size).toBe(0)
  })

  it('logOut resets state', () => {
    useChatStore.getState().addChatMessage(1, userMsg)
    useChatStore.getState().logOut()
    expect(useChatStore.getState().chats.size).toBe(0)
    expect(useChatStore.getState().selectedChatId).toBe(-1)
  })
})

// --- useElberStore ---
describe('useElberStore', () => {
  it('setWaiting and setStreaming update state', () => {
    useElberStore.getState().setWaiting(true)
    useElberStore.getState().setStreaming(true)
    expect(useElberStore.getState().isWaiting).toBe(true)
    expect(useElberStore.getState().isStreaming).toBe(true)
  })

  it('reset clears both flags', () => {
    useElberStore.getState().setWaiting(true)
    useElberStore.getState().setStreaming(true)
    useElberStore.getState().reset()
    expect(useElberStore.getState().isWaiting).toBe(false)
    expect(useElberStore.getState().isStreaming).toBe(false)
  })
})
