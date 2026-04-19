import { handleMemory } from '../../services/memory.service'
import { run } from '@openai/agents'
import MidTermMemory from '../../models/midTermMemory.model'
import ShortTermMemory from '../../models/shortTermMemory.model'
import LongTermMemory from '../../models/longTermMemory.model'
import * as chatService from '../../services/chat.service'
import { ElberResponse } from '../../models/elber.model'
import { getAgents } from '../../loaders/agents.loader'

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

jest.mock('../../loaders/agents.loader', () => ({
  __esModule: true,
  getAgents: jest.fn(),
  default: jest.fn(),
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

const buildElberResponse = (): ElberResponse => ({
  conversationId: 'user1_1',
  agentResponse: 'Elber response',
  originalRequest: {
    user: { uid: 'user1', name: 'Martin' },
    text: 'user message',
    chatId: 1,
    title: 'Chat Nuevo',
    timeStamp: '2026-01-01',
    timeZone: 'America/Mexico_City',
    isVoiceMode: false
  },
})

const mockSummaryAgent = { name: 'chat_summary' }
const mockUserInfoAgent = { name: 'user_info' }
const mockLongMemoryAgent = { name: 'long_memory' }

describe('memory.service', () => {
  const mockAddTurn = jest.fn().mockResolvedValue(undefined)
  const mockFormatTurns = jest.fn().mockReturnValue('Turn 1\n User: hello\n Elber: hi')
  const mockFormatLastTurns = jest.fn().mockReturnValue('Usuario: user message\n Elber: Elber response')
  const mockUpdateSummary = jest.fn().mockResolvedValue(undefined)
  const mockShouldSummarize = jest.fn()
  const mockStartSummarizing = jest.fn()
  const mockResetToCollecting = jest.fn()
  const mockGetSummary = jest.fn().mockReturnValue('current summary')
  const mockDeleteSession = jest.fn()
  const mockIngestLTM = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()

    ;(getAgents as jest.Mock).mockImplementation((id: string) => {
      if (id === 'chat_summary') return mockSummaryAgent
      if (id === 'user_info') return mockUserInfoAgent
      if (id === 'long_memory') return mockLongMemoryAgent
      return undefined
    })

    ;(MidTermMemory.getInstance as jest.Mock).mockReturnValue({
      addTurn: mockAddTurn,
      formatTurns: mockFormatTurns,
      formatLastTurns: mockFormatLastTurns,
      updateSummary: mockUpdateSummary,
      shouldSummarize: mockShouldSummarize,
      startSummarizing: mockStartSummarizing,
      resetToCollecting: mockResetToCollecting,
      getSummary: mockGetSummary,
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
    it('should always persist the turn via addTurn', async () => {
      mockShouldSummarize.mockReturnValue(false)
      ;(run as jest.Mock).mockResolvedValue({ finalOutput: null })

      await handleMemory(buildElberResponse())

      expect(mockAddTurn).toHaveBeenCalledWith(
        'user1_1', 'user1', 1, 'user message', 'Elber response'
      )
    })

    it('should always fire LTM extraction regardless of summary cycle', async () => {
      mockShouldSummarize.mockReturnValue(false)
      ;(run as jest.Mock).mockResolvedValue({ finalOutput: { isRelevant: false } })

      await handleMemory(buildElberResponse())
      await new Promise((r) => setImmediate(r))

      expect(run).toHaveBeenCalledWith(mockUserInfoAgent, 'Usuario: user message\n Elber: Elber response')
    })

    it('should not trigger summary when shouldSummarize is false', async () => {
      mockShouldSummarize.mockReturnValue(false)
      ;(run as jest.Mock).mockResolvedValue({ finalOutput: { isRelevant: false } })

      await handleMemory(buildElberResponse())
      await new Promise((r) => setImmediate(r))

      const summaryCalls = (run as jest.Mock).mock.calls.filter(
        (call) => call[0] === mockSummaryAgent
      )
      expect(summaryCalls).toHaveLength(0)
    })

    it('should trigger summary when shouldSummarize is true', async () => {
      mockShouldSummarize.mockReturnValue(true)
      ;(run as jest.Mock).mockResolvedValue({ finalOutput: 'new summary' })

      await handleMemory(buildElberResponse())
      await new Promise((r) => setImmediate(r))

      expect(mockStartSummarizing).toHaveBeenCalledWith('user1_1')
      expect(run).toHaveBeenCalledWith(
        mockSummaryAgent,
        expect.any(String),
        expect.objectContaining({ maxTurns: 3 })
      )
    })

    it('should update MTM, clear STM session, and persist to Firebase after summary', async () => {
      mockShouldSummarize.mockReturnValue(true)
      ;(run as jest.Mock)
        .mockResolvedValueOnce({ finalOutput: { isRelevant: false } }) // relevantInfo
        .mockResolvedValueOnce({ finalOutput: 'new summary text' })    // summary

      await handleMemory(buildElberResponse())
      await new Promise((r) => setImmediate(r))

      expect(mockUpdateSummary).toHaveBeenCalledWith('user1_1', 'new summary text')
      expect(mockDeleteSession).toHaveBeenCalledWith('user1_1')
      expect(chatService.updateChatSummary).toHaveBeenCalledWith('user1', 1, 'new summary text')
    })

    it('should reset state to COLLECTING if summary generation fails', async () => {
      mockShouldSummarize.mockReturnValue(true)
      ;(run as jest.Mock)
        .mockResolvedValueOnce({ finalOutput: { isRelevant: false } })
        .mockRejectedValueOnce(new Error('LLM failure'))

      await handleMemory(buildElberResponse())
      await new Promise((r) => setImmediate(r))

      expect(mockResetToCollecting).toHaveBeenCalledWith('user1_1')
    })

    it('should extract LTM when relevantInfo isRelevant is true', async () => {
      mockShouldSummarize.mockReturnValue(false)
      ;(run as jest.Mock)
        .mockResolvedValueOnce({
          finalOutput: { isRelevant: true, reasoning: 'User likes tacos' },
        })
        .mockResolvedValueOnce({
          finalOutput: { memories: [{ text: 'likes tacos', type: 'preference', importance: 4 }] },
        })

      await handleMemory(buildElberResponse())
      await new Promise((r) => setImmediate(r))

      expect(mockIngestLTM).toHaveBeenCalled()
    })
  })
})
