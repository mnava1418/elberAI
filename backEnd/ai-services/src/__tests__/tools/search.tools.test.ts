import axios from 'axios'
import { webSearch as webSearchTool } from '../../tools/search.tools'

// The mock makes `tool()` return the config object directly, which has `execute`.
// Cast to any since FunctionTool's TS types don't expose execute publicly.
const webSearch = webSearchTool as any

jest.mock('axios')

jest.mock('@openai/agents', () => ({
  __esModule: true,
  tool: jest.fn((config: any) => config),
  run: jest.fn(),
}))

jest.mock('../../config/index.config', () => ({
  serper: { searchURL: 'https://google.serper.dev/search', secret: 'test-serper-key' },
}))

describe('webSearch tool', () => {
  const mockAxiosRequest = axios.request as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return organic results when API responds with them', async () => {
    const organicResults = [{ title: 'Result 1', link: 'https://example.com' }]
    mockAxiosRequest.mockResolvedValue({ data: { organic: organicResults } })

    const result = await webSearch.execute({ query: '¿Qué pasó hoy?' })
    expect(result).toEqual(organicResults)
  })

  it('should return fallback message when no organic results', async () => {
    mockAxiosRequest.mockResolvedValue({ data: {} })

    const result = await webSearch.execute({ query: 'some query' })
    expect(result).toBe('No tengo la información. Sigo aprendiendo')
  })

  it('should return error message when axios throws', async () => {
    mockAxiosRequest.mockRejectedValue(new Error('Network error'))

    const result = await webSearch.execute({ query: 'some query' })
    expect(result).toBe('Hubo un error al buscar la información')
  })

  it('should map Mexico City timezone to "mx" country code', async () => {
    mockAxiosRequest.mockResolvedValue({ data: { organic: [] } })

    await webSearch.execute(
      { query: 'noticias' },
      { context: { userId: 'u1', timeZone: 'America/Mexico_City' } } as any
    )

    const callData = JSON.parse(mockAxiosRequest.mock.calls[0][0].data)
    expect(callData.gl).toBe('mx')
  })

  it('should default to "us" for unknown timezones', async () => {
    mockAxiosRequest.mockResolvedValue({ data: { organic: [] } })

    await webSearch.execute(
      { query: 'news' },
      { context: { userId: 'u1', timeZone: 'Europe/London' } } as any
    )

    const callData = JSON.parse(mockAxiosRequest.mock.calls[0][0].data)
    expect(callData.gl).toBe('us')
  })

  it('should append timezone info to query for time-related searches', async () => {
    mockAxiosRequest.mockResolvedValue({ data: { organic: [] } })

    await webSearch.execute(
      { query: '¿cuándo es el partido?' },
      { context: { userId: 'u1', timeZone: 'America/Mexico_City' } } as any
    )

    const callData = JSON.parse(mockAxiosRequest.mock.calls[0][0].data)
    expect(callData.q).toContain('Mexico City')
  })

  it('should use "es" as the language for all requests', async () => {
    mockAxiosRequest.mockResolvedValue({ data: { organic: [] } })
    await webSearch.execute({ query: 'test' })

    const callData = JSON.parse(mockAxiosRequest.mock.calls[0][0].data)
    expect(callData.hl).toBe('es')
  })
})
