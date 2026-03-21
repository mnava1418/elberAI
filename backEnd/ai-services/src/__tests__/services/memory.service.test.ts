import { handleMemory } from '../../services/memory.service'
import { run } from '@openai/agents'
import MidTermMemory from '../../models/midTermMemory.model'
import ShortTermMemory from '../../models/shortTermMemory.model'
import LongTermMemory from '../../models/longTermMemory.model'
import * as chatService from '../../services/chat.service'
import { ElberResponse } from '../../models/elber.model'

jest.mock('@openai/agents', () => ({
  __esModule: true,
  run: jest.fn(),
  withTrace: jest.fn(),
  tool: jest.fn((c: any) => c),
  OpenAIConversationsSession: jest.fn(() => ({})),
}))

jest.mock('../../models/midTermMemory.model', () => ({
  __esModule: true,
  default: { getInstance: jest.fn() },
}))

jest.mock('../../models/shortTermMemory.model', () => ({
  __esModule: true,
  default: { getInstance: jest.fn() },
}))

jest.mock('../../models/longTermMemory.model')

jest.mock('../../services/chat.service')

jest.mock('../../agents', () => ({
  __esModule: true,
  default: {
    memory: {
      summary: jest.fn().mockReturnValue('summary-agent'),
      relevantInfo: jest.fn().mockReturnValue('relevantInfo-agent'),
      ltm: jest.fn().mockReturnValue('ltm-agent'),
    },
  },
}))

jest.mock('../../config/index.config', () => ({
  gateway: { secret: 'test' },
  openaiCfg: { cred: 'test' },
  postgres: { db: 'postgresql://test' },
  firebase: { cred: '/fake', db: 'https://test.db' },
  serper: { searchURL: 'https://serper.dev', secret: 'test' },
}))

jest.mock('../../services/ltm/ltmDB.service', () => ({ pgPool: { query: jest.fn() } }))
jest.mock('../../services/ltm/vectoreStore.service')
jest.mock('../../services/ltm/ltmReader.service')
jest.mock('../../services/ltm/ltmWriter.service')

const buildElberResponse = (turnsCount: number): ElberResponse => ({
  conversationId: 'user1_1',
  agentResponse: 'Elber response',
  originalRequest: {
    user: { uid: 'user1', name: 'Martin' },
    text: 'user message',
    chatId: 1,
    title: 'Chat Nuevo',
    timeStamp: '2026-01-01',
    timeZone: 'America/Mexico_City',
  },
  memory: { summary: 'current summary', turnsCount, turns: [] },
})

describe('memory.service', () => {
  const mockAddTurn = jest.fn()
  const mockFormatTurns = jest.fn()
  const mockUpdateSummary = jest.fn()
  const mockDeleteSession = jest.fn()
  const mockIngestLTM = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()

    ;(MidTermMemory.getInstance as jest.Mock).mockReturnValue({
      addTurn: mockAddTurn,
      formatTurns: mockFormatTurns.mockReturnValue('Turn 1\n User: hello\n Elber: hi'),
      updateSummary: mockUpdateSummary,
    })

    ;(ShortTermMemory.getInstance as jest.Mock).mockReturnValue({
      deleteSession: mockDeleteSession,
    })

    mockIngestLTM.mockResolvedValue(undefined)
    ;(LongTermMemory as jest.Mock).mockImplementation(() => ({
      ingestLTM: mockIngestLTM,
    }))

    ;(chatService.updateChatSummary as jest.Mock).mockResolvedValue(undefined)
  })

  describe('handleMemory', () => {
    it('should always call addTurn with conversationId, text, and agent response', () => {
      ;(run as jest.Mock).mockResolvedValue({ finalOutput: null })
      handleMemory(buildElberResponse(3))

      expect(mockAddTurn).toHaveBeenCalledWith('user1_1', 'user message', 'Elber response')
    })

    it('should fire handleUserRelevantInformation when turnsCount < 8', async () => {
      ;(run as jest.Mock).mockResolvedValue({ finalOutput: { isRelevant: false } })
      handleMemory(buildElberResponse(3))

      await new Promise((r) => setImmediate(r))
      expect(run).toHaveBeenCalledWith('relevantInfo-agent', 'user message')
    })

    it('should fire generateSummary when turnsCount >= 8', async () => {
      ;(run as jest.Mock).mockResolvedValue({ finalOutput: 'new summary' })
      handleMemory(buildElberResponse(8))

      await new Promise((r) => setImmediate(r))
      expect(run).toHaveBeenCalledWith('summary-agent', expect.any(String), expect.objectContaining({ maxTurns: 3 }))
    })

    it('should update MTM summary and delete STM session after generateSummary', async () => {
      ;(run as jest.Mock).mockResolvedValue({ finalOutput: 'new summary text' })
      handleMemory(buildElberResponse(8))

      await new Promise((r) => setImmediate(r))

      expect(mockUpdateSummary).toHaveBeenCalledWith('user1_1', 'new summary text')
      expect(mockDeleteSession).toHaveBeenCalledWith('user1_1')
      expect(chatService.updateChatSummary).toHaveBeenCalledWith('user1', 1, 'new summary text')
    })

    it('should extract LTM when relevantInfo isRelevant is true', async () => {
      ;(run as jest.Mock)
        .mockResolvedValueOnce({
          finalOutput: { isRelevant: true, reasoning: 'User likes tacos' },
        })
        .mockResolvedValueOnce({
          finalOutput: { memories: [{ text: 'likes tacos', type: 'preference', importance: 4 }] },
        })

      handleMemory(buildElberResponse(3))
      await new Promise((r) => setImmediate(r))

      expect(mockIngestLTM).toHaveBeenCalled()
    })
  })
})
