import admin from 'firebase-admin'
import * as chatService from '../../services/chat.service'
import ShortTermMemory from '../../models/shortTermMemory.model'
import MidTermMemory from '../../models/midTermMemory.model'

jest.mock('firebase-admin', () => ({
  __esModule: true,
  default: { database: jest.fn(), auth: jest.fn() },
}))

jest.mock('../../models/shortTermMemory.model', () => ({
  __esModule: true,
  default: {
    getInstance: jest.fn(),
  },
}))

jest.mock('../../models/midTermMemory.model', () => ({
  __esModule: true,
  default: {
    getInstance: jest.fn(),
  },
}))

jest.mock('../../config/index.config', () => ({
  gateway: { secret: 'test' },
  firebase: { cred: '/fake', db: 'https://test.db' },
  openaiCfg: { cred: 'test' },
  postgres: { db: 'postgresql://test' },
  serper: { searchURL: 'https://serper.dev', secret: 'test' },
}))

jest.mock('@openai/agents', () => ({
  __esModule: true,
  OpenAIConversationsSession: jest.fn(() => ({})),
  run: jest.fn(),
  withTrace: jest.fn(),
  tool: jest.fn((c: any) => c),
}))

describe('chat.service', () => {
  const mockUpdate = jest.fn()
  const mockOnce = jest.fn()
  const mockRemove = jest.fn()
  const mockRef = jest.fn()
  const mockDb = { ref: mockRef }

  const mockDeleteSession = jest.fn()
  const mockDeleteMemory = jest.fn()
  const mockDeleteUserSessions = jest.fn()
  const mockDeleteUserMemory = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(admin.database as unknown as jest.Mock).mockReturnValue(mockDb)
    mockRef.mockReturnValue({ update: mockUpdate, once: mockOnce, remove: mockRemove })
    mockUpdate.mockResolvedValue(undefined)
    mockRemove.mockResolvedValue(undefined)
    ;(ShortTermMemory.getInstance as jest.Mock).mockReturnValue({
      deleteSession: mockDeleteSession,
      deleteUserSessions: mockDeleteUserSessions,
    })
    ;(MidTermMemory.getInstance as jest.Mock).mockReturnValue({
      deleteMemory: mockDeleteMemory,
      deleteUserMemory: mockDeleteUserMemory,
    })
  })

  describe('saveChatMessage', () => {
    it('should save message to Firebase', async () => {
      await chatService.saveChatMessage('user1', 1, 'user', 'Hello!')

      expect(mockRef).toHaveBeenCalledWith(expect.stringContaining('/user1/chats/1/messages/'))
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ content: 'Hello!', role: 'user' })
      )
    })

    it('should throw when Firebase update fails', async () => {
      mockUpdate.mockRejectedValue(new Error('Firebase error'))

      await expect(chatService.saveChatMessage('user1', 1, 'user', 'msg')).rejects.toThrow(
        'Unable to save chat message'
      )
    })
  })

  describe('getUserChats', () => {
    it('should return parsed chats when data exists', async () => {
      const mockData = {
        1: {
          name: 'Chat 1',
          messages: {
            ts1: { id: 'user:ts1', createdAt: 1, content: 'Hello', role: 'user' },
          },
        },
      }
      mockOnce.mockResolvedValue({ val: () => mockData })

      const result = await chatService.getUserChats('user1')

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(1)
      expect(result[0].name).toBe('Chat 1')
      expect(result[0].messages).toHaveLength(1)
    })

    it('should return empty array when no data', async () => {
      mockOnce.mockResolvedValue({ val: () => null })
      const result = await chatService.getUserChats('user1')
      expect(result).toEqual([])
    })

    it('should throw when Firebase fails', async () => {
      mockOnce.mockRejectedValue(new Error('Firebase error'))
      await expect(chatService.getUserChats('user1')).rejects.toThrow('Unable to get user chats')
    })
  })

  describe('updateTitle', () => {
    it('should update title in Firebase', async () => {
      await chatService.updateTitle('user1', 1, 'New Title')

      expect(mockRef).toHaveBeenCalledWith('/user1/chats/1')
      expect(mockUpdate).toHaveBeenCalledWith({ name: 'New Title' })
    })

    it('should throw when Firebase fails', async () => {
      mockUpdate.mockRejectedValue(new Error('Firebase error'))
      await expect(chatService.updateTitle('user1', 1, 'Title')).rejects.toThrow(
        'Unable to update chat name'
      )
    })
  })

  describe('deleteChat', () => {
    it('should clear STM/MTM sessions and remove from Firebase', async () => {
      await chatService.deleteChat('user1', 1)

      expect(mockDeleteSession).toHaveBeenCalledWith('user1_1')
      expect(mockDeleteMemory).toHaveBeenCalledWith('user1_1')
      expect(mockRef).toHaveBeenCalledWith('/user1/chats/1')
      expect(mockRemove).toHaveBeenCalled()
    })

    it('should throw when Firebase fails', async () => {
      mockRemove.mockRejectedValue(new Error('Firebase error'))
      await expect(chatService.deleteChat('user1', 1)).rejects.toThrow('Unable to delete chat')
    })
  })

  describe('deleteAllChats', () => {
    it('should clear all user sessions and remove from Firebase', async () => {
      await chatService.deleteAllChats('user1')

      expect(mockDeleteUserSessions).toHaveBeenCalledWith('user1')
      expect(mockDeleteUserMemory).toHaveBeenCalledWith('user1')
      expect(mockRef).toHaveBeenCalledWith('/user1/chats')
      expect(mockRemove).toHaveBeenCalled()
    })

    it('should throw when Firebase fails', async () => {
      mockRemove.mockRejectedValue(new Error('Firebase error'))
      await expect(chatService.deleteAllChats('user1')).rejects.toThrow('Unable to delete chat')
    })
  })

  describe('getChatSummary', () => {
    it('should return summary when data has summary field', async () => {
      mockOnce.mockResolvedValue({ val: () => ({ summary: 'This is a summary' }) })
      const result = await chatService.getChatSummary('user1', 1)
      expect(result).toBe('This is a summary')
    })

    it('should return empty string when no data', async () => {
      mockOnce.mockResolvedValue({ val: () => null })
      const result = await chatService.getChatSummary('user1', 1)
      expect(result).toBe('')
    })

    it('should return empty string when data has no summary', async () => {
      mockOnce.mockResolvedValue({ val: () => ({ messages: {} }) })
      const result = await chatService.getChatSummary('user1', 1)
      expect(result).toBe('')
    })

    it('should throw when Firebase fails', async () => {
      mockOnce.mockRejectedValue(new Error('Firebase error'))
      await expect(chatService.getChatSummary('user1', 1)).rejects.toThrow(
        'Unable to get chat summary'
      )
    })
  })

  describe('updateChatSummary', () => {
    it('should update summary in Firebase', async () => {
      await chatService.updateChatSummary('user1', 1, 'new summary')

      expect(mockRef).toHaveBeenCalledWith('/user1/chats/1')
      expect(mockUpdate).toHaveBeenCalledWith({ summary: 'new summary' })
    })

    it('should throw when Firebase fails', async () => {
      mockUpdate.mockRejectedValue(new Error('Firebase error'))
      await expect(chatService.updateChatSummary('user1', 1, 'summary')).rejects.toThrow(
        'Unable to update chat summary'
      )
    })
  })
})
