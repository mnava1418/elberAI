import axios from 'axios'
import { searchWeb } from '../../services/search.service'

jest.mock('axios')

jest.mock('../../config/index.config', () => ({
    serper: { searchURL: 'https://google.serper.dev/search', secret: 'test-serper-key' },
}))

describe('searchWeb', () => {
    const mockAxiosRequest = axios.request as jest.Mock

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should return organic results when API responds with them', async () => {
        const organicResults = [{ title: 'Result 1', link: 'https://example.com' }]
        mockAxiosRequest.mockResolvedValue({ data: { organic: organicResults } })

        const result = await searchWeb('¿Qué pasó hoy?', 'America/New_York')
        expect(result).toEqual(organicResults)
    })

    it('should return fallback message when no organic results', async () => {
        mockAxiosRequest.mockResolvedValue({ data: {} })

        const result = await searchWeb('some query', 'America/New_York')
        expect(result).toBe('No tengo la información. Sigo aprendiendo')
    })

    it('should map Mexico City timezone to "mx" country code', async () => {
        mockAxiosRequest.mockResolvedValue({ data: { organic: [] } })

        await searchWeb('noticias', 'America/Mexico_City')

        const callData = JSON.parse(mockAxiosRequest.mock.calls[0][0].data)
        expect(callData.gl).toBe('mx')
    })

    it('should default to "us" for unknown timezones', async () => {
        mockAxiosRequest.mockResolvedValue({ data: { organic: [] } })

        await searchWeb('news', 'Europe/London')

        const callData = JSON.parse(mockAxiosRequest.mock.calls[0][0].data)
        expect(callData.gl).toBe('us')
    })

    it('should append timezone info to query for time-related searches', async () => {
        mockAxiosRequest.mockResolvedValue({ data: { organic: [] } })

        await searchWeb('¿cuándo es el partido?', 'America/Mexico_City')

        const callData = JSON.parse(mockAxiosRequest.mock.calls[0][0].data)
        expect(callData.q).toContain('Mexico City')
    })

    it('should use "es" as the language for all requests', async () => {
        mockAxiosRequest.mockResolvedValue({ data: { organic: [] } })

        await searchWeb('test', 'America/New_York')

        const callData = JSON.parse(mockAxiosRequest.mock.calls[0][0].data)
        expect(callData.hl).toBe('es')
    })

    it('should throw when axios throws', async () => {
        mockAxiosRequest.mockRejectedValue(new Error('Network error'))

        await expect(searchWeb('some query', 'America/New_York')).rejects.toThrow('Network error')
    })
})
