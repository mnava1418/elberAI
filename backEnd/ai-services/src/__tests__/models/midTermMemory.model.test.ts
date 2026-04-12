import MidTermMemory from '../../models/midTermMemory.model'
import * as chatService from '../../services/chat.service'
import { pgPool } from '../../services/ltm/ltmDB.service'

jest.mock('../../services/chat.service')

jest.mock('../../services/ltm/ltmDB.service', () => ({
  pgPool: { query: jest.fn() },
}))

const mockQuery = pgPool.query as jest.Mock

jest.mock('../../config/index.config', () => ({
  gateway: { secret: 'test-secret' },
  firebase: { cred: '/fake', db: 'https://test.db' },
  openaiCfg: { cred: 'test-key' },
  postgres: { db: 'postgresql://test' },
  serper: { searchURL: 'https://serper.dev', secret: 'test-serper' },
}))

jest.mock('firebase-admin', () => ({
  __esModule: true,
  default: { auth: jest.fn(), database: jest.fn() },
}))

jest.mock('@openai/agents', () => ({
  __esModule: true,
  OpenAIConversationsSession: jest.fn(() => ({})),
  run: jest.fn(),
  withTrace: jest.fn(),
  tool: jest.fn((c: any) => c),
}))

describe('MidTermMemory', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(MidTermMemory as any).instance = undefined
    ;(chatService.getChatSummary as jest.Mock).mockResolvedValue('stored summary')
    // loadTurns query returns empty by default
    mockQuery.mockResolvedValue({ rows: [] })
  })

  it('getInstance should return the same instance', () => {
    const a = MidTermMemory.getInstance()
    const b = MidTermMemory.getInstance()
    expect(a).toBe(b)
  })

  describe('getMemory', () => {
    it('should fetch summary from Firebase and create a new entry', async () => {
      const mtm = MidTermMemory.getInstance()
      const entry = await mtm.getMemory('user1_chat1', 'user1', 1)

      expect(chatService.getChatSummary).toHaveBeenCalledWith('user1', 1)
      expect(entry.summary).toBe('stored summary')
      expect(entry.turns).toEqual([])
      expect(entry.tokenCount).toBe(0)
      expect(entry.state).toBe('COLLECTING')
    })

    it('should return cached entry without calling Firebase again', async () => {
      const mtm = MidTermMemory.getInstance()
      await mtm.getMemory('user1_chat1', 'user1', 1)
      await mtm.getMemory('user1_chat1', 'user1', 1)

      expect(chatService.getChatSummary).toHaveBeenCalledTimes(1)
    })

    it('should default summary to empty string when getChatSummary fails', async () => {
      ;(chatService.getChatSummary as jest.Mock).mockRejectedValue(new Error('Firebase error'))
      const mtm = MidTermMemory.getInstance()
      const entry = await mtm.getMemory('user1_chat1', 'user1', 1)

      expect(entry.summary).toBe('')
    })

    it('should rehydrate turns from DB on cold start', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [
          { user_message: 'hola', assistant_message: 'hola a ti' },
        ],
      })
      const mtm = MidTermMemory.getInstance()
      const entry = await mtm.getMemory('user1_chat1', 'user1', 1)

      expect(entry.turns).toHaveLength(1)
      expect(entry.turns[0]).toEqual({ userMessage: 'hola', assistantMessage: 'hola a ti' })
      expect(entry.tokenCount).toBeGreaterThan(0)
    })
  })

  describe('addTurn', () => {
    it('should persist turn to DB and update cache', async () => {
      const mtm = MidTermMemory.getInstance()
      await mtm.getMemory('user1_chat1', 'user1', 1)
      await mtm.addTurn('user1_chat1', 'user1', 1, 'user said this', 'elber replied')

      const cache = (mtm as any).cache as Map<string, any>
      const entry = cache.get('user1_chat1')
      expect(entry.turns).toHaveLength(1)
      expect(entry.turns[0]).toEqual({ userMessage: 'user said this', assistantMessage: 'elber replied' })
      expect(entry.tokenCount).toBeGreaterThan(0)
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO conversation_turns'),
        ['user1_chat1', 'user1', 1, 'user said this', 'elber replied', expect.any(Number)]
      )
    })

    it('should be a no-op when conversationId does not exist', async () => {
      const mtm = MidTermMemory.getInstance()
      await expect(mtm.addTurn('nonexistent', 'u', 1, 'msg', 'reply')).resolves.not.toThrow()
    })
  })

  describe('shouldSummarize / state machine', () => {
    it('should return false when tokenCount is below budget', async () => {
      const mtm = MidTermMemory.getInstance()
      await mtm.getMemory('user1_chat1', 'user1', 1)

      expect(mtm.shouldSummarize('user1_chat1')).toBe(false)
    })

    it('should return true when tokenCount exceeds budget and state is COLLECTING', async () => {
      const mtm = MidTermMemory.getInstance()
      await mtm.getMemory('user1_chat1', 'user1', 1)

      // Forzamos tokenCount alto directamente en el cache
      const cache = (mtm as any).cache as Map<string, any>
      cache.get('user1_chat1').tokenCount = 9999

      expect(mtm.shouldSummarize('user1_chat1')).toBe(true)
    })

    it('should return false when state is SUMMARIZING', async () => {
      const mtm = MidTermMemory.getInstance()
      await mtm.getMemory('user1_chat1', 'user1', 1)

      const cache = (mtm as any).cache as Map<string, any>
      cache.get('user1_chat1').tokenCount = 9999
      mtm.startSummarizing('user1_chat1')

      expect(mtm.shouldSummarize('user1_chat1')).toBe(false)
    })

    it('resetToCollecting should allow summarizing again', async () => {
      const mtm = MidTermMemory.getInstance()
      await mtm.getMemory('user1_chat1', 'user1', 1)

      const cache = (mtm as any).cache as Map<string, any>
      cache.get('user1_chat1').tokenCount = 9999
      mtm.startSummarizing('user1_chat1')
      mtm.resetToCollecting('user1_chat1')

      expect(mtm.shouldSummarize('user1_chat1')).toBe(true)
    })
  })

  describe('updateSummary', () => {
    it('should update summary, clear turns/tokenCount, reset state, and delete DB turns', async () => {
      const mtm = MidTermMemory.getInstance()
      await mtm.getMemory('user1_chat1', 'user1', 1)
      await mtm.addTurn('user1_chat1', 'user1', 1, 'hello', 'hi')
      await mtm.updateSummary('user1_chat1', 'new summary')

      const cache = (mtm as any).cache as Map<string, any>
      const entry = cache.get('user1_chat1')
      expect(entry.summary).toBe('new summary')
      expect(entry.turns).toEqual([])
      expect(entry.tokenCount).toBe(0)
      expect(entry.state).toBe('COLLECTING')
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM conversation_turns'),
        ['user1_chat1']
      )
    })
  })

  describe('formatTurns', () => {
    it('should format turns with numbered labels', async () => {
      const mtm = MidTermMemory.getInstance()
      await mtm.getMemory('user1_chat1', 'user1', 1)
      await mtm.addTurn('user1_chat1', 'user1', 1, 'Hello', 'Hi there')
      await mtm.addTurn('user1_chat1', 'user1', 1, 'How are you?', 'Great!')

      const result = mtm.formatTurns('user1_chat1')
      expect(result).toContain('Turno 1')
      expect(result).toContain('Hello')
      expect(result).toContain('Hi there')
      expect(result).toContain('Turno 2')
    })

    it('should return empty string when conversationId does not exist', () => {
      const mtm = MidTermMemory.getInstance()
      expect(mtm.formatTurns('nonexistent')).toBe('')
    })
  })

  describe('deleteMemory', () => {
    it('should delete a specific memory entry from cache', async () => {
      const mtm = MidTermMemory.getInstance()
      await mtm.getMemory('user1_chat1', 'user1', 1)
      mtm.deleteMemory('user1_chat1')

      const cache = (mtm as any).cache as Map<string, any>
      expect(cache.has('user1_chat1')).toBe(false)
    })
  })

  describe('deleteUserMemory', () => {
    it('should delete all cache entries for a uid and clean DB', async () => {
      const mtm = MidTermMemory.getInstance()
      await mtm.getMemory('user1_chat1', 'user1', 1)
      await mtm.getMemory('user1_chat2', 'user1', 2)
      await mtm.getMemory('user2_chat1', 'user2', 1)

      await mtm.deleteUserMemory('user1')

      const cache = (mtm as any).cache as Map<string, any>
      expect(cache.has('user1_chat1')).toBe(false)
      expect(cache.has('user1_chat2')).toBe(false)
      expect(cache.has('user2_chat1')).toBe(true)
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM conversation_turns'),
        ['user1']
      )
    })
  })
})
