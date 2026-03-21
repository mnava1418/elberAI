import LongTermMemoryWriter from '../../../services/ltm/ltmWriter.service'
import PgVectorMemoryStore from '../../../services/ltm/vectoreStore.service'
import * as aiService from '../../../services/ai.service'

jest.mock('../../../services/ltm/vectoreStore.service')
jest.mock('../../../services/ai.service')

jest.mock('../../../config/index.config', () => ({
  openaiCfg: { cred: 'test-key' },
  postgres: { db: 'postgresql://test' },
}))

jest.mock('../../../services/ltm/ltmDB.service', () => ({
  pgPool: { query: jest.fn() },
}))

describe('LongTermMemoryWriter', () => {
  const mockFindNearDuplicate = jest.fn()
  const mockUpdate = jest.fn()
  const mockInsert = jest.fn()
  const mockDeleteAll = jest.fn()
  const mockDeleteMemories = jest.fn()
  let store: PgVectorMemoryStore

  beforeEach(() => {
    jest.clearAllMocks()
    ;(PgVectorMemoryStore as jest.Mock).mockImplementation(() => ({
      findNearDuplicate: mockFindNearDuplicate,
      update: mockUpdate,
      insert: mockInsert,
      deleteAll: mockDeleteAll,
      deleteMemories: mockDeleteMemories,
    }))
    store = new PgVectorMemoryStore()
    ;(aiService.embedText as jest.Mock).mockResolvedValue([0.1, 0.2, 0.3])
    mockFindNearDuplicate.mockResolvedValue(null)
    mockInsert.mockResolvedValue({ id: 'new-id' })
    mockUpdate.mockResolvedValue(undefined)
    mockDeleteAll.mockResolvedValue(undefined)
    mockDeleteMemories.mockResolvedValue(undefined)
  })

  describe('upsertMany', () => {
    it('should skip memories with importance below minImportanceToStore', async () => {
      const writer = new LongTermMemoryWriter(store)
      await writer.upsertMany({
        userId: 'user1',
        extracted: [{ text: 'low importance', type: 'other', importance: 2 }],
        minImportanceToStore: 3,
      })

      expect(aiService.embedText).not.toHaveBeenCalled()
      expect(mockInsert).not.toHaveBeenCalled()
    })

    it('should insert a new memory when no duplicate exists', async () => {
      const writer = new LongTermMemoryWriter(store)
      await writer.upsertMany({
        userId: 'user1',
        roomId: 'room1',
        extracted: [{ text: 'likes tacos', type: 'preference', importance: 4 }],
      })

      expect(aiService.embedText).toHaveBeenCalledWith('likes tacos')
      expect(mockFindNearDuplicate).toHaveBeenCalled()
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user1', roomId: 'room1', text: 'likes tacos' })
      )
    })

    it('should update an existing memory when a near duplicate is found', async () => {
      mockFindNearDuplicate.mockResolvedValue({ id: 'existing-id', score: 0.95 })
      const writer = new LongTermMemoryWriter(store)
      await writer.upsertMany({
        userId: 'user1',
        extracted: [{ text: 'updated preference', type: 'preference', importance: 4 }],
      })

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'existing-id', text: 'updated preference' })
      )
      expect(mockInsert).not.toHaveBeenCalled()
    })

    it('should process multiple memories in sequence', async () => {
      const writer = new LongTermMemoryWriter(store)
      await writer.upsertMany({
        userId: 'user1',
        extracted: [
          { text: 'memory 1', type: 'profile', importance: 3 },
          { text: 'memory 2', type: 'goal', importance: 4 },
        ],
      })

      expect(aiService.embedText).toHaveBeenCalledTimes(2)
      expect(mockInsert).toHaveBeenCalledTimes(2)
    })
  })

  describe('deleteAll', () => {
    it('should delegate to store.deleteAll', async () => {
      const writer = new LongTermMemoryWriter(store)
      await writer.deleteAll('user1')
      expect(mockDeleteAll).toHaveBeenCalledWith('user1')
    })
  })

  describe('deleteMemories', () => {
    it('should delegate to store.deleteMemories', async () => {
      const writer = new LongTermMemoryWriter(store)
      await writer.deleteMemories('user1', ['id-1', 'id-2'])
      expect(mockDeleteMemories).toHaveBeenCalledWith('user1', ['id-1', 'id-2'])
    })
  })
})
