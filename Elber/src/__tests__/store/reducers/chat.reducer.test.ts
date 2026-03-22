import {
  chatReducer,
  initialChatState,
  deleteChat,
  ChatState,
} from '../../../store/reducers/chat.reducer'
import { ElberChat, ElberMessage } from '../../../models/chat.model'

const makeMessage = (overrides: Partial<ElberMessage> = {}): ElberMessage => ({
  id: 'msg-1',
  createdAt: 1000,
  role: 'user',
  content: 'Hello',
  ...overrides,
})

const makeChat = (id: number, messages: ElberMessage[] = []): ElberChat => ({
  id,
  messages,
})

const stateWithChat = (chatId: number, messages: ElberMessage[] = []): ChatState => ({
  ...initialChatState,
  chats: new Map([[chatId, makeChat(chatId, messages)]]),
  selectedChatId: chatId,
})

describe('chatReducer — initial state', () => {
  it('should return initial state for unknown action', () => {
    const state = chatReducer(initialChatState, { type: 'LOG_OUT' })
    expect(state.chats.size).toBe(0)
    expect(state.selectedChatId).toBe(-1)
    expect(state.selectedMessage).toBeNull()
  })
})

describe('chatReducer — LOG_OUT', () => {
  it('should reset to initial state', () => {
    const state = stateWithChat(1, [makeMessage()])
    const result = chatReducer(state, { type: 'LOG_OUT' })
    expect(result.chats.size).toBe(0)
    expect(result.selectedChatId).toBe(-1)
  })
})

describe('chatReducer — SET_CHATS', () => {
  it('should replace chats map', () => {
    const newChats = new Map([[42, makeChat(42)]])
    const result = chatReducer(initialChatState, { type: 'SET_CHATS', chats: newChats })
    expect(result.chats.size).toBe(1)
    expect(result.chats.has(42)).toBe(true)
  })
})

describe('chatReducer — SELECT_CHAT', () => {
  it('should update selectedChatId', () => {
    const result = chatReducer(initialChatState, { type: 'SELECT_CHAT', selectedChatId: 5 })
    expect(result.selectedChatId).toBe(5)
  })
})

describe('chatReducer — SELECT_MESSAGE', () => {
  it('should store selectedMessage', () => {
    const msg = makeMessage()
    const selectedMessage = {
      layout: { px: 10, py: 20, pv: 'right' as const, height: 50 },
      message: msg,
    }
    const result = chatReducer(initialChatState, { type: 'SELECT_MESSAGE', selectedMessage })
    expect(result.selectedMessage).toEqual(selectedMessage)
  })
})

describe('chatReducer — ADD_CHAT_MESSAGE', () => {
  it('should add message to existing chat, prepending it', () => {
    const existing = makeMessage({ id: 'old' })
    const state = stateWithChat(1, [existing])
    const newMessage = makeMessage({ id: 'new', content: 'World' })

    const result = chatReducer(state, { type: 'ADD_CHAT_MESSAGE', chatId: 1, newMessage })

    const messages = result.chats.get(1)!.messages
    expect(messages[0].id).toBe('new')
    expect(messages[1].id).toBe('old')
  })

  it('should create a new chat when chatId does not exist', () => {
    const newMessage = makeMessage({ id: 'first' })
    const result = chatReducer(initialChatState, {
      type: 'ADD_CHAT_MESSAGE',
      chatId: 99,
      newMessage,
    })
    expect(result.chats.has(99)).toBe(true)
    expect(result.selectedChatId).toBe(99)
    expect(result.chats.get(99)!.messages[0].id).toBe('first')
  })
})

describe('chatReducer — PROCESS_STREAM', () => {
  it('should create a new assistant message when first message is from user', () => {
    const userMsg = makeMessage({ role: 'user', content: 'Hi' })
    const state = stateWithChat(1, [userMsg])

    const result = chatReducer(state, { type: 'PROCESS_STREAM', chunk: 'Hello' })

    const messages = result.chats.get(1)!.messages
    expect(messages[0].role).toBe('assistant')
    expect(messages[0].content).toBe('Hello')
  })

  it('should append chunk to existing assistant message', () => {
    const userMsg = makeMessage({ role: 'user', content: 'Hi' })
    const assistantMsg = makeMessage({ id: 'a-1', role: 'assistant', content: 'Hel' })
    const state = stateWithChat(1, [assistantMsg, userMsg])

    const result = chatReducer(state, { type: 'PROCESS_STREAM', chunk: 'lo' })

    const messages = result.chats.get(1)!.messages
    expect(messages[0].content).toBe('Hello')
  })

  it('should accumulate multiple stream chunks', () => {
    const userMsg = makeMessage({ role: 'user', content: 'Question' })
    let state = stateWithChat(1, [userMsg])

    state = chatReducer(state, { type: 'PROCESS_STREAM', chunk: 'Chunk1' })
    state = chatReducer(state, { type: 'PROCESS_STREAM', chunk: ' Chunk2' })
    state = chatReducer(state, { type: 'PROCESS_STREAM', chunk: ' Chunk3' })

    const messages = state.chats.get(1)!.messages
    expect(messages[0].content).toBe('Chunk1 Chunk2 Chunk3')
  })
})

describe('chatReducer — UPDATE_CHAT_TITLE', () => {
  it('should update the name of the selected chat', () => {
    const state = stateWithChat(1, [makeMessage()])
    const result = chatReducer(state, { type: 'UPDATE_CHAT_TITLE', title: 'My Chat' })
    expect(result.chats.get(1)!.name).toBe('My Chat')
  })
})

describe('chatReducer — DELETE_CHAT', () => {
  it('should remove the chat and reset selectedChatId', () => {
    const state = stateWithChat(1, [makeMessage()])
    const result = chatReducer(state, { type: 'DELETE_CHAT', chatId: 1 })
    expect(result.chats.has(1)).toBe(false)
    expect(result.selectedChatId).toBe(-1)
  })

  it('should return unchanged state when chatId does not exist', () => {
    const state = stateWithChat(1, [makeMessage()])
    const result = chatReducer(state, { type: 'DELETE_CHAT', chatId: 999 })
    expect(result.chats.has(1)).toBe(true)
  })
})

describe('chatReducer — DELETE_ALL_CHATS', () => {
  it('should clear all chats and reset selectedChatId', () => {
    const state: ChatState = {
      ...initialChatState,
      chats: new Map([
        [1, makeChat(1)],
        [2, makeChat(2)],
      ]),
      selectedChatId: 1,
    }
    const result = chatReducer(state, { type: 'DELETE_ALL_CHATS' })
    expect(result.chats.size).toBe(0)
    expect(result.selectedChatId).toBe(-1)
  })
})

describe('deleteChat (exported helper)', () => {
  it('should remove chat from state', () => {
    const state = stateWithChat(1, [makeMessage()])
    const result = deleteChat(state, 1)
    expect(result.chats.has(1)).toBe(false)
  })

  it('should return same state when chat does not exist', () => {
    const state = stateWithChat(1, [makeMessage()])
    const result = deleteChat(state, 999)
    expect(result).toBe(state)
  })
})
