import { webSearch as webSearchTool } from '../../agents/tools/search.tools'
import { searchWeb } from '../../services/search.service'

// The mock makes `tool()` return the config object directly, which has `execute`.
// Cast to any since FunctionTool's TS types don't expose execute publicly.
const webSearch = webSearchTool as any

jest.mock('@openai/agents', () => ({
  __esModule: true,
  tool: jest.fn((config: any) => config),
  run: jest.fn(),
}))

jest.mock('../../services/search.service')

const mockSearchWeb = searchWeb as jest.Mock

describe('webSearch tool', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should call searchWeb with query and timezone from context', async () => {
    const organicResults = [{ title: 'Result 1', link: 'https://example.com' }]
    mockSearchWeb.mockResolvedValue(organicResults)

    const result = await webSearch.execute(
      { query: 'noticias' },
      { context: { userId: 'u1', timeZone: 'America/Mexico_City' } } as any
    )

    expect(mockSearchWeb).toHaveBeenCalledWith('noticias', 'America/Mexico_City')
    expect(result).toEqual(organicResults)
  })

  it('should default to "America/New_York" when context is missing', async () => {
    mockSearchWeb.mockResolvedValue([])

    await webSearch.execute({ query: 'test' })

    expect(mockSearchWeb).toHaveBeenCalledWith('test', 'America/New_York')
  })

  it('should return error message when searchWeb throws', async () => {
    mockSearchWeb.mockRejectedValue(new Error('Network error'))

    const result = await webSearch.execute({ query: 'some query' })
    expect(result).toBe('Hubo un error al buscar la información')
  })
})
