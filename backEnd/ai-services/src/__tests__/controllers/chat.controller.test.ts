import { Request, Response } from 'express'
import * as chatService from '../../services/chat.service'
import { getUserChats, deleteUserChat, deleteAllUserChats } from '../../controllers/chat.controller'

jest.mock('../../services/chat.service')

jest.mock('../../config/index.config', () => ({
  gateway: { secret: 'test' },
  firebase: { cred: '/fake', db: 'https://test.db' },
  openaiCfg: { cred: 'test' },
  postgres: { db: 'postgresql://test' },
  serper: { searchURL: 'https://serper.dev', secret: 'test' },
}))

jest.mock('firebase-admin', () => ({
  __esModule: true,
  default: { auth: jest.fn(), database: jest.fn() },
}))

jest.mock('@openai/agents', () => ({
  __esModule: true,
  OpenAIConversationsSession: jest.fn(() => ({})),
  run: jest.fn(),
  tool: jest.fn((c: any) => c),
}))

const createMockRes = () => {
  const res = {} as Response
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

describe('chat.controller', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getUserChats', () => {
    it('should return 400 when uid is missing', async () => {
      const req = { headers: {} } as unknown as Request
      const res = createMockRes()
      await getUserChats(req, res)
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({ error: 'Missing user uid' })
    })

    it('should return 200 with chats on success', async () => {
      const mockChats = [{ id: 1, messages: [], name: 'Chat 1' }]
      ;(chatService.getUserChats as jest.Mock).mockResolvedValue(mockChats)

      const req = { headers: { 'x-user-uid': 'user1' } } as unknown as Request
      const res = createMockRes()
      await getUserChats(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({ chats: mockChats })
    })

    it('should return 200 with empty chats on error', async () => {
      ;(chatService.getUserChats as jest.Mock).mockRejectedValue(new Error('Firebase error'))

      const req = { headers: { 'x-user-uid': 'user1' } } as unknown as Request
      const res = createMockRes()
      await getUserChats(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({ chats: {} })
    })
  })

  describe('deleteUserChat', () => {
    it('should return 400 when uid is missing', async () => {
      const req = { headers: {}, body: { chatId: '1' } } as unknown as Request
      const res = createMockRes()
      await deleteUserChat(req, res)
      expect(res.status).toHaveBeenCalledWith(400)
    })

    it('should return 400 when chatId is missing', async () => {
      const req = { headers: { 'x-user-uid': 'user1' }, body: {} } as unknown as Request
      const res = createMockRes()
      await deleteUserChat(req, res)
      expect(res.status).toHaveBeenCalledWith(400)
    })

    it('should return 200 on successful deletion', async () => {
      ;(chatService.deleteChat as jest.Mock).mockResolvedValue(undefined)

      const req = {
        headers: { 'x-user-uid': 'user1' },
        body: { chatId: '1' },
      } as unknown as Request
      const res = createMockRes()
      await deleteUserChat(req, res)

      expect(chatService.deleteChat).toHaveBeenCalledWith('user1', '1')
      expect(res.status).toHaveBeenCalledWith(200)
    })

    it('should return 500 on error', async () => {
      ;(chatService.deleteChat as jest.Mock).mockRejectedValue(new Error('DB error'))

      const req = {
        headers: { 'x-user-uid': 'user1' },
        body: { chatId: '1' },
      } as unknown as Request
      const res = createMockRes()
      await deleteUserChat(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
    })
  })

  describe('deleteAllUserChats', () => {
    it('should return 400 when uid is missing', async () => {
      const req = { headers: {} } as unknown as Request
      const res = createMockRes()
      await deleteAllUserChats(req, res)
      expect(res.status).toHaveBeenCalledWith(400)
    })

    it('should return 200 on successful deletion', async () => {
      ;(chatService.deleteAllChats as jest.Mock).mockResolvedValue(undefined)

      const req = { headers: { 'x-user-uid': 'user1' } } as unknown as Request
      const res = createMockRes()
      await deleteAllUserChats(req, res)

      expect(chatService.deleteAllChats).toHaveBeenCalledWith('user1')
      expect(res.status).toHaveBeenCalledWith(200)
    })

    it('should return 500 on error', async () => {
      ;(chatService.deleteAllChats as jest.Mock).mockRejectedValue(new Error('DB error'))

      const req = { headers: { 'x-user-uid': 'user1' } } as unknown as Request
      const res = createMockRes()
      await deleteAllUserChats(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
    })
  })
})
