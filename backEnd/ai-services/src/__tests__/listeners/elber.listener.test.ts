import elberListener from '../../listeners/elber.listener'
import * as elberService from '../../services/elber.service'
import * as chatService from '../../services/chat.service'

jest.mock('../../services/elber.service')
jest.mock('../../services/chat.service')

jest.mock('../../config/index.config', () => ({
  gateway: { secret: 'test' },
  firebase: { cred: '/fake', db: 'https://test.db' },
  openaiCfg: { cred: 'test' },
  postgres: { db: 'postgresql://test' },
  serper: { searchURL: 'https://serper.dev', secret: 'test' },
  aws: { id: 'test', secret: 'test' },
}))

jest.mock('firebase-admin', () => ({
  __esModule: true,
  default: { auth: jest.fn(), database: jest.fn() },
}))

jest.mock('@openai/agents', () => ({
  __esModule: true,
  run: jest.fn(),
  withTrace: jest.fn(),
  tool: jest.fn((c: any) => c),
  OpenAIConversationsSession: jest.fn(() => ({})),
}))

jest.mock('../../services/ltm/ltmDB.service', () => ({ pgPool: { query: jest.fn() } }))
jest.mock('../../services/ltm/vectoreStore.service')
jest.mock('../../services/ltm/ltmReader.service')
jest.mock('../../services/ltm/ltmWriter.service')
jest.mock('../../models/longTermMemory.model')

const createMockSocket = (uid: string) => {
  const handlers: Record<string, Function> = {}
  return {
    data: { user: { uid } },
    on: jest.fn((event: string, handler: Function) => {
      handlers[event] = handler
    }),
    emit: jest.fn(),
    _trigger: (event: string, ...args: any[]) => handlers[event]?.(...args),
  }
}

describe('elberListener', () => {
  let mockSocket: ReturnType<typeof createMockSocket>

  const basePayload = {
    user: { uid: 'user1', name: 'Martin' },
    text: 'Hola Elber',
    chatId: 42,
    title: 'Chat Nuevo',
    timeStamp: '2026-01-01',
    timeZone: 'America/Mexico_City',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockSocket = createMockSocket('user1')
    ;(chatService.saveChatMessage as jest.Mock).mockResolvedValue(undefined)
    ;(elberService.chat as jest.Mock).mockResolvedValue(undefined)
  })

  it('should register handlers for user:ask and user:cancel', () => {
    elberListener(mockSocket as any)
    expect(mockSocket.on).toHaveBeenCalledWith('user:ask', expect.any(Function))
    expect(mockSocket.on).toHaveBeenCalledWith('user:cancel', expect.any(Function))
  })

  describe('user:ask', () => {
    it('should save the user message and call chat service', async () => {
      elberListener(mockSocket as any)
      mockSocket._trigger('user:ask', { ...basePayload })

      await new Promise((r) => setImmediate(r))

      expect(chatService.saveChatMessage).toHaveBeenCalledWith('user1', 42, 'user', 'Hola Elber')
      expect(elberService.chat).toHaveBeenCalledWith(
        expect.objectContaining({ text: 'Hola Elber', chatId: 42 }),
        expect.any(Function),
        expect.any(AbortController)
      )
    })

    it('should override payload uid with the socket uid', async () => {
      elberListener(mockSocket as any)
      const payload = { ...basePayload, user: { uid: 'other-uid', name: 'Someone' } }
      mockSocket._trigger('user:ask', payload)

      await new Promise((r) => setImmediate(r))

      expect(elberService.chat).toHaveBeenCalledWith(
        expect.objectContaining({ user: expect.objectContaining({ uid: 'user1' }) }),
        expect.any(Function),
        expect.any(AbortController)
      )
    })

    it('emitChatResponse should emit via socket', async () => {
      elberListener(mockSocket as any)

      let capturedEmit: Function | undefined
      ;(elberService.chat as jest.Mock).mockImplementation((_req, emit) => {
        capturedEmit = emit
        return Promise.resolve()
      })

      mockSocket._trigger('user:ask', { ...basePayload })
      await new Promise((r) => setImmediate(r))

      capturedEmit?.('elber:stream', 42, 'Hello')

      expect(mockSocket.emit).toHaveBeenCalledWith('elber:stream', 42, 'Hello')
    })

    it('should clean up the AbortController after chat resolves', async () => {
      elberListener(mockSocket as any)
      mockSocket._trigger('user:ask', { ...basePayload })
      await new Promise((r) => setImmediate(r))

      expect(() => mockSocket._trigger('user:cancel', 42)).not.toThrow()
    })
  })

  describe('user:cancel', () => {
    it('should abort the controller for the given chatId', async () => {
      let capturedAbort: AbortController | undefined
      ;(elberService.chat as jest.Mock).mockImplementation((_req, _emit, abortController) => {
        capturedAbort = abortController
        return new Promise(() => {}) // never resolves — keeps the chat active
      })

      elberListener(mockSocket as any)
      mockSocket._trigger('user:ask', { ...basePayload })

      await new Promise((r) => setImmediate(r))

      expect(capturedAbort?.signal.aborted).toBe(false)
      mockSocket._trigger('user:cancel', 42)
      expect(capturedAbort?.signal.aborted).toBe(true)
    })

    it('should be a no-op when chatId has no active controller', () => {
      elberListener(mockSocket as any)
      expect(() => mockSocket._trigger('user:cancel', 999)).not.toThrow()
    })
  })
})
