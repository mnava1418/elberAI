import LongTermMemoryReader from '../../../services/ltm/ltmReader.service'
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

describe('LongTermMemoryReader', () => {
  const mockSearch = jest.fn()
  const mockGetUserInfo = jest.fn()
  let store: PgVectorMemoryStore

  beforeEach(() => {
    jest.clearAllMocks()
    ;(PgVectorMemoryStore as jest.Mock).mockImplementation(() => ({
      search: mockSearch,
      getUserInfo: mockGetUserInfo,
    }))
    store = new PgVectorMemoryStore()
    ;(aiService.embedText as jest.Mock).mockResolvedValue([0.1, 0.2, 0.3])
    mockSearch.mockResolvedValue([{ id: 'mem-1', text: 'I like tacos', score: 0.9 }])
    mockGetUserInfo.mockResolvedValue([{ type: 'preference', info: 'likes tacos', importance: 4 }])
  })

  describe('retrieve', () => {
    it('should embed the query text and call store.search with correct params', async () => {
      const reader = new LongTermMemoryReader(store)
      const result = await reader.retrieve({
        userId: 'user1',
        queryText: 'what do I like?',
        topK: 5,
        minImportance: 3,
      })

      expect(aiService.embedText).toHaveBeenCalledWith('what do I like?')
      expect(mockSearch).toHaveBeenCalledWith({
        userId: 'user1',
        queryEmbedding: [0.1, 0.2, 0.3],
        topK: 5,
        minImportance: 3,
      })
      expect(result).toHaveLength(1)
    })

    it('should use default values for topK and minImportance', async () => {
      const reader = new LongTermMemoryReader(store)
      await reader.retrieve({ userId: 'user1', queryText: 'query' })

      expect(mockSearch).toHaveBeenCalledWith(
        expect.objectContaining({ topK: 8, minImportance: 2 })
      )
    })
  })

  describe('retriveAll', () => {
    it('should call store.getUserInfo with the userId', async () => {
      const reader = new LongTermMemoryReader(store)
      const result = await reader.retriveAll('user1')

      expect(mockGetUserInfo).toHaveBeenCalledWith('user1')
      expect(result).toHaveLength(1)
    })
  })
})
