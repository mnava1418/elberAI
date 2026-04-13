import LongTermMemory from '../../models/longTermMemory.model'
import PgVectorMemoryStore from '../../services/ltm/vectoreStore.service'
import LongTermMemoryReader from '../../services/ltm/ltmReader.service'
import LongTermMemoryWriter from '../../services/ltm/ltmWriter.service'
import { MemoryHit } from '../../models/elber.model'

jest.mock('../../services/ltm/vectoreStore.service')
jest.mock('../../services/ltm/ltmReader.service')
jest.mock('../../services/ltm/ltmWriter.service')

jest.mock('../../config/index.config', () => ({
  gateway: { secret: 'test-secret' },
  postgres: { db: 'postgresql://test' },
  openaiCfg: { cred: 'test-key' },
}))

jest.mock('../../services/ltm/ltmDB.service', () => ({
  pgPool: { query: jest.fn() },
}))

const makeHit = (score: number, type = 'profile'): MemoryHit => ({
  id: `id-${score}`,
  userId: 'u1',
  roomId: null,
  subject: null,
  type: type as any,
  importance: 3,
  text: `memory with score ${score}`,
  createdAt: '',
  updatedAt: '',
  score,
})

describe('LongTermMemory', () => {
  let mockRetrieve: jest.Mock
  let mockRetrieveAll: jest.Mock
  let mockUpsertMany: jest.Mock
  let mockDeleteAll: jest.Mock
  let mockDeleteMemories: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()

    mockRetrieve = jest.fn().mockResolvedValue([])
    mockRetrieveAll = jest.fn().mockResolvedValue([])
    ;(LongTermMemoryReader as jest.Mock).mockImplementation(() => ({
      retrieve: mockRetrieve,
      retriveAll: mockRetrieveAll,
    }))

    mockUpsertMany = jest.fn().mockResolvedValue(undefined)
    mockDeleteAll = jest.fn().mockResolvedValue(undefined)
    mockDeleteMemories = jest.fn().mockResolvedValue(undefined)
    ;(LongTermMemoryWriter as jest.Mock).mockImplementation(() => ({
      upsertMany: mockUpsertMany,
      deleteAll: mockDeleteAll,
      deleteMemories: mockDeleteMemories,
    }))

    ;(PgVectorMemoryStore as jest.Mock).mockImplementation(() => ({}))
  })

  describe('buildLtmBlock', () => {
    it('should return hits above minScore sorted by score desc', () => {
      const ltm = new LongTermMemory()
      const hits = [makeHit(0.8), makeHit(0.9), makeHit(0.6)]
      const result = ltm.buildLtmBlock(hits)

      expect(result).toHaveLength(2)
      expect(result[0].score).toBe(0.9)
      expect(result[1].score).toBe(0.8)
    })

    it('should respect maxItems limit', () => {
      const ltm = new LongTermMemory()
      const hits = [makeHit(0.9), makeHit(0.85), makeHit(0.82), makeHit(0.78)]
      const result = ltm.buildLtmBlock(hits, { maxItems: 2 })

      expect(result).toHaveLength(2)
    })

    it('should use fallback when no hits pass minScore', () => {
      const ltm = new LongTermMemory()
      const hits = [makeHit(0.5), makeHit(0.4)]
      const result = ltm.buildLtmBlock(hits, { minScore: 0.75, fallbackMinScore: 0.35 })

      expect(result).toHaveLength(1)
      expect(result[0].score).toBe(0.5)
    })

    it('should return empty array when all scores are below fallbackMinScore', () => {
      const ltm = new LongTermMemory()
      const hits = [makeHit(0.2)]
      const result = ltm.buildLtmBlock(hits, { minScore: 0.75, fallbackMinScore: 0.35 })

      expect(result).toHaveLength(0)
    })

    it('should return empty array when no memories provided', () => {
      const ltm = new LongTermMemory()
      expect(ltm.buildLtmBlock([])).toEqual([])
    })
  })

  describe('getMemory', () => {
    it('should call reader.retrieve and apply buildLtmBlock', async () => {
      mockRetrieve.mockResolvedValue([makeHit(0.9)])
      const ltm = new LongTermMemory()
      const result = await ltm.getMemory('user1', 'what do I like?')

      expect(mockRetrieve).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user1', queryText: 'what do I like?' })
      )
      expect(result).toHaveLength(1)
    })

    it('should return empty array when reader throws', async () => {
      mockRetrieve.mockRejectedValue(new Error('DB error'))
      const ltm = new LongTermMemory()
      const result = await ltm.getMemory('user1', 'query')

      expect(result).toEqual([])
    })
  })

  describe('getUserData', () => {
    it('should call reader.retriveAll and return data', async () => {
      const mockData = [{ type: 'profile', importance: 4, info: 'test', updatedAt: '' }]
      mockRetrieveAll.mockResolvedValue(mockData)
      const ltm = new LongTermMemory()
      const result = await ltm.getUserData('user1')

      expect(mockRetrieveAll).toHaveBeenCalledWith('user1')
      expect(result).toEqual(mockData)
    })
  })

  describe('ingestLTM', () => {
    it('should call writer.upsertMany with correct params', async () => {
      const ltm = new LongTermMemory()
      const memories = [{ text: 'likes tacos', type: 'preference', importance: 4 }]
      await ltm.ingestLTM('user1', 'room1', memories)

      expect(mockUpsertMany).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user1', roomId: 'room1', extracted: memories })
      )
    })
  })

  describe('resetMemory', () => {
    it('should call writer.deleteAll', async () => {
      const ltm = new LongTermMemory()
      await ltm.resetMemory('user1')

      expect(mockDeleteAll).toHaveBeenCalledWith('user1')
    })
  })

  describe('deleteMemories', () => {
    it('should call writer.deleteMemories', async () => {
      const ltm = new LongTermMemory()
      await ltm.deleteMemories('user1', ['id-1', 'id-2'])

      expect(mockDeleteMemories).toHaveBeenCalledWith('user1', ['id-1', 'id-2'])
    })
  })
})
