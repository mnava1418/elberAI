import PgVectorMemoryStore from '../../../services/ltm/vectoreStore.service'
import { pgPool } from '../../../services/ltm/ltmDB.service'

jest.mock('../../../services/ltm/ltmDB.service', () => ({
  pgPool: { query: jest.fn() },
}))

jest.mock('../../../config/index.config', () => ({
  postgres: { db: 'postgresql://test' },
}))

describe('PgVectorMemoryStore', () => {
  const mockQuery = pgPool.query as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('search', () => {
    it('should query pgPool and map rows to MemoryHit objects', async () => {
      mockQuery.mockResolvedValue({
        rows: [
          {
            id: 'mem-1',
            user_id: 'user1',
            room_id: 'room1',
            type: 'profile',
            importance: 4,
            text: 'likes tacos',
            created_at: '2026-01-01',
            updated_at: '2026-01-01',
            score: '0.92',
          },
        ],
      })

      const store = new PgVectorMemoryStore()
      const result = await store.search({
        userId: 'user1',
        queryEmbedding: [0.1, 0.2],
        topK: 5,
        minImportance: 2,
      })

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('mem-1')
      expect(result[0].score).toBe(0.92)
      expect(typeof result[0].score).toBe('number')
    })
  })

  describe('getUserInfo', () => {
    it('should query pgPool and map rows to UserData objects', async () => {
      mockQuery.mockResolvedValue({
        rows: [
          { importance: 4, text: 'likes tacos', type: 'preference', updated_at: '2026-01-01' },
        ],
      })

      const store = new PgVectorMemoryStore()
      const result = await store.getUserInfo('user1')

      expect(result).toHaveLength(1)
      expect(result[0].info).toBe('likes tacos')
      expect(result[0].importance).toBe(4)
    })
  })

  describe('findNearDuplicate', () => {
    it('should return null when no rows are returned', async () => {
      mockQuery.mockResolvedValue({ rows: [] })
      const store = new PgVectorMemoryStore()
      const result = await store.findNearDuplicate({
        userId: 'user1',
        candidateEmbedding: [0.1, 0.2],
        threshold: 0.7,
      })
      expect(result).toBeNull()
    })

    it('should return null when best score is below threshold', async () => {
      mockQuery.mockResolvedValue({ rows: [{ id: 'mem-1', score: '0.5' }] })
      const store = new PgVectorMemoryStore()
      const result = await store.findNearDuplicate({
        userId: 'user1',
        candidateEmbedding: [0.1, 0.2],
        threshold: 0.7,
      })
      expect(result).toBeNull()
    })

    it('should return id and score when best score meets threshold', async () => {
      mockQuery.mockResolvedValue({ rows: [{ id: 'mem-1', score: '0.9' }] })
      const store = new PgVectorMemoryStore()
      const result = await store.findNearDuplicate({
        userId: 'user1',
        candidateEmbedding: [0.1, 0.2],
        threshold: 0.7,
      })
      expect(result).toEqual({ id: 'mem-1', score: 0.9 })
    })
  })

  describe('update', () => {
    it('should build a SET clause only for provided fields and call pgPool.query', async () => {
      mockQuery.mockResolvedValue({ rows: [] })
      const store = new PgVectorMemoryStore()
      await store.update({ id: 'mem-1', text: 'updated text', importance: 5 })

      const [sql, values] = mockQuery.mock.calls[0]
      expect(sql).toContain('text = $')
      expect(sql).toContain('importance = $')
      expect(values).toContain('updated text')
      expect(values).toContain(5)
      expect(values).toContain('mem-1')
    })

    it('should include embedding as vector when provided', async () => {
      mockQuery.mockResolvedValue({ rows: [] })
      const store = new PgVectorMemoryStore()
      await store.update({ id: 'mem-1', embedding: [0.1, 0.2, 0.3] })

      const [sql] = mockQuery.mock.calls[0]
      expect(sql).toContain('::vector')
    })
  })

  describe('insert', () => {
    it('should call pgPool.query and map the result row', async () => {
      mockQuery.mockResolvedValue({
        rows: [
          {
            id: 'new-id',
            user_id: 'user1',
            room_id: null,
            type: 'profile',
            importance: 4,
            text: 'my text',
            created_at: '2026-01-01',
            updated_at: '2026-01-01',
          },
        ],
      })

      const store = new PgVectorMemoryStore()
      const result = await store.insert({
        userId: 'user1',
        type: 'profile',
        importance: 4,
        text: 'my text',
        embedding: [0.1, 0.2],
      })

      expect(result.id).toBe('new-id')
      expect(result.text).toBe('my text')
    })
  })

  describe('deleteAll', () => {
    it('should call pgPool.query with the userId', async () => {
      mockQuery.mockResolvedValue({ rows: [] })
      const store = new PgVectorMemoryStore()
      await store.deleteAll('user1')

      expect(mockQuery).toHaveBeenCalledWith(expect.any(String), ['user1'])
    })
  })

  describe('deleteMemories', () => {
    it('should call pgPool.query with userId and memoryIds', async () => {
      mockQuery.mockResolvedValue({ rows: [] })
      const store = new PgVectorMemoryStore()
      await store.deleteMemories('user1', ['id-1', 'id-2'])

      expect(mockQuery).toHaveBeenCalledWith(expect.any(String), ['user1', ['id-1', 'id-2']])
    })
  })
})
