import {
  handleMemory,
  saveMemoryEntry,
  searchMemoryEntries,
  updateMemoryEntry,
  deleteMemoryEntry,
  clearAllMemoryEntries,
} from '../../services/memory.service'
import { run } from '@openai/agents'
import MidTermMemory from '../../models/midTermMemory.model'
import ShortTermMemory from '../../models/shortTermMemory.model'
import LongTermMemory from '../../models/longTermMemory.model'
import * as chatService from '../../services/chat.service'
import { ElberResponse } from '../../models/elber.model'
import { getAgents } from '../../loaders/agents.loader'
import userMemoryAgent from '../../agents/builders/userMemory.agent'
import PgVectorMemoryStore from '../../services/ltm/vectoreStore.service'
import { embedText } from '../../services/ai.service'

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

jest.mock('../../agents/builders/userMemory.agent', () => ({
  __esModule: true,
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
jest.mock('../../services/ai.service', () => ({ embedText: jest.fn() }))

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
    isVoiceMode: false,
    location: { lat: 19.4326, lon: -99.1332 }
  },
})

const mockSummaryAgent = { name: 'chat_summary' }
const mockUserMemoryAgentInstance = { name: 'user-memory-agent' }
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
      if (id === 'long_memory') return mockLongMemoryAgent
      return undefined
    })

    ;(userMemoryAgent as jest.Mock).mockResolvedValue(mockUserMemoryAgentInstance)

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

      expect(run).toHaveBeenCalledWith(
        mockUserMemoryAgentInstance,
        expect.stringContaining('Usuario: user message\n Elber: Elber response'),
        expect.objectContaining({ context: expect.any(Object) })
      )
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
      // With the async builder, generateSummary reaches run() before
      // handleUserRelevantInformation (which awaits the builder first)
      ;(run as jest.Mock)
        .mockResolvedValueOnce({ finalOutput: 'new summary text' })    // summary (1st)
        .mockResolvedValueOnce({ finalOutput: null })                   // user memory (2nd)

      await handleMemory(buildElberResponse())
      await new Promise((r) => setImmediate(r))

      expect(mockUpdateSummary).toHaveBeenCalledWith('user1_1', 'new summary text')
      expect(mockDeleteSession).toHaveBeenCalledWith('user1_1')
      expect(chatService.updateChatSummary).toHaveBeenCalledWith('user1', 1, 'new summary text')
    })

    it('should reset state to COLLECTING if summary generation fails', async () => {
      mockShouldSummarize.mockReturnValue(true)
      // summary runs first (before async builder resolves), so reject it first
      ;(run as jest.Mock)
        .mockRejectedValueOnce(new Error('LLM failure')) // summary (1st)
        .mockResolvedValueOnce({ finalOutput: null })     // user memory (2nd)

      await handleMemory(buildElberResponse())
      await new Promise((r) => setImmediate(r))

      expect(mockResetToCollecting).toHaveBeenCalledWith('user1_1')
    })

    it('should call user memory agent on every turn', async () => {
      mockShouldSummarize.mockReturnValue(false)
      ;(run as jest.Mock).mockResolvedValue({ finalOutput: null })

      await handleMemory(buildElberResponse())
      await new Promise((r) => setImmediate(r))

      expect(userMemoryAgent).toHaveBeenCalledWith('user1')
      expect(run).toHaveBeenCalledWith(
        mockUserMemoryAgentInstance,
        expect.stringContaining('Usuario: user message\n Elber: Elber response'),
        expect.objectContaining({ context: expect.any(Object) })
      )
    })
  })

  // ── Episodic memory CRUD ─────────────────────────────────────────────────────

  const DUMMY_EMBEDDING = [0.1, 0.2, 0.3]
  const mockEmbedText = embedText as jest.Mock

  const mockStore = {
    insert: jest.fn(),
    search: jest.fn(),
    update: jest.fn(),
    deleteMemories: jest.fn(),
    deleteAll: jest.fn(),
    findNearDuplicate: jest.fn(),
  }

  beforeEach(() => {
    ;(PgVectorMemoryStore as jest.Mock).mockImplementation(() => mockStore)
    mockEmbedText.mockResolvedValue(DUMMY_EMBEDDING)
    mockStore.insert.mockResolvedValue(undefined)
    mockStore.search.mockResolvedValue([])
    mockStore.update.mockResolvedValue(undefined)
    mockStore.deleteMemories.mockResolvedValue(undefined)
    mockStore.deleteAll.mockResolvedValue(0)
    mockStore.findNearDuplicate.mockResolvedValue(null)
  })

  describe('saveMemoryEntry', () => {
    it('embeds the memory and inserts it when no duplicate exists', async () => {
      mockStore.findNearDuplicate.mockResolvedValue(null)

      const result = await saveMemoryEntry('user1', 'El usuario tuvo una reunión con Carlos')

      expect(mockEmbedText).toHaveBeenCalledWith('El usuario tuvo una reunión con Carlos')
      expect(mockStore.insert).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user1', type: 'event', importance: 4, subject: null })
      )
      expect(result).toBe('Recuerdo guardado correctamente.')
    })

    it('skips insert and returns success when a near-duplicate is found', async () => {
      mockStore.findNearDuplicate.mockResolvedValue({ id: 'existing-id', score: 0.92 })

      const result = await saveMemoryEntry('user1', 'El usuario tuvo una reunión con Carlos')

      expect(mockStore.insert).not.toHaveBeenCalled()
      expect(result).toBe('Recuerdo guardado correctamente.')
    })

    it('throws when an exception occurs', async () => {
      mockEmbedText.mockRejectedValue(new Error('OpenAI error'))

      await expect(saveMemoryEntry('user1', 'algo')).rejects.toThrow('OpenAI error')
    })
  })

  describe('searchMemoryEntries', () => {
    it('returns formatted list with dates when results are found', async () => {
      mockStore.search.mockResolvedValue([
        { id: '1', text: 'Reunión con Carlos', score: 0.9, updatedAt: new Date('2026-05-05'), type: 'event', importance: 4 },
        { id: '2', text: 'Entrevista en Google', score: 0.8, updatedAt: new Date('2026-05-06'), type: 'event', importance: 4 },
      ])

      const result = await searchMemoryEntries('user1', 'reunión')

      expect(mockEmbedText).toHaveBeenCalledWith('reunión')
      expect(mockStore.search).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user1', topK: 5, minImportance: 1 })
      )
      expect(result).toContain('Reunión con Carlos')
      expect(result).toContain('Entrevista en Google')
    })

    it('returns not-found message when no results', async () => {
      mockStore.search.mockResolvedValue([])

      const result = await searchMemoryEntries('user1', 'algo inexistente')

      expect(result).toBe('No encontré recuerdos relacionados con esa búsqueda.')
    })

    it('throws when an exception occurs', async () => {
      mockEmbedText.mockRejectedValue(new Error('OpenAI error'))

      await expect(searchMemoryEntries('user1', 'algo')).rejects.toThrow('OpenAI error')
    })
  })

  describe('updateMemoryEntry', () => {
    it('finds the closest match, embeds the correction, and updates it', async () => {
      mockStore.search.mockResolvedValue([
        { id: 'mem-1', text: 'Reunión con Carlos el 5 de mayo', score: 0.88, updatedAt: new Date(), type: 'event', importance: 4 },
      ])

      const result = await updateMemoryEntry('user1', 'reunión con Carlos el 5 de mayo', 'Reunión con Carlos el 6 de mayo')

      expect(mockEmbedText).toHaveBeenCalledTimes(2)
      expect(mockStore.update).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'mem-1', text: 'Reunión con Carlos el 6 de mayo' })
      )
      expect(result).toBe('Recuerdo actualizado: "Reunión con Carlos el 6 de mayo"')
    })

    it('returns not-found when top result score is below 0.5', async () => {
      mockStore.search.mockResolvedValue([
        { id: 'mem-1', text: 'Algo diferente', score: 0.3, updatedAt: new Date(), type: 'event', importance: 4 },
      ])

      const result = await updateMemoryEntry('user1', 'reunión con Carlos', 'corrección')

      expect(mockStore.update).not.toHaveBeenCalled()
      expect(result).toBe('No encontré un recuerdo que coincida con esa descripción.')
    })

    it('returns not-found when search returns no results', async () => {
      mockStore.search.mockResolvedValue([])

      const result = await updateMemoryEntry('user1', 'reunión con Carlos', 'corrección')

      expect(mockStore.update).not.toHaveBeenCalled()
      expect(result).toBe('No encontré un recuerdo que coincida con esa descripción.')
    })

    it('throws when an exception occurs', async () => {
      mockEmbedText.mockRejectedValue(new Error('OpenAI error'))

      await expect(updateMemoryEntry('user1', 'algo', 'corrección')).rejects.toThrow('OpenAI error')
    })
  })

  describe('deleteMemoryEntry', () => {
    it('finds the closest match and deletes it', async () => {
      mockStore.search.mockResolvedValue([
        { id: 'mem-1', text: 'Viaje a Miami', score: 0.91, updatedAt: new Date(), type: 'event', importance: 4 },
      ])

      const result = await deleteMemoryEntry('user1', 'viaje a Miami')

      expect(mockStore.deleteMemories).toHaveBeenCalledWith('user1', ['mem-1'])
      expect(result).toBe('He olvidado: "Viaje a Miami"')
    })

    it('returns not-found when top result score is below 0.5', async () => {
      mockStore.search.mockResolvedValue([
        { id: 'mem-1', text: 'Algo muy diferente', score: 0.2, updatedAt: new Date(), type: 'event', importance: 4 },
      ])

      const result = await deleteMemoryEntry('user1', 'viaje a Miami')

      expect(mockStore.deleteMemories).not.toHaveBeenCalled()
      expect(result).toBe('No encontré un recuerdo que coincida con esa descripción.')
    })

    it('returns not-found when search returns no results', async () => {
      mockStore.search.mockResolvedValue([])

      const result = await deleteMemoryEntry('user1', 'viaje a Miami')

      expect(mockStore.deleteMemories).not.toHaveBeenCalled()
      expect(result).toBe('No encontré un recuerdo que coincida con esa descripción.')
    })

    it('throws when an exception occurs', async () => {
      mockEmbedText.mockRejectedValue(new Error('OpenAI error'))

      await expect(deleteMemoryEntry('user1', 'algo')).rejects.toThrow('OpenAI error')
    })
  })

  describe('clearAllMemoryEntries', () => {
    it('deletes all memories and returns the count', async () => {
      mockStore.deleteAll.mockResolvedValue(7)

      const result = await clearAllMemoryEntries('user1')

      expect(mockStore.deleteAll).toHaveBeenCalledWith('user1')
      expect(result).toBe('He borrado 7 recuerdo(s) de tu historial.')
    })

    it('returns zero count when the table is already empty', async () => {
      mockStore.deleteAll.mockResolvedValue(0)

      const result = await clearAllMemoryEntries('user1')

      expect(result).toBe('He borrado 0 recuerdo(s) de tu historial.')
    })

    it('throws when an exception occurs', async () => {
      mockStore.deleteAll.mockRejectedValue(new Error('DB error'))

      await expect(clearAllMemoryEntries('user1')).rejects.toThrow('DB error')
    })
  })
})
