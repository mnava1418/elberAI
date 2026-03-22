import { getChats, deleteChat, deleteAllChats } from '../../services/chat.service'

jest.mock('@react-native-firebase/auth', () => ({
  getAuth: jest.fn(),
  getIdToken: jest.fn(),
}))

jest.mock('../../services/network.service', () => ({
  apiGet: jest.fn(),
  apiDelete: jest.fn(),
}))

import { getAuth, getIdToken } from '@react-native-firebase/auth'
import { apiGet, apiDelete } from '../../services/network.service'

const mockCurrentUser = { uid: 'user-123' }

describe('chat.service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(getAuth as jest.Mock).mockReturnValue({ currentUser: mockCurrentUser })
    ;(getIdToken as jest.Mock).mockResolvedValue('mock-firebase-token')
  })

  describe('getChats', () => {
    it('should return chats as a Map sorted by createdAt descending', async () => {
      const rawChats = [
        {
          id: 1,
          messages: [
            { id: 'm2', createdAt: 200, role: 'assistant', content: 'Hi' },
            { id: 'm1', createdAt: 100, role: 'user', content: 'Hello' },
          ],
        },
        {
          id: 2,
          messages: [{ id: 'm3', createdAt: 300, role: 'user', content: 'Hey' }],
        },
      ]
      ;(apiGet as jest.Mock).mockResolvedValue({ chats: rawChats })

      const result = await getChats()

      expect(apiGet).toHaveBeenCalledWith(
        expect.stringContaining('/ai/chat'),
        expect.objectContaining({ headers: { Authorization: 'Bearer mock-firebase-token' } })
      )
      expect(result).toBeInstanceOf(Map)
      expect(result.size).toBe(2)
      // messages sorted descending by createdAt
      expect(result.get(1)!.messages[0].createdAt).toBe(200)
      expect(result.get(1)!.messages[1].createdAt).toBe(100)
    })

    it('should throw when user is not authenticated', async () => {
      ;(getAuth as jest.Mock).mockReturnValue({ currentUser: null })

      await expect(getChats()).rejects.toThrow('Unable to get chats')
    })

    it('should throw when apiGet fails', async () => {
      ;(apiGet as jest.Mock).mockRejectedValue(new Error('Network error'))

      await expect(getChats()).rejects.toThrow('Unable to get chats')
    })
  })

  describe('deleteChat', () => {
    it('should call apiDelete with correct chatId and auth header', async () => {
      ;(apiDelete as jest.Mock).mockResolvedValue({ message: 'deleted' })

      await deleteChat(42)

      expect(apiDelete).toHaveBeenCalledWith(
        expect.stringContaining('/ai/chat'),
        expect.objectContaining({
          headers: { Authorization: 'Bearer mock-firebase-token' },
          data: { chatId: 42 },
        })
      )
    })

    it('should throw when user is not authenticated', async () => {
      ;(getAuth as jest.Mock).mockReturnValue({ currentUser: null })

      await expect(deleteChat(1)).rejects.toThrow('Unable to delete chat')
    })

    it('should throw when apiDelete fails', async () => {
      ;(apiDelete as jest.Mock).mockRejectedValue(new Error('Server error'))

      await expect(deleteChat(1)).rejects.toThrow('Unable to delete chat')
    })
  })

  describe('deleteAllChats', () => {
    it('should call apiDelete on /ai/chat/all with auth header', async () => {
      ;(apiDelete as jest.Mock).mockResolvedValue({ message: 'all deleted' })

      await deleteAllChats()

      expect(apiDelete).toHaveBeenCalledWith(
        expect.stringContaining('/ai/chat/all'),
        expect.objectContaining({
          headers: { Authorization: 'Bearer mock-firebase-token' },
        })
      )
    })

    it('should throw when user is not authenticated', async () => {
      ;(getAuth as jest.Mock).mockReturnValue({ currentUser: null })

      await expect(deleteAllChats()).rejects.toThrow('Unable to delete all chats')
    })

    it('should throw when apiDelete fails', async () => {
      ;(apiDelete as jest.Mock).mockRejectedValue(new Error('Server error'))

      await expect(deleteAllChats()).rejects.toThrow('Unable to delete all chats')
    })
  })
})
