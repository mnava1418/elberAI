import {
  selectChats,
  selectChatInfo,
  selectMessage,
  getSelectedChatId,
} from '../../../store/selectors/chat.selector'
import { initialChatState, ChatState, SelectedMessage } from '../../../store/reducers/chat.reducer'
import { ElberChat, ElberMessage } from '../../../models/chat.model'

const makeMessage = (): ElberMessage => ({
  id: 'msg-1',
  createdAt: 1000,
  role: 'user',
  content: 'Hello',
})

const makeChat = (id: number): ElberChat => ({
  id,
  name: `Chat ${id}`,
  messages: [makeMessage()],
})

describe('selectChats', () => {
  it('should return the chats map', () => {
    const chats = new Map([[1, makeChat(1)]])
    const state: ChatState = { ...initialChatState, chats }
    expect(selectChats(state)).toBe(chats)
  })

  it('should return empty map for initial state', () => {
    expect(selectChats(initialChatState).size).toBe(0)
  })
})

describe('selectChatInfo', () => {
  it('should return default chat info when selectedChatId is -1', () => {
    const result = selectChatInfo(initialChatState)
    expect(result.id).toBe(-1)
    expect(result.name).toBe('Chat Nuevo')
    expect(result.messages).toEqual([])
  })

  it('should return default chat info when selectedChatId is not in chats', () => {
    const state: ChatState = { ...initialChatState, selectedChatId: 99 }
    const result = selectChatInfo(state)
    expect(result.id).toBe(-1)
  })

  it('should return the selected chat when it exists', () => {
    const chat = makeChat(5)
    const state: ChatState = {
      ...initialChatState,
      chats: new Map([[5, chat]]),
      selectedChatId: 5,
    }
    const result = selectChatInfo(state)
    expect(result.id).toBe(5)
    expect(result.name).toBe('Chat 5')
  })
})

describe('selectMessage', () => {
  it('should return null when no message is selected', () => {
    expect(selectMessage(initialChatState)).toBeNull()
  })

  it('should return the selected message', () => {
    const selectedMessage: SelectedMessage = {
      layout: { px: 10, py: 20, pv: 'right', height: 50 },
      message: makeMessage(),
    }
    const state: ChatState = { ...initialChatState, selectedMessage }
    expect(selectMessage(state)).toEqual(selectedMessage)
  })
})

describe('getSelectedChatId', () => {
  it('should return -1 for initial state', () => {
    expect(getSelectedChatId(initialChatState)).toBe(-1)
  })

  it('should return the selected chat id', () => {
    const state: ChatState = { ...initialChatState, selectedChatId: 7 }
    expect(getSelectedChatId(state)).toBe(7)
  })
})
