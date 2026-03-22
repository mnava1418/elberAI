import axios from 'axios'
import { apiGet, apiPost, apiPut, apiDelete } from '../../services/network.service'

jest.mock('axios')

const mockedAxios = axios as jest.Mocked<typeof axios>

describe('network.service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('apiGet', () => {
    it('should return data on successful response', async () => {
      mockedAxios.get.mockResolvedValue({ status: 200, data: { result: 'ok' } })

      const result = await apiGet<{ result: string }>('http://api/test')

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://api/test',
        expect.objectContaining({ headers: expect.objectContaining({ 'Content-Type': 'application/json' }) })
      )
      expect(result).toEqual({ result: 'ok' })
    })

    it('should merge caller config headers with Content-Type', async () => {
      mockedAxios.get.mockResolvedValue({ status: 200, data: {} })

      await apiGet('http://api/test', { headers: { Authorization: 'Bearer token' } })

      const calledConfig = mockedAxios.get.mock.calls[0][1] as any
      expect(calledConfig.headers['Content-Type']).toBe('application/json')
      expect(calledConfig.headers['Authorization']).toBe('Bearer token')
    })

    it('should throw error message from response data when available', async () => {
      mockedAxios.get.mockRejectedValue({ response: { data: { error: 'Not found' } } })

      await expect(apiGet('http://api/test')).rejects.toThrow('Not found')
    })

    it('should throw generic error when no response data', async () => {
      mockedAxios.get.mockRejectedValue({ message: 'Network Error' })

      await expect(apiGet('http://api/test')).rejects.toThrow('Network Error')
    })
  })

  describe('apiPost', () => {
    it('should return data on successful response', async () => {
      mockedAxios.post.mockResolvedValue({ status: 201, data: { id: 1 } })

      const result = await apiPost<{ id: number }>('http://api/test', { name: 'test' })

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://api/test',
        { name: 'test' },
        expect.objectContaining({ headers: expect.objectContaining({ 'Content-Type': 'application/json' }) })
      )
      expect(result).toEqual({ id: 1 })
    })

    it('should throw error from response data on failure', async () => {
      mockedAxios.post.mockRejectedValue({ response: { data: { error: 'Unauthorized' } } })

      await expect(apiPost('http://api/test', {})).rejects.toThrow('Unauthorized')
    })

    it('should throw fallback error when no response details', async () => {
      mockedAxios.post.mockRejectedValue({})

      await expect(apiPost('http://api/test', {})).rejects.toThrow('Error en POST')
    })
  })

  describe('apiPut', () => {
    it('should return data on successful response', async () => {
      mockedAxios.put.mockResolvedValue({ status: 200, data: { updated: true } })

      const result = await apiPut<{ updated: boolean }>('http://api/test', { name: 'updated' })

      expect(result).toEqual({ updated: true })
    })

    it('should throw error from response data on failure', async () => {
      mockedAxios.put.mockRejectedValue({ response: { data: { error: 'Forbidden' } } })

      await expect(apiPut('http://api/test', {})).rejects.toThrow('Forbidden')
    })

    it('should throw fallback error when no details', async () => {
      mockedAxios.put.mockRejectedValue({})

      await expect(apiPut('http://api/test', {})).rejects.toThrow('Error en PUT')
    })
  })

  describe('apiDelete', () => {
    it('should return data on successful response', async () => {
      mockedAxios.delete.mockResolvedValue({ status: 200, data: { message: 'deleted' } })

      const result = await apiDelete<{ message: string }>('http://api/test')

      expect(result).toEqual({ message: 'deleted' })
    })

    it('should throw error from response data on failure', async () => {
      mockedAxios.delete.mockRejectedValue({ response: { data: { error: 'Not found' } } })

      await expect(apiDelete('http://api/test')).rejects.toThrow('Not found')
    })

    it('should throw fallback error when no details', async () => {
      mockedAxios.delete.mockRejectedValue({})

      await expect(apiDelete('http://api/test')).rejects.toThrow('Error en DELETE')
    })
  })
})
