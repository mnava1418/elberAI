import MidTermMemory from '../../models/midTermMemory.model'
import * as chatService from '../../services/chat.service'

jest.mock('../../services/chat.service')

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
      expect(entry.turnsCount).toBe(0)
      expect(entry.turns).toEqual([])
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
  })

  describe('addTurn', () => {
    it('should increment turnsCount and add a turn', async () => {
      const mtm = MidTermMemory.getInstance()
      await mtm.getMemory('user1_chat1', 'user1', 1)
      mtm.addTurn('user1_chat1', 'user said this', 'elber replied')

      const memories = (mtm as any).memories as Map<string, any>
      const entry = memories.get('user1_chat1')
      expect(entry.turnsCount).toBe(1)
      expect(entry.turns[0]).toEqual({ userMessage: 'user said this', assistantMessage: 'elber replied' })
    })

    it('should be a no-op when conversationId does not exist', () => {
      const mtm = MidTermMemory.getInstance()
      expect(() => mtm.addTurn('nonexistent', 'msg', 'reply')).not.toThrow()
    })
  })

  describe('updateSummary', () => {
    it('should update summary and reset turns and turnsCount', async () => {
      const mtm = MidTermMemory.getInstance()
      await mtm.getMemory('user1_chat1', 'user1', 1)
      mtm.addTurn('user1_chat1', 'hello', 'hi')
      mtm.updateSummary('user1_chat1', 'new summary')

      const memories = (mtm as any).memories as Map<string, any>
      const entry = memories.get('user1_chat1')
      expect(entry.summary).toBe('new summary')
      expect(entry.turnsCount).toBe(0)
      expect(entry.turns).toEqual([])
    })
  })

  describe('formatTurns', () => {
    it('should format turns with numbered labels', async () => {
      const mtm = MidTermMemory.getInstance()
      await mtm.getMemory('user1_chat1', 'user1', 1)
      mtm.addTurn('user1_chat1', 'Hello', 'Hi there')
      mtm.addTurn('user1_chat1', 'How are you?', 'Great!')

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
    it('should delete a specific memory entry', async () => {
      const mtm = MidTermMemory.getInstance()
      await mtm.getMemory('user1_chat1', 'user1', 1)
      mtm.deleteMemory('user1_chat1')

      const memories = (mtm as any).memories as Map<string, any>
      expect(memories.has('user1_chat1')).toBe(false)
    })
  })

  describe('deleteUserMemory', () => {
    it('should delete all memories for a given uid', async () => {
      const mtm = MidTermMemory.getInstance()
      await mtm.getMemory('user1_chat1', 'user1', 1)
      await mtm.getMemory('user1_chat2', 'user1', 2)
      await mtm.getMemory('user2_chat1', 'user2', 1)

      mtm.deleteUserMemory('user1')

      const memories = (mtm as any).memories as Map<string, any>
      expect(memories.has('user1_chat1')).toBe(false)
      expect(memories.has('user1_chat2')).toBe(false)
      expect(memories.has('user2_chat1')).toBe(true)
    })
  })
})
