import ShortTermMemory from '../../models/shortTermMemory.model'

jest.mock('@openai/agents', () => ({
  __esModule: true,
  OpenAIConversationsSession: jest.fn(() => ({ id: 'mock-session' })),
  run: jest.fn(),
  withTrace: jest.fn(),
  tool: jest.fn((config: any) => config),
}))

describe('ShortTermMemory', () => {
  beforeEach(() => {
    // Reset singleton between tests
    ;(ShortTermMemory as any).instance = undefined
  })

  it('getInstance should always return the same instance', () => {
    const a = ShortTermMemory.getInstance()
    const b = ShortTermMemory.getInstance()
    expect(a).toBe(b)
  })

  describe('getSession', () => {
    it('should create a new session when none exists', () => {
      const stm = ShortTermMemory.getInstance()
      const session = stm.getSession('user1_chat1')
      expect(session).toBeDefined()
    })

    it('should return the same session for an active conversation', () => {
      const stm = ShortTermMemory.getInstance()
      const session1 = stm.getSession('user1_chat1')
      const session2 = stm.getSession('user1_chat1')
      expect(session1).toBe(session2)
    })

    it('should create a new session when the previous one is expired', () => {
      const stm = ShortTermMemory.getInstance()
      const session1 = stm.getSession('user1_chat1')

      // Force expiration by setting expiresAt to the past
      const sessions = (stm as any).sessions as Map<string, any>
      sessions.get('user1_chat1').expiresAt = Date.now() - 1

      const session2 = stm.getSession('user1_chat1')
      expect(session2).not.toBe(session1)
    })

    it('should extend TTL when accessing an active session', () => {
      const stm = ShortTermMemory.getInstance()
      stm.getSession('user1_chat1')

      const sessions = (stm as any).sessions as Map<string, any>
      const originalExpiry = sessions.get('user1_chat1').expiresAt

      // Access again and verify TTL is extended
      stm.getSession('user1_chat1')
      const newExpiry = sessions.get('user1_chat1').expiresAt

      expect(newExpiry).toBeGreaterThanOrEqual(originalExpiry)
    })
  })

  describe('deleteSession', () => {
    it('should delete an existing session', () => {
      const stm = ShortTermMemory.getInstance()
      stm.getSession('user1_chat1')
      stm.deleteSession('user1_chat1')

      const sessions = (stm as any).sessions as Map<string, any>
      expect(sessions.has('user1_chat1')).toBe(false)
    })

    it('should be a no-op when session does not exist', () => {
      const stm = ShortTermMemory.getInstance()
      expect(() => stm.deleteSession('nonexistent')).not.toThrow()
    })
  })

  describe('deleteOldSessions', () => {
    it('should remove expired sessions', () => {
      const stm = ShortTermMemory.getInstance()
      stm.getSession('user1_chat1')
      stm.getSession('user1_chat2')

      const sessions = (stm as any).sessions as Map<string, any>
      sessions.get('user1_chat1').expiresAt = Date.now() - 1 // expired

      stm.deleteOldSessions()

      expect(sessions.has('user1_chat1')).toBe(false)
      expect(sessions.has('user1_chat2')).toBe(true)
    })
  })

  describe('deleteUserSessions', () => {
    it('should delete all sessions for a given uid', () => {
      const stm = ShortTermMemory.getInstance()
      stm.getSession('user1_chat1')
      stm.getSession('user1_chat2')
      stm.getSession('user2_chat1')

      stm.deleteUserSessions('user1')

      const sessions = (stm as any).sessions as Map<string, any>
      expect(sessions.has('user1_chat1')).toBe(false)
      expect(sessions.has('user1_chat2')).toBe(false)
      expect(sessions.has('user2_chat1')).toBe(true)
    })
  })
})
