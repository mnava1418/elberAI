import OpenAI from 'openai'
import { embedText } from '../../services/ai.service'

jest.mock('openai', () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock('../../config/index.config', () => ({
  openaiCfg: { cred: 'test-api-key' },
}))

describe('ai.service', () => {
  const mockCreate = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(OpenAI as unknown as jest.Mock).mockImplementation(() => ({
      embeddings: { create: mockCreate },
    }))
    mockCreate.mockResolvedValue({
      data: [{ embedding: [0.1, 0.2, 0.3] }],
    })
  })

  describe('embedText', () => {
    it('should call OpenAI embeddings with correct model and trimmed input', async () => {
      const result = await embedText('  hello world  ')

      expect(mockCreate).toHaveBeenCalledWith({
        model: 'text-embedding-3-small',
        input: 'hello world',
      })
      expect(result).toEqual([0.1, 0.2, 0.3])
    })

    it('should return the embedding array from the response', async () => {
      mockCreate.mockResolvedValue({
        data: [{ embedding: [0.5, 0.6, 0.7, 0.8] }],
      })

      const result = await embedText('test')
      expect(result).toEqual([0.5, 0.6, 0.7, 0.8])
    })
  })
})
